// Drone ambiente procedural (WebAudio), sem assets. Cada forma do Eco
// tem um "clima" (frequência da harmonia); finais ganham um sino.
export class Drone {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private harmony: OscillatorNode | null = null;
  private harmonyGain: GainNode | null = null;
  private started = false;

  start(): void {
    if (this.started) {
      this.ctx?.resume();
      return;
    }
    const Ctx = window.AudioContext;
    if (!Ctx) return;
    this.started = true;
    const ctx = new Ctx();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 5);
    this.master = master;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.connect(master);
    this.filter = filter;

    const mk = (freq: number, type: OscillatorType, det: number, g: number) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = det;
      const gn = ctx.createGain();
      gn.gain.value = g;
      o.connect(gn);
      gn.connect(filter);
      o.start();
    };
    mk(82.4, 'sawtooth', 0, 0.22); // E2
    mk(82.4, 'sawtooth', 8, 0.22);
    mk(123.47, 'triangle', 0, 0.3); // B2

    const harmony = ctx.createOscillator();
    harmony.type = 'sine';
    harmony.frequency.value = 246.94;
    const hg = ctx.createGain();
    hg.gain.value = 0;
    harmony.connect(hg);
    hg.connect(master);
    harmony.start();
    this.harmony = harmony;
    this.harmonyGain = hg;
  }

  // clima por forma: muda a nota da harmonia e o brilho do filtro
  setMood(form?: string): void {
    if (!this.ctx || !this.filter || !this.harmony || !this.harmonyGain) return;
    const t = this.ctx.currentTime;
    const moods: Record<string, [number, number, number]> = {
      // [freq harmonia, ganho, corte do filtro]
      furia: [196.0, 0.045, 900],
      nevoa: [220.0, 0.035, 500],
      arquivo: [233.08, 0.04, 700],
      ferida: [174.61, 0.05, 620],
      fim: [329.63, 0.06, 1600],
    };
    const [f, g, cut] = moods[form ?? ''] ?? [246.94, 0.02, 380];
    this.harmony.frequency.linearRampToValueAtTime(f, t + 1.2);
    this.harmonyGain.gain.linearRampToValueAtTime(g, t + 1.5);
    this.filter.frequency.linearRampToValueAtTime(cut, t + 1.5);
  }

  chime(): void {
    if (!this.ctx || !this.master) return;
    [329.63, 415.3, 493.88].forEach((f, i) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime + i * 0.22;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g);
      g.connect(this.master!);
      o.start(t);
      o.stop(t + 1.7);
    });
  }
}
