# Bindings check v4 — T-PLANTILLA-WORD-XLSM-20261001

| Métrica | v3 | v4 | OK |
|---|---|---|---|
| Bindings `{d.*}` (count `{d.`) | 528 | 528 | ✅ |
| Loops `[i=` | 186 | 186 | ✅ |
| Placeholders huérfanos en el render | 0 | 0 | ✅ |
| XML `document.xml` bien formado | sí | sí (validado `minidom`) | ✅ |

## Prueba crítica del método Word (gate G3/G4)
Round-trip de Word (abrir→guardar sin editar) conserva los 528 bindings. Word inserta
`<w:lastRenderedPageBreak/>` dentro de un binding (`…ufM2Construccion:formatN(2)` partido antes del
`}`), pero **Carbone une markers partidos entre runs** → el render sale correcto: 0 huérfanos, sin
fragmentos literales (`ufM2Construccion`/`formatN` NO aparecen en el PDF). Método validado.
