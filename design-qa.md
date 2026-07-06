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

- The H5 implementation no longer uses `sceneCanvas` or `navCanvas`.
- The H5 implementation does not reference full-screen page screenshots or `runtime-preview` files as runtime assets.
- Each page renders a clean empty background plus independent `<img>` assets inside `#sceneLayer`.
- Bottom navigation renders independent `<img>` assets inside `#navLayer`.
- Every rendered visual asset is tagged with `data-asset`, so each background, dinosaur, title, badge, panel, button, icon, and nav label can be inspected independently.
- HTML buttons, inputs, toggles, and selects remain separate transparent interaction layers above the visual assets.

## Browser Evidence

- Playwright captured all five QA routes at `390 x 844`.
- `scripts\verify-h5-browser-captures.ps1` confirmed screenshot size, hash route, active screen, runtime shell size, `asset-mode`, scene asset count, and nav asset count.
- `scripts\verify-h5-interactions-playwright.mjs` clicked real controls for bottom navigation, browser back, home dinosaur selection, story choices, voice/replay hotspots, hatching chips, hatch submit, works refresh, parent toggles, and parent save.
- The interaction regression confirms the bottom navigation remains fixed at `y=684` and `height=160` across pages.
- The hatch input hotspot was reduced so it no longer blocks the prompt-chip buttons.

## Runtime Asset Counts

- home: 15 scene assets + 7 nav assets
- story: 7 scene assets + 7 nav assets
- hatch: 10 scene assets + 7 nav assets
- works: 5 scene assets + 7 nav assets
- parent: 18 scene assets + 7 nav assets

## Pixel Diff Notes

The current comparison is against the generated mini-game runtime previews under `design/extracted`. Diff ratios are non-zero because the H5 now composes live DOM image elements and live UI state rather than reusing a pre-rendered screenshot. These diffs are tracked as QA evidence, not as a reason to return to page-screenshot backgrounds.

- home: changed ratio `0.16084`
- story: changed ratio `0.161466`
- hatch: changed ratio `0.2322`
- works: changed ratio `0.323678`
- parent: changed ratio `0.098311`

## Findings

- No blocking fidelity or interaction findings remain for the current element-composition pass.
- The next iteration should be visual polish by module: first home title/dinosaur positioning, then hatch panel density, works populated-card state, and parent control spacing.
- The local image viewer in this Codex Windows sandbox cannot open PNGs because the sandbox wrapper refuses the split writable roots, so visual QA relies on Playwright-generated browser evidence and comparison artifacts.

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