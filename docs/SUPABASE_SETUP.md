# Supabase Setup

By default this app stores data in local JSON files under `/data` — fine for
local development, **not durable in production** (Render's filesystem is
ephemeral; a redeploy wipes `/data`). Connecting Supabase switches to real
persistent Postgres storage automatically — no code changes required.

## 1. Create a project

1. Go to <https://supabase.com> → New project.
2. Wait for provisioning (~2 minutes).
3. Project Settings → API → copy:
   - **Project URL**
   - **anon public key**
   - **service_role key** (server-only, never expose to the frontend)

## 2. Run the schema

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the full contents of `docs/SUPABASE_SCHEMA.sql` from this project.
3. Run it. This creates all 14 tables (`users`, `generations`, `schedules`,
   `feedback`, `payments`, `subscriptions`, `brand_brains`, `ai_memories`,
   `prompts`, `image_analyses`, `campaigns`, `calendars`, `document_analyses`,
   `brand_health_snapshots`) with Row Level Security policies already
   included in the file.

## 3. Set environment variables

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Restart the server. The startup log should print:

```text
Database: supabase
```

instead of `Database: json-file (dev only)`.

## 4. Migrating existing local data (optional)

If you already have real users/generations in the local `/data/*.json`
files and want to move them into Supabase:

```bash
npm run migrate
```

This runs `scripts/migrate-json-to-supabase.js`, which reads every JSON file
in `/data` and inserts the rows into the matching Supabase table. Review the
script before running it against a production database — it's meant as a
one-time bootstrap, not a sync tool.

## 5. How the fallback works

`services/storage-service.js` checks `usingSupabase()` (from
`config/supabase.js`) on every call. If Supabase keys are present it reads
and writes Postgres; if not, it transparently falls back to the JSON files.
This means:

- You can develop entirely offline with `AI_PROVIDER=mock` and no Supabase
  project at all.
- The moment you add real Supabase keys, the exact same code paths start
  writing to Postgres — nothing else changes.

## 6. Row Level Security

The schema enables RLS on every table and scopes rows to
`auth.uid() = user_id` (or `user_id is null` for public rows, like the seed
prompt library). Because this backend uses its own signed-cookie session
system (not Supabase Auth), API requests go through the **service_role**
client, which bypasses RLS by design — RLS here is your safety net if you
ever expose the **anon** key directly to a client (e.g. a future mobile app
talking to Supabase directly).
