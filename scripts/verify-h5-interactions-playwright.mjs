import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const env = globalThis.process?.env || {};
const baseUrl = env.DINODOO_QA_URL || "http://localhost:8080";

const expectedScreens = {
  home: "homeScreen",
  story: "playScreen",
  hatch: "hatchScreen",
  works: "galleryScreen",
  parent: "parentScreen",
};

async function main() {
  const { chromium } = await loadPlaywright();
  await resetQaSettings();
  const browser = await chromium.launch({
    executablePath: await findBrowserExecutable(),
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    await page.addInitScript(() => {
      window.localStorage.removeItem("dinodoo_hatched_dinos");
      window.sessionStorage.clear();
      Object.defineProperty(window, "speechSynthesis", {
        value: { cancel() {}, speak() {} },
        configurable: true,
      });
      window.Audio = function Audio() {
        return { play: () => Promise.resolve() };
      };
    });

    await page.goto(`${baseUrl}/#home`, { waitUntil: "networkidle" });
    await waitForRoute(page, "home");
    await expectAssetLayers(page, { route: "home", minSceneAssets: 12 });
    const navHome = await navMetrics(page);

    await page.locator("#hatchTab").click();
    await waitForRoute(page, "hatch");
    await expectHash(page, "#hatch");
    await expectAssetLayers(page, { route: "hatch", minSceneAssets: 9 });
    const navHatch = await navMetrics(page);

    await page.goBack({ waitUntil: "networkidle" });
    await waitForRoute(page, "home");
    await expectHash(page, "#home");

    await page.locator("#galleryTab").click();
    await waitForRoute(page, "works");
    await expectHash(page, "#works");
    await expectAssetLayers(page, { route: "works", minSceneAssets: 4 });
    const navWorks = await navMetrics(page);

    await page.locator("#parentTab").click();
    await waitForRoute(page, "parent");
    await expectHash(page, "#parent");
    await expectAssetLayers(page, { route: "parent", minSceneAssets: 15 });
    const navParent = await navMetrics(page);

    assertConsistentNav([navHome, navHatch, navWorks, navParent]);

    await page.goto(`${baseUrl}/#home`, { waitUntil: "networkidle" });
    await waitForRoute(page, "home");
    await page.locator('[data-dino="adai"]').click();
    await waitForRoute(page, "story");
    await expectHash(page, "#story");
    await expectLastAction(page, "home:dino:adai");
    await expectAssetLayers(page, { route: "story", minSceneAssets: 6 });

    await page.locator("#choiceA").click();
    await expectLastAction(page, "story:choice-a");
    await page.waitForFunction(() => document.querySelector("#dinoLine")?.textContent?.trim().length > 0);

    await page.locator("#speakButton").click();
    await expectLastAction(page, "story:replay");

    await page.locator("#micButton").click();
    await expectLastAction(page, "story:voice");

    await page.locator("#homeButton").click();
    await waitForRoute(page, "home");
    await expectHash(page, "#home");

    await page.locator("#hatchTab").click();
    await waitForRoute(page, "hatch");
    const hatchLayerBefore = await sceneLayerSignature(page);
    await page.locator("#hatchPrompt").fill("\u84dd\u8272 \u4f1a\u5531\u6b4c");
    const horn = "\u957f\u89d2";
    await page.locator(`[data-hatch-chip="${horn}"]`).click();
    await expectLastAction(page, `hatch:chip:${horn}`);
    await expectSceneLayerChanged(page, hatchLayerBefore, "hatch prompt did not recompose the element asset layer");
    const promptValue = await page.locator("#hatchPrompt").inputValue();
    if (!promptValue.includes(horn)) {
      throw new Error(`Hatch chip did not update prompt input: ${promptValue}`);
    }
    await page.locator("#hatchButton").click();
    await waitForRoute(page, "works");
    await expectHash(page, "#works");
    await expectLastAction(page, "hatch:submit");
    await page.waitForFunction(() => document.querySelector("#artifactList")?.textContent?.includes("\u65b0\u5c0f\u6050\u9f99"));

    await page.locator("#refreshArtifacts").click();
    await expectLastAction(page, "works:refresh");

    await page.locator("#parentTab").click();
    await waitForRoute(page, "parent");
    await page.locator("#dailyLimit").fill("30");
    const parentLayerBefore = await sceneLayerSignature(page);
    await page.locator("#voiceToggle").click({ force: true });
    await expectSceneLayerChanged(page, parentLayerBefore, "parent toggle did not recompose the element asset layer");
    await page.locator("#imageToggle").click({ force: true });
    await page.locator("#saveSettings").click();
    await expectLastAction(page, "parent:save");
    await page.waitForFunction(() => document.querySelector("#settingsStatus")?.textContent === "\u5df2\u4fdd\u5b58");

    console.log("H5 Playwright interaction regression passed.");
  } finally {
    await resetQaSettings().catch((error) => console.warn(error));
    await browser.close();
  }
}

async function resetQaSettings() {
  const response = await fetch(`${baseUrl}/api/v1/parent/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      daily_minutes_limit: 30,
      enabled_themes: ["island"],
      voice_enabled: true,
      image_generation_enabled: true,
      music_enabled: false,
      save_audio_enabled: false,
      memory_enabled: false,
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reset QA settings: ${response.status} ${await response.text()}`);
  }
}
async function waitForRoute(page, route) {
  await page.waitForFunction(
    ({ route, screenId }) => {
      const active = document.querySelector(".screen.active");
      const sceneAssets = document.querySelectorAll("#sceneLayer img[data-asset]").length;
      const navAssets = document.querySelectorAll("#navLayer img[data-asset]").length;
      return (
        document.body.dataset.route === route &&
        document.body.dataset.imagesReady === "true" &&
        active?.id === screenId &&
        sceneAssets > 0 &&
        navAssets >= 7
      );
    },
    { route, screenId: expectedScreens[route] },
    { timeout: 8000 },
  );
}

async function expectHash(page, expectedHash) {
  const actual = await page.evaluate(() => window.location.hash);
  if (actual !== expectedHash) {
    throw new Error(`Expected hash ${expectedHash}, got ${actual}`);
  }
}

async function expectLastAction(page, expectedAction) {
  await page.waitForFunction(
    (expectedAction) => document.body.dataset.lastAction === expectedAction,
    expectedAction,
    { timeout: 8000 },
  );
}

async function expectAssetLayers(page, { route, minSceneAssets }) {
  const layers = await page.evaluate(() => {
    const scene = document.querySelector("#sceneLayer");
    const nav = document.querySelector("#navLayer");
    return {
      sceneExists: Boolean(scene),
      navExists: Boolean(nav),
      sceneAssetCount: document.querySelectorAll("#sceneLayer img[data-asset]").length,
      navAssetCount: document.querySelectorAll("#navLayer img[data-asset]").length,
      sceneCanvasExists: Boolean(document.querySelector("#sceneCanvas")),
      navCanvasExists: Boolean(document.querySelector("#navCanvas")),
      assetMode: document.body.classList.contains("asset-mode"),
      imagesReady: document.body.dataset.imagesReady === "true",
      sceneAssetNames: Array.from(document.querySelectorAll("#sceneLayer img[data-asset]")).map((el) => el.dataset.asset),
      navAssetNames: Array.from(document.querySelectorAll("#navLayer img[data-asset]")).map((el) => el.dataset.asset),
    };
  });
  if (!layers.sceneExists || !layers.navExists || layers.sceneCanvasExists || layers.navCanvasExists || !layers.assetMode || !layers.imagesReady) {
    throw new Error(`Element asset layers are not active for ${route}: ${JSON.stringify(layers)}`);
  }
  if (layers.sceneAssetCount < minSceneAssets || layers.navAssetCount < 7) {
    throw new Error(`Too few element assets for ${route}: ${JSON.stringify(layers)}`);
  }
}

async function sceneLayerSignature(page) {
  return page.locator("#sceneLayer").evaluate((layer) =>
    Array.from(layer.querySelectorAll("img[data-asset], .scene-text"))
      .map((el) => {
        if (el instanceof HTMLImageElement) {
          return `img:${el.dataset.asset}:${el.getAttribute("style")}`;
        }
        return `text:${el.textContent}:${el.getAttribute("style")}`;
      })
      .join("|"),
  );
}

async function expectSceneLayerChanged(page, before, message) {
  await page
    .waitForFunction((before) => {
      const layer = document.querySelector("#sceneLayer");
      const current = Array.from(layer?.querySelectorAll("img[data-asset], .scene-text") || [])
        .map((el) => {
          if (el instanceof HTMLImageElement) {
            return `img:${el.dataset.asset}:${el.getAttribute("style")}`;
          }
          return `text:${el.textContent}:${el.getAttribute("style")}`;
        })
        .join("|");
      return current !== before;
    }, before, { timeout: 3000 })
    .catch(() => {
      throw new Error(message);
    });
}

async function navMetrics(page) {
  return page.locator(".bottom-nav").evaluate((nav) => {
    const box = nav.getBoundingClientRect();
    return {
      x: Math.round(box.x * 1000) / 1000,
      y: Math.round(box.y * 1000) / 1000,
      width: Math.round(box.width * 1000) / 1000,
      height: Math.round(box.height * 1000) / 1000,
    };
  });
}

function assertConsistentNav(metrics) {
  const [first, ...rest] = metrics;
  if (Math.abs(first.height - 160) > 0.5 || Math.abs(first.y - 684) > 0.5) {
    throw new Error(`Bottom nav must stay fixed at y=684 and height=160: ${JSON.stringify(first)}`);
  }
  for (const item of rest) {
    for (const key of ["x", "y", "width", "height"]) {
      if (Math.abs(item[key] - first[key]) > 0.5) {
        throw new Error(`Bottom nav ${key} changed: ${JSON.stringify(metrics)}`);
      }
    }
  }
}

async function findBrowserExecutable() {
  const candidates = [
    env.DINODOO_QA_BROWSER_EXECUTABLE,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }

  return undefined;
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }

  const fallbackIndex = path.join(
    env.DINODOO_PLAYWRIGHT_NODE_MODULES ||
      "C:/Users/65420/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules",
    "playwright",
    "index.mjs",
  );
  await fs.access(fallbackIndex);
  return import(pathToFileURL(fallbackIndex).href);
}

try {
  await main();
} catch (error) {
  console.error(error);
  if (globalThis.process) {
    globalThis.process.exitCode = 1;
  } else {
    throw error;
  }
}