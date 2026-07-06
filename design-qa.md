# Design QA

final result: passed

## Source Visual Truth

- Mini-game element library: `D:\ai.project\DinoDoo\apps\h5\assets\game-elements`
- Element specs: `D:\ai.project\DinoDoo\design\elements`
- Runtime visual references: `D:\ai.project\DinoDoo\design\extracted\home\home-runtime-preview.png`, `story`, `hatch`, `works`, and `parent` runtime previews
- Browser comparison sheet: `D:\ai.project\DinoDoo\qa\browser\comparison.png`
- Browser manifest: `D:\ai.project\DinoDoo\qa\browser\manifest.json`
- Browser diff report: `D:\ai.project\DinoDoo\qa\browser\diff-report.json`

## Implementation Target

- Local URL verified: `http://localhost:18180`
- QA routes: `/#home`, `/#story`, `/#hatch`, `/#works`, `/#parent`
- Viewport: mobile H5 portrait, `390 x 844`
- Content area: `390 x 684`; fixed bottom navigation: `390 x 160`

## Composition Contract

- H5 runtime uses `#sceneLayer` and `#navLayer` DOM image layers, not canvas rendering.
- Runtime implementation does not reference full-screen page screenshots, runtime previews, or `/assets/components/` as app assets.
- Page backgrounds now use `*-empty.png` environment images. These backgrounds must not contain dinosaurs, eggs, title art, buttons, cards, bottom navigation, path stones, or pedestal/platform sprites.
- Home renders empty environment background plus independent title, music, guide, path stones, paw prints, pedestals, dinosaur, badge, and nav PNG elements.
- Story renders empty environment background plus independent title, bubble, selected dinosaur, voice control, and choice-button PNG elements.
- Hatch renders empty environment background plus independent egg, input panel, chips, voice/image buttons, and start button; idle state does not show a loading status.
- Works renders empty environment background plus independent board, card, ribbon, dinosaur thumbnail, metadata, and refresh-button PNG elements.
- Parent renders empty environment background plus independent title, settings panel, rows, toggles, slider, time label, theme chips, permission buttons, and save button.
- Bottom navigation renders independent background, icon, and label PNGs, with uniform transparent HTML hit areas above them.
- Buttons, inputs, toggles, and selects remain real HTML interaction layers above the visual assets.

## Browser Evidence

- Playwright captured all five QA routes at `390 x 844`.
- `scripts\verify-h5-browser-captures.ps1` confirmed screenshot size, hash route, active screen, runtime shell size, `asset-mode`, scene asset count, and nav asset count.
- `scripts\verify-h5-interactions-playwright.mjs` clicked real controls for bottom navigation, browser back, home dinosaur selection, story choices, voice/replay hotspots, hatching image button, hatching chips, hatch submit, works refresh, parent toggles, and parent save.
- QA scripts reset parent settings before capture and after interaction regression so screenshots are deterministic.

## Runtime Asset Counts

- home: 15 scene assets + 7 nav assets
- story: 7 scene assets + 7 nav assets
- hatch: 9 scene assets + 7 nav assets in idle/default state
- works: 16 scene assets + 7 nav assets
- parent: 18 scene assets + 7 nav assets

## Fixes In This Pass

- Switched H5 runtime backgrounds from `*-clean.png` to `*-empty.png` so the background layer is only environment art.
- Restored home `path-stones.png`, `pedestal-large.png`, and `pedestal-small.png` as independent sprites instead of relying on baked-in background circles.
- Synced H5 bottom-nav icon coordinates to the mini-game layout values.
- Updated static validation so it requires empty backgrounds and independent home path/pedestal composition.
- Repointed the hidden story dinosaur image away from the legacy `/assets/xiaobao.png` file and into the element library.
- Regenerated browser screenshots and runtime preview evidence for all five H5 pages.
- Cleaned the home element README so it states the current empty-background composition contract.

## Pixel Diff Notes

All current QA screenshots match their source runtime previews exactly at the configured tolerance:

- home: changed ratio `0`
- story: changed ratio `0`
- hatch: changed ratio `0`
- works: changed ratio `0`
- parent: changed ratio `0`

## Findings

- No blocking interaction or layout findings remain for the current H5 pass.
- The current evidence proves the five QA routes are composed from independent element assets, have fixed bottom navigation, and match the checked runtime previews.
- Future polish can still improve art direction asset quality, but the implementation is no longer using the old full-background component mode.

## Verification

- `node --check apps\h5\app.js`
- `node --check scripts\capture-h5-pixel-playwright.mjs`
- `node --check scripts\verify-h5-interactions-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\validate-h5-pixel.ps1`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\capture-h5-pixel-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\verify-h5-browser-captures.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts\compare-h5-browser-captures.ps1`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\verify-h5-interactions-playwright.mjs`
- `DINODOO_QA_URL=http://localhost:18180 powershell -ExecutionPolicy Bypass -File scripts\run-h5-static-checks.ps1`
