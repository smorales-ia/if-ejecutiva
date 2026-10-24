param([string]$Libro, [string]$Salida, [string]$PdfExcel)
# Copia el xlsm como xlsx (sin macros) dejando visibles sólo Tapa e Impresion, y
# exporta además el PDF que hace Excel de esas dos hojas (referencia de fidelidad).
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
$xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $wb.Worksheets.Item('Tapa').Visible = -1
  foreach ($ws in $wb.Worksheets) { if ($ws.Name -ne 'Tapa' -and $ws.Name -ne 'Impresion') { $ws.Visible = 0 } }
  # Orden de impresión: Tapa primero.
  $wb.Worksheets.Item('Tapa').Move($wb.Worksheets.Item(1))
  $wb.Worksheets.Item('Tapa').Activate()
  $wb.SaveAs($Salida, 51)   # xlOpenXMLWorkbook (.xlsx)
  if ($PdfExcel) { $wb.ExportAsFixedFormat(0, $PdfExcel, 0, $true, $false) }
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
"OK"
