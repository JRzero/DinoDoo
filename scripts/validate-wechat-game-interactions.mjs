import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DinoDooGame } = require("../apps/wechat-game/src/game.js");

const game = new DinoDooGame();
game.registerScenes();
await game.resources.loadAll();
game.sceneManager.go("home");

assert.equal(game.sceneManager.current.name, "home", "Game should start validation on home scene.");
assert.doesNotThrow(() => game.render(), "Home scene should render without throwing.");

// Select Adai on the home screen. This should persist the selection and enter story.
game.handleTouch({ touches: [{ clientX: 80, clientY: 550 }] });
assert.equal(game.state.selectedDino, "adai", "Tapping Adai should update selected dinosaur.");
assert.equal(game.sceneManager.current.name, "story", "Selecting a dinosaur should enter story scene.");
assert.doesNotThrow(() => game.render(), "Story scene should render after dinosaur selection.");

// Story title hit area returns home.
game.handleTouch({ touches: [{ clientX: 195, clientY: 82 }] });
assert.equal(game.sceneManager.current.name, "home", "Story title hit area should return home.");
game.handleTouch({ touches: [{ clientX: 80, clientY: 550 }] });
assert.equal(game.sceneManager.current.name, "story", "Selecting a dinosaur should re-enter story scene.");

// Story choices should update the story line without leaving the scene.
game.handleTouch({ touches: [{ clientX: 115, clientY: 585 }] });
assert.equal(game.sceneManager.current.name, "story", "Story choice should keep the user in story scene.");
assert.match(game.sceneManager.current.line, /缁х画鍓嶈繘|继续前进/, "Story choice A should update story copy.");

game.handleTouch({ touches: [{ clientX: 120, clientY: 505 }] });
assert.equal(game.recorder.recording, true, "Story voice button should start recording.");
game.handleTouch({ touches: [{ clientX: 120, clientY: 505 }] });
assert.equal(game.recorder.recording, false, "Story voice button should stop recording on second tap.");

// Bottom navigation should be globally fixed and route to hatch.
game.handleTouch({ touches: [{ clientX: 195, clientY: 760 }] });
assert.equal(game.sceneManager.current.name, "hatch", "Center bottom nav should enter hatch scene.");
assert.equal(game.bottomNav.active, "hatch", "Bottom nav active item should be hatch.");
assert.doesNotThrow(() => game.render(), "Hatch scene should render.");

// Hatch page chips, voice, image and hatch button should update prompt/status and create a work.
game.handleTouch({ touches: [{ clientX: 286, clientY: 572 }] });
assert.match(game.sceneManager.current.prompt, /长角/, "Hatch chip should append prompt text.");

game.handleTouch({ touches: [{ clientX: 92, clientY: 636 }] });
assert.equal(game.recorder.recording, true, "Hatch voice button should start recording.");
await game.sceneManager.current.buttons.find((button) => button.id === "image").onTap();
assert.equal(game.sceneManager.current.status, "已选择图片", "Hatch image button should update image-selected status.");
game.handleTouch({ touches: [{ clientX: 195, clientY: 636 }] });
assert.equal(game.sceneManager.current.eggState, "success", "Start hatch should switch egg to success state.");
assert.equal(game.state.works.length, 1, "Start hatch should create one work record.");
assert.equal(game.state.works[0].title, "新小恐龙", "Created work should have the expected title.");

// Works page should display stored work and refresh without changing scene.
game.handleTouch({ touches: [{ clientX: 65, clientY: 760 }] });
assert.equal(game.sceneManager.current.name, "works", "Left bottom nav should enter works scene.");
assert.equal(game.bottomNav.active, "works", "Bottom nav active item should be works.");
assert.doesNotThrow(() => game.render(), "Works scene should render.");
game.handleTouch({ touches: [{ clientX: 195, clientY: 640 }] });
assert.equal(game.sceneManager.current.name, "works", "Refresh should keep user in works scene.");

// Parent page should toggle settings, permission buttons and save them.
game.handleTouch({ touches: [{ clientX: 325, clientY: 760 }] });
assert.equal(game.sceneManager.current.name, "parent", "Right bottom nav should enter parent scene.");
assert.equal(game.bottomNav.active, "parent", "Bottom nav active item should be parent.");
assert.doesNotThrow(() => game.render(), "Parent scene should render.");
const previousVoice = game.state.settings.voice;
game.handleTouch({ touches: [{ clientX: 284, clientY: 278 }] });
assert.equal(game.state.settings.voice, !previousVoice, "Parent voice toggle should update settings.");
game.handleTouch({ touches: [{ clientX: 120, clientY: 570 }] });
assert.equal(game.sceneManager.current.name, "parent", "Voice permission button should stay on parent scene.");
game.handleTouch({ touches: [{ clientX: 268, clientY: 570 }] });
assert.equal(game.sceneManager.current.name, "parent", "Image permission button should stay on parent scene.");
game.handleTouch({ touches: [{ clientX: 195, clientY: 632 }] });
assert.equal(game.sceneManager.current.saved, true, "Save button should mark settings as saved.");

console.log("WeChat Mini Game interaction validation passed.");