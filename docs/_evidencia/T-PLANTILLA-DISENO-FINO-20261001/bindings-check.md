# Bindings check — T-PLANTILLA-DISENO-FINO-20261001

Verifica que la plantilla v3 conserva todos los bindings Carbone y la imagen embebida.

| Métrica | v2 | v3 | OK |
|---|---|---|---|
| Bindings `{d.*}` (total) | 528 | 528 | ✅ |
| Placeholders `{d.` huérfanos en el PDF render | 0 | 0 | ✅ |
| Imagen logo `r:embed="rId9"` | presente | presente | ✅ |
| XML `document.xml` bien formado | sí | sí (validado `minidom`) | ✅ |
| Loops `filas[i=…]` (OFERTAS/CBR) | intactos | intactos | ✅ |

Ediciones Ola 1 (página 1) tocaron SOLO atributos de formato (marco/tabla, `extent` del logo,
`<w:b>` y texto literal de 7 etiquetas). Ningún binding `{d.*}` fue alterado.

Nota: `w101 "Could not open document"` apareció en el primer intento por un error de
concatenación XML en los bordes (`<w:top <w:val=…`); corregido y revalidado antes del render OK.
