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
import WardrobePage from './pages/WardrobePage';
import AddPiecesPage from './pages/AddPiecesPage';
import HomePage from './pages/HomePage';
import DestinationPage from './pages/DestinationPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import { CategoriesProvider } from './lib/categories';
import { getMyProfile } from './data/profile';
import { useThemeMode } from './lib/themeMode';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setMode } = useThemeMode();

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

  // Once signed in, the saved dark-mode choice on the profile wins over the local one.
  const signedIn = !!session || PREVIEW;
  useEffect(() => {
    if (!signedIn) return;
    getMyProfile()
      .then((p) => p && setMode(p.dark_mode ? 'dark' : 'light'))
      .catch(() => {});
  }, [signedIn, setMode]);

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
        <Route index element={<HomePage />} />
        <Route path="destinations/:id" element={<DestinationPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/new" element={<NewTripPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="wardrobe" element={<CategoriesProvider />}>
          <Route index element={<WardrobePage />} />
          <Route path="add" element={<AddPiecesPage />} />
        </Route>
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<PlaceholderPage title="Not found" />} />
      </Route>
    </Routes>
    </>
  );
}
