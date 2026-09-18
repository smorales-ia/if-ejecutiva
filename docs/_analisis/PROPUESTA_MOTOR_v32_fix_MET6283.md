# Propuesta · Fix del motor v3.2 a partir de la auditoría del xlsm MET-6283

> Estado: **PROPUESTA** (no aplicada). Requiere decisión de Hector/Oscar antes de tocar `C_Formulas` o catálogos.
> Origen: auditoría del motor Excel real `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` (17-sep-2026) y prueba de producción sobre la sandbox `VP-2026-0066` (`recNiwM4s1ibr3sbO`).
> Prueba Ruta 3 (overrides) + Opción A del Bloqueo #1 (regla `REGLA_REFI_CASA_V32`): **13/13 valores dentro de ±1 %** del oráculo (deltas < 0,00003 %, todos por redondeo de los overrides a 2 decimales).

---

## 1 · Contexto

La auditoría del xlsm que produjo el informe MET-6283 (hoja `Portada`, filas 51–78) mostró que el
motor real calcula el **Valor Comercial UF** como la suma de tres componentes:
`edificación (sup × UF/m² nuevo × factor_df) + terreno (Σ sub-lotes sup × UF/m²) + obras complementarias`.
La fórmula terminal v3.2 **`F_ValorComercialUF`** en `C_Formulas` computa **sólo el término de edificación**
(`sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc`), omitiendo terreno (11.218,80 UF) y OCC (750 UF).
Como Remate, Liquidación y todos los CLP derivan de `valor_comercial_uf`, ese único gap contamina la cadena.
Los tres valores independientes de comercial — Avalúo Fiscal, Ingreso Líquido Anual, Renta Perpetua — sí
coinciden exactos con el xlsm porque su fórmula v3.2 es idéntica a la del Excel.

Además, la auditoría **corrige la premisa del Bloqueo #3**: el terreno del informe **no** se homogeneizó por
comparables a ~2,23 UF/m². El "2,23 UF/m²" del cuadro es un promedio derivado (`= 11.218,80 / 5.024,86`).
El motor real tasó el suelo con **dos filas Terreno manuales**: 1.402,35 m² × 8,00 UF/m² + 3.622,51 m² × 0,00 UF/m².
Ni `M_Comunas.Colina.uf_m2_terreno = 17` ni un promedio de comparables reproduce ese valor; sólo lo reproduce
alimentar un `uf_m2_terreno_efectivo` ≈ 2,2327 sobre la superficie total, o replicar el split por sub-lotes.

La prueba de producción confirmó ambos diagnósticos: con la regla v3.1 (`Regla_MetLife_Refinanciamiento_Casa`)
el motor emitió las fórmulas UF + intermedias pero **ningún terminal CLP** ni Avalúo Fiscal (Bloqueo #1 vivo);
al cambiar a `REGLA_REFI_CASA_V32` (Opción A) + los 3 overrides, cuadraron los 13. El override es hoy el
único puente para valuar este caso; el motor no es autónomo hasta resolver el gap de fórmula y los datos.

---

## 2 · Patches P1–P6

### P1 — F_ValorComercialUF (`rec8rv76smtjQh4Rb`, v3.2) · fix central
```
DE:  valor_final_override > 0 ? valor_final_override
       : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc)
A:   valor_final_override > 0 ? valor_final_override
       : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc
          + (hay_terreno ? sup_terreno_m2 * uf_m2_terreno_efectivo : 0)
          + valor_obras_complementarias_uf)
```

### P2 — F_ValorReposicionUF (`reckDXGPbkDVjzPjY`, v3.2) · agrega OCC
```
DE:  ... : (sup_construccion_m2 * uf_m2_nuevo_lookup)
A:   ... : (sup_construccion_m2 * uf_m2_nuevo_lookup + valor_obras_complementarias_uf)
```
(Reposición = edificación **a nuevo**, sin factor_df, + OCC = 8.496,94 + 750 = 9.246,94.)

### P3 — F_SeguroIncendioUF (`recZTfJX0MJ0r1tHP`, v3.2) · edificación depreciada + OCC, sin terreno
```
DE:  valor_seguro_override > 0 ? valor_seguro_override : (valor_comercial_uf * factor_seguro)
A:   valor_seguro_override > 0 ? valor_seguro_override
       : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc + valor_obras_complementarias_uf)
```
(Seguro = edificación **depreciada** (8.157,06) + OCC (750) = 8.907,06; excluye terreno.)

### P4 — Inputs / catálogos (no son fórmulas)
- `uf_m2_terreno_efectivo`: fuente confiable por solicitud (≈ 2,2327 para MET-6283). **No usar `M_Comunas.Colina = 17`.**
- `valor_obras_complementarias_uf`: cargar las obras (Piscina 350 + OO.CC 250 + OO.CC 150 = 750) en su hogar de datos.
- `factor_df_calc` / `factor_depreciacion_override`: 0,96 en el xlsm (manual). Confirmar si se ingresa o se calcula por edad.
- `uf_m2_nuevo_lookup`: 34 desde `C_PreciosUnitarios` clave `Casa-Albanileria-BUENA` → requiere `calidad = BUENA` (Bloqueo #2; en la prueba el lookup dio 22 con calidad vacía).
- `gasto_anual_clp = 3.300.000` (= 1 mes de arriendo; el xlsm deduce exactamente 1 mes). Ya sembrado en la sandbox.

### P5 — (opcional, generalización) Remate/Liquidación table-driven por velocidad_venta
Reemplazar `× 0.65` / `× 0.825` hardcodeados (v3.2: F_ValorRemateUF `recCjbaxfXQELCfj9`, F_ValorLiquidacionUF `recSYwQqRULkqYimi`)
por lookup de `factor_remate` según `velocidad_venta` y `f_liq = (1 − factor_remate)/2 + factor_remate`.
Tabla real del xlsm: 1-2m 0,75 · 2-4/4-6/6-8m 0,70 · 8-10m 0,65 · 10-12/12-18m 0,60 · 18-24m 0,55 · >24m 0,50.
Para MET-6283 el hardcode coincide, pero fallará con otra velocidad. (v3.1 ya es table-driven.)

### P6 — (deuda de modelo) Terreno por sub-lotes
El modelo de una sola `uf_m2_terreno × sup_terreno` no reproduce predios donde el excedente se valora a 0.
Hace falta soportar tramos (sup_valorizada @ precio + sup_excedente @ 0) o aceptar `uf_m2_terreno_efectivo`
promedio como input. Fuera del alcance de un patch de fórmula. **No existe tabla de tramos de terreno hoy**
(`C_TramosBienComun` es para % de bien común, no para precio de suelo).

---

## 3 · Datos a decidir con Hector/Oscar antes de aplicar Ruta 2

### 3.1 · Hogar de datos para OCC itemizada
**Ya existe** `TX_ObrasComplementarias` (`tblQ1fXM06bzSQ84w`, campos `tipo_obra`, `valor_uf`, `se_deprecia`,
`solicitud`), y el DAG (`AT03_Calculos_DAG.js`, línea 64/867) ya lee de ella para `sum_obras_complementarias_uf`.
El gap no es de esquema sino de **poblado**: la sandbox no tenía filas, por eso `F_ValorOCC` dio 0.
**Decisión:** ¿quién/qué puebla `TX_ObrasComplementarias` en el flujo real (extracción de foto/plano, tipeo del tasador)?

### 3.2 · Cómo se resuelve `uf_m2_terreno_efectivo` por solicitud
Opciones a decidir:
- (a) **Input directo** desde la ficha del tasador (campo por solicitud) — más simple, replica lo que hace el Excel.
- (b) **Split de sub-lotes** con nueva tabla `TX_TerrenoTramos` (sup + precio por tramo) — fiel al xlsm, mayor esfuerzo.
- (c) **Homogeneización de comparables** — **descartada para MET-6283** (Hallazgo T-1: el informe no la usó para terreno).
Recomendación técnica: (a) para cerrar MET-6283; (b) si se quiere generalizar a predios rurales con excedente a 0.

---

## 4 · Riesgo de aplicar P1–P3 sin resolver los datos

Si se aplican P1–P3 pero **no** se resuelven `uf_m2_terreno_efectivo` (P4) y el poblado de OCC (3.1), el motor
**seguirá sin ser autónomo**: `F_ValorComercialUF` sumaría terreno con el default de comuna (17 → ~85.000 UF de
terreno, resultado disparatado) y OCC = 0. El override de `valor_final_override` seguiría siendo obligatorio.
Es decir, los patches de fórmula son necesarios pero **no suficientes**; sin los datos, no destraban nada y
podrían empeorar el resultado por defecto (hoy v3.2 al menos da sólo-edificación; con P1 y comuna=17 daría un
terreno inflado). **Aplicar P1 y la corrección de `uf_m2_terreno` deben ir juntos.**

---

## 5 · Alcance sugerido de la tanda P##-MOTOR

- **Fase A — Definir datos con Hector.** Cerrar 3.1 (poblado OCC) y 3.2 (fuente de `uf_m2_terreno_efectivo`);
  confirmar si `factor_df` se ingresa o se calcula; confirmar Bloqueo #2 (calidad → `Casa-Albanileria-BUENA`).
- **Fase B — Patches `C_Formulas`.** Aplicar P1–P3 (y P5 si se aprueba generalización). Bumpear versión y documentar.
- **Fase C — Siembra de catálogos.** `M_Comunas` (uf_m2_terreno realista o marcar no-usable para rural),
  `C_PreciosUnitarios` (clave BUENA), `M_Clientes` (tasa_cap 4,5 % MetLife ya OK).
- **Fase D — Regresión.** Correr AT03 v32 contra los xlsm de referencia disponibles y comparar los 13 valores
  con tolerancia ±1 %; vigilar que overrides sólo se usen donde se decida y no enmascaren gaps de fórmula.

---

## Anexo · Evidencia de la prueba (sandbox VP-2026-0066)

- Overrides aplicados: `valor_final_override=20125.86`, `valor_reposicion_override=9246.94`, `valor_seguro_override=8907.06`.
- Bloqueo #1 resuelto vía Opción A: `regla_aplicada = REGLA_REFI_CASA_V32` (AT01 no la revirtió).
- AT03 (`CLEANUP` + recálculo) reemplazó limpio: 19 filas v3.1 → **13 filas v3.2**, timestamp 2026-09-18T02:37Z.
- **13/13 dentro de ±1 %** (deltas < 0,00003 %, por redondeo de overrides a 2 decimales; `uf_dia_visita = 39.894,61` exacto).
- Observación: **AT03 no escribió en `A_Eventos`** y el estado quedó en `visitada` (AT04 — transición + evento — no corrió/está inactivo en la sandbox). A vigilar en el flujo real.
