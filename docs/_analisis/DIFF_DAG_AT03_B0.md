# Diff DAG `AT03_Calculos_DAG.js` — Fase B-0a (lector del Cuadro de Valoración)

> **Rama:** `feat/motor-b0-dag-cuadro`. Archivo modificado: `docs/_artefactos/airtable/AT03_Calculos_DAG.js`.
> Versión: **11.0 (v32) → 11.1 (v32-b0)** · `MOTOR_VERSION = 'AT03_v11.1_v32b0'`.
> **No ejecutado contra Airtable.** Listo para revisión de Sergio y pegado manual en la Automation AT03.
> Verificación local: `node --check` (envuelto en `async function`) → **SYNTAX OK**.

## Qué cambia y por qué

El motor de `C_Formulas` (evaluador `safeEval` del DAG) solo ve **variables escalares del SCOPE**; no
lee tablas hijas. Para que las fórmulas puedan sumar el Cuadro de Valoración (el bloqueo de Fase B),
el DAG debe agregar `TX_ItemsCuadroValoracion` en JS e inyectar los totales al SCOPE. Eso hace este diff.

### 1 · Nuevo handle de tabla (aditivo)
- `let tReglas = null;` → `let tReglas = null, tItemsCuadro = null;`
- Nuevo `try { tItemsCuadro = base.getTable('TX_ItemsCuadroValoracion'); } catch (e) {}`
  (mismo patrón defensivo que las demás tablas opcionales).

### 2 · Nueva función `sumCuadroValoracion(recId)` — replica 1:1 las sumas del xlsm
Análoga a `sumObrasComplementarias`, filtra por el link `solicitud` y agrupa por `tipo_bien`.
Lee `valor_total_uf` (fórmula de la tabla = `BI` ya calculado) y `valor_seguro_base` (fórmula = `BO`).

| Salida | Fórmula | Celda xlsm | Consume (C_Formulas v3.3) |
|---|---|---|---|
| `edif` | `SUMIF(valor_total_uf, tipo='Edificacion')` | `Portada!BI59` | F_ValorEdificacion / F_ValorComercialUF |
| `edifNuevo` | `SUMIF(superficie*uf_m2, tipo='Edificacion')` (sin depreciar) | `Portada!CC70` | F_ValorReposicionUF |
| `terreno` | `SUMIF(valor_total_uf, tipo='Terreno')` | `Portada!BI61` | F_ValorTerreno / F_ValorComercialUF |
| `occ` | `total − edif − terreno` (por exclusión) | `Portada!BI60` | F_ValorOCC / F_ValorComercialUF / Reposición |
| `supTerreno` | `SUMIF(superficie, tipo='Terreno')` | `Portada!AN61` | (UF/m² efectivo `BD61`, derivado) |
| `seguroBase` | `SUMIF(valor_seguro_base)` (la fórmula ya pone 0 a Terreno/Estac/S-Reg) | `Portada!BO62` | F_SeguroIncendioUF |

FIELD_IDs usados (verificados vía MCP): solicitud `fld8atIwbxSbOlsgq` · tipo_bien `fld5HVdWpMY0jWqkx`
· valor_total_uf `fld1F3u5J5NlnJUjY` · superficie `fldSoAHz4I7MPTUBN` · uf_m2 `fldVxo2PfoG7aQ33s` ·
valor_seguro_base `fldxzIzT0kakMUbss`.

**OCC por exclusión** (`total − edif − terreno`) reproduce exactamente `BI60` del xlsm y captura
Piscina + OO.CC. + Bodega + Estac. + Terraza + Otro sin enumerarlos, igual que la hoja.

### 3 · Llamada + logging
Tras `sumObrasComplementarias`, se agrega `const cuadro = await sumCuadroValoracion(recordId);` y un
`console.log('  CUADRO: …')` con las 6 salidas para trazabilidad en el historial de la Automation.

### 4 · Inyección al SCOPE (aditivo, no rompe nada)
Se agregan 6 variables al objeto `SCOPE` (junto a `sum_obras_complementarias_uf`):
`valor_edificacion_items_uf`, `valor_edificacion_nuevo_items_uf`, `valor_terreno_items_uf`,
`valor_occ_items_uf`, `sup_terreno_items_m2`, `valor_seguro_base_items_uf`, y el flag
`hay_cuadro` (1 si hay filas, 0 si no).

### 5 · Retrocompatibilidad garantizada
- Ninguna fórmula **vigente** referencia estas variables ⇒ toda tasación actual calcula **idéntico**.
- Si la solicitud **no tiene filas de cuadro**, la función retorna 0 y `hay_cuadro=0`; las fórmulas
  v3.3 (Fase B-0b) hacen `hay_cuadro > 0 ? <cuadro> : <modelo previo>`, así que los predios sin
  cuadro poblado siguen con el comportamiento actual.
- El cambio **no** retira overrides ni toca las terminales; eso es Fase B-0b (`C_Formulas`).

## Records de `C_Formulas` que consumirán estas variables (Fase B-0b)
`F_ValorComercialUF` (`rec8rv76smtjQh4Rb`), `F_ValorReposicionUF` (`reckDXGPbkDVjzPjY`),
`F_SeguroIncendioUF` (`recZTfJX0MJ0r1tHP`); y las intermedias del chain v3.1 `F_ValorTerreno`
(`recHNKyfGDBV4Hxu3`), `F_ValorOCC` (`recNvuDLjUpr0re89`), `F_ValorEdificacion` (`recsYqh0ssRR0mUJo`).
Expresiones exactas en `FASE_B0_PLAN_EJECUCION.md` §2.
