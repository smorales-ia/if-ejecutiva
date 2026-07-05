# ROADMAP PRE-EJECUCIÓN · CU-002 · IF-02

> **Versión**: 1.1 (auditoría MCP incorporada · 04-jul-2026).  
> Secuencia ordenada por dependencias para cerrar el `CHECKLIST_PRE_EJECUCION.md`.  
> **Ruta crítica** marcada con 🔴 — no arrancar construcción hasta cerrarla.  
> Tiempos estimados en horas de trabajo enfocado (no calendario).

Leyenda: 🔴 crítico · 🟠 alto · 🟢 estándar · 🔵 paralelizable con anteriores · ✅ ya cerrado vía MCP · **Owner**: Arq (Arquitecto Enterprise) · AT (Ingeniero Airtable) · MK (Integrador Make) · UI (Ingeniero Next.js) · QA (QA Lead) · Doc (Redactor Técnico) · PO (Propietario del producto).

---

## Fase 0 · Aprobaciones y decisiones (bloquea todo lo demás)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 0.1 🔴 | Propietario responde D-01..D-08 del §1.9 del plan (D-08 es nueva, deriva de auditoría MCP: renombres de campos + campos faltantes) | PO | — | 1 h | `ADR-cu-002.md` con las 8 respuestas firmadas. |
| 0.2 🔴 | Propietario da "APROBADO" al plan v1.1 | PO | — | 5 min | Mensaje escrito o issue cerrada. |

---

## Fase 1 · Snapshots y backup (evita pérdida de estado)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 1.1 🟢 | Backup del `CLAUDE.md` actual | Doc | `cp CLAUDE.md CLAUDE.md.bak.$(date +%Y%m%d-%H%M)` | 2 min | Archivo existe. |
| 1.2 ✅ | Snapshot schema Airtable (ya capturado vía MCP 04-jul-2026) | AT | `docs/if02/plan/snapshots/schema-2026-07-04.json` | Hecho | Archivo presente con la respuesta de `Airtable:list_tables_for_base`. |
| 1.3 🟠 | Snapshot escenarios Make | MK | `curl -H "Authorization: Token $MAKE_TOKEN" "https://eu1.make.com/api/v2/scenarios?teamId=1594725" > docs/if02/plan/snapshots/make-scenarios-$(date +%F).json` | 5 min | JSON válido guardado (MCP no puede hacerlo, requiere token Make). |

---

## Fase 2 · Verificación de tokens vigentes (habilita el resto)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 2.1 🔴 | Probar token Airtable `patxMFmnYmU30RLIl` fuera de MCP (para el runtime productivo) | AT | `curl -sfH "Authorization: Bearer patxMFmnYmU30RLIl.***" "https://api.airtable.com/v0/meta/bases/app9G7lLkIV3CpeLa/tables" -o /tmp/tables.json && jq '.tables|length' /tmp/tables.json` | 5 min | Devuelve entero > 0. La auditoría MCP fue con un token distinto (conector del asistente); el token de runtime debe verificarse aparte. |
| 2.2 🔴 | Probar token Make | MK | `curl -sfH "Authorization: Token 0f49f6e8-***" "https://eu1.make.com/api/v2/scenarios?teamId=1594725" -o /tmp/scenarios.json` | 5 min | `200 OK` + JSON con escenarios. |
| 2.3 🟠 | Reautorizar OAuth Airtable/Gmail/Dropbox en Make | MK | `https://eu1.make.com/1594725/connections` | 10 min | Tres conexiones en verde con "Verified now". |

---

## Fase 3 · Bloqueadores duros de infraestructura

### Fase 3A · Airtable (paralelo a 3B)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 3A.0 🔴 **D-08** | Aplicar resolución de nomenclatura acordada en ADR: (a) **corregir el espacio final** en `TX_Solicitudes.sucursal_originadora ` → `sucursal_originadora`; (b) documentar/aceptar los otros dos nombres reales (`n_operacion_cliente`, `ejecutivo_solicitante`); (c) crear los tres campos faltantes: `notas_tasador` (multilineText), `notas_visador` (multilineText), `ejecutiva_asignada` (link a `M_Usuarios` o email texto — según D-02) | AT | UI Airtable · o `Airtable:update_field` / `Airtable:create_records_for_table` según proceda | 45 min | `Airtable:list_tables_for_base` refleja los cambios; snapshot post-cambio guardado como `schema-YYYY-MM-DD-post-d08.json`. |
| 3A.1 ~~🔴 BQ-1~~ ✅ | ~~Crear tabla `M_Visadores`~~ | AT | — | 0 | ✅ **CERRADO** vía MCP el 04-jul-2026. Tabla presente como `tbludtgDtHWvt0Q3D`. Sólo verificar contenido: al menos 3 visadores de prueba con `activo=true` en cada especialidad. |
| 3A.2 ~~🔴 BQ-2~~ ✅ | ~~Crear tablas de auditoría~~ | AT | — | 0 | ✅ **CERRADO** vía MCP el 04-jul-2026. Las 5 tablas presentes: `TX_Adjuntos` (`tblur71x1oItbmKZc`), `A_Eventos` (`tblMKmDg2KrO5fMn8`), `A_Cambios` (`tbl6Yd0c7MRqNeC0x`), `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`), `C_NotificacionesConfig` (`tbluB662ulWDaxqUY`). |
| 3A.3 🟠 | Verificar semillas mínimas de M_Visadores para IF-02 (al menos 1 activo por especialidad × comuna que aparecerá en pruebas E2E) | AT | UI Airtable | 15 min | 3+ visadores con `activo=true` cubriendo `residencial`, `comercial`, `agrícola`. |
| 3A.4 🔴 **BQ-4 residual** | Verificar en la UI de Airtable Automations el estado activo de AT01 (script) con trigger `estado = creada`; si no existe, implementarlo con la spec del Motor v2.5 §5 | AT | Airtable → Automations | 3 h (0 si ya activo) | En modo test: al insertar un record con `estado=creada`, en < 5 s aparece `regla_aplicada` populada y fila en `A_DecisionesMotor`. Fila correspondiente en `C_AutomationsAirtable` con `estado=activo`. |
| 3A.5 🔴 **BQ-4 residual** | Verificar / implementar AT02 con validación de precondiciones (tasador+visador+fecha_visita_programada) | AT | Airtable → Automations | 3 h (0 si ya activo) | En modo test: fila con las 3 precondiciones cambia a `asignada`; escribe `A_Eventos`; si falta algo, no cambia. |
| 3A.6 🟠 **BQ-4 residual** | Verificar / implementar AT08 (Scheduled cron 08:00 diario) | AT | Airtable → Automations → Scheduled | 1.5 h (0 si ya activo) | Escribe `TX_Notificaciones` cuando hay SLA rojo/ámbar y dispara payload al webhook SC13. |
| 3A.7 🟢 | Crear vistas filtradas: `Activas`, `SLA en riesgo (amb/rojo)`, `Por reasignar (>48h)`, `Bloqueadas por cliente`, `Aprobadas pend. entrega`, `Mi cartera` (esta última depende de D-02 y del campo creado en 3A.0) | AT | UI Airtable → `TX_Solicitudes` → Create view | 45 min | Las 6 vistas visibles; cada una con < 500 registros de referencia. |
| 3A.8 🟢 | Registrar / actualizar filas AT01/AT02/AT08 en `C_AutomationsAirtable` (`tblYYtKEaPgH7GfY0`) | AT | UI Airtable | 15 min | 3 filas identificables con `codigo` = AT01/AT02/AT08 y `estado=activo`. |

### Fase 3B · Make (paralelo a 3A · MCP no llega a Make)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 3B.1 🔴 **BQ-3** | Crear escenario SC01 (webhook → Airtable Create `TX_Solicitudes` → LogEscenarios). Usar los nombres reales de campo tras cierre de D-08. | MK | `https://eu1.make.com/1594725/scenarios` → New scenario | 2 h | Escenario `ACTIVO`. Prueba: `curl -X POST <SC01_URL> -d '{"cliente":"...","tipo_informe":"..."}' ` crea record en `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`). |
| 3B.2 🔴 **BQ-3** | Crear escenario SC05 (Airtable Automation `estado=asignada` → Gmail al tasador con link a IF-03) | MK | idem | 1.5 h | Al setear `estado=asignada`, en < 30 s llega email al sandbox. `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`) tiene la fila. |
| 3B.3 🔴 **BQ-3** | Crear escenario SC13 (webhook genérico reasignación / prioridad / pausa) | MK | idem | 2 h | `curl -X POST <SC13_URL> -d '{"evento":"reasignacion_manual",...}'` → email correcto + fila en `TX_Notificaciones`. |
| 3B.4 🟢 | Registrar webhooks en `Z_Webhooks` (`tblovY0Bt1Avhdgdx`) de Airtable | MK | UI Airtable · o `Airtable:create_records_for_table` | 15 min | 3 filas: SC01, SC05, SC13 con URL, `secret_header`, `escenario_destino`. |
| 3B.5 🟢 | Registrar escenarios en `Z_EscenariosMake` (`tblYfmDoaq7Z3Vh6P`, hoy vacía) | MK | idem | 15 min | 3 filas con `make_scenario_id`, `nombre`, `estado=activo`. |

---

## Fase 4 · Clerk (paralelo a Fase 3 si owner disponible)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 4.1 🟠 | Crear aplicación Clerk `vproperty-ejecutiva` | Arq | `https://dashboard.clerk.com` | 20 min | App creada; publishable + secret key copiadas a vault. |
| 4.2 🟠 | Definir rol `ejecutivo_comercial` (Organization Role o `public_metadata.role`) | Arq | Clerk dashboard | 15 min | 1 usuario de prueba tiene el rol. |
| 4.3 🟢 | Configurar sign-in URL `/sign-in` y redirect a `/consola` | Arq | Clerk dashboard → Paths | 10 min | Redirects funcionan en `http://localhost:3000`. |

---

## Fase 5 · Railway (paralelo a Fase 4)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 5.1 🟢 | Crear servicio Railway `vproperty-ejecutiva` | Arq | `https://railway.app/new` | 20 min | Servicio existe; URL preview `vproperty-ejecutiva-*.up.railway.app` responde `200` a `/`. |
| 5.2 🟠 | Cargar variables de entorno (§7 del CHECKLIST) | Arq | `railway variables set ...` | 15 min | `railway variables` las lista todas. |
| 5.3 🟢 | Enlazar dominio productivo VProperty (si existe) | Arq | Railway → Settings → Domains | 15 min | DNS resuelve, TLS válido. |

---

## Fase 6 · Repositorio y CU-000

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 6.1 🟠 | Clonar repo y crear rama | Arq | `git clone <repo> && cd repo && git checkout -b feat/cu-002-if02-plan` | 5 min | `git branch --show-current` correcta. |
| 6.2 🟠 | Verificar CU-000.A disponible (paquete `@vp/ui` o carpeta compartida) | UI | `pnpm add @vp/ui@<version>` o `pnpm install` | 15 min | `import { SLABadge } from '@vp/ui'` compila. |
| 6.3 🟢 | Preparar `.env.local` completo (sin commit) | Arq | `cp .env.example .env.local && edit` | 10 min | `pnpm dev` arranca sin warnings de variable. |

---

## Fase 7 · Sanity checks end-to-end (última puerta antes de construir)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 7.1 🔴 | E2E SC01: `POST` webhook → `TX_Solicitudes` con `estado=creada` → AT01 → `regla_aplicada` populada | QA + MK + AT | `curl -X POST <SC01_URL> -H 'Content-Type: application/json' -d @tests/e2e/sc01-payload.json` | 30 min | En < 15 s la fila tiene `regla_aplicada` y hay una fila en `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`). |
| 7.2 🔴 | E2E "Pasar a asignada" manual: setear tasador+visador+fecha_visita_programada → AT02 → `estado=asignada` → SC05 → email | QA + MK + AT | UI Airtable + inbox sandbox | 20 min | Email recibido; `A_Eventos` con `tipo_evento=asignacion`; `TX_Notificaciones` con fila. |
| 7.3 🟠 | E2E reasignación: cambiar tasador → `A_Eventos(tipo_evento=reasignacion_manual)` → SC13 → email | QA + MK + AT | idem | 20 min | Idem 7.2 con `tipo_evento=reasignacion_manual`. |
| 7.4 🟢 | Regresión ligera del pipeline PDF (E1→E2→E3) | QA + MK | `https://eu1.make.com/1594725/scenarios/5748459` → Run once | 15 min | Los 3 escenarios verdes; PDF de prueba en `/VProperty/Tasaciones/`. |

---

## Fase 8 · Publicación de documentación

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 8.1 🟠 | Anexar adenda al `CLAUDE.md` | Doc | Ver comando exacto al inicio de `CLAUDE_MD_ADENDA.md` | 2 min | `grep -n "CU-002 · IF-02" CLAUDE.md` encuentra el bloque. |
| 8.2 🟢 | Commit y push de los 4 MD v1.1 en `docs/if02/plan/` + snapshot MCP | Doc | `git add docs/if02/plan && git commit -m "docs(cu-002): plan v1.1, checklist, roadmap, adenda + snapshot MCP" && git push` | 5 min | PR abierta. |
| 8.3 🟢 | Guardar respuestas D-01..D-08 en `docs/if02/adr/ADR-cu-002.md` | Doc | edit + commit | 20 min | ADR firmada. |

---

## Ruta crítica (🔴) resumida — actualizada tras MCP

```
0.1 → 0.2 → 2.1 → 2.2 → 3A.0 (D-08) → { 3A.4 · 3A.5 · 3B.1 · 3B.2 · 3B.3 } → 7.1 · 7.2
```

**Cambios respecto a v1.0**:
- Se eliminaron 3A.1 (crear `M_Visadores`) y 3A.2 (crear tablas de auditoría) porque **quedaron cerradas por MCP**. Ahorro: ~2 h en AT.
- Se agregó 3A.0 (resolución D-08) por delante del bloque BQ-4.
- BQ-4 pasa de "implementar de cero" a "verificar y activar si es necesario"; el tiempo es el mismo en el peor caso.

Duración mínima estimada de la ruta crítica: **~14 h de trabajo enfocado** (antes 18 h) distribuidas entre AT (~6 h), MK (~5.5 h), QA (~1 h), Arq/PO (~1 h) y buffers de espera (~2 h). Reducción neta: 4 h.

**Sin cerrar la ruta crítica, la construcción NO arranca.** Las fases 4, 5 y 6 pueden avanzar en paralelo pero no reemplazan a la ruta crítica.
