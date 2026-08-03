/**
 * tests/smoke-test.js
 * Boots the server on a test port and exercises the *public* API surface.
 *
 * Run with:  npm run smoke
 *
 * Auth is now Supabase Auth (see docs/AUTH_SETUP.md) — signup/login/OAuth
 * happen entirely between the browser and Supabase, so there is no
 * `/api/signup` or `/api/login` left on this server to smoke-test without
 * a live Supabase project and a real (or service-role-created) test user.
 * This script therefore covers the routes that don't require a session:
 * health, plans, templates, and that protected routes correctly 401
 * without a token. For a full authenticated run, set SUPABASE_URL/
 * SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY and use the Supabase Admin
 * API (or the dashboard) to create a test user, then adapt this script to
 * sign in with supabase-js and pass the resulting access_token as a
 * Bearer header.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3099;
const ROOT = path.join(__dirname, '..');

function request(method, route, body, bearer) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: route,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = raw ? JSON.parse(raw) : {};
          } catch {
            /* ignore */
          }
          resolve({ status: res.statusCode, headers: res.headers, json, raw });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await request('GET', '/api/health');
      if (res.status === 200) return;
    } catch {
      /* keep waiting */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Server did not start within 10s');
}

let pass = 0;
let fail = 0;
function check(name, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}  ${detail}`);
  }
}

async function main() {
  console.log('Booting server on port', PORT);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      AI_PROVIDER: 'mock',
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {}); // drain
  child.stderr.on('data', () => {});

  try {
    await waitForServer();
    console.log('\n— Health —');
    const h = await request('GET', '/api/health');
    check('GET /api/health returns 200', h.status === 200);
    check('health reports AI provider', h.json.aiProvider === 'mock');

    console.log('\n— Plans + Templates —');
    const p = await request('GET', '/api/plans');
    check('GET /api/plans returns 4 plans', p.json.plans?.length === 4);
    const t = await request('GET', '/api/templates');
    check('GET /api/templates returns list', Array.isArray(t.json.templates) && t.json.templates.length > 0);

    console.log('\n— Auth guard (no Supabase token) —');
    const me = await request('GET', '/api/me');
    check('GET /api/me without a token returns 401', me.status === 401);

    const gen = await request('POST', '/api/generate', { content: 'x', platform: 'Instagram' });
    check('POST /api/generate without a token returns 401', gen.status === 401);

    const bad = await request('GET', '/api/me', null, 'not-a-real-token');
    check('GET /api/me with an invalid Bearer token returns 401', bad.status === 401);

    console.log(
      '\nNote: signup/login/Google OAuth/password reset are Supabase Auth flows ' +
        'run from the browser (see docs/AUTH_SETUP.md) and are not covered by this ' +
        'script. Test them manually against a real Supabase project.'
    );
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n=== Smoke test: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
