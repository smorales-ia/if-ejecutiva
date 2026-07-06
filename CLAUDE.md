# CLAUDE.md — VProperty · Consola Ejecutiva (IF-02)

> Instrucciones de sesión para Claude Code. Leer al inicio de cada sesión antes de escribir código.

## Contexto del repositorio

Este repo implementa **IF-02**: la consola diaria de la Ejecutiva Comercial de VProperty (Tasaciones · Bienes Raíces, Chile). Corresponde a **CU-002** del roadmap de producto.

- **Framework**: Next.js 16.2.6 · App Router · Turbopack
- **Autenticación**: Clerk
- **Hosting**: Railway
- **Base de datos**: Airtable (`app9G7lLkIV3CpeLa`)
- **Ruta base de la app**: `/consola`
- **Gestión de paquetes**: `pnpm`

## Reglas generales del repo

- Nunca exponer tokens o secrets al cliente (`NEXT_PUBLIC_AIRTABLE_*`, etc.).
- Siempre preferir Server Components; sólo pasar a `"use client"` cuando haya estado o eventos.
- Seguir el formato **Conventional Commits** con scope `cu-002`.
- No crear `tailwind.config.js` — los tokens viven en `@theme` dentro de `app/globals.css`.
- No importar de `@radix-ui/*` — usar `@base-ui/react` 1.5.

## Cómo trabajar en este repo

1. Lee `docs/diseno.md`, `docs/construccion.md` y `docs/schema-airtable.md` al inicio de la sesión.
2. Implementa **una RF por sesión**. Nunca "construir toda la consola" de golpe.
3. Después de cada RF: `pnpm build` debe salir limpio antes del commit.
4. Haz push; Railway redespliega automáticamente.

---

<!-- === CU-002 · IF-02 Consola Ejecutiva === -->
<!--
================================================================================
  ADENDA CLAUDE.md · CU-002 · IF-02 Consola de la Ejecutiva Comercial
  Versión 1.2 — decisiones D-01…D-08 incorporadas · SC13 fuera de alcance ·
  RF-09 agregado · campos disponible/casos_en_curso corregidos · 06-jul-2026.
================================================================================
  Este bloque fue anexado desde docs/CLAUDE_MD_ADENDA.md v1.2.
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

- **Entradas**: `TX_Solicitudes` (cartera del ejecutivo · filtros SLA), `M_Tasadores` (activos con `disponible = TRUE` y zona · ver H-05), `M_Visadores` (por `especialidades` — nombre plural en el schema real), `M_Clientes`, `A_Eventos` (cronología).
- **Acciones**: crear alta interna, editar campos no-cálculo, asignar/reasignar tasador, fijar fecha de visita, cambiar prioridad, pausar, cancelar. **Acción primaria**: `Pasar a asignada`.
- **Salidas**: `TX_Solicitudes` (insert/update, `origen_canal=ingreso_manual`), `A_Eventos` (alta · asignación · cambios), `A_Cambios` (override de AT02).
- **Estado destino**: `creada → asignada` — bloqueado hasta tasador + visador + `fecha_visita_programada`. Transición ejecutada por AT02; SC05 notifica al tasador.

Principio rector: **la UI muestra y captura; nunca decide**. Toda regla de negocio vive en Airtable (AT01/AT02/AT08 · `C_ReglasNegocio`).

**SC13 fuera de alcance CU-002**: las acciones de reasignación, cambio de prioridad y pausa actualizan Airtable + `A_Eventos` pero **no envían email** en este CU. Deuda técnica para un CU posterior.

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
  firma HMAC-SHA256 (`X-VP-Signature` · D-03).
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
    (scripts AT01/AT02/AT08); leer logs de ejecución; alcanzar Make (SC01/SC05/RF-09).
- Si el MCP se usa para modificar schema durante el diseño (crear/renombrar
  campos), documentar el cambio en `docs/schema-airtable.md` y actualizar la
  tabla de campos del Plan §1.3.

## Endpoints y contratos

### Airtable (BASE `app9G7lLkIV3CpeLa`) — TABLE_IDs verificados vía MCP el 04-jul-2026

| Recurso | TABLE_ID | Uso en IF-02 |
|---|---|---|
| `TX_Solicitudes` | `tblaHTyMHYfmy7Fg6` | Read cartera · Write via SC01 (create) y AT02 (update estado) |
| `M_Tasadores` | `tblEi5jp18c1j00bQ` | Read para selector inteligente. Filtrar por `disponible=TRUE` y ordenar por `casos_en_curso ASC` cuando existan (H-05). |
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
| `TX_Adjuntos` | `tblur71x1oItbmKZc` | Write al subir archivos · campo `estado_extraccion` (RF-09) |
| `TX_Notificaciones` | `tbldgLQgjdgsOSZnt` | Write notificaciones (SC05) |
| `C_NotificacionesConfig` | `tbluB662ulWDaxqUY` | Read destinatarios |
| `C_SLA` | `tblsPZokEK5aoinTn` | Read umbrales SLA (campos: `sla_dias`, `sla_dias_alerta`, `sla_dias_vencido`, `dias_totales`, `dias_alerta_amarilla`, `dias_alerta_roja`) |
| `C_ReglasNegocio` | `tblyCb8cVTDzfeBx0` | Lectura por AT01 |
| `C_AutomationsAirtable` | `tblYYtKEaPgH7GfY0` | Registro AT01/AT02/AT08 |
| `LogEscenarios` | `tblR4VWpUHw1CSyIS` | Write log escenarios Make |
| `Z_EscenariosMake` | `tblYfmDoaq7Z3Vh6P` | Registro SC01/SC05/RF-09 (vacío al 04-jul-2026) |
| `Z_Webhooks` | `tblovY0Bt1Avhdgdx` | Registro URLs webhook SC01 y SC05 y RF-09 |

Endpoint base: `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/{TABLE_ID}`  
Header: `Authorization: Bearer $AIRTABLE_TOKEN`

### Nomenclatura de campos en `TX_Solicitudes` (schema real)

Los siguientes nombres pueden diferir de los usados en Blueprint / Spec.
**Regla**: en clientes de Airtable, preferir referenciar campos por su
FIELD_ID (más estables). Cuando se use el nombre, usar exactamente el del
schema real:

| Campo real | Notas |
|---|---|
| `n_operacion_cliente` (number, `fldb1vmKk7y3hi4uY`) | Spec pedía `op_cliente`. Tipo `number` en schema real — diverge de Capa Datos v2.6.2 que dice `text`. Ver H-07 en `docs/NOTAS_DIVERGENCIA_v1_2.md`. |
| `sucursal_originadora` (singleLineText, `fldd56pLZyKYoi2Vi`) | **⚠ Nombre con espacio final en Airtable real** (`sucursal_originadora `). D-08: corregir el espacio. Mientras no se corrija, usar FIELD_ID. |
| `ejecutivo_solicitante` (singleLineText, `fldRweQyq3tTQGmPR`) | Spec pedía `ejec_solicitante`. |
| `visador` (multipleRecordLinks → `M_Visadores`, `fldhm86amyekWsEFY`) | ✅ existe. |
| `fecha_visita_programada` (date, `fldPUFd9YuQdkcrOI`) | ✅ existe. |
| `prioridad` (singleSelect, `fld9FKZ9siAeSsH54`) | ✅ existe. |
| `origen_canal` (singleSelect, `fldPphw1FWfYdZI2Z`) | ✅ existe. |
| `codigo_ext` (formula, `fldSuJx1fDNYYwDcD`) | Read-only. |
| `semaforo_sla` (formula, `fldW4oUq7LvQUZq7W`) | Fórmula del semáforo. |
| `notas_tasador` · `notas_visador` · `ejecutiva_asignada` | ⚠ **Pendientes de creación** (D-08-ejecución). Su creación es obligatoria antes de los Route Handlers de escritura. |
| campo trigger AT02 | ⚠ **Nombre desconocido** (H-04). Confirmar en UI de Airtable Automations antes de RF-06. |

### Make (org 1594725 · `eu1.make.com`)

| Escenario | Uso | Estado (06-jul-2026) |
|---|---|---|
| SC01 | Alta interna → crea `TX_Solicitudes(estado=creada)` | ❌ por provisionar (BQ-3) |
| SC05 | Notifica tasador al pasar a `asignada` | ❌ por provisionar (BQ-3) · verificar código libre (H-03) |
| RF-09 | Extracción Claude API tras subir adjunto | ❌ por provisionar (BQ-3-c) · usar código propio, no SC07 |
| SC13 | Notificaciones reasignación/prioridad/pausa | **FUERA DE ALCANCE CU-002** — no provisionar en este CU |
| E1/E2/E3 | Pipeline PDF (IF-04 aguas abajo) | ✅ ACTIVO — no tocar desde IF-02 |

Variables de entorno esperadas:
```
AIRTABLE_TOKEN=patxMFmnYmU30RLIl.***
AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa
MAKE_WEBHOOK_URL_SC01=https://hook.eu1.make.com/***
MAKE_WEBHOOK_URL_SC05=https://hook.eu1.make.com/***
MAKE_WEBHOOK_URL_RF09=https://hook.eu1.make.com/***
MAKE_HMAC_SECRET=***
CLERK_PUBLISHABLE_KEY=***
CLERK_SECRET_KEY=***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_APP_URL=https://<railway>
ANTHROPIC_API_KEY=***
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
- `fix(cu-002): normaliza "sucursal_originadora" (D-08) en TX_Solicitudes`

## Ubicación de la documentación

```
docs/
├─ PLAN_IMPLEMENTACION_IF02_v1_2.md   (plan maestro v1.2)
├─ diseno.md                           (diseño funcional · fuente permanente)
├─ construccion.md                     (guía de construcción por RF)
├─ schema-airtable.md                  (snapshot schema con TABLE_IDs y FIELD_IDs)
├─ CHECKLIST_PRE_EJECUCION.md         (v1.2)
├─ ROADMAP_PRE_EJECUCION.md           (v1.2)
├─ CLAUDE_MD_ADENDA.md                (v1.2 — este archivo)
├─ DIAGNOSTICO_ESTADO_ACTUAL.md       (v1.2)
├─ AUDITORIA_ALINEAMIENTO_v1_2.md     (panel · 06-jul-2026)
├─ NOTAS_DIVERGENCIA_v1_2.md          (H-02, H-03, H-06, H-07)
├─ schema-2026-07-04.json             (snapshot JSON crudo del schema MCP)
├─ _md/                               (fuentes canónicas en MD — no editar)
│  ├─ VProperty_Blueprint_Interfaces_v2_7.md
│  ├─ VProperty_Especificacion_Proyecto_v1_4.md
│  ├─ Arquitectura_Enterprise_VProperty_v2_6.md
│  ├─ VProperty_Diseno_Capa_Datos_Enterprise_v2_6_2.md
│  ├─ VProperty_Motor_Calculo_AT01_AT10_v2_5.md
│  └─ VProperty_Origen_Datos_Informe_v1.0.md
└─ _archivo/                          (archivos históricos/obsoletos)
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

- Asignación exitosa (toast verde, sonner `success`):  
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
│  ├─ tasadores/route.ts             # GET filtrado por disponible=TRUE + casos_en_curso ASC
│  ├─ visadores/route.ts             # GET filtrado por especialidades
│  ├─ adjuntos/upload/route.ts       # POST streaming → Make → Dropbox
│  ├─ webhooks/
│  │  ├─ crear-solicitud/route.ts    # POST → SC01
│  │  ├─ asignar/route.ts            # POST → AT02 vía campo trigger
│  │  ├─ reasignar/route.ts          # POST → Airtable + A_Eventos (sin SC13)
│  │  ├─ prioridad/route.ts          # POST → Airtable + A_Eventos (sin SC13)
│  │  └─ pausar/route.ts             # POST → Airtable + A_Eventos (sin SC13)
│  ├─ extraccion/
│  │  └─ iniciar/route.ts            # POST → RF-09 Make → Claude API
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
- Invocar el MCP Airtable desde código productivo compilado.
- Escribir a Airtable durante la ejecución de tests contra la base productiva.
- Reasignar visador desde la UI de la Ejecutiva (Spec v1.4 §1.6 Nota v0 · D-01).
- Emitir mensajes de error técnicos al usuario — siempre humano.
- Modificar los escenarios E1/E2/E3 activos (son del pipeline PDF, no de IF-02).
- Introducir sesiones de negocio en el cliente (state machine vive en Airtable).
- Referenciar campos de `TX_Solicitudes` por nombres que difieran del schema real (usar FIELD_ID si hay duda).
- Usar el código "SC07" para RF-09 (SC07 queda reservado para IF-03 post-visita).
- Invocar SC13 desde ningún Route Handler de IF-02 (SC13 fuera de alcance CU-002).

## Cosas que Claude Code SÍ debe hacer

- Leer `docs/diseno.md`, `docs/construccion.md` y `docs/schema-airtable.md` al inicio de cada sesión.
- Reutilizar componentes de CU-000.A antes de crear nuevos.
- Derivar tipos TS desde `docs/schema-airtable.md` (basado en snapshot MCP del 04-jul-2026).
- Preferir FIELD_ID (`fld…`) sobre nombre de campo cuando exista riesgo de colisión o espacios extra.
- Emitir mensajes humanos §6 literales.
- Loggear en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) cada llamada a Make.
- Escribir tests unitarios de las validaciones bloqueantes y los mensajes humanos.
- Verificar antes de merge que `pnpm build` sale limpio.
- Pedir aprobación explícita antes de crear tablas nuevas en Airtable o escenarios nuevos en Make.
- Filtrar M_Tasadores por `disponible = TRUE` (si el campo existe) y ordenar por `casos_en_curso ASC`.

## Referencias rápidas

- Plan maestro: `docs/PLAN_IMPLEMENTACION_IF02_v1_2.md` (v1.2)
- Diseño funcional: `docs/diseno.md`
- Guía de construcción: `docs/construccion.md`
- Schema Airtable: `docs/schema-airtable.md`
- Checklist: `docs/CHECKLIST_PRE_EJECUCION.md` (v1.2)
- Roadmap: `docs/ROADMAP_PRE_EJECUCION.md` (v1.2)
- Divergencias canónicas: `docs/NOTAS_DIVERGENCIA_v1_2.md`
- Snapshot JSON crudo: `docs/schema-2026-07-04.json`
- Deploy v0 base: <https://v0.app/nutricionsaludketo-8075s-projects/chat/if-ejecutiva-gfvE6z3qTyX>

<!-- === Fin adenda CU-002 · IF-02 v1.2 === -->
