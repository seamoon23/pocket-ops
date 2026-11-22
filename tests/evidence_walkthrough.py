"""Pocket Ops usage evidence walkthrough (development machine only).

Opens the built pocket-ops.html as a local file (file://) in real Chromium, uses every menu through its
visible controls with fake sample data, takes screenshots and records the values each step produced.
Independent oracles (Python hashlib/datetime/zipfile/codecs) check results where one exists.

  CHROMIUM_PATH=<approved chrome.exe> python tests/evidence_walkthrough.py [--os-clipboard]

--os-clipboard additionally opens a visible Chromium window for a few seconds to check that copy buttons
reach the Windows clipboard (Get-Clipboard). The current clipboard text is restored afterwards; the step
is skipped when the clipboard holds anything other than text.

Writes evidence/v<version>/: shots/*.jpg, downloads/, evidence.json, index.html, README.md.
Never contacts a server, never runs catalog commands, never changes browser policy.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, datetime as dt, hashlib, html, io, json, os, platform, re, subprocess, sys, time, urllib.parse, zipfile

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / 'pocket-ops.html'
URL = HTML_PATH.resolve().as_uri()
VERSION = json.loads((ROOT / 'src/data.js').read_text(encoding='utf-8').split(' = ', 1)[1].rstrip().rstrip(';'))['version']
OUT = ROOT / 'evidence' / ('v' + VERSION)
SHOTS, DOWNLOADS = OUT / 'shots', OUT / 'downloads'
for d in (SHOTS, DOWNLOADS):
    d.mkdir(parents=True, exist_ok=True)
    for old in d.iterdir():
        old.unlink()
MARK = {'sql': 'EVID-SQL-5Z8', 'log': 'EVID-LOG-5Z8', 'cmd': 'EVID-CMD-5Z8', 'json': 'EVID-JSON-5Z8'}
# What the walkthrough found that the automated suites with test doubles did not show.
FINDINGS = [
    {'title': '복사 완료 알림이 열린 창의 흐린 배경 뒤에 가려짐', 'status': '수정함',
     'detail': '명령 창 · SQL 확인 창 · 가져오기 창에서 복사하면 "클립보드에 복사했어요." 알림이 대화상자 배경(블러) 아래에 그려져 읽을 수 없었습니다. '
               '알림을 최상위 레이어(manual popover)로 띄우도록 바꿨고, 브라우저 회귀 테스트를 추가했습니다. 수정 후 화면은 2번 시나리오의 명령 창 스크린샷입니다.',
     'before': 'findings/toast-under-dialog-before.jpg'},
    {'title': 'Windows 클립보드는 줄바꿈을 CRLF로 보관', 'status': '기록(앱 문제 아님)',
     'detail': '앱은 확인 창과 같은 LF 텍스트를 넘기지만 Windows의 Chromium 클립보드는 여러 줄 텍스트를 CRLF로 저장합니다. 글자 단위 비교는 줄바꿈 정규화 후 일치했고, '
               '저장 파일(pocket-query.sql)은 LF 그대로입니다. SSH 터미널은 붙여넣을 때 줄바꿈을 변환하므로 csql> · SQL> 입력에는 영향이 없지만 바이트 비교 시 참고하세요.'},
    {'title': 'file://에서도 CSP가 문자열 평가(eval)를 차단', 'status': '확인(보안 통제 작동)',
     'detail': '테스트 도구가 문자열식 대기 조건을 쓰자 페이지의 Content-Security-Policy가 unsafe-eval 없음으로 차단했습니다. 로컬 파일로 열어도 스크립트 해시 CSP가 적용됨을 보여 줍니다.'},
]
CASES, DIALOGS, REQUESTS, ERRORS = [], [], [], []
cur = None
shot_no = 0

def short(value, n=600):
    s = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    return s if len(s) <= n else s[:n] + f'… ({len(s):,}자)'

def case(menu, title, expected, device='PC 1366×900'):
    global cur
    cur = {'no': len(CASES) + 1, 'menu': menu, 'title': title, 'expected': expected, 'device': device, 'steps': [], 'checks': [], 'shots': []}
    CASES.append(cur)

def step(text):
    cur['steps'].append(text)

def check(name, actual, expected=None, ok=None):
    passed = (actual == expected) if ok is None else bool(ok)
    cur['checks'].append({'name': name, 'actual': short(actual), 'expected': '' if expected is None else short(expected), 'pass': passed})
    print(('PASS ' if passed else 'FAIL ') + cur['menu'] + ' · ' + name, flush=True)
    return passed

def shot(page, slug, caption, target=None, full=False):
    global shot_no
    shot_no += 1
    name = f'{shot_no:03d}-{slug}.jpg'
    if target is not None:
        page.evaluate("s => document.querySelector(s)?.scrollIntoView({block: 'center'})", target)
    page.wait_for_timeout(120)
    page.screenshot(path=str(SHOTS / name), type='jpeg', quality=82, full_page=full)
    cur['shots'].append({'file': 'shots/' + name, 'caption': caption})

def run(fn):
    try:
        fn()
    except Exception as e:  # keep walking the remaining menus and record the failure
        check('예외 없이 완료', type(e).__name__ + ': ' + str(e)[:400], ok=False)

def save_download(page, selector, name=None):
    with page.expect_download() as d:
        page.locator(selector).click()
    dl = d.value
    data = Path(dl.path()).read_bytes()
    target = DOWNLOADS / (name or dl.suggested_filename)
    target.write_bytes(data)
    return dl.suggested_filename, data

def os_clipboard_raw():
    # Bytes mode keeps CRLF exactly as Windows holds it; no BOM and no added trailing newline.
    r = subprocess.run(['powershell', '-NoProfile', '-Command',
                        '[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); $t=Get-Clipboard -Raw; if($null -ne $t){[Console]::Out.Write($t)}'],
                       capture_output=True)
    return r.stdout.decode('utf-8').lstrip('﻿')

def os_clipboard_text():
    return os_clipboard_raw().replace('\r\n', '\n')

def set_os_clipboard(text):
    subprocess.run(['powershell', '-NoProfile', '-Command', 'Set-Clipboard -Value $env:POCKET_OPS_CLIP_RESTORE'],
                   env=dict(os.environ, POCKET_OPS_CLIP_RESTORE=text), capture_output=True)

def nav(page, route):
    if page.locator('#modal[open]').count():
        page.locator('#modal [data-close]').click()
    if page.locator('#palette[open]').count():
        page.keyboard.press('Escape')
    menu = page.locator('#mobile-menu')
    if menu.is_visible() and menu.get_attribute('aria-expanded') != 'true':
        menu.click()
    page.locator(f'#sidebar [data-go="{route}"]').first.click()
    page.wait_for_timeout(80)

def value(page, element_id):
    return page.evaluate("id=>{const el=document.getElementById(id);return el.value!==undefined?el.value:el.textContent}", element_id)

def clipboard_raw(page):
    page.wait_for_timeout(250)
    return page.evaluate('navigator.clipboard.readText()')

def clipboard(page):
    # Chromium on Windows stores clipboard text with CRLF line breaks; the app hands it LF text.
    return clipboard_raw(page).replace('\r\n', '\n')

def guide(page, route, name):
    """Open the screen's 사용 예시, capture it, run the example and check the promised result."""
    g = page.evaluate('id=>PocketData.guides[id]', route)
    btn = page.locator('#view > section > .page-title:first-child [data-guide]')
    box = btn.bounding_box()
    check('사용 예시 링크가 화면 위쪽 제목 줄에 있음', f"y={box['y']:.0f}px", ok=box['y'] + box['height'] <= page.viewport_size['height'] / 2)
    btn.click()
    step('제목 줄 → 사용 예시')
    check('가이드 창 제목', page.locator('#modal .dialog-head h2').inner_text(), '사용 예시 · ' + name)
    shot(page, route + '-guide', name + ' 사용 예시 창')
    ex = g.get('example')
    if not ex or not ('fill' in ex or 'click' in ex):
        page.locator('#modal [data-close]').click()
        return g
    page.locator('#guide-try').click()
    step('사용 예시 → ' + (ex.get('label') or '이 예시로 해보기'))
    if ex.get('result'):
        want = ex.get('expect', ex['output'])
        try:
            page.wait_for_function("([id,want])=>{const el=document.getElementById(id);const v=el.value!==undefined?el.value:el.textContent;return v===want}", arg=[ex['result'], want], timeout=5000)
        except Exception:
            pass
        check('예시 결과가 가이드의 결과 예와 같음', value(page, ex['result']), want)
        shot(page, route + '-example', '이 예시로 해보기 결과', target='#' + ex['result'])
    return g

def main(argv):
    os_clip = '--os-clipboard' in argv
    file_sha = hashlib.sha256(HTML_PATH.read_bytes()).hexdigest()
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True)
        ctx = browser.new_context(viewport={'width': 1366, 'height': 900}, locale='ko-KR', timezone_id='Asia/Seoul', accept_downloads=True)
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        ctx.on('request', lambda r: REQUESTS.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:')) else None)
        page = ctx.new_page()
        page.set_default_timeout(6000)
        page.on('pageerror', lambda e: ERRORS.append(str(e)))
        page.on('dialog', lambda d: (DIALOGS.append(d.message), d.accept()))
        env = {'browser': 'Chromium ' + browser.version, 'os': platform.platform(), 'python': platform.python_version(),
               'html': 'pocket-ops.html', 'html_bytes': HTML_PATH.stat().st_size, 'html_sha256': file_sha, 'url': 'file:///…/pocket-ops.html',
               'started': dt.datetime.now().astimezone().isoformat(timespec='seconds'), 'version': VERSION}

        def open_file():
            case('파일 열기', '탐색기에서 연 것처럼 pocket-ops.html을 file://로 열기', '설치·서버 없이 대시보드가 열리고 외부 요청이 없다')
            page.goto(URL)
            page.wait_for_selector('html.app-ready')
            step('file:// 주소로 pocket-ops.html 열기')
            check('앱 시작 완료(html.app-ready)', page.evaluate("document.documentElement.classList.contains('app-ready')"), True)
            check('실행 방식', page.evaluate('location.protocol'), 'file:')
            check('읽기 전용 대체 화면은 숨김', page.locator('#script-fallback').is_visible(), False)
            check('보안 컨텍스트와 Web Crypto·Worker 사용 가능', page.evaluate('[isSecureContext,!!crypto.subtle,!!window.Worker].join(",")'), 'true,true,true')
            shot(page, 'home-open', '파일을 연 직후의 첫 화면(내 작업실)')
        run(open_file)

        def home():
            case('내 작업실', '검색 → 명령 값 입력 → 복사, 환경 카드와 DB 카드로 이동', '검색 결과에서 연 명령에 입력한 값이 그대로 복사되고, 카드가 해당 환경·DB로 연다')
            nav(page, 'home')
            guide(page, 'home', '내 작업실')
            check('예시 실행으로 검색창이 열림', page.locator('#palette[open]').count(), 1)
            page.locator('#palette-input').fill('포트')
            step('검색창에 ‘포트’ 입력')
            shot(page, 'home-palette', '검색 결과: 도구와 명령어가 입력 위치와 함께 표시')
            page.locator('.palette-item', has_text='특정 포트 리스닝 확인').first.click()
            page.locator('#param-PORT').fill('8111')
            step('‘특정 포트 리스닝 확인’ → 포트 8111')
            check('최종 명령어', page.locator('#command-preview').input_value(), 'ss -lnt "( sport = :8111 )"')
            page.locator('#copy-command').click()
            check('클립보드(브라우저 Clipboard API로 읽음)', clipboard(page), 'ss -lnt "( sport = :8111 )"')
            check('복사 완료 알림이 열린 창 위(최상위 레이어)에 표시', page.evaluate("document.getElementById('modal').open && document.getElementById('toast').matches(':popover-open')"), True)
            shot(page, 'home-command', '값을 넣은 명령 창과 창 위에 표시된 복사 완료 알림')
            nav(page, 'home')
            page.locator('[data-open-domain="linux"]').click()
            step('Linux 셸 · SSH 카드 → Linux 명령 보기')
            check('명령어 포켓이 Linux로 열림', page.locator('[data-command-domain].active').get_attribute('data-command-domain'), 'linux')
            shot(page, 'home-linux', 'Linux 환경만 표시된 명령어 포켓')
            nav(page, 'home')
            page.locator('[data-open-sql-db="oracle"]').click()
            step('DB 카드 → Oracle')
            check('SQL 작업대가 Oracle 기준', page.locator('#sql-db-where').inner_text(), 'SQL>', ok='SQL>' in page.locator('#sql-db-where').inner_text())
            shot(page, 'home-oracle', 'DB 카드에서 연 SQL 작업대(Oracle)')
        run(home)

        def commands():
            case('명령어 포켓', '검색 → 대체 명령(값 이어받기) → 원래 명령 복귀, 변경 명령 확인 체크, 내 명령어 추가',
                 '대안으로 넘어가도 입력값이 유지되고, 변경 명령은 확인 전 복사가 잠기며, 내 명령어가 목록에 저장된다')
            nav(page, 'commands')
            guide(page, 'commands', '명령어 포켓')
            check('예시 실행으로 ‘포트’ 검색', page.locator('#command-query').input_value(), '포트')
            shot(page, 'commands-search', '‘포트’ 검색 결과와 카드의 입력 위치')
            page.locator('#command-query').fill('pgrep')
            page.locator('#command-list [data-command="cmd-013"]').first.click()
            page.locator('#param-PATTERN').fill('java')
            step('‘프로세스 이름으로 PID 찾기’ → PATTERN: java')
            check('원래 명령', page.locator('#command-preview').input_value(), "pgrep -af -- 'java'")
            page.locator('#modal [data-alt][data-command="cmd-096"]').click()
            step('사용할 수 없을 때 → pgrep 대체 · ps와 문자열 검색')
            check('대안이 입력값을 이어받음', page.locator('#command-preview').input_value(), "ps -ef | grep -F -- 'java'")
            check('이어받은 값 안내', page.locator('#command-carried').inner_text(), ok='PATTERN' in page.locator('#command-carried').inner_text())
            shot(page, 'commands-alternative', '대체 명령: 입력값 이어받기와 원래 명령 복귀 버튼')
            page.locator('#command-back').click()
            check('원래 명령으로 복귀', page.locator('#param-PATTERN').input_value(), 'java')
            page.locator('#modal [data-close]').click()
            page.locator('#command-query').fill('정상 종료 요청')
            page.locator('#command-list [data-command="cmd-018"]').first.click()
            page.locator('#param-PID').fill('12345')
            step('변경 명령 ‘프로세스에 정상 종료 요청’ → PID 12345(가짜 값)')
            check('확인 체크 전 복사 잠김', page.locator('#copy-command').is_disabled(), True)
            shot(page, 'commands-ack', '변경 명령: 확인 체크 전 복사 버튼 잠김')
            page.locator('#command-ack').check()
            check('확인 체크 후 복사 가능', page.locator('#copy-command').is_enabled(), True)
            page.locator('#copy-command').click()
            check('복사된 명령', clipboard(page), 'kill -TERM 12345')
            page.locator('#modal [data-close]').click()
            page.locator('#add-command').click()
            page.locator('#custom-title').fill(MARK['cmd'] + ' 로그 용량 확인')
            page.locator('#custom-body').fill('du -sh /var/log/' + MARK['cmd'].lower())
            page.locator('#custom-note').fill('증적용 가짜 명령')
            step('내 명령어 → 제목·명령 입력 → 저장(증적 표식 ' + MARK['cmd'] + ')')
            shot(page, 'commands-custom', '내 명령어 추가 창(평문 저장 경고)')
            page.locator('#custom-save').click()
            page.locator('#command-query').fill(MARK['cmd'])
            check('내 명령어가 목록에 표시', page.locator('#command-list .command-card').count(), 1)
            shot(page, 'commands-custom-saved', '저장된 내 명령어 카드(사용자 명령 표시)')
        run(commands)

        def sqlformat():
            case('SQL 작업대', 'MariaDB 접속 명령 → UPDATE 프리셋 수정 → WHERE 삭제 → 확인 후 복사·저장, Oracle 빈 줄 거부',
                 '확인 창에 보인 SQL이 클립보드·저장 파일과 같고, WHERE 없는 변경은 체크 전 잠긴다')
            nav(page, 'sqlformat')
            guide(page, 'sqlformat', 'SQL 작업대')
            page.locator('[data-sql-db="mariadb"]').click()
            page.locator('#sql-steps [data-command="cmd-136"]').click()
            page.locator('#param-DBUSER').fill('app_reader')
            page.locator('#param-DBNAME').fill('appdb')
            step('DB: MariaDB → 1 접속 → 사용자 app_reader · DB appdb(가짜 값)')
            check('접속 명령(비밀번호는 프롬프트에서 입력)', page.locator('#command-preview').input_value(), "mysql -h '127.0.0.1' -u 'app_reader' -p --safe-updates 'appdb'")
            shot(page, 'sql-connect', 'MariaDB 접속 명령: 입력 위치 Linux 셸')
            page.locator('#modal [data-close]').click()
            page.locator('#sql-steps [data-open-sql-preset="cmd-134"]').click()
            src = "UPDATE pocket_ops_sample\nSET item_name = '" + MARK['sql'] + "'"
            page.locator('#sqlformat-input').fill(src)
            step('4 쿼리 → UPDATE 프리셋 → WHERE 줄 삭제, 값 ' + MARK['sql'])
            page.locator('[data-copy-id="sqlformat-output"]').click()
            check('WHERE 없음 경고', page.locator('#sql-review-checks').inner_text(), ok='WHERE' in page.locator('#sql-review-checks').inner_text())
            check('확인 체크 전 복사 잠김', page.locator('#sql-review-confirm').is_disabled(), True)
            reviewed = page.locator('#sql-review-preview').input_value()
            shot(page, 'sql-review', '최종 쿼리 확인 창: WHERE 없는 UPDATE 위험과 확인 체크')
            page.locator('#sql-review-ack').check()
            page.locator('#sql-review-confirm').click()
            raw_clip = clipboard_raw(page)
            check('클립보드 = 확인 창에 보인 SQL(줄바꿈 정규화 후 글자 단위 비교)', raw_clip.replace('\r\n', '\n'), reviewed)
            check('클립보드의 줄바꿈 형식(기록)', 'CRLF' if '\r\n' in raw_clip else 'LF', ok=True)
            page.locator('[data-download-id="sqlformat-output"]').click()
            page.locator('#sql-review-ack').check()
            with page.expect_download() as d:
                page.locator('#sql-review-confirm').click()
            data = Path(d.value.path()).read_bytes()
            (DOWNLOADS / d.value.suggested_filename).write_bytes(data)
            check('저장 파일 = 확인 창에 보인 SQL', data.decode('utf-8'), reviewed)
            page.locator('[data-sql-db="oracle"]').click()
            page.locator('#sqlformat-input').fill("SELECT item_id\n\nFROM pocket_ops_sample;")
            page.locator('#sqlformat-run').click()
            step('DB: Oracle → 빈 줄이 있는 SELECT → 정렬 · 점검')
            check('SQL*Plus 빈 줄 거부', page.locator('#sqlformat-status').get_attribute('class'), ok='error' in page.locator('#sqlformat-status').get_attribute('class'))
            shot(page, 'sql-oracle-blank', 'Oracle: 빈 줄은 SQL*Plus 입력을 끊으므로 거부')
            page.locator('[data-sql-db="cubrid"]').click()
        run(sqlformat)

        def encoding():
            case('한글 · 인코딩 진료소', '깨진 문자열 복구 후보, EUC-KR(CP949) 원본 파일 다시 읽기 → UTF-8 저장',
                 'CP949 파일이 Python cp949 디코딩과 같은 한글로 보이고, 저장 파일이 UTF-8로 같은 내용이다')
            nav(page, 'encoding')
            guide(page, 'encoding', '한글 · 인코딩 진료소')
            sample = ROOT / 'samples' / 'korean-cp949.txt'
            page.locator('#encoding-file').set_input_files(str(sample))
            page.wait_for_function("() => document.getElementById('encoding-info').textContent.includes('bytes')")
            page.locator('#file-charset').select_option('euc-kr')
            step('01 원본 파일 → samples/korean-cp949.txt → EUC-KR / Windows-949로 읽기')
            oracle = sample.read_bytes().decode('cp949')
            check('화면 결과 = Python cp949 디코딩(줄바꿈 LF 표시)', page.locator('#encoding-output').input_value(), oracle.replace('\r\n', '\n'))
            shot(page, 'encoding-file', 'CP949 파일을 EUC-KR로 다시 읽은 결과', target='#encoding-output')
            name, data = save_download(page, '#encoding-save')
            check('UTF-8로 저장한 파일 = 원문(CRLF 유지)', data.decode('utf-8'), oracle)
        run(encoding)

        def json_tool():
            case('JSON 정리함', '큰 숫자 보존 정리, 문법 오류, 압축 후 복사', '숫자 표기를 바꾸지 않고, 오류는 결과를 비우고 원인을 표시한다')
            nav(page, 'json')
            guide(page, 'json', 'JSON 정리함')
            page.locator('#json-input').fill('{"marker":"' + MARK['json'] + '","n":1,}')
            page.locator('#json-validate').click()
            step('끝에 쉼표가 있는 JSON → 문법 검증')
            check('문법 오류 표시', page.locator('#json-status').get_attribute('class'), ok='error' in page.locator('#json-status').get_attribute('class'))
            shot(page, 'json-error', '문법 오류: 상태 줄에 원인 표시')
            raw = (ROOT / 'samples' / 'sample-api.json').read_text(encoding='utf-8')
            page.locator('#json-input').fill(raw)
            page.locator('#json-minify').click()
            page.locator('[data-copy-id="json-output"]').click()
            step('samples/sample-api.json → 공백 압축 → 복사')
            out = clipboard(page)
            numbers = re.findall(r'-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?', raw)
            check('원문의 숫자 표기를 그대로 유지(Python으로 추출한 숫자 토큰)', [n for n in numbers if n not in out], [])
            shot(page, 'json-minify', '공백 압축 결과', target='#json-output')
        run(json_tool)

        def codec():
            case('인코딩 변환기', 'URL 인코딩, Base64 디코딩', 'Python urllib/base64와 같은 결과')
            nav(page, 'codec')
            guide(page, 'codec', '인코딩 변환기')
            check('Python quote와 같음', value(page, 'codec-output'), urllib.parse.quote('한글 이름&x=1', safe="-_.!~*'()"))
            page.locator('#codec-mode').select_option('base64')
            page.locator('#codec-input').fill('7ZWc6riA')
            page.locator('#codec-decode').click()
            step('Base64 → 7ZWc6riA → 디코딩')
            check('Base64 디코딩 = Python base64', page.locator('#codec-output').input_value(), base64.b64decode('7ZWc6riA').decode('utf-8'))
            shot(page, 'codec-base64', 'Base64 디코딩 결과')
        run(codec)

        def text():
            case('텍스트 다듬기', '목록 정리 후 CRLF로 저장', '중복·빈 줄 제거, 자연 정렬, 저장 파일 줄바꿈이 CRLF')
            nav(page, 'text')
            guide(page, 'text', '텍스트 다듬기')
            page.locator('#text-eol').select_option('crlf')
            page.locator('#text-run').click()
            name, data = save_download(page, '[data-download-id="text-output"]')
            step('결과 줄바꿈 CRLF → 적용 → 저장')
            check('저장 파일 바이트(CRLF)', repr(data), repr(b'item1\r\nitem2\r\nitem10'))
            shot(page, 'text-crlf', 'CRLF로 정리한 결과와 상태 줄')
        run(text)

        def diff():
            case('변경점 비교', '설정 변경 전후 비교, 바뀐 줄만 보기, 보고서 저장', '추가 1·삭제 1·동일 2, 보고서에 +/− 줄')
            nav(page, 'diff')
            guide(page, 'diff', '변경점 비교')
            shot(page, 'diff-result', '줄 단위 비교 결과', target='#diff-result')
            page.locator('#diff-changes').check()
            check('바뀐 줄만 표시', page.locator('#diff-result .diff-line').count(), 2)
            name, data = save_download(page, '#diff-save')
            report = data.decode('utf-8')
            step('바뀐 줄만 표시 → 비교 결과 저장')
            check('보고서에 삭제·추가 줄', report, ok='- ' in report and '+ ' in report and 'server.port=8111' in report)
        run(diff)

        def logs():
            case('로그 돋보기', '오류 주변 문맥 추리기, UTF-8 로그 파일 열기', '결과가 Python 필터(대소문자 무시)와 같다')
            nav(page, 'logs')
            guide(page, 'logs', '로그 돋보기')
            sample = ROOT / 'samples' / 'sample-log.txt'
            page.locator('#logs-file').set_input_files(str(sample))
            page.wait_for_function("() => document.getElementById('logs-input').value.length > 0")
            page.locator('#logs-include').fill('error')
            page.locator('#logs-context').select_option('0')
            page.locator('#logs-run').click()
            step('UTF-8 파일 열기 → samples/sample-log.txt → 포함: error · 일치 줄만')
            lines = sample.read_text(encoding='utf-8').splitlines()
            check('Python 필터와 같음', page.locator('#logs-output').input_value(), '\n'.join(x for x in lines if 'error' in x.lower()))
            shot(page, 'logs-file', '파일 로그 필터 결과와 통계', target='#logs-stats')
            page.locator('#logs-input').fill('2026-11-21 10:00:00 ERROR ' + MARK['log'] + ' token=FAKE')
            step('증적 표식 ' + MARK['log'] + '이 있는 로그 줄 입력(저장 범위 확인용)')
        run(logs)

        def sql_in():
            case('SQL IN 도우미', '문자열 목록 → IN 조건, 숫자 모드 잘못된 값', "작은따옴표 이스케이프, 숫자 모드는 문자를 거부")
            nav(page, 'sql')
            guide(page, 'sql', 'SQL IN 도우미')
            page.locator('#sql-kind').select_option('number')
            page.locator('#sql-input').fill('100\n2e3\nA1')
            page.locator('#sql-run').click()
            step('값 형식: 숫자 → 100, 2e3, A1 → IN 조건 만들기')
            check('숫자가 아닌 값 거부', page.locator('#sql-status').get_attribute('class'), ok='error' in page.locator('#sql-status').get_attribute('class'))
            check('오류 시 결과 비움', page.locator('#sql-output').input_value(), '')
            shot(page, 'sql-in-error', '숫자 모드 오류 표시')
            page.locator('#sql-kind').select_option('string')
        run(sql_in)

        def unicode():
            case('문자 · ASCII 검사기', '숫자 코드 → 문자, 숨은 공백 분석', 'U+200B, NBSP가 이름으로 표시된다')
            nav(page, 'unicode')
            guide(page, 'unicode', '문자 · ASCII 검사기')
            page.locator('#unicode-sample').click()
            step('숨은 공백 샘플')
            table = page.locator('#unicode-table').inner_text()
            check('ZERO WIDTH SPACE·NBSP 표시', table, ok='ZERO WIDTH SPACE' in table and 'NBSP' in table)
            shot(page, 'unicode-hidden', '보이지 않는 문자 이름과 UTF-8 바이트', target='#unicode-table')
        run(unicode)

        def time_tool():
            case('시간 번역기', '타임스탬프 → 날짜, KST 날짜 → 타임스탬프', 'Python datetime과 같은 값')
            nav(page, 'time')
            guide(page, 'time', '시간 번역기')
            page.locator('#time-date').fill('2026-11-21T09:00')
            page.locator('#time-zone').select_option('540')
            page.locator('#time-from-date').click()
            step('날짜 2026-11-21 09:00:00 · KST → 타임스탬프로 변환')
            want = int(dt.datetime(2026, 11, 21, 9, 0, tzinfo=dt.timezone(dt.timedelta(hours=9))).timestamp())
            out = page.locator('#time-output').input_value()
            check('Unix 초 = Python datetime', re.search(r'Unix 초\s+(\S+)', out).group(1), str(want))
            shot(page, 'time-date', 'KST 날짜를 타임스탬프로 변환')
        run(time_tool)

        def chmod():
            case('권한 계산기', '체크박스로 644 만들기 → 확인 후 복사', 'rw-r--r--, 확인 창을 거쳐 복사')
            nav(page, 'chmod')
            guide(page, 'chmod', '권한 계산기')
            check('rwx 표기 = Python 계산', page.locator('#chmod-symbol').inner_text(), ''.join(c if int(d) & b else '-' for d in '750' for b, c in ((4, 'r'), (2, 'w'), (1, 'x'))))
            page.locator('[data-octal="644"]').click()
            page.locator('#chmod-path').fill('/app/conf/server.properties')
            n = len(DIALOGS)
            page.locator('#chmod-copy').click()
            step('일반 파일 644 → 경로 입력 → 내용 확인 후 복사 → 확인 창 승인')
            check('복사 전 확인 창', DIALOGS[n] if len(DIALOGS) > n else '', ok=len(DIALOGS) > n and '권한이 바뀝니다' in DIALOGS[n])
            check('복사된 명령', clipboard(page), "chmod 644 -- '/app/conf/server.properties'")
            shot(page, 'chmod-644', '644와 rw-r--r--, 복사할 명령')
        run(chmod)

        def cron():
            case('크론 미리보기', '평일 9시 30분 예약식의 다음 실행', 'Python으로 계산한 평일 09:30 5회와 같다')
            nav(page, 'cron')
            guide(page, 'cron', '크론 미리보기')
            kst = dt.timezone(dt.timedelta(hours=9))
            t, want = dt.datetime(2026, 11, 21, 0, 0, tzinfo=kst), []
            while len(want) < 5:
                t += dt.timedelta(minutes=1)
                if t.weekday() < 5 and t.hour == 9 and t.minute == 30:
                    want.append(t.strftime('%Y-%m-%d %H:%M:%S'))
            got = re.findall(r'\d{4}-\d\d-\d\d \d\d:\d\d:\d\d', page.locator('#cron-output').inner_text())
            check('다음 5회 = Python 계산', got, want)
        run(cron)

        def hash_tool():
            case('파일 지문', '텍스트 기대값 일치, 파일 SHA-256', 'file://에서 Web Crypto가 동작하고 Python hashlib과 같다')
            nav(page, 'hash')
            guide(page, 'hash', '파일 지문')
            check('비교 결과', page.locator('#hash-compare').inner_text(), ok='일치합니다' in page.locator('#hash-compare').inner_text())
            sample = ROOT / 'samples' / 'korean-utf8.txt'
            page.locator('#hash-expected').fill('')
            page.locator('#hash-file').set_input_files(str(sample))
            page.locator('#hash-file-run').click()
            step('파일 선택 → samples/korean-utf8.txt → 파일 해시 계산')
            want = hashlib.sha256(sample.read_bytes()).hexdigest()
            page.wait_for_function("w=>document.getElementById('hash-output').value===w", arg=want, timeout=5000)
            check('파일 SHA-256 = Python hashlib', page.locator('#hash-output').input_value(), want)
            shot(page, 'hash-file', '파일 SHA-256 결과')
        run(hash_tool)

        def regex():
            case('정규식 실험실', '캡처 확인, 과도한 역추적 패턴 중단', 'Worker에서 실행하고 약 1.2초 후 중단 안내')
            nav(page, 'regex')
            guide(page, 'regex', '정규식 실험실')
            page.locator('#regex-pattern').fill('(a+)+$')
            page.locator('#regex-flags').fill('')
            page.locator('#regex-input').fill('a' * 32 + '!')
            started = time.time()
            page.locator('#regex-run').click()
            page.wait_for_function("() => document.getElementById('regex-status').className.includes('error')", timeout=6000)
            step('패턴 (a+)+$ · 입력 a×32 + ! → 정규식 테스트')
            check('시간 제한으로 중단', page.locator('#regex-status').inner_text(), ok='1.2초' in page.locator('#regex-status').inner_text())
            check('화면이 멈추지 않음(중단까지 걸린 시간)', f'{time.time() - started:.1f}초', ok=time.time() - started < 5)
            shot(page, 'regex-timeout', '과도한 역추적 패턴을 Worker에서 중단')
        run(regex)

        def favorites():
            case('즐겨찾기', '도구와 명령어 별표 → 즐겨찾기 화면', '별표한 도구와 명령이 즐겨찾기와 대시보드에 모인다')
            nav(page, 'regex')
            star = page.locator('#view .page-title [data-tool-star="regex"]')
            if 'starred' not in (star.get_attribute('class') or ''):
                star.click()
            step('정규식 실험실 제목 옆 ☆')
            nav(page, 'commands')
            page.locator('#command-query').fill('특정 포트 리스닝')
            cstar = page.locator('[data-cmd-star="cmd-044"]').first
            if cstar.get_attribute('aria-pressed') != 'true':
                cstar.click()
            step('명령어 포켓 → ‘특정 포트 리스닝 확인’ 카드의 ☆')
            nav(page, 'favorites')
            guide(page, 'favorites', '즐겨찾기')
            check('즐겨찾는 도구에 정규식 실험실', page.locator('.tool-grid [data-go="regex"]').count(), 1)
            check('즐겨찾는 명령어에 cmd-044', page.locator('.command-list [data-command="cmd-044"]').count(), 1)
            shot(page, 'favorites', '즐겨찾기 화면')
        run(favorites)

        def settings():
            case('내 포켓 관리', '저장 범위 확인 → 설정 백업 → 배포 ZIP → 초기화 → 백업 가져오기 → 다시 열기 → 입력 비우기',
                 '저장소·백업에는 내 명령어만, 배포 ZIP에는 작업 데이터와 설정이 없고 HTML이 빌드와 같다')
            nav(page, 'settings')
            guide(page, 'settings', '내 포켓 관리')
            shot(page, 'settings', '내 포켓 관리: 브라우저 준비 상태와 저장 범위')
            store = page.evaluate('JSON.stringify(Object.fromEntries(Object.entries(localStorage)))')
            check('localStorage 키', sorted(json.loads(store)), ['pocket-ops:v1'])
            check('저장소에 내 명령어 표식 있음', MARK['cmd'] in store, True)
            check('저장소에 SQL·로그·JSON 작업 입력 없음', [m for k, m in MARK.items() if k != 'cmd' and m in store], [])
            name, data = save_download(page, '#settings-export')
            backup = data.decode('utf-8')
            step('설정 백업 → ' + name)
            check('백업 필드', sorted(json.loads(backup)), sorted(['version', 'theme', 'toolFavs', 'cmdFavs', 'customCommands', 'app', 'exportedAt']))
            check('백업에 작업 입력 표식 없음', [m for k, m in MARK.items() if k != 'cmd' and m in backup], [])
            with page.expect_download() as d:
                page.locator('#release-download').click()
            zip_bytes = Path(d.value.path()).read_bytes()
            step('상단 배포하기 → ' + d.value.suggested_filename)
            z = zipfile.ZipFile(io.BytesIO(zip_bytes))
            names = sorted(z.namelist())
            check('ZIP 구성', names, sorted(['pocket-ops.html', 'README_KO.md', 'START_HERE.txt', 'CHANGELOG.md']))
            check('ZIP 안의 HTML = 빌드한 pocket-ops.html', hashlib.sha256(z.read('pocket-ops.html')).hexdigest(), file_sha)
            check('ZIP = 저장소의 배포 ZIP', hashlib.sha256(zip_bytes).hexdigest(), hashlib.sha256((ROOT / f'pocket-ops-v{VERSION}.zip').read_bytes()).hexdigest())
            blob = b''.join(z.read(n) for n in names).decode('utf-8', 'replace')
            check('ZIP에 증적 표식(작업 입력·내 명령어) 없음', [m for m in MARK.values() if m in blob], [])
            shot(page, 'settings-release', '배포 ZIP 저장 직후')
            page.locator('#settings-reset').click()
            step('이 앱의 저장 설정 초기화 → 확인')
            check('초기화 후 내 명령어 0개', page.evaluate('JSON.parse(localStorage.getItem("pocket-ops:v1")).customCommands.length'), 0)
            page.locator('#settings-import').set_input_files(str(DOWNLOADS / name))
            page.wait_for_selector('#confirm-import')
            step('백업 가져오기 → ' + name)
            shot(page, 'settings-import', '가져오기 확인 창(교체 범위와 개수)')
            page.locator('#confirm-import').click()
            check('가져온 뒤 내 명령어 복원', page.evaluate('JSON.parse(localStorage.getItem("pocket-ops:v1")).customCommands.map(c=>c.title)'), [MARK['cmd'] + ' 로그 용량 확인'])
            nav(page, 'json')
            page.locator('#json-input').fill('{"draft":"' + MARK['json'] + '"}')
            page.reload()
            page.wait_for_selector('html.app-ready')
            step('같은 파일 다시 열기(새로 고침)')
            nav(page, 'json')
            check('다시 열면 작업 입력 없음', page.locator('#json-input').input_value(), '')
            nav(page, 'favorites')
            check('다시 열어도 즐겨찾기 유지(file:// 저장소)', page.locator('.command-list [data-command="cmd-044"]').count(), 1)
            shot(page, 'settings-reopen', '다시 연 뒤 즐겨찾기 유지')
            nav(page, 'logs')
            page.locator('#logs-input').fill(MARK['log'])
            nav(page, 'settings')
            page.locator('#clear-inputs').click()
            step('열린 도구의 입력 비우기 → 확인')
            nav(page, 'logs')
            check('입력 비우기 후 로그 입력 없음', page.locator('#logs-input').input_value(), '')
        run(settings)

        def theme():
            case('테마', '어두운 테마로 전환', '어두운 테마가 적용되고 설정에 저장된다')
            nav(page, 'home')
            page.locator('#theme-toggle').click()
            step('상단 달 아이콘')
            check('data-theme', page.evaluate('document.documentElement.dataset.theme'), 'dark')
            shot(page, 'theme-dark', '어두운 테마의 내 작업실')
            page.locator('#theme-toggle').click()
        run(theme)

        env['external_requests'] = list(REQUESTS)
        env['page_errors'] = list(ERRORS)
        ctx.close()

        # Galaxy-size viewport: Chromium touch emulation, not a real phone or Android file viewer.
        phone_ctx = browser.new_context(viewport={'width': 360, 'height': 780}, device_scale_factor=3, is_mobile=True, has_touch=True,
                                        locale='ko-KR', accept_downloads=True)
        phone_ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        phone = phone_ctx.new_page()
        phone.set_default_timeout(6000)
        phone.on('dialog', lambda d: d.accept())

        def mobile():
            case('휴대폰 화면(에뮬레이션)', '360px 터치 화면에서 메뉴 → 명령 찾기 → 값 입력 → 복사, 사용 예시',
                 '가로 넘침 없이 첫 화면에 사용 예시와 첫 명령이 보이고, 값이 복사된다', device='360×780 터치 에뮬레이션')
            phone.goto(URL)
            phone.wait_for_selector('html.app-ready')
            shot(phone, 'phone-home', '휴대폰 첫 화면')
            phone.locator('#mobile-menu').tap()
            step('왼쪽 위 메뉴 버튼')
            shot(phone, 'phone-menu', '열린 메뉴')
            phone.locator('#sidebar [data-go="commands"]').tap()
            phone.locator('[data-command-domain="linux"]').tap()
            phone.locator('#command-query').fill('포트')
            step('명령어 포켓 → Linux → ‘포트’ 검색')
            check('가로 넘침 없음', phone.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), True)
            first = phone.locator('#command-list .command-card').first.bounding_box()
            check('첫 명령 카드가 첫 화면 안에서 시작', f"y={first['y']:.0f}px", ok=first['y'] < 780)
            shot(phone, 'phone-commands', 'Linux 명령 검색 결과')
            phone.locator('#view .page-title [data-guide]').tap()
            shot(phone, 'phone-guide', '휴대폰의 사용 예시 창')
            phone.locator('#modal [data-close]').tap()
            phone.locator('#command-list [data-command="cmd-044"]').first.tap()
            phone.locator('#param-PORT').fill('9090')
            phone.locator('#copy-command').tap()
            step('특정 포트 리스닝 확인 → 포트 9090 → 명령어 복사')
            phone.wait_for_timeout(250)
            check('복사된 명령(브라우저 Clipboard API)', phone.evaluate('navigator.clipboard.readText()'), 'ss -lnt "( sport = :9090 )"')
            shot(phone, 'phone-command', '휴대폰 명령 창')
            phone.locator('#modal [data-close]').tap()
            phone.locator('#mobile-menu').tap()
            phone.locator('#sidebar [data-go="sqlformat"]').tap()
            phone.locator('[data-open-sql-preset="cmd-135"]').tap()
            phone.locator('[data-copy-id="sqlformat-output"]').tap()
            step('SQL 작업대 → DELETE 프리셋 → 복사')
            shot(phone, 'phone-sql-review', '휴대폰의 최종 쿼리 확인 창')
            phone.locator('#sql-review-confirm').tap()
            check('확인한 DELETE가 복사됨', phone.evaluate('navigator.clipboard.readText()'), "DELETE FROM pocket_ops_sample\nWHERE item_id = 1001\n  AND item_name = 'SAMPLE';",
                  ok=phone.evaluate('navigator.clipboard.readText()').startswith('DELETE FROM pocket_ops_sample'))
        run(mobile)
        phone_ctx.close()

        # JavaScript turned off: the same file shows the read-only command reference.
        nojs = browser.new_context(viewport={'width': 1366, 'height': 900}, java_script_enabled=False)
        nojs_page = nojs.new_page()

        def no_script():
            case('JavaScript 제한', 'JavaScript를 끈 브라우저로 같은 파일 열기', '빈 화면 대신 읽기 전용 명령어 참고와 입력 위치가 보인다', device='PC · JavaScript 꺼짐')
            nojs_page.goto(URL)
            step('JavaScript 비활성 컨텍스트에서 file:// 열기')
            check('읽기 전용 참고 표시', nojs_page.locator('#script-fallback').is_visible(), True)
            count = nojs_page.locator('#script-fallback .reference-where').count()
            check('모든 명령에 입력 위치 표시', count, nojs_page.evaluate('document.querySelectorAll("#script-fallback article").length'))
            shot(nojs_page, 'nojs-reference', 'JavaScript 없이 보이는 읽기 전용 명령어 참고')
        run(no_script)
        nojs.close()
        browser.close()

        if os_clip:
            os_clipboard_phase(p)

    env['finished'] = dt.datetime.now().astimezone().isoformat(timespec='seconds')
    write_reports(env)
    failed = sum(not c['pass'] for k in CASES for c in k['checks'])
    print(f'EVIDENCE {len(CASES)} cases · {sum(len(k["checks"]) for k in CASES)} checks · {failed} failed · {shot_no} screenshots → {OUT}')
    return 1 if failed else 0

def os_clipboard_phase(p):
    case('OS 클립보드(실제 창)', '보이는 Chromium 창에서 복사 버튼 → Windows 클립보드 읽기', 'Get-Clipboard 값이 화면의 최종 명령·SQL과 같다', device='PC · 보이는 Chromium 창')
    probe = subprocess.run(['powershell', '-NoProfile', '-Command', 'Add-Type -AssemblyName System.Windows.Forms; $d=[System.Windows.Forms.Clipboard]::GetDataObject(); if($d){$d.GetFormats() -join ","}'],
                           capture_output=True, text=True, encoding='utf-8').stdout.strip()
    if probe and not set(probe.split(',')) <= {'System.String', 'UnicodeText', 'Text', 'Locale', 'OEMText', 'Chromium internal source RFH token', 'Chromium internal source URL'}:
        check('기존 클립보드에 텍스트 외 형식이 있어 건너뜀(복원 불가 방지)', probe, ok=True)
        return
    saved = os_clipboard_raw()
    try:
        browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=False, args=['--window-position=40,40'])
        ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, locale='ko-KR')
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        page = ctx.new_page()
        page.set_default_timeout(6000)
        page.on('dialog', lambda d: d.accept())
        page.goto(URL)
        page.wait_for_selector('html.app-ready')
        page.bring_to_front()
        nav(page, 'commands')
        page.locator('#command-query').fill('특정 포트 리스닝')
        page.locator('#command-list [data-command="cmd-044"]').first.click()
        page.locator('#param-PORT').fill('8443')
        page.locator('#copy-command').click()
        page.wait_for_timeout(500)
        step('명령어 포켓 → 특정 포트 리스닝 확인 → 포트 8443 → 명령어 복사 → PowerShell Get-Clipboard')
        check('Windows 클립보드 = 최종 명령', os_clipboard_text(), 'ss -lnt "( sport = :8443 )"')
        shot(page, 'os-clipboard-command', '보이는 창에서 복사한 명령')
        nav(page, 'sqlformat')
        page.locator('[data-open-sql-preset="cmd-134"]').click()
        page.locator('[data-copy-id="sqlformat-output"]').click()
        reviewed = page.locator('#sql-review-preview').input_value()
        page.locator('#sql-review-confirm').click()
        page.wait_for_timeout(500)
        step('SQL 작업대 → UPDATE 프리셋 → 복사 → 확인 후 복사 → Get-Clipboard')
        check('Windows 클립보드 = 확인 창의 SQL(줄바꿈 포함 비교)', os_clipboard_text(), reviewed)
        browser.close()
    finally:
        if saved:
            set_os_clipboard(saved)
        check('작업 전 클립보드 텍스트 복원(내용은 기록하지 않음)', os_clipboard_raw() == saved, True)

def write_reports(env):
    total = sum(len(k['checks']) for k in CASES)
    failed = sum(not c['pass'] for k in CASES for c in k['checks'])
    data = {'environment': env, 'summary': {'cases': len(CASES), 'checks': total, 'failed': failed, 'screenshots': shot_no,
            'browser_dialogs': DIALOGS}, 'cases': CASES,
            'limits': ['PC 화면은 실제 Chromium으로 연 file:// 페이지입니다. 클립보드 값은 브라우저 Clipboard API로 읽었고, OS 클립보드는 별도 단계(실제 창)에서만 확인했습니다.',
                       '휴대폰 화면은 Chromium 터치 에뮬레이션입니다. 실제 갤럭시의 내 파일·HTML 뷰어·content:// 열기와 OS 클립보드는 단말에서 따로 확인해야 합니다.',
                       '다운로드는 Playwright가 받은 실제 브라우저 다운로드 파일입니다. 사용자의 다운로드 폴더 저장 동작은 확인 범위 밖입니다.',
                       '명령은 복사만 했고 어떤 서버·DB에서도 실행하지 않았습니다. 입력값은 모두 가짜 표본입니다.'],
            'findings': FINDINGS}
    (OUT / 'evidence.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    e = html.escape
    rows = []
    for k in CASES:
        ok = all(c['pass'] for c in k['checks'])
        checks = ''.join(f"<tr class=\"{'ok' if c['pass'] else 'bad'}\"><td>{'통과' if c['pass'] else '실패'}</td><td>{e(c['name'])}</td><td><code>{e(c['actual'])}</code></td><td>{('<code>' + e(c['expected']) + '</code>') if c['expected'] else '<span class=\"muted\">조건 판정</span>'}</td></tr>" for c in k['checks'])
        shots = ''.join(f"<figure><a href=\"{e(s['file'])}\"><img loading=\"lazy\" src=\"{e(s['file'])}\" alt=\"{e(s['caption'])}\"></a><figcaption>{e(s['caption'])}</figcaption></figure>" for s in k['shots'])
        steps = ''.join(f'<li>{e(s)}</li>' for s in k['steps'])
        rows.append(f"""<section class="case" id="case-{k['no']}"><header><span class="badge {'ok' if ok else 'bad'}">{'통과' if ok else '실패'}</span><h2>{k['no']}. {e(k['menu'])}</h2><p class="meta">{e(k['device'])}</p></header>
<p class="scenario"><b>시나리오</b> {e(k['title'])}</p><p class="scenario"><b>기대 결과</b> {e(k['expected'])}</p>
<details open><summary>조작 순서 {len(k['steps'])}단계</summary><ol>{steps}</ol></details>
<table><thead><tr><th>판정</th><th>확인 항목</th><th>실제 값</th><th>기대 값</th></tr></thead><tbody>{checks}</tbody></table>
<div class="shots">{shots}</div></section>""")
    toc = ''.join(f"<li><a href=\"#case-{k['no']}\">{k['no']}. {e(k['menu'])}</a> <span class=\"{'ok' if all(c['pass'] for c in k['checks']) else 'bad'}\">{'●' if all(c['pass'] for c in k['checks']) else '✕'}</span></li>" for k in CASES)
    limits = ''.join(f'<li>{e(x)}</li>' for x in data['limits'])
    findings = ''.join(f"<article class=\"finding\"><h3>{e(f['title'])} <span class=\"badge {'ok' if f['status'] != '수정함' else 'fix'}\">{e(f['status'])}</span></h3><p>{e(f['detail'])}</p>"
                       + (f"<figure><a href=\"{e(f['before'])}\"><img loading=\"lazy\" src=\"{e(f['before'])}\" alt=\"수정 전 화면\"></a><figcaption>수정 전: 알림이 흐린 배경 아래에 있음</figcaption></figure>" if f.get('before') else '')
                       + '</article>' for f in FINDINGS)
    page = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pocket Ops {e(VERSION)} 사용 증적</title><style>
:root{{--bg:#f5f6fa;--card:#fff;--ink:#18202f;--muted:#5d6678;--line:#e3e6ee;--ok:#13795b;--okbg:#e6f6ef;--bad:#b42318;--badbg:#fdecea;--code:#f3f4f8}}
@media(prefers-color-scheme:dark){{:root{{--bg:#11151d;--card:#191f2a;--ink:#e8ecf3;--muted:#9aa4b5;--line:#2a3242;--ok:#5bd3a4;--okbg:#123326;--bad:#ff8a80;--badbg:#3a1714;--code:#212938}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.65 system-ui,'Malgun Gothic',sans-serif}}main{{max-width:1180px;margin:0 auto;padding:28px 16px 60px}}
h1{{font-size:26px;margin:0 0 6px}}.env{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:18px 0}}.env dl{{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:0}}.env dt{{color:var(--muted)}}.env dd{{margin:0;overflow-wrap:anywhere}}
.totals{{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}}.totals span{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 14px}}.totals b{{font-size:18px;margin-right:6px}}
nav ol{{columns:3 220px;padding-left:20px}}.case{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:22px 0}}.case header{{display:flex;align-items:center;gap:10px;flex-wrap:wrap}}.case h2{{font-size:19px;margin:0}}.meta{{color:var(--muted);margin:0 0 0 auto}}
.badge{{border-radius:20px;padding:2px 10px;font-weight:700;font-size:12px}}.badge.ok,.ok{{color:var(--ok)}}.badge.ok{{background:var(--okbg)}}.badge.bad,.bad{{color:var(--bad)}}.badge.bad{{background:var(--badbg)}}
.scenario{{margin:8px 0}}.scenario b{{display:inline-block;min-width:72px;color:var(--muted)}}table{{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;table-layout:fixed}}th,td{{border-top:1px solid var(--line);padding:7px 8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}}th:nth-child(1),td:nth-child(1){{width:58px}}th:nth-child(2),td:nth-child(2){{width:26%}}
code{{font-family:Consolas,'D2Coding',monospace;background:var(--code);border-radius:5px;padding:1px 5px;white-space:pre-wrap}}tr.bad td{{background:var(--badbg)}}
.shots{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}}figure{{margin:0}}figure img{{width:100%;border:1px solid var(--line);border-radius:8px;display:block}}figcaption{{font-size:12px;color:var(--muted);margin-top:4px}}
.muted{{color:var(--muted)}}.limits{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 18px 12px 34px}}.finding{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 18px;margin:10px 0}}.finding h3{{font-size:15px;margin:0 0 4px}}.finding figure{{max-width:420px;margin-top:8px}}.badge.fix{{background:#fff4e5;color:#9a4b00}}@media(max-width:600px){{table{{font-size:12px}}th:nth-child(2),td:nth-child(2){{width:30%}}.meta{{margin:0}}}}
</style></head><body><main><h1>Pocket Ops {e(VERSION)} · 전체 메뉴 사용 증적</h1><p>빌드한 <code>pocket-ops.html</code>을 실제 Chromium에서 로컬 파일로 열어 모든 메뉴를 화면 조작으로 사용하고, 단계마다 화면과 값을 기록했습니다.</p>
<div class="totals"><span><b>{len(CASES)}</b>시나리오</span><span><b>{total}</b>확인 항목</span><span class="{'bad' if failed else 'ok'}"><b>{failed}</b>실패</span><span><b>{shot_no}</b>스크린샷</span><span><b>{len(env.get('external_requests', []))}</b>외부 요청</span></div>
<div class="env"><dl><dt>브라우저</dt><dd>{e(env['browser'])}</dd><dt>OS</dt><dd>{e(env['os'])}</dd><dt>대상 파일</dt><dd>{e(env['html'])} · {env['html_bytes']:,} bytes · SHA-256 {e(env['html_sha256'])}</dd><dt>시작 · 종료</dt><dd>{e(env['started'])} → {e(env.get('finished', ''))}</dd><dt>페이지 오류</dt><dd>{len(env.get('page_errors', []))}건</dd></dl></div>
<h2>발견 사항</h2>{findings}<h2>확인 범위와 한계</h2><ul class="limits">{limits}</ul><nav><h2>목차</h2><ol>{toc}</ol></nav>{''.join(rows)}</main></body></html>"""
    (OUT / 'index.html').write_text(page, encoding='utf-8')
    md = [f'# Pocket Ops {VERSION} · 전체 메뉴 사용 증적', '',
          f"- 브라우저: {env['browser']} · OS: {env['os']}",
          f"- 대상: `pocket-ops.html` ({env['html_bytes']:,} bytes, SHA-256 `{env['html_sha256']}`), file:// 로 열기",
          f"- 결과: 시나리오 {len(CASES)}개 · 확인 {total}건 · 실패 {failed}건 · 스크린샷 {shot_no}장 · 외부 요청 {len(env.get('external_requests', []))}건 · 페이지 오류 {len(env.get('page_errors', []))}건",
          f"- 실행: {env['started']} → {env.get('finished', '')}", '', '자세한 화면은 같은 폴더의 `index.html`을 브라우저로 여세요.', '',
          '| # | 메뉴 | 시나리오 | 확인 | 결과 | 대표 화면 |', '|---|---|---|---|---|---|']
    for k in CASES:
        ok = all(c['pass'] for c in k['checks'])
        first = k['shots'][0]['file'] if k['shots'] else ''
        md.append(f"| {k['no']} | {k['menu']} | {k['title']} | {sum(c['pass'] for c in k['checks'])}/{len(k['checks'])} | {'통과' if ok else '**실패**'} | {'[보기](' + first + ')' if first else ''} |")
    md += ['', '## 발견 사항', ''] + [f"- **{f['title']}** ({f['status']}) — {f['detail']}" + (f" [수정 전 화면]({f['before']})" if f.get('before') else '') for f in FINDINGS]
    md += ['', '## 확인 범위와 한계', ''] + ['- ' + x for x in data['limits']] + ['']
    (OUT / 'README.md').write_text('\n'.join(md), encoding='utf-8')

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
