param([string]$Libro, [string]$Salida)
# Copia del xlsm con sólo Tapa e Impresion, convertidas a valores (sin fórmulas
# que lean otras hojas), papel A4 y sin las demás hojas. Base de la prueba de
# fidelidad de Carbone con la planilla del cliente.
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
$xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $wb.Worksheets.Item('Tapa').Visible = -1
  foreach ($n in 'Tapa', 'Impresion') {
    $ws = $wb.Worksheets.Item($n)
    $ur = $ws.UsedRange
    $ur.Value2 = $ur.Value2          # fórmulas → valores
    $ws.PageSetup.PaperSize = 9      # xlPaperA4
  }
  $wb.Worksheets.Item('Tapa').Move($wb.Worksheets.Item(1))
  $borrar = @(); foreach ($ws in $wb.Worksheets) { if ($ws.Name -ne 'Tapa' -and $ws.Name -ne 'Impresion') { $borrar += $ws.Name } }
  foreach ($n in $borrar) { $s = $wb.Worksheets.Item($n); $s.Visible = -1; $s.Delete() }
  # Los nombres definidos que apuntaban a hojas borradas quedan con #REF: se quitan.
  foreach ($nm in @($wb.Names)) { if ($nm.RefersTo -like '*#REF*') { $nm.Delete() } }
  $wb.Worksheets.Item('Tapa').Activate()
  $wb.SaveAs($Salida, 51)
  "hojas: " + (($wb.Worksheets | ForEach-Object { $_.Name }) -join ', ')
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
