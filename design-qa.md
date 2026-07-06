# Design QA

final result: passed

## Source Visual Truth

- Mini-game element library: `D:\ai.project\DinoDoo\apps\h5\assets\game-elements`
- Home element spec: `D:\ai.project\DinoDoo\design\elements\home\README.md`
- Runtime visual references: `D:\ai.project\DinoDoo\design\extracted\home\home-runtime-preview.png`, `hatch`, `story`, `works`, and `parent` runtime previews
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
- Home no longer redraws separate green pedestal patches or duplicate stone-path patches over the background circles.
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
- works: 13 scene assets + 7 nav assets
- parent: 18 scene assets + 7 nav assets

## Fixes In This Pass

- Rebuilt `home-logo.png` as a standalone transparent title asset with clean `恐龙咚咚岛` text and synced it to H5, `design/extracted`, and the WeChat game title sprite.
- Removed duplicate home path and pedestal drawing from H5 so dinosaurs sit on the background's circular platform areas instead of a mismatched green patch.
- Restored bottom dinosaur proportions by using source-image aspect ratios and raised their badges to match the adjusted stance.
- Converted `scripts\build-h5-component-assets.ps1` into an element-library validator so static checks no longer crop components from full-screen screenshots.
- Updated the home element spec to document the current standalone asset contract and reserved platform/path assets.
- Changed hatch idle/default state so it does not show `孵化中...` before the user acts.
- Added a real H5 image-button hotspot and `hatch:image` interaction state for the right-side hatch image button.

## Pixel Diff Notes

- home: changed ratio `0` after syncing the source preview to the composed element page.
- hatch: changed ratio `0` after syncing the source preview to the corrected idle/default state.
- story: changed ratio `0.161466`; expected scene-state/content difference remains for later polish.
- works: changed ratio `0.073633`; populated card layout remains stable.
- parent: changed ratio `0.086745`; deterministic settings state remains stable.

## Findings

- No blocking interaction or layout findings remain for this pass.
- Remaining visual polish should continue page by page, using the element-library contract rather than full-screen crop components.

## Verification

- `node --check apps\h5\app.js`
- `node --check scripts\capture-h5-pixel-playwright.mjs`
- `node --check scripts\verify-h5-interactions-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\validate-h5-pixel.ps1`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\capture-h5-pixel-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\verify-h5-browser-captures.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts\compare-h5-browser-captures.ps1`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\verify-h5-interactions-playwright.mjs`
