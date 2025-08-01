let SoundManager = {
  scene: null,
  musicMuted: false,
  sfxMuted: false,
  currentMusic: null,

  init(scene) {
    this.scene = scene;
  },

  playSFX(key) {
    if (this.sfxMuted || !this.scene) return;

    const volumeMap = {
      spawn: 0.3,
      shoot1: 0.9,
      shoot2: 0.9,
      powerup: 1.0, 
	  powerup_get:3
	  
    };

    const volume = volumeMap[key] ?? 1.0;
    const sound = this.scene.sound.add(key, { volume });
    sound.once("complete", () => sound.destroy());
    sound.play();
  },

  playMusic(key, config = { loop: true, volume: 0.5 }) {
    if (!this.scene) return;

    // Kill existing music
    if (this.currentMusic) {
      if (this.currentMusic.isPlaying) {
        this.currentMusic.stop();
      }
      this.currentMusic.destroy();
      this.currentMusic = null;
    }

    // Add & store new music instance
    this.currentMusic = this.scene.sound.add(key, config);
    this.currentMusic.setMute(this.musicMuted); // Apply mute status immediately
    this.currentMusic.play();

    console.log("[MUSIC] Music started");
  },

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;

    if (this.currentMusic) {
      this.currentMusic.setMute(this.musicMuted);
    }
  },

  toggleSFXMute() {
    this.sfxMuted = !this.sfxMuted;
  }
};

export default SoundManager;
