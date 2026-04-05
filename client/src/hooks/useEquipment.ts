import { useState, useEffect, useCallback } from "react";
import type { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from "@shared/types/equipment";
import {
  fetchEquipment,
  createEquipmentItem,
  updateEquipmentItem,
  deleteEquipmentItem,
} from "@/lib/api";

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchEquipment(categoryFilter);
    setEquipment(data);
    setIsLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (input: CreateEquipmentInput) => {
    const item = await createEquipmentItem(input);
    if (item) {
      await load();
    }
    return item;
  };

  const update = async (id: string, input: UpdateEquipmentInput) => {
    const item = await updateEquipmentItem(id, input);
    if (item) {
      await load();
    }
    return item;
  };

  const remove = async (id: string) => {
    const success = await deleteEquipmentItem(id);
    if (success) {
      setEquipment((prev) => prev.filter((e) => e.id !== id));
    }
    return success;
  };

  return {
    equipment,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    create,
    update,
    remove,
    reload: load,
  };
}
