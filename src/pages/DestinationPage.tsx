import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Clock, MapPin, Plus, Sun } from 'lucide-react';
import { colors as c } from '../theme';
import { getDestination } from '../data/home';
import { getMyProfile } from '../data/profile';
import type { Destination } from '../types';
import { Button, ErrorText, Spinner } from '../components/ui';
import DestImage from '../components/DestImage';
import AddToTripSheet from '../components/AddToTripSheet';

export default function DestinationPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [dest, setDest] = useState<Destination | null>(null);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    getDestination(id).then(setDest).catch((e) => setError(e instanceof Error ? e.message : 'Couldn’t load this destination.'));
    getMyProfile().then((p) => setUserTags(p?.tags ?? [])).catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="px-5 py-10 max-w-xl mx-auto">
        <ErrorText>{error}</ErrorText>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }
  if (!dest) return <Spinner />;

  const matching = dest.tags.filter((t) => userTags.includes(t));
  const vibe = (matching.length ? matching : dest.tags).join(', ');

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="relative">
        <DestImage url={dest.image_url} name={dest.name} className="w-full h-56 md:h-72 md:rounded-b-3xl" />
        <div className="absolute inset-0 md:rounded-b-3xl" style={{ background: 'linear-gradient(to top, rgba(20,24,31,0.65), rgba(20,24,31,0) 55%)' }} />
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 rounded-full p-2"
          style={{ background: 'rgba(20,24,31,0.55)' }}
        >
          <ArrowLeft size={18} color="#fff" />
        </button>
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="display text-3xl">{dest.name}</h1>
          <p className="body-font text-sm flex items-center gap-1 opacity-90">
            <MapPin size={13} /> {dest.country}
          </p>
        </div>
      </div>

      <div className="px-5 pt-5">
        {dest.full_description && (
          <p className="body-font text-sm mb-5" style={{ color: c.ink, lineHeight: 1.6 }}>
            {dest.full_description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoCard icon={<Clock size={16} color={c.deepSky} />} label="Best time to visit" value={dest.best_time_to_visit ?? '—'} />
          <InfoCard icon={<Sun size={16} color={c.deepSky} />} label="Vibe" value={vibe || '—'} />
        </div>

        {dest.highlights.length > 0 && (
          <>
            <h2 className="display text-lg mb-2.5" style={{ color: c.ink }}>Highlights</h2>
            <ul className="flex flex-col gap-2 mb-7">
              {dest.highlights.map((h) => (
                <li key={h} className="body-font text-sm flex items-center gap-2.5" style={{ color: c.ink }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.deepSky }} />
                  {h}
                </li>
              ))}
            </ul>
          </>
        )}

        <Button onClick={() => setSheetOpen(true)}>
          <Plus size={16} /> Add this to my trip
        </Button>
        <Link
          to={`/trips/new?destination=${encodeURIComponent(dest.name)}`}
          className="body-font text-sm font-semibold mt-4 flex items-center justify-center gap-1 no-underline"
          style={{ color: c.deepSky }}
        >
          Plan a new trip here <ChevronRight size={15} />
        </Link>
      </div>

      {dest.image_credit && (
        <p className="body-font text-[11px] px-5 mt-6" style={{ color: c.slate }}>
          Photo: {dest.image_credit}
          {dest.image_source_url && (
            <>
              {' '}·{' '}
              <a href={dest.image_source_url} target="_blank" rel="noreferrer" className="underline">
                Wikimedia Commons
              </a>
            </>
          )}
        </p>
      )}

      <AddToTripSheet open={sheetOpen} destination={dest} onClose={() => setSheetOpen(false)} />
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
      <div className="mb-2">{icon}</div>
      <p className="body-font text-xs mb-0.5" style={{ color: c.slate }}>{label}</p>
      <p className="body-font text-sm font-semibold" style={{ color: c.ink }}>{value}</p>
    </div>
  );
}
