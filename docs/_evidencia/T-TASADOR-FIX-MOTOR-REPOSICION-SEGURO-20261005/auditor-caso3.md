# Auditoría ciega · Caso 3 · VP-2026-0075 (Austral Leasing Hab. ALH-335)

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · **Rol:** auditor ciego (solo estado final)
**Fecha:** 2026-10-05 · **Fuentes:** Airtable REST GET (app9G7lLkIV3CpeLa) + oráculo `docs/_referencias/5tasaciones/caspana 310 dp 14, quilicura.xlsm` (openpyxl data_only True/False)
**Ceguera respetada:** no se leyó ningún archivo de `_evidencia/` de esta tanda ni de T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.

## VEREDICTO: **OK** (6/6 terminales cuadran; reposición sale de fórmula sin override; el único override de seguro compensa un dato erróneo del maestro M_Clientes, no un gap de fórmula)

---

## 1. Fórmulas vigentes en C_Formulas (`tblNFa454fBbqRB3t`)

**`reckDXGPbkDVjzPjY` · F_ValorReposicionUF** (v3.3, activa, `ultima_modificacion` 2026-10-05T20:30:31Z):

```
valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

→ el **×0,8 condicional está presente**: con cuadro y `sup_terreno_items_m2 = 0` aplica `valor_edificacion_nuevo_items_uf * 0.8`. Es el espejo exacto del oráculo `Portada!BG72 = IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)`.

**`recZTfJX0MJ0r1tHP` · F_SeguroIncendioUF** (v3.3, activa, `ultima_modificacion` 2026-10-05T20:30:32Z):

```
valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))
```

→ el **×factor_seguro en la rama con cuadro está presente** (`valor_seguro_base_items_uf * factor_seguro`).

Nota menor: `ultima_modificacion` de ambos records (20:30:31/32Z) es ~1 min posterior a la corrida (20:29Z); no es ambigüedad real porque el `formula_expresion_snapshot` de las filas TX_Calculos de la corrida ya contiene el texto nuevo (ver §3) — la corrida evaluó las expresiones corregidas.

## 2. Estado del caso

- `TX_Solicitudes.recE1LwwH2xbcCHti` → `estado = "calculada"`, `ultima_modificacion` 2026-10-05T20:29:18Z.
- `at03_dag_completo` más reciente: `recCtTbUIQOs2TaMC` · timestamp **2026-10-05T20:29:17.869Z** (posterior al fix; existe una corrida anterior `reccwc6fY0YonvWOW` de 18:06Z, pre-fix).
- `formulas_total = 17`, `formulas_escritas = 17`, `formulas_errores = 0` → **17 filas, cero aborts**.
- TX_Calculos filtrado por `solicitud_codigo='VP-2026-0075'` devuelve exactamente **17 filas**, todas con `calculado_en` 2026-10-05T20:29:13–18Z y `version_motor = AT03_v11.2.0_v32b1` (no quedan filas de la corrida vieja).

## 3. Origen de reposición y seguro

**Reposición → FÓRMULA, sin override.**
- Evento 20:29Z: `overrides_aplicados.valor_reposicion_override = 0` (en la corrida pre-fix de 18:06Z era 1024 — el override compensatorio se retiró).
- TX_Solicitudes ya no tiene `valor_reposicion_override` poblado.
- Fila `recUz2ywnudKbetts` (valor_reposicion_uf = 1024): `inputs_json.override_valor_reposicion = 0`, snapshot = expresión nueva con el ×0,8 condicional, nota `eval_ok`.
- Aritmética: único ítem del cuadro (`recqd8VSrrm9ZaVfY`, tipo Edificación, sin ítem Terreno → `sup_terreno_items_m2=0`): a-nuevo = 40 m² × 32 UF/m² = 1280; **1280 × 0,8 + OCC 0 = 1024** = oráculo BG72 (CD37=1280, AN61=0, CC46=0).

**Seguro → OVERRIDE (`valor_seguro_override = 1024`).**
- Evento 20:29Z: `overrides_aplicados.valor_seguro_override = 1024`; TX_Solicitudes `valor_seguro_override = 1024`.
- Fila `recpb4rCU0gy36ZL2` (seguro_incendio_uf = 1024): la expresión nueva corta en `valor_seguro_override > 0`.
- `override_motivo` / `override_autor` en la solicitud: carril C3 de esta tanda; declara compensación del dato G-7 del maestro (ver §5).

**Todos los `*_override` no vacíos del estado final:**
| Override | Valor | Motivo |
|---|---|---|
| `valor_seguro_override` | 1024 | Compensa `factor_seguro=0.8` erróneo del maestro ALH (dato, no fórmula — §5) |
| `vida_util_override` | 40 | Siembra sandbox pre-existente (ya estaba en la corrida 18:06Z pre-fix); no afecta reposición/seguro ni ningún terminal con cuadro — los 6 terminales cuadran con él puesto |

Los otros 13 flags de override del evento están en 0.

## 4. Igualdad vs oráculo: **6/6 terminales**

| Terminal | Motor (TX_Calculos 20:29Z) | Oráculo (Portada) | ¿Cuadra? |
|---|---|---|---|
| Valor comercial UF | 1024 | AP69 = BI62−BI63 = 1024 | ✅ |
| Valor reposición UF | 1024 | BG72 = 1024 | ✅ |
| Seguro incendio UF | 1024 | BG73 = BO62 = 1024 | ✅ |
| Avalúo fiscal UF | 411.5815728319754 | BG74 = 411.5815728319754 | ✅ exacto |
| Valor remate UF | 665.6 | BG77 = 665.5999999999999 | ✅ (fp) |
| Valor liquidación UF | 844.8 | BG78 = 844.8 | ✅ |

Consistencia CLP: 1024 × UF 40213.45 = 41.178.572,8 = motor valor_comercial/reposicion/seguro CLP ✅ (AQ71 = 40213.45).

## 5. Clasificación del override de seguro restante

- **Maestro:** `M_Clientes.recU6gfHmmCWZN5Mm` (Austral Leasing Habitacional, AUS) → **`factor_seguro = 0.8`**.
- **Oráculo:** BG73 = BO62 = suma de BO51..; BO51 para este ítem evaluó `+BI51*1` (el cliente cae en la whitelist de la cadena de IFs por `ClienteN`; la rama por defecto sería `BI51*0.8`). Factor efectivo del oráculo = **1,0** → BO62 = 1024.
- **Aritmética de la fórmula nueva:**
  - con factor del maestro (0,8): `valor_seguro_base_items_uf (1024) × 0.8 = 819,2` ≠ 1024 → NO cuadraría.
  - con factor 1,0: `1024 × 1.0 = 1024` = oráculo → **la fórmula nueva es correcta; el dato del maestro es el que está mal**.
- **Clasificación: compensación de DATO erróneo del maestro** (G-7, `factor_seguro` de ALH debería ser 1,0 para este formato/whitelist), **no gap de fórmula**. El `override_motivo` del record lo declara explícitamente y la aritmética lo confirma. Condición de retiro: sanear `factor_seguro` en M_Clientes y quitar el override.

## 6. Sorpresas / observaciones

1. `ultima_modificacion` de los 2 records de C_Formulas (20:30:31/32Z) es posterior al timestamp de la corrida (20:29:17Z). No invalida nada — los snapshots de TX_Calculos prueban que la corrida evaluó las expresiones nuevas — pero conviene saber que ese campo no sirve solo para fechar el fix (los links TX_Calculos↔C_Formulas también lo bumpean).
2. Entre corridas hubo un "swap" de overrides limpio: pre-fix `valor_reposicion_override=1024` + seguro 0; post-fix reposición 0 + `valor_seguro_override=1024`. Exactamente lo esperado por el relato de la tanda.
3. `vida_util_override=40` persiste de la siembra sandbox (lookup trae 55); inocuo para los terminales de este caso (todo el DAG terminal pasa por el cuadro), pero es un override vivo que un saneo futuro podría revisar.
4. El `factor_seguro=0.8` del maestro también convive con `factor_garantia=0.8`; el oráculo usa 0,8 como factor de garantía (BI51 → uf_m2_aplicado 25,6 = 32×0,8) y 1,0 como factor de seguro — la confusión de ambos factores en el maestro es plausible causa raíz del G-7.
