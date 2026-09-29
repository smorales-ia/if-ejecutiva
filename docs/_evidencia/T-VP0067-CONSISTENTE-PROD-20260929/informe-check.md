# informe-check — VP-2026-0067 (recmMzeu3eWGxyXsf) · FASE 2 · Bloque 2b

Tanda T-VP0067-CONSISTENTE-PROD-20260929 · 29-sep-2026 · SOLO LECTURA (curl GET Airtable, base `app9G7lLkIV3CpeLa`).

**Método.** No hay sesión Clerk disponible para renderizar `/tasaciones/[id]/informe`, así
que la verificación es a nivel de datos: se leyó el código de las 4 lecturas server-side
(`leerTasacion` · `leerDatosCaptura` · `leerFotosCaptura` · `lecturaInforme`) para saber qué
campo consume cada bloque del preview (`components/tasador/informe-preview.tsx`), y se
verificó cada campo en vivo por curl. Estado vivo: `estado = pdf_listo` → `informeDisponible
= true` (la ruta `/estado` lo deriva; el preview no bloquea).

Convención: **PASS** = fuente poblada con el valor espejo esperado · **VACÍO** = el bloque
renderiza pero sin dato (por diseño del dato, no bug de lectura) · **FAIL** = el valor espejo
esperado no está donde el bloque lo lee.

---

## Bloque 1 · Cabecera — PASS

Campos consumidos (`informe-preview.tsx:399-404`): `tasacion.cliente` / `tasacion.direccion` /
`tasacion.comuna` (Links resueltos por `proyectarTasacion`, `lib/tasador/lectura-tasacion.ts:397-424`),
`tasacion.codigo`, chip nuevo/usado (`tipo_propiedad_nuevo_usado`), `d.fechaVisitaReal`
(= `TX_Solicitudes.fecha_visita`, `lib/tasador/lectura-datos.ts:390`).

| Campo | Valor vivo | Resultado |
|---|---|---|
| `codigo_solicitud` | `VP-2026-0067` | PASS |
| `cliente` → M_Clientes `recIg8NtVhptXkEUJ` | **MetLife** | PASS |
| `direccion` | `LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` | PASS |
| `comuna` → M_Comunas `recKT9mUJkeq3YuBu` | **Colina** | PASS |
| `tipo_propiedad_nuevo_usado` | `usada` → chip "Usada" | PASS |
| `fecha_visita` | `2026-04-13` | PASS |

Observación menor: el header muestra `v0` — `Tasacion.version` está hardcodeado en 0
(`lectura-tasacion.ts:435`, CI-024) aunque `TX_DocumentosGenerados` sí tiene fila vigente
(`es_vigente=true`, ver V6). No afecta los datos del bloque.

## Bloque 2 · Valor de tasación + cap rate — PASS (con 1 hallazgo de presentación)

Campos consumidos: `valorCanonico` desde `lib/tasador/lectura-informe.ts:322-333`
(precedencia CI-072: `valor_final_override ?? valor_comercial_uf ?? terminal TX_Calculos`)
→ `informe-preview.tsx:240-243`.

Precedencia real verificada en vivo:

| Escalón | Campo | Valor vivo |
|---|---|---|
| 1 | `TX_Solicitudes.valor_final_override` | `null` |
| 2 | `TX_Solicitudes.valor_comercial_uf` | `null` |
| 3 | Terminal `TX_Calculos` (`tblFz37KSvn5pLKDR`, filtro `solicitud_codigo="VP-2026-0067"`, `variable_output = valor_comercial_uf`) | **20125.862399999998** |

→ `valorDestacado.valorUf = 20125.8624` UF por el fallback de CI-072 (`lectura-informe.ts:325`).
**El fix CI-072 opera: sin él este bloque mostraría «—»**. Los 15 terminales del motor están
poblados. `esOverride = false` (correcto: el 20125.8624 no es override). PASS.

Cap rate (`lectura-informe.ts:326-327`: `tasa_cap_rate_override ?? d.tasa_cap_rate`):
`tasa_cap_rate_override = null` → `TX_DatosTasacion.tasa_cap_rate = 0.045` = **4,5 %**
(mismo espejo que el golden `lib/informe/golden-met6283.ts:212-215`: «PDF “4,5%” · tipeado
0.045»). Dato: PASS.

⚠ **Hallazgo de presentación (no bloquea el dato):** el preview renderiza
`capRate.toFixed(2)` + `"%"` (`informe-preview.tsx:242,420-423`) sobre la **fracción**:
`(0.045).toFixed(2) = "0.04"` → la pantalla mostrará **«Cap rate: 0.04%»** en vez de
«4,50%». El PDF no lo sufre (la plantilla formatea la fracción como porcentaje). Candidato
a CI nueva de UI; no es un problema de datos de VP-2026-0067.

`uf_dia_visita = null` (no se renderiza en el preview; sólo viaja en el canónico). Sin efecto.

## Bloque 3 · Antecedentes de la propiedad — PASS

Campos consumidos: modelo cliente `d` desde `leerDatosCaptura`
(`lib/tasador/lectura-datos.ts:368-419`, con fallback SII P16-TAS) → `informe-preview.tsx:437-448`.
Fuente: `TX_DatosTasacion` (`tblMoK3mFuwN8Yr1A`, 1 fila).

| Campo (preview) | Fuente viva | Valor | Resultado |
|---|---|---|---|
| Sup. terreno | `sup_terreno_m2` | **5024.86** | PASS |
| Sup. construida | `sup_construccion_m2` | **249.91** | PASS |
| Sup. primer piso | `sup_primer_piso_m2` | `null` → «—» | VACÍO |
| Año construcción | `anio_construccion` | **2024** | PASS |
| Materialidad | `material_predominante` | `ALBAÑILERÍA LADRILLO` | PASS |
| Calidad construcción | `calidad_construccion` = null y `calidad_sii` = null → 0 | «—» | VACÍO |
| Estado conservación | `estado_conservacion` | `Bueno` | PASS |
| Dormitorios / Baños / Estac. | `dormitorios`/`banos`/`estacionamientos` | 4 / 4 / 4 | PASS |

Bloque poblado; dos celdas «—» por dato ausente en la fuente (primer piso, calidad), no por
fallo de lectura.

## Bloque 4 · Datos SII — PASS (sin unidades)

Campos consumidos: `siiCanonico` (`lectura-informe.ts:418-445`) → `informe-preview.tsx:452-527`.
Rol a nivel solicitud: `TX_Solicitudes.rol_sii`; resto: `TX_DatosTasacion`; tabla por unidad:
`TX_Unidades`.

| Campo | Valor vivo | Resultado |
|---|---|---|
| Rol SII (`s.rol_sii`) | **`N°882-40`** (no dispara sentinel CI-067) | PASS |
| Avalúo total (`avaluo_total`) | **339809429** | PASS |
| Avalúo fiscal UF (`avaluo_fiscal_uf`) | 339809429 ⚠ mismo número que el CLP (el terminal `avaluo_fiscal_uf` de TX_Calculos vale 8517.68; la columna de TX_DatosTasacion trae el CLP espejado) | PASS de espejo · dato semánticamente sospechoso |
| Avalúo exento / Contribución anual | 0 / 0 | PASS |
| Calidad SII | `null` → «—» | VACÍO |
| Destino SII | `HABITACIONAL` | PASS |
| Códigos SII comuna/manzana/predio | `14201` / `882` / `40` | PASS |
| Ubicación urbano/rural | `rural` | PASS |
| CG · OCiv · OC · G | los cuatro `null` → «—» | VACÍO |
| `TX_Unidades` (tabla por unidad) | **0 filas** → la tabla no se renderiza (`informe-preview.tsx:478`) | VACÍO |

El bloque queda poblado en su grilla principal (rol + avalúo + códigos); la tabla de
unidades no aparece porque `TX_Unidades` no tiene filas para esta solicitud.

## Bloque 5 · Cuadro de valoración — FAIL parcial

Campos consumidos: preview desde el modelo cliente `d.items` (`lectura-datos.ts:421-436` →
`informe-preview.tsx:531-559`: descripcion, subtipo, aportaGarantia, superficieM2); el
canónico además suma `uf_total_item` (`lectura-informe.ts:527-540`). Fuente:
`TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`).

Valor vivo: **6 filas** — `tipo_item`: Terreno (3622.51 m²), Terreno (1402.35 m²),
Edificacion (249.91 m², `factor_aplicado = 0.96`), Piscina (1 m²), OO.CC. ×2 (1 m² c/u);
todas `situacion_municipal = Regularizado`.

| Verificación | Resultado |
|---|---|
| 6 ítems | **PASS** (6 filas) |
| Factor 0.96 | **PASS** (`factor_aplicado = 0.96` en la fila Edificacion; el preview no pinta el factor, pero el dato está) |
| Total 20125.8624 | **FAIL** — `uf_total_item` es `null` en las 6 filas y `uf_m2_aplicado` también; el `totalUf` del canónico suma **0**. El 20125.8624 sólo existe como terminal de TX_Calculos (bloque 2), no en el cuadro |
| `descripcion` | `null` en las 6 filas → el preview lista 6 renglones con «—» como título |
| `aporta_a_garantia` | `null` en las 6 → todos salen "No aporta" |

Renderiza **incompleto**: 6 renglones presentes pero sin descripción ni valores UF por ítem.
El escritor de `uf_total_item`/`uf_m2_aplicado`/`descripcion` (motor AT03 o pipeline) no
pobló esas columnas para VP-2026-0067.

## Bloque 6 · Comparables — PASS

Campos consumidos: preview desde `d.comparables` (`comparablesDeSolicitud`,
`lectura-datos.ts:139-171`) → `SeccionComparables` (dos bloques Ofertas/CBR, promedio simple
de valores crudos `uf_m2_*_f`) + fila TASACIÓN vía `filaTasacionUfM2(valorUf, supConstruida)`
(`informe-preview.tsx:252` · `lib/informe/fila-tasacion.ts:33-39`). Fuente: `TX_Comparables`
(`tbllbTuhb0waWIbRo`).

Valor vivo: **7 filas** (comp_id 125–131): 5 `Oferta` (con teléfono y fecha) + 2 `CBR` (con
foja-número `40132-55521` y `47523-66056`). Todas con dirección, comuna Colina, sup. terreno,
sup. construcción, precio_uf, año, `oo_cc_uf`, `uf_m2_terreno_f` y `uf_m2_construccion_f`
poblados → ninguna celda «—» estructural.

- 7 filas: **PASS** (≥3, `cumpleMinimo = true`).
- Promedio: **PASS** — el preview promedia los crudos por bloque; promedio global de
  `uf_m2_construccion_f` = 30.91 (el homogeneizado del canónico da lo mismo, 30.912, porque
  los crudos ya vienen de la fórmula directa). CI-057 no se toca.
- Fila TASACIÓN: **PASS con nota** — se puebla: `20125.8624 / 249.91 = 80.53` UF/m² C.
  Nota: 80.53 es valor total/superficie sin descontar terreno ni OO.CC., contra un promedio
  de muestra de ~30.9 → el renglón «Tasación v/s promedio» saldrá ≈ +160 %. Es la aritmética
  vigente de `filaTasacionUfM2` (F-2 · P1-8), no un dato roto de la solicitud.

## Bloque 7 · Registro fotográfico — VACÍO

Campos consumidos: preview desde `leerFotosCaptura` → `repartoDeCaptura`
(`lib/tasador/lectura-fotos.ts:170-190`: filtro `{solicitud}="VP-2026-0067"` **AND**
`{subido_por}="Tasador"`) → `informe-preview.tsx:271-273,567-599`. El canónico filtra por
`tipo_adjunto` que empiece con `foto` (`lectura-informe.ts:397`).

Valor vivo en `TX_Adjuntos` (8 filas de la solicitud): **todas con `subido_por = 'Sistema'`**
y `tipo_adjunto` ∈ {`cbr`, `otro`, `cert_no_expropiacion`} — ninguno empieza con `foto`.
Existen 2 adjuntos con **clave** `foto_*` (`foto_fuente_sii_Met6283.jpg` ·
`foto_comparables_Met6283.jpg`, clave `foto_ofertas_comparables`), pero son insumos del
pipeline RF-09, no fotos de visita: no pasan ninguno de los dos filtros.

→ `leerFotosCaptura` devuelve 0 fotos y el canónico marca `bloques[6].vacio = true`.
**El bloque renderizará «0 fotografías» con las 8 categorías en 0.** No es un bug de
lectura: VP-2026-0067 no tiene fotos de terreno subidas por el tasador (alta sandbox
MET-6283-REAL, ver `override_motivo`).

## Bloque 8 · Observaciones + antecedentes legales — PASS (observaciones vacías)

Campos consumidos: `observacionesCanonico` (`lectura-informe.ts:406-460`) →
`informe-preview.tsx:602-662`. Fuentes: `TX_Solicitudes` (overrides), `TX_DatosTasacion`
(`observaciones_tasador`), `TX_DocumentosLegales` (`tbl7qIg5x4Y0tOiLk`, 1 fila).

| Campo | Valor vivo | Resultado |
|---|---|---|
| `observaciones_tasador` | `null` → sección no se pinta | VACÍO |
| `observacion_rechazo_tasador` | `null` | VACÍO (esperado) |
| Overrides no nulos | `vida_util_override = 70` → «Vida útil (override): 70 años» | **PASS** (esperado 70) |
| `tasa_cap_rate_override` / `valor_final_override` | `null` → no listados | PASS (correcto) |
| `override_motivo` | poblado («MET-6283-REAL · RF-09 en vivo…») → se muestra como «Motivo del ajuste» junto al override | PASS de dato · ⚠ es texto de sandbox visible en UI |
| Permiso edificación | `permiso_edificacion_numero = 'N°319  09/09/2020'` (+ `permiso_edificacion_fecha = 2020-09-09`) | **PASS** |
| Recepción final | `recepcion_final_numero = 'N°210  18/07/2024'` (+ fecha `2024-07-18`) | **PASS** |
| CBR fojas / N° / año | `13291` / `21565` / `2006` | **PASS** |

`vacio = false` (hay override). El bloque renderiza completo salvo el párrafo de
observaciones del tasador, que no existe en la fuente.

---

## EXPEDIENTE (V5) · ExpedienteSheet — PASS

Consume `tasacion.adjuntosDropbox` (`leerAdjuntos`, `lectura-tasacion.ts:616-644`: filtra por
los recordIds del Link `TX_Adjuntos` de la solicitud, lee `nombre_archivo` / `url_dropbox` /
`tamanio_kb`, descarta filas sin nombre) → `expediente-sheet.tsx:115,222-225` (fila con
nombre + tamaño + botón Descargar hacia `url`).

Valor vivo: Link `TX_Adjuntos` = **8 recordIds**; las **8 filas** tienen los 3 campos:

| nombre_archivo | url_dropbox | tamanio_kb |
|---|---|---|
| inscripcion_dominio_cbr_Met6283.docx | ✓ | 164 |
| permiso_edificacion_Met6283.pdf | ✓ | 79 |
| foto_fuente_sii_Met6283.jpg | ✓ | 58 |
| certificado_deuda_tgr_Met6283.pdf | ✓ | 57 |
| consulta_antecedentes_bien_raiz_Met6283.pdf | ✓ | 82 |
| informe_no_expropiacion_serviu_Met6283.pdf | ✓ | 62 |
| certificado_recepcion_final_Met6283.pdf | ✓ | 81 |
| foto_comparables_Met6283.jpg | ✓ | 138 |

Ninguna fila se cae del filtro (todas con nombre). El sheet mostrará las 8 con su tamaño
(KB→bytes en `lectura-tasacion.ts:641`) y link de descarga. **PASS**.

## Botón Descargar PDF (V6) — PASS

Consume `tasacion.pdfUrl` = `TX_Solicitudes.pdf_final_url` (`lectura-tasacion.ts:462`) →
`handleDescargarPDF` (`informe-preview.tsx:276-282`: si hay URL abre pestaña; si no,
`window.print()`).

Valor vivo: `pdf_final_url` **poblado** =
`https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO%20JOS%C3%89%20VERGARA%20UNDURRAGA_METLIFE%20-6283.pdf`
→ el botón abrirá la URL (no cae a print). Accesibilidad de la URL: no se verifica acá
(documentada en `pdf-check.md`; es un link `/home` de Dropbox que exige sesión, no un share
link — hallazgo ya conocido de la tanda). Complemento: `TX_DocumentosGenerados` tiene 5
filas para la solicitud, 1 con `es_vigente = true` (v1, `PLANTILLA_MET_v2`,
`generado_en = 2026-09-29T23:13:12Z`) → `versionVigente` del canónico resuelve v1.

---

## Totales

| # | Bloque | Resultado |
|---|---|---|
| 1 | Cabecera | **PASS** |
| 2 | Valor + cap rate | **PASS** (fallback CI-072 opera: 20125.8624 desde TX_Calculos; cap rate 0.045 = 4,5 % — ⚠ el preview lo pintará «0.04%») |
| 3 | Antecedentes propiedad | **PASS** (primer piso y calidad «—» por fuente vacía) |
| 4 | Datos SII | **PASS** (sin tabla de unidades: TX_Unidades 0 filas; CG/OCiv/OC/G vacíos) |
| 5 | Cuadro de valoración | **FAIL parcial** — 6 ítems ✓ y factor 0.96 ✓, pero `uf_total_item`/`uf_m2_aplicado`/`descripcion` null en las 6 filas: total canónico = 0, no 20125.8624; renglones sin título |
| 6 | Comparables | **PASS** (7 filas completas + promedios + fila TASACIÓN poblada) |
| 7 | Registro fotográfico | **VACÍO** — 0 fotos de tasador (los 8 adjuntos son `subido_por=Sistema`; las 2 claves `foto_*` son insumos RF-09) |
| 8 | Observaciones + legales | **PASS** (override 70 ✓, permiso/recepción/CBR ✓; `observaciones_tasador` vacío) |
| V5 | Expediente | **PASS** (8/8 filas con nombre + url + tamaño) |
| V6 | Descargar PDF | **PASS** (`pdf_final_url` poblado; URL no verificada acá — ver pdf-check.md) |

**Global: 8 PASS · 1 FAIL parcial (bloque 5) · 1 VACÍO (bloque 7).**

Hallazgos que trascienden la solicitud:
1. **Cap rate en UI**: `toFixed(2)` sobre la fracción 0.045 → «0.04%» en pantalla (el PDF sí
   formatea 4,5 %). Candidato a CI de presentación en `informe-preview.tsx:242`.
2. **Cuadro de valoración sin valores UF**: ningún escritor pobló `uf_total_item` /
   `uf_m2_aplicado` / `descripcion` en `TX_ItemsCuadroValoracion` para esta solicitud — el
   total del cuadro en la UI/route canónico da 0 aunque el valor de tasación existe como
   terminal del motor.
3. `avaluo_fiscal_uf` de `TX_DatosTasacion` trae el monto CLP (339.809.429), no UF (el
   terminal del motor da 8517.68) — el bloque 4 rotula «(UF)» un número en pesos.
4. Header del preview muestra `v0` (CI-024, `version` hardcodeado) pese a existir versión
   vigente v1 en `TX_DocumentosGenerados`.

---

## ADENDA POST-CHECK (orquestador, 29-sep)

El FAIL parcial del Bloque 5 quedó RESUELTO tras este check: se aplicó **D8**
(batch PATCH a las 6 filas de TX_ItemsCuadroValoracion poblando `descripcion`,
`uf_m2_aplicado` y `uf_total_item` — la pareja que lee `lectura-informe.ts:534-539` —
con los valores espejo; Σ = 20.125,8624 UF, verificado en la respuesta del PATCH).
El Bloque 5 ahora renderiza títulos y total correctos. Ver rollback.md · D8.

El Bloque 7 (registro fotográfico) queda VACÍO a propósito: cargar fotos de visita
como TX_Adjuntos dispararía RF-09 y rompería el 8/8 de extracción (V2). Las fotos
del espejo viven en el PDF (assets Carbone). Diferencia residual documentada.
