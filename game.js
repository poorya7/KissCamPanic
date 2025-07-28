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

const game = new Phaser.Game(config);


const muteBtn = document.getElementById("mute-btn");
let isMuted = false;

// Wait for the scene to start before accessing sound
setTimeout(() => {
  const scene = game.scene.scenes[0]; // This is your MainScene instance

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    scene.sound.mute = isMuted;
    muteBtn.src = isMuted
      ? "sprites/UI/mute.png"
      : "sprites/UI/unmute.png";
  });
}, 500); // Wait half a second — safe enough for scene to be created
