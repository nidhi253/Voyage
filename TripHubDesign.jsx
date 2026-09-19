import { useState } from 'react';
import {
  MapPin, ListChecks, Shirt, User, Sun, CloudRain, ChevronDown,
  ChevronRight, Plus, Bell, Check, X, Sparkles
} from 'lucide-react';

const c = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#14181F',
  slate: '#5B6472',
  hairline: '#E2E5E9',
  amber: '#E2A63B',
  amberWash: '#FBF1DE',
  deepSky: '#2B4C6F',
};

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    .display { font-family: 'Fraunces', serif; }
    .body-font { font-family: 'Plus Jakarta Sans', sans-serif; }
  `}</style>
);

function Badge({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` },
    active: { background: `${c.deepSky}15`, color: c.deepSky },
  };
  return (
    <span
      className="body-font text-xs px-2.5 py-1 rounded-full"
      style={styles[tone]}
    >
      {children}
    </span>
  );
}

function NavIcon({ Icon, active, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-1" aria-label={label}>
      <Icon size={20} color={active ? c.deepSky : c.slate} strokeWidth={active ? 2.25 : 1.75} />
      <span className="body-font text-[10px]" style={{ color: active ? c.deepSky : c.slate }}>
        {label}
      </span>
    </button>
  );
}

function PhoneShell({ children, screen, setScreen }) {
  const tabs = [
    { key: 'home', label: 'Home', Icon: Sun },
    { key: 'trips', label: 'Trips', Icon: MapPin },
    { key: 'wardrobe', label: 'Wardrobe', Icon: Shirt },
    { key: 'profile', label: 'Profile', Icon: User },
  ];
  return (
    <div
      className="w-[360px] mx-auto rounded-[28px] overflow-hidden flex flex-col"
      style={{ background: c.bg, border: `1px solid ${c.hairline}`, height: 700 }}
    >
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">{children}</div>
      <div
        className="flex justify-around items-center py-2.5"
        style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}
      >
        {tabs.map(({ key, label, Icon }) => (
          <NavIcon key={key} Icon={Icon} label={label} active={screen === key} onClick={() => setScreen(key)} />
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="body-font text-xs font-semibold tracking-wide uppercase mb-2.5" style={{ color: c.slate }}>
      {children}
    </p>
  );
}

function OnboardingScreen() {
  const [step, setStep] = useState('phone');
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <p className="display text-3xl mt-6 mb-2" style={{ color: c.ink }}>
          {step === 'phone' ? 'Where to,\nfirst?' : 'What\u2019s your\ntravel style?'}
        </p>
        <p className="body-font text-sm mb-8" style={{ color: c.slate }}>
          {step === 'phone'
            ? 'No email needed \u2014 just your number.'
            : 'Pick what fits. You can change this anytime.'}
        </p>
      </div>
      {step === 'phone' ? (
        <div className="flex flex-col gap-3">
          <input
            className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
            style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            placeholder="+91 00000 00000"
          />
          <button
            onClick={() => setStep('persona')}
            className="body-font font-semibold w-full py-3.5 rounded-xl text-sm"
            style={{ background: c.ink, color: c.surface }}
          >
            Send code
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            {['Adventurous', 'Chill', 'Pilgrimage', 'Family'].map((p, i) => (
              <button
                key={p}
                className="body-font text-sm py-3 rounded-xl"
                style={
                  i === 0
                    ? { background: c.ink, color: c.surface }
                    : { background: c.surface, color: c.ink, border: `1px solid ${c.hairline}` }
                }
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="body-font font-semibold w-full py-3.5 rounded-xl text-sm mt-2"
            style={{ background: c.ink, color: c.surface }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function NudgeCard() {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: c.amberWash }}>
      <div className="flex items-center gap-2 mb-2">
        <CloudRain size={16} color={c.amber} />
        <p className="body-font text-sm font-semibold" style={{ color: '#8A5A1E' }}>
          Rain from 2pm today
        </p>
      </div>
      <p className="body-font text-sm mb-3" style={{ color: c.ink, lineHeight: 1.5 }}>
        Your 3pm rice terrace walk is outdoors. Swap it for the museum you saved, and bring a light layer.
      </p>
      <div
        className="body-font text-xs px-3 py-2 rounded-lg mb-3 flex items-center gap-1.5"
        style={{ background: c.surface, color: c.slate }}
      >
        <Sparkles size={12} color={c.amber} />
        Ubud art museum \u2014 a local favorite
      </div>
      <div className="flex gap-2">
        <button
          className="body-font text-xs font-semibold flex-1 py-2.5 rounded-lg"
          style={{ background: c.ink, color: c.surface }}
        >
          Swap it
        </button>
        <button
          className="body-font text-xs flex-1 py-2.5 rounded-lg"
          style={{ background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` }}
        >
          Keep as is
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ homeState, setHomeState }) {
  const states = ['explore', 'planning', 'today'];
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="display text-2xl" style={{ color: c.ink }}>
          {homeState === 'today' ? 'Today in Bali' : 'Hey there'}
        </p>
        <Bell size={18} color={c.ink} />
      </div>

      <div className="flex gap-1.5 mb-5">
        {states.map((s) => (
          <button
            key={s}
            onClick={() => setHomeState(s)}
            className="body-font text-[11px] px-2.5 py-1 rounded-full capitalize"
            style={
              homeState === s
                ? { background: c.deepSky, color: c.surface }
                : { background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` }
            }
          >
            {s === 'planning' ? 'mid-planning' : s}
          </button>
        ))}
      </div>

      {homeState === 'explore' && (
        <>
          <SectionLabel>Picked for you</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['Bali', 'Kyoto'].map((d) => (
              <div key={d} className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
                <p className="display text-lg" style={{ color: c.ink }}>{d}</p>
                <p className="body-font text-xs mt-1" style={{ color: c.slate }}>Adventurous pick</p>
              </div>
            ))}
          </div>
          <SectionLabel>Coming up nearby</SectionLabel>
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-sm" style={{ color: c.ink }}>Nyepi festival \u2014 Bali, in 6 weeks</p>
          </div>
        </>
      )}

      {homeState === 'planning' && (
        <div className="rounded-2xl p-5" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
          <p className="display text-lg mb-1" style={{ color: c.ink }}>Bali is half-planned</p>
          <p className="body-font text-sm mb-4" style={{ color: c.slate }}>4 days set, 2 to go.</p>
          <button className="body-font text-sm font-semibold py-2.5 px-4 rounded-lg" style={{ background: c.ink, color: c.surface }}>
            Continue planning
          </button>
        </div>
      )}

      {homeState === 'today' && (
        <>
          <NudgeCard />
          <SectionLabel>Today \u00b7 Jun 12</SectionLabel>
          <div className="rounded-2xl p-4 mb-3" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-sm" style={{ color: c.ink }}>10:00 \u2014 Ubud art museum</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-sm" style={{ color: c.ink }}>Outfit \u2014 light layer added</p>
          </div>
        </>
      )}
    </div>
  );
}

function TripsScreen() {
  const trips = [
    { name: 'Bali', dates: 'Jun 10 \u2013 Jun 16', status: 'Active' },
    { name: 'Kyoto', dates: 'Sep 3 \u2013 Sep 9', status: 'Planning' },
    { name: 'Lisbon', dates: 'Mar 2 \u2013 Mar 8', status: 'Completed' },
  ];
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="display text-2xl" style={{ color: c.ink }}>Your trips</p>
        <button style={{ background: c.ink }} className="rounded-full p-1.5">
          <Plus size={16} color={c.surface} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {trips.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl p-4 flex justify-between items-center"
            style={{ background: c.surface, border: `1px solid ${c.hairline}`, opacity: t.status === 'Completed' ? 0.55 : 1 }}
          >
            <div>
              <p className="display text-lg" style={{ color: c.ink }}>{t.name}</p>
              <p className="body-font text-xs mt-0.5" style={{ color: c.slate }}>{t.dates}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={t.status === 'Active' ? 'active' : 'neutral'}>{t.status}</Badge>
              <ChevronRight size={16} color={c.slate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WardrobeScreen() {
  const outfits = ['Beach day', 'Temple visit', 'Evening out'];
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="display text-2xl" style={{ color: c.ink }}>Wardrobe</p>
        <button style={{ background: c.ink }} className="rounded-full p-1.5">
          <Plus size={16} color={c.surface} />
        </button>
      </div>
      <SectionLabel>Saved outfits</SectionLabel>
      <div className="flex flex-col gap-3 mb-6">
        {outfits.map((o) => (
          <div key={o} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-9 h-9 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.hairline}` }} />
              ))}
            </div>
            <p className="body-font text-sm" style={{ color: c.ink }}>{o}</p>
          </div>
        ))}
      </div>
      <SectionLabel>By category</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5">
        {['Casual', 'Beachwear', 'Evening'].map((cat) => (
          <div key={cat} className="rounded-xl aspect-square flex items-end p-2" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
            <p className="body-font text-[11px]" style={{ color: c.slate }}>{cat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div>
      <p className="display text-2xl mb-5" style={{ color: c.ink }}>Profile</p>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full" style={{ background: c.deepSky }} />
        <div>
          <p className="body-font text-base font-semibold" style={{ color: c.ink }}>Aanya</p>
          <p className="body-font text-xs" style={{ color: c.slate }}>Age 26</p>
        </div>
      </div>
      <SectionLabel>Travel tags</SectionLabel>
      <div className="flex flex-wrap gap-2 mb-6">
        {['#adventurous', '#foodie', '#solo traveler'].map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <SectionLabel>Preferences</SectionLabel>
      <div className="rounded-2xl divide-y" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        {['Dark mode', 'Notifications'].map((row) => (
          <div key={row} className="flex justify-between items-center px-4 py-3.5" style={{ borderColor: c.hairline }}>
            <p className="body-font text-sm" style={{ color: c.ink }}>{row}</p>
            <ChevronRight size={16} color={c.slate} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripHubDesign() {
  const [screen, setScreen] = useState('home');
  const [homeState, setHomeState] = useState('today');

  const screens = {
    home: <HomeScreen homeState={homeState} setHomeState={setHomeState} />,
    trips: <TripsScreen />,
    wardrobe: <WardrobeScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div className="body-font min-h-screen flex flex-col items-center justify-center gap-6 py-10" style={{ background: '#EDEEF1' }}>
      <Fonts />
      <PhoneShell screen={screen} setScreen={setScreen}>
        {screen === 'home' ? screens.home : screens[screen]}
      </PhoneShell>
      <p className="body-font text-xs" style={{ color: c.slate }}>
        Onboarding preview below
      </p>
      <PhoneShell screen="home" setScreen={() => {}}>
        <OnboardingScreen />
      </PhoneShell>
    </div>
  );
}
