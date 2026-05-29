// Ventura Rewards — member identity (live mode).
//
// In live mode a member enrolls with their name + email and receives a wallet
// token (their credential — mirrors the dashboard's member_token model). We
// persist that token on the device so the wallet, the "Scan to Earn" QR, and
// redemptions all resolve to the same member.
//
// Demo mode never touches this (its points live in localStorage via ./demo).
// This is intentionally separate from `lib/device-id.ts`, which the civic
// Reports feature still uses for anonymous report attribution.

const MEMBER_TOKEN_KEY = "vf_rewards_member_token";

export function getMemberToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(MEMBER_TOKEN_KEY);
}

export function setMemberToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MEMBER_TOKEN_KEY, token);
  }
}

export function clearMemberToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(MEMBER_TOKEN_KEY);
  }
}
