"use client";

import { useCallback, useEffect, useState } from "react";
import { mockPartners } from "@/data/mock-partners";
import { getDeviceId } from "@/lib/device-id";
import { demoEarn, demoRedeem, getDemoState, isRewardsDemo } from "@/lib/rewards/demo";
import type {
  RewardsActivity,
  RewardsMeResponse,
  RewardsVendorsResponse,
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
  /** Demo-only: simulate a visit that earns points. `null` in live mode. */
  simulateVisit: (() => void) | null;
  /** Redeem a partner's perk (demo or live). */
  redeem: (partner: Partner) => Promise<RedeemResult>;
}

export function useRewards(): UseRewards {
  const demo = isRewardsDemo();
  const [balance, setBalance] = useState<number>(0);
  const [partners, setPartners] = useState<Partner[]>(demo ? mockPartners : []);
  const [activity, setActivity] = useState<RewardsActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

    void (async () => {
      try {
        const deviceId = getDeviceId();
        const [meRes, vendorsRes] = await Promise.all([
          fetch("/api/rewards/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_id: deviceId }),
          }),
          fetch("/api/rewards/vendors"),
        ]);

        if (meRes.ok && !cancelled) {
          const me = (await meRes.json()) as RewardsMeResponse;
          setBalance(me.balance);
          setActivity(me.activity);
        }
        if (vendorsRes.ok && !cancelled) {
          const v = (await vendorsRes.json()) as RewardsVendorsResponse;
          setPartners(v.partners);
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
  }, [demo]);

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

      if (!partner.catalogItemId) {
        return { ok: false, error: "unavailable" };
      }

      try {
        const deviceId = getDeviceId();
        const res = await fetch("/api/rewards/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: deviceId, catalog_item_id: partner.catalogItemId }),
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
    [demo]
  );

  return {
    balance,
    partners,
    activity,
    loading,
    demo,
    simulateVisit: demo ? simulateVisit : null,
    redeem,
  };
}
