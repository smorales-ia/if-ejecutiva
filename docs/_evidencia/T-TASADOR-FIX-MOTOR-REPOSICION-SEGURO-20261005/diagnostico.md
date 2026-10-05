# DIAGNÓSTICO CONSOLIDADO + GATE S1 · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005

**Fecha:** 2026-10-05 · **Insumos:** `diagnostico-code.md` (carril repo/Airtable) y `diagnostico-oraculo.md` (carril XLSM/spec), ambos en este directorio.
**Veredicto del Gate S1: APLICAR.** El fix queda acotado a las expresiones de 2 records de `C_Formulas` + escrituras solo en las 4 solicitudes sandbox. Sin cambios de código, sin re-paste del script AT03, sin tocar M_Clientes.

---

## 1 · Dónde vive y dónde corre cada fórmula

| Fórmula | Vive (fuente de verdad) | Corre |
|---|---|---|
| `F_ValorReposicionUF` v3.3 | `C_Formulas` (`tblNFa454fBbqRB3t`) · record `reckDXGPbkDVjzPjY` · campo `expresion` | Script AT03 desplegado (customScript) la lee y evalúa con `safeEval` en cada corrida (`AT03_Calculos_DAG.js:99,1306-1313,1392`) |
| `F_SeguroIncendioUF` v3.3 | mismo table · record `recZTfJX0MJ0r1tHP` · campo `expresion` | ídem |

**Prueba de runtime:** los `formula_expresion_snapshot` de las filas TX_Calculos de VP-2026-0074..0077 son idénticos al texto vigente de ambos records → el desplegado evalúa el texto del record, no una copia. **Consecuencia clave: el fix es DATA-DRIVEN** — editar los 2 records basta; el desatraso del script (G-6, build `c93620f` pre-CI-057) no bloquea: las variables que los fixes necesitan (`valor_edificacion_nuevo_items_uf`, `valor_seguro_base_items_uf`, `factor_seguro`, `factor_garantia`, vars b0 del cuadro) están probadas presentes en el desplegado. Único INFERIDO: `sup_terreno_items_m2` en el scope del desplegado (lo exige el fix G-1); se verifica con la corrida piloto — si la eval falla, rollback inmediato de la expresión.

## 2 · Fix confirmado contra XLSM + spec

### G-1 · Reposición: el ×0,8 es CONSTANTE del formato, condicional — NO es factor_garantia
Fórmula `Portada!BG72` **idéntica en los 5 libros** (C2–C5 + La Marina):
```
=IF(AN61=0,(CD37*0.8)+CC46,CD37+CC46)
```
- `0.8` literal; castiga **solo la edificación a-nuevo** (CD37) y **solo sin terreno** (AN61=0, departamentos); OO.CC. (CC46) a valor pleno. Con terreno (MET-6283, Casa) NO se aplica — por eso el v32 actual, calibrado con la casa, falló en los 4 deptos.
- Descartado `factor_garantia` como origen (Propuesta B): G-7 exige fg=1,0 para AGH/ALH y aun así sus reposiciones llevan ×0,8; usarlo rompería C2 (R2).
- El 0,8 **no está en ningún spec** (RN-14 solo dice "Reposición sin terreno") → candidato a bump de spec al cierre.

**Cambio (Propuesta A, fiel al XLSM)** en `reckDXGPbkDVjzPjY`.`expresion`, rama con cuadro:
`(sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) + oo_cc` (texto exacto final en `fix-aplicado.md`).

### G-2 · Seguro: rama con cuadro debe multiplicar por el factor del cliente
- XLSM (idéntico 5/5): seguro = Σ ítems depreciados, excluyendo a 0 `Terreno`, `Estac. U/Goce`, `Estac. Desc`, `S/Reg No Regularizable` (Estac. Cub SÍ se asegura), × factor {1,0 si Casa o cliente whitelist; 0,8 el resto}. Factores efectivos: C2=1,0 · C3=1,0 · C4=0,8 · C5=0,8.
- **El spec SÍ lo especifica y el motor lo viola**: Motor v2.7:761 (`valor_seguro_uf = valor_edificacion · factor_seguro`), RB-35:848, RN-11. ⚠ RB-53:851 "factor seguro (0.825)" es errata (0,825 es el factor de liquidación AU78) — probable origen de los fs=0,825 de M_Clientes.
- Las exclusiones de `valor_seguro_base_items_uf` ya son el espejo correcto (R6): **no se toca** la fórmula de campo `valor_seguro_item_uf`.

**Cambio** en `recZTfJX0MJ0r1tHP`.`expresion`, rama con cuadro: `valor_seguro_base_items_uf * factor_seguro`.

### Resolución del conflicto de maestros (sin tocar M_Clientes)
El fix G-2 solo cuadra si el `factor_seguro` que ve el motor es el del oráculo: AGH=1,0 · ALH=1,0 · Security=0,8 · Evoluciona=0,8. M_Clientes es INTOCABLE en esta tanda → el valor correcto se suple **por override en la solicitud sandbox** (mismo mecanismo pantalla G usado en la réplica), con motivo sandbox documentado. La corrección definitiva de M_Clientes (fs erróneos 0,825/0,8→ valores canónicos + G-7) queda para la carga de parámetros con Héctor.

## 3 · Impacto mapeado
- Propagación: solo las 3 reglas V32 (REFI_DEPTO/CASA/DEFAULT — las 3 referencian ambos records); rutas legacy/Leasing usan fórmulas v3.1, intactas.
- Aguas abajo: `F_ValorReposicionCLP`/`F_SeguroIncendioCLP` (misma corrida), ensamblador (`lib/informe/ensamblador.ts:628,630`), AT04 (diferido — sin efecto hoy).
- Solicitudes reales: **intactas**. AT03 corre solo en el trigger `estado='visitada'`; editar C_Formulas no dispara ningún recálculo. El fix solo se manifiesta en lo que se recalcule — en esta tanda, únicamente las 4 sandbox.
- Golden MET-6283 (Caso 1, VP-2026-0073): no se recalcula (fue hand-seeded); el condicional del fix G-1 lo deja fuera del ×0,8 por tener terreno. Riesgo R5 documentado para el futuro: si algún día se recalcula una Casa de cliente con fs=0,8 en maestros, la excepción Casa (fs→1,0) debe resolverse en datos antes.

## 4 · Procedimiento de re-disparo (FASE 2, probado por los seeds de la réplica)
1. Vaciar `valor_reposicion_override` y `valor_seguro_override` (si quedan, la expresión corta en la rama override y el fix no se ejercita). Los legítimos (`vida_util_override`, `tasa_cap_rate_override`) se conservan.
2. Suplir `factor_seguro` correcto vía override sandbox si el maestro difiere.
3. PATCH `estado='visitada'` → poll hasta `calculada`. AT03 **borra** las filas TX_Calculos previas y reescribe (cleanup líneas 738-754) — no duplica.
4. Precondiciones por caso: `regla_aplicada` poblada, `fecha_visita` + H_PreciosUF vigente (H3), factores de cliente resueltos (H6), `nro_interno` vacío.

## 5 · Contrato de validación post-fix (de `diagnostico-oraculo.md` §4.2)

| Caso | `valor_reposicion_uf` esperado SIN override | `valor_seguro_uf` esperado SIN override | Nota |
|---|---|---|---|
| C2 · VP-2026-0074 | **1.115,2** | **1.394** (sin cambio — control negativo factor 1,0) | fs=1,0 |
| C3 · VP-2026-0075 | **1.024** | **1.024** (sin cambio — control negativo factor 1,0) | fs=1,0 |
| C4 · VP-2026-0076 | **902,88** | **857,736** | fs=0,8 |
| C5 · VP-2026-0077 | **3.167,128** | **3.087,128** | fs=0,8 (⚠ R3: 0,8 sobre OO.CC. daría casualmente 3.087,128 — verificar por descomposición, no solo por total) |

Todos los demás terminales (tasación, garantía, remate, liquidación, avalúo) deben quedar **idénticos** a los validados por el auditor ciego de la réplica.

## 6 · Plan de FASE 2 aprobado en este Gate
1. `rollback.md` + snapshot JSON ANTES de tocar nada (texto actual de las 2 expresiones + estado/overrides de las 4 sandbox).
2. Aplicar los 2 PATCHes a C_Formulas.
3. PILOTO = Caso 2 (ejercita G-1 y es control negativo de G-2). Gate S2 interno: si la eval del motor falla (variable ausente) o C2 no cuadra → rollback de expresiones y DETENER.
4. Fan-out C3/C4/C5 en paralelo.
5. `regresion-no-rompe.md` (Caso 1 intacto + controles factor 1,0).
6. Auditor ciego ×4 → rollback condicional → cierre.
