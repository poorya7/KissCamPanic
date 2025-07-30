
import SoundManager from "../utils/SoundManager.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.07);
    this.setCollideWorldBounds(true);

    this.facingRight = true;
    this.shootToggle = false;

    this.projectiles = scene.physics.add.group();
    this.scene = scene;

	this.disableMovement = false;

    this.hr = null; // ✅ assigned later from MainScene
  }

enableRapidFire() {
  if (this.rapidFireEvent) {
    this.rapidFireEvent.remove(false);
  }

  this.rapidFireEvent = this.scene.time.addEvent({
    delay: 50, // fire every 100ms
    callback: () => {
      if (!this.disableMovement) {
        this.shoot();
      }
    },
    callbackScope: this,
    loop: true
  });
}


disableRapidFire() {
  if (this.rapidFireEvent) {
    this.rapidFireEvent.remove(false);
    this.rapidFireEvent = null;
  }
}


move(cursors, speed = 200) {
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




	

  shoot() {
  if (this.disableMovement) return;
    const type = this.shootToggle ? "credit_card" : "briefcase";
    this.shootToggle = !this.shootToggle;

    let spawnX, spawnY, originY;

    if (type === "credit_card") {
      const offsetX = this.facingRight ? 10 : -10;
      spawnX = this.x + offsetX;
      spawnY = originY = this.y;
    } else {
      const offsetX = this.facingRight ? 8 : -8;
      spawnX = this.x + offsetX;
      spawnY = originY = this.hr.y;
    }

    const scale = type === "credit_card" ? 0.015 : 0.06;
	
	if (type === "credit_card") {
  SoundManager.playSFX("shoot1");
} else {
  SoundManager.playSFX("shoot2");
}




    const proj = this.projectiles.create(spawnX, spawnY, type).setScale(scale);
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

    this.scene.physics.world.on("worldbounds", body => {
      if (body.gameObject === proj) proj.destroy();
    });
  }
}
