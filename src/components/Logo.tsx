import { colors as c } from '../theme';

// The Voyage route-pin mark. The tile keeps the brand blue in light and dark mode so the white route stays readable.
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Voyage" className="shrink-0">
      <rect width="64" height="64" rx="14" fill="#2B4C6F" />
      <circle cx="15" cy="48" r="3" fill="#fff" />
      <path
        d="M15 48 C24 18 38 56 48 20"
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="0.1 7"
      />
      <circle cx="48" cy="18" r="6.5" fill="#fff" />
      <circle cx="48" cy="18" r="2.5" fill="#2B4C6F" />
    </svg>
  );
}

/** Mark plus the wordmark, set in the same serif as the app's headings. */
export default function Logo({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="display leading-none" style={{ color: c.ink, fontSize: size * 0.8 }}>
        Voyage
      </span>
    </div>
  );
}
