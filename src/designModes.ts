import type { DesignModeId, LayoutId } from './types';

export interface DesignModeMeta {
  id: DesignModeId;
  name: string;
  tagline: string;
  /** three representative colors for the picker swatch. */
  swatch: [string, string, string];
}

/**
 * All four identities share Laísa's brand fonts (Cormorant Garamond + Montserrat)
 * and her warm palette. They differ in color emphasis, rules, texture and rhythm,
 * so the carousel always reads as "her" while still offering variety.
 * The actual visual tokens live as CSS variables in styles/modes.css.
 */
export const DESIGN_MODES: DesignModeMeta[] = [
  {
    id: 'earth-clinical',
    name: 'Earth-Clinical',
    tagline: 'Diário clínico — bege quente, dourado e nota "REF:".',
    swatch: ['#FAF7F0', '#BFA065', '#5D4037'],
  },
  {
    id: 'narrative-compass',
    name: 'Narrative Compass',
    tagline: 'Editorial — creme com vinho e citações em serifa.',
    swatch: ['#F2EFE9', '#682D36', '#BFA065'],
  },
  {
    id: 'somatic-sanctuary',
    name: 'Somatic Sanctuary',
    tagline: 'Respiro — tons suaves, textura e muito espaço.',
    swatch: ['#EFE9DE', '#C9B79C', '#7A6F60'],
  },
  {
    id: 'minimalist-academic',
    name: 'Minimalist Academic',
    tagline: 'Técnico — branco, linhas finas e tipografia limpa.',
    swatch: ['#FFFFFF', '#BFA065', '#2B2321'],
  },
];

export const DESIGN_MODE_MAP: Record<DesignModeId, DesignModeMeta> = Object.fromEntries(
  DESIGN_MODES.map((m) => [m.id, m]),
) as Record<DesignModeId, DesignModeMeta>;

export interface LayoutMeta {
  id: LayoutId;
  name: string;
  description: string;
  /** which content fields this layout actually renders. */
  fields: Array<
    'eyebrow' | 'title' | 'subtitle' | 'body' | 'items' | 'quote' | 'author' | 'stat' | 'statLabel' | 'image'
  >;
}

export const LAYOUTS: LayoutMeta[] = [
  {
    id: 'cover',
    name: 'Capa',
    description: 'Abertura: título grande, subtítulo e selo.',
    fields: ['eyebrow', 'title', 'subtitle'],
  },
  {
    id: 'text',
    name: 'Texto',
    description: 'Título + parágrafo. O conteúdo principal.',
    fields: ['eyebrow', 'title', 'body'],
  },
  {
    id: 'list',
    name: 'Lista',
    description: 'Título + itens numerados (passos, sintomas...).',
    fields: ['eyebrow', 'title', 'items'],
  },
  {
    id: 'quote',
    name: 'Citação',
    description: 'Frase de destaque com aspas e autoria.',
    fields: ['quote', 'author'],
  },
  {
    id: 'statistic',
    name: 'Dado',
    description: 'Um número grande com legenda — evidência científica.',
    fields: ['eyebrow', 'stat', 'statLabel', 'body'],
  },
  {
    id: 'image',
    name: 'Imagem',
    description: 'Imagem em destaque com legenda opcional.',
    fields: ['image', 'title', 'body'],
  },
  {
    id: 'cta',
    name: 'Chamada',
    description: 'Slide final: convite para salvar, comentar ou agendar.',
    fields: ['eyebrow', 'title', 'subtitle'],
  },
];

export const LAYOUT_MAP: Record<LayoutId, LayoutMeta> = Object.fromEntries(
  LAYOUTS.map((l) => [l.id, l]),
) as Record<LayoutId, LayoutMeta>;
