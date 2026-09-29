# Run real — T-E2-REAPUNTE-20260929 (29-sep-2026)

> Secretos: `<MAKE_TOKEN>` · `<CARBONE_PROD>` · `<HMAC>` — nunca en claro.

## Endpoints usados

| Método | Endpoint | Uso | Status |
|---|---|---|---|
| GET | `https://eu1.make.com/api/v2/scenarios/5750023` | G1: nombre/estado E2 | 200 |
| GET | `…/scenarios/5750023/blueprint` | snapshot pre y verificación post | 200 |
| PATCH | `…/scenarios/5750023` | re-apunte templateId + bump v2.2 (body: blueprint completo con `flow[1].mapper.url` → `…/render/31f3bfab…8e32`) | **200** (nota: con python-urllib dio 403 Cloudflare error 1010 — firma de user-agent; con curl salió 200) |
| GET | `https://api.carbone.io/template/31f3bfab…8e32` | verificación template nuevo existe | 200 |
| POST | webhook E2 (`MAKE_WEBHOOK_E2`, HMAC `X-VP-Signature`) | **run real** payload `{solicitud_id, solicitud_codigo, contexto}` (contexto real del ensamblador) | 200 "Accepted" (17,0 s) |
| GET | `…/scenarios/{5750023,5791413}/logs?limit=2` | status del run | 200 |
| GET/PATCH | Airtable `tbl5sYnGPZXgYCBSY` / `tblaHTyMHYfmy7Fg6` | snapshots pre/post + saneo vigencia | 200 |
| POST/GET | `https://api.carbone.io/render/31f3bfab…8e32` | PDF v4 de evidencia (mismo request que el módulo de E2) | 200 |

## Resultado del run (16:18 UTC)

| Escenario | Ejecución | Status | Duración | Operaciones |
|---|---|---|---|---|
| E2 5750023 (v2.2, template NUEVO) | `1790698710640_6e54…` | **1 (éxito)** | 5.112 ms | 4 |
| E3 5791413 (v2.1, sin cambios) | `1790698714949_710f…` | **1 (éxito)** | 4.977 ms | 6 |

(El detalle módulo-a-módulo no es recuperable por `GET /logs/{executionId}` — el
endpoint rechaza el formato de id que entrega la lista (`SC400 pattern`); el status
agregado 1 + operaciones + efectos en Airtable son la evidencia del run.)

## Efectos verificados en Airtable

- `TX_DocumentosGenerados`: fila NUEVA `rec0t8n2oXJB29cMZ` creada 16:18:39,
  `es_vigente=True`, `plantilla_version=PLANTILLA_MET_v2`, `render_id_carbone` nuevo.
- `TX_Solicitudes.pdf_final_url` de VP-0067 actualizado por E3.
- Saneo de vigencia: la fila vigente anterior `rec2iw3c9ft5d1TXR` quedó
  `es_vigente=false` (PATCH 200) — mismo efecto colateral conocido del pipeline que en
  la tanda previa (E3 no retira la vigencia anterior); documentado en `rollback.md` #3.

## PDF v4 y validación

- `PDF_generado_VP0067_v4.pdf` (3.396.967 bytes): render con el MISMO request que el
  módulo de E2 (template `31f3bfab…8e32` + contexto real + `lang es-cl`). El PDF del
  run vive en Dropbox (E3 lo descarga de Carbone, que borra el render tras esa primera
  descarga — no hay segunda descarga posible del render del run).
- **v4 vs v3 (plantilla nueva de la tanda previa): 0,00% de diff en las 8 páginas** →
  la portada que imprime E2 v2.2 es la NUEVA. `comparacion-portada.png` (izq v3, der v4).
- Batería QA (`verificar.py` sobre v4): **127/128 PASS** — único FAIL: pixel-diff p2
  42% vs referencia, pre-existente e idéntico en v2 y v3 (artefacto de la métrica).
  Datos, imágenes, Hoja 3, CI-057 y cadena: 100%. `tests-output.txt`.
