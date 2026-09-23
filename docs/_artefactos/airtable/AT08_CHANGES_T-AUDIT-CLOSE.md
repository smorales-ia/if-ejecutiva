# AT08_Alertas_SLA — cambios T-AUDIT-CLOSE-20260923 (M3)

**Estado:** NO desplegado. En Airtable **no existe** ninguna automation AT08 (verificado por MCP
`list_automations` el 2026-09-23: sólo AT01, AT02, AT03, AT04, AT-RF09-Trigger, AT03-Ext,
AT-RF09-Trigger-Update). Este `.js` es el artefacto de repo listo para crear el draft.

Backup del script previo: `docs/_backups/AT08_Alertas_SLA_pre-T-AUDIT-CLOSE.js`.

## Divergencias del plan §8 vs. el script real (hallazgos)

El plan §8 listaba 4 puntos de divergencia asumiendo un AT08 sin idempotencia y con recálculo
del semáforo. Contra el script real:

1. **Idempotencia M-18 — YA EXISTÍA.** El script ya implementa la guarda una-alerta-por
   `(solicitud, etapa, día)` con `clave_natural = AT08:${solicitudId}:${etapaKey}:${hoyISO}`
   (`claveAlerta()` líneas ~450, `cargarClavesEmitidas()` ~455, y el write la persiste en
   `TX_Notificaciones.clave_natural` ~561). El campo es `clave_natural`, no `clave_notif` como
   lo nombraba el plan — pero cumple exactamente M-18. **No se renombra** (rompería el binding
   de schema). Divergencia plan-vs-realidad: la idempotencia no faltaba.

2. **RO-05 (fuente única del semáforo de etapa) — CORREGIDO.** El script recalculaba el estado
   del semáforo de etapa localmente en `semaforoEtapa()` (líneas ~338-373) usando
   `minutosHabilesEntre`. Ahora se lee la fórmula `sla_semaforo_etapa` (M-13) de `TX_Solicitudes`
   como **fuente autoritativa** del estado verde/ámbar/rojo; el cálculo local queda sólo para el
   detalle (etapaNombre/horas/responsable). Cambios: (a) `sla_semaforo_etapa` agregado a
   `CAMPOS_SOLICITUD`; (b) tras `const etapa = semaforoEtapa(...)`, override
   `etapa.estado = sla_semaforo_etapa` cuando la fórmula está presente.

3. **DRY-RUN primer disparo — AÑADIDO.** `const DRY_RUN = true;` (tras
   `MAX_NOTIFICACIONES_POR_CORRIDA`). Con `DRY_RUN=true` el barrido calcula todo y **loguea** qué
   notificaciones habría creado, pero **NO escribe** en `TX_Notificaciones` (por ende no dispara
   el envío patrón-SC13). Los eventos de auditoría en `A_Eventos` sí se escriben (no envían
   correo). Gate en la sección de escritura (~línea 605).

## Paso manual pendiente (Sergio, UI Airtable) — DEPLOY #2 de la tanda

AT08 no está desplegado y `update_automation`/`create_automation` por MCP sólo tocaría el DRAFT;
publicar es manual. Para dejarlo "en DRAFT dry-run" y luego activar:

1. En la base `app9G7lLkIV3CpeLa` → Automations → **crear** una automation nueva
   "AT08_Alertas_SLA", trigger **cron** (barrido diario, ventana hábil 09:00–18:00 America/Santiago).
2. Nodo **Run a script** → pegar el contenido de `docs/_artefactos/airtable/AT08_Alertas_SLA.js`
   (con `DRY_RUN = true`).
3. Ejecutar una corrida de prueba; revisar el log (`DRY-RUN would-send …`) — confirmar
   destinatarios, claves e idempotencia. **No** se envía nada.
4. Sólo tras validar: `DRY_RUN = false` → **Publish**.
5. Rollback (§9): apagar/borrar el draft. Si hubo envío erróneo, desactivar y documentar.
