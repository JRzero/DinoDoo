const { drawSprite, drawText } = require("../core/renderer");

class GameButton {
  constructor(options) {
    this.id = options.id;
    this.rect = options.rect;
    this.assetId = options.assetId;
    this.text = options.text || "";
    this.iconId = options.iconId || "";
    this.onTap = options.onTap || (() => {});
    this.style = options.style || {};
  }

  contains(point) {
    return (
      point.x >= this.rect.x &&
      point.x <= this.rect.x + this.rect.w &&
      point.y >= this.rect.y &&
      point.y <= this.rect.y + this.rect.h
    );
  }

  tap(point) {
    if (!this.contains(point)) {
      return false;
    }
    this.onTap(this.id);
    return true;
  }

  render(ctx, resources) {
    drawSprite(ctx, resources, this.assetId, this.rect, {
      fill: this.style.fill || "#f7a12d",
      stroke: this.style.stroke || "#fff3bf",
      text: this.iconId ? "" : this.text,
      radius: this.style.radius || 18,
    });

    if (!this.iconId && this.style.showText) {
      drawText(ctx, this.text, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h / 2 + 6, {
        color: this.style.textColor || "#6f471f",
        font: this.style.font || "bold 16px sans-serif",
        maxWidth: this.rect.w - 12,
        maxLines: 1,
      });
    }

    if (this.iconId) {
      const iconSize = Math.min(this.rect.w, this.rect.h) * 0.58;
      drawSprite(
        ctx,
        resources,
        this.iconId,
        {
          x: this.rect.x + (this.rect.w - iconSize) / 2,
          y: this.rect.y + 12,
          w: iconSize,
          h: iconSize,
        },
        { fill: this.style.iconFill || "#89c83f", radius: 12 },
      );
      drawText(ctx, this.text, this.rect.x + this.rect.w / 2, this.rect.y + this.rect.h - 22, {
        color: this.style.textColor || "#6f471f",
        font: "bold 18px sans-serif",
        maxWidth: this.rect.w - 12,
        maxLines: 1,
      });
    }
  }
}

module.exports = { GameButton };