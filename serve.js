const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  if (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
  console.error('Server process exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('Server process rejection:', reason);
});

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const LIVE_TV_BACKEND = 'https://livetgtv.lovable.app';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const INJECTED_PLAYER_HEAD = `
<style id="cinevo-player-style">
  /* Cinevo Auto-Hide Idle Player Layout */
  .cinevo-idle .player-controls,
  .cinevo-idle .player-zoom,
  .cinevo-idle [class*="player-controls"],
  .cinevo-idle [role="group"][aria-label*="zoom"],
  .cinevo-idle [role="group"][aria-label*="Video zoom"],
  .cinevo-idle div[class*="from-player-shade"],
  .cinevo-idle .player-watermark,
  .cinevo-idle [class*="player-watermark"],
  .cinevo-idle a[aria-label*="TGFLIX"],
  .cinevo-idle [aria-label*="Discord"] {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translateY(14px) !important;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .cinevo-idle [role="group"][aria-label*="zoom"],
  .cinevo-idle [role="group"][aria-label*="Video zoom"],
  .cinevo-idle div[class*="from-player-shade"] {
    transform: translateY(-14px) !important;
  }
  .cinevo-idle,
  .cinevo-idle *,
  .cinevo-idle video {
    cursor: none !important;
  }
  /* Smooth reappear transition */
  .player-controls,
  .player-zoom,
  [class*="player-controls"] {
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  /* Modern Cinevo Aesthetic for embed */
  .player-controls {
    background: rgba(8, 9, 13, 0.88) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(214, 245, 120, 0.22) !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.75) !important;
  }
  .player-zoom {
    background: rgba(8, 9, 13, 0.88) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(214, 245, 120, 0.22) !important;
  }
  [aria-label="Go live"] {
    background: linear-gradient(135deg, #d6f578 0%, #a3e635 100%) !important;
    color: #08090d !important;
    font-weight: 800 !important;
  }
</style>
<script id="cinevo-idle-controller">
(function() {
  let timer = null;
  function setIdle(idle) {
    if (idle) {
      document.documentElement.classList.add('cinevo-idle');
      if (document.body) document.body.classList.add('cinevo-idle');
    } else {
      document.documentElement.classList.remove('cinevo-idle');
      if (document.body) document.body.classList.remove('cinevo-idle');
    }
  }

  function showControls() {
    setIdle(false);
    if (timer) clearTimeout(timer);
    // Don't auto-hide if a server or quality menu dropdown is currently open
    const hasOpenMenu = document.querySelector('[role="menu"], [data-radix-popper-content-wrapper], [role="dialog"], [data-state="open"]');
    if (hasOpenMenu) return;
    timer = setTimeout(() => {
      const hasMenu = document.querySelector('[role="menu"], [data-radix-popper-content-wrapper], [role="dialog"], [data-state="open"]');
      if (hasMenu) return;
      setIdle(true);
    }, 2500);
  }

  const events = ['mousemove', 'pointermove', 'touchstart', 'touchend', 'touchmove', 'keydown', 'click'];
  events.forEach(evt => {
    window.addEventListener(evt, () => {
      showControls();
      try { window.parent?.postMessage({ type: 'cinevo:active' }, '*'); } catch(e) {}
    }, { passive: true, capture: true });
    document.addEventListener(evt, () => {
      showControls();
      try { window.parent?.postMessage({ type: 'cinevo:active' }, '*'); } catch(e) {}
    }, { passive: true, capture: true });
  });

  window.addEventListener('message', e => {
    if (!e.data) return;
    if (e.data.type === 'cinevo:active' || e.data.type === 'cinevo:ping') {
      showControls();
    } else if (e.data.type === 'cinevo:idle') {
      const v = document.querySelector('video');
      if (!v || !v.paused) {
        setIdle(true);
      }
    } else if (e.data.type === 'cinevo:enter-fullscreen') {
      const vid = document.querySelector('video');
      if (vid && vid.webkitEnterFullscreen) {
        try { vid.webkitEnterFullscreen(); } catch(err) {}
      } else if (vid && vid.requestFullscreen) {
        try { vid.requestFullscreen(); } catch(err) {}
      }
    }
  });

  document.addEventListener('play', showControls, true);
  document.addEventListener('pause', () => setIdle(false), true);
  document.addEventListener('playing', showControls, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showControls);
  } else {
    showControls();
  }
})();
</script>
`;

function proxyLiveRequest(req, res) {
  const targetUrl = new URL(req.url, LIVE_TV_BACKEND);
  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host,
      origin: LIVE_TV_BACKEND,
      referer: LIVE_TV_BACKEND + '/',
      'accept-encoding': 'identity' // request uncompressed so we can safely inspect & patch HTML/JS
    }
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');
    const isTgPlayer = req.url.includes('TgPlayer-') && req.url.endsWith('.js');

    if (isHtml || isTgPlayer) {
      const chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        let body = Buffer.concat(chunks).toString('utf8');

        if (isHtml) {
          body = body.includes('</head>')
            ? body.replace('</head>', INJECTED_PLAYER_HEAD + '</head>')
            : body + INJECTED_PLAYER_HEAD;
        } else if (isTgPlayer) {
          // Patch the activeElement check so controls auto-hide even if buttons were tapped/clicked
          body = body.replace(
            /y\.current\?\.contains\(document\.activeElement\)\s*\|\|\s*P\(!1\)/g,
            'P(!1)'
          );
          // Auto-start hide timeout as soon as video plays
          body = body.replace(
            /onPlay:\(\)=>E\(!1\)/g,
            'onPlay:()=>{E(!1);K()}'
          );
          // Patch fullscreen toggle for iPhone Safari compatibility
          body = body.replace(
            /J=\(\)=>\{document\.fullscreenElement\?document\.exitFullscreen\(\):y\.current\?\.requestFullscreen\?\.?\(\)\}/g,
            'J=()=>{let vEl=v.current;if(document.fullscreenElement){try{document.exitFullscreen()}catch(e){}}else if(vEl?.webkitEnterFullscreen){try{vEl.webkitEnterFullscreen()}catch(e){}}else if(y.current?.requestFullscreen){try{y.current.requestFullscreen()}catch(e){}}else if(vEl?.webkitRequestFullscreen){try{vEl.webkitRequestFullscreen()}catch(e){}}else{try{window.parent?.postMessage({type:"cinevo:toggle-fullscreen"},"*")}catch(e){}}}'
          );
        }

        const headers = { ...proxyRes.headers };
        delete headers['content-length'];
        delete headers['content-security-policy'];
        headers['access-control-allow-origin'] = '*';
        headers['content-type'] = isHtml ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8';

        if (!res.headersSent) {
          try {
            res.writeHead(proxyRes.statusCode, headers);
            res.end(body);
          } catch (e) {}
        }
      });
    } else {
      const headers = { ...proxyRes.headers };
      delete headers['content-security-policy'];
      headers['access-control-allow-origin'] = '*';
      if (!res.headersSent) {
        try {
          res.writeHead(proxyRes.statusCode, headers);
        } catch (e) {}
      }
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    console.error('Live TV proxy error:', err.message);
    if (!res.headersSent) {
      try {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy Error');
      } catch (e) {}
    }
  });

  res.on('error', () => {
    try { proxyReq.destroy(); } catch (e) {}
  });

  req.on('error', () => {
    try { proxyReq.destroy(); } catch (e) {}
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Check if this request should be proxied to Live TV backend
  if (
    reqPath.startsWith('/embed/') ||
    reqPath.startsWith('/v2/embed/') ||
    reqPath.startsWith('/assets/') ||
    reqPath.startsWith('/_server-fn/') ||
    reqPath.startsWith('/_serverFn/') ||
    reqPath.startsWith('/__l5e/') ||
    reqPath.startsWith('/~flock') ||
    reqPath.startsWith('/api/')
  ) {
    return proxyLiveRequest(req, res);
  }

  if (reqPath === '/sitemap.xml') {
    const sitemapHandler = require('./api/sitemap.js');
    return sitemapHandler(req, {
      setHeader: (k, v) => res.setHeader(k, v),
      status: (code) => ({
        send: (body) => {
          res.writeHead(code, { 'Content-Type': 'application/xml; charset=utf-8' });
          res.end(body);
        }
      })
    });
  }

  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Cinevo local server running at: http://localhost:${PORT}`);
});
