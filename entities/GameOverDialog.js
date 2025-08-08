import ScoreService from "../services/ScoreService.js";

export default class GameOverDialog extends Phaser.GameObjects.Container {
  constructor(scene) {
	  this.isMobile = window.matchMedia("(pointer: coarse)").matches;

    super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY);
    this.scene = scene;
    this.setDepth(10000);
    this.setScale(1);
    this.setAlpha(0);
    this.setVisible(false);
	this.naughtyDialogActive = false;


    this.enteredName = "";
    this.finalScore = 0;
    this.keyboardEnabled = false;
	this.isSubmitting = false;

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
  if (this.naughtyDialogActive) return;
  await this.doSave();
});

this.cancelBtn.on("pointerup", () => {
  if (this.naughtyDialogActive) return;
  this.scene.onCancelName?.();
  this.hideWithAnimation();
});



    this.add([this.saveBtn, this.cancelBtn]);
    scene.add.existing(this);
  }

async doSave() {
  if (this.isSubmitting) return;
  this.isSubmitting = true;

  const name = this.enteredName.trim();
  const score = this.finalScore || 0;

  if (name.length === 0) {
    console.log("⏭️ No name entered, skipping save.");
    this.hideWithAnimation();
    return;
  }

  if (this.containsBadWord(name)) {
    this.showNaughtyDialog();
    this.isSubmitting = false;
    return;
  }

  try {
    await ScoreService.saveScore(name, score);
    this.scene.onSaveName?.(name);
    this.hideWithAnimation(); // 👈 Only hide after score is submitted
  } catch (e) {
    console.error("❌ Score save failed:", e.message);
    this.hideWithAnimation(); // 👈 Still hide, but only after error
  }

}



createMobileNameInput() {
  // remove old one if any
  if (this.mobileInputDom) {
    this.mobileInputDom.destroy();
    this.mobileInputDom = null;
  }

  // Create an *invisible but focusable* input to trigger soft keyboard
  // Keep font-size >=16px so iOS doesn’t zoom.
  const html = `
    <input id="tmpName" type="text"
      inputmode="text" autocomplete="name" autocapitalize="characters"
      style="opacity:0; width:1px; height:1px; font-size:16px; position:absolute; left:0; top:0;" />
  `;

  // Position at screen center (position doesn't matter since it's invisible)
  this.mobileInputDom = this.scene.add.dom(
    this.scene.cameras.main.centerX,
    this.scene.cameras.main.centerY
  ).createFromHTML(html).setDepth(10002);

  const el = this.mobileInputDom.getChildByID("tmpName");
  el.value = this.enteredName;

  // Sync typing from the DOM input to your bitmap text
  el.addEventListener("input", () => {
    this.enteredName = el.value.toUpperCase().slice(0, 30);
    this.updateNameDisplay();
  });

  // Allow pressing Enter on the soft keyboard to save
  el.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      this.doSave();
    }
  });

  // IMPORTANT: focus must happen inside a user gesture
  this.scene.input.once("pointerup", () => {
    // short delay helps after layout
    setTimeout(() => {
      el.focus({ preventScroll: true });
      const len = el.value.length;
      try { el.setSelectionRange(len, len); } catch {}
    }, 0);
  });
}



hideWithAnimation() {
  this.scene.tweens.add({
    targets: this,
    y: this.y + 500,
    scale: 0.95,
    ease: "Back.easeIn",
    duration: 400,
    onComplete: () => {
      this.setVisible(false);
      this.setScale(1);
      this.y = this.scene.cameras.main.centerY;

      ScoreService.getTopScores(); // 🔄 Refresh highscore panel

      ScoreService.getAllScores().then(scoreList => {
        this.scene.scoreUI.scoreList = scoreList;

        const rawScore = this.scene.scoreUI.getRawScore();
        const higherScores = scoreList.filter(s => s > rawScore).length;
        const rank = higherScores + 1;

        this.scene.scoreUI.updateRankDisplay?.(rank);

if (this.mobileInputDom) {
  this.mobileInputDom.destroy();
  this.mobileInputDom = null;
}
// re-enable keyboard capture after dialog closes
this.scene.input.keyboard.enabled = true;

        this.scene.resetGame(); // 🔁 Restart only after rank is recalculated
      });
    }
  });
}




containsBadWord(name) {
  const lower = name.toLowerCase();
  const badWords = [
  "fuck", "shit", "bitch", "cunt", "dick", "piss", "asshole", "fucker", "motherfucker",
  "fag", "faggot", "nigger", "nigga", "slut", "whore", "bastard", "cock", "dildo",
  "twat", "wank", "jerkoff", "bollocks", "arse", "tit", "boob", "clit", "spic", "coon",
  "tranny", "rape", "rapist", "retard", "suckmy", "blowjob", "handjob", "rimjob", "anal",
  "orgasm", "penis", "vagina", "ballsack", "nut", "milf", "gook", "kike", "spunk", "hoe",
  "cum", "pussy", "tits", "queer", "gayass", "fisting", "facial", "shemale", "anus", "i hate", "kill",
  "finger me","fingerme"
];

  return badWords.some(word => lower.includes(word));
}







showNaughtyDialog() {
  this.naughtyDialogActive = true;

  const dialog = this.scene.add.container(0, 0).setDepth(10001);

  const bg = this.scene.add.rectangle(0, 0, 260, 100, 0x000000)
    .setStrokeStyle(2, 0xff0000)
    .setOrigin(0.5);

  const msg = this.scene.add.text(0, -20, "No naughty words!", {
    fontFamily: "C64",
    fontSize: "16px",
    color: "#ff4444"
  }).setOrigin(0.5);

  const okBtn = this.scene.add.text(0, 25, " OK ", {
    fontFamily: "C64",
    fontSize: "18px",
    color: "#ffffff",
    backgroundColor: "#220000",
    padding: { x: 12, y: 4 },
    stroke: "#ff0000",
    strokeThickness: 2
  }).setOrigin(0.5).setInteractive();

  okBtn.on("pointerup", () => {
    dialog.destroy();
    this.naughtyDialogActive = false; // ✅ restore interactivity
  });

  dialog.add([bg, msg, okBtn]);
  dialog.setPosition(0, 0);
  this.add(dialog);
}






enableKeyboardInput() {
	if (this.isMobile) return; // mobile uses DOM input instead

  if (this.keyboardEnabled) return;
  this.keyboardEnabled = true;

  // Clean up old listener if exists
  if (this.keydownCallback) {
    this.scene.input.keyboard.off("keydown", this.keydownCallback);
  }

  this.keydownCallback = (event) => {
    if (!this.visible || this.naughtyDialogActive) return;

    const key = event.key;
    if (/^[a-z0-9 @]$/i.test(key)) {
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
      this.scene.onCancelName?.();
      this.hideWithAnimation();
      event.preventDefault();
    }
  };

  this.scene.input.keyboard.on("keydown", this.keydownCallback);
}




show(score = 0, rank = "#58 / 321") {
  // 🔄 Remove old text objects if they exist
  if (this.titleText) this.titleText.destroy();
  if (this.scoreText) this.scoreText.destroy();
  if (this.rankText) this.rankText.destroy();

  // ⏹ Reset core state
  this.enteredName = "";
  this.isSubmitting = false;
  this.keyboardEnabled = false;
  this.cursorVisible = true;

  this.finalScore = Math.floor(score / 10);

  this.setVisible(true);
  this.setAlpha(0);
  this.setScale(0.8);

  // 👇 Store refs to text for cleanup later
  this.titleText = this.scene.add.text(0, -90, "YOU WERE CAUGHT!", {
    fontFamily: "C64",
    fontSize: "24px",
    color: "#ff5555"
  }).setOrigin(0.5);

  const rawScore = Math.floor(score / 10);
  const displayScore = rawScore.toString().padStart(8, "0");

  this.scoreText = this.scene.add.text(0, -50, `SCORE: ${displayScore}`, {
    fontFamily: "C64",
    fontSize: "16px",
    color: "#ffffaa"
  }).setOrigin(0.5);

  this.rankText = this.scene.add.text(0, -10, `YOU PLACED ${rank}`, {
    fontFamily: "C64",
    fontSize: "16px",
    color: "#00ffcc"
  }).setOrigin(0.5);

  this.add([this.titleText, this.scoreText, this.rankText]);

  this.scene.tweens.add({
    targets: this,
    alpha: 1,
    scale: 1,
    ease: "back.out",
    duration: 400
  });

    this.scene.tweens.add({
    targets: this,
    alpha: 1,
    scale: 1,
    ease: "back.out",
    duration: 400
  });

  // Desktop: keep your current Phaser keyboard flow.
  // Mobile: use hidden DOM input to trigger soft keyboard.
  if (this.isMobile) {
    // prevent Phaser from swallowing keys while typing
    this.scene.input.keyboard.enabled = false;
    this.createMobileNameInput();
  } else {
    this.enableKeyboardInput();
  }

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
