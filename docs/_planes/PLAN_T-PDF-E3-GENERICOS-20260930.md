# PLAN — T-PDF-E3-GENERICOS-20260930

> Fase 1 consolidada el 30-sep-2026 a partir de 5 agentes en paralelo (A1 Make, B1 arquitectura,
> B2 UI, B3 producto, T1 seguridad). Solo lectura hasta el Gate. Ejecución en rama
> `feat/T-PDF-E3-GENERICOS-20260930`.

## §1 Resumen

Dos frentes aislados en paralelo:

- **FRENTE A (Make/producción)**: E3 (`E3_Carbone_Download_Dropbox v2.2`, scenario **5791413**,
  team 1594725) quedó **INACTIVO** (`isActive=false`, `isinvalid=true`) el 30-sep 01:12Z porque su
  módulo 9 (`dropbox:createShareLink`, conexión 11421587 "Dropbox VProperty share") no tiene error
  handler y un re-disparo del mismo informe devolvió **409 "Share link already exists…"**. Queda
  **1 ítem en la cola del webhook** 3063524 (incoming `cf430c8d435875f253728e0c981e3a72`, payload
  VP-2026-0067 — duplicado de un run que a las 00:59Z ya terminó OK con link creado). Fix: rama
  `onerror` en el módulo 9 que recupere el link existente (`list_shared_links` + `Resume`),
  reactivar, y validar idempotencia con emisión real doble.
- **FRENTE B (código/repo)**: las 20 ranuras fijas `{d.imagenes.*}` del PDF salen 100% del hardcode
  `ASSETS_POR_CODIGO['VP-2026-0067'] → docs/_artefactos/carbone/assets_met6283` en
  `lib/informe/imagenes.ts:49-75`; ninguna se ve en la UI ni es aportable por un usuario.
  Fix: resolutor genérico ranura→fuente viva (fotos por categoría / adjuntos documentales por
  código / firma por perfil), sección de anexos+firma en el preview, y seed de VP-0067 para que
  siga idéntico.

## §2 Alcance

**SÍ (Frente A):** limpiar/consumir la cola del webhook de E3 · PATCH del blueprint de E3
(solo agregar `onerror` al módulo 9) · reactivar E3 · emisión real VP-0067 dos veces (idempotencia).
**SÍ (Frente B):** resolutor genérico de las 20 ranuras en `lib/informe/*` · thumbnail para uploads
de documentos tipo imagen · sección Anexos+Firma en `informe-preview` · campo `firma_url` en
`M_Tasadores` · códigos nuevos en `D_TipoDocumento` (4) · categoría de foto fija `mapa_referencias` ·
seed VP-0067 (TX_Adjuntos thumbnails + firma del tasador).
**NO:** tocar E1/E2 · tocar conexiones/IDs de Make · migrar los tokens hardcodeados del blueprint
(hallazgo A1, queda como deuda anotada) · thumbnail-de-PDF (deuda P2: escaneado subido como PDF
queda con ranura vacía honesta) · logo por-cliente (P0 de producto pero fuera de esta tanda: vive
horneado en el DOCX de la plantilla, tocarlo es tanda de plantilla) · staticMapUrl/Google (P1-4) ·
UI de perfil del tasador (la firma se aporta vía Airtable/perfil, sin código) · commit/push (Sergio).

## §3 FRENTE A — Diagnóstico y fix de E3

- **Escenarios reales**: E2 = 5750023 `E2_Carbone_Render v2.2 - InformeContexto` **ACTIVO** ·
  E3 = 5791413 `E3_Carbone_Download_Dropbox v2.2 - share-link publico` **INACTIVO**, hook 3063524.
- **Error verbatim** (ejecución `5bd3ef23924d4297a7ff18a70b5d9a66`, 30-sep 01:12:22Z, `causeModule:
  createShareLink`, módulo 9):
  `RuntimeError — [409] Share link already exists and cannot be updated or returned by this module.
  To update or revoke an existing link, use the 'Update/Revoke a Share Link' module. Link URL:
  https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?rlkey=…`
- **Cola**: DLQ vacío (`dlqCount=0`); el pendiente está en la cola del webhook: hook 3063524,
  `queueCount: 1`, incoming `cf430c8d…` (payload VP-2026-0067). Se consume solo al hacer `start`.
- **Flujo E3**: 1 webhook → 2 GET Carbone render → 5 `dropbox:uploadLargeFile` (overwrite:true,
  conn 7553318) → **9 `dropbox:createShareLink`** (conn 11421587, `onerror: null`) → 7 PATCH
  `TX_Solicitudes` (`pdf_final_url`, `estado=pdf_listo`) → 8 POST `TX_DocumentosGenerados` → 4 POST
  `LogEscenarios`.
- **Endpoints confirmados** (base = MAKE_BASE_URL, que YA incluye `/api/v2`):
  `GET /scenarios/{id}/blueprint` · **update: `PATCH /scenarios/{id}` body `{"blueprint":"<JSON string>"}`** ·
  `POST /scenarios/{id}/start|/stop` · `POST /scenarios/{id}/run` · `GET /scenarios/{id}/logs[/{execId}]` ·
  `GET /hooks/{hookId}/incomings[/{id}]` · DLQ: `GET /dlqs?scenarioId=` etc. (no aplican: vacío).
- **Fix de idempotencia** (módulo 9, agregar `onerror`):
  1. `dropbox:makeAPICall` (conn 11421587) → `POST /2/sharing/list_shared_links` con
     `{"path": "/VProperty/Tasaciones/{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf", "direct_only": true}`
  2. `builtin:Resume` con `url = {{20.body.links[1].url}}` → `{{9.url}}` resuelve al link existente
     y los módulos 7/8/4 siguen normal. Camino feliz intacto.
  Caveat: confirmar el `module` name exacto del "Make an API Call" de Dropbox contra la app
  (verificar tras el PATCH con un GET del blueprint + run real; si Make rechaza el PATCH por módulo
  desconocido, probar `dropbox:ActionMakeAPICall`). No tocar conexiones ni IDs 1/2/5/7/8/4.
- **Dropbox NO requiere Reauthorize** (T1+A1): la conexión 11421587 tiene `sharing.write` y ya creó
  el link en el run exitoso de las 00:59Z. El token Dropbox del `.env.local` no interviene en E3.

## §4 FRENTE B — Contrato ranura → origen (decidido, sin ambigüedad)

Fuente renderizable: la que ya usa el patrón de fotos — **`TX_Adjuntos.thumbnail_url`** (data-URI
JPEG ≤95 KB o URL https) + `orden`; firma vía perfil. Fallback repo `ASSETS_POR_CODIGO` **se
elimina del camino vivo**: el seed cubre VP-0067 y el código queda sin referencia a MET-6283.

| Ranura plantilla (`{d.imagenes.*}`) | Origen decidido | Fuente concreta |
|---|---|---|
| `mapaUbicacion` (H1) | (a) por-solicitud | 1ª foto categoría `mapa_ubicacion` (existe; VP-0067 ya tiene 1) |
| `fachada` (H1) | (a) por-solicitud | 1ª foto categoría `fachada_exterior` (existe) |
| `firma` | (b) por-tasador | **nuevo** `M_Tasadores.firma_url` (multilineText: data-URI o URL; espejo del precedente `M_Visadores.firma_url`) |
| `refMapa` (H2) | (a) por-solicitud | 1ª foto categoría **nueva fija** `mapa_referencias` |
| `ref1..ref3` (H2) | (a) por-solicitud | 3 primeras fotos categoría `ofertas_comparables` (existe, hoy vacía) por `orden` |
| `anexo1Plano` | (a) riel documental | adjunto `foto_plano_cuadro_superficies` (existe) |
| `anexo1Esquema` | (a) riel documental | **nuevo** `esquema_superficies` |
| `anexo1CuadroSup` | (a) riel documental | **nuevo** `cuadro_superficies` |
| `anexo1Emplazamiento` | (a) riel documental | **nuevo** `planta_emplazamiento` |
| `anexo1Aerea` | (a) riel documental | **nuevo** `foto_aerea` |
| `anexo1MapaSii` | (a) riel documental | **nuevo** `mapa_sii` |
| `anexo1InfoSii` | (a) riel documental | adjunto `foto_fuente_sii` (existe) |
| `anexo2RolAvaluo` | (a) riel documental | `certificado_avaluo_fiscal` (existe) |
| `anexo2Permiso` | (a) riel documental | `permiso_edificacion` (existe) |
| `anexo2Escritura` | (a) riel documental | `escritura_compraventa` (existe) |
| `anexo2NoExpropiacion` | (a) riel documental | `informe_no_expropiacion_serviu` (existe) |
| `anexo2Recepcion` | (a) riel documental | `certificado_recepcion_final` (existe) |
| `anexo2Tgr` | (a) riel documental | `certificado_deuda_tgr` (existe) |

UI: mapas/refs/fachada ya se ven por el riel fotográfico (sección 7 del preview); se agrega al
preview una sección **"Anexos del informe"** (miniaturas por ranura con nombre humano, sin jerga)
y la **firma** en el bloque del tasador. Ranura sin fuente → vacío honesto ("Sin documento aún").
Documentos subidos como imagen generan `thumbnail_url` al subir (extensión del pipeline actual);
subidos como PDF quedan sin miniatura (deuda P2, anotar en cierre).

Restricción de peso: el payload a E2 tiene tope 5 MB (precedente 6,19→3,62 MB); todo seed/thumbnail
se recomprime a data-URI ≤95 KB (además límite ~100k chars del campo Airtable).

## §5 Ejecución — olas y dependencias

- **BLOQUE 0 (secuencial)**: snapshot a `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/rollback.md`
  (blueprint E3 original ya exportado; estado cola/activo; código = git working tree limpio) +
  rama feat. ✔ antes de tocar nada.
- **TRACK A (1 agente, serie interna)**: A.1 verificación cola → A.2 PATCH blueprint (solo
  `onerror` módulo 9) → A.3 `start` (consume el incoming pendiente = 1ª prueba de idempotencia) →
  A.4 emisión real VP-0067 ×2 vía cadena E2→E3 y verificación logs + Airtable.
- **TRACK B (paralelo al A)**: B-código (1 agente: `lib/informe/imagenes.ts`, `ensamblador.ts`,
  `lectura-informe.ts`, `informe-preview.tsx`, pipeline thumbnail de documentos; `pnpm build` +
  `pnpm test`) ∥ B-datos (1 agente: campo `firma_url`, 5 códigos `D_TipoDocumento`, categoría
  `mapa_referencias` si es dato, seed VP-0067 — un solo patch por record; verificar triggers
  AT-RF09 antes de patchear TX_Adjuntos). El contrato §4 fija la interfaz: pueden correr en
  paralelo (superficies distintas: repo vs Airtable).
- **BLOQUE 2**: tests por frente (§6). **BLOQUE 3**: auditor ciego. **BLOQUE 4**: rollback por FAIL.

## §6 Batería de tests

**Frente A**: E3 `isActive=true` + cola webhook 0 · run del incoming pendiente en verde (409
absorbido por la rama onerror) · emisión nueva → PDF en Dropbox + `pdf_final_url` en Airtable ·
segunda emisión seguida → verde reutilizando el link (misma URL) · evidencia en `e3-smoke.md`.
**Frente B**: `pnpm build` limpio + `pnpm test` verde · VP-0067: cada ranura poblada se ve en UI y
el payload Carbone la incluye (correlación 1:1, `correlacion.md`) · grep sin referencias vivas a
`met6283`/`VP-2026-0067` en `lib/informe/` (genérico) · regresión: fotos/datos/REF. C.B.R./CI-057/
`/lectura`/botones Descargar PDF y Ver expediente intactos (`regresion.md`).

## §7 Riesgos y pasos manuales

- Reactivar E3 procesa la cola con el blueprint nuevo (deseado aquí: es la prueba de idempotencia),
  pero puede duplicar fila en `TX_DocumentosGenerados` (precedente 27/28-sep) → snapshot de
  DocGen de VP-0067 antes del `start` y verificación después.
- PATCH con `curl` (python-urllib da 403 Cloudflare). Tokens jamás en salida.
- Módulo `dropbox:makeAPICall`: nombre a validar en el primer run; rollback si Make lo rechaza.
- Triggers AT-RF09 sobre TX_Adjuntos: verificar campos-gatillo antes del seed para no disparar
  extracciones espurias.
- Paso manual Sergio: **solo commit/push/merge** de la rama feat (y nada más; Dropbox Reauthorize
  NO es necesario).

## §8 Rollback por paso

- Blueprint E3 → re-PATCH con `e3-blueprint-snapshot-original.json` (guardado en evidencia).
- Activación → `POST /scenarios/5791413/stop` (estado original: inactivo).
- Código → `git restore` (working tree partió limpio; sin commits).
- Datos Airtable → snapshot previo por record en `rollback.md`; revertir campo a campo.
- Campo `firma_url` / códigos `D_TipoDocumento` nuevos → se pueden dejar (aditivos, no rompen) o
  eliminar; se documenta cada ID creado en `rollback.md`.

## §9 GATES

- **G1 credenciales**: ✅ todas presentes en `.env.local` (MAKE_API_TOKEN, AIRTABLE_TOKEN, CARBONE_*,
  CLERK, DROPBOX_* — este último no se usa en E3).
- **G2 Frente A**: ✅ causa raíz confirmada con el run real (409 módulo 9 sin onerror) + endpoints de
  cola/blueprint/activación verificados en vivo.
- **G3 Frente B**: ✅ origen decidido por elemento (tabla §4) + los 20 bindings `{d.imagenes.*}`
  identificados en la plantilla v2.
- **G4 Dropbox**: ✅ NO requiere Reauthorize (conexión Make 11421587 con `sharing.write`, probada en
  el run exitoso de las 00:59Z del 30-sep).

**GATE: PASADO** — se continúa a Fase 2 (autorización de Sergio ya otorgada en el brief de la tanda).
