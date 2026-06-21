import type { ReactNode } from 'react';

/**
 * Inline markup used in every text field:
 *   *bold*   _italic_   ==highlight==
 * Parsed at render time into styled spans (kept as plain strings in state, so
 * it stays simple and exports cleanly).
 */
const RICH = /(==[^=\n]+==|\*[^*\n]+\*|_[^_\n]+_)/g;

export function renderRich(text: string): ReactNode {
  if (!text) return text;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  RICH.lastIndex = 0;
  while ((m = RICH.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const body = tok.slice(tok.startsWith('==') ? 2 : 1, tok.startsWith('==') ? -2 : -1);
    if (tok.startsWith('==')) out.push(<mark key={i} className="cc-hl">{body}</mark>);
    else if (tok.startsWith('*')) out.push(<strong key={i}>{body}</strong>);
    else out.push(<em key={i}>{body}</em>);
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
