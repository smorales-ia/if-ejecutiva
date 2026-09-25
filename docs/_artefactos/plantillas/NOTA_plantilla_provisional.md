# Nota de alcance — Plantilla provisional del informe (`Informe_VProperty_provisional_v0.docx`)

> **Tanda:** T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 5 (`docs/_analisis/ROADMAP_paridad_informe_20260924.md`)
> **Fecha:** 2026-09-25

## Qué ES

- Un `.docx` **válido** (paquete OOXML mínimo: `[Content_Types].xml`, `_rels/.rels`,
  `word/document.xml`, `word/_rels/document.xml.rels`, `word/styles.xml`,
  `word/header1.xml`) con las **8 hojas del gold master MET-6283**
  (`docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`) como
  secciones separadas por saltos de página, con fidelidad **estructural**:
  mismo orden de bloques y tablas, mismos rótulos literales (títulos,
  «Hoja N°X», pie corporativo Santa Magdalena 75 Of 310 · Fono 22 500 0366,
  declaración legal, boilerplate «Análisis de las referencias»).
- **Todos los tags Carbone salen de `lib/informe/matriz-tags.ts`**, textual.
  Los 40 tags con ruta no vacía de la matriz aparecen al menos una vez
  (verificación automática del generador — ver resultado abajo). Los
  HUECO/METLIFE_ONLY llevan el tag igual (la plantilla queda lista para cuando
  el dato exista) con una marca discreta `[pendiente Px-y]` en gris 7pt, sólo
  en la primera aparición de cada tag.
- Los **loops** usan la sintaxis de repetición de Carbone: fila `{d.x[i].campo}`
  seguida de fila `{d.x[i+1].campo}` — comparables
  (`comparablesInforme.filas`), cuadro de valoración (`cuadro.items`),
  habitaciones por nivel, terminaciones por recinto, ampliaciones, fotos y
  anexos, en tablas Word simples (`w:tbl`).
- Las **columnas auxiliares** de los loops y los campos de encabezado usan
  rutas reales de `InformeContexto` (`lib/informe/tipos.ts`): p. ej.
  `{d.comparablesInforme.filas[i].precioUf}`, `{d.partes.rut}`,
  `{d.sii.destinoSii}`, `{d.terminales.fechaUf}`. La matriz trae un tag
  representativo por grupo; el detalle de columnas sale del contrato, no se
  inventó ninguna ruta.
- Marca de agua textual en el encabezado de todas las páginas:
  **«PLANTILLA PROVISIONAL v0 — NO OFICIAL»**.

## Qué NO es

- **No es la plantilla oficial** ni pretende paridad pixel-perfect: sin logos,
  sin imágenes, sin la diagramación exacta del xlsm de origen.
- **Sin imágenes dinámicas**: la inserción de imagen de Carbone
  (`{d.fotos.fotos[i].url:imageFit(...)}`, logo, mapa, firma, fachadas de
  referencias, anexos escaneados) se configura recién con la plantilla oficial
  en la **Tanda 5** — aquí las URLs se renderizan como texto.
- La grilla de fotos 2×4 del gold master (Hojas N°4/N°5) está representada como
  una tabla-lista con loop; la Hoja N°5 es continuación declarada de ese loop
  (calca la foliación, no duplica el loop).
- La miniatura «FOTO FACHADA» de la Hoja N°1 usa el tag de la matriz
  `{d.fotos.fotos[i].url}` tal cual; en la oficial será un filtro
  `[i=0]`/categoría Fachada (anotado en la propia plantilla).
- Los subtotales del cuadro (TOTAL TERRENO / EDIFICACION / OO.CC.) no tienen
  ruta en el contrato: quedan como rótulo con nota — se resuelven en T5
  (agregación Carbone o campo nuevo del ensamblador).

## Cómo se regenera

```bash
python3 docs/_artefactos/plantillas/generar_plantilla_provisional.py
```

El script (stdlib pura: `re` + `zipfile` + `xml.etree`) **parsea en vivo**
`lib/informe/matriz-tags.ts` — no hay lista embebida que pueda divergir. Si la
matriz cambia, se regenera y: (a) las anotaciones `[pendiente]` se recalculan
del estado/pId nuevos; (b) cualquier tag nuevo sin lugar natural en el layout
aterriza solo en la sección final «Datos adicionales» de la Hoja N°7 — cero
tags perdidos. El script termina auto-verificando (zip íntegro, todas las
partes XML bien formadas, conteo de tags) y sale con código ≠0 si falta alguno.

## Cómo se reemplaza por la oficial (Tanda 5)

La matriz de tags es el contrato compartido: la plantilla oficial se maqueta
en Word sobre el layout corporativo real usando **exactamente los mismos tags**
de `lib/informe/matriz-tags.ts` (más las columnas auxiliares de
`InformeContexto` listadas arriba). Para SC09/Carbone **solo cambia el
binario** `.docx`; el JSON (`InformeContexto` del ensamblador) no se toca.
Checklist del reemplazo:

1. Copiar los tags desde esta provisional (o desde
   `matriz-tags-informe.md`) al layout oficial — no retipearlos a mano.
2. Convertir los tags de imagen a inserción real de Carbone
   (`:imageFit`) — fotos, logo, mapa, firma, anexos.
3. Correr la misma verificación de tags de
   `generar_plantilla_provisional.py` (función `verificar()`) apuntando al
   binario oficial antes de subirlo a Carbone/SC09.
4. Retirar la marca de agua «NO OFICIAL».

## Resultado de la verificación (2026-09-25)

```
Plantilla: docs/_artefactos/plantillas/Informe_VProperty_provisional_v0.docx
Partes OOXML: 6 · XML bien formado: sí
Tags de la matriz (ruta no vacía): 40 esperados · 40 encontrados · 0 faltantes
```

Matriz parseada: 53 grupos (23 OK · 20 HUECO · 5 METLIFE_ONLY · 5 PLANTILLA),
consistente con `matriz-tags-informe.md`. La sección «Datos adicionales» quedó
vacía: los 40 tags tienen lugar natural en el layout.
