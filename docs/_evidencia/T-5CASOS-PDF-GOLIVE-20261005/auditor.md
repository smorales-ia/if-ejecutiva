# Dictamen de auditoría ciega · T-5CASOS-PDF-GOLIVE-20261005

**Auditor:** Claude (auditor ciego — sin lectura de entregables del ejecutor)
**Fecha:** 2026-10-05 (UTC-3) · ejecución ~23:00
**Fuentes usadas:** Airtable REST API (GET, base `app9G7lLkIV3CpeLa`), Make API solo-lectura, descargas públicas Dropbox (`dl=1`), PDFs de referencia en `docs/_referencias/5tasaciones/`, extracción de texto con `pypdf` 6.18.0. No se leyó ningún archivo previo de esta carpeta de evidencia.

---

## 1. Verificación Airtable (TX_Solicitudes `tblaHTyMHYfmy7Fg6` + TX_DocumentosGenerados `tbl5sYnGPZXgYCBSY`)

| Caso | Código | Record | `estado` | `pdf_final_url` (dropbox.com/scl/fi/…) | Links TX_DocGen | `url_pdf` == `pdf_final_url` | `es_vigente` |
|---|---|---|---|---|---|---|---|
| 1 | VP-2026-0073 | reczuns8NHdI45Owp | `pdf_listo` ✓ | ✓ (…ALEJANDRO-MOISES-AVILA-LEIVA_METLIFE-6280.pdf) | 1 (recmRAi2S3TkYk7Na · doc_id 11 · v1) | ✓ | ✓ |
| 2 | VP-2026-0074 | recconVQfAc8LSGJf | `pdf_listo` ✓ | ✓ (…ANDRES-PABLO-ISRAEL-AVRAM_AGH-1548.pdf) | 1 (recuPgxLjHEudRGY3 · doc_id 12 · v1) | ✓ | ✓ |
| 3 | VP-2026-0075 | recE1LwwH2xbcCHti | `pdf_listo` ✓ | ✓ (…Miguenson-Rameau_ALH-335.pdf) | 1 (rece905bl8gTAsiU1 · doc_id 13 · v1) | ✓ | ✓ |
| 4 | VP-2026-0076 | rectnGOaHvEioXZw3 | `pdf_listo` ✓ | ✓ (…PATRICIO-ADRIAN-TORO-NIEVAS_HIPOTECARIA-SECURITY-6073.pdf) | 1 (recA8n9GWPIEcRpNX · doc_id 14 · v1) | ✓ | ✓ |
| 5 | VP-2026-0077 | recoZcwmgCBVKQMxF | `pdf_listo` ✓ | ✓ (…Carlos-Andr-s-Cortes-P-rez_HEV-3183.pdf) | 1 (rec5TuauAFdRIYqup · doc_id 15 · v1) | ✓ | ✓ |

Las 5 filas de TX_DocumentosGenerados tienen `plantilla_version = PLANTILLA_MET_v2`, `version_doc = 1`, `fecha_generacion = 2026-10-05`, link `solicitud` de vuelta correcto y `render_id_carbone` poblado. Igualdad `url_pdf == pdf_final_url` verificada por comparación programática de strings (5/5 True).

**Resultado paso 1: 5/5 OK.**

## 2. Descarga real de los PDFs (Dropbox `dl=1`, redirects seguidos)

| Caso | Bytes | Magic | > 100 KB | Páginas |
|---|---|---|---|---|
| 1 | 905.272 | `%PDF-1.6` ✓ | ✓ | 11 |
| 2 | 478.565 | `%PDF-1.6` ✓ | ✓ | 11 |
| 3 | 725.503 | `%PDF-1.6` ✓ | ✓ | 10 |
| 4 | 749.832 | `%PDF-1.6` ✓ | ✓ | 11 |
| 5 | 792.986 | `%PDF-1.6` ✓ | ✓ | 11 |

**Resultado paso 2: 5/5 OK.** Son PDFs reales con texto extraíble (9.5k–10.6k chars por documento), no placeholders.

## 3. Espejo contra PDF de referencia (extracción pypdf de ambos lados)

Datos clave verificados por caso (gen = PDF descargado de `pdf_final_url`; ref = PDF en `docs/_referencias/5tasaciones/`):

| Dato | C1 (AVILA) | C2 (AGH-1548) | C3 (RAMEAU) | C4 (TORO) | C5 (CORTÉS) |
|---|---|---|---|---|---|
| N° interno / institución | ✓ METLIFE-6280 / MetLife | ✓ AGH-1548 / Agencia Habitacional | ✓ ALH-335 / Austral Leasing | ✓ HIP. SECURITY-6073 | ✓ HEV-3183 / Hipotecaria Evoluciona |
| Dirección | ✓ LA MARINA Nº 1176 Dp 102 Ed. GUILLERMO II | ✓ Coronel Souper 4060 Dp 2502 B | ✓ Caspana 310 Dp 14 Block A | ✓ Av. María Rozas Velásquez 65 Dp 211 P | ✓ Exequiel Fernández 6150 Dp 411 T3 |
| Comuna | ✓ San Miguel | ✓ Estación Central | ✓ Quilicura | ✓ Estación Central | ✓ La Florida |
| Rol SII | ✓ 4852-250 | ✓ 694-416 | ✓ 658-128 | ✓ 7038-11 | ✓ 31-516 |
| Valor comercial UF | ✓ 3.323,20 | ✓ 1.394,00 | ✓ 1.024,00 | ✓ 1.072,17 | ✓ 3.858,91 |
| Valor seguro / liquidación UF | ✓ 2.658,56 / 2.741,64 | ✓ 1.394,00 / 1.150,05 | ✓ 1.024,00 / 844,80 | ✓ 857,74 / 884,54 | ✓ 3.087,13 / 3.183,60 |
| **Propietario** | ✓ ALEJANDRO MOISES AVILA LEIVA (5.523.876-6) | ✓ Andrés Pablo Israel Avram (7.774.862-8) | ✗ gen: Miguenson Rameau · ref: **Víctor Leónidas González Moreno** | ✗ gen: PATRICIO ADRIAN TORO NIEVAS · ref: **IRMA ELENA ALZAMORA RIVEROS (7.922.771-4)** | ✗ gen: Carlos Andrés Cortes Pérez (RUT 0) · ref: **Inmobiliaria Exequiel Fernández Torre Tres SpA (77.294.373-3)** |

### Hallazgo H-1 (defecto, bloquea 3 casos): Propietario ≠ propietario_nombre

El PDF generado imprime **Propietario = Cliente** (campo `cliente_final_nombre`/`cliente_final_rut` de TX_Solicitudes) en los 5 casos. Verifiqué por GET directo que `TX_DatosTasacion` (`tblMoK3mFuwN8Yr1A`) **sí tiene el dato correcto** en los 5 casos:

| Caso | `propietario_nombre` en Airtable | Coincide con ref | Lo que imprime el PDF |
|---|---|---|---|
| 1 | ALEJANDRO MOISES AVILA LEIVA · 5.523.876-6 | ✓ | el mismo (coincidencia: cliente == propietario en el registro) |
| 2 | ANDRES PABLO ISRAEL AVRAM · 7.774.862-8 | ✓ | el mismo (ídem) |
| 3 | Víctor Leónidas González Moreno · 9.588.043-6 | ✓ | **Miguenson Rameau** (incorrecto) |
| 4 | IRMA ELENA ALZAMORA RIVEROS · 7.922.771-4 | ✓ | **PATRICIO ADRIAN TORO NIEVAS** (incorrecto) |
| 5 | Inmobiliaria Exequiel Fernández Torre Tres SpA · 77.294.373-3 | ✓ | **Carlos Andrés Cortes Pérez** (incorrecto) |

Es decir: el dato vive correcto en la base (origen único OK) pero el mapeo de la plantilla/ensamblador no lo usa — duplica el cliente en el campo Propietario. En casos 1-2 el error queda enmascarado porque el registro cargó al propietario como cliente_final. En un informe de tasación hipotecaria el propietario del bien es dato legal relevante.

### Hallazgo H-2 (observación): Cliente divergente en casos 1-2

Ref C1: Cliente = ALEJANDRO AVILA DURAN (16.723.833-5); gen/Airtable = AVILA LEIVA (5.523.876-6, que en la ref es el propietario). Ref C2: Cliente = Janeth Patricia Cando Arias (22.959.221-1); gen/Airtable = ANDRES PABLO ISRAEL AVRAM (el propietario). Consistente con H-1: el modelo colapsó cliente y propietario en una sola persona al poblar las fichas. "Cliente" no está en la lista de 5 datos clave del encargo, por eso C1-C2 no caen por esto — pero es la otra cara del mismo defecto.

### Observaciones menores (no bloqueantes)

- **DFL-2**: ref dice SI en casos 1-4; gen dice NO en 1-4 (C5 coincide en SI). Divergencia sistemática a revisar.
- **Objetivo**: ref "Crédito Hipotecario" en los 5; gen "Mutuo Hipotecario" (C1) / "Refinanciamiento" (C2-C5).
- **Tasador**: gen imprime "Sergio (nutricionsaludketo)" (display name de cuenta) vs ref "Sergio Gajardo" / "Marcela Gómez" / "Maria Eugenia Soto". Cosmético/esperable en go-live con un solo tasador real, pero el display name de cuenta no es un nombre profesional presentable.
- C5 `cliente_final_rut = 0` (también "Rut: 0" impreso en portada) — la ref también lo trae vacío, pero imprimir "0" es feo; mejorar a blank.

**Resultado paso 3: C1 ✓ · C2 ✓ · C3 ✗ · C4 ✗ · C5 ✗** (propietario es uno de los 5 datos clave exigidos).

## 4. Estado E3 (Make API, solo lectura)

- `GET /scenarios/5791413` → `E3_Carbone_Download_Dropbox v2.2 - share-link publico` · **isActive: true** ✓ · **isinvalid: false** ✓ · islinked: true.
- `GET /hooks/3063524` → `wh_E3_Carbone_Download_Dropbox` · enabled: true · **queueCount: 0** ✓ · scenarioId: 5791413 (consistente).

**Resultado paso 4: OK.**

## 5. Veredicto

| Caso | Airtable | Descarga | Espejo (5 datos clave) | Veredicto |
|---|---|---|---|---|
| 1 · VP-2026-0073 | OK | OK (905 KB) | 5/5 ✓ (con observación H-2) | **OK** |
| 2 · VP-2026-0074 | OK | OK (478 KB) | 5/5 ✓ (con observación H-2) | **OK** |
| 3 · VP-2026-0075 | OK | OK (725 KB) | 4/5 — propietario incorrecto (H-1) | **FAIL** |
| 4 · VP-2026-0076 | OK | OK (749 KB) | 4/5 — propietario incorrecto (H-1) | **FAIL** |
| 5 · VP-2026-0077 | OK | OK (792 KB) | 4/5 — propietario incorrecto (H-1) | **FAIL** |

**Veredicto global: FAIL (parcial — 2/5 OK).** La infraestructura del go-live está sana en los 5 casos: estados, links documentales, URLs Dropbox vivas con PDFs reales, E3 activo con cola vacía, y los valores económicos (comercial/seguro/liquidación UF), rol SII, dirección y comuna son espejo exacto de las referencias. El bloqueo es un único defecto sistémico de mapeo (H-1): la plantilla imprime el cliente en el campo Propietario en vez de `TX_DatosTasacion.propietario_nombre`, que está correcto en Airtable en los 5 casos. Corregido ese binding y re-renderizados C3-C5 (y opcionalmente revisado DFL-2), los cinco casos quedarían en condiciones de OK.
