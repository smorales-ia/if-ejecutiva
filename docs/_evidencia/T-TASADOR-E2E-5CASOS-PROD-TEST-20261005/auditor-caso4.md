# Dictamen de auditoría ciega · Caso 4 · VP-2026-0076 (`rectnGOaHvEioXZw3`)

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · **Auditor:** agente ciego (sin lectura previa de esta carpeta de evidencia)
**Fecha de auditoría:** 2026-10-06 (UTC) · 2026-10-05 (hora Chile)
**Fuentes usadas:** Airtable REST GET con `AIRTABLE_TOKEN` de `.env.local` (base `app9G7lLkIV3CpeLa`), `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso4-oraculo.json` (`salidas_esperadas`), y `https://if-ejecutiva-production.up.railway.app`. Cómputo propio (Python, comparación con tolerancia relativa 1e-9).

---

## 1. % IGUALDAD · TX_Calculos vs `salidas_esperadas`

`TX_Calculos` (`tblFz37KSvn5pLKDR`) filtrada por `{solicitud_codigo}='VP-2026-0076'`: **17 filas** (`variable_output` / `resultado`). Se ignoran `uf_dia`/`usd_dia` del oráculo según instrucción.

### 1.a Terminales (13) — comparación OK/MISS

| Variable | Esperado (oráculo) | Real (TX_Calculos) | Dictamen |
|---|---|---|---|
| valor_comercial_uf | 1072.17 | 1072.1699999999998 | OK (δ float −2.3e−13) |
| valor_comercial_clp | 42 717 096.9324 | 42 717 096.932399996 | OK (δ float −7.5e−9) |
| valor_reposicion_uf | 902.88 | 902.88 | OK (exacto) |
| valor_reposicion_clp | 35 972 292.1536 | 35 972 292.1536 | OK (exacto) |
| seguro_incendio_uf | 857.736 | 857.736 | OK (exacto) |
| seguro_incendio_clp | 34 173 677.54592 | 34 173 677.54592 | OK (exacto) |
| avaluo_fiscal_uf | 678.4269102839937 | 678.4269102839937 | OK (exacto) |
| valor_remate_uf | 696.9105 | 696.9105 | OK (exacto) |
| valor_remate_clp | 27 766 113.00606 | 27 766 113.00606 | OK (exacto) |
| valor_liquidacion_uf | 884.54025 | 884.5402499999998 | OK (δ float −2.3e−13) |
| valor_liquidacion_clp | 35 241 604.96923 | 35 241 604.969229996 | OK (δ float −7.5e−9) |
| renta_perpetua_clp | 50 000 000 | 50 000 000 | OK (exacto) |
| ingreso_liquido_anual_clp | 2 750 000 | 2 750 000 | OK (exacto) |

**% IGUALDAD TERMINALES: 13/13 = 100 %.** Las únicas deltas son ruido de coma flotante (≤ 7.5e−9 absoluto, ≤ 2.1e−16 relativo).

### 1.b Residuo G-6 (separado — NO computa en el % de terminales)

| Variable esperada | Esperado | Real | Observación |
|---|---|---|---|
| promedio_uf_m2_ofertas | 38.86906053021876 | **AUSENTE** | El motor escribe en su lugar `promedio_uf_m2_muestra` = 37.32915538012057 (promedio de los 6 comparables, ofertas+CBR mezclados — semántica distinta a "solo 5 ofertas" del XLSM) |
| promedio_uf_m2_cbr | 29.62962962962963 | **AUSENTE** | El motor escribe `promedio_uf_m2_cbr_out` = 0 |
| desviacion_vs_promedio_pct | −14.863734252235028 | 0 | Residuo G-6 (desviación en 0) |
| desviacion_vs_promedio_cbr_pct | +11.684375000000014 | 0 | Residuo G-6 (desviación en 0) |

Filas extra en TX_Calculos no previstas por el oráculo: `promedio_uf_m2_muestra`, `promedio_uf_m2_cbr_out` (ambas parte del mismo residuo G-6). Si se forzara un cómputo global incluyendo el residuo: 13/17 = 76.5 % — pero el dictamen de igualdad de terminales es el 100 % de arriba.

---

## 2. Las 6 vistas (estado `calculada`)

### V1 — Adjuntos por `subido_por` + `estado_extraccion` · **OK**
24 adjuntos linkeados a la solicitud (recuperados por RECORD_ID — nota: el filtro `{solicitud_codigo}` en `TX_Adjuntos` devuelve 0, el campo no existe con ese nombre en esa tabla; el link `TX_Adjuntos` de la solicitud es la vía válida):
- **16 × `subido_por='Tasador'`** (fotos `caso4_*.jpg`: fachada, living-comedor, cocina, baños, habitaciones, mapas, planificación, ofertas) — todos `estado_extraccion='listo'`, `atributos_obtenidos` vacío (correcto: las fotos del tasador no extraen atributos).
- **8 × `subido_por='Sistema'`** (documentos `*_Security6073.*`: inscripción dominio CBR, foto fuente SII, foto ofertas comparables, consulta antecedentes bien raíz, certificado recepción final, certificado deuda TGR, permiso edificación, informe no expropiación SERVIU) — todos `estado_extraccion='listo'`.
- Total 24/24 en `listo`, cero en error/pendiente.

### V2 — `atributos_obtenidos` JSON válido en documentos Sistema · **OK**
Los 8 documentos Sistema tienen `atributos_obtenidos` que parsea como JSON válido, estructura `{items, no_extraidos}` (329–4795 chars). Valores del caso verificados dentro de los JSON:
- "MARIA ROZAS" (dirección Av. María Rozas Velásquez 65): presente en 5/8 (ofertas comparables, antecedentes bien raíz, recepción final, permiso edificación, SERVIU).
- Rol `7038-11`/`7038`: presente en 5/8 (fuente SII, antecedentes, recepción final, TGR, SERVIU).
- "Estación Central": presente en 7/8.
- **Propietario: los JSON de Sistema traen IRMA ELENA ALZAMORA RIVEROS** (CBR, antecedentes, TGR, permiso edificación) — coincide con `TX_DatosTasacion.propietario_nombre`, no con PATRICIO. Reporte solicitado: `TX_DatosTasacion` tiene **propietario_nombre = 'IRMA ELENA ALZAMORA RIVEROS' · propietario_rut = '7.922.771-4'** (la propietaria real del XLSM), mientras PATRICIO ADRIAN TORO NIEVAS (13.918.055-0) vive en `TX_Solicitudes.cliente_final_nombre/rut` — consistente con la nota de divergencia "partes" del oráculo (un solo slot en el ensamblador). Coherente, no es defecto de esta corrida.

### V3 — TX_DatosTasacion poblada · **OK**
Registro `recBudYOKVXICjewg` (tabla `tblMoK3mFuwN8Yr1A`) con **39 campos poblados**. Muestreo contra `entradas.datosTasacion` del oráculo: sup_construccion_m2=32.4, sup_terreno_m2=0, anio_construccion=2015, material='HORMIGON ARMADO', estado='Bueno', orientacion='S', dormitorios=1, banos=1, pisos=1, rol_sii='7038-11', cod_sii_manzana='7038', cod_sii_predio='11', destino_sii='HABITACIONAL', avaluo_fiscal_clp=27 029 695, arriendo=250 000, gasto_anual=250 000, tasa_cap_rate=0.055, uf_dia_visita=39 841.72, velocidad='8 a 10 meses', zona='IPB (Estación Central)', urbano, origen_dato='tipeado' — **todos coinciden**.

### V4 — Estado · **OK**
`TX_Solicitudes.estado = 'calculada'` en `rectnGOaHvEioXZw3` (`codigo_ext='VP-2026-0076'`, `numero_solicitud='HIPOTECARIA SECURITY -6073'`, `n_operacion_cliente=133251`).

### V5 — Tasador + visador · **OK**
`tasador = ['recTJcV3BIvdcG4em']` (el esperado) · `visador = ['recrjQDympldI186S']` (coincide con `links.visador` del oráculo, Héctor Martínez C.).

### V6 — `pdf_final_url` · **VACÍO, como se esperaba**
El campo no viene en el record (vacío en Airtable). **PENDIENTE E3** — conforme a lo anunciado; no computa como fallo.

### Observación adicional (no bloqueante)
El oráculo declara sembrado `valor_reposicion_override=902.88`, pero en la solicitud real ese campo está **vacío** y aun así `valor_reposicion_uf=902.88` salió exacto → el factor de garantía 0.8 lo aplica hoy el motor (consistente con T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005: el override se retiró tras el fix). `valor_seguro_override=857.736` sigue presente y el seguro salió por override (gap del cuadro de seguro aún abierto, como documenta el propio oráculo).

---

## 3. Producción (GET sin auth)

| URL | HTTP | Interpretación |
|---|---|---|
| `/tasaciones/rectnGOaHvEioXZw3` | 404 | Clerk protect-rewrite (`x-clerk-auth-status: signed-out`, `x-clerk-auth-reason: protect-rewrite`, `x-middleware-rewrite: /clerk_*`) |
| `/tasaciones/rectnGOaHvEioXZw3/fotos` | 404 | ídem |
| `/tasaciones/rectnGOaHvEioXZw3/lectura` | 404 | ídem |
| `/tasaciones/rectnGOaHvEioXZw3/informe` | 404 | ídem |

La app está **viva** (responde Next.js vía `railway-hikari`, `x-powered-by: Next.js`); el 404 es el rewrite de protección de Clerk para visitantes sin sesión — también la raíz `/` da 404 con los mismos headers. Sin auth **no se filtra ningún dato de la tasación**: comportamiento correcto de protección. (Las rutas `/tasaciones/[id]{,/fotos,/lectura,/informe}` existen en el árbol `app/` del repo.)

---

## 4. VEREDICTO

| Vista | Dictamen |
|---|---|
| V1 adjuntos (24: 16 Tasador + 8 Sistema, 24/24 `listo`) | **OK** |
| V2 JSON válido + valores del caso en 8/8 Sistema | **OK** |
| V3 TX_DatosTasacion poblada (39 campos, muestreo 100 % coincidente) | **OK** |
| V4 estado `calculada` | **OK** |
| V5 tasador `recTJcV3BIvdcG4em` + visador `recrjQDympldI186S` | **OK** |
| V6 `pdf_final_url` | vacío — **PENDIENTE E3**, conforme (nota, no fallo) |

**% IGUALDAD TERMINALES: 100 % (13/13 OK).** Residuo G-6 separado: `desviacion_vs_promedio_pct=0`, `desviacion_vs_promedio_cbr_pct=0`, `promedio_uf_m2_ofertas`/`promedio_uf_m2_cbr` ausentes (el motor escribe `promedio_uf_m2_muestra=37.3292` y `promedio_uf_m2_cbr_out=0`).

**Caso 4: APROBADO (OK en V1–V5 · V6 pendiente E3 por diseño · terminales 100 %).**
