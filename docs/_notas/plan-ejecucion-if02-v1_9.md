# Plan de Ejecución IF-02 v1.9 — Guía maestra para Claude Code

> **Uso.** Este archivo es la referencia única para construir IF-02. Claude Code lo lee al iniciar cada sesión, detecta la última P completada y ejecuta la siguiente **sin que Sergio le pase el prompt**. Sergio solo confirma que la P quedó ok y da señal para avanzar.
>
> **Precedencia.** Ante cualquier contradicción con `docs/_md/VProperty_Especificacion_Proyecto_v1_9_1.md` u otros docs, mandan las **Reglas A, B, C** de este archivo (§0.3): son la fuente de verdad de la UI implementada.

---

## §0 Preflight — Lectura obligatoria al iniciar cada sesión

### §0.1 Archivos a leer al iniciar sesión (en este orden)

1. `docs/_notas/plan-ejecucion-if02-v1_9.md` (este archivo, completo)
2. `docs/_notas/inventario-if02.md` (generado en P0 — obligatorio a partir de P1)
3. `docs/aprendizajes.md`
4. `docs/schema-airtable.md`
5. `docs/diseno.md`
6. `docs/construccion.md`
7. Último `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md` disponible (para saber dónde quedó la sesión anterior).
8. Último `docs/_notas/snapshot-P{n}.md` disponible.

### §0.2 Convenciones no negociables

- **Repo:** `/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva` (WSL2)
- **Stack:** Next.js 16 App Router · React 19 · TS 5.7 · pnpm · Tailwind v4 (`@theme` en `globals.css`, sin `tailwind.config.js`) · shadcn/ui v4 sobre `@base-ui/react` (nunca Radix) · react-hook-form + zod · sonner · cmdk · lucide-react
- **Cero lógica de negocio en UI.** Toda escritura a Airtable pasa por Make o Airtable Automations.
- **Reuse before create.** Antes de crear un componente/función/tipo, buscar con `grep -r` si ya existe. **Si existe, se extiende; no se duplica.**
- **Complete files only.** Cuando un archivo cambia, entregar la versión completa nueva; nada de patches ni adendas.
- **Sin `localStorage` / `sessionStorage`** para datos de negocio.
- **Commits los hace Sergio en GitHub Desktop.** Claude Code nunca ejecuta `git commit` ni `git push`.
- **Idioma:** UI en español (Chile); comentarios de código en español; identificadores en inglés.

### §0.3 Reglas A, B, C — Fuente de verdad UI (precedencia absoluta)

**REGLA A — Asignación de tasador**
- Solicitud se crea sin tasador (estado `creada`, badge "Sin asignar").
- Existe **solo** el botón "Asignar Tasador". **No existe "Reasignar Tasador"** en la barra de acciones.
- Botón visible **solo** cuando: sin tasador asignado + estado permite (no `cancelada`, no `cerrada`).
- Al asignar, el botón **desaparece**.
- Habilitación: requiere `datosMinimosFaltantes = []`. Si faltan datos, botón deshabilitado + tooltip con la lista.
- Al confirmar: fija tasador, estado `creada → asignada`, registra `fecha_asignacion`, marca correo como enviado, agrega 2 eventos a `A_Eventos` (`correo_asignacion_enviado`, `asignacion_manual`).

**REGLA B — Validación al crear solicitud**
- Si algún dato impide crear, **no se crea** y se informa en **dos superficies simultáneas**:
  1. **Toast (sonner):** encabezado con "N campos con problema" + detalle de los primeros (formato `campo: motivo`) + contador "+N más".
  2. **Alert destructivo** al inicio del formulario: lista **todos** los campos fallidos con etiqueta legible y motivo. Bloques repetibles se nombran con precisión: `"Unidad 2 · Superficie construida: obligatoria"`, `"Contacto 1 · Teléfono: formato inválido"`.
- **Conflicto de negocio:** si el N° de operación ya existe, `setError` en ese campo con motivo específico (no se mezcla con validaciones de forma).

**REGLA C — Modificación de datos**
- Editable **solo** en estado `creada`. En ese estado la ejecutiva puede modificar **todo**, incluyendo cambiar el tasador ya asignado (si lo hubo, aunque en el flujo normal no lo habrá).
- Botón "Editar solicitud" visible **solo** en estado `creada`.
- **Modo consulta (RN-59):** cuando estado ≠ `creada` **y** hay tasador asignado, todos los datos quedan en solo lectura.
- Al guardar edición: actualiza datos, registra `datos_modificados` en `A_Eventos`, toast de éxito, vuelve a modo consulta.

### §0.4 Consecuencias derivadas (aplican a todos los P)

- `AT02` está fuera del alcance de IF-02: **cero llamadas** a AT02 desde código Next.js.
- **No hay endpoint** `/api/solicitudes/[id]/reasignar`. Solo `/api/solicitudes/[id]/asignar`.
- **No hay diálogo** de reasignación con catálogo de motivos.
- El correo `email_asignacion_tasador` se envía **una sola vez** por asignación (más el botón "Reenviar" del bloque Asignación).

### §0.5 Modos de Claude Code por P

Claude Code tiene 3 modos que Sergio cicla con **Shift+Tab** en la terminal:

| Modo | Comportamiento |
|---|---|
| `default` | Pregunta antes de cada edición de archivo **y** cada comando de terminal. |
| `accept edits on` | Edita archivos libre. Pregunta antes de ejecutar comandos de terminal. |
| `auto mode on` | Hace todo sin preguntar. |

**Modo recomendado por P** (Sergio activa con Shift+Tab **antes** de arrancar cada P):

| P | Nombre | Modo recomendado | Razón |
|---|---|---|---|
| P0 | Inventario | `auto mode on` | Solo lee y genera 1 doc. Riesgo cero. |
| P1 | Types | `auto mode on` | Solo tipos TS. Errores los atrapa `tsc`. |
| P2 | API Routes | `accept edits on` | Backend + HMAC. Que edite, pero pare en comandos. |
| P3 | Wizard | `accept edits on` | UI nueva con shadcn. Bajo riesgo. |
| P4 | Formulario | `accept edits on` | REGLA B — punto frágil. Que edite, pare en comandos. |
| P5 | Panel lista + filtros + búsqueda | `accept edits on` | UI de lectura pura, no cambia estado real. |
| P6 | Panel detalle | `accept edits on` | REGLAS A y C. Igual que P4. |
| P7 | Diálogo asignación | `default` | Cambia estado real (`creada → asignada`) y dispara correo. |
| P8 | Sheet documentos | `accept edits on` | Sube archivos a Dropbox. Bajo riesgo si RF-09 va bien. |
| P9 | Deploy | `default` | Deploy a producción. Cualquier error se propaga. |

**Regla de comportamiento textual — red de seguridad:**

Cada P al arrancar declara su **contrato de comportamiento** (siguiente sección). Claude Code lo respeta **incluso si el modo real es más permisivo**. Es decir: aunque Sergio olvide cambiar a `default` en P7, si el plan dice "pregunta antes de cada comando", Claude Code pregunta.

**Contratos posibles:**

- 🟢 **libre**: puede editar y ejecutar comandos sin preguntar.
- 🟡 **pausa-en-comandos**: edita libre, pero antes de ejecutar cualquier comando de terminal (`pnpm`, `bash`, scripts, etc.) muestra el comando y pide confirmación con "¿ejecuto? (s/n)".
- 🔴 **pausa-total**: antes de cada edición Y de cada comando, muestra qué va a hacer y pide confirmación.

### §0.6 Convención Tanda y aprendizajes

Cada P (incluido P0) es una **Tanda** independiente. Al terminar cada tanda:

1. Claude Code genera **automáticamente** un archivo de aprendizajes en:
   ```
   docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md
   ```
   con timestamp real del sistema (ej: `aprendizajes-20260722-1435-P0.md`).

2. Ese archivo contiene:
   - Encabezado con P, fecha, hora, duración estimada de la tanda.
   - Resumen de qué se construyó (bullet points).
   - Decisiones técnicas relevantes.
   - Overrides aplicados (rutas reales vs plan).
   - Bugs encontrados y cómo se resolvieron.
   - Deuda técnica que queda para P siguientes.
   - Nuevas reglas que deberían migrar a `docs/aprendizajes.md` como reglas activas (marcadas con `→ MIGRAR`).

3. Sergio hace commit + push desde GitHub Desktop.
4. Sergio confirma en el chat maestro (VProperty) que la tanda quedó ok.
5. Recién ahí se avanza a la siguiente P.

`docs/aprendizajes.md` **no se modifica automáticamente** por cada P: es la base consolidada de reglas activas. Solo cuando Sergio pide expresamente migrar una lección desde el archivo timestamped, Claude Code la mueve.

### §0.7 Autoejecución — Claude Code decide qué P correr

**Sergio no le pasa el prompt de cada P.** Al iniciar sesión, Claude Code sigue este algoritmo:

1. Lee todos los archivos de §0.1.
2. Lista `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P*.md` ordenados por timestamp.
3. Detecta la **última P completada**: la del archivo más reciente con timestamp válido y contenido no vacío.
4. La siguiente P a ejecutar es `P{ultima + 1}`.
5. Si no hay archivos previos: la P a ejecutar es **P0**.
6. Si el último snapshot `docs/_notas/snapshot-P{n}.md` existe pero el archivo de aprendizajes correspondiente **no existe**, esa P quedó a medias → **retomar P{n}** desde donde quedó (leer el snapshot para saber estado).
7. **Antes de arrancar**, Claude Code muestra un mensaje breve:
   ```
   📋 Detecté que la última P completada es P{n-1}.
   Voy a ejecutar P{n} — {Nombre}.
   Modo Claude Code recomendado: {modo} · Contrato: 🟡 pausa-en-comandos.
   Cambia el modo con Shift+Tab si aún no lo hiciste. ¿Empiezo? (s / n / P{otro})
   ```
8. Sergio responde:
   - `s` (o cualquier confirmación) → arranca la P.
   - `n` → espera instrucciones.
   - `P{otro}` → ejecuta esa P en lugar de la detectada (útil si hay que repetir o saltar).

**Si Sergio dice "sigue" o "continúa" sin más contexto:** Claude Code aplica el algoritmo anterior y arranca la siguiente P.

---

## §1 · P0 — Inventario y alineación con lo existente

> **⚙ Modo Claude Code recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. No hay cambios de código; solo lectura del repo y generación de 1 archivo doc. Cero riesgo.

> **Regla dura:** ninguna P posterior (P1 en adelante) puede ejecutarse si `docs/_notas/inventario-if02.md` no existe o está desactualizado. Cada P referencia el inventario para resolver rutas reales antes de crear archivos nuevos.

### §1.1 Diseño

**Objetivo.** Antes de tocar código, Claude Code inventaría lo que la base v0.dev ya generó, para que las Ps siguientes se ejecuten sobre nombres y rutas **reales del repo**, no sobre nombres inventados en este plan. Esto elimina el riesgo de crear estructura duplicada.

**Producto.** Un solo archivo: `docs/_notas/inventario-if02.md`

**Contenido del inventario:**

1. **Árbol real** de `components/console/`, `components/ui/`, `app/`, `app/api/`, `lib/types/`, `lib/validators/`, `lib/console-data.ts` (2 niveles de profundidad).
2. **Mapa componente → P**: por cada componente/carpeta relevante, indicar a qué P le corresponde extenderlo (o si es reutilizable transversal).
3. **Rutas API existentes**: método, path, propósito inferido, si escribe vía Make o directo.
4. **Types existentes**: qué entidades ya están tipadas, cuáles faltan.
5. **Componentes reutilizables detectados**: `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`, `SLABadge`, `StateBadge`, `EventTimeline`, etc. Con su ruta real.
6. **Reglas A, B, C ya implementadas**: dónde vive hoy en el código (archivo + líneas) la lógica de visibilidad del botón "Asignar Tasador", el Alert destructivo, el modo consulta.
7. **Overrides al plan**: sección final con formato `Plan dice X → Repo usa Y → P{n} debe apuntar a Y`. Esta sección es la que hace que P1-P9 respeten lo construido.

**Ejemplo de override esperado:**

```
Plan §5.1 propone crear "components/console/form-solicitud/".
Repo ya tiene "components/console/nueva-solicitud-form.tsx" (archivo único).
Decisión: P4 extiende ese archivo dividiéndolo en 4 secciones dentro de la misma carpeta,
NO crea "components/console/form-solicitud/" nuevo.
```

### §1.2 Construcción — Pasos para Claude Code

1. Ejecutar:
   ```bash
   tree -L 3 -I 'node_modules|.next|.git' components/ app/ lib/ > /tmp/tree.txt
   cat /tmp/tree.txt
   ```
2. Ejecutar:
   ```bash
   grep -rn "export default\|export function\|export const" components/console/ | head -100
   ls app/api/ && find app/api -name "route.ts"
   ls lib/types/ 2>/dev/null && grep -l "interface\|type " lib/types/*.ts 2>/dev/null
   grep -rn "console-data\|mock" lib/ components/ | head -30
   ```
3. Detectar dónde vive la lógica de las Reglas A, B, C hoy:
   ```bash
   grep -rn "Asignar Tasador\|asignar.*tasador\|puedeAsignar" components/ app/
   grep -rn "readOnly\|modoConsulta\|read-only" components/console/
   grep -rn "setError\|Alert.*destructive\|toast\.error" components/console/
   ```
4. Detectar componentes del panel lista existentes (para P5):
   ```bash
   grep -rn "Tabs\|TabsList\|TabsTrigger\|filtros\|Filtros" components/console/
   grep -rn "SolicitudCard\|SolicitudRow\|SolicitudItem" components/console/
   grep -rn "useSearchParams\|SearchParams" app/ components/
   ```
5. Componer `docs/_notas/inventario-if02.md` con las 7 secciones de §1.1.
6. **Sección crítica — Overrides al plan:** por cada P del plan (P1 a P9), agregar 1-3 overrides si detecta divergencia entre lo que el plan propone y lo que el repo ya tiene. Si no hay divergencia para una P, escribir `P{n}: sin overrides, el plan aplica tal cual`.
7. Al final, un checklist de riesgos:
   - Archivos que el plan propone crear y que ya existen con otro nombre.
   - Dependencias mencionadas en el plan que faltan en `package.json`.
   - Rutas API mencionadas que faltan y hay que crear en P2.
8. Generar el archivo de aprendizajes de esta tanda: `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.md` con timestamp real, siguiendo la plantilla de §10.2.

### §1.3 Criterios de aceptación

- [ ] `docs/_notas/inventario-if02.md` existe y tiene las 7 secciones.
- [ ] La sección "Overrides al plan" cubre P1 a P9 (aunque sea con "sin overrides").
- [ ] Los componentes reutilizables (RUTField, StateBadge, etc.) están listados con su ruta real.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P0.md` creado con timestamp real.
- [ ] **No se modificó ningún archivo de código en esta P.** Solo lectura + generación de 2 archivos doc.

---

## §2 · P1 — Types TypeScript (v1.9)

> **⚙ Modo Claude Code recomendado:** `auto mode on`
> **🟢 Contrato de comportamiento:** **libre**. Solo agrega tipos TS + corre `pnpm tsc --noEmit`. Los errores los atrapa el compilador.

### §2.1 Diseño

**Objetivo.** Tipar todas las entidades del schema v1.9 antes de tocar API routes o UI, para que el compilador atrape cualquier campo mal referenciado.

**Fuente de verdad:** `docs/schema-airtable.md` (sección TX_ y M_ actualizada) + rutas reales del inventario P0.

**Entidades a tipar** (los archivos destino se resuelven contra el inventario P0; si `lib/types/` no existe con esa estructura, se ajusta):

| Archivo esperado | Entidades |
|---|---|
| `lib/types/solicitud.ts` | `Solicitud`, `EstadoSolicitud`, `ModoCreacion`, `TipoPropiedad`, `TipoClienteOrigen`, `EstadoConservacion`, `OrigenDireccion`, `Prioridad`, `NivelSLA` |
| `lib/types/unidad.ts` | `Unidad`, `TipoBien`, `OrigenSuperficie`, `EstadoUnidad` |
| `lib/types/contacto-visita.ts` | `ContactoVisita`, `RolContacto`, `EstadoContacto` |
| `lib/types/vendedor.ts` | `Vendedor`, `TipoPersona` |
| `lib/types/tasador.ts` | `Tasador` (ya existe — verificar) |
| `lib/types/adjunto.ts` | `Adjunto`, `TipoDocumento`, `EstadoExtraccion` (ya existe — verificar) |
| `lib/types/evento.ts` | `Evento`, `EventoTipo` (agregar tipos v1.9) |
| `lib/types/filtros.ts` | `FiltrosSolicitudes`, `VistaSolicitudes`, `OrdenSolicitudes` (para P5) |
| `lib/types/index.ts` | Re-export barrel |

**Catálogos cerrados (const arrays con `as const`):**

```ts
export const TIPOS_BIEN = [
  'edificacion', 'terreno', 'estacionamiento_cubierto',
  'estacionamiento_descubierto', 'estacionamiento_uso_goce',
  'bodega', 'piscina', 'obras_complementarias'
] as const;

export const ORIGEN_SUPERFICIE = [
  'carta_inmobiliaria', 'plano', 'base_sii',
  'certificado_avaluo', 'medicion_tasador'
] as const;

export const ESTADO_CONSERVACION = [
  'nuevo', 'sin_uso', 'bueno', 'normal', 'malo', 'deficiente'
] as const;

export const ROL_CONTACTO = [
  'propietario', 'corredor', 'arrendatario', 'conserje', 'otro'
] as const;

export const ESTADO_CONTACTO = [
  'valido', 'no_contesta', 'telefono_erroneo'
] as const;

export const MODO_CREACION = ['documentos', 'manual'] as const;
export const TIPO_PROPIEDAD = ['nuevo', 'usado'] as const;
export const TIPO_CLIENTE_ORIGEN = ['correo_texto', 'correo_ficha', 'extranet'] as const;
export const ESTADO_UNIDAD = ['nueva', 'usada'] as const;
export const TIPO_PERSONA = ['juridica', 'natural'] as const;

// Para P5
export const VISTAS_SOLICITUDES = ['mi_cartera', 'sla_riesgo', 'por_asignar', 'aprobadas', 'todas'] as const;
export const ORDEN_SOLICITUDES = ['sla_desc', 'sla_asc', 'fecha_solicitud_desc', 'prioridad'] as const;
export const PRIORIDAD = ['normal', 'urgente', 'critico'] as const;
export const NIVEL_SLA = ['verde', 'ambar', 'rojo'] as const;
```

**Extensiones críticas a `Solicitud`:**

```ts
export interface Solicitud {
  // ...campos existentes (verificar contra inventario P0)
  ejec_formalizador?: string;
  tipo_propiedad: TipoPropiedad;
  modo_creacion: ModoCreacion;
  tipo_cliente_origen?: TipoClienteOrigen;
  estado_conservacion?: EstadoConservacion;
  origen_direccion?: OrigenDireccion;
  fecha_asignacion?: string; // ISO datetime
  email_thread_id?: string;
  prioridad: Prioridad;
  nivel_sla: NivelSLA;
  sla_dias_restantes: number;
  fecha_vencimiento?: string;
  unidades: Unidad[];
  contactos_visita: ContactoVisita[];
  vendedor?: Vendedor;
}
```

### §2.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P1 del inventario:** leer `docs/_notas/inventario-if02.md` sección "Overrides al plan · P1". Ajustar rutas de destino según lo que diga el inventario.
2. **Auditar lo existente:**
   ```bash
   grep -r "interface Solicitud\|type Solicitud" lib/types/ components/
   ```
   Listar qué ya existe. **No duplicar.** Ampliar.
3. Crear/actualizar los archivos en `lib/types/` según §2.1 (o donde el inventario indique).
4. Actualizar `lib/types/index.ts` con re-exports.
5. Correr `pnpm tsc --noEmit` y arreglar cualquier error de tipo derivado.
6. Si algún componente rompe por el nuevo campo obligatorio, marcar el campo como opcional temporalmente con comentario `// TODO P{n}: obligatorio tras migrar`.
7. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1.md` con timestamp real.

### §2.3 Criterios de aceptación

- [ ] `pnpm tsc --noEmit` pasa sin errores.
- [ ] Cada catálogo cerrado tiene su `const array` + su `type` derivado.
- [ ] Ningún `type` usa `any` en los campos del schema.
- [ ] `Solicitud.unidades` es `Unidad[]` (no `any[]`).
- [ ] No se duplicaron entidades ya existentes (verificado contra inventario P0).
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P1.md` creado.

---

## §3 · P2 — API Routes nuevas y actualizadas

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Antes de ejecutar `pnpm install`, `pnpm dev` o cualquier script que llame a Airtable/Make, Claude Code muestra el comando y pide confirmación explícita ("¿ejecuto? s/n"). Edición de archivos libre.

### §3.1 Diseño

**Principio.** Toda ruta escribe **solo** vía webhook Make o Airtable Automation. Lecturas van directas a Airtable REST con SDK (`airtable` npm) o vía fetch server-side.

**Rutas a crear/actualizar** (verificar contra inventario P0 qué ya existe):

| Ruta | Método | Propósito | Escribe vía |
|---|---|---|---|
| `/api/solicitudes` | GET | Listar con filtros + búsqueda + orden + paginación (para P5) | Airtable directo |
| `/api/solicitudes` | POST | Crear solicitud (REGLA B aplicada) | Make SC01 |
| `/api/solicitudes/[id]` | GET | Leer solicitud + hijos | Airtable directo |
| `/api/solicitudes/[id]` | PATCH | Editar solicitud (REGLA C) | Make SC-Edicion |
| `/api/solicitudes/[id]/asignar` | POST | Asignar tasador (REGLA A) | Make SC-Asignar |
| `/api/solicitudes/[id]/unidades` | POST/PATCH/DELETE | CRUD de unidades | Make SC-Unidades |
| `/api/solicitudes/[id]/contactos` | POST/PATCH/DELETE | CRUD de contactos | Make SC-Contactos |
| `/api/solicitudes/[id]/vendedor` | POST/PATCH | Upsert vendedor | Make SC-Vendedor |
| `/api/solicitudes/contadores` | GET | Contadores por vista (mi_cartera, sla_riesgo, por_asignar, aprobadas) | Airtable directo |
| `/api/tasadores/candidatos?comuna=X` | GET | Listar tasadores con comuna en cobertura, con carga actual | Airtable directo |
| `/api/catalogos/tipos-bien` | GET | Leer `M_TiposDeBien` | Airtable directo |
| `/api/catalogos/clientes` | GET | Leer `M_Clientes` (para filtro P5) | Airtable directo |
| `/api/catalogos/tasadores` | GET | Leer `M_Tasadores` (para filtro P5) | Airtable directo |

**Rutas a NO crear (por REGLA A):**
- ❌ `/api/solicitudes/[id]/reasignar` — no existe reasignación formal.

**Query params de `GET /api/solicitudes` (para P5):**

```
vista        = mi_cartera | sla_riesgo | por_asignar | aprobadas | todas
cliente_id   = string (opcional, filtro)
tasador_id   = string (opcional, filtro)
estado       = EstadoSolicitud (opcional, filtro)
prioridad    = normal | urgente | critico (opcional, filtro)
fecha_desde  = YYYY-MM-DD (opcional)
fecha_hasta  = YYYY-MM-DD (opcional)
q            = string (búsqueda: código VP, RUT comprador, dirección)
orden        = sla_desc | sla_asc | fecha_solicitud_desc | prioridad
page         = number (default 1)
pageSize     = number (default 20)
```

**Response:**
```ts
{
  solicitudes: Solicitud[],
  total: number,
  page: number,
  pageSize: number
}
```

**Contrato de respuesta de error (REGLA B):**

```ts
// 422 Unprocessable Entity
{
  error: 'validacion',
  campos: [
    { campo: 'rut_comprador', motivo: 'RUT inválido (dígito verificador)' },
    { campo: 'unidades.1.sup_construida_m2', motivo: 'Obligatoria si tipo_bien=edificacion' },
    { campo: 'contactos_visita.0.telefono', motivo: 'Formato inválido' }
  ]
}

// 409 Conflict
{
  error: 'conflicto_negocio',
  campo: 'numero_operacion',
  motivo: 'N° de operación 12345 ya existe en solicitud VP-2026-0087'
}
```

**Variables de entorno requeridas** (Railway y `.env.local`):

```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=app9G7lLkIV3CpeLa
MAKE_WEBHOOK_URL_SC01=
MAKE_WEBHOOK_URL_SC_ASIGNAR=
MAKE_WEBHOOK_URL_SC_EDICION=
MAKE_WEBHOOK_URL_SC_UNIDADES=
MAKE_WEBHOOK_URL_SC_CONTACTOS=
MAKE_WEBHOOK_URL_SC_VENDEDOR=
MAKE_HMAC_SECRET=
CLERK_SECRET_KEY=
```

### §3.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P2 del inventario.** Listar qué rutas API ya existen y su comportamiento actual.
2. **Auditar lo existente:**
   ```bash
   ls -R app/api/
   ```
3. Crear helper `lib/airtable/client.ts` con instancia única de Airtable REST (si no existe según inventario).
4. Crear helper `lib/make/webhook.ts` con firma HMAC-SHA256 (mismo patrón de RF-09).
5. Crear cada ruta según §3.1. En cada `POST/PATCH`:
   - Validar payload con zod.
   - Si zod falla → responder 422 con contrato `{error, campos}`.
   - Verificar unicidad (`numero_operacion`) contra Airtable → si duplica, responder 409.
   - Firmar payload con HMAC y disparar webhook Make.
   - Devolver `{ok: true, id}` o esperar respuesta síncrona según diseño Make.
6. Rutas GET leen directo con `airtable` SDK, no vía Make.
7. Para `GET /api/solicitudes` (P5): implementar filtros server-side, búsqueda con `filterByFormula` de Airtable, paginación con `offset`, ordenamiento con `sort`.
8. Crear archivo `lib/validators/solicitud.zod.ts` con schemas zod compartidos entre form y API.
9. Añadir env vars faltantes a `.env.example` con comentario del origen.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2.md` con timestamp real.

**No implementar todavía los scenarios de Make en este P.** Los webhooks devuelven mocks temporales; la conexión real se cierra en P9.

### §3.3 Criterios de aceptación

- [ ] Todas las rutas de §3.1 responden con status coherente en curl / Postman.
- [ ] Error 422 sigue exactamente el contrato de REGLA B.
- [ ] Ninguna ruta usa Airtable SDK para **escribir** (solo lectura).
- [ ] `GET /api/solicitudes` acepta y aplica todos los query params.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Rutas existentes se extendieron; no se duplicaron con otro nombre.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P2.md` creado.

---

## §4 · P3 — Wizard de creación (3 fases)

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Edición libre. Antes de correr `pnpm dev` o instalar dependencias nuevas, pide confirmación.

### §4.1 Diseño

**Ubicación esperada:** `components/console/wizard-nueva-solicitud/` — **verificar contra inventario P0**. Si el repo tiene el wizard en otra ruta o como archivo único, ajustar.

**Estructura:**

```
wizard-nueva-solicitud/
├── index.tsx                    # Contenedor con estado del wizard
├── fase-1-modo-creacion.tsx     # Radio: documentos | manual
├── fase-2-tipo-propiedad.tsx    # Radio: nuevo | usado
├── fase-3-formulario.tsx        # Delega a components/console/form-solicitud
└── stepper.tsx                  # Indicador visual 1-2-3
```

**Trigger:** botón "Nueva solicitud" en el header de la Consola Ejecutiva → abre `Sheet` lateral (shadcn/ui `sheet`) con el wizard.

**Fase 1 — Modo de creación:**
- 2 `RadioGroup` cards grandes:
  - **En base a documentos adjuntos** → habilita `FileUploadZone` justo debajo. Al subir docs, ejecuta SC07 (RF-09) y pre-llena el formulario en Fase 3.
  - **Manual** → Fase 3 empieza en blanco.
- Botón "Continuar" habilitado siempre; si eligió documentos y no subió nada, avisa con `AlertDialog` "¿Continuar sin documentos?".

**Fase 2 — Tipo de propiedad:**
- 2 `RadioGroup` cards grandes: **Nuevo** / **Usado**.
- Este dato es interruptor de todo el flujo (afecta bloque Vendedor, campo "Modelo" en Unidades, sección Financiero, marca "en trámite" en Rol SII).
- Botón "Continuar" deshabilitado hasta elegir.

**Fase 3 — Formulario:**
- Renderiza `<FormSolicitud modo={modo} tipoPropiedad={tipoPropiedad} preLlenado={datosExtraidos} />`.
- Este componente vive en P4.

**Estado del wizard:**

```ts
type WizardState = {
  fase: 1 | 2 | 3;
  modo?: ModoCreacion;
  tipoPropiedad?: TipoPropiedad;
  datosExtraidos?: Partial<Solicitud>;
  archivosSubidos: Adjunto[];
};
```

Mantener en `useState` local del componente contenedor. **No usar `localStorage`.**

**Navegación:**
- Botón "Atrás" en Fase 2 y Fase 3 preserva selecciones previas.
- Cerrar el Sheet en cualquier fase → `AlertDialog` "¿Descartar la solicitud en curso?".

### §4.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P3 del inventario.**
2. **Auditar existente:**
   ```bash
   grep -r "wizard\|nueva-solicitud\|NuevaSolicitud" components/ app/
   ```
3. Crear los 5 archivos de §4.1 con shadcn `Sheet`, `RadioGroup`, `Button`, `AlertDialog`. **Si ya existe algo funcional, extenderlo en su ruta actual.**
4. Componente `Stepper` reutiliza tokens de `globals.css` (colores `--vp-blue`, `--vp-orange`).
5. Cablear botón "Nueva solicitud" del header con estado de apertura del Sheet.
6. En Fase 1 modo `documentos`: reutilizar `FileUploadZone` existente (ruta según inventario). Cada archivo dispara `POST /api/adjuntos` (ya existe de RF-09).
7. Cuando SC07 devuelve extracción exitosa (polling o webhook), guardar `datosExtraidos` en el estado del wizard.
8. Fase 3: renderiza `FormSolicitud` (placeholder que se completa en P4).
9. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3.md` con timestamp real.

### §4.3 Criterios de aceptación

- [ ] Click en "Nueva solicitud" abre el Sheet en Fase 1.
- [ ] Selección de modo persiste al ir a Fase 2 y volver.
- [ ] "Nuevo" en Fase 2 hace que Fase 3 muestre bloque Vendedor con "Razón social" (jurídica).
- [ ] "Usado" en Fase 2 hace que Fase 3 muestre bloque Vendedor con "Nombre completo" (natural).
- [ ] Cerrar el Sheet pide confirmación si hay datos capturados.
- [ ] Si ya existía un flujo de creación previo, se extendió, no se duplicó.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P3.md` creado.

---

## §5 · P4 — Formulario 4 secciones con bloques repetibles

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. REGLA B (validaciones) es el punto más frágil de todo IF-02: edición libre pero pausa obligatoria antes de cualquier comando de terminal.

### §5.1 Diseño

**Ubicación esperada:** `components/console/form-solicitud/` — **verificar contra inventario P0**.

**Estructura:**

```
form-solicitud/
├── index.tsx                          # Contenedor RHF + zod
├── seccion-a-origen.tsx               # Origen y contactos
├── seccion-b-propiedad.tsx            # Propiedad y unidades
├── seccion-c-personas.tsx             # Comprador y vendedor
├── seccion-d-producto.tsx             # Producto y financiero
├── bloque-unidad.tsx                  # Fila repetible de unidad
├── bloque-contacto.tsx                # Fila repetible de contacto
├── alert-errores.tsx                  # Alert destructivo REGLA B
└── validators.ts                      # zod schemas por sección
```

**Sección A — Origen**
- Banco originador (M_BANCOS lookup)
- N° de operación cliente
- Sucursal originadora
- Ejecutivo solicitante
- Canal (email / teléfono / WhatsApp / presencial)
- Ejec. Comercializador
- **Ejec. Formalizador** (nuevo v1.9, opcional)
- **Tipo de cliente de origen** (nuevo v1.9): correo_texto / correo_ficha / extranet
- Bloque repetible **Contactos de visita** (mínimo 1):
  - Rol (propietario / corredor / arrendatario / conserje / otro)
  - Nombre
  - Teléfono
  - Email
  - Estado del contacto (valido / no_contesta / telefono_erroneo)
  - Orden = índice + 1

**Sección B — Propiedad**
- Proyecto o condominio (obligatorio si `tipoPropiedad=nuevo`)
- Dirección (Google Places)
- **Origen de la dirección** (RN-46): ficha_cliente / certificado_avaluo / certificado_numero
- Región → Comuna (cascade sobre M_Comunas)
- Tipo de propiedad (M_TiposPropiedad)
- **Estado de conservación** (nuevo, sin_uso, bueno, normal, malo, deficiente)
- Bloque repetible **Unidades** (mínimo 1):
  - Depto / Torre / Piso
  - Modelo (solo si `tipoPropiedad=nuevo`)
  - Tipo de bien (M_TiposDeBien, 8 valores)
  - Con rol / Uso y goce (aplica a estacionamiento, bodega, terreno)
  - Rol SII (obligatorio si "con rol"; marca "en trámite" solo si nuevo)
  - Sup. construida m² + **origen** + adjunto respaldo
  - Sup. terraza m² + **origen** + adjunto respaldo
  - Sup. terreno m² + **origen** + adjunto respaldo
  - Ampliación m² + regularizable (checkbox)
  - Año construcción · Material

**Sección C — Personas de la operación**
- Comprador: RUT (módulo 11), nombre completo, email, teléfono
- Vendedor:
  - Si nuevo: Razón social, RUT, contacto, email, teléfono (jurídica)
  - Si usado: Nombre completo, RUT, contacto, email, teléfono (natural)
  - Origen del dato (RN-47): correo / ficha / certificado_avaluo

**Sección D — Producto y observaciones**
- Cliente institucional
- Tipo de informe (filtrado por `M_Clientes.tipos_informe_permitidos`)
- Banco financista (obligatorio si producto ∈ {Hipotecario, Refinanciamiento})
- Observaciones
- **Bloque Financiero** (colapsado por defecto, visible solo si `tipoPropiedad=nuevo`):
  - Valor total UF
  - Subsidio habitacional
  - Ahorro
  - Mutuo hipotecario
  - Pago contado
  - Bono captación
  - Bono integración
  - Precio de venta

**Validación — REGLA B**

Al hacer submit:
1. RHF valida con zod → si hay errores, `handleSubmit` no dispara el onSubmit.
2. En el `onError` de RHF, construir la lista de errores con etiquetas legibles:
   ```ts
   const errores = flattenErrors(formState.errors, {
     'unidades.0.sup_construida_m2': 'Unidad 1 · Superficie construida',
     // ...
   });
   ```
3. Disparar toast con los primeros 3 + "+N más".
4. Setear estado `alertErrores = errores` para renderizar `<AlertErrores />` al inicio del form.
5. Scroll al primer error.
6. Si zod pasó pero POST /api/solicitudes devuelve 422 → mismo tratamiento con `campos` del response.
7. Si POST devuelve 409 (`numero_operacion` duplicado) → `setError('numero_operacion', ...)` + toast específico + Alert.

### §5.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P4 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "form-solicitud\|FormSolicitud\|useForm" components/console/
   ```
3. Crear los 9 archivos según §5.1 (o extender los existentes según inventario).
4. Contenedor `index.tsx`:
   - `useForm({ resolver: zodResolver(solicitudSchema), defaultValues: preLlenado })`
   - `useFieldArray` para `unidades` y `contactos_visita`
   - `onSubmit` → `POST /api/solicitudes` → si ok, cerrar wizard + toast éxito + navegar a `/solicitudes/[id]`
5. `AlertErrores`: componente shadcn `Alert` variant destructive con lista de campos + motivo.
6. `validators.ts`: schemas zod separados por sección + schema compuesto.
7. Los mensajes de zod están en español y son legibles para no-técnicos.
8. Bloques repetibles: botón `+ Agregar unidad` / `+ Agregar contacto`; botón `🗑 Eliminar` con `AlertDialog` si es el último.
9. Reutilizar componentes existentes según inventario: `RUTField`, `EmailField`, `AddressField`, `RegionComunaSelector`, `FileUploadZone`.
10. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4.md` con timestamp real.

### §5.3 Criterios de aceptación

- [ ] Submit con campos vacíos muestra toast **Y** Alert destructivo con nombres precisos ("Unidad 2 · Sup. construida" etc.).
- [ ] `numero_operacion` duplicado dispara error específico en ese campo + toast + Alert.
- [ ] Cambiar `tipoPropiedad` en Fase 2 y volver al form muestra/oculta bloque Financiero.
- [ ] Rol SII permite "en trámite" solo si `tipoPropiedad=nuevo`.
- [ ] Cada superficie exige `origen` + `adjunto_respaldo` (RN-45).
- [ ] Submit válido crea solicitud (mock ok), cierra wizard, navega al detalle.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P4.md` creado.

---

## §6 · P5 — Panel lista + vistas + filtros + búsqueda + orden

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. UI de lectura pura (no cambia estado de solicitudes). Edición libre, pausa en comandos de terminal.

### §6.1 Diseño

**Contexto.** Es el panel izquierdo del layout P2 Lista + Detalle (patrón v0.dev). Es la puerta de entrada a la app: sin él no hay forma de encontrar una solicitud salvo por URL directa. Consume `GET /api/solicitudes` con filtros server-side.

**Ubicación esperada:** `components/console/panel-lista/` — **verificar contra inventario P0**.

**Estructura:**

```
panel-lista/
├── index.tsx                       # Contenedor del panel izquierdo
├── tabs-vistas.tsx                 # 5 tabs con contadores
├── buscador.tsx                    # Input de búsqueda global (debounce 300ms)
├── filtros.tsx                     # Fila colapsable con 5 selectores
├── selector-orden.tsx              # DropdownMenu con 4 opciones
├── fila-solicitud.tsx              # Card por solicitud
├── paginacion.tsx                  # Prev/Next + info
└── hooks/
    ├── use-solicitudes.ts          # Fetch a /api/solicitudes con SWR o similar
    └── use-filtros-url.ts          # Sync estado ↔ query params
```

**Layout visual (basado en captura de referencia):**

```
┌───────────────────────────────────────────────────┐
│ Header VProperty          [🔍 Buscar por VP, RUT...] │
├───────────────────────────────────────────────────┤
│ [Mi cartera] [SLA riesgo ●3] [Por asignar ●1]    │
│ [Aprobadas] [Todas]                               │
├───────────────────────────────────────────────────┤
│ ⚙ Filtros ▲                    Orden: [SLA desc ▼]│
│ ┌─────────────┬─────────────┐                    │
│ │ Cliente     │ Tasador     │                    │
│ │ [Todos ▼]   │ [Todos ▼]   │                    │
│ ├─────────────┼─────────────┤                    │
│ │ Estado      │ Prioridad   │                    │
│ │ [Todos ▼]   │ [Todas ▼]   │                    │
│ ├─────────────┴─────────────┤                    │
│ │ Fecha solicitud            │                    │
│ │ [01 jun 2026 - 30 jun 2026]│                    │
│ └───────────────────────────┘                    │
├───────────────────────────────────────────────────┤
│ ▪ VP-2024-0081 · Banco Santander · Providencia   │
│   [Asignada] [SLA ●] [Normal] · María Espinoza   │
│ ▪ VP-2024-0080 · BCI · Las Condes                │
│   [Creada] [SLA ●] [Urgente] · Sin asignar       │
│ ...                                               │
├───────────────────────────────────────────────────┤
│ [◀ Anterior]  Página 1 de 4  [Siguiente ▶]       │
└───────────────────────────────────────────────────┘
```

**Tabs de vistas (con contadores):**

| Tab | Filtro server-side | Contador |
|---|---|---|
| Mi cartera | `ejec_comercializador = user.email` OR `ejec_formalizador = user.email` | Count |
| SLA en riesgo | `nivel_sla IN ('ambar', 'rojo')` | Badge rojo con count |
| Por asignar | `tasador_id IS NULL AND estado IN ('creada', 'requiere_atencion')` | Badge naranja con count |
| Aprobadas | `estado = 'aprobada'` | Count |
| Todas | sin filtro | Count |

Los contadores vienen de `GET /api/solicitudes/contadores` (ejecución paralela al fetch de la lista).

**Buscador (top-right, global):**
- Placeholder: `"Buscar por código VP-AAAA-NNNN, RUT o dirección"`.
- Ícono `Search` (lucide) a la izquierda.
- Debounce 300ms antes de disparar fetch.
- Query se envía como `?q=...` al endpoint.
- Server-side: `filterByFormula` de Airtable con `OR(FIND(q, codigo_vp), FIND(q, rut_comprador), FIND(q, direccion))`.
- Enter → dispara inmediatamente sin esperar debounce.
- Botón X para limpiar (aparece cuando hay texto).

**Filtros (colapsables, cerrados por defecto en móvil, abiertos en desktop):**
- Cliente: `Select` con `M_Clientes` (opción "Todos" al inicio).
- Tasador: `Select` con `M_Tasadores` (opción "Todos" + "Sin asignar" como opción especial).
- Estado: `Select` con enum `EstadoSolicitud`.
- Prioridad: `Select` con `PRIORIDAD` (Normal / Urgente / Crítico).
- Fecha solicitud: `DateRangePicker` de shadcn.
- Botón "Limpiar filtros" al final (visible cuando hay ≥1 filtro activo).

**Selector de orden (DropdownMenu):**
- SLA descendente (por defecto) — más urgentes primero
- SLA ascendente
- Fecha solicitud (más recientes primero)
- Prioridad (crítico → urgente → normal)

**Fila de solicitud (`FilaSolicitud`):**
- Código `VP-AAAA-NNNN` (link a `/solicitudes/[id]`)
- Cliente + comuna en 2ª línea
- `StateBadge` (reutilizar existente)
- `SLABadge` verde/ámbar/rojo con días restantes
- Badge de prioridad
- Nombre del tasador o "Sin asignar" (badge gris)
- Fecha vencimiento (formato relativo: "vence en 3 días")
- Fila **resaltada** cuando `params.id === solicitud.id` (patrón P2 Lista + Detalle: al hacer click, el panel derecho muestra el detalle P6).

**URL sync (`useFiltrosUrl`):**

Todos los filtros, orden, vista, búsqueda y página se sincronizan con `searchParams` de Next.js:

```
/solicitudes?vista=por_asignar&estado=creada&orden=sla_desc&q=VP-2024&page=2
```

Ventaja: la URL es compartible y el back/forward del navegador funciona. Usar `useRouter` + `useSearchParams` de `next/navigation`.

**Paginación:**
- Server-side: 20 filas por página (configurable).
- Botones "Anterior" / "Siguiente" + info "Página X de Y".
- No cargar todo al inicio.

### §6.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P5 del inventario.**
2. **Auditar:**
   ```bash
   grep -rn "TabsList\|TabsTrigger" components/console/
   grep -rn "SolicitudCard\|SolicitudRow\|SolicitudItem" components/console/
   grep -rn "DateRangePicker\|Calendar" components/ui/
   grep -rn "useSearchParams" app/ components/
   ```
3. Verificar que shadcn tenga instalados: `Tabs`, `Select`, `DropdownMenu`, `Command` (para el buscador si se hace command palette), `Calendar` + `DateRangePicker`, `Popover`.
4. Crear los archivos de §6.1 (o extender los existentes según inventario).
5. Hook `useSolicitudes`:
   - Fetch a `GET /api/solicitudes` con query params derivados del estado.
   - Refetch automático al cambiar filtros.
   - Loading skeleton mientras carga.
6. Hook `useFiltrosUrl`:
   - Lee `useSearchParams` al montar.
   - Al cambiar filtro, hace `router.push(?params)` sin recargar.
   - Exporta getters y setters tipados.
7. Buscador: implementar debounce 300ms con `useDeferredValue` o custom hook.
8. Cablear la vista `Mi cartera` con el email del usuario Clerk (`useUser().user.emailAddresses[0]`).
9. `FilaSolicitud` es un `Link` de Next.js a `/solicitudes/[id]` — cuando se hace click, el detalle (P6) aparece en el panel derecho.
10. Contadores de tabs: fetch paralelo a `GET /api/solicitudes/contadores` con SWR o `useEffect`.
11. Estado vacío: si `total === 0`, mostrar mensaje "No hay solicitudes que coincidan" + botón "Limpiar filtros".
12. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5.md` con timestamp real.

### §6.3 Criterios de aceptación

- [ ] Click en tab cambia vista, actualiza URL (`?vista=...`), refresca lista.
- [ ] Contadores en tabs "SLA en riesgo" y "Por asignar" coinciden con el conteo real de Airtable.
- [ ] Buscar por código `VP-2024` filtra correctamente (debounce 300ms).
- [ ] Buscar por RUT del comprador funciona.
- [ ] Filtrar por Cliente + Prioridad se ve reflejado en la URL.
- [ ] Cambiar orden a "Fecha solicitud" reordena la lista.
- [ ] Rango de fechas filtra correctamente.
- [ ] Click en fila navega a `/solicitudes/[id]` y resalta la fila seleccionada.
- [ ] Recargar la página con `?vista=por_asignar&estado=creada` restaura el estado exacto.
- [ ] Paginación funciona (siguiente/anterior).
- [ ] Estado vacío se ve bien cuando no hay resultados.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P5.md` creado.

---

## §7 · P6 — Panel detalle (2 botones, 3 pestañas)

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. REGLAS A y C viven acá — edición libre, pausa obligatoria en comandos.

### §7.1 Diseño

**Ruta esperada:** `app/solicitudes/[id]/page.tsx` — **verificar contra inventario P0**.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ Cabecera: VP-2026-XXXX · StateBadge · SLA · P  │
│ [Asignar Tasador]  [Documentos y Adjuntos]     │  ← REGLA A
│ [Editar solicitud]                              │  ← REGLA C (solo estado=creada)
├─────────────────────────────────────────────────┤
│ Tabs: [Datos] [Historial] [Adjuntos]           │
└─────────────────────────────────────────────────┘
```

**Barra de acciones — Lógica de visibilidad (REGLAS A + C):**

```ts
const puedeAsignar =
  !solicitud.tasador_id &&
  !['cancelada', 'cerrada'].includes(solicitud.estado);

const puedeEditar = solicitud.estado === 'creada';

const modoConsulta =
  solicitud.estado !== 'creada' && !!solicitud.tasador_id;
```

- **"Asignar Tasador"** visible solo si `puedeAsignar`. Deshabilitado con tooltip si `datosMinimosFaltantes.length > 0`.
- **"Documentos y Adjuntos"** siempre visible tras crear solicitud.
- **"Editar solicitud"** visible solo si `puedeEditar`.

**Cálculo de `datosMinimosFaltantes` (RN-44):**

```ts
function calcularFaltantes(s: Solicitud): string[] {
  const f: string[] = [];
  if (!s.direccion) f.push('Dirección de la propiedad');
  if (!s.contactos_visita.some(c => c.telefono)) f.push('Al menos 1 contacto con teléfono');
  const rolValido = s.unidades.every(u =>
    !u.con_rol || u.rol_sii || (u.rol_sii_en_tramite && s.tipo_propiedad === 'nuevo')
  );
  if (!rolValido) f.push('Rol SII (o "en trámite" si es Nuevo)');
  return f;
}
```

**Pestaña Datos (10 bloques según §1.3.2 spec v1.9):**

1. Origen y cliente
2. Asignación (tasador, fecha, correo, botones Ver email / Reenviar)
3. Propiedad
4. Vendedor
5. Unidades (tabla)
6. Personas de la operación
7. Contactos de visita
8. Datos SII
9. Antecedentes legales
10. Producto y financiero
11. Decisión del motor (opcional 11º)

Cada bloque es un componente `<BloqueXxx solicitud={s} readOnly={modoConsulta} />`.

**Pestaña Historial:** timeline que renderiza `A_Eventos` + `A_Cambios` con `EventTimeline` (ya existente según inventario).

**Pestaña Adjuntos:** listado readonly de `TX_Adjuntos` con visor embebido. Sin subida (esa vive en el Sheet del botón).

### §7.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P6 del inventario.** Si `BarraAcciones` ya existe con lógica de Reglas A/C, extenderla; no rehacerla.
2. **Auditar:**
   ```bash
   ls app/solicitudes/
   grep -r "BarraAcciones\|action-bar" components/console/
   ```
3. Crear `app/solicitudes/[id]/page.tsx` como server component que hace fetch a `/api/solicitudes/[id]`.
4. Crear `components/console/detalle-solicitud/` (o ruta según inventario):
   ```
   ├── index.tsx                # Client component con Tabs
   ├── barra-acciones.tsx       # 2-3 botones con lógica de visibilidad
   ├── tab-datos.tsx            # 10 bloques
   ├── tab-historial.tsx        # EventTimeline
   ├── tab-adjuntos.tsx         # ListadoAdjuntos readonly
   ├── bloques/
   │   ├── bloque-origen.tsx
   │   ├── bloque-asignacion.tsx
   │   ├── bloque-propiedad.tsx
   │   ├── bloque-vendedor.tsx
   │   ├── bloque-unidades.tsx
   │   ├── bloque-personas.tsx
   │   ├── bloque-contactos.tsx
   │   ├── bloque-sii.tsx
   │   ├── bloque-legales.tsx
   │   └── bloque-producto.tsx
   └── hooks/
       └── use-datos-minimos.ts # Calcula faltantes + retorna tooltip
   ```
5. `BarraAcciones` incluye tooltip con lista de faltantes cuando "Asignar Tasador" está deshabilitado.
6. `Editar solicitud` abre el mismo Sheet del wizard pero directo en Fase 3 con `defaultValues=solicitud`. Endpoint PATCH.
7. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6.md` con timestamp real.

### §7.3 Criterios de aceptación

- [ ] Solicitud sin tasador en estado `creada`: muestra "Asignar Tasador" + "Editar solicitud" + "Documentos y Adjuntos".
- [ ] Solicitud con tasador en estado `asignada`: solo muestra "Documentos y Adjuntos". Todo en modo consulta.
- [ ] Falta la dirección: "Asignar Tasador" deshabilitado con tooltip "Falta: Dirección de la propiedad".
- [ ] Solicitud cancelada: "Asignar Tasador" no aparece.
- [ ] Pestaña Historial muestra eventos ordenados por fecha desc.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P6.md` creado.

---

## §8 · P7 — Diálogo de asignación (cmdk + RN-44/RN-59)

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Es el único P que cambia el **estado real** de una solicitud (`creada → asignada`) y dispara correo al tasador. Antes de cada edición **y** cada comando, Claude Code muestra qué va a hacer y pide confirmación explícita.

### §8.1 Diseño

**Ubicación esperada:** `components/console/dialogo-asignacion/` — **verificar contra inventario P0**.

**Estructura:**

```
├── index.tsx                    # Dialog contenedor 2 pasos
├── paso-1-buscador.tsx          # cmdk con lista de tasadores
├── paso-2-confirmacion.tsx      # Enunciado de consecuencias
└── item-tasador.tsx             # Card en el buscador
```

**Paso 1 — Buscador (cmdk):**
- `Command` de cmdk con `CommandInput` (buscar por nombre o RUT).
- `CommandList` con dos grupos:
  - **En cobertura** (comuna de solicitud ∈ `tasador.zonas_cobertura`): ordenados por carga ascendente.
  - **Fuera de cobertura** (los demás): con badge ámbar `⚠ Fuera de cobertura`.
- Cada `CommandItem` muestra:
  - Nombre · RUT
  - Carga: `casos_en_curso / capacidad_activa` con barra visual
  - Badges: comunas cubiertas, activo
- Al seleccionar → habilita botón "Siguiente".
- Campo `motivo` (opcional, textarea 200 chars).

**Paso 2 — Confirmación (REGLA A):**
- Título: "Confirmar asignación de tasador"
- Cuerpo: enunciado explícito:
  > Al confirmar:
  > - La solicitud pasará al estado **asignada**.
  > - Se registrará la fecha y hora de asignación.
  > - Se enviará el correo de asignación al tasador.
  > - Los datos de la solicitud quedarán en **modo consulta**.
- Si el tasador está fuera de cobertura: `Alert` ámbar "Override informado: fuera de cobertura".
- 2 botones: `[Cancelar]` `[Confirmar asignación]`.

**Al confirmar (secuencia atómica):**
1. `POST /api/solicitudes/[id]/asignar` con `{ tasador_id, motivo? }`.
2. Backend valida `datosMinimosFaltantes = []` en server (defensivo). Si no, 422.
3. Backend dispara webhook Make SC-Asignar (que hace):
   - `TX_Solicitudes.tasador_id` = X
   - `TX_Solicitudes.fecha_asignacion` = NOW
   - `TX_Solicitudes.estado` = `asignada`
   - Insert en `A_Eventos`: `asignacion_manual` + `correo_asignacion_enviado`
   - Dispara SC13 (envío del correo)
4. Front recibe 200 → toast éxito + refresh del detalle → botón "Asignar Tasador" desaparece (REGLA A).

**Fetch de candidatos:**
- Al abrir el diálogo: `GET /api/tasadores/candidatos?comuna=X` devuelve todos ordenados (cobertura primero, luego carga).

### §8.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P7 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "cmdk\|Command\b\|dialogo-asignacion" components/
   ```
3. Verificar que `cmdk` esté en `package.json` (venía de v0.dev).
4. Crear los 4 archivos según §8.1 (o extender los existentes según inventario).
5. Cablear con `BarraAcciones` de P6: `onClick={() => setDialogoAbierto(true)}`.
6. En el `POST /api/solicitudes/[id]/asignar` (creado en P2), validar server-side:
   - `datosMinimosFaltantes = []`
   - `!solicitud.tasador_id` (idempotencia REGLA A: si ya tiene, 409)
   - `estado ∈ {creada, requiere_atencion}`
7. Al éxito: `router.refresh()` o re-fetch del detalle.
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7.md` con timestamp real.

### §8.3 Criterios de aceptación

- [ ] Diálogo abre con Paso 1. Buscador filtra por nombre y RUT.
- [ ] Grupo "En cobertura" aparece arriba, con carga visible.
- [ ] Elegir tasador fuera de cobertura muestra Alert ámbar en Paso 2.
- [ ] Confirmación cambia estado a `asignada`, oculta botón "Asignar Tasador", muestra bloque Asignación con datos.
- [ ] Segundo intento de asignar (si por error se muestra el botón) devuelve 409.
- [ ] Historial muestra evento `asignacion_manual` + `correo_asignacion_enviado`.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P7.md` creado.

---

## §9 · P8 — Sheet Documentos y Adjuntos

> **⚙ Modo Claude Code recomendado:** `accept edits on`
> **🟡 Contrato de comportamiento:** **pausa-en-comandos**. Sube archivos a Dropbox. Bajo riesgo si RF-09 ya funciona. Pausa antes de cualquier comando.

### §9.1 Diseño

**Ubicación esperada:** `components/console/sheet-documentos/` — **verificar contra inventario P0**.

**Estructura:**

```
├── index.tsx              # Sheet lateral
├── checklist.tsx          # 15 tipos de documento
├── zona-carga.tsx         # FileUploadZone reutilizado
└── item-documento.tsx     # Fila del checklist
```

**Trigger:** botón "Documentos y Adjuntos" de la barra de acciones (P6).

**Layout del Sheet:**

```
┌─────────────────────────────────────┐
│ Documentos y Adjuntos               │
│ Solicitud VP-2026-XXXX              │
├─────────────────────────────────────┤
│ ▸ Checklist (15 tipos)              │
│   ☐ Ficha del cliente               │
│     ├─ (archivo o botón "Subir")    │
│   ☐ Certificado avalúo fiscal        │
│     ├─ (archivo o botón "Subir")    │
│   ... 15 filas                       │
├─────────────────────────────────────┤
│ ▸ Zona de carga libre                │
│   [FileUploadZone]                   │
└─────────────────────────────────────┘
```

**Fuente del checklist:** `D_TipoDocumento` filtrando `activo=true` y `uso_ejecutiva=true` → 15 tipos operativos (§4.2.1 spec v1.9).

Cada fila muestra:
- Checkbox marcado (adjunto declarado)
- Nombre del tipo
- Entidad emisora
- Vigencia por defecto
- Si hay archivo asociado: mini-preview + botón "Ver" + botón "Reemplazar" + botón "Eliminar"
- Si no hay archivo: botón "Subir archivo"

**Comportamiento:**
- Marcar un tipo sin archivo → estado "requerido, no subido" (no bloquea nada).
- Subir archivo → `POST /api/adjuntos` (ya existe RF-09) con `tipo_documento_id`.
- Desmarcar un tipo con archivo → `AlertDialog` "¿Descartar vínculo con este archivo?". El archivo queda en Dropbox pero se desvincula (`tipo_documento_id = null`).
- **Modo consulta si `modoConsulta=true`:** solo visor y descarga, sin subir ni editar.

### §9.2 Construcción — Pasos para Claude Code

1. **Consultar overrides P8 del inventario.**
2. **Auditar:**
   ```bash
   grep -r "sheet-documentos\|Checklist\|D_TipoDocumento" components/ lib/
   ```
3. Crear los 4 archivos según §9.1 (o extender los existentes).
4. Reutilizar `FileUploadZone` existente (ruta según inventario).
5. `GET /api/catalogos/tipos-documento` para llenar el checklist (crear si no existe).
6. Estado del checklist deriva de `solicitud.adjuntos` — no requiere endpoint extra.
7. Cablear con `BarraAcciones`: `<SheetDocumentos solicitud={s} readOnly={modoConsulta} />`.
8. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8.md` con timestamp real.

### §9.3 Criterios de aceptación

- [ ] Sheet abre con 15 tipos de documento listados.
- [ ] Subir archivo lo asocia al tipo correcto y muestra preview.
- [ ] Desmarcar tipo con archivo pide confirmación.
- [ ] En modo consulta: no aparecen botones de subir/eliminar; solo Ver/Descargar.
- [ ] Cerrar Sheet no pierde archivos ya subidos.
- [ ] `pnpm tsc --noEmit` pasa.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P8.md` creado.

---

## §10 · P9 — Deploy y validación en Railway

> **⚙ Modo Claude Code recomendado:** `default`
> **🔴 Contrato de comportamiento:** **pausa-total**. Cualquier error se propaga a producción. Antes de cada edición y cada comando (`pnpm build`, `pnpm lint`, push, etc.), Claude Code muestra qué va a hacer y pide confirmación explícita.

### §10.1 Diseño

**Objetivo.** Reemplazar cualquier mock restante, conectar Make scenarios reales, validar en Railway, dejar la app en verde.

### §10.2 Construcción — Pasos para Claude Code

1. **Barrido de mocks:**
   ```bash
   grep -rn "mock\|MOCK\|fake\|TODO P9\|placeholder" app/ components/ lib/
   ```
   Listar y reemplazar cada uno.
2. **Env vars Railway** — Sergio los ingresa en el dashboard de Railway; Claude Code solo actualiza `.env.example`:
   ```
   AIRTABLE_API_KEY
   AIRTABLE_BASE_ID
   MAKE_WEBHOOK_URL_SC01
   MAKE_WEBHOOK_URL_SC_ASIGNAR
   MAKE_WEBHOOK_URL_SC_EDICION
   MAKE_WEBHOOK_URL_SC_UNIDADES
   MAKE_WEBHOOK_URL_SC_CONTACTOS
   MAKE_WEBHOOK_URL_SC_VENDEDOR
   MAKE_HMAC_SECRET
   CLERK_SECRET_KEY
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```
3. **Health check:** crear `app/api/health/route.ts` que valida conectividad a Airtable.
4. **Build local:**
   ```bash
   pnpm build
   ```
   Arreglar cualquier warning de tipos, imports no usados o `use client` faltante.
5. **Lint:**
   ```bash
   pnpm lint
   ```
6. **Smoke test manual (Sergio en local):**
   - Ver panel lista → aplica filtros → busca por VP → resultados correctos.
   - Crear solicitud manual → verifica que llega a Airtable y aparece en la lista.
   - Editar la solicitud en estado `creada` → cambios se reflejan.
   - Asignar tasador → estado pasa a `asignada`, botón desaparece, botón "Editar" desaparece, correo se envía.
   - Intentar editar tras asignar → botón "Editar" ya no está; datos en modo consulta.
7. **Push a Railway** (Sergio hace commit + push; Railway despliega solo).
8. **Smoke test en producción:** repetir los pasos anteriores en la URL Railway.
9. Generar `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9.md` con timestamp real.

### §10.3 Criterios de aceptación

- [ ] `pnpm build` completa sin errores ni warnings.
- [ ] `pnpm lint` limpio.
- [ ] Zero `mock` / `MOCK` / `TODO P9` en el código.
- [ ] Health check devuelve 200 con Airtable OK.
- [ ] Panel lista con filtros funciona end-to-end en Railway con datos reales.
- [ ] Crear + Editar + Asignar funciona end-to-end en Railway.
- [ ] Archivo `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P9.md` creado.

---

## §11 · Cierre — Post-ejecución de cada P

### §11.1 Flujo por tanda (Sergio no pasa prompt)

1. Sergio abre Claude Code y dice: `"sigue"` (o simplemente empieza la sesión).
2. Claude Code aplica algoritmo de §0.7: lee este archivo + inventario + snapshots + aprendizajes previos.
3. Claude Code detecta la P a ejecutar y muestra el mensaje de arranque de §0.7 (paso 7).
4. Sergio confirma con `s` o corrige.
5. Claude Code ejecuta la P siguiendo el modo + contrato declarados en el archivo.
6. Al terminar la P, Claude Code genera automáticamente `docs/_archivo/aprendizajes-YYYYMMDD-HHMM-P{n}.md` con timestamp real del sistema.
7. Claude Code muestra un resumen numerado (máx. 8 líneas) + ruta del archivo de aprendizajes creado.
8. Sergio hace commit + push en GitHub Desktop.
9. Sergio dice `"sigue"` de nuevo → Claude Code detecta la próxima P automáticamente y repite.

### §11.2 Plantilla del archivo de aprendizajes por P

Cada `aprendizajes-YYYYMMDD-HHMM-P{n}.md` sigue esta estructura:

```markdown
# Aprendizajes P{n} — {NombreP}

- **Fecha:** YYYY-MM-DD
- **Hora inicio → fin:** HH:MM → HH:MM
- **Duración:** N minutos
- **Modo Claude Code usado:** {default | accept edits on | auto mode on}
- **Commit asociado:** (Sergio lo agrega tras commit)

## Resumen ejecutivo
Bullet points de qué se construyó (máx. 6 líneas).

## Decisiones técnicas
- Decisión 1 y por qué.
- Decisión 2 y por qué.

## Overrides aplicados (rutas reales vs plan)
- Plan proponía X → Se usó Y (razón).

## Bugs / obstáculos y resolución
- Problema → Solución.

## Deuda técnica para P siguientes
- Ítem 1 → asignado a P{n+k}.

## Reglas nuevas → MIGRAR a docs/aprendizajes.md
- E-XXX: enunciado corto para consolidar en el archivo activo (Sergio decide cuándo mover).
```

### §11.3 Archivos de continuidad

Al terminar cada P (antes del commit), Claude Code también actualiza:
- `docs/construccion.md` → marca P como ✅ con fecha.
- `docs/_notas/snapshot-P{n}.md` → snapshot con estado del código, decisiones clave y siguiente paso.

`docs/aprendizajes.md` **no se toca automáticamente** — es la base consolidada de reglas activas. Solo se actualiza cuando Sergio pide expresamente migrar una regla desde un archivo timestamped.

### §11.4 Si algo se rompe entre P

Al iniciar la siguiente P, Claude Code:
1. Lee `docs/_notas/snapshot-P{n-1}.md` y `docs/_notas/inventario-if02.md`.
2. Verifica que `pnpm tsc --noEmit` y `pnpm build` estén verdes.
3. Si no, arregla ANTES de comenzar la nueva P.

---

## §12 · Índice rápido de reglas activas

| ID | Regla | Aplica en |
|---|---|---|
| A | Botón único "Asignar Tasador" que desaparece al asignar | P6, P7 |
| B | Toast + Alert destructivo con campos + N° operación como conflicto | P2, P4 |
| C | Editar solo en estado `creada`; permite cambiar tasador | P2, P6 |
| RN-44 | 3 datos mínimos para asignar (dirección, contacto con tel, rol SII) | P6, P7 |
| RN-45 | Toda superficie exige origen + adjunto de respaldo | P4 |
| RN-46 | Jerarquía dirección: ficha → certificado avalúo → certificado número | P4 |
| RN-47 | Jerarquía vendedor: correo → ficha → certificado avalúo | P4 |
| RN-48 | Avalúo fiscal total = suma de avalúos de unidades | P6 |
| RN-49 | Estado de conservación se hereda a recintos | P4 |
| RN-52 | Un solo hilo de correo por solicitud (email_thread_id) | P2, P7 |
| RN-59 | Modo consulta: estado ≠ creada Y tasador asignado | P5, P6 |

---

*Última actualización: 22-jul-2026 · v1.3 del plan (autoejecución + P5 panel lista con filtros/búsqueda/orden) · Base: Especificación v1.9.1*
