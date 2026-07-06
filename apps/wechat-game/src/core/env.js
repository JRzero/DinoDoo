function getWx() {
  if (typeof wx !== "undefined") {
    return wx;
  }
  return null;
}

function createCanvas() {
  const wxApi = getWx();
  if (wxApi && wxApi.createCanvas) {
    return wxApi.createCanvas();
  }

  return {
    width: 390,
    height: 844,
    getContext() {
      return createNoopContext();
    },
  };
}

function getSystemInfo() {
  const wxApi = getWx();
  if (wxApi && wxApi.getSystemInfoSync) {
    return wxApi.getSystemInfoSync();
  }
  return { windowWidth: 390, windowHeight: 844, pixelRatio: 1 };
}

function createImage() {
  const wxApi = getWx();
  if (wxApi && wxApi.createImage) {
    return wxApi.createImage();
  }
  return null;
}

function onTouchStart(handler) {
  const wxApi = getWx();
  if (wxApi && wxApi.onTouchStart) {
    wxApi.onTouchStart(handler);
  }
}

function requestFrame(handler) {
  const wxApi = getWx();
  if (wxApi && wxApi.requestAnimationFrame) {
    return wxApi.requestAnimationFrame(handler);
  }
  return setTimeout(() => handler(Date.now()), 16);
}

function createNoopContext() {
  const noop = () => {};
  return {
    save: noop,
    restore: noop,
    scale: noop,
    translate: noop,
    clearRect: noop,
    fillRect: noop,
    strokeRect: noop,
    drawImage: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    closePath: noop,
    fill: noop,
    stroke: noop,
    arc: noop,
    fillText: noop,
    measureText: (text) => ({ width: String(text).length * 14 }),
    set fillStyle(value) {},
    set strokeStyle(value) {},
    set font(value) {},
    set textAlign(value) {},
    set lineWidth(value) {},
  };
}

module.exports = {
  createCanvas,
  createImage,
  getSystemInfo,
  getWx,
  onTouchStart,
  requestFrame,
};
