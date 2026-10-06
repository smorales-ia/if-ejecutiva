# PDF · Caso 2 · VP-2026-0074 — estado V6

- **PDF espejo ya renderizado y auditado** (réplica/fix 2026-10-05): `docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261005/pdf-caso2.pdf` — render REAL vía Carbone (plantilla v5) con los datos de la solicitud.
- **¿Descargable desde la UI (V6)?** TODAVÍA NO: `pdf_final_url` vacío porque **E3 (scenario 5791413) está inactivo** desde el 409 del share-link (30-sep). El fix de idempotencia está empaquetado: `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh` (lo corre Sergio; el clasificador veta a Claude tocar E1/E2/E3).
- **Disparo listo (post-fix):** `pnpm vitest run docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-TEST-20261005/disparar-e2-5casos.test.mts` — por caso: E2(v5)→Carbone→E3→Dropbox share-link→`pdf_final_url`+`estado=pdf_listo`+fila TX_DocumentosGenerados. Idempotente (omite casos que ya tengan pdf_final_url).
- Maquetado 10–11 págs vs 8 del oráculo: gap G-10 de plantilla, EXPRESAMENTE fuera de esta tanda.
