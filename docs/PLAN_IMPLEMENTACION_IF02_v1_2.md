# PLAN DE IMPLEMENTACIÓN · CU-002 · IF-02 Consola de la Ejecutiva Comercial

> **Versión**: 1.2 (D-01…D-08 incorporadas · SC13 fuera de alcance · SC07 promovido a RF-09 · restricciones §4.4 inlineadas · `disponible`/`casos_en_curso` corregidos · 06-jul-2026).
> **Fase**: Pre-construcción — se generan `/docs/diseno.md`, `/docs/construccion.md` y `/docs/schema-airtable.md` antes de escribir código.
> **Objetivo**: dejar el repo listo para que Claude Code implemente **una RF por sesión** con validación en Railway entre iteraciones.
> **Alineado a**: Especificación v1.4 · Arquitectura Enterprise v2.6 · Capa de Datos v2.6.2 · Blueprint Interfaces v2.7 · Motor de Cálculo AT01–AT10 v2.5 · Credenciales API v3.
> **Fuente visual**: `Imagenes_IF_Ejecutiva.pdf`.
> **Fuente de estructura de componentes**: deploy v0.dev (`if-ejecutiva-gfvE6z3qTyX`).
> **Equipo firmante**: Arquitecto Enterprise · UX/UI · Ingeniero Next.js · Ingeniero Airtable · Integrador Make · QA Lead · Redactor Técnico.

---

## 1.1 Resumen ejecutivo

CU-002 materializa IF-02 (Tipo A · Next.js 16 + Clerk · Railway) sobre el prototipo v0 ya generado, reemplazando mocks por Route Handlers de lectura contra Airtable y dos webhooks Make: **SC01** para crear la solicitud y **SC05** para notificar al tasador por email. El motor de estados sigue viviendo en Airtable (AT01/AT02); la UI sólo captura y muestra.

**Recordatorio operativo · Restricciones técnicas transversales** (fuente: Especificación v1.4 §1.8 · Blueprint de trabajo: v2.7):

1. **Tailwind CSS v4** — tokens declarados en `@theme` dentro de `app/globals.css`. **Nunca crear `tailwind.config.js`**. Custom properties en `:root` vía arbitrary value syntax.
2. **`@base-ui/react`, no Radix** — todos los primitivos de UI provienen de `@base-ui/react 1.5`. Si un snippet de shadcn usa `asChild`, refactorizar a `render` prop + `nativeButton`. Ejemplo correcto: `<SheetTrigger render={<Button>Abrir</Button>} />`.
3. **Imports nombrados explícitos de shadcn** — nunca sustituir por rutas alternativas ni re-exportaciones.
4. **Sin sticky action bar** en pantallas donde conviven portales `Select` (el `DetallePanel` de IF-02 tiene selects en `TabDatos`). Botones de acción inline en la cabecera del panel.

**Cambio de alcance respecto a v1.1**: la extracción automática con Claude API sobre adjuntos iniciales, que la v1.1 difería (D-05), pasa a ser **RF-09** y se construye dentro de IF-02 porque será útil para toda interfaz del negocio (IF-03, IF-04, IF-05). **SC13 sale del alcance de CU-002**: IF-02 no lo invoca; las notificaciones de reasignación/pausa/prioridad quedan diferidas a un CU posterior.

**Estrategia de construcción**: el plan v1.1 proponía cinco subagentes en paralelo. La v1.2 lo reemplaza por **iteración por RF con Claude Code**, alimentado por dos documentos de referencia permanente (`/docs/diseno.md` y `/docs/construccion.md`) más el snapshot MCP del schema (`/docs/schema-airtable.md`). Una RF por sesión, un push, un despliegue Railway, una validación humana. Detalle en §1.7.

Bloqueadores residuales antes de arrancar la primera sesión de Claude Code: (a) JSON exportable de SC01 y SC05 para importar en Make y dejarlos activos; (b) script AT08 para pegar en Airtable Automations; (c) variables `MAKE_*` en Railway (pendientes de aceptar por el propietario). AT01 y AT02 ya están `On` según verificación en la UI de Airtable.

---

## 1.2 Inventario de componentes

Origen v0 se refiere al deploy `if-ejecutiva-gfvE6z3qTyX`. "Reutiliza CU-000" indica si el componente ya está calibrado en el sistema de diseño VProperty compartido.

| Componente | Origen v0 | Destino repo | Reutiliza CU-000 | Justificación |
|---|---|---|---|---|
| `AppShell` + header VProperty | `app/layout.tsx` | `app/(ejecutiva)/layout.tsx` | Sí (header) | Header institucional (logo azul #075899 · subtítulo naranja #F5A213) es CU-000. |
| `SolicitudesListPane` (P1) | `components/dashboard/*` | `components/console/lista-solicitudes.tsx` | No | Grid con filas VP-AAAA-NNNN, StateBadge, SLABadge, prioridad, tasador. Específico de IF-02. |
| `TabsVistas` (Activas · SLA en riesgo · Por reasignar · Bloqueadas · Aprobadas pend. entrega · Mi cartera) | `components/dashboard/mock-data.ts` (vistas mock) | `components/console/tabs-vistas.tsx` | No | RF-05. Contadores desde Airtable views. "Mi cartera" filtra por `ejecutiva_asignada` (creado en D-08). |
| `FiltrosBar` (Cliente · Estado · SLA · Fecha) | v0 | `components/console/filtros-bar.tsx` | Parcial (Select base) | Persistencia por URL params (D-07). |
| `StateBadge` (11 estados) | v0 | `components/vp/state-badge.tsx` | **Sí** | Ya congelado en CU-000.A. |
| `SLABadge` (verde/ámbar/rojo #15803D · #D97706 · #B91C1C) | v0 | `components/vp/sla-badge.tsx` | **Sí** | Ya congelado en CU-000.A. |
| `PrioridadBadge` (Normal/Urgente/Crítico) | v0 | `components/console/prioridad-badge.tsx` | No | Nuevo, específico IF-02. |
| `DetallePanel` (cabecera + acciones + tabs Datos/Historial/Adjuntos) | v0 | `components/console/detalle-panel.tsx` | No | Cascarón P2 específico. |
| `TabDatos` (cliente · propiedad · contactos · plazo · decisión motor · tasador · visador) | v0 | `components/console/tab-datos.tsx` | No | Consolida read del expediente. |
| `TabHistorial` (`EventTimeline` de A_Eventos + A_Cambios) | v0 | `components/console/tab-historial.tsx` | Parcial (`EventTimeline`) | `EventTimeline` viene de CU-000.A. |
| `TabAdjuntos` (visor PDF/miniatura + `FileUploadZone` + `ExtraccionStatusBadge`) | v0 (parcial) | `components/console/tab-adjuntos.tsx` | Parcial | Añade badge de estado de extracción RF-09 (idle · extrayendo · listo · error). |
| `ExtraccionStatusBadge` (RF-09) | ❌ (no existe en v0) | `components/vp/extraccion-status-badge.tsx` | No (nuevo, compartible) | Muestra estado de la extracción con Claude API. Diseñado para reuso en IF-03/IF-04/IF-05. |
| `NewRequestSheet` (Sheet P3 seccionado: Origen · Propiedad · Solicitante · Producto · Documentos · Adjuntos) | `components/console/new-request-sheet.tsx` | igual | Parcial | Reutiliza `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `DocumentChecklist`, `FileUploadZone` de CU-000.A. |
| `RUTField` (validación módulo 11 RN-15) | v0 (CU-000.A) | `components/vp/rut-field.tsx` | **Sí** | Compartido. |
| `EmailField` | v0 (CU-000.A) | `components/vp/email-field.tsx` | **Sí** | Compartido. |
| `AddressField` (Google Places) | v0 (CU-000.A) | `components/vp/address-field.tsx` | **Sí** | Compartido. |
| `RegionComunaSelector` (cascada) | v0 (CU-000.A) | `components/vp/region-comuna-selector.tsx` | **Sí** | Compartido. |
| `DocumentChecklist` (TIPOS_DOCUMENTO) | v0 | `components/vp/document-checklist.tsx` | No (nuevo en IF-02) | RF v1.4 §1.5.1.1: solicitud sin adjuntos permitida; sólo bloquea si un documento marcado no tiene archivo. |
| `FileUploadZone` (Dropbox directo) | v0 (CU-000.A) | `components/vp/file-upload-zone.tsx` | **Sí** | 4 estados; sube por streaming vía Route Handler, no pasa por Airtable. Encadena RF-09 tras confirmación. |
| `ReasignarTasadorDialog` (cmdk + ficha carga + alerta "fuera de cobertura") | v0 | `components/console/reasignar-tasador-dialog.tsx` | No | Específico IF-02 · RF-06. Sin envío de notificación (SC13 fuera de alcance). |
| `BarraAccionesDetalle` (Pasar a asignada · Reasignar tasador · Cambiar prioridad · Pausar · Cancelar) | v0 | `components/console/acciones-detalle.tsx` | No | Inline, no sticky (§4.4 con portales Select conviven). Sin acción "Reasignar visador" (D-01). |
| `AlertDialogUnmarkDoc` | v0 | `components/console/unmark-doc-dialog.tsx` | Parcial | AlertDialog base-ui es CU-000; contenido específico. |
| `EventTimeline` (renderiza A_Eventos) | v0 (CU-000.A) | `components/vp/event-timeline.tsx` | **Sí** | Compartido. |
| Route Handlers (server-side) | ❌ (no existen en v0) | `app/api/solicitudes/*` · `app/api/tasadores/*` · `app/api/visadores/*` · `app/api/adjuntos/upload/*` · `app/api/webhooks/crear/*` · `app/api/webhooks/asignar/*` · `app/api/extraccion/*` | No | Reemplazan mocks. Token Airtable **sólo** server-side. Crear solicitud pasa por Make (SC01); "Pasar a asignada" actualiza un campo trigger en Airtable y AT02 completa la transición. |
| `lib/airtable-client.ts` | ❌ | nuevo | No | Fetch tipado Airtable con retry + LogEscenarios. |
| `lib/make-client.ts` | ❌ | nuevo | No | Firma HMAC-SHA256 (D-03) para SC01 y SC05. |
| `lib/claude-extractor.ts` (RF-09) | ❌ | nuevo | No (nuevo, compartible) | Cliente Claude API que orquesta extracción desde adjunto en Dropbox. Ubicación server-only. |
| `lib/schemas.ts` (zod) | Parcial en v0 (sheet) | consolidado | No | Un solo archivo de esquemas. |
| Middleware Clerk | ❌ | `middleware.ts` | No | Protección de rutas `/consola/*` (D-06). |

---

## 1.3 Mapa campo ↔ tabla ↔ validación (basado en Blueprint §9 · Detalle IF-02)

Tabla base: `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`). TABLE_IDs y nombres de campo verificados vía MCP el 04-jul-2026.

**Resolución D-08 (opción C, aprobada)**: se corrige el espacio final de `sucursal_originadora ` en Airtable (bug); los otros dos nombres reales (`n_operacion_cliente`, `ejecutivo_solicitante`) se mantienen y la spec + tipos TS se adaptan; se crean los tres campos faltantes (`notas_tasador`, `notas_visador`, `ejecutiva_asignada`) con los nombres que la spec pide.

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
| N° operación cliente | Número | Sí (alta interna) | `TX_Solicitudes.n_operacion_cliente` (nombre real conservado por D-08) | Entero. Tipo number en el schema real. |
| Banco financista | Link | Cond. | `M_Bancos` (`tblGlYuJo5AeMehhs`) → `TX_Solicitudes.banco` | Obligatorio si `producto ∈ {Hipotecario, Refinanciamiento}`. |
| Producto | Select | Sí (alta interna) | `M_Productos` (`tbll6D4KQ5aDdjjaj`) → `.producto` | Filtrado por cliente. |
| Canal de origen | Select | Sí (alta interna) | `TX_Solicitudes.origen_canal` | `email · telefono · whatsapp · presencial · otro` (auto `ingreso_manual` en alta interna). |
| Sucursal originadora | Texto | Sí (alta interna) | `TX_Solicitudes.sucursal_originadora` (espacio final **corregido** en Airtable por D-08) | Referencia por FIELD_ID (`fldd56pLZyKYoi2Vi`) hasta que el rename esté propagado. |
| Ejecutivo solicitante | Texto | Sí (alta interna) | `TX_Solicitudes.ejecutivo_solicitante` (nombre real conservado por D-08) | — |
| Ejecutiva asignada (VProperty) | Link | Sí | `TX_Solicitudes.ejecutiva_asignada` → `M_Usuarios` (**creado por D-02/D-08**) | Filtra vista "Mi cartera". Asignación automática = usuario Clerk autenticado en la sesión. |
| Prioridad | Select | No | `TX_Solicitudes.prioridad` | Normal/Urgente/Crítico. Cambio a Urgente/Crítico exige justificación (RF-07). |
| Rol SII | Texto | No | `TX_Solicitudes.rol_sii` | Opcional en alta; RF-09 lo completa después. |
| Tasador asignado | Link | Cond. | `M_Tasadores` (`tblEi5jp18c1j00bQ`) → `.tasador` | `activo=true` · comuna en `zonas_cobertura`. Disponibilidad = `capacidad_activa` vs conteo de solicitudes activas. Obligatorio para pasar a `asignada`. |
| Visador | Link | Cond. | `M_Visadores` (`tbludtgDtHWvt0Q3D`) → `.visador` | `activo=true` · `especialidades` (multipleSelects, plural) coincide con `tipo_propiedad`. Obligatorio para pasar a `asignada`. La Ejecutiva **no** puede reasignar visador (D-01). |
| Fecha estimada de visita | Fecha | Cond. | `TX_Solicitudes.fecha_visita_programada` | Obligatoria para pasar a `asignada`. |
| Notas internas tasador | Texto largo | No | `TX_Solicitudes.notas_tasador` (**creado por D-08**) | — |
| Notas del visador | Texto largo | No | `TX_Solicitudes.notas_visador` (**creado por D-08**) | — |
| Observaciones internas | Texto largo | No | `TX_Solicitudes.observaciones_internas` | — |
| Adjuntos iniciales | Upload | No | `TX_Adjuntos` (`tblur71x1oItbmKZc`) | Sube directo a Dropbox vía Route Handler. Dispara RF-09 en background. |
| Estado extracción (RF-09) | Auto | — | `TX_Adjuntos.estado_extraccion` (a crear si no existe) | `idle · extrayendo · listo · error`. Escrito por SC/Route Handler de extracción. |
| Documentos requeridos (checklist) | Compuesto | Cond. | catálogo `TIPOS_DOCUMENTO` + `TX_Adjuntos` | Sólo bloquea si un doc marcado no tiene archivo (Spec v1.4 §1.5.1.1). |
| Motivo reasignación | Texto | Sí (al reasignar) | escribe en `A_Eventos` (`tblMKmDg2KrO5fMn8`) con `tipo_evento=reasignacion_manual` | RF-06. Sin envío de email (SC13 fuera de alcance). |
| Estado | Auto | — | `TX_Solicitudes.estado` | Read-only. Cambio por AT02. |
| SLA semáforo | Auto | — | `TX_Solicitudes.semaforo_sla` (fórmula) | Verde/ámbar/rojo derivado de `dias_desde_solicitud`, `fecha_limite_entrega` y `C_SLA`. |
| Decisión del motor | Auto | — | `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`) → regla ganadora + candidatas | Read-only. |
| Código externo | Auto | — | `TX_Solicitudes.codigo_ext` (fórmula) | Read-only. |

**Tablas dependientes verificadas vía MCP (04-jul-2026)** — todas presentes en `app9G7lLkIV3CpeLa`:

| Tabla lógica | TABLE_ID real | Uso en IF-02 | Estado |
|---|---|---|---|
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` | Read cartera / write vía SC01 y AT02 | ✅ |
| `M_Tasadores` | `tblEi5jp18c1j00bQ` | Read selector inteligente | ✅ |
| `M_Visadores` | `tbludtgDtHWvt0Q3D` | Read selector visador | ✅ |
| `M_Usuarios` | *(verificar TABLE_ID vía MCP antes de S1)* | Alimenta `ejecutiva_asignada` (D-02) | ⚠ |
| `M_Clientes` | `tblpK7AcYBMH93apK` | Read para filtros | ✅ |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | Read banco financista | ✅ |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | Read producto | ✅ |
| `M_Comunas` | `tblyggAfQfq682XHK` | Cascada Región→Comuna | ✅ |
| `M_TiposInforme` | `tblOcsdiwxQLfD178` | Read filtrado por cliente | ✅ |
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | Read select | ✅ |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write upload + estado extracción | ✅ |
| `A_Eventos` | `tblMKmDg2KrO5fMn8` | Write timeline | ✅ |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | Write override AT02 | ✅ |
| `A_DecisionesMotor` | `tbluQQtXUI0Zd8jiN` | Read decisión motor | ✅ |
| `A_ErroresMake` | `tbl46Q0BcfD57LWyQ` | Read/write errores Make | ✅ |
| `C_NotificacionesConfig` | `tbluB662ulWDaxqUY` | Read destinatarios | ✅ |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read umbrales | ✅ |
| `C_ReglasNegocio` | `tblyCb8cVTDzfeBx0` | Read por AT01 | ✅ |
| `C_AutomationsAirtable` | `tblYYtKEaPgH7GfY0` | Registro AT01/AT02/AT08 | ✅ |
| `LogEscenarios` | `tblR4VWpUHw1CSyIS` | Write logs Make | ✅ |
| `TX_Notificaciones` | `tbldgLQgjdgsOSZnt` | Write notificaciones desde SC05 | ✅ |
| `Z_EscenariosMake` | `tblYfmDoaq7Z3Vh6P` | Registro SC01 y SC05 | ⚠ **Vacía**; poblar al importar los JSON de SC01/SC05. |
| `Z_Webhooks` | `tblovY0Bt1Avhdgdx` | Registro URLs webhook SC01 y SC05 | ✅ |

**Vistas Airtable requeridas para IF-02**: `Activas`, `SLA en riesgo (amb/rojo)`, `Por reasignar (>48h sin actividad)`, `Bloqueadas por cliente`, `Aprobadas pendientes de entrega`, `Mi cartera` (por `ejecutiva_asignada` = usuario Clerk).

---

## 1.4 Automatizaciones aplicables a IF-02

| Código | Trigger | Qué invoca la UI | Qué debe existir en Airtable/Make | Estado |
|---|---|---|---|---|
| **SC01** (Make) | Submit válido de "Nueva solicitud interna" (P3) | `POST` webhook Make desde Route Handler `/api/webhooks/crear` con firma HMAC-SHA256 (D-03) | Escenario Make: recibe webhook de IF-02 + módulo Airtable Create Record en `TX_Solicitudes` (estado=`creada`, `origen_canal=ingreso_manual`, `ejecutiva_asignada`=usuario Clerk) + `POST` `LogEscenarios`. Encadena AT01→AT02 en Airtable. | ❌ **Pendiente**: falta JSON exportable para importar en Make y activar (BQ-3). |
| **AT01** (Airtable Script) | `TX_Solicitudes.estado = creada` | Ninguno (se dispara solo al insertar) | Script + `C_ReglasNegocio` + escritura a `A_DecisionesMotor` | ✅ **`On`** confirmado en Airtable Automations. |
| **AT02** (Airtable Script) | Post AT01 o actualización del campo trigger *(nombre exacto a confirmar con Ingeniero Airtable mirando configuración de AT02 — ver H-04 en auditoría)* | La UI actualiza el campo trigger vía Route Handler `/api/webhooks/asignar` cuando se cumplen precondiciones §1.5 | Script AT02 valida precondiciones (tasador+visador+fecha_visita), fija `estado=asignada`, respeta asignación previa si existe (D-04) y registra `A_Cambios(motivo=override_manual)`; escribe `A_Eventos`. | ✅ **`On`** confirmado en Airtable Automations. |
| **SC05** (Make) | Transición `creada → asignada` en Airtable (disparado por AT02) | Ninguno (encadenado desde AT02) | Escenario Make: recibe webhook desde Airtable Automation · envía email vía **Gmail** (transitorio) al tasador entrante con link a IF-03 · registra en `TX_Notificaciones`. **Nota**: la cuenta emisora migrará al servidor de correo VProperty en un CU posterior; el escenario debe aislar el módulo Gmail para facilitar el swap. | ❌ **Pendiente**: falta JSON exportable para importar en Make y activar (BQ-3). |
| **AT08** (Airtable Scheduled) | Cron 08:00 diario | Ninguno; la UI sólo consume la vista "SLA en riesgo" | Script AT08 + `C_SLA` + escribe `TX_Notificaciones` | ❌ **Pendiente**: falta el script para pegar en Airtable Automations y dejarlo `On` (BQ-4 residual). |
| **RF-09 · Extracción con Claude API** (nuevo, era SC07) | Upload de adjunto en P3 o desde `TabAdjuntos` | `POST` webhook Make desde Route Handler `/api/extraccion/iniciar` tras subir a Dropbox | Escenario Make: llama Claude API para extracción → escribe `TX_DatosTasacion` + `TX_DocumentosLegales` + actualiza `TX_Adjuntos.estado_extraccion`. **Diseñado para reuso en IF-03/IF-04/IF-05**. | ⚙ **En construcción como RF-09** dentro de este CU (D-05 revocada). Genera JSON en la misma tanda que SC01/SC05. |

**Escenarios Make ya activos y NO usados por IF-02**: E1_Airtable_Make (5748459), E2_Carbone_Render (5750023), E3_Carbone_Download_Dropbox (5791413). Pertenecen al flujo `pdf_listo` (IF-04 aguas abajo).

**Escenario fuera de alcance CU-002**: **SC13** (reasignación / cambio prioridad / pausa). IF-02 no lo invoca. Las acciones existen en la UI y actualizan Airtable + `A_Eventos`, pero **no envían email**. Se documenta como deuda técnica para un CU posterior.

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

Comportamiento UI:

- El botón está **habilitado sólo si** las tres condiciones son verdaderas. En caso contrario permanece **deshabilitado** (opacidad reducida).
- Al pasar el cursor por el botón deshabilitado se muestra tooltip con el mensaje humano exacto:

  > **"Para pasar a asignada falta: tasador · visador · fecha de visita."**
  > *(Blueprint §6.2 — texto literal, no admite variación.)*

- Sólo se listan los faltantes reales, separados por " · ". Si sólo falta la fecha: *"Para pasar a asignada falta: fecha de visita."*
- La lógica de habilitación es **presentacional pura** (feedback UX rápido). La transición real la ejecuta **AT02** en Airtable tras validación server-side idéntica.
- Al presionar el botón habilitado: la UI invoca `POST /api/webhooks/asignar` (server-side). El Route Handler actualiza el campo trigger de AT02 en `TX_Solicitudes` *(nombre exacto pendiente de confirmar con Ingeniero Airtable — H-04 abierto)* vía API de Airtable. AT02 dispara y realiza la transición.
- Mientras espera, la UI muestra spinner + estado optimista `asignando…`. Al confirmar transición:
  - Toast verde: **"Solicitud asignada a {nombre_tasador}"** (§6.4).
  - Panel se refresca desde Airtable; `EventTimeline` muestra el nuevo evento.
  - En segundo plano **SC05** notifica al tasador por email (no bloqueante para la UI).
- Ante error AT02/SC05: toast rojo humano (§6.5) — nunca error técnico crudo. AT02 respeta la asignación manual previa si existe (D-04) y registra `A_Cambios(motivo=override_manual)`.

---

## 1.6 Conflictos v0.dev ↔ especificación (estado tras respuestas D-01…D-08)

| # | Conflicto | Fuente v0 | Fuente spec | Resolución aplicada | Impacto |
|---|---|---|---|---|---|
| C-01 | Reasignación de **visador** desde la barra de acciones | v0 y Blueprint §7.2 permiten "asignar/reasignar tasador y visador" | Spec v1.4 §1.6 Nota v0: *"la Ejecutiva no reasigna Visador desde la barra de acciones"* | **D-01 aprobada**: prevalece Spec v1.4. Acción oculta; el dato queda visible en `TabDatos`, sin acción. | Bajo. |
| C-02 | Datos mock vs Airtable real | `components/dashboard/mock-data.ts`, `lib/tasador-store.ts`, `lib/tasaciones.ts` | Spec v1.4: Route Handlers con token Airtable server-side; escrituras vía Make | Reemplazar mocks por `fetch` desde Route Handlers server-side. Tipos TS derivados del schema real (snapshot MCP). | Alto (rewrite total de la capa de datos del prototipo). |
| C-03 | Versión Next.js | Blueprint declara Next.js 14 | Spec v1.4 y v0 real: Next.js 16.2.6 (RT-01 conserva 14 como piso mínimo) | Usar 16.2.6 real; RT-01 sigue vigente. | Nulo. |
| C-04 | `asChild` de Radix | Frecuente en snippets estándar shadcn | Blueprint §4.4 + Spec §1.8: usar `render` prop + `nativeButton` sobre `@base-ui/react` | Blueprint §4.4 es ley. Cualquier snippet con `asChild` se refactoriza a `render`. | Medio. |
| C-05 | `tailwind.config.js` | Shadcn tradicional lo requiere | Spec/Blueprint: tokens en `@theme` dentro de `app/globals.css` | No crear `tailwind.config.js`. Custom properties en `:root` vía arbitrary values. | Alto. |
| C-06 | Sticky action bar en `DetallePanel` | Idiomático en dashboards | Blueprint §4.4: evitar sticky cuando conviven portales Select | Botones inline al final de la cabecera del panel; no sticky bottom bar. | Bajo. |
| C-07 | Comportamiento "Crear solicitud" bloqueado por documentos | v0 heredado: botón deshabilitado hasta que todo esté válido | Spec v1.4 §1.5.1.1: sólo bloquea si un doc marcado no tiene archivo | Alinear al Spec v1.4: `disabled` sólo si `docsFaltantes > 0`. El sheet actual ya lo hace correctamente ✅. | Nulo. |
| C-08 | Notificación en reasignación / cambio prioridad / pausa | v0: por definirse | Spec v1.4 §1.6: SC13 notifica al destinatario | **SC13 fuera de alcance CU-002**. La acción se ejecuta en UI + Airtable + `A_Eventos`, sin email. Registrar como deuda técnica para CU posterior. | Bajo (se documenta explícitamente). |
| C-09 | `next-themes` requerido por sonner | En `package.json` v0 | No mencionado en spec | Mantener; no exponer toggle de tema en IF-02. | Nulo. |
| C-10 | Nombres de campo en `TX_Solicitudes` | Plan borrador asumía `op_cliente`, `sucursal`, `ejec_solicitante` | Schema real: `n_operacion_cliente` (number), `sucursal_originadora ` (con espacio), `ejecutivo_solicitante` | **D-08 opción C aplicada**: corregir espacio final en Airtable; mantener los otros dos nombres reales; adaptar tipos TS. | Medio (una sola corrección en Airtable + tipos TS). |
| C-11 | Campos ausentes: `notas_tasador`, `notas_visador`, `ejecutiva_asignada` | Plan borrador los asumía | No existen en schema real | **D-08 + D-02 aplicadas**: crear los tres campos en `TX_Solicitudes` (multilineText para notas; link a `M_Usuarios` para `ejecutiva_asignada`). | Medio. |
| C-12 | Campos `disponible` y `casos_en_curso` en `M_Tasadores` | Plan borrador los asumía · MCP snapshot 04-jul-2026 no los encontró en Airtable real | **Sí están definidos** en tres fuentes canónicas: Capa Datos v2.6.2 (`disponible` = Formula `IF(casos_en_curso < capacidad_activa, TRUE, FALSE)`; `casos_en_curso` = Count link a `TX_Solicitudes` activas) · Motor Cálculo v2.5 (PASO 3: `WHERE disponible = TRUE`; PASO 4: `ORDER BY casos_en_curso ASC`) · Blueprint v2.7 §7.2 ("disponible=true, zona compatible; despliega carga (casos_en_curso/capacidad)") | **Pendiente Ingeniero Airtable**: crear `disponible` (Formula) y `casos_en_curso` (Count link) en M_Tasadores si no existen en la instancia real. El Route Handler `/api/tasadores` debe filtrar por `disponible = TRUE` y ordenar por `casos_en_curso ASC`. | Medio (creación en Airtable + uso en Route Handler). |

---

## 1.7 Estrategia de construcción — iteración por RF con Claude Code

**Cambio de método respecto a v1.1**: la construcción NO se hace por cinco subagentes paralelos entregando ramas simultáneas. Se hace por **una RF por sesión de Claude Code**, con validación en Railway entre iteraciones. Rationale del panel: el contexto de Claude Code se degrada con inputs muy largos (más errores silenciosos), cada pieza se valida antes de la siguiente, los commits quedan limpios (uno por RF), y un rollback es de minutos si algo se rompe.

### 1.7.1 Documentos fuente (a preparar antes de la primera sesión)

Tres documentos viven en `/docs/` y son la **fuente de verdad permanente** que Claude Code consulta al inicio de cada sesión:

| Archivo | Contenido | Generado por |
|---|---|---|
| `/docs/diseno.md` | Diseño funcional y visual: componentes, estados, mensajes literales, flujos por RF, wireframes en referencia. Traducción legible del Blueprint v2.7 + Spec v1.4 aplicada a IF-02. | Opus 4.7 (esta sesión o siguiente) |
| `/docs/construccion.md` | Guía de construcción por RF: prompts base para Claude Code, orden de merge, criterios de aceptación, cómo validar en Railway. Traducción operativa de este plan (§1.7). | Opus 4.7 |
| `/docs/schema-airtable.md` | Snapshot MCP del schema: TABLE_IDs, FIELD_IDs, tipos, links, con nota de campos creados por D-08. | Ya listo en §1.3; se exporta como archivo aparte para consumo por Claude Code. |

### 1.7.2 Ciclo por RF (regla dorada: una RF = una sesión = un commit = un despliegue = una validación)

Cada sesión con Claude Code sigue exactamente estos pasos:

1. **Abrir sesión** con el prompt de arranque estándar: *"Lee `/docs/diseno.md`, `/docs/construccion.md` y `/docs/schema-airtable.md`. Vamos a implementar RF-XX."*
2. **Claude Code construye sólo esa RF-XX completa** (UI + hooks + tipos + tests si aplica). Sin tocar otras RF.
3. **Push a GitHub** (con GitHub Desktop desde WSL2 · `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva`).
4. **Railway despliega automáticamente**.
5. **Validación humana** en `https://if-ejecutiva-production.up.railway.app` (o `app.valueproperty.cl` cuando esté el CNAME).
6. Si OK → commit definitivo y siguiente RF. Si NO → se itera dentro de la misma sesión/RF sin tocar el resto.

### 1.7.3 Orden de implementación (mínimo viable primero)

| # | RF / Módulo | Qué entrega | Depende de |
|---|---|---|---|
| 1 | **Layout + navegación + Clerk** | `app/(ejecutiva)/layout.tsx`, header VProperty, middleware Clerk, ruta base `/consola` (D-06). | Variables Clerk en Railway (ya cargadas). |
| 2 | **RF-05 · Lista de solicitudes** (lectura) | `SolicitudesListPane`, `TabsVistas` (incluye "Mi cartera"), `FiltrosBar` con persistencia URL params (D-07), `StateBadge`, `SLABadge`, `PrioridadBadge`. Lee de `TX_Solicitudes`. | Layout · schema Airtable con `ejecutiva_asignada` creado. |
| 3 | **Detalle de solicitud** (lectura) | `DetallePanel`, `TabDatos`, `TabHistorial`, `TabAdjuntos` (sin extracción todavía). | Lista lista. |
| 4 | **Crear solicitud** (SC01) | `NewRequestSheet` completo, Route Handler `/api/webhooks/crear`, firma HMAC (D-03). | JSON de SC01 importado y activo en Make. |
| 5 | **RF-06 · Acciones sobre solicitud** | `BarraAccionesDetalle`: Pasar a asignada (Route Handler `/api/webhooks/asignar` + AT02 + SC05), Reasignar tasador, Cambiar prioridad, Pausar, Cancelar. Sin reasignar visador (D-01). Sin email de reasignación (SC13 fuera). | AT02 activo, SC05 importado y activo. |
| 6 | **RF-09 · Extracción con Claude API** | `ExtraccionStatusBadge`, Route Handler `/api/extraccion/iniciar`, hook en `FileUploadZone`. | Escenario Make de extracción importado. |
| 7 | **RF-07 y RF-08 · Cambios de prioridad con justificación + reglas de SLA** | Diálogos de justificación, integración con AT08. | AT08 activo en Airtable. |
| 8 | **QA regresivo + pulido** | Casos de prueba por RF, mensajes humanos §6 verificados, tests visuales. | Todo lo anterior. |

### 1.7.4 Regla simple

> **Una RF por sesión de Claude Code. Nunca "construye toda la consola".**

---

## 1.8 Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Dropbox App aún en Development → tokens expiran en horas | Alta | Alto | Usar la conexión OAuth `My Dropbox connection` de Make (renueva sola) para la subida desde SC-nuevo; en la UI el archivo va vía Route Handler → Make → Dropbox. No usar token directo de Dropbox en el cliente ni en `.env` del server. Alertar a admin para acelerar aprobación producción. |
| SC01 y SC05 sin JSON importable | Alta | Crítico | Bloquea la primera solicitud creada y las notificaciones. **BQ-3 activo**. Owner: Integrador Make debe producir los dos JSON a partir de la especificación §1.4. |
| Script AT08 sin crear en Airtable | Media | Medio | **BQ-4 residual**. Owner: Ingeniero Airtable produce el script y lo pega en Airtable Automations. AT08 puede quedar para la fase 7 sin bloquear las anteriores. |
| Variables `MAKE_*` en Railway pendientes | Media | Alto | Ciclo de "Crear solicitud" (RF#4) queda bloqueado hasta que se carguen. RF-05 y detalle en lectura (RF#1–3) pueden avanzar sin ellas. |
| Sesión Claude Code demasiado ambiciosa → regresiones silenciosas | Media | Alto | Regla dorada §1.7.4: una RF por sesión. Si el prompt tienta a mezclar, detener y abrir sesión nueva. |
| Confundir campos por discrepancia de nombres | Baja (post-D-08) | Alto | `/docs/schema-airtable.md` es el snapshot autoritativo; tipos TS derivados de él; test unitario que falle si un campo del schema muta. |
| Sticky-bar rompiendo portales Select | Media | Medio | Botones inline en cabecera de `DetallePanel`. Test de humo en QA con Select abierto + acción invocada. |
| `asChild` accidental en snippets copiados | Media | Medio | Linter/regex prohibiendo `asChild`; revisión obligatoria de PR que toque componentes shadcn. |
| Token Airtable filtrado al cliente | Baja | Crítico | Prohibido en `NEXT_PUBLIC_*`. Sólo en variables server-only. QA verifica en el bundle final. |
| RF-09 (Claude API) genera costos inesperados en volumen | Media | Medio | Métrica de tokens por adjunto + tope diario configurable en `.env`; log de cada llamada en `LogEscenarios`. |
| Latencia Airtable > 3 s en vistas grandes (500+ registros) | Media | Medio | Airtable views con filtro server-side; paginación por `offset`; caché `revalidate: 60` para vistas no críticas. RF-05 exige <3 s. |
| Railway trial expira sin método de pago | Alta | Crítico | Owner: Sergio agrega método de pago antes del vencimiento. |

---

## 1.9 Decisiones cerradas (respuestas D-01…D-08)

Estado tras la aprobación del propietario el 06-jul-2026. Ya no hay preguntas abiertas de diseño; el equipo puede firmar y proceder a preparar `/docs/diseno.md` y `/docs/construccion.md`.

| ID | Decisión | Resultado |
|---|---|---|
| **D-01** | Reasignación de visador por la Ejecutiva | **Ocultada**. Prevalece Spec v1.4. El dato queda visible en `TabDatos` sin acción. Aplicado en §1.2, §1.6 C-01. |
| **D-02** | Vista "Mi cartera" por ejecutiva autenticada | **Crear** `TX_Solicitudes.ejecutiva_asignada` (link a `M_Usuarios`). Aplicado en §1.3, §1.6 C-11. |
| **D-03** | Firma HMAC en webhook Make | **Header `X-VP-Signature` con HMAC-SHA256** en SC01 y SC05. Aplicado en §1.4, §1.5. |
| **D-04** | Override manual de asignación de tasador | **AT02 respeta la asignación previa** si existe y registra `A_Cambios(motivo=override_manual)`. Aplicado en §1.4, §1.5. |
| **D-05** | Extracción con Claude API (era SC07) | **REVOCADA**: pasa a **RF-09** dentro de CU-002. Diseñada para reuso en IF-03/IF-04/IF-05. Aplicado en §1.2, §1.4, orden §1.7.3 paso 6. |
| **D-06** | Ruta base de la consola | **`/consola`** (decisión del panel). Rationale: URL corta, no filtra numeración interna de CU, la app es exclusivamente la consola de la Ejecutiva. Aplicado en §1.7.3 paso 1. |
| **D-07** | Persistencia de filtros por usuario | **URL params** como fuente primaria (compartibles y con back/forward del navegador) + fallback a cookie httpOnly con la última vista abierta (decisión del panel). Aplicado en §1.2, §1.7.3 paso 2. |
| **D-08** | Reconciliación de nomenclatura Airtable ↔ spec | **Opción (C) híbrida**: corregir el espacio final de `sucursal_originadora ` en Airtable; mantener `n_operacion_cliente` y `ejecutivo_solicitante` como están; crear `notas_tasador`, `notas_visador` y `ejecutiva_asignada`. Aplicado en §1.3, §1.6 C-10 y C-11. |

---

## 1.10 Bloqueadores residuales para arrancar la primera sesión de Claude Code

Estos ítems son los únicos que restan antes de generar `/docs/diseno.md` y `/docs/construccion.md` y abrir la sesión #1 (Layout + Clerk):

| ID | Descripción | Owner | Entregable esperado |
|---|---|---|---|
| **BQ-3-a** | JSON de escenario **SC01** | Integrador Make (con soporte del panel para el payload) | Archivo `sc01_crear_solicitud.blueprint.json` importable en Make + activación en org 1594725. |
| **BQ-3-b** | JSON de escenario **SC05** | Integrador Make | Archivo `sc05_notificar_tasador.blueprint.json` importable en Make + activación. Módulo Gmail aislado para futuro swap al servidor VProperty. |
| **BQ-3-c** | JSON de escenario **RF-09 · Extracción Claude API** | Integrador Make + Panel | `rf09_extraccion_claude.blueprint.json`. Puede quedar para el paso 6 del orden §1.7.3 sin bloquear los anteriores. |
| **BQ-4-residual** | Script **AT08** | Ingeniero Airtable | `at08_sla_diario.js` para pegar en Airtable Automations + activación. Puede quedar para el paso 7. |
| **D-08-ejecución** | Ajustes de schema en Airtable | Ingeniero Airtable | (a) Renombrar `sucursal_originadora ` → `sucursal_originadora` (quitar espacio); (b) crear campos `notas_tasador`, `notas_visador`, `ejecutiva_asignada`; (c) verificar existencia de `M_Usuarios` y su TABLE_ID; (d) crear `disponible` (Formula) y `casos_en_curso` (Count link) en `M_Tasadores` si no existen. |
| **Railway `MAKE_*`** | Variables de entorno | Sergio | `MAKE_WEBHOOK_URL_SC01`, `MAKE_WEBHOOK_URL_SC05`, `MAKE_WEBHOOK_URL_RF09`, `MAKE_HMAC_SECRET`. Quedan **pendientes** por decisión del propietario; sin ellas se puede avanzar hasta el paso 3 del orden §1.7.3. |

---

**Estado**: aprobado en decisiones de diseño (D-01…D-08). Próximo hito: generar `/docs/diseno.md` y `/docs/construccion.md`, cerrar BQ-3-a, BQ-3-b y D-08-ejecución, y abrir la primera sesión de Claude Code con el paso 1 del orden §1.7.3 (Layout + Clerk).
