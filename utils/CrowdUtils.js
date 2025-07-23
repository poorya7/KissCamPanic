export function isInsideStage(stage, x, y, margin = 0) {
  const stageWidth = stage.width * stage.scaleX;
  const stageHeight = stage.height * stage.scaleY;
  const left = stage.x - stageWidth * 0.48 - margin;
  const right = stage.x + stageWidth * 0.52 + margin;
  const top = stage.y - stageHeight * 0.12 - 10 - margin;
  const bottom = stage.y + stageHeight * 0.88 + margin;
  return x > left && x < right && y > top && y < bottom;
}

export function isInsideKissCam(x, y, margin = 0) {
  const kissCamX = 400;
  const kissCamY = 40;
  const nativeWidth = 512;
  const nativeHeight = 1024;
  const scale = 0.07;
  const width = nativeWidth * scale;
  const height = nativeHeight * scale;
  const left = kissCamX - width / 2 - 40 - margin;
  const right = kissCamX + width / 2 + 40 + margin;
  const top = kissCamY - height / 2 - margin;
  const bottom = kissCamY + height / 2 + margin;
  return x > left && x < right && y > top && y < bottom;
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
