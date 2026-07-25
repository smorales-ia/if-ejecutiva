# Ficha de brecha — `VProperty_Blueprint_Interfaces_v2_9.md`

- **Familia** — E · Blueprint de Interfaces
- **Ruta** — `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md`
- **Última modificación** — 2026-07-23 · `a0dd566` · 4292 líneas
- **Versión declarada** — v2.9 *(el prompt pedía actualizar "v2.8", versión anterior a la del repo — ver C-2)*
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P0** · es el destino obligado de las 7 pantallas de IF-03 y sus rutas

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas |
|---|---|---|
| `devuelta` / `Devuelta` | 12 | 413, 417, 602, 633, 925, 936, 948, 1840, 2465, 2576, 2603, 2660 |
| `DEVUELTA` (diagramas) | 2 | 3717, 3755 |
| `SC05` | 8 | 525, 899, 986, 1829, 2229, 2258, 2577, 2660, 3585, 3627 |
| `SC15` | 1 | 3585 |
| **`Enviar visita`** | **4** | **554, 906, 1130, 2425** |
| `visita_completada` | 1 | 560 |
| `capturada` | 0 | ✅ ya usa `visitada` (906, 2425) |
| `app/tasaciones` | **0** | ❌ ninguna ruta de IF-03 documentada |
| `TX_CoordinacionVisita` | **0** | — |
| `use-estado-tasador` | **0** | — |

## Referencias al spec v1.9.3 § afectada

§2.1 · §2.3 · §2.6 · §2.8 · §2.10 · §2.11 · §2.13 · §1.3.2 · §1.3.3 · RF-TAS-01 a RF-TAS-10

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| **IF-03 · ficha de interfaz (529–565)** | Reescribir el bloque: **acción primaria `"Enviar visita"` → `"Calcular Tasación"`** (554). Es la violación más visible de la regla de oro §1.5 en todo el repo | §2 (1584) · §2.8 (1715) | UX + FE + PM |
| IF-03 · idem | Documentar las **7 pantallas con sus rutas**: `app/tasaciones/` (P1 cola) · `app/tasaciones/[id]/coordinar/` (**P2 nueva**) · `app/tasaciones/[id]/` (P2 detalle) · `.../fotos/` (P3) · `.../lectura/` (P4) · `.../captura/` (P5) · `.../calculo/` (P6) · `.../informe/` (P7). Hoy el Blueprint **no documenta ninguna ruta de IF-03** | §2.13 (1882–1891) · §2.14 fila 8 | FE + EA |
| IF-03 · Entradas | Agregar `TX_CoordinacionVisita` a las entradas de IF-03 | §2.3 · §2.12 | DE + EA |
| IF-03 · Salidas (556–560) | Agregar `TX_CoordinacionVisita` (insert por intento). Revisar el literal `A_Eventos (visita_completada)` — ver **A-06** | §2.3 (1639) · §2.11 (1823) | DE + INT |
| IF-03 · Componentes | Declarar reutilización **sin regeneración**: TasacionCard, EstadoBadge, SLABadge, FileUploadZone (sheet documental), visor de adjuntos de IF-02/IF-04 para "Ver expediente". Sin librerías nuevas | §2.13 (1893) · RF-TAS-10 | FE |
| IF-03 · Hook | Documentar `use-estado-tasador` **sin** la coletilla "y el control de 3 intentos"; el polling sobre estado backend gobierna el bloqueo de "Calcular Tasación" | §2.13 (1895) · RF-TAS-07 | FE |
| Tabla de transiciones (906) | `IF-03 · Enviar visita · asignada → visitada` → renombrar la acción a **"Calcular Tasación"**. La transición y el escenario (SC06) ya están correctos | §2.11 (1813, 1823) | INT + UX |
| Tabla de validaciones (1130) | `Enviar visita · IF-03 · ≥8 fotos · superficies > 0` → renombrar a **"Calcular Tasación"**. Contrastar el gate con §2.8: campos obligatorios + **mínimo 3 comparables (RF-12)** | §2.8 (1712–1724) · RF-12 | UX + FE |
| Tabla de etapas (2425) | `Enviar visita · asignada → visitada` → renombrar | §2.11 | UX |
| **IF-01/IF-02 · ficha de IF-02** | Agregar la **lectura de `TX_CoordinacionVisita`** en las pestañas Datos e Historial de IF-02. Sin UI de escritura | §2.3 (1643) · RF-TAS-05 · §2.14 fila 9 | FE + UX + PM |
| Ciclo de devolución IF-04 (925, 936, 2576, 2660) | El flujo documentado es `pdf_listo → devuelta → asignada`. Actualizar a la transición directa **`pdf_listo → asignada`**, marcando `devuelta` DEPRECATED con puntero a §2.11 | §2.11 (1806) · RF-17 (1791–1794) | EA + PM |
| Enum de estados (948) | Marcar `devuelta` DEPRECATED en la lista, sin borrarla | §2.12 (1872) | DE |
| Diagramas ASCII (3717, 3755) | `estado=DEVUELTA` → rama histórica marcada; `DEVOLVER → estado=DEVUELTA (vuelve a asignada)` → `DEVOLVER → estado=asignada` | §2.11 (1806) | EA |
| Notificaciones (1840) | `IF-04 · Devuelta · Toast ámbar "Devuelta al..."` → revisar el texto de UI contra el vocabulario oficial | §2.11 · regla de oro §1.4 | UX |
| SC05 (525, 899, 986, 1829, 2229, 2258, 2577, 2660, 3627) | **Renombrar a SC08** con nota histórica *(ex-SC05)*. Lote C-5 | §2.11 (1837) | INT |
| SC15 (3585) | Marcar **retirado** — pasa a AT08 | §2.11 (1838) | INT |
| Tabla de automatizaciones | Agregar **SC08** y **SC09** con sus triggers (`estado = visitada` y `estado = calculada`) | §2.11 (1825, 1828) | INT |
| Patrones de UI (§ P3, 1391) | Confirmar **P3 · Formulario en acordeón** para la Pantalla 5 de IF-03 con autosave 30 s (1548 ya lo declara ✅). Agregar el patrón de **grilla tabular densa** para D.Comparables: header fijo, scroll horizontal en móvil, primera columna sticky, fila resumen | §2.8 (1707, 1717–1724) | UX + FE |
| Métricas (3943) | `Tasa de devolución · COUNT(devuelta) / …` → recalcular sobre el nuevo flujo, ya que `devuelta` deja de poblarse | §2.11 (1806) | PM + DE |

## Riesgos de esta intervención

1. **"Enviar visita" es el hallazgo tardío.** No estaba en los greps del prompt; se agrega a la regresión §6.1 (ver C-7). Cuatro ocurrencias en este archivo + 1 en `diseno.md`.
2. **Sin headings markdown.** El archivo es pandoc puro: 0 líneas `^#+ `. Los bloques se localizan por texto en negrita (`**IF-03 · App de visita…**`). Las ediciones deben anclarse por contenido, no por heading.
3. **Métrica de devolución.** Cambiar la definición de una métrica de negocio excede el sync documental; se marca la inconsistencia y se pide firma PM antes de tocarla.
