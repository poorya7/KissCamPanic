export default class SpotlightHandler {
  constructor(scene, spotlight, player, onCatchCallback) {
    this.scene = scene;
    this.spotlight = spotlight;
    this.player = player;
    this.onCatch = onCatchCallback;

    this.radius = spotlight.radius || 30;
    this.maxSpeed = 3.5;
    this.lerpStrength = 0.1;
    this.caughtTriggered = false;

    this.bubble = null;
    this.hasStartedChasing = false;

    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.maxSpeed += 0.1;
      },
      callbackScope: this,
      loop: true
    });
  }

  update() {
    const { x: targetX, y: targetY } = this.player;

    const dx = targetX - this.spotlight.x;
    const dy = targetY - this.spotlight.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.maxSpeed) {
      this.spotlight.x = targetX;
      this.spotlight.y = targetY;
    } else {
      const angle = Math.atan2(dy, dx);
      this.spotlight.x += Math.cos(angle) * this.maxSpeed;
      this.spotlight.y += Math.sin(angle) * this.maxSpeed;

      // First time spotlight starts chasing
      if (!this.hasStartedChasing) {
        this.hasStartedChasing = true;

        // Show bubble 1s later
        this.scene.time.delayedCall(1000, () => {
          this.bubble = this.scene.spotlightBubble;
		this.bubble.setVisible(true); // ✅ Show it now


          // Destroy bubble 4s after showing (5s total)
          this.scene.time.delayedCall(8000, () => {
            if (this.bubble) {
              this.bubble.destroy();
              this.bubble = null;
            }
          }, null, this);
        }, null, this);
      }
    }

    // Bubble follows spotlight
    if (this.bubble) {
      this.bubble.x = this.spotlight.x + 6;
      this.bubble.y = this.spotlight.y - 70;
    }

    // Check if player is caught
    const distToPlayer = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.spotlight.x, this.spotlight.y
    );

    const isCaught = distToPlayer < this.radius * 0.5;

    if (isCaught && !this.player.disableMovement && !this.caughtTriggered) {
      this.caughtTriggered = true;
      this.player.disableMovement = true;
      this.onCatch();
    }
  }
}
