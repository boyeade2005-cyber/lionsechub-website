Add-Type -AssemblyName System.Drawing
$dir = 'C:\Users\david\lionsechub-website\public\assets'

function Resize-Image($src, $dst, $max, $format) {
  $img = [System.Drawing.Image]::FromFile($src)
  $scale = [Math]::Min([Math]::Min($max / $img.Width, $max / $img.Height), 1.0)
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $bmp.Save($dst, $format)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $kb = [math]::Round((Get-Item $dst).Length / 1KB)
  Write-Output "$dst => ${w}x${h}, ${kb}KB"
}

# Logo: keep PNG (transparency), cap at 256px for display use
Resize-Image "$dir\logo.png" "$dir\logo-256.png" 256 ([System.Drawing.Imaging.ImageFormat]::Png)

# Supporters: convert to JPEG q80 at 480px wide max (photos, no transparency needed)
$jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$jpgParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpgParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80L)

foreach ($f in @('Bukola.jpg','Mayowa.jpg')) {
  $src = "$dir\supporters\$f"
  $img = [System.Drawing.Image]::FromFile($src)
  $maxW = 480
  if ($img.Width -gt $maxW) {
    $scale = $maxW / $img.Width
    $w = $maxW; $h = [int]($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h)
    $out = "$dir\supporters\$([IO.Path]::GetFileNameWithoutExtension($f))-480.jpg"
    $bmp.Save($out, $jpgCodec, $jpgParams)
    $g.Dispose(); $bmp.Dispose()
    Write-Output "$out => ${w}x${h}, $([math]::Round((Get-Item $out).Length/1KB))KB"
  } else { Write-Output "$f already small" }
  $img.Dispose()
}

# Samantha.png -> JPEG 480px
$src = "$dir\supporters\Samantha.png"
$img = [System.Drawing.Image]::FromFile($src)
$maxW = 480
if ($img.Width -gt $maxW) {
  $scale = $maxW / $img.Width
  $w = $maxW; $h = [int]($img.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $out = "$dir\supporters\Samantha-480.jpg"
  $bmp.Save($out, $jpgCodec, $jpgParams)
  $g.Dispose(); $bmp.Dispose()
  Write-Output "$out => ${w}x${h}, $([math]::Round((Get-Item $out).Length/1KB))KB"
}
$img.Dispose()

# OG image: 1200x630 branded card
$og = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(2, 10, 19))
$g.FillRectangle($bg, 0, 0, 1200, 630)
$gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(201, 162, 39))
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 190, 200))
$fontTitle = New-Object System.Drawing.Font('Segoe UI', 64, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font('Segoe UI', 26)
$fontTag = New-Object System.Drawing.Font('Segoe UI', 20)
$rect = New-Object System.Drawing.RectangleF(80, 200, 1040, 120)
$g.DrawString('LIONSEC HUB', $fontTitle, $gold, $rect)
$rect2 = New-Object System.Drawing.RectangleF(80, 340, 1040, 50)
$g.DrawString('Global Security & Technology', $fontSub, $white, $rect2)
$rect3 = New-Object System.Drawing.RectangleF(80, 410, 1040, 40)
$g.DrawString('Cybersecurity  •  Quantum-Safe Security  •  Digital Resilience', $fontTag, $gray, $rect3)
$og.Save("$dir\og.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $og.Dispose()
Write-Output "og.png => $([math]::Round((Get-Item "$dir\og.png").Length/1KB))KB"
