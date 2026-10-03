-- Voyage: each user's own list of piece types (Tops, Trousers, ...).
-- Run once in Supabase Dashboard -> SQL Editor.
-- Null means "use the default types". Existing row-level security on profiles already covers this column.

alter table profiles
  add column if not exists categories text[];
