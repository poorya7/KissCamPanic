
// utils/InputShield.js
let shieldEl = null;
let onStart = null;
let onMove = null;

// remember styles so we can restore
let saved = null;

function ensureShield() {
  if (shieldEl) return shieldEl;
  shieldEl = document.createElement("div");
  shieldEl.id = "input-shield";
  Object.assign(shieldEl.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100dvh",
    // Make sure it's above EVERYTHING
    zIndex: "2147483647",
    pointerEvents: "none",
    touchAction: "none",       // hint to browsers
    background: "transparent",
    userSelect: "none",
  });
  return shieldEl;
}

export function enableInputShield() {
  ensureShield();

  if (!document.body.contains(shieldEl)) {
    document.body.appendChild(shieldEl);
  }

  // iOS/Safari: preventDefault must be on the event target
  if (!onStart) {
    onStart = (e) => e.preventDefault();
    onMove  = (e) => e.preventDefault();
    //shieldEl.addEventListener("touchstart", onStart, { passive: false });
    //shieldEl.addEventListener("touchmove",  onMove,  { passive: false });
  }

  // Lock scroll everywhere (Chrome pull-to-refresh, scrollable sidebars, etc.)
  if (!saved) {
    const html = document.documentElement;
    const body = document.body;
    const rightSidebar = document.getElementById("right-sidebar");
    const bottomBar = document.getElementById("bottom-bar"); // optional

    saved = {
      scrollY: window.scrollY,
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyPos: body.style.position,
      bodyTop: body.style.top,
      sidebarOverflow: rightSidebar ? rightSidebar.style.overflow : null,
      sidebarPointer: rightSidebar ? rightSidebar.style.pointerEvents : null,
      bottomPointer: bottomBar ? bottomBar.style.pointerEvents : null,
    };

    // Stop global scroll & pull-to-refresh
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    // Freeze body position so page can't move
    body.style.position = "fixed";
    body.style.top = `-${saved.scrollY}px`;

    // Also stop the highscores panel specifically + let touches pass through
    if (rightSidebar) {
      rightSidebar.style.overflow = "hidden";
      rightSidebar.style.pointerEvents = "none";
    }
    if (bottomBar) {
      bottomBar.style.pointerEvents = "none";
    }
  }
}

export function disableInputShield() {
  // Remove listeners
  if (onStart) {
    shieldEl.removeEventListener("touchstart", onStart, { passive: false });
    shieldEl.removeEventListener("touchmove",  onMove,  { passive: false });
    onStart = onMove = null;
  }

  // Remove shield
  if (shieldEl && shieldEl.parentNode) {
    shieldEl.parentNode.removeChild(shieldEl);
  }

  // Restore scroll styles/position
  if (saved) {
    const html = document.documentElement;
    const body = document.body;
    const rightSidebar = document.getElementById("right-sidebar");
    const bottomBar = document.getElementById("bottom-bar");

    html.style.overflow = saved.htmlOverflow ?? "";
    body.style.overflow = saved.bodyOverflow ?? "";
    html.style.overscrollBehavior = saved.htmlOverscroll ?? "";
    body.style.overscrollBehavior = saved.bodyOverscroll ?? "";
    body.style.position = saved.bodyPos ?? "";
    body.style.top = saved.bodyTop ?? "";

    // restore scroll position
    window.scrollTo(0, saved.scrollY || 0);

    if (rightSidebar) {
      if (saved.sidebarOverflow != null) rightSidebar.style.overflow = saved.sidebarOverflow;
      if (saved.sidebarPointer != null)  rightSidebar.style.pointerEvents = saved.sidebarPointer;
    }
    if (bottomBar && saved.bottomPointer != null) {
      bottomBar.style.pointerEvents = saved.bottomPointer;
    }

    saved = null;
  }
}
