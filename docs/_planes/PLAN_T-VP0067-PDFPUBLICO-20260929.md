# PLAN — T-VP0067-PDFPUBLICO-20260929

> Cerrar el último tramo de VP-2026-0067: botón "Descargar PDF" con link PÚBLICO de
> Dropbox + carga del dato pendiente (D6c). Fase 1: 3 auditores en paralelo, 29-sep-2026.

## §1 · Qué cambia E3 v2.2 (preparado, NO aplicado — ver §6)

E3 v2.1 (scenario 5791413, ACTIVO; blueprint pre guardado en
`docs/_evidencia/T-VP0067-PDFPUBLICO-20260929/blueprint-e3-v21-pre.json`, tokens
redactados) construye a mano la URL `dropbox.com/home?preview=` en los módulos 7
(PATCH TX_Solicitudes) y 8 (POST TX_DocumentosGenerados). Flow real: 1→2→5→7→8→4.

Diff v2.2 (verificado contra el catálogo vivo de Make, template público 13566):
- Módulo nuevo id 9 `dropbox:createShareLink` v5 entre el upload (5) y el PATCH (7):
  `path = /VProperty/Tasaciones/{{1.nombre_cliente}}_{{1.numero_solicitud}}.pdf`,
  visibility public. Salida: `{{9.url}}` (termina en `?dl=0` = preview público sin login).
- Remapeo módulo 7: `pdf_final_url` → `{{9.url}}` (antes URL /home a mano).
- Remapeo módulo 8: `url_pdf` → `{{9.url}}`. **`url_dropbox` NO se toca** (path auditable §8.1).
- Name bump: `E3_Carbone_Download_Dropbox v2.2 - share-link publico`.
- Aplicación: `PATCH /scenarios/5791413` body `{"blueprint":"<json string>"}` con curl
  (no urllib — Cloudflare 1010). El escenario queda activo tras el PATCH (evidencia E2 29-sep).
- Recomendación dl=0 (preview público con botón de descarga); no transformar la URL.

## §2 · PATCH del dato (D6c) — inequívoco

`TX_DatosTasacion` tblMoK3mFuwN8Yr1A / recy8q3Tq9omjdNUf:
`arriendo_mensual` (fldZYdbx65RphuCWk, number) = 3300000 · `gasto_anual`
(fldl7MLJVn74uRfQh, number) = 3300000 → `ingreso_liquido_anual` (fórmula
`{arriendo}*12-{gasto}`) pasa sola de 0 a 36.300.000. Origen oráculo: Portada!BJ38 /
BJ40 / BJ43 del XLSM (renta perpetua BJ44 = 806.666.666,67 ya cuadra con TX_Calculos).
Efectos colaterales: solo la sección H del formulario tasador, que pasa de vacía al
espejo; el PDF NO cambia (ensamblador lee `*_clp` y TX_Calculos, ya poblados).

## §3 · Cómo llega el link público al botón

El botón "Descargar PDF" lee EXCLUSIVAMENTE `TX_Solicitudes.pdf_final_url`
(lectura-tasacion.ts:462 → informe-preview.tsx:276-282; sin validación de formato).
Campos a poblar con el share-link cuando exista: `pdf_final_url` (recmMzeu3eWGxyXsf)
+ `url_pdf` (fila vigente recYasPnZWAAoA3pW) — cubre tasador y panel ejecutiva
(fila "Informe PDF" y "Versiones del informe"). `url_dropbox` se conserva como path.

## §4 · Tests

(a) HEAD/GET del share-link en limpio (sin cookies): 200 y página pública (no /login).
(b) `ingreso_liquido_anual` = 36.300.000 vía GET post-patch. (c) `pdf_final_url` y
`url_pdf` (vigente) contienen el share-link. (d) Una sola fila `es_vigente=true`.

## §5 · Rollback

Snapshot pre en `docs/_evidencia/T-VP0067-PDFPUBLICO-20260929/` (blueprint E3 +
snap-pre-datostasacion.json). D6c revert: PATCH con ambos campos null. E3 revert:
re-PATCH del blueprint v2.1 guardado. Links revert: valores del snapshot.

## §6 · GATE

- G1 credenciales .env.local: OK. **PERO la conexión Dropbox 7553318 NO tiene
  `sharing.write`** (GET /connections/7553318 doble-verificado 29-sep, posterior al
  Reauthorize: scopesCnt=4 — el Reauthorize de Make NO amplía el grant OAuth).
  La premisa del mandato ("reautorizada con scope de compartir") es FALSA.
- G2 diff E3 v2.2 claro y reversible: OK (preparado en §1, parametrizado por conexión).
- G3 PATCH del dato inequívoco: OK.
- G4 campo del botón conocido: OK.

**VEREDICTO: pieza E3/link público DETENIDA** — aplicar v2.2 hoy fallaría con
`missing_scope`. Acción de Sergio requerida (OAuth interactivo, no automatizable):
en Make → Connections → **"Add" / crear conexión Dropbox NUEVA** con la cuenta
nutricionsaludketo@gmail.com (el flujo nuevo pide el set completo de scopes, incluido
sharing.write) — NO sirve el botón Reauthorize de la conexión vieja. Con el id de la
conexión nueva, la tanda siguiente aplica §1 + corrida + tests (~15 min).
**Pieza D6c: SE EJECUTA** (independiente de Dropbox, autorizada explícitamente).
