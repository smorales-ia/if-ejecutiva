# PLAN DE IMPLEMENTACIÓN · CU-002 · IF-02 Consola de la Ejecutiva Comercial

> **Versión**: 1.1 (auditoría de schema Airtable vía MCP incorporada · 04-jul-2026).  
> **Fase**: Diseño — no se genera código de producción.  
> **Objetivo**: obtener aprobación explícita del propietario antes de abrir la fase de construcción.  
> **Alineado a**: Especificación v1.4 · Arquitectura Enterprise v2.6 · Capa de Datos v2.6.2 · Blueprint Interfaces v2.7 · Motor de Cálculo AT01–AT10 v2.5 · Credenciales API v3.  
> **Fuente visual**: `Imagenes_IF_Ejecutiva.pdf`.  
> **Fuente de estructura de componentes**: deploy v0.dev (`if-ejecutiva-gfvE6z3qTyX`).  
> **Equipo firmante**: Arquitecto Enterprise · UX/UI · Ingeniero Next.js · Ingeniero Airtable · Integrador Make · QA Lead · Redactor Técnico.

---

## 1.1 Resumen ejecutivo

CU-002 materializa IF-02 (Tipo A · Next.js 16 + Clerk · Railway) sobre el prototipo v0 ya generado, reemplazando mocks por Route Handlers de lectura contra Airtable y un webhook Make para la única escritura de negocio ("Pasar a asignada"). El motor de estados sigue viviendo en Airtable (AT01/AT02); la UI sólo captura y muestra. Restricciones §4.4 del Blueprint son innegociables (base-ui, no Radix; `@theme` en `globals.css` sin `tailwind.config.js`; sin sticky-bar en presencia de portales Select).

La auditoría en vivo del schema Airtable —realizada vía conexión MCP a la base `app9G7lLkIV3CpeLa` con fecha 04-jul-2026— cierra los bloqueadores estructurales **BQ-1** (M_Visadores) y **BQ-2** (tablas de auditoría), reduce **BQ-4** a verificación de estado activo de scripts (no auditable vía MCP), deja intacto **BQ-3** (escenarios Make no verificables vía MCP), y descubre un conjunto de discrepancias de nomenclatura entre spec y schema real que motivan la nueva decisión **D-08**. Los bloqueadores restantes (SC01/SC05/SC13 en Make, estado activo de AT01/AT02/AT08, credenciales Clerk/Railway) deben cerrarse en el checklist antes de escribir código productivo.

---

## 1.2 Inventario de componentes

Origen v0 se refiere al deploy `if-ejecutiva-gfvE6z3qTyX`. "Reutiliza CU-000" indica si el componente ya está calibrado en el sistema de diseño VProperty compartido.

| Componente | Origen v0 | Destino repo | Reutiliza CU-000 | Justificación |
|---|---|---|---|---|
| `AppShell` + header VProperty | `app/layout.tsx` | `app/(ejecutiva)/layout.tsx` | Sí (header) | Header institucional (logo azul #075899 · subtítulo naranja #F5A213) es CU-000. |
| `SolicitudesListPane` (P1) | `components/dashboard/*` | `components/console/lista-solicitudes.tsx` | No | Grid con filas VP-AAAA-NNNN, StateBadge, SLABadge, prioridad, tasador. Específico de IF-02. |
| `TabsVistas` (Activas · SLA en riesgo · Por reasignar · Bloqueadas · Aprobadas pend. entrega) | `components/dashboard/mock-data.ts` (vistas mock) | `components/console/tabs-vistas.tsx` | No | RF-05. Contadores desde Airtable views. |
| `FiltrosBar` (Cliente · Estado · SLA · Fecha) | v0 | `components/console/filtros-bar.tsx` | Parcial (Select base) | Filtros específicos IF-02. |
| `StateBadge` (11 estados) | v0 | `components/vp/state-badge.tsx` | **Sí** | Ya congelado en CU-000.A. |
| `SLABadge` (verde/ámbar/rojo #15803D · #D97706 · #B91C1C) | v0 | `components/vp/sla-badge.tsx` | **Sí** | Ya congelado en CU-000.A. |
| `PrioridadBadge` (Normal/Urgente/Crítico) | v0 | `components/console/prioridad-badge.tsx` | No | Nuevo, específico IF-02. |
| `DetallePanel` (cabecera + acciones + tabs Datos/Historial/Adjuntos) | v0 | `components/console/detalle-panel.tsx` | No | Cascarón P2 específico. |
| `TabDatos` (cliente · propiedad · contactos · plazo · decisión motor · tasador · visador) | v0 | `components/console/tab-datos.tsx` | No | Consolida read del expediente. |
| `TabHistorial` (`EventTimeline` de A_Eventos + A_Cambios) | v0 | `components/console/tab-historial.tsx` | Parcial (`EventTimeline`) | `EventTimeline` viene de CU-000.A. |
| `TabAdjuntos` (visor PDF/miniatura + `FileUploadZone`) | v0 | `components/console/tab-adjuntos.tsx` | **Sí** (`FileUploadZone`) | 4 estados idle/subiendo/éxito/error ya calibrados. |
| `NewRequestSheet` (Sheet P3 seccionado: Origen · Propiedad · Solicitante · Producto · Documentos · Adjuntos) | `components/console/new-request-sheet.tsx` | igual | Parcial | Reutiliza `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `DocumentChecklist`, `FileUploadZone` de CU-000.A. |
| `RUTField` (validación módulo 11 RN-15) | v0 (CU-000.A) | `components/vp/rut-field.tsx` | **Sí** | Compartido. |
| `EmailField` | v0 (CU-000.A) | `components/vp/email-field.tsx` | **Sí** | Compartido. |
| `AddressField` (Google Places) | v0 (CU-000.A) | `components/vp/address-field.tsx` | **Sí** | Compartido. |
| `RegionComunaSelector` (cascada) | v0 (CU-000.A) | `components/vp/region-comuna-selector.tsx` | **Sí** | Compartido. |
| `DocumentChecklist` (TIPOS_DOCUMENTO) | v0 | `components/vp/document-checklist.tsx` | No (nuevo en IF-02) | RF v1.4 §1.5.1.1: solicitud sin adjuntos permitida; sólo bloquea si un documento marcado no tiene archivo. |
| `FileUploadZone` (Dropbox directo) | v0 (CU-000.A) | `components/vp/file-upload-zone.tsx` | **Sí** | 4 estados; sube por streaming vía Route Handler, no pasa por Airtable. |
| `ReasignarTasadorDialog` (cmdk + ficha carga + alerta "fuera de cobertura") | v0 | `components/console/reasignar-tasador-dialog.tsx` | No | Específico IF-02 · RF-06. |
| `BarraAccionesDetalle` (Pasar a asignada · Reasignar tasador · Cambiar prioridad · Pausar · Cancelar) | v0 | `components/console/acciones-detalle.tsx` | No | Inline, no sticky (§4.4 con portales Select conviven). |
| `AlertDialogUnmarkDoc` | v0 | `components/console/unmark-doc-dialog.tsx` | Parcial | AlertDialog base-ui es CU-000; contenido específico. |
| `EventTimeline` (renderiza A_Eventos) | v0 (CU-000.A) | `components/vp/event-timeline.tsx` | **Sí** | Compartido. |
| Route Handlers (server-side) | ❌ (no existen en v0) | `app/api/solicitudes/*` · `app/api/tasadores/*` · `app/api/visadores/*` · `app/api/adjuntos/upload/*` · `app/api/webhooks/asignar/*` | No | Reemplazan mocks. Token Airtable **sólo** server-side. Escritura de negocio ("Pasar a asignada") pasa por Make. |
| `lib/airtable-client.ts` | ❌ | nuevo | No | Fetch tipado Airtable con retry + LogEscenarios. |
| `lib/make-client.ts` | ❌ | nuevo | No | Firma HMAC opcional al webhook SC. |
| `lib/schemas.ts` (zod) | Parcial en v0 (sheet) | consolidado | No | Un solo archivo de esquemas. |
| Middleware Clerk | ❌ | `middleware.ts` | No | Protección de rutas `/consola/*`. |

---

## 1.3 Mapa campo ↔ tabla ↔ validación (basado en Blueprint §9 · Detalle IF-02)

Tabla base: `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`). TABLE_IDs y nombres de campo verificados vía MCP el 04-jul-2026.

> **Nota de nomenclatura (D-08 pendiente)**: la auditoría vía MCP descubrió tres discrepancias entre los nombres asumidos en spec y el schema real. Se lista el nombre **real** con el nombre spec entre paréntesis y una marca ⚠. Estas discrepancias no bloquean el diseño pero deben resolverse antes de escribir Route Handlers (renombrar en Airtable o adaptar los tipos TS). Ver D-08 en §1.9.

| Campo UI (panel Datos) | Tipo | Obligatorio | Origen / Tabla · Campo | Validación / Lógica |
|---|---|---|---|---|
| Cliente / institución | Link | Sí | `M_Clientes` (`tblpK7AcYBMH93apK`) → `TX_Solicitudes.cliente` | Sólo `activo=true`. |
| Tipo de informe | Select | Sí | `M_TiposInforme` (`tblOcsdiwxQLfD178`) → `.tipo_informe` | Filtrado por `M_Clientes.productos`. |
| Tipo de propiedad | Select | Sí | `M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`) → `.tipo_propiedad` | Lista cerrada. Dispara subtipo si `requiere_subtipo=true`. |
| Dirección | Texto | Sí | `TX_Solicitudes.direccion` | Sugerencia Google Places; mín. calle + número. |
| Región | Select | Sí | derivado de `M_Comunas` | Cascada. |
| Comuna | Link | Sí | `M_Comunas` (`tblyggAfQfq682XHK`) → `.comuna` | Debe existir. Autocompletable desde dirección. |
| Cliente final (nombre) | Texto | Sí | `TX_Solicitudes.cliente_final_nombre` | — |
| RUT propietario | Texto | Sí | `TX_Solicitudes.cliente_final_rut` | Módulo 11 RN-15/RN-02, formateo en vivo. |
| Email contacto | Email | Sí | `TX_Solicitudes` (campo email operacional) | Formato válido. |
| N° operación cliente | Número | Sí (alta interna) | `TX_Solicitudes.n_operacion_cliente` ⚠ (spec: `op_cliente`) | Entero. Tipo number en el schema real. |
| Banco financista | Link | Cond. | `M_Bancos` (`tblGlYuJo5AeMehhs`) → `TX_Solicitudes.banco` | Obligatorio si `producto ∈ {Hipotecario, Refinanciamiento}`. |
| Producto | Select | Sí (alta interna) | `M_Productos` (`tbll6D4KQ5aDdjjaj`) → `.producto` | Filtrado por cliente. |
| Canal de origen | Select | Sí (alta interna) | `TX_Solicitudes.origen_canal` | `email · telefono · whatsapp · presencial · otro` (auto `ingreso_manual` en alta interna). |
| Sucursal originadora | Texto | Sí (alta interna) | `TX_Solicitudes.sucursal_originadora ` ⚠ (nombre con **espacio final** en schema real; spec: `sucursal`) | Al escribir a Airtable, respetar el espacio final o corregir en Airtable antes (ver D-08). |
| Ejecutivo solicitante | Texto | Sí (alta interna) | `TX_Solicitudes.ejecutivo_solicitante` ⚠ (spec: `ejec_solicitante`) | — |
| Prioridad | Select | No | `TX_Solicitudes.prioridad` | Normal/Urgente/Crítico. Cambio a Urgente/Crítico exige justificación (RF-07). |
| Rol SII | Texto | No | `TX_Solicitudes.rol_sii` | Opcional en alta; Claude lo completa después. |
| Tasador asignado | Link | Cond. | `M_Tasadores` (`tblEi5jp18c1j00bQ`) → `.tasador` | `activo=true` · comuna en `zonas_cobertura`. **Nota**: los campos `disponible` y `casos_en_curso` que asumía el plan original **no existen** en el schema real; la disponibilidad efectiva se calcula desde `capacidad_activa` vs cuenta de `TX_Solicitudes` vinculadas en estado activo. Obligatorio para pasar a `asignada`. |
| Visador | Link | Cond. | `M_Visadores` (`tbludtgDtHWvt0Q3D`) → `.visador` | `activo=true` · `especialidades` (multipleSelects, nombre **plural** en schema real) coincide con `tipo_propiedad`. Obligatorio para pasar a `asignada`. **BQ-1 cerrado vía MCP**. |
| Fecha estimada de visita | Fecha | Cond. | `TX_Solicitudes.fecha_visita_programada` | Obligatoria para pasar a `asignada`. |
| Notas internas tasador | Texto largo | No | Reusar `TX_DatosTasacion.observaciones_tasador` **o** crear campo `TX_Solicitudes.notas_tasador` (decisión D-08). El campo `notas_tasador` en `TX_Solicitudes` **no existe** en schema real. | — |
| Notas del visador | Texto largo | No | Crear `TX_Solicitudes.notas_visador` (no existe en schema real; decisión D-08). | — |
| Observaciones internas | Texto largo | No | `TX_Solicitudes.observaciones_internas` | — |
| Adjuntos iniciales | Upload | No | `TX_Adjuntos` (`tblur71x1oItbmKZc`) | Sube directo a Dropbox vía Route Handler. **BQ-2 cerrado vía MCP**. |
| Documentos requeridos (checklist) | Compuesto | Cond. | catálogo `TIPOS_DOCUMENTO` + `TX_Adjuntos` | Sólo bloquea si un doc marcado no tiene archivo (Spec v1.4 §1.5.1.1). |
| Motivo reasignación | Texto | Sí (al reasignar) | escribe en `A_Eventos` (`tblMKmDg2KrO5fMn8`) con `tipo_evento=reasignacion_manual` | RF-06 · reasignación exige justificación. **BQ-2 cerrado vía MCP**. |
| origen_canal | Auto | — | `TX_Solicitudes.origen_canal=ingreso_manual` | Sólo en alta interna. |
| Estado | Auto | — | `TX_Solicitudes.estado` | Read-only. Cambio por webhook Make. |
| SLA semáforo | Auto | — | `TX_Solicitudes.semaforo_sla` (fórmula) | Verde/ámbar/rojo derivado de `dias_desde_solicitud`, `fecha_limite_entrega` y `C_SLA`. |
| Decisión del motor | Auto | — | `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`) → regla ganadora + candidatas | Read-only. **BQ-2 cerrado vía MCP**. |
| Código externo | Auto | — | `TX_Solicitudes.codigo_ext` (fórmula, tipo formula en schema real) | Read-only. |
| Filtro "Mi cartera" | — | — | Ver D-02. El campo `ejecutiva_asignada` **no existe** en el schema real; hay que crearlo o usar `ejecutivo_solicitante` (semánticamente distinto). | — |

**Tablas dependientes verificadas vía MCP (04-jul-2026)** — todas presentes en `app9G7lLkIV3CpeLa`:

| Tabla lógica | TABLE_ID real | Uso en IF-02 | Estado |
|---|---|---|---|
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` | Read cartera / write via SC01 y AT02 | ✅ |
| `M_Tasadores` | `tblEi5jp18c1j00bQ` | Read selector inteligente | ✅ (⚠ ID distinto del asumido en plan v1.0) |
| `M_Visadores` | `tbludtgDtHWvt0Q3D` | Read selector visador | ✅ (BQ-1 cerrado) |
| `M_Clientes` | `tblpK7AcYBMH93apK` | Read para filtros | ✅ |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | Read banco financista | ✅ |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | Read producto | ✅ |
| `M_Comunas` | `tblyggAfQfq682XHK` | Cascada Región→Comuna | ✅ |
| `M_TiposInforme` | `tblOcsdiwxQLfD178` | Read filtrado por cliente | ✅ |
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | Read select | ✅ |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write upload | ✅ (BQ-2 cerrado) |
| `A_Eventos` | `tblMKmDg2KrO5fMn8` | Write timeline | ✅ (BQ-2 cerrado) |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | Write override AT02 | ✅ (BQ-2 cerrado) |
| `A_DecisionesMotor` | `tbluQQtXUI0Zd8jiN` | Read decisión motor | ✅ (BQ-2 cerrado) |
| `A_ErroresMake` | `tbl46Q0BcfD57LWyQ` | Read/write errores Make | ✅ (bonus, reutilizable) |
| `C_NotificacionesConfig` | `tbluB662ulWDaxqUY` | Read destinatarios | ✅ (BQ-2 cerrado) |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read umbrales | ✅ |
| `C_ReglasNegocio` | `tblyCb8cVTDzfeBx0` | Read por AT01 | ✅ |
| `C_AutomationsAirtable` | `tblYYtKEaPgH7GfY0` | Read registro AT01/AT02/AT08 | ⚠ 9 filas presentes; MCP no permite verificar estado `On/Off` de los scripts Airtable directamente. |
| `LogEscenarios` | `tblR4VWpUHw1CSyIS` | Write logs Make | ✅ |
| `TX_Notificaciones` | `tbldgLQgjdgsOSZnt` | Write notificaciones | ✅ (bonus) |
| `Z_EscenariosMake` | `tblYfmDoaq7Z3Vh6P` | Registro SC01/SC05/SC13 | ⚠ **Vacía en la auditoría MCP**; refuerza BQ-3. |
| `Z_Webhooks` | `tblovY0Bt1Avhdgdx` | Registro URLs webhook | ✅ (revisar contenido antes de escribir) |

**Vistas Airtable requeridas para IF-02** (filtros server-side vía `?filterByFormula=` o vía Grid View saved): `Activas`, `SLA en riesgo (amb/rojo)`, `Por reasignar (>48h sin actividad)`, `Bloqueadas por cliente`, `Aprobadas pendientes de entrega`, `Mi cartera` (por ejecutiva — depende de D-02).

---

## 1.4 Automatizaciones detectadas

| Código | Trigger | Qué invoca la UI | Qué debe existir en Airtable/Make | Estado tras auditoría MCP (04-jul-2026) |
|---|---|---|---|---|
| **SC01** (Make) | Submit válido de "Nueva solicitud interna" (§1.5.4 Spec) | `POST` webhook Make desde Route Handler `/api/solicitudes/create` | Escenario Make + webhook + módulo Airtable Create Record en `TX_Solicitudes` (estado=`creada`, `origen_canal=ingreso_manual`) + módulo `POST` a `LogEscenarios`. Encadena AT01→AT02. | ❌ **NO EXISTE**. `Z_EscenariosMake` está vacía y MCP no llega a Make. **Bloqueador BQ-3**. |
| **AT01** (Airtable Script) | `TX_Solicitudes.estado = creada` | Ninguno (se dispara solo al insertar) | Script Airtable + `C_ReglasNegocio` (`tblyCb8cVTDzfeBx0` ✅) + escritura a `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN` ✅) | ⚠ Tablas dependientes existen; `C_AutomationsAirtable` contiene 9 registros, pero **MCP no verifica el estado activo/inactivo del script** en Airtable Automations. Bloqueador BQ-4 sigue abierto hasta comprobación en la UI de Airtable. |
| **AT02** (Airtable Script) | `estado=creada` (post AT01), o webhook Make de "Pasar a asignada" | `POST` webhook Make desde Route Handler `/api/webhooks/asignar` cuando la Ejecutiva presiona "Pasar a asignada" tras completar precondiciones | Script AT02 que valida precondiciones (tasador+visador+fecha_visita), actualiza `TX_Solicitudes.estado=asignada`, escribe `A_Eventos` (`tblMKmDg2KrO5fMn8` ✅) | ⚠ `M_Tasadores` (`tblEi5jp18c1j00bQ` ✅), `M_Visadores` (`tbludtgDtHWvt0Q3D` ✅) presentes; script no verificable vía MCP. Bloqueador BQ-4 sigue abierto. |
| **SC05** (Make) | Transición `creada → asignada` en Airtable | Ninguno (encadenado desde AT02) | Escenario Make: Airtable Automation dispara webhook → Gmail envía notificación al tasador con link a IF-03 · registra en `TX_Notificaciones` (`tbldgLQgjdgsOSZnt` ✅) | ❌ **NO EXISTE**. Bloqueador BQ-3. |
| **SC13** (Make) | Reasignación manual, cambio de prioridad a Urgente/Crítico, pausa | `POST` webhook Make desde Route Handler `/api/webhooks/reasignar` (etc.) | Escenario Make: recibe payload · Gmail al destinatario · registro en `TX_Notificaciones` · destinatarios desde `C_NotificacionesConfig` (`tbluB662ulWDaxqUY` ✅) | ❌ **NO EXISTE**. Bloqueador BQ-3. |
| **AT08** (Airtable Scheduled) | Cron 08:00 diario | Ninguno; la UI sólo consume la vista "SLA en riesgo" | Script AT08 + `C_SLA` (`tblsPZokEK5aoinTn` ✅) + escribe `TX_Notificaciones` · dispara SC13 | ⚠ Tabla `C_SLA` presente; script no verificable vía MCP. Bloqueador BQ-4. |
| **SC07** (Make) | Upload de adjunto durante alta interna | `POST` webhook Make desde Route Handler `/api/adjuntos/upload` tras subir a Dropbox | Escenario Make: llama Claude API para extracción → escribe `TX_DatosTasacion` + `TX_DocumentosLegales` (ambos presentes en MCP) | ❌ NO existe. **Fuera del alcance mínimo del CU-002** — post-MVP (D-05). |
| **AT10_thumbnails** (SC10 en arquitectura) | Insert `TX_Adjuntos` de imagen | Ninguno | Escenario Make de miniaturas | ❌ NO existe. Post-MVP. |

**Escenarios Make ya activos y NO usados por IF-02** (informativo, para no duplicar): E1_Airtable_Make (5748459), E2_Carbone_Render (5750023), E3_Carbone_Download_Dropbox (5791413). Pertenecen al flujo `pdf_listo` (IF-04 aguas abajo).

---

## 1.5 Precondiciones exactas del botón "Pasar a asignada"

Regla oficial (Blueprint §7.2 · Spec v1.4 §1.3 · RN-09):

```
puede_pasar_a_asignada = (
  TX_Solicitudes.estado === "creada"
  AND TX_Solicitudes.tasador  IS NOT NULL           // link a M_Tasadores.activo=true, zonas_cobertura ∋ comuna
  AND TX_Solicitudes.visador  IS NOT NULL           // link a M_Visadores.activo=true, especialidades ∋ tipo_propiedad
  AND TX_Solicitudes.fecha_visita_programada IS NOT NULL  // fecha >= hoy
)
```

> El campo real en `M_Visadores` es `especialidades` (multipleSelects, **plural**), no `especialidad` como decía el borrador anterior. En `M_Tasadores` no existe un campo `disponible`; la disponibilidad se deriva de `capacidad_activa` vs cuenta de solicitudes vinculadas activas.

Comportamiento UI:

- El botón está **habilitado sólo si** las tres condiciones son verdaderas. En caso contrario permanece **deshabilitado** (opacidad reducida).
- Al pasar el cursor por el botón deshabilitado se muestra tooltip con el mensaje humano exacto:

  > **"Para pasar a asignada falta: tasador · visador · fecha de visita."**  
  > *(Blueprint §6.2 — texto literal, no admite variación.)*

- Sólo se listan los faltantes reales, separados por " · ". Si sólo falta la fecha: *"Para pasar a asignada falta: fecha de visita."*
- La lógica de habilitación es **presentacional pura** (feedback UX rápido). La transición real la ejecuta AT02 en Airtable tras validación server-side idéntica; si la UI se equivocara, AT02 rechaza y el estado no cambia.
- Al presionar el botón habilitado: la UI invoca `POST /api/webhooks/asignar` (server-side, con token Airtable en `.env` y firma HMAC opcional al webhook Make). Mientras espera, muestra spinner + estado optimista `asignando…`. Al confirmar transición:
  - Toast verde: **"Solicitud asignada a {nombre_tasador}"** (§6.4).
  - Panel se refresca desde Airtable; `EventTimeline` muestra el nuevo evento.
  - En segundo plano SC05 notifica al tasador por email (no bloqueante para la UI).
- Ante error Make/Airtable: toast rojo humano (§6.5) — nunca error técnico crudo.

---

## 1.6 Conflictos v0.dev ↔ especificación

| # | Conflicto | Fuente v0 | Fuente spec | Resolución propuesta | Impacto |
|---|---|---|---|---|---|
| C-01 | Reasignación de **visador** desde la barra de acciones | v0 y Blueprint §7.2 permiten "asignar/reasignar tasador y visador" | Spec v1.4 §1.6 Nota v0: *"la Ejecutiva no reasigna Visador desde la barra de acciones"* | **Prevalece Spec v1.4**. Ocultar acción "Reasignar visador"; el dato queda visible en `TabDatos`, sin acción. | Bajo (menos superficie). Requiere confirmación del propietario (D-01). |
| C-02 | Datos mock vs Airtable real | `components/dashboard/mock-data.ts`, `lib/tasador-store.ts`, `lib/tasaciones.ts` | Spec v1.4: Route Handlers con token Airtable server-side; escrituras vía Make | Reemplazar mocks por `fetch` desde Route Handlers server-side con `revalidate` corto (60 s) o `no-store` según la vista. Tipos TS derivados del schema real (auditado vía MCP), no del asumido. | Alto (rewrite total de la capa de datos del prototipo). |
| C-03 | Versión Next.js | Blueprint declara Next.js 14 | Spec v1.4 y v0 real: Next.js 16.2.6 (RT-01 conserva 14 como piso mínimo) | Usar 16.2.6 real; documentar que RT-01 sigue vigente | Nulo. |
| C-04 | `asChild` de Radix | Frecuente en snippets estándar shadcn | Blueprint §4.4 + Spec §1.8: usar `render` prop + `nativeButton` sobre `@base-ui/react` | Blueprint §4.4 es ley. Cualquier snippet con `asChild` se refactoriza a `render`. | Medio (aplica a `SheetTrigger`, `SheetClose`, `TooltipTrigger`, `DialogTrigger`). |
| C-05 | `tailwind.config.js` | Shadcn tradicional lo requiere | Spec/Blueprint: tokens en `@theme` dentro de `app/globals.css`, sin `tailwind.config.js` | No crear `tailwind.config.js`. Custom properties en `:root` vía arbitrary values. | Alto (afecta todo componente que use tokens). |
| C-06 | Sticky action bar en `DetallePanel` | Idiomático en dashboards | Blueprint §4.4: evitar sticky cuando conviven portales Select en la misma pantalla | Botones inline al final de la cabecera del panel; no sticky bottom bar. | Bajo. |
| C-07 | Comportamiento "Crear solicitud" bloqueado por documentos | v0 (heredado): botón deshabilitado hasta que todo esté válido | Spec v1.4 §1.5.1.1: sólo bloquea si un doc marcado no tiene archivo | Alinear al comportamiento Spec v1.4: `disabled` sólo si `docsFaltantes > 0`. El sheet actual ya lo hace correctamente ✅. | Nulo (ya alineado en `new-request-sheet.tsx`). |
| C-08 | Toast al notificar reasignación | v0 (por definirse) | Spec v1.4 §1.6: toast de éxito + SC13 notifica al tasador entrante | Toast verde: **"Solicitud reasignada a {nombre}"**. SC13 corre server-side; error de SC13 no rompe la reasignación (queda registrado). | Bajo. |
| C-09 | `next-themes` requerido por sonner | En `package.json` v0 | No mencionado en spec | Mantener (dependencia transitiva). No exponer toggle de tema en IF-02. | Nulo. |
| C-10 | Nombres de campo en `TX_Solicitudes` | Plan borrador asumía `op_cliente`, `sucursal`, `ejec_solicitante` | Schema real (MCP): `n_operacion_cliente` (number), `sucursal_originadora ` (con espacio final), `ejecutivo_solicitante` | Resolver en D-08: renombrar en Airtable o adaptar tipos TS y writers. Recomendamos adaptar TS y **corregir el espacio final** de `sucursal_originadora ` en Airtable (un lookup por espacio-final es fuente de bugs inevitable). | Medio. |
| C-11 | Campos ausentes: `notas_tasador`, `notas_visador`, `ejecutiva_asignada` en `TX_Solicitudes` | Plan borrador los asumía | No existen en schema real | Decidir en D-02 y D-08: (a) crearlos como singleLineText/multilineText, o (b) reusar `TX_DatosTasacion.observaciones_tasador` para tasador y crear sólo `notas_visador` + `ejecutiva_asignada`. Recomendamos (a) por claridad. | Medio. |
| C-12 | Campos ausentes en `M_Tasadores`: `disponible`, `casos_en_curso` | Plan borrador los asumía | No existen en schema real | La lógica de disponibilidad usa `capacidad_activa` (existe) vs rollup de solicitudes activas (a definir en AT01/AT02). No requiere agregar campos si AT01 hace el conteo. | Bajo. |

---

## 1.7 Plan multiagente para la fase de construcción

Cinco subagentes en paralelo, con puntos de sincronización explícitos y orden de merge por rama.

| Subagente | Qué produce (en paralelo) | Entradas | Puntos de sincronización |
|---|---|---|---|
| **A · UI Next.js** | Rutas `app/(ejecutiva)/*`, componentes `components/console/*`, migración de mocks a fetch desde Route Handlers, tokens `@theme` en `globals.css`, refactor `asChild` → `render`, sonner, cmdk, tests visuales. Tipos TS derivados del schema real. | v0 zip · componentes CU-000 · `lib/schemas.ts` acordado con B · schema snapshot MCP (§1.3). | S1 (contratos JSON con B, día 2); S3 (integración Route Handlers, día 5); S5 (QA visual, día 7). |
| **B · Airtable Scripting** | (1) Resolver D-08 (renombres + campos faltantes); (2) verificar en la UI de Airtable el estado activo de AT01/AT02/AT08 (única forma de cerrar BQ-4); (3) crear/actualizar scripts según Motor v2.5; (4) vistas filtradas para IF-02; (5) alta de escenarios en `C_AutomationsAirtable` y `Z_EscenariosMake`. **Ya no requiere crear M_Visadores ni tablas de auditoría** (cerradas por MCP). | Diseño Capa Datos v2.6.2 · Motor v2.5 · Snapshot MCP §1.3. | S1 (schema JSON, día 2); S2 (scripts en modo test, día 3); S4 (activación en base productiva, día 6). |
| **C · Make** | Escenarios SC01, SC05, SC13 en org 1594725: webhook + módulo Airtable Create/Update + módulo Gmail + `POST` `LogEscenarios`. Reautorización OAuth Airtable/Gmail/Dropbox. Documentar URLs en `Z_Webhooks` y filas en `Z_EscenariosMake` (hoy vacía). | Credenciales v3 · payload contract con A. | S1 (payload JSON, día 2); S4 (E2E test con B, día 6). |
| **D · Docs** | `CLAUDE.md` adenda CU-002 (con TABLE_IDs reales); ADRs por decisión de resolución de conflictos, incluida D-08; README de `docs/if02/`; matriz de trazabilidad. | Este plan aprobado. | S2, S5. |
| **E · QA Lead** | Casos de prueba por RF-05, RF-06, RF-07, RF-08; mensajes humanos §6 verificados literales; contract tests contra Airtable (con TABLE_IDs reales) y Make; tests de accesibilidad (base-ui). | Plan aprobado · builds A. | S3, S5. |

**Puntos de sincronización**:  
S1 (día 2, congelar contratos JSON); S2 (día 3, esquema Airtable ready y adenda `CLAUDE.md` publicada); S3 (día 5, Route Handlers ↔ Airtable en dev); S4 (día 6, E2E con Make sandbox); S5 (día 7, QA regresivo + firma).

**Orden de merge** (main protegida, revisión obligada por A + E):

1. `feat/if02-infra-airtable` (B) — sólo D-08 (renombres y campos faltantes); ya no incluye tablas nuevas.
2. `feat/if02-make-scenarios` (C) — payload y escenarios sandbox.
3. `feat/if02-app-shell` (A) — layout Clerk + tokens `@theme` + CU-000 wired.
4. `feat/if02-lista-detalle` (A) — P2 sin escrituras.
5. `feat/if02-new-request-sheet` (A) — P3 sin submit real, con mock local.
6. `feat/if02-reasignar-dialog` (A) — cmdk operativo, sin submit real.
7. `feat/if02-webhooks` (A) — Route Handlers `/api/webhooks/*` que hablan con C.
8. `feat/if02-e2e-qa` (E) — regresión completa + release notes.

---

## 1.8 Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Dropbox App aún en Development → tokens expiran en horas | Alta | Alto (upload de adjuntos) | Usar la conexión OAuth `My Dropbox connection` de Make (renueva sola) para la subida desde SC-nuevo; en la UI el archivo va vía Route Handler → Make → Dropbox. No usar token directo de Dropbox en el cliente ni en `.env` del server. Alertar a admin para acelerar aprobación producción. |
| SC01/SC05/SC13 inexistentes en Make | Alta | Crítico | Bloquea "Pasar a asignada" y notificaciones. Marcado como BQ-3. `Z_EscenariosMake` vacía en la auditoría MCP confirma la sospecha. Owner: Integrador Make (C). |
| Estado activo de scripts AT01/AT02/AT08 no verificable vía MCP | Alta | Crítico | Bloqueador BQ-4 residual: MCP audita registro (`C_AutomationsAirtable` tiene 9 filas) pero no toca Airtable Automations. Owner: Ingeniero Airtable (B) debe abrir la UI y confirmar estado `On` + últimas 24 h sin errores. |
| Confundir campos por discrepancia de nombres (`op_cliente` vs `n_operacion_cliente`, etc.) | Media | Alto | Congelar tabla de mapeo real → spec en el §1.3; validar Route Handlers contra el snapshot MCP; test unitario que falle si un campo del schema muta. |
| Fila con `sucursal_originadora ` (espacio final) rompe writers | Media | Alto | Corregir el nombre en Airtable (D-08) antes de que ningún writer productivo lo use; mientras tanto, referirse por FIELD_ID (`fldd56pLZyKYoi2Vi`) en clientes de Airtable. |
| Sticky-bar rompiendo portales Select | Media | Medio | Botones inline en cabecera de `DetallePanel`. Test de humo en QA con Select abierto + acción invocada. |
| `asChild` accidental en snippets copiados | Media | Medio | Linter/regex prohibiendo `asChild`; revisión obligatoria de PR toca componentes shadcn. |
| Token Airtable filtrado al cliente | Baja | Crítico | Prohibido en `NEXT_PUBLIC_*`. Sólo en variables server-only. QA verifica en el bundle final. |
| RN-15 (dígito verificador RUT) fallando por copiar-pegar con puntos/guiones | Media | Bajo | `RUTField` de CU-000.A normaliza automáticamente. Tests unitarios cubren 20 vectores. |
| Latencia Airtable > 3 s en vistas grandes (500+ registros) | Media | Medio | Airtable views con filtro server-side; paginación por `offset`; caché `revalidate: 60` para vistas no críticas. RF-05 exige <3 s. |
| Retry storm ante caída Make | Media | Alto | Exponential backoff en el Route Handler + circuit breaker por 60 s; degradación graciosa a toast rojo humano. |
| Fusión con CU-000 desactualizada | Baja | Medio | Adenda `CLAUDE.md` fija versión exacta de CU-000.A en uso. |

---

## 1.9 Preguntas abiertas que requieren decisión antes de construir

- **D-01 · Reasignación de visador por la Ejecutiva**. Blueprint §7.2 la permite; Spec v1.4 §1.6 Nota v0 la niega. Proponemos aplicar **Spec v1.4** y ocultar la acción. ¿Confirmas?
- **D-02 · Vista de "Mi cartera" por ejecutiva autenticada**. El campo `ejecutiva_asignada` **no existe** en el schema real (verificado vía MCP). Opciones: (a) crear `TX_Solicitudes.ejecutiva_asignada` (link a M_Usuarios o email texto), (b) reusar `ejecutivo_solicitante` aceptando que semánticamente es el ejecutivo del banco cliente y no la ejecutiva de VProperty, o (c) filtrar por `origen_canal + creado_por`. Recomendamos (a). ¿OK?
- **D-03 · Firma HMAC en webhook Make**. ¿Añadimos header `X-VP-Signature` con HMAC-SHA256 sobre el body para SC01/SC05/SC13 (recomendado) o basta con secret compartido en `Z_Webhooks.token_seguridad`?
- **D-04 · Manejo del override manual de asignación**. Cuando la Ejecutiva asigna tasador antes de que AT02 corra: ¿AT02 respeta la asignación previa o siempre reevalúa? Recomendamos "respeta si existe" y registra `A_Cambios(motivo=override_manual)`. ¿OK?
- **D-05 · Alcance mínimo del CU-002 respecto a SC07 (Claude API)**. La extracción desde adjuntos iniciales, ¿es parte del MVP de CU-002 o se difiere a un CU posterior? Recomendamos diferir; la UI ya deja el punto de invocación previsto.
- **D-06 · Ruta base**. `/consola` o `/ejecutiva/consola` o `/cu/if-02`? Recomendamos `/consola`.
- **D-07 · Persistencia de filtros por usuario**. ¿En cookie (Clerk-scoped) o en URL params únicamente? Recomendamos URL params (compartible) con fallback a la última vista abierta guardada en cookie httpOnly.
- **D-08 · Reconciliación de nomenclatura Airtable ↔ spec** (NUEVA · derivada de auditoría MCP). Tres pares campo/tabla en discrepancia:
  1. `TX_Solicitudes.n_operacion_cliente` (real, number) vs `op_cliente` (spec).
  2. `TX_Solicitudes.sucursal_originadora ` (real, con espacio final) vs `sucursal` (spec).
  3. `TX_Solicitudes.ejecutivo_solicitante` (real) vs `ejec_solicitante` (spec).
  
  Adicionalmente, faltan en el schema real tres campos que la spec asume: `notas_tasador`, `notas_visador`, `ejecutiva_asignada` (este último ligado a D-02).
  
  Opciones: **(A)** renombrar en Airtable para coincidir con spec (rompe automations existentes y consumidores externos si los hay); **(B)** dejar los nombres reales y adaptar la spec + tipos TS (menos riesgo pero convive con el bug del espacio final); **(C)** híbrido: **corregir el espacio final** de `sucursal_originadora ` en Airtable (bug objetivo), aceptar los otros dos nombres reales, y crear los tres campos faltantes con los nombres que la spec pide.
  
  Recomendamos **(C)** por balance de riesgo/beneficio. ¿Confirmas?

---

**Estado**: pendiente de aprobación. No se producirá código de producción hasta recibir "APROBADO" y cerrar los bloqueadores residuales listados en `CHECKLIST_PRE_EJECUCION.md` (BQ-3 completo, BQ-4 residual, credenciales Clerk/Railway) más las respuestas a D-01…D-08.
