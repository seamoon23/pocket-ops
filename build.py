#!/usr/bin/env python3
"""Build the offline HTML and the identical ZIP offered by its release button."""
from pathlib import Path
import base64
import hashlib
import io
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
PAYLOAD_MARKER = '__RELEASE_PAYLOAD__'


def build():
    data = (SRC / 'data.js').read_text(encoding='utf-8')
    version = json.loads(data.split(' = ', 1)[1].rstrip().rstrip(';'))['version']
    styles = (SRC / 'styles.css').read_text(encoding='utf-8')
    script = '\n'.join((SRC / name).read_text(encoding='utf-8')
                       for name in ('data.js', 'core.js', 'release.js', 'app.js'))
    # Never let an embedded JS example terminate the HTML script element.
    script = script.replace('</script', '<\\/script')
    script = re.sub(r'</script', lambda match: '<\\/' + match.group()[2:], script, flags=re.I)
    digest = base64.b64encode(hashlib.sha256(('\n' + script + '\n').encode()).digest()).decode('ascii')
    template = (SRC / 'shell.html').read_text(encoding='utf-8')
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
