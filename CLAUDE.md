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
