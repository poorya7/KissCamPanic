
import SoundManager from "../utils/SoundManager.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
	
  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);

  this.mugBurstSettings = {
    delay: 100,
    speed: 1000,
    duration: 1000
  };

  this.shootSound1 = this.scene.sound.add("shoot1", { volume: 1 });
  this.shootSound2 = this.scene.sound.add("shoot2", { volume: 1 });

  this.hasUsedRapidFireBefore = false;

  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setScale(0.07);
  this.setCollideWorldBounds(true);

  this.facingRight = true;
  this.shootToggle = false;

  this.projectiles = scene.physics.add.group({
    runChildUpdate: true,
    maxSize: -1 // allow unlimited projectiles
  });

  this.scene = scene;
  this.disableMovement = false;
  this.hr = null; // ✅ assigned later from MainScene

  this.scene.physics.world.on("worldbounds", (body) => {
    if (
      body.gameObject?.texture?.key === "credit_card" ||
      body.gameObject?.texture?.key === "briefcase"
    ) {
      body.gameObject.destroy();
    }
  });

  this.lastRapidFireShotTime = 0;
  this.rapidFireInterval = 1000; // default value (will be set dynamically)
  this.rapidFireActive = false;
}


  // ───────────────────────────────
  // ▶ enableRapidFire
  // ───────────────────────────────

enableRapidFire() {
  this.rapidFireInterval = this.getDynamicRapidFireDelay();
  this.lastRapidFireShotTime = this.scene.time.now;
  this.rapidFireActive = true;
}

// ───────────────────────────────
// ▶ triggerMugBurst
// ───────────────────────────────
triggerMugBurst(settings = this.mugBurstSettings) {
  const { delay, speed, duration } = settings || this.mugBurstSettings;

  this.scene.time.delayedCall(delay, () => {
    this.ignoreCrowdCollision = true;

    const vx = this.body.velocity.x;
    const vy = this.body.velocity.y;

    const mag = Math.sqrt(vx * vx + vy * vy) || 1; // avoid divide-by-zero
    const unitX = vx / mag;
    const unitY = vy / mag;

    this.setVelocity(unitX * speed, unitY * speed);
    SoundManager.playSFX("burst");

    this.startBurstTrail(duration);

    this.scene.time.delayedCall(duration, () => {
      this.setVelocityX(0);
      this.ignoreCrowdCollision = false;
      console.log("🛑 Burst ended");
    });
  });
}

// ───────────────────────────────
// ▶ startBurstTrail
// ───────────────────────────────
startBurstTrail(duration = 200) {
  const interval = 40;
  const endTime = this.scene.time.now + duration;

  const trailEvent = this.scene.time.addEvent({
    delay: interval,
    callback: () => {
      const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key)
        .setAlpha(0.4)
        .setScale(this.scaleX, this.scaleY)
        .setFlipX(!this.facingRight)
        .setDepth(this.depth - 1);

      this.scene.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 200,
        onComplete: () => ghost.destroy()
      });

      // Optional: Add HR ghost too
      if (this.hr) {
        const hrGhost = this.scene.add.sprite(this.hr.x, this.hr.y, this.hr.texture.key)
          .setAlpha(0.4)
          .setScale(this.hr.scaleX, this.hr.scaleY)
          .setFlipX(!this.facingRight)
          .setDepth(this.hr.depth - 1);

        this.scene.tweens.add({
          targets: hrGhost,
          alpha: 0,
          duration: 200,
          onComplete: () => hrGhost.destroy()
        });
      }

      if (this.scene.time.now >= endTime) {
        trailEvent.remove(false);
      }
    },
    callbackScope: this,
    loop: true
  });
}



  // ───────────────────────────────
  // ▶ getDynamicRapidFireDelay
  // ───────────────────────────────
getDynamicRapidFireDelay() {
  const manager = this.scene.powerupManager;
  const total = Phaser.Math.Clamp(manager.totalRapidFireTime, 0, manager.maxRapidFireDuration);

  if (total <= 2000) return 70; // 🔒 Lock first powerup to slowest speed

  const ratio = Phaser.Math.Clamp(total / manager.maxRapidFireDuration, 0, 1);
  const minDelay = 30;
  const maxDelay = 70;

  return Math.floor(maxDelay - ratio * (maxDelay - minDelay));
}

  // ───────────────────────────────
  // ▶ disableRapidFire
  // ───────────────────────────────
disableRapidFire() {
  this.rapidFireActive = false;
}


  // ───────────────────────────────
  // ▶ updateRapidFireSpeed
  // ───────────────────────────────

updateRapidFireSpeed() {
  if (!this.rapidFireActive) return;
  this.rapidFireInterval = this.getDynamicRapidFireDelay();
}

  // ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
update() {
  if (this.rapidFireActive && !this.disableMovement) {
    const now = this.scene.time.now;
    if (now - this.lastRapidFireShotTime >= this.rapidFireInterval) {
      this.shoot();
      this.lastRapidFireShotTime = now;
    }
  }
}

  // ───────────────────────────────
  // ▶ move
  // ───────────────────────────────
move(cursors, speed = 200) {
  if (this.ignoreCrowdCollision) return;

  if (this.disableMovement) {
    this.body.setVelocity(0);
    this.anims.stop();
    this.setTexture("ceo1");
    if (this.hr) {
      this.hr.anims.stop();
      this.hr.setTexture("hr1");
    }
    return;
  }

  let moving = false;
  this.body.setVelocity(0);

  // Horizontal Movement
  if (cursors.left.isDown) {
    this.body.setVelocityX(-speed);
    this.setFlipX(true);
    if (this.hr) this.hr.setFlipX(true);
    this.facingRight = false;
    moving = true;
  } else if (cursors.right.isDown) {
    this.body.setVelocityX(speed);
    this.setFlipX(false);
    if (this.hr) this.hr.setFlipX(false);
    this.facingRight = true;
    moving = true;
  }

  // Vertical Movement
  if (cursors.up.isDown && this.y >= 130) {
    this.body.setVelocityY(-speed);
    moving = true;
  } else if (cursors.down.isDown) {
    this.body.setVelocityY(speed);
    moving = true;
  }

  // Animation
  if (moving) {
    if (!this.anims.isPlaying) this.play("ceo_run");
    if (this.hr && !this.hr.anims.isPlaying) this.hr.play("hr_run");
  } else {
    this.anims.stop();
    this.setTexture("ceo1");
    if (this.hr) {
      this.hr.anims.stop();
      this.hr.setTexture("hr1");
    }
  }

  // ✅ Smooth HR Sync — Avoid Jitter
  if (this.hr) {
    this.hr.setPosition(this.x - 5, this.y + 5);
  }
}

  // ───────────────────────────────
  // ▶ shoot
  // ───────────────────────────────

// 🔫 Used by rapid fire and manual
shoot() {
  if (this.disableMovement) return;
  this._shootSingle(this.shootToggle ? "credit_card" : "briefcase");
  this.shootToggle = !this.shootToggle;
}

  // ───────────────────────────────
  // ▶ manualShoot
  // ───────────────────────────────
// 🎯 New: used by manual (spacebar) input only
	manualShoot() {
	  if (this.disableMovement) return;

	  this._shootSingle("credit_card");

	  this.scene.time.delayedCall(100, () => {
		this._shootSingle("briefcase");
	  });
	}

  // ───────────────────────────────
  // ▶ _shootSingle
  // ───────────────────────────────

// 🧠 New: does the actual projectile logic
_shootSingle(type) {
  const offsetX = this.facingRight
    ? type === "credit_card" ? 10 : 8
    : type === "credit_card" ? -10 : -8;

  const spawnX = this.x + offsetX;
  const spawnY =
    type === "credit_card"
      ? this.y
      : this.hr
      ? this.hr.y
      : this.y;

  const originY = spawnY;
  const scale = type === "credit_card" ? 0.015 : 0.06;

  if (type === "credit_card") {
    SoundManager.playSFX("shoot1");
  } else {
    SoundManager.playSFX("shoot2");
  }

  const proj = this.projectiles.create(spawnX, spawnY, type)?.setScale(scale);
  if (!proj) {
    console.warn("❌ Failed to create projectile of type:", type);
    return;
  }

  proj.startY = proj.throwerY = originY;
  proj.type = type;

  const angleDeg =
    type === "credit_card"
      ? this.facingRight ? -50 : 230
      : this.facingRight ? 10 : 170;

  const angleRad = Phaser.Math.DegToRad(angleDeg);
  const speed = 400;

  const playerVX = this.body.velocity.x;
  const playerVY = this.body.velocity.y;

  proj.body.setVelocity(
    Math.cos(angleRad) * speed + playerVX,
    Math.sin(angleRad) * speed + playerVY
  );

  proj.body.setAllowGravity(true);
  proj.body.setGravityY(1300);
  proj.body.onWorldBounds = true;
}




}
  
  