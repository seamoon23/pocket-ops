"""Static artifact validation; Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json, re, zipfile
ROOT=Path(__file__).resolve().parents[1]
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
checks={
    'CSP hash matches embedded script': f"script-src 'sha256-{actual}'" in html,
    'Exactly one self-contained script': html.count('<script>')==1,
    'No remote src or href resource': not p.remote,
    'No inline event attributes': not p.eventattrs,
    'No duplicate shell element IDs': len(p.ids)==len(set(p.ids)),
    'No build placeholders left': not any(x in html for x in ('__STYLES__','__SCRIPT__','__SCRIPT_HASH__')),
    'Network connections explicitly blocked': "connect-src 'none'" in html,
    'No unsafe-eval permission': "'unsafe-eval'" not in html,
    'No font assets': "font-src 'none'" in html,
    'Script element cannot be closed by catalog strings': script.lower().find('</script') == -1,
    'Release recipe reproduces exact build bytes': recipe['template'].replace('__RELEASE_PAYLOAD__',payload).encode()==(ROOT/'pocket-ops.html').read_bytes(),
    'Release archive CRC and HTML bytes match': release_valid,
    'Release contains only reviewed artifact and guides': set(release_names)=={'pocket-ops.html','START_HERE.txt','README_KO.md','CHANGELOG.md'},
    'SHA256SUMS covers matching HTML and ZIP': all(hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for digest,name in (line.split('  ',1) for line in (ROOT/'SHA256SUMS.txt').read_text().splitlines())),
}
report={'total':len(checks),'passed':sum(checks.values()),'failed':sum(not x for x in checks.values()),'results':checks}
(ROOT/'tests/static-results.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Static:',report['passed'],'passed;',report['failed'],'failed')
assert all(checks.values()),checks
