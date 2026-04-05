export const WARDROBE_CATEGORIES = [
  "Hats",
  "Sunglasses",
  "Shirts",
  "T-Shirts",
  "Pants",
  "Jeans",
  "Shorts",
  "Jackets",
  "Jumpers",
  "Underwear",
  "Swimwear",
  "Shoes",
  "Socks",
  "Accessories",
  "Other",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  brand: string | null;
  colour: string | null;
  size: string | null;
  imageUrl: string | null;
  productUrl: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null;
  notes: string | null;
  addedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWardrobeInput {
  name: string;
  category: WardrobeCategory;
  brand?: string;
  colour?: string;
  size?: string;
  imageUrl?: string;
  productUrl?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  addedBy?: string;
}

export type UpdateWardrobeInput = Partial<CreateWardrobeInput>;
