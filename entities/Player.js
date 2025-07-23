export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.07); // ✅ apply scale
    this.setCollideWorldBounds(true);

    this.facingRight = true;
    this.shootToggle = false;

    this.projectiles = scene.physics.add.group();
    this.scene = scene;
  }

  move(cursors, speed = 200) {
    this.body.setVelocity(0);

    if (cursors.left.isDown) {
      this.body.setVelocityX(-speed);
      this.setFlipX(true);
      this.facingRight = false;
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(speed);
      this.setFlipX(false);
      this.facingRight = true;
    }

    if (cursors.up.isDown) {
      this.body.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(speed);
    }
  }




shoot() {
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
    spawnY = originY = this.scene.hr.y; // 💥 match original behavior
  }

  const scale = type === "credit_card" ? 0.015 : 0.06;

  const proj = this.projectiles.create(spawnX, spawnY, type).setScale(scale);
  proj.startY = proj.throwerY = originY;
  proj.type = type;

  const angleDeg =
    type === "credit_card"
      ? this.facingRight ? -50 : 230
      : this.facingRight ? -20 : 200;

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


