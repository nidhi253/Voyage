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
  if (error) throw error;
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
  return data as SavedOutfit[];
}

/**
 * Calls the generate-itinerary Edge Function. The function is built in the AI step,
 * so until it's deployed this throws a readable error instead of crashing the screen.
 */
export async function generateItinerary(tripId: string, regenerate: boolean): Promise<void> {
  if (PREVIEW) return (await loadMock()).generateItinerary(tripId, regenerate);
  const { error } = await supabase.functions.invoke('generate-itinerary', {
    body: { trip_id: tripId, regenerate },
  });
  if (error) {
    throw new Error(
      'Itinerary generation isn’t switched on yet — add entries by hand for now.',
    );
  }
}
