# CIERRE — T-ARREGLOS-DOCS-20260925 (Tandas 2+3 del roadmap de paridad)

> **Tanda:** T-ARREGLOS-DOCS-20260925 · 3 agentes en paralelo (A robot UF/dólar · B campo apuntado + promedios · C saneo documental)
> **Plan ejecutado:** `docs/_analisis/ROADMAP_paridad_informe_20260924.md` filas T2 y T3 de §2.
> **Autorización respetada:** solo archivos dentro del repo · cero writes a Airtable/Make · sin deploy · sin commit/push · MCP solo lectura. P1-6b (decisión A4) fuera de alcance según el propio roadmap.

---

## 1 · Qué se arregló (con evidencia)

### P1-3 · Dólar y robustez del cron UF (Agente A)
- `docs/_artefactos/airtable/CRON_UF_Diaria.js` reescrito (226 líneas, v con dólar): fetch `mindicador.cl/api/dolar/`, regla **último hábil disponible** para sáb/dom/feriados (traza en `notas`), **rama UPDATE de backfill** (filas existentes sin `tipo_cambio_usd` se completan; jamás pisa un dólar cargado), evento `uf_fetch_fallido` normalizado a los campos reales de A_Eventos (`tipo_evento`/`descripcion`/`detalle_json`/`severidad` — aprendizaje 23-sep) y **`uf_fetch_fallido_critico` (CRITICO)** cuando ≥2 fechas de la ventana quedan sin UF (el lookback de 7 días hace que eso equivalga a "falló ayer y volvió a fallar hoy"). Contrato intacto: idempotente, no-write en fallo de UF, LOOKBACK 7. Sin dólar disponible → la fila queda sin dólar (no se inventa).
- `docs/_artefactos/airtable/CRON_UF_Diaria_DEPLOY.md` actualizado (log esperado, sección dólar).
- `lib/cron-uf-diaria-ports.test.ts` nuevo — 10 tests port-fiel (patrón `motor-ports-t-mc-p0.test.ts`): ventana con cruce de mes, parseo mindicador, regla último hábil, predicado ≥2.

### P1-8 · Promedios de comparables al motor + fila TASACIÓN (Agente B)
- `docs/_artefactos/airtable/AT03_Calculos_DAG.js` → **v11.2.0_v32b1**: lector `sumComparables` (:1030-1078, patrón fail-safe de `sumCuadroValoracion`, explícitamente NO-guard: jamás aborta) que inyecta `promedio_uf_m2_muestra` y `n_comparables` al SCOPE (:1240-1248). Aritmética A-44 idéntica a `lib/tasador/lectura-informe.ts:301-304` (fórmula del cuadro, sin homogeneización; cuadrada contra dato real: (20000−2,2·5051−750)/239 = 34,05 ✓). Cambio aditivo: ninguna fórmula vigente lo referencia todavía → cálculo idéntico hasta el paso manual.
- **Fila TASACIÓN cableada (F-2)**: fuente única `lib/informe/fila-tasacion.ts` (+test, delega el % en `tasacionVsPromedio` de `lib/tasador/comparables.ts` — RO-05, cero aritmética duplicada); `lib/informe/ensamblador.ts` ahora la usa; `components/tasador/form-sections/seccion-comparables.tsx` acepta `ufM2Tasacion` opcional y `components/tasador/informe-preview.tsx` lo pasa desde el valor canónico (CI-063). La fila TASACIÓN pinta UF/m² C. y su V/S % cuando los insumos existen; las demás columnas del sujeto siguen «—» hasta que el motor persista (no se mezclan fuentes). CI-057/A-44 intactas.

### P1-6a · Campo mal apuntado — **CERRADO SIN ACCIÓN (premisa no reproducible)**
Verificación MCP exacta sobre `D_TipoDocumentoAtributo` (`tbldI86ieVKpjpL7E`): los únicos 2 registros con `uso_campo_destino="sup_m2"` son `recaDdzrS30jz7xNY` (certificado_avaluo_fiscal) y `recycv6hnoK9krfxg` (foto_fuente_sii), **ambos con destino `TX_Unidades`, donde `sup_m2` (`fldZLvJKuXuWhRV8P`) SÍ existe** — coincide con la matriz de `docs/schema-airtable.md:1720-1721`. No existe ningún registro apuntando `sup_m2` → `TX_DatosTasacion`. "Renombrar" esos 2 registros rompería RF-09. El desalineamiento real (motor lee `TX_DatosTasacion.sup_construccion_m2`, RF-09 escribe `TX_Unidades.sup_m2`) es exactamente **P1-6b = decisión A4**, fuera de esta tanda. Grep de `sup_m2` en código/docs vivos: todas las referencias legítimas; cero cambios.

### P2-5 · Saneo documental (Agente C) — corregido con evidencia citada
- **CLAUDE.md**: E1/E2/E3 → ❌ INACTIVOS con el alias E1/E2/E3↔SC09/SC10 documentado por primera vez (E1=`SC01_Airtable_Make` 5748459 ≠ SC01 real 6483077; E2=SC09_Carbone_Render; E3=SC10_Carbone_Download_Dropbox); SC05 → existe INACTIVO v1.0 (6780103, nunca ejecutado); SC01 v1.1 y SC-RF09 v2.2 → ACTIVOS; filas nuevas SC-Asignar v2.1, SC-Adjuntos-Upload (⚠ dos activos a la vez v1.2/v1.7), SC-SLA-Envio v1.0 (7597712, inactivo); SC-Edicion → **v3.5**; rutas listadas no existentes (`webhooks/reasignar|prioridad|pausar`, `extraccion/iniciar`) → marcadas planificadas-no-creadas; alcance MCP corregido (`list_automations`/`list_automation_runs` SÍ funcionan — verificado en sesión; sigue vedado editar `customScript` y todo Make); árbol de docs/ y Z_EscenariosMake actualizados.
- **docs/construccion.md**: "Regresión E1→E2→E3 en Make (pipeline activo)" → tachado con nota fechada (inactivos, sin blueprint; regresión no ejecutable hasta T5).
- **docs/diseno.md**: "la transición la ejecuta AT02" → SC-Asignar (AT02 undeployed, MCP 25-sep).
- **docs/schema-airtable.md**: Z_EscenariosMake "vacía" → 11 filas seed desactualizadas (ids errados, filas faltantes).
- No tocados (con motivo): CODE_INCONSISTENCIES.md (sin afirmaciones falsas; las CI de esta tanda las cierran sus dueños), aprendizajes.md (solo-append), `_md/`/`_archivo/`/`_notas/` (canónicos/históricos).

## 2 · Verificación

- `pnpm typecheck` → limpio · `pnpm test` → **56 archivos · 999/999 verdes** (16 tests nuevos) · `pnpm build` → compilado OK.
- `AT03_Calculos_DAG.js` validado como `AsyncFunction` (contexto real del sandbox): **DAG-SYNTAX-OK**. ⚠ `node --check` plano falla desde ANTES de esta tanda (el script es cuerpo de función async — no es regresión).
- `node --check CRON_UF_Diaria.js` → OK.
- **Score de paridad: sin cambio (34,1%), deliberado** — la matriz mide persistencia real del dato; los promedios fluirán cuando Sergio pegue el DAG y ajuste las fórmulas (pasos abajo). El golden y el baseline del test quedaron intactos.

## 3 · PASOS MANUALES PARA SERGIO (todo lo que esta tanda no podía ejecutar)

### Robot UF/dólar (deploy del cron)
1. Airtable → Automations → `CRON_UF_Diaria` (`wflQ9NC7dHcuY6Hh0`) → acción Script → pegar el contenido completo de `docs/_artefactos/airtable/CRON_UF_Diaria.js` → botón **Test** (esperar log `UF-diaria: fin · nuevas=N · backfill_dolar=M …`) → activar.
2. Borrar la fila vacía huérfana `recrQdCDkJvGgxClK` de `H_PreciosUF` (el script ya la ignora, pero conviene limpiarla).
3. Verificar al día siguiente: fila de hoy con `valor_clp` ~41.000, `tipo_cambio_usd` ~950-970, `fuente=mindicador`; filas de fin de semana con nota de arrastre.

### Promedios de comparables (motor)
4. En `C_Formulas`, editar `F_UFm2_promedio` (`recFcpOeKjXNunBlj`) — ya está linkeada a las 6 reglas activas: `expresion` → `n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna`; `variable_output` → `promedio_uf_m2_muestra` (rename seguro: verificado que ninguna otra fórmula usa `uf_m2_promedio`); `version` → v3.2.
5. Crear fila nueva `F_DesviacionVsPromedio`: `variable_output=desviacion_vs_promedio_pct`, `expresion=(n_comparables > 0 && promedio_uf_m2_muestra > 0 && sup_construccion_m2 > 0) ? ((valor_comercial_uf / sup_construccion_m2) / promedio_uf_m2_muestra - 1) * 100 : 0`, `orden_topologico=90`, activa, unidad %, v1.0; linkearla a las mismas 6 reglas. (**NO** crear columnas en TX_Calculos: el DAG escribe filas por fórmula, no columnas.)
6. Pegar `AT03_Calculos_DAG.js` (v11.2.0_v32b1) en la automation AT03. Verificación: correr una solicitud CON comparables (p.ej. VP-2026-0067) → log `COMPARABLES: filas=… promedio_uf_m2=…` y filas nuevas en TX_Calculos; una SIN comparables debe calcular igual (promedio 0, sin abort).

### Saneo de datos en Airtable (P2-5)
7. `C_AutomationsAirtable` (`tblYYtKEaPgH7GfY0`): AT02 (`recqlVivdf6evD7SB`) y AT04 (`recqvXu6hZ9SGL2ZZ`) dicen "Activo" → real **undeployed**; AT08 (`recxWkj3x8tzqzHmo`) actualizar nota (draft undeployed, script pendiente de paste); crear 4 filas faltantes: AT03-Ext (`wflQloTxAcjauDEZ9`), AT-RF09-Trigger (`wflIEucD1MxxcNXH8`), AT-RF09-Trigger-Update (`wfl7O0QDAtma54ceO`), CRON_UF_Diaria (`wflQ9NC7dHcuY6Hh0`); actualizar la descripción de CRON_UF_Diaria en Airtable (aún dice "PENDIENTE placeholder").
8. `A_DecisionesMotor` `rec8lxTwMAqXyncex`: `solicitud_codigo` `"VP-NaN-0066"` → `"VP-2026-0066"` (ojo: el generador del NaN es AT01 — si reaparece, es fix de script aparte).
9. `TX_DocumentosGenerados` `recrsrf5lfLBqxNDk` (seed demo CI-024, Link `solicitud` vacío): borrarla (recomendado) o poblar el Link → `recNiwM4s1ibr3sbO`.
10. `Z_EscenariosMake`: fila nueva SC-SLA-Envio v1.0 (id 7597712, scheduler 900s, hoy inactivo); corregir `SC01_Airtable_Make` (`rec9Y9qpxNcptaivi`: su id 5748459 es E1, no el SC01 real 6483077); agregar filas de SC-Asignar (6681939), SC-Edicion (6682031), SC-Adjuntos-Upload (6839979/6527528) y SC-RF09 (6554321).

### Decisión pendiente (no bloquea)
11. **A4 (P1-6b)**: redeclarar año/superficies/material de RF-09 de `TX_Unidades` → `TX_DatosTasacion` (gate doble-escritor; el guard `origen_dato=tipeado` ya media). Tras el hallazgo de P1-6a, A4 es la ÚNICA acción real pendiente de ese frente. Sin apuro: cuando decidas, es una tanda corta.

## 4 · Desvíos reportados (regla "detener y reportar, no improvisar")

1. **P1-6a: premisa del roadmap no reproducible en la base** — cerrado sin acción, subsumido en A4/P1-6b (detalle en §1). El roadmap §2 queda corregido de facto por este cierre.
2. **"2 columnas en TX_Calculos" del roadmap era un no-op**: el DAG escribe filas (`variable_output`→resultado), no columnas; el ensamblador ya las lee así. Adaptado al patrón real.
3. **`F_UFm2_promedio` ya estaba linkeada** a las reglas (el roadmap pedía linkearla); lo pendiente real era re-expresarla (paso 4).
4. Evento de fallo del cron normalizado a campos reales de A_Eventos (el texto viejo concatenaba fechas en `tipo_evento`); `uf_fetch_fallido` sigue siendo prefijo común, el crítico se distingue por igualdad exacta.
5. `docs/schema-airtable.md` §9 describe A_Eventos con `datos_json` y sin `severidad` — el schema real tiene `detalle_json` y `severidad`; anotado aquí, no corregido (fuera del bloque del agente A; candidato a próximo saneo).

---
*Estado: TANDA T-ARREGLOS-DOCS-20260925 CERRADA · 999/999 tests · build limpio · cero writes fuera del repo.*
