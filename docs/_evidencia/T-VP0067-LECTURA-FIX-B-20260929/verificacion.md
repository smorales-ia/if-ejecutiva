# VERIFICACIÓN — T-VP0067-LECTURA-FIX-B-20260929

> Bloque 2, post-write. Fecha: 2026-09-30 (madrugada, hora Chile).

## 1 · El write (Bloque 1)

- `PATCH .../tblur71x1oItbmKZc/rec7t6MPxKu10WniF` → **HTTP 200**.
- El JSON escrito se leyó directamente del bloque ```json de
  `docs/_evidencia/T-VP0067-LECTURA-FIX-20260929/patch-pendiente-A.md` (sin retipear) y la
  respuesta del servidor devolvió el string **idéntico byte a byte** al del archivo.

## 2 · Relectura de la fila (evidencia: `snap-adjuntos-todos-post.json`)

- `atributos_obtenidos` quedó con **8 items**: la terna intacta
  (`foja_cbr=13291`, `numero_cbr=21565`, `ano_inscripcion_cbr=2006`) + los 5 verbatim:

| Campo | Valor cargado |
|---|---|
| `vendedor` | RAUL FERNANDO VALENZUELA PEREZ |
| `comprador` | FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ |
| `nombre_propietario` | FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ |
| `fecha_inscripcion` | 2020-01-13 |
| `comuna` | COLINA |

- `no_extraidos` quedó en `["notaria","superficie_servidumbre_m2","nombre_cbr","repertorio"]`
  (los que de verdad no están legibles en el documento; solo los 2 primeros+2 últimos, de los
  cuales únicamente `notaria` y `nombre_cbr` son obligatorios → naranjos honestos del CBR).
- Comparación campo a campo contra el snapshot pre-write: en la fila CBR cambiaron **solo**
  `atributos_obtenidos` y `ultima_modificacion` (`2026-09-29T23:04:55Z` → `2026-09-30T02:52:17Z`,
  computado por Airtable). Ningún otro campo.

## 3 · Efecto colateral: ninguno

- Las **otras 7 filas** de VP-2026-0067: `clave_adjunto`, `estado_extraccion` y
  `atributos_obtenidos` idénticos al snapshot de la tanda anterior (cotejo fila a fila, sin
  cortes). Nota de método: un primer cotejo dio un falso positivo en el permiso de edificación
  porque el snapshot viejo incluía `nombre_archivo` y la consulta nueva no lo pedía — corregido
  pidiendo los mismos campos; con campos homogéneos, **todo intacto**.
- Inscripción del informe: la terna 13291/21565/2006 sigue en `items[]` sin modificación.
- Ninguna otra tabla ni solicitud tocada (un solo request de escritura en toda la tanda).

## 4 · Naranjos de /lectura recalculados (datos reales + catálogo real, misma lógica del server)

| Escenario | Naranjos | Detalle |
|---|---|---|
| Producción HOY (código viejo + datos patcheados) | **8** | CBR: Notaria, CBR · foto SII: Material, Año, Superficie · TGR: Contribución, Avalúo Afecto, Fecha Emisión |
| Al desplegar la rama `feat/T-VP0067-LECTURA-FIX-20260929` | **6** | La regla por-carpeta cura Contribución y Avalúo Afecto del TGR (ya extraídos de la Consulta SII). Quedan: CBR Notaria + CBR · SII Material + Año + Superficie · TGR Fecha Emisión — **todos honestos** |

Los 5 del CBR **ya no aparecen en ningún escenario**.
