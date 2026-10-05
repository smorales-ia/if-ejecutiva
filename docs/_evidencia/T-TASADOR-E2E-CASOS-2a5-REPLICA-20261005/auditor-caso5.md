# Auditoría ciega — Caso 5 (HEV-3183 · VP-2026-0077)

- **Fecha**: 2026-10-05
- **Tanda**: T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005
- **Rol**: Auditor ciego (independiente del ejecutor)
- **Insumos usados**: Airtable producción vía API REST (solo GET: TX_Solicitudes `recoZcwmgCBVKQMxF`, TX_Calculos, A_Eventos `recJgCWBaV6hgnUmk`, TX_DatosTasacion `recQaqsQEtCkizgnb`, TX_Comparables ×6), oráculos `docs/_referencias/5tasaciones/HEV3183.xlsm` (openpyxl, data_only) y `docs/_referencias/5tasaciones/informe CARLOS ANDRÉS CORTÉS PÉREZ.pdf` (pypdf), y el PDF réplica `pdf-caso5.pdf` (único archivo permitido del directorio de evidencia).
- **Insumos NO usados (regla de ceguera)**: ningún entregable del ejecutor (`regresion-*`, `overrides-caso5.md`, `desviacion-*`, `seed-*`, `*-audit.json`, `*-oraculo.json`, `carbone-render-*`, `RETOMAR.md`, etc.).

---

## 1. Solicitud

| Chequeo | Esperado | Encontrado | ✓/✗ |
|---|---|---|---|
| Record existe | `recoZcwmgCBVKQMxF` | existe en `tblaHTyMHYfmy7Fg6` | ✓ |
| `estado` | `calculada` | `calculada` | ✓ |
| `tasador` | `recTJcV3BIvdcG4em` | `['recTJcV3BIvdcG4em']` | ✓ |
| Código | VP-2026-0077 | `codigo_solicitud` = `codigo_ext` = `VP-2026-0077` | ✓ |
| Cliente / Nº interno | Hipotecaria Evoluciona / HEV-3183 | cliente link `recPDwixzybwHlJaQ` (payload AT03: "Hipotecaria Evoluciona") · `numero_solicitud` = `HEV -3183` | ✓ |
| Marcado sandbox | — | `notas` = "CASO5-HEV-3183 · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 · SANDBOX espejo vía motor AT03…" | ✓ |

## 2. Motor calculó

- **TX_Calculos**: **17 filas** con `solicitud_codigo = VP-2026-0077` (paginado completo; coincide con los 17 links del record). Las 17 fórmulas de la regla (`rec2QYP8yjMW1Smsm`) están presentes, cada una con `resultado` numérico.
- **A_Eventos**: 1 solo evento vinculado — `recJgCWBaV6hgnUmk`, `tipo_evento = at03_dag_completo`, severidad `info`, descripción `[COD=VP-2026-0077] AT03_v31 EJECUTOR 17/17 OK`, `detalle_json`: `formulas_total: 17, formulas_escritas: 17, formulas_errores: 0` (6.242 ms).
- **Aborts**: búsqueda por `FIND('VP-2026-0077', clave_evento & descripcion)` sobre toda A_Eventos devuelve únicamente ese evento. **No hay eventos de abort (H3/H5/H6/H7 ni similares).**

## 3. Igualdad vs oráculo (XLSM `HEV3183.xlsm`, hoja Portada, data_only)

Terminales del XLSM lado a lado con Airtable (TX_Calculos / TX_DatosTasacion) y el PDF réplica:

| # | Valor | Oráculo XLSM | Airtable | PDF réplica | Match |
|---|---|---|---|---|---|
| 1 | Valor tasación UF (AP69) | 3.858,91 | F_ValorComercialUF = 3858.91 | UF 3.858,91 | ✓ |
| 2 | Valor tasación $ (AY69) | 155.477.297,5877 | F_ValorComercialCLP = 155477297.5877 | $ 155.477.298 | ✓ |
| 3 | Valor Reposición UF (BG72) | 3.167,128 | F_ValorReposicionUF = 3167.128 (vía override) | 3.167,13 | ✓ |
| 4 | Valor Reposición $ (BL72) | 127.605.075,67 | F_ValorReposicionCLP = 127605075.67016 | 127.605.076 | ✓ |
| 5 | Seguro Incendio UF (BG73) | 3.087,128 | F_SeguroIncendioUF = 3087.128 (vía override) | 3.087,13 | ✓ |
| 6 | Seguro Incendio $ (BL73) | 124.381.838,07 | F_SeguroIncendioCLP = 124381838.07016 | 124.381.838 | ✓ |
| 7 | Avalúo fiscal UF (BG74) | 0 · texto **"NO REGISTRA"** (BL74/BN75) | F_AvaluoFiscalUF = 0 · `avaluo_fiscal_texto`='NO REGISTRA' · `avaluo_no_registra`=True | imprime **"0,00"**, sin "NO REGISTRA" | ✓ numérico / ✗ texto (ver §6) |
| 8 | Valor a Remate UF (BG77) | 2.508,2915 | F_ValorRemateUF = 2508.2915 | 2.508,29 | ✓ |
| 9 | Valor a Remate $ (BL77) | 101.060.243,432 | F_ValorRemateCLP = 101060243.432005 | 101.060.243 | ✓ |
| 10 | Liquidación UF (BG78) | 3.183,60075 | F_ValorLiquidacionUF = 3183.60075 | 3.183,60 | ✓ |
| 11 | Liquidación $ (BL78) | 128.268.770,51 | F_ValorLiquidacionCLP = 128268770.50985 | 128.268.771 | ✓ |
| 12 | Ingreso Líquido Anual (BJ43) | 7.040.000 | F_IngresoLiquidoAnualCLP = 7040000 | 7.040.000 | ✓ |
| 13 | Renta Perpetua (BJ44) | 156.444.444,44 | F_RentaPerpetuaCLP = 156444444.4444 | 156.444.444 | ✓ |
| 14 | UF día visita (AQ71) | 40.290,47 | `uf_dia_visita` = 40290.47 | $ 40.290,47 | ✓ |
| 15 | Sup. construcción (AN59) | 47,61 | `sup_construccion_m2` = 47.61 | 48 (redondeo, igual al oráculo PDF) | ✓ |
| 16 | Sup. terraza (AN52) | 6,53 | `sup_terraza` = 6.53 | 6,53 (en síntesis) | ✓ |
| 17 | UF/m² C. tasación (AX35/BD59) | 72,6509 | — (derivable) | 72,65 | ✓ |
| 18 | Vida útil remanente (BJ37) | 70 | `vida_util_override` = 70 | 70 | ✓ |
| 19 | Cuadro item Depto (BI51) | 3.204,24 | — | 3.204,24 | ✓ |
| 20 | Cuadro item Terraza (BI52) | 254,67 | — | 254,67 | ✓ |
| 21 | Cuadro item Estac. (BI53) | 400 | — | 400,00 | ✓ |
| 22 | Promedio muestra ofertas (AX34) | 75,3354 | F_UFm2_promedio = **73,8372** ✗ | 75,34 ✓ | PDF ✓ / Airtable ✗ |
| 23 | Promedio CBR (AX42) | 66,3462 | F_UFm2_promedio_CBR = **0** ✗ | 66,35 ✓ | PDF ✓ / Airtable ✗ |
| 24 | Desviación vs ofertas (AX36) | −3,56 % | F_DesviacionVsPromedio = **0** ✗ | −4 % ✓ | PDF ✓ / Airtable ✗ |
| 25 | Desviación vs CBR (AX44) | +9,50 % | F_DesviacionVsPromedioCBR = **0** ✗ | 10 % ✓ | PDF ✓ / Airtable ✗ |

**Porcentaje de igualdad calculado por el auditor (M = 25 valores cotejados):**
- **PDF réplica vs oráculo: 24/25 plenos = 96 %** (el faltante es la leyenda "NO REGISTRA" del avalúo fiscal; el valor numérico 0 sí coincide).
- **TX_Calculos vs XLSM: 13/17 fórmulas = 76,5 %** — las 4 que no cuadran (#22–25) son indicadores informativos de promedio/desviación, no terminales del informe, y el PDF imprime los valores correctos por sección (salen de los comparables, no de esas fórmulas). Causa verificada aritméticamente: `F_UFm2_promedio = 73,8372` es exactamente el promedio de las **6** referencias (5 ofertas + 1 CBR = 443,023/6), es decir el rollup de muestra mezcla la referencia CBR; el XLSM promedia 5 y 1 por separado. Con promedio de ofertas puro daría 75,3354. Las desviaciones dan 0 porque su guard (`n_ofertas > 0` / `n_cbr > 0`) no se cumple en los conteos que ve el motor.

**Atención particular pedida — avalúo fiscal**: el oráculo figura "NO REGISTRA" (XLSM BL74 y PDF histórico lo imprimen como texto). El PDF réplica imprime **"Avalúo fiscal propiedad : 0,00"** y **no imprime "NO REGISTRA"** en ninguna página (grep sobre las 11 páginas extraídas). El dato sí está cargado en Airtable (`avaluo_fiscal_texto = 'NO REGISTRA'`, `avaluo_no_registra = True`): es un gap de la plantilla de impresión, no del seed ni del motor.

## 4. Overrides

Campos `*_override` no vacíos en `recoZcwmgCBVKQMxF` (los demás 12 overrides del detalle AT03 están en 0):

| Campo | Valor | Clasificación del auditor |
|---|---|---|
| `valor_reposicion_override` | 3167.128 | **Compensación de gap de fórmula del motor.** F_ValorReposicionUF v3.3 suma edificación a-nuevo + OO.CC. sin el factor 0,8 (daría 3.858,91); el XLSM hace 0,8×3.458,91+400 = 3.167,128. Aritmética verificada por el auditor: ambas cifras reproducidas exactas. Mismo gap declarado en Caso 2 según el motivo. |
| `valor_seguro_override` | 3087.128 | **Compensación de gap de fórmula del motor.** El XLSM aplica factor 0,8 a TODO el cuadro incl. estacionamiento (0,8×3.858,91 = 3.087,128, verificado); el motor usa `valor_seguro_base_items_uf` (excluye estac. y sin factor → 3.458,91). |
| `vida_util_override` | 70 | **Regla de negocio legítima**: dato de entrada del tasador (Vida Útil Remanente, XLSM BJ37 = 70); coincide 1:1 con el oráculo, no compensa ninguna fórmula. |

Acompañantes: `override_autor` = "T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 (agente caso 5)"; `override_motivo` completo presente en el record y replicado en el `detalle_json` del evento AT03, con la aritmética explícita de ambos gaps. Los dos overrides de compensación están correctamente documentados y sus valores coinciden exactamente con el oráculo.

## 5. PDF réplica

- Archivo: `pdf-caso5.pdf`, **PDF válido, 11 páginas** (pypdf lo abre y extrae texto de todas). El oráculo histórico tiene 8 — la diferencia es paginación de fotos/anexos, no de contenido de valores.
- Spot-check de valores impresos (réplica vs oráculo PDF, Hoja N°1):
  - VALOR TASACIÓN: **UF 3.858,91 / $ 155.477.298 al 12-05-2026** — idéntico al oráculo. ✓
  - Reposición **3.167,13 / 127.605.076**, Seguro **3.087,13 / 124.381.838**, Remate **2.508,29 / 101.060.243**, Liquidación **3.183,60 / 128.268.771** — idénticos. ✓
  - 1UF = $ 40.290,47 · 1US$ = $ 894,25 — idénticos. ✓
  - Nombre cliente "Carlos Andrés Cortes Pérez", Nº interno "HEV -3183", institución "Hipotecaria Evoluciona", dirección "Exequiel Fernandez Nº 6150, Departamento: Nº 411, Torre 3…", comuna La Florida — idénticos en carátula (p1) y cabeceras. ✓
  - Referencias: las 5 ofertas (4.100/4.050/4.130/3.939/4.609 UF) + CBR 3.450, promedios 4.166 · 75,34 y 3.450 · 66,35, desviaciones −4 % y 10 % — idénticos. ✓
  - Cuadro de valoración: 3.204,24 / 254,67 / 400,00 → VALOR COMERCIAL NORMAL 3.858,91 · 3.087,13 · 3.183,60 — idéntico. ✓
  - Tasador impreso: "Sergio (nutricionsaludketo)" vs "Sergio Gajardo" del histórico — **esperado**: es el tasador sandbox `recTJcV3BIvdcG4em` exigido por la tanda. Visador "Héctor Martínez C." coincide. ✓

## 6. Diffs residuales

Ninguno toca un valor terminal; todos listados por exhaustividad:

1. **Avalúo fiscal**: réplica imprime "0,00" donde el oráculo imprime "NO REGISTRA" (dato correcto sí está en TX_DatosTasacion; gap de plantilla).
2. **Propietario**: oráculo "Inmobiliaria Exequiel Fernández Torre Tres SpA" / RUT 77.294.373-3; la réplica imprime el cliente ("Carlos Andrés Cortes Pérez" / RUT Prop. 0). El dato correcto está en Airtable (`propietario_nombre`, `propietario_rut`); la plantilla mapea propietario←cliente.
3. **Objetivo**: oráculo imprime "Crédito Hipotecario"; réplica "Refinanciamiento" (el `tipo_informe` del seed). Divergencia de rótulo, no de cálculo.
4. **Rol SII del estacionamiento** en el cuadro: oráculo **31-800**; réplica **31-516** (y las filas vacías 4–6 también imprimen 31-516 — la plantilla repite el rol principal).
5. **Tiempo Renta (años)**: oráculo 65; réplica lo deja en blanco.
6. **Zona** ("E-AA1 (La Florida)") y **Fuente Información** ("DOM, Plano Catastro"): en blanco en la réplica pese a existir el dato en TX_DatosTasacion (`tipo_zona_descripcion`).
7. **TX_Calculos informativos**: `F_UFm2_promedio` = 73,8372 promedia las 6 referencias mezclando la CBR (XLSM: 75,3354 solo ofertas); `F_UFm2_promedio_CBR`, `F_DesviacionVsPromedio` y `F_DesviacionVsPromedioCBR` quedaron en 0. El PDF imprime los correctos (75,34 / 66,35 / −4 % / 10 %), así que no se propaga al informe.
8. **Paginación**: 11 páginas réplica vs 8 oráculo (distribución de fotos/anexos).
9. `cliente_final_rut` = '0' (el oráculo tampoco registra RUT del cliente: imprime 0) — paridad, no diff real.

---

## VEREDICTO: **OK**

Los 11 valores terminales del informe (tasación, reposición, seguro, remate, liquidación en UF y $, más avalúo fiscal 0) coinciden exactos entre XLSM, Airtable y PDF réplica (24/25 = 96 % de los valores cotejados), el motor corrió 17/17 sin aborts, y los 2 overrides de compensación están documentados con aritmética verificada; los diffs residuales son de plantilla/presentación, no de valores.
