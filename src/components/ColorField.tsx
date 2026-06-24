import { X } from 'lucide-react';
import { coerceHex, isHex } from '../lib/helpers';

interface Props {
  label: string;
  /** current hex ('' = inherit / none). */
  value: string;
  onChange: (hex: string) => void;
  /** swatch shown by the native picker when no value is set yet. */
  fallback?: string;
}

/**
 * A compact colour control: a native swatch (visual pick) paired with a text
 * field so a hex code can be typed/pasted directly, plus a clear button that
 * resets to inherit. Both inputs stay in sync; partial typing is preserved and
 * only applied downstream once it's a valid hex.
 */
export function ColorField({ label, value, onChange, fallback = '#888888' }: Props) {
  const swatchValue = isHex(value) ? value : fallback;
  return (
    <div className="colorfield">
      <span className="colorfield__label">{label}</span>
      <input
        type="color"
        className="colorfield__swatch"
        value={swatchValue}
        onChange={(e) => onChange(e.target.value)}
        title={value || 'Escolher cor'}
      />
      <input
        className="input colorfield__hex"
        value={value}
        placeholder="auto"
        spellCheck={false}
        onChange={(e) => onChange(coerceHex(e.target.value))}
      />
      <button
        className="icon-btn"
        title="Limpar (herdar)"
        disabled={!value}
        onClick={() => onChange('')}
      >
        <X size={13} />
      </button>
    </div>
  );
}
