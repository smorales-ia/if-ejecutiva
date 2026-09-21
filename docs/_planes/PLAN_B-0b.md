# PLAN DE EJECUCIÓN — Tanda B-0b · Desbloqueo del motor MET-6283

> **Fase 1 · Planificación** (2026-09-21). Documento consensuado por equipo de 5 agentes en paralelo.
> Rama del plan: `plan/b-0b`. Oráculo: `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` (hoja **Portada**).
> Estado anterior: **B-0a cerrada** (DAG editado + patches preparados; nada ejecutado en Airtable · `feat/motor-b0-dag-cuadro`).
> **Este plan NO ejecuta nada.** Es entregable para OK Gate de Sergio antes de Fase 2.

---

## § 1 · Resumen ejecutivo

B-0b materializa en Airtable el trabajo aditivo preparado en B-0a: pega el DAG `AT03_v11.1.1_v32b0`
(lector `sumCuadroValoracion`), aplica los patches `C_Formulas` v3.3 (P1/P2/P3 + chain P1a-d si aplica),
retrocarga 6 filas del cuadro en la sandbox MET-6283 (VP-2026-0066 · `recNiwM4s1ibr3sbO`), fija la regla
`REGLA_REFI_CASA_V32`, retira los 3 overrides y corre regresión de 13 valores (±1 %). Es **100 % backend
de Airtable**: no toca código de la app, sólo re-validación visual del preview de informe (P9-TAS).

---

## § 2 · Alcance — qué SÍ / qué NO se toca

### SÍ se toca (todo en Airtable, manualmente por Sergio · R12)
- Automation **AT03** — pegar `AT03_Calculos_DAG.js` v11.1.1_v32b0 (`docs/_artefactos/airtable/AT03_Calculos_DAG.js`).
- Tabla **`C_Formulas`** (`tblNFa454fBbqRB3t`) — editar filas existentes P1/P2/P3 (+P1a-d), bump `version`→v3.3.
- Tabla **`TX_ItemsCuadroValoracion`** (`tblCxnMtOETK2ulD0`) — insertar 6 filas de retrocarga en la sandbox.
- Registro sandbox **`recNiwM4s1ibr3sbO`** (VP-2026-0066) — `regla_aplicada`, retirar 3 overrides, forzar `estado→visitada`.

### NO se toca (INNEGOCIABLE)
- **Código IF-02 / IF-03 / IF-04** (R5 · plan v1.5 §0.2 L188): `components/console/**`, `app/api/solicitudes/**`,
  `app/(ejecutiva)/**`, rutas IF-04, `lib/*.ts` de IF-02. Verificado: la rama sólo tocó `docs/` (Agente 5 · `git diff --name-only main...HEAD`).
- **`REGLA_REFI_CASA_V32.formulas_resultado`** — las 13 terminales se listan, no se editan (FASE_B0 §6.3 · FASE_B L83-85).
- **P5** `F_ValorRemateUF` / `F_ValorLiquidacionUF` (`recCjbaxfXQELCfj9` / `recSYwQqRULkqYimi`) — arrastran solos, sin cambio (FASE_B0 §2 L60-63).
- **Overrides** de cualquier solicitud distinta de la sandbox; datos productivos ajenos a MET-6283.
- **Pipeline PDF E1/E2/E3** y esquema de `TX_ItemsCuadroValoracion` (salvo despublicado legacy diferido · FASE_B0 §6.4).
- **Frontend**: cero cambios de código (Agente 4, veredicto).

---

## § 3 · Diseño técnico consolidado (Agente 1 · Arquitecto)

**Secuencia de lo que se toca**
1. **Pegar DAG v11.1.1_v32b0 en AT03** (FASE_B0 §7 L113-130): backup del script actual → reemplazar
   (`MOTOR_VERSION='AT03_v11.1.1_v32b0'`, DAG L72) → verificar input `recordId` → smoke con
   `recNiwM4s1ibr3sbO` esperando log `CUADRO:` (L137-147).
2. **(Fallback, paralelizable)** normalizar material en `lookupUFm2Nuevo` (DAG L99-105); no bloquea MET-6283.
3. **Patches `C_Formulas`** (`tblNFa454fBbqRB3t`): `version`→v3.3 (`fld9xL0HvDxOa04i4`), `expresion` (`fldyPzdE1wyXlXPjU`):
   - P1 `F_ValorComercialUF` `rec8rv76smtjQh4Rb` (BI62) — L39-42.
   - P2 `F_ValorReposicionUF` `reckDXGPbkDVjzPjY` (BG72) — L43-46.
   - P3 `F_SeguroIncendioUF` `recZTfJX0MJ0r1tHP` (BO62) — para Casa factor ×1, exacto (L53-58).
   - P1a-d (chain, sólo si corre v3.1): `recsYqh0ssRR0mUJo` / `recHNKyfGDBV4Hxu3` / `recNvuDLjUpr0re89` / `recl2rsrDf7XqNKTI` (L67-81).
4. **Retrocargar sandbox**: 6 filas en `TX_ItemsCuadroValoracion` (2 Terreno + 1 Edificacion + 3 OCC · FASE_A L79-90, L182-256).
5. **PATCH** `regla_aplicada=REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`) → retirar los 3 overrides → forzar `estado→visitada` → recálculo → regresión ±1 % (13 valores · FASE_B L110-124).

**Contratos entre capas**
`TX_ItemsCuadroValoracion` → **`sumCuadroValoracion(recId)`** (DAG L916-954) agrupa `valor_total_uf`
(`fld1F3u5J5NlnJUjY`) por `tipo_bien` (`fld5HVdWpMY0jWqkx`) e inyecta al SCOPE (DAG L1057-1064) 7 variables:
`valor_edificacion_items_uf` (BI59), `valor_edificacion_nuevo_items_uf` (CC70), `valor_terreno_items_uf` (BI61),
`valor_occ_items_uf` (BI60, por exclusión L951), `sup_terreno_items_m2` (AN61), `valor_seguro_base_items_uf` (BO62),
`hay_cuadro` (L1064). Las consumen los terminales **F_ValorComercialUF / F_ValorReposicionUF / F_SeguroIncendioUF**
con el patrón `hay_cuadro>0 ? cuadro : modelo_previo`. `REGLA_REFI_CASA_V32` lista las 13 terminales sin cambio.

**Orden de dependencias**
- **Secuencial obligatorio**: paso 1 (DAG+smoke) → paso 3 (patches) → paso 4 (retrocarga) → paso 5 (regla + retirar overrides → recálculo → regresión). El SCOPE debe existir antes de que las fórmulas v3.3 lo lean; los overrides no se retiran hasta que DAG+patches+datos estén en su sitio (FASE_B L167).
- **Paralelizable / diferible**: paso 2 (normalización material) y el despublicado legacy son independientes de la ruta MET-6283 (tiene cuadro).

**[INFERIDO]** `REGLA_REFI_CASA_V32` / `recYEf9XepX4SmLnH` no figura en `schema-airtable.md`; su ID y "13 terminales" provienen de FASE_B0 (L36, L84, L167), no verificados contra `C_ReglasNegocio` en solo-lectura.

---

## § 4 · Tabla oráculo completa (Agente 2 · verificada contra el xlsm con openpyxl)

### 4.A · Variables SCOPE inyectadas por el DAG

| Variable SCOPE | Valor esperado | Celda / línea | Fuente | Discrepancia |
|---|---|---|---|---|
| `valor_edificacion_items_uf` | **8.157,0624** | `Portada!BI59` · DAG L942, L1058 | xlsm verificado | No (redondeo doc 8.157,06) |
| `valor_edificacion_nuevo_items_uf` | **8.496,94** | `Portada!CC70` · DAG L947, L1059 | xlsm verificado | ⚠ D-1 (CC70 no incluye "Ampl No Reg."; DAG sí sumaría) |
| `valor_terreno_items_uf` | **11.218,80** | `Portada!BI61` · DAG L939, L1060 | xlsm verificado | No |
| `valor_occ_items_uf` | **750** | `Portada!BI60` (exclusión) · DAG L951, L1061 | xlsm verificado | No |
| `sup_terreno_items_m2` | **5.024,86** | `Portada!AN61` · DAG L941, L1062 | xlsm verificado | No |
| `valor_seguro_base_items_uf` | **8.907,0624** | `Portada!BO62` · DAG L936, L1063 | xlsm verificado | ⚠ D-3 (×0,8 no modelado; ×1 Casa → exacto) |
| `hay_cuadro` | **1** | flag DAG L1064 | INFERIDO (control) | No |

### 4.B · Resultados terminales (13 valores)

| Terminal | Valor esperado | Celda / origen | Fuente | Discrepancia |
|---|---|---|---|---|
| `F_ValorComercialUF` | **20.125,8624** | `Portada!BI62` = edif+terreno+occ · Patch P1 | xlsm verificado | No |
| `F_ValorComercialCLP` | 802.913.431 | BI62 × 39.894,61 | DOC | No verificable en Portada |
| `F_ValorReposicionUF` | **9.246,94** | `Portada!BG72` = `IF(AN61=0, CD37*0,8+CC46, CD37+CC46)` · Patch P2 | xlsm verificado | ⚠ D-1 (doc atribuye CC70+BI60; idéntico numérico) |
| `F_SeguroIncendioUF` | **8.907,0624** | `Portada!BO62` · Patch P3 | xlsm verificado | ⚠ D-3 |
| `F_AvaluoFiscalUF` | **8.517,68** | `339.809.429 / 39.894,61` | DOC | No |
| `F_ValorRemateUF` | **13.081,81** | `Portada!BG77` = `AP69*AU77` · P5 sin cambio | xlsm verificado | ⚠ D-2 (no literal "comercial×0,65"; idéntico) |
| `F_ValorLiquidacionUF` | **16.603,8365** | `Portada!BG78` = `AP69*AU78` · P5 sin cambio | xlsm verificado | ⚠ D-4 (doc dice 16.603,84; dentro de ±1 %) |
| `F_ValorRemateCLP` | 521.893.730 | BG77 × UF | DOC | No |
| `F_ValorLiquidacionCLP` | 662.403.581 | BG78 × UF | DOC | No |
| `F_IngresoLiquidoAnualCLP` | 36.300.000 | TX_DatosTasacion (arriendo/gasto) | DOC | No (no ruta del cambio) |
| `F_RentaPerpetuaCLP` | 806.666.667 | ingreso / tasa_cap 0,045 | DOC | No (no ruta del cambio) |
| `F_ValorComercialCLP` / `F_ValorReposicionCLP` / `F_SeguroIncendioCLP` | ver Plan §Cierre | UF × 39.894,61 | DOC | No |

**Contexto verificado en xlsm**: `BD61`=2,2327 (UF/m² terreno efectivo, ligado a Bloqueo #3), `CD37`=8.496,94, `CC46`=750, `CC70`=8.496,94, `BI60`=750.

### 4.C · Discrepancias detectadas (todas de trazabilidad; ninguna mueve el número final en MET-6283)

- **D-1** `F_ValorReposicionUF`: doc dice `BG72=CC70+BI60`; fórmula literal `IF(AN61=0, CD37*0,8+CC46, CD37+CC46)`. Numéricamente idéntico. Además CC70 no incluye "Ampl No Reg." mientras el DAG sí la sumaría → **divergencia latente** en predios con ampliación no regularizada con superficie.
- **D-2** Remate/Liquidación: xlsm usa `AP69*AU77/78` (factor de velocidad), no literal `comercial×0,65 / ×0,825`. Resultado equivalente.
- **D-3** `F_SeguroIncendioUF`: multiplicador ×0,8 de garantía (NO-Casa / cliente fuera de lista) no está en el SCOPE. Para Casa (MET-6283) es ×1 → exacto. **Riesgo real al generalizar**, no bloqueante para este caso.
- **D-4** `PLAN_PRUEBA §Cierre` lista 16.603,84; xlsm = 16.603,8365 (redondeo, dentro de ±1 %). En §5 del mismo plan la etiqueta "Reposición 11.218,80" es en realidad el **terreno (BI61)** (etiqueta cruzada en línea de contexto; la tabla de 13 sí trae 9.246,94).
- **D-5** `PLAN_PRUEBA §5` rotula "8.157,06 / 9.255,51" como Liquidación/Reposición: 8.157,06 es edificación depreciada (BI59) y 9.255,51 no aparece en ninguna celda auditada (posible typo; reposición real 9.246,94). No afecta patches ni DAG.

---

## § 5 · Plan de ejecución paso a paso (con dependencias)

> Ejecuta **Sergio** manualmente en Airtable (R12). Claude sólo prepara y verifica. Todos los pasos son SECUENCIALES salvo los marcados ‖ (paralelizables/diferibles).

| # | Paso | Depende de | Tests que lo cubren |
|---|---|---|---|
| **0** | **Backup del DAG actual** de AT03 (`AT03_backup_pre_b0_<fecha>.js`) antes de tocar nada | — | Rollback §9 |
| **1** | **Pegar DAG v11.1.1_v32b0** en Automation AT03; verificar input `recordId`; cabecera `AT03_v11.1.1_v32b0` | 0 | U-09, U-10, S-04 |
| **2** | **Smoke sin cuadro** con `recNiwM4s1ibr3sbO` (overrides puestos, cuadro sin poblar): log `CUADRO: filas=0`, `FIN OK`, sin `SyntaxError` | 1 | I-01, I-02, I-03, S-01, S-02 |
| **3** | **Aplicar patches `C_Formulas`** P1/P2/P3 (+P1a-d si chain v3.1), bump `version`→v3.3 | 2 | (verifica en 6) |
| **4** | **Retrocargar 6 filas** en `TX_ItemsCuadroValoracion` para la sandbox | 3 | I-04, I-05 |
| **5** | **PATCH** `regla_aplicada=REGLA_REFI_CASA_V32` → **retirar 3 overrides** → forzar `estado→visitada` → recálculo | 4 | I-06, I-07 |
| **6** | **Regresión oráculo**: 13 valores vs xlsm (±1 %) + verificar variables SCOPE del log `CUADRO:` | 5 | R-01…R-14 (R-15/R-16 según OK Gate) |
| **7** | **Retrocompat**: correr una tasación **sin cuadro** → cae al modelo previo, 13 valores idénticos a v11.0 | 1 | R-17, R-18, S-03, S-05 |
| **8** | **Re-validación visual frontend** (P9-TAS preview + P8-TAS avance) con MET-6283 recalculado | 6 | §7 (screenshots) |
| **P** ‖ | **(Paralelizable)** normalización material en `lookupUFm2Nuevo` (fallback global) | 1 | validar no altera claves OK |
| **L** ‖ | **(Diferible)** despublicado de campos legacy en `TX_ItemsCuadroValoracion` — **sólo tras** verificar que E1/IF-03 no los usan (FASE_B0 §6.4) | 4 | S-03 |

**Resumen de paralelización en Fase 2**: 9 pasos secuenciales core (0–8) + **2 paralelizables/diferibles** (P, L) = **11 pasos totales**. Los pasos 7 y P pueden correr en paralelo con la rama principal una vez pegado el DAG (paso 1).

---

## § 6 · Batería de tests obligatoria (Agente 3) — HECHO = TODOS LOS BLOQUEANTES EN VERDE

> Convenciones (CLAUDE.md §Testing): `vitest` 4.1.10, `vitest.config.mts` (alias `@/`), co-ubicación, `node --check` para el DAG (envuelto en `async`). No se agregan dependencias de testing. La lógica de `sumCuadroValoracion` es scripting de Airtable (no importable por `@/`): los unit tests corren sobre una **réplica/port** del bloque L916-954 **[INFERIDO]**.

### Capa 1 · UNIT (bloqueante) — fixture 6 filas MET-6283
| ID | Paso | Criterio | Tol. |
|---|---|---|---|
| U-01 | Suma Terreno (DAG L938-941) | 11.218,80 (BI61) | ±0,01 UF |
| U-02 | Suma Edificacion (L942-948) | 8.157,06 (BI59) | ±0,01 UF |
| U-03 | Edif a nuevo `Σ(sup·uf_m2)` (L947) | 8.496,94 (CC70) | ±0,01 UF |
| U-04 | OCC por exclusión (L951) | 750 (BI60) | ±0,01 UF |
| U-05 | `Σ(superficie)` Terreno (L940) | 5.024,86 (AN61) | ±0,01 m² |
| U-06 | Suma `seguroBase` (L935-936) | 8.907,06 (BO62) | ±0,01 UF |
| U-07 | Fixture vacío → `hay_cuadro=0`, `nFilas=0` (L917, L1064) | ==0 | exacto |
| U-08 | `tipo_bien` no reconocido → cae en OCC por exclusión (L949) | exacto | exacto |
| U-09 | `node --check` del DAG envuelto en async (L27) | `SYNTAX OK`, exit 0 | — |
| U-10 | Cabecera versión (L4, L72) | `AT03_v11.1.1_v32b0` | match |

### Capa 2 · INTEGRACIÓN (bloqueante) — sandbox `recNiwM4s1ibr3sbO`, corrida manual en la Automation
| ID | Precondición | Criterio |
|---|---|---|
| I-01 | DAG pegado, cuadro sin poblar | log `CUADRO: filas=0`, corrida idéntica a v11.0 |
| I-02 | Igual | `[AT03_v32] FIN OK` (L1361), sin excepción |
| I-03 | Igual | estado→`calculada` o `WARN transicion` no fatal (L1303-1307) |
| I-04 | 6 filas retrocargadas | log `filas=6 edif=8157.06 edif_nuevo=8496.94 terreno=11218.8 occ=750 sup_terreno=5024.86 seguro_base=8907.06` (±0,01) |
| I-05 | Igual | 6 vars + `hay_cuadro=1` en SCOPE (L1057-1064) |
| I-06 | `regla_aplicada=REGLA_REFI_CASA_V32` | log `REGLA formulas_resultado` = 13 terminales v3.2, no set v3.1 |
| I-07 | Igual | `TX_Calculos`: 13 filas (`calculosEscritos=13`, L1293), sin `WARN` |

### Capa 3 · REGRESIÓN CONTRA ORÁCULO (bloqueante salvo indicado) — overrides retirados, tol. de cierre ±1 %
**3a variables SCOPE** (log `CUADRO:`): R-01 BI59 8.157,06 · R-02 CC70 8.496,94 · R-03 BI61 11.218,80 · R-04 BI60 750 · R-05 AN61 5.024,86 · R-06 BO62 8.907,06 · R-07 `hay_cuadro`=1. (±0,01 UF / exacto)
**3b terminales** (de `TX_Calculos.valor_calculado`, ±1 %):
| ID | Terminal | Esperado | Bloq. |
|---|---|---|---|
| R-08 | `F_ValorComercialUF` (BI62) | 20.125,86 | ✅ |
| R-09 | `F_ValorComercialCLP` | 802.913.431 | ✅ |
| R-10 | `F_ValorReposicionUF` (BG72) | 9.246,94 | ✅ |
| R-11 | `F_SeguroIncendioUF` (BO62) | 8.907,06 | ✅ |
| R-12 | `F_AvaluoFiscalUF` | 8.517,68 | ✅ |
| R-13 | `F_ValorRemateUF` (BG77) | 13.081,81 | ✅ |
| R-14 | `F_ValorLiquidacionUF` (BG78) | 16.603,84 | ✅ |
| R-15 | `F_IngresoLiquidoAnualCLP` | 36.300.000 | ⚠ no-bloq. [INFERIDO — ver OK Gate Q1] |
| R-16 | `F_RentaPerpetuaCLP` | 806.666.667 | ⚠ no-bloq. [INFERIDO — ver OK Gate Q1] |

**3c `hay_cuadro=0`**: R-17 sin cuadro → cae al modelo previo sin errores (L1064) · R-18 13 valores idénticos a backup v11.0.

### Capa 4 · SMOKE / RETROCOMPAT (bloqueante)
S-01 corre con overrides + cuadro sin poblar, aparece `CUADRO:` · S-02 con overrides los 13 valores no se mueven vs v11.0 (aditividad) · S-03 tasación prod sin cuadro sigue en modelo previo, sin `WARN sumCuadroValoracion` · S-04 diff v11.0→v11.1.1 byte-idéntico salvo fix `{name:'calculada'}` (aditivo) · S-05 historial AT03: 0 `SyntaxError`, 0 excepción no capturada.

**Conteo**: **38 tests bloqueantes** (U-01…U-10, I-01…I-07, R-01…R-14, R-17, R-18, S-01…S-05) + **2 no-bloqueantes** (R-15, R-16). Total definido: **40**. **HECHO = los 38 bloqueantes en verde**; cualquier rojo ⇒ DETENER y documentar causa raíz con la celda xlsm implicada.

---

## § 7 · Frontend a tocar + screenshots requeridos (Agente 4)

**Veredicto: B-0b NO toca frontend.** Cero cambios de código. Los consumidores ya existen y activos desde P9-TAS; sólo cambian los **valores en Airtable** que ya leían.

**Archivos a TOCAR**: *(vacío)*.

**Archivos a RE-VALIDAR visualmente (lectura pura de outputs del motor)**:
1. `app/tasaciones/[id]/informe/page.tsx:74` — hidrata preview con `lecturaInforme(id)`.
2. `components/tasador/informe-preview.tsx:236, 388-390, 506-532` — Bloque 2 (valor destacado) + Bloque 5 (cuadro).
3. `lib/tasador/lectura-informe.ts:275-284` — construye `ValorDestacado` desde `TX_Solicitudes.valor_comercial_uf` (+ override).
4. `components/tasador/estado-procesando.tsx:89-160` (P8-TAS) — stepper "Calculando tasación".

**Screenshots requeridos (MET-6283 recalculado)**:
- P9-TAS · **Bloque 2** mostrando `Valor de tasación: 20.125,86 UF`.
- P9-TAS · **Bloque 5** con las 6 filas del cuadro retrocargado (tipos y superficies).
- P8-TAS · stepper avanzando y terminando sin error durante el smoke.

---

## § 8 · Restricciones y riesgos (Agente 5 · Seguridad)

- **R5** — B-0b no toca código construido (verificado: rama sólo modifica `docs/`). Prohibido tocar `components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, rutas IF-04, `lib/*.ts` de IF-02.
- **R7** — Reutiliza `TX_ItemsCuadroValoracion` y edita filas existentes de `C_Formulas`; cambio 100 % aditivo/retrocompatible. No crea tablas ni fórmulas nuevas.
- **R12** — Claude NO ejecuta `git commit/push/checkout/merge/revert`; el pegado del DAG y los patches los aplica **Sergio** manualmente.
- **T-C / R8** — Sin lenguaje de IA: `grep` de strings visibles → 0. El motor es AT03 DAG determinista; sus logs (`CUADRO:`, `FIN OK`) son consola de Automation, no UI.
- **RO-05 / token** — El DAG corre dentro de Airtable Scripting (sesión propia); no referencia `AIRTABLE_TOKEN`, `process.env` ni `NEXT_PUBLIC_*`. No introduce MCP como runtime. Los patches no crean umbral SLA duplicado.

**Riesgos por severidad**:
- 🔴 **ALTO — pegar el DAG en AT03 productiva.** AT03 es única y compartida; un pegado con error rompe el cálculo de **todas** las tasaciones que pasen a `visitada`. Mitigación obligatoria: backup previo (paso 0) + rollback <1 min.
- 🔴 **ALTO — retirar overrides + forzar recálculo** sobre VP-2026-0066: cambia valores reales; **sólo** la sandbox MET-6283 debe tocarse. No retirar overrides de otras solicitudes.
- 🟡 **MEDIO — patches `C_Formulas`** afectan a toda solicitud que evalúe esas fórmulas; blindados por `hay_cuadro>0` (sin cuadro → modelo previo). Residual: P3 asume factor ×1 (sólo Casa/cliente-en-lista · D-3).
- 🟡 **MEDIO — normalización material** (`lookupUFm2Nuevo`) toca ruta fallback global; validar que no altere claves ya funcionando.
- 🟢 **BAJO — retrocarga 6 filas** en sandbox: aislado a un registro de prueba.

---

## § 9 · Criterios de rollback por paso

| Paso | Disparador de rollback | Acción |
|---|---|---|
| 1 (DAG) | `SyntaxError` / excepción fatal en smoke (paso 2) | Repegar `AT03_backup_pre_b0_<fecha>.js` y guardar → restaurado <1 min (FASE_B0 §5 L149-153) |
| 3 (patches) | Regresión (paso 6) fuera de ±1 % atribuible a fórmula | Revertir `expresion`+`version` de la(s) fila(s) `C_Formulas` a v3.2 (valores en FASE_B0 §2) |
| 4 (retrocarga) | Sumas del log ≠ oráculo (I-04) | Borrar las 6 filas insertadas en `TX_ItemsCuadroValoracion` del registro sandbox |
| 5 (regla/overrides) | Recálculo produce valores incoherentes | Restaurar los 3 overrides y `regla_aplicada` previos en `recNiwM4s1ibr3sbO` |
| Global | Cualquier bloqueante Capa 2/4 en rojo | DETENER, repegar backup DAG (B-0a no tocó datos/esquema/overrides/regla → rollback sin pérdida) |

---

## § 10 · Prompt sugerido para FASE 2 (listo para pegar)

```
Arrancamos TANDA B-0b — FASE 2: EJECUCIÓN.
Plan aprobado: docs/_planes/PLAN_B-0b.md (rama plan/b-0b). Oráculo: xlsm MET-6283 (hoja Portada).
Sandbox: VP-2026-0066 · recNiwM4s1ibr3sbO. Modo recomendado: default (pausa-total 🔴) — muta AT03 productiva.

Autorización FASE 2:
- Se autoriza LEER todo y PREPARAR artefactos/tests.
- Sergio ejecuta manualmente en Airtable el pegado del DAG y los patches C_Formulas (R12). Claude NO commitea/pushea ni pega en Airtable.
- Antes de cada acción irreversible (pegar DAG, retirar overrides, forzar estado): mostrar qué se hará y pedir confirmación.

Ejecutar en este orden (§5 del plan), deteniéndose ante cualquier test bloqueante en rojo:
0. Confirmar backup del DAG actual guardado.
1. Pegar DAG v11.1.1_v32b0 en AT03 → smoke recNiwM4s1ibr3sbO (I-01..I-03, S-01/S-02, U-09/U-10, S-04).
2. Aplicar patches C_Formulas P1/P2/P3 (+P1a-d si chain v3.1), bump v3.3.
3. Retrocargar 6 filas en TX_ItemsCuadroValoracion (I-04/I-05).
4. PATCH regla_aplicada=REGLA_REFI_CASA_V32 → retirar 3 overrides → forzar estado→visitada → recálculo (I-06/I-07).
5. Regresión oráculo 13 valores ±1% (R-01..R-14) + retrocompat sin cuadro (R-17/R-18, S-03/S-05).
6. Escribir/portar unit tests U-01..U-08 (réplica de sumCuadroValoracion L916-954) y correr vitest verde.
7. Re-validación visual P9-TAS/P8-TAS con MET-6283 (screenshots §7).
Paralelizables/diferibles: normalización material lookupUFm2Nuevo; despublicado legacy (sólo tras verificar E1/IF-03).

HECHO = 38 tests bloqueantes en verde. Resolver antes las preguntas del OK Gate (§12).
Al cerrar: generar docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}-TAS.md o el equivalente motor, y actualizar FASE_B0_PLAN_EJECUCION.md marcando B-0b cerrada.
```

---

## § 11 · Conflictos entre agentes y resolución propuesta

- **C1 · Atribución de celda de `F_ValorReposicionUF` (Agente 1 vs Agente 2).** Agente 1 (siguiendo la doc) la deriva de `CC70+BI60`; Agente 2 verificó que la fórmula literal del xlsm es `IF(AN61=0, CD37*0,8+CC46, CD37+CC46)`. **Resolución**: numéricamente idénticas (`CD37=CC70=8.496,94`, `CC46=BI60=750` → 9.246,94). No bloquea B-0b. Corregir la atribución documental en `DIFF_DAG_AT03_B0.md` L43 y FASE_B0 §2-P2 para trazabilidad (fuera de esta tanda o como paso de doc).
- **C2 · ¿R-15 y R-16 son bloqueantes? (Agente 3 vs PLAN_PRUEBA L170).** Agente 3 los marcó no-bloqueantes por no ser ruta del cambio aditivo; el plan de prueba pide "13 valores dentro de ±1 %" sin excepción. **Resolución**: decisión de negocio → **OK Gate Q1**.
- **C3 · Tolerancia ±0,01 UF en intermedias (Agente 3) vs ±1 % normativo.** No es contradicción: es un criterio **más estricto** que QA añade sobre las sumas exactas del cuadro (marcado [INFERIDO]). Se mantiene como refuerzo; el criterio de cierre sigue siendo ±1 %.

*(No hubo conflicto Agente 4 vs 1/5: los tres coinciden en que B-0b es backend; Agente 4 sólo añade re-validación visual sin tocar código.)*

---

## § 12 · OK Gate — preguntas para Sergio antes de autorizar FASE 2

1. **R-15/R-16 (IngresoLíquidoAnual, RentaPerpetua)**: ¿bloqueantes (los "13 dentro de ±1 %" del plan de prueba) o no-bloqueantes (no son ruta del cambio del cuadro)? — resuelve C2.
2. **Chain P1a-d de `C_Formulas`**: ¿la regla vigente para MET-6283 corre sobre v3.2 o sobre v3.1 (MetLife)? Determina si se aplican los 4 patches intermedios además de P1/P2/P3.
3. **Corrección documental D-1 (atribución CC70+BI60 → CD37+CC46)** y las etiquetas cruzadas D-4/D-5 en `PLAN_PRUEBA`: ¿se corrigen dentro de B-0b o quedan como tarea de doc aparte?
4. **Divergencia latente D-1/D-3** (edificación a nuevo con "Ampl No Reg." y factor seguro ×0,8 en NO-Casa): ¿se abre asunción reversible para una tanda futura, o se exige exponer `factor_seguro_bo` al SCOPE ya en B-0b?
5. **Despublicado de campos legacy** (paso L): ¿se difiere fuera de B-0b hasta confirmar que E1/IF-03 no los usan, o se incluye en esta ventana de mantenimiento?
6. **Ventana de ejecución**: al pegar el DAG en AT03 productiva (riesgo 🔴), ¿hay ventana de baja actividad acordada para minimizar impacto en tasaciones que pasen a `visitada`?
```
