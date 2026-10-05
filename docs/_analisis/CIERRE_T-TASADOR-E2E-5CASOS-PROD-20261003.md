# CIERRE · T-TASADOR-E2E-5CASOS-PROD-20261003 (Fase 1 cerrada · GATE detenido)

**Fecha:** 2026-10-03 · **Rama:** `plan/T-TASADOR-E2E-5CASOS-PROD-20261003`
**Resultado:** Fase 1 (planificación) **completa**; **GATE DETENIDO** antes de escribir en
producción (Fase 2), a la espera de 3 decisiones de Sergio. Cero escrituras en producción.

## Qué se hizo (Fase 1 · 5 agentes expertos en paralelo, solo lectura)

- **Inventario + emparejamiento** PDF↔XLSM confirmado (5/5), todos formato Value Property 8 págs
  (= MET-6283). 5 instituciones distintas.
- **Oráculo extraído** celda-a-celda por caso (valores exactos, Hoja 3, dólar y los dos % de
  ajuste propios de cada caso; huecos documentados) → PLAN §5.
- **Mapa VISTA→ESTADO→URL** completo sobre producción (`…railway.app`) → PLAN §4.
- **Auditoría motor-input↔UI** + huecos de producto priorizados → PLAN §6.
- **Mapeo a Airtable + render chain + Clerk** → PLAN §7/§12.
- **Seguridad/hard-rules** → PLAN §10/§11.

## Por qué se detuvo el GATE (no es un touch-up como VP-0067)

1. **Alcance real:** 4 de 5 casos **no existen** en Airtable; el 5º está **cancelado** sin render.
   Hay que **construir 5 tasaciones completas desde cero** (crear solicitud, ~8 docs fuente,
   comparables/ofertas/recintos/superficies de Hojas 2/3, ~16 fotos por caso extraídas del PDF,
   render E2/E3). VP-0067 es un sandbox hand-seeded; replicarlo ×5 es trabajo mayor.
2. **Tablas compartidas:** para que AT03 calcule sin abortar hace falta onboarding de
   `M_Clientes` (factores de 4 clientes), `M_Comunas` (4 comunas) y `H_PreciosUF` (UF del día).
   Escribir ahí afecta a **otras solicitudes** de esos clientes/comunas (riesgo vs invariante
   "no romper otras solicitudes"). Alternativa de menor riesgo: sembrar los valores finales del
   oráculo directamente en cada solicitud (sandbox replica) **sin** correr AT03 ni tocar masters.
3. **Clerk cuenta 2** (`ganardineroporinternet29`) sin `clerk_user_id` resoluble → reparto 5→2 no
   ejecutable (fallback: las 5 a nutricionsaludketo=recTJcV3BIvdcG4em).
4. **UF del día (HP-C):** prerequisito que el propio motor marca "pendiente de Sergio".

## Decisiones pedidas a Sergio (para arrancar Fase 2)

- **D1 · Enfoque:** ¿"sandbox replica" (sembrar valores del oráculo sin tocar M_Clientes/
  M_Comunas/AT03 · menor riesgo · TIER-1) **o** onboarding real de masters + cálculo AT03 (más
  fiel pero escribe en tablas compartidas)?
- **D2 · Cuenta Clerk 2:** user_id de `ganardineroporinternet29` (o mapearlo a Hector/Nelcy), o
  asignar las 5 a nutricionsaludketo.
- **D3 · UF del día:** ¿sembramos H_PreciosUF con la UF/dólar del oráculo por caso, o despliegas
  el cron UF primero?

## Huecos de producto (objetivo A)

HP-A branding por-cliente (P0 del entregable: `logo_url` null para todos; MET salió con marca
Austral hardcodeada) · HP-B avalúo fiscal sin fallback de UI (RF-09 → `|| 0` silencioso) ·
HP-C cron UF sin desplegar · HP-D onboarding M_Clientes/M_Comunas · HP-E numero_solicitud ·
HP-F cualitativa Hoja 3 capturada-y-descartada. Detalle en PLAN §6.

## Paralelismo real

Fase 1: **5 agentes concurrentes** (oráculo, app/estados, datos/render, motor, seguridad) +
orquestador. Duración de agentes ~0,7–6,4 min cada uno en paralelo; secuencial habrían sido
~15+ min sumados. El orquestador resolvió el emparejamiento y el formato antes de fan-out.

## Artefactos

- `docs/_planes/PLAN_T-TASADOR-E2E-5CASOS-PROD-20261003.md` (completo)
- `docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/rollback.md`
- `docs/_analisis/CIERRE_T-TASADOR-E2E-5CASOS-PROD-20261003.md` (este archivo)
- Entrada en `docs/aprendizajes.md`
