export default class RapidFireUI {
	
  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────
  constructor(scene) {
    this.scene = scene;

    this.maxDuration = 20000;
    this.totalTime = 0;
    this.lastUpdate = 0;

    this.createBar();
    this.createCounter();
  }
  // ───────────────────────────────
  // ▶ createBar
  // ───────────────────────────────
  createBar() {
  const x = 25;
  const y = 38;
  const SCALE = 0.2;

  this.barBG = this.scene.add.image(x, y, "powerup_bar")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(100)
    .setScale(SCALE, SCALE);

  const SLOT_WIDTH = this.scene.textures.get("powerup_fill").getSourceImage().width * SCALE;
  const GAP = 2;
  const MAX_SLOTS = 30;

  this.slots = [];

  for (let i = 0; i < MAX_SLOTS; i++) {
    const slotX = x + 5 + i * (SLOT_WIDTH + GAP);
    const slot = this.scene.add.image(slotX, y + 3, "powerup_fill")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101)
      .setScale(SCALE, SCALE)
      .setVisible(false)
      .setTint(0xffffff);

    this.slots.push(slot);
  }
}

	// ───────────────────────────────
  // ▶ createCounter
  // ───────────────────────────────
  createCounter() {
  this.label = this.scene.add.text(16, 15, "powerups:", {
    fontFamily: 'C64',
    fontSize: '16px',
    color: '#cc99ff',
    stroke: '#000000',
    strokeThickness: 3
  }).setScrollFactor(0).setDepth(100);

  this.text = this.scene.add.text(140, 15, `00/00`, {
    fontFamily: 'C64',
    fontSize: '16px',
    color: '#cc99ff',
    stroke: '#000000',
    strokeThickness: 3
  }).setScrollFactor(0).setDepth(100);
}

	// ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
  update(delta, activeCountOnFloor = 0) {
  if (this.totalTime > 0) {
    this.totalTime = Math.max(this.totalTime - delta, 0);

    const progress = Phaser.Math.Clamp(this.totalTime / this.maxDuration, 0, 1);
    const visibleSlots = Math.floor(this.slots.length * progress);

    this.updateBarColor(visibleSlots);

    if (this.totalTime === 0) {
      this.hideBar();
      this.scene.player.disableRapidFire();
    }
  }

  const active = Math.ceil(this.totalTime / 2000);
  const total = active + activeCountOnFloor;
  this.updateCounterText(active, total);

  if (this.scene.player?.rapidFireActive) {
    this.scene.player.updateRapidFireSpeed();
  }
}

// ───────────────────────────────
  // ▶ updateBarColor
  // ───────────────────────────────
  updateBarColor(slotCount) {
  const totalSlots = this.slots.length;
  const fillRatio = slotCount / totalSlots;

  let tint;

  if (fillRatio <= 1 / 3) {
    tint = 0xcc99ff; // lavender
  } else if (fillRatio <= 2 / 3) {
    tint = 0x3399ff; // blue
  } else {
    tint = 0x00f0ff; // cyan
  }

  this.slots.forEach((slot, index) => {
    const isVisible = index < slotCount;
    slot.setVisible(isVisible);
    if (isVisible) slot.setTint(tint);
  });

  const hexColor = `#${tint.toString(16).padStart(6, '0')}`;
  this.label.setColor(hexColor).setStroke('#000', 3);
  this.text.setColor(hexColor).setStroke('#000', 3);
}

// ───────────────────────────────
  // ▶ updateCounterText
  // ───────────────────────────────
  updateCounterText(active, total) {
  const paddedActive = active.toString().padStart(2, "0");
  const paddedTotal = total.toString().padStart(2, "0");
  this.text.setText(`${paddedActive}/${paddedTotal}`);
}

// ───────────────────────────────
  // ▶ hideBar
  // ───────────────────────────────
hideBar() {
  this.slots.forEach(slot => slot.setVisible(false));
}

// ───────────────────────────────
  // ▶ reset
  // ───────────────────────────────
  reset() {
    this.totalTime = 0;
    this.lastUpdate = 0;
    this.hideBar();
  }
}
