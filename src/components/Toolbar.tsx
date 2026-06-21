import { useRef, useState } from 'react';
import { Download, Eye, FileImage, FolderOpen, Package, RotateCcw, Save } from 'lucide-react';
import { coerceCarousel, useCarousel } from '../state/CarouselContext';
import { DESIGN_MODES } from '../designModes';
import { DIMENSIONS, slugify } from '../lib/helpers';
import { exportCarouselZip, exportSlidePng } from '../lib/exporter';
import { TemplatesMenu } from './TemplatesMenu';
import type { AspectId } from '../types';

export function Toolbar({ onPreview }: { onPreview: () => void }) {
  const { carousel, dispatch, selectedId } = useCarousel();
  const [busy, setBusy] = useState<null | string>(null);
  const openRef = useRef<HTMLInputElement>(null);

  const saveProject = () => {
    const blob = new Blob([JSON.stringify(carousel, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${slugify(carousel.brandName, 'carrossel')}-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const openProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const carouselIn = coerceCarousel(JSON.parse(await file.text()));
      if (!carouselIn) throw new Error('invalid');
      if (confirm('Abrir este projeto substituirá o carrossel atual. Continuar?')) {
        dispatch({ type: 'load', carousel: carouselIn });
      }
    } catch {
      alert('Arquivo inválido. Selecione um projeto .json exportado pelo Clinical Canvas.');
    }
  };

  const exportCurrent = async () => {
    if (!selectedId) return;
    const idx = carousel.slides.findIndex((s) => s.id === selectedId);
    setBusy('png');
    try {
      await exportSlidePng(selectedId, idx, carousel.aspect);
    } catch (err) {
      alert('Não foi possível exportar este slide. Tente novamente.');
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  const exportAll = async () => {
    setBusy('zip-0');
    try {
      await exportCarouselZip(
        carousel.slides.map((s) => s.id),
        carousel.aspect,
        carousel.brandName,
        carousel.caption,
        (p) => setBusy(`zip-${Math.round((p.done / p.total) * 100)}`),
      );
    } catch (err) {
      alert('Não foi possível gerar o .zip. Tente novamente.');
      console.error(err);
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    if (confirm('Recomeçar do zero? Seu carrossel atual será substituído pelo exemplo.')) {
      dispatch({ type: 'reset' });
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__logo">Clinical Canvas</span>
        <span className="toolbar__sub">Gerador de carrosséis · Laísa Bitencourt</span>
      </div>

      <div className="toolbar__modes">
        {DESIGN_MODES.map((m) => (
          <button
            key={m.id}
            className={`mode${carousel.mode === m.id ? ' is-active' : ''}`}
            onClick={() => dispatch({ type: 'setMode', mode: m.id })}
            title={m.tagline}
          >
            <span className="mode__swatch">
              {m.swatch.map((color, i) => (
                <span key={i} style={{ background: color }} />
              ))}
            </span>
            <span className="mode__name">{m.name}</span>
          </button>
        ))}
      </div>

      <div className="toolbar__right">
        <div className="seg seg--sm">
          {(Object.keys(DIMENSIONS) as AspectId[]).map((a) => (
            <button
              key={a}
              className={`seg__btn${carousel.aspect === a ? ' is-active' : ''}`}
              onClick={() => dispatch({ type: 'setAspect', aspect: a })}
              title={DIMENSIONS[a].label}
            >
              {a === 'portrait' ? '4:5' : '1:1'}
            </button>
          ))}
        </div>

        <TemplatesMenu />
        <input ref={openRef} type="file" accept="application/json,.json" hidden onChange={openProject} />
        <button className="btn btn--ghost" onClick={() => openRef.current?.click()} title="Abrir projeto (.json)">
          <FolderOpen size={16} /> Abrir
        </button>
        <button className="btn btn--ghost" onClick={saveProject} title="Salvar projeto (.json)">
          <Save size={16} /> Salvar
        </button>
        <button className="btn btn--ghost" onClick={onPreview} title="Pré-visualizar">
          <Eye size={16} /> Prévia
        </button>
        <button className="btn btn--ghost" onClick={exportCurrent} disabled={busy !== null}>
          <FileImage size={16} /> {busy === 'png' ? 'Exportando…' : 'PNG'}
        </button>
        <button className="btn btn--primary" onClick={exportAll} disabled={busy !== null}>
          {busy?.startsWith('zip') ? (
            <>
              <Package size={16} /> {busy === 'zip-0' ? 'Gerando…' : `${busy.split('-')[1]}%`}
            </>
          ) : (
            <>
              <Download size={16} /> Baixar tudo (.zip)
            </>
          )}
        </button>
        <button className="icon-btn" onClick={reset} title="Recomeçar">
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
