# Snapshot P1 — Types TypeScript

- **Fecha:** 2026-07-22 19:xx (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)

## Qué cambió
- `lib/console-data.ts`:
  - `Solicitud` extendida con 6 campos v1.9 **opcionales** (no rompen mocks): `ejecFormalizador`, `modoCreacion`, `tipoClienteOrigen`, `origenDireccion`, `emailThreadId`, `nivelSla`.
  - Nuevos catálogos `as const` + tipos: `MODO_CREACION`/`ModoCreacion`, `TIPO_PERSONA`/`TipoPersona`, `NIVEL_SLA`/`NivelSLA`, `ORDEN_SOLICITUDES`/`OrdenSolicitudes`.
  - Uniones derivadas de arrays existentes: `CanalOrigen`, `TipoClienteOrigen`, `TipoBien`, `OrigenSuperficie`, `EstadoConservacion`, `Material`, `OrigenDireccion`, `OrigenDatoVendedor`, `RolContacto`, `EstadoContacto`, `MotivoReasignacion`.
- `docs/construccion.md`: fila P1 marcada ✅.

## Decisiones clave
- Tipos viven en `lib/console-data.ts` (no se creó `lib/types/`) — override del inventario.
- camelCase del repo, no snake_case del plan.
- Uniones derivadas con `(typeof ARRAY)[number]` sobre los valores-label existentes; las entidades (`Unidad.tipoBien`, etc.) siguen como `string` para no romper el mapeo del form. Las uniones quedan disponibles para adopción en P4/P5.
- `Vista`/`VistaSolicitudes` NO se tocó: su reconciliación (enum repo vs plan) es tarea de P5.

## Siguiente paso
- P2 — API Routes: crear `PATCH /api/solicitudes/[id]`, `POST /api/solicitudes/[id]/asignar`, `/contadores`, `/tasadores/candidatos`, `/catalogos/*`, reutilizando `lib/airtable-client.ts` y `lib/make-client.ts`.
