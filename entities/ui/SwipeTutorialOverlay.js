// entities/ui/SwipeTutorialOverlay.js
import { enableInputShield, disableInputShield } from "../../utils/InputShield.js";

export default class SwipeTutorialOverlay {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opacity = opts.opacity ?? 0.75;   // darker so message pops
    this.deadzone = opts.deadzone ?? 8;

    this.container = null;
    this._tween = null;

    // document-level swipe tracking (works even outside canvas)
    this._touchStart = null;
    this._onDocStart = this._onDocStart.bind(this);
    this._onDocMove  = this._onDocMove.bind(this);

    this._onStartCb = null;
  }

  show(onStart) {
    this._onStartCb = onStart;

    // 1) Block page scroll & capture touches everywhere
    enableInputShield();
    document.addEventListener("touchstart", this._onDocStart, { passive: false });
    document.addEventListener("touchmove",  this._onDocMove,  { passive: false });

    // 2) Draw the overlay INSIDE Phaser (covers canvas area visually)
    const { scene } = this;
    const w = scene.scale.width;
    const h = scene.scale.height;

    this.container = scene.add.container(0, 0).setDepth(100000).setScrollFactor(0);

    const bg = scene.add.rectangle(0, 0, w, h, 0x000000, this.opacity).setOrigin(0);
    this.container.add(bg);

    const title = scene.add.text(
      w / 2, h * 0.38,
      "SWIPE ANYWHERE ON THE WHOLE SCREEN TO MOVE",
      {
        fontFamily: "C64",
        fontSize: "22px",
        color: "#FFFFFF",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
        wordWrap: { width: Math.min(520, Math.floor(w * 0.9)) }
      }
    ).setOrigin(0.5);
    this.container.add(title);

    const icon = scene.add.text(w / 2, h * 0.45, "«   «   «", {
      fontFamily: "C64",
      fontSize: "44px",
      color: "#FFFFFF"
    }).setOrigin(0.5);
    this.container.add(icon);

    this._tween = scene.tweens.add({
      targets: icon,
      x: { from: w * 0.34, to: w * 0.66 },
      ease: "Sine.inOut",
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    const hint = scene.add.text(w / 2, h * 0.52, "first swipe starts the game", {
      fontFamily: "C64",
      fontSize: "14px",
      color: "#ffccff",
      align: "center",
      stroke: "#000000",
      strokeThickness: 4,
      wordWrap: { width: Math.min(520, Math.floor(w * 0.9)) }
    }).setOrigin(0.5);
    this.container.add(hint);
  }

  hide() {
    // 1) Remove document listeners + shield
    document.removeEventListener("touchstart", this._onDocStart, { passive: false });
    document.removeEventListener("touchmove",  this._onDocMove,  { passive: false });
    disableInputShield();

    // 2) Cleanup Phaser visuals
    if (this._tween) this._tween.stop();
    this._tween = null;

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this._touchStart = null;
    this._onStartCb = null;
  }

  // ---- document-level swipe detection (so swipes on sidebar count) ----
  _onDocStart(ev) {
    ev.preventDefault(); // block scroll start
    const t = ev.touches && ev.touches[0];
    if (!t) return;
    this._touchStart = { x: t.clientX, y: t.clientY };
  }

  _onDocMove(ev) {
    ev.preventDefault(); // block scroll / pull-to-refresh
    if (!this._touchStart) return;
    const t = ev.touches && ev.touches[0];
    if (!t) return;

    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= this.deadzone) {
      const cb = this._onStartCb;
      this.hide();
      if (cb) cb(); // start the game
    }
  }
}
