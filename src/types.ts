// ---------------------------------------------------------------------------
// Clinical Canvas — domain types
// ---------------------------------------------------------------------------

/** The four visual identities the whole carousel can adopt. */
export type DesignModeId =
  | 'minimalist-academic'
  | 'earth-clinical'
  | 'narrative-compass'
  | 'somatic-sanctuary';

/** Instagram-friendly output ratios. */
export type AspectId = 'portrait' | 'square';

/** The structural template a single slide uses. */
export type LayoutId =
  | 'cover'
  | 'text'
  | 'list'
  | 'quote'
  | 'statistic'
  | 'image'
  | 'cta';

export type TextAlign = 'left' | 'center';

/** How a slide paints its background. Lets the user kill gradients etc. */
export type BackgroundStyle = 'solid' | 'soft' | 'gradient' | 'image';

/**
 * A continuous image that spans several consecutive slides to create the
 * "seamless swipe" effect. The image lives on the carousel; each slide knows
 * which band it belongs to and at which index, so it can show its slice.
 */
export interface PanoramaBand {
  id: string;
  src: string;
  /** ids of the slides this band covers, left-to-right. */
  slideIds: string[];
  /** vertical placement of the band within each slide. */
  position: 'top' | 'center' | 'bottom' | 'full';
  /** 0..1 — how tall the band is relative to the slide (ignored when full). */
  heightRatio: number;
  /** 0..1 opacity so it can sit behind text as a soft accent. */
  opacity: number;
}

/** Per-element visibility. Everything is toggleable. */
export interface SlideLayers {
  eyebrow: boolean;
  pagination: boolean;
  backgroundAccents: boolean;
  decorativeMark: boolean;
  reference: boolean;
  logo: boolean;
}

/** The editable content of a slide. Fields are used per-layout. */
export interface SlideContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  items: string[];
  quote: string;
  author: string;
  stat: string;
  statLabel: string;
  reference: string;
  imageSrc: string | null;
  imageFit: 'cover' | 'contain';
}

export interface Slide {
  id: string;
  layout: LayoutId;
  align: TextAlign;
  background: BackgroundStyle;
  content: SlideContent;
  layers: SlideLayers;
}

export interface Carousel {
  /** schema version, for future migrations of persisted state. */
  version: number;
  mode: DesignModeId;
  aspect: AspectId;
  handle: string;
  brandName: string;
  slides: Slide[];
  bands: PanoramaBand[];
}
