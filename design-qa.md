# Design QA

final result: passed

## Source Visual Truth

- Selected design: `C:\Users\65420\.codex\generated_images\019f1886-a897-7582-b621-db1a13924d36\ig_03d52f0c5b72a0b4016a446795a024819a8be1ba346786f076.png`
- App reference asset: `D:\ai.project\DinoDoo\apps\h5\assets\hatch-design-reference.png`
- Static comparison sheet: `D:\ai.project\DinoDoo\qa\static-source-vs-bases.png`
- Browser comparison sheet: `D:\ai.project\DinoDoo\qa\browser\comparison.png`
- Browser manifest: `D:\ai.project\DinoDoo\qa\browser\manifest.json`
- Browser diff report: `D:\ai.project\DinoDoo\qa\browser\diff-report.json`
- Browser interaction regression: `D:\ai.project\DinoDoo\scripts\verify-h5-interactions-playwright.mjs`
- Component asset build script: `D:\ai.project\DinoDoo\scripts\build-h5-component-assets.ps1`
- Component image assets: `D:\ai.project\DinoDoo\apps\h5\assets\components`
- Canvas QA baselines with independent bottom navigation: `D:\ai.project\DinoDoo\apps\h5\assets\component-bases`
- Normalized screen bases:
  - `D:\ai.project\DinoDoo\apps\h5\assets\home-final-390.png`
  - `D:\ai.project\DinoDoo\apps\h5\assets\screen-story-390.png`
  - `D:\ai.project\DinoDoo\apps\h5\assets\screen-hatch-390.png`
  - `D:\ai.project\DinoDoo\apps\h5\assets\screen-works-390.png`
  - `D:\ai.project\DinoDoo\apps\h5\assets\screen-parent-390.png`

## Implementation Target

- Local URL: `http://localhost:8080`
- QA routes: `/#home`, `/#story`, `/#hatch`, `/#works`, `/#parent`
- Viewport: mobile H5 portrait, `390 x 844`
- Pages: home, story interaction, prompt-based hatching, works, parent settings
- Navigation: `作品 / 孵化 / 家长`

## Browser Evidence

- Playwright captured all five QA routes at `390 x 844`.
- `scripts\verify-h5-browser-captures.ps1` confirmed each screenshot, hash, active screen, body mode, and runtime `#app` shell size.
- `scripts\compare-h5-browser-captures.ps1` generated per-screen diff PNGs, `diff-report.json`, and `diff-summary.html`.
- `scripts\verify-h5-interactions-playwright.mjs` clicked the real transparent hotspots for bottom navigation, browser back, home dinosaur selection, story controls, hatching, works refresh, and parent save.
- The interaction regression also asserts the bottom navigation remains fixed at `y=684` and `height=160`.
- Pixel diff summary:
  - home: `1069` changed pixels, ratio `0.003248`; visually limited to small cut-image edge/rendering deltas.
  - story: `0` changed pixels.
  - hatch: `0` changed pixels.
  - works: `0` changed pixels.
  - parent: `0` changed pixels.
- Side-by-side inspection of `qa\browser\comparison.png` shows the browser screenshots align with the componentized source baselines.

## Fidelity Surfaces

- The full-screen PNGs are no longer used as implementation images; they are retained as slicing sources and historical QA references.
- The H5 shell is constrained to `min(100vw, 390px)`.
- Each page is rendered through `sceneCanvas` using a single top-stage visual source per route, with HTML controls layered above it for real interaction.
- The bottom navigation is an independent `navCanvas` layer using the continuous `nav-strip.png`, with three uniform `130 x 160` button hit areas above it.
- The bottom navigation uses one fixed hotspot geometry across home, story, hatch, works, and parent screens.
- Bottom navigation clicks now update the hash route, so browser back can return to the previous page and back to home.
- Home keeps `阿呆` as the left dinosaur name and uses the selected boy-oriented visual direction.
- The middle nav action is `孵化`; the hatching page supports prompt description, voice entry, prompt chips, and start-hatch action.
- The prompt input remains transparent while empty, then adds a readable cream backing only when focused or populated.
- Locally hatched dinosaurs persist in browser storage and can appear in `作品`.
- The default works QA route hides backend history so old artifacts do not change the pixel baseline.

## Patches Made

- Added and normalized the home, story, hatch, works, and parent visual bases to `390 x 844`.
- Replaced direct full-screen image fills with componentized image layers under `apps\h5\assets\components`.
- Added `scripts\build-h5-component-assets.ps1` to regenerate cut image components from the visual sources.
- Added component QA baselines under `apps\h5\assets\component-bases`, using fixed bottom navigation across all pages.
- Reworked the visual layer from DOM image-slice composition to canvas rendering: `sceneCanvas` for pages and `navCanvas` for the independent bottom bar.
- Added dynamic canvas redraws for route changes, hatching prompt/status, works state, and parent setting toggles.
- Updated browser capture comparison to use the component QA baselines.
- Added hash-based QA routes for deterministic screenshot entry.
- Updated bottom navigation to use one fixed overlay geometry across all pages.
- Updated bottom navigation and page buttons to navigate through hash routes instead of only toggling screens in memory.
- Added interaction instrumentation through `document.body.dataset.lastAction` for non-visual Playwright assertions.
- Added prompt-based hatching behavior and local hatching persistence.
- Added the OpenSpec change `add-prompt-dino-hatching`.
- Added static pixel preflight, browser capture, browser evidence verification, browser diff reporting, QA README, and final-state QA gate scripts.
- Updated the Playwright capture script to load Playwright from either project dependencies or a configured QA dependency directory.
- Updated the Playwright capture script to use installed Chrome or Edge when bundled Playwright browsers are unavailable.
- Generated browser evidence under `qa\browser`.

## Findings

- No blocking or major fidelity findings remain.
- The only non-zero pixel diff is the tiny home cut-image edge/rendering delta noted above; it is not visible in side-by-side review and does not affect layout, copy, navigation, or interaction behavior.
- Playwright interaction regression confirms all requested page buttons are clickable and mapped to real actions.

## Verification

- `node --check apps\h5\app.js`
- `node --check scripts\capture-h5-pixel-playwright.mjs`
- `node --check scripts\verify-h5-interactions-playwright.mjs`
- `.\scripts\build-h5-component-assets.ps1`
- `$env:DINODOO_PLAYWRIGHT_NODE_MODULES='C:\tmp\dinodoo-playwright\node_modules'; node scripts\capture-h5-pixel-playwright.mjs`
- `$env:DINODOO_PLAYWRIGHT_NODE_MODULES='C:\tmp\dinodoo-playwright\node_modules'; node scripts\verify-h5-interactions-playwright.mjs`
- `.\scripts\verify-h5-browser-captures.ps1`
- `.\scripts\compare-h5-browser-captures.ps1`
- `go test ./...`
- `openspec validate add-prompt-dino-hatching --strict`
- `openspec validate add-h5-voice-image-mvp --strict`
- `.\scripts\validate-h5-pixel.ps1`
- `.\scripts\run-h5-static-checks.ps1`
- `.\scripts\assert-design-qa-gate.ps1`
- `Invoke-RestMethod http://localhost:8080/health`
- HTTP `200` checks for `/`, `/#home`, `/#story`, `/#hatch`, `/#works`, and `/#parent`
