// Dev-only preview mode: skips login and serves fake data from memory (see mockStore.ts).
// Turn on with http://localhost:5173/?preview=1, turn off with ?preview=0.
// `import.meta.env.DEV` is false in production builds, so this is always off there.

const KEY = 'voyage-preview';

function read(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    const q = new URLSearchParams(window.location.search).get('preview');
    if (q === '1') sessionStorage.setItem(KEY, '1');
    if (q === '0') sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export const PREVIEW = import.meta.env.DEV && read();

/** Loaded on demand so the fake data never ships in the main bundle. */
export const loadMock = () => import('./mockStore').then((m) => m.mock);

export function exitPreview() {
  sessionStorage.removeItem(KEY);
  window.location.href = '/?preview=0';
}
