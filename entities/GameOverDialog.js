export default class GameOverDialog extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    this.setDepth(10000);
    this.setScale(1);
    this.setAlpha(0);
    this.setVisible(false);

    // ───────────────────────────────
    // ▶ Background
    // ───────────────────────────────
    this.bg = scene.add.image(0, 0, "dialog_end");
    this.add(this.bg);

    // ───────────────────────────────
    // ▶ Name input setup
    // ───────────────────────────────
    this.enteredName = "";
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

  enableKeyboardInput() {
    this.scene.input.keyboard.on("keydown", (event) => {
      if (!this.visible) return;

      const key = event.key;
      if (/^[a-z0-9 ]$/i.test(key) || key === "Backspace") {
        event.preventDefault();
      }

      if (/^[a-z0-9 ]$/i.test(key)) {
        if (this.enteredName.length < 30) {
          this.enteredName += key === " " ? " " : key.toUpperCase();
          this.updateNameDisplay();
        }
      } else if (key === "Backspace") {
        this.enteredName = this.enteredName.slice(0, -1);
        this.updateNameDisplay();
      }
    });
  }

  show(score = 0, rank = "#58 / 321") {
    this.setVisible(true);
    this.setAlpha(0);
    this.setScale(0.8);

    // Title
    const title = this.scene.add.text(0, -90, "YOU WERE CAUGHT!", {
      fontFamily: "C64",
      fontSize: "24px",
      color: "#ff5555"
    }).setOrigin(0.5);

    // SCORE: label + value
    const scoreLabel = this.scene.add.text(-50, -50, "SCORE:", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#ffff00"
    }).setOrigin(1, 0.5);

    const scoreValue = this.scene.add.text(-40, -50, ` ${score}`, {
  fontFamily: "C64",
  fontSize: "16px",
  color: "#ffaa00" // orange
}).setOrigin(0, 0.5);




    // RANK: label + value
    const rankLabel = this.scene.add.text(-50, -10, "YOU PLACED", {
      fontFamily: "C64",
      fontSize: "16px",
      color: "#00ffaa"
    }).setOrigin(1, 0.5);

    const rankValue = this.scene.add.text(-40, -10, ` ${rank}`, {
  fontFamily: "C64",
  fontSize: "16px",
  color: "#00dddd" // light teal
}).setOrigin(0, 0.5);

    // NAME: label + value
    const nameY = 30;

    this.nameLabel = this.scene.add.text(-50, nameY, "NAME:", {
  fontFamily: "C64",
  fontSize: "16px",
  color: "#ffaa00"
}).setOrigin(1, 0.5);

this.nameValueText = this.scene.add.text(-40, nameY, "", {
  fontFamily: "C64",
  fontSize: "16px",
  color: "#ffffff"
}).setOrigin(0, 0.5);


    this.add([
      title,
      scoreLabel, scoreValue,
      rankLabel, rankValue,
      this.nameLabel, this.nameValueText
    ]);

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
    const display = this.enteredName + cursor;

    if (this.nameValueText) {
      this.nameValueText.setText(display);
    }
  }
}
