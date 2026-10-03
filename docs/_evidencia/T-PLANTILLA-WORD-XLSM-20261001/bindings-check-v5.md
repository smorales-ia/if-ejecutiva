# Bindings check v5 — T-PLANTILLA-WORD-XLSM-20261001

| Métrica | v4 | v5 | OK |
|---|---|---|---|
| Bindings `{d.*}` (count `{d.`) | 528 | 528 | ✅ |
| Loops `[i=` | 186 | 186 | ✅ |
| Placeholders huérfanos en el render | 0 | 0 | ✅ |
| XML `document.xml` bien formado | sí | sí (validado `minidom`) | ✅ |

v5 solo normalizó el espaciado de párrafo de las celdas de comparables (no-op en el render) sobre la
copia de v4; ninguna edición tocó el texto de un marcador.
