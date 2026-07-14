import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const env = globalThis.process?.env || {};
const baseUrl = env.DINODOO_QA_URL || "http://localhost:8080";
const work = { id: "local-adventure-test", name: "小橙", prompt: "橙色、爱冒险、开心大笑的小霸王龙", image: "", offline: true };

async function main() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ executablePath: await findBrowserExecutable() });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.addInitScript((localWork) => {
      window.localStorage.setItem("dinodoo_hatched_dinos", JSON.stringify([localWork]));
      window.sessionStorage.clear();
      Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak() {} }, configurable: true });
      window.Audio = function Audio() { return { play: () => Promise.resolve() }; };
    }, work);

    await page.goto(`${baseUrl}/?v=works-adventure-delete-v1#works`, { waitUntil: "networkidle" });
    await waitForRoute(page, "works");
    await page.locator("#worksAdventure").waitFor({ state: "visible" });
    await page.locator("#worksDelete").waitFor({ state: "visible" });
    await page.locator("#worksAdventure").click();
    await waitForRoute(page, "story");
    await expectLastAction(page, `works:adventure:${work.id}`);
    const speaker = (await page.locator("#speakerName").textContent())?.trim();
    if (speaker !== work.name) throw new Error(`Story speaker=${speaker}, want ${work.name}`);

    await page.goto(`${baseUrl}/?v=works-adventure-delete-v1#works`, { waitUntil: "networkidle" });
    await waitForRoute(page, "works");
    await page.locator("#worksDelete").click();
    await expectLastAction(page, `works:delete-arm:${work.id}`);
    const confirmLabel = (await page.locator("#worksDeleteLabel").textContent())?.trim();
    if (confirmLabel !== "确认") throw new Error(`Delete confirmation label=${confirmLabel}`);
    await page.locator("#worksDelete").click();
    await expectLastAction(page, `works:delete:${work.id}`);
    const saved = await page.evaluate(() => JSON.parse(window.localStorage.getItem("dinodoo_hatched_dinos") || "[]"));
    if (saved.length !== 0) throw new Error(`Local work was not deleted: ${JSON.stringify(saved)}`);
    if (await page.locator("#worksDelete").isVisible()) throw new Error("Delete control should be hidden for demo works");
    console.log(JSON.stringify({ adventure: true, delete: true, speaker, localStorageCount: saved.length }));
  } finally {
    await browser.close();
  }
}

async function waitForRoute(page, route) {
  await page.waitForFunction((expected) => document.body.dataset.route === expected, route);
}

async function expectLastAction(page, action) {
  await page.waitForFunction((expected) => document.body.dataset.lastAction === expected, action);
}

async function findBrowserExecutable() {
  const candidates = [env.DINODOO_QA_BROWSER_EXECUTABLE, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].filter(Boolean);
  for (const candidate of candidates) {
    try { await fs.access(candidate); return candidate; } catch { /* Try the next installed browser. */ }
  }
  return undefined;
}

async function loadPlaywright() {
  try { return await import("playwright"); } catch (error) { if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error; }
  const fallbackIndex = path.join(env.DINODOO_PLAYWRIGHT_NODE_MODULES || "C:/Users/65420/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules", "playwright", "index.mjs");
  await fs.access(fallbackIndex);
  return import(pathToFileURL(fallbackIndex).href);
}

try { await main(); } catch (error) { console.error(error); if (globalThis.process) globalThis.process.exitCode = 1; else throw error; }
