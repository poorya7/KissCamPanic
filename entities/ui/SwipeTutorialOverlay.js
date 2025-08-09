// ui/SwipeTutorialOverlay.js
export default class SwipeTutorialOverlay {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opacity = opts.opacity ?? 0.55;     // dim level
    this.deadzone = opts.deadzone ?? 8;      // px before we count it as a swipe
    this.container = null;
    this._onDown = null;
    this._onMove = null;
    this._tween = null;
  }

  show(onStart) {
    const { scene } = this;
    const w = scene.scale.width;
    const h = scene.scale.height;

    // container on top of everything, fixed to camera
    this.container = scene.add.container(0, 0).setDepth(100000).setScrollFactor(0);

    // semi-transparent backdrop so the game is visible
    const bg = scene.add.rectangle(0, 0, w, h, 0x000000, this.opacity).setOrigin(0);
    this.container.add(bg);

    const title = scene.add.text(w / 2, h * 0.38, "SWIPE ANYWHERE TO MOVE", {
      fontFamily: "C64",
      fontSize: "22px",
      color: "#FFFFFF",
      align: "center",
      stroke: "#000000",
      strokeThickness: 6
    }).setOrigin(0.5);
    this.container.add(title);

    const hint = scene.add.text(w / 2, h * 0.52, "first swipe starts the game", {
      fontFamily: "C64",
      fontSize: "14px",
      color: "#ffccff",
      align: "center",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);
    this.container.add(hint);

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

    let startPos = null;

    this._onDown = (p) => { startPos = new Phaser.Math.Vector2(p.x, p.y); };
    this._onMove = (p) => {
      if (!startPos) return;
      const d = Phaser.Math.Distance.Between(p.x, p.y, startPos.x, startPos.y);
      if (d >= this.deadzone) {
        this.hide();
        onStart?.();
      }
    };

    scene.input.on("pointerdown", this._onDown);
    scene.input.on("pointermove", this._onMove);
  }

  hide() {
    const { scene } = this;
    if (this._onDown) scene.input.off("pointerdown", this._onDown);
    if (this._onMove) scene.input.off("pointermove", this._onMove);
    if (this._tween) this._tween.stop();

    this._onDown = this._onMove = this._tween = null;

    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }
}
