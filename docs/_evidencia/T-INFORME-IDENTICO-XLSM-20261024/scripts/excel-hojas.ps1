param([string]$Libro)
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
$xl.AutomationSecurity = 3   # msoAutomationSecurityForceDisable: no correr macros
try {
  $wb = $xl.Workbooks.Open($Libro, 0, $true)
  foreach ($ws in $wb.Worksheets) {
    $vis = switch ($ws.Visible) { -1 { 'visible' } 0 { 'oculta' } 2 { 'muy oculta' } default { $ws.Visible } }
    $pa = $ws.PageSetup.PrintArea
    $paginas = try { $ws.PageSetup.Pages.Count } catch { '?' }
    "{0,-22} {1,-10} area={2,-22} paginas={3} orient={4} zoom={5} fit={6}x{7}" -f $ws.Name, $vis, $pa, $paginas, $ws.PageSetup.Orientation, $ws.PageSetup.Zoom, $ws.PageSetup.FitToPagesWide, $ws.PageSetup.FitToPagesTall
  }
  $wb.Close($false)
} finally { $xl.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null }
