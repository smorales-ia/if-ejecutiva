param([string]$Doc, [string[]]$Textos)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($Doc, $false, $true)
  "secciones=$($d.Sections.Count) tablas_nivel1=$($d.Tables.Count) paginas=$($d.ComputeStatistics(2))"
  $i = 0
  foreach ($t in $d.Tables) {
    $i++
    $txt = ($t.Range.Text -replace "[\r\a\n]+", ' ')
    "T$i filas=$($t.Rows.Count) cols=$($t.Columns.Count) anid=$($t.Tables.Count) pag=$($t.Range.Information(3)) :: $($txt.Substring(0, [Math]::Min(90, $txt.Length)))"
  }
  foreach ($x in $Textos) {
    $r = $d.Content
    if ($r.Find.Execute($x)) {
      $enTabla = $r.Information(12)
      $info = "«$x» pag=$($r.Information(3)) enTabla=$enTabla"
      if ($enTabla) {
        $c = $r.Cells.Item(1)
        $info += " fila=$($c.RowIndex) col=$($c.ColumnIndex) anid=$($c.NestingLevel) anchoCelda=$([math]::Round($c.Width,1))"
        $tb = $r.Tables.Item(1)
        $info += " tabla=$($tb.Rows.Count)x$($tb.Columns.Count)"
      }
      $info
    } else { "«$x» NO encontrado" }
  }
  $d.Close($false)
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
