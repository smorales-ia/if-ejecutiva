# E3 · Reactivación — T-5CASOS-PDF-GOLIVE-20261005

**Vía usada: A (fix preparado)** — `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh`, con dos desvíos operativos resueltos antes de aplicar (abajo). Sin re-diagnóstico: la causa raíz ya estaba diagnosticada (módulo 9 `dropbox:createShareLink` sin error handler → 409 "Share link already exists" → Make desactivó E3 el 30-sep).

## Estado previo (snapshot en `e3-estado-pre.json` / `e3-cola-pre-purga.json`)
- Scenario 5791413 `E3_Carbone_Download_Dropbox v2.2`: `isActive=false`, **`isinvalid=true`**.
- **Cola del hook 3063524: 8 incomings pendientes** (no 1 como asumía el empaquetado del fix) — payloads de los disparos E2 de tandas previas (réplica 2–5, caso 1, duplicado VP-0067) con renders de Carbone ya expirados.

## Desvío 1 — `.env.local` rompía el fix
`fix-e3-apply.sh` usa `set -euo pipefail` + `source .env.local`; la línea 23 (`MAKE_WEBHOOK_E4=# completar…`) hacía que bash ejecutara "completar" como comando → abort. Se comentó la línea (config local, sin tocar valores). 

## Desvío 2 — purga de cola ANTES de reactivar (decisión del equipo)
Reactivar con 8 incomings stale habría hecho que el módulo 2 (GET del render Carbone, expirado) o el 5 (upload con `overwrite:true`) procesara basura — con riesgo de sobreescribir PDFs buenos en `/VProperty/Tasaciones` (incluido VP-0067, intocable) o de tumbar E3 de nuevo. Se purgaron los 8 (ids en `e3-cola-pre-purga.json`, DELETE 200, `queueCount` 8→0). No reversible pero sin pérdida: los 5 casos re-emiten render fresco en esta tanda y VP-0067 conserva su PDF vigente.

## Aplicación del fix (endpoints sin tokens)
- `PATCH <MAKE_BASE_URL>/scenarios/5791413` con el blueprint original + `onerror` de idempotencia en el módulo 9 (módulos 20 http GET `pdf_final_url` del record + 21 `builtin:Resume`) → 200.
- Verificación contra el escenario VIVO: `GET /scenarios/5791413/blueprint` → módulo 9 con `onerror` de 2 módulos ✓.
- `POST /scenarios/5791413/start` → 200.
- Estado final: **`isActive=true` · `isinvalid=false`** · `queueCount=0` · lastEdit 2026-10-06T01:50Z.

## Dropbox
**No hizo falta reautorización.** Las conexiones de Make (7553318 upload · 11421587 share) funcionaron a la primera: el smoke subió el PDF y generó share-link sin intervención.

## Smoke test (corrida real, caso 1)
`pnpm vitest run …/disparar-e2-5casos.test.mts -t "caso 1"` → E2 200 → fila TX_DocumentosGenerados nueva → `pdf_final_url` share-link Dropbox → `estado=pdf_listo`. Descarga verificada: 905 KB, magic `%PDF-`. 

Nota de entorno: dos corridas previas del smoke fallaron por red de Node en WSL (happy-eyeballs: IPv6 ENETUNREACH + timeout de 250 ms por intento sobre un connect IPv4 de ~2 s). Fix de sesión: `NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection"`. No es un problema de la cadena (curl/python conectaban siempre).
