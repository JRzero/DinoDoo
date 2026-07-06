# DinoDoo H5 Pixel QA

This folder keeps the visual evidence for the Product Design pixel-fidelity gate.

## Static Evidence

- `static-source-vs-bases.png` compares the selected source design with the normalized H5 visual bases.
- `scripts\validate-h5-pixel.ps1` verifies static preconditions:
  - all five H5 screen bases are `390 x 844`
  - `index.html` references the normalized bases
  - the H5 shell is constrained to the 390px pixel model
  - prompt hatching, gallery default state, and QA hash routes are wired
  - browser capture and evidence verifier scripts exist

Run static preflight from the project root:

```powershell
.\scripts\validate-h5-pixel.ps1
```

Run the full non-browser verification matrix with:

```powershell
.\scripts\run-h5-static-checks.ps1
```

The matrix includes `.\scripts\assert-design-qa-gate.ps1`, which keeps `design-qa.md` blocked until browser evidence exists, and requires complete browser evidence before a passed QA state is accepted.
It also requires `design-qa.md` to contain exactly one `final result:` line.
If `design-qa.md` says `final result: passed`, the gate also fails when any `[P0]`, `[P1]`, or `[P2]` finding remains.

## Browser Evidence

Product Design rules require explicit user approval before Playwright is used.

After approval, run:

```powershell
node scripts\capture-h5-pixel-playwright.mjs
.\scripts\verify-h5-browser-captures.ps1
.\scripts\compare-h5-browser-captures.ps1
```

Expected browser outputs:

- `qa/browser/home.png`
- `qa/browser/story.png`
- `qa/browser/hatch.png`
- `qa/browser/works.png`
- `qa/browser/parent.png`
- `qa/browser/manifest.json`
- `qa/browser/comparison.html`
- `qa/browser/comparison.png`
- `qa/browser/diff-report.json`
- `qa/browser/diff-summary.html`
- `qa/browser/diff/*-diff.png`

The five screenshots must be captured at `390 x 844` from:

- `http://localhost:8080/#home`
- `http://localhost:8080/#story`
- `http://localhost:8080/#hatch`
- `http://localhost:8080/#works`
- `http://localhost:8080/#parent`

The capture script clears `dinodoo_hatched_dinos` from `localStorage` before page scripts run, so default browser screenshots are not polluted by earlier manual hatching.
It also waits for the expected screen, body mode, `390 x 844` shell within a `0.5px` tolerance, and loaded images before taking each screenshot.

## Pass Criteria

`design-qa.md` can change from `final result: blocked` to `final result: passed` only after:

- Browser screenshots exist for all five QA states.
- `.\scripts\verify-h5-browser-captures.ps1` passes, including screenshot size, hash, active screen state, body mode, and runtime `#app` shell size checks at `390 x 844`.
- `.\scripts\compare-h5-browser-captures.ps1` produces `qa/browser/diff-report.json`.
- `qa/browser/comparison.png` has been inspected against the source visual bases.
- `qa/browser/diff-summary.html` has been inspected for side-by-side source, browser, and diff evidence.
- The per-screen diff images have been inspected for meaningful visual drift.
- No P0/P1/P2 fidelity findings remain for typography, spacing, colors, image quality, copy, crop, or default dynamic overlays.
