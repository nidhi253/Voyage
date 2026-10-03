import { createTheme } from '@mui/material/styles';

export const colors = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  ink: '#14181F',
  slate: '#5B6472',
  hairline: '#E2E5E9',
  amber: '#E2A63B',
  amberWash: '#FBF1DE',
  deepSky: '#2B4C6F',
  deepSkyWash: '#2B4C6F15',
  teal: '#12998A',
  disabled: '#8D9299',
  red: '#C0392B',
};

export const muiTheme = createTheme({
  palette: {
    background: { default: colors.bg, paper: colors.surface },
    text: { primary: colors.ink, secondary: colors.slate },
    primary: { main: colors.ink, contrastText: colors.surface },
    error: { main: colors.red },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shape: { borderRadius: 12 },
});
