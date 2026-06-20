import type { Slide } from '../types';
import { createSlide } from './factory';

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  build: () => { slides: Slide[]; caption: string };
}

/**
 * Ready-made carousel structures Laísa can start from instead of a blank slide.
 * Each returns fresh slides (new ids) plus a suggested caption.
 */
export const TEMPLATES: CarouselTemplate[] = [
  {
    id: 'three-steps',
    name: 'Habilidade em 3 passos',
    description: 'Capa · lista de passos · porque funciona · evidência · chamada.',
    build: () => ({
      caption:
        'Uma habilidade prática para o seu dia 🌿\n\nSalve para praticar quando precisar e compartilhe com quem pode se beneficiar. 💛\n\n#psicologia #regulacaoemocional #saudemental #tcc #dbt',
      slides: [
        createSlide({ layout: 'cover', content: { eyebrow: 'Habilidade da semana', title: 'O nome da habilidade', subtitle: 'Uma frase curta sobre o que ela resolve.' } }),
        createSlide({ layout: 'list', content: { eyebrow: 'Passo a passo', title: 'Como praticar', items: ['Primeiro passo, bem concreto.', 'Segundo passo.', 'Terceiro passo.'] } }),
        createSlide({ layout: 'text', content: { eyebrow: 'Por que funciona', title: 'A ideia por trás', body: 'Explique em 2–3 frases o mecanismo — o que acontece no corpo/mente quando você pratica isto.' } }),
        createSlide({ layout: 'statistic', background: 'soft', content: { eyebrow: 'Evidência', stat: '00%', statLabel: 'o que o dado mostra', body: 'Uma frase de contexto.', reference: 'Autor et al., ano, Revista.' } }),
        createSlide({ layout: 'cta', content: { eyebrow: 'Para levar com você', title: 'Salve este post', subtitle: 'Pratique hoje e compartilhe com alguém. ↗' } }),
      ],
    }),
  },
  {
    id: 'myth-fact',
    name: 'Mito vs. Verdade',
    description: 'Capa · mito · verdade · contexto · chamada.',
    build: () => ({
      caption:
        'Mito x Verdade sobre [tema] 🧠\n\nDesfazer mitos é o primeiro passo para cuidar melhor da sua saúde mental.\n\nSalve e compartilhe! 💛\n\n#psicologia #saudemental #mitoseverdades #autoconhecimento',
      slides: [
        createSlide({ layout: 'cover', content: { eyebrow: 'Mito x Verdade', title: 'O que você acredita sobre [tema]?', subtitle: 'Vamos separar o que a ciência diz do que é senso comum.' } }),
        createSlide({ layout: 'text', background: 'soft', content: { eyebrow: 'Mito', title: '"A frase do mito aqui."', body: 'Por que essa crença é tão comum — em uma ou duas frases.' } }),
        createSlide({ layout: 'text', content: { eyebrow: 'Verdade', title: 'O que de fato acontece', body: 'A explicação baseada em evidências, com calma e clareza.' } }),
        createSlide({ layout: 'quote', background: 'soft', content: { quote: 'Uma frase de destaque que sintetiza a mensagem.', author: 'Laísa Bitencourt' } }),
        createSlide({ layout: 'cta', content: { eyebrow: 'Para refletir', title: 'Qual mito te surpreendeu?', subtitle: 'Conta nos comentários e salve para lembrar. ↗' } }),
      ],
    }),
  },
  {
    id: 'reflection',
    name: 'Reflexão / história',
    description: 'Capa · contexto · citação · desdobramento · chamada.',
    build: () => ({
      caption:
        'Uma reflexão para hoje 🌙\n\nÀs vezes uma pausa muda tudo. Compartilhe com quem precisa ler isto.\n\n#reflexao #psicologia #saudemental #autoconhecimento',
      slides: [
        createSlide({ layout: 'cover', content: { eyebrow: 'Reflexão', title: 'O título que convida à leitura', subtitle: 'Uma abertura suave para o tema.' } }),
        createSlide({ layout: 'text', content: { eyebrow: 'O contexto', title: 'Onde tudo começa', body: 'Apresente a situação ou a pergunta central, com proximidade e cuidado.' } }),
        createSlide({ layout: 'quote', background: 'soft', content: { quote: 'A frase que vale a pausa.', author: 'Autor, Obra (ano)' } }),
        createSlide({ layout: 'text', content: { eyebrow: 'O que isso nos ensina', title: 'O desdobramento', body: 'Conecte a reflexão à vida prática de quem lê.' } }),
        createSlide({ layout: 'cta', content: { eyebrow: 'Para levar com você', title: 'Guarde esta ideia', subtitle: 'Salve e volte a ela quando precisar. ↗' } }),
      ],
    }),
  },
  {
    id: 'science',
    name: 'Dado científico',
    description: 'Capa · dado · interpretação · aplicação · referência/chamada.',
    build: () => ({
      caption:
        'O que a ciência diz sobre [tema] 🔬\n\nPsicologia baseada em evidências, traduzida para o dia a dia.\n\nSalve e compartilhe! 💛\n\n#psicologiabaseadaemevidencias #ciencia #saudemental #psicologia',
      slides: [
        createSlide({ layout: 'cover', content: { eyebrow: 'Baseado em evidências', title: 'O que a ciência diz sobre [tema]', subtitle: 'Um dado que muda a forma como olhamos para isto.' } }),
        createSlide({ layout: 'statistic', background: 'soft', content: { eyebrow: 'O dado', stat: '00%', statLabel: 'o que o número representa', reference: 'Autor et al., ano, Revista.' } }),
        createSlide({ layout: 'text', content: { eyebrow: 'O que significa', title: 'Interpretando o dado', body: 'Traduza o número para a vida real, sem jargão.' } }),
        createSlide({ layout: 'list', content: { eyebrow: 'Na prática', title: 'Como aplicar', items: ['Uma aplicação concreta.', 'Outra aplicação.', 'Mais uma.'] } }),
        createSlide({ layout: 'cta', content: { eyebrow: 'Para levar com você', title: 'Salve para consultar depois', subtitle: 'Compartilhe com quem gosta de ciência. ↗' } }),
      ],
    }),
  },
];
