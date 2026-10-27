import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, MapPin, Shirt, User } from 'lucide-react';
import Logo from './Logo';
import { colors as c } from '../theme';

const tabs = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/trips', label: 'Trips', Icon: MapPin, end: false },
  { to: '/wardrobe', label: 'Wardrobe', Icon: Shirt, end: false },
  { to: '/profile', label: 'Profile', Icon: User, end: false },
];

// Sub-pages (new trip, trip detail, destination detail) take over the screen on phones.
function isSubPage(path: string) {
  return /^\/trips\/.+/.test(path) || /^\/destinations\/.+/.test(path) || path === '/wardrobe/add' || path === '/notifications';
}

export default function AppShell() {
  const { pathname } = useLocation();
  const hideBottomNav = isSubPage(pathname);

  return (
    <div className="body-font min-h-screen md:flex" style={{ background: c.bg }}>
      {/* Desktop side nav */}
      <aside
        className="no-print hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 px-4 py-6"
        style={{ background: c.surface, borderRight: `1px solid ${c.hairline}` }}
      >
        <Logo size={32} className="px-3 mb-8" />
        <nav className="flex flex-col gap-1">
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
              style={({ isActive }) => ({
                background: isActive ? c.deepSkyWash : 'transparent',
                color: isActive ? c.deepSky : c.slate,
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={`flex-1 min-w-0 ${hideBottomNav ? '' : 'pb-20'} md:pb-0`}>
        <Outlet />
      </main>

      {/* Phone bottom nav */}
      {!hideBottomNav && (
        <nav
          className="no-print md:hidden fixed bottom-0 inset-x-0 flex justify-around items-center py-2.5 z-10"
          style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}
        >
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="flex flex-col items-center gap-1 py-1">
              {({ isActive }) => (
                <>
                  <Icon size={20} color={isActive ? c.deepSky : c.slate} strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className="text-[10px]" style={{ color: isActive ? c.deepSky : c.slate }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
