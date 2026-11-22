"""Open the standalone and extracted release with the network disabled."""
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZipFile

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
articles = json.loads((ROOT / 'download-site/guides.json').read_text('utf-8'))
data = json.loads((ROOT / 'src/data.js').read_text('utf-8').split(' = ', 1)[1].strip().rstrip(';'))
commands = {c['id']: c for c in data['commands']}
release = ROOT / f'pocket-ops-v{data["version"]}.zip'


def verify(browser, html, width, height):
    mobile = width < 600
    ctx = browser.new_context(offline=True, viewport={'width':width, 'height':height},
                              has_touch=mobile, is_mobile=mobile, permissions=['clipboard-read','clipboard-write'])
    page = ctx.new_page()
    problems = []
    page.on('pageerror', lambda exc: problems.append(str(exc)))
    page.on('request', lambda req: problems.append(req.url) if req.url.startswith(('http:', 'https:')) else None)
    page.goto(html.as_uri())
    library = page.locator('#field-guides')
    def show_library():
        if mobile:
            page.locator('#mobile-menu').click()
        page.locator('[data-open-field-guides]').click()
        expect(library.locator('details')).to_have_count(len(articles))
    def copied(text):
        page.wait_for_function("async s => (await navigator.clipboard.readText()).replaceAll('\\r','') === s", arg=text)
    show_library()
    for article in articles:
        if not library.is_visible():
            show_library()
        entry = library.locator(f'[data-field-article="{article["slug"]}"]')
        entry.locator('summary').click()
        expect(entry).to_contain_text(article['intro'])
        for heading, paragraph in article['sections']:
            expect(entry.get_by_text(heading, exact=True)).to_be_visible()
            expect(entry.get_by_text(paragraph, exact=True)).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        tool = article['tool']
        if tool == 'commands':
            for key in article['commands']:
                command = commands[key]
                entry.locator(f'[data-field-command="{key}"]').click()
                expect(page.locator('#modal h2')).to_have_text(command['title'])
                expect(page.locator('#modal')).to_contain_text(command['where'])
                expected = command['command'].replace('{{SERVICE}}', "'sshd.service'")
                expect(page.locator('#command-preview')).to_have_value(expected)
                page.locator('#copy-command').click()
                copied(expected)
                page.locator('#modal [data-close]').click()
                expect(entry.locator('p').first).to_be_visible()
        else:
            entry.locator('[data-field-example]').click()
            example = data['guides'][tool]['example']
            expect(page.locator('#' + example['result'])).to_have_value(example['output'])
            if tool == 'sqlformat':
                page.locator('[data-sql-db="oracle"]').click()
                page.locator('#sqlformat-input').fill('select 15 from dual;')
                show_library()
                entry.locator('summary').click()
                entry.locator('[data-field-example]').click()
                expect(page.locator('#guide-overwrite')).to_be_visible()
                page.locator('#guide-try').click()
                expect(page.locator('[data-sql-db="cubrid"]')).to_have_attribute('aria-pressed','true')
                page.locator('[data-copy-id="sqlformat-output"]').click()
                expect(page.locator('#sql-review-preview')).to_have_value(example['output'])
                page.locator('#sql-review-confirm').click()
                copied(example['output'])
    with page.expect_download() as saved:
        page.locator('#release-download').click()
    assert Path(saved.value.path()).read_bytes() == release.read_bytes()
    assert not problems, problems
    ctx.close()
    print(f'{width}x{height}: all {len(articles)} articles, command copies, examples and regenerated ZIP passed', flush=True)


if __name__ == '__main__':
    with TemporaryDirectory() as folder, sync_playwright() as p:
        single = ROOT / 'pocket-ops.html'
        with ZipFile(release) as archive:
            extracted = Path(archive.extract('pocket-ops.html',folder))
        assert extracted.read_bytes() == single.read_bytes()
        browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH') or None)
        for path,w,h in [(single,1440,900),(extracted,360,800),(extracted,412,915)]:
            verify(browser,path,w,h)
        reader = browser.new_context(java_script_enabled=False, offline=True,
                                     viewport={'width':360,'height':800},is_mobile=True,has_touch=True).new_page()
        reader.goto(extracted.as_uri())
        library = reader.locator('#field-reference')
        library.locator(':scope > summary').click()
        expect(library.locator('details')).to_have_count(len(articles))
        for article in articles:
            entry = library.locator(f'[data-field-article="{article["slug"]}"]')
            entry.locator('summary').click()
            expect(entry.get_by_text(article['intro'],exact=True)).to_be_visible()
            for key in article.get('commands',[]):
                entry.locator(f'[data-field-command="{key}"]').click()
                expect(reader.locator('#reference-'+key+' pre')).to_have_text(commands[key]['command'])
                assert reader.url.endswith('#reference-'+key)
        browser.close()
        print('Script-disabled mobile reader: articles and command reference links passed')
