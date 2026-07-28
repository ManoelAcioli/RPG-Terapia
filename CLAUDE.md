# RPG-Terapia

Quatro projetos vivem neste repositório (os três primeiros são protótipos do
RPG terapêutico "Ecos do Eterno" em formatos diferentes):

- **`hybrid/`** — *O Eco: Travessia*: protótipo **híbrido** (VN + mobilidade)
  — o roteiro de ciclos da visual novel num mundo lateral onde as escolhas
  são posturas físicas ("escolha por movimento"). TypeScript + Vite.
  Ver `hybrid/README.md` e `hybrid/DESIGN.md`.
  Comandos: `cd hybrid && npm install && npm run dev` / `npm run build`.
- **`vn/`** — *O Eco*: protótipo **visual novel** no formato de Slay the
  Princess (TypeScript + Vite, engine própria, arte procedural em traço de
  lápis). Ver `vn/README.md` e `vn/DESIGN.md`.
  Comandos: `cd vn && npm install && npm run dev` / `npm run build` /
  `npm run lint:graph` (valida o grafo narrativo).
- **`game/`** — *A Cidade Suspensa no Tempo*: protótipo **plataforma**
  inspirado em GRIS (Phaser 3 + TypeScript + Vite).
  Ver `game/README.md` e `game/DESIGN.md`.
  Comandos: `cd game && npm install && npm run dev` / `npm run build`.
- **`my-video/`** — Selfi: app de vídeo construído com
  [Remotion](https://www.remotion.dev/) (projeto anterior).

# Selfi

App de vídeo construído com [Remotion](https://www.remotion.dev/).

## Estrutura

```
my-video/
├── src/
│   ├── index.ts          # Entry point — registra as composições
│   ├── Root.tsx          # Define as composições disponíveis
│   └── Composition.tsx   # Componente principal do vídeo
├── public/               # Assets estáticos
├── package.json
└── tsconfig.json
```

## Comandos

```bash
cd my-video

# Abrir o Remotion Studio
npm start

# Renderizar vídeo
npm run build

# Atualizar dependências Remotion
npm run upgrade
```

## Stack

- [Remotion](https://www.remotion.dev/) 4.x
- React 18
- TypeScript
