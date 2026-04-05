export const EQUIPMENT_CATEGORIES = [
  "Kitchen",
  "Living",
  "Dining",
  "Laundry",
  "Bedrooms",
  "Bathrooms",
  "Garage",
  "Vehicles",
  "Gardening",
  "Other",
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export type EquipmentStatus = "working" | "needs_service" | "retired" | "sold" | "donated" | "thrown_out";

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  status: EquipmentStatus;
  imageUrl?: string;
  productUrl?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  lastServiced?: string;
  nextServiceDue?: string;
  serviceIntervalMonths?: number;
  location?: string;
  addedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentNote {
  id: string;
  equipmentId: string;
  content: string;
  createdBy?: string;
  createdAt: string;
}

export interface CreateEquipmentInput {
  name: string;
  category: string;
  brand?: string;
  model?: string;
  status?: EquipmentStatus;
  imageUrl?: string;
  productUrl?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  lastServiced?: string;
  nextServiceDue?: string;
  serviceIntervalMonths?: number;
  location?: string;
  addedBy?: string;
}

export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export interface ScrapedProductInfo {
  name?: string;
  brand?: string;
  model?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
}
