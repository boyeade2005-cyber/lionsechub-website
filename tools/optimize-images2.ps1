Add-Type -AssemblyName System.Drawing
$dir = 'C:\Users\david\lionsechub-website\public\assets'

function Resize-Save($src, $dst, $maxW, $codec, $params) {
  $img = [System.Drawing.Image]::FromFile($src)
  $scale = [Math]::Min($maxW / $img.Width, 1.0)
  $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $tmp = "$dst.tmp"
  if ($params) { $bmp.Save($tmp, $codec, $params) } else { $bmp.Save($tmp, $codec) }
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  Move-Item -Force $tmp $dst
  Write-Output "$dst => ${w}x${h}, $([math]::Round((Get-Item $dst).Length/1KB))KB"
}

$png = [System.Drawing.Imaging.ImageFormat]::Png
$jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$jpgParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpgParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 82L)

# Overwrite originals so no HTML changes needed
Resize-Save "$dir\logo.png" "$dir\logo.png" 512 $png $null
Resize-Save "$dir\supporters\Bukola.jpg" "$dir\supporters\Bukola.jpg" 640 $jpgCodec $jpgParams
Resize-Save "$dir\supporters\Mayowa.jpg" "$dir\supporters\Mayowa.jpg" 640 $jpgCodec $jpgParams
Resize-Save "$dir\supporters\Samantha-480.jpg" "$dir\supporters\Samantha-480.jpg" 640 $jpgCodec $jpgParams

# Video poster: 1280x720 branded card
$poster = New-Object System.Drawing.Bitmap(1280, 720)
$g = [System.Drawing.Graphics]::FromImage($poster)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(2, 10, 19))
$g.FillRectangle($bg, 0, 0, 1280, 720)
# gold accent bar
$gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(201, 162, 39))
$g.FillRectangle($gold, 0, 0, 1280, 6)
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 180, 190))
$f1 = New-Object System.Drawing.Font('Segoe UI', 72, [System.Drawing.FontStyle]::Bold)
$f2 = New-Object System.Drawing.Font('Segoe UI', 30)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = 'Center'
$rect = New-Object System.Drawing.RectangleF(0, 240, 1280, 110)
$g.DrawString('LIONSEC HUB', $f1, $gold, $rect, $fmt)
$rect2 = New-Object System.Drawing.RectangleF(0, 380, 1280, 50)
$g.DrawString('Global Security & Technology', $f2, $white, $rect2, $fmt)
$rect3 = New-Object System.Drawing.RectangleF(0, 450, 1280, 40)
$f3 = New-Object System.Drawing.Font('Segoe UI', 22)
$g.DrawString('Securing critical systems. Protecting digital economies.', $f3, $gray, $rect3, $fmt)
$poster.Save("$dir\video-poster.jpg", $jpgCodec, $jpgParams)
$g.Dispose(); $poster.Dispose()
Write-Output "video-poster.jpg => $([math]::Round((Get-Item "$dir\video-poster.jpg").Length/1KB))KB"
