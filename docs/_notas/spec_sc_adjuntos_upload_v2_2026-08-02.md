# Especificación · SC-Adjuntos-Upload v1.2 + SC-Adjuntos-Delete

**Fecha:** 02-ago-2026
**Estado:** ESPECIFICACIÓN — no implementada. Construcción prevista para Tanda 3.
**Sucede a:** `spec_sc_adjuntos_delete_2026-08-02.md` (renombrado; el alcance dejó
de ser sólo el borrado).
**Autor:** panel (Arquitecto Enterprise · Next.js · Integrations · UX · QA)
**Refs:** RT-03 (cero writes directos a Airtable desde Next.js) · RN-25 · RN-59 ·
D-14 · Espec v1.9.5 §1.5.1.1, RF-51, §8.4 (f)(g)

---

## 0. Alcance y por qué cambió

La versión anterior de esta nota especificaba sólo un escenario de borrado. La
regla de negocio incorporada a la Espec v1.9.5 la deja corta:

> Para cada par (solicitud, tipo_documento) existe a lo sumo **un** adjunto en
> `TX_Adjuntos`.

Ese invariante convierte la subida en una operación con tres desenlaces —alta,
reutilización y reemplazo— en vez de uno. El borrado deja de ser un flujo
independiente y pasa a ser, en el caso más frecuente, *una fase interna de la
subida*. De ahí el nuevo alcance:

| Escenario | Cuándo corre | Estado |
|---|---|---|
| **SC-Adjuntos-Upload v1.2** | Toda subida desde el checklist. Resuelve nuevo / reemplazo / reused | Evolución de v1.1 (activo) |
| **SC-Adjuntos-Delete** | Sólo cuando el usuario **desmarca** un documento y confirma | Nuevo |

**Decisión arquitectónica de fondo:** el reemplazo lo detecta y ejecuta el
backend. El cliente no compara hashes, no consulta si hay adjunto previo y no
envía flags. Envía siempre la misma petición; Make decide el camino. La UI sólo
es responsable de la UX de confirmación. Esto sostiene el principio rector del CU
—la UI muestra y captura, nunca decide— y evita el modo de fallo del reparto
contrario: un cliente que cree que no hay previo, porque su lista está
desactualizada, manda un "alta" y rompe el invariante en silencio.

**Plan Make: Pro.** Sin restricción de escenarios activos. La nota anterior
razonaba sobre Free (2 activos) y su tabla de opciones de upgrade queda sin
objeto: los cinco escenarios conviven activos.

---

## 1. Contrato del webhook SC-Adjuntos-Upload v1.2

### 1.1 Payload de entrada — sin cambios respecto de v1.1

**Ningún campo nuevo. Ningún flag.** El contrato de entrada es idéntico al que
hoy emite `app/api/adjuntos/upload/route.ts`, lo que permite desplegar v1.2 sin
tocar el Route Handler:

```json
{
  "solicitud_id":     "recIEvKCbe7J8TDaB",
  "codigo_ext":       "VP-2026-0053",
  "tipo_documento":   "foto_ofertas_comparables",
  "nombre_archivo":   "Foto REF Ofertas y REF CBR del inf.JPG",
  "mime_type":        "image/jpeg",
  "tamanio_kb":       155,
  "hash_md5":         "6a37495c2c7b5f324ab966b254067308",
  "subido_por":       "Ejecutivo",
  "contenido_base64": "…"
}
```

`tipo_documento` es el `codigo` de `D_TipoDocumento`; se persiste en
`clave_adjunto` (`fldaLLtzAaEn1O8IW`) y es la clave por la que el escenario
localiza al adjunto previo. **No** se usa `tipo` (`fldUYBO3LeOHxiIGW`): es un
`singleSelect` heredado con opciones incoherentes que ningún escenario escribe
(documentado en `lib/adjuntos.ts:15-27`).

**Header:** `X-VP-Signature: hmac-sha256(body, MAKE_HMAC_SECRET)`, resuelto por
`postToMake` (`lib/make-client.ts:164-188`). Sin cambios.

### 1.2 Respuesta — nuevo campo `modo`

```jsonc
// alta
{ "ok": true, "modo": "nuevo", "adjunto_id": "24", "url_dropbox": "/VProperty/…", "nombre_archivo": "…", "tamanio_kb": 155, "reused": false }

// mismo binario, ya existía
{ "ok": true, "modo": "reused", "adjunto_id": "24", "url_dropbox": "/VProperty/…", "nombre_archivo": "…", "tamanio_kb": 155, "reused": true }

// binario distinto para un tipo que ya tenía archivo
{ "ok": true, "modo": "reemplazo", "adjunto_id": "25", "adjunto_previo_id": "recn0UEsUU6FHHvgx", "url_dropbox": "/VProperty/…", "nombre_archivo": "…", "tamanio_kb": 210, "reused": false }

// error
{ "ok": false, "error": "…", "reintentable": true }
```

`modo` ∈ `{ "nuevo", "reemplazo", "reused" }`. `adjunto_previo_id` sólo viaja en
`reemplazo`, y es el **record ID** del adjunto eliminado (para `A_Eventos`, §5.5).

`reused` se conserva por compatibilidad con el cliente actual
(`MakeAdjuntoResponse`, `upload/route.ts:41-50`), que ya lo consume. Es redundante
con `modo` y queda marcado para retiro cuando el cliente migre.

---

## 2. Blueprint conceptual · SC-Adjuntos-Upload v1.2

> No se escribe JSON en esta nota. Se escribirá en Tanda 3 partiendo de
> `SC-Adjuntos-Upload.blueprint.json` v1.1, que conserva las conexiones
> (`__IMTCONN__` Airtable `8847431`, Dropbox `7553318`).

### 2.a Módulo 1 · `gateway:CustomWebHook`

Mismo hook (`3377943`), mismo endpoint. No se reprovisiona: el cliente sigue
apuntando a la misma URL y el despliegue de v1.2 es transparente para Next.js.

### 2.b Search Records por (hash + solicitud) → ¿reused?

- Tabla `TX_Adjuntos` (`tblur71x1oItbmKZc`), `maxRecords: 1`.
- Fórmula (ya en producción desde v1.1):
  `AND({hash_md5} = "{{1.hash_md5}}", ARRAYJOIN({solicitud}) = "{{1.codigo_ext}}")`
- Si **existe** → responder `reused: true`, `modo: "reused"`. **FIN**, sin tocar
  Dropbox ni crear filas.

> **Dependencia frágil a vigilar.** `ARRAYJOIN({solicitud})` rinde el *primary
> field* del registro vinculado, que es `codigo_solicitud`
> (`fldDXEE1ejMNVDlpB`, formula) — **no** `codigo_ext` (`fldSuJx1fDNYYwDcD`).
> Hoy coinciden (verificado vía MCP el 02-ago-2026: ambos `"VP-2026-0053"` para
> `recIEvKCbe7J8TDaB`). Son campos distintos que casualmente coinciden; si
> divergen, esta comparación y la de §2.c fallan a la vez y en silencio.

Este chequeo es por (hash, solicitud) y **no** por tipo: si el mismo binario ya
está cargado en *otro* tipo de la misma solicitud, se devuelve `reused`. Es
deliberado —el binario ya está en Dropbox y volver a subirlo no aporta— pero
implica que un archivo no puede figurar en dos tipos a la vez. Si el negocio
llegara a exigirlo, este módulo pasa a (hash + solicitud + tipo).

### 2.c Search Records por (solicitud + tipo_documento) → ¿reemplazo?

Sólo se ejecuta si 2.b no encontró nada.

- Tabla `TX_Adjuntos`, `maxRecords: 1`.
- Fórmula:
  `AND(ARRAYJOIN({solicitud}) = "{{1.codigo_ext}}", {clave_adjunto} = "{{1.tipo_documento}}")`
- **Si encuentra** → hay adjunto previo del mismo tipo con hash distinto (el mismo
  hash ya se descartó en 2.b): rama de **reemplazo**.
- **Si no encuentra** → rama de **alta** (§2.d).

> ⚠ **El campo `activo` no existe en `TX_Adjuntos`.** Verificado vía MCP el
> 02-ago-2026: la tabla tiene 26 campos y ninguno se llama `activo`. La fórmula
> **no puede** llevar `{activo} = TRUE()` — Airtable devolvería
> `INVALID_FILTER_BY_FORMULA` y el escenario fallaría en toda subida, no sólo en
> los reemplazos.
>
> Consecuencia mayor: el soft-delete que §8.4 (d) de la Espec describe
> (`TX_Adjuntos.activo=FALSE` conserva el binario por auditoría) **es letra
> muerta para esta tabla** — no hay campo que poner en FALSE. El borrado duro no
> es sólo la opción elegida: hoy es la única semántica implementable. Eso refuerza
> la excepción acotada de §8.4 y hace de `A_Eventos` (§5.5) el **único** rastro
> que sobrevive a un borrado. Si en algún momento se quisiera soft-delete real,
> crear el campo es prerrequisito y esta fórmula debe incorporarlo.

Salvaguarda: `tipo_documento` puede llegar vacío —es `.optional()` en el zod del
handler, para adjuntos sueltos que no vienen del checklist. Con `tipo_documento`
vacío **el invariante no aplica** y la rama de reemplazo debe quedar inhibida: si
no, `{clave_adjunto} = ""` haría match contra los adjuntos sueltos de la solicitud
y el primero sería borrado. Condición explícita: la rama exige
`{{1.tipo_documento}}` no vacío.

#### Rama de reemplazo

1. **Get record** del previo — recupera `url_dropbox`, `hash_md5`.
2. **Dropbox · Delete a file** del previo, path `{{4.url_dropbox}}`.
3. **Airtable · Delete record** del previo.
4. Continúa el flujo normal de subida: upload Dropbox del nuevo + create Airtable.
5. Responde `modo: "reemplazo"`, `adjunto_previo_id`.

> `url_dropbox` (`fldEccoUrOjV7oKZ5`) **no es una URL** pese a ser de tipo `url`
> en Airtable: el escenario escribe ahí `{{6.path_display}}`, la ruta dentro de
> Dropbox (`/VProperty/Tasaciones/VP-2026-0053/Foto REF Ofertas.JPG`). Es
> exactamente lo que `deleteAFile` espera. No aplicar `urlNavegableDropbox`.

> `airtable:ActionDeleteRecord` exige el record ID en la clave **`id`** del
> mapper, **no** en `record`. Ponerlo en `record` deja `id` sin definir y produce
> `[422] "records" must be a non-empty array of record IDs` — causa raíz de F-1
> en SC-Edicion, cerrada en v3.4. El plural del mensaje no implica módulo plural.

### 2.d Rama de alta

Sin previo: upload Dropbox + create Airtable, como en v1.1. Responde
`modo: "nuevo"`.

### 2.e Manejo de error y orden de operaciones

**Orden dentro del reemplazo: Dropbox Delete → Airtable Delete → upload del nuevo.**

Si **Dropbox Delete falla**, se **aborta el reemplazo completo**: no se borra la
fila de Airtable, no se sube el archivo nuevo, y se responde
`{ ok: false, reintentable: true }` con el detalle en `LogEscenarios`. El estado
queda exactamente como estaba antes de la petición, que es el único estado
seguro. **Nunca dejar el previo borrado sin reemplazo real**: un tipo que pierde
su archivo y no recibe el sustituto es peor que un reemplazo que no ocurrió,
porque el usuario ya confirmó y asume que hay documento.

Excepción: si Dropbox devuelve `path_not_found`, el binario ya no estaba. Fallo
benigno — continuar y borrar igualmente la fila de Airtable, que apunta a nada.

El orden Dropbox→Airtable se conserva por el mismo argumento de la nota anterior:
de los dos estados inconsistentes alcanzables, sólo uno es recuperable.

| Escenario | Estado resultante | Recuperable |
|---|---|---|
| Dropbox OK, Airtable falla | Fila apuntando a un archivo inexistente | **Sí** — visible en la UI y auditable; el usuario reintenta y el Delete de Dropbox falla benignamente mientras el de Airtable completa |
| Airtable OK, Dropbox falla | Binario huérfano en Dropbox, sin fila que lo referencie | **No** — nadie lo ve nunca desde la app |

**No hay rollback transaccional.** Make no lo ofrece entre apps distintas y no se
va a simular re-subiendo binarios. La estrategia es orden + abort + idempotencia,
no compensación.

### 2.f Router: filtro explícito en **todas** las ramas

En Make, una ruta de Router sin filtro **se ejecuta siempre**, en paralelo a las
demás — no es un `else`. Ese fue el defecto de fondo corregido en v1.1: la ruta de
alta sin filtro subía y creaba fila aunque la de detección hubiera respondido
`reused`. Con tres ramas el riesgo se triplica: cada una lleva su filtro explícito
y mutuamente excluyente, construido con el par `exist` / `notexist` sobre los `id`
de los dos Search Records.

### 2.g Log

`LogEscenarios` (`tblR4VWpUHw1CSyIS`) con el `mapper` **poblado**, registrando el
`modo` resuelto. Los módulos 4 y 9 de v1.1 tienen `"record": {}` y crean filas en
blanco en cada ejecución: ruido, no observabilidad. Deuda preexistente a no
replicar en v1.2.

---

## 3. Escenario paralelo · SC-Adjuntos-Delete

Se usa **exclusivamente** cuando el usuario desmarca un documento del checklist y
confirma la eliminación. No participa del reemplazo (ese borrado es interno a
v1.2, §2.c).

### 3.1 Identificador: record ID, no `adjunto_id`

Conviven dos identificadores y sólo uno sirve:

| Identificador | Campo | Tipo | Quién lo tiene |
|---|---|---|---|
| `adjunto_id` | `fldVt7Lk1ptvmgbtT` | `autoNumber` (ej. `24`) | Lo devuelve el escenario de upload; el cliente lo guarda en `item.archivo.adjunto_id` |
| record ID | — | `rec…` | Lo expone `Adjunto.id` del hook `useAdjuntosSolicitud` (`lib/adjuntos.ts:100`) |

El contrato usa el **record ID**: es lo que `ActionDeleteRecord` exige (§2.c),
permite reutilizar `isValidRecordId` y evita un Search extra sólo para resolver el
autoNumber. **Consecuencia:** el checklist debe casar su fila con el adjunto
persistido por `claveAdjunto` para obtener `Adjunto.id`; el `adjunto_id` que hoy
guarda `item.archivo` no sirve para borrar.

### 3.2 Payload y respuesta

```json
{
  "adjunto_record_id": "recn0UEsUU6FHHvgx",
  "solicitud_id":      "recIEvKCbe7J8TDaB",
  "codigo_ext":        "VP-2026-0053",
  "hash_md5":          "6a37495c2c7b5f324ab966b254067308",
  "subido_por":        "Ejecutivo"
}
```

Header `X-VP-Signature` idéntico al de Upload (`postToMake`).

```jsonc
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": true,  "airtable_borrado": true }
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": false, "airtable_borrado": true,  "aviso": "huerfano_dropbox" }
{ "ok": true, "adjunto_id": "recn0UEsUU6FHHvgx", "dropbox_borrado": false, "airtable_borrado": false, "ya_no_existia": true }
{ "ok": false, "error": "…", "reintentable": true }
```

`error` viaja para el log del servidor, **nunca al usuario**: la UI emite el
literal §6 canónico.

### 3.3 Blueprint conceptual

1. **Webhook custom** — hook nuevo, registrar URL en `Z_Webhooks` (`tblovY0Bt1Avhdgdx`).
2. **Airtable Get record** — `TX_Adjuntos`, `{{1.adjunto_record_id}}`. Output
   fields debe incluir `url_dropbox`, `hash_md5` y `solicitud`. Tres salvaguardas
   antes de destruir nada:
   - el registro existe (`{{2.id}}` exist) — si no, `ya_no_existia: true`;
   - `{{2.hash_md5}}` = `{{1.hash_md5}}` — se borra el archivo que el usuario vio,
     no otro que ocupe ese record ID tras una carrera;
   - `ARRAYJOIN({{2.solicitud}})` = `{{1.codigo_ext}}` — impide que un `id`
     manipulado borre adjuntos de otra solicitud.
3. **Dropbox · Delete a file** — path `{{2.url_dropbox}}`. Error handler `Resume`
   ante `path_not_found`: continuar y borrar la fila igual, respondiendo
   `dropbox_borrado: false`. Ante cualquier otro fallo (auth, red, rate limit),
   cortar antes del paso 4 y responder `reintentable: true` — preferible no borrar
   nada a crear un huérfano invisible.
4. **Airtable · Delete record** — clave `id` (no `record`), `{{1.adjunto_record_id}}`.
5. **Webhook response** — §3.2.
6. **Log** en `LogEscenarios` con mapper poblado.

Añadir `ADJUNTOS_DELETE` y `ADJUNTOS_UPLOAD_V2` como opciones del `singleSelect`
`Escenario` (`fldPktGeTzNCRQ319`) **en Airtable primero**, y después en
`ESCENARIO_CHOICE` (`lib/make-client.ts:65-71`). En ese orden: el helper degrada a
`Escenario` vacío si la opción no existe, y la traza se pierde a medias.

---

## 4. Cambios en Next.js — Tanda 3, **no ahora**

> Nada de esta sección está implementado. Ningún archivo de `app/`, `components/`
> o `lib/` fue modificado al redactar esta especificación.

### 4.1 `document-checklist.tsx` · AlertDialog de reemplazo

Al hacer click en subir sobre un tipo **que ya tiene adjunto activo**, mostrar
confirmación **antes** de abrir el selector de archivo:

> "El documento [Tipo de documento] ya tiene un archivo cargado
> ([nombre_archivo previo]). Si continúas con un archivo distinto, se reemplazará
> el anterior de forma permanente. Solo se conserva un archivo por tipo de
> documento. ¿Deseas continuar?"

Botones: `variant="destructive"` **"Reemplazar"** · **"Cancelar"**.

Es un diálogo **distinto** del de desmarcado (§4.2). Uno advierte que un archivo
cede su lugar a otro; el otro, que un archivo desaparece sin sustituto.

Nota UX: el diálogo se dispara por *tener adjunto previo*, no por *saber que el
hash difiere* — el cliente no conoce el hash hasta que el usuario elige archivo.
Si el usuario acaba eligiendo el mismo binario, el backend responde
`modo: "reused"` y no se reemplaza nada. La confirmación habrá sido innecesaria
pero nunca engañosa: se advirtió de un riesgo que no llegó a materializarse.

### 4.2 `document-checklist.tsx` · AlertDialog de desmarcado

El texto actual (líneas 316-320) dice que *"El archivo ya subido se mantiene en
los adjuntos de la solicitud"* — hoy literalmente cierto, porque
`confirmarQuitar()` (líneas 184-190) sólo muta estado local. Con el borrado real
pasa a:

> "El archivo será eliminado permanentemente de la solicitud y del
> almacenamiento. Esta acción no se puede deshacer."

Botón: `variant="destructive"`, texto **"Eliminar definitivamente"**.

### 4.3 Regla D en ambos flujos

`confirmarQuitar()` y el handler de reemplazo pasan a `async` y aplican Regla D
—hoy no la cumplen porque hoy no hacen I/O:

```tsx
const [enCurso, setEnCurso] = React.useState(false)

async function confirmar() {
  setEnCurso(true)
  try {
    // … fetch
  } finally {
    setEnCurso(false)   // OBLIGATORIO en finally, no en catch
  }
}
```

Botón `disabled={enCurso}`, `<Loader2 data-icon="inline-start" className="animate-spin" />`,
texto `"Eliminando…"` / `"Reemplazando…"` — con `…` (U+2026), no `...`.

### 4.4 Nueva ruta `app/api/adjuntos/[id]/route.ts` · `DELETE`

Espeja `upload/route.ts` (`dynamic = 'force-dynamic'`, `runtime = 'nodejs'`):

1. `auth()` → 401 `'No autorizado.'` sin sesión.
2. Env vars ausentes → 200 `{ ok: false, degraded: true, … }` (no romper la
   consola por config incompleta).
3. **Guard `isValidRecordId`** sobre el segmento `[id]` → 400 con
   `MENSAJE_ERROR_RED`. Mismo helper que `/api/solicitudes/[id]`.
4. zod sobre el body: `solicitud_id` (también con `isValidRecordId`),
   `codigo_ext`, `hash_md5`, `subido_por` opcional.
5. Guard RN-59 server-side (§5.3) → 409 si la solicitud está en modo consulta.
6. `postToMake(url, payload, { escenario: 'ADJUNTOS_DELETE', solicitudId: codigo_ext, timeoutMs: 30000 })`
   — 30 s bastan: no viaja binario, a diferencia del upload (45 s).

Errores técnicos sólo a `console.error`. Al usuario, mensaje humano §6.

### 4.5 Variables de entorno

```
MAKE_WEBHOOK_URL_ADJUNTOS_DELETE=https://hook.eu1.make.com/***   # nueva
MAKE_WEBHOOK_URL_ADJUNTOS=https://hook.eu1.make.com/***          # existente; apunta a v1.2 al desplegarlo
```

> El nombre real de la variable de upload en el repo es
> **`MAKE_WEBHOOK_URL_ADJUNTOS`** (`upload/route.ts:58`), no
> `MAKE_WEBHOOK_URL_ADJUNTOS_UPLOAD`. No renombrarla: v1.2 reutiliza el mismo hook
> y el mismo endpoint, así que su valor tampoco cambia.

Añadir la nueva a `.env.local`, a Railway y a la lista de CLAUDE.md.

### 4.6 `lib/adjuntos.ts`

- `RawFields`: añadir `hash_md5?: string`.
- `fetchAdjuntosPorSolicitud`: añadir `'hash_md5'` al array `fields`
  (`lib/adjuntos.ts:83-92`).
- `Adjunto`: añadir `hashMd5: string`.

Necesario para la salvaguarda de §3.3.

### 4.7 Refresco de `use-adjuntos-solicitud`

Llamar `recargar()` (`lib/use-adjuntos-solicitud.ts:75`) tras respuesta
`modo: "nuevo"`, `modo: "reemplazo"` y tras un DELETE confirmado.

**No** confiar en el estado local: si el borrado fue parcial o el reemplazo
abortó, el checklist debe reflejar la verdad de Airtable, no el optimismo del
cliente. En el desmarcado, `onToggle(item.codigo, false)` se ejecuta **sólo** si
la recarga confirma la desaparición.

Tras `modo: "reused"` el refresco es innecesario —nada cambió en Airtable— pero
inofensivo.

### 4.8 Mensajes (§6 Blueprint)

- Alta: comportamiento actual, sin cambios.
- Reemplazo: `"Documento reemplazado"` (sonner `success`).
- Desmarcado: `"Documento eliminado"`.
- Fallo: `"No pudimos completar la acción. Intenta nuevamente en unos segundos."`
- Parcial (`dropbox_borrado: false`): tratar como éxito de cara al usuario. El
  huérfano en Dropbox es un problema de operación, no algo que la Ejecutiva pueda
  resolver ni deba entender. Queda en `LogEscenarios`.

---

## 5. Riesgos y consideraciones

### 5.1 Idempotencia del borrado (doble click)

Dos defensas, ninguna suficiente sola:

1. **Cliente:** Regla D — botón `disabled` en vuelo. Cubre el doble click, no la
   doble pestaña ni el reintento tras timeout.
2. **Escenario:** el Get record del paso 2 es el guard real. Si el registro ya no
   existe, no corre ni Dropbox ni el Delete: se responde
   `{ ok: true, ya_no_existia: true }`.

**Decisión: un borrado repetido devuelve `ok: true`, no 404.** El estado final
deseado —el adjunto no existe— ya se cumple; devolver 404 obligaría al cliente a
distinguir dos casos que para el usuario son el mismo.

En el reemplazo la idempotencia la da §2.b: reintentar la misma subida tras un
timeout encuentra el hash ya cargado y devuelve `reused`, sin volver a borrar nada.

### 5.2 Rollback ante fallo parcial

- **Sin rollback transaccional** (§2.e): imposible entre Dropbox y Airtable en
  Make, y no se va a simular re-subiendo binarios.
- **Sin reintento automático.** Un reintento ciego sobre una operación destructiva
  con timeout de red es la receta para borrar dos veces lo que la primera vez sí
  funcionó. El reintento lo decide la persona, con el botón, sobre una lista ya
  recargada.
- `reintentable: true` es señal para el copy del toast, no instrucción de reintento
  automático.

Matriz de fallos parciales:

| Fallo | Respuesta | Airtable | Dropbox | Acción |
|---|---|---|---|---|
| Delete Dropbox del previo (reemplazo) | `ok: false` | previo intacto | previo intacto | abortar; nada cambió |
| Delete Airtable del previo (reemplazo) | `ok: false` | previo vivo, apunta a nada | previo borrado | visible y auditable; el reintento del usuario lo resuelve |
| Upload del nuevo, tras borrar el previo | `ok: false` | tipo vacío | previo borrado | **peor caso**; el usuario ve el tipo vacío y vuelve a subir |
| Delete Dropbox (desmarcado), `path_not_found` | `ok: true` + `aviso` | fila borrada | ya no estaba | ninguna |
| Delete Dropbox (desmarcado), otro error | `ok: false` | fila intacta | archivo intacto | reintento manual |

El peor caso —fila 3— es el precio de no tener transacción. Se mitiga con el orden
(el upload del nuevo va último, cuando ya no queda nada que deshacer) y es visible:
el tipo queda vacío en el checklist, no en un estado engañoso.

### 5.3 RN-59 · modo consulta

Con la solicitud en modo consulta (estado ≠ `creada` **y** con tasador asignado,
Espec §1.4), quedan deshabilitados los **tres** flujos: subir, reemplazar y
desmarcar. La Ejecutiva no manipula la carpeta documental una vez que el tasador la
tiene a la vista.

Implementación en dos capas, ambas necesarias:

- **UI:** botones y checkbox `disabled`.
- **Servidor:** los Route Handlers de upload y de delete revalidan el estado antes
  de llamar a Make y devuelven **409**. La UI no decide reglas de negocio;
  deshabilitar el botón es feedback rápido, no control de acceso.

⚠ **Hueco a resolver antes de construir.** No existe hoy en el repo ningún helper
`esEditable` ni constante `RN-59` (`grep` sobre `lib/*.ts` y
`document-checklist.tsx` no devuelve nada), pese a que CLAUDE.md lo cita en el
ejemplo de Regla D como si existiera. Hay que decidir en Tanda 3 si se implementa
el helper o si el guard se resuelve leyendo `estado` + `tasador` en el handler.
**Requisito previo de la construcción.**

### 5.4 Consumo de plan Make

**Pro. Sin restricción de escenarios activos.** Los cinco —SC01, SC-Edicion,
SC-Asignar, SC-Adjuntos-Upload v1.2 y SC-Adjuntos-Delete— conviven activos, y
desaparece la rotación manual que hasta ahora era fuente de fallos de prueba
difíciles de diagnosticar: un escenario apagado se ve igual que un escenario roto.

Lo que sí consume el reemplazo es **operaciones**: un reemplazo son ~7 módulos
contra los ~4 de un alta. No es preocupante al volumen actual, pero conviene
medirlo antes de extender el patrón a IF-03 (fotos de terreno, donde el volumen es
otro orden de magnitud).

### 5.5 Trazabilidad en `A_Eventos`

Ambos flujos destructivos escriben en `A_Eventos` (`tblMKmDg2KrO5fMn8`,
`tipo_evento` es `singleLineText`):

| Flujo | `tipo_evento` | Contenido |
|---|---|---|
| Reemplazo | `adjunto_reemplazado` | `adjunto_previo_id` + `adjunto_nuevo_id` + `tipo_documento` + `subido_por` |
| Desmarcado | `adjunto_eliminado` | `adjunto_id` + `tipo_documento` + `subido_por` |

Sin esto, el borrado duro deja un hueco de auditoría: el binario ya no está, la
fila tampoco, y no queda rastro de que existieron. Como `TX_Adjuntos` no tiene
campo `activo` (§2.c), **el evento es lo único que sobrevive al borrado**, y es lo
que hace aceptable la excepción al soft-delete de §8.4 (d).

Se escribe desde el escenario Make, no desde Next.js (RT-03).

---

## 6. Checklist de construcción (Tanda 3)

- [ ] Decisión sobre el guard RN-59 server-side (§5.3) — **bloqueante**
- [ ] Decidir si se crea el campo `activo` en `TX_Adjuntos` o se asume borrado duro (§2.c) — **bloqueante**
- [ ] Crear opciones `ADJUNTOS_DELETE` y `ADJUNTOS_UPLOAD_V2` en el `singleSelect` `Escenario` de `LogEscenarios`
- [ ] Evolucionar `SC-Adjuntos-Upload.blueprint.json` a v1.2 · reimportar · verificar el `name` en Make
- [ ] Escribir `SC-Adjuntos-Delete.blueprint.json` · importar · registrar hook en `Z_Webhooks` · activar
- [ ] `MAKE_WEBHOOK_URL_ADJUNTOS_DELETE` en `.env.local` + Railway + CLAUDE.md
- [ ] `lib/adjuntos.ts`: `hash_md5` en `RawFields`, `fields` y `Adjunto`
- [ ] `app/api/adjuntos/[id]/route.ts` con `DELETE`
- [ ] `document-checklist.tsx`: dos AlertDialog distintos, Regla D, `recargar()`
- [ ] Eventos `adjunto_reemplazado` / `adjunto_eliminado` en `A_Eventos`
- [ ] Verificar el orden alfabético del checklist contra §1.5.1.1 (hoy sin garantía explícita en `lib/tipos-documento.ts`)
- [ ] Tests: guard `isValidRecordId`, doble borrado idempotente, los tres `modo`, literales §6
- [ ] `pnpm build` limpio antes del commit
