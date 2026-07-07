Instalación confirmada. Paso 1 completo.

---

**Resumen — Paso 1 terminado**

| # | Archivo | Qué cambió |
|---|---|---|
| 1 | `package.json` + `pnpm-lock.yaml` | `@clerk/nextjs ^7.5.13` agregado |
| 2 | `middleware.ts` *(nuevo)* | Protege todo excepto `/sign-in/*` y `/api/health` |
| 3 | `app/layout.tsx` | `ClerkProvider` envuelve toda la app |
| 4 | `app/(ejecutiva)/layout.tsx` *(nuevo)* | Shell `flex h-screen` + `AppHeader` para rutas protegidas |
| 5 | `app/(ejecutiva)/consola/page.tsx` *(nuevo)* | Contenido de la consola (trasladado desde `app/page.tsx`) |
| 6 | `app/(ejecutiva)/consola/loading.tsx` *(nuevo)* | Skeleton "Cargando solicitudes…" |
| 7 | `app/(public)/sign-in/[[...sign-in]]/page.tsx` *(nuevo)* | Página de login con `<SignIn />` de Clerk |
| 8 | `app/api/health/route.ts` *(nuevo)* | `GET /api/health` → `{ status: "ok" }` |
| 9 | `app/page.tsx` | Ahora solo hace `redirect('/consola')` |
| 10 | `components/console/app-header.tsx` | `currentUser()` Clerk — avatar con foto real e iniciales del nombre |

---

**Cómo lo pruebas tú**

1. `pnpm dev` en la terminal del repo
2. Abre `http://localhost:3000` → debe redirigir automáticamente a `/sign-in`
3. Inicia sesión con tu cuenta Clerk → debe redirigir a `/consola` con la consola cargada
4. Tu avatar en la esquina superior derecha debe mostrar tu foto de Clerk (o iniciales "SM" si no hay foto)
5. `http://localhost:3000/api/health` debe responder `{"status":"ok"}` sin requerir login

**Requisito previo:** asegúrate de que `.env.local` ya tiene `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` con valores reales de tu app Clerk (ya los tenías según el diagnóstico). Si la app Clerk no tiene `http://localhost:3000` como URL permitida, agrégala en el dashboard de Clerk.
