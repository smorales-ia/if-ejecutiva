# Cierre C1 — RF-TAS-05 · coordinacion_vigente

Fecha: 2026-08-21
Branch: `feat/coordinacion-ejecutiva` (desde main)
Estado: ✅ **CERRADO** (C1 reducido). Sin commit — commiteás vos por GitHub Desktop.

---

## Qué pasó

C1 original pretendía convertir `TX_Solicitudes.coordinacion_vigente` (singleSelect escrito por la ruta
del tasador) en un campo **derivado** con la fórmula de la spec §2.12:
`LAST(TX_CoordinacionVisita.estado_coordinacion ORDER BY fecha_respuesta DESC)`.

En la ejecución aparecieron dos límites técnicos de Airtable, uno detrás del otro:

1. **El MCP de Airtable no expone `delete_field`.** No se puede borrar una columna por API (solo desde la
   UI web). El "borrar y recrear" del plan no era ejecutable → se optó por rename + create (Opción 1).
2. **El rollup no acepta `LAST(values)`.** Airtable respondió `422: Unknown function names: LAST`. Las
   funciones de agregación de rollup no incluyen `LAST`/`FIRST` ni acceso posicional, y no hay formulas
   cross-table. **La "coordinación más reciente" no es derivable en el schema de Airtable.**

## Decisión tomada

**Opción B, con C1 reducido.** El cómputo de la vigencia se mueve a **server-side (C2)**: un Route Handler
leerá `TX_CoordinacionVisita` filtrando por solicitud y ordenando por `fecha_respuesta DESC`. Como el
cómputo vive server-side, **no hay razón para tocar el PATCH del tasador ni sus tests** en esta tanda: el
singleSelect `coordinacion_vigente` queda como redundancia inofensiva del lado tasador (que lo sigue
escribiendo) y **IF-02 simplemente no lo lee**.

C1 quedó reducido a: **revertir el rename + registrar aprendizaje + reescribir el plan de C2/C3/C4.**

## Estado final

- **Base Airtable: idéntica al pre-C1.** Se revirtió el rename vía MCP
  (`coordinacion_vigente_legacy` → `coordinacion_vigente`). Verificado con `get_table_schema`:
  field_id `fldI4Dv0jpRQvbdHl`, tipo `singleSelect`, choices `confirmada` (`selYCOcx7MLtNg58N`) y
  `rechazada` (`selMBEIzaZ7speGnL`). **Sin campos residuales** — no quedó ningún `_legacy`.
- **Código / tests / field-ids: intactos.** No se tocó nada (así lo pidió el alcance reducido).
- **Aprendizaje registrado** en `docs/aprendizajes.md` (entrada 2026-08-21): límite de rollup (`LAST` no
  existe), regla derivada (vigencia temporal = compute server-side), límite del MCP (`delete_field` no
  existe → borrado de columnas solo por UI).
- **Plan C2/C3/C4 reescrito** en `docs/_notas/plan-frente-C.md` con el enfoque server-side.

## Verificación (todo verde)

| Verificación | Resultado |
|---|---|
| `pnpm tsc --noEmit` | ✅ verde |
| `pnpm build` | ✅ verde — `✓ Compiled successfully in 52s` (los `DYNAMIC_SERVER_USAGE` en `/tasaciones` son logs esperados de rutas dinámicas server-rendered, no errores de build) |
| `pnpm test` | ✅ verde — **415 passed** (20 archivos) |

## Archivos modificados para commitear

Solo documentación (ningún cambio de código ni de schema en el repo):

1. `docs/aprendizajes.md` — nueva entrada 2026-08-21.
2. `docs/_notas/plan-frente-C.md` — **nuevo**, plan C2/C3/C4 con enfoque server-side.
3. `docs/_notas/cierre-C1.md` — **nuevo**, este cierre.

## Recordatorio

No quedó deuda de limpieza en Airtable: el campo `coordinacion_vigente_legacy` **ya no existe** (se
revirtió al nombre original). No hay nada pendiente de borrar en la UI.

## Siguiente

Frente C continúa en **C2** (lectura server-side de `TX_CoordinacionVisita`), según
`docs/_notas/plan-frente-C.md`. Para validar C2 end-to-end hará falta sembrar ≥1 fila de prueba en
`TX_CoordinacionVisita` (escribe Airtable → decisión aparte; hoy 0 filas).
