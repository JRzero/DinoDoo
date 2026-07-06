# DinoDoo WeChat Mini Game

This is the native WeChat Mini Game target for 恐龙咚咚岛.

Open `D:\ai.project\DinoDoo\apps\wechat-game` in WeChat DevTools as a Mini Game project.

## Rendering Contract

- Scene backgrounds are clean environment images only.
- Background images must not include dinosaurs, eggs, icons, buttons, text panels, labels, cards, or bottom navigation.
- All dinosaurs, eggs, icons, buttons, panels, labels, cards, and nav items are independent sprites declared in `src/assets/manifest.js`.
- Hit areas are defined in scene code and do not depend on the exact painted bounds of an asset.

## Current MVP Scope

- Home, story, hatch, works, and parent scenes.
- Fixed bottom navigation with three equal touch areas.
- WeChat API adapters for request/upload, voice recording, media picking, and local storage.
- Runtime composition previews under `design/extracted`.