import type {
  BackgroundStyle,
  BgColor,
  Block,
  BlockType,
  Carousel,
  Decoration,
  DiagramConfig,
  ElementAlign,
  EyebrowPlacement,
  HeadingSize,
  PresetId,
  Slide,
  SlideImage,
  SlideLayers,
  TextAlign,
  VerticalAnchor,
} from '../types';

export const SCHEMA_VERSION = 3;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function defaultLayers(): SlideLayers {
  return {
    eyebrow: true,
    pagination: true,
    backgroundAccents: true,
    decorativeMark: true,
    reference: true,
    logo: true,
    swipe: false,
  };
}

export interface SlideStyleDefaults {
  align: TextAlign;
  contentAnchor: VerticalAnchor;
  background: BackgroundStyle;
  bgColor: BgColor;
  bgCustom: string;
  eyebrowAlign: ElementAlign;
  eyebrowPlacement: EyebrowPlacement;
}

export const SLIDE_STYLE_DEFAULTS: SlideStyleDefaults = {
  align: 'left',
  contentAnchor: 'center',
  background: 'solid',
  bgColor: 'auto',
  bgCustom: '',
  eyebrowAlign: 'inherit',
  eyebrowPlacement: 'inline',
};

export function defaultDiagram(): DiagramConfig {
  return {
    type: 'matrix',
    labelSizes: {},
    labelRots: {},
    xLabel: 'Eixo horizontal',
    yLabel: 'Eixo vertical',
    quadrants: ['Alto / Baixo', 'Alto / Alto', 'Baixo / Baixo', 'Baixo / Alto'],
    showAxes: true,
    setA: 'Conceito A',
    setB: 'Conceito B',
    setC: 'Conceito C',
    overlap: 'Em comum',
    vennCircles: 2,
    vennOverlap: 0.45,
    circleScale: 1,
    marker: 'Área de destaque',
    peak: 'Pico',
    peakX: 0.5,
    peakY: 0.18,
    markerX: 0.5,
    markerY: 0.4,
    regionStart: 0,
    regionEnd: 1,
    nodes: ['Pensamentos', 'Emoções', 'Comportamentos'],
    rows: 3,
    cols: 2,
    header: true,
    cells: ['Coluna A', 'Coluna B', 'Linha 1', 'Valor', 'Linha 2', 'Valor'],
  };
}

const ICON_KINDS: Decoration['kind'][] = ['heart', 'comment', 'share', 'bookmark'];

export function defaultDecoration(kind: Decoration['kind']): Decoration {
  const isBlob = kind === 'blobA' || kind === 'blobB';
  const isIcon = ICON_KINDS.includes(kind);
  return {
    id: uid(),
    kind,
    x: 0.5,
    y: 0.5,
    size: isIcon ? 0.12 : 0.28,
    rotation: 0,
    opacity: isBlob ? 0.18 : isIcon ? 0.85 : 0.5,
    color: 'accent',
    filled: kind === 'blobA' || kind === 'blobB' || kind === 'circle' || kind === 'triangle',
    front: false,
  };
}

/** A background image with sensible defaults. */
export function defaultImage(src: string): SlideImage {
  return {
    src,
    placement: 'background',
    fit: 'cover',
    size: 0.5,
    focusX: 0.5,
    focusY: 0.5,
    opacity: 0.6,
    overlay: 0.35,
  };
}

// ---------------------------------------------------------------------------
// blocks
// ---------------------------------------------------------------------------

export function createBlock(type: BlockType, patch: Partial<Block> = {}): Block {
  return {
    id: uid(),
    type,
    align: 'inherit',
    scale: 1,
    spaceTop: 0,
    padX: 0,
    boxed: false,
    textColor: '',
    bgColor: '',
    accentColor: '',
    font: 'auto',
    text: '',
    size: 'md',
    items: [],
    marker: 'number',
    author: '',
    stat: '',
    statLabel: '',
    body: '',
    diagram: defaultDiagram(),
    src: null,
    fit: 'cover',
    imageHeight: 0.42,
    caption: '',
    captionPos: 'below',
    ...patch,
  };
}

const heading = (text: string, size: HeadingSize = 'md') => createBlock('heading', { text, size });
const paragraph = (text: string) => createBlock('paragraph', { text });
const listBlock = (items: string[], marker: Block['marker'] = 'number') => createBlock('list', { items, marker });
const quote = (text: string, author: string) => createBlock('quote', { text, author });
const statistic = (stat: string, statLabel: string, body: string) =>
  createBlock('statistic', { stat, statLabel, body });

interface SlideSeed {
  align?: TextAlign;
  contentAnchor?: VerticalAnchor;
  background?: BackgroundStyle;
  bgColor?: BgColor;
  bgCustom?: string;
  bgImage?: SlideImage | null;
  eyebrow?: string;
  eyebrowAlign?: ElementAlign;
  eyebrowPlacement?: EyebrowPlacement;
  reference?: string;
  blocks?: Block[];
  decorations?: Decoration[];
  layers?: Partial<SlideLayers>;
}

export function createSlide(seed: SlideSeed = {}): Slide {
  return {
    id: uid(),
    align: seed.align ?? SLIDE_STYLE_DEFAULTS.align,
    contentAnchor: seed.contentAnchor ?? SLIDE_STYLE_DEFAULTS.contentAnchor,
    background: seed.background ?? SLIDE_STYLE_DEFAULTS.background,
    bgColor: seed.bgColor ?? SLIDE_STYLE_DEFAULTS.bgColor,
    bgCustom: seed.bgCustom ?? SLIDE_STYLE_DEFAULTS.bgCustom,
    bgImage: seed.bgImage ?? null,
    eyebrow: seed.eyebrow ?? '',
    eyebrowAlign: seed.eyebrowAlign ?? SLIDE_STYLE_DEFAULTS.eyebrowAlign,
    eyebrowPlacement: seed.eyebrowPlacement ?? SLIDE_STYLE_DEFAULTS.eyebrowPlacement,
    reference: seed.reference ?? '',
    blocks: seed.blocks ?? [],
    decorations: seed.decorations ?? [],
    layers: { ...defaultLayers(), ...seed.layers },
  };
}

/** A new slide built from a starter preset. */
export function presetSlide(preset: PresetId): Slide {
  switch (preset) {
    case 'cover':
      return createSlide({
        eyebrow: 'Nova série',
        blocks: [heading('Seu título aqui', 'xl'), paragraph('Um subtítulo que convida à leitura.')],
      });
    case 'text':
      return createSlide({
        eyebrow: 'Contexto',
        blocks: [heading('Um ponto importante', 'md'), paragraph('Escreva aqui o seu texto. Respire entre as ideias.')],
      });
    case 'list':
      return createSlide({
        eyebrow: 'Na prática',
        blocks: [heading('Três caminhos', 'md'), listBlock(['Primeiro passo', 'Segundo passo', 'Terceiro passo'])],
      });
    case 'quote':
      return createSlide({ blocks: [quote('Uma frase que vale a pausa.', 'Autor, Obra (ano)')] });
    case 'statistic':
      return createSlide({
        eyebrow: 'Evidência',
        blocks: [statistic('70%', 'do que descreve o dado', 'Uma frase de contexto sobre o número.')],
      });
    case 'diagram':
      return createSlide({ eyebrow: 'Modelo', blocks: [heading('O título do diagrama', 'md'), createBlock('diagram')] });
    case 'cta':
      return createSlide({
        align: 'center',
        eyebrow: 'Para levar com você',
        blocks: [heading('Salve este post', 'lg'), createBlock('divider'), paragraph('Compartilhe com quem precisa ler isto hoje.')],
      });
    case 'blank':
    default:
      return createSlide({ blocks: [paragraph('Novo texto…')] });
  }
}

/** A finished-looking sample carousel so the app is useful on first open. */
export function seedCarousel(): Carousel {
  const slides: Slide[] = [
    createSlide({
      eyebrow: 'Regulação emocional · Vol. I',
      blocks: [
        heading('O silêncio que antecede a emoção', 'xl'),
        paragraph('Como a pausa muda a forma como você responde ao mundo.'),
      ],
    }),
    createSlide({
      eyebrow: 'O ponto de partida',
      blocks: [
        heading('Emoção não é inimiga', 'md'),
        paragraph(
          'Toda emoção carrega uma informação. Acolhê-la não é fraqueza — é o primeiro passo para escolher como agir, em vez de apenas reagir.',
        ),
      ],
    }),
    createSlide({
      eyebrow: 'Na prática',
      blocks: [
        heading('Três passos para regular', 'md'),
        listBlock([
          'Nomeie o que você sente, sem julgamento.',
          'Respire devagar — alongue a expiração.',
          'Escolha uma ação alinhada aos seus valores.',
        ]),
      ],
    }),
    createSlide({
      background: 'soft',
      eyebrow: 'Evidência',
      reference: 'Lieberman et al., 2007, Psychological Science.',
      blocks: [
        statistic(
          '6 seg.',
          'é o tempo médio de pico de uma emoção intensa',
          'Dar nome ao que se sente reduz a ativação da amígdala — a neurociência chama isso de "affect labeling".',
        ),
      ],
    }),
    createSlide({
      background: 'soft',
      blocks: [quote('Acolher suas emoções não é sinal de fraqueza, mas o caminho mais seguro para encontrar a sua força.', 'Laísa Bitencourt')],
    }),
    createSlide({
      align: 'center',
      eyebrow: 'Para levar com você',
      blocks: [heading('Salve para os dias difíceis', 'lg'), createBlock('divider'), paragraph('Compartilhe com alguém que precisa ler isto hoje. ↗')],
    }),
  ];

  return {
    version: SCHEMA_VERSION,
    mode: 'earth-clinical',
    aspect: 'portrait',
    handle: '@psilaisabitencourt',
    brandName: 'Laísa Bitencourt · Psicóloga',
    credential: 'CRP 12/20955',
    logoSrc: null,
    footerReversed: false,
    swipeLabel: true,
    swipePosition: 'bottom',
    caption:
      'O silêncio que antecede a emoção 🌿\n\n' +
      'Toda emoção carrega uma informação. Aprender a fazer uma pausa antes de reagir é uma das habilidades mais transformadoras da regulação emocional.\n\n' +
      'Salve este post para os dias difíceis e compartilhe com quem precisa ler isto hoje. 💛\n\n' +
      '#regulacaoemocional #psicologia #saudemental #tcc #dbt #autoconhecimento',
    slides,
    bands: [],
  };
}
