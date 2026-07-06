$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$browserQaDir = Join-Path $root "qa\browser"
$manifestPath = Join-Path $browserQaDir "manifest.json"
$comparisonPng = Join-Path $browserQaDir "comparison.png"
$comparisonHtml = Join-Path $browserQaDir "comparison.html"

function Assert-Exists($path, $message) {
  if (-not (Test-Path $path)) {
    throw $message
  }
}

Assert-Exists $browserQaDir "Browser QA directory is missing. Run the Playwright capture script after approval."
Assert-Exists $manifestPath "Browser QA manifest is missing."
Assert-Exists $comparisonPng "Browser QA comparison.png is missing."
Assert-Exists $comparisonHtml "Browser QA comparison.html is missing."

$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
if ($manifest.viewport.width -ne 390 -or $manifest.viewport.height -ne 844) {
  throw "Unexpected browser QA viewport: $($manifest.viewport.width)x$($manifest.viewport.height), expected 390x844."
}

$expectedStates = @("home", "story", "hatch", "works", "parent")
$stateNames = @($manifest.states | ForEach-Object { $_.name })
foreach ($name in $expectedStates) {
  if ($stateNames -notcontains $name) {
    throw "Browser QA manifest is missing state: $name"
  }
}

Add-Type -AssemblyName System.Drawing

foreach ($state in $manifest.states) {
  if ($null -eq $state.runtime -or $null -eq $state.runtime.shell) {
    throw "Browser QA runtime shell metrics are missing for state: $($state.name)"
  }
  if ([string]::IsNullOrWhiteSpace($state.expectedScreenId)) {
    throw "Browser QA expected screen id is missing for state: $($state.name)"
  }
  if ($state.runtime.hash -ne "#$($state.name)") {
    throw "Unexpected runtime hash for $($state.name): $($state.runtime.hash), expected #$($state.name)."
  }
  if ($state.runtime.activeScreenId -ne $state.expectedScreenId) {
    throw "Unexpected active screen for $($state.name): $($state.runtime.activeScreenId), expected $($state.expectedScreenId)."
  }
  if ([string]::IsNullOrWhiteSpace($state.expectedBodyMode)) {
    throw "Browser QA expected body mode is missing for state: $($state.name)"
  }
  if (-not [string]::IsNullOrWhiteSpace($state.expectedBodyMode) -and $state.runtime.bodyClass -notmatch "(^|\s)$([regex]::Escape($state.expectedBodyMode))(\s|$)") {
    throw "Unexpected body mode for $($state.name): '$($state.runtime.bodyClass)', expected to include '$($state.expectedBodyMode)'."
  }
  if ($state.runtime.bodyClass -notmatch "(^|\s)asset-mode(\s|$)") {
    throw "Browser QA state $($state.name) is not using asset composition mode: '$($state.runtime.bodyClass)'."
  }
  if ($state.runtime.sceneAssetCount -lt 1) {
    throw "Browser QA state $($state.name) has no scene element assets."
  }
  if ($state.runtime.navAssetCount -lt 7) {
    throw "Browser QA state $($state.name) has incomplete nav element assets: $($state.runtime.navAssetCount)."
  }
  if ([Math]::Abs($state.runtime.shell.width - 390) -gt 0.5 -or [Math]::Abs($state.runtime.shell.height - 844) -gt 0.5) {
    throw "Unexpected runtime shell size for $($state.name): $($state.runtime.shell.width)x$($state.runtime.shell.height), expected 390x844."
  }
  $screenshotPath = Join-Path $root $state.screenshot
  Assert-Exists $screenshotPath "Browser QA screenshot is missing: $($state.screenshot)"
  $image = [System.Drawing.Image]::FromFile($screenshotPath)
  try {
    if ($image.Width -ne 390 -or $image.Height -ne 844) {
      throw "Unexpected screenshot size for $($state.name): $($image.Width)x$($image.Height), expected 390x844."
    }
  } finally {
    $image.Dispose()
  }
}

Write-Output "H5 browser capture evidence passed."
