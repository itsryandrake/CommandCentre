export const DREAMHOME_TAG_GROUPS = {
  "Room / Area": [
    "Bedroom",
    "Bathroom",
    "Ensuite",
    "Living Room",
    "Dining Room",
    "Kitchen",
    "Laundry",
    "Pantry",
    "Home Office",
    "Games Room",
    "Sex Room",
    "Theatre Room",
    "Garage",
    "Wine Cellar",
    "Gym",
    "Walk-in Closet",
    "Garden",
    "Pool",
    "Yard",
    "Patio",
    "Deck",
    "Balcony",
    "Courtyard",
    "Facade",
    "Entrance",
    "Driveway",
  ],
  Style: [
    "Art Deco",
    "Balinese",
    "Coastal",
    "Contemporary",
    "Farmhouse",
    "Hamptons",
    "Industrial",
    "Japanese",
    "Mediterranean",
    "Mid-Century Modern",
    "Minimalist",
    "Modern",
    "Rustic",
    "Scandinavian",
    "Traditional",
    "Tropical",
  ],
  Colour: [
    "White",
    "Black",
    "Grey",
    "Cream",
    "Beige",
    "Navy",
    "Green",
    "Blue",
    "Terracotta",
    "Timber Tones",
    "Earth Tones",
    "Monochrome",
  ],
} as const;

export type DreamHomeTagGroup = keyof typeof DREAMHOME_TAG_GROUPS;

type TagValues<G extends DreamHomeTagGroup> =
  (typeof DREAMHOME_TAG_GROUPS)[G][number];

export type DreamHomeTag =
  | TagValues<"Room / Area">
  | TagValues<"Style">
  | TagValues<"Colour">;

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
