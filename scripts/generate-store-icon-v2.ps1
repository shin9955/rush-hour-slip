[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$artDir = Join-Path $repoRoot "art\icon"

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

function Draw-Background([System.Drawing.Graphics]$graphics, [int]$size) {
    $clipPath = New-RoundedPath 0 0 $size $size ($size * 0.23)
    $graphics.SetClip($clipPath)

    $backgroundRect = New-Rect 0 0 $size $size
    $backgroundBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(0, 0),
        [System.Drawing.PointF]::new($size, $size),
        (New-ArgbColor 63 199 243),
        (New-ArgbColor 7 17 34)
    )
    $blend = [System.Drawing.Drawing2D.ColorBlend]::new()
    $blend.Colors = @(
        (New-ArgbColor 83 216 255),
        (New-ArgbColor 20 72 111),
        (New-ArgbColor 7 17 34)
    )
    $blend.Positions = @(0.0, 0.52, 1.0)
    $backgroundBrush.InterpolationColors = $blend
    $graphics.FillRectangle($backgroundBrush, $backgroundRect)

    $coolGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $coolGlow.AddEllipse([float]($size * 0.02), [float]($size * 0.00), [float]($size * 0.54), [float]($size * 0.36))
    $coolGlowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($coolGlow)
    $coolGlowBrush.CenterColor = New-ArgbColor 122 233 255 110
    $coolGlowBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($coolGlowBrush, $coolGlow)

    $warmGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $warmGlow.AddEllipse([float]($size * 0.55), [float]($size * 0.56), [float]($size * 0.28), [float]($size * 0.28))
    $warmGlowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($warmGlow)
    $warmGlowBrush.CenterColor = New-ArgbColor 255 138 71 72
    $warmGlowBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($warmGlowBrush, $warmGlow)

    $railBackPen = [System.Drawing.Pen]::new((New-ArgbColor 240 200 116 110), [float]($size * 0.03))
    $railBackPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $railBackPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($railBackPen, [float]($size * 0.14), [float]($size * 0.86), [float]($size * 0.38), [float]($size * 0.60))
    $graphics.DrawLine($railBackPen, [float]($size * 0.66), [float]($size * 0.36), [float]($size * 0.88), [float]($size * 0.12))

    $motionPen = [System.Drawing.Pen]::new((New-ArgbColor 141 225 255 110), [float]($size * 0.018))
    $motionPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $motionPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($motionPen, [float]($size * 0.18), [float]($size * 0.24), [float]($size * 0.38), [float]($size * 0.12))
    $graphics.DrawLine($motionPen, [float]($size * 0.66), [float]($size * 0.84), [float]($size * 0.80), [float]($size * 0.70))
    $graphics.DrawLine($motionPen, [float]($size * 0.08), [float]($size * 0.44), [float]($size * 0.22), [float]($size * 0.44))
    $graphics.DrawLine($motionPen, [float]($size * 0.05), [float]($size * 0.50), [float]($size * 0.18), [float]($size * 0.50))

    $rimPen = [System.Drawing.Pen]::new((New-ArgbColor 255 255 255 26), [float]($size * 0.012))
    $graphics.DrawPath($rimPen, $clipPath)
    $graphics.ResetClip()
}

function Draw-Train([System.Drawing.Graphics]$graphics, [int]$size) {
    $u = $size / 512.0

    $shadowPath = New-RoundedPath (94 * $u) (94 * $u) (324 * $u) (246 * $u) (82 * $u)
    $shadowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 0 0 0 62))
    $graphics.TranslateTransform([float](8 * $u), [float](12 * $u), [System.Drawing.Drawing2D.MatrixOrder]::Append)
    $graphics.FillPath($shadowBrush, $shadowPath)
    $graphics.ResetTransform()

    $bodyPath = New-RoundedPath (94 * $u) (94 * $u) (324 * $u) (246 * $u) (82 * $u)
    $bodyRect = New-Rect (94 * $u) (94 * $u) (324 * $u) (246 * $u)
    $bodyBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new([float]$bodyRect.Left, [float]$bodyRect.Top),
        [System.Drawing.PointF]::new([float]$bodyRect.Left, [float]$bodyRect.Bottom),
        (New-ArgbColor 252 254 255),
        (New-ArgbColor 180 218 255)
    )
    $bodyBlend = [System.Drawing.Drawing2D.ColorBlend]::new()
    $bodyBlend.Colors = @(
        (New-ArgbColor 249 253 255),
        (New-ArgbColor 223 238 255),
        (New-ArgbColor 181 215 251)
    )
    $bodyBlend.Positions = @(0.0, 0.52, 1.0)
    $bodyBrush.InterpolationColors = $bodyBlend
    $graphics.FillPath($bodyBrush, $bodyPath)

    $roofStripePath = New-RoundedPath (152 * $u) (136 * $u) (208 * $u) (34 * $u) (17 * $u)
    $roofStripeBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 210 104))
    $graphics.FillPath($roofStripeBrush, $roofStripePath)

    $windowPath = New-RoundedPath (128 * $u) (182 * $u) (256 * $u) (112 * $u) (38 * $u)
    $windowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 10 25 40))
    $graphics.FillPath($windowBrush, $windowPath)

    $dividerPen = [System.Drawing.Pen]::new((New-ArgbColor 194 223 248 196), [float](14 * $u))
    $dividerPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $dividerPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($dividerPen, [float](256 * $u), [float](196 * $u), [float](256 * $u), [float](280 * $u))

    $signalBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 134 223 255 190))
    $graphics.FillEllipse($signalBrush, [float](236 * $u), [float](148 * $u), [float](16 * $u), [float](16 * $u))
    $graphics.FillEllipse($signalBrush, [float](260 * $u), [float](148 * $u), [float](16 * $u), [float](16 * $u))

    $bumperPath = New-RoundedPath (150 * $u) (292 * $u) (212 * $u) (42 * $u) (21 * $u)
    $bumperBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 229 244 255))
    $graphics.FillPath($bumperBrush, $bumperPath)

    foreach ($headlightX in @(184, 312)) {
        $glowPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $glowPath.AddEllipse([float](($headlightX - 12) * $u), [float](270 * $u), [float](46 * $u), [float](46 * $u))
        $glowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($glowPath)
        $glowBrush.CenterColor = New-ArgbColor 255 162 88 96
        $glowBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
        $graphics.FillPath($glowBrush, $glowPath)
    }

    $headlightBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 154 79))
    $graphics.FillEllipse($headlightBrush, [float](180 * $u), [float](280 * $u), [float](24 * $u), [float](24 * $u))
    $graphics.FillEllipse($headlightBrush, [float](308 * $u), [float](280 * $u), [float](24 * $u), [float](24 * $u))

    $bodyEdgePen = [System.Drawing.Pen]::new((New-ArgbColor 241 249 255 212), [float](9 * $u))
    $graphics.DrawPath($bodyEdgePen, $bodyPath)

    $railPen = [System.Drawing.Pen]::new((New-ArgbColor 255 212 108), [float](28 * $u))
    $railPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $railPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($railPen, [float](218 * $u), [float](336 * $u), [float](154 * $u), [float](454 * $u))
    $graphics.DrawLine($railPen, [float](294 * $u), [float](336 * $u), [float](358 * $u), [float](454 * $u))

    $sleeperPen = [System.Drawing.Pen]::new((New-ArgbColor 255 151 75), [float](16 * $u))
    $sleeperPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sleeperPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    foreach ($sleeper in @(
        @(176, 366, 336, 366),
        @(164, 396, 348, 396),
        @(152, 426, 360, 426)
    )) {
        $graphics.DrawLine(
            $sleeperPen,
            [float]($sleeper[0] * $u),
            [float]($sleeper[1] * $u),
            [float]($sleeper[2] * $u),
            [float]($sleeper[3] * $u)
        )
    }
}

function Save-StoreIcon([string]$path, [int]$size) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = Use-Graphics $bitmap

    Draw-Background $graphics $size
    Draw-Train $graphics $size

    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

$outputs = @(
    @{ Path = (Join-Path $artDir "play-store-icon-512-v2.png"); Size = 512 },
    @{ Path = (Join-Path $artDir "app-icon-preview-1024-v2.png"); Size = 1024 }
)

foreach ($output in $outputs) {
    Save-StoreIcon $output.Path $output.Size
}

Write-Output "Generated store icon variants:"
foreach ($output in $outputs) {
    Write-Output " - $($output.Path)"
}
