const { drawBackground } = require("../core/renderer");

class BaseScene {
  constructor(game, name) {
    this.game = game;
    this.name = name;
    this.buttons = [];
  }

  enter() {}

  leave() {
    this.buttons = [];
  }

  update() {}

  renderBase(ctx, fallback) {
    const { width, sceneHeight } = this.game.viewport;
    drawBackground(ctx, this.game.resources, `scene.${this.name}.background`, {
      x: 0,
      y: 0,
      w: width,
      h: sceneHeight,
    }, fallback);
  }

  handleTouch(point) {
    for (let i = this.buttons.length - 1; i >= 0; i -= 1) {
      if (this.buttons[i].tap(point)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = { BaseScene };
