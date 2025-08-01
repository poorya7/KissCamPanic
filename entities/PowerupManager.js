import { isBlocked } from "../utils/CrowdUtils.js";
import SoundManager from "../utils/SoundManager.js";

export default class PowerupManager {
  constructor(scene) {
    this.scene = scene;

    this.maxPowerups = 15;
    this.spawnInterval = 2000;

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
  const active = this.powerupGroup.countActive(true);
  const padded = active.toString().padStart(2, "0");
  this.powerupText.setText(`${padded}/${this.maxPowerups}`);
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
