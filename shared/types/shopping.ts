export const SHOPPING_CATEGORIES = [
  "Groceries",
  "Household",
  "Baby",
  "Pets",
  "Health",
  "Other",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  isChecked: boolean;
  addedBy?: string;
  createdAt: string;
}

export interface CreateShoppingItemInput {
  name: string;
  quantity?: number;
  category?: string;
  addedBy?: string;
}
