# DIAGNÓSTICO ESTADO ACTUAL · CU-002 · IF-02

> **Versión**: 1.2 (actualizado tras commits 0ca128a y 0b92b46 · 06-jul-2026)  
> **Fecha**: 2026-07-06  
> **Equipo**: Arquitecto Next.js · Ingeniero Airtable · DevOps · Especialista UX  
> **Base auditada**: `app9G7lLkIV3CpeLa` (schema verificado vía MCP el 04-jul-2026)

---

## 1. Qué hay en el repo actual

1. **Prototipo v0.dev funcional, avanzando hacia datos reales.** `lib/console-data.ts` aún contiene arrays mock para algunos endpoints, pero `lib/airtable-client.ts` y `app/api/solicitudes/route.ts` ya existen y leen `TX_Solicitudes` real en Airtable (commits `0ca128a` y `0b92b46`).
2. **UI completa para el happy path**: `solicitud-list`, `solicitud-detail`, `new-request-sheet`, `reasignar-tasador-dialog`, `document-checklist`, `file-upload-zone`. Pendientes: `tab-historial`, `tab-adjuntos`, `acciones-detalle`, middleware Clerk.
3. **Planes v1.2 elaborados** en `docs/` con TABLE_IDs verificados vía MCP el 04-jul-2026. El schema snapshot (`docs/schema-2026-07-04.json`) está presente.
4. **Decisiones de diseño D-01…D-08 aprobadas** (06-jul-2026). No quedan preguntas de diseño abiertas; el equipo puede proceder a construcción RF por RF.
5. **Bloqueadores abiertos**:
   - **BQ-3**: SC01 / SC05 / RF-09 no existen en Make (`Z_EscenariosMake` vacía). SC13 está **fuera del alcance de CU-002**.
   - **BQ-4**: estado `On/Off` de AT01 / AT02 / AT08 no verificable remotamente; requiere abrir la UI de Airtable Automations. AT01 y AT02 confirmados `On` según verificación en UI de Airtable (Plan v1.2 §1.1).
   - **D-08-ejecución**: ajustes pendientes en Airtable: (a) renombrar `sucursal_originadora ` (espacio); (b) crear `notas_tasador`, `notas_visador`, `ejecutiva_asignada`; (c) crear `disponible` y `casos_en_curso` en `M_Tasadores`; (d) confirmar nombre del campo trigger de AT02 (H-04).
   - **H-04 (P0)**: nombre exacto del campo trigger (checkbox) para AT02 en `TX_Solicitudes` no está definido en ningún documento fuente. Ingeniero Airtable debe confirmarlo antes de construir RF-06.
6. **`.env.local` ya tiene** `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa` listos para usar.

---

## 2. Progreso en la conexión con Airtable real

**Completado** (commits `0ca128a` · `0b92b46`):
- `lib/airtable-client.ts` — fetch tipado con retry + LogEscenarios.
- `app/api/solicitudes/route.ts` — lee `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`) con `filterByFormula` para la vista "Activas".
- `solicitud-list.tsx` conectado al endpoint real.

**Siguiente paso** (sin dependencias externas):
Implementar Layout + Clerk (paso 1 del orden §1.7.3 del plan) desde `app/(ejecutiva)/layout.tsx` con middleware de protección `/consola/*`.

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
| `MAKE_WEBHOOK_URL_SC01` | ❌ falta — bloqueador BQ-3; SC01 no existe aún |
| `MAKE_WEBHOOK_URL_SC05` | ❌ falta — bloqueador BQ-3; SC05 no existe aún |
| `MAKE_WEBHOOK_URL_RF09` | ❌ falta — bloqueador BQ-3-c; RF-09 no existe aún |
| `MAKE_HMAC_SECRET` | ❌ falta definir (secreto HMAC-SHA256 para firmar payloads a Make · D-03) |

> **Regla de seguridad**: ninguna variable sensible puede tener prefijo `NEXT_PUBLIC_`. Solo `NEXT_PUBLIC_CLERK_SIGN_IN_URL` y `NEXT_PUBLIC_APP_URL` son seguras para exponerse al cliente.

> **SC13 fuera de alcance CU-002**: no se requiere variable `MAKE_WEBHOOK_SC13` en este CU. Las acciones de reasignación/pausa/prioridad actualizan Airtable y `A_Eventos` pero no envían email. Deuda técnica para un CU posterior.

---

## 4. Ruta crítica para arrancar construcción

```
Completado (desbloqueador mínimo):
  lib/airtable-client.ts  →  app/api/solicitudes/route.ts  →  solicitud-list.tsx conectado a Airtable real

En ejecución — no depende de Make ni de BQ-3:
  Layout + Clerk  →  RF-05 (lista de solicitudes con datos reales)  →  Detalle de solicitud (lectura)

Después (requieren BQ-3/BQ-4/D-08 cerrados):
  Crear solicitud (SC01)  →  Acciones (AT02 · SC05)  →  RF-09 · Extracción Claude API
```

Ver `docs/ROADMAP_PRE_EJECUCION.md` para la secuencia completa con tiempos estimados.  
Ver `docs/construccion.md` para los prompts de Claude Code y criterios de aceptación por RF.

---

## 5. Referencias cruzadas

- Plan completo: [`docs/PLAN_IMPLEMENTACION_IF02_v1_2.md`](./PLAN_IMPLEMENTACION_IF02_v1_2.md)
- Checklist de bloqueadores: [`docs/CHECKLIST_PRE_EJECUCION.md`](./CHECKLIST_PRE_EJECUCION.md)
- Secuencia ordenada: [`docs/ROADMAP_PRE_EJECUCION.md`](./ROADMAP_PRE_EJECUCION.md)
- Adenda CLAUDE.md: [`docs/CLAUDE_MD_ADENDA.md`](./CLAUDE_MD_ADENDA.md)
- Schema Airtable (04-jul-2026): [`docs/schema-airtable.md`](./schema-airtable.md)
- Snapshot JSON crudo: [`docs/schema-2026-07-04.json`](./schema-2026-07-04.json)
