# Drake Family CommandCentre

Personal health and wellness dashboard for the Drake family.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Local backend**: Express 5 + TypeScript (`server/`)
- **Production backend**: Vercel serverless functions (`api/`)
- **Database**: Supabase Postgres for most features, shared between local dev and production. A local SQLite file (`data/health.db`) is used by a few legacy features (cached Whoop/Renpho/Eight Sleep, reminders, goals, loyalty).

## Development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:6100
- Backend: http://localhost:6101

## Production / Deployment

- **Hosting**: Vercel project `ential/drakefamily`
- **Production URL**: `https://drakefamily-ential.vercel.app` (no custom domain — do **not** assume `family.drake.au` or any other host; verify with `vercel domains ls` if a custom domain is added later)
- **Same Supabase**: local dev and prod use the same `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`, so writing data locally is immediately visible on prod and vice versa.
- **API routing has two implementations** that must be kept in sync:
  - `server/routes/*.ts` — Express routes used by `npm run dev` (local only)
  - `api/**/*.ts` — Vercel serverless functions used in production
  - When adding a new API feature, **add it in both places**, or production will silently return HTML (the catch-all rewrite in `vercel.json`) and the frontend's `api.ts` helpers will swallow the parse error and render empty state.
  - The exception is read-only routes that don't need to work on prod (rare); flag explicitly if so.

## Health Integrations

### Whoop
OAuth2-based fitness tracker integration for recovery, strain, and HRV data.

### Eight Sleep
Smart mattress integration for sleep scores, temperature, and sleep stages.

### Renpho
Smart scale integration for weight, body fat, muscle mass, and body composition.

### Apple Health
Webhook-based integration via Health Auto Export iOS app for steps, calories, and activity data.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `WHOOP_*` - Whoop OAuth credentials
- `EIGHT_SLEEP_*` - Eight Sleep account credentials
- `RENPHO_*` - Renpho account credentials
- `APPLE_HEALTH_WEBHOOK_SECRET` - Webhook validation secret
- `SUPABASE_*` - Supabase database (production only)

## Data Sync

Health data is synced via cron job at 6 AM and 6 PM daily. Manual sync available via `/api/health/sync` endpoint.
