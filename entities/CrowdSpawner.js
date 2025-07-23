import {
  isInsideStage,
  isInsideKissCam,
  randomHairColor,
  randomColor
} from "../utils/CrowdUtils.js";

export default class CrowdSpawner {
  constructor(scene, group, stage) {
    this.scene = scene;
    this.group = group;
    this.stage = stage;
  }

  spawnCrowd() {
    const spacing = 25;
    for (let y = 20; y < 520; y += spacing) {
      for (let x = 10; x < 800; x += spacing) {
        const densityFactor = Phaser.Math.Clamp(1.3 - (y / 470), 0.5, 1.0);
        if (Phaser.Math.Between(0, 100) > 40 * densityFactor) {
          this.spawnCrowdMember(x, y);
        }
      }
    }
  }

  spawnCrowdMember(x, y) {
    if (isInsideStage(this.stage, x, y, 0) || isInsideKissCam(x, y, 0)) return;

    if (Phaser.Math.Between(0, 100) > 50) {
      const px = x + Phaser.Math.Between(-5, 5);
      const py = y + Phaser.Math.Between(-5, 5);
      const scale = 0.09;

      const base = this.scene.physics.add.sprite(px, py, "skin").setScale(scale);
      base.setImmovable(true);
      base.setVisible(false);

      const hairStyle = Phaser.Math.RND.pick(["hair_f", "hair_m", "hat1"]);
      const skinSprite = this.scene.add.sprite(0, 0, "skin").setScale(scale);
      skinSprite.originalScale = scale;

      let pantsColor = randomColor();
      let shirtColor = randomColor();

      if (hairStyle === "hair_m" && Phaser.Math.Between(1, 100) <= 70) {
        const darkPalette = [0x222222, 0x444444, 0x333366, 0x4b3621];
        pantsColor = Phaser.Math.RND.pick(darkPalette);
        shirtColor = Phaser.Math.RND.pick(darkPalette);
      }

      const pants = this.scene.add.sprite(0, 0, "pants").setScale(scale).setTint(pantsColor);
      const shirt = this.scene.add.sprite(0, 0, "shirt").setScale(scale).setTint(shirtColor);
      const hair = this.scene.add.sprite(0, 0, hairStyle).setScale(scale).setTint(randomHairColor());

      // Store originalScale for zoom rendering
      pants.originalScale = scale;
      shirt.originalScale = scale;
      hair.originalScale = scale;

      const visuals = this.scene.add.container(px, py, [skinSprite, pants, shirt, hair]);

      const isVertical = Phaser.Math.Between(0, 1) === 0;
      const prop = isVertical ? 'y' : 'x';
      const amount = isVertical ? 2 : 1;

      this.scene.tweens.add({
        targets: skinSprite,
        [prop]: { from: -amount, to: amount },
        duration: Phaser.Math.Between(500, 1500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000)
      });

      base.visuals = visuals;
      this.group.add(base);
    }
  }
}
