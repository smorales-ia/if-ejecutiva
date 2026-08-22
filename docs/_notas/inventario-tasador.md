# Inventario IF-03 · Repo Tasador — Alineación repo real ↔ Plan UI Tasador v1.0

> **BIFURCACIÓN §1.1 DEL PLAN: CASO A — el código v0 del Tasador SÍ está en el repositorio.**
> Verificado el **2026-08-17** sobre la rama `feat/tasador-ui`. Lo trajo el commit `b70117a`
> *«feat(tasador): traer diseño v0 IF-03 + plan de ejecución v1.0»* (47 archivos, 8329 inserciones).
> Esto **refuta** el hallazgo previo que el plan v1.0 registró el mismo día (que `app/tasaciones/**`
> y `components/tasador/**` no existían) y **cierra el Riesgo #1 de §17 del plan**.
>
> **Consecuencia:** P3-TAS a P9-TAS **extienden código existente in-place**; no construyen desde
> cero. El tamaño de cada tanda de UI baja respecto de lo que el plan asumía.
>
> **Generado en P0-TAS** · 2026-08-17 · Fuente: barrido `find`/`grep`/`diff` del árbol real +
> `pnpm tsc --noEmit` como medición, no como estimación.
> **Uso:** referencia obligatoria para P0.5-TAS en adelante (§1 del plan). Antes de crear cualquier
> archivo, cada tanda consulta su sección de Overrides aquí. **Reuse before create.**

---

## 1 · Árbol real del territorio IF-03

### `app/tasaciones/` — 7 rutas, exactamente las 7 de §2.13 del spec

**CI-020 respetado:** la raíz `[id]/` es el formulario de captura, no una pantalla de detalle. **No
existen** `[id]/captura/` ni `[id]/calculo/`.

```
app/tasaciones/page.tsx                     112 líneas   → Pantalla 1 · cola personal
app/tasaciones/[id]/page.tsx                 20 líneas   → Pantalla 5 · formulario de captura
app/tasaciones/[id]/coordinar/page.tsx       15 líneas   → Pantalla 2 · coordinación
app/tasaciones/[id]/fotos/page.tsx           15 líneas   → Pantalla 3 · ingreso de fotos
app/tasaciones/[id]/lectura/page.tsx         15 líneas   → Pantalla 4 · avance lectura
app/tasaciones/[id]/estado/page.tsx          15 líneas   → Pantalla 6 · avance cálculo
app/tasaciones/[id]/informe/page.tsx         15 líneas   → Pantalla 7 · preview del informe
```

Las seis rutas hijas son envoltorios de 15–20 líneas: resuelven `getTasacion(id)`, hacen
`notFound()` y delegan en un componente de `components/tasador/`. Toda la lógica de pantalla vive
en el componente, no en la ruta.

### `components/tasador/` — 21 componentes + 4 primitivos (tras la deduplicación de esta tanda)

```
components/tasador/
├─ app-header.tsx                      25   Header del Tasador
├─ campo-prellenado.tsx                36   Badge de procedencia del dato (FuenteDato)
├─ coordinar-visita.tsx               512   Pantalla 2 completa
├─ estado-badge.tsx                    41   ⚠ duplica conceptualmente StateBadge de IF-02
├─ estado-procesando.tsx              224   Pantallas 4 y 6 (comparte componente)
├─ expediente-sheet.tsx               242   Visor "Ver expediente" · RF-TAS-10
├─ foto-categoria-creator.tsx          64   Alta de categoría de foto personalizada
├─ fotos-categorizadas.tsx            288   Grilla de fotos por categoría
├─ fotos-screen.tsx                   189   Pantalla 3 completa
├─ informe-preview.tsx                623   Pantalla 7 completa
├─ intentos-indicator.tsx              34   ⚠ RESIDUO CI-015 — se elimina en P7-TAS
├─ sheet-documentos.tsx               200   Sheet documental del Tasador
├─ tasacion-card.tsx                  128   Card de la cola · RF-TAS-11
├─ tasacion-form.tsx                  495   Pantalla 5 · orquestador de las 8 secciones
├─ vproperty-logo.tsx                  21   Logo
├─ form-sections/
│  ├─ fields.tsx                      327   Primitivos de formulario (Section, TextField, …)
│  ├─ seccion-propiedad.tsx           230   Sección B · Datos de la propiedad
│  ├─ seccion-valoracion.tsx          196   Sección C · Cuadro de valoración
│  ├─ seccion-comparables.tsx         382   Sección D · Comparables
│  ├─ seccion-edificacion.tsx         321   Sección E · Niveles · Terminaciones · Comodidades
│  ├─ seccion-documentos.tsx           61   Sección F · Documentos legales · ⚠ RESIDUO T-C línea 20
│  └─ seccion-overrides.tsx            91   Sección G · Overrides (CU-007)
└─ ui/                                     4 archivos — ver §8 (paso (e))
   ├─ alert.tsx                        76
   ├─ button.tsx                       58
   ├─ dialog.tsx                       79
   └─ sheet.tsx                       102
```

**Las 8 secciones de CI-014 · RF-TAS-16 están las ocho.** Verificado leyendo el render de
`tasacion-form.tsx`, no infiriendo del nombre de los archivos:

| Sección | Dónde se realiza | Línea |
|---|---|---|
| **A · Visita** | **inline en `tasacion-form.tsx`** | `:263-302` |
| B · Datos de la propiedad | `form-sections/seccion-propiedad.tsx` | `:303` |
| C · Cuadro de valoración | `form-sections/seccion-valoracion.tsx` | `:314` |
| D · Comparables | `form-sections/seccion-comparables.tsx` | `:330` |
| E · Niveles · Terminaciones · Comodidades | `form-sections/seccion-edificacion.tsx` | `:342` |
| F · Documentos legales | `form-sections/seccion-documentos.tsx` | `:347` |
| G · Overrides (CU-007) | `form-sections/seccion-overrides.tsx` | `:358` |
| **H · Rentabilidad (opcional)** | **inline en `tasacion-form.tsx`** | `:377` |

⚠ **Contar los archivos de `form-sections/` da 6 y lleva a concluir que faltan dos secciones. Es
falso.** A y H están inline porque son las más cortas; `fields.tsx` no es una sección sino los
primitivos compartidos. **P7-TAS no construye secciones ausentes: las extiende todas.** El criterio
de aceptación de CI-014 se verifica sobre el render, no sobre el árbol de archivos.

**Regla T-B · realizada correctamente en el formulario.** `tasacion-form.tsx` distingue los dos
campos sin colapsarlos —`fechaPlanificadaVisita` (`:274`) y `fechaVisitaReal` (`:281`)— y valida la
real como obligatoria (`:89`). Ver la salvedad de `coordinar-visita.tsx` en §10 · **OV-13**.

### `lib/tasador/` — **AUSENTE** (verificado 2026-08-17)

Esperado: lo crea P1-TAS.

### `app/api/tasaciones/` — **AUSENTE** (verificado 2026-08-17)

Esperado: lo crea P2-TAS.

### `hooks/` — **AUSENTE como directorio raíz** (verificado 2026-08-17)

⚠ No existe ningún directorio `hooks/` en el repo. Los hooks de IF-02 viven como `lib/use-*.ts`
(`use-catalogos`, `use-debounce`, `use-historial-solicitud`, `use-cronologia-sla`, …). El v0 del
Tasador importa `@/hooks/use-estado-tasador`, que exigiría crear un directorio raíz nuevo. Ver
**OV-9**.

---

## 2 · Mapa componente → tanda

| Archivo | Tanda que lo extiende | Qué le falta |
|---|---|---|
| `app/tasaciones/page.tsx` + `tasacion-card.tsx` + `estado-badge.tsx` | **P3-TAS** | Cablear a `GET /api/tasaciones`. Tres chips con "Hoy" como stub (A-12 · CI-019). Badge de **SLA**, no de estado (CI-018). Decidir la suerte de `estado-badge.tsx` (ver OV-2). |
| `app-header.tsx` · `vproperty-logo.tsx` | **P3-TAS** | Transversales. Sin deuda detectada. |
| `coordinar-visita.tsx` (512 l.) | **P4-TAS** | Cablear a `POST /api/tasaciones/[id]/coordinacion`. **Bloqueada por CI-012** — se construye tras flag apagado y no se libera. Catálogo de motivos desde el API, no hardcodeado (A-17). |
| `fotos-screen.tsx` · `fotos-categorizadas.tsx` · `foto-categoria-creator.tsx` · `sheet-documentos.tsx` | **P5-TAS** | Cola offline en IndexedDB. Mínimo dinámico de fotos (A-16). Normalización de género de `tipo_propiedad` (P-5). Importar `FileUploadZone` de IF-02 (R7). |
| `estado-procesando.tsx` (224 l., sirve Pantallas 4 y 6) | **P6-TAS** (lectura) · **P8-TAS** (cálculo) | Polling real contra `GET /api/tasaciones/[id]/lectura` en la variante `lectura` y contra `GET /api/tasaciones/[id]/estado` en la variante `calculo` — **son dos endpoints distintos y no intercambiables**: el primero lee `TX_Adjuntos.estado_extraccion` (extracción documental), el segundo la máquina de estados del cálculo. Corregido en P6-TAS; esta línea decía `/estado` para las dos. "Continuar" bloqueado hasta "Datos listos" (CI-013). Literales de T-C. |
| `tasacion-form.tsx` + `form-sections/*` | **P7-TAS** | Las 8 secciones ya existen (A y H inline). Purgar CI-015 (`intentos-indicator`, `intentosEnvio`) y el texto de IA de `seccion-documentos.tsx:20`. Grilla de comparables editable (A-13). Sin precarga constructiva en E (A-14). Resolver los 4 `TS2322` de §9. |
| `informe-preview.tsx` (623 l.) · `expediente-sheet.tsx` | **P9-TAS** | Diálogo previo + acuse sin temporizador (CI-017). PDF sólo de Carbone (CI-016). Rechazo sin aviso al visador (A-15). Verificar que `expediente-sheet` no ofrezca escritura. |
| `campo-prellenado.tsx` | **P7-TAS** | Badge "Pre-llenado · editable" de Regla T-B. |
| `intentos-indicator.tsx` | **P7-TAS** | **Se elimina**, no se extiende (CI-015). |
| `components/tasador/ui/{alert,button,dialog,sheet}.tsx` | **ninguna** | Código muerto conservado por decisión — ver §8. |

**Pantallas sin componente propio:** ninguna. Las 7 están cubiertas (Pantallas 4 y 6 comparten
`estado-procesando.tsx`).

---

## 3 · Rutas API bajo `app/api/tasaciones/` — **AUSENTE**

No existe ninguna. Set mínimo que **P2-TAS** debe crear, derivado de los consumidores reales
detectados en §6:

| Método | Path | Propósito | Vía (R3: directo a Airtable) |
|---|---|---|---|
| GET | `/api/tasaciones` | Cola personal del tasador (reemplaza el mock `TASACIONES`) | Airtable REST (lectura) |
| GET | `/api/tasaciones/[id]` | Detalle (reemplaza `getTasacion`) | Airtable REST (lectura) |
| GET | `/api/tasaciones/[id]/estado` | Polling de `BORRADOR / EN_CALCULO / INFORME_DISPONIBLE` | Airtable REST |
| POST | `/api/tasaciones/[id]/coordinacion` | Insert en `TX_CoordinacionVisita` (§2.3) | Airtable REST · **bloqueada por CI-012** |
| PATCH | `/api/tasaciones/[id]` | `fecha_real_visita`, `observacion_rechazo_tasador`, overrides | Airtable REST + `A_Cambios` |
| POST | `/api/tasaciones/[id]/visitada` | Transición `asignada → visitada` (dispara AT03) | Airtable REST |
| GET | `/api/tasaciones/config/defaults` | Factores de homogeneización (RF-TAS-08 · **no hardcodear**) | Airtable REST |
| GET | `/api/tasaciones/config/motivos` | Catálogo de motivos de contacto no logrado (A-17) | Airtable REST |

**Blindaje obligatorio en P2-TAS** (§0.4 nota 1): validación Zod de todo cuerpo entrante +
autorización server-side `clerk_user_id === TX_Solicitudes.tasador`, con `mockUserTasador` hasta
P11-TAS. **No hay HMAC** — IF-03 no tiene canal a Make.

---

## 4 · Types existentes vs faltantes

**Ninguna entidad del dominio Tasador está tipada hoy.** Los 27 símbolos que el v0 consume viven
todos en el módulo inexistente `@/lib/tasaciones` (ver §6 · deuda 2). Desglose:

**Tipos (14):** `Tasacion`, `InformeData`, `Comparable`, `ItemValoracion`, `EstadoColor`,
`SlaStatus`, `FuenteDato`, `CategoriaFotoId`, `FotoCategoriaCustom`, `Ampliacion`, `Recinto`,
`NivelId`, `NivelHabitaciones`, `Comodidades`.

**Constantes / catálogos (5):** `TASACIONES` (mock), `CATEGORIAS_FOTO`, `OPCIONES`,
`RECINTOS_SUGERIDOS`, `MOTIVOS_DEVOLUCION`.

**Funciones (8):** `getTasacion`, `marcarVisitada`, `confirmarCoordinacion`,
`devolverCoordinacion`, `marcarPdfListo`, `guardarObservacionRechazo`, `resolverInforme`,
`resolverLimite`.

**Ninguno colisiona con `lib/console-data.ts`** (IF-02), que tipa `Solicitud`, `Tasador`, `Adjunto`,
`EventoHistorial`, etc. No hay riesgo de choque de nombres al crear `lib/tasador/types.ts`. Sí hay
un conflicto de **ruta**, no de nombre — ver **OV-4**.

**Convención:** el v0 del Tasador usa **camelCase**, igual que IF-02. No se repite el conflicto
snake_case que P1 de IF-02 tuvo que resolver.

---

## 5 · Catálogo de reuso §0.2-bis — verificado línea por línea

| Qué | Ruta real | Export verificado | Estado |
|---|---|---|---|
| `FileUploadZone` | `components/console/file-upload-zone.tsx` | `:143` | ✅ el plan acierta |
| `StateBadge` | `components/console/status-badges.tsx` | `:19` | ✅ · ⚠ el spec §2.13 lo llama `EstadoBadge`, que **no existe**. Manda el repo (**OV-2**) |
| `SLABadge` | `components/console/status-badges.tsx` | `:59` | ✅ el plan acierta |
| `PriorityChip` | `components/console/status-badges.tsx` | `:116` | ✅ (no está en §0.2-bis, disponible igual) |
| `DocumentosAdjuntosSheet` | `components/console/documentos-adjuntos-sheet.tsx` | `:84` | ✅ el plan acierta |
| `DocumentChecklist` | `components/console/document-checklist.tsx` | `:587` | ✅ · ⚠ el plan lo da como archivo propio; el export está en la línea 587, es un módulo grande |
| Motor SLA por etapa | `lib/sla-etapas.ts` | `etapaVigente:444` · `umbralesDeEtapa:462` · `recalcularSla:510` · `obtenerMatrizEtapas:400` · `C_SLA_ETAPAS:42` · además `marcarInicioEtapa:617`, `marcarFinEtapa:675`, `pausar:754`, `reanudar:786` | ✅ el plan acierta y **se queda corto**: hay más superficie útil de la que §0.2-bis lista |
| `lib/sla-habil.ts` · `lib/feriados.ts` | existen | — | ✅ |
| Cliente Airtable REST | `lib/airtable-client.ts` | `AirtableError:3` · `isValidRecordId:42` · **`listRecords:48`** · `getRecord:110` · **`createRecord:175`** · `updateRecord:201` | ✅ · ⚠ **el plan se equivoca**: `createRecord` y `listRecords` **ya existen**. Ver **OV-8** |
| Historial / cronología | `lib/historial.ts` · `lib/historial-airtable.ts` · `lib/use-historial-solicitud.ts` · `lib/sla-cronologia.ts` · `lib/use-cronologia-sla.ts` | existen | ✅ |
| `tipoDocumentoLabel` | `lib/tipos-documento.ts` | **NO EXISTE** | ❌ · exporta `CondicionPropiedad:68`, `TipoDocumento:76`, `getTiposDocumento:107`, `_resetCacheTiposDocumento:161`. Ver **OV-10** |

### Excepción R5-E — **REFUTADA, con una reserva**

El plan §0.2-bis declaró que el visor "Ver expediente" de RF-TAS-10 no era importable sin **editar**
`components/console/solicitud-detail.tsx`. **El v0 trajo su propia implementación**, así que la
excepción no se activa:

```
components/tasador/expediente-sheet.tsx   242 líneas
  :36   export function ExpedienteSheet({
  :94   <SheetTitle>{`Expediente · ${tasacion.codigo}`}</SheetTitle>
  :96   {totalArchivos} archivos · solo lectura
  :238  Descargar
```

Cumple los cuatro requisitos literales de RF-TAS-10: título `"Expediente · VP-AAAA-NNNN"`, número
de archivos + condición de sólo lectura, listado con descarga desde Dropbox, y sin acciones de
alta/reemplazo/baja. Es sheet, no ruta.

→ **`components/console/**` no necesita tocarse por RF-TAS-10. R5-E queda cerrada como refutada.**
**§0.2-bis y §10.1 del plan (procedimiento R5-E de P9-TAS) quedan desactualizados.**

⚠ **Reserva:** la verificación se hizo sobre los `grep` de encabezado y el conteo de líneas, no
leyendo las 242 líneas completas. **P9-TAS debe confirmar** que el sheet no ofrece ninguna acción
de escritura antes de dar RF-TAS-10 por cumplido. Y su línea 11 importa un símbolo que no existe
(**OV-10**), así que el archivo hoy no compila.

---

## 6 · Frontera R5 · lista negra explícita

**Territorio donde las tandas de IF-03 PUEDEN escribir** (§0.2 · R5):

```
app/tasaciones/**          app/api/tasaciones/**
components/tasador/**      lib/tasador/**
```

**Prohibido modificar** — enumerado con ruta real para que cada tanda lo verifique con `git status`:

```
app/(ejecutiva)/**                  app/(public)/**
app/layout.tsx  ·  app/page.tsx  ·  app/globals.css
app/api/adjuntos/**                 app/api/catalogos/**
app/api/health/**                   app/api/solicitudes/**
app/api/tasadores/**                app/api/visadores/**
app/api/webhooks/**
components/console/**   (13 archivos — importar SÍ, editar NO)
lib/*.ts                (43 archivos de IF-02, tests incluidos)
lib/mappers/**   ·   lib/validators/**
package.json  ·  pnpm-lock.yaml  ·  tsconfig.json  ·  next.config.*
```

**Comando de verificación por tanda:**

```bash
git diff --stat main -- "app/(ejecutiva)" "app/(public)" app/api/solicitudes app/api/webhooks \
  app/api/adjuntos app/api/tasadores app/api/visadores app/api/catalogos app/api/health \
  components/console lib app/layout.tsx app/page.tsx app/globals.css package.json tsconfig.json
```

⚠ **`components/ui/` es zona gris y R5 no la nombra.** No está en el territorio autorizado ni en la
lista negra. P0-TAS le agregó 4 archivos con autorización explícita de Sergio (**OV-5**). Regla
operativa derivada: **alta de archivos nuevos en `components/ui/` requiere autorización caso a
caso; modificar los 22 archivos preexistentes está prohibido igual que `components/console/`.**

⚠ **`hooks/` no existe y tampoco está nombrado por R5** (**OV-9**).

---

## 7 · Plan de deduplicación de `components/tasador/ui/` — EJECUTADO en esta tanda

### Compatibilidad de stack → **COMPATIBLE, sin migración**

- `grep -rn "@radix-ui"` sobre `components/tasador/` → **0 resultados**.
- `grep '"@radix-ui'` sobre `package.json` → **0 resultados**. **No hay Radix en el repo.**
- Ambos lados sobre el mismo shadcn v4 / `@base-ui/react` 1.5, con `cn` compartido en `@/lib/utils`.

### Consumidores

```
grep -rn "@/components/tasador/ui" app components lib   →  0
grep -rn "@/components/ui"  app/tasaciones components/tasador  → 37
```

**`components/tasador/ui/` tenía CERO consumidores.** Los 37 imports del v0 apuntaban a
`@/components/ui/*`; 33 resolvían contra IF-02 y 4 no.

### Tabla de decisión (17 archivos originales)

| Archivo | ¿En `components/ui/`? | bytes TAS | bytes IF-02 | Equivalencia | Acción ejecutada |
|---|---|---|---|---|---|
| `badge.tsx` | sí | 1925 | 1925 | IDÉNTICO | **(b) borrado** |
| `input.tsx` | sí | 1040 | 1040 | IDÉNTICO | **(b) borrado** |
| `label.tsx` | sí | 518 | 518 | IDÉNTICO | **(b) borrado** |
| `progress.tsx` | sí | 1740 | 1740 | IDÉNTICO | **(b) borrado** |
| `select.tsx` | sí | 6655 | 6655 | IDÉNTICO | **(b) borrado** |
| `separator.tsx` | sí | 545 | 545 | IDÉNTICO | **(b) borrado** |
| `tabs.tsx` | sí | 3497 | 3497 | IDÉNTICO | **(b) borrado** |
| `textarea.tsx` | sí | 842 | 842 | IDÉNTICO | **(b) borrado** |
| `tooltip.tsx` | sí | 2846 | 2846 | IDÉNTICO | **(b) borrado** |
| `alert.tsx` | sí | 2048 | 2528 | divergente · IF-02 superset | **(e) conservado** |
| `button.tsx` | sí | 3198 | 3240 | divergente · IF-02 superset | **(e) conservado** |
| `dialog.tsx` | sí | 1904 | 4075 | divergente · IF-02 superset | **(e) conservado** |
| `sheet.tsx` | sí | 2950 | 4433 | divergente · IF-02 superset | **(e) conservado** |
| `card.tsx` | **no** | 2630 | — | sólo Tasador | **(d) movido a `components/ui/`** |
| `collapsible.tsx` | **no** | 658 | — | sólo Tasador | **(d) movido a `components/ui/`** |
| `radio-group.tsx` | **no** | 1653 | — | sólo Tasador | **(d) movido a `components/ui/`** |
| `switch.tsx` | **no** | 1707 | — | sólo Tasador | **(d) movido a `components/ui/`** |

**Borrados (b):** 9 archivos · **19,6 KB liberados**. Guard previo: `diff -q` archivo por archivo
(9/9 idénticos) + 0 consumidores.
**Movidos (d):** 4 archivos · 6,6 KB. Guard previo: los 4 nombres libres en `components/ui/`
(22 archivos, ninguno colisiona). Git los registró como **renames (`R`)**, no como borrado+alta.
`components/ui/` pasó de 22 a **26** archivos.
**Conservados (e):** 4 archivos · 10,1 KB — ver §8.

---

## 8 · Los 4 "superset" conservados — nota de divergencia (paso (e))

`components/tasador/ui/{alert,button,dialog,sheet}.tsx` **se conservan por decisión explícita de
Sergio**, pese a cumplir las dos condiciones que llevaron a borrar los otros nueve.

**Lo que son:** versiones **más pobres** que sus homónimos de `components/ui/`. IF-02 es superset en
los cuatro casos: `alert` +8 líneas, `button` +42, `dialog` +177, `sheet` +108. La divergencia no es
estilística — `dialog` de IF-02 tiene más del doble de superficie.

**Lo que no son:** código en uso. **Tienen cero consumidores.** Ningún archivo del repo importa
`@/components/tasador/ui/*`; los 37 imports del v0 apuntan a `@/components/ui/*` y ahora resuelven
todos contra IF-02.

⚠ **Riesgo declarado.** Son **código muerto**. Un import por descuido —o un autocompletado de
editor que ofrezca la ruta `tasador/ui/`— reintroduciría exactamente la divergencia que esta tanda
vino a eliminar, y con la variante peor de las dos. El modo de fallo es silencioso: el componente
renderiza, sólo que sin las capacidades que IF-02 le agregó.

**Mitigación sugerida para una tanda futura** (no ejecutada aquí, fuera del alcance de P0-TAS):
borrarlos también, o bien reemplazar cada uno por un `export * from "@/components/ui/<x>"` de una
línea, que preserva la ruta sin duplicar implementación.

---

## 9 · Deuda de módulos ausentes (paso (f)) — línea base del build rojo

### Medición literal, no estimación

`pnpm tsc --noEmit` sobre la rama, antes y después de P0-TAS:

| Métrica | Antes de P0-TAS | Después de P0-TAS |
|---|---|---|
| Errores totales | **137** | **102** |
| Líneas `TS2307` (módulo no encontrado) | **61** | **34** |
| Rutas de módulo distintas irresolubles | **28** | **4** |

| Grupo | Módulos | Líneas | Estado |
|---|---|---|---|
| **A** · `@/components/X` mal-prefijados | 20 → **0** | 23 → **0** | ✅ resuelto por (c) |
| **B** · `@/components/ui/{card,collapsible,radio-group,switch}` | 4 → **0** | 4 → **0** | ✅ resuelto por (d) |
| **C** · módulos inexistentes | **4** | **34** | ❌ deuda P1-TAS / P2-TAS |

⚠ **Corrección al análisis previo:** el grupo A son **20** rutas de módulo distintas, no 19. El
snapshot listó las 23 líneas correctamente pero contó 19 rutas, y su propio total no cerraba
(`19+4+4=27≠28`). Las tres duplicadas son `estado-procesando`, `seccion-propiedad` y
`seccion-comparables`, importadas dos veces cada una.

Los **102 errores restantes** son: 34 de módulos ausentes (grupo C) + ~68 de tipado que **son
consecuencia directa** de esos módulos (`TS7006 implicitly any` en callbacks cuyo tipo venía de
`@/lib/tasaciones`) más un puñado de incompatibilidades reales con `@base-ui/react` que P7-TAS
deberá resolver (ver "Hallazgos colaterales" al final de esta sección).

### Deuda 1 · `@/hooks/use-estado-tasador` — 4 consumidores

```
components/tasador/estado-procesando.tsx:9    useEstadoTasador
components/tasador/informe-preview.tsx:23     useEstadoTasador
components/tasador/tasacion-form.tsx:17       useEstadoTasador
components/tasador/intentos-indicator.tsx:2   MAX_INTENTOS      ⚠ CI-015 — NO recrear
```

**Firma esperada:** `useEstadoTasador(id)` → hook de polling sobre el estado backend
(`BORRADOR | EN_CALCULO | INFORME_DISPONIBLE`), que gobierna el bloqueo de "Calcular Tasación"
(RF-TAS-07). Devuelve al menos `{ estado, enviarParaCalculo }`.

⚠ **`MAX_INTENTOS` NO debe recrearse** (CI-015 · decisión capital 1 de §2 del spec: *«se elimina la
coletilla "y el control de 3 intentos"»*). Tampoco `intentosEnvio`, que `tasacion-form.tsx:51`
destructura del hook.

⚠ **Ubicación a decidir:** `hooks/` no existe como directorio raíz y R5 no lo autoriza. Ver **OV-9**.
**Destino: P2-TAS** (depende de `GET /api/tasaciones/[id]/estado`).

### Deuda 2 · `@/lib/tasaciones` — el módulo más demandado: 26 líneas en 18 archivos

**Superficie completa requerida — 27 símbolos:**

*Tipos (14):* `Tasacion`, `InformeData`, `Comparable`, `ItemValoracion`, `EstadoColor`, `SlaStatus`,
`FuenteDato`, `CategoriaFotoId`, `FotoCategoriaCustom`, `Ampliacion`, `Recinto`, `NivelId`,
`NivelHabitaciones`, `Comodidades`.

*Constantes (5):* `TASACIONES`, `CATEGORIAS_FOTO`, `OPCIONES`, `RECINTOS_SUGERIDOS`,
`MOTIVOS_DEVOLUCION`.

*Funciones (8):* `getTasacion`, `marcarVisitada`, `confirmarCoordinacion`, `devolverCoordinacion`,
`marcarPdfListo`, `guardarObservacionRechazo`, `resolverInforme`, `resolverLimite`.

**Consumidores por archivo:**

```
app/tasaciones/page.tsx:8                          TASACIONES · type Tasacion
app/tasaciones/[id]/page.tsx:3                     getTasacion
app/tasaciones/[id]/{coordinar,estado,fotos,informe,lectura}/page.tsx:2   getTasacion  (×5)
components/tasador/campo-prellenado.tsx:3          type FuenteDato
components/tasador/estado-badge.tsx:2              type EstadoColor
components/tasador/tasacion-card.tsx:6             type Tasacion · type SlaStatus
components/tasador/coordinar-visita.tsx:25         confirmarCoordinacion · devolverCoordinacion
                                                   MOTIVOS_DEVOLUCION · type Tasacion
components/tasador/expediente-sheet.tsx:10         CATEGORIAS_FOTO · type Tasacion · type InformeData
components/tasador/fotos-categorizadas.tsx:11      CATEGORIAS_FOTO · resolverLimite
                                                   type CategoriaFotoId · type FotoCategoriaCustom
components/tasador/fotos-screen.tsx:14             resolverInforme · CATEGORIAS_FOTO · type Tasacion
                                                   type InformeData · type FotoCategoriaCustom
components/tasador/informe-preview.tsx:21          CATEGORIAS_FOTO · marcarPdfListo
                                                   guardarObservacionRechazo · type Tasacion · type InformeData
components/tasador/tasacion-form.tsx:16            type Tasacion · type InformeData · marcarVisitada
components/tasador/form-sections/seccion-propiedad.tsx:3,4      type InformeData · OPCIONES
components/tasador/form-sections/seccion-edificacion.tsx:11,12  type InformeData · Ampliacion · Recinto
                                                   NivelId · NivelHabitaciones · Comodidades
                                                   OPCIONES · RECINTOS_SUGERIDOS
components/tasador/form-sections/seccion-valoracion.tsx:4,5     type InformeData · ItemValoracion · OPCIONES
components/tasador/form-sections/seccion-comparables.tsx:6      type InformeData · type Comparable
components/tasador/form-sections/seccion-documentos.tsx:4,5     type InformeData · OPCIONES
components/tasador/form-sections/seccion-overrides.tsx:5        type InformeData
```

**Destino: P1-TAS** (los 14 tipos + 5 catálogos) **+ P2-TAS** (las 8 funciones: `TASACIONES` y
`getTasacion` son mocks del v0 que deben pasar a leer del Route Handler).

⚠ **Conflicto de ruta a resolver en P1-TAS** — ver **OV-4**.

### Deuda 3 · `@/lib/tasador-store` — 3 consumidores

```
components/tasador/informe-preview.tsx:22     readPayload
components/tasador/fotos-screen.tsx:15        readPayload · writePayload
components/tasador/tasacion-form.tsx:18       readPayload · writePayload
```

**Firma esperada:** `readPayload(id)` / `writePayload(id, payload)` — persistencia del borrador del
formulario. Es el **autosave de §2.8**, la **única excepción autorizada** al veto de `localStorage`
(§0.2 del plan, 30 s). Esa excepción cubre **sólo** el borrador del formulario.

**Destino: P7-TAS** por función, pero **debe existir antes para que compile** → crearlo en **P1-TAS**
con la implementación mínima.

### Deuda 4 · `@/lib/factores-default` — 1 consumidor

```
components/tasador/form-sections/seccion-comparables.tsx:7   nuevoComparable · ufHomogeneizada
```

**Firma esperada:** factores de homogeneización (`factor_sup`, `factor_edad`, `factor_distancia`) y
el cálculo de UF homogeneizada.

⚠ **RF-TAS-08 prohíbe hardcodear defaults en el frontend.** Este módulo **no puede contener valores
literales**: debe consumirlos de `GET /api/tasaciones/config/defaults`. **El nombre
`factores-default` sugiere exactamente lo que RF-TAS-08 prohíbe** — ver **OV-6**.

**Destino: P2-TAS** (la ruta) + **P7-TAS** (el consumo).

### Deuda 5 · `tipoDocumentoLabel` — NUEVA, no detectada antes

```
components/tasador/expediente-sheet.tsx:11
  import { tipoDocumentoLabel } from "@/lib/tipos-documento"
  → error TS2724: '"@/lib/tipos-documento"' has no exported member named 'tipoDocumentoLabel'
```

`lib/tipos-documento.ts` exporta `CondicionPropiedad`, `TipoDocumento`, `getTiposDocumento` y
`_resetCacheTiposDocumento`. **No exporta `tipoDocumentoLabel`.** El v0 asumió una API que IF-02 no
provee. **Destino: P9-TAS** — y como `lib/tipos-documento.ts` es de IF-02, **agregarle el export
está prohibido por R5**: la salida correcta es resolver la etiqueta dentro de `components/tasador/`
usando `getTiposDocumento()`, o pedir autorización a Sergio para tocar el módulo de IF-02. Ver
**OV-10**.

### Residuos a purgar (CI-015 · Regla T-C)

**CI-015 · contador de intentos — CONFIRMADO:**
```
components/tasador/intentos-indicator.tsx          (34 líneas — el componente entero)
  :2    import { MAX_INTENTOS } from "@/hooks/use-estado-tasador"
  :5    export function IntentosIndicator({ intentos }: { intentos: number })
  :10   Array.from({ length: MAX_INTENTOS })
  :30   {intentos} de {MAX_INTENTOS} usados
components/tasador/tasacion-form.tsx
  :27   import { IntentosIndicator } from "@/components/tasador/intentos-indicator"
  :51   const { intentosEnvio, enviarParaCalculo } = useEstadoTasador(tasacion.id)
  :192  <IntentosIndicator intentos={intentosEnvio} />
```
**Acción (P7-TAS):** borrar `intentos-indicator.tsx`, las líneas 27 y 192 de `tasacion-form.tsx`, y
`intentosEnvio` de la 51. **No recrear `MAX_INTENTOS`.**
⚠ `bloqueadoCalculo` (`tasacion-form.tsx:57,159,400,417`) **es legítimo** — es RF-TAS-07, no CI-015.
No confundirlo con el contador.

**Regla T-C · lenguaje de IA — 1 sola ocurrencia en todo el territorio IF-03:**
```
components/tasador/form-sections/seccion-documentos.tsx:20
  <span>Prellenado por IA cuando los PDFs estén adjuntos (SC07). Editable.</span>
```
**Acción (P7-TAS):** reemplazar por texto sin medio técnico. El barrido
`grep -rniE "\bIA\b|\bAI\b|Claude|OCR|inteligencia artificial|prellenado por|LLM|algoritmo"` sobre
`app/tasaciones` + `components/tasador` **no encontró nada más**.

### Hallazgos colaterales de tipado (no son deuda de módulos)

Errores reales que sobreviven aunque se creen los 4 módulos, y que **P7-TAS debe resolver**:

```
coordinar-visita.tsx:441      TS2322  Dispatch<SetStateAction<string>> no encaja en el
form-sections/fields.tsx:211  TS2322  onValueChange de @base-ui/react Select, que emite
                                      (value: string | null, eventDetails) => void
seccion-edificacion.tsx:219   TS2322  key recibe string|number|symbol; symbol no es Key válido
seccion-edificacion.tsx:293   TS2322  (idem)
```

El del `Select` aparece dos veces y es el mismo patrón: el v0 asumió la firma de Radix
(`(value: string) => void`), y `@base-ui/react` emite `string | null` más un segundo argumento. **Es
un síntoma de origen Radix en el diseño v0**, aunque el repo no tenga la dependencia.

---

## 10 · Overrides al plan · P0.5-TAS → P12-TAS

### Overrides transversales

| # | Override | Efecto |
|---|---|---|
| **OV-1** | **Caso A, no Caso B.** El v0 está en el repo (`b70117a`). §1.1 y §17·Riesgo 1 del plan asumían lo contrario. | P3-TAS→P9-TAS **extienden in-place**. Cierra el Riesgo #1. |
| **OV-2** | **`EstadoBadge` no existe; el repo exporta `StateBadge`** (`status-badges.tsx:19`). Además el Tasador trae su propio `estado-badge.tsx` (41 l.). | Manda el repo, sin alias. **P3-TAS decide** si `estado-badge.tsx` se reemplaza por `StateBadge` o se conserva. Nota: CI-018 dice que la card lleva badge **de SLA**, no de estado — puede que `estado-badge.tsx` no tenga lugar en la Pantalla 1. |
| **OV-3** | **R5-E refutada.** `expediente-sheet.tsx` cumple RF-TAS-10 sin tocar IF-02. | §0.2-bis y §10.1 del plan quedan desactualizados. P9-TAS conserva la reserva de §5. |
| **OV-4** | **El plan sitúa los tipos en `lib/tasador/types.ts`; el v0 los importa de `@/lib/tasaciones`** (26 líneas, 18 archivos). | **P1-TAS decide.** Recomendación: **reescribir los 26 imports** a `@/lib/tasador/types`. Dos rutas para lo mismo es la divergencia que P0-TAS acaba de eliminar en `ui/`; un re-export la reintroduciría. |
| **OV-5** | **`components/ui/` recibió 4 archivos nuevos** (paso (d)). R5 §0.2 limita la escritura de IF-03 a 4 directorios y **no incluye `components/ui/`**. | Sergio autorizó la alta explícitamente. **El texto de R5 debería anotarlo.** Es alta pura, sin modificación de archivos de IF-02. |
| **OV-6** | **`lib/factores-default` tiene un nombre que sugiere lo que RF-TAS-08 prohíbe.** | Revisar al crearlo (P2-TAS/P7-TAS): los defaults vienen del API, no del módulo. Considerar renombrarlo. |
| **OV-7** | **El build está rojo.** §0.7 paso 7 exige verde antes de arrancar tanda; no se cumple, y la causa es territorio IF-03. | Criterio revisado de Sergio: el verde se difiere a **P2-TAS**. |
| **OV-8** | **`lib/airtable-client.ts` YA exporta `createRecord` (`:175`) y `listRecords` (`:48`).** §0.2-bis y §0.4·nota 3 del plan dicen que faltan y que P2-TAS debe extenderlo. | **P2-TAS no necesita extender `lib/airtable-client.ts`.** Lo importa tal cual. Esto **elimina el riesgo R5-E secundario** que §0.4·nota 3 anticipaba (tener que editar un archivo de IF-02) y hace innecesario el envoltorio `lib/tasador/airtable-writes.ts` que el plan proponía como alternativa preferente. |
| **OV-9** | **`hooks/` no existe como directorio raíz** y R5 no lo autoriza. IF-02 pone sus hooks como `lib/use-*.ts`. | **P2-TAS decide** entre crear `hooks/` (requiere autorización, como OV-5) o mover el hook a `lib/tasador/use-estado-tasador.ts` y reescribir 4 imports. **Recomendación: `lib/tasador/`** — respeta R5 sin pedir excepción y sigue la convención de IF-02. |
| **OV-10** | **`tipoDocumentoLabel` no existe en `lib/tipos-documento.ts`.** El v0 lo importa en `expediente-sheet.tsx:11`. | Resolver dentro de `components/tasador/` con `getTiposDocumento()`. **Agregar el export a IF-02 está prohibido por R5** sin autorización. |
| **OV-11** | **El grupo A eran 20 módulos, no 19.** Corrección aritmética al análisis previo. | Sin efecto sobre el plan; queda registrado para que el conteo del criterio de aceptación cierre. |
| **OV-12** | **Las 8 secciones de CI-014 · RF-TAS-16 ya están las ocho.** A (Visita) y H (Rentabilidad) están **inline en `tasacion-form.tsx`**; los 6 archivos de `form-sections/` cubren **B–G**. | **P7-TAS no construye secciones ausentes.** ⚠ Contar los archivos de `form-sections/` da 6 e induce a concluir que faltan dos: el criterio de aceptación de CI-014 debe verificarse **sobre el render** (`tasacion-form.tsx:263-377`), no sobre el árbol. |
| **OV-13** | **`coordinar-visita.tsx:96` declara `const [fechaVisita, setFechaVisita]`** — un identificador `fechaVisita` a secas, que **Regla T-B declara literalmente un bug** (§0.3: *«Si aparece un identificador `fechaVisita` a secas en código de IF-03, es un bug»*). | Semánticamente **no** hay colapso de campos: la etiqueta de `:408` dice "Fecha planificada de visita" y el valor va a `confirmarCoordinacion`. Es una **violación de nomenclatura, no de modelo**. **P4-TAS lo renombra** a `fechaPlanificadaVisita`, como ya lo llama `tasacion-form.tsx:274`. El formulario de captura sí respeta T-B correctamente (§1). |

### Overrides por tanda

- **P0.5-TAS · Schema Airtable** — sin overrides derivados del código; el plan aplica tal cual. La
  compuerta CI-012 sigue siendo la primera acción. Único apunte: `TX_ContactosVisita` aparece en
  §1.5.1 como *«verificar en la tanda»* y el repo tiene `lib/contactos-visita.ts`, que puede dar la
  pista del TABLE_ID sin consultar Airtable.
- **P1-TAS · Types** — aplica **OV-4** (decidir ruta de los tipos, recomendado reescribir 26
  imports) y la creación anticipada de `lib/tasador-store` (deuda 3) para que compile. Los 27
  símbolos de §9·deuda 2 son el contrato mínimo. Ningún tipo colisiona con `lib/console-data.ts`.
- **P2-TAS · API Routes** — aplica **OV-8** (no extender `airtable-client.ts`), **OV-9** (ubicación
  del hook) y **OV-6** (defaults desde el API). Set de 8 rutas en §3. El verde del build se cierra
  aquí (**OV-7**).
- **P3-TAS · Cola personal** — aplica **OV-2** (suerte de `estado-badge.tsx`). Chips: tres, con
  "Hoy" como stub deshabilitado (A-12 · CI-019). Badge de SLA, no de estado (CI-018). El componente
  existe (112 + 128 líneas); se cablea, no se crea.
- **P4-TAS · Coordinar visita** — aplica **OV-13** (renombrar `fechaVisita` → `fechaPlanificadaVisita`).
  `coordinar-visita.tsx` (512 l.) ya implementa la pantalla. Sigue **bloqueada por CI-012**; flag
  apagado, no se libera. Catálogo de motivos desde el API (A-17).
- **P5-TAS · Ingreso de fotos** — sin overrides. Los 4 componentes existen (741 l. combinadas).
  Aplican A-16 (mínimo dinámico, punto de cambio aislado en una función) y P-5 (normalización de
  género en `lib/tasador/tipo-propiedad.ts`). Importar `FileUploadZone` de IF-02 (R7).
- **P6-TAS · Avance lectura** — override menor: **`estado-procesando.tsx` es un solo componente
  compartido con P8-TAS**. El plan las trata como pantallas separadas. Cualquier cambio en P6-TAS
  impacta la Pantalla 6 y viceversa; parametrizar, no bifurcar. CI-013 aplica.
- **P7-TAS · Formulario** — la tanda más cargada. Aplica **OV-12** (las 8 secciones ya existen; A y
  H inline), la purga de CI-015 y del texto de T-C (§9), y los cuatro errores de tipado colaterales
  de §9. A-13 (grilla editable) y A-14 (sin precarga constructiva en la sección E).
- **P8-TAS · Avance cálculo** — ver P6-TAS: componente compartido.
- **P9-TAS · Preview del informe** — aplica **OV-3** (R5-E refutada, con la reserva de leer las 242
  líneas de `expediente-sheet.tsx`) y **OV-10** (`tipoDocumentoLabel`). CI-016, CI-017, A-15.
- **P10-TAS · Reutilización cruzada e integración SLA** — aplica **OV-8** y la superficie ampliada
  de `lib/sla-etapas.ts` (§5): hay más funciones útiles de las que §0.2-bis lista. CI-021 se
  verifica aquí.
- **P11-TAS · Autenticación** — sin overrides derivados del inventario. `mockUserTasador` todavía
  no existe; lo crea la primera tanda que lo necesite (P2-TAS).
- **P12-TAS · Deploy** — sin overrides. El barrido de mocks debe cubrir `TASACIONES` y las 8
  funciones de §9·deuda 2, que son mocks del v0.

---

## 11 · Checklist de riesgos

**Riesgo 1 — el build está rojo y P0-TAS no lo cierra.** 102 errores, 34 de ellos por los 4 módulos
del grupo C. **Comprometido para P2-TAS** por decisión de Sergio. Ninguna tanda intermedia puede
usar §0.7·paso 7 ("build verde antes de arrancar") como bloqueo hasta entonces.

**Riesgo 2 — código muerto en `components/tasador/ui/`.** Los 4 superset conservados pueden
resucitar por un import descuidado, en su variante peor. Ver §8.

**Riesgo 3 — el v0 tiene ADN de Radix en las firmas, aunque no la dependencia.** Los `TS2322` del
`Select` (§9) son la huella. Al tocar cualquier componente con `Select`, `RadioGroup` o `Switch`,
verificar la firma de `@base-ui/react` antes de asumir la de shadcn/Radix.

**Riesgo 4 — dos rutas para los mismos tipos.** Si P1-TAS resuelve **OV-4** con un re-export en vez
de reescribir los imports, reintroduce por `lib/` la divergencia que P0-TAS eliminó en `ui/`.

**Riesgo 5 — `components/ui/` y `hooks/` son zonas grises de R5.** El plan no las nombra. Dos altas
ya requirieron autorización caso a caso (OV-5, OV-9). **Sugerencia: enmendar el texto de R5** para
que declare explícitamente el régimen de esas dos rutas.

**Riesgo 6 — el árbol de archivos no es el mapa de las secciones.** `form-sections/` tiene 6
archivos y el formulario tiene 8 secciones: A y H están inline en `tasacion-form.tsx`. Este
inventario llegó a afirmar en su primera redacción que faltaban dos secciones, por contar archivos
en vez de leer el render. **Verificar CI-014 sobre `tasacion-form.tsx:263-377`, no sobre `ls`.**

**Dependencias:** ✅ `@base-ui/react ^1.5.0`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`lucide-react`, `react-hook-form`, `zod` 4, `sonner`, `cmdk` presentes.
❌ **`airtable` NO está en `package.json` y NO debe agregarse** (§0.4·nota 3 del plan) — verificado.
El cliente REST propio `lib/airtable-client.ts` cubre todo lo necesario (**OV-8**).

**Archivos que el plan propone crear y ya existen con otro nombre:**
`lib/tasador/types.ts` → el v0 los pide en `lib/tasaciones` (**OV-4**).
`lib/tasador/airtable-writes.ts` → innecesario, `lib/airtable-client.ts` ya sirve (**OV-8**).

**Componentes de R7 no importables sin editar IF-02:** **ninguno.** R5-E refutada (**OV-3**). El
único roce con IF-02 es `tipoDocumentoLabel` (**OV-10**), que se resuelve del lado del Tasador.

---

## 12 · Verificación de la frontera R5 en esta tanda

```bash
git diff --stat HEAD -- components/console app/api/solicitudes "app/(ejecutiva)" \
  lib app/globals.css package.json
→ (vacío)
```

**Ningún archivo de IF-02 fue modificado.** Los cambios de P0-TAS son:

| Tipo | Ruta | Nota |
|---|---|---|
| 9 borrados | `components/tasador/ui/*` | territorio IF-03 |
| 4 renames | `components/tasador/ui/*` → `components/ui/*` | **alta en zona gris, autorizada** (OV-5) |
| 12 modificados | `app/tasaciones/*` · `components/tasador/*` | sólo líneas de import (46 líneas, diff verificado como puro) |
| 1 alta doc | `docs/_notas/inventario-tasador.md` | este archivo |

⚠ **La verificación honesta incluye `components/ui/`**, que no está en la lista de rutas del comando
de arriba y por eso no aparecería aunque se hubiera roto algo. Los 4 archivos son **altas**, no
modificaciones: `git status` los muestra como `R` (rename), y los 22 archivos preexistentes de
`components/ui/` están intactos.
