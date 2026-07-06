$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$assetRoot = Join-Path $root "apps\h5\assets"
$outRoot = Join-Path $assetRoot "components"
$baseRoot = Join-Path $assetRoot "component-bases"

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $outRoot | Out-Null
New-Item -ItemType Directory -Force $baseRoot | Out-Null

function New-RoundedRectPath($rect, $radius) {
  $diameter = $radius * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect($graphics, $rect, $radius, $topColor, $bottomColor) {
  $path = New-RoundedRectPath $rect $radius
  try {
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      $rect,
      $topColor,
      $bottomColor,
      [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    try {
      $graphics.FillPath($brush, $path)
    } finally {
      $brush.Dispose()
    }
  } finally {
    $path.Dispose()
  }
}

function Blend-Channel($from, $to, $amount) {
  return [int][Math]::Round(($from * (1 - $amount)) + ($to * $amount))
}

function Blend-Color($from, $to, $amount) {
  return [System.Drawing.Color]::FromArgb(
    255,
    (Blend-Channel $from.R $to.R $amount),
    (Blend-Channel $from.G $to.G $amount),
    (Blend-Channel $from.B $to.B $amount)
  )
}

function Fill-FeatheredGradientRect($bitmap, $rect, $topColor, $bottomColor, $feather) {
  for ($y = $rect.Y; $y -lt $rect.Bottom; $y++) {
    $vertical = if ($rect.Height -le 1) { 0 } else { ($y - $rect.Y) / ($rect.Height - 1) }
    $fill = Blend-Color $topColor $bottomColor $vertical

    for ($x = $rect.X; $x -lt $rect.Right; $x++) {
      $distanceLeft = $x - $rect.X
      $distanceRight = $rect.Right - 1 - $x
      $distanceTop = $y - $rect.Y
      $distanceBottom = $rect.Bottom - 1 - $y
      $edgeDistance = [Math]::Min([Math]::Min($distanceLeft, $distanceRight), [Math]::Min($distanceTop, $distanceBottom))
      $amount = if ($edgeDistance -ge $feather) { 1 } else { [Math]::Max(0, $edgeDistance / $feather) }
      $original = $bitmap.GetPixel($x, $y)
      $bitmap.SetPixel($x, $y, (Blend-Color $original $fill $amount))
    }
  }
}

function Convert-LabelToTransparentInk($labelPath) {
  $source = [System.Drawing.Bitmap]::FromFile($labelPath)
  $canvas = $null
  try {
    $canvas = [System.Drawing.Bitmap]::new($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $pixel = $source.GetPixel($x, $y)
        $isInk = (
          ($pixel.R -lt 172 -and $pixel.G -lt 142 -and $pixel.B -lt 116) -or
          ($pixel.R -lt 210 -and $pixel.G -lt 178 -and $pixel.B -lt 128 -and ($pixel.R - $pixel.B) -gt 34)
        )

        if ($isInk) {
          $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
        } else {
          $canvas.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
        }
      }
    }
  } finally {
    $source.Dispose()
  }

  try {
    $canvas.Save($labelPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    if ($canvas -ne $null) {
      $canvas.Dispose()
    }
  }
}

function Test-NavLabelInk($pixel) {
  return (
    ($pixel.R -lt 172 -and $pixel.G -lt 142 -and $pixel.B -lt 116) -or
    ($pixel.R -lt 210 -and $pixel.G -lt 178 -and $pixel.B -lt 128 -and ($pixel.R - $pixel.B) -gt 34)
  )
}

function Remove-NavLabelInk($bitmap, $rect) {
  $mask = [bool[,]]::new($rect.Width, $rect.Height)
  for ($y = 0; $y -lt $rect.Height; $y++) {
    for ($x = 0; $x -lt $rect.Width; $x++) {
      $pixel = $bitmap.GetPixel($rect.X + $x, $rect.Y + $y)
      if (Test-NavLabelInk $pixel) {
        for ($dy = -2; $dy -le 2; $dy++) {
          for ($dx = -2; $dx -le 2; $dx++) {
            $mx = $x + $dx
            $my = $y + $dy
            if ($mx -ge 0 -and $mx -lt $rect.Width -and $my -ge 0 -and $my -lt $rect.Height) {
              $mask[$mx, $my] = $true
            }
          }
        }
      }
    }
  }

  for ($iteration = 0; $iteration -lt 4; $iteration++) {
    $next = [System.Drawing.Bitmap]::new($bitmap)
    try {
      for ($y = 0; $y -lt $rect.Height; $y++) {
        for ($x = 0; $x -lt $rect.Width; $x++) {
          if (-not $mask[$x, $y]) {
            continue
          }

          $r = 0
          $g = 0
          $b = 0
          $count = 0
          for ($dy = -4; $dy -le 4; $dy++) {
            for ($dx = -4; $dx -le 4; $dx++) {
              if ($dx -eq 0 -and $dy -eq 0) {
                continue
              }

              $mx = $x + $dx
              $my = $y + $dy
              if ($mx -lt 0 -or $mx -ge $rect.Width -or $my -lt 0 -or $my -ge $rect.Height) {
                continue
              }

              if ($mask[$mx, $my] -and $iteration -eq 0) {
                continue
              }

              $neighbor = $bitmap.GetPixel($rect.X + $mx, $rect.Y + $my)
              $r += $neighbor.R
              $g += $neighbor.G
              $b += $neighbor.B
              $count++
            }
          }

          if ($count -gt 0) {
            $next.SetPixel(
              $rect.X + $x,
              $rect.Y + $y,
              [System.Drawing.Color]::FromArgb(255, [int]($r / $count), [int]($g / $count), [int]($b / $count))
            )
          }
        }
      }

      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.DrawImage($next, 0, 0)
      } finally {
        $graphics.Dispose()
      }
    } finally {
      $next.Dispose()
    }
  }
}

function Clear-NavButtonArtwork($navPath) {
  $source = [System.Drawing.Bitmap]::FromFile($navPath)
  try {
    $canvas = [System.Drawing.Bitmap]::new($source)
  } finally {
    $source.Dispose()
  }

  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

      $iconTop = [System.Drawing.Color]::FromArgb(255, 255, 246, 218)
      $iconBottom = [System.Drawing.Color]::FromArgb(255, 242, 216, 154)

      $patches = @(
        @{ Rect = [System.Drawing.Rectangle]::new(22, 6, 92, 86); Radius = 24; Top = $iconTop; Bottom = $iconBottom },
        @{ Rect = [System.Drawing.Rectangle]::new(137, 0, 116, 96); Radius = 26; Top = $iconTop; Bottom = $iconBottom },
        @{ Rect = [System.Drawing.Rectangle]::new(272, 6, 104, 86); Radius = 24; Top = $iconTop; Bottom = $iconBottom }
      )

      foreach ($patch in $patches) {
        Fill-RoundedRect $graphics $patch.Rect $patch.Radius $patch.Top $patch.Bottom
      }

      Remove-NavLabelInk $canvas ([System.Drawing.Rectangle]::new(35, 92, 98, 60))
      Remove-NavLabelInk $canvas ([System.Drawing.Rectangle]::new(156, 92, 108, 60))
      Remove-NavLabelInk $canvas ([System.Drawing.Rectangle]::new(284, 92, 100, 60))
    } finally {
      $graphics.Dispose()
    }

    $canvas.Save($navPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Dispose()
  }
}

$components = @(
  @{ Source = "home-final-390.png"; Out = "home-bg-top.png"; X = 0; Y = 0; W = 390; H = 230 },
  @{ Source = "home-final-390.png"; Out = "home-bg-mid.png"; X = 0; Y = 230; W = 390; H = 224 },
  @{ Source = "home-final-390.png"; Out = "home-bg-lower.png"; X = 0; Y = 454; W = 390; H = 230 },
  @{ Source = "home-final-390.png"; Out = "home-title.png"; X = 20; Y = 30; W = 350; H = 145 },
  @{ Source = "home-final-390.png"; Out = "home-music.png"; X = 357; Y = 35; W = 31; H = 34 },
  @{ Source = "home-final-390.png"; Out = "home-xiaobao.png"; X = 112; Y = 245; W = 170; H = 188 },
  @{ Source = "home-final-390.png"; Out = "home-adai.png"; X = 0; Y = 391; W = 178; H = 223 },
  @{ Source = "home-final-390.png"; Out = "home-gulu.png"; X = 214; Y = 392; W = 174; H = 222 },
  @{ Source = "home-final-390.png"; Out = "nav-bg.png"; X = 0; Y = 684; W = 390; H = 160 },
  @{ Source = "home-final-390.png"; Out = "nav-icon-gallery.png"; X = 22; Y = 690; W = 92; H = 86 },
  @{ Source = "home-final-390.png"; Out = "nav-icon-hatch.png"; X = 137; Y = 684; W = 116; H = 96 },
  @{ Source = "home-final-390.png"; Out = "nav-icon-parent.png"; X = 272; Y = 690; W = 104; H = 86 },
  @{ Source = "home-final-390.png"; Out = "nav-label-gallery.png"; X = 43; Y = 784; W = 84; H = 40 },
  @{ Source = "home-final-390.png"; Out = "nav-label-hatch.png"; X = 166; Y = 784; W = 88; H = 40 },
  @{ Source = "home-final-390.png"; Out = "nav-label-parent.png"; X = 292; Y = 784; W = 84; H = 40 },

  @{ Source = "screen-story-390.png"; Out = "story-bg-top.png"; X = 0; Y = 0; W = 390; H = 230 },
  @{ Source = "screen-story-390.png"; Out = "story-bg-mid.png"; X = 0; Y = 230; W = 390; H = 224 },
  @{ Source = "screen-story-390.png"; Out = "story-bg-lower.png"; X = 0; Y = 454; W = 390; H = 230 },
  @{ Source = "screen-story-390.png"; Out = "story-title.png"; X = 42; Y = 38; W = 306; H = 104 },
  @{ Source = "screen-story-390.png"; Out = "story-bubble.png"; X = 53; Y = 188; W = 148; H = 90 },
  @{ Source = "screen-story-390.png"; Out = "story-dino.png"; X = 150; Y = 157; W = 190; H = 296 },
  @{ Source = "screen-story-390.png"; Out = "story-voice-controls.png"; X = 44; Y = 472; W = 188; H = 66 },
  @{ Source = "screen-story-390.png"; Out = "story-choice-a.png"; X = 49; Y = 560; W = 132; H = 50 },
  @{ Source = "screen-story-390.png"; Out = "story-choice-b.png"; X = 210; Y = 560; W = 134; H = 50 },

  @{ Source = "screen-hatch-390.png"; Out = "hatch-bg-top.png"; X = 0; Y = 0; W = 390; H = 230 },
  @{ Source = "screen-hatch-390.png"; Out = "hatch-bg-mid.png"; X = 0; Y = 230; W = 390; H = 224 },
  @{ Source = "screen-hatch-390.png"; Out = "hatch-bg-lower.png"; X = 0; Y = 454; W = 390; H = 230 },
  @{ Source = "screen-hatch-390.png"; Out = "hatch-stage.png"; X = 0; Y = 0; W = 390; H = 540 },
  @{ Source = "screen-hatch-390.png"; Out = "hatch-panel.png"; X = 35; Y = 542; W = 320; H = 160 },

  @{ Source = "screen-works-390.png"; Out = "works-bg-top.png"; X = 0; Y = 0; W = 390; H = 230 },
  @{ Source = "screen-works-390.png"; Out = "works-bg-mid.png"; X = 0; Y = 230; W = 390; H = 224 },
  @{ Source = "screen-works-390.png"; Out = "works-bg-lower.png"; X = 0; Y = 454; W = 390; H = 230 },
  @{ Source = "screen-works-390.png"; Out = "works-title.png"; X = 50; Y = 34; W = 290; H = 106 },
  @{ Source = "screen-works-390.png"; Out = "works-board.png"; X = 43; Y = 144; W = 310; H = 468 },
  @{ Source = "screen-works-390.png"; Out = "works-dino.png"; X = 260; Y = 599; W = 116; H = 116 },
  @{ Source = "screen-works-390.png"; Out = "works-refresh.png"; X = 126; Y = 633; W = 138; H = 48 },

  @{ Source = "screen-parent-390.png"; Out = "parent-bg-top.png"; X = 0; Y = 0; W = 390; H = 230 },
  @{ Source = "screen-parent-390.png"; Out = "parent-bg-mid.png"; X = 0; Y = 230; W = 390; H = 224 },
  @{ Source = "screen-parent-390.png"; Out = "parent-bg-lower.png"; X = 0; Y = 454; W = 390; H = 230 },
  @{ Source = "screen-parent-390.png"; Out = "parent-title.png"; X = 50; Y = 36; W = 290; H = 104 },
  @{ Source = "screen-parent-390.png"; Out = "parent-board.png"; X = 38; Y = 146; W = 314; H = 468 },
  @{ Source = "screen-parent-390.png"; Out = "parent-dino.png"; X = 260; Y = 594; W = 118; H = 122 },
  @{ Source = "screen-parent-390.png"; Out = "parent-save.png"; X = 82; Y = 616; W = 225; H = 58 }
)

foreach ($component in $components) {
  $sourcePath = Join-Path $assetRoot $component.Source
  if (-not (Test-Path $sourcePath)) {
    throw "Missing source asset: $($component.Source)"
  }

  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $rect = [System.Drawing.Rectangle]::new($component.X, $component.Y, $component.W, $component.H)
    $crop = $source.Clone($rect, $source.PixelFormat)
    try {
      $outPath = Join-Path $outRoot $component.Out
      $crop.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $crop.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

$cleanNavPath = Join-Path $outRoot "nav-bg.png"
Clear-NavButtonArtwork $cleanNavPath
Convert-LabelToTransparentInk (Join-Path $outRoot "nav-label-gallery.png")
Convert-LabelToTransparentInk (Join-Path $outRoot "nav-label-hatch.png")
Convert-LabelToTransparentInk (Join-Path $outRoot "nav-label-parent.png")

$baseScreens = @(
  @{ Source = "home-final-390.png"; Out = "home-component-390.png" },
  @{ Source = "screen-story-390.png"; Out = "story-component-390.png" },
  @{ Source = "screen-hatch-390.png"; Out = "hatch-component-390.png" },
  @{ Source = "screen-works-390.png"; Out = "works-component-390.png" },
  @{ Source = "screen-parent-390.png"; Out = "parent-component-390.png" }
)

$fixedNavBgPath = Join-Path $assetRoot "nav-strip.png"
$fixedNavGalleryPath = Join-Path $outRoot "nav-icon-gallery.png"
$fixedNavHatchPath = Join-Path $outRoot "nav-icon-hatch.png"
$fixedNavParentPath = Join-Path $outRoot "nav-icon-parent.png"
$fixedNavGalleryLabelPath = Join-Path $outRoot "nav-label-gallery.png"
$fixedNavHatchLabelPath = Join-Path $outRoot "nav-label-hatch.png"
$fixedNavParentLabelPath = Join-Path $outRoot "nav-label-parent.png"
$fixedNavBg = [System.Drawing.Bitmap]::FromFile($fixedNavBgPath)
$fixedNavGallery = [System.Drawing.Bitmap]::FromFile($fixedNavGalleryPath)
$fixedNavHatch = [System.Drawing.Bitmap]::FromFile($fixedNavHatchPath)
$fixedNavParent = [System.Drawing.Bitmap]::FromFile($fixedNavParentPath)
$fixedNavGalleryLabel = [System.Drawing.Bitmap]::FromFile($fixedNavGalleryLabelPath)
$fixedNavHatchLabel = [System.Drawing.Bitmap]::FromFile($fixedNavHatchLabelPath)
$fixedNavParentLabel = [System.Drawing.Bitmap]::FromFile($fixedNavParentLabelPath)
try {
  foreach ($screen in $baseScreens) {
    $sourcePath = Join-Path $assetRoot $screen.Source
    $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
    try {
      $canvas = [System.Drawing.Bitmap]::new(390, 844, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      try {
        $graphics = [System.Drawing.Graphics]::FromImage($canvas)
        try {
          $graphics.DrawImage(
            $source,
            [System.Drawing.Rectangle]::new(0, 0, 390, 684),
            [System.Drawing.Rectangle]::new(0, 0, 390, 684),
            [System.Drawing.GraphicsUnit]::Pixel
          )
          $graphics.DrawImage($fixedNavBg, [System.Drawing.Rectangle]::new(0, 684, 390, 160), [System.Drawing.Rectangle]::new(0, 0, 390, 160), [System.Drawing.GraphicsUnit]::Pixel)
        } finally {
          $graphics.Dispose()
        }
        $outPath = Join-Path $baseRoot $screen.Out
        $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $canvas.Dispose()
      }
    } finally {
      $source.Dispose()
    }
  }
} finally {
  $fixedNavBg.Dispose()
  $fixedNavGallery.Dispose()
  $fixedNavHatch.Dispose()
  $fixedNavParent.Dispose()
  $fixedNavGalleryLabel.Dispose()
  $fixedNavHatchLabel.Dispose()
  $fixedNavParentLabel.Dispose()
}

Write-Output "H5 component assets written to apps\h5\assets\components"
Write-Output "H5 component baselines written to apps\h5\assets\component-bases"
