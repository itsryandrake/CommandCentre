export const WISHLIST_ROOMS = [
  "Bathroom",
  "Bedroom",
  "Games Room",
  "Gym",
  "Home Cinema",
  "Home Office",
  "Kitchen",
  "Laundry",
  "Living Room",
  "Outdoor Area",
  "Uncategorised",
] as const;

export type WishlistRoom = (typeof WISHLIST_ROOMS)[number];

export const WISHLIST_PRIORITIES = ["Must-have", "Should-have", "Nice-to-have"] as const;
export type WishlistPriority = (typeof WISHLIST_PRIORITIES)[number];

export const WISHLIST_STATUSES = ["Wanted", "Bought", "Dismissed"] as const;
export type WishlistStatus = (typeof WISHLIST_STATUSES)[number];

export interface WishlistItem {
  id: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  domain: string | null;
  title: string;
  description: string | null;
  price: number | null;
  room: WishlistRoom;
  priority: WishlistPriority;
  status: WishlistStatus;
  quantity: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWishlistFromUrlInput {
  url: string;
}

export type UpdateWishlistInput = Partial<
  Pick<
    WishlistItem,
    | "title"
    | "description"
    | "imageUrl"
    | "sourceUrl"
    | "price"
    | "room"
    | "priority"
    | "status"
    | "quantity"
    | "notes"
  >
>;
