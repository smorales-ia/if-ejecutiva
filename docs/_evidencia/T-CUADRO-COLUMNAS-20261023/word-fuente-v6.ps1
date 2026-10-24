# Iguala la fuente de las filas de ítems y totales del cuadro en v6 a la de la celda Superficie.
param([string]$Repo = 'C:\Users\Sergio\Documents\GitHub\if-ejecutiva', [switch]$SoloLeer)
$ErrorActionPreference = 'Stop'
$dst = Join-Path $Repo 'docs\_artefactos\carbone\PLANTILLA_MET_v6.docx'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($dst)
  $rng = $doc.Content
  if (-not $rng.Find.Execute('Detalle Item valorado')) { throw 'sin encabezado' }
  function Buscar($t) {
    if ($t.Rows.Count -eq 12 -and $t.Range.Text -like '*Detalle Item valorado*' -and $t.Range.Text -like '*TOTAL TERRENO*') { return $t }
    foreach ($n in $t.Tables) { $h = Buscar $n; if ($h) { return $h } }
    return $null
  }
  $tbl = Buscar $rng.Tables.Item(1)
  if (-not $tbl) { throw 'no encontre la tabla del cuadro (12 filas)' }
  $ref = $tbl.Cell(3, 11).Range.Font
  "referencia: $($ref.Name) $($ref.Size)"
  for ($r = 3; $r -le 11; $r++) {
    $row = $tbl.Rows.Item($r)
    foreach ($cel in $row.Cells) {
      $f = $cel.Range.Font
      "  ($r,$($cel.ColumnIndex)) $($f.Name) $($f.Size)" | Where-Object { $SoloLeer -and ($f.Size -ne $ref.Size -or $f.Name -ne $ref.Name) }
      if (-not $SoloLeer) { $f.Name = $ref.Name; $f.Size = $ref.Size }
    }
  }
  if (-not $SoloLeer) { $doc.Save() }
  $doc.Close([ref]0)
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
'OK'
