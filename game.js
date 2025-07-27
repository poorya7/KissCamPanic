import MainScene from "./scenes/MainScene.js";

function getWrapperSize() {
  const wrapper = document.getElementById("game-wrapper");
  return {
    width: wrapper.clientWidth,
    height: wrapper.clientHeight,
  };
}

const wrapperSize = getWrapperSize();

const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.NONE,
    width: wrapperSize.width,
    height: wrapperSize.height,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene],
  parent: "game-wrapper"  // ✅ Phaser will handle placement
};

new Phaser.Game(config);
