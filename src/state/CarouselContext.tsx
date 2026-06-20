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
  Carousel,
  DesignModeId,
  DiagramConfig,
  LayoutId,
  PanoramaBand,
  Slide,
  SlideContent,
  SlideImage,
  SlideLayers,
} from '../types';
import {
  SCHEMA_VERSION,
  SLIDE_STYLE_DEFAULTS,
  blankSlide,
  defaultDiagram,
  defaultImage,
  defaultLayers,
  emptyContent,
  seedCarousel,
  uid,
} from './factory';

const STORAGE_KEY = 'clinical-canvas:carousel:v1';

type Action =
  | { type: 'load'; carousel: Carousel }
  | { type: 'reset' }
  | { type: 'setMode'; mode: DesignModeId }
  | { type: 'setAspect'; aspect: AspectId }
  | { type: 'setMeta'; patch: Partial<Pick<Carousel, 'handle' | 'brandName' | 'logoSrc' | 'caption'>> }
  | { type: 'applyTemplate'; slides: Slide[]; caption: string }
  | { type: 'addSlide'; layout: LayoutId; afterId?: string }
  | { type: 'duplicateSlide'; id: string }
  | { type: 'deleteSlide'; id: string }
  | { type: 'moveSlide'; id: string; dir: -1 | 1 }
  | {
      type: 'updateSlide';
      id: string;
      patch: Partial<
        Pick<
          Slide,
          'layout' | 'align' | 'background' | 'contentAnchor' | 'eyebrowAlign' | 'eyebrowPlacement'
        >
      >;
    }
  | { type: 'updateContent'; id: string; patch: Partial<SlideContent> }
  | { type: 'updateLayers'; id: string; patch: Partial<SlideLayers> }
  | { type: 'setImage'; id: string; image: SlideImage | null }
  | { type: 'updateImage'; id: string; patch: Partial<SlideImage> }
  | { type: 'updateDiagram'; id: string; patch: Partial<DiagramConfig> }
  | { type: 'resetSlide'; id: string }
  | { type: 'addBand'; band: PanoramaBand }
  | { type: 'updateBand'; id: string; patch: Partial<PanoramaBand> }
  | { type: 'removeBand'; id: string };

function mapSlide(state: Carousel, id: string, fn: (s: Slide) => Slide): Carousel {
  return { ...state, slides: state.slides.map((s) => (s.id === id ? fn(s) : s)) };
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
      const slide = blankSlide(action.layout);
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
      const original = state.slides[idx];
      const copy: Slide = {
        ...original,
        id: uid(),
        content: { ...original.content, items: [...original.content.items] },
        layers: { ...original.layers },
      };
      const next = [...state.slides];
      next.splice(idx + 1, 0, copy);
      return { ...state, slides: next };
    }
    case 'deleteSlide': {
      if (state.slides.length <= 1) return state;
      const slides = state.slides.filter((s) => s.id !== action.id);
      // keep panorama bands consistent
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
    case 'updateContent':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        content: { ...s.content, ...action.patch },
      }));
    case 'updateLayers':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        layers: { ...s.layers, ...action.patch },
      }));
    case 'setImage':
      return mapSlide(state, action.id, (s) => ({ ...s, image: action.image }));
    case 'updateImage':
      return mapSlide(state, action.id, (s) =>
        s.image ? { ...s, image: { ...s.image, ...action.patch } } : s,
      );
    case 'updateDiagram':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        diagram: { ...s.diagram, ...action.patch },
      }));
    case 'resetSlide':
      return mapSlide(state, action.id, (s) => ({
        ...s,
        ...SLIDE_STYLE_DEFAULTS,
        image: null,
        layers: defaultLayers(),
      }));
    case 'addBand':
      return { ...state, bands: [...state.bands, action.band] };
    case 'updateBand':
      return {
        ...state,
        bands: state.bands.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      };
    case 'removeBand':
      return { ...state, bands: state.bands.filter((b) => b.id !== action.id) };
    default:
      return state;
  }
}

/** Best-effort migration of a v1 persisted carousel to the v2 schema. */
function migrateToV2(old: Record<string, unknown>): Carousel {
  const slides = (old.slides as Array<Record<string, unknown>>).map((s) => {
    const content = (s.content as Record<string, unknown>) ?? {};
    const imageSrc = content.imageSrc as string | null | undefined;
    const imageFit = (content.imageFit as 'cover' | 'contain') ?? 'cover';
    const wasImageLayout = s.layout === 'image';
    const image: SlideImage | null = imageSrc
      ? { ...defaultImage(imageSrc, wasImageLayout ? 'top' : 'background'), fit: imageFit }
      : null;
    // 'image' was a valid background in v1 but isn't anymore
    const oldBg = s.background as string | undefined;
    const background: Slide['background'] =
      oldBg === 'solid' || oldBg === 'soft' || oldBg === 'gradient' ? oldBg : 'solid';
    return {
      id: (s.id as string) ?? uid(),
      layout: (wasImageLayout ? 'text' : (s.layout as LayoutId)) ?? 'text',
      align: (s.align as Slide['align']) ?? SLIDE_STYLE_DEFAULTS.align,
      contentAnchor: SLIDE_STYLE_DEFAULTS.contentAnchor,
      background,
      image,
      diagram: defaultDiagram(),
      eyebrowAlign: SLIDE_STYLE_DEFAULTS.eyebrowAlign,
      eyebrowPlacement: SLIDE_STYLE_DEFAULTS.eyebrowPlacement,
      content: { ...emptyContent(), ...content },
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
    caption: (old.caption as string) ?? '',
    slides,
    bands: (old.bands as Carousel['bands']) ?? [],
  };
}

/** Ensure a same-version carousel has every field a current Carousel expects. */
function normalize(c: Record<string, unknown>): Carousel {
  const carousel = c as unknown as Carousel;
  return {
    ...carousel,
    logoSrc: (c.logoSrc as string | null) ?? null,
    caption: (c.caption as string) ?? '',
    bands: (c.bands as Carousel['bands']) ?? [],
    // `diagram` was added after some v2 carousels were saved; merge defaults so
    // diagrams persisted before newer options still get every field.
    slides: carousel.slides.map((s) => ({
      ...s,
      diagram: { ...defaultDiagram(), ...(s.diagram ?? {}) },
    })),
  };
}

function loadInitial(): Carousel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && Array.isArray(parsed.slides) && parsed.slides.length) {
        if (parsed.version === SCHEMA_VERSION) return normalize(parsed);
        // older schema — migrate so the user keeps their work
        return migrateToV2(parsed);
      }
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

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carousel));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [carousel]);

  // keep selection valid as slides come and go
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
