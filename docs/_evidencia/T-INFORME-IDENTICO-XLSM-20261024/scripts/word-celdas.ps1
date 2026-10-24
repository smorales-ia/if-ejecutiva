param([string]$Doc, [int]$Tabla = 6, [int]$Anidada = 1)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($Doc, $false, $true)
  $n = $d.Tables.Item($Tabla).Tables.Item($Anidada)
  foreach ($c in $n.Range.Cells) {
    if ($c.NestingLevel -ne 2) { continue }
    $txt = ($c.Range.Text -replace "[\r\a\n]+", ' ').Trim()
    $fill = $c.Shading.BackgroundPatternColor
    "[{0},{1}] w={2:N1} h={3:N1} fill={4} bold={5} sz={6} :: {7}" -f $c.RowIndex, $c.ColumnIndex, $c.Width, $c.Height, $fill, $c.Range.Font.Bold, $c.Range.Font.Size, $txt
  }
  $d.Close($false)
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
