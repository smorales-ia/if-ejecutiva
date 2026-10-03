# Inventario de bindings a preservar — T-PLANTILLA-WORD-XLSM-20261001

- Total `{d.*}`: **528** (count de `{d.`). Únicos: 456. Loops `[i=`: **186**.
- Familias: `d.meta.*`, `d.clienteInforme.*`, `d.partes.*`, `d.propiedad.*`, `d.sii.*`, `d.cuadro.*`,
  `d.terminales.*`, `d.comparablesInforme.{ofertas,cbr,tasacionFila}.*` (loops `filas[i=0..N]`),
  `d.rentabilidad.*`, `d.textosIA.*`, `d.cualitativa.*`, `d.recintos.habitacionesPorNivel[nivel=…]`,
  `d.fotos.fotos[i=0..15].{url,categoria}`, `d.anexos.*`, `d.mapa.*`, `d.legales.*`, `d.imagenes.*`.
- **Verificación post-edición**: tras round-trip de Word (Hoja 1) + flip de bandas, count `{d.`
  sigue en **528** y el render no deja huérfanos. Ninguna edición tocó el texto de un marcador
  (solo formato: tamaño/alto/indent/shading/color).
- Riesgo manejado: Word fragmenta un marker con `lastRenderedPageBreak`; Carbone lo re-une (validado).
