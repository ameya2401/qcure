# Deployment Guide

## Deployment Targets

- Frontend: Vercel
- Backend and database: Supabase Cloud

## Prerequisites

- GitHub repository
- Vercel account
- Supabase project

## Supabase Production Setup

1. Create a new Supabase project in your preferred region.
2. Open the SQL editor.
3. Run:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_rpc_functions.sql`
4. Optionally run `supabase/seed.sql` for a demo dataset.
5. In Database settings, ensure realtime is enabled for:
   - `patients`
   - `clinic_settings`
   - `queue_events`

## Environment Variables

Set these in Vercel:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Frontend Build Settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## Vercel Deployment Steps

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables above.
4. Deploy.

Vite routes are handled client-side, so Vercel should serve the SPA entrypoint for deep links like `/doctor` and `/waiting-room`.

## Production Configuration Notes

- Use Supabase project credentials, not demo mode.
- Restrict write access through authenticated flows or an Edge Function proxy for a real clinic rollout.
- Enable observability in Vercel and Supabase to watch queue errors and slow RPCs.

## Custom Domain Support

1. Add the clinic domain in Vercel project settings.
2. Configure DNS records as instructed by Vercel.
3. Keep Supabase URL unchanged unless proxying through a custom backend layer.

## Post-Deployment Validation Checklist

- Open `/reception`, `/waiting-room`, and `/doctor` in separate tabs.
- Register a patient from the reception screen.
- Confirm waiting-room and doctor views update without refresh.
- Trigger `Call Next Patient`.
- Confirm consultation completion updates average duration and queue estimates.

## Recommended Next Production Hardening Steps

- Supabase Auth for receptionist and doctor roles
- Edge Functions for privileged writes
- audit trail retention strategy
- rate limiting and WAF rules
- backup and restore policy
