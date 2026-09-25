# Auditor ciego · T-MAKE-SLA-ENVIO-20260924

Agente independiente, sin acceso al contexto de la tanda. Verificación directa contra
Airtable (base `app9G7lLkIV3CpeLa`, tabla `tbldgLQgjdgsOSZnt`, REST API server-side).

## Veredicto

| Record | Veredicto |
|---|---|
| `recfDyFSdMZ4aYGHx` | **OK** — `estado_envio = "Enviado"` y `enviado_en` = 2026-09-24 |
| `rectvXTTlf0577zAp` | **OK** — `estado_envio = "Enviado"` y `enviado_en` = 2026-09-24 |

## Valores literales leídos

| Campo | recfDyFSdMZ4aYGHx | rectvXTTlf0577zAp |
|---|---|---|
| `estado_envio` | `Enviado` | `Enviado` |
| `enviado_en` | `2026-09-24T20:41:55.092Z` | `2026-09-24T20:41:56.640Z` |
| `fecha_envio` | ausente (no poblado) | ausente (no poblado) |
| `evento` | `sla_alerta_roja` | `sla_alerta_roja` |
| `asunto` | `🔴 SLA en rojo · VP-2026-0062 · tasador` | `🔴 SLA en rojo · VP-2026-0066 · control_seguimiento` |
| `destinatarios_to` | `aviso@valueproperty.cl` | `aviso@valueproperty.cl` |
| `intentos` | `1` | `1` |

Nota: el timestamp de envío vive en `enviado_en` (dateTime, UTC) y no en el campo legacy
`fecha_envio` (date) — mismo patrón que el despacho histórico de agosto-2026. Ambos
`enviado_en` corresponden a hoy 2026-09-24 en UTC (20:41Z) y en hora de Chile (17:41 CLST).
