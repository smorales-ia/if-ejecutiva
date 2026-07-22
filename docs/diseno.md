# diseno.md · VProperty · IF-02 · CU-002

> **Versión**: 1.5 · Alineado a Blueprint v2.8 · Especificación v1.9.1 · Auditoría v1.2 (06-jul-2026) · Fase Adjuntos 1 — D-11 a D-14 (10-jul-2026) · Maqueta v1.9 integrada a `main` (22-jul-2026): wizard 3 fases, formulario 4 secciones, REGLA A (asignar tasador sin reasignación), REGLA B (validación toast+Alert), REGLA C (edición solo en creada)
> **Fuentes canónicas**: Blueprint Interfaces v2.8 §7.2 · Especificación v1.9.1 · Capa Datos v2.6.3 · Plan v1.2
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
- **Acciones**: crear alta interna, editar campos no-cálculo (sólo en estado `creada`, REGLA C), asignar tasador (única, sin reasignación formal — REGLA A), fijar fecha de visita, cambiar prioridad, pausar, cancelar. **Acción primaria**: `Asignar Tasador`.
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
| `DocumentChecklist` | `components/console/document-checklist.tsx` | v0 | — | RF crear |
| `FileUploadZone` | `components/console/file-upload-zone.tsx` | CU-000.A · reescrito Fase Adjuntos 1 | — | RF crear · **modo Opción C: state-first (`value`/`onFilesChange`), no sube al drop — sube recién al presionar "Crear solicitud" (D-12)** |
| `AdjuntosSubmitTracker` | `components/console/adjuntos-submit-tracker.tsx` | ❌ nuevo (Fase Adjuntos 1) | — | RF crear · progreso de la subida en batching tras crear la solicitud (D-12, D-14) |
| `AsignarTasadorDialog` | `components/console/asignar-tasador-dialog.tsx` | v1.9 (reemplaza `reasignar-tasador-dialog.tsx`) | — | RF-06 · REGLA A |
| `BarraAccionesDetalle` | `components/console/acciones-detalle.tsx` | v0 | — | RF-06 |
| `EventTimeline` | `components/vp/event-timeline.tsx` | CU-000.A | — | RF detalle |
| `lib/airtable-client.ts` | `lib/airtable-client.ts` | ❌ nuevo | — | RF-05 |
| `lib/make-client.ts` | `lib/make-client.ts` | ❌ nuevo | — | RF crear |
| `lib/adjuntos-uploader.ts` | `lib/adjuntos-uploader.ts` | ❌ nuevo (Fase Adjuntos 1) | — | RF crear · MD5, base64, XMLHttpRequest con progreso, reintentos con backoff, batching de concurrencia 3 |
| `lib/claude-extractor.ts` | `lib/claude-extractor.ts` | ❌ nuevo | — | RF-09 |
| `lib/schemas.ts` (zod) | `lib/schemas.ts` | v0 parcial | — | RF-05 |
| `middleware.ts` (Clerk) | `middleware.ts` | ❌ nuevo | — | Layout |

---

## 3bis. Wizard de creación y formulario (v1.9 · maqueta integrada 22-jul-2026)

Reemplaza el Sheet de una sola pasada por un wizard de 3 fases:

1. **Fase 1 · Modo de creación** — documentos (carga inicial de respaldos) o manual.
2. **Fase 2 · Tipo de propiedad** — Nuevo / Usado. Es el interruptor que determina qué campos y bloques se muestran en el resto del flujo (RN-45/RN-49/RN-50).
3. **Fase 3 · Formulario** — adaptado según las dos fases anteriores.

El formulario pasa de 6 secciones a 4:

| Sección | Contenido |
|---|---|
| A · Origen | Ejec. Comercializador y Ejec. Formalizador como campos separados, tipo de cliente de origen, bloque repetible Contactos de visita |
| B · Propiedad | Tabla de N Unidades: tipo de bien, rol SII, superficies con origen declarado (RN-45) y adjunto de respaldo obligatorio |
| C · Personas de la operación | Comprador y Vendedor, cada uno con RUT |
| D · Producto y observaciones | Cliente institucional, tipo de informe/producto, banco financista condicional, observaciones |

**Documentos y Adjuntos salen del formulario** y pasan a vivir en el botón "Documentos y Adjuntos" del detalle (§7) — siempre visible tras crear la solicitud, en cualquier orden respecto de la asignación del tasador.

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
│ Activas | SLA riesgo |    │  │ [Asignar Tasador*] [Documentos] [Prioridad]  │
│ Por reasignar | Mi cartera│  │ [Pausar] [Cancelar]  *desaparece al asignar  │
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

### Tab Datos (v1.9 · 11 bloques)

Editable según REGLA C (§5ter): todo el bloque es editable mientras el estado sea `creada` (vía "Editar solicitud"); en modo consulta cuando estado ≠ `creada` Y hay tasador asignado (RN-59).

| Bloque | Contenido | Se llena desde |
|---|---|---|
| Origen y cliente | Cliente institucional, N° interno, N° de solicitud, fecha de solicitud, código VP-AAAA-NNNN, canal de origen, tipo de cliente de origen, Ejec. Comercializador y Ejec. Formalizador (campos separados) | Ejecutiva |
| Asignación | Tasador asignado, fecha y hora de asignación, estado del correo, botón Ver email enviado y botón Reenviar | Acción manual (§7, REGLA A) |
| Propiedad | Proyecto/condominio (sólo Nuevo), dirección con origen declarado, región, comuna, tipo de propiedad, estado de conservación | Ejecutiva |
| Vendedor | Razón social + RUT (Nuevo, inmobiliaria) o nombre + RUT (Usado, persona natural); contacto y origen del dato | Ejecutiva |
| Unidades (tabla) | Una fila por unidad: tipo de bien, rol SII o uso y goce, superficies (construida/terraza/terreno), año, material, m² de ampliación + regularizable, origen de la superficie (RN-45) y respaldo asociado | Ejecutiva |
| Personas de la operación | Comprador (RUT, nombre, email, teléfono); Vendedor (RUT, nombre) | Ejecutiva |
| Contactos de visita | Lista ordenada por prioridad: rol, nombre, teléfono, email, estado | Ejecutiva |
| Datos SII | Destino, códigos SII (comuna/manzana/predio), urbano/rural, superficie de terreno, avalúo fiscal por unidad y total, contribución, avalúo exento, CG/OCiv/OC/G | §4 Lectura de Documentos (Claude API) |
| Antecedentes legales | Permiso de edificación (N° y fecha), recepción final (N° y fecha), fojas/N°/año de inscripción, líneas de edificación, certificado de número | §4 Lectura de Documentos (Claude API) |
| Producto y financiero | Tipo de informe/producto, plazo; bloque Financiero colapsado, visible sólo si tipo de propiedad es Nuevo | Ejecutiva |
| Decisión del motor | Regla ganadora y candidatas descartadas, tasador y visador asignados | `A_DecisionesMotor` |

Campos de solo lectura (auto-calculados): `codigo_ext` (formula VP-AAAA-NNNN), `estado` (single select — sólo AT01/AT03/etc. lo modifican; AT02 no aplica a IF-02 en v1.9), `semaforo_sla` (formula verde/ámbar/rojo). Ver `docs/schema-airtable.md` §20 para los FIELD_IDs de los campos nuevos v1.9 — ninguno existe todavía en la base real.

### Tab Historial

Renderiza `A_Eventos` usando el componente `EventTimeline` (CU-000.A). Orden cronológico descendente (más reciente arriba). Incluye el correo de asignación, la confirmación de asignación manual (REGLA A — AT02 no interviene en IF-02) y las ediciones registradas mientras la solicitud estuvo en estado `creada` (REGLA C).

### Tab Adjuntos

Lista de `TX_Adjuntos` de la solicitud. Para cada adjunto:
- Nombre del archivo, tipo, tamaño
- `ExtraccionStatusBadge`: estado de la extracción RF-09 (`idle · extrayendo · listo · error`)
- Botón de descarga/vista previa

`FileUploadZone` (CU-000.A): sube por streaming vía Route Handler → Make → Dropbox. Al confirmar subida, encadena RF-09 en background.

Desde el Tab Adjuntos (solicitud ya existe), la subida es **directa por archivo, con progreso** — no pasa por el modo state-first de `FileUploadZone` (ese modo es exclusivo de `NewRequestSheet`, ver §5bis). Cada archivo soltado en el drop dispara `uploadConReintentos()` (`lib/adjuntos-uploader.ts`) de inmediato, con barra de progreso individual y reintento manual si falla tras los 3 intentos automáticos.

---

## 5bis. Flujo de subida de adjuntos (D-11, D-12, D-13, D-14)

Fase Adjuntos 1 (10-jul-2026) — guardado en Dropbox + registro en `TX_Adjuntos`, resiliente a fallos de red y abandono del usuario. Documentos huérfanos = cero por diseño (D-12).

**Storage**: escenario Make `SC-Adjuntos-Upload` (D-11), payload JSON+base64 vía `lib/make-client.ts` (misma firma HMAC que SC01, sin tocarla). Ver `docs/make-blueprints/SC-Adjuntos-Upload.blueprint.json`.

**Ruta A — "Nueva solicitud" (Opción C, D-12)**: los adjuntos se guardan como `File[]` en el state del `NewRequestSheet` mientras el usuario los agrega — **no se suben** a Dropbox todavía. Al presionar "Crear solicitud":
1. Se crea la solicitud vía `/api/webhooks/crear-solicitud` (SC01, sin archivos) → devuelve `solicitud_id` + `codigo_ext`.
2. El Sheet cambia a la vista `AdjuntosSubmitTracker` y sube los adjuntos en batching de 3 (`uploadEnLotes`), ya con `solicitud_id` real.
3. Si todos suben: toast de éxito, se cierra el Sheet, se refresca la lista.
4. Si algunos fallan tras los 3 reintentos automáticos: el tracker se queda abierto con "Reintentar los faltantes" / "Continuar sin ellos" — nunca bloquea el cierre.

**Ruta B — "Detalle de solicitud" (Tab Adjuntos)**: como ya existe `solicitud_id`, sube directo al soltar el archivo (ver §5 Tab Adjuntos).

**Mitigación de fallos (D-14)**:
1. Batching de concurrencia 3 — nunca `Promise.all` sin control.
2. Reintentos automáticos por archivo: 3 intentos, backoff 0s → 2s → 5s.
3. Progreso real de upload vía `XMLHttpRequest.upload.onprogress` (`fetch` no lo soporta).
4. Idempotencia por `hash_md5` (D-14.4): el cliente calcula MD5 antes de subir; Make hace Search Records en `TX_Adjuntos` por `hash_md5` y verifica en un Router si el resultado pertenece a la misma solicitud — si sí, devuelve el `adjunto_id` existente sin duplicar ni resubir a Dropbox.
5. Botón Cancelar por archivo y global (`AbortController`).
6. Recuperación gradual: solicitud creada + algunos adjuntos fallidos no es un estado de error — es un estado válido que la Ejecutiva resuelve después desde el detalle.

**Límites (D-13)**: por archivo, máximo 7 MB (bloqueante). Total < 40 MB sin advertencia; 40–80 MB advertencia ámbar no bloqueante; > 80 MB bloqueo del botón "Crear solicitud".

---

## 6. Botón "Asignar Tasador" — REGLA A (reemplaza "Pasar a asignada", v1.9)

Fuente: Blueprint v2.8 §7.2 · Especificación v1.9.1 §1.6 · RN-44.

La solicitud se crea sin tasador (`estado: "creada"`, "Sin asignar"). **Sólo existe "Asignar Tasador"** — no existe flujo de "Reasignación". AT02 (asignación algorítmica) no se invoca desde IF-02 en v1.9; la asignación es siempre manual.

```
puede_asignar_tasador = (
  !TX_Solicitudes.tasador                    // sin tasador asignado
  AND TX_Solicitudes.estado NOT IN ["cancelada", "cerrada"]
  AND datosMinimosFaltantes.length === 0     // dirección, ≥1 contacto con teléfono, rol SII
)
```

**Comportamiento UI**:
- El botón aparece **sólo** cuando la solicitud no tiene tasador y el estado lo permite. Si faltan datos mínimos, queda deshabilitado con tooltip que enumera exactamente qué falta.
- Al confirmar: fija el tasador, transiciona `creada → asignada`, registra `fecha_asignacion`, marca el correo de asignación como enviado, y agrega dos eventos al historial (correo de asignación + asignación manual).
- El botón **desaparece** de la barra de acciones inmediatamente después de confirmar — no reaparece como "Reasignar Tasador" ni en ninguna otra forma.
- SC05 notifica al tasador por email en segundo plano (no bloqueante).
- Mientras el estado siga siendo `creada`, la Ejecutiva puede cambiar el tasador ya fijado desde "Editar solicitud" (§5ter, REGLA C) — esa es la única vía de corrección, no hay diálogo de reasignación separado.

---

## 7. Acciones disponibles — barra inline

| Acción | Visibilidad | Resultado | Automatización |
|---|---|---|---|
| **Asignar Tasador** | Sólo sin tasador asignado, estado no `cancelada`/`cerrada` (§6, REGLA A) | `creada → asignada` | SC05 (AT02 no aplica a IF-02) |
| **Documentos y Adjuntos** | Siempre visible tras crear la solicitud | abre sheet de checklist + carga | ninguna |
| **Cambiar prioridad** | cualquier activo | actualiza `.prioridad` + `A_Eventos` | ninguna (SC13 fuera de alcance) |
| **Pausar** | `asignada`, `visitada` | actualiza estado a `requiere_atencion` + `A_Eventos` | ninguna (SC13 fuera de alcance) |
| **Cancelar** | cualquier activo no entregado | `(cualquiera) → cancelada` + `A_Eventos(tipo=solicitud_cancelada)` | ninguna |

**Nota**: no existe acción "Reasignar tasador" en v1.9. Las acciones de prioridad/pausa actualizan Airtable + `A_Eventos` pero **no envían email** en CU-002. SC13 queda como deuda técnica para un CU posterior.

---

## 5ter. Modificación de datos — REGLA C (edición y modo consulta)

Fuente: Especificación v1.9.1 RN-59.

- **Editable sólo en estado `creada`.** El botón "Editar solicitud" aparece exclusivamente en ese estado. Mientras la solicitud esté en `creada`, la Ejecutiva puede modificar todo, incluyendo cambiar el tasador ya asignado, sin que eso dispare por sí solo la transición de estado (esa sólo ocurre al confirmar "Asignar Tasador", §6).
- **Modo consulta (RN-59):** se activa cuando **ambas** condiciones se cumplen — estado ≠ `creada` Y la solicitud tiene tasador asignado. No depende de una sola de las dos: una solicitud sin tasador sigue editable aunque su estado ya no sea `creada`, y una con tasador pero todavía en `creada` sigue siendo editable.
- **Al guardar edición:** actualiza los datos, registra un evento en el historial ("Datos de la solicitud modificados"), confirma con toast, y vuelve a modo consulta si el estado ya no es `creada` (o queda editable si sigue siéndolo).
- No existe ningún flujo de reasignación como vía de corrección posterior — al entrar en modo consulta, el dato de tasador ya no se modifica desde IF-02.

**Restricción D-01**: la Ejecutiva **nunca** reasigna el visador desde la barra de acciones. El campo `visador` es visible en TabDatos pero sin botón de acción. (Fuente: Spec v1.8.2 §1.6 Nota v0.)

---

## 8. Mensajes humanos canónicos (literales — no admiten variación)

Fuente autoritativa: Blueprint v2.7 §6 · Plan v1.2.

### Validaciones bloqueantes

**Botón "Asignar Tasador" deshabilitado** (uno o más `datosMinimosFaltantes`, REGLA A/RN-44):

> **"Para asignar tasador falta: dirección · contacto con teléfono · rol SII."**

Sólo se listan los faltantes reales, separados por ` · `.

**RUT inválido** (`RUTField`):

> **"Necesitamos el RUT del propietario con su dígito verificador. Ej.: 12.345.678-9."**

**Email inválido**:

> **"Revisa el email de contacto: debe ser de la forma nombre@dominio.cl."**

**Dirección incompleta**:

> **"Ingresa la dirección con calle y número. Ej.: Av. Apoquindo 5230."**

### Validación al crear (REGLA B — doble superficie de error)

Si algún dato impide crear la solicitud, ésta **no se crea** y el sistema informa en dos superficies simultáneas:

1. **Toast**: encabezado con el N° de campos con problema + detalle de los primeros + contador "+N más".
2. **Alert destructivo** al inicio del formulario: lista **todos** los campos con problema, con etiqueta legible y motivo, nombrando bloques repetibles con precisión — ej. *"Unidad 2 · Superficie construida: …"*, *"Contacto 1 · Teléfono: …"*, nunca un mensaje genérico por sección.

**N° de operación duplicado** (conflicto de negocio, no error de formulario):

> El campo se marca con `setError` indicando que ya existe una solicitud con ese número.

### Confirmaciones (toasts verdes — sonner `success`)

**Solicitud asignada exitosamente** (única, sin reasignación — REGLA A):

> **"Solicitud asignada a {nombre_tasador}"**

**Solicitud creada** (alta interna):

> **"Solicitud creada con {n} documento(s) adjunto(s)."** *(pluraliza según n; si n=0: "Solicitud creada.")*

**Documento subido correctamente** (Tab Adjuntos, subida directa):

> **"Documento subido correctamente."**

### Advertencias (ámbar · no bloqueantes)

**Tasador fuera de cobertura** (banner en el diálogo "Asignar Tasador"):

> **"Este tasador no cubre la comuna de la solicitud. Puedes continuar; quedará registrado como override."**

**Documento marcado sin archivo** (tooltip botón "Crear solicitud"):

> **"Faltan {n} documento(s) marcado(s) sin archivo."**

**Total de adjuntos entre 40 y 80 MB** (banner en `FileUploadZone`, Fase Adjuntos 1 · D-13):

> **"Esto puede tardar hasta 2 minutos."**

### Bloqueos (Fase Adjuntos 1 · D-13)

**Archivo individual > 7 MB** (tooltip en `FileUploadZone`):

> **"Este archivo supera el límite de 7 MB. Comprímelo o divídelo."**

**Total de adjuntos > 80 MB** (banner rojo, bloquea "Crear solicitud"):

> **"Divide la subida en tandas o comprime los planos."**

### Recuperación parcial (Fase Adjuntos 1 · D-14.6)

**Algunos adjuntos fallaron tras los reintentos automáticos** (`AdjuntosSubmitTracker`):

> **"Subieron {x} de {y} documentos. Puedes reintentar los faltantes o completarlos después desde el detalle de la solicitud."**

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

- `NewRequestSheet` como wizard de 3 fases (modo creación → tipo propiedad → formulario, §3bis) con 4 secciones: Origen · Propiedad · Personas de la operación · Producto. Documentos y Adjuntos salen del wizard (van al botón del detalle).
- Route Handler `POST /api/webhooks/crear-solicitud` → SC01 Make con firma HMAC-SHA256 (D-03)
- Route Handler `POST /api/adjuntos/upload` → streaming → Make → Dropbox
- Criterio de aceptación: solicitud creada en `TX_Solicitudes` con `estado=creada`; `A_Eventos` registra `solicitud_creada`; validación al crear con toast + Alert destructivo por campo (REGLA B), nunca bloquea por documentos/adjuntos

### RF-06 · Asignar Tasador (paso 5, REGLA A)

- `BarraAccionesDetalle`: Asignar Tasador (visible solo sin tasador, desaparece al asignar) · Documentos y Adjuntos · Cambiar prioridad · Pausar · Cancelar. Sin "Pasar a asignada" ni "Reasignar tasador" separados.
- Route Handler que fija el tasador y transiciona `creada → asignada` en un solo paso (sin AT02, sin campo trigger H-04)
- `AsignarTasadorDialog` con cmdk, ficha de carga (`casos_en_curso / capacidad_activa`) y alerta fuera de cobertura
- Route Handlers de prioridad, pausa → Airtable + `A_Eventos` (sin SC13)
- Criterio de aceptación: "Asignar Tasador" transiciona correctamente y desaparece de la barra; toast §8; SC05 envía email al tasador; la Ejecutiva no puede reasignar visador (D-01); cambiar el tasador mientras el estado siga `creada` se hace desde "Editar solicitud" (REGLA C), no desde este flujo

### RF-09 · Extracción con Claude API (paso 6)

- `ExtraccionStatusBadge` (4 estados: idle · extrayendo · listo · error)
- Route Handler `POST /api/extraccion/iniciar` → webhook Make RF-09 → Claude API → `TX_DatosTasacion` + `TX_Adjuntos.estado_extraccion`
- Hook en `FileUploadZone`: encadena RF-09 tras confirmar Dropbox
- Criterio de aceptación: badge actualiza en tiempo real; errores muestran mensaje humano §8; cada llamada loggea en `LogEscenarios`

### RF Adjuntos · Fase 1 (D-11 a D-14, 10-jul-2026)

- Escenario Make `SC-Adjuntos-Upload` (D-11): Webhook → Search Records (`hash_md5`) → Router [reused / nuevo] → Dropbox `uploadLargeFile` → Airtable Create Record → Log → Webhook Response
- `NewRequestSheet` (Opción C, D-12): archivos en state hasta crear la solicitud; sube en batching de 3 recién con `solicitud_id` real
- `AdjuntosSubmitTracker`: progreso por archivo, cancelar por archivo/global, reintentar los faltantes
- Tab Adjuntos del detalle: subida directa reutilizando `lib/adjuntos-uploader.ts`
- Criterios de aceptación: ver `docs/construccion.md` §7bis

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

- Body: `{ solicitud_id, tasador_id }`
- Valida `datosMinimosFaltantes` server-side (RN-44, red de seguridad)
- Actualiza `tasador` y `estado=asignada` directamente en `TX_Solicitudes` (sin AT02, sin campo trigger — REGLA A retira AT02 del alcance de IF-02)
- Registra `fecha_asignacion` y dispara SC05 (email al tasador)
- Escribe dos eventos en `A_Eventos`: correo de asignación + asignación manual

### POST /api/adjuntos/upload

Reescrito completo en Fase Adjuntos 1 (10-jul-2026, D-11 a D-14): de `formData`/`Blob` a **JSON+base64**. Body validado con Zod:

```ts
{
  solicitud_id: string,      // record_id TX_Solicitudes, OBLIGATORIO (D-12, Opción C — E-023 SUPERSEDED)
  codigo_ext: string,
  nombre_archivo: string,
  mime_type: string,
  tamanio_kb: number,        // ya en KB, calculado en el cliente desde file.size/1024
  hash_md5: string,          // calculado en el cliente (D-14.4)
  subido_por: string,        // default "Ejecutivo" (opción existente, no crear nuevas)
  contenido_base64: string,
}
```

- Auth Clerk server-side obligatoria · `runtime = 'nodejs'` · `maxDuration = 60`
- Valida `tamanio_kb <= 7168` (7 MB) server-side además del cliente → `413` con mensaje §8 si excede
- Firma HMAC-SHA256 y envía a `MAKE_WEBHOOK_URL_ADJUNTOS` vía `postToMake()` (misma firma de `lib/make-client.ts`, sin tocar)
- Devuelve la respuesta de Make tal cual: `{ ok, adjunto_id, url_dropbox, nombre_archivo, tamanio_kb, reused }` o `{ ok: false, error, reintentable }`
- Si `MAKE_WEBHOOK_URL_ADJUNTOS`/`MAKE_HMAC_SECRET` faltan: degrada con `{ ok: false, degraded: true, error }`
- Límite de body de Next.js: `next.config.mjs` sube `experimental.proxyClientMaxBodySize` a `12mb` (un archivo de 7MB en base64 pesa ~9.3MB de JSON; el default de Next 16 es 10MB cuando hay `middleware.ts`, que cubre `/api/**`)

### POST /api/extraccion/iniciar

- Body: `{ adjunto_id, solicitud_id }`
- Llama webhook Make RF-09 → Claude API
- Actualiza `TX_Adjuntos.estado_extraccion = extrayendo` antes de llamar
- Loggea en `LogEscenarios`

### POST /api/webhooks/prioridad, /pausar

- Actualizan `TX_Solicitudes` directamente vía Airtable API (sin Make)
- Escriben `A_Eventos` con tipo y descripción correspondientes
- No invocan SC13 (fuera de alcance CU-002)
- No existe `/api/webhooks/reasignar` en v1.9 — cambiar el tasador mientras el estado siga `creada` se hace vía el mismo Route Handler de edición de "Editar solicitud" (REGLA C), no vía un webhook de reasignación separado

### PATCH /api/solicitudes/[id] (Editar solicitud, REGLA C)

- Sólo permitido si `estado === "creada"` (validado server-side, no sólo en la UI)
- Body: subconjunto de campos editables de la solicitud, incluido `tasador_id`
- Actualiza `TX_Solicitudes`, registra `A_Cambios` (before/after) y un evento `solicitud_modificada` en `A_Eventos`
- No dispara ninguna automatización ni transición de estado por sí solo

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
| D-11 | Storage de adjuntos vía Make | Escenario `SC-Adjuntos-Upload`, payload JSON+base64, misma firma HMAC de `lib/make-client.ts`. |
| D-12 | Flujo de subida (Opción C) | Adjuntos en `File[]` del state hasta crear la solicitud; se suben en batching después, con `solicitud_id` real — cero adjuntos huérfanos. |
| D-13 | Límites de tamaño | 7 MB por archivo (bloqueante) · 40–80 MB advertencia ámbar · > 80 MB bloqueo total. |
| D-14 | Mitigación de fallos | Batching 3 · reintentos 3x con backoff 0/2/5s · progreso vía XHR · idempotencia por `hash_md5` · cancelar por archivo/global · recuperación gradual sin bloquear el cierre. |
| REGLA A (v1.9) | Asignación de tasador | Manual, única. Botón "Asignar Tasador" visible sólo sin tasador; desaparece al confirmar. Sin flujo de reasignación formal ni AT02 automático. RN-44. |
| REGLA B (v1.9) | Validación al crear | Doble superficie: toast con N° de campos + Alert destructivo con todos los campos (bloques repetibles nombrados con precisión). N° de operación duplicado = conflicto de negocio, no error de formulario. |
| REGLA C (v1.9) | Modificación de datos | Editable sólo en estado `creada` vía "Editar solicitud" (incluye cambiar tasador). Modo consulta cuando estado ≠ `creada` Y hay tasador asignado. RN-59. |
| D-15 (v1.9) | AT02 fuera de alcance de IF-02 | Permanece en el catálogo de automatizaciones para otros orígenes (IF-01); IF-02 asigna manualmente (REGLA A). D-10 de la Especificación queda SUPERSEDED. |
