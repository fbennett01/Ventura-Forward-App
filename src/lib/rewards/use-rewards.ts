"use client";

import { useCallback, useEffect, useState } from "react";
import { mockPartners } from "@/data/mock-partners";
import { getMemberToken, setMemberToken } from "@/lib/rewards/identity";
import { demoEarn, demoRedeem, getDemoState, isRewardsDemo } from "@/lib/rewards/demo";
import type {
  RewardsActivity,
  RewardsMeResponse,
  RewardsVendorsResponse,
  SignUpInput,
  SignUpResult,
} from "@/lib/rewards/types";
import type { Partner } from "@/types";

const SIMULATED_EARN_POINTS = 5;

export type RedeemResult =
  | { ok: true; code?: string }
  | { ok: false; error: string };

export interface UseRewards {
  balance: number;
  partners: Partner[];
  activity: RewardsActivity[];
  loading: boolean;
  demo: boolean;
  /** Live mode only: whether this device has an enrolled member. Always true in demo. */
  signedUp: boolean;
  /** Live mode only: enroll a new member and persist their wallet token. */
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  /** Demo-only: simulate a visit that earns points. `null` in live mode. */
  simulateVisit: (() => void) | null;
  /** Redeem a partner's perk (demo or live). */
  redeem: (partner: Partner) => Promise<RedeemResult>;
}

export function useRewards(): UseRewards {
  const demo = isRewardsDemo();
  const [memberToken, setMemberTokenState] = useState<string | null>(null);
  // In demo mode there is no enrollment step.
  const [signedUp, setSignedUp] = useState<boolean>(demo);
  const [balance, setBalance] = useState<number>(0);
  const [partners, setPartners] = useState<Partner[]>(demo ? mockPartners : []);
  const [activity, setActivity] = useState<RewardsActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Resolve the stored wallet token once on mount (live mode only).
  useEffect(() => {
    if (demo) return;
    const token = getMemberToken();
    setMemberTokenState(token);
    setSignedUp(!!token);
  }, [demo]);

  useEffect(() => {
    let cancelled = false;

    if (demo) {
      const state = getDemoState();
      setBalance(state.balance);
      setActivity(state.activity);
      setPartners(mockPartners);
      setLoading(false);
      return;
    }

    // Partners are public — load them regardless of enrollment.
    void (async () => {
      try {
        const vendorsRes = await fetch("/api/rewards/vendors");
        if (vendorsRes.ok && !cancelled) {
          const v = (await vendorsRes.json()) as RewardsVendorsResponse;
          setPartners(v.partners);
        }
      } catch {
        // Network error — keep defaults.
      }
    })();

    // No wallet yet → nothing to load; the page shows the join form.
    if (!memberToken) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      try {
        const meRes = await fetch("/api/rewards/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_token: memberToken }),
        });
        if (meRes.ok && !cancelled) {
          const me = (await meRes.json()) as RewardsMeResponse;
          setBalance(me.balance);
          setActivity(me.activity);
        }
      } catch {
        // Network error — keep defaults; the page still renders.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [demo, memberToken]);

  const signUp = useCallback(async (input: SignUpInput): Promise<SignUpResult> => {
    try {
      const res = await fetch("/api/rewards/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as { member_token?: string; error?: string };
      if (!res.ok || !data.member_token) {
        return { ok: false, error: data.error ?? "signup_failed" };
      }
      setMemberToken(data.member_token);
      setMemberTokenState(data.member_token);
      setSignedUp(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "network_error" };
    }
  }, []);

  const simulateVisit = useCallback(() => {
    const state = demoEarn("a Ventura partner", SIMULATED_EARN_POINTS);
    setBalance(state.balance);
    setActivity(state.activity);
  }, []);

  const redeem = useCallback(
    async (partner: Partner): Promise<RedeemResult> => {
      if (demo) {
        const res = demoRedeem(partner.name, partner.perk, partner.pointsCost);
        if ("error" in res) return { ok: false, error: res.error };
        setBalance(res.balance);
        setActivity(res.activity);
        return { ok: true };
      }

      if (!memberToken) return { ok: false, error: "not_enrolled" };
      if (!partner.catalogItemId) return { ok: false, error: "unavailable" };

      try {
        const res = await fetch("/api/rewards/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_token: memberToken, catalog_item_id: partner.catalogItemId }),
        });
        const data = (await res.json()) as {
          balance?: number;
          redemptionCode?: string;
          error?: string;
        };
        if (!res.ok || typeof data.balance !== "number") {
          return { ok: false, error: data.error ?? "redeem_failed" };
        }
        setBalance(data.balance);
        setActivity((prev) => [
          {
            id: crypto.randomUUID(),
            label: `${partner.perk} at ${partner.name}`,
            points: -partner.pointsCost,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        return { ok: true, code: data.redemptionCode };
      } catch {
        return { ok: false, error: "network_error" };
      }
    },
    [demo, memberToken]
  );

  return {
    balance,
    partners,
    activity,
    loading,
    demo,
    signedUp,
    signUp,
    simulateVisit: demo ? simulateVisit : null,
    redeem,
  };
}
