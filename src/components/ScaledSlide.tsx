import type { Carousel, Slide } from '../types';
import { DIMENSIONS } from '../lib/helpers';
import { SlideFrame } from './SlideFrame';

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
  /** display width in px; the frame renders at full 1080 and is scaled down. */
  targetWidth: number;
}

/**
 * Wraps a full-resolution SlideFrame and visually scales it. The scale lives on
 * an ancestor (`.cc-zoom`), never on the frame itself, so html-to-image always
 * captures the frame at full 1080px resolution.
 */
export function ScaledSlide({ slide, carousel, index, total, targetWidth }: Props) {
  const { w, h } = DIMENSIONS[carousel.aspect];
  const scale = targetWidth / w;
  return (
    <div className="cc-scaler" style={{ width: targetWidth, height: h * scale }}>
      <div
        className="cc-zoom"
        style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <SlideFrame slide={slide} carousel={carousel} index={index} total={total} />
      </div>
    </div>
  );
}
