# Inventario IF-02 — Alineación repo real ↔ Plan v1.9

> **Generado en P0** · 2026-07-22 19:34 (-04) · Fuente: barrido `git ls-files` + `grep` del repo v0.dev.
> **Uso:** referencia obligatoria para P1–P9. Antes de crear cualquier archivo, cada P consulta su sección de Overrides aquí. **Reuse before create.**
> **Regla dura:** este archivo debe existir y estar vigente para ejecutar P1 en adelante (§1 del plan).

---

## 1 · Árbol real (2 niveles)

### `app/`
```
app/
├─ layout.tsx                              # Root layout
├─ page.tsx                                # Landing / redirect
├─ globals.css                             # @theme tokens VProperty
├─ (public)/sign-in/[[...sign-in]]/page.tsx
├─ (ejecutiva)/
│  ├─ layout.tsx                           # AppShell protegido Clerk
│  └─ consola/
│     ├─ page.tsx                          # P2 Lista+Detalle (server) → ConsoleShell
│     └─ loading.tsx
└─ api/
   ├─ health/route.ts                      # GET health
   ├─ adjuntos/upload/route.ts             # POST streaming → Make → Dropbox
   ├─ solicitudes/route.ts                 # GET lista (Airtable directo, filtros por vista)
   ├─ solicitudes/[id]/route.ts            # GET detalle
   ├─ solicitudes/[id]/adjuntos/route.ts   # GET/POST adjuntos de la solicitud
   ├─ solicitudes/[id]/eventos/route.ts    # GET/POST eventos (A_Eventos)
   ├─ tasadores/route.ts                   # GET M_Tasadores
   ├─ visadores/route.ts                   # GET M_Visadores
   └─ webhooks/crear-solicitud/route.ts    # POST → Make SC01 (create)
```

### `components/console/`
```
console/
├─ app-header.tsx                 # Header + botón "Nueva solicitud"
├─ console-shell.tsx             # Master-detail: SolicitudList (2/5) + SolicitudDetail (3/5). Estado selectedId en cliente.
├─ solicitud-list.tsx            # Panel izquierdo: tabs de vista + filas
├─ solicitud-detail.tsx          # Panel derecho: Reglas A y C, tabs Datos/Historial/Adjuntos
├─ new-request-sheet.tsx         # ~2000 líneas: Wizard 3 fases + Formulario COMPLETO en un solo archivo
├─ editar-solicitud-form.tsx     # Form de edición (separado del wizard)
├─ asignar-tasador-dialog.tsx    # Diálogo de asignación (Paso confirmación + Alert override)
├─ reasignar-tasador-dialog.tsx  # ⚠ Diálogo de REASIGNACIÓN — contradice REGLA A
├─ documentos-adjuntos-sheet.tsx # Sheet de documentos (P8) + checklistInicial()
├─ document-checklist.tsx        # Checklist de 15 tipos
├─ file-upload-zone.tsx          # Zona de carga reutilizable
├─ adjuntos-submit-tracker.tsx   # Tracker de progreso de subida
└─ status-badges.tsx             # StateBadge · SLABadge · PriorityChip
```

### `components/ui/` (shadcn v4 sobre @base-ui/react)
```
alert-dialog · alert · avatar · badge · button · checkbox · command · dialog ·
dropdown-menu · input-group · input · label · popover · progress · scroll-area ·
select · separator · sheet · sonner · tabs · textarea · tooltip
```
> **No hay** `calendar`, `date-range-picker`, `form`, `radio-group` como ui/*. (RadioGroup del wizard es implementación propia dentro de `new-request-sheet.tsx`.)

### `lib/`
```
lib/
├─ console-data.ts        # ⭐ TIPOS + MOCKS + catálogos + helpers (1400+ líneas). NO existe lib/types/.
├─ airtable-client.ts     # Cliente REST Airtable (getRecord, AirtableError, isValidRecordId)
├─ make-client.ts         # postToMake() con HMAC + logEscenario
├─ solicitudes.ts         # fetchSolicitudes(vista, userId, filtros) — lectura Airtable
├─ tasadores.ts           # fetch M_Tasadores → Tasador
├─ visadores.ts           # fetch M_Visadores → Visador
├─ adjuntos.ts            # tipo Adjunto + fetch
├─ adjuntos-uploader.ts   # lógica de subida en lote
├─ eventos.ts             # tipo Evento + fetch A_Eventos
├─ tipos-documento.ts     # fetch D_TipoDocumento
├─ utils.ts               # cn()
└─ validators/
   └─ nueva-solicitud-interna.ts   # ⭐ zod schema del formulario (RHF resolver)
```
> **No existe** `lib/types/` — todos los tipos de dominio viven en `lib/console-data.ts`.

---

## 2 · Mapa componente → P

| Componente / archivo | P que lo extiende | Nota |
|---|---|---|
| `lib/console-data.ts` (tipos) | **P1** | Ampliar tipos aquí, NO crear `lib/types/`. |
| `lib/validators/nueva-solicitud-interna.ts` | **P2 / P4** | zod ya existe; extender, no duplicar. |
| `app/api/**` | **P2** | Extender rutas existentes; faltan PATCH, /asignar, contadores, candidatos, catálogos. |
| `components/console/new-request-sheet.tsx` | **P3 + P4** | Wizard (P3) y Formulario (P4) YA conviven aquí. Extender in-place. |
| `components/console/editar-solicitud-form.tsx` | **P4 / P6** | Edición ya separada. |
| `components/console/solicitud-list.tsx` + `console-shell.tsx` | **P5** | Panel lista existe; faltan filtros/búsqueda/orden/paginación/URL-sync. |
| `components/console/solicitud-detail.tsx` | **P6** | Reglas A/C ya implementadas; extender bloques. |
| `components/console/asignar-tasador-dialog.tsx` | **P7** | Diálogo existe; migrar a cmdk + candidatos por cobertura. |
| `components/console/documentos-adjuntos-sheet.tsx` + `document-checklist.tsx` | **P8** | Sheet + checklist ya existen. |
| `components/console/status-badges.tsx` | Transversal | StateBadge/SLABadge/PriorityChip reutilizables. |
| `components/console/file-upload-zone.tsx` | Transversal | Reutilizar en wizard y sheet. |
| `components/console/reasignar-tasador-dialog.tsx` | **⚠ Revisar** | Contradice REGLA A. Ver riesgos. |

---

## 3 · Rutas API existentes

| Método | Path | Propósito | Escribe vía |
|---|---|---|---|
| GET | `/api/health` | Health check | — |
| GET | `/api/solicitudes` | Lista por vista + filtros server-side | Airtable directo (lectura) |
| GET | `/api/solicitudes/[id]` | Detalle | Airtable directo |
| GET/POST | `/api/solicitudes/[id]/adjuntos` | Adjuntos de la solicitud | POST → (Make/streaming) |
| GET/POST | `/api/solicitudes/[id]/eventos` | Timeline A_Eventos | POST → Airtable/Make |
| GET | `/api/tasadores` | M_Tasadores | Airtable directo |
| GET | `/api/visadores` | M_Visadores | Airtable directo |
| POST | `/api/adjuntos/upload` | Streaming → Make → Dropbox | Make |
| POST | `/api/webhooks/crear-solicitud` | Crear solicitud (SC01) | Make (HMAC) |

**Rutas que el plan P2 pide y NO existen todavía:**
- `POST /api/solicitudes` (crear) → hoy es `POST /api/webhooks/crear-solicitud`.
- `PATCH /api/solicitudes/[id]` (editar, REGLA C).
- `POST /api/solicitudes/[id]/asignar` (REGLA A).
- `GET /api/solicitudes/contadores` (contadores de tabs P5).
- `GET /api/tasadores/candidatos?comuna=X` (P7).
- `GET /api/catalogos/{tipos-bien,clientes,tasadores,tipos-documento}`.
- CRUD `unidades` / `contactos` / `vendedor` (hoy van embebidos en el payload de creación).

---

## 4 · Types existentes vs faltantes

**Ya tipados en `lib/console-data.ts`:**
`EstadoSolicitud`, `Prioridad`, `NuevoUsado`, `EstadoCorreo`, `Comprador`, `Vendedor`,
`ContactoVisita`, `Unidad`, `Financiero`, `Solicitud`, `SlaTone`, `EventoHistorial`,
`TipoDocumento`, `Profesional`, `Adjunto`, `DatosSiiUnidad`, `DatosSii`,
`AntecedentesLegales`, `DecisionMotor`, `VersionInforme`.

**Ya tipados en otros lib:** `Tasador` (tasadores.ts), `Visador` (visadores.ts),
`Evento`/`IconoEvento` (eventos.ts), `Adjunto` (adjuntos.ts — ⚠ duplica el de console-data),
`Vista`/`SlaFiltro`/`SolicitudesFiltros`/`FetchResult` (solicitudes.ts).

**Convención de nombres:** el repo usa **camelCase** (`contactosVisita`, `tipoPropiedadNuevoUsado`,
`rolEnTramite`, `slaDias`, `slaTotal`, `estadoCorreo`, `fechaAsignacion`). El plan §2.1 propone
**snake_case** (`contactos_visita`, `tipo_propiedad`, `sla_dias_restantes`). ⚠ **Override crítico P1.**

**Faltantes según plan §2.1:** catálogos cerrados como `as const` arrays con `type` derivado
(hoy son `const` arrays de objetos, no uniones `as const`); `TipoClienteOrigen`, `OrigenDireccion`,
`EstadoConservacion`, `OrigenSuperficie` como tipos formales; `filtros.ts` para P5.

---

## 5 · Componentes reutilizables detectados (ruta real)

| Componente esperado por plan | Existe en repo como | Ruta real |
|---|---|---|
| `StateBadge` | ✅ | `components/console/status-badges.tsx:17` |
| `SLABadge` | ✅ | `components/console/status-badges.tsx:31` |
| `PriorityChip` (plan: badge prioridad) | ✅ | `components/console/status-badges.tsx:50` |
| `FileUploadZone` | ✅ | `components/console/file-upload-zone.tsx:69` |
| `RUTField` | ⚠ No como componente | Validación `validarRut()`/`formatearRut()` en `console-data.ts:1263/1282`; input propio en forms |
| `EmailField` | ⚠ No como componente | Validación inline vía zod en `validators/nueva-solicitud-interna.ts` |
| `AddressField` | ⚠ No como componente | Input directo en `new-request-sheet.tsx` |
| `RegionComunaSelector` | ⚠ No como componente | Cascada vía `COMUNAS_POR_REGION`/`REGIONES`/`regionDeComuna()` en `console-data.ts:1123+` |
| `EventTimeline` | ⚠ Inline | Render de `HISTORIAL`/`EventoHistorial` dentro de `solicitud-detail.tsx` |
| `Stepper` | ✅ | Función local en `new-request-sheet.tsx:386` |

> **Consecuencia:** varios "componentes" del plan (RUTField, EmailField, AddressField,
> RegionComunaSelector) **no existen como componentes reutilizables**; son inputs + validadores
> embebidos. P4 puede extraerlos si conviene, pero **no asumir que ya existen importables**.

---

## 6 · Reglas A, B, C — dónde viven hoy

**REGLA A (Asignar tasador):** `components/console/solicitud-detail.tsx`
- `datosMinimosFaltantes()` (RN-44) → líneas 74–95.
- `puedeAsignar = faltantes.length === 0` → línea 144.
- `tieneTasador` / `estadoPermite` → líneas 137–138.
- Botón "Asignar Tasador" + `disabled={!puedeAsignar}` → líneas 247, 377, 392.
- Diálogo: `asignar-tasador-dialog.tsx` (con Alert override fuera de cobertura, línea 221).
- ⚠ **Existe también `reasignar-tasador-dialog.tsx`** (botón "Reasignar", catálogo `MOTIVOS_REASIGNACION`) — **contradice REGLA A** (que dice: no existe reasignación).

**REGLA B (Validación al crear):** `components/console/new-request-sheet.tsx`
- `ErrorItem` type (línea 165), `setError` de RHF (líneas 794, 927).
- Conflicto `n_operacion_cliente` → `setError` en ese campo (línea 927) + `toast.error` (932).
- Toast general de errores (línea 961).
- ⚠ **Falta verificar** el Alert destructivo persistente al inicio del form (REGLA B pide toast **Y** Alert simultáneos). El toast existe; el Alert destructivo con lista completa hay que confirmarlo/completarlo en P4.

**REGLA C (Modo consulta):** `components/console/solicitud-detail.tsx`
- `soloLectura = estado !== "creada" && tieneTasador` (RN-59) → línea 140.
- `puedeEditar = estado === "creada"` → línea 142.
- Botón "Editar solicitud" con `{puedeEditar && !editando}` → líneas 231–241.
- Edición delega a `editar-solicitud-form.tsx` (no reusa el wizard).
- ⚠ El estado del detalle es **mock en memoria** (`useState<Solicitud>`, comentario "mock en memoria" línea 100). Asignación/edición **no persisten** a Airtable todavía — solo mutan estado local. P6/P7/P9 deben cablear a las rutas reales.

---

## 7 · Overrides al plan (P1 → P9)

### P1 — Types
- **Plan §2.1 propone `lib/types/*.ts`** → **Repo tiene todo en `lib/console-data.ts`** → **P1 amplía `console-data.ts`** (o extrae a `lib/types/` re-exportando desde ahí, decisión de P1). No crear entidades duplicadas.
- **Plan usa snake_case** (`contactos_visita`, `tipo_propiedad`, `sla_dias_restantes`) → **Repo usa camelCase** (`contactosVisita`, `tipoPropiedadNuevoUsado`, `slaDias`/`slaTotal`) → **P1 respeta camelCase del repo**; agregar campos nuevos v1.9 en camelCase. Cambiar la convención rompería list, detail, form y validators a la vez.
- **`Adjunto` está duplicado** (console-data.ts:1293 y adjuntos.ts:7) → P1 unifica en una sola definición.
- Catálogos: el plan pide `as const` arrays + type derivado; el repo tiene `const` arrays de objetos `{value,label}`. P1 agrega los `type` de unión que falten sin romper los arrays de UI.

### P2 — API Routes
- **Plan pide `POST /api/solicitudes`** → **Repo tiene `POST /api/webhooks/crear-solicitud`** → **P2 mantiene el webhook existente** (o agrega alias `/api/solicitudes` que delegue). No duplicar la lógica de creación.
- Crear las rutas faltantes: `PATCH /api/solicitudes/[id]`, `POST /api/solicitudes/[id]/asignar`, `/contadores`, `/tasadores/candidatos`, `/catalogos/*`. Reutilizar `airtable-client.ts` y `make-client.ts` (ya existen; **no** crear `lib/airtable/client.ts` ni `lib/make/webhook.ts` nuevos como pide §3.2 — apuntar a los existentes).
- HMAC ya implementado en `make-client.ts` (`postToMake`). Reutilizar.

### P3 — Wizard
- **Plan propone carpeta `wizard-nueva-solicitud/` con 5 archivos** → **Repo tiene el wizard 3 fases dentro de `new-request-sheet.tsx`** (Stepper línea 386, Fases 1/2/3 líneas 1002/1061/1101) → **P3 extiende ese archivo in-place**; no crear la carpeta nueva.
- `Stepper` ya existe como función local. Reutilizar.

### P4 — Formulario
- **Plan propone carpeta `form-solicitud/` con 9 archivos** → **Repo tiene el formulario completo embebido en `new-request-sheet.tsx`** (Fase 3) + zod en `validators/nueva-solicitud-interna.ts` → **P4 extiende ambos**; no crear `form-solicitud/`. Si conviene dividir, hacerlo dentro del mismo módulo.
- **REGLA B — Alert destructivo persistente:** el toast existe; el `<AlertErrores>` al inicio del form hay que **crear/completar** en P4 (hoy no se detecta un Alert destructivo con la lista completa).
- RUTField/EmailField/AddressField/RegionComunaSelector **no existen como componentes** → si P4 los necesita reutilizables, extraerlos de `new-request-sheet.tsx` + `console-data.ts`.

### P5 — Panel lista + filtros + búsqueda + orden
- **Plan propone carpeta `panel-lista/` con hooks + 7 archivos** → **Repo tiene `solicitud-list.tsx` + `console-shell.tsx`** con tabs básicos (estado `activeTab` local) → **P5 extiende esos archivos**.
- **Vistas divergen:** repo usa `activas | sla_riesgo | reasignar | pausadas | aprobadas | cartera` (`lib/solicitudes.ts:17`). Plan pide `mi_cartera | sla_riesgo | por_asignar | aprobadas | todas`. → **P5 debe reconciliar el enum `Vista`** con negocio; probablemente renombrar `cartera→mi_cartera`, agregar `por_asignar`, decidir suerte de `reasignar`/`pausadas` (ligadas a reasignación, ver riesgos).
- **URL-sync ya existe parcialmente:** `consola/page.tsx` y `api/solicitudes/route.ts` leen `?vista` y filtros como query params (D-07). P5 amplía filtros (cliente, tasador, estado, prioridad, fecha, q, orden, page).
- **Navegación:** el repo NO navega a `/solicitudes/[id]`; usa master-detail con `selectedId` en `console-shell.tsx`. → **P5 mantiene el patrón master-detail**, no introducir navegación por ruta (contradice el plan P5/P6 que asume `Link` a `/solicitudes/[id]`).
- **Dependencias ausentes:** `swr`, `react-day-picker`/`date-fns` (DateRangePicker), `use-debounce`. → P5 decide: instalar (pausa-en-comandos, pedir confirmación) o implementar debounce/fetch a mano y date-range con `Popover`+inputs.
- **shadcn faltantes:** no hay `calendar` ni `date-range-picker` en `components/ui/`. Instalar vía shadcn o construir.

### P6 — Panel detalle
- **Plan espera `app/solicitudes/[id]/page.tsx` + carpeta `detalle-solicitud/`** → **Repo tiene `solicitud-detail.tsx`** renderizado dentro del master-detail (`console-shell.tsx`), **sin ruta `/solicitudes/[id]`** → **P6 extiende `solicitud-detail.tsx` in-place**; no crear la ruta ni la carpeta de bloques nueva salvo decisión explícita.
- Reglas A y C **ya implementadas** (líneas citadas en §6). Extender bloques de la pestaña Datos, no rehacer la barra de acciones.
- ⚠ El detalle usa **estado mock en memoria**. P6 (o P9) debe cablear asignación/edición a las rutas reales (`/asignar`, `PATCH`).
- "Editar solicitud" usa `editar-solicitud-form.tsx` (no el wizard). El plan §7.2.6 dice reusar el wizard Fase 3; **el repo ya resolvió con un form dedicado** → mantener el form dedicado salvo decisión de unificar.

### P7 — Diálogo asignación
- **Plan propone carpeta `dialogo-asignacion/` con cmdk** → **Repo tiene `asignar-tasador-dialog.tsx`** (sin cmdk; usa lista ordenada propia, `ordenados` línea 80) → **P7 extiende ese archivo**; migrar a `Command`/cmdk (ya en deps) y a `GET /api/tasadores/candidatos`.
- Alert override fuera de cobertura ya existe (línea 221). Reutilizar.

### P8 — Sheet documentos
- **Plan propone carpeta `sheet-documentos/`** → **Repo tiene `documentos-adjuntos-sheet.tsx` + `document-checklist.tsx`** (checklist 15 tipos, `checklistInicial()`) → **P8 extiende esos archivos**; no crear carpeta nueva.
- `FileUploadZone` y `POST /api/adjuntos/upload` ya existen. Reutilizar.

### P9 — Deploy
- `app/api/health/route.ts` ya existe (plan §10.2.3 lo pide crear) → **P9 solo lo verifica/extiende** (validar conectividad Airtable).
- Barrido de mocks: **grande** — `lib/console-data.ts` contiene `SOLICITUDES`, `HISTORIAL`, `TASADORES`, `VISADORES`, `ADJUNTOS` mock, y `solicitud-detail.tsx` muta estado en memoria. P9 debe reemplazar por lecturas/escrituras reales.

---

## 8 · Checklist de riesgos

**Archivos que el plan propone crear y YA existen con otro nombre/estructura:**
- `wizard-nueva-solicitud/` → ya en `new-request-sheet.tsx`.
- `form-solicitud/` → ya en `new-request-sheet.tsx` + `validators/nueva-solicitud-interna.ts`.
- `panel-lista/` → ya en `solicitud-list.tsx` + `console-shell.tsx`.
- `detalle-solicitud/` + `app/solicitudes/[id]/page.tsx` → ya en `solicitud-detail.tsx` (master-detail, sin ruta).
- `dialogo-asignacion/` → ya en `asignar-tasador-dialog.tsx`.
- `sheet-documentos/` → ya en `documentos-adjuntos-sheet.tsx`.
- `lib/types/` → todo en `lib/console-data.ts`.
- `lib/airtable/client.ts` + `lib/make/webhook.ts` → ya en `lib/airtable-client.ts` + `lib/make-client.ts`.

**⚠ Conflicto REGLA A ↔ repo:** existe `reasignar-tasador-dialog.tsx`, `MOTIVOS_REASIGNACION`
(console-data.ts:976) y la vista `reasignar` en el enum `Vista`. La REGLA A del plan dice
**"No existe Reasignar Tasador"**. → **Decisión pendiente para Sergio:** ¿se elimina la
reasignación (alinear con Regla A) o el plan cede? No tocar en P0; marcar para P5/P6/P7.

**Dependencias mencionadas por el plan que faltan en `package.json`:**
- `swr` (P5/P6 fetch), `react-day-picker` + `date-fns` (DateRangePicker P5), `use-debounce` (P5).
- shadcn `calendar` / `date-range-picker` / `radio-group` no instalados como `components/ui/*`.
- ✅ Presentes: `cmdk`, `react-hook-form`, `zod` (v4), `sonner`, `lucide-react`, `@base-ui/react`, Next 16.2.6, React 19.2.4.

**Rutas API que faltan y hay que crear en P2:**
`PATCH /api/solicitudes/[id]`, `POST /api/solicitudes/[id]/asignar`,
`GET /api/solicitudes/contadores`, `GET /api/tasadores/candidatos`,
`GET /api/catalogos/*`, CRUD `unidades`/`contactos`/`vendedor`.

**Deuda estructural:**
- El detalle persiste en memoria (mock), no en Airtable → cablear en P6/P7/P9.
- `Adjunto` duplicado en dos módulos → unificar en P1.
- Enum `Vista` del repo ≠ vistas del plan → reconciliar en P5.
