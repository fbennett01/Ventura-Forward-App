import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import { verifyMemberToken } from "@/lib/rewards/qr";

// Vendor-side endpoint: verify a scanned member token and award points.
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(1),
  vendor_id: z.string().uuid(),
  points: z.number().int().positive().max(1000),
  access_code: z.string().min(1),
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

  // Beta vendor gate. The production dashboard uses Supabase Auth instead.
  const expected = process.env.REWARDS_VENDOR_ACCESS_CODE;
  if (!expected || parsed.data.access_code !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const verified = verifyMemberToken(parsed.data.token);
  if (!verified.ok) {
    return NextResponse.json(
      { error: verified.error },
      { status: verified.error === "expired" ? 410 : 400 }
    );
  }

  const supabase = getRewardsServiceClient();

  const { data: vendor, error: vErr } = await supabase
    .from("rewards_vendors")
    .select("id, name")
    .eq("id", parsed.data.vendor_id)
    .eq("active", true)
    .maybeSingle();

  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });
  if (!vendor) return NextResponse.json({ error: "vendor_not_found" }, { status: 404 });

  const { data: balance, error } = await supabase.rpc("vf_rewards_earn", {
    p_member_id: verified.memberId,
    p_vendor_id: parsed.data.vendor_id,
    p_points: parsed.data.points,
    p_nonce: verified.nonce,
    p_source: "qr_scan",
  });

  if (error) {
    const msg = error.message || "earn_failed";
    if (msg.includes("duplicate_nonce")) {
      return NextResponse.json({ error: "already_scanned" }, { status: 409 });
    }
    if (msg.includes("member_not_found")) {
      return NextResponse.json({ error: "member_not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ balance, vendor: vendor.name, points: parsed.data.points });
}
