# Regresión — T-PDF-E3-GENERICOS-20260930

**Verificador (Bloque 2 · Frente B) · 30-sep-2026.** Working tree de la rama
`feat/T-PDF-E3-GENERICOS-20260930` (cambios sin commitear), sin modificar código.

## Suite completa — TODO VERDE

### `pnpm typecheck` — OK (exit 0)

```
> tsc --noEmit
(sin salida — limpio)
```

### `pnpm build` — OK (exit 0)

Build de producción Next.js completo; el árbol de rutas compila entero, incluidas las
verificadas abajo: `ƒ /tasaciones/[id]/informe`, `ƒ /tasaciones/[id]/lectura`,
`ƒ /tasaciones/[id]/estado`, `ƒ /tasaciones/[id]/fotos`, `ƒ /consola`.

### `pnpm test` — OK (exit 0)

```
 Test Files  62 passed | 3 skipped (65)
      Tests  1066 passed | 3 skipped (1069)
   Duration  117.54s
```

## Verificación por código de los ítems protegidos

| Ítem | Estado | Evidencia |
|---|---|---|
| Grilla de 16 fotos (`grillaDesdeFotosReales`) | **OK** | `lib/informe/imagenes.ts:198-240` intacta: orden asc, caption por label de `CATEGORIAS_FOTO`, fuente = thumbnail con caída a URL http(s), omisión con warn de fotos sin fuente, tope 16. Invocada desde `resolverImagenes` (`imagenes.ts:306-309`); sin filas → grilla vacía honesta. |
| Datos del informe y REF. C.B.R. | **OK** | Productor: `lib/tasador/lectura-informe.ts:387-429` (filas de comparables con `tipoReferencia`, columna Foja y Número compuesta en `fojaNumero`, líneas 422-423). PDF: `lib/informe/ensamblador.ts:446-449` separa los bloques REF. OFERTAS (`/^oferta/i`) y REF. C.B.R. (`/^cbr/i`). UI: `components/tasador/form-sections/seccion-comparables.tsx:250` renderiza `BloqueComparables titulo="Ref. C.B.R." contacto="foja"`; antecedentes legales (Fojas/N° inscripción) en `components/tasador/informe-preview.tsx:793-802`. |
| CI-057 | **OK** | Ficha en `docs/CODE_INCONSISTENCIES.md:1916` — «Dos promedios de comparables: la grilla no homogeneiza y `/informe` sí», **abierta · no bloqueante**, condicionada a A-44. El **fix CI-057 de capa PDF** (T-PDF-IDENTICO: promedios POR BLOQUE + fila TASACIÓN con `promedioSinCeros`, en vez del 30,91/161% combinado) **sigue en pie**: `lib/informe/ensamblador.ts:379` y `:425`, `lib/informe/fila-tasacion.ts`, con candados verdes en `lib/informe/ensamblador.test.ts:343` y `:358` («promedios POR BLOQUE y V/S contra el XLSM MET-6283 (−3% / +36%)») y `lib/informe/fila-tasacion.test.ts:45`. La divergencia UI deliberada (grilla simple) también sigue declarada (`lectura-informe.ts:34`, `informe-preview.tsx:279`). |
| Vista `/lectura` + estado-procesando | **OK** | `app/tasaciones/[id]/lectura/page.tsx` existe y delega en `EstadoProcesando` con `variante="lectura"` (líneas 3 y 14); `components/tasador/estado-procesando.tsx` presente. La ruta aparece compilada en el build (`ƒ /tasaciones/[id]/lectura`). |
| Botón «Descargar PDF» | **OK** | `components/tasador/informe-preview.tsx:850-858` — botón en el footer con `onClick={handleDescargarPDF}` (handler en `:400`). |
| Botón «Ver expediente» | **OK** | `components/tasador/informe-preview.tsx:860-873` — `ExpedienteSheet` con trigger «Ver expediente» (patrón `render`/trigger, sin Radix). |

## Veredicto

**OK total**: typecheck, build y tests limpios; los 6 ítems protegidos siguen intactos en
el working tree de la tanda.
