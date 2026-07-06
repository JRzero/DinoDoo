$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Step($name, $scriptBlock) {
  Write-Output ""
  Write-Output "== $name =="
  & $scriptBlock
}
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

Step "H5 component asset build" {
  & (Join-Path $root "scripts\build-h5-component-assets.ps1")
}

Step "H5 pixel static preflight" {
  & (Join-Path $root "scripts\validate-h5-pixel.ps1")
}

Step "H5 app JavaScript syntax" {
  Push-Location $root
  try {
    node --check apps\h5\app.js
  } finally {
    Pop-Location
  }
}

Step "Playwright capture script syntax" {
  Push-Location $root
  try {
    node --check scripts\capture-h5-pixel-playwright.mjs
    node --check scripts\verify-h5-interactions-playwright.mjs
  } finally {
    Pop-Location
  }
}

Step "Backend Go tests" {
  Push-Location (Join-Path $root "server")
  try {
    go test ./...
  } finally {
    Pop-Location
  }
}

Step "OpenSpec hatching change" {
  Push-Location $root
  try {
    Invoke-OpenSpecValidate "add-prompt-dino-hatching"
  } finally {
    Pop-Location
  }
}

Step "OpenSpec voice/image MVP change" {
  Push-Location $root
  try {
    Invoke-OpenSpecValidate "add-h5-voice-image-mvp"
  } finally {
    Pop-Location
  }
}

Step "Local service health" {
  $health = Invoke-RestMethod http://localhost:8080/health
  if ($health.status -ne "ok") {
    throw "Unexpected health response: $($health | ConvertTo-Json -Compress)"
  }
  Write-Output "health ok"
}

Step "QA hash URLs" {
  @("/#home", "/#story", "/#hatch", "/#works", "/#parent") | ForEach-Object {
    $res = Invoke-WebRequest -Uri "http://localhost:8080$_" -UseBasicParsing
    if ($res.StatusCode -ne 200) {
      throw "Unexpected HTTP status for ${_}: $($res.StatusCode)"
    }
    Write-Output "$_ 200"
  }
}

Step "H5 browser interaction regression" {
  Push-Location $root
  $oldPlaywrightModules = $env:DINODOO_PLAYWRIGHT_NODE_MODULES
  try {
    $localPlaywrightModules = "C:\tmp\dinodoo-playwright\node_modules"
    if (-not $env:DINODOO_PLAYWRIGHT_NODE_MODULES -and (Test-Path $localPlaywrightModules)) {
      $env:DINODOO_PLAYWRIGHT_NODE_MODULES = $localPlaywrightModules
    }
    node scripts\verify-h5-interactions-playwright.mjs
  } finally {
    $env:DINODOO_PLAYWRIGHT_NODE_MODULES = $oldPlaywrightModules
    Pop-Location
  }
}

Step "Design QA gate" {
  & (Join-Path $root "scripts\assert-design-qa-gate.ps1")
}

Write-Output ""
Write-Output "H5 static checks passed."
