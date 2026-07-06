const { BaseScene } = require("./base-scene");
const { GameButton } = require("../ui/button");
const { drawSprite, drawText } = require("../core/renderer");

class WorksScene extends BaseScene {
  constructor(game) {
    super(game, "works");
  }

  enter() {
    this.game.bottomNav.setActive("works");
    this.buttons = [
      new GameButton({
        id: "refresh",
        assetId: "button.works.refresh",
        rect: { x: 126, y: 616, w: 138, h: 48 },
        onTap: () => this.game.toast.show("作品已刷新"),
      }),
    ];
  }

  render(ctx) {
    this.renderBase(ctx, { sky: "#65ccf5", ground: "#9add63" });
    drawSprite(ctx, this.game.resources, "panel.works.title", { x: 50, y: 132, w: 290, h: 86 });
    drawSprite(ctx, this.game.resources, "panel.works.board", { x: 48, y: 224, w: 294, h: 416 });

    const works = this.game.state.works || [];
    if (!works.length) {
      this.renderEmpty(ctx);
    } else {
      this.renderWorks(ctx, works.slice(0, 3));
    }

    this.buttons.forEach((button) => button.render(ctx, this.game.resources));
  }

  renderEmpty(ctx) {
    drawSprite(ctx, this.game.resources, "panel.works.empty", { x: 70, y: 326, w: 250, h: 136 });
    drawText(ctx, "去孵化一只小恐龙吧", 195, 416, {
      color: "#8a673c",
      font: "bold 15px sans-serif",
      maxWidth: 210,
      maxLines: 1,
    });
  }

  renderWorks(ctx, works) {
    const featured = works[0];
    drawSprite(ctx, this.game.resources, "panel.works.card.featured", { x: 62, y: 246, w: 266, h: 174 });
    drawSprite(ctx, this.game.resources, "label.works.ribbon.featured", { x: 68, y: 250, w: 112, h: 38 });
    this.renderWorkText(ctx, featured, 82, 362, 205);
    drawSprite(ctx, this.game.resources, "icon.works.meta.crown", { x: 136, y: 370, w: 26, h: 26 });
    drawSprite(ctx, this.game.resources, "label.works.meta.date", { x: 238, y: 390, w: 76, h: 26 });
    drawSprite(ctx, this.game.resources, "icon.works.meta.paw", { x: 294, y: 370, w: 30, h: 30 });

    const normalSlots = [
      { x: 62, y: 430, icon: "icon.works.meta.heart" },
      { x: 202, y: 430, icon: "icon.works.meta.leaf" },
    ];
    normalSlots.forEach((slot, index) => {
      const item = works[index + 1];
      drawSprite(ctx, this.game.resources, "panel.works.card.normal", { x: slot.x, y: slot.y, w: 126, h: 164 });
      if (item) {
        this.renderWorkText(ctx, item, slot.x + 14, slot.y + 92, 96);
        drawSprite(ctx, this.game.resources, slot.icon, { x: slot.x + 72, y: slot.y + 116, w: 26, h: 26 });
      } else {
        drawText(ctx, "新孵化", slot.x + 63, slot.y + 102, {
          color: "#8a673c",
          font: "bold 14px sans-serif",
          maxWidth: 100,
          maxLines: 1,
        });
      }
    });
  }

  renderWorkText(ctx, item, x, y, maxWidth) {
    drawText(ctx, item.title || "新小恐龙", x, y, {
      align: "left",
      color: "#74421c",
      font: "bold 17px sans-serif",
      maxWidth,
      maxLines: 1,
    });
    drawText(ctx, item.description || this.game.dinoName(item.dino), x, y + 24, {
      align: "left",
      color: "#8a673c",
      font: "bold 12px sans-serif",
      maxWidth,
      maxLines: 1,
    });
  }
}

module.exports = { WorksScene };