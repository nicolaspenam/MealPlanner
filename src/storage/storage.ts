import { emptyAppData, type AppData } from "../domain/types";

export const STORAGE_KEY = "meal-planner:v1";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const browserStorage: StorageAdapter = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
  },
};

export function loadAppData(storage: StorageAdapter): AppData {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyAppData();
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    const fallback = emptyAppData();
    return {
      ...fallback,
      ...parsed,
      settings: { ...fallback.settings, ...parsed.settings },
    };
  } catch {
    return emptyAppData();
  }
}

export function saveAppData(storage: StorageAdapter, data: AppData): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function memoryStorage(initial: Record<string, string> = {}): StorageAdapter {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}
