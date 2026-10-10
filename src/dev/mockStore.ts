// In-memory fake database for preview mode. Resets on page reload.
import indiaContent from '../../supabase/india-content.json';
import { addDays, todayISO } from '../lib/dates';
import type {
  Destination,
  EventItem,
  Nudge,
  EntryInput,
  ItineraryEntry,
  NewTripInput,
  OutfitAssignment,
  OutfitSuggestion,
  OutfitWithItems,
  Profile,
  SavedOutfit,
  Trip,
  TripStatus,
  WardrobeItem,
} from '../types';

const ME = 'preview-user';
const uid = () => crypto.randomUUID();
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

const trip = (p: Partial<Trip> & Pick<Trip, 'destination' | 'start_date' | 'end_date' | 'status'>): Trip => ({
  id: uid(),
  user_id: ME,
  second_destination: null,
  second_city_start_day: null,
  budget: null,
  tags: ['Adventurous', 'Chill'],
  regenerate_count: 0,
  created_at: new Date().toISOString(),
  ...p,
});

const bali = trip({
  destination: 'Jaipur',
  second_destination: 'udaipur',
  second_city_start_day: 3,
  start_date: '2026-11-23',
  end_date: '2026-11-30',
  status: 'planning',
});

// Active trip around "today" so Home's Today state shows in preview (today = day 3).
const indo = trip({
  destination: 'Munnar',
  start_date: addDays(todayISO(), -2),
  end_date: addDays(todayISO(), 4),
  status: 'active',
});

const db = {
  trips: [
    bali,
    indo,
    trip({ destination: 'goa', start_date: '2026-05-01', end_date: '2026-05-04', status: 'ready' }),
    trip({ destination: 'Hampi', start_date: '2026-03-02', end_date: '2026-03-08', status: 'completed' }),
  ] as Trip[],
  entries: [] as ItineraryEntry[],
  assignments: [] as OutfitAssignment[],
  outfits: [
    { id: uid(), user_id: ME, name: 'Beach day', occasions: ['Beach', 'Casual'] },
    { id: uid(), user_id: ME, name: 'Temple visit', occasions: ['Temple', 'Daytime'] },
    { id: uid(), user_id: ME, name: 'Evening out', occasions: ['Dinner', 'Evening'] },
  ] as SavedOutfit[],
  profile: { id: ME, name: 'Larry', age: 30, tags: ['Adventurous', 'Chill'], dark_mode: false } as Profile,
  items: [] as WardrobeItem[],
  links: new Map<string, string[]>(),
};

const swatch = (label: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="${color}"/><text x="120" y="128" font-family="sans-serif" font-size="22" fill="#14181F" text-anchor="middle">${label}</text></svg>`,
  )}`;

const item = (label: string, color: string, category: string): WardrobeItem => {
  const id = uid();
  return { id, user_id: ME, image_url: `${ME}/${id}.jpg`, category, created_at: new Date().toISOString(), signedUrl: swatch(label, color) };
};

db.items.push(
  item('Linen shirt', '#E8DCC8', 'Tops'),
  item('Denim shorts', '#B8CBE0', 'Trousers'),
  item('Swim trunks', '#BFE3DD', 'Trousers'),
  item('Sarong', '#F2C9B8', 'Skirts'),
  item('Silk top', '#D9C7E8', 'Tops'),
  item('Black trousers', '#CFCFD4', 'Trousers'),
  item('Sandals', '#E6D3B3', 'Shoes'),
  item('Pyjama set', '#C9D6C0', 'Other'),
);
db.links.set(db.outfits[0].id, [db.items[2].id, db.items[3].id, db.items[6].id]);
db.links.set(db.outfits[1].id, [db.items[0].id, db.items[1].id]);
db.links.set(db.outfits[2].id, [db.items[4].id, db.items[5].id]);

// Active "indonesia" trip: today is day 3, with an outdoor entry and a pending weather nudge.
const rice = entry(indo.id, 3, '15:00:00', 'Tea plantation walk', true);
db.entries.push(
  entry(indo.id, 3, '09:00:00', 'Breakfast at the guesthouse', false),
  rice,
  entry(indo.id, 3, '19:00:00', 'Dinner at a Kerala restaurant', false),
  entry(indo.id, 4, '10:00:00', 'Eravikulam National Park', true),
  entry(indo.id, 4, '14:00:00', 'Munnar spice market', true),
);
db.assignments.push(
  { id: uid(), trip_id: indo.id, day_number: 3, saved_outfit_id: db.outfits[1].id },
  { id: uid(), trip_id: indo.id, day_number: 4, saved_outfit_id: db.outfits[0].id },
);

const nudges: Nudge[] = [
  {
    id: uid(),
    trip_id: indo.id,
    itinerary_entry_id: rice.id,
    reason: 'Rain is expected from 2pm. Your 3pm tea plantation walk is outdoors, so swap it for the tea museum and bring a light waterproof layer.',
    suggested_title: 'Tea museum visit',
    suggested_outfit_note: 'Light rain jacket added',
    status: 'pending',
    created_at: new Date().toISOString(),
    trips: { destination: 'Munnar' },
  },
];

// Same content as the real seed (supabase/india-content.json), so preview matches what Home will show.
const destinations: Destination[] = indiaContent.destinations.map((d) => ({ id: uid(), ...d }));
const events: EventItem[] = indiaContent.events.map((e) => ({ id: uid(), ...e }));

function entry(trip_id: string, day_number: number, entry_time: string, title: string, is_outdoor: boolean): ItineraryEntry {
  return { id: uid(), trip_id, day_number, entry_time, title, is_outdoor };
}

const SAMPLE: Array<[string, string, boolean]> = [
  ['09:00', 'Sunrise viewpoint hike', true],
  ['13:00', 'Local museum', false],
  ['19:00', 'Cooking class', false],
  ['21:00', 'Night market stroll', true],
];

db.entries.push(
  entry(bali.id, 1, '09:00:00', 'Amber Fort', true),
  entry(bali.id, 1, '13:00:00', 'City Palace and Jantar Mantar', false),
  entry(bali.id, 1, '19:00:00', 'Rajasthani thali dinner', false),
  entry(bali.id, 3, '09:00:00', 'Lake Pichola boat ride', true),
  entry(bali.id, 3, '13:00:00', 'City Palace museum', false),
  entry(bali.id, 3, '19:00:00', 'Old city walking tour', true),
);

const find = (id: string) => {
  const t = db.trips.find((x) => x.id === id);
  if (!t) throw new Error('Trip not found.');
  return t;
};

/** Fake "AI" outfit matching: outdoor days get a daytime outfit, indoor-only days an evening one. Only fills empty days. */
function fillOutfits(tripId: string, days: number): number {
  let filled = 0;
  for (let d = 1; d <= days; d++) {
    if (db.assignments.some((a) => a.trip_id === tripId && a.day_number === d)) continue;
    const outdoor = db.entries.some((e) => e.trip_id === tripId && e.day_number === d && e.is_outdoor);
    const wanted = outdoor ? ['Beach', 'Temple', 'Casual', 'Daytime'] : ['Dinner', 'Evening'];
    const match = db.outfits.find((o) => o.occasions.some((x) => wanted.includes(x))) ?? db.outfits[(d - 1) % db.outfits.length];
    if (!match) continue;
    db.assignments.push({ id: uid(), trip_id: tripId, day_number: d, saved_outfit_id: match.id });
    filled++;
  }
  return filled;
}

export const mock = {
  async listTrips() {
    await delay();
    return [...db.trips].sort((a, b) => b.start_date.localeCompare(a.start_date));
  },
  async getTrip(id: string) {
    await delay(150);
    return { ...find(id) };
  },
  async createTrip(input: NewTripInput) {
    await delay();
    const t = trip({ ...input, status: 'planning' });
    db.trips.push(t);
    return { ...t };
  },
  async deleteTrip(id: string) {
    await delay();
    db.trips = db.trips.filter((t) => t.id !== id);
    db.entries = db.entries.filter((e) => e.trip_id !== id);
    db.assignments = db.assignments.filter((a) => a.trip_id !== id);
  },
  async setTripStatus(id: string, status: TripStatus) {
    await delay();
    find(id).status = status;
  },
  async listEntries(tripId: string) {
    await delay(150);
    return db.entries
      .filter((e) => e.trip_id === tripId)
      .sort((a, b) => a.day_number - b.day_number || a.entry_time.localeCompare(b.entry_time));
  },
  async addEntry(tripId: string, input: EntryInput) {
    await delay();
    db.entries.push({ id: uid(), trip_id: tripId, ...input, entry_time: `${input.entry_time}:00` });
  },
  async updateEntry(id: string, input: EntryInput) {
    await delay();
    const e = db.entries.find((x) => x.id === id);
    if (e) Object.assign(e, input, { entry_time: `${input.entry_time}:00` });
  },
  async deleteEntry(id: string) {
    await delay();
    db.entries = db.entries.filter((e) => e.id !== id);
  },
  async listAssignments(tripId: string) {
    await delay(100);
    return db.assignments.filter((a) => a.trip_id === tripId);
  },
  async assignOutfit(tripId: string, day: number, outfitId: string) {
    await delay();
    const existing = db.assignments.find((a) => a.trip_id === tripId && a.day_number === day);
    if (existing) existing.saved_outfit_id = outfitId;
    else db.assignments.push({ id: uid(), trip_id: tripId, day_number: day, saved_outfit_id: outfitId });
  },
  async listSavedOutfits() {
    await delay(100);
    return [...db.outfits];
  },
  /** Pretends to be the AI function: fills each day with sample entries after a short wait. */
  async generateItinerary(tripId: string, regenerate: boolean) {
    await delay(1500);
    const t = find(tripId);
    if (regenerate && db.entries.some((e) => e.trip_id === tripId)) t.regenerate_count += 1;
    db.entries = db.entries.filter((e) => e.trip_id !== tripId);
    const start = new Date(`${t.start_date}T00:00:00`).getTime();
    const end = new Date(`${t.end_date}T00:00:00`).getTime();
    const days = Math.round((end - start) / 86_400_000) + 1;
    // Pace from the preferences step: Relaxed 2 plans a day, Balanced 3, Packed 4.
    const perDay = t.preferences?.pace === 'Relaxed' ? 2 : t.preferences?.pace === 'Packed' ? 4 : 3;
    // Plans are spread evenly between the traveller's day start and end (the last one ends by the day end).
    const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
    const dayStart = toMin(t.preferences?.day_start ?? '09:00');
    const dayEnd = toMin(t.preferences?.day_end ?? '21:00');
    const slot = (i: number) => {
      const span = Math.max(0, dayEnd - 60 - dayStart);
      const m = Math.round((dayStart + (span * i) / (perDay - 1)) / 15) * 15;
      return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`;
    };
    let created = 0;
    for (let d = 1; d <= days; d++) {
      for (let i = 0; i < perDay; i++) {
        const [, title, outdoor] = SAMPLE[i % SAMPLE.length];
        db.entries.push(entry(tripId, d, slot(i), `${title} (sample)`, outdoor));
        created++;
      }
    }
    return { entriesCreated: created, outfitsAssigned: fillOutfits(tripId, days) };
  },
  async suggestOutfitsForTrip(tripId: string) {
    await delay(1200);
    const t = find(tripId);
    if (!db.entries.some((e) => e.trip_id === tripId)) throw new Error('Build your itinerary first, then we can suggest outfits.');
    if (db.outfits.length === 0) throw new Error('Create some outfits in Wardrobe first, then we can match them to your days.');
    if ((t.outfit_suggest_count ?? 0) >= 5) throw new Error('You’ve used all 5 outfit suggestions for this trip.');
    const days = Math.round((new Date(`${t.end_date}T00:00:00`).getTime() - new Date(`${t.start_date}T00:00:00`).getTime()) / 86_400_000) + 1;
    const before = db.assignments.filter((a) => a.trip_id === tripId).length;
    const assigned = fillOutfits(tripId, days);
    t.outfit_suggest_count = (t.outfit_suggest_count ?? 0) + 1;
    return { assigned, kept: before };
  },

  async listItems() {
    await delay(200);
    return [...db.items];
  },
  async uploadItems(entries: { file: File; category: string }[], onProgress?: (done: number, total: number) => void) {
    for (let i = 0; i < entries.length; i++) {
      await delay(120);
      const id = uid();
      db.items.unshift({
        id,
        user_id: ME,
        image_url: `${ME}/${id}.jpg`,
        category: entries[i].category,
        created_at: new Date().toISOString(),
        signedUrl: URL.createObjectURL(entries[i].file),
      });
      onProgress?.(i + 1, entries.length);
    }
    return { failed: [] as number[] };
  },
  async moveItemsCategory(from: string, to: string) {
    await delay();
    db.items.forEach((i) => {
      if (i.category === from) i.category = to;
    });
  },
  async updateItemCategory(id: string, category: string) {
    await delay();
    const it = db.items.find((x) => x.id === id);
    if (it) it.category = category;
  },
  async deleteItem(id: string) {
    await delay();
    db.items = db.items.filter((i) => i.id !== id);
    for (const [k, ids] of db.links) db.links.set(k, ids.filter((x) => x !== id));
  },
  async listOutfits(): Promise<OutfitWithItems[]> {
    await delay(150);
    return db.outfits.map((o) => ({ id: o.id, name: o.name, occasions: o.occasions, itemIds: db.links.get(o.id) ?? [] }));
  },
  async createOutfit(name: string, itemIds: string[], occasions: string[]) {
    await delay();
    const o = { id: uid(), user_id: ME, name, occasions };
    db.outfits.push(o);
    db.links.set(o.id, itemIds);
  },
  async updateOutfit(id: string, name: string, itemIds: string[], occasions: string[]) {
    await delay();
    const o = db.outfits.find((x) => x.id === id);
    if (o) Object.assign(o, { name, occasions });
    db.links.set(id, itemIds);
  },
  async deleteOutfit(id: string) {
    await delay();
    db.outfits = db.outfits.filter((o) => o.id !== id);
    db.assignments = db.assignments.filter((a) => a.saved_outfit_id !== id);
    db.links.delete(id);
  },
  /** Pretends to be the AI function: pairs a top with trousers or a skirt, plus shoes if there are any. */
  async suggestOutfits(): Promise<OutfitSuggestion[]> {
    await delay(1200);
    const pick = (cat: string) => db.items.filter((i) => i.category === cat).map((i) => i.id);
    const tops = pick('Tops');
    const bottoms = [...pick('Trousers'), ...pick('Skirts')];
    const shoes = pick('Shoes');
    const out: OutfitSuggestion[] = [];
    for (let i = 0; i < Math.min(3, tops.length, bottoms.length); i++) {
      out.push({
        name: `Combination ${i + 1}`,
        itemIds: [tops[i], bottoms[(i + 1) % bottoms.length], ...(shoes.length ? [shoes[0]] : [])],
      });
    }
    return out;
  },
  async listDestinations() {
    await delay(200);
    return [...destinations];
  },
  async searchDestinations(query: string) {
    await delay(150);
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return destinations.filter((d) => [d.name, d.country, d.region ?? ''].some((s) => s.toLowerCase().includes(q)));
  },
  async getDestination(id: string) {
    await delay(150);
    const d = destinations.find((x) => x.id === id);
    if (!d) throw new Error('Destination not found.');
    return { ...d };
  },
  async listUpcomingEvents() {
    await delay(150);
    return [...events];
  },
  async listNudges(tripId?: string) {
    await delay(150);
    return nudges.filter((n) => !tripId || n.trip_id === tripId).map((n) => ({ ...n }));
  },
  async acceptNudge(id: string) {
    await delay();
    const n = nudges.find((x) => x.id === id);
    if (!n) return;
    const e = db.entries.find((x) => x.id === n.itinerary_entry_id);
    if (e && n.suggested_title) Object.assign(e, { title: n.suggested_title, is_outdoor: false });
    n.status = 'accepted';
  },
  async dismissNudge(id: string) {
    await delay();
    const n = nudges.find((x) => x.id === id);
    if (n) n.status = 'dismissed';
  },
  async setSecondCity(tripId: string, destination: string, startDay: number) {
    await delay();
    const t = find(tripId);
    t.second_destination = destination;
    t.second_city_start_day = startDay;
  },
  async updateMyProfile(patch: Partial<Profile>) {
    await delay(150);
    Object.assign(db.profile, patch);
  },
  async getMyProfile() {
    await delay(100);
    return { ...db.profile };
  },
};
