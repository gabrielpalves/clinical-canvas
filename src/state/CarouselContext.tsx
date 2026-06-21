import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type {
  AspectId,
  Block,
  BlockType,
  Carousel,
  Decoration,
  DesignModeId,
  DiagramConfig,
  PanoramaBand,
  PresetId,
  Slide,
  SlideImage,
  SlideLayers,
} from '../types';
import {
  SCHEMA_VERSION,
  SLIDE_STYLE_DEFAULTS,
  createBlock,
  defaultDiagram,
  defaultLayers,
  presetSlide,
  seedCarousel,
  uid,
} from './factory';

const STORAGE_KEY = 'clinical-canvas:carousel:v1';

type SlideFieldPatch = Partial<
  Pick<
    Slide,
    'align' | 'contentAnchor' | 'background' | 'bgColor' | 'eyebrowAlign' | 'eyebrowPlacement' | 'eyebrow' | 'reference'
  >
>;

type Action =
  | { type: 'load'; carousel: Carousel }
  | { type: 'reset' }
  | { type: 'setMode'; mode: DesignModeId }
  | { type: 'setAspect'; aspect: AspectId }
  | { type: 'setMeta'; patch: Partial<Pick<Carousel, 'handle' | 'brandName' | 'logoSrc' | 'caption' | 'footerReversed'>> }
  | { type: 'applyTemplate'; slides: Slide[]; caption: string }
  | { type: 'addSlide'; preset: PresetId; afterId?: string }
  | { type: 'duplicateSlide'; id: string }
  | { type: 'deleteSlide'; id: string }
  | { type: 'moveSlide'; id: string; dir: -1 | 1 }
  | { type: 'updateSlide'; id: string; patch: SlideFieldPatch }
  | { type: 'updateLayers'; id: string; patch: Partial<SlideLayers> }
  | { type: 'addBlock'; id: string; blockType: BlockType; afterBlockId?: string }
  | { type: 'updateBlock'; id: string; blockId: string; patch: Partial<Block> }
  | { type: 'updateBlockDiagram'; id: string; blockId: string; patch: Partial<DiagramConfig> }
  | { type: 'removeBlock'; id: string; blockId: string }
  | { type: 'moveBlock'; id: string; blockId: string; dir: -1 | 1 }
  | { type: 'setBgImage'; id: string; image: SlideImage | null }
  | { type: 'updateBgImage'; id: string; patch: Partial<SlideImage> }
  | { type: 'addDecoration'; id: string; decoration: Decoration }
  | { type: 'updateDecoration'; id: string; decoId: string; patch: Partial<Decoration> }
  | { type: 'removeDecoration'; id: string; decoId: string }
  | { type: 'resetSlide'; id: string }
  | { type: 'addBand'; band: PanoramaBand }
  | { type: 'updateBand'; id: string; patch: Partial<PanoramaBand> }
  | { type: 'removeBand'; id: string };

function mapSlide(state: Carousel, id: string, fn: (s: Slide) => Slide): Carousel {
  return { ...state, slides: state.slides.map((s) => (s.id === id ? fn(s) : s)) };
}
function mapBlock(slide: Slide, blockId: string, fn: (b: Block) => Block): Slide {
  return { ...slide, blocks: slide.blocks.map((b) => (b.id === blockId ? fn(b) : b)) };
}

function reducer(state: Carousel, action: Action): Carousel {
  switch (action.type) {
    case 'load':
      return action.carousel;
    case 'reset':
      return seedCarousel();
    case 'setMode':
      return { ...state, mode: action.mode };
    case 'setAspect':
      return { ...state, aspect: action.aspect };
    case 'setMeta':
      return { ...state, ...action.patch };
    case 'applyTemplate':
      return { ...state, slides: action.slides, caption: action.caption, bands: [] };
    case 'addSlide': {
      const slide = presetSlide(action.preset);
      const idx = action.afterId
        ? state.slides.findIndex((s) => s.id === action.afterId)
        : state.slides.length - 1;
      const next = [...state.slides];
      next.splice(idx + 1, 0, slide);
      return { ...state, slides: next };
    }
    case 'duplicateSlide': {
      const idx = state.slides.findIndex((s) => s.id === action.id);
      if (idx === -1) return state;
      const o = state.slides[idx];
      const copy: Slide = {
        ...o,
        id: uid(),
        blocks: o.blocks.map((b) => ({ ...b, id: uid(), items: [...b.items], diagram: { ...b.diagram } })),
        decorations: o.decorations.map((d) => ({ ...d, id: uid() })),
        layers: { ...o.layers },
      };
      const next = [...state.slides];
      next.splice(idx + 1, 0, copy);
      return { ...state, slides: next };
    }
    case 'deleteSlide': {
      if (state.slides.length <= 1) return state;
      const slides = state.slides.filter((s) => s.id !== action.id);
      const bands = state.bands
        .map((b) => ({ ...b, slideIds: b.slideIds.filter((sid) => sid !== action.id) }))
        .filter((b) => b.slideIds.length >= 2);
      return { ...state, slides, bands };
    }
    case 'moveSlide': {
      const idx = state.slides.findIndex((s) => s.id === action.id);
      const target = idx + action.dir;
      if (idx === -1 || target < 0 || target >= state.slides.length) return state;
      const next = [...state.slides];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...state, slides: next };
    }
    case 'updateSlide':
      return mapSlide(state, action.id, (s) => ({ ...s, ...action.patch }));
    case 'updateLayers':
      return mapSlide(state, action.id, (s) => ({ ...s, layers: { ...s.layers, ...action.patch } }));
    case 'addBlock':
      return mapSlide(state, action.id, (s) => {
        const block = createBlock(action.blockType);
        const idx = action.afterBlockId ? s.blocks.findIndex((b) => b.id === action.afterBlockId) : s.blocks.length - 1;
        const blocks = [...s.blocks];
        blocks.splice(idx + 1, 0, block);
        return { ...s, blocks };
      });
    case 'updateBlock':
      return mapSlide(state, action.id, (s) => mapBlock(s, action.blockId, (b) => ({ ...b, ...action.patch })));
    case 'updateBlockDiagram':
      return mapSlide(state, action.id, (s) =>
        mapBlock(s, action.blockId, (b) => ({ ...b, diagram: { ...b.diagram, ...action.patch } })),
      );
    case 'removeBlock':
      return mapSlide(state, action.id, (s) =>
        s.blocks.length <= 1 ? s : { ...s, blocks: s.blocks.filter((b) => b.id !== action.blockId) },
      );
    case 'moveBlock':
      return mapSlide(state, action.id, (s) => {
        const idx = s.blocks.findIndex((b) => b.id === action.blockId);
        const target = idx + action.dir;
        if (idx === -1 || target < 0 || target >= s.blocks.length) return s;
        const blocks = [...s.blocks];
        [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
        return { ...s, blocks };
      });
    case 'setBgImage':
      return mapSlide(state, action.id, (s) => ({ ...s, bgImage: action.image }));
    case 'updateBgImage':
      return mapSlide(state, action.id, (s) => (s.bgImage ? { ...s, bgImage: { ...s.bgImage, ...action.patch } } : s));
    case 'addDecoration':
      return mapSlide(state, action.id, (s) => ({ ...s, decorations: [...s.decorations, action.decoration] }));
    case 'updateDecoration':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        decorations: s.decorations.map((d) => (d.id === action.decoId ? { ...d, ...action.patch } : d)),
      }));
    case 'removeDecoration':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        decorations: s.decorations.filter((d) => d.id !== action.decoId),
      }));
    case 'resetSlide':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        ...SLIDE_STYLE_DEFAULTS,
        bgImage: null,
        decorations: [],
        layers: defaultLayers(),
      }));
    case 'addBand':
      return { ...state, bands: [...state.bands, action.band] };
    case 'updateBand':
      return { ...state, bands: state.bands.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)) };
    case 'removeBand':
      return { ...state, bands: state.bands.filter((b) => b.id !== action.id) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// migration of older persisted carousels into the v3 (block-based) schema
// ---------------------------------------------------------------------------

const hd = (text: string, size: Block['size']) => createBlock('heading', { text, size });
const pg = (text: string) => createBlock('paragraph', { text });

function blocksFromLegacy(layout: string, content: Record<string, unknown>, diagram: unknown): Block[] {
  const s = (k: string) => (content[k] as string) ?? '';
  const items = (content.items as string[]) ?? [];
  switch (layout) {
    case 'cover':
      return [hd(s('title'), 'xl'), pg(s('subtitle'))];
    case 'list':
      return [hd(s('title'), 'md'), createBlock('list', { items: [...items], numbered: true })];
    case 'quote':
      return [createBlock('quote', { text: s('quote'), author: s('author') })];
    case 'statistic':
      return [createBlock('statistic', { stat: s('stat'), statLabel: s('statLabel'), body: s('body') })];
    case 'diagram':
      return [hd(s('title'), 'md'), createBlock('diagram', { diagram: { ...defaultDiagram(), ...(diagram as object) } })];
    case 'cta':
      return [hd(s('title'), 'lg'), createBlock('divider'), pg(s('subtitle'))];
    case 'image':
      return [createBlock('image', { src: (content.imageSrc as string) ?? null, caption: s('title') }), pg(s('body'))];
    case 'text':
    default:
      return [hd(s('title'), 'md'), pg(s('body'))];
  }
}

function migrateToV3(old: Record<string, unknown>): Carousel {
  const slides: Slide[] = (old.slides as Array<Record<string, unknown>>).map((s) => {
    const content = (s.content as Record<string, unknown>) ?? {};
    const layout = (s.layout as string) ?? 'text';
    const img = s.image as SlideImage | null | undefined;
    let blocks = blocksFromLegacy(layout, content, s.diagram).filter((b) => {
      switch (b.type) {
        case 'divider':
        case 'diagram':
        case 'image':
          return true;
        case 'list':
          return b.items.length > 0;
        case 'statistic':
          return (b.stat + b.statLabel + b.body).trim().length > 0;
        case 'quote':
          return (b.text + b.author).trim().length > 0;
        default:
          return b.text.trim().length > 0;
      }
    });
    let bgImage: SlideImage | null = null;
    if (img && img.src) {
      if (img.placement === 'background') {
        bgImage = img;
      } else {
        const block = createBlock('image', { src: img.src, fit: img.fit ?? 'cover', imageHeight: img.size ?? 0.42 });
        if (img.placement === 'top') blocks = [block, ...blocks];
        else blocks = [...blocks, block];
      }
    }
    if (!blocks.length) blocks = [pg('')];
    const oldBg = s.background as string | undefined;
    const background: Slide['background'] =
      oldBg === 'soft' || oldBg === 'gradient' ? oldBg : 'solid';
    return {
      id: (s.id as string) ?? uid(),
      align: (s.align as Slide['align']) ?? SLIDE_STYLE_DEFAULTS.align,
      contentAnchor: (s.contentAnchor as Slide['contentAnchor']) ?? SLIDE_STYLE_DEFAULTS.contentAnchor,
      background,
      bgColor: (s.bgColor as Slide['bgColor']) ?? 'auto',
      bgImage,
      eyebrow: (content.eyebrow as string) ?? '',
      eyebrowAlign: (s.eyebrowAlign as Slide['eyebrowAlign']) ?? SLIDE_STYLE_DEFAULTS.eyebrowAlign,
      eyebrowPlacement: (s.eyebrowPlacement as Slide['eyebrowPlacement']) ?? SLIDE_STYLE_DEFAULTS.eyebrowPlacement,
      reference: (content.reference as string) ?? '',
      blocks,
      decorations: (s.decorations as Decoration[]) ?? [],
      layers: { ...defaultLayers(), ...((s.layers as Partial<SlideLayers>) ?? {}) },
    } satisfies Slide;
  });
  return {
    version: SCHEMA_VERSION,
    mode: (old.mode as DesignModeId) ?? 'earth-clinical',
    aspect: (old.aspect as AspectId) ?? 'portrait',
    handle: (old.handle as string) ?? '@psilaisabitencourt',
    brandName: (old.brandName as string) ?? 'Laísa Bitencourt · Psicóloga',
    logoSrc: (old.logoSrc as string | null) ?? null,
    footerReversed: (old.footerReversed as boolean) ?? false,
    caption: (old.caption as string) ?? '',
    slides,
    bands: (old.bands as Carousel['bands']) ?? [],
  };
}

/** Ensure a v3 carousel has every field current code expects (forward-compat). */
function normalize(c: Record<string, unknown>): Carousel {
  const carousel = c as unknown as Carousel;
  return {
    ...carousel,
    logoSrc: (c.logoSrc as string | null) ?? null,
    footerReversed: (c.footerReversed as boolean) ?? false,
    caption: (c.caption as string) ?? '',
    bands: (c.bands as Carousel['bands']) ?? [],
    slides: carousel.slides.map((s) => ({
      ...s,
      bgColor: s.bgColor ?? 'auto',
      decorations: s.decorations ?? [],
      layers: { ...defaultLayers(), ...s.layers },
      blocks: (s.blocks ?? []).map((b) => ({ ...createBlock(b.type), ...b, diagram: { ...defaultDiagram(), ...b.diagram } })),
    })),
  };
}

/** Turn an arbitrary parsed object into a valid current-schema carousel. */
export function coerceCarousel(parsed: Record<string, unknown>): Carousel | null {
  if (!parsed || !Array.isArray(parsed.slides) || !parsed.slides.length) return null;
  return parsed.version === SCHEMA_VERSION ? normalize(parsed) : migrateToV3(parsed);
}

function loadInitial(): Carousel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const coerced = coerceCarousel(JSON.parse(raw) as Record<string, unknown>);
      if (coerced) return coerced;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return seedCarousel();
}

interface CarouselContextValue {
  carousel: Carousel;
  dispatch: React.Dispatch<Action>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedSlide: Slide | null;
}

const Ctx = createContext<CarouselContextValue | null>(null);

export function CarouselProvider({ children }: { children: ReactNode }) {
  const [carousel, dispatch] = useReducer(reducer, undefined, loadInitial);
  const [selectedId, setSelectedId] = useState<string | null>(() => carousel.slides[0]?.id ?? null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carousel));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [carousel]);

  useEffect(() => {
    if (!carousel.slides.some((s) => s.id === selectedId)) {
      setSelectedId(carousel.slides[0]?.id ?? null);
    }
  }, [carousel.slides, selectedId]);

  const selectedSlide = useMemo(
    () => carousel.slides.find((s) => s.id === selectedId) ?? null,
    [carousel.slides, selectedId],
  );

  const value = useMemo<CarouselContextValue>(
    () => ({ carousel, dispatch, selectedId, setSelectedId, selectedSlide }),
    [carousel, selectedId, selectedSlide],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarousel(): CarouselContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCarousel must be used within CarouselProvider');
  return ctx;
}
