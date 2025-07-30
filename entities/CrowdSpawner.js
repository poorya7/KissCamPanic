import * as CrowdUtils from "../utils/CrowdUtils.js"
import SoundManager from "../utils/SoundManager.js";

export default class CrowdSpawner {
  constructor(scene, group, stage) {
    this.scene = scene;
    this.group = group;
    this.stage = stage;
  }

  // ─────────────────────────────────────────────
  // 🛑 Blocker Logic
  // ─────────────────────────────────────────────
  isBlocked(x, y) {
    if (y < 120) return true;

    // 🔴 TEMP DEBUG: show "✖" when pressing D
    if (this.scene.input.keyboard.checkDown(this.scene.input.keyboard.addKey("D"))) {
      this.scene.add.text(x, y, "✖", { fontSize: "12px", color: "#ff0000" }).setDepth(10000);
    }

    return (
      CrowdUtils.isInsideStage(this.scene.stage, x, y, 0) ||
      CrowdUtils.isInsideKissCam(this.scene.kissCamFrame, x, y, 0) ||
      CrowdUtils.isInsideCameraArea(x, y, this.scene.cameraGuy) ||
      CrowdUtils.isInsideVIPArea(x, y, this.scene.vip)
    );
  }

  // ─────────────────────────────────────────────
  // 🧑‍🤝‍🧑 Spawn All Crowd
  // ─────────────────────────────────────────────
  spawnCrowd() {
    const spacing = 25;
    const screenW = this.scene.scale.width;
    const screenH = this.scene.scale.height;

    
	
	const spawnPoints = [];
for (let y = 20; y < screenH - 10; y += spacing) {
  for (let x = 10; x < screenW - 10; x += spacing) {
    spawnPoints.push({ x, y });
  }
}

Phaser.Utils.Array.Shuffle(spawnPoints); // ✅ randomizes order per run

    // 👽 Spawn 1 of each alien (a1–a4)
    const alienFrames = ["a1", "a2", "a3", "a4"];
    let alienIndex = 0;

    for (let i = 0; i < spawnPoints.length && alienIndex < alienFrames.length; i++) {
      const { x, y } = spawnPoints[i];
      if (this.isBlocked(x, y)) continue;
      this.spawnAlien(x, y, alienFrames[alienIndex]);
      alienIndex++;
    }

   
   let crowdCount = 0;
const maxCrowd = 100;

for (let i = 0; i < spawnPoints.length && crowdCount < maxCrowd; i++) {
  const point = spawnPoints[i];
  if (this.isBlocked(point.x, point.y)) continue;

  const densityFactor = Phaser.Math.Clamp(1.3 - (point.y / screenH), 0.5, 1.0);
  if (Phaser.Math.Between(0, 100) > 40 * densityFactor) {
    this.spawnCrowdMember(point.x, point.y);
    crowdCount++;
  }
}

   
   
   
   
   
  }

  // ─────────────────────────────────────────────
  // 👽 Alien Spawner (you probably already have)
  // ─────────────────────────────────────────────
  spawnAlien(x, y, frame) {
    const baseScale = 0.09;
    const scaleX = baseScale * 2;
    const scaleY = baseScale * 2.4;

    const alien = this.scene.physics.add
      .sprite(x, y, `alien/${frame}`)
      .setScale(scaleX, scaleY)
      .setImmovable(true);

    alien.originalScale = { x: scaleX, y: scaleY };
    this.group.add(alien);

    this.scene.tweens.add({
      targets: alien,
      y: `+=5`,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: Phaser.Math.Between(0, 800)
    });
  }

  // ─────────────────────────────────────────────
  // 🧍 Normal Crowd Member
  // ─────────────────────────────────────────────
  spawnCrowdMember(x, y, options = {}) {
    if (this.isBlocked(x, y)) return;
    if (!options?.force && Phaser.Math.Between(0, 100) <= 50) return;


    const px = x + Phaser.Math.Between(-5, 5);
    const py = y + Phaser.Math.Between(-5, 5);
    const baseScale = 0.09;
    const variant = Phaser.Math.RND.pick(["adult", "teen"]);

    const scaleX = variant === "adult" ? baseScale * 0.85 : baseScale;
    const scaleY = baseScale;

    const base = this.scene.physics.add.sprite(px, py, `${variant}/skin`)
      .setScale(scaleX, scaleY)
      .setImmovable(true)
      .setVisible(false);

    const hairStyleKey = Phaser.Math.RND.pick(["hair_f", "hair_m"]);
    const hairKey = `${variant}/${hairStyleKey}`;
    const shirtKey = `${variant}/shirt`;
    const pantsKey = `${variant}/pants`;
    const skinKey = `${variant}/skin`;

    const skinSprite = this.scene.add.sprite(0, 0, skinKey).setScale(scaleX, scaleY);
    const pants = this.scene.add.sprite(0, 0, pantsKey).setScale(scaleX, scaleY).setTint(CrowdUtils.randomColor());
    const shirt = this.scene.add.sprite(0, 0, shirtKey).setScale(scaleX, scaleY).setTint(CrowdUtils.randomColor());
    const hair = this.scene.add.sprite(0, 0, hairKey).setScale(scaleX, scaleY).setTint(CrowdUtils.randomHairColor());

    let sunglasses = null;
    if (variant === "adult" && Phaser.Math.Between(1, 4) === 1) {
      sunglasses = this.scene.add.sprite(0, 0, "adult/sunglass").setScale(scaleX, scaleY);
    }

    if (hairStyleKey === "hair_m" && Phaser.Math.Between(1, 100) <= 70) {
      const darkPalette = [0x222222, 0x444444, 0x333366, 0x4b3621];
      pants.setTint(Phaser.Math.RND.pick(darkPalette));
      shirt.setTint(Phaser.Math.RND.pick(darkPalette));
    }

    const visuals = this.scene.add.container(px, py, [skinSprite, pants, shirt, hair, sunglasses].filter(Boolean));
    base.visuals = visuals;
    this.group.add(base);

    const isVertical = Phaser.Math.Between(0, 1) === 0;
    const prop = isVertical ? "y" : "x";
    const amount = 5;

    this.scene.tweens.add({
      targets: visuals.list,
      [prop]: `+=${amount}`,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: Phaser.Math.Between(0, 800)
    });
	

  }

  // ─────────────────────────────────────────────
  // 🌀 Spawn 1 Crowd Anywhere Valid
  // ─────────────────────────────────────────────
  spawnAtRandomValidLocation() {
  const maxAttempts = 100;

  for (let i = 0; i < maxAttempts; i++) {
    const x = Phaser.Math.Between(10, this.scene.scale.width - 10);
    const y = Phaser.Math.Between(20, this.scene.scale.height - 10);

    if (!this.isBlocked(x, y)) {
      // Force spawn by skipping random chance
      this.spawnCrowdMember(x, y, { force: true });
	  this.spawnCrowdMember(x, y, { force: true });

	this.scene.time.delayedCall(100, () => {
	SoundManager.playSFX("spawn");
	});

return;

      return;
    }
  }

 
}

// ─────────────────────────────────────────────
  // 🌀 spawnInLeastCrowdedArea
  // ─────────────────────────────────────────────



spawnInLeastCrowdedArea() {
  const attempts = 50;
  const scanRadius = 150;
  const crowdMembers = this.group.getChildren();
  let fallback = null;
  let fallbackScore = -Infinity;

  for (let i = 0; i < attempts; i++) {
    const x = Phaser.Math.Between(10, this.scene.scale.width - 10);
    const y = Phaser.Math.Between(20, this.scene.scale.height - 10);
    if (this.isBlocked(x, y)) continue;

    let nearbyCount = 0;
    let totalDist = 0;

    for (const member of crowdMembers) {
      if (!member.active) continue;
      const dist = Phaser.Math.Distance.Between(x, y, member.x, member.y);
      if (dist < scanRadius) {
        nearbyCount++;
        totalDist += dist;
      }
    }

    // 🎯 Perfect empty zone found — spawn immediately
    if (nearbyCount === 0) {
      this.spawnRandomEntity(x, y);
      return;
    }

    // Keep best fallback
    const avgDist = totalDist / nearbyCount;
    if (avgDist > fallbackScore) {
      fallbackScore = avgDist;
      fallback = { x, y };
    }
  }

  // 🪂 Fallback spawn
  if (fallback) {
    this.spawnRandomEntity(fallback.x, fallback.y);
  } else {
    console.warn("⚠️ Could not find valid spawn spot at all");
  }
}



spawnRandomEntity(x, y) {
  if (Phaser.Math.Between(1, 25) === 1) {
    const alienFrames = ["a1", "a2", "a3", "a4"];
    const frame = Phaser.Utils.Array.GetRandom(alienFrames);
    this.spawnAlien(x, y, frame);
  } else {
    this.spawnCrowdMember(x, y, { force: true });
  }

  this.scene.time.delayedCall(100, () => SoundManager.playSFX("spawn"));
}




}
