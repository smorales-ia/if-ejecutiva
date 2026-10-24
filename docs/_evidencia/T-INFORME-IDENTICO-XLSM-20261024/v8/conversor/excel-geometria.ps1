param([string]$Libro, [string]$Salida, [string]$Hoja = 'Impresion', [int]$NCol = 76, [int]$NFil = 555)
# Geometría de Impresion: columnas y filas (pt) y formas (posición, tamaño, z, relleno, línea, texto).
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $ws = $wb.Worksheets.Item($Hoja)
  $o = New-Object System.Collections.Generic.List[string]
  for ($c = 1; $c -le $NCol; $c++) { $col = $ws.Columns.Item($c); $o.Add("COL`t$c`t$($col.Left)`t$($col.Width)") }
  for ($r = 1; $r -le $NFil; $r++) { $row = $ws.Rows.Item($r); $o.Add("ROW`t$r`t$($row.Top)`t$($row.Height)") }
  foreach ($s in $ws.Shapes) {
    $fill = ''; $line = ''; $txt = ''; $font = ''
    try { if ($s.Fill.Visible) { $fill = '{0}|{1}' -f $s.Fill.ForeColor.RGB, $s.Fill.Transparency } } catch {}
    try { if ($s.Line.Visible) { $line = '{0}|{1}|{2}' -f $s.Line.ForeColor.RGB, $s.Line.Weight, $s.Line.DashStyle } } catch {}
    try {
      if ($s.TextFrame2.HasText) {
        $tr = $s.TextFrame2.TextRange
        $txt = ($tr.Text -replace "[\t\r\n]+", ' / ')
        $font = '{0}|{1}|{2}|{3}|{4}' -f $tr.Font.Name, $tr.Font.Size, $tr.Font.Bold, $tr.Font.Fill.ForeColor.RGB, $tr.ParagraphFormat.Alignment
        $font += '|m={0},{1},{2},{3}|va={4}' -f $s.TextFrame2.MarginLeft, $s.TextFrame2.MarginRight, $s.TextFrame2.MarginTop, $s.TextFrame2.MarginBottom, $s.TextFrame2.VerticalAnchor
      }
    } catch {}
    $o.Add(("SHP`t{0}`t{1}`t{2}`t{3}`t{4}`t{5}`t{6}`t{7}`t{8}`t{9}`t{10}`t{11}`t{12}`t{13}`t{14}" -f $s.Name, $s.Type, $s.Left, $s.Top, $s.Width, $s.Height, $s.Visible, $s.ZOrderPosition, $s.TopLeftCell.Address($false,$false), $s.BottomRightCell.Address($false,$false), $fill, $line, $s.Rotation, $txt, $font))
  }
  $ps = $ws.PageSetup
  $o.Add("AREA`t$($ps.PrintArea)`tzoom=$($ps.Zoom)`tvisible=$($ws.Visible)"); $o.Add("PAGE`tzoom=$($ps.Zoom)`tfitW=$($ps.FitToPagesWide)`tfitT=$($ps.FitToPagesTall)`tL=$($ps.LeftMargin)`tR=$($ps.RightMargin)`tT=$($ps.TopMargin)`tB=$($ps.BottomMargin)`tH=$($ps.HeaderMargin)`tF=$($ps.FooterMargin)`tcH=$($ps.CenterHorizontally)`tcV=$($ps.CenterVertically)`tpaper=$($ps.PaperSize)")
  [IO.File]::WriteAllLines($Salida, $o, (New-Object System.Text.UTF8Encoding($false)))
  "lineas=$($o.Count)"
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
