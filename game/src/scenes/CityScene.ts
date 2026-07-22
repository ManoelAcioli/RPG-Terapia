import Phaser from 'phaser';
import {
  ERA,
  ERA_PALETTES,
  GRAY_SKY_TOP,
  GRAY_SKY_BOTTOM,
  lerpColor,
  toGray,
} from '../palette';
import { ColorState } from '../systems/ColorState';
import { AmbientAudio } from '../systems/AmbientAudio';
import { Player } from '../entities/Player';
import { Echo } from '../entities/Echo';

const WORLD_W = 6400;
const WORLD_H = 720;
const GROUND_Y = 640; // topo do chão

// Corredor de Sísifo
const LOOP_X0 = 5040;
const LOOP_X1 = 5760;
const LAMP_XS = [5140, 5270, 5400, 5530, 5660];

interface Tintable {
  obj: Phaser.GameObjects.Components.Tint & Phaser.GameObjects.GameObject;
  gray: number;
  full: number;
  era: number; // -1 = usa progresso global
}

interface Glowable {
  obj: Phaser.GameObjects.Sprite;
  accent: number;
  era: number;
}

export class CityScene extends Phaser.Scene {
  private player!: Player;
  private colorState = new ColorState();
  private audio = new AmbientAudio();

  private currentEra: number = ERA.TWENTIES;
  private eraGroups: Phaser.Physics.Arcade.StaticGroup[] = [];
  private commonGroup!: Phaser.Physics.Arcade.StaticGroup;
  private pendingEnable: Phaser.Physics.Arcade.Sprite[] = [];

  private tintables: Tintable[] = [];
  private glowables: Glowable[] = [];

  private sky!: Phaser.GameObjects.Graphics;
  private skyTopCur = GRAY_SKY_TOP;
  private skyBotCur = GRAY_SKY_BOTTOM;
  private skyline!: Phaser.GameObjects.TileSprite;

  private echoes: Echo[] = [];
  private syncRing!: Phaser.GameObjects.Graphics;
  private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private hud!: Phaser.GameObjects.Graphics;
  private hints!: Phaser.GameObjects.Container;

  // Corredor de Sísifo
  private loopBroken = false;
  private loopCount = 0;
  private anomalousLamp = 1;
  private corridorLamps: Phaser.GameObjects.Sprite[] = [];
  private corridorGlows: Phaser.GameObjects.Sprite[] = [];
  private anomalyEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private teleporting = false;

  // Reflexão (o momento híbrido)
  private reflecting = false;
  private reflectionShown: boolean[] = [false, false, false];
  private finaleStarted = false;

  constructor() {
    super('city');
  }

  create(): void {
    this.buildTextures();
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    this.sky = this.add.graphics().setScrollFactor(0).setDepth(-100);
    this.drawSky();

    this.skyline = this.add
      .tileSprite(0, WORLD_H - 150, 1280, 320, 'skyline')
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(-90)
      .setAlpha(0.55);
    this.registerTint(this.skyline, 0x3c3c46, 0x4a3f52, -1);

    this.buildWorld();
    this.buildCorridor();
    this.buildFinale();

    this.player = new Player(this, 200, GROUND_Y - 60);
    this.physics.add.collider(this.player, this.commonGroup);
    this.eraGroups.forEach((g) => this.physics.add.collider(this.player, g));

    this.buildEchoes();
    this.buildDust();
    this.buildTrail();

    this.syncRing = this.add.graphics().setDepth(20);

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(120, 80);
    this.cameras.main.fadeIn(1200, 11, 11, 16);

    this.hud = this.add.graphics().setScrollFactor(0).setDepth(60);
    this.drawHud();
    this.buildHints();

    this.applyEra(this.currentEra, true);

    // trocar de era: E
    this.input.keyboard!.on('keydown-E', () => {
      if (this.reflecting) return;
      this.switchEra(((this.currentEra + 1) % 3) as number);
    });

    // primeiro gesto liga o áudio (política de autoplay)
    this.input.keyboard!.once('keydown', () => this.audio.start());
    this.input.once('pointerdown', () => this.audio.start());

    this.colorState.on('update', () => {
      this.refreshTints();
      this.audio.setBrightness(this.colorState.global);
    });

    // gancho de teste automatizado — só existe com #debug na URL
    if (window.location.hash.includes('debug')) {
      (window as unknown as Record<string, unknown>).__ecos = {
        state: () => ({
          x: this.player.x,
          y: this.player.y,
          era: this.currentEra,
          progress: [...this.colorState.progress],
          loopBroken: this.loopBroken,
          loopCount: this.loopCount,
          finale: this.finaleStarted,
          reflecting: this.reflecting,
          echoes: this.echoes.map((e) => ({
            x: Math.round(e.x),
            sync: e.syncMeter,
            done: e.integrated,
          })),
        }),
        teleport: (x: number) => {
          this.player.setPosition(x, GROUND_Y - 80);
          (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        },
      };
    }
  }

  // ------------------------------------------------------------------
  // Texturas procedurais (nenhum asset externo)
  // ------------------------------------------------------------------
  private buildTextures(): void {
    const t = this.textures;
    if (!t.exists('px')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
      g.generateTexture('px', 2, 2);
      g.destroy();
    }
    if (!t.exists('plat')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xbababa, 1).fillRoundedRect(0, 2, 100, 18, 6);
      g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 100, 6, 3);
      g.generateTexture('plat', 100, 20);
      g.destroy();
    }
    if (!t.exists('glow')) {
      const size = 64;
      const canvas = t.createCanvas('glow', size, size)!;
      const ctx = canvas.getContext();
      const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.4, 'rgba(255,255,255,0.35)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
      canvas.refresh();
    }
    if (!t.exists('lamp')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x7a7a7a, 1).fillRect(13, 20, 4, 80); // poste
      g.fillStyle(0x9a9a9a, 1).fillRect(6, 96, 18, 6); // base
      g.fillStyle(0xffffff, 1).fillCircle(15, 14, 9); // cabeça
      g.generateTexture('lamp', 30, 104);
      g.destroy();
    }
    if (!t.exists('neon')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x333333, 1).fillRoundedRect(0, 0, 90, 26, 6);
      g.fillStyle(0xffffff, 1).fillRoundedRect(5, 5, 80, 16, 5);
      g.generateTexture('neon', 90, 26);
      g.destroy();
    }
    if (!t.exists('orb')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 0.9).fillCircle(12, 12, 8);
      g.lineStyle(2, 0xffffff, 0.4).strokeCircle(12, 12, 11);
      g.generateTexture('orb', 24, 24);
      g.destroy();
    }
    // silhueta distante da cidade — faixa que se repete
    if (!t.exists('skyline')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      let x = 0;
      let i = 0;
      while (x < 1024) {
        const w = 40 + ((i * 37) % 70);
        const h = 60 + ((i * 53) % 200);
        g.fillStyle(0xffffff, 1).fillRect(x, 320 - h, w, h);
        if (i % 3 === 0) g.fillRect(x + w / 2 - 3, 320 - h - 18, 6, 18);
        x += w + 14;
        i++;
      }
      g.generateTexture('skyline', 1024, 320);
      g.destroy();
    }
    // prédio genérico com janelas (tons de cinza → recebem tint)
    for (let v = 0; v < 3; v++) {
      const key = `bldg${v}`;
      if (t.exists(key)) continue;
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      const w = 140 + v * 30;
      const h = 260 + v * 60;
      g.fillStyle(0x8f8f8f, 1).fillRect(0, 0, w, h);
      g.fillStyle(0x6f6f6f, 1).fillRect(0, 0, w, 10);
      for (let wy = 26; wy < h - 20; wy += 44) {
        for (let wx = 16; wx < w - 26; wx += 34) {
          const lit = (wx * 7 + wy * 13 + v * 5) % 11 < 3;
          g.fillStyle(lit ? 0xdedede : 0x565656, 1);
          g.fillRect(wx, wy, 18, 26);
        }
      }
      g.generateTexture(key, w, h);
      g.destroy();
    }
    // arco do corredor de Sísifo
    if (!t.exists('arch')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x9a9a9a, 1);
      g.fillRect(0, 30, 14, 190);
      g.fillRect(86, 30, 14, 190);
      g.fillRect(0, 14, 100, 18);
      g.generateTexture('arch', 100, 220);
      g.destroy();
    }
    // relógio da praça final — espiral de Kairoon
    if (!t.exists('clock')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.lineStyle(6, 0xffffff, 1).strokeCircle(110, 110, 100);
      g.lineStyle(3, 0xffffff, 0.8);
      for (let a = 0; a < Math.PI * 6; a += 0.12) {
        const r = 8 + (a / (Math.PI * 6)) * 86;
        const px = 110 + Math.cos(a) * r;
        const py = 110 + Math.sin(a) * r;
        g.fillStyle(0xffffff, 0.85).fillCircle(px, py, 2.2);
      }
      g.generateTexture('clock', 220, 220);
      g.destroy();
    }
  }

  // ------------------------------------------------------------------
  // Mundo
  // ------------------------------------------------------------------
  private registerTint(
    obj: Tintable['obj'],
    gray: number,
    full: number,
    era: number
  ): void {
    this.tintables.push({ obj, gray, full, era });
    (obj as unknown as Phaser.GameObjects.Sprite).setTint(gray);
  }

  private refreshTints(): void {
    for (const t of this.tintables) {
      const p = t.era >= 0 ? this.colorState.progress[t.era] : this.colorState.global;
      (t.obj as unknown as Phaser.GameObjects.Sprite).setTint(
        lerpColor(t.gray, t.full, p)
      );
    }
    for (const gl of this.glowables) {
      const p =
        gl.era >= 0 ? this.colorState.progress[gl.era] : this.colorState.global;
      gl.obj.setAlpha(0.18 + 0.5 * p);
      gl.obj.setTint(lerpColor(0xaaaaaa, gl.accent, p));
    }
    this.drawHud();
  }

  private ground(x0: number, x1: number, era: number, palette: number): void {
    const w = x1 - x0;
    const spr = this.commonGroup.create(x0 + w / 2, GROUND_Y + 40, 'px') as
      Phaser.Physics.Arcade.Sprite;
    spr.setScale(w / 2, 40).refreshBody();
    spr.setDepth(-5);
    this.registerTint(spr, toGray(palette), palette, era);
    // linha de topo levemente mais clara
    const top = this.add
      .image(x0 + w / 2, GROUND_Y + 1, 'px')
      .setScale(w / 2, 1.5)
      .setDepth(-4);
    this.registerTint(top, 0x77777e, lerpColor(palette, 0xffffff, 0.35), era);
  }

  private platform(
    x: number,
    y: number,
    widthScale: number,
    era: number
  ): Phaser.Physics.Arcade.Sprite {
    const pal = era >= 0 ? ERA_PALETTES[era].platform : 0x9a9a9a;
    const group = era >= 0 ? this.eraGroups[era] : this.commonGroup;
    const spr = group.create(x, y, 'plat') as Phaser.Physics.Arcade.Sprite;
    spr.setScale(widthScale, 1).refreshBody();
    spr.setDepth(-3);
    // atravessável por baixo (one-way): sólida apenas ao pousar por cima
    const body = spr.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    this.registerTint(spr, toGray(pal), pal, era >= 0 ? era : -1);
    return spr;
  }

  private wall(x: number, topY: number, w: number, era: number, palette: number): void {
    const h = GROUND_Y - topY;
    const spr = this.commonGroup.create(x, topY + h / 2, 'px') as
      Phaser.Physics.Arcade.Sprite;
    spr.setScale(w / 2, h / 2).refreshBody();
    spr.setDepth(-6);
    this.registerTint(spr, toGray(palette), palette, era);
  }

  private buildWorld(): void {
    this.commonGroup = this.physics.add.staticGroup();
    this.eraGroups = [
      this.physics.add.staticGroup(),
      this.physics.add.staticGroup(),
      this.physics.add.staticGroup(),
    ];

    // chão por distrito (cada trecho colore com a sua era)
    this.ground(0, 2200, ERA.TWENTIES, 0x8a6248);
    this.ground(2200, 3800, ERA.EIGHTIES, 0x5b5680);
    this.ground(3800, 5000, ERA.FUTURE, 0x5f7d8c);
    this.ground(5000, 5800, -1, 0x777777); // corredor
    this.ground(5800, WORLD_W, -1, 0xa08a5f); // praça final

    // ---- Distrito Anos 20 (0–2200) ----
    const p20 = ERA_PALETTES[ERA.TWENTIES];
    this.buildBuildings(300, 2100, ERA.TWENTIES, 0);
    for (const lx of [500, 950, 1400, 1850]) {
      this.decorLamp(lx, 'lamp', ERA.TWENTIES, p20.accent);
    }
    // varandas/toldos dos anos 20 — a escalada de saída
    this.platform(600, 520, 1.1, ERA.TWENTIES);
    this.platform(1150, 500, 1.2, ERA.TWENTIES);
    this.platform(1980, 555, 1.3, ERA.TWENTIES);
    this.platform(2065, 465, 1.3, ERA.TWENTIES);
    this.platform(2148, 380, 1.3, ERA.TWENTIES);
    // muro que fecha o distrito — só se atravessa por cima
    this.wall(2205, 370, 60, ERA.TWENTIES, p20.building);

    // ---- Distrito Anos 80 (2200–3800) ----
    const p80 = ERA_PALETTES[ERA.EIGHTIES];
    this.buildBuildings(2350, 3700, ERA.EIGHTIES, 1);
    for (const nx of [2600, 3050, 3500]) {
      this.decorLamp(nx, 'neon', ERA.EIGHTIES, p80.accent);
    }
    this.platform(2700, 530, 1.1, ERA.EIGHTIES);
    this.platform(3200, 510, 1.2, ERA.EIGHTIES);
    // letreiros-escada de saída
    this.platform(3565, 555, 1.3, ERA.EIGHTIES);
    this.platform(3652, 465, 1.3, ERA.EIGHTIES);
    this.platform(3738, 378, 1.3, ERA.EIGHTIES);
    this.wall(3795, 368, 60, ERA.EIGHTIES, p80.building);

    // ---- Distrito Futuro (3800–5000) ----
    const pf = ERA_PALETTES[ERA.FUTURE];
    this.buildBuildings(3950, 4900, ERA.FUTURE, 2);
    for (const ox of [4150, 4500, 4820]) {
      this.decorLamp(ox, 'orb', ERA.FUTURE, pf.accent);
    }
    this.platform(4250, 540, 1.1, ERA.FUTURE);
    this.platform(4600, 515, 1.0, ERA.FUTURE);
    // plataformas flutuantes de saída
    this.platform(4755, 560, 1.25, ERA.FUTURE);
    this.platform(4845, 470, 1.25, ERA.FUTURE);
    this.platform(4935, 378, 1.25, ERA.FUTURE);
    this.wall(4995, 368, 60, ERA.FUTURE, pf.building);
  }

  private buildBuildings(x0: number, x1: number, era: number, variant: number): void {
    const pal = ERA_PALETTES[era];
    let x = x0;
    let i = 0;
    while (x < x1) {
      const key = `bldg${(variant + i) % 3}`;
      const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
      const spr = this.add
        .image(x, GROUND_Y, key)
        .setOrigin(0.5, 1)
        .setDepth(-30)
        .setAlpha(0.9);
      this.registerTint(spr, toGray(pal.building), pal.building, era);
      x += src.width + 60 + ((i * 31) % 50);
      i++;
    }
  }

  private decorLamp(x: number, key: string, era: number, accent: number): void {
    const spr = this.add.image(x, GROUND_Y, key).setOrigin(0.5, 1).setDepth(-10);
    if (key === 'neon') spr.setY(GROUND_Y - 240); // letreiros ficam nos prédios
    if (key === 'orb') spr.setY(GROUND_Y - 170);
    const pal = ERA_PALETTES[era];
    this.registerTint(spr, 0x8b8b92, lerpColor(pal.accent, 0xffffff, 0.2), era);
    // o brilho fica no centro luminoso de cada fonte de luz
    const glowY =
      key === 'lamp' ? GROUND_Y - 90 : key === 'neon' ? GROUND_Y - 253 : GROUND_Y - 182;
    const glow = this.add
      .sprite(x, glowY, 'glow')
      .setScale(2.4)
      .setDepth(-9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.18);
    this.glowables.push({ obj: glow, accent, era });
  }

  // ------------------------------------------------------------------
  // Corredor de Sísifo (5000–5800)
  // ------------------------------------------------------------------
  private buildCorridor(): void {
    for (let x = LOOP_X0 + 20; x < LOOP_X1; x += 130) {
      const arch = this.add
        .image(x, GROUND_Y, 'arch')
        .setOrigin(0.5, 1)
        .setDepth(-15);
      this.registerTint(arch, 0x5c5c62, 0xcbb47e, -1);
    }
    LAMP_XS.forEach((lx) => {
      const lamp = this.add.image(lx, GROUND_Y, 'lamp').setOrigin(0.5, 1).setDepth(-8);
      lamp.setTint(0x77777c);
      this.corridorLamps.push(lamp as unknown as Phaser.GameObjects.Sprite);
      const glow = this.add
        .sprite(lx, GROUND_Y - 90, 'glow')
        .setScale(2.0)
        .setDepth(-7)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.08);
      this.corridorGlows.push(glow);
    });
    this.setAnomalousLamp(1);
  }

  private setAnomalousLamp(idx: number): void {
    this.anomalousLamp = idx;
    const accent = 0xffc873;
    this.corridorLamps.forEach((l, i) => {
      l.setTint(i === idx ? accent : 0x77777c);
    });
    this.corridorGlows.forEach((g, i) => {
      g.setAlpha(i === idx ? 0.5 : 0.08);
      g.setTint(i === idx ? accent : 0xffffff);
    });
    this.anomalyEmitter?.destroy();
    this.anomalyEmitter = this.add.particles(LAMP_XS[idx], GROUND_Y - 90, 'glow', {
      speed: { min: 6, max: 22 },
      scale: { start: 0.32, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1600,
      frequency: 130,
      tint: accent,
      blendMode: Phaser.BlendModes.ADD,
    });
    this.anomalyEmitter.setDepth(-6);
  }

  private breakLoop(): void {
    this.loopBroken = true;
    this.anomalyEmitter?.destroy();
    this.audio.chime(523.25);
    this.cameras.main.flash(700, 255, 230, 180, false);
    // o corredor inteiro aquece
    this.corridorLamps.forEach((l, i) => {
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 1600,
        delay: i * 120,
        onUpdate: (tw) => {
          const v = tw.getValue() ?? 0;
          l.setTint(lerpColor(0x77777c, 0xffc873, v));
          this.corridorGlows[i].setAlpha(0.08 + 0.45 * v);
          this.corridorGlows[i].setTint(lerpColor(0xffffff, 0xffc873, v));
        },
      });
    });
    this.time.delayedCall(1400, () => {
      this.showReflection('repetir ou perceber —\no que você escolhe levar daqui?');
    });
  }

  private updateCorridor(): void {
    if (this.loopBroken || this.teleporting) return;
    const px = this.player.x;
    if (px < LOOP_X0 - 40 || px > LOOP_X1 + 40) return;

    // percebeu o detalhe diferente? é preciso alcançá-lo:
    // um salto até a cabeça do lampião anômalo — gesto deliberado,
    // não se quebra um ciclo apenas passando por ele.
    const lampX = LAMP_XS[this.anomalousLamp];
    const nearX = Math.abs(px - lampX) < 46;
    const reaching = this.player.y < GROUND_Y - 86;
    if (nearX && reaching) {
      this.breakLoop();
      return;
    }

    // chegou ao fim sem perceber → o ciclo recomeça
    if (px > LOOP_X1) {
      this.teleporting = true;
      this.loopCount++;
      this.cameras.main.fadeOut(130, 11, 11, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.player.setX(LOOP_X0 + 30);
        this.setAnomalousLamp((this.loopCount * 2 + 1) % LAMP_XS.length);
        this.cameras.main.fadeIn(180, 11, 11, 16);
        this.teleporting = false;
      });
    }
  }

  // ------------------------------------------------------------------
  // Praça final
  // ------------------------------------------------------------------
  private buildFinale(): void {
    const clock = this.add
      .image(6100, GROUND_Y - 240, 'clock')
      .setDepth(-12)
      .setAlpha(0.85);
    this.registerTint(clock, 0x6a6a72, 0xffd98a, -1);
    this.tweens.add({
      targets: clock,
      angle: 360,
      duration: 120000,
      repeat: -1,
    });
    const glow = this.add
      .sprite(6100, GROUND_Y - 240, 'glow')
      .setScale(7)
      .setDepth(-13)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.1);
    this.glowables.push({ obj: glow, accent: 0xffd98a, era: -1 });
  }

  private startFinale(): void {
    if (this.finaleStarted) return;
    this.finaleStarted = true;
    // toda cor que faltar retorna
    for (let e = 0; e < 3; e++) {
      if (this.colorState.progress[e] < 1) this.colorState.integrate(this, e, 3000);
    }
    this.audio.chime(659.25);
    const bloom = this.add.particles(6100, GROUND_Y - 240, 'glow', {
      speed: { min: 30, max: 140 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 2600,
      frequency: 30,
      tint: [0xffc873, 0x2de2e6, 0x7df9ff, 0xe75480],
      blendMode: Phaser.BlendModes.ADD,
    });
    bloom.setDepth(30);
    this.time.delayedCall(9000, () => bloom.stop());

    this.time.delayedCall(3600, () => {
      const cam = this.cameras.main;
      const txt = this.add
        .text(cam.width / 2, cam.height / 2 - 140, 'o primeiro eco se aquieta', {
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: '30px',
          color: '#e8e2d4',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(90)
        .setAlpha(0);
      this.tweens.add({ targets: txt, alpha: 0.95, duration: 2000 });
      this.tweens.add({ targets: txt, alpha: 0, duration: 2000, delay: 7000 });
    });
  }

  // ------------------------------------------------------------------
  // Ecos
  // ------------------------------------------------------------------
  private buildEchoes(): void {
    this.echoes = [
      new Echo(this, 1600, 1930, GROUND_Y - 30, ERA.TWENTIES),
      new Echo(this, 2850, 3180, GROUND_Y - 30, ERA.EIGHTIES),
      new Echo(this, 4330, 4660, GROUND_Y - 30, ERA.FUTURE),
    ];
  }

  private integrateEcho(echo: Echo): void {
    echo.integrated = true;
    this.audio.chime([440, 493.88, 554.37][echo.era]);
    this.colorState.integrate(this, echo.era);

    // o eco se dissolve em luz que se espalha pelo mundo
    const accent = ERA_PALETTES[echo.era].accent;
    const burst = this.add.particles(echo.x, echo.y - 20, 'glow', {
      speed: { min: 40, max: 220 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1800,
      quantity: 4,
      frequency: 20,
      tint: accent,
      blendMode: Phaser.BlendModes.ADD,
    });
    burst.setDepth(25);
    this.time.delayedCall(1500, () => burst.stop());
    this.tweens.add({
      targets: echo,
      alpha: 0,
      y: echo.y - 60,
      duration: 1600,
      ease: 'Sine.easeOut',
    });

    const questions = [
      'o que essa versão de você\ndeixou para trás?',
      'esse caminho…\nvocê já o percorreu antes?',
      'o que muda quando você\nolha de outro tempo?',
    ];
    if (!this.reflectionShown[echo.era]) {
      this.reflectionShown[echo.era] = true;
      this.time.delayedCall(2200, () => this.showReflection(questions[echo.era]));
    }
  }

  // ------------------------------------------------------------------
  // Reflexão — o momento híbrido: pausa, uma pergunta, silêncio.
  // Qualquer tecla dissolve. Nunca bloqueia por mais de alguns segundos.
  // ------------------------------------------------------------------
  private showReflection(text: string): void {
    if (this.reflecting || this.finaleStarted) {
      if (!this.reflecting && this.finaleStarted) {
        // na praça final ainda mostramos a última pergunta
      } else {
        return;
      }
    }
    this.reflecting = true;
    this.player.inputEnabled = false;

    const cam = this.cameras.main;
    const dim = this.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x0b0b10, 1)
      .setScrollFactor(0)
      .setDepth(80)
      .setAlpha(0);
    const txt = this.add
      .text(cam.width / 2, cam.height / 2, text, {
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontSize: '28px',
        color: '#d8d4c8',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)
      .setAlpha(0);

    this.tweens.add({ targets: dim, alpha: 0.62, duration: 900 });
    this.tweens.add({ targets: txt, alpha: 1, duration: 1400, delay: 500 });

    let done = false;
    const dismiss = () => {
      if (done) return;
      done = true;
      this.tweens.add({
        targets: [dim, txt],
        alpha: 0,
        duration: 900,
        onComplete: () => {
          dim.destroy();
          txt.destroy();
        },
      });
      this.reflecting = false;
      this.player.inputEnabled = true;
    };
    // pulável após a pergunta aparecer; auto-dissolve depois de 9s
    this.time.delayedCall(1800, () => {
      this.input.keyboard!.once('keydown', dismiss);
    });
    this.time.delayedCall(9000, dismiss);
  }

  // ------------------------------------------------------------------
  // Eras
  // ------------------------------------------------------------------
  private switchEra(era: number): void {
    if (era === this.currentEra) return;
    this.currentEra = era;
    this.applyEra(era, false);

    // onda que parte do Orbis
    const ring = this.add.graphics().setDepth(40);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 450,
      ease: 'Sine.easeOut',
      onUpdate: (tw) => {
        const v = tw.getValue() ?? 0;
        ring.clear();
        ring.lineStyle(3 * (1 - v) + 1, ERA_PALETTES[era].accent, 0.5 * (1 - v));
        ring.strokeCircle(this.player.x, this.player.y - 20, 30 + v * 420);
      },
      onComplete: () => ring.destroy(),
    });
    this.cameras.main.flash(120, 20, 20, 28, false);
    this.drawHud();
  }

  private applyEra(era: number, instant: boolean): void {
    this.eraGroups.forEach((group, gi) => {
      const active = gi === era;
      group.children.each((child) => {
        const spr = child as Phaser.Physics.Arcade.Sprite;
        const body = spr.body as Phaser.Physics.Arcade.StaticBody;
        if (active) {
          // não solidificar em cima do jogador
          const overlapping =
            this.player &&
            Phaser.Geom.Intersects.RectangleToRectangle(
              spr.getBounds(),
              this.player.getBounds()
            );
          if (overlapping) {
            this.pendingEnable.push(spr);
          } else {
            body.enable = true;
          }
        } else {
          body.enable = false;
        }
        const targetAlpha = active ? 1 : 0.13;
        if (instant) {
          spr.setAlpha(targetAlpha);
        } else {
          this.tweens.add({ targets: spr, alpha: targetAlpha, duration: 260 });
        }
        return true;
      });
    });
  }

  // ------------------------------------------------------------------
  // Céu, poeira, trilha, HUD
  // ------------------------------------------------------------------
  private drawSky(): void {
    this.sky.clear();
    this.sky.fillGradientStyle(
      this.skyTopCur,
      this.skyTopCur,
      this.skyBotCur,
      this.skyBotCur,
      1
    );
    this.sky.fillRect(0, 0, 1280, 720);
  }

  private updateSky(dt: number): void {
    const pal = ERA_PALETTES[this.currentEra];
    const p = this.colorState.progress[this.currentEra];
    const targetTop = lerpColor(GRAY_SKY_TOP, pal.skyTop, p);
    const targetBot = lerpColor(GRAY_SKY_BOTTOM, pal.skyBottom, p);
    const k = 1 - Math.exp(-dt * 0.004);
    const newTop = lerpColor(this.skyTopCur, targetTop, k);
    const newBot = lerpColor(this.skyBotCur, targetBot, k);
    if (newTop !== this.skyTopCur || newBot !== this.skyBotCur) {
      this.skyTopCur = newTop;
      this.skyBotCur = newBot;
      this.drawSky();
    }
  }

  private buildDust(): void {
    const emitter = this.add.particles(0, 0, 'glow', {
      x: { min: 0, max: 1280 },
      y: { min: 0, max: 680 },
      scale: { min: 0.04, max: 0.12 },
      alpha: { start: 0.16, end: 0 },
      lifespan: { min: 5000, max: 10000 },
      speedY: { min: -14, max: -4 },
      speedX: { min: -6, max: 6 },
      frequency: 220,
      blendMode: Phaser.BlendModes.ADD,
    });
    emitter.setScrollFactor(0);
    emitter.setDepth(-50);
  }

  private buildTrail(): void {
    this.trailEmitter = this.add.particles(0, 0, 'glow', {
      scale: { start: 0.18, end: 0 },
      alpha: { start: 0.22, end: 0 },
      lifespan: 700,
      frequency: 55,
      speedY: { min: -10, max: 10 },
      blendMode: Phaser.BlendModes.ADD,
      follow: undefined,
    });
    this.trailEmitter.setDepth(8);
    this.trailEmitter.stop();
  }

  private drawHud(): void {
    this.hud.clear();
    const cx = 640;
    const y = 28;
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * 26;
      const active = i === this.currentEra;
      const p = this.colorState.progress[i];
      const color = lerpColor(0x8b8b92, ERA_PALETTES[i].accent, p);
      this.hud.fillStyle(color, active ? 1 : 0.45);
      this.hud.fillCircle(x, y, active ? 6 : 4);
      if (active) {
        this.hud.lineStyle(1.5, color, 0.8);
        this.hud.strokeCircle(x, y, 10);
      }
    }
  }

  private buildHints(): void {
    // pictogramas mínimos de controle, que se dissolvem sozinhos
    this.hints = this.add.container(200, 400).setDepth(50);
    const g = this.add.graphics();
    g.lineStyle(2, 0xd8d4c8, 0.8);
    // setas ← →
    g.beginPath();
    g.moveTo(-46, 40).lineTo(-66, 40).lineTo(-58, 33);
    g.moveTo(-66, 40).lineTo(-58, 47);
    g.moveTo(46, 40).lineTo(66, 40).lineTo(58, 33);
    g.moveTo(66, 40).lineTo(58, 47);
    // seta ↑
    g.moveTo(0, 18).lineTo(0, -2).lineTo(-7, 6);
    g.moveTo(0, -2).lineTo(7, 6);
    g.strokePath();
    this.hints.add(g);
    const eKey = this.add.graphics();
    eKey.lineStyle(2, 0xd8d4c8, 0.8).strokeRoundedRect(-14, 68, 28, 28, 6);
    this.hints.add(eKey);
    const eTxt = this.add
      .text(0, 82, 'E', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#d8d4c8',
      })
      .setOrigin(0.5);
    this.hints.add(eTxt);
    const spiral = this.add
      .text(0, 110, '≈ tempo', {
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontSize: '13px',
        color: '#9a968c',
      })
      .setOrigin(0.5);
    this.hints.add(spiral);
    this.tweens.add({
      targets: this.hints,
      alpha: 0,
      delay: 14000,
      duration: 2500,
    });
  }

  // ------------------------------------------------------------------
  update(time: number, delta: number): void {
    this.player.updatePlayer(time, delta);

    // plataformas que esperavam o jogador sair de cima
    if (this.pendingEnable.length > 0) {
      this.pendingEnable = this.pendingEnable.filter((spr) => {
        const overlapping = Phaser.Geom.Intersects.RectangleToRectangle(
          spr.getBounds(),
          this.player.getBounds()
        );
        if (!overlapping) {
          (spr.body as Phaser.Physics.Arcade.StaticBody).enable = true;
          return false;
        }
        return true;
      });
    }

    // ecos
    this.syncRing.clear();
    for (const echo of this.echoes) {
      echo.updateEcho(time, delta, this.player);
      if (echo.integrated) continue;
      if (echo.syncMeter > 0.02) {
        // anel que se fecha em volta do eco enquanto caminham juntos
        const accent = ERA_PALETTES[echo.era].accent;
        this.syncRing.lineStyle(2.5, accent, 0.35 + echo.syncMeter * 0.5);
        this.syncRing.beginPath();
        this.syncRing.arc(
          echo.x,
          echo.y - 24,
          34,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * echo.syncMeter
        );
        this.syncRing.strokePath();
        if (echo.syncMeter >= 1) {
          this.integrateEcho(echo);
        }
      }
    }

    // trilha de partículas ao se mover
    if (this.player.isMoving) {
      this.trailEmitter.start();
      this.trailEmitter.setPosition(this.player.x, this.player.y + 18);
      const p = this.colorState.progress[this.currentEra];
      this.trailEmitter.setParticleTint(
        lerpColor(0x9a9aa4, ERA_PALETTES[this.currentEra].accent, p)
      );
    } else {
      this.trailEmitter.stop();
    }

    this.updateCorridor();
    this.updateSky(delta);
    this.skyline.tilePositionX = this.cameras.main.scrollX * 0.15;

    // segurança: nunca cair para fora do mundo
    if (this.player.y > WORLD_H + 40) {
      this.player.setPosition(this.player.x - 60, GROUND_Y - 80);
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // praça final
    if (!this.finaleStarted && this.loopBroken && this.player.x > 6000) {
      this.startFinale();
    }
  }
}
