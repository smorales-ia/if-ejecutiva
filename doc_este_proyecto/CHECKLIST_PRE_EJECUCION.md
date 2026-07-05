# CHECKLIST PRE-EJECUCIÓN · CU-002 · IF-02

> **Versión**: 1.1 (auditoría schema Airtable vía MCP incorporada · 04-jul-2026).  
> Cada casilla tiene un criterio de verificación **observable** (una consulta, un `curl`, un artefacto). Si no puede verificarse, no está hecha. Los bloqueadores duros están marcados con ⛔; los cerrados vía MCP quedan visibles pero marcados ✅ para trazabilidad.

---

## 1. Credenciales y tokens vigentes

- [ ] **Token Airtable `patxMFmnYmU30RLIl` sigue vigente y con scopes `data.records:read/write` + `schema.bases:read`.**  
  Verificación: `curl -H "Authorization: Bearer $AIRTABLE_TOKEN" "https://api.airtable.com/v0/meta/bases/app9G7lLkIV3CpeLa/tables"` responde `200` y lista tablas.

- [ ] **Token Make `0f49f6e8-c548-428a-a3cb-c833c9c908dd` responde en org 1594725.**  
  Verificación: `curl -H "Authorization: Token $MAKE_TOKEN" "https://eu1.make.com/api/v2/scenarios?teamId=1594725"` responde `200` con lista de escenarios.

- [ ] **Cuenta Dropbox `nutricionsaludketo@gmail.com` conectada en Make como `My Dropbox connection` y verificada.**  
  Verificación: en Make → Connections, la fila `My Dropbox connection` está en verde (última verificación < 24 h).

- [ ] **App Dropbox `VProperty_Make` (`jmnpsxk7tyhpg9w`) aprobada para producción o, mientras siga en Development, sólo se usa vía Make OAuth (nunca vía token directo).**  
  Verificación: cero apariciones de `sl.u.` en `.env.local` y en `.env.production`.

---

## 2. Esquema Airtable presente (BASE `app9G7lLkIV3CpeLa`)

> **Estado global**: BQ-1 y BQ-2 cerrados vía auditoría MCP el 04-jul-2026. Las casillas siguen presentes con TABLE_IDs reales para permitir re-verificación posterior. Si una casilla sigue en ❌ es porque el owner debe crear/renombrar el ítem antes de construcción.

- [x] ✅ **`TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`)** presente con los campos base del §1.3 del plan (incluye `origen_canal`, `prioridad`, `visador`, `fecha_visita_programada`, `tasador`, `estado`, `cliente`, `producto`, `tipo_informe`, `tipo_propiedad`, `comuna`, `region`, `banco`).  
  Verificación MCP 04-jul-2026: `Airtable:list_tables_for_base(app9G7lLkIV3CpeLa)`. Snapshot en `docs/if02/plan/snapshots/schema-2026-07-04.json`.

- [ ] **Campos discrepantes en `TX_Solicitudes` reconciliados (D-08)**: nombres reales son `n_operacion_cliente` (no `op_cliente`), `sucursal_originadora ` (con espacio final, requiere corrección), `ejecutivo_solicitante` (no `ejec_solicitante`).  
  Verificación: `GET /meta/bases/.../tables` refleja la resolución acordada en ADR-cu-002.md (D-08).

- [ ] **Campos ausentes creados en `TX_Solicitudes`**: `notas_tasador`, `notas_visador`, `ejecutiva_asignada` (según decisión D-02 y D-08).  
  Verificación: schema endpoint los muestra tras cierre de D-08.

- [x] ✅ **`M_Tasadores` (`tblEi5jp18c1j00bQ`)** con `activo`, `zonas_cobertura` (link → M_Comunas), `capacidad_activa`, `especialidades` (multipleSelects), `email`, `tasador_id`.  
  Verificación MCP 04-jul-2026: presente. **Nota**: los campos `disponible` y `casos_en_curso` que el plan v1.0 asumía **no existen**; la disponibilidad se deriva de `capacidad_activa` en runtime (ver Plan §1.3).

- [x] ✅ ⛔ **BQ-1 · `M_Visadores` existe** (`tbludtgDtHWvt0Q3D`) con `nombre` (primary), `email`, `especialidades` (multipleSelects — **plural**, no `especialidad`), `firma_url`, `activo`, `visador_id` (autoNumber), `fono` (phoneNumber).  
  Verificación MCP 04-jul-2026: **BQ-1 cerrado**. Discrepancia menor de nombre (plural) ya reflejada en Plan §1.3 y §1.5.

- [x] ✅ ⛔ **BQ-2 · Tablas de auditoría creadas**:  
  - `TX_Adjuntos` (`tblur71x1oItbmKZc`) ✅  
  - `A_Eventos` (`tblMKmDg2KrO5fMn8`) ✅  
  - `A_Cambios` (`tbl6Yd0c7MRqNeC0x`) ✅  
  - `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`) ✅  
  - `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`) ✅  
  Verificación MCP 04-jul-2026: **BQ-2 cerrado**. Bonus disponibles: `A_ErroresMake` (`tbl46Q0BcfD57LWyQ`), `A_Accesos` (`tblqXDIFFOGkMhvK0`), `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`).

- [x] ✅ **`M_Clientes` (`tblpK7AcYBMH93apK`)** con `productos`, `activo`, campos de `factor_*`, `tasa_cap_rate`, `bancos_asociados`.  
  Verificación MCP 04-jul-2026. **Nota**: `tipos_informe_permitidos` y `requiere_rol_sii_validado` **no existen** como campos directos; la restricción por producto sale del link `M_Clientes.productos → M_Productos → tipo_informe`.

- [x] ✅ **`M_Comunas` (`tblyggAfQfq682XHK`)**, **`M_TiposInforme` (`tblOcsdiwxQLfD178`)**, **`M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`)** accesibles.  
  Verificación MCP 04-jul-2026.

- [x] ✅ **`M_Bancos` (`tblGlYuJo5AeMehhs`)** y **`M_Productos` (`tbll6D4KQ5aDdjjaj`)** presentes (necesarios para IF-02).  
  Verificación MCP 04-jul-2026.

- [x] ✅ **`C_SLA` (`tblsPZokEK5aoinTn`)** con `sla_dias`, `sla_dias_alerta`, `sla_dias_vencido`, `dias_totales`, `dias_alerta_amarilla`, `dias_alerta_roja`, `cliente`, `tipo_informe`, `tipo_propiedad`.  
  Verificación MCP 04-jul-2026. **Nota**: el plan v1.0 asumía un campo `dias` genérico; los umbrales reales están descompuestos en tres campos separados.

- [x] ✅ **`LogEscenarios` (`tblR4VWpUHw1CSyIS`)** escribible con el token activo.  
  Verificación MCP 04-jul-2026: tabla existe con los campos esperados. `POST` de prueba pendiente para confirmar permisos de escritura del token productivo.

---

## 3. Automations Airtable (Motor AT01–AT10)

> **Nota**: MCP puede auditar `C_AutomationsAirtable` (registro) pero **no puede leer el estado activo/inactivo de scripts de Airtable Automations**. En la auditoría 04-jul-2026 la tabla contiene 9 filas; el owner Airtable debe abrir la UI de Automations para confirmar el estado real de AT01/AT02/AT08.

- [ ] ⛔ **BQ-4 (residual) · AT01 (script) ACTIVO con trigger `estado = creada`**, lee `C_ReglasNegocio` (`tblyCb8cVTDzfeBx0` ✅), escribe `regla_aplicada` (link presente en TX_Solicitudes ✅) y crea fila en `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN` ✅).  
  Verificación: aparece en `Automations` de Airtable con estado `On`, log de últimas 24 h sin errores; registrado en `C_AutomationsAirtable` (una de las 9 filas presentes).

- [ ] ⛔ **BQ-4 (residual) · AT02 (script) ACTIVO con trigger `estado = creada` (post-AT01)**, valida precondiciones (tasador+visador+fecha_visita_programada), asigna, escribe `A_Eventos` (`tblMKmDg2KrO5fMn8` ✅).  
  Verificación: idem AT01.

- [ ] ⛔ **BQ-4 (residual) · AT08 (scheduled) ACTIVA cron 08:00 diario**, lee `C_SLA` (`tblsPZokEK5aoinTn` ✅), escribe `TX_Notificaciones` (`tbldgLQgjdgsOSZnt` ✅) y dispara SC13.  
  Verificación: schedule visible en Automations, próxima corrida < 24 h.

---

## 4. Escenarios Make (org 1594725)

> **Nota**: MCP no llega a Make. La auditoría del registro `Z_EscenariosMake` (`tblYfmDoaq7Z3Vh6P`) el 04-jul-2026 mostró **la tabla vacía**, lo que refuerza que SC01/SC05/SC13 no están creados. La confirmación definitiva requiere `curl` al API de Make o inspección directa en `eu1.make.com`.

- [ ] ⛔ **BQ-3 · SC01 provisionado**. Webhook + módulo Airtable `Create Record` en `TX_Solicitudes` con `estado=creada`, `origen_canal=ingreso_manual`; loguea en `LogEscenarios`.  
  Verificación: `GET /scenarios?teamId=1594725` incluye escenario con nombre `SC01_*`; ejecución de prueba desde Make responde `200 OK` y crea un registro que luego se elimina. Fila creada en `Z_EscenariosMake`.

- [ ] ⛔ **BQ-3 · SC05 provisionado**. Trigger desde Airtable Automation al pasar a `asignada`. Envía email al tasador con link a `IF-03/{codigo_ext}`; loguea.  
  Verificación: idem. Envío de prueba a un email de sandbox. Fila creada en `Z_EscenariosMake`.

- [ ] ⛔ **BQ-3 · SC13 provisionado**. Recibe eventos de reasignación / cambio prioridad / pausa; consulta `C_NotificacionesConfig` (`tbluB662ulWDaxqUY` ✅); envía Gmail; loguea.  
  Verificación: idem. Fila creada en `Z_EscenariosMake`.

- [ ] **Conexiones OAuth reautorizadas**: Airtable, Gmail, Dropbox (Make → Credentials → todas verdes).  
  Verificación: pantalla Connections sin ítems en amarillo/rojo.

- [ ] Webhooks registrados en `Z_Webhooks` (`tblovY0Bt1Avhdgdx` ✅) con URL, `escenario_destino` y `secret_header`.  
  Verificación: `Airtable:list_tables_for_base` confirma la tabla; contenido con 3 filas (SC01, SC05, SC13) pendiente de escritura por el Integrador Make.

---

## 5. Clerk

- [ ] Aplicación Clerk creada con dominio productivo VProperty.  
  Verificación: dashboard Clerk muestra la app; `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` copiadas a un vault fuera del repo.

- [ ] Rol `ejecutivo_comercial` definido en Clerk (Organization Roles o custom `public_metadata.role`).  
  Verificación: al menos 1 usuario de prueba con ese rol; `useUser()` en sandbox devuelve el rol.

- [ ] Middleware Clerk protege `/consola/*` y redirige a `/sign-in`.  
  Verificación: `curl -I https://<dev-host>/consola` responde `302` hacia sign-in cuando no hay sesión.

---

## 6. Railway

- [ ] Proyecto Railway creado (o servicio dentro de proyecto existente) con nombre `vproperty-ejecutiva`.  
  Verificación: dashboard Railway lo muestra; dominio `vproperty-ejecutiva-*.up.railway.app` responde `200` al deploy inicial.

- [ ] Variables de entorno cargadas en Railway (ninguna con prefijo `NEXT_PUBLIC_` que exponga secretos):  
  `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa`, `MAKE_WEBHOOK_SC01`, `MAKE_WEBHOOK_SC05`, `MAKE_WEBHOOK_SC13`, `MAKE_SIGNING_SECRET`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_APP_URL`.  
  Verificación: `railway variables` los lista; ningún valor sensible aparece en logs.

---

## 7. Entorno local (`.env.local` completo)

- [ ] Archivo `.env.local` en el repo NO commiteado (`.gitignore` lo contiene).  
  Verificación: `git check-ignore -v .env.local` responde afirmativo.

- [ ] Todas las variables anteriores presentes localmente y probadas con `pnpm dev`.  
  Verificación: `pnpm dev` arranca sin warnings de variable faltante; `/api/health` devuelve `200`.

---

## 8. CU-000 disponible

- [ ] Paquete o carpeta de componentes compartidos VProperty (`RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`, `SLABadge`, `StateBadge`, `EventTimeline`) accesibles al repo IF-02.  
  Verificación: `import { SLABadge } from '@vp/ui'` (o path acordado) compila sin errores; storybook/preview del CU-000 disponible.

- [ ] Versión de CU-000 fijada en `package.json` (no `latest`).  
  Verificación: `grep '@vp/ui' package.json` muestra versión SemVer explícita.

---

## 9. Repositorio y ramas

- [ ] Repo IF-02 clonado en `apps/if02-ejecutiva` (o path acordado).  
  Verificación: `git remote -v` apunta al repo VProperty correcto.

- [ ] Rama `feat/cu-002-if02-plan` creada desde `main`.  
  Verificación: `git branch --show-current` la lista.

- [ ] `main` protegida en el remoto (require PR + 1 review).  
  Verificación: settings del repo lo confirman.

---

## 10. Backup y snapshots

- [ ] Backup del `CLAUDE.md` actual guardado con timestamp.  
  Verificación: existe archivo `CLAUDE.md.bak.YYYYMMDD-HHMM` en la raíz del repo (fuera del árbol commiteado o dentro de un `backups/` git-ignored).

- [x] ✅ **Snapshot del schema Airtable guardado**: `docs/if02/plan/snapshots/schema-2026-07-04.json`.  
  Verificación: el archivo contiene la respuesta de `Airtable:list_tables_for_base(app9G7lLkIV3CpeLa)` capturada el 04-jul-2026.

- [ ] Snapshot de escenarios Make actuales en `docs/if02/plan/snapshots/make-scenarios-YYYY-MM-DD.json` (requiere token Make, no accesible vía MCP).  
  Verificación: existe.

---

## 11. Sanity checks funcionales (post-provisión)

- [ ] Prueba end-to-end sandbox: `POST` al webhook SC01 con payload dummy → crea `TX_Solicitudes` con `estado=creada` → AT01 escribe `regla_aplicada` en < 5 s → AT02 escribe `A_Eventos` de asignación (o falla graciosamente si faltan precondiciones).  
  Verificación: fila en `TX_Solicitudes` con timestamps coherentes; fila en `A_Eventos` (`tblMKmDg2KrO5fMn8`); fila en `LogEscenarios` (`tblR4VWpUHw1CSyIS`).

- [ ] Prueba de "Pasar a asignada" desde Airtable manualmente (seteando tasador+visador+fecha_visita_programada en record de prueba) → estado pasa a `asignada` → SC05 dispara email de prueba.  
  Verificación: email recibido en la casilla de sandbox; `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`) tiene la fila.

- [ ] Prueba de reasignación manual → escribe `A_Eventos(tipo_evento=reasignacion_manual)` → SC13 dispara notificación.  
  Verificación: fila `A_Eventos` y email recibido.

---

## 12. Documentación

- [ ] Adenda del `CLAUDE.md` (archivo `docs/if02/plan/CLAUDE_MD_ADENDA.md`) revisada por Redactor Técnico y anexada al `CLAUDE.md` mediante el comando indicado al inicio de ese archivo.  
  Verificación: `tail -n 200 CLAUDE.md` muestra el bloque CU-002 al final.

- [ ] `PLAN_IMPLEMENTACION_IF02.md` v1.1, `ROADMAP_PRE_EJECUCION.md` v1.1, `CHECKLIST_PRE_EJECUCION.md` v1.1 y `CLAUDE_MD_ADENDA.md` v1.1 committeados en `docs/if02/plan/` de la rama del punto 9.  
  Verificación: `git log docs/if02/plan/` muestra los 4 archivos.

- [ ] Decisiones D-01..D-08 del §1.9 del plan **respondidas** por el propietario y registradas en un `ADR-cu-002.md`.  
  Verificación: existe `docs/if02/adr/ADR-cu-002.md` con las respuestas (8 decisiones — se agregó D-08 tras auditoría MCP).

---

## Resumen de bloqueadores (04-jul-2026)

| Código | Descripción | Estado tras MCP | Owner sugerido | Debe cerrarse antes de |
|---|---|---|---|---|
| ⛔ **BQ-1** | Tabla `M_Visadores` no confirmada en Credenciales v3. | ✅ **CERRADO** (04-jul-2026 · MCP) · `tbludtgDtHWvt0Q3D` presente. | Ingeniero Airtable | — |
| ⛔ **BQ-2** | Tablas `TX_Adjuntos`, `A_Eventos`, `A_Cambios`, `A_DecisionesMotor`, `C_NotificacionesConfig` no confirmadas. | ✅ **CERRADO** (04-jul-2026 · MCP) · las 5 presentes con TABLE_IDs en §2. | Ingeniero Airtable | — |
| ⛔ **BQ-3** | Escenarios Make SC01, SC05, SC13 no existen. | ❌ **PENDIENTE** (MCP no llega a Make; `Z_EscenariosMake` vacía como señal indirecta). | Integrador Make | Botones "Crear solicitud", "Pasar a asignada", "Reasignar", "Cambiar prioridad", "Pausar". |
| ⚠ **BQ-4** | Scripts Airtable AT01, AT02, AT08 no confirmados activos. | ⚠ **RESIDUAL** — tablas dependientes y `C_AutomationsAirtable` (9 filas) presentes; estado `On/Off` de scripts sólo verificable en la UI de Airtable Automations. | Ingeniero Airtable | Cualquier flujo que dependa del motor de reglas / asignador / cron de SLA. |
| 🆕 **D-08** | Discrepancias de nomenclatura entre spec y schema real (`n_operacion_cliente`, `sucursal_originadora `, `ejecutivo_solicitante`) + tres campos ausentes. | Nueva decisión pendiente. Ver §1.9 del plan. | Propietario + Ingeniero Airtable | Cualquier Route Handler que escriba a `TX_Solicitudes`. |

Sin cerrar BQ-3, BQ-4 residual, D-08 y las decisiones D-01..D-07 firmadas, la construcción productiva no arranca.
