import MainScene from "./scenes/MainScene.js";

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
    pixelArt: true,         // <--- helps with sharp pixels
    roundPixels: true       // <--- avoids subpixel jitter
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
