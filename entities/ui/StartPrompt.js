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
      // inside StartPrompt.show(...)
	const swipe = new SwipeTutorialOverlay(scene, { fullBlack: false, opacity: 0.9 });
	swipe.show(onStart);

    } else {
      StartDialog.show(scene, onStart);
    }
  }
}
