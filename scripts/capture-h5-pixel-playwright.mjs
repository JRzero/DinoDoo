import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const env = globalThis.process?.env || {};
const baseUrl = env.DINODOO_QA_URL || "http://localhost:8080";
const outDir = path.join(root, "qa", "browser");

const states = [
  { name: "home", hash: "home", screenId: "homeScreen", bodyMode: "home-mode", source: "apps/h5/assets/component-bases/home-component-390.png" },
  { name: "story", hash: "story", screenId: "playScreen", bodyMode: "pixel-mode", source: "apps/h5/assets/component-bases/story-component-390.png" },
  { name: "hatch", hash: "hatch", screenId: "hatchScreen", bodyMode: "pixel-mode", source: "apps/h5/assets/component-bases/hatch-component-390.png" },
  { name: "works", hash: "works", screenId: "galleryScreen", bodyMode: "pixel-mode", source: "apps/h5/assets/component-bases/works-component-390.png" },
  { name: "parent", hash: "parent", screenId: "parentScreen", bodyMode: "pixel-mode", source: "apps/h5/assets/component-bases/parent-component-390.png" },
];

async function main() {
  const { chromium } = await loadPlaywright();
  await fs.mkdir(outDir, { recursive: true });

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
    });

    const manifest = {
      baseUrl,
      viewport: { width: 390, height: 844 },
      capturedAt: new Date().toISOString(),
      states: [],
    };

    for (const state of states) {
      const url = `${baseUrl}/#${state.hash}`;
      const screenshot = path.join(outDir, `${state.name}.png`);
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForFunction(
        ({ screenId, bodyMode }) => {
          const active = document.querySelector(".screen.active");
          const app = document.querySelector("#app");
          const box = app?.getBoundingClientRect();
          const imagesReady = Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0);
          return (
            active?.id === screenId &&
            document.body.classList.contains(bodyMode) &&
            box &&
            Math.abs(box.width - 390) <= 0.5 &&
            Math.abs(box.height - 844) <= 0.5 &&
            imagesReady
          );
        },
        { screenId: state.screenId, bodyMode: state.bodyMode },
        { timeout: 5000 },
      );
      const runtime = await page.evaluate(() => {
        const app = document.querySelector("#app");
        const box = app?.getBoundingClientRect();
        return {
          hash: window.location.hash,
          bodyClass: document.body.className,
          devicePixelRatio: window.devicePixelRatio,
          activeScreenId: document.querySelector(".screen.active")?.id || null,
          shell: box
            ? {
                x: Math.round(box.x * 1000) / 1000,
                y: Math.round(box.y * 1000) / 1000,
                width: Math.round(box.width * 1000) / 1000,
                height: Math.round(box.height * 1000) / 1000,
              }
            : null,
        };
      });
      await page.screenshot({ path: screenshot, fullPage: false });
      manifest.states.push({
        name: state.name,
        url,
        expectedScreenId: state.screenId,
        expectedBodyMode: state.bodyMode,
        source: state.source,
        screenshot: path.relative(root, screenshot).replaceAll("\\", "/"),
        runtime,
      });
    }

    await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    const comparisonHtml = buildComparisonHtml(manifest);
    const comparisonPath = path.join(outDir, "comparison.html");
    await fs.writeFile(comparisonPath, comparisonHtml);

    await page.setViewportSize({ width: 1700, height: 1550 });
    await page.goto(`file:///${comparisonPath.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(outDir, "comparison.png"), fullPage: true });
  } finally {
    await browser.close();
  }

  console.log(`Browser QA captures written to ${path.relative(root, outDir)}`);
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

function buildComparisonHtml(manifest) {
  const cards = manifest.states
    .map((state) => {
      const source = path.relative(outDir, path.join(root, state.source)).replaceAll("\\", "/");
      const shot = path.basename(state.screenshot);
      return `
        <section class="pair">
          <h2>${escapeHtml(state.name)} - ${escapeHtml(state.url)}</h2>
          <div class="images">
            <figure>
              <figcaption>source base</figcaption>
              <img src="${source}" alt="${escapeHtml(state.name)} source" />
            </figure>
            <figure>
              <figcaption>browser screenshot</figcaption>
              <img src="${shot}" alt="${escapeHtml(state.name)} browser screenshot" />
            </figure>
          </div>
        </section>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>DinoDoo H5 Pixel QA</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, sans-serif;
      color: #172033;
      background: #f4f7fb;
    }
    h1 { margin: 0 0 6px; font-size: 22px; }
    p { margin: 0 0 22px; color: #516070; }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
      align-items: start;
    }
    .pair {
      padding: 14px;
      border: 1px solid #d9e1ec;
      border-radius: 8px;
      background: #fff;
    }
    h2 { margin: 0 0 12px; font-size: 14px; }
    .images {
      display: grid;
      grid-template-columns: repeat(2, 195px);
      gap: 12px;
    }
    figure { margin: 0; }
    figcaption {
      margin-bottom: 6px;
      color: #607086;
      font-size: 12px;
      font-weight: 700;
    }
    img {
      display: block;
      width: 195px;
      height: 422px;
      object-fit: fill;
      border: 1px solid #ccd6e3;
      background: #d9f3ff;
    }
  </style>
</head>
<body>
  <h1>DinoDoo H5 Pixel QA</h1>
  <p>Viewport: 390 x 844. Compare each source visual base against the captured browser screenshot.</p>
  <main class="grid">${cards}</main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
