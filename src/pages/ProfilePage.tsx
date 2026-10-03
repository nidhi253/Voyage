import { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Moon, Pencil, Plus, User, X } from 'lucide-react';
import { Switch } from '@mui/material';
import { colors as c } from '../theme';
import { supabase } from '../lib/supabase';
import { PREVIEW, exitPreview } from '../dev/preview';
import { useThemeMode } from '../lib/themeMode';
import { getMyProfile, updateMyProfile, type ProfilePatch } from '../data/profile';
import type { Profile } from '../types';
import { ErrorText, SectionLabel, Spinner } from '../components/ui';

const NOTIF_KEY = 'voyage-notifications-ui';
const MAX_TAG = 24;

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: c.teal },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: c.teal },
};

/** Click the pencil, edit in place; Enter or clicking away saves, Escape cancels. */
function InlineEdit({
  display,
  placeholder,
  initial,
  inputMode,
  maxLength,
  label,
  onSave,
  className = '',
  textStyle,
}: {
  display: string;
  placeholder: string;
  initial: string;
  inputMode?: 'numeric';
  maxLength: number;
  label: string;
  onSave: (value: string) => void;
  className?: string;
  textStyle?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (value.trim() !== initial) onSave(value.trim());
  }

  if (editing) {
    return (
      <input
        ref={ref}
        aria-label={label}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setValue(inputMode === 'numeric' ? e.target.value.replace(/\D/g, '') : e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setValue(initial);
            setEditing(false);
          }
        }}
        className={`body-font px-2 py-1 rounded-lg outline-none w-full ${className}`}
        style={{ background: c.surface, border: `1.5px solid ${c.deepSky}`, color: c.ink }}
      />
    );
  }
  return (
    <button
      aria-label={`Edit ${label}`}
      onClick={() => {
        setValue(initial);
        setEditing(true);
      }}
      className={`flex items-center gap-2 text-left ${className}`}
    >
      <span style={textStyle}>{display}</span>
      <Pencil size={13} color={c.slate} />
    </button>
  );
}

export default function ProfilePage() {
  const { mode, setMode } = useThemeMode();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [notifications, setNotifications] = useState(() => {
    try {
      return localStorage.getItem(NOTIF_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    getMyProfile()
      .then((p) => setProfile(p ?? { id: '', name: null, age: null, tags: [], dark_mode: false }))
      .catch((e) => setError(e instanceof Error ? e.message : 'Couldn’t load your profile.'));
  }, []);

  /** Updates the screen immediately, saves in the background, and rolls back if the save fails. */
  async function save(patch: ProfilePatch) {
    if (!profile) return;
    const before = profile;
    setProfile({ ...profile, ...patch });
    setError(null);
    try {
      await updateMyProfile(patch);
    } catch (e) {
      setProfile(before);
      if ('dark_mode' in patch) setMode(before.dark_mode ? 'dark' : 'light');
      setError(e instanceof Error ? e.message : 'Couldn’t save that.');
    }
  }

  function saveAge(raw: string) {
    if (raw === '') return save({ age: null });
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      setError('Enter an age between 1 and 120.');
      return;
    }
    save({ age: n });
  }

  function addTag() {
    const tag = newTag.replace(/^#+/, '').trim().slice(0, MAX_TAG);
    setNewTag('');
    setAdding(false);
    if (!tag || !profile) return;
    if (profile.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    save({ tags: [...profile.tags, tag] });
  }

  function toggleDark(on: boolean) {
    setMode(on ? 'dark' : 'light');
    save({ dark_mode: on });
  }

  function toggleNotifications(on: boolean) {
    setNotifications(on);
    try {
      localStorage.setItem(NOTIF_KEY, on ? '1' : '0');
    } catch {
      /* UI-only for now */
    }
  }

  async function logOut() {
    if (PREVIEW) return exitPreview();
    await supabase.auth.signOut();
  }

  if (!profile) {
    return (
      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <h1 className="display text-2xl md:text-3xl mb-5" style={{ color: c.ink }}>Profile</h1>
        {error ? <ErrorText>{error}</ErrorText> : <Spinner />}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
      <h1 className="display text-2xl md:text-3xl mb-5" style={{ color: c.ink }}>Profile</h1>

      {error && (
        <div className="mb-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      <div className="rounded-2xl p-4 flex items-center gap-4 mb-6" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: c.cream }}>
          <User size={24} color={c.slate} />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <InlineEdit
            label="name"
            display={profile.name || 'Add your name'}
            placeholder="Your name"
            initial={profile.name ?? ''}
            maxLength={60}
            onSave={(v) => save({ name: v || null })}
            className="display text-xl"
            textStyle={{ color: profile.name ? c.ink : c.slate }}
          />
          <InlineEdit
            label="age"
            display={profile.age ? `${profile.age} years old` : 'Add your age'}
            placeholder="Age"
            initial={profile.age ? String(profile.age) : ''}
            inputMode="numeric"
            maxLength={3}
            onSave={saveAge}
            className="text-sm"
            textStyle={{ color: c.slate }}
          />
        </div>
      </div>

      <SectionLabel>Travel tags</SectionLabel>
      <div className="rounded-2xl p-4 flex flex-wrap gap-2 mb-6" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        {profile.tags.map((t) => (
          <span key={t} className="body-font text-sm pl-3.5 pr-2 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: c.cream, color: c.ink }}>
            {t}
            <button aria-label={`Remove ${t}`} onClick={() => save({ tags: profile.tags.filter((x) => x !== t) })}>
              <X size={13} color={c.slate} />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            value={newTag}
            maxLength={MAX_TAG + 1}
            onChange={(e) => setNewTag(e.target.value)}
            onBlur={addTag}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTag();
              if (e.key === 'Escape') {
                setNewTag('');
                setAdding(false);
              }
            }}
            placeholder="#hashtag"
            className="body-font text-sm px-3.5 py-1.5 rounded-full outline-none w-36"
            style={{ background: c.surface, border: `1.5px solid ${c.deepSky}`, color: c.ink }}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="body-font text-sm px-3.5 py-1.5 rounded-full flex items-center gap-1"
            style={{ border: `1px solid ${c.hairline}`, color: c.slate }}
          >
            <Plus size={13} /> Add
          </button>
        )}
      </div>

      <SectionLabel>Preferences</SectionLabel>
      <div className="rounded-2xl mb-2" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        <Row icon={<Moon size={18} color={c.ink} />} label="Dark mode">
          <Switch checked={mode === 'dark'} onChange={(e) => toggleDark(e.target.checked)} inputProps={{ 'aria-label': 'Dark mode' }} sx={switchSx} />
        </Row>
        <div style={{ borderTop: `1px solid ${c.hairline}` }} />
        <Row icon={<Bell size={18} color={c.ink} />} label="Notifications">
          <Switch checked={notifications} onChange={(e) => toggleNotifications(e.target.checked)} inputProps={{ 'aria-label': 'Notifications' }} sx={switchSx} />
        </Row>
      </div>
      <p className="body-font text-xs mb-6" style={{ color: c.slate }}>
        Push delivery isn’t switched on yet — weather nudges still appear under the bell on Home.
      </p>

      <SectionLabel>Account</SectionLabel>
      <button
        onClick={logOut}
        className="body-font font-semibold text-sm w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
        style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.red }}
      >
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="body-font text-sm flex items-center gap-3" style={{ color: c.ink }}>
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}
