import "server-only";
import crypto from "crypto";

// Short-lived, HMAC-signed member tokens for "Scan to Earn" (Model B: the
// member shows this token as a QR; the vendor scans it to award points).
// REWARDS_QR_SECRET never leaves the server.

const TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes

interface TokenPayload {
  m: string; // member id
  n: string; // nonce (replay guard — one award per displayed code)
  e: number; // expiry (unix seconds)
}

function getSecret(): string {
  const secret = process.env.REWARDS_QR_SECRET;
  if (!secret) throw new Error("Missing REWARDS_QR_SECRET");
  return secret;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export function signMemberToken(memberId: string): { token: string; expiresAt: number } {
  const payload: TokenPayload = {
    m: memberId,
    n: crypto.randomUUID(),
    e: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body)}`, expiresAt: payload.e * 1000 };
}

export type VerifyResult =
  | { ok: true; memberId: string; nonce: string }
  | { ok: false; error: "malformed" | "bad_signature" | "expired" };

export function verifyMemberToken(token: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, error: "malformed" };

  const [body, sig] = parts;
  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false, error: "bad_signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return { ok: false, error: "malformed" };
  }

  if (!payload.m || !payload.n || typeof payload.e !== "number") {
    return { ok: false, error: "malformed" };
  }
  if (payload.e * 1000 < Date.now()) {
    return { ok: false, error: "expired" };
  }

  return { ok: true, memberId: payload.m, nonce: payload.n };
}
