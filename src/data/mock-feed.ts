import type { FeedItem } from "@/types";

export const mockFeed: FeedItem[] = [
  {
    id: "feed-1",
    type: "blog",
    title: "E-bike safety updates rolling out near Ventura High",
    excerpt:
      "City staff outlined bike lane visibility improvements and rider education plans for spring.",
    imageUrl: "https://images.unsplash.com/photo-1517409095642-1e9a3b8cd5da?w=800&q=80",
    date: "2026-04-18T09:00:00.000Z",
    meta: {
      author: "Ventura Forward Team",
      readMinutes: 4,
    },
  },
  {
    id: "feed-2",
    type: "instagram",
    title: "Fallen trees on Santa Clara cleared after volunteer push",
    excerpt:
      "Weekend cleanup crews removed debris and reopened blocked sidewalk sections.",
    imageUrl: "https://images.unsplash.com/photo-1558227092-d3550af3dfed?w=800&q=80",
    date: "2026-04-17T16:30:00.000Z",
    meta: {
      likes: 812,
      handle: "@downtownventura",
    },
  },
  {
    id: "feed-3",
    type: "podcast",
    title: "City Council recap: housing, traffic calming, and parks",
    excerpt:
      "A quick breakdown of the major council votes and what they mean for residents.",
    imageUrl: "https://images.unsplash.com/photo-1497384401032-218ac81290fd?w=800&q=80",
    date: "2026-04-16T13:15:00.000Z",
    meta: {
      duration: "28:14",
      episode: "VF-042",
    },
  },
  {
    id: "feed-4",
    type: "blog",
    title: "Main Street Moves pilot enters next phase",
    excerpt:
      "Street closure data and local business feedback are being reviewed this week.",
    imageUrl: "https://images.unsplash.com/photo-1519062325357-195fd402b8d0?w=800&q=80",
    date: "2026-04-15T10:20:00.000Z",
    meta: {
      author: "Mobility Desk",
      readMinutes: 5,
    },
  },
  {
    id: "feed-5",
    type: "instagram",
    title: "Community Q&A on Flock camera rollout",
    excerpt:
      "Residents asked privacy and transparency questions at the civic center forum.",
    imageUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80",
    date: "2026-04-14T19:05:00.000Z",
    meta: {
      likes: 534,
      handle: "@venturaforward",
    },
  },
  {
    id: "feed-6",
    type: "podcast",
    title: "Ventura Pier event planning and beach operations",
    excerpt:
      "Organizers discuss cleanup logistics and summer programming around the pier.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    date: "2026-04-13T11:45:00.000Z",
    meta: {
      duration: "19:42",
      episode: "VF-041",
    },
  },
  {
    id: "feed-7",
    type: "blog",
    title: "Neighborhood beautification grants open for applications",
    excerpt:
      "Small project grants are now available for block-level cleanup and mural prep.",
    imageUrl: "https://images.unsplash.com/photo-1606092195730-5d14b5048425?w=800&q=80",
    date: "2026-04-12T08:30:00.000Z",
    meta: {
      author: "Civic Programs",
      readMinutes: 3,
    },
  },
  {
    id: "feed-8",
    type: "instagram",
    title: "Weekend recap: kids rec clinics at seaside parks",
    excerpt:
      "Families turned out for open-play clinics and volunteer coaching sessions.",
    imageUrl: "https://images.unsplash.com/photo-1526676537331-7fd5ab714392?w=800&q=80",
    date: "2026-04-11T21:10:00.000Z",
    meta: {
      likes: 677,
      handle: "@ventura.parks",
    },
  },
];
