import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { DIMENSIONS } from '../lib/helpers';
import { ScaledSlide } from './ScaledSlide';

export function PreviewModal({ onClose }: { onClose: () => void }) {
  const { carousel, selectedId } = useCarousel();
  const total = carousel.slides.length;
  const start = Math.max(0, carousel.slides.findIndex((s) => s.id === selectedId));
  const [i, setI] = useState(start === -1 ? 0 : start);

  const prev = () => setI((v) => Math.max(0, v - 1));
  const next = () => setI((v) => Math.min(total - 1, v + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { w, h } = DIMENSIONS[carousel.aspect];
  // fit within viewport
  const targetHeight = Math.min(760, window.innerHeight - 160);
  const targetWidth = targetHeight * (w / h);
  const slide = carousel.slides[i];

  return (
    <div className="preview" role="dialog" aria-modal="true">
      <button className="preview__close" onClick={onClose} aria-label="Fechar">
        <X size={24} />
      </button>

      <button className="preview__nav preview__nav--prev" onClick={prev} disabled={i === 0} aria-label="Anterior">
        <ChevronLeft size={40} />
      </button>

      <div className="preview__stage">
        <ScaledSlide slide={slide} carousel={carousel} index={i} total={total} targetWidth={targetWidth} />
        <div className="preview__dots">
          {carousel.slides.map((s, j) => (
            <button
              key={s.id}
              className={`preview__dot${j === i ? ' is-active' : ''}`}
              onClick={() => setI(j)}
              aria-label={`Ir para slide ${j + 1}`}
            />
          ))}
        </div>
      </div>

      <button className="preview__nav preview__nav--next" onClick={next} disabled={i === total - 1} aria-label="Próximo">
        <ChevronRight size={40} />
      </button>
    </div>
  );
}
