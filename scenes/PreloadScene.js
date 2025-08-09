// scenes/PreloadScene.js
import MainScene from "./MainScene.js";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // ---- Progress UI ----
    const w = this.scale.width;
    const h = this.scale.height;

    const barWidth = Math.min(420, Math.floor(w * 0.7));
    const barHeight = 20;
    const x = Math.floor((w - barWidth) / 2);
    const y = Math.floor(h * 0.5);

    const bg = this.add.rectangle(x, y, barWidth, barHeight, 0x111111).setOrigin(0);
    const fg = this.add.rectangle(x + 2, y + 2, 1, barHeight - 4, 0xffffff).setOrigin(0);

    const title = this.add.text(w / 2, h * 0.62, "KISS CAM PANIC", {
      fontFamily: "C64, monospace",
      fontSize: "28px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const pctText = this.add.text(w / 2, y + barHeight + 10, "0%", {
      fontFamily: "C64, monospace",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5);

    // Optional: subtle backdrop so it's not just black
    this.cameras.main.setBackgroundColor("#000000");

    // ---- Loader events ----
    this.load.on("progress", (value) => {
      const innerW = Math.floor((barWidth - 4) * value);
      fg.width = Math.max(1, innerW);
      pctText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on("complete", async () => {
      // Wait for webfonts if needed so first frame uses correct font
      if (!window.fontsReady && document?.fonts?.ready) {
        try { await document.fonts.ready; } catch {}
        window.fontsReady = true;
      }
      // Start the main scene
      this.scene.start("MainScene");
    });

    // ---- ASSET LOADS (moved here from MainScene.preload) ----
    // Players
    this.load.image("ceo1", "sprites/ceo1.png");
    this.load.image("ceo2", "sprites/ceo2.png");
    this.load.image("hr1", "sprites/hr1.png");
    this.load.image("hr2", "sprites/hr2.png");

    // Crowd
    this.load.image("adult/skin", "sprites/crowd/adult/skin.png");
    this.load.image("adult/shirt", "sprites/crowd/adult/shirt.png");
    this.load.image("adult/pants", "sprites/crowd/adult/pants.png");
    this.load.image("adult/hair_f", "sprites/crowd/adult/hair_f.png");
    this.load.image("adult/hair_m", "sprites/crowd/adult/hair_m.png");

    this.load.image("teen/skin", "sprites/crowd/teen/skin.png");
    this.load.image("teen/shirt", "sprites/crowd/teen/shirt.png");
    this.load.image("teen/pants", "sprites/crowd/teen/pants.png");
    this.load.image("teen/hair_f", "sprites/crowd/teen/hair_f.png");
    this.load.image("teen/hair_m", "sprites/crowd/teen/hair_m.png");
    this.load.image("adult/sunglass", "sprites/crowd/adult/sunglass.png");

    for (let i = 1; i <= 4; i++) {
      this.load.image(`alien/a${i}`, `sprites/crowd/alien/a${i}.png`);
    }

    // Props / UI
    this.load.image("credit_card", "sprites/cc.png");
    this.load.image("briefcase", "sprites/case.png");
    this.load.image("stage", "sprites/stage.png");
    this.load.image("kisscam1", "sprites/kisscam1.png");
    this.load.image("kisscam2", "sprites/kisscam2.png");
    this.load.image("poof", "sprites/poof.png");
    this.load.image("background", "sprites/tile.png");
    this.load.image("post", "sprites/post.png");
    this.load.image("flash", "sprites/flash.png");
    this.load.image("dialog_end", "sprites/dialog_end.png");
    this.load.image("exitdoor", "sprites/props/exitdoors.png");
    this.load.image("policetape", "sprites/props/policetape.png");
    this.load.image("wall_top", "sprites/props/wall_tops.png");
    this.load.image("speaker", "sprites/props/speaker.png");
    this.load.image("cameraguy", "sprites/props/cameraguy.png");
    this.load.image("vip", "sprites/props/vip.png");
    this.load.image("curtain", "sprites/props/curtain.png");
    this.load.image("plant", "sprites/props/plant.png");
    this.load.image("mute", "sprites/UI/mute.png");
    this.load.image("unmute", "sprites/UI/unmute.png");
    this.load.image("stapler", "sprites/powerups/stapler2.png");
    this.load.image("mug", "sprites/powerups/mug.png");
    this.load.image("powerup_bar", "sprites/powerups/powerup_bar.png");
    this.load.image("powerup_fill", "sprites/powerups/powerup_fill2.png");
    this.load.image("bubble_kisscam", "sprites/props/bubble_kisscam.png");

    // Audio
    this.load.audio("shoot1", "sounds/fx/shoot1.wav");
    this.load.audio("shoot2", "sounds/fx/shoot2.wav");
    this.load.audio("hit", "sounds/fx/hit.wav");
    this.load.audio("spawn", "sounds/fx/spawn2.wav");
    this.load.audio("chris", "sounds/fx/chris.wav");
    this.load.audio("snap", "sounds/fx/snap.wav");
    this.load.audio("bgMusic", "sounds/music/main1.wav");
    this.load.audio("powerup", "sounds/fx/powerup.wav");
    this.load.audio("powerup_get", "sounds/fx/powerup_get.wav");
    this.load.audio("mug_get", "sounds/fx/mug_get.wav");
    this.load.audio("burst", "sounds/fx/burst.wav");
    this.load.audio("top20", "sounds/fx/win20.wav");
    this.load.audio("top1", "sounds/fx/win1.wav");
  }
}
