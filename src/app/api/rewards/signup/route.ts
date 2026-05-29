import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import { createMember } from "@/lib/rewards/members";
import { clientIp, enforceRateLimit } from "@/lib/rewards/rate-limit";

// Public member enrollment: name + email → a wallet token the device stores.
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
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

  // Throttle enrollment per IP (shares the token budget bucket).
  const limited = await enforceRateLimit("token", `signup:${clientIp(req)}`);
  if (limited) return limited;

  const supabase = getRewardsServiceClient();
  const result = await createMember(supabase, parsed.data);
  if ("error" in result) {
    const badInput = result.error === "invalid_email" || result.error === "name_required";
    return NextResponse.json({ error: result.error }, { status: badInput ? 400 : 500 });
  }

  return NextResponse.json({ member_token: result.member_token });
}
