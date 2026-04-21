[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$androidRes = Join-Path $repoRoot "android\app\src\main\res"
$artDir = Join-Path $repoRoot "art\icon"
$webDir = Join-Path $repoRoot "web"

New-Item -ItemType Directory -Force -Path $artDir | Out-Null

function New-ArgbColor([int]$r, [int]$g, [int]$b, [int]$a = 255) {
    return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function New-Rect([double]$x, [double]$y, [double]$w, [double]$h) {
    return [System.Drawing.RectangleF]::new([float]$x, [float]$y, [float]$w, [float]$h)
}

function New-RoundedPath([double]$x, [double]$y, [double]$w, [double]$h, [double]$r) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = [float]($r * 2)
    $path.AddArc([float]$x, [float]$y, $d, $d, 180, 90)
    $path.AddArc([float]($x + $w - $d), [float]$y, $d, $d, 270, 90)
    $path.AddArc([float]($x + $w - $d), [float]($y + $h - $d), $d, $d, 0, 90)
    $path.AddArc([float]$x, [float]($y + $h - $d), $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-CirclePath([double]$x, [double]$y, [double]$diameter) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $path.AddEllipse([float]$x, [float]$y, [float]$diameter, [float]$diameter)
    $path.CloseFigure()
    return $path
}

function Use-Graphics([System.Drawing.Bitmap]$bitmap) {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    return $graphics
}

function Draw-Background([System.Drawing.Graphics]$graphics, [int]$size, [string]$shape) {
    $fullRect = New-Rect 0 0 $size $size
    $path = if ($shape -eq "circle") {
        New-CirclePath 0 0 $size
    } else {
        New-RoundedPath 0 0 $size $size ($size * 0.23)
    }

    $graphics.SetClip($path)

    $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(0, 0),
        [System.Drawing.PointF]::new($size, $size),
        (New-ArgbColor 116 230 255),
        (New-ArgbColor 8 17 27)
    )
    $blend = [System.Drawing.Drawing2D.ColorBlend]::new()
    $blend.Colors = @(
        (New-ArgbColor 116 230 255),
        (New-ArgbColor 19 49 75),
        (New-ArgbColor 8 17 27)
    )
    $blend.Positions = @(0.0, 0.55, 1.0)
    $gradient.InterpolationColors = $blend
    $graphics.FillPath($gradient, $path)

    $spotGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $spotGlow.AddEllipse([float]($size * 0.08), [float]($size * 0.04), [float]($size * 0.48), [float]($size * 0.32))
    $glowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($spotGlow)
    $glowBrush.CenterColor = New-ArgbColor 122 232 255 96
    $glowBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($glowBrush, $spotGlow)

    $amberGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $amberGlow.AddEllipse([float]($size * 0.52), [float]($size * 0.54), [float]($size * 0.34), [float]($size * 0.34))
    $amberBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($amberGlow)
    $amberBrush.CenterColor = New-ArgbColor 255 154 79 54
    $amberBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($amberBrush, $amberGlow)

    $pen1 = [System.Drawing.Pen]::new((New-ArgbColor 255 214 111 80), [float]($size * 0.028))
    $pen1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($pen1, [float]($size * 0.16), [float]($size * 0.82), [float]($size * 0.36), [float]($size * 0.60))
    $graphics.DrawLine($pen1, [float]($size * 0.70), [float]($size * 0.28), [float]($size * 0.88), [float]($size * 0.10))

    $pen2 = [System.Drawing.Pen]::new((New-ArgbColor 121 221 255 72), [float]($size * 0.018))
    $pen2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($pen2, [float]($size * 0.20), [float]($size * 0.24), [float]($size * 0.40), [float]($size * 0.12))
    $graphics.DrawLine($pen2, [float]($size * 0.64), [float]($size * 0.86), [float]($size * 0.82), [float]($size * 0.68))

    $borderPen = [System.Drawing.Pen]::new((New-ArgbColor 255 255 255 24), [float]($size * 0.012))
    $graphics.DrawPath($borderPen, $path)

    $graphics.ResetClip()
}

function Draw-Logo([System.Drawing.Graphics]$graphics, [int]$size, [bool]$transparentBackground) {
    $unit = $size / 512.0

    if ($transparentBackground) {
        $graphics.TranslateTransform([float]($size * 0.02), [float]($size * 0.03))
        $graphics.ScaleTransform(0.94, 0.94)
    }

    $shadowPath = New-RoundedPath (120 * $unit) (112 * $unit) (272 * $unit) (214 * $unit) (72 * $unit)
    $shadowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 0 0 0 54))
    $graphics.TranslateTransform([float](6 * $unit), [float](10 * $unit), [System.Drawing.Drawing2D.MatrixOrder]::Append)
    $graphics.FillPath($shadowBrush, $shadowPath)
    $graphics.TranslateTransform([float](-6 * $unit), [float](-10 * $unit), [System.Drawing.Drawing2D.MatrixOrder]::Append)

    $bodyPath = New-RoundedPath (120 * $unit) (112 * $unit) (272 * $unit) (214 * $unit) (72 * $unit)
    $bodyRect = New-Rect (120 * $unit) (112 * $unit) (272 * $unit) (214 * $unit)
    $bodyBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new([float]($bodyRect.Left), [float]($bodyRect.Top)),
        [System.Drawing.PointF]::new([float]($bodyRect.Left), [float]($bodyRect.Bottom)),
        (New-ArgbColor 247 252 255),
        (New-ArgbColor 191 224 255)
    )
    $graphics.FillPath($bodyBrush, $bodyPath)

    $destPath = New-RoundedPath (166 * $unit) (140 * $unit) (180 * $unit) (28 * $unit) (14 * $unit)
    $destBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 214 111))
    $graphics.FillPath($destBrush, $destPath)

    $windowBand = New-RoundedPath (144 * $unit) (180 * $unit) (224 * $unit) (92 * $unit) (28 * $unit)
    $windowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 11 26 41))
    $graphics.FillPath($windowBrush, $windowBand)

    $dividerPen = [System.Drawing.Pen]::new((New-ArgbColor 192 222 252 180), [float](12 * $unit))
    $dividerPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $dividerPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($dividerPen, [float](256 * $unit), [float](190 * $unit), [float](256 * $unit), [float](266 * $unit))

    $nosePath = New-RoundedPath (156 * $unit) (274 * $unit) (200 * $unit) (36 * $unit) (18 * $unit)
    $noseBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 233 246 255))
    $graphics.FillPath($noseBrush, $nosePath)

    $headlightBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 154 79))
    $graphics.FillEllipse($headlightBrush, [float](174 * $unit), [float](280 * $unit), [float](22 * $unit), [float](22 * $unit))
    $graphics.FillEllipse($headlightBrush, [float](316 * $unit), [float](280 * $unit), [float](22 * $unit), [float](22 * $unit))

    $signalBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 121 221 255 180))
    $graphics.FillEllipse($signalBrush, [float](234 * $unit), [float](146 * $unit), [float](16 * $unit), [float](16 * $unit))
    $graphics.FillEllipse($signalBrush, [float](262 * $unit), [float](146 * $unit), [float](16 * $unit), [float](16 * $unit))

    $outlinePen = [System.Drawing.Pen]::new((New-ArgbColor 235 246 255 196), [float](8 * $unit))
    $graphics.DrawPath($outlinePen, $bodyPath)

    $railPen = [System.Drawing.Pen]::new((New-ArgbColor 255 214 111), [float](24 * $unit))
    $railPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $railPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($railPen, [float](216 * $unit), [float](324 * $unit), [float](154 * $unit), [float](448 * $unit))
    $graphics.DrawLine($railPen, [float](296 * $unit), [float](324 * $unit), [float](358 * $unit), [float](448 * $unit))

    $sleeperPen = [System.Drawing.Pen]::new((New-ArgbColor 255 154 79), [float](14 * $unit))
    $sleeperPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sleeperPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sleepers = @(
        @(186, 362, 326, 362),
        @(174, 390, 338, 390),
        @(162, 418, 350, 418)
    )
    foreach ($sleeper in $sleepers) {
        $graphics.DrawLine(
            $sleeperPen,
            [float]($sleeper[0] * $unit),
            [float]($sleeper[1] * $unit),
            [float]($sleeper[2] * $unit),
            [float]($sleeper[3] * $unit)
        )
    }

    $speedPen = [System.Drawing.Pen]::new((New-ArgbColor 121 221 255 130), [float](16 * $unit))
    $speedPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $speedPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($speedPen, [float](92 * $unit), [float](214 * $unit), [float](132 * $unit), [float](214 * $unit))
    $graphics.DrawLine($speedPen, [float](78 * $unit), [float](244 * $unit), [float](124 * $unit), [float](244 * $unit))

    if ($transparentBackground) {
        $graphics.ResetTransform()
    }
}

function Save-Bitmap([string]$path, [int]$size, [string]$shape, [bool]$transparentBackground) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = Use-Graphics $bitmap

    if (-not $transparentBackground) {
        Draw-Background $graphics $size $shape
    }

    Draw-Logo $graphics $size $transparentBackground

    $directory = Split-Path -Parent $path
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
}

$legacySizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$foregroundSizes = @{
    "mipmap-mdpi" = 108
    "mipmap-hdpi" = 162
    "mipmap-xhdpi" = 216
    "mipmap-xxhdpi" = 324
    "mipmap-xxxhdpi" = 432
}

foreach ($entry in $legacySizes.GetEnumerator()) {
    Save-Bitmap (Join-Path $androidRes "$($entry.Key)\ic_launcher.png") $entry.Value "square" $false
    Save-Bitmap (Join-Path $androidRes "$($entry.Key)\ic_launcher_round.png") $entry.Value "circle" $false
}

foreach ($entry in $foregroundSizes.GetEnumerator()) {
    Save-Bitmap (Join-Path $androidRes "$($entry.Key)\ic_launcher_foreground.png") $entry.Value "square" $true
}

Save-Bitmap (Join-Path $artDir "play-store-icon-512.png") 512 "square" $false
Save-Bitmap (Join-Path $artDir "app-icon-preview-1024.png") 1024 "square" $false
Save-Bitmap (Join-Path $webDir "icon-512.png") 512 "square" $false

Write-Output "Generated Android launcher icons and Play Store icon."
