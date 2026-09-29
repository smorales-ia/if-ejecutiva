# Fix motor CI-057 — PREPARADO, NO APLICADO (28-sep-2026)

> El productor del 161%/30,91 **impreso** es la app (lo corrige B-CODE en
> `lib/informe/ensamblador.ts`). Este documento deja el MOTOR coherente con la misma
> aritmética, listo para aplicar cuando Sergio confirme que la automation
> **AT03_Calculos_DAG está OFF** en la UI de Airtable. Hasta esa confirmación,
> **C_Formulas no se toca** (snapshots de respaldo: `snap-formula-promedio-pre.json`,
> `snap-formula-desviacion-pre.json`).

## 1. Cambios YA hechos en el script del repo (git, no producción)

`docs/_artefactos/airtable/AT03_Calculos_DAG.js` (el paste a la automation es manual):

- `sumComparables()` ahora agrega **por bloque** además del combinado (compat):
  devuelve `{promedio, n, nFilas, ofertas:{promedio,n}, cbr:{promedio,n}}`, clasificando
  por `tipo_referencia` (`fldB920e8jIKgbERM`, singleSelect Oferta/CBR).
- SCOPE nuevo (aditivo, no rompe expresiones existentes):
  - `promedio_uf_m2_ofertas` · `n_ofertas`
  - `promedio_uf_m2_cbr` · `n_cbr`
  - `uf_m2_construccion_tasacion` = `valor_edificacion_items_uf / sup_construccion_m2`
    (Portada!BD59: edificación depreciada ÷ superficie — **no** el valor comercial total).

## 2. PATCHes a C_Formulas (aplicar SOLO con AT03 OFF confirmado)

| Fila | Campo `expresion` — valor NUEVO |
|---|---|
| `recFcpOeKjXNunBlj` (`F_UFm2_promedio` v3.2 → bumpear `version` a v3.3) | `n_ofertas > 0 ? promedio_uf_m2_ofertas : (n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna)` |
| `recliyqVJAGatkDw0` (`F_DesviacionVsPromedio` v1.0 → v2.0) | `(n_ofertas > 0 && promedio_uf_m2_ofertas > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_ofertas - 1) * 100 : 0` |
| **Fila NUEVA** `F_DesviacionVsPromedioCBR` v1.0 · `variable_output: desviacion_vs_promedio_cbr_pct` · `unidad_output: %` · `activa: true` · `orden_topologico: 91` · mismo `C_ReglasNegocio` que la 143 | `(n_cbr > 0 && promedio_uf_m2_cbr > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_cbr - 1) * 100 : 0` |
| **Fila NUEVA** `F_UFm2_promedio_CBR` v1.0 · `variable_output: promedio_uf_m2_cbr_out` · `unidad_output: UF/m2` · `activa: true` · `orden_topologico: 2` | `n_cbr > 0 ? promedio_uf_m2_cbr : 0` |

Rollback: restaurar `expresion`/`version` desde los snapshots; filas nuevas → DELETE
(o `activa: false`).

⚠ Antes de aplicar, verificar que `regla_aplicada.formulas_resultado` de la regla activa
(`recYEf9XepX4SmLnH`) incluya las variables nuevas si se quiere que persistan en
TX_Calculos (el paso 9 del script gatea la escritura por esa lista).

## 3. Validación EN SECO (python, datos reales de los 7 comparables de VP-0067)

```
promedio_uf_m2_ofertas = 33.643448  (esperado 33,64)  ✅
promedio_uf_m2_cbr     = 24.084478  (esperado 24,08)  ✅
uf_m2_construccion_tasacion = 32.640000  (esperado 32,64)  ✅
desviacion ofertas = -2.9826%  (imprime -3%)  ✅
desviacion cbr     = +35.5230%  (imprime 36%)  ✅
dolar: 368.903.065 / 890,33 = 414.344  ✅
VALIDACION EN SECO: PASS
```

## 4. Pasos para Sergio (en orden)

1. Confirmar en Airtable → Automations que **AT03_Calculos_DAG está OFF** (declarado
   OFF el 27-sep; la API no puede verificarlo).
2. Con esa confirmación, aplicar los 2 PATCH + 2 CREATE de la tabla §2 (o pedir a
   Claude Code que los ejecute — están listos).
3. Pegar el script actualizado `AT03_Calculos_DAG.js` en el nodo customScript de la
   automation (paste manual — el MCP no puede).
4. AT03 **queda OFF**; su reactivación es decisión aparte. Si se reactiva sin el paso 3,
   las expresiones nuevas caerían al fail-safe 0 (variables ausentes del SCOPE viejo).
