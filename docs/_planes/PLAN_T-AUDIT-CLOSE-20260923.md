# PLAN_T-AUDIT-CLOSE-20260923

> Plan de ejecución consensuado por 5 expertos en paralelo (Arquitecto · Auditor de fuente de verdad ·
> QA · Frontend · Seguridad). Rama: `plan/T-AUDIT-CLOSE-20260923`. Estado: **FASE 1 — listo para OK Gate**.
> Cierra en UNA tanda lo pendiente de la auditoría del 22-09 (`docs/_analisis/AUDITORIA_inputs_motor_UNIVERSAL_20260922.md`).
> Antecedente: T-MC-P0 (deployed 23-09) cerró **H1/H2/H3** (P0) + `valor_reposicion_override`/`valor_seguro_override`, y CI-071 (A_Eventos fail).

---

## § 1 · Resumen ejecutivo
La auditoría 22-09 dejó abiertos H4–H10 (P1/P2), la desalineación RF-09 y la deuda de artefactos (AT01/AT02/AT04/AT08 + "UF diaria"). El hallazgo *load-bearing*: **H5/H6/H7 hoy degradan en silencio a defaults hardcode** (`AT03_Calculos_DAG.js:757, 783`) — deben replicar el patrón fail-ruidoso ya vivo de H3 (`:999-1031`). H8/H10 son alineación de enrutamiento RF-09 (dato en Airtable, no código del DAG); H9 es pipeline Carbone/IF-04 (fuera de este repo); H4 es gating de UI por `tipo_informe`. El **cron "UF diaria" no existe y es prerequisito operativo del guard H3**. Criterio HECHO = 43 tests en verde + regresión 13/13 MET-6283.

## § 2 · Alcance — qué SÍ / qué NO
**SÍ:** guards motor H5/H6/H7 (fail-ruidoso); verificación/alineación RF-09 para H8 y H10 (redeclarar 3 atributos a `TX_DatosTasacion`); decisión H4 (gating rentabilidad por `tipo_informe`) + su UI en territorio tasador; versionar AT01 real; volcar AT02/AT04; desplegar AT08 (con guardas); crear cron "UF diaria"; batería de 43 tests; verificar CI-071 fotos.
**NO (fuera de alcance):** rotación key Clerk (declinada por Sergio); ampliar el DAG para leer `TX_Unidades` (H10 se resuelve por enrutamiento, no enseñando al motor); ampliar el DAG para leer los 13 atributos de `TX_Comparables` (promedio de comparables no implementado — queda fuera); tocar el pipeline PDF E1/E2/E3 salvo la plantilla de portada de H9 (que es IF-04/Carbone, no este repo); reescribir H1/H2/H3 (ya cerrados en T-MC-P0).

## § 3 · Diseño técnico consolidado (Arquitecto)

**Contratos entre capas:**

| Dato | Escritor | Lee el DAG en | Ítem |
|---|---|---|---|
| `uf_m2_unitario`, `factor_aplicado` (ítem) | UI→PATCH `datos/route.ts:424-425`→`TX_ItemsCuadroValoracion` | `AT03…:924-962` | ya cerrado (H1/H2) |
| `tasa_cap_rate`, `factor_seguro`, `factor_garantia` | onboarding manual → `M_Clientes` | `AT03…:757-776` (hoy degrada 0.045/1.0/0.8) | **H5/H6** |
| `uf_m2_terreno/construccion/promedio` | onboarding → `M_Comunas` | `AT03…:783-800` (hoy degrada 20/40/45) | **H7** |
| `avaluo_fiscal_clp` | RF-09 `AT03-Ext` (`una_por_solicitud`) → `TX_DatosTasacion` | `AT03…:1036,1076` | **H8** (destino ya alineado) |
| `logo_url`, `nombre_revisor` | dato maestro `C_VariablesCliente` | **pipeline Carbone/IF-04, NO el DAG** | **H9** |
| `anio_construccion`, `sup_terreno_m2`, `sup_construccion_m2` | RF-09 → hoy `TX_Unidades` (vacío) | DAG los lee de `TX_DatosTasacion:968-976` | **H10** (desalineación) |

**Orden de dependencias:** (1) H5/H6/H7 comparten patrón y edit-site del DAG (mismo molde que H3 `:1000-1031`); (2) H8 = verificación de routing (ya apunta a `TX_DatosTasacion`); (3) H9 = pipeline PDF aguas abajo, independiente; (4) H4/H10 = decisiones de negocio sin bloqueo técnico.

**Qué se toca / qué NO:** SE TOCA `AT03_Calculos_DAG.js` bloques cliente (757-776) y comuna (783-800). NO SE TOCA `safeEval`, lector de cuadro (924-962), H1/H2/H3, `AT03-Ext` (routing genérico correcto), PATCH route.

**Cambio mínimo por ítem:**
- **H5** (`tasa_cap_rate`): en `:759-776`, si `cliId` existe pero `tasa_cap_rate` es NaN → `A_Eventos` `cliente_sin_tasa_cap_rate` + `throw`. No tocar la cadena `override>datos>cliente` (`:1086-1087`).
- **H6** (`factor_seguro`/`factor_garantia`): mismo bloque `:765-770`, guard análogo. **Un solo edit resuelve H5+H6.**
- **H7** (`M_Comunas`): en `:790-798`, si `comId` existe pero los tres `uf_m2_*` faltan → `A_Eventos` `comuna_sin_precios_unitarios` + `throw`. Ampliar cobertura = dato Airtable.
- **H8**: **cero código DAG** — ya lee `datosCrudo.avaluo_fiscal_clp` (`:1036`). Verificar en `D_TipoDocumentoAtributo` que `avaluo_fiscal_clp` sea `uso_tabla_destino=TX_DatosTasacion`/`una_por_solicitud` (`AT03-Ext:587-594`); el guard `origen_dato=tipeado` (`AT03-Ext:337-349`) protege el valor tipeado.
- **H9**: no toca DAG. Leer `C_VariablesCliente.logo_url`+`nombre_revisor` desde el paso Carbone de IF-04.
- **H4**: motor ya tolera 0 (`:1032-1033`). Cambio = filtrar las 2 fórmulas de rentabilidad por `aplica_a_tipo_informe` en `C_Formulas` (mecanismo existe, `:1167-1173`) + gating UI.
- **H10**: **decisión = NO leer `TX_Unidades`.** Ruta única = redeclarar `anio_construccion`/`sup_terreno_m2`/`sup_construccion_m2` como `una_por_solicitud→TX_DatosTasacion` en `D_TipoDocumentoAtributo` (recs `recHzaRLGLOueQWKY`, `recYwrGMxW0PGqbxe`, `recycv6hnoK9krfxg`) — dato Airtable, no código.

**Deuda de artefactos:** versionar AT01 real (`AT01-ResolverMotorReglas.js` es stub que `throw`ea, `:33-35`); volcar AT02/AT04; `AT08_Alertas_SLA.js` en repo NO desplegado; cron **"UF diaria" inexistente** — sin él, H3 aborta toda tasación post-deploy → **prerequisito operativo, no opcional.**

## § 4 · Tabla oráculo (Auditor · anclada a celdas)

**(a) MetLife VP-2026-0066 — regresión 13/13.** UF día=39894.61 (2026-04-13) · xlsm `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` hoja **Portada** · ±1% cierre / ±0,01 UF intermedias.

| Terminal | Esperado | Celda | Leído |
|---|---|---|---|
| F_ValorComercialUF | 20.125,86 | `Portada!BI62` | 20125.8624 |
| F_ValorComercialCLP | 802.913.431 | `Portada!AY69` | 802913431.36 |
| F_ValorReposicionUF | 9.246,94 | `Portada!BG72` | 9246.94 |
| F_ValorReposicionCLP | 368.903.065 | `Portada!BL72` | 368903064.99 |
| F_SeguroIncendioUF | 8.907,06 | `Portada!BO62` | 8907.0624 |
| F_SeguroIncendioCLP | 355.343.781 | `Portada!BL73` | 355343780.69 |
| F_AvaluoFiscalUF | 8.517,68 | `Portada!BG74` | 8517.6777 |
| F_ValorRemateUF | 13.081,81 | `Portada!BG77` | 13081.81056 |
| F_ValorRemateCLP | 521.893.730 | `Portada!BL77` | 521893730.39 |
| F_ValorLiquidacionUF | 16.603,84 | `Portada!BG78` | 16603.83648 |
| F_ValorLiquidacionCLP | 662.403.581 | `Portada!BL78` | 662403580.87 |
| F_IngresoLiquidoAnualCLP | 36.300.000 | `Portada!BJ43` | 36300000 |
| F_RentaPerpetuaCLP | 806.666.667 | `Portada!BJ44` | 806666666.67 |

SCOPE de anclaje: BI59=8157.0624 · CC70=8496.94 · BI61=11218.80 · BI60=750 · AN61=5024.86 · BO62=8907.0624 · uf_dia(AQ71)=39894.61 · avaluo_fiscal input(BL74)=339.809.429. Coincide byte-a-byte con `docs/_evidencia/b-0b/regresion.md`.

**(b) Cliente sintético NUEVO — oráculo de COMPORTAMIENTO (fail-ruidoso).** Record con cliente sin `factor_*`/`tasa_cap_rate` + comuna sin `uf_m2_*` + `regla_aplicada=REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`).

| Guard | Condición | Esperado | Ancla | Estado real |
|---|---|---|---|---|
| H3-a | `fecha_visita` vacía | throw + `A_Eventos fecha_visita_ausente` | `DAG:999-1008` | ✅ fail-loud |
| H3-b | sin fila `H_PreciosUF` | throw + `A_Eventos uf_no_cargada_para_fecha` | `DAG:1023-1031` | ✅ fail-loud |
| H5 | cliente sin `tasa_cap_rate` | throw + evento | `DAG:757,767-770` | ⚠ degrada a 0.045 |
| H6 | sin `factor_seguro/garantia` | throw + evento | `DAG:757,765-769,773` | ⚠ degrada a 1.0/0.8 |
| H7 | comuna sin `uf_m2_*` | throw + evento | `DAG:783,794-799` | ⚠ degrada a 20/40/45 |

**Aserto de cierre (b):** con el record sintético el motor **NO debe** producir 13 `TX_Calculos` `calculada`. Hoy sólo H3 aborta; H5/H6/H7 no — cerrarlos es el objeto de la tanda.

## § 5 · Plan paso a paso con dependencias

Leyenda track: **[DAT]** dato/schema Airtable · **[COD]** código repo · **[AUT]** automation Make/Airtable · **[SBX]** sandbox. `∥`=paralelizable en FASE 2 · `→`=secuencial (gate).

| # | Paso | Track | Paralelo/gate |
|---|---|---|---|
| A1 | Onboarding `M_Clientes`: poblar `tasa_cap_rate`/`factor_seguro`/`factor_garantia` de clientes reales | DAT | ∥ |
| A2 | Ampliar `M_Comunas` con `uf_m2_terreno/construccion/promedio` de comunas objetivo | DAT | ∥ |
| A3 | Crear/confirmar `C_VariablesCliente` (`logo_url`, `nombre_revisor`) — coordinar con IF-04 | DAT | ∥ (gate OK-Gate H9) |
| A4 | Redeclarar 3 attrs (`anio_construccion`/`sup_terreno_m2`/`sup_construccion_m2`) → `una_por_solicitud`/`TX_DatosTasacion` en `D_TipoDocumentoAtributo` | DAT | → requiere AT03-Ext v3 publicado (ya) + backup |
| A5 | Verificar routing `avaluo_fiscal_clp` = `TX_DatosTasacion`/`una_por_solicitud` (H8) | DAT | ∥ (verificación) |
| M1 | **Capturar AT01 live a repo** (LF) — versionar el AT01 real desplegado | AUT | → antes de cualquier toque/regresión AT01 |
| M2 | Volcar scripts AT02/AT04 a repo + documentar | AUT | ∥ |
| M3 | AT08 SLA: añadir `clave_notif` + leer `sla_semaforo_etapa`; desplegar en **dry-run** primero | AUT | → tras revisión (riesgo loop) |
| M4 | Crear cron "UF diaria" que puebla `H_PreciosUF` (mindicador.cl) | AUT | → prerequisito operativo de H3 |
| C1 | DAG guard **H5+H6** (edit-site 757-776): `WARN`+default → fail-ruidoso + `A_Eventos` + `throw` | COD | ∥ (mismo archivo que C2) |
| C2 | DAG guard **H7** (783-800): ídem | COD | → tras C1 (mismo archivo, un solo re-deploy) |
| C3 | UI **H4**: gating sección H por `tipo_informe` (`tasacion-form.tsx:510-528` + proyectar `tipoInforme`) | COD | ∥ |
| C4 | Verificar/ajustar **CI-071 fotos** `claveAdjuntoDeCategoria` (`fotos/route.ts:245`) | COD | ∥ (verificación, ya implementado) |
| C5 | UI **H7** (mensaje "comuna sin precios") — territorio IF-02 console | COD | → **gated por R5** (autorización) o diferir |
| T1–T4 | Escribir 43 tests (10 unit · 11 integración · 15 regresión · 7 smoke) | COD | ∥ escribir · → correr tras C1/C2/A* |
| S1 | Crear cliente sintético + comuna sin cobertura en sandbox (escenario b) | SBX | → tras C1/C2 (si no, guards no disparan) |
| S2 | Correr regresión 13/13 sobre VP-2026-0066 (escenario a) | SBX | → tras M1 (AT01) + M4 (UF) |

**Total: 20 pasos** (A1–A5, M1–M4, C1–C5, S1–S2 + el bloque T1–T4). **~12 paralelizables** en 4 tracks; **8 con gate secuencial** (M1→AT01; A4→AT03-Ext; C1→C2; C1/C2→S1; M4→S2; M3 dry-run; C5→R5; A3→OK-Gate H9).

## § 6 · Batería de tests obligatoria (QA) — HECHO = 43/43 en verde
- **Unit (10):** U-H5-01/02/03, U-H6-01/02/03, U-H7-01/02/03, U-H567-EVT. Cada guard **lanza + loguea A_Eventos + sin default**, molde `DAG:1000-1031`. Archivo `lib/tasador/motor-guards-cliente-comuna.test.ts` (PORT co-ubicado, el DAG no es importable por `@/`).
- **Integración (11):** I-AT01-01/02/03 · I-AT08-01/02/03/04 · I-UF-01/02/03 · I-CALC-409.
- **Regresión (15):** R-08..R-16 + 4 CLP + R-SCOPE + R-17 (rama `hay_cuadro=0`), ±1% / ±0,01 UF vs VP-2026-0066. Extiende `lib/tasador/motor-ports-t-mc-p0.test.ts`.
- **Smoke UI (7):** S-H9-01/02 (logo por cliente), S-H6-01/S-H7-01 (warning visible), S-H4-01/02/03 (sección H opcional por `tipo_informe`). Nivel componente/props (no browser).
> Los IDs INFERIDO (I-AT01-*, I-UF-*, S-H9-*) exigen materializar antes AT01 real / cron UF / `C_VariablesCliente`: no son verdes gratis. Los U-H5/H6/H7 nacen **rojos** hasta que C1/C2 conviertan el `WARN`+default en fail-ruidoso — ese rojo inicial es el que cierra la auditoría.

## § 7 · Archivos frontend a tocar + screenshots (Frontend)
- **H4** — `components/tasador/tasacion-form.tsx:510-528` (bloque sección H); `lib/tasador/field-ids.ts:130` (`tipoInforme`); `lib/tasador/lectura-datos.ts:484-485` + `lectura-tasacion.ts` (proyectar `tipoInforme` a la UI, hoy no llega); `lib/tasador/tasaciones.ts:829-831,1352-1354`; `lib/tasador/validators/index.ts:297-300`. *Screenshots:* form con `tipo_informe` que exige rentabilidad → sección H visible; `tipo_informe` que no → sección oculta/omitida.
- **H7** (UI) — captura de comuna vive en **IF-02 console**: `components/console/new-request-sheet.tsx:916-923, 952-954, 1654-1673`; `lib/console-data.ts` (`COMUNAS_POR_REGION` hardcodeado, no consulta `M_Comunas`). En el form del tasador la comuna es **solo-lectura** (`tasacion-form.tsx:346`). *Screenshots:* new-request-sheet con comuna sin precios → banner ámbar; con precios → sin mensaje. ⚠ **territorio IF-02 (R5)**.
- **H9** — **fuera del repo Next.js.** Único logo en código es el estático (`components/tasador/vproperty-logo.tsx`). PDF por Carbone/IF-04; el repo solo lo referencia (`app/api/tasaciones/[id]/informe/route.ts:19-22`). `C_VariablesCliente.logo_url` solo en `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md`. *Screenshots:* N/A Next.js — verificar en editor Carbone.
- **CI-071 fotos** — `app/api/tasaciones/[id]/fotos/route.ts:245` (`claveAdjuntoDeCategoria`) **ya implementado**; trabajo = verificar cobertura de categorías + tests `fotos/route.test.ts`, `lib/tasador/fotos.test.ts`. *Screenshots:* fotos-screen subiendo "cuadro de comparables" → fila con `clave_adjunto` y RF-09 disparado.

## § 8 · Restricciones y riesgos (Seguridad)
**NO-TOCAR:** territorio IF-02/IF-04 (`components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, `lib/*.ts` IF-02, `middleware.ts`, `package.json`) salvo autorización (R5); escenarios PDF E1/E2/E3; git (commit/push/checkout/merge los hace Sergio · R12); fuente de verdad `docs/_artefactos/airtable/*_script.js` sin baseline live fresco.
**Mitigaciones:**
- **AT01 live sin código:** capturar el live a disco (LF) en el mismo paso, `diff --strip-trailing-cr` (evitar falso drift CRLF), backup `_YYYYMMDD`. `update_automation` sólo escribe el DRAFT; publicar es manual en UI. No declarar cierre sin snapshot live fechado.
- **AT08 no desplegado (loop/alertas en masa):** NO desplegar tal cual — diverge en 4 puntos (sin `clave_notif` → falla idempotencia M-18; recalcula semáforo en vez de leer `sla_semaforo_etapa` → 2ª fuente prohibida por RO-05). Añadir `clave_notif` + leer `sla_semaforo_etapa`; primer disparo dry-run sin envío.
- **Reruteo RF-09:** AT03-Ext hardcodea `una_por_solicitud→TX_DatosTasacion`; destino distinto muere en el guard. Verificar cardinalidad y que AT03-Ext **v3** esté publicado; cambio aditivo + backup del script live; regresión contra sandbox.
**Reglas:** R5 (frontera territorio), R7 (reuso, no recrear), R12 (sin git), RO-05 (fuente única: AT08 lee `sla_semaforo_etapa`; el reruteo no duplica el campo en dos tablas).

## § 9 · Criterios de rollback por paso
- **AT01 (M1/regresión):** restaurar desde el snapshot live LF capturado; si se publicó una versión, reimportar la anterior en UI. Nunca sin snapshot previo.
- **AT08 (M3):** no estaba desplegado → rollback = apagar/borrar el draft. El dry-run evita envíos; si hubo envío erróneo, documentar y desactivar.
- **Motor guards H5/H6/H7 (C1/C2):** backup `docs/_backups/AT03_Calculos_DAG_pre-T-AUDIT-CLOSE.js`; rollback = restaurar + reimportar en UI (los guards son `throw` aditivos; revertir los quita).
- **UF diaria (M4):** rollback = desactivar el cron; `H_PreciosUF` es aditivo — borrar filas de fecha erróneas.
- **RF-09 reruteo (A4):** revertir las 3 filas de `D_TipoDocumentoAtributo` a `una_por_unidad`/`TX_Unidades` (recs `recHzaRLGLOueQWKY`, `recYwrGMxW0PGqbxe`, `recycv6hnoK9krfxg`).
- **Portada PDF H9:** fuera de repo — rollback en la plantilla Carbone (restaurar logo previo).
- **Sandbox (S1/S2):** cliente/comuna sintéticos y `TX_Calculos` son borrables; VP-2026-0066 se revierte a su estado previo (ver claude-out del loop-fix).

## § 10 · Prompt sugerido para FASE 2 (pegar tras OK Gate)

```
TANDA T-AUDIT-CLOSE-20260923 · FASE 2 — EJECUCIÓN. Rama plan/T-AUDIT-CLOSE-20260923.
Ejecutar el PLAN_T-AUDIT-CLOSE-20260923.md §5 respetando dependencias.
Autorización: leer todo; escribir código bajo app/tasaciones,app/api/tasaciones,components/tasador,lib/tasador;
escribir tests co-ubicados; writes Airtable SOLO a los records/schema del §5 (M_Clientes, M_Comunas,
D_TipoDocumentoAtributo, C_VariablesCliente, sandbox); capturar AT01 live antes de tocarlo; NO desplegar AT08
sin dry-run; NO commit/push (los hace Sergio); NO tocar territorio IF-02 sin OK explícito (paso C5).
Orden: (1) M1 captura AT01 live + backup; (2) A1/A2/A5/A4 datos en paralelo; (3) C1+C2 guards DAG (backup pre + guard fail-ruidoso H5/H6/H7 molde DAG:1000-1031) → reimport UI; (4) C3 gating H4 + C4 verificar fotos;
(5) M4 cron UF diaria; (6) M3 AT08 con clave_notif + sla_semaforo_etapa en dry-run; (7) escribir 43 tests §6;
(8) S1 sandbox sintético → confirmar fail-ruidoso; (9) S2 regresión 13/13; (10) gates tsc+vitest verdes.
Cerrar con claude-out.txt: pasos hechos/skip, 43/43, regresión 13/13, deploys, rollbacks disponibles.
Respetar §8 (NO-TOCAR) y §9 (rollback por paso). Cada aserto con ruta/línea/celda o INFERIDO.
```

## § 11 · Conflictos entre agentes y resolución
1. **CI-071 fotos: ¿faltante o ya implementado?** El brief lo llama "clave_adjunto faltante"; Frontend confirma que **ya está** en `fotos/route.ts:245` (`claveAdjuntoDeCategoria`). **Resolución:** reclasificar de "crear" a "verificar cobertura de categorías + tests" (paso C4). No es trabajo nuevo.
2. **H7 UI en territorio IF-02.** Arquitecto/QA tratan H7 como guard de motor (nuestro territorio); Frontend muestra que la **captura de comuna vive en `components/console` (IF-02)** y Seguridad marca R5. **Resolución:** partir H7 en dos — (a) **guard motor** (fail-ruidoso, DAG, P1, en alcance) y (b) **mensaje UI** en la consola (IF-02, **gated por R5** → paso C5, requiere OK de Sergio/Óscar o se difiere). El cierre P1 no depende de (b).
3. **H9 ¿en esta tanda?** Auditor/QA lo tratan como entregable con test S-H9; Frontend confirma que es **fuera del repo** (Carbone/IF-04) y `C_VariablesCliente` no está ni en CLAUDE.md. **Resolución:** H9 se ejecuta en IF-04/Make; en esta tanda sólo se crea/confirma el **dato maestro** `C_VariablesCliente` (paso A3) y se deja el cambio de plantilla como handoff a IF-04. S-H9 queda INFERIDO hasta que exista el dato.
4. **Versión audit vs DAG live.** El audit 22-09 lista H1/H2/H3 P0 abiertos y `DAG:985` default 38500; el DAG live (post-T-MC-P0) ya cerró H3 fail-loud. **No es contradicción entre agentes** — ambos (Auditor) lo señalan. **Resolución:** esta tanda = H4–H10 + deuda; H1/H2/H3 ya cerrados.

## § 12 · OK Gate — preguntas para Sergio
1. **H10 ruta canónica:** ¿confirmas redeclarar `anio_construccion`/`sup_terreno_m2`/`sup_construccion_m2` a `una_por_solicitud→TX_DatosTasacion` (y **no** enseñar al DAG a leer `TX_Unidades`)?
2. **H4 rentabilidad:** ¿qué valores de `tipo_informe` **exigen** rentabilidad y cuáles la hacen opcional/oculta? (define el gating de la sección H).
3. **UF diaria:** ¿cada cuánto corre el cron (diario 1×?), fuente (mindicador.cl / Banco Central) y en qué motor (Make cron vs Airtable Automation)? ¿Comportamiento si el fetch falla — H3 aborta ese día (recomendado)?
4. **H9 política de logo:** ¿confirmas `C_VariablesCliente` como dato maestro (crear tabla si no existe) y que el cambio de portada es handoff a IF-04/Carbone (fuera de esta tanda)?
5. **H5/H6 semántica:** ¿el guard debe **abortar** cuando el cliente está dado de alta pero sin factores (fail-ruidoso), o prefieres forzar los factores como prerequisito de onboarding y que el guard sea red de seguridad?
6. **H7 UI (paso C5):** ¿autorizas tocar `components/console`/`lib/console-data.ts` (territorio IF-02, R5) para el mensaje "comuna sin precios", o se difiere y esta tanda cierra sólo el guard de motor?
7. **AT01:** ¿OK a capturar el AT01 live a repo antes de tocarlo (single source), asumiendo que el `.js` actual es stub?
8. **AT08:** ¿OK a desplegarlo **sólo tras** añadir `clave_notif` + leer `sla_semaforo_etapa`, con primer disparo en dry-run sin envío de correos?

---
*Consolidado 2026-09-23 · 5 agentes en paralelo · solo lectura · sin commit.*
