import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchWardrobe,
  createWardrobeItem,
  updateWardrobeItemApi,
  deleteWardrobeItemApi,
} from "@/lib/api";
import type {
  WardrobeItem,
  CreateWardrobeInput,
  UpdateWardrobeInput,
} from "@shared/types/wardrobe";

export function useWardrobe() {
  const [allItems, setAllItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [brandFilter, setBrandFilter] = useState<string | undefined>();
  const [colourFilter, setColourFilter] = useState<string | undefined>();
  const [sizeFilter, setSizeFilter] = useState<string | undefined>();
  const [personFilter, setPersonFilter] = useState<string | undefined>();

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchWardrobe();
    setAllItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Client-side filtering
  const items = useMemo(() => {
    let filtered = allItems;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.colour?.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((i) => i.category === categoryFilter);
    }
    if (brandFilter) {
      filtered = filtered.filter((i) => i.brand === brandFilter);
    }
    if (colourFilter) {
      filtered = filtered.filter((i) => i.colour === colourFilter);
    }
    if (sizeFilter) {
      filtered = filtered.filter((i) => i.size === sizeFilter);
    }
    if (personFilter) {
      filtered = filtered.filter((i) => i.addedBy === personFilter);
    }

    return filtered;
  }, [allItems, search, categoryFilter, brandFilter, colourFilter, sizeFilter, personFilter]);

  const create = async (input: CreateWardrobeInput) => {
    const item = await createWardrobeItem(input);
    if (item) await load();
    return item;
  };

  const update = async (id: string, input: UpdateWardrobeInput) => {
    const item = await updateWardrobeItemApi(id, input);
    if (item) await load();
    return item;
  };

  const remove = async (id: string) => {
    const success = await deleteWardrobeItemApi(id);
    if (success) setAllItems((prev) => prev.filter((i) => i.id !== id));
    return success;
  };

  // Derive unique values from ALL items (not filtered) for dropdown options
  const allBrands = [...new Set(allItems.map((i) => i.brand).filter(Boolean))] as string[];
  const allColours = [...new Set(allItems.map((i) => i.colour).filter(Boolean))] as string[];
  const allSizes = [...new Set(allItems.map((i) => i.size).filter(Boolean))] as string[];
  const allPeople = [...new Set(allItems.map((i) => i.addedBy).filter(Boolean))] as string[];

  return {
    items,
    allItems,
    isLoading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    brandFilter,
    setBrandFilter,
    colourFilter,
    setColourFilter,
    sizeFilter,
    setSizeFilter,
    personFilter,
    setPersonFilter,
    allBrands,
    allColours,
    allSizes,
    allPeople,
    create,
    update,
    remove,
    reload: load,
  };
}
