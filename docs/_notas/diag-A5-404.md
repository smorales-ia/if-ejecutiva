# Diagnóstico · 404 en el preview del informe (P7-TAS.A.5)

**Fecha:** 2026-08-26
**Síntoma reportado:** el navegador devuelve **404** al abrir
`http://localhost:3000/tasaciones/recdBwN9OimaCcL9T/informe` (VP-2026-0063).
**Regla:** sólo diagnóstico. **No se tocó código.**

---

## Conclusión (arriba del todo, para no perderla)

**La ruta, el middleware, el export de `page.tsx`, la existencia del registro y la
autorización están TODOS correctos.** El `404` que ve el navegador **no se explica
por el código de .A.5 ni por los datos**: el registro existe, su `estado` es
`calculada` y su campo `tasador` es exactamente el `recordId` del mock de la sesión.

- **H-A (la ruta real es otra) → DESCARTADA.** El log del server muestra
  `GET /tasaciones/recdBwN9OimaCcL9T/informe 404 in 319ms (… application-code: 166ms)`:
  **el código de la página SÍ se ejecutó** (166 ms de application-code). Un 404 por
  ruta inexistente no ejecuta application-code. La ruta existe y responde.
- **H-B (export mal tras el diff .A.5) → DESCARTADA.** `page.tsx` exporta
  `export default async function InformePage(...)`; `pnpm tsc --noEmit`, `pnpm build`
  y `pnpm test` (688) pasaron en verde en esta misma tanda.
- **H-C (el server necesita reinicio limpio) → HIPÓTESIS VIVA, la más probable.**
  Es el único escenario compatible con toda la evidencia: datos y código correctos,
  pero el proceso dev que respondió sirvió un `notFound()`. Ver §7.

**Acción recomendada:** reinicio limpio del dev server y reintento —
`pkill -f "next dev" && rm -rf .next && pnpm dev` — y si persiste, capturar el
**stdout del server en el instante de la petición** buscando líneas `[auth-guard]`
/ `[leerTasacion]` (hoy no aparece ninguna, lo que es en sí un dato: ver §7).

---

## 1) ¿Está `pnpm dev` corriendo?

`ps aux | grep "next dev"`:

```
smorales 2590  sh -c next dev
smorales 2591  node .../next/dist/bin/next dev
smorales 2609  next-server (v16.2.6)
```

Sí, corriendo. Una sola cadena de procesos (pnpm → sh → node → next-server), en el
puerto 3000 (`- Local: http://localhost:3000` · `✓ Ready in 19.8s` en el log).

---

## 2) ¿Existe `app/tasaciones/[id]/informe/page.tsx` en esa ruta exacta?

```
find app/tasaciones -name page.tsx -path "*informe*"
→ app/tasaciones/[id]/informe/page.tsx

ls -la "app/tasaciones/[id]/informe/"
→ -rwxrwxrwx 1 smorales smorales 3019 Aug 26 21:47 page.tsx
```

Sí. El archivo existe, con la fecha del diff de .A.5 (21:47).

---

## 3) Estructura real bajo `app/tasaciones/` (3 niveles)

```
app/tasaciones
app/tasaciones/loading.tsx
app/tasaciones/page.tsx
app/tasaciones/[id]
app/tasaciones/[id]/page.tsx
app/tasaciones/[id]/coordinar/page.tsx
app/tasaciones/[id]/estado/page.tsx
app/tasaciones/[id]/fotos/page.tsx
app/tasaciones/[id]/informe/page.tsx      ← la ruta del preview
app/tasaciones/[id]/lectura/page.tsx
```

El segmento es `[id]/informe`, y la URL probada es `/tasaciones/<recordId>/informe`.
Coinciden. **No hay** subruta `/preview` ni `/pdf`: el preview vive en `/informe`
(descarta la variante de H-A sobre nombres alternativos).

---

## 4) ¿Qué exporta la `page.tsx` que modificó .A.5?

`head -40`:

```tsx
import { notFound } from "next/navigation"
import { leerTasacion } from "@/lib/tasador/lectura-tasacion"
import { leerDatosCaptura } from "@/lib/tasador/lectura-datos"
import { leerFotosCaptura, repartoDeCaptura } from "@/lib/tasador/lectura-fotos"
import { resolverInforme } from "@/lib/tasador/tasaciones"
import { InformePreview } from "@/components/tasador/informe-preview"

export default async function InformePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tasacion, guardados, fotos] = await Promise.all([
    leerTasacion(id), leerDatosCaptura(id), leerFotosCaptura(id),
  ])
  if (!tasacion) notFound()
  …
}
```

**`export default` presente y correcto.** El `404` sale de la línea
`if (!tasacion) notFound()`: es un 404 **de aplicación** (deliberado), no de routing.
O sea, `leerTasacion(id)` devolvió `null`. Toda la investigación siguiente es *por qué*
`leerTasacion` devolvería `null` para un registro que sí existe y sí está asignado.

---

## 5) ¿El middleware de Clerk redirige a 404?

`middleware.ts` (completo):

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api/health'])
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) { await auth.protect() }
})
export const config = { matcher: [ '/((?!_next|[^?]*\\.(?:html?|css|js…)).*)', '/(api|trpc)(.*)' ] }
```

`grep 404 middleware.ts` → **cero**. El middleware **no** produce 404: sólo protege
(redirige a sign-in si no hay sesión). No hay ninguna rama que devuelva 404 para
`/tasaciones/**`. Descarta el middleware como origen.

> Aviso colateral (no relacionado): el server loguea *«The "middleware" file
> convention is deprecated. Please use "proxy" instead.»* — es un warning de
> Next 16, no afecta la resolución de rutas.

---

## 6) Log del server ante esa URL

```
GET /tasaciones/recdBwN9OimaCcL9T/informe 404 in 319ms (next.js: 119ms, proxy.ts: 33ms, application-code: 166ms)
```

- Confirma que la petición **llega y ejecuta application-code** (166 ms).
- **NO aparece ninguna línea** `[auth-guard] acceso denegado a solicitud ajena`,
  `[auth-guard] TASADOR_MOCK_RECORD_ID no está definida`, ni
  `[leerTasacion] fallo de infraestructura`. Esto es importante (§7): el guard tiene
  un `console.warn`/`console.error` en **cada** rama de rechazo salvo dos —
  `isValidRecordId` falso y `!pertenece`… no, `!pertenece` sí loguea—. La única rama
  de 404 que **no** loguea es `isValidRecordId(id) === false`.

---

## 7) Cómo se descarta cada causa de `leerTasacion → null`

`leerTasacion(id)` (en `lib/tasador/lectura-tasacion.ts`) devuelve `null` sólo cuando
`autorizarSolicitud(id)` responde `ok:false`. El guard (`lib/tasador/auth-guard.ts`)
tiene cuatro ramas de rechazo:

| Rama del guard | Status | ¿Loguea? | ¿Aplica aquí? |
|---|---|---|---|
| `isValidRecordId(id)` falso | 404 | **no** | **No** — `recdBwN9OimaCcL9T` son 17 chars y casa `/^rec[a-zA-Z0-9]{14}$/` |
| `!mockTasadorConfigurado()` | 500 | sí (`console.error`) | No — no hay log; y el mock está definido (§abajo) |
| `getRecord` lanza / registro no encontrado | 502 / 404 | 502 sí, 404 no | **No** — el registro se lee OK (§abajo) |
| `!pertenece` (solicitud ajena) | 403 | sí (`console.warn`) | **No** — el `tasador` casa el mock (§abajo) |

### Verificación de identidad y datos (reproduciendo el runtime, no el MCP)

- **Mock de la sesión** — `.env.local:42`:
  `TASADOR_MOCK_RECORD_ID=recSR3RxY6rsLb8k7`
- **Registro crudo por REST** (mismo `getRecord` que usa el guard; se usó `curl`
  como respaldo declarado RO-30 porque el MCP enriquece los links a objetos
  `{id,name}` y no refleja la forma cruda que ve el runtime):

  ```
  GET /v0/app9G7lLkIV3CpeLa/tblaHTyMHYfmy7Fg6/recdBwN9OimaCcL9T  → HTTP 200
  fields.codigo_solicitud = "VP-2026-0063"
  fields.estado           = "calculada"
  fields.tasador          = ["recSR3RxY6rsLb8k7"]
  ```

- **Comparación**: `["recSR3RxY6rsLb8k7"].includes("recSR3RxY6rsLb8k7")` → **true**.

Es decir: a nivel de datos, `autorizarSolicitud` **debe** devolver `ok:true`, y
`leerTasacion` **debe** devolver un `Tasacion` no nulo → **no** debería haber 404.

### La contradicción, y qué queda

El único 404 sin log del guard es `isValidRecordId` falso, y ese id es válido. Todas
las demás ramas de rechazo dejan rastro en stdout, y **el log no tiene ninguna**. Con
código correcto (build/tests verdes), datos correctos (registro + tasador + estado) y
sin rastro de rechazo del guard, la explicación restante es que **el proceso dev que
respondió el 404 no estaba ejecutando el estado esperado** en ese instante:

- pudo arrancar **antes** de que `.env.local` tuviera `TASADOR_MOCK_RECORD_ID`
  (Next lee env sólo al boot), sirviendo con el mock vacío durante esa ventana;
- o Next dev sirvió un árbol de rutas **cacheado/inconsistente** (la primera petición
  del arranque tardó 81 s compilando: `GET / 404 in 83s (next.js: 81s…)`, señal de un
  arranque en frío donde peticiones tempranas pueden ver estado a medias);
- en cualquiera de los dos, un reinicio limpio lo resuelve.

Esto es **H-C**. No hay evidencia para H-A ni H-B.

---

## Próximo paso propuesto (requiere aprobación · aún sin tocar nada)

1. `pkill -f "next dev"`
2. `rm -rf .next`
3. `pnpm dev`  (esperar `✓ Ready`)
4. Reabrir `http://localhost:3000/tasaciones/recdBwN9OimaCcL9T/informe`.
5. Si **persiste** el 404: capturar el stdout del server en el momento de la
   petición y buscar `[auth-guard]` / `[leerTasacion]`. La rama que loguee dirá la
   causa exacta; si no loguea nada y sigue en 404, el foco pasa a `isValidRecordId`
   sobre el `id` **realmente recibido** por `await params` (p. ej. espacio o carácter
   invisible pegado en la URL).

> Nota: el 404 **no** invalida la tanda .A.5. La lógica de hidratación es idéntica a
> la de `fotos/page.tsx` (en producción desde .A.4) y los gates están verdes. Esto es
> un problema de **entorno de ejecución local**, no del diff.
