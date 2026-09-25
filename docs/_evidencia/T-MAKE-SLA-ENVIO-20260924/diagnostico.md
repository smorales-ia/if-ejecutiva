# Diagnóstico · TANDA T-MAKE-SLA-ENVIO-20260924

**Fecha:** 2026-09-24 · **Objetivo:** llevar los 2 records `sla_alerta_roja` de TX_Notificaciones a `estado_envio=Enviado` con correo real a aviso@valueproperty.cl.

## Veredicto

**La premisa de la tanda es falsa: NO existe ningún escenario Make que despache TX_Notificaciones.**
Las 2 filas quedan `Pendiente` porque nadie observa la tabla. No hay rama faltante que agregar:
falta el despachador completo.

## Evidencia

### 1. Barrido exhaustivo de Make (org 7487039 · team 1594725 — único team de la org)

12 escenarios en total. Se bajó el blueprint de los 12 y se buscó `tbldgLQgjdgsOSZnt`
(TABLE_ID de TX_Notificaciones) y `TX_Notificaciones` por nombre:

| Escenario | id | Activo | Referencia a la tabla |
|---|---|---|---|
| SC01 v1.1 | 6483077 | sí | solo metadata de interfaz (specs de linked fields de TX_Solicitudes) |
| SC-Adjuntos-Upload v1.2 | 6839979 | sí | no |
| SC-Adjuntos-Upload v1.7 | 6527528 | sí | no |
| SC-Asignar v2.1 | 6681939 | sí | solo metadata de interfaz |
| SC-Edicion v3.5 | 6682031 | sí | solo metadata de interfaz |
| SC-IApro-LeadsScraper v1.11 | 7380314 | sí | no |
| SC-RF09-ExtraccionClaude v2.2 | 6554321 | sí | solo metadata de interfaz |
| E1 / E2 / E3 (pipeline PDF) | 5748459 / 5750023 / 5791413 | no | no |
| Integration Webhooks | 5522175 | no | no |
| **SC05 v1.0 - Email de asignacion al tasador** | **6780103** | **NO (stop 21-sep por Sergio)** | **SÍ — único con escrituras reales** |

Ningún blueprint contiene un módulo `watch` (TriggerWatchRecords o similar) sobre tabla alguna.

### 2. Por qué SC05 no es el despachador

- Trigger: `gateway:CustomWebHook` (hook 3480614, maxResults 1) — lo invoca el flujo de
  asignación, no un watch de la tabla.
- **Nunca se ejecutó**: `GET /scenarios/6780103/logs` devuelve solo 3 eventos de auditoría
  (stop 20-sep, start 21-sep 21:26, stop 21-sep 21:33 por sergio). Cero ejecuciones.
- Su lógica hardcodea `solicitud_asignada`: guard de idempotencia
  (`{clave_notif} = "{{3.codigo_ext}}::solicitud_asignada::…"`), búsqueda de plantilla
  (`{evento} = "solicitud_asignada"`), y el create de TX_Notificaciones (módulo 21,
  `fldBjsSHZCSWe6PSK: "solicitud_asignada"`).
- Escribe la fila **ya en Enviado, después** de mandar el correo (módulo 21
  `airtable:ActionCreateRecord`). No lee filas Pendiente: el patrón de la tabla es
  *bitácora post-envío*, no *cola de despacho*.

### 3. Historial de TX_Notificaciones

- Las 15 filas históricas `Enviado` (última 17-ago-2026) NO salieron de SC05 (nunca corrió;
  la retención de logs de Make cubre ese rango). Salieron de escenarios ya eliminados o de
  cargas manuales/pruebas. La fila `pdf_listo` (mayo-2026) usa el choice legacy `enviado`
  en minúscula.
- Esto ya estaba advertido en
  `docs/_evidencia/T-AT08-CLOSE-20260923/snapshot.md`: "SC13 (watcher de TX_Notificaciones
  que envía el correo): SIN EVIDENCIA de existir/estar activo… las filas en TX_Notificaciones
  quedarán estado_envio=Pendiente de todos modos".

### 4. Estado de las 2 filas objetivo (verificado 2026-09-24)

| record | clave_natural | evento | estado_envio |
|---|---|---|---|
| recfDyFSdMZ4aYGHx | AT08:recrx1YQYJuecthqd:e5:2026-09-24 | sla_alerta_roja | Pendiente |
| rectvXTTlf0577zAp | AT08:recNiwM4s1ibr3sbO:e4:2026-09-24 | sla_alerta_roja | Pendiente |

Ambas tienen `asunto`, `cuerpo_renderizado`, `destinatarios_to` y `canal=gmail` ya poblados
por AT08 — el despachador solo necesita enviar y marcar.

## Fix requerido (fuera de la autorización de esta tanda)

Un escenario nuevo mínimo (4 módulos) que actúe como despachador:

1. `airtable:ActionSearchRecords` (conexión 8847431):
   `AND({estado_envio} = "Pendiente", {evento} = "sla_alerta_roja")` sobre `tbldgLQgjdgsOSZnt`.
2. `google-email:ActionSendEmail` (conexión Gmail 9514506, la misma de SC05):
   to = `destinatarios_to`, subject = `asunto`, html = `cuerpo_renderizado`.
3. `airtable:ActionUpdateRecords` (clave `id` = record id — contrato F-1):
   `estado_envio=Enviado`, `enviado_en=now`, `intentos=1`.
4. (Opcional) rama de error → `estado_envio=Error` + `mensaje_error`.

Crear escenarios nuevos en Make exige aprobación explícita (CLAUDE.md) y la autorización de
la tanda solo cubría PATCH del despachador existente — que resultó no existir. **Tanda
detenida en BLOQUE 3 a la espera de decisión.**
