# ROLLBACK — T-VP0067-PDFPUBLICO-B-20260929

Estado original (29-sep-2026, antes de todo cambio):
- E3 = scenario 5791413, name `E3_Carbone_Download_Dropbox v2.1 - Dropbox+Airtable (sin share-link: scope pendiente)`, ACTIVO, flow 1→2→5→7→8→4. Blueprint pre (redactado): `blueprint-e3-v21-pre-redacted.json` (íntegro también en la evidencia de la tanda anterior).
- Conexiones Dropbox: módulo 5 (upload) usa 7553318 (se conserva); la NUEVA para share-link es **11421587 "Dropbox VProperty share"** (scopes verificados: account_info.read, sharing.write, sharing.read, files.metadata.read).
- PDF vigente: TX_DocumentosGenerados recYasPnZWAAoA3pW (doc_id 9, es_vigente=true, único).
- `pdf_final_url` (recmMzeu3eWGxyXsf) y `url_pdf` (doc_id 9): URL `https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO%20JOS%C3%89%20VERGARA%20UNDURRAGA_METLIFE%20-6283.pdf` (302→login).
- Datos espejo: 100% — esta tanda NO toca datos.

| # | Pieza | Cambio | Revert |
|---|---|---|---|
| 1 | E3 v2.2 (PATCH blueprint) | +módulo 9 `dropbox:createShareLink` v5 (conexión 11421587, path del PDF, settings {}) entre 5 y 7 · mód 7 `pdf_final_url`→`{{9.url}}` · mód 8 `url_pdf`→`{{9.url}}` (`url_dropbox` intacto) · name bump v2.2 | PATCH inverso: quitar módulo 9, restaurar la URL literal `/home?preview=` en mód 7 y 8, name v2.1 (diff exacto documentado aquí; blueprint pre redactado como referencia) |
| 2 | Corrida E2→E3 | fila DocGen nueva vigente + pdf_final_url/url_pdf con share-link | DELETE/desmarcar fila nueva · restaurar es_vigente=true en recYasPnZWAAoA3pW · restaurar URLs del snapshot de arriba |

## Registro de ejecución
- **#1 E3 v2.2 — APLICADO** (orquestador, PATCH 200, verificado con GET fresco):
  name v2.2 · flow 1→2→5→9→7→8→4 · mod9 dropbox:createShareLink conn 11421587 ·
  0 ocurrencias de la URL /home?preview= · {{9.url}} en mód 7 y 8 · islinked=true.
- **#2 Corrida E2→E3 — EJECUTADA** (agente corrida, 30-sep-2026 00:59 UTC,
  snapshot pre en `snap-predisparo.json`, resultados en `tests.md`):
  - Runs: E2 5750023 imtId `1790729981165_1d4c…` status 1 (4 ops) · E3 5791413
    imtId `1790729985438_7963…` status 1 (7 ops — incluye el share-link nuevo).
  - Fila DocGen NUEVA: **rec2jNFZBEVTqSFHJ** (doc_id 10, creada 00:59:51Z,
    `es_vigente=true`, `url_pdf` = share-link). Revert: DELETE de esa fila.
  - PATCH vigencia: `es_vigente=false` en recYasPnZWAAoA3pW (doc_id 9 — el
    vigente único pre-tanda). Revert: `es_vigente=true` en recYasPnZWAAoA3pW.
  - URLs — antes (ambas): `https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO%20JOS%C3%89%20VERGARA%20UNDURRAGA_METLIFE%20-6283.pdf`
    → después (`pdf_final_url` de recmMzeu3eWGxyXsf y `url_pdf` de doc_id 10):
    `https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=mgl40k4f98jz24knnzdr43osj&dl=0`.
    Revert de `pdf_final_url`: restaurar la URL `/home?preview=` del snapshot
    (las `url_pdf` de las filas viejas doc_id 4–9 no se tocaron).
  - Validación pública: dl=0 termina 200 sin `/login` · dl=1 baja `%PDF-1.6`
    de 3.396.967 bytes. La limitación D7 (link pedía login) queda cerrada.
