# Especificación · SC-Adjuntos-Delete (borrado real de adjuntos) — 2026-08-03

> **⚠ SUPERSEDED (2026-08-03).** El contrato definitivo ya se integró a la fuente
> única de verdad: **§8.6 de
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_5.md`** (§8.6.1–§8.6.6, RF-52,
> RN-59, RN-60). Ese es el documento normativo; esta nota queda como borrador
> histórico de trabajo y **no debe usarse como referencia de construcción**. Se
> conserva sólo por la regla de append de `docs/_notas/`. Ante cualquier
> divergencia entre esta nota y §8.6, **manda §8.6**.
>
> Diferencias que §8.6 resolvió y esta nota no reflejaba:
> - El reemplazo **no** es "DELETE del anterior + POST del nuevo desde el
>   cliente": es una **rama interna de SC-Adjuntos-Upload v1.2**, backend-driven,
>   sin flag en el cliente (§8.6.2). Ver §6 nueva más abajo.
> - Plan Make: **Pro** (sin límite de escenarios activos), no Free — la §4.5 de
>   esta nota sobre "3er escenario / upgrade a Core" quedó obsoleta.
> - Identificador de borrado: `adjunto_record_id` (record ID), payload y
>   respuestas en §8.6.3.

> **Estado original (histórico): ESPECIFICACIÓN, NO construida.** Diseño del
> borrado real de adjuntos (Airtable + Dropbox) para la **Tanda 3**. No hay
> código Next.js ni blueprint JSON asociados todavía.
>
> Nota de alcance: `docs/_notas/` es para notas operativas con fecha, no
> especificación normativa. El contrato definitivo vive en
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_5.md` §8.6.

## 0. Problema y decisión de producto

Hoy, al **desmarcar** un documento del checklist que ya tenía archivo subido, el
`AlertDialog` de `components/console/document-checklist.tsx` dice:

> "Deja de exigirse en el checklist. El archivo ya subido se mantiene en los
> adjuntos de la solicitud."

Es decir: **no borra nada**. Solo quita la marca `requerido_por_ejecutiva`; el
adjunto sigue en `TX_Adjuntos` y en Dropbox. Esto se diseñó así porque no existía
escenario Make de borrado y **RT-03** prohíbe writes directos a Airtable desde
Next.js.

**Decisión de producto (Tanda 3):** el borrado debe ser real, en **Airtable Y
Dropbox**. Como RT-03 sigue vigente, requiere un **nuevo escenario Make**
(`SC-Adjuntos-Delete`) invocado por webhook firmado, igual que el upload.

---

## 1. Contrato del webhook SC-Adjuntos-Delete

### 1.1 Transporte

- **Método:** POST al webhook custom de Make.
- **URL:** nueva env var `MAKE_WEBHOOK_URL_ADJUNTOS_DELETE`.
- **Firma:** header `X-VP-Signature` = HMAC-SHA256 hex del body JSON con
  `MAKE_HMAC_SECRET`, **exactamente el mismo esquema que Upload** — se reutiliza
  `postToMake()` de `lib/make-client.ts` (D-03). No se introduce un segundo
  secreto ni un segundo algoritmo.
- **Log:** `postToMake` ya escribe en `LogEscenarios`; se pasa
  `escenario: 'ADJUNTOS_DELETE'`.

### 1.2 Payload de entrada

```json
{
  "record_id": "recIEvKCbe7J8TDaB",
  "solicitud_id": "recXXXXXXXXXXXXXX",
  "hash_md5": "6a37495c2c7b5f324ab966b254067308",
  "subido_por": "Ejecutivo"
}
```

| Campo | Origen | Uso |
|---|---|---|
| `record_id` | `Adjunto.id` (record ID `rec…` de `TX_Adjuntos`) | **Llave del borrado.** Alimenta el Airtable Get y el Airtable Delete. |
| `solicitud_id` | Record ID de `TX_Solicitudes` | Doble check: la fila leída debe pertenecer a esta solicitud (defensa contra borrar el adjunto de otra solicitud). |
| `hash_md5` | `Adjunto` / checklist | Salvaguarda: la fila leída debe tener este mismo hash. Si no coincide, se aborta (el record pudo cambiar entre lectura y borrado). |
| `subido_por` | usuario actual (default `"Ejecutivo"`) | Auditoría en `LogEscenarios` / `A_Eventos` (opcional en este CU). |

> ⚠ **`record_id` es el record ID (`rec…`), NO el autonumber `adjunto_id`.**
> Ver §4.1 — hay una discrepancia real de fuente de datos que la construcción
> debe resolver antes de cablear el botón.

### 1.3 Respuesta esperada

```json
{
  "ok": true,
  "record_id": "recIEvKCbe7J8TDaB",
  "dropbox_borrado": true,
  "airtable_borrado": true
}
```

En error (fila no encontrada, hash no coincide, o fallo de un lado):

```json
{
  "ok": false,
  "record_id": "recIEvKCbe7J8TDaB",
  "dropbox_borrado": false,
  "airtable_borrado": false,
  "error": "no_encontrado | hash_mismatch | solicitud_mismatch | dropbox_error | airtable_error"
}
```

El Route Handler traduce cualquier `error` técnico al mensaje humano §6
(`"No pudimos completar la acción. Intenta nuevamente en unos segundos."`) — el
literal técnico nunca llega a la UI.

---

## 2. Blueprint conceptual (módulos — sin JSON todavía)

Topología lineal con manejo de error explícito. **Sin Router** salvo para el
manejo de error (ver §2.6), porque no hay ramas de idempotencia como en Upload.

| # | Módulo | Rol |
|---|---|---|
| 1 | `gateway:CustomWebHook` v1 | Recibe el payload §1.2 (`record_id`, `solicitud_id`, `hash_md5`, `subido_por`). |
| 2 | `airtable:ActionGetRecord` v3 | Lee la fila `TX_Adjuntos` por `record_id`. Devuelve `url_dropbox` (= `path_display`), `hash_md5`, `solicitud`. |
| — | **Filtro / salvaguarda** | Antes de borrar: `{{2.hash_md5}} = {{1.hash_md5}}` **Y** `{{1.solicitud_id}}` ∈ `{{2.solicitud}}`. Si falla → rama de error (§2.6), no se borra nada. |
| 3 | `dropbox:deleteAFile` v? | Borra el archivo en Dropbox usando `{{2.url_dropbox}}` como `path`. **⚠ módulo/versión por confirmar — ver §4.4.** |
| 4 | `airtable:ActionDeleteRecord` v3 | Borra la fila `TX_Adjuntos`. **Clave `id` (text) = `{{1.record_id}}`, NO `record`** (ver §2.5). |
| 5 | `gateway:WebhookRespond` v1 | Responde `{ ok:true, record_id, dropbox_borrado:true, airtable_borrado:true }`. |

### 2.1 Airtable Get (módulo 2) — por qué Get y no Search

Se conoce el record ID exacto (`record_id`), así que `ActionGetRecord` es
directo y evita el problema de comparar Links dentro de `filterByFormula`
(E-018/E-024). Se usa el Get **para validar existencia y traer el `path_display`
de Dropbox** (`url_dropbox`, `fldEccoUrOjV7oKZ5`) que necesita el módulo 3.

### 2.2 Salvaguarda hash + solicitud

El filtro entre módulo 2 y 3 confirma que la fila que vamos a borrar es la que el
usuario cree que está borrando:

- `hash_md5` de la fila == `hash_md5` del payload.
- `solicitud_id` del payload está en el Link `solicitud` de la fila. Ojo: la
  salida del Get para un Link es un array de record IDs; se compara con
  `{{1.solicitud_id}}` (record ID), **no** con `codigo_ext`.

Si cualquiera falla, no se toca Dropbox ni Airtable → respuesta de error.

### 2.3 Dropbox Delete (módulo 3)

`path` = `{{2.url_dropbox}}`. En `TX_Adjuntos`, `url_dropbox` guarda el
`path_display` que `SC-Adjuntos-Upload` escribió como `{{6.path_display}}` — la
ruta cruda dentro de Dropbox, ej.
`/VProperty/Tasaciones/VP-2026-0053/Foto REF Ofertas.JPG` (ver
`lib/adjuntos.ts`, función `urlNavegableDropbox`). Es exactamente el formato que
la acción Delete de Dropbox espera como path. **No** usar el `urlDropbox`
normalizado del front (ese apunta a `dropbox.com/home/...` para el navegador).

### 2.4 Airtable Delete (módulo 4)

`id` = `{{1.record_id}}`.

### 2.5 ⚠ Contrato del módulo Delete de Airtable (lección F-1)

Según CLAUDE.md · "Contrato de los módulos Airtable v3 en Make":

| Acción | Clave del record ID | Clave de valores |
|---|---|---|
| `airtable:ActionDeleteRecord` | **`id`** (text) | — (no aplica) |

Poner el record ID dentro de `record` en un Delete deja `id` sin definir; Make
pega al endpoint *bulk* con `records[]` vacío y devuelve
`[422] "records" must be a non-empty array of record IDs`. Esa fue la causa raíz
de **F-1** en SC-Edicion (cerrada en v3.4). Al escribir el JSON de este módulo,
**copiar las claves de un `ActionDeleteRecord` v3 probado en producción**, no
inventar el mapper ni confiar en `metadata.expect`.

### 2.6 Manejo de error (Dropbox falla pero Airtable existe, o viceversa)

Orden **Dropbox primero, Airtable después** (elegido a propósito):

- **Dropbox falla, Airtable intacto:** se aborta antes del Delete de Airtable. La
  fila `TX_Adjuntos` sobrevive → el adjunto sigue visible y se puede reintentar.
  Estado consistente ("no se borró nada"). Respuesta `dropbox_borrado:false`,
  `airtable_borrado:false`.
- **Dropbox ok, Airtable falla:** queda un archivo huérfano en Dropbox sin fila.
  Es el peor caso, pero **no** deja una fila que apunte a un archivo inexistente
  (que rompería la descarga). Respuesta `dropbox_borrado:true`,
  `airtable_borrado:false`; el Route Handler responde error y NO refresca como
  éxito. Se registra en `LogEscenarios` para barrido manual posterior.
- **`file not found` en Dropbox** (archivo ya borrado a mano): tratar como
  **éxito parcial idempotente** → continuar al Delete de Airtable. Borrar la fila
  igual es lo correcto (el objetivo es que el adjunto desaparezca).

Implementación en Make: `Error handler` (Ignore/Resume/Rollback) sobre módulos 3
y 4, o un Router con ruta de error que responda el JSON de §1.3-error. La
elección concreta se decide al construir (Tanda 3).

---

## 3. Cambios en Next.js (a construir en Tanda 3, NO ahora)

### 3.1 Nueva ruta `app/api/adjuntos/[id]/route.ts` (DELETE)

Convive sin colisión con `app/api/adjuntos/upload/route.ts`: `upload` es segmento
literal, `[id]` es dinámico; App Router resuelve el literal primero.

Estructura (espejo del guard del upload y del GET de adjuntos):

```ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })

  const { id } = await params
  if (!isValidRecordId(id)) {
    return NextResponse.json({ ok: false, error: MENSAJE_ERROR_RED }, { status: 400 })
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL_ADJUNTOS_DELETE
  const hmacSecret = process.env.MAKE_HMAC_SECRET
  if (!webhookUrl || !hmacSecret) {
    return NextResponse.json({ ok: false, degraded: true, error: MENSAJE_DEGRADADO }, { status: 200 })
  }

  // body con solicitud_id + hash_md5 para la salvaguarda del escenario
  // → postToMake(webhookUrl, { record_id: id, solicitud_id, hash_md5, subido_por }, { escenario: 'ADJUNTOS_DELETE', solicitudId: codigoExt })
  // Traducir cualquier error a MENSAJE_ERROR_RED. Nunca literal técnico.
}
```

- Guard `isValidRecordId(id)` sobre `[id]` — mismo helper que
  `app/api/solicitudes/[id]/*` y el upload (`lib/airtable-client.ts`).
- `solicitud_id` y `hash_md5` viajan en el **body** del DELETE (para la
  salvaguarda del escenario). El front los tiene desde el `Adjunto`.

### 3.2 Env var

`MAKE_WEBHOOK_URL_ADJUNTOS_DELETE` — agregar al `.env`, a Railway, y a la lista
de "Variables de entorno esperadas" de CLAUDE.md cuando se construya.

### 3.3 Cambio en `components/console/document-checklist.tsx`

- El `AlertDialog` de desmarcar (hoy en líneas ~309-332) cambia su copy y su
  acción para el caso `item.archivo?.persistido`:
  - **Descripción:** "El archivo será eliminado permanentemente de la solicitud
    y del almacenamiento. Esta acción no se puede deshacer."
  - **Botón:** `variant="destructive"`, texto **"Eliminar definitivamente"**
    (reemplaza "Quitar documento"). Aplica Regla D de progreso: `disabled` +
    `<Loader2 data-icon="inline-start" className="animate-spin" />` + gerundio
    **"Eliminando…"** mientras el DELETE está en vuelo. El reset del pending va en
    `finally` (patrón sin react-hook-form de CLAUDE.md).
  - **Cancelar:** sigue siendo "Conservar".
- El comentario de líneas 313-315 ("El archivo ya subido NO se borra…") se
  elimina: deja de ser cierto.
- Flujo al confirmar: `DELETE /api/adjuntos/[record_id]` → al `ok` →
  `onArchivo(item.codigo, null)` + `onToggle(item.codigo, false)` +
  **`onSubido()`** (que ya dispara `recargar()` del hook `useAdjuntosSolicitud`,
  para releer `TX_Adjuntos`). Con error → toast/Alert destructive, se conserva la
  fila y la marca.

### 3.4 `use-adjuntos-solicitud.ts`

Sin cambios estructurales: `recargar()` ya existe y se llama tras el borrado
igual que tras una subida. El único requisito es que el borrado se dispare con
`Adjunto.id` (record ID) — que es justo lo que este hook expone (§4.1).

---

## 4. Riesgos y consideraciones

### 4.1 ⚠ Discrepancia record ID vs. autonumber (bloqueante para el botón)

`upload/route.ts` devuelve `adjunto_id` = `{{8.adjunto_id}}` del blueprint, que es
el **autonumber** (`fldVt7Lk1ptvmgbtT`, ej. `"23"`), **no** el record ID. El
checklist guarda ese valor en `DocumentoArchivo.adjunto_id` (aunque su comentario
diga "Record ID" — el comentario está mal). Si el DELETE se cablea con ese valor,
`isValidRecordId("23")` lo **rechaza** con 400 y nunca borra.

El record ID correcto (`rec…`) está disponible por dos vías:
- **A (recomendada):** leer de `useAdjuntosSolicitud` → `Adjunto.id`, cruzando por
  `claveAdjunto`. El hook ya se recarga tras cada subida, así que el record ID
  está fresco.
- **B:** que el blueprint de Upload devuelva también `record_id: {{8.id}}`
  (`ActionCreateRecord` sí expone `id`), y el checklist lo persista. Requiere
  tocar Upload — más cambios, no recomendado para Tanda 3.

**La construcción debe elegir A o B antes de cablear el botón.** Recomendación: A.

### 4.2 Idempotencia del borrado (doble click)

Regla D ya cubre el doble submit del mismo botón (`disabled` en vuelo). Para el
caso de dos peticiones que sí lleguen a Make (p. ej. reintento tras timeout):
- El Airtable Get (módulo 2) sobre un `record_id` ya borrado devuelve vacío / 404
  → rama de error `no_encontrado`, sin efectos.
- Dropbox `file not found` se trata como éxito idempotente (§2.6).
- Resultado neto: borrar dos veces el mismo adjunto es seguro; la segunda
  responde error benigno y la UI ya no lo muestra.

### 4.3 Rollback / reintento cuando Make devuelve error

No hay transacción cross-servicio. Estrategia (§2.6): **Dropbox primero,
Airtable después**, para que un fallo deje "nada borrado" en el caso común. El
único estado inconsistente posible (Dropbox ok + Airtable falla) deja un huérfano
en Dropbox, no una fila rota — se registra en `LogEscenarios` y se limpia a mano.
No se implementa reintento automático en Tanda 3; el usuario reintenta desde la
UI (el adjunto sigue visible si Airtable no se borró).

### 4.4 ⚠ Módulo Dropbox Delete por confirmar (E-072)

Los únicos módulos Dropbox con referencia real en el repo son
`dropbox:uploadLargeFile` y `dropbox:getFile` (ambos v5). El módulo de borrado
(`dropbox:deleteAFile` / `Delete a File/Folder`) **no tiene referencia probada
aquí**. Regla E-072: no fabricar módulos Make sin referencia real. Antes de
escribir el JSON, confirmar id y versión exactos contra una instancia Make real
(o un blueprint hermano) — si no hay referencia, dejarlo como TODO explícito y no
inventar el mapper.

### 4.5 Consumo del plan Make (3er escenario permanente)

Make Free permite **máximo 2 escenarios activos**. Hoy activos: SC01 y
SC-Edicion; SC-Adjuntos-Upload y SC-Asignar **rotan** según prueba. Un
`SC-Adjuntos-Delete` permanente activo sería el **3er** escenario permanente →
requiere upgrade a **Core (US$9/mes)**. **Decisión de Sergio, no de la
construcción.** Alternativas si no se quiere pagar:
- Seguir rotando escenarios manualmente (frágil, no apto para producción).
- Consolidar Upload + Delete en **un solo escenario** con Router por `accion`
  (`upload` | `delete`) en el payload — 1 escenario cubre ambos, no suma cupo.
  Es la opción más limpia si no se hace upgrade; súbela a evaluación en Tanda 3.

### 4.6 RN-59 — borrado deshabilitado en modo consulta

En modo consulta (solicitud `asignada` con tasador) el checklist es de solo
lectura y **el borrado debe estar deshabilitado**. El botón "Eliminar
definitivamente" hereda el mismo gate `esEditable(s)` / estado de la solicitud
que ya aplica el resto del panel: no se muestra la acción destructiva cuando la
solicitud salió de `creada`. Verificar que el checklist reciba y respete ese flag
(hoy `DocumentChecklist` no lo recibe explícito — la construcción debe pasar el
estado de la solicitud y bloquear tanto la subida como el borrado en consulta).

---

## 5. Checklist de construcción (Tanda 3 — para cuando Sergio confirme)

1. [ ] Sergio decide plan Make (§4.5): Core vs. escenario consolidado Upload+Delete.
2. [ ] Confirmar módulo/versión de Dropbox Delete contra Make real (§4.4).
3. [ ] Escribir `SC-Adjuntos-Delete.blueprint.json` copiando claves de un
       `ActionDeleteRecord` v3 probado (§2.5). Validar con `json.load`.
4. [ ] Resolver record ID vs. autonumber (§4.1) — implementar opción A.
5. [ ] Crear `app/api/adjuntos/[id]/route.ts` con guard + `postToMake`.
6. [ ] Env var `MAKE_WEBHOOK_URL_ADJUNTOS_DELETE` (`.env` + Railway + CLAUDE.md).
7. [ ] Actualizar `document-checklist.tsx` (copy, botón destructivo, Regla D).
8. [ ] Gate RN-59 (§4.6): borrado deshabilitado en consulta.
9. [ ] `pnpm build` limpio antes del commit.
10. [ ] Integrar el contrato definitivo en la spec normativa
        `VProperty_Especificacion_Proyecto_v1_9_5.md`.

---

## 6. Caso de uso: reemplazo por unicidad de tipo (canonicalizado en §8.6)

> Contenido normativo en **§8.6.1, §8.6.2 y §8.6.4 (RF-52)** de la spec, y regla
> **RN-60** (§8.2). Esta sección resume la decisión de contrato y **por qué** se
> eligió, para no perder la traza; el detalle vive en la spec.

**Regla (RN-60).** El par (`clave_adjunto`, `solicitud`) es único en
TX_Adjuntos: a lo sumo un archivo por tipo de documento por solicitud. Subir un
binario **distinto** (hash distinto) a un tipo que ya tiene archivo → **reemplazo**
(borrar el anterior de Airtable + Dropbox y subir el nuevo). Mismo binario (mismo
hash) → `reused`, con precedencia sobre el reemplazo. AlertDialog de reemplazo
antes de abrir el selector; literal y botones en §8.6.4.

### 6.1 Contrato del reemplazo: ¿DELETE+POST secuencial en cliente, o unificado?

Dos arquitecturas posibles para el reemplazo:

| Opción | Cómo | Quién orquesta |
|---|---|---|
| **A · Secuencial en cliente** | El cliente llama `DELETE /api/adjuntos/[id]` del previo, espera 200, y sólo entonces `POST /api/adjuntos/upload` del nuevo | El **cliente** encadena dos requests |
| **B · Unificado backend-driven** | El cliente hace **una** subida normal (sin flag). El escenario Make detecta el previo por (solicitud, tipo) y ejecuta borrar+subir dentro de sí mismo | El **backend** (SC-Adjuntos-Upload v1.2) |

### 6.2 Recomendación: **Opción B (unificado backend-driven)** — ya adoptada por §8.6

**Se recomienda B, y es la que la spec ya fijó** (§8.6.2). Razones:

1. **Atomicidad y orden garantizados.** En B, borrar-previo y subir-nuevo ocurren
   en el mismo escenario, con el orden Dropbox→Airtable→upload y aborto temprano
   (§8.6.5). En A, entre el DELETE y el POST el cliente puede fallar, perder red o
   cerrarse: queda un tipo **vacío** tras un borrado confirmado — el peor estado
   (§8.6.5 "nunca debe quedar el previo borrado sin reemplazo real").
2. **Idempotencia por hash con precedencia.** En B, si el usuario acaba eligiendo
   el mismo binario, el módulo 2 responde `reused` y **no se borra nada** — la
   confirmación fue innecesaria pero nunca destructiva. En A, el cliente ya habría
   disparado el DELETE del previo antes de saber que el hash coincidía.
3. **Principio rector.** El cliente no compara hashes ni consulta si hay previo:
   no decide. Manda siempre la misma subida; el escenario resuelve el camino
   (§8.6, "la UI muestra y captura, nunca decide"). Un cliente con lista
   desactualizada que "cree que no hay previo" no puede romper el invariante en
   silencio, porque no es él quien elige la rama.
4. **Sin flag.** B ni siquiera necesita `{ replace: true }`: el payload de subida
   es idéntico al de v1.1 (§8.6.1), así que v1.2 se despliega sin tocar el Route
   Handler.

**`DELETE /api/adjuntos/[id]` sigue existiendo, pero sólo para el desmarcado**
(eliminar sin sustituto), no para el reemplazo. Son dos flujos distintos con dos
diálogos distintos (§8.6.4). El reemplazo es interno a la subida; el borrado puro
es el escenario SC-Adjuntos-Delete (§8.6.3).

### 6.3 Efecto en el blueprint (mejora, no Tanda 3 inicial)

La rama de reemplazo nativa vive en **SC-Adjuntos-Upload v1.2** (§8.6.2, módulo 3
= Search por `(solicitud, tipo_documento)`; rama de reemplazo = Get → Dropbox
Delete → Airtable Delete → upload normal). Es evolución del blueprint v1.1
existente, conservando conexiones. Queda como parte de la construcción de la
funcionalidad, con la salvaguarda de `tipo_documento` no vacío para no borrar
adjuntos sueltos (§8.6.2). No se construye en esta tanda de documentación.
