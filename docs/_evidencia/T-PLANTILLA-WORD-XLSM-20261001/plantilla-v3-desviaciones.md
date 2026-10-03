# Desviaciones plantilla v3 → especificación XLSM — T-PLANTILLA-WORD-XLSM-20261001

Mapeo de la plantilla contra `xlsm-layout-spec.md`. v3 = 15 tablas Word, 37 InlineShapes, 528 bindings.

| Elemento docx | v3 | Spec XLSM / original | Acción |
|---|---|---|---|
| Logo InlineShape(1) | 252×161pt (r1.57) | render original 281×165 (r1.71) | Word COM resize → **hecho** |
| Marco logo Table(2) | rowH 216pt, muy arriba | caja más alta, reparto más bajo | Word COM rowH 300 + space 42 → **hecho** |
| Etiquetas antecedentes Table(4) | sin sangría (x=63) | sangría (x=123) | Word COM LeftIndent 40 → **hecho** |
| Encabezados/etiquetas de sección | `#D4D4D4` gris | `#095085` azul + texto blanco (XLSM Impresion = 100% azul) | flip 209 celdas → **hecho** |
| Fuente Hoja 2 | Calibri | Calibri (XLSM Impresion) | ya coincidía — NO cambiar |
| Caja VALOR TASACION | banda azul OK, anchos | ajuste fino de columnas | pendiente (Ola futura) |

Nota: el gris `#D4D4D4` del docx NO existe en el XLSM Impresion (solo `#095085`); era un error de
la plantilla original, no del oráculo. Por eso el flip masivo a azul es correcto.
