# CIERRE — TANDA T-AUDIT-CLOSE-20260923

> FASE 2 ejecutada 2026-09-23. Cambios como **working-tree sin commitear sobre `plan/T-AUDIT-CLOSE-20260923`**
> (el branch `feat/` + commit los hace Sergio · R12). Opción 1 confirmada por Sergio: **no inventar datos;
> el resto aborta por diseño**. NO commit / NO push. Publish AT03 + deploy AT08 = **pasos manuales en UI** (§5).

## §1 · Alcance ejecutado
- **C1/C2** guards H5/H6/H7 fail-ruidoso en `AT03_Calculos_DAG.js` (molde H3). ✅ artefacto reimport-ready.
- **A5 (H8)** verificación routing `avaluo_fiscal_clp`. ✅ ya alineado, sin cambio.
- **M1** captura AT01 live → repo (single source). ✅
- **M2** volcado AT02/AT04 a repo. ✅
- **M3** AT08 con idempotencia por `clave_natural` (prefijo `AT08:`) + lectura `sla_semaforo_etapa`, DRY-RUN. ✅ artefacto (draft, sin deploy).
- **A3** `C_VariablesCliente` (ya existe, EAV): estructura documentada + fila SOLO sintético. ✅
- **CI-071** verificación fotos `claveAdjuntoDeCategoria` + tests. ✅
- **S1/S2** cliente/comuna sintéticos (fixtures guards) + regresión 13/13 live. ✅
- **Batería de tests** ~35 (unit/integración/regresión/smoke). → §6.

## §2 · Divergencias plan-vs-realidad detectadas en BLOQUE 0 (3)
1. **El MCP claude_ai_Airtable SÍ lee automations** (`get_automation` devuelve el `script`).
   El plan §8 asumía que no → M1 se resolvió por captura directa, no reconstrucción.
2. **`C_VariablesCliente` YA EXISTE** (`tblgrY8j4ugFzS7v9`) como tabla **EAV** (clave/valor/tipo/link→cliente),
   no columnar. A3 pasó de "crear tabla" a "confirmar estructura + fila sintética".
3. **El 3er atributo H10 se llama `sup_m2`** (no `sup_construccion_m2`). Record IDs correctos; el nombre interno diverge.

## §3 · A4 (H10) — DETENIDO (gate de mapeo) + A5 (H8) OK
**A4 = DETENER** por instrucción explícita ("si el mapeo no está garantizado, DETENER A4").

Confirmación del mapeo `sup_m2` ↔ `sup_construccion_m2` (evidencia anclada):
- `D_TipoDocumentoAtributo.uso_campo_destino` = `fld8qt6J2vDHytiHL`. Valores de los 3 recs:
  - `recHzaRLGLOueQWKY` → `anio_construccion` ✅ (TX_DatosTasacion tiene `anio_construccion` `fldzhntDWwfcy5jwP`; DAG lee `datosCrudo.anio_construccion` `:968`).
  - `recYwrGMxW0PGqbxe` → `sup_terreno_m2` ✅ (TX_DatosTasacion `sup_terreno_m2` `fld2s1wiRstEiMBY8`; DAG `:974`).
  - `recycv6hnoK9krfxg` → **`sup_m2`** ❌ **TX_DatosTasacion NO tiene columna `sup_m2`**. `AT03-Ext.escribirDestino` →
    `getFieldByName(TX_DatosTasacion,'sup_m2')` = null → "campo destino no existe — skip" → **no escribe nada**.
    El DAG lee `datosCrudo.sup_construccion_m2` (`AT03_Calculos_DAG.js:971`), nunca `sup_m2`.
- ∴ **el mapeo NO está garantizado por ningún punto del código.** Redeclarar `recycv6hnoK9krfxg` a
  `una_por_solicitud→TX_DatosTasacion` escribiría en una columna inexistente y el motor no lo leería.
- Riesgo adicional: TX_DatosTasacion **ya tiene** `sup_construccion_m2` poblado por otra vía (VP-2026-0066 = 249.91,
  origen tipeado/UI), por lo que redeclarar estos 3 atributos introduce un 2º escritor → media-migración peligrosa.

**Fix requerido (fuera de alcance, decisión de Sergio):** cambiar
`recycv6hnoK9krfxg.uso_campo_destino` de `sup_m2` → `sup_construccion_m2` ANTES de cualquier redeclaración.
Los 3 atributos siguen HOY en `una_por_unidad→TX_Unidades` (pre-estado intacto, sin cambios).

**A5 (H8) = OK.** `avaluo_fiscal_clp` (`recyQ1xHx5kVNXeoB`): `uso_campo_destino=avaluo_fiscal_clp`,
`uso_tabla_destino=TX_DatosTasacion`, `uso_cardinalidad_destino=una_por_solicitud`. TX_DatosTasacion tiene
`avaluo_fiscal_clp` (`fldE4t7FzB47FKTui`); DAG lo lee `:1036`. Alineado, cero código.

## §4 · Datos Airtable — clientes reales NO tocados + sintéticos añadidos
**Clientes/comunas reales: INTACTOS. No se pobló ni modificó ninguno.**
- MetLife (`recIg8NtVhptXkEUJ`) y Colina (`recKT9mUJkeq3YuBu`) ya tenían sus factores/precios → regresión verde.
- Comportamiento esperado de clientes reales SIN factores: **abort fail-ruidoso** (H5/H6) tras el deploy de AT03 —
  es exactamente lo que valida la auditoría, no un fallo.

**Registros sintéticos creados (borrables · §9 rollback):**
| Tabla | rec | Propósito |
|---|---|---|
| M_Clientes | `recLVk6eAbYMmS3xW` (SANDBOX_SinFactores_T-AUDIT-CLOSE) | sin factores → fuerza H5/H6 |
| M_Comunas | `recfJxiRgM1qDHiQK` (SANDBOX_SinPrecios_T-AUDIT-CLOSE) | sin uf_m2_* → fuerza H7 |
| C_VariablesCliente | `rec5vZU9BYj8ezbhz` (logo_url), `recIVTUqcMpnoxZvt` (nombre_revisor) | H9 fixture, link solo al cliente sintético |

> Nota: NO se creó una TX_Solicitudes sintética que dispare el AT03 vivo (sin guards aún) para no
> generar 13 `TX_Calculos` con los defaults silenciosos actuales. El live-fire de S1 se valida tras
> el reimport manual de AT03 (§5). Los guards se validan por los unit-tests port (§6) entretanto.

## §5 · Pasos manuales pendientes en UI Airtable (Sergio)
1. **Publicar AT03 con los guards** — automation `AT03_Calculos_DAG` (`wflSBI7cjLNc0rkV5`, nodo `wacWJgWg0PqVJ68aN`).
   Reimportar el script `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (con C1/C2) y **publicar**.
   Backup de rollback: `docs/_backups/AT03_pre-T-AUDIT-CLOSE_20260923.js`.
2. **Crear + desplegar AT08 en DRY-RUN** — no existe aún (confirmado inexistente en BLOQUE 0).
   Crear la automation con el script `docs/_artefactos/airtable/AT08_Alertas_SLA.js` (ya trae `DRY_RUN=true`,
   idempotencia por `clave_natural` con prefijo `AT08:` y lectura de `sla_semaforo_etapa`). Primer disparo SIN envío; revisar log; luego apagar DRY_RUN.
   Rollback: apagar/borrar el draft (§9).
3. **Campo `requiere_rentabilidad` (checkbox) en `M_TiposInforme`** (`tblOcsdiwxQLfD178`) — C3/H4.
   Se crea vía MCP en la sesión (OAuth pendiente al escribir esto) o manual en la UI. **Poblar los
   tipos que exigen rentabilidad ANTES del deploy del código C3**: checkbox desmarcado = sección H
   oculta (ver implicación de orden en `C3-H4-decision.md`).
4. **Crear + activar el cron "UF diaria"** — seguir `docs/_artefactos/airtable/CRON_UF_Diaria_DEPLOY.md`
   (trigger diario 08:00 America/Santiago + script `CRON_UF_Diaria.js`). **Antes de publicar el AT03
   con guards** (paso 1): sin este cron, H3 aborta toda tasación cuya fecha no esté en `H_PreciosUF`.

## §6 · Batería de tests — 81/81 verde · typecheck limpio (2026-09-23 16:19)
`pnpm typecheck` limpio (tsc --noEmit, 0 errores). `pnpm exec vitest run` sobre los 5 archivos de la tanda:
**5 archivos · 81 tests · 81 passed · 0 skip/todo.** Evidencia: `docs/_evidencia/T-AUDIT-CLOSE-20260923/tests-output.txt`.

| Archivo | Casos | Cubre |
|---|---|---|
| `lib/tasador/motor-guards-cliente-comuna.test.ts` | 10 | Unit U-H5-01/02/03 · U-H6-01/02/03 · U-H7-01/02/03 · U-H567-EVT (port de los 3 guards: throw + evento + sin default; MetLife/Colina NO disparan) |
| `lib/tasador/motor-ports-t-mc-p0.test.ts` | 29 | Regresión R-08..R-17 + 4 CLP + R-SCOPE + R-17 (hay_cuadro=0) contra oráculo VP-2026-0066 ±1%/±0,01 UF, sobre los ports T-MC-P0 |
| `lib/tasador/motor-at01-at08-integ.test.ts` | 8 | Integración I-AT01-01/02/03 · I-AT08-01/02 · I-CALC-409 (+2) contrato/lógica con vi.mock |
| `lib/tasador/tipo-documento-foto.test.ts` | 2 | Smoke S-H9 (forma dato logo por cliente) · CI-071 (clave_adjunto fotos) |
| `lib/tasador/fotos.test.ts` | (resto) | CI-071 cobertura categoría→clave_adjunto |

HECHO = batería verde + tsc + vitest. La regresión 13/13 MET-6283 también verificada **en vivo** (§ regresion.md).

## §7 · Auditor ciego — BLOQUE 3
Ver `docs/_evidencia/T-AUDIT-CLOSE-20260923/auditor.md`. Veredicto: **CIERRA CON RESERVAS**
(23-09-2026). Las reservas eran los 3 huecos que los forks interrumpidos dejaron sin cerrar;
se resolvieron el mismo día — ver §8.

## §8 · Reapertura post-auditor (23-09-2026, sesión Max) — reservas resueltas
1. **auditor.md** (BLOQUE 3): generado por agente ciego independiente. Verificó guards,
   AT01/AT02/AT04/AT08, tests re-ejecutados (81/81 entonces) y §8 NO-TOCAR intacto.
2. **C3 · gating H4 IMPLEMENTADO** — Opción 1 confirmada por Sergio: checkbox
   `requiere_rentabilidad` en `M_TiposInforme`; la UI solo obedece. Cadena completa +
   semántica + fail-safe + implicación de orden de deploy en
   `docs/_evidencia/T-AUDIT-CLOSE-20260923/C3-H4-decision.md`. Smoke S-H4-01/02/03 en
   `lib/tasador/rentabilidad.test.ts` (10 casos). Gates: `tsc` limpio · **suite completa
   917/917 verde (52 archivos)** · `pnpm build` exit 0. El campo en Airtable se crea vía
   MCP (OAuth) o manual — ver §5.3.
3. **M4 · cron "UF diaria" — ARTEFACTO LISTO, NO DESPLEGADO** (instrucción de Sergio):
   `docs/_artefactos/airtable/CRON_UF_Diaria.js` (Airtable Automation · mindicador.cl ·
   idempotente · lookback 7 días · fallo = no escribe + `A_Eventos uf_fetch_fallido`,
   H3 aborta por diseño) + `CRON_UF_Diaria_DEPLOY.md` (pasos UI, backfill, rollback).
4. **Nota AT08 corregida en §1/§5**: la idempotencia es por `clave_natural` con prefijo
   `AT08:` (no existía ningún `clave_notif`).
5. **A4 (H10) DIFERIDO por decisión de Sergio**: el fix `sup_m2 → sup_construccion_m2`
   (`recycv6hnoK9krfxg.uso_campo_destino`) lo revisa él aparte; nada se tocó (§3 intacto).
