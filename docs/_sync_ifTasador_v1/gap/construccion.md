# Ficha de brecha — `docs/construccion.md`

- **Familia** — H · Documentos operativos
- **Ruta** — `docs/construccion.md`
- **Última modificación** — 2026-07-24 · `d4180c0` · 758 líneas
- **Versión declarada** — sin versión (guía de construcción por RF)
- **Decisión** — **ACTUALIZAR** (alcance acotado)
- **Prioridad** — **P2**

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `SC05` | 3 | 73, 308, 335 | ❌ renombrar a SC08 |
| `TX_ContactosVisita` | 3 | — | ✅ vigente |
| `capturada` / `devuelta` / `Enviar visita` | 0 | — | ✅ |
| `TX_CoordinacionVisita` | **0** | — | ❌ falta |

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Tabla de RFs (73) | `RF-06 · Acciones sobre solicitud · Paso 4 · AT02 trigger (H-04) · **SC05** activo` → **SC08** *(ex-SC05)*. Preservar **RF-06** y **H-04** sin renumerar | §2.11 (1837) · regla de oro §1.2 | INT |
| Bloqueante BQ-3-b (308) | *"**SC05** activo en Make (BQ-3-b) — SC05 se dispara desde AT02 al pasar a `asignada`, no desde la UI directamente"* → **SC08** en ambas menciones. Preservar el identificador **BQ-3-b** | §2.11 (1837) | INT |
| Secuencia de asignación (335) | *"→ **SC05** notifica al tasador por email (async, no bloqueante)"* → **SC08** | §2.11 (1837) | INT |
| Sección de lectura IF-02 | Agregar la lectura de `TX_CoordinacionVisita` para las pestañas Datos e Historial, si el documento describe los Route Handlers de lectura | §2.3 (1643) · RF-TAS-05 | FE + DE |
| Sección RN-59 / edición | Si el documento describe el gating de edición, agregar la **excepción acotada** de `TX_ContactosVisita` | §2.5 (1672) | PM + FE |

## Nota de alcance

Documento de baja brecha: 3 hits, todos del mismo tipo (renombre SC05→SC08). Entra
naturalmente en el **primer lote de Fase 3** (C-5) junto con el resto de las ocurrencias
de SC05. No requiere versión nueva; se edita en sitio con changelog al pie.

Las tres menciones de `TX_ContactosVisita` son vigentes y correctas — pertenecen al modelo
de IF-02 y no se ven afectadas salvo por la excepción de RN-59.
