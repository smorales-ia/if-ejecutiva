# CIERRE — T-VP0067-IMAGENES-UI-20260930

> Imagen → UI (con categoría) → PDF desde un origen único y genérico. Fase 1 (plan, 6 agentes)
> + Gate G1-G5 PASA + Fase 2 (olas paralelas). Rama: `feat/T-VP0067-IMAGENES-UI-20260930`
> (sin commit/push — los hace Sergio). Plan: `docs/_planes/PLAN_T-VP0067-IMAGENES-UI-20260930.md`.

## Resultado por pieza

| Pieza | Estado | Detalle |
|---|---|---|
| Fase 1 + Gate | ✅ | Causa raíz: tres orígenes divergentes (vista: `subido_por="Tasador"` → 0 filas; canónico: `tipo_adjunto` prefijo foto → 0; PDF: bypass local `ASSETS_POR_CODIGO`). Gate PASA con salvedad E3 |
| P1 MOSTRAR (agente A) | ✅ | Miniaturas + contadores en sección 7 (`informe-preview.tsx`: helper puro `gruposConFotos` + `FotoMiniatura` con placeholder) |
| P3 PLANTILLA (agente B) | ✅ | Grilla 16 desde el origen único (`lib/informe/imagenes.ts`), captions = labels de `CATEGORIAS_FOTO`, orden por `orden`; match-por-caption (bug latente) eliminado; fallback repo SOLO transitorio del espejo sin fotos; `lectura-informe.ts` proyecta `thumbnail_url`/`orden` |
| P2 INGRESAR (agente C) | ✅ | `lib/tasador/thumbnail.ts` (data-URI JPEG ≤95k al subir, nunca rompe la subida) + `fotos.ts` lo persiste en el PATCH de categorización; route sin cambios (zod acepta data-URI — verificado empírico) |
| Siembra VP-0067 (D) | ✅ | 16 filas nuevas en `TX_Adjuntos` (recompresión PIL escalonada), reparto exacto del plan; las 8 filas viejas intactas (0 diffs) |
| Fix de peso (OLA 2) | ✅ | Contexto 6,19 MB → **3,62 MB** (< 5 MB webhook): grilla sin `thumbnailUrl` duplicado + `aligerarCanonico()` |
| Render real | ✅ | Carbone API directa, plantilla v2 de producción: 37 imágenes colocadas, layout 1/3/4/0/8/8/7/6 = oráculo · `vp67-render-imagenes.pdf` |
| Auditor ciego | ✅ **OK 5/5** | 16/16 correlacionadas (MD5 byte-idénticas Airtable↔PDF), captions genéricos (fallback NO corrió), código genérico, nada roto → `auditor.md` |
| Regresión | ✅ | 1054 tests · build limpio · /lectura 24/24 terminales, 0 naranjos nuevos (los 6 honestos intactos) · `pdf_final_url` no tocado |

## Conteos finales del REGISTRO FOTOGRÁFICO (UI y PDF, mismo origen)

**16 fotografías** — Mapa de Ubicación 1 · Planificación (custom) 1 · Fachada/Exterior 5 ·
Living/Comedor 3 · Cocina 1 · Baños 2 · Habitaciones 3 · **Estacionamientos 0 y
Ofertas/Comparables 0 (honestos: el gold master no tiene fotos en esos buckets — las
comparables viven en sus ranuras propias de Hoja 2)**.

## Qué quedó genérico y qué queda como deuda

- ✅ Genérico hoy: un tasador de CUALQUIER cliente sube fotos por categoría en
  `/tasaciones/[id]/fotos` → miniaturas en la vista, contadores reales y grilla del PDF sin
  tocar código (la fuente renderizable viaja en la fila).
- ⏳ Deuda (aprobaciones de Sergio, plan §4): las 20 ranuras fijas (mapas H1/H2, refs, anexos,
  firma) siguen del fallback espejo para VP-0067 — genérico requiere códigos nuevos en
  `D_TipoDocumento` + logo/firma por-entidad + lectura Dropbox server-side (credencial).
- Nota espejo: los captions de la grilla ahora son los labels de la UI ("Fachada / Exterior")
  y no los textos por-foto del gold master ("Sector") — consecuencia del contrato genérico.

## Pasos manuales (Sergio)

1. **Commit + push / merge a main** de `feat/T-VP0067-IMAGENES-UI-20260930` → Railway
   despliega (miniaturas + grilla desde origen + thumbnail al subir).
2. **Make · E3 (5791413)**: limpiar la ejecución en cola y reactivar; decidir manejo del 409
   del share-link antes del próximo re-render (hoy cada re-emisión del mismo PDF lo tumba).
3. Ver la vista: login **nutricionsaludketo@gmail.com** →
   https://if-ejecutiva-production.up.railway.app/tasaciones/recmMzeu3eWGxyXsf/informe
   (los contadores ya deberían verse con datos ANTES del deploy — son datos; las miniaturas
   y la grilla nueva del PDF requieren el deploy).

## Rollback

- Datos: borrar los 16 records listados en `seed-registros.json` (nada más se escribió).
- Código: `git checkout 4959cc2 -- <archivos>` (lista en `rollback.md`).
