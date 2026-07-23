# Snapshot P7 — Diálogo de asignación

- **Fecha:** 2026-07-22 22:23 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` y `pnpm build` limpios (exit 0)
- **Contrato:** 🔴 pausa-total (cada edit y comando confirmado por Sergio).

## Qué cambió
- `asignar-tasador-dialog.tsx`: `onConfirmado(tasadorId, nombre, nota)` (antes solo nombre); confirmación con 4 consecuencias (se agregó "Se enviará el correo de asignación al tasador").
- `solicitud-detail.tsx` · `handleConfirmado`: `async`, dispara `POST /api/solicitudes/[id]/asignar` con guarda de record-id real; estado optimista solo tras POST ok; toast §6 canónico "Solicitud asignada a {nombre}" (sin punto). Error → toast de red, sin aplicar.

## Comportamiento real
- `/consola` (ids recXXX): POST real → hoy `pendiente_make` (Make sin provisionar) → estado optimista aplicado.
- `/` (demo mock): sin POST (id no-record) → solo estado local.

## Deuda declarada
- Picker sigue con mock `TASADORES` (H-05: `M_Tasadores` sin cobertura/carga) → swap a `/api/tasadores/candidatos` cuando existan esos campos.
- `router.refresh()` tras asignar → P9 (cuando Make persista).
- RN-44 server-side → P9.

## Siguiente paso
- P8 — Sheet Documentos y Adjuntos. Extender `documentos-adjuntos-sheet.tsx` + `document-checklist.tsx` (checklist 15 tipos, `FileUploadZone`, `POST /api/adjuntos/upload`). Modo `accept edits on` · contrato 🟡.
