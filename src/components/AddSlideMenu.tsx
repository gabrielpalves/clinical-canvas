import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { LAYOUTS } from '../designModes';
import type { LayoutId } from '../types';

interface Props {
  onAdd: (layout: LayoutId) => void;
  variant?: 'tile' | 'button';
}

export function AddSlideMenu({ onAdd, variant = 'tile' }: Props) {
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
      <button
        type="button"
        className={variant === 'tile' ? 'add-tile' : 'btn btn--ghost'}
        onClick={() => setOpen((v) => !v)}
        title="Adicionar slide"
      >
        <Plus size={variant === 'tile' ? 28 : 16} />
        {variant === 'button' && <span>Slide</span>}
      </button>

      {open && (
        <div className="add-menu__pop" role="menu">
          <p className="add-menu__title">Escolha um layout</p>
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              className="add-menu__item"
              onClick={() => {
                onAdd(l.id);
                setOpen(false);
              }}
            >
              <span className="add-menu__name">{l.name}</span>
              <span className="add-menu__desc">{l.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
