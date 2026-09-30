# Auditoría ciega — T-PDF-E3-GENERICOS-20260930

**Auditor:** Bloque 3 (auditor ciego) · **Fecha:** 2026-09-30 · **Rama:** `feat/T-PDF-E3-GENERICOS-20260930`
**Método:** verificación desde el estado final real (working tree + Make API + Airtable REST), sin leer reportes ni planes de otros agentes de la tanda. Timestamps de Make/Airtable en UTC.

## Veredicto por criterio

| Criterio | Veredicto |
|---|---|
| A1 · E3 activo | **FAIL** |
| A2 · Cola del webhook limpia | **FAIL** |
| A3 · onerror en createShareLink | **FAIL** |
| A4 · Emisión reciente exitosa y re-emisión que no rompe | **FAIL** (éxito hubo; la re-emisión rompió) |
| B1 · Ranuras desde fuentes vivas + UI mismo origen | **OK** |
| B2 · Sin hardcode vivo por código de solicitud | **OK** |
| B3 · Fuentes pobladas en Airtable y aportables sin código | **OK** (nota sobre firma) |
| C1 · typecheck/build/test verdes | **OK** |
| C2 · Alcance del diff coherente; referencias intactas | **OK** |
| C3 · Otras solicitudes intactas | **OK** |

**Resumen:** el frente GENÉRICOS (B) y la salud del repo (C) pasan completos. El frente MAKE (A) falla en sus cuatro criterios en el estado observado: E3 quedó **inactivo e inválido** tras un error 409 de Dropbox en `createShareLink` (sin manejo de error), con **1 llamada encolada** en el webhook.

---

## (A) Frente Make — E3 scenario 5791413 · hook 3063524

### A1 — FAIL · E3 NO está activo

`GET /scenarios/5791413` (team 1594725):

```
name:     "E3_Carbone_Download_Dropbox v2.2 - share-link publico"
isActive: false
isinvalid: true
lastEdit: 2026-09-30T00:55:06.946Z
hookId:   3063524
scheduling: immediately
```

`isActive=false` e `isinvalid=true`. El escenario fue editado hoy (00:55 UTC) a la v2.2 "share-link publico" y quedó caído tras el error de A4.

### A2 — FAIL · Cola con 1 mensaje pendiente

`GET /hooks/3063524`:

```
name: wh_E3_Carbone_Download_Dropbox · enabled: true
queueCount: 1  (queueLimit 667)
```

`GET /hooks/3063524/incomings`: 1 incoming `cf430c8d435875f253728e0c981e3a72`, creado `2026-09-30T01:12:27.576Z`, 208 bytes — encolado en el mismo instante en que la ejecución fallida terminó y el escenario se desactivó.

### A3 — FAIL · Sin onerror en el módulo dropbox:createShareLink

`GET /scenarios/5791413/blueprint` (live, version 24; no existe draft — `blueprint: null` con `?draft=true`). Flujo completo y sus handlers:

```
1 gateway:CustomWebHook      | onerror: no
2 http:ActionSendData        | onerror: no
5 dropbox:uploadLargeFile    | onerror: no
9 dropbox:createShareLink    | onerror: no   ← criterio A3
7 http:ActionSendData        | onerror: no
8 http:ActionSendData        | onerror: no
4 http:ActionSendData        | onerror: no
```

Ningún módulo del blueprint tiene `onerror` poblado. El módulo 9 es exactamente el que falló en A4.

### A4 — FAIL · Hubo emisión exitosa hoy, pero re-emitir SÍ rompe

`GET /scenarios/5791413/logs` (extracto de hoy, UTC):

| Timestamp (UTC) | Tipo | Status | Ops | Detalle |
|---|---|---|---|---|
| 2026-09-30T00:55:06 | modify | — | — | Edición a v2.2 (agrega createShareLink) |
| 2026-09-30T00:59:45 | auto | **1 (success)** | 7 | Emisión exitosa post-edición |
| 2026-09-30T01:12:22 | auto | **3 (error)** | 4 | Re-emisión: falla en módulo 9 |
| 2026-09-30T01:12:27 | warning | — | — | Desactivación del escenario |

Detalle del run fallido `5bd3ef23924d4297a7ff18a70b5d9a66`:

```
error.name: RuntimeError
error.message: [409] Share link already exists and cannot be updated or returned
  by this module. To update or revoke an existing link, use the
  'Update/Revoke a Share Link' module.
  Link URL: https://www.dropbox.com/scl/fi/5nqngrsjdfelbtuic7s9b/FRANCISCO-JOS-VERGARA-UNDURRAGA_METLIFE-6283.pdf?...
causeModule: createShareLink (dropbox)
isReplayable: true
```

Secuencia empírica: la primera emisión tras la edición creó el share-link (éxito, 7 ops); la **re-emisión** del mismo PDF chocó con el 409 "link ya existe" en `createShareLink`, que **no tiene onerror** (A3), lo que abortó la ejecución en el módulo 4º de 7, **desactivó el escenario** (A1) y dejó la siguiente llamada **encolada** (A2). La re-emisión es un caso de uso declarado de la tanda y hoy rompe el pipeline completo.

---

## (B) Frente genéricos — VP-2026-0067 (`recmMzeu3eWGxyXsf`)

### B1 — OK · Ranuras desde fuentes vivas; UI y PDF comparten origen

Cadena verificada en el working tree:

- **`lib/informe/imagenes.ts`** — resolutor puro. `RANURAS_FOTO` (6 ranuras fotográficas) resuelve por categoría de `TX_Adjuntos.descripcion` + `orden` asc; `RANURAS_ANEXO` (13 ranuras documentales) casa `clave_adjunto` contra códigos de `D_TipoDocumento` vía `resolverAnexos()`; firma llega ya resuelta como parámetro. `fuenteRenderizable()` sólo acepta `http(s)://` o `data:image/`. Ranura sin fuente → `null` (vacío honesto). Sin ningún acceso a assets del repo ni ramas por código de solicitud.
- **`lib/tasador/lectura-informe.ts`** — el modelo canónico produce `anexosRanuras` (línea 454: `resolverAnexos()` sobre los adjuntos no-foto con `clave_adjunto`/`thumbnail_url`) y `firmaTasadorUrl` (línea 301: `leerFirmaTasador()` lee `M_Tasadores.firma_url` del tasador linkeado, filtrada por `fuenteRenderizable`, degrada a `null` sin romper).
- **`lib/informe/ensamblador.ts`** — importa `construirInforme` del mismo módulo (línea 64) y llama `resolverImagenes(codigo, fotos, informe.anexosRanuras, informe.firmaTasadorUrl)` (líneas 473-477). El payload Carbone consume el MISMO objeto que la UI.
- **`components/tasador/informe-preview.tsx`** + **`app/tasaciones/[id]/informe/page.tsx`** — la página cablea `anexosCanonico = resInforme.informe.anexosRanuras` y `firmaCanonico = resInforme.informe.firmaTasadorUrl` (page.tsx:94-95) al preview; la sección 9 «Anexos del informe» (preview:829-834) mapea `anexosCanonico` con `AnexoMiniatura`, y la firma se pinta desde `firmaCanonico` (preview:812-815). Mismo origen que el PDF, sin lectura paralela.

### B2 — OK · Sin hardcode vivo en el camino de imágenes

`grep -rn "met6283\|VP-2026-0067\|ASSETS_POR_CODIGO" lib/ components/ app/`:

- `ASSETS_POR_CODIGO`: **cero hits** — el fallback por-código fue eliminado.
- `lib/informe/ensamblador.test.ts:62` (`GOLDEN_MET6283`), `lib/tasador/motor-at01-at08-integ.test.ts:105`, `app/api/tasaciones/[id]/generar-pdf/route.test.ts:28` — **tests/fixtures**, aceptables. `lib/informe/golden-met6283.ts` no lo importa ningún módulo no-test.
- `lib/informe/overrides.ts` — override de **TEXTOS** por código (`overrides_met6283.json`), aceptable según el criterio. Verifiqué el JSON: claves de nivel 1 = `partes, rentabilidad, textosIA, recintos, cualitativa`; **ninguna clave de imagen** (`imagenes`, `fotos`, `firma`, ranuras de anexo) — las apariciones de "Anexo" son atributos cualitativos de texto (`construccionAnexo*`). El camino de imágenes queda 100 % genérico.

### B3 — OK · Fuentes pobladas en Airtable; aportables sin tocar código

`TX_Adjuntos` (`tblur71x1oItbmKZc`) filtrado `{solicitud}="VP-2026-0067"` → 36 filas:

- **Fotos con `thumbnail_url` renderizable por categoría:** `mapa_ubicacion`: 1 · `fachada_exterior`: 5 · `mapa_referencias`: 1 · `ofertas_comparables`: 3. Las 6 ranuras fotográficas tienen fuente.
- **Los 13 códigos de anexo, todos con thumbnail renderizable:** foto_plano_cuadro_superficies, esquema_superficies, cuadro_superficies, planta_emplazamiento, foto_aerea, mapa_sii (creados 30-sep), foto_fuente_sii, permiso_edificacion, informe_no_expropiacion_serviu, certificado_recepcion_final, certificado_deuda_tgr (del 22-sep), certificado_avaluo_fiscal, escritura_compraventa (30-sep). 13/13 OK.
- **Firma:** tasador linkeado `recTJcV3BIvdcG4em` (M_Tasadores) con `firma_url` poblado — data-URI JPEG de 6.835 chars (renderizable por `fuenteRenderizable`).

**¿Cliente nuevo sin tocar código?** Sí en los tres rieles:
- Fotos: las 4 categorías existen en el catálogo `CATEGORIAS_FOTO` del organizador del tasador (`lib/tasador/tasaciones.ts:912-922`) — subida por UI.
- Anexos: los 13 códigos existen en la tabla viva `D_TipoDocumento` (`tblkPhBnpdDmUWOl3`, 25 tipos — verificado 13/13 presentes); el checklist (`components/console/document-checklist.tsx`) consume ese catálogo y `app/api/adjuntos/upload/route.ts` persiste `thumbnail_url` tras la subida (líneas 339-374) — subida por UI.
- Firma: campo de perfil `M_Tasadores.firma_url`. **Nota:** no encontré UI para subirla (el preview lo declara: «Se agrega desde tu perfil», preview:821); hoy se carga como dato de perfil en Airtable. Cumple el criterio («campo de perfil»), pero es deuda de UX.

---

## (C) Nada más se rompió

### C1 — OK · Pipeline verde (corrida en serie del auditor, 30-sep)

```
pnpm typecheck → exit 0 (tsc --noEmit, sin salida)
pnpm build     → exit 0 · "✓ Compiled successfully in 35.8s" · static pages 5/5, sin errores ni warnings
pnpm test      → exit 0 · Test Files 62 passed | 3 skipped (65)
                          Tests 1066 passed | 3 skipped (1069) · vitest 4.1.10 · 116s
```

Re-verificados en la misma pasada final: A1 (`isActive=false`), A2 (`queueCount=1`, incoming
`cf430c8d…` intacto), A3 (módulo 9 sin `onerror` en el blueprint live) y A4 (último log
01:12:22Z status 3; sin ejecuciones posteriores) — sin cambios respecto de lo documentado arriba.

### C2 — OK · Diff coherente con el alcance

`git diff --stat`: 17 archivos, 932+/282− — todos de informe/adjuntos/preview/tests: `lib/informe/{imagenes,ensamblador,tipos}.ts` + tests, `lib/tasador/{lectura-informe,tasaciones}.ts` + tests, `components/tasador/informe-preview.tsx`, `components/console/document-checklist.tsx`, `lib/adjuntos-uploader.ts`, `app/api/adjuntos/upload/route.ts`, `app/tasaciones/[id]/informe/page.tsx`. Nada fuera de alcance.
`git status docs/_referencias docs/_artefactos/carbone` → **sin cambios** (intactos). Untracked: sólo la evidencia y el plan de la propia tanda.

### C3 — OK · Otras solicitudes intactas

`TX_Adjuntos` filtrado por los 13 códigos de la tanda, en toda la tabla:

- Filas creadas **hoy (30-sep UTC)**: 8, **todas** de `recmMzeu3eWGxyXsf` (VP-2026-0067).
- Otras 7 solicitudes tienen alguna fila con esos códigos, todas con fechas previas (13-jul a 10-sep) — preexistentes, ninguna nueva hoy.

---

## Observación final

El frente B quedó bien resuelto y verificable end-to-end (mismo objeto para UI y PDF, cero hardcode vivo, seed completo en Airtable). El frente A está **caído en producción** en el momento de esta auditoría: la adición del share-link público (v2.2) sin `onerror` en `createShareLink` hace que cualquier **re-emisión** del mismo PDF derribe E3 (409 de Dropbox → escenario inválido/inactivo → cola creciendo). Remediación evidente (fuera del alcance de este auditor, que no escribe en Make): agregar manejo de error al módulo 9 (ignore/resume con recuperación del link existente vía «Update/Revoke a Share Link» o `list shared links`), reactivar el escenario y drenar el incoming encolado.
