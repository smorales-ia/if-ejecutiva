# Snapshot P4 — Formulario + REGLA B

- **Fecha:** 2026-07-22 21:19 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)
- **Alcance:** solo validación / REGLA B (submit real → P9).

## Qué cambió (`new-request-sheet.tsx`)
- `alertRef` + `scrollAlResumen()` → scroll al resumen de errores tras submit inválido (§5.1.5), en `onInvalid` y en el conflicto de N° operación.
- Wording canónico "N campos con problema" en toast y AlertTitle.
- Alert destructivo envuelto en `<div ref={alertRef}>`.

## Estado REGLA B (cumplido)
- Toast: primeros 3 errores (`campo: motivo`) + "+N más".
- Alert destructivo persistente: lista completa, bloques repetibles nombrados ("Unidad 2 · Superficie construida").
- N° operación duplicado → `setError` en su campo + toast + Alert (conflicto separado de forma).
- "En trámite" y "Financiero" gated por `esNuevo`.

## Mensajes §6 (resueltos en P4)
- Restaurados en `nueva-solicitud-interna.ts`: email + dirección (con `tieneCalleYNumero`) literales §6; RUT con literal adaptado a "comprador".

## Deuda declarada
- RN-45 por superficie (hoy: un origen + un respaldo por unidad) → reforma schema+UI.
- Submit real + navegación al detalle → P9.

## Siguiente paso
- P5 — Panel lista + vistas + filtros + búsqueda + orden. Extender `solicitud-list.tsx` + `console-shell.tsx`. Reconciliar enum `Vista` (repo: `activas|sla_riesgo|reasignar|pausadas|aprobadas|cartera` vs plan). Ampliar `GET /api/solicitudes` (q, orden, prioridad, tasador, page). Evaluar deps ausentes: `swr`, date-range, debounce.
