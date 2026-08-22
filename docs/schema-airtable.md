# schema-airtable.md · VProperty · IF-02 · CU-002

> **Versión**: 1.12 · Alineado a Capa de Datos v2.6.5 · Especificación v1.9.9 · Auditoría v1.2 · RF-52 AUTH_ domain (07-jul-2026) · Fase 2 Tanda A gap de persistencia (08-jul-2026) · Fase 1 cierre de pendientes IF-02 (08-jul-2026) · Fase Adjuntos 1 (D-11 a D-14, 10-jul-2026) · Dominio D_ auditado para RF-09 (12-jul-2026) · Re-auditoría `TX_Solicitudes` completa (13-jul-2026, ver §19) · Construcción RF-09: 5 campos nuevos + corrección `LogEscenarios` (13-jul-2026, ver §13.4/§13.5) · Re-auditoría dominio D_ (17-jul-2026, ver §18): confirmado que la migración a 2 tablas + TX_Unidades ya se ejecutó en la base real — D_TipoDato/D_Catalogo/D_CatalogoValor/D_Atributo/D_Documento/D_DocumentoValorAtributo ya no existen · **Schema de soporte a la maqueta v1.9 documentado 22-jul-2026 (ver §20): 7 campos nuevos en TX_Solicitudes, 8 en TX_Unidades, tablas nuevas TX_ContactosVisita/TX_Vendedor/M_TiposDeBien, bloque SII en TX_DatosTasacion. AT02 marcado fuera de alcance de IF-02 (asignación manual, REGLA A)** · **Verificación MCP del schema v1.9 (24-jul-2026, ver §21): confirmado que las tablas/campos de §20 ya existen en la base — creados los 9 campos legales de `TX_DocumentosLegales`; `TX_Vendedor` NO existe (vendedor vive como campos en `TX_Solicitudes`); 5 conflictos abiertos en §21.4** · **Resolución de panel (24-jul-2026, ver §21.4): creado `tipo_propiedad_nuevo_usado` (singleSelect nuevo·usado); creado `fecha_asignacion_ts` (dateTime) y `fecha_asignacion` (date) marcado deprecated — MCP no migra tipo in situ; opciones cortas `cert_avaluo`/`cert_numero` adoptadas como canónicas en `origen_direccion` y `vendedor_origen_dato`; `sup_terreno_m2` (precision 0) adoptado, `superficie_terreno_m2` descartado**
>
> ⚠ **Higiene documental 30-jul-2026 · re-verificada 08-ago-2026 · puntero movido a v1.9.8 el 11-ago-2026 · movido a v1.9.9 el 13-ago-2026**: los punteros de versión
> de esta cabecera se actualizaron a los archivos que realmente existen en `docs/_md/`
> (Especificación **v1.9.9**, Blueprint **v2.10**, Capa de Datos **v2.6.5**). Las citas a
> secciones concretas de versiones anteriores que aparecen en el cuerpo **no se
> re-verificaron** contra v1.9.7, v1.9.8 ni v1.9.9: se conservan tal cual y quedan marcadas como deuda de
> revisión, porque cambiarles el número sin diffear el spec convertiría un puntero
> viejo en una afirmación falsa. La tanda del 08-ago-2026 sólo movió el puntero de
> cabecera. El nombre real de la tabla de feriados (`C_Feriados`, §3) diverge del
> `H_Feriados` que usa la spec — registrado como CI-007, no corregido aquí.
> **Origen**: snapshot MCP Airtable (04-jul-2026) + correcciones de auditoría v1.2 + verificación/creación de campos MCP (08-jul-2026, ver `docs/_notas/gap_solicitud_persistencia.md`) + re-verificación MCP y creación de `TX_Adjuntos.estado_extraccion` (08-jul-2026, Fase 1 cierre de pendientes IF-02) + hallazgo `TX_Solicitudes.codigo_solicitud` (primary field) y llave de idempotencia `hash_md5` (10-jul-2026, Fase Adjuntos 1) + auditoría completa del dominio D_ y creación de `D_Atributo.version` + `D_Documento.extraccion_incompleta` (12-jul-2026, ver §18 histórico) + re-auditoría completa de campos reales de `TX_Solicitudes` vía `list_tables_for_base`/`get_table_schema` (13-jul-2026, ver §19) + re-auditoría dominio D_ vía MCP confirmando migración a 2 tablas + TX_Unidades (17-jul-2026, ver §18)
> **Base**: `app9G7lLkIV3CpeLa`
> **Propósito**: fuente de verdad permanente de TABLE_IDs y FIELD_IDs para Claude Code. Leer al inicio de cada sesión antes de escribir Route Handlers o tipos TS.
> **Regla**: en código, preferir FIELD_ID (`fld…`) sobre nombre cuando haya riesgo de colisión o espacio extra. Si el FIELD_ID no está listado aquí, usar el nombre lógico de Capa Datos v2.6.3.

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
| `C_FactoresHomogeneizacion` | `tblep24N9gPMrDPIN` | No usada en IF-02. **Es la canónica de IF-03** para los tres factores de RF-TAS-08, ratificados el 22-ago-2026 (A-28). `valor_referencia` sigue **vacío en sus 15 filas**: poblarla es A-18, la única pregunta bloqueante de ese frente. Ver CI-022 |
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
| `TX_DocumentosLegales` | `tbl7qIg5x4Y0tOiLk` | IF-03 aguas abajo · +9 campos legales v1.9 (24-jul-2026, ver §21.3) |
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
| `fecha_solicitud` | `fldvkn9CsORy4eU0Z` ✅ | Date (⚠ real es **Date time**, ver §19) | Cuándo se recibió. Alimenta el segmento `INFORMES_{AAAA}` del path Dropbox (spec §8.1) — el año se calcula sobre la marca **convertida a America/Santiago**, no sobre el UTC crudo (§8.5) |
| `cliente` | `fldttL5myzLohDwHv` ✅ | Link → M_Clientes | FK. Solo activos en selectores. Es el único camino al segmento `{Cliente}` del path Dropbox: se resuelve el link y se lee `M_Clientes.nombre` (§8.5). Los campos `cliente_slug` y `M_Clientes.slug_url` que las versiones ≤ v1.9.5 del spec daban por fuente **no existen** en esta base |
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
| `estado` | `fld2H2r0GMeVfNO26` ✅ | Single select | creada · asignada · visitada · calculada · pdf_listo · devuelta · aprobada · pendiente_final · entregada · cerrada · cancelada · requiere_atencion. FIELD_ID verificado vía meta API el 27-jul-2026 (nombre exacto `estado`, sin espacios). No confundir con `estado_conservacion` (`flde0ExWfB1dhkp4t`), también singleSelect en esta tabla. |
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

| Campo | FIELD_ID | Tipo Airtable | Notas |
|---|---|---|---|
| `cliente_id` | — | Autonumber (PK) | |
| `codigo_externo` | — | Single line text (UQ) | Para identificación en informes |
| `nombre` | `fldDGR9WLhOtIbikW` ✅ | Single line text | Razón social. **Fuente única del segmento `{Cliente}` del path Dropbox** (spec §8.5, verificado vía MCP 06-ago-2026): se normaliza con `normalizarCliente()` de `lib/dropbox-path.ts`. Es texto libre con mayúsculas y acentos inconsistentes —conviven `AFIANZA` y `Afianza` como filas distintas—, y la normalización los colapsa a la misma carpeta a propósito |
| `tipo` | — | Single select | Banco · Compañía de seguros · Mutuaria · Caja · Inmobiliaria |
| `rut` | — | Single line text (UQ) | |
| `email_contacto` | — | Email | |
| `productos` | — | Link → M_Productos | Filtra M_TiposInforme disponibles en el formulario |
| `bancos_asociados` | — | Link → M_Bancos | |
| `activo` | — | Checkbox | Solo activos en selectores |

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
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | `requiere_subtipo` (checkbox) · **dominio saneado — ver §7.1** |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | `activo` (checkbox) |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | `activo` (checkbox) |

### 7.1 `M_TiposPropiedad` — dominio saneado (22-ago-2026 · P0.5.B-TAS)

**Convención de capitalización: Title Case**, alineada con `ListaTipoPropiedad`
`[Excel: FICHA SOLIC!AD25:AD32]`. Toda alta futura la respeta.

**9 filas activas** — las 8 del Excel más `Bodega`:

| `nombre` | Record ID | `categoria` | Links vivos |
|---|---|---|---|
| `Casa` | `recrXDAjlVCe59XBW` | Habitacional | **38** · 6 solicitudes + 6 reglas + 13 vida útil + 4 precios + 7 comparables + 1 SLA + 1 plantilla |
| `Departamento` | `recf9hz8TbkQ6wsus` | — | **21** · 20 solicitudes + 1 regla |
| `Bodega` | `rechtTVCD9YbfD08T` | — | **8** solicitudes · ⚠ fuera del dominio del Excel — ver **A-40** |
| `Oficina` | `rec3zizQ4VNa3VZBo` | — | **5** solicitudes |
| `Casa Piloto` | `recoCHaCWolPWtgeW` | Habitacional | 0 · **alta 22-ago-2026** |
| `Departamento Piloto` | `reck6cHbNAcmJPj8X` | Habitacional | 0 · **alta 22-ago-2026** |
| `Local Comercial` | `recPiUiPFgQblO4HQ` | — | 0 |
| `Sitio` | `recuRG89tkR7srCS2` | — | 0 |
| `Terreno` | `recuHxhPUhS5HxdHP` | — | 0 |

**6 filas en baja lógica** (`activo = false`, 0 links) — reversibles, y `lib/catalogos.ts` las
excluye sola por su filtro `{activo} = TRUE()`: `EDIFICIO` (`rec9t6YyVzvRAUdHE`),
`ESTACIONAMIENTO` (`rec1K8CFwYioHAdwE`), `GALPON` (`rec8eeyZUpXU8P6s5`), `INDUSTRIA`
(`recloRBc7s99pLg7x`), `OTRO` (`reccoaabDUvg7O79h`), `PILOTO` (`recS12nTcW9HxAmMo`). Conservan su
nombre en mayúsculas a propósito: son filas retiradas, no parte del dominio vigente.

**2 filas eliminadas**: `CASA` (`rec5J0dPImsDm5Leb`) y `DEPARTAMENTO` (`recJ0OIjob9ywogr6`), tras
migrar sus 26 links y verificar conteo 0.

> **Por qué existían los duplicados y por qué importaba.** No estaban solapados: `CASA` y
> `DEPARTAMENTO` acumulaban **sólo** links transaccionales (26 solicitudes de jul–ago-2026) y
> `Casa`/`Departamento` **sólo** configuración (33 referencias del alta inicial). La línea de corte
> era exactamente la frontera transacciones / configuración, de modo que **ninguna de las 39
> solicitudes podía resolver su regla de negocio, su vida útil ni su SLA por este eje**. No era un
> duplicado cosmético: era una desconexión funcional viva en la base. El saneamiento la repara.

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
| `Escenario` | `fldPktGeTzNCRQ319` | Single select | **19 opciones reales, verificadas vía meta API el 05-ago-2026** (`GET /v0/meta/bases/{base}/tables`, no MCP): `Email tasador · Email cliente visita · Alerta SLA 2d · Alerta SLA 3d · Email informe PDF · UF diaria · Solicitud repetida · Informe visado · E1_Airtable_Make · E2_Carbone_Render · E3_Carbone_Download_Dropbox · E4_Notificacion_Email · SC-RF09-ExtraccionClaude · SC-Asignar · SC-Edicion · SC01 · ADJUNTOS_UPLOAD · ADJUNTOS_DELETE · ADJUNTOS_UPLOAD_V2`. Las 6 últimas se crearon a mano en la UI (las cuatro primeras el 27-jul-2026; `ADJUNTOS_DELETE` y `ADJUNTOS_UPLOAD_V2` el 05-ago-2026 para Tanda 3). **Al agregar un escenario nuevo, crear primero la opción aquí y recién después declararla en `lib/make-client.ts` (`ESCENARIO_CHOICE`) o mapearla en un blueprint**: los módulos Airtable de los blueprints van con `typecast: false` y un valor inexistente devuelve 422 `INVALID_MULTIPLE_CHOICE_OPTIONS`, que corta la ejecución de Make; el lado Next.js va con `typecast: true` y falla más blando (`Insufficient permissions to create new select option`, error tragado y fila de log perdida) |
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

**⚠ Pendiente manual — limitación real del MCP (no del diseño):** `mcp__airtable__update_field` sólo acepta `options.formula` en su schema — **no expone ningún parámetro para agregar `choices` a un campo `singleSelect` existente** (confirmado contra el schema de la herramienta, 13-jul-2026; ver `docs/aprendizajes.md` E-033, mismo patrón de limitación que E-007 pero para "agregar opción" en vez de "cambiar tipo"). Dos campos quedaron con expansión de opciones **pendiente de hacerse a mano en la UI de Airtable** antes del Checkpoint 1 — ambos ya resueltos, ver columna «Estado»:

| Tabla | Campo | Opciones a agregar | Estado |
|---|---|---|---|
| `TX_Adjuntos` | `estado_extraccion` (`fld54epvDJ7YdJIYD`) | `skipped` · `no_corresponde` · `delegado_visador` (ya existían: `idle · extrayendo · listo · error`) | ✅ **RESUELTO** — las 7 opciones existen, verificado vía meta API el 05-ago-2026 |
| `LogEscenarios` | `Escenario` (`fldPktGeTzNCRQ319`) | `SC-RF09-ExtraccionClaude` (ver §13.5) | ✅ **RESUELTO** el 27-jul-2026 junto con `SC-Asignar`, `SC-Edicion`, `SC01` y `ADJUNTOS_UPLOAD`; ver §12 para las 19 opciones actuales |

> ✅ **Ambas filas cerradas al 05-ago-2026.** La creación se hizo a mano en la UI de
> Airtable, como exigía la limitación del MCP descrita arriba. La verificación **no** usó
> MCP: se leyó el schema con `GET https://api.airtable.com/v0/meta/bases/{base}/tables` y
> el token `AIRTABLE_TOKEN` (solo lectura de schema), comparando cada opción con `repr()`
> para descartar espacios finales. El párrafo anterior se conserva porque documenta una
> limitación real y fechada del MCP (E-033), no porque quede trabajo pendiente.

### 13.5 Hallazgo crítico: `LogEscenarios` tiene schema real distinto al documentado

Re-auditado vía MCP el 13-jul-2026 durante la construcción de RF-09. El §12 de este documento (y el mapper de `SC-Adjuntos-Upload.blueprint.json`, módulos 4 y 9) usan nombres de campo que **no existen** en la tabla real:

| Documentado / usado en blueprint | Campo real | Tipo real |
|---|---|---|
| `log_id` | *(no existe — el primary field real es `Titulo Log`, singleLineText)* | — |
| `escenario` | `Escenario` (`fldPktGeTzNCRQ319`) | singleSelect — 19 opciones reales al 05-ago-2026 (ver §12 para la lista completa y la regla de "crear la opción antes de usarla"). ⚠ **La observación original de esta fila —"ninguna opción corresponde a SC01, SC-Adjuntos-Upload ni RF-09"— era cierta el 13-jul-2026 y quedó resuelta**: `SC-RF09-ExtraccionClaude`, `SC-Asignar`, `SC-Edicion`, `SC01` y `ADJUNTOS_UPLOAD` se crearon a mano el 27-jul-2026, y `ADJUNTOS_DELETE` + `ADJUNTOS_UPLOAD_V2` el 05-ago-2026 (Tanda 3) |
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

## 18. Dominio D_ · Documentos paramétricos (re-auditado vía MCP 17-jul-2026, alineado a Especificación v1.8.2)

Séptimo dominio del modelo (Capa Datos v2.6.3 §6.7). **Migración de schema ya ejecutada en la base real**: las 6 tablas EAV que documentaba esta sección hasta el 12-jul-2026 (`D_TipoDato`, `D_Catalogo`, `D_CatalogoValor`, `D_Atributo`, `D_Documento`, `D_DocumentoValorAtributo`) **ya no existen** en `app9G7lLkIV3CpeLa` — confirmado vía `list_tables_for_base` el 17-jul-2026. El dominio D_ real tiene únicamente 2 tablas, más `TX_Unidades` como destino del enrutamiento por cardinalidad. **Independiente**: verificado que ninguna de las 2 tablas D_ tiene link record hacia M_, C_, TX_, A_, H_ o Z_ (RN-33 se cumple).

| Tabla lógica | TABLE_ID | Campos | Estado |
|---|---|---|---|
| `D_TipoDocumento` | `tblkPhBnpdDmUWOl3` | 8 | Vigente |
| `D_TipoDocumentoAtributo` | `tbldI86ieVKpjpL7E` | 19 | Vigente — fuente única (antes relación N:M) |
| `TX_Unidades` | `tbl2QDLvJDyy3Rg2I` | 16 | Vigente — nueva desde v1.6, ampliada v1.8 |
| ~~`D_TipoDato`~~ | ~~`tble0Na4Neon7Vz3z`~~ | — | **Deprecada.** Ya no existe en la base real. Contenido consolidado como `singleSelect` en `D_TipoDocumentoAtributo.tipo_dato`. |
| ~~`D_Catalogo`~~ | ~~`tbljstH0ueFdiwgZX`~~ | — | **Deprecada.** Ya no existe en la base real. |
| ~~`D_CatalogoValor`~~ | ~~`tbliFo74Rge2yBsZ5`~~ | — | **Deprecada.** Ya no existe en la base real. |
| ~~`D_Atributo`~~ | ~~`tblOI0Su3ogySNeHm`~~ | — | **Deprecada.** Ya no existe en la base real. Sus columnas se promovieron a `D_TipoDocumentoAtributo`. |
| ~~`D_Documento`~~ | ~~`tblbGI2g0md8x3wCC`~~ | — | **Deprecada.** Ya no existe en la base real. Reemplazada por `TX_Adjuntos.atributos_obtenidos` (JSON). |
| ~~`D_DocumentoValorAtributo`~~ | ~~`tblGcU6ZG7bf49mCO`~~ | — | **Deprecada.** Ya no existe en la base real. Reemplazada por `TX_Adjuntos.atributos_obtenidos` (JSON). |

Los TABLE_IDs deprecados se conservan tachados sólo para trazabilidad histórica de la migración (no reutilizar, no consultar — la API de Airtable devolverá error 404 si algún código todavía los referencia).

### D_TipoDocumento

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldmUdfw7C85mC4Yq` | Single line text (UQ, primary) |
| `nombre` | `fldZFV4MViUpVzEz8` | Single line text |
| `descripcion` | `fldU5qCEGXS1BvVFc` | Long text |
| `entidad_emisora` | `fldVS6wwQj6Soy6Ze` | Single line text |
| `vigencia_dias` | `fldJRNPgz6PWejZ81` | Number |
| `activo` | `fldiSXRPd2mqgKOci` | Checkbox |
| `D_TipoDocumentoAtributo` | `fldNsN343wkTRiEmD` | Link → D_TipoDocumentoAtributo (multipleRecordLinks) |
| `tipo_propiedad` | `fldIfdcjsr8KeNRCx` | Single select (`nueva` · `usada` · `ambas`) |

**20 filas activas al 2026-08** (`activo = TRUE`), verificado vía MCP el 02-ago-2026.
La columna `Campos` de la tabla de arriba cuenta campos (8), no filas. El 02-ago-2026
se crearon 4 tipos que existían en el mock de `lib/console-data.ts` pero no en Airtable
(`certificado_dominio_vigente`, `certificado_hipotecas_gravamenes`,
`certificado_deuda_gastos_comunes`, `certificado_informaciones_previas`) y se reactivó
`inscripcion_dominio_cbr`, la única fila que tenía `activo` sin marcar. Lectura desde el
código: `getTiposDocumento()` en `lib/tipos-documento.ts` → `GET /api/tipos-documento`.

Los `codigo` activos deben coincidir con los defaults de `nuevaSolicitudInternaDefaults` en `lib/schemas.ts` y con el checklist de `NewRequestSheet`. Verificar contra la base real antes de asumir la lista de 9 documentada en versiones previas de este archivo — sin re-auditar fila por fila el 17-jul-2026.

### D_TipoDocumentoAtributo

Fuente única desde v1.6 (blueprint v8.2). Ya no es una relación N:M — cada fila consolida la definición completa de un atributo para un tipo de documento, incluido el enrutamiento por cardinalidad. 19 campos reales, verificados vía MCP el 17-jul-2026:

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `codigo` | `fldUhfgFj18G0caux` | Single line text (primary) |
| `tipo_documento` | `fldZXsrFr8HlsM70j` | Link → D_TipoDocumento |
| `codigo_atributo` | `fldlPYqhzJGvxb5nL` | Single line text |
| `nombre_atributo` | `fldUpC3x8x669P4LD` | Single line text |
| `tipo_dato` | `fldtR5PXQARHkrNWG` | Single select (`number · text · date · boolean`) |
| `unidad_medida` | `fldydHLPXI9TlDMcR` | Single line text |
| `obligatorio` | `fldrySOzNz7iBhJ4K` | Checkbox |
| `orden` | `fld8LT1GoIAxlxJdF` | Number |
| `etiqueta_local` | `fld0Idiu35Grg7pjO` | Single line text |
| `valor_por_defecto` | `fldkkeOf20GrGgBas` | Single line text |
| `uso_interfaz_ejecutiva` | `fldlKzDTew6JUrb1K` | Checkbox |
| `uso_interfaz_tasador` | `fldgK3ZcRdWgeswNL` | Checkbox |
| `uso_interfaz_visador` | `fldYsBQU0mC4hY7Dg` | Checkbox |
| `usado_motor_calculo` | `fldmtcnmcPTyyQv3u` | Checkbox |
| `uso_tabla_destino` | `fldNJh73ocKS3AIrR` | Single line text |
| `uso_campo_destino` | `fld8qt6J2vDHytiHL` | Single line text |
| `ejemplo_atributo` | `fldga8TLbuYBCfjxo` | Single line text |
| `uso_cardinalidad_destino` | `fldWQZyPiU2f47RHm` | Single select (`una_por_solicitud · una_por_unidad · muchas_por_solicitud · PENDIENTE_VALIDACION`) |
| `uso_campo_link_unidad` | `fldJHASJBN6nYwupU` | Single line text |

⚠ **Divergencia con la Especificación v1.8.2 §4**: el campo `uso_interfaz_negocio` que describe la Especificación **no existe** en la base real — coexisten 3 flags separados (`uso_interfaz_ejecutiva`, `uso_interfaz_tasador`, `uso_interfaz_visador`). Cualquier filtro que replique la semántica de "uso_interfaz_negocio" (Set B) debe usar el OR de los tres. Tampoco existe `version` (Number, snapshot de reproducibilidad — documentado en Capa Datos v2.6.3 pero no creado en Airtable real; ni `patron_validacion` ni un campo `catalogo_cerrado` dedicado — el `tipo_dato='catalogo'` no tiene contraparte real de opciones cerradas más allá del propio `singleSelect` de `tipo_dato`.

`codigo` sigue el patrón `<tipo_documento>__<atributo>` (ej. `permiso_edificacion__direccion`). Un mismo `codigo_atributo` (ej. `rol_sii`) puede repetirse en varias filas si se reutiliza en distintos tipos de documento.

### TX_Unidades (nueva v1.6, ampliada v1.8)

Tabla transaccional que persiste una fila por unidad física del inmueble. Destino de los atributos con `uso_cardinalidad_destino = una_por_unidad`. 16 campos reales, verificados vía MCP el 17-jul-2026 (`tbl2QDLvJDyy3Rg2I`):

| Campo | FIELD_ID | Tipo Airtable |
|---|---|---|
| `clave_natural` | `fldehh0Qqzo8U6z5a` | Single line text (primary) |
| `solicitud` | `fldmBd2bzOWjPX0eW` | Link → TX_Solicitudes |
| `subtipo` | `fldNU8ee30AvvRWHZ` | Single select — **11 opciones, reverificadas vía MCP el 06-ago-2026**: `Departamento · Casa · Bodega · Estacionamiento · Terreno · Local · Terraza · Piscina · OO.CC. · Servidumbre · Edificacion`. `Edificacion` (`selCKKz4gOLe6TFlL`) se añadió después del snapshot del 17-jul-2026 y faltaba en esta tabla. Este campo alimenta el segmento `{Unidad}` del path Dropbox (spec §8.1): al agregar una opción nueva hay que declarar su normalización en la tabla de mapeo de §8.1, o el path resultante queda sin regla |
| `es_principal` | `flduvn0eU2lfG6RqR` | Checkbox |
| `rol_sii` | `fldC5yUYC2wTTLJBV` | Single line text |
| `sup_m2` | `fldZLvJKuXuWhRV8P` | Number |
| `numero_unidad` | `fldJGXS8jGDKZDdWM` | Single line text — alimenta el sufijo `_{numero_unidad}` que desambigua dos unidades del mismo subtipo en el path Dropbox (spec §8.1). ⚠ Es **texto libre y está vacío en la mayoría de las filas reales** (valores observados el 06-ago-2026: `1`, `105`, `411`, `2100`, `D402`), así que `lib/dropbox-path.ts` lo sanea a snake_case y, cuando falta, aplica la cascada de CI-003b: `numero_unidad` → `rol_sii` (`fldC5yUYC2wTTLJBV`) → ordinal dentro del grupo **con warning**. El ordinal es el último recurso porque es posicional: agregar o borrar una unidad hermana corre el de las demás y desalinea paths ya escritos (CI-004) |
| `avaluo_uf` | `fld3fwTUt4GN8pYXf` | Number |
| `orden` | `fld9iRM3hhCNNj4DJ` | Number |
| `notas` | `fld08OmgUPgIWHyCk` | Long text |
| `TX_Adjuntos` | `fld9RWDHlpeaUMguI` | Link → TX_Adjuntos |
| `TX_ItemsCuadroValoracion` | `fldgZTZ4qMWHWbZc0` | Link → TX_ItemsCuadroValoracion |
| `sup_terreno_m2` | `fld6lgF0KxUh9oPCB` | Number (v1.8) |
| `tipo_material` | `fldnG1nEod0V1IkKZ` | Single select (v1.8: `madera · albanileria · hormigon · mixto · perfiles_metalicos`) |
| `estado_unidad` | `fldIwZtnqbbnfF6Zx` | Single select (v1.8, RN-38: `nueva · usada`) |
| `anio_construccion` | `fldM46x4ECE9B0pfM` | Number |

Complementa — no reemplaza — a `TX_ItemsCuadroValoracion` (cuadro de valoración granular de IF-03/E1).

### Persistencia del resultado de extracción: `TX_Adjuntos.atributos_obtenidos`

Reemplaza al patrón EAV (`D_Documento` + `D_DocumentoValorAtributo`, ambas deprecadas). El JSON con los atributos extraídos (manual por la Ejecutiva o automático por Claude API vía RF-09) se guarda en `TX_Adjuntos.atributos_obtenidos` (`fldeCH15RrL8f4TZk`, Long text/JSON — ver §2). Desde ahí se propaga por `uso_cardinalidad_destino`: `una_por_solicitud` → `TX_DatosTasacion`; `una_por_unidad` → `TX_Unidades` (unidad resuelta por `uso_campo_link_unidad`).

RN-32 (vigente, redefinida v1.6): exactamente uno de los tipos de valor esperados por `tipo_dato` debe corresponder al valor persistido en el JSON para ese atributo. Ya no se valida vía Airtable Automation sobre una tabla EAV intermedia — el escritor (Airtable Script `AT03-Ext`, invocado desde el blueprint Make SC-RF09) es responsable de respetar el contrato de tipos al construir el JSON.

### Estado del blueprint Make `SC-RF09-ExtraccionClaude` frente a este schema (17-jul-2026)

⚠ El blueprint en `docs/make-blueprints/SC-RF09-ExtraccionClaude.blueprint.json` **todavía tiene 13 módulos** y sus módulos 5 y 6 (`airtable:ActionGetRecord`) **referencian los TABLE_IDs deprecados** `tblOI0Su3ogySNeHm` (D_Atributo) y `tble0Na4Neon7Vz3z` (D_TipoDato), que ya no existen en la base real. **Riesgo alto: la ejecución fallará al llegar al módulo 5.** Además, el prompt del módulo 10 tiene la cadena literal `"Atributos esperados: 7"` en vez de un valor dinámico. Ver nota en el propio archivo del blueprint y `docs/_notas/rf09_diseno.md`. Reconstrucción pendiente — no es un cambio de documentación, requiere sesión de construcción aparte.

### Gaps cerrados en auditorías anteriores (12-jul-2026, sobre tablas hoy deprecadas)

Contexto histórico únicamente — las tablas y FIELD_IDs de esta tabla ya no existen en la base real:

| Tabla (deprecada) | Campo | FIELD_ID | Acción |
|---|---|---|---|
| `D_Atributo` | `version` | `fldVa989k1aO6gVXV` | Creado vía MCP 12-jul-2026, luego consolidado en la migración a `D_TipoDocumentoAtributo` (el campo `version` no reapareció en la tabla consolidada — ver divergencia arriba) |
| `D_Documento` | `extraccion_incompleta` | `fldewUdLQOpVpSe7M` | Creado vía MCP 12-jul-2026, tabla deprecada en la migración posterior |

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

---

## 20. Schema requerido por la maqueta v1.9 (22-jul-2026)

> ⚠ Todos los campos y tablas de esta sección son **pendientes de creación en Airtable** — documentan lo que la maqueta v0.dev (integrada a `main`) y la Especificación v1.9.1 requieren para el modelo de datos rico (comprador/vendedor/unidades/contactos), no un estado ya verificado vía MCP. `lib/solicitudes.ts` hoy degrada estos campos con valores por defecto (ver `mapRecord`) hasta que se creen y se mapeen en Make/API routes — mismo patrón D-08.

### 20.1 `TX_Solicitudes` — 7 campos nuevos

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `ejec_formalizador` | Single line text | Separa el rol de "Ejec. Formalizador" del `ejecutivo_solicitante` (comercializador) — Sección A del formulario v1.9 |
| `tipo_propiedad` (nuevo/usado) | Single select (`nuevo · usado`) | ⚠ Nombre coincide con el `tipo_propiedad` existente (Link → M_TiposPropiedad, §2) pero es un campo **distinto** — el Data Designer debe resolver la colisión de nombre antes de crear (sugerido: `tipo_propiedad_nuevo_usado`) |
| `modo_creacion` | Single select (`documentos · manual`) | Fase 1 del wizard de creación v1.9 |
| `tipo_cliente_origen` | Single select (`correo_texto · correo_ficha · extranet`) | Sección A |
| `estado_conservacion` | Single select (`nuevo · sin_uso · bueno · normal · malo · deficiente`) | Nivel solicitud (propiedad); se hereda a recintos (RN-49) |
| `origen_direccion` | Single line text | Origen declarado de la dirección (Sección B) |
| `fecha_asignacion` | Date time | REGLA A: se registra al confirmar "Asignar Tasador" |
| `email_thread_id` | Single line text | Correlación de hilo de correo cuando `modo_creacion = documentos` |

### 20.2 `TX_Unidades` — 8 campos nuevos

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `modelo` | Single line text | Sólo aplica en propiedades nuevas |
| `sup_terraza_m2` | Number | |
| `sup_terreno_m2` | Number | |
| `ampliacion_m2` | Number | Sólo aplica en usado |
| `ampliacion_regularizable` | Checkbox | |
| `origen_superficie` | Single select (`carta_inmobiliaria · plano · base_sii · certificado_avaluo · medicion_tasador`) | RN-45: obligatorio, catálogo cerrado |
| `adjunto_respaldo_id` | Link → `TX_Adjuntos` | RN-45: respaldo obligatorio por cada m² editado |
| `estado_unidad` | Single select (`nueva · usada`) | |
| `tipo_bien_id` | Link → `M_TiposDeBien` (nueva, ver §20.5) | |

### 20.3 `TX_ContactosVisita` (tabla nueva)

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `solicitud_id` | Link → `TX_Solicitudes` | FK |
| `nombre` | Single line text | |
| `telefono` | Single line text | |
| `email` | Email | |
| `rol` | Single select (`propietario · corredor · arrendatario · conserje · otro`) | |
| `orden_prioridad` | Number | Orden del bloque repetible; el primero es el contacto principal |
| `estado_contacto` | Single select (`valido · no_contesta · telefono_erroneo`) | |

### 20.4 `TX_Vendedor` (tabla nueva)

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `solicitud_id` | Link → `TX_Solicitudes` | FK |
| `razon_social` | Single line text | Cuando `esInmobiliaria = true` |
| `nombre_completo` | Single line text | Cuando es persona natural |
| `rut` | Single line text | |
| `contacto` | Single line text | Teléfono/correo consolidado |
| `tipo_persona` | Single select (`juridica · natural`) | |
| `origen_dato` | Single line text | |

### 20.5 `M_TiposDeBien` (tabla nueva)

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `nombre` | Single line text | 8 valores: `Edificación · Terreno · Estacionamiento_cubierto · Estacionamiento_descubierto · Estacionamiento_uso_goce · Bodega · Piscina · Obras_complementarias` |
| `activo` | Checkbox | |

### 20.6 `TX_DatosTasacion` — bloque SII (11 campos nuevos)

| Campo | Tipo Airtable | Notas |
|---|---|---|
| `cod_sii_comuna` | Single line text | |
| `cod_sii_manzana` | Single line text | |
| `cod_sii_predio` | Single line text | |
| `ubicacion_urbano_rural` | Single select | |
| `avaluo_fiscal_total_uf` | Number | |
| `contribucion_anual` | Number | |
| `avaluo_exento` | Number | |
| `cg` | Single line text | |
| `ociv` | Single line text | |
| `oc` | Single line text | |
| `g` | Single line text | |

### 20.7 AT02 fuera de alcance de IF-02 (v1.9)

AT02 (asignación algorítmica por zona/carga, ver §13/H-05) permanece en el catálogo de automatizaciones para otros consumidores pero **no se invoca desde el flujo de IF-02**. La maqueta v1.9 implementa asignación manual única vía botón "Asignar Tasador" (REGLA A) — ver `docs/diseno.md` y `docs/aprendizajes.md` (entrada correspondiente). No hay flujo de reasignación formal.

---

## 21. Verificación MCP del schema v1.9 y cierre de `TX_DocumentosLegales` (24-jul-2026)

> Sesión "Airtable Engineer + Data Designer": auditoría vía `list_tables_for_base` + `get_table_schema` de todo lo que §20 marcaba como *pendiente de creación*. **Resultado: el schema v1.9 ya está creado en la base real** (los registros semilla de `M_TiposDeBien` tienen `createdTime` de hoy). Esta sección es el estado **verificado**; supersede el estado "pendiente" de §20. Los nombres reales difieren de las sugerencias de §20 — usar los de aquí.

### 21.1 Tablas nuevas — verificadas, **existían_ok**

| Tabla | TABLE_ID | Estado |
|---|---|---|
| `TX_ContactosVisita` | `tblW3SSbKo6vRjwBJ` | 7 campos, dominios exactos (ver abajo). Link `solicitud` → `TX_Solicitudes` (`fldSQAKu5ooRgF5uw`) |
| `M_TiposDeBien` | `tblQkurIaEqg6tMA4` | `nombre` (primary) · `codigo` · `activo` (checkbox) + link inverso `TX_Unidades`. **8 semillas ya cargadas** y correctas |

`TX_ContactosVisita`: `nombre`(text) · `telefono`(phone) · `email`(email) · `rol`(select: propietario·corredor·arrendatario·conserje·otro) · `orden_prioridad`(number,0) · `estado_contacto`(select: valido·no_contesta·telefono_erroneo) · `solicitud`(link).

`M_TiposDeBien` semillas (`codigo` → `nombre`): `edificacion`→Edificación · `terreno`→Terreno · `estacionamiento_cubierto`→Estacionamiento cubierto · `estacionamiento_descubierto`→Estacionamiento descubierto · `estacionamiento_uso_goce`→Estacionamiento uso y goce · `bodega`→Bodega · `piscina`→Piscina · `obras_complementarias`→Obras complementarias.

> **Nota sobre `TX_Vendedor` (§20.4)**: NO se creó tabla. Por decisión del equipo (relación 1:1) los datos del vendedor viven como campos en `TX_Solicitudes` (`vendedor_*`, ver §21.2). §20.4 queda obsoleto.

### 21.2 `TX_Solicitudes` — 23 campos v1.9, **existían_ok** salvo conflictos

Todos verificados en `tblaHTyMHYfmy7Fg6`. Números financieros con `precision:2`.

| Campo | FIELD_ID | Tipo/dominio real | Estado |
|---|---|---|---|
| `ejecutivo_formalizador` | `fldM9ELuMvgRwbmUn` | singleLineText | existía_ok |
| `modo_creacion` | `fldBJovAv2RpsaupH` | select: documentos·manual | existía_ok |
| `tipo_cliente_origen` | `fldbxZh45lFTB7yVJ` | select: correo_texto·correo_ficha·extranet | existía_ok |
| `email_thread_id` | `fldhy81fNSE5CF2Tc` | singleLineText | existía_ok |
| `correo_cliente_ref` | `fldcKVbfRBo8J7gtg` | singleLineText | existía_ok |
| `estado_conservacion` | `flde0ExWfB1dhkp4t` | select: nuevo·sin_uso·bueno·normal·malo·deficiente | existía_ok |
| `vendedor_tipo_persona` | `fldMRFFXv9rOVfQlf` | select: juridica·natural | existía_ok |
| `vendedor_razon_social_o_nombre` | `fldNkFwB5p3Mljtrg` | singleLineText | existía_ok |
| `vendedor_rut` | `fldrITDFkbk95Da00` | singleLineText | existía_ok |
| `vendedor_email` | `flduBKof3x45EpTNW` | email | existía_ok |
| `vendedor_telefono` | `flduslI2FNAdcPchK` | phoneNumber | existía_ok |
| `financiero_valor_total_uf` | `fldp4XCnx8jsfAzZx` | number(2) | existía_ok |
| `financiero_subsidio_uf` | `fldRmC7IjhRUf1UPk` | number(2) | existía_ok |
| `financiero_ahorro_uf` | `fld5WjnkIN9DYs7vX` | number(2) | existía_ok |
| `financiero_mutuo_uf` | `fldEbxQzz5g0Knupv` | number(2) | existía_ok |
| `financiero_pago_contado_uf` | `fldDFfws74GaHO4oV` | number(2) | existía_ok |
| `financiero_bono_captacion_uf` | `fldAcyXYAppvBlXIt` | number(2) | existía_ok |
| `financiero_bono_integracion_uf` | `fld9TnWG2OJFx1hiW` | number(2) | existía_ok |
| `financiero_precio_venta_uf` | `fld1RBNe63iotfyqE` | number(2) | existía_ok |
| `tipo_propiedad` | `fld701TB0LXovvQmt` | **Link → M_TiposPropiedad** | sin cambio — es campo distinto (§21.4-a) |
| `tipo_propiedad_nuevo_usado` | `fldHxx1P1ao33PWrl` | select: nuevo·usado | **creado** 24-jul (§21.4-a) |
| `origen_direccion` | `fldiwBMHujptXHr2D` | select: ficha_cliente·cert_avaluo·cert_numero | resuelto — opciones cortas canónicas (§21.4-b) |
| `vendedor_origen_dato` | `fldcjrl80Vv1WBmmY` | select: correo·ficha·cert_avaluo | resuelto — opción corta canónica (§21.4-c) |
| `fecha_asignacion` | `fldiaj4mwd17g25n1` | **date** — ⚠ DEPRECATED | reemplazado por `fecha_asignacion_ts` (§21.4-d) |
| `fecha_asignacion_ts` | `fldf8BS8nv2vtOmu0` | dateTime (America/Santiago, 24h) | **creado** 24-jul (§21.4-d) |

> Existe además `vendedor_nombre` (`fldfUXb9vzxklu8ES`, legacy) en paralelo a `vendedor_razon_social_o_nombre`. No se tocó.

### 21.2.1 `TX_Unidades` (`tbl2QDLvJDyy3Rg2I`) — verificado

Todos los campos v1.9 existen con dominio exacto: `modelo` · `superficie_terraza_m2`(2) · `con_rol_o_uso_y_goce`(con_rol·uso_y_goce) · `rol_sii_en_tramite`(checkbox) · `ampliacion_m2`(2) · `ampliacion_regularizable`(si·no·no_aplica) · `origen_superficie`(carta_ficha_inmobiliaria·plano·base_interna_sii·certificado_avaluo·medicion_tasador) · `respaldo_adjunto`(link → `TX_Adjuntos` `tblur71x1oItbmKZc`) · `detalle_item`(multiline) · `tipo_bien`(link → `M_TiposDeBien`). **Todos existían_ok.** La superficie de terreno se cubre con el campo existente `sup_terreno_m2` (`fld6lgF0KxUh9oPCB`, number precision 0) — decisión de panel 24-jul: NO se crea `superficie_terreno_m2` (ver §21.4-e).

### 21.3 `TX_DocumentosLegales` (`tbl7qIg5x4Y0tOiLk`) — **9 campos CREADOS**

La tabla ya existía con link `solicitud` → `TX_Solicitudes` (`fldJ60CFZfJsHwTgA`). Faltaban los 9 campos legales v1.9; se crearon en esta sesión:

| Campo | FIELD_ID | Tipo |
|---|---|---|
| `permiso_edificacion_numero` | `fld0MWeaFq3bPyOkn` | singleLineText |
| `permiso_edificacion_fecha` | `fld3Vg1fQr13GUgCq` | date (local) |
| `recepcion_final_numero` | `fldNScUyz00oZ1aq9` | singleLineText |
| `recepcion_final_fecha` | `fldn5IBevRZI16Cyf` | date (local) |
| `fojas` | `fldzTWo2GtXIFtxWR` | singleLineText |
| `numero_inscripcion` | `fldCcr705pwKY1L9z` | singleLineText |
| `ano_inscripcion` | `fld585iijZF3oA5Rd` | number(0) |
| `lineas_edificacion` | `fldDce5e75VuGCddC` | multilineText |
| `certificado_numero` | `fldvOcIJ0WDKFWiLF` | singleLineText |

### 21.4 Resolución de los 5 conflictos (panel aprobado · 24-jul-2026)

- **(a) `TX_Solicitudes.tipo_propiedad` → RESUELTO (campo nuevo)**: se creó `tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`, singleSelect `nuevo·usado`). El `tipo_propiedad` original (`fld701TB0LXovvQmt`, Link → M_TiposPropiedad) **no se tocó** — es un campo distinto (tipo de inmueble). El wizard v1.9 debe escribir nuevo/usado en `tipo_propiedad_nuevo_usado`.
- **(b) `TX_Solicitudes.origen_direccion` → RESUELTO (se adoptan las opciones cortas)**: las opciones reales `ficha_cliente·cert_avaluo·cert_numero` quedan como **canónicas**. La spec (`certificado_avaluo`/`certificado_numero`) se alinea a estos nombres cortos. No se modificó el singleSelect. UI/Make deben usar `cert_avaluo`/`cert_numero`.
- **(c) `TX_Solicitudes.vendedor_origen_dato` → RESUELTO (se adopta la opción corta)**: `correo·ficha·cert_avaluo` quedan canónicas. `cert_avaluo` es el valor a usar (no `certificado_avaluo`).
- **(d) `TX_Solicitudes.fecha_asignacion` → RESUELTO (campo paralelo)**: el MCP no permite migrar `date→dateTime` in situ (`update_field` solo cambia name/description/formula). Se creó `fecha_asignacion_ts` (`fldf8BS8nv2vtOmu0`, dateTime · America/Santiago · 24h). El `fecha_asignacion` original (`fldiaj4mwd17g25n1`, date) queda **DEPRECATED** (marcado en su descripción); su borrado se **difiere a tanda posterior** (registrado en `docs/construccion.md §11`). REGLA A debe escribir el timestamp en `fecha_asignacion_ts`.
- **(e) `TX_Unidades.superficie_terreno_m2` → RESUELTO (se descarta)**: se adopta el campo existente `sup_terreno_m2` (`fld6lgF0KxUh9oPCB`, number precision 0) tal cual. **No** se crea `superficie_terreno_m2`. Toda referencia a `superficie_terreno_m2` se elimina de la documentación.

> `docs/diseno.md` no contenía referencias a los nombres largos `certificado_avaluo`/`certificado_numero`/`superficie_terreno_m2` (verificado por grep 24-jul), por lo que no requirió cambios de opción; sólo se documenta aquí la convención canónica.

---

## 22. Homónimos y alias de código (registro expandible · 25-jul-2026)

**Este registro está abierto.** No es una tabla cerrada de tres filas: es el procedimiento por
el que cualquier campo con homónimo —o con riesgo demostrado de confusión— entra a tener un
alias único. Ver §22.4 para agregar uno.

### 22.1 El problema y las tres capas de nombre

Airtable permite que dos tablas distintas tengan un campo con el mismo nombre y significado
distinto. `tipo_propiedad` existe en `TX_Solicitudes` (Link → `M_TiposPropiedad`: qué clase de
inmueble es) y en `D_TipoDocumento` (singleSelect: a qué condición de propiedad aplica el
documento). Son cosas diferentes con el mismo literal, y RF-TAS-06 tiene que cruzarlas.

La regla no renombra nada en Airtable. Separa **tres identidades** con roles distintos:

| Capa | Qué es | Quién manda | Puede repetirse |
|---|---|---|---|
| **Nombre de datos** | el literal del campo en Airtable (`tipo_propiedad`) | Airtable · inmutable desde el repo | **sí**, entre tablas |
| **FIELD_ID** | `fld701TB0LXovvQmt` · la identidad real y estable | lo que el código debe usar siempre | no |
| **Alias de código** | nombre único en todo el repo | tipos TS, prosa de docs, nombres de constantes | **no, nunca** |

El alias es una construcción de la capa de código: **no existe en Airtable** y no viaja en el
body de la API. El nombre de datos es lo que viaja; el alias es cómo lo llamamos nosotros.

### 22.2 Registro

| Alias de código | Nombre de datos | FIELD_ID | Tabla | Dominio real | Origen del alias |
|---|---|---|---|---|---|
| `tipoPropiedad` | `tipo_propiedad` | `fld701TB0LXovvQmt` | `TX_Solicitudes` | Link → `M_TiposPropiedad` | ya en uso en el código (18 líneas, 6 archivos · verificado 25-jul-2026) |
| `tipoPropiedadNuevoUsado` | `tipo_propiedad_nuevo_usado` | `fldHxx1P1ao33PWrl` | `TX_Solicitudes` | singleSelect `nuevo · usado` | ya en uso en el código |
| `condicionPropiedadAplicable` | `tipo_propiedad` | `fldIfdcjsr8KeNRCx` | `D_TipoDocumento` | singleSelect `nueva · usada · ambas` | **acuñado aquí** (A-05 · 25-jul-2026) |

Dos de los tres alias **no se inventaron**: el código ya los usaba y ya eran inequívocos
(`components/console/solicitud-detail.tsx:514` los renderiza juntos en la misma línea). Se
adoptan tal cual, con coste de migración cero. Sólo el tercero necesitó nombre nuevo, porque es el único homónimo
que quedaba vivo: comparte nombre de datos con el primero y significado con el segundo.

⚠ **`condicionPropiedadAplicable` y `tipoPropiedadNuevoUsado` tienen dominios incompatibles**
—femenino contra masculino— y RF-TAS-06 los compara. Hoy la comparación literal nunca coincide.
Es el punto abierto **P-5** del spec v1.9.4 §2.15; se resuelve en Airtable, no aquí.

### 22.3 Regla de uso en código

Para todo campo listado en §22.2:

1. **Referenciarlo por nombre de datos queda prohibido.** Se usa la constante FIELD_ID.
2. La constante **se nombra por su alias**, no por su nombre de datos.
3. El alias es el nombre del campo en los tipos TS y en la prosa de la documentación.
4. Un alias **nunca se reutiliza** para otro campo, ni siquiera en otra tabla.

Esto extiende §17 (*"preferir FIELD_ID sobre nombre de campo cuando exista riesgo de
colisión"*) convirtiéndolo en obligación sobre una lista corta, explícita y verificable.

### 22.4 Procedimiento para agregar una entrada

Un campo entra al registro cuando se cumple **cualquiera** de las dos condiciones:

- **Homónimo:** su nombre de datos ya existe en otra tabla de la base, con cualquier significado.
- **Riesgo demostrado:** existe evidencia concreta de confusión —un bug, una revisión que lo
  detectó, o dos documentos que lo usan con sentidos distintos—. No basta la sospecha.

Pasos:

1. **Verificar el nombre de datos y el FIELD_ID contra la base real vía MCP.** Nunca inventar
   un FIELD_ID ni copiarlo de un documento sin comprobarlo.
2. **Elegir el alias.** Primero buscar si el código ya lo nombra de alguna forma
   (`grep -rn --exclude-dir={node_modules,.next,.git,docs}`): si existe y es inequívoco, se
   adopta ese, no se inventa uno nuevo. Sólo se acuña cuando no hay nada que adoptar.
3. **Comprobar que el alias no colisione** con ningún identificador del repo, con el mismo grep.
4. **Agregar la fila a §22.2**, con la columna *Origen del alias* diciendo si se adoptó o se acuñó.
5. **Si hay código que ya referencia el campo por nombre**, abrir una entrada en
   `docs/CODE_INCONSISTENCIES.md` con dueño y fecha objetivo. Sin esos dos campos no entra.

Renombrar el campo en Airtable **no** es parte del procedimiento: el registro existe
precisamente para no tener que hacerlo.

---

## 23. Tanda D-03 · `TX_Unidades.solicitud_record_id` (29-jul-2026)

### 23.1 Campo creado

| Campo | FIELD_ID | Tipo | Config |
|---|---|---|---|
| `solicitud_record_id` | `fldjzPX6rd4sEYHSD` | multipleLookupValues | `recordLinkFieldId` = `fldmBd2bzOWjPX0eW` (`solicitud`) · `fieldIdInLinkedTable` = `fldx3ewhqGRv99uwZ` (`TX_Solicitudes.record_id`, `RECORD_ID()`) |

Gemelo exacto de `TX_ContactosVisita.solicitud_record_id` (`fldYNKk5cyfWLxwqD`), que ya
existía con la misma configuración. Se creó vía MCP el 29-jul-2026; al ser un lookup, se
pobló **retroactivamente** en los 12 registros existentes de la tabla (verificado).

### 23.2 Por qué existe

SC-Edicion borra y recrea los hijos de una solicitud en cada edición. Para localizarlos
filtraba por el primary field:

```
FIND(",{{1.codigoSolicitud}},", "," & ARRAYJOIN({solicitud}, ",") & ",") > 0
```

Ese filtro depende de dos cosas frágiles:

1. Que `codigoSolicitud` esté presente en la data structure memorizada del webhook de Make
   (es una clave joven — se agregó en `9547d1b`).
2. Que la fórmula `codigo_solicitud` (`fldDXEE1ejMNVDlpB`) resuelva. Es
   `"VP-" & YEAR({fecha_solicitud}) & "-" & RIGHT("0000" & {solicitud_id}, 4)`, así que una
   `fecha_solicitud` vacía la deja en blanco.

Si cualquiera de las dos falla, la fórmula degrada a `FIND(",,", …)`, que **no matchea nada,
no lanza error** y convierte el borrado en un no-op silencioso: Make reporta *Success* y los
hijos se acumulan en cada edición. Es el mecanismo de la duplicación de la Tanda D-03/F1.

Filtrando por el lookup del record ID el problema desaparece de raíz:

```
ARRAYJOIN({solicitud_record_id}) = "{{1.solicitudId}}"
```

`solicitudId` viaja en el payload desde el día uno (el módulo 2 lo usa como `id` del update),
así que el filtro es correcto **sin** necesidad de re-determinar la data structure del webhook.

### 23.3 Consumidores

- `SC-Edicion.blueprint.json` — módulos 12 (`TX_ContactosVisita`) y 19 (`TX_Unidades`).
- **SC01 no requiere cambio**: ya escribe el link `solicitud` (`fldmBd2bzOWjPX0eW = {{7.id}}`)
  y Airtable calcula el lookup solo.


---

## 24. Cobertura de escritura de SC-Edicion sobre `TX_Solicitudes` (29-jul-2026 · ampliado 30-jul-2026)

### 24.1 Qué escribe el módulo 2 (`Update Records`)

**48 campos** (47 hasta el 29-jul-2026; +1 el 30-jul-2026, ver §24.5). Ninguno es formula,
rollup, lookup ni autonumber: `TX_Solicitudes` tiene 135 campos, de los cuales 122 son
escribibles, así que estos 48 son el subconjunto de negocio de IF-02, **no** el universo
escribible de la tabla.

Se leen así:

- **41** directos desde el payload, como `{{1.cambios.<clave camelCase>}}`.
- **7** Link fields que el escenario resuelve con un `Search` propio y consume como `{{N.id}}`:
  los módulos 6-11 buscan por `nombre` (`cliente`, `tipo_informe`, `tipo_propiedad`,
  `producto`, `comuna`, `banco_financista`) y el módulo 24 busca por `clerk_user_id`
  (`ejecutiva_asignada`).

| Campo Airtable | FIELD_ID | Tipo | Mapper en el módulo 2 |
|---|---|---|---|
| `banco` | `fldAgTlFXeXWfGTdI` | singleLineText | `{{1.cambios.bancoId}}` |
| `banco_financista` | `fldxcfdKRctHCgwmB` | multipleRecordLinks | `{{11.id}}` |
| `canal_contacto_original` | `fldca1Uza4eicBXL4` | singleSelect | `{{1.cambios.canal}}` |
| `cliente` | `fldttL5myzLohDwHv` | multipleRecordLinks | `{{6.id}}` |
| `cliente_final_nombre` | `fld7jxcbmMYz6kmbj` | singleLineText | `{{1.cambios.clienteFinalNombre}}` |
| `cliente_final_rut` | `fldwNEPL8fXkWwUBd` | singleLineText | `{{1.cambios.clienteFinalRut}}` |
| `comuna` | `fldJTjjzCPBHMOWZv` | multipleRecordLinks | `{{10.id}}` |
| `correo_cliente_ref` | `fldcKVbfRBo8J7gtg` | singleLineText | `{{1.cambios.correoClienteRef}}` |
| `direccion` | `fldKP0yxwQkSdrFuZ` | singleLineText | `{{1.cambios.direccion}}` |
| `ejecutiva_asignada` | `fldv1XDfP7EgYC3km` | multipleRecordLinks | `{{24.id}}` |
| `ejecutivo_formalizador` | `fldM9ELuMvgRwbmUn` | singleLineText | `{{1.cambios.ejecutivoFormalizador}}` |
| `ejecutivo_solicitante` | `fldRweQyq3tTQGmPR` | singleLineText | `{{1.cambios.ejecutivoSolicitante}}` |
| `email_contacto` | `fldjzUZsACA0vDlUq` | email | `{{1.cambios.emailContacto}}` |
| `email_thread_id` | `fldhy81fNSE5CF2Tc` | singleLineText | `{{1.cambios.emailThreadId}}` |
| `estado_conservacion` | `flde0ExWfB1dhkp4t` | singleSelect | `{{1.cambios.estadoConservacion}}` |
| `fecha_asignacion_ts` | `fldf8BS8nv2vtOmu0` | dateTime | `{{if(1.cambios.fechaAsignacion; parseDate(1.cambios.fechaAsignacion))}}` |
| `financiero_ahorro_uf` | `fld5WjnkIN9DYs7vX` | number | `{{parseNumber(1.cambios.financieroAhorroUf)}}` |
| `financiero_bono_captacion_uf` | `fldAcyXYAppvBlXIt` | number | `{{parseNumber(1.cambios.financieroBonoCaptacionUf)}}` |
| `financiero_bono_integracion_uf` | `fld9TnWG2OJFx1hiW` | number | `{{parseNumber(1.cambios.financieroBonoIntegracionUf)}}` |
| `financiero_mutuo_uf` | `fldEbxQzz5g0Knupv` | number | `{{parseNumber(1.cambios.financieroMutuoUf)}}` |
| `financiero_pago_contado_uf` | `fldDFfws74GaHO4oV` | number | `{{parseNumber(1.cambios.financieroPagoContadoUf)}}` |
| `financiero_precio_venta_uf` | `fld1RBNe63iotfyqE` | number | `{{parseNumber(1.cambios.financieroPrecioVentaUf)}}` |
| `financiero_subsidio_uf` | `fldRmC7IjhRUf1UPk` | number | `{{parseNumber(1.cambios.financieroSubsidioUf)}}` |
| `financiero_valor_total_uf` | `fldp4XCnx8jsfAzZx` | number | `{{parseNumber(1.cambios.financieroValorTotalUf)}}` |
| `modo_creacion` | `fldBJovAv2RpsaupH` | singleSelect | `{{1.cambios.modoCreacion}}` |
| `monto_estimado_uf` | `fldKZW799xIqMFN1I` | number | `{{parseNumber(1.cambios.montoEstimadoUf)}}` |
| `n_operacion_cliente` | `fldb1vmKk7y3hi4uY` | number | `{{if(1.cambios.nOperacionCliente; parseNumber(1.cambios.nOperacionCliente); emptystring)}}` |
| `observaciones_internas` | `fldjmx9pLOyJKx1Mw` | multilineText | `{{1.cambios.observaciones}}` |
| `origen_canal` | `fldPphw1FWfYdZI2Z` | singleSelect | `{{1.cambios.origenCanal}}` |
| `origen_direccion` | `fldiwBMHujptXHr2D` | singleSelect | `{{1.cambios.origenDireccion}}` |
| `prioridad` | `fld9FKZ9siAeSsH54` | singleSelect | `{{1.cambios.prioridad}}` |
| `producto` | `fldp64U99lsLf7HlV` | multipleRecordLinks | `{{9.id}}` |
| `proyecto_condominio` | `fldbmGmyMHOtfX2Az` | singleLineText | `{{1.cambios.proyecto}}` |
| `region` | `fldy8081DUFzVXe01` | singleLineText | `{{1.cambios.region}}` |
| `solicitante_nombre` | `fld2rd2p4Qpz6NFQ2` | singleLineText | `{{1.cambios.solicitanteNombre}}` |
| `solicitante_telefono` | `fldzHrLeO3Fe0xtvn` | phoneNumber | `{{1.cambios.solicitanteTelefono}}` |
| `sucursal_originadora ` | `fldd56pLZyKYoi2Vi` | singleLineText | `{{1.cambios.sucursalOriginadora}}` |
| `tipo_cliente_origen` | `fldbxZh45lFTB7yVJ` | singleSelect | `{{1.cambios.tipoClienteOrigen}}` |
| `tipo_informe` | `fldJO4JtsDEeMmjdi` | multipleRecordLinks | `{{7.id}}` |
| `tipo_propiedad` | `fld701TB0LXovvQmt` | multipleRecordLinks | `{{8.id}}` |
| `tipo_propiedad_nuevo_usado` | `fldHxx1P1ao33PWrl` | singleSelect | `{{1.cambios.tipoPropiedadNuevoUsado}}` |
| `vendedor_email` | `flduBKof3x45EpTNW` | email | `{{1.cambios.vendedorEmail}}` |
| `vendedor_origen_dato` | `fldcjrl80Vv1WBmmY` | singleSelect | `{{1.cambios.vendedorOrigenDato}}` |
| `vendedor_razon_social_o_nombre` | `fldNkFwB5p3Mljtrg` | singleLineText | `{{1.cambios.vendedorRazonSocialONombre}}` |
| `vendedor_rut` | `fldrITDFkbk95Da00` | singleLineText | `{{1.cambios.vendedorRut}}` |
| `vendedor_telefono` | `flduslI2FNAdcPchK` | phoneNumber | `{{1.cambios.vendedorTelefono}}` |
| `vendedor_tipo_persona` | `fldMRFFXv9rOVfQlf` | singleSelect | `{{1.cambios.vendedorTipoPersona}}` |

> `sucursal_originadora ` conserva el espacio final del schema real (D-08). El mapper la
> referencia por FIELD_ID, así que el espacio no afecta la escritura.

### 24.2 Los dos campos que SC01 escribe y SC-Edicion no

Tras esta tanda, la diferencia entre el `Create` de SC01 (47 campos) y el `Update` de
SC-Edicion (47 campos) se reduce a dos, y en ambos la omisión es deliberada:

| Campo | FIELD_ID | Por qué no está |
|---|---|---|
| `estado` | `fld2H2r0GMeVfNO26` | Lo dueña AT02. La UI no decide transiciones ("la UI muestra y captura; nunca decide"). |
| `fecha_solicitud` | `fldvkn9CsORy4eU0Z` | Timestamp de alta. Reescribirlo al editar falsearía la antigüedad y, con ella, el semáforo SLA y `codigo_solicitud`. |

Al revés, SC-Edicion escribe dos que SC01 no toca: `solicitante_nombre` (`fld2rd2p4Qpz6NFQ2`)
y `prioridad` (`fld9FKZ9siAeSsH54`).

### 24.3 `ejecutiva_asignada` — módulo 24

`ejecutiva_asignada` (`fldv1XDfP7EgYC3km`) es un Link a `AUTH_Usuarios`
(`tblbX3hPD2uhqhl5v`). No puede viajar como texto: necesita un record ID. El módulo 24
lo resuelve con el mismo patrón que el módulo 15 de SC01:

```
UPPER({clerk_user_id}) = UPPER("{{1.ejecutivaClerkId}}")
```

`ejecutivaClerkId` viaja en la **raíz** del payload, no dentro de `cambios`: lo pone
server-side `app/api/solicitudes/[id]/route.ts` desde la sesión Clerk. Por eso **no** está en
el formulario de edición — la Ejecutiva no se auto-reasigna a mano (D-01, misma doctrina que
el visador).

### 24.4 `n_operacion_cliente` — por qué la guarda `if()`

`n_operacion_cliente` (`fldb1vmKk7y3hi4uY`) es `number`. Hasta el 29-jul-2026 el módulo 2 lo
mapeaba pelado:

```
{{parseNumber(1.cambios.nOperacionCliente)}}
```

`parseNumber` sobre una clave ausente no devuelve "nada": devuelve un valor vacío que el
conector de Airtable intenta escribir igual en un campo numérico. SC01 ya llevaba la guarda
desde su primera versión; SC-Edicion no la heredó. Ahora replica el mismo literal:

```
{{if(1.cambios.nOperacionCliente; parseNumber(1.cambios.nOperacionCliente); emptystring)}}
```

Es el **único** `parseNumber` protegido así en los dos escenarios: los ocho `financiero_*` y
`monto_estimado_uf` siguen pelados en SC01 y en SC-Edicion por igual. Si aparece el mismo
síntoma en alguno de ellos, la corrección es extender la guarda a los dos escenarios a la vez,
nunca a uno solo.

### 24.5 Contrato con el cliente

La correspondencia es 1:1 y está verificada: las **46 claves escalares** del blueprint
(40 directas + 6 de búsqueda por nombre) son exactamente las 46 claves de
`editarSolicitudSchema` (`lib/validators/acciones-solicitud.ts`), que es `.strict()` — una
clave de más devuelve 422 y una de menos no llega nunca a Airtable. El armado lo hace
`mapearEdicionSolicitud` (`lib/mappers/editar-solicitud.ts`).

`contactosVisitaJson` y `unidadesJson` **no** cuentan entre esas 46: viajan fuera de `cambios`,
en la raíz, y los consumen las ramas 0 y 1 del Router (ver §23).

---

## 25. `ejecutivo_comercializador` y reconstrucción del blueprint SC-Edicion (30-jul-2026)

### 25.1 Campo nuevo en `TX_Solicitudes`

| Campo | FIELD_ID | Tipo | Motivo |
|---|---|---|---|
| `ejecutivo_comercializador` | `fldDP232hBLsZ0PWJ` | `singleLineText` | §1.4 de la Especificación v1.9.4 lista "Comercializador" entre los datos editables del bloque Origen, pero no existía campo destino. El control no se podía construir: se registró como bloqueo **V-4** y se creó el campo el 30-jul-2026. |

Cadena completa, por si hay que replicarla para otro campo del bloque Origen:

| Capa | Archivo | Clave |
|---|---|---|
| Lectura Airtable | `lib/solicitudes.ts` · `SOLICITUD_FIELDS` | `ejecutivo_comercializador` |
| Modelo | `lib/console-data.ts` · `Solicitud` | `ejecutivoComercializador?: string` |
| Formulario | `components/console/editar-solicitud-form.tsx` · Sección A | etiqueta "Comercializador" |
| Validación | `lib/validators/acciones-solicitud.ts` | `ejecutivoComercializador: z.string().optional()` |
| Mapper | `lib/mappers/editar-solicitud.ts` | `ejecutivoComercializador: limpiar(d.ejecutivoComercializador)` |
| Make · módulo 2 | `SC-Edicion.blueprint.json` | `fldDP232hBLsZ0PWJ = {{1.cambios.ejecutivoComercializador}}` |

`app/api/solicitudes/[id]/route.ts` **no** requirió cambios: `cambios` se arma con el resto
del destructuring de `parsed.data`, así que toda clave nueva del zod viaja sola. El orden de
las capas sí importa: si la clave llega a Make antes de estar en el blueprint, viaja y se
ignora en silencio.

### 25.2 Por qué se reconstruyó el blueprint

El síntoma era que la rama de contactos de SC-Edicion **creaba y no borraba**: cada guardado
duplicaba `TX_ContactosVisita` (17 filas en VP-2026-0053 tras 6 ediciones). La hipótesis de
trabajo era desincronía entre el escenario desplegado y el archivo canónico. **Quedó
refutada** — tres verificaciones independientes:

1. El export que Sergio bajó de Make es **semánticamente idéntico** al canónico (mismo
   SHA-256 tras normalizar el JSON; sólo difiere la indentación, 4 vs 2 espacios).
2. El blueprint **vivo**, traído con `GET /api/v2/scenarios/6682031/blueprint`, tiene el
   `flow` idéntico al canónico. Sólo difieren `metadata.notes` y `metadata.zone`, que la API
   omite.
3. El hook `3441135` (`SC-Edicion-Webhook`) apunta al scenario `6682031`, activo, y su URL
   coincide con `MAKE_WEBHOOK_URL_SC_EDICION`. No hay un segundo SC-Edicion recibiendo tráfico.

La causa real la dieron los logs de ejecución (`GET /api/v2/scenarios/6682031/logs`):

| ejecución | contactos a borrar | unidades a borrar | creados | `operations` |
|---|---|---|---|---|
| 2026-07-30T02:46:33Z | 14 | 1 | 2 + 1 | **21** |
| 2026-07-30T02:52:26Z | 16 | 2 | 1 + 2 | **21** |

Si los `Delete` hubieran corrido, la segunda ejecución habría gastado ~3 operaciones más que
la primera (18 borrados contra 15). Son idénticas en 21: los módulos 14 y 20 aportaron **cero
operaciones**. Y con `status = 1` (éxito) en ambas, tampoco fallaron — **fueron omitidos por su
filtro de entrada**.

Ese filtro era `{{12.id}} exist AND {{12.id}} ≠ ""` (y su gemelo `{{19.id}}` en unidades), y
**no protegía nada**: si el `Search` no devuelve bundles, el módulo siguiente no se ejecuta de
todos modos. Su único efecto posible era omitir el borrado en silencio. Se eliminó de los
módulos 14 y 20.

Descartado explícitamente antes de llegar ahí, para que nadie lo vuelva a investigar:

- La fórmula del `Search` funciona. `ARRAYJOIN({solicitud_record_id}) = "recIEvKCbe7J8TDaB"`
  ejecutada contra la API de Airtable devuelve exactamente los 2 contactos de la solicitud.
- El lookup `solicitud_record_id` está poblado y válido en las dos tablas hijas (ver §23).
- `{{N.id}}` es la referencia correcta para el resultado de un `Search`: el módulo 24 la usa
  y `ejecutiva_asignada` queda ligada correctamente en cada ejecución.

⚠ Efecto colateral asumido: si `{{12.id}}` llegara a no resolver, el `Delete` ahora falla de
forma **visible** en vez de omitirse. La ejecución marca error, el `Webhook Respond` de la
rama 2 no corre, y la app devuelve 502 con el mensaje humano de red — con `TX_Solicitudes` ya
actualizada por el módulo 2, que corre antes del Router. Es escritura parcial, y es preferible
a duplicar datos reportando éxito. La solución de fondo es la deuda **V-5** (migrar
`delete + recreate` a `upsert` por `orden`).

### 25.3 Divergencia de configuración detectada

`MAKE_ORGANIZATION_ID` en `.env.local` vale **1594725**, que es el `teamId`, no el
`organizationId`. La organización real del token es **7487039**. Los endpoints de la API de
Make que piden `organizationId` fallan con `IM002 Insufficient rights` usando ese valor.
Hoy no rompe nada —ningún Route Handler llama a la API de administración de Make, sólo a los
webhooks— pero cualquier código futuro que la consulte va a fallar por esto.

---

## 26. IF-03 · Tasador — delta de schema P0.5-TAS (17-ago-2026)

> **Tanda:** P0.5-TAS del plan `docs/_md/plan_ejecucion_UItasador_v1.2.md` §1.5.
> **Vía de ejecución:** Airtable **Meta API REST** con `AIRTABLE_TOKEN` (scope `schema.bases:write`
> confirmado en runtime). **No se usó el MCP** — no está autenticado en la sesión y la preferencia
> operativa del proyecto es schema desde `docs/` + REST server-side.
> **Verificación:** diff completo del schema antes/después del POST. **Exactamente 1 cambio**;
> `TX_Solicitudes` pasó de 156 a 157 campos.
>
> ⚠ **El conteo de 157 dejó de aplicar el 19-ago-2026.** `TX_Solicitudes` tiene **159 campos**
> desde P4-TAS: **+1** por el campo inverso que Airtable creó solo al enlazar
> `TX_CoordinacionVisita`, y **+1** por `coordinacion_vigente`. Los dos son esperados, ninguno es
> un error — ver §26.6. La cifra de arriba es correcta para P0.5-TAS y no se corrige.

### 26.1 Campo creado — el único

| Tabla | Campo | FIELD_ID | Tipo | Uso |
|---|---|---|---|---|
| `TX_Solicitudes` | `observacion_rechazo_tasador` | **`fldAccib5yNYaOmJc`** | `multilineText` | RF-TAS-09 · observación del tasador al rechazar el informe. Nullable. La escribe el Route Handler de IF-03; **IF-02 no la toca**. |

### 26.2 Campos que el plan pedía crear y **NO** se crearon

| Campo del plan §1.5.1 | Motivo |
|---|---|
| ~~`TX_CoordinacionVisita` (tabla · 13 campos)~~ | ~~CI-012 cerrado por decisión de negocio (17-ago-2026): no se crea.~~ → **REVERTIDO 19-ago-2026.** CI-012 se cerró en sentido opuesto y RO-29 quedó anulada. **La tabla se crea en P4-TAS** — ver §26.6. |
| ~~`coordinacion_vigente` (formula)~~ | ~~Sólo tenía sentido leyendo `TX_CoordinacionVisita`. Cae con CI-012.~~ → **REVERTIDO 19-ago-2026.** Se crea en P4-TAS, pero **no como fórmula** — ver §26.6. |
| `fecha_real_visita` (date) | ⚠ **Ya existe con otro nombre** — ver §26.3. Crearlo habría duplicado el dato. |
| `horas_restantes` | Retirado en v1.9.9 (CI-021). Confirmado ausente en la base. |
| ~~`email_coordinacion_confirmada` / `_rechazada` (plantillas)~~ | ~~Correos de coordinación. Caen con CI-012.~~ → **REVERTIDO 19-ago-2026.** Se reponen en P4-TAS. La divergencia `C_Plantillas` vs `C_NotificacionesConfig` **sigue sin resolver** y ahora sí la fuerza una necesidad: los puntos 2 y 3 de Pantalla 2 exigen los dos correos. |

### 26.3 ⚠ `fecha_real_visita` ya existe como `fecha_visita` — override al plan

El plan §1.5.1 declara `fecha_real_visita` como alta nueva. **Lo es sólo de nombre.** El dato ya
está en la base y en producción:

| Evidencia | Dónde |
|---|---|
| `fecha_visita` documentado como *"Fecha real de la visita"* | `docs/schema-airtable.md:166` |
| IF-02 lo mapea a un campo llamado literalmente `fechaVisitaReal` | `lib/solicitudes.ts:802` |
| Fórmula viva `dias_desde_visita` | `DATETIME_DIFF(TODAY(), {fldpTBzjfbAw5FSYI}, 'days')` |
| Fórmula viva `fecha_limite_entrega` | `DATEADD({fldpTBzjfbAw5FSYI}, 2, 'days')` |
| 5 blueprints de Make lo mapean | SC01 · SC-Asignar · SC-Edicion · SC05 · SC-RF09 |

**Decisión (Sergio, 17-ago-2026): IF-03 reutiliza `fecha_visita`.** Crear un campo paralelo habría
dejado las dos fórmulas y el mapper de IF-02 leyendo el viejo mientras IF-03 escribía el nuevo —
dos fuentes de verdad para el mismo dato, que es lo que **RO-05** prohíbe.

**Realización de la Regla T-B (§0.3 del plan) — no requiere ningún campo nuevo:**

| Regla T-B | Campo real | FIELD_ID | Tipo | Quién lo escribe |
|---|---|---|---|---|
| Fecha **planificada** de visita | `fecha_visita_programada` | `fldPUFd9YuQdkcrOI` | `date` (`local`/`l`) | La Ejecutiva desde IF-02 |
| Fecha **real** de visita | `fecha_visita` | `fldpTBzjfbAw5FSYI` | `date` (`iso`/`YYYY-MM-DD`) | El Tasador desde IF-03 |

⚠ **Deuda de nombre.** El campo real se llama `fecha_visita` a secas, y la Regla T-B declara que un
identificador `fechaVisita` sin calificar «es un bug». La regla apunta al **código de IF-03**, no al
schema de Airtable, así que no hay violación: pero al tipar el dominio en P1-TAS, el identificador
TS debe ser `fechaVisitaReal` (como ya hace `lib/solicitudes.ts:802`), **nunca** `fechaVisita`.

⚠ **Nota de tipo.** Los campos `date` de Airtable **no admiten `timeZone`** — sólo los `dateTime`.
El plan §1.5.1 pedía `timeZone = America/Santiago` para `fecha_real_visita`; es inaplicable a un
`date` y el punto queda sin efecto. Los dos campos de arriba difieren en `dateFormat`
(`iso` vs `local`); se dejan como están porque cambiarlo tocaría un campo de IF-02 (R5).

### 26.4 Verificaciones sin escritura

**`D_TipoDocumento.tipo_propiedad` — preexistente, NO re-creado.**

| | |
|---|---|
| FIELD_ID | `fldIfdcjsr8KeNRCx` |
| Tipo | `singleSelect` |
| Dominio real | **`nueva` · `usada` · `ambas`** (femenino) |

⚠ **Punto abierto P-5 confirmado contra la base real.** El dominio está en **femenino**, mientras
`TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`) está en **masculino**
(`nuevo` · `usado`). **Con estos dominios la comparación literal de RF-TAS-06 nunca coincide y el
sheet documental sale vacío.** No se renombró ni alineó nada: es trabajo en Airtable con sign-off de
negocio. P5-TAS aplica el paliativo de normalización server-side en `lib/tasador/tipo-propiedad.ts`.

**Tablas de captura e hijas — verificadas, ninguna creada.**

| Tabla | TABLE_ID | Estado |
|---|---|---|
| `TX_DatosTasacion` | `tblMoK3mFuwN8Yr1A` | ✅ existe |
| `TX_Comparables` | `tbllbTuhb0waWIbRo` | ✅ existe |
| `TX_ItemsCuadroValoracion` | `tblCxnMtOETK2ulD0` | ✅ existe |
| `TX_Unidades` | `tbl2QDLvJDyy3Rg2I` | ✅ existe |
| `TX_ContactosVisita` | `tblW3SSbKo6vRjwBJ` | ✅ existe — el plan lo daba como *«verificar en la tanda»* |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | ✅ existe |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | ✅ existe |
| `C_SLA` | `tblsPZokEK5aoinTn` | ✅ existe |
| `C_SLA_Etapas` | `tbl05zu5RLhH3u6pl` | ✅ existe |
| `TX_ObrasComplementarias` | `tblQ1fXM06bzSQ84w` | ✅ existe |
| `TX_Ampliaciones` | `tblpAtUq4p6o1vofo` | ✅ existe |
| `TX_HabitacionesPorNivel` | `tblBITpPb8WuqsatM` | ✅ existe |
| `TX_TerminacionesPorRecinto` | `tbleQ7pcLxYx9NbCi` | ✅ existe |
| `TX_DocumentosLegales` | `tbl7qIg5x4Y0tOiLk` | ✅ existe |
| **`TX_Amenities`** | — | ❌ **NO EXISTE** — hallazgo |

⚠ **`TX_Amenities` no existe en la base.** §2.16 de la spec la nombra entre las tablas hijas de
captura. **No se creó** — CLAUDE.md exige aprobación explícita para tablas nuevas, y el plan §1.5.1
manda reportar sin crear. La sección E del formulario (`seccion-edificacion.tsx`) consume un tipo
`Comodidades`; **P7-TAS debe resolver dónde persiste** antes de dar la sección por cerrada.

La base tiene **67 tablas** al 17-ago-2026.

### 26.5 Efecto del cierre de CI-012 sobre el schema documentado

> 🚫 **ESTA SUBSECCIÓN QUEDÓ INVERTIDA EL 19-ago-2026.** CI-012 se cerró en **sentido opuesto** por
> la revisión de Héctor del diseño v4 (Pantalla 2, puntos 1-4) y **RO-29 quedó anulada**. Lo que
> sigue describe el estado entre el 17 y el 19-ago-2026 y se conserva como registro. **El estado
> vigente está en §26.6.**

~~`TX_CoordinacionVisita` **no existe y no se creará**. Toda referencia a la coordinación por
sistema en §2.12 de la spec y en §1.5 del plan de IF-03 queda **desalineada** y debe retirarse en el
próximo bump normativo. En particular: `fecha_visita_propuesta`, `estado_coordinacion`, `motivo`,
`email_thread_id`, `email_enviado_status`, `intento_numero` y la constraint blanda de unicidad
`(solicitud, fecha_respuesta)` **no tienen realización en la base** y no la tendrán.~~

---

### 26.6 IF-03 · Tasador — delta de schema P4-TAS (19-ago-2026) · **coordinación repuesta**

> **Tanda:** P4-TAS · Pantalla 2 · Coordinar visita.
> **Causa:** cierre positivo de **CI-012** y anulación de **RO-29** (`docs/CODE_INCONSISTENCIES.md`).
> **Vía de ejecución:** **MCP Airtable** (`create_table` / `create_field`), conforme a **RO-30**.
> Sustituye a la vía REST de P0.5-TAS: la conexión MCP está autenticada desde el 18-ago-2026.

#### Estado de la base al levantarla (19-ago-2026)

- **67 tablas**, no 68. La ficha **CI-012** decía *"cuyo listado de 68 tablas no la contiene"*, cifra
  tomada el 11-ago-2026. La base cambió entre medio. El fondo de la afirmación se mantiene —
  `TX_CoordinacionVisita` no está— pero **el conteo de la ficha no es citable como dato actual**.
- `observacion_rechazo_tasador` **ya existe** (`fldAccib5yNYaOmJc`), creado por P0.5-TAS y
  registrado en §26.1. La spec §2.12 lo sigue declarando como campo **nuevo** por crear:
  divergencia documental abierta como **CI-041**.
- `coordinacion_vigente`, `intento_numero` y `fecha_real_visita` no existen. El tercero es el caso
  de §26.3: el dato vive como `fecha_visita` y no debe duplicarse.

#### Tabla creada — `TX_CoordinacionVisita` = `tblBwMErRxo57ML2r` (19-ago-2026)

Creada con `create_table` del MCP. **12 campos**, no 13: los dos lookups van en llamadas aparte
(`create_field` no puede referenciar un link que aún no existe) y `id` se materializa como
`coordinacion_key`.

| Campo | FIELD_ID | Tipo | Nota |
|---|---|---|---|
| `coordinacion_key` | `fldsYScri919sl2G7` | singleLineText | **primario** · lo escribe el handler |
| `solicitud` | `fldO6qSVaZAWaozi1` | multipleRecordLinks → `tblaHTyMHYfmy7Fg6` | |
| `estado_coordinacion` | `fldvnImj4jQttE2D9` | singleSelect | `confirmada` · `rechazada` |
| `motivo` | `fld0rkrlg9Xo0fFVm` | singleSelect | 4 valores literales · A-17 · ver A-21 |
| `detalle` | `fldcVwI3w0I8WsCrx` | multilineText | mín. 20 car. validado en el handler |
| `nota` | `fldCIIUL8pd2wAPEE` | multilineText | |
| `fecha_visita_propuesta` | `fldRAuqHnIGTG7eBC` | date | |
| `fecha_respuesta` | `fldAIuBPGiZ5ZDssj` | dateTime | `America/Santiago` |
| `autor_clerk_id` | `fldCKBfbZmctL9PKk` | singleLineText | |
| `email_enviado_at` | `fldDqd4icRHPQExW7` | dateTime | nullable |
| `email_enviado_status` | `fldyWwUXiDeGfGIIW` | singleSelect | `pendiente` · `enviado` · `error` |
| `intento_numero` | `fldNj1SdLE6pyWvfx` | number (0) | lo escribe el handler |
| `email_thread_id` | `fldZFVJzC1pwoaoxG` | multipleLookupValues | creado aparte · **devuelve array** |
| `solicitud_record_id` | `fldCzrumbm9U135Zn` | multipleLookupValues | creado aparte · **devuelve array** · patrón de TX_ContactosVisita |

**⚠ Los lookups devuelven array, no valor.** `email_thread_id` (`fldZFVJzC1pwoaoxG`) es de tipo
`multipleLookupValues` con `result.type = singleLineText`: la API devuelve **`["<thread>"]`**, no
`"<thread>"`, aunque el link apunte a una sola solicitud y el hilo sea uno solo. **El handler tiene
que leer `[0]`.** Es el mismo patrón que `TX_ContactosVisita.solicitud_record_id`, y el modo de
fallo si se ignora es silencioso: el correo saldría con un `email_thread_id` que es la
representación en string de un array, rompiendo RN-52 sin que nada falle de forma visible.

**⚠ Efecto colateral no declarado en el plan: `TX_Solicitudes` pasó de 157 a 158 campos.** Airtable
crea automáticamente el campo inverso de todo Link, y lo bautizó **`TX_CoordinacionVisita`**
(`fldrO6CYBgdycDJKi`, multipleRecordLinks). No se pidió y no se puede evitar: es como funciona el
tipo Link. Importa por dos razones. Primera, cualquier verificación futura del tipo *"TX_Solicitudes
tiene 157 campos"* —como la que usó P0.5-TAS en §26— **ya no cuadra**, y el campo de más no es un
error. Segunda, su **nombre no sigue la convención** de la tabla, que es `snake_case`: se llama como
la tabla enlazada. **Se renombra a `coordinaciones`** dentro de
esta misma tanda, por decisión de Sergio del 19-ago-2026: es cosmético, pero mantener la convención
evita que el siguiente que lea el schema tenga que preguntarse si el nombre significa algo.

#### Campos nuevos en `TX_Solicitudes` (P4-TAS)

| Campo | FIELD_ID | Tipo | Nota |
|---|---|---|---|
| `coordinacion_vigente` | `fldI4Dv0jpRQvbdHl` | singleSelect | `confirmada` · `rechazada` · **vacío = sin coordinación** · lo escribe el handler |
| `coordinaciones` | `fldrO6CYBgdycDJKi` | multipleRecordLinks | campo inverso auto-creado · **renombrado de `TX_CoordinacionVisita` el 19-ago-2026** |

**El dominio de `coordinacion_vigente` es de dos valores, no tres.** "Sin coordinación vigente" se
representa como **vacío**, no como una opción `pendiente`, porque el chip "Por coordinar"
(RF-TAS-01) filtra precisamente por ausencia. Agregar un tercer valor rompería ese filtro sin que
ninguna validación lo detecte.

#### Estado final del schema tras P4-TAS

| Objeto | Antes | Después |
|---|---|---|
| Tablas en la base | 67 | **68** |
| `TX_Solicitudes` · campos | 157 | **159** |
| `TX_CoordinacionVisita` · campos | — | **14** |

Verificado contra la base el 19-ago-2026, después de las cuatro operaciones.

#### Dos campos se apartan del tipo declarado en §2.12 — y por qué

**1 · `intento_numero`: `formula` → `number` (precision 0), escrito server-side.**
§2.12 lo declaraba `Number (formula)` con la expresión
`1 + COUNT(intentos previos del mismo solicitud_id)`. **No es implementable.** Una fórmula de
Airtable evalúa **únicamente sobre su propio registro**: no puede contar registros hermanos
filtrados por un campo Link. La vía habitual para rodearlo sería un `rollup`, y la base **no tiene
un solo campo `rollup`** en sus 67 tablas — introducirlo aquí crearía un patrón sin precedente para
resolver un ordinal que el servidor ya conoce.

Lo escribe el Route Handler de coordinación en el insert, que de todos modos consulta los intentos
previos para decidir si es primer o segundo intento. **El criterio de aceptación de RF-TAS-04
—`intento_numero = 2` en el segundo intento— se verifica igual.** Cambio de tipo registrado en la
spec **v1.9.11**.

**2 · `coordinacion_vigente`: `formula` → `singleSelect`, escrito server-side.**
§2.12 lo declaraba como fórmula
`LAST(TX_CoordinacionVisita.estado_coordinacion ORDER BY fecha_respuesta DESC)`. **Airtable no
tiene `LAST(... ORDER BY ...)`**: no existe forma de pedir el valor del registro vinculado más
reciente en una sola fórmula.

Sí era técnicamente posible por `rollup` con `MAX()` sobre un campo concatenado
`fecha|estado` y una fórmula que parte el string — el truco estándar. **Se descartó por diseño, no
por imposibilidad**: obliga a un campo técnico que nadie más lee, estrena el primer `rollup` de la
base, y deja el valor del que dependen la excepción acotada a RN-59 y el chip "Por coordinar" atado
a un parseo de texto. Lo escribe el mismo handler que inserta la fila de coordinación, en la misma
operación. Decisión de Sergio, 19-ago-2026. Cambio de tipo registrado en la spec **v1.9.11**.

**3 · Campo primario: `id` `autoNumber` → `coordinacion_key` `singleLineText`, escrito server-side.**
§2.12 declaraba el primario como `id` **PK auto**. **`autoNumber` no está disponible por
herramienta**: no aparece en el enum de tipos de `create_table` ni en el de `create_field` del MCP
de Airtable. La única vía sería crearlo a mano en la UI, y **la regla operativa del proyecto lo
prohíbe** —todo cambio de schema va por herramienta, para que quede trazable y repetible—.

Se descartó también dejar el primario en un campo ya previsto (`fecha_respuesta`, `dateTime`): un
primario no único y poco legible degrada la grilla justo para quien más la consulta. `TX_Solicitudes`
usa una fórmula como primario y `TX_ContactosVisita` un `singleLineText`; **la segunda es el patrón
replicable acá**, porque las fórmulas tampoco se crean en `create_table`.

`coordinacion_key` la escribe el Route Handler en el insert con el formato
`VP-2026-0530 · intento 1` —código de la solicitud más el ordinal—, de modo que la fila se
identifica de un vistazo sin abrir el registro. Decisión de Sergio, 19-ago-2026. Cambio de tipo
registrado en la spec **v1.9.12**.

#### Los tres cambios de tipo, en una tabla

| §2.12 declaraba | Se crea como | Motivo raíz |
|---|---|---|
| `id` · PK `autoNumber` | `coordinacion_key` · `singleLineText` | `autoNumber` no existe en las tools MCP · no se crean campos por UI |
| `intento_numero` · `formula` | `number` (precision 0) | Una fórmula no ve registros hermanos por Link · base sin `rollup` |
| `coordinacion_vigente` · `formula` | `singleSelect` | Airtable no tiene `LAST(… ORDER BY …)` · vía `rollup` descartada por diseño |

Los tres tienen la misma consecuencia práctica y conviene enunciarla junta: **son campos que
escribe el servidor, no que calcula Airtable.** Quien audite la base no debe esperar que se
actualicen solos, y quien toque el Route Handler de coordinación tiene que escribir los tres en la
misma operación que inserta la fila. Si uno se olvida, la base queda internamente inconsistente sin
que ninguna fórmula lo delate.

#### Nota sobre `intento_numero` y la constraint de unicidad

La constraint blanda `(solicitud, fecha_respuesta truncada al minuto)` de §2.12 **no tiene
realización en el schema**: Airtable no soporta constraints de unicidad. Vive como guard en el
Route Handler. Es la mitigación **R-2** (doble disparo por doble tap) y no debe darse por cubierta
al leer el schema.

---

## `C_DefaultsAntecedentes` · defaults de la hoja de antecedentes (IF-03)

**TABLE_ID: `tblOj7nXcjeouPy09`** · creada el 22-ago-2026 en la tanda **P0.5-TAS** ·
**sembrada el 22-ago-2026 en la tanda P0.5.C-TAS (212 filas)**.
Catálogo paramétrico de los valores por defecto que el tasador recibe pre-llenados en la sección E
de la Pantalla 5. Fuente normativa: **spec v1.9.14 §2.8.1 (RF-TAS-23)**. Origen de los valores:
`Formato Informe VProperty Enero2026.xlsm`, hoja `Antecedentes`.

**Clave de partición: tipo de propiedad × estado de uso** (A-27, decidida por Héctor el
22-ago-2026). **Granularidad: un registro por (combinación, `campo_destino`, `atributo`)** —
decidida en esta tanda: agregar un campo nuevo es alta de datos y no `create_field`, y cada
default puede llevar su propia cita al Excel.

| Campo | FIELD_ID | Tipo | Notas |
|---|---|---|---|
| `clave` | `fldbKTZStDCrl5Utr` | singleLineText (**primary**) | `{tipo}·{estado_uso}·{campo_destino}·{atributo}`. La escribe el cargador |
| `tipo_propiedad` | `fldNZVhxeoIMGCMiZ` | multipleRecordLinks → `M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`) | **Eje 1.** Link y no select: `TX_Solicitudes.tipo_propiedad` (`fld701TB0LXovvQmt`) también es Link, y unir por nombre reproduciría el fallo de **P-5** |
| `estado_uso` | `fldnXKVSv2xbPWi2j` | singleSelect: `nuevo` · `usado` | **Eje 2.** Minúscula, copiado exacto de `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`) |
| `bloque` | `fldUR8GDz3I0Xzc4D` | singleSelect: `elementos_fundamentales` · `elementos_otros` · `terminaciones_recinto` | **Tres opciones, no cuatro** — ver A-39 abajo |
| `atributo` | `fld4kwnOUfGtFJx6I` | singleSelect: `materialidad` · `calidad` · `estado` · `pavimento` · `revestimiento_muros` · `cielo` · `iluminacion` | No existe `material_o_marca`: se **deriva** del pavimento `[Excel: Antecedentes!W46:W50]` |
| `campo_destino` | `fldZajTzom9Lvxe0Y` | singleLineText | El elemento o el recinto |
| `valor_default` | `fldQH8JTWRQMW4Mgx` | singleLineText | Texto y no select: los catálogos son largos y distintos por campo. Vacío es valor legítimo |
| `catalogo_ref` | `fld0NAJv7E1rLFWVX` | singleLineText | **Referencia** al rango del catálogo, no el catálogo materializado — ver A-38 |
| `origen` | `fldp8lPwlMe6gKmx5` | singleLineText | `[Excel: hoja!celda]`. Obligatorio al sembrar |
| `activo` | `fldTRdqlHaNJeRrLi` | checkbox | Baja lógica |
| `notas` | `fldHRmQCMEOpqGgbo` | multilineText | Excepciones que el valor solo no transmite |

**Efecto colateral del Link.** Crear `tipo_propiedad` generó automáticamente el campo inverso
**`fldN5ya6IA6j0nM0S`** en `M_TiposPropiedad`. Es inevitable en Airtable y no requiere acción;
se anota para que no aparezca como campo huérfano en la próxima auditoría de esa tabla.

**La unicidad de la clave compuesta NO tiene realización en schema.** Airtable no soporta
constraints de unicidad — mismo caso que la constraint blanda de `TX_CoordinacionVisita` (§2.12).
El campo primario `clave` la hace **visible** en la grilla; el guard efectivo vive en el cargador
y en el Route Handler que lea la tabla. No darla por cubierta al leer el schema.

**Sin herencia entre combinaciones.** Una combinación `(tipo_propiedad, estado_uso)` sin fila
cargada presenta los campos **vacíos**. No hereda de la combinación vecina ni cae a un conjunto
por defecto: heredar produciría valores plausibles y falsos, que es el modo de fallo que el
pre-llenado viene a evitar (spec §2.8.1).

**Estado: SEMBRADA.** **212 filas** al 22-ago-2026, cargadas por **P0.5.C-TAS** en 12 batches.
`activo = TRUE` en las 212; cero filas huérfanas (todas resuelven su Link a `M_TiposPropiedad`).

**Se sembraron 4 de las 16 combinaciones** —las que la plantilla distingue—:

| Combinación | record ID de `tipo_propiedad` | `elementos_fundamentales` | `elementos_otros` | `terminaciones_recinto` | Total |
|---|---|---|---|---|---|
| `Casa` × `nuevo` | `recrXDAjlVCe59XBW` | 17 | 14 | 20 | **51** |
| `Casa` × `usado` | `recrXDAjlVCe59XBW` | 17 | 14 | 20 | **51** |
| `Departamento` × `nuevo` | `recf9hz8TbkQ6wsus` | 21 | 14 | 20 | **55** |
| `Departamento` × `usado` | `recf9hz8TbkQ6wsus` | 21 | 14 | 20 | **55** |

Las 12 combinaciones restantes **no tienen filas y eso es correcto**: presentan los campos vacíos
por la regla de arriba. `Casa Piloto` y `Departamento Piloto` quedaron deliberadamente sin sembrar
(**A-43**). Detalle completo del mapeo en `docs/_notas/snapshot-P0.5.C-TAS.md`.

**Tres campos no se siembran en ninguna combinación**, porque la plantilla los despacha vacíos:
`construccion_anexo` (`[Excel: Antecedentes!H44]` vacío, y sus fórmulas de calidad y estado
dependen de él), la **calidad** de `aire_acondicionado` y `calefaccion` (`BE37`/`BE38` devuelven
`""` cuando la materialidad es `NO PRESENTA`), y `obras_complementarias` completo en `Casa`
(`H43` devuelve `""` para todo lo que no sea Departamento).

**Convención de `catalogo_ref` (fijada en P0.5.C-TAS).** Tres estados distinguibles, y conviene no
confundirlos al leer una fila:

| Forma del valor | Significado | Ejemplo |
|---|---|---|
| `Antecedentes!<rango>` | Catálogo en rango oculto de la hoja | `Antecedentes!BZ45:BZ80` |
| `Antecedentes!<celda> · lista inline` | Catálogo declarado inline en la data validation de esa celda | `Antecedentes!AF39 · lista inline` |
| *(vacío)* | **Texto libre** — la celda no tiene data validation | `cierros_exteriores` · `closet_mural` · `sanitarios` · `griferia` |

⚠ **Airtable descarta el string vacío al escribir**, de modo que las filas de texto libre vuelven
**sin la clave** `fld0NAJv7E1rLFWVX` en la respuesta de la API, no con `""`. El efecto observable
es el mismo —celda vacía— pero un cliente que espere la clave presente debe tolerar su ausencia.

**`iluminacion` comparte la data validation de `calidad`.** `BE46:BE50` y `Y37:Y44` están en la
misma `dataValidation` del `.xlsm` (`DEFICIENTE · INFERIOR · REGULAR · CORRIENTE · BUENA ·
SUPERIOR`). Sus 20 filas llevan `catalogo_ref` inline, no vacío.

### Ambigüedades vigentes

- **A-37 · ✅ CERRADA** el 22-ago-2026 por **P0.5.B-TAS**. `M_TiposPropiedad` quedó saneada —9
  filas activas en Title Case, sin duplicados por capitalización— y los defaults se cuelgan de
  `Casa` (`recrXDAjlVCe59XBW`) y `Departamento` (`recf9hz8TbkQ6wsus`) sin ambigüedad de fila.
  Era la bloqueante del sembrado. Ver §7.1.
- **A-41 · abierta, no bloqueante.** Dos defaults dependen de interruptores ajenos a la clave de
  partición: la materialidad de `entrepisos` depende de `numeroPisos` `[Excel: Portada!BK5]` y
  **no se sembró en `Casa`** (sí su calidad y su estado, que no dependen de `H39`); `calefaccion`
  depende de `AB22` y se sembró con `NO PRESENTA`, que es lo que la plantilla despacha en blanco.
- **A-42 · abierta, no bloqueante.** `Departamento·usado·obras_complementarias·estado` vale
  **`BUENA`**, un valor del catálogo de **calidad** que no pertenece al de estado. Es el valor del
  Excel tal cual (R1); lo esperable sería `BUENO`. Pendiente de validación con Héctor.
- **A-43 · abierta, no bloqueante.** `Casa Piloto` y `Departamento Piloto` existen en
  `M_TiposPropiedad` pero **no tienen defaults**: sus fórmulas caen en la rama "resto", que para
  `Departamento Piloto` significa comportarse como Casa (cubierta `PLANCHA METALICA`, sin
  `PISCINA`), casi con certeza no deseado.
- **A-38.** Dónde se materializan los catálogos de valores admisibles (36 de estructura
  soportante, 19 de cubierta, 13 de muebles de cocina…). No dependen de la combinación, así que
  alojarlos en esta tabla los duplicaría; hoy sólo se referencian por `catalogo_ref`.
- **A-39.** El anexo de estado de conservación (38 filas × `Bueno`/`Ninguno`/`Funcionando`,
  `[Excel: Estado Conservación!A7:W46]`) **no está en esta tabla**: no ramifica por ninguno de los
  dos ejes, de modo que alojarlo acá duplicaría 114 filas constantes por combinación. Se resuelve
  con tabla hermana o como constante de aplicación; agregar la cuarta opción a `bloque` es un
  `update_field` trivial si se decide lo primero.
