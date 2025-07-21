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

let player, hr, cursors, kissCam, crowdGroup, projectiles, facingRight = true;

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
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on("keydown-SPACE", shootCreditCard, this);

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
  for (let y = 0; y < 470; y += spacing) {
    for (let x = 0; x < 800; x += spacing) {
      if (Phaser.Math.Between(0, 100) > 75) {
        const px = x + Phaser.Math.Between(-5, 5);
        const py = y + Phaser.Math.Between(-5, 5);
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
  }
}

function randomColor() {
  return Phaser.Display.Color.GetColor(
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255)
  );
}

function shootCreditCard() {
  const offsetX = facingRight ? 10 : -10;
  const card = projectiles.create(player.x + offsetX, player.y, "credit_card").setScale(0.02);

  card.startY = player.y;

  const speed = 400;
  const angleDeg = facingRight ? -50 : 230;
  const angleRad = Phaser.Math.DegToRad(angleDeg);

  const velX = Math.cos(angleRad) * speed;
  const velY = Math.sin(angleRad) * speed;

  card.body.setVelocityX(velX);
  card.body.setVelocityY(velY);
  card.body.setAllowGravity(true);
  card.body.setGravityY(1300);

  card.body.onWorldBounds = true;
  card.body.world.on("worldbounds", body => {
    if (body.gameObject === card) {
      card.destroy();
    }
  });
}

function projectileHitsCrowd(card, crowd) {
  card.destroy();
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

  const chaseSpeed = 80;
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

  projectiles.getChildren().forEach(card => {
    // Spin around Z axis
    card.rotation += 0.3;

    // Fake 3D flip using scaleX oscillation
    const flip = Math.abs(Math.sin(this.time.now * 0.02));
    card.setScale(0.02 * flip, 0.02);

    // Auto-destroy when falling below startY
    if (card.y > card.startY) {
      card.destroy();
    }
  });
}
