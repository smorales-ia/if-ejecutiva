# Regresión de datos — PDF v3 vs oráculo MET-6283 (29-sep-2026)

> Fuente: `verificar.py` de esta carpeta (batería completa en `tests-output.txt`,
> **127/128 PASS**). PDF v3 = render REAL en Carbone producción con la plantilla
> nueva (`31f3bfab…8e32`) y el contexto real de la corrida (`contexto-real-v2.json`,
> mismo que produce `lib/informe/ensamblador.ts`), `lang: es-cl`.
> ⚠ La cadena Make completa NO se re-disparó: el re-apunte de E2 al template nuevo
> quedó bloqueado por permisos del entorno (ver `rollback.md` §Cambios #3 y
> `handoff-produccion.md`). El render es idéntico al que haría E2 (mismo endpoint,
> mismo template, mismo contexto, mismo lang).

## Valores clave (Esperado / Obtenido / Delta / OK)

| Concepto | Esperado (XLSM/oráculo) | Obtenido en v3 | Delta | OK |
|---|---|---|---|---|
| Desviación vs promedio (ofertas) | -3% | -3% | 0 | ✅ |
| Desviación vs promedio (CBR) | 36% | 36% | 0 | ✅ |
| 161% (valor erróneo viejo) | AUSENTE | ausente | — | ✅ |
| Promedio UF/m² ofertas | 33,64 | 33,64 | 0 | ✅ |
| Promedio UF/m² CBR | 24,08 | 24,08 | 0 | ✅ |
| 30,91 (promedio combinado viejo) | AUSENTE | ausente | — | ✅ |
| Dólar | 890,33 | 890,33 | 0 | ✅ |
| Columna US$ | 414.344 · 399.115 · 381.667 · 586.180 · 743.998 | todos presentes | 0 | ✅ |
| UF | 39.894,61 | 39.894,61 | 0 | ✅ |
| Valor comercial UF | 20.125,86 | 20.125,86 | 0 | ✅ |
| Valor comercial $ | 802.913.431 | 802.913.431 | 0 | ✅ |
| Valores seguro/liquidación/etc. | 9.246,94 · 8.907,06 · 8.517,68 · 13.081,81 · 16.603,84 | todos presentes | 0 | ✅ |
| Avalúo fiscal | 36.300.000 / 806.666.667 | presentes | 0 | ✅ |
| Comparables (totales) | 20.000 · 24.900 · 19.500 · 23.900 · 18.900 · 20.500 · 18.000 | 7/7 | 0 | ✅ |
| Comparables (UF/m²C homologado) | 34,05 · 35,19 · 35,71 · 31,45 · 31,82 · 25,18 · 22,99 | 7/7 | 0 | ✅ |
| Cuadro valoración | 11.218,80 · 8.157,06 · 350,00 · 32,64 · 0,96 | todos | 0 | ✅ |
| Rentabilidad | 3.300.000 · 4,5% · 8 A 10 MESES · 82,5% · 65 | todos | 0 | ✅ |
| Identificación (T1, 23 literales) | RUT, partes, dirección, roles, fechas… | 23/23 | 0 | ✅ |
| Hoja 3 (T3, 40 literales) | materiales, urbanismo, % depreciación… | 40/40 | 0 | ✅ |

**T1+T3+T4: 100% PASS (0 deltas de datos).**

## Hoja 1 — densidad vertical re-medida (v3 vs referencia, bandas a 100 dpi)

- 17 bandas de contenido en ambas páginas; **15/17 con delta ≤1,11%** (dentro de la
  tolerancia 1,5%); anclas principales: título 0,09% · logo 0,26% · ANTECEDENTES 0,26% ·
  caja 0,26% · pie 0,09% · **fin de contenido 81,3% = 81,3% (delta 0,00)**.
- Las 2 bandas restantes (ref 15,6% y 49,7%) son los bordes del **marco fino alrededor
  del logo**, que la plantilla no dibuja — residuo ornamental/horizontal ya catalogado
  BAJA en `diseno-checklist.md` de la tanda previa; no es densidad vertical.
- Pixel-diff p1: **20% → 10%** tras el ajuste (umbral 35%).

## Regresión visual p2–p8

- v2 → v3: **0,0% de diff en las 7 páginas** (solo cambió la portada; medición en
  esta corrida). Comparaciones lado a lado: `comparacion-p1.png` … `comparacion-p8.png`
  (izquierda = referencia, derecha = v3).
- vs referencia: p3 20% · p4 26% · p7 26% · p8 31% (PASS ≤35%); **p2 42% FAIL
  pre-existente** — mismo valor exacto que en la batería v2 de la tanda previa
  (artefacto de la métrica de grises por autoshapes del mapa; no es regresión de esta
  tanda ni diferencia de datos: T1/T2/T3/T4 100% en esa página). p5/p6 excluidas de la
  métrica por diseño (grillas fotográficas).

## Genericidad (test)

- `pnpm test` 1017/1017 PASS, incluido `lib/informe/overrides.test.ts` (candado:
  overrides de MET-6283 SOLO si `codigo === VP-2026-0067`) — ninguna ranura devuelve
  assets de MET-6283 para otra solicitud (`ASSETS_POR_CODIGO` con única clave
  VP-2026-0067, ranura vacía honesta para el resto). Ver `genericidad-check.md`.

## Motor (post-fix C_Formulas)

- Harness en seco 17/17 eval_ok: promedio ofertas 33,643448 · CBR 24,084478 ·
  uf_m2_construccion 32,64 · desviaciones -2,9826% / +35,5230% · dólar 414.344 —
  todos = XLSM. Ver `harness-motor-output.txt`.
