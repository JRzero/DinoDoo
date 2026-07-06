const { drawText, roundedRect } = require("../core/renderer");

class Toast {
  constructor() {
    this.message = "";
    this.until = 0;
  }

  show(message, duration = 1600) {
    this.message = message;
    this.until = Date.now() + duration;
  }

  render(ctx, viewport) {
    if (!this.message || Date.now() > this.until) {
      return;
    }
    const width = Math.min(280, viewport.width - 48);
    const rect = {
      x: (viewport.width - width) / 2,
      y: viewport.height * 0.12,
      w: width,
      h: 52,
    };
    ctx.save();
    ctx.fillStyle = "rgba(92, 54, 22, 0.86)";
    roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 22);
    ctx.fill();
    drawText(ctx, this.message, viewport.width / 2, rect.y + 32, {
      color: "#fff8d6",
      font: "bold 17px sans-serif",
      maxWidth: width - 26,
      maxLines: 1,
    });
    ctx.restore();
  }
}

module.exports = { Toast };
