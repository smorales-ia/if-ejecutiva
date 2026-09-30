# ROLLBACK — T-VP0067-IMAGENES-UI-20260930

> Bloque 0. Snapshot ANTES de tocar nada. Fecha: 2026-09-30. Rama feat creada desde
> `main` = `4959cc2` (incluye ya los merges de las tandas LECTURA-FIX).

## 1 · Datos (producción)

- `TX_Adjuntos` de VP-2026-0067: **8 filas**, todas `subido_por="Sistema"`, todas con
  `thumbnail_url` vacío — snapshot completo en [`snap-adjuntos-pre.json`](snap-adjuntos-pre.json).
- REGISTRO FOTOGRÁFICO en /informe: **"0 fotografías"**, 8 contadores en 0 (consistente con
  0 filas `subido_por="Tasador"`).
- La siembra de la OLA 1 (agente D) **solo CREA filas nuevas** en `TX_Adjuntos` (las 16 fotos
  de la grilla). Revertir = borrar exactamente esas filas (IDs quedarán listados en
  `seed-registros.json` al ejecutarse). **Ningún campo de las 8 filas existentes se toca.**
- `pdf_final_url` / `TX_DocumentosGenerados`: NO se tocan en esta tanda (E3 detenido; el PDF
  se valida por Carbone API directa sin escribir producción).

## 2 · Código (original en `4959cc2`)

Archivos a tocar (una versión completa nueva por archivo; revertir = `git checkout 4959cc2 -- <ruta>`):
- `components/tasador/informe-preview.tsx` (A: miniaturas sección 7)
- `lib/informe/imagenes.ts` y `lib/informe/ensamblador.ts` (B: grilla desde origen)
- `lib/tasador/lectura-informe.ts` sólo si B necesita proyectar thumbnail/orden en el bloque 7
- `lib/tasador/fotos.ts` + `app/api/tasaciones/[id]/fotos/route.ts` + nuevo util de thumbnail
  (C: fuente renderizable al subir)
- tests co-ubicados de los anteriores

## 3 · Referencia de campos (verificados vía Meta API en Bloque 0)

`TX_Adjuntos` (`tblur71x1oItbmKZc`): `thumbnail_url` **url** `fld3AAAV0P496yZP0` ·
`url_dropbox` url `fldEccoUrOjV7oKZ5` · `descripcion` singleLineText `fldsG18353kHMw0yQ` ·
`orden` number `fld0t0ytqAkd3bzvd` · `subido_por` singleSelect `fldqAZk4Jf0C5Z4uH` ·
`tipo_adjunto` singleSelect `fld1ocY8ug1vzBQsj` · `estado_extraccion` singleSelect `fld54epvDJ7YdJIYD`.

## 4 · Desviación registrada respecto del plan §5

La siembra NO va por el webhook SC-Adjuntos-Upload sino por **creación directa de filas en
Airtable** (mismo mecanismo con que se sembró el espejo original "Sistema"): un solo escritor,
sin efectos colaterales de Make (dedup, logs, RF-09), y rollback = borrar las filas creadas.
El binario renderizable viaja en `thumbnail_url` (data-URI, contrato §4 del plan); el pipeline
real de subida (P2) queda para los tasadores vivos.
