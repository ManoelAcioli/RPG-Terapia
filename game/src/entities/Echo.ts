import Phaser from 'phaser';
import { Player } from './Player';

// Um eco: outra versão do Orbis, presa num percurso que se repete.
// Caminhar junto dele por alguns segundos o integra — e a cor volta.
export class Echo extends Phaser.GameObjects.Sprite {
  readonly era: number;
  private xa: number;
  private xb: number;
  private speed: number;
  private dir = 1;
  integrated = false;
  syncMeter = 0; // 0..1 — quanto o jogador já "caminhou junto"

  constructor(
    scene: Phaser.Scene,
    xa: number,
    xb: number,
    y: number,
    era: number,
    speed = 55
  ) {
    Player.ensureTexture(scene);
    super(scene, xa, y, 'orbis');
    scene.add.existing(this);
    this.era = era;
    this.xa = xa;
    this.xb = xb;
    this.speed = speed;
    this.setAlpha(0.32);
    this.setTint(0xbfc3d4);
    this.setDepth(9);
  }

  updateEcho(time: number, delta: number, player: Player): void {
    if (this.integrated) return;

    this.x += (this.dir * this.speed * delta) / 1000;
    if (this.x > this.xb) {
      this.x = this.xb;
      this.dir = -1;
    } else if (this.x < this.xa) {
      this.x = this.xa;
      this.dir = 1;
    }
    this.setFlipX(this.dir < 0);
    this.setAlpha(0.26 + Math.sin(time / 500) * 0.08);

    // sincronia: perto e em movimento junto (ou parado bem perto)
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 85) {
      this.syncMeter = Math.min(1, this.syncMeter + delta / 1900);
    } else {
      this.syncMeter = Math.max(0, this.syncMeter - delta / 900);
    }
  }
}
