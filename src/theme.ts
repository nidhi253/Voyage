import { createTheme } from '@mui/material/styles';

const light = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#14181F',
  slate: '#5B6472',
  hairline: '#E2E5E9',
  amber: '#E2A63B',
  amberWash: '#FBF1DE',
  amberText: '#8A5A1E',
  deepSky: '#2B4C6F',
  deepSkyWash: 'rgba(43, 76, 111, 0.09)',
  teal: '#12998A',
  disabled: '#8D9299',
  red: '#C0392B',
  cream: '#F8EBDD',
};

const dark: typeof light = {
  bg: '#0F1318',
  surface: '#181D25',
  ink: '#EEF0F3',
  slate: '#9AA3B0',
  hairline: '#2A313B',
  amber: '#E2A63B',
  amberWash: '#3A2E17',
  amberText: '#F0C77A',
  deepSky: '#8DB4DD',
  deepSkyWash: 'rgba(141, 180, 221, 0.16)',
  teal: '#2BB5A5',
  disabled: '#4A515C',
  red: '#EF6B5C',
  cream: '#3A3128',
};

export type Mode = 'light' | 'dark';
export const palettes = { light, dark };

/** Components use these CSS-variable references, so switching mode never needs a re-render of styles. */
export const colors = Object.fromEntries(
  (Object.keys(light) as Array<keyof typeof light>).map((k) => [k, `var(--c-${k})`]),
) as Record<keyof typeof light, string>;

function block(selector: string, p: typeof light, scheme: Mode) {
  const vars = Object.entries(p).map(([k, v]) => `--c-${k}: ${v};`).join(' ');
  return `${selector} { ${vars} color-scheme: ${scheme}; }`;
}

/** CSS text defining the variables for both modes. Injected once at startup. */
export function paletteCss(): string {
  return `${block(':root', light, 'light')}\n${block(':root[data-theme="dark"]', dark, 'dark')}`;
}

/** MUI needs real colour values (it does maths on them), so it gets the concrete palette. */
export function makeMuiTheme(mode: Mode) {
  const p = palettes[mode];
  return createTheme({
    palette: {
      mode,
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.ink, secondary: p.slate },
      primary: { main: p.ink, contrastText: p.surface },
      error: { main: p.red },
    },
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    shape: { borderRadius: 12 },
  });
}
