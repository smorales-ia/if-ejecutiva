# CIERRE · T-5CASOS-PDF-GOLIVE-20261005

**Fecha:** 2026-10-05/06 · **Objetivo:** encender la vista 6 ("Descargar PDF") en los 5 casos sandbox ejecutando los 2 pasos preparados: reactivar E3 y generar los 5 PDFs.
**Resultado global:** **V6 ENCENDIDA EN LOS 5 CASOS** — `pdf_final_url` + fila de expediente + `estado=pdf_listo` + descarga real verificada (5/5, `%PDF-`, 467–905 KB). E3 reactivado con el fix de idempotencia y sano (`isActive=true`, `isinvalid=false`, cola 0). Dropbox no necesitó reautorización. **Sin rollback.** El auditor ciego confirmó cadena y valores 5/5 y elevó un defecto PREEXISTENTE de contenido (G-4, propietario) en los casos 3/4/5 — ver §4.

## 1 · Qué se ejecutó (y los 3 desvíos resueltos)

1. **BLOQUE 0:** verificación de los 5 records (`calculada`, sin PDF), del fix y el disparador, credenciales; snapshot de E3 (`e3-estado-pre.json`) y de la cola. **Hallazgo:** la cola del hook de E3 tenía **8 incomings** stale (disparos E2 de tandas previas, renders expirados), no 1 como asumía el fix.
2. **Desvío 1:** `fix-e3-apply.sh` abortaba porque `.env.local` línea 23 (`MAKE_WEBHOOK_E4=# completar…`) ejecutaba "completar" como comando bajo `set -e`. Se comentó la línea (config local).
3. **Desvío 2 (decisión del equipo):** purga documentada de los 8 incomings ANTES de reactivar (ids en `e3-cola-pre-purga.json`) — procesarlos solo podía fallar (renders expirados) o subir basura con `overwrite:true` sobre PDFs buenos (incl. VP-0067). Mitigación: los 5 casos re-emiten fresco en esta misma tanda.
4. **BLOQUE 1 · Vía A:** fix aplicado (PATCH blueprint con `onerror` de idempotencia en el módulo 9 → verificado en el escenario VIVO → start). Smoke real caso 1: E2→Carbone→E3→Dropbox→Airtable punta a punta OK.
5. **Desvío 3:** el disparador fallaba intermitente por red de Node en WSL (happy-eyeballs: IPv6 ENETUNREACH + ventana de 250 ms < connect IPv4 real de ~2 s). Fix de sesión: `NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection"`. curl/python nunca fallaron: no era la cadena.
6. **BLOQUE 2:** `disparar-e2-5casos.test.mts` → 5/5 passed (94 s). Verificación propia + descarga real por caso: `pdf-5casos-check.md` y `estado-final-5casos.json`.

## 2 · Tabla por caso

| Caso | VP | pdf_final_url | Expediente | Estado | Descarga | Auditor ciego |
|---|---|---|---|---|---|---|
| 1 · MetLife | VP-2026-0073 | ✓ Dropbox | 1 fila, vigente | `pdf_listo` | 884 KB `%PDF-` | **OK** |
| 2 · Agencia Hab. | VP-2026-0074 | ✓ | 1 fila, vigente | `pdf_listo` | 467 KB | **OK** |
| 3 · Austral | VP-2026-0075 | ✓ | 1 fila, vigente | `pdf_listo` | 708 KB | FAIL estricto (solo G-4) |
| 4 · Security | VP-2026-0076 | ✓ | 1 fila, vigente | `pdf_listo` | 732 KB | FAIL estricto (solo G-4) |
| 5 · Evoluciona | VP-2026-0077 | ✓ | 1 fila, vigente | `pdf_listo` | 774 KB | FAIL estricto (solo G-4) |

Espejo verificado por el auditor con extracción de texto: dirección, comuna, rol SII y valores UF (comercial/seguro/liquidación) **exactos en los 5**.

## 3 · Dropbox

**No hizo falta reautorización** — las conexiones Make (upload 7553318 · share 11421587) operaron a la primera.

## 4 · El FAIL estricto del auditor = gap G-4 preexistente, no de esta tanda

El PDF imprime "Propietario" = solicitante (`ensamblador.ts:587` proyecta `cliente_final_nombre` y nunca lee `TX_DatosTasacion.propietario_*`). En C1/C2 coinciden (misma persona) y no se nota; en C3/C4/C5 el propietario real (Víctor González · Irma Alzamora · Inmob. Exequiel Fernández SpA) **sí está correcto en Airtable** pero la plantilla no lo usa. Es el hallazgo **G-4 de la tanda RÉPLICA** (presente en aquellos 4 PDFs auditados OK con la salvedad), agendado para la **tanda de plantilla** (junto con 8 páginas y "NO REGISTRA"). Decisión Bloque 4: **sin rollback** — revertir los links no remedia un gap de render anterior y destruiría la V6 recién encendida; tras el fix de plantilla, re-render de C3/C4/C5 = volver a correr el mismo disparador (pre-paso: vaciar `pdf_final_url` de esos 3 para que no los salte, o re-emitir manualmente).

## 5 · Qué tocó esta tanda (todo reversible, `rollback.md`)

E3 (blueprint módulo 9 + reactivación — reversible a snapshot) · cola hook (8 stale purgados, documentados) · por caso: `pdf_final_url` + 1 fila TX_DocumentosGenerados + `estado→pdf_listo` · `.env.local` línea 23 comentada. **Nada más**: sin re-siembra, sin tocar M_Clientes/VP-0067 (su PDF vigente intacto), sin cambios de código de la app, sin commit/push.

## 6 · Qué sigue

1. Click-through de Sergio: las 6 vistas por caso (guion en claude-out.txt de la tanda PROD-TEST) — ahora con V6 descargando de verdad.
2. **Tanda de plantilla** (ya prevista): G-4 propietario + 8 páginas + "NO REGISTRA" → luego re-render C3/C4/C5 con el mismo disparador.
3. Saneo M_Clientes con las respuestas de Héctor (retirar los 3 `valor_seguro_override`).
