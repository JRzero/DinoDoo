# Design QA

final result: passed

## Source Visual Truth

- Mini-game element library: `D:\ai.project\DinoDoo\apps\h5\assets\game-elements`
- Element specs: `D:\ai.project\DinoDoo\design\asset-spec.md` and `D:\ai.project\DinoDoo\design\elements\*\README.md`
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

- The H5 implementation uses `#sceneLayer` and `#navLayer` DOM image layers, not `sceneCanvas` or `navCanvas`.
- Runtime implementation does not reference full-screen page screenshots or `runtime-preview` files as app assets.
- Each page renders a clean empty background plus independent `<img data-asset="...">` elements.
- Bottom navigation renders independent background, icon, and label PNGs, with transparent HTML hit areas above them.
- HTML buttons, inputs, toggles, and selects remain separate interaction layers above the visual assets.

## Browser Evidence

- Playwright captured all five QA routes at `390 x 844`.
- `scripts\verify-h5-browser-captures.ps1` confirmed screenshot size, hash route, active screen, runtime shell size, `asset-mode`, scene asset count, and nav asset count.
- `scripts\verify-h5-interactions-playwright.mjs` clicked real controls for bottom navigation, browser back, home dinosaur selection, story choices, voice/replay hotspots, hatching chips, hatch submit, works refresh, parent toggles, and parent save.
- The interaction regression confirms the bottom navigation remains fixed at `y=684` and `height=160` across pages.
- QA scripts reset parent settings before capture and after interaction regression so screenshots are deterministic.

## Runtime Asset Counts

- home: 15 scene assets + 7 nav assets
- story: 7 scene assets + 7 nav assets
- hatch: 10 scene assets + 7 nav assets
- works: 13 scene assets + 7 nav assets
- parent: 18 scene assets + 7 nav assets

## Fixes In This Pass

- Rebuilt the home title/logo PNG so the visible text reads cleanly as `恐龙 咚咚岛` instead of the earlier shadow-overlapped title asset.
- Mirrored the clean home title into the WeChat game panel asset to keep the shared asset library consistent.
- Changed the works page default from an empty board to a populated featured-card layout using demo works when no user-created work exists.
- Corrected parent page hidden toggle semantics so image and background-music controls match their visual rows.
- Added `music_enabled` to backend settings and changed H5 fallback behavior so the background-music toggle defaults to off when the field is absent.
- Added QA settings reset to Playwright capture and interaction scripts.

## Pixel Diff Notes

The current comparison is against runtime preview files under `design/extracted`. These previews still include the older home title art and several older scene-state choices, so the diff is used as evidence for tracking, not as a reason to reuse stale page screenshots.

- home: changed ratio `0.255958`; increased because the browser now uses the corrected clean title asset while the old source preview still shows the previous title.
- story: changed ratio `0.161466`; expected scene-state/content difference.
- hatch: changed ratio `0.2322`; expected idle egg state versus success reference state.
- works: changed ratio `0.073633`; improved after switching the default works view to populated card layout.
- parent: changed ratio `0.086745`; improved after deterministic settings reset and background-music default-off behavior.

## Findings

- No blocking interaction or layout findings remain for this pass.
- The highest remaining fidelity work is art-direction polish, especially regenerating source runtime previews so they use the cleaned title asset and matching page states.
- The page remains fully element-composed; no changes reintroduced full-screen background slices as implementation assets.

## Verification

- `node --check apps\h5\app.js`
- `node --check scripts\capture-h5-pixel-playwright.mjs`
- `node --check scripts\verify-h5-interactions-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\validate-h5-pixel.ps1`
- `go test ./...` from `server`
- `openspec validate add-prompt-dino-hatching --strict`
- `openspec validate add-h5-voice-image-mvp --strict`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\verify-h5-interactions-playwright.mjs`
- `DINODOO_QA_URL=http://localhost:18180 node scripts\capture-h5-pixel-playwright.mjs`
- `powershell -ExecutionPolicy Bypass -File scripts\verify-h5-browser-captures.ps1`
- `powershell -ExecutionPolicy Bypass -File scripts\compare-h5-browser-captures.ps1`
- `DINODOO_QA_URL=http://localhost:18180 powershell -ExecutionPolicy Bypass -File scripts\run-h5-static-checks.ps1`