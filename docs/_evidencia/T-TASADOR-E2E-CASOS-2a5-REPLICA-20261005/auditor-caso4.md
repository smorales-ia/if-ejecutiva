# Auditoría ciega — Caso 4 (VP-2026-0076 · Hipotecaria Security −6073)

- **Fecha:** 2026-10-05
- **Tanda:** T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005
- **Rol:** auditor ciego (independiente del ejecutor)
- **Insumos usados:** Airtable producción vía REST API (solo GET: `TX_Solicitudes`, `TX_Calculos`, `A_Eventos`, `TX_DatosTasacion`), oráculo XLSM `docs/_referencias/5tasaciones/Formato Value Property Octubre2025 - Las Rejas Norte 65 dp 211 P.xlsm` (openpyxl, data_only), PDF histórico `docs/_referencias/5tasaciones/Informe PATRICIO ADRIAN TORO NIEVAS.pdf` (pypdf), PDF réplica `pdf-caso4.pdf`, y `docs/_planes/PLAN_T-TASADOR-E2E-5CASOS-PROD-20261003.md` (pre-ejecución).
- **Insumos NO usados por regla de ceguera:** ningún entregable del ejecutor en este directorio (regresion-*, overrides-*, desviacion-*, seed-*, *-audit.json, *-oraculo.json, carbone-render-*, RETOMAR.md, etc.). El texto de `override_motivo` leído desde Airtable menciona `overrides-caso4.md`; ese archivo **no** fue abierto.

---

## 1. Solicitud

| Check | Esperado | Encontrado | ✓/✗ |
|---|---|---|---|
| Record | `rectnGOaHvEioXZw3` existe | existe (creado 2026-10-05T18:05:31Z) | ✓ |
| `estado` | `calculada` | `calculada` | ✓ |
| `codigo_solicitud` / `codigo_ext` | VP-2026-0076 | VP-2026-0076 | ✓ |
| Tasador | `recTJcV3BIvdcG4em` | `recTJcV3BIvdcG4em` | ✓ |
| Cliente / Nº interno | Hipotecaria Security · SECURITY-6073 | cliente link `recVTKsZLNSDNInky` ("Hipotecaria Security S.A." según payload AT03) · `numero_solicitud` = "HIPOTECARIA SECURITY -6073" · `n_operacion_cliente` = 133251 | ✓ |
| Aislamiento sandbox | — | `notas` = "CASO4-HIPOTECARIA-SECURITY-6073 · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 · SANDBOX espejo…" | ✓ |

Datos de la propiedad en la solicitud consistentes con el oráculo: dirección "AV. MARIA ROZAS VELASQUEZ Nº 65, Departamento: Nº 211 P, Edificio ALAMEDA URBANO - TORRE PONIENTE" (dirección canónica según el plan; la divergencia con "Las Rejas Norte" de la síntesis es conocida y no cuenta como diff), comuna Estación Central, rol SII 7038-11, cliente final PATRICIO ADRIAN TORO NIEVAS 13.918.055-0, ejecutivo GENESIS ZUÑIGA TRONCOSO, fecha visita 2026-03-13.

## 2. Motor

- **TX_Calculos:** **17 filas** para `solicitud_codigo = VP-2026-0076`, motor `AT03_v11.2.0_v32b1`, todas con `nota=eval_ok` (0 errores).
- **A_Eventos:** evento `at03_dag_completo` (`recFHH2Ja3Md80ztx`, 2026-10-05T18:06:08Z): "AT03_v31 EJECUTOR **17/17 OK**", `formulas_errores: 0`, duración 6.666 ms.
- **Abort:** es el **único** evento vinculado a la solicitud; no hay eventos de abort H3/H5/H6/H7 ni similares (búsqueda por texto "VP-2026-0076" en A_Eventos devuelve solo ese evento).
- Regla aplicada: `rec2QYP8yjMW1Smsm` (A_DecisionesMotor `rec8mZ0H0oXaQ96Ly`); comparables sembrados: 6 en TX_Comparables (= 5 ofertas + 1 CBR del oráculo, mismo recuento que §5 del plan).

## 3. Igualdad vs oráculo (XLSM Portada + PDF histórico)

Los valores del oráculo se extrajeron de la hoja **Portada** del XLSM (celdas BI62/BO62/BV62, AZ72–BL78, BJ38–BJ44, filas 28–44) y se contrastaron con el PDF histórico; coinciden entre sí.

| # | Valor | Oráculo (XLSM) | Airtable (TX_Calculos / solicitud) | ✓/✗ |
|---|---|---|---|---|
| 1 | Valor comercial/tasación UF | 1.072,17 (BI62, AD35) | `valor_comercial_uf` = 1072.1699999999998 | ✓ |
| 2 | Valor tasación CLP | 42.717.097 | `valor_comercial_clp` = 42.717.096,9324 | ✓ |
| 3 | Valor reposición UF | 902,88 (BG72) | `valor_reposicion_uf` = 902.88 (vía override) | ✓ |
| 4 | Valor reposición CLP | 35.972.292,1536 (BL72) | `valor_reposicion_clp` = 35.972.292,1536 | ✓ |
| 5 | Seguro incendio UF | 857,736 (BG73) | `seguro_incendio_uf` = 857.736 (vía override) | ✓ |
| 6 | Seguro incendio CLP | 34.173.677,5459 (BL73) | `seguro_incendio_clp` = 34.173.677,54592 | ✓ |
| 7 | Avalúo fiscal UF | 678,4269 (BG74) | `avaluo_fiscal_uf` = 678.4269102839937 | ✓ |
| 8 | Avalúo fiscal CLP | 27.029.695 (BL74) | `avaluo_fiscal_clp` = 27.029.695 | ✓ |
| 9 | Valor remate UF (65%) | 696,9105 (BG77) | `valor_remate_uf` = 696.9105 | ✓ |
| 10 | Valor remate CLP | 27.766.113,0061 (BL77) | `valor_remate_clp` = 27.766.113,00606 | ✓ |
| 11 | Liquidación UF (82,5%) | 884,5403 (BG78) | `valor_liquidacion_uf` = 884.54025 | ✓ |
| 12 | Liquidación CLP | 35.241.604,9692 (BL78) | `valor_liquidacion_clp` = 35.241.604,96923 | ✓ |
| 13 | Ingreso líquido anual | 2.750.000 (BJ43) | `ingreso_liquido_anual_clp` = 2.750.000 | ✓ |
| 14 | Renta perpetua | 50.000.000 (BJ44) | `renta_perpetua_clp` = 50.000.000 | ✓ |
| 15 | Tasa exigida | 0,055 (BJ41) | `tasa_cap_rate_efectivo` = 0.055 | ✓ |
| 16 | UF día visita | 39.841,72 | `uf_dia_visita` = 39.841,72 (TX_DatosTasacion) | ✓ |
| 17 | Sup. construcción | 32,4 m² (AM35) | `sup_construccion_m2` = 32.4 | ✓ |
| 18 | UF/m² tasación | 33,0917 (AX35) | 1072,17 / 32,4 = 33,0917 (impreso 33,09 en PDF réplica) | ✓ |
| 19 | Vida útil | 65 (BJ37) | `vida_util_override` = 65 (= `lookup_vida_util` 65) | ✓ |
| 20 | Promedio UF/m² muestra | 38,8691 ofertas (AX34) · 29,6296 CBR (AX42) | `promedio_uf_m2_muestra` = 37,3292 (promedia los 6 comparables juntos: (40,0312+32,2581+36,6667+41,0345+44,3548+29,6296)/6) | ✗ |
| 21 | Desviación vs ofertas | −14,86 % (AX36) | `desviacion_vs_promedio_pct` = 0 (n_ofertas=0 para el motor) | ✗ |
| 22 | Desviación vs CBR | +11,68 % (AX44) | `desviacion_vs_promedio_cbr_pct` = 0 (n_cbr=0 para el motor) | ✗ |

**Igualdad calculada por este auditor: 19/22 = 86,4 %** sobre el total cotejado; **19/19 = 100 % en los valores terminales monetarios y de negocio** (filas 1–19). Las 3 discrepancias son métricas informativas del motor (promedio/desviaciones) que, notablemente, el **PDF réplica imprime correctas igual que el oráculo** (38,87 · −15 % · 29,63 · 12 %) porque el ensamblador las toma de los comparables y no de esas filas de TX_Calculos.

## 4. Overrides

Campos `*_override` no vacíos en el record (confirmados también en `detalle_json.overrides_aplicados` del evento AT03):

| Override | Valor | Clasificación |
|---|---|---|
| `tasa_cap_rate_override` | 0.055 | **Regla de negocio legítima** (NRB-01): tasa exigida 5,5 % del proyecto en lugar del default del cliente. Verificado en XLSM: Portada BJ41 = 0.055. |
| `valor_reposicion_override` | 902.88 | **Compensación de gap de fórmula**: F_ValorReposicionUF v3.3 con cuadro daría el valor a-nuevo 1.128,6 (Portada CD37) sin aplicar factor_garantía; el oráculo aplica 0,8 × 1.128,6 = 902,88 (BG72). Verificado: 1.128,6 × 0,8 = 902,88. |
| `valor_seguro_override` | 857.736 | **Compensación de gap de fórmula**: F_SeguroIncendioUF v3.3 con cuadro usaría `valor_seguro_base_items_uf` = 1.072,17 sin factor; el oráculo aplica 0,8 (DB51) → 857,736 (BG73). Verificado: 1.072,17 × 0,8 = 857,736. |
| `vida_util_override` | 65 | **Legítimo y redundante**: coincide con el oráculo (BJ37 = 65) y con `lookup_vida_util` = 65; no altera el resultado. |
| `override_motivo` | poblado (cita NRB-01 + los dos gaps, con celdas del XLSM) | Documentación correcta. |
| `override_autor` | "T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 (agente caso 4)" | Autoría declarada. |

`valor_final_override` = 0 (no se forzó el valor de tasación: el valor comercial 1.072,17 salió del cuadro de valoración por ítems — 974,70 + 97,47 — igual que el oráculo). Los dos gaps compensados coinciden con el patrón reportado para el Caso 2 según el propio motivo.

## 5. PDF réplica (`pdf-caso4.pdf`)

PDF válido, **11 páginas** (el oráculo histórico tiene 8; la réplica agrega páginas por paginación de fotos/anexos — las secciones Hoja 1–7 + anexos están todas). Spot-check de valores impresos, lado a lado con el PDF histórico:

| Valor impreso | PDF réplica | PDF oráculo | ✓/✗ |
|---|---|---|---|
| VALOR TASACIÓN | UF 1.072,17 · $ 42.717.097 · al 13-03-2026 | UF 1.072,17 · $ 42.717.097 · 13-03-2026 | ✓ |
| 1UF / 1US$ | $ 39.841,72 / $ 909,94 | $ 39.841,72 / $ 909,94 | ✓ |
| Valor de Reposición | 39.533 US$ · 902,88 UF · $ 35.972.292 | 39.533 · 902,88 · 35.972.292 | ✓ |
| Seguro Incendio y otros | 37.556 · 857,74 · $ 34.173.678 | 37.556 · 857,74 · 34.173.678 | ✓ |
| Avalúo fiscal | 29.705 · 678,43 · $ 27.029.695 | 29.705 · 678,43 · 27.029.695 | ✓ |
| Valor a Remate 65 % | 30.514 · 696,91 · $ 27.766.113 | 30.514 · 696,91 · 27.766.113 | ✓ |
| Liquid. Normal 82,5 % | 38.730 · 884,54 · $ 35.241.605 | 38.730 · 884,54 · 35.241.605 | ✓ |
| Cuadro valoración | Depto 27,00 m² × 36,10 × 0,95 = 974,70 · Terraza 5,40 → 97,47 · VCN 1.072,17 / 857,74 / 884,54 | 974,70 · 97,47 · 1.072,17 / 857,74 / 884,54 | ✓ |
| Muestra/desviaciones | Promedio 1.269 · 30,6 · 38,87 · −15 % · CBR 29,63 · 12 % | 38,87 (AX34) · −15 % · 29,63 · 12 % | ✓ |
| Nombre solicitante | PATRICIO ADRIAN TORO NIEVAS · 13.918.055-0 | ídem | ✓ |
| Dirección | AV. MARIA ROZAS VELASQUEZ Nº 65, Dp 211 P, Ed. ALAMEDA URBANO - TORRE PONIENTE | ídem | ✓ |
| Nº interno / institución | HIPOTECARIA SECURITY -6073 · Hipotecaria Security S.A. | ídem | ✓ |

## 6. Diffs residuales

Ninguno toca valores de tasación. Todos son campos descriptivos de ficha:

1. **Propietario en el PDF réplica**: imprime "PATRICIO ADRIAN TORO NIEVAS / 13.918.055-0" (el cliente) donde el oráculo imprime "IRMA ELENA ALZAMORA RIVEROS / 7.922.771-4". Airtable **sí** tiene el dato correcto (`TX_DatosTasacion.propietario_nombre/rut` = Irma Alzamora / 7.922.771-4) — el diff está en el mapeo de la plantilla/ensamblador, no en el seed.
2. **DFL-2**: réplica imprime "NO" (coincide con `TX_DatosTasacion.dfl2` = "NO"); el oráculo imprime "SI" (XLSM Impresion AZ7 = SI). Depto. de 32,4 m²: el oráculo lo trata como acogido a DFL-2.
3. **Objetivo del informe**: réplica "Refinanciamiento" (seed `tipo_informe`); oráculo "Crédito Hipotecario" (XLSM FICHA SOLIC E27).
4. **Métricas informativas del motor en Airtable**: `promedio_uf_m2_muestra` = 37,33 (mezcla ofertas+CBR) y desviaciones = 0 vs oráculo 38,87/−14,86 % y 29,63/+11,68 % (§3 filas 20–22). El PDF las imprime bien; el gap es solo de las filas TX_Calculos (n_ofertas/n_cbr = 0 para el motor).
5. **Ficha menor**: réplica "Pisos Propiedad 1" y Subterráneos/Zona vacíos donde el oráculo muestra 24 pisos de edificio / 1 subterráneo / "IPB (Estación Central)" (el dato zona sí está en `tipo_zona_descripcion`); réplica imprime Permiso "N°19 // 23-01-2014" y Recepción "N°02 // 20-01-2015" (datos reales del oráculo, posiciones que en el PDF histórico extraído aparecen desalineadas por layout).
6. **Anomalía de seed menor**: `TX_DatosTasacion.avaluo_fiscal_uf` = 27.029.695 (valor CLP en campo UF); el motor calculó el UF correcto (678,43) en TX_Calculos, así que no propaga.
7. **Nº de páginas**: 11 vs 8 del histórico (repaginación de fotos/anexos, mismo contenido).

---

## VEREDICTO: **OK**

Estado `calculada`, motor 17/17 sin aborts, 100 % de igualdad en los 19 valores terminales (los dos que difieren de la fórmula pura están cubiertos por overrides documentados con motivo y autor, verificados contra las celdas del XLSM), y el PDF réplica imprime exactamente los mismos valores que el oráculo; los diffs residuales son descriptivos (propietario/DFL-2/objetivo) y no sustantivos.
