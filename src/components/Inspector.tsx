import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Copy, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { BLOCK_TYPES } from '../designModes';
import { bandForSlide, fileToDataUrl } from '../lib/helpers';
import type {
  BackgroundStyle,
  DecorationKind,
  ElementAlign,
  EyebrowPlacement,
  Slide,
  SlideLayers,
  TextAlign,
  VerticalAnchor,
} from '../types';
import { defaultDecoration, defaultImage, uid } from '../state/factory';
import { BlockEditor } from './BlockEditor';
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
  { key: 'swipe', label: 'Seta "arraste"' },
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
  { id: 'heart', label: '♥ Curtir' },
  { id: 'comment', label: '💬 Comentar' },
  { id: 'share', label: '➤ Compartilhar' },
  { id: 'bookmark', label: '🔖 Salvar' },
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
  const bgRef = useRef<HTMLInputElement>(null);
  const bandFileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  if (!selectedSlide) {
    return <aside className="inspector inspector--empty">Selecione um slide para editar.</aside>;
  }

  const slide: Slide = selectedSlide;
  const id = slide.id;
  const idx = carousel.slides.findIndex((s) => s.id === id);
  const total = carousel.slides.length;
  const bg = slide.bgImage;

  const setField = (
    patch: Partial<Pick<Slide, 'align' | 'contentAnchor' | 'background' | 'eyebrowAlign' | 'eyebrowPlacement' | 'eyebrow' | 'reference'>>,
  ) => dispatch({ type: 'updateSlide', id, patch });
  const setLayer = (key: keyof SlideLayers, value: boolean) => dispatch({ type: 'updateLayers', id, patch: { [key]: value } });

  const onUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch({ type: 'setBgImage', id, image: defaultImage(await fileToDataUrl(file)) });
    e.target.value = '';
  };
  const onUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch({ type: 'setMeta', patch: { logoSrc: await fileToDataUrl(file) } });
    e.target.value = '';
  };

  const band = bandForSlide(carousel, id);
  const slidesAfter = total - idx;
  const onCreateBand = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = await fileToDataUrl(file);
    const slideIds = carousel.slides.slice(idx, idx + 2).map((s) => s.id);
    if (slideIds.length >= 2) {
      dispatch({ type: 'addBand', band: { id: uid(), src, slideIds, position: 'center', heightRatio: 0.62, opacity: 1 } });
    }
    e.target.value = '';
  };

  return (
    <aside className="inspector">
      <div className="inspector__head">
        <div>
          <p className="inspector__eyebrow">Slide {idx + 1} de {total}</p>
          <h2 className="inspector__title">{slide.blocks.length} bloco(s)</h2>
        </div>
        <div className="inspector__actions">
          <button className="icon-btn" title="Mover slide ←" disabled={idx === 0} onClick={() => dispatch({ type: 'moveSlide', id, dir: -1 })}><ArrowLeft size={16} /></button>
          <button className="icon-btn" title="Mover slide →" disabled={idx === total - 1} onClick={() => dispatch({ type: 'moveSlide', id, dir: 1 })}><ArrowRight size={16} /></button>
          <button className="icon-btn" title="Duplicar" onClick={() => dispatch({ type: 'duplicateSlide', id })}><Copy size={16} /></button>
          <button className="icon-btn icon-btn--danger" title="Excluir" disabled={total <= 1} onClick={() => dispatch({ type: 'deleteSlide', id })}><Trash2 size={16} /></button>
        </div>
      </div>

      {/* content blocks */}
      <section className="inspector__section">
        <h3 className="section__title">Conteúdo</h3>
        <p className="section__hint">Selecione o texto e use <b>B</b> / <i>I</i> / <span style={{ background: 'var(--gold-soft)', padding: '0 3px', borderRadius: 3 }}>H</span>, ou escreva <code>*negrito*</code>, <code>_itálico_</code>, <code>==destaque==</code>.</p>
        {slide.blocks.map((block, i) => (
          <BlockEditor
            key={block.id}
            block={block}
            index={i}
            total={slide.blocks.length}
            onPatch={(patch) => dispatch({ type: 'updateBlock', id, blockId: block.id, patch })}
            onDiagram={(patch) => dispatch({ type: 'updateBlockDiagram', id, blockId: block.id, patch })}
            onMove={(dir) => dispatch({ type: 'moveBlock', id, blockId: block.id, dir })}
            onRemove={() => dispatch({ type: 'removeBlock', id, blockId: block.id })}
          />
        ))}
        <p className="section__hint" style={{ marginTop: 12 }}>+ Adicionar conteúdo</p>
        <div className="chip-row">
          {BLOCK_TYPES.map((b) => (
            <button key={b.id} className="chip" title={b.description} onClick={() => dispatch({ type: 'addBlock', id, blockType: b.id })}>
              + {b.name}
            </button>
          ))}
        </div>
      </section>

      {/* eyebrow */}
      <section className="inspector__section">
        <h3 className="section__title">Selo (eyebrow)</h3>
        <Field label="Texto">
          <input className="input" value={slide.eyebrow} onChange={(e) => setField({ eyebrow: e.target.value })} placeholder="Ex.: Na prática" />
        </Field>
        <Field label="Posição">
          <div className="seg">
            {(['inline', 'top'] as EyebrowPlacement[]).map((p) => (
              <button key={p} className={`seg__btn${slide.eyebrowPlacement === p ? ' is-active' : ''}`} onClick={() => setField({ eyebrowPlacement: p })}>
                {p === 'inline' ? 'Junto ao texto' : 'Topo do slide'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Alinhamento do selo">
          <div className="seg">
            {EYEBROW_ALIGNS.map((a) => (
              <button key={a.id} className={`seg__btn${slide.eyebrowAlign === a.id ? ' is-active' : ''}`} onClick={() => setField({ eyebrowAlign: a.id })}>{a.label}</button>
            ))}
          </div>
        </Field>
      </section>

      {/* style + positioning */}
      <section className="inspector__section">
        <h3 className="section__title">Estilo & posição</h3>
        <Field label="Alinhamento do texto">
          <div className="seg">
            {ALIGNS.map((a) => (
              <button key={a.id} className={`seg__btn${slide.align === a.id ? ' is-active' : ''}`} onClick={() => setField({ align: a.id })}>{a.label}</button>
            ))}
          </div>
        </Field>
        <Field label="Posição vertical do conteúdo">
          <div className="seg">
            {ANCHORS.map((a) => (
              <button key={a.id} className={`seg__btn${slide.contentAnchor === a.id ? ' is-active' : ''}`} onClick={() => setField({ contentAnchor: a.id })}>{a.label}</button>
            ))}
          </div>
        </Field>
        <Field label="Fundo">
          <div className="seg">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} className={`seg__btn${slide.background === b.id ? ' is-active' : ''}`} onClick={() => setField({ background: b.id })}>{b.label}</button>
            ))}
          </div>
        </Field>
        <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'resetSlide', id })}>
          <RotateCcw size={14} /> Restaurar padrão do slide
        </button>
      </section>

      {/* reference */}
      <section className="inspector__section">
        <h3 className="section__title">Referência (REF:)</h3>
        <textarea className="input" rows={2} value={slide.reference} onChange={(e) => setField({ reference: e.target.value })} placeholder="Autor et al., ano, Revista." />
      </section>

      {/* background image */}
      <section className="inspector__section">
        <h3 className="section__title">Imagem de fundo</h3>
        <input ref={bgRef} type="file" accept="image/*" hidden onChange={onUploadBg} />
        {!bg ? (
          <button className="btn btn--ghost" onClick={() => bgRef.current?.click()}><ImagePlus size={16} /> Enviar imagem de fundo</button>
        ) : (
          <>
            <div className="img-preview">
              <img src={bg.src} alt="" />
              <div className="img-preview__actions">
                <div className="seg seg--sm">
                  {(['cover', 'contain'] as const).map((f) => (
                    <button key={f} className={`seg__btn${bg.fit === f ? ' is-active' : ''}`} onClick={() => dispatch({ type: 'updateBgImage', id, patch: { fit: f } })}>{f === 'cover' ? 'Preencher' : 'Conter'}</button>
                  ))}
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => bgRef.current?.click()}>Trocar</button>
                <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'setBgImage', id, image: null })}>Remover</button>
              </div>
            </div>
            <Field label={`Opacidade: ${Math.round(bg.opacity * 100)}%`}>
              <input type="range" min={10} max={100} value={Math.round(bg.opacity * 100)} onChange={(e) => dispatch({ type: 'updateBgImage', id, patch: { opacity: Number(e.target.value) / 100 } })} />
            </Field>
            <Field label={`Camada de leitura: ${Math.round(bg.overlay * 100)}%`}>
              <input type="range" min={0} max={90} value={Math.round(bg.overlay * 100)} onChange={(e) => dispatch({ type: 'updateBgImage', id, patch: { overlay: Number(e.target.value) / 100 } })} />
            </Field>
            {bg.fit === 'cover' && (
              <>
                <Field label={`Foco horizontal: ${Math.round(bg.focusX * 100)}%`}>
                  <input type="range" min={0} max={100} value={Math.round(bg.focusX * 100)} onChange={(e) => dispatch({ type: 'updateBgImage', id, patch: { focusX: Number(e.target.value) / 100 } })} />
                </Field>
                <Field label={`Foco vertical: ${Math.round(bg.focusY * 100)}%`}>
                  <input type="range" min={0} max={100} value={Math.round(bg.focusY * 100)} onChange={(e) => dispatch({ type: 'updateBgImage', id, patch: { focusY: Number(e.target.value) / 100 } })} />
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

      {/* decorations */}
      <section className="inspector__section">
        <h3 className="section__title">Formas decorativas</h3>
        <p className="section__hint">Blobs, formas e ícones do Instagram. Ajuste posição, tamanho, cor e camada.</p>
        <div className="chip-row">
          {DECORATIONS.map((deco) => (
            <button key={deco.id} className="chip" onClick={() => dispatch({ type: 'addDecoration', id, decoration: defaultDecoration(deco.id) })}>+ {deco.label}</button>
          ))}
        </div>
        {slide.decorations.map((d, i) => (
          <DecorationEditor key={d.id} d={d} index={i}
            onChange={(patch) => dispatch({ type: 'updateDecoration', id, decoId: d.id, patch })}
            onRemove={() => dispatch({ type: 'removeDecoration', id, decoId: d.id })} />
        ))}
      </section>

      {/* panorama */}
      <section className="inspector__section">
        <h3 className="section__title">Imagem contínua (panorama)</h3>
        <p className="section__hint">Uma imagem distribuída por slides seguidos, criando a continuação ao arrastar.</p>
        {band ? (
          <>
            <Field label={`Quantos slides: ${band.band.slideIds.length}`}>
              <input type="range" min={2} max={slidesAfter} value={Math.min(band.band.slideIds.length, slidesAfter)}
                onChange={(e) => dispatch({ type: 'updateBand', id: band.band.id, patch: { slideIds: carousel.slides.slice(idx, idx + Number(e.target.value)).map((s) => s.id) } })} />
            </Field>
            <Field label="Posição">
              <div className="seg seg--wrap">
                {(['top', 'center', 'bottom', 'full'] as const).map((p) => (
                  <button key={p} className={`seg__btn${band.band.position === p ? ' is-active' : ''}`} onClick={() => dispatch({ type: 'updateBand', id: band.band.id, patch: { position: p } })}>
                    {p === 'top' ? 'Topo' : p === 'center' ? 'Meio' : p === 'bottom' ? 'Base' : 'Cheio'}
                  </button>
                ))}
              </div>
            </Field>
            {band.band.position !== 'full' && (
              <Field label={`Altura: ${Math.round(band.band.heightRatio * 100)}%`}>
                <input type="range" min={20} max={100} value={Math.round(band.band.heightRatio * 100)} onChange={(e) => dispatch({ type: 'updateBand', id: band.band.id, patch: { heightRatio: Number(e.target.value) / 100 } })} />
              </Field>
            )}
            <Field label={`Opacidade: ${Math.round(band.band.opacity * 100)}%`}>
              <input type="range" min={10} max={100} value={Math.round(band.band.opacity * 100)} onChange={(e) => dispatch({ type: 'updateBand', id: band.band.id, patch: { opacity: Number(e.target.value) / 100 } })} />
            </Field>
            <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'removeBand', id: band.band.id })}><Trash2 size={14} /> Remover panorama</button>
          </>
        ) : (
          <>
            <input ref={bandFileRef} type="file" accept="image/*" hidden onChange={onCreateBand} />
            <button className="btn btn--ghost" disabled={slidesAfter < 2} onClick={() => bandFileRef.current?.click()}><ImagePlus size={16} /> Criar panorama a partir daqui</button>
            {slidesAfter < 2 && <p className="section__hint">Adicione mais um slide à direita para usar este recurso.</p>}
          </>
        )}
      </section>

      {/* caption */}
      <section className="inspector__section">
        <h3 className="section__title">Legenda do post</h3>
        <p className="section__hint">Exportada como <code>legenda.txt</code> dentro do .zip.</p>
        <textarea className="input" rows={6} value={carousel.caption} placeholder="Escreva a legenda e os hashtags…" onChange={(e) => dispatch({ type: 'setMeta', patch: { caption: e.target.value } })} />
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} disabled={!carousel.caption.trim()} onClick={() => navigator.clipboard?.writeText(carousel.caption)}>
          <Copy size={14} /> Copiar legenda
        </button>
      </section>

      {/* brand */}
      <section className="inspector__section">
        <h3 className="section__title">Marca (todos os slides)</h3>
        <Field label="Assinatura">
          <input className="input" value={carousel.brandName} onChange={(e) => dispatch({ type: 'setMeta', patch: { brandName: e.target.value } })} />
        </Field>
        <Field label="@ do Instagram">
          <input className="input" value={carousel.handle} onChange={(e) => dispatch({ type: 'setMeta', patch: { handle: e.target.value } })} />
        </Field>
        <Field label="Ordem no rodapé">
          <div className="seg">
            <button className={`seg__btn${!carousel.footerReversed ? ' is-active' : ''}`} onClick={() => dispatch({ type: 'setMeta', patch: { footerReversed: false } })}>Assinatura · @</button>
            <button className={`seg__btn${carousel.footerReversed ? ' is-active' : ''}`} onClick={() => dispatch({ type: 'setMeta', patch: { footerReversed: true } })}>@ · Assinatura</button>
          </div>
        </Field>
        <div className="field">
          <span className="field__label">Logo (substitui a assinatura)</span>
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
            <button className="btn btn--ghost btn--sm" onClick={() => logoRef.current?.click()}><ImagePlus size={14} /> Enviar logo</button>
          )}
        </div>
      </section>
    </aside>
  );
}
