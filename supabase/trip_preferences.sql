-- Voyage: the answers from the trip "preferences" step (who's travelling, pace, interests, must-do).
-- Run once in Supabase Dashboard -> SQL Editor.
-- Stored as JSON on the trip so the AI itinerary can use it later. Existing trips stay empty.
-- Existing row-level security on trips already covers this column.

alter table trips
  add column if not exists preferences jsonb;
