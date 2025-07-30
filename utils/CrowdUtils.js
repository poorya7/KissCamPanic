
import { CAMERA_BLOCKER } from "../utils/BlockerZones.js";
import { VIP_BLOCKER } from "./BlockerZones.js";

export function isInsideStage(stage, x, y, margin = 0) {
  const stageWidth = stage.width * stage.scaleX;
  const stageHeight = stage.height * stage.scaleY;
  const left = stage.x - stageWidth * stage.originX - margin;
const right = stage.x + stageWidth * (1 - stage.originX) + margin;
const top = stage.y - stageHeight * stage.originY - 10 - margin;
const bottom = stage.y + stageHeight * (1 - stage.originY) + margin;

  return x > left && x < right && y > top && y < bottom;
}

export function isInsideKissCam(kissCamSprite, x, y, padding = 0) {
  if (!kissCamSprite) return false;

  const camWidth = kissCamSprite.width * kissCamSprite.scaleX + padding;
  const camHeight = kissCamSprite.height * kissCamSprite.scaleY + padding;

  const left = kissCamSprite.x - camWidth / 2;
  const right = kissCamSprite.x + camWidth / 2;
  const top = kissCamSprite.y - camHeight / 2;
  const bottom = kissCamSprite.y + camHeight / 2;

  const isInside = x >= left && x <= right && y >= top && y <= bottom;

  if (isInside) {
    console.log(`🎥 Blocked by KissCam at (${x}, ${y})`);
    console.log("⛔️ KissCam bounds:", { left, right, top, bottom });
  }

  return isInside;
}


export function isInsideCameraArea(x, y, cameraGuy) {
  const width = cameraGuy.width * cameraGuy.scaleX;
  const height = cameraGuy.height * cameraGuy.scaleY;

  const visualX = cameraGuy.x - width * (cameraGuy.originX - 0.5);
  const visualY = cameraGuy.y - height * (cameraGuy.originY - 0.5);

  const camLeft = visualX + CAMERA_BLOCKER.OFFSET_X - CAMERA_BLOCKER.WIDTH / 2;
  const camRight = visualX + CAMERA_BLOCKER.OFFSET_X + CAMERA_BLOCKER.WIDTH / 2;
  const camTop = visualY + CAMERA_BLOCKER.OFFSET_Y - CAMERA_BLOCKER.HEIGHT / 2;
  const camBottom = visualY + CAMERA_BLOCKER.OFFSET_Y + CAMERA_BLOCKER.HEIGHT / 2;

  return x >= camLeft && x <= camRight && y >= camTop && y <= camBottom;
}



export function isInsideVIPArea(x, y, vipSprite) {
  const width = vipSprite.width * vipSprite.scaleX;
  const height = vipSprite.height * vipSprite.scaleY;

  const visualX = vipSprite.x - width * (vipSprite.originX - 0.5);
  const visualY = vipSprite.y - height * (vipSprite.originY - 0.5);

  const left = visualX + VIP_BLOCKER.OFFSET_X - VIP_BLOCKER.WIDTH / 2;
  const right = visualX + VIP_BLOCKER.OFFSET_X + VIP_BLOCKER.WIDTH / 2;
  const top = visualY + VIP_BLOCKER.OFFSET_Y - VIP_BLOCKER.HEIGHT / 2;
  const bottom = visualY + VIP_BLOCKER.OFFSET_Y + VIP_BLOCKER.HEIGHT / 2;

  return x >= left && x <= right && y >= top && y <= bottom;
}



export function randomHairColor() {
  const naturalColors = [0x2c2c2c, 0x5a3825, 0xa0522d, 0xd2b48c];
  const purple = 0x800080, pink = 0xff69b4, blue = 0x1e90ff, green = 0x228b22;
  const rand = Phaser.Math.Between(1, 100);
  if (rand <= 85) return Phaser.Math.RND.pick(naturalColors);
  if (rand <= 93) return purple;
  if (rand <= 97) return pink;
  if (rand <= 99) return blue;
  return green;
}

export function randomColor() {
  return Phaser.Display.Color.GetColor(
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255),
    Phaser.Math.Between(50, 255)
  );
}


export function isBlocked(scene, x, y) {
  if (y < 120) return true;

  return (
    isInsideStage(scene.stage, x, y, 0) ||
    isInsideKissCam(scene.kissCamFrame, x, y, 0) ||
    isInsideCameraArea(x, y, scene.cameraGuy) ||
    isInsideVIPArea(x, y, scene.vip)
  );
}
