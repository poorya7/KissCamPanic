import MainScene from "./scenes/MainScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import ScoreService from "./services/ScoreService.js";
import SoundManager from "./utils/SoundManager.js";

let __gameBooted = false;

function isLandscape() {
  return (window.matchMedia && window.matchMedia("(orientation: landscape)").matches)
      || window.innerWidth > window.innerHeight;
}

function bootWhenLandscape(bootFn) {
  if (__gameBooted) return;
  if (isLandscape()) {
    __gameBooted = true; bootFn(); return;
  }
  const tryBoot = () => {
    if (!__gameBooted && isLandscape()) {
      __gameBooted = true;
      window.removeEventListener("orientationchange", tryBoot);
      window.removeEventListener("resize", tryBoot);
      bootFn();
    }
  };
  window.addEventListener("orientationchange", tryBoot, { passive: true });
  window.addEventListener("resize", tryBoot, { passive: true });
}

window.onload = () => {
  const wrapper = document.getElementById("game-wrapper");

  const bootGame = () => {
    const wrapperSize = { width: wrapper.clientWidth, height: wrapper.clientHeight };

    const config = {
      type: Phaser.AUTO,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.NONE,
        width: wrapperSize.width,
        height: wrapperSize.height,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: { pixelArt: true, roundPixels: true },
      physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
      dom: { createContainer: true },
      scene: [PreloadScene, MainScene], // 👈 Start with Preload
      parent: "game-wrapper",

      // 👇 NEW: route events from the whole window (not just the canvas)
      input: {
        activePointers: 3,
        mouse: { target: window },
        touch: { target: window }
      }
    };

    const game = new Phaser.Game(config);

    // Kick off top scores once fonts are ready
    if (window.fontsReady) {
      ScoreService.getTopScores();
    } else if (document?.fonts?.ready) {
      document.fonts.ready.then(() => {
        window.fontsReady = true;
        ScoreService.getTopScores();
      });
    }

    const muteBtn = document.getElementById("mute-btn");
    const sfxBtn = document.getElementById("mute-sfx-btn");
    let sfxMuted = false;

    setTimeout(() => {
      muteBtn?.addEventListener("click", () => {
        SoundManager.musicMuted = !SoundManager.musicMuted;
        muteBtn.src = SoundManager.musicMuted ? "sprites/UI/mute.png" : "sprites/UI/unmute.png";
        if (SoundManager.currentMusic) SoundManager.currentMusic.setMute(SoundManager.musicMuted);
      });

      sfxBtn?.addEventListener("click", () => {
        sfxMuted = !sfxMuted;
        SoundManager.sfxMuted = sfxMuted;
        sfxBtn.src = sfxMuted ? "sprites/UI/mutefx.png" : "sprites/UI/unmutefx.png";
      });
    }, 500);
  };

  bootWhenLandscape(bootGame);
};
