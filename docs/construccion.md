# GUÍA DE CONSTRUCCIÓN · CU-002 · IF-02 Consola de la Ejecutiva Comercial

> **Versión**: 1.2 — alineada a Plan v1.2 · Blueprint v2.7 · Capa de Datos v2.6.2 · schema-airtable.md · diseno.md · 06-jul-2026.  
> **Propósito**: referencia operativa que Claude Code lee al inicio de cada sesión para saber qué construir, en qué orden, con qué criterios de aceptación y qué advertencias aplican por paso.  
> **Regla dorada**: una RF por sesión de Claude Code — nunca "construye toda la consola".

---

## §1 Cómo usar este documento

### Prompt estándar de arranque de sesión

Pegar esto literalmente al inicio de cada sesión de Claude Code:

```
Lee docs/diseno.md, docs/construccion.md y docs/schema-airtable.md.
Vamos a implementar el Paso N — [título del paso].
```

Sustituir `N` y el título con el paso del orden de implementación (§2).

### Antes de cada sesión

1. Confirmar que los bloqueadores del paso están cerrados (ver §3–§10).
2. Verificar que `pnpm dev` levanta sin warnings de variable faltante.
3. Si el paso toca Airtable: confirmar que `AIRTABLE_TOKEN` sigue vigente.

### Al terminar cada sesión

1. `pnpm build` debe salir limpio (cero errores TS, cero warnings lint).
2. `pnpm typecheck` limpio.
3. Commit con formato Conventional Commits + scope `cu-002` (ver §12).
4. Push por GitHub Desktop. Railway despliega automáticamente.
5. Validar el happy path en `https://if-ejecutiva-production.up.railway.app`.
6. Si OK → siguiente paso. Si NO → iterar dentro de la misma sesión/RF.

---

## §2 Orden de implementación

| # | Paso | Depende de | Bloqueadores externos |
|---|---|---|---|
| 1 | Layout + Clerk + middleware | Variables Clerk cargadas | — |
| 2 | RF-05 · Lista de solicitudes (lectura) | Paso 1 | `ejecutiva_asignada` creado en Airtable (D-08) |
| 3 | Detalle de solicitud (lectura) | Paso 2 | — |
| 4 | Crear solicitud interna (SC01) | Paso 3 | SC01 activo en Make · MAKE_* en Railway |
| 5 | RF-06 · Acciones sobre solicitud | Paso 4 | AT02 trigger (H-04) · SC05 activo |
| 6 | RF-09 · Extracción Claude API | Paso 3 | RF-09 Make activo · ANTHROPIC_API_KEY |
| 7 | RF-07/RF-08 · Prioridad con justificación + SLA | Paso 5 | AT08 activo en Airtable |
| 8 | QA regresivo + pulido | Todos los anteriores | — |

Los pasos 1–3 pueden avanzar sin las variables `MAKE_*` ni los escenarios Make activos. Son el camino seguro para empezar.

---

## §3 Paso 1 — Layout + Clerk + middleware

### Qué construir

La carcasa protegida de la aplicación. Cualquier acceso a `/consola` sin sesión Clerk válida redirige a `/sign-in`. Con sesión válida muestra el `AppShell` con header VProperty.

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `middleware.ts` | No existe | Crear. Protege `/consola/*`, redirige a `/sign-in`. |
| `app/(ejecutiva)/layout.tsx` | No existe | Crear. `AppShell` + header VProperty. |
| `app/(ejecutiva)/consola/page.tsx` | No existe | Crear. Shell vacío; se rellena en Paso 2. |
| `app/(ejecutiva)/consola/loading.tsx` | No existe | Crear. Skeleton de la consola. |
| `app/(public)/sign-in/[[...sign-in]]/page.tsx` | No existe | Crear. Página Clerk estándar. |
| `app/api/health/route.ts` | No existe | Crear. `GET` devuelve `{ ok: true }`. |

### Bloqueadores

- Variables `AUTH_CLERK_PUBLISHABLE_KEY`, `AUTH_CLERK_SECRET_KEY`, `AUTH_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_APP_URL` cargadas en Railway y en `.env.local`. (RF-52: dominio AUTH_ para vars de autenticación.)

### Criterios de aceptación

- `curl -I https://<host>/consola` sin sesión → `302` hacia `/sign-in`.
- Con sesión activa → header muestra logo VProperty (azul `#075899`) + subtítulo "Consola Ejecutiva" (naranja `#F5A213`).
- `GET /api/health` responde `200 { ok: true }`.
- `pnpm build` limpio.

### Precauciones

- El middleware Clerk NO debe bloquear `/api/health` ni `/api/webhooks/*` (rutas de Make no tienen sesión Clerk).
- Usar `clerkMiddleware` de `@clerk/nextjs/server`, no el wrapper antiguo `authMiddleware`.
- El `AppShell` es CU-000.A. Reutilizar si existe en `@vp/ui`; crear en `components/vp/app-shell.tsx` si no.

---

## §4 Paso 2 — RF-05 · Lista de solicitudes (lectura)

### Qué construir

La bandeja principal de solicitudes: lista con pestañas por vista Airtable, filtros por URL params y badges de estado/SLA/prioridad. El Route Handler lee `TX_Solicitudes` real sin mocks.

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/console/lista-solicitudes.tsx` | Existe (mock) | Reemplazar mock por datos del Route Handler. |
| `components/console/tabs-vistas.tsx` | Existe (mock) | Conectar a vistas Airtable reales. |
| `components/console/filtros-bar.tsx` | Existe (mock) | Persistencia por URL params (D-07). |
| `components/console/prioridad-badge.tsx` | No existe | Crear. Normal `slate` · Urgente `#D97706` · Crítico `#B91C1C`. |
| `app/(ejecutiva)/consola/page.tsx` | Shell vacío | Montar `SolicitudesListPane` + `DetallePanel` (P2). |
| `app/api/solicitudes/route.ts` | Existe (commits 0ca128a/0b92b46) | Verificar; añadir filtrado por `filterByFormula` para cada vista si no está. |
| `lib/airtable-client.ts` | Existe (commits 0ca128a/0b92b46) | Verificar; no duplicar. |

### Bloqueadores

- Campo `ejecutiva_asignada` creado en `TX_Solicitudes` → `AUTH_Usuarios` (`tblbX3hPD2uhqhl5v` · RF-52). Sin él la vista "Mi cartera" no funciona. El Route Handler puede degradar "Mi cartera" a vacío si el campo aún no existe. `AUTH_Usuarios` existe y está poblada (07-jul-2026).
- Campos `disponible` y `casos_en_curso` en `M_Tasadores` (H-05): el selector de tasadores del Paso 4 los usará, pero no bloquean este paso.

### Vistas Airtable requeridas

Las siguientes vistas deben existir en `TX_Solicitudes` (crearlas en Airtable antes de este paso):

| Vista | `filterByFormula` orientativo |
|---|---|
| Activas | `NOT({estado} = "cancelada"), NOT({estado} = "entregada")` |
| SLA en riesgo | `OR({semaforo_sla} = "rojo", {semaforo_sla} = "ambar")` |
| Por reasignar (>48 h) | `{estado} = "creada", DATETIME_DIFF(NOW(), {created_time}, 'hours') > 48` |
| Bloqueadas por cliente | `{estado} = "bloqueada_cliente"` |
| Aprobadas pend. entrega | `{estado} = "aprobada"` |
| Mi cartera | `{ejecutiva_asignada} = "<id_clerk>"` (parámetro dinámico) |

El Route Handler recibe el nombre de la vista como query param `?vista=activas` (o el id_clerk para "Mi cartera") y construye el `filterByFormula` server-side. Nunca en el cliente.

### Criterios de aceptación

- Lista muestra registros reales de `TX_Solicitudes` en < 3 s (vista "Activas").
- `StateBadge` y `SLABadge` usan colores del semáforo operacional (ver §11).
- `PrioridadBadge` diferencia Normal/Urgente/Crítico.
- Filtros (Cliente · Estado · SLA · Fecha) persisten en URL params; back/forward del navegador restaura el filtro (D-07).
- Vista "Mi cartera" filtra por `ejecutiva_asignada` = `userId` del usuario Clerk autenticado.
- `StateBadge` y `SLABadge` son de `@vp/ui` (CU-000.A) — no crear versiones nuevas.
- `pnpm build` limpio.

### Precauciones

- Token Airtable sólo en el Route Handler server-side. Nunca en el componente cliente.
- `lib/airtable-client.ts` ya existe (commit 0ca128a); no reescribir ni duplicar.
- Usar `revalidate: 60` en el Route Handler para vistas no críticas; `revalidate: 0` (sin caché) para "Mi cartera".
- Si `ejecutiva_asignada` aún no existe en el schema (D-08 pendiente), degradar la vista "Mi cartera" a lista vacía con mensaje "Vista no disponible hasta cerrar D-08".

---

## §5 Paso 3 — Detalle de solicitud (lectura)

### Qué construir

El panel derecho del patrón P2 (Lista + Detalle). Muestra el expediente completo de la solicitud seleccionada: datos, historial de eventos, adjuntos. Sin acciones de escritura todavía.

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/console/detalle-panel.tsx` | Existe (mock) | Reemplazar mock; conectar a Route Handler. |
| `components/console/tab-datos.tsx` | Existe (mock) | Conectar a datos reales. |
| `components/console/tab-historial.tsx` | Existe (mock) | Conectar a `A_Eventos` (`tblMKmDg2KrO5fMn8`). |
| `components/console/tab-adjuntos.tsx` | Existe (parcial) | Conectar a `TX_Adjuntos`; ExtraccionStatusBadge se añade en Paso 6. |
| `app/api/solicitudes/[id]/route.ts` | Existe (commits) | Verificar que devuelve todos los campos del §1.3 del plan. |
| `app/api/tasadores/route.ts` | No existe | Crear. GET con `disponible=TRUE` y `casos_en_curso ASC` (ver §11). |
| `app/api/visadores/route.ts` | No existe | Crear. GET todos los visadores `activo=true`. |

### Criterios de aceptación

- Seleccionar una fila en la lista abre el detalle con los 4 grupos del `TabDatos` (Tasación, Solicitante, Producto/Financiero, Asignación — ver `docs/diseno.md` §7).
- `TabHistorial` muestra la cronología de `A_Eventos` con `EventTimeline` de CU-000.A.
- `TabAdjuntos` lista los adjuntos de `TX_Adjuntos` con nombre y enlace Dropbox.
- `DetallePanel` no tiene sticky bottom bar (§4.4 innegociable — portales Select conviven).
- `pnpm build` limpio.

### Precauciones

- **No sticky**: los botones de acción van en la cabecera del `DetallePanel`, no en una barra fija al pie (C-06).
- `EventTimeline` viene de CU-000.A. No reimplementar.
- `app/api/tasadores/route.ts`: si `disponible` no existe aún en M_Tasadores (H-05), hacer fallback a `activo=TRUE` y `capacidad_activa DESC`. El fallback es temporal hasta cerrar H-05.
- El detalle es lectura pura; `BarraAccionesDetalle` se añade en Paso 5.

---

## §6 Paso 4 — Crear solicitud interna (SC01)

### Qué construir

El Sheet "Nueva solicitud" (P3 seccionado) que captura los campos de alta interna y envía a SC01 vía Make. Incluye validaciones bloqueantes, checklist de documentos y upload de adjuntos.

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/console/new-request-sheet.tsx` | Existe (v0) | Conectar a Route Handler real; reemplazar submit mock. |
| `app/api/webhooks/crear-solicitud/route.ts` | No existe | Crear. POST → Make SC01 con firma HMAC-SHA256 (D-03). |
| `app/api/adjuntos/upload/route.ts` | No existe | Crear. POST streaming → Make → Dropbox. |
| `lib/make-client.ts` | No existe | Crear. Firma HMAC-SHA256, POST a Make, log en `LogEscenarios`. |
| `lib/schemas.ts` | Parcial en v0 | Consolidar todos los schemas Zod aquí. |

### Bloqueadores

- **SC01 activo en Make** (BQ-3-a). Sin él el submit del Sheet no llega a Airtable.
- **`MAKE_WEBHOOK_URL_SC01`** y **`MAKE_HMAC_SECRET`** en `.env.local` y Railway.
- **D-08-ejecución** parcial: `notas_tasador`, `notas_visador`, `ejecutiva_asignada` deben existir en `TX_Solicitudes` antes de que el Route Handler los incluya en el payload.
- **`sucursal_originadora`** sin espacio final: hasta que el Ingeniero Airtable corrija el nombre en Airtable, el Route Handler debe usar el FIELD_ID `fldd56pLZyKYoi2Vi` en el payload a Make, no el nombre textual.

### Payload SC01 (modelo mínimo)

El Route Handler firma y envía a `MAKE_WEBHOOK_URL_SC01`:

```json
{
  "cliente":              "<record_id M_Clientes>",
  "tipo_informe":         "<record_id M_TiposInforme>",
  "tipo_propiedad":       "<record_id M_TiposPropiedad>",
  "direccion":            "Av. Apoquindo 5230",
  "comuna":               "<record_id M_Comunas>",
  "region":               "Metropolitana",
  "cliente_final_nombre": "Juan Pérez",
  "cliente_final_rut":    "12.345.678-9",
  "email_contacto":       "juan@ejemplo.cl",
  "n_operacion_cliente":  123456,
  "producto":             "<record_id M_Productos>",
  "banco":                "<record_id M_Bancos | null>",
  "origen_canal":         "ingreso_manual",
  "fldd56pLZyKYoi2Vi":    "Casa Central",
  "ejecutivo_solicitante":"Carla Rojas",
  "ejecutiva_asignada":   "<record_id AUTH_Usuarios tblbX3hPD2uhqhl5v>",
  "prioridad":            "Normal",
  "adjuntos":             ["<dropbox_url_1>", "<dropbox_url_2>"]
}
```

> Usar `fldd56pLZyKYoi2Vi` (FIELD_ID de `sucursal_originadora`) hasta que el rename esté propagado en Airtable.

### Criterios de aceptación

- Submit válido del Sheet → crea fila en `TX_Solicitudes` con `estado=creada` y `origen_canal=ingreso_manual` en < 5 s.
- AT01 se dispara automáticamente y popula `regla_aplicada` en < 10 s.
- Toast de confirmación: **"Solicitud creada con {n} documento(s) adjunto(s)."**
- Submit inválido (RUT malformado, email inválido, dirección incompleta, doc marcado sin archivo) muestra el mensaje bloqueante exacto de §6 del Blueprint (ver `docs/diseno.md` §8).
- El Sheet bloquea "Crear" sólo si `docsFaltantes > 0` — no si hay campos de adjuntos vacíos (Spec v1.4 §1.5.1.1).
- `pnpm build` limpio.

### Precauciones

- El payload **nunca** viaja del cliente al Route Handler con el token Airtable; el Route Handler lo añade server-side.
- La firma HMAC-SHA256 (D-03) se calcula en `lib/make-client.ts` y se envía como `X-VP-Signature`. Make valida en su extremo.
- El upload de adjuntos es streaming: cliente → Route Handler (`/api/adjuntos/upload`) → Make → Dropbox. Nunca directo a Dropbox desde el cliente.
- Loguear **cada** llamada a Make en `LogEscenarios` (`tblR4VWpUHw1CSyIS`): `escenario`, `estado`, `timestamp`, `record_id_result`. Ver patrón en §11.
- `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `DocumentChecklist`, `FileUploadZone` vienen de CU-000.A — no crear versiones nuevas.

---

## §7 Paso 5 — RF-06 · Acciones sobre solicitud

### Qué construir

La `BarraAccionesDetalle` con las cinco acciones disponibles: Pasar a asignada, Reasignar tasador, Cambiar prioridad, Pausar, Cancelar. Sin acción "Reasignar visador" (D-01). Sin email en reasignación/pausa/prioridad (SC13 fuera de alcance).

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/console/acciones-detalle.tsx` | Existe (v0, sin lógica) | Implementar lógica real de cada acción. |
| `components/console/reasignar-tasador-dialog.tsx` | Existe (v0) | Conectar a `/api/tasadores` y al Route Handler de reasignación. |
| `components/console/unmark-doc-dialog.tsx` | Existe (v0) | Verificar; sin cambios si ya funciona. |
| `app/api/webhooks/asignar/route.ts` | No existe | Crear. POST → actualiza campo trigger AT02 en `TX_Solicitudes`. |
| `app/api/webhooks/reasignar/route.ts` | No existe | Crear. POST → actualiza `tasador` + escribe `A_Eventos(tipo=reasignacion_manual)`. Sin SC13. |
| `app/api/webhooks/prioridad/route.ts` | No existe | Crear. POST → actualiza `prioridad` + escribe `A_Eventos`. Sin SC13. |
| `app/api/webhooks/pausar/route.ts` | No existe | Crear. POST → actualiza `estado=pausada` + escribe `A_Eventos`. Sin SC13. |

### Bloqueadores

- **H-04 (P0)**: el nombre exacto del campo trigger (checkbox) que AT02 observa en `TX_Solicitudes` debe estar confirmado y documentado en `docs/schema-airtable.md` **antes de construir este paso**. Sin ese nombre, `POST /api/webhooks/asignar` no puede actualizar el campo correcto.
- **AT02 activo** en Airtable Automations (BQ-4 residual).
- **SC05 activo en Make** (BQ-3-b) — SC05 se dispara desde AT02 al pasar a `asignada`, no desde la UI directamente. La UI sólo actualiza el campo trigger.

### Precondiciones del botón "Pasar a asignada"

La UI deshabilita el botón si falta cualquiera de estas tres condiciones en el detalle de la solicitud:

```
estado === "creada"
AND tasador !== null
AND visador !== null
AND fecha_visita_programada !== null
```

Tooltip en botón deshabilitado (literal §6 Blueprint — no admite variación):

> **"Para pasar a asignada falta: tasador · visador · fecha de visita."**

Sólo listar los faltantes reales, separados por ` · `. Si sólo falta la fecha: *"Para pasar a asignada falta: fecha de visita."*

### Flujo "Pasar a asignada"

```
Usuario presiona botón habilitado
  → UI muestra spinner + texto "Asignando…"
  → POST /api/webhooks/asignar { solicitud_id, trigger_field_name }
      → Route Handler actualiza campo trigger AT02 en TX_Solicitudes vía Airtable API
      → AT02 se dispara: valida precondiciones, fija estado=asignada, escribe A_Eventos
      → SC05 notifica al tasador por email (async, no bloqueante)
  → Respuesta 200 → toast verde: "Solicitud asignada a {nombre_tasador}"
  → Panel se refresca; EventTimeline muestra nuevo evento
  → Error → toast rojo: "No pudimos completar la acción. Intenta nuevamente en unos segundos."
```

### Acciones sin email (SC13 fuera de alcance)

Reasignar tasador, Cambiar prioridad, Pausar y Cancelar:
- Actualizan el campo correspondiente en `TX_Solicitudes` directamente vía Airtable API (sin pasar por Make).
- Escriben fila en `A_Eventos` (`tblMKmDg2KrO5fMn8`) con el `tipo_evento` apropiado.
- **No invocan SC13** — no hay envío de email en este CU.

### Reasignación de tasador — alerta de cobertura

Si el tasador seleccionado no tiene la `comuna` de la solicitud en sus `zonas_cobertura`:

> **"Este tasador no cubre la comuna de la solicitud. Puedes continuar; quedará registrado como override."**

La acción **no está bloqueada** — es una advertencia ámbar no bloqueante. Registra `A_Cambios(motivo=override_manual)`.

### Criterios de aceptación

- Botón "Pasar a asignada" habilitado sólo si las 3 precondiciones son verdaderas.
- Tooltip muestra sólo los faltantes reales.
- Transición `creada → asignada` ocurre en Airtable en < 10 s.
- Toast correcto en cada acción (ver mensajes en `docs/diseno.md` §8).
- Reasignación escribe `A_Eventos`; `TabHistorial` refleja el nuevo evento tras refresco.
- `BarraAccionesDetalle` no es sticky (§4.4).
- `pnpm build` limpio.

### Precauciones

- `BarraAccionesDetalle` va en la cabecera del `DetallePanel`, **no en una barra sticky al pie**.
- `ReasignarTasadorDialog` usa `cmdk` para el buscador de tasadores (ya en `package.json`).
- La lógica de habilitación del botón es presentacional pura; la validación real la hace AT02.
- AT02 respeta asignación previa si existe (D-04) y registra `A_Cambios(motivo=override_manual)`.
- La Ejecutiva **no puede reasignar visador** — ocultar esa acción (D-01).

---

## §8 Paso 6 — RF-09 · Extracción con Claude API

### Qué construir

El pipeline de extracción automática de datos desde adjuntos: al subir un archivo, el Route Handler lo envía a Make vía webhook, Make llama a Claude API y escribe los resultados en Airtable. El `ExtraccionStatusBadge` refleja el estado en tiempo real.

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/vp/extraccion-status-badge.tsx` | No existe | Crear. 4 estados: `idle · extrayendo · listo · error`. Diseñado para reuso en IF-03/IF-04/IF-05. |
| `components/console/tab-adjuntos.tsx` | Existe (parcial) | Añadir `ExtraccionStatusBadge` por adjunto. |
| `app/api/adjuntos/upload/route.ts` | No existe (Paso 4 lo crea) | Extender para encadenar `/api/extraccion/iniciar` tras confirmación de upload. |
| `app/api/extraccion/iniciar/route.ts` | No existe | Crear. POST → Make RF-09 con firma HMAC. |
| `lib/claude-extractor.ts` | No existe | Crear. Server-only. Orquesta la llamada a la API Claude (si se necesita desde el server directamente). En el modelo con Make, este lib maneja sólo el fallback directo. |

### Bloqueadores

- **Escenario Make RF-09 activo** (BQ-3-c) con código propio (no SC07 — SC07 queda para IF-03 post-visita).
- **`MAKE_WEBHOOK_URL_RF09`** y **`ANTHROPIC_API_KEY`** en `.env.local` y Railway.
- Campo **`TX_Adjuntos.estado_extraccion`** (singleSelect: `idle · extrayendo · listo · error`) debe existir en Airtable antes de este paso.

### Flujo de extracción

```
Usuario sube adjunto en NewRequestSheet o TabAdjuntos
  → POST /api/adjuntos/upload → Route Handler → Make → Dropbox
  → Dropbox confirma → Route Handler dispara POST /api/extraccion/iniciar
  → POST /api/extraccion/iniciar → Make RF-09 con firma HMAC
  → Make RF-09 llama Claude API con el adjunto
  → Claude extrae datos → Make escribe en:
      TX_DatosTasacion (datos del inmueble)
      TX_DocumentosLegales (documentos legales encontrados)
      TX_Adjuntos.estado_extraccion = "listo"
  → IF-02 sondea GET /api/solicitudes/[id] hasta que estado_extraccion != "extrayendo"
  → ExtraccionStatusBadge actualiza a "listo" o "error"
```

### Estados del `ExtraccionStatusBadge`

| Estado | Color | Label |
|---|---|---|
| `idle` | Gris neutro | "Sin extracción" |
| `extrayendo` | Azul `#1D4ED8` + spinner | "Extrayendo…" |
| `listo` | Verde `#15803D` | "Datos extraídos" |
| `error` | Rojo `#B91C1C` | "Error en extracción" |

### Criterios de aceptación

- Upload de adjunto → `TX_Adjuntos.estado_extraccion` pasa a `listo` en < 30 s.
- `ExtraccionStatusBadge` refleja el cambio sin recarga manual.
- `TX_DatosTasacion` tiene fila con los datos del adjunto.
- Error de Make/Claude → badge en `error`; toast: **"No pudimos completar la acción. Intenta nuevamente en unos segundos."**
- Loguear cada llamada a RF-09 en `LogEscenarios`.
- `pnpm build` limpio.

### Precauciones

- **No usar el código "SC07"** para el escenario Make — SC07 queda reservado para IF-03 post-visita (H-06).
- `lib/claude-extractor.ts` es **server-only**. Si se crea, nunca importarlo desde componentes cliente.
- Métricas de tokens + tope diario configurable en `.env` para evitar costos inesperados (riesgo §1.8).

---

## §9 Paso 7 — RF-07/RF-08 · Cambio de prioridad con justificación + integración SLA

### Qué construir

El diálogo de justificación obligatoria al cambiar prioridad a Urgente o Crítico. La integración pasiva con AT08 (cron SLA) para actualizar la vista "SLA en riesgo".

### Archivos a crear o modificar

| Archivo | Estado | Acción |
|---|---|---|
| `components/console/cambio-prioridad-dialog.tsx` | No existe | Crear. Exige texto de justificación si prioridad → Urgente o Crítico. |
| `app/api/webhooks/prioridad/route.ts` | Creado en Paso 5 | Extender para incluir el campo `justificacion` en la escritura a `A_Eventos`. |

### Bloqueadores

- **AT08 activo en Airtable** (BQ-4 residual). AT08 actualiza `semaforo_sla` en `TX_Solicitudes` y escribe `TX_Notificaciones`. Sin AT08, la vista "SLA en riesgo" no se actualiza automáticamente.

### Criterios de aceptación

- Cambio a Normal → no pide justificación; actualiza directamente.
- Cambio a Urgente o Crítico → abre diálogo con campo de texto obligatorio.
- Sin texto → botón "Confirmar" deshabilitado.
- Con texto → `POST /api/webhooks/prioridad` con `prioridad` + `justificacion`; escribe `A_Eventos(tipo=cambio_prioridad, detalle=justificacion)`.
- Vista "SLA en riesgo" refleja cambios de semáforo tras corrida de AT08.
- `pnpm build` limpio.

---

## §10 Paso 8 — QA regresivo + pulido

### Qué construir

Suite de tests unitarios para validaciones bloqueantes y mensajes humanos. Verificación visual de todos los mensajes §6. Regresión del pipeline PDF (E1→E2→E3) para confirmar que IF-02 no lo rompe.

### Archivos a crear

| Archivo | Cobertura |
|---|---|
| `tests/unit/validaciones.test.ts` | Mensajes bloqueantes §6 literales · RUT módulo 11 · email · dirección. |
| `tests/unit/precondiciones-asignada.test.ts` | Lógica de habilitación del botón "Pasar a asignada". |
| `tests/unit/hmac.test.ts` | Firma HMAC-SHA256 de `lib/make-client.ts`. |
| `tests/e2e/sc01-payload.json` | Payload de prueba para smoke test SC01. |

### Criterios de aceptación

- `pnpm test` pasa con cobertura > 80 % en los módulos de validación.
- Todos los mensajes de §6 de Blueprint están cubiertos con texto literal.
- `pnpm build` limpio.
- Regresión E1→E2→E3 (pipeline PDF): ejecutar en Make; los 3 escenarios salen verdes.
- Bundle del cliente verificado: ninguna variable sensible (`AIRTABLE_TOKEN`, `MAKE_*`, `ANTHROPIC_API_KEY`) aparece en el bundle del cliente (`pnpm build` + `grep -r "patxMFm" .next/`).

---

## §11 Patrones comunes

### Route Handler Airtable (lectura)

```typescript
// app/api/solicitudes/route.ts
import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!    // app9G7lLkIV3CpeLa
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!

export async function GET(request: NextRequest) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/tblaHTyMHYfmy7Fg6`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return NextResponse.json({ error: 'Airtable error' }, { status: 502 })
  const data = await res.json()
  return NextResponse.json(data)
}
```

> Usar el `airtable-client.ts` ya creado en el repo (commit 0ca128a) en lugar de fetch manual cuando sea posible.

### HMAC-SHA256 para Make (`lib/make-client.ts`)

```typescript
import crypto from 'crypto'

export async function postToMake(
  url: string,
  payload: unknown,
  secret: string,
): Promise<Response> {
  const body = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VP-Signature': sig,
    },
    body,
  })
  await logEscenario(url, res.status)
  return res
}
```

### Log en `LogEscenarios`

Escribir una fila en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) después de **cada** llamada a Make o a Claude API:

```typescript
async function logEscenario(escenario: string, estado: number, record_id?: string) {
  await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE}/tblR4VWpUHw1CSyIS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: { escenario, estado_http: estado, record_id_result: record_id ?? '' },
      }),
    },
  )
}
```

### Base-UI — `render` prop en lugar de `asChild`

Cualquier componente shadcn que use `asChild` debe refactorizarse:

```tsx
// ❌ Radix / asChild — PROHIBIDO
<SheetTrigger asChild>
  <Button>Abrir</Button>
</SheetTrigger>

// ✅ base-ui — render prop
<SheetTrigger render={<Button>Abrir</Button>} />
```

### Token Tailwind CSS v4

Los colores corporativos se declaran en `app/globals.css` bajo `@theme`. En componentes, usar la clase CSS variable arbitraria:

```css
/* app/globals.css */
@theme {
  --color-brand: #075899;
  --color-brand-hover: #0064B4;
  --color-brand-accent: #F5A213;
  --color-sla-verde: #15803D;
  --color-sla-ambar: #D97706;
  --color-sla-rojo:  #B91C1C;
  --color-info:      #1D4ED8;
  --color-admin:     #6B21A8;
}
```

Uso en componente:

```tsx
<span className="bg-(--color-sla-ambar) text-white" />
```

### Selector de tasadores con fallback H-05

`app/api/tasadores/route.ts` debe filtrar y ordenar así:

```typescript
// Si disponible y casos_en_curso existen (post H-05):
filterByFormula: `{disponible} = TRUE`
sort: [{ field: 'casos_en_curso', direction: 'asc' }]

// Fallback si disponible no existe aún (pre H-05):
filterByFormula: `{activo} = TRUE`
sort: [{ field: 'capacidad_activa', direction: 'desc' }]
```

Detectar la ausencia del campo `disponible` consultando el schema de `M_Tasadores` al arrancar, o usar try/catch en la primera llamada.

---

## §12 Anti-patrones (Claude Code NO debe hacer esto)

| Anti-patrón | Regla correcta |
|---|---|
| Crear `tailwind.config.js` | Tokens en `@theme` de `app/globals.css`. |
| Importar de `@radix-ui/*` | Usar `@base-ui/react 1.5`. |
| Usar `asChild` | Usar `render` prop (ver §11). |
| `sticky` en `BarraAccionesDetalle` | Botones inline en cabecera del panel (§4.4). |
| Escribir directo a Airtable desde componente cliente | Siempre a través de Route Handler server-side. |
| Poner `AIRTABLE_TOKEN` en `NEXT_PUBLIC_*` | Nunca. Token sólo en variables server. |
| Usar el código "SC07" para RF-09 | SC07 queda para IF-03. RF-09 usa código propio. |
| Invocar SC13 desde algún Route Handler | SC13 está fuera del alcance de CU-002. |
| Reasignar visador desde la UI | D-01: dato visible, sin acción. |
| Emitir mensajes de error técnicos al usuario | Siempre el mensaje humano canónico §6 Blueprint. |
| Modificar E1/E2/E3 (pipeline PDF activo) | Son de IF-04; no tocarlos desde IF-02. |
| "construye toda la consola en esta sesión" | Una RF por sesión (§1.7.4). |
| Importar `lib/claude-extractor.ts` desde cliente | Server-only; jamás en componente cliente. |
| Introducir mocks nuevos después del Paso 1 | Los mocks de v0 se reemplazan; no agregar nuevos. |

---

## §13 Referencias rápidas por sesión

| Recurso | Dónde |
|---|---|
| Diseño funcional (UI, wireframes, mensajes §6) | `docs/diseno.md` |
| Schema Airtable (TABLE_IDs, FIELD_IDs) | `docs/schema-airtable.md` |
| Plan maestro v1.2 | `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` |
| Divergencias canónicas (H-02, H-03, H-06, H-07) | `docs/NOTAS_DIVERGENCIA_v1_2.md` |
| Checklist de bloqueadores | `docs/CHECKLIST_PRE_EJECUCION.md` |
| Roadmap de pasos previos | `docs/ROADMAP_PRE_EJECUCION.md` |
| Convenciones globales Claude Code | `CLAUDE.md` (bloque CU-002 al final) |
| Snapshot schema JSON crudo | `docs/schema-2026-07-04.json` |

### Formato de commit obligatorio

```
<tipo>(cu-002): <descripción imperativa breve>

Refs: <RF-XX | RN-XX | BQ-X | D-XX>
```

Tipos permitidos: `feat` · `fix` · `refactor` · `docs` · `test` · `chore` · `perf` · `style`.

Ejemplos:
- `feat(cu-002): implementa Layout + Clerk (Paso 1)`
- `feat(cu-002): RF-05 lista solicitudes con datos Airtable reales`
- `fix(cu-002): refactor asChild → render prop en SheetTrigger (§4.4)`
