const state = {
  session: null,
  settings: null,
  themes: [],
  dinos: [],
  hatchedDinos: [],
  artifacts: [],
  selectedDino: "xiaobao",
  activeText: "",
  route: "home",
  eggState: "idle",
  parentSaved: false,
};

const $ = (id) => document.getElementById(id);
const GE = "/assets/game-elements";

const copy = {
  dinos: {
    xiaobao: "\u5c0f\u66b4",
    adai: "\u963f\u5446",
    gulu: "\u5495\u565c",
  },
  intro: "\u9009\u4e00\u53ea\u6050\u9f99\uff0c\u6545\u4e8b\u5c31\u5f00\u59cb\u5566\u3002",
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
  bgHome: `${GE}/backgrounds/home-clean.png`,
  bgStory: `${GE}/backgrounds/story-clean.png`,
  bgHatch: `${GE}/backgrounds/hatch-clean.png`,
  bgWorks: `${GE}/backgrounds/works-clean.png`,
  bgParent: `${GE}/backgrounds/parent-clean.png`,
  homeLogo: `${GE}/home/home-logo.png`,
  homeMusic: `${GE}/home/music-button.png`,
  homeGuide: `${GE}/home/home-guide-text.png`,
  homePath: `${GE}/home/path-stones.png`,
  homePaws: `${GE}/home/pawprints.png`,
  pedestalLarge: `${GE}/home/pedestal-large.png`,
  pedestalSmall: `${GE}/home/pedestal-small.png`,
  dinoXiaobao: `${GE}/home/dino-xiaobao.png`,
  dinoAdai: `${GE}/home/dino-adai.png`,
  dinoGulu: `${GE}/home/dino-gulu.png`,
  badgeXiaobao: `${GE}/home/badge-xiaobao.png`,
  badgeAdai: `${GE}/home/badge-adai.png`,
  badgeGulu: `${GE}/home/badge-gulu.png`,
  navBg: `${GE}/nav/nav-bg.png`,
  navWorks: `${GE}/nav/nav-works.png`,
  navHatch: `${GE}/nav/nav-hatch.png`,
  navParent: `${GE}/nav/nav-parent.png`,
  navLabelWorks: `${GE}/nav/nav-label-works.png`,
  navLabelHatch: `${GE}/nav/nav-label-hatch.png`,
  navLabelParent: `${GE}/nav/nav-label-parent.png`,
  storyTitle: `${GE}/story/story-title.png`,
  storyBubble: `${GE}/story/story-bubble.png`,
  storyVoice: `${GE}/story/story-voice.png`,
  storyChoiceA: `${GE}/story/story-choice-a.png`,
  storyChoiceB: `${GE}/story/story-choice-b.png`,
  hatchEggIdle: `${GE}/hatch/egg-idle.png`,
  hatchEggCracking: `${GE}/hatch/egg-cracking.png`,
  hatchEggSuccess: `${GE}/hatch/egg-success.png`,
  hatchInputPanel: `${GE}/hatch/hatch-input-panel.png`,
  hatchChipBlue: `${GE}/hatch/chip-blue.png`,
  hatchChipSing: `${GE}/hatch/chip-sing.png`,
  hatchChipHorn: `${GE}/hatch/chip-horn.png`,
  hatchButtonVoice: `${GE}/hatch/button-voice.png`,
  hatchButtonImage: `${GE}/hatch/button-image.png`,
  hatchButtonStart: `${GE}/hatch/button-start-hatch.png`,
  hatchStatusLoading: `${GE}/hatch/status-loading.png`,
  hatchStatusSuccess: `${GE}/hatch/status-success.png`,
  worksTitle: `${GE}/works/works-title.png`,
  worksBoard: `${GE}/works/works-board.png`,
  worksEmpty: `${GE}/works/works-empty-panel.png`,
  worksCardFeatured: `${GE}/works/work-card-featured.png`,
  worksCardNormal: `${GE}/works/work-card-normal.png`,
  worksRibbonFeatured: `${GE}/works/ribbon-featured.png`,
  worksMetaDate: `${GE}/works/meta-date.png`,
  worksMetaPaw: `${GE}/works/meta-paw.png`,
  worksMetaCrown: `${GE}/works/meta-crown.png`,
  worksMetaHeart: `${GE}/works/meta-heart.png`,
  worksMetaLeaf: `${GE}/works/meta-leaf.png`,
  worksRefresh: `${GE}/works/button-refresh-works.png`,
  parentTitle: `${GE}/parent/parent-title.png`,
  parentBoard: `${GE}/parent/parent-board.png`,
  parentRowSound: `${GE}/parent/row-sound.png`,
  parentRowImage: `${GE}/parent/row-image.png`,
  parentRowMusic: `${GE}/parent/row-music.png`,
  parentToggleOn: `${GE}/parent/toggle-on.png`,
  parentToggleOff: `${GE}/parent/toggle-off.png`,
  parentSlider: `${GE}/parent/slider.png`,
  parentTime30: `${GE}/parent/time-label-30.png`,
  parentThemeIsland: `${GE}/parent/chip-island.png`,
  parentThemeForest: `${GE}/parent/chip-forest.png`,
  parentThemeSnow: `${GE}/parent/chip-snow.png`,
  parentThemeDesert: `${GE}/parent/chip-desert.png`,
  parentVoicePermission: `${GE}/parent/button-voice-permission.png`,
  parentImagePermission: `${GE}/parent/button-image-permission.png`,
  parentSave: `${GE}/parent/button-save-settings.png`,
  parentToastSaved: `${GE}/parent/toast-saved.png`,
};

const demoWorks = [
  { id: "demo-xiaobao", name: copy.dinos.xiaobao, prompt: "\u7231\u5192\u9669\u7684\u5c0f\u66b4\u9f99" },
  { id: "demo-adai", name: copy.dinos.adai, prompt: "\u7231\u5531\u6b4c\u7684\u5c0f\u6050\u9f99" },
  { id: "demo-gulu", name: copy.dinos.gulu, prompt: "\u60a0\u95f2\u7684\u5c0f\u8155\u9f99" },
];
const screenRoutes = {
  home: ["", "homeScreen"],
  story: ["", "playScreen"],
  hatch: ["hatchTab", "hatchScreen"],
  works: ["galleryTab", "galleryScreen"],
  parent: ["parentTab", "parentScreen"],
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
    if (!res.ok) throw new Error(await errorText(res));
    return res.json();
  },
  async put(path, body) {
    const res = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(await errorText(res));
    return res.json();
  },
};

function errorText(res) {
  return res.text().catch(() => res.statusText || "request failed");
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
  navImg("navWorks", { x: 43, y: 22, w: 60, h: 58 });
  navImg("navHatch", { x: 152, y: 8, w: 86, h: 96 });
  navImg("navParent", { x: 295, y: 22, w: 68, h: 58 });
  navImg("navLabelWorks", { x: 37, y: 108, w: 88, h: 38 });
  navImg("navLabelHatch", { x: 151, y: 108, w: 88, h: 38 });
  navImg("navLabelParent", { x: 296, y: 108, w: 88, h: 38 });
}

function drawHomeScene() {
  img("bgHome", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("homeLogo", { x: 20, y: 30, w: 350, h: 145 });
  img("homeMusic", { x: 335, y: 34, w: 54, h: 54 });
  img("homeGuide", { x: 45, y: 198, w: 300, h: 36 });
  img("homePath", { x: 116, y: 474, w: 160, h: 120 });
  img("homePaws", { x: 170, y: 468, w: 120, h: 80 });
  img("pedestalLarge", { x: 112, y: 389, w: 170, h: 64 });
  img("pedestalSmall", { x: 14, y: 616, w: 150, h: 58 });
  img("pedestalSmall", { x: 224, y: 616, w: 150, h: 58 });
  img("dinoXiaobao", { x: 112, y: 245, w: 170, h: 188 });
  img("dinoAdai", { x: 0, y: 445, w: 178, h: 223 });
  img("dinoGulu", { x: 214, y: 445, w: 174, h: 222 });
  img("badgeXiaobao", { x: 124, y: 430, w: 142, h: 54 });
  img("badgeAdai", { x: 28, y: 626, w: 142, h: 54 });
  img("badgeGulu", { x: 228, y: 626, w: 142, h: 54 });
}

function drawStoryScene() {
  img("bgStory", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("storyTitle", { x: 50, y: 38, w: 290, h: 92 });
  img("storyBubble", { x: 36, y: 178, w: 180, h: 120 });
  img(dinoKey(state.selectedDino), { x: 150, y: 157, w: 190, h: 296 });
  drawWrappedText(state.activeText || copy.intro, 126, 218, 128, 20, 3, { font: "bold 14px sans-serif", color: "#72451f" });
  img("storyVoice", { x: 44, y: 472, w: 188, h: 66 });
  img("storyChoiceA", { x: 49, y: 560, w: 132, h: 50 });
  img("storyChoiceB", { x: 210, y: 560, w: 134, h: 50 });
}

function drawHatchScene() {
  img("bgHatch", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img(eggKey(), { x: 65, y: 108, w: 260, h: 300 });
  img(statusKey(), { x: 85, y: 488, w: 220, h: 44 });
  img("hatchInputPanel", { x: 35, y: 542, w: 320, h: 160 });
  img("hatchChipBlue", { x: 52, y: 575, w: 86, h: 42 });
  img("hatchChipSing", { x: 140, y: 575, w: 86, h: 42 });
  img("hatchChipHorn", { x: 244, y: 575, w: 86, h: 42 });
  img("hatchButtonVoice", { x: 52, y: 628, w: 78, h: 48 });
  img("hatchButtonImage", { x: 260, y: 628, w: 78, h: 48 });
  img("hatchButtonStart", { x: 114, y: 626, w: 162, h: 52 });
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
  drawWorkText(featured, 82, 384, 210);
  img("worksMetaCrown", { x: 136, y: 392, w: 26, h: 26 });
  img("worksMetaDate", { x: 238, y: 412, w: 76, h: 26 });
  img("worksMetaPaw", { x: 294, y: 392, w: 30, h: 30 });
  [
    { x: 55, y: 486, icon: "worksMetaHeart", item: works[1] },
    { x: 200, y: 486, icon: "worksMetaLeaf", item: works[2] },
  ].forEach((slot) => {
    img("worksCardNormal", { x: slot.x, y: slot.y, w: 135, h: 190 });
    if (slot.item) {
      drawWorkText(slot.item, slot.x + 14, slot.y + 92, 96);
      img(slot.icon, { x: slot.x + 72, y: slot.y + 116, w: 26, h: 26 });
    } else {
      drawWrappedText("\u65b0\u5b75\u5316", slot.x + 63, slot.y + 102, 100, 18, 1, { font: "bold 14px sans-serif", color: "#8a673c" });
    }
  });
}

function drawWorkText(item, x, y, maxWidth) {
  drawWrappedText(item.name || item.title || copy.newDino, x, y, maxWidth, 22, 1, { align: "left", font: "bold 17px sans-serif", color: "#74421c" });
  drawWrappedText(item.prompt || item.description || copy.hatchDefault, x, y + 24, maxWidth, 18, 1, { align: "left", font: "bold 12px sans-serif", color: "#8a673c" });
}

function drawParentScene() {
  img("bgParent", { x: 0, y: 0, w: 390, h: 684 }, { className: "scene-bg" });
  img("parentTitle", { x: 50, y: 128, w: 290, h: 92 });
  img("parentBoard", { x: 38, y: 216, w: 314, h: 468 });
  img("parentRowSound", { x: 55, y: 250, w: 280, h: 72 });
  img("parentRowImage", { x: 55, y: 330, w: 280, h: 72 });
  img("parentRowMusic", { x: 55, y: 410, w: 280, h: 72 });
  img(toggleKey("voiceEnabled"), { x: 248, y: 266, w: 72, h: 40 });
  img(toggleKey("imageEnabled"), { x: 248, y: 346, w: 72, h: 40 });
  img(toggleKey("musicEnabled"), { x: 248, y: 426, w: 72, h: 40 });
  img("parentSlider", { x: 78, y: 462, w: 190, h: 36 });
  img("parentTime30", { x: 268, y: 460, w: 70, h: 40 });
  img("parentThemeIsland", { x: 70, y: 502, w: 58, h: 34 });
  img("parentThemeForest", { x: 132, y: 502, w: 58, h: 34 });
  img("parentThemeSnow", { x: 194, y: 502, w: 58, h: 34 });
  img("parentThemeDesert", { x: 256, y: 502, w: 58, h: 34 });
  img("parentVoicePermission", { x: 52, y: 546, w: 140, h: 50 });
  img("parentImagePermission", { x: 198, y: 546, w: 140, h: 50 });
  img("parentSave", { x: 82, y: 600, w: 225, h: 58 });
  if (state.parentSaved) img("parentToastSaved", { x: 115, y: 548, w: 160, h: 44 });
}

function dinoKey(id) {
  return ({ xiaobao: "dinoXiaobao", adai: "dinoAdai", gulu: "dinoGulu" })[id] || "dinoXiaobao";
}

function eggKey() {
  return ({ idle: "hatchEggIdle", cracking: "hatchEggCracking", success: "hatchEggSuccess" })[state.eggState] || "hatchEggIdle";
}

function statusKey() {
  return state.eggState === "success" ? "hatchStatusSuccess" : "hatchStatusLoading";
}

function toggleKey(settingKey) {
  return state.settings?.[settingKey] === false ? "parentToggleOff" : "parentToggleOn";
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  if (!stage.scene) return;
  const align = options.align || "center";
  const el = document.createElement("p");
  el.className = "scene-text";
  el.textContent = String(text || "");
  el.style.left = `${align === "left" ? x : x - maxWidth / 2}px`;
  el.style.top = `${y - lineHeight}px`;
  el.style.width = `${maxWidth}px`;
  el.style.maxHeight = `${lineHeight * maxLines}px`;
  el.style.lineHeight = `${lineHeight}px`;
  el.style.font = options.font || "bold 18px sans-serif";
  el.style.color = options.color || "#68421f";
  el.style.textAlign = align;
  el.style.webkitLineClamp = String(maxLines);
  stage.scene.appendChild(el);
}

async function loadSession() {
  try {
    state.session = await api.post("/api/v1/play-sessions", { theme: "adventure", dino: state.selectedDino });
  } catch {
    state.session = { id: "local-session" };
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
    const raw = item.prompt_json ? JSON.parse(item.prompt_json) : null;
    prompt = raw?.text || raw?.prompt || "";
  } catch {
    prompt = "";
  }
  return { id: item.id, name: item.title || copy.newDino, prompt: prompt || item.type || copy.hatchDefault };
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

function chooseDino(id) {
  state.selectedDino = id;
  $("speakerName").textContent = copy.dinos[id] || copy.dinos.xiaobao;
  $("dinoLine").textContent = copy.intro;
  state.activeText = copy.intro;
  setAction(`home:dino:${id}`);
  routeTo("story");
}

function updateStoryLine(text, action) {
  state.activeText = text;
  $("dinoLine").textContent = text;
  setAction(action);
  drawStage();
}

function speakCurrentLine() {
  setAction("story:replay");
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance($("dinoLine").textContent || copy.intro);
  utterance.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function captureVoice(targetInput) {
  setAction(targetInput ? "hatch:voice" : "story:voice");
  state.eggState = targetInput ? "cracking" : state.eggState;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (targetInput) {
      targetInput.value = copy.hatchDefault;
      updateHatchInputState();
    } else {
      updateStoryLine(copy.voiceFallback, "story:voice");
    }
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = "zh-CN";
  rec.interimResults = false;
  rec.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (targetInput) {
      targetInput.value = text;
      updateHatchInputState();
    } else {
      updateStoryLine(text, "story:voice");
    }
  };
  rec.start();
  drawStage();
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
  state.eggState = "cracking";
  updateHatchInputState();
  setAction(`hatch:chip:${value}`);
}

function hatchDino() {
  const input = $("hatchPrompt");
  const prompt = input.value.trim() || copy.hatchDefault;
  const item = { id: `local-${Date.now()}`, name: copy.newDino, prompt, createdAt: new Date().toISOString() };
  state.hatchedDinos.unshift(item);
  state.eggState = "success";
  saveLocalHatched();
  $("hatchStatus").textContent = copy.hatchReady;
  input.value = "";
  updateHatchInputState();
  setAction("hatch:submit");
  loadArtifacts({ showBackend: false });
  routeTo("works");
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
  $("choiceA").addEventListener("click", () => updateStoryLine(copy.storyA, "story:choice-a"));
  $("choiceB").addEventListener("click", () => updateStoryLine(copy.storyB, "story:choice-b"));
  $("speakButton").addEventListener("click", speakCurrentLine);
  $("micButton").addEventListener("click", () => captureVoice(null));
  $("finishButton").addEventListener("click", () => { setAction("story:finish"); routeTo("works"); });
  $("textForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("textInput").value.trim();
    if (text) updateStoryLine(text, "story:text");
  });
  $("hatchMicButton").addEventListener("click", () => captureVoice($("hatchPrompt")));
  $("hatchPrompt").addEventListener("input", updateHatchInputState);
  document.querySelectorAll("[data-hatch-chip]").forEach((button) => button.addEventListener("click", () => addChip(button.dataset.hatchChip)));
  $("hatchForm").addEventListener("submit", (event) => { event.preventDefault(); hatchDino(); });
  $("refreshArtifacts").addEventListener("click", () => { setAction("works:refresh"); loadArtifacts({ showBackend: true }); });
  $("galleryTab").addEventListener("click", () => routeTo("works"));
  $("hatchTab").addEventListener("click", () => routeTo("hatch"));
  $("parentTab").addEventListener("click", () => routeTo("parent"));
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
  await loadArtifacts({ showBackend: false });
  applyRouteFromHash();
}

init().catch((error) => {
  console.error(error);
  document.body.dataset.route = "error";
});