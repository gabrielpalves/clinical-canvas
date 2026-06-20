import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ImagePlus,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { LAYOUTS, LAYOUT_MAP } from '../designModes';
import { bandForSlide, fileToDataUrl } from '../lib/helpers';
import type {
  BackgroundStyle,
  LayoutId,
  Slide,
  SlideContent,
  SlideLayers,
  TextAlign,
} from '../types';
import { uid } from '../state/factory';

const BACKGROUNDS: Array<{ id: BackgroundStyle; label: string }> = [
  { id: 'solid', label: 'Sólido' },
  { id: 'soft', label: 'Suave' },
  { id: 'gradient', label: 'Gradiente' },
  { id: 'image', label: 'Para imagem' },
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

  if (!selectedSlide) {
    return <aside className="inspector inspector--empty">Selecione um slide para editar.</aside>;
  }

  const slide: Slide = selectedSlide;
  const idx = carousel.slides.findIndex((s) => s.id === slide.id);
  const total = carousel.slides.length;
  const meta = LAYOUT_MAP[slide.layout];
  const fields = new Set(meta.fields);
  const c = slide.content;

  const setContent = (patch: Partial<SlideContent>) =>
    dispatch({ type: 'updateContent', id: slide.id, patch });
  const setLayer = (key: keyof SlideLayers, value: boolean) =>
    dispatch({ type: 'updateLayers', id: slide.id, patch: { [key]: value } });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setContent({ imageSrc: await fileToDataUrl(file) });
    e.target.value = '';
  };

  const band = bandForSlide(carousel, slide.id);
  const slidesAfter = total - idx; // includes current

  const onCreateBand = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);
    const span = Math.min(2, slidesAfter); // default span 2 (or 1 if last)
    const slideIds = carousel.slides.slice(idx, idx + Math.max(2, span)).map((s) => s.id);
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

      {/* style */}
      <section className="inspector__section">
        <h3 className="section__title">Estilo do slide</h3>
        <Field label="Alinhamento">
          <div className="seg">
            {(['left', 'center'] as TextAlign[]).map((a) => (
              <button key={a} className={`seg__btn${slide.align === a ? ' is-active' : ''}`}
                onClick={() => dispatch({ type: 'updateSlide', id: slide.id, patch: { align: a } })}>
                {a === 'left' ? 'Esquerda' : 'Centro'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Fundo">
          <div className="seg">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} className={`seg__btn${slide.background === b.id ? ' is-active' : ''}`}
                onClick={() => dispatch({ type: 'updateSlide', id: slide.id, patch: { background: b.id } })}>
                {b.label}
              </button>
            ))}
          </div>
        </Field>
      </section>

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

        {fields.has('image') && (
          <div className="field">
            <span className="field__label">Imagem</span>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
            {c.imageSrc ? (
              <div className="img-preview">
                <img src={c.imageSrc} alt="" />
                <div className="img-preview__actions">
                  <div className="seg seg--sm">
                    {(['cover', 'contain'] as const).map((f) => (
                      <button key={f} className={`seg__btn${c.imageFit === f ? ' is-active' : ''}`}
                        onClick={() => setContent({ imageFit: f })}>
                        {f === 'cover' ? 'Preencher' : 'Conter'}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>Trocar</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setContent({ imageSrc: null })}>Remover</button>
                </div>
              </div>
            ) : (
              <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={16} /> Enviar imagem
              </button>
            )}
          </div>
        )}

        {/* reference is available on any slide */}
        <Field label='Referência (aparece como "REF:")'>
          <textarea className="input" rows={2} value={c.reference}
            onChange={(e) => setContent({ reference: e.target.value })}
            placeholder="Autor et al., ano, Revista." />
        </Field>
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
              <div className="seg">
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

      {/* brand */}
      <section className="inspector__section">
        <h3 className="section__title">Marca (todos os slides)</h3>
        <Field label="Assinatura">
          <input className="input" value={carousel.brandName}
            onChange={(e) => dispatch({ type: 'setMeta', brandName: e.target.value })} />
        </Field>
        <Field label="@ do Instagram">
          <input className="input" value={carousel.handle}
            onChange={(e) => dispatch({ type: 'setMeta', handle: e.target.value })} />
        </Field>
      </section>
    </aside>
  );
}
