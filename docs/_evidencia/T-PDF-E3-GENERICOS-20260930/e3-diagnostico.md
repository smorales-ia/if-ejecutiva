# Diagnóstico E3 — T-PDF-E3-GENERICOS-20260930 (Fase 1, solo lectura)

Fecha: 30-sep-2026 · Fuente: API de Make (team 1594725, región eu1) · Sin tokens en este archivo.

## Escenarios reales

| Escenario | ID | Nombre | Estado |
|---|---|---|---|
| E2 | 5750023 | `E2_Carbone_Render v2.2 - InformeContexto` | ACTIVO · scheduling `immediately` |
| E3 | 5791413 | `E3_Carbone_Download_Dropbox v2.2 - share-link publico` | **INACTIVO** (`isActive=false`, `isinvalid=true`) · hook 3063524 · lastEdit 2026-09-30T00:55Z |

## Error verbatim (causa raíz confirmada)

Ejecución `5bd3ef23924d4297a7ff18a70b5d9a66` (2026-09-30T01:12:22Z, 4 ops, status 3,
`isReplayable: true`, `causeModule: createShareLink` = módulo **9**):

```
RuntimeError — [409] Share link already exists and cannot be updated or returned by this module.
To update or revoke an existing link, use the 'Update/Revoke a Share Link' module.

Link URL: https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=mgl40k4f98jz24knnzdr43osj&dl=0
```

Contexto: a las 00:59:45Z hubo un run EXITOSO (7 ops) para la misma solicitud VP-2026-0067 que ya
creó el shared link. El run de las 01:12 fue un re-disparo del mismo payload → 409 → sin error
handler en el módulo 9 → Make desactivó el escenario.

## Dónde está la "ejecución pendiente"

- DLQ **vacío** (`GET /dlqs?scenarioId=5791413` → `{"dlqs":[]}`, `dlqCount=0`).
- El pendiente está en la **cola del webhook**: hook 3063524 (`wh_E3_Carbone_Download_Dropbox`,
  enabled), `queueCount: 1`, incoming `cf430c8d435875f253728e0c981e3a72` (payload VP-2026-0067).
  Se consume solo al reactivar el escenario (`start`).

## Flujo del blueprint E3 (v2.2)

`1 gateway:CustomWebHook (hook 3063524)` → `2 http GET api.carbone.io/render/{renderId}` →
`5 dropbox:uploadLargeFile` (path `/VProperty/Tasaciones`, filename
`{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf`, overwrite:true, conn 7553318) →
`9 dropbox:createShareLink` (conn 11421587 "Dropbox VProperty share", **`onerror: null`**) →
`7 http PATCH TX_Solicitudes (pdf_final_url, estado=pdf_listo)` → `8 http POST
TX_DocumentosGenerados` → `4 http POST LogEscenarios`.

## Endpoints confirmados (base URL ya incluye `/api/v2`)

- Blueprint: `GET /scenarios/{id}/blueprint` · update: **`PATCH /scenarios/{id}`** body
  `{"blueprint": "<JSON serializado como string>"}`
- Activación: `POST /scenarios/{id}/start` · `POST /scenarios/{id}/stop`
- Run once: `POST /scenarios/{id}/run` (body `{"data":{…},"responsive":bool}`)
- Logs: `GET /scenarios/{id}/logs` · `GET /scenarios/{id}/logs/{executionId}`
- Cola webhook: `GET /hooks/{hookId}/incomings` · `GET /hooks/{hookId}/incomings/{id}` ·
  `GET /hooks/{hookId}/logs` · `POST /hooks/{hookId}/enable|/disable`
- DLQ (no aplica aquí, vacío): `GET /dlqs?scenarioId=` · `GET /dlqs/{id}[/bundle]` ·
  `POST /dlqs/{id}/retry` · `POST /dlqs/retry?scenarioId=` · `DELETE /dlqs?scenarioId=`

## Hallazgos colaterales (deuda, no tocar en esta tanda)

- Los módulos HTTP 7/8/4 llevan el PAT de Airtable hardcodeado en headers y el módulo 2 el token
  Carbone: quedan expuestos en cada export del blueprint. Migrarlos a conexiones/variables en una
  tanda futura.
- Dropbox NO requiere Reauthorize: la conexión 11421587 tiene `sharing.write` (el run de las
  00:59Z creó el link con ella). El token Dropbox de `.env.local` no interviene en E3.
