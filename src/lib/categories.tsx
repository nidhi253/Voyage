import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import {
  MAX_CATEGORIES,
  loadCategories,
  normalizeCategory,
  removeCategory,
  renameCategory,
  saveCategories,
} from '../data/categories';
import { DEFAULT_CATEGORIES } from '../types';

interface CategoriesValue {
  categories: string[];
  add: (name: string) => Promise<string>;
  rename: (from: string, to: string) => Promise<void>;
  remove: (name: string) => Promise<void>;
}

const Ctx = createContext<CategoriesValue>({
  categories: DEFAULT_CATEGORIES,
  add: async (n) => n,
  rename: async () => {},
  remove: async () => {},
});

export const useCategories = () => useContext(Ctx);

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Holds the user's list of piece types for the Wardrobe screens, and the add/rename/remove actions. */
export function CategoriesProvider({ children }: { children?: ReactNode }) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    loadCategories().then(setCategories);
  }, []);

  const value = useMemo<CategoriesValue>(
    () => ({
      categories,
      async add(raw) {
        const name = normalizeCategory(raw);
        if (!name) throw new Error('Type a name first.');
        if (categories.some((c) => sameName(c, name))) throw new Error(`You already have “${name}”.`);
        if (categories.length >= MAX_CATEGORIES) throw new Error(`You can have up to ${MAX_CATEGORIES} types.`);
        const next = [...categories, name];
        await saveCategories(next);
        setCategories(next);
        return name;
      },
      async rename(from, raw) {
        const to = normalizeCategory(raw);
        if (!to || to === from) return;
        if (categories.some((c) => c !== from && sameName(c, to))) throw new Error(`You already have “${to}”.`);
        setCategories(await renameCategory(categories, from, to));
      },
      async remove(name) {
        setCategories(await removeCategory(categories, name));
      },
    }),
    [categories],
  );

  return <Ctx.Provider value={value}>{children ?? <Outlet />}</Ctx.Provider>;
}
