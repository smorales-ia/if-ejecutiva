# Snapshot P6 — Panel detalle

- **Fecha:** 2026-07-22 22:08 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)

## Qué cambió
- `lib/console-data.ts` · `mockDatosSii`: `avaluoTotal` ahora es la suma real de los avalúos por unidad (RN-48).

## Verificado (ya implementado por v0, sin cambios)
- Reglas A/C en `solicitud-detail.tsx`: Editar (solo `creada`), Asignar (solo sin tasador + estado permite), Documentos (siempre), modo consulta RN-59.
- Tooltip RN-44 en `AssignPrimaryButton` con lista de faltantes.
- Pestaña Datos: 11 bloques. Historial + Adjuntos.

## Deuda declarada
- Detalle en estado mock en memoria; asignar/editar no llaman a `/api/solicitudes/[id]/asignar` ni `PATCH` → P7/P9.
- Bloques mock (SII/legales/motor) → datos reales en P9.
- Master-detail conservado (no ruta `/solicitudes/[id]`) — override.

## Siguiente paso
- P7 — Diálogo de asignación (cmdk). Extender `asignar-tasador-dialog.tsx`; migrar a `Command`/cmdk + `GET /api/tasadores/candidatos`; cablear a `POST /api/solicitudes/[id]/asignar`. **Modo `default` · contrato 🔴 pausa-total** (cambia estado real + dispara correo).
