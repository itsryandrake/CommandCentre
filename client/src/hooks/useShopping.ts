import { useState, useEffect, useCallback } from "react";
import type { ShoppingItem, CreateShoppingItemInput } from "@shared/types/shopping";
import {
  fetchShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
} from "@/lib/api";

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchShoppingItems();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (input: CreateShoppingItemInput) => {
    const item = await createShoppingItem(input);
    if (item) setItems((prev) => [item, ...prev]);
    return item;
  };

  const toggle = async (id: string, isChecked: boolean) => {
    const updated = await updateShoppingItem(id, { isChecked });
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  };

  const remove = async (id: string) => {
    const success = await deleteShoppingItem(id);
    if (success) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearChecked = async () => {
    const success = await clearCheckedShoppingItems();
    if (success) setItems((prev) => prev.filter((i) => !i.isChecked));
  };

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);

  return { items, unchecked, checked, isLoading, add, toggle, remove, clearChecked, reload: load };
}
