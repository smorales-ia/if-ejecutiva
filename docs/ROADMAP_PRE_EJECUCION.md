# ROADMAP PRE-EJECUCIÓN · CU-002 · IF-02

> **Versión**: 1.2 (decisiones D-01…D-08 aprobadas · SC13 fuera de alcance · RF-09 agregado · campos disponible/casos_en_curso corregidos · H-04 añadido · 06-jul-2026).  
> Secuencia ordenada por dependencias para cerrar el `CHECKLIST_PRE_EJECUCION.md`.  
> **Ruta crítica** marcada con 🔴 — no arrancar construcción hasta cerrarla.  
> Tiempos estimados en horas de trabajo enfocado (no calendario).

Leyenda: 🔴 crítico · 🟠 alto · 🟢 estándar · 🔵 paralelizable con anteriores · ✅ ya cerrado · **Owner**: Arq (Arquitecto Enterprise) · AT (Ingeniero Airtable) · MK (Integrador Make) · UI (Ingeniero Next.js) · QA (QA Lead) · Doc (Redactor Técnico) · PO (Propietario del producto).

---

## Fase 0 · Aprobaciones y decisiones

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 0.1 ✅ | ~~Propietario responde D-01..D-07 del §1.9 del plan~~ | PO | — | 0 | ✅ **CERRADO** 06-jul-2026. Todas las decisiones D-01…D-07 aprobadas. |
| 0.2 ✅ | ~~D-08: reconciliación nomenclatura Airtable~~ | PO | — | 0 | ✅ **CERRADO** 06-jul-2026. Opción C híbrida aprobada. **Pendiente ejecución** por AT (ver Fase 3A). |
| 0.3 ✅ | ~~Plan v1.2 aprobado~~ | PO | — | 0 | ✅ **CERRADO** 06-jul-2026. Plan v1.2 firmado por el equipo. |

---

## Fase 1 · Snapshots y backup (evita pérdida de estado)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 1.1 🟢 | Backup del `CLAUDE.md` actual (si existe versión previa) | Doc | `cp CLAUDE.md CLAUDE.md.bak.$(date +%Y%m%d-%H%M)` | 2 min | Archivo bak existe. |
| 1.2 ✅ | Snapshot schema Airtable (ya capturado vía MCP 04-jul-2026) | AT | `docs/schema-2026-07-04.json` | Hecho | Archivo presente. Ver también `docs/schema-airtable.md` (versión legible). |
| 1.3 🟠 | Snapshot escenarios Make | MK | `curl -H "Authorization: Token $MAKE_TOKEN" "https://eu1.make.com/api/v2/scenarios?teamId=1594725" > docs/make-scenarios-$(date +%F).json` | 5 min | JSON válido guardado (MCP no puede hacerlo; requiere token Make). |

---

## Fase 2 · Verificación de tokens vigentes (habilita el resto)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 2.1 🔴 | Probar token Airtable `patxMFmnYmU30RLIl` fuera de MCP (para el runtime productivo) | AT | `curl -sfH "Authorization: Bearer patxMFmnYmU30RLIl.***" "https://api.airtable.com/v0/meta/bases/app9G7lLkIV3CpeLa/tables" -o /tmp/tables.json && jq '.tables|length' /tmp/tables.json` | 5 min | Devuelve entero > 0. |
| 2.2 🔴 | Probar token Make | MK | `curl -sfH "Authorization: Token 0f49f6e8-***" "https://eu1.make.com/api/v2/scenarios?teamId=1594725" -o /tmp/scenarios.json` | 5 min | `200 OK` + JSON con escenarios. |
| 2.3 🟠 | Reautorizar OAuth Airtable/Gmail/Dropbox en Make | MK | `https://eu1.make.com/1594725/connections` | 10 min | Tres conexiones en verde con "Verified now". |

---

## Fase 3 · Bloqueadores duros de infraestructura

### Fase 3A · Airtable (paralelo a 3B)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 3A.0 🔴 **D-08** | Aplicar resolución D-08 opción C: (a) corregir el espacio final en `TX_Solicitudes.sucursal_originadora `; (b) crear campos `notas_tasador`, `notas_visador`, `ejecutiva_asignada`; (c) verificar existencia de `M_Usuarios` y su TABLE_ID. | AT | UI Airtable · o `Airtable:update_field` / `Airtable:create_records_for_table` | 45 min | `Airtable:list_tables_for_base` refleja los cambios; snapshot post-cambio guardado como `docs/schema-post-d08-YYYY-MM-DD.json`. |
| 3A.1 🔴 **P0 · H-04** | Inspeccionar AT02 en Airtable Automations: confirmar nombre exacto del campo trigger (checkbox) que AT02 observa para disparar la transición `creada → asignada`. Si no existe, crearlo en `TX_Solicitudes`. Registrar el nombre en `docs/schema-airtable.md`. | AT | Airtable → Automations → AT02 | 20 min | Nombre del campo trigger documentado en `docs/schema-airtable.md`; campo visible en schema de `TX_Solicitudes`. |
| 3A.2 🟠 **H-05** | Crear campos `disponible` y `casos_en_curso` en `M_Tasadores` si no existen: `disponible` (Formula: `IF(casos_en_curso < capacidad_activa, TRUE, FALSE)`), `casos_en_curso` (Count link a TX_Solicitudes activas). | AT | UI Airtable · o `Airtable:create_field` | 30 min | `Airtable:get_table_schema(tblEi5jp18c1j00bQ)` muestra ambos campos. |
| 3A.3 ~~🔴 BQ-1~~ ✅ | ~~Crear tabla `M_Visadores`~~ | AT | — | 0 | ✅ **CERRADO** vía MCP el 04-jul-2026. Tabla `tbludtgDtHWvt0Q3D` presente. |
| 3A.4 ~~🔴 BQ-2~~ ✅ | ~~Crear tablas de auditoría~~ | AT | — | 0 | ✅ **CERRADO** vía MCP el 04-jul-2026. Las 5 tablas presentes. |
| 3A.5 🟠 | Verificar semillas mínimas de M_Visadores para IF-02 (al menos 1 activo por especialidad × comuna) | AT | UI Airtable | 15 min | 3+ visadores con `activo=true` cubriendo `residencial`, `comercial`, `agrícola`. |
| 3A.6 🔴 **BQ-4 residual** | Verificar en UI de Airtable Automations el estado activo de AT01 (script) con trigger `estado = creada`; si no existe, implementarlo. | AT | Airtable → Automations | 3 h (0 si ya activo) | En modo test: al insertar record con `estado=creada`, en < 5 s aparece `regla_aplicada` populada y fila en `A_DecisionesMotor`. |
| 3A.7 🔴 **BQ-4 residual** | Verificar / implementar AT02 con validación de precondiciones (tasador+visador+fecha_visita_programada). Trigger = campo confirmado en 3A.1. | AT | Airtable → Automations | 3 h (0 si ya activo) | En modo test: fila con las 3 precondiciones cambia a `asignada`; escribe `A_Eventos`. |
| 3A.8 🟠 **BQ-4 residual** | Verificar / implementar AT08 (Scheduled cron 08:00 diario). Escribe `TX_Notificaciones` — **no encadena SC13** (fuera de alcance CU-002). | AT | Airtable → Automations → Scheduled | 1.5 h (0 si ya activo) | Schedule visible; escribe `TX_Notificaciones` cuando hay SLA rojo/ámbar. |
| 3A.9 🟢 | Crear vistas filtradas en `TX_Solicitudes`: `Activas`, `SLA en riesgo (amb/rojo)`, `Por reasignar (>48h)`, `Bloqueadas por cliente`, `Aprobadas pend. entrega`, `Mi cartera` (filtra por `ejecutiva_asignada` = usuario Clerk). | AT | UI Airtable → `TX_Solicitudes` → Create view | 45 min | 6 vistas visibles; cada una con < 500 registros de referencia. |
| 3A.10 🟢 | Registrar / actualizar filas AT01/AT02/AT08 en `C_AutomationsAirtable` (`tblYYtKEaPgH7GfY0`) | AT | UI Airtable | 15 min | 3 filas identificables con `codigo` = AT01/AT02/AT08 y `estado=activo`. |

### Fase 3B · Make (paralelo a 3A · MCP no llega a Make)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 3B.1 🔴 **BQ-3** | Crear escenario SC01 (webhook → Airtable Create `TX_Solicitudes` con `estado=creada`, `origen_canal=ingreso_manual`, `ejecutiva_asignada`=Clerk user; firma HMAC-SHA256 · D-03; loguea en `LogEscenarios`). Usar nombres reales de campo tras cierre de D-08. | MK | `https://eu1.make.com/1594725/scenarios` → New scenario | 2 h | Escenario ACTIVO. Prueba: `POST <SC01_URL>` crea record en `TX_Solicitudes`. |
| 3B.2 🔴 **BQ-3** | Crear escenario SC05 (trigger desde Airtable Automation `estado=asignada` → Gmail al tasador con link a `IF-03/{codigo_ext}`; loguea en `TX_Notificaciones`). **Módulo Gmail aislado** para futuro swap al servidor VProperty. **⚠ Verificar código libre** (H-03): confirmar que "SC05" no está en uso en la org Make 1594725. | MK | idem | 1.5 h | Al setear `estado=asignada`, en < 30 s llega email al sandbox. `TX_Notificaciones` tiene la fila. |
| 3B.3 🟡 **BQ-3-c** | Crear escenario RF-09 (extracción Claude API). Recibe webhook desde `/api/extraccion/iniciar`; llama Claude API; escribe `TX_DatosTasacion` + `TX_DocumentosLegales` + actualiza `TX_Adjuntos.estado_extraccion`. **Usar código propio, no SC07** (SC07 queda para IF-03 post-visita · H-06). Puede quedar para el paso 6 del orden §1.7.3. | MK + Panel | idem | 2 h | `TX_Adjuntos.estado_extraccion = listo` tras upload. `ExtraccionStatusBadge` en IF-02 actualiza. |
| 3B.4 🟢 | Registrar webhooks en `Z_Webhooks` (`tblovY0Bt1Avhdgdx`) con URL, `escenario_destino` y `secret_header`. | MK | UI Airtable · o `Airtable:create_records_for_table` | 15 min | 3 filas: SC01, SC05, RF-09. |
| 3B.5 🟢 | Registrar escenarios en `Z_EscenariosMake` (`tblYfmDoaq7Z3Vh6P`, vacía al 04-jul-2026) | MK | idem | 15 min | 3 filas con `make_scenario_id`, `nombre`, `estado=activo`. |

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
| 5.1 🟢 | Crear servicio Railway `vproperty-ejecutiva` | Arq | `https://railway.app/new` | 20 min | Servicio existe; URL preview `vproperty-ejecutiva-*.up.railway.app` responde `200`. |
| 5.2 🟠 | Cargar variables de entorno (§6 del CHECKLIST) | Arq | `railway variables set ...` | 15 min | `railway variables` las lista todas. |
| 5.3 🟢 | Enlazar dominio productivo VProperty (si existe) | Arq | Railway → Settings → Domains | 15 min | DNS resuelve, TLS válido. |

---

## Fase 6 · Repositorio y CU-000

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 6.1 🟠 | Verificar repo en path correcto WSL2 | Arq | `ls /mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` | 1 min | Directorio existe con el repo. |
| 6.2 🟠 | Verificar CU-000.A disponible (paquete `@vp/ui` o carpeta compartida) | UI | `pnpm add @vp/ui@<version>` o `pnpm install` | 15 min | `import { SLABadge } from '@vp/ui'` compila. |
| 6.3 🟢 | Preparar `.env.local` completo desde `.env.example` (sin commit) | Arq | `cp .env.example .env.local && edit .env.local` | 10 min | `pnpm dev` arranca sin warnings de variable. |

---

## Fase 7 · Sanity checks end-to-end (última puerta antes de construir)

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 7.1 🔴 | E2E SC01: `POST` webhook → `TX_Solicitudes` con `estado=creada` → AT01 → `regla_aplicada` populada | QA + MK + AT | `curl -X POST <SC01_URL> -H 'Content-Type: application/json' -d @tests/e2e/sc01-payload.json` | 30 min | En < 15 s la fila tiene `regla_aplicada` y hay una fila en `A_DecisionesMotor`. |
| 7.2 🔴 | E2E "Pasar a asignada": setear tasador+visador+fecha_visita_programada → actualizar campo trigger AT02 → `estado=asignada` → SC05 → email | QA + MK + AT | UI Airtable + inbox sandbox | 20 min | Email recibido; `A_Eventos` con `tipo_evento=asignacion`; `TX_Notificaciones` con fila. |
| 7.3 🟡 | E2E RF-09: subir adjunto de prueba → `/api/extraccion/iniciar` → Make → Claude API → `TX_Adjuntos.estado_extraccion = listo` | QA + MK | upload desde IF-02 dev | 20 min | `ExtraccionStatusBadge` actualiza; `TX_DatosTasacion` tiene fila. |
| 7.4 🟢 | Regresión ligera del pipeline PDF (E1→E2→E3) | QA + MK | `https://eu1.make.com/1594725/scenarios/5748459` → Run once | 15 min | Los 3 escenarios verdes; PDF de prueba en `/VProperty/Tasaciones/`. |

---

## Fase 8 · Publicación de documentación

| # | Paso | Owner | Comando o URL | Tiempo | Criterio "hecho" |
|---|---|---|---|---|---|
| 8.1 🟠 | Crear/verificar `CLAUDE.md` en la raíz y anexar el bloque CU-002 de `docs/CLAUDE_MD_ADENDA.md` v1.2 | Doc | Ver comando al inicio de `docs/CLAUDE_MD_ADENDA.md` | 2 min | `grep -n "CU-002 · IF-02" CLAUDE.md` encuentra el bloque. |
| 8.2 🟢 | Commit y push de toda la documentación v1.2 en `docs/` + `CLAUDE.md` | Doc | `git add docs/ CLAUDE.md .env.example README.md package.json && git commit -m "docs(cu-002): documentación v1.2 alineada a plan y auditoría" && git push` | 5 min | PR abierta o merge en main. |

---

## Ruta crítica (🔴) resumida — actualizada tras plan v1.2

```
[✅ Fase 0] → 2.1 → 2.2 → 3A.0 (D-08) → 3A.1 (H-04 campo trigger) → 3A.2 (H-05 disponible/casos_en_curso)
                                         → { 3A.6 · 3A.7 · 3B.1 · 3B.2 } → 7.1 · 7.2
```

**Cambios respecto a v1.1**:
- Fase 0 completamente cerrada (D-01…D-08 aprobadas). Ahorro: 1 h.
- Se eliminaron 3A.1 (crear `M_Visadores`) y 3A.2 (crear tablas auditoría) porque quedaron cerradas por MCP. Ahorro: ~2 h en AT.
- Se agregó 3A.1 nuevo (H-04: confirmar campo trigger AT02) — P0 antes de RF-06.
- Se agregó 3A.2 nuevo (H-05: crear `disponible` y `casos_en_curso`) — necesario para selector inteligente.
- 3B.3 reemplaza SC13 por RF-09 (SC13 fuera de alcance).
- 3B.4/5 apuntan a SC01, SC05, RF-09 (no SC13).

Duración mínima estimada de la ruta crítica: **~12 h de trabajo enfocado** (reducción de 2 h vs v1.1) distribuidas entre AT (~7 h), MK (~5 h), QA (~1 h), buffers (~2 h).

**Sin cerrar la ruta crítica (H-04 + BQ-3 SC01/SC05), la construcción de RF-06 NO arranca.** Las RF 1–3 (Layout, Lista, Detalle) pueden avanzar sin esperar: sólo requieren token Airtable y Clerk.
