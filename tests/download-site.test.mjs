import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';

// Import the same ES module that Cloudflare Pages deploys without changing repository-wide module settings.
const source = await readFile(new URL('../download-site/_worker.js', import.meta.url));
const worker = (await import('data:text/javascript;base64,' + source.toString('base64'))).default;
const releases = 'https://github.com/seamoon23/pocket-ops/releases';
const request = (path, method = 'GET') => new Request('https://ops.jjunybox.com' + path, {method});

test('permanent HTML and checksum addresses point at the latest release', async () => {
  for (const file of ['pocket-ops.html', 'SHA256SUMS.txt']) {
    const response = await worker.fetch(request('/' + file, 'HEAD'));
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), releases + '/latest/download/' + file);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('one ZIP address follows a new release without a site deployment', async t => {
  let tag;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, releases + '/latest');
    assert.equal(options.redirect, 'manual');
    return Response.redirect(releases + '/tag/' + tag, 302);
  });
  for (tag of ['v0.6.1', 'v1.12.0']) {
    const response = await worker.fetch(request('/pocket-ops.zip'));
    assert.equal(response.headers.get('location'), releases + '/download/' + tag + '/pocket-ops-' + tag + '.zip');
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('unavailable or unexpected releases never redirect to an unrelated file', async t => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => Response.redirect('https://example.org/tag/v1.0.0'));
  assert.equal((await worker.fetch(request('/pocket-ops.zip'))).status, 503);
  upstream.mock.mockImplementation(async () => { throw new Error('offline'); });
  assert.equal((await worker.fetch(request('/pocket-ops.zip'))).status, 503);
  assert.equal((await worker.fetch(request('/pocket-ops.zip', 'POST'))).status, 405);
});
