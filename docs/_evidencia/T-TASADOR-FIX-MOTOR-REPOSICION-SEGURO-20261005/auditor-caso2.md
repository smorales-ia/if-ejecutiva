# Auditoría ciega · Caso 2 · VP-2026-0074 (AGH-1548) — T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

**Auditor:** agente ciego (sin lectura de diagnósticos ni entregables de ejecutores).
**Fuentes:** Airtable REST (solo GET) · oráculo `docs/_referencias/5tasaciones/AG 1548.xlsm` (openpyxl, data_only True/False).
**Fecha de auditoría:** 2026-10-05.

## 1. Fórmulas vigentes en C_Formulas (`tblNFa454fBbqRB3t`)

**F_ValorReposicionUF** (`reckDXGPbkDVjzPjY`, v3.3, ultima_modificacion 2026-10-05T20:30:31Z):

```
valor_reposicion_override > 0 ? valor_reposicion_override :
  ((hay_cuadro > 0
      ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8)
      : sup_construccion_m2 * uf_m2_nuevo_lookup)
   + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

→ **SÍ aplica el ×0,8 condicional** sobre edificación a-nuevo cuando no hay terreno en el cuadro (`sup_terreno_items_m2 > 0 ? ... : ... * 0.8`). Equivale a `Portada!BG72 = IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)` del formato.

**F_SeguroIncendioUF** (`recZTfJX0MJ0r1tHP`, v3.3, ultima_modificacion 2026-10-05T20:30:32Z):

```
valor_seguro_override > 0 ? valor_seguro_override :
  (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))
```

→ **SÍ multiplica por `factor_seguro`** en la rama con cuadro.

Los `formula_expresion_snapshot` de TX_Calculos de la corrida auditada son **idénticos carácter a carácter** a las expresiones vigentes (verificado por comparación programática: 297/297 y 152/152 chars). La `ultima_modificacion` de los records C_Formulas (20:30Z) es posterior a la corrida (20:24Z) pero sin cambio de expresión — sin impacto.

## 2. Estado del caso

| Chequeo | Resultado |
|---|---|
| `estado` en TX_Solicitudes | `calculada` ✅ |
| Evento `at03_dag_completo` más reciente | `recnkiTICmzL1A5PQ` · timestamp **2026-10-05T20:24:54.946Z** (hoy, ~20:2xZ, posterior al fix) ✅ |
| Evento anterior (pre-fix, referencia) | `recqqQZR8U6mImYLQ` · 17:37:01Z · tenía `valor_reposicion_override=1115.2` |
| Filas TX_Calculos (`solicitud_codigo=VP-2026-0074`) | **17** ✅ (calculado_en 20:24:5xZ, versión motor `AT03_v11.2.0_v32b1`) |
| Aborts/errores | `formulas_escritas=17, formulas_errores=0`, notas `eval_ok` ✅ |

## 3. Origen de reposición y seguro

**Reposición (`valor_reposicion_uf = 1115.2`): salió de la FÓRMULA.**
- Evento 20:24Z: `overrides_aplicados.valor_reposicion_override = 0` (retirado).
- `inputs_json` del cálculo: `override_valor_reposicion = 0`.
- Snapshot = expresión nueva con el ×0,8 condicional.
- Cuadro del caso: 1 ítem Edificación (`recWNTaCy6jn9i6DL`: 41 m² × 34 UF/m² = 1394 UF), sin ítems Terreno → rama `×0.8`: 1394 × 0.8 + 0 (OCC) = **1115.2** = oráculo BG72.

**Seguro (`seguro_incendio_uf = 1394`): salió de OVERRIDE** (`valor_seguro_override = 1394` en TX_Solicitudes y en `overrides_aplicados` del evento).

**Todos los `*_override` no vacíos del record `recconVQfAc8LSGJf`:**

| Override | Valor | Motivo (campo `override_motivo` + evento) |
|---|---|---|
| `valor_seguro_override` | 1394 | Suple el `factor_seguro=1.0` del oráculo AGH (ClienteN=7 whitelist BO): M_Clientes canónico tiene fs=0.8 (gap G-7, intocable en esta tanda) y TX_Solicitudes no tiene campo `factor_seguro_override` |
| `vida_util_override` | 40 | Dato legítimo del tasador (lookup genérico = 70); se conserva |

Todos los demás overrides del evento = 0 (final, reposición, garantía, tasa, remate, liquidación, renta, depreciación, uf_m2, factores).

## 4. Igualdad vs oráculo (AG 1548.xlsm · Portada) — lado a lado

| # | Terminal | Motor (TX_Calculos) | Oráculo (celda) | ¿Cuadra? |
|---|---|---|---|---|
| 1 | Tasación UF (`valor_comercial_uf`) | 1394 | BO62 = 1394 | ✅ |
| 2 | Tasación $ (`valor_comercial_clp`) | 56.164.915,18 | AY69 = 56164915.18 | ✅ |
| 3 | Reposición UF (`valor_reposicion_uf`) | 1115.2 | BG72 = 1115.2 | ✅ |
| 4 | Reposición $ (`valor_reposicion_clp`) | 44.931.932,144 | 1115.2 × 40290.47 | ✅ |
| 5 | Seguro UF (`seguro_incendio_uf`) | 1394 | BG73 = 1394 (`=BO62`) | ✅ |
| 6 | Seguro $ (`seguro_incendio_clp`) | 56.164.915,18 | 1394 × 40290.47 | ✅ |
| 7 | Remate UF (`valor_remate_uf`) | 906.1 | BG77 = 906.0999999999999 | ✅ |
| 8 | Remate $ (`valor_remate_clp`) | 36.507.194,867 | 906.1 × 40290.47 | ✅ |
| 9 | Liquidación UF (`valor_liquidacion_uf`) | 1150.05 | BG78 = 1150.05 | ✅ |
| 10 | Liquidación $ (`valor_liquidacion_clp`) | 46.336.055,0235 | 1150.05 × 40290.47 | ✅ |
| 11 | Avalúo fiscal UF (`avaluo_fiscal_uf`) | 1256.2748213163063 | BG74 = 1256.2748213163063 | ✅ |
| 12 | Ingreso líquido anual $ | 3.520.000 | BJ43 = 3520000 | ✅ |
| 13 | Renta perpetua $ | 58.666.666,6667 | BJ44 = 58666666.66666667 | ✅ |
| 14 | UF del día | 40290.47 (implícita: 56.164.915,18 / 1394) | AQ71 = 40290.47 | ✅ |
| 15 | Superficies | construcción 41 m² · terreno 0 | AN51/AM30 = 41 · AN61 = 0 | ✅ |

**N/M = 15/15.** (Nota: el caso no tiene garantía como terminal del motor — el evento no lista F de garantía y `valor_garantia_override=0; en el oráculo BO63 "bienes no garantía"=0.)

## 5. Clasificación del override restante (`valor_seguro_override = 1394`)

- `M_Clientes` del cliente linkeado (`recX80z73mCtC4BBo`, Agencia Habitacional / AGH): **`factor_seguro = 0.8`**.
- Base de seguro del cuadro: `valor_seguro_item_uf = 1394` (ítem único del cuadro).
- Fórmula nueva con el factor del **maestro** (0.8): 1394 × 0.8 = **1115.2** ≠ 1394 → no cuadraría.
- Fórmula nueva con el factor del **oráculo** (1.0, cliente AGH en whitelist del formato, BG73 `=BO62` sin descuento): 1394 × 1.0 = **1394** = oráculo exacto.

**Clasificación: override por DATO erróneo del maestro (gap G-7 en `M_Clientes.factor_seguro`), NO por fórmula.** La fórmula corregida produciría el valor del oráculo si el maestro tuviera fs=1.0 para AGH. El override no encubre un gap de fórmula.

## 6. VEREDICTO: **OK**

Los 15 terminales comparables cuadran el oráculo; la reposición salió de la fórmula nueva sin override (el ×0,8 condicional reproduce BG72); el único override de valoración restante (`valor_seguro_override=1394`) se explica íntegramente por el dato de maestro `factor_seguro=0.8` vs 1.0 del oráculo (whitelist AGH), no por la fórmula.
