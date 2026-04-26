export const DREAMHOME_TAG_GROUPS = {
  Rooms: [
    "Games Room",
    "Home Cinema",
    "Home Office",
    "Gym",
    "Outdoor Area",
    "Pool",
    "Living Room",
    "Kitchen",
    "Bedrooms",
    "Bathrooms",
    "Home Library",
    "Laundry",
    "Patio",
    "Garage",
    "Dining Room",
    "Entry",
    "Walk-in Closet",
    "Balcony",
    "Garden",
    "Theatre Room",
    "Bedroom",
    "Bathroom",
    "Facade",
  ],
  Design: [
    "Contemporary",
    "Mid Century Modern",
    "European",
    "Modern",
    "Minimalist",
    "Industrial",
    "Scandinavian",
    "Coastal",
    "Timber Tones",
    "Earth Tones",
    "Beige",
    "Grey",
    "Black",
    "White",
    "Other",
  ],
} as const;

export type DreamHomeTagGroup = keyof typeof DREAMHOME_TAG_GROUPS;

type TagValues<G extends DreamHomeTagGroup> =
  (typeof DREAMHOME_TAG_GROUPS)[G][number];

export type DreamHomeTag =
  | TagValues<"Rooms">
  | TagValues<"Design">;

export const ALL_TAGS: DreamHomeTag[] = Object.values(
  DREAMHOME_TAG_GROUPS
).flat() as DreamHomeTag[];

export interface DreamHomeImageTag {
  tag: DreamHomeTag;
  confidence: number;
}

export interface DreamHomeImage {
  id: string;
  sourceUrl: string | null;
  imageUrl: string;
  originalImageUrl: string | null;
  title: string | null;
  notes: string | null;
  sourceDomain: string | null;
  aiDescription: string | null;
  tags: DreamHomeImageTag[];
  createdAt: string;
}

export interface DreamHomeScrapeJob {
  status: "processing" | "complete" | "error";
  progress: { total: number; done: number };
  images: DreamHomeImage[];
  error?: string;
}

export interface DreamHomeListingScrapeResult {
  title: string | null;
  imageUrls: string[];
  domain: string;
}

export interface DreamHomeTagCount {
  tag: string;
  count: number;
}
