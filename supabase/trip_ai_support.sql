-- Voyage: support for AI itinerary generation. Run once in Supabase Dashboard -> SQL Editor
-- (after trip_preferences.sql).
--
-- 1. Adds a counter for outfit suggestions (the itinerary function allows 5 per trip).
-- 2. Makes the two counters tamper-proof. Row-level security lets people update their own trips, which
--    would otherwise let a signed-in user reset regenerate_count from the browser and bypass the limit.
--    This trigger keeps both counters at their stored values unless the change comes from the
--    Edge Function (which uses the service role).

alter table trips
  add column if not exists outfit_suggest_count int not null default 0;

create or replace function public.protect_ai_counters()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.regenerate_count := 0;
    new.outfit_suggest_count := 0;
  else
    new.regenerate_count := old.regenerate_count;
    new.outfit_suggest_count := old.outfit_suggest_count;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_ai_counters on public.trips;
create trigger protect_ai_counters
  before insert or update on public.trips
  for each row execute function public.protect_ai_counters();
