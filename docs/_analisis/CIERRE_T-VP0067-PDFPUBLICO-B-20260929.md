# CIERRE — T-VP0067-PDFPUBLICO-B-20260929

> Retomar el tramo detenido: link PÚBLICO del PDF de VP-2026-0067. Resultado:
> **CUMPLIDO — auditor ciego 5/5 OK. Espejo vs MET-6283: 100% en datos y 100% en
> entrega.** El botón "Descargar PDF" abre sin login.

## Qué se hizo

1. **Gate (Fase 1, inline)**: conexión nueva localizada — **11421587 "Dropbox
   VProperty share"** con scopes `account_info.read · sharing.write · sharing.read ·
   files.metadata.read` (verificado por GET /connections; la vieja 7553318 se conserva
   para el upload, que necesita `files.content.write`). Diff v2.2 revalidado contra el
   blueprint vivo. Campo del botón ya auditado (pdf_final_url). G1/G2/G3 OK.
2. **E3 v2.2 aplicado** (PATCH 200, verificado con GET fresco): módulo 9
   `dropbox:createShareLink` v5 (conexión 11421587, path del PDF, settings {} → link
   público por defecto) insertado entre upload y PATCH Airtable; módulos 7/8 ahora
   escriben `{{9.url}}` en `pdf_final_url`/`url_pdf` (0 restos de la URL `/home?preview=`);
   name bump. El escenario quedó ACTIVO sin re-arranque.
3. **Corrida real E2→E3**: contexto fresco + POST HMAC al webhook → E2 status 1 (4 ops),
   E3 v2.2 status 1 (**7 ops — la extra es el share-link, sin `shared_link_already_exists`
   en su primer uso**). Fila DocGen nueva **rec2jNFZBEVTqSFHJ (doc_id 10)**, vigente única
   (doc_id 9 desmarcado).
4. **Validación en limpio**: `pdf_final_url` = `https://www.dropbox.com/scl/fi/…?rlkey=…&dl=0`
   → curl sin cookies: 302→302→**200 sin /login**; con `dl=1` descarga el PDF real
   (`%PDF-1.6`, 3.396.967 bytes, 8 páginas como el gold master).
5. **Auditor ciego (independiente)**: 5/5 OK — link público, botón cableado, vigencia
   única, datos intactos (arriendo/gasto/ingreso y espejo TX_Calculos exactos), espejo
   100% datos + entrega.

## Residuales (no bloqueantes)

Las 5 filas DocGen históricas conservan `url_pdf` privados `/home?preview=` (solo la
vigente importa) · `clave_natural`/`version` congeladas en v1 en las 6 filas (RN-56
sostenido solo por `es_vigente` — deuda ya conocida) · el slug del share-link pierde la
"É" de JOSÉ (cosmético, decisión de Dropbox) · paridad visual página a página no
auditable por API (gold master 127/128 sigue siendo la referencia).

## Rollback disponible

`docs/_evidencia/T-VP0067-PDFPUBLICO-B-20260929/rollback.md`: revert E3 → v2.1 (diff
inverso documentado + blueprint pre redactado), revert corrida (desmarcar/borrar doc_id
10, restaurar vigencia doc_id 9 y URLs del snapshot).

## Evidencia

`docs/_evidencia/T-VP0067-PDFPUBLICO-B-20260929/`: rollback.md, blueprint-e3-v21-pre-redacted.json,
snap-predisparo.json, tests.md (a/b/c/d PASS), headers-sharelink-dl0.txt / dl1.txt, auditor.md.

## Paralelismo

Cadena inherentemente serial (gate → PATCH → corrida → validación): orquestador inline +
2 agentes (corrida, auditor ciego). Sin fan-out artificial.

## Estado

**TANDA CERRADA.** Con esto, la saga VP-0067 queda completa: 6 vistas verificadas
(tanda CONSISTENTE), espejo de datos 100% (tanda PDFPUBLICO) y entrega pública del PDF
100% (esta tanda). Cambios de repo: solo docs, rama `feat/T-VP0067-PDFPUBLICO-B-20260929`.
Commit/push: Sergio.
