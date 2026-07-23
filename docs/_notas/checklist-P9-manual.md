# Checklist P9 — Acciones manuales (Sergio · mañana)

> Todo lo de código de P9 ya está hecho y verde (build + tsc). Este documento
> cubre las 4 acciones externas que Claude Code no puede ejecutar: provisionar
> Make, cargar env vars en Railway, push, y smoke test end-to-end.
> Artefactos listos para importar/pegar en `docs/_artefactos/`.

---

## §1 · Estado al cierre de P9 (código)

| Ítem | Estado |
|---|---|
| `pnpm build` | ✅ exit 0 |
| `pnpm tsc --noEmit` | ✅ limpio |
| `pnpm lint` | ⚠️ eslint no instalado (gap preexistente v0) → **tanda separada** |
| Health check `/api/health` | ✅ valida conectividad Airtable (200 `{status:'ok'}` / 503 degradado) |
| `.env.example` | ✅ completo (7 vars del código + Clerk + Anthropic) |
| Mocks restantes | ⏳ dependen de Make + schema real → §6 |

**Artefactos generados** (`docs/_artefactos/`):
- `make/SC01-ValidacionSolicitud.blueprint.json` — completo (copia verificada del SC01 real)
- `make/SC-Asignar.blueprint.json` — esqueleto válido (correo = TODO manual)
- `make/SC-Edicion.blueprint.json` — esqueleto válido (campos dinámicos = TODO)
- `airtable/AT01-ResolverMotorReglas.js` — diferido a CU siguiente (no aplica)

---

## §2 · Make · configuración por escenario (eu1.make.com · org 1594725)

**Regla general antes de importar cualquier blueprint:**
1. Reemplazar `__REEMPLAZAR_CONEXION_AIRTABLE__` por la conexión Airtable real (VProperty).
2. Reemplazar `__REEMPLAZAR_CONEXION_DROPBOX__` si aplica.
3. Tras importar, **verificar campo por campo** el mapper de cada módulo de escritura (los blueprints son generados a mano, no exportados; ver E-030/E-033).
4. Copiar la URL del webhook resultante a la env var correspondiente (§3).
5. HMAC `X-VP-Signature`: hoy Make **no** lo verifica (deuda D-11) — el webhook simplemente recibe. No es bloqueante.

### SC01 — Alta interna (crear solicitud)
- **Archivo:** `docs/_artefactos/make/SC01-ValidacionSolicitud.blueprint.json`
  (idéntico al ya existente `docs/make/SC01_crear_solicitud.blueprint.json`).
- **Trigger:** webhook `gateway:CustomWebHook`.
- **Módulos:** Webhook → 5× `airtable:ActionSearchRecords` (cliente, tipo_informe, tipo_propiedad, producto, comuna, patrón `UPPER({nombre})=UPPER("{{1.campo}}")`) → `airtable:ActionCreateRecord` en `TX_Solicitudes` (estado=`creada`, links por recXXX) → `gateway:WebhookRespond` `{id, codigo_ext}`.
- **Devuelve:** `{ "id": recXXX, "codigo_ext": "VP-AAAA-NNNN" }` (el front lo necesita para adjuntos, D-12).
- **Env:** `MAKE_WEBHOOK_URL_SC01`.
- **Si ya está activo:** no re-importar; verificar que el módulo 7 mapee `fecha_solicitud` (fix VP-NaN) y el módulo 8 devuelva `codigo_ext`.

### SC-Asignar — Asignación de tasador
- **Archivo:** `docs/_artefactos/make/SC-Asignar.blueprint.json`
- **Trigger:** webhook.
- **Payload recibido:** `{ solicitudId, tasadorId, motivo?, ejecutivaClerkId }`.
- **Módulos (importables):** Webhook → `airtable:ActionUpdateRecords` en `TX_Solicitudes` (`tasador`=[{id}], `estado`=`asignada`) → 2× `airtable:ActionCreateRecord` en `A_Eventos` (`asignacion_manual`, `correo_asignacion_enviado`) → `ActionCreateRecord` en `LogEscenarios` → `WebhookRespond` `{ok:true}`.
- **Env:** `MAKE_WEBHOOK_URL_SC_ASIGNAR`.
- **TODOs antes de activar:**
  - `fecha_asignacion` en `TX_Solicitudes`: **verificar que exista** (pendiente D-08) antes de mapearla.
  - `tasadorId` debe ser el **recXXX real de M_Tasadores**. Hoy el picker usa mock (H-05) → ver §6.
  - Campo Link a solicitud en `A_Eventos`: confirmar nombre (`solicitud` asumido).
  - Nombres reales de `LogEscenarios` (E-033).

#### Sub-bloque · Envío de correo al tasador (SC13) — AGREGAR MANUALMENTE
> No incluido en el blueprint a propósito: **ninguna** blueprint de la instancia usa un módulo de email, así que no se generó (habría fallado el import con "Module Not Found"). Se agrega a mano en Make, entre el Update (módulo 2) y el Create A_Eventos `correo_asignacion_enviado` (módulo 4):
1. **Conexión / módulo:** elegir el conector de correo disponible en la instancia (Gmail / Email SMTP / etc.). Confirmar cuál existe **inspeccionando** si hay algún escenario que ya mande correo (E-026: no asumir el nombre del módulo).
2. **Destinatario:** email del tasador. Agregar un `airtable:ActionSearchRecords`/`GetRecord` sobre `M_Tasadores` (`tblEi5jp18c1j00bQ`) por `RECORD_ID()` = `{{1.tasadorId}}`, leer el campo email.
3. **Asunto + cuerpo:** plantilla `email_asignacion_tasador` (Especificación v1.9 §1.6.3). Incluir `codigo_ext`, dirección, comuna, fecha de visita.
4. **Adjuntos (opcional):** `dropbox:getFile` v5 (módulo verificado, existe) apuntando a `/VProperty/Tasaciones/{{codigo_ext}}`.
5. **Orden:** tras enviar el correo, **mover** el Create A_Eventos `correo_asignacion_enviado` para que quede **después** del módulo de correo (hoy es optimista).
6. **Verificación:** el evento `correo_asignacion_enviado` en `A_Eventos` sólo debe crearse si el correo salió (rama de éxito del módulo de email).

### SC-Edicion — Edición de solicitud
- **Archivo:** `docs/_artefactos/make/SC-Edicion.blueprint.json`
- **Trigger:** webhook.
- **Payload:** `{ solicitudId, ejecutivaClerkId, cambios }`.
- **Módulos:** Webhook → `ActionUpdateRecords` en `TX_Solicitudes` → `ActionCreateRecord` `A_Eventos` (`datos_modificados`) → Log → Respond.
- **Env:** `MAKE_WEBHOOK_URL_SC_EDICION`.
- **TODO crítico:** Make no puede volcar el objeto `{{1.cambios}}` completo. **Mapear explícitamente cada campo editable** en el módulo 2 (hoy sólo `direccion` y `observaciones_internas` de ejemplo). Los campos Link editables requieren su Search Records propio (patrón SC01).

---

## §2bis · Airtable Automations (scripts .js)

| Script | Estado | Acción |
|---|---|---|
| `airtable/AT01-ResolverMotorReglas.js` | **Diferido a CU siguiente** | No pegar. El motor AT01–AT10 no aplica a IF-02 (§0.4: cero AT02; la UI no decide). |
| (AT trigger para SC01/SC-Asignar/SC-Edicion) | **No necesario** | Los 3 escenarios se disparan por **webhook desde Next.js**, no por Automation. No hay AT trigger que pegar. |

> Referencia de estructura si en el futuro se necesita un AT: `docs/make/AT-RF09-Trigger_script.js` y `docs/make/AT03-Ext_script.js` (cabecera con tabla / trigger type / condiciones / Input variables / outputs).

---

## §3 · Env vars en Railway (Dashboard → Variables)

**Mínimo para ARRANCAR (health check en verde):**

| Variable | De dónde sacar el valor |
|---|---|
| `AIRTABLE_TOKEN` | PAT de Airtable (el mismo de `.env.local`) · scopes data.records:read/write + schema.bases:read |
| `AIRTABLE_BASE_ID` | `app9G7lLkIV3CpeLa` (fijo) |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` (fijo) |

**Activan features (la app arranca sin ellas; degradan con `pendiente_make`):**

| Variable | De dónde |
|---|---|
| `MAKE_WEBHOOK_URL_SC01` | URL del webhook del escenario SC01 (ya existente) |
| `MAKE_WEBHOOK_URL_SC_ASIGNAR` | URL del webhook de SC-Asignar (crear hoy) |
| `MAKE_WEBHOOK_URL_SC_EDICION` | URL del webhook de SC-Edicion (crear hoy) |
| `MAKE_WEBHOOK_URL_ADJUNTOS` | URL de SC-Adjuntos-Upload (ya existente) |
| `MAKE_HMAC_SECRET` | Secreto HMAC compartido (el mismo que ya usas) |
| `MAKE_WEBHOOK_URL_RF09` | Sólo si se activa RF-09 (fuera de core CU-002) |
| `ANTHROPIC_API_KEY` | Sólo RF-09 (extracción) |

> `NEXT_PUBLIC_APP_URL` = URL pública de Railway.

---

## §4 · Push y verificación en Railway

1. Commit + push a `main` (GitHub Desktop). Railway redespliega automáticamente.
2. Esperar el build en Railway (mismo `pnpm build` que ya pasa local).
3. **Health check:** `GET https://<railway>/api/health`
   - Esperado con env OK: `200 { "status": "ok", "airtable": "ok" }`
   - Si `503 { "status": "degraded", "airtable": "sin_configurar" }` → faltan `AIRTABLE_TOKEN`/`AIRTABLE_BASE_ID`.
   - Si `503 { "airtable": "airtable_401" }` → token inválido.
4. Abrir `/consola` autenticado con Clerk → debe cargar el panel lista.

---

## §5 · Smoke test end-to-end (en Railway, datos reales)

Datos de prueba sugeridos: cliente `Banco Santander`, comuna `Providencia`, N° operación nuevo (no `12345/99999/00000`), RUT comprador válido con DV.

1. **Panel lista:** cambiar entre vistas (Mi cartera / SLA en riesgo / Por asignar / Aprobadas / Todas) → contadores y lista coherentes. Buscar por `VP-` y por RUT → filtra. Aplicar filtro Cliente+Prioridad → se refleja en la URL. Recargar con la URL → estado restaurado.
2. **Crear solicitud manual:** wizard → modo manual → tipo Usado → completar formulario → Crear. Verificar: aparece en Airtable `TX_Solicitudes(estado=creada)` y en la lista; toast "Solicitud interna creada".
   - Probar REGLA B: enviar con campos vacíos → toast "N campos con problema" **Y** Alert destructivo con nombres precisos.
   - Probar conflicto: N° operación duplicado → error en ese campo.
3. **Editar (estado creada):** abrir el detalle → "Editar solicitud" → cambiar dirección/observaciones → guardar. Verificar cambios reflejados y evento `datos_modificados` en `A_Eventos` (una vez SC-Edicion activo y campos mapeados).
4. **Asignar tasador:** botón "Asignar Tasador" (habilitado sólo si RN-44 completo) → elegir tasador → confirmar (las **4** consecuencias visibles) → verificar:
   - `TX_Solicitudes.estado` = `asignada`, `tasador` poblado (y `fecha_asignacion` si el campo existe).
   - El botón "Asignar Tasador" **desaparece**; "Editar solicitud" **desaparece**; datos en **modo consulta**.
   - Toast verde "Solicitud asignada a {nombre}".
   - Eventos en `A_Eventos`: `asignacion_manual` **y** `correo_asignacion_enviado`.
5. **Post-asignación:** intentar editar → el botón ya no está; documentos en modo consulta (solo Ver/Descargar).

#### Sub-verificación · Correo al tasador (SC13)
- Usar un **tasador de prueba con email real accesible** (bandeja controlada).
- Tras asignar, confirmar en esa bandeja: **asunto** y **cuerpo** según plantilla `email_asignacion_tasador` (§1.6.3), con `codigo_ext`, dirección, comuna, fecha de visita; **adjuntos** desde Dropbox si se configuró `dropbox:getFile`.
- Confirmar el registro `correo_asignacion_enviado` en `A_Eventos` **sólo** tras el envío real (no optimista).
- Si el correo no llega: revisar el History del escenario SC-Asignar en Make (módulo de correo), no el código Next.js (E-036: un 500 del webhook suele ser un módulo posterior fallando).

---

## §6 · Deuda diferida (código que depende de las acciones externas)

Una vez Make provisionado + env vars cargadas, aplicar en una tanda de código:

1. **`router.refresh()` tras asignar/editar** (`solicitud-detail.tsx`): reemplazar el estado optimista por `router.refresh()` cuando Make persista de verdad (hoy se difiere para no borrar el optimista — E-065).
2. **Swap picker mock → real** (`asignar-tasador-dialog.tsx`): usar `/api/tasadores/candidatos` cuando `M_Tasadores` tenga `zonas_cobertura`/`casos_en_curso` (H-05). Sin eso, `tasadorId` no es recXXX real y SC-Asignar no linkea el tasador.
3. **`EXTRACCION_MOCK`** (`new-request-sheet.tsx`): reemplazar por RF-09 real (Make) cuando se active.
4. **`OPERACIONES_REGISTRADAS`** (`new-request-sheet.tsx`): reemplazar el Set mock por una verificación de unicidad de `n_operacion_cliente` contra Airtable (o dejar que SC01 la haga y devuelva 409).
5. **Bloques mock del detalle** (`mockDatosSii`/`mockAntecedentesLegales`/`mockDecisionMotor`/`mockVersionesInforme`/`HISTORIAL`): reemplazar por datos reales cuando exista el schema v1.9 (unidades/contactos/SII…).
6. **Landing `/`** (`app/page.tsx`): redirect a `/consola` (hoy es demo mock con `SOLICITUDES`).
7. **`reasignar-tasador-dialog.tsx`**: dead code (REGLA A prohíbe reasignación) → eliminar en limpieza.
8. **eslint:** instalar `eslint` + `eslint-config-next`, crear config, limpiar el código v0 (tanda separada).
9. **`fecha_asignacion`** en `TX_Solicitudes`: crear el campo (D-08) para que SC-Asignar lo pueble.

---

*Generado en P9 · 2026-07-22 · contrato 🔴 pausa-total.*
