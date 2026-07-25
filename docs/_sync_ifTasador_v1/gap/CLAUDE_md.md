# Ficha de brecha — `CLAUDE.md`

- **Familia** — H · Documentos operativos
- **Ruta** — `CLAUDE.md` (raíz del repo)
- **Última modificación** — 2026-07-18 · `ad90d42` · 422 líneas
- **Versión declarada** — sin versión
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P1** · es la instrucción de sesión: su desactualización se propaga a todo el trabajo futuro de Claude Code

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `SC05` | 7 | 64, 141, 166, 172, 173, 204, 214 | ❌ renombrar a SC08 |
| `WhatsApp` | 1 | 56 | ✅ **falso positivo** — canal de origen de solicitud |
| `SC13` | varios | — | ⚠ ver nota crítica abajo |
| `capturada` / `devuelta` | 0 | — | ✅ |

## Nota crítica — contradicción SC13 entre `CLAUDE.md` y el spec v1.9.3

`CLAUDE.md` declara en tres lugares que **SC13 está fuera de alcance de CU-002** y prohíbe
invocarlo desde cualquier Route Handler:

> *"**SC13 fuera de alcance CU-002**: las acciones de reasignación, cambio de prioridad y pausa
> actualizan Airtable + `A_Eventos` pero **no envían email** en este CU."*
> *"Invocar SC13 desde ningún Route Handler de IF-02 (SC13 fuera de alcance CU-002)."*

El spec v1.9.3 §2.3 y §2.11 asignan a **SC13** el envío de los correos de coordinación con las
plantillas `email_coordinacion_confirmada` y `email_coordinacion_rechazada`, y §2.11 es
explícito: *"NO se crea escenario nuevo; SC13 dispara los correos"*.

**No es contradicción real, pero sí ambigüedad de lectura:** SC13 en IF-03 (coordinación) es
un uso distinto del SC13 prohibido en IF-02 (reasignación/prioridad/pausa). La prohibición
sigue siendo válida **para CU-002/IF-02**. Debe explicitarse para que nadie lea la regla como
un veto global a SC13.

Registrada como observación de la ficha; **no** se agrega a `_ambiguedades.md` porque tiene
resolución clara: acotar la prohibición a IF-02.

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Contrato operacional (64) | *"Transición ejecutada por AT02; **SC05** notifica al tasador"* → **SC08** *(ex-SC05)* | §2.11 (1837) | INT |
| Alcance del MCP (141) | *"alcanzar Make (SC01/**SC05**/RF-09)"* → **SC01/SC08/RF-09** | §2.11 (1837) | INT |
| Tabla TABLE_IDs · `TX_Notificaciones` (166) | *"Write notificaciones (**SC05**)"* → **SC08** | §2.11 (1837) | INT |
| Tabla TABLE_IDs · `Z_EscenariosMake` (172) | *"Registro SC01/**SC05**/RF-09"* → **SC01/SC08/RF-09** | §2.11 (1837) | INT |
| Tabla TABLE_IDs · `Z_Webhooks` (173) | *"Registro URLs webhook SC01 y **SC05** y RF-09"* → **SC01 y SC08 y RF-09** | §2.11 (1837) | INT |
| Tabla de escenarios Make (204) | Fila `SC05 · Notifica tasador al pasar a asignada` → **SC08** *(ex-SC05 · renombrado en §2.11 del spec v1.9.3)*. Preservar el estado `❌ por provisionar (BQ-3)` | §2.11 (1837) | INT |
| Variables de entorno (214) | `MAKE_WEBHOOK_URL_SC05` → **`MAKE_WEBHOOK_URL_SC08`**. ⚠ **Cambio con impacto en runtime**: la variable existe en `.env` y en Railway. Renombrarla en la doc sin renombrarla en el entorno rompe el deploy → ver `CODE_INCONSISTENCIES.md` | §2.11 (1837) | INT + FE |
| Tabla de escenarios Make | Agregar **SC09** (PDF Carbone) si corresponde al alcance del repo, y anotar que **SC06** es el escenario de transición a `visitada` disparado desde IF-03 | §2.11 (1823, 1828) | INT |
| Bloque "SC13 fuera de alcance" | **Acotar la prohibición a IF-02/CU-002.** Agregar: *"SC13 sí es el transporte de los correos de coordinación de IF-03 (§2.3 y §2.11 del spec v1.9.3), con las plantillas `email_coordinacion_confirmada` y `email_coordinacion_rechazada`. La prohibición de este CU cubre exclusivamente reasignación, prioridad y pausa desde IF-02."* | §2.3 (1639) · §2.11 (1830–1831, 1840) | PM + INT |
| Nomenclatura de campos `TX_Solicitudes` | Agregar `coordinacion_vigente`, `observacion_rechazo_tasador` y `horas_restantes` a la tabla de campos, marcados **pendientes de creación** (igual que `notas_tasador` / `ejecutiva_asignada`) | §2.12 (1866–1870) | DE |
| Bloque de estado destino (64) | Si se documenta la máquina de estados, alinearla con la oficial y marcar `devuelta` DEPRECATED | §2.11 (1800–1806) | EA |

## Riesgo específico — `MAKE_WEBHOOK_URL_SC05`

Es el único cambio de esta ficha con efecto fuera de la documentación. La variable está
declarada en `CLAUDE.md:214` y presumiblemente en `.env` local y en Railway.

**Regla para la Fase 3:** documentar el renombre **con nota de transición explícita**
(*"`MAKE_WEBHOOK_URL_SC08` — anteriormente `MAKE_WEBHOOK_URL_SC05`; renombrar también en
`.env` y en Railway antes de desplegar"*) y registrar la inconsistencia en
`CODE_INCONSISTENCIES.md`. **No** se toca ningún archivo de entorno ni de código (§7 del prompt).
