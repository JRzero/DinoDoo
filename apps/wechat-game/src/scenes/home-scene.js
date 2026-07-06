const { BaseScene } = require("./base-scene");
const { GameButton } = require("../ui/button");
const { drawSprite } = require("../core/renderer");

const HOME_LAYOUT = {
  logo: { x: 20, y: 30, w: 350, h: 145 },
  music: { x: 335, y: 34, w: 54, h: 54 },
  guide: { x: 45, y: 198, w: 300, h: 36 },
  pathStones: { x: 116, y: 474, w: 160, h: 120 },
  pawprints: { x: 170, y: 468, w: 120, h: 80 },
};

class HomeScene extends BaseScene {
  constructor(game) {
    super(game, "home");
    this.dinos = [
      {
        code: "xiaobao",
        label: "小暴",
        assetId: "dino.xiaobao",
        badgeId: "label.badge.xiaobao",
        pedestalId: "panel.home.pedestal.large",
        rect: { x: 112, y: 245, w: 170, h: 188 },
        pedestal: { x: 112, y: 389, w: 170, h: 64 },
        badge: { x: 124, y: 430, w: 142, h: 54 },
        hitRect: { x: 92, y: 236, w: 210, h: 248 },
      },
      {
        code: "adai",
        label: "阿呆",
        assetId: "dino.adai",
        badgeId: "label.badge.adai",
        pedestalId: "panel.home.pedestal.small",
        rect: { x: 0, y: 445, w: 178, h: 223 },
        pedestal: { x: 14, y: 616, w: 150, h: 58 },
        badge: { x: 28, y: 626, w: 142, h: 54 },
        hitRect: { x: 0, y: 430, w: 184, h: 250 },
      },
      {
        code: "gulu",
        label: "咕噜",
        assetId: "dino.gulu",
        badgeId: "label.badge.gulu",
        pedestalId: "panel.home.pedestal.small",
        rect: { x: 214, y: 445, w: 174, h: 222 },
        pedestal: { x: 224, y: 616, w: 150, h: 58 },
        badge: { x: 228, y: 626, w: 142, h: 54 },
        hitRect: { x: 206, y: 430, w: 184, h: 250 },
      },
    ];
  }

  enter() {
    this.buttons = [
      new GameButton({
        id: "music",
        assetId: "icon.music",
        rect: HOME_LAYOUT.music,
        onTap: () => this.game.toast.show("音乐准备好啦"),
      }),
      ...this.dinos.map((dino) => this.dinoButton(dino)),
    ];
  }

  dinoButton(dino) {
    return new GameButton({
      id: `dino.${dino.code}`,
      assetId: dino.assetId,
      text: dino.label,
      rect: dino.hitRect || dino.rect,
      onTap: () => {
        this.game.state.selectedDino = dino.code;
        this.game.storage.set("selectedDino", dino.code);
        this.game.toast.show(`选择了 ${dino.label}`);
        this.game.go("story");
      },
    });
  }

  render(ctx) {
    this.renderBase(ctx, { sky: "#49c7f8", ground: "#9ee565" });

    drawSprite(ctx, this.game.resources, "panel.home.title", HOME_LAYOUT.logo);
    this.buttons[0].render(ctx, this.game.resources);
    drawSprite(ctx, this.game.resources, "label.home.guide", HOME_LAYOUT.guide);
    drawSprite(ctx, this.game.resources, "icon.decor.pathStones", HOME_LAYOUT.pathStones);
    drawSprite(ctx, this.game.resources, "icon.decor.pawprints", HOME_LAYOUT.pawprints);

    this.dinos.forEach((dino) => {
      drawSprite(ctx, this.game.resources, dino.pedestalId, dino.pedestal);
    });
    this.dinos.forEach((dino) => {
      drawSprite(ctx, this.game.resources, dino.assetId, dino.rect);
    });
    this.dinos.forEach((dino) => {
      drawSprite(ctx, this.game.resources, dino.badgeId, dino.badge);
    });
  }
}

module.exports = { HomeScene };