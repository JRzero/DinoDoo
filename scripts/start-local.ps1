param(
    [ValidateSet("api", "h5", "all")]
    [string]$Profile = "all",

    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

if ($Profile -eq "h5") {
    Write-Step "H5 is served by the DinoDoo API. Starting all."
    $Profile = "all"
}

if ($Profile -eq "api" -or $Profile -eq "all") {
    Set-Location -LiteralPath (Join-Path $Root "server")
    $env:PORT = "$Port"
    Write-Step "Starting DinoDoo API + H5 on http://localhost:$Port"
    go run ./cmd/api
}
