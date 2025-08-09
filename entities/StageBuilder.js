import ScoreService from "../services/ScoreService.js";

export default class StageBuilder {
  /**
   * Build the stage & props.
   * @param {Phaser.Scene} scene
   * @param {{stageScale?: number, propScale?: number, mobileStageOffsetY?: number}} [opts]
   */
  static build(scene, opts = {}) {
    // ───── Decoupled scales (only stage reacts to mobile by default) ─────
    const BASE_STAGE = 0.5;
    const BASE_PROP  = 0.5;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    const stageScale = opts.stageScale ?? (isMobile ? 0.4 : BASE_STAGE);
    const propScale  = opts.propScale  ?? BASE_PROP;

    // Mobile Y offset (default = move stage up 60px on mobile)
    const mobileStageOffsetY = opts.mobileStageOffsetY ?? 60;

    // Ratios vs your old 0.5 baseline
    const stageRatio = stageScale / 0.5;
    const propRatio  = propScale  / 0.5;

    // ───── Background base ─────
    scene.background = scene.add
      .tileSprite(0, 0, scene.scale.width, scene.scale.height, "background")
      .setOrigin(0)
      .setDepth(-20);

    // ───── Score Fetch & Rank UI ─────
    ScoreService.getAllScores().then((allScores) => {
      scene.scoreUI.setScoreList(allScores);
      const totalPlayers = allScores.length;
      scene.scoreUI.rankValue.setText(`${totalPlayers + 1}`);
    });

    const centerX = scene.scale.width / 2;
    let stageY = 100;

    // Move stage up if mobile
    if (isMobile) stageY -= mobileStageOffsetY;
    scene.stageMobileYOffset = isMobile ? mobileStageOffsetY : 0;

    // ───── Stage (swap sprite on mobile; uses stageScale ONLY) ─────
    scene.stage = scene.add
      .image(centerX, stageY, isMobile ? "stage_mobile" : "stage")
      .setOrigin(0.48, 0.12)
      .setScale(stageScale);

    // ───── Exit Door + Tape (SKIP on mobile) ─────
    if (!isMobile) {
      scene.exitDoor = scene.add
        .image(scene.scale.width - 20, 0, "exitdoor")
        .setOrigin(0.9, 0)
        .setDepth(-10)
        .setDisplaySize(325 * propRatio, 128 * propRatio);

      scene.policetape = scene.add
        .image(scene.scale.width - 240, 65, "policetape")
        .setOrigin(0.9, 0)
        .setDepth(-10)
        .setScale(0.33 * propRatio);
    }

    // ───── Top Wall (draw full width on mobile; otherwise to exit door) ─────
    // ───── Top Wall (draw full width on mobile; otherwise to exit door) ─────
const wallTopWidth = (!isMobile && scene.exitDoor)
  ? Math.floor(scene.exitDoor.x - 20)   // stop before the door on desktop
  : Math.ceil(scene.scale.width);       // full width on mobile (no gap)

scene.wallTop = scene.add
  .tileSprite(0, 0, wallTopWidth, 128, "wall_top")
  .setOrigin(0, 0)
  .setDepth(-11)
  .setTileScale(0.5 * propRatio, 0.5 * propRatio);


    // ───── Cameraguy (uses propScale) ─────
    scene.cameraGuy = scene.add
      .image(scene.scale.width, 0, "cameraguy")
      .setOrigin(1.3, -0.5)
      .setDepth(-9)
      .setScale(0.2 * propRatio);

    // ───── VIP (uses propScale) ─────
    scene.vip = scene.add
      .image(scene.scale.width, scene.scale.height / 2, "vip")
      .setOrigin(1.2, -0.7)
      .setDepth(-9)
      .setScale(0.15 * propRatio);

    if (isMobile) {
      scene.cameraGuy.x += 80; // tweak to taste
      scene.vip.x += 280;      // tweak to taste
    }

    // ───── Curtain (SKIP on mobile) ─────
    //if (!isMobile) {
      scene.curtain = scene.add
        .image(0, 0, "curtain")
        .setOrigin(-1.5, -0.13)
        .setDepth(-9)
        .setScale(0.18 * propRatio);
		// After: scene.curtain = scene.add.image(...).setOrigin(-1.5, -0.13)...
if (isMobile) {
  // Center the curtain to the stage on mobile
  const stageOffsetX = (scene.stage.originX - 0.5) * scene.stage.displayWidth; // accounts for 0.48 origin
  scene.curtain
    .setOrigin(0.2, -0.13)  // use centered origin horizontally on mobile
    .setX(centerX + stageOffsetX);
}

   // }

    // ───── Plant (uses propScale) ─────
    scene.plant = scene.add
      .image(0, 0, "plant")
      .setOrigin(0.1, -0.6)
      .setDepth(-8)
      .setDisplaySize(124, 256)
      .setScale(0.4 * propRatio);
  }
}
