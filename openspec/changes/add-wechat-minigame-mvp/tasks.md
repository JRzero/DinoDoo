## 1. OpenSpec And Project Setup

- [x] 1.1 Validate the `add-wechat-minigame-mvp` OpenSpec proposal, design, and spec.
- [x] 1.2 Create `apps/wechat-game` with native Mini Game root files.
- [x] 1.3 Add a Mini Game README that explains how to open the project in WeChat DevTools.

## 2. Asset Contract

- [x] 2.1 Add an asset manifest that separates clean scene backgrounds from sprites, icons, panels, buttons, eggs, and dinosaurs.
- [x] 2.2 Add placeholder asset files or draw fallbacks without embedding dinosaurs, icons, buttons, or nav components into background assets.
- [x] 2.3 Add static validation that fails if scene backgrounds and UI/character sprite IDs are mixed.

## 3. Mini Game Runtime

- [x] 3.1 Implement Canvas bootstrap from `game.js`.
- [x] 3.2 Implement resource loading and manifest lookup.
- [x] 3.3 Implement a scene manager with render, update, enter, leave, and touch routing hooks.
- [x] 3.4 Implement reusable sprite, button, bottom-nav, and toast UI primitives with independent hit areas.

## 4. MVP Scenes

- [x] 4.1 Implement home scene with clean background, independent title/button sprites, and dinosaur selection sprites.
- [x] 4.2 Implement story scene with selected dinosaur sprite, short story state, two-choice controls, voice controls, and return-home affordance.
- [x] 4.3 Implement hatch scene with prompt chips, voice/image affordances, hatch submit state, and generated dinosaur preview.
- [x] 4.4 Implement works scene with locally saved hatching records and refresh control.
- [x] 4.5 Implement parent scene with settings controls and save feedback.

## 5. WeChat Services

- [x] 5.1 Implement API client wrapper around `wx.request` and `wx.uploadFile`.
- [x] 5.2 Implement recorder service around `wx.getRecorderManager`.
- [x] 5.3 Implement media service around `wx.chooseMedia`.
- [x] 5.4 Implement storage service for selected dinosaur, settings, and generated works.

## 6. Verification

- [x] 6.1 Add JavaScript syntax/static checks for Mini Game files.
- [x] 6.2 Add manifest validation for clean-background and independent-sprite constraints.
- [x] 6.3 Run OpenSpec validation and local static checks.
