import { newState, State, SPEAKER_META, VOICE_COLORS } from './state';
import { PHASES, C2_OPTIONS, END_QUESTIONS, Phase, Say, Marker } from './story';
import { WorldSketch } from './sketch';
import { Drone } from './audio';
import './styles.css';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const elSub = $('subtitle');
const elSubSpeaker = $('sub-speaker');
const elSubText = $('sub-text');
const elLabels = $('labels');
const elDim = $('dim');
const elCycle = $('cycle-label');
const elGlyphs = $('voice-glyphs');
const elTitle = $('title-screen');
const elTitleCycles = $('t-cycles');
const elEnd = $('endscreen');
const elEndLabel = $('end-label');
const elEndQuestion = $('end-question');

const CYCLES_KEY = 'ecos_travessia_ciclos';

// ------------------------------------------------------------------
// estado do jogo
// ------------------------------------------------------------------
let state: State = newState();
let phase: Phase = PHASES.c1;
let beatsDone = new Set<number>();
let player = { x: 120, vx: 0, y: 0, vy: 0, grounded: true, sitting: false };
let camX = 0;
let controlLocked = false;
let encounterChosen = false;
let encounterEntered = false;
let wrapUsed = false;
let transitioning = false;
let finished = false;
let ecoOffsetX = 0;
let ecoSitting = false;
let finaleGlow = 0;
let staging: 'none' | 'perceber' | 'partir' | 'endscreen' = 'none';

const keys = { left: false, right: false, jump: false };

const canvas = $('art') as unknown as HTMLCanvasElement;
const sketch = new WorldSketch(canvas);
const drone = new Drone();

// fila de legendas
interface QueuedSay {
  say: Say;
  minMs: number;
}
let subQueue: QueuedSay[] = [];
let subCurrent: QueuedSay | null = null;
let subShownAt = 0;
let afterQueueAction: (() => void) | null = null;

// anéis dos marcadores
const rings = new Map<string, number>();

function resolveSay(say: Say): string {
  return typeof say.text === 'function' ? say.text(state) : say.text;
}

function say(s: Say): void {
  const text = resolveSay(s);
  if (!text) return;
  subQueue.push({ say: s, minMs: Math.max(2300, text.length * 46) });
}

function groundY(): number {
  return sketch.height * 0.72;
}

function activeMarkers(): Marker[] {
  if (!phase.encounter || encounterChosen) return [];
  return phase.encounter.markers.filter((m) => !m.gate || m.gate(state));
}

function markerX(m: Marker): number {
  return (phase.ecoX ?? 0) + m.dx;
}

function markerLabel(m: Marker): string {
  if (phase.id === 'c2' && state.form2) {
    return C2_OPTIONS[state.form2][m.id as 'escalada' | 'percepcao' | 'distancia'].label;
  }
  return m.label;
}

function updateHud(): void {
  elCycle.textContent = ['', 'ciclo I', 'ciclo II', 'ciclo III'][state.cycle] ?? '';
  elGlyphs.innerHTML = '';
  for (const v of state.voices) {
    const dot = document.createElement('span');
    dot.className = 'voice-dot';
    dot.style.background = VOICE_COLORS[v];
    elGlyphs.appendChild(dot);
  }
}

// ------------------------------------------------------------------
// fases
// ------------------------------------------------------------------
function loadPhase(id: string): void {
  phase = PHASES[id];
  beatsDone = new Set();
  encounterChosen = false;
  encounterEntered = false;
  wrapUsed = false;
  ecoOffsetX = 0;
  ecoSitting = false;
  finaleGlow = 0;
  staging = 'none';
  controlLocked = false;
  player = { x: phase.playerStart, vx: 0, y: 0, vy: 0, grounded: true, sitting: false };
  camX = 0;
  subQueue = [];
  subCurrent = null;
  afterQueueAction = null;
  rings.clear();
  phase.onEnter?.(state);
  updateHud();
  if (phase.id === 'c2' && state.form2) drone.setMood(state.form2);
  else drone.setMood(undefined);
}

function fadeTo(action: () => void): void {
  transitioning = true;
  canvas.style.transition = 'opacity 0.7s ease';
  canvas.style.opacity = '0';
  elSub.classList.remove('visible');
  setTimeout(() => {
    action();
    canvas.style.opacity = '1';
    setTimeout(() => {
      transitioning = false;
    }, 700);
  }, 750);
}

// ------------------------------------------------------------------
// escolha de postura
// ------------------------------------------------------------------
function choose(m: Marker): void {
  encounterChosen = true;
  elDim.classList.remove('on');
  drone.chime();
  let after: Say[] = m.after;
  if (phase.id === 'c2' && state.form2) {
    const opt = C2_OPTIONS[state.form2][m.id as 'escalada' | 'percepcao' | 'distancia'];
    opt.effect(state);
    after = opt.after;
  } else {
    m.effect?.(state);
  }
  updateHud();
  for (const s of after) say(s);

  if (m.ending === 'perceber') {
    afterQueueAction = () => {
      staging = 'perceber';
      controlLocked = true;
      drone.setMood('fim');
    };
  } else if (m.ending === 'partir') {
    afterQueueAction = () => {
      staging = 'partir';
      controlLocked = true;
    };
  } else if (m.ending === 'repetir') {
    afterQueueAction = () => showEnd();
  } else {
    const next = typeof phase.next === 'function' ? phase.next(state) : phase.next;
    afterQueueAction = () => fadeTo(() => loadPhase(next));
  }
}

function showEnd(): void {
  finished = true;
  const count = Number(localStorage.getItem(CYCLES_KEY) ?? '0') + 1;
  localStorage.setItem(CYCLES_KEY, String(count));
  const ending = state.ending ?? 'repetir';
  elEndLabel.textContent = `— fim: ${ending} —`;
  elEndQuestion.textContent = END_QUESTIONS[ending];
  elEnd.classList.add('visible');
}

$('end-restart').addEventListener('click', () => {
  state = newState();
  if (Number(localStorage.getItem(CYCLES_KEY) ?? '0') > 0) state.flags.add('retorno');
  finished = false;
  elEnd.classList.remove('visible');
  fadeTo(() => loadPhase('c1'));
});

// ------------------------------------------------------------------
// loop
// ------------------------------------------------------------------
let lastT = performance.now();
let stagingT = 0;

function tick(now: number): void {
  const dt = Math.min(50, now - lastT);
  lastT = now;
  const gy = groundY();
  const w = sketch.width;
  const isVazio = phase.scene === 'vazio';

  // ---- física ----
  if (!controlLocked && !finished && !transitioning) {
    const speed = 240;
    if (keys.left) player.vx = -speed;
    else if (keys.right) player.vx = speed;
    else player.vx *= Math.pow(0.000001, dt / 1000);
    player.x += (player.vx * dt) / 1000;
    player.x = Math.max(20, Math.min(phase.worldW - 20, player.x));

    const grav = isVazio ? 420 : 1150;
    if (keys.jump && player.grounded) {
      player.vy = isVazio ? -260 : -430;
      player.grounded = false;
    }
    if (!player.grounded) {
      player.vy += (grav * dt) / 1000;
      player.y += (player.vy * dt) / 1000;
      if (player.y >= 0) {
        player.y = 0;
        player.vy = 0;
        player.grounded = true;
      }
    }
  }

  // ---- encenação dos finais ----
  if (staging === 'perceber') {
    stagingT += dt;
    const targetOffset = player.x + 55 - (phase.ecoX ?? 0);
    ecoOffsetX += (targetOffset - ecoOffsetX) * Math.min(1, dt / 900);
    if (stagingT > 2600) {
      ecoSitting = true;
      player.sitting = true;
      finaleGlow = Math.min(1, finaleGlow + dt / 2600);
      if (finaleGlow >= 1 && stagingT > 6800) {
        staging = 'endscreen';
        showEnd();
      }
    }
  } else if (staging === 'partir') {
    stagingT += dt;
    const target = (phase.doorX ?? 200) - 60;
    if (player.x > target + 8) {
      player.x -= (170 * dt) / 1000;
    } else {
      player.sitting = true;
      ecoSitting = true;
      ecoOffsetX = (phase.doorX ?? 0) + 60 - (phase.ecoX ?? 0);
      if (stagingT > 5200) {
        staging = 'endscreen';
        showEnd();
      }
    }
  } else {
    stagingT = 0;
  }

  // ---- beats ----
  if (!transitioning && !finished) {
    for (const b of phase.beats) {
      const key = b.x + (typeof b.text === 'string' ? b.text.length : 0);
      if (!beatsDone.has(key) && player.x >= b.x) {
        beatsDone.add(key);
        say(b);
      }
    }
  }

  // ---- volta da trilha (partir no ciclo I) ----
  if (phase.wrapLeft && player.x <= phase.wrapLeft.minX && !transitioning) {
    const wrap = phase.wrapLeft;
    fadeTo(() => {
      player.x = wrap.to;
      player.vx = 0;
      if (wrap.flag) state.flags.add(wrap.flag);
      if (!wrapUsed) {
        for (const l of wrap.lines) say(l);
        wrapUsed = true;
      } else {
        say({ who: 'kairoon', text: 'Sempre volta.' });
      }
    });
  }

  // ---- saída pela direita (vazios) ----
  if (phase.exitRightX && player.x >= phase.exitRightX && !transitioning) {
    const next = typeof phase.next === 'function' ? phase.next(state) : phase.next;
    fadeTo(() => loadPhase(next));
  }

  // ---- encontro / marcadores ----
  const markers = activeMarkers();
  // uma vez dentro da zona do encontro, ela não se desativa mais:
  // recuar e partir também são posturas tomadas DIANTE do Eco
  if (phase.encounter && player.x >= phase.encounter.zoneX - 120) {
    encounterEntered = true;
  }
  const inEncounter = phase.encounter && !encounterChosen && encounterEntered;
  elDim.classList.toggle('on', !!inEncounter);
  if (inEncounter) {
    for (const m of markers) {
      const mx = markerX(m);
      const near =
        Math.abs(player.x - mx) < 46 && player.grounded && Math.abs(player.vx) < 45;
      let r = rings.get(m.id) ?? 0;
      r = near ? Math.min(1, r + dt / 1100) : Math.max(0, r - dt / 600);
      rings.set(m.id, r);
      if (r >= 1) {
        choose(m);
        break;
      }
    }
  }

  // ---- legendas ----
  if (subCurrent && now - subShownAt > subCurrent.minMs) {
    subCurrent = null;
    elSub.classList.remove('visible');
  }
  if (!subCurrent && subQueue.length > 0) {
    subCurrent = subQueue.shift()!;
    subShownAt = now;
    const s = subCurrent.say;
    const text = resolveSay(s);
    elSubText.textContent = text;
    elSubText.className = '';
    if (s.who === 'pergunta') elSubText.classList.add('pergunta');
    else if (s.who === 'kairoon') elSubText.classList.add('fala-kairoon');
    else if (s.who === 'eco') elSubText.classList.add('fala-eco');
    else if (s.who) elSubText.classList.add('fala-voz');
    if (s.who && s.who !== 'pergunta') {
      const meta = SPEAKER_META[s.who];
      elSubSpeaker.textContent = meta.label;
      elSubSpeaker.className = meta.cls;
    } else {
      elSubSpeaker.textContent = '';
    }
    elSub.classList.add('visible');
  }
  if (!subCurrent && subQueue.length === 0 && afterQueueAction) {
    const action = afterQueueAction;
    afterQueueAction = null;
    action();
  }

  // ---- câmera ----
  const targetCam = Math.max(0, Math.min(phase.worldW - w, player.x - w * 0.42));
  camX += (targetCam - camX) * Math.min(1, dt / 220);

  // ---- posiciona legenda e rótulos ----
  const px = player.x - camX;
  const py = gy + player.y - 108;
  elSub.style.left = `${Math.max(180, Math.min(w - 180, px))}px`;
  elSub.style.top = `${Math.max(80, py - 24)}px`;

  elLabels.innerHTML = '';
  if (inEncounter) {
    for (const m of markers) {
      const lbl = document.createElement('div');
      lbl.className = 'marker-label';
      lbl.textContent = markerLabel(m);
      lbl.style.left = `${markerX(m) - camX}px`;
      lbl.style.top = `${gy + 16}px`;
      elLabels.appendChild(lbl);
    }
  }

  // ---- desenho ----
  const scene = typeof phase.scene === 'function' ? phase.scene(state) : phase.scene;
  sketch.draw(
    {
      scene,
      camX,
      groundY: gy,
      worldW: phase.worldW,
      ecoX: encounterChosen && staging === 'none' && phase.id !== 'c3' ? undefined : phase.ecoX,
      doorX: phase.doorX,
      doorOpen: phase.id === 'c3' || player.x > (phase.doorX ?? Infinity) - 90,
      state,
      playerX: player.x,
      playerY: gy + player.y,
      playerSitting: player.sitting,
      ecoOffsetX,
      ecoSitting,
      markers: markers.map((m) => ({
        x: markerX(m),
        ring: rings.get(m.id) ?? 0,
        active: !!inEncounter,
      })),
      finaleGlow,
    },
    now
  );

  requestAnimationFrame(tick);
}

// ------------------------------------------------------------------
// input
// ------------------------------------------------------------------
window.addEventListener('keydown', (ev) => {
  if (ev.code === 'ArrowLeft' || ev.code === 'KeyA') keys.left = true;
  if (ev.code === 'ArrowRight' || ev.code === 'KeyD') keys.right = true;
  if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW') {
    ev.preventDefault();
    keys.jump = true;
  }
});
window.addEventListener('keyup', (ev) => {
  if (ev.code === 'ArrowLeft' || ev.code === 'KeyA') keys.left = false;
  if (ev.code === 'ArrowRight' || ev.code === 'KeyD') keys.right = false;
  if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW') keys.jump = false;
});

// ------------------------------------------------------------------
// título e boot
// ------------------------------------------------------------------
function begin(): void {
  elTitle.classList.add('hidden');
  drone.start();
  state = newState();
  if (Number(localStorage.getItem(CYCLES_KEY) ?? '0') > 0) state.flags.add('retorno');
  loadPhase('c1');
}
elTitle.addEventListener('click', begin);
window.addEventListener('keydown', (ev) => {
  if (!elTitle.classList.contains('hidden') && (ev.code === 'Space' || ev.code === 'Enter')) {
    begin();
  }
});

const prev = Number(localStorage.getItem(CYCLES_KEY) ?? '0');
if (prev > 0) elTitleCycles.textContent = `ciclos atravessados: ${prev}`;

loadPhase('c1');
requestAnimationFrame(tick);

// ------------------------------------------------------------------
// gancho de teste (#debug)
// ------------------------------------------------------------------
if (window.location.hash.includes('debug')) {
  (window as unknown as Record<string, unknown>).__eco = {
    state: () => ({
      phase: phase.id,
      x: Math.round(player.x),
      voices: [...state.voices],
      flags: [...state.flags],
      form2: state.form2,
      ending: state.ending,
      finished,
      transitioning,
      encounterChosen,
      staging,
      queueLen: subQueue.length + (subCurrent ? 1 : 0),
      markers: activeMarkers().map((m) => ({
        id: m.id,
        x: Math.round(markerX(m)),
        ring: rings.get(m.id) ?? 0,
      })),
    }),
    teleport: (x: number) => {
      player.x = x;
      player.vx = 0;
    },
    begin,
    flushSubtitles: () => {
      // testes: reduz o tempo mínimo das legendas pendentes
      if (subCurrent) subCurrent.minMs = 1;
      for (const q of subQueue) q.minMs = 120;
    },
  };
}
