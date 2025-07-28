export default class ScoreUI {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;

    this.scoreText = scene.add.text(scene.scale.width - 210, 10, "score: 0000000", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffffcc",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
  }

  update() {
    this.score += this.scene.game.loop.delta / 10 * 3;
    const raw = Math.floor(this.score);
    const display = raw.toString().padStart(7, "0");
    this.scoreText.setText("score: " + display);
  }
}
