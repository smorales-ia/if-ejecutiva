# CIERRE · T-GOLIVE-V5-PROD-20261001

**Fecha:** 2026-10-03 · **Rama:** `feat/T-PLANTILLA-WORD-XLSM-20261001`
**Resultado:** ✅ Objetivo satisfecho — **producción ya usa la plantilla v5** (go-live hecho
2026-10-01) y esta sesión lo **verificó objetivamente**. Sin escrituras en producción.

## Qué se encontró

El go-live fue ejecutado por una sesión previa el **2026-10-01**:
- E2 (scenario `5750023`) re-apuntado a v5 vía Make API (script
  `_evidencia/T-GOLIVE-V5-PROD-20261001/golive-e2-repoint.mjs`, aplicado).
- `.env.local` → `CARBONE_TEMPLATE_ID` ya en v5.
- Corrida viva de E2 **exitosa** el 2026-10-01T21:07:08Z (status 1, 4 ops) que generó el
  `pdf_final_url` vigente de VP-0067.

Al iniciar esta tanda, el **Gate G3** («templateId de E2 debe ser DISTINTO de v5 para
re-apuntar») resultó **ya coincidente** → condición de DETENCIÓN con resultado favorable. No se
hizo PATCH a E2, ni cambio en `.env.local`, ni run-once forzado.

## Verificación hecha (sólo lectura)

- E2 activo, módulo render `#2` apunta a `api.carbone.io/render/f6d1f2b0…6a786f` (**v5**).
- PDF vivo de VP-0067 bajado de Dropbox (`PDF_PROD_VP0067_v5-live.pdf`, 3.4 MB): **8 páginas**,
  **0 marcadores `{d.}`**, dólar `890,33`, CI-057 `-3%`/`36%`, UF `39.894,61`, VERGARA
  UNDURRAGA, METLIFE, **288 imágenes embebidas**.
- Regresión datos ✅ · regresión fotos ✅ · auditor ciego ✅ (criterios 1/2/4 OK).

## Gates

- G1 credenciales ✅ · G2 v5 en Carbone ✅ (corrida OK) · **G3 ❌ (ya coincide → DETENER Fase 2
  de escritura)** · G4 VP-0067 ✅.

## Pendiente (manual, no bloqueante)

1. **6 vistas en producción** con la cuenta del tasador **nutricionsaludketo@gmail.com**
   (clerk `user_3GBF4Jp…`): V1 adjuntos · V2 extracción · V3 UI tasador · V4 UI informe ·
   V5 expediente · V6 descarga PDF. Requieren sesión Clerk interactiva; no verificables headless.
   V6 debe bajar el mismo PDF v5 (`PDF_PROD_VP0067_v5-live.pdf`).
2. **Railway**: si las env vars del deploy tienen su propia copia de `CARBONE_TEMPLATE_ID`,
   actualizar al id v5 (`docs/_evidencia/T-PLANTILLA-WORD-XLSM-20261001/v5-templateid.txt`).
   Nota: E2 ya trae el id en la URL del módulo, así que el render de la cadena Make no depende
   de la env var de Railway; la env var sólo importa para rutas de la app que lean
   `CARBONE_TEMPLATE_ID`.
3. **Commit + push** (lo hace Sergio): `.env.local` está gitignored y además ya estaba en v5,
   así que no aparece en el diff. El commit lleva PLAN, evidencia y aprendizajes.

## Rollback (preparado, no usado)

- templateId vivo (v5): `f6d1f2b01517d7bedd953e6e295782114344f3d88c3c79e0b1116c428d5a786f`
- templateId original en E2 antes del go-live: `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`
- pdf_final_url viejo de VP-0067: ver `rollback.md`.
- Reversión: `golive-e2-repoint.mjs` invertido (cambiar URL del módulo #2 a `31f3bfab…`) +
  `sed` en `.env.local`.

## Artefactos

- `docs/_planes/PLAN_T-GOLIVE-V5-PROD-20261001.md`
- `docs/_evidencia/T-GOLIVE-V5-PROD-20261001/`: `rollback.md` (sesión 2026-10-01, preservado),
  `golive-e2-repoint.mjs`, `smoke-e2-live.test.mts`, `smoke-test-make.md`,
  `PDF_PROD_VP0067_v5-live.pdf`, `regresion-datos.md`, `regresion-fotos.md`,
  `auditor-ciego-golive.md`
- `docs/_analisis/CIERRE_T-GOLIVE-V5-PROD-20261001.md` (este archivo)
- Entrada en `docs/aprendizajes.md`
