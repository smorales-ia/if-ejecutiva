# ROLLBACK — T-PDF-BASE-20260927 · FASE 2

> Escrito ANTES de aplicar cualquier write (patrón T-APLICAR-AIRTABLE-20260925).
> Snapshot completo del estado previo: archivos `snap-*.json` en esta misma carpeta (dumps REST del 27-sep-2026, pre-write).
> Método: REST `curl` con `AIRTABLE_TOKEN` de `.env.local` (MCP en 403 toda la sesión — fallback RO-30 declarado).
> AT03_Calculos_DAG: desactivada por Sergio antes de esta fase (declaración de Sergio; la REST API no expone estado de automations — limitación conocida).

## Pieza 1 · C_Formulas (`tblNFa454fBbqRB3t`) — links a C_ReglasNegocio (`fldGzMiXKgtJFyM6B`)

**ORIGINAL `recFcpOeKjXNunBlj` (F_UFm2_promedio v3.2)** — 6 links:
`recAJFIbIXV1X93i3, recoZuF6otZ5Bcs2g, recIEZ7F3FGUF0l44, recGsNl62Hi8VE6nW, reccwJrigkDZMBvmM, recToI9X3qCb6qFTx`

**ORIGINAL `recliyqVJAGatkDw0` (F_DesviacionVsPromedio v1.0)** — los mismos 6 links.

Para deshacer (restaura el array original completo):
```bash
curl -X PATCH "https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblNFa454fBbqRB3t/recFcpOeKjXNunBlj" \
  -H "Authorization: Bearer $AIRTABLE_TOKEN" -H "Content-Type: application/json" \
  -d '{"fields":{"C_ReglasNegocio":["recAJFIbIXV1X93i3","recoZuF6otZ5Bcs2g","recIEZ7F3FGUF0l44","recGsNl62Hi8VE6nW","reccwJrigkDZMBvmM","recToI9X3qCb6qFTx"]}}'
# ídem para recliyqVJAGatkDw0 (mismo array)
```

## Pieza 2 · C_Plantillas (`tblcYtNeJBD545hLw`)

**ORIGINAL `recK3ICXfmbEdWpFQ` (MUTUO_MET.docx)** — dump completo: `snap-plantilla-mutuomet.json`. Claves que se van a tocar, valor original:
- `variables_requeridas` (fld4bVHkjR5yD17Bz) = **vacío**
- `variables_opcionales` (fldKhq59XuoTjX9dO) = **vacío**
- `notas_diseno` (fldow1YfuXXpren5G) = **vacío**
- `codigo` (fldrLD2oMen42oXSL) = **vacío**
- `cliente` (fldPjpi16fZtrnpmq) = **vacío** · `aplica_a_cliente` (fldiQkiGfieBHzWYQ) = **vacío** · `tipo_propiedad` (fldwkhwcjNggAXpDr) = **vacío**

Para deshacer: PATCH con `{"fields":{"variables_requeridas":null,"variables_opcionales":null,"notas_diseno":null,"codigo":null,"cliente":[],"aplica_a_cliente":[],"tipo_propiedad":[]}}`.

**ORIGINAL `recbC79jChtK5M9fX` (Plantilla_Base_METLIFE)** — dump completo: `snap-plantilla-base.json`. Claves a tocar:
- `activa` (fldmnVG94TblNcDu8) = **true**
- `vigente_hasta` (fldrP5UbSN2mznfRs) = **vacío**

Para deshacer: PATCH `{"fields":{"activa":true,"vigente_hasta":null}}`.

## Pieza 2 · C_ReglasNegocio (`tblyCb8cVTDzfeBx0`) — re-apunte de plantilla

**ORIGINAL `recYEf9XepX4SmLnH` (REGLA_REFI_CASA_V32)**:
- `plantilla_resultado` = `["recGsFomK7gHtEaMS"]` (PLANTILLA_REFI_CASA, placeholder)

Para deshacer: PATCH `{"fields":{"plantilla_resultado":["recGsFomK7gHtEaMS"]}}`.

## Datos de prueba · TX_Solicitudes (`tblaHTyMHYfmy7Fg6`)

**HALLAZGO Bloque 0**: VP-2026-0067 YA EXISTÍA (`recmMzeu3eWGxyXsf`, creada 22-sep-2026, `numero_solicitud="METLIFE-6283-REAL"`, espejo previo del gold master, **estado=cancelada**). Decisión: se COMPLETA (el plan § 5 paso 15 decía "crear/completar"), no se crea duplicado.

**ORIGINAL `recmMzeu3eWGxyXsf`** — dump completo: `snap-0067.json`. Claves relevantes:
- `estado` = **cancelada** · `fecha_visita` = **vacío** · `origen_canal` = **vacío**
- `regla_aplicada` = `["recYEf9XepX4SmLnH"]` (ya apuntaba a V32 — no se toca)

Para deshacer: PATCH restaurando `estado="cancelada"` y las claves modificadas a los valores de `snap-0067.json`.

**Registros hijos creados para VP-2026-0067 en esta fase (rollback = DELETE)**: ver sección al final agregada por el ejecutor sandbox con los record_ids exactos.

## No se toca (sin rollback necesario)

- Los 13 links terminales de las 3 reglas V32 y los 20 de las 6 legado (el relink de Pieza 1 es aditivo; el inverso `formulas_resultado` 13→15 se revierte solo al deshacer Pieza 1).
- Script AT03, blueprint SC-Textos en Make (no existe aún en Make), VP-2026-0066 (oráculo intacto), cartera real.
- `docs/_artefactos/make/SC-Textos.blueprint.json`: es archivo de repo — rollback vía `git checkout` (lo hace Sergio).

## Registros creados por Agente C (rollback = DELETE)

Ejecutor sandbox · 2026-09-27 · REST curl (fallback RO-30, MCP en 403). Dump completo post-escritura: `snap-0067-post.json`.

**TX_ItemsCuadroValoracion (`tblCxnMtOETK2ulD0`) — 6 filas nuevas linkeadas a `recmMzeu3eWGxyXsf`:**

| record_id | nombre_item | valor_uf (formula) |
|---|---|---|
| `recnIInvI1IchIfX2` | Terreno | 11218.8 |
| `recQuqMyXs7ttOHVb` | Servidumbre | 0 |
| `recZCOq0TTlzVouzP` | Piso 1 | 8157.0624 |
| `recTV6R4rxuDyamYG` | Piscina | 350 |
| `rechm7Py8l1qtcMzl` | Quincho, terrazas, bodega | 250 |
| `recMBbJ4HHfZYOGTV` | Cierros, pavimento exterior | 150 |

Rollback: `DELETE https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblCxnMtOETK2ulD0/{record_id}` (x6).

**TX_Comparables (`tbllbTuhb0waWIbRo`)**: NO se creó ni modificó nada — las 7 filas
(`rec2aFg7XPsbSjufp`, `recXGxAeVg2ThVUfQ`, `recKGLWdMaK0lrXCh`, `recUAawogrtK3AJ59`,
`recniOUZHto7ZaA1E`, `recmizO68egY2SUiR`, `recD9eZEG2Ilpm2lx`) ya existían desde el
22-sep-2026 (RF-09 sobre `foto_ofertas_comparables` = adjunto `rectcojWwOIonkQRA`),
5 Oferta + 2 CBR, con las 13 columnas pobladas. Sin rollback.

## Campos modificados en recmMzeu3eWGxyXsf (valores originales en snap-0067.json)

| campo | valor_original | valor_nuevo |
|---|---|---|
| `estado` | cancelada | asignada |
| `fecha_visita` | (vacío) | 2026-04-13 |
| `fecha_visita_programada` | (vacío) | 2026-04-13 |
| `coordinacion_vigente` | (vacío) | confirmada |
| `notas` | "MET-6283-REAL-20260921 · REPLICA TASACION REAL FRANCISCO VERGARA · Met_6283 · validacion end-to-end · NO es operacion real de cartera" | mismo texto + "\nREGISTRO DE PRUEBA T-PDF-BASE-20260927 (espejo MET-6283)" |

## Campos modificados en TX_DatosTasacion recy8q3Tq9omjdNUf (originales en snap-0067-post no — ver lista)

Original completo previo al PATCH: campos que la fila YA tenía (RF-09 22-sep) y se conservan:
avaluo_total=339809429, avaluo_exento=0, contribucion_anual=0, cod_sii_* (14201/882/40),
destino_sii=HABITACIONAL, n_cert_no_expropiacion=3444743, ubicacion_urbano_rural=rural.

| campo | valor_original | valor_nuevo |
|---|---|---|
| `propietario_nombre` | (vacío) | FRANCISCO JOSE VERGARA UNDURRAGA |
| `propietario_rut` | (vacío) | 16.610.203-0 |
| `sup_terreno_m2` | (vacío) | 5024.86 |
| `sup_construccion_m2` | (vacío) | 249.91 |
| `anio_construccion` | (vacío) | 2020 |
| `material_predominante` | (vacío) | ALBAÑILERÍA LADRILLO |
| `estado_conservacion` | (vacío) | Bueno |
| `velocidad_venta_estimada` | (vacío) | 8 a 10 meses |
| `arriendo_bruto_mensual_clp` | (vacío) | 3300000 |
| `gasto_anual_clp` | (vacío) | 3300000 |
| `tasa_cap_rate` | (vacío) | 0.045 |
| `uf_dia_visita` | (vacío) | 39894.61 |
| `avaluo_fiscal_clp` | 120267353 | 339809429 |
| `origen_dato` | extraido_rf09 | tipeado |

⚠ `origen_dato` y `avaluo_fiscal_clp` sobreescriben output RF-09 — instruido por la tanda
(guard `origen_dato=tipeado` del sandbox y espejo del oráculo 0066 / golden `avaluoFiscalUf=8517.68`).

## Escrituras de la corrida del motor (harness AT03 real · 27-sep, hilo principal)

Corrida autorizada del script real `AT03_Calculos_DAG.js` v11.2.0_v32b1 vía `at03-harness.mjs`
sobre `recmMzeu3eWGxyXsf` (AT03 automation apagada; log completo: `at03-run-0067.log`).

**TX_Calculos — 15 filas creadas (rollback = DELETE; son también la evidencia T4, patrón T4-R: no borrar salvo rollback):**
`rec2BVb0aDWPQ5Csl` valor_comercial_uf · `rec49wTN71mEwLR5n` valor_reposicion_clp · `rec63XSh57aHqFAEF` renta_perpetua_clp ·
`recC3AHAcXJUW58rr` ingreso_liquido_anual_clp · `recHMcaG1RVVs41JR` valor_remate_clp · `recJBJQdcuodR7Kxd` promedio_uf_m2_muestra ·
`recOQzPNt1uZEmSls` desviacion_vs_promedio_pct · `recRMbaSLqtu5tslm` valor_remate_uf · `recb1arfVgTtNZ4Uz` valor_liquidacion_clp ·
`recdLBNX3SrZYxulp` seguro_incendio_clp · `reci5VTW7Hg8nGuLd` valor_comercial_clp · `recnKoDHrykaqYNGA` valor_liquidacion_uf ·
`recqReUSZL2unLhVm` seguro_incendio_uf · `rectIYWksC4IWONKZ` valor_reposicion_uf · `recwMUKdTrb6fFqjM` avaluo_fiscal_uf

**A_Eventos — 1 fila creada**: `rechCLEPB61eSHmST` (`at03_dag_completo`) — evidencia de auditoría, no se borra.

**TX_Solicitudes `recmMzeu3eWGxyXsf`**: `estado` asignada→**calculada** (escrito por el motor, `AT03:1477`).
Rollback completo del registro de prueba: `estado`→cancelada (valor pre-tanda, ver snap-0067.json).
