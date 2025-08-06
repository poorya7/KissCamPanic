import MainScene from "./scenes/MainScene.js";
import ScoreService from "./services/ScoreService.js";
import SoundManager from "./utils/SoundManager.js"; // ✅ make sure this path is correct

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

  if (window.fontsReady) {
    ScoreService.getTopScores();
  } else {
    document.fonts.ready.then(() => {
      ScoreService.getTopScores();
    });
  }

  const muteBtn = document.getElementById("mute-btn");
  const sfxBtn = document.getElementById("mute-sfx-btn");

  let isMuted = false;
  let sfxMuted = false;

  setTimeout(() => {
    const scene = game.scene.scenes[0];

    muteBtn.addEventListener("click", () => {
      SoundManager.musicMuted = !SoundManager.musicMuted;

      muteBtn.src = SoundManager.musicMuted
        ? "./sprites/UI/mute.png"
        : "./sprites/UI/unmute.png";

      if (SoundManager.currentMusic) {
        SoundManager.currentMusic.setMute(SoundManager.musicMuted);
      }
    });

    // 💥 SFX Mute Toggle
    sfxBtn.addEventListener("click", () => {
      sfxMuted = !sfxMuted;
      SoundManager.sfxMuted = sfxMuted; // 🔇 custom mute flag for SFX only
      sfxBtn.src = sfxMuted
        ? "./sprites/UI/mutefx.png"
        : "./sprites/UI/unmutefx.png";
    });
  }, 500);
};
