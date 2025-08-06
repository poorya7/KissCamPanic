const volumeMap = {
  spawn: 0.3,
  shoot1: 0.9,
  shoot2: 0.9,
  powerup: 1.0,
  powerup_get: 3,
  top20: 1.2,
  top1 :2.2
};

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
  },

  playSFX(key) {
    if (this.sfxMuted || !this.scene) return;

    const volume = volumeMap[key] ?? 1.0;
    const existing = this.scene.sound.get(key);

if (existing) {
  existing.setVolume(volume);
  existing.play();
} else {
  const sound = this.scene.sound.add(key, { volume });
  sound.play();
}

  },






playMusic(key, config = { loop: true, volume: 0.5 }) {
  if (!this.scene) return;

  // Check if the sound key exists
  if (!this.scene.cache.audio.exists(key)) {
    console.warn(`❌ Sound key "${key}" not found in audio cache`);
    return;
  }

  // Destroy old music if it's valid and not already destroyed
  if (this.currentMusic && !this.currentMusic.destroyed) {
    this.currentMusic.stop();
    this.currentMusic.destroy();
  }

  // Try to create a new music instance
  const music = this.scene.sound.add(key, config);

  if (!music || typeof music.play !== "function") {
    console.warn("❌ Failed to create a valid music object");
    this.currentMusic = null;
    return;
  }

  music.setMute(this.musicMuted);
  music.play();

  this.currentMusic = music;
}






  ,





fadeMusicForSFX(sfxKey, fadeDuration = 500) {
  if (!this.scene) return;

  const music = this.currentMusic;

  if (music && music.isPlaying && !music.destroyed) {
    this.scene.tweens.add({
      targets: music,
      volume: 0,
      duration: fadeDuration,
      onComplete: () => {
        const volume = volumeMap[sfxKey] ?? 1.0;
        const sfx = this.scene.sound.get(sfxKey);

        if (sfx && !sfx.destroyed) {
          sfx.setVolume(volume);
          sfx.play();
        } else {
          const newSFX = this.scene.sound.add(sfxKey, { volume });
          newSFX.play();
        }

        // 💣 BEFORE fading back in, make sure music is still valid
        if (this.currentMusic && !this.currentMusic.destroyed) {
          this.scene.tweens.add({
            targets: this.currentMusic,
            volume: 1,
            duration: fadeDuration
          });
        } else {
          console.warn("🎵 Music was destroyed before fade back in");
          this.currentMusic = null; // Optional cleanup
        }
      }
    });
  } else {
    this.playSFX(sfxKey);
  }
}








,

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;

    if (this.currentMusic) {
      this.currentMusic.setMute(this.musicMuted);

      if (!this.musicMuted && !this.currentMusic.isPlaying) {
        this.currentMusic.play();
      }
    } else if (!this.musicMuted && this.scene) {
      this.currentMusic = this.scene.sound.add("bgMusic", {
        loop: true,
        volume: 1
      });
      this.currentMusic.play();
    }
  },

  toggleSFXMute() {
    this.sfxMuted = !this.sfxMuted;
    if (this.scene) {
      this.scene.sound.mute = this.sfxMuted;
    }
  }
};

export default SoundManager;
