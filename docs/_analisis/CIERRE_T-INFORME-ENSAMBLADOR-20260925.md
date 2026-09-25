# CIERRE — T-INFORME-ENSAMBLADOR-20260925 (Tanda 1 del roadmap de paridad)

> **Tanda:** T-INFORME-ENSAMBLADOR-20260925 · ejecución en 3 agentes (núcleo · textos IA · plantilla)
> **Plan ejecutado:** `docs/_analisis/ROADMAP_paridad_informe_20260924.md` §3 (bloques 1-7)
> **Autorización respetada:** solo archivos dentro del repo · cero writes a Airtable/Make · sin commit/push (los hace Sergio) · sin dependencias npm nuevas · MCP Airtable solo lectura.

---

## 1 · Qué quedó construido

| Pieza | Archivos | Estado |
|---|---|---|
| Contrato del informe (`InformeContexto`, 16 grupos + `huecos[]`) | `lib/informe/tipos.ts` | ✅ |
| Matriz de tags §7.3 ("artefacto vivo", fuente ejecutable) | `lib/informe/matriz-tags.ts` (53 entradas = 228 E-ids exactos) + proyección legible `docs/_artefactos/plantillas/matriz-tags-informe.md` | ✅ |
| Ensamblador server-only (extiende `construirInforme`, suma TX_Calculos, H_PreciosUF, recintos; calcula fila TASACIÓN — puente F-2/P1-8) | `lib/informe/ensamblador.ts` | ✅ |
| Endpoint para SC09 (Tanda 5) | `app/api/tasaciones/[id]/informe-data/route.ts` (GET → `{ contexto, paridad }`, guard + `desdeGuard`) — aparece en el manifest de build | ✅ |
| Medidor de paridad (puro, criterio documentado) | `lib/informe/medidor.ts` | ✅ |
| Golden del caso real (33 valores con fuente citada) | `lib/informe/golden-met6283.ts` | ✅ |
| Harness (48 tests: integridad 228, golden ±0,01, score fijado, huecos por P-id, matriz↔tipos sin divergencia, guard) | `lib/informe/ensamblador.test.ts` | ✅ 48/48 |
| Validador anti-cifras RF-32 (es-CL, fixtures = párrafos reales del gold master) | `lib/informe/validador-cifras.ts` + `.test.ts` (18 tests) | ✅ 18/18 |
| Prompt v1 de textos IA + flujo previsto | `docs/_artefactos/plantillas/prompts-textos-informe.md` | ✅ (diseño) |
| Blueprint draft del escenario de textos | `docs/_artefactos/make/SC-Textos.blueprint.json` (`"v0.1 DRAFT - NO IMPORTAR"`, JSON válido, mapper `id`+`record` según contrato real) | ✅ (draft) |
| Plantilla provisional (binario OOXML real, 8 hojas, 25 tablas, marca de agua "NO OFICIAL") | `docs/_artefactos/plantillas/Informe_VProperty_provisional_v0.docx` + `generar_plantilla_provisional.py` (regenerable, parsea la matriz en vivo) + `NOTA_plantilla_provisional.md` | ✅ 40/40 tags |
| Infra mínima | `lib/tasador/field-ids.ts`: +2 claves en `TABLE_IDS` (`calculos`, `preciosUf`) | ✅ |

## 2 · Score de paridad contra VP-2026-0066 (asertado en test)

- **Score de datos: 34,1%** — 70 E-ids con estado OK **y valor presente** / 205 elementos-dato (228 − 23 PLANTILLA).
- **Score total-228: 40,8%** — contando los 23 PLANTILLA como cubiertos por la plantilla provisional.
- **Score de camino: 46,8%** (96 OK / 205) — éste es el comparable con el "43%" de la auditoría, que contaba *caminos*, no valores presentes. La diferencia son 26 E-ids con camino OK cuyas tablas están vacías en 0066 (sandbox tipeado sin comparables/adjuntos/habitaciones/legales cargados).
- Por estado: OK 96 · HUECO 79 · METLIFE_ONLY 30 · PLANTILLA 23 (= 228). Faltantes por P-id: P1-2 49 · P1-1 26 · sin-pId 17 (tablas vacías del caso) · P2-3 9 · P0-1 8 · P1-8 6 · P1-9 6 · P1-4 4 · P2 3 · P0-2 2 · P1-5 2 · P2-2 2 · P1-3 1.
- **Cómo sube:** T4 (columnas P1-1/P1-2) es el mayor salto (+75 E-ids potenciales); T2 (P1-3/P1-8) +7; T5 conecta PLANTILLA y textos (P0-1/P0-2) +10; el resto se reparte entre T7/T8/T9. Poblar el caso 0066 con comparables/fotos/recintos sube los 17 sin-pId sin tocar código.

## 3 · Verificación (evidencia)

- `pnpm typecheck` → limpio (exit 0).
- `pnpm test` → **54 archivos · 983 tests · todos verdes** (incluye los 66 nuevos; nada existente roto).
- `pnpm build` → limpio; la ruta `ƒ /api/tasaciones/[id]/informe-data` aparece en el manifest.
- Plantilla: zip válido (`testzip` limpio), 6 partes XML parseables, python-docx la abre; **40/40 tags** de la matriz presentes, 0 faltantes.
- Blueprint SC-Textos: `python3 -m json.tool` OK.
- Cero writes a Airtable/Make en toda la tanda (solo lecturas MCP para fixture y schema).

## 4 · Desvíos respecto del §3 (reportados, no improvisados)

1. **Drift del cuadro de valoración (hallazgo nuevo).** Las 6 filas reales de `TX_ItemsCuadroValoracion` de 0066 pueblan la pareja "vieja" (`nombre_item`/`uf_m2_unitario`/fórmula `valor_uf`) y dejan vacía la pareja que lee el modelo canónico (`descripcion`/`uf_m2_aplicado`/`uf_total_item`) — el `totalUf` canónico daría **0**. Como el mandato prohibía reescribir `lectura-informe.ts`, el ensamblador relee los ítems con caída vieja→nueva (documentado + test dedicado). Total resultante: **20.125,8624 UF = PDF**. Queda como candidato a fix de fondo (alinear escritor del motor o el canónico) en una tanda posterior.
2. **Baseline 34,1% < 43% esperado** — no es regresión sino cambio de vara (valor presente vs camino); criterio exacto en el JSDoc de `medidor.ts`, número fijado en test.
3. **E-124 reclasificado a PLANTILLA** (formato "2.015" = normalización es-CL del `.docx`, no un dato): 23 PLANTILLA en vez de 22.
4. El párrafo "Descripción del sector" del gold master está **truncado en el PDF original**; el fixture lo transcribe tal cual y el few-shot del prompt cierra en la frase completa anterior.

## 5 · Cómo se usa (guía breve)

- **Ver el JSON del informe de una solicitud:** `GET /api/tasaciones/{recordId}/informe-data` (sesión Clerk del tasador asignado; guard igual que `/informe`). Devuelve `contexto` (el `InformeContexto`) y `paridad` (score + faltantes).
- **Medir paridad en código/tests:** `medirParidad(contexto)` de `lib/informe/medidor.ts`; la matriz por defecto es `MATRIZ_TAGS`.
- **Regenerar la plantilla provisional** tras cambiar la matriz: `python3 docs/_artefactos/plantillas/generar_plantilla_provisional.py` (parsea `matriz-tags.ts` en vivo; sale ≠0 si algún tag queda sin lugar).
- **Validar un texto IA:** `validarTexto(texto, cifrasDePayload(contexto))` de `lib/informe/validador-cifras.ts`.
- **Regla de mantenimiento:** `lib/informe/matriz-tags.ts` es la fuente de verdad; el `.md` y el `.docx` se regeneran desde ella. Toda tanda que agregue columnas (T4) debe actualizar la entrada correspondiente de la matriz (estado HUECO→OK) — el test de integridad protege los 228.

## 6 · Cómo se conecta en la Tanda 5 (T-PDF-PIPELINE)

1. Sergio entrega plantilla `.docx` oficial (o ratifica la provisional): se insertan los MISMOS tags de la matriz en el binario oficial; el contrato no cambia.
2. Credenciales: cuenta Carbone + refresh token Dropbox válido + aprobación de escenarios SC09/SC10 en Make.
3. SC09 (orquestador delgado) consume `GET /informe-data`, llama a Claude con el prompt de `prompts-textos-informe.md` (previa creación de los campos destino `sintesis_propiedad_texto`/`descripcion_sector_texto` en TX_DatosTasacion — decisión Sergio), valida con el validador RF-32, envía el contexto a Carbone y deposita en Dropbox + `TX_DocumentosGenerados` (RN-56).
4. La Etapa B del harness (comparación de render: texto extraído + conteo de imágenes + hash reproducible) queda diseñada en el roadmap §3 y se implementa en T5 cuando haya PDF generado que comparar.

## 7 · Pendientes que esta tanda deja explícitos

- Decisión Sergio: crear los 2 campos de textos IA en `TX_DatosTasacion` (bloquea importar SC-Textos).
- Candidato a fix: drift pareja vieja/nueva del cuadro (desvío 1).
- El caso 0066 conviene poblarlo (comparables/fotos/recintos) para que el score refleje el camino completo.
- Próxima tanda sugerida del roadmap: **T2 (T-FIX-S)** o **T3 (T-SANEO-DOC)** — ambas ejecutables sin inputs; **T4** es el mayor salto de score y ya tiene su prerequisito (la matriz) construido.

---
*Estado: TANDA T-INFORME-ENSAMBLADOR-20260925 CERRADA · test verde 983/983 · build limpio · cero writes fuera del repo.*
