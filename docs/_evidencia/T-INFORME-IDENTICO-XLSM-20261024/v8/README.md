# Plantilla v8 · informe idéntico a MET-6283 (24/25-oct-2026)

`docs/_artefactos/carbone/PLANTILLA_MET_v8.docx` = hojas **Tapa** e **Impresion** de la planilla del
cliente (`docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm`) convertidas a Word con
etiquetas Carbone. Plan: `docs/_planes/PLAN_T-INFORME-IDENTICO-XLSM-20261024.md`.

- **templateId v8** = SHA-256 del .docx = `9b706e2a469aa7ee2a0e571089eed94d8d5885558956e7431a3b7b1a7b423eb8`
  (ya subida con la clave TEST; las plantillas se comparten con la PROD).
- **Producción sin tocar**: E2 sigue en la v7 (`3f1082cd…7442`). Nada commiteado.

## Resultado (render TEST de VP-2026-0079 vs. PDF original)

| Hoja (pág.) | Píxeles de tinta coincidentes v8 | v7 (producción) | Desvío de palabras v8 (máx.) |
|---|---|---|---|
| Tapa (1) | 99,5 % | 60,5 % | 2,0 pt |
| Hoja 1 (2) | 98,1 % | 54,8 % | ≤ 2 pt salvo el texto justificado de la síntesis (≤ 4,4 pt) |
| Hoja 2 (3) | 98,8 % | 57,6 % | 1,9 pt |
| Hoja 3 (4) | 88,4 % | 46,2 % | 2,3 pt |
| Hoja 4 (5) | 100 % | 82,9 % | 1,4 pt |
| Hoja 5 (6) | 100 % | 84,1 % | 1,4 pt |
| Hoja 6 (7) | 98,1 % | 59,6 % | 1,3 pt |
| Hoja 7 (8) | 99,3 % | 27,4 % | 1,3 pt |

8 páginas, como el original. Línea de base del texto: mediana de desvío ≈ 0 pt en todos los
tamaños de fuente (títulos de 18 pt de la Tapa: +0,9 pt). Lo que resta en la Hoja 3 son bordes dobles/gruesos corridos 1 píxel y el dato
«0,599» (ver abajo). Métricas: `conversor/pixeles.py`, `delta_textos.py`, `dy_por_tam.py`.
Comparaciones lado a lado: `comparacion/original_vs_v8_hoja_N.png`; mapas de diferencias
(rojo = falta, azul = sobra): `comparacion/diferencias_hoja1.png`, `diferencias_hoja3.png`.

| Archivo | Qué es |
|---|---|
| `PDF_render_TEST_v8_VP0079.pdf` | Render con el contexto real de VP-0079 (`../contexto-0079.json`, 25-oct) |
| `PDF_render_TEST_v8_VP0079_datos_pendientes_simulados.pdf` | Igual, con los 4 datos pendientes completados a mano en el contexto (`contexto-0079-simulado.json`): muestra cómo queda al cerrarlos |
| `PDF_render_TEST_v8_estatico_xlsm.pdf` | Conversión sin etiquetas (valores e imágenes del xlsm): validación de la geometría |

## Cómo se construye (repetible, ~20 s, sin Word ni Excel)

```
python -P conversor/construir_v8.py "docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm" conversor/geometria.tsv conversor/geometria_tapa.tsv PLANTILLA_MET_v8.docx --textos ../celdas.tsv
```

Reproduce byte a byte la plantilla entregada (zip con fecha fija: el templateId no cambia al regenerar). Piezas:

- `xl_modelo.py`: lee la hoja con openpyxl (valores guardados, estilos, colores de tema con tinte,
  combinaciones, formato condicional, «mostrar ceros» apagado) y las anclas del dibujo del xlsm.
- `formato_xl.py`: formatos numéricos de Excel en es-CL (contables con `*`, `_)`, `" m²"`, fechas).
- `docx_escritor.py`: una tabla por página con anchos fijos y alto de fila exacto; desborde de texto
  como Excel (sobre celdas vacías, tapando sus bordes), corte en el borde cuando no hay espacio,
  y la línea de base calculada para que caiga donde la pone Excel. Formas flotantes ancladas a la
  página (imágenes, cuadros de texto y recuadros de los anexos).
- `etiquetas_impresion.py`: el mapa celda → etiqueta Carbone (608 rutas distintas; 36 casillas de
  imagen, cada una con marcador PNG propio e `imageFit`); `construir_v8.py` lleva el de la Tapa.
- Calibración medida en el PDF original: `geometria*.tsv` (`excel-geometria.ps1`, Excel COM) y
  `anchos_impresos.json` (`ajustar_cols.py`: ancho impreso de cada columna).
  Impresion: filas ×0,5845, fuentes ×0,60, formas ×0,602. Tapa: columnas ×0,6152, filas ×0,5893.
- `exp_linea*.py`: experimentos que midieron cómo ubica LibreOffice (Carbone) la línea de base.
- `rutas.py`: verifica que cada etiqueta exista en un contexto JSON (en VP-0079 sólo falta
  `rentabilidad.tiempoRentaAnios`).

## Diferencias residuales

### De dato (no de plantilla) — requieren decisión de Sergio

1. **Tasador**: VP-0079 tiene asignado «Sergio (nutricionsaludketo)»; el original dice «Maria Eugenia Soto». Decidido reasignar justo antes del PDF final.
2. **Fecha de visado 15-04-2026**: `partes.fechaVisado` viene `null` (no hay columna). Propuesta: `TX_Solicitudes.fecha_visado`.
3. **Revisor «MetLife»**: `clienteInforme.nombreRevisor` viene `null`; falta el lector de `C_VariablesCliente` (`nombre_revisor`).
4. **Tiempo renta (años) 65**: `rentabilidad.tiempoRentaAnios` no existe en el contexto.
5. **Mapa y foto de fachada de la Hoja 1**: el original usa otras imágenes que las de «Ubicación» y «Fachada» de la grilla de fotos.
6. **Relación frente/fondo «0,599»** (Hoja 3, Terreno): sin fuente en el contexto; la casilla queda en blanco.
7. **«ALBAÑILERÍA LADRILLO»**: el dato viene sin tilde («ALBAÑILERIA»).
8. **Manzana**: el original la deja en blanco; VP-0079 tiene `sii.codManzana = 882`. La v8 la deja en blanco como el original (se puede poner la etiqueta).

### De plantilla (generalidad, no se ven en VP-0079)

- Rótulos que la planilla cambia según el tipo de propiedad («Casa Nº», «Mansarda», «Condominio») quedan fijos como en una casa.
- Formato condicional de la planilla congelado en el estado de MET-6283 (ninguna regla se activa; p. ej. «BIENES NO CONSIDERADOS GARANTIA» queda oculto).
- «Valor a Remate 65 %» y «Liquid. Normal 82,5 %» quedan como texto fijo (no hay ruta en el contexto).
- Tabla de habitaciones: superficie sólo del piso 1 (`propiedad.supPrimerPisoM2`) y «Dorm Serv.»/«Baño Serv.» del piso 1.
- «Ofert.»/«CBR.» de las referencias y los números de fila 1–9 son fijos, como en la planilla.
- Texto que Excel corta en el borde («Espacios de circu», «Coef Máx Constructib») se corta igual en la v8; si un dato variable no cabe, se comprime hasta 60 % de ancho en vez de cortarse.
- El texto justificado (síntesis) reparte las palabras de una línea con 3–4 pt de diferencia.

## Auditoría ciega (25-oct)

Juicio visual por hoja: Tapa ~99 %, Hoja 1 ~95 %, Hoja 2 ~99 %, Hoja 3 ~97 %, Hojas 4–7 ~99 %; la
v8 mejora las 8 hojas frente a la v7 y no hay hallazgos de severidad alta. Señaló dos defectos de
plantilla, ya corregidos en la versión entregada: faltaba el rótulo «OO.CC.» en las cabeceras de
referencias (ahora en x = 346,2 pt, como el original) y la fecha «13-04-2026» del valor de tasación
quedaba baja y recortada (era una celda con «ajustar texto»). El auditor no tenía Python; el hash,
los conteos de etiquetas y las mediciones por palabra se hicieron en la sesión constructora.

## Para pasar a producción (con aprobación de Sergio)

1. Re-apuntar el módulo de render de E2 (Make 5750023) de `3f1082cd…7442` a `9b706e2a…3eb8`
   (patrón de `aprendizajes.md` 03-oct: GET blueprint → reemplazar id en la URL → PATCH); el
   código de la app no usa `CARBONE_TEMPLATE_ID` (sólo `.env.local`, de referencia).
2. Reemitir desde la app (nunca «Replay run» en E3).
3. Rollback: volver a `3f1082cd…7442` (v7).
No requiere cambios de código: todas las rutas ya existen en `InformeContexto`.
