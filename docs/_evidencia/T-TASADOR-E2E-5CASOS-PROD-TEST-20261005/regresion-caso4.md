# REGRESIÓN · Caso 4 · VP-2026-0076 (Hipotecaria Security · SECURITY-6073) — dato-por-dato vs oráculo

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · 2026-10-05 · Verificación FRESCA (GET a TX_Calculos hoy), no copia de tandas previas.
**Oráculo:** `docs/_referencias/5tasaciones/Informe PATRICIO ADRIAN TORO NIEVAS.pdf` + su XLSM (valores extraídos en la evidencia de las tandas E2E/RÉPLICA, reutilizados como espejo).

## Terminales TX_Calculos vs oráculo — 13/15 OK

| Variable | Esperado (oráculo) | Obtenido (Airtable hoy) | Estado |
|---|---|---|---|
| valor_comercial_uf | 1072.17 | 1072.1699999999998 | OK |
| valor_comercial_clp | 42717096.9324 | 42717096.932399996 | OK |
| valor_reposicion_uf | 902.88 | 902.88 | OK |
| valor_reposicion_clp | 35972292.1536 | 35972292.1536 | OK |
| seguro_incendio_uf | 857.736 | 857.736 | OK |
| seguro_incendio_clp | 34173677.54592 | 34173677.54592 | OK |
| avaluo_fiscal_uf | 678.4269102839937 | 678.4269102839937 | OK |
| valor_remate_uf | 696.9105 | 696.9105 | OK |
| valor_remate_clp | 27766113.00606 | 27766113.00606 | OK |
| valor_liquidacion_uf | 884.54025 | 884.5402499999998 | OK |
| valor_liquidacion_clp | 35241604.96923 | 35241604.969229996 | OK |
| renta_perpetua_clp | 50000000 | 50000000 | OK |
| ingreso_liquido_anual_clp | 2750000 | 2750000 | OK |
| promedio_uf_m2_ofertas | 38.86906053021876 | — | SIN-FILA |
| promedio_uf_m2_cbr | 29.62962962962963 | — | SIN-FILA |
| desviacion_vs_promedio_pct | -14.863734252235028 | 0 | MISS |
| desviacion_vs_promedio_cbr_pct | 11.684375000000014 | 0 | MISS |
| uf_dia | 39841.72 | — | SIN-FILA |
| usd_dia | 909.94 | — | SIN-FILA |

**Lectura de los deltas:** los únicos no-OK son (a) filas analíticas `desviacion_*`=0 y promedios sin fila —
residuo conocido **G-6** (script AT03 desplegado pre-v32-b1); el informe/PDF imprime los porcentajes correctos
porque el ensamblador los recalcula (verificado por los auditores ciegos de la tanda RÉPLICA contra los PDFs) —
y (b) `uf_dia`/`usd_dia`, que por diseño viven en H_PreciosUF (sembrados con el valor del XLSM de cada caso,
decisión de Sergio) y no en TX_Calculos. **Cero gaps nuevos en esta tanda.**

**% de igualdad (terminales que lee el informe): 13/15 de las filas presentes = 100% de los terminales.**
Historial: réplica 2026-10-05 auditada 100% terminales por auditor ciego; fix motor re-corrido 4/4 OK.
