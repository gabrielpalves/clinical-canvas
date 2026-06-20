# Clinical Canvas

Um editor de **carrosséis para Instagram** com a identidade visual de
[Laísa Bitencourt](https://laisabitencourt.com) — psicologia clínica baseada em
evidências. Você digita o texto, escolhe o layout de cada slide, e o app gera
imagens prontas para publicar (1080×1350 ou 1080×1080), já com as fontes, cores
e o estilo da marca.

## ✨ O que ele faz

- **4 estilos visuais** intercambiáveis, todos usando as fontes (Cormorant
  Garamond + Montserrat) e a paleta da marca, para que tudo pareça "dela":
  - **Earth-Clinical** — diário clínico: bege quente, dourado e nota `REF:`.
  - **Narrative Compass** — editorial: creme com vinho e citações em serifa.
  - **Somatic Sanctuary** — respiro: tons suaves, textura de papel e espaço.
  - **Minimalist Academic** — técnico: branco, grade fina e tipografia limpa.
- **Layout por slide**: Capa, Texto, Lista, Citação, Dado (estatística),
  Imagem e Chamada (CTA). Cada slide do mesmo carrossel pode ter um layout
  diferente.
- **Tudo é editável e ligável/desligável**: selo (eyebrow), numeração, acentos
  de fundo, aspas decorativas, rodapé `REF:` (citação científica), assinatura/@.
- **Imagens**: envie imagens por slide, com ajuste "preencher/conter".
- **Imagem contínua (panorama)**: uma única imagem distribuída por slides
  seguidos, criando o efeito de continuação ao arrastar no feed.
- **Proporção**: 4:5 (1080×1350, recomendado) ou 1:1 (1080×1080).
- **Exportação**: baixe um slide como PNG ou **todos de uma vez em um `.zip`**,
  na resolução exata do Instagram, com as fontes embutidas.
- **Prévia** estilo Instagram (setas/teclado) e **salvamento automático** no
  navegador (localStorage) — você não perde o trabalho ao fechar.

## 🚀 Como rodar (no VS Code ou terminal)

Requer [Node.js](https://nodejs.org) 18+.

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # inicia o editor em http://localhost:5173
```

Abra o endereço no navegador. Para gerar a versão de produção:

```bash
npm run build    # gera a pasta dist/
npm run preview  # testa a versão de produção localmente
```

## 📦 Deploy (Vercel)

O projeto é um app Vite estático e funciona direto na Vercel:

1. Suba este repositório para o GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New Project** → importe o repo.
3. A Vercel detecta o Vite automaticamente (build: `npm run build`, saída:
   `dist`). É só clicar em **Deploy**.

Ou via CLI: `npm i -g vercel && vercel`.

## 🧩 Como adicionar coisas novas

O app foi feito para crescer sem retrabalho:

- **Novo estilo (design mode):** adicione um item em
  [`src/designModes.ts`](src/designModes.ts) e um bloco de variáveis CSS em
  [`src/styles/modes.css`](src/styles/modes.css) (`.cc-frame[data-mode='...']`).
  A barra de estilos se atualiza sozinha.
- **Novo layout de slide:** adicione em `LAYOUTS`
  ([`src/designModes.ts`](src/designModes.ts)), um `case` em
  [`src/components/SlideFrame.tsx`](src/components/SlideFrame.tsx) e o estilo
  correspondente em `modes.css`.

## 🗂 Estrutura

```
src/
├── components/        # UI do editor (toolbar, strip, inspetor, prévia) + SlideFrame
├── state/             # estado do carrossel (reducer, contexto, dados de exemplo)
├── lib/               # exportação (PNG/ZIP), dimensões, leitura de imagem, panorama
├── styles/            # fonts.css, app.css (chrome) e modes.css (os 4 estilos)
├── designModes.ts     # metadados dos estilos e dos layouts
└── types.ts           # modelo de dados
```

## 🛠 Stack

React 19 · TypeScript · Vite · [html-to-image](https://github.com/bubkoo/html-to-image)
(exportação) · [JSZip](https://stuk.github.io/jszip/) · fontes self-hosted via
[Fontsource](https://fontsource.org) · ícones [lucide-react](https://lucide.dev).

> As anotações e prompts originais (Google Stitch) que deram origem ao projeto
> estão preservados em [`docs/STITCH_NOTES.md`](docs/STITCH_NOTES.md).
