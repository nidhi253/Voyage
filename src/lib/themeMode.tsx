import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { makeMuiTheme, type Mode } from '../theme';

const KEY = 'voyage-theme';

function initialMode(): Mode {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const Ctx = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: 'light', setMode: () => {} });

export const useThemeMode = () => useContext(Ctx);

/** Holds light/dark, remembers it locally (so the login screen matches), and themes MUI too. */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(initialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode: (m: Mode) => {
        setModeState(m);
        try {
          localStorage.setItem(KEY, m);
        } catch {
          /* private mode: the choice just won't be remembered locally */
        }
      },
    }),
    [mode],
  );

  const muiTheme = useMemo(() => makeMuiTheme(mode), [mode]);

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}
