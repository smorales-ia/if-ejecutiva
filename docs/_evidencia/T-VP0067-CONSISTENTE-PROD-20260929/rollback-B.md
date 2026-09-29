# Rollback B — Adjuntos + Extracción (VP-2026-0067)

Tanda T-VP0067-CONSISTENTE-PROD-20260929 · FASE 2 · Agente B (OLA 1)
Fecha de ejecución: 2026-09-29 · Base `app9G7lLkIV3CpeLa` · Tabla `TX_Adjuntos` (`tblur71x1oItbmKZc`)

## Operación ejecutada

Un único PATCH batch (8 records) a
`https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblur71x1oItbmKZc`
con `{"records":[{"id":…,"fields":{…}}×8]}`, sin `typecast`.

**Respuesta HTTP: 200** — los 8 records aceptados en una sola llamada
(2026-09-29T23:04:55Z según `ultima_modificacion` post-patch). Verificación
posterior: GET individual de los 8 records — todos los valores confirmados.

Estado "antes" tomado de `snap-pre-adjuntos.jsonl` (snapshot pre-cambio de esta
misma tanda). En los 8 records, TODOS los campos de metadatos escritos estaban
**vacíos (ausentes del record)** antes del patch, salvo donde se indica.

Para revertir: PATCH batch con los valores de la columna "antes"
(campo vacío → enviar `null` para limpiarlo).

## D1 — Metadatos (los 8 records)

Campos escritos en cada record: `nombre_archivo`, `tipo`, `tipo_adjunto`,
`tamanio_kb`, `orden`, `descripcion`, `subido_por`, `subido_en`.
Antes = vacío en los 8 para todos estos campos. Después:

| record | clave_adjunto | orden | nombre_archivo | tipo | tipo_adjunto | tamanio_kb | descripcion |
|---|---|---|---|---|---|---|---|
| rec95X1HPJB7ZUo5G | permiso_edificacion | 1 | permiso_edificacion_Met6283.pdf | Permiso edificacion | otro | 79 | Permiso de edificación |
| recWdb4FAphNaTE0I | foto_fuente_sii | 2 | foto_fuente_sii_Met6283.jpg | sii | otro | 58 | Foto fuente SII |
| rectcojWwOIonkQRA | foto_ofertas_comparables | 3 | foto_comparables_Met6283.jpg | Otro | otro | 138 | Foto ofertas comparables |
| rechQjmqpb3HMWyeb | certificado_deuda_tgr | 4 | certificado_deuda_tgr_Met6283.pdf | Otro | otro | 57 | Certificado de deuda TGR |
| rectCtwDMT2mwN4GO | certificado_recepcion_final | 5 | certificado_recepcion_final_Met6283.pdf | Recepcion final | otro | 81 | Certificado de recepción final |
| reckRZ0e9mwtR6xCC | consulta_antecedentes_bien_raiz | 6 | consulta_antecedentes_bien_raiz_Met6283.pdf | sii | otro | 82 | Consulta antecedentes bien raíz (SII) |
| recpI0wPyESJ0Etvs | informe_no_expropiacion_serviu | 7 | informe_no_expropiacion_serviu_Met6283.pdf | Otro | cert_no_expropiacion | 62 | Informe de no expropiación SERVIU |
| rec7t6MPxKu10WniF | inscripcion_dominio_cbr | 8 | inscripcion_dominio_cbr_Met6283.docx | Certificado dominio | cbr | 164 | Inscripción de dominio CBR |

Comunes a los 8: `subido_por = Sistema` (antes vacío) · `subido_en =
2026-09-22T02:08:47.000Z` (antes vacío; igual a `fecha_subida` del record).

Criterios de valor:
- `nombre_archivo`: basename real de `url_dropbox` del propio record (snapshot).
- `tamanio_kb`: `round(bytes/1024)` del archivo homólogo en
  `docs/_referencias/Met_6283/` (mapeo 1:1 inequívoco por nombre; ver nota N3).
- `tipo` (select legado, etiquetas de display) y `tipo_adjunto` (vocabulario
  nuevo que lee `app/api/tasaciones/[id]/expediente/route.ts` y
  `lib/informe/ensamblador.ts`): sólo opciones ya existentes del select, sin
  `typecast`. Ningún adjunto lleva `tipo_adjunto` `foto_*` a propósito: las dos
  "fotos" son capturas de datos (SII / comparables), no registro fotográfico, y
  `lectura-informe`/`ensamblador` clasifican por `startsWith('foto')`.
- `mime_type`: NO se escribió — ya estaba poblado y correcto en los 8 (snapshot).

## D2 — Desatascar extracción (rec7t6MPxKu10WniF)

| campo | antes | después |
|---|---|---|
| estado_extraccion | `extrayendo` (desde 22-sep) | `listo` (opción válida del select: idle · extrayendo · listo · error · skipped · no_corresponde · delegado_visador) |
| atributos_obtenidos | vacío | JSON formato idéntico al de los otros records (`{"items":[…],"no_extraidos":[…]}`): foja_cbr `"13291"` · numero_cbr `"21565"` · ano_inscripcion_cbr `2006`, confianza 1, fila 1; `no_extraidos` = los 9 codigo_atributo restantes de `atributos_esperados` del propio record (vendedor, nombre_propietario, notaria, comprador, superficie_servidumbre_m2, fecha_inscripcion, nombre_cbr, repertorio, comuna) |

Los `codigo_atributo` se tomaron de `atributos_esperados` del record
(foja_cbr text · numero_cbr text · ano_inscripcion_cbr number → 2006 numérico).

## Notas / divergencias de schema

- **N1** — Existen los dos selects de tipo: `tipo` (`fldUYBO3LeOHxiIGW`, legado)
  y `tipo_adjunto` (`fld1ocY8ug1vzBQsj`, vocabulario nuevo). Se poblaron ambos.
  `tipo_adjunto` no tiene opción para permiso de edificación, recepción final,
  deuda TGR ni fuente SII → se usó `otro` sin forzar opciones nuevas.
- **N2** — `tamanio_kb` y `orden` tienen `precision: 0` → se escribieron enteros.
- **N3** — Los archivos Dropbox de las fotos terminan en `.jpg` minúscula
  (`foto_fuente_sii_Met6283.jpg`, `foto_comparables_Met6283.jpg`) mientras los
  locales de `docs/_referencias/Met_6283/` usan `.JPG`; y el de comparables se
  llama `foto_comparables_…` aunque la `clave_adjunto` es
  `foto_ofertas_comparables`. `nombre_archivo` sigue al path Dropbox real.
  El mapeo local para el tamaño fue inequívoco igual (8 archivos, 8 nombres
  homólogos).
- **N4** — El MCP Airtable devolvió `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND` al
  intentar `list_automations`: no se pudo inspeccionar la condición de disparo de
  `AT-RF09-Trigger-Update` antes del patch. Mitigación aplicada: no se tocó
  `url_dropbox` ni se puso ningún estado "pendiente" de extracción (`listo` es el
  estado terminal que ya tenían los otros 7 y no re-dispara extracción en ellos).
- **N5** — `url_dropbox` es de tipo `url` en el schema pero almacena paths
  (`/VProperty/met-6283-real/…`); no se modificó (comportamiento documentado en
  `lib/adjuntos.ts`).
