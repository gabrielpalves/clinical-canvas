import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ImagePlus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { LAYOUTS, LAYOUT_MAP } from '../designModes';
import { bandForSlide, fileToDataUrl } from '../lib/helpers';
import type {
  BackgroundStyle,
  DecorationKind,
  DiagramConfig,
  DiagramType,
  ElementAlign,
  ImagePlacement,
  LayoutId,
  Slide,
  SlideContent,
  SlideLayers,
  TextAlign,
  VerticalAnchor,
} from '../types';
import { defaultDecoration, defaultImage, uid } from '../state/factory';
import { DecorationEditor } from './DecorationEditor';

const BACKGROUNDS: Array<{ id: BackgroundStyle; label: string }> = [
  { id: 'solid', label: 'Sólido' },
  { id: 'soft', label: 'Suave' },
  { id: 'gradient', label: 'Gradiente' },
];

const ALIGNS: Array<{ id: TextAlign; label: string }> = [
  { id: 'left', label: 'Esquerda' },
  { id: 'center', label: 'Centro' },
  { id: 'right', label: 'Direita' },
];

const ANCHORS: Array<{ id: VerticalAnchor; label: string }> = [
  { id: 'top', label: 'Topo' },
  { id: 'center', label: 'Meio' },
  { id: 'bottom', label: 'Base' },
];

const PLACEMENTS: Array<{ id: ImagePlacement; label: string }> = [
  { id: 'background', label: 'Fundo' },
  { id: 'left', label: 'Esquerda' },
  { id: 'right', label: 'Direita' },
  { id: 'top', label: 'Topo' },
  { id: 'bottom', label: 'Base' },
];

const DIAGRAM_TYPES: Array<{ id: DiagramType; label: string }> = [
  { id: 'matrix', label: 'Matriz 2x2' },
  { id: 'venn', label: 'Venn' },
  { id: 'distribution', label: 'Distribuição' },
  { id: 'cycle', label: 'Ciclo' },
  { id: 'table', label: 'Tabela' },
];

const DECORATIONS: Array<{ id: DecorationKind; label: string }> = [
  { id: 'blobA', label: 'Forma 1' },
  { id: 'blobB', label: 'Forma 2' },
  { id: 'leaf', label: 'Folha' },
  { id: 'circle', label: 'Círculo' },
  { id: 'ring', label: 'Anel' },
  { id: 'triangle', label: 'Triângulo' },
  { id: 'line', label: 'Linha' },
  { id: 'arrow', label: 'Seta' },
  { id: 'plus', label: 'Cruz' },
  { id: 'asterisk', label: 'Asterisco' },
];

const EYEBROW_ALIGNS: Array<{ id: ElementAlign; label: string }> = [
  { id: 'inherit', label: 'Igual ao slide' },
  { id: 'left', label: 'Esq.' },
  { id: 'center', label: 'Centro' },
  { id: 'right', label: 'Dir.' },
];

const LAYER_LABELS: Array<{ key: keyof SlideLayers; label: string }> = [
  { key: 'eyebrow', label: 'Selo (eyebrow)' },
  { key: 'backgroundAccents', label: 'Acentos de fundo' },
  { key: 'decorativeMark', label: 'Aspas decorativas' },
  { key: 'reference', label: 'Rodapé "REF:"' },
  { key: 'pagination', label: 'Numeração' },
  { key: 'logo', label: 'Assinatura / @' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

export function Inspector() {
  const { carousel, selectedSlide, dispatch } = useCarousel();
  const fileRef = useRef<HTMLInputElement>(null);
  const bandFileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  if (!selectedSlide) {
    return <aside className="inspector inspector--empty">Selecione um slide para editar.</aside>;
  }

  const slide: Slide = selectedSlide;
  const idx = carousel.slides.findIndex((s) => s.id === slide.id);
  const total = carousel.slides.length;
  const meta = LAYOUT_MAP[slide.layout];
  const fields = new Set(meta.fields);
  const usesEyebrow = fields.has('eyebrow');
  const c = slide.content;
  const img = slide.image;
  const dg = slide.diagram;
  const setDg = (patch: Partial<DiagramConfig>) =>
    dispatch({ type: 'updateDiagram', id: slide.id, patch });
  const sz = (k: string) => dg.labelSizes[k] ?? 1;
  const setSize = (k: string, v: number) =>
    setDg({ labelSizes: { ...dg.labelSizes, [k]: v } });
  const rot = (k: string) => dg.labelRots[k] ?? 0;
  const setRot = (k: string, v: number) =>
    setDg({ labelRots: { ...dg.labelRots, [k]: v } });

  const sizeRow = (key: string) => (
    <>
      <div className="size-row">
        <span className="size-row__icon">A</span>
        <input type="range" min={50} max={220} value={Math.round(sz(key) * 100)}
          onChange={(e) => setSize(key, Number(e.target.value) / 100)} />
        <span className="size-row__val">{Math.round(sz(key) * 100)}%</span>
      </div>
      <div className="size-row">
        <span className="size-row__icon">⟳</span>
        <input type="range" min={-90} max={90} value={Math.round(rot(key))}
          onChange={(e) => setRot(key, Number(e.target.value))} />
        <span className="size-row__val">{Math.round(rot(key))}°</span>
      </div>
    </>
  );

  /** a diagram text input paired with its own size + rotation sliders */
  const diaText = (label: string, value: string, onChange: (v: string) => void, sizeKey: string) => (
    <div className="field">
      <span className="field__label">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      {sizeRow(sizeKey)}
    </div>
  );

  const setContent = (patch: Partial<SlideContent>) =>
    dispatch({ type: 'updateContent', id: slide.id, patch });
  const setLayer = (key: keyof SlideLayers, value: boolean) =>
    dispatch({ type: 'updateLayers', id: slide.id, patch: { [key]: value } });
  const setSlide = (
    patch: Partial<
      Pick<Slide, 'layout' | 'align' | 'background' | 'contentAnchor' | 'eyebrowAlign' | 'eyebrowPlacement'>
    >,
  ) => dispatch({ type: 'updateSlide', id: slide.id, patch });

  const onUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const src = await fileToDataUrl(file);
      // keep current placement if replacing, else default to background
      dispatch({
        type: 'setImage',
        id: slide.id,
        image: img ? { ...img, src } : defaultImage(src, 'background'),
      });
    }
    e.target.value = '';
  };

  const onUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch({ type: 'setMeta', patch: { logoSrc: await fileToDataUrl(file) } });
    e.target.value = '';
  };

  const setPlacement = (placement: ImagePlacement) => {
    if (!img) return;
    const patch: Partial<typeof img> = { placement };
    // make a background image readable by default
    if (placement === 'background' && img.overlay === 0) patch.overlay = 0.35;
    dispatch({ type: 'updateImage', id: slide.id, patch });
  };

  const band = bandForSlide(carousel, slide.id);
  const slidesAfter = total - idx; // includes current

  const onCreateBand = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);
    const slideIds = carousel.slides.slice(idx, idx + 2).map((s) => s.id);
    if (slideIds.length < 2) {
      e.target.value = '';
      return;
    }
    dispatch({
      type: 'addBand',
      band: { id: uid(), src, slideIds, position: 'center', heightRatio: 0.62, opacity: 1 },
    });
    e.target.value = '';
  };

  const updateBandSpan = (span: number) => {
    if (!band) return;
    const slideIds = carousel.slides.slice(idx, idx + span).map((s) => s.id);
    dispatch({ type: 'updateBand', id: band.band.id, patch: { slideIds } });
  };

  return (
    <aside className="inspector">
      {/* header / actions */}
      <div className="inspector__head">
        <div>
          <p className="inspector__eyebrow">Slide {idx + 1} de {total}</p>
          <h2 className="inspector__title">{meta.name}</h2>
        </div>
        <div className="inspector__actions">
          <button className="icon-btn" title="Mover para a esquerda" disabled={idx === 0}
            onClick={() => dispatch({ type: 'moveSlide', id: slide.id, dir: -1 })}>
            <ArrowLeft size={16} />
          </button>
          <button className="icon-btn" title="Mover para a direita" disabled={idx === total - 1}
            onClick={() => dispatch({ type: 'moveSlide', id: slide.id, dir: 1 })}>
            <ArrowRight size={16} />
          </button>
          <button className="icon-btn" title="Duplicar"
            onClick={() => dispatch({ type: 'duplicateSlide', id: slide.id })}>
            <Copy size={16} />
          </button>
          <button className="icon-btn icon-btn--danger" title="Excluir" disabled={total <= 1}
            onClick={() => dispatch({ type: 'deleteSlide', id: slide.id })}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* layout */}
      <section className="inspector__section">
        <h3 className="section__title">Layout</h3>
        <div className="chip-row">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              className={`chip${slide.layout === l.id ? ' is-active' : ''}`}
              onClick={() => dispatch({ type: 'updateSlide', id: slide.id, patch: { layout: l.id as LayoutId } })}
            >
              {l.name}
            </button>
          ))}
        </div>
      </section>

      {/* style + positioning */}
      <section className="inspector__section">
        <h3 className="section__title">Estilo & posição</h3>
        <Field label="Alinhamento do texto">
          <div className="seg">
            {ALIGNS.map((a) => (
              <button key={a.id} className={`seg__btn${slide.align === a.id ? ' is-active' : ''}`}
                onClick={() => setSlide({ align: a.id })}>
                {a.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Posição vertical do texto">
          <div className="seg">
            {ANCHORS.map((a) => (
              <button key={a.id} className={`seg__btn${slide.contentAnchor === a.id ? ' is-active' : ''}`}
                onClick={() => setSlide({ contentAnchor: a.id })}>
                {a.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Fundo">
          <div className="seg">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} className={`seg__btn${slide.background === b.id ? ' is-active' : ''}`}
                onClick={() => setSlide({ background: b.id })}>
                {b.label}
              </button>
            ))}
          </div>
        </Field>
        <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'resetSlide', id: slide.id })}>
          <RotateCcw size={14} /> Restaurar padrão do slide
        </button>
      </section>

      {/* eyebrow positioning */}
      {usesEyebrow && (
        <section className="inspector__section">
          <h3 className="section__title">Selo (eyebrow)</h3>
          <Field label="Posição">
            <div className="seg">
              {(['inline', 'top'] as const).map((p) => (
                <button key={p} className={`seg__btn${slide.eyebrowPlacement === p ? ' is-active' : ''}`}
                  onClick={() => setSlide({ eyebrowPlacement: p })}>
                  {p === 'inline' ? 'Junto ao texto' : 'Topo do slide'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Alinhamento do selo">
            <div className="seg">
              {EYEBROW_ALIGNS.map((a) => (
                <button key={a.id} className={`seg__btn${slide.eyebrowAlign === a.id ? ' is-active' : ''}`}
                  onClick={() => setSlide({ eyebrowAlign: a.id })}>
                  {a.label}
                </button>
              ))}
            </div>
          </Field>
        </section>
      )}

      {/* content */}
      <section className="inspector__section">
        <h3 className="section__title">Conteúdo</h3>

        {fields.has('eyebrow') && (
          <Field label="Selo (eyebrow)">
            <input className="input" value={c.eyebrow} onChange={(e) => setContent({ eyebrow: e.target.value })} />
          </Field>
        )}
        {fields.has('title') && (
          <Field label="Título">
            <textarea className="input" rows={2} value={c.title} onChange={(e) => setContent({ title: e.target.value })} />
          </Field>
        )}
        {fields.has('subtitle') && (
          <Field label="Subtítulo">
            <textarea className="input" rows={2} value={c.subtitle} onChange={(e) => setContent({ subtitle: e.target.value })} />
          </Field>
        )}
        {fields.has('body') && (
          <Field label="Texto">
            <textarea className="input" rows={5} value={c.body} onChange={(e) => setContent({ body: e.target.value })} />
          </Field>
        )}
        {fields.has('quote') && (
          <Field label="Citação">
            <textarea className="input" rows={4} value={c.quote} onChange={(e) => setContent({ quote: e.target.value })} />
          </Field>
        )}
        {fields.has('author') && (
          <Field label="Autoria">
            <input className="input" value={c.author} onChange={(e) => setContent({ author: e.target.value })} />
          </Field>
        )}
        {fields.has('stat') && (
          <Field label="Número / dado">
            <input className="input" value={c.stat} onChange={(e) => setContent({ stat: e.target.value })} />
          </Field>
        )}
        {fields.has('statLabel') && (
          <Field label="Legenda do dado">
            <textarea className="input" rows={2} value={c.statLabel} onChange={(e) => setContent({ statLabel: e.target.value })} />
          </Field>
        )}

        {fields.has('items') && (
          <div className="field">
            <span className="field__label">Itens da lista</span>
            <div className="items">
              {c.items.map((item, i) => (
                <div key={i} className="items__row">
                  <span className="items__num">{i + 1}</span>
                  <input
                    className="input"
                    value={item}
                    onChange={(e) => {
                      const items = [...c.items];
                      items[i] = e.target.value;
                      setContent({ items });
                    }}
                  />
                  <button className="icon-btn icon-btn--danger" title="Remover item"
                    onClick={() => setContent({ items: c.items.filter((_, j) => j !== i) })}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button className="btn btn--ghost btn--sm" onClick={() => setContent({ items: [...c.items, ''] })}>
                <Plus size={14} /> Adicionar item
              </button>
            </div>
          </div>
        )}

        {/* reference is available on any slide */}
        <Field label='Referência (aparece como "REF:")'>
          <textarea className="input" rows={2} value={c.reference}
            onChange={(e) => setContent({ reference: e.target.value })}
            placeholder="Autor et al., ano, Revista." />
        </Field>
      </section>

      {/* diagram */}
      {slide.layout === 'diagram' && (
        <section className="inspector__section">
          <h3 className="section__title">Diagrama</h3>
          <Field label="Tipo">
            <div className="seg seg--wrap">
              {DIAGRAM_TYPES.map((t) => (
                <button key={t.id} className={`seg__btn${dg.type === t.id ? ' is-active' : ''}`}
                  onClick={() => setDg({ type: t.id })}>
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <p className="section__hint">Cada texto tem sua própria barra de tamanho (A).</p>

          {dg.type === 'matrix' && (
            <>
              <label className="toggle">
                <input type="checkbox" checked={dg.showAxes} onChange={(e) => setDg({ showAxes: e.target.checked })} />
                <span>Mostrar eixos (desligado = tabela 2x2)</span>
              </label>
              {dg.showAxes && (
                <>
                  {diaText('Eixo horizontal (X)', dg.xLabel, (v) => setDg({ xLabel: v }), 'xLabel')}
                  {diaText('Eixo vertical (Y)', dg.yLabel, (v) => setDg({ yLabel: v }), 'yLabel')}
                </>
              )}
              {(['Sup. esquerda', 'Sup. direita', 'Inf. esquerda', 'Inf. direita'] as const).map((label, i) =>
                diaText(label, dg.quadrants[i], (v) => {
                  const quadrants = [...dg.quadrants] as [string, string, string, string];
                  quadrants[i] = v;
                  setDg({ quadrants });
                }, `q${i}`),
              )}
            </>
          )}

          {dg.type === 'venn' && (
            <>
              <Field label="Número de círculos">
                <div className="seg">
                  {([2, 3] as const).map((n) => (
                    <button key={n} className={`seg__btn${dg.vennCircles === n ? ' is-active' : ''}`}
                      onClick={() => setDg({ vennCircles: n })}>
                      {n} círculos
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={`Tamanho dos círculos: ${Math.round(dg.circleScale * 100)}%`}>
                <input type="range" min={70} max={130} value={Math.round(dg.circleScale * 100)}
                  onChange={(e) => setDg({ circleScale: Number(e.target.value) / 100 })} />
              </Field>
              {dg.vennCircles === 2 && (
                <Field label={`Sobreposição: ${Math.round(dg.vennOverlap * 100)}%`}>
                  <input type="range" min={0} max={100} value={Math.round(dg.vennOverlap * 100)}
                    onChange={(e) => setDg({ vennOverlap: Number(e.target.value) / 100 })} />
                </Field>
              )}
              {diaText('Conjunto A', dg.setA, (v) => setDg({ setA: v }), 'setA')}
              {diaText('Conjunto B', dg.setB, (v) => setDg({ setB: v }), 'setB')}
              {dg.vennCircles === 3 && diaText('Conjunto C', dg.setC, (v) => setDg({ setC: v }), 'setC')}
              {diaText('Interseção (centro)', dg.overlap, (v) => setDg({ overlap: v }), 'overlap')}
            </>
          )}

          {dg.type === 'distribution' && (
            <>
              {diaText('Eixo horizontal (X)', dg.xLabel, (v) => setDg({ xLabel: v }), 'xLabel')}
              {diaText('Eixo vertical (Y)', dg.yLabel, (v) => setDg({ yLabel: v }), 'yLabel')}
              {diaText('Texto do pico (fixo)', dg.peak, (v) => setDg({ peak: v }), 'peak')}
              {diaText('Texto sobre a área destacada', dg.marker, (v) => setDg({ marker: v }), 'marker')}
              <Field label={`Início do destaque: ${Math.round(dg.regionStart * 100)}%`}>
                <input type="range" min={0} max={100} value={Math.round(dg.regionStart * 100)}
                  onChange={(e) => setDg({ regionStart: Number(e.target.value) / 100 })} />
              </Field>
              <Field label={`Fim do destaque: ${Math.round(dg.regionEnd * 100)}%`}>
                <input type="range" min={0} max={100} value={Math.round(dg.regionEnd * 100)}
                  onChange={(e) => setDg({ regionEnd: Number(e.target.value) / 100 })} />
              </Field>
              <p className="section__hint">Deixe em 0% → 100% para preencher toda a curva.</p>
            </>
          )}

          {dg.type === 'cycle' && (
            <>
              <Field label={`Tamanho dos círculos: ${Math.round(dg.circleScale * 100)}%`}>
                <input type="range" min={70} max={130} value={Math.round(dg.circleScale * 100)}
                  onChange={(e) => setDg({ circleScale: Number(e.target.value) / 100 })} />
              </Field>
              <span className="field__label">Nós do ciclo (3 a 6)</span>
              {dg.nodes.map((n, i) => (
                <div className="dia-node" key={i}>
                  <div className="items__row">
                    <span className="items__num">{i + 1}</span>
                    <input className="input" value={n}
                      onChange={(e) => {
                        const nodes = [...dg.nodes];
                        nodes[i] = e.target.value;
                        setDg({ nodes });
                      }} />
                    {dg.nodes.length > 3 && (
                      <button className="icon-btn icon-btn--danger" title="Remover nó"
                        onClick={() => setDg({ nodes: dg.nodes.filter((_, j) => j !== i) })}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {sizeRow(`n${i}`)}
                </div>
              ))}
              {dg.nodes.length < 6 && (
                <button className="btn btn--ghost btn--sm" onClick={() => setDg({ nodes: [...dg.nodes, 'Novo nó'] })}>
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
                    <button className="seg__btn" disabled={dg.rows <= 1} onClick={() => setDg({ rows: dg.rows - 1 })}>−</button>
                    <button className="seg__btn" disabled={dg.rows >= 8} onClick={() => setDg({ rows: dg.rows + 1 })}>+</button>
                  </div>
                </Field>
                <Field label={`Colunas: ${dg.cols}`}>
                  <div className="seg">
                    <button className="seg__btn" disabled={dg.cols <= 1} onClick={() => setDg({ cols: dg.cols - 1 })}>−</button>
                    <button className="seg__btn" disabled={dg.cols >= 5} onClick={() => setDg({ cols: dg.cols + 1 })}>+</button>
                  </div>
                </Field>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={dg.header} onChange={(e) => setDg({ header: e.target.checked })} />
                <span>Primeira linha como cabeçalho</span>
              </label>
              <Field label={`Tamanho do texto: ${Math.round(sz('table') * 100)}%`}>
                <input type="range" min={50} max={200} value={Math.round(sz('table') * 100)}
                  onChange={(e) => setSize('table', Number(e.target.value) / 100)} />
              </Field>
              <div className="field">
                <span className="field__label">Células</span>
                <div className="dia-table" style={{ gridTemplateColumns: `repeat(${dg.cols}, 1fr)` }}>
                  {Array.from({ length: dg.rows * dg.cols }).map((_, idx) => (
                    <input key={idx} className="input input--cell" value={dg.cells[idx] ?? ''}
                      onChange={(e) => {
                        const cells = Array.from({ length: dg.rows * dg.cols }, (_, k) => dg.cells[k] ?? '');
                        cells[idx] = e.target.value;
                        setDg({ cells });
                      }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* decorative shapes */}
      <section className="inspector__section">
        <h3 className="section__title">Formas decorativas</h3>
        <p className="section__hint">Blobs e formas para enfeitar o slide. Ajuste posição, tamanho, cor e camada.</p>
        <div className="chip-row">
          {DECORATIONS.map((deco) => (
            <button key={deco.id} className="chip"
              onClick={() => dispatch({ type: 'addDecoration', id: slide.id, decoration: defaultDecoration(deco.id) })}>
              + {deco.label}
            </button>
          ))}
        </div>
        {slide.decorations.map((d, i) => (
          <DecorationEditor key={d.id} d={d} index={i}
            onChange={(patch) => dispatch({ type: 'updateDecoration', id: slide.id, decoId: d.id, patch })}
            onRemove={() => dispatch({ type: 'removeDecoration', id: slide.id, decoId: d.id })} />
        ))}
      </section>

      {/* image */}
      <section className="inspector__section">
        <h3 className="section__title">Imagem</h3>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUploadImage} />
        {!img ? (
          <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} /> Enviar imagem
          </button>
        ) : (
          <>
            <div className="img-preview">
              <img src={img.src} alt="" />
              <div className="img-preview__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>Trocar</button>
                <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'setImage', id: slide.id, image: null })}>Remover</button>
              </div>
            </div>
            <Field label="Posição na slide">
              <div className="seg seg--wrap">
                {PLACEMENTS.map((p) => (
                  <button key={p.id} className={`seg__btn${img.placement === p.id ? ' is-active' : ''}`}
                    onClick={() => setPlacement(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Ajuste">
              <div className="seg">
                {(['cover', 'contain'] as const).map((f) => (
                  <button key={f} className={`seg__btn${img.fit === f ? ' is-active' : ''}`}
                    onClick={() => dispatch({ type: 'updateImage', id: slide.id, patch: { fit: f } })}>
                    {f === 'cover' ? 'Preencher' : 'Conter'}
                  </button>
                ))}
              </div>
            </Field>
            {img.placement !== 'background' && (
              <Field label={`Tamanho: ${Math.round(img.size * 100)}% da slide`}>
                <input type="range" min={25} max={75} value={Math.round(img.size * 100)}
                  onChange={(e) => dispatch({ type: 'updateImage', id: slide.id, patch: { size: Number(e.target.value) / 100 } })} />
              </Field>
            )}
            {img.fit === 'cover' && (
              <>
                <Field label={`Foco horizontal: ${Math.round(img.focusX * 100)}%`}>
                  <input type="range" min={0} max={100} value={Math.round(img.focusX * 100)}
                    onChange={(e) => dispatch({ type: 'updateImage', id: slide.id, patch: { focusX: Number(e.target.value) / 100 } })} />
                </Field>
                <Field label={`Foco vertical: ${Math.round(img.focusY * 100)}%`}>
                  <input type="range" min={0} max={100} value={Math.round(img.focusY * 100)}
                    onChange={(e) => dispatch({ type: 'updateImage', id: slide.id, patch: { focusY: Number(e.target.value) / 100 } })} />
                </Field>
              </>
            )}
            {img.placement === 'background' && (
              <>
                <Field label={`Opacidade da imagem: ${Math.round(img.opacity * 100)}%`}>
                  <input type="range" min={10} max={100} value={Math.round(img.opacity * 100)}
                    onChange={(e) => dispatch({ type: 'updateImage', id: slide.id, patch: { opacity: Number(e.target.value) / 100 } })} />
                </Field>
                <Field label={`Camada de leitura: ${Math.round(img.overlay * 100)}%`}>
                  <input type="range" min={0} max={90} value={Math.round(img.overlay * 100)}
                    onChange={(e) => dispatch({ type: 'updateImage', id: slide.id, patch: { overlay: Number(e.target.value) / 100 } })} />
                </Field>
              </>
            )}
          </>
        )}
      </section>

      {/* layers */}
      <section className="inspector__section">
        <h3 className="section__title">Elementos visíveis</h3>
        <div className="toggles">
          {LAYER_LABELS.map(({ key, label }) => (
            <label key={key} className="toggle">
              <input type="checkbox" checked={slide.layers[key]} onChange={(e) => setLayer(key, e.target.checked)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* panorama */}
      <section className="inspector__section">
        <h3 className="section__title">Imagem contínua (panorama)</h3>
        <p className="section__hint">
          Uma única imagem distribuída por slides seguidos, criando o efeito de continuação ao arrastar no Instagram.
        </p>
        {band ? (
          <>
            <Field label={`Quantos slides (a partir deste): ${band.band.slideIds.length}`}>
              <input type="range" min={2} max={slidesAfter} value={Math.min(band.band.slideIds.length, slidesAfter)}
                onChange={(e) => updateBandSpan(Number(e.target.value))} />
            </Field>
            <Field label="Posição">
              <div className="seg seg--wrap">
                {(['top', 'center', 'bottom', 'full'] as const).map((p) => (
                  <button key={p} className={`seg__btn${band.band.position === p ? ' is-active' : ''}`}
                    onClick={() => dispatch({ type: 'updateBand', id: band.band.id, patch: { position: p } })}>
                    {p === 'top' ? 'Topo' : p === 'center' ? 'Meio' : p === 'bottom' ? 'Base' : 'Cheio'}
                  </button>
                ))}
              </div>
            </Field>
            {band.band.position !== 'full' && (
              <Field label={`Altura: ${Math.round(band.band.heightRatio * 100)}%`}>
                <input type="range" min={20} max={100} value={Math.round(band.band.heightRatio * 100)}
                  onChange={(e) => dispatch({ type: 'updateBand', id: band.band.id, patch: { heightRatio: Number(e.target.value) / 100 } })} />
              </Field>
            )}
            <Field label={`Opacidade: ${Math.round(band.band.opacity * 100)}%`}>
              <input type="range" min={10} max={100} value={Math.round(band.band.opacity * 100)}
                onChange={(e) => dispatch({ type: 'updateBand', id: band.band.id, patch: { opacity: Number(e.target.value) / 100 } })} />
            </Field>
            <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'removeBand', id: band.band.id })}>
              <Trash2 size={14} /> Remover panorama
            </button>
          </>
        ) : (
          <>
            <input ref={bandFileRef} type="file" accept="image/*" hidden onChange={onCreateBand} />
            <button className="btn btn--ghost" disabled={slidesAfter < 2} onClick={() => bandFileRef.current?.click()}>
              <ImagePlus size={16} /> Criar panorama a partir daqui
            </button>
            {slidesAfter < 2 && <p className="section__hint">Adicione mais um slide à direita para usar este recurso.</p>}
          </>
        )}
      </section>

      {/* caption */}
      <section className="inspector__section">
        <h3 className="section__title">Legenda do post</h3>
        <p className="section__hint">
          O texto que vai acompanhar a publicação. É exportado como <code>legenda.txt</code> dentro do .zip.
        </p>
        <textarea className="input" rows={6} value={carousel.caption}
          placeholder="Escreva a legenda e os hashtags aqui…"
          onChange={(e) => dispatch({ type: 'setMeta', patch: { caption: e.target.value } })} />
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }}
          disabled={!carousel.caption.trim()}
          onClick={() => navigator.clipboard?.writeText(carousel.caption)}>
          <Copy size={14} /> Copiar legenda
        </button>
      </section>

      {/* brand */}
      <section className="inspector__section">
        <h3 className="section__title">Marca (todos os slides)</h3>
        <Field label="Assinatura">
          <input className="input" value={carousel.brandName}
            onChange={(e) => dispatch({ type: 'setMeta', patch: { brandName: e.target.value } })} />
        </Field>
        <Field label="@ do Instagram">
          <input className="input" value={carousel.handle}
            onChange={(e) => dispatch({ type: 'setMeta', patch: { handle: e.target.value } })} />
        </Field>
        <div className="field">
          <span className="field__label">Logo (substitui a assinatura no rodapé)</span>
          <input ref={logoRef} type="file" accept="image/*" hidden onChange={onUploadLogo} />
          {carousel.logoSrc ? (
            <div className="img-preview">
              <img src={carousel.logoSrc} alt="" style={{ maxHeight: 80, objectFit: 'contain', background: '#f4f1ea' }} />
              <div className="img-preview__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => logoRef.current?.click()}>Trocar</button>
                <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'setMeta', patch: { logoSrc: null } })}>Remover</button>
              </div>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => logoRef.current?.click()}>
              <ImagePlus size={14} /> Enviar logo
            </button>
          )}
        </div>
      </section>
    </aside>
  );
}
