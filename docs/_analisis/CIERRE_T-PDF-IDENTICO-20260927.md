# CIERRE — T-PDF-IDENTICO-20260927

> 28/29-sep-2026 · rama `feat/T-PDF-IDENTICO-20260927` (plan en
> `plan/T-PDF-IDENTICO-20260927`; el working tree con todo el trabajo quedó en la rama feat
> — sin commits, los hace Sergio). Plan: `docs/_planes/PLAN_T-PDF-IDENTICO-20260927.md`.

## Resultado

**95% de igualdad** contra el informe de referencia MET-6283, dictaminado por auditor ciego
independiente (`_evidencia/T-PDF-IDENTICO-20260927/auditor.md`): datos ≈100% · imágenes
≈98% · diseño ≈85%. Batería QA: **127/128 PASS** (único FAIL: guardarraíl de pixel-diff en
la Hoja 1, 42% vs 35% — misma información, distinta densidad vertical). GATE interno de
Fase 1: **pasó (G1–G4)**.

## Qué se hizo (todo reversible — `_evidencia/T-PDF-IDENTICO-20260927/rollback.md`)

1. **Plantilla Carbone v2** (`docs/_artefactos/carbone/PLANTILLA_MET_v2.docx`, generador
   `generar_plantilla_met_v2.py`): 8 páginas, 35 ranuras de imagen, 268 tags; top-10 de
   diseño aplicado (cajas sin grilla negra, lado-a-lado, matrices, rojos/cian). Publicada:
   templateId `517ddc62…` (v1 `070757d8…` se conserva para rollback).
2. **Imágenes**: 35 assets extraídos del PDF de referencia
   (`docs/_artefactos/carbone/assets_met6283/` + `MANIFEST.md`), pre-recortados al aspecto
   de su ranura (`render/`, dict CROPS) y servidos como data-URI por el nuevo
   `lib/informe/imagenes.ts` (gateado a VP-2026-0067; un adjunto Airtable con URL pública
   tiene prioridad automática).
3. **CI-057 + dólar (app)**: `lib/informe/ensamblador.ts` + `fila-tasacion.ts` — promedios
   POR BLOQUE excluyendo ceros (ofertas 33,64 / CBR 24,08), fila TASACIÓN con UF/m²C
   homologado 32,64 (antes 80,53 → 161%), V/S −2,98%/+35,52% (imprime −3%/36%), columna US$
   = CLP÷890,33, fix del filtro dateTime de H_PreciosUF (`DATETIME_FORMAT`). Tests
   1017/1017, typecheck y build limpios.
4. **Datos reales en VP-0067**: valores exactos del XLSM (año 2024, vida útil 70, N°
   `METLIFE -6283`, dirección completa, rol/permiso/recepción con formato exacto,
   habitaciones 16/4/4) vía Airtable REST con rollback; lo sin columna va en
   `docs/_artefactos/carbone/overrides_met6283.json` (deep-merge por `codigo` en
   `lib/informe/overrides.ts`).
5. **Cadena viva**: E2 re-apuntado a la plantilla v2 (v2.1, blueprint en
   `docs/_artefactos/make/E2_Carbone_Render.blueprint.json`), fix del hardcode
   `plantilla_version` en E3. **Corrida REAL completa**: webhook E2 (HMAC, mismo payload del
   route) → Carbone → E3 → Dropbox → Airtable (`pdf_listo`, `pdf_final_url`, fila DocGen
   vigente única `rec2iw3c9ft5d1TXR`). **E2 y E3 quedaron ACTIVOS** (GO-LIVE hecho, con
   ejecuciones exitosas verificadas por el auditor en logs de Make).

## Bloque 4 — rollback condicional

Único FAIL (densidad Hoja 1): NO se revierte — revertir la plantilla v2 restauraría los
recuadros vacíos de la v1. Queda como decisión de ajuste fino de Sergio en el OK visual.

## Pendientes que requieren a Sergio

1. **OK visual final**: mirar `PDF_generado_VP0067_v2.pdf` vs referencia
   (`comparacion-p1..p8.png`).
2. **Dropbox Reauthorize** (conexión "My Dropbox connection" en Make, scope
   `sharing.write`): hasta entonces `pdf_final_url` abre logueado, sin link público. La
   credencial de `.env.local` también sigue inválida (400).
3. **Fix motor C_Formulas — NO aplicado** (frontera de seguridad: exige confirmar AT03 OFF).
   Todo preparado y validado en seco en `_evidencia/T-PDF-IDENTICO-20260927/fix-motor-preparado.md`
   (expresiones nuevas, SCOPE de `AT03_Calculos_DAG.js` ya editado en el repo, números
   reproducidos). El PDF NO depende de esto (el número impreso lo produce la app).
4. **3 capturas como tasador** (`/tasaciones/{id}/informe`): botón Confirmar · "Enviando…" ·
   "Informe enviado"/link PDF.
5. **Commit + push** de la rama feat (y decidir si mergea el plan de la rama plan).

## Columnas nuevas requeridas para el flujo vivo (hoy resuelto por overrides/assets del repo)

- Toda `cualitativa.*` (Hoja 3: ~60 campos en 8 grupos — P1-1/P1-2).
- Ranuras de imagen: fotos/mapas/anexos como adjuntos con URL pública (P1-4), firma en
  M_Tasadores (P1-9).
- `afecto_expropiacion` + texto, `fecha_visado` (IF-04), nombre de tasador del informe
  cuando difiere del asignado, `tipo_cambio_usd` con escritor (CRON_UF_Diaria sigue
  "Pendiente").

## Divergencias documentales detectadas (para futuras tandas)

- CLAUDE.md tabla Make: E1/E2/E3 ya no son "sin blueprint" — E2 v2.1 y E3 v2.1 están
  ACTIVOS con blueprints en `docs/_artefactos/make/`.
- El "CI-057" de esta tanda son las fórmulas promedio/desviación, no la ficha CI-057 de
  `CODE_INCONSISTENCIES.md` (divergencia comparables, sigue abierta y condicionada a A-44).
- C_AutomationsAirtable dice AT03 "Activo" (03-jul): desactualizado vs declaración de Sergio
  (OFF, 27-sep).
- Efecto conocido reconfirmado: al re-encender un escenario Make tras PATCH, reprocesa
  bundles incompletos (generó un duplicado en DocGen — saneado, ver rollback.md).
