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

    if (cursors.left.isDown) {
      this.body.setVelocityX(-speed);
      this.setFlipX(true);
      this.hr.setFlipX(true);
      this.facingRight = false;
      moving = true;
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(speed);
      this.setFlipX(false);
      this.hr.setFlipX(false);
      this.facingRight = true;
      moving = true;
    }
	if (cursors.up.isDown && this.y >= 130) {
  this.body.setVelocityY(-speed);
  moving = true;
} else if (cursors.down.isDown) {
  this.body.setVelocityY(speed);
  moving = true;
}




    if (moving) {
      if (!this.anims.isPlaying) this.play("ceo_run");
      if (!this.hr.anims.isPlaying) this.hr.play("hr_run");
    } else {
      this.anims.stop();
      this.setTexture("ceo1");
      this.hr.anims.stop();
      this.hr.setTexture("hr1");
    }

    this.hr.x = this.x - 5;
this.hr.y = this.y + 5;

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

    const proj = this.projectiles.create(spawnX, spawnY, type).setScale(scale);
    proj.startY = proj.throwerY = originY;
    proj.type = type;

    const angleDeg =
      type === "credit_card"
        ? this.facingRight ? -50 : 230
        : this.facingRight ? 10 : 170;

    const angleRad = Phaser.Math.DegToRad(angleDeg);
    const speed = 400;

    proj.body.setVelocity(
      Math.cos(angleRad) * speed,
      Math.sin(angleRad) * speed
    );

    proj.body.setAllowGravity(true);
    proj.body.setGravityY(1300);
    proj.body.onWorldBounds = true;

    this.scene.physics.world.on("worldbounds", body => {
      if (body.gameObject === proj) proj.destroy();
    });
  }
}
