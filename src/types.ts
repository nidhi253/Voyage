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
}

export const PERSONA_TAGS = ['Adventurous', 'Chill', 'Pilgrimage', 'Family'];
