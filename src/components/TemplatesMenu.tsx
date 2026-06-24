import { Fragment, useEffect, useRef, useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { TEMPLATES } from '../state/templates';

export function TemplatesMenu() {
  const { dispatch } = useCarousel();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="add-menu" ref={ref}>
      <button type="button" className="btn btn--ghost" onClick={() => setOpen((v) => !v)} title="Começar de um modelo">
        <LayoutTemplate size={16} /> Modelos
      </button>
      {open && (
        <div className="add-menu__pop add-menu__pop--down" role="menu">
          <p className="add-menu__title">Começar de um modelo</p>
          {TEMPLATES.map((t, i) => (
            <Fragment key={t.id}>
              {(i === 0 || TEMPLATES[i - 1].group !== t.group) && (
                <p className="add-menu__group">{t.group}</p>
              )}
              <button
                type="button"
                className="add-menu__item"
                onClick={() => {
                  if (confirm(`Substituir o carrossel atual pelo modelo "${t.name}"?`)) {
                    const { slides, caption } = t.build();
                    dispatch({ type: 'applyTemplate', slides, caption });
                    if (t.mode) dispatch({ type: 'setMode', mode: t.mode });
                  }
                  setOpen(false);
                }}
              >
                <span className="add-menu__name">{t.name}</span>
                <span className="add-menu__desc">{t.description}</span>
              </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
