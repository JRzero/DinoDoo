import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();
const gameRoot = path.join(root, "apps", "wechat-game");
const manifest = require(path.join(gameRoot, "src", "assets", "manifest.js"));

const requiredRootFiles = ["game.js", "game.json", "project.config.json"];
for (const file of requiredRootFiles) {
  assertFile(path.join(gameRoot, file), `Missing Mini Game root file: ${file}`);
}

const allFiles = walk(gameRoot);
const forbiddenPageFiles = allFiles.filter((file) => /\.(wxml|wxss)$/i.test(file));
assert(forbiddenPageFiles.length === 0, `Mini Game target must not include WXML/WXSS page files: ${forbiddenPageFiles.join(", ")}`);

const backgroundEntries = Object.entries(manifest.ASSET_MANIFEST.backgrounds || {});
const spriteEntries = Object.entries(manifest.ASSET_MANIFEST.sprites || {});
assert(backgroundEntries.length >= 5, "Expected clean backgrounds for home/story/hatch/works/parent scenes.");
assert(spriteEntries.length > 0, "Expected independent sprite assets.");

const forbiddenRoles = ["dinosaur", "egg", "icon", "button", "panel", "label", "bottom-nav", "text"];
for (const [id, asset] of backgroundEntries) {
  assert(id.startsWith("scene.") && id.endsWith(".background"), `Background id must use scene.<name>.background: ${id}`);
  assert(asset.role === "clean-background", `Background must use clean-background role: ${id}`);
  assertFile(path.join(gameRoot, asset.path), `Missing background asset file for ${id}: ${asset.path}`);
  for (const role of forbiddenRoles) {
    assert(asset.excludes?.includes(role), `Background ${id} must explicitly exclude ${role}.`);
  }
  assert(!/dino|egg|icon|button|panel|nav|label/i.test(asset.path), `Background path appears to contain component naming: ${asset.path}`);
}

const allowedSpritePrefixes = ["dino.", "egg.", "icon.", "button.", "panel.", "label."];
for (const [id, asset] of spriteEntries) {
  assert(allowedSpritePrefixes.some((prefix) => id.startsWith(prefix)), `Sprite id must use an approved prefix: ${id}`);
  assert(asset.role !== "clean-background", `Sprite must not be declared as clean background: ${id}`);
  assertFile(path.join(gameRoot, asset.path), `Missing sprite asset file for ${id}: ${asset.path}`);
}

const gameSource = fs.readFileSync(path.join(gameRoot, "src", "game.js"), "utf8");
assert(gameSource.includes("width: 390"), "Game must keep the 390px design coordinate width.");
assert(gameSource.includes("height: 844"), "Game must keep the 844px design coordinate height.");
assert(gameSource.includes("sceneHeight: 684"), "Game must reserve 160px for the fixed bottom nav.");
assert(gameSource.includes("createLayout()"), "Game must scale the design coordinate system to the device screen.");
assert(gameSource.includes("offsetX") && gameSource.includes("offsetY"), "Game layout must center the scaled design canvas.");
assert(gameSource.includes("toDesignPoint"), "Touch input must be mapped back into design coordinates.");
assert(gameSource.includes("this.bottomNav.render(this.ctx, this.resources)"), "Bottom nav must render consistently on every scene.");
const bottomNavSource = fs.readFileSync(path.join(gameRoot, "src", "ui", "bottom-nav.js"), "utf8");
assert(bottomNavSource.includes("width / 3"), "Bottom nav must divide the screen into three equal hit areas.");
assert(bottomNavSource.includes("icon.nav.works"), "Bottom nav works icon must be independent.");
assert(bottomNavSource.includes("icon.nav.hatch"), "Bottom nav hatch icon must be independent.");
assert(bottomNavSource.includes("icon.nav.parent"), "Bottom nav parent icon must be independent.");
assert(bottomNavSource.includes("label.nav.works"), "Bottom nav labels must be independent image assets.");
assert(bottomNavSource.includes("panel.nav.background"), "Bottom nav background must be an independent image asset.");

const sourceText = allFiles
  .filter((file) => /\.(js|json|md)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
assert(!sourceText.includes("screen-hatch-390.png"), "Mini Game must not reference H5 full-screen screenshot assets.");
assert(!sourceText.includes("home-final-390.png"), "Mini Game must not reference H5 full-screen screenshot assets.");
assert(!sourceText.includes("/assets/components/"), "Mini Game must not mount H5 component slices.");

console.log("WeChat Mini Game static validation passed.");

function assertFile(file, message) {
  assert(fs.existsSync(file), message);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}
