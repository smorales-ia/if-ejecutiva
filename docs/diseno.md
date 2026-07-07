# diseno.md · VProperty · IF-02 · CU-002

> **Versión**: 1.2 · Alineado a Blueprint v2.7 · Auditoría v1.2 (06-jul-2026)
> **Fuentes canónicas**: Blueprint Interfaces v2.7 §2.2 + §7.2 · Especificación v1.4 · Capa Datos v2.6.2 · Plan v1.2
> **Propósito**: diseño funcional y visual de IF-02 para Claude Code. Leer al inicio de cada sesión junto con `schema-airtable.md` y `construccion.md`.
> **Principio rector**: la UI muestra y captura; nunca decide. Todo estado, regla, asignación y cálculo vive en Airtable.

---

## 1. Contexto y contrato operacional

IF-02 es la **Consola de la Ejecutiva Comercial** de VProperty (Tasaciones · Bienes Raíces, Chile). Es una interfaz **Tipo A**: código propio con Next.js 16.2.6 + Clerk + Railway.

| Campo | Valor |
|---|---|
| Código | IF-02 · Capacidad C-2 (gestión comercial y bandeja operativa) |
| Tipo | A — Next.js 16.2.6 + Clerk · Railway |
| Etapa del workflow | Recepción → Asignación |
| Patrón UI | P2 · Lista + Detalle |
| Ruta base | `/consola` |
| Usuario principal | Ejecutivo comercial |

**Contrato operacional**

- **Entradas**: `TX_Solicitudes` (cartera del ejecutivo filtrada por SLA), `M_Tasadores` (activos con `disponible=TRUE`, zona compatible), `M_Visadores` (por `especialidades`), `M_Clientes`, `A_Eventos` (cronología del caso).
- **Acciones**: crear alta interna, editar campos no-cálculo, asignar/reasignar tasador, fijar fecha de visita, cambiar prioridad, pausar, cancelar. **Acción primaria**: `Pasar a asignada`.
- **Salidas**: `TX_Solicitudes` (insert/update, `origen_canal=ingreso_manual`), `A_Eventos` (alta · asignación · cambios), `A_Cambios` (override de AT02).
- **Estado destino**: `creada → asignada` — bloqueado hasta que existan tasador + visador + `fecha_visita_programada`. La transición la ejecuta AT02; SC05 notifica al tasador.

---

## 2. Máquina de estados — TX_Solicitudes.estado

Once estados oficiales (Capa Datos v2.6.2). IF-02 opera principalmente sobre `creada` y `asignada`.

```
∅ ──[IF-01 / IF-02 alta interna]──→ creada
                                       │
                            [IF-02 Pasar a asignada + AT02]
                                       │
                                    asignada ──[IF-02 Cancelar]──→ cancelada
                                       │
                             [IF-03 Enviar visita]
                                       │
                                    visitada
                                       │
                              [AT03 DAG fórmulas]
                                       │
                                    calculada
                                       │
                           [SC09 generar PDF Carbone]
                                       │
                                   pdf_listo
                                    /      \
                      [IF-04 Aprobar]      [IF-04 Devolver]
                           /                    \
                        aprobada             devuelta → asignada
                        │    \
               [AT07: ¿req F5?]  [envío directo]
                      │
               pendiente_final
                      │
              [IF-05 Enviar]
                      │
                  entregada
                      │
           [AT10 archivado T+N días]
                      │
                   cerrada

requiere_atencion  (estado lateral · cualquier etapa)
cancelada          (estado terminal · cualquier etapa)
```

**Regla IF-02**: la consola solo puede transicionar `creada → asignada` (acción primaria) y `(cualquiera) → cancelada`. El resto de transiciones las ejecutan automatizaciones.

---

## 3. Componentes — inventario y responsabilidad

Origen v0 = deploy `if-ejecutiva-gfvE6z3qTyX`.

| Componente | Archivo destino | Origen | Patrón | RF |
|---|---|---|---|---|
| `AppShell` + header VProperty | `app/(ejecutiva)/layout.tsx` | v0 | — | Layout |
| `SolicitudesListPane` | `components/console/lista-solicitudes.tsx` | v0 | P1/P2 (cola) | RF-05 |
| `TabsVistas` | `components/console/tabs-vistas.tsx` | v0 mock | — | RF-05 |
| `FiltrosBar` | `components/console/filtros-bar.tsx` | v0 | — | RF-05 |
| `StateBadge` (11 estados) | `components/vp/state-badge.tsx` | CU-000.A | — | RF-05 |
| `SLABadge` (verde/ámbar/rojo) | `components/vp/sla-badge.tsx` | CU-000.A | — | RF-05 |
| `PrioridadBadge` | `components/console/prioridad-badge.tsx` | nuevo | — | RF-05 |
| `DetallePanel` (cascarón P2) | `components/console/detalle-panel.tsx` | v0 | P2 (detalle) | RF detalle |
| `TabDatos` | `components/console/tab-datos.tsx` | v0 | — | RF detalle |
| `TabHistorial` | `components/console/tab-historial.tsx` | v0 | — | RF detalle |
| `TabAdjuntos` | `components/console/tab-adjuntos.tsx` | v0 parcial | — | RF detalle |
| `ExtraccionStatusBadge` | `components/vp/extraccion-status-badge.tsx` | ❌ nuevo | — | RF-09 |
| `NewRequestSheet` | `components/console/new-request-sheet.tsx` | v0 | P3 | RF crear |
| `RUTField` | `components/vp/rut-field.tsx` | CU-000.A | — | RF crear |
| `EmailField` | `components/vp/email-field.tsx` | CU-000.A | — | RF crear |
| `AddressField` | `components/vp/address-field.tsx` | CU-000.A | — | RF crear |
| `RegionComunaSelector` | `components/vp/region-comuna-selector.tsx` | CU-000.A | — | RF crear |
| `DocumentChecklist` | `components/vp/document-checklist.tsx` | v0 | — | RF crear |
| `FileUploadZone` | `components/vp/file-upload-zone.tsx` | CU-000.A | — | RF crear |
| `ReasignarTasadorDialog` | `components/console/reasignar-tasador-dialog.tsx` | v0 | — | RF-06 |
| `BarraAccionesDetalle` | `components/console/acciones-detalle.tsx` | v0 | — | RF-06 |
| `EventTimeline` | `components/vp/event-timeline.tsx` | CU-000.A | — | RF detalle |
| `lib/airtable-client.ts` | `lib/airtable-client.ts` | ❌ nuevo | — | RF-05 |
| `lib/make-client.ts` | `lib/make-client.ts` | ❌ nuevo | — | RF crear |
| `lib/claude-extractor.ts` | `lib/claude-extractor.ts` | ❌ nuevo | — | RF-09 |
| `lib/schemas.ts` (zod) | `lib/schemas.ts` | v0 parcial | — | RF-05 |
| `middleware.ts` (Clerk) | `middleware.ts` | ❌ nuevo | — | Layout |

---

## 4. Patrón UI — P2 Lista + Detalle

Diseño fundamental de IF-02. La cola (izquierda) lista solicitudes de la cartera. Al seleccionar una, el panel de detalle (derecha) carga el registro completo sin recargar la página.

```
┌─────── COLA ──────────────┐  ┌──────── DETALLE · VP-2026-XXXX ──────────────┐
│ [buscar...] [Cliente▼]    │  │ VP-2026-0524 · MetLife · Las Condes          │
│ [Estado▼] [SLA▼] [+ Nueva]│  │ ● asignada  🟡 SLA +1  [Urgente]            │
│ ──────────────────────── │  │ ────────────────────────────────────────────  │
│ ▣ VP-0519 pdf_listo 🔴    │  │ Tabs: [Datos] [Historial] [Adjuntos]         │
│ ▢ VP-0521 asignada 🟡     │  │ ────────────────────────────────────────────  │
│ ▢ VP-0524 creada  🟢      │  │ contenido de la pestaña activa               │
│ ...                       │  │ ────────────────────────────────────────────  │
│ TabsVistas:               │  │ ACCIONES (barra inline · no sticky):         │
│ Activas | SLA riesgo |    │  │ [Pasar a asignada] [Reasignar] [Prioridad]   │
│ Por reasignar | Mi cartera│  │ [Pausar] [Cancelar]                          │
└───────────────────────────┘  └──────────────────────────────────────────────┘
```

**Reglas del patrón P2 en IF-02**:
- Refresh tras acción: al transicionar estado, la cola elimina el registro procesado; se selecciona automáticamente el siguiente.
- Edición sin guardar implícita: cambios en el detalle se persisten al disparar la acción primaria; un draft local protege ante cierre accidental.
- Barra de acciones **inline** en la cabecera del panel — **nunca sticky** (§4.4; evita colisión con portales Select en TabDatos).

**TabsVistas** (6 vistas):
1. **Activas** — todas en estado no cerrado/cancelado
2. **SLA en riesgo** — `semaforo_sla` = ámbar o rojo
3. **Por reasignar** — sin actividad >48h en `asignada`
4. **Bloqueadas por cliente** — sin respuesta del cliente
5. **Aprobadas pendientes de entrega** — `estado = pendiente_final`
6. **Mi cartera** — filtradas por `ejecutiva_asignada` = usuario Clerk autenticado

---

## 5. Panel Detalle — estructura de pestañas

### Tab Datos

Campos agrupados en secciones. Editables si la solicitud no está cerrada.

**Sección Datos de la Tasación**

| Campo UI | Tipo | Obl. | Tabla · Campo | Validación |
|---|---|---|---|---|
| Cliente / institución | Link | Sí | `M_Clientes` → `.cliente` | Solo `activo=true` |
| Tipo de informe | Select | Sí | `M_TiposInforme` → `.tipo_informe` | Filtrado por M_Clientes.productos |
| Tipo de propiedad | Select | Sí | `M_TiposPropiedad` → `.tipo_propiedad` | Lista cerrada |
| Dirección | Texto | Sí | `TX_Solicitudes.direccion` | Mín. calle + número; sugerencia Google Places |
| Región | Select | Sí | derivado de `M_Comunas` | Cascada |
| Comuna | Link | Sí | `M_Comunas` → `.comuna` | Debe existir; autocompletable desde dirección |

**Sección Solicitante**

| Campo UI | Tipo | Obl. | Tabla · Campo | Validación |
|---|---|---|---|---|
| Nombre propietario | Texto | Sí | `.cliente_final_nombre` | — |
| RUT propietario | Texto | Sí | `.cliente_final_rut` | Módulo 11 (RN-15); formateo en vivo |
| Email contacto | Email | Sí | `.email_contacto` (campo email operacional) | Formato válido |
| Teléfono contacto | Texto | No | `.solicitante_telefono` | — |

**Sección Producto / Financiero**

| Campo UI | Tipo | Obl. | Tabla · Campo | Validación |
|---|---|---|---|---|
| N° operación cliente | Número | Sí (alta interna) | `.n_operacion_cliente` (`fldb1vmKk7y3hi4uY`) | Entero; tipo `number` en schema real (H-07) |
| Banco financista | Link | Cond. | `M_Bancos` → `.banco` | Obligatorio si producto ∈ {Hipotecario, Refinanciamiento} |
| Producto | Select | Sí (alta interna) | `M_Productos` → `.producto` | Filtrado por cliente |
| Canal de origen | Select | Sí (alta interna) | `.origen_canal` | Auto `ingreso_manual` en alta interna |
| Sucursal originadora | Texto | Sí (alta interna) | `.sucursal_originadora` (`fldd56pLZyKYoi2Vi`) | Referenciar por FIELD_ID hasta corregir espacio (D-08) |
| Ejecutivo solicitante | Texto | Sí (alta interna) | `.ejecutivo_solicitante` (`fldRweQyq3tTQGmPR`) | — |

**Sección Asignación**

| Campo UI | Tipo | Obl. | Tabla · Campo | Validación |
|---|---|---|---|---|
| Tasador asignado | Link | Cond. | `M_Tasadores` → `.tasador` | `activo=true` · `disponible=TRUE` · zona en `zonas_cobertura`. Obligatorio para pasar a asignada |
| Visador | Link | Cond. | `M_Visadores` → `.visador` (`fldhm86amyekWsEFY`) | `activo=true` · `especialidades ∋ tipo_propiedad`. La Ejecutiva **no** reasigna visador (D-01) — campo visible, sin acción |
| Fecha estimada de visita | Fecha | Cond. | `.fecha_visita_programada` (`fldPUFd9YuQdkcrOI`) | `>= hoy`. Obligatoria para pasar a asignada |
| Prioridad | Select | No | `.prioridad` (`fld9FKZ9siAeSsH54`) | Normal · Urgente · Crítico. Cambio a Urgente/Crítico exige justificación (RF-07) |
| Ejecutiva asignada | Link | Sí | `.ejecutiva_asignada` → AUTH_Usuarios (`tblbX3hPD2uhqhl5v` · RF-52) (⚙ crear D-08) | Auto = usuario Clerk de la sesión. Alimenta "Mi cartera" |
| Notas para el tasador | Texto largo | No | `.notas_tasador` (⚙ crear D-08) | — |
| Notas para el visador | Texto largo | No | `.notas_visador` (⚙ crear D-08) | — |
| Observaciones internas | Texto largo | No | `.observaciones_internas` | — |

**Campos de solo lectura (auto-calculados)**

| Campo UI | Tabla · Campo | Tipo |
|---|---|---|
| Código solicitud | `.codigo_ext` (`fldSuJx1fDNYYwDcD`) | Formula VP-AAAA-NNNN |
| Estado | `.estado` | Single select; modifica solo AT02/AT03/etc. |
| SLA semáforo | `.semaforo_sla` (`fldW4oUq7LvQUZq7W`) | Formula verde/ámbar/rojo |
| Decisión del motor | `A_DecisionesMotor` → regla ganadora + candidatas | Read-only |

### Tab Historial

Renderiza `A_Eventos` usando el componente `EventTimeline` (CU-000.A). Orden cronológico descendente (más reciente arriba). Incluye también entradas de `A_Cambios` cuando el override de AT02 es manual.

### Tab Adjuntos

Lista de `TX_Adjuntos` de la solicitud. Para cada adjunto:
- Nombre del archivo, tipo, tamaño
- `ExtraccionStatusBadge`: estado de la extracción RF-09 (`idle · extrayendo · listo · error`)
- Botón de descarga/vista previa

`FileUploadZone` (CU-000.A): sube por streaming vía Route Handler → Make → Dropbox. Al confirmar subida, encadena RF-09 en background.

---

## 6. Botón "Pasar a asignada" — precondiciones exactas

Fuente: Blueprint §7.2 · Spec v1.4 §1.3 · RN-09.

```
puede_pasar_a_asignada = (
  TX_Solicitudes.estado === "creada"
  AND TX_Solicitudes.tasador  IS NOT NULL   // M_Tasadores.activo=true, zonas_cobertura ∋ comuna
  AND TX_Solicitudes.visador  IS NOT NULL   // M_Visadores.activo=true, especialidades ∋ tipo_propiedad
  AND TX_Solicitudes.fecha_visita_programada IS NOT NULL  // fecha >= hoy
)
```

**Comportamiento UI**:
- Botón **habilitado** solo si las tres condiciones son verdaderas.
- Si falta alguna: botón deshabilitado (opacidad reducida) con tooltip del mensaje humano §8.
- Al pulsar: UI invoca `POST /api/webhooks/asignar` (server-side). Route Handler actualiza el campo trigger AT02 en `TX_Solicitudes` (H-04 — nombre pendiente). AT02 valida y transiciona.
- Spinner inline + estado optimista `asignando…` mientras espera.
- Al confirmar: toast verde §8 + refresh del panel + EventTimeline actualizado.
- SC05 notifica al tasador por email en segundo plano (no bloqueante).
- AT02 respeta la asignación manual previa si existe y registra `A_Cambios(motivo=override_manual)` (D-04).

---

## 7. Acciones disponibles — barra inline

| Acción | Estados habilitados | Resultado | Automatización |
|---|---|---|---|
| **Pasar a asignada** | `creada` + precondiciones §6 | `creada → asignada` | AT02 + SC05 |
| **Reasignar tasador** | `creada`, `asignada` | override de tasador; `A_Cambios(motivo=override_manual)` | ninguna (SC13 fuera de alcance) |
| **Cambiar prioridad** | cualquier activo | actualiza `.prioridad` + `A_Eventos` | ninguna (SC13 fuera de alcance) |
| **Pausar** | `asignada`, `visitada` | actualiza estado a `requiere_atencion` + `A_Eventos` | ninguna (SC13 fuera de alcance) |
| **Cancelar** | cualquier activo no entregado | `(cualquiera) → cancelada` + `A_Eventos(tipo=solicitud_cancelada)` | ninguna |

**Nota**: las acciones de reasignación/prioridad/pausa actualizan Airtable + `A_Eventos` pero **no envían email** en CU-002. SC13 queda como deuda técnica para un CU posterior.

**Restricción D-01**: la Ejecutiva **nunca** reasigna el visador desde la barra de acciones. El campo `visador` es visible en TabDatos pero sin botón de acción. (Fuente: Spec v1.4 §1.6 Nota v0.)

---

## 8. Mensajes humanos canónicos (literales — no admiten variación)

Fuente autoritativa: Blueprint v2.7 §6 · Plan v1.2.

### Validaciones bloqueantes

**Botón "Pasar a asignada" deshabilitado** (uno o más faltantes):

> **"Para pasar a asignada falta: tasador · visador · fecha de visita."**

Sólo se listan los faltantes reales, separados por ` · `. Si solo falta la fecha:

> **"Para pasar a asignada falta: fecha de visita."**

**RUT inválido** (`RUTField`):

> **"Necesitamos el RUT del propietario con su dígito verificador. Ej.: 12.345.678-9."**

**Email inválido**:

> **"Revisa el email de contacto: debe ser de la forma nombre@dominio.cl."**

**Dirección incompleta**:

> **"Ingresa la dirección con calle y número. Ej.: Av. Apoquindo 5230."**

### Confirmaciones (toasts verdes — sonner `success`)

**Solicitud asignada exitosamente**:

> **"Solicitud asignada a {nombre_tasador}"**

**Solicitud reasignada**:

> **"Solicitud reasignada a {nombre_tasador}"**

**Solicitud creada** (alta interna):

> **"Solicitud creada con {n} documento(s) adjunto(s)."** *(pluraliza según n; si n=0: "Solicitud creada.")*

### Advertencias (ámbar · no bloqueantes)

**Tasador fuera de cobertura** (banner en `ReasignarTasadorDialog`):

> **"Este tasador no cubre la comuna de la solicitud. Puedes continuar; quedará registrado como override."**

**Documento marcado sin archivo** (tooltip botón "Crear solicitud"):

> **"Faltan {n} documento(s) marcado(s) sin archivo."**

### Errores de red / Make

> **"No pudimos completar la acción. Intenta nuevamente en unos segundos."**

### Estilo general (§6.1 y §6.5 Blueprint)

- Voz en segunda persona singular ("Necesitas…", "Falta…").
- Sin signos de exclamación.
- Sin culpar al usuario ni exponer errores técnicos.
- Errores bajo el campo, no al final del formulario.

---

## 9. Tokens de color y design system

### Paleta corporativa VProperty

| Token | HEX | Uso |
|---|---|---|
| Azul VProperty (primario) | `#075899` | Headings H1/H2 · navbars · cabeceras · botones primarios |
| Azul profundo | `#054070` | Portadas · separadores · fondos header modal |
| Azul claro | `#0064B4` | Enlaces · hover de botones · H3 |
| Naranja VProperty (acento) | `#F5A213` | Flecha logo · icono de marca · badges de versión. **No usar para alertas** |
| Naranja claro | `#FCD9A1` | Fondos callout de marca |

### Código semáforo operacional

| Significado | HEX | Uso en IF-02 |
|---|---|---|
| Verde — nominal/OK | `#15803D` | SLA verde · botón "Pasar a asignada" · toast éxito |
| Ámbar — riesgo | `#D97706` | SLA amarillo · advertencias no bloqueantes · reasignación fuera de zona |
| Rojo — crítico | `#B91C1C` | SLA vencido · validación bloqueante · botón "Cancelar" |
| Azul — informativo | `#1D4ED8` | Datos neutros · indicadores de navegación |
| Púrpura — administrativo | `#6B21A8` | Acciones de configuración (no aplica en IF-02) |

**Tailwind en `app/globals.css`** (bajo `@theme`):

```css
--color-brand: #075899;
--color-brand-hover: #0064B4;
--color-brand-accent: #F5A213;
--color-op-green: #15803D;
--color-op-amber: #D97706;
--color-op-red: #B91C1C;
--color-op-blue: #1D4ED8;
```

### Botones por semántica

| Botón | Estilo |
|---|---|
| Primario (acción principal) | Fondo `#075899` · texto blanco · hover `#0064B4` |
| Secundario | Fondo blanco · borde `#075899` · texto azul |
| Pasar a asignada | Fondo `#15803D` · texto blanco (semáforo verde) |
| Cancelar / Escalar | Fondo `#B91C1C` · texto blanco (semáforo rojo) |
| Advertencia / Devolver | Fondo `#D97706` · texto blanco (semáforo ámbar) |

---

## 10. Flujos por RF (orden de implementación)

Ver Plan v1.2 §1.7.3 para rationale completo.

### RF Layout + Clerk (paso 1)

- `app/(ejecutiva)/layout.tsx`: AppShell + header VProperty (`#075899` azul, `#F5A213` naranja)
- `middleware.ts`: protección de rutas `/consola/*` con Clerk
- `app/(ejecutiva)/consola/page.tsx`: shell vacío con P2

### RF-05 · Lista de solicitudes (paso 2)

- Reemplaza `mock-data.ts` por Route Handler `GET /api/solicitudes`
- `SolicitudesListPane` con paginación (offset Airtable; `revalidate: 60` en vistas no críticas)
- `TabsVistas`: 6 vistas filtradas; "Mi cartera" filtra por `ejecutiva_asignada` (campo D-08 debe existir)
- `FiltrosBar`: persistencia por URL params (D-07) + cookie httpOnly para última vista
- `StateBadge`, `SLABadge`, `PrioridadBadge`
- Criterio de aceptación: carga <3 s con 500+ registros; filtros funcionan; "Mi cartera" muestra solo las del ejecutivo autenticado

### RF detalle (paso 3)

- `DetallePanel` con `TabDatos`, `TabHistorial`, `TabAdjuntos` (sin extracción todavía)
- Route Handlers `GET /api/solicitudes/[id]` (datos) + `GET /api/solicitudes/[id]/eventos` (A_Eventos)
- Criterio de aceptación: panel se carga al seleccionar una fila; campos read-only para estado ≠ creada/asignada; historial en orden descendente

### RF crear solicitud (paso 4)

- `NewRequestSheet` completo con secciones: Origen · Propiedad · Solicitante · Producto · Documentos · Adjuntos
- Route Handler `POST /api/webhooks/crear-solicitud` → SC01 Make con firma HMAC-SHA256 (D-03)
- Route Handler `POST /api/adjuntos/upload` → streaming → Make → Dropbox
- Criterio de aceptación: solicitud creada en `TX_Solicitudes` con `estado=creada`; `A_Eventos` registra `solicitud_creada`; bloquea solo si doc marcado sin archivo (Spec v1.4 §1.5.1.1)

### RF-06 · Acciones (paso 5)

- `BarraAccionesDetalle`: Pasar a asignada · Reasignar tasador · Cambiar prioridad · Pausar · Cancelar
- Route Handler `POST /api/webhooks/asignar` → actualiza campo trigger AT02 (H-04) → AT02 transiciona
- `ReasignarTasadorDialog` con cmdk, ficha de carga (`casos_en_curso / capacidad_activa`) y alerta fuera de cobertura
- Route Handlers de reasignación, prioridad, pausa → Airtable + `A_Eventos` (sin SC13)
- Criterio de aceptación: "Pasar a asignada" transiciona correctamente; toast §8; SC05 envía email al tasador; `A_Cambios` registra override manual si aplica; la Ejecutiva no puede reasignar visador (D-01)

### RF-09 · Extracción con Claude API (paso 6)

- `ExtraccionStatusBadge` (4 estados: idle · extrayendo · listo · error)
- Route Handler `POST /api/extraccion/iniciar` → webhook Make RF-09 → Claude API → `TX_DatosTasacion` + `TX_Adjuntos.estado_extraccion`
- Hook en `FileUploadZone`: encadena RF-09 tras confirmar Dropbox
- Criterio de aceptación: badge actualiza en tiempo real; errores muestran mensaje humano §8; cada llamada loggea en `LogEscenarios`

### RF-07/RF-08 · Prioridad con justificación + reglas SLA (paso 7)

- Diálogo de justificación obligatoria al cambiar prioridad a Urgente/Crítico
- Integración con `AT08` (script SLA diario; requiere que AT08 esté activo en Airtable)

### QA regresivo + pulido (paso 8)

- Casos de prueba por RF, mensajes humanos §8 verificados, tests unitarios de validaciones bloqueantes

---

## 11. Contratos de Route Handlers

### GET /api/solicitudes

- Autenticación: JWT Clerk validado server-side
- Filtros desde URL params: `cliente`, `estado`, `sla`, `desde`, `hasta`, `view`
- Vista `mi_cartera`: filtra `TX_Solicitudes.ejecutiva_asignada` = userId Clerk
- Paginación: `offset` + `pageSize` (default 25, max 50)
- Respuesta: array de `SolicitudResumen` (código, cliente, estado, semáforo_sla, prioridad, tasador, fecha_visita_programada)
- Cache: `revalidate: 60` para vistas no críticas; sin cache para SLA en riesgo

### GET /api/solicitudes/[id]

- Devuelve `SolicitudDetalle` completo (todos los campos de TX_Solicitudes + lookups)
- Incluye `A_DecisionesMotor` de la solicitud (regla ganadora + candidatas)
- Sin cache

### POST /api/webhooks/crear-solicitud

- Body: payload de nueva solicitud validado con Zod
- Firma HMAC-SHA256 header `X-VP-Signature` (D-03)
- Llama SC01 Make → Airtable `TX_Solicitudes(estado=creada, origen_canal=ingreso_manual)`
- Loggea en `LogEscenarios`

### POST /api/webhooks/asignar

- Body: `{ solicitud_id, tasador_id, visador_id, fecha_visita_programada }`
- Valida precondiciones §6 server-side (red de seguridad)
- Actualiza campo trigger AT02 en `TX_Solicitudes` (H-04 — nombre pendiente)
- Si la asignación es override manual: escribe `A_Cambios(motivo=override_manual)`
- AT02 en Airtable completa la transición y dispara SC05

### POST /api/adjuntos/upload

- Streaming: Route Handler → Make → Dropbox (nunca token Dropbox en el cliente)
- Al completar: escribe `TX_Adjuntos` con `estado_extraccion=idle`
- Encadena `/api/extraccion/iniciar` en background

### POST /api/extraccion/iniciar

- Body: `{ adjunto_id, solicitud_id }`
- Llama webhook Make RF-09 → Claude API
- Actualiza `TX_Adjuntos.estado_extraccion = extrayendo` antes de llamar
- Loggea en `LogEscenarios`

### POST /api/webhooks/reasignar, /prioridad, /pausar

- Actualizan `TX_Solicitudes` directamente vía Airtable API (sin Make)
- Escriben `A_Eventos` con tipo y descripción correspondientes
- No invocan SC13 (fuera de alcance CU-002)

---

## 12. Restricciones técnicas transversales (§4.4 Blueprint · INNEGOCIABLES)

1. **Tailwind CSS v4** — tokens en `@theme` dentro de `app/globals.css`. **Nunca crear `tailwind.config.js`**.
2. **`@base-ui/react 1.5`, no Radix** — todos los primitivos UI de `@base-ui/react`. Si un snippet usa `asChild`, refactorizar a `render` prop. Ejemplo: `<SheetTrigger render={<Button>Abrir</Button>} />`.
3. **Imports nombrados explícitos de shadcn** — nunca rutas alternativas.
4. **Sin sticky action bar** donde conviven portales `Select` — botones inline en la cabecera del `DetallePanel`.
5. **Token Airtable exclusivamente server-side** — `AIRTABLE_TOKEN` en variables server-only. Nunca `NEXT_PUBLIC_AIRTABLE_*`.
6. **Escrituras de negocio vía Make** (SC01, asignar) con firma HMAC-SHA256 `X-VP-Signature`. No escribir `TX_Solicitudes` directo desde la UI.
7. **Cero lógica de negocio en la UI** — el estado de la solicitud lo decide AT02/AT03; la UI solo habilita/deshabilita botones para feedback rápido.
8. **Mensajes humanos §8 son literales** — no admiten variación ni parafraseo.
9. **Una RF por sesión** — nunca "construye toda la consola" de golpe.

---

## 13. Decisiones cerradas (D-01 … D-08)

| ID | Decisión | Resultado |
|---|---|---|
| D-01 | Reasignación de visador por la Ejecutiva | **Ocultada**. Campo visible en TabDatos sin acción. |
| D-02 | Vista "Mi cartera" | Crear `TX_Solicitudes.ejecutiva_asignada` (link → AUTH_Usuarios · `tblbX3hPD2uhqhl5v` · RF-52). |
| D-03 | Firma webhook Make | `X-VP-Signature` HMAC-SHA256 en SC01 y SC05. |
| D-04 | Override manual de tasador | AT02 respeta asignación previa; registra `A_Cambios(motivo=override_manual)`. |
| D-05 (revocada) | Extracción Claude API diferida | **Revocada**: pasa a RF-09 dentro de CU-002. |
| D-06 | Ruta base | `/consola` |
| D-07 | Persistencia de filtros | URL params + cookie httpOnly como fallback. |
| D-08 | Reconciliación nomenclatura | Opción C: corregir espacio `sucursal_originadora`; crear `notas_tasador`, `notas_visador`, `ejecutiva_asignada`. |
