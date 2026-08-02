# Deployment Guide

## Local run

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## Recommended first live deployment

Use Render for the current Node version because this project is a simple Node server.

1. Push this folder to GitHub.
2. Create a new Web Service on Render.
3. Build command: leave empty or use `npm install` if needed later.
4. Start command: `node server.js`.
5. Add environment variables from `.env.example`.
6. Set `SESSION_SECRET` to a strong random value.
7. Keep `AI_PROVIDER=mock` first to test live deployment.
8. Later set `AI_PROVIDER=gemini` or `openai` and add the API key.

## Important

The current version uses JSON files in `/data` for local persistence. That is fine for testing, but not enough for real users. Move to Supabase before public launch.
