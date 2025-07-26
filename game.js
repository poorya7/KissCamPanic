import MainScene from "./scenes/MainScene.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE, // dynamically fit screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene]
};

new Phaser.Game(config);
