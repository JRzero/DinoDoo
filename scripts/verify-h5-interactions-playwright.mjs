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
    await expectCanvasLayers(page);
    const navHome = await navMetrics(page);

    await page.locator("#hatchTab").click();
    await waitForRoute(page, "hatch");
    await expectHash(page, "#hatch");
    const navHatch = await navMetrics(page);

    await page.goBack({ waitUntil: "networkidle" });
    await waitForRoute(page, "home");
    await expectHash(page, "#home");

    await page.locator("#galleryTab").click();
    await waitForRoute(page, "works");
    await expectHash(page, "#works");
    const navWorks = await navMetrics(page);

    await page.locator("#parentTab").click();
    await waitForRoute(page, "parent");
    await expectHash(page, "#parent");
    const navParent = await navMetrics(page);

    assertConsistentNav([navHome, navHatch, navWorks, navParent]);

    await page.goto(`${baseUrl}/#home`, { waitUntil: "networkidle" });
    await waitForRoute(page, "home");
    await page.locator('[data-dino="adai"]').click();
    await waitForRoute(page, "story");
    await expectHash(page, "#story");
    await expectLastAction(page, "home:dino:adai");

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
    const hatchCanvasBefore = await sceneCanvasSignature(page);
    await page.locator("#hatchPrompt").fill("蓝色 会唱歌");
    await page.locator('[data-hatch-chip="长角"]').click();
    await expectLastAction(page, "hatch:chip:长角");
    await expectSceneCanvasChanged(page, hatchCanvasBefore, "hatch prompt did not redraw the canvas");
    const promptValue = await page.locator("#hatchPrompt").inputValue();
    if (!promptValue.includes("长角")) {
      throw new Error(`Hatch chip did not update prompt input: ${promptValue}`);
    }
    await page.locator("#hatchButton").click();
    await waitForRoute(page, "works");
    await expectHash(page, "#works");
    await expectLastAction(page, "hatch:submit");
    await page.waitForFunction(() => document.querySelector("#artifactList")?.textContent?.includes("小恐龙"));

    await page.locator("#refreshArtifacts").click();
    await expectLastAction(page, "works:refresh");

    await page.locator("#parentTab").click();
    await waitForRoute(page, "parent");
    await page.locator("#dailyLimit").fill("30");
    const parentCanvasBefore = await sceneCanvasSignature(page);
    await page.locator("#voiceToggle").click({ force: true });
    await expectSceneCanvasChanged(page, parentCanvasBefore, "parent toggle did not redraw the canvas");
    await page.locator("#imageToggle").click({ force: true });
    await page.locator("#saveSettings").click();
    await expectLastAction(page, "parent:save");
    await page.waitForFunction(() => document.querySelector("#settingsStatus")?.textContent === "已保存");

    console.log("H5 Playwright interaction regression passed.");
  } finally {
    await browser.close();
  }
}

async function waitForRoute(page, route) {
  await page.waitForFunction(
    ({ route, screenId }) => {
      const active = document.querySelector(".screen.active");
      return document.body.dataset.route === route && active?.id === screenId;
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

async function expectCanvasLayers(page) {
  const layers = await page.evaluate(() => {
    const scene = document.querySelector("#sceneCanvas");
    const nav = document.querySelector("#navCanvas");
    return {
      sceneWidth: scene?.width || 0,
      sceneHeight: scene?.height || 0,
      navWidth: nav?.width || 0,
      navHeight: nav?.height || 0,
      canvasMode: document.body.classList.contains("canvas-mode"),
    };
  });
  if (!layers.canvasMode || layers.sceneWidth <= 0 || layers.sceneHeight <= 0 || layers.navWidth <= 0 || layers.navHeight <= 0) {
    throw new Error(`Canvas layers are not active: ${JSON.stringify(layers)}`);
  }
}

async function sceneCanvasSignature(page) {
  return page.locator("#sceneCanvas").evaluate((canvas) => canvas.toDataURL("image/png"));
}

async function expectSceneCanvasChanged(page, before, message) {
  await page
    .waitForFunction((before) => document.querySelector("#sceneCanvas")?.toDataURL("image/png") !== before, before, {
      timeout: 3000,
    })
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
