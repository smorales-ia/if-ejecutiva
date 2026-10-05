# DESVIACIÓN VS PROMEDIO DE LA MUESTRA · CASO 5 (HEV-3183) · 2026-10-05

Los "dos % de ajuste" del caso (fila TASACION V/S PROMEDIO DE LA MUESTRA):

| Bloque | Promedio UF/m² (oráculo) | TASACIÓN UF/m² | % exacto (oráculo) | % impreso PDF oráculo | % obtenido (ensamblador) | PDF nuestro |
|---|---|---|---|---|---|---|
| REF. OFERTAS (Portada AX34/AX36) | 75,33539653 | 72,65091367 | **−3,5634%** | **−4%** | −3,56337523 | **−4%** ✅ |
| REF. C.B.R. (Portada AX42/AX44) | 66,34615385 | 72,65091367 | **+9,5028%** | **+10%** | +9,50282641 | **+10%** ✅ |

- TASACIÓN UF/m² = edificación UF ÷ sup. edificación = 3458,91 ÷ 47,61 = 72,6509 —
  **excluye** el estacionamiento (OO.CC. = 400, columna propia de la fila TASACIÓN) ✅.
- Promedio ofertas = media de los 5 UF/m²C (74,8175 · 72,6197 · 71,8011 · 70,1139 · 87,3247).
- CBR con **1 sola fila** (Vicuña Mackenna Poniente 5954 Dp 1105 · 3450 UF / 52 m²) →
  promedio = la propia fila: 66,3462.

## Lo que escribió AT03 (desplegado) en TX_Calculos

| Variable | Valor motor | Comentario |
|---|---|---|
| `promedio_uf_m2_muestra` | 73.83718942 | Promedio COMBINADO de los 6 (no por bloque) — AT03 desplegado pre-v32-b1 (CI-057), igual que Casos 1-2 |
| `desviacion_vs_promedio_pct` | 0 | Sin escritor en el AT03 desplegado |
| `desviacion_vs_promedio_cbr_pct` | 0 | idem |
| `promedio_uf_m2_cbr_out` | 0 | idem |

**No afecta al PDF**: los % del informe los calcula `construirInformeContexto` por bloque
desde TX_Comparables (fila-tasacion.ts), y salen −3,56%/+9,50% → impresos −4%/+10%,
idénticos al oráculo. Las 4 filas de TX_Calculos de arriba quedan inservibles hasta el
re-paste del AT03 v32-b1 (paso manual de Sergio, ya anotado en el Caso 2).
