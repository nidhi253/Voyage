-- Voyage: photo credits for destinations and events (the photos are openly licensed and need attribution).
-- Run once in Supabase Dashboard -> SQL Editor, before supabase/seed_india.sql.

alter table destinations
  add column if not exists image_credit text,
  add column if not exists image_source_url text;

alter table events
  add column if not exists image_credit text,
  add column if not exists image_source_url text;
