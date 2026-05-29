import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import { resolveMemberByToken } from "@/lib/rewards/members";
import { clientIp, enforceRateLimit } from "@/lib/rewards/rate-limit";

// Member-side redemption: spend points on a catalog perk, return a code the
// vendor honors. Balance is summed from transactions (path-independent), so it
// stays correct whether points were earned via the app or the dashboard.
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  member_token: z.string().uuid(),
  catalog_item_id: z.string().uuid(),
});

function redemptionCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const limited = await enforceRateLimit(
    "redeem",
    `${parsed.data.member_token}:${clientIp(req)}`
  );
  if (limited) return limited;

  const supabase = getRewardsServiceClient();

  const member = await resolveMemberByToken(supabase, parsed.data.member_token);
  if (!member) return NextResponse.json({ error: "member_not_found" }, { status: 404 });

  const { data: reward, error: rErr } = await supabase
    .from("rewards_catalog")
    .select("id, vendor_id, title, points_cost, is_active")
    .eq("id", parsed.data.catalog_item_id)
    .maybeSingle();
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
  if (!reward || !reward.is_active) {
    return NextResponse.json({ error: "catalog_item_not_found" }, { status: 404 });
  }

  if (member.balance < reward.points_cost) {
    return NextResponse.json({ error: "insufficient_points" }, { status: 402 });
  }

  const code = redemptionCode();
  const { error: insErr } = await supabase.from("rewards_transactions").insert({
    member_id: member.id,
    vendor_id: reward.vendor_id,
    catalog_id: reward.id,
    points: -reward.points_cost,
    kind: "redeem",
    source: "app",
    redemption_code: code,
    note: `Redeemed: ${reward.title}`,
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({
    balance: member.balance - reward.points_cost,
    redemptionCode: code,
  });
}
