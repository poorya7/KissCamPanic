let SoundManager = {
	chrisSFX: null,
  scene: null,
  muted: false,

  init(scene) {
    this.scene = scene;
  },

playSFX(key) {
  if (this.muted || !this.scene) return;

  const volumeMap = {
    spawn: 0.4,
    shoot1: 1,
    shoot2: 1.0
    // add other sounds here if needed
  };

  const volume = volumeMap[key] ?? 1.0;

  const sound = this.scene.sound.add(key, { volume });
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
