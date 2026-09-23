# AUDITORÍA CIEGA — BLOQUE 3 · T-AUDIT-CLOSE-20260923

> Fecha: 2026-09-23 · Auditor ciego (BLOQUE 3) · Verificación independiente contra disco
> y por ejecución. El CIERRE (`docs/_analisis/CIERRE_T-AUDIT-CLOSE-20260923.md`) se trató
> como afirmación, no como evidencia. Sin acceso MCP Airtable en esta sesión: todo lo que
> dependa de lecturas en vivo queda marcado INFERIDO.

## Tabla de verificaciones

| # | Ítem | Método | Resultado |
|---|---|---|---|
| 1a | Guard **H5** fail-ruidoso | Lectura `docs/_artefactos/airtable/AT03_Calculos_DAG.js:782-791`: `if (cliId && cliTasaNaN && !(tasaCapRateOverride > 0))` → log + `A_Eventos {tipo_evento:'cliente_sin_tasa_cap_rate'}` + `throw`. Molde H3 confirmado en `:1048` (`fecha_visita_ausente`) y `:1071` (`uf_no_cargada_para_fecha`). | ✅ |
| 1b | Guard **H6** fail-ruidoso | `AT03_Calculos_DAG.js:792-801`: `if (cliId && (cliSeguroNaN \|\| cliGarantiaNaN))` → evento `cliente_sin_factor_seguro_garantia` + `throw`. Un solo bloque cubre H5+H6 (plan §3). | ✅ |
| 1c | Guard **H7** fail-ruidoso | `AT03_Calculos_DAG.js:835-844`: `if (comId && comLeida && comTerrNaN && comConsNaN && comPromNaN)` → evento `comuna_sin_precios_unitarios` + `throw`. | ✅ |
| 1d | Defaults antiguos ya no silenciosos | Diff contra `docs/_backups/AT03_pre-T-AUDIT-CLOSE_20260923.js:757-800` (pre: defaults sin guard alguno). Post: cliente vinculado sin dato → aborta; 0.045/1.0/0.8 solo sobreviven **sin cliente vinculado** (documentado `:757-761`, conforme al plan §3 "si cliId existe"). ⚠ tres matices abajo. | ✅⚠ |
| 2 | AT01 capturado (no stub) | `git diff` muestra el stub-throw de 35 líneas reemplazado por script real de 549 líneas (`AT01_v32`, wflY6ytBBJSdwYskI). `diff --strip-trailing-cr` artefacto vs `docs/_backups/AT01_live_20260923.js` → **exit 0, byte-idéntico**. Que ese backup sea el live real: INFERIDO (cabecera declara captura MCP `get_automation` 2026-09-23; no puedo releer Airtable). | ✅ |
| 3 | AT02/AT04 volcados | `AT02_Asignar_Tasador.js` (386 líneas, wflgFmIovhugw4q5x, UNDEPLOYED, marcado FUERA DE ALCANCE IF-02 · D-15) y `AT04_Validar_Rangos.js` (451 líneas, wflNt78DONF9kZi9K). Scripts completos y plausibles (tablas reales, FIELD_CANDIDATES, versión v32 coherente con AT01), no placeholders. | ✅ |
| 4a | AT08 `DRY_RUN=true` | `AT08_Alertas_SLA.js:87` (`const DRY_RUN = true;`); gate de escritura `:626-635`: con dry-run NO escribe `TX_Notificaciones`. A_Eventos sí se escribe en dry-run (`:636`) — documentado como traza de auditoría sin envío. | ✅ |
| 4b | AT08 idempotencia `AT08:` | `:458` `` `AT08:${solicitudId}:${etapaKey \|\| 'agregado'}:${hoyISO}` ``; carga de emitidas filtrada por prefijo `:466`; guard `:532-535`. Campo `clave_natural` (no `clave_notif` del plan) — divergencia documentada en `AT08_CHANGES_T-AUDIT-CLOSE.md` §1, cumple M-18. | ✅ |
| 4c | AT08 lee `sla_semaforo_etapa` (RO-05) | `:481` en campos leídos; `:522-523` la fórmula manda el estado cuando está presente; cálculo local relegado a detalle (etapaNombre/horas/responsable). ⚠ si la fórmula viene vacía, el estado local es fallback (documentado; no es 2ª fuente activa mientras M-13 exista). | ✅⚠ |
| 5a | Batería ejecutada por mí | `pnpm exec vitest run` (5 archivos): **Test Files 5 passed (5) · Tests 81 passed (81)**, 16:41. Coincide con `tests-output.txt` (81/81, 16:19). `pnpm typecheck` → tsc --noEmit sin errores. | ✅ |
| 5b | Cobertura vs 43 IDs del plan §6 | Unit 10/10 ✅ (U-H5-01..03, U-H6-01..03, U-H7-01..03, U-H567-EVT en `motor-guards-cliente-comuna.test.ts`, port fiel del DAG). Regresión ✅ (R-08..R-17a/b, R-18/R-19, R-SCOPE, rama `hay_cuadro=0` en `motor-ports-t-mc-p0.test.ts`). Integración **7/11**: I-AT01-01/02/03 ✅, I-AT08-01/02/03 ✅, **falta I-AT08-04, I-UF-01/02/03** (no hay cron UF). Smoke **≈1/7**: S-H9 forma-de-dato ✅; **faltan S-H4-01/02/03, S-H6-01, S-H7-01, S-H9-02**. Los faltantes son exactamente los que el plan §6 marcó "no verdes gratis" (exigen cron UF / gating H4 / UI). | ⚠ |
| 6 | Regresión 13/13 | `regresion.md`: 13 filas, tolerancias ±1%/±0,01 UF declaradas, valores idénticos a la tabla oráculo del plan §4(a) (los 13 coinciden dígito a dígito con la columna "Leído" del plan). El port `motor-ports-t-mc-p0.test.ts` cubre los mismos 13 terminales (R-08..R-19) y pasa. La **lectura en vivo** de `TX_Calculos` no la puedo repetir sin MCP → esa parte **INFERIDO** desde el doc. | ✅ (vivo: INFERIDO) |
| 7 | §8 NO-TOCAR | `git status --porcelain` + `git diff --name-only`: modificados solo 3 artefactos `docs/_artefactos/airtable/` + 1 test `lib/tasador/`; untracked solo `docs/**` + 3 tests `lib/tasador/`. **Cero** archivos en `components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, `middleware.ts`, `package.json`. Sin commits nuevos (R12). | ✅ |
| 8 | Airtable en vivo (sintéticos, A4, deploys) | Sin MCP en esta sesión: registros sintéticos (recLVk6eAbYMmS3xW, recfJxiRgM1qDHiQK, filas EAV), estado A4/`sup_m2`, publish AT03 y draft AT08 → **NO-VERIFICABLE / INFERIDO** desde CIERRE §3-§5 y `C_VariablesCliente.md` (que es internamente coherente y ancla FIELD_IDs). | ⚠ INFERIDO |

## Matices de los guards (no bloquean, quedan en acta)

1. **H7 exige que falten LOS TRES `uf_m2_*`** (`:836`). Con uno presente y dos ausentes, los ausentes siguen degradando a 20/40/45 por-campo (comentario `:812-813` lo declara). Es literal al plan §3 ("si comId existe pero **los tres** `uf_m2_*` faltan"), pero la degradación parcial silenciosa sobrevive.
2. **Error de lectura ≠ dato ausente**: si `selectRecordAsync` lanza (catch `:780`/`:833`), los flags NaN quedan en false y el guard no dispara → defaults silenciosos en fallo de I/O. Mismo comportamiento pre-existente; el guard solo cubre "registro leído sin dato".
3. **H5 no consulta `tasaCapRateDatos`**: la cadena efectiva es `override > datos > cliente` (`:1129-1131`), pero el guard `:783` solo exime por override. Cliente sin tasa + `TX_DatosTasacion.tasa_cap_rate` presente + sin override → aborta igual. Dirección fail-safe (aborta de más, nunca degrada), pero es más estricto que la cadena que protege.

## Huecos abiertos (plan §5 vs disco)

**Pendientes por decisión/diseño (declarados, con gate legítimo):**
- **A1/A2** — clientes/comunas reales sin poblar: Opción 1 confirmada por Sergio ("no inventar datos; el resto aborta por diseño"). Coherente con el guard.
- **A4 (H10)** — DETENIDO por gate de mapeo `sup_m2`≠`sup_construccion_m2` (CIERRE §3, razonamiento anclado y verosímil; estado Airtable INFERIDO). Requiere fix de `uso_campo_destino` por Sergio antes de redeclarar.
- **C5 (H7 UI IF-02)** — diferido por R5, previsto en plan §11.2; el cierre P1 no dependía de él.
- **Deploys manuales** — AT03 con guards NO publicado y AT08 NO creado en Airtable todavía (CIERRE §5): hasta el reimport, **los defaults silenciosos siguen vivos en producción**. Los guards existen solo en el artefacto del repo.
- **S1 live-fire** — sin TX_Solicitudes sintética disparada (deliberado, evita 13 TX_Calculos con defaults); validado solo por port unit-tests hasta el reimport.
- **H9** — dato maestro confirmado + fixture; plantilla Carbone es handoff IF-04 (conforme plan §11.3).

**Huecos reales (sin gate declarado):**
- **M4 — cron "UF diaria": NO existe** ningún artefacto (grep `mindicador|UF diaria|H_PreciosUF` en `docs/_artefactos/` solo devuelve menciones en AT03/RF-09). El plan lo calificó "**prerequisito operativo, no opcional**" de H3: sin él, tras publicar AT03 toda tasación con fecha sin fila `H_PreciosUF` aborta. El CIERRE **ni lo menciona ni lo declara skip**.
- **C3 — gating H4 por `tipo_informe`: NO implementado.** `components/tasador/tasacion-form.tsx:510-511` sigue con `Section letra="H" titulo="Rentabilidad (opcional)"` incondicional; cero referencias a `tipo_informe`/`tipoInforme` en el form. Estaba en el alcance SÍ del plan §2 y el CIERRE **no lo declara ejecutado ni skip** — omisión de transparencia.
- **11 IDs de test del plan §6 sin materializar**: I-AT08-04, I-UF-01/02/03, S-H4-01/02/03, S-H6-01, S-H7-01, S-H9-02. El criterio literal "HECHO = 43/43" no es evaluable tal cual (la batería real es 81 tests, superset numérico pero subset de IDs); los faltantes mapean 1:1 a M4/C3/C5/H9-pipeline.

## VEREDICTO: **CIERRA CON RESERVAS**

**Lo que cierra (verificado independientemente):** el objeto central de la tanda — matar la
degradación silenciosa H5/H6/H7 con el molde H3 — está en el artefacto, correcto y testeado
(guards `:782-844`, port fiel 10/10, invariante MetLife/Colina que protege la regresión);
AT01 real capturado y single-source; AT02/AT04 volcados; AT08 con dry-run + idempotencia +
RO-05; 81/81 verde reproducido por mí + typecheck limpio; §8 NO-TOCAR intacto; A4 detenido
por una razón correcta en vez de ejecutar una media-migración.

**Las reservas (por qué no es CIERRA a secas):**
1. Los guards **no están en producción**: el publish de AT03 y el alta de AT08 son pasos
   manuales pendientes — hasta entonces la auditoría 22-09 sigue abierta en el runtime.
2. **M4 (cron UF) no existe y nadie lo declaró skip**, siendo prerequisito operativo del
   propio plan: publicar AT03 sin M4 convierte H3 en un abortador diario en potencia.
3. **C3 (H4) quedó fuera sin declaración** en el CIERRE — hueco real de alcance SÍ.
4. El criterio HECHO literal (43 IDs) no se cumple: faltan 11 IDs, todos atados a los
   pasos no ejecutados.
5. Regresión en vivo, sintéticos y estado A4 son INFERIDO (sin MCP en esta sesión).

Recomendación mínima para pasar a CIERRA: (a) ejecutar los 2 deploys manuales del CIERRE §5,
(b) crear el cron UF **antes o junto con** el publish de AT03, (c) registrar C3/M4 como skip
explícito o ejecutarlos en una tanda corta, (d) live-fire S1 post-reimport.

*Auditor ciego · 2026-09-23 · solo lectura + ejecución de tests · único write: este archivo.*
