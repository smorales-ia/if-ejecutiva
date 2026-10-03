# Diff residual v3 vs original — T-PLANTILLA-WORD-XLSM-20261001

Medido con pymupdf (geometría) + comparación ocular. Base: v3 (82-85% de la tanda previa).

| Hoja | Brecha | Medición / evidencia | Prioridad | Estado v4 |
|---|---|---|---|---|
| 1 | Reparto vertical (ANTECEDENTES arriba) | orig y=465 vs v3 y=345 (−120pt) | ALTA | **resuelto** (v4 y=463) |
| 1 | Logo tamaño/ratio | orig 281×165 r1.71 vs v3 253×161 r1.57 | ALTA | **resuelto** (281×165 r1.70) |
| 1 | Sangría etiquetas | orig x=123 vs v3 x=63 | MEDIA | **resuelto** (+40pt) |
| 2,4,7 | Bandas/encabezados de sección en GRIS | deberían ser azul `#095085`+blanco (XLSM Impresion: 100% azul, sin gris) | ALTA | **resuelto** (209 celdas flip) |
| 2 | Caja VALOR TASACION / anchos de columna | proporción de columnas | MEDIA | parcial (banda azul OK; anchos finos pendientes) |
| 8 | Maqueta documentos legales | texto corrido vs bloque | MEDIA | verificado (auditor ~93%) |

Las comparaciones lado a lado están en `comparacion-v4-hoja1..8.png` y detalles en `check-v4-hoja2.png`.
