import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

const COLORS: Array<{ name: string; hex: string; label: string }> = [
  { name: 'gold', hex: '#bfa065', label: 'Ouro' },
  { name: 'wine', hex: '#682d36', label: 'Vinho' },
  { name: 'blue', hex: '#131736', label: 'Azul' },
  { name: 'brown', hex: '#5d4037', label: 'Marrom' },
];

/** A text field with a bold / italic / highlight / colour toolbar. Each button
 *  TOGGLES the markup on the current selection (no stacking). */
export function MarkupField({ value, onChange, multiline, rows = 3, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const apply = (next: string, selStart: number, selEnd: number) => {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  /** wrap/unwrap the selection with `before`/`after` (toggle). */
  const toggle = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const sel = value.slice(start, end);
    if (sel.startsWith(before) && sel.endsWith(after) && sel.length >= before.length + after.length) {
      const inner = sel.slice(before.length, sel.length - after.length);
      apply(value.slice(0, start) + inner + value.slice(end), start, start + inner.length);
    } else if (value.slice(start - before.length, start) === before && value.slice(end, end + after.length) === after) {
      apply(value.slice(0, start - before.length) + sel + value.slice(end + after.length), start - before.length, start - before.length + sel.length);
    } else {
      const body = sel || 'texto';
      apply(value.slice(0, start) + before + body + after + value.slice(end), start + before.length, start + before.length + body.length);
    }
  };

  /** remove any {{name:...}} colour wrapper around the selection. */
  const clearColor = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const sel = value.slice(start, end);
    const m = sel.match(/^\{\{[a-z]+:([\s\S]+)\}\}$/);
    if (m) apply(value.slice(0, start) + m[1] + value.slice(end), start, start + m[1].length);
  };

  const noBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="mk">
      <div className="mk__bar">
        <button type="button" className="mk__btn" title="Negrito" onMouseDown={noBlur} onClick={() => toggle('*', '*')}><b>B</b></button>
        <button type="button" className="mk__btn" title="Itálico" onMouseDown={noBlur} onClick={() => toggle('_', '_')}><i>I</i></button>
        <button type="button" className="mk__btn" title="Destaque" onMouseDown={noBlur} onClick={() => toggle('==', '==')}><span className="mk__hl">H</span></button>
        <span className="mk__sep" />
        <button type="button" className="mk__btn" title="Fonte serifada" onMouseDown={noBlur} onClick={() => toggle('{{serif:', '}}')} style={{ fontFamily: "'Cormorant Garamond', serif" }}>Aa</button>
        <button type="button" className="mk__btn" title="Fonte sem serifa" onMouseDown={noBlur} onClick={() => toggle('{{sans:', '}}')} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11 }}>Aa</button>
        <span className="mk__sep" />
        {COLORS.map((c) => (
          <button key={c.name} type="button" className="mk__swatch" title={`Cor: ${c.label}`} style={{ background: c.hex }} onMouseDown={noBlur} onClick={() => toggle(`{{${c.name}:`, '}}')} />
        ))}
        <button type="button" className="mk__btn mk__btn--clear" title="Remover cor" onMouseDown={noBlur} onClick={clearColor}>⌫</button>
      </div>
      {multiline ? (
        <textarea ref={ref} className="input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input ref={ref} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
