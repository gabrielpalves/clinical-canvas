import { Trash2 } from 'lucide-react';
import type { Decoration } from '../types';

const KIND_LABELS: Record<Decoration['kind'], string> = {
  blobA: 'Forma 1',
  blobB: 'Forma 2',
  leaf: 'Folha',
  circle: 'Círculo',
  ring: 'Anel',
  triangle: 'Triângulo',
  line: 'Linha',
  arrow: 'Seta',
  plus: 'Cruz',
  asterisk: 'Asterisco',
};

const COLORS: Array<{ id: Decoration['color']; label: string }> = [
  { id: 'accent', label: 'Dourado' },
  { id: 'heading', label: 'Escuro' },
  { id: 'muted', label: 'Neutro' },
];

function Slider({ label, value, min, max, def, onChange }: { label: string; value: number; min: number; max: number; def: number; onChange: (v: number) => void }) {
  const apply = (v: number) => {
    if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
  };
  return (
    <div className="size-row">
      <span className="size-row__icon size-row__icon--wide" title="Clique duplo no controle = padrão">{label}</span>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => apply(Number(e.target.value))}
        onDoubleClick={() => onChange(def)} />
      <input className="size-row__num" type="number" value={value} onChange={(e) => apply(Number(e.target.value))} />
    </div>
  );
}

export function DecorationEditor({
  d,
  index,
  onChange,
  onRemove,
}: {
  d: Decoration;
  index: number;
  onChange: (patch: Partial<Decoration>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="deco-card">
      <div className="deco-card__head">
        <span className="deco-card__title">{index + 1}. {KIND_LABELS[d.kind]}</span>
        <button className="icon-btn icon-btn--danger" title="Remover forma" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>
      <Slider label="Horizontal" value={Math.round(d.x * 100)} min={0} max={100} def={50} onChange={(v) => onChange({ x: v / 100 })} />
      <Slider label="Vertical" value={Math.round(d.y * 100)} min={0} max={100} def={50} onChange={(v) => onChange({ y: v / 100 })} />
      <Slider label="Tamanho" value={Math.round(d.size * 100)} min={5} max={75} def={28} onChange={(v) => onChange({ size: v / 100 })} />
      <Slider label="Rotação" value={Math.round(d.rotation)} min={0} max={360} def={0} onChange={(v) => onChange({ rotation: v })} />
      <Slider label="Opacidade" value={Math.round(d.opacity * 100)} min={5} max={100} def={50} onChange={(v) => onChange({ opacity: v / 100 })} />
      <div className="seg seg--sm" style={{ marginTop: 8 }}>
        {COLORS.map((col) => (
          <button key={col.id} className={`seg__btn${d.color === col.id ? ' is-active' : ''}`} onClick={() => onChange({ color: col.id })}>
            {col.label}
          </button>
        ))}
      </div>
      <div className="deco-card__toggles">
        <label className="toggle">
          <input type="checkbox" checked={d.filled} onChange={(e) => onChange({ filled: e.target.checked })} />
          <span>Preenchido</span>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={d.front} onChange={(e) => onChange({ front: e.target.checked })} />
          <span>Na frente do texto</span>
        </label>
      </div>
    </div>
  );
}
