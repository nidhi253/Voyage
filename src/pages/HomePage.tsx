import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, MapPin, Search, Shirt } from 'lucide-react';
import { colors as c } from '../theme';
import { getMyProfile } from '../data/profile';
import { listDestinations, listNudges, listUpcomingEvents, searchDestinations } from '../data/home';
import { listAssignments, listEntries, listSavedOutfits, listTrips } from '../data/trips';
import { addDays, dayCount, formatDay, titleCase, todayISO } from '../lib/dates';
import { effectiveStatus } from '../lib/tripStatus';
import type { Destination, EventItem, ItineraryEntry, Nudge, OutfitAssignment, SavedOutfit, Trip } from '../types';
import { Badge, Button, ErrorText, SectionLabel, Spinner } from '../components/ui';
import DestImage from '../components/DestImage';
import NudgeCard from '../components/NudgeCard';

interface TripPlan {
  trip: Trip;
  entries: ItineraryEntry[];
  assignments: OutfitAssignment[];
}

function cityFor(trip: Trip, day: number) {
  return trip.second_destination && trip.second_city_start_day && day >= trip.second_city_start_day
    ? trip.second_destination
    : trip.destination;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [planning, setPlanning] = useState<TripPlan[]>([]);
  const [current, setCurrent] = useState<TripPlan | null>(null);
  const [currentNudges, setCurrentNudges] = useState<Nudge[]>([]);
  const [hasPendingNudges, setHasPendingNudges] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Destination[] | null>(null);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    try {
      const today = todayISO();
      const tomorrow = addDays(today, 1);
      const [trips, dests, evs, profile, savedOutfits, allNudges] = await Promise.all([
        listTrips(),
        listDestinations(),
        listUpcomingEvents(),
        getMyProfile().catch(() => null),
        listSavedOutfits(),
        listNudges(),
      ]);
      setDestinations(dests);
      setEvents(evs);
      setUserTags(profile?.tags ?? []);
      setOutfits(savedOutfits);
      setHasPendingNudges(allNudges.some((n) => n.status === 'pending'));

      const withPlan = async (trip: Trip): Promise<TripPlan> => {
        const [entries, assignments] = await Promise.all([listEntries(trip.id), listAssignments(trip.id)]);
        return { trip, entries, assignments };
      };

      // Today view: an active trip whose dates include today. Day-ahead: a trip starting tomorrow.
      const activeTrip = trips.find((t) => effectiveStatus(t, today) === 'active' && t.start_date <= today && today <= t.end_date);
      const startsTomorrow = trips.find((t) => (t.status === 'ready' || t.status === 'active') && t.start_date === tomorrow);
      const focus = activeTrip ?? startsTomorrow ?? null;
      setCurrent(focus ? await withPlan(focus) : null);
      setCurrentNudges(focus ? allNudges.filter((n) => n.trip_id === focus.id) : []);

      setPlanning(await Promise.all(trips.filter((t) => effectiveStatus(t, today) === 'planning').slice(0, 2).map(withPlan)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t load Home.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced destination search by city, region or country.
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const id = setTimeout(() => {
      searchDestinations(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const picked = useMemo(() => {
    const score = (d: Destination) => d.tags.filter((t) => userTags.includes(t)).length;
    return [...destinations].sort((a, b) => score(b) - score(a)).slice(0, 6);
  }, [destinations, userTags]);

  const today = todayISO();
  const isToday = !!current && current.trip.start_date <= today && today <= current.trip.end_date;
  const dayNum = current ? (isToday ? dayCount(current.trip.start_date, today) : 1) : 0;
  const totalDays = current ? dayCount(current.trip.start_date, current.trip.end_date) : 0;
  const title = current ? (isToday ? `Today in ${titleCase(cityFor(current.trip, dayNum))}` : 'Trip starts tomorrow') : 'Hey there';

  return (
    <div className="px-5 pt-6 pb-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="display text-2xl md:text-3xl" style={{ color: c.ink }}>
          {title}
        </h1>
        <button
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
          className="relative rounded-full p-2"
          style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
        >
          <Bell size={18} color={c.ink} />
          {hasPendingNudges && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: c.deepSky }} />
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      {!loaded ? (
        <Spinner />
      ) : (
        <>
          {current && (
            <TodaySection
              plan={current}
              isToday={isToday}
              dayNum={dayNum}
              totalDays={totalDays}
              outfits={outfits}
              nudges={currentNudges}
              onChanged={load}
            />
          )}

          {planning.length > 0 && (
            <div className="mb-6 grid gap-3 md:grid-cols-2">
              {planning.map(({ trip, entries, assignments }) => {
                const total = dayCount(trip.start_date, trip.end_date);
                let ready = 0;
                for (let d = 1; d <= total; d++) {
                  if (entries.some((e) => e.day_number === d) && assignments.some((a) => a.day_number === d)) ready++;
                }
                return (
                  <div key={trip.id} className="rounded-2xl p-5" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
                    <p className="display text-lg mb-1" style={{ color: c.ink }}>
                      {titleCase(trip.destination)} isn’t finished yet
                    </p>
                    <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
                      {ready} of {total} days ready — each needs entries and an outfit.
                    </p>
                    <div className="max-w-[230px]">
                      <Button className="whitespace-nowrap" onClick={() => navigate(`/trips/${trip.id}`)}>Continue planning</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <label className="relative block mb-6">
            <Search size={16} color={c.slate} className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations"
              className="body-font w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
          </label>

          {results !== null || searching ? (
            <>
              <SectionLabel>{searching ? 'Searching…' : `${results?.length ?? 0} results`}</SectionLabel>
              {!searching && results?.length === 0 ? (
                <div className="rounded-2xl p-5" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
                  <p className="display text-lg mb-1" style={{ color: c.ink }}>
                    No guide for “{query.trim()}” yet
                  </p>
                  <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
                    You can still plan a trip there. Add your dates and we’ll build the days around it.
                  </p>
                  <div className="max-w-xs">
                    <Button onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(query.trim())}`)}>
                      Plan a trip to {titleCase(query.trim())}
                    </Button>
                  </div>
                </div>
              ) : (
                <DestGrid destinations={results ?? []} />
              )}
            </>
          ) : (
            <>
              <SectionLabel>Picked for you</SectionLabel>
              {picked.length === 0 ? (
                <p className="body-font text-sm mb-6" style={{ color: c.slate }}>
                  Destination ideas will show up here once they’re added.
                </p>
              ) : (
                <DestGrid destinations={picked} />
              )}

              {events.length > 0 && (
                <>
                  <div className="mt-7">
                    <SectionLabel>Coming up nearby</SectionLabel>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="shrink-0 w-44 rounded-2xl overflow-hidden"
                        style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
                      >
                        <DestImage url={ev.image_url} name={ev.name} className="w-full h-24" />
                        <div className="p-3">
                          <p className="display text-base leading-tight" style={{ color: c.ink }}>
                            {ev.name}
                          </p>
                          <p className="body-font text-xs mt-1" style={{ color: c.slate }}>
                            {ev.location}
                          </p>
                          <p className="body-font text-xs mt-1 flex items-center gap-1" style={{ color: c.slate }}>
                            <Calendar size={11} />
                            {formatDay(ev.event_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {loaded && (picked.length > 0 || events.length > 0) && <PhotoCredits destinations={picked} events={events} />}
    </div>
  );
}

function PhotoCredits({ destinations, events }: { destinations: Destination[]; events: EventItem[] }) {
  const rows = [
    ...destinations.map((d) => ({ name: d.name, credit: d.image_credit, url: d.image_source_url })),
    ...events.map((e) => ({ name: e.name, credit: e.image_credit, url: e.image_source_url })),
  ].filter((r) => r.credit);
  if (rows.length === 0) return null;
  return (
    <details className="mt-8 body-font text-xs" style={{ color: c.slate }}>
      <summary className="cursor-pointer">Photo credits</summary>
      <ul className="mt-2 flex flex-col gap-1">
        {rows.map((r) => (
          <li key={r.name}>
            {r.name}: {r.credit}
            {r.url && (
              <>
                {' '}·{' '}
                <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                  source
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

function DestGrid({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {destinations.map((d) => (
        <Link
          key={d.id}
          to={`/destinations/${d.id}`}
          className="rounded-2xl overflow-hidden block no-underline"
          style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
        >
          <DestImage url={d.image_url} name={d.name} className="w-full h-28 md:h-36" />
          <div className="p-3">
            <p className="display text-base" style={{ color: c.ink }}>
              {d.name}
            </p>
            <p className="body-font text-xs" style={{ color: c.slate }}>
              {d.country}
            </p>
            {d.short_description && (
              <p className="body-font text-xs mt-1.5" style={{ color: c.slate }}>
                {d.short_description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function TodaySection({
  plan,
  isToday,
  dayNum,
  totalDays,
  outfits,
  nudges,
  onChanged,
}: {
  plan: TripPlan;
  isToday: boolean;
  dayNum: number;
  totalDays: number;
  outfits: SavedOutfit[];
  nudges: Nudge[];
  onChanged: () => void;
}) {
  const { trip, entries, assignments } = plan;
  const dayEntries = entries.filter((e) => e.day_number === dayNum);
  const entryIds = new Set(dayEntries.map((e) => e.id));
  const dayNudges = nudges.filter((n) => entryIds.has(n.itinerary_entry_id));
  const pending = isToday ? dayNudges.filter((n) => n.status === 'pending') : [];
  const accepted = dayNudges.filter((n) => n.status === 'accepted' && n.suggested_outfit_note);
  const outfit = outfits.find((o) => o.id === assignments.find((a) => a.day_number === dayNum)?.saved_outfit_id);

  const nextDay = dayNum + 1;
  const nextEntries = isToday && nextDay <= totalDays ? entries.filter((e) => e.day_number === nextDay) : [];
  const nextOutfit = outfits.find((o) => o.id === assignments.find((a) => a.day_number === nextDay)?.saved_outfit_id);

  return (
    <div className="mb-7">
      {pending.map((n) => (
        <NudgeCard key={n.id} nudge={n} location={cityFor(trip, dayNum)} onDone={onChanged} />
      ))}

      <SectionLabel>{isToday ? 'Your plan for today' : 'Your first day'}</SectionLabel>
      <div className="flex flex-col gap-3 mb-4">
        {dayEntries.length === 0 && (
          <p className="body-font text-sm" style={{ color: c.slate }}>
            Nothing planned for this day.
          </p>
        )}
        {dayEntries.map((e) => (
          <div key={e.id} className="rounded-2xl p-4 flex gap-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-sm w-12 shrink-0" style={{ color: c.slate }}>
              {e.entry_time.slice(0, 5)}
            </p>
            <p className="body-font text-sm font-semibold flex-1" style={{ color: c.ink }}>
              {e.title}
            </p>
            <Badge tone={e.is_outdoor ? 'active' : 'neutral'}>{e.is_outdoor ? 'Outdoor' : 'Indoor'}</Badge>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        <Shirt size={18} color={c.slate} />
        <div>
          <p className="body-font text-sm" style={{ color: c.ink }}>
            {outfit ? outfit.name : 'No outfit assigned yet'}
          </p>
          {accepted.map((n) => (
            <p key={n.id} className="body-font text-xs" style={{ color: c.slate }}>
              {n.suggested_outfit_note}
            </p>
          ))}
        </div>
        {!outfit && (
          <Link to={`/trips/${trip.id}`} className="body-font text-sm font-semibold ml-auto" style={{ color: c.deepSky }}>
            Assign
          </Link>
        )}
      </div>

      {nextEntries.length > 0 && (
        <div className="mt-6">
          <SectionLabel>Tomorrow · {formatDay(addDays(todayISO(), 1))}</SectionLabel>
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-sm mb-2 flex items-center gap-1.5" style={{ color: c.slate }}>
              <MapPin size={13} /> {titleCase(cityFor(trip, nextDay))}
              {nextOutfit && <span className="ml-auto">Outfit: {nextOutfit.name}</span>}
            </p>
            {nextEntries.map((e) => (
              <p key={e.id} className="body-font text-sm py-0.5" style={{ color: c.ink }}>
                <span style={{ color: c.slate }}>{e.entry_time.slice(0, 5)}</span> · {e.title}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
