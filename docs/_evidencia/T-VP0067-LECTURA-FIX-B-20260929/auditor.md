# AUDITOR CIEGO — T-VP0067-LECTURA-FIX-B-20260929

> Dictamen independiente. Fecha de auditoría: 2026-09-29/30 (UTC). Fuente: lecturas GET en vivo
> contra Airtable (`app9G7lLkIV3CpeLa`), token server-side de `.env.local` (no expuesto).
> NO se leyó `verificacion.md`, `snap-adjuntos-todos-post.json` ni ningún CIERRE de la tanda B.
> CERO escrituras a Airtable durante la auditoría.

Insumos usados: `docs/_analisis/DIAGNOSTICO_lectura_VP0067_20260929.md` (§2),
`docs/_evidencia/T-VP0067-LECTURA-FIX-20260929/patch-pendiente-A.md`,
`.../snap-cbr-pre.json`, `.../snap-adjuntos-todos-pre.json`,
`docs/_evidencia/T-VP0067-LECTURA-FIX-B-20260929/rollback.md`, y código:
`app/api/tasaciones/[id]/lectura/route.ts` (working tree de la rama
`feat/T-VP0067-LECTURA-FIX-20260929` y su versión en `origin/main`),
`lib/tipos-documento.ts` (contrato real de consulta del catálogo).

---

## Criterio 1 — Los 5 campos cargados con el JSON exacto prometido: **OK**

GET `tblur71x1oItbmKZc/rec7t6MPxKu10WniF` → HTTP 200. El campo `atributos_obtenidos`
del record vivo es **idéntico byte a byte** al bloque ```json de `patch-pendiente-A.md`
(comparación de string en Python: `True`, misma longitud, cero diferencias).

Contenido verificado en el record vivo:

- `items[]` pasó de 3 a **8** entradas. Las 5 nuevas, con valor exacto:
  - `vendedor` = `"RAUL FERNANDO VALENZUELA PEREZ"` (= diagnóstico §2)
  - `comprador` = `"FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ"`
  - `nombre_propietario` = ídem compradores (§2: "por partes iguales")
  - `fecha_inscripcion` = `"2020-01-13"` (§2: 13-ene-2020, en ISO)
  - `comuna` = `"COLINA"` (§2: Colina, decisión "comuna del predio", mayúsculas por convención de carpeta)
  - Todos con `confianza: 1, fila: 1`, consistente con los demás items.
- `no_extraidos` quedó en `["notaria", "superficie_servidumbre_m2", "nombre_cbr", "repertorio"]`
  — exactamente los 4 prometidos (los 5 cargados salieron de la lista; `notaria` y
  `nombre_cbr` NO se cargaron, como manda el patch).
- Es la fila correcta: `nombre_archivo = inscripcion_dominio_cbr_Met6283.docx`,
  `solicitud = ["recmMzeu3eWGxyXsf"]` (VP-2026-0067), `clave_adjunto = inscripcion_dominio_cbr`.

## Criterio 2 — Nada más cambió: **OK**

**(a) La fila CBR, campo a campo vs `snap-cbr-pre.json`** (23 campos): los únicos campos
distintos son `atributos_obtenidos` (el cambio pedido) y `ultima_modificacion`
(`2026-09-29T23:04:55.000Z` → `2026-09-30T02:52:17.000Z`), que es lastModifiedTime
computado por Airtable — avance esperado, no un cambio indebido. `estado_extraccion`
sigue `listo`, `atributos_esperados`, `orden`, `tipo_adjunto`, `url_dropbox`, `tamanio_kb`,
`adjunto_id`, `mime_type`, etc.: idénticos. `createdTime` idéntico.

**(b) Las otras 7 filas de VP-2026-0067 vs `snap-adjuntos-todos-pre.json`** (GET con filtro
`{solicitud}="VP-2026-0067"` y LOS MISMOS 4 campos del snapshot: `nombre_archivo`,
`estado_extraccion`, `clave_adjunto`, `atributos_obtenidos`): mismos 8 record IDs,
y el diff campo a campo da **"ninguno"** en las 7 filas restantes; el único diff de todo
el set es `atributos_obtenidos` de `rec7t6MPxKu10WniF`.

**(c) Ninguna otra solicitud tocada — cobertura total, no muestreo**: GET de TODA la tabla
`TX_Adjuntos` (33 records, una sola página sin `offset`) ordenada por `ultima_modificacion`
desc: el ÚNICO record con timestamp posterior al pre-write (`2026-09-29T23:04:55Z`) es
`rec7t6MPxKu10WniF` (`2026-09-30T02:52:17Z`). Los otros 7 de VP-0067 conservan exactamente
`2026-09-29T23:04:55Z` y todos los adjuntos de otras solicitudes (`rec75VXoWvRImjd0f`,
`recQgfhUPirXCnSR8`, `rec2jxF44YNADV4MB`, …) tienen última modificación ≤ 2026-09-10.
Un solo write en toda la tabla, en la fila correcta.

## Criterio 3 — Terna del informe intacta: **OK**

Los 3 primeros `items[]` del record vivo son **estructuralmente iguales** (comparación
de objetos JSON parseados: `True`) a los 3 items del snapshot pre:
`foja_cbr="13291"` · `numero_cbr="21565"` · `ano_inscripcion_cbr=2006`, con los mismos
`confianza: 1, fila: 1`. La terna 13291/21565/2006 sigue presente y sin alteración
(decisión c del diagnóstico: mantener la terna SII que imprime el informe).

## Criterio 4 — Conteo final de naranjos (computado por el auditor): **OK**

Cálculo propio con: (i) los 8 adjuntos actuales (GET en vivo), (ii) el catálogo
`D_TipoDocumentoAtributo` (`tbldI86ieVKpjpL7E`) leído en vivo con el MISMO filtro que
producción (`FIND(clave, ARRAYJOIN({tipo_documento}))`, `lib/tipos-documento.ts:205`),
(iii) gatillo real de route.ts: adjunto con `estado_extraccion="error"` **o**
`no_extraidos` no vacío (los 8 están `listo`; 7 tienen `no_extraidos` no vacío;
`foto_ofertas_comparables` lo tiene vacío → nunca gatilla).

**Lógica actual de PRODUCCIÓN** (`origin/main` route.ts:135 — `obligatorio && !obtenidos.has(codigo)`
por adjunto): **8 naranjos en 3 documentos**:

| Doc | Naranjos (código [nombre en UI]) |
|---|---|
| CBR (`inscripcion_dominio_cbr`) | `notaria` [Notaria] · `nombre_cbr` [CBR] |
| Foto SII (`foto_fuente_sii`) | `sup_m2` [Superficie Construida] · `tipo_material` [Material Predominante] · `anio_construccion` [Anio de Construccion] |
| TGR (`certificado_deuda_tgr`) | `fecha_emision` [Fecha Emision] · `avaluo_afecto_clp` [Avaluo Afecto] · `contribucion_total_clp` [Contribucion Total] |

(permiso_edificacion, consulta_antecedentes, serviu, recepcion_final: 0 — todos sus
obligatorios están en sus propios `items[]`.)

**Regla por-carpeta de la RAMA** (route.ts:146-156 del working tree: un obligatorio ausente
se satisface si otro adjunto de la solicitud lo tiene en `items[]`, salvo prefijo `fecha_`):
**6 naranjos**:

| Doc | Naranjos | Por qué es honesto |
|---|---|---|
| CBR | `notaria` | El texto de la notaría está cortado en el escaneo del documento (diagnóstico §2: NO_EXISTE_EN_FUENTE); ningún otro adjunto lo trae. Cargarlo sería inventar. |
| CBR | `nombre_cbr` | El documento no lo dice explícito ("Santiago" solo como plaza, inferencia de confianza media, §2); no está en ningún otro adjunto. |
| Foto SII | `sup_m2` | La foto SII muestra un sitio eriazo con tabla de edificación VACÍA (§2): el dato no existe en ese documento. El valor espejo (249,91) viene del XLSM, no del SII. No hay `sup_m2` en ningún otro items[] (el `superficie_construida_m2` del permiso es OTRO código de catálogo). |
| Foto SII | `tipo_material` | Ídem: no existe en la foto SII (espejo del XLSM Portada D12). Ausente de toda la carpeta. |
| Foto SII | `anio_construccion` | Ídem: tabla vacía en el SII. Nota: el permiso tiene `ano_construccion` (sin i) = 2020 — códigos distintos en el catálogo, así que la regla por-carpeta NO lo suprime; la unificación semántica es deuda de catálogo (E1/E5), no bug de la regla. |
| TGR | `fecha_emision` | El certificado TGR está recortado y su fecha no es legible (§2). El SERVIU sí tiene `fecha_emision` en items[], pero la exclusión `fecha_` de la rama impide (correctamente) que la fecha de OTRO certificado lo satisfaga: cada documento tiene su propia fecha de emisión. |

Suprimidos por la regla por-carpeta (los 2 injustos): `avaluo_afecto_clp` y
`contribucion_total_clp` del TGR — ambos ya extraídos de la Consulta SII de la misma
carpeta ($279.778.719 y $679.162, en items[] de `reckRZ0e9mwtR6xCC`); son datos de la
propiedad, no del documento, y reclamárselos al TGR era el naranjo falso canónico del
diagnóstico (E3).

Resultado del write auditado sobre el conteo: los 5 naranjos clase-(a) del CBR
(vendedor, comprador, nombre_propietario, fecha_inscripcion, comuna) desaparecieron en
AMBAS lógicas (pasaron a items[]). Todos los naranjos restantes son "el producto diciendo
la verdad": datos que los documentos fuente realmente no contienen.

---

**VEREDICTO GLOBAL: OK — el write fue exactamente el prometido (byte a byte), quirúrgico (1 campo de 1 fila en toda la tabla), la terna 13291/21565/2006 quedó intacta, y quedan 8 naranjos honestos con la lógica de producción y 6 con la regla por-carpeta de la rama.**
