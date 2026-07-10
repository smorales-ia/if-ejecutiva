# SC-Adjuntos-Upload · Instrucciones de importación en Make

> Para Sergio. No requiere conocimientos técnicos. Sigue los pasos en orden.
> Si algo no calza exactamente con lo que ves en pantalla, no improvises:
> anota dónde te quedaste y avísale a Claude Code antes de seguir.
> Este blueprint es más complejo que el de SC01 (tiene una bifurcación —
> "Router"), así que es más probable que el import no quede 100% perfecto.
> Si eso pasa, no es un error tuyo — salta directo a **"Fallback manual"**
> más abajo y arma el escenario módulo por módulo con esa guía.

**Si tenías un escenario SC-Adjuntos-Upload a medias de un intento anterior**, bórralo antes de empezar (menú **(⋯)** → **Delete** sobre el escenario viejo).

---

## 1. Importar el blueprint

1. Entra a [Make](https://eu1.make.com) → **Scenarios**.
2. Clic en **Create a new scenario**.
3. En la esquina superior derecha del lienzo vacío, clic en el menú **(⋯)** → **Import Blueprint**.
4. Selecciona el archivo `docs/make-blueprints/SC-Adjuntos-Upload.blueprint.json`.
5. Make debería dibujar: **Webhook → Search Records → Router**, y del Router dos ramas: **Rama A (arriba): Log → Webhook Response** · **Rama B (abajo): Dropbox Upload → Dropbox Create Shared Link → Airtable Create Record → Log → Webhook Response**. 10 cajas en total.

Si el import falla, o dibuja algo distinto a esto, no te preocupes — ve a **"Fallback manual completo"** más abajo.

---

## 2. Reemplazar los placeholders

| # | Dónde | Qué hacer |
|---|---|---|
| 1 | Módulo 1 (Webhook) | Nómbralo **"SC-Adjuntos-Upload"**. |
| 2 | Módulo 1 (Webhook) → **Data structure** | Pega el JSON de la sección **"3. Estructura de datos del webhook"**. |
| 3 | Módulos 2, 4, 8, 9 (los 4 módulos de Airtable) | En **Connection**, usa **"Airtable VProperty"** (la misma que ya usas en SC01) en los 4. |
| 4 | Módulos 6 y 7 (los 2 módulos de Dropbox) | En **Connection**, usa **"My Dropbox connection"** en ambos. |
| 5 | Cada módulo Airtable → **Base** / **Table** | Deberían aparecer preseleccionados. Si no, elige "VProperty" como base y la tabla indicada en cada uno (ver tabla de módulos abajo). |

---

## 3. Estructura de datos del webhook

Pega esto en el módulo 1 cuando Make te pida la "Data structure":

```json
{
  "solicitud_id": "text",
  "codigo_ext": "text",
  "nombre_archivo": "text",
  "mime_type": "text",
  "tamanio_kb": "number",
  "hash_md5": "text",
  "subido_por": "text",
  "contenido_base64": "text"
}
```

---

## 4. El Router y sus dos filtros (la parte delicada)

Después de importar, haz doble clic en el módulo **Router** (el rombo). Deberían aparecer dos rutas. Revisa (o crea, si el import no las trajo) estos dos filtros exactamente:

**Ruta A — "Ya existe" (arriba, hacia Log → Webhook Response corto)**

Condición (todas deben cumplirse — "Y"):
- El campo `Adjuntos existentes` → `id` (del módulo 2, Search Records) **existe / no está vacío**.
- La solicitud de ese adjunto existente coincide con la solicitud de este archivo: usa la fórmula `contains(2.solicitud; 1.solicitud_id)` = `true`. En el editor de fórmulas de Make, esto se escribe seleccionando la función `contains` de la lista, primer argumento = campo `solicitud` del módulo 2, segundo argumento = campo `solicitud_id` del módulo 1 (Webhook).

**Ruta B — "Nuevo" (abajo, hacia Dropbox → Create Record → Log → Webhook Response)**

Condición (basta que se cumpla una — "O"):
- El campo `id` del módulo 2 **no existe / está vacío** (no hubo ningún archivo con ese hash antes), **O**
- `contains(2.solicitud; 1.solicitud_id)` = `false` (el hash coincide, pero es de otra solicitud distinta — este archivo igual se sube y se crea una fila nueva).

Si no encuentras la función `contains` en el editor de Make, o el filtro no te deja escribir esta condición exactamente así, usa esta alternativa más simple (menos precisa pero funcional): condición Ruta A = "el campo `id` del módulo 2 existe"; condición Ruta B = "el campo `id` del módulo 2 no existe". Esto deja de distinguir "hash de otra solicitud" como caso especial (lo trataría como duplicado aunque sea de otra solicitud) — avísame si tuviste que usar esta alternativa, para documentarlo como limitación conocida.

---

## 5. Tabla de módulos (referencia rápida)

| # | Módulo | App · Acción | Tabla/Base |
|---|---|---|---|
| 1 | Webhook | Custom webhook | — |
| 2 | Search Records | Airtable | TX_Adjuntos (`tblur71x1oItbmKZc`) — fórmula `{hash_md5} = "{{1.hash_md5}}"`, Max records = 1 |
| 3 | Router | Flow control | — |
| 4 (ruta A) | Create Record | Airtable | LogEscenarios (`tblR4VWpUHw1CSyIS`) |
| 5 (ruta A) | Webhook response | Custom webhook | `reused: true` |
| 6 (ruta B) | Upload a File | Dropbox | path `/VProperty/Tasaciones/{{1.codigo_ext}}/{{1.nombre_archivo}}` |
| 7 (ruta B) | Create a Shared Link | Dropbox | sobre el archivo subido en el módulo 6 |
| 8 (ruta B) | Create Record | Airtable | TX_Adjuntos (`tblur71x1oItbmKZc`) |
| 9 (ruta B) | Create Record | Airtable | LogEscenarios (`tblR4VWpUHw1CSyIS`) |
| 10 (ruta B) | Webhook response | Custom webhook | `reused: false` |

**Módulo 8 (Create Record en TX_Adjuntos)** — mapea así:

| Campo Airtable | Viene de |
|---|---|
| `nombre_archivo` | webhook `nombre_archivo` |
| `url_dropbox` | resultado del módulo 7 (Create a Shared Link) → `url` |
| `tamanio_kb` | webhook `tamanio_kb` (ya viene en KB, no dividir) |
| `mime_type` | webhook `mime_type` |
| `hash_md5` | webhook `hash_md5` |
| `subido_por` | webhook `subido_por`; si viene vacío, usa el texto fijo **"Ejecutivo"** (opción existente del select — no crear opciones nuevas) |
| `solicitud` | Link → `[{ id: {{1.solicitud_id}} }]` (el record id que ya trae el webhook — a diferencia de SC01, aquí no hace falta buscar nada, el frontend ya conoce la solicitud) |
| `estado_extraccion` | valor fijo **"idle"** |

---

## 6. Guardar y activar

1. Clic en **Save**.
2. Activa el interruptor **ON/OFF** del escenario.
3. Clic en el módulo 1 (Webhook) → copia la URL (`https://hook.eu1.make.com/...`).

---

## 7. Enviarme la URL

Esa URL es un secreto — no la compartas por chat ni la pegues en ningún documento de este repo.

1. Pégamela directamente en la conversación (o dime que ya está en tu `.env.local` si prefieres pegarla tú mismo ahí).
2. Confírmame que activaste el escenario y que revisaste los 2 filtros del Router (sección 4).

Con eso continúo con la Fase 2 (Route Handler).

---

## Fallback manual completo (si el import falla)

Arma el escenario a mano, módulo por módulo:

**Módulo 1 — Webhooks → Custom webhook**
- Nombre: `SC-Adjuntos-Upload`
- Data structure: JSON de la sección 3.

**Módulo 2 — Airtable → Search Records**
- Base: VProperty (`app9G7lLkIV3CpeLa`) · Tabla: TX_Adjuntos (`tblur71x1oItbmKZc`)
- Fórmula: `{hash_md5} = "{{1.hash_md5}}"` · Max records: 1
- **No** agregues `solicitud` a esta fórmula — ver nota técnica abajo.

**Módulo 3 — Flow control → Router**
- Arrastra el ícono de Router justo después del módulo 2. Se crean automáticamente 2 rutas ("Route 1", "Route 2").
- Configura los filtros de cada ruta según la sección 4 de este documento.

**Rama A (Ruta "Ya existe")**

**Módulo 4 — Airtable → Create a Record** (tabla LogEscenarios)
- Campos: `escenario`="ADJUNTOS_UPLOAD", `solicitud_id`={{1.codigo_ext}}, `estado`="ok", `payload_enviado` con el JSON de hash+nombre+reused:true, `respuesta`="reused=true, adjunto existente {{2.id}}".

**Módulo 5 — Webhooks → Webhook response**
- Status: 200
- Body: `{"ok": true, "adjunto_id": "{{2.adjunto_id}}", "url_dropbox": "{{2.url_dropbox}}", "nombre_archivo": "{{2.nombre_archivo}}", "tamanio_kb": {{2.tamanio_kb}}, "reused": true}`

**Rama B (Ruta "Nuevo")**

**Módulo 6 — Dropbox → Upload a File**
- Path: `/VProperty/Tasaciones/{{1.codigo_ext}}/{{1.nombre_archivo}}`
- Contenido: `{{1.contenido_base64}}`, codificación base64.
- Mode: Add (no overwrite) · Autorename: sí.

**Módulo 7 — Dropbox → Create a Shared Link (o el nombre equivalente que veas en tu buscador de módulos Dropbox)**
- Path: el `path_display` que devolvió el módulo 6.
- **Si en la organización ya existe otro patrón para generar el link público de Dropbox** (usado por el pipeline E1/E2/E3, que no debemos tocar), prefiere ese patrón en vez de este módulo — no pude verificarlo desde mi entorno porque el MCP de esta sesión sólo tiene acceso a Airtable, no a Make.

**Módulo 8 — Airtable → Create a Record** (tabla TX_Adjuntos) — ver tabla de mapeo en la sección 5.

**Módulo 9 — Airtable → Create a Record** (tabla LogEscenarios)
- Campos: igual que el módulo 4 pero con `reused:false` y `respuesta`="reused=false, adjunto nuevo {{8.id}}".

**Módulo 10 — Webhooks → Webhook response**
- Status: 200
- Body: `{"ok": true, "adjunto_id": "{{8.adjunto_id}}", "url_dropbox": "{{7.url}}", "nombre_archivo": "{{1.nombre_archivo}}", "tamanio_kb": {{1.tamanio_kb}}, "reused": false}`

---

## Nota técnica — por qué el Search Records no filtra por solicitud

Si te preguntas por qué el módulo 2 no filtra directamente `{hash_md5}=... AND {solicitud}=...`: lo intentamos y no funciona. `TX_Solicitudes` tiene un campo llamado `codigo_solicitud` que Airtable usa internamente como "campo principal" de esa tabla, y ese campo está vacío en absolutamente todas las filas (nadie lo llena hoy). Cuando una fórmula de Airtable compara un campo tipo "Link" (como `TX_Adjuntos.solicitud`), lo hace contra ese campo principal del registro vinculado — no contra su ID real. Como está vacío, cualquier fórmula que intente comparar `{solicitud}` con algo siempre da "no coincide". Por eso la verificación de "misma solicitud" se hace en el Router, leyendo el campo `solicitud` del módulo 2 tal como lo entrega el propio módulo (ahí sí trae los IDs reales, es una representación distinta a la de las fórmulas). Detalle completo en `docs/aprendizajes.md`, entradas E-018 y E-024.

---

## Fix módulos Dropbox (10-jul-2026)

El primer intento de este blueprint falló al importar: `dropbox:uploadFile` v1 y `dropbox:createSharedLink` v1 aparecían como **"Module Not Found"** — no existen en esta instancia de Make. Se corrigió comparando contra el blueprint real y activo de `E3_Carbone_Download_Dropbox` (que Sergio exportó): el módulo Dropbox correcto es **`dropbox:uploadLargeFile` v5**, con `path` = solo la carpeta y `filename` = nombre del archivo por separado (Make los concatena), y `data` como binario vía `toBinary(...; "base64")`.

El módulo `createSharedLink` se eliminó por completo (id 7 queda vacante en el JSON) — no hay equivalente confirmado en esta instancia. Como consecuencia, `TX_Adjuntos.url_dropbox` guarda por ahora el **path interno de Dropbox** (`{{6.path_display}}`), no un link público clickeable — deuda técnica aceptada para Fase Adjuntos 1, documentada en `docs/aprendizajes.md` E-025. El módulo 8 (Create Record) y el módulo 10 (Webhook response de la ruta "nuevo") ya están actualizados para usar `{{6.path_display}}` en vez de la referencia rota `{{7.url}}`.

Si vuelves a importar el blueprint desde cero, ya no deberías ver el error de "Module Not Found" en el módulo Dropbox — si aun así aparece, revisa que tu cuenta tenga el connector Dropbox en la misma versión que usa `E3_Carbone_Download_Dropbox`.

**Pendiente sin resolver (no bloquea Fase Adjuntos 1):** el filtro de la Ruta "Ya existe" del Router usa una fórmula completa (`contains(...)`) dentro del campo `a` de una condición `text:equal` — no está confirmado que Make evalúe eso correctamente en producción. Probarlo en la primera prueba manual (Escenario 4 de las pruebas de Sergio: subir el mismo adjunto dos veces) y, si falla, ajustar a un operador nativo del editor de filtros de Make.

---

## Errores esperables si algo no calza

- Si `dropbox:uploadFile` o `dropbox:createSharedLink` no aparecen con esos nombres exactos en el import: búscalos en el buscador de módulos de Make dentro de la app "Dropbox" — usualmente se llaman "Upload a File" y "Create a Shared Link" (o "Get a Shared Link" en algunas versiones).
- Si el Router importa sin los filtros configurados: es lo más probable dado que este archivo se armó a mano — configúralos siguiendo la sección 4, en lenguaje simple si `contains()` no aparece en tu editor.
- El secreto HMAC (`X-VP-Signature`) no se valida todavía en este escenario — deuda de seguridad conocida y aceptada para esta fase (D-11).
