export default class SpotlightHandler {
  constructor(scene, spotlight, player, onCatchCallback) {
    this.scene = scene;
    this.spotlight = spotlight;
    this.player = player;
    this.onCatch = onCatchCallback;

    this.radius = spotlight.radius || 30;
    this.maxSpeed = 1.8;
    this.lerpStrength = 0.1;
    this.caughtTriggered = false;
  }

  update() {
    const { x: targetX, y: targetY } = this.player;

    let nextX = Phaser.Math.Linear(this.spotlight.x, targetX, this.lerpStrength);
    let nextY = Phaser.Math.Linear(this.spotlight.y, targetY, this.lerpStrength);

    const dx = nextX - this.spotlight.x;
    const dy = nextY - this.spotlight.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.maxSpeed) {
      const angle = Math.atan2(dy, dx);
      nextX = this.spotlight.x + Math.cos(angle) * this.maxSpeed;
      nextY = this.spotlight.y + Math.sin(angle) * this.maxSpeed;
    }

    this.spotlight.x = nextX;
    this.spotlight.y = nextY;

    // Check if player is caught
    const distToPlayer = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.spotlight.x, this.spotlight.y
    );

    const isCaught = distToPlayer < this.radius * 0.5;

    if (isCaught && !this.player.disableMovement) {
      if (!this.caughtTriggered) {
        this.caughtTriggered = true;
        this.onCatch();
      }
    }

    this.player.disableMovement = isCaught;
  }
}
