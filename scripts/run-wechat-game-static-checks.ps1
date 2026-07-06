$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$gameRoot = Join-Path $root "apps\wechat-game"
function Invoke-OpenSpecValidate($changeId) {
  $command = Get-Command openspec.cmd -ErrorAction SilentlyContinue
  if (-not $command) {
    $command = Get-Command openspec -ErrorAction SilentlyContinue
  }
  $commandPath = if ($command) { $command.Source } else { Join-Path $env:APPDATA "npm\openspec.cmd" }
  if (-not (Test-Path $commandPath)) {
    throw "openspec command not found. Expected openspec.cmd on PATH or at $commandPath"
  }
  & $commandPath validate $changeId --strict
}

Write-Output "== WeChat Mini Game JavaScript syntax =="
Get-ChildItem -Path $gameRoot -Recurse -Filter *.js | ForEach-Object {
  node --check $_.FullName
}

Write-Output ""
Write-Output "== WeChat Mini Game manifest/static contract =="
Push-Location $root
try {
  node scripts\validate-wechat-game.mjs
} finally {
  Pop-Location
}

Write-Output ""
Write-Output "== WeChat Mini Game interaction contract =="
Push-Location $root
try {
  node scripts\validate-wechat-game-interactions.mjs
} finally {
  Pop-Location
}

Write-Output ""
Write-Output "== OpenSpec WeChat Mini Game change =="
Push-Location $root
try {
  Invoke-OpenSpecValidate "add-wechat-minigame-mvp"
} finally {
  Pop-Location
}

Write-Output ""
Write-Output "WeChat Mini Game static checks passed."