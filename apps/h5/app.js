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
};

const $ = (id) => document.getElementById(id);

const dinoAssets = {
  xiaobao: "/assets/xiaobao.png",
  adai: "/assets/adai-cutout.png",
  gulu: "/assets/gulu.png",
};

const canvasSources = {
  home: "/assets/home-final-390.png",
  story: "/assets/screen-story-390.png",
  hatch: "/assets/screen-hatch-390.png",
  works: "/assets/screen-works-390.png",
  parent: "/assets/screen-parent-390.png",
  nav: "/assets/nav-strip.png",
};

const canvasStage = {
  scene: null,
  sceneCtx: null,
  nav: null,
  navCtx: null,
  assets: {},
  ready: false,
};

const screenRoutes = {
  home: ["", "homeScreen"],
  story: ["", "playScreen"],
  hatch: ["hatchTab", "hatchScreen"],
  works: ["galleryTab", "galleryScreen"],
  parent: ["parentTab", "parentScreen"],
};

const screenRouteNames = {
  homeScreen: "home",
  playScreen: "story",
  hatchScreen: "hatch",
  galleryScreen: "works",
  parentScreen: "parent",
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
  async del(path) {
    const res = await fetch(path, { method: "DELETE" });
    if (!res.ok) throw new Error(await errorText(res));
  },
};

async function errorText(res) {
  try {
    const json = await res.json();
    return json?.error?.message || res.statusText;
  } catch {
    return res.statusText;
  }
}

async function init() {
  document.body.classList.add("home-mode", "canvas-mode");
  setupCanvas();
  bindTabs();
  bindDinoChoices();
  bindPlay();
  bindHatch();
  bindSettings();
  const [_, themesRes, dinosRes, settings] = await Promise.all([
    loadCanvasAssets(),
    api.get("/api/v1/themes"),
    api.get("/api/v1/dinos"),
    api.get("/api/v1/parent/settings"),
  ]);
  state.themes = themesRes.themes || [];
  state.dinos = dinosRes.dinos || [];
  state.settings = settings;
  state.hatchedDinos = loadHatchedDinos();
  state.selectedDino = findDino("xiaobao");
  renderThemes();
  renderSettings();
  await loadArtifacts();
  applyRouteFromHash();
  window.addEventListener("hashchange", applyRouteFromHash);
}

function setupCanvas() {
  canvasStage.scene = $("sceneCanvas");
  canvasStage.nav = $("navCanvas");
  canvasStage.sceneCtx = configureCanvas(canvasStage.scene, 390, 684);
  canvasStage.navCtx = configureCanvas(canvasStage.nav, 390, 160);
}

function configureCanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return context;
}

async function loadCanvasAssets() {
  const entries = await Promise.all(
    Object.entries(canvasSources).map(async ([name, src]) => [name, await loadImage(src)]),
  );
  canvasStage.assets = Object.fromEntries(entries);
  canvasStage.ready = true;
  drawNavCanvas();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawNavCanvas() {
  if (!canvasStage.ready || !canvasStage.navCtx) return;
  canvasStage.navCtx.clearRect(0, 0, 390, 160);
  canvasStage.navCtx.drawImage(canvasStage.assets.nav, 0, 0, 390, 160);
}

function drawStage() {
  if (!canvasStage.ready || !canvasStage.sceneCtx) return;
  const route = state.route || document.body.dataset.route || "home";
  const source = canvasStage.assets[route] || canvasStage.assets.home;
  const ctx = canvasStage.sceneCtx;
  ctx.clearRect(0, 0, 390, 684);
  ctx.drawImage(source, 0, 0, 390, 684, 0, 0, 390, 684);
  drawDynamicLayer(ctx, route);
}

function drawDynamicLayer(ctx, route) {
  if (route === "story") {
    drawStoryState(ctx);
  } else if (route === "hatch") {
    drawHatchState(ctx);
  } else if (route === "works") {
    drawWorksState(ctx);
  } else if (route === "parent") {
    drawParentState(ctx);
  }
}

function drawStoryState(ctx) {
  if (!state.activeText) return;
  ctx.save();
  ctx.fillStyle = "#704015";
  ctx.font = "900 14px Arial, Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  wrapCanvasText(ctx, state.activeText, 128, 222, 112, 20, 3);
  ctx.restore();
}

function drawHatchState(ctx) {
  const prompt = $("hatchPrompt")?.value?.trim() || "";
  const status = $("hatchStatus")?.textContent?.trim() || "";
  ctx.save();
  if (prompt) {
    ctx.fillStyle = "rgba(255, 248, 224, 0.94)";
    roundRect(ctx, 112, 482, 224, 40, 18);
    ctx.fill();
    ctx.fillStyle = "#79502c";
    ctx.font = "900 15px Arial, Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    wrapCanvasText(ctx, prompt, 126, 506, 190, 18, 1);
  }
  if (status) {
    ctx.fillStyle = "#7a4317";
    ctx.font = "900 12px Arial, Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    wrapCanvasText(ctx, status, 195, 548, 250, 16, 2);
  }
  ctx.restore();
}

function drawWorksState(ctx) {
  const item = state.hatchedDinos?.[0];
  if (!item) return;
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 219, 0.92)";
  roundRect(ctx, 166, 548, 152, 58, 8);
  ctx.fill();
  ctx.fillStyle = "#704015";
  ctx.font = "900 13px Arial, Microsoft YaHei, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(item.title || "新朋友", 224, 572);
  ctx.fillStyle = "#7d5a2d";
  ctx.font = "800 10px Arial, Microsoft YaHei, sans-serif";
  wrapCanvasText(ctx, item.description || "刚孵化的小恐龙", 224, 588, 86, 12, 2);
  ctx.restore();
}

function drawParentState(ctx) {
  const toggles = [
    ["safetyToggle", 286, 366],
    ["voiceToggle", 286, 452],
  ];
  ctx.save();
  toggles.forEach(([id, x, y]) => {
    const checked = $(id)?.checked;
    ctx.fillStyle = checked ? "rgba(120, 201, 54, 0.95)" : "rgba(167, 114, 58, 0.55)";
    roundRect(ctx, x - 28, y - 14, 56, 28, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.arc(checked ? x + 13 : x - 13, y, 11, 0, Math.PI * 2);
    ctx.fill();
  });
  const status = $("settingsStatus")?.textContent?.trim();
  if (status) {
    ctx.fillStyle = "#2d6816";
    ctx.font = "900 13px Arial, Microsoft YaHei, sans-serif";
    ctx.fillText(status, 195, 670);
  }
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(String(text));
  let line = "";
  let lines = [];
  chars.forEach((char) => {
    const test = `${line}${char}`;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

function bindTabs() {
  const tabs = [
    ["galleryTab", "works"],
    ["hatchTab", "hatch"],
    ["parentTab", "parent"],
  ];
  tabs.forEach(([tabId, route]) => {
    $(tabId).addEventListener("click", () => {
      markAction(`nav:${route}`);
      navigateTo(route);
    });
  });
}

function bindDinoChoices() {
  document.querySelectorAll("[data-dino]").forEach((button) => {
    button.addEventListener("click", () => selectDino(button.dataset.dino));
  });
}

function bindPlay() {
  $("musicButton").addEventListener("click", () => {
    markAction("music");
    browserSpeak(state.settings?.voice_enabled === false ? "声音已经关掉啦。" : "叮咚，恐龙岛准备好啦。");
  });
  $("homeButton").addEventListener("click", () => {
    markAction("story:home");
    navigateTo("home");
  });
  $("choiceA").addEventListener("click", async () => {
    markAction("story:choice-a");
    await submitTurn($("choiceA").textContent);
  });
  $("choiceB").addEventListener("click", async () => {
    markAction("story:choice-b");
    await submitTurn($("choiceB").textContent);
  });
  $("finishButton").addEventListener("click", finishSession);
  $("speakButton").addEventListener("click", async () => {
    markAction("story:replay");
    await ensureSession();
    speakCurrent();
  });
  $("micButton").addEventListener("click", listen);
  $("textForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("textInput").value.trim();
    if (!text) return;
    $("textInput").value = "";
    submitTurn(text);
  });
  $("refreshArtifacts").addEventListener("click", () => {
    markAction("works:refresh");
    loadArtifacts({ showBackend: true, showEmpty: true });
  });
}

function bindHatch() {
  const input = $("hatchPrompt");
  input.addEventListener("input", syncHatchInputState);
  input.addEventListener("blur", syncHatchInputState);
  $("hatchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    hatchDino();
  });
  $("hatchMicButton").addEventListener("click", listenForHatch);
  document.querySelectorAll("[data-hatch-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const chip = button.dataset.hatchChip;
      markAction(`hatch:chip:${chip}`);
      const parts = input.value.trim() ? [input.value.trim(), chip] : [chip];
      input.value = parts.join("，");
      syncHatchInputState();
      $("hatchStatus").textContent = `已经加上：${chip}`;
      input.focus();
    });
  });
}

function syncHatchInputState() {
  $("hatchPrompt").classList.toggle("has-value", Boolean($("hatchPrompt").value.trim()));
  drawStage();
}

function bindSettings() {
  ["themeSelect", "dailyLimit", "safetyToggle", "voiceToggle", "imageToggle"].forEach((id) => {
    $(id).addEventListener("change", () => {
      markAction(`parent:change:${id}`);
      drawStage();
    });
  });
  $("dailyLimit").addEventListener("input", drawStage);
  $("saveSettings").addEventListener("click", async () => {
    markAction("parent:save");
    const selectedTheme = $("themeSelect").value;
    const settings = {
      ...state.settings,
      daily_minutes_limit: Number($("dailyLimit").value || 15),
      enabled_themes: selectedTheme ? [selectedTheme] : ["adventure"],
      image_generation_enabled: $("imageToggle").checked,
      voice_enabled: $("voiceToggle").checked,
      save_audio_enabled: false,
      memory_enabled: false,
    };
    state.settings = await api.put("/api/v1/parent/settings", settings);
    drawStage();
    $("settingsStatus").textContent = "已保存";
    drawStage();
    if (state.session) await startSession(state.selectedDino?.code);
  });
}

async function selectDino(code) {
  markAction(`home:dino:${code}`);
  state.selectedDino = findDino(code);
  navigateTo("story");
  await startSession(code);
}

async function ensureSession() {
  if (state.session?.status === "active") return state.session;
  const dino = state.selectedDino?.code || "xiaobao";
  await startSession(dino, { speak: false });
  return state.session;
}

async function startSession(dinoCode, options = {}) {
  const theme = state.settings?.enabled_themes?.[0] || "adventure";
  const dino = dinoCode || state.selectedDino?.code || "xiaobao";
  state.session = await api.post("/api/v1/play-sessions", { theme, dino });
  renderSession();
  if (options.speak !== false) speakCurrent();
}

async function submitTurn(input) {
  await ensureSession();
  setBusy(true);
  try {
    const result = await api.post(`/api/v1/play-sessions/${state.session.id}/turns`, {
      input,
      source: "h5",
    });
    state.session = result.session;
    renderSession(result.turn);
    speakCurrent();
  } finally {
    setBusy(false);
  }
}

async function finishSession() {
  markAction("story:finish");
  await ensureSession();
  setBusy(true);
  try {
    const result = await api.post(`/api/v1/play-sessions/${state.session.id}/finish`, {});
    state.session = result.session;
    await loadArtifacts({ showBackend: true });
    navigateTo("works");
  } finally {
    setBusy(false);
  }
}

function renderSession(turn) {
  const session = state.session;
  const last = turn || [...(session.turns || [])].reverse().find((item) => item.role === "assistant");
  if (!last) return;
  state.activeText = last.text;
  $("speakerName").textContent = last.speaker;
  $("dinoLine").textContent = last.text;
  $("choiceA").textContent = last.choices?.[0] || "去看看";
  $("choiceB").textContent = last.choices?.[1] || "叫朋友";
  $("dinoAvatar").className = `dino-avatar ${last.expression || "happy"}`;
  const activeDino = dinoBySpeaker(last.speaker) || findDino(session.state?.active_dino) || state.selectedDino;
  $("dinoImage").src = dinoAssets[activeDino?.code] || dinoAssets.xiaobao;
  $("dinoImage").alt = activeDino?.name || last.speaker;
  const theme = state.themes.find((item) => item.code === session.theme);
  $("themePill").textContent = theme?.name || "彩虹森林";
  drawStage();
}

function renderThemes() {
  $("themeSelect").innerHTML = state.themes
    .map((theme) => `<option value="${escapeHtml(theme.code)}">${escapeHtml(theme.name)}</option>`)
    .join("");
}

function renderSettings() {
  const s = state.settings || {};
  $("themeSelect").value = s.enabled_themes?.[0] || "adventure";
  $("dailyLimit").value = s.daily_minutes_limit || 15;
  $("imageToggle").checked = s.image_generation_enabled !== false;
  $("voiceToggle").checked = s.voice_enabled !== false;
  $("safetyToggle").checked = true;
  drawStage();
}

async function loadArtifacts(options = {}) {
  const result = await api.get("/api/v1/artifacts");
  const list = result.artifacts || [];
  state.artifacts = list;
  const hatched = state.hatchedDinos || [];
  const backendItems = options.showBackend ? list : [];
  const items = [...hatched.map((item) => ({ ...item, source: "hatch" })), ...backendItems];
  $("artifactList").innerHTML = items.length
    ? renderWorksLiveItem(items[0])
    : options.showEmpty
      ? renderWorksEmptyItem()
      : "";
  drawStage();
  list.forEach((item) => {
    const btn = document.querySelector(`[data-delete-artifact="${item.id}"]`);
    if (btn) {
      btn.addEventListener("click", async () => {
        await api.del(`/api/v1/artifacts/${item.id}`);
        await loadArtifacts();
      });
    }
  });
}

function renderWorksEmptyItem() {
  return `
    <article class="works-live-card works-live-empty">
      <div>
        <strong>还没有作品</strong>
        <span>先去孵化一只小恐龙吧</span>
      </div>
    </article>
  `;
}

function renderWorksLiveItem(item) {
  const isHatch = item.source === "hatch";
  const title = escapeHtml(isHatch ? item.title || "新朋友" : item.title || "恐龙卡片");
  const description = escapeHtml(isHatch ? item.description || "" : "故事作品卡");
  const img = escapeAttr(isHatch ? item.image || "/assets/gulu.png" : item.url || "/assets/gulu.png");
  return `
    <article class="works-live-card">
      <img src="${img}" alt="${title}" />
      <div>
        <strong>${title}</strong>
        <span>${description}</span>
      </div>
    </article>
  `;
}

function hatchDino() {
  markAction("hatch:submit");
  const prompt = $("hatchPrompt").value.trim();
  const description = prompt || "一只会唱歌的蓝色小恐龙";
  syncHatchInputState();
  const profile = dinoFromPrompt(description);
  const dino = {
    id: `hatch_${Date.now()}`,
    title: `${profile.name}小恐龙`,
    description,
    image: dinoAssets[profile.code] || dinoAssets.xiaobao,
    created_at: new Date().toISOString(),
  };
  state.hatchedDinos = [dino, ...state.hatchedDinos].slice(0, 12);
  saveHatchedDinos(state.hatchedDinos);
  state.selectedDino = findDino(profile.code);
  drawStage();
  $("hatchStatus").textContent = `孵化成功：${dino.title}`;
  loadArtifacts({ showBackend: false });
  navigateTo("works");
}

function dinoFromPrompt(prompt) {
  if (/角|三角|勇敢|粉|帽/.test(prompt)) return { code: "adai", name: "阿呆" };
  if (/蓝|唱|高|长|水|水果|慢/.test(prompt)) return { code: "gulu", name: "咕噜" };
  return { code: "xiaobao", name: "小暴" };
}

function listenForHatch() {
  markAction("hatch:voice");
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("hatchPrompt").focus();
    $("hatchStatus").textContent = "可以直接打字告诉恐龙蛋。";
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  $("hatchStatus").textContent = "恐龙蛋在听你说。";
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (text) {
      $("hatchPrompt").value = text;
      syncHatchInputState();
      $("hatchStatus").textContent = "听到啦，点开始孵化吧。";
    }
  };
  recognition.onerror = () => {
    $("hatchStatus").textContent = "没听清，可以再说一次。";
  };
  recognition.start();
}

function renderArtifact(item) {
  const title = escapeHtml(item.title || "恐龙卡片");
  const provider = escapeHtml(item.provider || "local");
  return `
    <article class="artifact">
      <img src="${escapeAttr(item.url)}" alt="${title}" />
      <div class="artifact-body">
        <div>
          <strong>${title}</strong>
          <small>${new Date(item.created_at).toLocaleString()} · ${provider}</small>
        </div>
        <button class="danger-button" type="button" data-delete-artifact="${escapeAttr(item.id)}">删除</button>
      </div>
    </article>
  `;
}

function renderHatchedArtifact(item) {
  const title = escapeHtml(item.title || "孵化小恐龙");
  const description = escapeHtml(item.description || "");
  return `
    <article class="artifact hatch-artifact">
      <img src="${escapeAttr(item.image)}" alt="${title}" />
      <div class="artifact-body">
        <div>
          <strong>${title}</strong>
          <small>${description}</small>
        </div>
      </div>
    </article>
  `;
}

async function speakCurrent() {
  if (!state.settings?.voice_enabled || !state.activeText) return;
  try {
    const res = await fetch("/api/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: state.activeText, voice_style: "warm" }),
    });
    if (res.status === 200) {
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
      return;
    }
  } catch {
    // Browser speech fallback below.
  }
  browserSpeak(state.activeText);
}

function browserSpeak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  utterance.pitch = 1.15;
  window.speechSynthesis.speak(utterance);
}

function listen() {
  markAction("story:voice");
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("textInput").focus();
    $("dinoLine").textContent = "可以点下面打字告诉恐龙。";
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  state.recognizing = true;
  $("micButton").textContent = "听中";
  recognition.onresult = (event) => {
    const text = event.results?.[0]?.[0]?.transcript || "";
    if (text) submitTurn(text);
  };
  recognition.onerror = () => {
    $("dinoLine").textContent = "我没听清，再说一次吧。";
  };
  recognition.onend = () => {
    state.recognizing = false;
    $("micButton").textContent = "说话";
  };
  recognition.start();
}

function setBusy(busy) {
  ["choiceA", "choiceB", "finishButton", "micButton", "speakButton"].forEach((id) => {
    $(id).disabled = busy;
  });
}

function showScreen(tabId, screenId) {
  ["hatchTab", "galleryTab", "parentTab"].forEach((id) => $(id).classList.toggle("active", id === tabId));
  ["homeScreen", "playScreen", "hatchScreen", "galleryScreen", "parentScreen"].forEach((id) => {
    $(id).classList.toggle("active", id === screenId);
  });
  document.body.classList.toggle("home-mode", screenId === "homeScreen");
  document.body.classList.toggle(
    "pixel-mode",
    ["playScreen", "hatchScreen", "galleryScreen", "parentScreen"].includes(screenId),
  );
  state.route = screenRouteNames[screenId] || "home";
  document.body.dataset.route = state.route;
  drawStage();
}

function applyRouteFromHash() {
  const route = window.location.hash.replace(/^#/, "").toLowerCase() || "home";
  const target = screenRoutes[route] || screenRoutes.home;
  showScreen(target[0], target[1]);
  if (route === "works") loadArtifacts({ showBackend: false });
}

function navigateTo(route) {
  const target = screenRoutes[route] || screenRoutes.home;
  const nextHash = `#${route}`;
  if (window.location.hash === nextHash) {
    showScreen(target[0], target[1]);
    if (route === "works") loadArtifacts({ showBackend: false });
    return;
  }
  window.location.hash = route;
}

function markAction(name) {
  document.body.dataset.lastAction = name;
}

function findDino(code) {
  return state.dinos.find((dino) => dino.code === code) || state.dinos[0] || { code: "xiaobao", name: "小暴" };
}

function dinoBySpeaker(speaker) {
  return state.dinos.find((dino) => dino.name === speaker);
}

function loadHatchedDinos() {
  try {
    return JSON.parse(localStorage.getItem("dinodoo_hatched_dinos") || "[]");
  } catch {
    return [];
  }
}

function saveHatchedDinos(items) {
  localStorage.setItem("dinodoo_hatched_dinos", JSON.stringify(items));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

init().catch((error) => {
  console.error(error);
  $("dinoLine").textContent = "启动失败，请刷新一下。";
});
