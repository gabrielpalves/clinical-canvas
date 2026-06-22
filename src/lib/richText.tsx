import type { ReactNode } from 'react';

/**
 * Inline markup, nestable so formats can be combined:
 *   *bold*   _italic_   ==highlight==   {{wine:colored}}
 * e.g. ==*importante*==  →  bold + highlight.
 * Colour names map to .cc-fg-* classes. Kept as plain strings in state so it
 * stays simple and exports cleanly (HTML text colour survives html-to-image).
 */
const TOKEN = /(\*[^*\n]+\*|_[^_\n]+_|==[^=\n]+==|\{\{[a-z]+:[^}\n]+\}\})/;

let keyCounter = 0;

function parse(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  while (rest) {
    const m = rest.match(TOKEN);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const tok = m[0];
    const key = `r${keyCounter++}`;
    if (tok.startsWith('==')) {
      out.push(<mark key={key} className="cc-hl">{parse(tok.slice(2, -2))}</mark>);
    } else if (tok.startsWith('*')) {
      out.push(<strong key={key}>{parse(tok.slice(1, -1))}</strong>);
    } else if (tok.startsWith('_')) {
      out.push(<em key={key}>{parse(tok.slice(1, -1))}</em>);
    } else {
      // {{name:body}}
      const inner = tok.slice(2, -2);
      const ci = inner.indexOf(':');
      const name = inner.slice(0, ci);
      out.push(<span key={key} className={`cc-fg-${name}`}>{parse(inner.slice(ci + 1))}</span>);
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

export function renderRich(text: string): ReactNode {
  if (!text) return text;
  keyCounter = 0;
  return parse(text);
}
