import { getSupabase } from "./supabase.ts";
import type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput } from "../../shared/types/restaurant.ts";

function dbToRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    name: row.name,
    googleMapsUrl: row.google_maps_url,
    websiteUrl: row.website_url,
    phone: row.phone,
    address: row.address,
    city: row.city,
    cuisineType: row.cuisine_type,
    priceRange: row.price_range ? Number(row.price_range) : undefined,
    mealTypes: row.meal_types || [],
    status: row.status,
    imageUrl: row.image_url,
    notes: row.notes,
    ratingRyan: row.rating_ryan ? Number(row.rating_ryan) : undefined,
    ratingEmily: row.rating_emily ? Number(row.rating_emily) : undefined,
    googleReviews: row.google_reviews || undefined,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    addedBy: row.added_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToDb(input: CreateRestaurantInput | UpdateRestaurantInput): any {
  const db: any = {};
  if (input.name !== undefined) db.name = input.name;
  if (input.googleMapsUrl !== undefined) db.google_maps_url = input.googleMapsUrl;
  if (input.websiteUrl !== undefined) db.website_url = input.websiteUrl;
  if (input.phone !== undefined) db.phone = input.phone;
  if (input.address !== undefined) db.address = input.address;
  if (input.city !== undefined) db.city = input.city;
  if (input.cuisineType !== undefined) db.cuisine_type = input.cuisineType;
  if (input.priceRange !== undefined) db.price_range = input.priceRange;
  if (input.mealTypes !== undefined) db.meal_types = input.mealTypes;
  if (input.status !== undefined) db.status = input.status;
  if (input.imageUrl !== undefined) db.image_url = input.imageUrl;
  if (input.notes !== undefined) db.notes = input.notes;
  if (input.ratingRyan !== undefined) db.rating_ryan = input.ratingRyan;
  if (input.ratingEmily !== undefined) db.rating_emily = input.ratingEmily;
  if (input.googleReviews !== undefined) db.google_reviews = input.googleReviews;
  if (input.latitude !== undefined) db.latitude = input.latitude;
  if (input.longitude !== undefined) db.longitude = input.longitude;
  if (input.addedBy !== undefined) db.added_by = input.addedBy;
  return db;
}

interface RestaurantFilters {
  city?: string;
  cuisineType?: string;
  status?: string;
  priceRange?: number;
  mealType?: string;
}

export async function listRestaurants(filters?: RestaurantFilters): Promise<Restaurant[]> {
  const supabase = getSupabase();
  let query = supabase.from("restaurants").select("*").order("name", { ascending: true });

  if (filters?.city) query = query.eq("city", filters.city);
  if (filters?.cuisineType) query = query.eq("cuisine_type", filters.cuisineType);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.priceRange) query = query.lte("price_range", filters.priceRange);
  if (filters?.mealType) query = query.contains("meal_types", [filters.mealType]);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(dbToRestaurant);
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return dbToRestaurant(data);
}

export async function createRestaurant(input: CreateRestaurantInput): Promise<Restaurant> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("restaurants")
    .insert(inputToDb(input))
    .select()
    .single();

  if (error) throw error;
  return dbToRestaurant(data);
}

export async function updateRestaurant(id: string, input: UpdateRestaurantInput): Promise<Restaurant | null> {
  const supabase = getSupabase();
  const dbData = inputToDb(input);
  dbData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("restaurants")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return dbToRestaurant(data);
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", id);

  return !error;
}
