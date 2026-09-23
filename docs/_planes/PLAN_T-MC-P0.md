# PLAN_T-MC-P0 · Cierre de inputs del motor de tasación (P0 go-live)

> **FASE 1 · PLANIFICACIÓN — READ-ONLY.** Este documento NO ejecuta nada y NO autoriza
> ejecución. La FASE 2 se autoriza sólo tras resolver el **OK Gate (§12)** con Sergio.
> Rama: `plan/T-MC-P0`. Único write autorizado en esta fase: este archivo.
>
> **Plan maestro:** `docs/_md/plan_ejecucion_UItasador_v1.5.md` · **Fuente de auditoría:**
> `docs/_analisis/AUDITORIA_inputs_motor_UNIVERSAL_20260922.md`. Las reglas duras viven en
> `CLAUDE.md` + `docs/aprendizajes.md` (no existe `ways-of-working.md`).
>
> Consolidado a partir de 5 agentes en paralelo (§3 Arquitecto · §4 Tabla oráculo · §6 Tests
> · §7 Frontend · §8 Seguridad), todos read-only, con verificación MCP Airtable el 2026-09-22.

---

## § 1 · Resumen ejecutivo

La tanda cierra **cinco huecos de input del motor de cálculo** (DAG v11.1.1 · `REGLA_REFI_CASA_V32`)
que hoy obligan a tipear a mano o degradan a defaults silenciosos, impidiendo un go-live P0
multi-caso. Los cinco:

| # | Hueco | Naturaleza del arreglo | Motor listo? |
|---|---|---|---|
| **H1** | `uf_m2_unitario` por ítem del cuadro no se captura en UI | UI + persistencia (campo Airtable y fórmula ya existen) | ✅ sólo falta captura |
| **H2** | `factor` (D.F. / depreciación física) por ítem no se captura ni deriva | UI (override por ítem) y/o derivación motor — **decisión de diseño** | ⚠ fórmula lista, falta origen del dato |
| **H3** | UF del día (`uf_dia_visita`) sin fuente + fallback silencioso `\|\| 38500` | Tabla manual `H_PreciosUF` + guard fail-ruidoso en el DAG | ❌ guard por escribir |
| **FIX RF-09** | Extracción documental rutea 3 inputs motor a `TX_Unidades`; el DAG los lee de `TX_DatosTasacion` | Re-enrutamiento en `D_TipoDocumentoAtributo` | ❌ desalineado |
| **Overrides UI** | `valor_reposicion_override` + `valor_seguro_override` sin input | UI + persistencia (el DAG ya los lee) | ✅ sólo falta captura |

**Hallazgo transversal (verificado en la base):** el caso de referencia **VP-2026-0066
(`recNiwM4s1ibr3sbO`)** cierra hoy contra el xlsm MET-6283 **sólo porque todo se tipeó a mano**
(`origen_dato="tipeado"`). Sin estos cinco arreglos, un caso sin xlsm degrada a defaults hardcode
(`uf_dia_visita→38500`, `anio→año−20`, `supConstr→80`, `supTerreno→150`) produciendo cifras
plausibles pero incorrectas **sin ninguna alarma**. La tanda convierte esos silencios en
captura explícita o fallo ruidoso.

**Estado de dependencias:** dos arreglos (Overrides UI, H1) son mecánicos y de bajo riesgo —
motor y schema ya existen. H2 concentra la decisión de diseño más pesada. El FIX RF-09 es poco
código pero **alta decisión de negocio** (multi-unidad). H3 requiere disciplina operativa (carga
diaria de UF). **7 preguntas de OK Gate (§12) bloquean la FASE 2.**

---

## § 2 · Alcance — qué SÍ / qué NO

### SÍ se aborda (FASE 2, tras OK Gate) — los 5 arreglos
- **H1** · captura de `uf_m2_unitario` por ítem en `seccion-valoracion.tsx` + persistencia en
  `TX_ItemsCuadroValoracion.uf_m2_unitario` (`fldVxo2PfoG7aQ33s`).
- **H2** · `factor_aplicado` (`fld7WgYgsicMa42yv`) por ítem: captura y/o derivación (§11 · C-2).
- **H3** · tabla UF manual (**`H_PreciosUF` existente**, no crear `M_UF` nueva — §11 · C-4) +
  **guard fail-ruidoso** que reemplaza el `\|\| 38500` de `AT03_Calculos_DAG.js:985`.
- **FIX RF-09** · re-enrutar `anio_construccion` / `sup_terreno_m2` / `sup_construccion_m2` para
  que la extracción llegue a `TX_DatosTasacion` (donde el DAG lee), no a `TX_Unidades`.
- **Overrides UI** · añadir `valor_reposicion_override` (`fldqpnvfi6ZcWcfQm`) y
  `valor_seguro_override` (`fldc1bOUK1o5jlWbP`) a la Sección G del formulario del tasador.

### NO se toca (INNEGOCIABLE)
- **P1 completo** (H5–H10 de la auditoría: factores multi-cliente, comparables, multi-unidad
  del DAG) — **OUT-OF-SCOPE**.
- **Portada / logo (H9)** — OUT-OF-SCOPE.
- **Deuda de artefactos AT01 / AT02 / AT04 / AT08** — OUT-OF-SCOPE.
- **13 fórmulas terminales de `REGLA_REFI_CASA_V32`** (`C_Formulas` `tblNFa454fBbqRB3t`) — se
  alimentan, no se reescriben.
- **Pipeline PDF E1/E2/E3**, código **IF-02** (`components/console/**`, `app/api/solicitudes/**`),
  y el **escritor cron automático de UF diaria** (la tabla se carga a mano en esta tanda).
- **Comparables** (`TX_Comparables`, 13 atributos RF-09 que el DAG no lee) y `calidad_sii` — deuda
  registrada, no ejecutada aquí.

### Restricciones de esta FASE 1
- **Cero writes** en Airtable, Make, código y sandbox. **No commit / push / branch / merge.**
- MCP Airtable **sólo lectura** (RO-30). Único archivo editable: `docs/_planes/PLAN_T-MC-P0.md`.
- Los commits los hace Sergio desde GitHub Desktop (R12).

---

## § 3 · Diseño técnico consolidado (Agente 1 · Arquitecto)

> **Modo:** SOLO LECTURA. Se usó **MCP Airtable en lectura** (`get_table_schema` sobre
> `TX_ItemsCuadroValoracion` y `H_PreciosUF`) para verificar FIELD_IDs y tipos reales. Cero writes.
> FIELD_IDs de tablas citadas: TX_ItemsCuadroValoracion (`tblCxnMtOETK2ulD0`), TX_Solicitudes
> (`tblaHTyMHYfmy7Fg6`), TX_DatosTasacion (`tblMoK3mFuwN8Yr1A`), TX_Unidades (`tbl2QDLvJDyy3Rg2I`),
> H_PreciosUF (`tblWPRuIYfzdlveHM`), C_Formulas (`tblNFa454fBbqRB3t`).

### § 3.0 · Mapa de dependencias entre los 5 arreglos

```
H3 (guard uf_dia_visita fail-ruidoso) ── necesita H_PreciosUF poblada (H3 = tabla + guard)
H1 (uf_m2_unitario por ítem) ─────────── prerequisito de H2
H2 (factor D.F. por ítem) ────────────── depende de H1
Overrides UI (reposicion + seguro) ───── independiente; UI + datos/route + field-ids
FIX RF-09 → TX_DatosTasacion ─────────── independiente; enrutamiento D_TipoDocumentoAtributo
```
Los bloques (H1+H2), (H3 tabla+guard), (overrides UI) y (FIX RF-09) son **paralelizables entre
sí**; sólo H2 espera a H1.

### § 3.1 · H1 — `uf_m2_unitario` por ítem
- **UI:** `components/tasador/form-sections/seccion-valoracion.tsx` — el bloque por ítem (l.83–179)
  captura 11 campos pero **no** UF/m². Añadir `TextField label="UF/m²" type="number"` en la grilla de
  superficie (junto a l.137–149).
- **Tipo:** `lib/tasador/tasaciones.ts` `interface ItemValoracion` (l.538) → añadir `ufM2: string`;
  `nuevoItem()` en `seccion-valoracion.tsx:16-31` → `ufM2: ""`.
- **Persistencia:** `app/api/tasaciones/[id]/datos/route.ts` sync de items (l.411–431) → añadir
  `uf_m2_unitario: item.ufM2`. **NO** escribir `valor_uf` (fórmula read-only).
- **Airtable:** campo destino **ya existe** — `uf_m2_unitario` = `fldVxo2PfoG7aQ33s` (number 2). La
  fórmula `valor_uf` (`fld1F3u5J5NlnJUjY`) ya lo consume; el DAG lo lee en `sumCuadroValoracion`
  (`AT03_Calculos_DAG.js:923`).

### § 3.2 · H2 — `factor_aplicado` (D.F.) por ítem
- **Airtable:** `factor_aplicado` = `fld7WgYgsicMa42yv` (number 4). Cableado en `valor_uf`: para ítems
  que no son Terreno/Terraza, `valor = sup · uf_m2 · factor`. **Si queda vacío/0, `valor_uf`=0** →
  subvaloración silenciosa.
- **Dos variantes (decisión C-2 · §11):**
  - **A (UI, alineada a H1):** `factorDf: string` en `ItemValoracion` + input en `seccion-valoracion.tsx`
    + `factor_aplicado: item.factorDf` en `datos/route.ts`. Cero cambios de motor. **Recomendada P0.**
  - **B (motor deriva):** exige un **write** de `factor_df` a cada fila antes de que la fórmula corra
    (rompe "el motor sólo lee y evalúa"). El DAG expone `factor_df_calc = coefEstado`
    (`:1052`), pero eso no basta (ver D-2 en §4).
- **Dependencia:** H2 depende de H1 (mismo bloque UI y ruta; el factor sólo tiene efecto con `uf_m2`
  poblado).

### § 3.3 · H3 — Tabla UF manual + guard fail-ruidoso
- **Tabla (3a):** **ya existe** `H_PreciosUF` = `tblWPRuIYfzdlveHM`. Campos verificados (Agente 2):
  `fecha` (`fld2K9OgCpWVXRLM0`), `valor_clp` (`fldycskkXrywvvIR1`), `tipo_cambio_usd`
  (`fldlFxWDnK67OajaE`), `fuente` (`fldU79BZOYUeZUOOt`), `obtenido_en`. **Vacía para 2026-09-17.**
  "Manual" = carga humana (no hay cron; el escritor automático es OUT-OF-SCOPE).
- **Guard (3b):** `docs/_artefactos/airtable/AT03_Calculos_DAG.js:985` —
  `const ufDiaVisita = parseFloat(flatVal(datosCrudo.uf_dia_visita)) || 38500;`. Reemplazar el
  `|| 38500` por un guard que, si no hay UF válida (ni en `TX_DatosTasacion.uf_dia_visita` ni por
  lookup a `H_PreciosUF` por fecha), **falle ruidoso**: evento en `A_Eventos` (`tblMKmDg2KrO5fMn8`) y/o
  aborto del cálculo, en vez de continuar con 38500.
- **Diseño del guard (decisión C-5 · §11):** **D1** (sólo exige `uf_dia_visita ≠ vacío`) vs **D2**
  (lookup a `H_PreciosUF` por fecha de visita). **Recomendado D2.**

### § 3.4 · FIX RF-09 → TX_DatosTasacion
- **Causa raíz verificada:** en `AT03-Ext_script.js` (l.446–522), los atributos `anio_construccion` /
  `sup_terreno_m2` / `sup_construccion_m2` tienen `uso_cardinalidad_destino = una_por_unidad` → rutean a
  **`TX_Unidades`**. El DAG los lee 1:1 de **`TX_DatosTasacion`** (`AT03_Calculos_DAG.js:960-967`). La
  extracción documental **no llega al motor**. El enrutamiento vive en `D_TipoDocumentoAtributo`.
- **Cambio:** para los 3 atributos con `usado_motor_calculo=TRUE`, fijar
  `uso_cardinalidad_destino = una_por_solicitud` y `uso_tabla_destino = TX_DatosTasacion`. Los campos
  destino existen: `anno_construccion` (⚠ **doble-n**), `sup_construccion_m2`, `sup_terreno_m2`.
- **Decisión C-6 · §11:** repuntar a `una_por_solicitud` puede romper el caso multi-unidad. El DAG es
  1:1 por propiedad (la auditoría lo trata así) → **recomendado repuntar a TX_DatosTasacion**,
  conservando TX_Unidades sólo para el detalle de intake que el DAG no consume.

### § 3.5 · Overrides UI faltantes
Gap verificado en 3 capas (0 hits de `reposicion`/`seguro` en `field-ids.ts`, UI y ruta):
- **UI:** `seccion-overrides.tsx` expone sólo 3 overrides (cap_rate l.43, vida_util l.48, valor_final
  l.54) + motivo. `hayOverride()` (l.14–20) tampoco los considera.
- **Tipo:** `InformeData` en `tasaciones.ts` → añadir `valorReposicionOverride` / `valorSeguroOverride`.
- **FIELD_IDs:** `field-ids.ts` (bloque overrides l.147–150) → añadir
  `valor_reposicion_override`=`fldqpnvfi6ZcWcfQm`, `valor_seguro_override`=`fldc1bOUK1o5jlWbP`
  (verificados por Agente 2).
- **Persistencia:** `datos/route.ts` `camposSolicitud()` (l.282–286) → dos `poner(...)`.
- **Motor:** el DAG **ya los lee** (`:660`, `:670`) y alimenta "Valor Reposición UF" (BG72) y
  "Seguro Incendio UF" (BO62). **Arreglo puramente UI + persistencia**, sin tocar motor ni schema.

---

## § 4 · Tabla oráculo completa (Agente 2)

> **Verificación:** valores y FIELD_IDs confirmados vía **MCP Airtable (solo lectura)** el 2026-09-22.
> Caso de referencia: **VP-2026-0066 (`recNiwM4s1ibr3sbO`)**, poblado a mano desde el xlsm de MET-6283
> (`origen_dato="tipeado"`). 6 filas de cuadro confirmadas por `search_records`.

### 4.1 · INPUT → CAMPO DESTINO → VALOR ESPERADO

| # | Arreglo | Input/Output | Tabla · FIELD_ID | Valor esperado (VP-2026-0066) | Verif |
|---|---|---|---|---|---|
| H1-a | uf_m2 por ítem | `uf_m2_unitario` | ItemsCuadro · `fldVxo2PfoG7aQ33s` | Edif **34** · Terreno **8** · Servid. **0** · Piscina **350** · Quincho **250** · Cierros **150** | ✅ |
| H1-b | sup por ítem | `sup_m2` | ItemsCuadro · `fldSoAHz4I7MPTUBN` | 249.91 · 1402.35 · 3622.51 · 1 · 1 · 1 | ✅ |
| H1-c | salida por ítem | `valor_uf` (fórmula) | ItemsCuadro · `fld1F3u5J5NlnJUjY` | **8157.06** · 11218.8 · 0 · 350 · 250 · 150 (Σ=**20125.86**) | 🧮✅ |
| H2-a | factor D.F. por ítem | `factor_aplicado` | ItemsCuadro · `fld7WgYgsicMa42yv` | Edif **0.96** · resto **1** | ✅ |
| H2-c | a-nuevo (sin depr.) | `valor_edif_nuevo` (CC70) | derivado DAG | 249.91·34 ≈ **8497** | 📄 |
| H3-a | UF del día (consumo) | `uf_dia_visita` | TX_DatosTasacion · `fldZ9IG19uhU5etQA` | **39894.61** (UF 2026-09-17) | ✅ |
| H3-b | UF diaria (maestra) | `valor_clp` para `fecha` | H_PreciosUF · `fldycskkXrywvvIR1` | ≈**39894.61**; **HOY VACÍO** (0 registros) | ✅ |
| H3-c | guard | (sin campo) | `AT03_Calculos_DAG.js:985` | debe **fallar ruidoso**, no 38500 | 📄 |
| FIX-1 | avalúo fiscal | `avaluo_fiscal_clp` | TX_DatosTasacion · `fldE4t7FzB47FKTui` | **339 809 429** | ✅ |
| FIX-2/3/4 | 3 inputs desalineados | `anio` · `sup_terreno` · `sup_construccion` | TX_DatosTasacion (`fldzhntDWwfcy5jwP` · `fld2s1wiRstEiMBY8` · `fldYC1GUSW6xWVscq`) | 2020 · 5024.86 · 249.91 | ✅ |
| FIX-5 | material | `material_predominante` | TX_DatosTasacion · `fldtJbujGC89f5lFZ` | **ALBAÑILERÍA LADRILLO** | ✅ |
| OVR-1 | override reposición | `valor_reposicion_override` | TX_Solicitudes · `fldqpnvfi6ZcWcfQm` | Portada BG72; hoy vacío/0 | ✅ |
| OVR-2 | override seguro | `valor_seguro_override` | TX_Solicitudes · `fldc1bOUK1o5jlWbP` | Portada BO62; hoy vacío/0 | ✅ |

### 4.2 · Fórmulas verificadas
- **`valor_uf` (`fld1F3u5J5NlnJUjY`):** `IF(tipo_item='Terreno', sup·uf_m2, IF(tipo_item='Terraza',
  sup·uf_m2·0.5, sup·uf_m2·factor_aplicado))`. El factor D.F. **sólo entra en la rama general**.
  Cierre: Edificación `249.91·34·0.96 = 8157.06` ✅.
- **`valor_seguro_item_uf` (`fldxzIzT0kakMUbss`):** 0 para Estacionamientos/Terreno/sin-regularizar,
  si no `valor_uf`. Por eso el Terreno aporta 0 al seguro.
- **Fallback UF:** `... || 38500` (`:985`) — a reemplazar por guard.
- **Overrides:** `toNum(sol.getCellValue('valor_reposicion_override'),0)` y
  `_readOpt('valor_seguro_override')` (`:660,:670`) → SCOPE → precedencia **máxima** sobre lo calculado
  (override>0 gana; 0/blank → calcula desde el cuadro).

### 4.3 · Contrato RF-09 → TX_DatosTasacion (actual vs correcto)

| Atributo | Destino actual | Destino que lee el DAG | Estado |
|---|---|---|---|
| `avaluo_fiscal_clp` | TX_DatosTasacion | `fldE4t7FzB47FKTui` | ✅ alineado (tipeado en 0066) |
| `material_predominante` | TX_DatosTasacion **y** TX_Unidades (doble ruta) | `fldtJbujGC89f5lFZ` | ⚠ doble ruta |
| `anio_construccion` | **TX_Unidades** | `fldzhntDWwfcy5jwP` | ❌ desalineado |
| `sup_terreno_m2` | **TX_Unidades** | `fld2s1wiRstEiMBY8` | ❌ desalineado |
| `sup_construccion_m2` | **TX_Unidades** | `fldYC1GUSW6xWVscq` | ❌ desalineado |

### 4.4 · Overrides UI
Ambos **existen en schema** y **los lee el DAG** (v32): arreglo puramente UI + persistencia PATCH.
`valor_reposicion_override` (>0) sustituye BG72; `valor_seguro_override` (>0) sustituye BO62.

### 4.5 · Discrepancias
**Bloqueantes (afectan el número):**
- **D-1 (H3):** `H_PreciosUF` sin fila para 2026-09-17 → DAG cae a 38500 → CLP escalados **−3.5%**
  (fuera del ±1%). Fix: poblar tabla + guard.
- **D-2 (H2):** el ítem edificación trae `factor_aplicado=0.96`, pero el default derivable
  (`coefEstado`, estado "Bueno") = **0.95**. Derivar sin override cambiaría `valor_uf` a 8071.09
  (**−1.05%**) → rompe 13/13 ±1%. **El override por ítem de H2 es obligatorio** para reproducir
  MET-6283. ⚠ OK Gate: ¿de dónde sale el 0.96 y cuál es la regla general del factor por defecto?
- **D-3 (FIX RF-09):** sin el fix, en un caso no-tipeado el DAG usa defaults hardcode
  (`anio=año−20`, `supConstr=80`, `supTerreno=150`) → cifra plausible pero incorrecta, sin alarma.

**De trazabilidad (no cambian el número):**
- **T-1:** overrides reposición/seguro aparecen **vacíos/0** en 0066 hoy; el número se sostiene por el
  **cuadro** (BI62 vía `hay_cuadro`), no por los overrides. ⚠ Confirmar si BG72/BO62 se cargaron como
  override o sólo como cuadro.
- **T-2:** el cuadro tiene **doble campo de tipo** — el DAG/fórmula leen `tipo_item`
  (`fld5HVdWpMY0jWqkx`), **no** el legacy `subtipo` (`flddcT2wvPX38pHrE`). La UI de H1/H2 debe escribir
  sobre `tipo_item`.
- **T-4:** `H_PreciosUF.fuente` admite `bcentral` y `Banco Central` (casi duplicado) — normalizar antes
  de que el guard filtre por fuente.

**Valores oráculo confirmados (VP-2026-0066):** cuadro Σ = **20125.86 UF**; `uf_dia_visita`=39894.61;
`avaluo_fiscal_clp`=339 809 429; `sup_terreno`=5024.86; `sup_construccion`=249.91; `anio`=2020;
material=ALBAÑILERÍA LADRILLO.

---

## § 5 · Plan de ejecución paso a paso (con dependencias)

> Orden propuesto para FASE 2. `SECUENCIAL` = espera al anterior; `‖` = paralelizable. Los pasos
> Airtable/motor los ejecuta Sergio manualmente (R12); Claude prepara los diffs de código.

| # | Paso | Tipo | Depende de | Rollback |
|---|---|---|---|---|
| **0** | **Resolver OK Gate §12** (Q1–Q7) — record objetivo, alcance H1/H2, diseño guard, multi-unidad, factor 0.96, fuente UF | **GATE** | — | — |
| **1** | **Backup** del DAG actual (`AT03_backup_pre_tmcp0_<fecha>.js`) antes de tocar `:985` | ‖ | 0 | §9 |
| **2** | **Overrides UI** (arreglo más limpio): `InformeData` + `field-ids.ts` (2 IDs verificados) + 2 `TextField` en `seccion-overrides.tsx` + `hayOverride()` + `camposSolicitud()` + rehidratación en `lectura-datos.ts` | ‖ | 0 | git revert (código local) |
| **3** | **H1** `uf_m2_unitario`: `ItemValoracion` + `nuevoItem()` + input en `seccion-valoracion.tsx` + map en `datos/route.ts` (sobre `tipo_item`, no `subtipo`) | ‖ | 0 | git revert |
| **4** | **H2** `factor_aplicado`: según decisión C-2. Variante A = input por ítem (obligatorio por D-2) | SECUENCIAL | 3 | git revert |
| **5** | **H3-tabla**: poblar `H_PreciosUF` con la fila del día de visita (manual) + normalizar `fuente` | ‖ | 0 | borrar fila |
| **6** | **H3-guard**: reemplazar `\|\| 38500` (`:985`) por guard fail-ruidoso (evento `A_Eventos`; lookup D2 a `H_PreciosUF`) | SECUENCIAL | 1, 5 | repegar backup (paso 1) |
| **7** | **FIX RF-09**: editar `D_TipoDocumentoAtributo` (3 atributos → `una_por_solicitud`/`TX_DatosTasacion`) | ‖ | 0 | revertir filas de config |
| **8** | **Regresión oráculo** (§6 Capa 3): 13/13 terminales vs xlsm ±1% con VP-2026-0066 recalculado por la nueva ruta (UI/cuadro, no tipeo) | SECUENCIAL | 2,4,6,7 | — |
| **9** | **Tests** unit + integración + smoke (§6): 34 bloqueantes en verde | SECUENCIAL | 8 | — |
| **10** | **Screenshots** (§7): Sección G ampliada, cuadro con UF/m², informe/preview, lectura | SECUENCIAL | 9 | — |

---

## § 6 · Batería de tests obligatoria (Agente 3)

> **Convenciones (CLAUDE.md · Testing):** `vitest` 4.1.10, `vitest.config.mts` en raíz, tests
> **co-ubicados**, patrón `vi.mock` + helper `llamar()` + import estático del handler. **No se agregan
> deps de testing.** Referencias: `app/api/tasaciones/[id]/datos/route.test.ts` y
> `app/api/solicitudes/[id]/asignar/route.test.ts`. **Oráculo = §4.** El DAG (Airtable Scripting) no es
> importable por `@/`: sus unit tests corren sobre un **port** de la función bajo prueba; la precedencia
> de overrides (vive en `C_Formulas`) se valida por **integración**.

### HECHO = los 34 tests BLOQUEANTES en verde. Cualquier rojo bloqueante ⇒ DETENER y documentar causa raíz (celda xlsm / línea DAG).

### Capa 1 · UNIT (bloqueante salvo indicado) — port del DAG + helpers
Fixture: 6 filas MET-6283 de `TX_ItemsCuadroValoracion`.

| ID | Verifica | Esperado | Bloq | Archivo co-ubicado |
|---|---|---|---|---|
| U6-01 | **H1** `uf_m2` alimenta `edifNuevo=Σ(sup·uf_m2)` | 8496.94 (CC70) | ✅ | NUEVO `lib/tasador/cuadro-valoracion.test.ts` |
| U6-02 | **H1** ítem con `uf_m2` null no contamina (guard `!isNaN`) | no suma; sin NaN | ✅ | idem |
| U6-03 | **H1** persistencia → columna `uf_m2_unitario` (no otra) | `fields.uf_m2_unitario===valor` | ✅ | caso en `datos/route.test.ts` |
| U6-04 | **H2** `factor_df_calc` derivado de estado | `SCOPE.factor_df_calc===0.95` | ✅ | NUEVO `lib/tasador/factor-df.test.ts` |
| U6-05 | **H2** override por ítem gana al derivado | factor efectivo=0.90 | ✅ | idem · ⚠ Q-B |
| U6-06 | **H2** sin override cae al derivado | factor=derivado | ✅ | idem |
| U6-07 | **H3** lector `uf_dia_visita` **falla ruidoso**, no 38500 | throw nombrando `uf_dia_visita` | ✅ | NUEVO `lib/tasador/uf-dia.test.ts` |
| U6-08 | **H3** camino feliz con tabla poblada | retorna 39894.61 ±0.01 | ✅ | idem |
| U6-09 | **H3** el fallo es observable (evento/log) | escritor `A_Eventos` invocado ×1 | ⚠ no-bloq · Q-A | idem |
| U6-10 | **OVR** `valor_reposicion_override` → columna correcta | `camposSol['valor_reposicion_override']` | ✅ | `datos/route.test.ts` |
| U6-11 | **OVR** `valor_seguro_override` → columna correcta | idem | ✅ | idem |
| U6-12 | **OVR** ausentes no rompen | claves ausentes; PATCH 200 | ✅ | idem |
| U6-13 | **OVR** `_readOpt` de campo inexistente → 0 sin throw | 0 | ✅ | `uf-dia.test.ts` |
| U6-14 | **FIX** los 3 atributos rutean a `TX_DatosTasacion` | destino=TX_DatosTasacion | ✅ | NUEVO `lib/tasador/rf09-enrutamiento.test.ts` |
| U6-15 | **FIX** regresión: config vieja no consume; nueva sí | `TX_DatosTasacion.anio=2020` | ✅ | idem |
| U6-16 | `node --check` del DAG modificado | SYNTAX OK | ✅ | script existente |

### Capa 2 · INTEGRACIÓN (bloqueante) — sandbox `recNiwM4s1ibr3sbO`, corrida manual AT03
| ID | Precondición | Esperado | Bloq |
|---|---|---|---|
| I6-01 | H1/H2 cuadro 6 filas poblado | log `CUADRO: edif=8157.06 edif_nuevo=8496.94` ±0.01 | ✅ |
| I6-02 | `valor_reposicion_override`=9246.94 | BG72=**9246.94** (override gana) | ✅ |
| I6-03 | `valor_seguro_override`=8907.06 | BO62=**8907.06** (override gana) | ✅ |
| I6-04 | ambos overrides retirados | terminales caen al calculado, sin NaN | ✅ |
| I6-05 | **H3** `uf_dia_visita` vacío **y** tabla sin fila | motor **detiene/marca error ruidoso**, no 38500 | ✅ |
| I6-06 | **H3** tabla poblada | `uf_dia_visita` en SCOPE = valor tabla; CLP ±1% | ✅ |
| I6-07 | **FIX** adjunto procesado tras re-enrutamiento | `TX_DatosTasacion` con anio/sup poblados | ✅ |

### Capa 3 · REGRESIÓN CONTRA ORÁCULO (bloqueante) — MET-6283 ±1%
| ID | Terminal | Esperado |
|---|---|---|
| R6-01 | `F_ValorComercialUF` (BI62) | 20 125,86 |
| R6-02 | `F_ValorReposicionUF` (BG72) | 9 246,94 |
| R6-03 | `F_SeguroIncendioUF` (BO62) | 8 907,06 |
| R6-04 | `F_ValorRemateUF` (BG77) | 13 081,81 |
| R6-05 | `F_ValorLiquidacionUF` (BG78) | 16 603,84 |
| R6-06 | `F_AvaluoFiscalUF` | 8 517,68 |
| R6-07 | Cierre agregado 13/13 | 13/13 dentro de ±1% |

> **Diferencia clave con B-0b:** aquí el cierre R6-07 debe conseguirse **con** los inputs por la nueva
> ruta (UI/cuadro), no por tipeo xlsm. Si sólo cierra con valores tipeados, el hueco H1/H2 no está
> cerrado ⇒ rojo.

### Capa 4 · SMOKE / RETROCOMPAT (bloqueante)
- **S6-01** tasación `hay_cuadro=0` → cae al modelo previo, 13 valores idénticos al backup.
- **S6-02** PATCH `/datos` sin los campos nuevos → 200, autoguardado no rebota.
- **S6-03** guard 403 de `/datos` sigue cortando con payload ampliado.
- **S6-04** AT03-Ext con config vieja → no lanza (fix aditivo).
- **S6-05** `diff` DAG pre/post H3 = única diferencia funcional el retiro de `|| 38500` + escritura del guard.

**Conteo:** 34 bloqueantes + 1 no-bloqueante (U6-09) = **35 tests**. Archivos nuevos:
`cuadro-valoracion.test.ts`, `factor-df.test.ts`, `uf-dia.test.ts`, `rf09-enrutamiento.test.ts`, +
casos en `datos/route.test.ts`.

---

## § 7 · Frontend a tocar + screenshots requeridos (Agente 4)

### 7.0 · Mapa de realidad (verificado en repo)
La UI del tasador (IF-03) es un formulario por secciones A–H en `components/tasador/tasacion-form.tsx`,
modelo `InformeData` (`lib/tasador/tasaciones.ts`), que persiste por **autosave**
(`lib/tasador/use-guardado.ts` → `PATCH /api/tasaciones/[id]/datos`) y se sella en **"Calcular Tasación"**
(`handleCalcular`, `tasacion-form.tsx:253`). **No hay botón "Guardar" separado.** Cobertura vs alcance:
- **H1/H2:** `seccion-valoracion.tsx` captura 11 campos por ítem, **no** UF/m² ni factor.
- **H3:** la UF del día no se muestra en ninguna parte; un fallo del guard hoy sería invisible.
- **Overrides:** `seccion-overrides.tsx` expone sólo 3; faltan reposición y seguro (peso del arreglo).
- **FIX RF-09:** sin superficie frontend directa; hoy esos 3 inputs se tipean en Sección B
  (`seccion-propiedad.tsx`).

### 7.1 · Archivos a tocar (resumen)
- **Overrides:** `tasaciones.ts` (interfaz + init) · `seccion-overrides.tsx:41-60` (2 `TextField`) +
  `hayOverride()` (l.14-19) · `validators/index.ts:283-287` · `field-ids.ts:144-148` (2 IDs) ·
  `datos/route.ts:282-286` · `lectura-datos.ts:475-478` (rehidratación).
- **H1:** `tasaciones.ts` (`ItemValoracion`) · `seccion-valoracion.tsx:137-149` · `itemValoracionSchema`
  · `datos/route.ts:411-431`.
- **H2:** según decisión — override por ítem (mismos archivos que H1) o display en `informe-preview.tsx`.
- **H3 display:** `informe-preview.tsx` (mostrar UF del día + `Alert` si el motor no la resolvió) y/o
  la vista post-cálculo (⚠ G-3).
- **FIX RF-09:** `seccion-propiedad.tsx:41-70` — que el prefill respete el valor extraído sin pisar
  edición manual. Sin cambio de layout.

### 7.2 · Diseño de los inputs de override
- **Dónde:** Sección G "Overrides" (`tasacion-form.tsx:491-508`), mismo grid que los 3 existentes.
  Quedan **5 overrides** + textarea de motivo.
- **Control:** `TextField type="number"` en UF: "Valor de reposición override (UF)" y
  "Seguro incendio override (UF)".
- **Validación:** reusar la regla — cualquier override con valor ⇒ **motivo ≥20 caracteres** obligatorio
  (`overridesValidos`, ya conectada al bloqueo). Extender `hayOverride()` basta.
- **Convivencia:** override opcional y aditivo (`override ?? calculado`); la evidencia de que ganó vive
  en el informe (`informe-preview.tsx:400-403`, badge "override" + motivo) — verificar que los 2 nuevos
  entren en esa lista canónica.
- **Regla D:** **no** tienen botón propio; heredan el `disabled` del `fieldset` y el spinner de
  "Calcular Tasación" (ya cumple Regla D, `tasacion-form.tsx:561-607`). **No** añadir botón "Guardar override".

### 7.3 · Rutas a screenshotear (usar VP-2026-0066)
1. **Sección G** antes (3 overrides) / después (5 + motivo). Evidencia núcleo.
2. **Sección C · Cuadro** con UF/m² (y factor si entra).
3. **Estado de bloqueo del motivo** (<20 chars → borde `border-danger` + footer con faltante).
4. **Informe/preview** con overrides reposición/seguro reflejados (bloque 8).
5. **Vista de lectura** confirmando rehidratación (round-trip `datos → lectura-datos → InformeData`).

### 7.4 · Riesgos de UI
- **Footer fijo + portales Select:** `tasacion-form.tsx:533` usa `footer fixed` (barra "Calcular"). La
  restricción §4.4 "no sticky bottom bar" es para el `DetallePanel` de **IF-02**; aquí el footer `fixed`
  **preexiste**. Los inputs de override son `TextField` (sin portal) → no agravan; H1/H2 en Sección C sí
  conviven con Selects — verificar que no se desplace el layout bajo el footer.
- **Base UI, no Radix:** reusar `TextField`/`SelectField` de `fields.ts` (`@base-ui/react`). Tooltip con
  `render` prop (patrón `seccion-valoracion.tsx:156-163`).
- **Mensajes humanos §6:** literales nuevos en 2ª persona, sin exclamaciones, sin nombres Airtable.
- **Autosave silencioso:** confirmar que `use-guardado.ts` emite el toast §6 ante fallo de red (los
  overrides no tienen botón, el error es menos visible).

---

## § 8 · Restricciones y riesgos (Agente 5 · Seguridad)

### 8.1 · Reglas duras aplicables (fuente citada)
| Regla | Fuente | Prohíbe |
|---|---|---|
| **R5 · No tocar lo construido** | plan v1.5 §0.2 (L188) | Editar `components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, rutas IF-04, `lib/*.ts` de IF-02. Los overrides/H1 escriben sólo bajo `app/tasaciones/**`, `components/tasador/**`, `lib/tasador/**`. Reuso sí, edición no (si el reuso exige editar IF-02 → **detener y pedir autorización**). |
| **R7 · Reuso antes de crear** | plan v1.5 §0.2 (L190) | Cambio 100% aditivo. No crear tablas/fórmulas salvo (posible) `M_UF` — que **requiere aprobación explícita** (CLAUDE.md). Recomendación §11: reutilizar `H_PreciosUF`. |
| **R12 · Commits los hace Sergio** | plan v1.5 §0.2 · MEMORY | Claude nunca `git commit/push/checkout -b/merge/revert`. En FASE 1, cero git. |
| **Cero lenguaje IA en UI** | plan v1.5 §0.2 (L191) · CLAUDE.md | Ningún texto UI dice IA/Claude/OCR/modelo. |
| **Cero lógica de negocio en UI** | CLAUDE.md · plan v1.5 (L174) | H2 (factor) se resuelve en el motor, no en el frontend; la UI captura/persiste, no calcula. |
| **Token / escrituras** | CLAUDE.md (RO-30) | El guard H3 no referencia `AIRTABLE_TOKEN`/`process.env`/`NEXT_PUBLIC_*`. MCP sólo lectura. |
| **No AT02 / SC13** | CLAUDE.md (REGLA A · D-15) | Ningún arreglo dispara AT02 ni invoca SC13. |

**Fronteras que NO se tocan:** 13 fórmulas terminales de `REGLA_REFI_CASA_V32`; pipeline PDF E1/E2/E3;
AT01/AT02/AT04/AT08 (deuda OUT); AT03-Ext salvo el re-enrutamiento de los 3 atributos; comparables
(`TX_Comparables`); records reales de cartera (validar en sandbox, nunca VP-2026-0060 ni reales).

### 8.2 · Riesgos por arreglo
| # | Riesgo | Prob | Impacto | Mitigación |
|---|---|---|---|---|
| **H1** | El input persiste en records ya poblados por xlsm (VP-2026-0066), pisando el valor mirror | Media | Alto | Sólo escribir filas nuevas o campo vacío; validar en sandbox antes de tocar records reales (Q-S3) |
| **H2** | `factor` por defecto altera `valor_uf` de **toda** solicitud con `hay_cuadro>0`, no sólo nuevas | Media | Alto | Blindar por `hay_cuadro>0`; regresión ±1% antes de aceptar (Q-S5) |
| **H3-guard** | `H_PreciosUF` mal poblada → guard **bloquea** tasaciones nuevas | Alta | Alto | Proceso de carga diaria (mindicador.cl) como prerequisito; guard emite evento explícito |
| **H3-histórico** | Si el guard es retroactivo, rompe el recálculo de records viejos sin UF en tabla | Alta | Alto | El guard lee primero el `uf_dia_visita` ya persistido y sólo consulta `H_PreciosUF` si está vacío; **no** invalidar valores históricos (Q-S1) |
| **FIX RF-09** | Re-cableado aplicado a records ya poblados contamina valores buenos (hazard SII: avalúo/destino/terna del PDF SII ≠ informe) | Media | Alto | Aplicar **sólo a extracciones nuevas**; nunca pisar `origen_dato="tipeado"`; verificar AT03-Ext v3 desplegada (Q-S2, Q-S6) |
| **Overrides** | Saltan validaciones del motor (rangos) al inyectar valor terminal a mano | Media | Medio | Preservar precedencia v32; registrar `override_motivo`/`override_autor` obligatorio; no suprimen guards de cliente/comuna |

**Riesgo transversal — degradación silenciosa a defaults:** `M_Clientes`/`M_Comunas` caen a
`1.0/0.8/0.045` y `20/40/45` sin aviso. Los 5 arreglos **no** cierran H5/H6/H7 (P1); no crear la falsa
sensación de que multi-cliente queda habilitado. Persiste como riesgo abierto.

### 8.3 · Restricciones FASE 1
Cero writes (Airtable/Make/código/sandbox/git); único write = este archivo; no commit/push/branch;
MCP sólo lectura; no ejecución de ningún arreglo (eso es FASE 2, condicionada al OK Gate).

---

## § 9 · Criterios de rollback por paso

| Paso | Disparador de rollback | Acción |
|---|---|---|
| 2 (Overrides UI) | Build roto / typecheck rojo / test rojo | git revert del cambio local (código no commiteado) |
| 3 (H1) | Regresión del cuadro fuera de ±1% | git revert; el campo Airtable `uf_m2_unitario` ya existía, no se creó nada |
| 4 (H2) | 13/13 rompe por el factor | git revert; volver al tipeo del factor por ítem |
| 5 (H3-tabla) | Fila `H_PreciosUF` errónea | borrar/corregir la fila (dato manual, reversible) |
| 6 (H3-guard) | `SyntaxError` o excepción fatal en smoke (S6-05) | **repegar** `AT03_backup_pre_tmcp0_<fecha>.js` (paso 1) → restaurado <1 min |
| 7 (FIX RF-09) | Multi-unidad roto / regresión de enrutamiento | revertir las filas de `D_TipoDocumentoAtributo` a `una_por_unidad` |

Todo cambio de código es local y no commiteado hasta que Sergio lo apruebe; el rollback de código es
`git checkout -- <archivo>`. El backup del DAG (paso 1) es la red de seguridad del único cambio de motor.

---

## § 10 · Prompt sugerido para FASE 2 (listo para pegar)

```
Ejecutar TANDA T-MC-P0 · FASE 2 sobre rama plan/T-MC-P0. Read/write de código local; NO commit/push
(los hace Sergio). Precondiciones confirmadas por Sergio (OK Gate §12): [pegar respuestas Q1–Q7].

Orden §5, respetando dependencias:
0. Backup del DAG (AT03_backup_pre_tmcp0_<fecha>.js).
1. Overrides UI (valor_reposicion_override fldqpnvfi6ZcWcfQm, valor_seguro_override fldc1bOUK1o5jlWbP).
2. H1 uf_m2_unitario (fldVxo2PfoG7aQ33s) — escribir sobre tipo_item, no subtipo.
3. H2 factor_aplicado (fld7WgYgsicMa42yv) según decisión C-2.
4. H3 tabla H_PreciosUF (fila del día) + guard fail-ruidoso reemplazando ||38500 en AT03_Calculos_DAG.js:985.
5. FIX RF-09: D_TipoDocumentoAtributo (3 atributos → una_por_solicitud/TX_DatosTasacion).

Verificar los 34 tests bloqueantes (§6). HECHO = 34 en verde Y cierre 13/13 vs xlsm MET-6283 ±1%
CONSEGUIDO POR LA NUEVA RUTA (UI/cuadro), no por tipeo. Restricciones duras §8. Rollback §9.
Al cierre: sobreescribir C:\Users\Sergio\Documents\claude-out.txt y avisar para OK Gate de cierre.
```

---

## § 11 · Conflictos entre agentes y resolución

**Ya resueltos por verificación MCP (Agente 2), no requieren a Sergio:**
- **C-1 / OK-b (H1 nombre campo):** el nombre real es **`uf_m2_unitario`** (`fldVxo2PfoG7aQ33s`).
  Persistir por nombre (convención local de `datos/route.ts`) es válido; escribir sobre **`tipo_item`**
  (`fld5HVdWpMY0jWqkx`), no el legacy `subtipo`.
- **C-4 / OK-a (M_UF vs H_PreciosUF):** la tabla existe: **`H_PreciosUF`** (`tblWPRuIYfzdlveHM`),
  campos `fecha`/`valor_clp` (`fldycskkXrywvvIR1`)/`tipo_cambio_usd` (`fldlFxWDnK67OajaE`)/`fuente`.
  **Reutilizar, no crear.** (Confirmar con Sergio que "M_UF" era el nombre coloquial — Q4.)
- **FIELD_IDs overrides:** `valor_reposicion_override`=`fldqpnvfi6ZcWcfQm`,
  `valor_seguro_override`=`fldc1bOUK1o5jlWbP`. Cierra G-1.

**Requieren decisión de Sergio (van al OK Gate):**
| ID | Tema | Recomendación del consolidado |
|---|---|---|
| **C-2 / G-2 / Q-B** | ¿H2 captura el factor por ítem (UI) o lo deriva el motor? | **Captura por ítem (Variante A)** — el motor no debe escribir el factor antes de la fórmula; además D-2 lo exige |
| **C-3** | Semántica del `factor`: `factor_aplicado` de ítem ≠ `factor_depreciacion_override` de solicitud | Documentar; no cablear el override global al ítem |
| **C-5 / Q-A** | Guard H3: D1 (sólo exige `uf_dia_visita≠vacío`) vs D2 (lookup a `H_PreciosUF`); ¿canal del fallo? | **D2** + evento en `A_Eventos` (define si U6-09 es bloqueante) |
| **C-6** | Repuntar RF-09 a `una_por_solicitud` puede romper multi-unidad | **Repuntar a TX_DatosTasacion** (DAG es 1:1); cuidar `anno_construccion` (doble-n) |
| **D-2** | El factor 0.96 del xlsm ≠ 0.95 derivable de "Bueno" | Confirmar origen del 0.96 y la regla general del factor por defecto |
| **G-4** | ¿H1/H2 entran en esta tanda o sólo overrides + display? | Confirmar el corte de alcance frontend |
| **T-1** | Overrides reposición/seguro aparecen vacíos hoy en 0066 | Confirmar si BG72/BO62 se cargaron como override o sólo como cuadro |

---

## § 12 · OK Gate — preguntas para Sergio antes de FASE 2

> **Ninguna se puede resolver leyendo código/schema — requieren decisión de negocio o de operación.**
> Las verificaciones de FIELD_ID ya están cerradas (§11). FASE 2 no arranca hasta responder Q1–Q7.

**Q1 · Alcance frontend (G-4).** ¿La tanda de UI cubre **sólo** los overrides (reposición + seguro) +
display de UF, o también los inputs por ítem de **H1 (`uf_m2_unitario`)** y **H2 (`factor_aplicado`)** en
la Sección C? (El diseño está listo para ambos cortes.)

**Q2 · H2 — origen del factor (C-2 / D-2).** ¿El `factor_aplicado` se **captura por ítem en la UI**
(recomendado; obligatorio para reproducir el 0.96 de MET-6283) o se **deriva en el motor** desde
estado/año/vida útil? Y: **¿de dónde sale exactamente el 0.96** del xlsm (homogeneización D.F.) y cuál es
la regla general del factor por defecto para casos nuevos?

**Q3 · H3 — diseño del guard (C-5 / Q-A).** ¿El guard fail-ruidoso (a) sólo exige que
`TX_DatosTasacion.uf_dia_visita` esté poblado, o (b) hace **lookup a `H_PreciosUF` por fecha de visita**
(recomendado)? ¿El fallo **aborta** el cálculo, **escribe evento en `A_Eventos`**, o ambos? ¿Se aplica
**sólo a tasaciones nuevas** o también al **recálculo de records históricos** sin UF en tabla? (Q-S1.)

**Q4 · H3 — tabla UF.** Se confirma **reutilizar `H_PreciosUF`** (existente) en lugar de crear una tabla
`M_UF` nueva. ¿Correcto? ¿Quién asume la **carga diaria manual** (mindicador.cl) y con qué disciplina?
(Sin escritor diario, el guard bloquea el motor.)

**Q5 · FIX RF-09 — multi-unidad (C-6 / Q-S2 / Q-S6).** ¿Se acepta repuntar `anio_construccion` /
`sup_terreno_m2` / `sup_construccion_m2` a `una_por_solicitud → TX_DatosTasacion` (el DAG es 1:1 por
propiedad), asumiendo que TX_Unidades queda sólo como detalle de intake? ¿El fix se aplica **sólo a
extracciones futuras** (nunca pisar `origen_dato="tipeado"` — hazard SII)? ¿Está **AT03-Ext v3 desplegada**?

**Q6 · Record de validación (Q-S3).** ¿La validación de H1/overrides se hace **sólo en sandbox
`recNiwM4s1ibr3sbO`**, o se editan filas de records reales ya cargados por xlsm (VP-2026-0066)? Confirmar
que ningún record de cartera real se toca.

**Q7 · Trazabilidad de overrides en 0066 (T-1).** Los `valor_reposicion_override` / `valor_seguro_override`
aparecen **vacíos/0** en el registro hoy, pese a que el motivo dice que se cargaron desde xlsm (BG72/BO62).
¿Se cargaron como override o el número se sostiene sólo por el cuadro (`hay_cuadro`/BI62)? Esto define si
los tests I6-02/I6-03 usan overrides o el cuadro como oráculo.

> **Criterio de cierre del Gate:** con Q1–Q7 respondidas, se congela el alcance, se pega el prompt §10 y
> se ejecuta la FASE 2 en el orden §5. HECHO de la tanda = **34 tests bloqueantes en verde** Y **cierre
> 13/13 vs xlsm MET-6283 ±1% conseguido por la nueva ruta (UI/cuadro), no por tipeo**.

---

## § 13 · Respuestas OK Gate — alcance CONGELADO (2026-09-22)

Sergio respondió Q1–Q7. El alcance queda congelado y estas respuestas son **restricciones
vinculantes** para FASE 2 (rama `feat/T-MC-P0`).

- **Q1 · Alcance frontend:** SÍ incluir en Sección C los inputs por ítem `uf_m2_unitario` (H1) y
  `factor_aplicado` (H2), ADEMÁS de los overrides reposición/seguro (G) y el display de UF. La tanda
  no cierra sin H1/H2 en UI.
- **Q2 · Origen del factor:** AMBOS. (a) el motor deriva `factor_df_calc` por defecto desde
  `estado_conservacion` + `anio_construccion` + `vida_util`; (b) la UI permite override por ítem que
  gana sobre el derivado. El 0.96 de MET-6283 se replica vía override por ítem (D-2). El derivado es
  el default cuando el tasador no ingresa override.
- **Q3 · Guard H3:** opción (b) — el motor hace lookup a `H_PreciosUF` por `fecha_visita`. Si no hay
  fila: **falla ruidoso = evento en `A_Eventos` + ABORTA el cálculo** (nada de 38500 ni default).
  Eliminar el `|| 38500` en `AT03_Calculos_DAG.js:985`. Aplica **SOLO a tasaciones nuevas
  post-deploy**; NO retroactivo (los históricos ya calculados quedan intactos).
- **Q4 · Tabla UF:** reutilizar `H_PreciosUF` (`tblWPRuIYfzdlveHM`); NO crear `M_UF`. Carga manual la
  asume Sergio. **Seed obligatorio:** fila 2026-09-17 = 39894.61 (VP-2026-0066) + últimos 30 días.
- **Q5 · FIX RF-09:** SÍ repuntar `anio_construccion`, `sup_terreno_m2`, `sup_construccion_m2` a
  `una_por_solicitud → TX_DatosTasacion`. `TX_Unidades` queda como detalle de intake. Aplica **SOLO a
  extracciones futuras** — jamás pisar `origen_dato=tipeado` (guard obligatorio). Verificar AT03-Ext v3
  desplegada antes de tocar; si no, DETENER.
- **Q6 · Validación:** SOLO SANDBOX. Crear VP-nuevo desde cero + regresión sobre VP-2026-0066
  (`recNiwM4s1ibr3sbO`). CERO writes en records reales de cartera.
- **Q7 · Overrides en 0066:** el número real viene del CUADRO (BI62/BG72/BO62 calculados vía
  `hay_cuadro`). `valor_reposicion_override`/`valor_seguro_override` están vacíos/0 porque el motor no
  los necesita con cuadro válido. Los tests I6-02/I6-03 usan el CUADRO como oráculo, no los overrides.
  El texto "overrides desde xlsm original" en `override_motivo` es legacy sin efecto operativo.

### § 13.1 · Hallazgos de recon FASE 2 que ajustan las respuestas

- **AT03-Ext (Q5):** verificado vía MCP `list_automations` — automation `wflQloTxAcjauDEZ9` "AT03-Ext",
  `deploymentStatus="deployed"`, `configurationStatus="valid"`, sin divergencia draft/deployed. Trigger
  `recordUpdated` sobre `TX_Adjuntos`. **Está desplegada.** El tag literal "v3" no es legible desde la
  metadata → **Sergio debe confirmar que la desplegada es la v3** antes del repunte RF-09.
- **⚠ H_PreciosUF (Q4) — BLOQUEANTE de datos:** la tabla tiene **solo 2 filas**
  (`2026-05-31 → 40610.69`, `2026-04-13 → 39894.61`) y **NO existe fila para 2026-09-17**. El valor
  39894.61 que el plan atribuyó al 2026-09-17 vive en realidad en la fila del **2026-04-13**. No se
  puede sembrar la fila del día de visita (ni 30 días) con datos reales sin una **fuente verificada de
  UF** — y no se inventan valores en una tabla financiera de producción. **Seed H3 BLOQUEADO** hasta
  que Sergio confirme la fecha de visita real de VP-2026-0066 y aporte la serie UF verificada
  (mindicador.cl). La regresión de cierre (§6 Capa 3) que depende del escalado CLP hereda este bloqueo.
