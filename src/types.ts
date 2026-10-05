export type TripStatus = 'planning' | 'ready' | 'active' | 'completed';

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  second_destination: string | null;
  second_city_start_day: number | null;
  start_date: string;
  end_date: string;
  budget: number | null;
  tags: string[];
  status: TripStatus;
  regenerate_count: number;
  created_at: string;
}

export interface NewTripInput {
  destination: string;
  second_destination: string | null;
  second_city_start_day: number | null;
  start_date: string;
  end_date: string;
  budget: number | null;
  tags: string[];
}

export interface ItineraryEntry {
  id: string;
  trip_id: string;
  day_number: number;
  entry_time: string;
  title: string;
  is_outdoor: boolean;
}

export interface EntryInput {
  day_number: number;
  entry_time: string;
  title: string;
  is_outdoor: boolean;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  name: string;
  /** Labels this outfit is mapped to (e.g. Beach, Dinner). One outfit can have several. */
  occasions: string[];
}

export interface OutfitAssignment {
  id: string;
  trip_id: string;
  day_number: number;
  saved_outfit_id: string;
}

export interface Profile {
  id: string;
  name: string | null;
  age: number | null;
  tags: string[];
  dark_mode: boolean;
  /** The user's own list of piece types; null/missing means use the defaults. */
  categories?: string[] | null;
}

export const PERSONA_TAGS = ['Adventurous', 'Chill', 'Pilgrimage', 'Family'];

/** Starting set of garment types. Each user can add, rename and remove types (stored on their profile). */
export const DEFAULT_CATEGORIES = ['Tops', 'Trousers', 'Skirts', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'];
export const UNCATEGORIZED = 'Uncategorized';

export interface WardrobeItem {
  id: string;
  user_id: string;
  /** Storage path inside the private bucket ({user_id}/{item_id}.jpg), not a public URL. */
  image_url: string;
  category: string;
  created_at: string;
  /** Short-lived signed URL for display, filled in by the data layer. */
  signedUrl: string;
}

export interface OutfitWithItems {
  id: string;
  name: string;
  itemIds: string[];
  occasions: string[];
}

export interface OutfitSuggestion {
  name: string;
  itemIds: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string | null;
  image_url: string | null;
  short_description: string | null;
  full_description: string | null;
  best_time_to_visit: string | null;
  tags: string[];
  highlights: string[];
  /** Photographer and licence, for the openly licensed photo shown. */
  image_credit?: string | null;
  image_source_url?: string | null;
}

export interface EventItem {
  id: string;
  name: string;
  location: string;
  event_date: string;
  image_url: string | null;
  tags: string[];
  image_credit?: string | null;
  image_source_url?: string | null;
}

export type NudgeStatus = 'pending' | 'accepted' | 'dismissed';

export interface Nudge {
  id: string;
  trip_id: string;
  itinerary_entry_id: string;
  reason: string;
  suggested_title: string | null;
  suggested_outfit_note: string | null;
  status: NudgeStatus;
  created_at: string;
  trips?: { destination: string } | null;
}

export const MAX_OCCASIONS = 8;
export const OCCASION_SUGGESTIONS = ['Beach', 'Dinner', 'Hiking', 'Temple', 'Casual', 'Evening', 'Work'];
