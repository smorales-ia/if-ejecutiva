# Snapshot P8 — Sheet Documentos y Adjuntos

- **Fecha:** 2026-07-22 22:32 (-04)
- **Estado:** ✅ completada · `pnpm tsc --noEmit` limpio (exit 0)

## Qué cambió
- `documentos-adjuntos-sheet.tsx`: nueva prop `readOnly?: boolean`; `soloLectura = readOnly ?? estado !== "creada"` (respeta RN-59 del padre con fallback).
- `solicitud-detail.tsx`: pasa `readOnly={soloLectura}` al sheet.

## Verificado (ya implementado por v0, sin cambios)
- Checklist de 15 tipos (`TIPOS_DOCUMENTO`); subir por fila con preview; `FileUploadZone` para adjuntos libres.
- Confirmación al desmarcar documento con archivo (`AlertDialog`).
- Modo consulta: solo Ver/Descargar (`ChecklistConsulta`/`AdjuntosConsulta`).

## Deuda declarada
- Subida real (solicitud_id + tipo_documento → `/api/adjuntos/upload`) desde el detalle → P9 (mock/real, como P6/P7).
- Archivos en estado local del sheet, no persisten a Airtable → P9.

## Siguiente paso
- P9 — Deploy y validación en Railway. **Contrato 🔴 pausa-total.** Barrido de mocks, health check, `pnpm build`+`lint`, env vars `.env.example`, smoke test. Cablear los `pendiente_make`/optimistas a Make real cuando esté provisionado; evaluar router.refresh y redirect de `/`→`/consola`.
