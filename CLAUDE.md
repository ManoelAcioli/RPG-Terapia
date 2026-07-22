# RPG-Terapia

Dois projetos vivem neste repositório:

- **`game/`** — *Ecos do Eterno*: protótipo jogável (Phaser 3 + TypeScript +
  Vite) inspirado em GRIS, baseado no RPG terapêutico "Ecos do Eterno".
  Ver `game/README.md` (como rodar) e `game/DESIGN.md` (visão de design).
  Comandos: `cd game && npm install && npm run dev` (dev) / `npm run build`.
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
