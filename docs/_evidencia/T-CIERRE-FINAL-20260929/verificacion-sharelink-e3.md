# Verificación share-link E3 + contrato botón "Enviar informe" — T-CIERRE-FINAL-20260929 · Agente D

Fecha: 2026-09-29 · Solo lectura sobre Make y Airtable (ningún escenario ni registro modificado).

## 1. Share-link Dropbox en E3 (scenario 5791413)

### 1.1 Blueprint real (GET /scenarios/5791413/blueprint)

Nombre actual: `E3_Carbone_Download_Dropbox v2.1 - Dropbox+Airtable (sin share-link: scope pendiente)`.

Flujo (todos los módulos habilitados, ninguno disabled):

| # | Módulo | Qué hace |
|---|---|---|
| 1 | `gateway:CustomWebHook` | Recibe renderId + solicitud_id/codigo + nombre_cliente + numero_solicitud desde E2 |
| 2 | `http:ActionSendData` | GET `api.carbone.io/render/{{1.renderId}}` (descarga el PDF) |
| 5 | `dropbox:uploadLargeFile` | Sube a `/VProperty/Tasaciones/{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf` (overwrite) |
| 7 | `http:ActionSendData` | PATCH `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6/{{1.solicitud_id}}`): `pdf_final_url` + `estado=pdf_listo` |
| 8 | `http:ActionSendData` | POST `TX_DocumentosGenerados` (`tbl5sYnGPZXgYCBSY`): `url_pdf`, `url_dropbox`, `render_id_carbone`, versión, vigencia, `clave_natural` |
| 4 | `http:ActionSendData` | POST `LogEscenarios` |

**Módulo de share-link Dropbox: AUSENTE.** No existe ningún `dropbox:createShareLink`
(ni deshabilitado): el sufijo del nombre del escenario es fiel a la realidad.

### 1.2 Qué URL escribe hoy y a qué campos

- `TX_Solicitudes.pdf_final_url` (módulo 7) y `TX_DocumentosGenerados.url_pdf` (módulo 8)
  reciben **la misma URL construida a mano**:
  `https://www.dropbox.com/home/VProperty/Tasaciones?preview=<archivo>.pdf`
  — es una URL de tipo "home" de Dropbox, **solo visible con la sesión del dueño de la cuenta**.
- `TX_DocumentosGenerados.url_dropbox` recibe el **path interno**
  `/VProperty/Tasaciones/<archivo>.pdf` (no es URL navegable).

### 1.3 Prueba de la URL del PDF v2 de VP-2026-0067

Fila vigente en `TX_DocumentosGenerados`: `rec2iw3c9ft5d1TXR`
(`clave_natural = VP-2026-0067-PDF-v1`, `plantilla_version = PLANTILLA_MET_v2`,
`es_vigente = true`, creada 2026-09-29T02:43Z).

`curl -sIL` (sin cookies) sobre su `url_pdf`:

```
HTTP/2 302
location: /login?cont=%2Fhome%2FVProperty%2FTasaciones%3Fpreview%3D...
HTTP/2 200   (la página de login)
```

**¿Abre sin login? NO.** Redirige a `/login`. El 200 final es la pantalla de login de
Dropbox, no el PDF.

### 1.4 Conexión Dropbox 7553318 tras el Reauthorize

GET `/connections/7553318` (Make API) devuelve `scopesCnt: 4`:

- `account_info.read`
- `files.content.write`
- `files.metadata.read`
- `files.content.read`

**`sharing.write` NO aparece.** El Reauthorize hecho por Sergio no agregó el scope (al
menos según lo que la API de Make reporta hoy). Hasta que ese scope exista, un módulo
"Create a Share Link" de Dropbox fallaría con `missing_scope`.

### 1.5 Cambio propuesto en E3 (NO aplicado — lo autoriza Sergio)

1. **Primero el scope**: verificar en Make UI → Connections → "My Dropbox connection"
   (7553318). Si tras re-verificar sigue sin `sharing.write`, crear una **conexión Dropbox
   nueva** en Make (el flujo OAuth nuevo sí pide el set completo de scopes de la app
   Dropbox de Make) y usarla en E3, o repetir el Reauthorize y re-consultar.
2. **Módulo nuevo** en E3, entre el módulo 5 (upload) y el 7 (PATCH solicitud):
   Dropbox → **"Create a Share Link"** (`dropbox:createShareLink`), conexión 7553318 (o la
   nueva), path: `/VProperty/Tasaciones/{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf`.
   Nota: como el upload usa `overwrite: true`, en re-emisiones el link ya existirá; usar la
   variante del módulo que devuelve el link existente ("create or get") o tolerar el error
   `shared_link_already_exists` mapeando el link existente.
3. **Remapear las dos escrituras de URL** (módulos 7 y 8): sustituir la URL `…/home/…?preview=…`
   por la salida `url` del módulo nuevo en:
   - `TX_Solicitudes.pdf_final_url`
   - `TX_DocumentosGenerados.url_pdf`
   `url_dropbox` (path interno) se conserva tal cual.
4. **Bump del nombre**: `E3_Carbone_Download_Dropbox v2.2 - Dropbox+Airtable (share-link)`
   y exportar el blueprint a `docs/_artefactos/make/`.
5. Prueba: re-emitir el informe de VP-2026-0067 y repetir `curl -sIL` sobre el nuevo
   `url_pdf` — debe terminar en contenido sin pasar por `/login` (los links `…?dl=0`
   compartidos abren el preview público).

## 2. Botón "Enviar informe" ↔ E2 (scenario 5750023)

### 2.1 Cadena en el código

- UI: `components/tasador/informe-preview.tsx` — diálogo "¿Enviar este informe al visador?",
  botón "Enviar informe" → `handleEnviar()` (línea 291; Regla D cumplida: `finally` +
  spinner + "Enviando…").
- Cliente: `marcarPdfListo(id)` en `lib/tasador/tasaciones.ts:1494` →
  `POST /api/tasaciones/[id]/generar-pdf`.
- Route Handler: `app/api/tasaciones/[id]/generar-pdf/route.ts` — guard de tasador
  (`lecturaInformeContexto`), 409 si estado ∉ {`calculada`, `pdf_listo`}, webhook desde
  env `MAKE_WEBHOOK_E2`, y `postToMake` (`lib/make-client.ts`) que firma HMAC-SHA256 en
  header `X-VP-Signature` (D-03) y loguea en `LogEscenarios`.
- Payload enviado: `{ solicitud_id, solicitud_codigo, contexto }`.

### 2.2 Blueprint real de E2 (`E2_Carbone_Render v2.1 - InformeContexto`)

Consumo del webhook (módulos 2 y 3): `{{1.contexto}}` (body completo a Carbone),
`{{1.solicitud_id}}`, `{{1.solicitud_codigo}}`, `{{1.contexto.meta.numeroSolicitudCliente}}`,
`{{1.contexto.partes.propietario}}`.

Contraste con el ensamblador (`lib/informe/ensamblador.ts`): `meta.numeroSolicitudCliente`
(línea 535) y `partes.propietario` (línea 546) existen en el `InformeContexto` real.

### 2.3 Veredicto: **ALINEADO — SÍ**

Todas las claves que E2 consume viajan en el payload del Route Handler con esos nombres
exactos. Sin desalineaciones de contrato.

Observaciones no bloqueantes (sin fix de código requerido):

- El webhook de E2 (`gateway:CustomWebHook`) **no verifica** la firma `X-VP-Signature`:
  la app la envía pero Make no la valida. Mismo patrón que el resto de escenarios del
  repo; endurecimiento futuro, no desalineación.
- E2/E3 llevan tokens (Carbone JWT, PAT de Airtable) embebidos en los módulos HTTP en vez
  de un keychain de Make — deuda conocida de la construcción manual, se deja constancia.
- El estado `pdf_listo` lo escribe E3 con `typecast: true` sobre `TX_Solicitudes`; la app
  no lo escribe (correcto según la regla "la UI muestra y captura").
