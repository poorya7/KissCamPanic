import ScoreService from "../services/ScoreService.js";

export default class GameOverDialog extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);
    this.scene = scene;
    this.setDepth(10000);
    this.setScale(1);
    this.setAlpha(0);
    this.setVisible(false);

    this.enteredName = "";
    this.finalScore = 0;
    this.keyboardEnabled = false;
    this.maxNameWidth = 180;

    // Background
    this.bg = scene.add.image(0, 0, "dialog_end").setScale(0.3);
    this.add(this.bg);

    // Name Value Display
    this.nameValue = this.scene.add.text(0, 30, "", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0, 0.5);
    this.add(this.nameValue);

    // Delayed Name Label Setup
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

    // Blinking Cursor Timer
    this.cursorVisible = true;
    this.cursorTimer = this.scene.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      }
    });

    // SAVE & CANCEL Buttons
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

    this.saveBtn.on("pointerup", async () => {
  await this.doSave();
});


    this.cancelBtn.on("pointerup", () => {
      this.scene.onCancelName?.();
      this.setVisible(false);
      this.scene.scene.restart();
    });

    this.add([this.saveBtn, this.cancelBtn]);
    scene.add.existing(this);
  }

  async doSave() {
  const name = this.enteredName.trim();
  const score = this.finalScore || 0;

  if (name.length === 0) {
    console.log("⏭️ No name entered, skipping save.");
  } else {
    console.log("✅ Saving score:", { name, score });
    try {
      await ScoreService.saveScore(name, score);
      this.scene.onSaveName?.(name);
    } catch (e) {
      console.error("❌ Score save failed:", e.message);
    }
  }

  this.setVisible(false);

  this.scene.time.delayedCall(200, () => {
    this.scene.scene.restart();
  });
}



  enableKeyboardInput() {
    if (this.keyboardEnabled) return;
    this.keyboardEnabled = true;

    this.keydownCallback = (event) => {
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
        this.doSave();
        event.preventDefault();
      } else if (key === "Escape") {
        this.cancelBtn.emit("pointerup");
        event.preventDefault();
      }
    };

    this.scene.input.keyboard.on("keydown", this.keydownCallback);
  }

  show(score = 0, rank = "#58 / 321") {
    this.finalScore = Math.floor(score / 10);

    this.setVisible(true);
    this.setAlpha(0);
    this.setScale(0.8);

    const title = this.scene.add.text(0, -90, "YOU WERE CAUGHT!", {
      fontFamily: "C64",
      fontSize: "24px",
      color: "#ff5555"
    }).setOrigin(0.5);

    const rawScore = Math.floor(score / 10);
    const displayScore = rawScore.toString().padStart(8, "0");

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

    this.enableKeyboardInput();
  }

  updateNameDisplay() {
    const cursor = this.cursorVisible ? "_" : " ";
    this.nameValue.setText(this.enteredName + cursor);

    this.nameValue.setScale(1);
    const actualWidth = this.nameValue.width;
    if (actualWidth > this.maxNameWidth) {
      const shrinkScale = this.maxNameWidth / actualWidth;
      this.nameValue.setScale(shrinkScale);
    }
  }
}
