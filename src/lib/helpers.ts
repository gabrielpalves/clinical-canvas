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

// ---------------------------------------------------------------------------
// colour helpers (custom hex backgrounds + per-block colours)
// ---------------------------------------------------------------------------

/** True for a valid #rgb or #rrggbb string. */
export function isHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

/** Normalise free user input toward a hex string: ensure a leading '#', clamp
 *  to 7 chars. Stored even while partial so the user can keep typing; callers
 *  guard with isHex() before applying. */
export function coerceHex(v: string): string {
  let s = v.trim();
  if (!s) return '';
  if (!s.startsWith('#')) s = '#' + s;
  return s.slice(0, 7);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Mix a hex toward white (amt > 0) or black (amt < 0), |amt| in 0..1. */
function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = (c: number) => Math.round((t - c) * p + c);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Perceived luminance, 0 (black) … 1 (white). */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Build the CSS-variable set for a free-hex slide background. Text/accent are
 * chosen for legibility from the background's luminance, mirroring how the
 * fixed palette swatches flip on dark colours. Returned as inline style so the
 * dynamic hex wins over the mode palette (and exports as literal values).
 */
export function customBgVars(hex: string): Record<string, string> {
  const dark = luminance(hex) < 0.55;
  return dark
    ? {
        '--cc-bg': hex,
        '--cc-bg-soft': shade(hex, 0.07),
        '--cc-heading': '#fdfaf4',
        '--cc-ink': '#f1efe9',
        '--cc-accent': '#d4b985',
        '--cc-accent-soft': 'rgba(212, 185, 133, 0.28)',
        '--cc-muted': 'rgba(241, 239, 233, 0.7)',
        '--cc-line': 'rgba(241, 239, 233, 0.24)',
      }
    : {
        '--cc-bg': hex,
        '--cc-bg-soft': shade(hex, -0.05),
        '--cc-heading': '#1b1d21',
        '--cc-ink': '#2c2f34',
        '--cc-accent': '#bfa065',
        '--cc-accent-soft': 'rgba(191, 160, 101, 0.28)',
        '--cc-muted': 'rgba(27, 29, 33, 0.55)',
        '--cc-line': 'rgba(27, 29, 33, 0.16)',
      };
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
