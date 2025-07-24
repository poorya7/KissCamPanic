import CrowdSpawner from "../entities/CrowdSpawner.js";
import Player from "../entities/Player.js";
import {
  isInsideStage,
  isInsideKissCam,
  randomHairColor,
  randomColor
} from "../utils/CrowdUtils.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image("ceo1", "sprites/ceo1.png");
    this.load.image("ceo2", "sprites/ceo2.png");
    this.load.image("hr1", "sprites/hr1.png");
    this.load.image("hr2", "sprites/hr2.png");

    this.load.image("skin", "sprites/crowd/skin.png");
    this.load.image("hair_f", "sprites/crowd/hair_f.png");
    this.load.image("hair_m", "sprites/crowd/hair_m.png");
    this.load.image("hat1", "sprites/crowd/hat1.png");
    this.load.image("shirt", "sprites/crowd/shirt.png");
    this.load.image("pants", "sprites/crowd/pants.png");

    this.load.image("credit_card", "sprites/cc.png");
    this.load.image("briefcase", "sprites/case.png");

    this.load.image("stage", "sprites/stage.png");
    this.load.image("kisscam1", "sprites/kisscam1.png");
    this.load.image("kisscam2", "sprites/kisscam2.png");
  }



  create() {
    this.stage = this.add.image(400, 100, "stage").setOrigin(0.48, 0.12).setScale(0.5);

    this.kissCamFrame = this.add.image(400, 40, "kisscam1").setScale(0.07).setDepth(1000);
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => {
        const key = this.kissCamFrame.texture.key;
        this.kissCamFrame.setTexture(key === "kisscam1" ? "kisscam2" : "kisscam1");
      }
    });

    this.kissCamFeed = this.add.renderTexture(365, 20, 70, 70);
    this.kissCamFeed.setDepth(999);
    this.kissCamFeed.setOrigin(0, 0);
	
	// === Create oval mask for kiss cam feed ===
const maskGraphics = this.make.graphics({ x: 0, y: 0, add: true }); // 👈 add: true!

maskGraphics.fillStyle(0xffffff);



const ellipse = new Phaser.Geom.Ellipse(400, 54, 40, 56);




maskGraphics.fillEllipseShape(ellipse);

// Create geometry mask from it
const kissCamMask = maskGraphics.createGeometryMask();
this.kissCamFeed.setMask(kissCamMask);

maskGraphics.visible = false;


    this.player = new Player(this, 100, 100, "ceo1");
    this.hr = this.physics.add.sprite(90, 110, "hr1").setScale(0.07);
    this.player.hr = this.hr;
    this.hr.setCollideWorldBounds(true);

    this.anims.create({ key: "ceo_run", frames: [{ key: "ceo1" }, { key: "ceo2" }], frameRate: 8, repeat: -1 });
    this.anims.create({ key: "hr_run", frames: [{ key: "hr1" }, { key: "hr2" }], frameRate: 8, repeat: -1 });

	this.spotlightMarker = this.add.circle(800, 0, 30, 0xffffff, 0.3); // top-right corner

    this.spotlightMarker.setDepth(1000);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.projectiles = this.physics.add.group();
    this.player.projectiles = this.projectiles;

    this.crowdGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.crowdSpawner = new CrowdSpawner(this, this.crowdGroup, this.stage);
    this.crowdSpawner.spawnCrowd();

    this.physics.add.collider(this.player, this.crowdGroup);
    this.physics.add.collider(this.hr, this.crowdGroup);
    this.physics.add.collider(this.player, this.hr);

    this.physics.add.overlap(
      this.projectiles,
      this.crowdGroup,
      this.projectileHitsCrowd,
      null,
      this
    );

    const stageBlocker = this.add.rectangle(this.stage.x + 10, this.stage.y - 20, 230, 180).setOrigin(0.5, 0).setVisible(false);
    this.physics.add.existing(stageBlocker, true);
    this.physics.add.collider(this.player, stageBlocker);

    const kissCamBlocker = this.add.rectangle(400, 40, 80, 80).setOrigin(0.5, 0.5).setVisible(false);
    this.physics.add.existing(kissCamBlocker, true);
    this.physics.add.collider(this.player, kissCamBlocker);
  }

  
  
  
  update() {
  this.player.move(this.cursors);

  if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
    this.player.shoot();
  }

  // === Smooth spotlight that eases + speed caps ===
  const maxSpeed = 2;
  const lerpStrength = 0.1;

  const targetX = this.player.x;
  const targetY = this.player.y;

  let nextX = Phaser.Math.Linear(this.spotlightMarker.x, targetX, lerpStrength);
  let nextY = Phaser.Math.Linear(this.spotlightMarker.y, targetY, lerpStrength);

  const dx = nextX - this.spotlightMarker.x;
  const dy = nextY - this.spotlightMarker.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > maxSpeed) {
    const angle = Math.atan2(dy, dx);
    nextX = this.spotlightMarker.x + Math.cos(angle) * maxSpeed;
    nextY = this.spotlightMarker.y + Math.sin(angle) * maxSpeed;
  }

  this.spotlightMarker.x = nextX;
  this.spotlightMarker.y = nextY;

  // === Sync crowd visuals with base physics objects ===
  this.crowdGroup.getChildren().forEach(base => {
    if (base.visuals) {
      base.visuals.x = base.x;
      base.visuals.y = base.y;
    }
  });

  // === Projectiles behavior ===
  this.projectiles.getChildren().forEach(proj => {
    if (proj.type === "credit_card") {
      proj.rotation += 0.3;
      const flip = Math.abs(Math.sin(this.time.now * 0.02));
      proj.setScale(0.015 * flip, 0.015);
      if (proj.y > proj.startY) proj.destroy();
    } else if (proj.type === "briefcase") {
      if (proj.y >= proj.throwerY + 5) proj.destroy();
    }
  });

  // === Kiss Cam Live Feed ===
  this.kissCamFeed.clear();

  const feedSize = 70;
  const zoom = 2;
  const radius = feedSize / (2 * zoom);
  const sx = this.spotlightMarker.x;
  const sy = this.spotlightMarker.y;

  const drawIfInside = (sprite) => {
    const dx = sprite.x - sx;
    const dy = sprite.y - sy;
    if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
      this.kissCamFeed.draw(
        sprite,
        Math.floor(feedSize / 2 + dx * zoom),
        Math.floor(feedSize / 2 + dy * zoom),
        zoom
      );
    }
  };

  drawIfInside(this.hr);     // Girl first
  drawIfInside(this.player); // Guy second

  this.crowdGroup.getChildren().forEach(base => {
    if (!base.visuals) return;
    base.visuals.list.forEach(part => {
      const dx = part.x - sx;
      const dy = part.y - sy;
      if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
        this.kissCamFeed.draw(
          part,
          Math.floor(feedSize / 2 + dx * zoom),
          Math.floor(feedSize / 2 + dy * zoom),
          zoom
        );
      }
    });
  });
}

  




projectileHitsCrowd(proj, crowd) {
  proj.destroy();

  if (crowd.visuals) {
    crowd.visuals.destroy();
  }

  const spawnDelay = Phaser.Math.Between(1000, 3000); // 1–3 second delay

  // Save this so we can call spawnCrowdMember with the scene context
  const scene = this;

  this.time.delayedCall(spawnDelay, () => {
    scene.crowdSpawner.spawnAtRandomValidLocation();
  });

  crowd.destroy();
}
  
  
  


}
