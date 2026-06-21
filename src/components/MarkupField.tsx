import { useRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

/** A text field with a small bold / italic / highlight toolbar that wraps the
 *  current selection in the markup understood by renderRich. */
export function MarkupField({ value, onChange, multiline, rows = 3, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const wrap = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const sel = value.slice(start, end) || 'texto';
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  // preventDefault keeps the textarea selection while clicking a toolbar button
  const noBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="mk">
      <div className="mk__bar">
        <button type="button" className="mk__btn" title="Negrito" onMouseDown={noBlur} onClick={() => wrap('*', '*')}>
          <b>B</b>
        </button>
        <button type="button" className="mk__btn" title="Itálico" onMouseDown={noBlur} onClick={() => wrap('_', '_')}>
          <i>I</i>
        </button>
        <button type="button" className="mk__btn" title="Destaque" onMouseDown={noBlur} onClick={() => wrap('==', '==')}>
          <span className="mk__hl">H</span>
        </button>
      </div>
      {multiline ? (
        <textarea ref={ref} className="input" rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input ref={ref} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
