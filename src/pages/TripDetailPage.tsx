import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, FileText, Plus, RefreshCw, Shirt, Trash2 } from 'lucide-react';
import { Dialog } from '@mui/material';
import { colors as c } from '../theme';
import {
  REGENERATE_CAP,
  addEntry,
  assignOutfit,
  deleteEntry,
  generateItinerary,
  getTrip,
  listAssignments,
  listEntries,
  listSavedOutfits,
  listTrips,
  setTripStatus,
  updateEntry,
} from '../data/trips';
import { dayCount, formatRange, titleCase, todayISO } from '../lib/dates';
import type { EntryInput, ItineraryEntry, OutfitAssignment, SavedOutfit, Trip } from '../types';
import { Badge, Button, ConfirmModal, ErrorText, Spinner } from '../components/ui';

type Pending =
  | { kind: 'delete'; entry: ItineraryEntry }
  | { kind: 'save-edit'; entry: ItineraryEntry; input: EntryInput }
  | { kind: 'regenerate' };

export default function TripDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [entries, setEntries] = useState<ItineraryEntry[]>([]);
  const [assignments, setAssignments] = useState<OutfitAssignment[]>([]);
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [day, setDay] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    (location.state as { notice?: string | null } | null)?.notice ?? null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const [entryDialog, setEntryDialog] = useState<{ entry?: ItineraryEntry } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [outfitOpen, setOutfitOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [readyErrors, setReadyErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [t, e, a, o] = await Promise.all([
        getTrip(id),
        listEntries(id),
        listAssignments(id),
        listSavedOutfits(),
      ]);
      setTrip(t);
      setEntries(e);
      setAssignments(a);
      setOutfits(o);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Couldn’t load this trip.');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalDays = trip ? dayCount(trip.start_date, trip.end_date) : 0;

  const cityFor = useCallback(
    (d: number) =>
      trip && trip.second_destination && trip.second_city_start_day && d >= trip.second_city_start_day
        ? trip.second_destination
        : trip?.destination ?? '',
    [trip],
  );

  const dayEntries = useMemo(() => entries.filter((e) => e.day_number === day), [entries, day]);
  const dayAssignment = assignments.find((a) => a.day_number === day);
  const dayOutfit = outfits.find((o) => o.id === dayAssignment?.saved_outfit_id);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmPending() {
    if (!pending) return;
    const p = pending;
    await run(async () => {
      if (p.kind === 'delete') await deleteEntry(p.entry.id);
      if (p.kind === 'save-edit') await updateEntry(p.entry.id, p.input);
      if (p.kind === 'regenerate') {
        try {
          await generateItinerary(id, true);
        } catch (err) {
          setNotice(err instanceof Error ? err.message : 'Regeneration failed.');
        }
      }
    });
    setPending(null);
  }

  function handleEntrySubmit(input: EntryInput, existing?: ItineraryEntry) {
    setEntryDialog(null);
    if (existing) {
      setPending({ kind: 'save-edit', entry: existing, input });
    } else {
      run(() => addEntry(id, input));
    }
  }

  async function handleConfirmReady() {
    if (!trip) return;
    const problems: string[] = [];
    const noEntries: number[] = [];
    const noOutfit: number[] = [];
    for (let d = 1; d <= totalDays; d++) {
      if (!entries.some((e) => e.day_number === d)) noEntries.push(d);
      if (!assignments.some((a) => a.day_number === d)) noOutfit.push(d);
    }
    if (noEntries.length) problems.push(`Add entries for day ${noEntries.join(', ')}.`);
    if (noOutfit.length) problems.push(`Assign an outfit for day ${noOutfit.join(', ')}.`);
    setReadyErrors(problems);
    if (problems.length) return;

    await run(async () => {
      await setTripStatus(trip.id, trip.start_date <= todayISO() ? 'active' : 'ready');
    });
    navigate('/trips');
  }

  if (loadError) {
    return (
      <div className="px-5 py-10 max-w-xl mx-auto">
        <ErrorText>{loadError}</ErrorText>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/trips')}>
            Back to trips
          </Button>
        </div>
      </div>
    );
  }
  if (!trip) return <Spinner />;

  const capReached = trip.regenerate_count >= REGENERATE_CAP;

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-10">
      <header className="px-4 pt-4 pb-3 sticky top-0 z-10" style={{ background: c.surface, borderBottom: `1px solid ${c.hairline}` }}>
        <div className="flex items-center">
          <button aria-label="Back" onClick={() => navigate('/trips')} className="no-print p-1">
            <ArrowLeft size={20} color={c.ink} />
          </button>
          <button className="flex-1 text-center pr-7" onClick={() => setSwitcherOpen(true)}>
            <p className="display text-lg" style={{ color: c.ink }}>
              {titleCase(trip.destination)}
            </p>
            <p className="body-font text-xs flex items-center justify-center gap-1" style={{ color: c.slate }}>
              {formatRange(trip.start_date, trip.end_date)}
              <ChevronDown size={12} className="no-print" />
            </p>
          </button>
        </div>

        <div className="no-print flex gap-2 overflow-x-auto mt-3 pb-1">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
            const active = d === day;
            const showCity = !!trip.second_destination && (d === 1 || d === trip.second_city_start_day);
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                className="body-font shrink-0 px-4 py-2 rounded-full text-sm leading-tight"
                style={
                  active
                    ? { background: c.deepSky, color: c.surface }
                    : { background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` }
                }
              >
                Day {d}
                {showCity && <span className="block text-[10px] opacity-80">{cityFor(d)}</span>}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-5 pt-5">
        {notice && (
          <div className="no-print rounded-xl px-4 py-3 mb-4 body-font text-xs" style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.slate }}>
            {notice}
          </div>
        )}

        <h2 className="display text-2xl mb-3" style={{ color: c.ink }}>
          {titleCase(cityFor(day))} <span className="body-font text-sm" style={{ color: c.slate }}>· Day {day}</span>
        </h2>

        <div className="flex flex-col gap-3">
          {dayEntries.length === 0 && (
            <p className="body-font text-sm py-2" style={{ color: c.slate }}>
              Nothing planned for this day yet.
            </p>
          )}
          {dayEntries.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl p-4 flex gap-4"
              style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
            >
              <p className="body-font text-sm w-12 shrink-0" style={{ color: c.slate }}>
                {e.entry_time.slice(0, 5)}
              </p>
              <div className="flex-1 min-w-0">
                <p className="body-font text-sm font-semibold mb-1.5" style={{ color: c.ink }}>
                  {e.title}
                </p>
                <Badge tone={e.is_outdoor ? 'active' : 'neutral'}>{e.is_outdoor ? 'Outdoor' : 'Indoor'}</Badge>
              </div>
              <div className="no-print flex items-start gap-3">
                <button onClick={() => setEntryDialog({ entry: e })} className="body-font text-sm" style={{ color: c.deepSky }}>
                  Edit
                </button>
                <button aria-label="Delete entry" onClick={() => setPending({ kind: 'delete', entry: e })}>
                  <Trash2 size={16} color={c.red} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setEntryDialog({})}
            className="no-print body-font text-sm py-3 rounded-2xl flex items-center justify-center gap-1.5"
            style={{ border: `1px dashed ${c.hairline}`, color: c.slate, background: c.surface }}
          >
            <Plus size={14} /> Add entry
          </button>
        </div>

        <h3 className="display text-lg mt-7 mb-2.5" style={{ color: c.ink }}>
          Outfit for Day {day}
        </h3>
        <div className="rounded-2xl p-5 text-center" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
          <Shirt size={22} color={c.slate} className="mx-auto mb-2" />
          <p className="body-font text-sm" style={{ color: c.slate }}>
            {dayOutfit ? dayOutfit.name : 'No outfit assigned for this day.'}
          </p>
          <button onClick={() => setOutfitOpen(true)} className="no-print body-font text-sm font-semibold mt-1" style={{ color: c.deepSky }}>
            {dayOutfit ? 'Change outfit' : 'Assign outfit'}
          </button>
        </div>

        <div className="no-print flex flex-col gap-3 mt-6">
          <Button
            variant="outline"
            disabled={capReached || busy}
            onClick={() => (entries.length ? setPending({ kind: 'regenerate' }) : run(async () => {
              try {
                await generateItinerary(id, true);
              } catch (err) {
                setNotice(err instanceof Error ? err.message : 'Regeneration failed.');
              }
            }))}
          >
            <RefreshCw size={15} /> Regenerate
            {capReached ? ' (limit reached)' : ` (${REGENERATE_CAP - trip.regenerate_count} left)`}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <FileText size={15} /> Share as PDF
          </Button>
          <Button onClick={handleConfirmReady} disabled={busy}>
            <Check size={16} /> Confirm, I’m ready
          </Button>
          {readyErrors.map((m) => (
            <ErrorText key={m}>{m}</ErrorText>
          ))}
          {actionError && <ErrorText>{actionError}</ErrorText>}
        </div>
      </div>

      <EntryDialog
        key={entryDialog?.entry?.id ?? (entryDialog ? 'new' : 'closed')}
        open={!!entryDialog}
        entry={entryDialog?.entry}
        day={day}
        onClose={() => setEntryDialog(null)}
        onSubmit={handleEntrySubmit}
      />

      <ConfirmModal
        open={pending?.kind === 'delete'}
        title="Delete this entry?"
        body={pending?.kind === 'delete' ? `“${pending.entry.title}” will be removed from this day.` : undefined}
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleConfirmPending}
        onCancel={() => setPending(null)}
      />
      <ConfirmModal
        open={pending?.kind === 'save-edit'}
        title="Save these changes?"
        confirmLabel="Save"
        busy={busy}
        onConfirm={handleConfirmPending}
        onCancel={() => setPending(null)}
      />
      <ConfirmModal
        open={pending?.kind === 'regenerate'}
        title="Regenerate the itinerary?"
        body="This replaces the current entries with a fresh draft and uses one of your regenerations."
        confirmLabel="Regenerate"
        busy={busy}
        onConfirm={handleConfirmPending}
        onCancel={() => setPending(null)}
      />

      <OutfitDialog
        open={outfitOpen}
        outfits={outfits}
        selectedId={dayAssignment?.saved_outfit_id}
        onClose={() => setOutfitOpen(false)}
        onPick={(outfitId) => {
          setOutfitOpen(false);
          run(() => assignOutfit(id, day, outfitId));
        }}
        onGoToWardrobe={() => navigate('/wardrobe')}
      />

      <SwitcherDialog open={switcherOpen} currentId={id} onClose={() => setSwitcherOpen(false)} onPick={(tid) => { setSwitcherOpen(false); navigate(`/trips/${tid}`); }} />
    </div>
  );
}

function EntryDialog({
  open,
  entry,
  day,
  onClose,
  onSubmit,
}: {
  open: boolean;
  entry?: ItineraryEntry;
  day: number;
  onClose: () => void;
  onSubmit: (input: EntryInput, existing?: ItineraryEntry) => void;
}) {
  const [time, setTime] = useState(entry ? entry.entry_time.slice(0, 5) : '');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [outdoor, setOutdoor] = useState<boolean | null>(entry ? entry.is_outdoor : null);
  const valid = time !== '' && title.trim() !== '' && outdoor !== null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
      <div className="p-5 flex flex-col gap-4">
        <p className="display text-xl" style={{ color: c.ink }}>
          {entry ? 'Edit entry' : `Add entry · Day ${day}`}
        </p>
        <label className="block">
          <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>Time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
            style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
          />
        </label>
        <label className="block">
          <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>What’s the plan?</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Uluwatu Temple"
            className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
            style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
          />
        </label>
        <div>
          <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
            Indoor or outdoor? <span className="font-normal text-xs" style={{ color: c.slate }}>— required, it drives weather alerts</span>
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {([['Outdoor', true], ['Indoor', false]] as const).map(([label, val]) => (
              <button
                key={label}
                type="button"
                onClick={() => setOutdoor(val)}
                className="body-font text-sm py-3 rounded-xl"
                style={
                  outdoor === val
                    ? { background: c.deepSkyWash, color: c.deepSky, border: `1px solid ${c.deepSkyWash}`, fontWeight: 600 }
                    : { background: c.surface, color: c.ink, border: `1px solid ${c.hairline}` }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2.5 mt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => onSubmit({ day_number: entry?.day_number ?? day, entry_time: time, title: title.trim(), is_outdoor: outdoor as boolean }, entry)}
          >
            {entry ? 'Save' : 'Add'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function OutfitDialog({
  open,
  outfits,
  selectedId,
  onClose,
  onPick,
  onGoToWardrobe,
}: {
  open: boolean;
  outfits: SavedOutfit[];
  selectedId?: string;
  onClose: () => void;
  onPick: (id: string) => void;
  onGoToWardrobe: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
      <div className="p-5">
        <p className="display text-xl mb-3" style={{ color: c.ink }}>Pick an outfit</p>
        {outfits.length === 0 ? (
          <>
            <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
              You haven’t saved any outfits yet. Create one in Wardrobe, then assign it here.
            </p>
            <Button onClick={onGoToWardrobe}>Go to Wardrobe</Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            {outfits.map((o) => (
              <button
                key={o.id}
                onClick={() => onPick(o.id)}
                className="body-font text-sm text-left px-4 py-3.5 rounded-xl flex justify-between items-center"
                style={{ background: c.surface, border: `1px solid ${o.id === selectedId ? c.deepSky : c.hairline}`, color: c.ink }}
              >
                {o.name}
                {o.id === selectedId && <Check size={16} color={c.deepSky} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}

function SwitcherDialog({
  open,
  currentId,
  onClose,
  onPick,
}: {
  open: boolean;
  currentId: string;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const [trips, setTrips] = useState<Trip[] | null>(null);
  useEffect(() => {
    if (open) listTrips().then(setTrips).catch(() => setTrips([]));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
      <div className="p-5">
        <p className="display text-xl mb-3" style={{ color: c.ink }}>Switch trip</p>
        {trips === null ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-2">
            {trips.map((t) => (
              <button
                key={t.id}
                onClick={() => onPick(t.id)}
                className="body-font text-sm text-left px-4 py-3 rounded-xl"
                style={{ background: c.surface, border: `1px solid ${t.id === currentId ? c.deepSky : c.hairline}`, color: c.ink }}
              >
                {titleCase(t.destination)}
                <span className="block text-xs" style={{ color: c.slate }}>{formatRange(t.start_date, t.end_date)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
