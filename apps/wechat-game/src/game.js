const { createCanvas, getSystemInfo, onTouchStart, requestFrame } = require("./core/env");
const { clear } = require("./core/renderer");
const { ResourceLoader } = require("./core/resource-loader");
const { SceneManager } = require("./core/scene-manager");
const { BottomNav } = require("./ui/bottom-nav");
const { Toast } = require("./ui/toast");
const { HomeScene } = require("./scenes/home-scene");
const { StoryScene } = require("./scenes/story-scene");
const { HatchScene } = require("./scenes/hatch-scene");
const { WorksScene } = require("./scenes/works-scene");
const { ParentScene } = require("./scenes/parent-scene");
const { ApiClient } = require("./services/api-client");
const { RecorderService } = require("./services/recorder-service");
const { MediaService } = require("./services/media-service");
const { StorageService } = require("./services/storage-service");

class DinoDooGame {
  constructor() {
    this.canvas = createCanvas();
    this.ctx = this.canvas.getContext("2d");
    const info = getSystemInfo();
    this.design = {
      width: 390,
      height: 844,
      sceneHeight: 684,
      navHeight: 160,
    };
    this.screen = {
      width: info.windowWidth || this.design.width,
      height: info.windowHeight || this.design.height,
      pixelRatio: info.pixelRatio || 1,
    };
    this.viewport = {
      width: this.design.width,
      height: this.design.height,
      pixelRatio: 1,
      sceneHeight: this.design.sceneHeight,
      navHeight: this.design.navHeight,
    };
    this.layout = this.createLayout();
    this.canvas.width = Math.round(this.screen.width * this.screen.pixelRatio);
    this.canvas.height = Math.round(this.screen.height * this.screen.pixelRatio);
    if (this.canvas.style) {
      this.canvas.style.width = `${this.screen.width}px`;
      this.canvas.style.height = `${this.screen.height}px`;
    }
    this.ctx.scale(this.screen.pixelRatio, this.screen.pixelRatio);

    this.resources = new ResourceLoader();
    this.storage = new StorageService();
    this.api = new ApiClient();
    this.recorder = new RecorderService();
    this.media = new MediaService();
    this.toast = new Toast();
    this.bottomNav = new BottomNav(this);
    this.sceneManager = new SceneManager(this);
    this.lastTime = 0;
    this.state = {
      selectedDino: this.storage.get("selectedDino", "adai"),
      works: this.storage.get("works", []),
      settings: this.storage.get("settings", { voice: true, image: true }),
    };
  }

  async start() {
    this.registerScenes();
    await this.resources.loadAll();
    this.sceneManager.go("home");
    onTouchStart((event) => this.handleTouch(event));
    requestFrame((time) => this.loop(time));
  }

  registerScenes() {
    this.sceneManager.register("home", new HomeScene(this));
    this.sceneManager.register("story", new StoryScene(this));
    this.sceneManager.register("hatch", new HatchScene(this));
    this.sceneManager.register("works", new WorksScene(this));
    this.sceneManager.register("parent", new ParentScene(this));
  }

  go(sceneName) {
    this.sceneManager.go(sceneName);
  }

  loop(time) {
    const delta = this.lastTime ? time - this.lastTime : 16;
    this.lastTime = time;
    this.update(delta);
    this.render();
    requestFrame((next) => this.loop(next));
  }

  update(delta) {
    this.sceneManager.update(delta);
  }

  createLayout() {
    const scale = Math.min(
      this.screen.width / this.design.width,
      this.screen.height / this.design.height,
    );
    return {
      scale,
      offsetX: (this.screen.width - this.design.width * scale) / 2,
      offsetY: (this.screen.height - this.design.height * scale) / 2,
    };
  }

  render() {
    clear(this.ctx, this.screen.width, this.screen.height);
    this.ctx.save();
    this.ctx.translate(this.layout.offsetX, this.layout.offsetY);
    this.ctx.scale(this.layout.scale, this.layout.scale);
    this.sceneManager.render(this.ctx);
    this.bottomNav.render(this.ctx, this.resources);
    this.toast.render(this.ctx, this.viewport);
    this.ctx.restore();
  }

  handleTouch(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) {
      return;
    }
    const point = this.toDesignPoint(touch.clientX, touch.clientY);
    if (!point) {
      return;
    }
    if (this.bottomNav.handleTouch(point)) {
      return;
    }
    this.sceneManager.handleTouch(point);
  }

  toDesignPoint(clientX, clientY) {
    const x = (clientX - this.layout.offsetX) / this.layout.scale;
    const y = (clientY - this.layout.offsetY) / this.layout.scale;
    if (x < 0 || y < 0 || x > this.design.width || y > this.design.height) {
      return null;
    }
    return { x, y };
  }

  dinoName(code) {
    return ({ xiaobao: "小暴", adai: "阿呆", gulu: "咕噜" })[code] || "阿呆";
  }
}

module.exports = { DinoDooGame };
