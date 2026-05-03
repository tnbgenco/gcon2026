Add-Type -AssemblyName System.Drawing

$source = $PSScriptRoot
$dest = Join-Path $source "Compressed"
$maxBytes = 600 * 2048

if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }

$files = Get-ChildItem -Path (Join-Path $source "*") -Include *.jpg,*.jpeg,*.png,*.bmp,*.tiff,*.tif -File

if ($files.Count -eq 0) {
    Write-Host "No image files found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Image Compressor - Target: 300KB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Found $($files.Count) image(s) to process..." -ForegroundColor Cyan
Write-Host ""

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$count = 0
$errors = 0

foreach ($file in $files) {
    $count++
    Write-Host "[$count/$($files.Count)] $($file.Name)" -NoNewline

    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $outPath = Join-Path $dest ([System.IO.Path]::GetFileNameWithoutExtension($file.Name) + ".jpg")

        # Try quality reduction first
        $quality = 95
        $saved = $false

        while ($quality -ge 10) {
            $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$quality)
            $img.Save($outPath, $jpegCodec, $ep)
            $newSize = (Get-Item $outPath).Length

            if ($newSize -le $maxBytes) {
                $saved = $true
                break
            }

            Remove-Item $outPath -Force
            $quality -= 5
        }

        # If quality reduction alone wasn't enough, resize the image
        if (-not $saved) {
            $ratio = [Math]::Sqrt($maxBytes / $file.Length) * 0.9
            $newW = [int]($img.Width * $ratio)
            $newH = [int]($img.Height * $ratio)

            $resized = New-Object System.Drawing.Bitmap($newW, $newH)
            $g = [System.Drawing.Graphics]::FromImage($resized)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.DrawImage($img, 0, 0, $newW, $newH)
            $g.Dispose()
            $img.Dispose()
            $img = $null

            $tryQ = 85
            while ($tryQ -ge 10) {
                $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
                $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int]$tryQ)
                if (Test-Path $outPath) { Remove-Item $outPath -Force }
                $resized.Save($outPath, $jpegCodec, $ep)
                $newSize = (Get-Item $outPath).Length
                if ($newSize -le $maxBytes) { break }
                $tryQ -= 5
            }

            $resized.Dispose()
        } else {
            $img.Dispose()
        }

        $origKB = [Math]::Round($file.Length / 1024, 1)
        $newKB = [Math]::Round((Get-Item $outPath).Length / 1024, 1)
        $pct = [Math]::Round((1 - (Get-Item $outPath).Length / $file.Length) * 100, 1)
        Write-Host " -> ${origKB}KB => ${newKB}KB ($pct% reduced)" -ForegroundColor Green

    } catch {
        Write-Host " -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
        if ($img) { $img.Dispose() }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Done! $($count - $errors)/$count images compressed." -ForegroundColor Yellow
Write-Host "  Output: $dest" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
