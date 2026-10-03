import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { Dialog } from '@mui/material';
import { colors as c } from '../theme';
import { listTrips, setSecondCity } from '../data/trips';
import { dayCount, titleCase } from '../lib/dates';
import type { Destination, Trip } from '../types';
import { Button, ErrorText, Spinner } from './ui';

/** "Add <destination> to a trip": pick a trip, then choose which day the second city starts. */
export default function AddToTripSheet({
  open,
  destination,
  onClose,
}: {
  open: boolean;
  destination: Destination;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [chosen, setChosen] = useState<Trip | null>(null);
  const [startDay, setStartDay] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setChosen(null);
    setStartDay('');
    setError(null);
    listTrips()
      .then((t) => setTrips(t.filter((x) => x.status !== 'completed')))
      .catch(() => setTrips([]));
  }, [open]);

  const days = chosen ? dayCount(chosen.start_date, chosen.end_date) : 0;
  const dayNum = Number(startDay);
  const valid = Number.isInteger(dayNum) && dayNum >= 2 && dayNum <= days;

  async function save() {
    if (!chosen || !valid) return;
    setSaving(true);
    setError(null);
    try {
      await setSecondCity(chosen.id, destination.name, dayNum);
      onClose();
      navigate(`/trips/${chosen.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t update that trip.');
      setSaving(false);
    }
  }

  const createNew = () => {
    onClose();
    navigate(`/trips/new?destination=${encodeURIComponent(destination.name)}`);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '24px', m: 2, alignSelf: 'flex-end' } }}
    >
      <div className="p-5">
        <p className="display text-xl mb-3" style={{ color: c.ink }}>
          Add {destination.name} to a trip
        </p>

        {chosen ? (
          <div className="flex flex-col gap-3">
            <p className="body-font text-sm" style={{ color: c.slate }}>
              {titleCase(chosen.destination)} has {days} days. Which day should {destination.name} start?
            </p>
            <input
              inputMode="numeric"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value.replace(/\D/g, ''))}
              placeholder={`A day from 2 to ${days}`}
              className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
            {error && <ErrorText>{error}</ErrorText>}
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => setChosen(null)} disabled={saving}>
                Back
              </Button>
              <Button disabled={!valid || saving} onClick={save}>
                {saving ? 'Adding…' : 'Add'}
              </Button>
            </div>
          </div>
        ) : trips === null ? (
          <Spinner />
        ) : (
          <>
            <div className="flex flex-col">
              {trips.map((t) => {
                const hasSecond = !!t.second_destination;
                return (
                  <button
                    key={t.id}
                    disabled={hasSecond}
                    onClick={() => setChosen(t)}
                    className="body-font text-left py-3.5 flex items-center justify-between disabled:opacity-50"
                    style={{ borderBottom: `1px solid ${c.hairline}` }}
                  >
                    <span>
                      <span className="block text-sm font-semibold" style={{ color: c.ink }}>
                        {titleCase(t.destination)}
                      </span>
                      <span className="block text-xs" style={{ color: c.slate }}>
                        {dayCount(t.start_date, t.end_date)} days · {t.status}
                        {hasSecond && ' · already has two cities'}
                      </span>
                    </span>
                    {!hasSecond && <ChevronRight size={16} color={c.slate} />}
                  </button>
                );
              })}
              {trips.length === 0 && (
                <p className="body-font text-sm py-2" style={{ color: c.slate }}>
                  You don’t have any trips yet.
                </p>
              )}
            </div>
            <button onClick={createNew} className="body-font text-sm font-semibold mt-4 flex items-center gap-1.5" style={{ color: c.deepSky }}>
              <Plus size={14} /> Create a new trip instead
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
}
