# TESTS — T-VP0067-PDFPUBLICO-B-20260929 · BLOQUE 2-3 (corrida E2→E3 v2.2 con share-link)

Corrida: 30-sep-2026 00:59 UTC. Disparo con el método de T-VP0067-CONSISTENTE
(oneshot vitest de `construirInformeContexto('recmMzeu3eWGxyXsf', fields)` — solo
lectura, borrado tras la corrida — + POST firmado HMAC al webhook `MAKE_WEBHOOK_E2`,
payload `{solicitud_id, solicitud_codigo, contexto}`). Snapshot pre-disparo en
`snap-predisparo.json` (00:57:58 UTC).

## Runs Make

| Escenario | Ejecución (imtId) | Status | Duración | Ops | Timestamp UTC |
|---|---|---|---|---|---|
| E2 5750023 (Carbone Render) | 1790729981165_1d4cafb4bc18464ab368c3efed953083 | **1 (éxito)** | 4.801 ms | 4 | 2026-09-30T00:59:41.165Z |
| E3 5791413 (**v2.2**, +share-link) | 1790729985438_7963d1300b37426baca105eb39f3e36d | **1 (éxito)** | 6.442 ms | **7** | 2026-09-30T00:59:45.438Z |

E3 pasó de 6 a 7 operaciones — la operación extra es el nuevo módulo 9
`dropbox:createShareLink` (conexión 11421587), primer uso en producción, sin error.

## (a) El link abre SIN login — **PASS**

Share-link generado:
`https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=mgl40k4f98jz24knnzdr43osj&dl=0`

- `curl -sIL` **sin cookies** sobre `?dl=0`: cadena `302 → 302 → 200` terminando en
  `*.dl.dropboxusercontent.com/cd/0/inline2/…/file` — **ningún hop pasa por
  `/login`**. Headers en `headers-sharelink-dl0.txt`.
- `curl -sL` sobre `?dl=1`: **200**, `content-disposition: attachment`,
  **3.396.967 bytes**, primeros bytes `%PDF-1.6` — PDF real (mismo tamaño que el
  render v4 de la plantilla nueva). Headers en `headers-sharelink-dl1.txt`.

Contraste con el estado previo (snap-predisparo): la URL anterior
`/home/VProperty/Tasaciones?preview=…` respondía `302 → /login` (limitación D7 de
T-VP0067-CONSISTENTE). Esa limitación queda **cerrada**.

## (b) El botón usa ese link — **PASS**

`TX_Solicitudes.pdf_final_url` (recmMzeu3eWGxyXsf) quedó poblado por el módulo 7 de
E3 v2.2 con exactamente el share-link de arriba (formato `dropbox.com/scl/fi/…?rlkey=…&dl=0`).
El botón "Descargar PDF" lee ese campo (auditado en tanda previa) → abre público.

## (c) Una sola vigente — **PASS**

Fila NUEVA de TX_DocumentosGenerados: **rec2jNFZBEVTqSFHJ** (doc_id 10, creada
2026-09-30T00:59:51Z, `url_pdf` = share-link, `es_vigente=true` de fábrica por E3).
Saneo: PATCH 200 `es_vigente=false` en recYasPnZWAAoA3pW (doc_id 9, vigente anterior).
GET final sobre las 6 filas de VP-2026-0067: **exactamente 1 vigente** (doc_id 10).

| Record | doc_id | es_vigente final |
|---|---|---|
| recWP8Ex4XuPoNIfG | 4 | — |
| rec2iw3c9ft5d1TXR | 6 | — |
| rec0t8n2oXJB29cMZ | 7 | — |
| recIxc5nmLZClvUM0 | 8 | — |
| recYasPnZWAAoA3pW | 9 | — (apagado en esta tanda) |
| **rec2jNFZBEVTqSFHJ** | **10** | **true** |

## (d) Datos intactos — **PASS**

GET spot a TX_DatosTasacion (tblMoK3mFuwN8Yr1A, fila recy8q3Tq9omjdNUf de
VP-2026-0067) post-corrida: `arriendo_mensual=3300000` · `gasto_anual=3300000` ·
`ingreso_liquido_anual=36300000` — sin cambios. Esta tanda no tocó ninguna tabla de
datos (solo TX_DocumentosGenerados y el efecto de E3 sobre TX_Solicitudes.pdf_final_url).
