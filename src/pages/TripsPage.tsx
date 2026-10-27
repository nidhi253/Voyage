import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { colors as c } from '../theme';
import { deleteTrip, listTrips } from '../data/trips';
import { listDestinations } from '../data/home';
import { effectiveStatus } from '../lib/tripStatus';
import { formatRange, titleCase } from '../lib/dates';
import type { Destination, Trip, TripStatus } from '../types';
import { Badge, Button, ConfirmModal, ErrorText, Spinner } from '../components/ui';
import DestImage from '../components/DestImage';

const STATUS_LABEL: Record<TripStatus, string> = {
  planning: 'Planning',
  ready: 'Ready',
  active: 'Active',
  completed: 'Completed',
};

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [covers, setCovers] = useState<Map<string, Destination>>(new Map());

  const load = useCallback(async () => {
    try {
      setTrips(await listTrips());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t load your trips.');
      setTrips([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cover photos come from the matching destination (by name); trips to unlisted places get a soft placeholder.
  useEffect(() => {
    listDestinations()
      .then((all) => setCovers(new Map(all.map((d) => [d.name.toLowerCase(), d]))))
      .catch(() => {});
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteTrip(toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t delete that trip.');
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-5 pt-6 pb-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="display text-2xl md:text-3xl" style={{ color: c.ink }}>
          Your trips
        </h1>
        <button
          aria-label="New trip"
          onClick={() => navigate('/trips/new')}
          className="rounded-full p-2"
          style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
        >
          <Plus size={18} color={c.ink} />
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      {trips === null ? (
        <Spinner />
      ) : trips.length === 0 ? (
        <div className="text-center py-16">
          <p className="display text-xl mb-1.5" style={{ color: c.ink }}>
            No trips yet
          </p>
          <p className="body-font text-sm mb-5" style={{ color: c.slate }}>
            Start one and we’ll draft the itinerary for you.
          </p>
          <div className="max-w-xs mx-auto">
            <Button onClick={() => navigate('/trips/new')}>Plan a trip</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {trips.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-4"
              style={{
                background: c.surface,
                border: `1px solid ${c.hairline}`,
                opacity: effectiveStatus(t) === 'completed' ? 0.55 : 1,
              }}
            >
              <Link to={`/trips/${t.id}`} className="block no-underline">
                <div className="flex items-start gap-3">
                  <DestImage
                    url={covers.get(t.destination.trim().toLowerCase())?.image_url}
                    name={titleCase(t.destination)}
                    className="w-14 h-14 rounded-xl shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="display text-lg truncate" style={{ color: c.ink }}>
                      {titleCase(t.destination)}
                    </p>
                    {t.second_destination && (
                      <p className="body-font text-xs mt-0.5" style={{ color: c.slate }}>
                        +{t.second_destination}
                      </p>
                    )}
                    <p className="body-font text-xs mt-1.5 flex items-center gap-1.5" style={{ color: c.slate }}>
                      <Calendar size={12} />
                      {formatRange(t.start_date, t.end_date)}
                    </p>
                  </div>
                  <Badge tone={effectiveStatus(t) === 'active' ? 'active' : 'neutral'}>{STATUS_LABEL[effectiveStatus(t)]}</Badge>
                </div>
              </Link>
              <button
                onClick={() => setToDelete(t)}
                className="body-font text-xs mt-3"
                style={{ color: c.red }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete this trip?"
        body={toDelete ? `“${titleCase(toDelete.destination)}” and its itinerary will be removed. This can’t be undone.` : undefined}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
