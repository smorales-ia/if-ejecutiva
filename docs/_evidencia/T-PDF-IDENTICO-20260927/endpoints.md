# Endpoints usados — T-PDF-IDENTICO-20260927 (sin tokens)

Convención de secretos: `<AIRTABLE_TOKEN>` · `<MAKE_API_TOKEN>` · `<CARBONE_PROD>` — nunca
en claro. Único identificador permitido en claro: template/scenario/record IDs.

## Airtable (`https://api.airtable.com/v0/app9G7lLkIV3CpeLa` · `Authorization: Bearer <AIRTABLE_TOKEN>`)

| Método | Recurso | Uso | Status |
|---|---|---|---|
| GET | `tblaHTyMHYfmy7Fg6/recmMzeu3eWGxyXsf` | snapshots VP-0067 (pre y post) | 200 |
| GET | `tblNFa454fBbqRB3t/{recFcpOeKjXNunBlj,recliyqVJAGatkDw0}` | snapshot C_Formulas (solo lectura — fix NO aplicado) | 200 |
| PATCH | `tblaHTyMHYfmy7Fg6/recmMzeu3eWGxyXsf` y hijos (TX_DatosTasacion `recy8q3Tq9omjdNUf`, TX_DocumentosLegales `rec7t4cD2zjuJKpXq`, TX_Comparables ×7, habitaciones) | datos exactos XLSM (rollback-data en `rollback.md`) | 200 |
| GET/PATCH/DELETE | `tbl5sYnGPZXgYCBSY` (DocGen) | verificación de la corrida + saneo vigencia | 200 |
| GET | `H_PreciosUF` (fila 13-abr `recbnHFtlFHQnyEM9`) | verificación UF 39.894,61 / US$ 890,33 (ya sembrados) | 200 |

## Make (`https://eu1.make.com/api/v2` · `Authorization: Token <MAKE_API_TOKEN>` · team 1594725)

| Método | Endpoint | Uso | Status |
|---|---|---|---|
| GET | `/users/me` · `/scenarios?teamId=1594725` | validación token + isActive E2/E3 | 200 |
| GET | `/scenarios/{5750023,5791413}/blueprint` | snapshot pre-cambio (redactado en evidencia) | 200 |
| PATCH | `/scenarios/5750023` | re-apuntar módulo Carbone al template v2 + rename v2.1 | 200 |
| PATCH | `/scenarios/5791413` | fix `plantilla_version` hardcodeada v1→v2 en el create DocGen | 200 |
| POST | `/scenarios/5750023/start` | encender E2 para la corrida real | 200 |
| POST | `/scenarios/5791413/start` | encender E3 (primera vez OK; el re-start post-PATCH quedó para el GO-LIVE) | 200 / diferido |
| POST | webhook E2 (URL en `<MAKE_WEBHOOK_E2>`) | corrida real, payload `{solicitud_id, solicitud_codigo, contexto}` firmado HMAC | 200 |

## Carbone (`https://api.carbone.io` · `Authorization: Bearer <CARBONE_PROD>` · header `carbone-version: 4`)

| Método | Endpoint | Uso | Status |
|---|---|---|---|
| GET | `/status` · `/template/{id}` | validación G1 | 200 |
| POST | `/template` (multipart) | publicar PLANTILLA_MET_v2.docx → `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d` | 200 |
| POST | `/render/{templateId}` | renders de prueba + re-render de evidencia | 200 |
| GET | `/render/{renderId}` | descarga de renders locales (200); el de la corrida real dio **404 esperado**: Carbone borra el render tras la primera descarga, que la hizo E3 | 200 / 404 |

## Dropbox

Sin llamadas directas (la credencial de `.env.local` está inválida — 400 conocido). E3 usa la
conexión OAuth de Make (7553318), que subió el PDF correctamente. El share-link público sigue
pendiente del Reauthorize de Sergio (scope `sharing.write`).
