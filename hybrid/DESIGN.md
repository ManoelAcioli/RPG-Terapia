# O Eco: Travessia — decisões de design do híbrido

Terceiro protótipo do Ecos do Eterno. Pergunta de design: *e se as escolhas
de uma visual novel fossem feitas com o corpo, num mundo que se atravessa?*

## O que veio de cada protótipo

| De `vn/` (Slay the Princess) | De `game/` (GRIS) |
| --- | --- |
| O roteiro em ciclos e o Eco que se transforma pela postura | O personagem que anda, pula e habita um espaço contínuo |
| As Vozes acumuladas e Kairoon como Narrador | O texto ambiental que aparece conforme se avança |
| Os 3 finais com gates narrativos | A câmera lateral, o ritmo contemplativo, a cor como estado |
| A arte de lápis vivo e o drone por forma | O "loop que dá a volta" (a trilha que retorna ao limiar) |

## Escolha por movimento (a tese)

Numa VN, escolher é apontar. Aqui, escolher é **estar**: cada opção é um
lugar, e permanecer nele por um instante é decidir. Isso muda a semântica
das escolhas de um jeito que serve à proposta terapêutica:

- **Recuar custa passos.** Você sente a distância que põe entre você e o Eco.
- **Aproximar-se devagar é diferente de avançar.** As duas marcas ficam a
  poucos metros uma da outra — mas o gesto é outro.
- **Partir é uma caminhada, não um clique.** E a trilha dá a volta: o jogo
  registra que você tentou (`tentou_partir`), e isso abre o final Partir.
- **A zona do encontro nunca se desativa** depois que você entra: dar as
  costas ao Eco também é uma postura tomada *diante* dele.

A hesitação vira parte da escolha: dá para se aproximar de uma marca,
ver o anel começar a fechar, e sair. O jogo não registra isso — mas o
jogador sente.

## Ergonomia

- O anel de ativação leva ~1,1s: rápido o bastante para não frustrar,
  lento o bastante para ser um gesto deliberado (e cancelável).
- Atrito alto ao soltar a seta: o personagem para perto de onde você quis
  parar (derrapagem curta), com raio de ativação generoso (46px).
- Legendas seguem o personagem, com tempo mínimo proporcional ao texto;
  andar rápido enfileira, nunca perde fala.

## Limitações conhecidas (protótipo)

- Andar muito rápido acumula legendas atrasadas em relação ao ponto do
  mundo que as disparou.
- O pulo é puramente expressivo (não há plataformas) — candidato a ganhar
  função (alcançar uma marca elevada = uma postura "difícil"?).
- Falta indicar visualmente qual marca está armando o anel antes de ele
  aparecer (affordance).

## Se este formato vencer

- Trechos de travessia mais ricos entre encontros (o DNA GRIS pede mais
  mundo: ruínas, os cenários das 5 regiões do documento).
- Posturas com verbos físicos distintos (pular para alcançar, agachar,
  ficar imóvel no escuro) — vocabulário corporal por forma do Eco.
- A cor conquistada persistindo entre ciclos no cenário (hoje só nos
  acentos e no final).
