export default class SpotlightHandler {
  constructor(scene, spotlight, player, onCatchCallback) {
    this.scene = scene;
    this.spotlight = spotlight;
    this.player = player;
    this.onCatch = onCatchCallback;

    this.radius = spotlight.radius || 30;
    this.maxSpeed = 0.5;
    this.lerpStrength = 0.1;
    this.caughtTriggered = false;
	
	
	
	this.scene.time.addEvent({
  delay: 2000, // every 3 seconds
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
    // If within range to reach, snap to player
    this.spotlight.x = targetX;
    this.spotlight.y = targetY;
  } else {
    // Move toward player at maxSpeed
    const angle = Math.atan2(dy, dx);
    this.spotlight.x += Math.cos(angle) * this.maxSpeed;
    this.spotlight.y += Math.sin(angle) * this.maxSpeed;
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
