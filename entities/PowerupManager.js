import { isBlocked } from "../utils/CrowdUtils.js";
import SoundManager from "../utils/SoundManager.js";



export default class PowerupManager {
  constructor(scene) {
    this.scene = scene;

    this.maxPowerups = 10;
    this.spawnInterval = 2000; // ms

    this.powerupGroup = this.scene.physics.add.group();
    this.activePowerups = [];

    this.timer = this.scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.trySpawnPowerup,
      callbackScope: this,
      loop: true
    });
  }

  trySpawnPowerup() {
  if (this.powerupGroup.countActive(true) >= this.maxPowerups) return;

  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const x = Phaser.Math.Between(100, this.scene.scale.width - 100);
    const y = Phaser.Math.Between(100, this.scene.scale.height - 100);

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
        if (callbackMap[type]) {
          callbackMap[type](); // call specific powerup effect
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
