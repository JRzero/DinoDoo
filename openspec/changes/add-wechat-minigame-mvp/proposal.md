## Why

The current H5 direction is not a good fit for the intended WeChat game experience because it keeps drifting toward full-screen image reconstruction. We need a native WeChat Mini Game MVP where the background is a clean scene image and every dinosaur, icon, button, egg, panel, and bottom-nav item is an independent sprite that can be animated, tapped, and replaced.

## What Changes

- Add a native WeChat Mini Game workspace under `apps/wechat-game`.
- Replace the H5 page model with a `game.js` Canvas runtime, scene manager, sprite renderer, touch hit testing, and WeChat API adapters.
- Introduce clean scene background assets that contain no dinosaurs, icons, buttons, text panels, eggs, or bottom navigation components.
- Introduce separately designed sprite assets for dinosaurs, eggs, title signs, bottom-nav icons, buttons, panels, and feedback states.
- Implement MVP scenes for home, story, hatch, works, and parent flows.
- Connect voice recording, image picking/upload, prompt-based hatching, local state, and backend API calls through WeChat Mini Game services.
- Keep the existing H5 implementation as reference only; it must not be the rendering model for the Mini Game.

## Capabilities

### New Capabilities

- `wechat-minigame-theater`: Native WeChat Mini Game experience, asset layering rules, scene navigation, touch interactions, voice/image input, and hatching flow.

### Modified Capabilities

- None.

## Impact

- Adds `apps/wechat-game` as a new frontend target.
- Adds OpenSpec artifacts for the WeChat Mini Game MVP.
- Reuses existing backend story, parent setting, artifact, voice, and image endpoints where possible.
- Requires new QA checks for asset manifest separation, Mini Game project files, and JavaScript syntax.
