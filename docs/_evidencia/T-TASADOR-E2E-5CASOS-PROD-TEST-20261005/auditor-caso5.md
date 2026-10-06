# Auditoría ciega · Caso 5 · VP-2026-0077 (HEV-3183)

**Tanda:** T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · **Auditor:** agente ciego (sin lectura previa de esta carpeta)
**Fecha auditoría:** 2026-10-05 (UTC 2026-10-06 00:3x)
**Solicitud:** `recoZcwmgCBVKQMxF` · `codigo_ext` = VP-2026-0077 · `numero_solicitud` = "HEV -3183" · estado = `calculada`
**Fuentes:** Airtable REST GET con `AIRTABLE_TOKEN` de `.env.local` (token no impreso) · `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/caso5-oraculo.json` (`salidas_esperadas`) · producción Railway.

---

## 1. % IGUALDAD — TX_Calculos (17 filas del motor) vs `salidas_esperadas`

Cómputo propio: `tblFz37KSvn5pLKDR` filtrado por `{solicitud_codigo}='VP-2026-0077'`. Tolerancia: ruido float < 1e-6 relativo.

### 1.a Terminales (fuera del residuo G-6)

| # | variable_output | Esperado (oráculo) | Motor (resultado) | Dictamen |
|---|---|---|---|---|
| 1 | valor_comercial_uf | 3858.91 | 3858.91 | OK |
| 2 | valor_comercial_clp | 155 477 297.5877 | 155 477 297.5877 | OK |
| 3 | valor_reposicion_uf | 3167.128 | 3167.128 | OK |
| 4 | valor_reposicion_clp | 127 605 075.67016001 | 127 605 075.67016001 | OK |
| 5 | seguro_incendio_uf | 3087.128 | 3087.128 | OK |
| 6 | seguro_incendio_clp | 124 381 838.07015999 | 124 381 838.07016002 | OK (Δ float 3e-8) |
| 7 | avaluo_fiscal_uf | 0 | 0 | OK |
| 8 | valor_remate_uf | 2508.2915 | 2508.2915 | OK |
| 9 | valor_remate_clp | 101 060 243.43200497 | 101 060 243.43200499 | OK (Δ float 2e-8) |
| 10 | valor_liquidacion_uf | 3183.60075 | 3183.6007499999996 | OK (Δ float) |
| 11 | valor_liquidacion_clp | 128 268 770.50985248 | 128 268 770.50985248 | OK |
| 12 | renta_perpetua_clp | 156 444 444.44444445 | 156 444 444.44444445 | OK |
| 13 | ingreso_liquido_anual_clp | 7 040 000 | 7 040 000 | OK |

**Terminales: 13/13 OK = 100 %.**

### 1.b Residuo G-6 (separado, no cuenta contra los terminales)

| variable (oráculo) | Esperado | Motor | Observación |
|---|---|---|---|
| desviacion_vs_promedio_pct | −3.563375… | 0 | `desviacion_* = 0` — residuo G-6 conocido |
| desviacion_vs_promedio_cbr_pct | +9.502826… | 0 | `desviacion_* = 0` — residuo G-6 conocido |
| promedio_uf_m2_ofertas | 75.33539653 | **ausente** — el motor emite `promedio_uf_m2_muestra` = 73.83718942 | promedio de las 6 referencias mezclando la CBR, no sólo las 5 ofertas |
| promedio_uf_m2_cbr | 66.34615385 | `promedio_uf_m2_cbr_out` = 0 | fila existe con nombre `_out` pero en 0 |

Ignorados por instrucción: `_nota`, `celdas_oraculo`, `uf_dia`, `usd_dia`, `tasacion_uf_m2` (no existe fila con esa variable en TX_Calculos).

Si se contara el universo completo (13 terminales + 4 residuo): 13/17 = **76.5 %**.

---

## 2. Las 6 vistas (estado `calculada`)

### V1 — Adjuntos · **OK**
24 adjuntos linkeados a la solicitud (lectura por `RECORD_ID()` sobre `tblur71x1oItbmKZc`; nota: el filtro `{solicitud_codigo}='VP-2026-0077'` devuelve 0 en esa tabla — el campo no existe/está vacío ahí, se auditó vía link inverso):
- `subido_por`: **16 Tasador** (fotos `caso5_*.jpg`: mapa ubicación, ofertas ×3, mapa referencias, planificación, fachada ×2, living ×3, cocina ×2, baños, habitaciones ×2) + **8 Sistema** (consulta antecedentes bien raíz, certificado deuda TGR, foto ofertas comparables, certificado recepción final, foto fuente SII, informe no expropiación SERVIU, inscripción dominio CBR, permiso edificación — todos `*_HEV3183.*`).
- `estado_extraccion`: **24/24 `listo`**.

### V2 — `atributos_obtenidos` de los 8 documentos Sistema · **OK**
8/8 con JSON **válido** (estructura `{items:[{codigo_atributo, valor, confianza, fila}], no_extraidos:[]}`), valores del caso verificados:
- Dirección "Exequiel Fernandez Nº 6150, Departamento: Nº 411, Torre 3, Edificio Exequiel Fernandez" (consulta antecedentes, recepción final, no expropiación, permiso edificación).
- Comuna "La Florida" en los 8 · rol_sii "31-516" (31/516 en foto SII; estacionamiento del cuadro usa rol 31-800, correcto).
- Avalúo: `avaluo_total_clp` = **"NO REGISTRA"** (consulta antecedentes) y `avaluo_fiscal_clp` = **"NO REGISTRA"** (foto fuente SII) — se reporta tal cual; coherente con `avaluo_fiscal_uf = 0` del motor (RN-37).
- Propietario "Inmobiliaria Exequiel Fernández Torre Tres SpA" · sup 47.61 m² · año 2026 · HABITACIONAL · ofertas comparables con las 6 filas del oráculo.

### V3 — TX_DatosTasacion · **OK**
Poblada: 1 registro linkeado (`recQaqsQEtCkizgnb`, tabla `tblMoK3mFuwN8Yr1A`), 40 campos no vacíos. Muestreo contrastado con el oráculo: propietario/RUT 77.294.373-3 ✓, sup_construccion 47.61 ✓, terraza 6.53 ✓, año 2026 ✓, HORMIGON ARMADO ✓, NUEVO - S/USO ✓, 2D/1B ✓, rol 31-516 ✓, **avalúo: `avaluo_fiscal_clp` vacío + `avaluo_no_registra=TRUE` + `avaluo_total_raw`/`avaluo_fiscal_texto`="NO REGISTRA"** ✓, arriendo 640 000 ✓, tasa 0.045 ✓, uf_dia_visita 40 290.47 ✓, origen_dato tipeado ✓.

### V4 / V5 — Estado + asignaciones · **OK**
- `estado` = **`calculada`** ✓
- `tasador` = `['recTJcV3BIvdcG4em']` ✓ (coincide con lo exigido)
- `visador` = `['recrjQDympldI186S']` ✓ (coincide con `links.visador` del oráculo)
- `fecha_visita_programada` = 2026-05-12 ✓ · `regla_aplicada` poblada (`rec2QYP8yjMW1Smsm`).

### V6 — `pdf_final_url` · **CONFORME A LO ESPERADO (vacío)**
El campo `pdf_final_url` existe en el schema de TX_Solicitudes pero está **vacío** en el record (ausente del payload). Esperado: **PENDIENTE E3** (pipeline PDF inactivo). No es defecto del caso.

---

## 3. Producción (Railway, GET sin auth)

`https://if-ejecutiva-production.up.railway.app/tasaciones/recoZcwmgCBVKQMxF{,/fotos,/lectura,/informe}`

| Ruta | curl plano | curl con headers de navegador |
|---|---|---|
| `/tasaciones/recoZcwmgCBVKQMxF` | 404 (`x-clerk-auth-reason: protect-rewrite`) | **307** → handshake Clerk (`sure-dinosaur-11.clerk.accounts.dev`) |
| `…/fotos` | 404 (protect-rewrite) | **307** → handshake Clerk |
| `…/lectura` | 404 (protect-rewrite) | **307** → handshake Clerk |
| `…/informe` | 404 (protect-rewrite) | **307** → handshake Clerk |

Las 4 rutas existen en el build (`app/tasaciones/[id]/{page,fotos,lectura,informe}` presentes en el repo) y están **protegidas por Clerk** (`middleware.ts`: todo salvo `/sign-in` y `/api/health`). El 404 a curl plano es el comportamiento documentado de `auth.protect()` para requests no-document; con `Sec-Fetch-Dest: document` responde 307 al sign-in. **Sin fuga de datos sin autenticación.** El contenido autenticado no es verificable por este auditor (sin credenciales) — conforme para una auditoría sin auth.

---

## 4. VEREDICTO

| Vista | Dictamen |
|---|---|
| V1 adjuntos (16 Tasador + 8 Sistema, 24/24 listo) | **OK** |
| V2 JSON extracción 8/8 válidos + valores del caso (avalúo "NO REGISTRA") | **OK** |
| V3 TX_DatosTasacion poblada y fiel al oráculo | **OK** |
| V4 estado `calculada` | **OK** |
| V5 tasador `recTJcV3BIvdcG4em` + visador `recrjQDympldI186S` | **OK** |
| V6 `pdf_final_url` | vacío = esperado · **PENDIENTE E3** (nota, no falla) |

**% IGUALDAD terminales: 100 % (13/13 OK).** Residuo G-6 separado: `desviacion_vs_promedio_pct=0`, `desviacion_vs_promedio_cbr_pct=0`, `promedio_uf_m2_ofertas` ausente (el motor emite `promedio_uf_m2_muestra=73.8372`, mezcla CBR) y `promedio_uf_m2_cbr_out=0` — 13/17 = 76.5 % si se contara todo.

**CASO 5: OK** (V1–V5 OK · V6 pendiente E3 por diseño · terminales 100 %).
