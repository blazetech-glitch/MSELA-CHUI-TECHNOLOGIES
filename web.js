'use strict';

const http = require('node:http');
const { ensureReady, getBackend } = require('./database/db');

const PORT = Number(process.env.PORT) || 3000;
const APP_NAME = 'Zenith MinBot';
const REPOSITORY_URL = 'https://github.com/blazetech-glitch/MSELA-CHUI-TECHNOLOGIES';

async function getStatus() {
  await ensureReady();
  const backend = getBackend() || 'initializing';
  return {
    app: APP_NAME,
    status: 'ok',
    web: 'running',
    whatsapp: 'not started',
    sessionRequiredForWeb: false,
    sessionConfigured: Boolean(process.env.SESSION_ID),
    database: {
      backend,
      persistent: backend === 'pg',
      status: backend === 'pg' ? 'connected' : 'fallback',
    },
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(payload));
}

function renderPage(status) {
  const postgres = status.database.persistent;
  const dbLabel = postgres ? 'PostgreSQL connected' : 'Database not attached';
  const dbDetail = postgres
    ? 'Persistent Heroku Postgres storage is available.'
    : 'The app is using a local JSON fallback. On Heroku that storage is temporary; attach Postgres for persistence.';
  const dbState = postgres ? 'Ready' : 'Needs setup';
  const dbClass = postgres ? 'good' : 'pending';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1020">
  <title>${APP_NAME} · Heroku</title>
  <style>
    :root { color-scheme: dark; --bg:#0b1020; --panel:#121a2b; --line:#26334a; --text:#edf2ff; --muted:#a3afc7; --accent:#70e1c1; --warn:#ffd166; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(ellipse at 75% 0%,#1b3150 0,transparent 42%),var(--bg); color:var(--text); font:16px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { width:min(920px,calc(100% - 32px)); margin:0 auto; padding:48px 0 60px; }
    .brand { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:13px; letter-spacing:.14em; text-transform:uppercase; }
    .mark { display:grid; width:38px; height:38px; place-items:center; border-radius:12px; color:#07111a; font-weight:900; background:linear-gradient(135deg,#70e1c1,#9ee9fb); }
    .hero { padding:64px 0 34px; }
    .eyebrow { color:var(--accent); font-size:12px; font-weight:700; letter-spacing:.17em; text-transform:uppercase; }
    h1 { max-width:700px; margin:12px 0 16px; font-size:clamp(38px,7vw,66px); line-height:1.02; letter-spacing:-.045em; }
    .lead { max-width:650px; color:var(--muted); font-size:18px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; margin-top:28px; }
    .card { border:1px solid var(--line); border-radius:18px; background:rgba(18,26,43,.88); padding:22px; }
    .card h2 { margin:0 0 8px; font-size:14px; color:var(--muted); font-weight:600; }
    .state { display:flex; align-items:center; gap:9px; margin:0 0 8px; font-size:20px; font-weight:700; }
    .state:before { content:""; width:9px; height:9px; border-radius:50%; background:var(--accent); box-shadow:0 0 16px currentColor; }
    .pending:before { background:var(--warn); }
    .detail { margin:0; color:var(--muted); font-size:14px; }
    .note { margin-top:22px; border-left:3px solid var(--accent); background:rgba(112,225,193,.07); padding:14px 17px; color:var(--muted); border-radius:0 12px 12px 0; }
    .links { display:flex; flex-wrap:wrap; gap:12px; margin-top:26px; }
    a.button { display:inline-flex; align-items:center; min-height:44px; padding:0 16px; border-radius:11px; text-decoration:none; font-weight:700; color:#07111a; background:var(--accent); }
    a.text-link { display:inline-flex; align-items:center; color:var(--text); text-decoration:none; padding:0 8px; }
    a:hover { opacity:.82; }
    footer { margin-top:48px; color:#74829b; font-size:13px; }
    code { color:#d6e6ff; }
  </style>
</head>
<body>
  <main>
    <div class="brand"><span class="mark">Z</span><span>Zenith · Heroku app</span></div>
    <section class="hero">
      <div class="eyebrow">Deployment status</div>
      <h1>Your app is ready.</h1>
      <p class="lead">This page runs independently of WhatsApp pairing. The bot worker can remain stopped until you choose to configure and start it.</p>
      <div class="grid">
        <article class="card"><h2>Web app</h2><p class="state">Online</p><p class="detail">The public status page and API are available.</p></article>
        <article class="card"><h2>Database</h2><p class="state ${dbClass}">${dbState}</p><p class="detail">${dbDetail}</p></article>
        <article class="card"><h2>WhatsApp worker</h2><p class="state pending">Stopped</p><p class="detail">A <code>SESSION_ID</code> is not needed for this web page.</p></article>
      </div>
      <div class="note">Status API: <code>/api/status</code> · Health check: <code>/healthz</code></div>
      <div class="links"><a class="button" href="/api/status">View app status</a><a class="text-link" href="${REPOSITORY_URL}" rel="noopener noreferrer">Source code ↗</a></div>
    </section>
    <footer>Zenith MinBot · Hosted on Heroku</footer>
  </main>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET', 'Cache-Control': 'no-store' });
    return res.end('Method not allowed');
  }

  try {
    const status = await getStatus();
    if (pathname === '/healthz' || pathname === '/api/status') {
      return sendJson(res, 200, status);
    }
    if (pathname === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      });
      return res.end(renderPage(status));
    }
    return sendJson(res, 404, { status: 'not_found' });
  } catch (error) {
    console.error('[web] request failed:', error.message);
    return sendJson(res, 503, { status: 'unavailable' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[web] ${APP_NAME} listening on ${PORT}`);
});
