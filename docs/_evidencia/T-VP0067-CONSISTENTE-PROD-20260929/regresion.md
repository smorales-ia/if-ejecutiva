# regresion.md — Verificación dato-por-dato EN VIVO · VP-2026-0067

> Tanda T-VP0067-CONSISTENTE-PROD-20260929 · FASE 2 · BLOQUE 2a (verificador).
> Fecha/hora de captura: **2026-09-29 ~23:10 UTC** · Método: `curl` GET (solo lectura)
> contra `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/*` con `AIRTABLE_TOKEN` de `.env.local`.
> Oráculo: PLAN §4 (MET-6283 consolidado). Ninguna escritura efectuada.
> TX_DocumentosGenerados y logs de Make **NO leídos ni tocados** (otro agente sobre la cadena PDF).

## 1 · TX_Solicitudes `recmMzeu3eWGxyXsf` (tblaHTyMHYfmy7Fg6)

| Campo | Esperado | Actual | Resultado |
|---|---|---|---|
| `cliente_final_nombre` | FRANCISCO JOSÉ VERGARA UNDURRAGA | FRANCISCO JOSÉ VERGARA UNDURRAGA | PASS |
| `cliente_final_rut` | 16.610.203-0 | 16.610.203-0 | PASS |
| `numero_solicitud` | METLIFE -6283 (espacio antes del guión) | `METLIFE -6283` (espacio confirmado) | PASS |
| `n_operacion_cliente` | 900159638 | 900159638 | PASS |
| `direccion` | LOS EUCALIPTUS Casa N°2100 Condominio LAS BRISAS DE CHICUREO | `LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` | PASS (mismo contenido; puntuación con comas es la forma almacenada desde el alta, idéntica al snapshot pre-tanda) |
| Comuna (link → M_Comunas `recKT9mUJkeq3YuBu`) | Colina | Colina (Metropolitana de Santiago · Chacabuco) | PASS |
| `rol_sii` | N°882-40 | N°882-40 | PASS |
| `vida_util_override` | 70 | 70 | PASS |
| `fecha_visita` / `fecha_visita_programada` | 2026-04-13 | 2026-04-13 / 2026-04-13 | PASS |
| `estado` | pdf_listo (contexto §3 del plan) | pdf_listo | PASS |
| `codigo_ext` / `codigo_solicitud` | VP-2026-0067 | VP-2026-0067 / VP-2026-0067 | PASS |
| `tasador` | recTJcV3BIvdcG4em (nutricionsaludketo) | ["recTJcV3BIvdcG4em"] | PASS |

Observación (no es check del oráculo): `pdf_final_url` sigue siendo URL interna `/home?preview=` de Dropbox — es el diff **D7 BLOQUEADO** (scope `sharing.write`, manual de Sergio), documentado en el plan; no se cuenta como FAIL de esta regresión.

**Sección 1: 12 PASS · 0 FAIL**

## 2 · TX_DatosTasacion `recy8q3Tq9omjdNUf` (tblMoK3mFuwN8Yr1A)

| Campo | Esperado | Actual | Resultado |
|---|---|---|---|
| `sup_terreno_m2` | 5024.86 | 5024.86 | PASS |
| `sup_construccion_m2` | 249.91 | 249.91 | PASS |
| `anio_construccion` | 2024 | 2024 | PASS |
| `uf_dia_visita` | 39894.61 | 39894.61 | PASS |
| `propietario_nombre` | FRANCISCO JOSÉ VERGARA UNDURRAGA | FRANCISCO JOSÉ VERGARA UNDURRAGA | PASS |
| `propietario_rut` | 16.610.203-0 | 16.610.203-0 | PASS |
| `permiso_edif_num` (fix OLA 1 · D6) | N°319  09/09/2020 | `N°319  09/09/2020` | PASS |
| `recepcion_final` (fix OLA 1 · D6) | N°210  18/07/2024 | `N°210  18/07/2024` | PASS |
| `tasa_cap_rate` | 0.045 (cap rate 4,5%) | 0.045 | PASS |
| `ingreso_liquido_anual` | 36.300.000 (D6) | 0 | **BLOQUEADO** — excepción declarada en OLA 1: fórmula con fuentes vacías, pendiente de Sergio. No computa como FAIL de esta verificación. (El terminal `ingreso_liquido_anual_clp` de TX_Calculos SÍ vale 36.300.000 — ver §3.) |
| `cod_sii_manzana` / `cod_sii_predio` | 882 / 40 (rol 882-40) | 882 / 40 | PASS |

Observación menor (fuera de oráculo): `avaluo_fiscal_uf` de esta tabla = 339809429 (igual al CLP); el valor UF correcto (8517.68) vive en el terminal de TX_Calculos. Anomalía preexistente, no listada en los diffs D1–D7.

**Sección 2: 10 PASS · 0 FAIL · 1 BLOQUEADO (declarado)**

## 3 · TX_Calculos — las 15 filas (tblFz37KSvn5pLKDR)

Las 15 filas linkeadas a la solicitud, ordenadas por `calculo_id`. ★ = las 2 corregidas por el fix CI-057 (OLA 1; `ultima_modificacion` 2026-09-29T23:08 — las otras 13 conservan 2026-09-27T17:09).

| calculo_id | Record | variable_output | Actual (`valor_calculado`) | Esperado | Resultado |
|---|---|---|---|---|---|
| 1477 ★ | recJBJQdcuodR7Kxd | promedio_uf_m2_muestra | 33.643447932388284 | 33.643447932388284 (33,6434) | PASS |
| 1478 | recC3AHAcXJUW58rr | ingreso_liquido_anual_clp | 36300000 | 36.300.000 | PASS |
| 1479 | rec63XSh57aHqFAEF | renta_perpetua_clp | 806666666.6666667 | — (sin diff; consistente 36.3M/0.045) | PASS |
| 1480 | rec2BVb0aDWPQ5Csl | valor_comercial_uf | 20125.862399999998 | 20125.8624 | PASS |
| 1481 | reci5VTW7Hg8nGuLd | valor_comercial_clp | 802913431.3616639 | 802913431 (=20125.8624×39894.61) | PASS |
| 1482 | rectIYWksC4IWONKZ | valor_reposicion_uf | 9246.94 | — (sin diff) | PASS |
| 1483 | recqReUSZL2unLhVm | seguro_incendio_uf | 8907.062399999999 | — (sin diff) | PASS |
| 1484 | recwMUKdTrb6fFqjM | avaluo_fiscal_uf | 8517.67767625752 | 339809429÷39894.61 | PASS |
| 1485 | recRMbaSLqtu5tslm | valor_remate_uf | 13081.81056 | 20125.8624×0.65 (remate 65%) | PASS |
| 1486 | recnKoDHrykaqYNGA | valor_liquidacion_uf | 16603.836479999998 | 20125.8624×0.825 (liquidación 82,5%) | PASS |
| 1487 | rec49wTN71mEwLR5n | valor_reposicion_clp | 368903064.99340004 | 9246.94×39894.61 | PASS |
| 1488 | recdLBNX3SrZYxulp | seguro_incendio_clp | 355343780.69366395 | 8907.0624×39894.61 | PASS |
| 1489 | recHMcaG1RVVs41JR | valor_remate_clp | 521893730.3850816 | 13081.81056×39894.61 | PASS |
| 1490 | recb1arfVgTtNZ4Uz | valor_liquidacion_clp | 662403580.8733728 | 16603.83648×39894.61 | PASS |
| 1491 ★ | recOQzPNt1uZEmSls | desviacion_vs_promedio_pct | -2.9825954058123494 | -2.9825954058123494 (-2,98 ≈ -3%) | PASS |

**Sección 3: 15 PASS · 0 FAIL** (15/15 filas presentes; 2/2 corregidas con el valor nuevo)

## 4 · TX_Comparables — 7 filas (tbllbTuhb0waWIbRo)

| clave_natural | Record | tipo_referencia | Esperado precio_uf | Actual precio_uf | Resultado |
|---|---|---|---|---|---|
| VP-2026-0067\|COMP-01 | rec2aFg7XPsbSjufp | Oferta | 20000 | 20000 | PASS |
| VP-2026-0067\|COMP-02 | recXGxAeVg2ThVUfQ | Oferta | 24900 | 24900 | PASS |
| VP-2026-0067\|COMP-03 | recKGLWdMaK0lrXCh | Oferta | 19500 | 19500 | PASS |
| VP-2026-0067\|COMP-04 | recUAawogrtK3AJ59 | Oferta | 23900 | 23900 | PASS |
| VP-2026-0067\|COMP-05 | recniOUZHto7ZaA1E | Oferta | 18900 | 18900 | PASS |
| VP-2026-0067\|COMP-06 | recmizO68egY2SUiR | CBR | 20500 | 20500 | PASS |
| VP-2026-0067\|COMP-07 | recD9eZEG2Ilpm2lx | CBR | 18000 | 18000 | PASS |

Conteo: 7/7 (5 Oferta + 2 CBR). Todas linkean `adjunto_origen` → `rectcojWwOIonkQRA` (foto_comparables).

**Sección 4: 8 PASS · 0 FAIL** (7 valores + conteo)

## 5 · TX_ItemsCuadroValoracion — 6 ítems (tblCxnMtOETK2ulD0)

| item_id | Record | nombre_item | tipo_item | sup_m2 | uf_m2 | factor | valor_uf |
|---|---|---|---|---|---|---|---|
| 13 | recnIInvI1IchIfX2 | Terreno | Terreno | 1402.35 | 8 | 1 | 11218.8 |
| 14 | recQuqMyXs7ttOHVb | Servidumbre | Terreno | 3622.51 | 0 | 1 | 0 |
| 15 | recZCOq0TTlzVouzP | Piso 1 | Edificacion | 249.91 | 34 | **0.96** | **8157.0624** |
| 16 | recTV6R4rxuDyamYG | Piscina | Piscina | 1 | 350 | 1 | 350 |
| 17 | rechm7Py8l1qtcMzl | Quincho, terrazas, bodega | OO.CC. | 1 | 250 | 1 | 250 |
| 18 | recMBbJ4HHfZYOGTV | Cierros, pavimento exterior | OO.CC. | 1 | 150 | 1 | 150 |

| Check | Esperado | Actual | Resultado |
|---|---|---|---|
| Conteo de ítems | 6 | 6 | PASS |
| Factor edificación | 0.96 | 0.96 | PASS |
| Valor edificación | 8157.0624 | 8157.0624 (=249.91×34×0.96) | PASS |
| **Total cuadro** Σ valor_uf | **20125.8624 UF** | **20125.862399999998** | PASS |
| Terreno 1402.35+3622.51 | 5024.86 m² (espejo sup_terreno) | 5024.86 | PASS |

**Sección 5: 5 PASS · 0 FAIL**

## 6 · TX_HabitacionesPorNivel — 12 filas (tblBITpPb8WuqsatM)

12/12 presentes, todas `nivel=Piso1`: Comedor, Living, Estar, Hall, Suite principal (dorm),
Dormitorio simple ×3 (dorm), Dormitorio servicio (dorm), B.Servicio, Baños ×3, 1/2 Baño,
Loggia, Cocina. Suma dormitorios marcados = 5 filas con `es_dormitorio` (1+3+1 cantidades),
coherente con `dormitorios=4` + servicio.

| Check | Esperado | Actual | Resultado |
|---|---|---|---|
| Conteo de filas | 12 | 12 | PASS |

**Sección 6: 1 PASS · 0 FAIL**

## 7 · TX_DocumentosLegales `rec7t4cD2zjuJKpXq` (tbl7qIg5x4Y0tOiLk)

| Campo | Esperado | Actual | Resultado |
|---|---|---|---|
| `permiso_edificacion_numero` | N°319  09/09/2020 | `N°319  09/09/2020` | PASS |
| `permiso_edificacion_fecha` | 2020-09-09 | 2020-09-09 | PASS |
| `recepcion_final_numero` | N°210  18/07/2024 | `N°210  18/07/2024` | PASS |
| `recepcion_final_fecha` | 2024-07-18 | 2024-07-18 | PASS |
| `fojas` | 13291 | 13291 | PASS |
| `numero_inscripcion` | 21565 | 21565 | PASS |
| `ano_inscripcion` | 2006 | 2006 | PASS |

**Sección 7: 7 PASS · 0 FAIL**

## 8 · H_PreciosUF fila 2026-04-13 (tblWPRuIYfzdlveHM · `recbnHFtlFHQnyEM9`)

| Campo | Esperado | Actual | Resultado |
|---|---|---|---|
| `fecha` | 2026-04-13 | 2026-04-13 | PASS |
| `valor_clp` (UF del día) | 39894.61 | 39894.61 | PASS |
| `tipo_cambio_usd` (dólar) | 890.33 | 890.33 | PASS |

**Sección 8: 3 PASS · 0 FAIL**

## 9 · Check explícito CI-057

| Check | Esperado | Actual | Resultado |
|---|---|---|---|
| Promedio ofertas (fila 1477) | 33.6434 UF/m² | 33.643447932388284 · coincide con el promedio en vivo de las 5 ofertas homologadas (34.05+35.19+35.71+31.45+31.82)/5 = 33.644 | PASS |
| Desviación vs promedio (fila 1491) | -2.98% (≈-3%) | -2.9825954058123494 · UF/m² implícito 33.6434×(1-0.029826) = **32.64** (espejo oráculo) | PASS |
| Desviación vs promedio CBR | +35.52% (≈36%) | Derivado en vivo: promedio CBR (25.18+22.99)/2 = 24.085 → (32.64÷24.0845−1)×100 = **+35.52** | PASS |
| Guardarraíl: **30.91** AUSENTE de TX_Calculos | ausente | grep sobre las 15 filas: `30.91`/`30,91` no aparece | PASS |
| Guardarraíl: **160.52** AUSENTE de TX_Calculos | ausente | grep sobre las 15 filas: `160.52`/`160,52` no aparece | PASS |

**Sección 9: 5 PASS · 0 FAIL**

## 10 · Muestra US$ = CLP ÷ 890.33 (terminales)

| Terminal | CLP (Airtable) | ÷ 890.33 → US$ | Resultado |
|---|---|---|---|
| valor_comercial_clp | 802913431.36 | 901815.54 | PASS (aritmética consistente con tipo_cambio_usd 890.33 de H_PreciosUF) |
| valor_remate_clp | 521893730.39 | 586180.10 | PASS |
| valor_liquidacion_clp | 662403580.87 | 743997.82 | PASS |

**Sección 10: 3 PASS · 0 FAIL**

## 11 · App de producción

| Check | Comando | Esperado | Actual | Resultado |
|---|---|---|---|---|
| App viva / login | `curl -sI https://if-ejecutiva-production.up.railway.app/sign-in` | 200 | **HTTP/2 200** | PASS |
| Guard `/tasaciones/recmMzeu3eWGxyXsf` sin sesión | `curl -sI …/tasaciones/recmMzeu3eWGxyXsf` | redirect a sign-in | **HTTP/2 404** con `x-clerk-auth-status: signed-out`, `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`, `x-middleware-rewrite: /clerk_…`; el body (16.9 KB) contiene el bootstrap de Clerk con `signIn` | PASS con nota |

Nota sobre el segundo check: **el guard corre** — Clerk intercepta la request signed-out en
middleware y responde con su *protect-rewrite* (interstitial 404 + rewrite interno hacia el
flujo de sign-in) en lugar de un 30x `Location: /sign-in`; ese es el comportamiento estándar
de `clerkMiddleware.protect()` ante un cliente sin dev-browser cookie (curl). Como el
middleware intercepta ANTES del router, una ruta de control inexistente
(`/tasaciones-noexiste-xyz`) devuelve el mismo 404, así que la existencia de la ruta no es
distinguible por HTTP sin sesión. La existencia queda probada por el árbol desplegado (repo
en `main` limpio = deploy Railway): `app/tasaciones/[id]/page.tsx` + subrutas
`coordinar/ estado/ fotos/ informe/ lectura/` existen. Criterio §6.7 del plan («redirect a
/sign-in sin sesión = OK esperado») se da por cumplido en su intención: sin sesión no se
sirve la vista y se deriva al flujo de sign-in.

**Sección 11: 2 PASS · 0 FAIL**

---

## TOTALES regresion.md

| Sección | PASS | FAIL | Otros |
|---|---|---|---|
| 1 TX_Solicitudes | 12 | 0 | — |
| 2 TX_DatosTasacion | 10 | 0 | 1 BLOQUEADO declarado (`ingreso_liquido_anual`) |
| 3 TX_Calculos (15) | 15 | 0 | — |
| 4 TX_Comparables (7) | 8 | 0 | — |
| 5 Cuadro (6 ítems) | 5 | 0 | — |
| 6 Habitaciones (12) | 1 | 0 | — |
| 7 DocLegales | 7 | 0 | — |
| 8 H_PreciosUF | 3 | 0 | — |
| 9 CI-057 | 5 | 0 | — |
| 10 US$ muestra | 3 | 0 | — |
| 11 App producción | 2 | 0 | 1 nota (protect-rewrite en vez de 30x) |
| **TOTAL** | **71** | **0** | 1 BLOQUEADO + 2 observaciones (D7 pdf_final_url · avaluo_fiscal_uf de DatosTasacion) |
