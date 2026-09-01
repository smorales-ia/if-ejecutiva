# Propuesta — C4 · Bloque 1 · Eventos de coordinación en el timeline del Historial

Fecha: 2026-08-21
Branch: `feat/coordinacion-ejecutiva`
Estado: 🟡 **PROPUESTA — pendiente de aprobación. Cero writes de código/schema.**
Fuente de alcance: `docs/_notas/plan-frente-C.md` § *C4 · UI pestaña Historial — eventos de
coordinación en el timeline*.
Baseline al empezar: **441 tests verdes**, `tsc` limpio, `pnpm build` compila. C1/C2/C3 commiteados.

> ⚠ **Este bloque toca tres archivos de IF-02 y no se puede ejecutar entero sin levantar R5.**
> Uno de ellos —`lib/historial-airtable.ts`— es la deuda que C2 difirió acá (DUDA-3). Ver §d.

---

## a. Objetivo

Hacer visibles los intentos de coordinación de la visita dentro del riel cronológico de
`HistorialTab`, fundidos con `A_Eventos` y `A_Cambios` en un solo timeline ordenado por fecha
(§1.3.3). De paso **salda DUDA-3**: la fusión server-side en `lib/historial-airtable.ts` que el plan
le había asignado a C2 y que C2 difirió a este bloque.

## b. Qué es este bloque y con qué shape

C4 **no es un Route Handler**: `GET /api/solicitudes/[id]/eventos` ya existe y ya llama a
`fetchHistorialSolicitud(id, codigo)`. **Ese archivo no se toca.** Lo que cambia es qué devuelve esa
función. Son tres piezas, en orden de radio de impacto creciente.

### b.1 · `lib/coordinacion.ts` — redacción del ítem (archivo de C3, no IF-02)

Dos funciones puras nuevas, junto al formateador de fechas que ya vive ahí. La redacción va acá y
no en `lib/historial.ts` a propósito: el conocimiento de qué es una coordinación —sus dos ramas, su
`motivo` passthrough, su fecha de calendario sin huso— ya está en este módulo, y duplicarlo del otro
lado sería la segunda fuente de verdad que RO-05 prohíbe. `lib/historial.ts` sólo aprende que existe
un tercer origen.

```ts
/** Primera línea del ítem del riel. */
export function tituloDeCoordinacion(intento: IntentoCoordinacion): string

/** Cuerpo expandible: `detalle` en la rama rechazada, `nota` en la confirmada. */
export function detalleDeCoordinacion(intento: IntentoCoordinacion): string | undefined
```

Títulos, con el mismo criterio de ausencia de todo el Frente C:

| Caso | Título |
|---|---|
| confirmada con fecha | `Visita confirmada para el 25 ago 2026` |
| confirmada sin fecha | `Visita confirmada` — **no** se inventa una fecha (RO-34) |
| rechazada con motivo | `Coordinación rechazada · No contesta` — `motivo` passthrough (A-17) |
| rechazada sin motivo | `Coordinación rechazada` |
| `estado: null` | `Intento de coordinación registrado` — no se inventa desenlace (RO-34) |

Cuando `intentoNumero > 1` se agrega ` (intento N)` al final: en una solicitud con varios llamados,
tres filas idénticas en el riel no dejan ver que fueron intentos distintos.

### b.2 · `lib/historial-airtable.ts` — la fusión server-side (🚫 R5 · deuda DUDA-3)

```ts
/** Intentos de `TX_CoordinacionVisita` mapeados al riel. */
export async function fetchCoordinacionParaHistorial(
  solicitudId: string
): Promise<ItemHistorial[]>
```

Reusa **`fetchCoordinacionSolicitud`** de `lib/coordinacion-airtable.ts` (C2) tal cual: cero lógica
de lectura nueva, cero `filterByFormula` nuevo, cero field_ids nuevos. Sólo proyecta cada intento a
`ItemHistorial`:

```ts
{
  id: intento.id,                              // recordId de TX_CoordinacionVisita
  titulo: tituloDeCoordinacion(intento),
  autor: undefined,                            // ver la nota de abajo
  timestamp: intento.fechaRespuesta,           // ISO, es la clave de orden del riel
  hace: relativeTime(intento.fechaRespuesta),
  origen: 'coordinacion',
  icono: 'phone',
  detalle: detalleDeCoordinacion(intento),
}
```

**`autor` va vacío y es deliberado.** `TX_CoordinacionVisita` tiene `autor_clerk_id`, que es el mismo
identificador crudo (`user_3GBF4Jp…`) que `autorLegible()` ya descarta para `A_Eventos` en este
mismo archivo: mostrarlo sería exponer jerga técnica (§6.1). Resolverlo a nombre exige una lectura
extra de `AUTH_Usuarios` por ítem y es la misma deuda ya documentada arriba en el módulo, no una
nueva.

Y `fetchHistorialSolicitud` pasa a tres lecturas en paralelo:

```ts
const [eventos, cambios, coordinacion] = await Promise.all([...])
return fundirHistorial(eventos, cambios, coordinacion)
```

`fundirHistorial` **ya es variádica** (`...listas: readonly ItemHistorial[][]`, `lib/historial.ts:179`)
y ordena por `timestamp` descendente: acepta la tercera lista sin cambiar una línea.

**Criterio de fallo: se propaga**, igual que las otras dos. Es lo que el módulo ya documenta —"un
historial incompleto que se ve completo es peor que un error visible"— y cambiarlo sólo para la
coordinación crearía dos criterios en la misma función. Consecuencia que conviene decir en voz alta:
a partir de este bloque, `TX_CoordinacionVisita` ilegible deja el timeline entero en error, no sólo
sus filas.

Y **se reescribe el comentario de `:165-177`**, que hoy declara que la coordinación "no se lee
todavía". Ése es el cierre literal de DUDA-3.

### b.3 · `lib/historial.ts` — dos literales nuevos (🚫 R5)

```ts
export type OrigenHistorial = 'evento' | 'cambio' | 'coordinacion'
export type IconoHistorial = 'check' | 'plus' | 'alert' | 'eye' | 'mail' | 'upload' | 'edit' | 'phone'
```

Nada más. `ICONO_POR_EVENTO`, `tituloDeEvento`, `tituloDeCambio` y `fundirHistorial` no cambian.

### b.4 · `components/console/solicitud-detail.tsx` — el render (🚫 R5 · **bloqueo**)

Tres cambios en `HistorialTab`/`HistorialItem`, más un import:

1. **`historialIcons` += `phone: PhoneCall`.** Es un `Record<IconoHistorial, …>` exhaustivo
   (`:117-127`): agregar el literal sin agregar la entrada **rompe `tsc`**. `PhoneCall` existe en
   `lucide-react` (verificado en `node_modules`).
2. **`aside`**: hoy marca `"Edición"` sólo cuando `origen === "cambio"` (`:1489-1497`). Pasa a marcar
   también `"Coordinación"`. Sin esto un intento de coordinación se lee como un hito del ciclo de
   vida y se confunde con una asignación.
3. **`DetalleCorreo sustantivo`**: hoy es `ev.origen === "cambio" ? "motivo" : "correo"` (`:1503`).
   Pasa a tres vías, con `"detalle"` para la coordinación. **No es cosmético** — ver DUDA-6.

## c. field_ids que consume o escribe

**Cero writes. Cero field_ids nuevos. Cero MCP.** C4 no habla con Airtable: consume
`fetchCoordinacionSolicitud()` de C2, que ya proyectó los nueve campos de
`FIELD_IDS_COORDINACION_VISITA`. No hay `createRecord`, `updateRecord` ni `deleteRecords` en el
alcance, así que no hay STOP de escritura que pedir.

`TX_Solicitudes.coordinacion_vigente` (`fldI4Dv0jpRQvbdHl`) **no se lee**, igual que en C2 y C3.

## d. Archivos a crear/modificar (lista cerrada)

| Acción | Archivo | R5 |
|---|---|---|
| MODIFICAR | `lib/coordinacion.ts` — `tituloDeCoordinacion()` + `detalleDeCoordinacion()` | archivo de C3 |
| MODIFICAR | `lib/coordinacion.test.ts` — tests de las dos funciones | archivo de C3 |
| MODIFICAR | **`lib/historial.ts`** — `'coordinacion'` en `OrigenHistorial`, `'phone'` en `IconoHistorial` | 🚫 **BLOQUEADO** |
| MODIFICAR | **`lib/historial-airtable.ts`** — `fetchCoordinacionParaHistorial()` + tercera lectura + reescribir `:165-177` | 🚫 **BLOQUEADO** (deuda DUDA-3) |
| CREAR | `lib/historial-airtable.test.ts` — primer test del módulo | — |
| MODIFICAR | **`components/console/solicitud-detail.tsx`** — icono, `aside`, `sustantivo` | 🚫 **BLOQUEADO** |

**Los tres bloqueos R5 son todos necesarios y ninguno es opcional.** No hay una versión de C4 que
entregue algo útil tocando menos: sin `lib/historial.ts` no hay tercer origen que tipar, sin
`lib/historial-airtable.ts` los ítems no llegan al endpoint, y sin `solicitud-detail.tsx` no compila
(el `Record` exhaustivo). A diferencia de C3 —donde el módulo puro y el hook tenían valor por sí
solos— acá **partir el bloque no deja nada verde y útil**: o se levanta R5 sobre los tres, o el
bloque no arranca.

**NO toca:** `app/api/solicitudes/[id]/eventos/route.ts` (ya llama a `fetchHistorialSolicitud`) ·
`lib/use-historial-solicitud.ts` (ver DUDA-7) · `DatosTab` ni `CoordinacionSection` (es C3, cerrada) ·
`lib/coordinacion-airtable.ts` · la ruta del tasador · el schema · `package.json`.

## e. Tests a agregar (sobre baseline 441)

**En `lib/coordinacion.test.ts`** (función pura, sin mocks) — 6:

1. **Confirmada con fecha**: el título nombra la fecha de visita formateada.
2. **Confirmada sin fecha**: el título es `Visita confirmada` a secas, sin fecha inventada (RO-34).
3. **Rechazada con motivo**: el motivo aparece en el título **tal cual**, incluso uno que el repo no
   conoce (A-17).
4. **`estado: null`**: título neutro que no afirma confirmada ni rechazada (RO-34).
5. **`intentoNumero > 1`**: el título distingue el segundo intento del primero.
6. **`detalleDeCoordinacion`**: devuelve `detalle` en la rama rechazada, `nota` en la confirmada, y
   `undefined` cuando ninguna está poblada — para que el desplegable no aparezca vacío.

**En `lib/historial-airtable.test.ts`** (nuevo, `vi.mock` de `@/lib/coordinacion-airtable` y de
`@/lib/airtable-client`) — 4:

7. **Proyección**: un intento produce un `ItemHistorial` con `origen: 'coordinacion'`,
   `icono: 'phone'`, `timestamp === fechaRespuesta` y el `id` de la fila de coordinación.
8. **Orden del riel fundido**: un evento, un cambio y una coordinación con fechas distintas salen
   estrictamente por `timestamp` descendente, sin agrupar por origen.
9. **Sin intentos**: el timeline queda idéntico al de antes de C4 — cero filas fantasma.
10. **Fallo de la lectura de coordinación**: `fetchHistorialSolicitud` **propaga** en vez de devolver
    el timeline a medias, mismo criterio que las otras dos lecturas.

**No hay test de render del ítem en el timeline**, que es lo que el plan pide como *"Verificable"*.
Es DUDA-1, heredada y explícitamente fuera de C4: la estrategia sigue siendo función pura + tests
sobre la función.

## f. Chequeo de reglas

- **A-17** ✅ — `motivo` entra al título por concatenación directa, sin catálogo local. **No se crea
  ningún `MOTIVO_LABELS`** ni se traduce nada: un motivo agregado hoy en Airtable aparece en el riel
  sin deploy. El test 3 lo cuida. Los únicos catálogos cerrados que se tocan son `OrigenHistorial` e
  `IconoHistorial`, que son vocabulario de la UI y no de Airtable.
- **RO-30** ✅ — cero MCP en código compilado. La lectura sigue siendo `fetchCoordinacionSolicitud`
  con `AIRTABLE_TOKEN` server-side, sin una sola vía de acceso nueva.
- **RO-34** ✅ — tres ausencias distintas y ninguna se colapsa: sin intentos → el riel no gana filas
  (no un "sin coordinar" fantasma); `estado: null` → título neutro que no afirma desenlace;
  confirmada sin fecha → título sin fecha, nunca una por defecto. Y el fallo de lectura sigue siendo
  distinguible del riel vacío por `MSG_ERROR_HISTORIAL`, que ya está cableado.
- **RO-35** ✅ — sólo lectura. `fetchHistorialSolicitud` corre dentro de un `GET`; ningún efecto de
  montaje escribe nada y no se toca ninguna transición de estado.
- **§4.4** ✅ — se reusa `HistorialItem`, `DetalleCorreo` y el riel existentes. Ningún componente
  nuevo, nada de Radix, ningún `asChild`, ningún `sticky`. El icono sale de `lucide-react`, que ya
  es la fuente de todos los demás.
- **§6.1** ✅ — títulos en prosa, sin jerga y sin signos de exclamación. `autor_clerk_id` no se
  muestra, por la misma razón por la que `autorLegible()` descarta los `user_…` de `A_Eventos`.
- **Regla D** — no aplica: el bloque no tiene botones de mutación.

## g. DUDAS / ambigüedades

- **DUDA-3 · SE SALDA EN ESTE BLOQUE, si se levanta R5 sobre `lib/historial-airtable.ts`.** La
  fusión que el plan le asignó a C2 (`plan-frente-C.md:37-39`) y que C2 difirió se ejecuta acá, y el
  comentario de `:165-177` que declara que la coordinación "no se lee todavía" se reescribe en el
  mismo cambio. **Si ese archivo no se autoriza, DUDA-3 no se salda y arrastra a un bloque
  posterior** — y C4 no tiene nada que entregar, porque los ítems no llegarían al endpoint.

- **DUDA-6 · `DetalleCorreo` haría una afirmación falsa si no se toca `solicitud-detail.tsx`.** Hoy
  el sustantivo del desplegable es `ev.origen === "cambio" ? "motivo" : "correo"`. Un ítem de
  coordinación con `detalle` caería en la rama `else` y ofrecería **"Ver correo"** sobre el detalle
  de un llamado telefónico. Es exactamente el bug que motivó que `sustantivo` existiera (el
  comentario del componente lo dice: *"'Ver correo' sobre una razón de edición es simplemente
  falso"*). Por eso el R5 sobre ese archivo es bloqueante de verdad y no cosmético: la alternativa
  no es "se ve menos lindo", es "la UI miente".

- **DUDA-8 · `TX_CoordinacionVisita` se lee dos veces por apertura del detalle.** Con C3 cerrada, el
  detalle ya llama a `GET /api/solicitudes/[id]/coordinacion` para la sección de la pestaña Datos; C4
  agrega una segunda lectura de la misma tabla dentro de `GET /api/solicitudes/[id]/eventos`. Las dos
  corren en paralelo al montar y la tabla es chica, así que el coste hoy es despreciable —y la
  alternativa (fundir en el cliente, reusando el hook de C3) **contradice el plan**, que pide la
  fusión server-side. **Propongo lo que dice el plan** y dejo la observación anotada: si en algún
  momento el detalle pesa, el ahorro está acá y no exige cambiar el contrato de ninguna ruta.

- **DUDA-7 · RESUELTA en la lectura: `lib/use-historial-solicitud.ts` no hace falta tocarlo.** El
  plan lo listaba como *"si hace falta tipar el nuevo ícono/estado del ítem"*. No hace falta: el hook
  sólo transporta `ItemHistorial[]` y no conoce ni `origen` ni `icono`. Queda fuera de la lista de §d.

- **DUDA-1 · sigue abierta y no es de C4.** No hay `@testing-library/react` ni `jsdom`, y el
  *"Verificable"* del plan pide un test de render del ítem. Se cubre con los 10 tests de §e sobre
  funciones puras y la proyección. Un test de render exige tanda de infraestructura propia, con
  Sergio y Óscar.

- **Sin choques con el schema ni con C2/C3.** C4 no lee ningún campo nuevo: todo lo que muestra sale
  de la proyección que el reader de C2 ya hace, verificada contra la base el 21-ago-2026. Y no
  redefine nada de C3: `resumirCoordinacion()` y la sección de DatosTab quedan intactas.

---

## Próximo paso

Esperando **una** autorización, que cubre los tres archivos IF-02 a la vez:

1. **Levantar R5 sobre `lib/historial.ts`, `lib/historial-airtable.ts` y
   `components/console/solicitud-detail.tsx`** (alcance: `HistorialTab` · `historialIcons` ·
   `DetalleCorreo`; nada de `DatosTab`). Partir el bloque no deja nada verde y útil, así que si la
   autorización no sale entera, C4 no arranca.

Con el OK: modificar los 5 archivos, crear 1, un único `pnpm tsc --noEmit` + `pnpm test` +
`pnpm build` al final del bloque, reportar verde/rojo y parar. Sin commits.
