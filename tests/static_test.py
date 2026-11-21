"""Static artifact validation; Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json, re, zipfile, sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from build import render_reference
html=(ROOT/'pocket-ops.html').read_text(encoding='utf-8')
class Inspect(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.remote=[]; self.eventattrs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.append(d['id'])
        if any(k.startswith('on') for k in d): self.eventattrs.append(tag)
        for k in ('src','href'):
            if d.get(k,'').startswith(('http://','https://','//')): self.remote.append(d[k])
p=Inspect();p.feed(html)
script=re.search(r'<script>([\s\S]*?)</script>',html).group(1)
actual=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
payload=re.search(r'<template id="release-data">([^<]+)</template>',html).group(1)
recipe=json.loads(base64.b64decode(payload))
release=ROOT/('pocket-ops-v'+recipe['version']+'.zip')
with zipfile.ZipFile(release) as archive:
    release_valid=archive.testzip() is None and archive.read('pocket-ops.html')==(ROOT/'pocket-ops.html').read_bytes()
    release_names=archive.namelist()
sums=dict(line.split('  ',1)[::-1] for line in (ROOT/'SHA256SUMS.txt').read_text().splitlines())
catalog=json.loads((ROOT/'src/data.js').read_text(encoding='utf-8').split(' = ',1)[1].rstrip().rstrip(';'))
reference=re.search(r'<div id="script-fallback">([\s\S]*?)</div><!-- /script-fallback -->',html).group(1)
hostile='</code></pre></noscript><img src=x onerror="alert(1)"> & \'quoted\''
fixture=dict(catalog['commands'][0],title=hostile,command=hostile,note=hostile,prerequisite=hostile)
escaped_reference=render_reference({'commands':[fixture]})
escaped_parser=Inspect();escaped_parser.feed(escaped_reference)
presets = {item['id']: item for item in catalog['commands'] if 'editorSql' in item}
def valid_editor_preset(item):
    sql = item['editorSql']
    verb = sql.split(maxsplit=1)[0]
    risk = 'read' if verb == 'SELECT' else 'change'
    guarded = '\n'.join('-- ' + line for line in sql.splitlines())
    return (verb in ('SELECT', 'INSERT', 'UPDATE', 'DELETE') and item['risk'] == risk
            and item['shell'] == 'sql' and item['command'] == (guarded if risk == 'change' else sql))

checks={
    'Only four curated CRUD presets have corresponding editor and reference text':
        set(presets) == {'cmd-132', 'cmd-133', 'cmd-134', 'cmd-135'} and all(valid_editor_preset(p) for p in presets.values()),
    'CSP hash matches embedded script': f"script-src 'sha256-{actual}'" in html,
    'Exactly one self-contained script': html.count('<script>')==1,
    'No remote src or href resource': not p.remote,
    'No inline event attributes': not p.eventattrs,
    'No duplicate shell element IDs': len(p.ids)==len(set(p.ids)),
    'No build placeholders left': not any(x in html for x in ('__STYLES__','__SCRIPT__','__SCRIPT_HASH__','__READ_ONLY_REFERENCE__')),
    'Network connections explicitly blocked': "connect-src 'none'" in html,
    'No unsafe-eval permission': "'unsafe-eval'" not in html,
    'No font assets': "font-src 'none'" in html,
    'Script element cannot be closed by catalog strings': script.lower().find('</script') == -1,
    'Release recipe reproduces exact build bytes': recipe['template'].replace('__RELEASE_PAYLOAD__',payload).encode()==(ROOT/'pocket-ops.html').read_bytes(),
    'Release archive CRC and HTML bytes match': release_valid,
    'Release contains only reviewed artifact and guides': set(release_names)=={'pocket-ops.html','START_HERE.txt','README_KO.md','CHANGELOG.md'},
    'SHA256SUMS covers matching HTML and ZIP': set(sums)=={'pocket-ops.html',release.name} and all(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for name,digest in sums.items()),
    'No-script reference contains every curated command once': reference.count('class="reference-command"')==len(catalog['commands']) and all(reference.count('id="reference-'+item['id']+'"')==1 for item in catalog['commands']),
    'No-script reference escapes HTML and retains literal source': hostile not in escaped_reference and not escaped_parser.eventattrs and '&lt;/noscript&gt;&lt;img' in escaped_reference,
    'No-script reference warns about placeholders and change commands': '자동 치환·검증 없이 그대로 실행하지 마세요' in reference and '실제 변경 · 실행 전 확인' in reference,
    # A blocked or failing script must not leave an empty page: the reference is outside <noscript>
    # and is hidden only after the app marks itself ready.
    'Read-only reference shown until the app starts, not only without JavaScript':
        '<noscript>' not in html.split('<div id="script-fallback">',1)[0] and html.count('<div id="script-fallback">')==1
        and 'html.app-ready #script-fallback{display:none!important}' in reference
        and "classList.add('app-ready')" in script and '<noscript><style>#script-fallback{animation:none!important}</style></noscript>' in html,
    'Every reference entry names its paste target':
        reference.count('class="reference-where"')==len(catalog['commands']) and all(item['where'] for item in catalog['commands']),
    'Release ZIP name follows the catalog version':
        release.name=='pocket-ops-v'+catalog['version']+'.zip' and recipe['version']==catalog['version'],
}
report={'total':len(checks),'passed':sum(checks.values()),'failed':sum(not x for x in checks.values()),'results':checks}
(ROOT/'tests/static-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Static:',report['passed'],'passed;',report['failed'],'failed')
assert all(checks.values()),checks
