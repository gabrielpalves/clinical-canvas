import type { AspectId, Carousel, PanoramaBand } from '../types';

/** Full-resolution export dimensions per aspect ratio. */
export const DIMENSIONS: Record<AspectId, { w: number; h: number; label: string }> = {
  portrait: { w: 1080, h: 1350, label: '4:5 · 1080×1350' },
  square: { w: 1080, h: 1080, label: '1:1 · 1080×1080' },
};

/** Read an uploaded image file into a base64 data URL (no CORS issues on export). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface BandSlice {
  band: PanoramaBand;
  /** position of this slide within the band, 0-based. */
  index: number;
  /** total number of slides the band spans. */
  count: number;
}

/** Find the panorama band (if any) covering a given slide, plus its slice index. */
export function bandForSlide(carousel: Carousel, slideId: string): BandSlice | null {
  for (const band of carousel.bands) {
    const index = band.slideIds.indexOf(slideId);
    if (index !== -1) {
      return { band, index, count: band.slideIds.length };
    }
  }
  return null;
}

/** Sanitize a string into a safe filename fragment. */
export function slugify(input: string, fallback = 'slide'): string {
  const s = input
    .normalize('NFD')
    // strip combining diacritical marks (U+0300–U+036F)
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return s || fallback;
}
