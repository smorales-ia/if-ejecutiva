# Regresión 13/13 — VP-2026-0066 (MetLife · MET-6283) — T-AUDIT-CLOSE-20260923

Verificada **en vivo** vía MCP el 2026-09-23 (lectura de `TX_Calculos`, tabla `tblFz37KSvn5pLKDR`,
filtradas por `solicitud = recNiwM4s1ibr3sbO`). UF día visita = 39894.61 (2026-04-13, `H_PreciosUF`
`recbnHFtlFHQnyEM9`). Tolerancia: ±1 % CLP / ±0,01 UF vs oráculo xlsm Portada.

| Terminal | Oráculo (Portada) | Leído en vivo (`valor_resultado`) | ✓ |
|---|---|---|---|
| F_ValorComercialUF | 20.125,86 | 20125.862399999998 | ✅ |
| F_ValorComercialCLP | 802.913.431 | 802913431.3616639 | ✅ |
| F_ValorReposicionUF | 9.246,94 | 9246.94 | ✅ |
| F_ValorReposicionCLP | 368.903.065 | 368903064.99340004 | ✅ |
| F_SeguroIncendioUF | 8.907,06 | 8907.062399999999 | ✅ |
| F_SeguroIncendioCLP | 355.343.781 | 355343780.69366395 | ✅ |
| F_AvaluoFiscalUF | 8.517,68 | 8517.67767625752 | ✅ |
| F_ValorRemateUF | 13.081,81 | 13081.81056 | ✅ |
| F_ValorRemateCLP | 521.893.730 | 521893730.3850816 | ✅ |
| F_ValorLiquidacionUF | 16.603,84 | 16603.836479999998 | ✅ |
| F_ValorLiquidacionCLP | 662.403.581 | 662403580.8733728 | ✅ |
| F_IngresoLiquidoAnualCLP | 36.300.000 | 36300000 | ✅ |
| F_RentaPerpetuaCLP | 806.666.667 | 806666666.6666667 | ✅ |

**13/13 verde.** Motor version leído: `AT03_v11.1.1_v32b0`. snapshotVars: `factor_seguro=1`,
`factor_garantia=0.8`, `tasa_cap_rate_efectivo=0.045`, `uf_m2_terreno_comuna=17`,
`sup_construccion_m2=249.91`.

## Invariante de los guards H5/H6/H7 sobre esta regresión
- Cliente MetLife (`recIg8NtVhptXkEUJ`): `tasa_cap_rate=0.045`, `factor_seguro=1`,
  `factor_garantia=0.8` → **ninguno NaN** → H5/H6 NO disparan.
- Comuna Colina (`recKT9mUJkeq3YuBu`): `uf_m2_terreno=17`, `uf_m2_construccion=42`,
  `uf_m2_promedio_residencial=42` → **los tres presentes** → H7 NO dispara.
- ∴ los guards fail-ruidoso NO alteran la regresión 13/13. El cambio solo mata la
  degradación silenciosa cuando faltan los datos (cliente/comuna sintéticos).
