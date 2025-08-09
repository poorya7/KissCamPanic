// utils/InputShield.js
let shieldEl = null;
let boundStart = null;
let boundMove = null;

function ensureShield() {
  if (shieldEl) return shieldEl;
  shieldEl = document.createElement("div");
  shieldEl.id = "input-shield";
  Object.assign(shieldEl.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100dvh",
    zIndex: "999997",          // just under your tutorial overlay
    pointerEvents: "auto",
    touchAction: "none",       // hint: don't treat as scroll/zoom
    background: "transparent", // invisible
    userSelect: "none",
  });
  return shieldEl;
}

export function enableInputShield() {
  if (!shieldEl) ensureShield();
  if (!document.body.contains(shieldEl)) {
    document.body.appendChild(shieldEl);
  }

  // prevent scroll / pull-to-refresh
  if (!boundStart) {
    boundStart = (e) => e.preventDefault();
    boundMove  = (e) => e.preventDefault();
    document.addEventListener("touchstart", boundStart, { passive: false });
    document.addEventListener("touchmove",  boundMove,  { passive: false });
  }
}

export function disableInputShield() {
  if (shieldEl && shieldEl.parentNode) {
    shieldEl.parentNode.removeChild(shieldEl);
  }
  if (boundStart) {
    document.removeEventListener("touchstart", boundStart, { passive: false });
    document.removeEventListener("touchmove",  boundMove,  { passive: false });
    boundStart = boundMove = null;
  }
}
