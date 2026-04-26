export const RESTAURANT_CITIES = [
  "Brisbane",
  "Melbourne",
  "Sydney",
  "New York",
  "London",
  "Paris",
  "Dubai",
  "Bali",
] as const;

export type RestaurantCity = (typeof RESTAURANT_CITIES)[number];

export const CUISINE_TYPES = [
  "Italian",
  "Japanese",
  "Chinese",
  "Thai",
  "Indian",
  "Mexican",
  "French",
  "Korean",
  "Vietnamese",
  "Greek",
  "Lebanese",
  "American",
  "Seafood",
  "Steakhouse",
  "Cafe",
  "Brunch",
  "Pub",
  "Pizza",
  "Burger",
  "Other",
] as const;

export type CuisineType = (typeof CUISINE_TYPES)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export type RestaurantStatus = "want_to_try" | "would_go_back" | "would_not_go_back";

export const PRICE_RANGE_LABELS: Record<number, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface Restaurant {
  id: string;
  name: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  phone?: string;
  address?: string;
  city: string;
  cuisineType?: string;
  priceRange?: number;
  mealTypes: string[];
  status: RestaurantStatus;
  imageUrl?: string;
  notes?: string;
  ratingRyan?: number;
  ratingEmily?: number;
  googleReviews?: GoogleReview[];
  latitude?: number;
  longitude?: number;
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantInput {
  name: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  phone?: string;
  address?: string;
  city: string;
  cuisineType?: string;
  priceRange?: number;
  mealTypes?: string[];
  status?: RestaurantStatus;
  imageUrl?: string;
  notes?: string;
  ratingRyan?: number;
  ratingEmily?: number;
  googleReviews?: GoogleReview[];
  latitude?: number;
  longitude?: number;
  addedBy?: string;
}

export type UpdateRestaurantInput = Partial<CreateRestaurantInput>;

export interface ScrapedRestaurantInfo {
  name?: string;
  address?: string;
  phone?: string;
  cuisineType?: string;
  priceRange?: number;
  imageUrl?: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
}
