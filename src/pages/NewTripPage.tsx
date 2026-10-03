import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@mui/material';
import { colors as c } from '../theme';
import { createTrip, generateItinerary } from '../data/trips';
import { getMyProfile } from '../data/profile';
import { dayCount, isValidISODate } from '../lib/dates';
import { PERSONA_TAGS } from '../types';
import { Button, Chip, ErrorText, Field, Spinner } from '../components/ui';

export default function NewTripPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [destination, setDestination] = useState(params.get('destination') ?? '');
  const [multiCity, setMultiCity] = useState(false);
  const [second, setSecond] = useState('');
  const [secondStartDay, setSecondStartDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budget, setBudget] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>(PERSONA_TAGS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tags default from the profile but stay editable per trip.
  useEffect(() => {
    getMyProfile()
      .then((p) => {
        if (!p) return;
        setTags(p.tags ?? []);
        setTagOptions(Array.from(new Set([...PERSONA_TAGS, ...(p.tags ?? [])])));
      })
      .catch(() => {});
  }, []);

  const datesOk = isValidISODate(start) && isValidISODate(end) && end >= start;
  const days = datesOk ? dayCount(start, end) : 0;
  const startDayNum = Number(secondStartDay);
  const secondOk =
    !multiCity ||
    (second.trim().length > 0 && Number.isInteger(startDayNum) && startDayNum >= 2 && startDayNum <= days);
  const budgetOk = budget === '' || (!Number.isNaN(Number(budget)) && Number(budget) >= 0);
  const canSubmit = destination.trim().length > 0 && datesOk && secondOk && budgetOk && !submitting;

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    let tripId: string;
    try {
      const trip = await createTrip({
        destination: destination.trim(),
        second_destination: multiCity ? second.trim() : null,
        second_city_start_day: multiCity ? startDayNum : null,
        start_date: start,
        end_date: end,
        budget: budget === '' ? null : Number(budget),
        tags,
      });
      tripId = trip.id;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t create the trip.');
      setSubmitting(false);
      return;
    }

    let notice: string | null = null;
    try {
      await generateItinerary(tripId, false);
    } catch (e) {
      notice = e instanceof Error ? e.message : 'Itinerary generation failed.';
    }
    navigate(`/trips/${tripId}`, { replace: true, state: { notice } });
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <Spinner />
        <p className="body-font text-sm" style={{ color: c.slate }}>
          Building your trip…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">
      <header
        className="flex items-center px-4 py-4 sticky top-0 z-10"
        style={{ background: c.surface, borderBottom: `1px solid ${c.hairline}` }}
      >
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} color={c.ink} />
        </button>
        <h1 className="display text-lg flex-1 text-center pr-7" style={{ color: c.ink }}>
          New trip
        </h1>
      </header>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4">
        <Field
          label="Destination"
          placeholder="e.g. Bali"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <span className="body-font text-sm font-semibold" style={{ color: c.ink }}>
            Multi-city trip
          </span>
          <Switch
            checked={multiCity}
            onChange={(e) => setMultiCity(e.target.checked)}
            inputProps={{ 'aria-label': 'Multi-city trip' }}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: c.teal },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: c.teal },
            }}
          />
        </div>

        {multiCity && (
          <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: c.bg, border: `1px solid ${c.hairline}` }}>
            <Field
              label="Second destination"
              placeholder="e.g. Lombok"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
            />
            <Field
              label="Start day for second city"
              placeholder="e.g. 3"
              inputMode="numeric"
              value={secondStartDay}
              onChange={(e) => setSecondStartDay(e.target.value.replace(/\D/g, ''))}
              error={secondStartDay !== '' && !secondOk}
            />
            {days > 0 && (
              <p className="body-font text-xs" style={{ color: c.slate }}>
                Pick a day between 2 and {days}.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Field
            label="End date"
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => setEnd(e.target.value)}
            error={end !== '' && start !== '' && end < start}
          />
        </div>

        <Field
          label="Budget"
          hint="optional, helps us tailor suggestions"
          placeholder="e.g. 1500"
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          error={!budgetOk}
        />

        <div>
          <p className="body-font text-sm font-semibold mb-2" style={{ color: c.ink }}>
            Travel tags
          </p>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((t) => (
              <Chip key={t} label={t} selected={tags.includes(t)} onClick={() => toggleTag(t)} />
            ))}
          </div>
        </div>

        {error && <ErrorText>{error}</ErrorText>}
      </div>

      <div
        className="sticky bottom-0 px-5 py-4"
        style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}
      >
        <Button disabled={!canSubmit} onClick={handleSubmit}>
          Generate my itinerary
        </Button>
      </div>
    </div>
  );
}
