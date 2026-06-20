import { Fragment } from 'react';
import type { Carousel, Slide } from '../types';
import { DIMENSIONS, bandForSlide } from '../lib/helpers';

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
}

/** Render a body string as paragraphs, preserving blank-line breaks. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n{1,}/).filter((p) => p.trim().length > 0);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  );
}

function LayoutBody({ slide }: { slide: Slide }) {
  const c = slide.content;
  const showEyebrow = slide.layers.eyebrow && c.eyebrow.trim().length > 0;

  switch (slide.layout) {
    case 'cover':
      return (
        <div className="cc-stack cc-stack--cover">
          {showEyebrow && <span className="cc-eyebrow">{c.eyebrow}</span>}
          <h1 className="cc-title cc-title--xl">{c.title}</h1>
          {c.subtitle && <p className="cc-subtitle">{c.subtitle}</p>}
        </div>
      );

    case 'text':
      return (
        <div className="cc-stack">
          {showEyebrow && <span className="cc-eyebrow">{c.eyebrow}</span>}
          {c.title && <h2 className="cc-title">{c.title}</h2>}
          <div className="cc-body">
            <Paragraphs text={c.body} />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className="cc-stack">
          {showEyebrow && <span className="cc-eyebrow">{c.eyebrow}</span>}
          {c.title && <h2 className="cc-title">{c.title}</h2>}
          <ol className="cc-list">
            {c.items.map((item, i) => (
              <li key={i} className="cc-list__item">
                <span className="cc-list__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cc-list__text">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'quote':
      return (
        <div className="cc-stack cc-stack--quote">
          <blockquote className="cc-quote">{c.quote}</blockquote>
          {c.author && <cite className="cc-cite">— {c.author}</cite>}
        </div>
      );

    case 'statistic':
      return (
        <div className="cc-stack cc-stack--stat">
          {showEyebrow && <span className="cc-eyebrow">{c.eyebrow}</span>}
          <span className="cc-stat">{c.stat}</span>
          {c.statLabel && <span className="cc-stat__label">{c.statLabel}</span>}
          {c.body && (
            <div className="cc-body">
              <Paragraphs text={c.body} />
            </div>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="cc-stack cc-stack--image">
          <div className="cc-imagewrap" data-fit={c.imageFit}>
            {c.imageSrc ? (
              <img className="cc-image" src={c.imageSrc} alt="" data-fit={c.imageFit} />
            ) : (
              <div className="cc-image cc-image--placeholder">Adicione uma imagem</div>
            )}
          </div>
          {(c.title || c.body) && (
            <div className="cc-caption">
              {c.title && <h3 className="cc-caption__title">{c.title}</h3>}
              {c.body && <p className="cc-caption__body">{c.body}</p>}
            </div>
          )}
        </div>
      );

    case 'cta':
      return (
        <div className="cc-stack cc-stack--cta">
          {showEyebrow && <span className="cc-eyebrow">{c.eyebrow}</span>}
          <h2 className="cc-title cc-title--lg">{c.title}</h2>
          <span className="cc-rule" />
          {c.subtitle && <p className="cc-subtitle">{c.subtitle}</p>}
        </div>
      );

    default:
      return null;
  }
}

/** A panorama band: one image sliced across several consecutive slides. */
function PanoramaLayer({ slide, carousel }: { slide: Slide; carousel: Carousel }) {
  const slice = bandForSlide(carousel, slide.id);
  if (!slice) return null;
  const { band, index, count } = slice;
  const posX = count > 1 ? (index / (count - 1)) * 100 : 50;
  return (
    <div
      className="cc-band"
      data-position={band.position}
      style={{
        height: band.position === 'full' ? '100%' : `${band.heightRatio * 100}%`,
        opacity: band.opacity,
        backgroundImage: `url(${band.src})`,
        backgroundSize: `${count * 100}% 100%`,
        backgroundPosition: `${posX}% 50%`,
      }}
    />
  );
}

export function SlideFrame({ slide, carousel, index, total }: Props) {
  const { w, h } = DIMENSIONS[carousel.aspect];
  const L = slide.layers;
  const showRef = L.reference && slide.content.reference.trim().length > 0;
  const showMark =
    L.decorativeMark && (slide.layout === 'quote' || slide.layout === 'text' || slide.layout === 'cover');

  return (
    <div
      className="cc-frame"
      data-mode={carousel.mode}
      data-bg={slide.background}
      data-align={slide.align}
      data-layout={slide.layout}
      data-aspect={carousel.aspect}
      data-export-id={slide.id}
      style={{ width: w, height: h }}
    >
      {L.backgroundAccents && (
        <Fragment>
          <div className="cc-accents" aria-hidden />
          {/* the grain (an expensive SVG turbulence) only matters for somatic */}
          {carousel.mode === 'somatic-sanctuary' && <div className="cc-grain" aria-hidden />}
        </Fragment>
      )}

      <PanoramaLayer slide={slide} carousel={carousel} />

      {showMark && (
        <span className="cc-mark" aria-hidden>
          &#8220;
        </span>
      )}

      <div className="cc-content">
        <LayoutBody slide={slide} />
      </div>

      {showRef && (
        <div className="cc-ref">
          <span className="cc-ref__tag">REF</span>
          <span className="cc-ref__text">{slide.content.reference}</span>
        </div>
      )}

      <footer className="cc-footer">
        {L.logo ? <span className="cc-brand">{carousel.brandName}</span> : <span />}
        <span className="cc-footer__right">
          {L.logo && carousel.handle && <span className="cc-handle">{carousel.handle}</span>}
          {L.pagination && (
            <span className="cc-page">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          )}
        </span>
      </footer>
    </div>
  );
}
