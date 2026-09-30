# Genericidad del camino de imágenes — T-PDF-E3-GENERICOS-20260930

**Verificador (Bloque 2 · Frente B) · 30-sep-2026.**

## (a) Grep de hardcodes por caso

`grep -rn "met6283\|VP-2026-0067\|ASSETS_POR_CODIGO" lib/ components/ app/` — 6 hits, todos
clasificados. **Ninguno vivo en el camino de imágenes.**

| Hit | Clasificación |
|---|---|
| `lib/informe/ensamblador.test.ts:62` (`import { GOLDEN_MET6283 } from './golden-met6283'`) | **Test/fixture** — golden de cifras del gold master; no participa en runtime. Aceptable. |
| `lib/informe/overrides.ts:7` y `:10` (comentario) y `:24` (`RUTA_OVERRIDES = 'docs/_artefactos/carbone/overrides_met6283.json'`) | **Overrides de TEXTOS, vivo pero fuera del camino de imágenes** — ver análisis abajo. Aceptable documentado. |
| `lib/tasador/motor-at01-at08-integ.test.ts:105` (`claveNotif("VP-2026-0067", …)`) | **Test** — literal de fixture. Aceptable. |
| `app/api/tasaciones/[id]/generar-pdf/route.test.ts:28` (`const CODIGO = 'VP-2026-0067'`) | **Test** — literal de fixture. Aceptable. |
| `ASSETS_POR_CODIGO` | **0 hits** — el fallback por-código a assets del repo fue eliminado del camino vivo, como declara la tanda. |

Análisis del único hit vivo (`lib/informe/overrides.ts`):

- Es el mecanismo puente de T-PDF-IDENTICO-20260927 para datos **sin columna en Airtable**
  (textos/cualitativa). Se aplica al final del ensamblado (`ensamblador.ts:706`) y **sólo si
  `codigo` del JSON coincide** con la solicitud (`overrides.ts:70`); cualquier otra
  solicitud queda intacta (sin archivo → no-op, `overrides.ts:65-67`).
- Inspección del JSON real (`docs/_artefactos/carbone/overrides_met6283.json`): claves top
  de `contexto` = `partes · rentabilidad · textosIA · recintos · cualitativa`. **No contiene
  `imagenes` ni `fotos`**, y `partes.tasador` sólo trae `nombre` (el deep-merge conserva
  `firmaUrl`). Las 20 ranuras y la grilla NO pasan por overrides.
- ⚠ Nota de riesgo residual (no bloqueante): por diseño `aplicarOverridesLocales` hace
  merge sobre TODO el contexto, así que un futuro editor del JSON *podría* agregarle una
  clave `imagenes`. Hoy no la tiene; queda anotado como candado a vigilar en el cierre del
  mecanismo puente.
- `docs/_artefactos/carbone/assets_met6283/` sigue existiendo como **artefacto de
  documentación**: `grep -rn "assets_met6283" lib/ app/ components/` = **0 hits** — ningún
  código lo lee.

## (b) Revisión completa de `lib/informe/imagenes.ts`

Leído íntegro (313 líneas). Confirmado:

- **Cero dependencia del código de solicitud**: el parámetro `codigo` de
  `resolverImagenes`/`grillaDesdeFotosReales` se usa ÚNICAMENTE en dos `console.warn`
  (líneas 207-212, 229-232) como contexto de log. Ninguna rama condiciona por código.
- **Cero disco / cero red**: los únicos imports son `CATEGORIAS_FOTO` (labels, RO-05) y
  tipos (líneas 41-42). No hay `fs`, `path`, `fetch` ni URLs fijas. Funciones puras, como
  declara la cabecera.
- Las 6 ranuras fotográficas se resuelven por categoría + posición (`RANURAS_FOTO`,
  50-59), las 13 de anexo por `clave_adjunto` = código `D_TipoDocumento`
  (`RANURAS_ANEXO`, 85-103 — constante compartida UI/PDF), la firma llega ya resuelta
  como parámetro (`M_Tasadores.firma_url`). Ranura sin fuente → `null` (vacío honesto,
  nunca imagen ajena): `resolverAnexos` 160-173 y `fotoRanura` 273-276.
- `fuenteRenderizable` (149-151) sólo admite `https?://` o `data:image/` — un path
  Dropbox interno no pasa.

## (c) Simulación: cliente/solicitud nueva — vía de aporte de cada elemento (sin código)

| Elemento (ranuras) | Vía de aporte | Punto de subida (archivo:línea) |
|---|---|---|
| Fotos `mapa_ubicacion`, `fachada_exterior`, `mapa_referencias`, `ofertas_comparables` (ranuras mapaUbicacion · fachada · refMapa · ref1-3) + grilla de 16 | El tasador sube fotos por categoría en el organizador; la categoría (id del catálogo `CATEGORIAS_FOTO`, `lib/tasador/tasaciones.ts:913-919`) viaja a `TX_Adjuntos.descripcion` y la posición a `orden` | `components/tasador/fotos-categorizadas.tsx:264-269` (`onAgregar(categoria, file)`) → `app/api/tasaciones/[id]/fotos/route.ts:278` (`descripcion: d.categoria`) y `:282` (`orden`) |
| 13 anexos documentales (anexo1* · anexo2*) | Checklist documental de la solicitud: cada archivo se sube declarando su tipo `D_TipoDocumento`; SC-Adjuntos-Upload persiste `clave_adjunto` + `thumbnail_url` en `TX_Adjuntos` | `components/console/document-checklist.tsx:260` (`tipo_documento: item.codigo`) vía `lib/adjuntos-uploader.ts:128` y `:197` (`tipo_documento` en el POST de upload) |
| Firma (ranura firma) | Dato de perfil del tasador: `M_Tasadores.firma_url` (data-URI o https), leído una vez por solicitud | Sin UI de subida hoy — se carga en el perfil del tasador en Airtable. La UI lo declara honesto: `components/tasador/informe-preview.tsx:820-823` («Sin firma registrada aún. Se agrega desde tu perfil de tasador.»). Ningún Route Handler escribe `firma_url` (grep en `app/api` = 0 hits) |

Conclusión (c): toda ranura tiene una vía de aporte genérica que existe hoy para cualquier
solicitud; la única sin UI propia es la firma, que es un dato de perfil por-tasador (se
carga una vez, no por solicitud) — vacío honesto mientras no esté.

## Veredicto

**OK — el camino de imágenes es genérico.** Sin hardcode por caso en el camino vivo, sin
lecturas de disco, y con vía de aporte real para cada uno de los 20 elementos.
