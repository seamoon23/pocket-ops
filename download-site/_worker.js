const releases = 'https://github.com/seamoon23/pocket-ops/releases';

function download(url) {
  return new Response(null, {status: 302, headers: {Location: url, 'Cache-Control': 'no-store'}});
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, {status: 405, headers: {Allow: 'GET, HEAD'}});
    }
    if (path === '/pocket-ops.html' || path === '/SHA256SUMS.txt') {
      return download(releases + '/latest/download' + path);
    }
    if (path !== '/pocket-ops.zip') return env.ASSETS.fetch(request);

    // GitHub's ZIP asset includes the version in its name. Pin the tag and filename together.
    try {
      const latest = await fetch(releases + '/latest', {method: 'HEAD', redirect: 'manual', cache: 'no-store'});
      const location = latest.headers.get('location') || '';
      const tagPrefix = releases + '/tag/';
      if (latest.status >= 300 && latest.status < 400 && location.startsWith(tagPrefix)) {
        const tag = location.slice(tagPrefix.length);
        if (/^v\d+\.\d+\.\d+$/.test(tag)) return download(releases + '/download/' + tag + '/pocket-ops-' + tag + '.zip');
      }
    } catch {
      // The public release list remains a useful fallback when GitHub is temporarily unavailable.
    }
    return new Response(request.method === 'HEAD' ? null :
      '최신 ZIP을 확인할 수 없습니다. 잠시 후 다시 시도하거나 GitHub 릴리스를 확인하세요.\n' + releases + '/latest',
      {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '60'}});
  }
};
