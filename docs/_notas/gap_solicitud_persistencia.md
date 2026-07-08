# Gap de persistencia · "Nueva solicitud interna" (Paso 4B Fase 2 → Paso 5)

> Panel: Enterprise Architect + Data Designer + Integrations Engineer + Next.js Engineer.
> Diagnóstico y plan únicamente. Sin cambios de código, sin commits, sin push.

## Fuentes leídas

- `components/console/new-request-sheet.tsx`
- `app/api/solicitudes/route.ts`
- `lib/validators/nueva-solicitud-interna.ts` (schema Zod real, no existe `lib/solicitudes.ts` con el schema — ese archivo contiene el mapeo de lectura GET, no el Zod)
- `lib/solicitudes.ts` (mapeo de lectura TX_Solicitudes → UI)
- `lib/console-data.ts` (catálogos: `M_BANCOS`, `BANCOS`, `TIPOS_DOCUMENTO`)
- `docs/schema-airtable.md` (v1.2)
- `docs/make/SC01_crear_solicitud.blueprint.json` (8 módulos)
- `docs/diseno.md` (tablas de campos Tab Datos, §6 mensajes)

## 2) Inventario de campos del formulario "Nueva solicitud interna"

### Sección A · Origen de la solicitud

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `canal` (Canal de origen) | Select | Sí |
| `cliente` | Select | Sí |
| `tipoInforme` | Select (depende de cliente) | Sí |
| `banco_id` (Banco) | Select (`M_BANCOS`) | Sí |
| `n_operacion_cliente` | Input texto (semántica numérica) | Sí |
| `sucursal_originadora` | Input texto | No |
| `ejecutivo_solicitante` | Input texto | No |

### Sección B · Datos de la propiedad

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `direccion` | Input texto | Sí |
| `region` | Select | Sí |
| `comuna` | Select (depende de región) | Sí |
| `tipoPropiedad` | Select | Sí |
| `valorUf` | Input numérico | No |

### Sección C · Solicitante final

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `nombre` | Input texto | Sí |
| `rut` | Input texto (validado) | Sí |
| `telefono` | Input texto | No |
| `email` | Input email | Sí |

### Sección D · Producto y observaciones

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `producto` | Select (depende de cliente) | Sí |
| `banco` (Banco financista) | Select (`BANCOS`) | Condicional: sí si `producto` ∈ {Crédito Hipotecario, Refinanciamiento Hipotecario} |
| `observaciones` | Textarea | No |

### Sección · Documentos requeridos

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `documentos[]` (checklist: `tipo_id`, `codigo`, `requerido_por_ejecutiva`, `archivo{nombre,tamanio_kb,mime_type,url_local}\|null`) | Array de objetos | Condicional por ítem: si `requerido_por_ejecutiva=true`, `archivo` no puede ser `null` |

### Sección · Adjuntos (opcional)

| Campo (form) | Tipo | Obligatorio |
|---|---|---|
| `adjuntos` (state local de `FileUploadZone`, fuera del schema Zod) | Lista de archivos subidos (mock) | No |

⚠ Hallazgo adicional no listado en el contexto original: el state `adjuntos` de la sección "Adjuntos (opcional)" **no viaja en el `body` del POST** (`onSubmit` sólo envía `values` de react-hook-form, que no incluye ese state). Hoy esos archivos se pierden por completo, ni siquiera llegan al Route Handler.

---

## 3) Tabla GAP

| Campo form | Existe en TX_Solicitudes? | Mapeado en SC01 (módulo 7)? | Acción propuesta | Owner |
|---|---|---|---|---|
| `canal` | No (campo propio) — se concatena en `observaciones_internas` | Indirecto: sólo vía rescate en `observaciones_internas`. `origen_canal` real (`fldPphw1FWfYdZI2Z`) recibe el valor fijo `"ingreso_manual"`, no `canal` | Ver caso (e) | Enterprise Architect + Ingeniero Airtable |
| `cliente` | Sí (Link → `M_Clientes`) | Sí (Search Records módulo 2) | Ninguna | — |
| `tipoInforme` | Sí (Link → `M_TiposInforme`) | Sí (módulo 3) | Ninguna | — |
| `banco_id` (banco originador) | Sí → `.banco`. **Nota de discrepancia**: `schema-airtable.md` lo documenta como *Link → M_Bancos*, pero el blueprint módulo 7 lo trata como texto libre (`"banco": "{{1.banco_id}}"`, sin Search Records) y el comentario en `console-data.ts` confirma que es intencional (texto libre) | Sí, directo | Confirmar con Ingeniero Airtable el tipo real del campo `.banco` y corregir `schema-airtable.md` §2 (marcar potencialmente desactualizado) | Ingeniero Airtable |
| `n_operacion_cliente` | Sí (`fldb1vmKk7y3hi4uY`, Number, H-07) | **Sí** — verificado en el JSON del blueprint: `"fldb1vmKk7y3hi4uY": "{{parseNumber(1.n_operacion_cliente)}}"` en el módulo 7 | Ninguna. **Corrección de contexto**: el enunciado de esta sesión decía "no está mapeado"; el blueprint real ya lo tiene resuelto desde una tanda anterior | — |
| `direccion` | Sí | Sí | Ninguna | — |
| `region` | No es campo propio (uso exclusivo de cascada UI; la región vive en `M_Comunas.region`) | No aplica | Ninguna — comportamiento correcto | — |
| `comuna` | Sí (Link → `M_Comunas`) | Sí (módulo 6) | Ninguna | — |
| `tipoPropiedad` | Sí (Link → `M_TiposPropiedad`) | Sí (módulo 4) | Ninguna | — |
| `valorUf` | Candidato: `monto_estimado_uf` (usado en lectura por `lib/solicitudes.ts`, **no documentado** en `schema-airtable.md` §2) | No mapeado en módulo 7 | Confirmar FIELD_ID/tipo real de `monto_estimado_uf` y agregar mapping `parseNumber(1.valorUf)`. Actualizar `schema-airtable.md` (fila faltante) | Ingeniero Airtable + Integrador Make |
| `sucursal_originadora` | Sí (`fldd56pLZyKYoi2Vi`, espacio final pendiente D-08) | Sí (módulo 7) | Ninguna | — |
| `ejecutivo_solicitante` | Sí (`fldRweQyq3tTQGmPR`) | Sí (módulo 7) | Ninguna | — |
| `nombre` | Sí (`cliente_final_nombre`) | Sí | Ninguna | — |
| `rut` | Sí (`cliente_final_rut`) | Sí | Ninguna | — |
| `telefono` | Campo destino declarado `solicitante_telefono` (Phone number) **sin FIELD_ID verificado vía MCP** en `schema-airtable.md` | El blueprint SÍ lo mapea (`"solicitante_telefono": "{{1.telefono}}"`), pero el reporte de esta sesión indica que no persiste | Ver caso (b) | Ingeniero Airtable |
| `email` | No existe campo propio. `diseno.md` línea 172 referencia `.email_contacto` pero esa fila **no existe** en `schema-airtable.md` §2 | Se rescata en `observaciones_internas` | Ver caso (g) | Ingeniero Airtable + Integrador Make |
| `producto` | Sí (Link → `M_Productos`) | Sí (módulo 5) | Ninguna | — |
| `banco` (Banco financista) | No existe campo propio distinto de `.banco` (ocupado por `banco_id`/originador) | Se rescata en `observaciones_internas` | Ver caso (g) | Ingeniero Airtable + Integrador Make |
| `observaciones` | Sí (`observaciones_internas`) | Sí, pero el campo hoy mezcla `observaciones` real + el rescate de `canal`/`email`/`banco` financista | Simplificar una vez resueltos (e) y (g) | Integrador Make |
| `documentos[]` (checklist) | No existe persistencia (ni campo, ni tabla intermedia) | No mapeado en absoluto | Ver caso (f) | Enterprise Architect + Data Designer |
| `adjuntos` (sección libre) | No existe persistencia | No llega ni al Route Handler (ver hallazgo arriba) | Conectar a `/api/adjuntos/upload` (pendiente de construir, ver `diseno.md`) → `TX_Adjuntos` | Next.js Engineer + Integrador Make |
| *(no es campo de form)* `fecha_solicitud` | Sí, declarado en `schema-airtable.md` §2 como Date **sin FIELD_ID verificado** | **No mapeado** en módulo 7 — confirmado en el JSON, no aparece en `mapper.fields` | Ver caso (a). Riesgo real: `codigo_ext` es una fórmula que depende de `YEAR(fecha_solicitud)` — si queda vacío, el código externo de las solicitudes nuevas puede salir mal formado | Integrador Make |
| *(no es campo de form)* `ejecutiva_asignada` | No existe (⚙ pendiente D-08 + D-02, definido como Link → `AUTH_Usuarios`) | No mapeado | Ver caso (d) | Ingeniero Airtable + Integrador Make + Next.js Engineer |

**Nota transversal**: marcar `docs/schema-airtable.md` §2 (TX_Solicitudes) como potencialmente desactualizado en 3 puntos: (1) tipo real de `.banco` (Link declarado vs texto libre observado en blueprint/código), (2) fila faltante para `monto_estimado_uf`, (3) `solicitante_telefono` y `fecha_solicitud` sin FIELD_ID verificado vía MCP pese a estar documentados como existentes.

---

## 4) Casos especiales

**a) `fecha_solicitud`**
Recomendación: fijarlo en Make (módulo 7), no en el endpoint Next.js ni como default de Airtable (Airtable no tiene "default = now()" para campos Date, sólo para "Created time", que es un tipo de campo distinto y ya se usa como proxy de despliegue en `lib/solicitudes.ts`). Centralizarlo en Make cubre todos los orígenes que pasen por SC01 (no sólo `ingreso_manual`), respeta el principio "la UI muestra y captura; nunca decide", y es urgente porque `codigo_ext` (fórmula) depende de `YEAR(fecha_solicitud)`.

**b) `telefono` del solicitante final**
El nombre de campo destino ya está decidido y es correcto: `solicitante_telefono` (Phone number). No proponer uno nuevo. La acción pendiente es de verificación: el Ingeniero Airtable debe confirmar que el campo existe con ese nombre exacto en la base real y capturar su FIELD_ID en `schema-airtable.md` — la ausencia de ese FIELD_ID verificado es la sospecha más probable de por qué "no persiste" pese a estar mapeado en el blueprint.

**c) `n_operacion_cliente`**
Tipo destino: **Number**, ya resuelto (`fldb1vmKk7y3hi4uY`, H-07) y ya aplicado con `parseNumber()` en el módulo 7 del blueprint. No requiere acción de schema ni de blueprint. Único pendiente menor: confirmar el comportamiento de Make cuando `n_operacion_cliente` no es numérico puro (el Zod actual sólo exige `min(1).max(20)`, no exige dígitos).

**d) `ejecutiva_asignada`**
Confirmar diseño ya documentado (D-02/D-08, `schema-airtable.md` §13/§15): Link → `AUTH_Usuarios` (`tblbX3hPD2uhqhl5v`), no texto libre con Clerk user_id. Pendiente de decisión: cómo resolver el recXXX de `AUTH_Usuarios` a partir de la sesión Clerk — opción recomendada es un Search Records adicional en el blueprint por `email` de la sesión (ya presente en `AUTH_Usuarios.email`), evitando crear una columna nueva de `clerk_user_id` salvo que el Enterprise Architect prefiera esa vía por robustez ante cambios de email.

**e) `canal` de origen**
Hoy el endpoint fuerza `origen_canal="ingreso_manual"` e ignora el valor real elegido en el Select (WhatsApp/Email/Teléfono/Presencial), que termina sólo en `observaciones_internas`. Diseño correcto: `origen_canal` (singleSelect real: `app_cliente · ingreso_manual · api · migracion_inicial`) representa el **canal de ingreso al sistema** (siempre `ingreso_manual` cuando lo tipea la ejecutiva) y debe mantenerse así — no forzar el valor de `canal` dentro de este campo, rompería su semántica y probablemente algo en AT01/AT02 que ya lo consume con esos valores fijos. Se necesita un campo **nuevo y distinto**, p. ej. `canal_contacto_original` (singleSelect con las mismas opciones de `CANALES_ORIGEN` del form), para no perder el dato sin invadir el campo fijo.

**f) Documentos requeridos (checklist con vigencias)**
Recomendación: filas en `TX_Adjuntos`, no un multiselect en `TX_Solicitudes` ni una tabla intermedia nueva. `TX_Adjuntos` ya modela "documento de una solicitud" (`tipo_documento`, `url_dropbox`, `estado_extraccion`) y es el destino natural de cada ítem marcado del checklist una vez subido el archivo real. Si se quiere preservar en el historial la distinción "documento marcado pero sin archivo", evaluar agregar `TX_Adjuntos.requerido_por_ejecutiva` (checkbox); hoy esa regla sólo bloquea el submit en la UI y no tiene por qué persistirse necesariamente.

**g) `banco` financista y `email` del solicitante**
Ambos hoy van al hack de `observaciones_internas`. Propuesta de campos propios en `TX_Solicitudes`:
- `email_contacto` (Email) — ya nombrado así en `diseno.md` línea 172, sólo falta crearlo.
- `banco_financista` (Link → `M_Bancos`) — **distinto** de `.banco`, que ya está ocupado por el banco originador (`banco_id`). No reutilizar `.banco` para ambos conceptos.

---

## 5) Secuencia de tandas propuesta

### Tanda A · Cambios de schema Airtable (owner: Ingeniero Airtable)

1. Crear `TX_Solicitudes.email_contacto` — Email.
2. Crear `TX_Solicitudes.banco_financista` — Link → `M_Bancos` (distinto de `.banco`).
3. Crear `TX_Solicitudes.canal_contacto_original` — Single select, opciones = `CANALES_ORIGEN` del form (WhatsApp/Email/Teléfono/Presencial/Otro — confirmar lista exacta con Data Designer).
4. Verificar existencia y FIELD_ID real de `TX_Solicitudes.fecha_solicitud` (Date). Si no existe, crearlo.
5. Verificar existencia, FIELD_ID y tipo real de `TX_Solicitudes.solicitante_telefono` (Phone number) — confirmar que acepta el formato `"+56 9 ...".`
6. Verificar existencia, FIELD_ID y tipo real de `TX_Solicitudes.monto_estimado_uf` (hoy usado en lectura, no documentado ni mapeado en escritura).
7. Crear `TX_Solicitudes.ejecutiva_asignada` — Link → `AUTH_Usuarios` (`tblbX3hPD2uhqhl5v`), ya definido en D-08/D-02, pendiente de ejecución.
8. ✅ **Ejecutado 08-jul-2026**. Confirmado: `.banco` (`fldAgTlFXeXWfGTdI`) es **Single line text**, no Link — corrige la discrepancia de `schema-airtable.md`. Decisión de panel posterior a este documento: en vez de solo documentar, se migró a Link vía campo paralelo `banco_link` (`fldxlBazQKgQwureX`, Link → M_Bancos); `.banco` queda **deprecated** hasta el corte en una tanda posterior (requiere que Tanda B/C escriban/lean `banco_link`). Ver detalle en `docs/schema-airtable.md` §2 y en `docs/aprendizajes.md` (sesión 08-jul-2026).
9. (Opcional, a decidir con Enterprise Architect) columna auxiliar en `AUTH_Usuarios` para lookup exacto por Clerk (si el email de sesión no es suficientemente confiable).
10. Actualizar `docs/schema-airtable.md` con todos los FIELD_IDs y tipos reales resultantes.

### Tanda B · Actualización del blueprint SC01 (owner: Integrador Make) — depende de Tanda A cerrada

1. Módulo 7: agregar `fecha_solicitud = {{formatDate(now; "YYYY-MM-DD")}}`.
2. Módulo 7: agregar `email_contacto = {{1.email}}`.
3. Nuevo Search Records (módulo 2b, antes del módulo 7) contra `M_Bancos` por `{{1.banco}}` → agregar `banco_financista = [{"id": "{{2b.id}}"}]` en módulo 7 (es Link, requiere resolución de record, a diferencia de `.banco` que hoy es texto libre).
4. Módulo 7: agregar `canal_contacto_original = {{1.canal}}`.
5. Módulo 7: agregar `monto_estimado_uf = {{parseNumber(1.valorUf)}}` (tras confirmar Tanda A punto 6).
6. Nuevo Search Records (módulo adicional) contra `AUTH_Usuarios` por email de sesión → agregar `ejecutiva_asignada = [{"id": "{{X.id}}"}]` en módulo 7 (requiere que el Next.js Engineer agregue el email/user de sesión al payload del webhook, ver Tanda C).
7. Módulo 7: simplificar `observaciones_internas` dejando sólo `{{1.observaciones}}` (retirar el rescate de canal/email/banco financista, ya cubiertos por campos propios).
8. Actualizar `docs/make/SC01_crear_solicitud.blueprint.json` y `docs/make/SC01_import_instrucciones.md` con los nuevos módulos y mappings.

### Tanda C · Cambios de código Next.js (owner: Claude Code) — depende de Tanda A y B cerradas

1. `app/api/solicitudes/route.ts`: agregar al payload el email (o user id) de la sesión Clerk (`auth()`), necesario para que Make resuelva `ejecutiva_asignada`. Revisar si `origen_canal` sigue fijo en `"ingreso_manual"` (correcto, según caso e) o si se ajusta la lógica.
2. `lib/validators/nueva-solicitud-interna.ts`: sin cambios de campos esperados (el schema ya cubre todo lo que falta persistir); revisar sólo si Data Designer pide validación adicional para `canal_contacto_original`.
3. `components/console/new-request-sheet.tsx`: incluir el state `adjuntos` (sección "Adjuntos (opcional)") en el payload, o eliminar esa sección si se decide que el checklist `documentos[]` cubre el mismo caso de uso (definir con Data Designer si son flujos redundantes).
4. `lib/solicitudes.ts`: una vez `fecha_solicitud` esté poblado de forma confiable, evaluar si `mapRecord` debe leer `TX_Solicitudes.fecha_solicitud` en vez de usar `createdTime` de Airtable como proxy (hoy puede divergir del dato de negocio).
5. `docs/schema-airtable.md`: sincronizar con los cambios reales de Tanda A (si quedó pendiente).
6. Cierre: `pnpm build` y `pnpm typecheck` limpios antes de commit.

---

**Este documento es sólo diagnóstico y plan. No se modificó código, no hay commits ni push asociados a esta sesión.**
