import * as CrowdUtils from "../utils/CrowdUtils.js";

export default class CrowdSpawner {
  constructor(scene, group, stage) {
    this.scene = scene;
    this.group = group;
    this.stage = stage;
  }

  spawnCrowd() {
    const spacing = 25;
    const screenW = this.scene.scale.width;
    const screenH = this.scene.scale.height;

    for (let y = 20; y < screenH - 10; y += spacing) {
      for (let x = 10; x < screenW - 10; x += spacing) {
        const densityFactor = Phaser.Math.Clamp(1.3 - (y / screenH), 0.5, 1.0);
        if (Phaser.Math.Between(0, 100) > 40 * densityFactor) {
          this.spawnCrowdMember(x, y);
        }
      }
    }
  }

  spawnCrowdMember(x, y) {
    if (y < 120) return;

    if (
      CrowdUtils.isInsideStage(this.scene.stage, x, y, 0) ||
      CrowdUtils.isInsideKissCam(this.scene.kissCamFrame, x, y, 0) ||
      CrowdUtils.isInsideCameraArea(x, y, this.scene.cameraGuy) ||
      CrowdUtils.isInsideVIPArea(x, y, this.scene.vip)
    ) {
      return;
    }

    if (Phaser.Math.Between(0, 100) > 50) {
      const px = x + Phaser.Math.Between(-5, 5);
      const py = y + Phaser.Math.Between(-5, 5);
      const scale = 0.09;

      const variant = Phaser.Math.RND.pick(["adult", "teen"]);

      const base = this.scene.physics.add
        .sprite(px, py, `${variant}/skin`)
        .setScale(scale);
      base.setImmovable(true);
      base.setVisible(false);

      const hairStyleKey = Phaser.Math.RND.pick(["hair_f", "hair_m"]);
      const hairKey = `${variant}/${hairStyleKey}`;
      const shirtKey = `${variant}/shirt`;
      const pantsKey = `${variant}/pants`;
      const skinKey = `${variant}/skin`;

      const skinSprite = this.scene.add.sprite(0, 0, skinKey).setScale(scale);
      const pants = this.scene.add.sprite(0, 0, pantsKey).setScale(scale).setTint(CrowdUtils.randomColor());
      const shirt = this.scene.add.sprite(0, 0, shirtKey).setScale(scale).setTint(CrowdUtils.randomColor());
      const hair = this.scene.add.sprite(0, 0, hairKey).setScale(scale).setTint(CrowdUtils.randomHairColor());

      // Darker palette override
      if (hairStyleKey === "hair_m" && Phaser.Math.Between(1, 100) <= 70) {
        const darkPalette = [0x222222, 0x444444, 0x333366, 0x4b3621];
        pants.setTint(Phaser.Math.RND.pick(darkPalette));
        shirt.setTint(Phaser.Math.RND.pick(darkPalette));
      }

      // Round pixel rendering to avoid jitter
      [skinSprite, pants, shirt, hair].forEach(s => {
        s.originalScale = scale;
        
      });

      const visuals = this.scene.add.container(px, py, [skinSprite, pants, shirt, hair]);
      base.visuals = visuals;
      this.group.add(base);

      // Animation
      const isVertical = Phaser.Math.Between(0, 1) === 0;
      const prop = isVertical ? "y" : "x";
      const amount = isVertical ? 10 : 10;

      this.scene.tweens.add({
  targets: [skinSprite, pants, shirt, hair],
  [prop]: `+=${amount}`,
  duration: 1200,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut",
  delay: Phaser.Math.Between(0, 800)
});

    }
  }

  spawnAtRandomValidLocation() {
    let x, y;
    const attempts = 20;

    for (let i = 0; i < attempts; i++) {
      x = Phaser.Math.Between(10, 790);
      y = Phaser.Math.Between(20, 460);

      if (
        !CrowdUtils.isInsideStage(this.scene.stage, x, y, 0) &&
        !CrowdUtils.isInsideKissCam(this.scene.kissCamFrame, x, y, 0) &&
        !CrowdUtils.isInsideCameraArea(x, y, this.scene.cameraGuy) &&
        !CrowdUtils.isInsideVIPArea(x, y, this.scene.vip)
      ) {
        this.spawnCrowdMember(x, y);
        return;
      }
    }
  }
}
