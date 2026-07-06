const state = {
  session: null,
  settings: null,
  themes: [],
  dinos: [],
  hatchedDinos: [],
  artifacts: [],
  selectedDino: null,
  activeText: "",
  recognizing: false,
  route: "home",
};

const $ = (id) => document.getElementById(id);
const label = (value) => value;

const dinoAssets = {
  xiaobao: "/assets/xiaobao.png",
  adai: "/assets/adai-cutout.png",
  gulu: "/assets/gulu.png",
};

const copy = {
  dinos: {
    xiaobao: "\u5c0f\u66b4",
    adai: "\u963f\u5446",
    gulu: "\u5495\u565c",
  },
  intro: "\u9009\u4e00\u53ea\u6050\u9f99\uff0c\u6545\u4e8b\u5c31\u5f00\u59cb\u5566\u3002",
  storyA: "\u5b83\u5728\u7011\u5e03\u8fb9\u627e\u5230\u4e00\u679a\u95ea\u5149\u811a\u5370\u3002",
  storyB: "\u5b83\u542c\u89c1\u68ee\u6797\u91cc\u4f20\u6765\u8f7b\u8f7b\u7684\u6b4c\u58f0\u3002",
  voiceFallback: "\u6211\u60f3\u542c\u4e00\u4e2a\u52c7\u6562\u7684\u5c0f\u6545\u4e8b\u3002",
  hatchPlaceholder: "\u8bf4\u8bf4\u4f60\u60f3\u8981\u7684\u5c0f\u6050\u9f99...",
  hatchDefault: "\u84dd\u8272 \u4f1a\u5531\u6b4c",
  hatchReady: "\u5c0f\u6050\u9f99\u5df2\u5b75\u5316\uff01",
  saved: "\u5df2\u4fdd\u5b58",
  newDino: "\u65b0\u5c0f\u6050\u9f99",
  noWorks: "\u8fd8\u6ca1\u6709\u65b0\u4f5c\u54c1\uff0c\u5148\u53bb\u5b75\u5316\u4e00\u53ea\u5427\u3002",
};

const canvasSources = {
  homeTop: "/assets/components/home-bg-top.png",
  homeMid: "/assets/components/home-bg-mid.png",
  homeLower: "/assets/components/home-bg-lower.png",
  storyTop: "/assets/components/story-bg-top.png",
  storyMid: "/assets/components/story-bg-mid.png",
  storyLower: "/assets/components/story-bg-lower.png",
  hatchTop: "/assets/components/hatch-bg-top.png",
  hatchMid: "/assets/components/hatch-bg-mid.png",
  hatchLower: "/assets/components/hatch-bg-lower.png",
  worksTop: "/assets/components/works-bg-top.png",
  worksMid: "/assets/components/works-bg-mid.png",
  worksLower: "/assets/components/works-bg-lower.png",
  parentTop: "/assets/components/parent-bg-top.png",
  parentMid: "/assets/components/parent-bg-mid.png",
  parentLower: "/assets/components/parent-bg-lower.png",
  nav: "/assets/nav-strip.png",
};

const sceneLayerMap = {
  home: ["homeTop", "homeMid", "homeLower"],
  story: ["storyTop", "storyMid", "storyLower"],
  hatch: ["hatchTop", "hatchMid", "hatchLower"],
  works: ["worksTop", "worksMid", "worksLower"],
  parent: ["parentTop", "parentMid", "parentLower"],
};

const sceneSlots = [
  [0, 0, 390, 230],
  [0, 230, 390, 224],
  [0, 454, 390, 230],
];

const screenRoutes = {
  home: ["", "homeScreen"],
  story: ["", "playScreen"],
  hatch: ["hatchTab", "hatchScreen"],
  works: ["galleryTab", "galleryScreen"],
  parent: ["parentTab", "parentScreen"],
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

const canvasStage = {
  scene: null,
  sceneCtx: null,
  nav: null,
  navCtx: null,
  assets: {},
  ready: false,
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
  document.body.classList.remove("home-mode", "pixel-mode", "canvas-mode");
  document.body.classList.add("canvas-mode");
  document.body.classList.add(state.route === "home" ? "home-mode" : "pixel-mode");

  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  $(entry[1])?.classList.add("active");
  document.querySelectorAll(".nav-button").forEach((el) => el.classList.remove("active"));
  if (entry[0]) $(entry[0])?.classList.add("active");
  drawStage();
}

function routeTo(route, options = {}) {
  const hash = `#${route}`;
  if (!options.silent && window.location.hash !== hash) {
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

async function loadCanvasAssets() {
  const entries = Object.entries(canvasSources);
  const loaded = await Promise.all(entries.map(async ([key, src]) => [key, await loadImage(src)]));
  canvasStage.assets = Object.fromEntries(loaded);
  canvasStage.ready = true;
  document.body.dataset.imagesReady = "true";
  drawNavCanvas();
  drawStage();
}

function clearScene() {
  canvasStage.sceneCtx.clearRect(0, 0, 390, 684);
}

function drawStage() {
  if (!canvasStage.ready || !canvasStage.sceneCtx) return;
  clearScene();
  const layers = sceneLayerMap[state.route] || sceneLayerMap.home;
  layers.forEach((key, index) => {
    const img = canvasStage.assets[key];
    const [x, y, w, h] = sceneSlots[index];
    if (img) canvasStage.sceneCtx.drawImage(img, x, y, w, h);
  });
  drawDynamicLayer();
}

function drawNavCanvas() {
  if (!canvasStage.ready || !canvasStage.navCtx) return;
  canvasStage.navCtx.clearRect(0, 0, 390, 160);
  const nav = canvasStage.assets.nav;
  if (nav) canvasStage.navCtx.drawImage(nav, 0, 0, 390, 160);
}

function drawDynamicLayer() {
  const ctx = canvasStage.sceneCtx;
  if (!ctx) return;
  if (state.route === "hatch") drawHatchPrompt(ctx);
  if (state.route === "works") drawWorksPreview(ctx);
  if (state.route === "parent") drawParentState(ctx);
}

function drawHatchPrompt(ctx) {
  const prompt = $("hatchPrompt")?.value?.trim();
  if (!prompt) return;
  ctx.save();
  ctx.fillStyle = "rgba(255, 249, 225, 0.86)";
  roundRect(ctx, 76, 546, 238, 42, 20);
  ctx.fill();
  ctx.fillStyle = "#73502a";
  ctx.font = "700 16px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(prompt.slice(0, 16), 195, 567);
  ctx.restore();
}

function drawWorksPreview(ctx) {
  if (!state.hatchedDinos.length) return;
  const latest = state.hatchedDinos[0];
  ctx.save();
  ctx.fillStyle = "rgba(255, 246, 220, 0.82)";
  roundRect(ctx, 86, 306, 220, 58, 14);
  ctx.fill();
  ctx.fillStyle = "#6b421e";
  ctx.font = "800 16px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(latest.name || copy.newDino, 106, 329);
  ctx.font = "700 12px Arial, sans-serif";
  ctx.fillText(latest.prompt || copy.hatchDefault, 106, 350);
  ctx.restore();
}

function drawParentState(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 246, 220, 0.8)";
  roundRect(ctx, 118, 410, 154, 34, 17);
  ctx.fill();
  ctx.fillStyle = "#6b421e";
  ctx.font = "800 15px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${state.settings?.dailyLimitMinutes || 30} min`, 195, 431);

  const toggles = [
    ["safetyToggle", 290, 274],
    ["voiceToggle", 290, 362],
    ["imageToggle", 290, 449],
  ];
  toggles.forEach(([id, x, y]) => {
    const checked = $(id)?.checked;
    ctx.fillStyle = checked ? "rgba(110, 206, 58, 0.95)" : "rgba(173, 133, 82, 0.75)";
    roundRect(ctx, x - 31, y - 14, 62, 28, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 250, 232, 0.95)";
    ctx.beginPath();
    ctx.arc(checked ? x + 16 : x - 16, y, 11, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function loadSession() {
  try {
    state.session = await api.post("/api/sessions", { childName: "Dino" });
  } catch {
    state.session = { id: "local-session" };
  }
}

async function loadDinos() {
  try {
    const data = await api.get("/api/dinos");
    state.dinos = Array.isArray(data.items) ? data.items : [];
  } catch {
    state.dinos = [
      { id: "xiaobao", name: copy.dinos.xiaobao, voiceTone: "bright" },
      { id: "adai", name: copy.dinos.adai, voiceTone: "gentle" },
      { id: "gulu", name: copy.dinos.gulu, voiceTone: "calm" },
    ];
  }
  state.selectedDino = state.dinos[0] || { id: "xiaobao", name: copy.dinos.xiaobao };
}

async function loadSettings() {
  try {
    state.settings = await api.get("/api/parent/settings");
    state.themes = Array.isArray(state.settings.themes) ? state.settings.themes : [];
  } catch {
    state.themes = ["island", "forest", "snow", "desert"];
    state.settings = {
      voiceEnabled: true,
      imageEnabled: true,
      musicEnabled: true,
      dailyLimitMinutes: 30,
      theme: "island",
    };
  }
  renderSettings();
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
    const data = await api.get("/api/artifacts");
    list = Array.isArray(data.items) ? data.items : [];
  } catch {
    list = [];
  }
  const backendItems = options.showBackend ? list : [];
  state.artifacts = [...state.hatchedDinos, ...backendItems];
  renderArtifacts();
}

function renderSettings() {
  const select = $("themeSelect");
  select.innerHTML = "";
  state.themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme;
    select.appendChild(option);
  });
  select.value = state.settings.theme || state.themes[0] || "island";
  $("dailyLimit").value = state.settings.dailyLimitMinutes || 30;
  $("safetyToggle").checked = state.settings.voiceEnabled !== false;
  $("voiceToggle").checked = state.settings.musicEnabled !== false;
  $("imageToggle").checked = state.settings.imageEnabled !== false;
  drawStage();
}

function renderArtifacts() {
  const list = $("artifactList");
  if (!list) return;
  if (!state.artifacts.length) {
    list.textContent = copy.noWorks;
    drawStage();
    return;
  }
  list.textContent = state.artifacts
    .slice(0, 3)
    .map((item) => `${item.name || copy.newDino} ${item.prompt || item.description || copy.hatchDefault}`)
    .join("\n");
  drawStage();
}

function chooseDino(id) {
  state.selectedDino = state.dinos.find((item) => item.id === id) || { id, name: copy.dinos[id] || copy.dinos.xiaobao };
  $("speakerName").textContent = state.selectedDino.name;
  $("dinoLine").textContent = copy.intro;
  $("dinoImage").src = dinoAssets[id] || dinoAssets.xiaobao;
  setAction(`home:dino:${id}`);
  routeTo("story");
}

function updateStoryLine(text, action) {
  state.activeText = text;
  $("dinoLine").textContent = text;
  setAction(action);
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

function hatchDino() {
  const input = $("hatchPrompt");
  const prompt = input.value.trim() || copy.hatchDefault;
  const item = {
    id: `local-${Date.now()}`,
    name: copy.newDino,
    prompt,
    createdAt: new Date().toISOString(),
  };
  state.hatchedDinos.unshift(item);
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
  $("settingsStatus").textContent = copy.saved;
  setAction("parent:save");
  drawStage();
  api.put("/api/parent/settings", state.settings).catch(() => null);
}

function bindEvents() {
  document.querySelectorAll(".dino-choice").forEach((button) => {
    button.addEventListener("click", () => chooseDino(button.dataset.dino));
  });
  $("musicButton").addEventListener("click", () => setAction("home:music"));
  $("homeButton").addEventListener("click", () => {
    setAction("story:home");
    routeTo("home");
  });
  $("choiceA").addEventListener("click", () => updateStoryLine(copy.storyA, "story:choice-a"));
  $("choiceB").addEventListener("click", () => updateStoryLine(copy.storyB, "story:choice-b"));
  $("speakButton").addEventListener("click", speakCurrentLine);
  $("micButton").addEventListener("click", () => captureVoice(null));
  $("finishButton").addEventListener("click", () => {
    setAction("story:finish");
    routeTo("works");
  });
  $("textForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("textInput").value.trim();
    if (text) updateStoryLine(text, "story:text");
  });
  $("hatchMicButton").addEventListener("click", () => captureVoice($("hatchPrompt")));
  $("hatchPrompt").addEventListener("input", updateHatchInputState);
  document.querySelectorAll("[data-hatch-chip]").forEach((button) => {
    button.addEventListener("click", () => addChip(button.dataset.hatchChip));
  });
  $("hatchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    hatchDino();
  });
  $("refreshArtifacts").addEventListener("click", () => {
    setAction("works:refresh");
    loadArtifacts({ showBackend: true });
  });
  $("galleryTab").addEventListener("click", () => routeTo("works"));
  $("hatchTab").addEventListener("click", () => routeTo("hatch"));
  $("parentTab").addEventListener("click", () => routeTo("parent"));
  $("saveSettings").addEventListener("click", saveSettings);
  ["themeSelect", "dailyLimit", "safetyToggle", "voiceToggle", "imageToggle"].forEach((id) => {
    $(id).addEventListener("change", drawStage);
  });
  window.addEventListener("hashchange", applyRouteFromHash);
}

async function init() {
  canvasStage.scene = $("sceneCanvas");
  canvasStage.sceneCtx = canvasStage.scene.getContext("2d");
  canvasStage.nav = $("navCanvas");
  canvasStage.navCtx = canvasStage.nav.getContext("2d");
  document.body.classList.add("home-mode", "canvas-mode");
  bindEvents();
  loadLocalHatched();
  await Promise.all([loadSession(), loadDinos(), loadSettings(), loadCanvasAssets()]);
  await loadArtifacts({ showBackend: false });
  applyRouteFromHash();
}

init().catch((error) => {
  console.error(error);
  document.body.dataset.route = "error";
});
