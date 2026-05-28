import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { RewardsDatabase } from "@/types/rewards-supabase";

/**
 * Service-role client for the Ventura Rewards Supabase project.
 *
 * ⚠️  This is the SHARED live Overlook agency DB. Only touch `rewards_*`
 *     tables and call `vf_*` functions. The browser never talks to this DB
 *     directly (rewards_* RLS is service-role-only) — all access flows
 *     through Next.js API routes that use this client.
 *
 * In demo mode the API routes are never called, so this throwing when the
 * env is unset is expected: a live-mode request without configured env is a
 * misconfiguration, not a demo.
 */
export function getRewardsServiceClient() {
  const url = process.env.NEXT_PUBLIC_REWARDS_SUPABASE_URL;
  const serviceRoleKey = process.env.REWARDS_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_REWARDS_SUPABASE_URL or REWARDS_SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<RewardsDatabase>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
