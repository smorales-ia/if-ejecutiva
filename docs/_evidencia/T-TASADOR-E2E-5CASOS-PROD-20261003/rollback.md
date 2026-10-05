# Rollback · T-TASADOR-E2E-5CASOS-PROD-20261003

**Fase 1 (solo lectura) no escribió nada en producción.** No hay nada que revertir todavía.

Cuando empiece la Fase 2, antes de CADA escritura se registrará aquí el estado original por record
(estado, tasador, pdf_final_url, campos tocados) y por tabla maestra (M_Clientes/M_Comunas/
H_PreciosUF) si se autoriza su onboarding. Reversión por-record vía PATCH de reposición; VP-0067
excluido del lote.

## Fase 2 · CASO 1 — SEMBRADO OK 2026-10-05

**Record final:** `reczuns8NHdI45Owp` · **VP-2026-0073** · estado `calculada`. IDs completos de
todos los hijos en `rollback-caso1.json`. **H_PreciosUF 2026-04-06 CREADO** = `recnMK3Z5qbswZIv5`
(tabla compartida · se borra en rollback). Para revertir todo: `node rollback-caso1.mjs`.
Verificación anti-AT03: TX_Calculos quedó en 15 filas con valor_comercial_uf=3323,2 (no clobbered).

---
## Fase 2 · CASO 1 (METLIFE-6280) — 2026-10-05

**Tipo de escritura:** CREATE (el caso no existía). Reversión = borrar los records creados.
Los IDs exactos creados quedan en `rollback-caso1.json` (lo escribe `seed-caso1.mjs` a medida
que crea). Para revertir: borrar `solicitud` + todos los hijos listados ahí.

- **TX_Solicitudes**: 1 record nuevo (estado creada→calculada). Aislado por `numero_solicitud="METLIFE -6280"` + `notas` marcador de tanda. VP-0067 y las ~39 filas existentes NO se tocan.
- **Hijos nuevos** (ligados por codigo auto-generado): TX_DatosTasacion(1), TX_ItemsCuadroValoracion(2), TX_Comparables(6), TX_HabitacionesPorNivel(7), TX_DocumentosLegales(1), TX_Calculos(15), TX_Adjuntos(18 fotos).
- **TABLA COMPARTIDA · H_PreciosUF**: fila `2026-04-06` (UF 39.841,72 · USD 922,17). Si ya existía, NO se toca y se registra `preexistente` en rollback-caso1.json; si se creó, queda `creado` con su id (D3). Afecta a cualquier solicitud con visita 2026-04-06 — ninguna otra conocida usa esa fecha.
- **AT03 NO se corre** (D1 sandbox): terminales sembrados directo en TX_Calculos. Verificación anti-clobber tras el PATCH a calculada.

Estado de partida (Fase 1, verificado):
- Casos 1–4: **no existen** en TX_Solicitudes (habría que crearlos).
- Caso 5 (Carlos Cortés): existe en 2 records **cancelados** sin render — `recRjyT3kg0vYGcEH`
  (VP-2026-0038) y `reci06q1kySVg43KG` (VP-2026-0006).
- Ninguno tiene PDF. VP-0067 (recmMzeu3eWGxyXsf) intacto, fuera del lote.
