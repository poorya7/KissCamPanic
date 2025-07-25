export default class GameOverDialog extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    this.setDepth(10000);
    this.setScale(1);
    this.setAlpha(0);
    this.setVisible(false);

    // Background
    this.bg = scene.add.image(0, 0, "dialog_end");
    this.add(this.bg);

    // Name text
    this.enteredName = "";
    this.nameText = this.scene.add.text(0, 80, "NAME: ", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5);
    this.add(this.nameText);

    this.cursorVisible = true;
    this.cursorTimer = this.scene.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });

    scene.add.existing(this); // attach to scene
  }

  show(score = 0, rank = "#58 / 321") {
    this.setVisible(true);
    this.setAlpha(0);
    this.setScale(0.8);

    const title = this.scene.add.text(0, -50, "YOU WERE CAUGHT!", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const scoreText = this.scene.add.text(0, -20, `SCORE: ${score}`, {
      fontFamily: "C64",
      fontSize: "14px",
      color: "#ffffaa"
    }).setOrigin(0.5);

    const prompt = this.scene.add.text(0, 10, "ENTER YOUR NAME:", {
      fontFamily: "C64",
      fontSize: "14px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const rankText = this.scene.add.text(0, 50, `YOU PLACED ${rank}`, {
      fontFamily: "C64",
      fontSize: "14px",
      color: "#00ffcc"
    }).setOrigin(0.5);

    this.add([title, scoreText, prompt, rankText]);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      ease: "back.out",
      duration: 400
    });
  }

  updateNameDisplay() {
    const cursor = this.cursorVisible ? "_" : " ";
    const display = this.enteredName.padEnd(8, " ");
    this.nameText.setText(`NAME: ${display}${cursor}`);
  }
}
