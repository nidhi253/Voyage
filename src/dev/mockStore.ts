// In-memory fake database for preview mode. Resets on page reload.
import type {
  EntryInput,
  ItineraryEntry,
  NewTripInput,
  OutfitAssignment,
  Profile,
  SavedOutfit,
  Trip,
  TripStatus,
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

const db = {
  trips: [
    bali,
    trip({ destination: 'indonesia', start_date: '2026-08-20', end_date: '2026-08-26', status: 'active' }),
    trip({ destination: 'bali', start_date: '2026-05-01', end_date: '2026-05-04', status: 'ready' }),
    trip({ destination: 'Lisbon', start_date: '2026-03-02', end_date: '2026-03-08', status: 'completed' }),
  ] as Trip[],
  entries: [] as ItineraryEntry[],
  assignments: [] as OutfitAssignment[],
  outfits: [
    { id: uid(), user_id: ME, name: 'Beach day' },
    { id: uid(), user_id: ME, name: 'Temple visit' },
    { id: uid(), user_id: ME, name: 'Evening out' },
  ] as SavedOutfit[],
  profile: { id: ME, name: 'Larry', age: 30, tags: ['Adventurous', 'Chill'], dark_mode: false } as Profile,
};

const entry = (trip_id: string, day_number: number, entry_time: string, title: string, is_outdoor: boolean): ItineraryEntry => ({
  id: uid(),
  trip_id,
  day_number,
  entry_time,
  title,
  is_outdoor,
});

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
  async getMyProfile() {
    await delay(100);
    return { ...db.profile };
  },
};
