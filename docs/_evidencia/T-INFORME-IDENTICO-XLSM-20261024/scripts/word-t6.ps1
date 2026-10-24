param([string]$Doc, [int]$Tabla = 6)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($Doc, $false, $true)
  $t = $d.Tables.Item($Tabla)
  "T$Tabla filas=$($t.Rows.Count) uniforme=$($t.Uniform)"
  foreach ($c in $t.Range.Cells) {
    $txt = ($c.Range.Text -replace "[\r\a\n]+", ' ').Trim()
    if ($c.NestingLevel -eq 1) {
      "  [{0},{1}] w={2:N1} anid={3} :: {4}" -f $c.RowIndex, $c.ColumnIndex, $c.Width, $c.Tables.Count, $txt.Substring(0, [Math]::Min(70, $txt.Length))
    }
  }
  $k = 0
  foreach ($n in $t.Tables) {
    $k++
    $txt = ($n.Range.Text -replace "[\r\a\n]+", ' ').Trim()
    $c0 = $n.Range.Cells.Item(1)
    "  anidada$k filas=$($n.Rows.Count) cols=$($n.Columns.Count) fuente=$($c0.Range.Font.Name) $($c0.Range.Font.Size)pt :: $($txt.Substring(0, [Math]::Min(110, $txt.Length)))"
  }
  $d.Close($false)
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
