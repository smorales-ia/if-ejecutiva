# v8 · Hoja 1 · bloque «Identificación» como el original MET-6283 (Impresion!C7:BV19 del xlsm).
# Escala del original: la planilla impresa al 58 % (fila 15 pt → 8,7 pt; Calibri 9/10 → 5,2/5,8 pt).
# Reconstruye la tabla anidada de T6[3,2] conservando el marcador del mapa (descr + imageFit).
param([string]$Doc)
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
$AZUL = 14857357        # RGB(141,180,226) en BGR — relleno de Sello SEC y del encabezado de expropiación
$L = 0; $C = 1; $J = 3  # alineaciones
function Pt([double]$x) { [single]$x }
try {
  $d = $word.Documents.Open($Doc)
  $t6 = $d.Tables.Item(6)
  $celda = $t6.Cell(3, 2)
  $vieja = $celda.Tables.Item(1)
  if ($vieja.Range.InlineShapes.Count -ne 1) { throw "esperaba 1 imagen (mapa) en la tabla vieja, hay $($vieja.Range.InlineShapes.Count)" }
  # La tabla nueva va en el párrafo que sigue a la vieja, dentro de la misma celda;
  # el mapa se traslada con FormattedText (sin portapapeles) y luego se borra la vieja.
  # Dos párrafos tras la vieja: el primero separa (si no, Word une las tablas).
  $pos = $vieja.Range
  $pos.Collapse(0)
  $pos.InsertParagraphAfter(); $pos.InsertParagraphAfter()
  $sepPar = $vieja.Range; $sepPar.Collapse(0)
  $pos = $d.Range($sepPar.End + 1, $sepPar.End + 1)
  $t = $d.Tables.Add($pos, 13, 10)
  $t.Borders.Enable = $false
  $t.TopPadding = 0; $t.BottomPadding = 0; $t.LeftPadding = (Pt 1); $t.RightPadding = (Pt 1)
  $t.Spacing = 0
  $anchos = 38.9, 7.2, 88.1, 50.2, 7.2, 114.7, 59.4, 7.2, 59.4, 112.7
  for ($k = 1; $k -le 10; $k++) { $t.Columns.Item($k).Width = (Pt $anchos[$k - 1]) }
  $t.Range.Font.Name = 'Calibri'; $t.Range.Font.Size = (Pt 5.2); $t.Range.Font.Bold = $false
  $t.Range.Font.Color = 0
  $t.Range.ParagraphFormat.SpaceBefore = 0; $t.Range.ParagraphFormat.SpaceAfter = 0
  $t.Range.ParagraphFormat.LineSpacingRule = 0
  $t.Range.Cells.Shading.BackgroundPatternColor = -16777216
  for ($r = 1; $r -le 13; $r++) { $t.Rows.Item($r).HeightRule = 2; $t.Rows.Item($r).Height = (Pt 8.7) }
  $t.Range.Cells.VerticalAlignment = 1

  function Pon($r, $c, $txt, $tam = 5.2, $negrita = $false, $alin = $L, $sangria = 0) {
    $rg = $t.Cell($r, $c).Range
    $rg.Text = $txt
    $rg.Font.Size = (Pt $tam); $rg.Font.Bold = $negrita
    $rg.ParagraphFormat.Alignment = $alin
    $rg.ParagraphFormat.LeftIndent = (Pt $sangria)
  }
  $V = 5.8   # valores (Calibri 10 en la planilla)
  $filas = @(
    @('Cliente', '{d.partes.propietario}', 4.6, 'Dirección', '{d.propiedad.calle}', 'DFL-2', '{d.propiedad.dfl2}'),
    @('RUT Cliente', '{d.partes.rut}', $V, 'Casa Nº', '{d.cualitativa.detallePropiedad.casaNumero}', 'Año Construccion', '{d.propiedad.anioConstruccion}'),
    @('Propietario', '{d.partes.propietario}', 4.6, 'Comuna', '{d.propiedad.comuna}', 'Vida util', '{d.propiedad.vidaUtil}'),
    @('RUT Prop.', '{d.partes.rut}', $V, 'Region', '{d.propiedad.region}', 'Permiso', '{d.legales.permisoEdificacion}'),
    @('Ejecutivo', '{d.partes.ejecutivo}', $V, 'Rol', '{d.propiedad.rolImpreso}', 'Recepcion', '{d.legales.recepcionFinal}'),
    @('Tasador', '{d.partes.tasador.nombre}', $V, 'Condominio', '{d.propiedad.proyectoCondominio}', 'Ampliación', '{d.cualitativa.detallePropiedad.ampliacion}'),
    @('Objetivo', '{d.propiedad.objetivo}', $V, $null, $null, 'Estado conservacion', '{d.propiedad.estadoConservacion:upperCase}'),
    @('Tipo Prop.', '{d.propiedad.tipoPropiedad}', $V, $null, $null, 'Sello SEC', '{d.cualitativa.detallePropiedad.selloSec}'),
    @('Fecha Tasación', '{d.partes.fechaVisita:formatD(DD-MM-YYYY)}', $V, $null, $null, 'Afecto a expropi.', '{d.cualitativa.detallePropiedad.afectoExpropiacion}'),
    @('Destino SII', '{d.sii.destinoSii}', $V, $null, $null, 'Fuente Información', '{d.cualitativa.detallePropiedad.fuenteInformacion}'),
    @('Ejecutivo', '', $V, $null, $null, $null, $null),
    @('Formalizador', '', $V, $null, $null, $null, $null),
    @('N° SOLICITUD', '{d.meta.nOperacionCliente}', $V, $null, $null, $null, $null)
  )
  for ($r = 1; $r -le 13; $r++) {
    $f = $filas[$r - 1]
    Pon $r 1 $f[0]
    if ($r -ne 12) { Pon $r 2 ':' }
    Pon $r 3 $f[1] $f[2]
    if ($f[3]) { Pon $r 4 $f[3]; Pon $r 5 ':'; Pon $r 6 $f[4] $V }
    if ($f[5]) {
      $neg = ($f[5] -eq 'Afecto a expropi.')
      Pon $r 7 $f[5] 5.2 $neg; Pon $r 8 ':'
      Pon $r 9 $f[6] $(if ($neg) { $V } else { $V }) $neg
    }
  }
  # Grupo central, filas con disposición propia (Impresion!U13:AO19)
  Pon 7 4 'Pisos Propiedad:'; Pon 7 5 '{d.propiedad.pisos}' $V
  Pon 7 6 'Subterraneos   :  {d.cualitativa.detallePropiedad.subterraneos}' 5.8 $false $L 22
  Pon 8 6 'Sitio/Lote        {d.cualitativa.detallePropiedad.sitioLote}' 4.6 $false $L 22
  $t.Cell(8, 6).Range.Words.Last.Font.Size = (Pt $V)
  Pon 9 4 'Zona   : {d.cualitativa.detallePropiedad.zona}' 4.6
  $t.Cell(9, 4).Range.Characters.Item(1).Font.Size = (Pt 5.2)
  Pon 9 6 'Manzana    {d.sii.codManzana}' 4.6 $false $L 22
  Pon 10 4 'Estacionamientos Asociados :'; Pon 10 6 '{d.propiedad.estacionamientos}' $V $false $L 14
  Pon 11 4 'Estacionamientos Asignados:';  Pon 11 6 '{d.propiedad.estacionamientos}' $V $false $L 14
  Pon 12 4 'Bodegas'; Pon 12 6 ':  {d.propiedad.bodegas}' $V $false $L 6
  Pon 13 4 'Mansarda'; Pon 13 6 ':  {d.cualitativa.detallePropiedad.mansarda}' $V $false $L 6
  # Expropiación en el grupo derecho (Impresion!AQ17:BG19)
  Pon 11 7 'Descripcion Expropiación' $V $true
  Pon 12 7 '{d.textosIA.textoExpropiacion}' 5.2 $false $J
  # Mapa
  Pon 1 10 'Ubicación/Empresa' $V $false $C
  # Sello SEC con relleno, Arial Narrow negrita (Impresion!AZ14)
  $t.Cell(8, 9).Shading.BackgroundPatternColor = $AZUL
  $t.Cell(8, 9).Range.Font.Name = 'Arial Narrow'; $t.Cell(8, 9).Range.Font.Bold = $true; $t.Cell(8, 9).Range.Font.Size = (Pt 5.2)

  # --- Combinaciones (de derecha a izquierda; las verticales al final) ---
  $t.Cell(13, 7).Merge($t.Cell(13, 9))
  $t.Cell(12, 7).Merge($t.Cell(12, 9))
  $t.Cell(11, 7).Merge($t.Cell(11, 9))
  $t.Cell(11, 4).Merge($t.Cell(11, 5))
  $t.Cell(10, 4).Merge($t.Cell(10, 5))
  $t.Cell(11, 6).Shading.BackgroundPatternColor = $AZUL
  $t.Cell(12, 7).Merge($t.Cell(13, 7))
  $t.Cell(2, 10).Merge($t.Cell(13, 8))
  $map = $t.Cell(2, 10).Range
  $map.Collapse(1)
  $map.FormattedText = $vieja.Range.InlineShapes.Item(1).Range.FormattedText
  $vieja.Delete()
  # Quitar el párrafo separador que quedó antes de la tabla nueva.
  $antes = $t.Range; $antes.Collapse(1)
  $p = $d.Range([Math]::Max($celda.Range.Start, $antes.Start - 1), $antes.Start)
  if ($p.Text -eq "`r") { $p.Delete() | Out-Null }
  $img = $t.Cell(2, 10).Range.InlineShapes.Item(1)
  $img.LockAspectRatio = 0; $img.Width = (Pt 108); $img.Height = (Pt 100)
  $t.Cell(2, 10).Range.ParagraphFormat.Alignment = $C

  # --- Bordes: caja exterior y separadores de grupos (x≈165 · 332 · 458) ---
  $t.Borders.Item(-1).LineStyle = 1; $t.Borders.Item(-2).LineStyle = 1   # top, left
  $t.Borders.Item(-3).LineStyle = 1; $t.Borders.Item(-4).LineStyle = 1   # bottom, right
  foreach ($b in -1, -2, -3, -4) { $t.Borders.Item($b).LineWidth = 4 }
  $sep = @{ 1 = 3, 6, 9; 2 = 3, 6, 9; 3 = 3, 6, 9; 4 = 3, 6, 9; 5 = 3, 6, 9; 6 = 3, 6, 9; 7 = 3, 6, 9; 8 = 3, 6, 9; 9 = 3, 6, 9; 10 = 3, 5, 8; 11 = 3, 5, 6; 12 = 3, 6, 7; 13 = 3, 6, 7 }
  for ($r = 1; $r -le 13; $r++) {
    foreach ($c in $sep[$r]) {
      try { $bd = $t.Cell($r, $c).Borders.Item(-4); $bd.LineStyle = 1; $bd.LineWidth = 4 } catch {}
    }
  }
  # caja de la expropiación y del encabezado
  foreach ($b in -1, -3) { $bd = $t.Cell(11, 6).Borders.Item($b); $bd.LineStyle = 1; $bd.LineWidth = 4 }
  $d.Save()
  "OK filas=$($t.Rows.Count)"
  $d.Close()
} finally { $word.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
