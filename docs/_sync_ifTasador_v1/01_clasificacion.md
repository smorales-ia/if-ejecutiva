# 01 · Clasificación por familia documental — Fase 0

**Fecha** — 25-jul-2026 · **Base** — `00_inventario.md` · **Total** — 40 archivos

Familias según §2.2 del prompt de sincronización. Se agrega la columna *Prioridad*
según superficie de cambio medida en los greps.

---

## Resumen por familia

| Familia | Archivos | Estado |
|---|---|---|
| **A · Especificación de proyecto** | 2 | 1 vigente + 1 borrado a restaurar |
| **B · ADR de IF-Tasador** | **0** | ⚠ familia vacía — el ADR no está en el repo |
| **C · Arquitectura Enterprise** | 1 | v2.8 |
| **D · Capa de Datos** | 1 | v2.6.4 |
| **E · Blueprint de Interfaces** | 1 | v2.9 |
| **F · Motor de Cálculo** | 1 | v2.6 |
| **G · Máquina de estados** | **0** | ⚠ familia vacía — el HTML no está en el repo |
| **H · Documentos operativos** | 6 | CLAUDE.md, README.md, diseno, construccion, schema-airtable, aprendizajes |
| **I · Derivados v0.dev / Claude Code** | 15 | `_notas/` (planes, snapshots, checklists) |
| **J · Otros** | 14 | `_archivo/` (13 aprendizajes históricos) + 1 instructivo Make |

---

## Familia A · Especificación de proyecto

| Ruta | Últ. mod. | Versión | Decisión preliminar | Prioridad |
|---|---|---|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | untracked (nuevo) | v1.9.3 | **ACTUALIZAR** — §2 ya correcta; faltan las 3 filas §2.14 que apuntan a §1/§4 del mismo archivo + `capturada` en línea 2974 | **P0** |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` | `03e8053` · borrado en WT | v1.9.2 | **RESTAURAR + MARCAR SUPERSEDED** — regla de oro §1.3 | **P0** |

Secciones del spec v1.9.3 a intervenir: §1.3.2, §1.3.3, §1.4, §1.9.1, §4.2.1,
tabla de automatizaciones (línea 2974), §13 índice RN (línea 4409 y 4511).

## Familia B · ADR de IF-Tasador — **VACÍA**

`VProperty_ADR_IF_Tasador_v3_v2.md` es citado por §2 como fuente de todas las decisiones
(C-1..C-3, S-1..S-8, especificaciones UX §8) y por las mitigaciones R-1/R-2/R-3.
**No está versionado en este repositorio.**

Consecuencia: los requisitos del prompt de "marcar ADRs previos como SUPERSEDED" y
"cada RF-TAS debe aparecer en el ADR" **no son ejecutables**. Se registra como
ambigüedad A-01 y se propone resolución en el Checkpoint #1.

## Familia C · Arquitectura Enterprise

| Ruta | Versión | Decisión preliminar | Prioridad |
|---|---|---|---|
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | v2.8 | **ACTUALIZAR** | **P1** |

Puntos de intervención detectados: línea 3122 (SC15 vivo), 3158 (SC04 asignar tasador),
3178 (SC05 ejecutar cadena → renombrar SC08), 3307 (SC15), 3749/3761/3764/3771
(máquina de estados con `devuelta` como estado vivo), 3807/3813 (narrativa con SC04/SC05),
4407 (métrica sobre `estado=devuelta`).
Falta además: IF-03 con las 7 pantallas y sus rutas, y `TX_CoordinacionVisita`.

## Familia D · Capa de Datos

| Ruta | Versión | Decisión preliminar | Prioridad |
|---|---|---|---|
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | v2.6.4 | **ACTUALIZAR** | **P0** |

Es el documento con más superficie (17 hits de escenarios retirados + 12 de vocabulario).
Trabajo requerido:
- Alta de `TX_CoordinacionVisita` con los **11 campos** de §2.12 + constraint blanda R-2.
- Alta de `coordinacion_vigente`, `observacion_rechazo_tasador`, `horas_restantes` en `TX_Solicitudes`.
- Alta de `tipo_propiedad` `{nuevo, usado, ambos}` en `D_TipoDocumento`.
- `devuelta` en el enum de estado (línea 2018) → marcar DEPRECATED sin borrar.
- Registro de `email_coordinacion_confirmada` / `email_coordinacion_rechazada` en `C_Plantillas`.
- SC02 (3619, 4820), SC04 (1998, 5707, 5944, 7006), SC05 (5043), SC15 (3490, 5982, 6022, 6048, 6235, 6964, 7240, 7340).

## Familia E · Blueprint de Interfaces

| Ruta | Versión | Decisión preliminar | Prioridad |
|---|---|---|---|
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | v2.9 | **ACTUALIZAR** | **P0** |

Trabajo requerido: IF-03 con 7 pantallas y rutas (incl. `app/tasaciones/[id]/coordinar/`),
patrón P3 acordeón, grilla de comparables densa, hook `use-estado-tasador` sin coletilla
de 3 intentos, IF-02 leyendo `TX_CoordinacionVisita` en Datos e Historial.
Puntos: 413/417/602/633 (`devuelta`), 925/936 (ciclo devolución IF-04), 948 (enum de estados),
2465/2576/2603/2660 (etapas del visador), 3585/3627 (SC05, SC15), 3717/3755 (diagrama DEVUELTA),
3874/3889 (matriz), 3943 (métrica).

## Familia F · Motor de Cálculo

| Ruta | Versión | Decisión preliminar | Prioridad |
|---|---|---|---|
| `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | v2.6 | **ACTUALIZAR** | **P2** |

Sólo 3 hits: línea 303 (`estado = devuelta`), 361 (`requiere_atencion revision devuelta`),
578 (`SC03 notifica al tasador (email/WhatsApp)`).
Verificar además que el trigger de AT03 sea `estado = visitada` y que no haya lenguaje LLM
(el grep de IA dio cero aquí — ✅).

## Familia G · Máquina de estados — **VACÍA**

`VProperty_Maquina_Estados.html` es declarado por §2.11 (línea 1800) como
**"fuente única de la máquina de estados"** y por la tabla de trazabilidad de §2 (línea 1949).
**No está en el repositorio.**

Consecuencia: el criterio §6.3 del prompt ("cualquier otro doc debe apuntar a ella, no
redefinir") no puede verificarse. Se registra como ambigüedad A-02.

## Familia H · Documentos operativos

| Ruta | Decisión preliminar | Prioridad | Notas |
|---|---|---|---|
| `CLAUDE.md` | **ACTUALIZAR** | **P1** | 7 hits SC05 (204, 214, 166, 172, 173, 141, 64). Es la instrucción de sesión — su desactualización se propaga a todo el trabajo futuro. |
| `README.md` | **ACTUALIZAR** | P2 | SC05 en líneas 22, 38. `WhatsApp` en 16 = falso positivo (canal de origen). |
| `docs/diseno.md` | **ACTUALIZAR** | **P1** | SC05 en 28, 255, 264, 463, 520, 590. `devuelta` en 57 (diagrama de estados). `3 intentos` en 207/227 = falso positivo (backoff D-14.2). |
| `docs/construccion.md` | **ACTUALIZAR** | P2 | SC05 en 73, 308, 335. |
| `docs/schema-airtable.md` | **ACTUALIZAR** | **P0** | Enum de estado con `devuelta` (153). SC05 en 37, 59, 119, 122. Debe recibir `TX_CoordinacionVisita` y los 3 campos nuevos de `TX_Solicitudes` + `tipo_propiedad`. |
| `docs/aprendizajes.md` | **SIN CAMBIO** | — | Bitácora histórica append-only. Los hits (155, 198) son registro de hechos pasados; reescribirlos violaría su naturaleza. Se agregará entrada nueva al cierre. |

## Familia I · Derivados v0.dev / Claude Code

| Ruta | Decisión preliminar | Notas |
|---|---|---|
| `docs/_notas/plan-ejecucion-if02-v1_9.md` | **REVISAR** | 1 hit vocabulario + 3 `TX_ContactosVisita`. Plan de ejecución IF-02, potencialmente ya consumido. |
| `docs/_notas/inventario-if02.md` | **REVISAR** | |
| `docs/_notas/checklist-P9-manual.md` | **REVISAR** | |
| `docs/_notas/snapshot-P1..P9.md` (9) | **SIN CAMBIO** | Snapshots de estado en momento dado — inmutables por definición. |
| `docs/_notas/snapshot_20260724_{1639,1649,1704,1710}.md` (4) | **SIN CAMBIO** | Ídem. Los hits de `TX_ContactosVisita` son descripción de estado histórico. |

## Familia J · Otros

| Ruta | Decisión preliminar | Notas |
|---|---|---|
| `docs/_archivo/aprendizajes-*.md` (13) | **SIN CAMBIO** | Archivo histórico explícito. |
| `docs/make/SC-RF09-ExtraccionClaude_import_instrucciones.md` | **REVISAR** | Instructivo de importación Make; verificar numeración de escenarios. |

---

## Distribución de la decisión preliminar

| Decisión | Archivos |
|---|---|
| ACTUALIZAR | 10 |
| RESTAURAR + SUPERSEDED | 1 |
| REVISAR | 4 |
| SIN CAMBIO | 25 |
| **Familias sin objeto (B, G)** | — |

---

## Top-10 archivos por ocurrencias de vocabulario obsoleto

Suma de los greps 1 (vocabulario) y 3 (escenarios retirados), sin descontar falsos positivos:

| # | Archivo | G1 | G3 | Total | Familia |
|---|---|---|---|---|---|
| 1 | `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | 12 | 17 | **29** | D |
| 2 | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | 26 | 7 | **33** | A |
| 3 | `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | 15 | 11 | **26** | E |
| 4 | `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | 10 | 7 | **17** | C |
| 5 | `docs/diseno.md` | 3 | 6 | **9** | H |
| 6 | `CLAUDE.md` | 1 | 7 | **8** | H |
| 7 | `docs/schema-airtable.md` | 2 | 4 | **6** | H |
| 8 | `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | 3 | 0 | **3** | F |
| 9 | `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` | 2 | 1 | **3** | — |
| 10 | `README.md` | 1 | 2 | **3** | H |

*(el spec v1.9.3 encabeza en hits crudos, pero la mayoría corresponde a §2 enunciando
correctamente lo que se retira — su trabajo real es acotado y está en §0.5 del inventario)*

---

# Enmienda posterior a Fase 1 — 25-jul-2026

Correcciones a esta clasificación derivadas del análisis de brecha. **Prevalecen sobre
las tablas de arriba.**

## E-1 · `VProperty_Origen_Datos_Informe_v1.1.md` quedó sin familia

Aparecía sólo en el top-10 con familia `—`. Se reclasifica como **fuente canónica**: §6.3
del prompt la lista entre los documentos hermanos a verificar (8 secciones canónicas del
informe · orden móvil §2.10). Tiene ficha propia y decisión **ACTUALIZAR**.

## E-2 · Los cuatro `REVISAR` se resuelven como `SIN CAMBIO`

Verificados con grep dirigido; ver `gap/_sin_cambio.md` §Grupo 1.

| Archivo | Decisión final |
|---|---|
| `docs/_notas/plan-ejecucion-if02-v1_9.md` | SIN CAMBIO |
| `docs/_notas/inventario-if02.md` | SIN CAMBIO |
| `docs/_notas/checklist-P9-manual.md` | SIN CAMBIO |
| `docs/make/SC-RF09-ExtraccionClaude_import_instrucciones.md` | SIN CAMBIO |

## E-3 · Familias B y G confirmadas vacías

Sin objeto sobre el que operar. `VProperty_Maquina_Estados.html` cerrado como A-03
(autoconsistente, sin acción); ADR y `.docx` registrados como A-01 y A-02.

## E-4 · Distribución final de decisiones

| Decisión | Archivos |
|---|---|
| ACTUALIZAR | 11 |
| PENDIENTE (A-04) | 1 |
| SIN CAMBIO | 24 |
| Fuera de familia documental | 4 |

Documentos con ficha individual: **12**. Colectiva: `gap/_sin_cambio.md`.

## E-5 · Término obsoleto adicional — "Enviar visita"

No estaba en los greps del prompt. 4 ocurrencias en Blueprint v2.9 + 1 en `diseno.md`.
Ver C-7 en `00b_correcciones_al_prompt.md`. Se agrega a la regresión §6.1.
