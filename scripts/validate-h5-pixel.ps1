$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Read-Text($relativePath) {
  Get-Content -Raw -Encoding UTF8 (Join-Path $root $relativePath)
}

function Assert-Contains($text, $needle, $message) {
  if (-not $text.Contains($needle)) {
    throw $message
  }
}

function Assert-NotContains($text, $needle, $message) {
  if ($text.Contains($needle)) {
    throw $message
  }
}

function Assert-Matches($text, $pattern, $message) {
  if ($text -notmatch $pattern) {
    throw $message
  }
}

Add-Type -AssemblyName System.Drawing

$assetDimensions = @(
  @{ Path = "apps\h5\assets\game-elements\backgrounds\home-clean.png"; Width = 390; Height = 684 },
  @{ Path = "apps\h5\assets\game-elements\backgrounds\story-clean.png"; Width = 390; Height = 684 },
  @{ Path = "apps\h5\assets\game-elements\backgrounds\hatch-clean.png"; Width = 390; Height = 684 },
  @{ Path = "apps\h5\assets\game-elements\backgrounds\works-clean.png"; Width = 390; Height = 684 },
  @{ Path = "apps\h5\assets\game-elements\backgrounds\parent-clean.png"; Width = 390; Height = 684 },
  @{ Path = "apps\h5\assets\game-elements\home\home-logo.png"; Width = 350; Height = 145 },
  @{ Path = "apps\h5\assets\game-elements\home\dino-xiaobao.png"; Width = 240; Height = 280 },
  @{ Path = "apps\h5\assets\game-elements\home\dino-adai.png"; Width = 230; Height = 250 },
  @{ Path = "apps\h5\assets\game-elements\home\dino-gulu.png"; Width = 240; Height = 260 },
  @{ Path = "apps\h5\assets\game-elements\home\badge-xiaobao.png"; Width = 140; Height = 54 },
  @{ Path = "apps\h5\assets\game-elements\home\badge-adai.png"; Width = 140; Height = 54 },
  @{ Path = "apps\h5\assets\game-elements\home\badge-gulu.png"; Width = 140; Height = 54 },
  @{ Path = "apps\h5\assets\game-elements\nav\nav-bg.png"; Width = 390; Height = 160 },
  @{ Path = "apps\h5\assets\game-elements\nav\nav-works.png"; Width = 120; Height = 100 },
  @{ Path = "apps\h5\assets\game-elements\nav\nav-hatch.png"; Width = 140; Height = 120 },
  @{ Path = "apps\h5\assets\game-elements\nav\nav-parent.png"; Width = 120; Height = 100 },
  @{ Path = "apps\h5\assets\game-elements\hatch\egg-idle.png"; Width = 240; Height = 280 },
  @{ Path = "apps\h5\assets\game-elements\hatch\egg-cracking.png"; Width = 260; Height = 300 },
  @{ Path = "apps\h5\assets\game-elements\hatch\egg-success.png"; Width = 260; Height = 300 },
  @{ Path = "apps\h5\assets\game-elements\hatch\hatch-input-panel.png"; Width = 320; Height = 160 },
  @{ Path = "apps\h5\assets\game-elements\hatch\status-recording.png"; Width = 180; Height = 44 },
  @{ Path = "apps\h5\assets\game-elements\hatch\status-image-selected.png"; Width = 180; Height = 44 },
  @{ Path = "apps\h5\assets\game-elements\works\works-board.png"; Width = 310; Height = 468 },
  @{ Path = "apps\h5\assets\game-elements\works\work-card-featured.png"; Width = 280; Height = 220 },
  @{ Path = "apps\h5\assets\game-elements\works\work-card-normal.png"; Width = 135; Height = 190 },
  @{ Path = "apps\h5\assets\game-elements\parent\parent-board.png"; Width = 314; Height = 468 },
  @{ Path = "apps\h5\assets\game-elements\parent\row-sound.png"; Width = 280; Height = 72 },
  @{ Path = "apps\h5\assets\game-elements\parent\row-image.png"; Width = 280; Height = 72 },
  @{ Path = "apps\h5\assets\game-elements\parent\row-music.png"; Width = 280; Height = 72 }
)

foreach ($asset in $assetDimensions) {
  $path = Join-Path $root $asset.Path
  if (-not (Test-Path $path)) {
    throw "Missing required H5 element asset: $($asset.Path)"
  }

  $image = [System.Drawing.Image]::FromFile($path)
  try {
    if ($image.Width -ne $asset.Width -or $image.Height -ne $asset.Height) {
      throw "Unexpected size for $($asset.Path): $($image.Width)x$($image.Height), expected $($asset.Width)x$($asset.Height)"
    }
  } finally {
    $image.Dispose()
  }
}

$index = Read-Text "apps\h5\index.html"
$styles = Read-Text "apps\h5\styles.css"
$app = Read-Text "apps\h5\app.js"
$captureScript = Read-Text "scripts\capture-h5-pixel-playwright.mjs"
$verifyCapturesScript = Read-Text "scripts\verify-h5-browser-captures.ps1"
$compareCapturesScript = Read-Text "scripts\compare-h5-browser-captures.ps1"
$runStaticChecksScript = Read-Text "scripts\run-h5-static-checks.ps1"
$componentBuildScript = Read-Text "scripts\build-h5-component-assets.ps1"
$designQaGateScript = Read-Text "scripts\assert-design-qa-gate.ps1"
$qaReadme = Read-Text "qa\README.md"

Assert-NotContains $index "<canvas" "H5 must assemble mini-game element assets as DOM image layers, not canvas-composited scenes."
Assert-NotContains $app "getContext" "H5 app still opens a canvas context."
Assert-NotContains $app "drawImage" "H5 app still draws assets into a canvas instead of composing image elements."
Assert-NotContains $app "runtime-preview" "H5 app must not use runtime preview screenshots as implementation assets."
Assert-NotContains $app 'img("homePath"' "Home runtime should not redraw path stones already present in the clean scene background."
Assert-NotContains $app 'img("pedestal' "Home runtime should not redraw separate pedestal patches over the background circles."
Assert-NotContains $index 'src="/assets/components/' "index.html still mounts component visual slices. Runtime should use the mini-game element library."

$legacyScreenRefs = @(
  'src="/assets/home-final.png"',
  'src="/assets/home-final-390.png"',
  'src="/assets/screen-story.png"',
  'src="/assets/screen-story-390.png"',
  'src="/assets/screen-works.png"',
  'src="/assets/screen-works-390.png"',
  'src="/assets/screen-hatch.png"',
  'src="/assets/screen-hatch-390.png"',
  'src="/assets/screen-parent.png"',
  'src="/assets/screen-parent-390.png"'
)

foreach ($ref in $legacyScreenRefs) {
  Assert-NotContains $index $ref "index.html still uses a full-screen visual base as an implementation image: $ref"
  Assert-NotContains $app $ref "app.js still uses a full-screen visual base as an implementation image: $ref"
}

Assert-Contains $styles "width: min(100vw, 390px);" "H5 shell is not constrained to the 390px pixel model."
Assert-Contains $styles "--nav-h: 160px;" "Bottom navigation is not fixed to the 160px component height."
Assert-Contains $index 'id="sceneLayer"' "H5 stage is missing the element asset scene layer."
Assert-Contains $index 'id="navLayer"' "Bottom navigation is missing the element asset layer."
Assert-Contains $styles ".scene-layer" "Main asset layer styling is missing."
Assert-Contains $styles ".nav-art" "Independent bottom navigation asset layer styling is missing."
Assert-Contains $styles ".scene-art" "Scene image element styling is missing."
Assert-Contains $styles ".nav-art-img" "Nav image element styling is missing."
Assert-Contains $styles "pointer-events: none;" "Visual asset layers should not block the HTML interaction layer."
Assert-Contains $styles ".component-page" "H5 pages are missing interaction-layer containers."
Assert-Contains $styles ".image-button" "Clickable visual hotspots are missing transparent button styling."
Assert-Contains $styles ".hatch-prompt-input.has-value" "Hatch prompt does not expose a populated-state backing."
Assert-Contains $styles ".hatch-image" "Hatch image button hotspot styling is missing."
Assert-Contains $styles ".nav-button" "Bottom navigation buttons are missing their uniform hotspot styling."
Assert-Contains $styles "width: 130px;" "Bottom navigation buttons are not locked to one uniform size."
Assert-Contains $styles ".nav-label" "Bottom navigation labels are missing accessible text anchors."
Assert-Contains $styles "background: transparent;" "Transparent interaction overlays are missing."

Assert-Contains $index 'id="galleryTab"' "Bottom nav is missing gallery tab."
Assert-Contains $index 'id="hatchTab"' "Bottom nav is missing hatch tab."
Assert-Contains $index 'id="parentTab"' "Bottom nav is missing parent tab."
Assert-Contains $index 'id="hatchImageButton"' "Hatch image button hotspot is missing."
Assert-Matches $index '<button\s+id="galleryTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Gallery tab is missing its accessible label element."
Assert-Matches $index '<button\s+id="hatchTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Hatch tab is missing its accessible label element."
Assert-Matches $index '<button\s+id="parentTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Parent tab is missing its accessible label element."

Assert-Contains $app "const assetSources" "H5 app does not define the mini-game element asset source map."
Assert-Contains $app '`${GE}/backgrounds/home-clean.png`' "Home clean background is not sourced from the element library."
Assert-Contains $app '`${GE}/home/dino-xiaobao.png`' "Home dinosaur sprite is not sourced from the element library."
Assert-Contains $app '`${GE}/nav/nav-bg.png`' "Bottom nav base is not sourced from the element library."
Assert-Contains $app 'document.createElement("img")' "H5 app does not create independent image elements for assets."
Assert-Contains $app "el.dataset.asset = key" "Rendered asset elements are not tagged with data-asset for inspection."
Assert-Contains $app "drawNavLayer" "H5 app does not render the independent bottom navigation asset layer."
Assert-Contains $app "loadAssetImages" "H5 app does not preload the element asset library."
Assert-Contains $app 'document.body.classList.add("home-mode", "asset-mode")' "H5 app is not running in asset composition mode."
Assert-Contains $app "applyRouteFromHash" "H5 QA hash route handler is missing."
Assert-Contains $app 'window.addEventListener("hashchange", applyRouteFromHash)' "H5 QA hash route listener is missing."
Assert-Contains $app "backendItems = options.showBackend ? list : []" "Gallery backend artifacts can still pollute the default pixel state."
Assert-Contains $app 'loadArtifacts({ showBackend: true })' "Gallery backend reveal path is missing."
Assert-Contains $app 'loadArtifacts({ showBackend: false })' "Hatching gallery refresh should keep backend history hidden by default."
Assert-Contains $app 'localStorage.getItem("dinodoo_hatched_dinos")' "Local hatching persistence is missing."
Assert-Contains $app "hatchStatusImageSelected" "Hatch selected-image status asset is missing from runtime."
Assert-Contains $app "hatchStatusRecording" "Hatch recording status asset is missing from runtime."
Assert-Contains $app 'setAction("hatch:image")' "Hatch image button does not expose a testable action."

Assert-Contains $captureScript 'await import("playwright")' "Browser QA capture script does not dynamically import Playwright."
Assert-Contains $captureScript "viewport: { width: 390, height: 844 }" "Browser QA capture script does not use the normalized viewport."
Assert-Contains $captureScript "comparison.png" "Browser QA capture script does not produce a comparison screenshot."
Assert-Contains $captureScript 'window.localStorage.removeItem("dinodoo_hatched_dinos")' "Browser QA capture script does not clear local hatching state for deterministic default screenshots."
Assert-Contains $captureScript "page.waitForFunction" "Browser QA capture script does not wait for deterministic render readiness."
Assert-Contains $captureScript "imagesReady" "Browser QA capture script does not wait for image assets to load."
Assert-Contains $captureScript "Math.abs(box.width - 390) <= 0.5" "Browser QA capture script does not wait for shell width tolerance."
Assert-Contains $captureScript "Math.abs(box.height - 844) <= 0.5" "Browser QA capture script does not wait for shell height tolerance."
Assert-Contains $captureScript 'document.querySelector("#app")' "Browser QA capture script does not record runtime shell metrics."
Assert-Contains $captureScript 'activeScreenId: document.querySelector(".screen.active")?.id || null' "Browser QA capture script does not record active screen state."
Assert-Contains $verifyCapturesScript '$expectedStates = @("home", "story", "hatch", "works", "parent")' "Browser QA evidence verifier does not cover every QA state."
Assert-Contains $verifyCapturesScript '$image.Width -ne 390 -or $image.Height -ne 844' "Browser QA evidence verifier does not enforce screenshot dimensions."
Assert-Contains $compareCapturesScript "diff-report.json" "Browser QA diff script does not produce a JSON report."
Assert-Contains $compareCapturesScript "changed_ratio" "Browser QA diff script does not report changed pixel ratios."
Assert-Contains $runStaticChecksScript 'Invoke-OpenSpecValidate "add-prompt-dino-hatching"' "Static check runner does not validate the hatching OpenSpec change."
Assert-Contains $runStaticChecksScript "go test ./..." "Static check runner does not run backend tests."
Assert-Contains $runStaticChecksScript '"/#home", "/#story", "/#hatch", "/#works", "/#parent"' "Static check runner does not verify every QA hash URL."
Assert-Contains $runStaticChecksScript "scripts\assert-design-qa-gate.ps1" "Static check runner does not enforce the design QA gate."
Assert-Contains $componentBuildScript "H5 element asset library validated" "H5 component build entrypoint should validate the element library instead of slicing full screenshots."
Assert-NotContains $componentBuildScript "home-final-390.png" "H5 component build entrypoint must not crop from full home screenshots."
Assert-NotContains $componentBuildScript "screen-story-390.png" "H5 component build entrypoint must not crop from full page screenshots."
Assert-Contains $designQaGateScript "design-qa.md says passed" "Design QA gate does not reject passed status without browser evidence."
Assert-Contains $qaReadme "Product Design rules require explicit user approval before Playwright is used." "QA README does not document the Playwright approval boundary."
Assert-Contains $qaReadme "final result: passed" "QA README does not document the pass criteria."

Write-Output "H5 element asset static preflight passed."
