import MainScene from "./scenes/MainScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import ScoreService from "./services/ScoreService.js";
import SoundManager from "./utils/SoundManager.js";

let __gameBooted = false;

// ───────────────────────────────
// ▶ Orientation Check
// ───────────────────────────────
function isLandscape() {
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

// ───────────────────────────────
// ▶ iOS Safari swipe/bounce blocker
// ───────────────────────────────
const __isTouch = () => window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
const __isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Hoisted function reference so removeEventListener works
const __preventScroll = (e) => e.preventDefault();

let __iosBlockEnabled = false;

function enableIOSSwipeBlock() {
  if (!__isIOS() || !__isTouch()) return;
  // Always re-attach when called in landscape
  document.addEventListener("touchmove", __preventScroll, { passive: false });
  document.addEventListener("gesturestart", __preventScroll, { passive: false });
  __iosBlockEnabled = true;
}


function disableIOSSwipeBlock() {
  if (!__iosBlockEnabled) return;
  document.removeEventListener("touchmove", __preventScroll);
  document.removeEventListener("gesturestart", __preventScroll);
  __iosBlockEnabled = false; // reset so enable works next time
}


// ───────────────────────────────
// ▶ Window Onload
// ───────────────────────────────
window.onload = () => {
  const wrapper = document.getElementById("game-wrapper");

  const bootGame = () => {
    // iOS Safari: block bounce / pull-to-refresh while game is active
    enableIOSSwipeBlock();

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
      scene: [PreloadScene, MainScene], // Start with Preload
      parent: "game-wrapper"
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
        muteBtn.src = SoundManager.musicMuted
          ? "sprites/UI/mute.png"
          : "sprites/UI/unmute.png";
        if (SoundManager.currentMusic) {
          SoundManager.currentMusic.setMute(SoundManager.musicMuted);
        }
      });

      sfxBtn?.addEventListener("click", () => {
        sfxMuted = !sfxMuted;
        SoundManager.sfxMuted = sfxMuted;
        sfxBtn.src = sfxMuted
          ? "sprites/UI/mutefx.png"
          : "sprites/UI/unmutefx.png";
      });
    }, 500);
  };

  bootWhenLandscape(bootGame);
};

// ───────────────────────────────
// ▶ Orientation toggle for swipe-block
// ───────────────────────────────
window.addEventListener(
  "orientationchange",
  () => {
    if (window.innerWidth > window.innerHeight) {
      enableIOSSwipeBlock();
    } else {
      disableIOSSwipeBlock();
    }
  },
  { passive: true }
);
