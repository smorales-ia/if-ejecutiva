# Snapshot P3 — Wizard de creación (3 fases)

- **Fecha:** 2026-07-22 20:52 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)

## Qué cambió
- `components/console/new-request-sheet.tsx` (extendido in-place):
  - Estados nuevos `confirmSinDocs`, `confirmDescartar`.
  - `procesarDocumentos()` separado de `continuarDesdeModo()`.
  - "Continuar" (Fase 1) siempre habilitado con modo elegido; sin docs abre `AlertDialog` "¿Continuar sin documentos?".
  - Cerrar el Sheet con datos en curso abre `AlertDialog` "¿Descartar la solicitud en curso?" antes de `resetAll()`.
  - 2 `AlertDialog` controlados agregados tras el `SheetFooter`.

## Estado del wizard (recordatorio)
- Skeleton preexistente: Sheet + Stepper + Fase 1 (modo, RadioCards, FileUploadZone) + Fase 2 (tipo nuevo/usado) + Fase 3 (formulario RHF+zod completo).
- Navegación "Volver" preserva `modo`/`tipoNU` (estado separado del form).

## Deuda (para P siguientes)
- Extracción RF-09 mock (`setTimeout` + `EXTRACCION_MOCK`) → P9.
- `onSubmit` mock, no llama a `POST /api/webhooks/crear-solicitud` → P4/P9.

## Siguiente paso
- P4 — Formulario 4 secciones + REGLA B. El formulario ya vive en la Fase 3 de `new-request-sheet.tsx` + `lib/validators/nueva-solicitud-interna.ts`. Verificar Alert destructivo persistente (ya existe `mostrarResumen`/`recolectarErrores`) y cablear submit real.
