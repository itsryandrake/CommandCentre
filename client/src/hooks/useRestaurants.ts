import { useState, useEffect, useCallback } from "react";
import type { Restaurant, CreateRestaurantInput, UpdateRestaurantInput } from "@shared/types/restaurant";
import {
  fetchRestaurants,
  createRestaurantItem,
  updateRestaurantItem,
  deleteRestaurantItem,
} from "@/lib/api";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchRestaurants();
    setRestaurants(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (input: CreateRestaurantInput) => {
    const item = await createRestaurantItem(input);
    if (item) {
      await load();
    }
    return item;
  };

  const update = async (id: string, input: UpdateRestaurantInput) => {
    const item = await updateRestaurantItem(id, input);
    if (item) {
      await load();
    }
    return item;
  };

  const remove = async (id: string) => {
    const success = await deleteRestaurantItem(id);
    if (success) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
    }
    return success;
  };

  return {
    restaurants,
    isLoading,
    create,
    update,
    remove,
    reload: load,
  };
}
