class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.current = null;
  }

  register(name, scene) {
    this.scenes.set(name, scene);
  }

  go(name, params = {}) {
    const next = this.scenes.get(name);
    if (!next) {
      throw new Error(`Unknown scene: ${name}`);
    }
    if (this.current && this.current.leave) {
      this.current.leave();
    }
    this.current = next;
    if (next.enter) {
      next.enter(params);
    }
  }

  update(delta) {
    if (this.current && this.current.update) {
      this.current.update(delta);
    }
  }

  render(ctx) {
    if (this.current && this.current.render) {
      this.current.render(ctx);
    }
  }

  handleTouch(point) {
    if (this.current && this.current.handleTouch) {
      return this.current.handleTouch(point);
    }
    return false;
  }
}

module.exports = { SceneManager };
