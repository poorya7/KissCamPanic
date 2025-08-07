import { isBlocked } from "../../utils/CrowdUtils.js";
import SoundManager from "../../utils/SoundManager.js";
import MugManager from "./MugManager.js";
import RapidFireUI from "../RapidFireUI.js";

export default class PowerupManager {
  // ───────────────────────────────
  // ▶ constructor
  // ───────────────────────────────
  constructor(scene) {
    this.scene = scene;

    // Managers
    this.mugManager = new MugManager(scene, scene.player);
    this.rapidFireUI = new RapidFireUI(scene);

    // Settings
    this.maxRapidFireDuration = 20000;
    this.totalRapidFireTime = 0;
    this.lastRapidFireUpdate = 0;

    // Update Loop
    this.scene.time.addEvent({
      delay: 200,
      callback: this.update,
      callbackScope: this,
      loop: true
    });
  }

  // ───────────────────────────────
  // ▶ update
  // ───────────────────────────────
  update() {
    const now = this.scene.time.now;
    const delta = now - (this.lastRapidFireUpdate || now);
    this.lastRapidFireUpdate = now;

    if (this.totalRapidFireTime > 0) {
      this.totalRapidFireTime = Math.max(this.totalRapidFireTime - delta, 0);

      if (this.totalRapidFireTime === 0) {
        this.scene.player.disableRapidFire();
      }
    }

    const active = Math.ceil(this.totalRapidFireTime / 2000);
    const total = active + (this.staplerManager?.staplerGroup?.countActive(true) || 0);

    this.rapidFireUI.totalTime = this.totalRapidFireTime;
    this.rapidFireUI.update(delta, this.staplerManager?.staplerGroup?.countActive(true) || 0);

    if (this.scene.player?.rapidFireActive) {
      this.scene.player.updateRapidFireSpeed();
    }
  }

  // ───────────────────────────────
  // ▶ activateRapidFire
  // ───────────────────────────────
  activateRapidFire(player) {
    const EXTENSION = 2000;

    this.totalRapidFireTime = Math.min(
      this.totalRapidFireTime + EXTENSION,
      this.maxRapidFireDuration
    );

    this.lastRapidFireUpdate = this.scene.time.now;

    player.enableRapidFire();
    player.updateRapidFireSpeed();
  }

  // ───────────────────────────────
  // ▶ reset
  // ───────────────────────────────
  reset() {
    this.totalRapidFireTime = 0;
    this.lastRapidFireUpdate = 0;
    this.rapidFireUI.reset();

    this.staplerManager?.reset();
    this.mugManager?.reset();
  }
}
