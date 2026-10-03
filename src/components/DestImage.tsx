
const TONES = ['#C9D6E3', '#CFE3DD', '#D9D2E9', '#E3D3CB', '#D3DFC9'];

/** Shows the photo, or a soft placeholder block until real image URLs are in the database. */
export default function DestImage({
  url,
  name,
  className = '',
}: {
  url?: string | null;
  name: string;
  className?: string;
}) {
  if (url) return <img src={url} alt={name} className={`object-cover ${className}`} />;
  const tone = TONES[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length];
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: tone }}>
      <span className="display text-2xl" style={{ color: "#14181F", opacity: 0.55 }}>
        {name.slice(0, 1)}
      </span>
    </div>
  );
}
