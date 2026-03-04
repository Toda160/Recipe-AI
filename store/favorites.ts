import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe } from "../types/Recipe";

const STORAGE_KEY = "favorites_v1";

let favorites: Recipe[] = [];
const listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.warn("Failed to persist favorites", e);
  }
}

async function load() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Recipe[];
      if (Array.isArray(parsed)) {
        favorites = parsed;
        notify();
      }
    }
  } catch (e) {
    console.warn("Failed to load favorites", e);
  }
}

// load on module initialization (fire and forget)
(async () => {
  await load();
})();

export function getFavorites(): Recipe[] {
  return favorites;
}

export function isFavorite(id?: string): boolean {
  if (!id) return false;
  return favorites.some((f) => f.id === id);
}

export function addFavorite(r: Recipe) {
  const id = r.id ?? `recipe-${Date.now()}`;
  if (!favorites.some((f) => f.id === id)) {
    favorites.push({ ...r, id });
    persist();
    notify();
  }
}

export function removeFavorite(id?: string) {
  if (!id) return;
  const before = favorites.length;
  favorites = favorites.filter((f) => f.id !== id);
  if (favorites.length !== before) {
    persist();
    notify();
  }
}

export function toggleFavorite(r: Recipe) {
  if (r.id && isFavorite(r.id)) {
    removeFavorite(r.id);
  } else {
    addFavorite(r);
  }
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
