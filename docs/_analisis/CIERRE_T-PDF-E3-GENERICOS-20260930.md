# CIERRE — T-PDF-E3-GENERICOS-20260930

Fecha: 30-sep-2026 · Rama: `feat/T-PDF-E3-GENERICOS-20260930` (sin commit/push — los hace Sergio)
Plan: `docs/_planes/PLAN_T-PDF-E3-GENERICOS-20260930.md` · Evidencia: `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/`

## Resultado por frente

### FRENTE A (Make · destrabar E3) — BLOQUEADO por política del entorno, con destrabe LISTO

- Diagnóstico completo por evidencia del run real (`e3-diagnostico.md`): E3 = scenario **5791413**
  (`E3_Carbone_Download_Dropbox v2.2`), INACTIVO desde el 30-sep 01:12Z. Causa raíz: el módulo 9
  (`dropbox:createShareLink`, conexión 11421587) **no tiene error handler**; un re-disparo del
  mismo informe devolvió `[409] Share link already exists…` y Make desactivó el escenario. La
  "ejecución pendiente" NO está en el DLQ (vacío): es **1 incoming en la cola del webhook 3063524**
  (payload VP-2026-0067, duplicado de un run que a las 00:59Z ya había terminado OK).
- Fix de idempotencia diseñado y empaquetado: `onerror` en el módulo 9 = módulo `http` que lee
  `pdf_final_url` del record en Airtable (mismo archivo ⇒ mismo link) + directiva `Resume` con esa
  URL. Se descartó el módulo "Dropbox Make an API Call" porque `dropbox:makeAPICall` **no existe**
  en Make (HTTP 400 IM007) y la variante alternativa no se pudo probar.
- **Por qué quedó bloqueado**: el clasificador de permisos del entorno de Claude Code veta toda
  modificación de E1/E2/E3 (regla de CLAUDE.md), incluso con la autorización de la tanda e incluso
  la construcción del cuerpo del PATCH. Nada se modificó en Make: blueprint intacto, cola intacta,
  cero escrituras (auditor A1–A4 FAIL = estado original, no daño).
- **Destrabe en un paso para Sergio**: `docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh`
  (ejecutar con `! bash …` desde la sesión) o los pasos por UI de Make en `fix-e3-pasos-manuales.md`.
  Tras eso, pedir a Claude Code la validación (emisión real ×2 + idempotencia) para completar A.4.
- Dropbox NO necesita Reauthorize: la conexión 11421587 tiene `sharing.write` (link creado con
  ella a las 00:59Z del 30-sep).

### FRENTE B (código · mapas/anexos/firma genéricos) — COMPLETO Y VERIFICADO

- Las 20 ranuras fijas `{d.imagenes.*}` del PDF dejaron de depender del hardcode
  `ASSETS_POR_CODIGO['VP-2026-0067']` (eliminado). Resolución 100% desde fuentes vivas, mismo
  patrón de origen único de las fotos:
  - **Mapas y referencias (por visita)**: fotos por categoría en `TX_Adjuntos` — `mapa_ubicacion`,
    `fachada_exterior`, `mapa_referencias` (categoría nueva) y `ofertas_comparables` (ref 1-3).
  - **Anexos 1 y 2 (por caso, riel documental)**: adjunto del checklist por `clave_adjunto` con
    `thumbnail_url` renderizable — mapeo en la constante compartida `RANURAS_ANEXO`
    (`lib/informe/imagenes.ts:88-108`), 13 ranuras. Se crearon 5 tipos nuevos en `D_TipoDocumento`
    (`esquema_superficies`, `cuadro_superficies`, `planta_emplazamiento`, `foto_aerea`, `mapa_sii`).
    Documentos subidos como imagen generan thumbnail al subir; PDFs quedan sin miniatura
    (**deuda P2: thumbnail de PDF**).
  - **Firma (por perfil)**: campo nuevo `M_Tasadores.firma_url` (`fldLDgfVvBD6huoqM`, multilineText,
    espejo del precedente `M_Visadores.firma_url`); la aporta el perfil, no la visita. Hueco P1-9
    cerrado.
- UI: el preview del informe muestra la firma (bloque de cierre) y la nueva sección "Anexos del
  informe" con vacíos honestos; UI y PDF consumen el mismo objeto canónico (correlación 1:1
  verificada dato a dato, 20/20 — `correlacion.md`).
- Seed VP-0067 (`rollback-datos.md` con estado previo completo): 17 filas de `TX_Adjuntos`
  creadas/patcheadas + firma del tasador, con data-URIs ≤95 KB desde los crops del gold master;
  sin disparar RF-09 (`estado_extraccion='listo'`, 0 corridas espurias en LogEscenarios).
- Verificación: `pnpm typecheck` ✅ · `pnpm build` ✅ · `pnpm test` ✅ (1066 passed | 3 skipped) ·
  genericidad sin hits vivos (`genericos-check.md`) · regresión intacta: grilla de fotos, datos,
  REF. C.B.R., CI-057, `/lectura`, botones Descargar PDF y Ver expediente (`regresion.md`).
- **Los cambios de código se ven en producción recién tras commit+push+deploy de Railway.**

## Auditor ciego (`auditor.md`)

6 OK / 4 FAIL: Frente B (B1-B3) y salud del repo (C1-C3) OK completos; Frente A (A1-A4) FAIL por
el bloqueo de política — estado de Make = original, sin daño. Bloque 4 (rollback) no aplicó:
ningún FAIL fue producto de un cambio nuestro.

## Deudas y pendientes registrados

1. **Sergio**: ejecutar el destrabe de E3 (script o UI) y pedir la validación ×2.
2. **Sergio**: commit+push+merge de la rama feat para desplegar los genéricos.
3. Deuda P2: thumbnail de PDF para escaneados del checklist (hoy: vacío honesto).
4. Deuda (hallazgo A1): los módulos HTTP del blueprint E3 llevan el PAT Airtable y el token Carbone
   hardcodeados — migrarlos a conexiones/variables en una tanda futura. Los snapshots en evidencia
   quedaron **redactados** (`<AIRTABLE_TOKEN>`/`<CARBONE_TOKEN_PROD>`; se re-inyectan desde
   `.env.local`, como hace `fix-e3-apply.sh`).
5. Logo de portada por-cliente (P0 de producto, H9 auditoría universal): fuera de esta tanda,
   requiere tanda de plantilla.
6. UI de perfil del tasador para subir la firma: hoy se carga en Airtable (sin código); UI opcional
   a futuro.

## Cuenta para validar en producción

VP-2026-0067 está asignada al tasador **nutricionsaludketo@gmail.com** (record `recTJcV3BIvdcG4em`).
URL: `https://if-ejecutiva-production.up.railway.app/tasaciones/recmMzeu3eWGxyXsf/informe`.
