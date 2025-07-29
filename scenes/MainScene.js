import CrowdSpawner from "../entities/CrowdSpawner.js";
import Player from "../entities/Player.js";
import ScoreUI from "../entities/ScoreUI.js";
import KissCamFeedRenderer from "../entities/KissCamFeedRenderer.js";
import ProjectileManager from "../entities/ProjectileManager.js";
import SpotlightHandler from "../entities/SpotlightHandler.js";
import GameOverDialog from "../entities/GameOverDialog.js";
import * as BLOCKERS from "../utils/BlockerZones.js";
import ScoreService from "../services/ScoreService.js"; 

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

    this.load.image("adult/skin", "sprites/crowd/adult/skin.png");
	this.load.image("adult/shirt", "sprites/crowd/adult/shirt.png");
	this.load.image("adult/pants", "sprites/crowd/adult/pants.png");
	this.load.image("adult/hair_f", "sprites/crowd/adult/hair_f.png");
	this.load.image("adult/hair_m", "sprites/crowd/adult/hair_m.png");

	this.load.image("teen/skin", "sprites/crowd/teen/skin.png");
	this.load.image("teen/shirt", "sprites/crowd/teen/shirt.png");
	this.load.image("teen/pants", "sprites/crowd/teen/pants.png");
	this.load.image("teen/hair_f", "sprites/crowd/teen/hair_f.png");
	this.load.image("teen/hair_m", "sprites/crowd/teen/hair_m.png");
	this.load.image("adult/sunglass", "sprites/crowd/adult/sunglass.png");


    this.load.image("credit_card", "sprites/cc.png");
    this.load.image("briefcase", "sprites/case.png");

    this.load.image("stage", "sprites/stage.png");
    this.load.image("kisscam1", "sprites/kisscam1.png");
    this.load.image("kisscam2", "sprites/kisscam2.png");
    this.load.image("poof", "sprites/poof.png");
    this.load.image("background", "sprites/tile.png");
    this.load.image("post", "sprites/post.png");
    this.load.image("flash", "sprites/flash.png");
    this.load.image("dialog_end", "sprites/dialog_end.png");
	this.load.image("exitdoor", "sprites/props/exitdoor.png");
	this.load.image("wall_top", "sprites/props/wall_top.png");
	this.load.image("speaker", "sprites/props/speaker.png");
	this.load.image("cameraguy", "sprites/props/cameraguy.png");
	this.load.image("vip", "sprites/props/vip.png");
	this.load.image("curtain", "sprites/props/curtain.png");
	this.load.image("plant", "sprites/props/plant.png");
	this.load.image('mute', 'sprites/UI/mute.png');
	this.load.image('unmute', 'sprites/UI/unmute.png');
	for (let i = 1; i <= 4; i++) {
	this.load.image(`alien/a${i}`, `sprites/crowd/alien/a${i}.png`);
}

	
	
  }

  
  // ───────────────────────────────
  // ▶ create
  // ───────────────────────────────
  create() {
    this.createFlashOverlay();
    this.createBackgroundAndStage();
    this.createPlayerAndHR();
    this.createControlsAndProjectiles();
    this.createCrowdAndColliders();
	this.createKissCamUI();
    this.createKissCamRenderer();
    this.createBlockers();
    this.createGameOverDialog();
	this.createSpotlightHandler(); 
	this.registerResizeHandler();
  }
  
   // ───────────────────────────────
  // ▶ registerResizeHandler
  // ───────────────────────────────
    registerResizeHandler() {
  this.scale.on('resize', (gameSize) => {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.background) {
      this.background.setSize(width, height);
    }
	

  });
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
  // Background base
  this.background = this.add.tileSprite(
    0,
    0,
    this.scale.width,
    this.scale.height,
    "background"
  )
    .setOrigin(0)
    .setDepth(-20);

  this.scoreUI = new ScoreUI(this);

  const centerX = this.scale.width / 2;
  const stageY = 100;

  this.stage = this.add.image(centerX, stageY, "stage")
    .setOrigin(0.48, 0.12)
    .setScale(0.5);
	
	// ───── Exit Door (top-right) ─────
this.exitDoor = this.add.image(this.scale.width - 20, 0, "exitdoor")
  .setOrigin(.9, 0)
  .setDepth(-10)
  .setDisplaySize(325,128);


// ───── Top Wall Connecting to Exit Door ─────

this.wallTop = this.add.tileSprite(
  0,
  0,
  this.exitDoor.x - 20,
  128, // Match door height
  "wall_top"
)
.setOrigin(0, 0)
.setDepth(-11)
.setTileScale(0.5, 0.5); // Downscale the tile to match door size


// ───── Speaker Stack on Right Side ─────
/*this.speaker = this.add.image(0, this.scale.height, "speaker")
  .setOrigin(-0.05, 1.1)   // bottom-left anchor
  .setDepth(-9)
  .setScale(0.6);    // adjust if too big or small*/


this.cameraGuy = this.add.image(this.scale.width, 0, "cameraguy")
  .setOrigin(1.3, -0.5)     
  .setDepth(-9)
  .setScale(0.2);


this.vip = this.add.image(this.scale.width, this.scale.height / 2, "vip")
  .setOrigin(1.2, -0.7)     // anchor to right edge, center vertically
  .setDepth(-9)
  .setScale(0.15);        // adjust scale to fit your layout

this.curtain = this.add.image(0, 0, "curtain")
  .setOrigin(-1, -0.13)       // top-left of image aligns with top-left of screen
  .setDepth(-9)
  .setScale(0.18);        // tweak as needed

this.plant = this.add.image(0, 0, "plant")
   .setOrigin(-2.0, -0.4)  
  .setDepth(-10)
  .setDisplaySize(124,256)
	.setScale(0.4);



}


  // ───────────────────────────────
  // ▶ createKissCamUI
  // ───────────────────────────────
createKissCamUI() {
  const camX = this.stage.x - this.stage.displayWidth * (this.stage.originX - 0.5);
const camY = this.stage.y - this.stage.displayHeight * (this.stage.originY - 0.5)-150;


  const FEED_SIZE = 70;
  const OFFSET_X = 10;
  const OFFSET_Y = 4;

  if (!camX || !camY || FEED_SIZE <= 0) {
    console.warn("🚨 Skipping kissCamFeed due to invalid camX or camY");
    return;
  }

  this.kissCamFeed = this.add.renderTexture(
    camX - FEED_SIZE / 2 + OFFSET_X,
    camY - FEED_SIZE / 2 + OFFSET_Y,
    FEED_SIZE,
    FEED_SIZE
  )
    .setOrigin(0, 0)
    .setDepth(1001);

  const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  maskGraphics.fillStyle(0xffffff);
  const ellipse = new Phaser.Geom.Ellipse(
    this.kissCamFeed.x + this.kissCamFeed.width / 2,
    this.kissCamFeed.y + this.kissCamFeed.height / 2,
    40,
    56
  );
  maskGraphics.fillEllipseShape(ellipse);
  const kissCamMask = maskGraphics.createGeometryMask();
  this.kissCamFeed.setMask(kissCamMask);

  this.kissCamFrame = this.add.image(camX, camY, "kisscam1")
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
    this.player = new Player(this, 100, 200, "ceo1");
    // ✅ New line (visual-only HR — no physics = no jitter)
this.hr = this.add.sprite(90, 110, "hr1").setScale(0.07);


    this.player.hr = this.hr;
    

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
    //this.physics.add.collider(this.hr, this.crowdGroup);
    //this.physics.add.collider(this.player, this.hr);

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
  // ───── Stage Blocker ─────
	const stageVisualX = this.stage.x - this.stage.displayWidth * (this.stage.originX - 0.5);
	const stageVisualY = this.stage.y - this.stage.displayHeight * (this.stage.originY - 0.5);

	const stageBlocker1 = this.add.rectangle(
  stageVisualX + BLOCKERS.STAGE_BLOCKER.OFFSET_X,
  stageVisualY + BLOCKERS.STAGE_BLOCKER.OFFSET_Y,
  this.stage.displayWidth + BLOCKERS.STAGE_BLOCKER.EXTRA_WIDTH,
  this.stage.displayHeight * BLOCKERS.STAGE_BLOCKER.HEIGHT_MULTIPLIER + BLOCKERS.STAGE_BLOCKER.EXTRA_HEIGHT,
  0xff0000,
  0.4
)
.setOrigin(0.5, 0.5)
.setVisible(false);

	this.physics.add.existing(stageBlocker1, true);
	this.physics.add.collider(this.player, stageBlocker1);
	


  // ───── Kiss Cam Blocker ─────
  const camWidth = this.kissCamFrame.width * this.kissCamFrame.scaleX + 40;
  const camHeight = this.kissCamFrame.height * this.kissCamFrame.scaleY;

  const kissCamBlocker = this.add.rectangle(
    this.kissCamFrame.x,
    this.kissCamFrame.y,
    camWidth,
    camHeight
  )
    .setOrigin(0.5, 0.5)
    .setVisible(false); // Set to true for debug

  this.physics.add.existing(kissCamBlocker, true);
  this.physics.add.collider(this.player, kissCamBlocker);
  
  
  
  // ───── Cameraman + Fridge Blocker ─────

const visualX = this.cameraGuy.x - this.cameraGuy.displayWidth * (this.cameraGuy.originX - 0.5);
const visualY = this.cameraGuy.y - this.cameraGuy.displayHeight * (this.cameraGuy.originY - 0.5);

const cameraFridgeBlocker = this.add.rectangle(
  visualX + BLOCKERS.CAMERA_BLOCKER.OFFSET_X,
  visualY + BLOCKERS.CAMERA_BLOCKER.OFFSET_Y,
  BLOCKERS.CAMERA_BLOCKER.WIDTH,
  BLOCKERS.CAMERA_BLOCKER.HEIGHT,
  0xff0000,
  0.4
)
.setOrigin(0.5, 0.5)
.setVisible(false);


this.physics.add.existing(cameraFridgeBlocker, true);
this.physics.add.collider(this.player, cameraFridgeBlocker);



// ───── VIP Blocker ─────
const vipVisualX = this.vip.x - this.vip.displayWidth * (this.vip.originX - 0.5);
const vipVisualY = this.vip.y - this.vip.displayHeight * (this.vip.originY - 0.5);

const vipBlocker1 = this.add.rectangle(
  vipVisualX + 4,  // tweak offsets as needed
  vipVisualY - 42,
  95,
  10,
  0xff0000,
  0.4
)
.setOrigin(0.5, 0.5)
.setVisible(false); // set to true for debug

this.physics.add.existing(vipBlocker1, true);
this.physics.add.collider(this.player, vipBlocker1);



const vipBlocker2 = this.add.rectangle(
  vipVisualX + 4,  // tweak offsets as needed
  vipVisualY + 22,
  100,
  30,
  0xff0000,
  0.4
)
.setOrigin(0.5, 0.5)
.setVisible(false); // set to true for debug

this.physics.add.existing(vipBlocker2, true);
this.physics.add.collider(this.player, vipBlocker2);




}


// ───────────────────────────────
// ▶ createGameOverDialog
// ───────────────────────────────
createGameOverDialog() {
  // Wait until C64 font is fully loaded
  if (!window.fontsReady) {
    this.time.delayedCall(50, () => this.createGameOverDialog(), [], this);
    return;
  }

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