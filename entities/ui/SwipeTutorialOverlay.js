// entities/ui/SwipeTutorialOverlay.js
import { enableInputShield, disableInputShield } from "../../utils/InputShield.js";

export default class SwipeTutorialOverlay {
  constructor(scene, opts = {}) {
    this.scene = scene;

    // Options
    this.fullBlack = opts.fullBlack ?? true;   // true = solid black
    this.opacity   = opts.opacity   ?? 0.9;    // used if fullBlack === false
    this.deadzone  = opts.deadzone  ?? 8;

    // State
    this._root      = null;  // DOM overlay
    this._styleTag  = null;  // DOM <style> for keyframes
    this._touchStart = null;
    this._onStartCb  = null;

    // Handlers
    this._onDocStart = this._onDocStart.bind(this);
    this._onDocMove  = this._onDocMove.bind(this);
  }

  show(onStart) {
    this._onStartCb = onStart;

    // 1) Block page scroll & pull-to-refresh globally
    enableInputShield();
    document.addEventListener("touchstart", this._onDocStart, { passive: false });
    document.addEventListener("touchmove",  this._onDocMove,  { passive: false });

    // 2) Build full-viewport DOM overlay (covers game + sidebar + bottom bar)
    const root = document.createElement("div");
    root.id = "swipe-tutorial-overlay";
    Object.assign(root.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100dvh",
      zIndex: "999998",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: this.fullBlack ? "rgba(0,0,0,1)" : `rgba(0,0,0,${this.opacity})`,
      pointerEvents: "auto",
      touchAction: "none",
      userSelect: "none",
      paddingTop: "env(safe-area-inset-top)",
      paddingRight: "env(safe-area-inset-right)",
      paddingBottom: "env(safe-area-inset-bottom)",
      paddingLeft: "env(safe-area-inset-left)"
    });

    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      maxWidth: "90vw",
      textAlign: "center",
      fontFamily: "C64, monospace",
      color: "#fff",
      textShadow: "2px 2px #000",
      lineHeight: "1.3"
    });

    const title = document.createElement("div");
    title.textContent = "SWIPE ANYWHERE ON THE WHOLE SCREEN TO MOVE";
    Object.assign(title.style, {
      fontSize: "22px",
      marginBottom: "12px"
    });

    const icon = document.createElement("div");
    icon.textContent = "«   «   «";
    Object.assign(icon.style, {
      fontSize: "44px",
      margin: "8px 0 6px 0",
      animation: "swipeIcon 0.9s ease-in-out infinite alternate"
    });

    const hint = document.createElement("div");
    hint.textContent = "first swipe starts the game";
    Object.assign(hint.style, {
      fontSize: "14px",
      color: "#ffccff"
    });

    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @keyframes swipeIcon { from { transform: translateX(-16vw); } to { transform: translateX(16vw); } }
    `;

    wrap.appendChild(title);
    wrap.appendChild(icon);
    wrap.appendChild(hint);
    root.appendChild(wrap);
    document.head.appendChild(styleTag);
    document.body.appendChild(root);

    this._root = root;
    this._styleTag = styleTag;
  }

  hide() {
    // Remove swipe listeners + shield
    document.removeEventListener("touchstart", this._onDocStart, { passive: false });
    document.removeEventListener("touchmove",  this._onDocMove,  { passive: false });
    disableInputShield();

    // Remove DOM
    if (this._root && this._root.parentNode) this._root.parentNode.removeChild(this._root);
    if (this._styleTag && this._styleTag.parentNode) this._styleTag.parentNode.removeChild(this._styleTag);

    this._root = null;
    this._styleTag = null;
    this._touchStart = null;
    this._onStartCb = null;
  }

  // ---- global swipe detection (counts swipes anywhere) ----
  _onDocStart(ev) {
    ev.preventDefault();
    const t = ev.touches && ev.touches[0];
    if (!t) return;
    this._touchStart = { x: t.clientX, y: t.clientY };
  }

  _onDocMove(ev) {
    ev.preventDefault();
    if (!this._touchStart) return;
    const t = ev.touches && ev.touches[0];
    if (!t) return;

    const dx = t.clientX - this._touchStart.x;
    const dy = t.clientY - this._touchStart.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= this.deadzone) {
      const cb = this._onStartCb;
      this.hide();
      if (cb) cb();
    }
  }
}
