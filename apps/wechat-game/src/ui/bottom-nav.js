const { GameButton } = require("./button");
const { drawSprite } = require("../core/renderer");

class BottomNav {
  constructor(game) {
    this.game = game;
    this.height = 160;
    this.active = "hatch";
    this.items = [
      {
        id: "works",
        label: "作品",
        iconId: "icon.nav.works",
        labelId: "label.nav.works",
        iconRect: { x: 43, y: 18, w: 60, h: 58 },
        labelRect: { x: 37, y: 108, w: 88, h: 38 },
      },
      {
        id: "hatch",
        label: "孵化",
        iconId: "icon.nav.hatch",
        labelId: "label.nav.hatch",
        iconRect: { x: 152, y: 2, w: 86, h: 96 },
        labelRect: { x: 151, y: 108, w: 88, h: 38 },
      },
      {
        id: "parent",
        label: "家长",
        iconId: "icon.nav.parent",
        labelId: "label.nav.parent",
        iconRect: { x: 295, y: 18, w: 68, h: 58 },
        labelRect: { x: 296, y: 108, w: 88, h: 38 },
      },
    ];
  }

  setActive(sceneName) {
    if (["works", "hatch", "parent"].includes(sceneName)) {
      this.active = sceneName;
    }
  }

  getButtons() {
    const { width, height } = this.game.viewport;
    const top = height - this.height;
    const buttonWidth = width / 3;
    return this.items.map((item, index) => new GameButton({
      id: `nav.${item.id}`,
      text: item.label,
      assetId: "button.orange",
      rect: { x: index * buttonWidth, y: top, w: buttonWidth, h: this.height },
      onTap: () => this.game.go(item.id),
    }));
  }

  render(ctx, resources) {
    const { width, height } = this.game.viewport;
    const top = height - this.height;
    const scaleX = width / 390;
    const scaleY = this.height / 160;
    drawSprite(ctx, resources, "panel.nav.background", { x: 0, y: top, w: width, h: this.height });
    this.items.forEach((item) => {
      drawSprite(ctx, resources, item.iconId, {
        x: item.iconRect.x * scaleX,
        y: top + item.iconRect.y * scaleY,
        w: item.iconRect.w * scaleX,
        h: item.iconRect.h * scaleY,
      });
      drawSprite(ctx, resources, item.labelId, {
        x: item.labelRect.x * scaleX,
        y: top + item.labelRect.y * scaleY,
        w: item.labelRect.w * scaleX,
        h: item.labelRect.h * scaleY,
      });
    });
  }

  handleTouch(point) {
    const buttons = this.getButtons();
    for (let i = buttons.length - 1; i >= 0; i -= 1) {
      if (buttons[i].tap(point)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = { BottomNav };