import { useCarousel } from '../state/CarouselContext';
import { DIMENSIONS } from '../lib/helpers';
import { ScaledSlide } from './ScaledSlide';
import { AddSlideMenu } from './AddSlideMenu';

const DISPLAY_HEIGHT = 392;

export function FilmStrip() {
  const { carousel, selectedId, setSelectedId, dispatch } = useCarousel();
  const { w, h } = DIMENSIONS[carousel.aspect];
  const targetWidth = DISPLAY_HEIGHT * (w / h);
  const total = carousel.slides.length;

  return (
    <div className="strip">
      <div className="strip__track">
        {carousel.slides.map((slide, i) => {
          const selected = slide.id === selectedId;
          return (
            <div key={slide.id} className="strip__cell">
              <span className="strip__index">{String(i + 1).padStart(2, '0')}</span>
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
          <AddSlideMenu onAdd={(layout) => dispatch({ type: 'addSlide', layout, afterId: selectedId ?? undefined })} />
        </div>
      </div>
    </div>
  );
}
