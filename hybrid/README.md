# Ecos do Eterno — O Eco: Travessia (protótipo híbrido)

A mescla dos dois protótipos anteriores: a narrativa de ciclos da visual novel
(`vn/`, formato Slay the Princess) com a mobilidade do jogo de plataforma
(`game/`, inspirado em GRIS).

**A inovação central: escolha por movimento.** Não há botões de diálogo. As
falas flutuam no mundo conforme você caminha, e as decisões são **posturas
físicas**: para confrontar o Eco, você anda até ele; para recuar, dá as
costas; para estender a mão, para ao lado dele e permanece. O corpo escolhe.

> ← → andar · espaço pular · o corpo escolhe

## Rodar

```bash
cd hybrid
npm install
npm run dev        # abre em http://localhost:5175
```

`npm run build` gera `dist/` estático.

## Estrutura da experiência (~10 min)

- **Ciclo I** — a trilha, Kairoon, o limiar, o Vulto. Quatro posturas
  possíveis, marcadas no chão: *avançar*, *estender a mão*, *ficar e
  perguntar*, *recuar*. Ficar sobre uma marca por ~1s a ativa.
  (Tentar voltar pela trilha faz o mundo dar a volta — e isso fica
  registrado.)
- **O Vazio** — travessia flutuante entre ciclos; uma voz nova se apresenta;
  uma pergunta aberta atravessa o caminho.
- **Ciclo II** — o Eco na forma que a sua postura criou (Fúria / Névoa /
  Arquivo / Ferida), com três posturas próprias por forma.
- **Ciclo III** — *silenciar*, *partir* (se você já tentou partir, ou se o
  Medo veio junto) ou *nomeá-lo* (se você percebeu algo pelo caminho).
  A zona do encontro não se desativa: recuar e partir também são posturas
  tomadas diante dele.
- **Finais encenados no mundo**: no *perceber*, o Eco atravessa a cena até
  você e os dois se sentam juntos enquanto a cor inunda o mundo; no *partir*,
  você caminha de volta e se senta no degrau do limiar.

## Técnica

- TypeScript + Vite, sem dependências de runtime, sem assets externos.
- Mundo lateral em **traço de lápis vivo** com câmera (`sketch.ts`) —
  mesmo idioma visual da VN, agora em espaço de mundo.
- Roteiro como **beats posicionais** (`story.ts`): cada fala tem um `x`;
  cruzou, disparou. Encontros definem marcadores com efeitos e gates.
- Legendas ancoradas ao personagem (DOM), fila com tempo mínimo de leitura.
- Drone WebAudio com clima por forma (`audio.ts`).
- `#debug` na URL expõe `window.__eco` para testes automatizados.
