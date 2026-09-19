import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { colors as c } from './theme';
import Login from './components/Login';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        className="body-font min-h-screen flex items-center justify-center"
        style={{ background: c.bg, color: c.slate }}
      >
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div
      className="body-font min-h-screen flex flex-col items-center justify-center gap-4 px-5"
      style={{ background: c.bg }}
    >
      <p className="display text-2xl" style={{ color: c.ink }}>
        You're in.
      </p>
      <p className="body-font text-sm" style={{ color: c.slate }}>
        Signed in as {session.user.email}
      </p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="body-font text-sm font-semibold py-2.5 px-5 rounded-xl"
        style={{ background: c.ink, color: c.surface }}
      >
        Log out
      </button>
    </div>
  );
}
