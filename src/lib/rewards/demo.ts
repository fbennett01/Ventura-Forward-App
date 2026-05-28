/**
 * Ventura Rewards — demo mode.
 *
 * Demo mode keeps all points in localStorage and never touches the shared
 * live agency DB. It is the DEFAULT: rewards only goes "live" when the
 * rewards Supabase project is configured.
 *
 * Rules:
 *   - `NEXT_PUBLIC_REWARDS_DEMO=true`  → always demo (explicit opt-in).
 *   - rewards Supabase URL unset       → demo (auto-fallback; e.g. previews).
 *   - otherwise                        → live.
 *
 * Safe to import from both server and client (the env reads are NEXT_PUBLIC).
 */
import type { RewardsActivity } from "./types";

export function isRewardsDemo(): boolean {
  if (process.env.NEXT_PUBLIC_REWARDS_DEMO === "true") return true;
  return !process.env.NEXT_PUBLIC_REWARDS_SUPABASE_URL;
}

const DEMO_KEY = "vf_rewards_demo";

export interface DemoState {
  balance: number;
  activity: RewardsActivity[];
}

// Initial state mirrors the static mock the Rewards tab shipped with, so the
// demo experience looks identical after Phase 2 wires the page to this store.
const INITIAL_STATE: DemoState = {
  balance: 47,
  activity: [
    { id: "seed-1", label: "+5 pts at Cafe Zack", points: 5, createdAt: daysAgo(2) },
    { id: "seed-2", label: "+3 pts at Pizza Chief", points: 3, createdAt: daysAgo(5) },
    { id: "seed-3", label: "Free coffee at Pete's", points: 0, createdAt: daysAgo(7) },
  ],
};

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function read(): DemoState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      balance: typeof parsed.balance === "number" ? parsed.balance : INITIAL_STATE.balance,
      activity: Array.isArray(parsed.activity) ? parsed.activity : INITIAL_STATE.activity,
    };
  } catch {
    return INITIAL_STATE;
  }
}

function write(state: DemoState): DemoState {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  }
  return state;
}

export function getDemoState(): DemoState {
  return read();
}

export function demoEarn(vendorName: string, points: number): DemoState {
  const state = read();
  return write({
    balance: state.balance + points,
    activity: [
      { id: crypto.randomUUID(), label: `+${points} pts at ${vendorName}`, points, createdAt: new Date().toISOString() },
      ...state.activity,
    ],
  });
}

export function demoRedeem(
  vendorName: string,
  perk: string,
  cost: number
): DemoState | { error: "insufficient_points" } {
  const state = read();
  if (state.balance < cost) return { error: "insufficient_points" };
  return write({
    balance: state.balance - cost,
    activity: [
      { id: crypto.randomUUID(), label: `${perk} at ${vendorName}`, points: -cost, createdAt: new Date().toISOString() },
      ...state.activity,
    ],
  });
}

export function resetDemo(): DemoState {
  return write(INITIAL_STATE);
}
