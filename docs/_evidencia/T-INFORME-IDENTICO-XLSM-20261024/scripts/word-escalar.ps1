param([string]$Docx, [string]$Salida, [string]$Pdf, [double]$K = 0.611)
# Escala la tabla (y formas) que Word armó desde el HTML de Excel a una página A4,
# como la impresión «1 página de ancho» de la planilla. Exporta también un PDF de Word.
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($Docx)
  $ps = $d.PageSetup
  $ps.PaperSize = 7   # wdPaperA4
  $ps.Orientation = 0
  $ps.LeftMargin = 14.2; $ps.RightMargin = 14.2; $ps.TopMargin = 14.2; $ps.BottomMargin = 0
  $t = $d.Tables.Item(1)
  $t.AllowAutoFit = $false
  $t.Rows.Alignment = 1   # centrada
  foreach ($c in $t.Range.Cells) { $c.Width = [single]($c.Width * $K) }
  foreach ($r in $t.Rows) {
    if ($r.Height -lt 9999) { $r.Height = [single]($r.Height * $K) }
    $r.HeightRule = 2
  }
  $t.TopPadding = 0; $t.BottomPadding = 0; $t.LeftPadding = 0.5; $t.RightPadding = 0.5
  # Fuentes: por párrafo (las celdas casi siempre tienen un tamaño único)
  foreach ($p in $d.Paragraphs) {
    $s = $p.Range.Font.Size
    if ($s -gt 0 -and $s -lt 999) { $p.Range.Font.Size = [single]([math]::Round($s * $K * 2) / 2) }
    else { foreach ($ch in $p.Range.Words) { $w = $ch.Font.Size; if ($w -gt 0 -and $w -lt 999) { $ch.Font.Size = [single]([math]::Round($w * $K * 2) / 2) } } }
    $p.SpaceBefore = 0; $p.SpaceAfter = 0
  }
  foreach ($sh in $d.Shapes) {
    $sh.LockAspectRatio = 0
    $sh.Left = [single]($sh.Left * $K); $sh.Top = [single]($sh.Top * $K)
    $sh.Width = [single]($sh.Width * $K); $sh.Height = [single]($sh.Height * $K)
  }
  $d.SaveAs2($Salida, 16)
  $d.ExportAsFixedFormat($Pdf, 17)
  "paginas=$($d.ComputeStatistics(2))"
  $d.Close($false)
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
