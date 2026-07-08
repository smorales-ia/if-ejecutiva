# SC01 — Crear solicitud · Instrucciones de importación en Make

> Para Sergio. No requiere conocimientos técnicos. Sigue los pasos en orden.
> Si algo no calza exactamente con lo que ves en pantalla, no improvises:
> anota dónde te quedaste y avísale a Claude Code antes de seguir.

**Si ya tienes el escenario SC01 de la Fase 0 importado y activo**, ve directo
a la sección **"Actualizar el blueprint importado"** más abajo — no repitas
la importación desde cero.

---

## 1. Importar el blueprint (primera vez)

1. Entra a [Make](https://eu1.make.com) → **Scenarios**.
2. Clic en **Create a new scenario**.
3. En la esquina superior derecha del lienzo vacío, clic en el menú **(⋯)** → **Import Blueprint**.
4. Selecciona el archivo `docs/make/SC01_crear_solicitud.blueprint.json` desde tu computador.
5. Make dibuja **8 cajas conectadas**: **Webhook → 5× Search Records (cliente, tipo de informe, tipo de propiedad, producto, comuna) → Airtable Create Record → Webhook Response**. Eso es correcto — no agregues ni borres módulos.

Si Make muestra un error al importar (puede pasar; el archivo fue armado a mano, no exportado desde Make), no te preocupes — salta a la sección **"Fallback manual"** más abajo y arma el escenario módulo por módulo con esa guía. El resultado final es el mismo.

---

## 2. Reemplazar los placeholders

Después de importar, Make va a pedirte completar algunas cosas:

| # | Dónde | Qué hacer |
|---|---|---|
| 1 | Módulo 1 (Webhook) | Make te pedirá crear un webhook nuevo. Ponle el nombre **"SC01 - Crear solicitud"** y acepta. |
| 2 | Módulo 1 (Webhook) → **Data structure** | Clic en "Add" o en el ícono de estructura de datos. Pega el JSON de la sección **"3. Estructura de datos del webhook"** de este documento. |
| 3 | Módulos 2 a 7 (los 6 módulos de Airtable: 5 Search Records + 1 Create Record) | En **Connection**, clic en "Add" y conecta tu cuenta de Airtable (token o login OAuth) — **usa la misma conexión en los 6**, es la misma cuenta. |
| 4 | Cada módulo Airtable → **Base** / **Table** | Deberían aparecer ya seleccionados. Si aparecen en blanco, selecciónalos de la lista (todos son de la base "VProperty"; cada uno apunta a una tabla distinta — ver tabla de abajo). |

No hay más placeholders que tocar — el resto de los campos ya vienen mapeados.

---

## 3. Estructura de datos del webhook

Pega esto en el módulo 1 cuando Make te pida la "Data structure":

```json
{
  "canal": "text",
  "cliente": "text",
  "tipoInforme": "text",
  "banco_id": "text",
  "sucursal_originadora": "text",
  "ejecutivo_solicitante": "text",
  "n_operacion_cliente": "text",
  "direccion": "text",
  "region": "text",
  "comuna": "text",
  "tipoPropiedad": "text",
  "valorUf": "text",
  "rut": "text",
  "nombre": "text",
  "telefono": "text",
  "email": "text",
  "producto": "text",
  "banco": "text",
  "observaciones": "text",
  "origen_canal": "text",
  "documentos": "array"
}
```

---

## 4. Guardar y activar

1. Clic en **Save** (disquete, esquina inferior izquierda).
2. Activa el interruptor **ON/OFF** del escenario (esquina superior izquierda).
3. Clic en el módulo 1 (Webhook) → copia la URL. Empieza con `https://hook.eu1.make.com/...`.

---

## 5. Guardar la URL

Esa URL es un secreto — no la compartas por chat ni la pegues en ningún documento de este repo.

1. Ábrela en un editor de texto.
2. Guárdala como el valor de `MAKE_WEBHOOK_URL_SC01` en tu `.env.local` y en las variables de entorno de Railway.

Cuando esté guardada, avísame que ya está en `.env.local` y en Railway (sin pegar la URL completa) y seguimos con la Fase 2.

---

## Fix VP-NaN-XXXX (Fase 2 · cierre de pendientes IF-02, 08-jul-2026)

**Si tu escenario SC01 ya está importado y activo** (aunque sea la versión de 8 módulos de la Fase 0/Tanda 4B), aplica este fix — no requiere re-importar ni cambia la URL del webhook.

**Síntoma**: las solicitudes nuevas muestran `codigo_ext` como `VP-NaN-0023` en vez de `VP-2026-00NN`.

**Causa**: el módulo 7 (Airtable → Create a Record) nunca mapea el campo `fecha_solicitud`. Queda vacío, y la fórmula de `codigo_ext` (`'VP-' & YEAR(fecha_solicitud) & '-' & LPAD(solicitud_id,4,'0')`) evalúa `YEAR()` sobre un campo vacío, dando `NaN`.

**Pasos**:

1. Abre el escenario **SC01 - Crear solicitud** en Make (no hace falta apagarlo primero — puedes editar módulos con el escenario `ON`, los cambios solo aplican al guardar).
2. Haz clic en el módulo **7 — Airtable Create a Record** (el que escribe en `TX_Solicitudes`).
3. En la lista de campos del módulo, busca `fecha_solicitud`. Si no aparece en la lista visible, usa el buscador de campos del módulo (ícono de lupa o "Add item"/"Show more fields") — el campo existe en Airtable desde antes (`fldvkn9CsORy4eU0Z`), Make debería poder mapearlo.
4. En ese campo, escribe la fórmula exacta (usa el editor de fórmulas de Make, no la escribas como texto plano):
   ```
   {{formatDate(now; "YYYY-MM-DD")}}
   ```
5. Clic en **Save** (disquete, esquina inferior izquierda). **No hace falta reactivar el escenario ni tocar la URL del webhook** — sigue siendo la misma.
6. **Smoke test**: dispara una solicitud de prueba contra la URL del webhook (puedes usar el mismo payload de ejemplo del módulo 1 — botón "Run once" en Make y pega un JSON de prueba con los campos de la sección 3 de este documento). Verifica en Airtable que la fila nueva tenga:
   - `fecha_solicitud` con la fecha de hoy (no vacío).
   - `codigo_ext` con formato `VP-2026-00NN` (no `VP-NaN-...`).
7. Si el smoke test sale bien, revisa (opcional, no bloqueante) que `semaforo_sla` de esa fila de prueba también calculó un valor razonable — dependía del mismo campo vacío, así que debería normalizarse solo a partir de ahora.

**Qué NO hacer**: no reemplaces esto por un default de Airtable ni por lógica en el Route Handler de Next.js — `fecha_solicitud` debe fijarse en Make para cubrir cualquier origen futuro que use SC01, no solo `ingreso_manual` (ver `docs/_notas/gap_solicitud_persistencia.md`, caso "a").

**Fuera de alcance de este fix**: los demás mapeos pendientes de Tanda B (`email_contacto`, `banco_financista` con Search Records nuevo, `canal_contacto_original`, `monto_estimado_uf`, `ejecutiva_asignada` con Search Records por email de sesión, simplificar `observaciones_internas`) siguen pendientes — se abordan en una tanda de Make aparte, no en este fix puntual.

---

## Actualizar el blueprint importado

Si ya tenías el escenario de 3 módulos de la Fase 0 corriendo y ahora necesitas pasar a los 8 módulos de esta versión (con los 5 Search Records y el rescate de email/banco financista), tienes dos caminos. **Elige uno, no mezcles ambos.**

### Ruta (a) — Re-importar (más simple, pero cambia la URL)

1. En Make, abre el escenario SC01 viejo → menú **(⋯)** → **Delete** (o simplemente desactívalo si prefieres no borrarlo todavía).
2. Repite los pasos **1 a 5** de este documento con el archivo `SC01_crear_solicitud.blueprint.json` actualizado.
3. **⚠️ La URL del webhook nueva es distinta a la anterior.** Make genera una URL nueva cada vez que creas un webhook nuevo desde cero. Tienes que:
   - Copiar la URL nueva (paso 4 de arriba).
   - Reemplazar el valor de `MAKE_WEBHOOK_URL_SC01` en `.env.local` **y** en Railway con la URL nueva.
   - Avisarme cuando esté hecho — si sigue la URL vieja en cualquiera de los dos lugares, el endpoint va a fallar en silencio (apunta a un webhook que ya no existe).

### Ruta (b) — Editar a mano (conserva la URL actual)

No borres nada. Sobre el escenario que ya tienes activo:

1. Entre el módulo 1 (Webhook) y el módulo 2 (que hoy es "Airtable Create Record"), inserta **5 módulos nuevos** de tipo **Airtable → Search Records**, en este orden: cliente, tipo de informe, tipo de propiedad, producto, comuna. Usa el ícono "+" que aparece al pasar el mouse sobre la línea que conecta dos módulos.
2. Configura cada uno con los parámetros de la tabla de la sección siguiente ("Parámetros de cada Search Records").
3. En el módulo "Airtable Create Record" (que ahora queda después de los 5 nuevos), edita el mapper de los 5 campos Link (`cliente`, `tipo_informe`, `tipo_propiedad`, `producto`, `comuna`) para que cada uno apunte al resultado (`id`) del Search Records correspondiente, en vez del texto crudo del webhook — ver sección "Nuevo formato de los campos Link" más abajo.
4. Edita el campo `observaciones_internas` del mismo módulo con la fórmula de rescate de email/banco financista — ver sección "Nuevo formato de observaciones_internas" más abajo.
5. Guarda. **La URL del webhook no cambia** — no hace falta tocar `.env.local` ni Railway.

---

## Parámetros de cada Search Records

Los 5 módulos siguen el mismo patrón. Cambia solo la tabla y el campo del webhook:

| Search Records para | Base | Tabla | Fórmula (campo primario confirmado: `nombre`) |
|---|---|---|---|
| `cliente` | VProperty (`app9G7lLkIV3CpeLa`) | M_Clientes (`tblpK7AcYBMH93apK`) | `UPPER({nombre}) = UPPER("{{1.cliente}}")` |
| `tipo_informe` | VProperty | M_TiposInforme (`tblOcsdiwxQLfD178`) | `UPPER({nombre}) = UPPER("{{1.tipoInforme}}")` |
| `tipo_propiedad` | VProperty | M_TiposPropiedad (`tbl8rxZA14xFIBGU6`) | `UPPER({nombre}) = UPPER("{{1.tipoPropiedad}}")` |
| `producto` | VProperty | M_Productos (`tbll6D4KQ5aDdjjaj`) | `UPPER({nombre}) = UPPER("{{1.producto}}")` |
| `comuna` | VProperty | M_Comunas (`tblyggAfQfq682XHK`) | `UPPER({nombre}) = UPPER("{{1.comuna}}")` |

En cada uno: **Max records = 1**. El `UPPER()` en ambos lados hace que la búsqueda no distinga mayúsculas de minúsculas (por ejemplo, para `tipo_propiedad`, que en Airtable tiene registros duplicados en MAYÚSCULAS y normales).

---

## Nuevo formato de los campos Link

En el módulo **Airtable Create Record**, estos 5 campos ya no reciben el texto del webhook directo — reciben el resultado del Search Records correspondiente, como un registro enlazado:

| Campo Airtable | Antes (Fase 0) | Ahora |
|---|---|---|
| `cliente` | `{{1.cliente}}` | `[{ id: {{2.id}} }]` (resultado del Search Records de cliente) |
| `tipo_informe` | `{{1.tipoInforme}}` | `[{ id: {{3.id}} }]` |
| `tipo_propiedad` | `{{1.tipoPropiedad}}` | `[{ id: {{4.id}} }]` |
| `producto` | `{{1.producto}}` | `[{ id: {{5.id}} }]` |
| `comuna` | `{{1.comuna}}` | `[{ id: {{6.id}} }]` |

Los números (`2`, `3`, `4`...) son la posición de cada módulo en TU escenario — si al editar a mano (ruta b) el orden queda distinto, ajusta el número al módulo correcto. Usa el ícono de mapeo (el pequeño ícono junto al campo) para insertar el `id` del módulo correcto en vez de escribirlo a mano.

`banco` sigue igual que en la Fase 0: recibe `{{1.banco_id}}` como texto directo — **no lleva Search Records**, porque `TX_Solicitudes.banco` es un campo de texto libre, no un Link (confirmado en Fase 1).

---

## Nuevo formato de observaciones_internas (rescate de email y banco financista)

`TX_Solicitudes` no tiene un campo propio para el email del propietario ni para el banco financista (sección "Producto" del formulario, distinto del banco de origen). Para no perder esos datos, el campo `observaciones_internas` ahora concatena hasta 3 prefijos —cada uno solo aparece si el dato viene lleno— antes de las observaciones libres que escribe la ejecutiva:

```
Canal: <valor>. Email: <valor>. Banco financista: <valor>. <observaciones libres>
```

Fórmula exacta a pegar en el campo `observaciones_internas`:

```
{{if(1.canal; "Canal: " + 1.canal + ". "; "")}}{{if(1.email; "Email: " + 1.email + ". "; "")}}{{if(1.banco; "Banco financista: " + 1.banco + ". "; "")}}{{1.observaciones}}
```

Ojo: `1.banco` aquí es el campo **"banco financista"** del formulario (sección Producto), **no** `1.banco_id` (que es el banco de origen y va directo al campo `banco` de Airtable, sin pasar por observaciones).

---

## Fallback manual completo (si el import falla desde cero)

Arma el escenario a mano, módulo por módulo, en este orden:

**Módulo 1 — Webhooks → Custom webhook**
- Nombre: `SC01 - Crear solicitud`
- Data structure: pega el JSON de la sección 3 de este documento.

**Módulos 2 a 6 — Airtable → Search Records** (uno por cada fila de la tabla de "Parámetros de cada Search Records" de arriba, en ese mismo orden: cliente, tipo_informe, tipo_propiedad, producto, comuna)

**Módulo 7 — Airtable → Create a Record**
- Connection: tu cuenta Airtable (misma de los Search Records).
- Base: `VProperty` (`app9G7lLkIV3CpeLa`)
- Table: `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`)
- Mapea cada campo:

| Campo Airtable (TX_Solicitudes) | Viene de | Tipo |
|---|---|---|
| `cliente` | resultado del módulo 2 (Search Records cliente) → `[{ id: {{2.id}} }]` | Link |
| `tipo_informe` | resultado del módulo 3 → `[{ id: {{3.id}} }]` | Link |
| `tipo_propiedad` | resultado del módulo 4 → `[{ id: {{4.id}} }]` | Link |
| `producto` | resultado del módulo 5 → `[{ id: {{5.id}} }]` | Link |
| `comuna` | resultado del módulo 6 → `[{ id: {{6.id}} }]` | Link |
| `fecha_solicitud` | fórmula `{{formatDate(now; "YYYY-MM-DD")}}` (fix VP-NaN-XXXX, no viene del webhook) | fecha |
| `direccion` | webhook `direccion` | texto directo |
| `cliente_final_rut` | webhook `rut` | texto directo |
| `cliente_final_nombre` | webhook `nombre` | texto directo |
| `solicitante_telefono` | webhook `telefono` | texto directo |
| `sucursal_originadora` (usa el ID `fldd56pLZyKYoi2Vi` si el nombre da problemas — tiene un espacio al final en Airtable) | webhook `sucursal_originadora` | texto directo |
| `ejecutivo_solicitante` | webhook `ejecutivo_solicitante` | texto directo |
| `n_operacion_cliente` | webhook `n_operacion_cliente`, envuelto en `parseNumber()` | número |
| `observaciones_internas` | fórmula de rescate — ver sección de arriba | texto combinado |
| `origen_canal` | webhook `origen_canal` (siempre `"ingreso_manual"`) | texto directo |
| `estado` | — valor fijo, escribe literalmente `creada` | fijo |
| `banco` | webhook `banco_id` (banco de origen) | texto directo |

**Módulo 8 — Webhooks → Webhook response**
- Status: `200`
- Body: `{"id": "{{7.id}}"}` (usa el ícono de mapeo para insertar el `id` del módulo 7)
- Content-Type: `application/json`

---

## Advertencias importantes (leer antes de activar)

1. **`cliente`, `tipo_informe` y `producto` pueden no encontrar coincidencia.** Los mocks del formulario ya se alinearon al catálogo real de Airtable (Fase 1.9), pero si en el futuro alguien agrega un valor nuevo al Select del formulario sin agregarlo primero a Airtable (o viceversa), el Search Records correspondiente no encuentra nada y ese campo Link queda **vacío** en la solicitud creada — Airtable no lo rechaza, simplemente no linkea nada. No hay alerta automática de esto; si notas solicitudes con cliente/tipo de informe/producto en blanco, es la primera causa a revisar.
2. **`tipo_propiedad` y `comuna`** tienen menos riesgo — ambos catálogos ya calzan casi exacto contra Airtable real (`tipo_propiedad` con la fórmula `UPPER()` cubre el problema de mayúsculas; `comuna` estaba casi perfecto salvo la corrección ya aplicada a "San Pedro de La Paz").
3. **El email del propietario y el banco financista no tienen campo propio en Airtable.** Van dentro de `observaciones_internas` como texto, junto con el canal y las observaciones libres de la ejecutiva — no son consultables como campos estructurados. Sigue siendo una solución transitoria; la solución de fondo (crear campos propios en `TX_Solicitudes`) queda pendiente para una tanda futura.
4. **`M_Bancos` en Airtable no incluye "Banco Estado" ni "Banco Security".** El Select de banco de origen los sigue ofreciendo (con su nombre formal completo) porque el campo destino es texto libre y los acepta sin error — pero no corresponden a ningún registro real de `M_Bancos`. Pendiente: pedirle al Ingeniero Airtable que los agregue si se quiere que `M_Bancos` sea la fuente de verdad completa.
5. Este JSON fue escrito a mano siguiendo la convención de blueprints de Make, no exportado desde una instancia real. Si el import falla por versión de módulo, usa el fallback manual de este documento.
