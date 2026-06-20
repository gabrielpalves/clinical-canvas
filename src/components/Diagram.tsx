import { useId } from 'react';
import type { DiagramConfig } from '../types';

// ---------------------------------------------------------------------------
// text fitting helpers
// ---------------------------------------------------------------------------

/** Distribute words into at most `n` balanced lines. */
function wrapInto(words: string[], n: number): string[] {
  n = Math.min(n, words.length);
  if (n <= 1) return [words.join(' ')];
  const totalLen = words.join(' ').length;
  const target = totalLen / n;
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (cur && candidate.length > target && lines.length < n - 1) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Choose wrapping + font size so text fits a box of maxW × maxH. */
function fitLines(
  text: string,
  maxW: number,
  maxH: number,
  scale = 1,
  cap = 40,
): { lines: string[]; size: number } {
  const words = (text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return { lines: [''], size: 0 };
  let best = { size: 0, lines: [text] };
  for (let n = 1; n <= 3; n++) {
    const lines = wrapInto(words, n);
    const maxChars = Math.max(1, ...lines.map((l) => l.length));
    const widthSize = maxW / (maxChars * 0.56);
    const heightSize = maxH / (lines.length * 1.16);
    const size = Math.min(widthSize, heightSize);
    if (size > best.size) best = { size, lines };
  }
  return { lines: best.lines, size: Math.max(10, Math.min(cap, best.size * scale)) };
}

function Lines({
  x,
  y,
  lines,
  size,
  className,
  anchor = 'middle',
}: {
  x: number;
  y: number;
  lines: string[];
  size: number;
  className: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  if (size <= 0) return null;
  const lh = size * 1.16;
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} className={className} dominantBaseline="middle">
      {lines.map((ln, i) => (
        <tspan key={i} x={x} dy={i === 0 ? -((lines.length - 1) * lh) / 2 : lh}>
          {ln}
        </tspan>
      ))}
    </text>
  );
}

/** Fit text inside a circle of radius r centered at (x,y). */
function CircleText({ x, y, text, r, scale, className }: { x: number; y: number; text: string; r: number; scale: number; className: string }) {
  const { lines, size } = fitLines(text, r * 1.75, r * 1.55, scale, 40);
  return <Lines x={x} y={y} lines={lines} size={size} className={className} />;
}

const polar = (cx: number, cy: number, deg: number, r: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];

// ---------------------------------------------------------------------------
// diagram renderers
// ---------------------------------------------------------------------------

function Matrix({ c, mid }: { c: DiagramConfig; mid: string }) {
  const ax = c.showAxes;
  const gx = ax ? 150 : 90;
  const gy = 70;
  const gs = ax ? 500 : 540;
  const half = gs / 2;
  const cx = gx + half;
  const cy = gy + half;
  const vbH = ax ? 700 : gy + gs + 40;
  const q = (col: number, row: number) =>
    fitLines(c.quadrants[row * 2 + col], half * 0.86, half * 0.7, c.labelScale, 30);
  const cells: Array<{ x: number; y: number; i: number }> = [
    { x: gx + half * 0.5, y: gy + half * 0.5, i: 0 },
    { x: gx + half * 1.5, y: gy + half * 0.5, i: 1 },
    { x: gx + half * 0.5, y: gy + half * 1.5, i: 2 },
    { x: gx + half * 1.5, y: gy + half * 1.5, i: 3 },
  ];
  return (
    <svg viewBox={`0 0 720 ${vbH}`} className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${mid}-a`} markerWidth="12" markerHeight="12" refX="7" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11 Z" className="cc-dia-arrow" />
        </marker>
      </defs>
      {ax && <rect x={cx} y={gy} width={half} height={half} className="cc-dia-area" fillOpacity="0.1" />}
      <rect x={gx} y={gy} width={gs} height={gs} className="cc-dia-line" />
      <line x1={cx} y1={gy} x2={cx} y2={gy + gs} className="cc-dia-line" />
      <line x1={gx} y1={cy} x2={gx + gs} y2={cy} className="cc-dia-line" />
      {cells.map((cell) => {
        const { lines, size } = q(cell.i % 2, Math.floor(cell.i / 2));
        return <Lines key={cell.i} x={cell.x} y={cell.y} lines={lines} size={size} className="cc-dia-quad" />;
      })}
      {ax && (
        <>
          <line x1={gx} y1={gy + gs + 42} x2={gx + gs} y2={gy + gs + 42} className="cc-dia-line--accent" markerEnd={`url(#${mid}-a)`} />
          <line x1={gx - 40} y1={gy + gs} x2={gx - 40} y2={gy} className="cc-dia-line--accent" markerEnd={`url(#${mid}-a)`} />
          <Lines x={cx} y={gy + gs + 86} lines={fitLines(c.xLabel, gs, 60, c.labelScale, 26).lines} size={fitLines(c.xLabel, gs, 60, c.labelScale, 26).size} className="cc-dia-axis" />
          <text x={gx - 84} y={cy} fontSize={24 * c.labelScale} textAnchor="middle" className="cc-dia-axis" transform={`rotate(-90 ${gx - 84} ${cy})`}>
            {c.yLabel}
          </text>
        </>
      )}
    </svg>
  );
}

function Venn({ c }: { c: DiagramConfig }) {
  if (c.vennCircles === 3) {
    const cx = 360;
    const cy = 300;
    const r = 140 * c.circleScale;
    const cd = r * 0.9;
    const [ax, ay] = polar(cx, cy, -90, cd);
    const [bx, by] = polar(cx, cy, 150, cd);
    const [dx, dy] = polar(cx, cy, 30, cd);
    return (
      <svg viewBox="0 0 720 600" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
        <circle cx={ax} cy={ay} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
        <circle cx={bx} cy={by} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
        <circle cx={dx} cy={dy} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
        <CircleText x={ax} y={ay - r * 0.45} text={c.setA} r={r * 0.7} scale={c.labelScale} className="cc-dia-quad" />
        <CircleText x={bx - r * 0.4} y={by + r * 0.4} text={c.setB} r={r * 0.7} scale={c.labelScale} className="cc-dia-quad" />
        <CircleText x={dx + r * 0.4} y={dy + r * 0.4} text={c.setC} r={r * 0.7} scale={c.labelScale} className="cc-dia-quad" />
        <CircleText x={cx} y={cy + r * 0.18} text={c.overlap} r={r * 0.5} scale={c.labelScale} className="cc-dia-label" />
      </svg>
    );
  }
  const r = 185 * c.circleScale;
  const cy = 250;
  const d = r * (2 - c.vennOverlap * 1.35); // distance between centers
  const cxA = 360 - d / 2;
  const cxB = 360 + d / 2;
  const overlapW = Math.max(60, 2 * r - d);
  return (
    <svg viewBox="0 0 720 520" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <circle cx={cxA} cy={cy} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      <circle cx={cxB} cy={cy} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      <CircleText x={cxA - (2 * r - d) / 2} y={cy} text={c.setA} r={r * 0.82} scale={c.labelScale} className="cc-dia-quad" />
      <CircleText x={cxB + (2 * r - d) / 2} y={cy} text={c.setB} r={r * 0.82} scale={c.labelScale} className="cc-dia-quad" />
      {d < 2 * r && (
        <Lines
          x={360}
          y={cy}
          {...fitLines(c.overlap, overlapW * 0.9, r * 1.2, c.labelScale, 26)}
          className="cc-dia-label"
        />
      )}
    </svg>
  );
}

function Distribution({ c, mid }: { c: DiagramConfig; mid: string }) {
  const x0 = 110;
  const x1 = 640;
  const base = 400;
  const peakY = 118;
  const xAt = (t: number) => x0 + t * (x1 - x0);
  const yAt = (t: number) => base - (base - peakY) * Math.exp(-((t - 0.5) ** 2) / (2 * 0.0265));
  const curve = `M${x0},${base} C 250,${base} 275,135 375,${peakY} C 475,135 ${x1 - 110},${base} ${x1},${base}`;
  const partial = c.regionStart > 0.001 || c.regionEnd < 0.999;
  const rs = Math.min(c.regionStart, c.regionEnd);
  const re = Math.max(c.regionStart, c.regionEnd);
  const rcx = xAt((rs + re) / 2);
  const markerY = Math.max(70, yAt((rs + re) / 2) - 30);
  return (
    <svg viewBox="0 0 720 480" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${mid}-a`} markerWidth="12" markerHeight="12" refX="7" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11 Z" className="cc-dia-arrow" />
        </marker>
        <clipPath id={`${mid}-clip`}>
          <rect x={xAt(rs)} y="0" width={Math.max(0, xAt(re) - xAt(rs))} height="480" />
        </clipPath>
      </defs>
      <path d={`${curve} L${x0},${base} Z`} className="cc-dia-area" fillOpacity="0.14" stroke="none" clipPath={`url(#${mid}-clip)`} />
      <path d={curve} className="cc-dia-line--accent" />
      {partial ? (
        <>
          <line x1={xAt(rs)} y1={base} x2={xAt(rs)} y2={yAt(rs)} className="cc-dia-dash" />
          <line x1={xAt(re)} y1={base} x2={xAt(re)} y2={yAt(re)} className="cc-dia-dash" />
        </>
      ) : (
        <line x1={xAt(0.5)} y1={base} x2={xAt(0.5)} y2={peakY + 16} className="cc-dia-dash" />
      )}
      <Lines x={partial ? rcx : xAt(0.5)} y={markerY} {...fitLines(c.marker, 260, 60, c.labelScale, 26)} className="cc-dia-label" />
      <line x1={x0} y1={base} x2={x1 + 28} y2={base} className="cc-dia-line" markerEnd={`url(#${mid}-a)`} />
      <line x1={x0} y1={base} x2={x0} y2="72" className="cc-dia-line" markerEnd={`url(#${mid}-a)`} />
      <Lines x={(x0 + x1) / 2} y={450} {...fitLines(c.xLabel, x1 - x0, 50, c.labelScale, 24)} className="cc-dia-axis" />
      <text x={52} y={236} fontSize={24 * c.labelScale} textAnchor="middle" className="cc-dia-axis" transform="rotate(-90 52 236)">
        {c.yLabel}
      </text>
    </svg>
  );
}

function Cycle({ c, mid }: { c: DiagramConfig; mid: string }) {
  const nodes = c.nodes.length >= 3 ? c.nodes : [...c.nodes, 'Nó', 'Nó', 'Nó'].slice(0, 3);
  const N = nodes.length;
  const cx = 360;
  const cy = 360;
  const R = 236;
  const baseR = N <= 3 ? 96 : N === 4 ? 88 : N === 5 ? 80 : 72;
  const rn = baseR * c.circleScale;
  const Ra = R + 14;
  const gapDeg = ((rn + 14) / Ra) * (180 / Math.PI);
  const step = 360 / N;
  const startAngle = -90;
  const arc = (i: number) => {
    const a1 = startAngle + i * step + gapDeg;
    const a2 = startAngle + (i + 1) * step - gapDeg;
    const [x1, y1] = polar(cx, cy, a1, Ra);
    const [x2, y2] = polar(cx, cy, a2, Ra);
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A ${Ra} ${Ra} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };
  return (
    <svg viewBox="0 0 720 720" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${mid}-a`} markerWidth="13" markerHeight="13" refX="7" refY="6.5" orient="auto">
          <path d="M1,1 L12,6.5 L1,12 Z" className="cc-dia-arrow" />
        </marker>
      </defs>
      {nodes.map((_, i) => (
        <path key={`arc${i}`} d={arc(i)} className="cc-dia-line--accent" fill="none" markerEnd={`url(#${mid}-a)`} />
      ))}
      {nodes.map((label, i) => {
        const [nx, ny] = polar(cx, cy, startAngle + i * step, R);
        return (
          <g key={`node${i}`}>
            <circle cx={nx} cy={ny} r={rn} className="cc-dia-line cc-dia-area" fillOpacity="0.14" />
            <CircleText x={nx} y={ny} text={label} r={rn} scale={c.labelScale} className="cc-dia-quad" />
          </g>
        );
      })}
    </svg>
  );
}

export function Diagram({ config }: { config: DiagramConfig }) {
  const mid = useId().replace(/:/g, '');
  switch (config.type) {
    case 'matrix':
      return <Matrix c={config} mid={mid} />;
    case 'venn':
      return <Venn c={config} />;
    case 'distribution':
      return <Distribution c={config} mid={mid} />;
    case 'cycle':
      return <Cycle c={config} mid={mid} />;
    default:
      return null;
  }
}
