# TripHub — Supabase Build Spec

*Everything needed to set up the backend: tables, security rules, storage, and the two Edge Functions. Run the SQL directly in the Supabase SQL editor.*

---

## 1. Tables

```sql
-- Profiles (extends Supabase's built-in auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age int,
  tags text[] default '{}',              -- single flat list, freehand — includes onboarding persona picks and any custom hashtags, no split
  dark_mode boolean default false,
  created_at timestamptz default now()
);

-- Trips
create type trip_status as enum ('planning', 'ready', 'active', 'completed');

create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  destination text not null,
  second_destination text,               -- multi-city, nullable
  second_city_start_day int,             -- e.g. day 4 onward is the second city
  start_date date not null,
  end_date date not null,
  budget numeric,                        -- optional, input signal only
  tags text[] default '{}',              -- per-trip preference override, defaults to profile tags in the app layer, editable per-trip
  status trip_status default 'planning',
  regenerate_count int default 0,        -- increments each time "Regenerate" is used, enforced against the cap in generate-itinerary
  created_at timestamptz default now()
);

-- Itinerary entries
create table itinerary_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_number int not null,
  entry_time time not null,
  title text not null,
  is_outdoor boolean not null,           -- required — the weather engine depends on this
  created_at timestamptz default now()
);

-- Wardrobe items (individual pieces)
create table wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  image_url text not null,
  category text not null,                -- auto-assigned on upload
  created_at timestamptz default now()
);

-- Saved outfits (sets of wardrobe items)
create table saved_outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Junction table: which wardrobe items belong to which saved outfit.
-- A real foreign key here (unlike a plain uuid[]) means deleting a wardrobe item
-- automatically cleans up its references instead of leaving dangling IDs behind.
create table outfit_items (
  outfit_id uuid not null references saved_outfits(id) on delete cascade,
  item_id uuid not null references wardrobe_items(id) on delete cascade,
  primary key (outfit_id, item_id)
);

-- Outfit assignments (per trip day)
create table outfit_assignments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day_number int not null,
  saved_outfit_id uuid not null references saved_outfits(id) on delete cascade,
  unique (trip_id, day_number)
);

-- Nudges (system-generated)
create type nudge_status as enum ('pending', 'accepted', 'dismissed');

create table nudges (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  itinerary_entry_id uuid not null references itinerary_entries(id) on delete cascade,
  reason text not null,                  -- e.g. "Rain expected from 2pm"
  suggested_title text,                  -- e.g. "Ubud art museum"
  suggested_outfit_note text,            -- e.g. "Add a light layer"
  status nudge_status default 'pending',
  created_at timestamptz default now()
);

-- Destinations (curated seed content — powers Home suggestions, search, detail page)
create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  region text,                           -- state/province, for broader search than city name alone
  image_url text,
  short_description text,                -- one-liner shown on the card
  full_description text,                 -- shown on the detail page
  best_time_to_visit text,
  tags text[] default '{}',              -- vibe tags, matched against user/trip tags for filtering
  highlights text[] default '{}',        -- bullet list on the detail page
  created_at timestamptz default now()
);

-- Events / festivals (curated seed content — powers Home's "Coming up nearby")
create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  event_date date not null,
  image_url text,
  tags text[] default '{}',              -- matched against user/trip tags for filtering
  created_at timestamptz default now()
);
```

---

## 2. Row Level Security (RLS)

Enable RLS on every table, then restrict access to the owning user. Trip-child tables (itinerary_entries, outfit_assignments, nudges) check ownership through a join to `trips`.

```sql
alter table profiles enable row level security;
alter table trips enable row level security;
alter table itinerary_entries enable row level security;
alter table wardrobe_items enable row level security;
alter table saved_outfits enable row level security;
alter table outfit_items enable row level security;
alter table outfit_assignments enable row level security;
alter table nudges enable row level security;

-- Profiles: user can only see/edit their own row
create policy "own profile" on profiles
  for all using (auth.uid() = id);

-- Trips: user can only see/edit their own trips
create policy "own trips" on trips
  for all using (auth.uid() = user_id);

-- Itinerary entries: via trip ownership
create policy "own itinerary entries" on itinerary_entries
  for all using (
    exists (select 1 from trips where trips.id = itinerary_entries.trip_id and trips.user_id = auth.uid())
  );

-- Wardrobe items: user's own
create policy "own wardrobe items" on wardrobe_items
  for all using (auth.uid() = user_id);

-- Saved outfits: user's own
create policy "own saved outfits" on saved_outfits
  for all using (auth.uid() = user_id);

-- Outfit items: via saved_outfits ownership
create policy "own outfit items" on outfit_items
  for all using (
    exists (select 1 from saved_outfits where saved_outfits.id = outfit_items.outfit_id and saved_outfits.user_id = auth.uid())
  );

-- Outfit assignments: via trip ownership
create policy "own outfit assignments" on outfit_assignments
  for all using (
    exists (select 1 from trips where trips.id = outfit_assignments.trip_id and trips.user_id = auth.uid())
  );

-- Nudges: via trip ownership
create policy "own nudges" on nudges
  for all using (
    exists (select 1 from trips where trips.id = nudges.trip_id and trips.user_id = auth.uid())
  );

-- Destinations and events: shared content, readable by any logged-in user, not user-owned
alter table destinations enable row level security;
alter table events enable row level security;

create policy "anyone can read destinations" on destinations
  for select to authenticated using (true);

create policy "anyone can read events" on events
  for select to authenticated using (true);

-- No insert/update/delete policy for either — seed this content yourself via the
-- Supabase dashboard or service-role key, not from the client app
```

**Indexes — required, not optional.** Every RLS policy above checks a foreign key column. Without an index on that column, Postgres has to scan the entire table on every query to enforce the policy — fine with a handful of rows, genuinely slow once there's real data.

```sql
create index on trips (user_id);
create index on itinerary_entries (trip_id);
create index on wardrobe_items (user_id);
create index on saved_outfits (user_id);
create index on outfit_items (outfit_id);
create index on outfit_assignments (trip_id);
create index on nudges (trip_id);
```

**One more thing worth verifying manually, not fixable purely in SQL:** Supabase tables can have default grants (SELECT/INSERT/UPDATE/DELETE for the `anon` and `authenticated` roles) applied automatically depending on your project's settings — RLS policies restrict *rows*, but a missing or overly generous grant restricts *table access* at a different layer entirely. After running this schema, check Authentication → Policies in the dashboard to confirm each table shows real policies (not "no policies," which locks it entirely) and that `anon` doesn't have unintended access to anything user-owned.

---

## 3. Auth setup

**Dashboard steps:**
1. Supabase Dashboard → Authentication → Providers → enable **Phone**
2. Connect an SMS provider (Twilio is the standard pairing — Supabase's docs walk through this directly) — for early development, Supabase's test mode lets you use a fixed OTP without sending real SMS
3. Disable/ignore email-based sign-in entirely — this app never uses it

**Auto-create the profile row (SQL, not app code):** rather than relying on the frontend to remember to insert a `profiles` row after signup — which can silently fail to run, run twice, or get skipped in an edge case — use a database trigger that does it automatically and atomically, every time a new user is created:

```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

With this in place, the persona-capture screen just needs to `update` the existing profile row (setting `age`, `tags`) — it never has to create one.

---

## 4. Storage

```sql
insert into storage.buckets (id, name, public) values ('wardrobe-images', 'wardrobe-images', false);
```

- Bucket is private — access controlled by a storage policy, not public URLs
- Path convention: **within the bucket**, store files at `{user_id}/{item_id}.jpg` — do not include the bucket name in the path itself (Supabase tracks that separately via `bucket_id`). This keeps each user's files cleanly separated and is what the policy below actually checks against.

```sql
create policy "own wardrobe images"
  on storage.objects for all
  using (bucket_id = 'wardrobe-images' and (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 5. Edge Functions

### `generate-itinerary`
- **Trigger:** called directly from the client when a trip is created, or when "Regenerate" is tapped
- **Input:** `trip_id` (or raw destination/dates/budget/persona if generating before the trip row exists)
- **Logic:** calls the Claude API with the web search tool enabled, using destination + dates + budget + persona tags as context; parses the response into structured itinerary entries. **On regenerate specifically:** check `trips.regenerate_count` against the cap (e.g. 3) before calling Claude — reject with a clear message if the cap is hit, otherwise increment the counter after a successful generation
- **Output:** writes rows to `itinerary_entries`, returns the generated set to the client for the editable draft
- **Secret needed:** `ANTHROPIC_API_KEY`

### `check-weather` (scheduled — hourly)
- **Trigger:** Supabase cron schedule, not client-initiated
- **Logic:** for every trip with `status = 'active'`, fetch today's outdoor itinerary entries, check forecast via a weather API, and if a shift crosses the significance threshold, insert a row into `nudges` and trigger a push notification
- **Secrets needed:** `WEATHER_API_KEY`, plus whatever push notification service is chosen (not yet decided — flag as open item)

### Local suggestions — recommended approach, not yet formally confirmed
Both the "local pick" chip shown while adding an itinerary entry, and the local-alternative suggestion inside a nudge, need a specific-spot suggestion (e.g. "Ubud cooking class") — a finer grain than the city-level `destinations` table. **Recommended:** generate these live via a small Claude API call (with web search) at the moment they're needed, rather than maintaining a separate seed table of local spots. This keeps the approach consistent with itinerary generation and avoids a real content-maintenance burden. If you'd rather curate a real seed table instead, say so — it's a legitimate alternative, just more manual upkeep, and would need its own table added.

---

## 6. Open items before this is fully wired up

1. **Weather API choice** — resolved separately: OpenWeatherMap (see Final Tech Stack doc).
2. **Push notification service** — deferred deliberately (see Final Tech Stack doc) — in-app notifications icon only for now.
3. **Significance threshold values** — starting values set in the Final Tech Stack doc, expect to tune after real use.
4. **Categorization for wardrobe uploads** — resolved: Claude API vision call (see Final Tech Stack doc).
5. **Seed data for `destinations` and `events`** — the tables now exist, but they're empty until you actually populate them. You'll need to manually add a handful of destinations and events (via the Supabase dashboard's Table Editor, or a one-off SQL insert) before Home has anything real to show. Not a schema problem — just remember this is a manual content step, not something that builds itself.
