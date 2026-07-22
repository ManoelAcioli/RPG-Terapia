// Pad ambiente 100% procedural (WebAudio) — nenhum asset de áudio.
// Um drone suave que ganha brilho conforme a cor volta ao mundo,
// e sinos pentatônicos nos momentos de integração.
export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private harmonyGain: GainNode | null = null;
  private started = false;

  start(): void {
    if (this.started) {
      this.ctx?.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.started = true;
    const ctx = new Ctx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    this.master = master;
    // fade-in lento do ambiente
    master.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.7;
    filter.connect(master);
    this.filter = filter;

    const padGain = ctx.createGain();
    padGain.gain.value = 0.5;
    padGain.connect(filter);

    // respiração lenta do pad
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain);
    lfoGain.connect(padGain.gain);
    lfo.start();

    const mkOsc = (freq: number, type: OscillatorType, detune = 0, gain = 1) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g);
      g.connect(padGain);
      o.start();
      return g;
    };

    mkOsc(110, 'sawtooth', 0, 0.25); // A2
    mkOsc(110, 'sawtooth', 9, 0.25); // A2 desafinado — largura
    mkOsc(164.81, 'triangle', 0, 0.35); // E3

    // harmonia que só aparece com a cor
    const harmony = ctx.createOscillator();
    harmony.type = 'sine';
    harmony.frequency.value = 277.18; // C#4
    const hGain = ctx.createGain();
    hGain.gain.value = 0;
    harmony.connect(hGain);
    hGain.connect(filter);
    harmony.start();
    this.harmonyGain = hGain;
  }

  // p em [0,1]: abre o filtro e acorda a harmonia conforme a cor volta.
  setBrightness(p: number): void {
    if (!this.ctx || !this.filter || !this.harmonyGain) return;
    const t = this.ctx.currentTime;
    this.filter.frequency.linearRampToValueAtTime(260 + 2100 * p, t + 0.5);
    this.harmonyGain.gain.linearRampToValueAtTime(0.05 * p, t + 0.8);
  }

  // Sino de integração — arpejo pentatônico curto.
  chime(base = 440): void {
    if (!this.ctx || !this.master) return;
    const notes = [base, base * 1.25, base * 1.5];
    notes.forEach((freq, i) => {
      const ctx = this.ctx!;
      const t = ctx.currentTime + i * 0.18;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g);
      g.connect(this.master!);
      o.start(t);
      o.stop(t + 1.5);
    });
  }
}
