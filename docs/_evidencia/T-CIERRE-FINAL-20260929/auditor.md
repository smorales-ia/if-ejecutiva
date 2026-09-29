# Auditoría ciega — T-CIERRE-FINAL-20260929

**Auditor:** agente independiente (sin lectura de regresion.md, diseno-checklist.md,
genericidad-check.md, imagenes-check.md, rollback*.md, harness-motor-output.txt ni
tests-output.txt de esta tanda). Toda cifra de este informe fue recalculada por el
auditor desde el estado final: PDF v3, PDF de referencia, Airtable vivo (REST, solo
lectura), Make (API, solo lectura), Carbone (descarga del template desplegado) y código
del repo. Fecha: 29-sep-2026.

## Metodología

1. **Pixel-diff propio** (no se usaron los PNG de la carpeta): rasterización de ambos
   PDFs a 100 dpi con pymupdf 1.28.2, conversión a escala de grises, diff por píxel con
   umbral >30 niveles, en dos variantes: cruda y *best-shift* (búsqueda del
   desplazamiento dy∈[-15,15] dx∈[-9,9] px que maximiza la coincidencia, para no
   castigar corrimientos globales).
2. **Posiciones de bloques p1**: `search_for` de 13 rótulos en ambas p1 y comparación
   de coordenadas (x,y) en puntos PDF.
3. **Paridad de contenido**: (a) muestra de 22 literales del PDF de referencia buscados
   en el texto completo del v3; (b) recall de tokens REF→GEN por página (Counter con
   multiplicidad).
4. **Genericidad**: inspección de `word/media` del DOCX vía zipfile, lectura de
   `lib/informe/imagenes.ts`, `lib/informe/overrides.ts`, `lib/informe/ensamblador.ts`,
   `app/api/tasaciones/[id]/generar-pdf/route.ts` y grep de hardcodes en `lib/` y `app/`.
5. **Fix motor**: GET REST de las 4 filas de `C_Formulas`, GET de los 7
   `TX_Comparables` de VP-2026-0067 y recálculo en python desde los datos crudos;
   query filtrada de `A_DecisionesMotor` y verificación de timestamps de `TX_Calculos`.
6. **Pipeline**: GET `/scenarios` y `/scenarios/5750023/blueprint` de Make (solo
   lectura); descarga del template desplegado desde api.carbone.io y diff interno
   (hash por entrada del ZIP + SequenceMatcher sobre `word/document.xml`); `curl -sIL`
   sobre el `url_pdf` vigente.

Ambos PDFs tienen 8 páginas, mismo tamaño A4 (595.3×841.9 pt) y correspondencia 1:1 de
páginas verificada por texto.

---

## Criterio 1 — Igualdad Hoja 1 (página 1): **OK (≈92%)**

| Métrica | Valor |
|---|---|
| Igualdad píxel cruda (umbral >30) | **91,86 %** |
| Igualdad píxel best-shift (dy=3px, dx=0) | **92,05 %** |
| Recall de contenido REF→GEN | **100 %** (51/51 tokens) |

Posiciones de rótulos (GEN−REF, en pt; 1 pt = 0,353 mm): |dy| medio 7,5 pt, |dy| máx
22,4 pt. Lo que difiere aún:

- **Recuadro del logo**: la referencia enmarca el logo en un rectángulo azul; el
  generado no lo dibuja.
- **Tabla ANTECEDENTES más ancha**: la columna de rótulos del generado arranca en
  x=62,8 vs x=123,0 en la referencia (≈21 mm más a la izquierda).
- **Banner "ANTECEDENTES"**: tipografía menor/menos bold en el generado (dx=13 pt en el
  arranque del texto).
- Rótulos con espacio antes de los dos puntos ("Numero Solicitud :" vs
  "Numero Solicitud:").
- Corrimientos verticales de 3–10 pt en todos los bloques (el título 5,9 pt más arriba).

**Dictamen: igualdad de Hoja 1 ≈ 92 %** — estructura, datos y paleta idénticos;
restan las 4 diferencias de trazo/posición listadas.

## Criterio 2 — Igualdad global p1..p8: **OK en datos · PARCIAL en píxel (≈73%)**

Pixel-diff por página (best-shift @100 dpi, umbral >30):

| p1 | p2 | p3 | p4 | p5 | p6 | p7 | p8 | media |
|---|---|---|---|---|---|---|---|---|
| 92,05 | 55,52 | 80,68 | 71,07 | 74,93 | 72,59 | 70,05 | 67,56 | **73,06 %** |

(cruda sin shift: media 70,82 %). Recall de contenido global REF→GEN: **79,0 %**
(p1/p5/p6/p7 = 100 %; p2 = 74,8 %; p4 = 78,1 %).

Muestra de 22 literales de la referencia buscados en el v3: **21/22 presentes**,
incluyendo los 5 obligatorios: `-3%` ✓ · `36%` ✓ · `33,64` ✓ · `24,08` ✓ · `890,33` ✓,
más `METLIFE -6283`, `FRANCISCO JOSÉ VERGARA UNDURRAGA`, `16.610.203-0`,
`LOS EUCALIPTUS`, `LAS BRISAS DE CHICUREO`, `Colina`, `Metropolitana de Santiago`,
`MONICA REYES PINTO`, `2024`, `70`, `DFL-2`, `Terraza + Quincho`,
`Fachada posterior - Patio trasero`, `RECEPCION FINAL`, `NO EXPROPIACIÓN SERVIU`,
`www.valueproperty.cl`. También verifiqué `32,64` (UF/m² tasación) en contexto correcto.
El único fallo es de **formato, no de dato**: la referencia imprime `5.077,00` y el
generado `5.077` (los decimales `,00` se omiten en la tabla de comparables; afecta a
varias celdas: 5.000/5.001/5.012/5.013/5.051 idem).

Qué explica el ~27 % de píxel restante (verificado mirando p2/p4 lado a lado):

1. La referencia nace de Excel con tipografías/celdas distintas — el generado replica
   estructura y datos con otra métrica tipográfica; en páginas densas (p2: 55,5 %) el
   diff píxel castiga cada celda corrida.
2. **Textos narrativos IA distintos del gold master**: la descripción del sector de la
   Hoja N°1 dice en la referencia "El sector es de carácter mixto…" y en el generado
   "El sector corresponde a una zona rural…"; el párrafo descriptivo con
   "closet/antejardín/bodega…" de la referencia no aparece literal.
3. Formato de decimales en tablas (punto 1 del párrafo anterior).
4. Recompresión JPEG y encuadres levemente distintos en las páginas de fotos (p5–p8).

**Dictamen: igualdad global ≈ 73 % en píxel · paridad de datos clave completa
(21/22 literales, 5/5 obligatorios).**

## Criterio 3 — Genericidad: **OK**

- (a) **PLANTILLA_MET_v2.docx** embebe exactamente 2 medias: `word/media/image1.png`
  (29.472 bytes — logo) y `word/media/image2.png` (255 bytes — placeholder gris). Sin
  fotos de la propiedad. ✓
- (b) **Assets gated**: `lib/informe/imagenes.ts` resuelve assets solo vía
  `ASSETS_POR_CODIGO = { 'VP-2026-0067': 'docs/_artefactos/carbone/assets_met6283' }`;
  cualquier otro código recibe `null` en cada ranura (`RANURAS_VACIAS`) y solo
  sobreviven adjuntos con URL http(s) propia. `lib/informe/overrides.ts` aplica el JSON
  solo si `json.codigo === contexto.meta.codigo` (el JSON declara
  `"codigo": "VP-2026-0067"`). Ambos invocados desde `ensamblador.ts`
  (líneas 447 y 665). ✓
- (c) **Grep de hardcodes** en `lib/` y `app/` (excluyendo tests): las únicas
  referencias a MET-6283/VP-2026-0067 son las dos tablas gated anteriores, comentarios,
  y `golden-met6283.ts`, que **solo** importa `ensamblador.test.ts` (fixture de test,
  fuera del camino productivo). La ruta `generar-pdf/route.ts` no menciona el caso. ✓

**Dictamen: otra solicitud NO puede salir con fotos ni datos de MET-6283** — recibiría
ranuras vacías y su propio contexto. (Nota honesta: tampoco saldría con fotos propias
todavía: el mecanismo de captura para el flujo vivo está declarado pendiente en el
propio `imagenes.ts`.)

## Criterio 4 — Fix motor: **OK**

Las 4 filas leídas por REST el 29-sep (todas `activa: True`, `ultima_modificacion`
2026-09-29T15:17Z) coinciden **carácter a carácter** con §2 de
`fix-motor-preparado.md` (tanda anterior):

| Fila | nombre · versión | expresión (verificada) |
|---|---|---|
| `recFcpOeKjXNunBlj` | F_UFm2_promedio v3.3 | `n_ofertas > 0 ? promedio_uf_m2_ofertas : (n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna)` |
| `recliyqVJAGatkDw0` | F_DesviacionVsPromedio v2.0 | `(n_ofertas > 0 && promedio_uf_m2_ofertas > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_ofertas - 1) * 100 : 0` |
| `recJvE7OEFjVoPbKN` | F_DesviacionVsPromedioCBR v1.0 · orden 91 | `(n_cbr > 0 && promedio_uf_m2_cbr > 0 && uf_m2_construccion_tasacion > 0) ? (uf_m2_construccion_tasacion / promedio_uf_m2_cbr - 1) * 100 : 0` |
| `recRN9jkhgc6UvfIR` | F_UFm2_promedio_CBR v1.0 · orden 2 | `n_cbr > 0 ? promedio_uf_m2_cbr : 0` |

**Recálculo independiente** desde los 7 `TX_Comparables` reales de VP-2026-0067
(5 Ofertas `uf_m2_construccion_f` = 34,05 · 35,19 · 35,71 · 31,45 · 31,82; 2 CBR =
25,18 · 22,99; homologación re-derivada: (precio − terreno×UF/m²T − OO.CC)/sup.constr
reproduce 34,05 en el comp-01):

- `promedio_uf_m2_ofertas` = **33,6440** → imprime **33,64** ✓
- `promedio_uf_m2_cbr` = **24,0850** → imprime **24,08** ✓
- desviación ofertas = 32,64/33,644 − 1 = **−2,98 %** → imprime **−3 %** ✓
- desviación CBR = 32,64/24,085 − 1 = **+35,52 %** → imprime **36 %** ✓

Las expresiones aplicadas producen exactamente los números del PDF. **AT03 sin
encender**: `A_DecisionesMotor` filtrada por `{solicitud_codigo}="VP-2026-0067"` →
**0 filas** (el campo existe y devuelve filas para otros códigos, o sea el 0 es real);
las filas `TX_Calculos` de la solicitud tienen `ultima_modificacion` 27-sep (ninguna
posterior al patch de las fórmulas del 29-sep 15:17Z). El estado on/off de la
automation en sí no fue verificable directamente (el MCP devolvió
INVALID_PERMISSIONS para `list_automations`); toda la evidencia indirecta es
consistente con AT03 apagada.

## Criterio 5 — Estado pipeline: **PARCIAL**

**E2 → template**: Make respondió (solo lectura). `E2_Carbone_Render v2.1 -
InformeContexto` (5750023) está **ACTIVO** y su blueprint rinde contra
`api.carbone.io/render/517ddc62…c14434d` — mismo ID que `CARBONE_TEMPLATE_ID` de
`.env.local`. Descargué ese template desde Carbone (HTTP 200, 80.505 bytes) y lo
comparé con el repo: **es la familia v2** — 18/19 entradas internas del ZIP idénticas a
`PLANTILLA_MET_v2.docx` y `word/document.xml` 99,91 % igual; contra
`PLANTILLA_MET_v1.docx` el ratio es 0,32 (y difiere también `styles.xml`). ✓ apunta al
template nuevo. **Reserva**: el DOCX del repo (regenerado hoy 12:18) difiere del
desplegado en una micro-iteración (una decena de valores de espaciado y un párrafo
vacío) — repo y Carbone no están byte-sincronizados; el último retoque local no está
subido (o el desplegado tiene un ajuste que el generador local no reproduce).

**Link del PDF**: la fila vigente de `TX_DocumentosGenerados` (`rec2iw3c9ft5d1TXR`,
`es_vigente: True`, `plantilla_version: PLANTILLA_MET_v2`) y `pdf_final_url` de la
solicitud llevan a `https://www.dropbox.com/home/VProperty/Tasaciones?preview=…`.
`curl -sIL` → redirige a `dropbox.com/login?cont=…` (página de login, HTTP 200 sobre
/login). **NO abre sin sesión** — es un link interno `/home`, no un share-link. El
propio nombre del escenario E3 lo declara: "sin share-link: scope pendiente".
E3 (5791413) también ACTIVO.

---

## Veredicto final

| # | Criterio | Dictamen |
|---|---|---|
| 1 | Igualdad Hoja 1 (p1) | **OK · ≈92 %** |
| 2 | Igualdad global p1..p8 | **OK en datos (5/5 obligatorios, 21/22 muestra) · píxel ≈73 %** |
| 3 | Genericidad | **OK** |
| 4 | Fix motor | **OK** |
| 5 | Estado pipeline | **PARCIAL** (template v2 ✓ · link con login ✗ · repo/Carbone no byte-sync) |

**APTO PARA CIERRE, con tres condiciones declaradas antes de dar el pipeline por
production-ready:**

1. **Share-link público pendiente**: `pdf_final_url`/`url_pdf` exigen login de Dropbox
   (scope `sharing.write` de E3 pendiente). Quien reciba el link hoy no ve el PDF.
2. **Sincronizar plantilla repo ↔ Carbone**: subir la última iteración de
   `PLANTILLA_MET_v2.docx` (12:18) al template `517ddc62…` o regenerar el DOCX del repo
   desde el desplegado; hoy difieren en una micro-iteración de espaciado.
3. **Registrar que la igualdad es de datos, no pixel-perfect**: ≈73 % global de píxel
   por métrica tipográfica distinta al Excel de origen, decimales `,00` omitidos en las
   tablas de comparables y textos narrativos IA que no citan literalmente el gold
   master (p. ej. descripción del sector). Si el estándar comprometido fuese
   pixel-perfect en p2–p8, esos tres frentes son el trabajo restante.

Sin secretos en este documento: tokens usados solo en runtime del auditor, nunca
impresos.
