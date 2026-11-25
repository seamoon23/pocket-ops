"""Exercise the built website with desktop Chrome and Galaxy-sized touch viewports."""
import fnmatch
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright
from field_steps import verify_steps

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build_site import build_site, ROOT, SITE, SRC

files = build_site()
catalog = json.loads((SRC / 'data.js').read_text('utf-8').split(' = ', 1)[1].strip().rstrip(';'))
guides = json.loads((SITE / 'guides.json').read_text('utf-8'))


class Site(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        name = path.lstrip('/') + ('index.html' if path.endswith('/') else '')
        body = files.get(name)
        if body is None or name.startswith('_'):
            self.send_error(404)
            return
        self.send_response(200)
        mime = {'html':'text/html', 'css':'text/css', 'js':'application/javascript'}[name.rsplit('.', 1)[1]]
        self.send_header('Content-Type', mime + '; charset=utf-8')
        match = False
        for line in files['_headers'].splitlines():
            if line.startswith('/'):
                match = fnmatch.fnmatchcase(path, line)
            elif match and line.strip():
                key, value = line.strip().split(': ', 1)
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body.encode())

    def log_message(self, *_):
        pass


def verify(browser, origin, width, height, mobile):
    ctx = browser.new_context(viewport={'width':width,'height':height}, is_mobile=mobile,
                              has_touch=mobile, permissions=['clipboard-read','clipboard-write'])
    page = ctx.new_page()
    errors, external = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda req: external.append(req.url) if
            urlsplit(req.url).scheme in ('http','https') and not req.url.startswith(origin + '/') else None)
    def fits():
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), page.url
    response = page.goto(origin)
    assert 'no-transform' in response.headers['cache-control']
    expect(page.locator('script[src]')).to_have_count(0)
    expect(page.locator('#tools .row')).to_have_count(len(catalog['tools']))
    fits()
    page.screenshot(path=str(ROOT / '.test-artifacts' / f'web-home-{width}.png'))
    for t in catalog['tools']:
        path = '/tools/' + t['id'] + '/'
        assert page.goto(origin + path).ok
        expect(page.locator('#view > section')).to_have_attribute('data-page',t['id'])
        fits()
    page.goto(origin + '/tools/commands/')
    expect(page.locator('.command-card .command-basis')).to_have_count(len(catalog['commands']))
    page.locator('[data-command-domain="git"]').click()
    expect(page.locator('.command-card')).to_have_count(15)
    page.locator('[data-command="cmd-171"]').click()
    expect(page.locator('#modal .command-basis')).to_contain_text('main:refs/heads/main')
    expect(page.locator('#copy-command')).to_be_disabled()
    page.locator('#command-ack').check()
    page.locator('#copy-command').click()
    page.wait_for_function("async () => await navigator.clipboard.readText() === 'git push origin main:refs/heads/main'")
    fits()
    page.goto(origin + '/tools/logs/')
    expected_lines = ['java.sql.SQLException: connection timeout','10:20:03 GET /orders 503 850ms',
                      '11:01:02 REQ-1042 WARN retry=1','12:00:03 INFO retry scheduled','01:30:01 WARN input missing']
    for i, expected_line in enumerate(expected_lines):
        page.locator('#logs-scenario').select_option(str(i))
        if i:
            page.once('dialog',lambda d:d.accept())
        page.locator('#logs-sample').click()
        result = page.locator('#logs-output').input_value()
        assert expected_line in result.splitlines(), (i,result)
        if i == 1:
            assert '/health' not in result
    page.locator('#logs-input').fill('preserve my draft')
    expect(page.locator('#logs-output')).to_have_value('')
    page.once('dialog',lambda d:d.dismiss())
    page.locator('#logs-sample').click()
    expect(page.locator('#logs-input')).to_have_value('preserve my draft')
    fits()
    for a in guides:
        page.goto(origin + '/guides/')
        page.get_by_role('link',name=a['title'],exact=False).click()
        fits()
        if 'steps' in a:
            verify_steps(page, a, page.locator('article'), {c['id']: c for c in catalog['commands']}, web=True)
            continue
        if a['tool'] == 'commands':
            article_url = page.url
            for command_id in a['commands']:
                c = next(c for c in catalog['commands'] if c['id'] == command_id)
                page.get_by_role('link', name=c['title']+' 열기', exact=True).click()
                expect(page.locator('#modal h2')).to_have_text(c['title'])
                expect(page.locator('#modal')).to_contain_text(c['where'])
                expected = c['command'].replace('{{SERVICE}}', "'sshd.service'")
                expect(page.locator('#command-preview')).to_have_value(expected)
                page.locator('#copy-command').click()
                page.wait_for_function("async text => (await navigator.clipboard.readText()).replaceAll('\\r','')===text",arg=expected)
                fits()
                page.go_back()
                assert page.url == article_url
            continue
        page.locator('article a.btn').click()
        key = a['tool']
        example = catalog['guides'][key]['example']
        expect(page.locator('#' + example['result'])).to_have_value(example['output'])
        assert page.url == origin + f'/tools/{key}/'
    page.goto(origin + '/tools/sqlformat/')
    def nav(key):
        if mobile:
            page.locator('#mobile-menu').click()
        page.locator(f'#nav [data-go="{key}"]').click()
    for db in catalog['dbs']:
        page.locator(f'[data-sql-db="{db}"]').click()
        page.locator('#sqlformat-input').fill(f"UPDATE qa_{db} SET mark = '검수' WHERE id = 7;")
        page.evaluate("navigator.clipboard.writeText('pending')")
        page.locator('[data-copy-id="sqlformat-output"]').click()
        expected = f"UPDATE qa_{db}\nSET mark = '검수'\nWHERE id = 7;"
        expect(page.locator('#sql-review-preview')).to_have_value(expected)
        assert page.evaluate('navigator.clipboard.readText()') == 'pending'
        fits()
        page.locator('#sql-review-confirm').click()
        page.wait_for_function("async text => (await navigator.clipboard.readText()).replaceAll('\\r','')===text",arg=expected)
    page.screenshot(path=str(ROOT / '.test-artifacts' / f'web-sql-{width}.png'))
    nav('json')
    assert page.url == origin + '/tools/json/'
    page.go_back()
    assert 'WHERE id = 7;' in page.locator('#sqlformat-input').input_value()
    page.go_forward()
    page.reload()
    expect(page.locator('#view > section')).to_have_attribute('data-page','json')
    assert not errors and not external, (errors, external)
    ctx.close()
    print(f'{width}x{height}: {len(catalog["tools"])} routes, {len(guides)} guides, clipboard and layout passed', flush=True)


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1',0), Site)
    Thread(target=server.serve_forever,daemon=True).start()
    try:
        origin = sys.argv[1].rstrip('/') if len(sys.argv)>1 else f'http://127.0.0.1:{server.server_port}'
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH') or None)
            for width,height in [(1440,900),(360,800),(412,915)]:
                verify(browser,origin,width,height,width<600)
            browser.close()
    finally:
        server.shutdown()
