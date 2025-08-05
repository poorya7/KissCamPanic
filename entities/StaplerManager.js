import { isBlocked } from "../utils/CrowdUtils.js";
import SoundManager from "../utils/SoundManager.js";

export default class StaplerManager {
	
  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.maxStaplers = 15;
    this.spawnInterval = 2000;

    this.staplerGroup = this.scene.physics.add.group();

    this.scene.time.addEvent({
      delay: this.spawnInterval,
      callback: this.trySpawnStapler,
      callbackScope: this,
      loop: true
    });
  }
  // ───────────────────────────────
  // ▶ trySpawnStapler
  // ───────────────────────────────
 trySpawnStapler() {
  if (this.staplerGroup.countActive(true) >= this.maxStaplers) return;

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
    this.staplerGroup.add(stapler);
    SoundManager.playSFX("powerup");

    return; // ✅ spawn succeeded
  }

  console.warn("⚠️ Could not find valid spot to spawn stapler.");
}

  // ───────────────────────────────
  // ▶ enableCollision
  // ───────────────────────────────
  enableCollision(callback) {
  this.scene.physics.add.overlap(
    this.player,
    this.staplerGroup,
    (player, stapler) => {
      stapler.disableBody(true, true); // Hide but don't destroy
      SoundManager.playSFX("powerup_get");

      if (callback) {
        this.scene.time.delayedCall(300, () => {
          callback();
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
    this.staplerGroup.clear(true, true);
  }
}
