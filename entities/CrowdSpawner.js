import * as CrowdUtils from "../utils/CrowdUtils.js";

export default class CrowdSpawner {
  constructor(scene, group, stage) {
    this.scene = scene;
    this.group = group;
    this.stage = stage;
  }

  isBlocked(x, y) {
    if (y < 120) return true;

    return (
      CrowdUtils.isInsideStage(this.scene.stage, x, y, 0) ||
      CrowdUtils.isInsideKissCam(this.scene.kissCamFrame, x, y, 0) ||
      CrowdUtils.isInsideCameraArea(x, y, this.scene.cameraGuy) ||
      CrowdUtils.isInsideVIPArea(x, y, this.scene.vip)
    );
  }

  spawnCrowd() {
    const spacing = 25;
    const screenW = this.scene.scale.width;
    const screenH = this.scene.scale.height;

    // 🌀 Build and shuffle spawn points
    const spawnPoints = [];
    for (let y = 20; y < screenH - 10; y += spacing) {
      for (let x = 10; x < screenW - 10; x += spacing) {
        spawnPoints.push({ x, y });
      }
    }

    Phaser.Utils.Array.Shuffle(spawnPoints);

    // 👽 Add exactly one of each alien (a1–a4)
    const baseScale = 0.09;
    const alienFrames = ["a1", "a2", "a3", "a4"];
    let alienSpawned = 0;

    for (let i = 0; i < spawnPoints.length && alienSpawned < alienFrames.length; i++) {
      const point = spawnPoints[i];

      if (this.isBlocked(point.x, point.y)) continue;

      const scaleX = baseScale * 2;
      const scaleY = baseScale * 2.4;
      const alienFrame = alienFrames[alienSpawned];

      const alienSprite = this.scene.physics.add
        .sprite(point.x, point.y, `alien/${alienFrame}`)
        .setScale(scaleX, scaleY)
        .setImmovable(true);

      alienSprite.originalScale = { x: scaleX, y: scaleY };
      this.group.add(alienSprite);

      this.scene.tweens.add({
        targets: alienSprite,
        y: `+=5`,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 800)
      });

      alienSpawned++;
    }

    // 🧍 Fill the rest of the crowd
    for (let i = alienFrames.length; i < spawnPoints.length; i++) {
      const point = spawnPoints[i];
      const densityFactor = Phaser.Math.Clamp(1.3 - (point.y / screenH), 0.5, 1.0);
      if (Phaser.Math.Between(0, 100) > 40 * densityFactor) {
        this.spawnCrowdMember(point.x, point.y);
      }
    }
  }

  spawnCrowdMember(x, y) {
    if (this.isBlocked(x, y)) return;

    if (Phaser.Math.Between(0, 100) > 50) {
      const px = x + Phaser.Math.Between(-5, 5);
      const py = y + Phaser.Math.Between(-5, 5);
      const baseScale = 0.09;

      const variant = Phaser.Math.RND.pick(["adult", "teen"]);
      const scaleX = variant === "adult" ? baseScale * 0.85 : baseScale;
      const scaleY = baseScale;

      const base = this.scene.physics.add
        .sprite(px, py, `${variant}/skin`)
        .setScale(scaleX, scaleY);
      base.setImmovable(true);
      base.setVisible(false);

      const hairStyleKey = Phaser.Math.RND.pick(["hair_f", "hair_m"]);
      const hairKey = `${variant}/${hairStyleKey}`;
      const shirtKey = `${variant}/shirt`;
      const pantsKey = `${variant}/pants`;
      const skinKey = `${variant}/skin`;

      const skinSprite = this.scene.add.sprite(0, 0, skinKey).setScale(scaleX, scaleY);
      const pants = this.scene.add
        .sprite(0, 0, pantsKey)
        .setScale(scaleX, scaleY)
        .setTint(CrowdUtils.randomColor());
      const shirt = this.scene.add
        .sprite(0, 0, shirtKey)
        .setScale(scaleX, scaleY)
        .setTint(CrowdUtils.randomColor());
      const hair = this.scene.add
        .sprite(0, 0, hairKey)
        .setScale(scaleX, scaleY)
        .setTint(CrowdUtils.randomHairColor());

      // 🕶️ Sunglasses for 1 in 4 adults
      let sunglasses = null;
      if (variant === "adult" && Phaser.Math.Between(1, 4) === 1) {
        sunglasses = this.scene.add
          .sprite(0, 0, "adult/sunglass")
          .setScale(scaleX, scaleY);
      }

      // 🖤 Dark palette override
      if (hairStyleKey === "hair_m" && Phaser.Math.Between(1, 100) <= 70) {
        const darkPalette = [0x222222, 0x444444, 0x333366, 0x4b3621];
        pants.setTint(Phaser.Math.RND.pick(darkPalette));
        shirt.setTint(Phaser.Math.RND.pick(darkPalette));
      }

      [skinSprite, pants, shirt, hair, sunglasses].forEach((s) => {
        if (s) s.originalScale = { x: scaleX, y: scaleY };
      });

      const sprites = [skinSprite, pants, shirt, hair];
      if (sunglasses) sprites.push(sunglasses);

      const visuals = this.scene.add.container(px, py, sprites);
      base.visuals = visuals;
      this.group.add(base);

      const isVertical = Phaser.Math.Between(0, 1) === 0;
      const prop = isVertical ? "y" : "x";
      const amount = 5;

      this.scene.tweens.add({
        targets: sprites,
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

      if (!this.isBlocked(x, y)) {
        this.spawnCrowdMember(x, y);
        return;
      }
    }
  }
}
