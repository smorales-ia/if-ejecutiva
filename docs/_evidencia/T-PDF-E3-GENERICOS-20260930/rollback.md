# Rollback — T-PDF-E3-GENERICOS-20260930

Estado ORIGINAL registrado ANTES de cualquier cambio (Bloque 0, 30-sep-2026).

## Make (Frente A)

- **Blueprint E3 original completo**: `e3-blueprint-snapshot-original.json` (en esta carpeta,
  16.737 bytes, respuesta cruda de `GET /scenarios/5791413/blueprint` del 30-sep).
  Rollback: `PATCH /scenarios/5791413` con `{"blueprint": "<contenido del snapshot serializado>"}`.
- **Estado de activación original**: E3 (5791413) `isActive=false`, `islinked=false`,
  `isinvalid=true` · E2 (5750023) ACTIVO (no se toca). Rollback de activación:
  `POST /scenarios/5791413/stop`.
- **Cola webhook original**: hook 3063524 con `queueCount: 1` — incoming
  `cf430c8d435875f253728e0c981e3a72` (30-sep 01:12:27Z), payload:
  `{"renderId":"MTAuMjAuMTEuNDEuc…pdf","solicitud_id":"recmMzeu3eWGxyXsf","solicitud_codigo":"VP-2026-0067","numero_solicitud":"METLIFE -6283","nombre_cliente":"FRANCISCO JOSÉ VERGARA UNDURRAGA"}`.
  (Duplicado de un run que ya terminó OK a las 00:59Z; se consumirá al reactivar.)
- Snapshot de `TX_DocumentosGenerados` (VP-0067) antes del `start`: lo registra el Track A en
  `e3-smoke.md` §snapshot.

## Código (Frente B)

- Working tree LIMPIO al inicio de la tanda (rama `main` = commit `3b8ab12`); todo cambio de
  código vive sin commitear en `feat/T-PDF-E3-GENERICOS-20260930`.
  Rollback de cualquier archivo: `git restore <archivo>` (o `git checkout main -- <archivo>`).

## Datos Airtable (Frente B — seed)

- Snapshot por-record ANTES de cada patch: `rollback-datos.md` (en esta carpeta, lo escribe el
  agente de seed ANTES de cada escritura). Campos/códigos NUEVOS creados (aditivos) quedan
  documentados ahí con sus IDs; revertir = restaurar valores del snapshot y, si se decide,
  eliminar los códigos/campo creados.

## Oráculo (intocable)

- `docs/_referencias/**`, `docs/_artefactos/carbone/assets_met6283/**`, plantilla
  `PLANTILLA_MET_v2.docx`: SOLO LECTURA en toda la tanda.
