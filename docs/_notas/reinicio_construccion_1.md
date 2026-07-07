## 1. Dónde quedamos

**Paso 1 completado** — commit `36d6ec7`.

Evidencia en el repo:
- `middleware.ts` — `clerkMiddleware` correcto, excluye `/api/health` y `/api/webhooks/*`
- `app/(ejecutiva)/layout.tsx` — `AppShell` + `AppHeader`
- `app/(ejecutiva)/consola/page.tsx` — monta `ConsoleShell` con datos reales
- `app/api/health/route.ts` — responde `{ status: 'ok' }`

**Hay más de lo que dice el commit.** El repo contiene scaffolding v0 que va más allá del Paso 1:
- `lib/airtable-client.ts` + `lib/solicitudes.ts` — lecturas reales a Airtable (paginación, retry 429)
- `app/api/solicitudes/route.ts` — funciona, pero sin filtrado por vista
- `components/console/solicitud-list.tsx` — tabs hardcodeadas, sin URL params
- `components/console/solicitud-detail.tsx` — muestra datos del objeto de la lista, sin Route Handler propio

Este trabajo no es Paso 2 completo — es scaffolding parcial. El orden documentado coincide con el estado real: Paso 1 cerrado, Paso 2 a medias.

---

## 2. Qué sigue

**Paso 2 — RF-05 · Lista de solicitudes (lectura)**

---

## 3. Precondiciones

| Item | Estado |
|---|---|
| `AIRTABLE_TOKEN` + `AIRTABLE_BASE_ID` en `.env.local` y Railway | Requerido — sin esto nada funciona |
| `ejecutiva_asignada` en `TX_Solicitudes` | Opcional para empezar — si no existe, degradar "Mi cartera" a vacío con mensaje |
| `MAKE_*` / SC01 / AT02 | **No bloquean Paso 2** — son del Paso 4/5 |
| `pnpm dev` arranca sin warnings de variable faltante | Verificar antes de empezar |

---

## 4. Plan del paso — RF-05

Cuatro subtareas, una sola sesión:

**Subtarea A — Route Handler con filtrado por vista (`?vista=`)**

`app/api/solicitudes/route.ts` debe leer `?vista=activas|sla_riesgo|reasignar|pausadas|aprobadas|cartera` y construir el `filterByFormula` server-side. Para `cartera`, leer `userId` del header Clerk (`auth().userId`) y filtrar por `ejecutiva_asignada`. Si el campo no existe en Airtable, devolver `[]` con `degraded: true`.

**Subtarea B — Conectar tabs a la API**

`solicitud-list.tsx`: los 6 tabs ya existen en la UI. Cambiarlos a un estado que persista en URL params (`useSearchParams` + `useRouter` con `shallow`). Al cambiar tab → `router.push(?vista=X)` → el Server Component padre re-fetches. Reemplazar la lista hardcodeada `tabs` por las 6 vistas del §4 de `construccion.md`.

**Subtarea C — Filtros en URL params (D-07)**

El selector de cliente/estado/fecha en `solicitud-list.tsx` debe leer y escribir en `searchParams` para que back/forward del navegador restaure el filtro. El Route Handler recibe estos params adicionales y los aplica al `filterByFormula`.

**Subtarea D — Badge de prioridad**

`PriorityChip` en `status-badges.tsx` ya existe. Verificar que cumple: Normal=`slate` · Urgente=`#D97706` · Crítico=`#B91C1C`. Si cumple, no crear `prioridad-badge.tsx` — reutilizar. Si no cumple los colores exactos, corregirlo ahí mismo.

**Criterio de cierre**: `pnpm build` limpio + lista muestra registros reales + filtros persisten en URL + "Mi cartera" filtra o degrada correctamente.

---

**¿Arrancamos con la Subtarea A?** Necesito confirmar que tienes `AIRTABLE_TOKEN` cargado en `.env.local` antes de escribir código.
