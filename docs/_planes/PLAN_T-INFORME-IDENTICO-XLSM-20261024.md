# PLAN · T-INFORME-IDENTICO-XLSM-20261024 — informe visualmente idéntico a MET-6283

Pedido de Sergio (24-oct-2026): «el informe debe quedar idéntico al original». Elegido en el chat:
convertir la **planilla del cliente** (hoja `Impresion` del xlsm, la que generó el PDF original) en
la plantilla Word de Carbone, en una sesión dedicada.

## Estado de partida (producción, 24-oct-2026)

- Commit `5a49690` en `main`. E2 (Make 5750023) apunta a la plantilla **v7**
  (`docs/_artefactos/carbone/PLANTILLA_MET_v7.docx`, templateId `3f1082cd…7442`); rollback v5
  `f6d1f2b0…786f`. E3 v2.4. **Nunca «Replay run» en E3.**
- PDF de VP-2026-0079 (`rec6XubOR92X6gnOH`): 8 páginas, **mismos datos y valores** que el original,
  mismas fotos en el mismo orden (Hojas 4–5), anexos en su hoja. Lo que difiere es el **diseño** de
  las Hojas 1, 2 y 3 (rótulos con relleno vs. rótulos planos con «:», fuentes, altos, distribución
  de tablas) y el mapa de la Hoja 1 (el original usa otra imagen, más cercana, que VP-0079 no tiene).
- Original: `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` · planilla:
  `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`.

## Hallazgos de las pruebas (scripts en `docs/_evidencia/T-INFORME-IDENTICO-XLSM-20261024/`)

1. El PDF original = hoja `Tapa` + hoja `Impresion` (A1:BW554, 7 páginas, A4, márgenes 0,5 cm,
   centrada, ajuste a 1 página de ancho). Cortes de página: filas **86, 144, 219, 303, 387, 471**
   (Hoja 1 = filas 1–85; Hoja 2 = 86–143; Hoja 3 = 144–218; Hojas 4/5 = 219–386; anexos = 387–554).
   Escala de impresión ≈ 0,58–0,61 (fila de 15 pt → 8,7 pt; Calibri 9/10 → 5,2/5,8 pt).
2. **Carbone con la planilla como XLSX/ODS no sirve**: su LibreOffice cambia anchos de columna, no
   deja desbordar texto a celdas vecinas como Excel, muestra «###» y, con la planilla completa,
   imprime hojas ocultas y pierde fórmulas entre hojas (`prueba-xlsx-carbone.pdf`).
3. **Excel → HTML → Word sí reproduce el diseño** (`prueba-hoja1-excel-html-word.pdf`:
   `excel-html.ps1` + `word-escalar.ps1`). Falta: (a) Word parte en varias líneas el texto que en
   Excel desborda a celdas vacías → combinar esas celdas en Excel antes de exportar; (b) escalar
   en el HTML (no por COM: recorrer celdas por COM tarda >10 min por hoja).
4. Inventario: `celdas.tsv` (11.674 celdas con fórmula: dirección, fórmula, texto, formato,
   alineación, rango combinado) e `imagenes.tsv` (147 formas: fotos, mapas, firmas, flechas del
   mapa de referencias, recuadros, cuadros de texto y botones de macros fuera del área de impresión).
5. Carbone en DOCX: cada casilla de imagen necesita **archivo de marcador propio** y
   `:imageFit(contain)`; una misma imagen repetida en el documento se inserta una sola vez con el
   tamaño de otra casilla (por eso `imagenUnica` en `lib/informe/imagenes.ts`).
6. Word COM sin interfaz: **no hay portapapeles** (usar `Range.FormattedText`); dos tablas pegadas
   se unen (dejar un párrafo entre medio); scripts .ps1 con literales no ASCII deben guardarse con
   BOM; si un script falla, matar los WINWORD/EXCEL huérfanos (bloquean el archivo).
7. Desde WSL, Node necesita `NODE_OPTIONS=--dns-result-order=ipv4first` para leer Airtable.
   Contexto real de VP-0079 + render de prueba:
   `docs/_evidencia/T-CUADRO-COLUMNAS-20261023/contexto-0079.test.mts` y `carbone-render.mjs`
   (clave TEST = marca de agua; la PROD cuesta 1 de 100 renders/mes).

## Plan

1. **Conversor** (script repetible, en `docs/_evidencia/…/scripts/`): sobre una copia del xlsm, con
   Excel COM: fórmulas → valores en `Impresion`; combinar celdas donde el texto desborda; escribir
   en cada celda variable su etiqueta Carbone con el formateador que corresponde a su
   `NumberFormat` (`formatN(0|2)`, `formatD(DD-MM-YYYY)`, `%`…); publicar A1:BW554 a HTML.
   Python: escalar medidas y fuentes del HTML. Word: abrir HTML, A4, cortes de página en las filas
   de arriba, guardar DOCX.
2. **Mapa celda → etiqueta**: a partir de `celdas.tsv`, sólo las celdas variables (las que leen
   `FICHA SOLIC`, `Portada`, `Antecedentes`, `Referencias`… con datos del caso). Las rutas del
   contexto están en `lib/informe/tipos.ts` y la plantilla v7 (las etiquetas actuales, 664) es la
   referencia de nombres. Rótulos copiados de otras hojas quedan como texto fijo.
3. **Imágenes**: reemplazar las fotos/mapas/firma/planos estáticos por casillas con
   `descr="{d.…:imageFit(contain)}"` y marcador propio (ver `construir_v7.py`). Flechas, elipses y
   recuadros del mapa de referencias (Hoja 2) son del caso MET-6283: no van fijos en la plantilla
   (decidir con Sergio si se omiten o se agregan como dato).
4. **Ensamblado**: Tapa de la v7 (ya idéntica) + Impresion convertida → `PLANTILLA_MET_v8.docx`.
5. **Datos que faltan** (con aprobación de Sergio en el chat, uno por uno):
   - Fecha de visado 15-04-2026: no hay columna; proponer `TX_Solicitudes.fecha_visado` (schema).
   - Revisor «MetLife»: `C_VariablesCliente` (clave `nombre_revisor`) — el ensamblador hoy pone
     `clienteInforme.nombreRevisor: null` fijo: falta el lector.
   - «Tiempo renta (años) 65»: sin fuente (ver la fórmula del xlsm).
   - Manzana: el original la deja en blanco (dato del tasador, no del SII).
   - Mapa de la Hoja 1: el original usa otra imagen (más cercana) que la de «Ubicación» de la Hoja 4.
   - Tasador: decidido reasignar VP-0079 a «Maria Eugenia Soto» **justo antes** de emitir el PDF
     final (después Sergio ya no podrá editarla como tasador).
   - Región: ya corregida a «Metropolitana de Santiago» (24-oct-2026).
6. **Validación**: render de prueba de VP-0079 y comparación hoja por hoja con el original
   (`tramos.py`, `comparar_pdf.py`, `textos_pdf.py` para posiciones); auditor ciego; recién con el
   OK de Sergio: subir a Carbone, re-apuntar E2 y reemitir desde la app.

## Reglas

- Producción no se toca hasta que la v8 pase la comparación y Sergio lo apruebe en el chat.
- Escrituras en Airtable/Make sólo con aprobación explícita en el chat de la sesión que escribe.
- No hacer commit ni push salvo pedido de Sergio.
- `pnpm build` (en WSL: `./node_modules/.bin/next build`) limpio antes de cualquier commit de código.
