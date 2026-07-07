## Panel · Respuesta previa al Paso 1

### 1. Qué hace exactamente el Paso 1 — una línea por acción

- Instalar el paquete `@clerk/nextjs` (no está en `package.json`).
- Crear `middleware.ts` en la raíz: bloquea `/consola/*` sin sesión Clerk y redirige a `/sign-in`.
- Mover la lógica actual de `app/page.tsx` a `app/(ejecutiva)/consola/page.tsx` (la ruta del plan).
- Modificar `app/(ejecutiva)/layout.tsx` para envolver con `ClerkProvider` y mostrar el header protegido.
- Crear `app/(public)/sign-in/[[...sign-in]]/page.tsx`: página de login Clerk estándar.
- Conectar `app-header.tsx` al usuario autenticado: reemplazar "ME" hardcodeado por el nombre real de Clerk.
- Añadir `/api/health/route.ts` para smoke test de despliegue.

### 2. Archivos existentes que se reutilizan

| Archivo | Estado actual | Qué se aprovecha |
|---|---|---|
| `app/layout.tsx` | Existe — `RootLayout` con fuentes, `TooltipProvider`, `Toaster`, `Analytics` | Se mantiene intacto; sólo se añade `ClerkProvider` dentro o en el layout ejecutivo. |
| `components/console/app-header.tsx` | Existe — header VProperty con logo, nav, búsqueda, Avatar | Se reutiliza casi completo; sólo se reemplaza el Avatar "ME" por datos del usuario Clerk. |
| `components/console/console-shell.tsx` | Existe — estructura P2 (lista + detalle) | Se reutiliza tal cual en la nueva ruta `/consola`. |
| `app/page.tsx` | Existe — monta `AppHeader` + `ConsoleShell` + `fetchSolicitudes` | El contenido se mueve a `app/(ejecutiva)/consola/page.tsx`; este archivo quedará vacío o con redirect. |
| `lib/solicitudes.ts` | Existe — conectado a Airtable real | Sin cambios; ya funciona. |
| `lib/airtable-client.ts` | Existe (commit 0ca128a) | Sin cambios. |
| `.env.local` | Existe — ya tiene `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` cargados | Listo para Clerk; **sólo falta ajustar el nombre**: el `.env.example` dice `CLERK_PUBLISHABLE_KEY` pero el SDK de Clerk espera `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, que es lo que ya hay. Sin conflicto real. |

### 3. Archivos que se crean o modifican

| Archivo | Acción |
|---|---|
| `middleware.ts` | **Crear nuevo** — protección Clerk rutas `/consola/*` |
| `app/(ejecutiva)/layout.tsx` | **Crear nuevo** — `ClerkProvider` + `AppHeader` conectado |
| `app/(ejecutiva)/consola/page.tsx` | **Crear nuevo** — recibe el contenido de `app/page.tsx` actual |
| `app/(ejecutiva)/consola/loading.tsx` | **Crear nuevo** — skeleton de carga |
| `app/(public)/sign-in/[[...sign-in]]/page.tsx` | **Crear nuevo** — página Clerk estándar |
| `app/api/health/route.ts` | **Crear nuevo** — `GET → { ok: true }` |
| `app/page.tsx` | **Modificar** — reemplazar contenido por redirect a `/consola` (o dejarlo como landing vacío) |
| `components/console/app-header.tsx` | **Modificar** — conectar Avatar al usuario Clerk autenticado |

### 4. Archivos que quedan obsoletos o en conflicto

| Archivo | Situación | Propuesta |
|---|---|---|
| `app/page.tsx` | Actualmente es la consola completa en `/`. Con el Paso 1 la consola se mueve a `/consola`. | Convertir en redirect `permanente` a `/consola`. No borrar — es la raíz de Next.js y eliminarla puede romper el build. |

No hay ningún otro archivo que quede en conflicto. Todo el código actual sigue siendo válido en sus rutas nuevas.

### 5. ¿El Paso 1 corre sin los bloqueadores externos?

**Sí, completamente.** El Paso 1 no depende de:
- H-04 (campo trigger AT02) — no se toca
- D-08-ejecución (campos Airtable) — no se toca
- BQ-3 (Make SC01/SC05/RF-09) — no se toca
- BQ-4 (AT08) — no se toca
- Variables `MAKE_*` — no se usan

Lo único que necesita es Clerk instalado y las variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` en `.env.local`, que **ya están presentes**.

**Único riesgo detectado**: el paquete `@clerk/nextjs` no está en `package.json`. Habrá que ejecutar `pnpm add @clerk/nextjs` antes de arrancar — lo cual requiere conexión a internet y que el usuario apruebe la instalación del paquete.
