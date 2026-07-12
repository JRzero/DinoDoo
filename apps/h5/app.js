const state = {
  session: null,
  settings: null,
  themes: [],
  dinos: [],
  hatchedDinos: [],
  artifacts: [],
  selectedDino: "xiaobao",
  activeText: "",
  storyChoices: ["走近一点看看发光的恐龙蛋", "请阿呆陪我们一起去森林深处", "先安静听听树叶后面的声音"],
  storyLoading: false,
  route: "home",
  eggState: "idle",
  hatchStatus: "idle",
  hatchStatusTimer: null,
  hatchImageName: "",
  hatchImageFile: null,
  parentSaved: false,
};

const $ = (id) => document.getElementById(id);
const GE = "/assets/game-elements";
const ACTIVE = `${GE}/runtime-current`;

const copy = {
  dinos: {
    xiaobao: "\u5c0f\u66b4",
    adai: "\u963f\u5446",
    gulu: "\u5495\u565c",
  },
  intro: "\u9009\u4e00\u53ea\u6050\u9f99\uff0c\u51fa\u53d1\u5427\uff01",
  storyA: "\u5b83\u5728\u7011\u5e03\u8fb9\u627e\u5230\u4e00\u679a\u95ea\u5149\u811a\u5370\u3002",
  storyB: "\u8fdc\u5904\u4f20\u6765\u6e29\u67d4\u7684\u5495\u565c\u58f0\u3002",
  voiceFallback: "\u6211\u60f3\u542c\u4e00\u4e2a\u52c7\u6562\u7684\u5c0f\u6545\u4e8b\u3002",
  hatchDefault: "\u84dd\u8272 \u4f1a\u5531\u6b4c",
  hatchReady: "\u5b75\u5316\u6210\u529f",
  saved: "\u5df2\u4fdd\u5b58",
  newDino: "\u65b0\u5c0f\u6050\u9f99",
  noWorks: "\u53bb\u5b75\u5316\u4e00\u53ea\u5c0f\u6050\u9f99\u5427",
};

const assetSources = {
  bgHomeV2: `${ACTIVE}/bgHomeV2.png`,
  bgStory: `${ACTIVE}/bgStory.png`,
  bgHatch: `${ACTIVE}/bgHatch.png`,
  bgWorks: `${ACTIVE}/bgWorks.png`,
  bgParent: `${ACTIVE}/bgParent.png`,
  homeLogo: `${ACTIVE}/homeLogo.png`,
  homeMusic: `${ACTIVE}/homeMusic.png`,
  dinoXiaobao: `${ACTIVE}/dinoXiaobao.png`,
  dinoAdai: `${ACTIVE}/dinoAdai.png`,
  dinoGulu: `${ACTIVE}/dinoGulu.png`,
  homeV2DinoXiaobao: `${ACTIVE}/homeV2DinoXiaobao.png`,
  homeV2DinoAdai: `${ACTIVE}/homeV2DinoAdai.png`,
  homeV2DinoGulu: `${ACTIVE}/homeV2DinoGulu.png`,
  homeV2PedestalCenter: `${ACTIVE}/homeV2PedestalCenter.png`,
  homeV2PedestalLeft: `${ACTIVE}/homeV2PedestalLeft.png`,
  homeV2PedestalRight: `${ACTIVE}/homeV2PedestalRight.png`,
  homeV2BadgeOrange: `${ACTIVE}/homeV2BadgeOrange.png`,
  homeV2BadgeCoral: `${ACTIVE}/homeV2BadgeCoral.png`,
  homeV2BadgeTeal: `${ACTIVE}/homeV2BadgeTeal.png`,
  navBg: `${ACTIVE}/navBg.png`,
  navHome: `${ACTIVE}/navHome.png?v=20260712-child-nav-v1`,
  navWorks: `${ACTIVE}/navWorks.png`,
  navHatch: `${ACTIVE}/navHatch.png`,
  storyTitle: `${ACTIVE}/storyTitle.png`,
  storyBubble: `${ACTIVE}/storyBubble.png`,
  storyVoice: `${ACTIVE}/storyVoice.png`,
  storyChoiceA: `${ACTIVE}/storyChoiceA.png`,
  storyChoiceB: `${ACTIVE}/storyChoiceB.png`,
  hatchSubtitlePlaque: `${ACTIVE}/hatchSubtitlePlaque.png`,
  hatchLogo: `${ACTIVE}/hatchLogo.png`,
  hatchMusic: `${ACTIVE}/hatchMusic.png`,
  hatchEggIdle: `${ACTIVE}/egg-source.png`,
  hatchEggCracking: `${ACTIVE}/hatchEggCracking.png?v=20260710-hatch-sequence`,
  hatchEggSuccess: `${ACTIVE}/hatchEggSuccess.png?v=20260710-hatch-sequence`,
  hatchControlPanel: `${ACTIVE}/hatchControlPanel.png`,
  hatchButtonVoice: `${ACTIVE}/hatchButtonVoice.png`,
  hatchButtonImage: `${ACTIVE}/hatchButtonImage.png`,
  hatchButtonStart: `${ACTIVE}/hatchButtonStart.png`,
  hatchStatusLoading: `${ACTIVE}/hatchStatusLoading.png`,
  hatchStatusRecording: `${ACTIVE}/hatchStatusRecording.png`,
  hatchStatusImageSelected: `${ACTIVE}/hatchStatusImageSelected.png`,
  hatchStatusSuccess: `${ACTIVE}/hatchStatusSuccess.png`,
  worksTitle: `${ACTIVE}/worksTitle.png`,
  worksBoard: `${ACTIVE}/worksBoard.png`,
  worksEmpty: `${ACTIVE}/worksEmpty.png`,
  worksCardFeatured: `${ACTIVE}/worksCardFeatured.png`,
  worksCardNormal: `${ACTIVE}/worksCardNormal.png`,
  worksRibbonFeatured: `${ACTIVE}/worksRibbonFeatured.png`,
  worksMetaDate: `${ACTIVE}/worksMetaDate.png`,
  worksMetaPaw: `${ACTIVE}/worksMetaPaw.png`,
  worksMetaCrown: `${ACTIVE}/worksMetaCrown.png`,
  worksMetaHeart: `${ACTIVE}/worksMetaHeart.png`,
  worksMetaLeaf: `${ACTIVE}/worksMetaLeaf.png`,
  worksRefresh: `${ACTIVE}/worksRefresh.png`,
  parentTitle: `${ACTIVE}/parentTitle.png`,
  parentBoard: `${ACTIVE}/parentBoard.png`,
  parentRowSound: `${ACTIVE}/parentRowSound.png`,
  parentRowImage: `${ACTIVE}/parentRowImage.png`,
  parentRowMusic: `${ACTIVE}/parentRowMusic.png`,
  parentToggleOn: `${ACTIVE}/parentToggleOn.png`,
  parentToggleOff: `${ACTIVE}/parentToggleOff.png`,
  parentSlider: `${ACTIVE}/parentSlider.png`,
  parentTime30: `${ACTIVE}/parentTime30.png`,
  parentThemeIsland: `${ACTIVE}/parentThemeIsland.png`,
  parentThemeForest: `${ACTIVE}/parentThemeForest.png`,
  parentThemeSnow: `${ACTIVE}/parentThemeSnow.png`,
  parentThemeDesert: `${ACTIVE}/parentThemeDesert.png`,
  parentVoicePermission: `${ACTIVE}/parentVoicePermission.png`,
  parentImagePermission: `${ACTIVE}/parentImagePermission.png`,
  parentSave: `${ACTIVE}/parentSave.png`,
  parentToastSaved: `${ACTIVE}/parentToastSaved.png`,
};

const demoWorks = [
  { id: "demo-xiaobao", name: copy.dinos.xiaobao, prompt: "\u7231\u5192\u9669\u7684\u5c0f\u66b4\u9f99" },
  { id: "demo-adai", name: copy.dinos.adai, prompt: "\u7231\u5531\u6b4c\u7684\u5c0f\u6050\u9f99" },
  { id: "demo-gulu", name: copy.dinos.gulu, prompt: "\u60a0\u95f2\u7684\u5c0f\u8155\u9f99" },
];
const screenRoutes = {
  home: ["homeTab", "homeScreen"],
  story: ["homeTab", "playScreen"],
  hatch: ["hatchTab", "hatchScreen"],
  works: ["worksTab", "galleryScreen"],
  parent: ["", "parentScreen"],
};

const stage = {
  scene: null,
  nav: null,
  ready: false,
};

const api = {
  async get(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(await errorText(res));
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw await apiError(res);
    return res.json();
  },
  async put(path, body) {
    const res = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw await apiError(res);
    return res.json();
  },
  async postForm(path, form) {
    const res = await fetch(path, { method: "POST", body: form });
    if (!res.ok) throw await apiError(res);
    return res.json();
  },
};

async function errorText(res) {
  try {
    const body = await res.json();
    return body?.error?.message || body?.message || res.statusText || "request failed";
  } catch {
    return res.statusText || "request failed";
  }
}

async function apiError(res) {
  const error = new Error(await errorText(res));
  error.status = res.status;
  return error;
}

function setAction(name) {
  document.body.dataset.lastAction = name;
}

function showScreen(route) {
  const entry = screenRoutes[route] || screenRoutes.home;
  state.route = route in screenRoutes ? route : "home";
  document.body.dataset.route = state.route;
  document.body.classList.remove("home-mode", "pixel-mode", "asset-mode");
  document.body.classList.add("asset-mode");
  document.body.classList.add(state.route === "home" ? "home-mode" : "pixel-mode");
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  $(entry[1])?.classList.add("active");
  document.querySelectorAll(".nav-button").forEach((el) => el.classList.remove("active"));
  if (entry[0]) $(entry[0])?.classList.add("active");
  drawStage();
}

function routeTo(route) {
  const hash = `#${route}`;
  if (window.location.hash !== hash) {
    window.location.hash = route;
    return;
  }
  showScreen(route);
}

function applyRouteFromHash() {
  const route = (window.location.hash || "#home").slice(1) || "home";
  showScreen(screenRoutes[route] ? route : "home");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

async function loadAssetImages() {
  await Promise.all(Object.values(assetSources).map(loadImage));
  stage.ready = true;
  document.body.dataset.imagesReady = "true";
  drawNavLayer();
  drawStage();
}

function applySlot(el, rect) {
  el.style.left = `${rect.x}px`;
  el.style.top = `${rect.y}px`;
  el.style.width = `${rect.w}px`;
  el.style.height = `${rect.h}px`;
}

function img(key, rect, options = {}) {
  const source = assetSources[key];
  if (!source || !stage.scene) return null;
  const el = document.createElement("img");
  el.className = ["scene-art", options.className].filter(Boolean).join(" ");
  el.dataset.asset = key;
  el.src = source;
  el.alt = "";
  el.draggable = false;
  applySlot(el, rect);
  if (options.zIndex) el.style.zIndex = String(options.zIndex);
  stage.scene.appendChild(el);
  return el;
}

function navImg(key, rect) {
  const source = assetSources[key];
  if (!source || !stage.nav) return null;
  const el = document.createElement("img");
  el.className = "nav-art-img";
  el.dataset.asset = key;
  el.src = source;
  el.alt = "";
  el.draggable = false;
  applySlot(el, rect);
  stage.nav.appendChild(el);
  return el;
}

function drawStage() {
  if (!stage.ready || !stage.scene) return;
  stage.scene.replaceChildren();
  if (state.route === "home") drawHomeScene();
  if (state.route === "story") drawStoryScene();
  if (state.route === "hatch") drawHatchScene();
  if (state.route === "works") drawWorksScene();
  if (state.route === "parent") drawParentScene();
}

function drawNavLayer() {
  if (!stage.ready || !stage.nav) return;
  stage.nav.replaceChildren();
  navImg("navBg", { x: 0, y: 0, w: 390, h: 160 });
  navImg("navHome", { x: 42, y: 32, w: 70, h: 70 });
  navImg("navHatch", { x: 160, y: 16, w: 70, h: 102 });
  navImg("navWorks", { x: 288, y: 48, w: 48, h: 51 });
}
function drawHomeScene() {
  img("bgHomeV2", { x: 0, y: 0, w: 390, h: 844 }, { className: "scene-bg" });
  img("homeLogo", { x: 50, y: 62, w: 290, h: 112 });
  img("homeMusic", { x: 334, y: 42, w: 52, h: 52 });
  img("hatchSubtitlePlaque", { x: 72, y: 174, w: 246, h: 56 });
  drawWrappedText(copy.intro, 195, 215, 218, 26, 1, {
    className: "home-guide-plaque-text",
    font: "900 16px Arial, Microsoft YaHei, sans-serif",
    color: "#fff7e6",
    textShadow: "0 2px 0 rgba(92, 52, 24, 0.58)"
  });

  img("homeV2PedestalCenter", { x: 120, y: 360, w: 150, h: 76 });
  img("homeV2DinoXiaobao", { x: 135, y: 250, w: 120, h: 145 });
  img("homeV2BadgeOrange", { x: 129, y: 416, w: 132, h: 56 });
  drawWrappedText(copy.dinos.xiaobao, 195, 453, 108, 30, 1, { className: "dino-name", font: "900 24px Arial, Microsoft YaHei, sans-serif", color: "#fff7dc" });

  img("homeV2PedestalLeft", { x: 27, y: 542, w: 126, h: 67 });
  img("homeV2DinoAdai", { x: 40, y: 458, w: 100, h: 115 });
  img("homeV2BadgeCoral", { x: 29, y: 606, w: 126, h: 54 });
  drawWrappedText(copy.dinos.adai, 92, 642, 100, 30, 1, { className: "dino-name", font: "900 24px Arial, Microsoft YaHei, sans-serif", color: "#fff7dc" });

  img("homeV2PedestalRight", { x: 237, y: 542, w: 126, h: 67 });
  img("homeV2DinoGulu", { x: 254, y: 457, w: 92, h: 115 });
  img("homeV2BadgeTeal", { x: 235, y: 606, w: 126, h: 54 });
  drawWrappedText(copy.dinos.gulu, 298, 642, 100, 30, 1, { className: "dino-name", font: "900 24px Arial, Microsoft YaHei, sans-serif", color: "#fff7dc" });
}

function drawStoryScene() {
  img("bgStory", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("hatchSubtitlePlaque", { x: 78, y: 34, w: 234, h: 74 });
  drawWrappedText("故事小路", 195, 84, 190, 28, 1, { className: "story-title-text", font: "900 22px Arial, Microsoft YaHei, sans-serif", color: "#fff7e6", textShadow: "0 2px 0 rgba(92, 52, 24, 0.58)" });
  img("storyBubble", { x: 18, y: 136, w: 354, h: 214 });
  img(dinoKey(state.selectedDino), { x: 300, y: 330, w: 62, h: 80 }, { className: "story-dino-art" });
  drawWrappedText(state.activeText || copy.intro, 42, 184, 300, 24, 7, {
    align: "left",
    className: "story-dialog-text",
    font: "800 16px Arial, Microsoft YaHei, sans-serif",
    color: "#5f391d"
  });
  if (state.storyLoading) {
    img("hatchSubtitlePlaque", { x: 108, y: 356, w: 174, h: 44 }, { className: "story-loading-plaque" });
    drawWrappedText("故事继续中...", 195, 386, 148, 20, 1, { className: "story-loading-text", font: "900 15px Arial, Microsoft YaHei, sans-serif", color: "#fff7e6", textShadow: "0 2px 0 rgba(92, 52, 24, 0.58)" });
  }

  const choices = normalizeStoryChoices(state.storyChoices);
  ["A", "B", "C"].forEach((suffix, index) => {
    const label = $("choice" + suffix + "Label");
    const button = $("choice" + suffix);
    if (label) label.textContent = choices[index];
    if (button) {
      button.setAttribute("aria-label", "选择：" + choices[index]);
      button.disabled = state.storyLoading;
    }
  });
}
function drawHatchScene() {
  img("bgHatch", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("hatchLogo", { x: 55, y: 28, w: 280, h: 108 });
  img("hatchMusic", { x: 333, y: 22, w: 44, h: 44 });
  img("hatchSubtitlePlaque", { x: 108, y: 140, w: 174, h: 55 });
  drawWrappedText("\u5b75\u5316\u5c0f\u6050\u9f99", 195, 181, 150, 26, 1, { className: "hatch-subtitle-text", font: "900 20px Arial, Microsoft YaHei, sans-serif", color: "#fff7e6", textShadow: "0 2px 0 rgba(92, 52, 24, 0.58)" });
  img(eggKey(), eggRect(), { className: hatchEggClass() });
  drawHatchStatusText();
  img("hatchControlPanel", { x: 25, y: 506, w: 340, h: 160 });
  img("hatchButtonVoice", { x: 44, y: 593, w: 64, h: 50 });
  img("hatchButtonStart", { x: 116, y: 591, w: 158, h: 54 });
  const hatchButtonLabel = state.hatchStatus === "warming" || state.hatchStatus === "loading"
    ? "\u5b75\u5316\u4e2d..."
    : state.hatchStatus === "success"
      ? "\u5b75\u5316\u6210\u529f"
      : "\u5f00\u59cb\u5b75\u5316";
  drawWrappedText(hatchButtonLabel, 195, 629, 132, 26, 1, { className: "hatch-primary-label", font: "900 19px Arial, Microsoft YaHei, sans-serif", color: "#fff7df", textShadow: "0 2px 0 rgba(74, 119, 20, 0.55)" });
  img("hatchButtonImage", { x: 282, y: 593, w: 64, h: 50 });
}

function drawHatchStatusText() {
  const text = ({
    warming: "\u6050\u9f99\u86cb\u5728\u53d1\u5149...",
    loading: "\u5494\u5693\uff01\u86cb\u58f3\u88c2\u5f00\u5566",
    success: "\u5c0f\u6050\u9f99\u51fa\u751f\u5566\uff01",
    recording: "\u6b63\u5728\u542c\u4f60\u8bf4...",
    imageSelected: "\u56fe\u7247\u51c6\u5907\u597d\u5566",
    error: "\u8bf7\u8c03\u6574\u4e00\u4e0b\u63cf\u8ff0",
  })[state.hatchStatus];
  if (!text) return;
  img("hatchSubtitlePlaque", { x: 100, y: 454, w: 190, h: 50 }, { className: "hatch-status-plaque" });
  drawWrappedText(text, 195, 488, 166, 20, 1, {
    className: "hatch-status-text",
    font: "900 15px Arial, Microsoft YaHei, sans-serif",
    color: "#fff7e6",
    textShadow: "0 2px 0 rgba(92, 52, 24, 0.58)"
  });
}

function drawWorksScene() {
  img("bgWorks", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("worksTitle", { x: 50, y: 128, w: 290, h: 92 });
  img("worksBoard", { x: 40, y: 216, w: 310, h: 468 });
  const works = state.artifacts.length ? state.artifacts : (state.hatchedDinos.length ? state.hatchedDinos : demoWorks);
  if (!works.length) {
    img("worksEmpty", { x: 70, y: 330, w: 250, h: 150 });
    drawWrappedText(copy.noWorks, 195, 416, 210, 20, 1, { font: "bold 15px sans-serif", color: "#8a673c" });
  } else {
    drawWorksCards(works.slice(0, 3));
  }
  img("worksRefresh", { x: 126, y: 636, w: 138, h: 48 });
}

function drawWorksCards(works) {
  const featured = works[0] || {};
  img("worksCardFeatured", { x: 55, y: 246, w: 280, h: 220 });
  img("worksRibbonFeatured", { x: 62, y: 250, w: 120, h: 42 });
  img(workDinoKey(featured, 0), { x: 142, y: 272, w: 112, h: 116 });
  drawWorkText(featured, 82, 402, 172, "featured");
  img("worksMetaCrown", { x: 132, y: 384, w: 24, h: 24 });
  img("worksMetaDate", { x: 236, y: 418, w: 76, h: 26 });
  img("worksMetaPaw", { x: 298, y: 384, w: 28, h: 28 });
  [
    { x: 55, y: 486, icon: "worksMetaHeart", item: works[1], index: 1 },
    { x: 200, y: 486, icon: "worksMetaLeaf", item: works[2], index: 2 },
  ].forEach((slot) => {
    img("worksCardNormal", { x: slot.x, y: slot.y, w: 135, h: 190 });
    if (slot.item) {
      img(workDinoKey(slot.item, slot.index), { x: slot.x + 44, y: slot.y + 18, w: 58, h: 70 });
      drawWorkText(slot.item, slot.x + 14, slot.y + 128, 94, "compact");
      img(slot.icon, { x: slot.x + 96, y: slot.y + 126, w: 24, h: 24 });
    } else {
      drawWrappedText("\u65b0\u5b75\u5316", slot.x + 63, slot.y + 128, 100, 18, 1, { font: "bold 14px sans-serif", color: "#8a673c" });
    }
  });
}

function workDinoKey(item, index) {
  const text = `${item?.id || ""} ${item?.name || ""} ${item?.title || ""} ${item?.prompt || ""}`;
  if (text.includes("adai") || text.includes(copy.dinos.adai)) return "dinoAdai";
  if (text.includes("gulu") || text.includes(copy.dinos.gulu)) return "dinoGulu";
  return ["dinoXiaobao", "dinoAdai", "dinoGulu"][index % 3] || "dinoXiaobao";
}

function drawWorkText(item, x, y, maxWidth, density = "normal") {
  const titleFont = density === "compact" ? "bold 14px sans-serif" : "bold 16px sans-serif";
  const promptFont = density === "compact" ? "bold 10px sans-serif" : "bold 12px sans-serif";
  const titleLine = density === "compact" ? 18 : 20;
  const promptLine = density === "compact" ? 15 : 17;
  drawWrappedText(item.name || item.title || copy.newDino, x, y, maxWidth, titleLine, 1, { align: "left", font: titleFont, color: "#74421c" });
  drawWrappedText(item.prompt || item.description || copy.hatchDefault, x, y + titleLine + 2, maxWidth, promptLine, 1, { align: "left", font: promptFont, color: "#8a673c" });
}

function drawParentScene() {
  img("bgParent", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("parentTitle", { x: 50, y: 128, w: 290, h: 92 });
  img("parentBoard", { x: 38, y: 216, w: 314, h: 468 });
  img("parentRowSound", { x: 55, y: 244, w: 280, h: 72 });
  img("parentRowImage", { x: 55, y: 324, w: 280, h: 72 });
  img("parentRowMusic", { x: 55, y: 404, w: 280, h: 72 });
  img(toggleKey("voiceEnabled"), { x: 248, y: 260, w: 72, h: 40 });
  img(toggleKey("imageEnabled"), { x: 248, y: 340, w: 72, h: 40 });
  img(toggleKey("musicEnabled"), { x: 248, y: 420, w: 72, h: 40 });
  img("parentSlider", { x: 68, y: 484, w: 190, h: 36 });
  img("parentTime30", { x: 268, y: 482, w: 70, h: 40 });
  img("parentThemeIsland", { x: 70, y: 522, w: 58, h: 34 });
  img("parentThemeForest", { x: 132, y: 522, w: 58, h: 34 });
  img("parentThemeSnow", { x: 194, y: 522, w: 58, h: 34 });
  img("parentThemeDesert", { x: 256, y: 522, w: 58, h: 34 });
  img("parentVoicePermission", { x: 52, y: 558, w: 140, h: 50 });
  img("parentImagePermission", { x: 198, y: 558, w: 140, h: 50 });
  img("parentSave", { x: 82, y: 616, w: 225, h: 58 });
  if (state.parentSaved) img("parentToastSaved", { x: 115, y: 558, w: 160, h: 44 });
}

function dinoKey(id) {
  return ({ xiaobao: "dinoXiaobao", adai: "dinoAdai", gulu: "dinoGulu" })[id] || "dinoXiaobao";
}

function eggKey() {
  return ({ idle: "hatchEggIdle", cracking: "hatchEggCracking", success: "hatchEggSuccess" })[state.eggState] || "hatchEggIdle";
}

function eggRect() {
  return state.eggState === "idle"
    ? { x: 50, y: 192, w: 290, h: 362 }
    : { x: 65, y: 202, w: 260, h: 300 };
}

function hatchEggClass() {
  if (state.hatchStatus === "warming") return "hatch-egg hatch-egg-warming";
  if (state.eggState === "cracking") return "hatch-egg hatch-egg-cracking";
  if (state.eggState === "success") return "hatch-egg hatch-egg-success";
  return "hatch-egg";
}

function statusKey() {
  if (state.hatchStatus === "success" || state.eggState === "success") return "hatchStatusSuccess";
  if (state.hatchStatus === "recording") return "hatchStatusRecording";
  if (state.hatchStatus === "imageSelected") return "hatchStatusImageSelected";
  if (state.hatchStatus === "warming" || state.hatchStatus === "loading" || state.eggState === "cracking") return "hatchStatusLoading";
  return null;
}

function toggleKey(settingKey) {
  return state.settings?.[settingKey] === false ? "parentToggleOff" : "parentToggleOn";
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  if (!stage.scene) return;
  const align = options.align || "center";
  const el = document.createElement("p");
  el.className = ["scene-text", options.className].filter(Boolean).join(" ");
  el.textContent = String(text || "");
  el.style.left = `${align === "left" ? x : x - maxWidth / 2}px`;
  el.style.top = `${y - lineHeight}px`;
  el.style.width = `${maxWidth}px`;
  el.style.maxHeight = `${lineHeight * maxLines}px`;
  el.style.lineHeight = `${lineHeight}px`;
  el.style.font = options.font || "bold 18px sans-serif";
  el.style.color = options.color || "#68421f";
  el.style.textAlign = align;
  if (options.textShadow) el.style.textShadow = options.textShadow;
  el.style.webkitLineClamp = String(maxLines);
  stage.scene.appendChild(el);
}

const fallbackStoryChoices = ["走近一点看看发光的恐龙蛋", "请阿呆陪我们一起去森林深处", "先安静听听树叶后面的声音"];

function normalizeStoryChoices(choices) {
  const result = Array.isArray(choices)
    ? choices.map((choice) => String(choice || "").trim()).filter(Boolean).slice(0, 3)
    : [];
  for (const fallback of fallbackStoryChoices) {
    if (result.length >= 3) break;
    if (!result.includes(fallback)) result.push(fallback);
  }
  return result.slice(0, 3);
}

function applyStorySession(session, turn = null) {
  state.session = session || state.session;
  const latestTurn = turn || session?.turns?.[session.turns.length - 1];
  state.activeText = latestTurn?.text || state.activeText || copy.intro;
  state.storyChoices = normalizeStoryChoices(latestTurn?.choices || session?.state?.choices);
  state.storyLoading = false;
  if (latestTurn?.speaker) $("speakerName").textContent = latestTurn.speaker;
  $("dinoLine").textContent = state.activeText;
  drawStage();
}

async function loadSession() {
  state.storyLoading = true;
  try {
    const session = await api.post("/api/v1/play-sessions", { theme: "adventure", dino: state.selectedDino });
    applyStorySession(session);
  } catch {
    state.session = { id: "local-session" };
    state.storyChoices = normalizeStoryChoices();
    state.storyLoading = false;
  }
}

async function loadDinos() {
  try {
    const data = await api.get("/api/v1/dinos");
    state.dinos = Array.isArray(data.dinos) ? data.dinos : [];
  } catch {
    state.dinos = [
      { code: "xiaobao", name: copy.dinos.xiaobao },
      { code: "adai", name: copy.dinos.adai },
      { code: "gulu", name: copy.dinos.gulu },
    ];
  }
}

async function loadSettings() {
  try {
    const data = await api.get("/api/v1/parent/settings");
    state.themes = Array.isArray(data.enabled_themes) ? data.enabled_themes : [];
    state.settings = normalizeSettings(data);
  } catch {
    state.themes = ["island", "forest", "snow", "desert"];
    state.settings = { voiceEnabled: true, imageEnabled: true, musicEnabled: false, dailyLimitMinutes: 30, theme: "island" };
  }
  renderSettings();
}

function normalizeSettings(data) {
  return {
    voiceEnabled: data.voice_enabled !== false,
    imageEnabled: data.image_generation_enabled !== false,
    musicEnabled: data.music_enabled === true,
    dailyLimitMinutes: data.daily_minutes_limit || 30,
    theme: data.enabled_themes?.[0] || data.theme || "island",
  };
}

function denormalizeSettings() {
  return {
    daily_minutes_limit: Number($("dailyLimit").value) || 30,
    enabled_themes: [$("themeSelect").value || "island"],
    voice_enabled: $("safetyToggle").checked,
    image_generation_enabled: $("imageToggle").checked,
    music_enabled: $("voiceToggle").checked,
    save_audio_enabled: false,
    memory_enabled: false,
  };
}

function loadLocalHatched() {
  try {
    state.hatchedDinos = JSON.parse(localStorage.getItem("dinodoo_hatched_dinos") || "[]");
  } catch {
    state.hatchedDinos = [];
  }
}

function saveLocalHatched() {
  localStorage.setItem("dinodoo_hatched_dinos", JSON.stringify(state.hatchedDinos.slice(0, 8)));
}

async function loadArtifacts(options = {}) {
  let list = [];
  try {
    const data = await api.get("/api/v1/artifacts");
    list = Array.isArray(data.artifacts) ? data.artifacts.map(normalizeArtifact) : [];
  } catch {
    list = [];
  }
  const backendItems = options.showBackend ? list : [];
  state.artifacts = [...state.hatchedDinos, ...backendItems];
  renderArtifacts();
}

function normalizeArtifact(item) {
  let prompt = "";
  try {
    const raw = typeof item.prompt_json === "string" ? JSON.parse(item.prompt_json) : item.prompt_json;
    prompt = raw?.text || raw?.prompt || raw?.safe_prompt || "";
  } catch {
    prompt = "";
  }
  return {
    id: item.id,
    name: item.title || copy.newDino,
    prompt: prompt || item.type || copy.hatchDefault,
    image: item.url || "",
    provider: item.provider || "",
    createdAt: item.created_at || "",
    offline: false,
  };
}

function renderSettings() {
  const select = $("themeSelect");
  select.innerHTML = "";
  (state.themes.length ? state.themes : ["island", "forest", "snow", "desert"]).forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme;
    select.appendChild(option);
  });
  select.value = state.settings.theme || select.options[0]?.value || "island";
  $("dailyLimit").value = state.settings.dailyLimitMinutes || 30;
  $("safetyToggle").checked = state.settings.voiceEnabled !== false;
  $("voiceToggle").checked = state.settings.musicEnabled !== false;
  $("imageToggle").checked = state.settings.imageEnabled !== false;
  drawStage();
}

function renderArtifacts() {
  const list = $("artifactList");
  if (list) list.textContent = state.artifacts.map((item) => item.name || copy.newDino).join("\n");
  drawStage();
}

async function chooseDino(id) {
  state.selectedDino = id;
  $("speakerName").textContent = copy.dinos[id] || copy.dinos.xiaobao;
  state.activeText = copy.intro;
  state.storyChoices = normalizeStoryChoices();
  state.storyLoading = true;
  $("dinoLine").textContent = state.activeText;
  setAction("home:dino:" + id);
  routeTo("story");
  try {
    const session = await api.post("/api/v1/play-sessions", { theme: "adventure", dino: id });
    applyStorySession(session);
    setAction("story:session:" + id);
  } catch {
    state.session = { id: "local-session" };
    state.storyLoading = false;
    drawStage();
  }
}

function updateStoryLine(text, action) {
  state.activeText = text;
  $("dinoLine").textContent = text;
  setAction(action);
  drawStage();
}

function setStoryChoicesDisabled(disabled) {
  state.storyLoading = disabled;
  ["choiceA", "choiceB", "choiceC"].forEach((id) => {
    const button = $(id);
    if (button) button.disabled = disabled;
  });
  drawStage();
}
async function submitStoryInput(text, action, source = "choice") {
  const input = String(text || "").trim();
  if (!input) return;
  setAction(action);
  if (state.session?.id && state.session.id !== "local-session") {
    setStoryChoicesDisabled(true);
    try {
      const data = await api.post("/api/v1/play-sessions/" + state.session.id + "/turns", { input, source });
      applyStorySession(data.session, data.turn);
      setAction(action + ":backend");
      return;
    } catch {
      setAction(action + ":offline");
    } finally {
      setStoryChoicesDisabled(false);
    }
  }
  const localLines = [copy.storyA, copy.storyB, "小恐龙发现了三颗亮晶晶的脚印。"];
  const index = Math.max(0, state.storyChoices.indexOf(input));
  state.storyChoices = normalizeStoryChoices([
    ["走彩虹桥", "去小河边", "问问阿呆"][index % 3],
    ["找亮亮星", "数一数", "唱一首歌"][index % 3],
    ["轻轻敲门", "叫咕噜", "看小脚印"][index % 3],
  ]);
  updateStoryLine(localLines[index % localLines.length], action);
}

function submitStoryChoice(index) {
  const choices = normalizeStoryChoices(state.storyChoices);
  return submitStoryInput(choices[index], "story:choice-" + (index + 1), "choice");
}


function clearHatchStatusTimer() {
  if (state.hatchStatusTimer) {
    window.clearTimeout(state.hatchStatusTimer);
    state.hatchStatusTimer = null;
  }
}

function setHatchStatus(status, message = "") {
  clearHatchStatusTimer();
  state.hatchStatus = status;
  document.body.dataset.hatchPhase = status;
  $("hatchStatus").textContent = message;
  drawStage();
}

function setHatchControlsDisabled(disabled) {
  ["hatchButton", "hatchMicButton", "hatchImageButton", "hatchPrompt"].forEach((id) => {
    const control = $(id);
    if (control) control.disabled = disabled;
  });
}

function setTransientHatchStatus(status, message = "", duration = 1200) {
  setHatchStatus(status, message);
  if (!duration) return;
  state.hatchStatusTimer = window.setTimeout(() => {
    if (state.hatchStatus === status) {
      state.hatchStatus = "idle";
      $("hatchStatus").textContent = "";
      drawStage();
    }
  }, duration);
}

function captureHatchVoice(targetInput) {
  setAction("hatch:voice");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const text = window.prompt("\u8bf4\u8bf4\u4f60\u60f3\u8981\u7684\u5c0f\u6050\u9f99...", targetInput.value.trim());
    if (text) {
      targetInput.value = text.trim();
      updateHatchInputState();
    }
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = "zh-CN";
  rec.interimResults = false;
  rec.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (text) {
      const current = targetInput.value.trim();
      targetInput.value = current ? `${current} ${text}` : text;
      updateHatchInputState();
    }
  };
  rec.onerror = () => setTransientHatchStatus("idle", "", 0);
  rec.onend = () => {
    if (state.hatchStatus === "recording") setTransientHatchStatus("idle", "", 0);
  };
  setHatchStatus("recording", "\u6b63\u5728\u542c\u4f60\u8bf4...");
  rec.start();
}

function updateHatchInputState() {
  const input = $("hatchPrompt");
  input.classList.toggle("has-value", Boolean(input.value.trim()));
  drawStage();
}

function addChip(value) {
  const input = $("hatchPrompt");
  const current = input.value.trim();
  input.value = current ? `${current} ${value}` : value;
  updateHatchInputState();
  setAction(`hatch:chip:${value}`);
}

function selectHatchImage() {
  setAction("hatch:image");
  const picker = $("hatchImageInput");
  if (!picker) return;
  picker.value = "";
  picker.click();
}

function handleHatchImageSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.hatchImageName = file.name;
  state.hatchImageFile = file;
  setTransientHatchStatus("imageSelected", "\u5df2\u9009\u62e9\u56fe\u7247", 1200);
}

function hatchRequestId() {
  if (window.crypto?.randomUUID) return `hatch-${window.crypto.randomUUID()}`;
  return `hatch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function requestHatchArtifact(prompt, imageFile, idempotencyKey) {
  let data;
  if (imageFile) {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("idempotency_key", idempotencyKey);
    form.append("image", imageFile, imageFile.name);
    data = await api.postForm("/api/v1/hatches", form);
  } else {
    data = await api.post("/api/v1/hatches", {
      prompt,
      idempotency_key: idempotencyKey,
    });
  }
  if (!data?.artifact) throw new Error("孵化服务没有返回作品");
  return normalizeArtifact(data.artifact);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function backendUnavailable(error) {
  return !error?.status || [404, 502, 503, 504].includes(error.status);
}

async function hatchDino() {
  if (state.hatchStatus === "warming" || state.hatchStatus === "loading" || state.hatchStatus === "success") return;
  const input = $("hatchPrompt");
  const prompt = input.value.trim() || copy.hatchDefault;
  const imageFile = state.hatchImageFile;
  const imageName = state.hatchImageName;
  const idempotencyKey = hatchRequestId();
  const requestOutcome = requestHatchArtifact(prompt, imageFile, idempotencyKey)
    .then((item) => ({ item, error: null }))
    .catch((error) => ({ item: null, error }));

  state.eggState = "idle";
  setHatchControlsDisabled(true);
  setHatchStatus("warming", "\u6050\u9f99\u86cb\u6b63\u5728\u53d1\u5149...");
  setAction("hatch:submit");

  await wait(800);
  state.eggState = "cracking";
  setHatchStatus("loading", "\u5494\u5693\uff01\u86cb\u58f3\u88c2\u5f00\u5566\uff01");
  await wait(1500);

  const outcome = await requestOutcome;
  let item = outcome.item;
  if (outcome.error && !backendUnavailable(outcome.error)) {
    state.eggState = "idle";
    setHatchControlsDisabled(false);
    setAction(`hatch:error:${outcome.error.status || "unknown"}`);
    $("hatchStatus").title = outcome.error.message || "";
    setTransientHatchStatus("error", "\u8bf7\u8c03\u6574\u4e00\u4e0b\u63cf\u8ff0", 2400);
    return;
  }

  if (!item) {
    item = {
      id: `local-${Date.now()}`,
      name: copy.newDino,
      prompt,
      image: imageName,
      provider: "offline",
      offline: true,
      createdAt: new Date().toISOString(),
    };
    state.hatchedDinos.unshift(item);
    saveLocalHatched();
    setAction("hatch:offline-fallback");
  } else {
    setAction("hatch:backend-success");
  }

  state.eggState = "success";
  input.value = "";
  state.hatchImageName = "";
  state.hatchImageFile = null;
  updateHatchInputState();
  await loadArtifacts({ showBackend: true });
  setHatchStatus("success", "\u5c0f\u6050\u9f99\u51fa\u751f\u5566\uff01");

  await wait(1800);
  routeTo("works");
  state.eggState = "idle";
  state.hatchStatus = "idle";
  document.body.dataset.hatchPhase = "idle";
  setHatchControlsDisabled(false);
  state.hatchStatusTimer = null;
}

function saveSettings() {
  state.settings = {
    theme: $("themeSelect").value,
    dailyLimitMinutes: Number($("dailyLimit").value) || 30,
    voiceEnabled: $("safetyToggle").checked,
    musicEnabled: $("voiceToggle").checked,
    imageEnabled: $("imageToggle").checked,
  };
  state.parentSaved = true;
  $("settingsStatus").textContent = copy.saved;
  setAction("parent:save");
  drawStage();
  api.put("/api/v1/parent/settings", denormalizeSettings()).catch(() => null);
}

function bindEvents() {
  document.querySelectorAll(".dino-choice").forEach((button) => button.addEventListener("click", () => chooseDino(button.dataset.dino)));
  $("musicButton").addEventListener("click", () => setAction("home:music"));
  $("homeButton").addEventListener("click", () => { setAction("story:home"); routeTo("home"); });
  $("choiceA").addEventListener("click", () => submitStoryChoice(0));
  $("choiceB").addEventListener("click", () => submitStoryChoice(1));
  $("choiceC").addEventListener("click", () => submitStoryChoice(2));
  $("hatchMicButton").addEventListener("click", () => captureHatchVoice($("hatchPrompt")));
  $("hatchImageButton").addEventListener("click", selectHatchImage);
  $("hatchImageInput").addEventListener("change", handleHatchImageSelected);
  $("hatchPrompt").addEventListener("input", updateHatchInputState);
  $("hatchPrompt").addEventListener("keydown", (event) => { if (event.key === "Enter") event.preventDefault(); });
  document.querySelectorAll("[data-hatch-chip]").forEach((button) => button.addEventListener("click", () => addChip(button.dataset.hatchChip)));
  $("hatchButton").addEventListener("click", hatchDino);
  $("hatchForm").addEventListener("submit", (event) => event.preventDefault());
  $("refreshArtifacts").addEventListener("click", () => { setAction("works:refresh"); loadArtifacts({ showBackend: true }); });
  $("homeTab").addEventListener("click", () => routeTo("home"));
  $("hatchTab").addEventListener("click", () => routeTo("hatch"));
  $("worksTab").addEventListener("click", () => routeTo("works"));
  $("saveSettings").addEventListener("click", saveSettings);
  ["themeSelect", "dailyLimit", "safetyToggle", "voiceToggle", "imageToggle"].forEach((id) => {
    $(id).addEventListener("change", () => {
      state.parentSaved = false;
      state.settings = {
        ...(state.settings || {}),
        theme: $("themeSelect").value,
        dailyLimitMinutes: Number($("dailyLimit").value) || 30,
        voiceEnabled: $("safetyToggle").checked,
        musicEnabled: $("voiceToggle").checked,
        imageEnabled: $("imageToggle").checked,
      };
      drawStage();
    });
  });
  window.addEventListener("hashchange", applyRouteFromHash);
}

async function init() {
  stage.scene = $("sceneLayer");
  stage.nav = $("navLayer");
  document.body.classList.add("home-mode", "asset-mode");
  bindEvents();
  loadLocalHatched();
  await Promise.all([loadSession(), loadDinos(), loadSettings(), loadAssetImages()]);
  await loadArtifacts({ showBackend: true });
  applyRouteFromHash();
}

init().catch((error) => {
  console.error(error);
  document.body.dataset.route = "error";
});
