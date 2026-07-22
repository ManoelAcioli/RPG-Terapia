import Phaser from 'phaser';

// Guarda quanto de cor cada era já recuperou (0 = cinza, 1 = cor plena).
// A integração de um eco anima o progresso da sua era e emite 'update'
// para que a cena repinte tudo que depende de cor.
export class ColorState extends Phaser.Events.EventEmitter {
  progress: [number, number, number] = [0, 0, 0];

  get global(): number {
    return (this.progress[0] + this.progress[1] + this.progress[2]) / 3;
  }

  integrate(scene: Phaser.Scene, era: number, duration = 2600): void {
    const from = this.progress[era];
    scene.tweens.addCounter({
      from,
      to: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: (tw) => {
        this.progress[era] = tw.getValue() ?? this.progress[era];
        this.emit('update');
      },
    });
  }
}
