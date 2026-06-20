import type { Decoration, DecorationKind } from '../types';

const COLOR: Record<Decoration['color'], string> = {
  accent: 'var(--cc-accent)',
  heading: 'var(--cc-heading)',
  muted: 'var(--cc-muted)',
};

/** Shapes are authored in a 100×100 box centered on the origin. */
function Shape({ kind, filled }: { kind: DecorationKind; filled: boolean }) {
  const fill = filled ? 'currentColor' : 'none';
  const stroke = filled ? 'none' : 'currentColor';
  const sw = 3;
  switch (kind) {
    case 'circle':
      return <circle r={48} fill={fill} stroke={stroke} strokeWidth={sw} />;
    case 'ring':
      return <circle r={46} fill="none" stroke="currentColor" strokeWidth={sw} />;
    case 'triangle':
      return <polygon points="0,-50 44,32 -44,32" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case 'line':
      return <line x1={-50} y1={0} x2={50} y2={0} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />;
    case 'arrow':
      return <path d="M-50,0 H40 M40,0 L24,-12 M40,0 L24,12" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
    case 'plus':
      return <path d="M0,-46 V46 M-46,0 H46" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />;
    case 'asterisk':
      return <path d="M-46,0 H46 M-23,-40 L23,40 M-23,40 L23,-40" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />;
    case 'leaf':
      return <path d="M0,-50 C30,-28 30,28 0,50 C-30,28 -30,-28 0,-50 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
    case 'blobA':
      return <path d="M0,-48 C28,-50 52,-26 46,2 C40,30 18,50 -8,46 C-36,42 -52,18 -44,-12 C-38,-36 -24,-46 0,-48 Z" fill={fill} stroke={stroke} strokeWidth={sw} />;
    case 'blobB':
      return <path d="M-6,-46 C24,-52 50,-30 48,-2 C46,26 30,52 0,48 C-30,44 -50,22 -46,-8 C-43,-34 -28,-42 -6,-46 Z" fill={fill} stroke={stroke} strokeWidth={sw} />;
    default:
      return null;
  }
}

export function Decorations({
  decorations,
  w,
  h,
  className,
}: {
  decorations: Decoration[];
  w: number;
  h: number;
  className: string;
}) {
  if (!decorations.length) return null;
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {decorations.map((d) => (
        <g
          key={d.id}
          transform={`translate(${d.x * w} ${d.y * h}) rotate(${d.rotation}) scale(${(d.size * w) / 100})`}
          style={{ color: COLOR[d.color], opacity: d.opacity }}
        >
          <Shape kind={d.kind} filled={d.filled} />
        </g>
      ))}
    </svg>
  );
}
