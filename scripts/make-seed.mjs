// Generates supabase/seed_india.sql from supabase/india-content.json (the single source of truth).
// Run: node scripts/make-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const content = JSON.parse(readFileSync('supabase/india-content.json', 'utf8'));
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`;

const destRows = content.destinations
  .map(
    (d) =>
      `  (${q(d.name)}, ${q(d.country)}, ${q(d.region)}, ${q(d.image_url)}, ${q(d.image_credit)}, ${q(d.image_source_url)},\n   ${q(d.short_description)},\n   ${q(d.full_description)},\n   ${q(d.best_time_to_visit)}, ${arr(d.tags)},\n   ${arr(d.highlights)})`,
  )
  .join(',\n');

const eventRows = content.events
  .map(
    (e) =>
      `  (${q(e.name)}, ${q(e.location)}, ${q(e.event_date)}::date, ${q(e.image_url)}, ${q(e.image_credit)}, ${q(e.image_source_url)}, ${arr(e.tags)})`,
  )
  .join(',\n');

const sql = `-- Voyage seed content: destinations and festivals across India.
-- GENERATED from supabase/india-content.json by scripts/make-seed.mjs. Edit the JSON, then re-run the script.
-- Run supabase/image_credits.sql FIRST (adds the photo-credit columns), then this file.
-- Safe to re-run: it replaces any rows with the same names, and nothing else references them.
-- Photos are hosted on Wikimedia Commons under open licences; credits are stored with each row and shown in the app.
-- Festival dates change every year: check them before each season.

delete from destinations where name in (${content.destinations.map((d) => q(d.name)).join(', ')});

insert into destinations (name, country, region, image_url, image_credit, image_source_url, short_description, full_description, best_time_to_visit, tags, highlights)
values
${destRows};

delete from events where name in (${content.events.map((e) => q(e.name)).join(', ')});

insert into events (name, location, event_date, image_url, image_credit, image_source_url, tags)
values
${eventRows};
`;

writeFileSync('supabase/seed_india.sql', sql);
console.log(`Wrote supabase/seed_india.sql (${content.destinations.length} destinations, ${content.events.length} events)`);
