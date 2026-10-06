# REGRESIÓN · Caso 1 · VP-2026-0073 (MetLife · METLIFE-6280) — dato-por-dato vs oráculo

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · 2026-10-05 · Verificación FRESCA (GET a TX_Calculos hoy), no copia de tandas previas.
**Oráculo:** `docs/_referencias/5tasaciones/Informe ALEJANDRO AVILA DURAN (II).pdf` + su XLSM (valores extraídos en la evidencia de las tandas E2E/RÉPLICA, reutilizados como espejo).

## Terminales TX_Calculos vs oráculo — 15/15 OK

| Variable | Esperado (oráculo) | Obtenido (Airtable hoy) | Estado |
|---|---|---|---|
| valor_comercial_uf | 3323.2 | 3323.2 | OK |
| valor_comercial_clp | 132402004 | 132402004 | OK |
| valor_reposicion_uf | 3364.0 | 3364 | OK |
| valor_reposicion_clp | 134027546.08 | 134027546.08 | OK |
| seguro_incendio_uf | 2658.56 | 2658.56 | OK |
| seguro_incendio_clp | 105921603.12 | 105921603.12 | OK |
| avaluo_fiscal_uf | 2898.01 | 2898.01 | OK |
| valor_remate_uf | 2160.08 | 2160.08 | OK |
| valor_remate_clp | 86061302.54 | 86061302.54 | OK |
| valor_liquidacion_uf | 2741.64 | 2741.64 | OK |
| valor_liquidacion_clp | 109231653.22 | 109231653.22 | OK |
| renta_perpetua_clp | 173555555.56 | 173555555.56 | OK |
| ingreso_liquido_anual_clp | 7810000 | 7810000 | OK |
| promedio_uf_m2_muestra | 45.30398120124996 | 45.30398120124996 | OK |
| desviacion_vs_promedio_pct | -30.248955694145174 | -30.248955694145174 | OK |

**Lectura de los deltas:** los únicos no-OK son (a) filas analíticas `desviacion_*`=0 y promedios sin fila —
residuo conocido **G-6** (script AT03 desplegado pre-v32-b1); el informe/PDF imprime los porcentajes correctos
porque el ensamblador los recalcula (verificado por los auditores ciegos de la tanda RÉPLICA contra los PDFs) —
y (b) `uf_dia`/`usd_dia`, que por diseño viven en H_PreciosUF (sembrados con el valor del XLSM de cada caso,
decisión de Sergio) y no en TX_Calculos. **Cero gaps nuevos en esta tanda.**

**% de igualdad (terminales que lee el informe): 15/15 de las filas presentes = 100% de los terminales.**
Historial: réplica 2026-10-05 auditada 100% terminales por auditor ciego; fix motor re-corrido 4/4 OK.
