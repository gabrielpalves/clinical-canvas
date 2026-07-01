import { useRef } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import type { Block, BlockFont, DiagramConfig, ElementAlign, HeadingSize } from '../types';
import { fileToDataUrl } from '../lib/helpers';
import { BLOCK_FONTS } from '../designModes';
import { ColorField } from './ColorField';
import { DiagramFields } from './DiagramFields';
import { MarkupField } from './MarkupField';

const TYPE_LABEL: Record<Block['type'], string> = {
  heading: 'Título',
  paragraph: 'Texto',
  list: 'Lista',
  quote: 'Citação',
  statistic: 'Dado',
  diagram: 'Diagrama',
  image: 'Imagem',
  divider: 'Divisória',
};

const ALIGNS: Array<{ id: ElementAlign; label: string }> = [
  { id: 'inherit', label: 'Auto' },
  { id: 'left', label: 'Esq.' },
  { id: 'center', label: 'Centro' },
  { id: 'right', label: 'Dir.' },
];

const HEADING_SIZES: Array<{ id: HeadingSize; label: string }> = [
  { id: 'sm', label: 'P' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'G' },
  { id: 'xl', label: 'GG' },
];

const LIST_MARKERS: Array<{ id: Block['marker']; label: string; title: string }> = [
  { id: 'number', label: '1.', title: 'Numerada' },
  { id: 'dot', label: '●', title: 'Ponto' },
  { id: 'ring', label: '○', title: 'Ponto vazado' },
  { id: 'dash', label: '–', title: 'Traço' },
  { id: 'arrow', label: '→', title: 'Seta' },
];

interface Props {
  block: Block;
  index: number;
  total: number;
  onPatch: (patch: Partial<Block>) => void;
  onDiagram: (patch: Partial<DiagramConfig>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export function BlockEditor({ block, index, total, onPatch, onDiagram, onMove, onRemove }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasScale = ['heading', 'paragraph', 'list', 'quote', 'statistic'].includes(block.type);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPatch({ src: await fileToDataUrl(file) });
    e.target.value = '';
  };

  return (
    <div className="block-card">
      <div className="block-card__head">
        <span className="block-card__title">{index + 1}. {TYPE_LABEL[block.type]}</span>
        <div className="block-card__actions">
          <button className="icon-btn" title="Mover para cima" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={14} /></button>
          <button className="icon-btn" title="Mover para baixo" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={14} /></button>
          <button className="icon-btn icon-btn--danger" title="Remover bloco" disabled={total <= 1} onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* alignment + size shared controls */}
      <div className="block-card__row">
        <div className="seg seg--sm">
          {ALIGNS.map((a) => (
            <button key={a.id} className={`seg__btn${block.align === a.id ? ' is-active' : ''}`} onClick={() => onPatch({ align: a.id })}>{a.label}</button>
          ))}
        </div>
        {hasScale && (
          <div className="size-row size-row--inline">
            <span className="size-row__icon">A</span>
            <input type="range" min={50} max={200} value={Math.round(block.scale * 100)}
              onDoubleClick={() => onPatch({ scale: 1 })}
              onChange={(e) => onPatch({ scale: Number(e.target.value) / 100 })} />
            <span className="size-row__suffix">{Math.round(block.scale * 100)}%</span>
          </div>
        )}
      </div>

      <div className="block-card__row">
        <div className="size-row size-row--inline">
          <span className="size-row__icon" title="Espaço acima do bloco">↥</span>
          <input type="range" min={0} max={140} value={Math.round(block.spaceTop)}
            onDoubleClick={() => onPatch({ spaceTop: 0 })}
            onChange={(e) => onPatch({ spaceTop: Number(e.target.value) })} />
          <span className="size-row__suffix">{Math.round(block.spaceTop)}</span>
        </div>
        <div className="size-row size-row--inline">
          <span className="size-row__icon" title="Padding lateral">↔</span>
          <input type="range" min={0} max={120} value={Math.round(block.padX)}
            onDoubleClick={() => onPatch({ padX: 0 })}
            onChange={(e) => onPatch({ padX: Number(e.target.value) })} />
          <span className="size-row__suffix">{Math.round(block.padX)}</span>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={block.boxed} onChange={(e) => onPatch({ boxed: e.target.checked })} />
          <span>Caixa</span>
        </label>
      </div>

      {block.boxed && (
        <div className="block-card__row">
          <label className="toggle">
            <input type="checkbox" checked={block.boxBorder} onChange={(e) => onPatch({ boxBorder: e.target.checked })} />
            <span>Borda</span>
          </label>
          <div className="size-row size-row--inline">
            <span className="size-row__icon size-row__icon--wide" title="Largura da caixa no slide (a caixa encolhe e é posicionada pelo alinhamento)">Largura</span>
            <input type="range" min={30} max={100} value={Math.round(block.boxWidth * 100)}
              onDoubleClick={() => onPatch({ boxWidth: 1 })}
              onChange={(e) => onPatch({ boxWidth: Number(e.target.value) / 100 })} />
            <span className="size-row__suffix">{Math.round(block.boxWidth * 100)}%</span>
          </div>
          <div className="size-row size-row--inline">
            <span className="size-row__icon size-row__icon--wide" title="Cantos arredondados">Raio</span>
            <input type="range" min={0} max={80} value={Math.round(block.boxRadius)}
              onDoubleClick={() => onPatch({ boxRadius: 0 })}
              onChange={(e) => onPatch({ boxRadius: Number(e.target.value) })} />
            <span className="size-row__suffix">{Math.round(block.boxRadius)}</span>
          </div>
          <div className="size-row size-row--inline">
            <span className="size-row__icon size-row__icon--wide" title="Espaçamento interno horizontal (entre a borda da caixa e o texto)">Recuo ↔</span>
            <input type="range" min={0} max={140} value={Math.round(block.boxPadX)}
              onDoubleClick={() => onPatch({ boxPadX: 40 })}
              onChange={(e) => onPatch({ boxPadX: Number(e.target.value) })} />
            <span className="size-row__suffix">{Math.round(block.boxPadX)}</span>
          </div>
          <div className="size-row size-row--inline">
            <span className="size-row__icon size-row__icon--wide" title="Espaçamento interno vertical (entre a borda da caixa e o texto)">Recuo ↕</span>
            <input type="range" min={0} max={140} value={Math.round(block.boxPadY)}
              onDoubleClick={() => onPatch({ boxPadY: 36 })}
              onChange={(e) => onPatch({ boxPadY: Number(e.target.value) })} />
            <span className="size-row__suffix">{Math.round(block.boxPadY)}</span>
          </div>
          <p className="section__hint" style={{ margin: '2px 0 0', width: '100%' }}>
            <b>Largura</b> muda o tamanho da caixa no slide; <b>Recuo</b> é o espaço interno até o texto. Defina o <b>Fundo do bloco</b> abaixo para preencher a caixa (ex.: branco com texto preto sobre uma foto).
          </p>
        </div>
      )}

      {/* per-block colours + font */}
      <div className="block-card__colors">
        <ColorField label="Texto" value={block.textColor} onChange={(v) => onPatch({ textColor: v })} fallback="#433430" />
        <ColorField label="Fundo do bloco" value={block.bgColor} onChange={(v) => onPatch({ bgColor: v })} fallback="#f2efe9" />
        <ColorField label="Destaque" value={block.accentColor} onChange={(v) => onPatch({ accentColor: v })} fallback="#bfa065" />
        <div className="colorfield">
          <span className="colorfield__label">Fonte</span>
          <select className="input colorfield__hex" value={block.font} onChange={(e) => onPatch({ font: e.target.value as BlockFont })}>
            {BLOCK_FONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {block.type === 'heading' && (
        <>
          <MarkupField multiline rows={2} value={block.text} onChange={(v) => onPatch({ text: v })} />
          <div className="seg seg--sm" style={{ marginTop: 8 }}>
            {HEADING_SIZES.map((s) => (
              <button key={s.id} className={`seg__btn${block.size === s.id ? ' is-active' : ''}`} onClick={() => onPatch({ size: s.id })}>{s.label}</button>
            ))}
          </div>
        </>
      )}

      {block.type === 'paragraph' && (
        <MarkupField multiline rows={4} value={block.text} onChange={(v) => onPatch({ text: v })} />
      )}

      {block.type === 'quote' && (
        <>
          <MarkupField multiline rows={3} value={block.text} onChange={(v) => onPatch({ text: v })} placeholder="A citação" />
          <input className="input" style={{ marginTop: 8 }} value={block.author} onChange={(e) => onPatch({ author: e.target.value })} placeholder="Autoria" />
        </>
      )}

      {block.type === 'statistic' && (
        <>
          <input className="input" value={block.stat} onChange={(e) => onPatch({ stat: e.target.value })} placeholder="Número / dado" />
          <div style={{ marginTop: 8 }}>
            <MarkupField multiline rows={2} value={block.statLabel} onChange={(v) => onPatch({ statLabel: v })} placeholder="Legenda do dado" />
          </div>
          <div style={{ marginTop: 8 }}>
            <MarkupField multiline rows={2} value={block.body} onChange={(v) => onPatch({ body: v })} placeholder="Texto de apoio (opcional)" />
          </div>
        </>
      )}

      {block.type === 'list' && (
        <>
          <span className="field__label">Marcador</span>
          <div className="seg seg--sm seg--wrap" style={{ marginBottom: 10 }}>
            {LIST_MARKERS.map((mk) => (
              <button key={mk.id} className={`seg__btn${block.marker === mk.id ? ' is-active' : ''}`} title={mk.title} onClick={() => onPatch({ marker: mk.id })}>{mk.label}</button>
            ))}
          </div>
          <div className="items">
            {block.items.map((item, i) => {
              const moveItem = (dir: -1 | 1) => {
                const j = i + dir;
                if (j < 0 || j >= block.items.length) return;
                const items = [...block.items];
                [items[i], items[j]] = [items[j], items[i]];
                onPatch({ items });
              };
              return (
                <div key={i} className="items__row items__row--mk">
                  <span className="items__num">{i + 1}</span>
                  <div className="items__field">
                    <MarkupField value={item} onChange={(v) => {
                      const items = [...block.items];
                      items[i] = v;
                      onPatch({ items });
                    }} />
                  </div>
                  <div className="items__btns">
                    <button className="icon-btn" title="Mover item para cima" disabled={i === 0} onClick={() => moveItem(-1)}><ArrowUp size={13} /></button>
                    <button className="icon-btn" title="Mover item para baixo" disabled={i === block.items.length - 1} onClick={() => moveItem(1)}><ArrowDown size={13} /></button>
                    <button className="icon-btn icon-btn--danger" title="Remover item" onClick={() => onPatch({ items: block.items.filter((_, j) => j !== i) })}><X size={13} /></button>
                  </div>
                </div>
              );
            })}
            <button className="btn btn--ghost btn--sm" onClick={() => onPatch({ items: [...block.items, ''] })}><Plus size={14} /> Adicionar item</button>
          </div>
        </>
      )}

      {block.type === 'image' && (
        <>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          {block.src ? (
            <div className="img-preview">
              <img src={block.src} alt="" />
              <div className="img-preview__actions">
                <div className="seg seg--sm">
                  {(['cover', 'contain'] as const).map((f) => (
                    <button key={f} className={`seg__btn${block.fit === f ? ' is-active' : ''}`} onClick={() => onPatch({ fit: f })}>{f === 'cover' ? 'Preencher' : 'Conter'}</button>
                  ))}
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>Trocar</button>
                <button className="btn btn--ghost btn--sm" onClick={() => onPatch({ src: null })}>Remover</button>
              </div>
            </div>
          ) : (
            <button className="btn btn--ghost" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /> Enviar imagem</button>
          )}
          <label className="field" style={{ marginTop: 10 }}>
            <span className="field__label">Altura: {Math.round(block.imageHeight * 100)}% da slide</span>
            <input type="range" min={15} max={80} value={Math.round(block.imageHeight * 100)} onChange={(e) => onPatch({ imageHeight: Number(e.target.value) / 100 })} />
          </label>
          <div className="field">
            <span className="field__label">Legenda</span>
            <MarkupField value={block.caption} onChange={(v) => onPatch({ caption: v })} placeholder="Legenda da imagem (opcional)" />
          </div>
          <div className="seg seg--sm">
            {(['above', 'below'] as const).map((p) => (
              <button key={p} className={`seg__btn${block.captionPos === p ? ' is-active' : ''}`} onClick={() => onPatch({ captionPos: p })}>{p === 'above' ? 'Legenda acima' : 'Legenda abaixo'}</button>
            ))}
          </div>
        </>
      )}

      {block.type === 'diagram' && <DiagramFields dg={block.diagram} onChange={onDiagram} />}

      {block.type === 'divider' && <p className="section__hint">Uma linha curta de separação.</p>}
    </div>
  );
}
