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
- Home renders the scenic background plus independent title, music, guide, paw, dinosaur, badge, and nav PNG elements.
- Story renders independent title, bubble, selected dinosaur, voice control, and choice-button PNG elements.
- Hatch renders independent egg, input panel, chips, voice/image buttons, and start button; idle state does not show a loading status.
- Works renders independent board, card, ribbon, dinosaur thumbnail, metadata, and refresh-button PNG elements.
- Parent renders independent title, settings panel, rows, toggles, slider, time label, theme chips, permission buttons, and save button.
- Bottom navigation renders independent background, icon, and label PNGs, with uniform transparent HTML hit areas above them.
- Buttons, inputs, toggles, and selects remain real HTML interaction layers above the visual assets.

## Browser Evidence

- Playwright captured all five QA routes at `390 x 844`.
- `scripts\verify-h5-browser-captures.ps1` confirmed screenshot size, hash route, active screen, runtime shell size, `asset-mode`, scene asset count, and nav asset count.
- `scripts\verify-h5-interactions-playwright.mjs` clicked real controls for bottom navigation, browser back, home dinosaur selection, story choices, voice/replay hotspots, hatching image button, hatching chips, hatch submit, works refresh, parent toggles, and parent save.
- QA scripts reset parent settings before capture and after interaction regression so screenshots are deterministic.

## Runtime Asset Counts

- home: 11 scene assets + 7 nav assets
- story: 7 scene assets + 7 nav assets
- hatch: 9 scene assets + 7 nav assets in idle/default state
- works: 16 scene assets + 7 nav assets
- parent: 18 scene assets + 7 nav assets

## Fixes Across The Current Passes

- Rebuilt `home-logo.png` as a standalone transparent title asset with clean `?????` text and synced it to H5, `design/extracted`, and the WeChat game title sprite.
- Removed duplicate home path and pedestal drawing from H5 so dinosaurs sit on the background circular platform areas instead of mismatched green patches.
- Changed hatch idle/default state so it does not show `???...` before the user acts.
- Added a real H5 image-button hotspot and `hatch:image` interaction state for the right-side hatch image button.
- Converted `scripts\build-h5-component-assets.ps1` into an element-library validator so static checks no longer crop components from full-screen screenshots.
- Improved works cards by adding real dinosaur thumbnails into the image slots and moving text/metadata into cleaner card positions.
- Improved parent lower controls by separating the daily time row, theme chips, permission buttons, and save button into clearer vertical bands.
- Synced the story preview to the current deterministic default story state so QA compares matching state to matching state.
- Cleaned element README files that previously contained garbled Chinese text.

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
- Future polish can still improve art direction asset quality, but the layout/module pass is clean against the current approved H5 element-library contract.

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
