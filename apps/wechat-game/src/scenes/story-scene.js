const { BaseScene } = require("./base-scene");
const { GameButton } = require("../ui/button");
const { drawSprite, drawText } = require("../core/renderer");

class StoryScene extends BaseScene {
  constructor(game) {
    super(game, "story");
    this.line = "阿呆发现一条会发光的小路，要不要一起去看看？";
  }

  enter() {
    this.buttons = [
      new GameButton({
        id: "home",
        assetId: "panel.story.title",
        rect: { x: 50, y: 38, w: 290, h: 92 },
        onTap: () => this.game.go("home"),
      }),
      new GameButton({
        id: "choice.a",
        assetId: "button.story.choiceA",
        rect: { x: 49, y: 560, w: 132, h: 50 },
        onTap: () => this.pick("小路亮起来啦，我们继续前进！"),
      }),
      new GameButton({
        id: "choice.b",
        assetId: "button.story.choiceB",
        rect: { x: 210, y: 560, w: 134, h: 50 },
        onTap: () => this.pick("远处传来温柔的咕噜声。"),
      }),
      new GameButton({
        id: "voice",
        assetId: "button.story.voice",
        rect: { x: 44, y: 472, w: 188, h: 66 },
        onTap: () => {
          const recording = this.game.recorder.toggle();
          this.game.toast.show(recording ? "恐龙在听你说" : "听完啦");
        },
      }),
    ];
  }

  pick(text) {
    this.line = text;
    this.game.toast.show(text);
  }

  render(ctx) {
    this.renderBase(ctx, { sky: "#6ecdf5", ground: "#91dc60" });
    drawSprite(ctx, this.game.resources, "panel.story.title", { x: 50, y: 38, w: 290, h: 92 });
    drawSprite(ctx, this.game.resources, "panel.story.bubble", { x: 36, y: 178, w: 180, h: 120 });
    drawSprite(ctx, this.game.resources, `dino.${this.game.state.selectedDino}`, { x: 150, y: 157, w: 190, h: 296 });
    drawText(ctx, this.line, 126, 218, {
      color: "#72451f",
      font: "bold 14px sans-serif",
      maxWidth: 128,
      maxLines: 3,
    });
    this.buttons.slice(1).forEach((button) => button.render(ctx, this.game.resources));
  }
}

module.exports = { StoryScene };