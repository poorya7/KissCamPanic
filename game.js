import MainScene from "./scenes/MainScene.js";
import ScoreService from "./services/ScoreService.js"; // ⬅️ add this at the top

window.onload = () => {
  const wrapper = document.getElementById("game-wrapper");
  const wrapperSize = {
    width: wrapper.clientWidth,
    height: wrapper.clientHeight,
  };

  const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.NONE,
      width: wrapperSize.width,
      height: wrapperSize.height,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      pixelArt: true,
      roundPixels: true
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [MainScene],
    parent: "game-wrapper"
  };

  const game = new Phaser.Game(config);

  // ⬇️ Call this after game is created
  if (window.fontsReady) {
    ScoreService.getTopScores();
  } else {
    document.fonts.ready.then(() => {
      ScoreService.getTopScores();
    });
  }

  const muteBtn = document.getElementById("mute-btn");
  let isMuted = false;

  setTimeout(() => {
    const scene = game.scene.scenes[0];
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      scene.sound.mute = isMuted;
      muteBtn.src = isMuted
        ? "sprites/UI/mute.png"
        : "sprites/UI/unmute.png";
    });
  }, 500);
};
