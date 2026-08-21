# Propuesta — C3 · Bloque 1 · Bloque "Coordinación" en la pestaña Datos

Fecha: 2026-08-21
Branch: `feat/coordinacion-ejecutiva`
Estado: 🟡 **PROPUESTA — pendiente de aprobación. Cero writes de código/schema.**
Fuente de alcance: `docs/_notas/plan-frente-C.md` § *C3 · UI pestaña Datos — bloque "Coordinación" (§1.3.2)*.
Baseline al empezar: **431 tests verdes**, `tsc` limpio, C2 B1+B1.5 commiteados (`7ab6927`).

> ⚠ **Este bloque no se puede ejecutar entero sin levantar el bloqueo R5.** El único archivo donde
> el bloque se ve en pantalla es `components/console/solicitud-detail.tsx`, territorio IF-02. Ver §d.

---

## a. Objetivo

Mostrar en `DatosTab` del expediente el desenlace de coordinación de la visita —confirmada,
rechazada o sin coordinar— y los datos del último intento: fecha propuesta en la rama confirmada,
motivo y detalle en la rechazada. La fuente es el cómputo server-side de C2
(`GET /api/solicitudes/[id]/coordinacion`), **no** `TX_Solicitudes.coordinacion_vigente`.

## b. Qué es este bloque y con qué shape

C3 **no es un Route Handler** — el endpoint ya existe y quedó cerrado en C2. Son tres piezas:
un módulo puro de presentación, un hook cliente y una sección en `DatosTab`.

### b.1 · `lib/coordinacion.ts` — contrato client-safe + literales + mapeo puro

Mismo rol que `lib/decision-motor.ts` frente a `lib/decision-motor-airtable.ts`, y por la misma
razón textual que ese archivo documenta: lo consumen **los dos lados** (el reader server-side y el
componente `"use client"`), así que no puede importar `lib/airtable-client.ts` — el token de
Airtable viajaría al bundle del navegador. Sin `fetch`, sin Airtable, sin Clerk.

```ts
export type VarianteCoordinacion = 'confirmada' | 'rechazada' | 'sin_coordinar'

/** Todo ya resuelto para pintar: el componente no decide nada. */
export interface ResumenCoordinacion {
  variante: VarianteCoordinacion
  /** Literal §6.1 del badge: "Confirmada" · "Rechazada" · "Sin coordinar". */
  etiqueta: string
  /** Clases del badge. Ámbar operacional para `sin_coordinar`, nunca naranja de marca (§4.4-5). */
  tonoClases: string
  /** El intento más reciente, o `null` si no hay ninguno. */
  ultimo: IntentoCoordinacion | null
  /** Ordinal del último intento, o `null`. */
  intentoNumero: number | null
  /** Ya formateadas para pantalla, o `"—"`. Nunca una fecha inventada (RO-34). */
  fechaRespuesta: string
  fechaVisita: string
  /** Passthrough desde Airtable, sin catálogo local (A-17), o `"—"`. */
  motivo: string
  detalle: string
  nota: string
  /** Cuántos intentos hubo en total. `0` en `sin_coordinar`. */
  totalIntentos: number
}

export function resumirCoordinacion(datos: CoordinacionSolicitud | null): ResumenCoordinacion

export const MSG_SIN_COORDINACION = 'La visita todavía no se ha coordinado con el propietario.'
export const MSG_ERROR_COORDINACION =
  'No pudimos cargar la coordinación de la visita. Intenta nuevamente en unos segundos.'
```

Los dos literales viven acá y no en el componente por el mismo motivo que `MSG_SIN_DECISION` /
`MSG_ERROR_DECISION` (RO-05): el módulo que produce el dato y el que lo muestra no pueden divergir
en cómo nombran la ausencia y el fallo.

**Formato de fechas.** `fechaRespuesta` es un `dateTime` ISO → se formatea en `America/Santiago` con
`partesEnSantiago` de `lib/sla-habil.ts` (sin imports, client-safe, ya es la vía de
`lib/sla-cronologia.ts`). `fechaVisita` es un `date` puro (`"2026-08-25"`) → se formatea **sin
convertir huso**: pasarlo por `new Date()` lo correría un día hacia atrás en Santiago, que es el
desfase que `_fechaVisible` de `lectura-tasacion.ts` ya documenta en IF-03.

### b.2 · `lib/use-coordinacion-solicitud.ts` — hook cliente

Calco de `lib/use-decision-motor.ts`, incluidos los tres desenlaces separados y el guard `activo`:

```ts
export interface EstadoCoordinacion_UI {   // nombre a fijar: `EstadoCoordinacionUI`
  datos: CoordinacionSolicitud | null
  cargando: boolean
  error: boolean
  sesionExpirada: boolean
}

export function useCoordinacionSolicitud(
  solicitudId: string,
  activo: boolean,
): EstadoCoordinacionUI
```

Desenvuelve `body.data` — que es exactamente lo que habilitó el Bloque 1.5— y usa
`esRespuestaDeClerkSinSesion` igual que sus dos hermanos. `activo` lo pasa el llamador con
`ES_RECORD_ID.test(s.id)`, porque en la demo (`/`) los ids no son `rec…` y el endpoint daría 404.

⚠ **El nombre `EstadoCoordinacion` ya está tomado** por el tipo de `lib/tasaciones.ts`
(`'confirmada' | 'rechazada'`) que C2 usa. El estado del hook se llama **`EstadoCoordinacionUI`**
para que no haya dos cosas distintas con el mismo nombre en el repo.

### b.3 · `CoordinacionSection` en `DatosTab` — 🚫 R5, ver §d

Sección hermana de `DecisionMotorSection`, con las cuatro ramas visuales que ya usa ese bloque
—`cargando` · `error` · vacío · con datos—, un `Badge` con la variante y `DataRow` para los campos
de la rama. Se propone insertarla **inmediatamente después de la sección `Asignación`**
(`solicitud-detail.tsx:1013-1054`) y antes del `Separator` que abre *Datos SII*: la coordinación es
lo que ocurre justo después de asignar, y ahí queda pegada al tasador y a la fecha de asignación en
vez de perdida entre los antecedentes legales.

Va **inline en `solicitud-detail.tsx`**, no en un archivo propio de `components/console/`, siguiendo
el precedente de `DecisionMotorSection`, `CronologiaEtapasSection` y `VersionesInformeSection`, que
son todas locales a ese archivo. El plan lo deja abierto ("posible subcomponente"); un archivo nuevo
no evitaría tocar el archivo bloqueado igual, porque el `<CoordinacionSection>` y el hook hay que
cablearlos ahí de todos modos.

## c. field_ids que consume o escribe

**Cero writes. Cero field_ids nuevos.** C3 no toca Airtable ni directa ni indirectamente: consume el
JSON de `GET /api/solicitudes/[id]/coordinacion`, que ya proyectó los nueve campos de
`FIELD_IDS_COORDINACION_VISITA` en el Bloque 1. No hay `createRecord`, `updateRecord` ni
`deleteRecords` en el alcance, así que no hay STOP de escritura que pedir.

`TX_Solicitudes.coordinacion_vigente` (`fldI4Dv0jpRQvbdHl`) **no se lee**, por decisión de
arquitectura fija del Frente C: es redundancia del lado tasador.

## d. Archivos a crear/modificar (lista cerrada)

| Acción | Archivo | R5 |
|---|---|---|
| CREAR | `lib/coordinacion.ts` — contrato client-safe, literales §6.1, `resumirCoordinacion()` | — |
| CREAR | `lib/coordinacion.test.ts` | — |
| CREAR | `lib/use-coordinacion-solicitud.ts` — hook `useCoordinacionSolicitud` | — |
| MODIFICAR | `lib/coordinacion-airtable.ts` — mover `IntentoCoordinacion` y `CoordinacionSolicitud` a `lib/coordinacion.ts` y re-exportarlos desde acá | archivo de C2, no IF-02 |
| MODIFICAR | **`components/console/solicitud-detail.tsx`** — hook + `<CoordinacionSection>` en `DatosTab` | 🚫 **BLOQUEADO** |

**El bloqueo R5.** `components/console/solicitud-detail.tsx` es territorio IF-02 y la propuesta de C2
lo declaró explícitamente fuera de alcance. **No se toca sin autorización explícita de Sergio.** Sin
esa autorización, C3 se puede ejecutar hasta la pieza b.2 —módulo puro + hook + tests, todo verde y
sin consumidor— y el cableado queda pendiente; es media tanda y hay que decidirlo antes de empezar,
no a mitad.

**Sobre el `MODIFICAR` de `lib/coordinacion-airtable.ts`.** Es un cambio de *dónde vive el tipo*, no
de comportamiento: `fetchCoordinacionSolicitud` queda idéntica y los dos tipos se siguen pudiendo
importar desde `@/lib/coordinacion-airtable` (re-export), así que `route.test.ts` no cambia. Es lo
que hace falta para que el hook y el componente no importen —ni siquiera como `import type`— un
módulo que hace `import { listRecords } from '@/lib/airtable-client'`. La alternativa es dejar los
tipos donde están y tirar `import type` desde el cliente: se borra en compilación y funcionaría,
pero rompe la separación que `lib/decision-motor.ts` documenta como regla del repo. Si preferís no
tocar un archivo ya commiteado, decilo y voy por la alternativa.

**NO toca:** `HistorialTab` ni `lib/historial-airtable.ts` (eso es C4) · `lib/console-data.ts` ·
`lib/tasaciones.ts` · la ruta del tasador · el schema · `package.json`.

## e. Tests a agregar (sobre baseline 431)

Todos en `lib/coordinacion.test.ts`, sobre `resumirCoordinacion()` — función pura, sin mocks.

1. **Rama confirmada**: fija `variante: 'confirmada'`, expone `fechaVisita` formateada y deja
   `motivo`/`detalle` en `"—"`. Es el caso de la seed `recE7iW1JvR6ynIig`.
2. **Rama rechazada**: fija `variante: 'rechazada'`, expone `motivo` y `detalle`, y deja
   `fechaVisita` en `"—"` — la rama rechazada no tiene fecha y no se hereda la del intento anterior.
3. **Sin intentos** (`{ coordinacionVigente: null, intentos: [] }`): `variante: 'sin_coordinar'`,
   `totalIntentos: 0`, `ultimo: null`. RO-34: no es un desenlace neutro.
4. **`null` de entrada** (el hook todavía no resolvió o falló): mismo `sin_coordinar` sin reventar,
   para que el componente pueda llamar a la función antes de tener datos.
5. **Estado fuera de dominio en el último intento**: el reader lo entrega con `estado: null`; el
   resumen cae a `sin_coordinar` y **no hereda** el `confirmada` de un intento previo. Es el
   invariante que el test gemelo de C2 fija del lado del reader.
6. **`motivo` passthrough (A-17)**: un motivo que no está en ningún literal del repo llega intacto
   a `ResumenCoordinacion.motivo`, sin mapearse ni caer a `"—"`.
7. **`fecha_visita_propuesta` ausente en rama confirmada**: devuelve `"—"` y no la fecha de hoy ni
   `fechaRespuesta`. RO-34 aplicado a fechas.
8. **Huso de la fecha de visita**: `"2026-08-25"` se muestra como 25 de agosto y no como el 24 —
   el desfase que aparece si se la pasa por `new Date()`.
9. **`totalIntentos`** con dos intentos: cuenta 2 y `intentoNumero` es el del más reciente, no el
   largo del array.

**No hay test de render del bloque, y eso es una decisión forzada — ver DUDA-1.**

## f. Chequeo de reglas

- **A-17** ✅ — `motivo` viaja passthrough desde Airtable hasta la pantalla. **No se crea ningún
  `MOTIVO_LABELS` ni `MOTIVOS_COORDINACION`** en `lib/coordinacion.ts`: un motivo agregado desde la
  UI de Airtable tiene que llegar sin deploy, y un mapa local lo volvería a atar al build. El test 6
  es el que lo cuida. Lo único que sí es catálogo cerrado es `VarianteCoordinacion`, que es de la UI
  y no de Airtable.
- **RO-30** ✅ — cero MCP en código compilado. El navegador llama al Route Handler de C2 y ése lee
  con `AIRTABLE_TOKEN` server-side. C3 no agrega ninguna vía de acceso nueva a Airtable.
- **RO-34** ✅ — tres desenlaces que **no se colapsan**: `sin_coordinar` (no hay intentos),
  `rechazada` (hay desenlace y es negativo) y `error` (no pudimos leer). Los dos primeros los
  distingue `variante`; el tercero lo distingue `MSG_ERROR_COORDINACION` frente a
  `MSG_SIN_COORDINACION`. Y las fechas ausentes salen `"—"`, nunca una fecha por defecto.
- **RO-35** ✅ — el hook hace un `GET` desde `useEffect` al montar, igual que `useDecisionMotor`.
  RO-35 prohíbe que un efecto de montaje dispare una **escritura irreversible**; una lectura no lo
  es, y no hay ningún `POST`/`PATCH` en el alcance de C3. Ninguna transición de estado se toca.
- **§4.4** ✅ — `Badge`, `Separator` y `DataRow` ya existentes; nada de Radix, nada de `asChild`,
  ningún `sticky`. El ámbar de `sin_coordinar` es el operacional `#D97706`, no el naranja de marca.
- **Regla D** — no aplica: el bloque no tiene botones de mutación.

## g. DUDAS / ambigüedades

- **DUDA-1 · No existe forma de testear el render sin tocar `package.json` (bloqueante para el
  criterio del plan).** El plan pide *"test del bloque (estados confirmada/rechazada/sin-coordinar)"*.
  El repo **no tiene `@testing-library/react` ni `jsdom`**, `vitest.config.mts` no declara
  `environment`, y no existe **ni un solo `*.test.tsx`** en todo el árbol. `CLAUDE.md` dice
  literalmente *"No se agregan dependencias de testing. Todo lo necesario ya está."*, y
  `package.json` está bajo pause-total. La propuesta responde moviendo la lógica testeable fuera del
  JSX —los 9 tests de §e cubren los tres estados que el plan nombra, sobre `resumirCoordinacion()`—
  y dejando el componente como una capa fina que sólo elige qué `DataRow` pinta. **No lo doy por
  cerrado**: si querés un test de render de verdad, hay que abrir una tanda de infraestructura de
  testing con Sergio y con Óscar, y es tanda propia, no un apéndice de C3.

- **DUDA-2 · RESUELTA en esta lectura. `[id]` es el record id.** `solicitud-detail.tsx:219` y `:225`
  ya pasan `s.id` a `useCronologiaSla` y `useDecisionMotor` gateado por `ES_RECORD_ID`
  (`solicitud-detail.tsx:133`), y `mapRecord(r.id, …)` (`lib/solicitudes.ts:928`,
  `app/api/solicitudes/[id]/route.ts:47`) confirma que `Solicitud.id` es el record id de Airtable.
  El contrato de C2 era el correcto y el hook de C3 se cablea igual que sus dos hermanos. **La duda
  se cierra acá**; en C4 no hay que volver a abrirla.

- **DUDA-3 · El plan asignó a C2 una fusión que C2 no hizo.** `plan-frente-C.md:37-39` dice que C2
  debía *"fundir los eventos de coordinación en `lib/historial-airtable.ts`"*. El Bloque 1 de C2 no
  lo hizo: lo difirió explícitamente a C4 por R5, y así quedó aprobado y commiteado. **No propongo
  cambiar el rumbo de C3 por esto** — sólo queda anotado para que C4 sepa que arranca con esa deuda
  encima y no la dé por hecha. `lib/historial-airtable.ts:165-177` sigue documentando que la
  coordinación "no se lee todavía" en el timeline, y ese comentario habrá que actualizarlo en C4.

- **DUDA-4 · Dónde va la sección, exactamente.** Propongo después de `Asignación`
  (`solicitud-detail.tsx:1054`). La alternativa natural es junto a `DecisionMotorSection`
  (`:1139`), donde están los bloques alimentados por hook. Es una decisión de producto, no técnica:
  si Héctor tiene opinión sobre dónde la espera la Ejecutiva en el expediente, gana esa.

- **Sin choques con el schema.** C3 no lee campos nuevos: todo lo que muestra ya lo proyecta el
  endpoint de C2, verificado contra la base el 21-ago-2026.

---

## Próximo paso

Esperando dos aprobaciones, no una:

1. **Levantar o no el bloqueo R5** sobre `components/console/solicitud-detail.tsx`. Sin eso, C3 se
   ejecuta a medias (módulo puro + hook + 9 tests, sin consumidor).
2. **Confirmar el `MODIFICAR` de `lib/coordinacion-airtable.ts`** (mover los tipos) o elegir la
   alternativa del `import type`.

Con el OK: crear los 3 archivos, modificar los 2, un único `pnpm tsc --noEmit` + `pnpm test` al
final del bloque, reportar verde/rojo y parar. Sin commits.
