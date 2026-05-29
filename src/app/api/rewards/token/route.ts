import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRewardsServiceClient } from "@/lib/rewards/supabase";
import { resolveMemberByToken } from "@/lib/rewards/members";
import { signMemberToken } from "@/lib/rewards/qr";
import { clientIp, enforceRateLimit } from "@/lib/rewards/rate-limit";

// Issues a short-lived signed token for the member to display as a QR code.
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

  const limited = await enforceRateLimit(
    "token",
    `${parsed.data.member_token}:${clientIp(req)}`
  );
  if (limited) return limited;

  const supabase = getRewardsServiceClient();
  const member = await resolveMemberByToken(supabase, parsed.data.member_token);
  if (!member) {
    return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  }

  const { token, expiresAt } = signMemberToken(member.id);
  return NextResponse.json({ token, expiresAt });
}
