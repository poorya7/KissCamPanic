export default class KissCamFeedRenderer {
  constructor(scene, feedTexture, spotlightMarker, crowdGroup, player, hr) {
    this.scene = scene;
    this.feed = feedTexture;
    this.light = spotlightMarker;
    this.crowdGroup = crowdGroup;
    this.player = player;
    this.hr = hr;

    this.feedSize = 70;
    this.zoom = 2;
  }

  render() {
    if (!this.player || !this.hr || !this.player.texture) return;

    this.feed.clear();

    const radius = this.feedSize / (2 * this.zoom);
    const sx = this.light.x;
    const sy = this.light.y;

    const drawIfInside = (sprite) => {
      const dx = sprite.x - sx;
      const dy = sprite.y - sy;
      if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
        this.feed.draw(
          sprite,
          Math.floor(this.feedSize / 2 + dx * this.zoom),
          Math.floor(this.feedSize / 2 + dy * this.zoom),
          this.zoom
        );
      }
    };

    // Sync HR position to player before drawing
this.hr.x = this.player.x - 5;
this.hr.y = this.player.y + 5;

drawIfInside(this.hr);     // Girl first
drawIfInside(this.player); // Guy second


    this.crowdGroup.getChildren().forEach(base => {
      if (!base.visuals) return;
      base.visuals.list.forEach(part => {
        const dx = part.x - sx;
        const dy = part.y - sy;
        if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
          this.feed.draw(
            part,
            Math.floor(this.feedSize / 2 + dx * this.zoom),
            Math.floor(this.feedSize / 2 + dy * this.zoom),
            this.zoom
          );
        }
      });
    });
  }
}
