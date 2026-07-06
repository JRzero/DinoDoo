$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$qaPath = Join-Path $root "design-qa.md"
$browserQaDir = Join-Path $root "qa\browser"

function Assert-Contains($text, $needle, $message) {
  if (-not $text.Contains($needle)) {
    throw $message
  }
}

if (-not (Test-Path $qaPath)) {
  throw "design-qa.md is missing."
}

$qa = Get-Content -Raw -Encoding UTF8 $qaPath
$finalResultMatches = [regex]::Matches($qa, "final result:\s*(passed|blocked)")
if ($finalResultMatches.Count -ne 1) {
  throw "design-qa.md must contain exactly one final result: passed or final result: blocked."
}

if ($qa -match "final result:\s*passed") {
  if ($qa -match "\[(P0|P1|P2)\]") {
    throw "design-qa.md says passed, but still contains P0/P1/P2 findings."
  }

  $requiredFiles = @(
    "manifest.json",
    "comparison.png",
    "comparison.html",
    "diff-report.json",
    "diff-summary.html",
    "home.png",
    "story.png",
    "hatch.png",
    "works.png",
    "parent.png"
  )

  foreach ($file in $requiredFiles) {
    $path = Join-Path $browserQaDir $file
    if (-not (Test-Path $path)) {
      throw "design-qa.md says passed, but browser QA evidence is missing: qa/browser/$file"
    }
  }

  & (Join-Path $root "scripts\verify-h5-browser-captures.ps1")
  & (Join-Path $root "scripts\compare-h5-browser-captures.ps1")
  Write-Output "Design QA passed gate verified."
  exit 0
}

if ($qa -match "final result:\s*blocked") {
  Assert-Contains $qa "Browser screenshot comparison is missing" "design-qa.md is blocked but does not name the browser screenshot blocker."
  Assert-Contains $qa "Product Design rules require explicit user approval before using Playwright" "design-qa.md is blocked but does not document the Playwright approval boundary."
  Write-Output "Design QA blocked gate verified."
  exit 0
}

throw "design-qa.md must contain exactly one final result: passed or final result: blocked."
