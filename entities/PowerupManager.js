import { isBlocked } from "../utils/CrowdUtils.js";
import SoundManager from "../utils/SoundManager.js";

export default class PowerupManager {
	
	static BAR_WIDTH = 175;
	

  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────	
  constructor(scene) {
  this.scene = scene;

  this.maxPowerups = 15;
  this.spawnInterval = 2000;
  this.totalRapidFireTime = 0;
  this.lastRapidFireUpdate = 0;
  this.maxRapidFireDuration = 20000; // cap at 20s max


  this.createRapidFireBar();

  // UI counter in top-left
  // Powerups label
  this.powerupLabel = this.scene.add.text(16, 15, "powerups:", {
    fontFamily: 'C64',
    fontSize: '16px',
    color: '#cc99ff',
    stroke: '#000000',
    strokeThickness: 3
  }).setScrollFactor(0).setDepth(100);

  // Powerups value
  this.powerupText = this.scene.add.text(140, 15, `00/00`, {
    fontFamily: 'C64',
    fontSize: '16px',
    color: '#cc99ff',
    stroke: '#000000',
    strokeThickness: 3
  }).setScrollFactor(0).setDepth(100);

  // Regular powerup logic
  this.powerupGroup = this.scene.physics.add.group();
  this.activePowerups = [];

  this.timer = this.scene.time.addEvent({
    delay: this.spawnInterval,
    callback: this.trySpawnPowerup,
    callbackScope: this,
    loop: true
  });

  // 🔁 Independent UI updater
  this.scene.time.addEvent({
    delay: 200,
    callback: () => this.update(),
    callbackScope: this,
    loop: true
  });
  
  // Mug powerup logic
	this.mugGroup = this.scene.physics.add.group();
	this.mugSpawnInterval = 5000; // 5 seconds
	this.maxMugs = 2;

	this.scene.time.addEvent({
	  delay: this.mugSpawnInterval,
	  callback: this.trySpawnMug,
	  callbackScope: this,
	  loop: true
	});

}


  // ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
update() {
  const now = this.scene.time.now;
  const delta = now - this.lastRapidFireUpdate;
  this.lastRapidFireUpdate = now;

  if (this.totalRapidFireTime > 0) {
    this.totalRapidFireTime = Math.max(this.totalRapidFireTime - delta, 0);

    const progress = Phaser.Math.Clamp(this.totalRapidFireTime / this.maxRapidFireDuration, 0, 1);
    const visibleSlots = Math.floor(this.rapidFireSlots.length * progress);

    this.updateRapidFireBarColor(visibleSlots); // 👈 use helper here

      

    if (this.totalRapidFireTime === 0) {
      this.hideRapidFireBar();
      this.scene.player.disableRapidFire();
    }
  }

  // Update the powerup counter text
  const active = Math.ceil(this.totalRapidFireTime / 2000);
  const onFloor = this.powerupGroup.countActive(true);
  const total = active + onFloor;

  const paddedActive = active.toString().padStart(2, "0");
  const paddedTotal = total.toString().padStart(2, "0");

  this.powerupText.setText(`${paddedActive}/${paddedTotal}`);
  

if (this.scene.player?.rapidFireActive) {
  this.scene.player.updateRapidFireSpeed();
}

}

  // ───────────────────────────────
  // ▶ updateRapidFireBarColor
  // ───────────────────────────────
updateRapidFireBarColor(slotCount) {
  const totalSlots = this.rapidFireSlots.length;
  const fillRatio = slotCount / totalSlots;

  let tint;

  if (fillRatio <= 1 / 3) {
  tint = 0xcc99ff; // lavender ice (purple-ish) — low fill
} else if (fillRatio <= 2 / 3) {
  tint = 0x3399ff; // cyber blue — mid fill
} else {
  tint = 0x00f0ff; // electric cyan — high fill
}


  // Update slot visuals
  this.rapidFireSlots.forEach((slot, index) => {
    const isVisible = index < slotCount;
    slot.setVisible(isVisible);
    if (isVisible) slot.setTint(tint);
  });

  // Update label + value text
  const hexColor = `#${tint.toString(16).padStart(6, '0')}`;


this.powerupLabel.setColor(hexColor).setStroke('#000', 3);
this.powerupText.setColor(hexColor).setStroke('#000', 3);

}


  // ───────────────────────────────
  // ▶ createRapidFireBar
  // ───────────────────────────────

  createRapidFireBar() {
  const x = 25;
  const y = 38;

  const SCALE = 0.2;

  // Background frame
  this.rapidFireBarBG = this.scene.add.image(x, y, "powerup_bar")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(100)
    .setScale(SCALE, SCALE);

  // Slot metrics
  const SLOT_WIDTH = this.scene.textures.get("powerup_fill").getSourceImage().width * SCALE;
  const SLOT_HEIGHT = this.scene.textures.get("powerup_fill").getSourceImage().height * SCALE;
  const GAP = 2;
  const MAX_SLOTS = 30;

  this.rapidFireSlots = [];

  for (let i = 0; i < MAX_SLOTS; i++) {
    const slotX = x + 5 + i * (SLOT_WIDTH + GAP);
    const slot = this.scene.add.image(slotX, y + 3, "powerup_fill")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(101)
      .setScale(SCALE, SCALE)
      .setVisible(false)
	  .setTint(0xffffff);

    this.rapidFireSlots.push(slot);
  }
}

  // ───────────────────────────────
  // ▶ activateRapidFire
  // ───────────────────────────────

activateRapidFire(player) {
  const extension = 2000;

  this.totalRapidFireTime = Math.min(
    this.totalRapidFireTime + extension,
    this.maxRapidFireDuration
  );

  this.lastRapidFireUpdate = this.scene.time.now;

  player.enableRapidFire();
  player.updateRapidFireSpeed(); // 👈 ADD THIS
}



  // ───────────────────────────────
  // ▶ hideRapidFireBar
  // ───────────────────────────────
hideRapidFireBar() {
	
  this.rapidFireSlots.forEach(slot => slot.setVisible(false));
}

// ───────────────────────────────
// ▶ trySpawnMug
// ───────────────────────────────
trySpawnMug() {
  const now = this.scene.time.now;

  if (this.mugGroup.countActive(true) >= this.maxMugs) return;
 

  const maxAttempts = 20;
  const minDistance = 150; // distance between mugs

  for (let i = 0; i < maxAttempts; i++) {
    const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    const y = Phaser.Math.Between(100, this.scene.scale.height - 10);

    if (isBlocked(this.scene, x, y)) continue;

    // Check distance from existing mugs
    let tooClose = false;
    this.mugGroup.getChildren().forEach(mug => {
      const dist = Phaser.Math.Distance.Between(x, y, mug.x, mug.y);
      if (dist < minDistance) tooClose = true;
    });

    if (tooClose) continue;

    const mug = this.scene.physics.add.sprite(x, y, "mug")
      .setScale(0.07)
      .setDepth(y - 1)
      .setImmovable(true);

    mug.powerupType = "mug";
    this.mugGroup.add(mug);
    SoundManager.playSFX("powerup");

    this.lastMugSpawnTime = now;
    return; // ✅ spawn successful
  }

  console.warn("⚠️ Could not find valid spot to spawn mug.");
}


  // ───────────────────────────────
// ▶ trySpawnPowerup
// ───────────────────────────────
trySpawnPowerup() {
  if (this.powerupGroup.countActive(true) >= this.maxPowerups) return;

  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    const y = Phaser.Math.Between(100, this.scene.scale.height - 10);

    if (isBlocked(this.scene, x, y)) continue;

    const stapler = this.scene.physics.add.sprite(x, y, "stapler")
      .setScale(0.07)
      .setDepth(y - 1)
      .setImmovable(true);

    stapler.powerupType = "stapler";
    this.powerupGroup.add(stapler);
    SoundManager.playSFX("powerup");

    return; // ✅ spawn succeeded
  }

  console.warn("⚠️ Could not find valid spot to spawn stapler.");
}

  // ───────────────────────────────
  // ▶ enableCollisionWith
  // ───────────────────────────────
enableCollisionWith(player, callbackMap) {
  // Stapler overlap
  this.scene.physics.add.overlap(
    player,
    this.powerupGroup,
    (player, powerup) => {
      const type = powerup.powerupType;

      // ✅ Just disable & hide stapler — don't remove it
      powerup.disableBody(true, true);

      SoundManager.playSFX("powerup_get");

      if (callbackMap[type]) {
        this.scene.time.delayedCall(300, () => {
          callbackMap[type]();
        });
      }
    },
    null,
    this
  );

  // Mug overlap
  this.scene.physics.add.overlap(
    player,
    this.mugGroup,
    (player, powerup) => {
      const type = powerup.powerupType;

      // ✅ Fully remove mug from group and destroy it
      this.mugGroup.remove(powerup, true, true);

      SoundManager.playSFX("mug_get");

      if (callbackMap[type]) {
        this.scene.time.delayedCall(300, () => {
          callbackMap[type]();

          this.scene.player.triggerMugBurst({
            delay: 150,
            speed: 600,
            duration: 180
          });
        });
      }
    },
    null,
    this
  );
}



  // ───────────────────────────────
  // ▶ reset
  // ───────────────────────────────
  reset() {
  this.powerupGroup.clear(true, true); // staplers
  this.mugGroup.clear(true, true);     // mugs
	}

}
