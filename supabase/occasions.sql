-- Voyage: occasions for outfits.
-- Run once in Supabase Dashboard -> SQL Editor.
-- One outfit can carry several occasions (e.g. {Beach, Casual}); existing outfits start with none.
-- Existing row-level security on saved_outfits already covers this column.

alter table saved_outfits
  add column if not exists occasions text[] not null default '{}';
