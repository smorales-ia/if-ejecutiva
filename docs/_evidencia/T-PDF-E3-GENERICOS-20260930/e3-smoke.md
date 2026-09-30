# Smoke E3 — T-PDF-E3-GENERICOS-20260930 · TRACK A (Make)

Fecha: 30-sep-2026 · Sin tokens en este archivo.
Estado global de la tanda en este track: **BLOQUEADO en A.2** (ver "Bloqueo" abajo). A.0 completado.

## Snapshot previo (A.0 · 30-sep-2026, pre-fix)

### TX_Solicitudes · recmMzeu3eWGxyXsf (VP-2026-0067)

| Campo | Valor |
|---|---|
| `codigo_ext` | `VP-2026-0067` |
| `estado` | `pdf_listo` |
| `pdf_final_url` | `https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=mgl40k4f98jz24knnzdr43osj&dl=0` |

### TX_DocumentosGenerados (tbl5sYnGPZXgYCBSY) · filas de VP-2026-0067

Filtro: `SEARCH("VP-2026-0067", {clave_natural})` · **6 filas** (todas linkean `solicitud` → `recmMzeu3eWGxyXsf`, todas `clave_natural = VP-2026-0067-PDF-v1`, `version_doc = 1`):

| record_id | doc_id | fecha_creacion | es_vigente | url_pdf (tipo) |
|---|---|---|---|---|
| recWP8Ex4XuPoNIfG | 4 | 2026-09-27T23:36:57Z | — | `/home` preview (no público) |
| rec2iw3c9ft5d1TXR | 6 | 2026-09-29T02:43:10Z | — | `/home` preview (no público) |
| rec0t8n2oXJB29cMZ | 7 | 2026-09-29T16:18:39Z | — | `/home` preview (no público) |
| recIxc5nmLZClvUM0 | 8 | 2026-09-29T22:18:12Z | — | `/home` preview (no público) |
| recYasPnZWAAoA3pW | 9 | 2026-09-29T23:13:13Z | — | `/home` preview (no público) |
| rec2jNFZBEVTqSFHJ | 10 | 2026-09-30T00:59:51Z | true | `/scl/fi/...` share-link público (mismo de `pdf_final_url`) |

### Estado E3 y cola (re-verificado)

- Scenario 5791413: `isActive=false`, `isinvalid=true`, `lastEdit=2026-09-30T00:55:06Z`.
- Hook 3063524 (`wh_E3_Carbone_Download_Dropbox`): `enabled=true`, `queueCount=1`,
  incoming `cf430c8d435875f253728e0c981e3a72` (created 2026-09-30T01:12:27Z, 208 bytes).

## Fix de idempotencia preparado (A.1 · construido y validado localmente, NO aplicado)

Blueprint nuevo = original + `onerror` en módulo 9 (`dropbox:createShareLink`), sin tocar
nada más. Archivos locales: `/tmp/e3-blueprint-new.json` y `/tmp/e3-patch-body.json`
(ambos `jq`-válidos). Diff conceptual del módulo 9:

```jsonc
// módulo 9 (sin cambios en mapper/parameters/metadata) + campo nuevo:
"onerror": [
  {
    "id": 20,
    "module": "dropbox:ActionMakeAPICall",   // 1ª variante "dropbox:makeAPICall" RECHAZADA por Make
    "version": 5,
    "parameters": { "__IMTCONN__": 11421587 },
    "mapper": {
      "url": "/2/sharing/list_shared_links",
      "method": "POST",
      "headers": [{ "name": "Content-Type", "value": "application/json" }],
      "qs": [],
      "body": "{\"path\": \"/VProperty/Tasaciones/{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf\", \"direct_only\": true}"
    }
  },
  {
    "id": 21,
    "module": "builtin:Resume",
    "version": 1,
    "mapper": { "url": "{{20.body.links[1].url}}" }   // sustituye {{9.url}} para módulos 7 y 8
  }
]
```

### Intentos de PATCH

| # | Módulo probado | Resultado |
|---|---|---|
| 1 | `dropbox:makeAPICall` v5 | **HTTP 400** de Make: `{"detail": "Module not found 'dropbox:makeAPICall' version '5'.", "message": "Invalid blueprint", "code": "IM007"}` |
| 2 | `dropbox:ActionMakeAPICall` v5 | **NO EJECUTADO** — bloqueado por el clasificador de permisos del entorno Claude Code (ver Bloqueo) |

## Bloqueo (A.2)

El clasificador de auto-permisos del entorno **denegó el PATCH** a
`/scenarios/5791413` pese a la autorización inline de la tanda, citando la prohibición
de CLAUDE.md sobre E1/E2/E3. Es el mismo veto ya registrado en memoria del proyecto
("el clasificador del entorno veta PATCH a E1/E2/E3 aun con autorización de tanda").
No se intentó rodear el bloqueo.

**Consecuencia:** A.2 (persistir onerror), A.3 (start + consumo de cola) y A.4
(emisiones reales ×2) quedan **NO EJECUTADOS**. E3 sigue INACTIVO con `queueCount=1`.

### Cómo retomar (para Sergio o una sesión con permiso concedido)

1. `PATCH {MAKE_BASE_URL}/scenarios/5791413` body `/tmp/e3-patch-body.json`
   (variante `dropbox:ActionMakeAPICall` v5 ya escrita en ese archivo). Si Make también
   la rechaza con IM007, la vía manual es agregar el error handler desde la UI de Make
   (módulo 9 → Add error handler → Dropbox "Make an API Call" + Resume) y re-exportar.
2. `GET /scenarios/5791413/blueprint` para confirmar persistencia del `onerror`.
3. `POST /scenarios/5791413/start` — la cola (1 incoming del 01:12Z, renderId de Carbone
   posiblemente expirado) se procesa sola; monitorear `/logs` y `queueCount`.
4. Emisiones reales ×2 vía webhook E2 y verificación Airtable/Dropbox según plan A.4.

## Estado final de este track

- E3 5791413: **INACTIVO**, `isinvalid=true`, blueprint **sin modificar** (el intento 1
  fue rechazado por Make con 400 y no persistió; verificado implícito: IM007 no aplica cambios).
- Cola hook 3063524: **1 incoming pendiente** (sin consumir).
- Airtable: **sin cambios** (solo lecturas).
- Repo: única escritura, este archivo.
