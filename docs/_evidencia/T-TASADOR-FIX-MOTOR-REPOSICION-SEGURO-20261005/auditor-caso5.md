# Auditoría ciega · Caso 5 · VP-2026-0077 (HEV-3183)

**Tanda:** T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · **Rol:** auditor ciego (solo GET Airtable + oráculo `docs/_referencias/5tasaciones/HEV3183.xlsm`; sin leer evidencia de ejecutores).
**Fecha de auditoría:** 2026-10-05 · **Solicitud:** `recoZcwmgCBVKQMxF` (TX_Solicitudes `tblaHTyMHYfmy7Fg6`) · Cliente Hipotecaria Evoluciona · Depto Exequiel Fernández 6150, La Florida.

## VEREDICTO: **OK** — 6/6 terminales. Reposición Y seguro salieron de las fórmulas nuevas, sin override, con la descomposición correcta.

---

## 1 · Fórmulas vigentes en C_Formulas (`tblNFa454fBbqRB3t`, GET directo)

**`reckDXGPbkDVjzPjY` · F_ValorReposicionUF · v3.3** (ultima_modificacion 2026-10-05T20:30:31Z):

```
valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
```

→ Contiene el `× 0.8` sobre edificación a-nuevo cuando no hay terreno (`sup_terreno_items_m2 > 0 ? … : … * 0.8`), espejo exacto del oráculo `Portada!BG72 = IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)` (fórmula leída verbatim del XLSM con openpyxl `data_only=False`).

**`recZTfJX0MJ0r1tHP` · F_SeguroIncendioUF · v3.3** (ultima_modificacion 2026-10-05T20:30:32Z):

```
valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))
```

→ La rama con cuadro multiplica por `factor_seguro` (el gap corregido).

## 2 · Estado del caso

- `estado = calculada`. `ultima_modificacion` de la solicitud: 2026-10-05T20:30:29Z.
- Evento `at03_dag_completo` MÁS RECIENTE: `rec6vTwjgxtb7RhJp`, timestamp **2026-10-05T20:30:28.861Z** (posterior al fix), `AT03_v31 EJECUTOR 17/17 OK`, `formulas_total=17, formulas_escritas=17, formulas_errores=0` — cero aborts.
- TX_Calculos: **17 filas** con `calculado_en` entre 20:30:23.563Z y 20:30:28.399Z (todas de la corrida post-fix), todas `nota=eval_ok`, motor `AT03_v11.2.0_v32b1`.
- Evento anterior (`recJgCWBaV6hgnUmk`, 18:14:32Z) era la réplica CON overrides compensatorios (`repo=3167.128`, `seguro=3087.128`); quedó correctamente superado.

## 3 · Origen de reposición y seguro: FÓRMULA, sin override

- **Evento 20:30Z**: `overrides[final=0 repo=0 gar=0 tasa=0]`; en `detalle_json.overrides_aplicados` TODOS los overrides en 0 **excepto `vida_util_override: 70`** (legítimo, dato del tasador, XLSM `Portada!BJ37 = 70` verificado).
- **Record TX_Solicitudes**: sin `valor_reposicion_override` ni `valor_seguro_override` (campos ausentes = vacíos); `vida_util_override = 70` presente. `override_motivo` documenta el retiro (carril C5).
- **Snapshots en TX_Calculos**: `formula_expresion_snapshot` de `valor_reposicion_uf` y `seguro_incendio_uf` son **idénticos carácter a carácter** a las expresiones vigentes de C_Formulas citadas arriba (v3.3 en ambos). Los inputs_json registran `override_valor_reposicion: 0` y ningún override de seguro activo.
- Nota menor: `ultima_modificacion` de los records C_Formulas (20:30:31/32Z) es ligeramente posterior a la escritura de los cálculos (20:30:25Z) — es el bump por el link `TX_Calculos` que agrega la corrida; el snapshot verbatim demuestra que la expresión ejecutada es la vigente.

## 4 · Verificación anti-casualidad del seguro (descomposición)

Riesgo señalado: 3087.128 también sale de 0,8 × otras combinaciones. En particular, en este caso **`valor_comercial_uf` (3858.91) coincide numéricamente con la base del seguro** (propiedad nueva: `factor_aplicado = 1` en todos los ítems, sin depreciación, sin terreno y sin ítems excluidos), así que el total por sí solo no discrimina la rama. Se reconstruyó la base desde los ítems del cuadro (`TX_ItemsCuadroValoracion` `tblCxnMtOETK2ulD0`, GET directo):

| Ítem | tipo_item | valor_uf | valor_seguro_item_uf | Oráculo (BI → BO = ×0,8) |
|---|---|---:|---:|---|
| Depto Nº 411, Torre 3 (41.08 m² × 78) | Edificacion | 3204.24 | 3204.24 | 3204.24 → 2563.392 |
| Terraza (6.53 m² × 39) | Edificacion | 254.67 | 254.67 | 254.67 → 203.736 |
| Estacionamiento Nº 105 | **OO.CC.** | 400.00 | 400.00 | 400 (Estac. Cub) → 320 |
| **Base asegurable** | | | **3858.91** | **BO62 = 3087.128** |

- **Base correcta = 3204.24 + 254.67 + 400 = 3858.91**; seguro = 3858.91 × 0.8 = **3087.128** ✔ (resultado exacto de TX_Calculos).
- **Exclusiones correctas**: no existe ítem Terreno (`TOTAL TERRENO = 0` en XLSM fila 61, `sup_terreno_m2 = 0` en inputs) ni estacionamientos U/Goce/Desc. El estacionamiento de este caso está tipificado **OO.CC. asegurable DENTRO de la base** (`valor_seguro_item_uf = 400` poblado), igual que en el oráculo, donde `BO53` (Estac. Cub) NO cae en la exclusión `IF(OR(B53="Estac. U/Goce";"Estac. Desc";"Terreno")…)` y aporta 320 = 400×0.8.
- **Contraprueba**: si el motor hubiera excluido el estacionamiento de la base, el seguro habría sido 0.8 × 3458.91 = 2767.128 ≠ 3087.128. El valor observado prueba la inclusión correcta.
- **Factor efectivo 0,8 verificado en el libro**: `Portada!DB51 = 0.8` (= BO51/BI51) y cada fila BO del cuadro aplica `BI × 0.8` (rama else del árbol por ClienteN para Hipotecaria Evoluciona). Coincide con `factor_seguro: 0.8` del payload del motor.
- Reposición, misma disciplina: edificación a-nuevo = 3204.24 + 254.67 = **3458.91** (XLSM `CD37 = 3458.91`); sin terreno (`AN61 = 0`) → 3458.91 × 0.8 = 2767.128; + OO.CC. 400 (`CC46 = 400`) = **3167.128** ✔. Si la fórmula no hubiera aplicado el ×0.8 habría dado 3858.91 — el valor observado prueba que corrió la rama nueva.
- Limitación de observabilidad (no bloqueante): el `inputs_json` del motor es un snapshot genérico que no incluye los rollups `valor_seguro_base_items_uf` / `valor_edificacion_nuevo_items_uf`; la base se reconstruyó desde los ítems, como prevé el protocolo.

## 5 · Igualdad vs oráculo — 6/6

UF día visita: oráculo `AQ71 = 40290.47`; los CLP del motor cierran exactamente con ese valor.

| Terminal | Oráculo (XLSM, data_only=True) | Airtable (TX_Calculos, corrida 20:30Z) | ✓ |
|---|---:|---:|---|
| Tasación (valor comercial) | `AP69` = 3858.91 UF · `AY69` = 155,477,297.5877 CLP | 3858.91 · 155477297.5877 | ✔ |
| Valor de Reposición | `BG72` = 3167.128 · `BL72` = 127,605,075.67016 CLP | 3167.128 · 127605075.67016001 | ✔ |
| Seguro Incendio y otros | `BG73` = 3087.1279999999997 | 3087.128 · CLP 124381838.07016 (=3087.128×40290.47) | ✔ |
| Valor a Remate | `BG77` = 2508.2914999999994 | 2508.2915 · CLP 101060243.432005 | ✔ |
| Liquidación Normal | `BG78` = 3183.6007499999996 | 3183.6007499999996 · CLP 128268770.50985248 | ✔ |
| Avalúo fiscal | `BL74` = "NO REGISTRA" → `BG74` = 0 | `avaluo_fiscal_uf` = 0 | ✔ |

**N/M = 6/6.**

## 6 · Sorpresas / notas

1. **Ambigüedad de rama inherente al caso**: base del seguro = valor comercial (3858.91) por ser propiedad nueva sin terreno y sin exclusiones; la rama correcta quedó demostrada por descomposición, no por el total (§4).
2. El estacionamiento vive como `tipo_item = "OO.CC."` en Airtable vs `Estac. Cub` en el XLSM — semánticamente equivalente para ambas fórmulas (asegurable y dentro de OO.CC. de reposición: `CC46 = 400`).
3. `ultima_modificacion` de C_Formulas posterior en ~6 s a la corrida: artefacto del link TX_Calculos, no una edición post-corrida (snapshot verbatim lo descarta).
4. El evento 18:14Z (pre-fix, con overrides compensatorios 3167.128/3087.128) documenta el gap original; la corrida 20:30Z reproduce esos mismos valores **desde fórmula pura** — exactamente el objetivo de la tanda.

— Auditor ciego Caso 5 · solo GET + oráculo · 2026-10-05
