import { Script, State, addVoice } from './engine';

// ---------------------------------------------------------------------------
// O ECO — roteiro do protótipo
// Ciclo I: o Vulto. Ciclo II: a forma que a sua postura criou.
// Ciclo III: o encontro final — silenciar, partir, ou nomear.
// ---------------------------------------------------------------------------

const t = (s: string) => s;

export const ENDINGS = ['fim-repetir-3', 'fim-partir-3', 'fim-perceber-4'];

export const script: Script = {
  start: 'intro-1',
  nodes: {
    // ============================== CICLO I ==============================
    'intro-1': {
      id: 'intro-1',
      art: 'trilha',
      lines: [
        { who: 'kairoon', text: t('Há uma trilha. Sempre houve.') },
        {
          who: 'kairoon',
          text: t(
            'No fim da trilha há um limiar. E atrás do limiar existe um Eco: uma versão de você que não deveria existir.'
          ),
        },
        {
          who: 'kairoon',
          text: t('Silencie o Eco. Faça isso, e o ciclo enfim se fechará.'),
        },
        { text: t('Você não lembra de ter começado a andar. Mas está andando.') },
        {
          text: t(
            'A poeira da trilha não guarda pegadas. Nem as suas — e você acabou de passar por aqui.'
          ),
        },
      ],
      next: 'limiar-1',
    },
    'limiar-1': {
      id: 'limiar-1',
      art: 'limiar',
      lines: [
        {
          text: t(
            'O limiar é uma porta sem parede. Madeira antiga, trinco gasto por mãos que talvez fossem a sua.'
          ),
        },
        { who: 'kairoon', text: t('Abra.') },
      ],
      choices: [
        { label: t('Abrir o limiar'), goto: 'encontro-1' },
        { label: t('Escutar antes de abrir'), goto: 'limiar-escutar' },
        {
          label: t('Dar as costas e partir'),
          goto: 'limiar-partir',
          effect: (s) => s.flags.add('tentou_partir'),
        },
      ],
    },
    'limiar-escutar': {
      id: 'limiar-escutar',
      lines: [
        {
          text: t(
            'Você encosta o ouvido na madeira. Do outro lado, passos. Eles param quando os seus param.'
          ),
        },
        { text: t('Alguém, do outro lado, também está escutando.') },
        { who: 'kairoon', text: t('Ele já sabe que você chegou. Sempre sabe. Abra.') },
      ],
      choices: [
        { label: t('Abrir o limiar'), goto: 'encontro-1' },
        {
          label: t('Dar as costas e partir'),
          goto: 'limiar-partir',
          effect: (s) => s.flags.add('tentou_partir'),
        },
      ],
    },
    'limiar-partir': {
      id: 'limiar-partir',
      art: 'trilha',
      lines: [
        { text: t('Você dá as costas ao limiar e anda. A trilha aceita seus passos sem protesto.') },
        { text: t('Anda até as pernas doerem. Anda até a dor virar ritmo.') },
        { text: t('E então a trilha faz uma curva suave —') },
        { text: t('— e o limiar está na sua frente outra vez.') },
        { who: 'kairoon', text: t('A trilha volta para cá. Sempre volta. Você sabe disso melhor do que eu.') },
      ],
      next: 'encontro-1',
    },
    'encontro-1': {
      id: 'encontro-1',
      art: 'vulto',
      lines: [
        { text: t('O limiar se abre sem que você toque nele.') },
        {
          text: t(
            'Do outro lado não há sala, nem porão, nem mundo. Há um espaço do tamanho exato de um encontro.'
          ),
        },
        {
          text: t(
            'E há o Eco. Tem a sua altura. O seu passo. O seu jeito de hesitar antes de erguer os olhos. Não tem o seu rosto — ainda.'
          ),
        },
        {
          who: 'eco',
          text: (s: State) =>
            s.flags.has('retorno')
              ? 'Eu disse que você viria. Você sempre vem.'
              : 'Você veio de novo.',
        },
        { text: t('"De novo." Você não lembra de outra vez. O corpo, porém, parece lembrar.') },
        { who: 'kairoon', text: t('Não converse com ele. Silencie-o. É para isso que você está aqui.') },
      ],
      choices: [
        {
          label: t('Avançar para silenciá-lo'),
          goto: 'c1-avancar',
          effect: (s) => {
            s.stance1 = 'raiva';
            s.form2 = 'furia';
            addVoice(s, 'raiva');
          },
        },
        {
          label: t('Recuar para longe dele'),
          goto: 'c1-recuar',
          effect: (s) => {
            s.stance1 = 'medo';
            s.form2 = 'nevoa';
            addVoice(s, 'medo');
          },
        },
        {
          label: t('Perguntar o que ele é'),
          goto: 'c1-perguntar',
          effect: (s) => {
            s.stance1 = 'frieza';
            s.form2 = 'arquivo';
            addVoice(s, 'cetico');
          },
        },
        {
          label: t('Estender a mão'),
          goto: 'c1-mao',
          effect: (s) => {
            s.stance1 = 'ternura';
            s.form2 = 'ferida';
            addVoice(s, 'ternura');
          },
        },
      ],
    },
    'c1-avancar': {
      id: 'c1-avancar',
      lines: [
        { text: t('Você avança antes de decidir avançar. As mãos chegam primeiro que o pensamento.') },
        { text: t('O Eco não se defende. Deixa que você o desfaça, fio por fio, como fumaça entre os dedos.') },
        { who: 'eco', text: t('Até já.') },
        { who: 'kairoon', text: t('Feito. Viu como era simples?') },
        { text: t('Mas a palavra "simples" fica ecoando no espaço vazio. E o vazio começa a girar.') },
      ],
      next: 'vazio-1',
    },
    'c1-recuar': {
      id: 'c1-recuar',
      lines: [
        { text: t('Você recua. Um passo, dois — o limiar às suas costas parece cada vez mais distante.') },
        { who: 'eco', text: t('Tudo bem. Eu espero. Eu sou muito bom em esperar.') },
        { text: t('Você corre. A trilha corre junto, e chega antes de você a todos os lugares.') },
        { who: 'kairoon', text: t('Fugir também é uma resposta. Só não é uma saída.') },
        { text: t('O chão da trilha se abre devagar, sem pressa nenhuma, e o mundo escorre para dentro.') },
      ],
      next: 'vazio-1',
    },
    'c1-perguntar': {
      id: 'c1-perguntar',
      lines: [
        { text: t('Você fica onde está. E pergunta, com a voz mais firme que consegue: "O que você é?"') },
        { who: 'eco', text: t('Boa pergunta. O que você faria comigo, se soubesse?') },
        { text: t('"Isso não é uma resposta", você diz. Ele quase sorri com o rosto que não tem.') },
        { who: 'eco', text: t('Você também não é.') },
        { who: 'kairoon', text: t('Chega. Perguntas alimentam o Eco. O tempo desta volta acabou.') },
        { text: t('Kairoon fecha o ciclo como quem fecha um livro no meio da frase.') },
      ],
      next: 'vazio-1',
    },
    'c1-mao': {
      id: 'c1-mao',
      lines: [
        { text: t('Você estende a mão. Devagar, como quem se aproxima de um animal ferido.') },
        { text: t('O Eco recua — e então para. Olha para a sua mão como se ela fosse um idioma esquecido.') },
        { who: 'eco', text: t('Isso é novo. Isso nunca aconteceu antes.') },
        { text: t('Por um instante, os dedos dele quase tocam os seus. Quase.') },
        { who: 'kairoon', text: t('NÃO.') },
        { text: t('O mundo se fecha de golpe, como uma porta batida por dentro do seu peito.') },
      ],
      next: 'vazio-1',
    },

    // ============================== O VAZIO I ==============================
    'vazio-1': {
      id: 'vazio-1',
      art: 'vazio',
      enter: (s) => {
        s.cycle = 2;
      },
      lines: [
        { text: t('Não há chão aqui, mas você está de pé. Não há escuro, mas não há luz.') },
        { text: t('E você percebe que não está mais sozinho por dentro.') },
        {
          who: 'voz-raiva',
          text: (s: State) =>
            s.stance1 === 'raiva'
              ? 'Eu cheguei quando você avançou. Alguém tinha que ter coragem. De nada, aliás.'
              : '',
        },
        {
          who: 'voz-medo',
          text: (s: State) =>
            s.stance1 === 'medo'
              ? 'Eu vim junto quando você recuou. Não me julgue. Eu só quero que a gente continue inteiro.'
              : '',
        },
        {
          who: 'voz-cetico',
          text: (s: State) =>
            s.stance1 === 'frieza'
              ? 'Interessante, a sua pergunta. Inútil, mas interessante. Eu fico, caso surjam outras.'
              : '',
        },
        {
          who: 'voz-ternura',
          text: (s: State) =>
            s.stance1 === 'ternura'
              ? 'Eu nasci no quase-toque. Ele ia aceitar, sabia? Mais um segundo e ele aceitava.'
              : '',
        },
        {
          who: 'pergunta',
          text: (s: State) =>
            ({
              raiva: 'de onde veio a pressa do golpe?',
              medo: 'o que exatamente você protegeu, recuando?',
              frieza: 'perguntar também pode ser um jeito de não sentir. era?',
              ternura: 'o que doeu em você quando ele recuou?',
            })[s.stance1 ?? 'raiva'],
        },
        { who: 'kairoon', text: t('De novo.') },
      ],
      next: 'c2-trilha',
    },

    // ============================== CICLO II ==============================
    'c2-trilha': {
      id: 'c2-trilha',
      art: 'trilha2',
      lines: [
        { text: t('A trilha outra vez. A mesma — e não.') },
        {
          text: (s: State) =>
            ({
              furia: 'Há uma cor nova rasgando o cinza: um vermelho baixo, de brasa coberta, pulsando na linha do horizonte.',
              nevoa: 'Uma névoa desceu sobre tudo. As árvores são rascunhos de árvores. A trilha some três passos à frente.',
              arquivo: 'O caminho agora é ladeado por pilhas de papel. Páginas e páginas, escritas numa letra que você conhece bem.',
              ferida: 'Há uma luz violeta vazando por baixo do limiar, como se algo do outro lado estivesse... aberto.',
            })[s.form2 ?? 'furia'],
        },
        { who: 'kairoon', text: t('O que você encontrar aí dentro — foi você quem fez. Lembre-se disso. Agora silencie-o.') },
      ],
      next: 'c2-encontro',
    },
    'c2-encontro': {
      id: 'c2-encontro',
      next: 'furia-1',
      lines: [],
      // roteado dinamicamente pelo enter → next é substituído pela engine via next fn abaixo
    },

    // ---- FÚRIA (você avançou) ----
    'furia-1': {
      id: 'furia-1',
      art: 'furia',
      lines: [
        { text: t('O Eco cresceu. Os contornos dele queimam, serrilhados, como papel pegando fogo pelas bordas.') },
        { who: 'eco', text: t('VOCÊ ME DESFEZ. Eu era fumaça e você me desfez COM AS MÃOS.') },
        { text: t('Ele avança. Onde pisa, a poeira vira faísca.') },
        { who: 'eco', text: t('Vamos ver como VOCÊ gosta.') },
      ],
      choices: [
        {
          label: t('Revidar com tudo'),
          goto: 'furia-revidar',
          effect: (s) => addVoice(s, 'culpa'),
        },
        {
          label: t('Baixar as mãos e não lutar'),
          goto: 'furia-baixar',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'ternura');
          },
        },
        {
          label: t('Correr para fora do alcance'),
          goto: 'furia-fugir',
          effect: (s) => addVoice(s, 'medo'),
        },
      ],
    },
    'furia-revidar': {
      id: 'furia-revidar',
      lines: [
        { text: t('Vocês colidem. É como lutar contra um espelho que sabe cada golpe antes de você dá-lo — porque é você quem o dá.') },
        { text: t('Quando a poeira baixa, ele está desfeito outra vez. E as suas mãos estão tremendo.') },
        { who: 'voz-culpa', text: t('...a gente precisava mesmo fazer isso duas vezes?') },
        { who: 'kairoon', text: t('Precisava. Precisará de novo, se ele voltar. É assim que sempre foi.') },
      ],
      next: 'vazio-2',
    },
    'furia-baixar': {
      id: 'furia-baixar',
      lines: [
        { text: t('Você abre as mãos. Baixa os braços. Fica.') },
        { text: t('O golpe dele para a um palmo do seu rosto — e treme ali, suspenso, sem saber o que fazer com a própria força.') },
        { who: 'eco', text: t('Levanta a guarda. LEVANTA. Sem ela eu não sei... eu não sei o que eu sou.') },
        { text: t('O fogo das bordas dele vacila. Por baixo, você vê o contorno antigo: o Vulto. Só um vulto.') },
        { who: 'voz-ternura', text: t('Olha. A raiva dele é do tamanho exato do golpe que a criou.') },
      ],
      next: 'vazio-2',
    },
    'furia-fugir': {
      id: 'furia-fugir',
      lines: [
        { text: t('Você corre. O calor dele nos seus calcanhares, a trilha se dobrando embaixo dos seus pés.') },
        { who: 'voz-medo', text: t('A porta! Ali! — não, ali! — ela fica MUDANDO—') },
        { text: t('Você atravessa o limiar de volta, e ele não atravessa. Fica do outro lado, ardendo sozinho no escuro.') },
        { who: 'eco', text: t('(de longe, quase baixo) Você sempre corre. É a única coisa que nunca muda.') },
      ],
      next: 'vazio-2',
    },

    // ---- NÉVOA (você recuou) ----
    'nevoa-1': {
      id: 'nevoa-1',
      art: 'nevoa',
      lines: [
        { text: t('O espaço atrás do limiar está tomado de névoa. O Eco está em toda parte e em lugar nenhum.') },
        { who: 'eco', text: t('Você recuou. Então eu virei distância.') },
        { text: t('A voz vem de trás, da frente, de dentro. Quando você se vira, há só um borrão se desfazendo.') },
        { who: 'eco', text: t('Me acha. Se conseguir.') },
      ],
      choices: [
        {
          label: t('Persegui-lo e agarrá-lo'),
          goto: 'nevoa-agarrar',
          effect: (s) => addVoice(s, 'raiva'),
        },
        {
          label: t('Parar. Respirar. Esperar.'),
          goto: 'nevoa-parar',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'cetico');
          },
        },
        {
          label: t('Chamar por ele, com a verdade'),
          goto: 'nevoa-chamar',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'ternura');
          },
        },
      ],
    },
    'nevoa-agarrar': {
      id: 'nevoa-agarrar',
      lines: [
        { text: t('Você se joga na névoa de mãos abertas. Agarra. Agarra de novo. Agarra o nada com força suficiente pra machucar os dedos.') },
        { who: 'voz-raiva', text: t('APARECE! Isso é COVARDIA! Aparece e briga que nem gente!') },
        { who: 'eco', text: t('Engraçado. Era exatamente isso que eu ia te dizer.') },
        { text: t('A névoa se fecha, educada e impenetrável, e o ciclo escorre entre os seus dedos junto com ela.') },
      ],
      next: 'vazio-2',
    },
    'nevoa-parar': {
      id: 'nevoa-parar',
      lines: [
        { text: t('Você para. Sente o próprio fôlego: entra, sai. Entra, sai. Não persegue nada.') },
        { who: 'voz-cetico', text: t('Hipótese: névoa não se agarra. Névoa se espera. Vamos testar.') },
        { text: t('Aos poucos — muito aos poucos — a névoa começa a se condensar. Um contorno. Um passo. Ele.') },
        { who: 'eco', text: t('...ninguém nunca tinha ficado.') },
        { text: t('Ele está a um braço de distância quando o ciclo, cumprindo o próprio costume, se fecha.') },
      ],
      next: 'vazio-2',
    },
    'nevoa-chamar': {
      id: 'nevoa-chamar',
      lines: [
        { text: t('Você fala para a névoa, sem saber para onde olhar: "Eu recuei porque tive medo. Não de você. Do que você lembra."') },
        { text: t('Silêncio. Depois, bem perto do seu ouvido, quase gentil:') },
        { who: 'eco', text: t('Eu sei. Eu estava lá.') },
        { who: 'voz-ternura', text: t('Ele sempre esteve. Em todas. É disso que ele é feito.') },
      ],
      next: 'vazio-2',
    },

    // ---- O ARQUIVO (você perguntou) ----
    'arquivo-1': {
      id: 'arquivo-1',
      art: 'arquivo',
      lines: [
        { text: t('O Eco está sentado atrás de uma mesa que não existia. Sobre ela, pilhas de papel amarelado até onde a vista alcança.') },
        { who: 'eco', text: t('Você quis saber o que eu sou. Ótimo. Eu virei resposta.') },
        { text: t('Ele ergue uma página e lê, com a sua voz:') },
        { who: 'eco', text: t('"Ciclo um: hesitou diante do limiar. Perguntou para não agir. Classificou para não tocar." Devo continuar? Há... volumes.') },
      ],
      choices: [
        {
          label: t('"Isso não fui eu. Está errado."'),
          goto: 'arquivo-negar',
          effect: (s) => addVoice(s, 'raiva'),
        },
        {
          label: t('Corrigir o registro, linha por linha'),
          goto: 'arquivo-corrigir',
          effect: (s) => addVoice(s, 'cetico'),
        },
        {
          label: t('"O que o registro não diz?"'),
          goto: 'arquivo-falta',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'ternura');
          },
        },
      ],
    },
    'arquivo-negar': {
      id: 'arquivo-negar',
      lines: [
        { text: t('"Está errado", você diz. "Isso não fui eu."') },
        { who: 'eco', text: t('Hm. Curioso. É a frase mais frequente do arquivo inteiro.') },
        { who: 'voz-raiva', text: t('Rasga essa papelada. Rasga TUDO.') },
        { text: t('Você avança sobre a mesa — e cada página rasgada se reescreve no ar, paciente, com uma linha a mais no fim.') },
      ],
      next: 'vazio-2',
    },
    'arquivo-corrigir': {
      id: 'arquivo-corrigir',
      lines: [
        { text: t('"Deixa eu ver isso." Você puxa a página. Lê. Franze a testa. "Aqui. Não foi \'para não agir\'. Foi para entender."') },
        { who: 'eco', text: t('Anotado. "Corrigiu o registro: prefere as próprias palavras às minhas." Algo mais?') },
        { who: 'voz-cetico', text: t('Ele está catalogando a nossa catalogação. Isso vai longe. Eu, pessoalmente, admiro o método.') },
        { text: t('Vocês passam o ciclo inteiro assim: editando o passado, vírgula por vírgula, sem tocá-lo nunca.') },
      ],
      next: 'vazio-2',
    },
    'arquivo-falta': {
      id: 'arquivo-falta',
      lines: [
        { text: t('"O que o registro não diz?", você pergunta.') },
        { text: t('A leitura para. Pela primeira vez, o Eco ergue os olhos das páginas.') },
        { who: 'eco', text: t('...ele não diz como doeu. Nenhum arquivo diz. É por isso que eu continuo escrevendo.') },
        { who: 'voz-ternura', text: t('Aí está. Embaixo de toda essa papelada sempre houve uma coisa só, e não era informação.') },
      ],
      next: 'vazio-2',
    },

    // ---- A FERIDA (você estendeu a mão) ----
    'ferida-1': {
      id: 'ferida-1',
      art: 'ferida',
      lines: [
        { text: t('O Eco está sentado no centro do espaço, os braços em volta dos joelhos. Do peito dele vaza uma luz violeta, como uma rachadura acesa.') },
        { who: 'eco', text: t('Você quase me tocou. Ninguém nunca quase me tocou.') },
        { who: 'eco', text: t('Aí o mundo fechou. E o quase... o quase abriu isto aqui.') },
        { text: t('Ele afasta os braços. A rachadura de luz atravessa-o de lado a lado.') },
      ],
      choices: [
        {
          label: t('Desviar os olhos da ferida'),
          goto: 'ferida-desviar',
          effect: (s) => addVoice(s, 'medo'),
        },
        {
          label: t('Tocar a rachadura de luz'),
          goto: 'ferida-tocar',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'culpa');
          },
        },
        {
          label: t('"Desculpa eu ter demorado tanto."'),
          goto: 'ferida-desculpa',
          effect: (s) => {
            s.flags.add('percebeu');
            addVoice(s, 'ternura');
          },
        },
      ],
    },
    'ferida-desviar': {
      id: 'ferida-desviar',
      lines: [
        { text: t('Você olha para o chão. Para o limiar. Para as próprias mãos. Para qualquer lugar que não seja a luz.') },
        { who: 'voz-medo', text: t('Não olha. Se a gente olhar, vira nossa. Ferida vista é ferida assumida.') },
        { who: 'eco', text: t('Tudo bem. Eu também passei anos sem olhar.') },
        { text: t('A gentileza da frase dói mais do que qualquer acusação doeria.') },
      ],
      next: 'vazio-2',
    },
    'ferida-tocar': {
      id: 'ferida-tocar',
      lines: [
        { text: t('Você se ajoelha diante dele e encosta os dedos na borda da rachadura.') },
        { text: t('Não queima. É morna. Pulsa devagar, no ritmo exato do seu próprio coração.') },
        { who: 'voz-culpa', text: t('...fui eu que fiz isso? Em algum ciclo que eu não lembro — fui eu?') },
        { who: 'eco', text: t('Fomos. É diferente de "foi você". Um dia eu te explico a diferença.') },
      ],
      next: 'vazio-2',
    },
    'ferida-desculpa': {
      id: 'ferida-desculpa',
      lines: [
        { text: t('"Desculpa eu ter demorado tanto", você diz. Só isso. Sem defesa nenhuma anexada.') },
        { text: t('O Eco fica muito quieto. A luz do peito dele oscila, como chama ao vento.') },
        { who: 'eco', text: t('Demorou mesmo. ...obrigado por chegar.') },
        { who: 'voz-ternura', text: t('Guarda esse momento. É com ele que se costura tudo o resto.') },
      ],
      next: 'vazio-2',
    },

    // ============================== O VAZIO II ==============================
    'vazio-2': {
      id: 'vazio-2',
      art: 'vazio',
      enter: (s) => {
        s.cycle = 3;
      },
      lines: [
        { text: t('O vazio outra vez. Mas agora ele está... povoado.') },
        {
          who: 'voz-raiva',
          text: (s: State) =>
            s.voices.includes('raiva') ? 'Da próxima vez a gente resolve isso do meu jeito.' : '',
        },
        {
          who: 'voz-medo',
          text: (s: State) =>
            s.voices.includes('medo') ? 'Ou do meu. O meu jeito tem menos pontas.' : '',
        },
        {
          who: 'voz-cetico',
          text: (s: State) =>
            s.voices.includes('cetico')
              ? 'Os dados sugerem que nenhum dos jeitos de vocês jamais fechou ciclo algum. Só registro.'
              : '',
        },
        {
          who: 'voz-ternura',
          text: (s: State) =>
            s.voices.includes('ternura') ? 'Vocês repararam que ele fica menos assustador cada vez que a gente olha de verdade?' : '',
        },
        {
          who: 'voz-culpa',
          text: (s: State) =>
            s.voices.includes('culpa') ? '...e mais parecido com a gente. Isso ninguém vai comentar?' : '',
        },
        { who: 'pergunta', text: t('quantas dessas vozes você reconhece de outros lugares — de fora daqui?') },
        { who: 'kairoon', text: t('Última volta. Eu prometo. Sempre prometo.') },
      ],
      next: 'c3-trilha',
    },

    // ============================== CICLO III ==============================
    'c3-trilha': {
      id: 'c3-trilha',
      art: 'trilha3',
      lines: [
        { text: t('A trilha, pela última vez. O limiar já está aberto à sua espera — escancarado como uma pergunta.') },
        {
          who: 'kairoon',
          text: t(
            'Escute. Antes de você, houve outros. Todos chegaram até aqui. Todos silenciaram o Eco. É por isso que o ciclo existe: porque funciona.'
          ),
        },
        { who: 'kairoon', text: t('Silencie-o uma última vez, e eu fecho a espiral. Você descansa. Ele descansa. Todos descansam.') },
      ],
      next: 'c3-encontro',
    },
    'c3-encontro': {
      id: 'c3-encontro',
      art: 'final',
      lines: [
        { text: t('O Eco espera no centro do espaço. Ele mudou de novo — mas desta vez você reconhece cada camada.') },
        {
          text: (s: State) =>
            ({
              furia: 'A brasa das bordas ainda arde, mais baixa agora, como um fim de fogueira que aprendeu alguma coisa.',
              nevoa: 'A névoa ainda o envolve, mas fina, como um véu que ele mesmo já não faz questão de segurar.',
              arquivo: 'Ele ainda segura uma única página. Uma só. O resto do arquivo virou cinza fina no chão.',
              ferida: 'A rachadura de luz continua no peito dele. Mas agora parece menos ferida — e mais janela.',
            })[s.form2 ?? 'furia'],
        },
        { who: 'eco', text: t('Então. Chegamos de novo aqui, você e eu.') },
        { who: 'eco', text: t('O que vai ser desta vez?') },
        { who: 'kairoon', text: t('Você sabe o que fazer. Sempre soube. Faça.') },
      ],
      choices: [
        {
          label: t('Silenciar o Eco, como Kairoon pede'),
          goto: 'fim-repetir-1',
          effect: (s) => {
            s.ending = 'repetir';
          },
        },
        {
          label: t('Dar as costas e partir de vez'),
          goto: 'fim-partir-1',
          if: (s) => s.flags.has('tentou_partir') || s.voices.includes('medo'),
          effect: (s) => {
            s.ending = 'partir';
          },
        },
        {
          label: t('Nomeá-lo — dizer o que ele é'),
          goto: 'fim-perceber-1',
          if: (s) => s.flags.has('percebeu') || s.voices.length >= 2,
          effect: (s) => {
            s.ending = 'perceber';
          },
        },
      ],
    },

    // ---- FINAL: REPETIR ----
    'fim-repetir-1': {
      id: 'fim-repetir-1',
      lines: [
        { text: t('Você faz o que sempre fez. As mãos sabem o caminho; elas já o fizeram mil vezes, em mil voltas que você não lembra.') },
        { text: t('O Eco não resiste. Ele nunca resiste. Isso devia dizer alguma coisa, e você escolhe não ouvir.') },
        { who: 'eco', text: t('Até já.') },
        { who: 'kairoon', text: t('Feito. Descanse agora.') },
      ],
      next: 'fim-repetir-2',
    },
    'fim-repetir-2': {
      id: 'fim-repetir-2',
      art: 'limiar',
      lines: [
        { text: t('Você descansa. Por um tempo sem nome, você descansa.') },
        { text: t('E então: uma trilha. A poeira que não guarda pegadas. Um limiar no fim do caminho.') },
        { who: 'kairoon', text: t('Há uma trilha. Sempre houve.') },
        { text: t('(Não existe fracasso aqui. Só voltas. Esta foi mais uma — e a saída continua onde sempre esteve: no meio.)') },
      ],
      next: 'fim-repetir-3',
    },
    'fim-repetir-3': {
      id: 'fim-repetir-3',
      lines: [
        { who: 'pergunta', text: t('o que precisaria acontecer para a próxima volta ser diferente?') },
      ],
    },

    // ---- FINAL: PARTIR ----
    'fim-partir-1': {
      id: 'fim-partir-1',
      lines: [
        { text: t('Você olha para o Eco. Para Kairoon, que não tem rosto e ainda assim franze o que teria de testa.') },
        { text: t('"Hoje não", você diz. E dá as costas.') },
        { who: 'kairoon', text: t('A trilha volta para cá. Você sabe. A trilha SEMPRE volta para cá—') },
        { text: t('"Eu sei", você responde, sem parar de andar. "Mas dessa vez eu vou fazer a volta inteira no meu passo."') },
      ],
      next: 'fim-partir-2',
    },
    'fim-partir-2': {
      id: 'fim-partir-2',
      art: 'trilha',
      lines: [
        { text: t('Você anda. A trilha faz a curva de sempre, e o limiar reaparece à frente, paciente como só as portas sabem ser.') },
        { text: t('Você não entra. Senta-se no degrau, encostado na madeira antiga.') },
        { text: t('Do outro lado, depois de um tempo, alguém se senta também. Vocês ficam assim: um limiar de distância, costas com costas.') },
        { who: 'eco', text: t('(através da porta) Sem pressa. Eu sou muito bom em esperar.') },
        { text: t('E, pela primeira vez, a frase não soa como ameaça.') },
      ],
      next: 'fim-partir-3',
    },
    'fim-partir-3': {
      id: 'fim-partir-3',
      lines: [
        { who: 'pergunta', text: t('por hoje, basta. — e amanhã, o que você leva até a porta?') },
      ],
    },

    // ---- FINAL: PERCEBER ----
    'fim-perceber-1': {
      id: 'fim-perceber-1',
      lines: [
        { text: t('Você não avança nem recua. Fica exatamente à distância de uma verdade.') },
        { text: t('"Eu sei o que você é", você diz. E as vozes, todas elas, fazem silêncio pela primeira vez.') },
        { who: 'eco', text: t('Diz.') },
        { text: t('"Você não é meu inimigo. Você é o que eu repito. Você é cada volta que eu dei em mim mesmo sem perceber que era volta."') },
        { text: t('"Você não precisa ser silenciado. Precisa ser ouvido até o fim de uma frase — uma só — sem que eu fuja, brigue ou arquive."') },
      ],
      next: 'fim-perceber-2',
    },
    'fim-perceber-2': {
      id: 'fim-perceber-2',
      art: 'integrado',
      lines: [
        { text: t('O Eco fica imóvel por um longo instante.') },
        { text: t('Então ele dá um passo — e pela primeira vez em todos os ciclos, o rosto dele termina de se formar.') },
        { text: t('É o seu.') },
        { who: 'eco', text: t('Demorou.') },
        { text: t('Ele não some. Não é assim que funciona. Ele apenas... senta-se ao seu lado, na mesma direção, olhando o mesmo horizonte.') },
      ],
      next: 'fim-perceber-3',
    },
    'fim-perceber-3': {
      id: 'fim-perceber-3',
      lines: [
        { who: 'kairoon', text: t('...') },
        { who: 'kairoon', text: t('Perceber também fecha ciclos. Eu esqueço disso. Faz muitas eras que eu esqueço disso.') },
        { text: t('A espiral de Kairoon gira mais devagar. Não para — espirais não param. Mas muda de passo. Como você.') },
        {
          who: 'voz-ternura',
          text: (s: State) =>
            s.voices.includes('ternura') ? 'A gente continua aqui, sabe. Todas nós. Mas dá pra conversar, agora.' : '',
        },
        {
          who: 'voz-cetico',
          text: (s: State) =>
            s.voices.includes('cetico') ? 'Registro final: nenhum Eco foi silenciado na produção deste ciclo. E ele se fechou mesmo assim.' : '',
        },
      ],
      next: 'fim-perceber-4',
    },
    'fim-perceber-4': {
      id: 'fim-perceber-4',
      lines: [
        { who: 'pergunta', text: t('que frase sua está esperando ser ouvida até o fim?') },
      ],
    },
  },
};

// O nó c2-encontro roteia para a forma criada no ciclo I.
script.nodes['c2-encontro'].next = (s: State) =>
  ({ furia: 'furia-1', nevoa: 'nevoa-1', arquivo: 'arquivo-1', ferida: 'ferida-1' })[
    s.form2 ?? 'furia'
  ];
