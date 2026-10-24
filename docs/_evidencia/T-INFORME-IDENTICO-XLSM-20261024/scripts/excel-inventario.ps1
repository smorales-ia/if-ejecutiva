param([string]$Libro, [string]$SalidaCeldas, [string]$SalidaImagenes)
# Inventario de Impresion: celdas con fórmula (dirección, fórmula, texto mostrado,
# formato numérico, alineación) e imágenes (nombre, celda ancla, tamaño, fórmula de vínculo).
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $ws = $wb.Worksheets.Item('Impresion')
  $rg = $ws.Range('A1:BW554')
  $out = New-Object System.Collections.Generic.List[string]
  $out.Add("dir`tformula`ttexto`tformato`talin`tmerge")
  try { $f = $rg.SpecialCells(-4123) } catch { $f = $null }   # xlCellTypeFormulas
  if ($f) {
    foreach ($a in $f.Areas) {
      foreach ($c in $a.Cells) {
        $m = if ($c.MergeCells) { $c.MergeArea.Address($false, $false) } else { '' }
        $out.Add(("{0}`t{1}`t{2}`t{3}`t{4}`t{5}" -f $c.Address($false, $false), $c.Formula, ($c.Text -replace "[\t\r\n]", ' '), $c.NumberFormat, $c.HorizontalAlignment, $m))
      }
    }
  }
  [IO.File]::WriteAllLines($SalidaCeldas, $out, (New-Object System.Text.UTF8Encoding($false)))
  $im = New-Object System.Collections.Generic.List[string]
  $im.Add("nombre`ttipo`tancla`tancho`talto`tvinculo")
  foreach ($s in $ws.Shapes) {
    $vinc = try { $s.DrawingObject.Formula } catch { '' }
    $im.Add(("{0}`t{1}`t{2}`t{3:N1}`t{4:N1}`t{5}" -f $s.Name, $s.Type, $s.TopLeftCell.Address($false, $false), $s.Width, $s.Height, $vinc))
  }
  [IO.File]::WriteAllLines($SalidaImagenes, $im, (New-Object System.Text.UTF8Encoding($false)))
  "formulas=$($out.Count - 1) formas=$($im.Count - 1)"
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
