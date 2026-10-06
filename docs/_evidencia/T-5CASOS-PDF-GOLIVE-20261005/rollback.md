# ROLLBACK · T-5CASOS-PDF-GOLIVE-20261005

**Estado previo capturado (antes de tocar nada):**
- E3 (scenario 5791413): `isActive=false`, `isinvalid=true` — `e3-estado-pre.json`.
- Blueprint original de E3: snapshot completo (redactado) en `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/e3-blueprint-snapshot-original.json` — es la base de reversión del PATCH.
- Cola del hook 3063524: 8 incomings pendientes (ids en `e3-cola-pre-purga.json`).
- Los 5 casos: `calculada`, sin `pdf_final_url`, 0 TX_DocumentosGenerados (verificado hoy pre-ejecución).

## Reversión por pieza

1. **Apagar E3 de nuevo (reversión de la reactivación):** `POST <MAKE_BASE_URL>/scenarios/5791413/stop` con `Authorization: Token <MAKE_TOKEN>`. Deja la cadena como estaba (E3 off).
2. **Revertir el PATCH del blueprint:** reconstruir el original con `sed` de tokens sobre el snapshot (mismo mecanismo que el paso 1 de `fix-e3-apply.sh`, sin el paso `jq` que agrega el onerror) y `PATCH /scenarios/5791413` con ese blueprint.
3. **Cola purgada: NO reversible** (los 8 incomings eran payloads de prueba de tandas previas con renders de Carbone ya expirados — procesarlos solo podía fallar o subir contenido corrupto con `overwrite:true` sobre PDFs buenos). Mitigación: los 5 casos re-emiten render fresco en esta misma tanda; VP-0067 no necesita re-emisión (su PDF vigente ya está en Dropbox).
4. **Por caso (si un caso falla):** limpiar su fila TX_DocumentosGenerados nueva y vaciar `pdf_final_url`/reponer `estado=calculada` (ids de lo creado quedan en `pdf-5casos-check.md`); el detalle del estado previo por caso está en `docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005/snapshot-pre-tanda.json`.
