# Snapshot P5 — Panel lista + vistas + filtros + búsqueda + orden

- **Fecha:** 2026-07-22 21:59 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` y `pnpm build` limpios (exit 0)

## Decisiones de Sergio aplicadas
- Enum `Vista` = 5 del plan (`mi_cartera · sla_riesgo · por_asignar · aprobadas · todas`); eliminados `reasignar`/`pausadas`.
- Sin deps nuevas (URL params + refetch nativo + `input type=date` + `useDebounce` propio).

## Archivos
- `lib/use-debounce.ts` (nuevo).
- `lib/solicitudes.ts`: nuevo enum + `VISTA_DEFAULT` + `OrdenParam`/`ORDENES_VALIDOS`; `buildVistaFormula` (por_asignar, todas=TRUE()); filtros prioridad/tasador/q; `ordenToSort`; `fetchSolicitudes(…, orden)`.
- `app/(ejecutiva)/consola/page.tsx`: lee todos los params, default `todas`, paginación slice.
- `app/api/solicitudes/route.ts` + `contadores/route.ts`: `mi_cartera`, params extendidos.
- `components/console/console-shell.tsx`: props total/page/pageSize, `mi_cartera`, estado vacío.
- `components/console/solicitud-list.tsx`: reescrito URL-driven (buscador, tabs+contadores, 4 filtros, rango fechas, orden, paginación, limpiar filtros).
- `app/page.tsx` (landing mock): props nuevas + `<Suspense>` (fix build).
- `lib/console-data.ts`: const `PRIORIDAD`.

## Verificado
- Build genera 5 páginas; endpoints presentes.
- Todo el estado de UI persiste en `searchParams` (URL compartible, back/forward funciona).

## Deuda
- Contadores fetch una vez al montar (no refresca tras crear/asignar hasta re-navegar).
- Orden por prioridad best-effort (orden de opciones del singleSelect).
- `app/page.tsx` landing mock legacy → evaluar redirect a `/consola` (P9).
- Master-detail conservado (no ruta `/solicitudes/[id]`) — override consciente.

## Siguiente paso
- P6 — Panel detalle (Reglas A/C ya implementadas en `solicitud-detail.tsx`; extender bloques de la pestaña Datos, cablear asignación/edición a rutas reales es P7/P9).
