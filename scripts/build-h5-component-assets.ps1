$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$elementRoot = Join-Path $root "apps\h5\assets\game-elements"

$requiredAssets = @(
  "backgrounds\home-clean.png",
  "backgrounds\story-clean.png",
  "backgrounds\hatch-clean.png",
  "backgrounds\works-clean.png",
  "backgrounds\parent-clean.png",
  "home\home-logo.png",
  "home\dino-xiaobao.png",
  "home\dino-adai.png",
  "home\dino-gulu.png",
  "home\badge-xiaobao.png",
  "home\badge-adai.png",
  "home\badge-gulu.png",
  "nav\nav-bg.png",
  "nav\nav-works.png",
  "nav\nav-hatch.png",
  "nav\nav-parent.png",
  "nav\nav-label-works.png",
  "nav\nav-label-hatch.png",
  "nav\nav-label-parent.png",
  "hatch\egg-idle.png",
  "hatch\egg-cracking.png",
  "hatch\egg-success.png",
  "hatch\hatch-input-panel.png",
  "works\works-board.png",
  "parent\parent-board.png"
)

foreach ($asset in $requiredAssets) {
  $path = Join-Path $elementRoot $asset
  if (-not (Test-Path $path)) {
    throw "Missing H5 element-library asset: $asset"
  }
}

Write-Output "H5 element asset library validated: apps\h5\assets\game-elements"
Write-Output "Legacy full-screen component slicing is intentionally disabled. Runtime pages must compose clean backgrounds and independent PNG elements."
