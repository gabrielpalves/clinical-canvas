import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { CarouselProvider } from './state/CarouselContext.tsx';
import './styles/fonts.css';
import './styles/app.css';
import './styles/modes.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CarouselProvider>
      <App />
    </CarouselProvider>
  </StrictMode>,
);
