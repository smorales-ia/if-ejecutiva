# Regresión B-0b — MET-6283 (VP-2026-0066 · recNiwM4s1ibr3sbO)

> Estado: **CERRADO 21-09-2026.** BLOQUE 1 (MCP) + BLOQUE 2/3/4 ejecutados en vivo. v11.1.1 publicado por
> Sergio en la UI de AT03; trigger `asignada→visitada` disparado vía PATCH REST (MCP OAuth caído — fallback
> RO-30). Oráculo: xlsm `1951-MET 6283…` hoja Portada. Tolerancia: ±1 % en cierre, ±0,01 UF en intermedias.
>
> **Resultado: BLOQUE 2 PASS (13/13 ±1%) · BLOQUE 3 auditor ciego PASS (CONSISTENTE 13/13) · BLOQUE 4 no
> ejecutado (condición de rollback no cumplida).** `estado=calculada` confirma el fix v11.1.1 del singleSelect.

## Estado en vivo aplicado (verificado en read-back)

- **C_Formulas → v3.3 (7 patches):** F_ValorComercialUF `rec8rv76smtjQh4Rb`, F_ValorReposicionUF
  `reckDXGPbkDVjzPjY`, F_SeguroIncendioUF `recZTfJX0MJ0r1tHP` (terminales v3.2→v3.3) + chain
  F_ValorEdificacion `recsYqh0ssRR0mUJo`, F_ValorTerreno `recHNKyfGDBV4Hxu3`, F_ValorOCC
  `recNvuDLjUpr0re89`, F_ValorComercial `recl2rsrDf7XqNKTI` (v3.1→v3.3). Expresiones confirmadas.
- **Cuadro poblado:** 6 filas en `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`), link a VP-2026-0066.
- **TX_Calculos previos borrados:** 13 filas contaminadas (calc con override) eliminadas de `tblFz37KSvn5pLKDR`.
- **Overrides retirados:** `valor_final_override`/`valor_reposicion_override`/`valor_seguro_override` → vacío.
- **Estado:** `visitada` → `asignada` (armado; falta subir a `visitada` para disparar tras publish).

## Capa 3a — Variables SCOPE (verificadas contra las fórmulas de la tabla, read-back en vivo)

| ID | Variable SCOPE | Celda | Esperado | Obtenido (fórmula tabla) | Δ | OK |
|---|---|---|---|---|---|---|
| R-01 | valor_edificacion_items_uf (Σ valor_total_uf, Edificacion) | BI59 | 8.157,06 | 8.157,0624 | 0,00 % | ✅ |
| R-02 | valor_edificacion_nuevo_items_uf (Σ sup×uf_m2, Edificacion) | CC70 | 8.496,94 | 8.496,94 (249,91×34) | 0,00 % | ✅ |
| R-03 | valor_terreno_items_uf (Σ valor_total_uf, Terreno) | BI61 | 11.218,80 | 11.218,80 | 0,00 % | ✅ |
| R-04 | valor_occ_items_uf (total − edif − terreno) | BI60 | 750 | 750 (20.125,8624−8.157,0624−11.218,80) | 0,00 % | ✅ |
| R-05 | sup_terreno_items_m2 (Σ superficie, Terreno) | AN61 | 5.024,86 | 5.024,86 (1.402,35+3.622,51) | 0,00 % | ✅ |
| R-06 | valor_seguro_base_items_uf (Σ valor_seguro_base) | BO62 | 8.907,06 | 8.907,0624 (8.157,06+350+250+150) | 0,00 % | ✅ |
| R-07 | hay_cuadro | — | 1 | 1 (6 filas) | — | ✅ |

**Detalle de las 6 filas (inputs → valor_total_uf / valor_seguro_base computados por la tabla):**

| # | tipo_bien | detalle | sup | uf_m2 | factor | valor_total_uf | valor_seguro_base | recId |
|---|---|---|---|---|---|---|---|---|
| 51 | Terreno | Terreno | 1.402,35 | 8 | 1 | 11.218,80 | 0 | reciUBbOFzcqe7RCP |
| 52 | Terreno | Servidumbre | 3.622,51 | 0 | 1 | 0 | 0 | recvxRGbICF8lbE7E |
| 53 | Edificacion | Piso 1 | 249,91 | 34 | 0,96 | 8.157,0624 | 8.157,0624 | rec1Qtn0qyVbQYhxI |
| 54 | Piscina | Piscina | 1 | 350 | 1 | 350 | 350 | recupc729ooXrweGl |
| 55 | OO.CC. | Quincho, terrazas, bodega | 1 | 250 | 1 | 250 | 250 | recuQEMmCOId9Jfbp |
| 56 | OO.CC. | Cierros, pavimento exterior | 1 | 150 | 1 | 150 | 150 | rec1s7d6ET147j7hM |

## Capa 3b — Terminales (13 valores) — ✅ EJECUTADO (trigger 21-09-2026 20:19Z · v11.1.1)

Corrida real: overrides retirados, `hay_cuadro=1`, fórmulas v3.3, DAG `AT03_v11.1.1_v32b0`. Los 13
`TX_Calculos` (`tblFz37KSvn5pLKDR`, `solicitud_codigo='VP-2026-0066'`) calculados `2026-09-21T20:19:14-18Z`.

| ID | Terminal | Esperado | Obtenido | Δ% | Estado |
|---|---|---|---|---|---|
| R-08 | F_ValorComercialUF (BI62) | 20.125,86 | 20.125,8624 | 0,00 % | ✅ |
| R-09 | F_ValorComercialCLP | 802.913.431 | 802.913.431,36 | 0,00 % | ✅ |
| R-10 | F_ValorReposicionUF (BG72) | 9.246,94 | 9.246,94 | 0,00 % | ✅ |
| R-11 | F_SeguroIncendioUF (BO62) | 8.907,06 | 8.907,0624 | 0,00 % | ✅ |
| R-12 | F_AvaluoFiscalUF | 8.517,68 | 8.517,6777 | 0,00 % | ✅ |
| R-13 | F_ValorRemateUF (BG77) | 13.081,81 | 13.081,81056 | 0,00 % | ✅ |
| R-14 | F_ValorLiquidacionUF (BG78) | 16.603,84 | 16.603,83648 | 0,00 % | ✅ |
| R-15 | F_IngresoLiquidoAnualCLP | 36.300.000 | 36.300.000 | 0,00 % | ✅ |
| R-16 | F_RentaPerpetuaCLP | 806.666.667 | 806.666.666,67 | 0,00 % | ✅ |
| — | F_ValorReposicionCLP | 368.903.065 | 368.903.064,99 | 0,00 % | ✅ |
| — | F_SeguroIncendioCLP | 355.343.781 | 355.343.780,69 | 0,00 % | ✅ |
| — | F_ValorRemateCLP | 521.893.730 | 521.893.730,39 | 0,00 % | ✅ |
| — | F_ValorLiquidacionCLP | 662.403.581 | 662.403.580,87 | 0,00 % | ✅ |
| R-17 | hay_cuadro=0 → modelo previo | idéntico v11.0 | — | ⏭ FUERA DE ESTE TRIGGER (requiere record sin cuadro) |
| R-18 | 13 valores idénticos a backup v11.0 (sin cuadro) | idéntico | — | ⏭ FUERA DE ESTE TRIGGER |

**BLOQUE 3 · auditor ciego (agente independiente):** recomputó los 13 desde los insumos crudos del cuadro
(BI59/CC70/BI61/BI60/BO62/UF_día) sin ver el resultado del motor → **CONSISTENTE 13/13 a ±1%**, sin override
oculto ni fórmula distinta. Matiz detectado (no fallo): el motor usa los valores de celda con precisión
completa (`8157,0624`, `8907,0624`) vs. los insumos redondeados a 2 dec; offset sistemático ~0,0024 UF
(~0,00001 %, ≈95 CLP/800M) trazado a redondeo de transcripción, no al motor.

**Contaminación:** 0 restos. Conteo sandbox = 13 exactos, todos `AT03_v11.1.1_v32b0`, cero filas
`AT03_v11.1_v32b0`. El CLEANUP del DAG borró los cálculos previos (de override) antes de reescribir.

**BLOQUE 4 · rollback condicional:** condición = "fallan ≥2 de 3 bloques". BLOQUE 2 ✅ + BLOQUE 3 ✅ →
condición NO cumplida. No se ejecutó rollback. Nada que revertir.

## Capas 1/2/4 (unit / integración / smoke) — resumen

- **Unit U-01..U-08**: la lógica de agrupación quedó **validada empíricamente en vivo** por las fórmulas de
  la tabla (3a arriba reproducen BI59/CC70/BI61/BI60/AN61/BO62). Falta el port a vitest co-ubicado.
- **U-09/U-10**: DAG repo v11.1.1 — `node --check` (async-wrap) SYNTAX OK; cabecera `AT03_v11.1.1_v32b0`.
- **Integración I-01..I-07**: ⚠ **límite de capacidad** — no puedo leer el log de ejecución de AT03 (ni MCP
  ni REST exponen logs de Automation), así que los asertos literales sobre líneas de log (`CUADRO: filas=6…`,
  `FIN OK`, `WARN transicion`) **no se verifican de forma directa**. **Confirmados de forma indirecta por el
  estado final:** (a) `estado=calculada` prueba que la corrida llegó al paso 11 y que la escritura canónica
  del singleSelect (fix v11.1.1) tuvo éxito — I-02/I-03; (b) los 13 valores = sumas del cuadro prueban que
  `CUADRO:` leyó `hay_cuadro=1` y sumó BI59/BI61/BI60/BO62 correctamente — I-01/I-04..I-07.
- **Smoke S-01..S-05**: la corrida limpia (13 escritos, `estado=calculada`, `version_motor` identificable,
  0 contaminación) cubre S-01..S-04. **Screenshots UI (S-05): NO ejecutable por mí** — no hay tooling de
  navegador en esta sesión (Playwright es script huérfano; sin MCP de browser). Los toma Sergio, o sirve como
  sustituto la data del record (los 13 valores de arriba son lo que la UI del Tasador renderiza).

## Bloqueo único — RESUELTO

Publicar el borrador de AT03 (v11.1.1) en la UI de Airtable. **HECHO por Sergio el 21-09-2026.** Confirmado
en runtime: los 13 `TX_Calculos` salieron con `version_motor='AT03_v11.1.1_v32b0'` y `estado→calculada` sin
quedar trabado en `visitada` (el bug de v11.1 no se manifestó → el fix está vivo).
