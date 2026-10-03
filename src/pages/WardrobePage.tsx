import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings2, Shirt, Sparkles, Trash2, X } from 'lucide-react';
import { Dialog } from '@mui/material';
import { colors as c } from '../theme';
import {
  createOutfit,
  deleteItem,
  deleteOutfit,
  listItems,
  listOutfits,
  suggestOutfits,
  updateItemCategory,
  updateOutfit,
} from '../data/wardrobe';
import { MAX_OCCASIONS, OCCASION_SUGGESTIONS } from '../types';
import { useCategories } from '../lib/categories';
import { aiSuggestions } from '../lib/features';
import ManageCategories from '../components/ManageCategories';
import type { OutfitSuggestion, OutfitWithItems, WardrobeItem } from '../types';
import { Button, Chip, ConfirmModal, ErrorText, SectionLabel, Spinner } from '../components/ui';

type Pending =
  | { kind: 'item'; item: WardrobeItem }
  | { kind: 'outfit'; outfit: OutfitWithItems };

type Tab = 'pieces' | 'outfits';

/** Outfits that would have no pieces left if this piece were deleted. */
function outfitsEmptiedBy(item: WardrobeItem, outfits: OutfitWithItems[]) {
  return outfits.filter((o) => o.itemIds.length > 0 && o.itemIds.every((id) => id === item.id));
}

function pieceDeleteWarning(item: WardrobeItem | null, outfits: OutfitWithItems[]): string {
  if (!item) return '';
  const usedIn = outfits.filter((o) => o.itemIds.includes(item.id));
  if (usedIn.length === 0) return 'It will be removed from your wardrobe.';
  const emptied = outfitsEmptiedBy(item, outfits);
  let text = `It’s part of ${usedIn.length} ${usedIn.length === 1 ? 'outfit' : 'outfits'} and will be taken out of ${usedIn.length === 1 ? 'it' : 'them'}.`;
  if (emptied.length > 0) {
    text += ` ${emptied.length === 1 ? 'One outfit' : `${emptied.length} outfits`} (${emptied.map((o) => `“${o.name}”`).join(', ')}) would be left with no pieces, so ${emptied.length === 1 ? 'it' : 'they'} will be removed too, along with any trip days using ${emptied.length === 1 ? 'it' : 'them'}.`;
  }
  return text;
}

/** Outfits don't need a name; the database column requires one, so blanks get a sensible default. */
function autoName(occasions: string[], existingCount: number): string {
  return occasions.length > 0 ? `${occasions[0]} outfit` : `Outfit ${existingCount + 1}`;
}

function normalizeOccasion(raw: string): string {
  const t = raw.replace(/^#+/, '').trim().slice(0, 24);
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

export default function WardrobePage() {
  const navigate = useNavigate();
  const { categories: userCategories } = useCategories();
  const [manageOpen, setManageOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('pieces');
  const [items, setItems] = useState<WardrobeItem[] | null>(null);
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pieceFilter, setPieceFilter] = useState<string>('All');
  const [occasionFilter, setOccasionFilter] = useState<string>('All');
  const [pending, setPending] = useState<Pending | null>(null);
  const [pieceDialog, setPieceDialog] = useState<WardrobeItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<{ outfit?: OutfitWithItems; presetName?: string; presetItems?: string[] } | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[] | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [i, o] = await Promise.all([listItems(), listOutfits()]);
      setItems(i);
      setOutfits(o);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t load your wardrobe.');
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items]);
  const categories = useMemo(() => {
    const present = new Set((items ?? []).map((i) => i.category));
    const known = userCategories.filter((cat) => present.has(cat));
    const legacy = [...present].filter((cat) => !userCategories.includes(cat)).sort();
    return [...known, ...legacy];
  }, [items, userCategories]);
  const allOccasions = useMemo(
    () => Array.from(new Set(outfits.flatMap((o) => o.occasions))).sort(),
    [outfits],
  );
  useEffect(() => {
    if (pieceFilter !== 'All' && !categories.includes(pieceFilter)) setPieceFilter('All');
  }, [categories, pieceFilter]);

  const countByCategory = useMemo(() => {
    const m = new Map<string, number>();
    (items ?? []).forEach((i) => m.set(i.category, (m.get(i.category) ?? 0) + 1));
    return m;
  }, [items]);
  const shownPieces = (items ?? []).filter((i) => pieceFilter === 'All' || i.category === pieceFilter);
  const shownOutfits = outfits.filter((o) => occasionFilter === 'All' || o.occasions.includes(occasionFilter));

  async function confirmDelete() {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === 'item') {
        const emptied = outfitsEmptiedBy(pending.item, outfits);
        await deleteItem(pending.item);
        for (const o of emptied) await deleteOutfit(o.id);
      } else {
        await deleteOutfit(pending.outfit.id);
      }
      setPending(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t delete that.');
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      setSuggestions(await suggestOutfits());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t get suggestions.');
    } finally {
      setSuggesting(false);
    }
  }

  const header = (
    <div className="flex justify-between items-center mb-5">
      <h1 className="display text-2xl md:text-3xl" style={{ color: c.ink }}>
        Wardrobe
      </h1>
      <button
        aria-label="Add pieces"
        onClick={() => navigate('/wardrobe/add')}
        className="rounded-full p-2"
        style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
      >
        <Plus size={18} color={c.ink} />
      </button>
    </div>
  );

  if (items === null) {
    return (
      <div className="px-5 pt-6 max-w-5xl mx-auto">
        {header}
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pt-6 max-w-5xl mx-auto">
        {header}
        {error && <ErrorText>{error}</ErrorText>}
        <div className="text-center py-20">
          <Shirt size={36} color={c.slate} className="mx-auto mb-3" />
          <p className="body-font text-sm mb-5" style={{ color: c.slate }}>
            Add a few pieces to get outfit suggestions
          </p>
          <div className="max-w-[180px] mx-auto">
            <Button onClick={() => navigate('/wardrobe/add')}>Add pieces</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8 max-w-5xl mx-auto">
      {header}

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-5 max-w-sm" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
        {(
          [
            ['pieces', `Pieces (${items.length})`],
            ['outfits', `Outfits (${outfits.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="body-font text-sm py-2 rounded-lg"
            style={tab === key ? { background: c.deepSkyWash, color: c.deepSky, fontWeight: 600 } : { color: c.slate }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      {tab === 'pieces' ? (
        <>
          <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
            Single garments, sorted by type. Tap one to change its type. Combine pieces into outfits on the next tab.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {['All', ...categories].map((cat) => (
              <Chip
                key={cat}
                label={`${cat} · ${cat === 'All' ? items.length : countByCategory.get(cat) ?? 0}`}
                selected={pieceFilter === cat}
                onClick={() => setPieceFilter(cat)}
              />
            ))}
            <button
              onClick={() => setManageOpen(true)}
              className="body-font text-sm px-3.5 py-2 rounded-full flex items-center gap-1.5"
              style={{ border: `1px dashed ${c.hairline}`, color: c.slate }}
            >
              <Settings2 size={14} /> Manage types
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {shownPieces.map((i) => (
              <div
                key={i.id}
                className="relative rounded-xl overflow-hidden aspect-square cursor-pointer"
                style={{ background: c.surface, border: `1px solid ${c.hairline}` }}
                onClick={() => setPieceDialog(i)}
              >
                <img src={i.signedUrl} alt={i.category} className="w-full h-full object-cover" />
                <span className="body-font absolute bottom-1.5 left-1.5 text-[11px] px-2 py-0.5 rounded-full" style={{ background: c.surface, color: c.slate }}>
                  {i.category}
                </span>
                <button
                  aria-label="Delete piece"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPending({ kind: 'item', item: i });
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full p-1.5"
                  style={{ background: c.surface }}
                >
                  <Trash2 size={13} color={c.red} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="body-font text-sm mb-4" style={{ color: c.slate }}>
            An outfit is one or more pieces together — even a single piece counts. Then map it to the occasions it suits.
          </p>

          <div className="flex flex-wrap gap-3 mb-5 max-w-md">
            <Button full={false} onClick={() => setEditor({})}>
              <Plus size={14} /> Create outfit
            </Button>
            {aiSuggestions && (
              <Button variant="outline" full={false} onClick={handleSuggest} disabled={suggesting}>
                <Sparkles size={14} /> {suggesting ? 'Thinking…' : 'Suggest combinations'}
              </Button>
            )}
          </div>

          {suggestions && (
            <div className="mb-7">
              <SectionLabel>Suggested combinations</SectionLabel>
              {suggestions.length === 0 ? (
                <p className="body-font text-sm" style={{ color: c.slate }}>
                  Add a few more pieces in different categories to get combinations.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {suggestions.map((s) => (
                    <div key={s.name} className="rounded-2xl p-3.5" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {s.itemIds.slice(0, 4).map((id) => (
                            <Thumb key={id} url={byId.get(id)?.signedUrl} />
                          ))}
                        </div>
                        <p className="body-font text-sm font-semibold flex-1" style={{ color: c.ink }}>
                          {s.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditor({ presetName: s.name, presetItems: s.itemIds })}
                        className="body-font text-xs font-semibold mt-3"
                        style={{ color: c.deepSky }}
                      >
                        Save this outfit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {allOccasions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {['All', ...allOccasions].map((occ) => (
                <Chip key={occ} label={occ} selected={occasionFilter === occ} onClick={() => setOccasionFilter(occ)} />
              ))}
            </div>
          )}

          {outfits.length === 0 ? (
            <p className="body-font text-sm" style={{ color: c.slate }}>
              No outfits yet. Create one from your pieces.
            </p>
          ) : shownOutfits.length === 0 ? (
            <p className="body-font text-sm" style={{ color: c.slate }}>
              No outfits for “{occasionFilter}” yet.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shownOutfits.map((o) => (
                <div key={o.id} className="rounded-2xl p-3.5" style={{ background: c.surface, border: `1px solid ${c.hairline}` }}>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {o.itemIds.slice(0, 4).map((id) => (
                        <Thumb key={id} url={byId.get(id)?.signedUrl} />
                      ))}
                      {o.itemIds.length === 0 && <Thumb />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-font text-sm font-semibold truncate" style={{ color: c.ink }}>
                        {o.name}
                      </p>
                      <p className="body-font text-xs" style={{ color: c.slate }}>
                        {o.itemIds.length} {o.itemIds.length === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {o.occasions.length === 0 ? (
                      <span className="body-font text-xs" style={{ color: c.slate }}>
                        No occasions yet
                      </span>
                    ) : (
                      o.occasions.map((occ) => (
                        <span key={occ} className="body-font text-xs px-2.5 py-1 rounded-full" style={{ background: c.cream, color: c.ink }}>
                          {occ}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-4 mt-3">
                    <button onClick={() => setEditor({ outfit: o })} className="body-font text-xs" style={{ color: c.deepSky }}>
                      Edit
                    </button>
                    <button onClick={() => setPending({ kind: 'outfit', outfit: o })} className="body-font text-xs" style={{ color: c.red }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ManageCategories
        open={manageOpen}
        counts={countByCategory}
        onClose={() => setManageOpen(false)}
        onChanged={load}
      />

      <PieceDialog
        key={pieceDialog?.id ?? 'closed'}
        item={pieceDialog}
        onClose={() => setPieceDialog(null)}
        onSaved={async () => {
          setPieceDialog(null);
          await load();
        }}
      />

      <ConfirmModal
        open={!!pending}
        title={pending?.kind === 'outfit' ? 'Delete this outfit?' : 'Delete this piece?'}
        body={
          pending?.kind === 'outfit'
            ? `“${pending.outfit.name}” will be removed, and unassigned from any trip days. Your pieces stay.`
            : pieceDeleteWarning(pending?.kind === 'item' ? pending.item : null, outfits)
        }
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />

      <OutfitEditor
        key={editor?.outfit?.id ?? editor?.presetName ?? (editor ? 'new' : 'closed')}
        open={!!editor}
        outfit={editor?.outfit}
        presetName={editor?.presetName}
        presetItems={editor?.presetItems}
        items={items}
        knownOccasions={allOccasions}
        outfitCount={outfits.length}
        onClose={() => setEditor(null)}
        onSaved={async () => {
          setEditor(null);
          setTab('outfits');
          await load();
        }}
      />
    </div>
  );
}

function Thumb({ url }: { url?: string }) {
  return (
    <div className="w-9 h-9 rounded-lg overflow-hidden" style={{ background: c.bg, border: `1px solid ${c.hairline}` }}>
      {url && <img src={url} alt="" className="w-full h-full object-cover" />}
    </div>
  );
}

function OutfitEditor({
  open,
  outfit,
  presetName,
  presetItems,
  items,
  knownOccasions,
  outfitCount,
  onClose,
  onSaved,
}: {
  open: boolean;
  outfit?: OutfitWithItems;
  presetName?: string;
  presetItems?: string[];
  items: WardrobeItem[];
  knownOccasions: string[];
  outfitCount: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(outfit?.name ?? presetName ?? '');
  const [selected, setSelected] = useState<string[]>(outfit?.itemIds ?? presetItems ?? []);
  const [occasions, setOccasions] = useState<string[]>(outfit?.occasions ?? []);
  const [newOccasion, setNewOccasion] = useState('');
  const { categories: userCategories } = useCategories();
  const [pickCategory, setPickCategory] = useState<string | null>(null);
  // One garment type at a time keeps a big wardrobe uncluttered; chosen pieces stay in the strip above.
  const pickerCategories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return [...userCategories.filter((cat) => present.has(cat)), ...[...present].filter((cat) => !userCategories.includes(cat)).sort()];
  }, [items, userCategories]);
  const activeCategory = pickCategory ?? pickerCategories[0] ?? '';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = selected.length > 0;

  const occasionOptions = useMemo(() => {
    const seen = new Set<string>();
    return [...occasions, ...knownOccasions, ...OCCASION_SUGGESTIONS].filter((o) => {
      const k = o.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [occasions, knownOccasions]);

  function toggle(id: string) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function toggleOccasion(label: string) {
    setOccasions((cur) => {
      const has = cur.some((o) => o.toLowerCase() === label.toLowerCase());
      if (has) return cur.filter((o) => o.toLowerCase() !== label.toLowerCase());
      return cur.length >= MAX_OCCASIONS ? cur : [...cur, label];
    });
  }

  function addOccasion() {
    const label = normalizeOccasion(newOccasion);
    setNewOccasion('');
    if (!label) return;
    if (occasions.some((o) => o.toLowerCase() === label.toLowerCase())) return;
    toggleOccasion(label);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const finalName = name.trim() || autoName(occasions, outfitCount);
      if (outfit) await updateOutfit(outfit.id, finalName, selected, occasions);
      else await createOutfit(finalName, selected, occasions);
      setConfirmOpen(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save the outfit.');
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
        <div className="p-5 flex flex-col gap-4">
          <p className="display text-xl" style={{ color: c.ink }}>
            {outfit ? 'Edit outfit' : 'Create outfit'}
          </p>
          <label className="block">
            <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
              Name <span className="font-normal text-xs" style={{ color: c.slate }}>— optional</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leave blank and we'll name it"
              className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
          </label>
          <div>
            <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
              Pieces <span className="font-normal text-xs" style={{ color: c.slate }}>— pick one or more · {selected.length} selected</span>
            </span>

            {selected.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {selected.map((id) => {
                  const it = items.find((x) => x.id === id);
                  if (!it) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-label={`Remove ${it.category} from outfit`}
                      onClick={() => toggle(id)}
                      className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"
                      style={{ border: `2px solid ${c.deepSky}` }}
                    >
                      <img src={it.signedUrl} alt={it.category} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 flex items-start justify-end p-0.5">
                        <X size={11} color={c.surface} style={{ background: c.deepSky, borderRadius: 999 }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-2.5">
              {pickerCategories.map((cat) => {
                const chosen = selected.filter((id) => items.find((x) => x.id === id)?.category === cat).length;
                return (
                  <Chip
                    key={cat}
                    label={`${cat} · ${items.filter((x) => x.category === cat).length}${chosen ? ` (${chosen} chosen)` : ''}`}
                    selected={activeCategory === cat}
                    onClick={() => setPickCategory(cat)}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
              {items
                .filter((i) => i.category === activeCategory)
                .map((i) => {
                  const on = selected.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => toggle(i.id)}
                      className="aspect-square rounded-xl overflow-hidden"
                      style={{ border: `2px solid ${on ? c.deepSky : c.hairline}`, opacity: on ? 1 : 0.85 }}
                    >
                      <img src={i.signedUrl} alt={i.category} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
            </div>
          </div>
          <div>
            <span className="body-font text-sm font-semibold block mb-1.5" style={{ color: c.ink }}>
              Occasions <span className="font-normal text-xs" style={{ color: c.slate }}>— where would you wear this? Optional.</span>
            </span>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {occasionOptions.map((o) => (
                <Chip key={o} label={o} selected={occasions.some((x) => x.toLowerCase() === o.toLowerCase())} onClick={() => toggleOccasion(o)} />
              ))}
            </div>
            <input
              value={newOccasion}
              onChange={(e) => setNewOccasion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOccasion();
                }
              }}
              onBlur={addOccasion}
              placeholder="Add your own, e.g. Sunrise hike"
              maxLength={25}
              className="body-font w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!valid || saving} onClick={() => (outfit ? setConfirmOpen(true) : save())}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Dialog>
      <ConfirmModal
        open={confirmOpen}
        title="Save these changes?"
        confirmLabel="Save"
        busy={saving}
        onConfirm={save}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function PieceDialog({
  item,
  onClose,
  onSaved,
}: {
  item: WardrobeItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [category, setCategory] = useState(item?.category ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategories();
  const options = item && !categories.includes(item.category) ? [item.category, ...categories] : categories;

  async function save() {
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      await updateItemCategory(item.id, category);
      setConfirmOpen(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t change the type.');
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={!!item} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
        {item && (
          <div className="p-5 flex flex-col gap-4">
            <img src={item.signedUrl} alt={item.category} className="w-full h-56 object-cover rounded-2xl" />
            <div>
              <span className="body-font text-sm font-semibold block mb-2" style={{ color: c.ink }}>
                What kind of piece is this?
              </span>
              <div className="flex flex-wrap gap-2">
                {options.map((cat) => (
                  <Chip key={cat} label={cat} selected={category === cat} onClick={() => setCategory(cat)} />
                ))}
              </div>
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button disabled={category === item.category || saving} onClick={() => setConfirmOpen(true)}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Dialog>
      <ConfirmModal
        open={confirmOpen}
        title="Change this piece’s type?"
        body={item ? `It will move from ${item.category} to ${category}.` : undefined}
        confirmLabel="Change"
        busy={saving}
        onConfirm={save}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
