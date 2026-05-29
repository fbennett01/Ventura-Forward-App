import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import { resolveMemberByToken } from "@/lib/rewards/members";
import type { RewardsActivity, RewardsMeResponse } from "@/lib/rewards/types";

// Hits the rewards DB at request time — never prerender at build.
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  member_token: z.string().uuid(),
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

  const member = await resolveMemberByToken(supabase, parsed.data.member_token);
  if (!member) {
    return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  }

  // Most recent activity (newest first).
  const { data: txns, error: txnErr } = await supabase
    .from("rewards_transactions")
    .select("id, kind, points, created_at, vendor_id, catalog_id")
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(15);

  if (txnErr) {
    return NextResponse.json({ error: txnErr.message }, { status: 500 });
  }

  const rows = txns ?? [];
  const vendorIds = Array.from(new Set(rows.map((t) => t.vendor_id).filter((v): v is string => !!v)));
  const catalogIds = Array.from(new Set(rows.map((t) => t.catalog_id).filter((v): v is string => !!v)));

  const vendorNames = new Map<string, string>();
  if (vendorIds.length) {
    const { data: vendors } = await supabase
      .from("rewards_vendors")
      .select("id, business_name")
      .in("id", vendorIds);
    for (const v of vendors ?? []) vendorNames.set(v.id, v.business_name);
  }

  const catalogTitles = new Map<string, string>();
  if (catalogIds.length) {
    const { data: items } = await supabase
      .from("rewards_catalog")
      .select("id, title")
      .in("id", catalogIds);
    for (const c of items ?? []) catalogTitles.set(c.id, c.title);
  }

  // Sign of `points` is the reliable earn/redeem signal (kind can be null on
  // some rows); redeems carry a catalog item we label with.
  const activity: RewardsActivity[] = rows.map((t) => {
    const vendorName = t.vendor_id ? vendorNames.get(t.vendor_id) ?? "a partner" : "a partner";
    let label: string;
    if (t.points >= 0) {
      label = `+${t.points} pts at ${vendorName}`;
    } else {
      const title = t.catalog_id ? catalogTitles.get(t.catalog_id) ?? "Reward" : "Reward";
      label = `${title} at ${vendorName}`;
    }
    return { id: t.id, label, points: t.points, createdAt: t.created_at };
  });

  const response: RewardsMeResponse = { balance: member.balance, activity, name: member.name };
  return NextResponse.json(response);
}
