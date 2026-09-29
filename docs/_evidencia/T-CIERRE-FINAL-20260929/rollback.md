# Rollback — T-CIERRE-FINAL-20260929 (estado ORIGINAL, capturado 29-sep-2026 antes de tocar nada)

> Convención de secretos: `<AIRTABLE_TOKEN>` · `<MAKE_API_TOKEN>` · `<CARBONE_PROD>` — nunca en claro.

## Gates (BLOQUE 0)

| Gate | Resultado | Evidencia |
|---|---|---|
| G1 credenciales | ✅ OK | `.env.local` contiene MAKE_API_TOKEN (validado `users/me` → 200), CARBONE_*, DROPBOX_*, AIRTABLE_TOKEN (validado GET VP-0067 → 200). Ningún valor impreso. |
| G2 oráculo | ✅ OK | `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (2.561.080 bytes) y `1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` (9.044.682 bytes) presentes y legibles. |
| G3 AT03 OFF | ✅ OK (indirecto) | El MCP Airtable devuelve `INVALID_PERMISSIONS` sobre automations (misma limitación registrada en `fix-motor-preparado.md`: "la API no puede verificarlo"). Se acepta: (a) confirmación explícita de Sergio en el encargo de esta tanda (29-sep): "AT03_Calculos_DAG está APAGADA"; (b) verificación indirecta: `A_DecisionesMotor` no tiene NINGUNA fila para VP-2026-0067 → el motor no corrió sobre la solicitud espejo. |
| G4 E2/E3 accesibles | ✅ OK | `GET /scenarios?teamId=1594725` → 200. E2 5750023 `E2_Carbone_Render v2.1` **activo** · E3 5791413 `E3_Carbone_Download_Dropbox v2.1` **activo** (nombre aún dice "sin share-link: scope pendiente" — Reauthorize ya hecho por Sergio, lo resuelve la Tarea 3). E1 5748459 inactivo (fuera de alcance). |

Nota operativa: `MAKE_BASE_URL` en `.env.local` YA incluye `/api/v2` — no volver a concatenarlo.

## Estado original por pieza

### Rama
- Partida: `feat/T-PDF-IDENTICO-20260927` @ `0f36e28`, working tree limpio.
- Tanda corre en: `feat/T-CIERRE-FINAL-20260929` (creada desde ese commit).
- Rollback: `git checkout feat/T-PDF-IDENTICO-20260927` y borrar la rama nueva.

### VP-2026-0067 (recmMzeu3eWGxyXsf · TX_Solicitudes tblaHTyMHYfmy7Fg6)
- Snapshot completo pre: `snap-VP0067-pre.json` (verificado `codigo_ext = VP-2026-0067`).
- Rollback: PATCH con los `fields` del snapshot.

### C_Formulas (tblNFa454fBbqRB3t)
- `recFcpOeKjXNunBlj` `F_UFm2_promedio` **v3.2** → snapshot `snap-formula-recFcpOeKjXNunBlj-pre.json`.
- `recliyqVJAGatkDw0` `F_DesviacionVsPromedio` **v1.0** → snapshot `snap-formula-recliyqVJAGatkDw0-pre.json`.
- Filas nuevas del fix (si se crean): `F_DesviacionVsPromedioCBR`, `F_UFm2_promedio_CBR` — rollback = DELETE (o `activa:false`). Sus record IDs se anotan aquí al crearlas (ver §Cambios aplicados).
- Rollback filas existentes: PATCH `expresion` + `version` desde los snapshots.

### Plantilla Carbone
- `PLANTILLA_MET_v2.docx` md5 `debe05352545ea8a7c0897b07927bec6`.
- `generar_plantilla_met_v2.py` md5 `32ef2ff4e59913f16db85854ba75a6af`.
- `overrides_met6283.json` md5 `496372bbb9c6e57edc17e50337accc9d`.
- templateId productivo actual (en E2): `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d` (v2). En el blueprint aparece además el hash `ed75b48ecb7d053609551a8ae4c209798e25a745aea2918f839a87da7d96b377` (template v1 histórico).
- Rollback: `git checkout` de los 3 archivos + re-apuntar E2 al templateId de arriba.

### Blueprints Make (pre-cambio, redactados)
- E2 5750023: `blueprint-pre-5750023-redacted.json` (6.422 bytes) — activo, v2.1.
- E3 5791413: `blueprint-pre-5791413-redacted.json` (16.470 bytes) — activo, v2.1.
- Rollback: re-import del blueprint pre + restaurar `isActive`.

## Cambios aplicados durante la tanda (se anota ANTES de cada cambio)

| # | Fecha/hora | Pieza | Cambio | Rollback |
|---|---|---|---|---|
| 1 | 29-sep | Plantilla (Agente A) | `generar_plantilla_met_v2.py` + `PLANTILLA_MET_v2.docx`: solo espaciado vertical portada. Nuevo template Carbone `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32` (md5 nuevos: docx `25e1c773e9cd9cf678c3e78ebdf8a363`, py `3ecde96a5162c059c832b19ffd10d690`) | `git checkout` de ambos archivos + re-apuntar E2 al template `517ddc62…434d`. Detalle: `rollback-A.md` |
| 2 | 29-sep | C_Formulas (Agente C) | PATCH `recFcpOeKjXNunBlj` (v3.3) y `recliyqVJAGatkDw0` (v2.0) · CREATE `recJvE7OEFjVoPbKN` (F_DesviacionVsPromedioCBR) y `recRN9jkhgc6UvfIR` (F_UFm2_promedio_CBR) | PATCH con snapshots pre · DELETE de las 2 filas nuevas (des-inscribe solo `formulas_resultado` por link simétrico). Detalle: `rollback-C.md` |
| 3 | 29-sep | E2 5750023 | **NO APLICADO — BLOQUEADO por el clasificador de permisos del entorno** (regla CLAUDE.md sobre E1/E2/E3; denegado tanto al Agente A como al orquestador). E2 sigue v2.1 → template viejo `517ddc62…434d`; producción NO cambió. El re-apunte al template `31f3bfab…8e32` + bump a v2.2 queda como paso manual de Sergio (instrucciones exactas en `diseno-checklist.md` §Publicación y `handoff-produccion.md`) | n/a (nada que revertir) |
| 4 | 29-sep | Evidencia (orquestador) | Render REAL Carbone prod (template nuevo + `contexto-real-v2.json` + `lang es-cl`) → `PDF_generado_VP0067_v3.pdf`. Sin escrituras en Airtable/Dropbox/Make | n/a (solo archivos de evidencia) |
