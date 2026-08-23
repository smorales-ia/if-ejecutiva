# Snapshot P7-TAS.A.1 · freeze 23-ago-2026

> Nota operativa con fecha. Como toda nota de `docs/_notas/`, describe lo que era cierto **este
> día**: sirve para reconstruir el porqué, nunca para afirmar el estado de hoy (RO-24).

## Estado del repo

| | |
|---|---|
| **Rama** | `feat/tasador-ui` |
| **Último commit** | `6645fa2` — *refactor(P7-TAS.0): muda lib/tasaciones a lib/tasador/ · cierra ambigüedad R5* |
| **Working tree** | **LIMPIO**. No hay diff de .A.1 escrito |
| **Baseline** | **31 archivos · 564 tests** · `pnpm tsc --noEmit` exit 0 |

## Dónde quedamos

**P7-TAS.A.1 · diff propuesto y APROBADO conceptualmente. No escrito.**

Al reanudar, ejecutar tal cual el diff que Claude Code propuso en la sesión del 23-ago-2026:
**4 archivos · ~200 líneas movidas · ~20 agregadas · 0 tests nuevos.**

## Decisiones tomadas (no revisitar)

- **Server-side, no cliente.** Precedente **CI-030** (`lib/tasador/lectura-tasacion.ts`). La opción
  cliente —`fetch` en `useEffect` + `Set` de tocados— mitigaba la carrera entre hidratación y
  tecleo; la server-side la elimina.
- **Los 4 archivos:**
  1. `lib/tasador/lectura-datos.ts` **(nuevo)** — proyección extraída de
     `app/api/tasaciones/[id]/datos/route.ts:243-381`, más `filasDeSolicitud`, `TIPO_RECINTO` y
     `CATEGORIAS_RECINTO`. Exporta `proyectarDatosCaptura(id, fields)` y
     `leerDatosCaptura(id)`, esta última devolviendo `null` ante cualquier fallo, **mismo
     contrato que `leerTasacion`**. Devuelve `{ codigo, datos: Partial<InformeData>, derivados }`
     **estructurado y no plano**: `derivados.dfl2` es `'SI'/'NO'` mientras `InformeData.dfl2` es
     `boolean`, e `id`/`codigo` no son claves de `InformeData`.
  2. `app/api/tasaciones/[id]/datos/route.ts` — refactor. El `GET` queda en **9 líneas**,
     **conservando el envoltorio `{ data }` de `ok()`**, el 403/404 diferenciado de `desdeGuard` y
     el `catch` con el literal humano de §6.5. El aplanado
     `ok({ id, codigo, ...datos, derivados })` mantiene la respuesta **byte a byte idéntica**.
     El `PATCH` no se toca: sólo cambia de dónde importa los tres símbolos movidos.
     `slug` y `sincronizarHijas` **se quedan** — los usa sólo el `PATCH`.
  3. `app/tasaciones/[id]/page.tsx` — `Promise.all([leerTasacion(id), leerDatosCaptura(id)])` y
     `informeInicial = { ...resolverInforme(tasacion), ...(guardados?.datos ?? {}) }`.
  4. `components/tasador/tasacion-form.tsx` — **2 líneas**: recibe la prop `informeInicial` y la
     usa en el `useState`. Deja de importar `resolverInforme`. Es el único consumidor de
     `TasacionForm`, así que la prop no rompe a nadie.
- **DEFAULT 1 aceptado: doble guard en el `Promise.all`.** `leerTasacion` ya llama
  `autorizarSolicitud` internamente (`lectura-tasacion.ts:588`) y `leerDatosCaptura` lo llamaría
  otra vez: **+1 `getRecord`**. Cambiar la firma de `leerTasacion` queda **fuera de scope**. El
  paralelo es además más rápido en tiempo de pared: 2 viajes en vez de 3. Coste total de la
  página ≈ 13 requests.
- **DEFAULT 2 aceptado:** `lectura-datos.ts` aloja `filasDeSolicitud`, `TIPO_RECINTO` y
  `CATEGORIAS_RECINTO`. **No se crea `datos-comunes.ts`.**
- **Tensión de nombre declarada:** un módulo llamado `lectura-datos` exporta dos constantes que el
  `PATCH` usa para **escribir**. Son tablas de mapeo compartidas y `lectura-tasacion.ts` ya sentó
  el precedente. Queda dicho **en su docblock**, no se resuelve con un archivo más.

## Bloqueos y notas anotadas para más adelante

- **T-A.3-1 · 37 campos huérfanos.** Los 23 de **CI-023** más los 14 booleanos de `Comodidades`
  **no vuelven de `GET /datos`** —no tienen columna destino— y hoy sobreviven **sólo en el
  borrador de `localStorage`**. Antes de que .A.3 llame a `clearPayload()` hay que decidir entre
  **no borrar mientras `noPersistidos[]` venga con contenido** y **conservar ese subconjunto**.
  **No se resuelve en .A.1 ni en .A.2.**
- **Regla T-B · "Pre-llenado · editable" queda sólo para defaults reales** (sección E · .F). Un
  dato que el tasador guardó es suyo, no una sugerencia. Con la hidratación server-side el badge
  **no aparece sobre lo hidratado sin escribir una línea extra**: `TextField` calcula `prellenado`
  desde `useState(value)` en el montaje (`fields.tsx:155`) y el valor ya está en el primer render.
  **Registrar la aclaración en `docs/aprendizajes.md` al ejecutar .A.1.**
- **`GET /datos` queda sin consumidor interno post-.A.1.** Hoy tampoco lo llama nadie —sólo
  aparece en comentarios y en su propio test— y después del refactor la página usa el helper
  directamente. **Se conserva por contrato documentado** y porque comparte archivo con el `PATCH`.
  **No es hallazgo para .E.**
- **Prueba manual de .A.1:** limpiar la clave `vp.tasador.informe.{id}` de `localStorage` **antes**
  de abrir la tasación. La inicialización sigue siendo `readPayload(id) ?? informeInicial`, de modo
  que un borrador viejo **shadowea** lo hidratado y la prueba mediría el borrador en vez del
  servidor. La regla corregida de recuperación entra en **.A.3**.

## Orden de sub-bloques P7-TAS.A (aprobado)

| | | |
|---|---|---|
| **.A.1** | Hidratación server-side | ← **retomar acá** |
| .A.2 | `use-guardado.ts` + store v2 | |
| .A.3 | Cablear en `tasacion-form` + banner de recuperación | |
| .A.4 | Absorber `fotos-screen` (cruce a **P5-TAS** declarado) | |
| .A.5 | Absorber `informe-preview` (cruce a **P9-TAS** declarado) | |

## Protocolo de reanudación

1. Leer este snapshot.
2. Leer `docs/_md/plan_ejecucion_UItasador_v1.3.md` §8.
3. Confirmar baseline: `git status` limpio · `pnpm tsc --noEmit` → 0 · `pnpm test` →
   **31 archivos · 564 tests**.
4. **Ejecutar el diff de .A.1 tal cual quedó propuesto. No re-diseñar. No repropuesta. Escribir.**
5. Cerrar con los 3 checks + la prueba manual del apartado de bloqueos.
