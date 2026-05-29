# Supabase Setup

This app uses **two separate Supabase projects**: one for **Reports**
(anonymous device-id submissions) and one for **Ventura Rewards**.

## Reports project

1. Create a Supabase project.
2. Open the SQL Editor and run [migrations/0001_init.sql](./migrations/0001_init.sql).
3. Create a storage bucket named report-photos and enable public read.
4. Add a storage policy so anon can insert objects to report-photos.
5. Copy your project URL, anon key, and service role key into .env.local
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`).

## Rewards project

> ⚠️ The Rewards project is a **SHARED live Overlook agency DB**. Only touch
> `rewards_*` tables and `vf_*` functions.
>
> ⚠️ **The live schema has diverged from these migrations** (the dashboard repo
> owns it now — see [REWARDS_DASHBOARD.md](./REWARDS_DASHBOARD.md)). The
> migration files below are **historical**; do **not** re-apply `0002` to the
> live project — its `create or replace function` statements would overwrite the
> live `vf_rewards_*` functions with stale, broken bodies. They remain only as a
> record of the original Phase-1 design.

Rewards runs in **demo mode by default** (localStorage points, no DB writes).
You only need the steps below to enable **live mode**.

1. In the rewards Supabase project's SQL Editor, run
   [migrations/0002_rewards.sql](./migrations/0002_rewards.sql)
   (`rewards_*` tables + `vf_*` SECURITY DEFINER functions + service-role-only
   RLS).
2. Optionally run
   [migrations/0003_rewards_seed_vendors.sql](./migrations/0003_rewards_seed_vendors.sql)
   to seed the demo partner list as live vendors.
3. Run
   [migrations/0004_rewards_analytics.sql](./migrations/0004_rewards_analytics.sql)
   for the dashboard analytics functions.
4. Create Supabase Auth users for each vendor/agency operator, then insert
   rows into `rewards_vendor_users` mapping `auth.users.id` → `vendor_id`
   (dashboard auth).
5. Set the rewards env vars in .env.local: `NEXT_PUBLIC_REWARDS_SUPABASE_URL`,
   `NEXT_PUBLIC_REWARDS_SUPABASE_ANON_KEY`, `REWARDS_SUPABASE_SERVICE_ROLE_KEY`,
   `REWARDS_QR_SECRET`, and `REWARDS_VENDOR_ACCESS_CODE` (for the beta scanner
   at `/vendor/scan`). Leaving `NEXT_PUBLIC_REWARDS_SUPABASE_URL` blank keeps
   demo mode; set `NEXT_PUBLIC_REWARDS_DEMO=true` to force demo even when
   configured.

## Rate limiting

The rewards write endpoints — `POST /api/rewards/token`, `/award`, and
`/redeem` — are rate limited to throttle abuse (token minting, redemption spam,
and access-code brute force on the beta scanner). Limiting is **serverless-safe**
(in-memory counters don't work on Vercel), backed by **Upstash Redis**:

- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (free tier at
  <https://console.upstash.com/redis>) to enable it.
- Leave **both unset** to disable limiting (a no-op limiter), which keeps
  demo/dev working with no extra config.
- Keys: `token`/`redeem` by `device_id` + IP; `award` by `vendor_id` + IP, plus
  a separate per-IP limiter that guards the access code against brute force.
  The access-code comparison is constant-time (`crypto.timingSafeEqual`).
- Over-limit requests get HTTP `429` with `{ "error": "rate_limited" }` and a
  `Retry-After` header. The limiter **fails open** (allows the request) if Redis
  is unreachable, so a Redis outage never takes the feature down.

## Go live (production checklist)

To switch Rewards from demo to live on the production Vercel project:

1. In the **rewards** Supabase project's SQL Editor, run
   [migrations/0002_rewards.sql](./migrations/0002_rewards.sql) and
   [migrations/0004_rewards_analytics.sql](./migrations/0004_rewards_analytics.sql)
   (and optionally
   [migrations/0003_rewards_seed_vendors.sql](./migrations/0003_rewards_seed_vendors.sql)
   to seed the partner list). All are additive and safe to re-run.
2. On the **live** Vercel project, set:
   - `NEXT_PUBLIC_REWARDS_SUPABASE_URL`
   - `NEXT_PUBLIC_REWARDS_SUPABASE_ANON_KEY`
   - `REWARDS_SUPABASE_SERVICE_ROLE_KEY`
   - `REWARDS_QR_SECRET`
   - `REWARDS_VENDOR_ACCESS_CODE` (for the beta `/vendor/scan` tool)
   - optionally `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (rate
     limiting — see above; strongly recommended in production)
3. On the **demo** Vercel project, leave `NEXT_PUBLIC_REWARDS_SUPABASE_URL`
   **unset** to keep demo mode (localStorage points, no DB writes). Setting
   `NEXT_PUBLIC_REWARDS_DEMO=true` also forces demo even when configured.

See [REWARDS_DASHBOARD.md](./REWARDS_DASHBOARD.md) for the separate dashboard
repo's integration contract (tables, `vf_*` functions, analytics, QR token
format).
