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
        if page.viewport_size['width'] < 800 and page.locator('#mobile-menu').get_attribute('aria-expanded')!='true': page.locator('#mobile-menu').click()
        page.locator('#sidebar [data-go="'+name+'"]').first.click()
    def v(selector): return page.locator(selector).input_value()
    def txt(selector): return page.locator(selector).inner_text()
    def click(selector): page.locator(selector).click()
    def fill(selector,s): page.locator(selector).fill(s)
    def download(selector):
        with page.expect_download() as d: click(selector)
        return Path(d.value.path()).read_bytes()
    check('Home has 14 tools',lambda:equal(page.locator('.tool-card').count(),14))
    check('Unavailable opaque-origin storage is explained',lambda:contains(txt('#storage-warning'),'저장소를 사용할 수 없습니다'))
    for route in ['commands','encoding','codec','json','text','diff','logs','sql','unicode','time','chmod','cron','hash','regex','settings','favorites']:
        check('Route '+route,lambda r=route:(go(r),equal(page.locator('#view h1').count(),1)))
    go('commands')
    check('121 built-in commands visible',lambda:equal(page.locator('.command-card').count(),121))
    def environment_tabs():
        for domain in ['windows','linux','db']:
            click('[data-command-domain="'+domain+'"]')
            expected=page.evaluate('(domain)=>PocketData.commands.filter(c=>c.domain===domain).length',domain)
            equal(page.locator('.command-card').count(),expected)
            assert expected>0
        click('[data-command-domain=""]')
    check('Environment tabs match catalog and expose DB editor guidance',environment_tabs)
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
        assert len(v('#regex-output'))<2200000
        contains(txt('#regex-status'),'500,000자')
        click('#theme-toggle')
    check('Regex capture amplification stops at a bounded output size',regex_output_budget)
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
    go('settings')
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
    go('settings')
    check('Clear inputs preserves settings, clears working text',lambda:(click('#clear-inputs'),go('json'),equal(v('#json-input'),'')))
    # Actual responsive layout in the same browser, no CSS modifications.
    go('home')
    def recommended_tabs():
        click('[data-home-domain="db"]');assert page.locator('#home-cards [data-go="sql"]').count()==1
        click('[data-open-domain="db"]');contains(txt('#command-domain-guide'),'SQL 편집기')
        page.locator('#command-list [data-cmd-star]').first.click()
        go('favorites');assert page.locator('.tool-card').count()>0;assert page.locator('.command-card').count()>0
    check('Recommended tools link to matching environment and shared favorites',recommended_tabs)
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
    report={'browser':browser.version,'capabilities':capabilities,'method':'Offline set_content plus separate local file smoke; browser policy unchanged','file_smoke':file_smoke,'storage_clipboard':'Main persistence and clipboard payload checks use explicitly labeled doubles. File smoke storage, when available, uses real origin and reload, not OS clipboard or browser restart.','external_http_requests':external,'pageerrors':errors,'total':len(RESULTS),'passed':sum(x['pass'] for x in RESULTS),'failed':sum(not x['pass'] for x in RESULTS),'results':RESULTS}
    (ROOT/'tests/browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print('BROWSER SUMMARY',report['passed'],'passed,',report['failed'],'failed')
    browser.close()
    if report['failed']: raise SystemExit(1)
