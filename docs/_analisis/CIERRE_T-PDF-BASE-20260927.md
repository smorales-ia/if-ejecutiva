# CIERRE — TANDA T-PDF-BASE-20260927 · FASE 2 (ejecución)

> 27-sep-2026 · rama `feat/T-PDF-BASE-20260927` · plan aprobado: `docs/_planes/PLAN_T-PDF-BASE-20260927.md` (OK Gate respondido).
> Método Airtable: MCP en 403 toda la sesión → fallback RO-30 declarado (`curl` REST con `AIRTABLE_TOKEN` server-side). AT03 automation apagada por Sergio durante toda la fase.
> Equipo: hilo principal (Piezas 1-2 + motor) + 2 ejecutores en paralelo (sandbox, blueprint) + auditor ciego independiente.

## § 1 · Resumen ejecutivo

Las 3 piezas quedaron aplicadas y probadas. El **motor real** (script AT03 v11.2.0_v32b1, sin modificar) corrió sobre VP-2026-0067 vía harness local: **15/15 fórmulas escritas, 13 terminales idénticos al gold master al céntimo, y las 2 fórmulas del P0-quirúrgico ejecutan y persisten por primera vez**. Auditor ciego: **6 OK / 0 FAIL**. Un hallazgo numérico quedó abierto para decisión de Sergio: la desviación calculada da **+160,5%**, no el −3% del PDF — problema de la expresión/aritmética pre-existente (CI-057), no del relink. Cero rollbacks. Quedan los Gates manuales de Sergio (reactivar AT03, importar SC-Textos v0.2 + Run once, screenshots, commit).

## § 2 · Qué se hizo por pieza

**Pieza 1 — Relink (aplicada, T3 ✅).** `C_Formulas.C_ReglasNegocio` de `recFcpOeKjXNunBlj` (F_UFm2_promedio v3.2) y `recliyqVJAGatkDw0` (F_DesviacionVsPromedio v1.0): 6→**9 links** cada una (se AGREGARON `recYEf9XepX4SmLnH`, `rec2QYP8yjMW1Smsm`, `reckDNGORrc45HTN9`; cero quitados). Las 3 reglas V32 pasaron a 15 fórmulas; las 6 legado siguen en 20.

**Pieza 2 — Contrato plantilla (aplicada, T5 ✅).** `recK3ICXfmbEdWpFQ` (MUTUO_MET.docx): `variables_requeridas` = 52 tags · `variables_opcionales` = 24 tags (un tag Carbone por línea; diff contra el catálogo del plan: idéntico; los 76 respaldados por `InformeContexto` — verificación del auditor 76/76) · `notas_diseno` con origen y fecha (RO-05: manda `matriz-tags.ts`) · consolidación: `codigo`=TPL-MET-CASA-001 + links cliente/tipo_propiedad migrados; `recbC79jChtK5M9fX` desactivada con `vigente_hasta`=2026-09-27 (no borrada); `REGLA_REFI_CASA_V32.plantilla_resultado` re-apuntada del placeholder vacío a MUTUO_MET.docx.

**Pieza 3 — Blueprint SC-Textos v0.1→v0.2 (aplicada en repo, NO importada — Gate).** `docs/_artefactos/make/SC-Textos.blueprint.json`: módulo 11 escribe por FIELD_ID a los campos reales (`fldCfipeATICMiimq`/`fldBSpioukujGCcHS`, `useColumnId:true`); módulo 6 `{{5.tipo_recinto}}`; prompt sin `numeracion`/`condominio`/`zona` rotos; **módulos 14/15 nuevos** (Search a M_Comunas/M_TiposPropiedad para resolver los Links a texto, patrón F-1 clonado del módulo 3); `typecast:true` en los logs 12/13 (sin cambio de schema); decisión E-85 = texto fijo de plantilla (cero referencias funcionales a `analisis_referencias`). JSON validado, todos los tokens contra schema real. Salvedad declarada: la fórmula de match de los módulos 4/5 (`{solicitud}=`) se confirma en el Run once.

**Datos de prueba (T4 precondición ✅).** VP-2026-0067 (`recmMzeu3eWGxyXsf`, ya existía como espejo cancelado del 22-sep — el plan decía "crear/completar": se completó): estado→asignada, fecha_visita=2026-04-13, TX_DatosTasacion espejo (`recy8q3Tq9omjdNUf`), 6 ítems del cuadro creados (Σ 20.125,8624 UF exacto), y **los 7 comparables ya existían** — los había creado RF-09 el 22-sep desde la foto real del gold master (dato mejor que el esperado: la cadena RF-09→TX_Comparables quedó estrenada con datos reales).

**Corrida del motor.** `at03-harness.mjs` ejecuta el script REAL (byte a byte, sin modificar) con un shim del API de scripting sobre REST — equivalente funcional de la corrida de la automation, con ella apagada. Log completo: `at03-run-0067.log`. Escribió 15 filas TX_Calculos + 1 evento `at03_dag_completo` + estado→`calculada`.

## § 3 · Tests (criterio HECHO = todos en verde)

| Test | Resultado |
|---|---|
| T1 typecheck + unit | ✅ typecheck 0 errores · **999/999 tests, 56 archivos**. Lint: **N/A estructural** — `eslint` no es dependencia del repo (script huérfano como `test:e2e`; agregarlo violaría la regla de dependencias) |
| T2 regresión aritmética repo | ✅ (fila-tasacion/comparables dentro de la suite) |
| T3 relink estático | ✅ 9+9 links · V32 15 · legado 20 |
| T4.a — 13 terminales vs oráculo | ✅ **13/13 al céntimo** (máx Δ 0,0035 UF / 0,37 CLP) — tabla completa en `regresion.md` |
| T4.b — fórmulas P0 ejecutan | ✅ ambas filas existen y persisten (15/15 pasan el Filtro 2) · ❌ el criterio `round(desv)=−3` FALLA con causa: **hallazgo H-T4b**, ver § 4 |
| T4.c — regla ganadora V32 | ✅ (log: `REGLA formulas_resultado` con las 15) |
| T5 contrato plantilla | ✅ diff idéntico + 76/76 tags respaldados |
| T6 SC-Textos Run once | ⏸ **Gate Sergio** (import manual en Make) |
| T7a smoke server | ✅ health 200; 404 de `/tasaciones/*` = guard de pertenencia del tasador sin sesión (`lectura-tasacion.ts:479-482`), no error; sin 500 |
| T7b screenshots | ⏸ **Gate Sergio** (sin browser en WSL + Clerk — `ui-BLOQUEO.md`) |
| T8 ensamblador end-read | ✅ suite verde + 13 claves terminales no-null por GET |
| T9 evidencia documental | ✅ (lista en § 7) |
| T10 auditor ciego | ✅ **6 OK / 0 FAIL** (`auditor.md`) — verificó los 76 tags, los 9 valores del oráculo, el oráculo 0066 intacto y re-corrió la suite |

## § 4 · Hallazgos y desvíos del plan

1. **H-T4b (abierto — decide Sergio, próxima tanda):** `desviacion_vs_promedio_pct` = +160,5%, no −3%. Causa: el lector b1 homogeneiza el promedio (resta `uf_m2_terreno_f×sup_t` y OO.CC.: 30,91 UF/m² solo-edificación) pero la expresión de `F_DesviacionVsPromedio` compara contra la tasación SIN homogeneizar (80,53 UF/m² con terreno). Bases mezcladas; con los datos digitalizados ninguna aritmética razonable reproduce el −3% del PDF (alternativas: +0,40% promedio simple · +5,6% ambos homogeneizados). Es CI-057 cuantificada; arreglarla es cambio de expresión/motor — fuera del alcance §2 de esta tanda. **El relink NO se revierte**: su objetivo (que las fórmulas ejecuten) está cumplido y los 13 terminales no se alteraron.
2. **VP-2026-0067 ya existía** (espejo cancelado del 22-sep) — se completó en lugar de crear duplicado (el plan decía "crear/completar"). Divergencia menor resuelta a favor del estado real.
3. **Los 7 comparables ya existían** (RF-09, 22-sep, foto real) — `usado_motor_calculo` NO existe en el schema real de TX_Comparables (divergencia doc↔schema, para CODE_INCONSISTENCIES).
4. **VP-2026-0062 está en `visitada` sin TX_Calculos desde AYER** (26-sep 15:41, antes de esta tanda) — caso pre-existente del patrón "guard abortó y la pantalla gira" (auditoría §5). Al reactivar AT03 NO se recalcula sola (trigger por transición): si corresponde, re-gatillar re-guardando el estado.
5. Lint huérfano (eslint no es dependencia) — mismo estatus que `test:e2e`; documentado, sin acción.
6. `analisis_referencias` aparece 1 vez en el blueprint, solo como nota documental de la decisión E-85 (observación del auditor; sin efecto funcional).

## § 5 · Rollbacks aplicados

**Ninguno.** `rollback.md` contiene los originales completos de todo lo tocado (links, plantillas, regla, 0067 y sus hijos, escrituras del motor) con los comandos de reversión listos.

## § 6 · Pasos manuales para Sergio (Gates pendientes)

1. **Reactivar AT03** en la UI de Airtable (toggle a Activo). Nota: VP-2026-0067 ya quedó `calculada` (no se recalcula); VP-2026-0062 sigue `visitada` de antes — decidir si re-gatillarla.
2. **Importar SC-Textos v0.2** en Make (archivo: `docs/_artefactos/make/SC-Textos.blueprint.json`): crear el webhook en el módulo 1, pegar la `ANTHROPIC_API_KEY` vigente en el header del módulo 7 (y el prompt canónico few-shot de `docs/_artefactos/plantillas/prompts-textos-informe.md` §4.1-4.2 si se quiere el largo), verificar conexión Airtable 8847431. **Run once** con `curl -X POST <url_webhook> -H 'Content-Type: application/json' -d '{"solicitud_codigo":"VP-2026-0067"}'` → verificar `sintesis_descriptiva`/`descripcion_sector` pobladas y log `✓ OK`. Dejar el escenario **APAGADO**. (Opcional para textos más ricos: poblar antes `pisos` y filas de TX_HabitacionesPorNivel en 0067.) Registrar en Z_EscenariosMake/Z_Webhooks. ⚠ Desactivar la traducción del navegador al pegar.
3. **2 screenshots** autenticado (detalle en `ui-BLOQUEO.md`) → guardar en `docs/_evidencia/T-PDF-BASE-20260927/`.
4. **Commit + push** de la rama `feat/T-PDF-BASE-20260927` desde GitHub Desktop.
5. Decisión para una próxima tanda: aritmética de la desviación (H-T4b · § 4.1).

## § 7 · Archivos generados/modificados (repo)

- `docs/_artefactos/make/SC-Textos.blueprint.json` — v0.2 (modificado)
- `docs/_planes/PLAN_T-PDF-BASE-20260927.md` (de Fase 1, en esta rama)
- `docs/_evidencia/T-PDF-BASE-20260927/`: `rollback.md` · `regresion.md` · `tests-output.txt` · `auditor.md` · `ui-BLOQUEO.md` · `at03-harness.mjs` · `at03-run-0067.log` · `variables_requeridas.txt` · `variables_opcionales.txt` · snapshots `snap-*.json` (pre y post)
- `docs/_analisis/CIERRE_T-PDF-BASE-20260927.md` (este archivo)
- Entrada nueva en `docs/aprendizajes.md`
