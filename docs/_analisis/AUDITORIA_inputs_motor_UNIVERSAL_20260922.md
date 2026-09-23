# AUDITORÍA UNIVERSAL — Inputs del motor DAG vs. RF-09 vs. UI del tasador

**Fecha:** 2026-09-22 · **Autor:** Sergio (equipo de 5 agentes en paralelo) · **Alcance:** SOLO LECTURA (cero writes en Airtable/Make/código/commits).
**Objetivo:** determinar exactamente qué datos necesita el motor DAG v11.1.1 para calcular una tasación, y para cada dato confirmar si viene de RF-09, si el tasador tiene UI para ingresarlo, o si es un hueco de producto. Enfoque **multi-cliente** (cualquier cliente, no sólo MetLife con xlsm histórico).

**Fuentes leídas:** `AT03_Calculos_DAG.js` (1361 líneas), `AT03-Ext_script.js` (+backup), `AT-RF09-Trigger_script.js`, `AT01-ResolverMotorReglas.js` (stub), `AT08_Alertas_SLA.js`, `VProperty_Motor_Calculo_AT01_AT10_v2_7.md`, `VProperty_Origen_Datos_Informe_v1.7.md`, `SC-RF09-ExtraccionClaude.blueprint.json` (v2.2 async), frontend `components/tasador/**`, `app/api/tasaciones/[id]/**`, `lib/tasador/**`; Airtable vía MCP (`D_TipoDocumentoAtributo`, `C_Formulas`, `TX_*`, `M_*`, `list_automations`). Registro de referencia poblado: **VP-2026-0066 (`recNiwM4s1ibr3sbO`)**.

---

## § 1 — Resumen ejecutivo

- **~33 inputs** distintos consumen las 13 fórmulas terminales del motor (contando primarios, derivados de cuadro, lookups de catálogo y overrides).
- **Fuente por origen:**
  - **RF-09 (extracción documental):** 3 inputs con destino alineado al DAG (`material_predominante`, `calidad_sii`*, `avaluo_fiscal_clp`) — pero *ninguno de los 3 se consume por RF-09 en la práctica del caso auditado* (ver §3, desalineación de rutas).
  - **UI-tasador:** ~17 inputs con captura real (Secciones B, C, G, H del expediente IF-03).
  - **Sistema/catálogo (default, AT01, M_Clientes, M_Comunas, C_*, UF diaria):** ~10 inputs.
  - **Sin UI (HUECO_UI):** **6 inputs** (`avaluo_fiscal_clp`, `tasa_cap_rate` base, `uf_dia_visita`, `valor_reposicion_override`, `valor_seguro_override`, `hay_terreno`).
  - **XLSM histórico:** 0 inputs con lectura directa en el motor — el xlsm es golden-master de regresión; su rol real es que VP-2026-0066 se pobló *tipeando* sus valores a mano (`origen_dato="tipeado"`).
- **Huecos de producto priorizados:** **3 P0** (H1 `uf_m2_unitario` por ítem, H2 `factor`/D.F. por ítem, H3 `uf_dia_visita` sin escritor de sistema), **4 P1**, **3 P2**.
- **Deuda de artefactos:** AT01 real desplegado sin código versionado; AT02/AT04 desplegadas sin script en repo; AT08 en repo sin desplegar; **no existe escenario de "UF diaria"** en ninguna capa.

\* El DAG lee `calidad_construccion` (tasador), **no** `calidad_sii` (RF-09), aunque este último esté marcado `usado_motor_calculo=TRUE`.

---

## § 2 — Tabla completa de inputs

Leyenda fuente: **(a)** RF-09 · **(b)** tasador (UI) · **(c)** sistema/catálogo · **(d)** xlsm histórico · **(e)** desconocido/derivado.

| Input (var SCOPE) | Tabla origen | Fuente | UI Sección | Componente (archivo:línea) | HUECO_UI | Cómo se pobló en VP-2026-0066 |
|---|---|---|---|---|---|---|
| `sup_terreno_m2` | TX_DatosTasacion | b (⚠también a→TX_Unidades) | B | seccion-propiedad.tsx:41-46 | no | 5024.86 · tipeado |
| `sup_construccion_m2` | TX_DatosTasacion | b | B | seccion-propiedad.tsx:47-52 | no | 249.91 · tipeado |
| `anio_construccion` | TX_DatosTasacion | b (⚠a→TX_Unidades) | B | seccion-propiedad.tsx:65-70 | no | 2020 · tipeado |
| `estado_conservacion` → `coef_estado` | TX_DatosTasacion | b | B | seccion-propiedad.tsx:71-76 | no | Bueno (coef 0.95) |
| `material_predominante` | TX_DatosTasacion | a (canónico) / b | B | seccion-propiedad.tsx:86-91 | no | ALBAÑILERÍA LADRILLO · tipeado |
| `calidad_construccion` | TX_DatosTasacion | b | B | seccion-propiedad.tsx:94-98 | no | vacío → default BUENA |
| `agrupacion_propiedad` | TX_DatosTasacion | b | B | seccion-propiedad.tsx:80-85 | no | — |
| `velocidad_venta_estimada` → `lookup_factor_remate` | TX_DatosTasacion | b | B | seccion-propiedad.tsx:216-221 | no | "8 a 10 meses" |
| **Cuadro:** `valor_edificacion_items_uf` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | 8157.06 (BI59) · 6 ítems |
| **Cuadro:** `valor_terreno_items_uf` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | 11218.8 (BI61) |
| **Cuadro:** `valor_occ_items_uf` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | 750 (BI60) |
| **Cuadro:** `valor_edificacion_nuevo_items_uf` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | ≈8497 (CC70) |
| **Cuadro:** `sup_terreno_items_m2` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | 1402.35+3622.51 (AN61) |
| **Cuadro:** `valor_seguro_base_items_uf` | TX_ItemsCuadroValoracion | b (E1) | C | seccion-valoracion.tsx:57-196 | no | ≈8157 (BO62) |
| `hay_cuadro` (flag) | derivado (nFilas>0) | c | — | (derivado en DAG) | no | 1 (6 filas) |
| `uf_m2_unitario` **por ítem** | TX_ItemsCuadroValoracion | **e / d** | C (parcial) | seccion-valoracion.tsx (sin input UF/m²) | **SÍ (H1)** | vía xlsm/tipeo · **HP-1** |
| `factor` (D.F.) **por ítem** | TX_ItemsCuadroValoracion | **e / d** | — | — | **SÍ (H2)** | vía xlsm/tipeo · **HP-2** |
| `arriendo_bruto_mensual_clp` | TX_DatosTasacion (`arriendo_mensual`) | b | H | tasacion-form.tsx:513-519 | no | 0 / no poblado |
| `gasto_anual_clp` | TX_DatosTasacion (`gasto_anual`) | b | H | tasacion-form.tsx:520-526 | no | 0 |
| `tasa_cap_rate_override` | TX_DatosTasacion | b | G | seccion-overrides.tsx:42-47 | no | 0 |
| `vida_util_override` | TX_DatosTasacion | b | G | seccion-overrides.tsx:48-53 | no | 0 |
| `valor_final_override` | TX_Solicitudes | b | G | seccion-overrides.tsx:54-59 | no | 0 (BI62 se cargó por xlsm) |
| `override_motivo` / `override_autor` | TX_Solicitudes | b | G | seccion-overrides.tsx:62-76 | no | "overrides desde xlsm original" |
| **`avaluo_fiscal_clp`** | TX_DatosTasacion | a (canónico SII) | — | — | **SÍ (H8)** | 339.809.429 · **tipeado**, no RF-09 |
| **`tasa_cap_rate`** (base) | TX_DatosTasacion / M_Clientes | c | — | — | **SÍ (H5)** | 0.045 · tipeado |
| **`uf_dia_visita`** | TX_DatosTasacion | c (UF diaria) | — | — | **SÍ (H3)** | 39894.61 · sin escritor de sistema |
| **`valor_reposicion_override`** | TX_Solicitudes | b (juicio) | — | — | **SÍ** | BG72 · cargado por xlsm |
| **`valor_seguro_override`** | TX_Solicitudes | b (juicio) | — | — | **SÍ** | BO62 · cargado por xlsm |
| `hay_terreno` | TX_DatosTasacion | b | — | — | SÍ (menor) | default TRUE |
| `coef_tipo` | TX_DatosTasacion | c | — | — | no (deriv) | 1.0 default |
| `factor_seguro` / `factor_garantia` | M_Clientes | c | — | (catálogo cliente) | no | 1.0 / 0.8 (MetLife) |
| `tasa_cap_rate` (cliente) | M_Clientes | c | — | (catálogo) | no | 0.045 default |
| `uf_m2_terreno/construccion/promedio_residencial` | M_Comunas | c | — | (catálogo comuna) | no | Colina · default 20/40/45 |
| `lookup_vida_util` | C_VidaUtil | c | — | (lookup DAG) | no | fallback 60 |
| `uf_m2_nuevo_lookup` / `lookup_precio_unitario` | C_PreciosUnitarios | c | — | (lookup DAG) | no | fallback = uf_m2_construccion (40) |
| `lookup_factor_remate` | C_Factores | c | — | (lookup DAG) | no | 0.65 base |
| `porcentaje_bien_comun` | C_TramosBienComun | c (sólo Depto) | — | (lookup DAG) | no | 0 (0066 es Casa) |
| `sum_obras_complementarias_uf` | TX_ObrasComplementarias | c/e | — | (tabla legado) | no | 0 (no poblada) |
| `regla_aplicada` (link) | TX_Solicitudes → C_ReglasNegocio | c (PATCH manual; AT01 no impl.) | — | — | no | REGLA_REFI_CASA_V32 |
| `tasa_cap_rate_efectivo` (compuesto) | override>datos>cliente | e (deriv) | — | (DAG:1040-1041) | no | 0.045 |

> **13 fórmulas terminales** ejecutadas por `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`): Ingreso Líquido Anual CLP, Renta Perpetua CLP, Valor Comercial UF (BI62) y CLP, Valor Reposición UF (BG72) y CLP, Seguro Incendio UF (BO62) y CLP, Avalúo Fiscal UF, Valor Remate UF (BG77) y CLP, Valor Liquidación UF (BG78) y CLP. Las expresiones viven en `C_Formulas` (`tblNFa454fBbqRB3t`), no en el `.js`; AT03 es lector/ejecutor genérico (`safeEval`). **Todo identificador no presente en el SCOPE se resuelve a `0` silenciosamente** (DAG:551) — la exhaustividad del SCOPE es la garantía de correctitud.

---

## § 3 — GAPS por escenario: MetLife vs. Cliente Nuevo

**Hallazgo central:** la solución funciona para MetLife no porque el producto esté completo, sino porque la **planilla xlsm actúa de "fuente fantasma"** que rellena en Airtable (por tipeo manual) exactamente los inputs que ni la UI del tasador ni RF-09 saben capturar. VP-2026-0066 tiene `origen_dato="tipeado"` y `override_motivo` = *"overrides desde xlsm original (Portada BI62/BG72/BO62)"*.

| Gap | MetLife (con xlsm) | Cliente nuevo (sin xlsm) |
|---|---|---|
| `uf_m2_unitario` + `factor` por ítem del cuadro | Mirror-xlsm válido (columnas tipeadas) | **BLOQUEANTE** — es la ruta principal (`hay_cuadro>0`); sin UI ni RF-09 no se puede valorar |
| `uf_dia_visita` | Se copia UF del día (frágil) | **BLOQUEANTE latente** — cliente-agnóstico pero sin escritor → default 38500 corrompe todos los CLP |
| `factor_seguro` / `factor_garantia` / `tasa_cap_rate` | OK (fila MetLife en M_Clientes) | **BLOQUEANTE si el cliente no está dado de alta** — DAG degrada a defaults hardcode (1.0/0.8/0.045) sin aviso |
| `uf_m2_*` de M_Comunas | OK (comunas MetLife pobladas) | Parcial — bloqueante en comunas fuera de cobertura; default 20/40/45 silencioso |
| Marca/logo de portada | Hardcode válido (Austral Leasing) | **BLOQUEANTE de entregable** — sin parametrizar por cliente |
| `avaluo_fiscal_clp` | Tipeado desde SII | OK vía RF-09 (SII cliente-agnóstico) *si se cablea a TX_DatosTasacion* |

**Desalineación RF-09 ↔ DAG (crítica).** `anio_construccion`, `sup_terreno_m2` y `sup_construccion_m2` están marcados `usado_motor_calculo=TRUE`, pero RF-09/AT03-Ext los rutea a **`TX_Unidades`** (`una_por_unidad`), mientras el DAG los **lee desde `TX_DatosTasacion`** (1:1). El motor no consume esa extracción; hoy los toma del tasador/tipeo. Solo `material_predominante` y `avaluo_fiscal_clp` tienen destino RF-09 alineado (TX_DatosTasacion) — y aun así en 0066 fueron tipeados. **Comparables (TX_Comparables):** RF-09 extrae 13 atributos, pero el DAG del repo **no los lee** — el promedio de comparables no está implementado en este motor.

---

## § 4 — Huecos de producto priorizados

| ID | Hueco | Prioridad | Solución propuesta (multi-cliente) | Esfuerzo | Dependencias |
|---|---|---|---|---|---|
| **H1** | `uf_m2_unitario` por ítem del cuadro | **P0** | Nuevo campo UI (input UF/m² por ítem) en `seccion-valoracion.tsx` + persistir en PATCH `datos/route.ts` | M | Contrato PATCH TX_ItemsCuadroValoracion; fórmula `valor_total_uf` |
| **H2** | `factor` (D.F./homogeneización) por ítem | **P0** | Regla en el motor: derivar `factor_df_calc` por defecto (anio+vida_util+estado) + input opcional de override por ítem | M | H1; fórmula `valor_total_uf` |
| **H3** | `uf_dia_visita` sin escritor de sistema | **P0** | Escenario Make/AT "UF diaria" que escriba `uf_dia_visita` (y `tipo_cambio_usd`) al programar/cerrar visita; DAG debe fallar ruidoso en vez de default 38500 | S | Tabla `H_PreciosUF`/`C_UF` cargada diariamente (mindicador.cl) |
| **H5** | `tasa_cap_rate` base sin captura (solo override) | **P1** | Decisión de negocio: exigir alta `M_Clientes` (tasa/factores) como prerequisito de onboarding | S | Proceso alta cliente |
| **H6** | `factor_seguro`/`factor_garantia` degradan a default | **P1** | Guard en motor que falle ruidoso (evento `A_Eventos`) si el cliente no tiene factores poblados | S | Igual que H5 |
| **H7** | `uf_m2_*` de M_Comunas fuera de cobertura | **P1** | Ampliar M_Comunas + guard "comuna sin precios unitarios" | M | Cobertura geográfica por cliente |
| **H9** | Marca/logo por cliente en portada | **P1** | Dato maestro `C_VariablesCliente.logo_url` + `nombre_revisor` leídos por pipeline Carbone | M | Pipeline PDF (IF-04); brechas B2/B7 Origen v1.7 |
| **H4** | Rentabilidad (`arriendo`/`gasto`) obligatoria o no | **P2** | Decisión: marcar rentabilidad opcional por `tipo_informe` (motor ya tolera 0) | S | — (UI ya existe) |
| **H8** | `avaluo_fiscal_clp` — cablear RF-09→TX_DatosTasacion + regla portada | **P2** | Confirmar extracción RF-09 al destino que el DAG lee; cerrar regla de avalúo de portada | S | Decisión §6-inconsist.8 Origen v1.7 |
| **H10** | `TX_Unidades` poblada por AT03-Ext pero no leída por el DAG | **P2** | Documentar/verificar enrutamiento; decidir si el motor debe leer TX_Unidades | S | Acceso AT03-Ext en Make |

**Overrides faltantes en UI (parte de H1/H2 en la práctica):** la sección G solo expone 3 overrides (cap_rate, vida_util, valor_final). Faltan **`valor_reposicion_override`** y **`valor_seguro_override`** (activos en v32, cargados por xlsm en 0066). Añadirlos a `seccion-overrides.tsx` + `InformeData`.

---

## § 5 — Deuda de artefactos

**En producción SIN código versionado en repo:**
- **AT01_Motor_Reglas** (`wflY6ytBBJSdwYskI`, trigger `estado=creada`) — **desplegada y activa**, pero el único artefacto en repo (`AT01-ResolverMotorReglas.js`) es un stub que hace `throw`. El repo contradice la realidad: hay un AT01 corriendo cuyo código real no está versionado.
- **AT02_Asignar_Tasador** (`wflgFmIovhugw4q5x`, undeployed) — sin script en repo. Riesgo: si se despliega, colisiona con el guard 409 de `asignar/route.ts`.
- **AT04_Validar_Rangos** (`wflNt78DONF9kZi9K`, undeployed, trigger recordCreated en `tblFz37KSvn5pLKDR`) — sin script ni mención en repo; tabla no mapeada en CLAUDE.md.

**En repo SIN correlato en producción:**
- **AT08_Alertas_SLA.js** — script completo, **no existe** en `list_automations`. El reloj SLA / recordatorios (§5.2.8) siguen sin escritor (consistente con CI-005/CI-037).
- **SC-Adjuntos-Upload**: dos versiones en carpetas distintas (`produccion-actual/` v1.1 desactualizada vs `make/` v1.7) — fuente de confusión sobre cuál es la verdad.

**Coherentes (repo = producción, verificado):** AT03-Ext (byte-idéntico, v3 11-sep-2026), AT-RF09-Trigger + AT-RF09-Trigger-Update (watch fields confirmados: recordCreated; `estado_extraccion`+`clave_adjunto`).

**AT03-Ext cardinalidad:** enrutamiento coherente — `una_por_solicitud` (1:1 por link), `una_por_unidad` (resuelve TX_Unidades con fallback), `muchas_por_solicitud` (upsert idempotente por `clave_natural`, guard anti-merge). Deuda propia declarada: A-45 (sin purga de comparables huérfanos), 3 supuestos "escritos pero no probados contra Airtable real".

**"UF diaria" — no existe.** Confirmado por triple vía: no hay automation cron (salvo AT08 inexistente), ningún blueprint hace fetch a mindicador/uf.cl, y el motor cae a fallback hardcode `38500` (DAG:985). Es un hueco de sistema: input crítico servido por dato manual con degradación silenciosa.

---

## § 6 — Recomendación consolidada del equipo

El motor DAG v11.1.1 está aritméticamente sólido y bien encapsulado (lee expresiones de `C_Formulas`, arma un SCOPE y evalúa), pero su operación multi-cliente hoy depende de una **"fuente fantasma"**: la planilla xlsm de MetLife, cuyos valores se tipean a mano en Airtable para rellenar precisamente los inputs que ni la UI del tasador ni RF-09 capturan. Para habilitar cualquier cliente sin xlsm hay que cerrar **tres huecos P0** —los dos campos económicos del cuadro de valoración (`uf_m2_unitario` y `factor`, que sostienen la ruta de cálculo principal y hoy no tienen ni UI ni extracción) y `uf_dia_visita` (que escala todos los valores monetarios y carece de escritor automático)—, ninguno de los cuales resuelve RF-09. En paralelo, la segunda capa de riesgo (P1) no es de captura sino de **onboarding de datos maestros**: `M_Clientes` y `M_Comunas` degradan a defaults hardcode silenciosos, produciendo cifras plausibles pero incorrectas sin ninguna alarma. La recomendación es doble: **(a)** cerrar H1–H3 como prerequisito técnico de go-live multi-cliente (una tanda de UI + un escenario Make de UF diaria), y **(b)** convertir el alta de cliente en un gate formal con un guard en el motor que **falle ruidosamente** (evento en `A_Eventos`) en vez de caer a default cuando falten factores de cliente o precios de comuna. Adicionalmente conviene sanear la **deuda de artefactos** (versionar el AT01 real, documentar AT02/AT04, decidir el destino de AT08) y **corregir la desalineación de rutas RF-09→TX_Unidades vs. lectura del DAG en TX_DatosTasacion**, hoy la razón por la que la extracción documental no llega al motor. Con eso, el producto pasa de "afinado para MetLife" a "configurable por cliente", que es el objetivo estratégico declarado.

**Estado:** AUDITORÍA CERRADA · esperando decisión de Sergio.
