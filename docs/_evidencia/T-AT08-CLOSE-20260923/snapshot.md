# Snapshot de verdad — T-AT08-CLOSE-20260923 · BLOQUE 0

> Tomado vía MCP Airtable (base `app9G7lLkIV3CpeLa`) el 2026-09-23, antes de cualquier escritura.

## 0.1 — Objetivos confirmados

| Solicitud | record_id | estado | sla_semaforo_etapa |
|---|---|---|---|
| VP-2026-0066 | `recNiwM4s1ibr3sbO` | asignada | **rojo** ✓ |
| VP-2026-0062 | `recrx1YQYJuecthqd` | visitada | **rojo** ✓ |

## 0.2 — Cartera TX_Solicitudes (pre-limpieza)

- Total de registros en la tabla: **50** (sin paginación pendiente; `totalRecordCount=50`).
- Conjunto ACTIVO (estado ∈ {creada, asignada, visitada, calculada, pdf_listo, devuelta, aprobada, pendiente_final, requiere_atencion}): **los 50**. Distribución: 33 creada · 14 asignada · 1 visitada (0062) · 1 calculada (0063) · 1 asignada (0066 incluido en las 14).
- Semáforos: 46 en `rojo`, 4 en `sin_dato` (0063, 0064, 0065, 0067). Ninguno terminal antes de la limpieza.

## 0.3 — Lista a limpiar

- LISTA A LIMPIAR = 50 − {0066, 0062} = **48 solicitudes** (detalle completo con estado original en `rollback_estados.csv`).
- Verificación anti-"trabajo real": todas pertenecen a la secuencia de prueba VP-2026-00XX (0003–0008, 0024–0065, 0067), con direcciones de prueba repetidas ("julio prado 2075", "Av. Apoquindo 5230", "sdfsdf 123") y clientes del set de prueba (BANCO DE CHILE, 4 LIFE, MetLife, EVOLUCIONA, Banco Estado, AFIANZA, BCI Mutuos, etc.). **Ninguna parece trabajo real con entrega pendiente.**
- Nota: VP-2026-0067 (`recmMzeu3eWGxyXsf`, creada 2026-09-22, MetLife, misma dirección que 0066) es residuo de la tanda T-AUDIT-CLOSE — se limpia con el resto.

## 0.4 — Estado terminal elegido

- Schema real del select `estado` (`fld2H2r0GMeVfNO26`): creada · asignada · visitada · calculada · pdf_listo · devuelta · aprobada · pendiente_final · entregada · cerrada · **cancelada** · requiere_atencion.
- Elegido: **`cancelada`** (existe, es terminal, no consume SLA según `ESTADOS_ACTIVOS` del script AT08, y es reversible con el CSV de rollback).

## 0.5 — Ruteo de los objetivos (C_SLA_Etapas `tbl05zu5RLhH3u6pl` + campos sla_eN en cada solicitud)

Matriz responsables: e1 control_seguimiento · e2 tasador · e3 tasador · e4 control_seguimiento · e5 tasador · e6 control_seguimiento · e7 visado.

El script AT08 determina la etapa vigente como "mayor orden con `sla_eN_inicio_ts` poblado y `sla_eN_fin_ts` vacío":

| Solicitud | Campos etapa poblados | Etapa vigente | Responsable | Fila que rutea |
|---|---|---|---|---|
| VP-2026-0066 | e3 ini+fin, e2 fin, **e4 ini (sin fin)** · `sla_etapa_actual=4` | **e4** — Aviso de coordinación al cliente | **control_seguimiento** | `sla_alerta_roja_control_seguimiento` |
| VP-2026-0062 | e1 ini+fin, e2 ini+fin, **e5 ini (sin fin)** · `sla_etapa_actual=5` | **e5** — Visita y envío de informe | **tasador** | `sla_alerta_roja_tasador` |

Ningún objetivo rutea a `visado` (e7); la fila `sla_alerta_roja_visado` se crea igual para cobertura completa (M-17 exige las 3).

`sin_destinatario` esperado: **vacío** — ambas áreas quedan cubiertas.

## 0.6 — Canal y SC13

- `Notif_PDF_Listo_METLIFE` (`recRKsr8K9ePTeaB6`) tiene `canal = gmail` → las 3 filas nuevas usan **gmail**.
- La opción `sla_alerta_roja` ya existía en el select `evento` (`selXeprnm2w8mFyXU`) — typecast no creó opciones nuevas.
- **SC13 (watcher de TX_Notificaciones que envía el correo): SIN EVIDENCIA de existir/estar activo.** En `Z_EscenariosMake` la única fila SC13 es `SC13_EntregaCliente` con estado **Pendiente**, sin scenario ID ni webhook, y su propósito es otro (entrega final al cliente). No hay ningún escenario registrado que observe TX_Notificaciones para el evento `sla_alerta_roja`. El MCP no alcanza Make (RO-30), así que la verificación final es de Sergio en la UI de Make. **Consecuencia: el paso 3 de la prueba (correos reales) depende de provisionar/activar ese escenario; las filas en TX_Notificaciones quedarán `estado_envio=Pendiente` de todos modos, lo que ya valida AT08.**

## Escrituras realizadas después de este snapshot (autorizadas)

1. 3 filas creadas en C_NotificacionesConfig: `recVXpCwrUj2dBXrl` (control_seguimiento) · `reck36ZjoRnKCmX6R` (tasador) · `receWWOJU5Ku83qn9` (visado).
2. 48 solicitudes → `estado = cancelada` (rollback en `rollback_estados.csv`).
3. Verificación post-limpieza: conjunto activo = exactamente {VP-2026-0066, VP-2026-0062}, ambos en rojo, sin tocar.
