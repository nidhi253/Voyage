// Supabase Edge Function (Deno): builds a trip's itinerary with Claude, and picks saved outfits for each day.
//
// POST { trip_id, regenerate?: boolean, mode?: "itinerary" | "outfits" }
//   mode "itinerary" (default): research and write the day-by-day plan, then match saved outfits to days.
//   mode "outfits": keep the existing plan and only suggest outfits for days that don't have one yet.
//
// Secrets needed (supabase secrets set ...): ANTHROPIC_API_KEY. Optional: ANTHROPIC_MODEL (default claude-haiku-4-5).
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided to every function automatically.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import {
  DEFAULT_MODEL,
  MAX_OUTFIT_SUGGESTIONS,
  MAX_REGENERATIONS,
  buildOutfitPrompt,
  buildPrompt,
  callClaude,
  dayCount,
  dayWindow,
  extractJson,
  isUuid,
  validateEntries,
  validateOutfitPicks,
  type ClaudeClient,
  type NewEntry,
  type OutfitOption,
  type TripRow,
} from './lib.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** The traveller's saved outfits, with the types of piece in each (names only: no photos are sent anywhere). */
async function loadOutfits(admin: SupabaseClient, userId: string): Promise<OutfitOption[]> {
  const { data: outfits, error } = await admin
    .from('saved_outfits')
    .select('id, name, occasions')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40);
  if (error) throw error;
  if (!outfits?.length) return [];

  const ids = outfits.map((o) => o.id as string);
  const { data: links, error: linkError } = await admin.from('outfit_items').select('outfit_id, item_id').in('outfit_id', ids);
  if (linkError) throw linkError;
  const itemIds = Array.from(new Set((links ?? []).map((l) => l.item_id as string)));
  const { data: items, error: itemError } = itemIds.length
    ? await admin.from('wardrobe_items').select('id, category').eq('user_id', userId).in('id', itemIds)
    : { data: [], error: null };
  if (itemError) throw itemError;
  const category = new Map((items ?? []).map((i) => [i.id as string, i.category as string]));

  return outfits.map((o) => ({
    id: o.id as string,
    name: o.name as string,
    occasions: ((o as { occasions?: string[] | null }).occasions ?? []) as string[],
    pieces: Array.from(
      new Set(
        (links ?? [])
          .filter((l) => l.outfit_id === o.id)
          .map((l) => category.get(l.item_id as string))
          .filter((c): c is string => !!c),
      ),
    ),
  }));
}

/** Saves outfit picks, but only for days that don't already have one, so manual choices are never overwritten. */
async function saveOutfitPicks(admin: SupabaseClient, tripId: string, picks: Map<number, string>) {
  if (picks.size === 0) return { assigned: 0, skipped: 0 };
  const { data: existing, error } = await admin.from('outfit_assignments').select('day_number').eq('trip_id', tripId);
  if (error) throw error;
  const taken = new Set((existing ?? []).map((a) => a.day_number as number));
  const rows = [...picks.entries()]
    .filter(([day]) => !taken.has(day))
    .map(([day, outfitId]) => ({ trip_id: tripId, day_number: day, saved_outfit_id: outfitId }));
  if (rows.length > 0) {
    const { error: insertError } = await admin
      .from('outfit_assignments')
      .upsert(rows, { onConflict: 'trip_id,day_number', ignoreDuplicates: true });
    if (insertError) throw insertError;
  }
  return { assigned: rows.length, skipped: picks.size - rows.length };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!url || !anonKey || !serviceKey || !anthropicKey) {
    console.error('Missing environment configuration');
    return json(500, { error: 'Itinerary generation isn’t set up yet.' });
  }

  // 1. Who is asking? The user's own token, checked by Supabase Auth.
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'Please sign in again.' });
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: auth, error: authError } = await userClient.auth.getUser();
  if (authError || !auth.user) return json(401, { error: 'Please sign in again.' });
  const userId = auth.user.id;

  // 2. What are they asking for?
  let body: { trip_id?: unknown; regenerate?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Bad request.' });
  }
  if (!isUuid(body.trip_id)) return json(400, { error: 'Bad request.' });
  const mode = body.mode === 'outfits' ? 'outfits' : 'itinerary';
  const regenerate = body.regenerate === true;

  // 3. Is the trip theirs? Row-level security answers this: someone else's trip simply isn't returned.
  const { data: trip, error: tripError } = await userClient.from('trips').select('*').eq('id', body.trip_id).maybeSingle();
  if (tripError || !trip || trip.user_id !== userId) return json(404, { error: 'Trip not found.' });
  const t = trip as TripRow;
  const days = dayCount(t.start_date, t.end_date);
  if (days < 1 || days > 31) return json(400, { error: 'Trips can be up to 31 days long.' });

  const admin = createClient(url, serviceKey);
  const today = new Date().toISOString().slice(0, 10);
  const model = Deno.env.get('ANTHROPIC_MODEL') || DEFAULT_MODEL;
  const claude = new Anthropic({ apiKey: anthropicKey, timeout: 120_000, maxRetries: 1 }) as unknown as ClaudeClient;

  try {
    const { data: existingRows, error: existingError } = await admin.from('itinerary_entries').select('*').eq('trip_id', t.id);
    if (existingError) throw existingError;
    const existing = existingRows ?? [];

    // ---- Outfits only: keep the plan, suggest what to wear on days with no outfit yet.
    if (mode === 'outfits') {
      if (existing.length === 0) return json(400, { error: 'Build your itinerary first, then we can suggest outfits.' });
      if ((t.outfit_suggest_count ?? 0) >= MAX_OUTFIT_SUGGESTIONS) {
        return json(429, { error: `You’ve used all ${MAX_OUTFIT_SUGGESTIONS} outfit suggestions for this trip.` });
      }
      const outfits = await loadOutfits(admin, userId);
      if (outfits.length === 0) return json(400, { error: 'Create some outfits in Wardrobe first, then we can match them to your days.' });

      const entries: NewEntry[] = existing.map((e) => ({
        day_number: e.day_number as number,
        entry_time: String(e.entry_time).slice(0, 5),
        title: String(e.title),
        is_outdoor: e.is_outdoor === true,
      }));
      const text = await callClaude(claude, model, buildOutfitPrompt(t, entries, outfits, today), { maxSearches: 2 });
      const picks = validateOutfitPicks(extractJson(text), days, new Set(outfits.map((o) => o.id)));
      const saved = await saveOutfitPicks(admin, t.id, picks);
      await admin.from('trips').update({ outfit_suggest_count: (t.outfit_suggest_count ?? 0) + 1 }).eq('id', t.id);
      return json(200, { ok: true, mode, outfits_assigned: saved.assigned, outfits_kept: saved.skipped });
    }

    // ---- Itinerary
    if (existing.length > 0 && !regenerate) {
      return json(409, { error: 'This trip already has an itinerary. Use Regenerate to replace it.' });
    }
    const isRegeneration = existing.length > 0;
    if (isRegeneration && t.regenerate_count >= MAX_REGENERATIONS) {
      return json(429, { error: `You’ve used all ${MAX_REGENERATIONS} regenerations for this trip.` });
    }

    const outfits = await loadOutfits(admin, userId);
    const text = await callClaude(claude, model, buildPrompt(t, today, outfits));
    const parsed = extractJson(text);
    const entries = validateEntries(parsed, days, dayWindow(t));
    const picks = validateOutfitPicks(parsed, days, new Set(outfits.map((o) => o.id)));

    // Save the new plan first and remove the old one after, so a failure can never leave the trip empty.
    const oldIds = existing.map((e) => e.id as string);
    const { error: insertError } = await admin.from('itinerary_entries').insert(entries.map((e) => ({ ...e, trip_id: t.id })));
    if (insertError) throw insertError;
    if (oldIds.length > 0) {
      const { error: deleteError } = await admin.from('itinerary_entries').delete().in('id', oldIds);
      if (deleteError) throw deleteError;
    }
    if (isRegeneration) {
      await admin.from('trips').update({ regenerate_count: t.regenerate_count + 1 }).eq('id', t.id);
    }
    const saved = await saveOutfitPicks(admin, t.id, picks);

    return json(200, { ok: true, mode, entries_created: entries.length, outfits_assigned: saved.assigned });
  } catch (err) {
    // Details stay in the function logs; the traveller gets a short, safe message.
    console.error('generate-itinerary failed:', err instanceof Error ? `${err.name}: ${err.message}` : err);
    const planningProblem =
      err instanceof Error && /left out day|entries list|No JSON|cut off|declined|search turns|no text/i.test(err.message);
    return json(502, {
      error: planningProblem
        ? 'We couldn’t put together a full plan this time. Please try again.'
        : 'The planner is busy right now. Please try again in a minute.',
    });
  }
});
