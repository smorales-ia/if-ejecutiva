# Medición R2 (altos de fila) — T-PLANTILLA-WORD-XLSM-20261001

Alto por fila en la tabla de comparables (hoja 2), medido por el paso vertical de los 7 totales de
ofertas (20.000, 24.900, 19.500, 23.900, 18.900, 20.500, 18.000) en los PDF renderizados.

| | alto/fila (pt) |
|---|---|
| ORIGINAL | 14.65 |
| v4 | 17.81 |

**Hallazgo: la dirección del defecto es la INVERSA a la reportada.** El auditor dijo "filas más
compactas en el generado"; la medición muestra que v4 tiene filas **más ALTAS** (17.81 vs 14.65) —
Hoja 2 del generado está más espaciada, no más compacta.

## Intentos de corrección (ambos fallidos, sin dejar regresión)
1. `trHeight w:hRule="exact" w:val="293"` (14.65pt) en las 15 filas de comparables → render dio
   **24.56pt** (empeoró). El renderer de Carbone/LibreOffice no interpreta "exact" como reducción aquí.
2. Eliminar el espaciado de párrafo heredado (after=200→0, line single) en las 94 celdas de esas
   filas → render **sin cambio** (17.81pt): el pitch de fila no lo controla el espaciado de párrafo.

**Conclusión: R2 no es corregible con seguridad** con el entendimiento actual del render (el alto de
fila lo fija un mecanismo del motor que resistió ambos enfoques; forzarlo regresó). Se revirtió al
estado bueno. El impacto visual es bajo (auditor dio hoja 2 en ~97%). Queda documentado para una
tanda futura que investigue el modelo de alto de fila de Carbone/LibreOffice.
