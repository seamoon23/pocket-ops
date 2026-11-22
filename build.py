#!/usr/bin/env python3
"""Build the offline HTML and the identical ZIP offered by its release button."""
from pathlib import Path
import base64
import hashlib
from html import escape
import io
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
PAYLOAD_MARKER = '__RELEASE_PAYLOAD__'


def render_reference(catalog):
    """Static, escaped catalog for HTML viewers that disable scripting."""
    commands = catalog['commands']
    by_id = {item['id']: item for item in commands}
    risk_labels = {'read': '조회 중심', 'load': '부하 주의', 'change': '실제 변경 · 실행 전 확인'}
    parts = ['''<style>
html:not(.app-ready) .layout,html:not(.app-ready) dialog,html:not(.app-ready) .toast,html:not(.app-ready) #menu-scrim{display:none!important}
html:not(.app-ready) body{overflow:auto!important}
html.app-ready #script-fallback{display:none!important}
#script-fallback{animation:pocket-fallback 0s linear 1.5s both}
@keyframes pocket-fallback{from{visibility:hidden}to{visibility:visible}}
#offline-reference{max-width:960px;margin:auto;padding:24px max(16px,env(safe-area-inset-right)) 40px max(16px,env(safe-area-inset-left));font-size:16px;line-height:1.65;overflow-wrap:anywhere}
#offline-reference h1{font-size:26px;line-height:1.35}#offline-reference h2{font-size:23px;margin-top:32px}#offline-reference h3{font-size:18px;margin:0 0 8px}
#offline-reference a{color:var(--accent);display:inline-flex;align-items:center;min-height:44px;padding:6px 10px;text-decoration:underline}
.reference-command{border:1px solid var(--line);border-radius:12px;padding:16px;margin:14px 0;background:var(--surface)}
.reference-command p{margin:8px 0}.reference-command pre{font:14px/1.7 Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;background:var(--bg);padding:12px;border-radius:8px;user-select:text}
.reference-risk{font-weight:700}.reference-command[data-risk="change"]{border-left:4px solid #bd4937}.reference-command[data-risk="load"]{border-left:4px solid #ad761b}
</style><main id="offline-reference"><header><p>Pocket Ops · 단일 파일 오프라인 참고</p><h1>읽기 전용 명령어 참고</h1>
<p>이 뷰어에서 JavaScript가 꺼져 있거나 차단되어 기본 명령어를 읽는 화면을 표시합니다. 인터넷이나 다른 파일은 필요하지 않습니다.</p>
<p>Windows · PowerShell / Linux · Bash / DB(CUBRID · MariaDB · Oracle · PostgreSQL)별 예제입니다. 각 명령의 <strong>입력</strong> 줄이 붙여넣을 곳(Linux 셸, PowerShell, csql&gt;, MariaDB&gt;, SQL&gt;, psql =&gt;)입니다. 명령어를 실행하지 않습니다. 검색·즐겨찾기·변환·자동 복사·값 검증·배포하기는 사용할 수 없습니다. 텍스트 길게 누르기·선택 복사는 뷰어 지원에 따라 가능합니다.</p>
<p><strong>{{PORT}}, {{PATH}} 같은 표시는 입력 자리입니다. 그대로 실행하거나 단순 치환해 붙여넣지 마세요.</strong> 셸 인용·권한·대상 확인이 필요합니다. 값을 넣어 복사하려면 JavaScript를 지원하는 허용된 브라우저에서 이 파일을 여세요. 부하·변경 명령은 영향과 복구 절차를 먼저 확인하세요.</p>
<nav aria-label="읽기 전용 분류"><a href="#reference-windows">Windows</a><a href="#reference-linux">Linux</a><a href="#reference-db">DB</a></nav></header>''']
    for domain, label in [('windows', 'Windows · PowerShell'), ('linux', 'Linux · Bash'), ('db', 'DB · SQL / 관리 도구')]:
        parts.append('<section id="reference-' + domain + '"><h2>' + label + '</h2>')
        for item in commands:
            if item['domain'] != domain:
                continue
            e = lambda key: escape(str(item[key]), quote=True)
            risk = item['risk']
            parts.append('<article class="reference-command" id="reference-' + e('id') + '" data-risk="' + e('risk') + '">')
            db = catalog.get('dbs', {}).get(item.get('db', ''), {}).get('label', '')
            parts.append('<h3>' + e('title') + '</h3><p>' + e('group') + (' · ' + escape(db) if db and db not in item['group'] else '') + '</p>')
            parts.append('<p class="reference-where"><strong>입력: ' + e('where') + '</strong></p>')
            parts.append('<p class="reference-risk">' + escape(risk_labels.get(risk, '미검증 · 실행 전 확인')) + ' · ' + ('일반 계정 범위' if item['permission'] == 'user' else '권한·환경 제한 확인') + '</p>')
            parts.append('<p>조건: ' + e('prerequisite') + '</p><pre><code>' + e('command') + '</code></pre><p>' + e('note') + '</p>')
            if re.search(r'\{\{[A-Z_]+\}\}', item['command']):
                parts.append('<p><strong>입력 자리 포함: 자동 치환·검증 없이 그대로 실행하지 마세요.</strong></p>')
            alternatives = [by_id[alt] for alt in item['alternatives'] if alt in by_id]
            if alternatives:
                parts.append('<p>대체 명령어: ' + ' / '.join('<a href="#reference-' + escape(alt['id'], quote=True) + '">' + escape(alt['title']) + '</a>' for alt in alternatives) + '</p>')
            parts.append('<a href="#offline-reference">분류로 돌아가기</a></article>')
        parts.append('</section>')
    parts.append('</main>')
    return '\n'.join(parts)


def platform_app(overrides=None):
    """Shared UI with four platform-specific navigation and download bindings."""
    overrides = overrides or {}
    source = (SRC / 'app.js').read_text(encoding='utf-8')
    pattern = r'/\*@platform (\w+)\*/(.*?)/\*@end\*/'
    keys = [key for key, _ in re.findall(pattern, source, re.S)]
    assert sorted(keys) == ['download', 'listen', 'navigate', 'start']
    assert not overrides or set(overrides) == set(keys)
    return re.sub(pattern, lambda m: overrides.get(m[1], m[2]), source, flags=re.S)


def build():
    data = (SRC / 'data.js').read_text(encoding='utf-8')
    catalog = json.loads(data.split(' = ', 1)[1].rstrip().rstrip(';'))
    version = catalog['version']
    styles = (SRC / 'styles.css').read_text(encoding='utf-8')
    script = '\n'.join([(SRC / name).read_text(encoding='utf-8')
                        for name in ('data.js', 'core.js', 'release.js')] + [platform_app()])
    # Never let an embedded JS example terminate the HTML script element.
    script = script.replace('</script', '<\\/script')
    script = re.sub(r'</script', lambda match: '<\\/' + match.group()[2:], script, flags=re.I)
    digest = base64.b64encode(hashlib.sha256(('\n' + script + '\n').encode()).digest()).decode('ascii')
    template = (SRC / 'shell.html').read_text(encoding='utf-8')
    assert template.count('__READ_ONLY_REFERENCE__') == 1
    template = template.replace('__READ_ONLY_REFERENCE__', render_reference(catalog))
    template = template.replace('<script>', '<template id="release-data">' + PAYLOAD_MARKER + '</template>\n<script>')
    template = template.replace('__STYLES__', styles).replace('__SCRIPT__', script).replace('__SCRIPT_HASH__', digest)
    assert template.count(PAYLOAD_MARKER) == 1
    files = {name: (ROOT / name).read_text(encoding='utf-8')
             for name in ('START_HERE.txt', 'README_KO.md', 'CHANGELOG.md')}
    # Reproduce the build without reading live input, settings or rendered DOM.
    payload = base64.b64encode(json.dumps({'version': version, 'template': template, 'files': files},
                                        ensure_ascii=False, separators=(',', ':')).encode()).decode('ascii')
    html = template.replace(PAYLOAD_MARKER, payload).encode('utf-8')
    (ROOT / 'pocket-ops.html').write_bytes(html)
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as bundle:
        for name, content in [('pocket-ops.html', html)] + [(name, text.encode()) for name, text in files.items()]:
            info = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            info.create_system = 0
            info.external_attr = 0x20
            bundle.writestr(info, content)
    release_name = 'pocket-ops-v' + version + '.zip'
    (ROOT / release_name).write_bytes(archive.getvalue())
    sums = ''.join(hashlib.sha256(content).hexdigest() + '  ' + name + '\n'
                   for name, content in [('pocket-ops.html', html), (release_name, archive.getvalue())])
    (ROOT / 'SHA256SUMS.txt').write_bytes(sums.encode('ascii'))
    print('Built pocket-ops.html ({:,} bytes) and {} ({:,} bytes)'.format(len(html), release_name, len(archive.getvalue())))


if __name__ == '__main__':
    build()
