import type { Decoration, DecorationKind } from '../types';

/** Decoration colours resolved to literal hex. Baked straight onto the SVG
 *  fill/stroke attributes so the colour always survives html-to-image export
 *  (CSS vars / currentColor / inherited fill do NOT export reliably). */
const HEX: Record<Decoration['color'], string> = {
  accent: '#bfa065',
  heading: '#5d4037',
  muted: '#9a8c7e',
  gold: '#bfa065',
  brown: '#5d4037',
  wine: '#682d36',
  blue: '#131736',
  cream: '#faf7f0',
};

/** Shapes that can be filled; the rest are always stroked (line/arrow/etc.). */
const FILLABLE = new Set<DecorationKind>([
  'heart',
  'circle',
  'triangle',
  'leaf',
  'blobA',
  'blobB',
  'comment',
  'share',
  'bookmark',
]);

/** Shapes are authored in a 100×100 box centered on the origin. */
function Shape({ kind, fill, stroke }: { kind: DecorationKind; fill: string; stroke: string }) {
  const p = { fill, stroke, strokeWidth: 3 };
  switch (kind) {
    case 'circle':
      return <circle r={48} {...p} />;
    case 'ring':
      return <circle r={46} {...p} />;
    case 'triangle':
      return <polygon points="0,-50 44,32 -44,32" strokeLinejoin="round" {...p} />;
    case 'line':
      return <line x1={-50} y1={0} x2={50} y2={0} strokeLinecap="round" {...p} />;
    case 'arrow':
      return <path d="M-50,0 H40 M40,0 L24,-12 M40,0 L24,12" strokeLinecap="round" strokeLinejoin="round" {...p} />;
    case 'plus':
      return <path d="M0,-46 V46 M-46,0 H46" strokeLinecap="round" {...p} />;
    case 'asterisk':
      return <path d="M-46,0 H46 M-23,-40 L23,40 M-23,40 L23,-40" strokeLinecap="round" {...p} />;
    case 'leaf':
      return <path d="M0,-50 C30,-28 30,28 0,50 C-30,28 -30,-28 0,-50 Z" strokeLinejoin="round" {...p} />;
    case 'blobA':
      return <path d="M0,-48 C28,-50 52,-26 46,2 C40,30 18,50 -8,46 C-36,42 -52,18 -44,-12 C-38,-36 -24,-46 0,-48 Z" {...p} />;
    case 'blobB':
      return <path d="M-6,-46 C24,-52 50,-30 48,-2 C46,26 30,52 0,48 C-30,44 -50,22 -46,-8 C-43,-34 -28,-42 -6,-46 Z" {...p} />;
    case 'heart':
      return <path d="M0,44 C-10,33 -44,12 -44,-14 C-44,-30 -30,-42 -14,-34 C-6,-30 0,-22 0,-22 C0,-22 6,-30 14,-34 C30,-42 44,-30 44,-14 C44,12 10,33 0,44 Z" strokeLinejoin="round" {...p} />;
    case 'comment':
      return <path d="M-28,-36 H28 A14,14 0 0 1 42,-22 V8 A14,14 0 0 1 28,22 H-4 L-26,42 L-20,22 H-28 A14,14 0 0 1 -42,8 V-22 A14,14 0 0 1 -28,-36 Z" strokeLinejoin="round" {...p} />;
    case 'share':
      return <path d="M-44,-36 L44,0 L-44,36 L-44,8 L6,0 L-44,-8 Z" strokeLinejoin="round" {...p} />;
    case 'bookmark':
      return <path d="M-26,-40 L26,-40 L26,40 L0,22 L-26,40 Z" strokeLinejoin="round" {...p} />;
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
      {decorations.map((d) => {
        const col = HEX[d.color] ?? HEX.accent;
        const filled = FILLABLE.has(d.kind) && d.filled;
        return (
          <g
            key={d.id}
            transform={`translate(${d.x * w} ${d.y * h}) rotate(${d.rotation}) scale(${(d.size * w) / 100})`}
            style={{ opacity: d.opacity }}
          >
            <Shape kind={d.kind} fill={filled ? col : 'none'} stroke={filled ? 'none' : col} />
          </g>
        );
      })}
    </svg>
  );
}
