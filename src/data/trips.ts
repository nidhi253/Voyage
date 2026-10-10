import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { PREVIEW, loadMock } from '../dev/preview';
import type {
  EntryInput,
  ItineraryEntry,
  NewTripInput,
  OutfitAssignment,
  SavedOutfit,
  Trip,
  TripStatus,
} from '../types';

export const REGENERATE_CAP = 3;

export async function listTrips(): Promise<Trip[]> {
  if (PREVIEW) return (await loadMock()).listTrips();
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data as Trip[];
}

export async function getTrip(id: string): Promise<Trip> {
  if (PREVIEW) return (await loadMock()).getTrip(id);
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Trip;
}

export async function createTrip(input: NewTripInput): Promise<Trip> {
  if (PREVIEW) return (await loadMock()).createTrip(input);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('You need to be signed in.');
  const { data, error } = await supabase
    .from('trips')
    .insert({ ...input, user_id: auth.user.id })
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST204' || error.code === '42703' || /preferences/i.test(error.message)) {
      throw new Error('Trip preferences need a one-time database update — run supabase/trip_preferences.sql in the Supabase SQL editor.');
    }
    throw error;
  }
  return data as Trip;
}

export async function deleteTrip(id: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).deleteTrip(id);
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw error;
}

export async function setTripStatus(id: string, status: TripStatus): Promise<void> {
  if (PREVIEW) return (await loadMock()).setTripStatus(id, status);
  const { error } = await supabase.from('trips').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function listEntries(tripId: string): Promise<ItineraryEntry[]> {
  if (PREVIEW) return (await loadMock()).listEntries(tripId);
  const { data, error } = await supabase
    .from('itinerary_entries')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number')
    .order('entry_time');
  if (error) throw error;
  return data as ItineraryEntry[];
}

export async function addEntry(tripId: string, input: EntryInput): Promise<void> {
  if (PREVIEW) return (await loadMock()).addEntry(tripId, input);
  const { error } = await supabase.from('itinerary_entries').insert({ ...input, trip_id: tripId });
  if (error) throw error;
}

export async function updateEntry(id: string, input: EntryInput): Promise<void> {
  if (PREVIEW) return (await loadMock()).updateEntry(id, input);
  const { error } = await supabase.from('itinerary_entries').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteEntry(id: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).deleteEntry(id);
  const { error } = await supabase.from('itinerary_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function listAssignments(tripId: string): Promise<OutfitAssignment[]> {
  if (PREVIEW) return (await loadMock()).listAssignments(tripId);
  const { data, error } = await supabase
    .from('outfit_assignments')
    .select('*')
    .eq('trip_id', tripId);
  if (error) throw error;
  return data as OutfitAssignment[];
}

export async function assignOutfit(tripId: string, day: number, outfitId: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).assignOutfit(tripId, day, outfitId);
  const { error } = await supabase
    .from('outfit_assignments')
    .upsert(
      { trip_id: tripId, day_number: day, saved_outfit_id: outfitId },
      { onConflict: 'trip_id,day_number' },
    );
  if (error) throw error;
}

export async function listSavedOutfits(): Promise<SavedOutfit[]> {
  if (PREVIEW) return (await loadMock()).listSavedOutfits();
  const { data, error } = await supabase.from('saved_outfits').select('*').order('created_at');
  if (error) throw error;
  return (data as SavedOutfit[]).map((o) => ({ ...o, occasions: o.occasions ?? [] }));
}

const NOT_SWITCHED_ON = 'Itinerary generation isn’t switched on yet — add entries by hand for now.';

export interface GenerationResult {
  entriesCreated: number;
  outfitsAssigned: number;
}

/** Calls the generate-itinerary Edge Function and turns its failures into short messages for the screen. */
async function callPlanner(body: Record<string, unknown>): Promise<Record<string, number>> {
  const { data, error } = await supabase.functions.invoke('generate-itinerary', { body });
  if (!error) return (data ?? {}) as Record<string, number>;

  if (error instanceof FunctionsHttpError) {
    if (error.context.status === 404) throw new Error(NOT_SWITCHED_ON); // function not deployed
    const payload = await error.context.json().catch(() => null);
    throw new Error(
      typeof payload?.error === 'string' ? payload.error : 'Something went wrong while planning. Please try again.',
    );
  }
  // Network failures, or a function that isn't deployed (the browser reports that as a blocked request).
  throw new Error(NOT_SWITCHED_ON);
}

/** Builds the day-by-day plan (and picks outfits from the wardrobe). Takes up to a minute. */
export async function generateItinerary(tripId: string, regenerate: boolean): Promise<GenerationResult> {
  if (PREVIEW) return (await loadMock()).generateItinerary(tripId, regenerate);
  const r = await callPlanner({ trip_id: tripId, regenerate, mode: 'itinerary' });
  return { entriesCreated: r.entries_created ?? 0, outfitsAssigned: r.outfits_assigned ?? 0 };
}

/** Matches saved outfits to the days that don't have one yet, without touching the itinerary. */
export async function suggestOutfitsForTrip(tripId: string): Promise<{ assigned: number; kept: number }> {
  if (PREVIEW) return (await loadMock()).suggestOutfitsForTrip(tripId);
  const r = await callPlanner({ trip_id: tripId, mode: 'outfits' });
  return { assigned: r.outfits_assigned ?? 0, kept: r.outfits_kept ?? 0 };
}

/** "Add to trip" from a destination page: makes it the trip's second city. */
export async function setSecondCity(tripId: string, destination: string, startDay: number): Promise<void> {
  if (PREVIEW) return (await loadMock()).setSecondCity(tripId, destination, startDay);
  const { error } = await supabase
    .from('trips')
    .update({ second_destination: destination, second_city_start_day: startDay })
    .eq('id', tripId);
  if (error) throw error;
}
