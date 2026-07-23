# Snapshot P2 — API Routes

- **Fecha:** 2026-07-22 20:13 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)

## Rutas nuevas / actualizadas
| Método | Ruta | Escribe vía | Estado |
|---|---|---|---|
| POST | `/api/solicitudes/[id]/asignar` | Make SC-Asignar | mock `pendiente_make` (Make sin provisionar) |
| PATCH | `/api/solicitudes/[id]` | Make SC-Edicion | mock `pendiente_make` |
| GET | `/api/solicitudes/contadores` | Airtable directo | funcional |
| GET | `/api/tasadores/candidatos?comuna=X` | Airtable directo | funcional (sin cobertura, H-05) |

## Archivos
- `lib/validators/acciones-solicitud.ts` (nuevo): `asignarSolicitudSchema`, `editarSolicitudSchema`, `issuesToCampos()`.
- `app/api/solicitudes/[id]/asignar/route.ts` (nuevo).
- `app/api/solicitudes/[id]/route.ts` (+PATCH).
- `app/api/solicitudes/contadores/route.ts` (nuevo).
- `app/api/tasadores/candidatos/route.ts` (nuevo).
- `.env.example` (+`MAKE_WEBHOOK_URL_SC_ASIGNAR`, `MAKE_WEBHOOK_URL_SC_EDICION`).

## Contrato de error (REGLA B)
- 422 `{ error:'validacion', campos:[{campo,motivo}] }`
- 409 `{ error:'conflicto_negocio', campo, motivo }`
- 502/400/401/404 con mensaje humano canónico donde aplica.

## Diferido (no es deuda oculta, es secuencia)
- Filtros ampliados de `GET /api/solicitudes` (q, orden, prioridad, tasador, page, pageSize) → P5 (junto a la reconciliación del enum `Vista`).
- Validación server-side RN-44 en `asignar` → P6/P9 (requiere `unidades`/`contactos` en Airtable).
- Smoke test end-to-end de escrituras → P9 (Make por provisionar).

## Siguiente paso
- P3 — Wizard de creación (3 fases). Extender `components/console/new-request-sheet.tsx` in-place (ya tiene Stepper + 3 fases); no crear carpeta `wizard-nueva-solicitud/`.
