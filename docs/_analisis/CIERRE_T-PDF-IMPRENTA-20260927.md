# CIERRE — TANDA T-PDF-IMPRENTA-20260927 · cadena completa hasta el PDF

> 27-sep-2026 · rama `feat/T-PDF-IMPRENTA-20260927` · plan: `docs/_planes/PLAN_T-PDF-IMPRENTA-20260927.md` (Gate interno G1–G4: PASÓ).
> Método: MCP Airtable 403 → REST RO-30 · Make y Carbone por API con tokens de `.env.local` (jamás impresos).

## § 1 · ¿Se logró el PDF idéntico?

**Sí-con-diferencias.** La cadena completa **corrió de verdad** y produjo un PDF real de VP-2026-0067
(`PDF_generado_VP0067.pdf`): **41/41 valores del oráculo digitalizado presentes con formato chileno exacto**
(los 13 terminales al céntimo, identificación, cuadro, 7 comparables, rentabilidad, textos IA, boilerplates
literales) y **15/15 secciones en el mismo orden** que el gold master, con la paleta y los literales del
original. Diferencias declaradas: (a) **datos**: la desviación imprime 161% donde el original dice −3%
(CI-057, aritmética del motor — la fórmula exacta del XLSM quedó extraída para la tanda que lo corrija);
US$ vacíos (P1-3); UF/m² de comparables sin homologar (campo `_f` fuera del contrato); (b) **diseño**:
9 páginas vs 8 (galería como lista), tipografías aproximadas, matriz de habitaciones como lista; y las
piezas **sin fuente digital hoy** quedaron como placeholders declarados (fotos de la propiedad — 0067 no
tiene —, mapa con pines, documentos escaneados de los anexos, firma manuscrita, cualitativa Hoja 3).

## § 2 · Qué quedó operativo

1. **Plantilla NUEVA**: `docs/_artefactos/carbone/PLANTILLA_MET_v1.docx` (+ generador reproducible
   `generar_plantilla_met_v1.py`, verificación 52/52 tags + validador de anchos), subida a **Carbone PROD**
   (templateId nuevo en `.env.local`; el v1.0 intermedio se borró de Carbone). Logo real extraído del gold master.
2. **E2_Carbone_Render v2.0** (5750023): render con el `InformeContexto` completo (descubrimiento clave:
   Make serializa colecciones como JSON al interpolarlas → body directo sin módulos intermedios) + template nuevo.
3. **E3_Carbone_Download_Dropbox v2.1** (5791413): descarga binaria → Dropbox (`/VProperty/Tasaciones`,
   overwrite) → **PATCH `pdf_final_url` + `estado=pdf_listo`** → **fila en TX_DocumentosGenerados** → log
   (formatDate roto reparado). Share-link público pendiente de scope (ver § 4.1).
4. **SC-Textos v0.2 en Make** (7650070, hook 3797464): creado e inyectado por API, corrió 1 vez sobre 0067
   (síntesis 543c + sector 424c, coherentes, sin fugas), registrado en Z_EscenariosMake/Z_Webhooks. **APAGADO**.
5. **Código repo**: `POST /api/tasaciones/[id]/generar-pdf` (nuevo, 6 tests) · stub `marcarPdfListo` cableado
   al route (Regla D en el botón "Enviar informe") · puente `textosIA` del ensamblador arreglado
   (`ensamblador.ts:478`) · blueprints E2/E3 v2 exportados al repo redactados.
6. **Datos 0067**: visador Héctor Martínez C., ejecutivo, n° operación 900159638, condominio, 11 habitaciones.

Estado final Make: E2, E3 y SC-Textos **INACTIVOS** (los enciende Sergio cuando quiera el flujo vivo).

## § 3 · Corrida real y tests

- Corrida E2E: webhook E2 → Carbone → E3 → Dropbox → Airtable, verificada 2 veces (v1.0 y v1.1 de la
  plantilla). `estado=pdf_listo`, `pdf_final_url` poblado, fila vigente `recWP8Ex4XuPoNIfG`.
- QA: **E 41/41** datos · **F1 15/15** orden · D1-D2 PDF válido (102 KB, 9 págs) · B textos ✓ · C1/C2
  dry-run 52/52 y 0 huérfanos · A oráculo 0066 intacto (13 filas, cero writes) · G4 higiene 0 secretos ·
  `pnpm typecheck` 0 · suite **1005/1005** · **`pnpm build` limpio**.
- **Auditor ciego: 7 OK / 0 FAIL** (`auditor.md`) — verificó PDF, Airtable, Make, oráculo, repo e higiene
  desde el estado final.
- Iteración documentada: el primer render recortaba columnas (tablas más anchas que la página) → v1.1 con
  layout fijo y anchos reescalados; y `dropbox:createShareLink` → `[401] missing_scope` → fallback URL
  dropbox.com/home + path interno (ver § 4.1).

## § 4 · Pendientes / Gates de Sergio

1. **Dropbox share-link público**: re-autorizar la conexión Dropbox en Make (agrega scope `sharing.write`);
   luego re-insertar el módulo `dropbox:createShareLink` (nombre válido ya verificado) para que
   `pdf_final_url` sea un link compartible. Hoy es la URL de dropbox.com/home (clickeable logueado).
2. **Gate visual** (QA-F5): comparar `PDF_generado_VP0067.pdf` vs el PDF de referencia (o los PNG
   `visual-ref/gen-p1/p2/p4.png` de la evidencia) y dar el OK de diseño.
3. **Activación del flujo**: encender E2+E3 (y decidir el disparo de SC-Textos) cuando el botón de la UI
   deba funcionar en vivo. 3 capturas de pantalla (preview, estado, botón "Descargar PDF" en `pdf_listo`).
4. **Commit + push** de `feat/T-PDF-IMPRENTA-20260927` (GitHub Desktop).
5. Tanda futura sugerida: fix de `F_UFm2_promedio`/`F_DesviacionVsPromedio` con la aritmética exacta del
   XLSM (§3 de `oraculo-met6283.md`); campos `*Usd`; fotos/mapa/merge de anexos (P1-3/P1-4/T4).

## § 5 · Rollback

Ninguno aplicado. `rollback.md` completo: blueprints originales redactados, template, registros creados,
valores previos de 0067 y de los textos, con comandos de reversión.

## § 6 · Archivos

- `docs/_artefactos/carbone/`: PLANTILLA_MET_v1.docx · generar_plantilla_met_v1.py (+assets regenerables)
- `docs/_artefactos/make/`: E2_Carbone_Render.blueprint.json · E3_Carbone_Download_Dropbox.blueprint.json (v2, redactados)
- `docs/_evidencia/T-PDF-IMPRENTA-20260927/`: PDF_generado_VP0067.pdf · regresion.md · diseno-checklist.md ·
  auditor.md · rollback.md · endpoints-make.md · tests-output.txt · plano-plantilla.md · oraculo-met6283.md ·
  payload-carbone-0067.json · tags-docx.txt · visual-*.png · snapshots
- Código: `app/api/tasaciones/[id]/generar-pdf/{route.ts,route.test.ts}` · `lib/tasador/tasaciones.ts` ·
  `components/tasador/informe-preview.tsx` · `lib/informe/ensamblador.ts`
- `docs/_planes/PLAN_T-PDF-IMPRENTA-20260927.md` · este cierre · entrada en `docs/aprendizajes.md`
