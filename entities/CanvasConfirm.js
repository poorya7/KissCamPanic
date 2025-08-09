export default class CanvasConfirm {
  static show(scene, titleText = "Ready?", buttonText = "LET'S GO", onConfirm) {
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    const container = scene.add.container(cx, cy).setDepth(100000).setScrollFactor(0);

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

    // BIG invisible hit zone around the button (easier mobile taps)
    const hitW = Math.max(btn.width + 60, 200);
    const hitH = Math.max(btn.height + 20, 48);
    const hit = scene.add.rectangle(0, 28, hitW, hitH, 0x000000, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Visual feedback on press
    const press = () => btn.setStyle({ backgroundColor: "#ff33bb" });
    const release = () => btn.setStyle({ backgroundColor: "#ff00aa" });

    const confirm = () => {
      // 🔊 Guaranteed unlock on canvas gesture
      try {
        const sm = scene.sound;
        const ctx = sm?.context;
        if (ctx && ctx.state !== "running") ctx.resume();
        if (sm?.locked) sm.unlock();
      } catch {}
      container.destroy(true);
      onConfirm?.();
    };

    // Listen on both the big hit zone AND the text (belt & suspenders)
    hit.on("pointerdown", press);
    hit.on("pointerup",   () => { release(); confirm(); });
    hit.on("pointerout",  release);

    btn.setInteractive({ useHandCursor: true });
    btn.on("pointerdown", press);
    btn.on("pointerup",   () => { release(); confirm(); });
    btn.on("pointerout",  release);

    container.add([gfx, title, hit, btn]);
    return container;
  }
}
