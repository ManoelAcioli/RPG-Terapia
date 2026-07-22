import Phaser from 'phaser';

// O Orbis — silhueta encapuzada de manto fluido, sempre escura
// para contrastar com o mundo (cinza ou colorido).
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyW: Phaser.Input.Keyboard.Key;
  private keySpace: Phaser.Input.Keyboard.Key;
  private coyoteTimer = 0;
  private jumpBuffer = 0;
  private wasOnGround = false;
  inputEnabled = true;

  static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('orbis')) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    // cabeça
    g.fillCircle(20, 12, 8);
    // manto que flui para baixo
    g.fillPoints(
      [
        { x: 13, y: 16 },
        { x: 27, y: 16 },
        { x: 34, y: 54 },
        { x: 6, y: 54 },
      ],
      true
    );
    g.fillEllipse(20, 53, 29, 10);
    g.generateTexture('orbis', 40, 60);
    g.destroy();
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    Player.ensureTexture(scene);
    super(scene, x, y, 'orbis');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setTint(0x2a2440);
    this.setDepth(10);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(22, 52).setOffset(9, 6);
    body.setMaxVelocity(260, 900);
    body.setDragX(1600);
    this.setCollideWorldBounds(true);

    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  get isMoving(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return Math.abs(body.velocity.x) > 40;
  }

  updatePlayer(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    const left = this.inputEnabled && (this.cursors.left.isDown || this.keyA.isDown);
    const right = this.inputEnabled && (this.cursors.right.isDown || this.keyD.isDown);
    const jumpDown =
      this.inputEnabled &&
      (this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown);

    if (left) {
      body.setAccelerationX(-1400);
      this.setFlipX(true);
    } else if (right) {
      body.setAccelerationX(1400);
      this.setFlipX(false);
    } else {
      body.setAccelerationX(0);
    }

    if (onGround) {
      this.coyoteTimer = 90;
      if (!this.wasOnGround) {
        // aterrissagem — squash suave
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.14,
          scaleY: 0.86,
          duration: 70,
          yoyo: true,
          onComplete: () => this.setScale(1, 1),
        });
      }
    } else {
      this.coyoteTimer -= delta;
    }

    const jumpJustDown =
      this.inputEnabled &&
      (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keyW) ||
        Phaser.Input.Keyboard.JustDown(this.keySpace));

    // buffer: um aperto pouco antes de aterrissar ainda vale
    if (jumpJustDown) {
      this.jumpBuffer = 130;
    } else {
      this.jumpBuffer -= delta;
    }

    if (this.jumpBuffer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(-560);
      this.coyoteTimer = 0;
      this.jumpBuffer = 0;
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.9,
        scaleY: 1.12,
        duration: 110,
        yoyo: true,
        onComplete: () => this.setScale(1, 1),
      });
    }
    // pulo variável — soltar corta a subida
    if (!jumpDown && body.velocity.y < -220) {
      body.setVelocityY(-220);
    }

    // respiração sutil quando parado no chão
    if (onGround && !this.isMoving) {
      this.setScale(1, 1 + Math.sin(time / 420) * 0.018);
    }

    this.wasOnGround = onGround;
  }
}
