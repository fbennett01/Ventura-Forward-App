// Types for the Ventura Rewards Supabase project (separate from the reports
// project in ./supabase.ts). Mirrors supabase/migrations/0002_rewards.sql.
//
// Regenerate after schema changes with the Supabase CLI / MCP type generator;
// kept hand-written here so the typed service client compiles before the
// migration is applied.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RewardsTxnType = "earn" | "redeem" | "adjust";

export interface RewardsDatabase {
  public: {
    Tables: {
      rewards_vendors: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          slug: string;
          category: "food" | "fitness" | "lodging" | "cafe";
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          logo_url: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          slug: string;
          category: "food" | "fitness" | "lodging" | "cafe";
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          logo_url?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          slug?: string;
          category?: "food" | "fitness" | "lodging" | "cafe";
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          logo_url?: string | null;
          active?: boolean;
        };
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
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          vendor_id: string;
          title: string;
          description?: string | null;
          points_cost: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          vendor_id?: string;
          title?: string;
          description?: string | null;
          points_cost?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      rewards_members: {
        Row: {
          id: string;
          created_at: string;
          device_id: string;
          email: string | null;
          phone: string | null;
          points_balance: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          device_id: string;
          email?: string | null;
          phone?: string | null;
          points_balance?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          device_id?: string;
          email?: string | null;
          phone?: string | null;
          points_balance?: number;
        };
        Relationships: [];
      };
      rewards_transactions: {
        Row: {
          id: string;
          created_at: string;
          member_id: string;
          vendor_id: string | null;
          catalog_item_id: string | null;
          type: RewardsTxnType;
          points: number;
          qr_nonce: string | null;
          source: string | null;
          redemption_code: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          member_id: string;
          vendor_id?: string | null;
          catalog_item_id?: string | null;
          type: RewardsTxnType;
          points: number;
          qr_nonce?: string | null;
          source?: string | null;
          redemption_code?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          member_id?: string;
          vendor_id?: string | null;
          catalog_item_id?: string | null;
          type?: RewardsTxnType;
          points?: number;
          qr_nonce?: string | null;
          source?: string | null;
          redemption_code?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      rewards_vendor_users: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          vendor_id: string;
          role: "staff" | "manager" | "admin";
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          vendor_id: string;
          role?: "staff" | "manager" | "admin";
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          vendor_id?: string;
          role?: "staff" | "manager" | "admin";
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      vf_rewards_earn: {
        Args: {
          p_member_id: string;
          p_vendor_id: string;
          p_points: number;
          p_nonce?: string | null;
          p_source?: string | null;
          p_created_by?: string | null;
        };
        Returns: number;
      };
      vf_rewards_redeem: {
        Args: {
          p_member_id: string;
          p_catalog_item_id: string;
          p_created_by?: string | null;
        };
        Returns: { new_balance: number; redemption_code: string }[];
      };
      vf_rewards_adjust: {
        Args: {
          p_member_id: string;
          p_points: number;
          p_reason?: string | null;
          p_created_by?: string | null;
        };
        Returns: number;
      };
    };
    Enums: {
      rewards_txn_type: RewardsTxnType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
