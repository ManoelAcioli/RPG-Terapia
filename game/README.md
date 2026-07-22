# Ecos do Eterno — protótipo jogável

**A Cidade Suspensa no Tempo** — fatia vertical de um jogo de plataforma
atmosférico inspirado na linguagem visual de GRIS, construído sobre o universo
do RPG terapêutico *Ecos do Eterno*.

Você é um **Orbis**: uma consciência que atravessa camadas de tempo. O mundo
começa em cinza. Caminhar junto dos seus **ecos** — versões suas presas em
percursos que se repetem — devolve a cor a cada era da cidade.

## Rodar

```bash
cd game
npm install
npm run dev      # abre em http://localhost:5173
```

Build de produção: `npm run build` (gera `dist/`, servível como página estática).

## Controles

| Tecla | Ação |
| --- | --- |
| ← → / A D | mover |
| ↑ / W / Espaço | pular (segure para pular mais alto) |
| E | trocar de camada temporal (anos 20 → anos 80 → futuro) |

## A fatia vertical

1. **Distrito dos anos 20** (sépia/âmbar) — aprenda a mover; caminhe com o
   primeiro eco até o anel se fechar; a cor da era retorna. A saída é uma
   escadaria de toldos que só é sólida na era certa.
2. **Distrito dos anos 80** (neon violeta/ciano) — segundo eco; letreiros-escada.
3. **Distrito do futuro** (teal/aurora) — terceiro eco; plataformas flutuantes.
4. **Corredor de Sísifo** — o corredor se repete quando você chega ao fim.
   Um único detalhe muda a cada passagem. Perceba-o e alcance-o para quebrar
   o ciclo. *(repetir ou perceber)*
5. **Praça do Relógio** — o primeiro eco se aquieta.

Entre os momentos-chave, o jogo pausa em silêncio e faz uma única pergunta,
que se dissolve sozinha — o toque "híbrido" da proposta terapêutica
(TCC implícita, nunca didática).

## Técnica

- Phaser 3 + TypeScript + Vite. Zero assets externos: toda a arte é
  procedural (texturas geradas, gradientes, partículas) e o áudio é um pad
  ambiente sintetizado via WebAudio que ganha brilho conforme a cor volta.
- Cada objeto colorível registra um par (cor cinza, cor plena) e interpola
  pelo progresso da sua era (`ColorState`).
- Plataformas de era são one-way (atravessáveis por baixo) e só têm corpo
  físico na era ativa; nas outras aparecem como fantasmas.
- Pulo com coyote time, jump buffering e altura variável.

### Modos de URL (testes)

- `#debug` — expõe `window.__ecos` (estado e teleporte) para testes E2E.
- `#canvas` — força o renderer Canvas (headless/máquinas fracas). Atenção:
  tint e gradientes são recursos WebGL; o modo Canvas é só para testar lógica.
