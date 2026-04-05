# Drake Family CommandCentre

Personal health and wellness dashboard for the Drake family.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express 5 + TypeScript
- **Database**: SQLite (local) / Supabase (production)

## Development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5174
- Backend: http://localhost:3006

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
