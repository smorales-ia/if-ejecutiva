# Plan de prueba de producción · MET-6283 · v3

> **v3** (17-sep-2026) fija el oráculo definitivo de **H2 avaluo_total = 339.809.429**
> (valor del informe final) y reclasifica la lectura previa del xlsx (339.609.429) como
> error de OCR corregido — ya **no** es un valor a validar. Sucede a v2, que amplió el
> plan implícito H1–H4 al **set completo de 8 documentos** de `docs/_referencias/Met_6283/`.
> El "v1" nunca existió como archivo (era el procedimiento H1–H4 embebido en
> `claude-out.txt` / Origen §2.1.4–2.1.7).

Oráculo = **Informe final** `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`
(METLIFE-6283, propietario Francisco José Vergara Undurraga, Los Eucaliptus N°2100,
Condominio Las Brisas de Chicureo, Colina; rol SII 882-40).

---

## 0 · Set completo (8 archivos)

| # | Archivo | Tipo (`clave_adjunto`) | Tabla destino | Regresión / Nuevo |
|---|---|---|---|---|
| 1 | `ok-permiso_edificacion_Met6283.pdf` | `permiso_edificacion` | TX_DocumentosLegales | Regresión |
| 2 | `ok-certificado_recepcion_final_Met6283.pdf` | `certificado_recepcion_final` | TX_DocumentosLegales | Regresión |
| 3 | `ok-foto_fuente_sii_Met6283.JPG` | `foto_fuente_sii` | TX_DatosTasacion + TX_Unidades | Regresión |
| 4 | `ok-foto_comparables_Met6283.JPG` | **`foto_ofertas_comparables`** | TX_Comparables | Regresión (⚠ ROTO — ver §5) |
| 5 | `consulta_antecedentes_bien_raiz_Met6283.pdf` (H2) | `consulta_antecedentes_bien_raiz` | TX_DatosTasacion | Nuevo (T3-T7) |
| 6 | `informe_no_expropiacion_serviu_Met6283.pdf` (H3) | `informe_no_expropiacion_serviu` | TX_DatosTasacion | Nuevo (T3-T7) |
| 7 | `inscripcion_dominio_cbr_Met6283.docx` (H4) | `inscripcion_dominio_cbr` | TX_DocumentosLegales | Nuevo (T3-T7) |
| 8 | `certificado_deuda_tgr_Met6283.pdf` (H1) | `certificado_deuda_tgr` | — (ninguna, por diseño) | Nuevo (T3-T7) |

⚠ **Discrepancia de nombre de tipo.** El archivo se llama `ok-foto_comparables_…` pero el
tipo real en `D_TipoDocumento` / `clave_adjunto` es **`foto_ofertas_comparables`**
(`recxQ6vJqEv7OFXjX`). Subir con la clave equivocada rompe el enrutamiento.

---

## 1 · Valores esperados extraídos del informe final (oráculo)

### Documentos ya cableados (regresión)

**Permiso de edificación** (bloque inferior hoja 1 del informe): **N°319 · 09/09/2020**
→ `TX_DocumentosLegales.permiso_edificacion_numero = 319` · `permiso_edificacion_fecha = 2020-09-09`.

**Recepción final** (bloque inferior hoja 1): **N°210 · 18/07/2024**
→ `TX_DocumentosLegales.recepcion_final_numero = 210` · `recepcion_final_fecha = 2024-07-18`.

**Foto fuente SII** → TX_DatosTasacion + TX_Unidades:
- `destino_sii = HABITACIONAL` · `rol_sii = 882-40` (N°882-40) · avalúo fiscal SII (anexo ROL-AVALUO).
- Líneas de edificación → **TX_Unidades**: edificación **249,91 m²** (Piso 1, ALBAÑILERÍA LADRILLO,
  regularizado 2024); terreno **5.024,86 m²**; obras complementarias (piscina, quincho + terrazas,
  bodega, cierros/pavimento). El cuadro de valoración del informe: TOTAL EDIFICACIÓN, TOTAL OBRAS
  COMPLEMENTARIAS, TOTAL TERRENO.

**Foto comparables** → TX_Comparables (`muchas_por_solicitud`):
- **Mínimo esperado: 3** (RF-24). El cuadro del informe consolida **hasta 8** referencias:
  **5 REF. OFERTAS** (filas 1–5) + **3 REF. C.B.R.** (filas 6–8). Ejemplos legibles en el informe:
  - Ref 1 · Las Brisas de Chicureo – Los Boldos · Ofert. · 2015 · 24.900 UF · const 239,00 m² · terreno 5.077,00 m² · tel 989225642
  - Ref 2 · La Viña & La Vendimia · Ofert. · 2016 · 20.000 UF · 252,00 m² · 5.051,00 m² · tel 979998714
  - Ref 3 · Ofert. · 2017 · 19.500 UF · tel 936820393
  - Refs CBR (foja-número): 40132-55521 · 47523-66056 · A 40, etc.
- PROMEDIO DE LA MUESTRA y homogeneización los calcula el motor (AT04), no la extracción.

### Documentos nuevos (T3-T7)

| Doc (H) | Campo → destino | Valor esperado (fuente) |
|---|---|---|
| H2 `consulta_antecedentes_bien_raiz` | `avaluo_total` → TX_DatosTasacion | **339.809.429** (oráculo definitivo · informe final) |
| H2 | `destino_sii` → TX_DatosTasacion | HABITACIONAL |
| H2 | `calidad_sii` → TX_DatosTasacion | (calidad SII del anexo ROL-AVALUO) |
| H3 `informe_no_expropiacion_serviu` | `n_cert_no_expropiacion` → TX_DatosTasacion | **3444743** · Afecto expropiación = **NO** ("NO cuenta con expropiación") |
| H3 | `lat` / `long` → TX_DatosTasacion | (no presentes en este certificado → probablemente vacío) |
| H4 `inscripcion_dominio_cbr` | `fojas` → TX_DocumentosLegales | **3312** (scan baja-res · "confirmar") |
| H4 | `numero_inscripcion` → TX_DocumentosLegales | **4663** ("confirmar") |
| H4 | `ano_inscripcion` → TX_DocumentosLegales | **2020** ("confirmar") |
| H1 `certificado_deuda_tgr` | — | **ninguna tabla** (por diseño). Datos del doc (tiene_deuda, monto, contribución total) NO se persisten |

---

## 2 · Orden óptimo de subida

Legales primero (para que la fila 1:1 de TX_DocumentosLegales exista antes), luego los de
TX_DatosTasacion, luego colecciones, y H1 al final (no-op):

1. **H4 CBR** (`inscripcion_dominio_cbr`) → crea/rellena TX_DocumentosLegales (fojas/número/año).
2. **Permiso** (`permiso_edificacion`) → TX_DocumentosLegales (par permiso).
3. **Recepción** (`certificado_recepcion_final`) → TX_DocumentosLegales (par recepción).
4. **H3 SERVIU** (`informe_no_expropiacion_serviu`) → TX_DatosTasacion (n_cert/lat/long).
5. **H2 SII** (`consulta_antecedentes_bien_raiz`) → TX_DatosTasacion (avaluo_total/destino/calidad).
6. **Foto fuente SII** (`foto_fuente_sii`) → TX_DatosTasacion + TX_Unidades.
7. **Foto comparables** (`foto_ofertas_comparables`) → TX_Comparables.
8. **H1 TGR** (`certificado_deuda_tgr`) → no-op (verificar que NO escribe en ninguna tabla).

> Tras cada subida: esperar a que `estado_extraccion` pase a `listo` y que AT03-Ext corra
> (dispara al escribirse `atributos_obtenidos`). Verificar en `LogEscenarios`.

---

## 3 · Tabla oráculo (Doc / Tipo / Tabla / Campos / Valor esperado / Regresión-Nuevo)

| Doc | Tipo | Tabla destino | Campos | Valor esperado | R/N |
|---|---|---|---|---|---|
| CBR | inscripcion_dominio_cbr | TX_DocumentosLegales | fojas · numero_inscripcion · ano_inscripcion | 3312 · 4663 · 2020 | Nuevo |
| Permiso | permiso_edificacion | TX_DocumentosLegales | permiso_edificacion_numero · _fecha | 319 · 2020-09-09 | Regresión |
| Recepción | certificado_recepcion_final | TX_DocumentosLegales | recepcion_final_numero · _fecha | 210 · 2024-07-18 | Regresión |
| SERVIU | informe_no_expropiacion_serviu | TX_DatosTasacion | n_cert_no_expropiacion · lat · long | 3444743 · (vacío) · (vacío) | Nuevo |
| SII consulta | consulta_antecedentes_bien_raiz | TX_DatosTasacion | avaluo_total · destino_sii · calidad_sii | 339.809.429 · HABITACIONAL · (SII) | Nuevo |
| Foto SII | foto_fuente_sii | TX_DatosTasacion + TX_Unidades | avaluo/destino/rol/cod SII + edificación por unidad | rol 882-40 · HABITACIONAL · 249,91 m² · 5.024,86 m² | Regresión |
| Foto comparables | foto_ofertas_comparables | TX_Comparables | ≥3 filas (precio_uf, sup, año, tel, foja-número…) | ≥3 (informe: hasta 8) | Regresión (⚠ ROTO) |
| TGR | certificado_deuda_tgr | — | — | ninguna escritura | Nuevo (no-op) |

---

## 4 · Regresiones a vigilar

- **permiso_edificacion + certificado_recepcion_final** deben seguir poblando
  TX_DocumentosLegales **sin error** (`una_por_solicitud → TX_DocumentosLegales`). El fix v3
  quedó **confirmado conductualmente** en LogEscenarios (corridas 10-sep 22:06 en adelante;
  la firma de error v2 "…no es TX_DatosTasacion" desapareció). Vigilar `0 err` en el log.
- **foto_fuente_sii** debe seguir poblando TX_DatosTasacion (bloque SII) **y** TX_Unidades
  (merge por unidad / líneas de edificación) sin romperse por la generalización v3 de
  `resolverFila1a1`. Vigilar que la terna de dominio (si la trae la foto) vaya a
  TX_DocumentosLegales y el resto a DatosTasacion/Unidades.
- **foto_ofertas_comparables (muchas_por_solicitud → TX_Comparables): ⚠ reportado ROTO.**
  El cableado D_ está correcto (13 atributos, `muchas_por_solicitud`, TX_Comparables) y el
  **script canónico v3 SÍ implementa** la rama (§3c acumula, §3d agrupa por `fila` y hace
  upsert por `clave_natural` `${codigo_ext}|COMP-NN`). Por tanto NO se "salta" en el código
  del repo. La causa probable del ROTO es el **guard anti-merge**: si algún item extraído
  llega **sin `fila` válida**, el bucket completo se **ANULA** (0 comparables, `propError`) —
  ver el literal `"muchas_por_solicitud: bucket ANULADO por item(s) sin fila"`. Verificar en
  la corrida real:
  - Si TX_Comparables recibe **≥3 filas** → **destrabado** (documentar qué lo destrabó).
  - Si `LogEscenarios` muestra `"bucket ANULADO"` o `0 ok` en comparables → **falla como
    esperado** (la extracción no entrega `fila` por item). Documentar y NO dar por regresión rota.
  - Riesgo colateral A-45 (huérfanos): el upsert nunca borra COMP sobrantes de corridas previas.

---

## 5 · Cierre de tasación (AT01–AT10) vs oráculo

Con las 7 tablas pobladas, correr el motor (AT01 resuelve reglas; AT03_Calculos_DAG ejecuta
el DAG). Comparar el **valor final** con el informe:

| Concepto | Oráculo (informe) |
|---|---|
| **VALOR TASACIÓN / Comercial normal** | **UF 20.125,86** · **$ 802.913.431** |
| **Valor a Remate** | **UF 13.081,81** |
| UF del día (13-04-2026) | 39.894,61 |
| (contexto) Edif. depreciada (BI59) / Reposición (BG72) | UF 8.157,06 / **9.246,94** · Terreno (BI61) 11.218,80 UF |

> **Corrección de etiquetas (D-4/D-5).** La versión previa rotulaba `8.157,06` como Liquidación
> y `9.255,51` como Reposición: `8.157,06` es la **edificación depreciada (BI59)**, `9.255,51`
> era un **typo** (no existe en ninguna celda; la reposición real es `9.246,94`, celda `BG72`), y
> `11.218,80` es el **terreno (BI61)**, no la reposición.

> El valor final debe caer dentro de tolerancia del oráculo. Divergencias grandes ⇒ revisar
> inputs (superficies, comparables homogeneizados, factores).

---

## 6 · Prueba de borrado en cascada (extendida)

Borrar cada adjunto desde la UI del Tasador y verificar la limpieza:

| Borrar | Efecto esperado |
|---|---|
| H4 CBR | `TX_DocumentosLegales.fojas / numero_inscripcion / ano_inscripcion` → null |
| Permiso | `TX_DocumentosLegales.permiso_edificacion_numero / _fecha` → null |
| Recepción | `TX_DocumentosLegales.recepcion_final_numero / _fecha` → null |
| H3 SERVIU | `TX_DatosTasacion.n_cert_no_expropiacion / lat / long` → null |
| H2 SII | `TX_DatosTasacion.avaluo_total / destino_sii / calidad_sii` → null |
| Foto SII | `TX_DatosTasacion` (campos SII) → null **+** limpiar campos merge en TX_Unidades (conservando la fila) |
| Foto comparables | Según bug ROTO: si escribió filas, el cascade patrón b (por `adjunto_origen`) las borra/desliga; si no escribió, no hay nada que borrar. Revisar comportamiento |
| H1 TGR | **No debe afectar ninguna tabla** (no participa del cascade) |

⚠ Campos **compartidos (Q1)**: `destino_sii`/`calidad_sii` los comparten H2, foto_fuente_sii y
certificado_avaluo_fiscal; la terna de dominio la comparten H4 y foto_fuente_sii. Borrar uno
limpia lo que ese tipo pudo poblar — comportamiento esperado, no bug.

---

## 7 · Formato del reporte final (para pegar tras correr la prueba)

**Tabla de resultados por campo:**

| Doc | Tipo | Campo | Esperado | Obtenido | OK/FAIL | LogEscenarios (ok·skip·err) |
|---|---|---|---|---|---|---|
| … | … | … | … | … | … | … |

**Resultado del cascade por documento:**

| Doc | Campos que debían quedar null | ¿Quedaron null? | OK/FAIL |
|---|---|---|---|

**Valor final de tasación vs oráculo:**

| Concepto | Oráculo | Obtenido | Δ | OK/FAIL |
|---|---|---|---|---|
| Valor tasación UF | 20.125,86 | | | |
| Valor tasación $ | 802.913.431 | | | |
| Valor a remate UF | 13.081,81 | | | |

---

## CIERRE DE TASACIÓN — VALIDACIÓN AT03 v32

`AT03_Calculos_DAG` (v32) corre sobre `TX_Solicitudes.estado = visitada` y escribe los valores
finales en `TX_Calculos`, resolviendo el DAG de `C_Formulas` según las `formulas_resultado` de
la `regla_aplicada`.

### Tabla oráculo — 13 valores finales v3.2 (informe MET-6283)

| # | Valor | Fórmula (C_Formulas · variable_output) | Oráculo UF | Oráculo CLP (UF × 39.894,61) |
|---|---|---|---|---|
| 1 | Valor Comercial UF | F_ValorComercialUF · valor_comercial_uf | **20.125,86** | — |
| 2 | Valor Comercial CLP | F_ValorComercialCLP · valor_comercial_clp | — | **802.913.431** |
| 3 | Valor Reposición UF | F_ValorReposicionUF · valor_reposicion_uf | **9.246,94** | 368.903.065 |
| 4 | Valor Reposición CLP | F_ValorReposicionCLP · valor_reposicion_clp | — | 368.903.065 |
| 5 | Seguro Incendio UF | F_SeguroIncendioUF · seguro_incendio_uf | **8.907,06** | 355.343.781 |
| 6 | Seguro Incendio CLP | F_SeguroIncendioCLP · seguro_incendio_clp | — | 355.343.781 |
| 7 | Avalúo Fiscal UF | F_AvaluoFiscalUF · avaluo_fiscal_uf | **8.517,68** | (input 339.809.429) |
| 8 | Valor a Remate UF (65%) | F_ValorRemateUF · valor_remate_uf | **13.081,81** | 521.893.730 |
| 9 | Valor a Remate CLP | F_ValorRemateCLP · valor_remate_clp | — | 521.893.730 |
| 10 | Liquid. Normal UF (82,5%) | F_ValorLiquidacionUF · valor_liquidacion_uf | **16.603,84** (xlsm 16.603,8365; ±1%) | 662.403.581 |
| 11 | Liquid. Normal CLP | F_ValorLiquidacionCLP · valor_liquidacion_clp | — | 662.403.581 |
| 12 | Ingreso Líquido Anual CLP | F_IngresoLiquidoAnualCLP · ingreso_liquido_anual_clp | — | 36.300.000 |
| 13 | Renta Perpetua CLP | F_RentaPerpetuaCLP · renta_perpetua_clp | — | 806.666.667 |

Input clave: **UF del día = 39.894,61** (13-04-2026). CLP = UF × 39.894,61 (verificado contra
los CLP del informe). Las 13 fórmulas v3.2 están **activas** y `es_terminal=TRUE` en `C_Formulas`.

### ⚠ Bloqueo #1 — la regla asignada por AT01 no es la v3.2
Al crear la sandbox, **AT01 asignó `Regla_MetLife_Refinanciamiento_Casa`** (`recoZuF6otZ5Bcs2g`),
cuyas `formulas_resultado` son el set **v3.1** (UF, más intermedias F_ValorTerreno/
F_ValorEdificacion/F_UFm2_*). **NO** es `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`), cuyas
`formulas_resultado` son las **13 terminales v3.2 (CLP)** del oráculo. AT01 prefiere la regla
MetLife por especificidad (`cliente = MetLife`). Antes de disparar AT03:
- **Opción 1 (test v32):** `PATCH regla_aplicada = REGLA_REFI_CASA_V32` en la sandbox.
- **Opción 2 (producción real):** actualizar `Regla_MetLife_Refinanciamiento_Casa.formulas_resultado`
  al set v3.2 (cambio de catálogo del motor · requiere aprobación).

### ⚠ Bloqueo #2 — la clave de precio unitario necesita "BUENA"
`C_PreciosUnitarios` se indexa por `clave_natural = "Casa-Albanileria-BUENA"` (uf_m2 = **34**,
coincide con "UF/m² Nuevo 34,00" del informe). El DAG arma la clave desde tipo + material +
**calidad**. En la sandbox `material_predominante = "ALBAÑILERÍA LADRILLO"` (requiere
normalización → "Albanileria") y **`calidad_construccion` quedó vacío** (campo numérico; "BUENA"
es cualitativo). Verificar de qué campo lee el DAG la calidad; si no arma "…-BUENA", la
edificación no se valoriza.

### ⚠ Bloqueo #3 — `M_Comunas.Colina.uf_m2_terreno = 17` es inverosímil
Lote rural de 5.024,86 m²; el informe homogeniza terreno a ~2–3 UF/m² vía comparables. Si el
DAG usa el default de comuna (17 UF/m²), el terreno da ~85.000 UF (vs. ~20.000 UF de tasación
total). El resultado sólo cuadra si `TX_Comparables` está poblado (bug ROTO §4) y el DAG lo usa.

### Precondiciones antes de forzar `visitada`
1. Los 8 documentos subidos, extracción propagada (§2), cascade OK.
2. `TX_DatosTasacion` completo (§Datos base) — incluida la calidad del Bloqueo #2.
3. `TX_Comparables` con ≥3 filas (Bloqueo #3 / bug ROTO §4).
4. `regla_aplicada` = regla con las 13 fórmulas v3.2 (Bloqueo #1).
5. Estado `asignada` → transición a `visitada` dispara AT03.

### Procedimiento
1. Resolver Bloqueos #1–#3. 2. `PATCH TX_Solicitudes.estado = "visitada"`. 3. Esperar ~30 s
(AT03 es asíncrono). 4. Leer `TX_Calculos` y comparar con la tabla oráculo.

### Criterios de éxito
Cada uno de los **13 valores** dentro de **±1 %** del oráculo · historial de AT03 sin error.

### Formato del reporte AT03
| # | Valor | Esperado | Obtenido | Δ % | OK/FAIL |
|---|---|---|---|---|---|
| … | … | … | … | … | … |

---

## Solicitud sandbox creada (esta tanda)

**Creada vía MCP el 17-sep-2026** (ya no hay que crearla):
- **record_id `recNiwM4s1ibr3sbO`** · **codigo_ext `VP-2026-0066`** · `numero_solicitud = METLIFE-6283-TEST`.
- estado **`asignada`** · tasador **Nelcy Jaimes** (`recJPSCLckxLuf9nV`, disponible) · cliente **MetLife** (`recIg8NtVhptXkEUJ`).
- comuna **Colina** (`recKT9mUJkeq3YuBu`) · tipo_propiedad **Casa** (`recrXDAjlVCe59XBW`) · tipo_informe **Refinanciamiento** (`recreojxTjoAWOEHa`).
- dirección `LOS EUCALIPTUS 2100` · rol_sii `00882-00040` · región `Metropolitana de Santiago` · fecha_solicitud 17-09-2026 (para que el código deje de ser `VP-NaN`).
- propietario/cliente_final: `FRANCISCO JOSE VERGARA UNDURRAGA` · RUT `16.610.203-0`.
- **`regla_aplicada` asignada por AT01 = `Regla_MetLife_Refinanciamiento_Casa`** (⚠ Bloqueo #1).

**`TX_DatosTasacion` sembrada** (`recfgslxbCJN5oAoD`, linkeada): uf_dia_visita 39.894,61 ·
arriendo_bruto_mensual_clp 3.300.000 · gasto_anual_clp 3.300.000 (verificado por renta perpetua
806.666.667) · tasa_cap_rate 0,045 · avaluo_fiscal_clp 339.809.429 · sup_construccion_m2 249,91 ·
sup_terreno_m2 5.024,86 · anio_construccion 2020 · material_predominante "ALBAÑILERÍA LADRILLO" ·
estado_conservacion "Bueno" · velocidad_venta_estimada "8 a 10 meses" · origen_dato "tipeado" ·
propietario_nombre/rut.

**Campos vacíos pendientes (requeridos por AT03 v32):**
- `calidad_construccion` — campo numérico; "BUENA" es cualitativo → no seteado (Bloqueo #2).
- `TX_Unidades` — sin filas aún (las crea la extracción de foto_fuente_sii / plano).
- `TX_Comparables` — sin filas (las crea foto_ofertas_comparables · bug ROTO §4).
- `regla_aplicada` — es la MetLife (v3.1), no la v3.2 (Bloqueo #1).

> El rig anterior VP-2026-0060 (`rec75VXoWvRImjd0f`, propiedad Chaiten/Santiago) queda descartado
> para la validación de valuación: propiedad distinta. Sólo servía para mecánica de pipeline.

---

## Discrepancias informe vs xlsx de análisis

1. **Avalúo total (H2) — RESUELTO (v3).** Oráculo definitivo = **339.809.429** (informe final). El xlsx v1 (`lectura_datos_consulta_antecedentes_bien_raiz_v1.xlsx`) traía **339.609.429**: se reclasifica como **error de OCR corregido**, NO como valor a validar. La prueba compara la extracción contra 339.809.429.
2. **Nombre de tipo comparables:** archivo `ok-foto_comparables_…` pero tipo real `foto_ofertas_comparables`.
3. **VP-2026-0060 ≠ propiedad MET-6283** (Chaiten/Santiago vs Los Eucaliptus/Colina): el rig de prueba no reproduce la valuación del informe.
4. **H4 foja/número/año (3312/4663/2020):** provienen de un scan de baja resolución del DOCX y el xlsx los marca "confirmar".
