import type { Partner } from "@/types";

// Shared shapes for the Rewards data layer so the demo store (localStorage)
// and the live API return identical structures to the UI.

export interface RewardsActivity {
  id: string;
  label: string;
  points: number; // signed: + earn, - redeem
  createdAt: string; // ISO
}

export interface RewardsMeResponse {
  balance: number;
  activity: RewardsActivity[];
  /** Member display name (live mode only). */
  name?: string;
}

export interface RewardsVendorsResponse {
  partners: Partner[];
}

// Live-mode member enrollment.
export interface SignUpInput {
  name: string;
  email: string;
  phone?: string;
}

export type SignUpResult = { ok: true } | { ok: false; error: string };
