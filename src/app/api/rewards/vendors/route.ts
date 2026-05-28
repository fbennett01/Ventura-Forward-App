import { NextResponse } from "next/server";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import type { RewardsVendorsResponse } from "@/lib/rewards/types";
import type { Partner } from "@/types";

// Hits the rewards DB at request time — never prerender at build.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getRewardsServiceClient();

  const { data: vendors, error: vErr } = await supabase
    .from("rewards_vendors")
    .select("id, name, category, address, logo_url")
    .eq("active", true)
    .order("name");

  if (vErr) {
    return NextResponse.json({ error: vErr.message }, { status: 500 });
  }

  const { data: items, error: cErr } = await supabase
    .from("rewards_catalog")
    .select("id, vendor_id, title, points_cost")
    .eq("active", true)
    .order("points_cost", { ascending: true });

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  // Represent each vendor as one card using its lowest-cost active perk
  // (matches the single-perk shape the Rewards UI renders today).
  const firstItem = new Map<string, { id: string; title: string; points_cost: number }>();
  for (const it of items ?? []) {
    if (!firstItem.has(it.vendor_id)) {
      firstItem.set(it.vendor_id, { id: it.id, title: it.title, points_cost: it.points_cost });
    }
  }

  const partners: Partner[] = (vendors ?? []).map((v) => {
    const item = firstItem.get(v.id);
    return {
      id: v.id,
      name: v.name,
      category: v.category,
      address: v.address ?? "",
      pointsCost: item?.points_cost ?? 0,
      perk: item?.title ?? "",
      logoUrl: v.logo_url,
      catalogItemId: item?.id,
    };
  });

  const response: RewardsVendorsResponse = { partners };
  return NextResponse.json(response);
}
