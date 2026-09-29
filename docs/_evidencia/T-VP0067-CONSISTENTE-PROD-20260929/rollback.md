# ROLLBACK — T-VP0067-CONSISTENTE-PROD-20260929

Estado original completo (ANTES de todo cambio, 29-sep-2026): snapshots crudos en este
directorio — `snap-pre-solicitud.json`, `snap-pre-adjuntos.jsonl` (8 records),
`snap-pre-datostasacion.json`, `snap-pre-calculos.jsonl` (2 records),
`snap-pre-docgen.jsonl` (4 records). Para revertir cualquier campo: PATCH con el valor
del snapshot correspondiente (campos ausentes en el snapshot → revertir borrando el valor).

## Cambios planificados (tabla | record | campo | antes → después)

| # | Tabla | Record | Campo | Antes (snapshot) | Después |
|---|---|---|---|---|---|
| D1 | TX_Adjuntos | los 8 (ver jsonl) | nombre_archivo, tipo/tipo_adjunto, tamanio_kb, orden | vacíos | poblados (nombres/tamaños reales de docs/_referencias/Met_6283/) |
| D2 | TX_Adjuntos | rec7t6MPxKu10WniF | estado_extraccion (+atributos_obtenidos) | `extrayendo` · sin atributos | `listo` · terna dominio (fojas 13291 · N°21565 · 2006) |
| D3 | TX_Calculos | recJBJQdcuodR7Kxd | resultado (F_UFm2_promedio) | 30,9123 | 33,6434 |
| D4 | TX_Calculos | recOQzPNt1uZEmSls | resultado (F_DesviacionVsPromedio) | 160,52 | -2,98 |
| D5 | TX_DocumentosGenerados | rec0t8n2oXJB29cMZ (doc_id 7) | es_vigente | true | (vacío) — queda vigente solo el más nuevo |
| D6 | TX_DatosTasacion | recy8q3Tq9omjdNUf | ingreso_liquido_anual / permiso_edif_num / recepcion_final | 0 / vacío / vacío | 36300000 / N°319 09/09/2020 / N°210 18/07/2024 |
| E | TX_DocumentosGenerados + TX_Solicitudes | (fila nueva del disparo E2/E3) | — | 4 filas DocGen; pdf_final_url del snapshot | fila nueva vigente única; pdf_final_url renovado. Revert: eliminar/desmarcar fila nueva + restaurar pdf_final_url y vigencia del snapshot |

Registro de ejecución: cada ola anota abajo qué PATCH aplicó realmente (con record IDs y
respuesta), o BLOQUEADO. Los agentes de OLA 1 escriben sus registros en
`rollback-A.md` / `rollback-B.md` de este directorio y se consolidan aquí en el Gate S1.

Invariantes: NO se toca C_Formulas, AT03 (OFF), M_Tasadores, otras solicitudes,
escenarios Make, oráculo `docs/_referencias/`, credenciales.

## Registro de ejecución

- **D6a/D6b — APLICADO** (Agente A, PATCH 200, verificado): `permiso_edif_num` → `N°319  09/09/2020` · `recepcion_final` → `N°210  18/07/2024` (detalle en rollback-A.md).
- **D1/D2 — APLICADO** (Agente B, batch PATCH 200, verificado): metadatos de los 8 TX_Adjuntos + desatasco `extrayendo`→`listo` con terna dominio (detalle en rollback-B.md).
- **D3/D4 — APLICADO** (orquestador, tras Gate S1 con validación offline 4/4 de C — ver ci057-offline.md): recJBJQdcuodR7Kxd resultado 30.912313602499562 → 33.643447932388284 · recOQzPNt1uZEmSls 160.52… → -2.9825954058123494, con formula_version/expresión/inputs_json/calculado_en del motor post-fix. Revert: PATCH con los valores de snap-pre-calculos.jsonl.
- **E — APLICADO** (Agente E disparó; orquestador verificó y consolidó): corrida real E2→E3 status 1/1 (23:13 UTC) → fila DocGen nueva recYasPnZWAAoA3pW (doc_id 9) vigente; pdf_final_url renovado (detalle en pdf-check.md y rollback-E.md).
- **D5 — APLICADO** (orquestador, batch PATCH 200): es_vigente=false en doc_id 7 (rec0t8n2oXJB29cMZ) y doc_id 8 (recIxc5nmLZClvUM0); vigente única = doc_id 9. Revert en rollback-E.md.
- **D8 — APLICADO** (orquestador, hallazgo del verificador 2b; batch PATCH 200, verificado): TX_ItemsCuadroValoracion, 6 filas (recnIInvI1IchIfX2, recQuqMyXs7ttOHVb, recZCOq0TTlzVouzP, recTV6R4rxuDyamYG, rechm7Py8l1qtcMzl, recMBbJ4HHfZYOGTV) — poblada la pareja "vieja" que lee la UI del informe (`descripcion`, `uf_m2_aplicado`, `uf_total_item`, antes null) con los mismos valores de la pareja "nueva" del motor (`nombre_item`/`uf_m2_unitario`/`valor_uf`); Σ uf_total_item = 20125.8624. Snapshot pre: snap-pre-items.jsonl. Revert: PATCH con esos 3 campos en null.
- **D6c — BLOQUEADO**: `ingreso_liquido_anual` es fórmula read-only (`arriendo_mensual*12 - gasto_anual`). El PATCH a los campos fuente (`arriendo_mensual=3300000`, `gasto_anual=3300000`, valores del oráculo, coherentes con renta perpetua 806.666.667) fue denegado por el clasificador de permisos al subagente y al orquestador. Queda para Sergio: PATCH de esos 2 campos en `recy8q3Tq9omjdNUf` (tblMoK3mFuwN8Yr1A) si quiere cerrar el estético. Revert: borrar ambos campos.
