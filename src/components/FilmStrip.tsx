import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useCarousel } from '../state/CarouselContext';
import { DIMENSIONS } from '../lib/helpers';
import { ScaledSlide } from './ScaledSlide';
import { AddSlideMenu } from './AddSlideMenu';

const DISPLAY_HEIGHT = 392;

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export function FilmStrip() {
  const { carousel, selectedId, setSelectedId, dispatch } = useCarousel();
  const { w, h } = DIMENSIONS[carousel.aspect];
  const targetWidth = DISPLAY_HEIGHT * (w / h);
  const total = carousel.slides.length;

  // Detect slides whose text overflows the fixed 1080px frame (and is clipped
  // on export). Measured at full resolution; the on-screen scale is on an
  // ancestor and doesn't affect layout metrics.
  const [overflowIds, setOverflowIds] = useState<Set<string>>(new Set());
  const measure = useCallback(() => {
    const next = new Set<string>();
    document.querySelectorAll<HTMLElement>('.cc-frame').forEach((frame) => {
      const id = frame.getAttribute('data-export-id');
      const anchor = frame.querySelector<HTMLElement>('.cc-anchor');
      const content = anchor?.firstElementChild as HTMLElement | null;
      if (id && anchor && content && content.scrollHeight - anchor.clientHeight > 2) {
        next.add(id);
      }
    });
    setOverflowIds((prev) => (sameSet(prev, next) ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [carousel, measure]);

  // re-measure once fonts are ready (glyph metrics change line wrapping)
  useEffect(() => {
    let active = true;
    document.fonts?.ready.then(() => active && measure());
    return () => {
      active = false;
    };
  }, [measure]);

  return (
    <div className="strip">
      <div className="strip__track">
        {carousel.slides.map((slide, i) => {
          const selected = slide.id === selectedId;
          const overflowing = overflowIds.has(slide.id);
          return (
            <div key={slide.id} className="strip__cell">
              <span className="strip__index">
                {String(i + 1).padStart(2, '0')}
                {overflowing && (
                  <span className="strip__warn" title="O texto ultrapassa o slide e será cortado na exportação. Encurte o texto ou mova elementos.">
                    <AlertTriangle size={13} /> texto cortado
                  </span>
                )}
              </span>
              <button
                type="button"
                className={`strip__slide${selected ? ' is-selected' : ''}`}
                onClick={() => setSelectedId(slide.id)}
                aria-label={`Selecionar slide ${i + 1}`}
              >
                <ScaledSlide
                  slide={slide}
                  carousel={carousel}
                  index={i}
                  total={total}
                  targetWidth={targetWidth}
                />
              </button>
            </div>
          );
        })}

        <div className="strip__cell strip__cell--add" style={{ height: DISPLAY_HEIGHT }}>
          <AddSlideMenu onAdd={(preset) => dispatch({ type: 'addSlide', preset, afterId: selectedId ?? undefined })} />
        </div>
      </div>
    </div>
  );
}
