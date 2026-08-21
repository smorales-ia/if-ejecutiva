# Plan Frente C — RF-TAS-05 · Lectura de coordinación en IF-02

Fecha de esta versión: 2026-08-21
Branch de trabajo: `feat/coordinacion-ejecutiva`
Contexto: RF-TAS-05 (visibilidad de coordinación para la ejecutiva). CI-012 cerrada positiva
(19-ago-2026). `TX_CoordinacionVisita` (`tblBwMErRxo57ML2r`) existe, 0 filas al 2026-08-21.

## Decisión de arquitectura (fija para todo el Frente C)

La "vigencia" de la coordinación **se computa server-side**, no en el schema de Airtable.

- Airtable rollup **no soporta `LAST`/`FIRST`** ni acceso posicional, y no hay formulas cross-table.
  Ver aprendizaje 2026-08-21 en `docs/aprendizajes.md`. Por eso `coordinacion_vigente` **no** se
  convirtió en derivado.
- `TX_Solicitudes.coordinacion_vigente` (singleSelect, `fldI4Dv0jpRQvbdHl`) queda **idéntico al pre-C1**.
  Lo sigue escribiendo la ruta del tasador (`app/api/tasaciones/[id]/coordinacion/route.ts`). **IF-02 NO
  lo lee.** Es redundancia inofensiva del lado tasador; no se toca.
- El desenlace vigente y el historial de intentos que IF-02 necesita salen **directo de
  `TX_CoordinacionVisita`**, leída y ordenada en el Route Handler.

## Estado de C1 (cerrado)

Reducido a: revertir el rename (base limpia) + registrar aprendizaje + reescribir este plan. **No tocó
código, tests ni field-ids.** Ver `docs/_notas/cierre-C1.md`.

---

## C2 · Lectura server-side de coordinación para IF-02

- **Objetivo:** exponer, por solicitud, (a) el desenlace de coordinación vigente y (b) la lista de
  intentos para el timeline.
- **Cómputo:** leer `TX_CoordinacionVisita` (`tblBwMErRxo57ML2r`) filtrando por la solicitud
  (por `solicitud_record_id` / link `solicitud`), **ordenando por `fecha_respuesta DESC`**.
  - `coordinacionVigente` = `estado_coordinacion` de la fila más reciente, o `null` si no hay filas.
  - Lista de intentos (todas las filas, con `estado_coordinacion`, `fecha_respuesta`, `motivo`,
    `detalle`/`nota`, `intento_numero`) → alimenta el timeline de la pestaña Historial (C4).
- **Toca:** nuevo lector en `lib/` (p.ej. `lib/coordinacion-airtable.ts`) + su test co-ubicado. Fundir
  los eventos de coordinación en `lib/historial-airtable.ts` (hoy `fetchHistorialSolicitud` sólo lee
  A_Eventos + A_Cambios; el comentario 165-177 documenta que la coordinación "no se lee todavía").
- **NO toca:** schema Airtable · la ruta del tasador · `coordinacion_vigente` (singleSelect) · UI.
- **Precondición:** para validar end-to-end hace falta ≥1 fila de prueba en `TX_CoordinacionVisita`
  (escribe Airtable → decisión aparte, hoy 0 filas). Los tests unitarios se cubren con mocks.
- **Verificable:** `pnpm tsc --noEmit && pnpm build && pnpm test` verde + test unitario del lector
  (mapea filas → items ordenados por `fecha_respuesta`; caso 0 filas → `null`).
- **Commit sugerido:** `feat(cu-002): lee TX_CoordinacionVisita y funde la coordinación en el historial (RF-TAS-05)`

## C3 · UI pestaña Datos — bloque "Coordinación" (§1.3.2)

- **Objetivo:** mostrar en `DatosTab` el desenlace vigente (confirmada / rechazada / sin coordinar) y
  los datos de la última coordinación (fecha propuesta o motivo+detalle según la rama).
- **Fuente:** el desenlace computado en C2 (server-side), **no** `coordinacion_vigente` de TX_Solicitudes.
- **Toca:** `components/console/solicitud-detail.tsx` (`DatosTab`) + posible subcomponente en
  `components/console/` + test.
- **NO toca:** HistorialTab · Adjuntos · ruta tasador · schema.
- **Precondición:** C2 cerrada.
- **Verificable:** build verde + test del bloque (estados confirmada/rechazada/sin-coordinar).
- **Commit sugerido:** `feat(cu-002): agrega bloque Coordinación a la pestaña Datos del expediente (RF-TAS-05)`

## C4 · UI pestaña Historial — eventos de coordinación en el timeline

- **Objetivo:** surface de los intentos de coordinación (fundidos en C2) dentro de `HistorialTab`.
- **Toca:** `components/console/solicitud-detail.tsx` (`HistorialTab`) · `lib/use-historial-solicitud.ts`
  si hace falta tipar el nuevo ícono/estado del ítem · test.
- **NO toca:** DatosTab · schema · ruta tasador.
- **Precondición:** C2 cerrada.
- **Verificable:** build verde + test del render del ítem de coordinación en el timeline.
- **Commit sugerido:** `feat(cu-002): muestra eventos de coordinación en la pestaña Historial (RF-TAS-05)`

## Orden y dependencias

C2 → (C3 ∥ C4). C3 y C4 son independientes entre sí una vez cerrada C2, pero comparten
`solicitud-detail.tsx`: hacerlas seguidas para evitar conflicto de merge.
