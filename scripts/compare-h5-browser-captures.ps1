$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$browserQaDir = Join-Path $root "qa\browser"
$manifestPath = Join-Path $browserQaDir "manifest.json"
$diffDir = Join-Path $browserQaDir "diff"
$reportPath = Join-Path $browserQaDir "diff-report.json"
$summaryPath = Join-Path $browserQaDir "diff-summary.html"
$tolerance = 3

function Assert-Exists($path, $message) {
  if (-not (Test-Path $path)) {
    throw $message
  }
}

function Color-Delta($a, $b) {
  [Math]::Abs($a.R - $b.R) + [Math]::Abs($a.G - $b.G) + [Math]::Abs($a.B - $b.B) + [Math]::Abs($a.A - $b.A)
}

function Escape-Html($value) {
  [System.Net.WebUtility]::HtmlEncode([string]$value)
}

function Build-SummaryHtml($items) {
  $cards = foreach ($item in $items) {
    $name = Escape-Html $item["name"]
    $source = "../../" + $item["source"]
    $screenshot = Split-Path $item["screenshot"] -Leaf
    $diff = "diff/" + (Split-Path $item["diff"] -Leaf)
    $ratio = [Math]::Round($item["changed_ratio"] * 100, 3)
    $avg = $item["average_delta_changed"]
    $max = $item["max_delta"]
    @"
      <section class="card">
        <h2>$name</h2>
        <p>Changed pixels: $ratio% | Average delta: $avg | Max delta: $max</p>
        <div class="images">
          <figure>
            <figcaption>Source</figcaption>
            <img src="$source" alt="$name source" />
          </figure>
          <figure>
            <figcaption>Browser</figcaption>
            <img src="$screenshot" alt="$name browser screenshot" />
          </figure>
          <figure>
            <figcaption>Diff</figcaption>
            <img src="$diff" alt="$name pixel diff" />
          </figure>
        </div>
      </section>
"@
  }

  @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>DinoDoo H5 Pixel Diff Summary</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, sans-serif;
      color: #172033;
      background: #f4f7fb;
    }
    h1 { margin: 0 0 8px; font-size: 22px; }
    .note { margin: 0 0 22px; color: #526173; }
    .grid {
      display: grid;
      gap: 22px;
    }
    .card {
      padding: 14px;
      border: 1px solid #d9e1ec;
      border-radius: 8px;
      background: #fff;
    }
    h2 { margin: 0 0 6px; font-size: 16px; }
    p { margin: 0 0 12px; color: #526173; font-size: 13px; }
    .images {
      display: grid;
      grid-template-columns: repeat(3, 195px);
      gap: 12px;
    }
    figure { margin: 0; }
    figcaption {
      margin-bottom: 6px;
      color: #607086;
      font-size: 12px;
      font-weight: 700;
    }
    img {
      display: block;
      width: 195px;
      height: 422px;
      object-fit: fill;
      border: 1px solid #ccd6e3;
      background: #d9f3ff;
    }
  </style>
</head>
<body>
  <h1>DinoDoo H5 Pixel Diff Summary</h1>
  <p class="note">Viewport: 390 x 844. Pink marks pixels beyond the configured tolerance.</p>
  <main class="grid">
$($cards -join "`n")
  </main>
</body>
</html>
"@
}

Assert-Exists $manifestPath "Browser QA manifest is missing. Run the Playwright capture script after approval."
New-Item -ItemType Directory -Force $diffDir | Out-Null

$manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
Add-Type -AssemblyName System.Drawing

$report = @()

foreach ($state in $manifest.states) {
  $sourcePath = Join-Path $root $state.source
  $screenshotPath = Join-Path $root $state.screenshot
  Assert-Exists $sourcePath "Source visual base is missing: $($state.source)"
  Assert-Exists $screenshotPath "Browser screenshot is missing: $($state.screenshot)"

  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $shot = [System.Drawing.Bitmap]::FromFile($screenshotPath)
  $diff = $null

  try {
    if ($source.Width -ne $shot.Width -or $source.Height -ne $shot.Height) {
      throw "Size mismatch for $($state.name): source $($source.Width)x$($source.Height), screenshot $($shot.Width)x$($shot.Height)"
    }

    $diff = New-Object System.Drawing.Bitmap($source.Width, $source.Height)
    $changed = 0
    $totalDelta = 0
    $maxDelta = 0
    $pixelCount = $source.Width * $source.Height

    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $a = $source.GetPixel($x, $y)
        $b = $shot.GetPixel($x, $y)
        $delta = Color-Delta $a $b
        if ($delta -gt $maxDelta) {
          $maxDelta = $delta
        }
        if ($delta -gt $tolerance) {
          $changed++
          $totalDelta += $delta
          $diff.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 32, 96))
        } else {
          $gray = [int](($a.R + $a.G + $a.B) / 3)
          $diff.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $gray, $gray, $gray))
        }
      }
    }

    $diffPath = Join-Path $diffDir "$($state.name)-diff.png"
    $diff.Save($diffPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $report += [ordered]@{
      name = $state.name
      source = $state.source
      screenshot = $state.screenshot
      diff = (Resolve-Path $diffPath).Path.Replace($root.Path + "\", "").Replace("\", "/")
      width = $source.Width
      height = $source.Height
      changed_pixels = $changed
      changed_ratio = [Math]::Round($changed / $pixelCount, 6)
      average_delta_changed = if ($changed -gt 0) { [Math]::Round($totalDelta / $changed, 2) } else { 0 }
      max_delta = $maxDelta
      tolerance = $tolerance
    }
  } finally {
    if ($diff -ne $null) {
      $diff.Dispose()
    }
    $source.Dispose()
    $shot.Dispose()
  }
}

$report | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $reportPath
Build-SummaryHtml $report | Set-Content -Encoding UTF8 $summaryPath
Write-Output "H5 browser capture diff report written to $reportPath"
