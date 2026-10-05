# DIAG-CODE · Arquitectura del fix G-1/G-2 (reposición · seguro) — FASE 1

Tanda: T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005 · 2026-10-05 · solo lectura (Airtable GET + grep repo).
Toda afirmación lleva evidencia (ruta:línea o record_id/campo); lo no probado se marca **INFERIDO**.

---

## 1 · Dónde VIVE cada fórmula

**Las expresiones NO viven en el repo: viven como DATOS en Airtable, tabla `C_Formulas` (`tblNFa454fBbqRB3t`)** (docs/schema-airtable.md:43). Un record por fórmula (no hay records por versión; el campo `version` del record dice "v3.3" — el apodo "v32" del cierre refiere al *set* de 13 terminales, no al campo):

| Fórmula | record_id | version | activa | es_terminal | orden | variable_output |
|---|---|---|---|---|---|---|
| `F_ValorReposicionUF` | `reckDXGPbkDVjzPjY` | v3.3 | ✓ | ✓ | 5 | `valor_reposicion_uf` |
| `F_SeguroIncendioUF` | `recZTfJX0MJ0r1tHP` | v3.3 | ✓ | ✓ | 6 | `seguro_incendio_uf` |

Expresiones actuales (campo `expresion` · `fldyPzdE1wyXlXPjU`, leídas por REST 2026-10-05):

- `F_ValorReposicionUF` (reckDXGPbkDVjzPjY):
  ```
  valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? valor_edificacion_nuevo_items_uf : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))
  ```
- `F_SeguroIncendioUF` (recZTfJX0MJ0r1tHP):
  ```
  valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf : (valor_comercial_uf * factor_seguro))
  ```

**Duplicados legacy activos** (¡ambos con `activa=TRUE`!) que escriben outputs homónimos pero quedan gateados fuera por las reglas V32 (ver §4): `F_ValorReposicion` v3.1 (`recZyBDLTNsWpC99q`, `valor_comercial_uf * factor_garantia` → `valor_reposicion_uf`) y `F_ValorSeguro` v3.1 (`reclBdujre66kmZxw` → `valor_seguro_uf`, output distinto). No tocar: son el set v31 de las reglas legacy.

**Pieza adicional de G-2 que vive en el SCHEMA de Airtable, no en C_Formulas ni en el script:** el campo fórmula `valor_seguro_item_uf` (`fldxzIzT0kakMUbss`) de `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`):
```
IF(OR({tipo_item}='Estac. U/Goce', {tipo_item}='Estac. Desc', {tipo_item}='Terreno', {situacion}='S/Reg No Regularizable'), 0, {valor_uf})
```
(leído del meta-schema; fld5HVdWpMY0jWqkx=tipo_item, fld1F3u5J5NlnJUjY=valor_uf). Esta fórmula es la que **excluye estacionamiento** de la base del seguro — la divergencia de ítems del Caso 5.

En el repo solo existen: el artefacto fuente del script ejecutor `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (no corre en Next.js; es el paste del automation) y menciones documentales (docs/_analisis/FASE_B0_PLAN_EJECUCION.md:43,48 · DIFF_DAG_AT03_B0.md:26-32,59-60 · CIERRE_T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005.md:37-38 · overrides-caso{2,4,5}.md). Ningún .ts/.tsx del app contiene estas expresiones.

---

## 2 · Dónde CORRE cada fórmula en runtime

**Corren dentro del automation AT03 de Airtable (customScript), que es un ejecutor DATA-DRIVEN: lee las expresiones de `C_Formulas` en cada corrida y las evalúa con un intérprete propio (`safeEval`). Las fórmulas NO están hardcodeadas en el script.**

Evidencia en el artefacto (`docs/_artefactos/airtable/AT03_Calculos_DAG.js`):
- Línea 2: "AT03_v32 - Ejecutor de Formulas (LECTOR REAL de C_Formulas_v32)" · línea 99: `const tFormulas = base.getTable('C_Formulas')`.
- Líneas 1306-1313: carga `nombre, expresion, variable_output, …, activa, es_terminal, version` y filtra `activa === true`.
- Línea 1379 + 1392: `const expr = f.getCellValueAsString('expresion')` → `safeEval(expr, SCOPE)`.
- Líneas 1193-1283: SCOPE de variables primitivas (incluye `factor_seguro` l.1213, `factor_garantia` l.1214, cuadro b0 `valor_edificacion_nuevo_items_uf`/`valor_occ_items_uf`/`valor_seguro_base_items_uf`/`sup_terreno_items_m2`/`hay_cuadro` l.1234-1241).
- Trigger: línea 4 "Trigger: TX_Solicitudes.estado = 'visitada'"; guard líneas 667-669 (acepta `visitada` o `asignada`, si no OMITIDO).
- safeEval (líneas 304-640): soporta decimales, ternario anidado, comparaciones (`== != < <= > >=`), `&& ||`, `Math.*` — suficiente para los fixes propuestos.

**Prueba de runtime (desplegado = data-driven):** las 8 filas de `TX_Calculos` (`tblFz37KSvn5pLKDR`) de los 4 casos sandbox tienen `formula_expresion_snapshot` EXACTAMENTE igual al texto vigente de los records v3.3, con `version_motor = AT03_v11.2.0_v32b1`:

| solicitud | valor_reposicion_uf | seguro_incendio_uf |
|---|---|---|
| VP-2026-0074 | rec8QWXyeuDedZUcq (1115.2) | recpTAz5KVNtmLRvE (1394) |
| VP-2026-0075 | recXG1YRZL4Iz0xRR (1024) | recvOGwLTHiu6rtVH (1024) |
| VP-2026-0076 | recOVzfXXV4jtb48N (902.88) | recd8fxQOez1O2opy (857.736) |
| VP-2026-0077 | recsYUBBhyBL0Oyhv (3167.128) | recONTxUaOqp1EL2P (3087.128) |

(El campo `formula_version_snapshot` viene vacío en esas filas; la versión queda en el snapshot de expresión + `version_motor`.)

**G-6 precisado con arqueología git:** el string `AT03_v11.2.0_v32b1` entró en el commit `c93620f` ("Tanda 2+3: robot UF+dolar, promedios comparables"); las variables per-block CI-057 (`promedio_uf_m2_ofertas`, `n_ofertas`, etc.) entraron DESPUÉS, en `0f36e28` (T-PDF-IDENTICO CI-057). O sea: **el script desplegado es el build de la era `c93620f`** — se identifica v32b1 y le faltan solo las variables per-block (por eso `desviacion_*`=0 y promedio combinado; overrides-caso2.md §4). **Todo lo que necesitan los fixes G-1/G-2 (variables b0 del cuadro + `factor_seguro`/`factor_garantia`) SÍ está en el desplegado**, probado en runtime: el Caso 2 calculó el seguro con `valor_seguro_base_items_uf`=1394 sin override (overrides-caso2.md §2). Excepción menor: `sup_terreno_items_m2` es b0 y debería estar (mismo bloque `sumCuadroValoracion`, commit `ac99f96`), pero ninguna fórmula sandbox la evaluó → **INFERIDO**, verificar con una corrida sandbox en FASE 2 si el fix la usa.

---

## 3 · Fuente de verdad del fix

**Veredicto: ambos fixes de fórmula son DATA-DRIVEN — se editan los records de `C_Formulas` y NO exigen re-paste del script AT03.** El re-paste sigue pendiente como saneo APARTE (G-6, filas analíticas `desviacion_*`), es paste manual de Sergio y no bloquea G-1/G-2. La posible tercera pieza (ítems del seguro) es un campo fórmula del schema de Airtable, también sin script.

### G-1 · F_ValorReposicionUF — record `reckDXGPbkDVjzPjY`, campo `expresion` (`fldyPzdE1wyXlXPjU`)

- **Actual:** `valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? valor_edificacion_nuevo_items_uf : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))`
- **El 0,8 NO aparece como constante de reposición en ningún código del repo.** Dónde sí aparece:
  - **XLSM (constante literal condicional):** `BG72 = IF(AN61=0, CD37*0,8 + CC46, CD37 + CC46)` — el ×0,8 se aplica SOLO si la superficie de terreno del cuadro es 0 (deptos); en MET-6283 (casa con terreno) la reposición es `CC70 + BI60` SIN 0,8 (DIFF_DAG_AT03_B0.md:26-32 · FASE_B0_PLAN_EJECUCION.md:43 · AUDITORIA_XLSM_MET6283_OCC_TERRENO.md:213).
  - **Como parámetro (lectura de los auditores):** los auditores de casos 2 y 4 lo leyeron como `factor_garantía` (overrides-caso2.md §1: "Reposición = factor_garantía (0.8) × edificación a-nuevo + OO.CC."; overrides-caso4.md §3), y `M_Clientes.factor_garantia`=0.8 en AGH/Security/MetLife coincide.
  - **Tensión que decide el oráculo:** G-7 (CIERRE…REPLICA:…) dice que el `factor_garantia=0.8` de Agencia y Austral es ERRÓNEO según sus oráculos (garantía ×1,0) — y aun así el Caso 2 (AGH) exigió reposición ×0,8. Si fuera `factor_garantia` y se corrige G-7 (0.8→1.0), la reposición de AGH perdería el 0,8 que su XLSM sí aplica. Esto apunta a **constante del formato XLSM**, no a parámetro de cliente — pero la decisión es del orquestador con el carril de oráculo.
  - Resto de apariciones de 0.8 en código: default legacy `factorGarantia = 0.8` (AT03_Calculos_DAG.js:785, hoy neutralizado por el guard H6 l.815-820) y la fórmula legacy `F_ValorReposicion` v3.1 (`valor_comercial_uf * factor_garantia`).
- **Propuesta A (fiel al XLSM, constante condicional):**
  `valor_reposicion_override > 0 ? valor_reposicion_override : ((hay_cuadro > 0 ? (sup_terreno_items_m2 > 0 ? valor_edificacion_nuevo_items_uf : valor_edificacion_nuevo_items_uf * 0.8) : sup_construccion_m2 * uf_m2_nuevo_lookup) + (hay_cuadro > 0 ? valor_occ_items_uf : sum_obras_complementarias_uf))`
  safeEval la soporta (ternario anidado + decimal). Riesgo: depende de `sup_terreno_items_m2` en el desplegado (INFERIDO presente, §2) — verificable con la corrida sandbox de FASE 2. Nota: esta variante deja las CASAS con terreno sin 0,8, que es exactamente lo que hace el XLSM MET-6283.
- **Propuesta B (parámetro cliente):** `… valor_edificacion_nuevo_items_uf * factor_garantia …` — reproduce los casos 2-5 (todos fg=0.8 hoy) pero **rompe si se sanea G-7** (AGH/Austral → 1.0) y aplicaría 0,8 también a casas. No recomendada sin veredicto del oráculo.

### G-2 · F_SeguroIncendioUF — record `recZTfJX0MJ0r1tHP`, campo `expresion` (`fldyPzdE1wyXlXPjU`)

- **Actual:** `valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf : (valor_comercial_uf * factor_seguro))`
- **Propuesto (factor del cliente sobre la base del cuadro):**
  `valor_seguro_override > 0 ? valor_seguro_override : (hay_cuadro > 0 ? valor_seguro_base_items_uf * factor_seguro : (valor_comercial_uf * factor_seguro))`
  `factor_seguro` está en SCOPE desde la era v30 (AT03_Calculos_DAG.js:1213; leído de M_Clientes l.791-794 con guard H6) → presente en el desplegado.
- **Dos salvedades que decide el oráculo:**
  1. **El factor del XLSM es DB51 (del formato), no siempre = `M_Clientes.factor_seguro` canónico:** Caso 4: XLSM 0,8 vs canónico Security 0,825 (overrides-caso4.md §2: "tampoco coincidiría"). El fix de fórmula solo cierra el gap si se sanean los maestros (G-7/G-8) o el oráculo define la fuente del factor.
  2. **Qué ítems entran en la base:** el XLSM del Caso 5 aplica el factor a TODO el cuadro INCLUIDO estacionamiento (overrides-caso5.md §2: 0,8×3.858,91=3.087,128); el motor lo excluye vía el campo fórmula `valor_seguro_item_uf` (`fldxzIzT0kakMUbss` de `tblCxnMtOETK2ulD0`, §1). Si el oráculo confirma incluir estacionamiento, el cambio es en ESA fórmula de campo (quitar `{tipo_item}='Estac. U/Goce'` y `{tipo_item}='Estac. Desc'` del OR) — cambio de schema Airtable, sin script. MET-6283 (casa) confirma que Terreno sí se excluye (AUDITORIA_XLSM…:215), así que `'Terreno'` y `'S/Reg No Regularizable'` quedan.

---

## 4 · Impacto

**Dentro del DAG (misma corrida, aguas abajo):**
- `F_ValorReposicionCLP` (`recKZibH33lWDzbhD`) = `valor_reposicion_uf * uf_dia_visita` y `F_SeguroIncendioCLP` (`recBpXOM1C9GqMRiM`) = `seguro_incendio_uf * uf_dia_visita` — recogen el fix automáticamente (están en las 17 de las reglas V32).
- `F_ValorMonedas` (`recFrzV3ARSs0g2yM`) también consume `valor_reposicion_uf`, pero NO está en `formulas_resultado` de ninguna regla V32 → no corre por esta ruta.

**Reglas que gatean las dos fórmulas (campo `formulas_resultado` de `C_ReglasNegocio` `tblyCb8cVTDzfeBx0`, verificado por REST):**
- Incluyen AMBAS (n=17): `REGLA_REFI_DEPTO_V32` (`rec2QYP8yjMW1Smsm`), `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`), `REGLA_REFI_DEFAULT_V32` (`reckDNGORrc45HTN9`).
- NO las incluyen (usan el set v31 con `F_ValorReposicion`/`F_ValorSeguro` legacy, n=22): `Regla_Wildcard_Default`, `Regla_AustralLeasing_Habitacional_Casa`, `Regla_AGH_Refinanciamiento_Casa` (y por patrón las demás legacy) → **las rutas legacy/Leasing NO se ven afectadas por el fix** (su gap es G-3, ruteo).

**Consumidores de las salidas (TX_Calculos):**
- Informe/PDF: `lib/informe/ensamblador.ts:628` (`valorReposicionUf ← 'valor_reposicion_uf'`) y `:630` (`seguroIncendioUf ← 'seguro_incendio_uf'`) → el PDF refleja el fix sin tocar código.
- AT04: `docs/_artefactos/airtable/AT04_Validar_Rangos.js:218-219` valida `valor_reposicion_uf/clp` y `seguro_incendio_uf/clp` → validará los valores nuevos (reposición baja ×0,8; seguro baja con factor<1). Revisar que los rangos no disparen falsos fuera-de-rango.

**¿Afecta solicitudes reales?** Solo si se recalculan. AT03 corre únicamente al disparo del trigger `estado='visitada'` (AT03_Calculos_DAG.js:4; guard l.667-669 acepta visitada/asignada) y los registros ya en `calculada` no se reprocesan solos (l.1125: "el motor no reprocesa records ya en 'calculada'"). VP-2026-0067 y demás producción quedan intactas salvo re-disparo manual. Las tasaciones futuras que pasen por `visitada` usan la fórmula corregida — ese es el objetivo del fix. Editar el record de C_Formulas NO dispara ningún recálculo por sí solo.

---

## 5 · Re-disparo del motor en una sandbox ya calculada (procedimiento FASE 2)

Patrón probado por los seeds de la tanda anterior (`docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/seed-caso2.mjs:190-205`): un PATCH REST `TX_Solicitudes.estado='visitada'` dispara AT03; luego poll hasta `estado='calculada'` y `TX_Calculos>0` (los seeds pasaron antes por `asignada`, pero el guard del script acepta `visitada` directo).

**AT03 BORRA y reescribe — no duplica:** antes de calcular elimina TODAS las filas `TX_Calculos` previas de la solicitud ("CLEANUP TX_Calculos previos", AT03_Calculos_DAG.js:738-754, `deleteRecordsAsync` en lotes de 50) y al terminar escribe las 17 filas nuevas y transiciona `estado → 'calculada'` (l.1491-1506).

**Checklist previo al re-disparo de cada sandbox (VP-2026-0074..0077):**
1. **LIMPIAR los overrides** `valor_reposicion_override` y `valor_seguro_override` de la solicitud (y su `override_motivo`/`override_autor` si corresponde): las dos expresiones empiezan con `override > 0 ?` — si quedan puestos, la rama override corta y el fix NO se ejercita.
2. `regla_aplicada` debe seguir poblada (si no: OMITIDO `at03_dag_omitido`, l.727-736).
3. `fecha_visita` presente y con fila vigente en `H_PreciosUF` (guard H3 aborta ruidoso, l.1120-1140); cliente con `factor_seguro`/`factor_garantia` (guard H6, l.815-820) — crítico si el fix G-2 usa `factor_seguro`.
4. `nro_interno` vacío (trampa G-11a: pisa `solicitud_codigo` y el ensamblador no encuentra los terminales).
5. Después: comparar los valores contra el oráculo (`casoN-oraculo.json`) SIN overrides; `rollback-casoN.mjs` ya contempla borrar TX_Calculos y A_Eventos del sandbox al cierre.

**Secuencia mínima por caso:** PATCH overrides→vacío ⇒ PATCH `estado='visitada'` ⇒ poll (≤36×5s) `estado='calculada'` + 17 filas TX_Calculos ⇒ verificar `valor_reposicion_uf` y `seguro_incendio_uf` contra oráculo.
