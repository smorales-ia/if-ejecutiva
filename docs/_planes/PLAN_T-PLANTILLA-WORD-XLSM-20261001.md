# PLAN — T-PLANTILLA-WORD-XLSM-20261001

Cerrar la identidad visual (≥98%, meta 100%) usando **Word de escritorio sobre la PC de Sergio**
como editor y el **XLSM original** como fuente de verdad del layout. Espejo: VP-2026-0067.

## §1 Resumen
Cambio de método respecto de tandas previas (que llegaron a 82-85% con edición programática del
docx): ahora la plantilla se edita en **Word real** (automatización COM vía interop WSL→Windows) y
se calibra contra el **XLSM** y el **PDF original renderizado** (medición de geometría con pymupdf).
El render sigue siendo directo contra Carbone (`render-carbone.mjs`, sin tocar E2/E3).

**Hallazgo clave del gate**: el round-trip de Word (abrir→guardar) **preserva los 528 bindings** y
**Carbone tolera** la fragmentación que Word introduce (inserta `<w:lastRenderedPageBreak/>` dentro
de un binding; Carbone une markers partidos entre runs → render correcto, 0 huérfanos). El método
es viable.

## §2 Alcance SÍ / NO
**SÍ**: editar la plantilla en Word COM sobre la PC de Sergio; medir geometría del original/XLSM;
subir v4 a Carbone (templateId nuevo); render directo v4; validar. Cierra Hojas 1, 2, 3, 8; verifica resto.
**NO**: tocar oráculo; romper bindings `{d.*}`/loops; re-apuntar E2 (lo hace Sergio); cambiar datos
de VP-0067 ni cálculos; re-abrir fotos (Hojas 5-6 ya OK); commit/push.

## §3 Especificación de layout del XLSM
Ver `docs/_evidencia/T-PLANTILLA-WORD-XLSM-20261001/xlsm-layout-spec.md` (celda/estilo por hoja).
Datos clave confirmados: banda azul `#095085`; **Hoja 2 (Impresion) usa Calibri** 8-11pt (el v2/v3
ya coincide — NO cambiar a Arial); portada usa Arial/Arial Narrow pero el PDF original renderiza
Calibri (la plantilla hereda bien); bordes "hair"/"medium" en Excel.

## §4 Diff residual priorizado (v3 vs original, medido con pymupdf)
| Hoja | Brecha | Medición | Prioridad |
|---|---|---|---|
| 1 | Reparto vertical: ANTECEDENTES ~120pt demasiado arriba | orig y=465, v3 y=345 | ALTA → **resuelto en v4 (y=463)** |
| 1 | Logo: tamaño/ratio | orig 281×165 r1.71, v3 253×161 r1.57 | ALTA → **resuelto (281×165 r1.70)** |
| 1 | Sangría de etiquetas | orig x=123, v3 x=63 | MEDIA → **resuelto (+40pt indent)** |
| 2 | Densidad de tablas + caja VALOR TASACION | pendiente | ALTA (pendiente) |
| 8 | Maqueta documentos legales/firma | pendiente | ALTA (pendiente) |
| 3 | Verificar cuadros técnicos | pendiente | MEDIA (verificar) |

## §5 Desviaciones de la plantilla v3 → acciones Word
Hoja 1: logo InlineShape(1) 252→281×165; frame Table(2) rowH 216→300pt; space-before frame +42pt;
Table(4) col1 indent +40pt. (Aplicado en v4.) Hojas 2/3/8: medir contra XLSM y ajustar anchos/altos/
cajas (pendiente de ola adicional).

## §6 Playbook de operaciones Word (COM)
- Abrir: `Word.Application` invisible, `DisplayAlerts=0`, `Documents.Open(path)`.
- Geometría: `InlineShapes(i).Width/.Height` (pt, con `LockAspectRatio=0`); `Tables(t).Rows(r).Height`
  + `.HeightRule=1` (AtLeast); `ParagraphFormat.SpaceBefore/.LeftIndent` (pt); `Cell.Shading`,
  `Cell.Borders`.
- Guardar `.Save()`, `.Close()`, `.Quit()`. Verificar bindings 528/528 tras cada guardado.
- Limitación: Word re-pagina e inserta `lastRenderedPageBreak` (Carbone lo tolera). No escribir texto
  dentro de celdas con bindings.

## §7 Inventario de bindings a preservar
528 bindings `{d.*}` (456 únicos), 186 loops `[i=`. Verificado: round-trip de Word los conserva
(count `{d.`=528 pre y post). Ninguna edición de formato toca el texto de un marcador.

## §8 Plan de ejecución por hoja
Ola 1 (serie, un .docx en Word): Hoja 1 (hecha) → Hoja 2 → Hoja 3 → Hojas 4/7 → Hoja 8. Guardar +
verificar bindings entre hojas. Ola 2: subir v4 + render. Tests + auditor ciego + gate.

## §9 Batería de tests
Comparación lado a lado por hoja; regresión de datos (14/14, formato chileno, CI-057 −3%/36%, dólar
890,33); bindings sin huérfanos; geometría medida (y-coords) vs original; auditor ciego independiente.

## §10 Riesgos y rollback
Riesgo: Word corrompe bindings (mitigado: verificado round-trip + render). Riesgo: COM cuelga por
diálogo (mitigado: DisplayAlerts=0, timeouts). Rollback: `rollback/PLANTILLA_MET_v3_BACKUP.docx`;
v3 intacta; `.env.local`/Make/Airtable sin tocar.

## §11 GATES
- G1 credenciales → PASS. G2 spec XLSM → PASS. G3 PC vinculada + Word operable (COM) → **PASS**
  (Word 16.0, round-trip Carbone-safe). G4 inventario bindings cerrado → PASS. G5 rollback v3 → PASS.
- Gate de HECHO (≥98%): según auditor ciego sobre v4.
