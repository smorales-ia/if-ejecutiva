# Auditoría ciega · Caso 4 · VP-2026-0076 (Hipotecaria Security SECURITY-6073)

Tanda: T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · Auditor ciego (carril C4)
Fecha de auditoría: 2026-10-05 · Solicitud `rectnGOaHvEioXZw3` · Base `app9G7lLkIV3CpeLa`
Método: Airtable REST **solo GET** + oráculo `docs/_referencias/5tasaciones/Formato Value Property Octubre2025 - Las Rejas Norte 65 dp 211 P.xlsm` (openpyxl `data_only=True/False`). No se leyó ningún archivo de evidencia de ejecutores.

## VEREDICTO: **OK** — 13/13 terminales cuadran con el oráculo

---

## 1. Fórmulas vigentes en C_Formulas (`tblNFa454fBbqRB3t`)

**`reckDXGPbkDVjzPjY` · F_ValorReposicionUF v3.3** (expresión vigente, citada):

```
valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

→ Incluye el **×0,8 sobre edificación a-nuevo cuando no hay terreno** (fix G-1). Espeja `Portada!BG72 = IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)` del oráculo.

**`recZTfJX0MJ0r1tHP` · F_SeguroIncendioUF v3.3** (expresión vigente, citada):

```
valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))
```

→ Incluye el **× factor_seguro en la rama con cuadro** (fix G-2).

El `formula_expresion_snapshot` de los TX_Calculos de la corrida final coincide carácter a carácter con ambas expresiones vigentes: la corrida usó las fórmulas nuevas (evidencia dura, independiente de timestamps).

## 2. Estado del caso

- `estado = calculada` ✓
- Corridas `at03_dag_completo` en A_Eventos: 2026-10-05T18:06:08Z (pre-fix, con `valor_reposicion_override=902.88`) y **2026-10-05T20:30:34.456Z (la más reciente, posterior al fix)** ✓
- Corrida final: **17/17 fórmulas escritas, 0 errores** (`formulas_total:17, formulas_escritas:17, formulas_errores:0`), 17 filas en TX_Calculos con `fecha_calculo` 20:30:30–34Z ✓

## 3. Origen de reposición y seguro

**Reposición: FÓRMULA, sin override.** Triple evidencia:
- Evento final: `overrides[... repo=0 ...]`, `valor_reposicion_override: 0` en `detalle_json` (en la corrida de las 18:06 valía 902,88 — fue **vaciado** antes de la corrida final).
- `inputs_json` de `recsrc8xNq3wzYima`: `override_valor_reposicion: 0` → ganó la rama de fórmula.
- Aritmética: `hay_cuadro>0`, sin ítems Terreno (los 2 ítems del cuadro son Edificación), a-nuevo 1.128,6 × 0,8 + OCC 0 = **902,88** = `Portada!BG72` (AN61=0, CD37=1.128,6, CC46=0).

**Seguro: OVERRIDE** (`valor_seguro_override = 857.736` en TX_Solicitudes; rama override de la fórmula). Clasificación en §5.

**Inventario completo de `*_override` no vacíos en la solicitud:**

| Override | Valor | Clasificación |
|---|---|---|
| `tasa_cap_rate_override` | 0.055 | **Legítimo** — NRB-01, tasa exigida Las Rejas 5,5% (oráculo `Portada!BJ41=0.055` literal). Debe quedarse. |
| `vida_util_override` | 65 | **Legítimo** — override del tasador. Coincide además con `lookup_vida_util=65`. Debe quedarse. |
| `valor_seguro_override` | 857.736 | **Compensación de DATO de maestro** (ver §5). No encubre gap de fórmula. |

Todos los demás (`valor_final`, `valor_garantia`, `valor_reposicion`, `valor_liquidacion`, `valor_remate`, `renta_perpetua`, etc.) = 0 en el `detalle_json` de la corrida final.

## 4. Igualdad vs oráculo: **13/13**

| # | variable_output (motor) | Motor | Oráculo (celda) | ¿Cuadra? |
|---|---|---|---|---|
| 1 | valor_comercial_uf | 1.072,17 | 1.072,17 (`Portada!BI62`/`DB67`) | ✓ |
| 2 | valor_comercial_clp | 42.717.096,9324 | 42.717.096,9324 (`Portada!AY69`) | ✓ |
| 3 | valor_reposicion_uf | 902,88 | 902,88 (`Portada!BG72`) | ✓ |
| 4 | valor_reposicion_clp | 35.972.292,1536 | 35.972.292,1536 (`Portada!BL72`) | ✓ |
| 5 | seguro_incendio_uf | 857,736 | 857,736… (`Portada!BG73`) | ✓ |
| 6 | seguro_incendio_clp | 34.173.677,54592 | 34.173.677,54592 (`Portada!BL73`) | ✓ |
| 7 | valor_remate_uf | 696,9105 | 696,9105 (`Portada!BG77`) | ✓ |
| 8 | valor_remate_clp | 27.766.113,00606 | 27.766.113,00606 (`Portada!BL77`) | ✓ |
| 9 | valor_liquidacion_uf | 884,54025 | 884,54025 (`Portada!BG78`) | ✓ |
| 10 | valor_liquidacion_clp | 35.241.604,96923 | 35.241.604,96923 (`Portada!BL78`) | ✓ |
| 11 | avaluo_fiscal_uf | 678,4269102839937 | 678,4269102839937 (`Portada!BG74`) | ✓ |
| 12 | ingreso_liquido_anual_clp | 2.750.000 | 2.750.000 (`Portada!BJ43`) | ✓ |
| 13 | renta_perpetua_clp | 50.000.000 | 50.000.000 (`Portada!BJ44`) | ✓ |

Los 4 outputs restantes del motor (promedio_uf_m2_muestra=37,329…, promedio_uf_m2_cbr_out=0, desviacion_vs_promedio_pct=0, desviacion_vs_promedio_cbr_pct=0) son métricas internas de la muestra sin celda oráculo identificable en el libro (se barrió el workbook completo buscando 37,30–37,36: cero hits) — se excluyen del denominador, no contradicen nada.

## 5. Clasificación del override de seguro restante: **compensación de DATO de maestro, no de fórmula**

- Cliente **linkeado** en la solicitud: `recVTKsZLNSDNInky` "Hipotecaria Security S.A." con **`factor_seguro = 0.825`** (GET M_Clientes). El payload de la corrida final confirma que el motor recibió `factor_seguro: 0.825`.
- Duplicados en M_Clientes (verificado por GET): `recXVtuMT2wjIVzz2` "Hipotecaria Security" trae **0.8**; `recSi2XsxHtByImuI` "SECURITY PRINCIPAL" trae 0.825.
- Factor efectivo del **oráculo**: `Portada!DB51 = BO51/BI51 = 779,76/974,7 = 0,8` exacto. Base del seguro por ítems = 974,7 + 97,47 = **1.072,17 UF** (coincide con los 2 ítems del cuadro en TX_ItemsCuadroValoracion: `valor_seguro_item_uf` 974,7 y 97,47).
- Aritmética decisoria:
  - Fórmula nueva con factor del maestro linkeado: 1.072,17 × **0,825** = **884,54025** ≠ oráculo.
  - Fórmula nueva con factor correcto: 1.072,17 × **0,8** = **857,736** = oráculo exacto.

Conclusión: la fórmula G-2 es correcta; el que está mal es el **dato** `factor_seguro=0.825` del maestro linkeado. El override 857,736 compensa ese dato y debe retirarse recién cuando se sanee M_Clientes (el 0,8 ya existe en el duplicado `recXVtuMT2wjIVzz2`).

## 6. Sorpresas / notas

1. **Coincidencia numérica engañosa**: 1.072,17 × 0,825 = 884,54025 es exactamente el `valor_liquidacion_uf` del caso — si alguien ve 884,54 como seguro tras retirar el override sin corregir el maestro, no es que "copió liquidación": es el factor 0,825 erróneo.
2. La `ultima_modificacion` de los records de C_Formulas (20:30:31/32Z) no sirve sola para fechar el fix (se bumpea por el link a TX_Calculos); la prueba de que la corrida usó las fórmulas nuevas es el `formula_expresion_snapshot` idéntico a la expresión vigente.
3. La corrida pre-fix (18:06Z) ya daba los mismos 17 números pero con reposición por override (repo=902.88) — el fix convirtió ese número de "parche" a "derivado", que es exactamente lo que había que demostrar.
4. `tasa_cap_rate_override=0.055` está literal en el oráculo (`Portada!BJ41` es la constante 0.055, no fórmula): override legítimo del tasador, bien conservado.
