# Design QA
## 2026-07-10 Hatch Status Plaque Pass

- Source visual truth: D:\ai.project\DinoDoo\apps\h5\assets\game-elements\runtime-current\hatchSubtitlePlaque.png and the existing hatch title treatment
- Warming screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-polished-warming-v16.png
- Cracking screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-polished-cracking-v16.png
- Success screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-polished-success-v16.png
- Three-state comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-hatch-polished-status-v16.png
- Viewport: 390 x 844
- Route/state: /#hatch, warming, cracking, and success states

### Comparison History

- Earlier P2 finding: the yellow and green status pills looked like generic system notices and did not match the handcrafted wooden visual language.
- Fix: replaced the status PNG pills with the existing independent wooden plaque plus dynamic white dimensional text.
- Post-fix evidence: all three status states use one 190 x 50 plaque at x=100, y=454; the 166 x 20 text box is centered at y=468.
- The plaque bottom is y=504 and the control panel begins at y=506, preserving a clean two-pixel transition without overlap.

### Fidelity Surfaces

- Fonts and typography: 15px 900-weight white text uses the same brown dimensional shadow as the hatch subtitle.
- Spacing and layout rhythm: the status plaque remains centered between the egg and control panel across all states.
- Colors and visual tokens: wood, leaf, cream, and white tokens are reused from the established hatch title component.
- Image quality and asset fidelity: the independent hatchSubtitlePlaque PNG is reused without introducing CSS-drawn shapes or another visual style.
- Copy and content: warming, cracking, and birth messages are short, distinct, and readable in one line.
- Interaction and motion: the plaque enters with the existing status transition while the egg animation and timing remain unchanged.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested status-message styling.
- Browser verification found no failed visual asset requests.
- All three status labels are centered and remain clear at 390 x 844.

## 2026-07-10 Hatch Experience Motion Pass

- Source visual truth: D:\ai.project\DinoDoo\apps\h5\assets\game-elements\runtime-current\egg-source.png, hatchEggCracking.png, hatchEggSuccess.png, hatchStatusLoading.png, and hatchStatusSuccess.png
- Idle screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-experience-idle-v15.png
- Warming screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-experience-warming-v15.png
- Cracking screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-experience-cracking-v15.png
- Success screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-experience-success-v15.png
- Four-stage comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-hatch-experience-v15.png
- Viewport: 390 x 844
- Route/state: /#hatch, idle -> warming -> cracking -> success -> /#works

### Comparison History

- Earlier P2 finding: the three images changed correctly but still felt like static swaps with little anticipation or payoff.
- Fix: added a 0.8s glow-and-breathe warmup, a 1.5s continuous cracking shake, and a 1.8s broken-shell reveal dwell before navigation.
- Added state feedback: the loading/success pill and primary button copy now change with the phase, and all hatch controls remain locked throughout the sequence.
- Post-fix evidence: computed animation names are hatch-egg-warming, hatch-egg-cracking, and hatch-egg-success; the route changes only after the success dwell.
- Reduced-motion support: all hatch animations collapse to a single minimal-duration iteration when the operating system requests reduced motion.

### Fidelity Surfaces

- Fonts and typography: existing prompt, status, button, and navigation typography remain unchanged.
- Spacing and layout rhythm: animation uses transforms only, so the egg stage, control panel, and fixed navigation retain stable dimensions.
- Colors and visual tokens: the glow uses the egg art's existing warm yellow lighting; status pills reuse the existing loading and success PNGs.
- Image quality and asset fidelity: all motion is applied to existing transparent PNG assets without redrawing, stretching, or replacing them.
- Copy and content: the visible labels progress from Start Hatch to Hatching and Hatch Success; the ARIA status text provides more descriptive phase messages.
- Interaction and motion: controls are disabled during the full sequence, success remains visible for 1.8s, and the flow then enters Works.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested experiential hatch process.
- Browser verification found no failed image or animation asset requests.
- The idle, warming, cracking, and success frames remain aligned within the 390 x 844 stage.

## 2026-07-10 Hatch Three-Stage Sequence Pass

- Source visual truth: D:\ai.project\DinoDoo\apps\h5\assets\game-elements\runtime-current\egg-source.png, D:\ai.project\DinoDoo\apps\h5\assets\game-elements\hatch\egg-cracking.png, and D:\ai.project\DinoDoo\apps\h5\assets\game-elements\hatch\egg-success.png
- Idle screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-sequence-idle-v14.png
- Cracking screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-sequence-cracking-v14.png
- Broken-shell screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-sequence-success-v14.png
- Three-stage comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-hatch-sequence-v14.png
- Viewport: 390 x 844
- Route/state: /#hatch, idle -> cracking -> success -> /#works

### Comparison History

- Earlier P1 finding: the idle, cracking, and success runtime PNGs had identical hashes, so clicking Start Hatch changed state but showed the same egg.
- Fix: restored the independent cracking and broken-shell PNGs, kept their native 260 x 300 aspect, and added explicit 1100ms cracking plus 1400ms success dwell times.
- Post-fix evidence: browser state inspection resolves three different image URLs and button labels: Start Hatch, Hatching, and Hatch Success.
- Reset verification: returning from Works to Hatch restores the idle egg, enables the action button, and restores the Start Hatch label.

### Fidelity Surfaces

- Fonts and typography: existing plaque, prompt, and button typography remain unchanged; only the state label changes during the sequence.
- Spacing and layout rhythm: all three states remain centered in the same stage region; the control panel and fixed navigation do not move.
- Colors and visual tokens: both restored state images use the same cream shell, green spots, golden glow, and teal dinosaur palette.
- Image quality and asset fidelity: the two independent source PNGs retain alpha and native aspect with no CSS stretching.
- Copy and content: button copy clearly communicates idle, progress, and success.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested hatch-to-broken-shell process.
- All three images load successfully; the local static preview's API 404/501 responses continue to use the existing browser fallback and are unrelated to the animation assets.
- The final success frame remains visible before navigation instead of being skipped.

## 2026-07-10 Home Guide Short Copy Pass

- Source visual truth: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\reference-home-guide-too-long.png
- Implementation screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-home-guide-short-v13-playwright.png
- Full-view before/after comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-home-guide-short-full-v13.png
- Focused comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-home-guide-short-focus-v13.png
- Viewport: 390 x 844
- Route/state: /#home, default idle state

### Comparison History

- Earlier P2 finding: “选一只恐龙，故事就开始啦。” filled most of the wooden plaque and left insufficient breathing room.
- Fix: shortened the guide to “选一只恐龙，出发吧！” without changing the plaque, logo, dinosaur, or navigation layout.
- Post-fix evidence: rendered glyph width is 160px inside the 218px text box, leaving 29px on both sides.

### Fidelity Surfaces

- Fonts and typography: the existing 16px 900-weight white title style remains unchanged; the new copy stays on one line without clipping.
- Spacing and layout rhythm: the shorter copy is horizontally and vertically centered with balanced side whitespace.
- Colors and visual tokens: the existing hatch-page wooden plaque, cream text, and brown shadow remain unchanged.
- Image quality and asset fidelity: no raster asset was resized or replaced in this pass.
- Copy and content: the sentence is shorter, child-friendly, and preserves the choose-and-start intent.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested copy shortening.
- The final 390 x 844 render has no overflow and the persistent navigation remains visible.
- Page console errors and warnings: none.

## 2026-07-10 Home Guide Plaque Pass

- Source visual truth: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\reference-home-guide-plain.png
- Implementation screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-home-guide-plaque-v12-playwright.png
- Full-view comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-home-guide-v12.png
- Focused comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-home-guide-focus-v12.png
- Viewport: 390 x 844
- Route/state: /#home, default idle state

### Comparison History

- Earlier P2 finding: the home guide sentence was plain brown text over the sky and did not use the hatch page's wooden subtitle treatment.
- Fix: reused the independent hatch subtitle plaque at x=72, y=174, 246x56 and centered the home guide copy within it.
- Post-fix evidence: the text bounds are x=86, y=189, 218x23; the plaque bottom is y=230 and the center dinosaur begins at y=250, leaving a 20px separation.

### Fidelity Surfaces

- Fonts and typography: 16px 900-weight white text uses the hatch subtitle shadow treatment and remains a single unclipped line.
- Spacing and layout rhythm: the plaque is horizontally centered, its copy is vertically centered, and the existing dinosaur/name/nav coordinates are unchanged.
- Colors and visual tokens: the existing hatch-page wood, leaf, cream-text, and brown-shadow tokens are reused without introducing another style.
- Image quality and asset fidelity: the existing transparent hatchSubtitlePlaque PNG is reused at its intended aspect; no screenshot crop, SVG, or CSS art was introduced.
- Copy and content: the home sentence remains “选一只恐龙，故事就开始啦。”.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested home guide adjustment.
- The 390 x 844 browser render has no horizontal overflow or clipped persistent controls.
- Focused comparison confirms the requested region now matches the hatch page's subtitle construction.


## 2026-07-10 Hatch Input And Side Button Pass

- Source visual truth: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\reference-hatch-input-buttons-misaligned.png
- Implementation screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-input-buttons-v10-playwright.png
- Focused comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-hatch-input-buttons-v10.png
- Viewport: 390 x 844
- Route/state: /#hatch with a filled prompt

### Comparison History

- Earlier P2 finding: the filled input overlay used x=78, y=521, 234x34 and sat above and outside the panel input slot.
- Fix: aligned the input to the asset inner slot at x=97, y=527, 196x36 with 36px line height.
- Earlier P2 finding: the 58x44 voice and image controls looked visually compressed beside the primary action.
- Fix: increased both controls to 64x50 at y=593; both side controls and the 158x54 primary button now share center y=618 with 8px gaps.
- First post-fix comparison found a double input border from the HTML overlay shadow plus the raster panel border.
- Final fix: removed the HTML overlay shadow and retained only the raster panel border.

### Fidelity Surfaces

- Fonts and typography: 13px semibold prompt text uses a 36px line height and is vertically centered without clipping.
- Spacing and layout rhythm: the input follows the panel slot bounds; the three action buttons are centered and evenly spaced.
- Colors and visual tokens: the filled input uses the sampled slot color rgb(255, 246, 221), fully hiding the baked placeholder.
- Image quality and asset fidelity: existing voice, primary, and image PNG assets remain in use; no replacement graphics were introduced.
- Copy and content: the typed prompt remains visible and the button labels are unchanged.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested input and button correction.
- Filled input, prompt visibility, button spacing, and button hit-area alignment were verified.
- Page console errors and warnings: none.

## 2026-07-10 Hatch Egg Coverage Pass

- Source visual truth: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\reference-grass-ring-visible.png
- Implementation screenshot: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\runtime-hatch-egg-cover-v8-playwright.png
- Focused comparison: D:\ai.project\DinoDoo\design\generated\independent-elements-v1\compare-egg-grass-ring-v8.png
- Viewport: 390 x 844
- Route/state: /#hatch, idle egg state

### Comparison History

- Earlier P2 finding: the background grass pedestal remained visible below the independent egg-and-rock asset, creating a duplicated platform.
- Fix: kept the source asset aspect ratio and changed the rendered box from x=76, y=202, 238x297 to x=50, y=192, 290x362.
- Post-fix evidence: the visible alpha region now spans approximately y=250.1 through y=500.0; the control panel begins at y=506, leaving a 6px visual gap with no grass-ring exposure.

### Fidelity Surfaces

- Fonts and typography: unchanged by this pass.
- Spacing and layout rhythm: egg top remains visually aligned; rock base covers the background ring without touching the panel.
- Colors and visual tokens: unchanged; existing environment and asset palette preserved.
- Image quality and asset fidelity: original transparent egg-source.png is used without distortion or synthetic masking.
- Copy and content: unchanged.

### Findings

- No actionable P0, P1, or P2 findings remain for the requested grass-ring coverage.
- Focused before/after comparison confirms the duplicate background platform is no longer visible.
- Browser console errors and warnings: none.

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
- Realigned the bottom navigation icons and labels so each icon is centered in its raised pad and each label sits on a shared bottom text band.
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

final result: passed


---

# Works Carousel Product Design QA - 2026-07-12

## Evidence

- Reference: `C:/Users/65420/AppData/Local/Temp/codex-clipboard-e5f52458-2ded-440c-898e-79f8dfacad5e.png`
- Implementation: `design/generated/works-carousel-v1/assembled-preview-first.png`
- Side-by-side comparison: `design/generated/works-carousel-v1/design-qa-comparison.png`
- Viewport: 390 x 844 application frame

## Visual Review

- Header logo, music control, subtitle plaque, tropical workshop background, cream-clay surfaces, and fixed navigation retain the established visual language.
- The fixed three-card collage is replaced by one centered portrait card with stable dinosaur, name, and two-line description slots.
- Previous and next controls are symmetrical, fully visible, and use one independent cream-clay raster asset.
- Current/total count and paw indicators are centered between paging controls.
- Refresh action is isolated below the pager and does not overlap card content or navigation.
- No P0, P1, or P2 clipping, overlap, alignment, contrast, or interaction findings remain.

## Interaction Review

- Next advances 1 / 3 -> 2 / 3 -> 3 / 3.
- Next wraps 3 / 3 -> 1 / 3.
- Previous wraps 1 / 3 -> 3 / 3.
- Refresh keeps the Works route and retains a valid focused page.
- One active page indicator is present for every state.

final result: passed


---

# Works Content Alignment QA - 2026-07-13

- Evidence: `design/generated/works-carousel-v1/assembled-preview-layout-v2.png`
- Dinosaur artwork is centered in a 116 x 132 fixed slot and remains inside the blue display area.
- Title uses a dedicated 22px line; description uses a separate 32px two-line slot.
- Long generation prompts remove trailing English metadata and remain clear of the decorative flower and card border.
- Chinese dinosaur keywords map triceratops, long-neck dinosaurs, and tyrannosaurs to matching transparent assets.
- Browser structural check on page 3 confirmed `dinoAdai`, title `?????`, a 190 x 32 description box, and no overlap.

final result: passed
