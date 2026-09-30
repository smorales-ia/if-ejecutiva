# TESTS — T-VP0067-LECTURA-FIX-20260929

> Bloque 2. Fecha: 2026-09-29. Rama `feat/T-VP0067-LECTURA-FIX-20260929` (sin commit — lo hace Sergio).

## 1 · Build y suite completa

- `pnpm build` → **limpio** (todas las rutas compilan, incluida `/tasaciones/[id]/lectura`).
- `pnpm test` → **59 archivos passed | 3 skipped · 1028 tests passed | 3 skipped** (0 rotos).

## 2 · Arreglo 1 — satisfacción por-carpeta (`app/api/tasaciones/[id]/lectura/route.ts`)

- Test co-ubicado: `pnpm vitest run "app/api/tasaciones/[id]/lectura/route.test.ts"` →
  **21 passed** (18 preexistentes + 3 nuevos: satisfecho-por-carpeta, exclusión `fecha_`,
  ausente-en-todos sigue apareciendo).
- **Verificación data-driven contra producción** (datos reales de los 8 adjuntos de
  VP-2026-0067 + catálogo real `D_TipoDocumentoAtributo`, replicando el filtro
  `FIND(..., ARRAYJOIN({tipo_documento}))` de `getAtributosPorTipo`):

| Escenario | Naranjos | Detalle |
|---|---|---|
| Hoy en producción (código viejo, sin patch A) | **13** | CBR 7 · foto SII 3 · TGR 3 — idéntico al diagnóstico §2 |
| Código nuevo desplegado, patch A pendiente | **9** | La regla por-carpeta cura `avaluo_afecto_clp` y `contribucion_total_clp` del TGR y `nombre_propietario` y `comuna` del CBR (presentes en otros adjuntos); `fecha_emision` del TGR PERMANECE por la exclusión `fecha_` (naranjo honesto) |
| Código nuevo + patch A aplicado (estado final) | **6** | CBR: Notaria, CBR (nombre_cbr) · foto SII: Material Predominante, Anio de Construccion, Superficie Construida · TGR: Fecha Emision — **todos honestos** (datos que de verdad no están en los documentos) |

## 3 · Arreglo 2 — veto Word en la subida (`app/api/adjuntos/upload/route.ts`)

- Test co-ubicado creado: `pnpm vitest run app/api/adjuntos/upload/route.test.ts` → **5 passed**:
  mime docx → 400 · mime `application/msword` → 400 · `algo.DOCX` + `application/octet-stream`
  → 400 · el veto no llega a Dropbox/Make · PDF válido pasa (200, Make mockeado invocado).
- Literal §6 verificado carácter a carácter:
  `"Este archivo está en Word y no podemos leerlo. Súbelo en PDF o como imagen (JPG o PNG)."`
- Los componentes cliente (`file-upload-zone.tsx`, `document-checklist.tsx`) ya restringían a
  PDF/JPG/PNG (accept + validar()); no se tocaron. El hueco cerrado era el Route Handler.

## 4 · Datos VP-0067 (sub-bloque A)

- **BLOQUEADO — patch NO aplicado** (gate de permisos de la sesión; ver
  [`patch-pendiente-A.md`](patch-pendiente-A.md)). Verificado post-denegación que el record
  `rec7t6MPxKu10WniF` quedó **intacto**: `ultima_modificacion` sigue en
  `2026-09-29T23:04:55.000Z`, `items[]` = solo la terna 13291/21565/2006, `no_extraidos` = 9 códigos.
- Terna del informe: **intacta por construcción** (ningún write llegó a producción).

## 5 · Regresión informe / PDF

- Cero escrituras aplicadas en producción durante la tanda (la única intentada fue denegada
  y se verificó el record sin cambios). El informe y el PDF de VP-0067 no fueron tocados.

## 6 · Smoke UI (lectura.png)

- **NO PRODUCIBLE en esta sesión**: `/tasaciones/[id]/lectura` está detrás de Clerk y no hay
  credenciales de usuario de prueba disponibles headless (las keys de `.env.local` son de la
  app, no de un usuario). Sustituto de evidencia: la simulación data-driven del §2, que
  reproduce el cálculo exacto de `nombres_datos_faltantes` del server con datos y catálogo
  reales. La verificación visual queda para Sergio post-deploy (URL en el cierre).
