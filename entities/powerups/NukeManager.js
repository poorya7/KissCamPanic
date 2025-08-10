import { isBlocked } from "../../utils/CrowdUtils.js";
import SoundManager from "../../utils/SoundManager.js";

export default class NukeManager {
  // ───────────────────────────────
  // ▶ Spawn config (powerup)
  // ───────────────────────────────
  NUKE_FIRST_DELAY_MS = 10000;     // first nuke after 10s
  NUKE_SPAWN_INTERVAL_MS = 10000;  // every 10s thereafter
  MAX_NUKES_ON_FIELD = 1;          // max at once

  // ───────────────────────────────
  // ▶ Refill config (after nuke)
  // ───────────────────────────────
  TRICKLE_START_DELAY_MS = 2000;   // ⏸ wait before any trickle starts
  TRICKLE_MIN_DELAY_MS   = 2000;   // earliest respawn after start delay
  TRICKLE_MAX_DELAY_MS   = 10000;  // latest respawn after start delay
  TRICKLE_BATCH_SIZE     = 1;      // how many to request per scheduled tick

  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.nukeGroup = this.scene.physics.add.group();
    this._isNuking = false;

    // First spawn after delay, then repeat
    this.scene.time.delayedCall(this.NUKE_FIRST_DELAY_MS, () => {
      this.trySpawnNuke();

      this.scene.time.addEvent({
        delay: this.NUKE_SPAWN_INTERVAL_MS,
        callback: this.trySpawnNuke,
        callbackScope: this,
        loop: true
      });
    });
  }

  // ───────────────────────────────
  // ▶ Spawning
  // ───────────────────────────────
  trySpawnNuke() {
    if (this.nukeGroup.countActive(true) >= this.MAX_NUKES_ON_FIELD) return;

    const maxAttempts = 20;
    const minDistance = 150;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
      const y = Phaser.Math.Between(100, this.scene.scale.height - 10);

      if (isBlocked(this.scene, x, y)) continue;

      const tooClose = this.nukeGroup.getChildren().some(nuke =>
        Phaser.Math.Distance.Between(x, y, nuke.x, nuke.y) < minDistance
      );
      if (tooClose) continue;

      const nuke = this.scene.physics.add.sprite(x, y, "nuke")
        .setScale(0.092)        // ← your preferred scale
        .setDepth(y - 1)
        .setImmovable(true);

      nuke.powerupType = "nuke";
      this.nukeGroup.add(nuke);

      // Sound later if desired: SoundManager.playSFX("powerup");
      return;
    }

    console.warn("⚠️ Could not find valid spot to spawn nuke.");
  }

  // ───────────────────────────────
  // ▶ Collision hookup
  // ───────────────────────────────
  enableCollision(onPickup) {
    this.scene.physics.add.overlap(
      this.player,
      this.nukeGroup,
      (player, nuke) => {
        // remove the pickup instantly
        this.nukeGroup.remove(nuke, true, true);

        // optional SFX later: SoundManager.playSFX("nuke_get");

        if (onPickup) onPickup();
        else this.triggerNuke();
      },
      null,
      this
    );
  }

  // ───────────────────────────────
  // ▶ Do the nuke (wipe everyone) + delayed trickle refill
  // ───────────────────────────────
  triggerNuke() {
    if (this._isNuking) return;
    this._isNuking = true;

    // Clone children so we can safely destroy while iterating
    const members = [...this.scene.crowdGroup.getChildren()];

    for (const m of members) {
      if (!m || !m.active) continue;

      // mirror your projectile kill flow
      this.scene.playPoof(m.x, m.y);
      if (m.visuals && m.visuals.destroy) m.visuals.destroy();
      m.destroy();

      this.scene.scoreUI?.addToScore(40);
    }
	
	// ⏸ block all spawns until this time (respected by CrowdSpawner guards)
this.scene._nukeSpawnFreezeUntil = this.scene.time.now + this.TRICKLE_START_DELAY_MS;

// ⏸ Add a gap before refill starts (lets old 3s bullet timers fire)
this.scene.time.delayedCall(this.TRICKLE_START_DELAY_MS, () => {
  this.scheduleRefill();
});

    // allow another nuke after this tick
    this.scene.time.delayedCall(0, () => (this._isNuking = false));
  }

  // ───────────────────────────────
  // ▶ Staggered refill logic
  // ───────────────────────────────
  scheduleRefill() {
    const target = this.scene.maxCrowdSize || 0;
    const current = this.scene.crowdGroup.countActive(true);
    const needed = Math.max(0, target - current);

    if (needed === 0) return;

    for (let i = 0; i < needed; i += this.TRICKLE_BATCH_SIZE) {
      const delay = Phaser.Math.Between(this.TRICKLE_MIN_DELAY_MS, this.TRICKLE_MAX_DELAY_MS);

      this.scene.time.delayedCall(delay, () => {
        // Guard against overspawn if other systems already refilled some
        const activeNow = this.scene.crowdGroup.countActive(true);
        if (activeNow >= target) return;

        for (let j = 0; j < this.TRICKLE_BATCH_SIZE; j++) {
          this.scene.crowdSpawner.spawnInLeastCrowdedArea();
        }
      });
    }
  }

  // ───────────────────────────────
  // ▶ Reset
  // ───────────────────────────────
  reset() {
    this.nukeGroup.clear(true, true);
    this._isNuking = false;
  }
}
