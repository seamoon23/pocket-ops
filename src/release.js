/* Offline release: only the immutable build recipe is packaged, never working data. */
(function () {
'use strict';
const encoded = document.getElementById('release-data').content.textContent.trim();
const bytes = Uint8Array.from(atob(encoded), ch => ch.charCodeAt(0));
const recipe = JSON.parse(new TextDecoder().decode(bytes));
const encoder = new TextEncoder();
window.PocketBuild = Object.freeze({version: recipe.version});

// ZIP's stored method needs no library, compression API, Web Crypto or network.
// This small bundle favors universal Windows extraction over compression ratio.
function crc32(data) {
 let crc = 0xffffffff;
 for (const byte of data) {
  crc ^= byte;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
 }
 return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
 const chunks = [], directory = [];
 let offset = 0, directorySize = 0;
 for (const [filename, text] of files) {
  const name = encoder.encode(filename), data = encoder.encode(text), crc = crc32(data);
  const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
  lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true);
  lv.setUint16(12, 0x5c21, true); // 2026-01-01, deterministic DOS date.
  lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
  lv.setUint16(26, name.length, true); local.set(name, 30);
  chunks.push(local, data);
  const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
  cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
  cv.setUint16(14, 0x5c21, true); cv.setUint32(16, crc, true);
  cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
  cv.setUint16(28, name.length, true); cv.setUint32(38, 0x20, true); cv.setUint32(42, offset, true);
  central.set(name, 46); directory.push(central); directorySize += central.length;
  offset += local.length + data.length;
 }
 const end = new Uint8Array(22), ev = new DataView(end.buffer);
 ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
 ev.setUint32(12, directorySize, true); ev.setUint32(16, offset, true);
 return new Blob([...chunks, ...directory, end], {type: 'application/zip'});
}
window.PocketRelease = Object.freeze({download() {
 const marker = '__RELEASE_' + 'PAYLOAD__';
 const original = recipe.template.replace(marker, encoded);
 const blob = zip([['pocket-ops.html', original], ...Object.entries(recipe.files)]);
 const url = URL.createObjectURL(blob), anchor = document.createElement('a');
 anchor.href = url; anchor.download = 'pocket-ops-v' + recipe.version + '.zip';
 document.body.append(anchor); anchor.click(); anchor.remove();
 setTimeout(() => URL.revokeObjectURL(url), 1500);
}});
})();
