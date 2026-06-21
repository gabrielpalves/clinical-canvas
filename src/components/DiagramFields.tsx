import { Plus, X } from 'lucide-react';
import type { DiagramConfig, DiagramType } from '../types';

const DIAGRAM_TYPES: Array<{ id: DiagramType; label: string }> = [
  { id: 'matrix', label: 'Matriz 2x2' },
  { id: 'venn', label: 'Venn' },
  { id: 'distribution', label: 'Distribuição' },
  { id: 'cycle', label: 'Ciclo' },
  { id: 'table', label: 'Tabela' },
];

export function DiagramFields({ dg, onChange }: { dg: DiagramConfig; onChange: (patch: Partial<DiagramConfig>) => void }) {
  const sz = (k: string) => dg.labelSizes[k] ?? 1;
  const setSize = (k: string, v: number) => onChange({ labelSizes: { ...dg.labelSizes, [k]: v } });
  const rot = (k: string) => dg.labelRots[k] ?? 0;
  const setRot = (k: string, v: number) => onChange({ labelRots: { ...dg.labelRots, [k]: v } });

  const ctrlRow = (icon: string, value: number, min: number, max: number, def: number, on: (v: number) => void, suffix = '') => {
    const apply = (v: number) => {
      if (!Number.isNaN(v)) on(Math.max(min, Math.min(max, v)));
    };
    return (
      <div className="size-row">
        <span className="size-row__icon" title="Clique duplo no controle = padrão">{icon}</span>
        <input type="range" min={min} max={max} value={value} onChange={(e) => apply(Number(e.target.value))} onDoubleClick={() => on(def)} />
        <input className="size-row__num" type="number" value={value} onChange={(e) => apply(Number(e.target.value))} />
        <span className="size-row__suffix">{suffix}</span>
      </div>
    );
  };
  const sizeRow = (key: string) => (
    <>
      {ctrlRow('A', Math.round(sz(key) * 100), 50, 220, 100, (v) => setSize(key, v / 100), '%')}
      {ctrlRow('⟳', Math.round(rot(key)), -90, 90, 0, (v) => setRot(key, v), '°')}
    </>
  );
  const posRows = (xv: number, yv: number, onX: (v: number) => void, onY: (v: number) => void) => (
    <>
      {ctrlRow('↔', Math.round(xv * 100), 0, 100, 50, (v) => onX(v / 100), '%')}
      {ctrlRow('↕', Math.round(yv * 100), 0, 100, 30, (v) => onY(v / 100), '%')}
    </>
  );
  const diaText = (label: string, value: string, on: (v: string) => void, key: string) => (
    <div className="field">
      <span className="field__label">{label}</span>
      <input className="input" value={value} onChange={(e) => on(e.target.value)} />
      {sizeRow(key)}
    </div>
  );

  return (
    <>
      <Field label="Tipo de diagrama">
        <div className="seg seg--wrap">
          {DIAGRAM_TYPES.map((t) => (
            <button key={t.id} className={`seg__btn${dg.type === t.id ? ' is-active' : ''}`} onClick={() => onChange({ type: t.id })}>
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      {dg.type === 'matrix' && (
        <>
          <label className="toggle">
            <input type="checkbox" checked={dg.showAxes} onChange={(e) => onChange({ showAxes: e.target.checked })} />
            <span>Mostrar eixos (desligado = tabela 2x2)</span>
          </label>
          {dg.showAxes && (
            <>
              {diaText('Eixo horizontal (X)', dg.xLabel, (v) => onChange({ xLabel: v }), 'xLabel')}
              {diaText('Eixo vertical (Y)', dg.yLabel, (v) => onChange({ yLabel: v }), 'yLabel')}
            </>
          )}
          {(['Sup. esquerda', 'Sup. direita', 'Inf. esquerda', 'Inf. direita'] as const).map((label, i) =>
            diaText(label, dg.quadrants[i], (v) => {
              const quadrants = [...dg.quadrants] as [string, string, string, string];
              quadrants[i] = v;
              onChange({ quadrants });
            }, `q${i}`),
          )}
        </>
      )}

      {dg.type === 'venn' && (
        <>
          <Field label="Número de círculos">
            <div className="seg">
              {([2, 3] as const).map((n) => (
                <button key={n} className={`seg__btn${dg.vennCircles === n ? ' is-active' : ''}`} onClick={() => onChange({ vennCircles: n })}>
                  {n} círculos
                </button>
              ))}
            </div>
          </Field>
          <Field label={`Tamanho dos círculos: ${Math.round(dg.circleScale * 100)}%`}>
            <input type="range" min={70} max={130} value={Math.round(dg.circleScale * 100)} onChange={(e) => onChange({ circleScale: Number(e.target.value) / 100 })} />
          </Field>
          {dg.vennCircles === 2 && (
            <Field label={`Sobreposição: ${Math.round(dg.vennOverlap * 100)}%`}>
              <input type="range" min={0} max={100} value={Math.round(dg.vennOverlap * 100)} onChange={(e) => onChange({ vennOverlap: Number(e.target.value) / 100 })} />
            </Field>
          )}
          {diaText('Conjunto A', dg.setA, (v) => onChange({ setA: v }), 'setA')}
          {diaText('Conjunto B', dg.setB, (v) => onChange({ setB: v }), 'setB')}
          {dg.vennCircles === 3 && diaText('Conjunto C', dg.setC, (v) => onChange({ setC: v }), 'setC')}
          {diaText('Interseção (centro)', dg.overlap, (v) => onChange({ overlap: v }), 'overlap')}
        </>
      )}

      {dg.type === 'distribution' && (
        <>
          {diaText('Eixo horizontal (X)', dg.xLabel, (v) => onChange({ xLabel: v }), 'xLabel')}
          {diaText('Eixo vertical (Y)', dg.yLabel, (v) => onChange({ yLabel: v }), 'yLabel')}
          {diaText('Texto do pico', dg.peak, (v) => onChange({ peak: v }), 'peak')}
          <span className="field__label">Posição do texto do pico</span>
          {posRows(dg.peakX, dg.peakY, (v) => onChange({ peakX: v }), (v) => onChange({ peakY: v }))}
          {diaText('Texto da área destacada', dg.marker, (v) => onChange({ marker: v }), 'marker')}
          <span className="field__label">Posição do texto da área</span>
          {posRows(dg.markerX, dg.markerY, (v) => onChange({ markerX: v }), (v) => onChange({ markerY: v }))}
          <Field label={`Início do destaque: ${Math.round(dg.regionStart * 100)}%`}>
            <input type="range" min={0} max={100} value={Math.round(dg.regionStart * 100)} onChange={(e) => onChange({ regionStart: Number(e.target.value) / 100 })} />
          </Field>
          <Field label={`Fim do destaque: ${Math.round(dg.regionEnd * 100)}%`}>
            <input type="range" min={0} max={100} value={Math.round(dg.regionEnd * 100)} onChange={(e) => onChange({ regionEnd: Number(e.target.value) / 100 })} />
          </Field>
        </>
      )}

      {dg.type === 'cycle' && (
        <>
          <Field label={`Tamanho dos círculos: ${Math.round(dg.circleScale * 100)}%`}>
            <input type="range" min={70} max={130} value={Math.round(dg.circleScale * 100)} onChange={(e) => onChange({ circleScale: Number(e.target.value) / 100 })} />
          </Field>
          <span className="field__label">Nós do ciclo (3 a 6)</span>
          {dg.nodes.map((n, i) => (
            <div className="dia-node" key={i}>
              <div className="items__row">
                <span className="items__num">{i + 1}</span>
                <input className="input" value={n} onChange={(e) => {
                  const nodes = [...dg.nodes];
                  nodes[i] = e.target.value;
                  onChange({ nodes });
                }} />
                {dg.nodes.length > 3 && (
                  <button className="icon-btn icon-btn--danger" title="Remover nó" onClick={() => onChange({ nodes: dg.nodes.filter((_, j) => j !== i) })}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {sizeRow(`n${i}`)}
            </div>
          ))}
          {dg.nodes.length < 6 && (
            <button className="btn btn--ghost btn--sm" onClick={() => onChange({ nodes: [...dg.nodes, 'Novo nó'] })}>
              <Plus size={14} /> Adicionar nó
            </button>
          )}
        </>
      )}

      {dg.type === 'table' && (
        <>
          <div className="seg-pair">
            <Field label={`Linhas: ${dg.rows}`}>
              <div className="seg">
                <button className="seg__btn" disabled={dg.rows <= 1} onClick={() => onChange({ rows: dg.rows - 1 })}>−</button>
                <button className="seg__btn" disabled={dg.rows >= 8} onClick={() => onChange({ rows: dg.rows + 1 })}>+</button>
              </div>
            </Field>
            <Field label={`Colunas: ${dg.cols}`}>
              <div className="seg">
                <button className="seg__btn" disabled={dg.cols <= 1} onClick={() => onChange({ cols: dg.cols - 1 })}>−</button>
                <button className="seg__btn" disabled={dg.cols >= 5} onClick={() => onChange({ cols: dg.cols + 1 })}>+</button>
              </div>
            </Field>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={dg.header} onChange={(e) => onChange({ header: e.target.checked })} />
            <span>Primeira linha como cabeçalho</span>
          </label>
          <Field label={`Tamanho do texto: ${Math.round(sz('table') * 100)}%`}>
            <input type="range" min={50} max={200} value={Math.round(sz('table') * 100)} onChange={(e) => setSize('table', Number(e.target.value) / 100)} />
          </Field>
          <div className="field">
            <span className="field__label">Células</span>
            <div className="dia-table" style={{ gridTemplateColumns: `repeat(${dg.cols}, 1fr)` }}>
              {Array.from({ length: dg.rows * dg.cols }).map((_, idx) => (
                <input key={idx} className="input input--cell" value={dg.cells[idx] ?? ''} onChange={(e) => {
                  const cells = Array.from({ length: dg.rows * dg.cols }, (_, k) => dg.cells[k] ?? '');
                  cells[idx] = e.target.value;
                  onChange({ cells });
                }} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}
