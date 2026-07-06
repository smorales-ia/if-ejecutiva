# VProperty · Consola de la Ejecutiva Comercial (IF-02)

> **CU-002** · Tipo A · Next.js 16 + Clerk + Railway + Airtable  
> **Ruta base**: `/consola`  
> **Estado**: en construcción — iteración por RF con Claude Code.

---

## Qué es este proyecto

IF-02 es la consola diaria de la Ejecutiva Comercial de **VProperty** (Tasaciones · Bienes Raíces, Chile). Materializa la Capacidad C-2 (gestión comercial y bandeja operativa) definida en la Especificación v1.4.

Funciones principales:

- Ver y filtrar la cartera de solicitudes de tasación (vistas: Activas, SLA en riesgo, Por reasignar, Bloqueadas, Aprobadas pend. entrega, Mi cartera).
- Crear solicitudes internas (canal: email, teléfono, WhatsApp, presencial).
- Asignar tasador y visador, fijar fecha de visita y pasar la solicitud a `asignada`.
- Reasignar tasador, cambiar prioridad, pausar o cancelar solicitudes.
- Consultar historial de eventos y adjuntos de cada expediente.
- Extracción automática de datos de adjuntos con Claude API (RF-09).

La UI **sólo muestra y captura**. Toda regla de negocio vive en Airtable (AT01/AT02/AT08) y en Make (SC01/SC05/RF-09).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.6 · App Router · Turbopack |
| Autenticación | Clerk |
| Hosting | Railway |
| Base de datos | Airtable (base `app9G7lLkIV3CpeLa`) |
| Primitivos UI | `@base-ui/react` 1.5 (shadcn/ui v4 sobre base-ui) |
| Estilos | Tailwind CSS v4 (tokens en `@theme` de `globals.css`) |
| Formularios | react-hook-form 7.80 + zod 4 |
| Toasts | sonner 2.0 |
| Automatización | Make (org 1594725 · `eu1.make.com`) · escenarios SC01 y SC05 |
| Extracción IA | Claude API (RF-09 — era SC07) |
| Almacenamiento | Dropbox vía Make OAuth |

---

## Comandos

```bash
pnpm install       # instalar dependencias
pnpm dev           # servidor de desarrollo (Turbopack)
pnpm build         # build de producción
pnpm start         # arrancar en producción
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm format        # prettier --write
pnpm test          # tests unitarios (vitest)
pnpm test:e2e      # tests end-to-end contra sandbox
```

---

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores. **Nunca** commitear `.env.local`.

```bash
cp .env.example .env.local
```

Ver `.env.example` para la lista completa con comentarios.

---

## Documentación

| Archivo | Contenido |
|---|---|
| `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` | Plan maestro v1.2 con decisiones D-01…D-08 aprobadas |
| `docs/diseno.md` | Diseño funcional y visual por RF (fuente permanente para Claude Code) |
| `docs/construccion.md` | Guía de construcción con prompts y criterios de aceptación |
| `docs/schema-airtable.md` | Snapshot del schema con TABLE_IDs y FIELD_IDs |
| `docs/CHECKLIST_PRE_EJECUCION.md` | Checklist de bloqueadores pre-construcción |
| `docs/ROADMAP_PRE_EJECUCION.md` | Secuencia ordenada por dependencias con tiempos |
| `docs/DIAGNOSTICO_ESTADO_ACTUAL.md` | Estado del repo y avance actual |
| `docs/NOTAS_DIVERGENCIA_v1_2.md` | Conflictos entre fuentes canónicas — plan v1.2 prevalece |
| `docs/AUDITORIA_ALINEAMIENTO_v1_2.md` | Auditoría de alineamiento del panel (06-jul-2026) |
| `CLAUDE.md` | Instrucciones de sesión para Claude Code |

---

## Restricciones innegociables (§4.4 Blueprint · §1.8 Spec v1.4)

1. **Tailwind CSS v4** — tokens en `@theme` dentro de `globals.css`. Nunca crear `tailwind.config.js`.
2. **`@base-ui/react`**, no Radix — si un snippet usa `asChild`, refactorizar a `render` prop + `nativeButton`.
3. **Token Airtable server-only** — nunca en `NEXT_PUBLIC_*`.
4. **Sin sticky action bar** en el `DetallePanel` (portales `Select` conviven en `TabDatos`).

Ver `CLAUDE.md` y `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` §1.1 para el detalle completo.
