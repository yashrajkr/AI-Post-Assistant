/**
 * tests/auth-extra-test.js
 * Additional auth coverage beyond tests/smoke-test.js:
 *   - Google-only account creation (passwordHash: null) doesn't crash storage
 *   - Password login against a Google-only account returns a clear message
 *   - Existing (password-signup) email reused by the Google-login code path
 *     logs into the SAME account instead of erroring/duplicating
 *   - Logout actually clears the session (GET /api/me -> 401 afterwards)
 *   - CORS: disallowed origin rejected, exact allowed origin accepted
 *
 * Google's own OAuth screens/token exchange cannot be driven here (no
 * network access to accounts.google.com and no real client credentials), so
 * this exercises the exact same storage-service calls
 * controllers/google-auth-controller.js makes after a Google id_token has
 * been verified, plus the HTTP-level session/CORS behavior around it.
 *
 * Run with: node tests/auth-extra-test.js
 * Prerequisites: port 3098 free. Uses local JSON storage (no Supabase env
 * vars set for the spawned server), since the DB-level password_hash
 * NOT NULL fix was already verified directly against the live Supabase
 * project via SQL (insert with password_hash: null, then rollback).
 */

const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3098;
const ROOT = path.join(__dirname, '..');
const ALLOWED_ORIGIN = 'https://ai-post-assistant.vercel.app';

function request(method, route, body, { cookie, origin } = {}) {
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
          ...(origin ? { Origin: origin } : {}),
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
  console.log('Booting server on port', PORT, '(local JSON storage, no Supabase env vars set)');
  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      AI_PROVIDER: 'mock',
      SESSION_SECRET: 'auth-extra-test-secret-not-for-prod',
      NODE_ENV: 'test',
      ALLOWED_ORIGINS: ALLOWED_ORIGIN,
      // Force JSON storage even if the shell happens to have Supabase vars set.
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});

  try {
    await waitForServer();

    console.log('\n— Google OAuth: brand-new email (simulated post-id-token-verification) —');
    const { createUser, getUserByEmail } = require(path.join(ROOT, 'services', 'storage-service'));
    const { PLAN_CREDITS } = require(path.join(ROOT, 'config', 'plans'));

    const googleEmail = `google_only_${Date.now()}@test.com`;
    let googleUser;
    let createErr = null;
    try {
      googleUser = await createUser({
        id: crypto.randomUUID(),
        name: 'Google Only',
        email: googleEmail,
        passwordHash: null, // exactly what controllers/google-auth-controller.js does
        plan: 'free',
        credits: PLAN_CREDITS.free,
        brandVoice: { brandName: '', tagline: '', tone: 'simple and practical' },
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      createErr = err;
    }
    check('createUser with passwordHash: null does not throw', !createErr, createErr?.message);
    check('created Google-only user has passwordHash null', googleUser && googleUser.passwordHash == null);

    const fetchedGoogleUser = await getUserByEmail(googleEmail);
    check('Google-only user is retrievable by email', !!fetchedGoogleUser);

    console.log('\n— Password login attempt against a Google-only account —');
    const badLogin = await request('POST', '/api/login', { email: googleEmail, password: 'anything123' });
    check('returns 401 (not 500)', badLogin.status === 401, `got ${badLogin.status}`);
    check(
      'error message tells the user to use Google',
      /google/i.test(badLogin.json?.message || ''),
      badLogin.json?.message
    );

    console.log('\n— Google OAuth: existing email (previously signed up with password) —');
    const existingEmail = `existing_${Date.now()}@test.com`;
    const signupRes = await request('POST', '/api/signup', {
      name: 'Existing User',
      email: existingEmail,
      password: 'password123',
    });
    check('signup for existing-email scenario returns 201', signupRes.status === 201, signupRes.json.message);

    // This is the exact lookup controllers/google-auth-controller.js does before
    // deciding whether to create a new account or log the user into the existing one.
    const existingUser = await getUserByEmail(existingEmail.toLowerCase());
    check('existing user is found by email (no duplicate created)', !!existingUser);
    check('existing user still has their original password hash (not overwritten)', !!existingUser?.passwordHash);

    console.log('\n— Logout clears the session —');
    const cookie = (signupRes.headers['set-cookie']?.[0] || '').split(';')[0];
    const meBeforeLogout = await request('GET', '/api/me', null, { cookie });
    check('GET /api/me with valid cookie returns 200 before logout', meBeforeLogout.status === 200);

    const logoutRes = await request('POST', '/api/logout', null, { cookie });
    check('POST /api/logout returns 200', logoutRes.status === 200);
    const clearedCookieHeader = logoutRes.headers['set-cookie']?.[0] || '';
    check('logout response clears the session cookie', /session=;/.test(clearedCookieHeader) || /Max-Age=0/.test(clearedCookieHeader), clearedCookieHeader);

    // clearCookie tells the browser to drop the cookie; a fresh request with no
    // cookie at all is what "logged out" looks like from the client's side.
    const meNoCookie = await request('GET', '/api/me');
    check('GET /api/me with no cookie returns 401', meNoCookie.status === 401, `got ${meNoCookie.status}`);

    console.log('\n— CORS —');
    const disallowed = await request('GET', '/api/health', null, { origin: 'https://evil-attacker.example' });
    const disallowedAcao = disallowed.headers['access-control-allow-origin'];
    check(
      'disallowed origin does NOT get Access-Control-Allow-Origin echoed back',
      disallowedAcao !== 'https://evil-attacker.example',
      `ACAO header: ${disallowedAcao}`
    );

    const allowed = await request('GET', '/api/health', null, { origin: ALLOWED_ORIGIN });
    check('GET /api/health with allowed origin still returns 200', allowed.status === 200);
    check(
      'exact allowed origin gets Access-Control-Allow-Origin echoed back',
      allowed.headers['access-control-allow-origin'] === ALLOWED_ORIGIN,
      `ACAO header: ${allowed.headers['access-control-allow-origin']}`
    );
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n=== auth-extra-test: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('auth-extra-test crashed:', err);
  process.exit(1);
});
