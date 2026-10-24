# Crea PLANTILLA_MET_v6.docx desde v5 editando en Word de escritorio (COM).
# Solo toca la tabla anidada del CUADRO DE VALORACION (Hoja 1).
param([string]$Repo = 'C:\Users\Sergio\Documents\GitHub\if-ejecutiva')
$ErrorActionPreference = 'Stop'
$src = Join-Path $Repo 'docs\_artefactos\carbone\PLANTILLA_MET_v5.docx'
$dst = Join-Path $Repo 'docs\_artefactos\carbone\PLANTILLA_MET_v6.docx'
if (Test-Path $dst) { throw "ya existe $dst" }
Copy-Item $src $dst

$wdAlignLeft = 0; $wdAlignCenter = 1; $wdAlignRight = 2
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($dst)
  $rng = $doc.Content
  if (-not $rng.Find.Execute('Detalle Item valorado')) { throw 'no encontre el encabezado del cuadro' }
  # Buscar, entre la tabla y sus anidadas, la de 9x17 que contiene el encabezado
  function Buscar($t) {
    if ($t.Rows.Count -eq 9 -and $t.Columns.Count -eq 17 -and $t.Range.Text -like '*Detalle Item valorado*') { return $t }
    foreach ($n in $t.Tables) { $h = Buscar $n; if ($h) { return $h } }
    return $null
  }
  $tbl = Buscar $rng.Tables.Item(1)
  if (-not $tbl) { throw 'no encontre la tabla 9x17 del cuadro' }
  "tabla: filas=$($tbl.Rows.Count) cols=$($tbl.Columns.Count) anidamiento=$($tbl.NestingLevel)"
  if ($tbl.Rows.Count -ne 9 -or $tbl.Columns.Count -ne 17) { throw 'la tabla no tiene la forma esperada (9x17)' }
  $t3 = $tbl.Cell(3, 3).Range.Text
  if ($t3 -notlike '*cuadro.items*i=0*descripcion*') { throw "celda (3,3) inesperada: $t3" }

  function Set-Celda($r, $c, $texto, $align) {
    $cel = $tbl.Cell($r, $c)
    $cel.Range.Text = $texto
    if ($null -ne $align) { $cel.Range.ParagraphFormat.Alignment = $align }
  }
  # Valor con ceros ocultos, como la planilla (0 numérico = celda vacía).
  function SinCero($ruta) { "{d.$($ruta):ifNE(0):showBegin}{d.$($ruta):formatN(2)}{d.$($ruta):showEnd}" }

  # --- Filas de ítems: Word filas 3..8 = items[i=0..5] ---
  for ($k = 0; $k -le 5; $k++) {
    $r = 3 + $k
    $p = "cuadro.items[i=$k]"
    Set-Celda $r 1 "{d.$p.tipoImpreso}" $null
    Set-Celda $r 2 "{d.$p.numeroEnTipo}" $null
    Set-Celda $r 4 "{d.$p.rolSii}" $null
    Set-Celda $r 5 "{d.$p.anio}" $wdAlignCenter
    Set-Celda $r 6 "{d.$p.codigoMaterial}" $wdAlignCenter
    Set-Celda $r 8 "{d.$p.codigoEstado}" $wdAlignCenter
    Set-Celda $r 9 "{d.$p.garantia}" $wdAlignRight
    Set-Celda $r 10 "{d.$p.origenSuperficie}" $wdAlignLeft
    Set-Celda $r 12 (SinCero "$p.ufM2Aplicado") $null
    Set-Celda $r 14 (SinCero "$p.ufM2") $wdAlignRight
    Set-Celda $r 15 (SinCero "$p.ufTotalItem") $null
    Set-Celda $r 16 "{d.$p.valorSeguroUf:formatN(2)}" $wdAlignRight
    Set-Celda $r 17 (SinCero "$p.valorLiquidacionUf") $wdAlignRight
  }

  # --- Tres renglones de totales debajo de la fila 8 (copian su formato) ---
  $tbl.Rows.Item(8).Select()
  $word.Selection.InsertRowsBelow(3)
  "filas tras insertar: $($tbl.Rows.Count)"
  $grupos = @(
    @{ r = 9;  g = 'edificacion';          rotulo = 'TOTAL EDIFICACION' },
    @{ r = 10; g = 'obrasComplementarias'; rotulo = 'TOTAL OBRAS COMPLEMENTARIAS' },
    @{ r = 11; g = 'terreno';              rotulo = 'TOTAL TERRENO' }
  )
  foreach ($x in $grupos) {
    $r = $x.r; $p = "cuadro.totales.$($x.g)"
    for ($c = 1; $c -le 17; $c++) { $tbl.Cell($r, $c).Range.Text = '' }
    # Columnas originales (17) antes de combinar Item+N°+Detalle
    if ($x.g -eq 'edificacion') { Set-Celda $r 5 "{d.$p.anio}" $wdAlignCenter }
    Set-Celda $r 9 "{d.$p.cantidad}" $wdAlignCenter
    Set-Celda $r 11 (SinCero "$p.supM2") $wdAlignRight
    if ($x.g -ne 'terreno') { Set-Celda $r 12 (SinCero "$p.ufM2Nuevo") $wdAlignRight }
    if ($x.g -eq 'edificacion') { Set-Celda $r 13 (SinCero "$p.factor") $wdAlignRight }
    if ($x.g -ne 'obrasComplementarias') { Set-Celda $r 14 (SinCero "$p.ufM2") $wdAlignRight }
    Set-Celda $r 15 "{d.$p.ufTotal:ifGT(0):show(UF):elseShow()}  {d.$p.ufTotal:formatN(2)}" $wdAlignRight
    Set-Celda $r 16 "{d.$p.seguroUf:formatN(2)}" $wdAlignRight
    Set-Celda $r 17 "{d.$p.liquidacionUf:formatN(2)}" $wdAlignRight
    $tbl.Rows.Item($r).Range.Font.Bold = $true
    # Rótulo ancho: combinar Item + N° + Detalle
    $tbl.Cell($r, 1).Merge($tbl.Cell($r, 3))
    $tbl.Cell($r, 1).Range.Text = $x.rotulo
    $tbl.Cell($r, 1).Range.ParagraphFormat.Alignment = $wdAlignLeft
  }

  # --- VALOR COMERCIAL NORMAL (ahora fila 12): «UF» antes del total, como el original ---
  $vc = $tbl.Cell(12, 15).Range.Text
  if ($vc -notlike '*cuadro.totalUf*') { throw "fila 12 col 15 inesperada: $vc" }
  Set-Celda 12 15 'UF  {d.cuadro.totalUf:formatN(2)}' $null

  $doc.Save()
  "filas finales: $($tbl.Rows.Count)"
  $doc.Close()
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
"OK $dst"
