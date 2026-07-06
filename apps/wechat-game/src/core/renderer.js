function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

function drawBackground(ctx, resources, id, rect, fallback) {
  const image = resources.getImage(id);
  if (image) {
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    return;
  }
  drawCleanBackgroundFallback(ctx, rect, fallback);
}

function drawSprite(ctx, resources, id, rect, fallback) {
  const image = resources.getImage(id);
  if (image) {
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    return;
  }
  drawFallbackSprite(ctx, rect, fallback);
}

function drawCleanBackgroundFallback(ctx, rect, options = {}) {
  const sky = options.sky || "#68cdf7";
  const ground = options.ground || "#8fd75e";
  ctx.save();
  ctx.fillStyle = sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = ground;
  ctx.fillRect(rect.x, rect.y + rect.h * 0.58, rect.w, rect.h * 0.42);
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  roundedRect(ctx, rect.x + rect.w * 0.08, rect.y + 70, 92, 34, 18);
  ctx.fill();
  roundedRect(ctx, rect.x + rect.w * 0.62, rect.y + 128, 118, 38, 20);
  ctx.fill();
  ctx.restore();
}

function drawFallbackSprite(ctx, rect, options = {}) {
  ctx.save();
  ctx.fillStyle = options.fill || "rgba(255, 238, 178, 0.92)";
  roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, options.radius || 16);
  ctx.fill();
  if (options.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.lineWidth || 3;
    ctx.stroke();
  }
  if (options.text) {
    ctx.fillStyle = options.textColor || "#74421c";
    ctx.font = options.font || "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(options.text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 6);
  }
  ctx.restore();
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.save();
  ctx.fillStyle = options.color || "#68421f";
  ctx.font = options.font || "bold 18px sans-serif";
  ctx.textAlign = options.align || "center";
  wrapText(ctx, text, x, y, options.maxWidth || 260, options.lineHeight || 24, options.maxLines || 2);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(String(text));
  let line = "";
  let count = 0;
  chars.forEach((char) => {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      if (count < maxLines) {
        ctx.fillText(line, x, y + count * lineHeight);
      }
      count += 1;
      line = char;
      return;
    }
    line = next;
  });
  if (line && count < maxLines) {
    ctx.fillText(line, x, y + count * lineHeight);
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

module.exports = {
  clear,
  drawBackground,
  drawSprite,
  drawText,
  roundedRect,
};
