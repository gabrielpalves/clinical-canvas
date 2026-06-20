import { useId } from 'react';
import type { DiagramConfig } from '../types';

/** Split a label into up to 3 balanced lines for use inside an SVG. */
function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function SvgText({
  x,
  y,
  text,
  size,
  className,
  anchor = 'middle',
  max = 16,
}: {
  x: number;
  y: number;
  text: string;
  size: number;
  className: string;
  anchor?: 'start' | 'middle' | 'end';
  max?: number;
}) {
  const lines = wrap(text, max);
  const lh = size * 1.15;
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

function Matrix({ c }: { c: DiagramConfig }) {
  const id = useId();
  return (
    <svg viewBox="0 0 720 700" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${id}-a`} markerWidth="12" markerHeight="12" refX="7" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11 Z" className="cc-dia-arrow" />
        </marker>
      </defs>
      {/* ideal quadrant tint */}
      <rect x="400" y="70" width="250" height="250" className="cc-dia-area" fillOpacity="0.1" />
      {/* frame + cross */}
      <rect x="150" y="70" width="500" height="500" className="cc-dia-line" />
      <line x1="400" y1="70" x2="400" y2="570" className="cc-dia-line" />
      <line x1="150" y1="320" x2="650" y2="320" className="cc-dia-line" />
      {/* quadrant labels */}
      <SvgText x={275} y={195} text={c.quadrants[0]} size={26} className="cc-dia-quad" max={13} />
      <SvgText x={525} y={195} text={c.quadrants[1]} size={26} className="cc-dia-quad" max={13} />
      <SvgText x={275} y={445} text={c.quadrants[2]} size={26} className="cc-dia-quad" max={13} />
      <SvgText x={525} y={445} text={c.quadrants[3]} size={26} className="cc-dia-quad" max={13} />
      {/* axes */}
      <line x1="150" y1="612" x2="650" y2="612" className="cc-dia-line--accent" markerEnd={`url(#${id}-a)`} />
      <line x1="112" y1="570" x2="112" y2="70" className="cc-dia-line--accent" markerEnd={`url(#${id}-a)`} />
      <SvgText x={400} y={660} text={c.xLabel} size={24} className="cc-dia-axis" max={40} />
      <text x={66} y={320} fontSize={24} textAnchor="middle" className="cc-dia-axis" transform="rotate(-90 66 320)">
        {c.yLabel}
      </text>
    </svg>
  );
}

function Venn({ c }: { c: DiagramConfig }) {
  return (
    <svg viewBox="0 0 720 480" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <circle cx="285" cy="240" r="185" className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      <circle cx="435" cy="240" r="185" className="cc-dia-line cc-dia-area" fillOpacity="0.12" />
      <SvgText x={195} y={240} text={c.setA} size={28} className="cc-dia-quad" max={12} />
      <SvgText x={525} y={240} text={c.setB} size={28} className="cc-dia-quad" max={12} />
      <SvgText x={360} y={240} text={c.overlap} size={24} className="cc-dia-label" max={11} />
    </svg>
  );
}

function Distribution({ c }: { c: DiagramConfig }) {
  const id = useId();
  const curve = 'M110,400 C 250,400 275,135 375,118 C 475,135 500,400 640,400';
  return (
    <svg viewBox="0 0 720 480" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${id}-a`} markerWidth="12" markerHeight="12" refX="7" refY="6" orient="auto">
          <path d="M1,1 L11,6 L1,11 Z" className="cc-dia-arrow" />
        </marker>
      </defs>
      <path d={`${curve} L110,400 Z`} className="cc-dia-area" fillOpacity="0.12" stroke="none" />
      <path d={curve} className="cc-dia-line--accent" />
      <line x1="375" y1="400" x2="375" y2="138" className="cc-dia-dash" />
      <SvgText x={375} y={96} text={c.marker} size={24} className="cc-dia-label" max={22} />
      {/* axes */}
      <line x1="90" y1="400" x2="668" y2="400" className="cc-dia-line" markerEnd={`url(#${id}-a)`} />
      <line x1="90" y1="400" x2="90" y2="72" className="cc-dia-line" markerEnd={`url(#${id}-a)`} />
      <SvgText x={379} y={450} text={c.xLabel} size={24} className="cc-dia-axis" max={44} />
      <text x={52} y={236} fontSize={24} textAnchor="middle" className="cc-dia-axis" transform="rotate(-90 52 236)">
        {c.yLabel}
      </text>
    </svg>
  );
}

function Cycle({ c }: { c: DiagramConfig }) {
  const id = useId();
  const cx = 360;
  const cy = 360;
  const R = 232; // node-center radius
  const rn = 96; // node radius
  const Ra = 250; // arrow radius
  const polar = (deg: number, r = R): [number, number] => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ];
  const angles = [-90, 30, 150]; // top, bottom-right, bottom-left
  const nodes = c.nodes;
  // clockwise arrows: top→BR, BR→BL, BL→top
  const arc = (from: number, to: number) => {
    const gap = 26;
    const [x1, y1] = polar(from + gap, Ra);
    const [x2, y2] = polar(to - gap, Ra);
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A ${Ra} ${Ra} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };
  return (
    <svg viewBox="0 0 720 720" className="cc-dia" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id={`${id}-a`} markerWidth="13" markerHeight="13" refX="7" refY="6.5" orient="auto">
          <path d="M1,1 L12,6.5 L1,12 Z" className="cc-dia-arrow" />
        </marker>
      </defs>
      <path d={arc(-90, 30)} className="cc-dia-line--accent" fill="none" markerEnd={`url(#${id}-a)`} />
      <path d={arc(30, 150)} className="cc-dia-line--accent" fill="none" markerEnd={`url(#${id}-a)`} />
      <path d={arc(150, 270)} className="cc-dia-line--accent" fill="none" markerEnd={`url(#${id}-a)`} />
      {angles.map((a, i) => {
        const [nx, ny] = polar(a);
        return (
          <g key={i}>
            <circle cx={nx} cy={ny} r={rn} className="cc-dia-line cc-dia-area" fillOpacity="0.14" />
            <SvgText x={nx} y={ny} text={nodes[i]} size={26} className="cc-dia-quad" max={11} />
          </g>
        );
      })}
    </svg>
  );
}

export function Diagram({ config }: { config: DiagramConfig }) {
  switch (config.type) {
    case 'matrix':
      return <Matrix c={config} />;
    case 'venn':
      return <Venn c={config} />;
    case 'distribution':
      return <Distribution c={config} />;
    case 'cycle':
      return <Cycle c={config} />;
    default:
      return null;
  }
}
