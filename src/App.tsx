import { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { FilmStrip } from './components/FilmStrip';
import { Inspector } from './components/Inspector';
import { PreviewModal } from './components/PreviewModal';

export function App() {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="app">
      <Toolbar onPreview={() => setPreviewOpen(true)} />
      <main className="workspace">
        <section className="canvas">
          <FilmStrip />
        </section>
        <Inspector />
      </main>
      {previewOpen && <PreviewModal onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
