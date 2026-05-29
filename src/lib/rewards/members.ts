import type { SupabaseClient } from "@supabase/supabase-js";
import type { RewardsDatabase } from "@/types/rewards-supabase";

export type RewardsClient = SupabaseClient<RewardsDatabase>;

export interface MemberRow {
  id: string;
  name: string;
  /** Current points balance, derived from signed transaction points. */
  balance: number;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Current balance = the sum of signed transaction points.
 *
 * Deliberately NOT read from `rewards_members.points_balance`: that column is
 * only updated by the `vf_rewards_*` functions, while the dashboard awards /
 * redeems by inserting transactions directly, so it can drift. Summing is
 * path-independent and matches how the dashboard reports balances.
 */
export function balanceOf(txns: ReadonlyArray<{ points: number }>): number {
  return txns.reduce((sum, t) => sum + t.points, 0);
}

export async function balanceForMember(
  supabase: RewardsClient,
  memberId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("rewards_transactions")
    .select("points")
    .eq("member_id", memberId);
  if (error) throw new Error(error.message);
  return balanceOf(data ?? []);
}

/** Resolve a member by their wallet token (the credential). Null if unknown. */
export async function resolveMemberByToken(
  supabase: RewardsClient,
  memberToken: string
): Promise<MemberRow | null> {
  const { data: member, error } = await supabase
    .from("rewards_members")
    .select("id, name")
    .eq("member_token", memberToken)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!member) return null;
  const balance = await balanceForMember(supabase, member.id);
  return { id: member.id, name: member.name, balance };
}

/**
 * Create — or return the existing — membership for an email. Idempotent on
 * email so a repeat sign-up returns the same wallet token rather than a
 * duplicate member.
 */
export async function createMember(
  supabase: RewardsClient,
  input: { name: string; email: string; phone?: string | null }
): Promise<{ member_token: string } | { error: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { error: "name_required" };
  if (!isValidEmail(email)) return { error: "invalid_email" };

  const { data: existing, error: selErr } = await supabase
    .from("rewards_members")
    .select("member_token")
    .eq("email", email)
    .maybeSingle();
  if (selErr) return { error: selErr.message };
  if (existing) return { member_token: existing.member_token };

  const { data: created, error: insErr } = await supabase
    .from("rewards_members")
    .insert({ name, email, phone: input.phone?.trim() || null })
    .select("member_token")
    .single();
  if (insErr || !created) return { error: insErr?.message ?? "signup_failed" };
  return { member_token: created.member_token };
}
