import type { Slide } from '../types';
import { createBlock, createSlide } from './factory';

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  build: () => { slides: Slide[]; caption: string };
}

const hd = (text: string, size: 'xl' | 'lg' | 'md' | 'sm' = 'md') => createBlock('heading', { text, size });
const pg = (text: string) => createBlock('paragraph', { text });
const li = (items: string[], numbered = true) => createBlock('list', { items, numbered });
const qt = (text: string, author: string) => createBlock('quote', { text, author });
const st = (stat: string, statLabel: string, body: string) => createBlock('statistic', { stat, statLabel, body });

/** Ready-made carousel structures Laísa can start from. */
export const TEMPLATES: CarouselTemplate[] = [
  {
    id: 'three-steps',
    name: 'Habilidade em 3 passos',
    description: 'Capa · passos · porque funciona · evidência · chamada.',
    build: () => ({
      caption:
        'Uma habilidade prática para o seu dia 🌿\n\nSalve para praticar quando precisar. 💛\n\n#psicologia #regulacaoemocional #saudemental #tcc #dbt',
      slides: [
        createSlide({ eyebrow: 'Habilidade da semana', blocks: [hd('O nome da habilidade', 'xl'), pg('Uma frase curta sobre o que ela resolve.')] }),
        createSlide({ eyebrow: 'Passo a passo', blocks: [hd('Como praticar'), li(['Primeiro passo, bem concreto.', 'Segundo passo.', 'Terceiro passo.'])] }),
        createSlide({ eyebrow: 'Por que funciona', blocks: [hd('A ideia por trás'), pg('Explique em 2–3 frases o mecanismo por trás da habilidade.')] }),
        createSlide({ background: 'soft', eyebrow: 'Evidência', reference: 'Autor et al., ano, Revista.', blocks: [st('00%', 'o que o dado mostra', 'Uma frase de contexto.')] }),
        createSlide({ align: 'center', eyebrow: 'Para levar com você', blocks: [hd('Salve este post', 'lg'), createBlock('divider'), pg('Pratique hoje e compartilhe. ↗')] }),
      ],
    }),
  },
  {
    id: 'myth-fact',
    name: 'Mito vs. Verdade',
    description: 'Capa · mito · verdade · citação · chamada.',
    build: () => ({
      caption:
        'Mito x Verdade sobre [tema] 🧠\n\nDesfazer mitos é o primeiro passo para cuidar da saúde mental.\n\n#psicologia #saudemental #mitoseverdades',
      slides: [
        createSlide({ eyebrow: 'Mito x Verdade', blocks: [hd('O que você acredita sobre [tema]?', 'xl'), pg('Vamos separar o que a ciência diz do senso comum.')] }),
        createSlide({ background: 'soft', eyebrow: 'Mito', blocks: [hd('"A frase do mito aqui."'), pg('Por que essa crença é tão comum.')] }),
        createSlide({ eyebrow: 'Verdade', blocks: [hd('O que de fato acontece'), pg('A explicação baseada em evidências, com clareza.')] }),
        createSlide({ background: 'soft', blocks: [qt('Uma frase que sintetiza a mensagem.', 'Laísa Bitencourt')] }),
        createSlide({ align: 'center', eyebrow: 'Para refletir', blocks: [hd('Qual mito te surpreendeu?', 'lg'), createBlock('divider'), pg('Conta nos comentários e salve. ↗')] }),
      ],
    }),
  },
  {
    id: 'reflection',
    name: 'Reflexão / história',
    description: 'Capa · contexto · citação · desdobramento · chamada.',
    build: () => ({
      caption: 'Uma reflexão para hoje 🌙\n\nÀs vezes uma pausa muda tudo.\n\n#reflexao #psicologia #saudemental',
      slides: [
        createSlide({ eyebrow: 'Reflexão', blocks: [hd('O título que convida à leitura', 'xl'), pg('Uma abertura suave para o tema.')] }),
        createSlide({ eyebrow: 'O contexto', blocks: [hd('Onde tudo começa'), pg('Apresente a situação ou a pergunta central.')] }),
        createSlide({ background: 'soft', blocks: [qt('A frase que vale a pausa.', 'Autor, Obra (ano)')] }),
        createSlide({ eyebrow: 'O que isso nos ensina', blocks: [hd('O desdobramento'), pg('Conecte a reflexão à vida de quem lê.')] }),
        createSlide({ align: 'center', eyebrow: 'Para levar com você', blocks: [hd('Guarde esta ideia', 'lg'), createBlock('divider'), pg('Salve e volte quando precisar. ↗')] }),
      ],
    }),
  },
  {
    id: 'science',
    name: 'Dado científico',
    description: 'Capa · dado · interpretação · aplicação · chamada.',
    build: () => ({
      caption: 'O que a ciência diz sobre [tema] 🔬\n\nPsicologia baseada em evidências, no dia a dia.\n\n#psicologiabaseadaemevidencias #ciencia #saudemental',
      slides: [
        createSlide({ eyebrow: 'Baseado em evidências', blocks: [hd('O que a ciência diz sobre [tema]', 'xl'), pg('Um dado que muda como olhamos para isto.')] }),
        createSlide({ background: 'soft', eyebrow: 'O dado', reference: 'Autor et al., ano, Revista.', blocks: [st('00%', 'o que o número representa', '')] }),
        createSlide({ eyebrow: 'O que significa', blocks: [hd('Interpretando o dado'), pg('Traduza o número para a vida real, sem jargão.')] }),
        createSlide({ eyebrow: 'Na prática', blocks: [hd('Como aplicar'), li(['Uma aplicação concreta.', 'Outra aplicação.', 'Mais uma.'])] }),
        createSlide({ align: 'center', eyebrow: 'Para levar com você', blocks: [hd('Salve para consultar depois', 'lg'), createBlock('divider'), pg('Compartilhe com quem gosta de ciência. ↗')] }),
      ],
    }),
  },
];
