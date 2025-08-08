import CrowdSpawner from "../entities/CrowdSpawner.js";
import Player from "../entities/Player.js";
import ScoreUI from "../entities/ScoreUI.js";
import KissCamFeedRenderer from "../entities/KissCamFeedRenderer.js";
import ProjectileManager from "../entities/ProjectileManager.js";
import SpotlightHandler from "../entities/SpotlightHandler.js";
import GameOverDialog from "../entities/GameOverDialog.js";
import ScoreService from "../services/ScoreService.js"; 
import * as BLOCKERS from "../utils/BlockerZones.js";
import SoundManager from "../utils/SoundManager.js";
import StaplerManager from "../entities/powerups/StaplerManager.js";
import MugManager from "../entities/powerups/MugManager.js";
import PowerupManager from "../entities/powerups/PowerupManager.js";
import StageBuilder from "../entities/StageBuilder.js";
import StartDialog from "../entities/StartDialog.js"; 	
import BlockerManager from "../entities/BlockerManager.js"; 



import {
  isInsideStage,
  isInsideKissCam,
  randomHairColor,
  randomColor
} from "../utils/CrowdUtils.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
	this.blockers = [];
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
	this.load.image("exitdoor", "sprites/props/exitdoors.png");
	this.load.image("policetape", "sprites/props/policetape.png");
	this.load.image("wall_top", "sprites/props/wall_tops.png");
	this.load.image("speaker", "sprites/props/speaker.png");
	this.load.image("cameraguy", "sprites/props/cameraguy.png");
	this.load.image("vip", "sprites/props/vip.png");
	this.load.image("curtain", "sprites/props/curtain.png");
	this.load.image("plant", "sprites/props/plant.png");
	this.load.image('mute', 'sprites/UI/mute.png');
	this.load.image('unmute', 'sprites/UI/unmute.png');
	this.load.image("stapler", "sprites/powerups/stapler2.png");
	this.load.image("mug", "sprites/powerups/mug.png");
	this.load.image("powerup_bar", "sprites/powerups/powerup_bar.png");
	this.load.image("powerup_fill", "sprites/powerups/powerup_fill2.png");
	this.load.image("bubble_kisscam", "sprites/props/bubble_kisscam.png");



	
	for (let i = 1; i <= 4; i++) {
		this.load.image(`alien/a${i}`, `sprites/crowd/alien/a${i}.png`);
	}

	this.load.audio("shoot1", "sounds/fx/shoot1.wav");
	this.load.audio("shoot2", "sounds/fx/shoot2.wav");
	this.load.audio("hit", "sounds/fx/hit.wav");
	this.load.audio("spawn", "sounds/fx/spawn2.wav");
	this.load.audio("chris", "sounds/fx/chris.wav");
	this.load.audio("snap", "sounds/fx/snap.wav");
	this.load.audio('bgMusic', 'sounds/music/main1.wav');
	this.load.audio("powerup", "sounds/fx/powerup.wav");
	this.load.audio("powerup_get", "sounds/fx/powerup_get.wav");
	this.load.audio("mug_get", "sounds/fx/mug_get.wav");
	this.load.audio("burst", "sounds/fx/burst.wav");
	this.load.audio("top20", "sounds/fx/win20.wav");
	this.load.audio("top1", "sounds/fx/win1.wav");

  }
  
  // ───────────────────────────────
  // ▶ create
  // ───────────────────────────────
create() {
  this.createFlashOverlay();
  StageBuilder.build(this);
  this.scoreUI = new ScoreUI(this);
  this.createPlayerAndHR();
  this.createControlsAndProjectiles();
  this.createCrowdAndColliders();
  this.createKissCamUI();
  this.createKissCamRenderer();
  this.createBlockers();
  this.createGameOverDialog();
  this.createSpotlightHandler(); 
  this.registerResizeHandler();
  this.gameStarted = false;

  SoundManager.init(this);
  StartDialog.show(this, () => this.startGame());

  this.powerupManager = new PowerupManager(this);
  this.staplerManager = new StaplerManager(this, this.player);
  this.mugManager = this.powerupManager.mugManager;
this.powerupManager.staplerManager = this.staplerManager;


  this.staplerManager.enableCollision(() => {
    this.powerupManager.activateRapidFire(this.player);
  });

this.mugManager.enableCollision(() => {});


  if (window.matchMedia("(pointer: fine)").matches) {
  this.input.keyboard.on("keydown-SPACE", (event) => {
    if (!event.repeat) {
      this.player.manualShoot();
    }
  });
} else {
  // Mobile → enable auto shooting
  this.time.addEvent({
    delay: 500, // adjust fire rate as needed
    loop: true,
    callback: () => {
      if (this.gameStarted) {
        this.player.manualShoot();
      }
    }
  });
}

}
  
   // ───────────────────────────────
  // ▶ startGame
  // ───────────────────────────────
startGame() {
  this.sound.unlock();

  if (!this.cache.audio.exists("bgMusic")) {
    console.warn("❌ bgMusic audio key not found in cache");
    return;
  }

  if (!this.bgMusic) {
    this.bgMusic = this.sound.add("bgMusic", {
      loop: true,
      volume: 1,
    });

    if (!this.bgMusic) {
      console.warn("⚠️ Failed to load bgMusic sound");
      return;
    }

    this.bgMusic.setMute(SoundManager.musicMuted);
  }

  SoundManager.currentMusic = this.bgMusic;

  if (!this.bgMusic.isPlaying) {
    this.bgMusic.play();
  }

  this.gameStarted = true;
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

const screenWidth = this.scale.width;
const screenHeight = this.scale.height;

this.spotlightMarker = this.add.circle(screenWidth - 80, screenHeight - 40, 30, 0xffffff, 0.3)
  .setDepth(1000);
  
  
  this.spotlightBubble = this.add.image(this.spotlightMarker.x+6, this.spotlightMarker.y - 70, "bubble_kisscam")
  .setScale(0.4)
  .setDepth(1001)
  .setAlpha(0.7)  
   .setVisible(false); // ✅ Hide it at first;

}

  // ───────────────────────────────
  // ▶ createBlockers
  // ───────────────────────────────
	createBlockers() {
	  // 🧹 Destroy existing blockers
	  this.blockers.forEach(b => b.destroy());
	  this.blockers = [];

	  this.blockers = BlockerManager.createBlockers(this, this.player);
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

this.playerCrowdCollider = this.physics.add.collider(
  this.player,
  this.crowdGroup,
  (player, crowd) => {
    if (player.ignoreCrowdCollision) return;

    // 👇 Your existing collision behavior goes here
    this.handlePlayerCrowdCollision?.(player, crowd);
  },
  null,
  this
);

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
	  SoundManager.playSFX("snap");

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
	this.fadeOutMusic();
	
  this.time.delayedCall(700, () => {
    this.triggerFlash(); // 🔊 snap plays here

    // 🔁 Delay chris slightly after snap
    this.time.delayedCall(300, () => {
      if (SoundManager.chrisSFX) {
        SoundManager.chrisSFX.stop();
        SoundManager.chrisSFX.destroy();
      }

      SoundManager.chrisSFX = this.sound.add("chris");
      SoundManager.chrisSFX.play();
    });

    this.time.delayedCall(600, () => {
      this.showGameOverDialog();
    });
  });
}

  // ───────────────────────────────
  // ▶ fadeOutMusic
  // ───────────────────────────────
fadeOutMusic(duration = 1000) {
  if (SoundManager.currentMusic && SoundManager.currentMusic.isPlaying) {
    this.tweens.add({
      targets: SoundManager.currentMusic,
      volume: 0,
      duration,
      onComplete: () => {
        SoundManager.currentMusic.stop();
        SoundManager.currentMusic.destroy();
        SoundManager.currentMusic = null;
      }
    });
  }
}

  // ───────────────────────────────
  // ▶ showGameOverDialog
  // ───────────────────────────────
// ───────────────────────────────
showGameOverDialog() {
  const rawScore = this.scoreUI.getRawScore();

  // 🧠 Skip rank display if score is not valid
  if (rawScore <= 0) {
    this.dialog.show(0, "-");
    return;
  }

  const scoreList = [...this.scoreUI.scoreList];

  if (!scoreList.includes(rawScore)) {
    scoreList.push(rawScore);
  }

  scoreList.sort((a, b) => b - a);

  const rank = scoreList.indexOf(rawScore) + 1;
  const totalPlayers = scoreList.length;
  const score = Math.floor(this.scoreUI.score);

  this.dialog.show(score, `#${rank} / ${totalPlayers}`);
}

  // ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
 update(time, delta) {
  if (!this.gameStarted) return;

  // 🔄 Update UI
  if (!this.player.disableMovement) {
    this.scoreUI.update();
  }

  // 🕹️ Player movement + update
  this.player.move(this.cursors, 200);

  this.player.update?.(time, delta);

  // 🎯 Spotlight AI
  this.spotlightHandler.update();

  // 👥 Sync crowd visuals
  this.crowdGroup.getChildren().forEach(base => {
    if (base.visuals) {
      base.visuals.x = base.x;
      base.visuals.y = base.y;
    }
  });

  // 📸 Kiss cam feed
  this.kissCamRenderer.render();

  // 🔫 Projectiles
  this.projectileManager.update();

  // ⚡ Powerup UI (bar, timer, counter)
  this.powerupManager?.update();
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
  // ▶ resetGame
  // ───────────────────────────────
resetGame() {
  // 🔊 Restart background music if not playing
SoundManager.playMusic("bgMusic", {
  loop: true,
  volume: 1
});


  // 🧱 Reset blockers
  this.createBlockers();

  // 🎯 Reset score state
  this.scoreUI.score = 0;
  this.scoreUI.top20SoundPlayed = false;
  this.scoreUI.top1SoundPlayed = false;

  // 🕹️ Reset player + HR positions
  this.player.setPosition(100, 200);
  this.player.disableMovement = false;

  if (this.hr) this.hr.setPosition(90, 110);
  const screenWidth = this.scale.width;
const screenHeight = this.scale.height;

  if (this.spotlightMarker) this.spotlightMarker.setPosition(screenWidth - 80, screenHeight - 40);
    

  // 👥 Clear crowd visuals
  this.crowdGroup.children.each(child => {
    if (child.visuals) {
      child.visuals.destroy();
    }
  });
  this.crowdGroup.clear(true, true);
  this.crowdSpawner.spawnCrowd();

  // 🔦 Re-create spotlight
  this.createSpotlightHandler();

  // 🛑 Stop any Chris SFX
  if (SoundManager.chrisSFX) {
    SoundManager.chrisSFX.stop();
    SoundManager.chrisSFX.destroy();
    SoundManager.chrisSFX = null;
  }

  // ♻️ Reset powerups
  this.staplerManager?.reset();
  this.mugManager?.reset();
}

  // ───────────────────────────────
  // ▶ projectileHitsCrowd
  // ───────────────────────────────
projectileHitsCrowd(proj, crowd) {
  proj.destroy();
  SoundManager.playSFX("hit");

  this.playPoof(crowd.x, crowd.y);

  if (crowd.visuals) {
    crowd.visuals.destroy();
  }
  crowd.destroy();

  this.scoreUI.addToScore(40);

  this.time.delayedCall(3000, () => {
    this.crowdSpawner.spawnInLeastCrowdedArea();
  });
}

    
}