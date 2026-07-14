# schema-airtable.md · VProperty · IF-02 · CU-002

> **Versión**: 1.8 · Alineado a Capa de Datos v2.6.2 · Auditoría v1.2 · RF-52 AUTH_ domain (07-jul-2026) · Fase 2 Tanda A gap de persistencia (08-jul-2026) · Fase 1 cierre de pendientes IF-02 (08-jul-2026) · Fase Adjuntos 1 (D-11 a D-14, 10-jul-2026) · Dominio D_ auditado para RF-09 (12-jul-2026) · Re-auditoría `TX_Solicitudes` completa (13-jul-2026, ver §19) · Construcción RF-09: 5 campos nuevos + corrección `LogEscenarios` (13-jul-2026, ver §13.4/§13.5)
> **Origen**: snapshot MCP Airtable (04-jul-2026) + correcciones de auditoría v1.2 + verificación/creación de campos MCP (08-jul-2026, ver `docs/_notas/gap_solicitud_persistencia.md`) + re-verificación MCP y creación de `TX_Adjuntos.estado_extraccion` (08-jul-2026, Fase 1 cierre de pendientes IF-02) + hallazgo `TX_Solicitudes.codigo_solicitud` (primary field) y llave de idempotencia `hash_md5` (10-jul-2026, Fase Adjuntos 1) + auditoría completa del dominio D_ y creación de `D_Atributo.version` + `D_Documento.extraccion_incompleta` (12-jul-2026, ver §18) + re-auditoría completa de campos reales de `TX_Solicitudes` vía `list_tables_for_base`/`get_table_schema` (13-jul-2026, ver §19)
> **Base**: `app9G7lLkIV3CpeLa`
> **Propósito**: fuente de verdad permanente de TABLE_IDs y FIELD_IDs para Claude Code. Leer al inicio de cada sesión antes de escribir Route Handlers o tipos TS.
> **Regla**: en código, preferir FIELD_ID (`fld…`) sobre nombre cuando haya riesgo de colisión o espacio extra. Si el FIELD_ID no está listado aquí, usar el nombre lógico de Capa Datos v2.6.2.

---

## 1. Inventario completo de tablas (TABLE_IDs verificados vía MCP 04-jul-2026)

### Dominio M_ · Maestros

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `M_Clientes` | `tblpK7AcYBMH93apK` | |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | |
| `M_Tasadores` | `tblEi5jp18c1j00bQ` | ⚠ Campos `disponible` y `casos_en_curso` pendientes de crear — ver §5 H-05 |
| `M_Visadores` | `tbludtgDtHWvt0Q3D` | Campo `especialidades` es **multipleSelects**, plural |
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | |
| `M_TiposInforme` | `tblOcsdiwxQLfD178` | |
| `M_Comunas` | `tblyggAfQfq682XHK` | |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | |
| `M_Zonificacion` | `tbltr5VN2NGuTtbc1` | No usada en IF-02 |

### Dominio C_ · Configuración

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `C_ReglasNegocio` | `tblyCb8cVTDzfeBx0` | Lee AT01; no escribe IF-02 |
| `C_Plantillas` | `tblcYtNeJBD545hLw` | No usada directamente en IF-02 |
| `C_Formulas` | `tblNFa454fBbqRB3t` | No usada directamente en IF-02 |
| `C_Workflows` | `tblDJYurYE2ftJ12G` | No usada directamente en IF-02 |
| `C_WorkflowPasos` | `tblYmOvpDIr0lg7Fo` | No usada directamente en IF-02 |
| `C_VariablesCliente` | `tblgrY8j4ugFzS7v9` | Lectura para campos extra por cliente (IF-01/IF-02) |
| `C_NotificacionesConfig` | `tbluB662ulWDaxqUY` | Read destinatarios SC05 |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read umbrales SLA |
| `C_Factores` | `tblNHze3ZZYJblJ7S` | No usada en IF-02 |
| `C_Equivalencias` | `tbllnozFm9abBPsw6` | No usada en IF-02 |
| `C_PreciosUnitarios` | `tblLJgt0Lk1cKNLfg` | No usada en IF-02 |
| `C_VidaUtil` | `tbl7OQyAWmRNaTXon` | No usada en IF-02 |
| `C_Feriados` | `tblJVh2kPd4uMgxpb` | Lectura indirecta para SLA hábil |
| `C_TramosHonorarios` | `tbl3M8p4Mdl1JBZ1f` | No usada en IF-02 |
| `C_TramosBienComun` | `tbluLTZ30drAAJHQ2` | No usada en IF-02 |
| `C_FactoresHomogeneizacion` | `tblep24N9gPMrDPIN` | No usada en IF-02 |
| `C_AutomationsAirtable` | `tblYYtKEaPgH7GfY0` | Registro AT01/AT02/AT08 — 9 filas presentes |

### Dominio TX_ · Transacciones

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` | Tabla principal IF-02 |
| `TX_DatosTasacion` | `tblMoK3mFuwN8Yr1A` | Read en RF-09 / IF-04 aguas abajo |
| `TX_Calculos` | `tblFz37KSvn5pLKDR` | No usada en IF-02 |
| `TX_Comparables` | `tbllbTuhb0waWIbRo` | No usada en IF-02 |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write upload + estado extracción RF-09 |
| `TX_DocumentosGenerados` | `tbl5sYnGPZXgYCBSY` | No usada en IF-02 |
| `TX_Notificaciones` | `tbldgLQgjdgsOSZnt` | Write desde SC05 |
| `TX_ItemsCuadroValoracion` | `tblCxnMtOETK2ulD0` | IF-03 aguas abajo |
| `TX_Ampliaciones` | `tblpAtUq4p6o1vofo` | IF-03 aguas abajo |
| `TX_HabitacionesPorNivel` | `tblBITpPb8WuqsatM` | IF-03 aguas abajo |
| `TX_TerminacionesPorRecinto` | `tbleQ7pcLxYx9NbCi` | IF-03 aguas abajo |
| `TX_DocumentosLegales` | `tbl7qIg5x4Y0tOiLk` | IF-03 aguas abajo |
| `TX_ObrasComplementarias` | `tblQ1fXM06bzSQ84w` | IF-03 aguas abajo |
| `TX_CasosRegresion` | `tblTMRtXTpf7ZLeOr` | QA |

### Dominio A_ · Auditoría (append-only)

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `A_Eventos` | `tblMKmDg2KrO5fMn8` | Write timeline — `tipo_evento` es singleLineText |
| `A_DecisionesMotor` | `tbluQQtXUI0Zd8jiN` | Read decisión del motor |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | Write override AT02 |
| `A_ErroresMake` | `tbl46Q0BcfD57LWyQ` | Read/write errores Make |
| `A_Accesos` | `tblqXDIFFOGkMhvK0` | Write apertura de PDF (IF-04) |

### Dominio H_ · Históricos

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `H_Solicitudes_Cerradas` | `tblVYr0n0sLcJoGHz` | |
| `H_Comparables_Historico` | `tblTKYct1bCRtpZ33` | |
| `H_PlantillasAnteriores` | `tblqkBqKuvEqsSdUt` | |
| `H_FormulasAnteriores` | `tblQEFpHo9dIIScco` | |
| `H_PreciosUF` | `tblWPRuIYfzdlveHM` | |

### Dominio AUTH_ · Autenticación (RF-52 · 07-jul-2026)

> Dominio único para todas las interfaces VProperty (IF-01, IF-02 y siguientes). Tablas presentes y **pobladas con registros mínimos** al 07-jul-2026.

| Tabla lógica | TABLE_ID | Estado | Uso en IF-02 |
|---|---|---|---|
| `AUTH_Roles` | `tblhJSBD9xh3ftwbs` | ✅ Poblada — 3 roles activos | Categoriza usuarios: `ejecutiva_comercial · visador · tasador` |
| `AUTH_Usuarios` | `tblbX3hPD2uhqhl5v` | ✅ Poblada — 1 usuario de prueba | Linked record de `TX_Solicitudes.ejecutiva_asignada` (D-02/D-08) |
| `AUTH_DatosAcceso` | `tbl7Rcw912UM01nlB` | ⚠ Vacía | Hash de contraseña + control de intentos (no requerida en IF-02 v1) |
| `AUTH_FuncionalidadesPorRol` | `tbljDFSC6ElWVoEF6` | ⚠ Vacía | Permisos por rol (no requerida en IF-02 v1) |

**Roles creados en AUTH_Roles (07-jul-2026)**:

| record_id | nombre_rol | descripcion |
|---|---|---|
| `recJBitusYjl6HLuk` | `ejecutiva_comercial` | Acceso a IF-02 Consola Ejecutiva |
| `recQoNbLQIhLMzUlw` | `visador` | Acceso a IF-03 Portal Visador |
| `receKuqReKggoLGar` | `tasador` | Acceso a portal de tasadores |

**Usuario de prueba en AUTH_Usuarios (07-jul-2026)**:

| record_id | nombre | email | rol |
|---|---|---|---|
| `rec8XzHkBKWMb4CO1` | Sergio Morales | nutricionsaludketo@gmail.com | ejecutiva_comercial |

---

### Dominio Z_ · Automatizaciones

| Tabla lógica | TABLE_ID | Notas |
|---|---|---|
| `Z_EscenariosMake` | `tblYfmDoaq7Z3Vh6P` | ⚠ Vacía al 04-jul-2026; poblar al importar SC01/SC05 |
| `Z_EjecucionesMake` | `tblaAmNmPqqqSrwbS` | |
| `Z_ColaPendientes` | `tblSvEtzO2TdmkBfk` | |
| `Z_Webhooks` | `tblovY0Bt1Avhdgdx` | Registro URLs webhook SC01 y SC05 |
| `Z_Schedulers` | `tblPw2tmtF8so8wBe` | |
| `LogEscenarios` | `tblR4VWpUHw1CSyIS` | Write log de cada llamada Make |

---

## 2. TX_Solicitudes — campos detallados

**TABLE_ID**: `tblaHTyMHYfmy7Fg6`

Los FIELD_IDs marcados con ✅ fueron verificados vía MCP (04-jul-2026). Los marcados con ⚙ deben crearse (D-08).

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `solicitud_id` | — | Autonumber (PK) | Read-only |
| `codigo_solicitud` | `fldDXEE1ejMNVDlpB` ✅ | **Formula** (⚠ corregido 13-jul-2026, ver §19) | **Primary field de la tabla**. Hasta el 10-jul-2026 este campo era Single line text poblado manualmente (ver `docs/aprendizajes.md` E-024) — la re-auditoría del 13-jul-2026 confirmó vía `get_table_schema` que **hoy es un campo formula, read-only**: `"VP-" & YEAR({fecha_solicitud}) & "-" & RIGHT("0000" & {solicitud_id} & "", 4)`, prácticamente idéntica a `codigo_ext`. Alguien convirtió el campo de texto a fórmula entre el 10-jul y el 13-jul; no hay registro de quién/cuándo exacto. **La tarea "mapear codigo_solicitud en el módulo 7 de SC01" queda obsoleta** — el campo ya no acepta escritura. **Importante**: como primary field, cualquier campo Link hacia `TX_Solicitudes` (ej. `TX_Adjuntos.solicitud`) se evalúa contra ESTE campo — no contra `codigo_ext` ni contra el record ID — dentro de un `filterByFormula` (misma lección que E-018). |
| `codigo_ext` | `fldSuJx1fDNYYwDcD` ✅ | Formula | `'VP-' & YEAR(fecha_solicitud) & '-' & LPAD(solicitud_id,4,'0')`. Read-only |
| `fecha_solicitud` | — | Date (⚠ real es **Date time**, ver §19) | Cuándo se recibió |
| `cliente` | — | Link → M_Clientes | FK. Solo activos en selectores |
| `banco` | ver fila detallada más abajo (⚠ **no** es Link → M_Bancos; ver corrección 08-jul-2026) | — | — |
| `tipo_informe` | — | Link → M_TiposInforme | FK. Filtrado por M_Clientes.productos |
| `tipo_propiedad` | — | Link → M_TiposPropiedad | FK |
| `producto` | — | Link → M_Productos | FK |
| `comuna` | — | Link → M_Comunas | FK |
| `direccion` | — | Single line text | Calle + número + complemento |
| `rol_sii` | — | Single line text | Opcional; RF-09 lo completa |
| `cliente_final_nombre` | — | Single line text | Propietario real de la propiedad |
| `cliente_final_rut` | — | Single line text | RUT con dígito verificador (RN-15) |
| `tasador` | — | Link → M_Tasadores | FK. Asigna AT02; override manual posible |
| `visador` | `fldhm86amyekWsEFY` ✅ | Link → M_Visadores | FK. La Ejecutiva **no** reasigna visador (D-01) |
| `regla_aplicada` | — | Link → C_ReglasNegocio | FK. Escrito por AT01 |
| `estado` | — | Single select | creada · asignada · visitada · calculada · pdf_listo · devuelta · aprobada · pendiente_final · entregada · cerrada · cancelada · requiere_atencion |
| `fecha_asignacion` | — | Date | Cuándo se asignó |
| `fecha_visita_programada` | `fldPUFd9YuQdkcrOI` ✅ | Date | Obligatoria para "Pasar a asignada" |
| `fecha_visita` | — | Date | Fecha real de la visita |
| `fecha_entrega` | — | Date | Cuándo se envió al cliente |
| `fecha_cierre` | — | Date | 7 días post-entrega sin reclamos |
| `dias_desde_solicitud` | — | Formula | `DATETIME_DIFF(NOW(), fecha_solicitud, 'days')` |
| `semaforo_sla` | `fldW4oUq7LvQUZq7W` ✅ | Formula | Verde/Amarillo/Rojo según días vs C_SLA |
| `prioridad` | `fld9FKZ9siAeSsH54` ✅ | Single select | Normal · Urgente · Crítico |
| `origen_canal` | `fldPphw1FWfYdZI2Z` ✅ | Single select | app_cliente · ingreso_manual · email · telefono · whatsapp · presencial · otro |
| `pdf_final_url` | — | URL | Link al PDF vigente |
| `observaciones_internas` | — | Long text | Solo equipo VProperty |
| ~~`hora_visita`~~ | — | Duration | [v2.3] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`hora_entrega`~~ | — | Duration | [v2.3] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| `profesion_solicitante` | `fld63DYDVnVaAmhAH` ✅ | Single line text | [v2.3] Override por caso. Confirmado existente vía MCP 13-jul-2026 |
| ~~`contacto_observaciones`~~ | — | Long text | [v2.3] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`codigo_corto`~~ | — | Single line text | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`vivienda_social`~~ | — | Single select | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`ejecutivo`~~ | — | Single line text | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). No confundir con `ejecutivo_solicitante`, que sí existe |
| ~~`contacto_nombre`~~ | — | Single line text | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`contacto_fono`~~ | — | Single line text | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| ~~`casa_numero`~~ | — | Single line text | [v2.4] ⚠ **No existe en el Airtable real** (re-auditoría 13-jul-2026, ver §19). Aspiracional, nunca creado |
| `solicitante_nombre` | `fld2rd2p4Qpz6NFQ2` ✅ | Single line text | [v2.6] Persona natural titular del trámite |
| `solicitante_telefono` | `fldzHrLeO3Fe0xtvn` ✅ | Phone number | [v2.6] Teléfono del solicitante. Verificado vía MCP 08-jul-2026 (Fase 2 · Tanda A) |
| `n_operacion_cliente` | `fldb1vmKk7y3hi4uY` ✅ | **Number** (⚠ H-07) | [v2.6] Capa Datos v2.6.2 lo define como text; el Airtable real lo tiene como number. Usar tipo `number` en TS |
| `sucursal_originadora` | `fldd56pLZyKYoi2Vi` ✅ | Single line text | [v2.6] ⚠ **Nombre con espacio final** en Airtable real (`sucursal_originadora `). Corregir con D-08. Hasta entonces referenciar por FIELD_ID |
| `ejecutivo_solicitante` | `fldRweQyq3tTQGmPR` ✅ | Single line text | [v2.6] Spec usaba `ejec_solicitante`; nombre real conservado (D-08) |
| `comision_ov` | `fldTB51XKDhncrL0K` ✅ | Number (4 dec) | [v2.6 TBD-09] Pendiente confirmación semántica |
| `fecha_solicitud` | `fldvkn9CsORy4eU0Z` ✅ | **Date time** (⚠ corregido 13-jul-2026 — se documentaba como Date; re-verificado vía `get_table_schema`: `dateTime`, formato ISO `YYYY-MM-DD` + hora 12h, timezone client) | Verificado vía MCP 08-jul-2026 (Fase 2 · Tanda A). **No estaba mapeado en el módulo 7 de SC01** — pendiente Tanda B. `codigo_ext` y `codigo_solicitud` dependen de `YEAR(fecha_solicitud)` |
| `monto_estimado_uf` | `fldKZW799xIqMFN1I` ✅ | Number | Verificado vía MCP 08-jul-2026 (Fase 2 · Tanda A). Antes no documentado en esta tabla pese a usarse en `lib/solicitudes.ts`. **No mapeado en SC01** — pendiente Tanda B |
| `banco` | `fldAgTlFXeXWfGTdI` ✅ | **Single line text** — ⚠ **DEPRECATED en migración** (08-jul-2026) | Banco originador. Verificado vía MCP: es texto libre, **no** Link → M_Bancos como decía esta tabla antes de la Fase 2 · Tanda A. Recibe `banco_id` del form tal cual, sin Search Records. **No borrar todavía** — convive con `banco_link` hasta que Tanda B (blueprint SC01) escriba en `banco_link` y Tanda C (`lib/solicitudes.ts` y demás lectores) lea de `banco_link`. Recién entonces se elimina este campo en una tanda posterior |
| `banco_link` | `fldxlBazQKgQwureX` ✅ | Link → M_Bancos (`tblGlYuJo5AeMehhs`) | **Creado y poblado** 08-jul-2026 (Fase 2 · Tanda A, migración de `.banco`). **Este es el campo a usar de aquí en adelante** para el banco originador. Migradas las 5 filas que tenían `.banco` poblado al momento de la migración (ver `docs/aprendizajes.md` y `docs/_notas/gap_solicitud_persistencia.md`). ⚠ La API no permite restringir el link a un solo record (`prefersSingleRecordLink` no configurable vía MCP) — la disciplina de "un solo banco" se aplica en Make/código, no en el schema. Pendiente mapear en Tanda B (requiere Search Records, como banco_financista) y leer desde Tanda C |
| `notas_tasador` | ⚙ pendiente | Long text | **Crear** (D-08). Instrucciones para el tasador |
| `notas_visador` | ⚙ pendiente | Long text | **Crear** (D-08). Contexto para la revisión |
| `ejecutiva_asignada` | `fldv1XDfP7EgYC3km` ✅ | Link → AUTH_Usuarios (`tblbX3hPD2uhqhl5v` · RF-52) | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Alimenta vista "Mi cartera". Pendiente: resolver Search Records en Tanda B para asignación automática = usuario Clerk |
| `email_contacto` | `fldjzUZsACA0vDlUq` ✅ | Email | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Reemplaza el rescate de `email` en `observaciones_internas` — pendiente mapear en Tanda B |
| `banco_financista` | `fldxcfdKRctHCgwmB` ✅ | Link → M_Bancos (`tblGlYuJo5AeMehhs`) | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Distinto de `.banco` (banco originador, texto libre). Reemplaza el rescate de "Banco financista" en `observaciones_internas` — pendiente mapear en Tanda B (requiere Search Records nuevo) |
| `canal_contacto_original` | `fldca1Uza4eicBXL4` ✅ | Single select (`WhatsApp · Email · Teléfono · Presencial · Otro`) | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Guarda el valor libre de `canal` del form; `origen_canal` conserva su semántica de canal de ingreso al sistema (`ingreso_manual` fijo en alta interna) — pendiente mapear en Tanda B. **Re-verificado vía MCP 08-jul-2026 (Fase 1 cierre de pendientes IF-02)**: decisión de panel — se mantiene como Single select (no se migra a texto libre; el MCP no permite conversión de tipo in-place sobre un campo existente, ver `docs/aprendizajes.md` E-007) |
| *(campo trigger AT02)* | ⚠ H-04 | Checkbox (probable) | **Nombre desconocido**. Confirmar en UI Airtable Automations antes de RF-06 |

**Cierre Fase 1 (08-jul-2026, sesión "cierre de pendientes IF-02")**: `email_contacto`, `banco_financista`, `canal_contacto_original`, `ejecutiva_asignada`, `fecha_solicitud`, `solicitante_telefono` y `monto_estimado_uf` fueron re-verificados vía MCP contra el schema real y confirmados existentes con los FIELD_ID de la tabla anterior — no requirieron creación. Detalle de la auditoría en §13.

---

## 3. M_Tasadores — campos detallados

**TABLE_ID**: `tblEi5jp18c1j00bQ`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `tasador_id` | Autonumber (PK) | |
| `nombre` | Single line text | |
| `rut` | Single line text (UQ) | |
| `email` | Email | Recibe link a IF-03 al ser asignado |
| `telefono` | Phone | |
| `zonas_cobertura` | Link → M_Comunas | Filtro de asignación automática |
| `especialidades` | Multi select | Residencial · Comercial · Industrial · Agrícola |
| `capacidad_activa` | Number | Máximo solicitudes concurrentes |
| `casos_en_curso` | Count link | ⚙ **Crear** (H-05). COUNT(TX_Solicitudes WHERE tasador=this AND estado IN [asignada, visitada, calculada]) |
| `disponible` | Formula | ⚙ **Crear** (H-05). `IF(casos_en_curso < capacidad_activa, TRUE, FALSE)` |
| `activo` | Checkbox | Solo activos aparecen en asignación |

---

## 4. M_Visadores — campos detallados

**TABLE_ID**: `tbludtgDtHWvt0Q3D`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `visador_id` | Autonumber (PK) | |
| `nombre` | Single line text (primary) | |
| `email` | Email | Notificación PDF pendiente |
| `especialidades` | **multipleSelects** | ⚠ **Plural** — no singular. Comparar contra tipo_propiedad al asignar |
| `firma_url` | URL | Imagen PNG en Dropbox; inyecta Carbone |
| `fono` | Phone | |
| `casos_en_cola` | Count link | COUNT(TX_Solicitudes WHERE visador=this AND estado=pdf_listo) |
| `activo` | Checkbox | Solo activos en asignación |

---

## 5. M_Clientes — campos clave para IF-02

**TABLE_ID**: `tblpK7AcYBMH93apK`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `cliente_id` | Autonumber (PK) | |
| `codigo_externo` | Single line text (UQ) | Para identificación en informes |
| `nombre` | Single line text | Razón social |
| `tipo` | Single select | Banco · Compañía de seguros · Mutuaria · Caja · Inmobiliaria |
| `rut` | Single line text (UQ) | |
| `email_contacto` | Email | |
| `productos` | Link → M_Productos | Filtra M_TiposInforme disponibles en el formulario |
| `bancos_asociados` | Link → M_Bancos | |
| `activo` | Checkbox | Solo activos en selectores |

---

## 6. M_Comunas — campos clave

**TABLE_ID**: `tblyggAfQfq682XHK`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `comuna_id` | Autonumber (PK) | |
| `nombre` | Single line text | |
| `region` | Single select | RM · V · VI · ... (15 regiones) |
| `activo` | Checkbox | |

---

## 7. M_TiposInforme, M_TiposPropiedad, M_Bancos, M_Productos

| Tabla | TABLE_ID | Campo clave adicional |
|---|---|---|
| `M_TiposInforme` | `tblOcsdiwxQLfD178` | `activo` (checkbox) |
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | `requiere_subtipo` (checkbox) |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | `activo` (checkbox) |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | `activo` (checkbox) |

---

## 8. TX_Adjuntos — campos clave

**TABLE_ID**: `tblur71x1oItbmKZc`

> ⚠ **Tabla corregida 08-jul-2026 (Fase 2 · Tanda A)**. La versión anterior de esta sección documentaba campos que **no existen** en el Airtable real (`tipo_documento`, `tamano_bytes`, `creado_en`) — probablemente aspiracionales de una fuente canónica, nunca creados. `lib/adjuntos.ts` hoy referencia `tamano_bytes`, que tampoco existe (el campo real es `tamanio_kb`); ese código quedará en `0`/vacío hasta corregirse en una tanda de código.

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `adjunto_id` | `fldVt7Lk1ptvmgbtT` ✅ | Autonumber (PK) | |
| `solicitud` | `fldZTVpXDRtXXPjyv` ✅ | Link → TX_Solicitudes | FK |
| `nombre_archivo` | `fldhnCIY8yPHW8XEj` ✅ | Single line text | |
| `tipo` | `fldUYBO3LeOHxiIGW` ✅ | Single select | Foto fachada · Foto interior · Plano · Certificado dominio · Escritura · Permiso edificacion · Recepcion final · Certificado avaluo · Informe borrador · Otro · sii · cbr · plano (11+ valores, mezcla de nomenclaturas) |
| `tipo_adjunto` | `fld1ocY8ug1vzBQsj` ✅ | Single select | foto_exterior · foto_interior · plano · cbr · escritura · cert_no_expropiacion · otro |
| `url_dropbox` | `fldEccoUrOjV7oKZ5` ✅ | URL | Path en Dropbox |
| `thumbnail_url` | `fld3AAAV0P496yZP0` ✅ | URL | |
| `tamanio_kb` | `fldLgyE0fdGOvuFAy` ✅ | Number | Ya viene en KB — nunca dividir por 1024 al mostrar. `lib/adjuntos.ts` corregido 10-jul-2026 (Fase Adjuntos 1) para leerlo directo, sin `cellFormat: 'string'` |
| `mime_type` | `fldyhpVhzD5eVfbRZ` ✅ | Single line text | |
| `subido_por` | `fldqAZk4Jf0C5Z4uH` ✅ | Single select | Opciones existentes: `Tasador · Ejecutivo · Sistema · Cliente · tasador` (mezcla de mayúsc/minúsc heredada — no crear opciones nuevas). El blueprint `SC-Adjuntos-Upload` (Fase Adjuntos 1) usa `Ejecutivo` como default |
| `subido_en` | `fldLdCyamAmiNAb6f` ✅ | Date time | |
| `fecha_subida` | `fldjGUehgdgZ5XvR1` ✅ | Created time | |
| `procesado_por_ia` | `fldNlxI8UVQTebdFQ` ✅ | Checkbox | |
| `hash_md5` | `fld9shmoBhZyNTK8x` ✅ | Single line text | **Llave de idempotencia** (D-14.4, Fase Adjuntos 1, 10-jul-2026). El cliente calcula MD5 antes de subir (`lib/adjuntos-uploader.ts`); el blueprint `SC-Adjuntos-Upload` hace Search Records por `hash_md5` y verifica en el Router si el resultado pertenece a la misma `solicitud` (no puede combinarlo en la fórmula del Search Records — ver nota de `codigo_solicitud` más arriba y E-018/E-024) antes de decidir si reusa el adjunto existente o sube uno nuevo |
| `clave_adjunto` | `fldaLLtzAaEn1O8IW` ✅ | Single line text | |
| `orden` | `fld0t0ytqAkd3bzvd` ✅ | Number | |
| `descripcion` | `fldsG18353kHMw0yQ` ✅ | Single line text | |
| `requerido_por_ejecutiva` | `fldhKxTGC76faGGv3` ✅ | Checkbox | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Distingue documentos del checklist obligatorio de adjuntos sueltos opcionales |
| `estado_extraccion` | `fld54epvDJ7YdJIYD` ✅ | Single select | Opciones: `idle · extrayendo · listo · error` (choice IDs `selVJKgo84b62ikEp` · `selfPHp5m6o0hPjgV` · `selICqKF879p4Y3r7` · `selMxROzMpcREqA9B`). El blueprint `SC-Adjuntos-Upload` (Fase Adjuntos 1) escribe `idle` al crear cada adjunto nuevo. Bloqueador de RF-09 resuelto — pendiente mapear en el escenario Make RF-09 (Fase Adjuntos 2, aún sin provisionar, BQ-3-c) |

**Decisión pendiente (Tanda B/C)**: ni `tipo` ni `tipo_adjunto` se llaman `tipo_documento` como asumía la documentación previa, y ninguno de los dos está referenciado hoy en código (no existe aún `/api/adjuntos/upload`). Ambos campos ya tienen equivalente de "otro" (`Otro` en `tipo`, `otro` en `tipo_adjunto`), por lo que cualquiera sirve para el checklist de documentos requeridos — el Data Designer debe decidir cuál usar (o si ambos cubren necesidades distintas) antes de mapear el checklist del formulario en Tanda B/C.

---

## 9. A_Eventos — campos clave

**TABLE_ID**: `tblMKmDg2KrO5fMn8`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `evento_id` | Autonumber (PK) | |
| `solicitud` | Link → TX_Solicitudes | FK |
| `tipo_evento` | **Single line text** | ⚠ No es select; texto libre. Valores usados: `solicitud_creada · tasador_asignado · reasignacion_manual · cambio_prioridad · solicitud_pausada · solicitud_cancelada` |
| `descripcion` | Long text | Detalle del evento |
| `usuario` | Single line text | Clerk user ID o nombre |
| `timestamp` | Created time | Append-only |
| `datos_json` | Long text (JSON) | Payload del evento |

---

## 10. A_Cambios — campos clave

**TABLE_ID**: `tbl6Yd0c7MRqNeC0x`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `cambio_id` | Autonumber (PK) | |
| `solicitud` | Link → TX_Solicitudes | FK |
| `tabla_afectada` | Single line text | Ej: `TX_Solicitudes` |
| `campo_modificado` | Single line text | Nombre del campo |
| `valor_anterior` | Long text | |
| `valor_nuevo` | Long text | |
| `motivo` | Single line text | `override_manual · ajuste_ejecutiva · ...` |
| `autor` | Single line text | Clerk user ID |
| `timestamp` | Created time | Append-only |

---

## 11. C_SLA — campos clave

**TABLE_ID**: `tblsPZokEK5aoinTn`

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `sla_id` | Autonumber (PK) | |
| `cliente` | Link → M_Clientes | FK |
| `tipo_informe` | Link → M_TiposInforme | FK |
| `tipo_propiedad` | Link → M_TiposPropiedad | FK. Vacío = todos |
| `sla_dias` | Number | Días totales desde solicitud_creada hasta entregada |
| `sla_dias_alerta` | Number | A qué día emitir alerta amarilla |
| `sla_dias_vencido` | Number | A qué día marcar como vencido |
| `dias_totales` | Number | Alias de `sla_dias` (verificar nombre real en MCP) |
| `dias_alerta_amarilla` | Number | Alias de `sla_dias_alerta` (verificar) |
| `dias_alerta_roja` | Number | Alias de `sla_dias_vencido` (verificar) |
| `activo` | Checkbox | |

---

## 12. LogEscenarios — campos clave

**TABLE_ID**: `tblR4VWpUHw1CSyIS`

> ⚠ **Sección corregida 13-jul-2026** (construcción RF-09, ver §13.5 para el detalle de la auditoría). La versión anterior de esta tabla documentaba campos que **no existen** en el Airtable real (`log_id`, `escenario`, `solicitud_id`, `estado` con opciones `ok/error/retry`, `payload_enviado`, `respuesta`, `timestamp`) — probablemente aspiracionales de una fuente canónica, nunca creados así. El escenario activo `SC-Adjuntos-Upload` todavía usa esos nombres viejos en su mapper (módulos 4 y 9) y sus writes a esta tabla probablemente fallan en silencio — ver §13.5.

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `Titulo Log` | `fldOLYPMstZl1cct6` | Single line text | **Primary field** |
| `Fecha / Hora` | `fldGRchH2Cc82fO4b` | Date time | |
| `Escenario` | `fldPktGeTzNCRQ319` | Single select | Opciones fijas: `Email tasador · Email cliente visita · Alerta SLA 2d · Alerta SLA 3d · Email informe PDF · UF diaria · Solicitud repetida · Informe visado · E1_Airtable_Make · E2_Carbone_Render · E3_Carbone_Download_Dropbox · E4_Notificacion_Email`. Ninguna corresponde a un escenario de IF-02 — falta agregar `SC-RF09-ExtraccionClaude` a mano (§13.4) |
| `Estado` | `fldTzSpyzbj1EOa7F` | Single select | Opciones reales: `✓ OK · ✗ Error · ⚠ Parcial · ⏭ Omitido` |
| `Trigger` | `fldvgIczpgBQJe2Lx` | Single line text | |
| `Destinatario` | `fld8wqOuOfUuN1RCo` | Single line text | |
| `Detalle` | `fldv9dn00kM8kNjDL` | Long text | Sin campos separados de payload/respuesta — usar este único campo para ambos, ej. `payload: {...} · respuesta: {...}` |
| `Duracion ms` | `fldFQYOwb1eHkLtbl` | Number | |
| `Reintentos` | `flddQtQpV0jveyjEC` | Number | |
| `ID Make` | `fldsBdTiOOKnDsE9K` | Single line text | |
| `Solicitud` | `fldLHWGlkTZNTESOF` | Single line text | Texto libre — guardar `codigo_ext` legible, no record ID |
| `ultima_modificacion` | `fldwS2YXDHHXNRhe1` | Last modified time | |

---

## 13. Campos pendientes de creación (D-08 + H-05)

Estos campos deben existir en Airtable antes de escribir los Route Handlers correspondientes.

| Tabla | Campo | Tipo | Creado por | Bloqueador |
|---|---|---|---|---|
| `TX_Solicitudes` | `notas_tasador` | Long text | D-08 | RF-05 (detalle) |
| `TX_Solicitudes` | `notas_visador` | Long text | D-08 | RF-05 (detalle) |
| ~~`TX_Solicitudes`~~ | ~~`ejecutiva_asignada`~~ | ~~Link → AUTH_Usuarios~~ | ✅ **Creado** 08-jul-2026 (Fase 2 · Tanda A, `fldv1XDfP7EgYC3km`) | Resuelto — ver §2 |
| `TX_Solicitudes` | *(campo trigger AT02)* | Checkbox | H-04 (nombre a confirmar) | RF-06 "Pasar a asignada" |
| ~~`TX_Adjuntos`~~ | ~~`estado_extraccion`~~ | ~~Single select~~ | ✅ **Creado** 08-jul-2026 (Fase 1 · cierre de pendientes IF-02, `fld54epvDJ7YdJIYD`) | Resuelto — ver §8 |
| `M_Tasadores` | `casos_en_curso` | Count link | H-05 | RF-06 selector inteligente |
| `M_Tasadores` | `disponible` | Formula | H-05 | RF-06 selector inteligente |

Tras el cierre de Fase 1 (08-jul-2026), los únicos campos genuinamente pendientes de creación son `notas_tasador`, `notas_visador` (D-08), el campo trigger de AT02 (H-04) y `casos_en_curso`/`disponible` en `M_Tasadores` (H-05) — ninguno de ellos estaba en el alcance aprobado de Fase 1.

### 13.1 Campos creados en Fase 2 · Tanda A (08-jul-2026)

| Tabla | Campo | FIELD_ID | Tipo |
|---|---|---|---|
| `TX_Solicitudes` | `email_contacto` | `fldjzUZsACA0vDlUq` | Email |
| `TX_Solicitudes` | `banco_financista` | `fldxcfdKRctHCgwmB` | Link → M_Bancos |
| `TX_Solicitudes` | `canal_contacto_original` | `fldca1Uza4eicBXL4` | Single select |
| `TX_Solicitudes` | `ejecutiva_asignada` | `fldv1XDfP7EgYC3km` | Link → AUTH_Usuarios |
| `AUTH_Usuarios` | `clerk_user_id` | `fldg3UHBuBfsWlxd0` | Single line text (⚠ sin unicidad forzada por Airtable) |
| `TX_Adjuntos` | `requerido_por_ejecutiva` | `fldhKxTGC76faGGv3` | Checkbox |

Ninguno de estos 6 campos está todavía mapeado en el blueprint SC01 (Tanda B) ni consumido por código (Tanda C).

### 13.2 Migración `TX_Solicitudes.banco` → Link (decisión de panel, 08-jul-2026)

Tras cerrar la Tanda A original, el panel decidió migrar `.banco` (banco originador) de texto libre a Link → M_Bancos, en vez de solo documentar la divergencia. Ejecutado vía MCP en 4 pasos:

1. Creados en `M_Bancos` los registros faltantes: `Banco Estado` (`rec8946QxRZRCN3yS`) y `Banco Security` (`recE6Q8aM8P3c9Qqw`).
2. Creado `TX_Solicitudes.banco_link` (`fldxlBazQKgQwureX`, Link → M_Bancos).
3. Migradas las 5 filas con `.banco` poblado a `banco_link` (mapeo exacto, incluyendo `METLIFE` → `MetLife Chile S.A.` por decisión de panel).
4. `.banco` (texto, `fldAgTlFXeXWfGTdI`) **no se tocó** — queda deprecated en paralelo hasta que Tanda B/C corten sobre `banco_link` (ver §2).

Detalle completo del proceso y aprobaciones en `docs/_notas/gap_solicitud_persistencia.md` (Tanda A, punto 8) y `docs/aprendizajes.md`.

### 13.3 Campo creado en Fase 1 · cierre de pendientes IF-02 (08-jul-2026)

Sesión de 4 fases (Airtable → Make → Frontend → corte `.banco`) para cerrar los pendientes de IF-02. Fase 1 auditó vía MCP los 8 campos de la Fase 2 · Tanda A (todos ya existentes, sin acción) y creó el único campo genuinamente faltante:

| Tabla | Campo | FIELD_ID | Tipo | Opciones |
|---|---|---|---|---|
| `TX_Adjuntos` | `estado_extraccion` | `fld54epvDJ7YdJIYD` | Single select | `idle · extrayendo · listo · error` |

Bloqueador de RF-09 (§8) resuelto. Pendiente: mapear en el escenario Make RF-09 (aún sin provisionar, BQ-3-c) y consumir desde `ExtraccionStatusBadge` (Paso 6 de `construccion.md`). `canal_contacto_original` se revisó en la misma fase y se decidió **no migrarlo** de Single select a texto libre (ver nota en §2).

### 13.4 Campos creados para RF-09 · Extracción con Claude API (13-jul-2026)

Creados vía MCP en la sesión autónoma de construcción de RF-09 (panel de expertos), Fase 1 · Tanda A. Diseño consolidado en el prompt de sesión — reemplaza el modelo de `docs/_notas/rf09_diseno.md` (ver nota de superación en ese archivo).

| Tabla | Campo | FIELD_ID | Tipo | Notas |
|---|---|---|---|---|
| `TX_Adjuntos` | `intentos_carga` | `fldmVd6GodswRoeAN` | Number (integer) | Intento de carga (1 o 2). Máximo 2, con archivos distintos — no hay reintento del mismo archivo. **Airtable no soporta valor por defecto vía API** — si el campo viene vacío/null, todo lector (`AT-RF09-Trigger`, `AT03-Ext`, UI) debe tratarlo como `1`, nunca asumir que existe un default real poblado por Airtable. |
| `TX_Adjuntos` | `atributos_esperados` | `flddFSPcRtbYbx1pB` | Long text (JSON) | Lista de atributos esperados según `D_TipoDocumentoAtributo` para el `tipo_documento` declarado (`clave_adjunto`). Poblado por el blueprint `SC-RF09-ExtraccionClaude` antes de llamar a Claude. |
| `TX_Adjuntos` | `atributos_obtenidos` | `fldeCH15RrL8f4TZk` | Long text (JSON) | Atributos efectivamente extraídos por Claude. |
| `TX_Adjuntos` | `datos_pendientes_visador` | `fldRRgtfu6xxmhNEr` | Long text (JSON) | Lista de atributos no obtenidos tras 2 intentos fallidos. Se puebla solo cuando `estado_extraccion = delegado_visador`. |
| `TX_Solicitudes` | `tiene_pendientes_visador` | `fldxozXDsho55PMd6` | Checkbox | `TRUE` cuando al menos un `TX_Adjuntos` de la solicitud queda en `delegado_visador`. Lo marca `AT03-Ext`/`AT-RF09-Trigger` directamente (no hay rollup automático — Airtable Automations no exponen "rollup" como tipo creable vía API de forma confiable para este caso, se escribe explícito). |

**⚠ Pendiente manual — limitación real del MCP (no del diseño):** `mcp__airtable__update_field` sólo acepta `options.formula` en su schema — **no expone ningún parámetro para agregar `choices` a un campo `singleSelect` existente** (confirmado contra el schema de la herramienta, 13-jul-2026; ver `docs/aprendizajes.md` E-033, mismo patrón de limitación que E-007 pero para "agregar opción" en vez de "cambiar tipo"). Dos campos quedan con expansión de opciones **pendiente de hacerse a mano en la UI de Airtable** antes del Checkpoint 1:

| Tabla | Campo | Opciones a agregar |
|---|---|---|
| `TX_Adjuntos` | `estado_extraccion` (`fld54epvDJ7YdJIYD`) | `skipped` · `no_corresponde` · `delegado_visador` (ya existen: `idle · extrayendo · listo · error`) |
| `LogEscenarios` | `Escenario` (`fldPktGeTzNCRQ319`) | `SC-RF09-ExtraccionClaude` (ver §13.5 — ninguna opción real actual corresponde a un escenario de IF-02) |

### 13.5 Hallazgo crítico: `LogEscenarios` tiene schema real distinto al documentado

Re-auditado vía MCP el 13-jul-2026 durante la construcción de RF-09. El §12 de este documento (y el mapper de `SC-Adjuntos-Upload.blueprint.json`, módulos 4 y 9) usan nombres de campo que **no existen** en la tabla real:

| Documentado / usado en blueprint | Campo real | Tipo real |
|---|---|---|
| `log_id` | *(no existe — el primary field real es `Titulo Log`, singleLineText)* | — |
| `escenario` | `Escenario` (`fldPktGeTzNCRQ319`) | singleSelect — opciones fijas: `Email tasador · Email cliente visita · Alerta SLA 2d · Alerta SLA 3d · Email informe PDF · UF diaria · Solicitud repetida · Informe visado · E1_Airtable_Make · E2_Carbone_Render · E3_Carbone_Download_Dropbox · E4_Notificacion_Email`. **Ninguna corresponde a SC01, SC-Adjuntos-Upload ni RF-09** |
| `solicitud_id` | `Solicitud` (`fldLHWGlkTZNTESOF`) | singleLineText |
| `estado` | `Estado` (`fldTzSpyzbj1EOa7F`) | singleSelect — opciones reales: `✓ OK · ✗ Error · ⚠ Parcial · ⏭ Omitido` (no `ok/error/retry` como documentaba este archivo) |
| `payload_enviado` | *(no existe un campo equivalente — usar `Detalle`, multilineText)* | — |
| `respuesta` | *(no existe — usar también `Detalle`)* | — |
| — | `Titulo Log` (`fldOLYPMstZl1cct6`, **primary field**) | singleLineText — sin equivalente documentado antes |
| — | `Fecha / Hora` (`fldGRchH2Cc82fO4b`) | dateTime |
| — | `Trigger` (`fldvgIczpgBQJe2Lx`) | singleLineText |
| — | `Destinatario` (`fld8wqOuOfUuN1RCo`) | singleLineText |
| — | `Duracion ms` (`fldFQYOwb1eHkLtbl`) | number |
| — | `Reintentos` (`flddQtQpV0jveyjEC`) | number |
| — | `ID Make` (`fldsBdTiOOKnDsE9K`) | singleLineText |
| — | `ultima_modificacion` (`fldwS2YXDHHXNRhe1`) | lastModifiedTime |

**Impacto**: el escenario **activo** `SC-Adjuntos-Upload` (módulos 4 y 9 de su blueprint) escribe a `escenario`/`solicitud_id`/`estado`/`payload_enviado`/`respuesta` — ninguno de esos 5 nombres existe en la tabla real. Esas llamadas a `Create Record` en `LogEscenarios` muy probablemente están fallando en silencio (o Airtable las rechaza con 422 y Make las reintenta/descarta según su política de error) desde que el escenario está activo. **No se corrige en esta sesión** (fuera de alcance de RF-09, tocar un blueprint ya importado y en producción sin que Sergio lo pruebe es riesgoso) — queda como hallazgo para que Sergio decida si vale la pena una tanda de reparación de `SC-Adjuntos-Upload`. El blueprint nuevo de esta sesión (`SC-RF09-ExtraccionClaude`) usa los nombres reales confirmados arriba.

---

## 14. Divergencias canónicas relevantes para el código

### H-04 · Campo trigger AT02 (PENDIENTE · P0 · bloqueador RF-06)

El botón "Pasar a asignada" actualiza un campo trigger (checkbox) en `TX_Solicitudes` para disparar AT02. Ningún documento fuente define el nombre exacto.

**Acción antes de RF-06**: el Ingeniero Airtable debe inspeccionar la configuración de AT02 en Airtable Automations, confirmar el nombre del campo trigger y actualizar este documento con el FIELD_ID real.

### H-05 · `disponible` y `casos_en_curso` en M_Tasadores

Definidos en tres fuentes canónicas (Capa Datos v2.6.2, Motor Cálculo v2.5, Blueprint v2.7 §7.2) pero no encontrados en el Airtable real al 04-jul-2026.

**Resolución**: el Ingeniero Airtable los crea. El Route Handler `/api/tasadores` filtra por `disponible = TRUE` y ordena por `casos_en_curso ASC`. Si el campo no existe aún, derivar disponibilidad de `capacidad_activa` en runtime como fallback temporal.

### H-07 · `n_operacion_cliente`: tipo Number en el Airtable real, Single line text en el diseño

| Fuente | Tipo |
|---|---|
| Capa Datos v2.6.2 (línea 2085) | Single line text |
| Airtable real (MCP 04-jul-2026) | **Number** — FIELD_ID `fldb1vmKk7y3hi4uY` |

**Resolución**: usar tipo `number` en los tipos TS. Si un cliente envía este campo como texto, el Route Handler parsea antes de pasar a Airtable.

---

## 15. AUTH_Usuarios y AUTH_Roles — campos detallados (RF-52)

### AUTH_Usuarios

**TABLE_ID**: `tblbX3hPD2uhqhl5v`

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `nombre` | `fldQicWUYaPc0w6bX` | Single line text | Nombre completo |
| `email` | `fldcWdlfA7duo2Je6` | Email | Correo corporativo |
| `estado` | `fldy3Xe6BXHYYxe2A` | Single select | `activo · inactivo · suspendido` |
| `rol` | `fldDJQacR69IMsM7Y` | Link → AUTH_Roles | FK. Define permisos por interfaz |
| `AUTH_DatosAcceso` | `fld2vdl2gR4DBDIvc` | Link → AUTH_DatosAcceso | Back-link. No usar en IF-02 v1 |
| `clerk_user_id` | `fldg3UHBuBfsWlxd0` ✅ | Single line text | **Creado** 08-jul-2026 (Fase 2 · Tanda A). Para lookup exacto desde la sesión Clerk. ⚠ Airtable no impone unicidad de campo vía API — si se requiere, validar en el Route Handler o en el escenario Make antes de crear/actualizar |

> `TX_Solicitudes.ejecutiva_asignada` (`fldv1XDfP7EgYC3km`, creado 08-jul-2026) enlaza a **esta tabla** (no a `M_Usuarios` — ese nombre no existe en el schema real).

### AUTH_Roles

**TABLE_ID**: `tblhJSBD9xh3ftwbs`

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `nombre_rol` | `fldAK2NkFnARPZHl1` | Single line text | `ejecutiva_comercial · visador · tasador` |
| `descripcion` | `fldUFGCjlva4WrvBB` | Long text | Descripción del rol y acceso |
| `activo` | `fldwTcSuxDlwK2Eeg` | Checkbox | Sólo roles activos válidos para asignar |

---

## 16. Endpoint base y autenticación

```
BASE_URL = https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{TABLE_ID}
Header:  Authorization: Bearer $AIRTABLE_TOKEN
```

El token vive **exclusivamente** en la variable de entorno server-only `AIRTABLE_TOKEN`. Nunca en `NEXT_PUBLIC_*`.

---

## 17. Reglas de uso en código

1. **Referenciar por FIELD_ID** cuando el nombre tenga espacio extra (`sucursal_originadora ` → `fldd56pLZyKYoi2Vi`) o riesgo de colisión.
2. **Tipos TS derivados de este archivo** — no de Capa Datos v2.6.2 cuando hay divergencia (ej. `n_operacion_cliente` es `number`, no `string`).
3. **Nunca escribir directo a Airtable desde el cliente** — siempre vía Route Handler.
4. **Escrituras de negocio** pasan por webhook Make (`/api/webhooks/*`) con firma HMAC-SHA256 (D-03), no directo a Airtable API.
5. **MCP Airtable** es solo para diseño/verificación en sesión. Nunca en código productivo compilado.
6. **Loggear** en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) cada llamada a Make.

---

## 18. Dominio D_ · Documentos paramétricos (auditado vía MCP 12-jul-2026, para RF-09)

Séptimo dominio del modelo (Capa Datos v2.6.2 §6.7). Patrón EAV polimórfico tipado. **Independiente**: verificado vía MCP que ninguna de las 8 tablas tiene link record hacia M_, C_, TX_, A_, H_ o Z_ (RN-33 se cumple). Todas las tablas ya tienen datos semilla/referencia poblados (no son producción viva — nadie ha escrito ahí desde Next.js/Make todavía; RF-09 es quien lo hará).

| Tabla lógica | TABLE_ID | Filas (12-jul-2026) |
|---|---|---|
| `D_TipoDato` | `tble0Na4Neon7Vz3z` | 7 |
| `D_Catalogo` | `tbljstH0ueFdiwgZX` | 11 |
| `D_CatalogoValor` | `tbliFo74Rge2yBsZ5` | — (no auditado fila por fila) |
| `D_TipoDocumento` | `tblkPhBnpdDmUWOl3` | 9 activas |
| `D_Atributo` | `tblOI0Su3ogySNeHm` | 67 |
| `D_TipoDocumentoAtributo` | `tbldI86ieVKpjpL7E` | 111 |
| `D_Documento` | `tblbGI2g0md8x3wCC` | 10 (datos de 2 informes reales METLIFE-6280 Avila Duran y METLIFE-6283 Vergara Undurraga) |
| `D_DocumentoValorAtributo` | `tblGcU6ZG7bf49mCO` | 92 |

### D_TipoDato

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fld8aoTEAzUQ94lv7` | Single line text |
| `nombre` | `fldC6lbOM9e5QU7OT` | Single line text |
| `descripcion` | `fldGTA4u7s58I5z09` | Long text |

Valores reales poblados: `texto · numero_entero · numero_decimal · fecha · booleano · rut · catalogo` (7, coincide exacto con Capa Datos v2.6.2).

### D_Catalogo / D_CatalogoValor

`D_Catalogo` (`codigo` `fldQLqLLBbfojgo9S` · `nombre` `fldTTfV9dBAzHkf7W` · `descripcion` `fld9BavMrQOS07JgY`). 11 catálogos reales: `material_estructura · calidad_sii · tipo_obra · tipo_propiedad · comuna · estado_conservacion · estado_documento · zona_ubicacion · tipo_agrupamiento · color_sello_sec · destino_sii`.

`D_CatalogoValor` (`codigo` `fldbdBt0hD6QWQcSP` · `catalogo` `fldpdkmJWKPptXcsX` Link → D_Catalogo · `valor` `fldvWFka6xS3HK5n0` · `orden` `fldjAhzuqQeQQsggA` · `activo` `fldRotIo0GpIsj6Uc`).

### D_TipoDocumento

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldmUdfw7C85mC4Yq` | Single line text (UQ) |
| `nombre` | `fldZFV4MViUpVzEz8` | Single line text |
| `descripcion` | `fldU5qCEGXS1BvVFc` | Long text |
| `entidad_emisora` | `fldVS6wwQj6Soy6Ze` | Single line text |
| `vigencia_dias` | `fldJRNPgz6PWejZ81` | Number |
| `activo` | `fldiSXRPd2mqgKOci` | Checkbox |

Los 9 `codigo` activos coinciden 1:1 con los defaults de `nuevaSolicitudInternaDefaults` en `lib/schemas.ts` y con el checklist de `NewRequestSheet`: `certificado_recepcion_final · plano_cuadro_superficies · certificado_avaluo_fiscal · permiso_edificacion · certificado_deuda_tgr · informe_no_expropiacion_serviu · inscripcion_dominio_cbr · consulta_antecedentes_bien_raiz · sello_verde_sec`.

### D_Atributo

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldsPSr4DuE8aHidf` | Single line text (UQ) |
| `nombre` | `fldma4jDxIXUssG7f` | Single line text |
| `descripcion` | `fldQXzIafQLpz0XKM` | Long text |
| `tipo_dato` | `fldoPVhfLCkMRfVAw` | Link → D_TipoDato |
| `catalogo` | `fldddTUMlInSq4OJl` | Link → D_Catalogo |
| `unidad_medida` | `fldQooJOeHVF07YhA` | Single line text |
| `patron_validacion` | `fldHjHU6nLTquvIkM` | Single line text |
| `usado_motor_calculo` | `fldsNCE34vaUq45dp` | Checkbox |
| `uso_interfaz_negocio` | `fldhUnsTjcjY4Jnqs` | Checkbox |
| `ejemplo_atributo` | `fld4TmoH8f64A8Rom` | Single line text |
| `uso_tabla_destino` | `fldymPEoX5yTNXuTm` | Single line text |
| `uso_campo_destino` | `fldpjvQNI0Kpzn3Wv` | Single line text |
| `version` | `fldVa989k1aO6gVXV` ✅ | Number (integer) | **Creado 12-jul-2026.** Faltaba — documentado en Capa Datos v2.6.2 como campo nuevo v8.1 para reproducibilidad histórica del prompt Claude, pero nunca creado en Airtable real. Sin valor poblado en las 67 filas existentes; RF-09 debe inicializarlo en 1 la primera vez que escriba cada atributo. |

### D_TipoDocumentoAtributo

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldUhfgFj18G0caux` | Single line text |
| `tipo_documento` | `fldZXsrFr8HlsM70j` | Link → D_TipoDocumento |
| `atributo` | `fldlPYqhzJGvxb5nL` | Link → D_Atributo |
| `obligatorio` | `fldrySOzNz7iBhJ4K` | Checkbox |
| `orden` | `fld8LT1GoIAxlxJdF` | Number |
| `etiqueta_local` | `fld0Idiu35Grg7pjO` | Single line text |
| `valor_por_defecto` | `fldkkeOf20GrGgBas` | Single line text |

`codigo` sigue el patrón `<tipo_documento>__<atributo>` (ej. `permiso_edificacion__direccion`). 111 filas reales, todas con `tipo_documento`/`atributo` poblados.

### D_Documento

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo_documento` | `fldIKM3dnfQ8jCBjc` | Single line text (UQ) |
| `tipo_documento` | `fldt3LXQ2QmMKR4dm` | Link → D_TipoDocumento |
| `nombre_archivo` | `fld1TSQxxudi9J7eI` | Single line text |
| `ruta_archivo` | `fld5nHT8eVMuPjzAJ` | URL |
| `fecha_emision` | `fldqAujLM63iqq6FT` | Date |
| `fecha_carga` | `fldqE5hKaLYvg8xDx` | Date time |
| `estado` | `fldUJdYCXggB7JiLn` | Single select (`vigente · vencido · observado · anulado`) |
| `hash_archivo` | `fld0CeVfsRRZxmM0C` | Single line text |
| `extraccion_incompleta` | `fldewUdLQOpVpSe7M` ✅ | Checkbox | **Creado 12-jul-2026.** Faltaba — adenda v2.6.2 (Especificación v1.4 §4.4, decisión D-3). TRUE cuando RF-09 produce al menos un atributo con valor null por fallo de extracción o baja confianza; no bloquea el guardado, la UI resalta los campos afectados. |

### D_DocumentoValorAtributo

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldg8aX24cCQZgUMw` | Single line text |
| `documento` | `fldysmZpM1rifUigK` | Link → D_Documento |
| `tipo_documento_atributo` | `fldU249WyZE5rVCP2` | Link → D_TipoDocumentoAtributo |
| `valor_texto` | `fldcIfYLXQVRQtvDi` | Long text |
| `valor_numero` | `fldVwJDIZIDpf96s9` | Number (decimal) |
| `valor_fecha` | `fldDbaBG4CqHfyLCJ` | Date |
| `valor_booleano` | `fldsU5C0nTtg8Y5Zo` | Checkbox |
| `catalogo_valor` | `fldma8qGnQMRqjB3j` | Link → D_CatalogoValor |

RN-32 (validación EAV polimórfica): exactamente una de las 5 columnas de valor debe estar poblada, correspondiente al `tipo_dato` del atributo referenciado. No hay Airtable Automation `AT-D01` verificable desde el MCP (fuera de su alcance) — RF-09 debe respetar esta regla en el escritor (Airtable Script o Make), no asumir que Airtable la valida sola.

### Gaps cerrados en esta auditoría (12-jul-2026)

| Tabla | Campo | FIELD_ID | Acción |
|---|---|---|---|
| `D_Atributo` | `version` | `fldVa989k1aO6gVXV` | Creado vía MCP, aprobado por Sergio |
| `D_Documento` | `extraccion_incompleta` | `fldewUdLQOpVpSe7M` | Creado vía MCP, aprobado por Sergio |

Ningún otro campo documentado en Capa Datos v2.6.2 §6.7 falta en el Airtable real — el resto del dominio D_ coincide exactamente entre documentación y schema real.

---

## 19. Re-auditoría completa de `TX_Solicitudes` (13-jul-2026)

Verificación campo por campo de §2 contra `list_tables_for_base` + `get_table_schema` vía MCP, a solicitud de Sergio ("verifica el schema de TX_Solicitudes contra docs/schema-airtable.md"). Sin escritura de código en esta sesión — solo lectura/comparación.

### 19.1 Divergencia crítica: `codigo_solicitud` cambió de texto a fórmula

Documentado desde el 10-jul-2026 (Fase Adjuntos 1) como Single line text, primary field, poblado manualmente por Sergio. La re-auditoría confirmó vía `get_table_schema` que **hoy es un campo `formula`, read-only**:

```
"VP-" & YEAR({fecha_solicitud}) & "-" & RIGHT("0000" & {solicitud_id} & "", 4)
```

Es funcionalmente idéntica a `codigo_ext` (`fldSuJx1fDNYYwDcD`). No hay registro en este repo de quién convirtió el campo ni cuándo exactamente entre el 10-jul y el 13-jul — probablemente un cambio hecho directamente en la UI de Airtable fuera de una sesión de Claude Code.

**Impacto**: la tarea pendiente "mapear `codigo_solicitud = {{7.codigo_ext}}` en el módulo 7 de SC01" (documentada en §2 hasta esta sesión) queda **obsoleta** — el campo ya no acepta escritura desde Make ni desde ningún Route Handler. Corregido en §2.

### 19.2 Divergencia menor: `fecha_solicitud` es Date time, no Date

`get_table_schema` confirma tipo `dateTime` (formato ISO `YYYY-MM-DD`, hora 12h, timezone client), no `date` como documentaba §2. No se detectó impacto en código existente, pero cualquier Route Handler que parsee este campo asumiendo solo fecha debe tolerar el componente de hora. Corregido en §2.

### 19.3 Campos v2.3/v2.4 documentados que no existen en el Airtable real

`hora_visita`, `hora_entrega`, `contacto_observaciones`, `codigo_corto`, `vivienda_social`, `ejecutivo`, `contacto_nombre`, `contacto_fono`, `casa_numero` — ninguno aparece en el schema real de `TX_Solicitudes`. Mismo patrón que ya se había detectado en `TX_Adjuntos` (§8): campos aspiracionales de una fuente canónica que nunca se crearon en Airtable. `profesion_solicitante` (también v2.3) sí existe y fue confirmado con FIELD_ID (`fld63DYDVnVaAmhAH`). Tachados en §2 con nota de esta auditoría.

### 19.4 Confirmado: H-04 sigue vigente — no existe ningún campo `checkbox` en toda la tabla

Se listaron los ~90 campos reales de `TX_Solicitudes` y ninguno es de tipo `checkbox`. Esto descarta que el campo trigger de AT02 (H-04) ya exista con otro nombre: sigue siendo un bloqueador real y pendiente para RF-06, no una omisión de documentación.

### 19.5 Campos reales sin documentar (fuera de alcance IF-02)

No corregidos individualmente en §2 por ser de dominio Motor de Cálculo (AT01–AT10) o metadatos internos, ajenos al contrato de IF-02. Se dejan listados aquí para referencia futura si algún RF de IF-02 llegara a necesitarlos:

`region`, `nro_interno`, `sup_terreno_m2`, `sup_construccion_m2`, `valor_comercial_uf`, `avaluo_fiscal_clp`, `anio_construccion`, `numero_solicitud`, `uf_dia_visita`, `velocidad_venta`, `notas` (⚠ genérico — no confundir con los pendientes `notas_tasador`/`notas_visador` de §13), `dias_desde_visita`, `fecha_limite_entrega`, `fecha_creacion` (createdTime, distinto de `fecha_solicitud`), `lookup_rango_min`, `lookup_rango_max`, `fuera_rango`, `ultima_modificacion`, más ~17 campos `*_override` (tasa_cap_rate, vida_util, valor_final, valor_reposicion, valor_garantia, valor_seguro, valor_liquidacion, valor_remate, valor_remate_65, renta_perpetua, ingreso_liquido_anual, factor_depreciacion, uf_m2_nuevo, factor_remate, factor_liquidacion, override_motivo, override_autor) y los links de vuelta a otras tablas (`TX_DatosTasacion`, `TX_Calculos`, `A_DecisionesMotor`, `TX_Comparables`, `TX_ItemsCuadroValoracion`, `TX_ObrasComplementarias`, `TX_Adjuntos`, `TX_DocumentosGenerados`, `TX_Notificaciones`, `A_Eventos`, `A_ErroresMake`, `Z_EjecucionesMake`, `Z_ColaPendientes`, `TX_CasosRegresion`, `TX_Ampliaciones`, `TX_HabitacionesPorNivel`, `TX_TerminacionesPorRecinto`, `TX_DocumentosLegales`).

### 19.6 Todo lo demás coincide

`fecha_visita_programada`, `visador`, `semaforo_sla`, `prioridad`, `origen_canal`, `solicitante_nombre`, `solicitante_telefono`, `n_operacion_cliente`, `sucursal_originadora ` (espacio final confirmado), `ejecutivo_solicitante`, `comision_ov`, `monto_estimado_uf`, `banco`, `banco_link`, `ejecutiva_asignada`, `email_contacto`, `banco_financista`, `canal_contacto_original`, `codigo_ext`, `solicitud_id` — FIELD_IDs y tipos verificados coinciden exactamente entre documentación y schema real.
