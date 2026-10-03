import { supabase } from '../lib/supabase';
import { PREVIEW, loadMock } from '../dev/preview';
import { todayISO } from '../lib/dates';
import type { Destination, EventItem, Nudge } from '../types';

export async function listDestinations(): Promise<Destination[]> {
  if (PREVIEW) return (await loadMock()).listDestinations();
  const { data, error } = await supabase.from('destinations').select('*').order('name');
  if (error) throw error;
  return data as Destination[];
}

/** Strips characters that would break PostgREST's or() filter syntax. */
function cleanQuery(q: string): string {
  return q.replace(/[,()%*\\_]/g, ' ').trim();
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  if (PREVIEW) return (await loadMock()).searchDestinations(query);
  const q = cleanQuery(query);
  if (!q) return [];
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .or(`name.ilike.%${q}%,country.ilike.%${q}%,region.ilike.%${q}%`)
    .order('name')
    .limit(20);
  if (error) throw error;
  return data as Destination[];
}

export async function getDestination(id: string): Promise<Destination> {
  if (PREVIEW) return (await loadMock()).getDestination(id);
  const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Destination;
}

export async function listUpcomingEvents(): Promise<EventItem[]> {
  if (PREVIEW) return (await loadMock()).listUpcomingEvents();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', todayISO())
    .order('event_date')
    .limit(12);
  if (error) throw error;
  return data as EventItem[];
}

/** All nudges (any status) newest first, or just one trip's. Includes the trip's destination for display. */
export async function listNudges(tripId?: string): Promise<Nudge[]> {
  if (PREVIEW) return (await loadMock()).listNudges(tripId);
  let query = supabase.from('nudges').select('*, trips(destination)').order('created_at', { ascending: false });
  if (tripId) query = query.eq('trip_id', tripId);
  const { data, error } = await query;
  if (error) throw error;
  return data as Nudge[];
}

/** Applies the suggested swap to the itinerary entry, then marks the nudge accepted. */
export async function acceptNudge(nudge: Nudge): Promise<void> {
  if (PREVIEW) return (await loadMock()).acceptNudge(nudge.id);
  if (nudge.suggested_title) {
    const { error } = await supabase
      .from('itinerary_entries')
      .update({ title: nudge.suggested_title, is_outdoor: false })
      .eq('id', nudge.itinerary_entry_id);
    if (error) throw error;
  }
  const { error } = await supabase.from('nudges').update({ status: 'accepted' }).eq('id', nudge.id);
  if (error) throw error;
}

export async function dismissNudge(id: string): Promise<void> {
  if (PREVIEW) return (await loadMock()).dismissNudge(id);
  const { error } = await supabase.from('nudges').update({ status: 'dismissed' }).eq('id', id);
  if (error) throw error;
}
