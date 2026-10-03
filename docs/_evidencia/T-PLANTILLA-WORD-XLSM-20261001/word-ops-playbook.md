# Playbook de operaciones Word (COM) — T-PLANTILLA-WORD-XLSM-20261001

Automatización de Word real vía COM a través del interop WSL→Windows (`powershell.exe`). Es el
mecanismo disponible en este entorno (no hay "computer use" de clics GUI, pero COM edita el mismo
Word de escritorio con control preciso en puntos/pulgadas — mejor para geometría exacta).

## Verificado en la PC de Sergio
- Word 16.0 (build 16.0.20430), COM accesible: `New-Object -ComObject Word.Application`.
- Round-trip abrir→guardar es Carbone-safe (ver bindings-check-v4.md).

## Receta
```
$w = New-Object -ComObject Word.Application; $w.Visible=$false; $w.DisplayAlerts=0
$doc = $w.Documents.Open("C:\...\PLANTILLA_MET_v4.docx")
# Logo (InlineShape): $s=$doc.InlineShapes.Item(1); $s.LockAspectRatio=0; $s.Width=281; $s.Height=165   (pt)
# Alto de fila (marco): $t=$doc.Tables.Item(2); $t.Rows.Item(1).HeightRule=1; $t.Rows.Item(1).Height=300  (pt, AtLeast)
# Espacio sobre tabla: $para.Format.SpaceBefore = 42   (pt)
# Sangría etiquetas: $cell.Range.ParagraphFormat.LeftIndent = 40   (pt)
# Sombreado/borde de celda: $cell.Shading.BackgroundPatternColor ; $cell.Borders
$doc.Save(); $doc.Close(); $w.Quit()
```
Constantes: `HeightRule`: 0=Auto, 1=AtLeast, 2=Exactly. Colores Word en BGR entero.

## Limitaciones / cuidados
- Word re-pagina e inserta `lastRenderedPageBreak` (Carbone lo tolera).
- No escribir texto dentro de celdas con bindings `{d.*}`.
- Verificar bindings 528/528 tras cada guardado.
- Para flips de color masivos y targeteados por texto, la edición directa de `document.xml`
  (validada Carbone-safe) fue más eficiente que recorrer celdas por COM — se usó para las bandas de
  sección gris→azul.
