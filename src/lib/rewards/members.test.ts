import { describe, it, expect } from "vitest";
import { balanceOf, isValidEmail } from "@/lib/rewards/members";

describe("balanceOf", () => {
  it("sums signed points (earns positive, redeems negative)", () => {
    expect(balanceOf([{ points: 5 }, { points: 3 }, { points: -4 }])).toBe(4);
  });

  it("is zero with no transactions", () => {
    expect(balanceOf([])).toBe(0);
  });

  it("can go to exactly zero", () => {
    expect(balanceOf([{ points: 10 }, { points: -10 }])).toBe(0);
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("member@example.com")).toBe(true);
  });

  it("rejects strings without an @ or domain", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});
