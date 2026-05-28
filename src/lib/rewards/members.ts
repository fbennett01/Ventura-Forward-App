import type { SupabaseClient } from "@supabase/supabase-js";
import type { RewardsDatabase } from "@/types/rewards-supabase";

export type RewardsClient = SupabaseClient<RewardsDatabase>;

export interface MemberRow {
  id: string;
  balance: number;
}

/**
 * Resolve the rewards member for an anonymous device id, creating one if it
 * doesn't exist. Handles the create race (two requests for a new device id)
 * via the unique constraint on device_id.
 */
export async function getOrCreateMember(
  supabase: RewardsClient,
  deviceId: string
): Promise<{ member: MemberRow } | { error: string }> {
  const { data: existing, error: selErr } = await supabase
    .from("rewards_members")
    .select("id, points_balance")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (selErr) return { error: selErr.message };
  if (existing) return { member: { id: existing.id, balance: existing.points_balance } };

  const { data: created, error: insErr } = await supabase
    .from("rewards_members")
    .insert({ device_id: deviceId })
    .select("id, points_balance")
    .single();

  if (!insErr && created) {
    return { member: { id: created.id, balance: created.points_balance } };
  }

  // Lost a create race — another request inserted the same device_id first.
  if (insErr && insErr.code === "23505") {
    const { data: raced, error: raceErr } = await supabase
      .from("rewards_members")
      .select("id, points_balance")
      .eq("device_id", deviceId)
      .single();
    if (raceErr || !raced) return { error: raceErr?.message ?? "Failed to load member" };
    return { member: { id: raced.id, balance: raced.points_balance } };
  }

  return { error: insErr?.message ?? "Failed to create member" };
}
