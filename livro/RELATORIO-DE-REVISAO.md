# Dualis · Relatório de Revisão e Diagramação

**Data:** agosto de 2026 · **Fontes analisadas:**
`Dualis_Livro_Basico_Manuscrito_Mestre_v3.docx`, `Dualis_Sistema_Grafico.pdf`, `Dualis_Caderno_de_Arte.docx`

**Entregas nesta pasta:**

| Arquivo | O que é |
|---|---|
| `Dualis-Livro-Basico-Diagramado.pdf` | O livro completo diagramado (224 págs., 190 × 250 mm) |
| `dualis-livro-basico.html` | Versão HTML da diagramação (fonte do PDF) |
| `manuscrito-revisado.md` | Texto integral com as correções aplicadas |
| `build_livro.py` + `estilo.css` | Gerador da diagramação (rode `python3 build_livro.py` para regerar) |
| `fonts/` | EB Garamond e Archivo (licença SIL OFL), instâncias estáticas |

A diagramação segue o Sistema Gráfico: paleta papel-osso `#E9E4D8` / índigo `#26364F` / verde oxidado `#3C6B60` / latão `#A9762B`; régua de seção 62/38 abrindo cada capítulo; ornamento de fim de capítulo; brasões das oito Famílias; glifos dos doze Eixos (apenas em material de Mestre, conforme a Regra de Aplicação); faixa de resultado 2d6 com a banda central de 41%; diagrama do Trilho de Três Convites com a seta de retorno.

---

## Incoerências encontradas e corrigidas

### 1. Numeração de capítulos herdada da versão antiga
A Nota Editorial declara a arquitetura definitiva de "sete Livros e vinte e três capítulos de sistema", e os Livros I–IV de fato vão do capítulo 1 ao 23. Mas os Livros V–VII ainda usavam a numeração da versão anterior de 45+ capítulos: o Bestiário abria no "Capítulo 46", pulava para 71–73, o Atlas ia de 74 a 86 e as Crônicas de 87 a 93 — deixando um buraco fantasma dos capítulos 24 a 45.
**Correção:** renumeração contínua — Bestiário: 24–27 · Atlas: 28–40 · Crônicas: 41–47. Nenhuma referência cruzada interna apontava para os números antigos (as remissões do texto citam apenas os capítulos 3, 14 e 18), então nada mais precisou mudar.

### 2. Títulos dos Livros I–III divergentes
Os cabeçalhos internos diziam "Livro I · A Mesa", "Livro II · O Personagem", "Livro III · O Motor", mas tanto a seção "Como usar este livro" (Abertura) quanto o Caderno de Arte (peças B-01 a B-03) usam **Entre Dois Mundos**, **Quem Você É** e **Quando o Mundo Responde**.
**Correção:** adotados os títulos confirmados por duas fontes. (Livros IV–VII já coincidiam.)

### 3. Nota de "Volume 1 / Volume 2" obsoleta no meio do Livro V
Após a Família IV havia um "FECHAMENTO DO VOLUME 1" anunciando que "o Volume 2 traz Oráculos, Coletores, Laços e Sombras" — mas essas quatro Famílias estão neste mesmo livro, logo em seguida (e o fechamento real do Livro V já diz "vinte e quatro criaturas, oito Famílias").
**Correção:** o trecho virou um intervalo de meio de caminho ("MEIO DO CAMINHO"), com o texto reescrito para apresentar as Famílias seguintes sem mencionar volumes.

### 4. Colisão de nomes: criatura "O Espelho" × Território "O Espelho"
O próprio manuscrito traz nota editorial pedindo a resolução, e o Caderno de Arte hesita entre as duas saídas (C-22 "a renomear: O Duplo" e T-10 "O Reflexo (antigo: O Espelho)") — o que, se aplicado dos dois lados, renomearia ambos sem necessidade.
**Correção adotada:** a **criatura** passa a ser **O Duplo** (como indica a peça C-22 e a primeira opção da nota); o **Território permanece O Espelho** — ele ancora a pergunta de identidade do Atlas e a Crônica "A Torre dos Espelhos". Atualizadas todas as 11 ocorrências da criatura (verbete, listas de Padrões frequentes dos Eixos A Marca e A Corrente, Padrões frequentes dos capítulos do Atlas, Tramas da Identidade Rígida / Identidade pelo Desempenho / Mudança Ameaçadora / A Ausência). O encontro 8 do Território O Espelho, que se chamava "O Duplo", virou **"O Semelhante"** para não criar colisão nova.
**Pendência no Caderno de Arte:** reverter T-10 para "O Espelho" (a peça descrita — poça refletindo a janela — continua servindo).

### 5. Ferramenta da Corda com instrução contraditória
"Rolagem Dividida: outro personagem pode acrescentar um dado à rolagem, e **o melhor resultado entre os três dados menores é descartado**" — impossível de executar como escrito.
**Correção:** "rolam-se três dados e o menor deles é descartado" (mantém a intenção: ajuda melhora o resultado).

### 6. Eixos × verbetes do Bestiário dessincronizados
Quatro criaturas declaram um Eixo cujo quadro "Padrões frequentes" (cap. 18) não as listava: O Rastreador e O Leitor de Sinais (A Névoa), O Adiador (A Brasa) e O Inventariante (A Marca).
**Correção:** os quatro foram acrescentados às listas dos respectivos Eixos.

### 7. Vínculo de Elias em desacordo com a ficha de Iris
No cap. 6 a tensão do vínculo era "ele admira sua prudência" (presente, como se vivo); na ficha do Apêndice A, Elias está morto ("morreu num dia de bom tempo").
**Correção:** a linha do cap. 6 passou a usar a versão da ficha.

### 8. Glossário sem os termos centrais dos capítulos novos
Os capítulos 3, 14 e 18 e o Bestiário refeito introduzem vocabulário que o glossário (consolidado da versão anterior) não cobria.
**Correção:** adicionados **Eixo, Exposição, Família, Metamorfose, Movimento e Trilho de Três Convites**, em ordem alfabética.

### 9. Ficha do Mestre (Apêndice B) sem campos que o livro usa
A Camada do Mestre dos quatro pré-gerados registra "Eixo dominante / secundário / polo pouco usado" e "Trilho sugerido", mas a ficha em branco do Apêndice B não tinha esses campos.
**Correção:** campos adicionados ao Apêndice B.

---

## Verificações que passaram (sem correção)

- **Contagens:** 24 criaturas em 8 Famílias de 3; 12 Eixos; 12 Territórios; 6 Crônicas; 5 Tramas nomeadas; 4 pré-gerados — tudo bate com os fechamentos declarados.
- **Motor 2d6:** a tabela do cap. 18, os exemplos jogados (7, 8 e 9 → "consegue, e alguma coisa muda de lugar") e a faixa do Sistema Gráfico (41% para 7–9) são consistentes entre si — P(7–9) em 2d6 = 15/36 ≈ 41,7%.
- **Sessão exemplar (cap. 3):** preparação, Eixo da Iris (A Névoa), convite discreto e as três anotações finais seguem exatamente o procedimento dos caps. 14 e 18. Ferramentas usadas nos exemplos do cap. 14 correspondem aos Eixos dos personagens (Tavi → O Rosto/dado aberto +1; Beren → O Peso/dado emprestado).
- **Fichas × capítulos de exemplo:** idades, valores, vínculos e Camada do Mestre dos Quatro conferem com os usos ao longo do livro (Wren 15 anos, Beren 44, etc.).
- **Caderno de Arte:** inventário fecha em 74 peças (A3+B8+C24+D12+E14+F4+G6+H3) e os lotes 38+15+21 conferem; idades dos retratos F-01 a F-04 conferem com as fichas.

## Pendências apontadas (decisão de autor, não corrigidas)

1. **Caderno de Arte, T-10:** reverter para "O Espelho" (ver item 4).
2. **Caderno de Arte, G-02 a G-06:** os briefings dizem aguardar "títulos finais em revisão", mas os seis títulos já estão fixados no manuscrito v3 — dá para fechar a adenda com: O Reino das Portas Fechadas, A Torre dos Espelhos, O Último Trem, A Vila que Esqueceu seu Nome e O Jardim Murado.
3. **Caderno de Arte, contagem:** B-00 "é a mesma peça" que S-01, então as 74 peças contam a mesma arte duas vezes — são 73 artes únicas (afeta orçamento).
4. **Anexo terapêutico:** a decisão de migrá-lo para volume clínico separado segue em aberto; ele está diagramado ao fim do livro, como no manuscrito.
5. **Capítulos consolidados:** os capítulos marcados "consolidado da versão anterior" seguem aguardando expansão editorial — a marcação foi mantida visível na diagramação (linha em verde, itálico).
