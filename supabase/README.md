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
> `rewards_*` tables and `vf_*` functions. The migrations below are additive
> and safe to re-run.

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

See [REWARDS_DASHBOARD.md](./REWARDS_DASHBOARD.md) for the separate dashboard
repo's integration contract (tables, `vf_*` functions, analytics, QR token
format).
