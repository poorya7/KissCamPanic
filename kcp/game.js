import MainScene from "./scenes/MainScene.js";
import ScoreService from "./services/ScoreService.js";
import SoundManager from "./utils/SoundManager.js"; // ✅ make sure this path is correct

// 🔊 On-screen debug log
window.debugLog = function (...args) {
  const el = document.getElementById("debug-log") || (() => {
    const div = document.createElement("div");
    div.id = "debug-log";
    div.style.position = "fixed";
    div.style.top = "10px";
    div.style.left = "10px";
    div.style.background = "rgba(0,0,0,0.8)";
    div.style.color = "#0f0";
    div.style.font = "12px monospace";
    div.style.padding = "6px 8px";
    div.style.zIndex = "9999";
    div.style.whiteSpace = "pre-line";
    div.style.maxWidth = "95vw";
    div.style.pointerEvents = "none";
    document.body.appendChild(div);
    return div;
  })();

  el.textContent = args.map(x => (typeof x === 'object' ? JSON.stringify(x, null, 2) : x)).join(" ");
};



window.onload = () => {
  const wrapper = document.getElementById("game-wrapper");
 const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const wrapperSize = isMobile
  ? { width: 540, height: 960 }
  : {
      width: wrapper.clientWidth,
      height: wrapper.clientHeight,
    };
	
debugLog(
  "wrapperSize:", wrapperSize.width + "x" + wrapperSize.height,
  "\noffset:", wrapper.offsetWidth + "x" + wrapper.offsetHeight
);




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



setTimeout(() => {
  const title = document.getElementById("top-left-title");
  const bottom = document.getElementById("bottom-bar");

  debugLog(
    `wrapper: ${wrapperSize.width}x${wrapperSize.height}`,
    `\ntitle offset: ${title?.offsetTop}, ${title?.offsetLeft}`,
    `\nbottom offset: ${bottom?.offsetTop}, ${bottom?.offsetLeft}`
  );
}, 1000);

 
};
