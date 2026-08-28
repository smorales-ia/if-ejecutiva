# Aprendizajes · P9-TAS · CI-063 (divergencia preview ↔ modelo canónico)

**Tanda:** P9-TAS · frente **CI-063** (alcance MÍNIMO)
**Fecha/hora:** 2026-08-28 15:18 -04
**Duración aprox.:** una sesión
**Modo:** ESCRITURA autorizada · contrato 🟡 pausa-en-commit
**Rama:** `feat/tasador-ui`

---

## Qué se construyó

Cierre de **CI-063**: la vista previa del informe (`components/tasador/informe-preview.tsx`)
mostraba el cap rate como «—» porque lo calculaba en el cliente con
`(arriendo·12 − gasto) / valorReferenciaClp`, y `valorReferenciaClp` está en
`CAMPOS_SIN_DESTINO` (CI-023 §1): no tiene columna, nunca se hidrataba, el denominador
quedaba 0.

Se cableó el **bloque 2** (valor destacado + cap rate) al **modelo canónico** del informe,
que trae el cap rate **almacenado** (`tasa_cap_rate_override ?? tasa_cap_rate`) y no necesita
`valorReferenciaClp`.

### Archivos

| Archivo | Tipo | Cambio |
|---|---|---|
| `lib/tasador/lectura-informe.ts` | NUEVO | Productor canónico extraído del route: `construirInforme(id, solicitud)` puro + `lecturaInforme(id)` con guard. Expone `InformeCanonico` con `valorDestacado` tipado (bloque 2) y `bloques[]`. |
| `lib/tasador/lectura-informe.test.ts` | NUEVO | Estructura de los 8 bloques + cap rate desde el almacenado + candado paralelo: `valorReferenciaClp` no participa del cap rate canónico. |
| `app/api/tasaciones/[id]/informe/route.ts` | MODIFICADO | Delega en `lecturaInforme`. Contrato de respuesta **idéntico** (5 claves; `valorDestacado` no se expone en el JSON). |
| `app/tasaciones/[id]/informe/page.tsx` | MODIFICADO | 4.ª lectura en el `Promise.all`; pasa `valorCanonico` (bloque 2) al preview. Docblock del cap rate reescrito. |
| `components/tasador/informe-preview.tsx` | MODIFICADO | Bloque 2 consume `valorCanonico`; retirado el cómputo cliente `netoAnual/valorReferenciaClp`; docblock de acotación. |
| `docs/CODE_INCONSISTENCIES.md` | DOCS | CI-063 cerrada; CI-016 y CI-017 ampliadas con el síntoma en código (sin fix). |

---

## Decisiones técnicas

- **Extracción, no self-fetch (vía técnica aprobada).** El route no se llama a sí mismo por
  HTTP; el productor vive en `lib/` y lo consumen route y page. El test corre directo contra
  `construirInforme`, mockeando sólo `listRecords` — mismo patrón que el candado de
  `lectura-datos.test.ts:208`.
- **`construirInforme` puro (sin guard) + `lecturaInforme` con guard.** Separar el productor
  del guard permite testear la aritmética pasando `fields` directo, sin mockear
  `autorizarSolicitud`. `lecturaInforme` devuelve una unión discriminada
  `{ ok:false, guard } | { ok:true, informe }` para que el route traduzca el fallo con
  `desdeGuard` y preserve el contrato HTTP (403/404) exacto.
- **Contrato del route idéntico.** El lib también expone `valorDestacado`, pero el route
  responde sólo las 5 claves originales. Additivo hubiera sido seguro (el route no tiene
  consumidores), pero "idéntico" era el mandato, así que se respetó al pie.

## Acotación deliberada (alcance MÍNIMO · aprobado por Sergio)

- **Sólo el bloque 2** se cabla al canónico.
- **Bloques 4 (avalúo SII) y 8 (antecedentes legales):** siguen desde el modelo cliente. El
  preview hoy **no** muestra avalúo/contribución ni fojas/inscripción; migrarlos es
  **P9-TAS.B** (construcción visual §10.3). El productor los calcula igual (son parte del
  contrato del route) pero el preview no los consume.
- **Bloque 6 (comparables):** la grilla `SeccionComparables` mantiene su promedio **simple**.
  No se alinea al homogeneizado del canónico **a propósito**: esa divergencia es **CI-057**,
  abierta y condicionada a **A-44** (Héctor). Alinearlos sin esa respuesta cambiaría el número
  que el visador firma sobre una duda abierta.

## Cambio observable a vigilar

`valorUf` del bloque 2 pasó de caer a `tasacion.valorEstimadoUf` a leer `valor_comercial_uf`
del canónico (con override por delante). En filas sin `valor_comercial_uf` —hoy la mayoría, por
el docblock del route— el valor destacado muestra «—» (estado ausente honesto, §10.1 · decisión
1) en vez del estimado. Es el comportamiento canónico correcto, pero es un cambio visible
respecto de antes de la tanda.

## Fuera de alcance · sólo documentado (NO corregido)

Al tocar `informe-preview.tsx` se confirmaron dos violaciones **preexistentes**, ajenas a
CI-063, que **no** se arreglaron (fuera del frente) y se documentaron en sus fichas:

- **CI-016:** `handleDescargarPDF` cae en `window.print()` cuando no hay `pdfUrl`
  (`informe-preview.tsx`, buscar `window.print`). Prohibido por RF-TAS-21 / §10.3.
- **CI-017:** `handleEnviar` hace `setTimeout(() => router.push("/tasaciones"), 2500)` (buscar
  `setTimeout`). Redirección automática prohibida por RF-TAS-22 / §10.3.

Ambas quedan para el frente que construya el footer/envío de §10.3 (P9-TAS.B).

## Deuda para tandas siguientes

- **P9-TAS.B:** construcción visual completa del preview §10.3 → migrar bloques 4 y 8 al
  canónico, y **arreglar** CI-016 (quitar `window.print`) y CI-017 (quitar el `setTimeout`).
- **CI-057 / A-44:** decisión de producto sobre el promedio de comparables (Héctor).

## Reglas candidatas a migrar a `docs/aprendizajes.md`

- Nada nuevo que amerite `→ MIGRAR`: la lección (extraer productor a `lib/` cuando dos
  superficies necesitan la misma aritmética; testear el productor puro mockeando sólo
  `listRecords`) ya es el patrón vigente del repo (`lectura-datos.ts`).
