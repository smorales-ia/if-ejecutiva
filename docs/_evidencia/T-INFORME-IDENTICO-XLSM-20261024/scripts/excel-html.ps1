param([string]$Libro, [string]$Rango, [string]$Html, [string]$Docx)
# Publica un rango de Impresion como HTML estático (Excel) y lo abre en Word para guardarlo como DOCX.
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $po = $wb.PublishObjects.Add(4, $Html, 'Impresion', $Rango, 0, '', '')
  $po.Publish($true)
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $d = $word.Documents.Open($Html, $false, $true)
  $d.SaveAs2($Docx, 16)   # wdFormatDocumentDefault
  "tablas=$($d.Tables.Count) imagenes=$($d.InlineShapes.Count) formas=$($d.Shapes.Count) paginas=$($d.ComputeStatistics(2))"
  $d.Close($false)
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
