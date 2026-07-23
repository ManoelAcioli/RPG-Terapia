# Ecos do Eterno — O Eco (protótipo visual novel)

Visual novel curta (~10 min) no formato de **Slay the Princess**, sobre o
universo do RPG terapêutico *Ecos do Eterno*: um encontro que se repete em
ciclos, uma entidade que se transforma conforme a sua postura, vozes internas
que se acumulam — e um Narrador que insiste que você sabe o que fazer.

> Há uma trilha. Sempre houve.

## Rodar

```bash
cd vn
npm install
npm run dev        # abre em http://localhost:5174
```

- `npm run build` — build estático em `dist/`
- `npm run lint:graph` — valida o grafo narrativo (gotos, becos, alcançabilidade)

## Como funciona

- **Ciclo I** — você encontra o Vulto. Sua postura (avançar / recuar /
  perguntar / estender a mão) define **em que ele se transforma**.
- **Ciclo II** — o Eco retorna como **Fúria**, **Névoa**, **Arquivo** ou
  **Ferida** — a forma que a sua postura criou. Cada forma confronta o padrão
  que a gerou.
- **Vozes** — a cada ciclo, vozes internas se juntam a você (Medo, Raiva,
  Cético, Ternura, Culpa) e comentam as escolhas.
- **Ciclo III** — três saídas possíveis, nem todas disponíveis em toda rota:
  **Silenciar** (repetir), **Partir** (adiar com gentileza) ou **Nomear**
  (perceber — só se você percebeu algo pelo caminho).
- Entre os ciclos, **o Vazio**: uma pergunta aberta, sem resposta certa.
- Ao terminar, o jogo lembra quantos ciclos você já atravessou — e o Vulto
  também lembra.

## Técnica

- TypeScript + Vite, zero dependências de runtime, zero assets externos.
- **Engine própria de ~100 linhas** (`engine.ts`): grafo de nós com falas
  sequenciais, escolhas condicionais e efeitos sobre o estado.
- **Arte procedural em "traço de lápis vivo"** (`art.ts`): polilinhas
  tremidas re-renderizadas a ~7fps (o tremor de Slay the Princess), papel
  escuro, giz claro, um acento de cor por forma do Eco.
- **Drone ambiente WebAudio** (`audio.ts`) com um clima por forma.
- Roteiro completo em `script.ts` (41 nós, 3 finais), validado por
  `lint-graph.ts` (grafo + alcançabilidade).
- `#debug` na URL expõe `window.__vn` para testes automatizados.
