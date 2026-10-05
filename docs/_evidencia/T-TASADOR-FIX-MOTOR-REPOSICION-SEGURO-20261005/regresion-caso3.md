# REGRESIÓN FAN-OUT · CASO 3 · VP-2026-0075 (recE1LwwH2xbcCHti) · Austral Leasing Habitacional (ALH-335)

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · FASE 2 · carril C3 · **2026-10-05**
**Oráculo:** `caspana 310 dp 14, quilicura.xlsm` · contrato en `diagnostico.md` §5 · réplica auditada `../T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/auditor-caso3.md` (19/20 OK).
**Corrida:** PATCH `estado='visitada'` ~20:28:5xZ → `calculada` en el primer poll (evento 20:29:17.869Z, `tiempo_ms=7324`) · motor `AT03_v11.2.0_v32b1` · 17/17 filas TX_Calculos (`calculo_id` 1622–1638, reemplazan a las 1554–1570 de la réplica — cleanup OK, sin duplicados).

## 1 · Resolución del factor_seguro (G-7, mismo patrón del piloto C2)

- Cliente linkeado: ALH canónico `recU6gfHmmCWZN5Mm` (AUS · solo lectura) → **`factor_seguro=0.8`** (también `factor_garantia=0.8`, `tasa_cap_rate=0.045`), verificado por GET a M_Clientes. El oráculo exige fs efectivo **1,0** (whitelist BO · gap G-7). M_Clientes intocable en esta tanda y `factor_seguro_override` no existe en TX_Solicitudes.
- **Acción:** `valor_seguro_override=1024` con `override_motivo` "SANDBOX G-7 · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 (carril C3)…" y `override_autor` del carril. Sin el override, el motor habría dado 1024×0,8 = **819,2 ✗** (el `inputs_json` de la corrida confirma `factor_seguro=0.8` en el scope). Retirar cuando Héctor sanee G-7 en M_Clientes.
- Consecuencia asumida (igual que C2): la rama con-cuadro de G-2 queda cortada por el override en este caso; G-2 se ejercita de lleno en C4/C5 (fs=0,8 del maestro SÍ coincide con el oráculo allí).

## 2 · Overrides del record tras la corrida

| Campo | Antes (réplica) | Ahora | ¿Legítimo? |
|---|---|---|---|
| `valor_reposicion_override` | 1024 | **— (vaciado)** | ✓ retirado: la fórmula nueva G-1 lo reemplaza |
| `valor_seguro_override` | — | **1024** | ✓ sandbox G-7: suple fs oráculo 1,0 vs maestro 0,8 (§1) |
| `vida_util_override` | 40 | 40 | ✓ dato del tasador histórico (XLSM BB37/BJ37) — conservado |
| resto (15 overrides) | 0 | 0 | n/a — confirmado en `detalle_json.overrides_aplicados` del evento |

Quedan **solo** los dos permitidos por el contrato del carril.

## 3 · Terminales Esperado / Obtenido

| Terminal | Esperado (oráculo/réplica auditada) | Obtenido | Delta | OK |
|---|---|---|---|---|
| `valor_reposicion_uf` | **1.024 SIN override** (1280 a-nuevo × 0,8, sin terreno; OO.CC.=0) | 1024 | 0 | ✅ **vía fórmula nueva** |
| `valor_reposicion_clp` | 41.178.572,8 | 41178572.8 | 0 | ✅ |
| `seguro_incendio_uf` | 1.024 | 1024 | 0 | ✅ (vía override G-7, ver §1) |
| `seguro_incendio_clp` | 41.178.572,8 | 41178572.8 | 0 | ✅ |
| `valor_comercial_uf` | 1.024 | 1024 | 0 | ✅ |
| `valor_comercial_clp` | 41.178.572,8 ($41.178.573 doc) | 41178572.8 | 0 | ✅ |
| `valor_remate_uf` | 665,6 | 665.6 | 0 | ✅ |
| `valor_remate_clp` | 26.766.072,32 | 26766072.32 | 0 | ✅ |
| `valor_liquidacion_uf` | 844,8 | 844.8 | 0 | ✅ |
| `valor_liquidacion_clp` | 33.972.322,56 | 33972322.559999995 | <1e-8 (float) | ✅ |
| `avaluo_fiscal_uf` | 411,5815728319754 (411,58 doc) | 411.5815728319754 | 0 | ✅ |
| `ingreso_liquido_anual_clp` | 2.200.000 | 2200000 | 0 | ✅ |
| `renta_perpetua_clp` | 48.888.888,89 | 48888888.88888889 | <1e-2 (redondeo doc) | ✅ |
| `promedio_uf_m2_muestra` | 27,543461538461543 | 27.543461538461543 | 0 | ✅ |
| `promedio_uf_m2_cbr_out` | 0 | 0 | 0 | ✅ |
| `desviacion_vs_promedio_pct` / `_cbr_pct` | 0 / 0 (deuda G-6/D2 conocida, idéntica a la réplica) | 0 / 0 | 0 | ✅ |

UF día visita 40.213,45 implícita y verificada: 1024 × 40.213,45 = 41.178.572,8 ✓.

**Anti-trampa R3:** reposición 1024 = 0,8 × 1280 + 0 (OO.CC.=0 en este caso); NO es coincidencia de override — el evento registra `overrides[final=0 repo=0 gar=0 tasa=0]` y el `inputs_json` de la fila trae `override_valor_reposicion=0` con `sup_terreno_m2=0` (rama ×0,8 evaluada de verdad).

## 4 · Snapshots de expresión en TX_Calculos (prueba de fórmula NUEVA)

- `valor_reposicion_uf` (calculo_id 1628, `formula_version=v3.3`): snapshot **textualmente idéntico** a la expresión nueva de `fix-aplicado.md` G-1, incluida la rama `(sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8)` ✅ — y el 1024 salió **sin override**.
- `seguro_incendio_uf` (calculo_id 1629, `formula_version=v3.3`): snapshot **textualmente idéntico** a la expresión nueva de G-2 (`valor_seguro_base_items_uf * factor_seguro` en la rama con cuadro) ✅ — valor por rama override (G-7, documentado en §1).
- CLP aguas abajo (1633/1634) recogieron los valores ✅.

## 5 · A_Eventos

- Un único evento de la corrida (≥20:28Z): `at03_dag_completo` 2026-10-05T20:29:17.869Z, severidad `info`, **"AT03_v31 EJECUTOR 17/17 OK"**, `formulas_total=17, formulas_escritas=17, formulas_errores=0`. **Cero aborts** (sin H3/H5/H6/H7, sin warnings).
- `overrides_aplicados`: `valor_reposicion_override=0`, `valor_seguro_override=1024`, `vida_util_override=40`, resto en 0 — con el motivo G-7 completo.

## 6 · Veredicto

**CASO 3 OK.** G-1 ejercitado y cuadrado sin override (1.024 desde la rama nueva ×0,8 sin terreno); G-2 desplegado (snapshot nuevo) con el control por override G-7 documentado; los 17 terminales idénticos a la réplica auditada por el auditor ciego. Overrides restantes: solo `valor_seguro_override=1024` (G-7, temporal) y `vida_util_override=40` (legítimo). Sin rollback.
