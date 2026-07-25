# Ficha de brecha — `docs/schema-airtable.md`

- **Familia** — H · Documentos operativos
- **Ruta** — `docs/schema-airtable.md`
- **Última modificación** — 2026-07-24 · `59d86e0` · 867 líneas
- **Versión declarada** — sin versión (snapshot con fechas de verificación MCP)
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P0** · es el snapshot desde el que se derivan los tipos TS y los Route Handlers

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `devuelta` | 1 | 153 (enum `estado`) | ❌ a marcar DEPRECATED |
| `SC05` | 4 | 37, 59, 119, 122 | ❌ renombrar a SC08 |
| `whatsapp` / `WhatsApp` | 2 | 162, 190 | ✅ **falso positivo** — canal de origen |
| `TX_ContactosVisita` | 4 | — | ✅ vigente |
| `TX_CoordinacionVisita` | **0** | — | ❌ falta |
| `tipo_propiedad` en `D_TipoDocumento` | **0** | — | ❌ falta |

## Referencias al spec v1.9.3 § afectada

§2.12 (delta de schema completo) · §2.11 · RF-TAS-02/03/06/09

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Tabla de TABLE_IDs (30–125) | **Alta de `TX_CoordinacionVisita`** con su TABLE_ID. ⚠ La tabla **aún no existe en Airtable** — registrarla como *pendiente de creación*, igual que se hizo con `notas_tasador` / `ejecutiva_asignada` en `CLAUDE.md`. Verificar por MCP antes de asignar ID | §2.12 (1848) | DE |
| Campos de `TX_Solicitudes` (140–200) | **Alta de 3 campos**: `coordinacion_vigente` (formula), `observacion_rechazo_tasador` (long text), `horas_restantes` (formula). Los tres **pendientes de creación** | §2.12 (1866–1870) | DE |
| Enum `estado` (153) | Marcar `devuelta` **DEPRECATED** dentro del enum sin borrarla — el valor sigue vivo en Airtable para solicitudes históricas. Nota canónica con puntero a §2.11/§2.12 | §2.12 (1872) | DE + EA |
| Ficha de `D_TipoDocumento` | **Alta de `tipo_propiedad`** singleSelect `{nuevo, usado, ambos}` — pendiente de creación. Anotar la desambiguación de **A-05** (tres campos homónimos) | §2.12 (1874) · RF-TAS-06 | DE |
| Ficha de `C_Plantillas` | Registrar `email_coordinacion_confirmada` y `email_coordinacion_rechazada` | §2.12 (1876) | INT + DE |
| 37 · `C_NotificacionesConfig` | *"Read destinatarios SC05"* → **SC08** *(ex-SC05)* | §2.11 (1837) | INT |
| 59 · `TX_Notificaciones` | *"Write desde SC05"* → **SC08** *(ex-SC05)* | §2.11 (1837) | INT |
| 119 · `Z_EscenariosMake` | *"poblar al importar SC01/SC05"* → **SC01/SC08**. Además §2.11 (1842) pide *validar la numeración canónica contra `Z_EscenariosMake`* — anotarlo como acción DE pendiente | §2.11 (1837, 1842) | DE + INT |
| 122 · `Z_Webhooks` | *"Registro URLs webhook SC01 y SC05"* → **SC01 y SC08** | §2.11 (1837) | INT |

## Riesgo específico — snapshot vs. realidad

Este documento es un **snapshot verificado por MCP**, no una especificación. Sus fechas de
verificación (04-jul, 08-jul, 17-jul-2026) son parte del contrato de confianza.

**Regla para la Fase 3:** las altas de §2.12 se registran como **"pendiente de creación ·
declarado en spec v1.9.3 §2.12 · no verificado en Airtable al 25-jul-2026"**, nunca como
campos existentes. Inventar un TABLE_ID o un FIELD_ID sería una regresión grave: `CLAUDE.md`
instruye derivar tipos TS desde este archivo y preferir FIELD_ID sobre nombre.

La verificación por MCP y la creación efectiva en Airtable **quedan fuera del alcance de este
sync** (es tarea de documentación, §7 del prompt).
