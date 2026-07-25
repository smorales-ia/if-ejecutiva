# Ficha de brecha — `docs/diseno.md`

- **Familia** — H · Documentos operativos
- **Ruta** — `docs/diseno.md`
- **Última modificación** — 2026-07-22 · `c379b98` · 603 líneas
- **Versión declarada** — sin versión (diseño funcional · *fuente permanente* según `CLAUDE.md`)
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P1** · `CLAUDE.md` obliga a leerlo al inicio de cada sesión

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas | Clasificación |
|---|---|---|---|
| `SC05` | 6 | 28, 255, 264, 463, 520, 590 | ❌ renombrar a SC08 |
| `devuelta` | 1 | 57 (diagrama de estados) | ❌ a corregir |
| **`Enviar visita`** | 1 | 43 (diagrama de estados) | ❌ renombrar (hallazgo C-7) |
| `3 intentos` | 2 | 207, 227 | ✅ **falso positivo** — backoff de upload D-14.2 |
| `TX_CoordinacionVisita` | **0** | — | ❌ falta |

## Referencias al spec v1.9.3 § afectada

§2.3 · §2.11 · §2.12 · RF-TAS-05 · RN-59

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Diagrama de estados (40–60) · línea 43 | `[IF-03 Enviar visita]` → **`[IF-03 Calcular Tasación]`**. Es el único diagrama del repo que dibuja la transición `asignada → visitada` y la nombra con el botón obsoleto | §2 (1584) · §2.11 (1813) · regla de oro §1.5 | UX + EA |
| Diagrama de estados · línea 57 | `[IF-04 Devolver] → devuelta → asignada` → **`[IF-04 Devolver] → asignada`** (transición directa), con nota DEPRECATED sobre `devuelta` | §2.11 (1806) · RF-17 (1793) | EA |
| Diagrama de estados · verificación | El resto del diagrama ya es correcto: `visitada → [AT03 DAG fórmulas] → calculada → [SC09 generar PDF Carbone] → pdf_listo`. **SC09 ya figura con su trigger correcto** ✅ | §2.11 (1826, 1828) | — |
| Contrato operacional (28) | *"La transición la ejecuta AT02; **SC05** notifica al tasador"* → **SC08** *(ex-SC05)* | §2.11 (1837) | INT |
| Flujo de asignación (255) | *"**SC05** notifica al tasador por email en segundo plano"* → **SC08** | §2.11 (1837) | INT |
| Tabla de acciones (264) | Columna Automatización: `SC05 (AT02 no aplica a IF-02)` → **`SC08 (ex-SC05)`** | §2.11 (1837) | INT |
| Criterio de aceptación (463) | *"**SC05** envía email al tasador"* → **SC08** | §2.11 (1837) | INT |
| 520 | *"Registra `fecha_asignacion` y dispara **SC05** (email al tasador)"* → **SC08** | §2.11 (1837) | INT |
| Decisión D-03 (590) | *"Firma webhook Make · `X-VP-Signature` HMAC-SHA256 en SC01 y **SC05**"* → **SC01 y SC08**. Preservar el identificador **D-03 sin renumerar** | §2.11 (1837) · regla de oro §1.2 | INT |
| Sección nueva · Coordinación | Documentar la **visibilidad de coordinación en IF-02**: sub-bloque *Coordinación* en el Tab Datos y evento en el Tab Historial, ambos **sólo lectura** desde `TX_CoordinacionVisita` | §2.3 (1643) · RF-TAS-05 | FE + UX + PM |
| §5ter · REGLA C / RN-59 | Agregar la **excepción acotada**: `TX_ContactosVisita` editable en estado `asignada` cuando `coordinacion_vigente = rechazada`. Hoy el texto (línea 256) afirma que *"esa es la única vía de corrección"* mientras el estado sea `creada`, sin contemplar la excepción | §2.5 (1672) · RF-TAS-04 · §2.14 fila 10 | PM + EA + FE |

## Nota sobre los falsos positivos

Las líneas 207 y 227 describen el **retry de subida de adjuntos**:

> *"reintento manual si falla tras los **3 intentos** automáticos"* (207)
> *"Reintentos automáticos por archivo: **3 intentos**, backoff 0s → 2s → 5s"* (227)

Es la decisión **D-14.2**, sin relación con el ciclo de tres re-visitas tasador↔visador que
§2 retira. **No tocar.** Quedan excluidas de los greps de regresión de §6.1 por ruta+línea.
