Ya hice exactamente este análisis en mi respuesta anterior — no hay cambios en el repo desde entonces (mismo HEAD `d6a252b`, sin commits nuevos). Resumen sin repetir todo el detalle:

## 1. Dónde quedamos
**Paso 2 — RF-05 completo** (`lib/solicitudes.ts`, `console-shell.tsx`, `solicitud-list.tsx` conectados a `TX_Solicitudes` real; commits `2f0c982`, `d6a252b`).
**Paso 3 — Detalle (lectura) arrancado, no cerrado**: `DatosTab` ya es real (hereda el objeto de la lista), pero `HistorialTab`/`AdjuntosTab`/`ReasignarTasadorDialog` siguen con mocks de `lib/console-data.ts` (`HISTORIAL`, `ADJUNTOS`, `TASADORES`, `VISADORES`).

⚠️ Divergencia con `construccion.md` (ya señalada, sigue vigente): no existen `app/api/solicitudes/[id]/route.ts`, `app/api/tasadores/route.ts`, `app/api/visadores/route.ts`; el repo usa un único `solicitud-detail.tsx` con sub-componentes internos en vez de archivos separados por tab.

## 2. Qué sigue
Cerrar **Paso 3 — Detalle de solicitud (lectura)** (construccion.md §5). Sin código RF propio en el documento; diseno.md lo agrupa bajo RF-05.

## 3. Precondiciones
- H-05 (`disponible`/`casos_en_curso`) sigue sin crear en `M_Tasadores` → usar fallback (`activo=TRUE`, `capacidad_activa DESC`). No bloquea.
- `A_Eventos` y `TX_Adjuntos` ya tienen campos confirmados en schema-airtable.md. No bloquea.
- Sin bloqueadores externos (Make/AT02) — es lectura pura.

## 4. Plan del paso (cerrable en esta tanda)
1. `app/api/solicitudes/[id]/route.ts` — GET detalle, reutilizando `lib/airtable-client.ts`.
2. `app/api/tasadores/route.ts` — GET con fallback H-05.
3. `app/api/visadores/route.ts` — GET filtrado `activo=true`.
4. `solicitud-detail.tsx`: `HistorialTab` → fetch real a `A_Eventos`.
5. `solicitud-detail.tsx`: `AdjuntosTab` → fetch real a `TX_Adjuntos`.
6. `ReasignarTasadorDialog`: pool real desde `/api/tasadores` y `/api/visadores` (solo lectura del pool; el submit simulado queda para Paso 5/RF-06).
7. `pnpm build` limpio antes de cerrar.

¿Confirmas para que empiece a escribir código sobre este plan?
