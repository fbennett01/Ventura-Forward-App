// Types for the Ventura Rewards tables on the SHARED live agency Supabase
// project (ref qpejcptvicvhlidcznkz). This MUST mirror the LIVE schema, which
// is owned/evolved by the separate Ventura Forward dashboard repo — it is the
// source of truth, NOT the historical SQL in supabase/migrations/0002_rewards.
//
// Notes on the live schema this reflects:
//   * Members are named/email sign-ups identified by `member_token` (a UUID
//     credential). There is no `device_id` column.
//   * Vendors use `business_name` + `status` (active/paused/ended) and a
//     `vendor_token`. There is no `name`/`active`/`category` column.
//   * Transactions use `kind` (text), `catalog_id`, `amount_cents`, `note`,
//     and `jti` (the QR replay nonce). `points` is signed (+earn / -redeem).
//   * Point awards go through `vf_rewards_earn` (replay-guarded). Balances are
//     computed by summing `points` (path-independent), not by reading
//     `points_balance` — see lib/rewards/members.ts.
//
// Regenerate against the live project if the schema changes; do not hand-drift.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface RewardsDatabase {
  public: {
    Tables: {
      rewards_vendors: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          business_name: string;
          contact_email: string | null;
          deal_offered: string | null;
          status: string;
          vendor_token: string;
          slug: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          logo_url: string | null;
          points_per_checkin: number;
          checkin_cooldown_minutes: number;
          is_demo: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          business_name: string;
          contact_email?: string | null;
          deal_offered?: string | null;
          status?: string;
          vendor_token?: string;
          slug?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          logo_url?: string | null;
          points_per_checkin?: number;
          checkin_cooldown_minutes?: number;
          is_demo?: boolean;
        };
        Update: Partial<RewardsDatabase["public"]["Tables"]["rewards_vendors"]["Insert"]>;
        Relationships: [];
      };
      rewards_catalog: {
        Row: {
          id: string;
          created_at: string;
          vendor_id: string;
          title: string;
          description: string | null;
          points_cost: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          vendor_id: string;
          title: string;
          description?: string | null;
          points_cost: number;
          is_active?: boolean;
        };
        Update: Partial<RewardsDatabase["public"]["Tables"]["rewards_catalog"]["Insert"]>;
        Relationships: [];
      };
      rewards_members: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string | null;
          member_token: string;
          user_id: string | null;
          points_balance: number;
          is_demo: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          member_token?: string;
          user_id?: string | null;
          points_balance?: number;
          is_demo?: boolean;
        };
        Update: Partial<RewardsDatabase["public"]["Tables"]["rewards_members"]["Insert"]>;
        Relationships: [];
      };
      rewards_transactions: {
        Row: {
          id: string;
          created_at: string;
          member_id: string;
          vendor_id: string | null;
          catalog_id: string | null;
          kind: string | null;
          points: number;
          amount_cents: number;
          note: string | null;
          jti: string | null;
          source: string | null;
          redemption_code: string | null;
          created_by: string | null;
          metadata: Json | null;
          fulfilled_at: string | null;
          fulfilled_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          member_id: string;
          vendor_id?: string | null;
          catalog_id?: string | null;
          kind?: string | null;
          points?: number;
          amount_cents?: number;
          note?: string | null;
          jti?: string | null;
          source?: string | null;
          redemption_code?: string | null;
          created_by?: string | null;
          metadata?: Json | null;
          fulfilled_at?: string | null;
          fulfilled_by?: string | null;
        };
        Update: Partial<RewardsDatabase["public"]["Tables"]["rewards_transactions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Award points with a replay guard: a repeated scan carrying the same
      // p_nonce (stored as `jti`) raises `duplicate_nonce` instead of
      // double-crediting. Returns the member's updated points_balance.
      vf_rewards_earn: {
        Args: {
          p_member_id: string;
          p_vendor_id: string;
          p_points: number;
          p_nonce: string;
          p_source?: string | null;
          p_created_by?: string | null;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
