import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Switch } from '@mui/material';
import { colors as c } from '../theme';
import { createTrip, generateItinerary } from '../data/trips';
import { getMyProfile } from '../data/profile';
import { dayCount, isValidISODate } from '../lib/dates';
import {
  INTEREST_OPTIONS,
  MAX_MUST_DO,
  PACE_OPTIONS,
  PERSONA_TAGS,
  TRAVELLER_OPTIONS,
  type TripPreferences,
} from '../types';
import { Button, Chip, ErrorText, Field, Spinner } from '../components/ui';

type Step = 'details' | 'preferences';

export default function NewTripPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>('details');

  const [destination, setDestination] = useState(params.get('destination') ?? '');
  const [multiCity, setMultiCity] = useState(false);
  const [second, setSecond] = useState('');
  const [secondStartDay, setSecondStartDay] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budget, setBudget] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>(PERSONA_TAGS);

  // Step 2: what the traveller likes. Balanced is the default pace; everything else is optional.
  const [travellers, setTravellers] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>('Balanced');
  const [interests, setInterests] = useState<string[]>([]);
  const [mustDo, setMustDo] = useState('');

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
  const detailsOk = destination.trim().length > 0 && datesOk && secondOk && budgetOk;

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function toggleInterest(t: string) {
    setInterests((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function handleSubmit(skipPreferences = false) {
    if (!detailsOk || submitting) return;
    setSubmitting(true);
    setError(null);

    const preferences: TripPreferences | null = skipPreferences
      ? null
      : {
          travellers,
          pace,
          interests,
          must_do: mustDo.trim() || null,
        };

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
        preferences,
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
        <button aria-label="Back" onClick={() => (step === 'preferences' ? setStep('details') : navigate(-1))} className="p-1">
          <ArrowLeft size={20} color={c.ink} />
        </button>
        <div className="flex-1 text-center pr-7">
          <h1 className="display text-lg" style={{ color: c.ink }}>
            {step === 'details' ? 'New trip' : 'Your preferences'}
          </h1>
          <p className="body-font text-[11px]" style={{ color: c.slate }}>
            Step {step === 'details' ? 1 : 2} of 2
          </p>
        </div>
      </header>

      {step === 'details' ? (
        <>
          <div className="flex-1 px-5 py-5 flex flex-col gap-4">
            <Field
              label="Destination"
              placeholder="e.g. Jaipur"
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
                  placeholder="e.g. Udaipur"
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
              placeholder="e.g. 50000"
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
          </div>

          <div className="sticky bottom-0 px-5 py-4" style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}>
            <Button disabled={!detailsOk} onClick={() => setStep('preferences')}>
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 px-5 py-5 flex flex-col gap-6">
            <p className="body-font text-sm" style={{ color: c.slate }}>
              A few quick questions so the itinerary for {destination.trim() || 'your trip'} fits you. Everything here is optional.
            </p>

            <Question title="Who’s travelling?">
              {TRAVELLER_OPTIONS.map((o) => (
                <Chip key={o} label={o} selected={travellers === o} onClick={() => setTravellers(travellers === o ? null : o)} />
              ))}
            </Question>

            <div>
              <p className="body-font text-sm font-semibold mb-2" style={{ color: c.ink }}>
                What pace do you like?
              </p>
              <div className="flex flex-col gap-2">
                {PACE_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setPace(pace === o.key ? null : o.key)}
                    className="body-font text-left px-4 py-3 rounded-xl"
                    style={
                      pace === o.key
                        ? { background: c.deepSkyWash, border: `1px solid ${c.deepSky}`, color: c.ink }
                        : { background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }
                    }
                  >
                    <span className="block text-sm font-semibold">{o.key}</span>
                    <span className="block text-xs" style={{ color: c.slate }}>
                      {o.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Question title="What do you enjoy?" hint="pick any">
              {INTEREST_OPTIONS.map((o) => (
                <Chip key={o} label={o} selected={interests.includes(o)} onClick={() => toggleInterest(o)} />
              ))}
            </Question>

            <label className="block">
              <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
                Anything you must see or do?
                <span className="font-normal text-xs ml-1" style={{ color: c.slate }}>
                  — optional
                </span>
              </span>
              <textarea
                value={mustDo}
                maxLength={MAX_MUST_DO}
                rows={3}
                onChange={(e) => setMustDo(e.target.value)}
                placeholder="e.g. Sunrise at the Taj Mahal, a cooking class, no early mornings"
                className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none"
                style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
              />
              <span className="body-font text-[11px] block text-right" style={{ color: c.slate }}>
                {mustDo.length}/{MAX_MUST_DO}
              </span>
            </label>

            {error && <ErrorText>{error}</ErrorText>}
          </div>

          <div className="sticky bottom-0 px-5 py-4" style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}>
            <Button onClick={() => handleSubmit(false)}>Generate my itinerary</Button>
            <button
              onClick={() => handleSubmit(true)}
              className="body-font text-sm w-full text-center mt-3"
              style={{ color: c.slate }}
            >
              Skip the questions
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="body-font text-sm font-semibold mb-2" style={{ color: c.ink }}>
        {title}
        {hint && (
          <span className="font-normal text-xs ml-1" style={{ color: c.slate }}>
            — {hint}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
