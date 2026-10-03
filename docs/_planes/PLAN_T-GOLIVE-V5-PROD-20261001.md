# PLAN · T-GOLIVE-V5-PROD-20261001

> Dejar la PLANTILLA v5 corriendo en producción (E2 → Carbone → Dropbox) y VP-2026-0067
> como prueba viva. Fase 1 (verificación) + Fase 2 (go-live) con GATE interno.
> Rama: `feat/T-PLANTILLA-WORD-XLSM-20261001`.

## §1 · Resumen ejecutivo

**Hallazgo decisivo: el go-live YA ESTABA HECHO antes de iniciar esta tanda.**

La verificación de Fase 1 (sólo lectura) encontró que:

- El escenario **E2 ya renderiza con el templateId de v5** (`f6d1f2b0…6a786f`).
- `.env.local` → `CARBONE_TEMPLATE_ID` **ya es igual a v5**.
- E2 está **activo** y su última corrida **exitosa** fue **2026-10-01T21:07:08Z** (status 1,
  4 operaciones), justo después de que el blueprint se editara a las 21:03 del mismo día.
- VP-2026-0067 está en `estado=pdf_listo` con `pdf_final_url` poblado, y ese PDF es un
  **render v5 válido** (verificado: 8 páginas, 0 marcadores `{d.}`, fotos, cálculos intactos).

Por lo tanto se activó el **GATE G3 de DETENCIÓN**: «si el templateId de E2 ya coincide con
v5, DETENER y reportar que no hay nada que re-apuntar». No se ejecutó ninguna escritura de
Fase 2 (ni PATCH a E2, ni cambio en `.env.local`). La tanda **verifica** el go-live en vez de
re-hacerlo.

## §2 · Estado actual (medido en Fase 1)

| Pieza | Valor medido | Fuente |
|---|---|---|
| E2 scenario id | `5750023` | Make API GET /scenarios/5750023 |
| E2 nombre | `E2_Carbone_Render v2.2 - InformeContexto` | idem |
| E2 estado | **activo** (`isActive: true`, scheduling immediately) | idem |
| E2 lastEdit | `2026-10-01T21:03:26Z` | idem |
| E2 última corrida OK | `2026-10-01T21:07:08Z` · status 1 · 4 ops | Make API GET /scenarios/5750023/logs |
| Módulo render | **HTTP** `POST https://api.carbone.io/render/<templateId>` (módulo #2), NO un app-module Carbone | blueprint |
| templateId en E2 | `f6d1f2b01517d7bedd953e6e295782114344f3d88c3c79e0b1116c428d5a786f` (**= v5**) | blueprint módulo #2 |
| `.env.local` CARBONE_TEMPLATE_ID | **= v5** (idéntico) | repo local |
| `.env.local` tracking | **gitignored** (`.env*`) → no entra al commit de Sergio | `.gitignore` |
| VP-0067 | `recmMzeu3eWGxyXsf` · `estado=pdf_listo` | Airtable |
| Tasador asignado | `recTJcV3BIvdcG4em` → **nutricionsaludketo@gmail.com** (clerk `user_3GBF4Jp…`) | M_Tasadores |
| pdf_final_url | Dropbox `…/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf` | TX_Solicitudes |

**Arquitectura relevante:** E2 **no usa el app-module de Carbone**; llama a la REST API de
Carbone por HTTP (`http:ActionSendData`). El templateId vive **en la URL del módulo #2**
(`/render/<id>`), no en un campo `templateId` de un mapper. Cualquier re-apunte futuro es una
edición de esa URL.

## §3 · Plan de re-apunte

**No aplica en esta tanda — no hay nada que re-apuntar.** E2 y `.env.local` ya apuntan a v5.

Procedimiento documentado para un re-apunte futuro (si alguna vez hubiera que cambiar el
template de E2):

1. GET `/scenarios/5750023/blueprint`.
2. En `flow[]`, módulo `#2` (`http:ActionSendData`), cambiar sólo el segmento final de
   `mapper.url`: `https://api.carbone.io/render/<NUEVO_ID>`.
3. PUT `/scenarios/5750023/blueprint` con el blueprint completo (Make no acepta PATCH parcial
   del blueprint), preservando flow completo, nombre, scheduling, conexiones y demás módulos.
4. Actualizar `CARBONE_TEMPLATE_ID` en `.env.local` y en las env vars de Railway.

## §4 · Batería de tests

- **Smoke test del render vivo**: ver §2 — la corrida OK de 2026-10-01 21:07 es el smoke test
  real post-re-apunte (la cadena de producción generó el PDF con v5). Documentado en
  `_evidencia/.../smoke-test-make.md`.
- **Verificación del PDF vivo** (hecha): 8 páginas · 0 marcadores `{d.}` · `890,33` ·
  `-3%` / `36%` (CI-057) · VERGARA UNDURRAGA · METLIFE · 288 imágenes embebidas.
  Artefacto: `PDF_PROD_VP0067_v5-live.pdf`.
- **6 vistas en producción** (V1 adjuntos · V2 extracción · V3 UI tasador · V4 UI informe ·
  V5 expediente · V6 descarga PDF) con la cuenta del tasador (nutricionsaludketo@gmail.com):
  **pendiente de ejecución manual** (requiere sesión Clerk interactiva; ver cierre §4).

## §5 · Rollback

Nada que revertir en esta tanda (no hubo escrituras). El `rollback.md` **ya existe** de la
sesión que ejecutó el go-live el 2026-10-01 y es la fuente de verdad del estado original:

- **templateId vivo (v5, actual)**: `f6d1f2b01517d7bedd953e6e295782114344f3d88c3c79e0b1116c428d5a786f`
- **templateId ORIGINAL en E2 antes del go-live (destino de rollback)**: `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
- **pdf_final_url vivo de VP-0067**: Dropbox `…/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf`
- Para revertir E2: cambiar la URL del módulo #2 al id `31f3bfab…` y re-aplicar el blueprint
  (ver `golive-e2-repoint.mjs`, que cambia exactamente esa URL).

> Nota: el id `0ab0da67…` corresponde al **v4.docx subido a Carbone** como artefacto, pero el
> template que E2 tenía realmente apuntado antes del go-live era `31f3bfab…`. El destino de
> rollback correcto es `31f3bfab…`.

Detalle en `_evidencia/T-GOLIVE-V5-PROD-20261001/rollback.md` (sesión 2026-10-01, preservado).

## §6 · GATES

| Gate | Criterio | Resultado |
|---|---|---|
| G1 | Credenciales OK (Make 200, Airtable 200, Carbone alcanzable) | ✅ |
| G2 | v5 responde 200 en Carbone | ✅ (corrida E2 status 1 → Carbone rindió el PDF) |
| G3 | templateId de E2 **DISTINTO** de v5 (para re-apuntar) | ❌ **ya coincide** → DETENER Fase 2 |
| G4 | VP-0067 alcanzable, estado correcto, tasador conocido | ✅ |

**Decisión:** G3 es condición de detención con resultado favorable al objetivo
(producción ya está en v5). No se ejecuta escritura. Se cierra como **objetivo ya
satisfecho + verificado**.
