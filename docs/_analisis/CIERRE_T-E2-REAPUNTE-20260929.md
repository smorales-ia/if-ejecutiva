# CIERRE — TANDA T-E2-REAPUNTE-20260929

> Re-apunte del escenario E2 (Make 5750023) al template Carbone NUEVO
> `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32` por API,
> validado con run real de la cadena. Rama: `feat/T-E2-REAPUNTE-20260929`.
> Evidencia: `docs/_evidencia/T-E2-REAPUNTE-20260929/`.

## Resultado

| Criterio | Estado | Evidencia |
|---|---|---|
| Gates | G1 ✅ · G2 ✅ (tras detención) · G3 ✅ | G2 falló al primer intento: `.env.local` tenía `CARBONE_TEMPLATE_ID` con el id VIEJO. Se detuvo y Sergio confirmó en sesión `31f3bfab…8e32`; `.env.local` actualizado. `rollback.md`. |
| Re-apunte E2 | ✅ HECHO | PATCH `/scenarios/5750023` → 200. `flow[1].mapper.url` = `…/render/31f3bfab…8e32`, name `E2_Carbone_Render v2.2 - InformeContexto`, activo. GET post: 0 ocurrencias del id viejo. Blueprints pre/post redactados en evidencia. |
| Run real | ✅ ÉXITO | Webhook E2 firmado HMAC con contexto real VP-0067 → E2 status 1 (5,1 s · 4 ops) → E3 status 1 (5,0 s · 6 ops · ~3,4 MB transferidos). Fila DocGen nueva `rec0t8n2oXJB29cMZ` vigente (plantilla v2, render_id nuevo), `pdf_final_url` actualizado. Saneo de vigencia de la fila anterior (efecto colateral conocido del pipeline, documentado). `run-real.md`. |
| Portada nueva | ✅ | v4 vs v3 (plantilla nueva): **0,00% en las 8 páginas** (auditor: 0 píxeles). v4 p1 vs v2 p1 (portada vieja): 18,26% — es la nueva, no la vieja. `comparacion-portada.png`. |
| Sin regresión | ✅ | Batería QA sobre v4: **127/128 PASS** (único FAIL: pixel-diff p2 42% vs referencia, pre-existente e idéntico en v2/v3 — artefacto de métrica). 13 literales clave verificados por el auditor. Imágenes en las 8 páginas, sin placeholders. |
| Auditor ciego | ✅ **OK — CIERRE** | 4/4 dictámenes OK con evidencia propia recalculada. Nada que revertir. `auditor.md`. |

## Notas operativas

- El veto del clasificador de permisos sobre E2 (tanda T-CIERRE-FINAL) **no se repitió**
  con la autorización explícita de esta tanda dedicada — no hizo falta proponer el cambio
  de redacción del CLAUDE.md por bloqueo, aunque la redacción de la regla sigue
  desactualizada ("hoy inactivos y sin blueprint") y conviene corregirla en una tanda
  de docs.
- PATCH a la API de Make con `python-urllib` → 403 Cloudflare (error 1010, firma de
  user-agent); el mismo request con `curl` → 200.
- `GET /scenarios/{id}/logs/{executionId}` rechaza el `imtId` que entrega la lista
  (`SC400 pattern`); el status agregado + efectos en Airtable son la evidencia del run.
- El archivo "patron corrige escenario make.txt" citado en el encargo no se encontró en
  Documents ni en el repo; el método aplicado es el que ese patrón describe
  (token → GET blueprint → PATCH del escenario → run real).
- El PDF del run vive en Dropbox (E3 descarga el render de Carbone, que lo borra tras esa
  primera descarga); `PDF_generado_VP0067_v4.pdf` es el mismo request de render que
  ejecutó E2 v2.2 (mismo template + contexto + lang) — el auditor confirmó 0 píxeles de
  diferencia con la plantilla nueva.

## Pendientes de Sergio (sin cambios respecto del handoff de T-CIERRE-FINAL, menos §3.0 que YA quedó hecho)

1. OK visual de `comparacion-portada.png` (v3 | v4) y del PDF v4.
2. Merge de `feat/T-E2-REAPUNTE-20260929` a `main` + push (contiene toda la cadena).
3. Probar en producción "Enviar informe" y tomar las 3 capturas como tasador.
4. Share-link público de Dropbox (re-Reauthorize + módulo en E3) — handoff T-CIERRE §3.2.
