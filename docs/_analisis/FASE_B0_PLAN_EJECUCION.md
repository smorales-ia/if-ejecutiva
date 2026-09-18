# Fase B-0 · Plan de ejecución (desbloqueo del motor MET-6283)

> **B-0a (esta tanda):** DAG editado + patches preparados. **Nada ejecutado en Airtable.**
> **B-0b (siguiente tanda):** pegar DAG, aplicar patches `C_Formulas`, retrocargar sandbox, regresión.
> Rama: `feat/motor-b0-dag-cuadro`. Fuentes: `FASE_A_DISENO_TABLAS_MOTOR.md`,
> `FASE_B_APLICACION_PATCHES.md`, xlsm `1951-MET 6283…`, `PLAN_PRUEBA_PROD_MET6283_v3.md`.

---

## Sección 1 — Diff DAG (resumen ejecutivo)

`AT03_Calculos_DAG.js` v11.0 → **v11.1 (v32-b0)**. Cambio **aditivo y retrocompatible** (detalle en
`DIFF_DAG_AT03_B0.md`). Agrega el lector `sumCuadroValoracion(recId)` sobre `TX_ItemsCuadroValoracion`
(`tblCxnMtOETK2ulD0`), que agrupa por `tipo_bien` replicando 1:1 las sumas del xlsm e inyecta al SCOPE:

| Variable SCOPE | = celda xlsm | Valor MET-6283 |
|---|---|---|
| `valor_edificacion_items_uf` | `BI59` (depreciado) | 8.157,06 |
| `valor_edificacion_nuevo_items_uf` | `CC70` (a nuevo) | 8.496,94 |
| `valor_terreno_items_uf` | `BI61` | 11.218,80 |
| `valor_occ_items_uf` | `BI60` (exclusión) | 750 |
| `sup_terreno_items_m2` | `AN61` | 5.024,86 |
| `valor_seguro_base_items_uf` | `BO62` | 8.907,06 |
| `hay_cuadro` | — | 1 |

Si `hay_cuadro=0`, todo va en 0 y las fórmulas caen al modelo previo (no rompe tasaciones sin cuadro).
Validación local: `node --check` (envuelto en async) → SYNTAX OK.

---

## Sección 2 — Patches `C_Formulas` v3.3 (tabla lista para B-0b)

Tabla `C_Formulas` = `tblNFa454fBbqRB3t`. Campos: nombre `fldjSdn7HT1d8PXZy` · expresion
`fldyPzdE1wyXlXPjU` · version `fld9xL0HvDxOa04i4` · notas (documentar el cambio). **No aplicar en B-0a.**

### Terminales (las consume `REGLA_REFI_CASA_V32` · `recYEf9XepX4SmLnH`)

**P1 · F_ValorComercialUF** — `rec8rv76smtjQh4Rb` · v3.2 → v3.3 · celda `BI62`
- Actual: `valor_final_override > 0 ? valor_final_override : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc)`
- Nueva: `valor_final_override > 0 ? valor_final_override : (hay_cuadro > 0 ? (valor_edificacion_items_uf + valor_terreno_items_uf + valor_occ_items_uf) : (sup_construccion_m2 * uf_m2_nuevo_lookup * factor_df_calc))`
- MET-6283: `8.157,06 + 11.218,80 + 750 = 20.125,86` ✓

**P2 · F_ValorReposicionUF** — `reckDXGPbkDVjzPjY` · v3.2 → v3.3 · celda `BG72` (`CC70 + BI60`)
- Actual: `valor_reposicion_override > 0 ? valor_reposicion_override : (sup_construccion_m2 * uf_m2_nuevo_lookup)`
- Nueva: `valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? valor_edificacion_nuevo_items_uf : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))`
- MET-6283: `8.496,94 + 750 = 9.246,94` ✓ (edificación **a nuevo**, sin factor_df)

**P3 · F_SeguroIncendioUF** — `recZTfJX0MJ0r1tHP` · v3.2 → v3.3 · celda `BO62`
- Actual: `valor_seguro_override > 0 ? valor_seguro_override : (valor_comercial_uf * factor_seguro)`
- Nueva: `valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf : (valor_comercial_uf * factor_seguro))`
- MET-6283: `8.907,06` ✓ (edif depreciada 8.157,06 + OCC 750; terreno y estacionamientos ya excluidos
  por la fórmula `valor_seguro_base` de la tabla = `BO` por fila).
- ⚠ **Verificación B-0b (factor cliente/tipo):** `valor_seguro_base_items_uf` trae la exclusión por
  fila pero **no** el multiplicador de garantía ×0,8 que el xlsm `BO` aplica a clientes fuera de lista
  y a NO-Casa. Para **Casa** (MET-6283) el factor es **×1** y el resultado es exacto. Si se generaliza a
  otros clientes/tipos, envolver: `valor_seguro_base_items_uf * (tipo_propiedad='Casa' ? 1 : factor_garantia)`
  (requiere exponer `factor_seguro_bo` en el SCOPE). Evidencia xlsm: `BO` mega-IF → ×1 si `tipo='Casa'`
  o cliente∈lista; ×0,8 el resto.

**P5 · F_ValorRemateUF / F_ValorLiquidacionUF** — `recCjbaxfXQELCfj9` / `recSYwQqRULkqYimi` · **SIN cambio**
- Siguen `valor_comercial_uf * 0.65` y `valor_comercial_uf * 0.825` (velocidad "8 a 10 meses").
- Al corregirse `valor_comercial_uf` (P1 → 20.125,86), arrastran solos: remate `13.081,81` (`BG77`),
  liquidación `16.603,83` (`BG78`). No requieren tocar. (P5 table-driven ya vive en el chain v3.1.)

### Intermedias (solo si corre la regla del chain v3.1 `Regla_MetLife_Refinanciamiento_Casa`)

**P1a · F_ValorEdificacion** — `recsYqh0ssRR0mUJo` · v3.1 → v3.3 · `BI59`
- Actual: `sup_construccion_m2 * uf_m2_nuevo * factor_df * coef_tipo`
- Nueva: `hay_cuadro > 0 ? valor_edificacion_items_uf : (sup_construccion_m2 * uf_m2_nuevo * factor_df * coef_tipo)`

**P1b · F_ValorTerreno** — `recHNKyfGDBV4Hxu3` · v3.1 → v3.3 · `BI61`
- Actual: `sup_terreno_m2 * uf_m2_terreno_comuna`
- Nueva: `hay_cuadro > 0 ? valor_terreno_items_uf : (sup_terreno_m2 * uf_m2_terreno_comuna)`

**P1c · F_ValorOCC** — `recNvuDLjUpr0re89` · v3.1 → v3.3 · `BI60`
- Actual: `sum_obras_complementarias_uf`
- Nueva: `hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf`

**P1d · F_ValorComercial** (chain) — `recl2rsrDf7XqNKTI` · v3.1 → v3.3 · `BI62`
- Actual: `valor_final_override > 0 ? valor_final_override : (sup_construccion_m2 * uf_m2_nuevo + (hay_terreno ? sup_terreno_m2 * uf_m2_terreno_comuna : 0) + valor_obras_complementarias_uf)`
- Nueva: `valor_final_override > 0 ? valor_final_override : (hay_cuadro > 0 ? (valor_edificacion_items_uf + valor_terreno_items_uf + valor_occ_items_uf) : (sup_construccion_m2 * uf_m2_nuevo + (hay_terreno ? sup_terreno_m2 * uf_m2_terreno_comuna : 0) + valor_obras_complementarias_uf))`

> **Nota de regla:** las terminales P1/P2/P3 se auto-abastecen de variables del SCOPE, así que **no
> hace falta** agregar formulas intermedias a `REGLA_REFI_CASA_V32.formulas_resultado` (sigue con sus
> 13 terminales). P1a-d solo importan si se decide usar el chain v3.1 de la regla MetLife.

---

## Sección 3 — Bloqueo #2 (calidad_construccion → BUENA)

**Estado tras B-0a:** **neutralizado cuando hay cuadro.** Con `hay_cuadro=1`, la edificación del
comercial sale de `valor_edificacion_items_uf` (BI59) y la de reposición de
`valor_edificacion_nuevo_items_uf` (CC70) — **ninguna** usa `uf_m2_nuevo_lookup`. El `uf_m2=34` lo
tipea el tasador dentro del cuadro (`fldVxo2PfoG7aQ33s`), así que el lookup deja de ser ruta crítica.

**Ruta fallback (sin cuadro):** ahí sí importa. El DAG arma la clave `Casa-Albanileria-BUENA`; hoy
falla por dos motivos: (a) `material_predominante = "ALBAÑILERÍA LADRILLO"` no matchea `Albanileria`
por acentos/segunda palabra; (b) `calidad` cae a default `'BUENA'` (línea del SCOPE) pero el match de
material se rompe antes. **Fix propuesto (aplicar en B-0b, en `lookupUFm2Nuevo`):** normalizar el
material antes de comparar —

```js
function normMat(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(/[ ,]/)[0];}
// ...usar normMat(material) y normMat(r.getCellValueAsString('material')) en el match
```

Con eso `"ALBAÑILERÍA LADRILLO"` → `albanileria` → matchea la clave → uf_m2 = 34. Alternativa de dato:
poblar un campo de calidad textual "BUENA" y normalizar `material_predominante` en `TX_DatosTasacion`.
**No es bloqueante para MET-6283** (tiene cuadro).

---

## Sección 4 — Protocolo de pegado manual del DAG en la Automation AT03

1. **Backup:** en Airtable → Automations → **AT03** (trigger `TX_Solicitudes.estado = 'visitada'`),
   abrir el paso *Run script*, **copiar el script actual completo** a un archivo local
   (`AT03_backup_pre_b0_<fecha>.js`). No continuar sin backup.
2. **Reemplazar:** borrar todo el contenido del editor de script y **pegar** el contenido íntegro de
   `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (rama `feat/motor-b0-dag-cuadro`).
3. **Input config:** verificar que el paso conserva el input **`recordId`** mapeado al record del
   trigger (el script hace `const { recordId } = input.config();`). No cambia respecto de v11.0.
4. **Guardar** el script. **No** activar/desactivar nada más. **No** tocar overrides ni la sandbox.
5. **Cabecera:** confirmar que el header dice `Version : 11.1.1 (v32-b0)` y
   `MOTOR_VERSION = 'AT03_v11.1.1_v32b0'` (así el smoke test lo identifica en logs/`TX_Calculos`).

> ⚠ **Re-pegado obligatorio (2026-09-18):** el smoke test de v11.1_v32b0 falló en la escritura
> final; la corrección va en **v11.1.1_v32b0**. Hay que **volver a pegar** el script completo
> (mismo procedimiento 1-5) y re-correr el smoke. Ver §7.

---

## Sección 5 — Smoke test post-pegado + rollback

**Smoke test (sin retirar overrides, sandbox intacta):**
1. En la Automation AT03, usar **"Test"** con `recordId = recNiwM4s1ibr3sbO` (VP-2026-0066), que ya
   está `visitada`/recalculable. **No** cambiar datos.
2. En la salida del script (consola de la Automation), confirmar la línea nueva:
   `  CUADRO: filas=… edif=… edif_nuevo=… terreno=… occ=… sup_terreno=… seguro_base=…`.
   - **Éxito esperado si el cuadro NO está poblado aún:** `CUADRO: filas=0 …` y el resto de la corrida
     **idéntica** a v11.0 (el motor no cambió de comportamiento: prueba de retrocompatibilidad).
   - **Éxito si ya se retrocargaron las 6 filas (B-0b):** `filas=6 edif=8157.06 edif_nuevo=8496.94
     terreno=11218.8 occ=750 sup_terreno=5024.86 seguro_base=8907.06`.
3. Confirmar que la corrida **termina** (`[AT03_v32] FIN OK`) sin `SyntaxError` ni excepción, y que
   `TX_Calculos` sigue escribiéndose (con los overrides puestos, los 13 valores no cambian).
4. **Criterio de aprobación del smoke:** el script corre sin romperse **y** el log `CUADRO:` aparece.
   Como los overrides siguen activos, los valores no deben moverse todavía → señal de que B-0a no
   alteró el resultado (solo agregó el lector).

**Criterio de rollback:**
- Si el script **falla** (SyntaxError, excepción, `WARN sumCuadroValoracion` repetido, o `FIN` no llega):
  volver a pegar el `AT03_backup_pre_b0_<fecha>.js` y guardar → estado restaurado en <1 min.
- Si el log `CUADRO:` **no aparece** o `TX_Calculos` deja de escribirse: rollback igual.
- Rollback es seguro y sin pérdida: B-0a **no** tocó datos, esquema, overrides ni la regla.

---

## Sección 6 — Checklist Fase B-0b (aplicar + regresión)

1. [ ] Pegar el DAG v11.1 en la Automation AT03 (§4) + smoke test (§5).
2. [ ] (Opcional/fallback) aplicar el fix de normalización de material en `lookupUFm2Nuevo` (§3).
3. [ ] Aplicar patches `C_Formulas` v3.3: **P1, P2, P3** (terminales) y **P1a-d** (chain, si aplica);
       bumpear `version` a v3.3 y documentar en `notas`. **NO** cambiar `REGLA_REFI_CASA_V32.formulas_resultado`.
4. [ ] Ajustes de esquema diferidos de Fase A: `origen_superficie` (opcional) + despublicar legacy
       `flddcT2wvPX38pHrE`/`flddveB4mZ6sovdeR`/`fldMsoEuBe5IN5y1S` (verificar que E1/IF-03 no los use).
5. [ ] Retrocargar en la sandbox VP-2026-0066 las **6 filas** de `TX_ItemsCuadroValoracion`
       (2 Terreno + 1 Edificacion + 3 OCC · ejemplo en `PROPUESTA_MOTOR_v32_fix_MET6283.md` §P4).
6. [ ] `PATCH regla_aplicada = REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`) si AT01 no la dejó.
7. [ ] **Retirar** `valor_final_override` / `valor_reposicion_override` / `valor_seguro_override`.
8. [ ] Forzar recálculo (estado → `visitada`); AT03 hace CLEANUP de `TX_Calculos` previos.
9. [ ] Regresión: 13 valores dentro de **±1 %** del oráculo (`PLAN_PRUEBA_PROD_MET6283_v3.md` §Cierre).
       Verificar en el log `CUADRO:` que edif/terreno/occ/seguro_base cuadran con BI59/BI61/BI60/BO62.
10. [ ] Si pasa: cerrar Fase B. Si falla: DETENER y documentar causa raíz con la celda xlsm.

---

## Sección 7 — Reparación smoke test 2026-09-18

**Campo identificado:** `fld2H2r0GMeVfNO26` = **`estado`** en **`TX_Solicitudes`** (`tblaHTyMHYfmy7Fg6`),
tipo **singleSelect**. `'calculada'` **sí** es una opción válida (`selvwWsw46l6yiOsX`); el problema no
es el valor sino la **forma** de la escritura.

**Causa raíz (1 línea):** el paso 11 escribía el singleSelect `estado` con un **string pelado**
(`{ estado: 'calculada' }`), que Airtable Scripting rechaza ("Field … cannot accept the provided
value"); debe ir en forma canónica `{ name: 'calculada' }`.

**No lo introdujo B-0a.** El `diff` backup v11.0 → actual demuestra que el bloque final es
**byte-idéntico**: mis cambios son 100 % aditivos (header, `tItemsCuadro`, `sumCuadroValoracion`,
llamada+log, inyección al SCOPE) y ninguno toca la línea del `updateRecordAsync(estado)`. Es un bug
**latente** en v11.0 (por eso en la corrida previa el estado quedaba en `visitada`: la línea siempre
lanzaba antes de llegar a `logEventoCompleto`). El smoke lo **surfaceó** porque corrió AT03 hasta el
final por primera vez. El resto del script ya escribía selects con la forma correcta vía
`valueForSelect` + try/catch; esta línea era la única escritura de select **sin guardar**.

**Diff conceptual del fix (paso 11, v11.1 → v11.1.1):**
```
DE:  await tSolicitudes.updateRecordAsync(recordId, { estado: 'calculada' });
A:   try {
         await tSolicitudes.updateRecordAsync(recordId, { estado: { name: 'calculada' } });
     } catch (eEstado) {
         console.log('  WARN transicion estado->calculada (no fatal): ' + eEstado.message);
     }
```
- Forma canónica `{name}` (funciona con la opción válida) **+** try/catch (no fatal), replicando el
  patrón guardado que ya usa `logEventoCompleto` para sus selects.

**Backup usado como referencia:** `docs/_artefactos/airtable/_backup/20260918resp_AT03_Calculos_DAG.txt`
(v11.0, 1262 líneas). Diff con CRLF normalizado → solo las regiones aditivas de B-0a difieren; el
bloque de escritura final es idéntico.

**Lector del cuadro: PRESERVADO.** `sumCuadroValoracion()`, la inyección al SCOPE
(`valor_edificacion_items_uf`, `valor_edificacion_nuevo_items_uf`, `valor_terreno_items_uf`,
`valor_occ_items_uf`, `sup_terreno_items_m2`, `valor_seguro_base_items_uf`, `hay_cuadro`) y el log
`CUADRO:` quedan intactos (19 referencias verificadas). Versión: **v11.1.1_v32b0**. `node --check`
(async-wrapped) → SYNTAX OK.

---

**Estado:** Fase B-0a reparada. DAG **v11.1.1_v32b0** listo para **re-pegado** (§4) y re-smoke (§5).
Patches `C_Formulas` v3.3 listos para B-0b. Nada ejecutado contra Airtable ni contra la sandbox;
overrides intactos.
