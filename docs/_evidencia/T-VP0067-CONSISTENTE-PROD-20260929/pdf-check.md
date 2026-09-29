# PDF-CHECK — T-VP0067-CONSISTENTE-PROD-20260929 · OLA 2

## Corrida real E2→E3 (29-sep-2026)

| Escenario | Ejecución (imtId) | Status | Duración | Ops | Timestamp UTC |
|---|---|---|---|---|---|
| E2 5750023 (Carbone Render) | 1790723584880_5bed5a6acee54a48b013ef045d84ee75 | **1 (éxito)** | 3.893 ms | 4 | 2026-09-29T23:13:04.880Z |
| E3 5791413 (Download+Dropbox) | 1790723588162_e9d323e6fa7f405ea8fea10fafa6c295 | **1 (éxito)** | 4.859 ms | 6 | 2026-09-29T23:13:08.162Z |

Disparo (Agente E, réplica exacta del método de T-E2-REAPUNTE `run-real.md`):

1. Contexto FRESCO post-OLA-1 ensamblado con el oneshot vitest de T-PDF-IMPRENTA
   (`construirInformeContexto('recmMzeu3eWGxyXsf', fields)` — solo LECTURA de
   Airtable; oneshot borrado tras la corrida). 4.713.564 bytes,
   `meta.codigo=VP-2026-0067`, `meta.estado=pdf_listo` (permitido para re-emisión).
2. POST al webhook `MAKE_WEBHOOK_E2`, payload
   `{solicitud_id, solicitud_codigo, contexto}` firmado HMAC-SHA256
   (`X-VP-Signature`) → **HTTP 200 "Accepted"** · 12,7 s · 23:12:52 UTC.

Snapshot pre-disparo en `snap-predisparo-docgen.json` (23:10:56 UTC).
Encadenamiento E2→E3 en ~3,3 s. Nota operativa: el agente E quedó varado en su
espera de logs (bug de globbing de curl con `pg[limit]`, se corrige con `-g`);
el orquestador completó verificación y vigencia (pasos 3–6) y el agente E,
reanudado, re-verificó de forma independiente: mismos imtId, misma fila nueva,
PATCH de vigencia idempotente y GET final con exactamente 1 vigente.

## Efectos en Airtable

- Fila NUEVA en TX_DocumentosGenerados: **recYasPnZWAAoA3pW** (doc_id 9,
  generada 2026-09-29T23:13:12Z, plantilla MET_v2/template 31f3bfab…8e32).
- `pdf_final_url` de TX_Solicitudes: renovado por E3 (mismo formato
  `https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO…-6283.pdf`).

Estado final DocGen (5 filas VP-2026-0067, GET post-saneo):

| Record | doc_id | plantilla | es_vigente final |
|---|---|---|---|
| recWP8Ex4XuPoNIfG | 4 | MET_v1 | — |
| rec2iw3c9ft5d1TXR | 6 | MET_v2 | — |
| rec0t8n2oXJB29cMZ | 7 | MET_v2 | — (apagado D5) |
| recIxc5nmLZClvUM0 | 8 | MET_v2 | — (apagado D5) |
| recYasPnZWAAoA3pW | 9 | MET_v2 | **true** |

## Vigencia (D5)

Antes: TRES filas con `es_vigente=true` (doc_id 7, 8 y la nueva 9).
PATCH batch (200): `es_vigente=false` en rec0t8n2oXJB29cMZ (doc_id 7) y
recIxc5nmLZClvUM0 (doc_id 8). Estado final verificado: **exactamente 1 vigente**
(recYasPnZWAAoA3pW, doc_id 9) — RN-56 coherente.

## Descarga del PDF

`curl -sI pdf_final_url` → **302 → https://www.dropbox.com/login?cont=…**

LIMITACIÓN CONOCIDA (no regresión de esta tanda): E3 v2.1 construye una URL de
navegación interna de Dropbox (no share-link) porque la conexión Dropbox 7553318
no tiene scope `sharing.write` (verificacion-sharelink-e3.md de T-CIERRE-FINAL).
El PDF real existe y se descargó/verificó por la cadena; el botón "Descargar PDF"
del tasador abre Dropbox pidiendo login hasta que Sergio ejecute el paso manual
(Reauthorize/conexión nueva + autorizar E3 v2.2 con módulo share-link).

Veredicto: **V6 OK con reserva D7** (PDF real, vigencia única, link poblado;
descarga pública pendiente del paso manual de Sergio).
