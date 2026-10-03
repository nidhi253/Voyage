import { supabase } from '../lib/supabase';
import { PREVIEW, loadMock } from '../dev/preview';
import { toJpeg } from '../lib/image';
import type { OutfitSuggestion, OutfitWithItems, WardrobeItem } from '../types';

const BUCKET = 'wardrobe-images';

/** The occasions column is a one-time database update (supabase/occasions.sql); say so clearly if it's missing. */
function occasionsError(err: { code?: string; message?: string }): Error {
  if (err.code === 'PGRST204' || err.code === '42703' || /occasions/i.test(err.message ?? '')) {
    return new Error('Occasions need a one-time database update — run supabase/occasions.sql in the Supabase SQL editor.');
  }
  return new Error(err.message ?? 'Something went wrong.');
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('You need to be signed in.');
  return data.user.id;
}

export async function listItems(): Promise<WardrobeItem[]> {
  if (PREVIEW) return (await loadMock()).listItems();
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = data as Omit<WardrobeItem, 'signedUrl'>[];
  if (rows.length === 0) return [];
  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rows.map((r) => r.image_url), 3600);
  if (signError) throw signError;
  const urlByPath = new Map(signed.map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({ ...r, signedUrl: urlByPath.get(r.image_url) ?? '' }));
}

export interface UploadEntry {
  file: File;
  category: string;
}

async function uploadOne(userId: string, { file, category }: UploadEntry): Promise<void> {
  const itemId = crypto.randomUUID();
  const path = `${userId}/${itemId}.jpg`;
  const blob = await toJpeg(file);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) throw uploadError;
  const { error: insertError } = await supabase
    .from('wardrobe_items')
    .insert({ id: itemId, user_id: userId, image_url: path, category });
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw insertError;
  }
}

/**
 * Uploads pieces to {user_id}/{item_id}.jpg and inserts a wardrobe_items row for each, a few at a
 * time. Returns the positions that failed so the screen can keep them for a retry.
 */
export async function uploadItems(
  entries: UploadEntry[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ failed: number[]; message?: string }> {
  if (PREVIEW) return (await loadMock()).uploadItems(entries, onProgress);
  const userId = await currentUserId();
  const failed: number[] = [];
  let message: string | undefined;
  let next = 0;
  let done = 0;

  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= entries.length) return;
      try {
        await uploadOne(userId, entries[i]);
      } catch (e) {
        failed.push(i);
        message ??= e instanceof Error ? e.message : 'Upload failed.';
      }
      onProgress?.(++done, entries.length);
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker));
  return { failed: failed.sort((a, b) => a - b), message };
}

export async function updateItemCategory(id: string, category: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).updateItemCategory(id, category);
  const { error } = await supabase.from('wardrobe_items').update({ category }).eq('id', id);
  if (error) throw error;
}

/** Moves every one of the user's pieces from one type to another (used when a type is renamed or removed). */
export async function moveItemsCategory(from: string, to: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).moveItemsCategory(from, to);
  const { error } = await supabase.from('wardrobe_items').update({ category: to }).eq('category', from);
  if (error) throw error;
}

export async function deleteItem(item: WardrobeItem): Promise<void> {
  if (PREVIEW) return (await loadMock()).deleteItem(item.id);
  const { error } = await supabase.from('wardrobe_items').delete().eq('id', item.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([item.image_url]);
}

export async function listOutfits(): Promise<OutfitWithItems[]> {
  if (PREVIEW) return (await loadMock()).listOutfits();
  const [{ data: outfits, error }, { data: links, error: linkError }] = await Promise.all([
    supabase.from('saved_outfits').select('*').order('created_at'),
    supabase.from('outfit_items').select('outfit_id, item_id'),
  ]);
  if (error) throw error;
  if (linkError) throw linkError;
  return (outfits ?? []).map((o) => ({
    id: o.id as string,
    name: o.name as string,
    occasions: ((o as { occasions?: string[] | null }).occasions ?? []) as string[],
    itemIds: (links ?? []).filter((l) => l.outfit_id === o.id).map((l) => l.item_id as string),
  }));
}

export async function createOutfit(name: string, itemIds: string[], occasions: string[]): Promise<void> {
  if (PREVIEW) return (await loadMock()).createOutfit(name, itemIds, occasions);
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('saved_outfits')
    .insert({ user_id: userId, name, occasions })
    .select('id')
    .single();
  if (error) throw occasionsError(error);
  const { error: linkError } = await supabase
    .from('outfit_items')
    .insert(itemIds.map((item_id) => ({ outfit_id: data.id, item_id })));
  if (linkError) {
    await supabase.from('saved_outfits').delete().eq('id', data.id);
    throw linkError;
  }
}

export async function updateOutfit(id: string, name: string, itemIds: string[], occasions: string[]): Promise<void> {
  if (PREVIEW) return (await loadMock()).updateOutfit(id, name, itemIds, occasions);
  const { error } = await supabase.from('saved_outfits').update({ name, occasions }).eq('id', id);
  if (error) throw occasionsError(error);
  const { error: clearError } = await supabase.from('outfit_items').delete().eq('outfit_id', id);
  if (clearError) throw clearError;
  const { error: linkError } = await supabase
    .from('outfit_items')
    .insert(itemIds.map((item_id) => ({ outfit_id: id, item_id })));
  if (linkError) throw linkError;
}

export async function deleteOutfit(id: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).deleteOutfit(id);
  const { error } = await supabase.from('saved_outfits').delete().eq('id', id);
  if (error) throw error;
}

/** Calls the future suggest-outfits Edge Function (built in the AI step). */
export async function suggestOutfits(): Promise<OutfitSuggestion[]> {
  if (PREVIEW) return (await loadMock()).suggestOutfits();
  const { data, error } = await supabase.functions.invoke('suggest-outfits');
  if (error) {
    throw new Error('Outfit suggestions aren’t switched on yet — you can still build outfits by hand.');
  }
  return data as OutfitSuggestion[];
}
