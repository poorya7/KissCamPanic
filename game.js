import MainScene from "./scenes/MainScene.js";
import ScoreService from "./services/ScoreService.js";
import SoundManager from "./utils/SoundManager.js"; // ✅ make sure this path is correct

// ---- Landscape-only boot gate ----
let __gameBooted = false;

function isLandscape() {
  // matchMedia is reliable; fall back to innerWidth check
  return (window.matchMedia && window.matchMedia("(orientation: landscape)").matches)
         || window.innerWidth > window.innerHeight;
}

function bootWhenLandscape(bootFn) {
  if (__gameBooted) return;
  if (isLandscape()) {
    __gameBooted = true;
    bootFn();
    return;
  }
  // Wait for rotation
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
	  
  dom: { createContainer: true },
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

    let sfxMuted = false;

    setTimeout(() => {
      // 💥 Music Mute Toggle
      muteBtn.addEventListener("click", () => {
        SoundManager.musicMuted = !SoundManager.musicMuted;

        muteBtn.src = SoundManager.musicMuted
          ? "sprites/UI/mute.png"
          : "sprites/UI/unmute.png";

        if (SoundManager.currentMusic) {
          SoundManager.currentMusic.setMute(SoundManager.musicMuted);
        }
      });

      // 💥 SFX Mute Toggle
      sfxBtn.addEventListener("click", () => {
        sfxMuted = !sfxMuted;
        SoundManager.sfxMuted = sfxMuted; // 🔇 custom mute flag for SFX only
        sfxBtn.src = sfxMuted
          ? "sprites/UI/mutefx.png"
          : "sprites/UI/unmutefx.png";
      });
    }, 500);
  };

  // ✅ Only boot when in landscape
  bootWhenLandscape(bootGame);
};
