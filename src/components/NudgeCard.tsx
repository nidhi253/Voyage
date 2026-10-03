import { useState } from 'react';
import { CloudRain, Shirt, Sparkles } from 'lucide-react';
import { colors as c } from '../theme';
import { acceptNudge, dismissNudge } from '../data/home';
import { titleCase } from '../lib/dates';
import type { Nudge } from '../types';
import { ErrorText } from './ui';

/** The one place the amber accent appears in the whole app. */
export default function NudgeCard({ nudge, location, onDone }: { nudge: Nudge; location: string; onDone: () => void }) {
  const [busy, setBusy] = useState<'accept' | 'dismiss' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(kind: 'accept' | 'dismiss') {
    setBusy(kind);
    setError(null);
    try {
      if (kind === 'accept') await acceptNudge(nudge);
      else await dismissNudge(nudge.id);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: c.amberWash }}>
      <div className="flex items-center gap-2 mb-2">
        <CloudRain size={16} color={c.amber} />
        <p className="body-font text-sm font-semibold" style={{ color: c.amberText }}>
          Weather shift in {titleCase(location)}
        </p>
      </div>
      <p className="body-font text-sm mb-3" style={{ color: c.ink, lineHeight: 1.5 }}>
        {nudge.reason}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {nudge.suggested_title && (
          <span className="body-font text-xs px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: c.surface, color: c.slate }}>
            <Sparkles size={12} color={c.amber} />
            Swap to: {nudge.suggested_title}
          </span>
        )}
        {nudge.suggested_outfit_note && (
          <span className="body-font text-xs px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ background: c.surface, color: c.slate }}>
            <Shirt size={12} color={c.amber} />
            {nudge.suggested_outfit_note}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          disabled={busy !== null}
          onClick={() => act('dismiss')}
          className="body-font text-sm flex-1 py-2.5 rounded-lg"
          style={{ background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` }}
        >
          {busy === 'dismiss' ? 'Dismissing…' : 'Dismiss'}
        </button>
        <button
          disabled={busy !== null}
          onClick={() => act('accept')}
          className="body-font text-sm font-semibold flex-1 py-2.5 rounded-lg"
          style={{ background: c.amber, color: '#14181F' }}
        >
          {busy === 'accept' ? 'Applying…' : 'Accept adjustment'}
        </button>
      </div>
      {error && (
        <div className="mt-2">
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </div>
  );
}
