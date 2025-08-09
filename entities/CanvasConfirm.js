export default class CanvasConfirm {
  static show(scene, titleText = "Ready?", buttonText = "LET'S GO", onConfirm) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    const container = scene.add.container(cx, cy).setDepth(100000).setScrollFactor(0);

    // Fullscreen transparent blocker so taps don't hit the game underneath
    const blocker = scene.add.zone(-cx, -cy, scene.scale.width, scene.scale.height)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setInteractive(); // absorbs taps

    // Card
    const w = Math.min(320, Math.floor(scene.scale.width * 0.8));
    const h = 160;

    const gfx = scene.add.graphics().setScrollFactor(0);
    gfx.fillStyle(0x000000, 0.85);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    gfx.lineStyle(2, 0xffffff, 1);
    gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

    const title = scene.add.text(0, -34, titleText, {
      fontFamily: "C64",
      fontSize: "20px",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5);

    const btn = scene.add.text(0, 28, ` ${buttonText} `, {
      fontFamily: "C64",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#ff00aa",
      padding: { x: 12, y: 6 },
      align: "center",
    }).setOrigin(0.5);

    // BIG invisible hit zone (easy mobile taps)
    const hitW = Math.max(btn.width + 60, 200);
    const hitH = Math.max(btn.height + 20, 48);
    const hit = scene.add.rectangle(0, 28, hitW, hitH, 0x000000, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const press = () => btn.setStyle({ backgroundColor: "#ff33bb" });
    const release = () => btn.setStyle({ backgroundColor: "#ff00aa" });

    let done = false;
    let onceAnyTap; // declare so we can remove it

    const confirm = () => {
      if (done) return;
      done = true;

      // remove the fallback listener in case it hasn't fired yet
      try { scene.input.off("pointerdown", onceAnyTap); } catch {}

      // 🔊 guaranteed unlock
      try {
        const sm = scene.sound;
        const ctx = sm?.context;
        if (ctx && ctx.state !== "running") ctx.resume();
        if (sm?.locked) sm.unlock();
      } catch {}

      container.destroy(true);
      onConfirm?.();
    };

    // Button-specific handlers
    hit.on("pointerdown", press);
    hit.on("pointerup",   () => { release(); confirm(); });
    hit.on("pointerout",  release);

    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerdown", press);
    btn.on("pointerup",   () => { release(); confirm(); });
    btn.on("pointerout",  release);

    // 🔒 Fallback: if button events don’t fire, ANY first tap on canvas will confirm
    onceAnyTap = () => confirm();
    scene.input.once("pointerdown", onceAnyTap);

    container.add([blocker, gfx, title, hit, btn]);
    return container;
  }
}
