# CHECKLIST DE DISEÑO — PDF generado vs gold master (QA-F)

> Verificación programática (pymupdf/pypdf) + PNGs a 100dpi para el gate visual de Sergio:
> `visual-ref-p1/p2/p4.png` vs `visual-gen-p1/p2/p4.png` (portada, hoja 1, hoja 3).

## IDÉNTICO ALCANZABLE — verificado ✅

| Check | Resultado |
|---|---|
| Secuencia de secciones (15 hitos: portada → antecedentes → ofertas → CBR → rentabilidad → análisis → cuadro → valor tasación → mapa → fichas → exigencias → comodidades → fotos → anexos 1-2) | 15/15 en orden |
| Portada: barra INFORME DE TASACION + logo real (extraído del gold master) + ANTECEDENTES + ficha 7 campos + pie corporativo literal | ✅ |
| Encabezado repetido (cliente/RUT/dirección/N° interno + folio Hoja N°X) en hojas 2-7 | ✅ |
| Tablas con columnas del oráculo (12 col referencias, 16 col cuadro) — tras fix v1.1 de anchos ninguna columna se recorta | ✅ (41/41 datos visibles) |
| 65% / 82,5% fijos · boilerplate E-85 literal · declaración legal literal | ✅ |
| Formato chileno (miles con punto, decimales con coma) vía lang es-cl | ✅ |
| Paleta: azul #095085 (gold master, no el azul consola) · celeste #8DB4E2 · gris #D4D4D4 | ✅ por construcción (validación visual fina = Sergio) |
| Hoja 3: todos los rótulos de la ficha técnica presentes (valores vacíos por P1-1/P1-2) | ✅ |

## APROXIMADO — desviaciones aceptadas y declaradas

1. 9 páginas vs 8 (galería de fotos como lista con desborde; grilla 2×4 no reproducible con loops Carbone).
2. Tipografías 5,5–6,5 pt vs 4,8–6,6 pt del original (artefacto de la escala 61% de Excel).
3. Matriz HABITACIONES → tabla-lista Nivel/Recinto/Cantidad.
4. Promedios: uno global (motor) vs dos por bloque; fila TASACIÓN con UF/m² directo.
5. Agregados PROMEDIO/TASACIÓN también bajo CBR con los mismos tags globales.
6. Rentabilidad como tabla aparte (no lado a lado con CBR).

## NO REPRODUCIBLE HOY — placeholders declarados

1. Mapa con pines (P1-4) — placeholder con alt-text `{d.mapa.staticMapUrl}` ya cableado.
2. Fotos de la propiedad y fachadas de comparables (0067 sin fotos; URLs Dropbox no públicas).
3. Documentos escaneados incrustados en Anexos 1-2 (requiere merge post-render) — lista textual.
4. Firma manuscrita (placeholder `{d.partes.tasador.firmaUrl}`) · fecha visado · marca de agua Hoja 1.
5. Cualitativa Hoja 3 (valores) y columna US$ — huecos P1-x con layout listo.

## GATE VISUAL (Sergio) — pendiente

Abrir lado a lado `PDF_generado_VP0067.pdf` vs `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (o los PNG de esta carpeta): tipografías, alineado fino de tablas, identidad de marca. Veredicto al cierre.
