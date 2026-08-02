/**
 * tests/smoke-test.js
 * Boots the server on a test port, then exercises the API end-to-end.
 *
 * Run with:  npm run smoke
 *
 * Prerequisites:
 *   - AI_PROVIDER=mock (or any provider) in .env
 *   - Port 3099 free
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3099;
const ROOT = path.join(__dirname, '..');

function request(method, route, body, cookie) {
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
          ...(cookie ? { Cookie: cookie } : {}),
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
      SESSION_SECRET: 'smoke-test-secret-not-for-prod',
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

    console.log('\n— Auth —');
    const email = `smoke_${Date.now()}@test.com`;
    const su = await request('POST', '/api/signup', {
      name: 'Smoke Tester',
      email,
      password: 'password123',
    });
    check('POST /api/signup returns 201', su.status === 201, su.json.message);
    check('signup sets session cookie', !!su.headers['set-cookie']);
    const cookie = (su.headers['set-cookie']?.[0] || '').split(';')[0];

    const me = await request('GET', '/api/me', null, cookie);
    check('GET /api/me with cookie returns 200', me.status === 200, me.json.message);

    const du = await request('POST', '/api/signup', { name: 'Dup', email, password: 'password123' });
    check('duplicate signup returns 409', du.status === 409);

    const li = await request('POST', '/api/login', { email, password: 'password123' });
    check('POST /api/login returns 200', li.status === 200);
    const liBad = await request('POST', '/api/login', { email, password: 'wrong' });
    check('login with wrong password returns 401', liBad.status === 401);

    const inv = await request('POST', '/api/signup', { email: 'bad', password: 'x' });
    check('invalid signup returns 400 (Zod)', inv.status === 400);

    console.log('\n— Generate —');
    const g = await request(
      'POST',
      '/api/generate',
      {
        content: 'New JEE 2027 batch starting in Patna',
        platform: 'Instagram',
        niche: 'Coaching',
        language: 'English',
        goal: 'Admissions',
        tone: 'Professional',
        template: 'admission',
        audience: 'JEE aspirants',
        location: 'Patna',
      },
      cookie
    );
    check('POST /api/generate returns 200', g.status === 200, g.json.message);
    check('generation has titles', Array.isArray(g.json.generation?.result?.titles) && g.json.generation.result.titles.length > 0);
    check('generation has captions', Array.isArray(g.json.generation?.result?.captions) && g.json.generation.result.captions.length > 0);
    check('credits decremented', g.json.user?.credits === 9, `got ${g.json.user?.credits}`);

    console.log('\n— History —');
    const hist = await request('GET', '/api/history', null, cookie);
    check('GET /api/history returns 200', hist.status === 200);
    check('history has 1 generation', hist.json.generations?.length === 1);

    console.log('\n— Schedules —');
    const sc = await request(
      'POST',
      '/api/schedules',
      { platform: 'Instagram', content: 'Test post', dateTime: '2026-12-31T18:00' },
      cookie
    );
    check('POST /api/schedules returns 201', sc.status === 201, sc.json.message);
    const scList = await request('GET', '/api/schedules', null, cookie);
    check('GET /api/schedules returns 1', scList.json.schedules?.length === 1);

    console.log('\n— Analytics —');
    const an = await request('GET', '/api/analytics', null, cookie);
    check('GET /api/analytics returns 200', an.status === 200);
    check('analytics has totalGenerations', an.json.analytics?.totalGenerations === 1);

    console.log('\n— Pricing/Razorpay (demo mode) —');
    const co = await request('POST', '/api/create-order', { plan: 'creator' }, cookie);
    check('POST /api/create-order returns 200', co.status === 200, co.json.message);
    check('order has id', !!co.json.order?.id);
    const orderId = co.json.order.id;

    const vp = await request(
      'POST',
      '/api/verify-payment',
      { orderId, paymentId: 'pay_test_123', signature: 'sig_test' },
      cookie
    );
    check('POST /api/verify-payment returns 200', vp.status === 200, vp.json.message);
    check('user upgraded to creator plan', vp.json.user?.plan === 'creator');
    check('credits updated to 100', vp.json.user?.credits === 100);

    console.log('\n— Rate limit (auth) —');
    let rateLimited = false;
    for (let i = 0; i < 8; i++) {
      const r = await request('POST', '/api/login', { email: 'rate@limit.com', password: 'wrong' });
      if (r.status === 429) {
        rateLimited = true;
        break;
      }
    }
    check('repeated failed logins trigger 429', rateLimited);

    console.log('\n— Logout —');
    const lo = await request('POST', '/api/logout', null, cookie);
    check('POST /api/logout returns 200', lo.status === 200);
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
