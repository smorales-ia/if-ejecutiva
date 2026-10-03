# PLAN — T-PLANTILLA-DISENO-FINO-20261001

Cerrar la brecha visual residual entre el PDF generado por la plantilla Carbone v2 y el
PDF ORIGINAL de Value Property (oráculo MET-6283), hasta identidad visual al nivel en que
un tasador no distinga cuál es cuál. Espejo autorizado: VP-2026-0067 (`recmMzeu3eWGxyXsf`).

## §1 Resumen

El PDF tiene **8 páginas** (no 7). Tras la tanda T-PDF-IDENTICO, datos/imágenes/aritmética
ya coinciden con el oráculo; lo que falta es **diseño fino**. El diagnóstico medido descarta
dos "arreglos obvios" que habrían EMPEORADO la fidelidad:

- **La fuente ya coincide.** El PDF original es casi todo **Calibri / Calibri-Bold**; el único
  elemento distinto es **Arial Narrow Bold** en la página 2. El v2 ya renderiza Calibri en las
  8 páginas. Cambiar a Arial globalmente (tentación inicial) habría roto la identidad.
- **El azul claro `#8DB4E2` de las filas "PROMEDIO DE LA MUESTRA" ES correcto**: el oráculo
  también las muestra en celeste. No debe cambiarse a `#095085`.

El azul de banda verdadero del oráculo es **`#095085`** (franja "INFORME DE TASACION",
"ANTECEDENTES", "Fotos de la Propiedad", etiquetas laterales). El v2 ya lo usa en esas bandas.

Las brechas reales son de **marco/encuadre, altos de fila, padding, anchos de caja, pesos de
etiqueta y márgenes de banda** — ajuste fino, página por página.

## §2 Alcance SÍ / NO

**SÍ**: editar `PLANTILLA_MET_v3.docx` (copia de v2); subir v3 a Carbone (templateId nuevo,
no sobrescribe v2); renderizar directo contra Carbone con el payload de VP-0067 y `lang=es-cl`;
comparar hoja por hoja; dejar v3 lista para que Sergio re-apunte E2.

**NO**: tocar los archivos del oráculo; romper los 528 bindings `{d.*}` ni los loops de
imágenes; modificar E1/E2/E3 en Make (veto al clasificador vigente — ver memoria
`make-base-url-incluye-api-v2`); cambiar `.env.local`, Airtable, o datos de VP-0067; commit/push
(lo hace Sergio); cambiar la lógica de cálculo.

## §3 Diff hoja por hoja (priorizado)

| Hoja | Zona | Qué cambia | Impacto |
|---|---|---|---|
| 1 | Logo | Original dentro de **marco azul**; v2 sin marco y logo más grande | ALTO |
| 1 | Etiquetas antecedentes | Original **negrita**, `"X:"`; v2 regular, `"X :"` | MEDIO |
| 1 | Bandas INFORME/ANTECEDENTES | Original con **márgenes laterales** y más altas; v2 a sangre | MEDIO |
| 2 | Caja VALOR TASACION | Proporción/altura de la caja y sub-tabla difieren | ALTO |
| 2 | Altos de fila (tablas OFERTAS/CBR/valoración) | v2 ligeramente más altas → corre el contenido | MEDIO |
| 2 | Elemento Arial Narrow Bold | 1 elemento del oráculo en Arial Narrow; v2 Calibri | BAJO |
| 2 | Mapa referencias | Hueco `mapa.staticMapUrl` (sin Google Static Maps) — difiere por diseño, no por plantilla | (fuera) |
| 3 | Cuadros técnicos | Padding/altos de fila finos | MEDIO |
| 4-5 | Grilla de fotos | Tamaños/bordes/títulos de celda a calibrar | MEDIO |
| 6-7 | Anexos | Encuadre de planos/certificados y títulos | MEDIO |

## §4 Layout del XLSM (fuente de verdad)

Mapeo hoja PDF ↔ hoja Excel (áreas de impresión): Portada+Antecedentes → **pág 1**;
`Impresion` (A1:BW554) → **pág 2** (hoja densa: Identificación, REF.OFERTAS, REF.C.B.R.,
ANALISIS DE RENTABILIDAD, CUADRO DE VALORACION, VALOR TASACION, mapa, 3 fotos ref);
hoja técnica → **pág 3**; `Fotos propiedad` (+2) → **págs 4-5**; `Anexo` (+2) → **págs 6-7**;
cierre → **pág 8**.

Valores medidos:
- **Azul de banda**: `#095085` (575 celdas en Impresion, 245 en Fotos). Confirmado en el render.
- **Celeste destacado (PROMEDIO)**: `#8DB4E2` — correcto, coincide con oráculo.
- **Fuentes**: Arial/Arial Narrow en el Excel, pero el PDF ORIGINAL renderiza **Calibri/Calibri-Bold**
  (verificado con pymupdf sobre el PDF), salvo 1 Arial Narrow Bold en pág 2.
- Logo v2: 3.564.000 × 2.268.000 EMU (≈3,9"×2,48").

## §5 Mapeo plantilla v2 → desviaciones

- `document.xml`: 334 KB, 528 bindings `{d.*}` (456 únicos). Shading: `#D4D4D4`×226 (gris),
  `#8DB4E2`×92 (celeste promedio — OK), `#095085`×20 (bandas), `#00B0F0`×2 (cian — revisar).
- Bandas = tablas de 1 celda `w:shd fill=095085`, texto blanco centrado (sz 36 = 18 pt).
- Antecedentes = tabla 2 col (3855 + 5783 dxa); labels `<w:b w:val="0"/>` (regular) con `"X :"`.
- Logo = `wp:inline` centrado (rId9, imagen embebida — NO binding), sin marco.
- Bordes docx: sz 2 (0,25 pt) `#808080`, sz 4 `#7F7F7F`, sz 6 `#095085`.

## §6 Reglas Carbone/docx seguras

1. **Preservar los 528 `{d.*}`** y los loops `filas[i=…]`. Editar formato (shd/borders/rPr/extent),
   nunca el texto de un binding.
2. **Validar XML bien formado** (`xml.dom.minidom.parseString`) ANTES de subir — un error de
   concatenación produce `w101 "Could not open document"` en Carbone (ocurrió y se corrigió).
3. **Orden de elementos OOXML** en `tblPr` (tblW, jc, tblBorders, tblLayout) y `tblBorders`
   (top,left,bottom,right) es estricto.
4. **Imagen por `r:embed` (rId9)**: preservar la relación; no renombrar media.
5. **Render con `lang: "es-cl"`** (igual que E2) para formato chileno de números
   (`20.125,86`, no `20,125.86`).
6. **Un solo editor del .docx** (regla de colisión): ediciones consolidadas en serie sobre v3.

## §7 Plan de ejecución (OLAS)

- **Ola 1 (ejecutada)**: página 1 — marco del logo + logo −10% + etiquetas negrita/colon.
- **Ola 2 (propuesta)**: página 2 — caja VALOR TASACION, altos de fila, Arial Narrow Bold.
- **Ola 3 (propuesta)**: página 1 bandas con márgenes; páginas 3-8 (cuadros, grilla fotos, anexos).
- **Gate de sincronía**: cada ola se sube a Carbone y se re-renderiza antes de la siguiente;
  se conserva solo lo que mejora la identidad (rollback por fragmento si regresa).

## §8 Batería de tests visuales

- **Regresión de datos** (`regresion.md`): 14 terminales clave presentes con formato chileno,
  0 placeholders `{d.` huérfanos, 8 páginas, `161%` ausente (CI-057 intacto).
- **Bindings** (`bindings-check.md`): 528→528, imagen rId9 preservada.
- **Comparación ocular** lado a lado por hoja (`comparacion-hoja1..8.png`).
- **Guardarraíl** grayscale (tripwire de regresión, no veredicto).
- **Auditor ciego** independiente (`auditor.md`): % de identidad por hoja.
- **Criterio de HECHO**: identidad ≥ 98% con auditor ciego conforme. Si < 98% → DETENER y
  reportar a Sergio (así lo exige el Bloque 4).

## §9 Riesgos y rollback

- Riesgo: XML malformado → `w101`. Mitigado: validación previa + render de prueba.
- Riesgo: romper binding/loop. Mitigado: solo se editan atributos de formato; conteo 528 verificado.
- Riesgo: edición a ciegas que empeora (demostrado 2×). Mitigado: render+comparación por ola.
- Rollback: `rollback.md`. v2 intacta; `.env.local`/Make/Airtable sin tocar; templateId v3 caduca solo.

## §10 GATES

- **G1 credenciales OK** — PASS (Carbone POST /template + /render 200 reales).
- **G2 PDF línea base** — PASS (`smoke-v2.pdf`, render directo del v2).
- **G3 diff hoja por hoja** — PASS (§3).
- **G4 layout XLSM sin ambigüedad** — PASS (§4, con la corrección fuente/colores).
- **G5 reglas Carbone claras** — PASS (§6).
- **Gate de HECHO (Bloque 4)**: depende del auditor ciego; si < 98% → DETENER para decisión de Sergio.
