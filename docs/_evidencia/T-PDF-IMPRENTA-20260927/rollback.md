# ROLLBACK — T-PDF-IMPRENTA-20260927 · FASE 2

> Escrito ANTES de aplicar writes. Secretos: JAMÁS en este archivo (blueprints exportados con
> `Authorization`/`x-api-key` = ***REDACTED***; hallazgo del auditor: los blueprints originales
> de E2/E3 traían JWT Carbone y PAT Airtable en claro — quedaron redactados en la evidencia,
> los valores viven solo en Make y en .env.local).

## Make · E2_Carbone_Render (scenario 5750023) y E3_Carbone_Download_Dropbox (5791413)

- **ORIGINALES completos**: `blueprint-original-5750023-redacted.json` · `blueprint-original-5791413-redacted.json` (GET /scenarios/{id}/blueprint, 27-sep pre-cirugía).
- Estado original de ambos: **INACTIVO** (isActive:false desde mayo-2026), sin ejecuciones en el log.
- templateId viejo en E2 módulo 2 (URL): `5da250fc93c001a5ab7184ddd0cf592579601c83abe20d4ebf6cdd06859a96d0`.
- Webhooks originales: E2 → hook 3045780 · E3 → hook 3063524 (no se tocan).
- **Para deshacer**: `PATCH https://eu1.make.com/api/v2/scenarios/{id}` con `blueprint` = el JSON original (re-inyectando los headers redactados desde .env.local / Make UI) + `POST /scenarios/{id}/stop`.

## Make · SC-Textos (NUEVO en esta tanda)

- No existía en Make (verificado: inventario de 13 escenarios, 27-sep).
- Se crea vía `POST /hooks` + `POST /scenarios` desde `docs/_artefactos/make/SC-Textos.blueprint.json` v0.2.
- **Para deshacer**: `POST /scenarios/{id}/stop` (si activo) + `DELETE /scenarios/{id}` + `DELETE /hooks/{id}`. IDs reales: se anotan abajo al crearse.

## Carbone

- `CARBONE_TEMPLATE_ID` en `.env.local` — **ORIGINAL: vacío** (línea `CARBONE_TEMPLATE_ID=` sin valor).
- **Para deshacer**: dejar la línea vacía de nuevo + `DELETE https://api.carbone.io/template/{templateId_nuevo}` (token PROD, header carbone-version: 4).

## Airtable · VP-2026-0067 (`recmMzeu3eWGxyXsf`) — dump pre: `snap-0067-pre-imprenta.json`

| campo | ORIGINAL (27-sep pre-imprenta) |
|---|---|
| `estado` | `calculada` |
| `pdf_final_url` | vacío |
| `visador` | vacío |
| `ejecutivo_solicitante` | vacío |
| `n_operacion_cliente` | vacío |
| TX_DatosTasacion `recy8q3Tq9omjdNUf`: `sintesis_descriptiva` / `descripcion_sector` | vacíos |

Para deshacer: PATCH con los valores de arriba (null). Filas nuevas en `TX_DocumentosGenerados` → DELETE (ids se anotan al crearse).

## Repo (rollback vía git — lo ejecuta Sergio)

- `lib/informe/ensamblador.ts` (fix textosIA) · `lib/tasador/tasaciones.ts` (stub→real) ·
  `app/api/tasaciones/[id]/generar-pdf/**` (nuevo) · `docs/_artefactos/carbone/**` (nuevo).

## Registro de IDs creados (se completa durante la fase)

- (pendiente)

## IDs creados (registro en vivo)

- Make hook SC-Textos: **3797464** (`wh_SC-Textos`) · scenario SC-Textos: **7650070** (creado inactivo).
- TX_HabitacionesPorNivel (11 filas Piso1 para 0067; rollback = DELETE): recnMeFfU9jTfBAf6 recFxdYpaFDstXsFC recL3B487noW4qrsL recKBxWV8flOICDTY recr5qBotjKdqKLtT recTHqfySqehAwT56 rec7BKSfhPhKJshtF recrRdpUe5EsxoAFH recfd0RTx4q3xqrSc rec5LRrxMRYeXImUW recGj1VoH6b2PboOr
- PATCH 0067: visador recrjQDympldI186S · ejecutivo_solicitante "MONICA REYES PINTO" · n_operacion_cliente 900159638 · proyecto_condominio "LAS BRISAS DE CHICUREO" (originales: todos vacíos).
- PATCH datos recy8q3Tq9omjdNUf: pisos 1 · dormitorios 4 · banos 4 · estacionamientos 4 · bodegas 1 · orientacion N · tipo_zona_descripcion "Rural - IPB Colina" (originales: vacíos).
- Carbone template NUEVO subido (PROD): id en `.env.local` `CARBONE_TEMPLATE_ID` (valor completo solo ahí). Rollback: DELETE /template/{id} + vaciar la línea.
- E2 5750023 → blueprint v2.0 aplicado por PATCH (original en blueprint-original-5750023-redacted.json). E3 5791413 → v2.1 aplicado (sin share-link; original en blueprint-original-5791413-redacted.json). Nota: el header Authorization de Carbone en E2-m2/E3-m2 fue reemplazado por el token PROD vigente (el viejo de mayo quedó solo en el historial de versiones de Make).
- Hallazgo primera corrida: `dropbox:createShareLink` → [401] missing_scope (la conexión 7553318 no tiene sharing.write). Fallback v2.1: pdf_final_url = URL dropbox.com/home con preview (clickeable para el dueño de la cuenta) + path interno en url_dropbox. GATE para Sergio: re-autorizar la conexión Dropbox en Make (agrega el scope) y una tanda posterior re-inserta el módulo share-link (nombre válido verificado: dropbox:createShareLink).
- TX_DocumentosGenerados: fila vigente `recawPLSpeQy8QBal` (rollback = DELETE). La duplicada `recDzHR7XfAxybrfR` (reproceso del bundle fallido al reactivar E3) fue BORRADA el 27-sep — ya ejecutado, sin rollback.
- VP-2026-0067 tras la corrida: estado calculada→**pdf_listo**, pdf_final_url poblado (originales en snap-0067-pre-imprenta.json).
- SC-Textos corrió 1 vez (textos en recy8q3Tq9omjdNUf; originales vacíos — rollback = PATCH null). Escenario quedó APAGADO.
