import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";

// Member-side redemption: spend points on a catalog perk, return a code the
// vendor honors. Double-spend is prevented inside vf_rewards_redeem.
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  device_id: z.string().uuid(),
  catalog_item_id: z.string().uuid(),
});

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

  const supabase = getRewardsServiceClient();

  const { data: member, error: mErr } = await supabase
    .from("rewards_members")
    .select("id")
    .eq("device_id", parsed.data.device_id)
    .maybeSingle();

  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: "member_not_found" }, { status: 404 });

  const { data, error } = await supabase.rpc("vf_rewards_redeem", {
    p_member_id: member.id,
    p_catalog_item_id: parsed.data.catalog_item_id,
  });

  if (error) {
    const msg = error.message || "redeem_failed";
    if (msg.includes("insufficient_points")) {
      return NextResponse.json({ error: "insufficient_points" }, { status: 402 });
    }
    if (msg.includes("catalog_item_not_found")) {
      return NextResponse.json({ error: "catalog_item_not_found" }, { status: 404 });
    }
    if (msg.includes("member_not_found")) {
      return NextResponse.json({ error: "member_not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ error: "redeem_failed" }, { status: 500 });

  return NextResponse.json({ balance: row.new_balance, redemptionCode: row.redemption_code });
}
