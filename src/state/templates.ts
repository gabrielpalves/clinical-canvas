import type { DesignModeId, Slide } from '../types';
import { createBlock, createSlide } from './factory';

export interface CarouselTemplate {
  id: string;
  name: string;
  description: string;
  /** menu grouping label. */
  group: string;
  /** mode to switch to when the template is applied. */
  mode?: DesignModeId;
  build: () => { slides: Slide[]; caption: string };
}

const hd = (text: string, size: 'xl' | 'lg' | 'md' | 'sm' = 'md') => createBlock('heading', { text, size });
const pg = (text: string) => createBlock('paragraph', { text });
const li = (items: string[], marker: 'number' | 'dot' | 'ring' | 'dash' | 'arrow' = 'number') => createBlock('list', { items, marker });
const qt = (text: string, author: string) => createBlock('quote', { text, author });
const st = (stat: string, statLabel: string, body: string) => createBlock('statistic', { stat, statLabel, body });

const LAISA = 'Psicologia · Laísa';

// --- Studio (mind & philosophy) helpers -------------------------------------
// Dark, minimal canvas: custom near-black background (cream text auto-applies),
// Fraunces display headings + Inter body. A blank-slate look for any niche.
const STUDIO_BG = '#14161a';
const STUDIO = 'Studio · Mente & filosofia';
const sSlide = (seed: Parameters<typeof createSlide>[0] = {}) =>
  createSlide({ bgColor: 'custom', bgCustom: STUDIO_BG, ...seed });
const shd = (text: string, size: 'xl' | 'lg' | 'md' | 'sm' = 'md') => createBlock('heading', { text, size, font: 'fraunces' });
const spg = (text: string) => createBlock('paragraph', { text, font: 'inter' });
const sli = (items: string[], marker: 'number' | 'dot' | 'ring' | 'dash' | 'arrow' = 'dash') => createBlock('list', { items, marker, font: 'inter' });
const sqt = (text: string, author: string) => createBlock('quote', { text, author, font: 'fraunces' });
const dv = () => createBlock('divider');

/** Ready-made carousel structures to start from. */
export const TEMPLATES: CarouselTemplate[] = [
  {
    id: 'three-steps',
    name: 'Habilidade em 3 passos',
    description: 'Capa · passos · porque funciona · evidência · chamada.',
    group: LAISA,
    mode: 'earth-clinical',
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
    group: LAISA,
    mode: 'earth-clinical',
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
    group: LAISA,
    mode: 'earth-clinical',
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
    group: LAISA,
    mode: 'earth-clinical',
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

  // -------------------------------------------------------------------------
  // Studio — mind, philosophy & narrative (dark/minimal, Fraunces + Inter)
  // -------------------------------------------------------------------------
  {
    id: 'studio-narrative',
    name: 'Narrative → philosophy',
    description: 'Hook · setup · turn · pivot quote · reframe · bridge · practice · close.',
    group: STUDIO,
    mode: 'studio',
    build: () => ({
      caption:
        'A story carries a truth better than an argument. 🗡️\n\n[One line on the work + the insight.]\n\nSave it for when you need it.\n\n#philosophy #stoicism #psychology #literature',
      slides: [
        sSlide({ eyebrow: 'WORK · THEME', blocks: [shd('Your story hook here', 'xl'), spg('One line on what this story reveals about human nature.')] }),
        sSlide({ eyebrow: 'The setup', blocks: [shd('Who the character is'), spg('Set the scene in 2–3 lines. Where they begin.')] }),
        sSlide({ eyebrow: 'The turn', blocks: [shd('The moment everything changes'), spg('The inflection point of the journey.')] }),
        sSlide({ contentAnchor: 'center', blocks: [sqt('The central line or image from the work.', 'Character, Work')] }),
        sSlide({ eyebrow: 'The reframe', blocks: [shd('What it really means'), spg('Connect the story to one principle about the mind.')] }),
        sSlide({ eyebrow: 'The bridge', blocks: [shd('What philosophy or science says'), spg('Bring a source — the Stoics, Buddhism, neuroscience — that echoes the same truth.')] }),
        sSlide({ eyebrow: 'The practice', blocks: [shd('Take it into your life'), sli(['A concrete question to sit with.', 'A small thing to notice.', 'One thing to try this week.'])] }),
        sSlide({ align: 'center', eyebrow: 'Keep this', blocks: [shd('The idea in one line', 'lg'), dv(), spg('Save it and share with someone who needs it. ↗')] }),
      ],
    }),
  },
  {
    id: 'studio-synthesis',
    name: 'Cross-tradition synthesis',
    description: 'Hook · three traditions · convergence · practice.',
    group: STUDIO,
    mode: 'studio',
    build: () => ({
      caption:
        'One idea, found independently by traditions that never met. 🌐\n\n[Name the idea.]\n\nWhen the mystics and the scientists agree, pay attention.\n\n#philosophy #stoicism #buddhism #neuroscience',
      slides: [
        sSlide({ eyebrow: 'ONE IDEA, MANY NAMES', blocks: [shd('The single insight', 'xl'), spg('State it plainly. Then: three traditions that arrived at it on their own.')] }),
        sSlide({ eyebrow: 'Tradition I', blocks: [shd('Stoicism'), spg('How this lineage frames the idea — one quote or paraphrase.')] }),
        sSlide({ eyebrow: 'Tradition II', blocks: [shd('Buddhism / Vedanta'), spg('The same insight, in its own language.')] }),
        sSlide({ eyebrow: 'Tradition III', blocks: [shd('Modern science'), spg('What cognitive science or neuroscience says about the same thing.')] }),
        sSlide({ eyebrow: 'The convergence', blocks: [shd('Same mountain, different paths'), spg('Name what they all point to — and why that agreement matters.')] }),
        sSlide({ align: 'center', eyebrow: 'The practice', blocks: [shd('What to do with it', 'lg'), dv(), spg('One line to live by. Save this. ↗')] }),
      ],
    }),
  },
  {
    id: 'studio-one-idea',
    name: 'One idea, deep',
    description: 'Hook · the idea · the mechanism · the practice · close.',
    group: STUDIO,
    mode: 'studio',
    build: () => ({
      caption:
        '[The one-line reframe.] 🧠\n\nMost people never question this. Here is what is actually going on.\n\nSave it.\n\n#psychology #philosophy #mindfulness #selfmastery',
      slides: [
        sSlide({ eyebrow: 'ONE IDEA', blocks: [shd('The hook — make them stop', 'xl'), spg('A single line that reframes something they take for granted.')] }),
        sSlide({ eyebrow: 'The idea', blocks: [shd('What it actually is'), spg('Unpack the concept clearly, with its real nuance. No jargon.')] }),
        sSlide({ eyebrow: 'Why it works', blocks: [shd('The mechanism'), spg('The why underneath — a source, a study, a principle.')] }),
        sSlide({ eyebrow: 'The practice', blocks: [shd('Try this'), sli(['A small experiment for this week.', 'How to notice it happening.', 'How to apply it.'])] }),
        sSlide({ align: 'center', eyebrow: 'Keep this', blocks: [shd('The idea in one line', 'lg'), dv(), spg('Save for when you need it. ↗')] }),
      ],
    }),
  },
  {
    id: 'studio-manifesto',
    name: 'Manifesto / why this exists',
    description: 'A belief series — your pinned "why I\'m here" post.',
    group: STUDIO,
    mode: 'studio',
    build: () => ({
      caption:
        'Start here. 🌑\n\n[One honest line about what this page is.]\n\nNo hype. No shortcuts. Just the work of seeing clearly.\n\n#philosophy #psychology #awareness',
      slides: [
        sSlide({ eyebrow: 'START HERE', blocks: [shd('Why this exists', 'xl'), spg('One honest sentence about what you are doing here.')] }),
        sSlide({ align: 'center', contentAnchor: 'center', blocks: [shd('A short, strong belief.', 'lg')] }),
        sSlide({ align: 'center', contentAnchor: 'center', blocks: [shd('Another belief — the contrarian one.', 'lg')] }),
        sSlide({ eyebrow: "What you'll find here", blocks: [shd('The promise'), sli(['The kind of posts you make.', 'The traditions you draw on.', 'What you refuse to do — no hype, no shortcuts.'])] }),
        sSlide({ align: 'center', eyebrow: 'If that resonates', blocks: [shd('Follow along', 'lg'), dv(), spg('New posts a few times a week. Save this one. ↗')] }),
      ],
    }),
  },
];
