# Ventura Forward — Claude guide

Civic PWA for Ventura, CA. Next.js 14 App Router · React 18 · TS · Tailwind + shadcn/ui (built on `@base-ui/react`) · Supabase · next-pwa.

## Commands
- `pnpm dev` / `pnpm build` / `pnpm seed:demo`
- Rewards demo (no DB, localStorage points): set `NEXT_PUBLIC_REWARDS_DEMO=true`

## Supabase — two separate projects
- **Reports** (anonymous device-id): `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Rewards** → SHARED live Overlook agency dashboard DB (ref `qpejcptvicvhlidcznkz`): `NEXT_PUBLIC_REWARDS_SUPABASE_*`, `REWARDS_SUPABASE_SERVICE_ROLE_KEY`, `REWARDS_QR_SECRET`.
- ⚠️ That rewards DB also holds **live agency client data**. Touch ONLY `rewards_*` tables (vendors/catalog/members/transactions); additive migrations only; never alter other tables.
- Rewards access = service role in API routes; point mutations via `vf_*` SECURITY DEFINER functions (service-role only). `rewards_*` RLS = service-role-only (no policies).

## Conventions
- shadcn UI is on `@base-ui/react` → use the **`render` prop** for polymorphism (NOT `asChild`). Toasts: `@/components/ui/toast` (sonner).
- Rewards UI = server components fetch data + client islands; validate API route bodies with `zod`.

## Deploy / git
- Default branch `main`; branch → PR → merge → delete. `rewards-demo` is demo-only (don't merge to main).
- New Vercel projects MUST set framework preset = Next.js (or `vercel.json` `"framework":"nextjs"`) or every route 404s.
