import { Fragment } from 'react';
import type { Carousel, Slide } from '../types';
import { LAYOUT_MAP } from '../designModes';
import { DIMENSIONS, bandForSlide } from '../lib/helpers';
import { Diagram } from './Diagram';
import { Decorations } from './Decorations';

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
}

/** Render a body string as paragraphs, preserving blank-line breaks. */
function Paragraphs({ text }: { text: string }) {
  const parts = text.split(/\n{1,}/).filter((p) => p.trim().length > 0);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

/** Everything in a slide except the eyebrow (which is positioned separately). */
function LayoutBody({ slide }: { slide: Slide }) {
  const c = slide.content;

  switch (slide.layout) {
    case 'cover':
      return (
        <div className="cc-stack cc-stack--cover">
          <h1 className="cc-title cc-title--xl">{c.title}</h1>
          {c.subtitle && <p className="cc-subtitle">{c.subtitle}</p>}
        </div>
      );

    case 'text':
      return (
        <div className="cc-stack">
          {c.title && <h2 className="cc-title">{c.title}</h2>}
          <div className="cc-body">
            <Paragraphs text={c.body} />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className="cc-stack">
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
          <span className="cc-stat">{c.stat}</span>
          {c.statLabel && <span className="cc-stat__label">{c.statLabel}</span>}
          {c.body && (
            <div className="cc-body">
              <Paragraphs text={c.body} />
            </div>
          )}
        </div>
      );

    case 'diagram':
      return (
        <div className="cc-stack cc-stack--diagram">
          {c.title && <h2 className="cc-title cc-title--sm">{c.title}</h2>}
          <div className="cc-diagram">
            <Diagram config={slide.diagram} />
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="cc-stack cc-stack--cta">
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
  const c = slide.content;
  const img = slide.image;
  const placement = img?.placement ?? 'none';

  const showRef = L.reference && c.reference.trim().length > 0;
  const showMark =
    L.decorativeMark && (slide.layout === 'quote' || slide.layout === 'text' || slide.layout === 'cover');
  const usesEyebrow = LAYOUT_MAP[slide.layout].fields.includes('eyebrow');
  const showEyebrow = L.eyebrow && usesEyebrow && c.eyebrow.trim().length > 0;
  const eyebrowAlign = slide.eyebrowAlign === 'inherit' ? slide.align : slide.eyebrowAlign;
  const eyebrowTop = showEyebrow && slide.eyebrowPlacement === 'top';
  const eyebrowInline = showEyebrow && slide.eyebrowPlacement === 'inline';

  const sideMedia = img && placement !== 'background' && placement !== 'none';
  const mediaStyle =
    placement === 'left' || placement === 'right'
      ? { width: `${(img?.size ?? 0.5) * 100}%` }
      : { height: `${(img?.size ?? 0.5) * 100}%` };

  return (
    <div
      className="cc-frame"
      data-mode={carousel.mode}
      data-bg={slide.background}
      data-align={slide.align}
      data-layout={slide.layout}
      data-aspect={carousel.aspect}
      data-img={placement}
      data-export-id={slide.id}
      style={{ width: w, height: h }}
    >
      {/* background image sits behind the accents + content */}
      {img && placement === 'background' && (
        <Fragment>
          <img
            className="cc-bgimage"
            src={img.src}
            alt=""
            style={{ opacity: img.opacity, objectFit: img.fit, objectPosition: `${img.focusX * 100}% ${img.focusY * 100}%` }}
          />
          {img.overlay > 0 && <div className="cc-bgscrim" style={{ opacity: img.overlay }} aria-hidden />}
        </Fragment>
      )}

      {L.backgroundAccents && (
        <Fragment>
          <div className="cc-accents" aria-hidden />
          {carousel.mode === 'somatic-sanctuary' && <div className="cc-grain" aria-hidden />}
        </Fragment>
      )}

      <PanoramaLayer slide={slide} carousel={carousel} />

      <Decorations
        decorations={slide.decorations.filter((d) => !d.front)}
        w={w}
        h={h}
        className="cc-decos cc-decos--back"
      />

      {showMark && (
        <span className="cc-mark" aria-hidden>
          &#8220;
        </span>
      )}

      <div className="cc-main" data-placement={placement}>
        {sideMedia && (
          <div className="cc-media" style={mediaStyle}>
            <img
              src={img.src}
              alt=""
              style={{ objectFit: img.fit, objectPosition: `${img.focusX * 100}% ${img.focusY * 100}%` }}
            />
          </div>
        )}

        <div className="cc-editorial">
          {eyebrowTop && (
            <span className="cc-eyebrow cc-eyebrow--top" style={{ textAlign: eyebrowAlign }}>
              {c.eyebrow}
            </span>
          )}
          <div className="cc-anchor" data-anchor={slide.contentAnchor}>
            <div className="cc-content">
              {eyebrowInline && (
                <span className="cc-eyebrow" style={{ textAlign: eyebrowAlign, width: '100%' }}>
                  {c.eyebrow}
                </span>
              )}
              <LayoutBody slide={slide} />
            </div>
          </div>
        </div>
      </div>

      {showRef && (
        <div className="cc-ref">
          <span className="cc-ref__tag">REF</span>
          <span className="cc-ref__text">{c.reference}</span>
        </div>
      )}

      {L.swipe && (
        <span className="cc-swipe" aria-hidden>
          <span className="cc-swipe__label">arraste</span>
          <svg viewBox="0 0 40 24" className="cc-swipe__icon" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12 H30 M22 5 L31 12 L22 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <footer className="cc-footer">
        {(() => {
          const brand = L.logo ? (
            carousel.logoSrc ? (
              <img className="cc-logo" src={carousel.logoSrc} alt={carousel.brandName} />
            ) : (
              <span className="cc-brand">{carousel.brandName}</span>
            )
          ) : null;
          const handle = L.logo && carousel.handle ? <span className="cc-handle">{carousel.handle}</span> : null;
          const page = L.pagination ? (
            <span className="cc-page">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          ) : null;
          const leftEl = carousel.footerReversed ? handle : brand;
          const rightEl = carousel.footerReversed ? brand : handle;
          return (
            <>
              {leftEl ?? <span />}
              <span className="cc-footer__right">
                {rightEl}
                {page}
              </span>
            </>
          );
        })()}
      </footer>

      <Decorations
        decorations={slide.decorations.filter((d) => d.front)}
        w={w}
        h={h}
        className="cc-decos cc-decos--front"
      />
    </div>
  );
}
