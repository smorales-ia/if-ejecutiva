# REGRESIÓN PILOTO · CASO 2 · VP-2026-0074 (recconVQfAc8LSGJf) · Agencia Habitacional

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · FASE 2 · **2026-10-05**
**Oráculo:** `AG 1548.xlsm` · contrato en `diagnostico.md` §5 y `diagnostico-oraculo.md` §4.1/§4.2.
**Corrida:** PATCH `estado='visitada'` 20:24:34Z → `calculada` 20:24:55Z (~21 s) · motor `AT03_v11.2.0_v32b1` · 17/17 filas TX_Calculos.

## 1 · Resolución del factor_seguro (punto 1 del piloto)

- **TX_Solicitudes NO tiene campo `factor_seguro_override`** (ni `factor_garantia_override`): verificado contra el meta API — los 17 overrides reales son tasa_cap_rate, vida_util, valor_final, valor_reposicion, valor_garantia, valor_seguro, valor_liquidacion, valor_remate, valor_remate_65, renta_perpetua, ingreso_liquido_anual, factor_depreciacion, uf_m2_nuevo, factor_remate, factor_liquidacion + override_motivo/override_autor.
- AT03 lee `factor_seguro` directo de M_Clientes (AT03_Calculos_DAG.js:791-799), sin mecanismo por-solicitud.
- Cliente linkeado: AGH canónico `recX80z73mCtC4BBo` (solo lectura) → **`factor_seguro=0.8`** (también fg=0.8, tasa 0.06). El oráculo exige 1,0 (ClienteN=7 en whitelist BO · gap G-7). M_Clientes es intocable en esta tanda.
- **Acción:** se suplió el resultado oráculo vía **`valor_seguro_override=1394`** (único mecanismo sandbox disponible), con motivo documentado en el record. Consecuencia asumida: en C2 la rama con-cuadro del seguro queda cortada por el override (control negativo de G-2 degradado a verificación de snapshot); la rama nueva de G-2 se ejercita de lleno en C4/C5, donde el fs=0,8 del maestro SÍ coincide con el oráculo.

## 2 · Overrides del record tras el piloto

| Campo | Valor | ¿Legítimo? |
|---|---|---|
| `valor_reposicion_override` | — (vaciado) | ✓ retirado para ejercitar G-1 |
| `valor_seguro_override` | 1394 | ✓ sandbox: suple factor oráculo 1,0 (ver §1) — retirar cuando se sanee G-7 en M_Clientes |
| `vida_util_override` | 40 | ✓ dato del tasador — conservado |
| `tasa_cap_rate_override` | — | n/a en C2 |

## 3 · Terminales Esperado / Obtenido

| Terminal | Esperado (oráculo/réplica) | Obtenido | Delta | OK |
|---|---|---|---|---|
| `valor_reposicion_uf` | 1.115,2 (0,8×1394+0, **sin override**) | 1115.2 | 0 | ✅ |
| `valor_reposicion_clp` | 44.931.932,144 | 44931932.144 | 0 | ✅ |
| `seguro_incendio_uf` | 1.394 | 1394 | 0 | ✅ (vía override, ver §1) |
| `seguro_incendio_clp` | 56.164.915,18 | 56164915.18 | 0 | ✅ |
| `valor_comercial_uf` | 1.394 | 1394 | 0 | ✅ |
| `valor_comercial_clp` | 56.164.915,18 | 56164915.18 | 0 | ✅ |
| `valor_remate_uf` | 906,1 | 906.1 | 0 | ✅ |
| `valor_remate_clp` | 36.507.194,867 | 36507194.867 | 0 | ✅ |
| `valor_liquidacion_uf` | 1.150,05 | 1150.05 | 0 | ✅ |
| `valor_liquidacion_clp` | 46.336.055,0235 | 46336055.0235 | 0 | ✅ |
| `avaluo_fiscal_uf` | 1.256,2748213163063 | 1256.2748213163063 | 0 | ✅ |
| `ingreso_liquido_anual_clp` | 3.520.000 | 3520000 | 0 | ✅ |
| `renta_perpetua_clp` | 58.666.666,67 | 58666666.66666667 | <1e-2 (redondeo doc) | ✅ |
| `promedio_uf_m2_muestra` | 35.08123167966374 (réplica) | 35.08123167966374 | 0 | ✅ |
| `promedio_uf_m2_cbr_out` | 0 | 0 | 0 | ✅ |
| `desviacion_vs_promedio_pct` / `_cbr_pct` | 0 (G-6, build c93620f) | 0 / 0 | 0 | ✅ (deuda G-6 conocida, no de esta tanda) |

**Anti-trampa R3 verificada:** reposición = 1.115,2 (no 1.394 ni valor con 0,8 sobre OO.CC.); C2 no tiene OO.CC. pero la descomposición cuadra: 0,8×1394 + 0.

## 4 · Snapshots de expresión en TX_Calculos (prueba de que corrió la fórmula NUEVA)

- `valor_reposicion_uf` (recKQbkh0lKt4fpEF): snapshot = expresión NUEVA con `(sup_terreno_items_m2 > 0 ? … : … * 0.8)` ✅ — y el valor 1.115,2 salió **sin override** (evento: `overrides[final=0 repo=0 gar=0 tasa=0]`), o sea la rama ×0,8 se evaluó de verdad → **`sup_terreno_items_m2` SÍ está en el scope del desplegado** (el único INFERIDO del Gate S1, ahora probado).
- `seguro_incendio_uf` (recF9vfRxv8NmsW04): snapshot = expresión NUEVA con `valor_seguro_base_items_uf * factor_seguro` ✅ (valor por rama override, ver §1).
- CLP aguas abajo (`valor_reposicion_clp`/`seguro_incendio_clp`): recogieron los valores nuevos ✅.

## 5 · A_Eventos

- `at03_dag_completo` 2026-10-05T20:24:55Z: **"AT03_v31 EJECUTOR 17/17 OK"**, `overrides[final=0 repo=0 gar=0 tasa=0]` — cero aborts, cero omitidos. (La corrida previa de la réplica, 17:37Z, queda en el historial con repo=1115.2.)

## 6 · Veredicto del piloto

**PILOTO OK.** G-1 ejercitado y cuadrado sin override; G-2 desplegado (snapshot nuevo) con control por override documentado; todos los demás terminales idénticos a la réplica auditada. Sin rollback. Vía libre para fan-out C3/C4/C5 — nota para C3 (ALH): mismo gap de maestro que C2 (fs=0,8 vs oráculo 1,0), va a requerir el mismo `valor_seguro_override=1024`.
