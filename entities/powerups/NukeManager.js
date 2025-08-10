import { isBlocked } from "../../utils/CrowdUtils.js";
import SoundManager from "../../utils/SoundManager.js";

export default class NukeManager {
  // ───────────────────────────────
  // ▶ Spawn config (powerup)
  // ───────────────────────────────
  NUKE_FIRST_DELAY_MS = 10000;     // first nuke after 10s
  NUKE_SPAWN_INTERVAL_MS = 15000;  // schedule next spawn this long AFTER the BOOM
  MAX_NUKES_ON_FIELD = 1;          // max at once

  // ───────────────────────────────
  // ▶ Refill config (after nuke)
  // ───────────────────────────────
  TRICKLE_START_DELAY_MS = 2000;   // wait after the nuke before refill starts
  TRICKLE_MIN_DELAY_MS   = 2000;   // earliest spawn after start delay
  TRICKLE_MAX_DELAY_MS   = 10000;  // latest spawn after start delay
  TRICKLE_BATCH_SIZE     = 1;

  // ───────────────────────────────
  // ▶ Audio sequence timing
  // ───────────────────────────────
  COUNTDOWN_LEAD_MS      = 1000;   // pickup → wait 1s
  COUNTDOWN_DURATION_MS  = 3000;   // countdown length (3s)

  // ───────────────────────────────
  // ▶ Camera shake
  // ───────────────────────────────
  SHAKE_DURATION_MS        = 200;     // 180–220 feels good
  SHAKE_INTENSITY_DESKTOP  = 0.008;   // desktop shake strength
  SHAKE_INTENSITY_MOBILE   = 0.005;   // mobile shake strength (lower to avoid nausea)

  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.nukeGroup = this.scene.physics.add.group();

    this._isNuking = false;
    this._pendingSequence = false; // prevents double pickup sequences
    this._nextSpawnTimer = null;   // handle to the post-BOOM spawn timer

    // First spawn ONLY once after the initial delay
    this._nextSpawnTimer = this.scene.time.delayedCall(
      this.NUKE_FIRST_DELAY_MS,
      () => this.trySpawnNuke()
    );
  }

  // ───────────────────────────────
  // ▶ Spawning (no repeating loop)
  // ───────────────────────────────
  trySpawnNuke() {
    if (this._pendingSequence || this._isNuking) return;
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
        .setScale(0.092)        // your chosen scale
        .setDepth(y - 1)
        .setImmovable(true);

      nuke.powerupType = "nuke";
      this.nukeGroup.add(nuke);
      return; // ✅ spawned one
    }

    console.warn("⚠️ Could not find valid spot to spawn nuke.");
  }

  // ───────────────────────────────
  // ▶ Collision → SFX sequence → nuke
  // ───────────────────────────────
  enableCollision() {
    this.scene.physics.add.overlap(
      this.player,
      this.nukeGroup,
      (player, nuke) => {
        if (this._pendingSequence || this._isNuking) return;
        this._pendingSequence = true;

        // remove pickup
        this.nukeGroup.remove(nuke, true, true);

        // 1) play collect immediately
        SoundManager.playSFX("nuke_collect");

        // Freeze ALL crowd spawns through: lead + countdown + post-nuke delay
        const totalFreeze =
          this.COUNTDOWN_LEAD_MS + this.COUNTDOWN_DURATION_MS + this.TRICKLE_START_DELAY_MS;
        const until = this.scene.time.now + totalFreeze;
        this.scene._nukeSpawnFreezeUntil = Math.max(
          this.scene._nukeSpawnFreezeUntil || 0,
          until
        );

        // 2) after lead, play countdown
        this.scene.time.delayedCall(this.COUNTDOWN_LEAD_MS, () => {
          SoundManager.playSFX("nuke_countdown");
        });

        // 3) after lead+duration, do the nuke (and play boom)
        this.scene.time.delayedCall(this.COUNTDOWN_LEAD_MS + this.COUNTDOWN_DURATION_MS, () => {
          this.triggerNuke();
          this._pendingSequence = false;
        });
      },
      null,
      this
    );
  }

  // ───────────────────────────────
  // ▶ Do the nuke (wipe everyone) + delayed trickle refill
  //   and schedule NEXT SPAWN after the BOOM.
  // ───────────────────────────────
  triggerNuke() {
    if (this._isNuking) return;
    this._isNuking = true;

    // BOOM
    SoundManager.playSFX("nuke");

    // 💥 Camera shake
    const cam = this.scene.cameras.main;
    const isMobile = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const intensity = isMobile ? this.SHAKE_INTENSITY_MOBILE : this.SHAKE_INTENSITY_DESKTOP;
    cam?.shake?.(this.SHAKE_DURATION_MS, intensity);

    // 🔆 Shockwave at the player's position (ground ripple)
    this.spawnShockwave(this.player.x, this.player.y);

    // Clone children so we can safely destroy while iterating
    const members = [...this.scene.crowdGroup.getChildren()];
    for (const m of members) {
      if (!m || !m.active) continue;

      this.scene.playPoof(m.x, m.y);
      if (m.visuals && m.visuals.destroy) m.visuals.destroy();
      m.destroy();

      this.scene.scoreUI?.addToScore(40);
    }

    // Keep freeze at least through the post-nuke delay
    const minFreeze = this.scene.time.now + this.TRICKLE_START_DELAY_MS;
    this.scene._nukeSpawnFreezeUntil = Math.max(
      this.scene._nukeSpawnFreezeUntil || 0,
      minFreeze
    );

    // Start trickle after the post-nuke delay
    this.scene.time.delayedCall(this.TRICKLE_START_DELAY_MS, () => {
      this.scene._nukeSpawnFreezeUntil = 0; // release freeze
      this.scheduleRefill();
    });

    // 👉 Schedule the NEXT nuke spawn AFTER the BOOM (cooldown-from-explosion)
    if (this._nextSpawnTimer) {
      this._nextSpawnTimer.remove(false);
      this._nextSpawnTimer = null;
    }
    this._nextSpawnTimer = this.scene.time.delayedCall(
      this.NUKE_SPAWN_INTERVAL_MS,
      () => this.trySpawnNuke()
    );

    // allow another nuke after this tick
    this.scene.time.delayedCall(0, () => (this._isNuking = false));
  }

  // ───────────────────────────────
  // ▶ Shockwave ring (ground ripple, perspective)
  // ───────────────────────────────
  spawnShockwave(x, y) {
    const key = this.ensureShockwaveTexture();

    // Place “on the floor”: below crowd visuals (which are at y + 100), above stage
    const img = this.scene.add.image(x, y, key)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(99)          // below all visuals (min visuals depth ≈ y+100)
      .setAlpha(0.9)
      .setOrigin(0.5, 0.6)   // bias downward for a ground feel
      .setScale(0.3, 0.14);  // start elliptical (X > Y)

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const texSize = 256; // diameter of our generated texture

    const targetScaleX = (Math.max(w, h) / texSize) * 1.35; // expand past screen
    const targetScaleY = targetScaleX * 0.42;                // keep squashed for perspective
    const driftY = 14;                                       // slight forward roll

    this.scene.tweens.add({
      targets: img,
      scaleX: { from: img.scaleX, to: targetScaleX },
      scaleY: { from: img.scaleY, to: targetScaleY * 0.9 }, // squash a bit more as it grows
      y: { from: y, to: y + driftY },
      alpha: { from: 0.9, to: 0 },
      duration: 800,
      ease: "Cubic.Out",
      onComplete: () => img.destroy()
    });
  }

  ensureShockwaveTexture() {
    const key = "nuke_shockwave_ring_ground";
    if (this.scene.textures.exists(key)) return key;

    const size = 256;     // texture width/height
    const r = size / 2;
    const thickness = 34; // ring thickness
    const steps = 10;     // more steps = softer falloff

    const g = this.scene.add.graphics({ x: 0, y: 0 });
    g.clear();

    // Outer-to-inner concentric strokes with fading alpha for a soft falloff
    for (let i = 0; i < steps; i++) {
      const t = thickness * (1 - i / steps);
      const alpha = 0.22 * (1 - i / steps); // outer soft, inner brighter
      g.lineStyle(t, 0xffffff, Math.max(0.03, alpha));
      g.strokeCircle(r, r, r - t / 2);
    }

    g.generateTexture(key, size, size);
    g.destroy();
    return key;
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
    this._pendingSequence = false;

    if (this._nextSpawnTimer) {
      this._nextSpawnTimer.remove(false);
      this._nextSpawnTimer = null;
    }

    // ensure future bullet-kill spawns aren’t held back
    this.scene._nukeSpawnFreezeUntil = 0;
  }
}
