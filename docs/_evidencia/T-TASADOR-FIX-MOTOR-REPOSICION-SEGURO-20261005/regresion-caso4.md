# REGRESIÓN FAN-OUT · CASO 4 · VP-2026-0076 (rectnGOaHvEioXZw3) · Hipotecaria Security

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · FASE 2 (carril C4) · **2026-10-05**
**Oráculo:** `Formato Value Property Octubre2025 - Las Rejas Norte 65 dp 211 P.xlsm` · contrato en `diagnostico.md` §5 (repo **902,88** · seguro **857,736**, ambos SIN override).
**Corrida:** PATCH `estado='visitada'` 20:30:21Z → `calculada` en el primer poll (20:30:33Z, ~10 s) · motor `AT03_v11.2.0_v32b1` · **17/17 filas TX_Calculos, 0 errores**.

## 1 · Precondición crítica: factor_seguro del maestro (GET solo lectura)

- Cliente linkeado en la solicitud: **`recVTKsZLNSDNInky` · "Hipotecaria Security S.A."** → **`factor_seguro = 0.825`** (fg=0.8, tasa 0.045). Es la **errata RB-53** anticipada por `diagnostico.md` §2 (0,825 es el factor de liquidación AU78, no el de seguro).
- Duplicado en M_Clientes: `recXVtuMT2wjIVzz2` · "Hipotecaria Security" → fs=**0.8** (el valor correcto del oráculo, DB51=0.8). No se re-linkeó: M_Clientes intocable y el link es el validado por el auditor ciego de la réplica. (El "triple Security" del briefing resultó ser doble en el GET por nombre.)
- Consecuencia: la fórmula nueva G-2, sin override, daría 1.072,17 × 0,825 = **884,54 ✗** (≠ oráculo 857,736). Se activó la **rama B prescrita**: `valor_seguro_override = 857.736` se CONSERVA con motivo **sandbox-G-7: gap de DATO, no de fórmula** — retirar cuando se sanee M_Clientes con Héctor. Confirmación de runtime: `inputs_json` de la corrida trae `factor_seguro: 0.825` (el motor ve la errata).
- Nota al margen: 884,54 coincide numéricamente con `valor_liquidacion_uf` (82,5 % de 1.072,17) — ilustra el origen de la errata RB-53.

## 2 · Overrides del record tras la corrida

| Campo | Valor | ¿Legítimo? |
|---|---|---|
| `valor_reposicion_override` | — (**vaciado**) | ✓ retirado: G-1 se ejercita de lleno |
| `valor_seguro_override` | 857.736 | ✓ sandbox-G-7: suple el fs=0,8 del oráculo ante la errata 0,825 del maestro linkeado (gap de DATO) |
| `tasa_cap_rate_override` | 0.055 | ✓ legítimo NRB-01 (Portada BJ41) — conservado |
| `vida_util_override` | 65 | ✓ dato del tasador (= lookup) — conservado |
| `override_motivo` / `override_autor` | actualizados (citan RB-53, ambos records Security y la condición de retiro) | ✓ |

## 3 · Terminales Esperado / Obtenido

| Terminal | Esperado (contrato/réplica) | Obtenido | Delta | OK |
|---|---|---|---|---|
| `valor_reposicion_uf` | **902,88 SIN override** (contrato §5) | 902.88 · evento `repo=0` | 0 | ✅ ★ fórmula nueva |
| `valor_reposicion_clp` | 35.972.292,1536 | 35972292.1536 | 0 | ✅ |
| `seguro_incendio_uf` | 857,736 | 857.736 | 0 | ✅ (vía override G-7, ver §1) |
| `seguro_incendio_clp` | 34.173.677,54592 | 34173677.54592 | 0 | ✅ |
| `valor_comercial_uf` | 1.072,17 (cuadro 974,70+97,47) | 1072.1699999999998 | <1e-12 | ✅ |
| `valor_comercial_clp` | 42.717.096,9324 ($42.717.097) | 42717096.932399996 | <1e-7 | ✅ |
| `avaluo_fiscal_uf` | 678,4269102839937 | 678.4269102839937 | 0 | ✅ |
| `valor_remate_uf` | 696,9105 | 696.9105 | 0 | ✅ |
| `valor_remate_clp` | 27.766.113,00606 | 27766113.00606 | 0 | ✅ |
| `valor_liquidacion_uf` | 884,54025 | 884.5402499999998 | <1e-13 | ✅ |
| `valor_liquidacion_clp` | 35.241.604,96923 | 35241604.969229996 | <1e-8 | ✅ |
| `ingreso_liquido_anual_clp` | 2.750.000 | 2750000 | 0 | ✅ |
| `renta_perpetua_clp` | 50.000.000 | 50000000 | 0 | ✅ |
| `tasa_cap_rate_efectivo` | 0,055 (BJ41) | 0.055 (inputs_json + evento) | 0 | ✅ |
| `promedio_uf_m2_muestra` | 37,32915538012057 (réplica) | 37.32915538012057 | 0 | ✅ (quirk conocido: mezcla ofertas+CBR) |
| `promedio_uf_m2_cbr_out` | 0 | 0 | 0 | ✅ |
| `desviacion_vs_promedio_pct` / `_cbr_pct` | 0 / 0 (deuda G-6, build c93620f) | 0 / 0 | 0 | ✅ (deuda conocida, no de esta tanda) |

UF día (TX_DatosTasacion) 39.841,72 consistente: 902,88 × 39.841,72 = 35.972.292,1536 exacto. El cuadro (974,70 + 97,47) no se tocó (TX_ItemsCuadroValoracion intacta).

**Anti-trampa R3 (descomposición, no solo total):** 902,88 = 1.128,6 (a-nuevo CD37) × 0,8 + 0 OO.CC. — exacto (902,88 / 0,8 = 1.128,6). El ×0,8 cayó solo sobre la edificación a-nuevo con `sup_terreno_items_m2 = 0` (depto), como `Portada!BG72`.

## 4 · Snapshots de expresión en TX_Calculos (corrida 20:30:30Z)

- `valor_reposicion_uf` (recsrc8xNq3wzYima, F_ValorReposicionUF v3.3): snapshot = **expresión NUEVA** con `(sup_terreno_items_m2 > 0 ? … : … * 0.8)` ✅ · `nota=eval_ok` · `override_valor_reposicion=0` en inputs → el 902,88 salió **de la fórmula, sin override**.
- `seguro_incendio_uf` (rec6WL1LxyDSogMC6, F_SeguroIncendioUF v3.3): snapshot = **expresión NUEVA** con `valor_seguro_base_items_uf * factor_seguro` ✅ · valor por la rama override (857,736), cortocircuito documentado en §1.
- CLP aguas abajo (`valor_reposicion_clp` / `seguro_incendio_clp`): recogieron los valores ✅. Las 17 filas con `nota=eval_ok`.

## 5 · A_Eventos

- `at03_dag_completo` **recRh38P3KaVCsDGQ** · 2026-10-05T20:30:35Z: **"AT03_v31 EJECUTOR 17/17 OK"**, `overrides[final=0 repo=0 gar=0 tasa=0.055]` — el marcador homólogo del piloto para reposición (`repo=0`). `detalle_json`: `formulas_total:17, formulas_escritas:17, formulas_errores:0`, `valor_seguro_override:857.736` aplicado, 8.063 ms. Cero aborts H3/H5/H6/H7; único evento nuevo de la solicitud (el previo, recFHH2Ja3Md80ztx 18:06Z de la réplica, queda en el historial con `repo=902.88`).

## 6 · Veredicto

**CASO 4 OK.** G-1 (prueba de fuego del ×0,8): la reposición 902,88 salió de la fórmula nueva **sin override** y con la descomposición correcta. G-2 desplegado (snapshot nuevo) pero **no ejercitable sin override en este caso**: el maestro linkeado trae la errata RB-53 (fs=0,825) y el resultado-estrella (seguro por fórmula sola) queda condicionado al saneo de M_Clientes — con fs=0,8 la misma fórmula daría 857,736 exacto. Todos los demás terminales idénticos a la réplica auditada. Sin rollback.
