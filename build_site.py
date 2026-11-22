"""Build the public Pages upload. The offline release is built separately by build.py."""
from hashlib import sha256
from html import escape
from string import Template
from zipfile import ZipFile, ZIP_DEFLATED
import base64
import json
import re

from build import ROOT, SRC, platform_app

SITE = ROOT / 'download-site'
BUNDLE = ROOT / '.test-artifacts' / 'pocket-ops-web-site.zip'
PUBLIC = 'https://ops.jjunybox.com'
# Only catalog examples can populate fields. No user content travels in a URL.
WEB = {
    'listen': """
const webRoute=()=>location.pathname.split('/')[2]||'home';
window.addEventListener('popstate',()=>go(webRoute(),false));
""",
    'start': """
go(webRoute(),false);
if(location.search==='?example' && D.guides[current]?.example?.fill){
 history.replaceState(null,'',location.pathname);
 runGuideExample(current);
}
""",
    'navigate': """
const path='/tools/'+id+'/';
if(updateHash && location.pathname!==path)history.pushState(null,'',path);
document.querySelector('link[rel=canonical]').href=location.origin+path;
document.querySelector('meta[name=description]').content=D.guides[id].when;
""",
    'download': "// The web shell has a native link to the latest release.",
}


def row(url, title, desc):
    return (f'<a class="row" href="{escape(url)}"><strong>{escape(title)}</strong>'
            f'<small>{escape(desc)}</small><span aria-hidden="true">↗</span></a>')


def build_site():
    data = (SRC / 'data.js').read_text('utf-8')
    catalog = json.loads(data.split(' = ', 1)[1].strip().rstrip(';'))
    tools = {t['id']: t for t in catalog['tools']}
    guides = json.loads((SITE / 'guides.json').read_text('utf-8'))
    files = {}

    def asset(name, source):
        digest = sha256(source.encode()).hexdigest()[:16]
        stem, ext = name.rsplit('.', 1)
        key = f'assets/{stem}.{digest}.{ext}'
        files[key] = source
        return '/' + key

    css = asset('site.css', (SITE / 'site.css').read_text('utf-8'))
    template = Template((SITE / 'page.html').read_text('utf-8'))

    def page(path, title, desc, content):
        files[path.lstrip('/') + 'index.html'] = template.substitute(
            title=escape(title), description=escape(desc), path=path, css=css, content=content)

    groups = []
    for group in dict.fromkeys(t['group'] for t in tools.values()):
        links = ''.join(row('/tools/' + t['id'] + '/', t['title'], t['desc'])
                        for t in tools.values() if t['group'] == group)
        groups.append(f'<div class="group"><h3>{escape(group)}</h3><div class="rows">{links}</div></div>')

    articles = ''.join(row('/guides/' + a['slug'] + '/', a['title'], a['topic']) for a in guides)
    downloads = """<section id="downloads" class="downloads"><h2>폐쇄망용 다운로드</h2>
<p>갤럭시에 미리 보관하려면 단일 HTML을 받으세요. 망간전송용 ZIP에는 같은 HTML과 사용 안내가 들어 있습니다.</p>
<div class="actions"><a class="btn" href="/pocket-ops.html">HTML 받기 ↓</a><a class="btn" href="/pocket-ops.zip">ZIP 받기 ↓</a>
<a href="/SHA256SUMS.txt">SHA-256 확인</a></div></section>"""
    page('/', '운영 도구 모음', '서버 운영, SQL, 로그, 데이터 정리를 위한 브라우저 도구와 오프라인 파일.',
         """<div class="lead"><div class="wrap"><h1>서버 운영 공구함</h1>
<p>명령어를 찾고, SQL을 검토하고, 로그를 정리하세요. 입력한 내용은 이 브라우저에서 처리합니다.</p>
<div class="actions"><a class="btn" href="/tools/commands/">명령어 포켓 열기</a>
<a class="btn alt" href="/tools/sqlformat/">SQL 작업대 열기</a></div></div></div>
<main class="wrap" id="main"><section id="tools"><h2>도구 바로 열기</h2><div class="groups">""" +
         ''.join(groups) + '</div></section><section><h2>실무 가이드</h2><div class="guides">' +
         articles + '</div></section>' + downloads + '</main>')
    page('/guides/', '실무 가이드', '샘플 데이터로 따라 하는 SQL, 로그, JSON 작업 절차.',
         '<main class="wrap" id="main"><article class="paper"><h1>실무 가이드</h1>'
         '<p>예제와 예상 결과를 읽고 같은 데이터를 도구에서 직접 확인하세요.</p>' + articles + '</article></main>')
    for a in guides:
        tool = a['tool']
        example = catalog['guides'][tool]['example']
        sections = ''.join(f'<h2>{escape(h)}</h2><p>{escape(p)}</p>' for h, p in a['sections'])
        content = (f'<main class="wrap" id="main"><article class="paper"><a href="/guides/">← 실무 가이드</a>'
                   f'<p class="kicker">{escape(a["topic"])}</p><h1>{escape(a["title"])}</h1>'
                   f'<p>{escape(a["intro"])}</p>{sections}<h2>연습용 입력</h2><pre>{escape(example["input"])}</pre>'
                   f'<h2>예상 결과</h2><pre>{escape(example["output"])}</pre>'
                   f'<a class="btn" href="/tools/{tool}/?example">{escape(tools[tool]["title"])}에서 예제로 열기</a>'
                   '</article><!-- Approved editorial placements belong outside the article. --></main>')
        page('/guides/' + a['slug'] + '/', a['title'], a['intro'], content)

    script = '\n'.join([data, (SRC / 'core.js').read_text('utf-8'), platform_app(WEB)])
    js = asset('app.js', script)
    integrity = 'sha256-' + base64.b64encode(sha256(script.encode()).digest()).decode()
    app_css = asset('app.css', (SRC / 'styles.css').read_text('utf-8') + """
html.app-ready #script-fallback,html:not(.app-ready) .layout{display:none}
#script-fallback{max-width:60ch;margin:2rem auto;padding:1rem}
.web-links{display:flex;gap:12px;padding:4px 12px}.web-links a{color:var(--accent);padding:10px 0}
""")
    shell = (SRC / 'shell.html').read_text('utf-8')
    shell = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]+>', '', shell)
    shell = shell.replace('<style>\n__STYLES__\n</style>', f'<link rel="stylesheet" href="{app_css}">')
    shell = shell.replace('<script>\n__SCRIPT__\n</script>',
                          f'<script defer src="{js}" integrity="{integrity}"></script>')
    shell = re.sub(r'<button [^>]*id="release-download".*?</button>',
                   '<a class="btn small release-button" href="/pocket-ops.zip">ZIP 받기</a>', shell)
    shell = shell.replace('<div class="sidebar-bottom">', '<div class="sidebar-bottom"><nav class="web-links" '
                          'aria-label="사이트 메뉴"><a href="/">전체 도구</a><a href="/guides/">실무 가이드</a></nav>')
    for key, guide in catalog['guides'].items():
        title = tools[key]['title'] if key in tools else {'home':'내 작업실','favorites':'즐겨찾기','settings':'내 포켓 관리'}[key]
        path = '/tools/' + key + '/'
        document = re.sub(r'<title>.*?</title>', f'<title>{escape(title)} · Pocket Ops</title>'
                          f'<link rel="canonical" href="{PUBLIC}{path}">', shell)
        document = re.sub(r'<meta name="description"[^>]+>', lambda _: f'<meta name="description" content="{escape(guide["when"])}">', document)
        files[path.strip('/') + '/index.html'] = document.replace('__READ_ONLY_REFERENCE__',
            f'<h1>{escape(title)}</h1><p>{escape(guide["when"])}</p><p>도구를 시작하려면 JavaScript가 필요합니다.</p>'
            '<a href="/">전체 도구와 오프라인 다운로드</a>')
    files['404.html'] = template.substitute(title='페이지를 찾을 수 없습니다', description='', path='/',
        css=css, content='<main class="wrap" id="main"><h1>페이지를 찾을 수 없습니다</h1><a href="/">전체 도구로 돌아가기</a></main>')
    files['_headers'] = (SITE / '_headers').read_text('utf-8').replace('__INTEGRITY__', integrity)
    files['_worker.js'] = (SITE / '_worker.js').read_text('utf-8')
    BUNDLE.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(BUNDLE, 'w', compression=ZIP_DEFLATED) as archive:
        for name, contents in files.items():
            archive.writestr(name, contents.encode())
    return files


if __name__ == '__main__':
    files = build_site()
    print(f'{len(files)} files -> {BUNDLE}')
