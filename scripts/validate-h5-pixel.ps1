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

$screenAssets = @(
  @{ Path = "apps\h5\assets\home-final-390.png"; Width = 390; Height = 844 },
  @{ Path = "apps\h5\assets\screen-story-390.png"; Width = 390; Height = 844 },
  @{ Path = "apps\h5\assets\screen-works-390.png"; Width = 390; Height = 844 },
  @{ Path = "apps\h5\assets\screen-hatch-390.png"; Width = 390; Height = 844 },
  @{ Path = "apps\h5\assets\screen-parent-390.png"; Width = 390; Height = 844 }
)

foreach ($asset in $screenAssets) {
  $path = Join-Path $root $asset.Path
  if (-not (Test-Path $path)) {
    throw "Missing required H5 pixel asset: $($asset.Path)"
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
$componentBuildScript = Read-Text "scripts\build-h5-component-assets.ps1"
$verifyCapturesScript = Read-Text "scripts\verify-h5-browser-captures.ps1"
$compareCapturesScript = Read-Text "scripts\compare-h5-browser-captures.ps1"
$runStaticChecksScript = Read-Text "scripts\run-h5-static-checks.ps1"
$designQaGateScript = Read-Text "scripts\assert-design-qa-gate.ps1"
$qaReadme = Read-Text "qa\README.md"

Assert-NotContains $index 'src="/assets/components/' 'index.html still mounts component visual slices; runtime visuals should be drawn by sceneCanvas/navCanvas only.'

foreach ($asset in $screenAssets) {
  $url = "/" + ($asset.Path -replace "\\", "/")
  $url = $url.Replace("/apps/h5", "")
  Assert-NotContains $index $url "index.html still uses full-screen visual base as an implementation image: $url"
}

$legacyScreenRefs = @(
  'src="/assets/home-final.png"',
  'src="/assets/screen-story.png"',
  'src="/assets/screen-works.png"',
  'src="/assets/screen-hatch.png"',
  'src="/assets/screen-parent.png"'
)

foreach ($ref in $legacyScreenRefs) {
  Assert-NotContains $index $ref "index.html still references non-normalized visual base $ref"
}

Assert-Contains $styles "width: min(100vw, 390px);" "H5 shell is not constrained to the 390px pixel model."
Assert-Contains $styles "--nav-h: 160px;" "Bottom navigation is not fixed to the 160px component height."
Assert-Contains $index 'id="sceneCanvas"' "H5 stage is not rendered through the main scene canvas."
Assert-Contains $index 'id="navCanvas"' "Bottom navigation is not separated into its own canvas layer."
Assert-Contains $styles ".scene-canvas" "Main canvas layer styling is missing."
Assert-Contains $styles ".nav-canvas" "Independent bottom navigation canvas styling is missing."
Assert-Contains $app 'nav: "/assets/nav-strip.png"' "Bottom navigation canvas does not use the continuous nav strip source."
Assert-Contains $styles "width: 130px;" "Bottom navigation buttons are not locked to one uniform size."
Assert-Contains $styles ".nav-button" "Bottom navigation buttons are missing their uniform hotspot styling."
Assert-Contains $styles ".nav-label" "Bottom navigation labels are missing accessible text anchors."
Assert-Contains $styles "pointer-events: none;" "Canvas visual layers should not block the HTML interaction layer."
Assert-Contains $styles ".component-page" "H5 pages are missing the interaction-layer containers."
Assert-Contains $styles ".image-button" "Clickable visual hotspots are missing transparent button styling."
Assert-Contains $styles ".hatch-prompt-input.has-value" "Hatch prompt does not expose a populated-state backing."
Assert-Contains $styles "background: transparent;" "Transparent default overlays are missing."

Assert-Contains $index 'id="galleryTab"' "Bottom nav is missing gallery tab."
Assert-Contains $index 'id="hatchTab"' "Bottom nav is missing hatch tab."
Assert-Contains $index 'id="parentTab"' "Bottom nav is missing parent tab."
Assert-Matches $index '<button\s+id="galleryTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Gallery tab is missing its visible label element."
Assert-Matches $index '<button\s+id="hatchTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Hatch tab is missing its visible label element."
Assert-Matches $index '<button\s+id="parentTab"[\s\S]*?<span\s+class="nav-label">[\s\S]*?</span>[\s\S]*?</button>' "Parent tab is missing its visible label element."
Assert-NotContains $index "创造" "H5 markup still contains obsolete create wording."

Assert-Contains $app "backendItems = options.showBackend ? list : []" "Gallery backend artifacts can still pollute the default pixel state."
Assert-Contains $app 'loadArtifacts({ showBackend: true })' "Gallery backend reveal path is missing."
Assert-Contains $app 'loadArtifacts({ showBackend: false })' "Hatching gallery refresh should keep backend history hidden by default."
Assert-Contains $app 'localStorage.getItem("dinodoo_hatched_dinos")' "Local hatching persistence is missing."
Assert-Contains $app "const screenRoutes" "H5 QA route map is missing."
Assert-Contains $app "canvasSources" "H5 app does not define canvas visual sources."
Assert-Contains $app "drawStage" "H5 app does not redraw the canvas scene."
Assert-Contains $app "drawNavCanvas" "H5 app does not draw the independent bottom navigation canvas."
Assert-Contains $app 'document.body.classList.add("home-mode", "canvas-mode")' "H5 app is not running in canvas rendering mode."
Assert-Contains $app "applyRouteFromHash" "H5 QA hash route handler is missing."
Assert-Contains $app 'window.addEventListener("hashchange", applyRouteFromHash)' "H5 QA hash route listener is missing."
Assert-NotContains $app "创造" "H5 behavior still contains obsolete create wording."

Assert-Contains $captureScript 'await import("playwright")' "Browser QA capture script does not dynamically import Playwright."
Assert-Contains $componentBuildScript "components" "Component asset build script does not write to the component asset directory."
Assert-Contains $componentBuildScript "home-final-390.png" "Component asset build script does not slice the home reference."
Assert-Contains $componentBuildScript "screen-hatch-390.png" "Component asset build script does not slice the hatching reference."
Assert-Contains $captureScript "viewport: { width: 390, height: 844 }" "Browser QA capture script does not use the normalized viewport."
Assert-Contains $captureScript "comparison.png" "Browser QA capture script does not produce a comparison screenshot."
Assert-Contains $captureScript 'window.localStorage.removeItem("dinodoo_hatched_dinos")' "Browser QA capture script does not clear local hatching state for deterministic default screenshots."
Assert-Contains $captureScript "page.waitForFunction" "Browser QA capture script does not wait for deterministic render readiness."
Assert-Contains $captureScript "imagesReady" "Browser QA capture script does not wait for image assets to load."
Assert-Contains $captureScript "Math.abs(box.width - 390) <= 0.5" "Browser QA capture script does not wait for shell width tolerance."
Assert-Contains $captureScript "Math.abs(box.height - 844) <= 0.5" "Browser QA capture script does not wait for shell height tolerance."
Assert-Contains $captureScript 'document.querySelector("#app")' "Browser QA capture script does not record runtime shell metrics."
Assert-Contains $captureScript 'activeScreenId: document.querySelector(".screen.active")?.id || null' "Browser QA capture script does not record active screen state."
Assert-Contains $captureScript 'expectedScreenId: state.screenId' "Browser QA capture script does not write expected screen ids."
Assert-Contains $captureScript 'expectedBodyMode: state.bodyMode' "Browser QA capture script does not write expected body modes."
Assert-Contains $verifyCapturesScript '$expectedStates = @("home", "story", "hatch", "works", "parent")' "Browser QA evidence verifier does not cover every QA state."
Assert-Contains $verifyCapturesScript '$image.Width -ne 390 -or $image.Height -ne 844' "Browser QA evidence verifier does not enforce screenshot dimensions."
Assert-Contains $verifyCapturesScript "runtime.shell.width" "Browser QA evidence verifier does not enforce runtime shell dimensions."
Assert-Contains $verifyCapturesScript "runtime.activeScreenId" "Browser QA evidence verifier does not enforce active screen state."
Assert-Contains $verifyCapturesScript "expectedBodyMode" "Browser QA evidence verifier does not enforce body mode state."
Assert-Contains $compareCapturesScript "diff-report.json" "Browser QA diff script does not produce a JSON report."
Assert-Contains $compareCapturesScript "diff-summary.html" "Browser QA diff script does not produce a visual summary page."
Assert-Contains $compareCapturesScript "changed_ratio" "Browser QA diff script does not report changed pixel ratios."
Assert-Contains $compareCapturesScript '$tolerance = 3' "Browser QA diff script does not define a pixel tolerance."
Assert-Contains $runStaticChecksScript 'Invoke-OpenSpecValidate "add-prompt-dino-hatching"' "Static check runner does not validate the hatching OpenSpec change."
Assert-Contains $runStaticChecksScript "go test ./..." "Static check runner does not run backend tests."
Assert-Contains $runStaticChecksScript '"/#home", "/#story", "/#hatch", "/#works", "/#parent"' "Static check runner does not verify every QA hash URL."
Assert-Contains $runStaticChecksScript "scripts\assert-design-qa-gate.ps1" "Static check runner does not enforce the design QA gate."
Assert-Contains $designQaGateScript "design-qa.md says passed" "Design QA gate does not reject passed status without browser evidence."
Assert-Contains $designQaGateScript "still contains P0/P1/P2 findings" "Design QA gate does not reject passed status with blocking findings."
Assert-Contains $designQaGateScript '$finalResultMatches.Count -ne 1' "Design QA gate does not enforce a single final result."
Assert-Contains $designQaGateScript "Browser screenshot comparison is missing" "Design QA gate does not require blocked screenshot evidence."
Assert-Contains $qaReadme "Product Design rules require explicit user approval before Playwright is used." "QA README does not document the Playwright approval boundary."
Assert-Contains $qaReadme "final result: passed" "QA README does not document the pass criteria."

Write-Output "H5 pixel static preflight passed."
