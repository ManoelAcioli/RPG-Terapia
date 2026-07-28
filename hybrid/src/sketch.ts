import { State, ACCENTS } from './state';

// Renderizador de mundo lateral em traço de lápis vivo.
// Tudo em coordenadas de mundo; a câmera desloca o desenho.

const CHALK = '#d8d4c8';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SceneInput {
  scene: string;
  camX: number;
  groundY: number;
  worldW: number;
  ecoX?: number;
  doorX?: number;
  doorOpen: boolean;
  state: State;
  playerX: number;
  playerY: number;
  playerSitting: boolean;
  ecoOffsetX: number; // deslocamento do Eco (final perceber: ele anda até você)
  ecoSitting: boolean;
  markers: { x: number; ring: number; active: boolean }[];
  finaleGlow: number; // 0..1 — inundação de cor do final perceber
}

export class WorldSketch {
  private ctx: CanvasRenderingContext2D;
  private seed = 1;
  private reduced: boolean;
  private lastJitterAt = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  get width(): number {
    return this.canvas.width;
  }
  get height(): number {
    return this.canvas.height;
  }

  private accent(state: State): string {
    return state.form2 ? ACCENTS[state.form2] : CHALK;
  }

  // ---------------- primitivas ----------------
  private stroke(
    pts: [number, number][],
    rnd: () => number,
    jitter = 2.2,
    color = CHALK,
    alpha = 0.6,
    width = 1.6
  ): void {
    const c = this.ctx;
    for (let pass = 0; pass < 2; pass++) {
      c.beginPath();
      c.strokeStyle = color;
      c.globalAlpha = alpha * (pass === 0 ? 1 : 0.45);
      c.lineWidth = width * (pass === 0 ? 1 : 0.7);
      pts.forEach(([x, y], i) => {
        const jx = x + (rnd() - 0.5) * jitter * 2;
        const jy = y + (rnd() - 0.5) * jitter * 2;
        if (i === 0) c.moveTo(jx, jy);
        else c.lineTo(jx, jy);
      });
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  private line(
    x1: number, y1: number, x2: number, y2: number,
    rnd: () => number, jitter?: number, color?: string, alpha?: number, width?: number
  ): void {
    const n = 6;
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
    }
    this.stroke(pts, rnd, jitter, color, alpha, width);
  }

  private circle(
    cx: number, cy: number, r: number,
    rnd: () => number, jitter = 1.8, color = CHALK, alpha = 0.6, width = 1.6
  ): void {
    const pts: [number, number][] = [];
    for (let a = 0; a <= Math.PI * 2 + 0.15; a += 0.28) {
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    this.stroke(pts, rnd, jitter, color, alpha, width);
  }

  private glow(cx: number, cy: number, r: number, color: string, alpha: number): void {
    const c = this.ctx;
    const g = c.createRadialGradient(cx, cy, 1, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    c.globalAlpha = alpha;
    c.fillStyle = g;
    c.fillRect(cx - r, cy - r, r * 2, r * 2);
    c.globalAlpha = 1;
  }

  figure(
    cx: number, baseY: number, h: number,
    rnd: () => number, color = CHALK, alpha = 0.55,
    opts: { jagged?: boolean; gaps?: boolean; sitting?: boolean } = {}
  ): void {
    const headR = h * 0.09;
    const effH = opts.sitting ? h * 0.72 : h;
    const headY = baseY - effH + headR;
    this.circle(cx, headY, headR, rnd, opts.jagged ? 3.4 : 1.8, color, alpha);
    const bodyTop = headY + headR * 1.4;
    const n = 7;
    for (let i = 0; i < n; i++) {
      if (opts.gaps && rnd() < 0.4) continue;
      const off = (i - (n - 1) / 2) * (h * 0.035);
      const spread = opts.jagged ? off * 2.2 : off * 1.6;
      this.line(cx + off, bodyTop, cx + spread, baseY - 2, rnd,
        opts.jagged ? 3.2 : 2.0, color, alpha * (0.6 + rnd() * 0.4), 1.4);
    }
    if (opts.sitting) {
      this.line(cx - h * 0.05, baseY - 2, cx + h * 0.28, baseY - 2, rnd, 2, color, alpha, 1.4);
    }
  }

  private spiral(cx: number, cy: number, rmax: number, rnd: () => number, alpha: number): void {
    const pts: [number, number][] = [];
    for (let a = 0; a < Math.PI * 5; a += 0.2) {
      const r = 3 + (a / (Math.PI * 5)) * rmax;
      pts.push([cx + Math.cos(a + this.seed * 0.01) * r, cy + Math.sin(a + this.seed * 0.01) * r]);
    }
    this.stroke(pts, rnd, 1.4, CHALK, alpha, 1);
  }

  private door(cx: number, baseY: number, dh: number, rnd: () => number, open: boolean, accent?: string): void {
    const dw = dh * 0.44;
    if (accent && open) this.glow(cx, baseY - dh / 2, dw * 1.8, accent, 0.25);
    this.stroke(
      [[cx - dw / 2, baseY], [cx - dw / 2, baseY - dh], [cx + dw / 2, baseY - dh], [cx + dw / 2, baseY]],
      rnd, 2.2, CHALK, 0.75, 2
    );
    if (!open) {
      this.stroke(
        [[cx - dw / 2 + 6, baseY - 4], [cx - dw / 2 + 6, baseY - dh + 6], [cx + dw / 2 - 6, baseY - dh + 6], [cx + dw / 2 - 6, baseY - 4]],
        rnd, 2, CHALK, 0.5, 1.4
      );
      this.circle(cx + dw / 4, baseY - dh / 2, 3.5, rnd, 1.2, CHALK, 0.7, 1.4);
    }
  }

  private tree(x: number, groundY: number, th: number, rnd: () => number): void {
    this.line(x, groundY, x, groundY - th, rnd, 2.2, CHALK, 0.4, 1.5);
    this.line(x, groundY - th * 0.6, x + 14, groundY - th * 0.85, rnd, 2, CHALK, 0.32, 1.2);
    this.line(x, groundY - th * 0.5, x - 12, groundY - th * 0.75, rnd, 2, CHALK, 0.32, 1.2);
  }

  // ---------------- o Eco por fase ----------------
  private drawEco(inp: SceneInput, rnd: () => number): void {
    if (inp.ecoX === undefined) return;
    const x = inp.ecoX + inp.ecoOffsetX;
    const gy = inp.groundY;
    const acc = this.accent(inp.state);
    const scene = inp.scene;
    if (inp.ecoSitting) {
      this.figure(x, gy, 120, rnd, acc, 0.7, { sitting: true });
      return;
    }
    if (scene === 'trilha' || scene === 'c1') {
      this.glow(x, gy - 80, 110, '#3a3a44', 0.5);
      this.figure(x, gy, 150, rnd, CHALK, 0.5);
    } else if (scene === 'furia') {
      this.glow(x, gy - 90, 150, acc, 0.25);
      this.figure(x, gy, 185, rnd, acc, 0.8, { jagged: true });
      for (let i = 0; i < 8; i++) {
        const a = rnd() * Math.PI * 2;
        const r1 = 95, r2 = r1 + 18 + rnd() * 36;
        this.line(x + Math.cos(a) * r1, gy - 90 + Math.sin(a) * r1 * 0.7,
          x + Math.cos(a) * r2, gy - 90 + Math.sin(a) * r2 * 0.7, rnd, 3, acc, 0.35, 1.2);
      }
    } else if (scene === 'nevoa') {
      this.figure(x - 70, gy, 130, rnd, acc, 0.2, { gaps: true });
      this.figure(x + 60, gy, 145, rnd, acc, 0.26, { gaps: true });
      this.figure(x, gy, 140, rnd, CHALK, 0.13, { gaps: true });
    } else if (scene === 'arquivo') {
      this.line(x - 90, gy - 46, x + 60, gy - 46, rnd, 2, CHALK, 0.6, 2);
      this.line(x - 80, gy - 46, x - 80, gy, rnd, 2, CHALK, 0.45, 1.6);
      this.line(x + 50, gy - 46, x + 50, gy, rnd, 2, CHALK, 0.45, 1.6);
      for (let i = 0; i < 10; i++) {
        const px = x - 86 + rnd() * 140;
        const py = gy - 50 - rnd() * 22;
        this.stroke([[px, py], [px + 24, py], [px + 24, py - 5], [px, py - 5], [px, py]],
          rnd, 1.2, i % 3 ? CHALK : acc, 0.35, 1);
      }
      this.figure(x, gy - 40, 120, rnd, CHALK, 0.55);
      this.glow(x, gy - 90, 120, acc, 0.12);
    } else if (scene === 'ferida') {
      this.figure(x, gy, 125, rnd, CHALK, 0.55, { sitting: true });
      const cy = gy - 55;
      this.glow(x, cy, 55, acc, 0.5);
      this.line(x, cy - 22, x + 5, cy + 18, rnd, 2.6, acc, 0.9, 2.2);
    } else if (scene === 'trilha3') {
      this.glow(x, gy - 85, 130, acc, 0.22);
      this.circle(x, gy - 78, 95, rnd, 3, acc, 0.2, 1.2);
      this.figure(x, gy, 160, rnd, CHALK, 0.6);
      this.figure(x, gy, 160, rnd, acc, 0.3, { gaps: true });
    }
  }

  // ---------------- cena completa ----------------
  draw(inp: SceneInput, now: number): void {
    if (!this.reduced && now - this.lastJitterAt > 150) {
      this.seed++;
      this.lastJitterAt = now;
    }
    const rnd = mulberry32(this.seed * 7919 + 13);
    const c = this.ctx;
    const w = this.width;
    const h = this.height;

    // papel
    c.fillStyle = '#101014';
    c.fillRect(0, 0, w, h);
    const paperRnd = mulberry32(99);
    c.globalAlpha = 0.05;
    for (let i = 0; i < 90; i++) {
      c.fillStyle = CHALK;
      c.fillRect(paperRnd() * w, paperRnd() * h, 1.2, 1.2);
    }
    c.globalAlpha = 1;

    const acc = this.accent(inp.state);
    const gy = inp.groundY;

    c.save();
    c.translate(-inp.camX, 0);

    const viewL = inp.camX - 60;
    const viewR = inp.camX + w + 60;

    // clima por cena (antes do chão, para ficar atrás)
    if (inp.scene === 'furia') {
      for (let i = 0; i < 6; i++) {
        const gx = viewL + ((i * 977) % (w + 120));
        this.glow(gx, gy - 30 - ((i * 137) % 90), 60, acc, 0.08);
      }
      this.glow(inp.camX + w / 2, h * 0.2, w * 0.5, acc, 0.05);
    } else if (inp.scene === 'nevoa') {
      for (let i = 0; i < 5; i++) {
        this.glow(viewL + ((i * 733) % (w + 120)), gy - 60 - ((i * 191) % 140), 130, acc, 0.06);
      }
    } else if (inp.scene === 'ferida') {
      this.glow(inp.ecoX ?? 0, gy - 60, 260, acc, 0.1);
    } else if (inp.scene === 'trilha3') {
      this.glow(inp.camX + w / 2, gy - 60, w * 0.4, acc, 0.08);
    } else if (inp.scene === 'vazio') {
      const vr = mulberry32(this.seed);
      for (let i = 0; i < 26; i++) {
        c.globalAlpha = 0.1 + vr() * 0.22;
        c.fillStyle = CHALK;
        c.fillRect(viewL + vr() * (w + 120), vr() * h, 1.6, 1.6);
      }
      c.globalAlpha = 1;
      this.spiral(inp.camX + w * 0.5, h * 0.32, 110, rnd, 0.1);
    }

    // inundação de cor do final perceber
    if (inp.finaleGlow > 0) {
      const colors = ['#e05545', '#8fb6c8', '#d9a441', '#9d6bd6'];
      colors.forEach((col, i) => {
        this.glow(inp.camX + w * (0.2 + i * 0.2), h * 0.42, w * 0.24, col, 0.22 * inp.finaleGlow);
      });
    }

    // chão
    if (inp.scene !== 'vazio') {
      this.line(viewL, gy, viewR, gy, rnd, 2.4, CHALK, 0.42, 1.3);
    } else {
      this.line(viewL, gy, viewR, gy, rnd, 3.2, CHALK, 0.16, 1);
    }

    // árvores da trilha (determinísticas por posição)
    if (inp.scene === 'trilha' || inp.scene === 'trilha2' || inp.scene === 'trilha3') {
      for (let tx = 140; tx < inp.worldW; tx += 260) {
        if (inp.doorX !== undefined && Math.abs(tx - inp.doorX) < 180) continue;
        if (inp.ecoX !== undefined && Math.abs(tx - inp.ecoX) < 200) continue;
        if (tx < viewL || tx > viewR) continue;
        const trnd = mulberry32(tx * 31);
        this.tree(tx + trnd() * 60, gy, 60 + trnd() * 70, rnd);
      }
      if (inp.scene === 'trilha2') {
        this.glow(inp.camX + w * 0.5, gy - 40, w * 0.45, acc, 0.09);
      }
    }
    if (inp.scene === 'arquivo') {
      for (let px = 200; px < inp.worldW; px += 190) {
        if (px < viewL || px > viewR) continue;
        if (inp.ecoX !== undefined && Math.abs(px - inp.ecoX) < 160) continue;
        const prnd = mulberry32(px * 17);
        const stack = 2 + Math.floor(prnd() * 4);
        for (let s = 0; s < stack; s++) {
          const py = gy - 7 - s * 8;
          this.stroke([[px, py], [px + 30, py], [px + 30, py - 6], [px, py - 6], [px, py]],
            rnd, 1.3, s % 2 ? CHALK : acc, 0.3, 1);
        }
      }
    }

    // espiral de Kairoon no céu (fases com céu)
    if (inp.scene !== 'vazio') {
      this.spiral(inp.camX + w * 0.84, h * 0.16, 52, rnd, 0.14);
    }

    // limiar
    if (inp.doorX !== undefined) {
      this.door(inp.doorX, gy, 190, rnd, inp.doorOpen,
        inp.scene === 'trilha3' || inp.scene === 'ferida' ? acc : undefined);
    }

    // marcadores de postura
    for (const m of inp.markers) {
      if (!m.active) continue;
      this.circle(m.x, gy - 5, 14, rnd, 1.6, CHALK, 0.5, 1.3);
      if (m.ring > 0) {
        const c2 = this.ctx;
        c2.beginPath();
        c2.strokeStyle = acc === CHALK ? '#c9b458' : acc;
        c2.globalAlpha = 0.85;
        c2.lineWidth = 2.4;
        c2.arc(m.x, gy - 5, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * m.ring);
        c2.stroke();
        c2.globalAlpha = 1;
      }
    }

    // o Eco
    this.drawEco(inp, rnd);

    // o jogador — Orbis em giz sólido
    this.figure(inp.playerX, inp.playerY, 96, rnd, '#efe9da', 0.95, {
      sitting: inp.playerSitting,
    });

    c.restore();
  }
}
