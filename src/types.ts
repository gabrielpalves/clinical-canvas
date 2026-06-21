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

/** Starter presets for a new slide — they just pre-fill a set of blocks. */
export type PresetId =
  | 'cover'
  | 'text'
  | 'list'
  | 'quote'
  | 'statistic'
  | 'diagram'
  | 'cta'
  | 'blank';

/** The kinds of content block a slide can stack, in any order. */
export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'quote'
  | 'statistic'
  | 'diagram'
  | 'image'
  | 'divider';

export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl';

/** The clean vector figures available on a `diagram` slide. */
export type DiagramType = 'matrix' | 'venn' | 'distribution' | 'cycle' | 'table';

/**
 * Data behind a diagram. Each type uses the subset of fields it needs.
 * `labelSizes` holds a per-element size multiplier keyed by element id
 * (e.g. 'setA', 'q0', 'n2', 'xLabel'); missing keys default to 1.
 */
export interface DiagramConfig {
  type: DiagramType;
  /** per-element text size multipliers, applied on top of auto-fit. */
  labelSizes: Record<string, number>;
  /** per-element text rotation in degrees, keyed like labelSizes. */
  labelRots: Record<string, number>;

  /* matrix + distribution */
  xLabel: string;
  yLabel: string;
  /** matrix quadrants: top-left, top-right, bottom-left, bottom-right */
  quadrants: [string, string, string, string];
  /** matrix: show axes (off = a plain 2x2 table). */
  showAxes: boolean;

  /* venn */
  setA: string;
  setB: string;
  setC: string;
  overlap: string;
  /** number of circles (2 or 3). */
  vennCircles: 2 | 3;
  /** how much the circles overlap, 0 (apart) … 1 (heavy). */
  vennOverlap: number;
  /** circle radius multiplier for venn + cycle, 0.7–1.3. */
  circleScale: number;

  /* distribution */
  /** "region" label — freely positioned via markerX/markerY. */
  marker: string;
  /** "peak" label — freely positioned via peakX/peakY. */
  peak: string;
  /** label positions, 0..1 across the plot area (independent of the region). */
  peakX: number;
  peakY: number;
  markerX: number;
  markerY: number;
  /** highlighted band under the curve, 0..1 along the x-axis. */
  regionStart: number;
  regionEnd: number;

  /* cycle: 3–6 nodes of the loop */
  nodes: string[];

  /* table */
  rows: number;
  cols: number;
  /** first row is a styled header. */
  header: boolean;
  /** row-major cell contents, length rows*cols. */
  cells: string[];
}

/** A decorative shape that can be dropped onto a slide. */
export type DecorationKind =
  | 'blobA'
  | 'blobB'
  | 'circle'
  | 'ring'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'plus'
  | 'asterisk'
  | 'leaf'
  // Instagram-style action icons
  | 'heart'
  | 'comment'
  | 'share'
  | 'bookmark';

export interface Decoration {
  id: string;
  kind: DecorationKind;
  /** center position, 0..1 of the slide. */
  x: number;
  y: number;
  /** size relative to the slide width, ~0.05..0.7. */
  size: number;
  rotation: number;
  opacity: number;
  color: 'accent' | 'heading' | 'muted';
  /** filled vs. outline (ignored by line/arrow). */
  filled: boolean;
  /** render in front of the text instead of behind it. */
  front: boolean;
}

export type TextAlign = 'left' | 'center' | 'right';

/** Where the text block sits vertically within the slide. */
export type VerticalAnchor = 'top' | 'center' | 'bottom';

/** Alignment that can either follow the slide or be overridden per element. */
export type ElementAlign = 'inherit' | 'left' | 'center' | 'right';

/** Where the eyebrow sits: flowing with the text, or pinned near the top. */
export type EyebrowPlacement = 'inline' | 'top';

/** How a slide paints its background. Lets the user kill gradients etc. */
export type BackgroundStyle = 'solid' | 'soft' | 'gradient';

/** A per-slide background fill from the brand palette. 'auto' follows the mode
 *  (and uses BackgroundStyle); the others set a fixed colour with legible text. */
export type BgColor = 'auto' | 'offwhite' | 'beige' | 'gold' | 'brown' | 'wine' | 'blue';

/** Where an image lives on a slide. Non-background placements reflow the text. */
export type ImagePlacement = 'background' | 'left' | 'right' | 'top' | 'bottom';

/** A single image attached to one slide. */
export interface SlideImage {
  src: string;
  placement: ImagePlacement;
  fit: 'cover' | 'contain';
  /** 0..1 — fraction of the slide the image occupies (left/right/top/bottom). */
  size: number;
  /** focal point for `cover` crops, 0..1. */
  focusX: number;
  focusY: number;
  /** background only: image opacity, 0..1. */
  opacity: number;
  /** background only: strength of the readability scrim, 0..1. */
  overlay: number;
}

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
  /** "swipe / arraste" hint arrow. */
  swipe: boolean;
}

/**
 * One content block. A flat shape (rather than a strict union) so editing is
 * simple; each block type reads the subset of fields it needs.
 */
export interface Block {
  id: string;
  type: BlockType;
  /** alignment override; 'inherit' = follow the slide. */
  align: ElementAlign;
  /** per-block text size multiplier, applied on top of the defaults. */
  scale: number;
  /** extra space (px) above this block. */
  spaceTop: number;
  /** horizontal padding (px) inside this block. */
  padX: number;
  /** draw a bordered box around the block. */
  boxed: boolean;
  /** heading / paragraph / quote text. */
  text: string;
  /** heading size. */
  size: HeadingSize;
  /** list */
  items: string[];
  numbered: boolean;
  /** quote */
  author: string;
  /** statistic */
  stat: string;
  statLabel: string;
  body: string;
  /** diagram */
  diagram: DiagramConfig;
  /** image */
  src: string | null;
  fit: 'cover' | 'contain';
  imageHeight: number;
  caption: string;
  captionPos: 'below' | 'above';
}

export interface Slide {
  id: string;
  /** default alignment for the slide's text. */
  align: TextAlign;
  /** vertical position of the content stack. */
  contentAnchor: VerticalAnchor;
  background: BackgroundStyle;
  /** brand-palette background fill ('auto' = follow the mode). */
  bgColor: BgColor;
  /** optional full-bleed background image. */
  bgImage: SlideImage | null;
  /** slide-level eyebrow (above the blocks). */
  eyebrow: string;
  eyebrowAlign: ElementAlign;
  eyebrowPlacement: EyebrowPlacement;
  /** slide-level "REF:" citation, shown above the footer. */
  reference: string;
  /** the ordered content blocks. */
  blocks: Block[];
  /** decorative shapes layered on the slide. */
  decorations: Decoration[];
  layers: SlideLayers;
}

export interface Carousel {
  /** schema version, for future migrations of persisted state. */
  version: number;
  mode: DesignModeId;
  aspect: AspectId;
  handle: string;
  brandName: string;
  /** optional logo image shown in the footer instead of the signature text. */
  logoSrc: string | null;
  /** swap the footer: handle on the left, signature on the right. */
  footerReversed: boolean;
  /** show the word "arraste" next to the swipe arrow. */
  swipeLabel: boolean;
  /** where the swipe arrow sits. */
  swipePosition: 'bottom' | 'middle';
  /** the Instagram caption (+ hashtags); exported alongside the images. */
  caption: string;
  slides: Slide[];
  bands: PanoramaBand[];
}
