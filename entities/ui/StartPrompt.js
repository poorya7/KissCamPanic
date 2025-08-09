import StartDialog from "../StartDialog.js";
import SwipeTutorialOverlay from "./SwipeTutorialOverlay.js";

function isMobile() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function isLandscape() {
  return (window.matchMedia && window.matchMedia("(orientation: landscape)").matches)
      || window.innerWidth > window.innerHeight;
}

export default class StartPrompt {
  static _shown = false;

  static show(scene, onStart) {
    if (StartPrompt._shown) return;
    StartPrompt._shown = true;

    if (isMobile() && isLandscape()) {
      const swipe = new SwipeTutorialOverlay(scene, { opacity: 0.55, deadzone: 8 });
      swipe.show(onStart);
    } else {
      StartDialog.show(scene, onStart);
    }
  }
}
