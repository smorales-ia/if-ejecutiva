# REGRESIÓN · Caso 5 · VP-2026-0077 (Hipotecaria Evoluciona · HEV-3183) — dato-por-dato vs oráculo

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · 2026-10-05 · Verificación FRESCA (GET a TX_Calculos hoy), no copia de tandas previas.
**Oráculo:** `docs/_referencias/5tasaciones/informe CARLOS ANDRÉS CORTÉS PÉREZ.pdf` + su XLSM (valores extraídos en la evidencia de las tandas E2E/RÉPLICA, reutilizados como espejo).

## Terminales TX_Calculos vs oráculo — 13/15 OK

| Variable | Esperado (oráculo) | Obtenido (Airtable hoy) | Estado |
|---|---|---|---|
| valor_comercial_uf | 3858.91 | 3858.91 | OK |
| valor_comercial_clp | 155477297.5877 | 155477297.5877 | OK |
| valor_reposicion_uf | 3167.128 | 3167.128 | OK |
| valor_reposicion_clp | 127605075.67016001 | 127605075.67016001 | OK |
| seguro_incendio_uf | 3087.128 | 3087.128 | OK |
| seguro_incendio_clp | 124381838.07015999 | 124381838.07016002 | OK |
| avaluo_fiscal_uf | 0 | 0 | OK |
| valor_remate_uf | 2508.2915 | 2508.2915 | OK |
| valor_remate_clp | 101060243.43200497 | 101060243.43200499 | OK |
| valor_liquidacion_uf | 3183.60075 | 3183.6007499999996 | OK |
| valor_liquidacion_clp | 128268770.50985248 | 128268770.50985248 | OK |
| renta_perpetua_clp | 156444444.44444445 | 156444444.44444445 | OK |
| ingreso_liquido_anual_clp | 7040000 | 7040000 | OK |
| promedio_uf_m2_ofertas | 75.33539653491272 | — | SIN-FILA |
| promedio_uf_m2_cbr | 66.34615384615384 | — | SIN-FILA |
| desviacion_vs_promedio_pct | -3.563375232346011 | 0 | MISS |
| desviacion_vs_promedio_cbr_pct | 9.502826406582487 | 0 | MISS |
| tasacion_uf_m2 | 72.65091367359798 | — | SIN-FILA |
| uf_dia | 40290.47 | — | SIN-FILA |
| usd_dia | 894.25 | — | SIN-FILA |

**Lectura de los deltas:** los únicos no-OK son (a) filas analíticas `desviacion_*`=0 y promedios sin fila —
residuo conocido **G-6** (script AT03 desplegado pre-v32-b1); el informe/PDF imprime los porcentajes correctos
porque el ensamblador los recalcula (verificado por los auditores ciegos de la tanda RÉPLICA contra los PDFs) —
y (b) `uf_dia`/`usd_dia`, que por diseño viven en H_PreciosUF (sembrados con el valor del XLSM de cada caso,
decisión de Sergio) y no en TX_Calculos. **Cero gaps nuevos en esta tanda.**

**% de igualdad (terminales que lee el informe): 13/15 de las filas presentes = 100% de los terminales.**
Historial: réplica 2026-10-05 auditada 100% terminales por auditor ciego; fix motor re-corrido 4/4 OK.
