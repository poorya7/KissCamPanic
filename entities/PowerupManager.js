import { isBlocked } from "../utils/CrowdUtils.js";
import SoundManager from "../utils/SoundManager.js";

export default class PowerupManager {
	
	static BAR_WIDTH = 175;
	
	
  constructor(scene) {
	  


    this.scene = scene;

    this.maxPowerups = 15;
    this.spawnInterval = 2000;
	
	this.createRapidFireBar();


    // UI counter in top-left
    // Powerups label
// Powerups label
this.powerupLabel = this.scene.add.text(16, 15, "powerups:", {
  fontFamily: 'C64',
  fontSize: '16px',
  color: '#00f0ff',
  stroke: '#000000',
  strokeThickness: 3
}).setScrollFactor(0).setDepth(100);

// Powerups value
this.powerupText = this.scene.add.text(140, 15, `00/${this.maxPowerups}`, {
  fontFamily: 'C64',
  fontSize: '16px',
  color: '#00f0ff',
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
  }

update() {
 let active = 0;

if (this.rapidFireTimer) {
  const remaining = this.rapidFireTimer.getRemaining();
  active = Math.ceil(remaining / 2000); // 1 powerup = 2s
}


  // Count how many are still on the floor
  const onFloor = this.powerupGroup.countActive(true);

  // Total = active + on floor
  const total = active + onFloor;

  const paddedActive = active.toString().padStart(2, "0");
  const paddedTotal = total.toString().padStart(2, "0");

  this.powerupText.setText(`${paddedActive}/${paddedTotal}`);

  // Update rapid fire bar fill width
  if (this.rapidFireTimer && this.rapidFireBarFill.visible) {
    const elapsed = this.scene.time.now - this.rapidFireStart;
    const progress = Phaser.Math.Clamp(1 - (elapsed / this.rapidFireDuration), 0, 1);
    this.rapidFireBarFill.width = this.rapidFireBarFullWidth * progress;
  }
}





activateRapidFire(player) {
  const extension = 2000;

  if (this.rapidFireTimer) {
    const remaining = this.rapidFireTimer.getRemaining();
    const newDuration = remaining + extension;

    this.rapidFireTimer.remove(false);
    this.rapidFireTimer = this.scene.time.delayedCall(newDuration, () => {
      player.disableRapidFire();
      this.rapidFireTimer = null;
      this.hideRapidFireBar();
    });

    this.startRapidFireBar(newDuration);

  } else {
    player.enableRapidFire();
    this.rapidFireTimer = this.scene.time.delayedCall(extension, () => {
      player.disableRapidFire();
      this.rapidFireTimer = null;
      this.hideRapidFireBar();
    });

    this.startRapidFireBar(extension);
  }
}


startRapidFireBar(duration) {
  const MAX_DURATION = 20000;
  const capped = Math.min(duration, MAX_DURATION);

  const barWidth = PowerupManager.BAR_WIDTH * (capped / MAX_DURATION);

  this.rapidFireBarFill.setVisible(true);
  this.rapidFireBarFill.width = barWidth;

  this.rapidFireStart = this.scene.time.now;
  this.rapidFireDuration = duration;
  this.rapidFireBarFullWidth = barWidth;
}






hideRapidFireBar() {
  this.rapidFireBarFill.setVisible(false); // hide green
  // do NOT hide this.rapidFireBarBG — it should always stay visible
}





createRapidFireBar() {
  const x = 25;
  const y = 38;

  this.rapidFireBarBG = this.scene.add.rectangle(
    x, y,
    PowerupManager.BAR_WIDTH, 8,
    0x000000
  ).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

  this.rapidFireBarFill = this.scene.add.rectangle(
    x, y,
    1, 8,
    0x00ff00
  ).setOrigin(0, 0).setScrollFactor(0).setDepth(101);

  this.rapidFireBarFill.setVisible(false);
  this.rapidFireBarBG.setVisible(true);
}








  trySpawnPowerup() {
    if (this.powerupGroup.countActive(true) >= this.maxPowerups) return;

    const maxAttempts = 20;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
      const y = Phaser.Math.Between(100, this.scene.scale.height - 10);

      if (isBlocked(this.scene, x, y)) continue;

      const stapler = this.scene.physics.add.sprite(x, y, "stapler")
        .setScale(0.1)
        .setDepth(10)
        .setImmovable(true);

      stapler.powerupType = "stapler";
      this.powerupGroup.add(stapler);
      SoundManager.playSFX("powerup");

      return; // ✅ spawn succeeded
    }

    console.warn("⚠️ Could not find valid spot to spawn stapler.");
  }




  enableCollisionWith(player, callbackMap) {
    this.scene.physics.add.overlap(
  player,
  this.powerupGroup,
  (player, powerup) => {
    const type = powerup.powerupType;
    powerup.disableBody(true, true);

    SoundManager.playSFX("powerup_get"); // 🔊 Play pickup sound

    if (callbackMap[type]) {
  this.scene.time.delayedCall(300, () => {
    callbackMap[type](); // delay powerup activation slightly
  });
}

  },
  null,
  this
);

  }

  reset() {
    this.powerupGroup.clear(true, true);
  }
}
