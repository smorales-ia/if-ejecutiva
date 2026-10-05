# DESVIACIÓN TASACIÓN vs PROMEDIO DE MUESTRA · CASO 3 (ALH -335) · 2026-10-05

Control blando (no frena el caso). Tasación: **25,6 UF/m²** (1024 UF / 40 m²).

| Bloque | Promedio muestra UF/m² | Tasación UF/m² | Desviación | Oráculo (Portada) |
|---|---|---|---|---|
| REF. OFERTAS (5) | 27,5435 | 25,6 | **−7,06%** | AX36 = −7,06% ✅ |
| REF. C.B.R. (0) | — (muestra vacía) | 25,6 | **sin control** | AX42/AX44 = 0 ✅ (REF.CBR vacía en el oráculo — hueco ⚠ conocido del PLAN §5) |

- Desviación chica y hacia abajo (−7% impreso en ambos PDFs): la tasación está DENTRO
  del rango de la muestra de ofertas (25,425–28,94 UF/m²; de hecho 25,6 ≈ la oferta más
  baja, Toconce 551 a 25,425). Sin desviación notable que reportar.
- El bloque CBR no aporta control en este caso: el oráculo no trae ninguna referencia
  CBR (único caso de los 5 con Comp. Of/CBR = 5/0). El informe replica el bloque vacío.
- Nota: las filas `desviacion_vs_promedio_*` de TX_Calculos escritas por el AT03
  desplegado salieron 0 (script desplegado anterior al per-block del repo — ver
  overrides-caso2.md §4 / overrides-caso3.md §5). El −7,06% del informe lo calcula el
  ensamblador desde TX_Comparables.
