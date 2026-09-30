# AUDITOR CIEGO — T-VP0067-IMAGENES-UI-20260930

> Dictamen independiente. NO se leyeron `pdf-imagenes-check.md`, `correlacion.md`,
> `regresion.md` ni ningún CIERRE de la tanda. Todo verificado desde el estado final
> real: código del working tree (rama `feat/T-VP0067-IMAGENES-UI-20260930`), GETs a
> Airtable (cero escrituras), tests corridos por el auditor, y análisis propio del PDF
> con pymupdf (conteo de imágenes dibujadas + render a PNG + comparación visual +
> hash MD5 de bytes). Fecha: 2026-09-30.

## Veredicto global

**OK — los 5 criterios pasan.** UI y PDF se alimentan de las MISMAS 16 filas de
`TX_Adjuntos` (16/16 imágenes del PDF byte-idénticas a los `thumbnail_url` de Airtable),
el camino es genérico, y nada se rompió (typecheck limpio, 1054 tests verdes, /lectura
de VP-0067 sin naranjos nuevos, las 8 filas viejas intactas campo a campo).

---

## Criterio 1 — REGISTRO FOTOGRÁFICO ya no en 0 y UI muestra imágenes: **OK**

**Airtable (GET directo, `filterByFormula` solicitud=VP-2026-0067 y subido_por=Tasador):**
- **16 filas** `subido_por="Tasador"` (total solicitud: 24 = 8 Sistema + 16 Tasador).
- IDs idénticos a los 16 de `seed-registros.json`.
- Todas: `tipo_adjunto="foto_interior"`, `estado_extraccion="listo"`, sin `clave_adjunto`,
  `orden` 0..15 sin huecos.
- `descripcion`: 15 son **ids de `CATEGORIAS_FOTO`** (`mapa_ubicacion`, `fachada_exterior`,
  `living_comedor`, `cocina`, `banos`, `habitaciones`) + 1 **custom "Planificación"**
  (la UI soporta custom vía `FotoCategoriaCreator` / `repartirFotos` la bucketiza).
- `thumbnail_url`: **16/16 data-URI válidos** — prefijo `data:image/jpeg;base64,`,
  base64 decodifica, magic bytes JPEG (`FF D8 FF`), longitudes 61.535–93.923 chars
  (todas ≤ 95.000, contrato §4).

**Reparto replicado (`repartirFotos`: descripcion∈ids → predefinida; resto → custom):**

| Categoría | Conteo esperado sección 7 |
|---|---|
| Mapa de Ubicación | 1 |
| Fachada / Exterior | 5 |
| Living / Comedor | 3 |
| Cocina | 1 |
| Baños | 2 |
| Habitaciones | 3 |
| Estacionamientos | 0 (honesto) |
| Ofertas / Comparables | 0 (honesto) |
| Planificación (custom) | 1 |
| **Total** | **16 fotografías** |

**Código nuevo de miniaturas** en `components/tasador/informe-preview.tsx`:
`gruposConFotos()` (solo categorías con fotos, orden catálogo + customs después) +
`FotoMiniatura` (usa `foto.thumbnailUrl` en `<img>`; NUNCA `foto.url` —path Dropbox—;
placeholder `ImageOff` si null), pintadas bajo los contadores de la sección 7.
La página `/tasaciones/[id]/informe/page.tsx` hidrata con `leerFotosCaptura` +
`repartoDeCaptura` (origen `TX_Adjuntos`). Tests corridos:
`components/tasador/informe-preview.test.ts` → **5/5 verdes** (dentro de los 42 verdes
de los 4 archivos de test de la tanda).

## Criterio 2 — PDF muestra las imágenes: **OK**

`vp67-render-imagenes.pdf`: **8 páginas** (= oráculo). Imágenes **dibujadas** por página
(`get_image_info`, no xrefs compartidos):

| Pág | Render | Oráculo | Nota |
|---|---|---|---|
| 1 | 1 | 1 | portada (logo) |
| 2 | 3 | 3 | Hoja 1 |
| 3 | 4 | 24 | Hoja 2: mismas 4 zonas visuales (mapa refs + ref 1-3); el oráculo embebe los escaneos en tiles |
| 4 | 0 | 0 | Hoja 3 (cuadro, sin imágenes) |
| 5 | **8** | **8** | grilla Hoja 4 |
| 6 | **8** | **8** | grilla Hoja 5 |
| 7 | 7 | 16 | Anexo 1 (7 zonas; oráculo tileado) |
| 8 | 6 | 18 | Anexo 2 (6 zonas; oráculo tileado) |

Total dibujadas render: **37 = 20 ranuras fijas + 16 grilla + 1 logo estático** —
ninguna ranura vacía (verificado visualmente en p1, p3, p5, p6, p7, p8 renderizadas a PNG).

**Comparación visual p5-6 vs oráculo p5-6: MISMAS fotos, mismo layout** (p5: mapa +
plano, fachada, sector, living, comedor, cocina, baño visitas; p6: dormitorio ppal,
baño ppal, dormitorio A/B, sala estar, piscina, terraza+quincho, fachada posterior).
Diferencia esperada y correcta: los **captions** del render son labels de
`CATEGORIAS_FOTO` (ver criterio 3), no los del gold master.

## Criterio 3 — UI y PDF correlacionados desde el mismo origen: **OK — 16/16**

- **Mismo conjunto de filas**: la vista filtra `subido_por="Tasador"` (`lectura-fotos.ts:177`)
  → exactamente las 16 sembradas; el bloque 7 filtra `tipo_adjunto` prefijo `foto`
  (`lectura-informe.ts:397`) → exactamente las mismas 16 (ninguna fila Sistema tiene
  `tipo_adjunto` con prefijo `foto`: son `cbr`/`otro`/`cert_no_expropiacion`). Ambos
  lectores derivan la categoría igual: `descripcion || tipo_adjunto`.
- **Mismo campo renderizable**: el bloque 7 proyecta `thumbnailUrl` + `orden`
  (`lectura-informe.ts:570-576`, nuevo) y `resolverImagenes` →
  `grillaDesdeFotosReales` (`lib/informe/imagenes.ts`) construye la grilla ordenando
  por `orden` asc, `url` = `thumbnail_url` (data-URI) con caída a url http(s),
  caption = label de `CATEGORIAS_FOTO` (custom pasa tal cual).
- **Prueba dura**: las 16 imágenes de la grilla del PDF (p5-6) son **byte-idénticas
  (MD5) 16/16** a los `thumbnail_url` leídos de Airtable, casadas 1:1 por orden 0..15.
  Y los captions extraídos del PDF son los labels del catálogo en el orden 0..15
  exacto: p5 = Mapa de Ubicación · Planificación · Fachada / Exterior ×2 ·
  Living / Comedor ×2 · Cocina · Baños; p6 = Habitaciones · Baños · Habitaciones ×2 ·
  Living / Comedor · Fachada / Exterior ×3. Si hubiera corrido el fallback de assets,
  los captions serían los del gold master ("Ubicación", "Sector", "Baño visitas"…) —
  no lo son.
- Las fotos reales mandan ANTES del gate espejo: `if (fotosCanonicas.fotos.length > 0)
  return grillaDesdeFotosReales(...)` precede a todo uso de `ASSETS_POR_CODIGO`.
- Tests corridos: `lib/informe/imagenes.test.ts` → **verdes** (grilla desde fotos
  reales, captions por label, orden con null al final, omisión con warn, tope 16,
  fallback solo con bloque vacío, grilla vacía honesta para otros códigos).

## Criterio 4 — Código GENÉRICO: **OK (con el transitorio declarado)**

- `grep -rn "met6283|MET-6283|assets_met" lib/ components/ app/` (sin tests): en el
  camino de la grilla solo sobrevive `lib/informe/imagenes.ts` —
  `ASSETS_POR_CODIGO['VP-2026-0067']` — marcado "⚠ TRANSITORIO DEL ESPEJO
  (pre-siembra)", gateado por código de solicitud y alcanzable ÚNICAMENTE con bloque 7
  vacío (hoy muerto para VP-0067: hay 16 filas). Cualquier otro código sin fotos →
  grilla vacía honesta + ranuras null (jamás la foto de otra propiedad). Las otras
  menciones (`golden-met6283.ts`, `overrides.ts`, `validador-cifras.ts`, `tipos.ts`)
  son gold-master/overrides fuera del camino de la grilla. Las 20 ranuras fijas siguen
  en fallback espejo: fuera de alcance declarado (plan §3, deuda §4).
- **Labels con fuente única**: los 8 labels existen SOLO en
  `lib/tasador/tasaciones.ts:904-911` (`CATEGORIAS_FOTO`). `imagenes.ts` los deriva
  con `LABEL_POR_CATEGORIA = new Map(CATEGORIAS_FOTO.map(...))`; `informe-preview.tsx`
  itera `CATEGORIAS_FOTO`. Cero strings duplicados en `lib/informe/` y el preview.
- **Cliente nuevo sin tocar código**: `subirFotoDeVisita` genera el thumbnail en el
  navegador (`lib/tasador/thumbnail.ts`, best-effort, techo 95k con escalera
  calidad→resolución, nunca lanza) → `categorizarFoto` manda `thumbnailUrl` en el
  PATCH → la ruta (`fotos/route.ts`) lo valida (`z.string().url()` — verificado con
  zod 4.4.3 del repo: acepta data-URI de 85k chars y rechaza paths) y escribe
  `thumbnail_url` + `descripcion` + `orden` + `tipo_adjunto=foto_interior` +
  `subido_por=Tasador` → bloque 7 lo levanta para CUALQUIER solicitud →
  `grillaDesdeFotosReales` (sin gate de código) → PDF con caption por label. **Sí:
  grilla en UI y PDF sin tocar código.** Único matiz honesto: fotos subidas ANTES de
  esta tanda (thumbnail null, url = path Dropbox) se omiten de la grilla con warn —
  documentado en el propio módulo.

## Criterio 5 — Nada roto: **OK**

- `pnpm typecheck`: **limpio**.
- `pnpm vitest run` (suite completa): **62 files passed | 3 skipped · 1054 tests
  passed | 3 skipped · 0 fallos**.
- **/lectura de VP-0067 replicado** (misma lógica de `lectura/route.ts` +
  `avance-lectura.ts` + satisfacción por-carpeta, contra datos vivos): 24 adjuntos,
  **24 terminales** (`listo` ×24), enCurso 0, conError 0, **completo=true**. Las 16
  fotos sembradas no aportan naranjos (sin `clave_adjunto`, sin `atributos_obtenidos`,
  estado terminal). Naranjos honestos previos **intactos**: 6 datos faltantes en 3
  documentos — CBR+Notaria (inscripción CBR), Superficie Construida+Material
  Predominante+Año (foto fuente SII), Fecha Emisión (TGR, exclusión `fecha_` de la
  regla por-carpeta). **Cero naranjos nuevos.**
- **8 filas viejas intactas**: comparación campo a campo (los 19 fields del snapshot,
  incluida `ultima_modificacion`) de los 8 record IDs contra
  `snap-adjuntos-pre.json` → **0 diferencias**.
- `aligerarCanonico` (ensamblador) solo anula `thumbnailUrl` dentro de
  `canonico.bloques[fotografico]` para no duplicar ~1,3 MB en el payload — la grilla
  ya lleva el data-URI en `fotos.fotos[].url`; forma del bloque conservada.

## Observaciones menores (no bloquean)

1. Plan §3 decía `h4_01_ubicacion.png`; la siembra registra `h4_01_ubicacion.jpg` —
   conversión a JPEG propia del contrato de thumbnail, irrelevante.
2. El soporte `thumbnailUrl` del PATCH ya existía en `fotos/route.ts` antes de la
   tanda (commit `c82b34b`); la tanda cabló el productor (thumbnail en el navegador)
   y los consumidores.
3. La siembra fue por creación directa en Airtable, no por SC-Adjuntos-Upload —
   desviación ya declarada en `rollback.md` §4, con rollback trivial (borrar los 16
   record IDs listados).

**Conteo por categoría (16/16 correlacionadas UI↔Airtable↔PDF):** Mapa de Ubicación 1 ·
Planificación (custom) 1 · Fachada / Exterior 5 · Living / Comedor 3 · Cocina 1 ·
Baños 2 · Habitaciones 3 · Estacionamientos 0 · Ofertas / Comparables 0.

**VEREDICTO: OK en los 5 criterios — origen único real, espejo logrado, genérico, sin regresiones.**
