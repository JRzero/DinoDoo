const { BaseScene } = require("./base-scene");
const { GameButton } = require("../ui/button");
const { drawSprite, drawText } = require("../core/renderer");

class HatchScene extends BaseScene {
  constructor(game) {
    super(game, "hatch");
    this.prompt = "蓝色 会唱歌";
    this.status = "描述你想要的小恐龙";
    this.eggState = "idle";
    this.chips = [
      { id: "blue", label: "蓝色", assetId: "label.hatch.chip.blue", x: 52 },
      { id: "sing", label: "会唱歌", assetId: "label.hatch.chip.sing", x: 140 },
      { id: "horn", label: "长角", assetId: "label.hatch.chip.horn", x: 244 },
    ];
  }

  enter() {
    this.game.bottomNav.setActive("hatch");
    this.buttons = [
      ...this.chips.map((chip) => this.chip(chip)),
      new GameButton({
        id: "voice",
        assetId: "icon.hatch.voice",
        rect: { x: 52, y: 612, w: 78, h: 48 },
        onTap: () => {
          const recording = this.game.recorder.toggle();
          this.status = recording ? "录音中" : "已听到描述";
          this.eggState = recording ? "cracking" : "idle";
        },
      }),
      new GameButton({
        id: "image",
        assetId: "icon.hatch.image",
        rect: { x: 260, y: 612, w: 78, h: 48 },
        onTap: async () => {
          await this.game.media.chooseImage();
          this.status = "已选择图片";
          this.eggState = "cracking";
        },
      }),
      new GameButton({
        id: "hatch",
        assetId: "button.hatch.primary",
        rect: { x: 114, y: 608, w: 162, h: 54 },
        onTap: () => this.hatch(),
      }),
    ];
  }

  chip(chip) {
    return new GameButton({
      id: `chip.${chip.id}`,
      assetId: chip.assetId,
      text: chip.label,
      rect: { x: chip.x, y: 552, w: 86, h: 42 },
      onTap: () => {
        if (!this.prompt.includes(chip.label)) {
          this.prompt = `${this.prompt} ${chip.label}`.trim();
        }
        this.status = `加上：${chip.label}`;
        this.eggState = "cracking";
      },
    });
  }

  hatch() {
    const record = {
      id: `hatch_${Date.now()}`,
      title: "新小恐龙",
      description: this.prompt,
      dino: this.game.state.selectedDino,
    };
    this.game.state.works = [record, ...this.game.state.works].slice(0, 12);
    this.game.storage.set("works", this.game.state.works);
    this.status = "孵化成功";
    this.eggState = "success";
    this.game.toast.show("小恐龙出生啦");
  }

  eggAssetId() {
    return ({
      idle: "egg.hatch.idle",
      cracking: "egg.hatch.cracking",
      success: "egg.hatch.success",
    })[this.eggState] || "egg.hatch.idle";
  }

  statusAssetId() {
    return ({
      录音中: "label.hatch.status.recording",
      已选择图片: "label.hatch.status.imageSelected",
      孵化成功: "label.hatch.status.success",
    })[this.status] || (this.eggState === "cracking" ? "label.hatch.status.loading" : "");
  }

  render(ctx) {
    this.renderBase(ctx, { sky: "#68cef8", ground: "#9be05f" });
    drawSprite(ctx, this.game.resources, this.eggAssetId(), { x: 85, y: 124, w: 220, h: 254 });
    drawSprite(ctx, this.game.resources, "panel.hatch.input", { x: 35, y: 500, w: 320, h: 154 });
    drawText(ctx, this.prompt, this.game.viewport.width / 2, 528, {
      color: "#75471f",
      font: "bold 17px sans-serif",
      maxWidth: 250,
      maxLines: 1,
    });
    const statusAssetId = this.statusAssetId();
    if (statusAssetId) {
      drawSprite(ctx, this.game.resources, statusAssetId, { x: 85, y: 444, w: 220, h: 44 });
    } else {
      drawText(ctx, this.status, this.game.viewport.width / 2, 472, {
        color: "#5f8f27",
        font: "bold 13px sans-serif",
        maxWidth: 250,
        maxLines: 1,
      });
    }
    this.buttons.forEach((button) => button.render(ctx, this.game.resources));
  }
}

module.exports = { HatchScene };