# PDF · Check por caso — T-5CASOS-PDF-GOLIVE-20261005

Disparo: `disparar-e2-5casos.test.mts` (smoke caso 1 primero; luego corrida completa — 5/5 passed, 94 s).
Verificación por caso (GET Airtable + descarga real del share-link con `dl=1`): `estado-final-5casos.json`.

| Caso | VP | Estado | Fila expediente (TX_DocumentosGenerados) | Link PDF (Dropbox) | Descarga real |
|---|---|---|---|---|---|
| 1 · MetLife | VP-2026-0073 | `pdf_listo` | 1 ✓ | https://www.dropbox.com/scl/fi/hqt6lzljj38j9rdmftub7/ALEJANDRO-MOISES-AVILA-LEIVA_METLIFE-6280.pdf?rlkey=rkurhr26p9k5rmenntf0cfxnf&dl=0 | 884 KB · `%PDF-` ✓ |
| 2 · Agencia Habitacional | VP-2026-0074 | `pdf_listo` | 1 ✓ | https://www.dropbox.com/scl/fi/trjturbixidg7okhs44oo/ANDRES-PABLO-ISRAEL-AVRAM_AGH-1548.pdf?rlkey=3bnt6izkvyzjmm9dz89ga7sew&dl=0 | 467 KB · `%PDF-` ✓ |
| 3 · Austral Leasing | VP-2026-0075 | `pdf_listo` | 1 ✓ | https://www.dropbox.com/scl/fi/189lkb8gop3vtatytah8b/Miguenson-Rameau_ALH-335.pdf?rlkey=vk2l0we6lsu6r1jcz5z51rjf4&dl=0 | 708 KB · `%PDF-` ✓ |
| 4 · Hip. Security | VP-2026-0076 | `pdf_listo` | 1 ✓ | https://www.dropbox.com/scl/fi/o8wf99e35mni57fra261y/PATRICIO-ADRIAN-TORO-NIEVAS_HIPOTECARIA-SECURITY-6073.pdf?rlkey=thxhrblw2b6b67i5jg5b3etz8&dl=0 | 732 KB · `%PDF-` ✓ |
| 5 · Hip. Evoluciona | VP-2026-0077 | `pdf_listo` | 1 ✓ | https://www.dropbox.com/scl/fi/l7gowll2ol8xcezo28cfl/Carlos-Andr-s-Cortes-P-rez_HEV-3183.pdf?rlkey=99r5co61b4m8lr49onbnev13k&dl=0 | 774 KB · `%PDF-` ✓ |

**Vista 6:** el botón "Descargar PDF" de `/tasaciones/[id]/informe` abre `pdf_final_url` cuando está poblado (contrato verificado en la tanda PROD-TEST, `informe-preview.tsx:400-406`) — poblado hoy en los 5. Espejo de datos: validado por los auditores de PROD-TEST (100% terminales por caso); el contenido de estos PDFs sale del mismo contexto (ensamblador → Carbone v5). Maquetado 10–11 págs vs 8: gap G-10 de plantilla, fuera de alcance, ya previsto.

**Datos tocados:** por caso, solo lo que escribe E3 (fila nueva de expediente + `pdf_final_url` + `estado: calculada→pdf_listo`). Nada más. Rollback por caso en `rollback.md`.
