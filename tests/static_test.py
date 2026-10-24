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
reference=re.search(r'<noscript>([\s\S]*?)</noscript>',html).group(1)
hostile='</code></pre></noscript><img src=x onerror="alert(1)"> & \'quoted\''
fixture=dict(catalog['commands'][0],title=hostile,command=hostile,note=hostile,prerequisite=hostile)
escaped_reference=render_reference({'commands':[fixture]})
escaped_parser=Inspect();escaped_parser.feed(escaped_reference)
checks={
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
}
report={'total':len(checks),'passed':sum(checks.values()),'failed':sum(not x for x in checks.values()),'results':checks}
(ROOT/'tests/static-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Static:',report['passed'],'passed;',report['failed'],'failed')
assert all(checks.values()),checks
