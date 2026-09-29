# Auditoría ciega — T-E2-REAPUNTE-20260929

**Auditor:** independiente (ciego). No se leyó `run-real.md`, `rollback.md`, `tests-output.txt`
ni ningún log/reporte de esta tanda. De la carpeta de la tanda solo se usó
`PDF_generado_VP0067_v4.pdf`. Toda la evidencia de abajo fue recalculada por el auditor
contra Make API, Airtable REST y los PDFs, el 2026-09-29.

## Metodología

1. `GET $MAKE_BASE_URL/scenarios/5750023/blueprint` y `GET /scenarios/5750023` (Token Make,
   solo lectura). Recorrido programático del `flow` completo (incl. rutas) buscando URLs en
   `mapper`/`parameters`; grep byte a byte de ambos templateId (viejo y nuevo) sobre el JSON crudo.
2. `GET /scenarios/{5750023,5791413}/logs?limit=3` (Make) + query REST a Airtable
   `TX_DocumentosGenerados` (`tbl5sYnGPZXgYCBSY`) con `filterByFormula=FIND("VP-2026-0067",
   {clave_natural} & {clave_doc_generado})` tras leer el schema real vía Meta API.
3. Pixel-diff propio con pymupdf 1.28.2 + PIL: render a 100 dpi, `ImageChops.difference`,
   conteo de píxeles no-cero y de píxeles con delta > 16.
   - v4 (tanda) vs v3 (`T-CIERRE-FINAL-20260929/PDF_generado_VP0067_v3.pdf`, plantilla nueva
     verificada por el auditor de la tanda previa): 8 páginas.
   - v4 p1 vs v2 p1 (`T-PDF-IDENTICO-20260927/PDF_generado_VP0067_v2.pdf`, portada vieja).
4. Extracción de texto completo de v4 con pymupdf; búsqueda de literales, conteo de
   `get_images(full=True)` por página y de placeholders `{d.` / `{c.`.

## Criterio 1 — E2 apunta al template NUEVO: **OK**

- Escenario 5750023: nombre `E2_Carbone_Render v2.2 - InformeContexto`, `isActive: true`,
  `isPaused: false`, `lastEdit: 2026-09-29T16:16:44.406Z`.
- Módulo 2 (`http:ActionSendData`), única llamada a Carbone en el flow:
  `mapper.url = https://api.carbone.io/render/31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
  — coincide carácter a carácter con el templateId nuevo esperado.
- Grep sobre el blueprint crudo: **0** ocurrencias del id viejo
  (`517ddc62…14434d`), **1** ocurrencia del id nuevo. Ningún otro módulo referencia Carbone.

## Criterio 2 — Run real reciente y exitoso: **OK**

Logs Make (recalculados):

| Escenario | Timestamp (UTC) | Status | Ops | Transfer |
|---|---|---|---|---|
| E2 5750023 | 2026-09-29T16:18:30.640Z | 1 (success) | 4 | 4.717.118 B |
| E3 5791413 | 2026-09-29T16:18:34.949Z | 1 (success) | 6 | 3.408.840 B |

- El run de E2 es **posterior** al `modify` del re-apunte (16:16:44Z) — corrió ya con el
  template nuevo. El transfer de E3 (~3,4 MB) es consistente con el tamaño del PDF (3.396.967 B).
- Airtable `TX_DocumentosGenerados`, filas que matchean VP-2026-0067: **3** en total.
  - `rec0t8n2oXJB29cMZ` — `es_vigente = TRUE`, `generado_en = 2026-09-29T16:18:39Z`,
    `plantilla_version = PLANTILLA_MET_v2`, `render_id_carbone` presente
    (`MTAuMjAuMTEuNDAgICAgvSE3jh3vNH…`). **Única fila vigente: exactamente 1.** ✔
  - `rec2iw3c9ft5d1TXR` (29-sep 02:43Z, v2, no vigente) y `recWP8Ex4XuPoNIfG`
    (27-sep, PLANTILLA_MET_v1, no vigente): históricas, sin flag vigente.
- Cadena temporal coherente: modify 16:16:44 → E2 16:18:30 → E3 16:18:34 → Airtable 16:18:39.

## Criterio 3 — Portada NUEVA en el PDF del run: **OK**

- SHA-256 (16 hex iniciales): v4 `1156a5e636d86a3b` (3.396.967 B) · v3 `f7df3dedf5c4a16d`
  (3.396.967 B) · v2 `07834b71914807e8` (3.396.964 B). Los tres con 8 páginas.
- **v4 vs v3, pixel-diff a 100 dpi: 0 píxeles distintos en las 8 páginas (0,0000%).**
  El PDF del run es visualmente idéntico al de la plantilla nueva verificada en la tanda previa.
- **v4 p1 vs v2 p1 (portada vieja): 176.673 píxeles no-cero (18,2591%), 167.640 con
  delta > 16 (17,3255%).** La portada de v4 difiere claramente de la vieja y coincide con la nueva.

## Criterio 4 — Sin regresión de datos/imágenes: **OK**

Sobre el texto extraído de v4 (13/14 literales; el faltante no es regresión, ver nota):

`-3%` ✔ · `36%` ✔ · `33,64` ✔ · `24,08` ✔ · `890,33` ✔ · `20.125,86` ✔ ·
`802.913.431` ✔ · `FRANCISCO` ✔ · `VERGARA UNDURRAGA` ✔ · `METLIFE` ✔ · `UF` ✔ ·
`TASACI(ÓN)` ✔ · `6283` ✔ — 13 literales verificados (≥ 12 exigidos).

- Nota: `VP-2026-0067` no aparece en el texto de v4, pero **tampoco** aparece en v3 ni en v2
  (verificado con la misma extracción): el código interno nunca formó parte del informe al
  cliente (el número de operación cliente 6283 sí está). No es regresión.
- Imágenes: `get_images` reporta **36 objetos de imagen en cada una de las 8 páginas**
  (xobjects compartidos del documento) — ninguna página sin imágenes.
- Placeholders: **0** ocurrencias de `{d.` y **0** de `{c.` en todo el documento.

## Veredicto final: **OK — cierre de tanda**

Los cuatro criterios pasan con evidencia recalculada de forma independiente. E2 quedó
re-apuntado al template nuevo sin restos del viejo, activo, con run real exitoso hoy que
encadenó E3 y dejó exactamente una fila vigente en `TX_DocumentosGenerados` con
`PLANTILLA_MET_v2`; el PDF resultante es pixel-idéntico al de la plantilla nueva auditada
en la tanda previa y difiere de la portada vieja; datos e imágenes sin regresión.
No hay nada que revertir.
