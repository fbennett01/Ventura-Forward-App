import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Serverless-safe rate limiting for the rewards write endpoints.
 *
 * In-memory counters don't work on Vercel (each invocation can run in a fresh
 * isolate), so the real limiter is backed by Upstash Redis. When
 * `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are NOT set (demo/dev),
 * we fall back to a no-op limiter that always allows — so demo mode and local
 * development keep working without any extra config.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when the current window resets. */
  reset: number;
}

/** Minimal surface we rely on from `@upstash/ratelimit`'s `Ratelimit`. */
export interface RewardsRateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

export type RateLimitName = "token" | "redeem" | "award" | "award_ip";

type Window = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

// Per-endpoint budgets. Tuned to be generous for real members/vendors while
// still throttling automated abuse (token minting, redemption spam,
// access-code brute force).
const WINDOWS: Record<RateLimitName, { tokens: number; window: Window }> = {
  token: { tokens: 12, window: "1 m" }, // member minting QR tokens
  redeem: { tokens: 8, window: "1 m" }, // member spending points
  award: { tokens: 30, window: "1 m" }, // a vendor awarding points
  award_ip: { tokens: 20, window: "1 m" }, // brute-force guard on the access code
};

/** Always-allow limiter used when Upstash isn't configured (demo/dev). */
export const noopLimiter: RewardsRateLimiter = {
  async limit(): Promise<RateLimitResult> {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  },
};

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

let redis: Redis | null = null;
const limiterCache = new Map<RateLimitName, RewardsRateLimiter>();

/**
 * Resolve the limiter for an endpoint. Returns the no-op limiter when Upstash
 * is not configured. Real limiters (and the Redis client) are created lazily
 * and cached for the lifetime of the serverless instance.
 */
export function getLimiter(name: RateLimitName): RewardsRateLimiter {
  const cached = limiterCache.get(name);
  if (cached) return cached;

  if (!upstashConfigured()) return noopLimiter;

  redis ??= new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const { tokens, window } = WINDOWS[name];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `vf:rl:${name}`,
    analytics: false,
  });

  limiterCache.set(name, limiter);
  return limiter;
}

/** Best-effort client IP, trusting Vercel's proxy headers. */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

/** 429 response returned when a request is rate limited. */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: "rate_limited",
      message: "Too many requests. Please slow down and try again shortly.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(Number.isFinite(retryAfter) ? retryAfter : 60) },
    }
  );
}

/**
 * Run a limiter for `identifier`. Returns a ready-to-send 429 response when the
 * caller is over budget, or `null` when the request is allowed.
 *
 * Fails open: if the limiter/store throws (e.g. a transient Redis outage) we
 * allow the request rather than take the whole feature down.
 */
export async function applyRateLimit(
  limiter: RewardsRateLimiter,
  identifier: string
): Promise<NextResponse | null> {
  let result: RateLimitResult;
  try {
    result = await limiter.limit(identifier);
  } catch {
    return null;
  }
  return result.success ? null : tooManyRequests(result);
}

/**
 * Convenience for route handlers: resolve the limiter for `name` and enforce it
 * for `identifier`. Returns a 429 `NextResponse` to send, or `null` if allowed.
 */
export function enforceRateLimit(
  name: RateLimitName,
  identifier: string
): Promise<NextResponse | null> {
  return applyRateLimit(getLimiter(name), identifier);
}
