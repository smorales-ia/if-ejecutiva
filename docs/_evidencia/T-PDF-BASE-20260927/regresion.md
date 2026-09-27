# REGRESIÓN T4 — Motor AT03 real sobre VP-2026-0067 vs oráculo PDF MET-6283

> 27-sep-2026 · Corrida del script REAL `AT03_Calculos_DAG.js` v11.2.0_v32b1 (sin modificar) vía
> `at03-harness.mjs` (shim del API de scripting sobre REST; AT03 automation apagada por Sergio).
> Registro: `recmMzeu3eWGxyXsf` (VP-2026-0067, espejo MET-6283). Log: `at03-run-0067.log`.
> Valores obtenidos verificados por GET independiente post-corrida: `snap-calculos-0067.json`.
> Oráculo: 13 terminales del gold master, mismos valores que la corrida certificada de VP-2026-0066
> (`AUDITORIA_PDF_MET6283_20260926.md` §1/§2.5) + `lib/informe/golden-met6283.ts`.
> UF día visita (2026-04-13): 39.894,61. Tolerancia: ±0,01 UF · ±1 CLP.

## T4.a · Los 13 terminales

| variable_output | Esperado (oráculo) | Obtenido (TX_Calculos 0067) | Delta | OK |
|---|---|---|---|---|
| valor_comercial_uf | 20.125,8624 | 20.125,862399999998 | 0,0000 | ✅ |
| valor_comercial_clp | 802.913.431,36 | 802.913.431,3616639 | 0,00 | ✅ |
| valor_reposicion_uf | 9.246,94 | 9.246,94 | 0 | ✅ |
| valor_reposicion_clp | 368.903.064,99 | 368.903.064,99340004 | 0,00 | ✅ |
| seguro_incendio_uf | 8.907,0624 | 8.907,062399999999 | 0,0000 | ✅ |
| seguro_incendio_clp | 355.343.780,69 | 355.343.780,69366395 | 0,00 | ✅ |
| avaluo_fiscal_uf | 8.517,68 | 8.517,67767625752 | 0,0023 | ✅ (±0,01) |
| valor_remate_uf | 13.081,81 | 13.081,81056 | 0,0006 | ✅ |
| valor_remate_clp | 521.893.730,39 | 521.893.730,3850816 | 0,00 | ✅ |
| valor_liquidacion_uf | 16.603,84 | 16.603,836479999998 | 0,0035 | ✅ |
| valor_liquidacion_clp | 662.403.580,87 | 662.403.580,8733728 | 0,00 | ✅ |
| ingreso_liquido_anual_clp | 36.300.000 (exacto) | 36.300.000 | 0 | ✅ |
| renta_perpetua_clp | 806.666.666,67 | 806.666.666,6666667 | 0,00 | ✅ |

**13/13 en verde al céntimo.** Idénticos a la corrida certificada de VP-2026-0066 — el relink de la
Pieza 1 no alteró ningún terminal (regresión de no-daño ✅).

## T4.b · Las 2 fórmulas de la Pieza 1 (el P0-quirúrgico)

| Criterio | Resultado | OK |
|---|---|---|
| `F_UFm2_promedio` EJECUTA y escribe fila (antes: excluida por Filtro 2) | fila `recJBJQdcuodR7Kxd` = 30,912313602499562 | ✅ |
| `F_DesviacionVsPromedio` EJECUTA y escribe fila (antes: "nunca ejecutada") | fila `recOQzPNt1uZEmSls` | ✅ |
| 15/15 fórmulas de la regla V32 pasan el Filtro 2 (`REGLA formulas_resultado` incluye las 2 nuevas — log) | 15/15 escritas | ✅ |
| `round(desviacion_vs_promedio_pct) = −3` (criterio del plan §6-T4b) | **+160,52** | ❌ **FAIL con causa** |

### Análisis del FAIL (hallazgo H-T4b, NO atribuible al relink — sin rollback)

Datos crudos de los 7 comparables (RF-09, foto real del gold master · `snap-comparables-0067.json`):

| precio_uf | sup_t | sup_c | uf_m2_terreno_f | oo_cc_uf | tipo |
|---|---|---|---|---|---|
| 20.000 | 5.051 | 239 | 2,2 | 750 | Oferta |
| 18.000 | 5.013 | 360 | 1,8 | 700 | CBR |
| 19.500 | 5.001 | 252 | 2,0 | 500 | Oferta |
| 23.900 | 5.012 | 258 | 3,0 | 750 | Oferta |
| 24.900 | 5.077 | 239 | 3,1 | 750 | Oferta |
| 20.500 | 5.002 | 250 | 2,7 | 700 | CBR |
| 18.900 | 5.000 | 264 | 2,0 | 500 | Oferta |

- El lector b1 (`AT03_Calculos_DAG.js:1044-1076`) **homogeneiza**: `uf_m2 = (precio − uf_m2_terreno_f×sup_t − oo_cc) / sup_c` → promedio **30,91 UF/m²** (solo edificación).
- La expresión de `F_DesviacionVsPromedio` compara contra la tasación **sin homogeneizar**: `valor_comercial_uf/sup_construccion = 80,53 UF/m²` (incluye terreno + OO.CC.) → **+160,5%**. Bases mezcladas.
- Aritméticas alternativas con los mismos datos: promedio simple por fila 80,21 → **+0,40%**; tasación homogeneizada (8.157,06/249,91 = 32,64) vs 30,91 → **+5,6%**. **Ninguna reproduce el −3% del PDF** — la aritmética exacta del gold master no está determinada por los datos digitalizados disponibles.
- Es la materia de **CI-057** (ya abierta antes de esta tanda). El relink (Pieza 1) hizo su trabajo: las fórmulas ejecutan y persisten. Corregir la EXPRESIÓN (o el lector) para casar el gold master es cambio de fórmula/motor — fuera del alcance §2 de esta tanda. **Decisión para Sergio** (documentada en el CIERRE §OK-Gate-next).

## Regresión de no-daño adicional

- Las 6 reglas legado conservan 20 links (`snap-reglas` post en T3, hilo principal).
- VP-2026-0066: **cero escrituras en toda la fase** (oráculo intacto).
- `pnpm typecheck` 0 errores · `pnpm test` **999/999 en verde** (56 archivos, incluye `fila-tasacion`/`comparables`/`ensamblador`/`validador-cifras`) — `tests-output.txt`.
- `pnpm lint`: **N/A estructural** — `eslint` no es dependencia del repo (script huérfano, como `test:e2e`); agregarla violaría la regla "no agregar dependencias".
