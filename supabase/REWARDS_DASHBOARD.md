# Ventura Rewards — dashboard integration contract

The Ventura Forward **dashboard lives in a separate repo** but shares this
Supabase project. This is the contract it codes against.

> ⚠️ Shared live agency DB. Touch **only** `rewards_*` tables and `vf_*`
> functions. Additive migrations only; never alter other tables.

## Access

`rewards_*` tables have RLS enabled with **no policies**, so they're reachable
only with the **service-role key**. The dashboard connects with:

```
NEXT_PUBLIC_REWARDS_SUPABASE_URL / REWARDS_SUPABASE_SERVICE_ROLE_KEY
REWARDS_QR_SECRET           # only if the dashboard scans member QRs itself
```

```ts
import { createClient } from "@supabase/supabase-js";
const db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
```

## Tables (read directly)

- `rewards_vendors` — id, name, slug, category, address, lat/lng, logo_url, active
- `rewards_catalog` — id, vendor_id, title, description, points_cost, active
- `rewards_members` — id, device_id, email, phone, points_balance
- `rewards_transactions` — id, member_id, vendor_id, catalog_item_id, type
  (`earn|redeem|adjust`), points (signed), qr_nonce, source, redemption_code, created_by
- `rewards_vendor_users` — user_id (auth.users), vendor_id, role (`staff|manager|admin`)

## Mutations (call, don't write tables directly)

| Function | Purpose | Returns |
|---|---|---|
| `vf_rewards_earn(p_member_id, p_vendor_id, p_points, p_nonce, p_source, p_created_by)` | Award points; rejects duplicate `p_nonce` (`duplicate_nonce`) | new balance `int` |
| `vf_rewards_redeem(p_member_id, p_catalog_item_id, p_created_by)` | Spend points; `insufficient_points` if too low | row `{ new_balance, redemption_code }` |
| `vf_rewards_adjust(p_member_id, p_points, p_reason, p_created_by)` | Manual correction | new balance `int` |

```ts
const { data, error } = await db.rpc("vf_rewards_earn", {
  p_member_id, p_vendor_id, p_points: 5, p_nonce, p_source: "dashboard",
});
```

## Analytics (read)

| Function | Returns |
|---|---|
| `vf_rewards_stats()` | members_total, points_outstanding, points_earned_total, points_redeemed_total, redemptions_total, active_vendors, txns_last_7d |
| `vf_rewards_vendor_leaderboard(p_limit)` | per-vendor points_earned / points_redeemed / redemptions |
| `vf_rewards_daily(p_days)` | zero-filled daily earned / redeemed / txns |

```ts
const { data: stats } = await db.rpc("vf_rewards_stats");
const { data: daily } = await db.rpc("vf_rewards_daily", { p_days: 30 });
```

## Member QR token format (Model B)

If the dashboard implements its own scanner, the member QR encodes:

```
base64url(JSON {m: memberId, n: nonce, e: expSeconds}) + "." + base64url(HMAC_SHA256(body, REWARDS_QR_SECRET))
```

To award: verify the signature (constant-time) and `e` (not expired), then
call `vf_rewards_earn(memberId, vendorId, points, nonce, …)`. Passing the
token's `nonce` as `p_nonce` makes a single displayed code award only once.

The Ventura Forward app also ships a beta scanner at **`/vendor/scan`** gated by
`REWARDS_VENDOR_ACCESS_CODE`, so points can be awarded before the dashboard's
scanner exists.

## Dashboard auth

Vendor/agency operators authenticate via **Supabase Auth**; map each
`auth.users.id` to a vendor in `rewards_vendor_users` (with a role). Resolve
permissions server-side, then use the service-role client for `rewards_*`
access (these tables have no RLS policies for end users).
