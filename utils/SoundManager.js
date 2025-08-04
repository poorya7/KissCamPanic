let SoundManager = {
  scene: null,
  musicMuted: false,
  sfxMuted: false,
  currentMusic: null,

  init(scene) {
  this.scene = scene;

  // Apply mute state to the Phaser sound system (affects SFX)
  this.scene.sound.mute = this.sfxMuted;

  // Apply mute state to current music if it exists
  if (this.currentMusic) {
    this.currentMusic.setMute(this.musicMuted);
  }
}
,

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

    // If we unmuted and it's NOT playing, start it
    if (!this.musicMuted && !this.currentMusic.isPlaying) {
      this.currentMusic.play();
    }
  } else if (!this.musicMuted && this.scene) {
    // No music exists yet — fully recreate and play it
    this.currentMusic = this.scene.sound.add("bgMusic", {
      loop: true,
      volume: 1,
    });
    this.currentMusic.play();
  }
}


,

  toggleSFXMute() {
  this.sfxMuted = !this.sfxMuted;
  if (this.scene) {
    this.scene.sound.mute = this.sfxMuted; // ✅ apply global mute to Phaser SFX
  }
}

};

export default SoundManager;
