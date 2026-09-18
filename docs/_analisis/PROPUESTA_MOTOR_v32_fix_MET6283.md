# Propuesta · Fix del motor v3.2 a partir de la auditoría del xlsm MET-6283

> **Versión:** v3 · **Fecha:** 2026-09-18 · **Estado: APROBADO para tanda P##-MOTOR (Fase A cerrada).**
> Q1 (OCC) y Q2 (terreno) confirmadas por Héctor/Óscar el 2026-09-18; diseño cerrado.
> **Fuentes de verdad:** `docs/_analisis/AUDITORIA_XLSM_MET6283_OCC_TERRENO.md` (auditoría del motor
> Excel real) y **`docs/_analisis/FASE_A_DISENO_TABLAS_MOTOR.md`** (diseño de tablas · hallazgo:
> `TX_ItemsCuadroValoracion` ya reproduce el cuadro del xlsm 1:1).
> **Cambio v2→v3:** se elimina la tabla nueva `TX_TerrenoTramos`; terreno y OCC pasan a ser filas de
> `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`), el cuadro único ya existente en la base.
> Prueba Ruta 3 (overrides) + Opción A del Bloqueo #1 (regla `REGLA_REFI_CASA_V32`): **13/13
> valores dentro de ±1 %** del oráculo sobre la sandbox `VP-2026-0066` (`recNiwM4s1ibr3sbO`).

---

## 1 · Contexto

La auditoría del xlsm que produjo el informe MET-6283 (hoja `Portada`, filas 51–78) mostró que el
motor real calcula el **Valor Comercial UF** como la suma de tres componentes:
`edificación (sup × UF/m² nuevo × factor_df) + terreno (Σ tramos sup × UF/m²) + obras complementarias`.
La fórmula terminal v3.2 **`F_ValorComercialUF`** en `C_Formulas` computa **sólo el término de edificación**
(`sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc`), omitiendo terreno (11.218,80 UF) y OCC (750 UF).
Como Remate, Liquidación y todos los CLP derivan de `valor_comercial_uf`, ese único gap contamina la cadena.
Los tres valores independientes de comercial — Avalúo Fiscal, Ingreso Líquido Anual, Renta Perpetua — sí
coinciden exactos con el xlsm porque su fórmula v3.2 es idéntica a la del Excel.

La auditoría además **corrigió la premisa del Bloqueo #3**: el terreno del informe **no** se homogeneizó por
comparables. El "2,23 UF/m²" del cuadro es un promedio derivado (`= 11.218,80 / 5.024,86`). El motor real tasó
el suelo con **dos tramos manuales**: 1.402,35 m² × 8,00 UF/m² + 3.622,51 m² × 0,00 UF/m². El corte útil vs.
excedente es **criterio del tasador** (confirmado por Héctor/Óscar el 2026-09-18; no hay lookup por plano ni
plan regulador).

Las dos preguntas de diseño quedaron **cerradas** (ver auditoría §Confirmaciones):
- **Q1 (OCC):** se mantiene como hoy — factor de seguro por cliente/tipo (mega-IF col `BO`), factor de
  liquidación **0,825** por velocidad de venta (`VLOOKUP` → `Portada!AU78`, tabla `BZ62:CB71`).
- **Q2 (terreno):** siempre criterio del tasador — se guardan los tramos tal como el profesional los define.

---

## 2 · Patches P1–P6

### P1 — F_ValorComercialUF (`rec8rv76smtjQh4Rb`, v3.2) · fix central
Consumir tres agregados que son **SUMIF sobre `TX_ItemsCuadroValoracion` por `tipo_bien`** (replican
`BI59/BI60/BI61` del xlsm), no un `uf_m2_terreno_efectivo` escalar ni una OCC lump-sum:
```
DE:  valor_final_override > 0 ? valor_final_override
       : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc)
A:   valor_final_override > 0 ? valor_final_override
       : (F_ValorEdificacion + F_ValorTerreno + F_ValorOCC)
```
donde (todos leídos de `TX_ItemsCuadroValoracion.valor_total_uf` = `fld1F3u5J5NlnJUjY`):
- `F_ValorEdificacion = SUMIF(valor_total_uf, tipo_bien='Edificacion')`                         (8.157,06)
- `F_ValorTerreno     = SUMIF(valor_total_uf, tipo_bien='Terreno')`                              (11.218,80)
- `F_ValorOCC         = SUMIF(valor_total_uf, tipo_bien ∈ {OO.CC., Piscina, Bodega, Estac.…})`   (750)
- MET-6283: 8.157,06 + 11.218,80 + 750 = **20.125,86 UF**.

### P2 — F_ValorReposicionUF (`reckDXGPbkDVjzPjY`, v3.2) · agrega OCC
```
DE:  ... : (sup_construccion_m2 * uf_m2_nuevo_lookup)
A:   ... : (sup_construccion_m2 * uf_m2_nuevo_lookup + F_ValorOCC)
```
(Reposición = edificación **a nuevo**, sin factor_df, + OCC = 8.496,94 + 750 = **9.246,94**.)

### P3 — F_SeguroIncendioUF (`recZTfJX0MJ0r1tHP`, v3.2) · edificación depreciada + OCC, sin terreno
Excluye terreno; suma edificación depreciada + `F_ValorOCC`; aplica el **factor de seguro por
cliente/tipo** (mega-IF de la columna `BO` del xlsm: ×1 para "Casa" y lista de clientes, ×0,8 el resto):
```
DE:  valor_seguro_override > 0 ? valor_seguro_override : (valor_comercial_uf * factor_seguro)
A:   valor_seguro_override > 0 ? valor_seguro_override
       : ((sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc + F_ValorOCC) * factor_seguro_cliente_tipo)
```
(Seguro = (edificación depreciada 8.157,06 + OCC 750) × factor; para MetLife+Casa el factor es 1 →
**8.907,06**; excluye terreno.)

### P4 — Tablas de datos (esquema definitivo · reformulado en Fase A)

**Hallazgo Fase A:** la base **ya tiene el cuadro del xlsm reproducido 1:1** en
`TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`) — mismo discriminador `tipo_bien`, mismos inputs
(`superficie`, `uf_m2`, `factor`, `situacion_municipal`, `estado`, `garantia`, `unidad_medida`) y las
fórmulas `valor_total_uf`/`es_bien_no_garantia`/`valor_seguro_base` que traducen literalmente `BI`/`BZ`/`BO`.
Ver detalle campo-por-campo en `FASE_A_DISENO_TABLAS_MOTOR.md` §1.5.

**Decisiones (revierten P4.a/P4.b de v2):**

- **NO se crea `TX_TerrenoTramos`.** Un tramo de terreno = una fila de `TX_ItemsCuadroValoracion`
  con `tipo_bien='Terreno'`, `unidad_medida='m2'`. Cardinalidad **1 `TX_Solicitudes` → N filas**.
- **Las OCC también son filas de `TX_ItemsCuadroValoracion`** (`tipo_bien ∈ {OO.CC., Piscina, Bodega,
  Estac. U/Goce, Estac. Desc}`, `unidad_medida='unidad'`). `TX_ObrasComplementarias`
  (`tblQ1fXM06bzSQ84w`, `valor_uf`+`se_deprecia`) es una proyección **lossy** (booleano en vez del
  `AX` continuo, sin desglose cantidad×unitario): queda como captura de UI **o** se deprecia; **no**
  es fuente del motor.
- `uf_m2_terreno_efectivo` **NO es campo de `TX_DatosTasacion`**: es **derivado**
  (`F_ValorTerreno / Σ superficie[Terreno]`), idéntico a `BD61`.

**Mapeo de campos del cuadro (FIELD_IDs verificados vía MCP 2026-09-18):**
`tipo_bien` `fld5HVdWpMY0jWqkx` · `detalle` `fldH2znpRjC3LYrVe` · `superficie` `fldSoAHz4I7MPTUBN` ·
`uf_m2` `fldVxo2PfoG7aQ33s` · `factor` (AX·BA) `fld7WgYgsicMa42yv` · `situacion_municipal`
`flds7AFUnTJkeUIER` · `unidad_medida` `fldZyiYfG9wcRDpsN` · `orden` `fldbE6UeloY9opfoJ` ·
`solicitud` `fld8atIwbxSbOlsgq` · `valor_total_uf` (fórmula) `fld1F3u5J5NlnJUjY`.

**Ejemplo poblado — MET-6283 (6 filas en `TX_ItemsCuadroValoracion`):**

| tipo_bien | detalle | superficie | uf_m2 | factor | unidad | valor_total_uf |
|---|---|---|---|---|---|---|
| Terreno | Terreno | 1.402,35 | 8,00 | — | m2 | 11.218,80 |
| Terreno | Servidumbre | 3.622,51 | 0,00 | — | m2 | 0 |
| Edificacion | Piso 1 | 249,91 | 34 | 0,96 | m2 | 8.157,06 |
| Piscina | Piscina | 1 | 350 | 1 | unidad | 350 |
| OO.CC. | Quincho, terrazas, bodega | 1 | 250 | 1 | unidad | 250 |
| OO.CC. | Cierros, pavimento exterior | 1 | 150 | 1 | unidad | 150 |

→ `F_ValorTerreno = 11.218,80` · `uf_m2_terreno_efectivo = 11.218,80 / 5.024,86 = 2,2327` ·
`F_ValorOCC = 750` · `F_ValorEdificacion = 8.157,06` · **Comercial = 20.125,86 UF**.

**Único gap de esquema:** falta `origen_superficie` (col AJ: Escritura · M. Laser · Plano Muni. ·
Plano Prop.) — opcional, no entra en fórmulas de valor. Campos legacy duplicados a despublicar:
`flddcT2wvPX38pHrE`, `flddveB4mZ6sovdeR`, `fldMsoEuBe5IN5y1S`.

### P5 — Remate/Liquidación table-driven por velocidad de venta
Mantener **table-driven** (no hardcodear `× 0.65` / `× 0.825`; v3.2: F_ValorRemateUF `recCjbaxfXQELCfj9`,
F_ValorLiquidacionUF `recSYwQqRULkqYimi`). Lookup de `factor_remate` según `velocidad_venta` y
`f_liq = (1 − factor_remate)/2 + factor_remate`. Tabla real del xlsm (`Portada!BZ62:CB71`):
1-2m 0,75 · 2-4/4-6/6-8m 0,70 · 8-10m 0,65 · 10-12/12-18m 0,60 · 18-24m 0,55 · >24m 0,50.
Para MET-6283 (velocidad "8 a 10 meses") → factor_remate 0,65, factor_liq **0,825** (confirmado Q1).

### P6 — Terreno por sub-lotes · **RESUELTO**
La deuda de modelo (predios donde el excedente se valora a 0) queda **cerrada por las filas de terreno
de `TX_ItemsCuadroValoracion`** (P4). Ya no se depende de una sola `uf_m2_terreno × sup_terreno` ni de
un promedio como input, y no se crea tabla nueva.

---

## 3 · Plan de tanda P##-MOTOR (por fases)

- **Fase A — Estructura de datos. ✅ CERRADA (`FASE_A_DISENO_TABLAS_MOTOR.md`, 2026-09-18).**
  Hallazgo: `TX_ItemsCuadroValoracion` ya es el cuadro del xlsm 1:1. **No se crea `TX_TerrenoTramos`**;
  terreno y OCC son filas de esa tabla. Pendiente de ejecución en Fase B: despublicar campos legacy,
  (opcional) añadir `origen_superficie`, y cablear los rollups `F_ValorEdificacion`/`F_ValorTerreno`/
  `F_ValorOCC` al DAG.
- **Fase B — Patches `C_Formulas`.** Aplicar **P1–P3 y P5**. Bumpear versión de cada fórmula terminal
  y documentar el cambio.
- **Fase C — Siembra de datos históricos.** Retrocargar las filas del cuadro en
  `TX_ItemsCuadroValoracion` (terreno + OCC + edificación) en las tasaciones activas, empezando por
  MET-6283 (VP-2026-0066): 2 filas Terreno + 1 Edificación + 3 OCC.
- **Fase D — Regresión.** Correr AT03 v32 contra los xlsm de referencia disponibles, comparar los 13
  valores con tolerancia ±1 %, y agregar tests unitarios en `TX_Calculos` para `F_ValorTerreno`,
  `F_ValorOCC`, `F_ValorComercialUF`, `F_ValorReposicionUF`, `F_SeguroIncendioUF`.
- **Fase E — Retiro de overrides.** Una vez validada la regresión, retirar los overrides
  (`valor_final_override`, `valor_reposicion_override`, `valor_seguro_override`) para que el motor
  quede autónomo; vigilar que ningún caso vuelva a depender de ellos.

---

## Anexo · Evidencia de la prueba (sandbox VP-2026-0066)

- Overrides aplicados: `valor_final_override=20125.86`, `valor_reposicion_override=9246.94`, `valor_seguro_override=8907.06`.
- Bloqueo #1 resuelto vía Opción A: `regla_aplicada = REGLA_REFI_CASA_V32` (AT01 no la revirtió).
- AT03 (`CLEANUP` + recálculo) reemplazó limpio: 19 filas v3.1 → **13 filas v3.2**, timestamp 2026-09-18T02:37Z.
- **13/13 dentro de ±1 %** (deltas < 0,00003 %, por redondeo de overrides a 2 decimales; `uf_dia_visita = 39.894,61` exacto).
- Observación: **AT03 no escribió en `A_Eventos`** y el estado quedó en `visitada` (AT04 — transición + evento — no corrió/está inactivo en la sandbox). A vigilar en el flujo real.
