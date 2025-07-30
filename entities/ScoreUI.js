export default class ScoreUI {
  constructor(scene) {
	  this.scoreList = [];

    this.scene = scene;
    this.score = 0;

    const xLabel = scene.scale.width - 210;
    const xValue = scene.scale.width - 125;

    // Score label
    this.scoreLabel = scene.add.text(xLabel, 10, "score:", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#FEAF00",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);

    // Score value
    this.scoreValue = scene.add.text(xValue, 10, "000000", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#FEAF00",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);

    // Rank label
    this.rankLabel = scene.add.text(xLabel, 30, "rank :", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#FEAF00",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);

    // Rank value
    this.rankValue = scene.add.text(xValue, 30, "-", {

      fontFamily: "C64",
      fontSize: "16px",
      color: "#FEAF00",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
  }

update() {
  this.score += this.scene.game.loop.delta / 10 * 3;

  const raw = Math.floor(this.score / 10);
  const display = raw.toString().padStart(6, "0");
  this.scoreValue.setText(display);

  // 🔎 Calculate rank from in-memory score list
  if (this.scoreList.length > 0) {
    const higherScores = this.scoreList.filter(s => s > raw).length;
    const newRank = higherScores + 1;

    if (newRank !== this.rank) {
      this.rank = newRank;
      this.rankValue.setText(this.rank.toString());
    }
  }
}


  setRank(newRank) {
    this.rank = newRank;
  }
  
  


setScoreList(scoreList) {
  this.scoreList = scoreList;
}


  getRawScore() {
    return Math.floor(this.score / 10);
  }
}
