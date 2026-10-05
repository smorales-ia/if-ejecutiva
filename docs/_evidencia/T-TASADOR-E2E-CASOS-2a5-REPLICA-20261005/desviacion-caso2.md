# DESVIACIÓN TASACIÓN vs PROMEDIO DE MUESTRA · CASO 2 (AGH-1548) · 2026-10-05

Control blando (no frena el caso). Tasación: **34 UF/m²** (1394 UF / 41 m²).

| Bloque | Promedio muestra UF/m² | Tasación UF/m² | Desviación | Oráculo (Portada) |
|---|---|---|---|---|
| REF. OFERTAS (5) | 35,7637 | 34 | **−4,93%** | AX36 = −4,93% ✅ |
| REF. C.B.R. (2) | 33,375 | 34 | **+1,87%** | AX44 = +1,87% ✅ |

- Desviaciones pequeñas y simétricas (−5%/+2% en el PDF impreso): la tasación está DENTRO del
  rango de la muestra — sin desviación notable que reportar (a diferencia del Caso 1, que
  tasó −30% bajo ofertas).
- Nota: las filas de TX_Calculos `desviacion_vs_promedio_*` escritas por el AT03 desplegado
  salieron 0 (script desplegado anterior al per-block del repo — ver overrides-caso2.md §4).
  Los % correctos del informe los calcula el ensamblador desde TX_Comparables.
