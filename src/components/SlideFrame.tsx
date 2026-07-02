import { Fragment, useEffect, useState } from 'react';
import type { Block, Carousel, ElementAlign, Slide } from '../types';
import { DIMENSIONS, bandForSlide, customBgVars, isHex } from '../lib/helpers';
import { BLOCK_FONT_FAMILY } from '../designModes';
import { renderRich } from '../lib/richText';
import { Diagram } from './Diagram';
import { Decorations } from './Decorations';

const HEADING_PX: Record<Block['size'], number> = { xl: 104, lg: 90, md: 76, sm: 54 };

function Paragraphs({ text }: { text: string }) {
  const parts = text.split(/\n{1,}/).filter((p) => p.trim().length > 0);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i}>{renderRich(p)}</p>
      ))}
    </>
  );
}

function BlockView({ block, slideAlign, frameH }: { block: Block; slideAlign: Slide['align']; frameH: number }) {
  const align: ElementAlign = block.align === 'inherit' ? slideAlign : block.align;
  const s = block.scale;
  const fz = (px: number) => ({ fontSize: `${px * s}px` });

  let inner: React.ReactNode = null;
  switch (block.type) {
    case 'heading':
      inner = <h2 className="cc-h" style={fz(HEADING_PX[block.size])}>{renderRich(block.text)}</h2>;
      break;
    case 'paragraph':
      inner = <div className="cc-p" style={fz(36)}><Paragraphs text={block.text} /></div>;
      break;
    case 'list':
      inner = (
        <ol className="cc-list" data-marker={block.marker}>
          {block.items.map((item, i) => (
            <li key={i} className="cc-list__item">
              {block.marker === 'number' ? (
                <span className="cc-list__num" style={fz(54)}>{String(i + 1).padStart(2, '0')}</span>
              ) : block.marker === 'arrow' ? (
                <span className="cc-list__arrow" style={fz(40)} aria-hidden>→</span>
              ) : block.marker === 'dash' ? (
                <span className="cc-list__dash" aria-hidden />
              ) : (
                <span className={`cc-list__bullet cc-list__bullet--${block.marker}`} aria-hidden />
              )}
              <span className="cc-list__text" style={fz(37)}>{renderRich(item)}</span>
            </li>
          ))}
        </ol>
      );
      break;
    case 'quote':
      inner = (
        <>
          <blockquote className="cc-quote" style={fz(70)}>{renderRich(block.text)}</blockquote>
          {block.author && <cite className="cc-cite" style={fz(28)}>— {block.author}</cite>}
        </>
      );
      break;
    case 'statistic':
      inner = (
        <>
          <span className="cc-stat" style={fz(200)}>{block.stat}</span>
          {block.statLabel && <span className="cc-stat__label" style={fz(42)}>{renderRich(block.statLabel)}</span>}
          {block.body && <div className="cc-p cc-stat__body" style={fz(32)}><Paragraphs text={block.body} /></div>}
        </>
      );
      break;
    case 'diagram':
      inner = <div className="cc-diagram"><Diagram config={block.diagram} /></div>;
      break;
    case 'image':
      inner = (
        <figure className="cc-imgblock">
          {block.caption && block.captionPos === 'above' && <figcaption className="cc-caption" style={fz(26)}>{renderRich(block.caption)}</figcaption>}
          {block.src ? (
            <img className="cc-img" src={block.src} alt="" style={{ height: `${block.imageHeight * frameH}px`, objectFit: block.fit }} />
          ) : (
            <div className="cc-img cc-img--ph" style={{ height: `${block.imageHeight * frameH}px` }}>imagem</div>
          )}
          {block.caption && block.captionPos === 'below' && <figcaption className="cc-caption" style={fz(26)}>{renderRich(block.caption)}</figcaption>}
        </figure>
      );
      break;
    case 'divider':
      inner = <span className="cc-rule" />;
      break;
    default:
      inner = null;
  }
  // per-block colour + font overrides, applied as CSS vars on the wrapper so
  // every inner element (heading, list markers, stat, divider…) shifts together.
  const filled = isHex(block.bgColor);
  const boxed = block.boxed;
  const style: Record<string, string | number | undefined> = {
    marginTop: block.spaceTop ? `${block.spaceTop}px` : undefined,
    paddingLeft: block.padX ? `${block.padX}px` : undefined,
    paddingRight: block.padX ? `${block.padX}px` : undefined,
  };
  // A non-boxed block with a fill keeps the simple background on the wrapper.
  // A boxed block moves the fill/padding to an inner .cc-box so the box can be
  // fully customised (background, border, rounded corners, padding).
  if (filled && !boxed) style.background = block.bgColor;
  if (isHex(block.textColor)) {
    style['--cc-heading'] = block.textColor;
    style['--cc-ink'] = block.textColor;
  }
  if (isHex(block.accentColor)) style['--cc-accent'] = block.accentColor;
  const family = BLOCK_FONT_FAMILY[block.font];
  if (family) {
    style['--cc-serif'] = family;
    style['--cc-sans'] = family;
  }

  let content: React.ReactNode = inner;
  if (boxed) {
    const boxStyle: React.CSSProperties = {
      background: filled ? block.bgColor : undefined,
      border: block.boxBorder ? '1px solid var(--cc-line)' : 'none',
      borderRadius: `${block.boxRadius}px`,
      padding: `${block.boxPadY}px ${block.boxPadX}px`,
      width: `${block.boxWidth * 100}%`,
    };
    // a box narrower than the column is positioned by the block's alignment
    if (block.boxWidth < 1) {
      boxStyle.marginLeft = align === 'left' ? 0 : 'auto';
      boxStyle.marginRight = align === 'right' ? 0 : 'auto';
    }
    content = <div className="cc-box" style={boxStyle}>{inner}</div>;
  }

  return (
    <div
      className={`cc-block${filled && !boxed ? ' cc-block--filled' : ''}`}
      data-balign={align}
      data-type={block.type}
      style={style as React.CSSProperties}
    >
      {content}
    </div>
  );
}

/** Measure an image's aspect ratio (w/h) once it loads; null until known. */
function useImageAspect(src: string): number | null {
  const [aspect, setAspect] = useState<number | null>(null);
  useEffect(() => {
    setAspect(null);
    if (!src) return;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (active && img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = src;
    if (img.complete && img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
    return () => {
      active = false;
    };
  }, [src]);
  return aspect;
}

function PanoramaLayer({ slide, carousel }: { slide: Slide; carousel: Carousel }) {
  const slice = bandForSlide(carousel, slide.id);
  const aspect = useImageAspect(slice?.band.src ?? '');
  if (!slice) return null;
  const { band, index, count } = slice;
  if (band.hiddenSlideIds.includes(slide.id)) return null; // per-slide off

  const { w, h } = DIMENSIONS[carousel.aspect];
  const bandH = band.position === 'full' ? h : band.heightRatio * h;

  // The image occupies a horizontal strip that can leave part of the first slide
  // (startInset) and last slide (endInset) empty — a strip crossing the seam.
  const startX = band.startInset * w; // empty on the left of the first slide
  const endX = band.endInset * w; // empty on the right of the last slide
  const visibleStart = startX; // strip coord where the image begins
  const visibleEnd = count * w - endX; // strip coord where the image ends
  const visibleW = visibleEnd - visibleStart;
  const a = aspect ?? 1.5; // sensible fallback for the first frame before it loads

  // Scale the image to COVER the visible strip (no stretch), then zoom in further.
  // Whichever axis needs the bigger scale wins; the other axis is cropped.
  let rw: number, rh: number;
  if (bandH * a >= visibleW) {
    rh = bandH;
    rw = bandH * a;
  } else {
    rw = visibleW;
    rh = visibleW / a;
  }
  rw *= band.zoom;
  rh *= band.zoom;

  // Place the cropped image by the focal point (strip coordinates).
  const imageLeft = visibleStart - (rw - visibleW) * band.focusX;
  const offsetY = -(rh - bandH) * band.focusY;

  // This slide's horizontal window in slide-local px: the first slide starts at
  // startX, the last ends at w-endX, the middle slides are full width.
  const x0 = index === 0 ? startX : 0;
  const x1 = index === count - 1 ? w - endX : w;
  const boxW = x1 - x0;
  if (boxW <= 0) return null;

  const front = band.frontSlideIds.includes(slide.id);

  return (
    <div
      className="cc-band"
      data-position={band.position}
      data-layer={front ? 'front' : 'back'}
      style={{
        left: `${x0}px`,
        right: 'auto',
        width: `${boxW}px`,
        height: band.position === 'full' ? '100%' : `${band.heightRatio * 100}%`,
        opacity: band.opacity,
        backgroundImage: `url(${band.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${rw}px ${rh}px`,
        // band-local origin sits at strip coord (index*w + x0)
        backgroundPosition: `${imageLeft - (index * w + x0)}px ${offsetY}px`,
      }}
    />
  );
}

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
}

export function SlideFrame({ slide, carousel, index, total }: Props) {
  const { w, h } = DIMENSIONS[carousel.aspect];
  const L = slide.layers;
  const bg = slide.bgImage;
  const showRef = L.reference && slide.reference.trim().length > 0;
  const showEyebrow = L.eyebrow && slide.eyebrow.trim().length > 0;
  const eyebrowAlign = slide.eyebrowAlign === 'inherit' ? slide.align : slide.eyebrowAlign;
  const eyebrowTop = showEyebrow && slide.eyebrowPlacement === 'top';
  const eyebrowInline = showEyebrow && slide.eyebrowPlacement === 'inline';

  // 'custom' bgColor injects its palette inline (the dynamic hex wins over the
  // mode + remaps text for legibility); the named swatches use CSS in modes.css.
  const customBg = slide.bgColor === 'custom' && isHex(slide.bgCustom);
  const frameStyle: Record<string, string | number> = { width: w, height: h };
  if (customBg) Object.assign(frameStyle, customBgVars(slide.bgCustom));

  // A panorama part set to "front" on this slide should OCCUPY space (not just
  // overlay the text): reserve its height so the text column reflows into what's
  // left. Cleanly supported for top/bottom bands (full/center stay as overlay).
  const pano = bandForSlide(carousel, slide.id);
  const panoFront =
    !!pano && pano.band.frontSlideIds.includes(slide.id) && !pano.band.hiddenSlideIds.includes(slide.id);
  const panoH = pano ? pano.band.heightRatio * h : 0;
  const reserveTop = panoFront && pano!.band.position === 'top' ? panoH : 0;
  const reserveBottom = panoFront && pano!.band.position === 'bottom' ? panoH : 0;

  return (
    <div
      className="cc-frame"
      data-mode={carousel.mode}
      data-bg={slide.background}
      data-bgcolor={slide.bgColor}
      data-align={slide.align}
      data-aspect={carousel.aspect}
      data-export-id={slide.id}
      style={frameStyle as React.CSSProperties}
    >
      {bg && (
        <Fragment>
          <img className="cc-bgimage" src={bg.src} alt="" style={{ opacity: bg.opacity, objectFit: bg.fit, objectPosition: `${bg.focusX * 100}% ${bg.focusY * 100}%` }} />
          {bg.overlay > 0 && <div className="cc-bgscrim" style={{ opacity: bg.overlay }} aria-hidden />}
        </Fragment>
      )}

      {L.backgroundAccents && (
        <Fragment>
          <div className="cc-accents" aria-hidden />
          {carousel.mode === 'somatic-sanctuary' && <div className="cc-grain" aria-hidden />}
        </Fragment>
      )}

      <PanoramaLayer slide={slide} carousel={carousel} />
      <Decorations decorations={slide.decorations.filter((d) => !d.front)} w={w} h={h} className="cc-decos cc-decos--back" />

      {L.decorativeMark && <span className="cc-mark" aria-hidden>&#8220;</span>}

      {L.swipe && (
        <span className="cc-swipe" data-pos={carousel.swipePosition} aria-hidden>
          {carousel.swipeLabel && carousel.swipeText.trim() && <span className="cc-swipe__label">{carousel.swipeText}</span>}
          <svg viewBox="0 0 40 24" className="cc-swipe__icon" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12 H30 M22 5 L31 12 L22 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      {reserveTop > 0 && <div className="cc-band-space" style={{ height: reserveTop }} aria-hidden />}

      <div className="cc-editorial">
        {eyebrowTop && (
          <span className="cc-eyebrow cc-eyebrow--top" style={{ textAlign: eyebrowAlign }}>{slide.eyebrow}</span>
        )}
        <div className="cc-anchor" data-anchor={slide.contentAnchor}>
          <div className="cc-content">
            {eyebrowInline && (
              <span className="cc-eyebrow" style={{ textAlign: eyebrowAlign, width: '100%' }}>{slide.eyebrow}</span>
            )}
            {slide.blocks.map((block) => (
              <BlockView key={block.id} block={block} slideAlign={slide.align} frameH={h} />
            ))}
          </div>
        </div>
      </div>

      {showRef && (
        <div className="cc-ref">
          <span className="cc-ref__tag">REF</span>
          <span className="cc-ref__text">{slide.reference}</span>
        </div>
      )}

      <footer className="cc-footer" data-rule={carousel.footerRule ? 'on' : 'off'}>
        {(() => {
          const brand = L.logo ? (
            carousel.logoSrc ? (
              <img className="cc-logo" src={carousel.logoSrc} alt={carousel.brandName} />
            ) : (
              <span className="cc-brand">
                <span className="cc-brand__name">{carousel.brandName}</span>
                {carousel.credential.trim() && <span className="cc-credential">{carousel.credential}</span>}
              </span>
            )
          ) : null;
          const handle = L.logo && carousel.handle ? <span className="cc-handle">{carousel.handle}</span> : null;
          const page = L.pagination ? (
            <span className="cc-page">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
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

      {reserveBottom > 0 && <div className="cc-band-space" style={{ height: reserveBottom }} aria-hidden />}

      <Decorations decorations={slide.decorations.filter((d) => d.front)} w={w} h={h} className="cc-decos cc-decos--front" />
    </div>
  );
}
