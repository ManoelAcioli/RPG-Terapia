# A estrutura

Este diretório é o mapa da operação do RPG-Terapia: quais domínios existem, quais
agentes moram em cada um, e quem chama quem.

## A ideia

O trabalho não é uma lista de tarefas — é uma **operação com departamentos**. Cada
domínio tem um recorte próprio e um jeito próprio de julgar o que é bom. Quando
você delega para um agente, ele responde com os critérios daquele domínio, não com
os critérios genéricos de "me ajuda com isso".

```
                          NARRATIVA
                              │
            INTELIGÊNCIA ─────┼───── CLÍNICO
                              │
                           NÚCLEO
                              │
                 PRODUTO ─────┼───── PRODUÇÃO
                              │
                        DISTRIBUIÇÃO
```

| Domínio | Recorte | Agentes |
|---|---|---|
| **NARRATIVA** | roteiro · personagens · arcos | `roteirista-curto` · `mestre-rpg` · `arco-personagem` · `revisor-tom` |
| **CLÍNICO** | fundamento · ética · segurança | `fundamento-terapeutico` · `guarda-etica` · `linguagem-acessivel` · `dinamica-sessao` |
| **PRODUÇÃO** | remotion · motion · áudio | `remotion-dev` · `design-visual` · `audio-narracao` · `render-pipeline` |
| **DISTRIBUIÇÃO** | canais · calendário · alcance | `estrategia-canal` · `copy-legenda` · `calendario-editorial` · `analise-metricas` |
| **PRODUTO** | selfi · backlog · código | `arquiteto-selfi` · `backlog-produto` · `qa-revisor` · `docs-projeto` |
| **INTELIGÊNCIA** | pesquisa · referência · nicho | `pesquisa-referencia` · `radar-tendencia` · `benchmark-criador` · `banco-ideias` |

## Como usar

Os agentes vivem em `.claude/agents/`. Cada arquivo é um subagente do Claude Code
com seu próprio contexto e suas próprias regras.

Chame pelo nome:

```
usa o roteirista-curto pra transformar essa ideia em vídeo
passa isso no guarda-etica antes de eu publicar
```

Ou descreva a tarefa e deixe o roteamento acontecer — cada agente tem um campo
`description` que diz quando ele deve ser acionado.

## O caminho normal de uma peça

```
banco-ideias → roteirista-curto → fundamento-terapeutico → guarda-etica
    → revisor-tom → remotion-dev → render-pipeline
    → copy-legenda → estrategia-canal → calendario-editorial → analise-metricas
                                                                    │
                                                            volta pro banco-ideias
```

Duas regras que sustentam o resto:

- **O `guarda-etica` tem veto.** Nada sobre trauma, diagnóstico, medicação ou
  ideação é publicado sem passar por ele. Nem por pressa, nem por alcance.
- **O `calendario-editorial` é o dono da fila.** Quando você não souber o que fazer,
  pergunte a ele — ele responde com uma peça só.

## Arquivos vivos

Estes são criados pelos agentes conforme você usa, e não existem até a primeira vez:

- `calendario.md` — a fila de publicação (`calendario-editorial`)
- `ideias.md` — o banco de ideias (`banco-ideias`)
- `backlog.md` — o backlog do app (`backlog-produto`)
- `decisoes/` — as decisões técnicas registradas (`arquiteto-selfi`)

## Adicionar um agente

1. Crie `.claude/agents/<id>.md` com frontmatter `name` (igual ao nome do arquivo),
   `description` (quando acionar) e `tools`.
2. Adicione o mesmo `id` no domínio certo em `estrutura.json`, com `nome`,
   `entrega` e `tarefas`.

Os dois passos são obrigatórios: `estrutura.json` é a fonte única de verdade e é
dela que o vídeo do mapa é gerado. O `docs-projeto` checa essa consistência.

Para verificar na mão:

```bash
python3 - <<'PY'
import json, os
ids = {a['id'] for d in json.load(open('org/estrutura.json'))['dominios'] for a in d['agentes']}
arquivos = {f[:-3] for f in os.listdir('.claude/agents') if f.endswith('.md')}
print('no JSON sem arquivo:', ids - arquivos or 'ok')
print('arquivo sem JSON  :', arquivos - ids or 'ok')
PY
```

## O mapa em vídeo

`estrutura.json` também alimenta a visualização radial em `my-video/src/graph/`.
Adicionar um agente muda o vídeo automaticamente — não há dado duplicado.

```bash
cd my-video
npm start                                    # Studio, com o mapa animado
npx remotion render MapaAgentesVertical out/mapa.mp4     # 1080×1920
npx remotion render MapaAgentesHorizontal out/mapa16x9.mp4
```
