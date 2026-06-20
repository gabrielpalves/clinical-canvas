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
  LayoutId,
  PanoramaBand,
  Slide,
  SlideContent,
  SlideLayers,
} from '../types';
import { SCHEMA_VERSION, blankSlide, seedCarousel, uid } from './factory';

const STORAGE_KEY = 'clinical-canvas:carousel:v1';

type Action =
  | { type: 'load'; carousel: Carousel }
  | { type: 'reset' }
  | { type: 'setMode'; mode: DesignModeId }
  | { type: 'setAspect'; aspect: AspectId }
  | { type: 'setMeta'; handle?: string; brandName?: string }
  | { type: 'addSlide'; layout: LayoutId; afterId?: string }
  | { type: 'duplicateSlide'; id: string }
  | { type: 'deleteSlide'; id: string }
  | { type: 'moveSlide'; id: string; dir: -1 | 1 }
  | { type: 'updateSlide'; id: string; patch: Partial<Pick<Slide, 'layout' | 'align' | 'background'>> }
  | { type: 'updateContent'; id: string; patch: Partial<SlideContent> }
  | { type: 'updateLayers'; id: string; patch: Partial<SlideLayers> }
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
      return {
        ...state,
        handle: action.handle ?? state.handle,
        brandName: action.brandName ?? state.brandName,
      };
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

function loadInitial(): Carousel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Carousel;
      if (parsed && parsed.version === SCHEMA_VERSION && Array.isArray(parsed.slides) && parsed.slides.length) {
        return parsed;
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
