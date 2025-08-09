// scenes/PreloadScene.js
import MainScene from "./MainScene.js";

export default class PreloadScene extends Phaser.Scene {
  constructor() { super("PreloadScene"); }

  preload() {
    const w = this.scale.width, h = this.scale.height;
    const BAR_W = Math.min(460, Math.floor(w * 0.7));
    const BAR_H = 22;
    const X = Math.floor((w - BAR_W) / 2);
    const Y = Math.floor(h * 0.40);

    const COL_BG = 0x000000;
    const COL_FRAME = 0xffffff;
    const COL_FROM = Phaser.Display.Color.ValueToColor(0x33CC33); 
    const COL_TO   = Phaser.Display.Color.ValueToColor(0x33CC33); 

    this.cameras.main.setBackgroundColor(COL_BG);

    // --- Title above bar ---
    const title = this.add.text(w / 2, Y - 26, "LOADING...", {
      fontFamily: "C64, monospace",
      fontSize: "22px",
      color: "#CFA9FF " // pink
    })
    .setOrigin(0.5)
    .setStroke("#000000", 6)
    .setDepth(10);

    this.time.addEvent({
      delay: 350, loop: true,
      callback: () => {
        const t = title.text.endsWith("...") ? "LOADING..." : "LOADING...";
        title.setText(t);
      }
    });

    // --- Bar frame ---
    const g = this.add.graphics().setDepth(5);
    g.lineStyle(2, COL_FRAME, 1);
    g.strokeRect(X, Y, BAR_W, BAR_H);
    g.fillStyle(0x111111, 1);
    g.fillRect(X + 1, Y + 1, BAR_W - 2, BAR_H - 2);

    const fill = this.add.graphics().setDepth(6);

    const pctText = this.add.text(X + BAR_W / 2, Y + BAR_H / 2 + 1, "0%", {
      fontFamily: "C64, monospace",
      fontSize: "14px",
      color: "#ffffff"
    })
    .setOrigin(0.5)
    .setStroke("#000000", 6)
    .setDepth(10);

    this.load.on("progress", (v) => {
      const innerW = Math.max(0, Math.floor((BAR_W - 4) * v));
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        COL_FROM, COL_TO, 100, Math.round(v * 100)
      );
      const col = Phaser.Display.Color.GetColor(c.r, c.g, c.b);

      fill.clear();
      fill.fillStyle(col, 1);
      fill.fillRect(X + 2, Y + 2, innerW, BAR_H - 4);

      // pixel ticks
      if (innerW > 0) {
        fill.lineStyle(1, 0x000000, 0.18);
        for (let i = 0; i <= innerW; i += 6) {
          fill.beginPath();
          fill.moveTo(X + 2 + i, Y + 2);
          fill.lineTo(X + 2 + i, Y + BAR_H - 2);
          fill.strokePath();
        }
      }

      pctText.setText(`${Math.round(v * 100)}%`);
    });

    this.load.on("complete", async () => {
      if (!window.fontsReady && document?.fonts?.ready) {
        try { await document.fonts.ready; } catch {}
        window.fontsReady = true;
      }
      this.scene.start("MainScene");
    });

    // ---- asset loads ----
    this.load.image("ceo1", "sprites/ceo1.png");
    this.load.image("ceo2", "sprites/ceo2.png");
    this.load.image("hr1", "sprites/hr1.png");
    this.load.image("hr2", "sprites/hr2.png");
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
    for (let i = 1; i <= 4; i++) this.load.image(`alien/a${i}`, `sprites/crowd/alien/a${i}.png`);
    this.load.image("credit_card", "sprites/cc.png");
    this.load.image("briefcase", "sprites/case.png");
    this.load.image("stage", "sprites/stage.png");
	this.load.image("stage_mobile", "sprites/stage_mobile.png");
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
