import "server-only";
import crypto from "crypto";

/**
 * Constant-time string comparison. Guards the beta vendor access code against
 * timing-based brute force: the comparison takes the same time regardless of
 * how many leading characters match.
 *
 * `crypto.timingSafeEqual` requires equal-length buffers, so on a length
 * mismatch we still run a comparison (against `a` itself) to avoid leaking the
 * expected length via early return, then report a non-match.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Verify a provided vendor access code against `REWARDS_VENDOR_ACCESS_CODE`
 * using a constant-time compare. Returns false when the env var is unset (the
 * beta scanner is disabled) or the code doesn't match.
 */
export function verifyVendorAccessCode(provided: string): boolean {
  const expected = process.env.REWARDS_VENDOR_ACCESS_CODE;
  if (!expected) return false;
  return timingSafeEqualStr(provided, expected);
}
