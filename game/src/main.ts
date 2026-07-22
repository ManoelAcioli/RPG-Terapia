import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { CityScene } from './scenes/CityScene';

new Phaser.Game({
  // #canvas força o renderer 2D (útil para testes headless e máquinas fracas)
  type: window.location.hash.includes('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#0b0b10',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1200 },
      debug: false,
    },
  },
  scene: [TitleScene, CityScene],
});
