# PLAN T-PDF-BASE-20260927 — Tanda cortita P0: relink fórmulas · contrato plantilla MetLife · SC-Textos

> FASE 1 · PLANIFICACIÓN · 27-sep-2026 · rama `plan/T-PDF-BASE-20260927` · pendiente de OK Gate de Sergio.
> Equipo: 7 agentes en paralelo (Arquitecto · Fórmulas/Reglas · Plantilla · SC-Textos · QA · Frontend · Seguridad), consolidado por el hilo principal.
> Fuente de verdad: `docs/_analisis/AUDITORIA_PDF_MET6283_20260926.md` (+ .xlsx) · Spec normativa `docs/_md/VProperty_Especificacion_Proyecto_v1_9_17.md`.
> **Declaración RO-30**: el MCP Airtable devolvió 403 en toda la sesión (igual que el 26-sep); todos los agentes usaron el fallback autorizado `curl` GET read-only con `AIRTABLE_TOKEN` de `.env.local`. **Cero writes ejecutados en Fase 1.**

---

## § 1 · Resumen ejecutivo

Tres piezas P0 sin credenciales externas: (1) agregar las 3 reglas V32 a los links de `F_UFm2_promedio` v3.2 y `F_DesviacionVsPromedio` v1.0 (6→9 links cada una, cambio aditivo — sin esto el "-3% vs promedio" del informe no se persiste jamás); (2) poblar `variables_requeridas` (52 tags) y `variables_opcionales` (25 tags) de `MUTUO_MET.docx` desde `lib/informe/matriz-tags.ts`; (3) corregir el blueprint SC-Textos a v0.2 (hoy el draft v0.1 no puede completar ni un run) y dejarlo importado, probado con "Run once" y **apagado**. Todo write en Airtable/Make lo ejecuta Sergio (patrón "Claude prepara, Sergio pega"); Claude verifica por GET. La discrepancia auditoría↔tanda anterior quedó resuelta: no hay contradicción de hechos (§ 11 · C-1).

## § 2 · Alcance

**SÍ se toca (Fase 2, con Gate):**
- Airtable · `C_Formulas` (`tblNFa454fBbqRB3t`): campo `C_ReglasNegocio` (`fldGzMiXKgtJFyM6B`) de `recFcpOeKjXNunBlj` y `recliyqVJAGatkDw0` — solo AGREGAR 3 links.
- Airtable · `C_Plantillas` (`tblcYtNeJBD545hLw`): `variables_requeridas` (`fld4bVHkjR5yD17Bz`), `variables_opcionales` (`fldKhq59XuoTjX9dO`) y nota de origen de `recK3ICXfmbEdWpFQ` (MUTUO_MET.docx). Consolidación de la fila duplicada `recbC79jChtK5M9fX` y re-apunte de `REGLA_REFI_CASA_V32.plantilla_resultado`: **solo si el Gate lo aprueba** (§ 12-b2).
- Repo · `docs/_artefactos/make/SC-Textos.blueprint.json`: bump v0.1→v0.2 con las correcciones del § 4c (archivo del repo; commit lo hace Sergio).
- Make · import de SC-Textos v0.2 + "Run once" supervisado (Sergio, Gate) — queda **inactivo** (patrón SC-SLA-Envio).
- Airtable · datos de prueba: VP-2026-0067 espejo (si Gate aprueba) y datos mínimos del oráculo para SC-Textos (§ 4c-E).
- Registros: fila SC-Textos en `Z_EscenariosMake` + `Z_Webhooks` tras el import (Sergio o write autorizado).

**NO se toca (declarado + ampliado por agentes):**
- Imprenta PDF (Carbone + Dropbox · E1/E2/E3): necesita credenciales — tanda L posterior. Prohibición explícita CLAUDE.md.
- Subida del `.docx` oficial MetLife, `url_dropbox`, `archivo_docx_url`, `template_id_carbone`: pendientes de Sergio.
- Las ~35-40 columnas de la Hoja 3 (T4) · mapa con pines y fotos de comparables (P1-4): tandas posteriores.
- El script `AT03_Calculos_DAG.js` v11.2.0_v32b1 (activo en producción): **cero ediciones**. Tampoco se renombran fórmulas (el Filtro 2 casa por nombre) ni se tocan los 13 links terminales v32 ni los 6 legado existentes.
- Código construido IF-02/IF-04 (R5: `components/console/**`, `app/api/solicitudes/**`, `app/(ejecutiva)/**`, `lib/*.ts` de IF-02).
- Los bugs colaterales detectados (usdDia null en ensamblador, `textosIA` hardcodeado a null, spinner sin mensaje de error, choice duplicado pdf/PDF): **se documentan en § 11, no se arreglan en esta tanda**.
- Cartera real (VP-2026-0060 etc.) · sandbox solo para pruebas post-relink.
- `git commit/push/merge` — Sergio desde GitHub Desktop (R12).

## § 3 · Diseño técnico consolidado (Agente 1, ratificado por 2 y 3)

**Hallazgo estructural que ordena todo:** en VP-2026-0066 conviven dos "reglas ganadoras". `A_DecisionesMotor.regla_ganadora` (`rec8lxTwMAqXyncex`, AT01 17-sep) = `Regla_MetLife_Refinanciamiento_Casa` legado (`recoZuF6otZ5Bcs2g`) → plantilla `MUTUO_MET.docx`. Pero `TX_Solicitudes.regla_aplicada` = `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`) — y **AT03 filtra por `regla_aplicada`** (`AT03_Calculos_DAG.js:679, 1261-1307`). Por eso corrieron los 13 terminales v32 y el Filtro 2 (`:1302-1307`, casa por **nombre** de fórmula) excluyó las 2 fórmulas de comparables. INFERIDO: `regla_aplicada` fue re-apuntada manualmente en T-MC-P0 (`docs/aprendizajes.md:3064-3067`).

**Pieza 1** — relink aditivo, 2 registros de `C_Formulas` (§ 4a). No requiere tocar el script: el lector b1 ya inyecta `promedio_uf_m2_muestra`/`n_comparables` al SCOPE siempre, fail-safe (`AT03_Calculos_DAG.js:1236-1237`, header :15-26); `F_DesviacionVsPromedio` (orden 90) lee `valor_comercial_uf` del SCOPE escrito por `F_ValorComercialUF` (orden 3) vía `SCOPE[varOut]=resultado` (`:1383`).

**Pieza 2** — escribir SOLO los 2 campos multilineText + nota de origen en `recK3ICXfmbEdWpFQ` (§ 4b). Contenido **generado desde** `lib/informe/matriz-tags.ts` (RO-05: el repo manda; Airtable es copia declarada con fecha). Cero consumidores actuales de `variables_requeridas` (grep repo + blueprints = 0 hits) → inerte para renders de hoy; su consumidor será SC09 (tanda L).

**Pieza 3** — corregir blueprint en el repo ANTES de importar (§ 4c). Los campos destino ya existen (`sintesis_descriptiva` `fldCfipeATICMiimq` · `descripcion_sector` `fldBSpioukujGCcHS` en `tblMoK3mFuwN8Yr1A`): no hay que crear columnas para síntesis/sector — hay que corregir el módulo 11 del draft, que escribe a nombres inexistentes.

**Dependencias:** orden **P1 → (P2 ∥ P3-preparación) → P3-activación**. La clave `analisis_referencias` de P3 (si el Gate elige la vía columna-IA) depende de P1 (sin relink, `desviacion_vs_promedio_pct` no existe en TX_Calculos como insumo del texto); síntesis/sector son independientes. P2 no depende de nadie, pero fija el vocabulario `{d.textosIA.*}` que P3 alimenta aguas abajo.

**Puente pendiente declarado (fuera de tanda):** `lib/informe/ensamblador.ts:478-482` hardcodea `textosIA` a `null` — lo que SC-Textos escriba en Airtable **no llegará** a `informe-data` hasta que ese fix se haga (tanda de la imprenta); y `TextosIaInforme` (`lib/informe/tipos.ts:255-261`) no tiene clave `analisisReferencias`.

**Invariantes (no romper):** 1) AT03 activo en prod, cero ediciones al script; 2) relink ADITIVO — con VP-2026-0066 recalculando saldrían 15 filas sin error (b1 fail-safe con 0 comparables); 3) el ensamblador mapea TX_Calculos por `variable_output` (`ensamblador.ts:298-301`) y tolera filas extra; 4) no renombrar fórmulas; 5) guards H3/H5/H6/H7 intactos; 6) no importar SC-Textos hasta v0.2 verificado; 7) columnas nuevas solo con Gate.

## § 4 · Tabla oráculo

### 4a · Matriz correcta C_Formulas ↔ C_ReglasNegocio (Pieza 1 · Agente 2, coincide con Agente 1)

Campo a editar: `C_Formulas.C_ReglasNegocio` (`fldGzMiXKgtJFyM6B`; inverso: `C_ReglasNegocio.formulas_resultado` `fld3E38vQtnSVdaxU`). C_ReglasNegocio **no tiene campo version**; la generación se lee de `notas` y el sufijo del nombre. La base tiene **9 reglas activas** (6 legado con 20 links + 3 V32 con 13 links).

| Fórmula | record_id | Links HOY (6 legado) | AGREGAR (3 V32) | QUITAR |
|---|---|---|---|---|
| `F_UFm2_promedio` v3.2 (`promedio_uf_m2_muestra`, ord 1) | `recFcpOeKjXNunBlj` | `recAJFIbIXV1X93i3` · `recoZuF6otZ5Bcs2g` · `recIEZ7F3FGUF0l44` · `recGsNl62Hi8VE6nW` · `reccwJrigkDZMBvmM` · `recToI9X3qCb6qFTx` | **`recYEf9XepX4SmLnH`** (REGLA_REFI_CASA_V32) · **`rec2QYP8yjMW1Smsm`** (REGLA_REFI_DEPTO_V32) · **`reckDNGORrc45HTN9`** (REGLA_REFI_DEFAULT_V32) | **ninguno** |
| `F_DesviacionVsPromedio` v1.0 (`desviacion_vs_promedio_pct`, ord 90) | `recliyqVJAGatkDw0` | (idéntico set de 6) | (los mismos 3 V32) | **ninguno** |

Estado final: **9 links por fórmula**; las 3 reglas V32 pasan de 13 a 15 fórmulas en `formulas_resultado`. Mecanismo que lo justifica: Filtro 2 — AT03 solo ejecuta y persiste fórmulas cuyo `nombre` esté en `regla_aplicada.formulas_resultado` (`AT03_Calculos_DAG.js:1302-1307`); una fórmula activa pero no linkeada **no escribe fila en TX_Calculos** y el informe lee TX_Calculos.

### 4b · Contrato de plantilla MUTUO_MET.docx (Pieza 2 · Agente 3)

Fila destino: `recK3ICXfmbEdWpFQ` (tabla `tblcYtNeJBD545hLw`). Campos multilineText → formato: **un tag Carbone por línea, sin comentarios** (parseable con `split(newline)`, editable a mano sin corromper). Criterio: `estado OK` en matriz-tags.ts → requeridas · `HUECO`/`METLIFE_ONLY` → opcionales · `PLANTILLA` → fuera del contrato (vive en el .docx).

**`variables_requeridas` (52 tags):**

```
{d.meta.codigo}
{d.meta.numeroSolicitudCliente}
{d.partes.propietario}
{d.partes.rut}
{d.partes.ejecutivo}
{d.partes.tasador.nombre}
{d.partes.visador.nombre}
{d.partes.fechaVisita}
{d.propiedad.direccion}
{d.propiedad.comuna}
{d.propiedad.region}
{d.propiedad.tipoPropiedad}
{d.propiedad.objetivo}
{d.propiedad.anioConstruccion}
{d.propiedad.supTerrenoM2}
{d.propiedad.supConstruccionM2}
{d.propiedad.estadoConservacion}
{d.propiedad.materialPredominante}
{d.propiedad.dfl2}
{d.propiedad.velocidadVentaEstimada}
{d.sii.rolSii}
{d.legales.permisoEdificacion}
{d.legales.recepcionFinal}
{d.cuadro.items[i].descripcion}
{d.cuadro.items[i].supM2}
{d.cuadro.items[i].ufM2Aplicado}
{d.cuadro.items[i].factorAplicado}
{d.cuadro.items[i].ufTotalItem}
{d.cuadro.totalUf}
{d.terminales.valorComercialUf}
{d.terminales.valorComercialClp}
{d.terminales.valorReposicionUf}
{d.terminales.seguroIncendioUf}
{d.terminales.avaluoFiscalUf}
{d.terminales.valorRemateUf}
{d.terminales.valorLiquidacionUf}
{d.terminales.ufDia}
{d.rentabilidad.arriendoBrutoMensualClp}
{d.rentabilidad.gastoAnualClp}
{d.rentabilidad.ingresoLiquidoAnualClp}
{d.rentabilidad.rentaPerpetuaClp}
{d.comparablesInforme.filas[i].direccion}
{d.comparablesInforme.filas[i].comuna}
{d.comparablesInforme.filas[i].supTerreno}
{d.comparablesInforme.filas[i].supConstruida}
{d.comparablesInforme.filas[i].precioUf}
{d.comparablesInforme.filas[i].ufM2Construccion}
{d.recintos.ampliaciones[i].descripcion}
{d.recintos.habitacionesPorNivel[i].cantidad}
{d.recintos.terminacionesPorRecinto[i].descripcion}
{d.fotos.fotos[i].url}
{d.comparablesInforme.tasacionVsPct}
```

⚠ Nota sobre la última línea: `tasacionVsPct` figura HUECO/P1-8 en la matriz, pero tras la Pieza 1 su insumo (`desviacion_vs_promedio_pct`) se persiste — el consolidador la promueve a requerida **solo si el Gate § 12-a confirma la Pieza 1**; si no, va en opcionales (posición original del Agente 3, ver § 11 · C-4).

**`variables_opcionales` (24 tags):**

```
{d.clienteInforme.logoUrl}
{d.clienteInforme.nombreRevisor}
{d.textosIA.sintesisPropiedad}
{d.textosIA.descripcionSector}
{d.textosIA.textoExpropiacion}
{d.propiedad.vidaUtil}
{d.rentabilidad.tasaCapRate}
{d.rentabilidad.arriendoUfMes}
{d.terminales.usdDia}
{d.comparablesInforme.promedioUfM2}
{d.comparablesInforme.tasacionUfM2}
{d.partes.tasador.firmaUrl}
{d.partes.fechaVisado}
{d.mapa.staticMapUrl}
{d.sii.codManzana}
{d.cualitativa.normativa}
{d.cualitativa.sector}
{d.cualitativa.geometriaTerreno}
{d.cualitativa.emplazamiento}
{d.cualitativa.constructivas}
{d.cualitativa.servicios}
{d.cualitativa.comodidades}
{d.cualitativa.detallePropiedad}
{d.anexos.documentos[i].url}
```

Complemento en la misma fila (campo de notas): `Contrato derivado de lib/informe/matriz-tags.ts (228 E-ids) · 2026-09-27 · requeridas=estado OK, opcionales=HUECO/METLIFE_ONLY · fuente de verdad: el repo (RO-05)`.

**Fuera del contrato** (estado PLANTILLA, `tag:'—'`): rótulos/foliación E-01/03/15/16/18/84/86/118/119/209/212/213/218/219/224/225, pie corporativo E-11..14, boilerplate "Análisis de las referencias" E-85, declaración legal E-116, formato de año E-124. Tampoco rutas internas no imprimibles (`meta.estado`, `huecos[]`, `paridad`, `terminales.fechaUf`…).

**Propuesta fila duplicada (decisión Gate § 12-b2, no acción por defecto):** consolidar en `recK3ICXfmbEdWpFQ` (migrar `codigo` TPL-MET-CASA-001 + links cliente/tipo_propiedad desde `recbC79jChtK5M9fX`; el `url_dropbox` genérico NO se migra sin validación de Sergio), desactivar `recbC79jChtK5M9fX` (`activa=false`, no borrar), y re-apuntar `REGLA_REFI_CASA_V32.plantilla_resultado` (hoy → `recGsFomK7gHtEaMS` PLANTILLA_REFI_CASA, placeholder vacío e inactivo) a `recK3ICXfmbEdWpFQ`.

### 4c · Contrato input/output del escenario SC-Textos (Pieza 3 · Agente 4)

Blueprint: `docs/_artefactos/make/SC-Textos.blueprint.json` (405 líneas, v0.1 DRAFT). Trigger: **webhook** (`instant:true`, hook placeholder `:9`) — payload `{solicitud_codigo}`; disparo previsto pre-SC09 con `estado=calculada`. Conexión Airtable `8847431` (la misma de producción de todos los SC-*). Claude API por HTTP directo (`x-api-key` header, modelo `claude-sonnet-4-6`, max_tokens 4096). Sin error-handler explícito; router éxito/fallo por longitud de `sintesis`.

**Inputs (lee):** `TX_Solicitudes` por `{codigo_ext}` (mód 3, fórmula verificada en vivo ✅) · `TX_DatosTasacion` por Link `solicitud` (mód 4, verificada ✅, 1 registro) · `TX_HabitacionesPorNivel` (mód 5, fórmula válida, oráculo con 0 filas).
**Outputs (escribe):** `TX_DatosTasacion` (mód 11) + log en `LogEscenarios` (móds 12/13). Clave `programa` del JSON se genera y **no se persiste** (decisión pendiente menor).

**Correcciones obligatorias v0.1→v0.2 (hoy el draft no completa ni un run):**

| Mód | Bug (blueprint:línea) | Fix v0.2 |
|---|---|---|
| 11 | Escribe `sintesis_propiedad_texto`/`descripcion_sector_texto` (:256-257) — **no existen** → 422 UNKNOWN_FIELD_NAME | `sintesis_descriptiva` (`fldCfipeATICMiimq`) y `descripcion_sector` (`fldBSpioukujGCcHS`) — ya existen; usar `useColumnId:true` + FIELD_IDs. Actualizar nota :375 y `name` (:2) |
| 6 | `{{5.recinto}}` no existe | `{{5.tipo_recinto}}` (`fldfRIckarh7az5g5`) o `nombre` |
| 7 | `N°{{3.numeracion}}` (campo inexistente; la numeración ya viene en `direccion`) · `{{3.condominio}}` (real: `proyecto_condominio` `fldbmGmyMHOtfX2Az`) · `{{3.comuna}}`/`{{3.tipo_propiedad}}` son Links → rinden record IDs · `{{4.zona}}`/`{{4.tipo_zona}}` no existen en TX_DatosTasacion | Quitar numeración · corregir condominio · resolver comuna/tipo a texto (2 GET extra a M_Comunas/M_TiposPropiedad, o lookups nuevos = decisión de schema Gate) · zona vía GET a M_Zonificacion con fallback `tipo_zona_descripcion`/`ubicacion_urbano_rural` · pegar el prompt canónico completo con few-shot (`docs/_artefactos/plantillas/prompts-textos-informe.md` §4.1-4.2) |
| 12/13 | `Escenario="SC-Textos"` no es choice del singleSelect de LogEscenarios (`fldPktGeTzNCRQ319`) → 422 | Gate § 12-c3: `typecast:true` en ambos módulos (sin cambio de schema, recomendado) o agregar el choice |
| — | Gap RF-32: nada valida cifras entre móds 9 y 11 (nota :401) | Aceptable para Run once supervisado; **no activar en producción** sin insertar la validación (`lib/informe/validador-cifras.ts` existe con tests) — condición de la tanda de la imprenta |

**`analisis_referencias`:** no existe ni como columna (0/91 campos de `tblMoK3mFuwN8Yr1A`) ni como clave del prompt. Contradicción declarada: auditoría §4 lo pide como columna+clave IA (P0) vs `prompts-textos-informe.md:25` que lo saca de alcance a propósito ("texto fijo de plantilla, decisión E-85 pendiente"). **Decisión Gate § 12-c2** — si columna: crear campo + clave + input de TX_Comparables + inyectar `desviacion_vs_promedio_pct` (depende de Pieza 1).

**Credenciales:** `ANTHROPIC_API_KEY` rotada el 22-09 ya validada en Make (SC-RF09 módulo 10, 200 OK) — la misma sirve; se pega a mano en el header del mód 7 al importar. Conexión Airtable existe. Webhook: se crea en el import y se registra en Z_Webhooks.

**Datos mínimos en el registro de prueba para textos con sentido** (writes de Sergio, Gate § 12-c4): `pisos`=1, `proyecto_condominio`="LAS BRISAS DE CHICUREO", filas de `TX_HabitacionesPorNivel` (programa del gold master), `zonificacion` o `tipo_zona_descripcion`.

## § 5 · Plan de ejecución paso a paso (Fase 2)

**Convención:** [C] ejecuta Claude · [S] ejecuta Sergio (Gate) · ∥ = paralelizable. Total: **19 pasos**, de los cuales **10 paralelizables** (Bloque 1, tres líneas A/B/C).

**Bloque 0 — Snapshot (secuencial, primero):**
1. [C] Crear `docs/_evidencia/T-PDF-BASE-20260927/rollback.md` con valores ORIGINALES vía GET: links actuales de `recFcpOeKjXNunBlj` y `recliyqVJAGatkDw0`; `formulas_resultado` de las 3 reglas V32; fila completa `recK3ICXfmbEdWpFQ` y `recbC79jChtK5M9fX`; estado de VP-2026-0066. Formato del patrón `docs/_evidencia/T-APLICAR-AIRTABLE-20260925/rollback.md` ("ORIGINAL = … / Para deshacer: PATCH …").
2. [S · Gate § 12-d] Desactivar AT03 en la UI de Airtable (ventana corta; el MCP no puede togglear automations).

**Bloque 1 — tres líneas en paralelo ∥:**
- Línea A (Pieza 1): 3. [S] Agregar los 3 links V32 a `F_UFm2_promedio` · 4. [S] ídem `F_DesviacionVsPromedio` · 5. [C] Verificar T3 por GET (9 links c/u; legado intactos).
- Línea B (Pieza 2): 6. [S] Pegar `variables_requeridas` (§ 4b) · 7. [S] Pegar `variables_opcionales` · 8. [S] Nota de origen · 9. [C] Verificar T5 (cobertura 100% vs matriz-tags.ts) · 10. [S · solo si Gate § 12-b2] Consolidación fila duplicada + re-apunte `plantilla_resultado` V32.
- Línea C (Pieza 3 preparación): 11. [C] Editar `SC-Textos.blueprint.json` → v0.2 (correcciones § 4c según decisiones Gate c2/c3) · 12. [S] Poblar datos mínimos del registro de prueba (§ 4c) · 13. [S] (si Gate c2=columna) crear `analisis_referencias` en `tblMoK3mFuwN8Yr1A`.

**Bloque 2 — secuencial tras A verificada:**
14. [S] Reactivar AT03 + [C] verificar que no quedó ninguna solicitud real atascada en `visitada` sin TX_Calculos durante la ventana.
15. [S · Gate] Crear/completar VP-2026-0067 espejo de 0066 **incluyendo las 7 filas de TX_Comparables** (sin comparables, el test de la desviación no es concluyente — ver T4) y disparar el motor (vía B recomendada: `estado→visitada` directo en la UI de Airtable).
16. [C] Verificar T4 (15 filas TX_Calculos; 13 terminales al céntimo; `desviacion_vs_promedio_pct` ≈ −3).
17. [S · Gate] Importar SC-Textos v0.2 en Make (crear webhook, pegar API key + prompt canónico) + "Run once" → [C] verificar T6. Registrar en Z_EscenariosMake/Z_Webhooks. El escenario queda **INACTIVO**.

**Bloque 3 — cierre:**
18. [C] Tests restantes T1/T2/T7a/T8 + [S] T7b screenshots → [C] evidencia T9 → [C] auditor ciego T10.
19. [C/S] Si algo rojo: rollback condicional con `rollback.md` (§ 9). Si todo verde: cierre de tanda + claude-out.txt + entrada en aprendizajes.md si aplica.

## § 6 · Batería de tests obligatoria (Agente 5) — HECHO = TODOS EN VERDE + auditor ciego

| ID | Qué | Corre | Criterio / tolerancia |
|---|---|---|---|
| T1 | `pnpm lint` + `pnpm typecheck` + `pnpm test` (57 archivos co-ubicados) | C | exit 0, cero fallos. Si se tocó código: `pnpm build` limpio |
| T2 | Regresión aritmética del "-3%": tests de `lib/informe/fila-tasacion.test.ts` y `lib/tasador/comparables.test.ts` | C | verdes (aísla: si T4 falla, la causa es Airtable, no el repo) |
| T3 | Relink estático: GET a las 2 fórmulas y las 3 reglas V32 | C | 9 links por fórmula; `formulas_resultado` V32 = 15; los 6 legado intactos. Booleano, sin tolerancia |
| T4 | Integración motor sobre VP-2026-0067 (con 7 comparables espejo; disparo [S] vía estado→visitada) | S dispara · C verifica | (a) 13 terminales vs oráculo: ±0,01 UF · ±1 CLP (`ingreso_liquido_anual_clp` exacto = 36.300.000; `renta_perpetua_clp` ±1) · (b) filas de `promedio_uf_m2_muestra` y `desviacion_vs_promedio_pct` EXISTEN; `round(desviacion) = −3` y ±0,05 pp vs recomputo · (c) `A_DecisionesMotor`/`regla_aplicada` = regla V32 (si ganó legado, el test no probó el relink → rojo) · timeout 5 min; si sigue `visitada`, leer A_Eventos |
| T4-R | Higiene: VP-2026-0067 queda marcada TEST y fuera de la cartera (cancelada/pausada, decide S). TX_Calculos y A_Eventos NO se borran (son evidencia) | S decide · C documenta | — |
| T5 | Contrato plantilla: GET `recK3ICXfmbEdWpFQ` vs catálogo § 4b | C | cobertura 100% de los tags requeridos; extras = ámbar con visto bueno; match exacto por tag (case-sensitive) |
| T6 | SC-Textos Run once sobre el registro de prueba | S dispara · C verifica | `sintesis_descriptiva` y `descripcion_sector` >80 chars · mencionan comuna y tipo de propiedad reales (substring case-insensitive) · sin fugas técnicas (`{`, `}`, "Claude", "API", snake_case, disclaimers) · run Make sin error · textos pasan `validador-cifras` (verificación RF-32 manual) |
| T7a | Smoke server: `pnpm dev` + curl a `/tasaciones/{id}` y `/api/tasaciones/{id}/informe-data` | C | 200 o redirect Clerk = verde; 500 = rojo |
| T7b | Screenshots autenticados (lista § 7) | S | textos visibles donde aplique y desviación calculada; guardar en `docs/_evidencia/T-PDF-BASE-20260927/` |
| T8 | Ensamblador end-read: `pnpm test -- ensamblador validador-cifras` + GET TX_Calculos con 13 claves terminales no-null | C | verdes + 13/13 |
| T9 | Evidencia documental completa en `docs/_evidencia/T-PDF-BASE-20260927/` (dumps T3/T4, diff T5, textos T6, screenshots) + blueprint v0.2 en `_artefactos/make/` | C | checklist completo |
| T10 | **Auditor ciego**: agente fresco sin contexto de implementación, recibe SOLO rec-ids + tabla oráculo + criterios T3-T8; re-verifica por GET independiente y re-corre T1 | C spawn · S lee veredicto | coincidencia 100% con T1-T8; cualquier discrepancia reabre el ítem |

Guard CLAUDE.md reconciliado: los tests vitest son solo-lectura/mockeados (jamás escriben a Airtable); las verificaciones que requieren escritura NO son vitest — son runbook sobre registro dedicado de prueba, disparadas por Sergio, verificadas por Claude vía GET.

## § 7 · Frontend: archivos y screenshots (Agente 6)

**En esta tanda NO se toca código frontend.** Mapa para validación visual (no hay route group `(tasador)`: la ruta es `/tasaciones/[id]`):

- Outputs del motor: único terminal con render es `valor_comercial_uf` en `components/tasador/informe-preview.tsx:394-418` — y lo lee de `TX_Solicitudes` (`lib/tasador/lectura-informe.ts:275-284`), no de TX_Calculos. La desviación aparecería en el renglón "Tasación v/s promedio de la muestra": `components/tasador/form-sections/seccion-comparables.tsx:171-178` (hoy calculada en cliente) y en `informe-preview.tsx:250`. `desviacion_vs_promedio_pct` persistida no tiene consumidor UI; su consumidor server es el ensamblador (`lib/informe/fila-tasacion.ts:32-53`, `ensamblador.ts:338-352` → `informe-data`).
- Textos SC-Textos: **ningún componente UI los lee** (grep exhaustivo: solo `ensamblador.ts`/`tipos.ts`); llegan a `informe-data` únicamente cuando se arregle el hardcode `textosIA=null` (`ensamblador.ts:478-482`, fuera de tanda).
- Botón Calcular: `components/tasador/tasacion-form.tsx:272-315` (`handleCalcular`); sondeo cada 4 s sin timeout en `lib/tasador/use-estado-tasador.ts:63,107-111`; el punto exacto del "gira sin mensaje" es `components/tasador/estado-procesando.tsx:172-178` (aviso ámbar condicionado a `!esCalculo`). Documentado — no se arregla en esta tanda.

**Screenshots Fase 2 (T7b, sobre el registro de prueba):** (1) `/tasaciones/[id]` botón "Calcular Tasación" habilitado · (2) `/tasaciones/[id]/estado` en `calculada` (check verde) · (3) `/tasaciones/[id]/informe` bloque 6 comparables con fila "Tasación v/s promedio" mostrando −3% · (4) `/tasaciones/[id]/informe` preview completo (evidencia de dónde faltan los textos IA — evidencia negativa esperada, porque el puente del ensamblador es de otra tanda) · (5) captura JSON de `GET /api/tasaciones/[id]/informe-data` con `terminales.*` y `comparablesInforme.tasacionVsPct` poblados. Los 4 adicionales del mapeo del Agente 6 (estados de error/bloqueo) son opcionales.

## § 8 · Restricciones y riesgos (Agente 7)

Canon: `ways-of-working.md` **no existe** — las reglas viven en `docs/_md/plan_ejecucion_UItasador_v1.5.md` §0.2 (R5 no tocar lo construido · R7 reuso antes de crear · R8/T-C cero lenguaje de IA en UI · R12 commits/push/checkout los hace Sergio) y `docs/aprendizajes.md:91` (RO-05 fuente única) + CLAUDE.md (RO-30; no escribir a Airtable desde tests productivos; aprobación previa para tablas/escenarios nuevos).

| Riesgo | Mitigación |
|---|---|
| (a) Relink con AT03 activa: una corrida a mitad del cambio (una fórmula linkeada, la otra no) produce TX_Calculos inconsistentes | Apagar AT03 durante la ventana (suficiente y barato — Gate § 12-d; **el MCP no puede togglear automations**: manual de Sergio). Riesgo secundario del apagado: solicitudes reales que pasen a `visitada` quedan atascadas sin trigger → ventana corta coordinada + al reactivar, query `estado=visitada` sin TX_Calculos y re-gatillar |
| (b) Poblar C_Plantillas: cero consumidores hoy (grep = 0 hits) → inerte; el riesgo real es RO-05 (segunda fuente que diverge de matriz-tags.ts) | Contenido GENERADO desde el repo, nota con fecha y origen, y constancia de que matriz-tags.ts manda |
| (c) Activar Make: trigger webhook (no watch) → runaway bajo; cada corrida ≈ 6 ops Make + 1 llamada Claude (costo real); escribe TX_DatosTasacion productiva; Run once SÍ escribe | Import + Run once + INACTIVO (patrón SC-SLA-Envio); todo Gate de Sergio; primer run opcionalmente con módulo 11 desconectado; verificar la API key en vivo, no solo su presencia |
| (d) Precedente `PLAN_prod-met6283.md` §8 prohibía editar `formulas_resultado` de la regla MetLife legado | Esta tanda NO toca los links de las reglas legado (solo agrega en las V32); dejar constancia + verificar post-relink que las corridas legado no cambian |
| (e) R8/T-C aguas abajo: los textos IA llegarán a UI/informe | Ningún literal visible nombra IA; el criterio anti-fugas está en T6 |

## § 9 · Criterios de rollback por paso

`docs/_evidencia/T-PDF-BASE-20260927/rollback.md` se escribe ANTES de cualquier write (paso 1), patrón `T-APLICAR-AIRTABLE-20260925/rollback.md`:

| Paso | Rollback |
|---|---|
| Pieza 1 (links) | Quitar los 3 links V32 agregados en cada fórmula (los originales están dump-eados). Disparador: T3 o T4 rojo sin causa explicable |
| Pieza 2 (contrato) | Vaciar `variables_requeridas`/`variables_opcionales` (estado original = vacío, dump-eado). Disparador: T5 rojo irreconciliable. Consolidación de fila duplicada: revertir `activa` y `plantilla_resultado` a los valores del dump |
| Pieza 3 (blueprint) | El repo es la fuente: `git checkout` del blueprint (Sergio). En Make: borrar el escenario importado o dejarlo inactivo sin registro. Textos escritos por Run once: restaurar valores previos del dump (estaban vacíos) |
| VP-2026-0067 | Marcar cancelada/TEST (T4-R); no se borra evidencia |
| AT03 | Si quedó apagada por error: reactivar es siempre seguro; verificar atascos en `visitada` |

## § 10 · Prompt sugerido para FASE 2

```markdown
Arrancamos TANDA T-PDF-BASE-20260927 — FASE 2: EJECUCIÓN.
Plan aprobado: docs/_planes/PLAN_T-PDF-BASE-20260927.md (rama plan/T-PDF-BASE-20260927). Respuestas del OK Gate: (a)=___ (b1)=___ (b2)=___ (c1)=___ (c2)=___ (c3)=___ (c4)=___ (d)=___.

Autorización: escrituras Airtable SOLO las del § 2 del plan según Gates; los writes manuales los hago yo (Sergio) con tus instrucciones "pegá esto acá"; blueprint v0.2 lo editás vos en el repo; NO commit/push (los hago yo); Make lo toco solo yo.

BLOQUE 0 — Snapshot: generá docs/_evidencia/T-PDF-BASE-20260927/rollback.md con los valores originales (GET) antes de cualquier write. Avisame cuando esté para yo desactivar AT03 (si Gate d = sí).

BLOQUE 1 — EN PARALELO (dame las 3 líneas juntas):
- Línea A: instrucciones exactas de UI Airtable para agregar los 3 links V32 a F_UFm2_promedio (recFcpOeKjXNunBlj) y F_DesviacionVsPromedio (recliyqVJAGatkDw0). Verificás T3 por GET cuando te confirme.
- Línea B: dame los 2 bloques de texto listos para pegar en variables_requeridas y variables_opcionales de recK3ICXfmbEdWpFQ (§ 4b del plan) + la nota de origen. Verificás T5. (Si Gate b2 = sí: instrucciones de consolidación de la fila duplicada.)
- Línea C: editá docs/_artefactos/make/SC-Textos.blueprint.json a v0.2 según § 4c y las decisiones c2/c3; dame la lista de datos mínimos a poblar en el registro de prueba.

BLOQUE 2 — SECUENCIAL tras A y B verificadas: reactivo AT03; creo/completo VP-2026-0067 espejo CON las 7 filas de comparables según tus instrucciones; disparo el motor (estado→visitada en UI Airtable); verificás T4. Después importo SC-Textos v0.2 en Make (me das checklist de import: webhook, API key, prompt canónico), hago Run once, verificás T6, registramos en Z_EscenariosMake/Z_Webhooks y queda INACTIVO.

BLOQUE 3 — TESTS: corré T1/T2/T7a/T8, dame la lista de screenshots T7b para que los saque yo, armá la evidencia T9 y lanzá el auditor ciego T10 (agente fresco, solo rec-ids + oráculo + criterios).

BLOQUE 4 — ROLLBACK CONDICIONAL: si algo queda rojo tras un reintento, aplicá el § 9 del plan y frenamos.

CIERRE: sobreescribí C:\Users\Sergio\Documents\claude-out.txt (vía /mnt/c/...) con el resumen no técnico: qué quedó verde, qué quedó pendiente, y si la tanda cierra o queda abierta.
```

## § 11 · Conflictos entre agentes y resolución propuesta

| # | Punto | Estado | Resolución propuesta |
|---|---|---|---|
| C-1 | Auditoría 26-sep ("linkeadas solo a reglas legado") vs cierre T-MOTOR-FORMULAS-20260926 ("linkeadas a las mismas 6 reglas") | **RESUELTO por Agente 2 con evidencia primaria** | No hay contradicción de hechos: ambas describen el mismo estado (las 2 fórmulas → 6 legado). El doc de pasos del 25-sep (`PASOS_UI_UF_MOTOR_20260925.md:48,79`) trató "las 6 reglas activas" como universo completo cuando la base tiene 9 activas. Además, "T-MOTOR-FORMULAS-20260926" no existe como artefacto en el repo (grep = 0 hits); el cierre fue ejecución manual sin documento. El P0-quirúrgico sigue vigente hoy (verificado 27-sep) |
| C-2 | Doble regla ganadora en VP-2026-0066: `A_DecisionesMotor.regla_ganadora` = MetLife legado (→ MUTUO_MET.docx) vs `TX_Solicitudes.regla_aplicada` = V32 (→ PLANTILLA_REFI_CASA, placeholder vacío e inactivo) | Hallazgo independiente de Agentes 1, 2 y 3 — **decide Sergio** | Si SC09 resolviera plantilla por `regla_aplicada`, renderizaría contra un placeholder vacío. Propuesta: re-apuntar `REGLA_REFI_CASA_V32.plantilla_resultado` → `recK3ICXfmbEdWpFQ` (Gate § 12-b2). Asimetría inversa anotada (D-3 del Agente 2): si AT01 re-corre, ganaría la regla legado, que tiene las 2 fórmulas de comparables pero NO los 13 terminales v32 — fuera del alcance de este P0, queda registrado |
| C-3 | `analisis_referencias`: auditoría §4 lo pide como columna+clave IA (P0) vs `prompts-textos-informe.md:25` que lo declara texto fijo de plantilla (decisión E-85 pendiente) | Contradicción entre docs, no entre agentes — **decide Sergio** (Gate § 12-c2) | Recomendación del consolidador: texto fijo de plantilla (cero schema, cero dependencia de Pieza 1, coherente con la matriz que lo clasifica PLANTILLA); la vía columna-IA queda disponible para una tanda posterior |
| C-4 | `{d.comparablesInforme.tasacionVsPct}`: Agente 3 lo dejó en opcionales (HUECO/P1-8 en la matriz) pero la Pieza 1 de esta misma tanda persiste su insumo | Resuelto por el consolidador | Promovido a requeridas condicionado al Gate § 12-a (nota en § 4b). Evidencia primaria (matriz actual) vs estado post-tanda: gana el estado post-tanda porque el contrato se escribe DESPUÉS del relink |
| C-5 | Hallazgos colaterales fuera de alcance (se documentan, no se tocan): bug filtro fecha `H_PreciosUF` en `ensamblador.ts:279-282` (usdDia sale null con el dato cargado) · `textosIA` hardcodeado null (`ensamblador.ts:478-482`) · `{d.textosIA.descripcionSector}` ausente de la plantilla provisional · spinner sin mensaje (`estado-procesando.tsx:172-178`) · choices duplicados pdf/PDF · pares de campos redundantes en C_Plantillas · `avaluo_fiscal_uf` con CLP copiado en 0066 | Sin conflicto — inventario para tandas futuras | Registrar en `docs/CODE_INCONSISTENCIES.md` en el cierre de Fase 2 (el bug usdDia es candidato S para la tanda de la imprenta) |

## § 12 · OK Gate — preguntas para Sergio antes de autorizar Fase 2

- **(a) Matriz Pieza 1** — ¿Confirmás agregar las 3 reglas V32 (`recYEf9XepX4SmLnH`, `rec2QYP8yjMW1Smsm`, `reckDNGORrc45HTN9`) a los links de ambas fórmulas, sin quitar ninguno de los 6 legado (quedan 9 c/u)?
  a) Sí, tal cual (recomendada — evidencia de Agentes 1 y 2 coincidente) · b) Solo a REGLA_REFI_CASA_V32 (mínimo para MET-6283, deja Depto/Default cojos) · c) Revisar antes.
- **(b1) Lista Pieza 2** — ¿Confirmás el contrato § 4b (52 requeridas + 24-25 opcionales, un tag por línea)? a) Sí · b) Con ajustes (indicá cuáles).
- **(b2) Fila duplicada y plantilla de la regla V32** — a) Consolidar en MUTUO_MET.docx + desactivar `Plantilla_Base_METLIFE` + re-apuntar `REGLA_REFI_CASA_V32.plantilla_resultado` (recomendada) · b) Solo poblar el contrato, no tocar filas ni reglas · c) Decidir después.
- **(c1) Pieza 3 base** — ¿Autorizás editar el blueprint a v0.2 en el repo + import manual tuyo en Make + Run once de prueba, quedando INACTIVO? a) Sí (recomendada) · b) Solo editar blueprint, sin importar aún.
- **(c2) Decisión E-85 · analisis_referencias** — a) Texto fijo de plantilla, sin columna nueva (recomendada) · b) Columna nueva + clave IA en el prompt (requiere crear campo y depende de Pieza 1).
- **(c3) Log de SC-Textos** — a) `typecast:true` en módulos 12/13, sin tocar schema (recomendada) · b) Agregar choice "SC-Textos" al singleSelect de LogEscenarios.
- **(c4) Datos de prueba** — ¿Autorizás poblar los datos mínimos del registro de prueba para SC-Textos (pisos, condominio, habitaciones) y crear VP-2026-0067 espejo con las 7 filas de comparables para T4? a) Sí, ambos · b) Solo VP-2026-0067 · c) Reutilizar VP-2026-0066 para todo (menos limpio: mezcla oráculo con pruebas).
- **(d) Ventana AT03** — ¿Desactivás AT03 durante el relink (ventana corta coordinada, reactivación verificada)? a) Sí (recomendada por Agente 7) · b) No, relink con AT03 activa (riesgo bajo pero real de corrida a mitad de cambio).

---

*Entregables Fase 1: este plan + cierre en `claude-out.txt`. Reportes fuente: 7 agentes, 27-sep-2026. Ningún write ejecutado.*
