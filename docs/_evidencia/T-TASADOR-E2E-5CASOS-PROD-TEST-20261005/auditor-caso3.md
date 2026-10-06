# Dictamen Auditor Ciego · Caso 3 · VP-2026-0075 (recE1LwwH2xbcCHti)

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · **Fecha auditoría:** 2026-10-05
**Regla de ceguera:** no se leyó nada de esta carpeta de evidencia antes de escribir este archivo. Fuentes: Airtable REST (GET, token `.env.local`), `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso3-oraculo.json` (bloque `salidas_esperadas`), y producción `https://if-ejecutiva-production.up.railway.app`. Cómputo propio del auditor; cero escrituras a la base.

---

## 1 · % IGUALDAD — TX_Calculos (tblFz37KSvn5pLKDR, {solicitud_codigo}='VP-2026-0075') vs salidas_esperadas

17 filas en TX_Calculos; 16 claves del oráculo comparadas (se excluyen `uf_dia`/`usd_dia` por instrucción). Mapeos de nombre: `promedio_uf_m2_ofertas`→`promedio_uf_m2_muestra`, `promedio_uf_m2_cbr`→`promedio_uf_m2_cbr_out`.

### 1.1 Terminales (13)

| variable_output | esperado | TX_Calculos | dictamen |
|---|---|---|---|
| valor_comercial_uf | 1024 | 1024 | OK |
| valor_comercial_clp | 41 178 572,8 | 41178572.8 | OK |
| valor_reposicion_uf | 1024 | 1024 | OK |
| valor_reposicion_clp | 41 178 572,8 | 41178572.8 | OK |
| seguro_incendio_uf | 1024 | 1024 | OK |
| seguro_incendio_clp | 41 178 572,8 | 41178572.8 | OK |
| avaluo_fiscal_uf | 411.5815728319754 | 411.5815728319754 | OK |
| valor_remate_uf | 665.6 | 665.6 | OK |
| valor_remate_clp | 26 766 072,32 | 26766072.32 | OK |
| valor_liquidacion_uf | 844.8 | 844.8 | OK |
| valor_liquidacion_clp | 33 972 322,56 | 33972322.559999995 | OK (ε float ≈ 4·10⁻⁹) |
| renta_perpetua_clp | 48 888 888,888… | 48888888.88888889 | OK |
| ingreso_liquido_anual_clp | 2 200 000 | 2200000 | OK |

**Terminales: 13/13 OK = 100 %.**

Observación de mecanismo (leída en TX_Solicitudes, no afecta el dictamen numérico): el seguro llega al valor oráculo vía `valor_seguro_override=1024` (G-7 carril C3, `override_motivo` documentado); la reposición NO lleva override — la produce la fórmula (fix G-1). `vida_util_override=40` presente según oráculo.

### 1.2 No-terminales / residuo G-6 (separados, 3)

| variable_output | esperado | TX_Calculos | dictamen |
|---|---|---|---|
| promedio_uf_m2_muestra | 27.543461538461543 | 27.543461538461543 | OK (presente, no ausente) |
| promedio_uf_m2_cbr_out | 0 | 0 | OK (coincidencia trivial — REF.CBR vacía en el oráculo) |
| desviacion_vs_promedio_pct | −7.055981455880922 | 0 | **MISS — residuo G-6** (desviación en 0) |
| desviacion_vs_promedio_cbr_pct | 0 | 0 | OK (trivial: esperado 0; indistinguible del residuo G-6) |

### 1.3 Totales

- **Terminales: 13/13 = 100 %.**
- **Global (16 claves comparadas): 15/16 = 93,75 %**, con el único MISS íntegramente atribuible al residuo G-6 (`desviacion_vs_promedio_pct = 0`).
- Sin filas sobrantes inexplicadas: las 17 filas de TX_Calculos mapean 1:1 contra el oráculo (16) + ninguna extra fuera de los dos alias de nombre.

---

## 2 · Las 6 vistas (estado `calculada` verificado en TX_Solicitudes)

### V1 — Adjuntos (TX_Adjuntos tblur71x1oItbmKZc · 24 registros vinculados) — **OK**
- 16 con `subido_por = Tasador` (fotos `caso3_*.jpg`: mapa, fachada×4, ofertas×4, planificación, living×2, cocina, baño, habitaciones×2) — todas `estado_extraccion = listo`.
- 8 con `subido_por = Sistema` (consulta antecedentes bien raíz, permiso edificación, certificado recepción final, informe no expropiación SERVIU, certificado deuda TGR, inscripción dominio CBR, foto fuente SII, foto ofertas comparables) — todos `estado_extraccion = listo`.
- 24/24 con `estado_extraccion = listo`. Sin estados de error.

### V2 — atributos_obtenidos de los documentos Sistema — **OK**
- 8/8 documentos Sistema traen `atributos_obtenidos` con **JSON válido** (parseado por el auditor).
- Valores del caso presentes: **Caspana / 310 / dp 14** (recepción final, antecedentes, SERVIU, permiso), **Quilicura** (7 de 8), **rol 658-128** (recepción final, antecedentes, SERVIU, TGR; el doc SII lo trae como `cod_sii_manzana=658` + `cod_sii_predio=128`, más `avaluo_fiscal_clp=16551115`).
- **Propietario en los JSON: "Víctor Leónidas González Moreno"** (inscripción dominio CBR `nombre_propietario`/`comprador`, TGR, permiso) — NO "Miguenson Rameau". Es consistente con el oráculo: Rameau es `cliente_final_nombre` (solicitante, portada) y González Moreno el propietario real (Hoja 1), ambos RUT 9.588.043-6.

### V3 — TX_DatosTasacion (tblMoK3mFuwN8Yr1A · recC2Y04YnPLnzznD) — **OK**
Poblada con **38 campos**, valores = oráculo: `propietario_nombre = Víctor Leónidas González Moreno`, `propietario_rut = 9.588.043-6`, sup_construccion 40 / terreno 0, año 1994, albañilería ladrillo, Bueno, 2D/1B, pisos 1, rol 658-128 (manzana 658 / predio 128), avalúo 16 551 115, arriendo 200 000, gasto anual 200 000, tasa 0.045, uf_dia_visita 40 213,45, velocidad "8 a 10 meses", PRMS (Quilicura), urbano, HABITACIONAL, origen_dato tipeado, síntesis y descripción de sector completas. Nota menor (no afecta veredicto): `avaluo_fiscal_uf = 16551115` en esta tabla replica el CLP (rareza de campo, no es terminal del motor; el terminal `avaluo_fiscal_uf` de TX_Calculos sí vale 411,58 UF).

### V4 — Estado — **OK**: `estado = calculada`. Regla ganadora `regla_aplicada = rec2QYP8yjMW1Smsm` (REGLA_REFI_DEPTO_V32), `tipo_informe = recreojxTjoAWOEHa`, `fuera_rango = 0` — todo según oráculo.

### V5 — Tasador/Visador — **OK**: `tasador = recTJcV3BIvdcG4em` (esperado exacto) · `visador = recrjQDympldI186S` (= `links.visador` del oráculo, Héctor Martínez C.).

### V6 — pdf_final_url — **VACÍO, como se esperaba**: el campo no viene en los fields del record (sin valor). **PENDIENTE E3** — no es falla del caso; el pipeline E3 no ha corrido. `TX_DocumentosGenerados` sin link en el record.

---

## 3 · Producción (GET sin auth)

| Ruta | curl plano | curl con headers de navegador |
|---|---|---|
| `/tasaciones/recE1LwwH2xbcCHti` | 404 | **307 → handshake Clerk** (`sure-dinosaur-11.clerk.accounts.dev`) |
| `/tasaciones/recE1LwwH2xbcCHti/fotos` | 404 | 307 → handshake Clerk |
| `/tasaciones/recE1LwwH2xbcCHti/lectura` | 404 | 307 → handshake Clerk |
| `/tasaciones/recE1LwwH2xbcCHti/informe` | 404 | 307 → handshake Clerk |

Lectura del auditor: el 404 "plano" es el comportamiento estándar de Clerk `auth.protect()` ante requests no-navegador (middleware.ts protege todo salvo `/sign-in` y `/api/health`; `/` también da 404 plano y `/api/health` responde 200 — app arriba). Con headers de navegador las 4 rutas existen y redirigen al gate de autenticación: **sin fuga anónima de datos del caso; rutas desplegadas y protegidas.** No se verificó el contenido autenticado (el auditor no posee sesión Clerk).

---

## 4 · VEREDICTO

| Vista | Dictamen |
|---|---|
| V1 adjuntos | **OK** |
| V2 JSON extracción | **OK** |
| V3 TX_DatosTasacion | **OK** |
| V4 estado `calculada` | **OK** |
| V5 tasador/visador | **OK** |
| V6 pdf_final_url | vacío = esperado · **PENDIENTE E3** (nota, no falla) |

**% IGUALDAD: terminales 13/13 = 100 % · global 15/16 = 93,75 %** (único MISS: `desviacion_vs_promedio_pct = 0` vs −7,056 — residuo G-6, separado de los terminales conforme a la instrucción de auditoría).

**Caso 3: APROBADO (V1–V5 OK) con residuo G-6 en desviación y E3 pendiente.**
