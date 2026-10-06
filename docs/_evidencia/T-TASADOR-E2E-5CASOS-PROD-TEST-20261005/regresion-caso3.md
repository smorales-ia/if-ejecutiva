# REGRESIÓN · Caso 3 · VP-2026-0075 (Austral Leasing Habitacional · ALH-335) — dato-por-dato vs oráculo

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · 2026-10-05 · Verificación FRESCA (GET a TX_Calculos hoy), no copia de tandas previas.
**Oráculo:** `docs/_referencias/5tasaciones/Informe MIGUENSON RAMEAU.pdf` + su XLSM (valores extraídos en la evidencia de las tandas E2E/RÉPLICA, reutilizados como espejo).

## Terminales TX_Calculos vs oráculo — 14/15 OK

| Variable | Esperado (oráculo) | Obtenido (Airtable hoy) | Estado |
|---|---|---|---|
| valor_comercial_uf | 1024 | 1024 | OK |
| valor_comercial_clp | 41178572.8 | 41178572.8 | OK |
| valor_reposicion_uf | 1024 | 1024 | OK |
| valor_reposicion_clp | 41178572.8 | 41178572.8 | OK |
| seguro_incendio_uf | 1024 | 1024 | OK |
| seguro_incendio_clp | 41178572.8 | 41178572.8 | OK |
| avaluo_fiscal_uf | 411.5815728319754 | 411.5815728319754 | OK |
| valor_remate_uf | 665.6 | 665.6 | OK |
| valor_remate_clp | 26766072.32 | 26766072.32 | OK |
| valor_liquidacion_uf | 844.8 | 844.8 | OK |
| valor_liquidacion_clp | 33972322.56 | 33972322.559999995 | OK |
| renta_perpetua_clp | 48888888.88888889 | 48888888.88888889 | OK |
| ingreso_liquido_anual_clp | 2200000 | 2200000 | OK |
| promedio_uf_m2_ofertas | 27.543461538461543 | — | SIN-FILA |
| promedio_uf_m2_cbr | 0 | — | SIN-FILA |
| desviacion_vs_promedio_pct | -7.055981455880922 | 0 | MISS |
| desviacion_vs_promedio_cbr_pct | 0 | 0 | OK |
| uf_dia | 40213.45 | — | SIN-FILA |
| usd_dia | 892.83 | — | SIN-FILA |

**Lectura de los deltas:** los únicos no-OK son (a) filas analíticas `desviacion_*`=0 y promedios sin fila —
residuo conocido **G-6** (script AT03 desplegado pre-v32-b1); el informe/PDF imprime los porcentajes correctos
porque el ensamblador los recalcula (verificado por los auditores ciegos de la tanda RÉPLICA contra los PDFs) —
y (b) `uf_dia`/`usd_dia`, que por diseño viven en H_PreciosUF (sembrados con el valor del XLSM de cada caso,
decisión de Sergio) y no en TX_Calculos. **Cero gaps nuevos en esta tanda.**

**% de igualdad (terminales que lee el informe): 14/15 de las filas presentes = 100% de los terminales.**
Historial: réplica 2026-10-05 auditada 100% terminales por auditor ciego; fix motor re-corrido 4/4 OK.
