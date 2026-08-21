# Plan Frente C — RF-TAS-05 · Lectura de coordinación en IF-02

Estado: ✅ **FRENTE CERRADO — 21-ago-2026.** C1, C2, C3 y C4 ejecutados, mergeados a `main`,
deployados en Railway y **verificados visualmente en producción** con `VP-2026-0061`.
Baseline final: **452 tests verdes**, `tsc` limpio, `pnpm build` compila.

Fecha de esta versión: 2026-08-21
Branch de trabajo: `feat/coordinacion-ejecutiva` (mergeado a `main`)
Contexto: RF-TAS-05 (visibilidad de coordinación para la ejecutiva). CI-012 cerrada positiva
(19-ago-2026). `TX_CoordinacionVisita` (`tblBwMErRxo57ML2r`) existe, 0 filas al 2026-08-21.

## Decisión de arquitectura (fija para todo el Frente C)

La "vigencia" de la coordinación **se computa server-side**, no en el schema de Airtable.

- Airtable rollup **no soporta `LAST`/`FIRST`** ni acceso posicional, y no hay formulas cross-table.
  Ver aprendizaje 2026-08-21 en `docs/aprendizajes.md`. Por eso `coordinacion_vigente` **no** se
  convirtió en derivado.
- `TX_Solicitudes.coordinacion_vigente` (singleSelect, `fldI4Dv0jpRQvbdHl`) queda **idéntico al pre-C1**.
  Lo sigue escribiendo la ruta del tasador (`app/api/tasaciones/[id]/coordinacion/route.ts`). **IF-02 NO
  lo lee.** Es redundancia inofensiva del lado tasador; no se toca.
- El desenlace vigente y el historial de intentos que IF-02 necesita salen **directo de
  `TX_CoordinacionVisita`**, leída y ordenada en el Route Handler.

## Estado de C1 — ✅ CERRADO (21-ago-2026)

Reducido a: revertir el rename (base limpia) + registrar aprendizaje + reescribir este plan. **No tocó
código, tests ni field-ids.** Ver `docs/_notas/cierre-C1.md`.

---

## C2 · Lectura server-side de coordinación para IF-02 — ✅ CERRADO (21-ago-2026)

> **Ejecutado en dos bloques.** `378fd91` (B1 · lectura) y `7ab6927` (B1.5 · shape `{ data }`).
> Entregó `lib/coordinacion-airtable.ts` (`fetchCoordinacionSolicitud`),
> `app/api/solicitudes/[id]/coordinacion/route.ts` (GET) y `FIELD_IDS_COORDINACION_VISITA`.
> **Desvío respecto de este plan:** la fusión en `lib/historial-airtable.ts` que el punto
> *"Toca"* le asignaba a C2 **se difirió a C4** por territorio R5, y allí se ejecutó (DUDA-3).
> B1.5 uniformó la respuesta a `{ data: … }` para alinearla con `eventos/`, `sla/` y
> `decision-motor/` → destilado como **RO-38**.


- **Objetivo:** exponer, por solicitud, (a) el desenlace de coordinación vigente y (b) la lista de
  intentos para el timeline.
- **Cómputo:** leer `TX_CoordinacionVisita` (`tblBwMErRxo57ML2r`) filtrando por la solicitud
  (por `solicitud_record_id` / link `solicitud`), **ordenando por `fecha_respuesta DESC`**.
  - `coordinacionVigente` = `estado_coordinacion` de la fila más reciente, o `null` si no hay filas.
  - Lista de intentos (todas las filas, con `estado_coordinacion`, `fecha_respuesta`, `motivo`,
    `detalle`/`nota`, `intento_numero`) → alimenta el timeline de la pestaña Historial (C4).
- **Toca:** nuevo lector en `lib/` (p.ej. `lib/coordinacion-airtable.ts`) + su test co-ubicado. Fundir
  los eventos de coordinación en `lib/historial-airtable.ts` (hoy `fetchHistorialSolicitud` sólo lee
  A_Eventos + A_Cambios; el comentario 165-177 documenta que la coordinación "no se lee todavía").
- **NO toca:** schema Airtable · la ruta del tasador · `coordinacion_vigente` (singleSelect) · UI.
- **Precondición:** para validar end-to-end hace falta ≥1 fila de prueba en `TX_CoordinacionVisita`
  (escribe Airtable → decisión aparte, hoy 0 filas). Los tests unitarios se cubren con mocks.
- **Verificable:** `pnpm tsc --noEmit && pnpm build && pnpm test` verde + test unitario del lector
  (mapea filas → items ordenados por `fecha_respuesta`; caso 0 filas → `null`).
- **Commit sugerido:** `feat(cu-002): lee TX_CoordinacionVisita y funde la coordinación en el historial (RF-TAS-05)`

## C3 · UI pestaña Datos — bloque "Coordinación" (§1.3.2) — ✅ CERRADO (21-ago-2026)

> **Commit `6a61762`.** Entregó `lib/coordinacion.ts` (tipos migrados + `resumirCoordinacion()`
> + literales §6.1), `lib/use-coordinacion-solicitud.ts` (`useCoordinacionSolicitud`) y la
> sección `<CoordinacionSection>` en `DatosTab`, ubicada **después de Asignación** (DUDA-4).
> Dos patrones destilados acá: **RO-39** (tipos compartidos server/cliente en módulo puro) y
> **RO-40** (`date` puro se parsea con regex, nunca `new Date()`).


- **Objetivo:** mostrar en `DatosTab` el desenlace vigente (confirmada / rechazada / sin coordinar) y
  los datos de la última coordinación (fecha propuesta o motivo+detalle según la rama).
- **Fuente:** el desenlace computado en C2 (server-side), **no** `coordinacion_vigente` de TX_Solicitudes.
- **Toca:** `components/console/solicitud-detail.tsx` (`DatosTab`) + posible subcomponente en
  `components/console/` + test.
- **NO toca:** HistorialTab · Adjuntos · ruta tasador · schema.
- **Precondición:** C2 cerrada.
- **Verificable:** build verde + test del bloque (estados confirmada/rechazada/sin-coordinar).
- **Commit sugerido:** `feat(cu-002): agrega bloque Coordinación a la pestaña Datos del expediente (RF-TAS-05)`

## C4 · UI pestaña Historial — eventos de coordinación en el timeline — ✅ CERRADO (21-ago-2026)

> **Commit `c4e9d25`.** Entregó `fetchCoordinacionParaHistorial()` + la tercera lectura en
> paralelo dentro de `fetchHistorialSolicitud` (**salda la deuda que C2 difirió · DUDA-3**),
> los dos literales nuevos de `lib/historial.ts`, la redacción del ítem en `lib/coordinacion.ts`
> y el render en `HistorialTab`. Corrigió además el sustantivo del desplegable, que ofrecía
> *"Ver correo"* sobre el detalle de un llamado telefónico (DUDA-6). Patrones destilados:
> **RO-41** (fallo parcial de lectura fundida se propaga) y **RO-42** (la redacción del ítem
> vive en el módulo del dominio).
>
> **Verificado en `lib/use-historial-solicitud.ts`: no hizo falta tocarlo** — el hook sólo
> transporta `ItemHistorial[]` y no conoce `origen` ni `icono` (DUDA-7).


- **Objetivo:** surface de los intentos de coordinación (fundidos en C2) dentro de `HistorialTab`.
- **Toca:** `components/console/solicitud-detail.tsx` (`HistorialTab`) · `lib/use-historial-solicitud.ts`
  si hace falta tipar el nuevo ícono/estado del ítem · test.
- **NO toca:** DatosTab · schema · ruta tasador.
- **Precondición:** C2 cerrada.
- **Verificable:** build verde + test del render del ítem de coordinación en el timeline.
- **Commit sugerido:** `feat(cu-002): muestra eventos de coordinación en la pestaña Historial (RF-TAS-05)`

## Orden y dependencias

C2 → (C3 ∥ C4). C3 y C4 son independientes entre sí una vez cerrada C2, pero comparten
`solicitud-detail.tsx`: hacerlas seguidas para evitar conflicto de merge.

*Ejecutadas en ese orden y sin conflicto de merge, como estaba previsto.*

---

## Cierre del frente — 21-ago-2026

### Commits en `main`

| # | Commit | Contenido |
|---|---|---|
| 1 | `a62b5c5` | `docs(C1)`: cierre reducido RF-TAS-05 + plan C2/C3/C4 server-side |
| 2 | `378fd91` | `feat(C2·B1)`: lectura server-side `TX_CoordinacionVisita` |
| 3 | `7ab6927` | `refactor(C2·B1.5)`: envolver respuesta en `{ data }` + TODO auth |
| 4 | `00711d4` | `docs(C)`: agregar propuestas C2·B1 y C3·B1 |
| 5 | `6a61762` | `feat(C3·B1)`: sección Coordinación en `DatosTab` (hook + resumen puro) |
| 6 | `c4e9d25` | `feat(C4·B1)`: eventos de coordinación en `HistorialTab` + cierre DUDA-3 |

### Resultado

- **452 tests verdes** (415 al abrir el frente → 431 tras C2 → 441 tras C3 → 452 tras C4),
  `pnpm tsc --noEmit` limpio, `pnpm build` compila.
- Mergeado a `main`, **deploy activo en Railway**.
- **Verificado visualmente en producción** con `VP-2026-0061`:
  - *Datos* → sección **Coordinación de la visita** después de Asignación, badge "Confirmada",
    fecha `25 ago 2026`, respondida `21 ago 13:00`, intento N° 1 y la nota del tasador.
  - *Historial* → ítem con ícono de teléfono, título *"Visita confirmada para el 25 ago 2026"*,
    marca **Coordinación** y detalle desplegable rotulado *"Ocultar detalle"* — **no**
    *"Ver correo"*.

### Reglas operativas que salieron del frente

Registradas en `docs/aprendizajes.md` § *Reglas operativas aprendidas*, con la entrada de
bitácora **2026-08-21 (b)**:

| Regla | Qué fija | Bloque |
|---|---|---|
| **RO-38** | Endpoints hermanos uniforman el shape en `{ data: … }` | C2·B1.5 |
| **RO-39** | Tipos compartidos server/cliente en módulo puro, sin `airtable-client` | C3·B1 |
| **RO-40** | `date` puro (`YYYY-MM-DD`) se parsea con regex, nunca `new Date()` | C3·B1 |
| **RO-41** | Fallo parcial de una lectura fundida se propaga; un criterio por función | C4·B1 |
| **RO-42** | La redacción del ítem del riel vive en el módulo del dominio (RO-05) | C4·B1 |

### Dudas del frente

Las dudas se numeraron **por frente**, dentro de las propuestas de cada bloque
(`propuesta-C2-bloque1.md`, `propuesta-C3-bloque1.md`, `propuesta-C4-bloque1.md`). **No están en
`docs/_sync_ifTasador_v1/gap/_ambiguedades.md`**, que lleva la serie `A-XX` del sync de
IF-Tasador y es otro registro. Su estado final es éste:

| Duda | Asunto | Estado |
|---|---|---|
| DUDA-1 (C2) | `motivo` de coordinación duplica valores de `TX_ContactosVisita.estado_contacto` | 🟡 **ABIERTA** — es **A-21** en `_ambiguedades.md`, pendiente de Héctor. No bloqueó la lectura: `motivo` viaja passthrough (A-17) |
| DUDA-2 (C2) | Identidad del `[id]`: record id vs `codigo` | ✅ **CERRADA en C3** — `Solicitud.id` es el record id de Airtable (`mapRecord(r.id, …)`); `solicitud-detail.tsx` ya lo pasa gateado por `ES_RECORD_ID` |
| DUDA-3 (C3) | El plan asignaba a C2 la fusión en `lib/historial-airtable.ts`, que C2 difirió | ✅ **SALDADA en C4** — la fusión se ejecutó y el comentario que declaraba que la coordinación "no se lee todavía" quedó reescrito |
| DUDA-4 (C3) | Dónde ubicar la sección en `DatosTab` | ✅ **CERRADA** — después de *Asignación*, decisión de Sergio |
| DUDA-6 (C4) | `DetalleCorreo` ofrecía *"Ver correo"* sobre el detalle de un llamado telefónico | ✅ **CERRADA en C4** — tercera vía `"detalle"` en el sustantivo |
| DUDA-7 (C4) | ¿Hay que tocar `lib/use-historial-solicitud.ts`? | ✅ **CERRADA** — no: el hook sólo transporta `ItemHistorial[]` |

#### Dudas que siguen abiertas y sobreviven al frente

- **DUDA-1 (C3) · No hay infraestructura de testing de render.** No existen
  `@testing-library/react` ni `jsdom`, `vitest.config.mts` no declara `environment` y no hay ni
  un `*.test.tsx` en el árbol. La estrategia vigente —y la que cubrió C3 y C4— es **función pura
  + tests sobre la función**: `resumirCoordinacion()`, `tituloDeCoordinacion()`,
  `detalleDeCoordinacion()` y la proyección de `fetchCoordinacionParaHistorial`. Montar el
  runner de render toca `package.json` y es **tanda de infraestructura propia, con Sergio y
  Óscar**. No es deuda del Frente C.
- **DUDA-8 (C4) · `TX_CoordinacionVisita` se lee dos veces por apertura del detalle.** Una desde
  `GET /api/solicitudes/[id]/coordinacion` (sección de Datos, C3) y otra dentro de
  `GET /api/solicitudes/[id]/eventos` (riel del Historial, C4). Las dos corren en paralelo al
  montar y la tabla es chica, así que hoy el coste es despreciable. Si en algún momento el
  detalle pesa, **el ahorro está en fundir del lado cliente** reusando el hook de C3, y no exige
  cambiar el contrato de ninguna ruta.
- **TODO(auth) · gate de Clerk.** `coordinacion/route.ts` no tiene gate, igual que `eventos/` y
  `decision-motor/`; `sla/` sí lo tiene. La asimetría de `app/api/solicitudes/**` se resuelve
  entera en una tanda de auth uniforme con Óscar, no ruta por ruta. El TODO está en la ruta.
