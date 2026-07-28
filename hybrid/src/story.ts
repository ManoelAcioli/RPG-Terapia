import { State, SpeakerId, Form, addVoice } from './state';

// O roteiro da VN "O Eco", reencenado num mundo lateral:
// falas disparam por posição; escolhas são lugares onde o corpo fica.

export interface Say {
  who?: SpeakerId;
  text: string | ((s: State) => string);
}

export interface Beat extends Say {
  x: number; // dispara quando o jogador cruza este x
}

export interface Marker {
  id: string;
  label: string;
  dx: number; // relativo ao ecoX da fase
  gate?: (s: State) => boolean;
  effect?: (s: State) => void;
  after: Say[]; // falas encenadas após a escolha
  ending?: 'perceber' | 'repetir' | 'partir';
}

export interface Phase {
  id: string;
  scene: string | ((s: State) => string);
  worldW: number;
  playerStart: number;
  ecoX?: number;
  doorX?: number;
  next: string | ((s: State) => string);
  beats: Beat[];
  encounter?: { zoneX: number; markers: Marker[] };
  exitRightX?: number; // andar além deste x encerra a fase
  wrapLeft?: { minX: number; to: number; flag?: string; lines: Say[] };
  onEnter?: (s: State) => void;
}

const vulto = (s: State): string =>
  s.flags.has('retorno') ? 'Eu disse que você viria. Você sempre vem.' : 'Você veio de novo.';

export const PHASES: Record<string, Phase> = {
  // ============================ CICLO I ============================
  c1: {
    id: 'c1',
    scene: 'trilha',
    worldW: 3600,
    playerStart: 120,
    doorX: 2450,
    ecoX: 3150,
    next: 'vazio1',
    onEnter: (s) => {
      s.cycle = 1;
    },
    beats: [
      { x: 220, who: 'kairoon', text: 'Há uma trilha. Sempre houve.' },
      {
        x: 520,
        who: 'kairoon',
        text: 'No fim da trilha há um limiar. E atrás do limiar existe um Eco: uma versão de você que não deveria existir.',
      },
      { x: 860, who: 'kairoon', text: 'Silencie o Eco. Faça isso, e o ciclo enfim se fechará.' },
      { x: 1250, text: 'Você não lembra de ter começado a andar. Mas está andando.' },
      {
        x: 1700,
        text: 'A poeira da trilha não guarda pegadas. Nem as suas — e você acabou de passar por aqui.',
      },
      {
        x: 2280,
        text: 'O limiar é uma porta sem parede. Madeira antiga, trinco gasto por mãos que talvez fossem a sua.',
      },
      { x: 2400, who: 'kairoon', text: 'Abra.' },
      {
        x: 2560,
        text: 'O limiar se abre sem que você toque nele. Do outro lado, um espaço do tamanho exato de um encontro.',
      },
      {
        x: 2800,
        text: 'E há o Eco. Tem a sua altura. O seu passo. Não tem o seu rosto — ainda.',
      },
      { x: 2950, who: 'eco', text: vulto },
      { x: 3020, who: 'kairoon', text: 'Não converse com ele. Silencie-o. O seu corpo sabe como.' },
    ],
    wrapLeft: {
      minX: 40,
      to: 1500,
      flag: 'tentou_partir',
      lines: [
        { text: 'Você dá as costas e anda. Anda até a dor virar ritmo. E então a trilha faz uma curva suave—' },
        { who: 'kairoon', text: 'A trilha volta para cá. Sempre volta. Você sabe disso melhor do que eu.' },
      ],
    },
    encounter: {
      zoneX: 2620,
      markers: [
        {
          id: 'avancar',
          label: 'avançar',
          dx: 0,
          effect: (s) => {
            s.stance1 = 'raiva';
            s.form2 = 'furia';
            addVoice(s, 'raiva');
          },
          after: [
            { text: 'Você avança antes de decidir avançar. As mãos chegam primeiro que o pensamento.' },
            { text: 'O Eco não se defende. Deixa que você o desfaça, fio por fio, como fumaça entre os dedos.' },
            { who: 'eco', text: 'Até já.' },
            { who: 'kairoon', text: 'Feito. Viu como era simples?' },
            { text: 'Mas a palavra "simples" fica ecoando no espaço vazio. E o vazio começa a girar.' },
          ],
        },
        {
          id: 'mao',
          label: 'estender a mão',
          dx: -130,
          effect: (s) => {
            s.stance1 = 'ternura';
            s.form2 = 'ferida';
            addVoice(s, 'ternura');
          },
          after: [
            { text: 'Você para a um braço de distância e estende a mão, como quem se aproxima de um animal ferido.' },
            { who: 'eco', text: 'Isso é novo. Isso nunca aconteceu antes.' },
            { text: 'Por um instante, os dedos dele quase tocam os seus. Quase.' },
            { who: 'kairoon', text: 'NÃO.' },
            { text: 'O mundo se fecha de golpe, como uma porta batida por dentro do seu peito.' },
          ],
        },
        {
          id: 'perguntar',
          label: 'ficar e perguntar',
          dx: -330,
          effect: (s) => {
            s.stance1 = 'frieza';
            s.form2 = 'arquivo';
            addVoice(s, 'cetico');
          },
          after: [
            { text: 'Você fica onde está — nem perto, nem longe — e pergunta: "O que você é?"' },
            { who: 'eco', text: 'Boa pergunta. O que você faria comigo, se soubesse?' },
            { who: 'kairoon', text: 'Chega. Perguntas alimentam o Eco. O tempo desta volta acabou.' },
            { text: 'Kairoon fecha o ciclo como quem fecha um livro no meio da frase.' },
          ],
        },
        {
          id: 'recuar',
          label: 'recuar',
          dx: -620,
          effect: (s) => {
            s.stance1 = 'medo';
            s.form2 = 'nevoa';
            addVoice(s, 'medo');
          },
          after: [
            { text: 'Você recua. Um passo, dois — o encontro esfria à sua frente como brasa na chuva.' },
            { who: 'eco', text: 'Tudo bem. Eu espero. Eu sou muito bom em esperar.' },
            { who: 'kairoon', text: 'Fugir também é uma resposta. Só não é uma saída.' },
            { text: 'O chão da trilha se abre devagar, sem pressa nenhuma, e o mundo escorre para dentro.' },
          ],
        },
      ],
    },
  },

  // ============================ VAZIO I ============================
  vazio1: {
    id: 'vazio1',
    scene: 'vazio',
    worldW: 1900,
    playerStart: 120,
    next: 'c2',
    onEnter: (s) => {
      s.cycle = 2;
    },
    beats: [
      { x: 240, text: 'Não há chão aqui, mas você está de pé. Não há escuro, mas não há luz.' },
      { x: 480, text: 'E você percebe que não está mais sozinho por dentro.' },
      {
        x: 720,
        who: 'voz-raiva',
        text: (s) =>
          s.stance1 === 'raiva'
            ? 'Eu cheguei quando você avançou. Alguém tinha que ter coragem. De nada, aliás.'
            : '',
      },
      {
        x: 720,
        who: 'voz-medo',
        text: (s) =>
          s.stance1 === 'medo'
            ? 'Eu vim junto quando você recuou. Não me julgue. Eu só quero que a gente continue inteiro.'
            : '',
      },
      {
        x: 720,
        who: 'voz-cetico',
        text: (s) =>
          s.stance1 === 'frieza'
            ? 'Interessante, a sua pergunta. Inútil, mas interessante. Eu fico, caso surjam outras.'
            : '',
      },
      {
        x: 720,
        who: 'voz-ternura',
        text: (s) =>
          s.stance1 === 'ternura'
            ? 'Eu nasci no quase-toque. Ele ia aceitar, sabia? Mais um segundo e ele aceitava.'
            : '',
      },
      {
        x: 1100,
        who: 'pergunta',
        text: (s) =>
          ({
            raiva: 'de onde veio a pressa do golpe?',
            medo: 'o que exatamente você protegeu, recuando?',
            frieza: 'perguntar também pode ser um jeito de não sentir. era?',
            ternura: 'o que doeu em você quando ele recuou?',
          })[s.stance1 ?? 'raiva'],
      },
      { x: 1550, who: 'kairoon', text: 'De novo.' },
    ],
    exitRightX: 1820,
  },

  // ============================ CICLO II ============================
  c2: {
    id: 'c2',
    scene: (s) => s.form2 ?? 'furia',
    worldW: 2900,
    playerStart: 120,
    doorX: 1750,
    ecoX: 2350,
    next: 'vazio2',
    beats: [
      { x: 240, text: 'A trilha outra vez. A mesma — e não.' },
      {
        x: 560,
        text: (s) =>
          ({
            furia:
              'Há uma cor nova rasgando o cinza: um vermelho baixo, de brasa coberta, pulsando na linha do horizonte.',
            nevoa:
              'Uma névoa desceu sobre tudo. As árvores são rascunhos de árvores. A trilha some três passos à frente.',
            arquivo:
              'O caminho agora é ladeado por pilhas de papel. Páginas e páginas, escritas numa letra que você conhece bem.',
            ferida:
              'Há uma luz violeta vazando por baixo do limiar, como se algo do outro lado estivesse... aberto.',
          })[s.form2 ?? 'furia'],
      },
      {
        x: 1050,
        who: 'kairoon',
        text: 'O que você encontrar aí dentro — foi você quem fez. Lembre-se disso. Agora silencie-o.',
      },
      {
        x: 1950,
        text: (s) =>
          ({
            furia: 'O Eco cresceu. Os contornos dele queimam, serrilhados, como papel pegando fogo pelas bordas.',
            nevoa: 'O espaço atrás do limiar está tomado de névoa. O Eco está em toda parte e em lugar nenhum.',
            arquivo: 'O Eco está sentado atrás de uma mesa que não existia. Sobre ela, pilhas de papel amarelado.',
            ferida: 'O Eco está sentado no centro do espaço. Do peito dele vaza uma luz violeta, como uma rachadura acesa.',
          })[s.form2 ?? 'furia'],
      },
      {
        x: 2130,
        who: 'eco',
        text: (s) =>
          ({
            furia: 'VOCÊ ME DESFEZ. Eu era fumaça e você me desfez COM AS MÃOS. Vamos ver como VOCÊ gosta.',
            nevoa: 'Você recuou. Então eu virei distância. Me acha. Se conseguir.',
            arquivo: '"Ciclo um: perguntou para não agir. Classificou para não tocar." Devo continuar? Há... volumes.',
            ferida: 'Você quase me tocou. Aí o mundo fechou. E o quase... o quase abriu isto aqui.',
          })[s.form2 ?? 'furia'],
      },
    ],
    encounter: {
      zoneX: 1950,
      markers: [
        // ---- opção "no Eco" (escalada) ----
        {
          id: 'escalada',
          label: '',
          dx: 0,
          after: [],
        },
        // ---- opção adjacente (percepção) ----
        {
          id: 'percepcao',
          label: '',
          dx: -140,
          after: [],
        },
        // ---- opção distante (recuo/observação) ----
        {
          id: 'distancia',
          label: '',
          dx: -420,
          after: [],
        },
      ],
    },
  },

  // ============================ VAZIO II ============================
  vazio2: {
    id: 'vazio2',
    scene: 'vazio',
    worldW: 1900,
    playerStart: 120,
    next: 'c3',
    onEnter: (s) => {
      s.cycle = 3;
    },
    beats: [
      { x: 240, text: 'O vazio outra vez. Mas agora ele está... povoado.' },
      {
        x: 500,
        who: 'voz-raiva',
        text: (s) => (s.voices.includes('raiva') ? 'Da próxima vez a gente resolve isso do meu jeito.' : ''),
      },
      {
        x: 640,
        who: 'voz-medo',
        text: (s) => (s.voices.includes('medo') ? 'Ou do meu. O meu jeito tem menos pontas.' : ''),
      },
      {
        x: 780,
        who: 'voz-cetico',
        text: (s) =>
          s.voices.includes('cetico')
            ? 'Os dados sugerem que nenhum dos jeitos de vocês jamais fechou ciclo algum. Só registro.'
            : '',
      },
      {
        x: 920,
        who: 'voz-ternura',
        text: (s) =>
          s.voices.includes('ternura')
            ? 'Vocês repararam que ele fica menos assustador cada vez que a gente olha de verdade?'
            : '',
      },
      {
        x: 1060,
        who: 'voz-culpa',
        text: (s) =>
          s.voices.includes('culpa') ? '...e mais parecido com a gente. Isso ninguém vai comentar?' : '',
      },
      { x: 1300, who: 'pergunta', text: 'quantas dessas vozes você reconhece de outros lugares — de fora daqui?' },
      { x: 1600, who: 'kairoon', text: 'Última volta. Eu prometo. Sempre prometo.' },
    ],
    exitRightX: 1820,
  },

  // ============================ CICLO III ============================
  c3: {
    id: 'c3',
    scene: 'trilha3',
    worldW: 3000,
    playerStart: 120,
    doorX: 1850,
    ecoX: 2450,
    next: 'c3', // nunca usado; finais são tratados pelos marcadores
    beats: [
      {
        x: 240,
        text: 'A trilha, pela última vez. O limiar já está aberto à sua espera — escancarado como uma pergunta.',
      },
      {
        x: 620,
        who: 'kairoon',
        text: 'Escute. Antes de você, houve outros. Todos silenciaram o Eco. É por isso que o ciclo existe: porque funciona.',
      },
      {
        x: 1100,
        who: 'kairoon',
        text: 'Silencie-o uma última vez, e eu fecho a espiral. Você descansa. Ele descansa. Todos descansam.',
      },
      {
        x: 2000,
        text: 'O Eco espera no centro do espaço. Ele mudou de novo — mas desta vez você reconhece cada camada.',
      },
      { x: 2200, who: 'eco', text: 'Então. Chegamos de novo aqui, você e eu. O que vai ser desta vez?' },
      { x: 2300, who: 'kairoon', text: 'Você sabe o que fazer. Sempre soube. Faça.' },
    ],
    encounter: {
      zoneX: 2050,
      markers: [
        {
          id: 'silenciar',
          label: 'silenciar',
          dx: 0,
          ending: 'repetir',
          effect: (s) => {
            s.ending = 'repetir';
          },
          after: [
            { text: 'Você faz o que sempre fez. As mãos sabem o caminho; elas já o fizeram mil vezes, em mil voltas que você não lembra.' },
            { who: 'eco', text: 'Até já.' },
            { who: 'kairoon', text: 'Feito. Descanse agora.' },
            { text: 'Você descansa. Por um tempo sem nome, você descansa.' },
            { who: 'kairoon', text: 'Há uma trilha. Sempre houve.' },
            { text: '(Não existe fracasso aqui. Só voltas. Esta foi mais uma — e a saída continua onde sempre esteve: no meio.)' },
          ],
        },
        {
          id: 'nomear',
          label: 'nomeá-lo',
          dx: -150,
          gate: (s) => s.flags.has('percebeu') || s.voices.length >= 2,
          ending: 'perceber',
          effect: (s) => {
            s.ending = 'perceber';
          },
          after: [
            { text: 'Você não avança nem recua. Fica exatamente à distância de uma verdade.' },
            { text: '"Eu sei o que você é. Você não é meu inimigo. Você é o que eu repito."' },
            { text: '"Você não precisa ser silenciado. Precisa ser ouvido até o fim de uma frase — uma só — sem que eu fuja, brigue ou arquive."' },
            { who: 'eco', text: 'Demorou.' },
            { text: 'Ele dá um passo — e pela primeira vez em todos os ciclos, o rosto dele termina de se formar. É o seu.' },
            { who: 'kairoon', text: '...perceber também fecha ciclos. Eu esqueço disso. Faz muitas eras que eu esqueço disso.' },
          ],
        },
        {
          id: 'partir',
          label: 'partir',
          dx: -650,
          gate: (s) => s.flags.has('tentou_partir') || s.voices.includes('medo'),
          ending: 'partir',
          effect: (s) => {
            s.ending = 'partir';
          },
          after: [
            { text: '"Hoje não", você diz. E dá as costas.' },
            { who: 'kairoon', text: 'A trilha volta para cá. Você sabe. A trilha SEMPRE volta para cá—' },
            { text: '"Eu sei", você responde, sem parar de andar. "Mas dessa vez eu vou fazer a volta inteira no meu passo."' },
            { text: 'Você não entra. Senta-se no degrau do limiar, encostado na madeira antiga.' },
            { who: 'eco', text: '(através da porta) Sem pressa. Eu sou muito bom em esperar.' },
            { text: 'E, pela primeira vez, a frase não soa como ameaça.' },
          ],
        },
      ],
    },
  },
};

// ---- opções do Ciclo II por forma (rótulos, efeitos e falas) ----
export interface C2Option {
  label: string;
  effect: (s: State) => void;
  after: Say[];
}

export const C2_OPTIONS: Record<Form, { escalada: C2Option; percepcao: C2Option; distancia: C2Option }> = {
  furia: {
    escalada: {
      label: 'revidar',
      effect: (s) => addVoice(s, 'culpa'),
      after: [
        { text: 'Vocês colidem. É como lutar contra um espelho que sabe cada golpe antes de você dá-lo — porque é você quem o dá.' },
        { text: 'Quando a poeira baixa, ele está desfeito outra vez. E as suas mãos estão tremendo.' },
        { who: 'voz-culpa', text: '...a gente precisava mesmo fazer isso duas vezes?' },
        { who: 'kairoon', text: 'Precisava. Precisará de novo, se ele voltar. É assim que sempre foi.' },
      ],
    },
    percepcao: {
      label: 'baixar as mãos',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'ternura');
      },
      after: [
        { text: 'Você abre as mãos. Baixa os braços. Fica.' },
        { text: 'O golpe dele para a um palmo do seu rosto — e treme ali, suspenso, sem saber o que fazer com a própria força.' },
        { who: 'eco', text: 'Levanta a guarda. LEVANTA. Sem ela eu não sei... eu não sei o que eu sou.' },
        { who: 'voz-ternura', text: 'Olha. A raiva dele é do tamanho exato do golpe que a criou.' },
      ],
    },
    distancia: {
      label: 'correr para longe',
      effect: (s) => addVoice(s, 'medo'),
      after: [
        { text: 'Você corre. O calor dele nos seus calcanhares, a trilha se dobrando embaixo dos seus pés.' },
        { who: 'voz-medo', text: 'A porta! Ali! — não, ali! — ela fica MUDANDO—' },
        { who: 'eco', text: '(de longe, quase baixo) Você sempre corre. É a única coisa que nunca muda.' },
      ],
    },
  },
  nevoa: {
    escalada: {
      label: 'agarrar a névoa',
      effect: (s) => addVoice(s, 'raiva'),
      after: [
        { text: 'Você se joga na névoa de mãos abertas. Agarra. Agarra de novo. Agarra o nada com força suficiente pra machucar os dedos.' },
        { who: 'voz-raiva', text: 'APARECE! Isso é COVARDIA! Aparece e briga que nem gente!' },
        { who: 'eco', text: 'Engraçado. Era exatamente isso que eu ia te dizer.' },
      ],
    },
    percepcao: {
      label: 'chamar com a verdade',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'ternura');
      },
      after: [
        { text: 'Você fala para a névoa, sem saber para onde olhar: "Eu recuei porque tive medo. Não de você. Do que você lembra."' },
        { who: 'eco', text: 'Eu sei. Eu estava lá.' },
        { who: 'voz-ternura', text: 'Ele sempre esteve. Em todas. É disso que ele é feito.' },
      ],
    },
    distancia: {
      label: 'parar e respirar',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'cetico');
      },
      after: [
        { text: 'Você para. Sente o próprio fôlego: entra, sai. Não persegue nada.' },
        { who: 'voz-cetico', text: 'Hipótese: névoa não se agarra. Névoa se espera. Vamos testar.' },
        { text: 'Aos poucos — muito aos poucos — a névoa se condensa. Um contorno. Um passo. Ele.' },
        { who: 'eco', text: '...ninguém nunca tinha ficado.' },
      ],
    },
  },
  arquivo: {
    escalada: {
      label: 'rasgar o registro',
      effect: (s) => addVoice(s, 'raiva'),
      after: [
        { text: '"Está errado", você diz. "Isso não fui eu."' },
        { who: 'eco', text: 'Hm. Curioso. É a frase mais frequente do arquivo inteiro.' },
        { text: 'Você avança sobre a mesa — e cada página rasgada se reescreve no ar, paciente, com uma linha a mais no fim.' },
      ],
    },
    percepcao: {
      label: 'perguntar o que falta',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'ternura');
      },
      after: [
        { text: '"O que o registro não diz?", você pergunta. A leitura para. Pela primeira vez, o Eco ergue os olhos das páginas.' },
        { who: 'eco', text: '...ele não diz como doeu. Nenhum arquivo diz. É por isso que eu continuo escrevendo.' },
        { who: 'voz-ternura', text: 'Aí está. Embaixo de toda essa papelada sempre houve uma coisa só, e não era informação.' },
      ],
    },
    distancia: {
      label: 'corrigir de longe',
      effect: (s) => addVoice(s, 'cetico'),
      after: [
        { text: '"Aqui. Não foi \'para não agir\'. Foi para entender." Vocês passam o ciclo editando o passado, vírgula por vírgula, sem tocá-lo nunca.' },
        { who: 'eco', text: 'Anotado. "Corrigiu o registro: prefere as próprias palavras às minhas." Algo mais?' },
        { who: 'voz-cetico', text: 'Ele está catalogando a nossa catalogação. Eu, pessoalmente, admiro o método.' },
      ],
    },
  },
  ferida: {
    escalada: {
      label: 'tocar a rachadura',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'culpa');
      },
      after: [
        { text: 'Você se ajoelha diante dele e encosta os dedos na borda da rachadura.' },
        { text: 'Não queima. É morna. Pulsa devagar, no ritmo exato do seu próprio coração.' },
        { who: 'voz-culpa', text: '...fui eu que fiz isso? Em algum ciclo que eu não lembro — fui eu?' },
        { who: 'eco', text: 'Fomos. É diferente de "foi você". Um dia eu te explico a diferença.' },
      ],
    },
    percepcao: {
      label: 'pedir desculpa',
      effect: (s) => {
        s.flags.add('percebeu');
        addVoice(s, 'ternura');
      },
      after: [
        { text: '"Desculpa eu ter demorado tanto", você diz. Só isso. Sem defesa nenhuma anexada.' },
        { who: 'eco', text: 'Demorou mesmo. ...obrigado por chegar.' },
        { who: 'voz-ternura', text: 'Guarda esse momento. É com ele que se costura tudo o resto.' },
      ],
    },
    distancia: {
      label: 'desviar os olhos',
      effect: (s) => addVoice(s, 'medo'),
      after: [
        { text: 'Você olha para o chão. Para o limiar. Para qualquer lugar que não seja a luz.' },
        { who: 'voz-medo', text: 'Não olha. Se a gente olhar, vira nossa. Ferida vista é ferida assumida.' },
        { who: 'eco', text: 'Tudo bem. Eu também passei anos sem olhar.' },
        { text: 'A gentileza da frase dói mais do que qualquer acusação doeria.' },
      ],
    },
  },
};

export const END_QUESTIONS: Record<string, string> = {
  repetir: 'o que precisaria acontecer para a próxima volta ser diferente?',
  partir: 'por hoje, basta. — e amanhã, o que você leva até a porta?',
  perceber: 'que frase sua está esperando ser ouvida até o fim?',
};
