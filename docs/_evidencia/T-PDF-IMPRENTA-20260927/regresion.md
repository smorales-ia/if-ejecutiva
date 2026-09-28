# REGRESIÓN — PDF generado VP-2026-0067 vs gold master MET-6283

> 27-sep-2026 · PDF real generado por la cadena Make E2 v2.0 → Carbone (PLANTILLA_MET_v1.1, template nuevo) → E3 v2.1 → Dropbox → Airtable.
> Evidencia binaria: `PDF_generado_VP0067.pdf` (102.749 bytes, `%PDF-`, 9 páginas; render idéntico re-descargado directo de Carbone con el mismo template+payload de la cadena).
> Oráculo: `oraculo-met6283.md` (PDF+XLSM, por celda). Payload real: `payload-carbone-0067.json`.

## QA-E · Datos — 41/41 ✅

| Grupo | Valores verificados presentes con formato chileno |
|---|---|
| 13 terminales | 20.125,86 UF · $802.913.431 · 9.246,94 · 8.907,06 · 8.517,68 · 13.081,81 · 16.603,84 · $36.300.000 · $806.666.667 (+CLPs) |
| Identificación | FRANCISCO JOSE VERGARA UNDURRAGA · 16.610.203-0 · LOS EUCALIPTUS 2100 · Colina · METLIFE-6283-REAL · 900159638 · rol 00882-00040 · año 2020 · condominio LAS BRISAS DE CHICUREO |
| Personas | Tasador Nelcy Jaimes · Visador Héctor Martínez C. · Ejecutivo MONICA REYES PINTO |
| Superficies/UF | 5.024,86 · 249,91 · UF día 39.894,61 · fecha 13-04-2026 |
| Cuadro | Terreno 11.218,80 · Piso 1 8.157,06 · Piscina 350,00 · totales |
| Comparables | 7 filas (20.000 · 24.900 · 19.500 · 23.900 · 18.900 · 20.500 · 18.000) |
| Rentabilidad | arriendo/gasto 3.300.000 · tasa 4,5% · 65% · 82,5% · velocidad 8 A 10 MESES |
| Textos | síntesis IA (543c) · sector IA (424c) · boilerplate E-85 · declaración legal — todos impresos |
| Motor | promedio 30,91 · desviación 161% (formatN(0) de 160,52) |

## Diferencias de DATOS vs gold master (esperadas y declaradas)

| Dato | Gold master | Generado | Causa |
|---|---|---|---|
| TASACIÓN vs PROMEDIO | −3% / 36% | 161% | H-T4b/CI-057: aritmética del motor ≠ XLSM (fórmula exacta ya extraída en `oraculo-met6283.md` §3 — fix de fórmula es tanda posterior) |
| Promedio muestra | 33,64 (ofertas) / 24,08 (CBR) | 30,91 global | ídem (b1 homogeneiza las 7 juntas) |
| Tasador / N° solicitud / año construcción | M.E. Soto / METLIFE-6283 / 2024 | Nelcy Jaimes / METLIFE-6283-REAL / 2020 | datos sandbox 0067 (divergencias documentadas en golden) |
| UF/m² por comparable | homologados (34,05…) | directos (83,68…) | el campo homologado `_f` no viaja en el contrato (GAP-contrato declarado en el plano C9) |
| 1US$ y columna US$ | 890,33 + 5 valores | vacíos | P1-3 (sin fila H_PreciosUF de esa fecha) + campos `*Usd` inexistentes |
| Sector truncado / años 2.015 / TOTAL TERRENO sin miles | quirks del XLSM | corregidos | decisión: no replicar quirks |

## QA-D · Entrega — ✅

- `TX_Solicitudes.recmMzeu3eWGxyXsf`: `estado=pdf_listo` · `pdf_final_url` = URL dropbox.com/home con preview (clickeable para el dueño de la cuenta; share-link público pendiente de scope — ver rollback).
- `TX_DocumentosGenerados`: fila vigente `recWP8Ex4XuPoNIfG` (url_pdf, url_dropbox=/VProperty/Tasaciones/FRANCISCO JOSE VERGARA UNDURRAGA_METLIFE-6283-REAL.pdf, render_id, es_vigente). Filas de corridas intermedias borradas (rollback lo registra).
- Dropbox: subida confirmada por el módulo 5 de E3 en las 3 corridas (log Make); `overwrite=true`.
- 9 páginas (ref: 8) — causa: galería de fotos como lista + bloques secuenciales (APROXIMADO declarado).

## QA-A/QA-B/QA-G

- Motor: 15 filas TX_Calculos de 0067 intactas (ninguna corrida las tocó); VP-2026-0066 **cero writes** en toda la tanda.
- Textos: >80c ✓ · mencionan Colina/casa ✓ · 0 fugas técnicas ✓ · cifras (5.024,86 · 249,91) respaldadas por payload ✓.
- Suite repo: typecheck 0 errores · 1005/1005 tests (57 archivos + 6 nuevos del route generar-pdf; el "fail" intermedio era el artefacto one-shot de evidencia, renombrado fuera del glob).
- Higiene secretos: grep final 0 matches (webhook URLs redactadas de los blueprints exportados).
