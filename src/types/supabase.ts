export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          created_at: string;
          category:
            | "trash"
            | "graffiti"
            | "pothole"
            | "abandoned"
            | "hazard"
            | "other";
          description: string | null;
          photo_path: string | null;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          status: "new" | "reviewing" | "in_progress" | "resolved";
          reporter_device_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          category:
            | "trash"
            | "graffiti"
            | "pothole"
            | "abandoned"
            | "hazard"
            | "other";
          description?: string | null;
          photo_path?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          status?: "new" | "reviewing" | "in_progress" | "resolved";
          reporter_device_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          category?:
            | "trash"
            | "graffiti"
            | "pothole"
            | "abandoned"
            | "hazard"
            | "other";
          description?: string | null;
          photo_path?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          status?: "new" | "reviewing" | "in_progress" | "resolved";
          reporter_device_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      report_category: "trash" | "graffiti" | "pothole" | "abandoned" | "hazard" | "other";
      report_status: "new" | "reviewing" | "in_progress" | "resolved";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}