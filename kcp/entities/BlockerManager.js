import * as BLOCKERS from "../utils/BlockerZones.js";

export default class BlockerManager {
  static createBlockers(scene, player) {
    const blockers = [];

    // ───── Stage Blocker ─────
    const stageVisualX = scene.stage.x - scene.stage.displayWidth * (scene.stage.originX - 0.5);
    const stageVisualY = scene.stage.y - scene.stage.displayHeight * (scene.stage.originY - 0.5);

    const stageBlocker = scene.add.rectangle(
      stageVisualX + BLOCKERS.STAGE_BLOCKER.OFFSET_X,
      stageVisualY + BLOCKERS.STAGE_BLOCKER.OFFSET_Y,
      scene.stage.displayWidth + BLOCKERS.STAGE_BLOCKER.EXTRA_WIDTH,
      scene.stage.displayHeight * BLOCKERS.STAGE_BLOCKER.HEIGHT_MULTIPLIER + BLOCKERS.STAGE_BLOCKER.EXTRA_HEIGHT,
      0xff0000,
      0.4
    ).setOrigin(0.5).setVisible(false);

    scene.physics.add.existing(stageBlocker, true);
    scene.physics.add.collider(player, stageBlocker);
    blockers.push(stageBlocker);

    // ───── Kiss Cam Blocker ─────
    const camWidth = scene.kissCamFrame.width * scene.kissCamFrame.scaleX + 40;
    const camHeight = scene.kissCamFrame.height * scene.kissCamFrame.scaleY;

    const kissCamBlocker = scene.add.rectangle(
      scene.kissCamFrame.x,
      scene.kissCamFrame.y,
      camWidth,
      camHeight,
      0xff0000,
      0.4
    ).setOrigin(0.5).setVisible(false);

    scene.physics.add.existing(kissCamBlocker, true);
    scene.physics.add.collider(player, kissCamBlocker);
    blockers.push(kissCamBlocker);

    // ───── Cameraman + Fridge Blocker ─────
    const camX = scene.cameraGuy.x - scene.cameraGuy.displayWidth * (scene.cameraGuy.originX - 0.5);
    const camY = scene.cameraGuy.y - scene.cameraGuy.displayHeight * (scene.cameraGuy.originY - 0.5);

    const cameraFridgeBlocker = scene.add.rectangle(
      camX + BLOCKERS.CAMERA_BLOCKER.OFFSET_X,
      camY + BLOCKERS.CAMERA_BLOCKER.OFFSET_Y,
      BLOCKERS.CAMERA_BLOCKER.WIDTH,
      BLOCKERS.CAMERA_BLOCKER.HEIGHT,
      0xff0000,
      0.4
    ).setOrigin(0.5).setVisible(false);

    scene.physics.add.existing(cameraFridgeBlocker, true);
    scene.physics.add.collider(player, cameraFridgeBlocker);
    blockers.push(cameraFridgeBlocker);

    // ───── VIP Blockers ─────
    const vipX = scene.vip.x - scene.vip.displayWidth * (scene.vip.originX - 0.5);
    const vipY = scene.vip.y - scene.vip.displayHeight * (scene.vip.originY - 0.5);

    const vipBlocker1 = scene.add.rectangle(
      vipX + 4,
      vipY - 42,
      95,
      10,
      0xff0000,
      0.4
    ).setOrigin(0.5).setVisible(false);

    const vipBlocker2 = scene.add.rectangle(
      vipX + 4,
      vipY + 22,
      100,
      30,
      0xff0000,
      0.4
    ).setOrigin(0.5).setVisible(false);

    scene.physics.add.existing(vipBlocker1, true);
    scene.physics.add.existing(vipBlocker2, true);
    scene.physics.add.collider(player, vipBlocker1);
    scene.physics.add.collider(player, vipBlocker2);
    blockers.push(vipBlocker1, vipBlocker2);

    return blockers;
  }
}
