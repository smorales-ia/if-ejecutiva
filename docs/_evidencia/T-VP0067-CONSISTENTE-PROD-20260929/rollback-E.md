# ROLLBACK-E — OLA 2 (cadena PDF + vigencia)

Snapshot pre-disparo: `snap-predisparo-docgen.json` (4 filas DocGen + pdf_final_url).

| Acción | Registro | Cambio | Revert |
|---|---|---|---|
| Corrida E2→E3 | TX_DocumentosGenerados **recYasPnZWAAoA3pW** (doc_id 9) | fila CREADA por E3, es_vigente=true | DELETE del record (o es_vigente=false) |
| Corrida E3 | TX_Solicitudes recmMzeu3eWGxyXsf.pdf_final_url | renovado (mismo valor textual que el snapshot) | restaurar valor de snap-pre-solicitud.json |
| D5 vigencia | rec0t8n2oXJB29cMZ (doc_id 7) | es_vigente true → false | PATCH es_vigente=true |
| D5 vigencia | recIxc5nmLZClvUM0 (doc_id 8) | es_vigente true → false | PATCH es_vigente=true |

No se tocó configuración de escenarios Make ni ningún otro record.

Nota (Agente E, re-verificación post-reanudación): `snap-predisparo-docgen.json`
contiene además la solicitud COMPLETA (`recmMzeu3eWGxyXsf`) al 23:10:56 UTC —
sirve como fuente alternativa para restaurar `pdf_final_url` (valor textual
idéntico pre y post corrida). El disparo se hizo con contexto fresco del
ensamblador (oneshot vitest, solo lectura) + POST HMAC al webhook E2; no se usó
ningún payload cacheado de tandas previas.
