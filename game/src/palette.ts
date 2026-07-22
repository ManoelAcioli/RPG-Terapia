// Paletas do protótipo "A Cidade Suspensa no Tempo".
// O mundo nasce cinza; cada era integrada devolve sua faixa de cor.

export const ERA = {
  TWENTIES: 0,
  EIGHTIES: 1,
  FUTURE: 2,
} as const;

export type EraId = (typeof ERA)[keyof typeof ERA];

export interface EraPalette {
  skyTop: number;
  skyBottom: number;
  building: number;
  platform: number;
  accent: number; // luz característica da era (lampião, neon, orbe)
  name: string;
}

export const ERA_PALETTES: EraPalette[] = [
  {
    // Anos 20 — sépia, âmbar, jazz
    skyTop: 0x3a2b26,
    skyBottom: 0xc98d4b,
    building: 0x9c5a3c,
    platform: 0xb8825a,
    accent: 0xffc873,
    name: 'twenties',
  },
  {
    // Anos 80 — neon, violeta, rosa
    skyTop: 0x241a3d,
    skyBottom: 0xe75480,
    building: 0x4a4e69,
    platform: 0x7b6ca8,
    accent: 0x2de2e6,
    name: 'eighties',
  },
  {
    // Futuro — teal, prata, aurora
    skyTop: 0x0d2137,
    skyBottom: 0x7fd8cf,
    building: 0x5c7a8a,
    platform: 0x8fb6c0,
    accent: 0x7df9ff,
    name: 'future',
  },
];

export const GRAY_SKY_TOP = 0x23232a;
export const GRAY_SKY_BOTTOM = 0x63636c;

export function lerpColor(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, t));
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

// Versão dessaturada de uma cor (com leve elevação azulada, para não ficar "morta").
export function toGray(c: number): number {
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  const l = Math.round(0.3 * r + 0.55 * g + 0.15 * b);
  const gray = (l << 16) | (l << 8) | l;
  return lerpColor(gray, 0x8a8fa0, 0.12);
}
