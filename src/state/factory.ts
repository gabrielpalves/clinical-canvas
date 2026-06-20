import type {
  BackgroundStyle,
  Carousel,
  LayoutId,
  Slide,
  SlideContent,
  SlideLayers,
  TextAlign,
} from '../types';

export const SCHEMA_VERSION = 1;

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
    imageSrc: null,
    imageFit: 'cover',
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

interface SlideSeed {
  layout: LayoutId;
  align?: TextAlign;
  background?: BackgroundStyle;
  content?: Partial<SlideContent>;
  layers?: Partial<SlideLayers>;
}

export function createSlide(seed: SlideSeed): Slide {
  return {
    id: uid(),
    layout: seed.layout,
    align: seed.align ?? 'left',
    background: seed.background ?? 'solid',
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
    image: { title: 'Legenda da imagem', body: 'Texto de apoio opcional.' },
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
    slides,
    bands: [],
  };
}
