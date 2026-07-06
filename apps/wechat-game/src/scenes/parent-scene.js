const { BaseScene } = require("./base-scene");
const { GameButton } = require("../ui/button");
const { drawSprite } = require("../core/renderer");

class ParentScene extends BaseScene {
  constructor(game) {
    super(game, "parent");
    this.saved = false;
    this.themes = [
      { id: "island", assetId: "label.parent.theme.island", x: 70 },
      { id: "forest", assetId: "label.parent.theme.forest", x: 132 },
      { id: "snow", assetId: "label.parent.theme.snow", x: 194 },
      { id: "desert", assetId: "label.parent.theme.desert", x: 256 },
    ];
  }

  enter() {
    this.game.bottomNav.setActive("parent");
    this.ensureSettings();
    this.buttons = [
      this.toggle("voice", { x: 248, y: 258, w: 72, h: 40 }),
      this.toggle("image", { x: 248, y: 330, w: 72, h: 40 }),
      this.toggle("music", { x: 248, y: 402, w: 72, h: 40 }),
      ...this.themes.map((theme) => new GameButton({
        id: `theme.${theme.id}`,
        assetId: theme.assetId,
        rect: { x: theme.x, y: 502, w: 58, h: 34 },
        onTap: () => {
          this.game.state.settings.theme = theme.id;
          this.saved = false;
        },
      })),
      new GameButton({
        id: "voice-permission",
        assetId: "button.parent.voicePermission",
        rect: { x: 52, y: 546, w: 140, h: 50 },
        onTap: () => this.game.toast.show("语音权限已准备"),
      }),
      new GameButton({
        id: "image-permission",
        assetId: "button.parent.imagePermission",
        rect: { x: 198, y: 546, w: 140, h: 50 },
        onTap: () => this.game.toast.show("图片权限已准备"),
      }),
      new GameButton({
        id: "save",
        assetId: "button.parent.save",
        rect: { x: 82, y: 606, w: 225, h: 54 },
        onTap: () => this.save(),
      }),
    ];
  }

  ensureSettings() {
    this.game.state.settings = {
      voice: true,
      image: true,
      music: true,
      theme: "island",
      minutes: 30,
      ...(this.game.state.settings || {}),
    };
  }

  toggle(key, rect) {
    return new GameButton({
      id: `toggle.${key}`,
      assetId: this.game.state.settings[key] ? "icon.parent.toggleOn" : "icon.parent.toggleOff",
      rect,
      onTap: () => {
        this.game.state.settings[key] = !this.game.state.settings[key];
        this.saved = false;
      },
    });
  }

  save() {
    this.game.storage.set("settings", this.game.state.settings);
    this.saved = true;
    this.game.toast.show("家长设置已保存");
  }

  render(ctx) {
    this.renderBase(ctx, { sky: "#74d5f6", ground: "#9bd969" });
    drawSprite(ctx, this.game.resources, "panel.parent.title", { x: 50, y: 132, w: 290, h: 86 });
    drawSprite(ctx, this.game.resources, "panel.parent.board", { x: 38, y: 224, w: 314, h: 430 });
    drawSprite(ctx, this.game.resources, "panel.parent.row.sound", { x: 55, y: 244, w: 280, h: 66 });
    drawSprite(ctx, this.game.resources, "panel.parent.row.image", { x: 55, y: 316, w: 280, h: 66 });
    drawSprite(ctx, this.game.resources, "panel.parent.row.music", { x: 55, y: 388, w: 280, h: 66 });
    drawSprite(ctx, this.game.resources, this.game.state.settings.voice ? "icon.parent.toggleOn" : "icon.parent.toggleOff", { x: 248, y: 258, w: 72, h: 40 });
    drawSprite(ctx, this.game.resources, this.game.state.settings.image ? "icon.parent.toggleOn" : "icon.parent.toggleOff", { x: 248, y: 330, w: 72, h: 40 });
    drawSprite(ctx, this.game.resources, this.game.state.settings.music ? "icon.parent.toggleOn" : "icon.parent.toggleOff", { x: 248, y: 402, w: 72, h: 40 });
    drawSprite(ctx, this.game.resources, "icon.parent.slider", { x: 78, y: 462, w: 190, h: 36 });
    drawSprite(ctx, this.game.resources, "label.parent.time30", { x: 268, y: 460, w: 70, h: 40 });
    this.themes.forEach((theme) => {
      drawSprite(ctx, this.game.resources, theme.assetId, { x: theme.x, y: 502, w: 58, h: 34 });
    });
    if (this.saved) {
      drawSprite(ctx, this.game.resources, "label.parent.toast.saved", { x: 115, y: 548, w: 160, h: 44 });
    }
    this.buttons.slice(3).forEach((button) => button.render(ctx, this.game.resources));
  }
}

module.exports = { ParentScene };