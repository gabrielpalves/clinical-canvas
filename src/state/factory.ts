import type {
  BackgroundStyle,
  Carousel,
  Decoration,
  DiagramConfig,
  ElementAlign,
  EyebrowPlacement,
  LayoutId,
  Slide,
  SlideContent,
  SlideImage,
  SlideLayers,
  TextAlign,
  VerticalAnchor,
} from '../types';

export const SCHEMA_VERSION = 2;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyContent(): SlideContent {
  return {
    eyebrow: '',
    title: '',
    subtitle: '',
    body: '',
    items: [],
    quote: '',
    author: '',
    stat: '',
    statLabel: '',
    reference: '',
  };
}

export function defaultLayers(): SlideLayers {
  return {
    eyebrow: true,
    pagination: true,
    backgroundAccents: true,
    decorativeMark: true,
    reference: true,
    logo: true,
  };
}

/** Default styling/positioning of a slide — used as the "reset" baseline. */
export interface SlideStyleDefaults {
  align: TextAlign;
  contentAnchor: VerticalAnchor;
  background: BackgroundStyle;
  eyebrowAlign: ElementAlign;
  eyebrowPlacement: EyebrowPlacement;
}

export const SLIDE_STYLE_DEFAULTS: SlideStyleDefaults = {
  align: 'left',
  contentAnchor: 'center',
  background: 'solid',
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
    regionStart: 0,
    regionEnd: 1,
    nodes: ['Pensamentos', 'Emoções', 'Comportamentos'],
    rows: 3,
    cols: 2,
    header: true,
    cells: ['Coluna A', 'Coluna B', 'Linha 1', 'Valor', 'Linha 2', 'Valor'],
  };
}

export function defaultDecoration(kind: Decoration['kind']): Decoration {
  return {
    id: uid(),
    kind,
    x: 0.5,
    y: 0.5,
    size: 0.28,
    rotation: 0,
    opacity: kind === 'blobA' || kind === 'blobB' ? 0.18 : 0.5,
    color: 'accent',
    filled: kind === 'blobA' || kind === 'blobB' || kind === 'circle' || kind === 'triangle',
    front: false,
  };
}

/** A fresh image with sensible defaults for a given placement. */
export function defaultImage(src: string, placement: SlideImage['placement'] = 'background'): SlideImage {
  return {
    src,
    placement,
    fit: 'cover',
    size: 0.5,
    focusX: 0.5,
    focusY: 0.5,
    opacity: placement === 'background' ? 0.6 : 1,
    overlay: placement === 'background' ? 0.35 : 0,
  };
}

interface SlideSeed {
  layout: LayoutId;
  align?: TextAlign;
  contentAnchor?: VerticalAnchor;
  background?: BackgroundStyle;
  image?: SlideImage | null;
  diagram?: Partial<DiagramConfig>;
  eyebrowAlign?: ElementAlign;
  eyebrowPlacement?: EyebrowPlacement;
  content?: Partial<SlideContent>;
  layers?: Partial<SlideLayers>;
}

export function createSlide(seed: SlideSeed): Slide {
  return {
    id: uid(),
    layout: seed.layout,
    align: seed.align ?? SLIDE_STYLE_DEFAULTS.align,
    contentAnchor: seed.contentAnchor ?? SLIDE_STYLE_DEFAULTS.contentAnchor,
    background: seed.background ?? SLIDE_STYLE_DEFAULTS.background,
    image: seed.image ?? null,
    diagram: { ...defaultDiagram(), ...seed.diagram },
    decorations: [],
    eyebrowAlign: seed.eyebrowAlign ?? SLIDE_STYLE_DEFAULTS.eyebrowAlign,
    eyebrowPlacement: seed.eyebrowPlacement ?? SLIDE_STYLE_DEFAULTS.eyebrowPlacement,
    content: { ...emptyContent(), ...seed.content },
    layers: { ...defaultLayers(), ...seed.layers },
  };
}

/** A blank slide of a given layout, with gentle placeholder copy. */
export function blankSlide(layout: LayoutId): Slide {
  const placeholders: Partial<Record<LayoutId, Partial<SlideContent>>> = {
    cover: { eyebrow: 'Nova série', title: 'Seu título aqui', subtitle: 'Um subtítulo que convida à leitura.' },
    text: { eyebrow: 'Contexto', title: 'Um ponto importante', body: 'Escreva aqui o seu texto. Respire entre as ideias.' },
    list: { eyebrow: 'Na prática', title: 'Três caminhos', items: ['Primeiro passo', 'Segundo passo', 'Terceiro passo'] },
    quote: { quote: 'Uma frase que vale a pausa.', author: 'Autor, Obra (ano)' },
    statistic: { eyebrow: 'Evidência', stat: '70%', statLabel: 'do que descreve o dado', body: 'Uma frase de contexto sobre o número.' },
    diagram: { eyebrow: 'Modelo', title: 'O título do diagrama' },
    cta: { eyebrow: 'Para levar com você', title: 'Salve este post', subtitle: 'Compartilhe com quem precisa ler isto hoje.' },
  };
  return createSlide({ layout, content: placeholders[layout] });
}

/** A finished-looking sample carousel so the app is useful on first open. */
export function seedCarousel(): Carousel {
  const slides: Slide[] = [
    createSlide({
      layout: 'cover',
      align: 'left',
      content: {
        eyebrow: 'Regulação emocional · Vol. I',
        title: 'O silêncio que antecede a emoção',
        subtitle: 'Como a pausa muda a forma como você responde ao mundo.',
      },
    }),
    createSlide({
      layout: 'text',
      content: {
        eyebrow: 'O ponto de partida',
        title: 'Emoção não é inimiga',
        body: 'Toda emoção carrega uma informação. Acolhê-la não é fraqueza — é o primeiro passo para escolher como agir, em vez de apenas reagir.',
      },
    }),
    createSlide({
      layout: 'list',
      content: {
        eyebrow: 'Na prática',
        title: 'Três passos para regular',
        items: [
          'Nomeie o que você sente, sem julgamento.',
          'Respire devagar — alongue a expiração.',
          'Escolha uma ação alinhada aos seus valores.',
        ],
      },
    }),
    createSlide({
      layout: 'statistic',
      background: 'soft',
      content: {
        eyebrow: 'Evidência',
        stat: '6 seg.',
        statLabel: 'é o tempo médio de pico de uma emoção intensa',
        body: 'Dar nome ao que se sente reduz a ativação da amígdala — a neurociência chama isso de "affect labeling".',
        reference: 'Lieberman et al., 2007, Psychological Science.',
      },
    }),
    createSlide({
      layout: 'quote',
      background: 'soft',
      content: {
        quote: 'Acolher suas emoções não é sinal de fraqueza, mas o caminho mais seguro para encontrar a sua força.',
        author: 'Laísa Bitencourt',
      },
    }),
    createSlide({
      layout: 'cta',
      content: {
        eyebrow: 'Para levar com você',
        title: 'Salve para os dias difíceis',
        subtitle: 'Compartilhe com alguém que precisa ler isto hoje. ↗',
      },
    }),
  ];

  return {
    version: SCHEMA_VERSION,
    mode: 'earth-clinical',
    aspect: 'portrait',
    handle: '@psilaisabitencourt',
    brandName: 'Laísa Bitencourt · Psicóloga',
    logoSrc: null,
    caption:
      'O silêncio que antecede a emoção 🌿\n\n' +
      'Toda emoção carrega uma informação. Aprender a fazer uma pausa antes de reagir é uma das habilidades mais transformadoras da regulação emocional.\n\n' +
      'Salve este post para os dias difíceis e compartilhe com quem precisa ler isto hoje. 💛\n\n' +
      '#regulacaoemocional #psicologia #saudemental #tcc #dbt #autoconhecimento',
    slides,
    bands: [],
  };
}
