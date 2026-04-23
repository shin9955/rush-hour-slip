[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$storeArtDir = Join-Path $repoRoot "art\store"
New-Item -ItemType Directory -Force -Path $storeArtDir | Out-Null

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

function Use-Graphics([System.Drawing.Bitmap]$bitmap) {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    return $graphics
}

function Draw-Background([System.Drawing.Graphics]$graphics, [int]$width, [int]$height) {
    $backgroundRect = New-Rect 0 0 $width $height
    $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(0, 0),
        [System.Drawing.PointF]::new($width, $height),
        (New-ArgbColor 92 223 255),
        (New-ArgbColor 9 20 39)
    )
    $blend = [System.Drawing.Drawing2D.ColorBlend]::new()
    $blend.Colors = @(
        (New-ArgbColor 92 223 255),
        (New-ArgbColor 25 83 124),
        (New-ArgbColor 9 20 39)
    )
    $blend.Positions = @(0.0, 0.48, 1.0)
    $gradient.InterpolationColors = $blend
    $graphics.FillRectangle($gradient, $backgroundRect)

    $topGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $topGlow.AddEllipse([float](-80), [float](-60), [float]($width * 0.58), [float]($height * 0.82))
    $topBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($topGlow)
    $topBrush.CenterColor = New-ArgbColor 126 235 255 115
    $topBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($topBrush, $topGlow)

    $amberGlow = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $amberGlow.AddEllipse([float]($width * 0.60), [float]($height * 0.42), [float]($width * 0.26), [float]($height * 0.46))
    $amberBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($amberGlow)
    $amberBrush.CenterColor = New-ArgbColor 255 142 78 86
    $amberBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
    $graphics.FillPath($amberBrush, $amberGlow)

    $railBackPen = [System.Drawing.Pen]::new((New-ArgbColor 236 198 116 108), 22.0)
    $railBackPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $railBackPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($railBackPen, 110, 470, 420, 175)
    $graphics.DrawLine($railBackPen, 760, 500, 960, 90)

    $lightPen = [System.Drawing.Pen]::new((New-ArgbColor 140 225 255 115), 10.0)
    $lightPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $lightPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($lightPen, 120, 120, 280, 40)
    $graphics.DrawLine($lightPen, 70, 212, 240, 212)
    $graphics.DrawLine($lightPen, 42, 258, 220, 258)
    $graphics.DrawLine($lightPen, 720, 438, 824, 328)

    $panelBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 14 32 53 58))
    $graphics.FillRectangle($panelBrush, [float]0, [float]0, [float]($width * 0.44), [float]$height)
}

function Draw-Train([System.Drawing.Graphics]$graphics, [double]$scale, [double]$offsetX, [double]$offsetY) {
    $graphics.TranslateTransform([float]$offsetX, [float]$offsetY)
    $graphics.ScaleTransform([float]$scale, [float]$scale)

    $shadowPath = New-RoundedPath 150 82 360 270 92
    $shadowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 0 0 0 68))
    $graphics.TranslateTransform(9.0, 13.0, [System.Drawing.Drawing2D.MatrixOrder]::Append)
    $graphics.FillPath($shadowBrush, $shadowPath)
    $graphics.ResetTransform()
    $graphics.TranslateTransform([float]$offsetX, [float]$offsetY)
    $graphics.ScaleTransform([float]$scale, [float]$scale)

    $bodyPath = New-RoundedPath 150 82 360 270 92
    $bodyBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(150, 82),
        [System.Drawing.PointF]::new(150, 352),
        (New-ArgbColor 252 254 255),
        (New-ArgbColor 177 216 252)
    )
    $bodyBlend = [System.Drawing.Drawing2D.ColorBlend]::new()
    $bodyBlend.Colors = @(
        (New-ArgbColor 250 253 255),
        (New-ArgbColor 225 239 255),
        (New-ArgbColor 183 216 251)
    )
    $bodyBlend.Positions = @(0.0, 0.55, 1.0)
    $bodyBrush.InterpolationColors = $bodyBlend
    $graphics.FillPath($bodyBrush, $bodyPath)

    $roofStripe = New-RoundedPath 212 128 236 40 20
    $roofBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 210 106))
    $graphics.FillPath($roofBrush, $roofStripe)

    $windowPath = New-RoundedPath 188 182 284 124 42
    $windowBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 9 25 40))
    $graphics.FillPath($windowBrush, $windowPath)

    $dividerPen = [System.Drawing.Pen]::new((New-ArgbColor 194 222 248 204), 16.0)
    $dividerPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $dividerPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($dividerPen, 330, 198, 330, 292)

    $signalBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 132 223 255 196))
    $graphics.FillEllipse($signalBrush, 298, 142, 18, 18)
    $graphics.FillEllipse($signalBrush, 326, 142, 18, 18)

    $bumperPath = New-RoundedPath 214 304 240 48 24
    $bumperBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 229 244 255))
    $graphics.FillPath($bumperBrush, $bumperPath)

    foreach ($headlightX in @(252, 412)) {
        $glow = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $glow.AddEllipse([float]($headlightX - 12), 286, 52, 52)
        $glowBrush = [System.Drawing.Drawing2D.PathGradientBrush]::new($glow)
        $glowBrush.CenterColor = New-ArgbColor 255 160 88 106
        $glowBrush.SurroundColors = @([System.Drawing.Color]::Transparent)
        $graphics.FillPath($glowBrush, $glow)
    }

    $headlightBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 154 79))
    $graphics.FillEllipse($headlightBrush, 248, 296, 26, 26)
    $graphics.FillEllipse($headlightBrush, 408, 296, 26, 26)

    $outlinePen = [System.Drawing.Pen]::new((New-ArgbColor 241 249 255 214), 10.0)
    $graphics.DrawPath($outlinePen, $bodyPath)

    $railPen = [System.Drawing.Pen]::new((New-ArgbColor 255 212 110), 30.0)
    $railPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $railPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($railPen, 280, 372, 192, 540)
    $graphics.DrawLine($railPen, 386, 372, 474, 540)

    $sleeperPen = [System.Drawing.Pen]::new((New-ArgbColor 255 151 75), 18.0)
    $sleeperPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $sleeperPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    foreach ($sleeper in @(
        @(220, 410, 444, 410),
        @(204, 446, 460, 446),
        @(188, 482, 476, 482)
    )) {
        $graphics.DrawLine($sleeperPen, [float]$sleeper[0], [float]$sleeper[1], [float]$sleeper[2], [float]$sleeper[3])
    }

    $graphics.ResetTransform()
}

function Draw-AccentShapes([System.Drawing.Graphics]$graphics) {
    $graphics.FillPolygon(
        [System.Drawing.SolidBrush]::new((New-ArgbColor 255 197 93 110)),
        [System.Drawing.PointF[]]@(
            [System.Drawing.PointF]::new(160, 410),
            [System.Drawing.PointF]::new(240, 410),
            [System.Drawing.PointF]::new(210, 470)
        )
    )

    $trackHintBrush = [System.Drawing.SolidBrush]::new((New-ArgbColor 255 255 255 22))
    $graphics.FillEllipse($trackHintBrush, 118, 350, 170, 86)
    $graphics.FillEllipse($trackHintBrush, 160, 382, 196, 92)
}

function Save-Graphic([string]$path) {
    $width = 1024
    $height = 500

    $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = Use-Graphics $bitmap

    Draw-Background $graphics $width $height
    Draw-AccentShapes $graphics
    Draw-Train $graphics 0.90 488 18

    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

$output = Join-Path $storeArtDir "feature-graphic-1024x500-v1.png"
Save-Graphic $output
Write-Output "Generated feature graphic: $output"
