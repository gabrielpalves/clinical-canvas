import type { BlockFont, BlockType, DesignModeId, PresetId } from './types';

export interface DesignModeMeta {
  id: DesignModeId;
  name: string;
  tagline: string;
  /** three representative colors for the picker swatch. */
  swatch: [string, string, string];
}

/**
 * All four identities share Laísa's brand fonts (Cormorant Garamond + Montserrat)
 * and her warm palette. They differ in color emphasis, rules, texture and rhythm.
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
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Neutro — cinza frio, mínimo. Tela limpa para qualquer nicho.',
    swatch: ['#F6F7F8', '#6B7280', '#1B1D21'],
  },
];

export const DESIGN_MODE_MAP: Record<DesignModeId, DesignModeMeta> = Object.fromEntries(
  DESIGN_MODES.map((m) => [m.id, m]),
) as Record<DesignModeId, DesignModeMeta>;

/** Starter presets for new slides (they pre-fill a set of blocks). */
export const PRESETS: Array<{ id: PresetId; name: string; description: string }> = [
  { id: 'cover', name: 'Capa', description: 'Selo + título grande + subtítulo.' },
  { id: 'text', name: 'Texto', description: 'Título + parágrafo.' },
  { id: 'list', name: 'Lista', description: 'Título + itens.' },
  { id: 'quote', name: 'Citação', description: 'Frase de destaque com autoria.' },
  { id: 'statistic', name: 'Dado', description: 'Número grande com legenda.' },
  { id: 'diagram', name: 'Diagrama', description: 'Título + figura (matriz, Venn…).' },
  { id: 'cta', name: 'Chamada', description: 'Convite final para salvar/compartilhar.' },
  { id: 'blank', name: 'Em branco', description: 'Comece do zero.' },
];

/** Per-block font choices (the dropdown in the block editor). Families must be
 *  self-hosted (see styles/fonts.css) so they embed into exported PNGs. */
export const BLOCK_FONTS: Array<{ id: BlockFont; label: string; family: string }> = [
  { id: 'auto', label: 'Automática (padrão)', family: '' },
  { id: 'cormorant', label: 'Cormorant (serifa)', family: "'Cormorant Garamond', Georgia, serif" },
  { id: 'lora', label: 'Lora (serifa)', family: "'Lora', Georgia, serif" },
  { id: 'fraunces', label: 'Fraunces (serifa expressiva)', family: "'Fraunces', Georgia, serif" },
  { id: 'montserrat', label: 'Montserrat (sans)', family: "'Montserrat', system-ui, sans-serif" },
  { id: 'inter', label: 'Inter (sans neutra)', family: "'Inter', system-ui, sans-serif" },
];

export const BLOCK_FONT_FAMILY: Record<BlockFont, string> = Object.fromEntries(
  BLOCK_FONTS.map((f) => [f.id, f.family]),
) as Record<BlockFont, string>;

/** Block types available from the "+ Adicionar conteúdo" menu. */
export const BLOCK_TYPES: Array<{ id: BlockType; name: string; description: string }> = [
  { id: 'heading', name: 'Título', description: 'Um cabeçalho em serifa.' },
  { id: 'paragraph', name: 'Texto', description: 'Um parágrafo de corpo.' },
  { id: 'list', name: 'Lista', description: 'Itens numerados ou com marcador.' },
  { id: 'quote', name: 'Citação', description: 'Frase em destaque com autoria.' },
  { id: 'statistic', name: 'Dado', description: 'Número grande + legenda.' },
  { id: 'diagram', name: 'Diagrama', description: 'Matriz, Venn, distribuição, ciclo, tabela.' },
  { id: 'image', name: 'Imagem', description: 'Imagem com legenda opcional.' },
  { id: 'divider', name: 'Divisória', description: 'Uma linha curta de separação.' },
];
