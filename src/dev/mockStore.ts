// In-memory fake database for preview mode. Resets on page reload.
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
  destination: 'Bali',
  second_destination: 'lombok',
  second_city_start_day: 3,
  start_date: '2026-11-23',
  end_date: '2026-11-30',
  status: 'planning',
});

// Active trip around "today" so Home's Today state shows in preview (today = day 3).
const indo = trip({
  destination: 'indonesia',
  start_date: addDays(todayISO(), -2),
  end_date: addDays(todayISO(), 4),
  status: 'active',
});

const db = {
  trips: [
    bali,
    indo,
    trip({ destination: 'bali', start_date: '2026-05-01', end_date: '2026-05-04', status: 'ready' }),
    trip({ destination: 'Lisbon', start_date: '2026-03-02', end_date: '2026-03-08', status: 'completed' }),
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
const rice = entry(indo.id, 3, '15:00:00', 'Tegallalang rice terrace walk', true);
db.entries.push(
  entry(indo.id, 3, '09:00:00', 'Breakfast at a local warung', false),
  rice,
  entry(indo.id, 3, '19:00:00', 'Dinner in Seminyak', false),
  entry(indo.id, 4, '10:00:00', 'Tirta Empul water temple', true),
  entry(indo.id, 4, '14:00:00', 'Ubud market', true),
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
    reason: 'Rain is expected from 2pm. Your 3pm rice terrace walk is outdoors, so swap it for a museum visit and bring a light layer.',
    suggested_title: 'Ubud art museum',
    suggested_outfit_note: 'Light layer added',
    status: 'pending',
    created_at: new Date().toISOString(),
    trips: { destination: 'indonesia' },
  },
];

const dest = (
  name: string,
  country: string,
  region: string,
  color: string,
  short: string,
  best: string,
  tags: string[],
  highlights: string[],
  full?: string,
): Destination => ({
  id: uid(),
  name,
  country,
  region,
  image_url: swatch(name, color),
  short_description: short,
  full_description: full ?? `${short} A great pick for ${tags.join(' and ').toLowerCase()} travellers.`,
  best_time_to_visit: best,
  tags,
  highlights,
});

const destinations: Destination[] = [
  dest('Bali', 'Indonesia', 'Bali', '#BFD8B8', 'Temples, surf breaks, and rice terraces.', 'Apr – Oct (dry season)', ['Adventurous', 'Chill'],
    ['Tegalalang Rice Terraces', 'Uluwatu Temple at sunset', 'Mount Batur sunrise hike', 'Ubud monkey forest', 'Seminyak beach clubs'],
    'Bali is Indonesia’s most beloved island, where volcanic mountains meet palm-fringed beaches. Spend your mornings hiking emerald rice terraces, your afternoons at ancient water temples, and your evenings watching the sun drop into the Indian Ocean from a cliff-top shrine.'),
  dest('Lisbon', 'Portugal', 'Lisbon', '#F0D9A8', 'Hills, tilework, and golden light.', 'Mar – May, Sep – Oct', ['Chill', 'Family'],
    ['Alfama’s winding streets', 'Tram 28', 'Belém pastries', 'Sunset at Miradouro da Senhora do Monte']),
  dest('Kyoto', 'Japan', 'Kansai', '#C9D3C3', 'Shrines, tea houses, and bamboo groves.', 'Mar – Apr, Oct – Nov', ['Pilgrimage', 'Chill'],
    ['Fushimi Inari gates', 'Arashiyama bamboo grove', 'Kinkaku-ji', 'A tea ceremony in Gion']),
  dest('Marrakech', 'Morocco', 'Marrakech-Safi', '#E3B79A', 'Souks, riads, and desert gates.', 'Mar – May, Sep – Nov', ['Adventurous', 'Family'],
    ['Jemaa el-Fnaa at dusk', 'Majorelle Garden', 'Souk bargaining', 'A night in the Agafay desert']),
  dest('Reykjavik', 'Iceland', 'Capital Region', '#B5C9DB', 'Glaciers, geysers, and hot springs.', 'Jun – Aug, Sep – Mar for aurora', ['Adventurous'],
    ['Golden Circle drive', 'Blue Lagoon', 'Northern lights chase', 'Hallgrímskirkja']),
  dest('Tulum', 'Mexico', 'Quintana Roo', '#BFE0DA', 'Cenotes, ruins, and beach clubs.', 'Nov – Apr', ['Chill', 'Adventurous'],
    ['Cenote swim', 'Tulum ruins at sunrise', 'Sian Ka’an biosphere', 'Beach yoga']),
  dest('San José', 'Costa Rica', 'San José', '#A9C9A4', 'Cloud forests, volcanoes, and wildlife.', 'Dec – Apr', ['Adventurous', 'Family'],
    ['Arenal volcano', 'Monteverde cloud forest', 'Manuel Antonio wildlife', 'Zip-lining']),
];

const events: EventItem[] = [
  { id: uid(), name: 'Lantern Festival', location: 'Hoi An, Vietnam', event_date: addDays(todayISO(), 12), image_url: swatch('Lantern Festival', '#F2C9B8'), tags: ['Pilgrimage', 'Family'] },
  { id: uid(), name: 'La Tomatina', location: 'Buñol, Spain', event_date: addDays(todayISO(), 25), image_url: swatch('La Tomatina', '#E8B4B0'), tags: ['Adventurous'] },
  { id: uid(), name: 'Nyepi Day', location: 'Bali, Indonesia', event_date: addDays(todayISO(), 40), image_url: swatch('Nyepi Day', '#C9D6E3'), tags: ['Pilgrimage', 'Chill'] },
];

function entry(trip_id: string, day_number: number, entry_time: string, title: string, is_outdoor: boolean): ItineraryEntry {
  return { id: uid(), trip_id, day_number, entry_time, title, is_outdoor };
}

const SAMPLE: Array<[string, string, boolean]> = [
  ['09:00', 'Sunrise viewpoint hike', true],
  ['13:00', 'Local museum', false],
  ['19:00', 'Cooking class', false],
];

db.entries.push(
  entry(bali.id, 1, '09:00:00', 'Mount Batur Sunrise Hike', true),
  entry(bali.id, 1, '13:00:00', 'Uluwatu Temple', true),
  entry(bali.id, 1, '19:00:00', 'Ubud Cooking Class', false),
  entry(bali.id, 3, '09:00:00', 'Sunset Viewpoint', true),
  entry(bali.id, 3, '13:00:00', 'City Museum', false),
  entry(bali.id, 3, '19:00:00', 'City Walking Tour', true),
);

const find = (id: string) => {
  const t = db.trips.find((x) => x.id === id);
  if (!t) throw new Error('Trip not found.');
  return t;
};

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
    if (regenerate) t.regenerate_count += 1;
    db.entries = db.entries.filter((e) => e.trip_id !== tripId);
    const start = new Date(`${t.start_date}T00:00:00`).getTime();
    const end = new Date(`${t.end_date}T00:00:00`).getTime();
    const days = Math.round((end - start) / 86_400_000) + 1;
    for (let d = 1; d <= days; d++) {
      for (const [time, title, outdoor] of SAMPLE) {
        db.entries.push(entry(tripId, d, `${time}:00`, `${title} (sample)`, outdoor));
      }
    }
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
