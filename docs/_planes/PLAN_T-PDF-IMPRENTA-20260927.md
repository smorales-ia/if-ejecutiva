# PLAN T-PDF-IMPRENTA-20260927 — Cadena completa hasta el PDF de MET-6283

> Fase 1 consolidada · 27-sep-2026 · rama `plan/T-PDF-IMPRENTA-20260927` → ejecución en `feat/T-PDF-IMPRENTA-20260927`.
> Equipo Fase 1: 7 agentes (Arquitecto · Diseñador plantilla · Auditor Make API · Analista PDF+XLSM · QA · Seguridad · Frontend).
> RO-30: MCP Airtable en 403 → REST GET con token server-side. Make por API REST (token verificado). Cero writes en Fase 1.
> **GATE INTERNO G1–G4: PASÓ** (ver § 10) → Fase 2 autorizada de corrido por Sergio.

## § 1 · Resumen

Objetivo: PDF de VP-2026-0067 generado por la cadena UI → AT03 → SC-Textos → Carbone (plantilla NUEVA) → Dropbox → link en Airtable, comparado contra el gold master MET-6283 en datos y diseño. La plantilla se construye con python-docx desde el plano del Diseñador (evidencia: `plano-plantilla.md`) y el oráculo del Analista (`oraculo-met6283.md`). Paridad total declarada imposible hoy (fotos/mapa/anexos/firma/cualitativa sin fuente digital) → resultado esperado: **"Sí-con-diferencias"** con lista explícita. Bonus de Fase 1: **H-T4b resuelto** — la fórmula del −3% extraída del XLSM (`Portada!AX36`: UF/m² edificación 32,64 vs promedio homogeneizado de las 5 ofertas 33,64 = −2,98% → "-3%"); el motor promedia las 7 filas y compara contra el valor total → +160,5%. Corregirlo es cambio de motor: fuera de alcance, documentado.

## § 2 · Alcance

**SÍ:** plantilla nueva `docs/_artefactos/carbone/PLANTILLA_MET_v1.docx` (+ script generador) · subida a Carbone PROD (templateId nuevo; el actual en `.env.local` está VACÍO — sin colisión) · actualización de `CARBONE_TEMPLATE_ID` en `.env.local` · creación de SC-Textos en Make vía API (POST /hooks + POST /scenarios con blueprint v0.2; autorizado por el prompt de la tanda) + Run once sobre 0067, queda APAGADO · cirugía de **E2 (5750023)**: URL de render → templateId nuevo, body → `contexto` anidado + `convertTo:pdf` + `lang:es-cl` · cirugía de **E3 (5791413)**: agregar share-link Dropbox + PATCH `TX_Solicitudes.pdf_final_url` + estado `pdf_listo` + fila `TX_DocumentosGenerados` + fix `formatDate` roto (los blueprints originales van al rollback ANTES) · fix puente `textosIA` en `lib/informe/ensamblador.ts:478-482` (fuera del perímetro R5) · route nuevo `POST /api/tasaciones/[id]/generar-pdf` (patrón `asignar/route.ts`) + cableo del stub `marcarPdfListo` (`lib/tasador/tasaciones.ts:405-410`, botón en `informe-preview.tsx:289-294`) · datos de prueba en 0067: visador + `ejecutivo_solicitante` + `n_operacion_cliente` (GAPs D25/B5/B12 del plano) · corrida E2E real + PDF descargado + comparación.

**NO:** motor AT03 y sus fórmulas (el fix del −3% queda para tanda posterior con la aritmética ya resuelta) · VP-2026-0066 y cartera real · escenarios productivos (SC01/SC-Asignar/SC-Edicion/SC-RF09/SC-Adjuntos) · código IF-02 (R5) · columnas nuevas en Airtable · mapa con pines / fotos de comparables / merge de anexos escaneados / firma manuscrita / cualitativa Hoja 3 (placeholders declarados — tandas P1-x/T4) · commit/push (Sergio).

## § 3 · Diseño de la cadena (Arquitecto, verificado por Auditor Make)

```
Tasador pulsa "Enviar" (informe-preview.tsx:289) → POST /api/tasaciones/[id]/generar-pdf [NUEVO]
  guard tasador + estado='calculada' (409) → lecturaInformeContexto() in-process
  → POST webhook E2 (HMAC X-VP-Signature · make-client.ts:178-191) payload {solicitud_id, codigo, contexto}
E2 (5750023): POST api.carbone.io/render/{TEMPLATE_ID_NUEVO} {data: contexto, convertTo: pdf, lang: es-cl}
  → POST webhook E3 {renderId, codigo, nombre_cliente}
E3 (5791413): GET render/{renderId} (parseResponse=false ✓ ya estaba) → Dropbox /VProperty/Tasaciones
  → share link → PATCH TX_Solicitudes {pdf_final_url fldASzRV9aQNFExpY, estado: pdf_listo}
  → CREATE TX_DocumentosGenerados {version_doc, url_pdf/url_dropbox, fecha_generacion, es_vigente} → log
UI: /estado ve pdf_listo → botón "Descargar PDF" (informe-preview.tsx:274-280, 654-662) lee pdfUrl
```
SC-Textos corre ANTES (Run once en esta tanda; disparo automático queda para cuando exista invocador estable). E2E de esta tanda: el webhook de E2 se puede invocar directo con el `contexto` obtenido por vitest one-shot del ensamblador (Clerk impide curl a informe-data sin sesión).

## § 4 · Oráculos

- **Datos + diseño del gold master**: `docs/_evidencia/T-PDF-IMPRENTA-20260927/oraculo-met6283.md` (exhaustivo, por página, con celda XLSM de origen; incluye la fórmula del −3% y los 3 quirks del gold master: sector truncado en "…el transporte y", TOTAL TERRENO sin punto de miles, años 2.015 con punto — decisión: NO replicar quirks, documentar como diferencia).
- **Plano de la plantilla**: `docs/_evidencia/T-PDF-IMPRENTA-20260927/plano-plantilla.md` (tablas A-G de etiquetas por sección; IDÉNTICO-ALCANZABLE vs APROXIMADO vs NO-REPRODUCIBLE).
- **Contrato**: C_Plantillas `recK3ICXfmbEdWpFQ` = 52 requeridas + 24 opcionales (76, no 77 — corregido el enunciado); mínimo, no máximo: tags adicionales válidos si la ruta existe en `InformeContexto`.

## § 5 · Pasos Fase 2 (∥ = paralelo)

B0: rama feat + snapshot/rollback (blueprints E2/E3 exportados con secretos REDACTADOS, CARBONE_TEMPLATE_ID=vacío, 0067 pre-estado). B1 ∥: (a) fork construye .docx + verificar() + QA-C1 · (b) SC-Textos: POST /hooks + POST /scenarios + key en módulo 7 (sin loguear body) + run once 0067 + verificar textos (QA-B) + OFF · (c) fix textosIA ensamblador + typecheck/tests · (d) datos 0067 (visador etc.) · (e) route generar-pdf + cableo stub + test. B2 secuencial: subir .docx (POST /template PROD) → templateId → `.env.local` → PATCH E2 (URL+body) → PATCH E3 (Dropbox link + Airtable writes + fixes) → activar E2/E3 → obtener contexto (vitest one-shot) → QA-C2 → disparar webhook E2 → PDF real → descargar → QA-D → apagar E2/E3 (decisión: quedan OFF hasta que Sergio active el flujo). B3: comparación datos (QA-E) + diseño (QA-F programático). B4: auditor ciego. B5: rollback condicional + cierre.

## § 6 · Tests

Batería del Agente QA (QA-A no-regresión motor · QA-B textos · QA-C dry-run plantilla · QA-D render/entrega · QA-E datos vs referencia · QA-F diseño · QA-G higiene/secretos · QA-H auditor ciego). Entorno verificado: pypdf + pymupdf disponibles; sin pdfinfo/pdfplumber; sin browser (QA-F5 visual fino = Gate Sergio). Ajuste vs el diseño del QA: subida a Carbone y Run once los ejecuta Claude (autorización explícita de esta tanda); los Gates humanos quedan en 2: click UI autenticado y veredicto visual.

## § 7 · Archivos y pantallas

Código: `app/api/tasaciones/[id]/generar-pdf/route.ts` (nuevo + test) · `lib/tasador/tasaciones.ts` (stub→real) · `lib/informe/ensamblador.ts` (textosIA) · `docs/_artefactos/carbone/{generar_plantilla_met_v1.py, PLANTILLA_MET_v1.docx}`. Pantallas Sergio (3): preview informe (bloques 2/6) · estado "Informe listo" · footer con botón "Descargar PDF" en `pdf_listo`.

## § 8 · Riesgos (Seguridad)

Secretos: blueprints Make exportados traen JWT Carbone y PAT Airtable **hardcodeados en claro** (hallazgo del Auditor) → al guardar en evidencia, REDACTAR; al escribir la key Anthropic vía API, no loguear el body; grep QA-G4 al cierre. E2/E3 inactivos desde mayo y sin invocador productivo → mutarlos es seguro con rollback. Carbone PROD: templateId actual vacío, sin colisión. Dropbox: conexión OAuth Make 7553318, validez solo demostrable ejecutando (si falla → rollback E3 + reporte). `pdf_final_url` SOLO en 0067. `.env.local`: cambio de 1 línea.

## § 9 · Rollback por paso

`rollback.md` ANTES de cada write: blueprints E2/E3 originales (redactados) + restauración por PATCH · CARBONE_TEMPLATE_ID original (vacío) · SC-Textos creado → rollback = stop + delete scenario/hook · escrituras en 0067 (visador, textos, pdf_final_url, estado, fila TX_DocumentosGenerados) con valores previos · código repo → git checkout (Sergio) · plantilla en Carbone → DELETE /template/{id} si se revierte.

## § 10 · GATE interno — evaluación

| Gate | Veredicto | Evidencia |
|---|---|---|
| G1 credenciales | ✅ | Make `GET /users/me` 200 · Carbone PROD 400 `w115` (auth válida) · Airtable OK · Anthropic validada 22-09 · Dropbox = conexión Make (salvedad: se prueba en la corrida; fallo → rollback) |
| G2 plano 100% | ✅ con salvedades | 52/52 requeridas ubicadas; zonas sin fuente = placeholders declarados (fotos/mapa/anexos/firma/cualitativa/US$) → resultado será "Sí-con-diferencias", lista en § 4 |
| G3 conflictos | ✅ | C-1 "re-apuntar E3": el templateId vive en E2 → cirugía en E2+E3 in-place (misma cadena, sin escenario nuevo no autorizado). C-2 "SC-PDF nuevo" del Arquitecto: descartado por directriz + regla CLAUDE.md. C-3 semántica −3%: resuelta en causa (XLSM), fix fuera de alcance |
| G4 Make API | ✅ | Scopes scenarios:read/write/run + hooks:read/write verificados; blueprints E2/E3 leídos; endpoints de escritura documentados en `endpoints-make.md` |

## § 11 · Conflictos y hallazgos

1. H-T4b RESUELTO (fórmula −3% del XLSM) — recomendación para tanda posterior: ajustar `F_UFm2_promedio`/`F_DesviacionVsPromedio` a la aritmética del gold master (promedio homogeneizado solo-ofertas vs UF/m² edificación) — requiere separar ofertas/CBR en el lector b1 y usar `valor edificación`, no `valor_comercial`.
2. Posible bug filtro anexos `tipo_adjunto` vs `clave_adjunto` (`ensamblador.ts:357-358`) — verificar con el contexto real en B2; si es real va a CODE_INCONSISTENCIES.
3. Los 44 campos planos del body viejo de E2 confirman que la cadena vieja era pre-InformeContexto — el reemplazo por `contexto` anidado es reconstrucción esperada, no regresión.
4. Quirks del gold master (§ 4) — se documentan como diferencias aceptadas, no se replican.
