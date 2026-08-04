# RPG-Terapia · Selfi

Conteúdo que usa linguagem de RPG de mesa para falar de processo emocional, e o
app de vídeo que produz as peças, construído com [Remotion](https://www.remotion.dev/).

## Estrutura

```
.claude/agents/           # Os 24 subagentes, um arquivo por agente
org/
├── estrutura.json        # Fonte única de verdade: domínios, agentes, tarefas
└── README.md             # Como a operação funciona e como estendê-la
my-video/
├── src/
│   ├── index.ts          # Entry point — registra as composições
│   ├── Root.tsx          # Define as composições disponíveis
│   ├── Composition.tsx   # Composição do scaffold
│   └── graph/            # Mapa radial de agentes, gerado de estrutura.json
│       ├── layout.ts     # Matemática polar e tempos de entrada
│       ├── MapaAgentes.tsx
│       ├── No.tsx · Aresta.tsx · NucleoParticulas.tsx
│       └── tipos.ts
├── public/               # Assets estáticos (sempre via staticFile())
├── package.json
└── tsconfig.json
```

## A operação

O trabalho é organizado em 6 domínios com 24 agentes — veja `org/README.md`.
Dois pontos que valem em qualquer sessão:

- **`guarda-etica` tem veto.** Conteúdo que toca trauma, diagnóstico, medicação ou
  ideação não é publicado sem passar por ele.
- **`org/estrutura.json` é fonte única de verdade.** Todo agente em `.claude/agents/`
  está listado nele, e o vídeo do mapa é gerado dali. Adicionar agente exige mudar
  os dois lugares.

## Comandos

```bash
cd my-video

npm start              # Remotion Studio
npx tsc --noEmit       # Typecheck (deve passar limpo)

# Renderizar o mapa de agentes
npx remotion render MapaAgentesVertical out/mapa.mp4        # 1080×1920
npx remotion render MapaAgentesHorizontal out/mapa16x9.mp4  # 1920×1080

npm run upgrade        # Atualizar dependências Remotion
```

## Remotion: o que quebra o render

O render é paralelo e frame a frame. Nunca use `Math.random()` (use `random()` do
Remotion), `Date.now()`, ou `useState` para guardar estado de animação — o Studio
mostra certo e o vídeo final sai inconsistente. Toda animação deriva de
`useCurrentFrame()`, todo asset passa por `staticFile()`, e todo tempo é calculado
a partir do `fps` da composição.

## Stack

- [Remotion](https://www.remotion.dev/) 4.x
- React 18
- TypeScript (`strict`, com `resolveJsonModule`)
