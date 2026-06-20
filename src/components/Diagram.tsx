import { useId } from 'react';
import type { DiagramConfig } from '../types';

// ---------------------------------------------------------------------------
// text helpers
// ---------------------------------------------------------------------------

function wrapInto(words: string[], n: number): string[] {
  n = Math.min(n, words.length);
  if (n <= 1) return [words.join(' ')];
  const target = words.join(' ').length / n;
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

/**
 * Auto-fit: wrap text and pick the largest size that fits maxW × maxH, capped so
 * defaults look tidy. The per-element multiplier is applied by the caller on top,
 * so the user can grow text past the cap on purpose.
 */
function fitLines(text: string, maxW: number, maxH: number, cap = 44): { lines: string[]; size: number } {
  const words = (text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return { lines: [''], size: 0 };
  let best = { size: 0, lines: [text] };
  for (let n = 1; n <= 3; n++) {
    const lines = wrapInto(words, n);
    const maxChars = Math.max(1, ...lines.map((l) => l.length));
    const size = Math.min(maxW / (maxChars * 0.56), maxH / (lines.length * 1.16));
    if (size > best.size) best = { size, lines };
  }
  return { lines: best.lines, size: Math.max(8, Math.min(cap, best.size)) };
}

function Lines({
  x,
  y,
  lines,
  size,
  className,
  anchor = 'middle',
  rotate = 0,
}: {
  x: number;
  y: number;
  lines: string[];
  size: number;
  className: string;
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
}) {
  if (size <= 0) return null;
  const lh = size * 1.16;
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      className={className}
      dominantBaseline="middle"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {lines.map((ln, i) => (
        <tspan key={i} x={x} dy={i === 0 ? -((lines.length - 1) * lh) / 2 : lh}>
          {ln}
        </tspan>
      ))}
    </text>
  );
}

function CircleText({ x, y, text, r, mult, className, rotate = 0 }: { x: number; y: number; text: string; r: number; mult: number; className: string; rotate?: number }) {
  const { lines, size } = fitLines(text, r * 1.75, r * 1.55);
  return <Lines x={x} y={y} lines={lines} size={size * mult} className={className} rotate={rotate} />;
}

const polar = (cx: number, cy: number, deg: number, r: number): [number, number] => [
  cx + r * Math.cos((deg * Math.PI) / 180),
  cy + r * Math.sin((deg * Math.PI) / 180),
];

/** per-element size multiplier */
const S = (c: DiagramConfig, key: string) => c.labelSizes[key] ?? 1;
/** per-element rotation in degrees */
const Rot = (c: DiagramConfig, key: string) => c.labelRots[key] ?? 0;

// ---------------------------------------------------------------------------
// renderers
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
  const cells = [
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
        const { lines, size } = fitLines(c.quadrants[cell.i], half * 0.86, half * 0.7);
        return <Lines key={cell.i} x={cell.x} y={cell.y} lines={lines} size={size * S(c, `q${cell.i}`)} className="cc-dia-quad" rotate={Rot(c, `q${cell.i}`)} />;
      })}
      {ax && (
        <>
          <line x1={gx} y1={gy + gs + 42} x2={gx + gs} y2={gy + gs + 42} className="cc-dia-line--accent" markerEnd={`url(#${mid}-a)`} />
          <line x1={gx - 40} y1={gy + gs} x2={gx - 40} y2={gy} className="cc-dia-line--accent" markerEnd={`url(#${mid}-a)`} />
          <Lines x={cx} y={gy + gs + 86} lines={fitLines(c.xLabel, gs, 60).lines} size={24 * S(c, 'xLabel')} className="cc-dia-axis" rotate={Rot(c, 'xLabel')} />
          <Lines x={gx - 84} y={cy} lines={[c.yLabel]} size={24 * S(c, 'yLabel')} className="cc-dia-axis" rotate={-90 + Rot(c, 'yLabel')} />
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
        <CircleText x={ax} y={ay - r * 0.45} text={c.setA} r={r * 0.7} mult={S(c, 'setA')} className="cc-dia-quad" rotate={Rot(c, 'setA')} />
        <CircleText x={bx - r * 0.4} y={by + r * 0.4} text={c.setB} r={r * 0.7} mult={S(c, 'setB')} className="cc-dia-quad" rotate={Rot(c, 'setB')} />
        <CircleText x={dx + r * 0.4} y={dy + r * 0.4} text={c.setC} r={r * 0.7} mult={S(c, 'setC')} className="cc-dia-quad" rotate={Rot(c, 'setC')} />
        <CircleText x={cx} y={cy + r * 0.18} text={c.overlap} r={r * 0.5} mult={S(c, 'overlap')} className="cc-dia-label" rotate={Rot(c, 'overlap')} />
      </svg>
    );
  }
  const r = 185 * c.circleScale;
  const cy = 250;
  const d = r * (2 - c.vennOverlap * 1.35);
  const cxA = 360 - d / 2;
  const cxB = 360 + d / 2;
  const overlapW = Math.max(50, 2 * r - d);
  return (
    <svg viewBox="0 0 720 520" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <circle cx={cxA} cy={cy} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      <circle cx={cxB} cy={cy} r={r} className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      {/* labels are anchored to the circle centers so they follow the overlap */}
      <CircleText x={cxA - r * 0.4} y={cy} text={c.setA} r={r * 0.72} mult={S(c, 'setA')} className="cc-dia-quad" rotate={Rot(c, 'setA')} />
      <CircleText x={cxB + r * 0.4} y={cy} text={c.setB} r={r * 0.72} mult={S(c, 'setB')} className="cc-dia-quad" rotate={Rot(c, 'setB')} />
      {d < 2 * r && (
        <CircleText x={360} y={cy} text={c.overlap} r={overlapW * 0.5} mult={S(c, 'overlap')} className="cc-dia-label" rotate={Rot(c, 'overlap')} />
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
  const rs = Math.min(c.regionStart, c.regionEnd);
  const re = Math.max(c.regionStart, c.regionEnd);
  const partial = rs > 0.001 || re < 0.999;
  const rcx = xAt((rs + re) / 2);
  const markerY = Math.max(70, yAt((rs + re) / 2) - 30);
  const mk = fitLines(c.marker, 260, 60);
  const pk = fitLines(c.peak, 260, 60);
  const xl = fitLines(c.xLabel, x1 - x0, 50);
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
      {/* peak label fixed at the top of the curve */}
      <Lines x={xAt(0.5)} y={peakY - 26} lines={pk.lines} size={Math.min(26, pk.size) * S(c, 'peak')} className="cc-dia-label" rotate={Rot(c, 'peak')} />
      {/* region label over the highlighted band */}
      {partial && (
        <Lines x={rcx} y={markerY} lines={mk.lines} size={Math.min(26, mk.size) * S(c, 'marker')} className="cc-dia-label" rotate={Rot(c, 'marker')} />
      )}
      <line x1={x0} y1={base} x2={x1 + 28} y2={base} className="cc-dia-line" markerEnd={`url(#${mid}-a)`} />
      <line x1={x0} y1={base} x2={x0} y2="72" className="cc-dia-line" markerEnd={`url(#${mid}-a)`} />
      <Lines x={(x0 + x1) / 2} y={450} lines={xl.lines} size={24 * S(c, 'xLabel')} className="cc-dia-axis" rotate={Rot(c, 'xLabel')} />
      <Lines x={52} y={236} lines={[c.yLabel]} size={24 * S(c, 'yLabel')} className="cc-dia-axis" rotate={-90 + Rot(c, 'yLabel')} />
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
  const start = -90;
  const arc = (i: number) => {
    const [x1, y1] = polar(cx, cy, start + i * step + gapDeg, Ra);
    const [x2, y2] = polar(cx, cy, start + (i + 1) * step - gapDeg, Ra);
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
        const [nx, ny] = polar(cx, cy, start + i * step, R);
        return (
          <g key={`node${i}`}>
            <circle cx={nx} cy={ny} r={rn} className="cc-dia-line cc-dia-area" fillOpacity="0.14" />
            <CircleText x={nx} y={ny} text={label} r={rn} mult={S(c, `n${i}`)} className="cc-dia-quad" rotate={Rot(c, `n${i}`)} />
          </g>
        );
      })}
    </svg>
  );
}

function Table({ c }: { c: DiagramConfig }) {
  const R = Math.max(1, c.rows);
  const C = Math.max(1, c.cols);
  const x0 = 40;
  const tableW = 640;
  const colW = tableW / C;
  const rowH = 96;
  const y0 = 30;
  const tableH = R * rowH;
  const mult = S(c, 'table');
  return (
    <svg viewBox={`0 0 720 ${y0 * 2 + tableH}`} className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      {c.header && <rect x={x0} y={y0} width={tableW} height={rowH} className="cc-dia-area" fillOpacity="0.12" />}
      {Array.from({ length: R }).map((_, r) =>
        Array.from({ length: C }).map((__, col) => {
          const text = c.cells[r * C + col] ?? '';
          const { lines, size } = fitLines(text, colW * 0.84, rowH * 0.66);
          const isHead = c.header && r === 0;
          return (
            <Lines
              key={`${r}-${col}`}
              x={x0 + colW * (col + 0.5)}
              y={y0 + rowH * (r + 0.5)}
              lines={lines}
              size={size * mult}
              className={isHead ? 'cc-dia-quad' : 'cc-dia-label'}
            />
          );
        }),
      )}
      {/* grid */}
      <rect x={x0} y={y0} width={tableW} height={tableH} className="cc-dia-line" />
      {Array.from({ length: R - 1 }).map((_, i) => (
        <line key={`h${i}`} x1={x0} y1={y0 + rowH * (i + 1)} x2={x0 + tableW} y2={y0 + rowH * (i + 1)} className="cc-dia-line" />
      ))}
      {Array.from({ length: C - 1 }).map((_, i) => (
        <line key={`v${i}`} x1={x0 + colW * (i + 1)} y1={y0} x2={x0 + colW * (i + 1)} y2={y0 + tableH} className="cc-dia-line" />
      ))}
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
    case 'table':
      return <Table c={config} />;
    default:
      return null;
  }
}
