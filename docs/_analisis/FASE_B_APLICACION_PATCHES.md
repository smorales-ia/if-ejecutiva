# Fase B · Aplicación de patches del motor — MET-6283

> **Veredicto: NO PASA · Fase B BLOQUEADA antes de escribir.** No se aplicó ningún cambio en
> `C_Formulas`, ni en el esquema de `TX_ItemsCuadroValoracion`, ni en la sandbox VP-2026-0066.
> Causa raíz estructural (evidencia abajo): el diseño v3 exige que el **DAG** (`AT03_Calculos_DAG.js`)
> agregue `TX_ItemsCuadroValoracion` por `tipo_bien` e inyecte los totales al SCOPE; el motor de
> `C_Formulas` **no** puede leer tablas hijas. Ese cambio de DAG está **fuera del alcance autorizado**
> de Fase B ("no se toca código del repo") y **no es desplegable vía MCP** (el script vive dentro de
> la Automation AT03 de Airtable). Aplicar solo los patches de `C_Formulas` dejaría el cálculo en
> +369 % sobre el oráculo y, si se retiran los overrides, rompería la producción.

**Fecha:** 2026-09-18 · **Base:** `app9G7lLkIV3CpeLa` · **Sandbox:** VP-2026-0066 (`recNiwM4s1ibr3sbO`).
**Modo:** solo diagnóstico + verificación (lectura). **Escrituras a Airtable: 0.**

---

## 1 · Qué se inspeccionó (evidencia)

### 1.1 · El motor de `C_Formulas` es un evaluador de escalares, no de tablas
`AT03_Calculos_DAG.js` (v32, 1262 líneas) contiene un evaluador propio (`safeEval`, descenso
recursivo, sin `eval`/`new Function`). Ese evaluador solo ve un objeto **`SCOPE`** de variables
**primitivas** y los `variable_output` de fórmulas previas (encadenadas por `depende_de` /
`orden_topologico`). **No tiene acceso a registros de tablas hijas.** Toda agregación de hijos se
hace en JS *antes* de armar el SCOPE:
- `sumObrasComplementarias(recId)` (líneas 864-877): suma `valor_uf` de `TX_ObrasComplementarias`.
- Comuna (líneas 750-765): lee `uf_m2_terreno` de `M_Comunas`.

### 1.2 · El DAG NO conoce `TX_ItemsCuadroValoracion`
Las tablas que el DAG abre (`base.getTable`, líneas 50-65) son: `TX_Solicitudes`, `C_Formulas`,
`TX_Calculos`, `TX_DatosTasacion`, `C_Factores`, `M_Comunas`, `M_Clientes`, `A_Eventos`,
`C_VidaUtil`, `C_PreciosUnitarios`, `C_TramosBienComun`, **`TX_ObrasComplementarias`**,
`C_ReglasNegocio`. **`TX_ItemsCuadroValoracion` no aparece.** El SCOPE (líneas 935-993) no tiene
`valor_terreno_uf`/`valor_occ_uf`/`valor_edificacion_uf` derivados del cuadro; en su lugar:
- `sup_terreno_m2` (de `TX_DatosTasacion`) y `uf_m2_terreno_comuna` (de `M_Comunas`, default 20/17).
- `sum_obras_complementarias_uf` (de `TX_ObrasComplementarias`).

### 1.3 · Estado actual de `C_Formulas` (`tblNFa454fBbqRB3t`) — 37 registros
Field IDs: nombre `fldjSdn7HT1d8PXZy` · expresion `fldyPzdE1wyXlXPjU` · variable_output
`fld72TU3OZrQlwGsB` · version `fld9xL0HvDxOa04i4` · depende_de `fldceiCmyuDKLydul` · es_terminal
`fldeqoRAWsgTcPZmi` · activa `fldJpSmdqofPJ6k3l`.

| Fórmula (rec) | ver | expresión actual | var_output |
|---|---|---|---|
| **F_ValorTerreno** `recHNKyfGDBV4Hxu3` | v3.1 | `sup_terreno_m2 * uf_m2_terreno_comuna` | valor_terreno_uf |
| **F_ValorOCC** `recNvuDLjUpr0re89` | v3.1 | `sum_obras_complementarias_uf` | valor_obras_complementarias_uf |
| **F_ValorEdificacion** `recsYqh0ssRR0mUJo` | v3.1 | `sup_construccion_m2 * uf_m2_nuevo * factor_df * coef_tipo` | valor_edificacion_uf |
| **F_ValorComercial** `recl2rsrDf7XqNKTI` | v3.1 | `… : (sup_construccion_m2*uf_m2_nuevo + (hay_terreno? sup_terreno_m2*uf_m2_terreno_comuna:0) + valor_obras_complementarias_uf)` | valor_comercial_uf |
| **F_ValorComercialUF** `rec8rv76smtjQh4Rb` | v3.2 T | `valor_final_override>0 ? valor_final_override : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc)` | valor_comercial_uf |
| **F_ValorReposicionUF** `reckDXGPbkDVjzPjY` | v3.2 T | `valor_reposicion_override>0 ? … : (sup_construccion_m2 * uf_m2_nuevo_lookup)` | valor_reposicion_uf |
| **F_SeguroIncendioUF** `recZTfJX0MJ0r1tHP` | v3.2 T | `valor_seguro_override>0 ? … : (valor_comercial_uf * factor_seguro)` | seguro_incendio_uf |
| **F_ValorRemateUF** `recCjbaxfXQELCfj9` | v3.2 T | `valor_comercial_uf * 0.65` | valor_remate_uf |
| **F_ValorLiquidacionUF** `recSYwQqRULkqYimi` | v3.2 T | `valor_comercial_uf * 0.825` | valor_liquidacion_uf |

Observaciones:
- La cadena modular v3.1 (`F_ValorEdificacion` + `F_ValorTerreno` + `F_ValorOCC` → `F_ValorComercial`)
  **ya existe**, pero su terreno usa `uf_m2_terreno_comuna` (≈17/20) — el número equivocado que la
  auditoría prohíbe usar.
- La terminal v3.2 `F_ValorComercialUF` **solo computa edificación** (omite terreno y OCC) — por eso
  la prueba previa necesitó `valor_final_override`.
- `F_ValorOCC` v3.1 lee `TX_ObrasComplementarias` (contradice la decisión Fase A de que OCC vive en
  `TX_ItemsCuadroValoracion`).

---

## 2 · Por qué los patches P1-P3 no son aplicables solo en `C_Formulas`

El diseño v3 (Fase A) pide `F_ValorComercialUF = F_ValorEdificacion + F_ValorTerreno + F_ValorOCC`
con terreno y OCC **por SUMIF sobre `TX_ItemsCuadroValoracion.valor_total_uf`**. Para que una
expresión de `C_Formulas` disponga de esos totales, tienen que existir como **variables de SCOPE**
(`valor_terreno_items_uf`, `valor_occ_items_uf`, `valor_edificacion_items_uf`). El SCOPE lo arma el
DAG en JS. Hoy no existen y **no hay forma de crearlas sin editar el DAG** para:
1. `base.getTable('TX_ItemsCuadroValoracion')`.
2. Sumar `valor_total_uf` (`fld1F3u5J5NlnJUjY`) agrupado por `tipo_bien` (`fld5HVdWpMY0jWqkx`) filtrando por la solicitud.
3. Inyectar esos totales al SCOPE.

Ese es un cambio en **`AT03_Calculos_DAG.js`** (código del repo, excluido por la autorización de
Fase B) y, además, debe **re-pegarse en la Automation AT03 de Airtable** para tomar efecto — el MCP
no edita scripts de Automations (limitación conocida, CLAUDE.md §MCP).

### Proyección si se parchara `C_Formulas` sin tocar el DAG
Reapuntando `F_ValorComercialUF` a la cadena v3.1 y retrocargando OCC en `TX_ObrasComplementarias`:
- `valor_edificacion_uf` ≈ 8.157,06 (solo si `calidad='BUENA'` → lookup 34; hoy `calidad_construccion`
  vacío ⇒ Bloqueo #2 daría 22 ⇒ 5.278,10).
- `valor_terreno_uf` = `5.024,86 × uf_m2_terreno_comuna(17)` = **85.422,62** (oráculo 11.218,80).
- `valor_obras_complementarias_uf` = 750 (si se retrocargan las OCC en `TX_ObrasComplementarias`).
- **Comercial ≈ 94.330 UF vs 20.125,86 → Δ ≈ +369 %. FAIL.**
El terreno es el bloqueo fatal: sin el DAG leyendo el cuadro, no hay manera de obtener 11.218,80.

---

## 3 · Cambios aplicados

- **Esquema `TX_ItemsCuadroValoracion`:** ninguno. Los ajustes autorizados (agregar
  `origen_superficie`; despublicar legacy `flddcT2wvPX38pHrE`/`flddveB4mZ6sovdeR`/`fldMsoEuBe5IN5y1S`)
  quedan **diferidos** al mismo *maintenance window* del cambio de DAG, para no dejar la tabla —que
  comparte IF-03/E1— medio-migrada mientras el motor sigue bloqueado. Despublicar campos de una tabla
  compartida sin poder validar el flujo E1 end-to-end es una acción difícil de revertir; no se hace a ciegas.
- **`C_Formulas`:** ninguno (ver §2).
- **Sandbox VP-2026-0066:** ninguno. **NO** se retrocargaron filas en `TX_ItemsCuadroValoracion`,
  **NO** se cambió `regla_aplicada`, **NO** se retiraron los overrides. La sandbox sigue en el estado
  13/13-vía-overrides de la prueba previa (motor NO autónomo, pero consistente).

---

## 4 · Tabla de regresión (13 valores) — NO EJECUTADA (bloqueada)

Esperado = oráculo del informe MET-6283 (`PLAN_PRUEBA_PROD_MET6283_v3.md` §Cierre). Obtenido = no se
corrió AT03 porque los patches no son aplicables en el alcance autorizado (§2).

| # | Valor | Celda xlsm respaldo | Esperado | Obtenido | Δ% | OK/FAIL |
|---|---|---|---|---|---|---|
| 1 | Valor Comercial UF | `Portada!BI62` | 20.125,86 | no ejecutado | — | BLOQUEADO |
| 2 | Valor Comercial CLP | `Portada!AY69` | 802.913.431 | no ejecutado | — | BLOQUEADO |
| 3 | Valor Reposición UF | `Portada!BG72` | 9.246,94 | no ejecutado | — | BLOQUEADO |
| 4 | Valor Reposición CLP | `Portada!BL72` | 368.903.065 | no ejecutado | — | BLOQUEADO |
| 5 | Seguro Incendio UF | `Portada!BG73`/`BO62` | 8.907,06 | no ejecutado | — | BLOQUEADO |
| 6 | Seguro Incendio CLP | `Portada!BL73` | 355.343.781 | no ejecutado | — | BLOQUEADO |
| 7 | Avalúo Fiscal UF | `Portada!BG74` | 8.517,68 | no ejecutado | — | BLOQUEADO |
| 8 | Valor a Remate UF (65%) | `Portada!BG77`/`AU77` | 13.081,81 | no ejecutado | — | BLOQUEADO |
| 9 | Valor a Remate CLP | `Portada!BL77` | 521.893.730 | no ejecutado | — | BLOQUEADO |
| 10 | Liquidación Normal UF (82,5%) | `Portada!BG78`/`AU78` | 16.603,84 | no ejecutado | — | BLOQUEADO |
| 11 | Liquidación Normal CLP | `Portada!BL78` | 662.403.581 | no ejecutado | — | BLOQUEADO |
| 12 | Ingreso Líquido Anual CLP | `FICHA SOLIC` (arriendo·gastos) | 36.300.000 | no ejecutado | — | BLOQUEADO |
| 13 | Renta Perpetua CLP | `Portada` (ILA / tasa) | 806.666.667 | no ejecutado | — | BLOQUEADO |

Componentes del cuadro (respaldo del comercial): edificación `BI59`=8.157,06 · OCC `BI60`=750 ·
terreno `BI61`=11.218,80 · UF/m² terreno efectivo `BD61`=2,2327.

---

## 5 · Bloqueos secundarios vigentes (no fatales, pero a resolver junto con el principal)

- **Bloqueo #2 (calidad):** `TX_DatosTasacion.calidad_construccion` vacío ⇒ el DAG no arma
  `Casa-Albanileria-BUENA` ⇒ `uf_m2_nuevo` = 22 en vez de 34 ⇒ edificación 5.278 vs 8.157. Setear la
  calidad (o el override `uf_m2_nuevo`) antes de regresar.
- **Bloqueo #1 (regla):** la sandbox tiene `regla_aplicada = Regla_MetLife_Refinanciamiento_Casa`
  (set v3.1), no `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`). Se cambia al retirar overrides.
- **OCC fuente:** `F_ValorOCC` v3.1 lee `TX_ObrasComplementarias`, no el cuadro (Fase A dijo cuadro).
  Migrar el lector del DAG a `TX_ItemsCuadroValoracion`.

---

## 6 · Veredicto y siguiente acción

**NO PASA · Fase B bloqueada.** No por un delta de cálculo, sino porque la implementación del diseño
v3 requiere un cambio de código+deploy fuera del alcance autorizado de esta fase.

**Fase B-0 (desbloqueo · requiere Sergio + sesión de código + aprobación):**
1. Extender `AT03_Calculos_DAG.js`: leer `TX_ItemsCuadroValoracion`, sumar `valor_total_uf`
   (`fld1F3u5J5NlnJUjY`) por `tipo_bien` (`fld5HVdWpMY0jWqkx`) para la solicitud, e inyectar al SCOPE
   `valor_edificacion_items_uf`, `valor_terreno_items_uf`, `valor_occ_items_uf`.
2. **Re-desplegar** el script en la Automation AT03 de Airtable (pegado manual — no MCP).
3. Patch `C_Formulas` (bumpear a v3.3, documentar en `notas`):
   - `F_ValorTerreno` → `valor_terreno_items_uf`.
   - `F_ValorOCC` → `valor_occ_items_uf`.
   - `F_ValorComercialUF` → `valor_edificacion_items_uf + valor_terreno_items_uf + valor_occ_items_uf`
     (o repuntar la regla a la cadena v3.1 corregida).
   - `F_ValorReposicionUF` → `edificación_a_nuevo + valor_occ_items_uf`.
   - `F_SeguroIncendioUF` → `(edificación_depreciada + valor_occ_items_uf) * factor_seguro`.
   - P5 (`F_ValorRemateUF`/`F_ValorLiquidacionUF`) ya es table-driven por `factor_remate`; sin cambio.
4. Resolver Bloqueo #2 (calidad → BUENA) y ajustes de esquema de §3 (origen_superficie + despublicar legacy).
5. Recién entonces: retrocargar el cuadro (6 filas) en la sandbox, cambiar `regla_aplicada` a
   `REGLA_REFI_CASA_V32`, **retirar los 3 overrides**, forzar AT03 y correr la regresión de §4.

**Estado de seguridad:** la sandbox y la producción quedan intactas; los overrides siguen puestos, así
que el motor sigue emitiendo los 13 valores correctos (vía override) mientras se prepara Fase B-0.
**No retirar los overrides hasta completar los pasos 1-4.**
