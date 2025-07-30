let SoundManager = {
  scene: null,
  muted: false,

  init(scene) {
    this.scene = scene;
  },

  playSFX(key) {
  if (this.muted || !this.scene) return;

  // Prevent overlap issues by creating a fresh instance each time
  const sound = this.scene.sound.add(key);
  sound.once("complete", () => sound.destroy());
  sound.play();
}
,

  playMusic(key, config = { loop: true, volume: 0.5 }) {
    if (this.muted || !this.scene) return;
    if (this.currentMusic) this.currentMusic.stop();
    this.currentMusic = this.scene.sound.add(key, config);
    this.currentMusic.play();
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.currentMusic) {
      this.currentMusic.setMute(this.muted);
    }
  }
};

export default SoundManager;
