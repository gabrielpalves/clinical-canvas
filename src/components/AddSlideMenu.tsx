import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { PRESETS } from '../designModes';
import type { PresetId } from '../types';

interface Props {
  onAdd: (preset: PresetId) => void;
}

export function AddSlideMenu({ onAdd }: Props) {
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
      <button type="button" className="add-tile" onClick={() => setOpen((v) => !v)} title="Adicionar slide">
        <Plus size={28} />
      </button>

      {open && (
        <div className="add-menu__pop" role="menu">
          <p className="add-menu__title">Novo slide</p>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="add-menu__item"
              onClick={() => {
                onAdd(p.id);
                setOpen(false);
              }}
            >
              <span className="add-menu__name">{p.name}</span>
              <span className="add-menu__desc">{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
