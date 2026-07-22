import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // espiral de Kairoon, quase imperceptível, girando ao fundo
    const spiral = this.add.graphics().setAlpha(0.12);
    spiral.lineStyle(1.5, 0x8a8fa0, 1);
    for (let a = 0; a < Math.PI * 8; a += 0.08) {
      const r = 4 + (a / (Math.PI * 8)) * 220;
      spiral.fillStyle(0x8a8fa0, 0.8);
      spiral.fillCircle(width / 2 + Math.cos(a) * r, height / 2 + Math.sin(a) * r, 1.4);
    }
    this.tweens.add({
      targets: spiral,
      angle: 360,
      duration: 240000,
      repeat: -1,
    });
    spiral.setPosition(0, 0);

    const title = this.add
      .text(width / 2, height / 2 - 60, 'E C O S   D O   E T E R N O', {
        fontFamily: 'Georgia, serif',
        fontSize: '42px',
        color: '#d8d4c8',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(width / 2, height / 2 + 4, 'a cidade suspensa no tempo', {
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fontSize: '20px',
        color: '#9a968c',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const hint = this.add
      .text(width / 2, height / 2 + 120, 'pressione qualquer tecla', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: '#6f6b64',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, duration: 2200 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 2200, delay: 900 });
    this.tweens.add({
      targets: hint,
      alpha: { from: 0, to: 0.85 },
      duration: 1400,
      delay: 1800,
      yoyo: true,
      repeat: -1,
    });

    const begin = () => {
      this.cameras.main.fadeOut(900, 11, 11, 16);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('city');
      });
    };
    this.input.keyboard!.once('keydown', begin);
    this.input.once('pointerdown', begin);
  }
}
