import ScoreService from "../services/ScoreService.js";

export default class StageBuilder {
  static build(scene) {
    // ───── Background base ─────
    scene.background = scene.add.tileSprite(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
      "background"
    )
      .setOrigin(0)
      .setDepth(-20);

    // ───── Score Fetch & Rank UI ─────
    ScoreService.getAllScores().then((allScores) => {
      scene.scoreUI.setScoreList(allScores);
      const totalPlayers = allScores.length;
      scene.scoreUI.rankValue.setText(`${totalPlayers + 1}`);
    });

    const centerX = scene.scale.width / 2;
    const stageY = 100;

    // ───── Stage ─────
    scene.stage = scene.add.image(centerX, stageY, "stage")
      .setOrigin(0.48, 0.12)
      .setScale(0.5);

    // ───── Exit Door ─────
    scene.exitDoor = scene.add.image(scene.scale.width - 20, 0, "exitdoor")
      .setOrigin(0.9, 0)
      .setDepth(-10)
      .setDisplaySize(325, 128);

    // ───── Top Wall ─────
    scene.wallTop = scene.add.tileSprite(
      0,
      0,
      scene.exitDoor.x - 20,
      128,
      "wall_top"
    )
      .setOrigin(0, 0)
      .setDepth(-11)
      .setTileScale(0.5, 0.5);

    // ───── Cameraguy ─────
    scene.cameraGuy = scene.add.image(scene.scale.width, 0, "cameraguy")
      .setOrigin(1.3, -0.5)
      .setDepth(-9)
      .setScale(0.2);

    // ───── VIP ─────
    scene.vip = scene.add.image(scene.scale.width, scene.scale.height / 2, "vip")
      .setOrigin(1.2, -0.7)
      .setDepth(-9)
      .setScale(0.15);

    // ───── Curtain ─────
    scene.curtain = scene.add.image(0, 0, "curtain")
      .setOrigin(-1.5, -0.13)
      .setDepth(-9)
      .setScale(0.18);

    // ───── Plant ─────
    scene.plant = scene.add.image(0, 0, "plant")
      .setOrigin(0.1, -0.6)
      .setDepth(-8)
      .setDisplaySize(124, 256)
      .setScale(0.4);
  }
}
