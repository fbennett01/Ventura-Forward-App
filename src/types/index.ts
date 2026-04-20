import type { LucideIcon } from 'lucide-react'

export type { LucideIcon }

export type FeedItemType = "blog" | "podcast" | "instagram";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: Record<string, any>;
}

export type Pillar = "Safety" | "Public" | "Land" | "Beautify" | "Recreation";

export interface Meeting {
  id: string;
  title: string;
  datetime: string;
  location: string;
  pillar: Pillar;
  agendaHighlight: string;
}

export interface Partner {
  id: string;
  name: string;
  category: "food" | "fitness" | "lodging" | "cafe";
  address: string;
  pointsCost: number;
  perk: string;
  logoUrl: string;
}

export type ReportCategory = "trash" | "graffiti" | "pothole" | "abandoned" | "hazard" | "other";

export type ReportStatus = "new" | "reviewing" | "in_progress" | "resolved";