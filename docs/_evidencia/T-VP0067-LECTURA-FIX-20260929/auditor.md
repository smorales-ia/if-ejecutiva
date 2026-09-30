# AUDITORÍA CIEGA — T-VP0067-LECTURA-FIX-20260929

> Auditor ciego. Verificado desde el estado final real: working tree en `feat/T-VP0067-LECTURA-FIX-20260929`
> (HEAD del baseline: `b2c8f7b`), ejecución de tests, y GETs directos a Airtable con `AIRTABLE_TOKEN` de
> `.env.local`. No se leyeron `tests.md` ni ningún `CIERRE_*`. Fecha: 2026-09-29.

---

## Criterio 1 · DATOS (5 atributos del CBR en `rec7t6MPxKu10WniF`) — **FAIL**

`GET https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblur71x1oItbmKZc/rec7t6MPxKu10WniF` → HTTP 200.

`atributos_obtenidos` real (parseado):

```json
{"items": [
  {"codigo_atributo": "foja_cbr", "valor": "13291", "confianza": 1, "fila": 1},
  {"codigo_atributo": "numero_cbr", "valor": "21565", "confianza": 1, "fila": 1},
  {"codigo_atributo": "ano_inscripcion_cbr", "valor": 2006, "confianza": 1, "fila": 1}],
 "no_extraidos": ["vendedor","nombre_propietario","notaria","comprador","superficie_servidumbre_m2",
  "fecha_inscripcion","nombre_cbr","repertorio","comuna"]}
```

- **Los 5 campos (vendedor, comprador, nombre_propietario, fecha_inscripcion, comuna) NO están en `items[]`.**
  Siguen los 9 códigos en `no_extraidos`, incluidos esos 5. La parte (A) de la tanda **no se ejecutó**.
- La terna **13291 / 21565 / 2006 está intacta** (idéntica al snapshot).
- Contraste con `rollback.md` §1: el JSON actual es **byte-a-byte el valor ORIGINAL** documentado ahí, y
  `ultima_modificacion = 2026-09-29T23:04:55.000Z` coincide con el pre-snapshot. El record **no está corrupto:
  está en su estado original, sin ninguna escritura**.

Dictamen: FAIL por objetivo no cumplido (los 5 no se cargaron), sin daño (estado original íntegro).

---

## Criterio 2 · CÓDIGO /lectura (satisfacción por-carpeta) — **OK**

Diff `git diff b2c8f7b -- "app/api/tasaciones/[id]/lectura/"`:

- `route.ts:132-135` — construye `obtenidosCarpeta` como unión de `codigosObtenidos()` de TODOS los adjuntos.
- `route.ts:146-156` — el filtro de faltantes: un obligatorio ausente en el propio adjunto se reclama solo si
  (a) su código empieza con `fecha_` (exclusión: la fecha es del documento, no de la propiedad), o
  (b) tampoco está en `obtenidosCarpeta`.

Tests: `pnpm vitest run "app/api/tasaciones/[id]/lectura/route.test.ts"` → **21 passed (21)**, incluidos los 3
nuevos del describe «satisfacción por-carpeta»:

1. obligatorio ausente en TGR pero presente en Consulta SII → no se reclama (caso VP-0067) ✓
2. `fecha_*` ausente sigue faltando aunque otro adjunto tenga el mismo código ✓ (naranjo honesto conservado)
3. obligatorio ausente en TODOS los adjuntos sigue faltando ✓ (naranjo honesto conservado)

**Evaluación crítica — ¿puede ocultar un faltante real?** Riesgo residual acotado, señalado sin que cambie el
dictamen porque la regla es exactamente la E3 aprobada en el diagnóstico:

- **Homónimos con semántica local distinta**: el matching es por `codigo_atributo` exacto y global. En el
  catálogo del CBR, `comuna` tiene `etiqueta_local` «Comuna del CBR» (la comuna del Conservador), pero hoy se
  satisface con la `comuna` de la propiedad que traen TGR/SERVIU/recepción final. La exclusión `fecha_` cubre
  fechas, no este caso. En VP-0067 es inocuo en la práctica, pero si un día un documento define un código
  compartido con significado propio (no-fecha), la regla lo taparía. Mitigación futura: disciplina de catálogo
  (códigos distintos para datos distintos), no código.
- **Lo que NO puede pasar**: un dato ausente en todos los documentos jamás se oculta (test 3), y una fecha
  propia jamás se satisface con la de otro documento (test 2).

---

## Criterio 3 · VETO WORD en upload — **OK**

Diff `git diff b2c8f7b -- app/api/adjuntos/upload/route.ts`:

- `MIMES_WORD` = `application/msword` + `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- Rechazo por MIME **o** por extensión (`nombreLower.endsWith('.doc') || .endsWith('.docx')`, sobre
  `toLowerCase()` → case-insensitive), **antes** de resolver contexto Dropbox y de llamar a Make.
- Respuesta: 400 `{ ok:false, error: MENSAJE_ARCHIVO_WORD, reintentable:false }`.
- Mensaje: **«Este archivo está en Word y no podemos leerlo. Súbelo en PDF o como imagen (JPG o PNG).»** —
  humano, segunda persona, sin exclamaciones ni jerga (no dice mime, ni pipeline, ni 400). Cumple §6.

Tests: `pnpm vitest run app/api/adjuntos/upload/route.test.ts` → **5 passed (5)**:
docx por MIME ✓ · .doc legado por MIME ✓ · `.DOCX` con `application/octet-stream` (por extensión,
case-insensitive) ✓ · el veto no llega a Dropbox/Make ✓ · un PDF válido pasa (200, `postToMake` llamado) ✓.

Nota menor: no hay test explícito de JPG/PNG, pero el predicado solo matchea patrones Word, de modo que una
imagen no puede caer en el veto; el caso PDF cubre la rama de paso.

---

## Criterio 4 · INFORME / PDF INTACTOS — **OK**

- `git diff --name-only b2c8f7b`: `app/api/adjuntos/upload/route.ts`, `app/api/tasaciones/[id]/lectura/route.ts`,
  `app/api/tasaciones/[id]/lectura/route.test.ts`, `docs/aprendizajes.md`. Untracked:
  `app/api/adjuntos/upload/route.test.ts` (nuevo test) y `docs/_evidencia/T-VP0067-LECTURA-FIX-20260929/`.
  **Ningún archivo del pipeline de informe/PDF** (nada en `informe-data`, plantillas, blueprints Make, lib de
  ensamblado). `docs/aprendizajes.md` es bitácora (apareció modificada durante la auditoría, sesión en curso),
  no pipeline.
- Airtable: `ultima_modificacion` del CBR = **`2026-09-29T23:04:55.000Z`**, exactamente el valor pre-tanda —
  coherente con que los 5 campos no se cargaron (criterio 1): **cero escrituras** sobre el record.

---

## Criterio 5 · NARANJOS RESTANTES — cálculo propio (replicando el filtro nuevo sobre datos reales)

Insumos: GET de los 8 adjuntos de VP-2026-0067 (`filterByFormula={solicitud}="VP-2026-0067"`) + GET del
catálogo `tbldI86ieVKpjpL7E` por clave (`FIND(clave, ARRAYJOIN({tipo_documento}))`), replicando
`getAtributosPorTipo` (obligatorio checkbox, fallback `etiqueta_local`) y el filtro de `route.ts:146-156`.
`obtenidosCarpeta` real = 49 códigos.

### Estado ACTUAL de los datos (los 5 del CBR sin cargar) → **9 mensajes en 3 documentos**

| Documento | Faltante (nombre en pantalla) | Por qué es honesto |
|---|---|---|
| CBR | vendedor (Vendedor) | En ningún `items[]` de la carpeta; está en el docx pero la extracción degradada no lo leyó |
| CBR | comprador (Comprador) | Ídem: ausente en los 8 `items[]` |
| CBR | notaria (Notaria) | Ausente en toda la carpeta |
| CBR | nombre_cbr (CBR) | Ausente en toda la carpeta |
| CBR | fecha_inscripcion (Fecha de Inscripcion) | Ausente; además `fecha_*` nunca se satisface por carpeta |
| foto_fuente_sii | sup_m2 (Superficie Construida) | El código `sup_m2` no está en ningún `items[]` (el `superficie_construida_m2` de otros docs es OTRO código; la regla no puentea sinónimos — limitación de catálogo, no del filtro) |
| foto_fuente_sii | tipo_material (Material Predominante) | Ausente en toda la carpeta (el sinónimo `material_estructura` también está en `no_extraidos` de la Consulta) |
| foto_fuente_sii | anio_construccion (Anio de Construccion) | El código exacto no está en ningún `items[]` (`ano_construccion` del permiso es otro código — misma limitación de sinónimos) |
| certificado_deuda_tgr | fecha_emision (Fecha Emision) | La fecha de emisión DEL TGR no se extrajo; la `fecha_emision` del SERVIU no la satisface por la exclusión `fecha_` — exactamente el naranjo honesto que la regla debía conservar |

(Comparación: con el código viejo eran **13** — la regla nueva eliminó 4 naranjos falsos: `comuna` y
`nombre_propietario` del CBR, `avaluo_afecto_clp` y `contribucion_total_clp` del TGR — sin ocultar ninguno de
los 9 restantes.)

### Si además se cargaran los 5 del CBR → **6 mensajes**

- CBR: **notaria** y **nombre_cbr** (ninguno figura en el documento fuente según el diagnóstico §2 — honestos).
- foto_fuente_sii: sup_m2, tipo_material, anio_construccion (sin cambio).
- certificado_deuda_tgr: fecha_emision (sin cambio).

Coincide con la predicción del diagnóstico («naranjo del CBR queda solo con notaría y CBR»).

---

## VEREDICTO GLOBAL

**PARCIAL: código OK (B y C verificados con tests verdes y naranjos honestos conservados), pero DATOS FAIL — los 5 atributos del CBR NO fueron cargados en `rec7t6MPxKu10WniF` (record intacto en su estado original, terna 13291/21565/2006 sin tocar, sin corrupción).**
