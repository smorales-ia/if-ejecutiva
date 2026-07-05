<!--
================================================================================
  ADENDA CLAUDE.md · CU-002 · IF-02 Consola de la Ejecutiva Comercial
  Versión 1.1 — auditoría schema Airtable vía MCP incorporada (04-jul-2026).
================================================================================
  Este archivo está diseñado para anexarse al final de CLAUDE.md SIN sobrescribir
  contenido previo (adendas de otros CU, convenciones generales, etc.).

  Ejecutar EXACTAMENTE este comando desde la raíz del repo:

    { printf "\n\n<!-- === CU-002 · IF-02 Consola Ejecutiva === -->\n"; cat docs/if02/plan/CLAUDE_MD_ADENDA.md; } >> CLAUDE.md

  Verificar con:

    grep -n "CU-002 · IF-02" CLAUDE.md
    tail -n 200 CLAUDE.md

  Antes de ejecutar, hacer backup:

    cp CLAUDE.md CLAUDE.md.bak.$(date +%Y%m%d-%H%M)
================================================================================
-->

# CU-002 · IF-02 · Consola de la Ejecutiva Comercial

> Bloque específico para Claude Code cuando trabaje sobre este CU. Complementa y
> **no reemplaza** las convenciones generales del `CLAUDE.md` global.

## Contexto de negocio

IF-02 es la consola diaria de la Ejecutiva Comercial de VProperty (Tasaciones ·
Bienes Raíces, Chile). Materializa la Capacidad C-2 (gestión comercial y bandeja
operativa) y absorbe parte de C-1 (creación interna de solicitudes cuando el
canal es email, teléfono, WhatsApp o presencial). Es Tipo A del Blueprint —
código propio, no Airtable Interfaces.

Contrato operacional resumido:

- **Entradas**: `TX_Solicitudes` (cartera del ejecutivo · filtros SLA), `M_Tasadores` (activos con `capacidad_activa` disponible + zona), `M_Visadores` (por `especialidades` — nombre plural en el schema real), `M_Clientes`, `A_Eventos` (cronología).
- **Acciones**: crear alta interna, editar campos no-cálculo, asignar/reasignar tasador, fijar fecha de visita, cambiar prioridad, pausar, cancelar. **Acción primaria**: `Pasar a asignada`.
- **Salidas**: `TX_Solicitudes` (insert/update, `origen_canal=ingreso_manual`), `A_Eventos` (alta · asignación · cambios), `A_Cambios` (override de AT02).
- **Estado destino**: `creada → asignada` — bloqueado hasta tasador + visador + `fecha_visita_programada`. Transición ejecutada por AT02; SC05 notifica al tasador.

Principio rector: **la UI muestra y captura; nunca decide**. Toda regla de negocio vive en Airtable (AT01/AT02/AT08 · `C_ReglasNegocio`).

## Stack forzado (medido en el repo v0 de IF-02)

- Next.js **16.2.6** (App Router · Turbopack)
- React 19.2.4 · React DOM 19.2.4
- TypeScript 5.7.3
- **pnpm** como gestor (con override `hono@4.12.25`)
- Tailwind CSS v4 vía `@tailwindcss/postcss`, tokens declarados en `@theme` dentro de `app/globals.css` — **SIN `tailwind.config.js`**
- shadcn/ui v4 sobre **`@base-ui/react` 1.5** — **JAMÁS Radix**
- lucide-react (iconos)
- `class-variance-authority` + `clsx` + `tailwind-merge` (helper `cn`)
- `tw-animate-css`
- `react-hook-form` 7.80 + `@hookform/resolvers` 5.4 + **zod 4**
- `sonner` 2.0 (toasts) — requiere `next-themes`
- `cmdk` 1.1 (command palette del diálogo de reasignación)
- `@vercel/analytics` (sólo en producción)
- Autenticación: **Clerk**
- Hosting: **Railway**

## Restricciones §4.4 del Blueprint (INNEGOCIABLES)

1. **NUNCA Radix**. Todos los primitivos vienen de `@base-ui/react`. Si un
   snippet de shadcn usa `asChild`, refactorizar a `render` prop + `nativeButton`.
   Ejemplo correcto:
   ```tsx
   <SheetTrigger render={<Button>Abrir</Button>} />
   ```
2. **Tokens Tailwind como custom properties en `:root`** vía arbitrary value
   syntax. Los `--brand`, `--brand-foreground`, `--border`, etc. viven en
   `app/globals.css` bajo `@theme`. No crear `tailwind.config.js`.
3. **Importaciones nombradas explícitas de shadcn** — nunca sustituir por rutas
   alternativas.
4. **No sticky bottom bar** en pantallas donde conviven portales `Select` (el
   `DetallePanel` de IF-02 tiene selects en `TabDatos`). Botones inline en la
   cabecera del panel.
5. Paleta corporativa:
   - Azul VProperty: `#075899` · hover `#0064B4`.
   - Naranja VProperty: `#F5A213`.
   - Semáforo operacional: verde `#15803D` · ámbar `#D97706` · rojo `#B91C1C`.
   - El ámbar operacional se diferencia del naranja de marca — nunca colisionarlos.

## Reglas de arquitectura de datos

- **Cero lógica de negocio en la UI**. La transición `creada → asignada` la
  ejecuta AT02 en Airtable tras validar tasador + visador + fecha_visita_programada.
  La UI sólo habilita/deshabilita el botón para feedback rápido.
- **Lecturas de producción**: Route Handlers server-side (`app/api/**/route.ts`)
  con token Airtable en `.env` (`AIRTABLE_TOKEN`). Nunca exponer el token al
  cliente (nada de `NEXT_PUBLIC_AIRTABLE_*`).
- **Escrituras de negocio**: webhook Make server-side, no directas a Airtable
  desde el cliente. La UI llama `/api/webhooks/*` y el server llama a Make con
  firma HMAC opcional (`X-VP-Signature`).
- **Uploads de adjuntos**: streaming vía Route Handler → Make → Dropbox
  (`My Dropbox connection` OAuth). Nunca token Dropbox directo en el cliente.
- **Sin `use client` innecesario**: los componentes de datos son Server
  Components por defecto; sólo pasan a cliente los que requieren estado o
  eventos (formularios, diálogos, filtros interactivos).

### Uso del MCP Airtable

- El asistente (Claude en `claude.ai` / Claude Code) tiene una **conexión MCP
  activa** a la base `app9G7lLkIV3CpeLa`. Se usa **exclusivamente en la fase de
  diseño/verificación**: auditar schema, listar tablas y campos con IDs reales,
  buscar registros de referencia, y validar contratos antes de escribir tipos TS
  o Route Handlers.
- **MCP NO reemplaza el runtime**. En producción, la app usa siempre el token
  `AIRTABLE_TOKEN` desde el servidor. Nunca invocar el MCP desde código
  compilado ni desde componentes cliente.
- Alcance conocido del MCP:
  - ✅ Puede: leer schema (`list_tables_for_base`, `get_table_schema`), buscar
    registros (`search_records`), listar comentarios.
  - ❌ No puede: verificar estado activo/inactivo de Airtable Automations
    (scripts AT01/AT02/AT08); leer logs de ejecución de Automations; alcanzar
    Make (SC01/SC05/SC13).
- Si el MCP se usa para modificar schema durante el diseño (crear/renombrar
  campos), documentar el cambio en `docs/if02/plan/snapshots/` y actualizar la
  tabla de campos del Plan §1.3.

## Endpoints y contratos

### Airtable (BASE `app9G7lLkIV3CpeLa`) — TABLE_IDs verificados vía MCP el 04-jul-2026

| Recurso | TABLE_ID | Uso en IF-02 |
|---|---|---|
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` | Read cartera · Write via SC01 (create) y AT02 (update estado) |
| `M_Tasadores` | `tblEi5jp18c1j00bQ` | Read para selector inteligente (⚠ no confundir con `tblt4ZtDQIbYDxec4` que aparecía en borradores anteriores — no era el ID real) |
| `M_Visadores` | `tbludtgDtHWvt0Q3D` | Read para selector de visador. Campo relevante: `especialidades` (multipleSelects, **plural**) |
| `M_Clientes` | `tblpK7AcYBMH93apK` | Read para link + filtros de productos |
| `M_Bancos` | `tblGlYuJo5AeMehhs` | Read para banco financista |
| `M_Productos` | `tbll6D4KQ5aDdjjaj` | Read para producto |
| `M_Comunas` | `tblyggAfQfq682XHK` | Read para cascada Región→Comuna |
| `M_TiposInforme` | `tblOcsdiwxQLfD178` | Read filtrado por cliente |
| `M_TiposPropiedad` | `tbl8rxZA14xFIBGU6` | Read para select |
| `A_Eventos` | `tblMKmDg2KrO5fMn8` | Write timeline (`tipo_evento` es singleLineText) |
| `A_Cambios` | `tbl6Yd0c7MRqNeC0x` | Write override AT02 |
| `A_DecisionesMotor` | `tbluQQtXUI0Zd8jiN` | Read decisión del motor |
| `A_ErroresMake` | `tbl46Q0BcfD57LWyQ` | Read/write errores Make (bonus) |
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write al subir archivos |
| `TX_Notificaciones` | `tbldgLQgjdgsOSZnt` | Write notificaciones |
| `C_NotificacionesConfig` | `tbluB662ulWDaxqUY` | Read destinatarios |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read umbrales SLA (campos: `sla_dias`, `sla_dias_alerta`, `sla_dias_vencido`, `dias_totales`, `dias_alerta_amarilla`, `dias_alerta_roja`) |
| `C_ReglasNegocio` | `tblyCb8cVTDzfeBx0` | Lectura por AT01 |
| `C_AutomationsAirtable` | `tblYYtKEaPgH7GfY0` | Registro AT01/AT02/AT08 |
| `LogEscenarios` | `tblR4VWpUHw1CSyIS` | Write log escenarios Make |
| `Z_EscenariosMake` | `tblYfmDoaq7Z3Vh6P` | Registro SC01/SC05/SC13 (vacío al 04-jul-2026) |
| `Z_Webhooks` | `tblovY0Bt1Avhdgdx` | Registro URLs webhook |

Endpoint base: `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{TABLE_ID}`  
Header: `Authorization: Bearer $AIRTABLE_TOKEN`

### Nomenclatura de campos en `TX_Solicitudes` (schema real)

Los siguientes nombres pueden diferir de los usados en Blueprint / Spec.
**Regla**: en clientes de Airtable, preferir referenciar campos por su
FIELD_ID (más estables). Cuando se use el nombre, usar exactamente el del
schema real:

| Campo real | Notas |
|---|---|
| `n_operacion_cliente` (number, `fldb1vmKk7y3hi4uY`) | Spec pedía `op_cliente`. |
| `sucursal_originadora ` (singleLineText, `fldd56pLZyKYoi2Vi`) | **⚠ Tiene un espacio al final del nombre**. Debe corregirse (ver D-08 en Plan §1.9). Mientras no se corrija, usar el FIELD_ID. |
| `ejecutivo_solicitante` (singleLineText, `fldRweQyq3tTQGmPR`) | Spec pedía `ejec_solicitante`. |
| `visador` (multipleRecordLinks → `M_Visadores`, `fldhm86amyekWsEFY`) | ✅ existe. |
| `fecha_visita_programada` (date, `fldPUFd9YuQdkcrOI`) | ✅ existe. |
| `prioridad` (singleSelect, `fld9FKZ9siAeSsH54`) | ✅ existe. |
| `origen_canal` (singleSelect, `fldPphw1FWfYdZI2Z`) | ✅ existe. |
| `codigo_ext` (formula, `fldSuJx1fDNYYwDcD`) | Read-only. |
| `semaforo_sla` (formula, `fldW4oUq7LvQUZq7W`) | Fórmula del semáforo. |
| `notas_tasador` · `notas_visador` · `ejecutiva_asignada` | ❌ **No existen** en schema real. Su creación depende de D-02 y D-08. |

### Make (org 1594725 · `eu1.make.com`)

| Escenario | Uso | Estado (04-jul-2026) |
|---|---|---|
| SC01 | Alta interna → crea `TX_Solicitudes(estado=creada)` | ❌ por provisionar (BQ-3) |
| SC05 | Notifica tasador al pasar a `asignada` | ❌ por provisionar (BQ-3) |
| SC13 | Notifica reasignación / prioridad / pausa | ❌ por provisionar (BQ-3) |
| E1/E2/E3 | Pipeline PDF (IF-04 aguas abajo) | ✅ ACTIVO — no tocar desde IF-02 |

Variables de entorno esperadas:
```
AIRTABLE_TOKEN=patxMFmnYmU30RLIl.***
AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa
MAKE_WEBHOOK_SC01=https://hook.eu1.make.com/***
MAKE_WEBHOOK_SC05=https://hook.eu1.make.com/***
MAKE_WEBHOOK_SC13=https://hook.eu1.make.com/***
MAKE_SIGNING_SECRET=***
CLERK_PUBLISHABLE_KEY=***
CLERK_SECRET_KEY=***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_APP_URL=https://<railway>
```

## Comandos pnpm canónicos

```bash
pnpm install               # instalar dependencias
pnpm dev                   # desarrollo (Turbopack)
pnpm build                 # build de producción
pnpm start                 # arrancar producción
pnpm lint                  # ESLint
pnpm typecheck             # tsc --noEmit
pnpm format                # prettier --write
pnpm test                  # tests unitarios (vitest cuando esté)
pnpm test:e2e              # tests end-to-end contra sandbox
```

Reglas de dependencias:

- No agregar Radix (`@radix-ui/*`). Rechaza el PR si aparece.
- No agregar `tailwindcss.config.js` ni `tailwind.config.ts`.
- Fijar versiones exactas (`^` sólo con revisión explícita).
- Antes de `pnpm add <paquete>`, verificar que no exista en CU-000.A.

## Convención de commits

Formato **Conventional Commits** con scope `cu-002` obligatorio:

```
<tipo>(cu-002): <descripción imperativa breve>

<cuerpo opcional explicando qué cambia y por qué>

Refs: <RF-XX | RN-XX | BQ-X | D-XX | issue #>
```

Tipos permitidos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`.

Ejemplos:

- `feat(cu-002): habilita botón "Pasar a asignada" con precondiciones RN-09`
- `fix(cu-002): refactor asChild → render prop en SheetTrigger (§4.4)`
- `docs(cu-002): registra decisión D-01 (Ejecutiva no reasigna visador)`
- `fix(cu-002): normaliza "sucursal_originadora " (D-08) en TX_Solicitudes`

## Ubicación de la documentación

```
docs/
└─ if02/
   ├─ plan/
   │  ├─ PLAN_IMPLEMENTACION_IF02.md         (v1.1)
   │  ├─ CHECKLIST_PRE_EJECUCION.md          (v1.1)
   │  ├─ ROADMAP_PRE_EJECUCION.md            (v1.1)
   │  ├─ CLAUDE_MD_ADENDA.md                 (v1.1)
   │  └─ snapshots/
   │     ├─ schema-2026-07-04.json           (auditoría MCP)
   │     └─ make-scenarios-YYYY-MM-DD.json
   └─ adr/
      └─ ADR-cu-002.md                       (D-01 … D-08)
```

## Mensajes humanos canónicos (§6 Blueprint · literales — no admiten variación)

### Validaciones bloqueantes

- Botón "Pasar a asignada" deshabilitado (uno o más faltantes):  
  **"Para pasar a asignada falta: tasador · visador · fecha de visita."**  
  *(Sólo se listan los faltantes reales, separados por " · ".)*
- RUT inválido (`RUTField`):  
  **"Necesitamos el RUT del propietario con su dígito verificador. Ej.: 12.345.678-9."**
- Email inválido:  
  **"Revisa el email de contacto: debe ser de la forma nombre@dominio.cl."**
- Dirección incompleta:  
  **"Ingresa la dirección con calle y número. Ej.: Av. Apoquindo 5230."**

### Confirmaciones (toasts)

- Reasignación / asignación exitosa (toast verde, sonner `success`):  
  **"Solicitud asignada a {nombre_tasador}"**
- Reasignación exitosa:  
  **"Solicitud reasignada a {nombre_tasador}"**
- Creación de solicitud interna:  
  **"Solicitud creada con {n} documento(s) adjunto(s)."** *(pluraliza según n)*

### Advertencias (ámbar, no bloqueantes)

- Reasignación fuera de cobertura (banner en `ReasignarTasadorDialog`):  
  **"Este tasador no cubre la comuna de la solicitud. Puedes continuar; quedará registrado como override."**
- Documento marcado sin archivo (tooltip en botón "Crear solicitud"):  
  **"Faltan {n} documento(s) marcado(s) sin archivo."**

### Estilo (§6.1 · §6.5)

- Voz en segunda persona singular ("Necesitas…", "Falta…").
- Sin signos de exclamación.
- Sin culpar al usuario ni exponer errores técnicos.
- Errores de red / Make: **"No pudimos completar la acción. Intenta nuevamente en unos segundos."**

## Estructura de rutas

```
app/
├─ (public)/
│  └─ sign-in/[[...sign-in]]/page.tsx
├─ (ejecutiva)/
│  ├─ layout.tsx                     # AppShell + header VProperty (protegido por Clerk)
│  └─ consola/
│     ├─ page.tsx                    # P2 · Lista + Detalle
│     └─ loading.tsx
├─ api/
│  ├─ solicitudes/
│  │  ├─ route.ts                    # GET lista (server-side, token Airtable)
│  │  └─ [id]/route.ts               # GET detalle
│  ├─ tasadores/route.ts             # GET filtrado por comuna+capacidad_activa
│  ├─ visadores/route.ts             # GET filtrado por especialidades
│  ├─ adjuntos/upload/route.ts       # POST streaming → Make → Dropbox
│  ├─ webhooks/
│  │  ├─ crear-solicitud/route.ts    # POST → SC01
│  │  ├─ asignar/route.ts            # POST → AT02 vía Make
│  │  ├─ reasignar/route.ts          # POST → SC13
│  │  ├─ prioridad/route.ts          # POST → SC13
│  │  └─ pausar/route.ts             # POST → SC13
│  └─ health/route.ts
└─ globals.css                       # @theme con tokens VProperty
```

## Cosas que Claude Code NO debe hacer en este CU

- Crear `tailwind.config.js`.
- Importar de `@radix-ui/*`.
- Usar `asChild` (usar `render` prop).
- Usar `sticky` en el `BarraAccionesDetalle`.
- Escribir directo a Airtable desde componentes cliente.
- Poner el token Airtable/Make/Dropbox en el cliente (`NEXT_PUBLIC_*`).
- Invocar el MCP Airtable desde código productivo compilado (el MCP es sólo
  herramienta de diseño/auditoría; el runtime usa `AIRTABLE_TOKEN` server-side).
- Escribir a Airtable durante la ejecución de tests contra la base productiva.
- Reasignar visador desde la UI de la Ejecutiva (Spec v1.4 §1.6 Nota v0 · D-01).
- Emitir mensajes de error técnicos al usuario — siempre humano.
- Modificar los escenarios E1/E2/E3 activos (son del pipeline PDF, no de IF-02).
- Introducir sesiones de negocio en el cliente (state machine vive en Airtable).
- Referenciar campos de `TX_Solicitudes` por nombres que difieran del schema
  real sin haber resuelto D-08 antes.

## Cosas que Claude Code SÍ debe hacer

- Consultar este bloque + `PLAN_IMPLEMENTACION_IF02.md` v1.1 + `CHECKLIST_PRE_EJECUCION.md` v1.1 antes de tocar código.
- Reutilizar componentes de CU-000.A antes de crear nuevos.
- Derivar tipos TS desde el snapshot MCP (`docs/if02/plan/snapshots/schema-2026-07-04.json`) y no desde asunciones históricas de spec.
- Preferir FIELD_ID (`fld…`) sobre nombre de campo cuando exista riesgo de
  colisión, tipografía o espacios extra (caso `sucursal_originadora `).
- Emitir mensajes humanos §6 literales.
- Loggear en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) cada llamada a Make.
- Escribir tests unitarios de las validaciones bloqueantes y los mensajes humanos.
- Verificar antes de merge que `pnpm build` sale limpio.
- Pedir aprobación explícita antes de crear tablas nuevas en Airtable o
  escenarios nuevos en Make; para cambios de schema durante diseño, usar el MCP
  y guardar snapshot post-cambio.

## Referencias rápidas

- Plan maestro: `docs/if02/plan/PLAN_IMPLEMENTACION_IF02.md` (v1.1)
- Checklist: `docs/if02/plan/CHECKLIST_PRE_EJECUCION.md` (v1.1)
- Roadmap: `docs/if02/plan/ROADMAP_PRE_EJECUCION.md` (v1.1)
- Decisiones formales: `docs/if02/adr/ADR-cu-002.md` (D-01 … D-08)
- Snapshot schema Airtable: `docs/if02/plan/snapshots/schema-2026-07-04.json`
- Diseño Datos v2.6.2 (fuera del repo)
- Blueprint Interfaces v2.7 (fuera del repo)
- Especificación v1.4 (fuera del repo)
- Deploy v0 base: <https://v0.app/nutricionsaludketo-8075s-projects/chat/if-ejecutiva-gfvE6z3qTyX>

<!-- === Fin adenda CU-002 · IF-02 v1.1 === -->
