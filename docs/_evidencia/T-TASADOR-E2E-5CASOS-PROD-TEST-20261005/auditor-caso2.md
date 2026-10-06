# Dictamen auditor ciego · Caso 2 · VP-2026-0074

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005
**Auditor:** agente ciego (sin lectura previa de la evidencia de esta carpeta)
**Fecha auditoría:** 2026-10-05 (UTC)
**Solicitud:** `recconVQfAc8LSGJf` · TX_Solicitudes `tblaHTyMHYfmy7Fg6` · `codigo_ext = VP-2026-0074` · `estado = calculada`
**Oráculo:** `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso2-oraculo.json` (bloque `salidas_esperadas`)
**Fuentes:** Airtable REST (GET, token server-side de `.env.local`) + producción `https://if-ejecutiva-production.up.railway.app`. Cómputo propio, sin leer evidencia del piloto.

---

## 1. Igualdad TX_Calculos vs salidas_esperadas

TX_Calculos `tblFz37KSvn5pLKDR`, filtro `{solicitud_codigo}='VP-2026-0074'` → **17 filas** (13 terminales + 4 analíticas).

### 1.1 Terminales (13/13 OK · 100 %)

| variable_output | esperado (oráculo) | resultado (TX_Calculos) | dictamen |
|---|---|---|---|
| valor_comercial_uf | 1394 | 1394 | OK |
| valor_comercial_clp | 56164915.18 | 56164915.18 | OK |
| valor_reposicion_uf | 1115.2 | 1115.2 | OK |
| valor_reposicion_clp | 44931932.144 | 44931932.144 | OK |
| seguro_incendio_uf | 1394 | 1394 | OK |
| seguro_incendio_clp | 56164915.18 | 56164915.18 | OK |
| avaluo_fiscal_uf | 1256.2748213163063 | 1256.2748213163063 | OK |
| valor_remate_uf | 906.1 | 906.1 | OK |
| valor_remate_clp | 36507194.867 | 36507194.867 | OK |
| valor_liquidacion_uf | 1150.05 | 1150.05 | OK |
| valor_liquidacion_clp | 46336055.0235 | 46336055.0235 | OK |
| renta_perpetua_clp | 58666666.66666667 | 58666666.66666667 | OK |
| ingreso_liquido_anual_clp | 3520000 | 3520000 | OK |

**% igualdad terminales: 13/13 = 100 % (coincidencia exacta, sin tolerancia).**

Nota de estado del registro: `override_motivo` indica que `valor_reposicion_override` fue **retirado** (piloto G-1/G-2) y el motor calculó 1115.2 = 0.8 × 1394 por sí mismo; `valor_seguro_override = 1394` sigue presente. La reposición correcta sin override confirma el fix G-1 en este caso.

### 1.2 Filas analíticas (residuo conocido — separadas de los terminales)

| variable_output | esperado (oráculo) | resultado | dictamen |
|---|---|---|---|
| desviacion_vs_promedio_pct | -4.931601457927626 | 0 | MISS · residuo conocido **G-6** |
| desviacion_vs_promedio_cbr_pct | 1.872659176029967 | 0 | MISS · residuo conocido **G-6** |
| promedio_uf_m2_cbr_out | 33.375 (clave oráculo `promedio_uf_m2_cbr`) | 0 | MISS · mismo bloque analítico en 0 |
| promedio_uf_m2_muestra | — (oráculo trae `promedio_uf_m2_ofertas` = 35.763724…) | 35.08123167966374 | definición distinta: el motor promedia los **7** comparables (verificado por cómputo propio: 245.5686…/7 = 35.08123…); el oráculo promedia solo las 5 ofertas (178.8186…/5 = 35.76372…). No es error aritmético sino de alcance de la muestra |

Las claves `uf_dia`, `usd_dia`, `_nota` y `celdas_oraculo` del oráculo se excluyeron por instrucción (no viven en TX_Calculos).

---

## 2. Las 6 vistas (solicitud en `calculada`)

### V1 · Adjuntos por subido_por — **OK**

TX_Adjuntos `tblur71x1oItbmKZc`, 24 registros linkeados a la solicitud (el filtro por `{solicitud_codigo}` no aplica en esa tabla; se leyeron uno a uno por record ID):

- **16 × `subido_por = Tasador`** (fotos `caso2_*.jpg`: mapa, ofertas, planificación, fachada, living-comedor, cocina, habitaciones) — todos `estado_extraccion = listo`, sin `atributos_obtenidos` (correcto: las fotos no se extraen).
- **8 × `subido_por = Sistema`** (permiso_edificacion, foto_fuente_sii, foto_ofertas_comparables, certificado_deuda_tgr, certificado_recepcion_final, consulta_antecedentes_bien_raiz, informe_no_expropiacion_serviu, inscripcion_dominio_cbr · sufijo AGH1548) — todos `estado_extraccion = listo`.

### V2 · atributos_obtenidos — **OK**

Los 8 documentos Sistema tienen `atributos_obtenidos` con **JSON válido** (estructura `{items:[{codigo_atributo, valor, confianza, fila}], no_extraidos:[]}`). Valores contrastados con el caso:

- `direccion` = "Coronel Souper N° 4060, Departamento: N°2502 B, Edificio Mirador Souper" ✓ (permiso, recepción final, antecedentes, SERVIU)
- `comuna` = "Estación Central" ✓ (TGR, recepción final, antecedentes, SERVIU, CBR)
- `rol_sii` = "694-416" ✓ (TGR, antecedentes, SERVIU) · `cod_sii_manzana`/`cod_sii_predio` = 694/416 ✓ (SII)
- `nombre_propietario` = "ANDRES PABLO ISRAEL AVRAM" ✓ (permiso, TGR, CBR)
- Extra coherente: `avaluo_fiscal_clp` = 50615903 ✓, `superficie_construida_m2` = 41 ✓.

### V3 · TX_DatosTasacion poblada — **OK**

Registro `recH7CKbksOfNu0OZ` linkeado a la solicitud, poblado y coherente con el caso: propietario ANDRES PABLO ISRAEL AVRAM / 7.774.862-8, sup_construccion 41 m², año 2018, HORMIGON ARMADO, 2 dorm / 1 baño, avaluo_fiscal_clp 50.615.903, arriendo 320.000, tasa_cap_rate 0.06, uf_dia_visita 40290.47, rol 694-416, destino HABITACIONAL, urbano, síntesis y descripción de sector presentes.

Observación menor (no bloqueante, fuera del alcance de las 6 vistas): `avaluo_fiscal_uf = 50615903` en TX_DatosTasacion contiene el valor CLP, no UF; el UF correcto (1256.27…) sí está en TX_Calculos.

### V4 · Estado — **OK**

`estado = calculada` en TX_Solicitudes. Linkeados además: 17 TX_Calculos, 7 TX_Comparables, 5 TX_HabitacionesPorNivel, 1 TX_ItemsCuadroValoracion, 1 TX_DocumentosLegales, A_DecisionesMotor con `regla_aplicada = rec2QYP8yjMW1Smsm`.

### V5 · Tasador y visador — **OK**

- `tasador = ["recTJcV3BIvdcG4em"]` ✓ (esperado exacto)
- `visador = ["recrjQDympldI186S"]` ✓ (coincide con `links.visador` del oráculo — Héctor Martínez C.)

### V6 · pdf_final_url — **PENDIENTE (esperado)**

El campo `pdf_final_url` **no está presente** en el record (vacío). Es el resultado esperado: E3 (pipeline PDF) está inactivo. No computa como FAIL.

---

## 3. Producción (guard sin sesión)

GET sin autenticación contra `https://if-ejecutiva-production.up.railway.app`:

| Ruta | HTTP | dictamen |
|---|---|---|
| `/tasaciones/recconVQfAc8LSGJf` | 404 | guard esperado ✓ |
| `/tasaciones/recconVQfAc8LSGJf/fotos` | 404 | guard esperado ✓ |
| `/tasaciones/recconVQfAc8LSGJf/lectura` | 404 | guard esperado ✓ |
| `/tasaciones/recconVQfAc8LSGJf/informe` | 404 | guard esperado ✓ |

---

## 4. Veredicto

| Vista | Resultado |
|---|---|
| V1 adjuntos (Sistema + Tasador, estado_extraccion) | **OK** |
| V2 atributos_obtenidos (JSON + valores del caso) | **OK** |
| V3 TX_DatosTasacion poblada | **OK** |
| V4 estado `calculada` | **OK** |
| V5 tasador + visador | **OK** |
| V6 pdf_final_url | **PENDIENTE** (vacío, E3 inactivo — esperado) |

**VEREDICTO: OK (V1–V5 todas OK).**
**% igualdad terminales TX_Calculos vs oráculo: 100 % (13/13 exactos).**
Residuo analítico conocido G-6: `desviacion_vs_promedio_pct`, `desviacion_vs_promedio_cbr_pct` y `promedio_uf_m2_cbr_out` en 0; `promedio_uf_m2_muestra` promedia los 7 comparables (35.0812) mientras el oráculo promedia solo las 5 ofertas (35.7637). Guard de producción verificado (404 × 4).
