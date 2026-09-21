# PLAN_prod-met6283 · Réplica end-to-end de la tasación MET-6283 en PRODUCCIÓN

> **Tanda PROD-MET6283 · FASE 1 (planificación).** Producto de 5 agentes expertos en paralelo
> (Arquitecto, Auditor de oráculo, QA, Frontend, Seguridad), consolidado. Rama `plan/prod-met6283`.
> Read-only: este documento NO autoriza ejecución. La FASE 2 se autoriza tras el OK Gate (§12).
> Fecha: 21-09-2026.

---

## § 1 · Resumen ejecutivo

Replicar en la app de producción (`https://if-ejecutiva-production.up.railway.app`) la tasación
MET-6283 cargando los 8 documentos de `docs/_referencias/Met_6283/` por la UI del tasador (IF-03),
hasta que la UI de Informe muestre los mismos valores que el PDF oráculo. El motor AT03 v11.1.1 ya
está validado (B-0b: 13/13 ±1%); esta tanda valida el **recorrido UI completo** (carga → extracción →
datos → totales → informe). Éxito = 53 tests en verde **y** valores UI ≡ PDF (±1%). Sobre un record
sandbox aislado (`-TEST`), sin tocar cartera real ni catálogo del motor.

---

## § 2 · Alcance — qué SÍ / qué NO. Aislamiento del record.

**SÍ se hace (FASE 2, tras OK Gate):**
- Operar la UI del tasador en prod sobre UN record sandbox MET-6283 aislado.
- Subir los 8 documentos por la UI; dejar correr extracción (RF-09) y motor (AT03).
- Leer Airtable por MCP/REST para verificar (read-only de verificación).
- Screenshots de las rutas UI (§7). Documento de evidencia en `plan/prod-met6283`.

**NO se hace (prohibido · detalle §8):**
- Modificar código (R5), esquema, automations, o el catálogo del motor (`Regla_MetLife_*`).
- Commit/push/merge por Claude (R12 — lo hace Sergio).
- Tocar cualquier record que no sea el sandbox `-TEST`; en particular `VP-2026-0060` y la cartera real.
- Exponer lenguaje de IA/OCR en UI (R8/T-C).

**Aislamiento del record (A5):** identificar SIEMPRE por `record_id` y por el sufijo
`numero_solicitud = METLIFE-6283-TEST`. Candidato existente: `recNiwM4s1ibr3sbO` / `VP-2026-0066`
(propietario real Francisco Vergara sólo dentro del sandbox). **⚠ Decisión pendiente (OK Gate §12):**
ese record ya está en `estado=calculada` con 13 TX_Calculos y datos sembrados a mano (no por UI) —
para un end-to-end real por UI hace falta un record en `asignada` sin datos ni adjuntos. Ver Q1.

---

## § 3 · Diseño técnico consolidado (Agente 1)

**Rutas UI (orden real, App Router):**
1. `app/tasaciones/page.tsx` — cola; abrir card MET-6283 (`estado=asignada`).
2. `app/tasaciones/[id]/coordinar/page.tsx` — coordinación (flag `TASADOR_COORDINACION_ENABLED`; en prod la solicitud ya viene coordinada · ver CONFLICTO C-2 §11).
3. Carga de los 8 documentos (⚠ *dónde* exactamente = CONFLICTO C-1 §11).
4. `app/tasaciones/[id]/lectura/page.tsx` — stepper "Leyendo datos de la visita" (polling RF-09).
5. `app/tasaciones/[id]/page.tsx` — formulario 8 secciones A–H; botón "Calcular Tasación".
6. `app/tasaciones/[id]/estado/page.tsx` — polling "Calculando tasación".
7. `app/tasaciones/[id]/informe/page.tsx` — preview 8 bloques.

**Automations / gatillos:**
- **RF-09 extracción:** `POST /api/adjuntos/upload` (→ Make → Dropbox) crea `TX_Adjuntos`;
  `PATCH /api/tasaciones/[id]/fotos` repone `clave_adjunto` + `estado_extraccion='idle'`. La automation
  Airtable dispara sobre `estado_extraccion==='idle'` + clave no vacía (RN-25). Poll:
  `GET /api/tasaciones/[id]/lectura`. **⚠ Feasibilidad = Q2 §12 (¿RF-09 provisionada y viva en prod?).**
- **AT03 motor:** `POST /api/tasaciones/[id]/calcular` = único `PATCH estado='visitada'` (guard 409 desde
  `asignada`). `asignada→visitada` dispara la cadena → AT03 lee `TX_ItemsCuadroValoracion` (`hay_cuadro=1`)
  → escribe 13 `TX_Calculos` → `estado='calculada'`.

**Campos/tablas poblados (orden de dependencia):**
`TX_Adjuntos` (8) → RF-09 puebla `TX_DatosTasacion` + hijas (`TX_DocumentosLegales`, `TX_Unidades`,
`TX_ItemsCuadroValoracion`, `TX_Comparables`) → `PATCH /datos` persiste A–H + `fecha_real_visita`
(obligatoria, T-B) → `estado='visitada'` → AT03 → `TX_Calculos` (13) → `estado='calculada'`.

**Dependencia dura:** `TX_ItemsCuadroValoracion` poblado ANTES de `calcular`, o AT03 corre con
`hay_cuadro=0` (modelo previo). `[INFERIDO]` el mapeo exacto doc→tabla de RF-09 no está en los handlers.

---

## § 4 · Tabla oráculo completa (Agente 2)

**Propiedad:** Francisco José Vergara Undurraga · Los Eucaliptus N°2100, Cond. Las Brisas de Chicureo,
Colina · Rol SII 882-40 · MetLife · Refinanciamiento · fecha tasación 13-04-2026 · UF día 39.894,61.
Todos los valores verificados directamente contra el PDF oráculo (p.2) y los 8 docs de entrada.

### (a) Archivos que deben quedar cargados (8)

| Archivo | clave_adjunto | Tabla destino |
|---|---|---|
| permiso_edificacion_Met6283.pdf | `permiso_edificacion` | TX_DocumentosLegales |
| certificado_recepcion_final_Met6283.pdf | `certificado_recepcion_final` | TX_DocumentosLegales |
| inscripcion_dominio_cbr_Met6283.docx | `inscripcion_dominio_cbr` | TX_DocumentosLegales |
| informe_no_expropiacion_serviu_Met6283.pdf | `informe_no_expropiacion_serviu` | TX_DatosTasacion |
| consulta_antecedentes_bien_raiz_Met6283.pdf | `consulta_antecedentes_bien_raiz` | TX_DatosTasacion |
| foto_fuente_sii_Met6283.JPG | `foto_fuente_sii` | TX_DatosTasacion + TX_Unidades |
| foto_comparables_Met6283.JPG | **`foto_ofertas_comparables`** (⚠ ≠ nombre archivo) | TX_Comparables |
| certificado_deuda_tgr_Met6283.pdf | `certificado_deuda_tgr` | ninguna (no-op por diseño) |

### (b) Datos ingresados (extracto verificado; fuente = PDF p.2 + doc de entrada)

**Legales:** permiso 319 / 2020-09-09 · recepción 210 / 2024-07-18 · CBR fojas **3312** · nº insc **4663** ·
año **2020** (CBR docx legible — confirmados, ya no "pendiente"). **SERVIU:** n_cert **3444743** · afecto
expropiación **NO** · lat/long **vacíos**. **SII (consulta antec. H2):** avalúo total **339.809.429** ·
exento 60.030.710 · afecto 279.778.719 · destino **HABITACIONAL** · contribución semestral 679.162.
**Superficies/materiales:** edificación **249,91 m²** · terreno **5.024,86 m²** (Terreno 1.402,35 +
Servidumbre 3.622,51) · material **ALBAÑILERÍA LADRILLO** · calidad **BUENA** · regularizado 2024 · 1 piso ·
OO.CC. piscina + quincho/terrazas/bodega + cierros/pavimento. **Rentabilidad:** arriendo 3.300.000 $/mes ·
gasto anual 3.300.000 · cap rate **0,045** · velocidad venta "8 a 10 meses".

**⚠ 3 discrepancias reales origen-SII (foto_fuente_sii) vs informe — HAZARD de extracción (§8, Q3):**
1. Avalúo foto SII = **120.267.353** vs informe **339.809.429** (el motor usa el de consulta antec. H2).
2. Destino foto SII = **"Sitio Eriazo"** vs informe **"HABITACIONAL"**.
3. Terna dominio foto SII = 13291/21565/2006 vs **CBR 3312/4663/2020** (TX_DocumentosLegales usa la del CBR).

**Comparables (foto JPG · sólo lectura · TX_Comparables): 7 reales** (5 REF. OFERTAS + 2 REF. C.B.R.),
≥3 (RF-24). Correcciones a oráculo-previo: son **7**, no "hasta 8"; Ref1 = 20.000 UF/5.051 m²T/239 m²C,
Ref2 = 24.900 UF/5.077 m²T/239 m²C (el previo los tenía invertidos). Promedio muestra ofertas ≈ 21.440 UF.

### (c) Totales calculados — 13 terminales (PDF p.2, ±1%)

| # | variable_output | UF | CLP |
|---|---|---|---|
| 1/2 | valor_comercial | **20.125,86** | **802.913.431** |
| 3/4 | valor_reposicion | 9.246,94 | 368.903.065 |
| 5/6 | seguro_incendio | 8.907,06 | 355.343.781 |
| 7 | avaluo_fiscal_uf | 8.517,68 | (input 339.809.429) |
| 8/9 | valor_remate (65%) | 13.081,81 | 521.893.730 |
| 10/11 | valor_liquidacion (82,5%) | 16.603,84 | 662.403.581 |
| 12 | ingreso_liquido_anual_clp | — | 36.300.000 |
| 13 | renta_perpetua_clp | — | 806.666.667 |

**Insumos SCOPE del cuadro (auditoría DAG):** edif. depreciada 8.157,06 (BI59) · edif. nuevo 8.496,94
(CC70) · terreno 11.218,80 (BI61) · OCC 750 (BI60) · sup terreno 5.024,86 (AN61) · seguro base 8.907,06
(BO62) · uf/m² 34,00 · factor D.F. 0,96. (Coincide 1:1 con las 6 filas de `TX_ItemsCuadroValoracion`.)

### (d) UI de Informe

VALOR TASACIÓN **UF 20.125,86 · $ 802.913.431** (al 13-04-2026) · Valor a Remate **UF 13.081,81 ·
$ 521.893.730** · UF día 39.894,61 · US$ 890,33 · velocidad venta "8 a 10 meses" · fecha visita
15-04-2026 · tasador María Eugenia Soto · visador Héctor Martínez C.

---

## § 5 · Plan de ejecución paso a paso (dependencias)

| Paso | Acción | Modo | Depende de |
|---|---|---|---|
| 0 | Resolver OK Gate (§12): record objetivo, RF-09 viva, SC05 apagado, hazard SII | **GATE** | — |
| 1 | Abrir `/tasaciones`, abrir card MET-6283 (`asignada`) | SECUENCIAL | 0 |
| 2 | Confirmar coordinación vigente (precondición) | SECUENCIAL | 1 |
| 3 | Subir los **8 documentos** por la UI (checklist documental) | **PARALELO** (8 uploads) | 2 |
| 4 | Por cada upload, `PATCH /fotos` repone `idle` + clave correcta | SECUENCIAL (por archivo) | 3 |
| 5 | Extracción RF-09 puebla las 8 filas + tablas hijas | **PARALELO** (8 extracciones) | 4 |
| 6 | **Barrera:** `GET /lectura` → todos los adjuntos en estado terminal | BARRERA | 5 |
| 7 | Completar/verificar A–H + `fecha_real_visita`; `PATCH /datos` | SECUENCIAL | 6 |
| 8 | **Barrera crítica:** `POST /calcular` (idempotente 409 · NUNCA doble) | BARRERA | 7 |
| 9 | Poll `GET /estado` hasta `calculada` (AT03) | SECUENCIAL | 8 |
| 10 | `GET /informe` → preview; screenshots (§7) | SECUENCIAL | 9 |

**Paralelizable en FASE 2:** pasos **3** (subida de 8 docs) y **5** (8 extracciones). Todo lo demás
es secuencial. El paso 8 es punto de no-retorno (dispara AT03, `visitada` irreversible).

---

## § 6 · Batería de tests obligatoria (Agente 3) — 53 tests

Criterio **HECHO** = los **53 tests en VERDE** Y valores renderizados en UI ≡ PDF oráculo (±1%).

| Grupo | Nº | Contenido | Negativos/regresión |
|---|---|---|---|
| A · Carga de archivos por UI | 12 | 8 filas TX_Adjuntos, estados terminales, enrutamiento por clave, 0 err en LogEscenarios | A-09 (comparables ROTO), A-10 (no-op TGR), A-11 (0 err) |
| B · Datos ingresados por UI | 15 | Legales, SERVIU, SII, superficies, comparables, rentabilidad reflejan el oráculo | B-11/B-12 (comparables), B-13 (no-op TGR), B-15 (8 secciones CI-014) |
| C · Totales por UI (13 terminales) | 18 | Los 13 valores ±1% + gates Bloqueos #1–#3 + 0 contaminación | C-14 (contaminación), C-15/16/17 (regla/calidad/terreno) |
| D · UI de informe vs PDF | 8 | Valor tasación, remate, UF día, rol/destino; cascade de borrado | D-06/D-07 (cascade + huérfanos A-45), D-08 (no-op TGR) |
| **TOTAL** | **53** | | **13 negativos** |

**Semántica de los bugs conocidos:** A-09/B-11/B-12 pasan sólo si TX_Comparables recibe ≥3 filas sin
`"bucket ANULADO"`; A-10/B-13/D-08 pasan sólo si el TGR es no-op verificado (diff vacío); C-14/D-07
pasan sólo con 0 contaminación / 0 huérfanos. Cualquier `"bucket ANULADO"`/`0 ok` mantiene HECHO **no
cumplido** hasta documentar qué lo destrabó. Valores numéricos ±1%; fechas/enteros/enums exactos.
`[INFERIDO]`: C-18 (UI render ≡ DB — screenshot lo toma Sergio, sin tooling browser).

---

## § 7 · Rutas UI a screenshotear (Agente 4)

URL base prod: **`https://if-ejecutiva-production.up.railway.app`** (⚠ no "si-ejecutiva-producción").
Viewport **móvil 375×812** (IF-03 es mobile-first). `[id]` = record ID Airtable (`rec…`).

| # | Ruta | Componente | Qué debe mostrar |
|---|---|---|---|
| 0 | `/tasaciones` | `cola-tasaciones.tsx`, `tasacion-card.tsx` | Card MET-6283 con SLA y código/dirección del oráculo |
| 1 | `/tasaciones/<recId>/fotos` | `fotos-screen.tsx` + sheet documental `documentos-adjuntos-sheet.tsx` (§F) | Fotos por categoría **y** checklist de los 8 documentos cargados |
| 2 | `/tasaciones/<recId>` | `tasacion-form.tsx` + `form-sections/*` | Formulario 8 secciones A–H: un screenshot por sección (anclas `#seccion-A`…`#seccion-G`) |
| 3 | `/tasaciones/<recId>/estado` | `estado-procesando.tsx` (var. `calculo`) | "Calculando tasación" / "Informe listo" |
| 4 | `/tasaciones/<recId>/informe` | `informe-preview.tsx` | **8 bloques del informe** — foco en Bloque 2 (Valor tasación UF + cap rate) |

**8 bloques del informe a capturar:** (1) Cabecera, (2) **Valor de tasación UF + cap rate** ← el número
crítico, (3) Antecedentes propiedad, (4) Datos SII/avalúo, (5) Cuadro de valoración, (6) Comparables,
(7) Registro fotográfico, (8) Observaciones/overrides. Botón "Descargar PDF" (Carbone) para comparar
cuadro-a-cuadro con el oráculo. Capturar el diálogo "¿Enviar al visador?" **antes** de enviar (irreversible).

---

## § 8 · Restricciones y riesgos de operar en producción (Agente 5)

**Reglas duras** (texto en `docs/_md/plan_ejecucion_UItasador_v1.5.md §0.2` + `CLAUDE.md`):
- **R5** No tocar código construido (IF-02/IF-03/IF-04). · **R7** Reuso antes de crear. · **R12** Commits
  los hace Sergio. · **R8/T-C** Cero lenguaje de IA/OCR en UI. · **RO-05** Umbral SLA 4h no se
  almacena/codifica aparte (una sola fuente).

**Riesgos:**
- **Huérfanos A-45:** el upsert de comparables nunca borra COMP sobrantes de corridas previas → reintentos acumulan filas fantasma.
- **Bucket ANULADO:** item sin `fila` válida anula todo el bucket comparables (0 filas) — falla esperada.
- **Motor sobre datos reales:** `estado→visitada` dispara AT03; debe correr SÓLO sobre el record `-TEST`.
- **Catálogo del motor:** prohibido editar `Regla_MetLife_Refinanciamiento_Casa.formulas_resultado` (regla compartida por toda la cartera MetLife).
- **SC05 a tasador real:** el sandbox tiene tasador real (Nelcy Jaimes); transiciones podrían gatillar emails. Verificar SC05 apagado antes de mover estados (MCP no lee Automations).
- **AT02 encendido** (REGLA A · D-15): asignaría tasador por su cuenta y chocaría con guard 409.
- **Rate limit Airtable** `[INFERIDO]` ~5 req/s: espaciar las 8 subidas; esperar `estado_extraccion` entre cada una.
- **Hazard SII (§4):** la foto SII trae avalúo/destino/terna distintos al informe; si la extracción los toma, contamina TX_DatosTasacion.

**Prohibido en FASE 2:** (1) git por Claude; (2) editar código IF-02/03/04; (3) Opción 2 del Bloqueo #1
(editar la regla MetLife); (4) tocar records ≠ sandbox `-TEST` (esp. `VP-2026-0060`); (5) almacenar el
umbral SLA aparte / MCP como runtime; (6) lenguaje de IA en UI; (7) reintentar comparables sin limpiar
huérfanos A-45; (8) disparar `visitada`/SC05 sin verificar bloqueos y notificaciones.

---

## § 9 · Criterios de rollback por paso (cómo limpiar el record en prod)

| Paso que falla | Síntoma | Rollback / limpieza |
|---|---|---|
| 3–4 Subida | Adjunto con clave errónea / archivo equivocado | Borrar la fila `TX_Adjuntos` desde la UI (cascade patrón b limpia lo poblado); re-subir con clave correcta |
| 5–6 Extracción | `estado_extraccion=error` o datos SII contaminados (hazard) | Borrar el adjunto ofensor (cascade limpia sus campos); corregir manualmente el dato en la sección; re-extraer |
| 5 Comparables | `"bucket ANULADO"` / 0 filas / huérfanos A-45 | Documentar; borrar COMP huérfanos manualmente por `clave_natural`; no reintentar en ciclo |
| 7 Datos | `PATCH /datos` inconsistente | Re-editar la sección en la UI (mutación reversible; `A_Cambios` audita) |
| 8 Calcular | AT03 no corre / valores ≠ oráculo | `estado` volvió a `visitada`/`calculada`; para re-correr, AT03 hace CLEANUP de TX_Calculos. Si el resultado es malo, **DETENER**, documentar celda; no re-disparar en loop |
| Total | Record contaminado sin recuperación limpia | Marcar el record como descartado (`notas: SANDBOX DESCARTADO`), crear uno nuevo `-TEST` y reiniciar. **Nunca** borrar records de cartera real |

**Regla de oro de rollback:** toda limpieza se hace SÓLO sobre el record `-TEST` identificado por su
`record_id`; ante cualquier duda de identidad, DETENER y preguntar.

---

## § 10 · Prompt sugerido para FASE 2 (listo para pegar)

```markdown
TANDA PROD-MET6283 — FASE 2: EJECUCIÓN.
Autorización: ejecutar el plan docs/_planes/PLAN_prod-met6283.md sobre el record sandbox
<RECORD_ID_TEST> (numero_solicitud METLIFE-6283-TEST) en producción.
Precondiciones confirmadas por Sergio (OK Gate §12): [pegar respuestas Q1–Q6].

Ejecutar en orden (§5), respetando dependencias SECUENCIAL/PARALELO:
1. Abrir /tasaciones, card MET-6283. 2. Confirmar coordinación. 3. Subir los 8 docs (paralelo).
4. Reponer clave+idle por archivo. 5. Dejar correr RF-09. 6. Barrera: todos terminal.
7. Completar A–H + fecha_real_visita. 8. POST /calcular (una sola vez). 9. Poll hasta calculada.
10. Abrir /informe, screenshots.

Verificar los 53 tests (§6). Criterio HECHO = 53 en verde Y valores UI ≡ PDF oráculo (±1%).
Rollback por paso según §9. Restricciones duras §8 (NO git, NO tocar código/regla/otros records,
NO lenguaje de IA en UI). Reportar tabla de resultados por test + screenshots.
Al cierre: sobreescribir C:\Users\Sergio\Documents\claude-out.txt y avisar para OK Gate de cierre.
NO commit/push (lo hace Sergio).
```

---

## § 11 · Conflictos entre agentes y resolución

| # | Conflicto | Posturas | Resolución propuesta |
|---|---|---|---|
| **C-1** | ¿Dónde se cargan los 8 documentos? | A1: en `/tasaciones/[id]/fotos`. A4: `fotos` es organizador de **fotos de la propiedad**; los **documentos** van por el sheet documental de la Sección F (`documentos-adjuntos-sheet.tsx` / `document-checklist.tsx`) | **A4** (evidencia a nivel componente). FASE 2: documentos por el checklist documental; `fotos` sólo para fotos de terreno. **Confirmar con Sergio (Q4).** |
| **C-2** | Paso `coordinar` en el recorrido | A1: paso 2 del flujo. A4: ruta lateral (P4-TAS, tras flag CI-012), no central | **A4**: no es central; el sandbox ya está `asignada`/coordinado. Sólo confirmar coordinación vigente. |
| **C-3** | Nº y valores de comparables | Oráculo-previo/A3: "hasta 8"; A3 B-12 cita Ref1 24.900/Ref2 20.000. A2 (lectura directa del JPG): **7** comparables, Ref1=20.000 / Ref2=24.900 (invertidos) | **A2** (verificación directa del JPG). Corregir B-12: usar la tabla de 7 de A2. Mínimo RF-24 (≥3) igual se cumple. |
| **C-4** | CBR fojas/número/año | Plan v3: "confirmar" (baja-res). A2: imagen legible → 3312/4663/2020 confirmados | **A2**: confirmados. Ya no son "pendiente". |

*No es conflicto pero es hazard crítico:* la **foto SII** trae avalúo 120.267.353 / destino "Sitio Eriazo" /
terna 13291/21565/2006, distintos del informe (339.809.429 / HABITACIONAL / CBR 3312/4663/2020). La
extracción debe tomar el avalúo de **consulta_antecedentes (H2)** y la terna del **CBR**, no de la foto SII.

---

## § 12 · OK Gate — preguntas para Sergio antes de FASE 2

1. **Q1 · Record objetivo.** ¿Reutilizamos `VP-2026-0066` (recNiwM4s1ibr3sbO, hoy `calculada`, datos
   sembrados a mano) reseteándolo a `asignada` y limpiando adjuntos/datos/calcs, o **creamos un record
   `-TEST` nuevo** para un end-to-end 100% por UI? (El objetivo "cargar por UI" sugiere record nuevo.)
2. **Q2 · RF-09 en prod.** ¿La automation/escenario de extracción documental (RF-09) está **provisionada
   y viva en producción**? CLAUDE.md la listaba "❌ por provisionar". Si no lo está, la extracción no
   poblará datos y habría que ingresarlos a mano (cambia el alcance del test).
3. **Q3 · Hazard SII.** ¿La extracción de `foto_fuente_sii` está configurada para NO pisar avalúo/destino
   con los valores de la foto (120.267.353 / "Sitio Eriazo")? ¿Confirmás que el avalúo válido es el de H2 (339.809.429)?
4. **Q4 · Carga de documentos (C-1).** ¿Los 8 documentos se suben por el checklist documental de la
   Sección F (no por la pantalla de fotos)? Confirmar la vía correcta en la UI de prod.
5. **Q5 · SC05 / notificaciones.** ¿Confirmás que SC05 (y AT02) están **apagados** o no notifican al
   tasador real al mover estados del sandbox? (MCP no puede verificar Automations.)
6. **Q6 · Comparables ROTO / bloqueos.** ¿Aceptás que si el bucket de comparables se anula (bug ROTO) o
   los Bloqueos #1–#3 no quedan resueltos por extracción, la FASE 2 se **detiene y documenta** (no se
   fuerza el resultado con overrides)? ¿O autorizás resolver bloqueos como en B-0b (PATCH regla, etc.)?

**La FASE 2 no arranca hasta tener Q1–Q6 respondidas.**
