import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ImagePlus, X } from 'lucide-react';
import { colors as c } from '../theme';
import { uploadItems } from '../data/wardrobe';
import { MAX_PIECES, validateImage } from '../lib/image';
import { useCategories } from '../lib/categories';
import { MAX_CATEGORY_LENGTH } from '../data/categories';
import { Button, Chip, ErrorText } from '../components/ui';

interface Draft {
  id: string;
  file: File;
  url: string;
  category: string | null;
}

export default function AddPiecesPage() {
  const navigate = useNavigate();
  const { categories, add } = useCategories();
  const [addingType, setAddingType] = useState(false);
  const [typeName, setTypeName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // Free the in-browser previews when leaving the page.
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;
  useEffect(() => () => draftsRef.current.forEach((d) => URL.revokeObjectURL(d.url)), []);

  const uncategorized = drafts.filter((d) => !d.category);
  const saving = progress !== null;
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    drafts.forEach((d) => d.category && m.set(d.category, (m.get(d.category) ?? 0) + 1));
    return m;
  }, [drafts]);

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const problems: string[] = [];
    const ok: File[] = [];
    for (const f of incoming) {
      const problem = validateImage(f);
      if (problem) problems.push(problem);
      else ok.push(f);
    }
    const room = MAX_PIECES - drafts.length;
    if (ok.length > room) problems.push(`You can add up to ${MAX_PIECES} pieces at a time.`);
    const added: Draft[] = ok.slice(0, room).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      category: null,
    }));
    setDrafts((cur) => [...cur, ...added]);
    // New photos start selected, so one tap on a type labels the whole batch.
    setSelected((cur) => new Set([...cur, ...added.map((d) => d.id)]));
    setError(problems.length ? problems.slice(0, 3).join(' ') : null);
  }

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyCategory(category: string) {
    setDrafts((cur) => cur.map((d) => (selected.has(d.id) ? { ...d, category } : d)));
    setSelected(new Set());
  }

  async function createType() {
    const raw = typeName;
    setTypeName('');
    setAddingType(false);
    if (!raw.trim()) return;
    try {
      const name = await add(raw);
      // A brand-new type goes straight onto whatever is selected.
      if (selected.size > 0) applyCategory(name);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t add that type.');
    }
  }

  function remove(id: string) {
    setDrafts((cur) => {
      const gone = cur.find((d) => d.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return cur.filter((d) => d.id !== id);
    });
    setSelected((cur) => {
      const next = new Set(cur);
      next.delete(id);
      return next;
    });
  }

  async function save() {
    if (uncategorized.length > 0) return;
    setError(null);
    setProgress({ done: 0, total: drafts.length });
    try {
      const result = await uploadItems(
        drafts.map((d) => ({ file: d.file, category: d.category as string })),
        (done, total) => setProgress({ done, total }),
      );
      if (result.failed.length === 0) {
        navigate('/wardrobe', { replace: true });
        return;
      }
      // Keep only the ones that failed so they can be retried.
      const failedIds = new Set(result.failed.map((i) => drafts[i].id));
      drafts.filter((d) => !failedIds.has(d.id)).forEach((d) => URL.revokeObjectURL(d.url));
      setDrafts((cur) => cur.filter((d) => failedIds.has(d.id)));
      setError(`${result.failed.length} didn’t upload (${result.message ?? 'unknown error'}). The rest were saved — try the remaining ones again.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t upload your pieces.');
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen flex flex-col">
      <header
        className="flex items-center px-4 py-4 sticky top-0 z-20"
        style={{ background: c.surface, borderBottom: `1px solid ${c.hairline}` }}
      >
        <button aria-label="Close" disabled={saving} onClick={() => navigate('/wardrobe')} className="p-1">
          <X size={20} color={c.ink} />
        </button>
        <h1 className="display text-lg flex-1 text-center pr-7" style={{ color: c.ink }}>
          Add pieces
        </h1>
      </header>

      <div className="flex-1 px-5 py-5">
        <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
          Add up to {MAX_PIECES} photos. Tell us what each one is — a top, trousers, a skirt, shoes — so they’re easy to find when you build outfits.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        <button
          type="button"
          disabled={drafts.length >= MAX_PIECES || saving}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`w-full rounded-2xl flex ${drafts.length ? 'py-4 flex-row gap-3' : 'py-10 flex-col gap-2'} items-center justify-center disabled:opacity-50`}
          style={{
            background: dragging ? c.deepSkyWash : c.surface,
            border: `1.5px dashed ${dragging ? c.deepSky : c.hairline}`,
          }}
        >
          <ImagePlus size={drafts.length ? 20 : 26} color={c.slate} />
          <span className="body-font text-sm font-semibold" style={{ color: c.ink }}>
            {drafts.length ? 'Add more photos' : 'Choose photos'}
          </span>
          {!drafts.length && (
            <span className="body-font text-xs" style={{ color: c.slate }}>
              or drag them here
            </span>
          )}
        </button>

        {drafts.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-5 mb-3">
              <p className="body-font text-sm" style={{ color: c.ink }}>
                <span className="font-semibold">{drafts.length - uncategorized.length}</span> of {drafts.length} sorted
              </p>
              <div className="flex gap-4">
                <button
                  className="body-font text-xs"
                  style={{ color: c.deepSky }}
                  onClick={() => setSelected(new Set(uncategorized.map((d) => d.id)))}
                >
                  Select unsorted
                </button>
                <button className="body-font text-xs" style={{ color: c.deepSky }} onClick={() => setSelected(new Set(drafts.map((d) => d.id)))}>
                  Select all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pb-48">
              {drafts.map((d) => {
                const on = selected.has(d.id);
                return (
                  <div
                    key={d.id}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    style={{ border: `2px solid ${on ? c.deepSky : c.hairline}` }}
                    onClick={() => toggle(d.id)}
                  >
                    <img src={d.url} alt={d.file.name} className="w-full h-full object-cover" />
                    <span
                      className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: on ? c.deepSky : c.surface, border: `1px solid ${on ? c.deepSky : c.hairline}` }}
                    >
                      {on && <Check size={12} color={c.surface} />}
                    </span>
                    <button
                      aria-label={`Remove ${d.file.name}`}
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(d.id);
                      }}
                      className="absolute top-1.5 right-1.5 rounded-full p-1"
                      style={{ background: c.surface }}
                    >
                      <X size={12} color={c.ink} />
                    </button>
                    <span
                      className="body-font absolute bottom-1.5 left-1.5 right-1.5 text-[11px] px-2 py-0.5 rounded-full text-center truncate"
                      style={d.category ? { background: c.surface, color: c.ink } : { background: c.amberWash, color: c.amberText }}
                    >
                      {d.category ?? 'Needs a type'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4">
            <ErrorText>{error}</ErrorText>
          </div>
        )}
      </div>

      {drafts.length > 0 && (
        <div className="sticky bottom-0 px-5 py-4 z-20" style={{ background: c.surface, borderTop: `1px solid ${c.hairline}` }}>
          <p className="body-font text-xs mb-2" style={{ color: c.slate }}>
            {selected.size > 0
              ? `${selected.size} selected — tap a type to apply it to all of them`
              : 'Tap photos to select them, then choose their type'}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={counts.get(cat) ? `${cat} · ${counts.get(cat)}` : cat}
                selected={false}
                onClick={() => selected.size > 0 && !saving && applyCategory(cat)}
              />
            ))}
            {addingType ? (
              <input
                autoFocus
                value={typeName}
                maxLength={MAX_CATEGORY_LENGTH + 1}
                onChange={(e) => setTypeName(e.target.value)}
                onBlur={createType}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createType();
                  if (e.key === 'Escape') {
                    setTypeName('');
                    setAddingType(false);
                  }
                }}
                placeholder="e.g. Sarees"
                className="body-font text-sm px-3.5 py-2 rounded-full outline-none w-36"
                style={{ background: c.surface, border: `1.5px solid ${c.deepSky}`, color: c.ink }}
              />
            ) : (
              <button
                onClick={() => setAddingType(true)}
                disabled={saving}
                className="body-font text-sm px-3.5 py-2 rounded-full flex items-center gap-1"
                style={{ border: `1px dashed ${c.hairline}`, color: c.slate }}
              >
                + New type
              </button>
            )}
          </div>
          <Button disabled={uncategorized.length > 0 || saving} onClick={save}>
            {saving
              ? `Uploading ${progress?.done} of ${progress?.total}…`
              : uncategorized.length > 0
                ? `${uncategorized.length} still need a type`
                : `Add ${drafts.length} ${drafts.length === 1 ? 'piece' : 'pieces'}`}
          </Button>
        </div>
      )}
    </div>
  );
}
