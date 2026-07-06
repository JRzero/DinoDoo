$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$gameRoot = Join-Path $root "apps\wechat-game"
$assetRoot = Join-Path $gameRoot "assets"
$h5Components = Join-Path $root "apps\h5\assets\components"

Add-Type -AssemblyName System.Drawing

$dirs = @(
  "backgrounds",
  "sprites\dinos",
  "sprites\eggs",
  "sprites\panels",
  "sprites\buttons",
  "sprites\icons",
  "sprites\labels"
)
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path (Join-Path $assetRoot $dir) | Out-Null
}

function New-Brush($html, $alpha = 255) {
  $c = [System.Drawing.ColorTranslator]::FromHtml($html)
  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
}

function New-Pen($html, $width = 2, $alpha = 255) {
  $c = [System.Drawing.ColorTranslator]::FromHtml($html)
  return [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B), $width)
}

function New-RoundedRectPath($x, $y, $w, $h, $r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-Round($g, $brush, $x, $y, $w, $h, $r) {
  $path = New-RoundedRectPath $x $y $w $h $r
  try { $g.FillPath($brush, $path) } finally { $path.Dispose() }
}

function Draw-Round($g, $pen, $x, $y, $w, $h, $r) {
  $path = New-RoundedRectPath $x $y $w $h $r
  try { $g.DrawPath($pen, $path) } finally { $path.Dispose() }
}

function Draw-Cloud($g, $x, $y, $scale) {
  $cloud = New-Brush "#ffffff" 205
  try {
    $g.FillEllipse($cloud, $x, $y + 16 * $scale, 50 * $scale, 28 * $scale)
    $g.FillEllipse($cloud, $x + 28 * $scale, $y, 52 * $scale, 44 * $scale)
    $g.FillEllipse($cloud, $x + 64 * $scale, $y + 14 * $scale, 58 * $scale, 30 * $scale)
  } finally { $cloud.Dispose() }
}

function Draw-Palm($g, $x, $y, $scale) {
  $trunk = New-Pen "#9a6336" (8 * $scale) 235
  $leaf = New-Pen "#4ba84e" (10 * $scale) 225
  try {
    $g.DrawLine($trunk, $x, $y + 88 * $scale, $x + 22 * $scale, $y)
    $g.DrawArc($leaf, $x - 44 * $scale, $y - 24 * $scale, 84 * $scale, 58 * $scale, 180, 100)
    $g.DrawArc($leaf, $x - 10 * $scale, $y - 36 * $scale, 88 * $scale, 62 * $scale, 205, 110)
    $g.DrawArc($leaf, $x + 4 * $scale, $y - 12 * $scale, 92 * $scale, 64 * $scale, 235, 105)
  } finally { $trunk.Dispose(); $leaf.Dispose() }
}

function Draw-SceneBackground($name, $skyTop, $skyBottom, $ground, $accent, $includeWaterfall, $includeVolcano) {
  $path = Join-Path $assetRoot "backgrounds\$name-clean.png"
  $bmp = [System.Drawing.Bitmap]::new(390, 684, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  try {
    $skyBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Rectangle]::new(0, 0, 390, 684), [System.Drawing.ColorTranslator]::FromHtml($skyTop), [System.Drawing.ColorTranslator]::FromHtml($skyBottom), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($skyBrush, 0, 0, 390, 684)
    $skyBrush.Dispose()

    Draw-Cloud $g 18 64 0.72
    Draw-Cloud $g 252 92 0.62

    $farHill = New-Brush "#7fcf7a" 150
    $midHill = New-Brush "#5fb85f" 155
    try {
      $g.FillEllipse($farHill, -60, 238, 220, 142)
      $g.FillEllipse($farHill, 190, 224, 250, 154)
      $g.FillEllipse($midHill, 48, 282, 292, 128)
    } finally { $farHill.Dispose(); $midHill.Dispose() }

    if ($includeVolcano) {
      $volcano = New-Brush "#9e9079" 185
      $lava = New-Brush "#ff8a3d" 220
      try {
        $points = [System.Drawing.Point[]]@([System.Drawing.Point]::new(240, 260), [System.Drawing.Point]::new(300, 132), [System.Drawing.Point]::new(354, 262))
        $g.FillPolygon($volcano, $points)
        $g.FillEllipse($lava, 286, 142, 32, 14)
      } finally { $volcano.Dispose(); $lava.Dispose() }
    }

    $groundBrush = New-Brush $ground 255
    try {
      $g.FillEllipse($groundBrush, -48, 334, 486, 180)
      $g.FillRectangle($groundBrush, 0, 422, 390, 262)
    } finally { $groundBrush.Dispose() }

    $water = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Rectangle]::new(205, 330, 190, 210), [System.Drawing.ColorTranslator]::FromHtml("#48c9e8"), [System.Drawing.ColorTranslator]::FromHtml("#1689c3"), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    try {
      $riverPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
      $riverPath.AddBezier(238, 348, 218, 410, 248, 482, 206, 684)
      $riverPath.AddLine(390, 684, 390, 342)
      $riverPath.CloseFigure()
      $g.FillPath($water, $riverPath)
      $riverPath.Dispose()
    } finally { $water.Dispose() }

    if ($includeWaterfall) {
      $fall = New-Brush "#e9fbff" 215
      try {
        Fill-Round $g $fall 318 272 32 120 14
      } finally { $fall.Dispose() }
    }

    Draw-Palm $g 48 252 1.0

    $stone = New-Brush "#c5b086" 210
    $flower = New-Brush $accent 230
    try {
      $g.FillEllipse($stone, 78, 484, 42, 20)
      $g.FillEllipse($stone, 150, 520, 32, 18)
      $g.FillEllipse($flower, 34, 564, 14, 14)
      $g.FillEllipse($flower, 52, 574, 10, 10)
      $g.FillEllipse($flower, 304, 572, 12, 12)
    } finally { $stone.Dispose(); $flower.Dispose() }

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $g.Dispose()
    $bmp.Dispose()
  }
}

function Copy-DesignAsset($from, $to) {
  Copy-Item -Force (Join-Path $h5Components $from) (Join-Path $assetRoot $to)
}

Draw-SceneBackground "home" "#24bff7" "#bff2ff" "#9de35d" "#ff9a3d" $true $true
Draw-SceneBackground "story" "#43c8f5" "#d3f7ff" "#9ade62" "#ffd44c" $true $true
Draw-SceneBackground "hatch" "#55cbf3" "#e4fbff" "#a6df66" "#7bdcbe" $false $true
Draw-SceneBackground "works" "#3ec5f4" "#dcf8ff" "#96dc60" "#ff8f6b" $true $true
Draw-SceneBackground "parent" "#69d1f5" "#e6fbff" "#9bd96a" "#ffb14a" $true $false

Copy-DesignAsset "home-xiaobao.png" "sprites\dinos\xiaobao.png"
Copy-DesignAsset "home-adai.png" "sprites\dinos\adai-boy.png"
Copy-DesignAsset "home-gulu.png" "sprites\dinos\gulu.png"
Copy-DesignAsset "hatch-stage.png" "sprites\eggs\hatch-egg.png"
Copy-DesignAsset "home-title.png" "sprites\panels\home-title.png"
Copy-DesignAsset "story-title.png" "sprites\panels\story-title.png"
Copy-DesignAsset "story-bubble.png" "sprites\panels\story-bubble.png"
Copy-DesignAsset "hatch-panel.png" "sprites\panels\hatch-panel.png"
Copy-DesignAsset "works-title.png" "sprites\panels\works-title.png"
Copy-DesignAsset "works-board.png" "sprites\panels\works-board.png"
Copy-DesignAsset "parent-title.png" "sprites\panels\parent-title.png"
Copy-DesignAsset "parent-board.png" "sprites\panels\parent-board.png"
Copy-DesignAsset "nav-bg.png" "sprites\panels\nav-bg.png"
Copy-DesignAsset "story-choice-a.png" "sprites\buttons\story-choice-a.png"
Copy-DesignAsset "story-choice-b.png" "sprites\buttons\story-choice-b.png"
Copy-DesignAsset "works-refresh.png" "sprites\buttons\works-refresh.png"
Copy-DesignAsset "parent-save.png" "sprites\buttons\parent-save.png"
Copy-DesignAsset "home-music.png" "sprites\icons\music.png"
Copy-DesignAsset "story-voice-controls.png" "sprites\icons\voice-controls.png"
Copy-DesignAsset "nav-icon-gallery.png" "sprites\icons\nav-works.png"
Copy-DesignAsset "nav-icon-hatch.png" "sprites\icons\nav-hatch.png"
Copy-DesignAsset "nav-icon-parent.png" "sprites\icons\nav-parent.png"
Copy-DesignAsset "nav-label-gallery.png" "sprites\labels\nav-works.png"
Copy-DesignAsset "nav-label-hatch.png" "sprites\labels\nav-hatch.png"
Copy-DesignAsset "nav-label-parent.png" "sprites\labels\nav-parent.png"

Write-Output "WeChat design asset pack rebuilt: clean continuous backgrounds + independent design sprites."