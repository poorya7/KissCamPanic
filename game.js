const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 470,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, hr, cursors, kissCam, crowdGroup, projectiles, facingRight = true, shootToggle = false;

function preload() {
  this.load.image("ceo1", "sprites/ceo1.png");
  this.load.image("ceo2", "sprites/ceo2.png");
  this.load.image("hr1", "sprites/hr1.png");
  this.load.image("hr2", "sprites/hr2.png");
  this.load.image("kisscam", "sprites/kisscam.png");
  this.load.image("skin", "sprites/crowd/skin.png");
  this.load.image("hair_f", "sprites/crowd/hair_f.png");
  this.load.image("hair_m", "sprites/crowd/hair_m.png");
  this.load.image("hat1", "sprites/crowd/hat1.png");
  this.load.image("shirt", "sprites/crowd/shirt.png");
  this.load.image("pants", "sprites/crowd/pants.png");
  this.load.image("credit_card", "sprites/cc.png");
  this.load.image("briefcase", "sprites/case.png");
  this.load.image("stage", "sprites/stage.png");
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on("keydown-SPACE", shootProjectile, this);

  const stage = this.add.image(400, 20, "stage").setOrigin(0.48, 0.12).setScale(0.5);

  player = this.physics.add.sprite(100, 100, "ceo1").setScale(0.07);
  player.body.setCollideWorldBounds(true);
  hr = this.physics.add.sprite(90, 110, "hr1").setScale(0.07);
  hr.body.setCollideWorldBounds(true);

  this.anims.create({ key: "ceo_run", frames: [{ key: "ceo1" }, { key: "ceo2" }], frameRate: 8, repeat: -1 });
  this.anims.create({ key: "hr_run", frames: [{ key: "hr1" }, { key: "hr2" }], frameRate: 8, repeat: -1 });

  kissCam = this.physics.add.sprite(400, 235, "kisscam").setScale(0.07);
  kissCam.body.setCollideWorldBounds(true);

  crowdGroup = this.physics.add.group({ immovable: true, allowGravity: false });
  generateCrowd.call(this);

  projectiles = this.physics.add.group();

  this.physics.add.collider(player, crowdGroup);
  this.physics.add.collider(hr, crowdGroup);
  this.physics.add.collider(player, hr);
  this.physics.add.overlap(projectiles, crowdGroup, projectileHitsCrowd, null, this);
}

function generateCrowd() {
  const spacing = 35;
  for (let y = 20; y < 520; y += spacing) {
    for (let x = 10; x < 800; x += spacing) {
      spawnCrowdMember.call(this, x, y);
    }
  }
}

function spawnCrowdMember(x, y) {
  // Exclusion zone: avoid green rectangle area
  const insideStageBox = (x > 260 && x < 540 && y < 200);
  if (insideStageBox) return;

  // 3x denser crowd (increase spawn chance)
  if (Phaser.Math.Between(0, 100) > 50) {
    const px = x + Phaser.Math.Between(-5, 5);
    let py = y + Phaser.Math.Between(-5, 5);
    //if (py < 120) py = 120;

    const scale = 0.07;

    const base = this.physics.add.sprite(px, py, "skin").setScale(scale);
    base.setImmovable(true);
    base.setVisible(false);

    const hairStyle = Phaser.Math.RND.pick(["hair_f", "hair_m", "hat1"]);

    const visuals = this.add.container(px, py, [
      this.add.sprite(0, 0, "skin").setScale(scale),
      this.add.sprite(0, 0, "pants").setScale(scale).setTint(randomColor()),
      this.add.sprite(0, 0, "shirt").setScale(scale).setTint(randomColor()),
      this.add.sprite(0, 0, hairStyle).setScale(scale).setTint(randomColor())
    ]);

    base.visuals = visuals;
    crowdGroup.add(base);
  }
}

function randomColor() {
  return Phaser.Display.Color.GetColor(
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255)
  );
}

function shootProjectile() {
  let type = shootToggle ? "credit_card" : "briefcase";
  shootToggle = !shootToggle;

  let spawnX, spawnY;
  let originY;

  if (type === "credit_card") {
    const offsetX = facingRight ? 10 : -10;
    spawnX = player.x + offsetX;
    spawnY = player.y;
    originY = player.y;
  } else {
    const offsetX = facingRight ? 8 : -8;
    spawnX = hr.x + offsetX;
    spawnY = hr.y;
    originY = hr.y;
  }

  const proj = projectiles.create(spawnX, spawnY, type).setScale(type === "credit_card" ? 0.015 : 0.06);
  proj.startY = originY;
  proj.throwerY = originY;
  proj.type = type;

  if (type === "credit_card") {
    const speed = 400;
    const angleDeg = facingRight ? -50 : 230;
    const angleRad = Phaser.Math.DegToRad(angleDeg);
    const velX = Math.cos(angleRad) * speed;
    const velY = Math.sin(angleRad) * speed;

    proj.body.setVelocityX(velX);
    proj.body.setVelocityY(velY);
    proj.body.setAllowGravity(true);
    proj.body.setGravityY(1300);
  } else if (type === "briefcase") {
    const speed = 400;
    const angleDeg = facingRight ? -20 : 200;
    const angleRad = Phaser.Math.DegToRad(angleDeg);
    const velX = Math.cos(angleRad) * speed;
    const velY = Math.sin(angleRad) * speed;

    proj.body.setVelocityX(velX);
    proj.body.setVelocityY(velY);
    proj.body.setAllowGravity(true);
    proj.body.setGravityY(1300);
  }

  proj.body.onWorldBounds = true;
  proj.body.world.on("worldbounds", body => {
    if (body.gameObject === proj) {
      proj.destroy();
    }
  });
}

function projectileHitsCrowd(proj, crowd) {
  proj.destroy();
  if (crowd.visuals) crowd.visuals.destroy();
  crowd.destroy();
}

function update() {
  const speed = 200;
  let moving = false;
  player.body.setVelocity(0);

  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
    player.setFlipX(true);
    hr.setFlipX(true);
    moving = true;
    facingRight = false;
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
    player.setFlipX(false);
    hr.setFlipX(false);
    moving = true;
    facingRight = true;
  }

  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
    moving = true;
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
    moving = true;
  }

  if (moving) {
    if (!player.anims.isPlaying) player.play("ceo_run");
    if (!hr.anims.isPlaying) hr.play("hr_run");
  } else {
    player.anims.stop();
    player.setTexture("ceo1");
    hr.anims.stop();
    hr.setTexture("hr1");
  }

  hr.x = player.x - 10;
  hr.y = player.y + 10;

  const chaseSpeed = 10;
  kissCam.body.setVelocity(
    kissCam.x < player.x ? chaseSpeed : kissCam.x > player.x ? -chaseSpeed : 0,
    kissCam.y < player.y ? chaseSpeed : kissCam.y > player.y ? -chaseSpeed : 0
  );

  crowdGroup.getChildren().forEach(base => {
    if (base.visuals) {
      base.visuals.x = base.x;
      base.visuals.y = base.y;
    }
  });

  projectiles.getChildren().forEach(proj => {
    if (proj.type === "credit_card") {
      proj.rotation += 0.3;
      const flip = Math.abs(Math.sin(this.time.now * 0.02));
      proj.setScale(0.015 * flip, 0.015);
      if (proj.y > proj.startY) proj.destroy();
    } else if (proj.type === "briefcase") {
      if (proj.y >= proj.throwerY + 5) {
        proj.destroy();
      }
    }
  });
  
  // Restrict player and HR from entering the stage rectangle (clean approach)
if (player.x > 260 && player.x < 540 && player.y < 200) {
  if (cursors.up.isDown) player.body.setVelocityY(0);
  if (cursors.left.isDown && player.x >= 260) player.body.setVelocityX(0);
  if (cursors.right.isDown && player.x <= 540) player.body.setVelocityX(0);
}

if (hr.x > 260 && hr.x < 540 && hr.y < 200) {
  if (cursors.up.isDown) hr.body.setVelocityY(0);
  if (cursors.left.isDown && hr.x >= 260) hr.body.setVelocityX(0);
  if (cursors.right.isDown && hr.x <= 540) hr.body.setVelocityX(0);
}

}
