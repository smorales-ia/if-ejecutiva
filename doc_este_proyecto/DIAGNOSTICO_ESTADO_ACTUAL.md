# DIAGNÓSTICO ESTADO ACTUAL · CU-002 · IF-02

> **Fecha**: 2026-07-05  
> **Equipo**: Arquitecto Next.js · Ingeniero Airtable · DevOps · Especialista UX  
> **Base auditada**: `app9G7lLkIV3CpeLa` (schema verificado vía MCP el 04-jul-2026)

---

## 1. Qué hay en el repo actual

1. **Prototipo v0.dev funcional pero 100% mock.** `lib/console-data.ts` contiene arrays hardcodeados; no existe ningún Route Handler (`app/api/` ausente por completo).
2. **UI completa para el happy path**: `solicitud-list`, `solicitud-detail`, `new-request-sheet`, `reasignar-tasador-dialog`, `document-checklist`, `file-upload-zone`. Pendientes: `tab-historial`, `tab-adjuntos`, `acciones-detalle`, middleware Clerk.
3. **Planes v1.1 elaborados** en `doc_este_proyecto/` con TABLE_IDs verificados vía MCP el 04-jul-2026. El schema snapshot (`schema-2026-07-04.json`) está presente.
4. **Bloqueadores abiertos**:
   - **BQ-3**: SC01 / SC05 / SC13 no existen en Make (`Z_EscenariosMake` vacía).
   - **BQ-4**: estado `On/Off` de AT01 / AT02 / AT08 no verificable remotamente; requiere abrir la UI de Airtable Automations.
   - **D-08**: 3 campos con nombre incorrecto + 3 campos ausentes en `TX_Solicitudes` (ver §1.9 del plan).
5. **`.env.local` ya tiene** `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa` listos para usar.

---

## 2. Primer paso concreto para conectar con Airtable real

**Crear `lib/airtable-client.ts`** (fetch tipado con retry) **+ `app/api/solicitudes/route.ts`** que lea `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`) con `filterByFormula` para la vista "Activas", y reemplazar el array mock en `solicitud-list.tsx` con ese endpoint.

El token ya existe en `.env.local`. **Este paso no depende de Make ni de Clerk** — es el desbloqueador mínimo para ver datos reales en la UI.

---

## 3. Variables de entorno necesarias en Railway

| Variable | Valor / Estado |
|---|---|
| `AIRTABLE_TOKEN` | ✅ en `.env.local` → cargar en Railway |
| `AIRTABLE_BASE_ID` | `app9G7lLkIV3CpeLa` ✅ |
| `CLERK_PUBLISHABLE_KEY` | ✅ en `.env.local` (clave test) → cargar en Railway |
| `CLERK_SECRET_KEY` | ✅ en `.env.local` (clave test) → cargar en Railway |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ❌ falta definir (`/sign-in`) |
| `NEXT_PUBLIC_APP_URL` | ❌ falta definir (URL Railway del servicio) |
| `MAKE_WEBHOOK_SC01` | ❌ falta — bloqueador BQ-3; SC01 no existe aún |
| `MAKE_WEBHOOK_SC05` | ❌ falta — bloqueador BQ-3; SC05 no existe aún |
| `MAKE_WEBHOOK_SC13` | ❌ falta — bloqueador BQ-3; SC13 no existe aún |
| `MAKE_SIGNING_SECRET` | ❌ falta definir (secreto HMAC para firmar payloads a Make) |

> **Regla de seguridad**: ninguna variable sensible puede tener prefijo `NEXT_PUBLIC_`. Solo `NEXT_PUBLIC_CLERK_SIGN_IN_URL` y `NEXT_PUBLIC_APP_URL` son seguras para exponerse al cliente.

---

## 4. Ruta crítica para arrancar construcción

```
Primer paso desbloqueador (sin dependencias externas):
  lib/airtable-client.ts  →  app/api/solicitudes/route.ts  →  solicitud-list.tsx conectado a Airtable real

Después (requieren BQ-3/BQ-4/D-08 cerrados):
  Middleware Clerk  →  Route Handlers de escritura  →  Webhooks Make (SC01/SC05/SC13)
```

Ver `ROADMAP_PRE_EJECUCION.md` para la secuencia completa con tiempos estimados.

---

## Referencias cruzadas

- Plan completo: [`PLAN_IMPLEMENTACION_IF02.md`](./PLAN_IMPLEMENTACION_IF02.md)
- Checklist de bloqueadores: [`CHECKLIST_PRE_EJECUCION.md`](./CHECKLIST_PRE_EJECUCION.md)
- Secuencia ordenada: [`ROADMAP_PRE_EJECUCION.md`](./ROADMAP_PRE_EJECUCION.md)
- Adenda CLAUDE.md: [`CLAUDE_MD_ADENDA.md`](./CLAUDE_MD_ADENDA.md)
- Schema Airtable (04-jul-2026): [`schema-2026-07-04.json`](./schema-2026-07-04.json)
