"""Offline Chromium UI integration tests; no runtime app dependencies.
Install Playwright separately on an APPROVED development machine to rerun.
Main suite uses set_content; a separate file:// open/download/reopen smoke test
records actual availability without changing policies. Test doubles are labeled.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json, os, hashlib, time, re, io, zipfile
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'pocket-ops.html').read_text(encoding='utf-8')
RESULTS=[]
PREVIEWS=ROOT/'previews'
PREVIEWS.mkdir(exist_ok=True)
def check(name, fn):
    try:
        fn(); RESULTS.append({'name':name,'pass':True})
        print('PASS', name, flush=True)
    except Exception as e:
        RESULTS.append({'name':name,'pass':False,'error':str(e)})
        print('FAIL', name, str(e)[:240], flush=True)
def equal(a,b):
    assert a==b, f'{a!r} != {b!r}'
def contains(text, part):
    assert part in text, f'{part!r} not in {text[:150]!r}'

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1440,'height':1050},device_scale_factor=1,offline=True,accept_downloads=True)
    errors=[];requests=[]
    context.on('page',lambda p:p.on('pageerror',lambda e:errors.append(str(e))))
    context.on('request',lambda r:requests.append(r.url))
    page=context.new_page();page.set_default_timeout(4000)
    page.on('dialog',lambda d:d.accept())
    page.set_content(HTML,wait_until='load')
    capabilities=page.evaluate('({secureContext:isSecureContext,webCrypto:!!crypto.subtle,worker:!!window.Worker,protocol:location.protocol})')
    def go(name):
        if page.locator('#modal[open]').count(): page.locator('#modal [data-close]').click()
        if page.locator('#palette[open]').count(): page.keyboard.press('Escape')
        if page.locator('#mobile-menu').is_visible() and page.locator('#mobile-menu').get_attribute('aria-expanded')!='true': page.locator('#mobile-menu').click()
        page.locator('#sidebar [data-go="'+name+'"]').first.click()
    def v(selector): return page.locator(selector).input_value()
    def txt(selector): return page.locator(selector).inner_text()
    def click(selector): page.locator(selector).click()
    def fill(selector,s): page.locator(selector).fill(s)
    def download(selector):
        with page.expect_download() as d: click(selector)
        return Path(d.value.path()).read_bytes()
    check('Home has 15 tools',lambda:equal(page.locator('.tool-card').count(),15))
    check('Unavailable opaque-origin storage is explained',lambda:contains(txt('#storage-warning'),'저장소를 사용할 수 없습니다'))
    for route in ['commands','encoding','codec','json','text','diff','logs','sql','sqlformat','unicode','time','chmod','cron','hash','regex','settings','favorites']:
        check('Route '+route,lambda r=route:(go(r),equal(page.locator('#view h1').count(),1)))
    go('commands')
    CATALOG_SIZE=page.evaluate('PocketData.commands.length')
    check('All built-in commands visible',lambda:(equal(CATALOG_SIZE,157),equal(page.locator('.command-card').count(),CATALOG_SIZE)))
    def paste_targets():
        equal(page.locator('#command-list .command-card .where-tag').count(),CATALOG_SIZE)
        for cid,where in [('cmd-001','Linux 셸 · $'),('cmd-112','Windows PowerShell · PS>'),('cmd-128','csql> · CSQL 세션 명령'),
                          ('cmd-137','MariaDB> · SQL'),('cmd-144','SQL> · SQL*Plus 명령'),('cmd-152','psql => · 메타 명령')]:
            card=page.locator('#command-list .command-card').filter(has=page.locator(f'[data-command="{cid}"]'))
            contains(card.locator('.where-tag').inner_text(),where)
        click('[data-command="cmd-128"]');contains(txt('#modal .panel-head'),'csql> · CSQL 세션 명령');click('#modal [data-close]')
    check('Every command card and dialog names where to paste it (Linux shell, PowerShell or DB prompt)',paste_targets)
    def environment_tabs():
        for domain in ['windows','linux','db']:
            click('[data-command-domain="'+domain+'"]')
            expected=page.evaluate('(domain)=>PocketData.commands.filter(c=>c.domain===domain).length',domain)
            equal(page.locator('.command-card').count(),expected)
            assert expected>0
        click('[data-command-domain=""]')
    check('Environment tabs match catalog and expose DB editor guidance',environment_tabs)
    def csql_workflow():
        click('[data-command-domain="db"]')
        click('[data-command-db="cubrid"]')
        click('[data-command="cmd-123"]')
        assert page.locator('#copy-command').is_disabled()
        fill('#param-DBUSER','reader');fill('#param-DBTARGET','sampledb')
        contains(v('#command-preview'),"csql -C -r -u 'reader' 'sampledb'")
        click('#modal [data-close]')
        click('[data-command="cmd-128"]');equal(v('#command-preview'),';autocommit');click('#modal [data-close]')
        for cmd_id,verb in [('cmd-133','INSERT'),('cmd-134','UPDATE'),('cmd-135','DELETE')]:
            click('[data-command="'+cmd_id+'"]')
            draft=v('#command-preview');contains(draft,verb)
            assert all(line.startswith('--') for line in draft.splitlines() if line.strip())
            expect(page.locator('#copy-command')).to_be_disabled()
            page.locator('#command-ack').check();expect(page.locator('#copy-command')).to_be_enabled()
            click('#modal [data-close]')
        for db,expected in [('mariadb',{'cmd-136','cmd-142','cmd-132'}),('oracle',{'cmd-143','cmd-149','cmd-135'}),('postgresql',{'cmd-150','cmd-157','cmd-133'})]:
            click(f'[data-command-db="{db}"]')
            shown=set(page.locator('#command-list [data-cmd-star]').evaluate_all('els=>els.map(e=>e.dataset.cmdStar)'))
            assert expected<=shown and 'cmd-123' not in shown,(db,sorted(shown)[:6])
        click('[data-command-db=""]')
        click('[data-command-domain=""]');fill('#command-query','')
        expect(page.locator('#command-db-filter')).to_be_hidden()
    check('DB menu separates CSQL login and session commands from guarded SQL changes',csql_workflow)
    def alternative_command():
        command=page.evaluate('PocketData.commands.find(c=>c.alternatives.length)')
        click('[data-command="'+command['id']+'"]')
        target=command['alternatives'][0]
        click('#modal [data-command="'+target+'"]')
        equal(txt('#modal h2'),page.evaluate('(id)=>PocketData.commands.find(c=>c.id===id).title',target))
        assert v('#command-preview')
        contains(txt('#modal'),'실행 조건')
        click('#modal [data-close]')
    check('Alternative command opens an independent reviewed choice',alternative_command)
    def alternative_keeps_values():
        click('[data-command="cmd-013"]');fill('#param-PATTERN','tomcat-fixture')
        alt=page.locator('#modal .alt-row').filter(has=page.locator('[data-command="cmd-096"]'))
        contains(alt.inner_text(),'입력: Linux 셸');contains(alt.inner_text(),'조건:')
        alt.locator('button').click()
        equal(v('#command-preview'),"ps -ef | grep -F -- 'tomcat-fixture'");contains(txt('#command-carried'),'PATTERN')
        fill('#param-PATTERN','tomcat-edited');click('#command-back')
        equal(txt('#modal h2'),'프로세스 이름으로 PID 찾기');equal(v('#command-preview'),"pgrep -af -- 'tomcat-edited'")
        click('#modal [data-close]')
        click('[data-command="cmd-039"]');fill('#param-ARCHIVE','/apps/logs/a.gz');fill('#param-PATTERN','ORA-01555')
        click('#modal [data-command="cmd-099"]')
        equal(v('#command-preview'),"gzip -cd -- '/apps/logs/a.gz' | grep -n -F -- 'ORA-01555'")
        click('#modal [data-close]')
        click('[data-command="cmd-025"]');fill('#param-FILE',"/apps/a b.txt");click('#modal [data-command="cmd-100"]')
        equal(v('#command-preview'),"ls -ld -- '/apps/a b.txt'");click('#modal [data-close]')
    check('Alternative keeps typed values, shows its condition first and returns to the original',alternative_keeps_values)
    def cached_favorites():
        page.locator('#command-favorites').check();before=page.locator('.command-card').count()
        target=page.locator('#command-list [data-cmd-star]').first.get_attribute('data-cmd-star')
        go('favorites');click('[data-cmd-star="'+target+'"]');go('commands')
        equal(page.locator('.command-card').count(),before-1)
        page.locator('#command-favorites').uncheck();click('[data-cmd-star="'+target+'"]')
    check('Returning to cached command favorites reflects changes in shared favorites',cached_favorites)
    check('Situation search for port',lambda:(fill('#command-query','포트'),contains(txt('#command-list'),'포트')))
    def command_builder():
        fill('#command-query','');click('[data-command="cmd-044"]');fill('#param-PORT','8111');contains(v('#command-preview'),':8111');fill('#param-PORT','65536');assert page.locator('#copy-command').is_disabled();click('#modal [data-close]')
    check('Port template and invalid port guard',command_builder)
    def dangerous_command():
        click('[data-command="cmd-018"]');assert page.locator('#copy-command').is_disabled();fill('#param-PID','1234');assert page.locator('#copy-command').is_disabled();click('#command-ack');assert page.locator('#copy-command').is_enabled();fill('#param-PID','1234;id');assert page.locator('#copy-command').is_disabled();click('#modal [data-close]')
    check('Changing command requires acknowledgment and PID',dangerous_command)
    def recheck_ack():
        click('[data-command="cmd-018"]');fill('#param-PID','1234');click('#command-ack')
        assert page.locator('#copy-command').is_enabled()
        fill('#param-PID','5678');assert page.locator('#copy-command').is_disabled()
        assert not page.locator('#command-ack').is_checked();click('#modal [data-close]')
    check('Changing reviewed command parameters requires a fresh acknowledgment',recheck_ack)
    def path_quote():
        click('[data-command="cmd-023"]');fill('#param-DIR','-delete');assert page.locator('#copy-command').is_disabled();fill('#param-DIR',"/tmp/a'b;id");contains(v('#command-preview'),"'\"'\"'");click('#modal [data-close]')
    check('Reject option-like paths and quote shell metacharacters',path_quote)
    def create_custom():
        click('#add-command');fill('#custom-title','내 점검 <img src=x onerror=alert(1)>');fill('#custom-body',"printf '%s\\n' 'hello'");fill('#custom-note','샘플 메모');click('#custom-save');fill('#command-query','내 점검');equal(page.locator('#command-list [data-command^="custom-"]').count(),1);equal(page.locator('#command-list img').count(),0)
    check('Custom command creation and inert HTML text',create_custom)
    go('encoding')
    def encoding_cp949():
        page.locator('#encoding-file').set_input_files({'name':'cp949-test.txt','mimeType':'text/plain','buffer':'한글 갂 똠 테스트\r\n'.encode('cp949')})
        page.locator('#file-charset').select_option('euc-kr');expect(page.locator('#encoding-output')).to_have_value(re.compile('똠'));equal(v('#encoding-output'),'한글 갂 똠 테스트\n');click('#encoding-bom');equal(download('#encoding-save'),b'\xef\xbb\xbf'+'한글 갂 똠 테스트\r\n'.encode())
    check('CP949 extended Hangul file decode and UTF8 BOM export',encoding_cp949)
    def encoding_utf16():
        page.locator('#encoding-file').set_input_files({'name':'utf16.txt','mimeType':'text/plain','buffer':'한글 UTF16'.encode('utf-16')})
        expect(page.locator('#encoding-output')).to_have_value('한글 UTF16');equal(v('#file-charset'),'utf-16le')
    check('UTF16 BOM autodetection',encoding_utf16)
    def unavailable_decoder_export():
        limited=context.new_page();limited.set_content(HTML,wait_until='load')
        limited.locator('#sidebar [data-go="encoding"]').click()
        limited.locator('#encoding-file').set_input_files({'name':'input.txt','mimeType':'text/plain','buffer':b'original'})
        expect(limited.locator('#encoding-output')).to_have_value('original')
        limited.evaluate("() => {window.__decoder=TextDecoder;window.TextDecoder=class {constructor(label,opts){if(label==='euc-kr')throw new Error('decoder unavailable');return new window.__decoder(label,opts)}}}")
        limited.locator('#file-charset').select_option('euc-kr')
        downloads=[];limited.on('download',lambda d:downloads.append(d))
        limited.locator('#encoding-save').click();limited.wait_for_timeout(150)
        equal(len(downloads),0);expect(limited.locator('#encoding-output')).to_have_value('')
        limited.evaluate('() => { window.TextDecoder=window.__decoder; }')
        limited.locator('#encoding-file').set_input_files({'name':'empty.txt','mimeType':'text/plain','buffer':b''})
        expect(limited.locator('#encoding-file-status')).to_contain_text('읽었습니다')
        with limited.expect_download() as d: limited.locator('#encoding-save').click()
        equal(Path(d.value.path()).read_bytes(),b'');limited.close()
    check('Decoder failure cannot export empty output; valid empty file can (decoder double)',unavailable_decoder_export)
    check('Mojibake repair sample',lambda:(click('#repair-sample'),click('#repair-run'),contains(v('#repair-output'),'안녕하세요')))
    check('Lossy replacement string rejected',lambda:(fill('#repair-input','�'),click('#repair-run'),equal(v('#repair-output'),''),contains(txt('#repair-status'),'복구할 수 없습니다')))
    go('codec')
    for mode in ['url','base64','hex','unicode','html']:
        def codec_case(m=mode):
            page.locator('#codec-mode').select_option(m);fill('#codec-input','한글😀 & <hello>');click('#codec-encode');click('#codec-swap');click('#codec-decode');equal(v('#codec-output'),'한글😀 & <hello>')
        check('Codec UI roundtrip '+mode,codec_case)
    def rejected_codec():
        page.locator('#codec-mode').select_option('hex');fill('#codec-input','ZZ');click('#codec-decode');equal(v('#codec-output'),'');contains(txt('#codec-status'),'HEX')
    check('Codec UI error clears previous output',rejected_codec)
    def codec_exact_endings():
        page.locator('#codec-mode').select_option('hex')
        fill('#codec-input','41 0D 0A 42 0D 43')
        click('#codec-decode')
        equal(download('[data-download-id="codec-output"]'), b'A\r\nB\rC')
        click('#codec-swap')
        click('#codec-encode')
        equal(v('#codec-output'),'41 0D 0A 42 0D 43')
        fill('#codec-input','A\nB')
        equal(v('#codec-output'),'')
        click('#codec-encode')
        equal(v('#codec-output'),'41 0A 42')
    check('Codec output download and swap keep CRLF and CR until the input is edited',codec_exact_endings)
    go('json')
    check('JSON UI large integer token preservation',lambda:(click('#json-sample'),click('#json-pretty'),contains(v('#json-output'),'900719925474099312345'),contains(v('#json-output'),'1.2300')))
    check('JSON invalid input error',lambda:(fill('#json-input','{"a":}'),click('#json-pretty'),equal(v('#json-output'),''),contains(txt('#json-status'),'오류')))
    def validate_without_expansion():
        fill('#json-input','['*160+','.join(['0']*4000)+']'*160)
        click('#json-validate');contains(txt('#json-status'),'검증 통과');equal(v('#json-output'),'')
    check('JSON validation avoids unnecessary pretty-print output expansion',validate_without_expansion)
    fill('#json-input','{"session":"DO_NOT_PERSIST_INPUT_MARKER"}');click('#json-pretty');go('home');go('json')
    check('Inputs survive tool navigation in memory',lambda:contains(v('#json-input'),'DO_NOT_PERSIST_INPUT_MARKER'))
    check('Editing JSON source invalidates the previous result',lambda:(fill('#json-input','{"edited":1}'),equal(v('#json-output'),'')))
    go('text')
    def text_download():
        fill('#text-input',' a \n\na\nb');page.locator('#text-eol').select_option('crlf');click('#text-run');equal(v('#text-output'),'a\nb');equal(download('[data-download-id="text-output"]'),b'a\r\nb')
    check('Text dedupe and actual CRLF download',text_download)
    go('diff')
    check('Diff UI marks additions and deletions',lambda:(click('#diff-sample'),click('#diff-run'),contains(txt('#diff-status'),'변경점'),equal(page.locator('.diff-line.add').count(),4),equal(page.locator('.diff-line.del').count(),3)))
    check('Diff input edits invalidate previous comparison',lambda:(fill('#diff-before','a'),equal(page.locator('.diff-line').count(),0)))
    go('logs')
    def logs_case():
        click('#logs-sample');page.locator('#logs-context').select_option('1');click('#logs-run');contains(v('#logs-output'),'DataService');contains(txt('#logs-status'),'출력')
    check('Log fixed-string matching with context',logs_case)
    go('sql')
    check('SQL quote escaping and dedupe UI',lambda:(click('#sql-sample'),click('#sql-run'),contains(v('#sql-output'),"O''Brien"),contains(txt('#sql-status'),'5개 값')))
    check('SQL 1001 values generate OR groups',lambda:(fill('#sql-input','\n'.join(str(i) for i in range(1001))),click('#sql-run'),contains(v('#sql-output'),'\nOR\n'),contains(txt('#sql-status'),'2개 IN')))
    check('SQL rejects ambiguous backslash and clears previous output',lambda:(fill('#sql-input',"\\' OR 1=1 --"),click('#sql-run'),equal(v('#sql-output'),''),contains(txt('#sql-status'),'역슬래시')))
    go('unicode')
    check('Invisible character inspection',lambda:(click('#unicode-sample'),contains(txt('#unicode-table'),'ZERO WIDTH SPACE'),contains(txt('#unicode-table'),'NBSP')))
    check('ASCII 0..127',lambda:(click('#unicode-ascii'),equal(page.locator('#unicode-table tbody tr').count(),128)))
    check('Reverse Unicode codes',lambda:(click('#unicode-decode'),equal(v('#unicode-decoded'),'A한글😀')))
    check('Surrogate scalar rejected',lambda:(fill('#unicode-codes','U+D800'),click('#unicode-decode'),equal(v('#unicode-decoded'),''),contains(txt('#unicode-code-status'),'스칼라')))
    go('time')
    check('Epoch0 KST and UTC output',lambda:(fill('#time-epoch','0'),click('#time-from-epoch'),contains(v('#time-output'),'1970-01-01 09:00:00'),contains(v('#time-output'),'1970-01-01 00:00:00')))
    go('chmod')
    check('Chmod calculator and warning',lambda:(fill('#chmod-octal','755'),contains(v('#chmod-output'),'chmod 755'),equal(txt('#chmod-symbol'),'rwxr-xr-x'),fill('#chmod-octal','777'),contains(txt('#chmod-status'),'신중')))
    go('cron')
    check('Cron explicit KST future dates',lambda:(fill('#cron-expression','0 9 * * *'),page.locator('#cron-start').evaluate("el=>el.value='2026-10-03T09:00:00'"),click('#cron-run'),contains(txt('#cron-output'),'2026-10-04 09:00:00'),contains(txt('#cron-status'),'5회')))
    check('Cron invalid sixth field rejected',lambda:(fill('#cron-expression','* * * * * *'),click('#cron-run'),contains(txt('#cron-status'),'5필드')))
    go('hash')
    def hash_availability():
        fill('#hash-input','abc');click('#hash-text');page.wait_for_timeout(100)
        if page.evaluate('!!crypto.subtle'):
            equal(v('#hash-output'),hashlib.sha256(b'abc').hexdigest())
        else:
            contains(txt('#hash-status'),'Web Crypto를 사용할 수 없습니다');equal(v('#hash-output'),'')
    check('Hash computes or explicitly reports missing WebCrypto',hash_availability)
    go('regex')
    def regex_sample():
        click('#regex-sample');click('#regex-run');expect(page.locator('#regex-output')).to_have_value(re.compile(r'^\['));equal(len(json.loads(v('#regex-output'))),2)
    check('Regex actual Worker matching',regex_sample)
    def regex_unicode():
        fill('#regex-input','😀');fill('#regex-pattern','(?:)');fill('#regex-flags','gu');click('#regex-run');expect(page.locator('#regex-output')).to_have_value(re.compile(r'^\['));equal([x['index'] for x in json.loads(v('#regex-output'))],[0,2])
    check('Regex zero-width Unicode matches terminate',regex_unicode)
    def regex_timeout():
        fill('#regex-input','a'*32+'!');fill('#regex-pattern','(a+)+$');fill('#regex-flags','g');click('#regex-run');expect(page.locator('#regex-status')).to_contain_text('1.2초',timeout=5000);equal(v('#regex-output'),'');click('#theme-toggle')
    check('Regex catastrophic backtracking killed; UI responsive',regex_timeout)
    def regex_output_budget():
        fill('#regex-input','a'*200000);fill('#regex-pattern','(?=(.*))');fill('#regex-flags','g');click('#regex-run')
        expect(page.locator('#regex-output')).to_have_value(re.compile(r'^\['),timeout=5000)
        assert len(v('#regex-output'))<=500000
        contains(txt('#regex-status'),'500,000자')
        click('#theme-toggle')
    check('Regex capture amplification stops at a bounded output size',regex_output_budget)
    def regex_empty_captures_budget():
        fill('#regex-input','a'*1000);fill('#regex-pattern','()'*300+'a');fill('#regex-flags','g');click('#regex-run')
        expect(page.locator('#regex-status')).to_contain_text('500,000자')
        output=v('#regex-output')
        assert 0 < len(json.loads(output)) < 1000 and len(output) <= 500000
    check('Serialized regex output includes structural overhead in its size cap', regex_empty_captures_budget)
    def regex_stale_error():
        fill('#regex-input','a'*32+'!');fill('#regex-pattern','(a+)+$');fill('#regex-flags','g');click('#regex-run')
        fill('#regex-pattern','a');click('#regex-run')
        expect(page.locator('#regex-output')).to_have_value(re.compile(r'^\['))
        result=v('#regex-output');page.wait_for_timeout(1400)
        equal(v('#regex-output'),result);assert '1.2초' not in txt('#regex-status')
    check('Outdated regex errors cannot replace a newer result',regex_stale_error)
    def palette():
        page.keyboard.press('Control+k');fill('#palette-input','JSON');contains(txt('#palette-results'),'JSON');page.keyboard.press('Enter');contains(txt('#view h1'),'JSON')
    check('Keyboard command palette',palette)
    go('codec')
    page.locator('#codec-mode').select_option('base64');fill('#codec-input','복사 확인');click('#codec-encode')
    def manual_copy():
        page.evaluate("document.execCommand=()=>false;Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})")
        click('[data-copy-id="codec-output"]');equal(page.locator('#modal[open]').count(),1);contains(txt('#modal'),'Ctrl');click('#modal [data-close]')
    check('Clipboard failure offers manual selected text',manual_copy)
    def simulated_copy():
        page.evaluate("document.execCommand=()=>{window.__copied=document.activeElement.value;return true}")
        click('[data-copy-id="codec-output"]');equal(page.evaluate('window.__copied'),v('#codec-output'))
    check('Clipboard fallback payload (test double)',simulated_copy)
    def clear_pending_copy_and_search():
        go('codec');fill('#codec-input','private-fixture');click('#codec-encode')
        page.keyboard.press('Control+k');fill('#palette-input','fixture-private-query');page.keyboard.press('Escape')
        page.evaluate("""() => {
            Object.defineProperty(window,'isSecureContext',{configurable:true,value:true});
            Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>new Promise((_,reject)=>window.rejectCopy=reject)}});
            document.execCommand=()=>false;
        }""")
        click('[data-copy-id="codec-output"]');click('#clear-all-button')
        page.evaluate("async()=>{window.rejectCopy(new Error('test'));await Promise.resolve()}")
        equal(v('#palette-input'),''); equal(page.locator('#palette-results').text_content(),'')
        equal(page.locator('#modal[open]').count(),0)
        page.evaluate("delete window.isSecureContext; delete navigator.clipboard")
    check('Clear also removes palette history and cancels late copy fallback (clipboard double)',clear_pending_copy_and_search)
    def format_sql_flow():
        go('home');click('[data-open-sql-db="cubrid"]');expect(page.locator('[data-sql-db="cubrid"]')).to_have_attribute('aria-pressed','true')
        click('#sqlformat-sample');click('#sqlformat-run')
        sample=v('#sqlformat-output');assert sample and '\n' in sample
        fill('#sqlformat-input',"select '한글, FROM', 900719925474099312345 from sample_items where id = 1;")
        equal(v('#sqlformat-output'),'');click('#sqlformat-run')
        output=v('#sqlformat-output')
        contains(output,"'한글, FROM'");contains(output,'900719925474099312345')
        with page.expect_download() as result: click('[data-download-id="sqlformat-output"]')
        assert result.value.suggested_filename.endswith('.sql')
        equal(Path(result.value.path()).read_bytes(), output.encode('utf-8'))
        fill('#sqlformat-input',"select 'unclosed");click('#sqlformat-run')
        equal(v('#sqlformat-output'),'');assert txt('#sqlformat-status')
    check('SQL formatter sample, preserved literals, UTF8 SQL download and stale result clearing',format_sql_flow)
    # Exercise real menu and modal events. Only the clipboard sink is a test double.
    flow=context.new_page()
    flow.set_default_timeout(4000)
    accept_replacement=lambda dialog:dialog.accept()
    flow.on('dialog',accept_replacement)
    flow.set_content(HTML,wait_until='load')
    locator=flow.locator
    sql_input=locator('#sqlformat-input')
    sql_copy=locator('[data-copy-id="sqlformat-output"]')
    review=locator('#sql-review-preview')
    confirm_review=locator('#sql-review-confirm')
    def open_csql_preset(command_id,from_detail=False):
        locator('#sidebar [data-go="commands"]').click()
        locator('[data-command-domain="db"]').click()
        locator('[data-command-db="cubrid"]').click()
        scope=locator('#command-list')
        if from_detail:
            scope.locator(f'[data-command="{command_id}"]').click()
            scope=locator('#modal')
        scope.locator(f'[data-open-sql-preset="{command_id}"]').click()

    def record_copies():
        flow.evaluate("""() => {
            window.copiedSql = [];
            Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
            document.execCommand = () => { window.copiedSql.push(document.activeElement.value); return true; };
        }""")

    def copy_edited_presets():
        record_copies()
        for number,verb in enumerate(['SELECT','INSERT','UPDATE','DELETE'],132):
            open_csql_preset(f'cmd-{number}',from_detail=verb=='UPDATE')
            draft=sql_input.input_value()
            assert draft.startswith(verb) and 'pocket_ops_sample' in draft
            expect(sql_input).to_be_focused()
            equal(sql_input.evaluate('el=>el.value.slice(el.selectionStart,el.selectionEnd)'),'pocket_ops_sample')
            sql_input.press_sequentially('fixture_items')
            edited=sql_input.input_value().replace('1001','8032')
            assert 'fixture_items' in edited and 'pocket_ops_sample' not in edited
            sql_input.fill(edited)
            sql_copy.click()
            final_sql=locator('#sqlformat-output').input_value()
            equal(' '.join(final_sql.split()),' '.join(edited.split()))
            if verb!='SELECT':
                expect(review).to_have_value(final_sql)
                equal(len(flow.evaluate('window.copiedSql')),number-132)
                confirm_review.click()
            equal(flow.evaluate('window.copiedSql')[-1],final_sql)
            expect(locator('#modal')).not_to_be_visible()
    check('Edited SELECT copies directly; each DML preset reviews the final edited text before copying',copy_edited_presets)

    def review_follows_current_text():
        record_copies()
        open_csql_preset('cmd-132')
        source="/* SELECT is a comment */ UPDATE fixture_items SET item_name='한글' WHERE item_id=8032;"
        sql_input.fill(source)
        sql_copy.click()
        before=review.input_value()
        contains(before,'WHERE item_id=8032;')
        locator('#sql-review-edit').click()
        expect(sql_input).to_be_focused()
        equal(flow.evaluate('window.copiedSql'),[])
        edited=source.replace('8032','8040')
        sql_input.fill(edited)
        sql_copy.click()
        # An open review is not authorization to emit a query after its source changes.
        sql_input.evaluate("""el => {
            el.value=el.value.replace('8040','8050'); el.dispatchEvent(new Event('input',{bubbles:true}));
        }""")
        if confirm_review.is_visible() and confirm_review.is_enabled():
            confirm_review.click()
        equal(flow.evaluate('window.copiedSql'),[])
        if locator('#modal').is_visible(): locator('#modal [data-close]').click()
        sql_copy.click()
        actual=review.input_value()
        contains(actual,'WHERE item_id=8050;')
        confirm_review.click()
        equal(flow.evaluate('window.copiedSql'),[actual])
        locator('[data-download-id="sqlformat-output"]').click()
        expect(review).to_have_value(actual)
        with flow.expect_download() as saved: confirm_review.click()
        equal(saved.value.suggested_filename,'pocket-query.sql')
        equal(Path(saved.value.path()).read_bytes(),actual.encode('utf-8'))
    check('Editing SELECT into UPDATE rechecks the current SQL, including on file export',review_follows_current_text)

    def canceled_replacement_and_manual_copy():
        original=sql_input.input_value()
        assert original.strip()
        flow.remove_listener('dialog',accept_replacement)
        flow.once('dialog',lambda dialog:dialog.dismiss())
        try:
            open_csql_preset('cmd-135')
        finally:
            flow.on('dialog',accept_replacement)
        locator('#sidebar [data-go="sqlformat"]').click()
        expect(sql_input).to_have_value(original)
        flow.evaluate('document.execCommand=()=>false')
        sql_copy.click()
        text=review.input_value()
        equal(locator('#manual-copy').count(),0)
        confirm_review.click()
        expect(locator('#manual-copy')).to_have_value(text)
    check('Declining a preset preserves the draft; manual clipboard fallback receives only confirmed SQL',canceled_replacement_and_manual_copy)

    def dialect_review():
        if locator('#modal').is_visible(): locator('#modal [data-close]').click()
        record_copies()
        status=locator('#sqlformat-status')
        locator('#sidebar [data-go="commands"]').click()
        locator('[data-command-domain="db"]').click();locator('[data-command-db="mariadb"]').click()
        locator('#command-list [data-open-sql-preset="cmd-134"]').click()
        expect(locator('[data-sql-db="mariadb"]')).to_have_attribute('aria-pressed','true')
        # Removing the WHERE clause turns the preset into a full-table change.
        sql_input.fill("UPDATE fixture_items SET item_name = 'ALL';")
        sql_copy.click()
        contains(locator('#sql-review-checks').inner_text(),'WHERE 조건이 없습니다')
        contains(locator('#modal').inner_text(),'MariaDB>');contains(locator('#sql-review-flow').inner_text(),'START TRANSACTION')
        expect(confirm_review).to_be_disabled()
        equal(flow.evaluate('window.copiedSql'),[])
        reviewed=review.input_value()
        locator('#sql-review-ack').check();expect(confirm_review).to_be_enabled();confirm_review.click()
        equal(flow.evaluate('window.copiedSql'),[reviewed])
        # Changing the DB drops output checked under the previous DB's rules.
        locator('#sqlformat-run').click();assert locator('#sqlformat-output').input_value()
        locator('[data-sql-db="oracle"]').click()
        equal(locator('#sqlformat-output').input_value(),'');contains(status.inner_text(),'Oracle')
        sql_input.fill("UPDATE fixture_items SET item_name = 'A&B'\n\nWHERE item_id = 1;")
        sql_copy.click()
        equal(locator('#modal[open]').count(),0);contains(status.inner_text(),'SQL*Plus');equal(locator('#sqlformat-output').input_value(),'')
        equal(flow.evaluate('window.copiedSql'),[reviewed])
        sql_input.fill("UPDATE fixture_items SET item_name = 'A&B' WHERE item_id = 1;")
        locator('[data-download-id="sqlformat-output"]').click()
        contains(locator('#sql-review-checks').inner_text(),'SET DEFINE OFF');expect(confirm_review).to_be_enabled()
        saved_sql=review.input_value()
        with flow.expect_download() as saved: confirm_review.click()
        equal(Path(saved.value.path()).read_bytes(),saved_sql.encode('utf-8'))
        # Locking SELECT and psql variables are reviewed instead of copied at once.
        locator('[data-sql-db="postgresql"]').click()
        sql_input.fill('SELECT * FROM fixture_items WHERE item_id = :id FOR UPDATE;')
        sql_copy.click()
        checks=locator('#sql-review-checks').inner_text();contains(checks,'잠그는');contains(checks,'psql')
        equal(len(flow.evaluate('window.copiedSql')),1)
        locator('#sql-review-edit').click()
        sql_input.fill('SELECT item_id FROM fixture_items WHERE item_id = 1;');sql_copy.click()
        equal(flow.evaluate('window.copiedSql')[-1],locator('#sqlformat-output').input_value())
        equal(locator('#modal[open]').count(),0)
        locator('[data-sql-db="cubrid"]').click()
        # Cancelling a preset from the MariaDB-filtered list changes neither the draft nor the selected DB.
        draft=sql_input.input_value()
        flow.remove_listener('dialog',accept_replacement);flow.once('dialog',lambda dialog:dialog.dismiss())
        try:
            locator('#sidebar [data-go="commands"]').click()
            expect(locator('[data-command-db="mariadb"]')).to_have_attribute('aria-pressed','true')
            locator('#command-list [data-open-sql-preset="cmd-133"]').click()
        finally:
            flow.on('dialog',accept_replacement)
        locator('#sidebar [data-go="sqlformat"]').click()
        equal(sql_input.input_value(),draft);expect(locator('[data-sql-db="cubrid"]')).to_have_attribute('aria-pressed','true')
    check('DB choice drives paste target and checks; WHERE-less change needs explicit acknowledgment and delivers the reviewed text',dialect_review)
    flow.close()
    go('settings')
    go('json');fill('#json-input','{"session":"DO_NOT_PERSIST_INPUT_MARKER"}');go('settings')
    def backup():
        data=download('#settings-export');obj=json.loads(data);assert b'DO_NOT_PERSIST_INPUT_MARKER' not in data;equal(len(obj['customCommands']),1);equal(obj['customCommands'][0]['risk'],'custom')
    check('Settings backup excludes working inputs',backup)
    def clean_release():
        # Changing inert DOM content after startup must not change the closed-over recipe.
        page.evaluate("document.getElementById('release-data').content.textContent='PRIVATE_DOM_MARKER'")
        data=download('#release-download')
        version=page.evaluate('PocketBuild.version')
        equal(data,(ROOT/('pocket-ops-v'+version+'.zip')).read_bytes())
        assert b'DO_NOT_PERSIST_INPUT_MARKER' not in data
        assert b'PRIVATE_DOM_MARKER' not in data
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            equal(z.testzip(),None)
            equal(z.read('pocket-ops.html'),(ROOT/'pocket-ops.html').read_bytes())
            equal(set(z.namelist()),{'pocket-ops.html','START_HERE.txt','README_KO.md','CHANGELOG.md'})
            reopened=context.new_page()
            reopened.set_content(z.read('pocket-ops.html').decode(),wait_until='load')
            with reopened.expect_download() as saved: reopened.locator('#release-download').click()
            equal(Path(saved.value.path()).read_bytes(),data)
            reopened.close()
    check('Release excludes working data and reopens into identical repeatable ZIP',clean_release)
    def invalid_import():
        page.locator('#settings-import').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"version":99}' });expect(page.locator('#settings-status')).to_contain_text('지원하지 않는')
    check('Invalid backup version rejected',invalid_import)
    def import_valid():
        data={'version':1,'theme':'light','toolFavs':['json'],'cmdFavs':[],'customCommands':[{'id':'custom-safe','title':'가져온 명령','command':'echo hello','note':'test','risk':'read','permission':'user'}]}
        page.locator('#settings-import').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page.wait_for_selector('#confirm-import');click('#confirm-import');go('commands');fill('#command-query','가져온 명령');click('[data-command="custom-safe"]');assert page.locator('#copy-command').is_disabled();contains(txt('#modal'),'검증하지 않았습니다');click('#modal [data-close]')
    check('Imported commands cannot claim trusted read-only risk',import_valid)
    def imported_markup_on_dashboard():
        hostile='<img src=x onerror="window.__owned=1">FAKE_IMPORT_MARKER'
        data={'version':1,'theme':'light','toolFavs':['json'],'cmdFavs':['custom-markup'],'customCommands':[{'id':'custom-markup','title':hostile,'command':'echo "<script>window.__owned=1</script>"','note':hostile}]}
        go('settings');page.locator('#settings-import').set_input_files({'name':'markup.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
        page.wait_for_selector('#confirm-import');click('#confirm-import')
        go('home');contains(txt('#home-fav-commands'),hostile);equal(page.locator('#view img, #view script').count(),0)
        click('#home-fav-commands [data-command="custom-markup"]');equal(v('#command-preview'),data['customCommands'][0]['command'])
        expect(page.locator('#copy-command')).to_be_disabled();equal(page.locator('#modal img').count(),0);click('#modal [data-close]')
        page.keyboard.press('Control+k');fill('#palette-input','FAKE_IMPORT_MARKER');equal(page.locator('#palette img').count(),0);page.keyboard.press('Escape')
        equal(page.evaluate('window.__owned||0'),0)
    check('Imported command markup stays text on the dashboard, dialog and search',imported_markup_on_dashboard)
    go('settings')
    check('Clear inputs preserves settings, clears working text',lambda:(click('#clear-inputs'),go('json'),equal(v('#json-input'),'')))
    # Actual responsive layout in the same browser, no CSS modifications.
    go('home')
    def dashboard():
        # The import test above replaced the favorites; star one command through the normal UI first.
        go('commands');fill('#command-query','')
        if page.locator('[data-cmd-star="cmd-001"]').get_attribute('aria-pressed')!='true': click('[data-cmd-star="cmd-001"]')
        go('home')
        favs=page.evaluate("[...document.querySelectorAll('#home-fav-commands [data-command]')].map(b=>b.dataset.command)")
        assert favs, 'dashboard lists favorite commands'
        for cid in favs: contains(page.locator('#home-fav-commands .dash-row').filter(has=page.locator(f'[data-command="{cid}"]')).inner_text(),'입력:')
        assert page.locator('#home-fav-tools [data-go]').count()>0
        assert not page.locator('.all-tools').evaluate('el=>el.open'), 'full tool grid starts folded'
        page.locator('#home-fav-commands [data-command]').first.click();assert v('#command-preview');click('#modal [data-close]')
        for domain,label in [('windows','PowerShell'),('linux','SSH')]:
            go('home');click(f'[data-open-domain="{domain}"]')
            equal(page.locator('[data-command-domain].active').get_attribute('data-command-domain'),domain);contains(txt('#command-domain-guide'),label)
        go('home');click('[data-open-domain="db"]');contains(txt('#command-domain-guide'),'csql>')
        page.locator('#command-list [data-cmd-star]').first.click()
        go('favorites');assert page.locator('.tool-card').count()>0;assert page.locator('.command-card').count()>0
        go('home');click('[data-open-sql-db="postgresql"]')
        expect(page.locator('[data-sql-db="postgresql"]')).to_have_attribute('aria-pressed','true')
        contains(txt('#sql-db-where'),'psql =>');contains(txt('#sql-steps [data-sql-step="connect"]'),'Linux 셸')
        contains(txt('#sql-steps [data-sql-step="finish"]'),'psql =>')
        click('#sql-steps [data-command="cmd-150"]');fill('#param-DBUSER','reader');fill('#param-DBNAME','appdb')
        equal(v('#command-preview'),"PGOPTIONS='-c default_transaction_read_only=on' psql -h '127.0.0.1' -U 'reader' -d 'appdb'")
        click('#modal [data-close]');click('[data-sql-db="cubrid"]')
    check('Dashboard gathers favorites, opens each work environment and starts the SQL workbench per DB',dashboard)
    GUIDES=page.evaluate('PocketData.guides')
    GUIDE_ORDER=page.evaluate("['home','favorites'].concat(PocketData.tools.map(t=>t.id),'settings')")
    def wait_value(element_id,want):
        page.wait_for_function("([id,want])=>{const el=document.getElementById(id);if(!el)return false;const v=el.value!==undefined?el.value:el.textContent;return v===want;}",arg=[element_id,want],timeout=4000)
    def usage_guides():
        equal(sorted(GUIDES),sorted(GUIDE_ORDER));equal(len(GUIDE_ORDER),18)
        for route in GUIDE_ORDER:
            g=GUIDES[route];go(route)
            # The link sits in the title row, the first block of every screen, inside the first viewport.
            button=page.locator('#view > section > .page-title:first-child [data-guide="'+route+'"]')
            expect(button).to_be_visible()
            box=button.bounding_box();assert box and box['y']+box['height']<=page.viewport_size['height']/2, route+': 사용 예시 is not at the top'
            button.click();expect(page.locator('#modal[open]')).to_have_count(1)
            contains(txt('#modal .dialog-head h2'),'사용 예시')
            equal(page.locator('#modal .guide-steps li').count(),len(g['steps']));equal(v('#guide-switch'),route)
            ex=g.get('example')
            if ex:
                equal(page.locator('#guide-example-input').text_content(),ex['input'])
                equal(page.locator('#guide-example-output').text_content(),ex['output'])
            runnable=bool(ex and ('fill' in ex or 'click' in ex))
            equal(page.locator('#guide-try').count(),1 if runnable else 0)
            if not runnable:
                click('#modal [data-close]');continue
            click('#guide-try')
            if route=='home':
                expect(page.locator('#palette[open]')).to_have_count(1);page.keyboard.press('Escape');continue
            if route=='commands':
                equal(v('#command-query'),'포트');contains(page.locator('#command-list .command-card').first.inner_text(),'포트');continue
            expect(page.locator('#modal[open]')).to_have_count(0)
            if route=='hash' and not page.evaluate('!!crypto.subtle'):
                # set_content is not a secure context; the file:// evidence run computes the real hash.
                expect(page.locator('#hash-status')).to_contain_text('Web Crypto');equal(v('#hash-output'),'');continue
            # The example runs through the screen's own fields and buttons and must show what the guide promises.
            if ex.get('result'):
                try: wait_value(ex['result'],ex.get('expect',ex['output']))
                except Exception as e: raise AssertionError(route+' result '+repr(page.evaluate("id=>{const el=document.getElementById(id);return el.value!==undefined?el.value:el.textContent}",ex['result']))) from e
            if ex.get('status'):
                assert 'error' not in (page.locator('#'+ex['status']).get_attribute('class') or ''), route+': '+txt('#'+ex['status'])
    check('Every screen has 사용 예시 at the top; each guide opens and its example reproduces the shown result',usage_guides)
    def guide_switch_and_keyboard():
        go('json');page.keyboard.press('?')
        expect(page.locator('#modal[open]')).to_have_count(1);equal(v('#guide-switch'),'json')
        page.locator('#guide-switch').select_option('cron')
        contains(txt('#modal .dialog-head h2'),'크론 미리보기');expect(page.locator('#guide-switch')).to_be_focused()
        click('#guide-open');expect(page.locator('#modal[open]')).to_have_count(0);contains(txt('#page-crumb'),'크론')
        # Text the user typed is never replaced silently by an example.
        go('json');fill('#json-input','{"mine":1}');click('#view [data-guide="json"]')
        contains(txt('#guide-overwrite'),'JSON 원문');contains(txt('#guide-try'),'입력을 예시로 바꾸고')
        page.keyboard.press('Escape');expect(page.locator('#modal[open]')).to_have_count(0);equal(v('#json-input'),'{"mine":1}')
        click('#view [data-guide="json"]');click('#guide-try');wait_value('json-output',GUIDES['json']['example']['output'])
        click('#view [data-guide="json"]');page.screenshot(path=str(PREVIEWS/'preview-guide.png'),full_page=False);click('#modal [data-close]')
    check('Guide switches screens, opens with ? and warns before replacing typed input',guide_switch_and_keyboard)
    def toast_above_dialog():
        # Found in the evidence screenshots: the copy confirmation sat under the dialog's blurred backdrop.
        go('commands');click('[data-command-domain=""]');page.locator('#command-favorites').uncheck();fill('#command-query','특정 포트 리스닝')
        page.locator('#command-list [data-command="cmd-044"]').first.click()
        page.evaluate("document.execCommand=()=>{window.__copied=document.activeElement.value;return true}")
        click('#copy-command');expect(page.locator('#toast')).to_have_class(re.compile('show'))
        equal(page.evaluate('window.__copied'),'ss -lnt "( sport = :8080 )"')
        page.wait_for_timeout(250)
        # Shown as a popover after the modal opened, so it is above the dialog in the top layer (hit testing
        # cannot prove this: the toast has pointer-events:none and is inert behind a modal).
        on_top=page.evaluate("(()=>{const t=document.getElementById('toast'),r=t.getBoundingClientRect();return document.getElementById('modal').open&&t.matches(':popover-open')&&r.bottom<=innerHeight&&r.top>innerHeight/2&&r.width>0})()")
        assert on_top, 'copy toast is not in the top layer at the bottom of the screen'
        page.screenshot(path=str(PREVIEWS/'preview-toast-over-dialog.png'),full_page=False)
        click('#modal [data-close]')
    check('Copy confirmation is drawn above an open dialog at the bottom of the screen',toast_above_dialog)
    def large_backup_roundtrip():
        go('settings')
        data={'version':1,'theme':'light','toolFavs':['json'],'cmdFavs':['custom-large-0'],
              'customCommands':[{'id':'custom-large-'+str(i),'title':'긴 명령 '+str(i),'command':'가'*8000,'note':'용량 회귀 검사'} for i in range(100)]}
        raw=json.dumps(data,ensure_ascii=False).encode();assert len(raw)>2*1024*1024
        page.locator('#settings-import').set_input_files({'name':'large.json','mimeType':'application/json','buffer':raw})
        page.wait_for_selector('#confirm-import');click('#confirm-import')
        exported=download('#settings-export');saved=json.loads(exported)
        equal(len(saved['customCommands']),100);equal(saved['customCommands'][0]['command'],'가'*8000)
        page.locator('#settings-import').set_input_files({'name':'roundtrip.json','mimeType':'application/json','buffer':exported})
        page.wait_for_selector('#confirm-import');click('#confirm-import')
        click('#settings-reset')
    check('Valid backup larger than 2MiB exports and imports without loss',large_backup_roundtrip)
    page.set_viewport_size({'width':390,'height':844})
    for route in ['home','commands','encoding','unicode','sql','settings']:
        def mobile_layout(r=route):
            go(r);assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), 'Horizontal page overflow'
        check('Mobile 390px layout '+route,mobile_layout)
    go('home');page.screenshot(path=str(PREVIEWS/'preview-mobile.png'),full_page=False)
    page.set_viewport_size({'width':1440,'height':1050})
    def menu_resize_focus():
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#mobile-menu').click();expect(page.locator('#mobile-close')).to_be_focused()
        page.set_viewport_size({'width':1440,'height':1050})
        expect(page.locator('#sidebar .nav-btn.active')).to_be_focused()
        assert not page.locator('.main').evaluate('el=>el.inert')
        assert not page.locator('#sidebar').evaluate('el=>el.inert')
        page.set_viewport_size({'width':390,'height':844})
        expect(page.locator('#mobile-menu')).to_be_focused()
        assert page.locator('#sidebar').evaluate('el=>el.inert')
        expect(page.locator('#menu-scrim')).to_be_hidden()
        page.set_viewport_size({'width':1440,'height':1050})
    check('Resizing between mobile drawer and desktop restores visible keyboard focus',menu_resize_focus)
    # Touch/viewport emulation checks layout and browser behavior, not a real Galaxy file viewer.
    mobile_viewports=[(320,740),(360,800),(412,915),(844,390)]
    mobile_routes=['home','commands','encoding','codec','json','text','diff','logs','sql','sqlformat','unicode','time','chmod','cron','hash','regex','settings','favorites']
    for width,height in mobile_viewports:
        touch=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=2.625,
                                  is_mobile=True,has_touch=True,offline=True,accept_downloads=True)
        touch.on('request',lambda r:requests.append(r.url))
        phone=touch.new_page();phone.set_default_timeout(4000)
        phone.on('pageerror',lambda e:errors.append(str(e)))
        phone.set_content(HTML,wait_until='load')
        def phone_go(route):
            if phone.locator('#modal[open]').count(): phone.locator('#modal [data-close]').tap()
            if phone.locator('#palette[open]').count(): phone.locator('#palette-close').tap()
            menu=phone.locator('#mobile-menu')
            if menu.is_visible() and menu.get_attribute('aria-expanded')!='true': menu.tap()
            phone.locator('#sidebar [data-go="'+route+'"]').first.tap()
        def phone_overflow():
            assert phone.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), 'Horizontal page overflow'
            equal(phone.evaluate('window.innerWidth'),width)
        def touch_routes():
            for route in mobile_routes:
                phone_go(route);equal(phone.locator('#view h1').count(),1)
                try: phone_overflow()
                except AssertionError as e: raise AssertionError(route+': '+str(e)) from e
        check(f'Touch {width}x{height}: all 18 routes fit viewport',touch_routes)
        def touch_guides():
            for route in ['home','commands','sqlformat','logs','settings']:
                phone_go(route)
                link=phone.locator('#view .page-title [data-guide]');expect(link).to_be_visible()
                box=link.bounding_box();assert box['y']+box['height']<=height, route+': 사용 예시 below the first screen'
                link.tap();expect(phone.locator('#modal[open]')).to_have_count(1)
                assert phone.evaluate("(()=>{const d=document.getElementById('modal');return d.scrollWidth<=d.clientWidth+1&&d.getBoundingClientRect().right<=innerWidth+1})()"),route+': guide overflows'
                phone.locator('#modal [data-close]').tap()
        check(f'Touch {width}x{height}: 사용 예시 on the first screen and the guide fits',touch_guides)
        def touch_menu():
            phone_go('home')
            menu=phone.locator('#mobile-menu');expect(menu).to_be_visible()
            for close in ['#mobile-close','#menu-scrim']:
                menu.tap();expect(menu).to_have_attribute('aria-expanded','true')
                expect(phone.locator('#menu-scrim')).to_be_visible()
                assert phone.locator('.main').evaluate('el=>el.inert')
                close_button=phone.locator(close)
                if close=='#menu-scrim': close_button.tap(position={'x':width-8,'y':height/2})
                else: close_button.tap()
                expect(menu).to_have_attribute('aria-expanded','false')
                expect(phone.locator('#menu-scrim')).to_be_hidden()
                assert not phone.locator('.main').evaluate('el=>el.inert')
                assert phone.locator('#sidebar').evaluate('el=>el.inert')
                expect(menu).to_be_focused()
            phone_go('json');expect(menu).to_have_attribute('aria-expanded','false')
            expect(phone.locator('#menu-scrim')).to_be_hidden()
        check(f'Touch {width}x{height}: drawer closes by button, backdrop and navigation',touch_menu)
        def touch_search():
            phone.locator('.topbar [data-open-palette]').tap()
            close=phone.locator('#palette-close');expect(close).to_be_visible()
            box=close.bounding_box();assert box['width']>=44 and box['height']>=44
            assert box['y']>=0 and box['y']+box['height']<=height+1
            phone.locator('#palette-input').fill('JSON')
            contains(phone.locator('#palette-results').inner_text(),'JSON')
            close.tap();equal(phone.locator('#palette[open]').count(),0)
            phone.locator('.topbar [data-open-palette]').tap()
            phone.locator('#palette-input').fill('JSON')
            phone.locator('#palette-results .palette-item').first.tap()
            contains(phone.locator('#view h1').inner_text(),'JSON')
            phone_overflow()
        check(f'Touch {width}x{height}: search opens, closes and selects without keyboard',touch_search)
        def touch_readability():
            for route in ['json','commands','cron','sql','sqlformat']:
                phone_go(route)
                bad=phone.locator('#view input:not([type=checkbox]):not([type=file]), #view select, #view textarea').evaluate_all(
                    'els=>els.filter(el=>el.getClientRects().length&&parseFloat(getComputedStyle(el).fontSize)<16).map(el=>el.id)')
                equal(bad,[])
            phone_go('commands')
            assert phone.locator('.command-card pre').first.evaluate('el=>parseFloat(getComputedStyle(el).fontSize)')>=14
            phone.locator('[data-command="cmd-001"]').tap()
            assert phone.locator('#command-preview').evaluate('el=>parseFloat(getComputedStyle(el).fontSize)')>=14
            for selector in ['#copy-command','#modal [data-close]']:
                box=phone.locator(selector).bounding_box();assert box['width']>=44 and box['height']>=44
            phone_overflow();phone.locator('#modal [data-close]').tap()
        check(f'Touch {width}x{height}: readable fields, commands and 44px primary targets',touch_readability)
        def touch_command_copy():
            phone_go('commands')
            phone.evaluate("document.execCommand=()=>false;Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})")
            phone.locator('[data-command="cmd-001"]').tap()
            equal(phone.locator('#command-preview').input_value(),'cat /etc/os-release')
            phone.locator('#copy-command').tap()
            expect(phone.locator('#manual-copy')).to_have_value('cat /etc/os-release')
            contains(phone.locator('#modal').inner_text(),'길게')
            phone_overflow();phone.locator('#modal [data-close]').tap()
            phone.locator('[data-command="cmd-018"]').tap()
            expect(phone.locator('#copy-command')).to_be_disabled()
            phone.locator('#param-PID').fill('1234');expect(phone.locator('#copy-command')).to_be_disabled()
            phone.locator('#command-ack').check();expect(phone.locator('#copy-command')).to_be_enabled()
            phone.locator('#param-PID').fill('1234;id');expect(phone.locator('#copy-command')).to_be_disabled()
            phone.locator('#modal [data-close]').tap()
        check(f'Touch {width}x{height}: command copy fallback and safety gates (clipboard double)',touch_command_copy)
        def touch_sql_workbench():
            phone_go('home')
            phone.locator('[data-open-sql-db="oracle"]').tap();phone_overflow()
            phone.locator('#sql-steps [data-open-sql-preset="cmd-135"]').tap()
            phone.evaluate("document.execCommand=()=>false;Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})")
            phone.locator('[data-copy-id="sqlformat-output"]').tap()
            contains(phone.locator('#modal').inner_text(),'SQL>');contains(phone.locator('#sql-review-checks').inner_text(),'pocket_ops_sample')
            box=phone.locator('#sql-review-confirm').bounding_box();assert box['height']>=44
            reviewed=phone.locator('#sql-review-preview').input_value()
            phone.locator('#sql-review-confirm').tap()
            expect(phone.locator('#manual-copy')).to_have_value(reviewed)
            phone_overflow();phone.locator('#modal [data-close]').tap()
            phone_go('commands')
            assert phone.locator('.command-card .where-tag').first.evaluate('el=>parseFloat(getComputedStyle(el).fontSize)')>=13
        check(f'Touch {width}x{height}: SQL workbench preset, Oracle review and blocked-clipboard manual copy',touch_sql_workbench)
        if width==360:
            phone_go('commands')
            phone.locator('#command-query').fill('포트')
            phone.screenshot(path=str(PREVIEWS/'preview-galaxy-commands.png'),full_page=False,animations='disabled')
        if width==844:
            phone_go('home')
            phone.screenshot(path=str(PREVIEWS/'preview-mobile-landscape.png'),full_page=False,animations='disabled')
        touch.close()
    # Native HTML must remain useful in file previewers that disable JavaScript.
    for width,height in [(360,800),(1440,1050)]:
        nojs=browser.new_context(viewport={'width':width,'height':height},java_script_enabled=False,
                                 has_touch=True,is_mobile=width<800,offline=True)
        nojs.on('request',lambda r:requests.append(r.url))
        reader=nojs.new_page();reader.set_default_timeout(4000)
        reader.set_content(HTML,wait_until='load')
        reference=reader.locator('#offline-reference')
        def static_reference():
            expect(reference).to_be_visible()
            contains(reference.inner_text(),'읽기 전용 명령어 참고')
            equal(reference.locator('.reference-command').count(),CATALOG_SIZE)
            equal(reference.locator('.reference-where').count(),CATALOG_SIZE)
            expect(reader.locator('.layout')).to_be_hidden()
            for domain in ['windows','linux','db']:
                assert reference.locator('#reference-'+domain+' .reference-command').count()>0
            content=reference.text_content()
            for text in ['cat /etc/os-release','PowerShell','실제 변경','권한','{{PID}}','--no-auto-commit',';autocommit','-- DELETE FROM pocket_ops_sample','입력: csql>','입력: MariaDB>','EXIT ROLLBACK']:
                contains(content,text)
            # No injected script/evaluate is used in this JS-disabled context.
            equal(reference.locator('button, input, textarea, select').count(),0)
        check(f'JavaScript disabled {width}px: all {CATALOG_SIZE} commands, paste targets and risk guidance remain readable',static_reference)
        def static_reference_layout():
            for domain in ['windows','linux','db']:
                reference.locator('nav a[href="#reference-'+domain+'"]').tap()
                expect(reference.locator('#reference-'+domain+' h2')).to_be_in_viewport()
            for selector in ['#offline-reference','.reference-command','.reference-command pre']:
                for entry in reader.locator(selector).all():
                    box=entry.bounding_box();assert box is not None, selector+' is hidden'
                    assert box['x']>=-1 and box['x']+box['width']<=width+1, selector+' exceeds viewport'
            reference.locator('header').scroll_into_view_if_needed()
            if width==360:
                reader.screenshot(path=str(PREVIEWS/'preview-mobile-nojs.png'),full_page=False,animations='disabled')
        check(f'JavaScript disabled {width}px: native reference fits viewport',static_reference_layout)
        nojs.close()
    def blocked_script_reference():
        # A viewer that alters or blocks the inline script must still show the read-only reference.
        blocked=context.new_page();blocked.set_default_timeout(4000)
        blocked.set_content(HTML.replace("'use strict';","'use strict'; ",1),wait_until='load')
        expect(blocked.locator('#offline-reference')).to_be_visible()
        expect(blocked.locator('.layout')).to_be_hidden()
        contains(blocked.locator('#offline-reference').inner_text(),'차단')
        equal(blocked.locator('#offline-reference .reference-command').count(),CATALOG_SIZE)
        blocked.close()
        expect(page.locator('#offline-reference')).to_be_hidden()
        expect(page.locator('.layout')).to_be_visible()
    check('Blocked inline script shows the read-only reference instead of an empty app',blocked_script_reference)
    # Settings persistence test doubles are separate from real origin tests above.
    normal=context.new_page();normal.set_default_timeout(4000)
    normal.evaluate("""() => { const m=new Map();window.__store=m;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}); }""")
    normal.set_content(HTML,wait_until='load')
    normal.locator('#theme-toggle').click()
    def storage_double():
        state=json.loads(normal.evaluate("__store.get('pocket-ops:v1')"));equal(state['theme'],'dark');equal(set(state),{'version','theme','toolFavs','cmdFavs','customCommands'})
    check('Settings-only storage writes (test double)',storage_double)
    def missing_crypto():
        limited=context.new_page()
        limited.evaluate("Object.defineProperty(window,'crypto',{configurable:true,value:undefined})")
        limited.set_content(HTML,wait_until='load')
        limited.locator('#sidebar [data-go="settings"]').click()
        contains(limited.locator('#view').inner_text(),'Web Crypto')
        assert limited.locator('#view h1').count()==1
        limited.close()
    check('Missing Crypto does not prevent settings and backup access',missing_crypto)
    normal.locator('#theme-toggle').click()
    normal.screenshot(path=str(PREVIEWS/'preview-desktop.png'),full_page=False,animations='disabled')
    normal.set_viewport_size({'width':390,'height':844})
    normal.screenshot(path=str(PREVIEWS/'preview-mobile.png'),full_page=False,animations='disabled')
    normal.set_viewport_size({'width':1440,'height':1050})
    normal.locator('#sidebar [data-go="commands"]').click();normal.locator('#command-query').fill('포트')
    normal.screenshot(path=str(PREVIEWS/'preview-commands.png'),full_page=False,animations='disabled')
    normal.locator('#sidebar [data-go="encoding"]').click();normal.locator('#repair-sample').click();normal.locator('#repair-run').click()
    normal.screenshot(path=str(PREVIEWS/'preview-encoding.png'),full_page=False,animations='disabled')
    normal.locator('#theme-toggle').click();normal.locator('#sidebar [data-go="json"]').click();normal.locator('#json-sample').click();normal.locator('#json-pretty').click()
    normal.screenshot(path=str(PREVIEWS/'preview-dark.png'),full_page=False,animations='disabled')
    file_smoke={'status':'not_run'}
    local=context.new_page()
    try:
        local.goto((ROOT/'pocket-ops.html').as_uri(),wait_until='load')
    except Exception as e:
        if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(e): raise
        file_smoke={'status':'blocked_by_policy','reason':str(e).splitlines()[0]}
    else:
        file_smoke={'status':'opened','capabilities':local.evaluate('({secureContext:isSecureContext,webCrypto:!!crypto.subtle,worker:!!window.Worker,protocol:location.protocol})')}
        def local_file_flow():
            local.locator('#sidebar [data-go="hash"]').click()
            local.locator('#hash-input').fill('abc');local.locator('#hash-text').click()
            expect(local.locator('#hash-output')).to_have_value(hashlib.sha256(b'abc').hexdigest())
            with local.expect_download() as d: local.locator('#release-download').click()
            with zipfile.ZipFile(d.value.path()) as z:
                target=ROOT/'.test-artifacts'/'reopened'/'pocket-ops.html'
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read('pocket-ops.html'))
            local.goto(target.as_uri(),wait_until='load')
            local.locator('#sidebar [data-go="json"]').click();local.locator('#json-sample').click();local.locator('#json-pretty').click()
            expect(local.locator('#json-output')).to_have_value(re.compile('900719925474099312345'))
            local.locator('#theme-toggle').click();theme=local.evaluate('document.documentElement.dataset.theme')
            local.reload(wait_until='load');equal(local.evaluate('document.documentElement.dataset.theme'),theme)
            file_smoke['download_reopen_hash_storage_reload']='passed'
        check('Local file open, real SHA256, ZIP save/reopen and storage reload',local_file_flow)
    local.close()
    check('No uncaught browser errors across all tested pages',lambda:equal(errors,[]))
    external=[u for u in requests if u.startswith(('http:','https:'))]
    check('Zero HTTP(S) requests across full offline workflow and reopened pages',lambda:equal(external,[]))
    report={'browser':browser.version,'capabilities':capabilities,'method':'Offline set_content plus separate local file smoke; browser policy unchanged','file_smoke':file_smoke,'mobile':'Chromium touch/mobile emulation at 320x740, 360x800, 412x915 and 844x390; not real Galaxy hardware, Android content:// handlers, OS clipboard or download integration.','storage_clipboard':'Main persistence and clipboard payload checks use explicitly labeled doubles. File smoke storage, when available, uses real origin and reload, not OS clipboard or browser restart.','external_http_requests':external,'pageerrors':errors,'total':len(RESULTS),'passed':sum(x['pass'] for x in RESULTS),'failed':sum(not x['pass'] for x in RESULTS),'results':RESULTS}
    (ROOT/'tests/browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('BROWSER SUMMARY',report['passed'],'passed,',report['failed'],'failed')
    browser.close()
    if report['failed']: raise SystemExit(1)
