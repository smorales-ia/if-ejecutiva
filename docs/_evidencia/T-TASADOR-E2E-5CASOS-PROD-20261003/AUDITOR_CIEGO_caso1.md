# Auditor ciego · CASO 1 (METLIFE-6280 · VP-2026-0073) — 2026-10-05

**Record:** `reczuns8NHdI45Owp` · codigo **VP-2026-0073** · estado `calculada` · tasador `recTJcV3BIvdcG4em` (nutricionsaludketo).

## Resultado

- **Auditoría de datos (contexto ensamblado = lo que ven V3/V4/V5 y lo que recibe Carbone): 30/30 OK.**
  Valor comercial 3.323,20 UF / $132.402.004 · reposición 3.364 UF · seguro 2.658,56 UF · avalúo $115.461.656 ·
  remate 2.160,08 UF · liquidación 2.741,64 UF · UF 39.841,72 · **dólar 922,17** · cuadro total 3.323,20 UF ·
  promedio ofertas 45,30 / CBR 38,25 · **ajuste −30% / −17%** · renta perpetua $173.555.556 · 6 comparables · 16 fotos en grilla · ranuras fachada/ref1/mapa pobladas.
- **PDF real (Carbone v5, render directo):** `caso1-PROD.pdf` · 905 KB · **0 marcadores `{d.}` sin resolver** · 198 imágenes · 14/14 valores clave presentes (incluye propietario AVILA LEIVA, RUT 5.523.876-6, dirección LA MARINA, comparable CBR Rey Alberto). Espejo fiel del PDF oráculo en contenido.

## Gaps conocidos (honestos)

1. **`pdf_final_url` NO se escribió** (V6 in-app "Descargar PDF" cae a `window.print()`): **E3 (scenario 5791413) está `isActive=false`** en Make. E2 (5750023) sí corrió hoy (14:34). Carbone renderiza pero E3 no baja a Dropbox ni escribe Airtable. **Paso manual Sergio: activar E3 y re-disparar.** El PDF correcto ya está probado localmente.
2. **Paginación 11 pp vs 8 pp del oráculo** (VP-0067 v5 = 8). Probable spill de la sección de fotos (18 adjuntos sembrados). Contenido completo y correcto; layout a afinar (reducir/ajustar fotos por categoría).
3. **Objetivo:** PDF imprime "Mutuo Hipotecario" (no existe "Crédito Hipotecario" en M_TiposInforme; equivalente en Chile). Sin crear registros en maestros (D1).
4. **Categorización de fotos interiores** best-effort (cocina/baño/living no distinguibles sin render visual); ranuras clave (fachada/referencias/mapa) sí correctas.
5. **Omitidos** (singleSelect de opción incierta, menores): `agrupacion_propiedad`, `orientacion`.

## Vistas

- **V4 informe** (contenido): validado 30/30 vía ensamblador + PDF.
- **V1 adjuntos / V2 extracción / V3 datos / V5 expediente:** datos sembrados y presentes (18 fotos, datosTasacion completa, 15 terminales, 6 comparables, 7 habitaciones, 1 legal). El recorrido visual en navegador requiere login Clerk (Google nutricionsaludketo) — no ejecutable headless; lo hace Sergio con las URLs del cierre.
- **V6 PDF:** contenido probado (caso1-PROD.pdf); link in-app pendiente de E3.
