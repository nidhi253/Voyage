import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudRain } from 'lucide-react';
import { colors as c } from '../theme';
import { listNudges } from '../data/home';
import { titleCase } from '../lib/dates';
import type { Nudge } from '../types';
import { Badge, ErrorText, Spinner } from '../components/ui';

const STATUS_LABEL = { pending: 'New', accepted: 'Accepted', dismissed: 'Dismissed' } as const;

/** Every nudge regardless of status, so nothing is lost even without push notifications. */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const [nudges, setNudges] = useState<Nudge[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listNudges()
      .then(setNudges)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Couldn’t load notifications.');
        setNudges([]);
      });
  }, []);

  return (
    <div className="max-w-xl mx-auto min-h-screen">
      <header className="flex items-center px-4 py-4" style={{ background: c.surface, borderBottom: `1px solid ${c.hairline}` }}>
        <button aria-label="Back" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} color={c.ink} />
        </button>
        <h1 className="display text-lg flex-1 text-center pr-7" style={{ color: c.ink }}>
          Notifications
        </h1>
      </header>

      <div className="px-5 py-5">
        {error && <ErrorText>{error}</ErrorText>}
        {nudges === null ? (
          <Spinner />
        ) : nudges.length === 0 ? (
          <p className="body-font text-sm text-center py-12" style={{ color: c.slate }}>
            Nothing yet. We’ll let you know when the weather changes your plans.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {nudges.map((n) => (
              <Link
                key={n.id}
                to={`/trips/${n.trip_id}`}
                className="rounded-2xl p-4 block no-underline"
                style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <p className="body-font text-sm font-semibold flex items-center gap-1.5" style={{ color: c.ink }}>
                    <CloudRain size={14} color={c.slate} />
                    {n.trips?.destination ? titleCase(n.trips.destination) : 'Your trip'}
                  </p>
                  <Badge tone={n.status === 'pending' ? 'active' : 'neutral'}>{STATUS_LABEL[n.status]}</Badge>
                </div>
                <p className="body-font text-sm" style={{ color: c.slate }}>
                  {n.reason}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
