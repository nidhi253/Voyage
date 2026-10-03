import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { paletteCss } from './theme';
import { ThemeModeProvider } from './lib/themeMode';
import './index.css';
import App from './App';

// Colour variables for light and dark mode, defined once from theme.ts.
const style = document.createElement('style');
style.textContent = paletteCss();
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </StrictMode>
);
