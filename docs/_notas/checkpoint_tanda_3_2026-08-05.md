# Checkpoint Tanda 3 — Estado al 2026-08-05

> Creado el 04-ago-2026 como `checkpoint_tanda_3_2026-08-04.md`. Renombrado el
> 05-ago-2026: la fecha refleja el día del último avance, no el original.

## Situación

Tanda 3 (borrado real + reemplazo backend-driven) fue implementada por Claude
Code el 04-ago-2026. El 05-ago-2026 se completó la puesta en marcha de
infraestructura: opciones de Airtable, ambos escenarios Make importados y
activos, y la variable de entorno desplegada en Railway. **Faltan las pruebas
end-to-end (paso 5) y el commit (paso 6).** El código Next.js sigue sin
commitear.

## Trabajo listo (no commiteado)

**Nuevos:**
- app/api/adjuntos/[id]/route.ts (DELETE con guard Clerk +
  isValidRecordId + degradación por env + guard RN-59 → 409).
- lib/rn59.ts (esModoConsulta + verificarRN59).
- docs/_artefactos/make/SC-Adjuntos-Delete.blueprint.json (v1.0,
  25 módulos).
- docs/_artefactos/produccion-actual/ (2 exports de referencia — ver §Fuentes).

**Modificados:**
- lib/adjuntos.ts (hash_md5 + pathDropbox).
- lib/use-adjuntos-solicitud.ts (eliminar + eliminandoId).
- components/console/document-checklist.tsx (2 AlertDialogs
  destructivos + RN-59 por ocultamiento + orden alfabético).
- components/console/documentos-adjuntos-sheet.tsx (passthrough
  de eliminandoId + onEliminar).
- lib/adjuntos-uploader.ts (ModoUpload + adjunto_previo_id).
- app/api/adjuntos/upload/route.ts (passthrough con fallback
  v1.1).
- lib/make-client.ts (ADJUNTOS_DELETE en ESCENARIO_CHOICE).
- docs/_artefactos/make/SC-Adjuntos-Upload.blueprint.json
  (v1.1 → v1.2, Router de 3 rutas, módulos 11-18).
- .env.example, .env.local, docs/aprendizajes.md, docs/schema-airtable.md.

## Pasos

### ✅ 1. Airtable — LogEscenarios.Escenario — COMPLETADO 05-ago-2026

Creadas a mano en la UI las 2 opciones del singleSelect `Escenario`
(`fldPktGeTzNCRQ319`):
- `ADJUNTOS_DELETE` → `selFP6k9tOxpVjN2p`
- `ADJUNTOS_UPLOAD_V2` → `sel1gyJFFsPYiwSVv`

Verificado por meta API (`GET /v0/meta/bases/app9G7lLkIV3CpeLa/tables`, sin
MCP): 19 opciones totales, ambas exactas y sin espacio final. `Estado` ya tenía
las 4 opciones que usan los blueprints (`✓ OK`, `✗ Error`, `⚠ Parcial`,
`⏭ Omitido`). Documentado en `docs/schema-airtable.md` §12 y §13.4/§13.5.

Era bloqueante real: los módulos Airtable de ambos blueprints van con
`typecast: false`, así que una opción inexistente devuelve 422
`INVALID_MULTIPLE_CHOICE_OPTIONS` y corta la ejecución de Make.

### ✅ 2. Make — SC-Adjuntos-Delete — COMPLETADO 05-ago-2026

- Escenario nuevo, importado desde el blueprint del repo.
- **Corrección necesaria**: el primer import falló con el módulo 6 en gris
  («Module Not Found») porque el blueprint decía `dropbox:deleteAFile`. El
  nombre canónico vigente en Make es **`dropbox:deleteFile` v5**, obtenido de un
  probe exportado de la UI
  (`docs/_artefactos/produccion-actual/dropbox-delete-probe.blueprint.json:6-7`).
  Corregido en `SC-Adjuntos-Delete.blueprint.json:438`, preservando id 6,
  conexión, mapper del path y el `onerror` completo.
- Webhook **nuevo** (no se reutilizó el de Upload).
- Registrado en `Z_Webhooks`: record `recsPfa0PcwIxJnOW`, nombre
  `wh_ADJUNTOS_DeleteDropbox`, URL
  `https://hook.eu1.make.com/gcvqo1fpsbhtoqo7i2eecipv8auhjbvd`.
- Toggle **Active** (violeta).

### ✅ 3. Make — SC-Adjuntos-Upload v1.1 → v1.2 — COMPLETADO 05-ago-2026

- Reimportado sobre el escenario existente **6527528**, sin crear uno nuevo.
  **Hook 3377943 preservado** — despliegue transparente.
- Mismo fix de Dropbox delete aplicado en el módulo 12
  (`SC-Adjuntos-Upload.blueprint.json:714`), con
  `mapper: {"path": "{{11.url_dropbox}}"}` — en Upload el adjunto previo lo
  encuentra el módulo 11, no el 2 como en Delete.
- Renombrado a `SC-Adjuntos-Upload v1.2 - Subida con reemplazo backend-driven`.
- Toggle **Active** (verde).

### ✅ 4. Railway — env var — COMPLETADO 05-ago-2026

- `MAKE_WEBHOOK_URL_ADJUNTOS_DELETE` agregada. Nombre confirmado contra
  `app/api/adjuntos/[id]/route.ts:99` y `.env.example:51`.
- Deploy exitoso, ACTIVE 16:41 del 05-ago-2026, sobre el commit
  `feat(cu-002): cierre Tanda 2…` (`f2600e8`).
- Fix en `.env.local`: eliminada la declaración duplicada vacía (líneas 34-36).
  `@next/env` usa `dotenv.parse`, que ante clave repetida **gana la última** — el
  valor efectivo en local era la cadena vacía y el endpoint habría respondido
  `degraded: true` con status 200.

> ⚠ **Leer antes del paso 5.** El deploy corrió sobre `f2600e8`, que **no
> contiene el código de Tanda 3**: `app/api/adjuntos/[id]/route.ts` y
> `lib/rn59.ts` están sin commitear (`??` en git status). En Railway hoy,
> `DELETE /api/adjuntos/{id}` devuelve **404 — la ruta no existe**. Los 5 casos
> del paso 5 **no se pueden reprobar contra Railway** en este estado. Dos
> salidas: (a) correr el paso 5 en local con `pnpm dev` —para eso servía el fix
> de `.env.local`—, o (b) commitear y pushear primero, invirtiendo el orden de
> los pasos 5 y 6. La opción (b) contradice «commit tras los 5 casos verdes»,
> así que la decisión es de Sergio.

### ⏳ 5. Reprobar los 5 casos — PENDIENTE

Ninguno corrido todavía. **Prioridad de ejecución revisada: correr el caso (e)
PRIMERO** — valida de un solo golpe la env var, el `AIRTABLE_TOKEN` (RN-59 lee
`TX_Solicitudes`) y la regla de negocio. Un 200 con `degraded: true` en vez de
409 significa problema de provisioning, no de RN-59.

Después (a), (b), (c) y (d) contra VP-2026-0053 = `recIEvKCbe7J8TDaB` (ver
§«Al reanudar» — el ID que figuraba antes en esta nota era el equivocado).

a) Desmarcar tipo con archivo → "Eliminar definitivamente" → fila desaparece de
   TX_Adjuntos, archivo de Dropbox, evento `adjunto_eliminado` en A_Eventos.
   Respuesta esperada `{ok: true, dropbox_borrado: true, airtable_borrado: true}`
   (WebhookRespond id 10). Verificar además fila en LogEscenarios con
   `Escenario = ADJUNTOS_DELETE` y `Estado = ✓ OK`.
b) Botón "Reemplazar" → PDF distinto → toast "Documento reemplazado", una sola
   fila, evento `adjunto_reemplazado` con ambos IDs.
c) Cancelar en cualquier diálogo → 0 cambios, 0 ejecuciones Make.
d) Tras (b), subir el mismo archivo al mismo tipo → ruta 0 reused, sin fila
   nueva.
e) Solicitud asignada con tasador → banner ámbar, sin botones
   Reemplazar/Eliminar. `curl -X DELETE` devuelve **409**. Partido en (e).1
   —el 409 por `curl`, sin escrituras, contra VP-2026-0055— y (e).2 —la mitad
   de UI contra VP-2026-0038, girando su estado y revirtiéndolo—. Ver
   §«Al reanudar» para los IDs y el porqué.

**Campos de A_Eventos a verificar en (a)** (nombres resueltos por meta API,
tabla `tblMKmDg2KrO5fMn8`): `tipo_evento` = `adjunto_eliminado`, `tabla_origen` =
`TX_Adjuntos`, `record_id_origen` = el `rec…` borrado, `solicitud` = link a
VP-2026-0053, `actor` = `subido_por`, `descripcion` = «Adjunto eliminado del
checklist: <nombre> (tipo <clave_adjunto>) por <actor>.», `detalle_json` con
`dropbox_borrado: true`. Si la descripción dice «El binario ya no estaba en
Dropbox» y `dropbox_borrado: false`, lo escribió el módulo 32 (rama
`path_not_found`), no el 8 — no es el caso (a) limpio.

Ruta Dropbox esperada: `/VProperty/Tasaciones/VP-2026-0053/`.

### ⏳ 6. Commit + push — PENDIENTE

Tras los 5 casos verdes: commit `feat(cu-002): Tanda 3 — borrado real +
reemplazo backend-driven (SC-Adjuntos-Delete + Upload v1.2)` → push → pedir a
Claude Code que escriba lo aprendido en `docs/aprendizajes.md` (ya hay entrada
del 05-ago-2026 con 5 sub-entradas; ampliarla si el paso 5 destapa algo).

## Deudas técnicas del 05-ago-2026 (no bloqueantes)

**Deuda #1 — dos conexiones Dropbox conviven.** El export de producción de
Upload v1.1 corre con `__IMTCONN__: 9536248` (`dropbox_vproperty`), mientras los
blueprints locales de Tanda 3 usan `7553318` («My Dropbox connection»).
**Decisión de Tanda 3: mantener 7553318**, por consistencia con los archivos
locales y el checkpoint. Reconciliar en tanda separada, decidiendo cuál es la
conexión buena antes de tocar el escenario activo.

**Deuda #2 — el log de Upload v1.1 en producción escribe filas vacías.** Los
módulos 4 y 9 (`ActionCreateRecord` sobre LogEscenarios) llevan `record: {}`. No
es el fallo por nombres de campo equivocados que suponía
`docs/schema-airtable.md` §13.5: no escriben ningún campo. Corregido en v1.2 con
mapping por FIELD_ID — se salda al haber completado el paso 3.

**Deuda #3 — la copia versionada de Upload v1.1 no refleja Make.** El archivo
commiteado declara la conexión `7553318`; producción tiene `9536248`. Alguien
editó en Make sin re-exportar. Reconciliar junto con la Deuda #1.

**Deuda #4 — orden de guards en el endpoint DELETE.** En
`app/api/adjuntos/[id]/route.ts` el orden es Clerk (401) → `isValidRecordId`
(400) → **env vars (`degraded: true`, status 200, línea 102)** → body/schema
(400) → **RN-59 (409, línea 143)**. Consistente con el endpoint de subida
(patrón de degradación) y no bloqueante. Consecuencia a tener presente: sin la
env var, el caso (e) devuelve 200 degradado en vez de 409 y parece un fallo de
RN-59. Evaluar invertir env-vars ↔ RN-59 en tanda futura.

## Al reanudar (para próximo Claude / próximo Sergio)

**Estado del trabajo local**: 16 archivos sin commitear (10 modificados + 6
nuevos, contando los 2 de `docs/_artefactos/produccion-actual/`). **NO commitear
hasta cerrar el paso 5** — salvo que se opte por la salida (b) del aviso del
paso 4.

**Test record principal**: VP-2026-0053 = **`recIEvKCbe7J8TDaB`**, estado
`creada`, tasador Juan Perez Gonzalez (asignado pero estado `creada` ⇒ **no** es
modo consulta: `esModoConsulta` exige ambas condiciones). Adjunto único:
`recpEqqFBG3pE0LFb` (`foto_ofertas_comparables`, hash
`6a37495c2c7b5f324ab966b254067308`, Dropbox `/VProperty/Tasaciones/VP-2026-0053/
Foto REF Ofertas y REF CBR del inf.JPG`).

> ⚠ **Corrección 06-ago-2026.** Este checkpoint decía «VP-2026-0053
> (`recYcijo7kb1NDjqM`), estado `creada`, tasador vacío». Los tres datos eran
> falsos. Verificado contra la REST API de Airtable: `recYcijo7kb1NDjqM` es
> **VP-2026-0055**, estado `asignada`, tasador Juan Perez Gonzalez y **sin
> adjuntos**. Los casos (a)–(d) contra ese ID habrían corrido sobre la solicitud
> equivocada y habrían chocado con el 409 de RN-59, que se habría leído como
> fallo del endpoint. Lección: un record ID anotado a mano en una nota no es
> fuente de verdad — reverificar contra la API al reanudar.

**Test records del caso (e)** (identificados el 06-ago-2026). Hace falta `estado
!= creada` **Y** tasador asignado **Y** —para la mitad de UI— al menos 1 adjunto.
Las dos primeras se evalúan juntas (`lib/rn59.ts:47`): una solicitud `asignada`
sin tasador **no** dispara el 409.

**Ninguna solicitud de la base cumple hoy las tres.** Las 6 con `estado !=
creada` y tasador (VP-2026-0039, 0044, 0045, 0046, 0054, 0055) tienen cero
adjuntos; las 4 con adjuntos (VP-2026-0036, 0037, 0038, 0053) están todas en
`creada`. De ahí el caso (e) partido en dos:

- **(e).1 — el 409 puro, cero escrituras**: VP-2026-0055 = `recYcijo7kb1NDjqM`,
  ya en modo consulta. El handler valida el *formato* del `[id]`, no su
  existencia (`app/api/adjuntos/[id]/route.ts:91`), y RN-59 corta antes de
  llamar a Make (línea 144) — así que sirve cualquier `rec…` bien formado y no
  hace falta que VP-2026-0055 tenga adjuntos.
- **(e).2 — banner ámbar y ausencia de botones en la UI**: VP-2026-0038 =
  `recRjyT3kg0vYGcEH`, con tasador (Sergio Gajardo), visador y 4 adjuntos —el
  único con ruta Dropbox real es `recFboJnGBEZpMEtF` (`foto_fuente_sii`)—. Exige
  girar `estado` `creada → asignada` y **revertir al terminar**: única escritura
  del caso (e). Se prefiere a VP-2026-0053 para no tener que girar dos veces el
  estado de la solicitud de los casos (a)–(d).

**Prompt de reanudación para nueva sesión**:

> Reanudo Tanda 3 de VProperty. Lee `docs/_notas/checkpoint_tanda_3_2026-08-05.md`.
> Paso 5 pendiente, arranco por caso (e). Necesito los IDs (`codigo_solicitud`,
> `record_id`, adjunto `record_id`) de una solicitud con `estado != creada` Y
> tasador asignado con al menos 1 adjunto — para reprobar el 409 de RN-59.

## Fuentes de referencia añadidas el 05-ago-2026

`docs/_artefactos/produccion-actual/` (sin commitear):
- `SC-Adjuntos-Upload-v1.1-PRODUCCION.blueprint.json` — export real del escenario
  activo. Fuente de nombres canónicos vigentes: `gateway:CustomWebHook` v1,
  `gateway:WebhookRespond` v1, `airtable:ActionSearchRecords` v3,
  `airtable:ActionCreateRecord` v3, `dropbox:uploadLargeFile` v5,
  `builtin:BasicRouter` v1.
- `dropbox-delete-probe.blueprint.json` — escenario desechable con un único
  módulo, del que salió `dropbox:deleteFile` v5.

**Regla aprendida**: el nombre canónico de un módulo Make sólo sale de un export
real. Un blueprint escrito a mano y no importado nunca es fuente de verdad, por
más que viva en `docs/_artefactos/make/`.

**Único nombre de módulo aún sin respaldo empírico**: `builtin:Commit` v1 — no
aparece en producción v1.1, ni en SC-Edicion v3.4, ni en SC-Asignar v2.0. Está
en Upload v1.2 (id 52) y en Delete v1.0 (ids 22, 35, 38, 42). Si los imports de
los pasos 2 y 3 mostraron esos módulos en color, queda validado de hecho.

## Divergencias resueltas por Claude Code contra la spec §8.6

10 divergencias resueltas SIEMPRE a favor de la spec (así fue
instruido). Notables:
- Payload Delete incluye codigo_ext (spec §8.6.3), no solo los
  4 del prompt.
- Respuestas Delete usan { modo, aviso, ya_no_existia }
  canónicas de §8.6.3; los reason (mismatch/dropbox_failed/
  airtable_orphan) se añaden como campo extra para que el
  Route Handler mapee 409/502/500.
- Sin campo replaced boolean: cliente deriva modo === "reemplazo"
  (§8.6.1 marca reused como redundancia a retirar).
- Nombre canónico adjunto_previo_id, no previous_adjunto_id.
- Diálogo de reemplazo se abre ANTES del selector de archivo
  (§8.6.4), no antes del POST.
- Delete con path_not_found sí borra la fila con aviso; otros
  errores Dropbox abortan sin tocar Airtable.
- Módulo 11 Search corre siempre (Make no permite filtros
  condicionales sobre módulo lineal); precedencia del hash la
  imponen los filtros del Router.

## Decisiones por defecto (documentadas)

- Borrado duro asumido (sin campo activo para soft-delete).
  Auditoría vive solo en A_Eventos. Cambiar a soft-delete
  requiere tanda aparte.
- Botón "X" (quitar archivo sin borrar) eliminado del checklist
  porque hacía exactamente lo que §8.6.4 declara obsoleto.
  Ahora hay botón papelera que abre el diálogo de eliminación.

## Bug corregido de paso

document-checklist.tsx: onArchivo(...) seguido de onToggle(...)
derivaban del mismo value capturado y el segundo pisaba al
primero (tipo quedaba desmarcado conservando el archivo).
Unificado en onQuitar(codigo).

## Casos borde no cubiertos (para tanda futura)

- Peor caso §8.6.5: previo borrado + upload nuevo falla → tipo
  vacío tras confirmación del usuario. Mitigado por orden pero
  no cubierto por pruebas.
- ARRAYJOIN({solicitud}) vs codigo_ext: fragilidad heredada del
  módulo 2 al 11. En Delete se evitó comparando record IDs
  directamente.
- Ventana sin record ID entre subida confirmada y relectura:
  botones destructivos no se renderizan por milisegundos.

## Referencia — verificación estática hecha

- pnpm typecheck limpio (04-ago).
- pnpm build limpio (04-ago). **Repetir antes del commit del paso 6**: desde
  entonces cambiaron blueprints y documentación, no código TS, pero el paso 6 lo
  exige igual.
- Ambos JSON de blueprint válidos (revalidados tras el fix del 05-ago).
- greps isValidRecordId, AlertDialog destructive,
  MAKE_WEBHOOK_URL_ADJUNTOS_DELETE presentes.

Si algún paso falla, revisar la entrada del 05-ago-2026 en
`docs/aprendizajes.md` (5 sub-entradas: nombre canónico Dropbox, referencias
rotas que Make no avisa, y las deudas #1-#3 más el duplicado de `.env.local`).
