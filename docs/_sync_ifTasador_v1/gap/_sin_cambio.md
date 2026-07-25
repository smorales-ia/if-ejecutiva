# Ficha colectiva — documentos con decisión SIN CAMBIO

Cubre los 24 archivos del inventario que no requieren edición, con la justificación
verificada de cada grupo. Sustituye a las fichas individuales por acuerdo de alcance
del Checkpoint #1 (evita ~24 fichas de contenido nulo).

**Total inventariado** — 40 archivos · **con ficha individual** — 12 · **SIN CAMBIO** — 24
· **fuera de familia documental** — 4 (`docs/make/*.json`, `*.js`, y los dos `_sync_ifTasador_v1/*.md`
generados por este proceso)

---

## Grupo 1 · Los cuatro REVISAR resueltos como SIN CAMBIO

Los cuatro archivos marcados `REVISAR` en `01_clasificacion.md` fueron verificados con
grep dirigido (`capturada|devuelta|Enviar visita|SC02|SC04|SC05|SC15|3 intentos|TX_ContactosVisita`).
Resultado:

| Archivo | Familia | Hits relevantes | Decisión final |
|---|---|---|---|
| `docs/_notas/plan-ejecucion-if02-v1_9.md` | I | Sólo `TX_ContactosVisita` (254, 349, 366) — tabla vigente de IF-02, correcta | **SIN CAMBIO** |
| `docs/_notas/inventario-if02.md` | I | **cero** | **SIN CAMBIO** |
| `docs/_notas/checklist-P9-manual.md` | I | **cero** | **SIN CAMBIO** |
| `docs/make/SC-RF09-ExtraccionClaude_import_instrucciones.md` | J | **cero** | **SIN CAMBIO** |

**Nota sobre `plan-ejecucion-if02-v1_9.md`.** Es el plan maestro P0–P9 de IF-02, ya ejecutado
(los commits `22f1b74` a `f73bda2` cierran P0–P9). Sus tres menciones de `TX_ContactosVisita`
describen la creación de la tabla con sus 7 campos — trabajo completado y correcto. El único
hit del grep de vocabulario general era `WhatsApp` como canal de origen (falso positivo C-6).

**Nota sobre `SC-RF09-ExtraccionClaude_import_instrucciones.md`.** Declara en su cabecera estar
*"RECONSTRUIDO contra Especificación v1.8.2 (17-jul-2026)"*. Pese a citar una versión antigua
del spec, no contiene vocabulario retirado ni escenarios renombrados: RF-09/SC-RF09 no se ven
afectados por §2. Se deja constancia de la cita a v1.8.2 sin actuar — actualizarla excedería
el mandato.

---

## Grupo 2 · Bitácora de aprendizajes (familia H)

| Archivo | Hits | Decisión |
|---|---|---|
| `docs/aprendizajes.md` | 2 (líneas 155, 198) | **SIN CAMBIO** |

**Justificación.** Es una bitácora **append-only** por mandato de `CLAUDE.md` (*"No sobrescribas
entradas anteriores. Solo agrega al final."*). Sus dos hits son registro de hechos pasados:

- Línea 155 — documenta el hallazgo de que `TX_Solicitudes.estado` tiene 12 opciones reales
  incluyendo `devuelta`, y por qué `AT-RF09-Trigger_script.js` usa una blacklist de 2 estados.
  **Es un hecho verificado por MCP el día que se escribió.** Reescribirlo falsificaría el registro.
- Línea 198 — documenta que el cambio v1.4→v1.8.2 no alteró el contrato de SC01/SC05/SC13.
  Hecho histórico correcto en su momento.

**Acción prevista al cierre del sync:** agregar una **entrada nueva al final** con los
aprendizajes de esta sesión, según el formato obligatorio de `CLAUDE.md`. Eso no es una
modificación de las entradas existentes.

---

## Grupo 3 · Snapshots de estado (familia I) — 13 archivos

```
docs/_notas/snapshot-P1.md  … snapshot-P9.md          (9)
docs/_notas/snapshot_20260724_1639.md
docs/_notas/snapshot_20260724_1649.md
docs/_notas/snapshot_20260724_1704.md
docs/_notas/snapshot_20260724_1710.md
```

**Decisión — SIN CAMBIO.** Un snapshot es, por definición, la fotografía del repositorio en
un instante. Reescribirlo para que refleje vocabulario posterior lo convierte en un documento
falso: dejaría de describir lo que efectivamente existía en esa fecha.

Los hits de `TX_ContactosVisita` en `snapshot_20260724_1639.md` (9), `_1704.md` (2) y
`_1710.md` (2) son descripción de estado histórico y correcto.

**Excepción a los greps de regresión §6.1:** esta carpeta se excluye por ruta, con la misma
lógica con que se excluyen los bloques SUPERSEDED.

---

## Grupo 4 · Archivo histórico (familia J) — 13 archivos

```
docs/_archivo/aprendizajes-20260722-1934-P0.md  …  -2308-P9.md   (10)
docs/_archivo/aprendizajes_20260714.md
```

**Decisión — SIN CAMBIO.** El directorio `_archivo/` está declarado en `CLAUDE.md` como
*"archivos históricos/obsoletos"*. Es el destino canónico de contenido congelado. Modificarlo
contradiría su propósito.

**Excluido por ruta de los greps de regresión §6.1.**

---

## Resumen de exclusiones para los greps de regresión (§6.1)

Rutas y líneas que **no** deben contar como violación en `VALIDATION.md`:

| Exclusión | Motivo |
|---|---|
| `docs/_archivo/**` | archivo histórico congelado |
| `docs/_notas/snapshot*.md` | snapshots de estado por definición inmutables |
| `docs/aprendizajes.md` | bitácora append-only; registro de hechos |
| `docs/_sync_ifTasador_v1/**` | artefactos de este mismo proceso; citan el vocabulario obsoleto para poder erradicarlo |
| `docs/diseno.md:207,227` | `3 intentos` = backoff de upload D-14.2 (falso positivo C-6) |
| `WhatsApp` como canal de origen | falso positivo C-6 · ver lista de ubicaciones en `00b_correcciones_al_prompt.md` |
| `"Iniciar captura"` | botón de navegación legítimo del spec §2.4 (C-7) |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` | sólo si se aprueba su restauración (A-04) |
