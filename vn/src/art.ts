import { State, Form } from './engine';

// Arte procedural em "traço de lápis vivo": cada cena é desenhada com
// polilinhas tremidas re-renderizadas periodicamente (o tremor de
// Slay the Princess). Papel escuro, giz claro, um acento de cor por forma.

export const ACCENTS: Record<Form, string> = {
  furia: '#e05545',
  nevoa: '#8fb6c8',
  arquivo: '#d9a441',
  ferida: '#9d6bd6',
};

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

export class SketchRenderer {
  private ctx: CanvasRenderingContext2D;
  private seed = 1;
  private currentArt = 'trilha';
  private state: State | null = null;
  private timer: number | null = null;
  private reduced: boolean;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.draw();
  }

  setScene(art: string, state: State): void {
    this.currentArt = art;
    this.state = state;
    this.canvas.style.opacity = '0';
    setTimeout(() => {
      this.draw();
      this.canvas.style.opacity = '1';
    }, 260);
    if (this.timer !== null) window.clearInterval(this.timer);
    if (!this.reduced) {
      this.timer = window.setInterval(() => {
        this.seed++;
        this.draw();
      }, 150);
    }
  }

  private accent(): string {
    const f = this.state?.form2;
    return f ? ACCENTS[f] : CHALK;
  }

  // ---- primitivas de traço ----
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

  // figura humana em silhueta de traços verticais
  private figure(
    cx: number, baseY: number, h: number,
    rnd: () => number, color = CHALK, alpha = 0.55,
    opts: { jagged?: boolean; gaps?: boolean; sitting?: boolean } = {}
  ): void {
    const headR = h * 0.09;
    const headY = baseY - h + headR;
    this.circle(cx, headY, headR, rnd, opts.jagged ? 3.4 : 1.8, color, alpha);
    const bodyTop = headY + headR * 1.4;
    const bodyH = opts.sitting ? h * 0.45 : h * 0.78;
    const n = 7;
    for (let i = 0; i < n; i++) {
      if (opts.gaps && rnd() < 0.4) continue;
      const off = (i - (n - 1) / 2) * (h * 0.035);
      const spread = opts.jagged ? off * 2.2 : off * 1.6;
      this.line(
        cx + off, bodyTop,
        cx + spread, opts.sitting ? baseY - h * 0.18 : bodyTop + bodyH,
        rnd, opts.jagged ? 3.2 : 2.0, color, alpha * (0.6 + rnd() * 0.4), 1.4
      );
    }
    if (opts.sitting) {
      this.line(cx - h * 0.16, baseY - h * 0.2, cx + h * 0.2, baseY - h * 0.16, rnd, 2, color, alpha, 1.4);
    }
  }

  private paper(): void {
    const c = this.ctx;
    const { width: w, height: h } = this.canvas;
    c.fillStyle = '#101014';
    c.fillRect(0, 0, w, h);
    const rnd = mulberry32(99);
    c.globalAlpha = 0.05;
    for (let i = 0; i < 90; i++) {
      c.fillStyle = CHALK;
      c.fillRect(rnd() * w, rnd() * h, 1.2, 1.2);
    }
    c.globalAlpha = 1;
  }

  private spiral(cx: number, cy: number, rmax: number, rnd: () => number, alpha: number): void {
    const pts: [number, number][] = [];
    for (let a = 0; a < Math.PI * 5; a += 0.2) {
      const r = 3 + (a / (Math.PI * 5)) * rmax;
      pts.push([cx + Math.cos(a + this.seed * 0.01) * r, cy + Math.sin(a + this.seed * 0.01) * r]);
    }
    this.stroke(pts, rnd, 1.4, CHALK, alpha, 1);
  }

  private trilhaBase(rnd: () => number, accent?: string, accentAlpha = 0.1): void {
    const { width: w, height: h } = this.canvas;
    const hor = h * 0.62;
    this.line(0, hor, w, hor, rnd, 2.4, CHALK, 0.28, 1.2);
    if (accent) this.glow(w * 0.5, hor, w * 0.45, accent, accentAlpha);
    // a trilha convergindo ao centro
    this.stroke(
      [[w * 0.18, h], [w * 0.36, h * 0.82], [w * 0.46, hor + 8]],
      rnd, 2.6, CHALK, 0.5, 1.8
    );
    this.stroke(
      [[w * 0.86, h], [w * 0.62, h * 0.8], [w * 0.52, hor + 8]],
      rnd, 2.6, CHALK, 0.5, 1.8
    );
    // árvores esparsas
    for (let i = 0; i < 6; i++) {
      const tx = (i * 0.17 + 0.05) * w + (i % 2 ? 30 : -20);
      const th = h * (0.1 + (i % 3) * 0.035);
      if (tx > w * 0.4 && tx < w * 0.6) continue;
      this.line(tx, hor, tx, hor - th, rnd, 2.2, CHALK, 0.4, 1.5);
      this.line(tx, hor - th * 0.6, tx + 14, hor - th * 0.85, rnd, 2, CHALK, 0.32, 1.2);
      this.line(tx, hor - th * 0.5, tx - 12, hor - th * 0.75, rnd, 2, CHALK, 0.32, 1.2);
    }
    this.spiral(w * 0.82, h * 0.2, 55, rnd, 0.13);
  }

  private doorAt(cx: number, baseY: number, dh: number, rnd: () => number, open: boolean, accent?: string): void {
    const dw = dh * 0.44;
    if (accent && open) this.glow(cx, baseY - dh / 2, dw * 1.6, accent, 0.28);
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

  draw(): void {
    const rnd = mulberry32(this.seed * 7919 + 13);
    const c = this.ctx;
    const { width: w, height: h } = this.canvas;
    this.paper();
    const acc = this.accent();
    const ground = h * 0.62;

    switch (this.currentArt) {
      case 'trilha':
        this.trilhaBase(rnd);
        break;
      case 'trilha2':
        this.trilhaBase(rnd, acc, 0.12);
        break;
      case 'trilha3': {
        this.trilhaBase(rnd, acc, 0.18);
        this.doorAt(w * 0.49, ground + 6, h * 0.2, rnd, true, acc);
        break;
      }
      case 'limiar':
        this.trilhaBase(rnd);
        this.doorAt(w * 0.5, h * 0.78, h * 0.4, rnd, false);
        break;
      case 'vulto':
        this.glow(w * 0.5, h * 0.5, w * 0.3, '#3a3a44', 0.5);
        this.figure(w * 0.56, h * 0.82, h * 0.42, rnd, CHALK, 0.5);
        break;
      case 'vazio': {
        for (let i = 0; i < 26; i++) {
          const a = 0.1 + rnd() * 0.25;
          c.globalAlpha = a;
          c.fillStyle = CHALK;
          c.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
        }
        c.globalAlpha = 1;
        this.spiral(w * 0.5, h * 0.42, 120, rnd, 0.1);
        break;
      }
      case 'furia': {
        this.glow(w * 0.55, h * 0.55, w * 0.32, acc, 0.22);
        this.figure(w * 0.55, h * 0.85, h * 0.52, rnd, acc, 0.75, { jagged: true });
        for (let i = 0; i < 10; i++) {
          const a = rnd() * Math.PI * 2;
          const r1 = h * 0.28, r2 = r1 + 20 + rnd() * 40;
          this.line(
            w * 0.55 + Math.cos(a) * r1, h * 0.6 + Math.sin(a) * r1 * 0.7,
            w * 0.55 + Math.cos(a) * r2, h * 0.6 + Math.sin(a) * r2 * 0.7,
            rnd, 3, acc, 0.35, 1.2
          );
        }
        break;
      }
      case 'nevoa': {
        for (let i = 0; i < 5; i++) {
          this.glow(w * (0.2 + rnd() * 0.6), h * (0.3 + rnd() * 0.4), w * 0.2, acc, 0.07);
        }
        this.figure(w * 0.4, h * 0.8, h * 0.34, rnd, acc, 0.22, { gaps: true });
        this.figure(w * 0.66, h * 0.84, h * 0.4, rnd, acc, 0.3, { gaps: true });
        this.figure(w * 0.53, h * 0.82, h * 0.38, rnd, CHALK, 0.14, { gaps: true });
        break;
      }
      case 'arquivo': {
        this.glow(w * 0.5, h * 0.5, w * 0.3, acc, 0.1);
        this.line(w * 0.3, h * 0.72, w * 0.74, h * 0.72, rnd, 2, CHALK, 0.6, 2);
        this.line(w * 0.34, h * 0.72, w * 0.34, h * 0.85, rnd, 2, CHALK, 0.45, 1.6);
        this.line(w * 0.7, h * 0.72, w * 0.7, h * 0.85, rnd, 2, CHALK, 0.45, 1.6);
        for (let i = 0; i < 14; i++) {
          const px = w * (0.28 + rnd() * 0.46);
          const py = h * 0.72 - 4 - rnd() * 26;
          this.stroke(
            [[px, py], [px + 26, py], [px + 26, py - 5], [px, py - 5], [px, py]],
            rnd, 1.2, i % 3 ? CHALK : acc, 0.35, 1
          );
        }
        this.figure(w * 0.52, h * 0.7, h * 0.34, rnd, CHALK, 0.55);
        break;
      }
      case 'ferida': {
        this.figure(w * 0.52, h * 0.8, h * 0.36, rnd, CHALK, 0.55, { sitting: true });
        const cy = h * 0.62;
        this.glow(w * 0.52, cy, 60, acc, 0.5);
        this.line(w * 0.52, cy - 26, w * 0.52 + 6, cy + 22, rnd, 2.6, acc, 0.9, 2.2);
        break;
      }
      case 'final': {
        this.glow(w * 0.53, h * 0.55, w * 0.3, acc, 0.2);
        this.circle(w * 0.53, h * 0.6, h * 0.3, rnd, 3, acc, 0.2, 1.2);
        this.figure(w * 0.53, h * 0.84, h * 0.48, rnd, CHALK, 0.6);
        this.figure(w * 0.53, h * 0.84, h * 0.48, rnd, acc, 0.3, { gaps: true });
        break;
      }
      case 'integrado': {
        const colors = ['#e05545', '#8fb6c8', '#d9a441', '#9d6bd6'];
        colors.forEach((col, i) => {
          this.glow(w * (0.25 + i * 0.17), h * 0.42, w * 0.26, col, 0.22);
        });
        this.line(0, ground, w, ground, rnd, 2.4, CHALK, 0.5, 1.4);
        this.glow(w * 0.51, ground - h * 0.12, w * 0.16, '#f0e6d0', 0.16);
        this.figure(w * 0.46, ground + h * 0.02, h * 0.3, rnd, CHALK, 0.85, { sitting: true });
        this.figure(w * 0.56, ground + h * 0.02, h * 0.3, rnd, this.accent(), 0.75, { sitting: true });
        this.spiral(w * 0.82, h * 0.18, 55, rnd, 0.3);
        break;
      }
    }
  }
}
