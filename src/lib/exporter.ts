import { getFontEmbedCSS, toPng } from 'html-to-image';
import JSZip from 'jszip';
import type { AspectId } from '../types';
import { DIMENSIONS, slugify } from './helpers';

/** Returns the live, full-resolution DOM node for a slide, or null. */
function frameNode(slideId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-export-id="${slideId}"]`);
}

async function renderNode(
  node: HTMLElement,
  aspect: AspectId,
  fontEmbedCSS?: string,
): Promise<string> {
  const { w, h } = DIMENSIONS[aspect];
  // Fonts must be ready or the export captures fallback glyphs.
  if (document.fonts?.ready) await document.fonts.ready;
  return toPng(node, {
    width: w,
    height: h,
    pixelRatio: 1,
    cacheBust: true,
    // Reuse pre-computed @font-face CSS so the brand fonts are embedded once.
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
    // html-to-image reads the node's own box; the on-screen scale lives on an
    // ancestor, so the capture is always at full 1080px resolution.
    style: { transform: 'none', margin: '0' },
  });
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Export one slide as a PNG download. */
export async function exportSlidePng(
  slideId: string,
  index: number,
  aspect: AspectId,
): Promise<void> {
  const node = frameNode(slideId);
  if (!node) throw new Error('Slide não encontrado para exportar.');
  const dataUrl = await renderNode(node, aspect);
  const n = String(index + 1).padStart(2, '0');
  triggerDownload(dataUrl, `slide-${n}.png`);
}

export interface ZipProgress {
  done: number;
  total: number;
}

/** Export every slide as PNGs bundled in a single .zip download. */
export async function exportCarouselZip(
  slideIds: string[],
  aspect: AspectId,
  name: string,
  caption: string,
  onProgress?: (p: ZipProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const total = slideIds.length;

  if (caption.trim()) zip.file('legenda.txt', caption);

  // Compute the embedded-font CSS once and reuse it for every slide.
  // IMPORTANT: html-to-image's getFontEmbedCSS only embeds the fonts *used by
  // the node passed to it* (it calls getUsedFonts on that node). Passing a
  // single slide dropped any font used only on other slides (e.g. a per-block
  // Lora / Fraunces / Inter), so those slides exported with a fallback font
  // while the per-slide PNG button — which computes fonts per slide — looked
  // fine. Compute it from a scope that contains every slide (the document body)
  // so the embedded CSS covers the union of all fonts in the carousel.
  let fontEmbedCSS: string | undefined;
  const anyNode = slideIds.map(frameNode).find((n): n is HTMLElement => n !== null);
  if (anyNode) {
    try {
      fontEmbedCSS = await getFontEmbedCSS(anyNode.ownerDocument.body);
    } catch {
      /* fall back to per-slide embedding */
    }
  }

  for (let i = 0; i < total; i++) {
    const node = frameNode(slideIds[i]);
    if (!node) continue;
    const dataUrl = await renderNode(node, aspect, fontEmbedCSS);
    const base64 = dataUrl.split(',')[1];
    const n = String(i + 1).padStart(2, '0');
    zip.file(`slide-${n}.png`, base64, { base64: true });
    onProgress?.({ done: i + 1, total });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(name, 'carrossel')}.zip`);
  // give the browser a tick to start the download before revoking
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
