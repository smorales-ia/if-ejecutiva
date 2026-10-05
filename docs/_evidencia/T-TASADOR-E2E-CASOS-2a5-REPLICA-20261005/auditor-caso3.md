# Auditoría ciega — Caso 3 · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

- **Fecha**: 2026-10-05
- **Caso**: 3 — VP-2026-0075 · Austral Leasing Habitacional · ALH-335 · Caspana 310 dp 14, Block A, Quilicura
- **Rol**: auditor ciego (independiente del ejecutor)
- **Insumos usados**: Airtable producción vía REST API (solo GET: TX_Solicitudes `recE1LwwH2xbcCHti`, TX_Calculos por `solicitud_codigo`, A_Eventos, TX_DatosTasacion `recC2Y04YnPLnzznD`); oráculos `docs/_referencias/5tasaciones/caspana 310 dp 14, quilicura.xlsm` (openpyxl, data_only) e `Informe MIGUENSON RAMEAU.pdf` (pypdf); PDF réplica `pdf-caso3.pdf` (pypdf).
- **Insumos NO usados (regla de ceguera)**: ningún entregable del ejecutor en `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/` (regresion-*, overrides-*, desviacion-*, seed-*, *-audit.json, carbone-render-*, RETOMAR.md, etc.). El `override_motivo` cita "overrides-caso3.md"; ese archivo NO fue leído — el motivo se tomó del propio record de Airtable.

## 1. Solicitud

| Chequeo | Esperado | Encontrado | ✓/✗ |
|---|---|---|---|
| Record existe | recE1LwwH2xbcCHti | existe (creado 2026-10-05T18:05:11Z) | ✓ |
| `estado` | calculada | `calculada` | ✓ |
| `tasador` | recTJcV3BIvdcG4em | `["recTJcV3BIvdcG4em"]` | ✓ |
| `codigo_solicitud` / `codigo_ext` | VP-2026-0075 | VP-2026-0075 / VP-2026-0075 | ✓ |
| Cliente / Nº interno | Austral Leasing Habitacional / ALH-335 | payload AT03 `cliente=Austral Leasing Habitacional`; `numero_solicitud="ALH -335"`, `n_operacion_cliente=335` | ✓ (ver diff D6: espacio en "ALH -335") |
| Marcado sandbox | — | `notas` = "CASO3-ALH-335 · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 · SANDBOX espejo vía motor AT03…" | ✓ |

## 2. Motor calculó

- **TX_Calculos**: **17 filas** con `solicitud_codigo='VP-2026-0075'` (calculo_id 1554–1570), todas `nota=eval_ok`, `version_motor=AT03_v11.2.0_v32b1`, calculadas 2026-10-05T18:05:56–18:06:01Z. Coinciden 1:1 con los 17 links del record.
- **A_Eventos**: evento `reccwc6fY0YonvWOW`, `tipo_evento=at03_dag_completo`, severidad `info`, descripción "[COD=VP-2026-0075] AT03_v31 EJECUTOR 17/17 OK", `detalle_json`: `formulas_total=17, formulas_escritas=17, formulas_errores=0, tiempo_ms=6491`.
- **Aborts**: búsqueda en A_Eventos por `record_id_origen='recE1LwwH2xbcCHti'` y `clave_evento` conteniendo 'VP-2026-0075' devuelve **solo ese evento**. No hay eventos H3/H5/H6/H7 ni warnings/errores.

## 3. Igualdad vs oráculo (XLSM Portada + PDF histórico vs Airtable/TX_Calculos)

Celdas del XLSM citadas de la hoja **Portada** (data_only). UF día visita en Hoja Resumen F44.

| # | Valor | Oráculo (XLSM/PDF) | Airtable (TX_Calculos / solicitud) | ✓/✗ |
|---|---|---|---|---|
| 1 | Valor comercial/tasación UF | 1.024,00 (BI62, BG=1024; PDF "UF 1.024,00") | `valor_comercial_uf` = 1024 | ✓ |
| 2 | Valor tasación CLP | $41.178.573 (PDF) | `valor_comercial_clp` = 41.178.572,8 (redondea a 41.178.573) | ✓ |
| 3 | Valor reposición UF | 1.024 (BG72; a-nuevo CC62=1280 × 0,8) | `valor_reposicion_uf` = 1024 (vía override, ver §4) | ✓ |
| 4 | Valor reposición CLP | 41.178.572,8 (BL72) | `valor_reposicion_clp` = 41.178.572,8 | ✓ |
| 5 | Seguro incendio UF | 1.024 (BG73 / DB67) | `seguro_incendio_uf` = 1024 | ✓ |
| 6 | Seguro incendio CLP | 41.178.572,8 (BL73) | `seguro_incendio_clp` = 41.178.572,8 | ✓ |
| 7 | Valor remate UF (65%) | 665,6 (BG77, factor AU77=0,65) | `valor_remate_uf` = 665,6 | ✓ |
| 8 | Valor remate CLP | 26.766.072,32 (BL77) | `valor_remate_clp` = 26.766.072,32 | ✓ |
| 9 | Liquidación UF (82,5%) | 844,8 (BG78, factor AU78=0,825) | `valor_liquidacion_uf` = 844,8 | ✓ |
| 10 | Liquidación CLP | 33.972.322,56 (BL78) | `valor_liquidacion_clp` = 33.972.322,56 | ✓ |
| 11 | Avalúo fiscal UF | 411,58 (PDF oráculo "411,58") | `avaluo_fiscal_uf` = 411,5815728 | ✓ |
| 12 | Avalúo fiscal CLP | 16.551.115 (PDF) | `avaluo_fiscal_clp` = 16.551.115 (TX_DatosTasacion) | ✓ |
| 13 | Ingreso líquido anual | 2.200.000 (BJ43) | `ingreso_liquido_anual_clp` = 2.200.000 | ✓ |
| 14 | Renta perpetua CLP | 48.888.888,89 (BJ44) | `renta_perpetua_clp` = 48.888.888,89 | ✓ |
| 15 | UF día visita | 40.213,45 (Hoja Resumen F44) | `uf_dia_visita` = 40.213,45 | ✓ |
| 16 | Sup. construcción | 40 m² (AM35/AM43) | `sup_construccion_m2` = 40 | ✓ |
| 17 | Sup. terreno | 0 (AH35) | `sup_terreno_m2` = 0 | ✓ |
| 18 | UF/m² construcción | 25,6 (AX35/AX43) | 1024/40 = 25,6 (impreso 25,60 en PDF réplica) | ✓ |
| 19 | Promedio UF/m² muestra | 27,5435 (AX34 = 27,543461538…) | `promedio_uf_m2_muestra` = 27,543461538461543 | ✓ |
| 20 | Desviación vs promedio | −7,06% (AX36 = −0,0706; ambos PDF imprimen "−7%") | terminal `desviacion_vs_promedio_pct` = **0** en TX_Calculos (el PDF réplica sí imprime −7%) | ✗ (solo en Airtable) |

**Igualdad calculada por el auditor: 19/20 = 95%.** El único miss (#20) es un terminal informativo: la condición de `F_DesviacionVsPromedio` exige `n_ofertas > 0` y devolvió 0, pero el dato impreso en el PDF réplica (−7%) sí coincide con el oráculo. Ningún valor de tasación discrepa.

## 4. Overrides

Campos `*_override` no vacíos del record (el resto llegó en 0 al motor, según `detalle_json` del evento):

| Campo | Valor | Motivo/autor | Clasificación del auditor |
|---|---|---|---|
| `valor_reposicion_override` | 1024 | `override_motivo`: "SANDBOX T-REPLICA-20261005: el XLSM ALH calcula Reposición = factor_garantia(0.8) × edificación a-nuevo (Portada BG72=1024 = 0.8×1280) y F_ValorReposicionUF v32 calcula a-nuevo sin ese factor (daría 1280). Mismo gap de fórmula del Caso 2." · `override_autor`: "T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 (agente caso 3)" | **Compensación de gap de fórmula del motor**, correctamente documentada. Verificado contra el XLSM: CC62=1280 (a-nuevo) y BG72=1024 = 0,8×1280 — el motivo es fiel al oráculo. |
| `vida_util_override` | 40 | mismo `override_motivo`/`override_autor` (motivo redactado para reposición) | **Dato de entrada legítimo para espejar el oráculo**: el XLSM Portada muestra "Vida Util Remanente Años" = 40 (BB37/BJ37) y el lookup del motor daría 55 (`lookup_vida_util=55` en inputs_json). No compensa un gap de fórmula; replica el dato del tasador histórico. |

Ambos quedaron registrados en `detalle_json.overrides_aplicados` del evento AT03 con motivo y autor.

## 5. PDF réplica

- `pdf-caso3.pdf`: **PDF válido, 10 páginas** (pypdf lo abre y extrae texto sin error). Oráculo histórico: 8 páginas (diff D5).
- Spot-check de valores impresos (réplica vs oráculo PDF/XLSM):

| Valor impreso | PDF réplica | Oráculo | ✓/✗ |
|---|---|---|---|
| Valor tasación | "UF 1.024,00 $ 41.178.573 al 07-05-2026" | UF 1.024,00 / $41.178.573 / 07-05-2026 | ✓ |
| UF del día | "1UF = $ 40.213,45" | $ 40.213,45 | ✓ |
| Reposición | "46.121 · 1.024,00 · 41.178.573" | 46.121 / 1.024 / 41.178.573 | ✓ |
| Seguro incendio | "46.121 · 1.024,00 · 41.178.573" | ídem | ✓ |
| Avalúo fiscal | "18.538 · 411,58 · 16.551.115" | 411,58 / 16.551.115 | ✓ |
| Remate 65% | "29.979 · 665,60 · 26.766.072" | 665,60 / 26.766.072 | ✓ |
| Liquidación 82,5% | "38.050 · 844,80 · 33.972.323" | 844,80 / 33.972.323 | ✓ |
| Superficies/UF-m² | "TASACION 1.024 0 40 25,60" | 1.024 / 0 / 40 / 25,60 | ✓ |
| Desviación muestra | "TASACION V/S PROMEDIO DE LA MUESTRA −7%" | "−7%" | ✓ |
| Cliente/dirección | "Miguenson Rameau · Calle Caspana N°310, Departamento: N° 14, Block A, Población Valle de la Luna · Quilicura" | ídem | ✓ |

## 6. Diffs residuales

- **D1 · Propietario en el PDF réplica**: imprime "Propietario Miguenson Rameau"; el oráculo imprime "Propietario: Víctor Leónidas González Moreno". El dato correcto SÍ está en Airtable (`TX_DatosTasacion.propietario_nombre` = "Víctor Leónidas González Moreno"): es un mapeo de plantilla/pipeline que usa el cliente final como propietario. Nota: el propio oráculo trae RUT Prop. = RUT cliente (9.588.043-6), así que el dato histórico ya era inconsistente. Cosmético, no valuatorio.
- **D2 · `desviacion_vs_promedio_pct` = 0 en TX_Calculos** vs −7,06% del XLSM (fila 20 de §3). El PDF imprime −7% correcto desde comparables; el terminal Airtable queda en 0 porque `F_DesviacionVsPromedio` exige `n_ofertas > 0`. Sin impacto en el informe impreso.
- **D3 · `TX_DatosTasacion.avaluo_fiscal_uf` = 16.551.115** (valor CLP almacenado en el campo UF). El terminal correcto (411,58) vive en TX_Calculos y es el que imprime el PDF. Quirk de seed sin impacto visible.
- **D4 · DFL-2**: oráculo imprime "DFL-2: SI"; réplica "DFL-2 NO" (`dfl2="NO"` en TX_DatosTasacion). Campo informativo sin efecto en terminales de este caso.
- **D5 · Páginas**: réplica 10 vs oráculo 8 (layout/anexos de la plantilla genérica).
- **D6 · "ALH -335"** con espacio intermedio en `numero_solicitud` y en el PDF (esperado "ALH-335"). Cosmético.
- **D7 · Objetivo**: oráculo "Crédito Hipotecario"; réplica "Refinanciamiento" (tipo_informe elegido para el sandbox). Tasador impreso "Sergio (nutricionsaludketo)" vs "Maria Eugenia Soto" — ambos esperables por diseño del sandbox, se dejan constancia.

## VEREDICTO: **OK**

Los 19/20 valores cotejados cuadran con el oráculo (el único miss es un terminal informativo de desviación que el PDF igual imprime correcto), el motor completó 17/17 sin aborts, los dos overrides están documentados (uno compensa un gap de fórmula conocido, verificado contra el XLSM) y el PDF réplica imprime los mismos valores de tasación que el informe histórico.
