# schema-airtable.md · VProperty · IF-02 · CU-002

> **Versión**: 1.2 · Alineado a Capa de Datos v2.6.2 · Auditoría v1.2 (06-jul-2026)
> **Origen**: snapshot MCP Airtable (04-jul-2026) + correcciones de auditoría v1.2
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
| `codigo_ext` | `fldSuJx1fDNYYwDcD` ✅ | Formula | `'VP-' & YEAR(fecha_solicitud) & '-' & LPAD(solicitud_id,4,'0')`. Read-only |
| `fecha_solicitud` | — | Date | Cuándo se recibió |
| `cliente` | — | Link → M_Clientes | FK. Solo activos en selectores |
| `banco` | — | Link → M_Bancos | FK. Opcional salvo hipotecario |
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
| `hora_visita` | — | Duration | [v2.3] Hora real de la visita |
| `hora_entrega` | — | Duration | [v2.3] Hora comprometida de entrega |
| `profesion_solicitante` | — | Single line text | [v2.3] Override por caso |
| `contacto_observaciones` | — | Long text | [v2.3] Datos de contacto y restricciones de acceso |
| `codigo_corto` | — | Single line text | [v2.4] Últimos 4 dígitos de solicitud_id |
| `vivienda_social` | — | Single select | [v2.4] Si/No |
| `ejecutivo` | — | Single line text | [v2.4] Nombre del ejecutivo del cliente |
| `contacto_nombre` | — | Single line text | [v2.4] Nombre de contacto |
| `contacto_fono` | — | Single line text | [v2.4] Teléfono de contacto |
| `casa_numero` | — | Single line text | [v2.4] Número de dirección |
| `solicitante_nombre` | — | Single line text | [v2.6] Persona natural titular del trámite |
| `solicitante_telefono` | — | Phone number | [v2.6] Teléfono del solicitante |
| `n_operacion_cliente` | `fldb1vmKk7y3hi4uY` ✅ | **Number** (⚠ H-07) | [v2.6] Capa Datos v2.6.2 lo define como text; el Airtable real lo tiene como number. Usar tipo `number` en TS |
| `sucursal_originadora` | `fldd56pLZyKYoi2Vi` ✅ | Single line text | [v2.6] ⚠ **Nombre con espacio final** en Airtable real (`sucursal_originadora `). Corregir con D-08. Hasta entonces referenciar por FIELD_ID |
| `ejecutivo_solicitante` | `fldRweQyq3tTQGmPR` ✅ | Single line text | [v2.6] Spec usaba `ejec_solicitante`; nombre real conservado (D-08) |
| `comision_ov` | — | Number (4 dec) | [v2.6 TBD-09] Pendiente confirmación semántica |
| `notas_tasador` | ⚙ pendiente | Long text | **Crear** (D-08). Instrucciones para el tasador |
| `notas_visador` | ⚙ pendiente | Long text | **Crear** (D-08). Contexto para la revisión |
| `ejecutiva_asignada` | ⚙ pendiente | Link → M_Usuarios | **Crear** (D-08 + D-02). Alimenta vista "Mi cartera". Asignación automática = usuario Clerk |
| *(campo trigger AT02)* | ⚠ H-04 | Checkbox (probable) | **Nombre desconocido**. Confirmar en UI Airtable Automations antes de RF-06 |

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

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `adjunto_id` | Autonumber (PK) | |
| `solicitud` | Link → TX_Solicitudes | FK |
| `tipo_documento` | Single select | SII · CBR · Permiso · RecepcionFinal · Foto · Otro |
| `url_dropbox` | URL | Path en Dropbox |
| `nombre_archivo` | Single line text | |
| `tamano_bytes` | Number | |
| `estado_extraccion` | Single select | ⚙ **Crear si no existe**. `idle · extrayendo · listo · error` — escrito por RF-09 |
| `creado_en` | Created time | |

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

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `log_id` | Autonumber (PK) | |
| `escenario` | Single line text | SC01 · SC05 · RF-09 · ... |
| `solicitud_id` | Single line text | Referencia al código VP-AAAA-NNNN |
| `estado` | Single select | ok · error · retry |
| `payload_enviado` | Long text (JSON) | |
| `respuesta` | Long text | |
| `timestamp` | Created time | |

---

## 13. Campos pendientes de creación (D-08 + H-05)

Estos campos deben existir en Airtable antes de escribir los Route Handlers correspondientes.

| Tabla | Campo | Tipo | Creado por | Bloqueador |
|---|---|---|---|---|
| `TX_Solicitudes` | `notas_tasador` | Long text | D-08 | RF-05 (detalle) |
| `TX_Solicitudes` | `notas_visador` | Long text | D-08 | RF-05 (detalle) |
| `TX_Solicitudes` | `ejecutiva_asignada` | Link → M_Usuarios | D-08 + D-02 | RF-05 vista "Mi cartera" |
| `TX_Solicitudes` | *(campo trigger AT02)* | Checkbox | H-04 (nombre a confirmar) | RF-06 "Pasar a asignada" |
| `TX_Adjuntos` | `estado_extraccion` | Single select | D-08 | RF-09 |
| `M_Tasadores` | `casos_en_curso` | Count link | H-05 | RF-06 selector inteligente |
| `M_Tasadores` | `disponible` | Formula | H-05 | RF-06 selector inteligente |

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

## 15. Endpoint base y autenticación

```
BASE_URL = https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{TABLE_ID}
Header:  Authorization: Bearer $AIRTABLE_TOKEN
```

El token vive **exclusivamente** en la variable de entorno server-only `AIRTABLE_TOKEN`. Nunca en `NEXT_PUBLIC_*`.

---

## 16. Reglas de uso en código

1. **Referenciar por FIELD_ID** cuando el nombre tenga espacio extra (`sucursal_originadora ` → `fldd56pLZyKYoi2Vi`) o riesgo de colisión.
2. **Tipos TS derivados de este archivo** — no de Capa Datos v2.6.2 cuando hay divergencia (ej. `n_operacion_cliente` es `number`, no `string`).
3. **Nunca escribir directo a Airtable desde el cliente** — siempre vía Route Handler.
4. **Escrituras de negocio** pasan por webhook Make (`/api/webhooks/*`) con firma HMAC-SHA256 (D-03), no directo a Airtable API.
5. **MCP Airtable** es solo para diseño/verificación en sesión. Nunca en código productivo compilado.
6. **Loggear** en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) cada llamada a Make.
