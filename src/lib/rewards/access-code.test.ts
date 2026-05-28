import { afterEach, describe, expect, it } from "vitest";
import { timingSafeEqualStr, verifyVendorAccessCode } from "./access-code";

describe("timingSafeEqualStr", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeEqualStr("s3cret-code", "s3cret-code")).toBe(true);
  });

  it("returns false for equal-length but different strings", () => {
    expect(timingSafeEqualStr("aaaaaa", "aaaaab")).toBe(false);
  });

  it("returns false for different-length strings", () => {
    expect(timingSafeEqualStr("short", "longer-value")).toBe(false);
  });

  it("handles empty strings", () => {
    expect(timingSafeEqualStr("", "")).toBe(true);
    expect(timingSafeEqualStr("", "x")).toBe(false);
  });

  it("is unicode-safe (compares bytes, not code units)", () => {
    expect(timingSafeEqualStr("café", "café")).toBe(true);
    expect(timingSafeEqualStr("café", "cafe")).toBe(false);
  });
});

describe("verifyVendorAccessCode", () => {
  const original = process.env.REWARDS_VENDOR_ACCESS_CODE;
  afterEach(() => {
    if (original === undefined) delete process.env.REWARDS_VENDOR_ACCESS_CODE;
    else process.env.REWARDS_VENDOR_ACCESS_CODE = original;
  });

  it("returns false when the env var is unset", () => {
    delete process.env.REWARDS_VENDOR_ACCESS_CODE;
    expect(verifyVendorAccessCode("anything")).toBe(false);
  });

  it("returns true only for the matching code", () => {
    process.env.REWARDS_VENDOR_ACCESS_CODE = "open-sesame";
    expect(verifyVendorAccessCode("open-sesame")).toBe(true);
    expect(verifyVendorAccessCode("wrong")).toBe(false);
  });
});
