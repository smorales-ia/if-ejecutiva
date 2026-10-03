# Checklist de diseño — T-PLANTILLA-DISENO-FINO-20261001

Ítem por ítem, estado tras la Ola 1 (página 1 ejecutada y verificada por render).
OK = coincide con el oráculo · PEND = diagnosticado, no ejecutado en esta tanda · N/A = ya coincidía.

## Página 1 (ejecutada)
| Ítem | Antes (v2) | Después (v3) | Estado |
|---|---|---|---|
| Marco del logo | sin marco | marco azul `#8DB4E2` | OK |
| Tamaño del logo | 3,9" | −10% (3,5") dentro del marco | OK |
| Etiquetas en negrita | regular | negrita | OK |
| Colon sin espacio (`X:`) | `X :` | `X:` | OK |
| Fuente Calibri | Calibri | Calibri | N/A (ya coincidía) |
| Banda `#095085` | correcta | correcta | N/A |
| Márgenes laterales de banda | a sangre | a sangre | PEND (Ola 3) |
| Altura exacta del marco | — | ~95% del oráculo | PEND (fino) |

## Páginas 5-6 — grilla de fotos (ejecutada · Ola 2)
| Ítem | Antes (v2) | Después (v3) | Estado |
|---|---|---|---|
| Fondo de leyendas de foto | gris `#D4D4D4` | azul `#095085` | OK |
| Texto de leyendas | blanco sobre gris (invisible) | blanco sobre azul | OK |
| Medianiles/gutters de la grilla | gris `#808080`/`#7F7F7F` | azul `#095085` | OK |
| Confinado a tablas con `d.fotos.fotos` (no toca págs 2-3) | — | sí | OK |

Verificado por render (`check-hoja5.png`, `check-hoja6.png`): las 16 leyendas y los medianiles
quedaron azules con texto blanco, replicando la "firma visual" del oráculo.

## Página 2 (diagnosticada, PEND — Ola 3)
| Ítem | Estado |
|---|---|
| Caja VALOR TASACION (proporción/altura) | PEND |
| Altos de fila tablas OFERTAS/CBR/valoración | PEND |
| Elemento Arial Narrow Bold | PEND |
| Filas PROMEDIO celeste `#8DB4E2` | N/A (ya correcto) |
| Mapa de referencias | fuera de alcance (hueco `mapa.staticMapUrl`) |

## Resto (diagnosticado, PEND — Ola 3)
Pág 1 bandas con márgenes laterales + bisel; cuadros técnicos (pág 3); anexos (págs 7-8);
ligadura tipográfica "ti" (sustituto de Calibri en Carbone): padding/altos/bordes a calibrar.

## Criterio de HECHO
Identidad ≥ 98% con auditor ciego conforme (ver `auditor.md`). Umbral global NO alcanzado:
Olas 1-2 cerradas y verificadas (salto grande en págs 5-6); Ola 3 pendiente de autorización de Sergio.
