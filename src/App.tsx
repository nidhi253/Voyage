import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { PREVIEW, exitPreview } from './dev/preview';
import { colors as c } from './theme';
import Login from './components/Login';
import AppShell from './components/AppShell';
import PlaceholderPage from './pages/PlaceholderPage';
import TripsPage from './pages/TripsPage';
import NewTripPage from './pages/NewTripPage';
import TripDetailPage from './pages/TripDetailPage';
import { Button } from './components/ui';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (PREVIEW) {
      setLoading(false);
      return;
    }
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
      <div className="body-font min-h-screen flex items-center justify-center" style={{ background: c.bg, color: c.slate }}>
        Loading…
      </div>
    );
  }

  if (!session && !PREVIEW) return <Login />;

  return (
    <>
    {PREVIEW && (
      <div
        className="no-print body-font fixed bottom-20 md:bottom-4 right-4 z-50 text-xs px-3 py-2 rounded-full flex items-center gap-2"
        style={{ background: c.ink, color: c.surface }}
      >
        Preview mode · fake data
        <button onClick={exitPreview} className="underline">
          Exit
        </button>
      </div>
    )}
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PlaceholderPage title="Hey there" />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/new" element={<NewTripPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="wardrobe" element={<PlaceholderPage title="Wardrobe" />} />
        <Route
          path="profile"
          element={
            <PlaceholderPage title="Profile">
              <div className="max-w-xs">
                <Button variant="outline" onClick={() => supabase.auth.signOut()} style={{ color: c.red }}>
                  Log out
                </Button>
              </div>
            </PlaceholderPage>
          }
        />
        <Route path="*" element={<PlaceholderPage title="Not found" />} />
      </Route>
    </Routes>
    </>
  );
}
