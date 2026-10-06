# Auditoría ciega · Caso 1 · VP-2026-0073 (reczuns8NHdI45Owp)

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · **Auditor:** ciego (sin leer entregables del ejecutor)
**Fuentes:** Airtable REST GET (base `app9G7lLkIV3CpeLa`), oráculo `docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/caso1-oraculo.json`, producción `https://if-ejecutiva-production.up.railway.app`.
**Fecha de auditoría:** 2026-10-05 (estado del record: `ultima_modificacion` 2026-10-06T00:25:25Z).

---

## 1. % IGUALDAD — TX_Calculos vs oráculo (bloque `calculos`)

TX_Calculos (`tblFz37KSvn5pLKDR`) filtrado por `{solicitud_codigo}='VP-2026-0073'` devolvió **15 filas**. Comparación variable por variable (cómputo propio del auditor):

| # | variable_output | TX_Calculos (resultado) | Oráculo | Dictamen |
|---|---|---:|---:|---|
| 1 | valor_comercial_uf | 3323.2 | 3323.20 | OK |
| 2 | valor_comercial_clp | 132402004 | 132402004 | OK |
| 3 | valor_reposicion_uf | 3364 | 3364.00 | OK |
| 4 | valor_reposicion_clp | 134027546.08 | 134027546.08 | OK |
| 5 | seguro_incendio_uf | 2658.56 | 2658.56 | OK |
| 6 | seguro_incendio_clp | 105921603.12 | 105921603.12 | OK |
| 7 | avaluo_fiscal_uf | 2898.01 | 2898.01 | OK |
| 8 | valor_remate_uf | 2160.08 | 2160.08 | OK |
| 9 | valor_remate_clp | 86061302.54 | 86061302.54 | OK |
| 10 | valor_liquidacion_uf | 2741.64 | 2741.64 | OK |
| 11 | valor_liquidacion_clp | 109231653.22 | 109231653.22 | OK |
| 12 | renta_perpetua_clp | 173555555.56 | 173555555.56 | OK |
| 13 | ingreso_liquido_anual_clp | 7810000 | 7810000 | OK |
| 14 | promedio_uf_m2_muestra | 45.30398120124996 | 45.30398120124996 | OK |
| 15 | desviacion_vs_promedio_pct | -30.248955694145174 | -30.248955694145174 | OK |

**Resultado: 15/15 OK · 0 MISS · % IGUALDAD = 100%.** Las 15 variables del oráculo están presentes como terminales en TX_Calculos; no hay variables extra ni faltantes. Las coincidencias de alta precisión (14 y 15, >14 decimales idénticos) confirman réplica exacta del motor, no redondeo casual.

Verificación de consistencia interna del auditor: `promedio_uf_m2_muestra` = media de las 5 Ofertas del oráculo con (precio_uf − oo_cc_uf)/sup, excluyendo la referencia CBR → 226.5199…/5 = 45.30398120124996 ✓ (reproducido independientemente).

---

## 2. Seis vistas (contrato de datos · estado actual `calculada`)

### V1 — Adjuntos por `subido_por` · estado de extracción — **OK**

26 adjuntos linkeados al record. Conteo:

| subido_por | n | Detalle | estado_extraccion |
|---|---:|---|---|
| Tasador | 18 | fotos `caso1_*.jpg` (mapa_ubicacion, 3 ofertas_comparables, fachada_exterior, living_comedor, habitaciones) | 18/18 `listo` |
| Sistema | 8 | permiso_edificacion, foto_fuente_sii, foto_ofertas_comparables, certificado_deuda_tgr, certificado_recepcion_final, consulta_antecedentes_bien_raiz, informe_no_expropiacion_serviu, inscripcion_dominio_cbr (`*_Metlife6280.*`) | 8/8 `listo` |

Hay documentos 'Sistema' Y fotos 'Tasador'; **26/26 con `estado_extraccion='listo'`**. ✔

### V2 — `atributos_obtenidos` de los 8 adjuntos Sistema — **OK**

Los 8 son JSON válido, con `items` no vacíos y `no_extraidos=[]`:

| Adjunto (Sistema) | items | no_extraidos | Valores clave vs oráculo |
|---|---:|---|---|
| permiso_edificacion | 6 | [] | dirección "LA MARINA Nº 1176, Departamento: Nº 102, Edificio GUILLERMO II" ✓ · sup 102 ✓ · propietario "ALEJANDRO MOISES AVILA LEIVA" ✓ · año 1998 ✓ |
| foto_fuente_sii | 6 | [] | avaluo_fiscal_clp 115461656 ✓ · destino HABITACIONAL ✓ · manzana 4852 / predio 250 ✓ · sup_terreno 102 ✓ |
| foto_ofertas_comparables | 54 | [] | 6 filas: direcciones, años, teléfonos, precios_uf (4590/4648/4850/4500/5200/4172), sup y oo_cc ✓ contra bloque `comparables` del oráculo (ver observación O-1) |
| certificado_deuda_tgr | 5 | [] | rol 4852-250 ✓ · propietario ✓ · sin deuda |
| certificado_recepcion_final | 6 | [] | sup 102 ✓ · dirección ✓ · rol ✓ |
| consulta_antecedentes_bien_raiz | 6 | [] | dirección ✓ · rol 4852-250 ✓ · avaluo_total 115461656 ✓ · propietario ✓ |
| informe_no_expropiacion_serviu | 4 | [] | no expropiación · dirección ✓ · rol ✓ |
| inscripcion_dominio_cbr | 3 | [] | propietario/comprador "ALEJANDRO MOISES AVILA LEIVA" ✓ |

Los cuatro valores exigidos por el contrato (dirección, rol, avalúo, propietario) coinciden con el oráculo en todos los adjuntos donde aparecen. ✔

**Observación O-1 (no bloqueante):** el atributo `uf_m2_construccion_f` de la foto de ofertas (y el campo `uf_m2_construccion` persistido en TX_Comparables, comp_id 144–149) vale precio_uf/sup **sin** restar oo_cc_uf (p.ej. fila 1: 48.3158 vs 43.0526 del bloque `comparables` del oráculo, que usa (precio−oo_cc)/sup). El motor sin embargo calculó `promedio_uf_m2_muestra` con la fórmula del oráculo (45.30398… exacto), de modo que el cálculo terminal es correcto; la divergencia queda en un campo derivado de despliegue. No afecta V2 (los cuatro valores del contrato coinciden) ni el % de igualdad.

### V3 — TX_DatosTasacion linkeada (rec2AQQJfvHczhWkZ) — **OK**

| Campo | Airtable | Oráculo | ✓ |
|---|---|---|---|
| propietario_nombre | ALEJANDRO MOISES AVILA LEIVA | idem | ✓ |
| propietario_rut | 5.523.876-6 | idem | ✓ |
| sup_construccion_m2 / sup_terreno_m2 | 102 / 102 | 102 / 102 | ✓ |
| anio_construccion | 1998 | 1998 | ✓ |
| rol_sii (y manzana/predio) | 4852-250 (4852/250) | idem | ✓ |
| avaluo_fiscal_clp / avaluo_total | 115461656 / 115461656 | idem | ✓ |
| Extras verificados | material HORMIGON ARMADO · dorm 5 · baños 2 · bodegas 1 · arriendo 710000 · tasa_cap_rate 0.045 · uf_dia_visita 39841.72 · destino HABITACIONAL · zona EC-3 (San Miguel) · velocidad 8 a 10 meses · sintesis/descripcion_sector | idem | ✓ |

**Observación O-2 (menor, no es criterio V3):** el campo `avaluo_fiscal_uf` de TX_DatosTasacion contiene 115461656 (valor CLP en un campo con sufijo `_uf`); el terminal correcto en TX_Calculos (`avaluo_fiscal_uf`=2898.01) está bien. El oráculo no define ese campo en `datosTasacion`, así que no puntúa.

### V4/V5 — Estado, tasador, visador — **OK**

- `estado` = **`calculada`** ∈ {calculada, pdf_listo} ✓
- `tasador` = `["recTJcV3BIvdcG4em"]` — exactamente el exigido ✓ (coincide con `links.tasador` del oráculo)
- `visador` = `["recrjQDympldI186S"]` — poblado ✓ (coincide con `links.visador` del oráculo, Héctor Martínez C.)
- Complementos consistentes con el oráculo: `fecha_visita_programada` 2026-04-06 ✓ · `n_operacion_cliente` 900158881 ✓ · `numero_solicitud` "METLIFE -6280" ✓ · `vida_util_override` 55 ✓ · links cliente/comuna/tipo_informe/tipo_propiedad ✓ · `A_DecisionesMotor` linkeado (1 registro) y `regla_aplicada` poblada.

### V6 — `pdf_final_url` — **PENDIENTE (esperado)**

`pdf_final_url` **no está poblado** en el record. Es el resultado esperado: E3 (SC10_Carbone_Download_Dropbox) está inactivo, el pipeline PDF no corre en esta tanda. Se reporta como PENDIENTE, no como falla.

---

## 3. Producción (GET sin auth)

| Ruta | VP-2026-0073 (reczuns8NHdI45Owp) | Patrón de referencia (recmMzeu3eWGxyXsf) |
|---|---:|---:|
| /tasaciones/{rec} | 404 | 404 |
| /tasaciones/{rec}/fotos | 404 | 404 |
| /tasaciones/{rec}/lectura | 404 | 404 |
| /tasaciones/{rec}/informe | 404 | 404 |

**404 uniforme en las 8 peticiones** — idéntico al patrón del record de referencia. Es el guard esperado sin sesión: no filtra existencia del recurso ni expone datos. ✔

---

## 4. VEREDICTO

| Vista | Dictamen |
|---|---|
| V1 (adjuntos Sistema+Tasador, 26/26 `listo`) | **OK** |
| V2 (8/8 AO JSON válido, items≠∅, no_extraidos=[], valores = oráculo) | **OK** (con observación O-1 sobre `uf_m2_construccion`, no bloqueante) |
| V3 (TX_DatosTasacion = oráculo) | **OK** (observación menor O-2) |
| V4 (estado `calculada`) | **OK** |
| V5 (tasador recTJcV3BIvdcG4em · visador recrjQDympldI186S) | **OK** |
| V6 (pdf_final_url) | **PENDIENTE** — esperado, E3 inactivo |
| Producción (guard 404 uniforme, = referencia) | **OK** |

### % IGUALDAD TX_Calculos vs oráculo: **100% (15/15)**

**Caso 1: APROBADO.** V1–V5 OK, V6 pendiente por diseño, motor de cálculo replicado al decimal.
