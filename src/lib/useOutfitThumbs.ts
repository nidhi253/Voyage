import { useEffect, useState } from 'react';
import { listItems, listOutfits } from '../data/wardrobe';

/** Up to four piece photos per saved outfit, keyed by outfit id, so outfits can be recognised by sight. */
export function useOutfitThumbs(): Map<string, string[]> {
  const [thumbs, setThumbs] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    let alive = true;
    Promise.all([listOutfits(), listItems()])
      .then(([outfits, items]) => {
        const url = new Map(items.map((i) => [i.id, i.signedUrl]));
        const map = new Map(
          outfits.map((o) => [o.id, o.itemIds.map((id) => url.get(id)).filter((u): u is string => !!u).slice(0, 4)]),
        );
        if (alive) setThumbs(map);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return thumbs;
}
