# REGRESIÓN FAN-OUT · CASO 5 · VP-2026-0077 (recoZcwmgCBVKQMxF) · Hipotecaria Evoluciona (HEV-3183)

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · FASE 2 (carril C5) · **2026-10-05**
**Oráculo:** `HEV3183.xlsm` · contrato en `diagnostico.md` §5 (reposición **3.167,128** y seguro **3.087,128** SIN override) · réplica auditada en `../T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/auditor-caso5.md`.
**Corrida:** PATCH `estado='visitada'` 20:30:18Z → `calculada` 20:30:29Z (~11 s, duracion_ms=7477) · motor `AT03_v11.2.0_v32b1` · 17/17 filas TX_Calculos.

## 1 · Precondición: factor_seguro del maestro (GET solo lectura)

- Cliente linkeado en la solicitud: **`recPDwixzybwHlJaQ` · "Hipotecaria Evoluciona"** (el canónico — NO el duplicado legacy "EVOLUCIONA", que no está linkeado).
- **`factor_seguro = 0.8`** (además fg=0.8, tasa_cap_rate=0.045) → **coincide con el oráculo** (fs efectivo C5 = 0,8, `diagnostico.md` §2 G-2).
- Consecuencia: **no se necesitó `valor_seguro_override`** — a diferencia de C2/C3 (gap G-7, fs oráculo 1,0), en C5 el motor pudo ejercitar la rama nueva de G-2 de punta a punta. M_Clientes no se tocó.

## 2 · Overrides del record tras la corrida

| Campo | Valor | ¿Legítimo? |
|---|---|---|
| `valor_reposicion_override` | — (vaciado) | ✓ retirado para ejercitar G-1 |
| `valor_seguro_override` | — (vaciado) | ✓ retirado para ejercitar G-2 (fs maestro = fs oráculo = 0,8) |
| `vida_util_override` | 70 | ✓ dato del tasador (XLSM BJ37) — conservado |
| `tasa_cap_rate_override` | — | n/a en C5 |

`override_motivo`/`override_autor` actualizados al carril C5 de esta tanda (quedan registrados en el `detalle_json` del evento AT03).

## 3 · Terminales Esperado / Obtenido

| Terminal | Esperado (contrato §5 / réplica auditada) | Obtenido | Delta | OK |
|---|---|---|---|---|
| `valor_reposicion_uf` | **3.167,128 SIN override** | 3167.128 (evento: repo=0) | 0 | ✅ |
| `valor_reposicion_clp` | 127.605.075,67016 | 127605075.67016001 | 0 | ✅ |
| `seguro_incendio_uf` | **3.087,128 SIN override** | 3087.128 (evento: seguro=0) | 0 | ✅ |
| `seguro_incendio_clp` | 124.381.838,07016 | 124381838.07016002 | 0 | ✅ |
| `valor_comercial_uf` | 3.858,91 | 3858.91 | 0 | ✅ |
| `valor_comercial_clp` | 155.477.297,5877 ($155.477.298) | 155477297.5877 | 0 | ✅ |
| `valor_remate_uf` | 2.508,2915 (2.508,29) | 2508.2915 | 0 | ✅ |
| `valor_remate_clp` | 101.060.243,432 | 101060243.43200499 | <1e-2 (flotante) | ✅ |
| `valor_liquidacion_uf` | 3.183,60075 (3.183,60) | 3183.6007499999996 | <1e-9 | ✅ |
| `valor_liquidacion_clp` | 128.268.770,50985 ($128.268.771) | 128268770.50985248 | <1e-2 | ✅ |
| `avaluo_fiscal_uf` | 0 (oráculo "NO REGISTRA") | 0 | 0 | ✅ |
| `ingreso_liquido_anual_clp` | 7.040.000 | 7040000 | 0 | ✅ |
| `renta_perpetua_clp` | 156.444.444,44 | 156444444.44444445 | <1e-2 (redondeo doc) | ✅ |
| `promedio_uf_m2_muestra` | 73.83718942011957 (réplica) | 73.83718942011957 | 0 | ✅ (deuda conocida: mezcla CBR, no de esta tanda) |
| `promedio_uf_m2_cbr_out` | 0 (réplica) | 0 | 0 | ✅ (deuda G-6/guard, no de esta tanda) |
| `desviacion_vs_promedio_pct` / `_cbr_pct` | 0 / 0 (G-6, build c93620f) | 0 / 0 | 0 | ✅ (deuda G-6 conocida) |

**Todos los terminales distintos de reposición/seguro quedaron idénticos a la réplica auditada** — el fix no movió nada que no debía mover.

## 4 · Verificación anti-trampa R3 — descomposición del seguro

La trampa numérica de C5: 0,8 × (edificación-base 3.458,91 + OO.CC. 400) = 0,8 × 3.858,91 = 3.087,128 — el mismo total por dos rutas distintas. Por eso no basta el total; descomposición verificada:

**Ítems del cuadro (TX_ItemsCuadroValoracion, GET por record):**

| Ítem | `tipo_item` | `valor_uf` | `valor_seguro_item_uf` | ¿En base de seguro? |
|---|---|---|---|---|
| Depto Nº 411, Torre 3 (recz3t68XQE0ie7SB) | Edificacion | 3204.24 | **3204.24** | ✓ asegurable |
| Terraza (reckTtSDPlD7jDn5j) | Edificacion | 254.67 | **254.67** | ✓ asegurable |
| Estacionamiento Nº 105 (recn1dqHr7kX5K2VL) | **OO.CC.** | 400 | **400** | ✓ asegurable (sembrado como OO.CC.; NO es Estac. U/Goce ni Estac. Desc) |

- No hay ítems de tipos excluidos (Terreno, Estac. U/Goce, Estac. Desc, S/Reg No Regularizable) — exclusiones espejo intactas (R6, fórmula de campo `valor_seguro_item_uf` no tocada).
- **`valor_seguro_base_items_uf` = Σ `valor_seguro_item_uf` = 3204.24 + 254.67 + 400 = 3.858,91** — con el estacionamiento DENTRO de la base asegurable.
- La expresión evaluada (snapshot TX_Calculos `reccH3LuvDuxtRGFe`) es un **producto único sin término aditivo**: `… hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : …` — no existe un "+ OO.CC." fuera del factor, así que los 400 UF del estacionamiento entraron factorizados, no sumados aparte.
- Base implícita vista por el motor: `__resultado__` 3087.128 ÷ `factor_seguro` 0.8 (presente en `inputs_json`) = **3.858,91 exacto** = Σ ítems asegurables. ✓
- **Seguro = 3.858,91 × 0,8 = 3.087,128** por la ruta correcta (base asegurable × factor cliente), no por la casualidad aritmética.

**Descomposición de la reposición (G-1), de paso:** sin ítem Terreno → `sup_terreno_items_m2 = 0` → rama ×0,8: 0,8 × `valor_edificacion_nuevo_items_uf` (3204.24+254.67 = 3.458,91) = 2.767,128 + OO.CC. 400 = **3.167,128** ✓ (espejo de Portada!BG72 `IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)`). Nótese que reposición (0,8 sin estac + 400 plenos) y seguro (0,8 sobre todo incl. estac) difieren en estructura aunque C5 los hace parecer parientes: 3.167,128 ≠ 3.087,128.

## 5 · Snapshots y evento (prueba de fórmula NUEVA sin override)

- `F_ValorReposicionUF` (TX_Calculos `recdtmjEo4sx1ZPqr`, v3.3, calculado_en 20:30:25.420Z): snapshot **= expresión NUEVA** con `(sup_terreno_items_m2 > 0 ? … : … * 0.8)` — idéntica al DESPUÉS de `fix-aplicado.md` §G-1. ✅
- `F_SeguroIncendioUF` (TX_Calculos `reccH3LuvDuxtRGFe`, v3.3, calculado_en 20:30:25.685Z): snapshot **= expresión NUEVA** con `valor_seguro_base_items_uf * factor_seguro` — idéntica al DESPUÉS de §G-2. ✅
- CLP aguas abajo (`reccSYS3vG5HYVRbX` / `recEpgCKPHfVrnawj`): recogieron los valores nuevos. ✅
- **A_Eventos `rec6vTwjgxtb7RhJp`** (20:30:28.861Z, posterior al trigger 20:30:18Z): `at03_dag_completo`, severidad info, **"AT03_v31 EJECUTOR 17/17 OK. overrides[final=0 repo=0 gar=0 tasa=0]"**; `detalle_json`: `formulas_total:17, formulas_escritas:17, formulas_errores:0`, `valor_reposicion_override:0`, `valor_seguro_override:0`, `vida_util_override:70`; `payload_json`: `factor_seguro:0.8`. **Cero aborts** (búsqueda FIND sobre A_Eventos devuelve solo este evento nuevo + el histórico de la réplica, con repo=3167.128/seguro=3087.128 — queda como contraste pre/post fix).

## 6 · Veredicto

**OK.** En C5 ambos fixes se ejercitaron de lleno y sin red: reposición 3.167,128 por la rama ×0,8 sin terreno (G-1) y seguro 3.087,128 por base asegurable × factor_seguro del maestro (G-2), ambos **sin override** (evento repo=0/seguro=0), con descomposición R3 que descarta la ruta casual 0,8×(base+OO.CC.). Todos los demás terminales idénticos a la réplica auditada. Sin rollback. Único override restante: `vida_util_override=70` (legítimo).
