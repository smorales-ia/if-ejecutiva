# CHECKLIST PRE-EJECUCIÓN · CU-002 · IF-02

> **Versión**: 1.2 (decisiones D-01…D-08 incorporadas · SC13 fuera de alcance · RF-09 agregado · campos `disponible`/`casos_en_curso` corregidos · H-04 añadido · 06-jul-2026).  
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

> **Estado global**: BQ-1 y BQ-2 cerrados vía auditoría MCP el 04-jul-2026. Las casillas siguen presentes con TABLE_IDs reales para permitir re-verificación posterior.

- [x] ✅ **`TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`)** presente con los campos base del §1.3 del plan (incluye `origen_canal`, `prioridad`, `visador`, `fecha_visita_programada`, `tasador`, `estado`, `cliente`, `producto`, `tipo_informe`, `tipo_propiedad`, `comuna`, `region`, `banco`).  
  Verificación MCP 04-jul-2026: `Airtable:list_tables_for_base(app9G7lLkIV3CpeLa)`. Snapshot en `docs/schema-2026-07-04.json`.

- [ ] **Campos discrepantes en `TX_Solicitudes` reconciliados (D-08)**: nombres reales son `n_operacion_cliente` (number · `fldb1vmKk7y3hi4uY`), `sucursal_originadora ` (con espacio final, requiere corrección a `sucursal_originadora`), `ejecutivo_solicitante` (`fldRweQyq3tTQGmPR`).  
  Verificación: `GET /meta/bases/.../tables` refleja el espacio eliminado de `sucursal_originadora`.

- [ ] **Campos ausentes creados en `TX_Solicitudes`** (D-02 + D-08): `notas_tasador` (multilineText), `notas_visador` (multilineText), `ejecutiva_asignada` (link a `AUTH_Usuarios` · `tblbX3hPD2uhqhl5v` · RF-52).  
  Verificación: schema endpoint los muestra tras cierre de D-08-ejecución. `AUTH_Usuarios` existe y está poblada (07-jul-2026).

- [ ] ⛔ **P0 · H-04 · Campo trigger de AT02 confirmado y creado en `TX_Solicitudes`**. El nombre exacto del campo (checkbox) que AT02 observa para disparar la transición `creada → asignada` debe confirmarse revisando la configuración actual de AT02 en Airtable Automations. Si no existe, crearlo antes de construir RF-06.  
  Verificación: en Airtable Automations → AT02, el trigger muestra el campo checkbox y su nombre exacto. El nombre queda documentado en `docs/schema-airtable.md`.

- [x] ✅ **`M_Tasadores` (`tblEi5jp18c1j00bQ`)** con `activo`, `zonas_cobertura` (link → M_Comunas), `capacidad_activa`, `especialidades` (multipleSelects), `email`, `tasador_id`.  
  Verificación MCP 04-jul-2026: presente.

- [ ] **Campos `disponible` y `casos_en_curso` creados en `M_Tasadores`** (H-05 · D-08-ejecución).  
  Los tres documentos fuente (Capa Datos v2.6.2, Motor Cálculo v2.5, Blueprint v2.7) los definen explícitamente. Deben crearse si no existen en la instancia real:  
  - `disponible` (Formula: `IF(casos_en_curso < capacidad_activa, TRUE, FALSE)`)  
  - `casos_en_curso` (Count link a `TX_Solicitudes` activas)  
  Verificación: `Airtable:get_table_schema(tblEi5jp18c1j00bQ)` muestra ambos campos.

- [x] ✅ ⛔ **BQ-1 · `M_Visadores` existe** (`tbludtgDtHWvt0Q3D`) con `nombre` (primary), `email`, `especialidades` (multipleSelects — **plural**, no `especialidad`), `firma_url`, `activo`, `visador_id` (autoNumber), `fono` (phoneNumber).  
  Verificación MCP 04-jul-2026: **BQ-1 cerrado**.

- [x] ✅ ⛔ **BQ-2 · Tablas de auditoría creadas**:  
  - `TX_Adjuntos` (`tblur71x1oItbmKZc`) ✅  
  - `A_Eventos` (`tblMKmDg2KrO5fMn8`) ✅  
  - `A_Cambios` (`tbl6Yd0c7MRqNeC0x`) ✅  
  - `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`) ✅  
  - `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`) ✅  
  Verificación MCP 04-jul-2026: **BQ-2 cerrado**.

- [x] ✅ **`M_Clientes` (`tblpK7AcYBMH93apK`)** con `productos`, `activo`, campos de `factor_*`, `tasa_cap_rate`, `bancos_asociados`.  
  Verificación MCP 04-jul-2026. **Nota**: `tipos_informe_permitidos` y `requiere_rol_sii_validado` **no existen** como campos directos; la restricción por producto sale del link `M_Clientes.productos → M_Productos → tipo_informe`.

- [x] ✅ **`M_Comunas` (`tblyggAfQfq682XHK`)**, **`M_TiposInforme` (`tblOcsdiwxQLfD178`)**, **`M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`)** accesibles.  
  Verificación MCP 04-jul-2026.

- [x] ✅ **`M_Bancos` (`tblGlYuJo5AeMehhs`)** y **`M_Productos` (`tbll6D4KQ5aDdjjaj`)** presentes.  
  Verificación MCP 04-jul-2026.

- [x] ✅ **`C_SLA` (`tblsPZokEK5aoinTn`)** con `sla_dias`, `sla_dias_alerta`, `sla_dias_vencido`, `dias_totales`, `dias_alerta_amarilla`, `dias_alerta_roja`, `cliente`, `tipo_informe`, `tipo_propiedad`.  
  Verificación MCP 04-jul-2026.

- [x] ✅ **`LogEscenarios` (`tblR4VWpUHw1CSyIS`)** escribible con el token activo.  
  Verificación MCP 04-jul-2026: tabla existe con los campos esperados. `POST` de prueba pendiente para confirmar permisos de escritura del token productivo.

---

## 3. Automations Airtable (Motor AT01–AT10)

> **Nota**: MCP puede auditar `C_AutomationsAirtable` (registro) pero **no puede leer el estado activo/inactivo de scripts de Airtable Automations**. El owner Airtable debe abrir la UI de Automations para confirmar el estado real de AT01/AT02/AT08.

- [ ] ⛔ **BQ-4 (residual) · AT01 (script) ACTIVO con trigger `estado = creada`**, lee `C_ReglasNegocio` (`tblyCb8cVTDzfeBx0` ✅), escribe `regla_aplicada` y crea fila en `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN` ✅).  
  Verificación: aparece en `Automations` de Airtable con estado `On`, log de últimas 24 h sin errores.

- [ ] ⛔ **BQ-4 (residual) · AT02 (script) ACTIVO** con trigger en el campo checkbox confirmado (H-04), valida precondiciones (tasador+visador+fecha_visita_programada), asigna, escribe `A_Eventos` (`tblMKmDg2KrO5fMn8` ✅). Respeta asignación previa existente y registra `A_Cambios(motivo=override_manual)` (D-04).  
  Verificación: idem AT01. Nombre del campo trigger registrado en `docs/schema-airtable.md`.

- [ ] ⛔ **BQ-4 (residual) · AT08 (scheduled) ACTIVA cron 08:00 diario**, lee `C_SLA` (`tblsPZokEK5aoinTn` ✅), escribe `TX_Notificaciones` (`tbldgLQgjdgsOSZnt` ✅).  
  Verificación: schedule visible en Automations, próxima corrida < 24 h.  
  **Nota**: SC13 está **fuera del alcance de CU-002**; AT08 actualiza `TX_Notificaciones` pero no encadena ningún escenario Make en este CU.

---

## 4. Escenarios Make (org 1594725)

> **Nota**: MCP no llega a Make. La auditoría del registro `Z_EscenariosMake` (`tblYfmDoaq7Z3Vh6P`) el 04-jul-2026 mostró **la tabla vacía**, lo que confirma que SC01/SC05/RF-09 no están creados.

- [ ] ⛔ **BQ-3 · SC01 provisionado**. Webhook + módulo Airtable `Create Record` en `TX_Solicitudes` con `estado=creada`, `origen_canal=ingreso_manual`, `ejecutiva_asignada`=usuario Clerk; firma HMAC-SHA256 (D-03); loguea en `LogEscenarios`.  
  Verificación: escenario con nombre `SC01_*` activo en Make; prueba: `POST <SC01_URL>` crea un registro que luego se elimina. Fila creada en `Z_EscenariosMake`.

- [ ] ⛔ **BQ-3 · SC05 provisionado**. Trigger desde Airtable Automation al pasar a `asignada`. Envía email vía **Gmail** (módulo aislado para futuro swap al servidor VProperty) al tasador entrante con link a `IF-03/{codigo_ext}`; loguea en `TX_Notificaciones`.  
  **⚠ Verificación previa (H-03)**: antes de provisionar, confirmar que el código "SC05" está libre en Make org 1594725 y no fue reutilizado en ningún escenario activo. Si existe un SC05 con otro propósito, crear con código alternativo y documentar en `Z_EscenariosMake`.  
  Verificación: envío de prueba a email de sandbox. Fila en `Z_EscenariosMake`.

- [ ] **BQ-3-c · RF-09 provisionado** (puede quedar para el paso 6 del orden §1.7.3 sin bloquear los anteriores). Recibe webhook desde Route Handler `/api/extraccion/iniciar` tras subir adjunto a Dropbox; llama Claude API; escribe `TX_DatosTasacion` + `TX_DocumentosLegales` + actualiza `TX_Adjuntos.estado_extraccion`.  
  **Nota**: crear escenario con código propio (no "SC07" — ese queda reservado para el flujo post-visita de IF-03). Documentar en `Z_EscenariosMake`.  
  Verificación: upload de prueba activa el escenario; `TX_Adjuntos.estado_extraccion` pasa a `listo` en < 30 s.

- [ ] **SC13 — FUERA DEL ALCANCE DE CU-002**. No se provisiona en este CU. Las acciones de reasignación, cambio de prioridad y pausa actualizan Airtable y escriben `A_Eventos`, pero no envían email. Deuda técnica para un CU posterior.

- [ ] **Conexiones OAuth reautorizadas**: Airtable, Gmail, Dropbox (Make → Credentials → todas verdes).  
  Verificación: pantalla Connections sin ítems en amarillo/rojo.

- [ ] Webhooks registrados en `Z_Webhooks` (`tblovY0Bt1Avhdgdx` ✅) con URL, `escenario_destino` y `secret_header`.  
  Verificación: contenido con 3 filas (SC01, SC05, RF-09) tras escritura por el Integrador Make.

---

## 5. Autenticación — dominio AUTH_ (RF-52) · Clerk

> Todas las tablas Airtable de autenticación usan prefijo `AUTH_`. Las variables de entorno de autenticación usan prefijo `AUTH_`. Las tablas `AUTH_Roles` y `AUTH_Usuarios` existen y están pobladas (07-jul-2026).

- [x] ✅ **AUTH_Roles poblada** (`tblhJSBD9xh3ftwbs`) con 3 roles activos: `ejecutiva_comercial` · `visador` · `tasador`.  
  Verificación MCP 07-jul-2026: 3 registros con `activo=true`.

- [x] ✅ **AUTH_Usuarios poblada** (`tblbX3hPD2uhqhl5v`) con 1 usuario de prueba (ejecutiva_comercial · nutricionsaludketo@gmail.com).  
  Verificación MCP 07-jul-2026: 1 registro `estado=activo`.

- [ ] **Aplicación Clerk creada** con dominio productivo VProperty.  
  Verificación: dashboard Clerk muestra la app; `AUTH_CLERK_PUBLISHABLE_KEY` y `AUTH_CLERK_SECRET_KEY` copiadas a un vault fuera del repo. ⚠ Nota: Clerk SDK ≥ v5 permite pasar la clave explícitamente a `<ClerkProvider publishableKey={process.env.AUTH_CLERK_PUBLISHABLE_KEY}>` — no es necesario el nombre `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

- [ ] **Rol `ejecutivo_comercial` verificado en Clerk** (Organization Roles o `public_metadata.role`).  
  Verificación: al menos 1 usuario de prueba con ese rol; `useUser()` en sandbox devuelve el rol.

- [ ] **Middleware Clerk protege `/consola/*`** y redirige a `/sign-in`.  
  Verificación: `curl -I https://<dev-host>/consola` responde `302` hacia sign-in cuando no hay sesión.

---

## 6. Railway

- [ ] Proyecto Railway creado con nombre `vproperty-ejecutiva`.  
  Verificación: dashboard Railway lo muestra; dominio `vproperty-ejecutiva-*.up.railway.app` responde `200` al deploy inicial.

- [ ] Variables de entorno cargadas en Railway (ninguna con prefijo `NEXT_PUBLIC_` que exponga secretos):  
  `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa`, `MAKE_WEBHOOK_URL_SC01`, `MAKE_WEBHOOK_URL_SC05`, `MAKE_WEBHOOK_URL_RF09`, `MAKE_HMAC_SECRET`, `AUTH_CLERK_PUBLISHABLE_KEY`, `AUTH_CLERK_SECRET_KEY`, `AUTH_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_APP_URL`.  
  Verificación: `railway variables` los lista; ningún valor sensible aparece en logs. (RF-52: prefijo AUTH_ para vars de autenticación.)

---

## 7. Entorno local (`.env.local` completo)

- [ ] Archivo `.env.local` en el repo NO commiteado (`.gitignore` lo contiene).  
  Verificación: `git check-ignore -v .env.local` responde afirmativo.

- [ ] Todas las variables anteriores presentes localmente y probadas con `pnpm dev`.  
  Verificación: `pnpm dev` arranca sin warnings de variable faltante; `/api/health` devuelve `200`.

---

## 8. CU-000 disponible

- [ ] Paquete o carpeta de componentes compartidos VProperty (`RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`, `SLABadge`, `StateBadge`, `EventTimeline`) accesibles al repo IF-02.  
  Verificación: `import { SLABadge } from '@vp/ui'` (o path acordado) compila sin errores.

- [ ] Versión de CU-000 fijada en `package.json` (no `latest`).  
  Verificación: `grep '@vp/ui' package.json` muestra versión SemVer explícita.

---

## 9. Repositorio y ramas

- [ ] Repo IF-02 en `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` (path real de trabajo en WSL2).  
  Verificación: `git remote -v` apunta al repo VProperty correcto.

- [ ] `main` protegida en el remoto (require PR + 1 review).  
  Verificación: settings del repo lo confirman.

---

## 10. Backup y snapshots

- [ ] Backup del `CLAUDE.md` actual guardado con timestamp (si ya existe una versión previa).  
  Verificación: existe archivo `CLAUDE.md.bak.YYYYMMDD-HHMM` o similar fuera del árbol commiteado.

- [x] ✅ **Snapshot del schema Airtable guardado**: `docs/schema-2026-07-04.json`.  
  Verificación: el archivo contiene la respuesta de `Airtable:list_tables_for_base(app9G7lLkIV3CpeLa)` capturada el 04-jul-2026. Ver también `docs/schema-airtable.md` para la versión legible con FIELD_IDs.

- [ ] Snapshot de escenarios Make actuales en `docs/make-scenarios-YYYY-MM-DD.json` (requiere token Make, no accesible vía MCP).  
  Verificación: archivo existe con lista de escenarios de la org 1594725.

---

## 11. Sanity checks funcionales (post-provisión)

- [ ] Prueba end-to-end sandbox SC01: `POST` al webhook SC01 con payload dummy → crea `TX_Solicitudes` con `estado=creada` → AT01 escribe `regla_aplicada` en < 5 s → AT02 completa transición o falla graciosamente.  
  Verificación: fila en `TX_Solicitudes` con timestamps coherentes; fila en `A_Eventos`; fila en `LogEscenarios` (`tblR4VWpUHw1CSyIS`).

- [ ] Prueba de "Pasar a asignada": setear tasador+visador+fecha_visita_programada en record de prueba → actualizar campo trigger AT02 → estado pasa a `asignada` → SC05 dispara email al tasador.  
  Verificación: email recibido en casilla sandbox; `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`) tiene la fila.

- [ ] Prueba RF-09: subir adjunto de prueba desde IF-02 → Route Handler `/api/extraccion/iniciar` → escenario Make → Claude API → `TX_Adjuntos.estado_extraccion = listo`.  
  Verificación: badge `ExtraccionStatusBadge` en IF-02 muestra `listo`; `TX_DatosTasacion` tiene la fila.

---

## 12. Documentación

- [ ] `CLAUDE.md` en la raíz del repo presente y con el bloque CU-002 (de `docs/CLAUDE_MD_ADENDA.md` v1.2).  
  Verificación: `grep -n "CU-002 · IF-02" CLAUDE.md` encuentra el bloque.

- [ ] `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md`, `docs/ROADMAP_PRE_EJECUCION.md` v1.2, `docs/CHECKLIST_PRE_EJECUCION.md` v1.2 y `docs/CLAUDE_MD_ADENDA.md` v1.2 committeados en `docs/` de la rama principal.  
  Verificación: `git log docs/` muestra los archivos actualizados.

- [ ] `docs/diseno.md`, `docs/construccion.md`, `docs/schema-airtable.md` presentes y legibles para Claude Code.  
  Verificación: los tres archivos existen y no tienen secciones en blanco.

- [ ] `docs/NOTAS_DIVERGENCIA_v1_2.md` presente con H-02, H-03, H-06.  
  Verificación: `grep -n "H-02\|H-03\|H-06" docs/NOTAS_DIVERGENCIA_v1_2.md` muestra las tres secciones.

---

## Resumen de bloqueadores (actualizado 06-jul-2026)

| Código | Descripción | Estado | Owner | Debe cerrarse antes de |
|---|---|---|---|---|
| ⛔ **BQ-1** | Tabla `M_Visadores` no confirmada. | ✅ **CERRADO** (04-jul-2026 · MCP) · `tbludtgDtHWvt0Q3D` presente. | — | — |
| ⛔ **BQ-2** | Tablas `TX_Adjuntos`, `A_Eventos`, `A_Cambios`, `A_DecisionesMotor`, `C_NotificacionesConfig` no confirmadas. | ✅ **CERRADO** (04-jul-2026 · MCP). | — | — |
| ✅ **D-08** | Discrepancias nomenclatura + campos ausentes en `TX_Solicitudes`. | ✅ **DECISIÓN APROBADA** (06-jul-2026 · opción C híbrida). **Pendiente ejecución** por Ingeniero Airtable. | Ingeniero Airtable | Cualquier Route Handler que escriba a `TX_Solicitudes`. |
| ⛔ **H-04 · P0** | Nombre del campo trigger (checkbox) de AT02 no definido. | ❌ **PENDIENTE** — requiere inspeccionar UI de Airtable Automations. | Ingeniero Airtable | RF-06 ("Pasar a asignada"). |
| ⛔ **BQ-3** | Escenarios Make SC01, SC05, RF-09 no existen. SC13 fuera de alcance. | ❌ **PENDIENTE** (`Z_EscenariosMake` vacía al 04-jul-2026). | Integrador Make | SC01: botón "Crear solicitud". SC05: botón "Pasar a asignada". RF-09: upload de adjuntos. |
| ⚠ **BQ-4** | Scripts Airtable AT01, AT02, AT08 no confirmados activos. | ⚠ **RESIDUAL** — tablas dependientes OK; estado `On/Off` sólo verificable en UI Airtable. AT01 y AT02 confirmados `On` según Plan §1.1. | Ingeniero Airtable | Flujos que dependen del motor de reglas / asignador / cron SLA. |

Sin cerrar H-04, BQ-3 (SC01/SC05) y D-08-ejecución, la construcción de RF-06 en adelante no arranca. Las RF 1–3 del orden §1.7.3 (Layout, Lista, Detalle) **sí pueden avanzar** sin estos bloqueadores.
