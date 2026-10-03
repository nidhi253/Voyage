import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Dialog, CircularProgress } from '@mui/material';
import { colors as c } from '../theme';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
  full?: boolean;
};

export function Button({ variant = 'primary', full = true, disabled, className = '', style, ...rest }: ButtonProps) {
  const base =
    variant === 'primary'
      ? { background: disabled ? c.disabled : c.ink, color: c.surface, border: '1px solid transparent' }
      : { background: c.surface, color: c.ink, border: `1px solid ${c.hairline}` };
  return (
    <button
      disabled={disabled}
      className={`body-font font-semibold py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 ${full ? 'w-full' : ''} ${className}`}
      style={{ ...base, ...style }}
      {...rest}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: boolean }) {
  return (
    <label className="block">
      <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
        {label}
        {hint && (
          <span className="font-normal text-xs ml-1" style={{ color: c.slate }}>
            — {hint}
          </span>
        )}
      </span>
      <input
        className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
        style={{ background: c.surface, border: `1px solid ${error ? c.red : c.hairline}`, color: c.ink }}
        {...rest}
      />
    </label>
  );
}

export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="body-font text-sm px-3.5 py-2 rounded-full flex items-center gap-1.5"
      style={
        selected
          ? { background: c.deepSkyWash, color: c.deepSky, border: `1px solid ${c.deepSkyWash}` }
          : { background: c.surface, color: c.ink, border: `1px solid ${c.hairline}` }
      }
    >
      {selected && <Check size={14} />}
      {label}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'active' }) {
  const styles =
    tone === 'active'
      ? { background: c.deepSkyWash, color: c.deepSky }
      : { background: c.surface, color: c.slate, border: `1px solid ${c.hairline}` };
  return (
    <span className="body-font text-xs px-2.5 py-1 rounded-full" style={styles}>
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="body-font text-xs font-semibold tracking-wide uppercase mb-2.5" style={{ color: c.slate }}>
      {children}
    </p>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <CircularProgress size={28} sx={{ color: c.deepSky }} />
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="body-font text-xs" style={{ color: c.red }}>
      {children}
    </p>
  );
}

/** The one confirm/cancel pattern reused for every edit and delete. */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} PaperProps={{ sx: { borderRadius: '20px', m: 2, width: 360, maxWidth: '100%' } }}>
      <div className="p-5">
        <p className="display text-xl mb-1.5" style={{ color: c.ink }}>
          {title}
        </p>
        {body && (
          <p className="body-font text-sm mb-5" style={{ color: c.slate }}>
            {body}
          </p>
        )}
        <div className="flex gap-2.5 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="body-font font-semibold py-3.5 px-5 rounded-xl text-sm w-full"
            style={{ background: danger ? c.red : c.ink, color: c.surface, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
