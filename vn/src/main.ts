import { newState, State, Node, Line, SPEAKER_META, VoiceId } from './engine';
import { script, ENDINGS } from './script';
import { SketchRenderer } from './art';
import { Drone } from './audio';
import './styles.css';

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const elText = $('text');
const elSpeaker = $('speaker');
const elChoices = $('choices');
const elHint = $('advance-hint');
const elCycle = $('cycle-label');
const elGlyphs = $('voice-glyphs');
const elTitle = $('title-screen');
const elTitleCycles = $('t-cycles');

const VOICE_COLORS: Record<VoiceId, string> = {
  medo: '#8fb6c8',
  raiva: '#e05545',
  cetico: '#d9a441',
  ternura: '#b07fd8',
  culpa: '#7fa88f',
};

const CYCLES_KEY = 'ecos_vn_ciclos';

let state: State = newState();
let node: Node = script.nodes[script.start];
let lineIdx = 0;
let typing = false;
let typeTimer: number | null = null;
let currentArt = 'trilha';
let awaitingChoice = false;
let finished = false;

const art = new SketchRenderer($('art') as unknown as HTMLCanvasElement);
const drone = new Drone();

function resolveText(line: Line): string {
  return typeof line.text === 'function' ? line.text(state) : line.text;
}

function updateHud(): void {
  elCycle.textContent = ['', 'ciclo I', 'ciclo II', 'ciclo III'][state.cycle] ?? '';
  elGlyphs.innerHTML = '';
  for (const v of state.voices) {
    const dot = document.createElement('span');
    dot.className = 'voice-dot';
    dot.style.background = VOICE_COLORS[v];
    dot.title = `A Voz: ${v}`;
    elGlyphs.appendChild(dot);
  }
}

function setSpeaker(line: Line): void {
  elText.className = '';
  if (!line.who) {
    elSpeaker.textContent = '';
    elSpeaker.className = '';
    return;
  }
  const meta = SPEAKER_META[line.who];
  elSpeaker.textContent = meta.label;
  elSpeaker.className = meta.cls;
  if (line.who === 'kairoon') elText.classList.add('fala-kairoon');
  else if (line.who === 'eco') elText.classList.add('fala-eco');
  else if (line.who === 'pergunta') elText.classList.add('pergunta');
  else elText.classList.add('fala-voz');
}

function showLine(): void {
  // pula falas condicionais vazias (vozes ausentes)
  while (lineIdx < node.lines.length && resolveText(node.lines[lineIdx]) === '') {
    lineIdx++;
  }
  if (lineIdx >= node.lines.length) {
    endOfNode();
    return;
  }
  const line = node.lines[lineIdx];
  const text = resolveText(line);
  setSpeaker(line);
  elChoices.classList.remove('visible');
  elHint.style.visibility = 'hidden';
  typing = true;
  elText.textContent = '';
  let i = 0;
  const step = () => {
    i += 2;
    elText.textContent = text.slice(0, i);
    if (i >= text.length) {
      finishTyping(text);
      return;
    }
    typeTimer = window.setTimeout(step, 24);
  };
  step();
}

function finishTyping(fullText?: string): void {
  if (typeTimer !== null) window.clearTimeout(typeTimer);
  typeTimer = null;
  typing = false;
  if (fullText !== undefined) elText.textContent = fullText;
  else elText.textContent = resolveText(node.lines[lineIdx]);
  elHint.style.visibility = 'visible';
}

function endOfNode(): void {
  const choices = (node.choices ?? []).filter((c) => !c.if || c.if(state));
  if (choices.length > 0) {
    awaitingChoice = true;
    elHint.style.visibility = 'hidden';
    elChoices.innerHTML = '';
    for (const c of choices) {
      const btn = document.createElement('button');
      btn.textContent = typeof c.label === 'function' ? c.label(state) : c.label;
      btn.dataset.goto = c.goto;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        awaitingChoice = false;
        c.effect?.(state);
        updateHud();
        goto(c.goto);
      });
      elChoices.appendChild(btn);
    }
    elChoices.classList.add('visible');
    return;
  }
  if (ENDINGS.includes(node.id)) {
    showEndingUi();
    return;
  }
  const next = typeof node.next === 'function' ? node.next(state) : node.next;
  if (next) goto(next);
}

function showEndingUi(): void {
  finished = true;
  drone.setMood('fim');
  drone.chime();
  const count = Number(localStorage.getItem(CYCLES_KEY) ?? '0') + 1;
  localStorage.setItem(CYCLES_KEY, String(count));
  awaitingChoice = true;
  elChoices.innerHTML = '';
  const endingName = { perceber: 'perceber', repetir: 'repetir', partir: 'partir' }[
    state.ending ?? 'repetir'
  ];
  const label = document.createElement('div');
  label.style.cssText =
    'font-size:13px;letter-spacing:.22em;color:rgba(216,212,200,.45);margin-bottom:4px;';
  label.textContent = `— fim: ${endingName} —`;
  elChoices.appendChild(label);
  const btn = document.createElement('button');
  btn.textContent = 'recomeçar o ciclo';
  btn.dataset.goto = 'RESTART';
  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    restart();
  });
  elChoices.appendChild(btn);
  elChoices.classList.add('visible');
}

function restart(): void {
  state = newState();
  if (Number(localStorage.getItem(CYCLES_KEY) ?? '0') > 0) state.flags.add('retorno');
  finished = false;
  awaitingChoice = false;
  drone.setMood(undefined);
  goto(script.start);
  updateHud();
}

function goto(id: string): void {
  node = script.nodes[id];
  if (!node) throw new Error(`nó inexistente: ${id}`);
  lineIdx = 0;
  node.enter?.(state);
  updateHud();
  if (node.art && node.art !== currentArt) {
    currentArt = node.art;
    art.setScene(node.art, state);
    if (['furia', 'nevoa', 'arquivo', 'ferida'].includes(node.art)) {
      drone.setMood(node.art);
    } else if (node.art === 'integrado') {
      drone.setMood('fim');
    }
  } else {
    // re-renderiza com o estado novo (acentos podem ter mudado)
    art.setScene(currentArt, state);
  }
  showLine();
}

function advance(): void {
  if (awaitingChoice || finished) return;
  if (typing) {
    finishTyping();
    return;
  }
  lineIdx++;
  showLine();
}

// ---- input ----
$('textbox').addEventListener('click', advance);
($('stage') as HTMLElement).addEventListener('click', (ev) => {
  if ((ev.target as HTMLElement).closest('#textbox')) return;
  advance();
});
window.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space' || ev.code === 'Enter') {
    ev.preventDefault();
    if (!elTitle.classList.contains('hidden')) {
      begin();
      return;
    }
    advance();
  }
});

// ---- título ----
function begin(): void {
  elTitle.classList.add('hidden');
  drone.start();
  restart();
}
elTitle.addEventListener('click', begin);

const prevCycles = Number(localStorage.getItem(CYCLES_KEY) ?? '0');
if (prevCycles > 0) {
  elTitleCycles.textContent = `ciclos atravessados: ${prevCycles}`;
}

// arte inicial atrás do título
art.setScene('trilha', state);

// ---- gancho de teste (#debug) ----
if (window.location.hash.includes('debug')) {
  (window as unknown as Record<string, unknown>).__vn = {
    state: () => ({
      node: node.id,
      cycle: state.cycle,
      stance1: state.stance1,
      form2: state.form2,
      voices: [...state.voices],
      flags: [...state.flags],
      ending: state.ending,
      typing,
      awaitingChoice,
      finished,
      choiceIds: [...elChoices.querySelectorAll('button')].map(
        (b) => (b as HTMLButtonElement).dataset.goto
      ),
    }),
    advance,
    begin,
    choose: (targetGoto: string) => {
      const btn = [...elChoices.querySelectorAll('button')].find(
        (b) => (b as HTMLButtonElement).dataset.goto === targetGoto
      ) as HTMLButtonElement | undefined;
      btn?.click();
      return !!btn;
    },
  };
}
