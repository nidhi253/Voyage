import { useRef, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Dialog } from '@mui/material';
import { colors as c } from '../theme';
import { useCategories } from '../lib/categories';
import { MAX_CATEGORY_LENGTH } from '../data/categories';
import { Button, ConfirmModal, ErrorText } from './ui';

/** Add, rename and remove piece types. `counts` is how many pieces are in each type right now. */
export default function ManageCategories({
  open,
  counts,
  onClose,
  onChanged,
}: {
  open: boolean;
  counts: Map<string, number>;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { categories, add, rename, remove } = useCategories();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');
  const [toRemove, setToRemove] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipBlur = useRef(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function commitRename() {
    if (editing === null) return;
    const from = editing;
    const to = draft;
    setEditing(null);
    await run(() => rename(from, to));
  }

  async function submitNew() {
    const name = newName;
    if (!name.trim()) return;
    setNewName('');
    await run(async () => {
      await add(name);
    });
  }

  const removeCount = toRemove ? counts.get(toRemove) ?? 0 : 0;

  return (
    <>
      <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px', m: 2 } }}>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <p className="display text-xl" style={{ color: c.ink }}>
              Manage types
            </p>
            <p className="body-font text-xs mt-1" style={{ color: c.slate }}>
              Add your own, rename any of them, or remove the ones you don’t use.
            </p>
          </div>

          <div className="flex flex-col max-h-72 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-3 py-2.5" style={{ borderBottom: `1px solid ${c.hairline}` }}>
                {editing === cat ? (
                  <input
                    autoFocus
                    value={draft}
                    maxLength={MAX_CATEGORY_LENGTH + 1}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                      if (skipBlur.current) {
                        skipBlur.current = false;
                        return;
                      }
                      commitRename();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') {
                        skipBlur.current = true;
                        setEditing(null);
                      }
                    }}
                    className="body-font text-sm px-3 py-1.5 rounded-lg outline-none flex-1 min-w-0"
                    style={{ background: c.surface, border: `1.5px solid ${c.deepSky}`, color: c.ink }}
                  />
                ) : (
                  <>
                    <span className="body-font text-sm flex-1 min-w-0 truncate" style={{ color: c.ink }}>
                      {cat}
                      <span className="text-xs ml-2" style={{ color: c.slate }}>
                        {counts.get(cat) ?? 0}
                      </span>
                    </span>
                    <button
                      aria-label={`Rename ${cat}`}
                      disabled={busy}
                      onClick={() => {
                        setDraft(cat);
                        setEditing(cat);
                      }}
                    >
                      <Pencil size={14} color={c.slate} />
                    </button>
                    <button aria-label={`Remove ${cat}`} disabled={busy || categories.length <= 1} onClick={() => setToRemove(cat)}>
                      <Trash2 size={14} color={c.red} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newName}
              maxLength={MAX_CATEGORY_LENGTH + 1}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              placeholder="New type, e.g. Sarees"
              className="body-font flex-1 min-w-0 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
            <Button full={false} disabled={busy || !newName.trim()} onClick={submitNew} aria-label="Add type">
              <Plus size={16} />
            </Button>
          </div>

          {error && <ErrorText>{error}</ErrorText>}
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Done
          </Button>
        </div>
      </Dialog>

      <ConfirmModal
        open={toRemove !== null}
        title={`Remove “${toRemove}”?`}
        body={
          removeCount > 0
            ? `${removeCount} ${removeCount === 1 ? 'piece' : 'pieces'} in it will move to ${toRemove === 'Other' ? 'another type' : '“Other”'}. Nothing is deleted.`
            : 'No pieces are in this type, so nothing else changes.'
        }
        confirmLabel="Remove"
        danger
        busy={busy}
        onConfirm={async () => {
          const name = toRemove as string;
          await run(() => remove(name));
          setToRemove(null);
        }}
        onCancel={() => setToRemove(null)}
      />
    </>
  );
}
