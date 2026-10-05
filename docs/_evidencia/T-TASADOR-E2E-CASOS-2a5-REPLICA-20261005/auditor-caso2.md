# Auditoría ciega · Caso 2 (AGH-1548) · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005

**Fecha:** 2026-10-05 · **Rol:** auditor ciego (independiente del ejecutor)
**Solicitud auditada:** `recconVQfAc8LSGJf` · VP-2026-0074 · Agencia Habitacional · AGH-1548
**Propiedad:** Coronel Souper N° 4060, dp 2502 B, Edificio Mirador Souper, Estación Central

**Insumos usados:**
- Airtable producción vía REST API, SOLO GET: `TX_Solicitudes`, `TX_Calculos`, `A_Eventos`, `TX_DatosTasacion`.
- Oráculos: `docs/_referencias/5tasaciones/AG 1548.xlsm` (openpyxl, data_only) y `Informe JANETH PATRICIA CANDO ARIAS.pdf` (pypdf).
- PDF réplica: `docs/_evidencia/.../pdf-caso2.pdf` (único archivo permitido de ese directorio).
- `docs/_planes/PLAN_T-TASADOR-E2E-5CASOS-PROD-20261003.md` (pre-ejecución) y `docs/schema-airtable.md`.

**Insumos NO usados por regla de ceguera:** ningún entregable del ejecutor (`regresion-*`, `overrides-*`, `desviacion-*`, `seed-*`, `*-audit.json`, `*-oraculo.json`, `carbone-render-*`, `RETOMAR.md`, etc.).

---

## 1. Solicitud

| Check | Esperado | Encontrado | ✓/✗ |
|---|---|---|---|
| Record existe | recconVQfAc8LSGJf | existe (creado 2026-10-05 17:36 UTC) | ✓ |
| `estado` | calculada | `calculada` | ✓ |
| `codigo_solicitud` / `codigo_ext` | VP-2026-0074 | VP-2026-0074 | ✓ |
| `tasador` | recTJcV3BIvdcG4em | `recTJcV3BIvdcG4em` | ✓ |
| Cliente / Nº interno | Agencia Habitacional / AGH-1548 | cliente link + `numero_solicitud`="AGH -1548", `n_operacion_cliente`=1548 | ✓ |
| Aislamiento sandbox | — | `notas` = "CASO2-AGH-1548 · T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 · SANDBOX espejo vía motor AT03…" | ✓ |

Datos de contexto que calzan con el oráculo (FICHA SOLIC del XLSM): ejecutivo Geraldine Quivaqui, fecha solicitud 2026-05-08, visita 2026-05-12, entrega 2026-05-14, rol SII 694-416, avalúo fiscal $50.615.903, sup. 41 m², año construcción 2018.

## 2. Motor calculó

- **TX_Calculos:** 17 filas para `solicitud_codigo = "VP-2026-0074"` (calculo_id 1537–1553), `version_motor = AT03_v11.2.0_v32b1`, todas con `eval_ok` en notas.
- **A_Eventos:** 1 evento con `record_id_origen = recconVQfAc8LSGJf`: `tipo_evento = at03_dag_completo`, severidad `info`, "AT03_v31 EJECUTOR 17/17 OK", `detalle_json`: `formulas_total:17, formulas_escritas:17, formulas_errores:0`, 6.145 ms.
- **Aborts:** ninguno — no hay eventos H3/H5/H6/H7 ni de error para esta solicitud (el único evento es el dag_completo).

## 3. Igualdad vs oráculo (XLSM AG 1548 · hoja Portada/Hoja Resumen vs Airtable)

Valores terminales cotejados — **M = 24**, iguales **N = 20** → **83,3 % a nivel motor**; los **20/20 terminales monetarios/físicos = 100 %**. Los 4 que no cuadran son filas analíticas internas sin impacto en el PDF (ver abajo).

| # | Métrica | Oráculo XLSM (celda) | Airtable (motor) | ✓/✗ |
|---|---|---|---|---|
| 1 | Valor tasación UF | 1.394 (Portada AP69) | valor_comercial_uf = 1394 | ✓ |
| 2 | Valor tasación $ | 56.164.915,18 (AY69) | valor_comercial_clp = 56164915.18 | ✓ |
| 3 | Valor reposición UF | 1.115,2 (BG72) | valor_reposicion_uf = 1115.2 (vía override) | ✓ |
| 4 | Valor reposición $ | 44.931.932,144 (BL72) | 44931932.144 | ✓ |
| 5 | Seguro incendio UF | 1.394 (BG73) | 1394 | ✓ |
| 6 | Seguro incendio $ | 56.164.915,18 (BL73) | 56164915.18 | ✓ |
| 7 | Avalúo fiscal UF | 1.256,2748213163063 (BG74) | 1256.2748213163063 | ✓ |
| 8 | Avalúo fiscal $ | 50.615.903 (BL74) | 50615903 | ✓ |
| 9 | Valor remate UF (65%) | 906,0999… (BG77) | 906.1 | ✓ |
| 10 | Valor remate $ | 36.507.194,867 (BL77) | 36507194.867 | ✓ |
| 11 | Valor liquidación UF (82,5%) | 1.150,05 (BG78) | 1150.05 | ✓ |
| 12 | Valor liquidación $ | 46.336.055,0235 (BL78) | 46336055.0235 | ✓ |
| 13 | Ingreso líquido anual | 3.520.000 (BJ43) | 3520000 | ✓ |
| 14 | Renta perpetua | 58.666.666,67 (BJ44) | 58666666.66666667 | ✓ |
| 15 | UF día visita | 40.290,47 (AQ71) | uf_dia_visita = 40290.47 | ✓ |
| 16 | Superficie construida | 41 m² (AN51) | sup_construccion_m2 = 41 | ✓ |
| 17 | UF/m² tasación | 34 (BD51) | 1394/41 = 34 | ✓ |
| 18 | Vida útil remanente | 40 (BJ37) | vida_util_override = 40 | ✓ |
| 19 | Año construcción | 2018 (T51) | anio_construccion = 2018 | ✓ |
| 20 | Fecha visita | 12-05-2026 (BI69) | fecha_visita = 2026-05-12 | ✓ |
| 21 | Promedio UF/m² ofertas | 35,7637 (AX34) | promedio_uf_m2_muestra = 35.0812 | ✗ |
| 22 | Desviación vs promedio ofertas | −4,93 % (AX36) | desviacion_vs_promedio_pct = 0 | ✗ |
| 23 | Promedio UF/m² CBR | 33,375 (AX42) | promedio_uf_m2_cbr_out = 0 | ✗ |
| 24 | Desviación vs promedio CBR | +1,87 % (AX44) | desviacion_vs_promedio_cbr_pct = 0 | ✗ |

Diagnóstico de #21–24: `F_UFm2_promedio` del motor promedia los **7** comparables juntos (178,8186+39,25+27,5)/7 = 35,0812, mientras el oráculo separa ofertas (5 → 35,76) y CBR (2 → 33,375); las fórmulas de desviación devolvieron 0. **Sin impacto en el informe**: el PDF réplica imprime 35,76 / −5 % / 33,38 / 2 % calculados desde TX_Comparables, idénticos al oráculo (§5).

## 4. Overrides

Campos `*_override` no vacíos en el record (el resto —valor_final, garantía, seguro, liquidación, remate, tasa, factores, etc.— va en 0/vacío, confirmado también en `detalle_json` del evento AT03):

| Campo | Valor | Clasificación |
|---|---|---|
| `valor_reposicion_override` | 1115.2 | **Compensación de gap de fórmula del motor**: el XLSM calcula Reposición = factor_garantia (0,8) × edificación a-nuevo (0,8 × 1394 = 1115,2; Portada BG72), y `F_ValorReposicionUF` v32 calcula a-nuevo sin ese factor (daría 1394). Motivo y autor documentados en el propio record. |
| `vida_util_override` | 40 | **Regla de negocio legítima**: replica el juicio del tasador del oráculo (Portada BJ37 = 40 años) frente al `lookup_vida_util` = 70 de la tabla para hormigón. Es un input del caso, no un gap. |

Acompañantes: `override_motivo` = "SANDBOX T-REPLICA-20261005: el XLSM AGH calcula Reposición = factor_garantia(0.8) × edificación a-nuevo (Portada BG72=1115.2) y F_ValorReposicionUF v32 calcula a-nuevo sin ese factor (daría 1394). Gap de fórmula documentado en overrides-caso2.md." · `override_autor` = "T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005 (agente piloto)". El evento AT03 registra los overrides aplicados (repo=1115.2, vida_util=40, resto 0).

## 5. PDF réplica (`pdf-caso2.pdf`)

PDF válido, **11 páginas** (oráculo histórico: 8 — la réplica agrega páginas de fotos/anexos del formato actual). Spot-check de valores impresos, lado a lado:

| Valor impreso | PDF réplica | PDF/XLSM oráculo | ✓/✗ |
|---|---|---|---|
| Valor tasación | UF 1.394,00 · $ 56.164.915 al 12-05-2026 | UF 1.394 · $ 56.164.915,18 al 12-05-2026 | ✓ |
| 1UF / 1US$ | 40.290,47 / 894,25 | 40.290,47 / 894,25 | ✓ |
| Valor de Reposición | 1.115,20 UF · $ 44.931.932 | 1.115,2 · 44.931.932,144 | ✓ |
| Seguro Incendio | 1.394,00 UF · $ 56.164.915 | 1.394 · 56.164.915,18 | ✓ |
| Avalúo fiscal | 1.256,27 UF · $ 50.615.903 | 1.256,27 · 50.615.903 | ✓ |
| Remate 65 % / Liquid. 82,5 % | 906,10 / 1.150,05 | 906,10 / 1.150,05 | ✓ |
| Superficie · UF/m² | 41,00 · 34,00 | 41 · 34 | ✓ |
| Promedios/desviaciones | 35,76/−5 % y 33,38/2 % | 35,76/−5 % y 33,38/2 % | ✓ |
| Rentabilidad | vida útil 40 · arriendo 320.000 · UF/mes 7,9 · tasa 6,0 % · ingreso 3.520.000 · renta perpetua 58.666.667 | idéntico (Portada BJ37-BJ44) | ✓ |
| Dirección / comuna / rol | Coronel Souper N° 4060, dp N°2502 B, Mirador Souper · Estación Central · 694-416 | idéntico | ✓ |
| Visador | Héctor Martínez C. | Héctor Martínez C. | ✓ |
| Permiso / Recepción | N°65 28-04-2014 · N°03 26-02-2018 | N° 65 28-04-2014 · N° 03 26-02-2018 | ✓ |
| **Nombre Cliente** | ANDRES PABLO ISRAEL AVRAM (7.774.862-8) | Janeth Patricia Cando Arias (22.959.221-1) | ✗ |
| **Objetivo** | Refinanciamiento | Crédito Hipotecario | ✗ |
| **DFL-2** | NO | SI | ✗ |
| Tasador | Sergio (nutricionsaludketo) | Marcela Gómez | ✗ esperado (tasador sandbox del plan) |

## 6. Diffs residuales

1. **Cliente impreso ≠ solicitante del oráculo.** La réplica usa al propietario (Andrés Pablo Israel Avram, 7.774.862-8) como `cliente_final_nombre`/"Nombre Cliente"; el oráculo imprime a la solicitante Janeth Patricia Cando Arias (22.959.221-1) como Cliente y a Avram como Propietario. La solicitante no aparece en ningún campo de la réplica. Campo de identificación, no de avalúo.
2. **Objetivo del informe:** réplica "Refinanciamiento" vs oráculo "Crédito Hipotecario" (FICHA SOLIC E27). Los factores aplicados (0,8/0,8/6 %/0,65/0,825) producen exactamente los valores del oráculo, así que no hay impacto numérico.
3. **DFL-2:** réplica "NO" vs oráculo "SI". Causa: `dfl2` es fórmula sobre `sup_construida_total` (suma de `sup_construida_piso*`) con guarda `>0` (schema §27); el seed no cargó superficies por piso (`sup_construida_total = 0`) → "NO".
4. **4 filas analíticas de TX_Calculos** (promedios/desviaciones UF/m²) no replican el desglose ofertas/CBR del oráculo (§3 #21–24); el PDF imprime los valores correctos desde TX_Comparables — gap interno del motor sin efecto visible.
5. **Tasador impreso** distinto del histórico (sandbox, por diseño: `recTJcV3BIvdcG4em`). No es hallazgo.
6. Menores de formato: `numero_solicitud` conserva el espacio del XLSM ("AGH -1548"), igual que el oráculo; réplica 11 páginas vs 8 del histórico (plantilla actual con más anexos).

---

## VEREDICTO: **OK**

Estado `calculada`, motor 17/17 sin errores, 20/20 valores terminales monetarios/físicos idénticos al oráculo (los 2 que requerían intervención están cubiertos por overrides documentados con motivo y autor), y el PDF imprime todos los valores del avalúo iguales al informe histórico; los diffs residuales son de identificación/encabezado (cliente-solicitante, objetivo, DFL-2) y analíticos internos sin impacto en el informe.
