# CIERRE · TANDA T-MAKE-SLA-ENVIO-20260924

**Objetivo:** las 2 filas `sla_alerta_roja` de TX_Notificaciones (recfDyFSdMZ4aYGHx,
rectvXTTlf0577zAp) pasan a `estado_envio=Enviado` con correo real a aviso@valueproperty.cl.

**Resultado: CUMPLIDO.** Ambas filas en `Enviado` (`enviado_en` 2026-09-24T20:41Z,
`intentos=1`) y auditor ciego OK con evidencia literal (`_evidencia/T-MAKE-SLA-ENVIO-20260924/auditor.md`).

## 1. Desvío respecto del plan de la tanda

La premisa "existe UN escenario Make que despacha TX_Notificaciones; falta la rama
sla_alerta_roja" resultó **falsa**. Barrido exhaustivo (org 7487039, único team 1594725,
12 escenarios, blueprint por blueprint): **ningún escenario observa la tabla**. El único
que la toca es SC05 v1.0 (6780103), que es un webhook del flujo de asignación, está
inactivo (stop de Sergio 21-sep) y **nunca se ejecutó**; escribe las filas ya en `Enviado`
después de enviar (bitácora post-envío, no cola de despacho). Las 15 filas históricas
`Enviado` salieron de escenarios ya eliminados o de pruebas manuales. Detalle completo en
`_evidencia/T-MAKE-SLA-ENVIO-20260924/diagnostico.md`. Esto confirma lo que ya advertía
`_evidencia/T-AT08-CLOSE-20260923/snapshot.md` (SC13-watcher sin evidencia de existir).

Por eso el BLOQUE 3 no fue un PATCH: con **aprobación explícita de Sergio en sesión**
(opción "Crear despachador") se creó un escenario nuevo mínimo.

## 2. Lo creado

**SC-SLA-Envio v1.0 - Despacho sla_alerta_roja** · scenario id **7597712** · team 1594725.
3 módulos lineales (`sequential: true`, `maxErrors: 1`), reutiliza conexiones existentes:

1. `airtable:ActionSearchRecords` v3 (conn 8847431):
   `AND({estado_envio} = "Pendiente", {evento} = "sla_alerta_roja")` sobre `tbldgLQgjdgsOSZnt`, maxRecords 10.
2. `google-email:ActionSendEmail` v2 (cuenta Gmail 9514506, la misma de SC05):
   to=`destinatarios_to`, subject=`asunto`, html=`cuerpo_renderizado` (newline→`<br>`).
3. `airtable:ActionUpdateRecords` v3: record ID en clave **`id`** (contrato F-1),
   `estado_envio=Enviado` (fldRQRj4k0EZoOzwY), `enviado_en={{now}}` (fldcJzEwniY5Z7Dhd),
   `intentos=1` (fldpWFhGXn6Ox168T), typecast.

Blueprints en `_evidencia/T-MAKE-SLA-ENVIO-20260924/`: `blueprint_original.json` (SC05
pre-existente, sin modificar — snapshot de referencia) y `blueprint_final.json` (el
escenario nuevo tal como quedó en Make).

## 3. Ejecución y validación

- `POST /scenarios/7597712/run` con escenario inactivo → `422 IM325 "Scenario is not
  activated"`. Secuencia aplicada: `start` → `run` (responsive, executionId
  `2d9d15f5bf3f437c8c195a73b40f2b61`, status 1) → `stop`.
- **El escenario quedó DETENIDO (isActive=false)** por decisión de esta tanda: la
  activación programada (scheduling 900 s ya configurado) es decisión de Sergio.
- Verificación directa + auditor ciego independiente: ambos records `Enviado` con
  `enviado_en` de hoy. El campo legacy `fecha_envio` (date) no se pobla — mismo patrón
  del despacho histórico de agosto (que usa `enviado_en` + `intentos`).

## 4. Estado resultante y pendientes

- SC05 (6780103) y AT08: **sin tocar**. Ningún rollback aplicado.
- TX_Notificaciones: sin filas Pendiente al cierre.
- **Pendiente (decisión Sergio):** activar SC-SLA-Envio para despacho automático de
  futuros `sla_alerta_roja` (hoy solo corre on-demand); registrar el escenario en
  `Z_EscenariosMake`; decidir si el despachador debe cubrir también `sla_alerta_amarilla`
  u otros eventos que AT08 escriba como Pendiente (hoy la fórmula filtra solo
  `sla_alerta_roja`, deliberadamente conservador).
- Deuda documental: CLAUDE.md dice SC05 "por provisionar" y SC-Edicion v3.4; en Make
  existen SC05 v1.0 (inactivo) y SC-Edicion v3.5.
