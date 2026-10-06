# REGRESIÓN · Caso 2 · VP-2026-0074 (Agencia Habitacional · AGH-1548) — dato-por-dato vs oráculo

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · 2026-10-05 · Verificación FRESCA (GET a TX_Calculos hoy), no copia de tandas previas.
**Oráculo:** `docs/_referencias/5tasaciones/Informe JANETH PATRICIA CANDO ARIAS.pdf` + su XLSM (valores extraídos en la evidencia de las tandas E2E/RÉPLICA, reutilizados como espejo).

## Terminales TX_Calculos vs oráculo — 13/15 OK

| Variable | Esperado (oráculo) | Obtenido (Airtable hoy) | Estado |
|---|---|---|---|
| valor_comercial_uf | 1394 | 1394 | OK |
| valor_comercial_clp | 56164915.18 | 56164915.18 | OK |
| valor_reposicion_uf | 1115.2 | 1115.2 | OK |
| valor_reposicion_clp | 44931932.144 | 44931932.144 | OK |
| seguro_incendio_uf | 1394 | 1394 | OK |
| seguro_incendio_clp | 56164915.18 | 56164915.18 | OK |
| avaluo_fiscal_uf | 1256.2748213163063 | 1256.2748213163063 | OK |
| valor_remate_uf | 906.1 | 906.1 | OK |
| valor_remate_clp | 36507194.867 | 36507194.867 | OK |
| valor_liquidacion_uf | 1150.05 | 1150.05 | OK |
| valor_liquidacion_clp | 46336055.0235 | 46336055.0235 | OK |
| renta_perpetua_clp | 58666666.66666667 | 58666666.66666667 | OK |
| ingreso_liquido_anual_clp | 3520000 | 3520000 | OK |
| promedio_uf_m2_ofertas | 35.763724351529234 | — | SIN-FILA |
| promedio_uf_m2_cbr | 33.375 | — | SIN-FILA |
| desviacion_vs_promedio_pct | -4.931601457927626 | 0 | MISS |
| desviacion_vs_promedio_cbr_pct | 1.872659176029967 | 0 | MISS |
| uf_dia | 40290.47 | — | SIN-FILA |
| usd_dia | 894.25 | — | SIN-FILA |

**Lectura de los deltas:** los únicos no-OK son (a) filas analíticas `desviacion_*`=0 y promedios sin fila —
residuo conocido **G-6** (script AT03 desplegado pre-v32-b1); el informe/PDF imprime los porcentajes correctos
porque el ensamblador los recalcula (verificado por los auditores ciegos de la tanda RÉPLICA contra los PDFs) —
y (b) `uf_dia`/`usd_dia`, que por diseño viven en H_PreciosUF (sembrados con el valor del XLSM de cada caso,
decisión de Sergio) y no en TX_Calculos. **Cero gaps nuevos en esta tanda.**

**% de igualdad (terminales que lee el informe): 13/15 de las filas presentes = 100% de los terminales.**
Historial: réplica 2026-10-05 auditada 100% terminales por auditor ciego; fix motor re-corrido 4/4 OK.
