import { describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import {
  applyRateLimit,
  clientIp,
  getLimiter,
  noopLimiter,
  tooManyRequests,
  type RateLimitResult,
  type RewardsRateLimiter,
} from "./rate-limit";

// A fake limiter ("store") we can drive to allowed / limited / throwing.
function fakeLimiter(result: RateLimitResult | Error): RewardsRateLimiter {
  return {
    limit: vi.fn(async () => {
      if (result instanceof Error) throw result;
      return result;
    }),
  };
}

const allowed: RateLimitResult = { success: true, limit: 10, remaining: 9, reset: 0 };
const limited: RateLimitResult = {
  success: false,
  limit: 10,
  remaining: 0,
  reset: Date.now() + 30_000,
};

describe("applyRateLimit", () => {
  it("returns null when the store allows the request", async () => {
    const limiter = fakeLimiter(allowed);
    const res = await applyRateLimit(limiter, "device:1.2.3.4");
    expect(res).toBeNull();
    expect(limiter.limit).toHaveBeenCalledWith("device:1.2.3.4");
  });

  it("returns a 429 response when the store limits the request", async () => {
    const res = await applyRateLimit(fakeLimiter(limited), "device:1.2.3.4");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(429);
    const body = await res!.json();
    expect(body.error).toBe("rate_limited");
    const retryAfter = Number(res!.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
  });

  it("fails open (allows) when the store throws", async () => {
    const res = await applyRateLimit(fakeLimiter(new Error("redis down")), "k");
    expect(res).toBeNull();
  });
});

describe("noopLimiter", () => {
  it("always allows", async () => {
    const result = await noopLimiter.limit("anything");
    expect(result.success).toBe(true);
  });
});

describe("getLimiter", () => {
  it("falls back to the no-op limiter when Upstash is not configured", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(getLimiter("token")).toBe(noopLimiter);
    expect(getLimiter("award_ip")).toBe(noopLimiter);
  });
});

describe("tooManyRequests", () => {
  it("clamps Retry-After to at least 1 second for a past reset", () => {
    const res = tooManyRequests({ success: false, limit: 1, remaining: 0, reset: 0 });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
  });
});

describe("clientIp", () => {
  function req(headers: Record<string, string>): NextRequest {
    return { headers: new Headers(headers) } as unknown as NextRequest;
  }

  it("reads the first entry of x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8");
  });

  it("falls back to 0.0.0.0 when no proxy headers are present", () => {
    expect(clientIp(req({}))).toBe("0.0.0.0");
  });
});
