param([string]$Libro)
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false; $xl.AutomationSecurity = 3
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  $ws = $wb.Worksheets.Item('Impresion')
  $ws.Activate()
  $xl.ActiveWindow.View = 2   # vista previa de salto de página, para que calcule los cortes
  "cortes horizontales: " + (@(1..$ws.HPageBreaks.Count | ForEach-Object { $ws.HPageBreaks.Item($_).Location.Row }) -join ', ')
  "cortes verticales: " + $ws.VPageBreaks.Count
  "margenes cm: izq=$([math]::Round($ws.PageSetup.LeftMargin/28.35,2)) der=$([math]::Round($ws.PageSetup.RightMargin/28.35,2)) sup=$([math]::Round($ws.PageSetup.TopMargin/28.35,2)) inf=$([math]::Round($ws.PageSetup.BottomMargin/28.35,2)) centrarH=$($ws.PageSetup.CenterHorizontally)"
  $ancho = 0; for ($c = 1; $c -le 75; $c++) { $ancho += $ws.Columns.Item($c).Width }
  "ancho A:BW en pt = $([math]::Round($ancho,1))"
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
