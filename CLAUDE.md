# Ventura Forward — Claude guide

Civic PWA for Ventura, CA. Next.js 14 App Router · React 18 · TS · Tailwind + shadcn/ui (built on `@base-ui/react`) · Supabase · next-pwa.

## Commands
- `pnpm dev` / `pnpm build` / `pnpm seed:demo`
- Rewards demo (no DB, localStorage points): set `NEXT_PUBLIC_REWARDS_DEMO=true`

## Supabase — two separate projects
- **Reports** (anonymous device-id): `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Rewards** → SHARED live Overlook agency dashboard DB (ref `qpejcptvicvhlidcznkz`): `NEXT_PUBLIC_REWARDS_SUPABASE_*`, `REWARDS_SUPABASE_SERVICE_ROLE_KEY`, `REWARDS_QR_SECRET`.
- ⚠️ That rewards DB also holds **live agency client data**. Touch ONLY `rewards_*` tables (vendors/catalog/members/transactions); additive migrations only; never alter other tables.
- Rewards access = service role in API routes. `rewards_*` RLS = service-role-only (no policies).
- **The live schema is the source of truth — it is owned/evolved by the separate dashboard repo and DIFFERS from `supabase/migrations/0002`.** Members are named/email sign-ups keyed by `member_token` (no `device_id`); vendors use `business_name`/`status`/`vendor_token`; transactions use `kind`/`catalog_id`/`amount_cents`/`jti`. The App's typed view lives in `src/types/rewards-supabase.ts` (keep it matching the live DB). **Do NOT re-run the historical migrations against the live DB** — `0002`'s `create or replace function` would clobber the live `vf_*` functions with stale bodies.
- Point awards (QR scan-to-earn) go through `vf_rewards_earn` (replay-guarded via `jti`). Balances + redemptions are computed by summing signed `points` (path-independent), NOT by reading `points_balance` (which can drift). See `lib/rewards/members.ts`.
- Member identity = `member_token` stored on the device (`lib/rewards/identity.ts`) after a name/email sign-up (`/api/rewards/signup`). Demo mode (default when rewards env is unset) keeps points in localStorage and never calls the DB.

## Conventions
- shadcn UI is on `@base-ui/react` → use the **`render` prop** for polymorphism (NOT `asChild`). Toasts: `@/components/ui/toast` (sonner).
- Rewards UI = server components fetch data + client islands; validate API route bodies with `zod`.

## Deploy / git
- Default branch `main`; branch → PR → merge → delete. `rewards-demo` is demo-only (don't merge to main).
- New Vercel projects MUST set framework preset = Next.js (or `vercel.json` `"framework":"nextjs"`) or every route 404s.
