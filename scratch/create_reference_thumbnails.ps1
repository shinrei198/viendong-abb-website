param(
  [string]$SourceRoot = 'F:\ABB\ABB-Web-Document\VIEN DONG UP WEB',
  [string]$OutputRoot = 'F:\ABB\Vien-Dong-Website\scratch\reference-thumbnails',
  [int]$MaxParallel = 2
)

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputRoot)
$scratchRoot = [System.IO.Path]::GetFullPath('F:\ABB\Vien-Dong-Website\scratch')
if (-not $resolvedOutput.StartsWith($scratchRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Output must stay inside the project scratch directory: $resolvedOutput"
}

New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null
$folders = Get-ChildItem -LiteralPath $SourceRoot -Directory
$pending = [System.Collections.Generic.Queue[object]]::new()
$folders | ForEach-Object { $pending.Enqueue($_) }
$jobs = @()

while ($pending.Count -gt 0 -or $jobs.Count -gt 0) {
  while ($pending.Count -gt 0 -and $jobs.Count -lt $MaxParallel) {
    $folder = $pending.Dequeue()
    $folderOutput = Join-Path $resolvedOutput $folder.Name
    New-Item -ItemType Directory -Path $folderOutput -Force | Out-Null

    $jobs += Start-Job -ArgumentList $folder.FullName, $folderOutput -ScriptBlock {
      param($InputFolder, $DestinationFolder)
      Add-Type -AssemblyName System.Drawing
      $files = Get-ChildItem -LiteralPath $InputFolder -File -Filter *.png
      foreach ($file in $files) {
        $source = [System.Drawing.Image]::FromFile($file.FullName)
        try {
          $thumbnail = New-Object System.Drawing.Bitmap 256, 256
          try {
            $graphics = [System.Drawing.Graphics]::FromImage($thumbnail)
            try {
              $graphics.Clear([System.Drawing.Color]::White)
              $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
              $graphics.DrawImage($source, 0, 0, 256, 256)
            } finally {
              $graphics.Dispose()
            }
            $destination = Join-Path $DestinationFolder $file.Name
            $thumbnail.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
          } finally {
            $thumbnail.Dispose()
          }
        } finally {
          $source.Dispose()
        }
      }
      [pscustomobject]@{ Folder = Split-Path $InputFolder -Leaf; Count = $files.Count }
    }
  }

  $completed = @($jobs | Where-Object { $_.State -in @('Completed', 'Failed', 'Stopped') })
  foreach ($job in $completed) {
    Receive-Job -Job $job
    Remove-Job -Job $job
    $jobs = @($jobs | Where-Object { $_.Id -ne $job.Id })
  }

  if ($jobs.Count -gt 0) { Start-Sleep -Milliseconds 500 }
}

$count = (Get-ChildItem -LiteralPath $resolvedOutput -Recurse -File -Filter *.png).Count
Write-Output "Created $count reference thumbnails in $resolvedOutput"
