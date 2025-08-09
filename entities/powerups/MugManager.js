import { isBlocked } from "../../utils/CrowdUtils.js";
import SoundManager from "../../utils/SoundManager.js";


export default class MugManager {
	
  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.maxMugs = 2;
    this.mugSpawnInterval = 5000; // 5 seconds

    this.mugGroup = this.scene.physics.add.group();

    this.scene.time.addEvent({
      delay: this.mugSpawnInterval,
      callback: this.trySpawnMug,
      callbackScope: this,
      loop: true
    });
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
    const tooClose = this.mugGroup.getChildren().some(mug =>
  Phaser.Math.Distance.Between(x, y, mug.x, mug.y) < minDistance
);
if (tooClose) continue;


    const mug = this.scene.physics.add.sprite(x, y, "mug")
      .setScale(0.07)
      .setDepth(y - 1)
      .setImmovable(true);

    mug.powerupType = "mug";
    this.mugGroup.add(mug);
    SoundManager.playSFX("powerup");

    return; // ✅ spawn successful
  }

  console.warn("⚠️ Could not find valid spot to spawn mug.");
}

  // ───────────────────────────────
  // ▶ enableCollision
  // ───────────────────────────────
 enableCollision(callback) {
  this.scene.physics.add.overlap(
    this.player,
    this.mugGroup,
    (player, powerup) => {

      // ✅ Fully remove mug from group and destroy it
      this.mugGroup.remove(powerup, true, true);

      SoundManager.playSFX("mug_get");

      if (callback) {
        this.scene.time.delayedCall(300, () => {
          callback();


		const isMobile = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
		const boostSpeed = isMobile ? 600 : 350; // mobile gets higher burst, PC unchanged
		this.player.enableBurstMode(750, boostSpeed);

		  
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
    this.mugGroup.clear(true, true);
  }
}
