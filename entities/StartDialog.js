export default class StartDialog {
  static _alreadyShown = false;

  static show(scene, onStart) {

    // ────────────────
    // 📱 Mobile: show swipe overlay instead of dialog
    // ────────────────
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
      SwipeAnyOverlay.show("swipe anywhere to move", () => {
        try {
          const sm = scene.sound;
          const ctx = sm?.context;

          // Resume context if paused
          if (ctx && ctx.state !== "running") {
            ctx.resume();
          }

          // 🔊 Warm-up: brief inaudible blip to unlock audio
          if (ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.00001; // effectively silent
            osc.connect(gain).connect(ctx.destination);
            osc.start(0);
            osc.stop(ctx.currentTime + 0.01);
          }

          // Phaser's own unlock (safe if already unlocked)
          if (sm?.locked) sm.unlock();
        } catch {}

        onStart?.();
      });
      return;
    }

    // ────────────────
    // 🖥 Desktop: show original dialog
    // ────────────────
    if (StartDialog._alreadyShown) return;
    StartDialog._alreadyShown = true;

    const dialog = scene.add
      .container(scene.scale.width / 2, scene.scale.height / 2)
      .setDepth(99999)
      .setScrollFactor(0);

    const bg = scene.add.image(0, 0, "dialog_end").setScale(0.3, 0.35);

    const title = scene.add.text(0, -95, "DODGE THE KISS CAM", {
      fontFamily: "C64",
      fontSize: "18px",
      color: "#ff66cc",
      align: "center"
    }).setOrigin(0.5);

    const subtitle = scene.add.text(0, -65, "LIKE YOUR JOB DEPENDS ON IT!", {
      fontFamily: "C64",
      fontSize: "13px",
      color: "#ffcc00",
      align: "center"
    }).setOrigin(0.5);

    const controls = scene.add.text(0, -25, "← ↑ → ↓  TO MOVE", {
      fontFamily: "C64",
      fontSize: "15px",
      color: "#00ffff",
      align: "center"
    }).setOrigin(0.5);

    const shoot = scene.add.text(0, 0, "SPACE TO SHOOT", {
      fontFamily: "C64",
      fontSize: "15px",
      color: "#00ff66",
      align: "center"
    }).setOrigin(0.5);

    const hype = scene.add.text(0, 35, "LET'S GO!!", {
      fontFamily: "C64",
      fontSize: "20px",
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);

    const okBtn = scene.make.text({
      x: 0,
      y: 75,
      text: " OK ",
      style: {
        fontFamily: "C64",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#ff00aa",
        padding: { x: 10, y: 5 },
        align: "center"
      },
      add: false
    }).setOrigin(0.5).setInteractive();

    // --- Handlers with cleanup ---
    const destroyAndStart = () => {
      dialog.destroy();

      // 🧹 Remove key listeners
      scene.input.keyboard.off("keydown-ENTER", enterHandler);
      scene.input.keyboard.off("keydown-SPACE", spaceHandler);
      scene.input.keyboard.off("keydown-ESC", escHandler);

      // ✅ Enable swipe capture overlay for gameplay
      window.setTouchCaptureEnabled(true);

      onStart?.();
    };

    const enterHandler = () => destroyAndStart();
    const spaceHandler = () => destroyAndStart();
    const escHandler = () => destroyAndStart();

    okBtn.on("pointerdown", destroyAndStart);
    scene.input.keyboard.once("keydown-ENTER", enterHandler);
    scene.input.keyboard.once("keydown-SPACE", spaceHandler);
    scene.input.keyboard.once("keydown-ESC", escHandler);

    dialog.add([bg, title, subtitle, controls, shoot, hype, okBtn]);
  }
}
