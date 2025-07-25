import CrowdSpawner from "../entities/CrowdSpawner.js";
import Player from "../entities/Player.js";
import ScoreUI from "../entities/ScoreUI.js";
import KissCamFeedRenderer from "../entities/KissCamFeedRenderer.js";
import ProjectileManager from "../entities/ProjectileManager.js";
import SpotlightHandler from "../entities/SpotlightHandler.js";
import GameOverDialog from "../entities/GameOverDialog.js";

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

  // ───────────────────────────────
  // ▶ preload
  // ───────────────────────────────
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
    this.load.image("poof", "sprites/poof.png");
    this.load.image("background", "sprites/background.png");
    this.load.image("floor", "sprites/floor.png");
    this.load.image("fence", "sprites/fence.png");
    this.load.image("post", "sprites/post.png");
    this.load.image("flash", "sprites/flash.png");
    this.load.image("dialog_end", "sprites/dialog_end.png");
  }

  // ───────────────────────────────
  // ▶ spawnFence
  // ───────────────────────────────
  spawnFence() {
    const FENCE_SCALE = 0.15;
    const y = 470;

    this.fenceGroup = this.add.group();

    for (let x = 50; x <= 900; x += 130) {
      const fence = this.add.image(x, y, "fence")
        .setScale(FENCE_SCALE)
        .setDepth(5);
      this.fenceGroup.add(fence);
    }
  }

  // ───────────────────────────────
  // ▶ create
  // ───────────────────────────────
  create() {
    this.createFlashOverlay();
    this.createBackgroundAndStage();
    this.createKissCamUI();
    this.createPlayerAndHR();
    this.createControlsAndProjectiles();
    this.createCrowdAndColliders();
    this.createKissCamRenderer();
    this.createBlockers();
    this.createGameOverDialog();
	this.createSpotlightHandler(); 
  }

  // ───────────────────────────────
  // ▶ createFlashOverlay
  // ───────────────────────────────
  createFlashOverlay() {
    this.flashOverlay = this.add.image(400, 235, "flash")
      .setScale(4)
      .setDepth(9999)
      .setAlpha(0);
  }

  // ───────────────────────────────
  // ▶ createBackgroundAndStage
  // ───────────────────────────────
  createBackgroundAndStage() {
    this.add.image(400, 235, "background").setDepth(-10);
    this.scoreUI = new ScoreUI(this);
    this.spawnFence();

    this.stage = this.add.image(400, 100, "stage")
      .setOrigin(0.48, 0.12)
      .setScale(0.5);
  }

  // ───────────────────────────────
  // ▶ createKissCamUI
  // ───────────────────────────────
  createKissCamUI() {
    this.kissCamFrame = this.add.image(400, 40, "kisscam1")
      .setScale(0.07)
      .setDepth(1000);

    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => {
        const key = this.kissCamFrame.texture.key;
        this.kissCamFrame.setTexture(key === "kisscam1" ? "kisscam2" : "kisscam1");
      }
    });

    this.kissCamFeed = this.add.renderTexture(365, 20, 70, 70)
      .setDepth(999)
      .setOrigin(0, 0);

    const maskGraphics = this.make.graphics({ x: 0, y: 0, add: true });
    maskGraphics.fillStyle(0xffffff);
    const ellipse = new Phaser.Geom.Ellipse(400, 54, 40, 56);
    maskGraphics.fillEllipseShape(ellipse);
    const kissCamMask = maskGraphics.createGeometryMask();
    this.kissCamFeed.setMask(kissCamMask);
    maskGraphics.visible = false;
  }
  
  // ───────────────────────────────
  // ▶ createSpotlightHandler
  // ───────────────────────────────
  
  createSpotlightHandler() {
  this.spotlightHandler = new SpotlightHandler(
    this,
    this.spotlightMarker,
    this.player,
    () => this.handlePlayerCaught()
  );
  }


  // ───────────────────────────────
  // ▶ createPlayerAndHR
  // ───────────────────────────────
  createPlayerAndHR() {
    this.player = new Player(this, 100, 100, "ceo1");
    this.hr = this.physics.add.sprite(90, 110, "hr1").setScale(0.07);
    this.player.hr = this.hr;
    this.hr.setCollideWorldBounds(true);

    this.anims.create({
      key: "ceo_run",
      frames: [{ key: "ceo1" }, { key: "ceo2" }],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "hr_run",
      frames: [{ key: "hr1" }, { key: "hr2" }],
      frameRate: 8,
      repeat: -1
    });

    this.spotlightMarker = this.add.circle(800, 0, 30, 0xffffff, 0.3)
      .setDepth(1000);
  }

  // ───────────────────────────────
  // ▶ createControlsAndProjectiles
  // ───────────────────────────────
  createControlsAndProjectiles() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.projectiles = this.physics.add.group();
    this.projectileManager = new ProjectileManager(this, this.projectiles);
    this.player.projectiles = this.projectiles;
  }

  // ───────────────────────────────
  // ▶ createCrowdAndColliders
  // ───────────────────────────────
  createCrowdAndColliders() {
    this.crowdGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.crowdSpawner = new CrowdSpawner(this, this.crowdGroup, this.stage);
    this.crowdSpawner.spawnCrowd();
    this.maxCrowdSize = this.crowdGroup.getLength();

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
  }

  // ───────────────────────────────
  // ▶ createKissCamRenderer
  // ───────────────────────────────
  createKissCamRenderer() {
    this.kissCamRenderer = new KissCamFeedRenderer(
      this,
      this.kissCamFeed,
      this.spotlightMarker,
      this.crowdGroup,
      this.player,
      this.hr
    );
  }

  // ───────────────────────────────
  // ▶ createBlockers
  // ───────────────────────────────
  createBlockers() {
    const stageBlocker = this.add.rectangle(this.stage.x + 10, this.stage.y - 20, 230, 180)
      .setOrigin(0.5, 0)
      .setVisible(false);
    this.physics.add.existing(stageBlocker, true);
    this.physics.add.collider(this.player, stageBlocker);

    const kissCamBlocker = this.add.rectangle(400, 40, 80, 80)
      .setOrigin(0.5, 0.5)
      .setVisible(false);
    this.physics.add.existing(kissCamBlocker, true);
    this.physics.add.collider(this.player, kissCamBlocker);
  }

  // ───────────────────────────────
  // ▶ createGameOverDialog
  // ───────────────────────────────
createGameOverDialog() {
  this.dialog = new GameOverDialog(this, 400, 235);
  this.dialog.enableKeyboardInput();
}


  // ───────────────────────────────
  // ▶ triggerFlash
  // ───────────────────────────────
  triggerFlash() {
    this.flashOverlay.setAlpha(1);

    this.tweens.add({
      targets: this.flashOverlay,
      alpha: 0,
      duration: 200,
      ease: "quad.out"
    });
  }

  // ───────────────────────────────
  // ▶ handlePlayerCaught
  // ───────────────────────────────
  handlePlayerCaught() {
    this.time.delayedCall(700, () => {
      this.triggerFlash();

      this.time.delayedCall(600, () => {
        this.showGameOverDialog();
      });
    });
  }

  // ───────────────────────────────
  // ▶ showGameOverDialog
  // ───────────────────────────────
showGameOverDialog() {
  const score = Math.floor(this.scoreUI.score);
  this.dialog.show(score); // you can also pass a fake rank here
}

  // ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
  update() {
    if (!this.player.disableMovement) {
      this.scoreUI.update();
    }

    this.player.move(this.cursors);

    if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
      this.player.shoot();
    }

    this.spotlightHandler.update();

    this.crowdGroup.getChildren().forEach(base => {
      if (base.visuals) {
        base.visuals.x = base.x;
        base.visuals.y = base.y;
      }
    });

    this.kissCamRenderer.render();
    this.projectileManager.update();
  }

  // ───────────────────────────────
  // ▶ playPoof
  // ───────────────────────────────
  playPoof(x, y) {
    const poof = this.add.image(x, y, "poof").setDepth(10).setScale(0.05);

    this.tweens.add({
      targets: poof,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: "power1",
      onComplete: () => poof.destroy()
    });
  }

  // ───────────────────────────────
  // ▶ projectileHitsCrowd
  // ───────────────────────────────
  projectileHitsCrowd(proj, crowd) {
    proj.destroy();
    this.playPoof(crowd.x, crowd.y);

    if (crowd.visuals) {
      crowd.visuals.destroy();
    }

    crowd.destroy();
  }
}