import { getMyProfile, updateMyProfile } from './profile';
import { moveItemsCategory } from './wardrobe';
import { DEFAULT_CATEGORIES } from '../types';

export const MAX_CATEGORIES = 20;
export const MAX_CATEGORY_LENGTH = 24;

export function normalizeCategory(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_CATEGORY_LENGTH);
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

/** The user's own list of piece types, or the defaults if they haven't customised it (or the column isn't there yet). */
export async function loadCategories(): Promise<string[]> {
  try {
    const profile = await getMyProfile();
    const mine = profile?.categories;
    return mine && mine.length > 0 ? mine : [...DEFAULT_CATEGORIES];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

function categoriesError(err: unknown): Error {
  const e = err as { code?: string; message?: string };
  if (e?.code === 'PGRST204' || e?.code === '42703' || /categories/i.test(e?.message ?? '')) {
    return new Error('Custom types need a one-time database update — run supabase/categories.sql in the Supabase SQL editor.');
  }
  return err instanceof Error ? err : new Error('Couldn’t save your types.');
}

export async function saveCategories(list: string[]): Promise<void> {
  try {
    await updateMyProfile({ categories: list });
  } catch (e) {
    throw categoriesError(e);
  }
}

/** Renames a type: saves the new list, then moves the pieces; puts the old list back if the move fails. */
export async function renameCategory(current: string[], from: string, to: string): Promise<string[]> {
  const next = current.map((c) => (c === from ? to : c));
  await saveCategories(next);
  try {
    await moveItemsCategory(from, to);
  } catch (e) {
    await saveCategories(current).catch(() => {});
    throw e;
  }
  return next;
}

/** Removes a type; its pieces move to "Other" (or the first remaining type if "Other" itself is removed). */
export async function removeCategory(current: string[], name: string): Promise<string[]> {
  const rest = current.filter((c) => c !== name);
  if (rest.length === 0) throw new Error('You need at least one type.');
  let fallback = 'Other';
  let next = rest;
  if (name === 'Other') fallback = rest[0];
  else if (!rest.includes('Other')) next = [...rest, 'Other'];
  await saveCategories(next);
  try {
    await moveItemsCategory(name, fallback);
  } catch (e) {
    await saveCategories(current).catch(() => {});
    throw e;
  }
  return next;
}
