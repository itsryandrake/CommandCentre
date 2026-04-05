import { useState, useEffect, useCallback } from "react";

// --- Types ---

export interface CollectionItem {
  id: string;
  name: string;
  url: string;
  image: string;
  category: string;
  price: number;
  type: string;
}

export interface GameState {
  score: number;
  currentIndex: number;
  [key: string]: unknown;
}

// --- Helpers ---

const STORAGE_PREFIX = "sanctuary_";

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(getStorageKey(key), JSON.stringify(value));
}

// --- useCollection ---

interface UseCollectionReturn {
  items: CollectionItem[];
  add: (item: CollectionItem) => void;
  update: (id: string, updates: Partial<Omit<CollectionItem, "id">>) => void;
  remove: (id: string) => void;
  getById: (id: string) => CollectionItem | undefined;
}

export function useCollection(): UseCollectionReturn {
  const storageKey = "collection";
  const [items, setItems] = useState<CollectionItem[]>(() =>
    readStorage<CollectionItem[]>(storageKey, [])
  );

  useEffect(() => {
    writeStorage(storageKey, items);
  }, [items]);

  const add = useCallback((item: CollectionItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const update = useCallback(
    (id: string, updates: Partial<Omit<CollectionItem, "id">>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  return { items, add, update, remove, getById };
}

// --- useFavourites ---

interface UseFavouritesReturn {
  favourites: string[];
  isFavourite: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

export function useFavourites(key: string): UseFavouritesReturn {
  const storageKey = `favourites_${key}`;
  const [favourites, setFavourites] = useState<string[]>(() =>
    readStorage<string[]>(storageKey, [])
  );

  useEffect(() => {
    writeStorage(storageKey, favourites);
  }, [storageKey, favourites]);

  const isFavourite = useCallback(
    (id: string) => favourites.includes(id),
    [favourites]
  );

  const toggle = useCallback((id: string) => {
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  const clear = useCallback(() => {
    setFavourites([]);
  }, []);

  return { favourites, isFavourite, toggle, clear };
}

// --- useGameState ---

interface UseGameStateReturn {
  state: GameState;
  update: (updates: Partial<GameState>) => void;
  reset: () => void;
}

const DEFAULT_GAME_STATE: GameState = {
  score: 0,
  currentIndex: 0,
};

export function useGameState(key: string): UseGameStateReturn {
  const storageKey = `game_${key}`;
  const [state, setState] = useState<GameState>(() =>
    readStorage<GameState>(storageKey, DEFAULT_GAME_STATE)
  );

  useEffect(() => {
    writeStorage(storageKey, state);
  }, [storageKey, state]);

  const update = useCallback((updates: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_GAME_STATE);
  }, []);

  return { state, update, reset };
}
