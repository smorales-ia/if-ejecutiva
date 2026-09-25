# PREP T-AT08-CLOSE-20260923 — AT08 (alertas SLA) listo para prueba

> FASE 1+2 ejecutadas el 2026-09-23 vía MCP Airtable. Alcance autorizado: crear 3 filas en
> C_NotificacionesConfig + limpiar la cartera de prueba. **El cron NO se activa en esta tanda.**

## Resumen de lo hecho

1. **Snapshot de verdad** (detalle en `docs/_evidencia/T-AT08-CLOSE-20260923/snapshot.md`):
   los objetivos VP-2026-0066 (`recNiwM4s1ibr3sbO`, asignada) y VP-2026-0062
   (`recrx1YQYJuecthqd`, visitada) están en `sla_semaforo_etapa = rojo`. La tabla tenía 50
   registros, todos de la secuencia de prueba VP-2026-00XX; ninguno parece trabajo real.

2. **3 filas creadas en C_NotificacionesConfig** (`tbluB662ulWDaxqUY`), las que M-17 exigía
   (el ruteo del script AT08 busca el slug del área dentro de `nombre`):

   | nombre | record_id | evento | canal | to | activa |
   |---|---|---|---|---|---|
   | `sla_alerta_roja_control_seguimiento` | `recVXpCwrUj2dBXrl` | sla_alerta_roja | gmail | aviso@valueproperty.cl | ✓ |
   | `sla_alerta_roja_tasador` | `reck36ZjoRnKCmX6R` | sla_alerta_roja | gmail | aviso@valueproperty.cl | ✓ |
   | `sla_alerta_roja_visado` | `receWWOJU5Ku83qn9` | sla_alerta_roja | gmail | aviso@valueproperty.cl | ✓ |

   Canal `gmail` copiado de `Notif_PDF_Listo_METLIFE` (0.6). Plantillas asunto/cuerpo con las
   variables `{{...}}` del script y marca `[PRUEBA AT08 · T-AT08-CLOSE-20260923]` en el cuerpo.

3. **Cartera limpiada (reversible)**: 48 solicitudes pasaron a `estado = cancelada`
   (terminal, fuera de `ESTADOS_ACTIVOS` de AT08). El estado original de cada una quedó en
   `docs/_evidencia/T-AT08-CLOSE-20260923/rollback_estados.csv` **antes** de aplicar el cambio.
   Verificado post-cambio: el conjunto activo es **exactamente {VP-2026-0066, VP-2026-0062}**.

## Ruteo esperado en la prueba

| Solicitud | Etapa vigente | Responsable | Fila de destino |
|---|---|---|---|
| VP-2026-0066 | e4 · Aviso de coordinación al cliente | control_seguimiento | `sla_alerta_roja_control_seguimiento` |
| VP-2026-0062 | e5 · Visita y envío de informe | tasador | `sla_alerta_roja_tasador` |

Resultado esperado del Test: **exactamente 2 alertas**, `sin_destinatario` vacío,
`omitidas_por_guard = 0` en la primera corrida del día (y >0 en una segunda corrida, por el
guard de idempotencia por (solicitud, etapa, día)).

## ⚠ Dependencia abierta: SC13 (envío real)

El script AT08 escribe la fila en TX_Notificaciones y "Make la observa y envía (SC13)". En
`Z_EscenariosMake` la única fila SC13 es `SC13_EntregaCliente`, en estado **Pendiente**, sin
scenario ID — y su propósito es otro. **No hay evidencia de un escenario Make activo que
observe TX_Notificaciones.** El MCP no alcanza Make (RO-30), así que hay que verificarlo en la
UI de Make. Si no existe, el paso 3 de abajo deja las 2 filas en TX_Notificaciones con
`estado_envio = Pendiente` (lo cual ya valida AT08 de punta a punta dentro de Airtable), pero
**no llegarán correos** hasta provisionar ese escenario.

## Pasos para Sergio en la UI

1. Airtable → Automations → **AT08_Alertas_SLA** (`wfl15j5QyoL0ttnvw`) → botón **Test**
   (corre en dry-run, no envía). En el log confirmar las líneas `DRY-RUN would-send` para
   VP-2026-0066 y VP-2026-0062 con `to=aviso@valueproperty.cl`; y en LogEscenarios que el
   resumen trae `sin_destinatario: []`.
2. En el script de AT08 cambiar `const DRY_RUN = true;` por `const DRY_RUN = false;`. Guardar.
3. Volver a **Test**. Ahora escribe 2 filas en TX_Notificaciones y —si el escenario Make que
   observa TX_Notificaciones existe y está activo (ver dependencia SC13 arriba)— llegan 2
   correos a aviso@valueproperty.cl. Si no llegan, verificar primero ese escenario en Make
   antes de sospechar de AT08: las 2 filas `Pendiente` en TX_Notificaciones ya prueban el script.
4. Volver a poner `const DRY_RUN = true;` y guardar. Dejar AT08 **apagada** (sin publicar).
5. Avisar / pegar el PROMPT 2 para verificar y cerrar.

## Rollback

Para revertir la limpieza: leer `rollback_estados.csv` y devolver cada `record_id` a su
`estado_original` (update con typecast). Las 3 filas de C_NotificacionesConfig se pueden
desactivar (`activa = false`) o borrar por record_id si la prueba se descarta.
