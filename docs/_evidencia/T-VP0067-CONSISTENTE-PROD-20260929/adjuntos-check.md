# adjuntos-check.md — Metadatos de los 8 TX_Adjuntos · VP-2026-0067

> Tanda T-VP0067-CONSISTENTE-PROD-20260929 · FASE 2 · BLOQUE 2a (verificador).
> Captura 2026-09-29 ~23:10 UTC vía `curl` GET a `tblur71x1oItbmKZc` (TX_Adjuntos),
> filtrado por los 8 record IDs linkeados desde `recmMzeu3eWGxyXsf`. Solo lectura.
> Criterio: plan §6.2 — 8/8 con `nombre_archivo` + `tipo` + `tamanio_kb` + `orden` +
> `url_dropbox` no vacío + `mime_type` (fix D1 de OLA 1).

## Tabla por record (orden 1..8)

| # | Record | nombre_archivo | tipo | tipo_adjunto | tamanio_kb | orden | url_dropbox | mime_type |
|---|---|---|---|---|---|---|---|---|
| 1 | rec95X1HPJB7ZUo5G | permiso_edificacion_Met6283.pdf | Permiso edificacion | otro | 79 | 1 | `/VProperty/met-6283-real/permiso_edificacion_Met6283.pdf` | application/pdf |
| 2 | recWdb4FAphNaTE0I | foto_fuente_sii_Met6283.jpg | sii | otro | 58 | 2 | `/VProperty/met-6283-real/foto_fuente_sii_Met6283.jpg` | image/jpeg |
| 3 | rectcojWwOIonkQRA | foto_comparables_Met6283.jpg | Otro | otro | 138 | 3 | `/VProperty/met-6283-real/foto_comparables_Met6283.jpg` | image/jpeg |
| 4 | rechQjmqpb3HMWyeb | certificado_deuda_tgr_Met6283.pdf | Otro | otro | 57 | 4 | `/VProperty/met-6283-real/certificado_deuda_tgr_Met6283.pdf` | application/pdf |
| 5 | rectCtwDMT2mwN4GO | certificado_recepcion_final_Met6283.pdf | Recepcion final | otro | 81 | 5 | `/VProperty/met-6283-real/certificado_recepcion_final_Met6283.pdf` | application/pdf |
| 6 | reckRZ0e9mwtR6xCC | consulta_antecedentes_bien_raiz_Met6283.pdf | sii | otro | 82 | 6 | `/VProperty/met-6283-real/consulta_antecedentes_bien_raiz_Met6283.pdf` | application/pdf |
| 7 | recpI0wPyESJ0Etvs | informe_no_expropiacion_serviu_Met6283.pdf | Otro | cert_no_expropiacion | 62 | 7 | `/VProperty/met-6283-real/informe_no_expropiacion_serviu_Met6283.pdf` | application/pdf |
| 8 | rec7t6MPxKu10WniF | inscripcion_dominio_cbr_Met6283.docx | Certificado dominio | cbr | 164 | 8 | `/VProperty/met-6283-real/inscripcion_dominio_cbr_Met6283.docx` | application/vnd.openxmlformats-officedocument.wordprocessingml.document |

(Complemento: los 8 tienen `clave_adjunto` y `descripcion` pobladas, `subido_por = Sistema`,
`fecha_subida = 2026-09-22T02:08:47Z`; `ultima_modificacion = 2026-09-29T23:04:55Z` — el
patch de metadatos de OLA 1.)

## PASS/FAIL por criterio (plan §6.2)

| Criterio | Resultado | Detalle |
|---|---|---|
| 8/8 records existen y linkean a la solicitud | PASS | 8 devueltos por filtro RECORD_ID, todos con `solicitud=[recmMzeu3eWGxyXsf]` |
| `nombre_archivo` poblado 8/8 | PASS | nombres reales espejo de `docs/_referencias/Met_6283/` |
| `tipo` poblado 8/8 | PASS | Permiso edificacion · sii ×2 · Otro ×3 · Recepcion final · Certificado dominio |
| `tipo_adjunto` poblado 8/8 | PASS | otro ×6 · cert_no_expropiacion · cbr |
| `tamanio_kb` > 0 en 8/8 | PASS | 79/58/138/57/81/82/62/164 |
| `orden` = permutación exacta 1..8 sin duplicados | PASS | {1,2,3,4,5,6,7,8} |
| `url_dropbox` no vacío 8/8 | PASS | ruta `/VProperty/met-6283-real/<archivo>` coherente con el nombre en los 8 |
| `mime_type` poblado y coherente con la extensión 8/8 | PASS | pdf×5 → application/pdf · jpg×2 → image/jpeg · docx → openxml wordprocessingml |

## Totales

**8 criterios · 8 PASS · 0 FAIL** (equivale a 64 checks celda-a-celda, todos PASS).
