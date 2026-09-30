# ROLLBACK — T-VP0067-PDFPUBLICO-20260929

Snapshots pre-cambio (29-sep-2026): `snap-pre-datostasacion.json` (record completo) ·
`blueprint-e3-v21-pre.json` (blueprint E3 v2.1, tokens redactados — para revertir un
eventual v2.2). PDF vigente al inicio: TX_DocumentosGenerados recYasPnZWAAoA3pW
(doc_id 9, es_vigente=true, único).

| # | Pieza | Tabla/Recurso | Record | Cambio | Revert |
|---|---|---|---|---|---|
| 1 | D6c dato | TX_DatosTasacion (tblMoK3mFuwN8Yr1A) | recy8q3Tq9omjdNUf | arriendo_mensual: vacío→3300000 · gasto_anual: vacío→3300000 (ingreso_liquido_anual fórmula: 0→36300000 solo) | PATCH `{"fields":{"arriendo_mensual":null,"gasto_anual":null}}` |
| 2 | E3 v2.2 | Make scenario 5791413 | — | **NO APLICADO** — detenido en Gate (scope sharing.write ausente en conexión 7553318) | n/a (si se aplicara: re-PATCH con blueprint-e3-v21-pre.json) |
| 3 | Links públicos | TX_Solicitudes.pdf_final_url + DocGen.url_pdf | recmMzeu3eWGxyXsf / recYasPnZWAAoA3pW | **NO APLICADO** (depende de #2) | valores actuales en snap de tanda anterior (URL /home?preview=) |

## Registro de ejecución
- **#1 D6c — APLICADO** (orquestador, PATCH 200, 29-sep): arriendo_mensual=3300000 ·
  gasto_anual=3300000 → ingreso_liquido_anual=36300000 (fórmula, verificado en la
  respuesta del PATCH). Autorización explícita de esta tanda (en la anterior el
  clasificador lo había denegado por campos no nombrados).
- **#2 y #3 — NO APLICADOS**: detenidos en Gate. Causa raíz verificada dos veces por
  API: conexión Dropbox 7553318 sigue con 4 scopes (sin sharing.write) tras el
  Reauthorize — el Reauthorize de Make NO re-negocia scopes; hace falta CONEXIÓN NUEVA
  (OAuth interactivo de Sergio). El diff E3 v2.2 queda listo en el plan §1.
