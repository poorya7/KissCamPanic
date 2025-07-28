export default class GameOverDialog extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);
    this.scene = scene;
    this.setDepth(10000);
    this.setScale(1);
    this.setAlpha(0);
    this.setVisible(false);

    // ───────────────────────────────
    // ▶ Background
    // ───────────────────────────────
    this.bg = scene.add.image(0, 0, "dialog_end").setScale(0.3);
    this.add(this.bg);

    // ───────────────────────────────
    // ▶ Name Label + Name Value
    // ───────────────────────────────
    this.enteredName = "";
	this.maxNameWidth = 180; // adjust as needed for your dialog width


    this.nameValue = this.scene.add.text(0, 30, "", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0, 0.5);
    this.add(this.nameValue);

    // ───────────────────────────────
    // ▶ Delayed Name Label Setup
    // ───────────────────────────────
    this.time = scene.time;
    this.time.delayedCall(100, () => {
      this.nameLabel = this.scene.add.text(0, 30, "NAME:", {
        fontFamily: "C64",
        fontSize: "16px",
        color: "#ffffff"
      }).setOrigin(1, 0.5);

      this.nameLabel.setX(Math.floor(-10));
      this.nameLabel.setResolution(1);
      this.add(this.nameLabel);

      this.nameValue.setX(this.nameLabel.x + 4);
      this.nameValue.setResolution(1);
    }, [], this);

    // ───────────────────────────────
    // ▶ Blinking Cursor Timer
    // ───────────────────────────────
    this.cursorVisible = true;
    this.cursorTimer = this.scene.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });

    // ───────────────────────────────
    // ▶ SAVE & CANCEL Buttons
    // ───────────────────────────────
    const buttonY = 140;

    this.saveBtn = scene.add.text(-70, buttonY, " SAVE ", {
      fontFamily: "C64",
      fontSize: "18px",
      color: "#00ff00",
      backgroundColor: "#002200",
      padding: { x: 16, y: 6 },
      stroke: "#00ff00",
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#003300",
        blur: 0,
        stroke: false,
        fill: true
      }
    }).setOrigin(0.5).setInteractive();

    this.cancelBtn = scene.add.text(70, buttonY, " CANCEL ", {
      fontFamily: "C64",
      fontSize: "18px",
      color: "#ff4444",
      backgroundColor: "#220000",
      padding: { x: 16, y: 6 },
      stroke: "#ff4444",
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#330000",
        blur: 0,
        stroke: false,
        fill: true
      }
    }).setOrigin(0.5).setInteractive();

    [this.saveBtn, this.cancelBtn].forEach(button => {
      button.on("pointerover", () => {
        button.setAlpha(0.85);
        button.setScale(1.08);
      });
      button.on("pointerout", () => {
        button.setAlpha(1);
        button.setScale(1);
      });
    });

    this.saveBtn.on("pointerdown", () => {
      this.scene.onSaveName?.(this.enteredName);
    });

    this.cancelBtn.on("pointerdown", () => {
      this.scene.onCancelName?.();
    });

    this.add([this.saveBtn, this.cancelBtn]);
    scene.add.existing(this);
  }

  // ───────────────────────────────
  // ▶ enableKeyboardInput
  // ───────────────────────────────
  enableKeyboardInput() {
  this.scene.input.keyboard.on("keydown", (event) => {
    if (!this.visible) return;

    const key = event.key;

    if (/^[a-z0-9 ]$/i.test(key)) {
      if (this.enteredName.length < 30) {
        this.enteredName += key.toUpperCase();
        this.updateNameDisplay();
      }
      event.preventDefault();
    } else if (key === "Backspace") {
      this.enteredName = this.enteredName.slice(0, -1);
      this.updateNameDisplay();
      event.preventDefault();
    } else if (key === "Enter") {
      this.scene.onSaveName?.(this.enteredName);
      event.preventDefault();
    } else if (key === "Escape") {
      this.scene.onCancelName?.();
      event.preventDefault();
    }
  });
}


  // ───────────────────────────────
  // ▶ show
  // ───────────────────────────────
  show(score = 0, rank = "#58 / 321") {
    this.setVisible(true);
    this.setAlpha(0);
    this.setScale(0.8);

    const title = this.scene.add.text(0, -90, "YOU WERE CAUGHT!", {
      fontFamily: "C64",
      fontSize: "24px",
      color: "#ff5555"
    }).setOrigin(0.5);

    const rawScore = Math.floor(score / 10); // remove last digit
const displayScore = rawScore.toString().padStart(8, "0"); // pad with extra zero

const scoreText = this.scene.add.text(0, -50, `SCORE: ${displayScore}`, {
  fontFamily: "C64",
  fontSize: "16px",
  color: "#ffffaa"
}).setOrigin(0.5);


    const rankText = this.scene.add.text(0, -10, `YOU PLACED ${rank}`, {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#00ffcc"
    }).setOrigin(0.5);

    this.add([title, scoreText, rankText]);

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      ease: "back.out",
      duration: 400
    });
  }

  // ───────────────────────────────
  // ▶ updateNameDisplay
  // ───────────────────────────────
  updateNameDisplay() {
  const cursor = this.cursorVisible ? "_" : " ";
  this.nameValue.setText(this.enteredName + cursor);

  // Reset scale before measuring
  this.nameValue.setScale(1);

  const actualWidth = this.nameValue.width;
  if (actualWidth > this.maxNameWidth) {
    const shrinkScale = this.maxNameWidth / actualWidth;
    this.nameValue.setScale(shrinkScale);
  }
}

}
