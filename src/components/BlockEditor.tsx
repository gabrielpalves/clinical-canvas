import { useRef } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import type { Block, DiagramConfig, ElementAlign, HeadingSize } from '../types';
import { fileToDataUrl } from '../lib/helpers';
import { DiagramFields } from './DiagramFields';

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

      {block.type === 'heading' && (
        <>
          <textarea className="input" rows={2} value={block.text} onChange={(e) => onPatch({ text: e.target.value })} />
          <div className="seg seg--sm" style={{ marginTop: 8 }}>
            {HEADING_SIZES.map((s) => (
              <button key={s.id} className={`seg__btn${block.size === s.id ? ' is-active' : ''}`} onClick={() => onPatch({ size: s.id })}>{s.label}</button>
            ))}
          </div>
        </>
      )}

      {block.type === 'paragraph' && (
        <textarea className="input" rows={4} value={block.text} onChange={(e) => onPatch({ text: e.target.value })} />
      )}

      {block.type === 'quote' && (
        <>
          <textarea className="input" rows={3} value={block.text} onChange={(e) => onPatch({ text: e.target.value })} placeholder="A citação" />
          <input className="input" style={{ marginTop: 8 }} value={block.author} onChange={(e) => onPatch({ author: e.target.value })} placeholder="Autoria" />
        </>
      )}

      {block.type === 'statistic' && (
        <>
          <input className="input" value={block.stat} onChange={(e) => onPatch({ stat: e.target.value })} placeholder="Número / dado" />
          <textarea className="input" style={{ marginTop: 8 }} rows={2} value={block.statLabel} onChange={(e) => onPatch({ statLabel: e.target.value })} placeholder="Legenda do dado" />
          <textarea className="input" style={{ marginTop: 8 }} rows={2} value={block.body} onChange={(e) => onPatch({ body: e.target.value })} placeholder="Texto de apoio (opcional)" />
        </>
      )}

      {block.type === 'list' && (
        <>
          <label className="toggle" style={{ marginBottom: 8 }}>
            <input type="checkbox" checked={block.numbered} onChange={(e) => onPatch({ numbered: e.target.checked })} />
            <span>Numerada (desligado = marcadores)</span>
          </label>
          <div className="items">
            {block.items.map((item, i) => (
              <div key={i} className="items__row">
                <span className="items__num">{block.numbered ? i + 1 : '•'}</span>
                <input className="input" value={item} onChange={(e) => {
                  const items = [...block.items];
                  items[i] = e.target.value;
                  onPatch({ items });
                }} />
                <button className="icon-btn icon-btn--danger" title="Remover item" onClick={() => onPatch({ items: block.items.filter((_, j) => j !== i) })}><X size={14} /></button>
              </div>
            ))}
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
          <label className="field">
            <span className="field__label">Legenda</span>
            <input className="input" value={block.caption} onChange={(e) => onPatch({ caption: e.target.value })} placeholder="Legenda da imagem (opcional)" />
          </label>
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
