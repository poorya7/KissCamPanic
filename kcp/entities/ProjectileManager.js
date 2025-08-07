export default class ProjectileManager {
  constructor(scene, projectileGroup) {
    this.scene = scene;
    this.group = projectileGroup;
  }

  update() {
    const now = this.scene.time.now;

    this.group.getChildren().forEach(proj => {
      if (proj.type === "credit_card") {
        proj.rotation += 0.3;
        const flip = Math.abs(Math.sin(now * 0.02));
        proj.setScale(0.015 * flip, 0.015);
        if (proj.y > proj.startY) proj.destroy();
      } else if (proj.type === "briefcase") {
        if (proj.y >= proj.throwerY + 15) proj.destroy();
      }
    });
  }
}
