## Context

The previous H5 implementation proved the product flow but not the right rendering model. The WeChat target is a Mini Game, not a Mini Program, so it must use `game.js`, Canvas, touch input, and WeChat game APIs instead of WXML/WXSS pages.

The most important design correction is asset separation. Each scene background is a clean environment image with no dinosaurs, eggs, buttons, panels, labels, icons, or bottom navigation. All interactive and stateful visuals are independent sprites with their own logical names and hit boxes.

## Goals / Non-Goals

**Goals:**

- Build a native WeChat Mini Game MVP under `apps/wechat-game`.
- Provide a lightweight Canvas 2D scene graph for home, story, hatch, works, and parent scenes.
- Keep bottom navigation fixed as a reusable game UI layer with three equal hit areas.
- Use a manifest that separates clean backgrounds from character, icon, button, panel, and feedback sprites.
- Support WeChat voice recording, image selection/upload, prompt hatching, and parent settings through services.
- Reuse existing backend APIs and demo fallbacks without exposing provider keys in the game client.

**Non-Goals:**

- Do not build a Mini Program WXML/WXSS app.
- Do not use the H5 full-screen canvas/screenshot reconstruction strategy.
- Do not put dinosaurs, icons, buttons, eggs, panels, labels, or nav components inside scene background images.
- Do not add Cocos/Phaser or another game engine for this MVP.
- Do not implement advanced animation timelines, physics, monetization, social sharing, or open data domain rankings in this change.

## Decisions

### Native Mini Game Canvas 2D

Use a small custom Canvas 2D runtime instead of Cocos.

- Rationale: The MVP is a toddler-friendly story and hatching flow, not a physics or level-based game. A tiny runtime is easier to inspect, keeps assets explicit, and avoids engine ceremony while the product direction is still moving.
- Alternative considered: Cocos Creator. It provides a mature editor and scene system but adds project weight and makes quick iteration on asset separation slower.

### Clean Backgrounds Plus Independent Sprites

Every scene is composed from:

1. `background` sprite: one clean scene image.
2. `characters` sprites: dinosaurs, eggs, and generated hatchling previews.
3. `props` sprites: title signs, boards, cards, and decorative foreground elements.
4. `ui` sprites: buttons, bottom-nav icons, microphone, image, parent controls.
5. `hitAreas`: tappable rectangles or circles independent from artwork.

The asset manifest MUST make this separation visible in code. Background asset IDs use `scene.<name>.background`; sprite asset IDs use domain prefixes such as `dino.*`, `icon.*`, `button.*`, `panel.*`, and `egg.*`.

### Scene Manager

The game has one active scene at a time:

- `home`: choose dinosaur and start story.
- `story`: show the chosen dinosaur, short story text, two-choice actions, voice replay/record controls.
- `hatch`: collect prompt text, voice note, optional image, and call hatch API.
- `works`: show locally saved and backend-created dinosaur cards.
- `parent`: show parent settings and media controls.

Bottom navigation is owned by a shared layer rendered after each scene so it stays visually and behaviorally consistent.

### Touch Routing

Touch events are routed from topmost UI hit areas to scene hit areas. Buttons have stable IDs and callbacks; artwork and hit box do not need to be identical. This avoids layout drift when icons are redesigned.

### WeChat Service Adapters

Mini Game APIs are wrapped behind service modules:

- `RecorderService`: `wx.getRecorderManager()`.
- `MediaService`: `wx.chooseMedia()` and `wx.uploadFile()`.
- `ApiClient`: `wx.request()` and upload helpers.
- `StorageService`: `wx.getStorageSync()` and `wx.setStorageSync()`.

Each service has a browser/dev fallback where practical so syntax and simple logic checks can run outside WeChat DevTools.

## Risks / Trade-offs

- [Risk] Native Canvas text/input is weaker than HTML form controls → Mitigation: MVP uses prompt chips and a simple overlay prompt panel abstraction; WeChat keyboard/input can be added as a focused follow-up if needed.
- [Risk] Real transparent assets are not available yet → Mitigation: scaffold uses a strict manifest and placeholder draw commands, but the contract requires replacing placeholders with separately designed PNG sprites before visual QA.
- [Risk] Canvas hit boxes can drift from art → Mitigation: centralize every hit area in scene definitions and add static validation for equal bottom-nav hit areas and background/sprite separation.
- [Risk] WeChat APIs cannot be fully verified in Node → Mitigation: keep adapters thin, provide mockable fallbacks, and document WeChat DevTools manual QA steps.

## Migration Plan

1. Add OpenSpec artifacts for the Mini Game MVP.
2. Scaffold `apps/wechat-game` with native Mini Game project files.
3. Add asset manifest and runtime modules for resource loading, scene management, rendering, touch routing, and services.
4. Implement MVP scenes using clean background IDs plus independent sprites.
5. Add static validation scripts for manifest structure and JavaScript syntax.
6. Validate with `openspec validate add-wechat-minigame-mvp --strict` and local static checks.

Rollback is simple: remove `apps/wechat-game` and this OpenSpec change. The existing H5 and backend remain untouched.

## Open Questions

- Which final AppID should be used in `project.config.json`?
- Should the first asset production pass use generated transparent PNGs or manually exported design assets?
