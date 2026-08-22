# Snapshot · P5-TAS — Pantalla 3 · Ingreso de fotos

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`.
> **Commits** — primera mitad en `dcd642b`; la reanudación queda **sin commitear** (Sergio commitea
> por GitHub Desktop).
> **Estado** — ✅ **CERRADA · 6 de 6 batches.**
> **Airtable** — **no se tocó** (sólo lecturas de verificación vía MCP).
> **Make** — **no se tocó**: `SC-Adjuntos-Upload` sigue siendo el dueño de la fila en `TX_Adjuntos`.

---

## 1 · Qué construye P5-TAS

La **Pantalla 3** del tasador —el organizador de fotos de la visita— según §6 del plan
`docs/_md/plan_ejecucion_UItasador_v1.2.md`, spec §2.6 y RF-TAS-14 / RF-TAS-06.

La tanda se ejecutó en **dos mitades el mismo día**: la primera (13:45) cerró B1, B5 y B6 y se
detuvo al descubrir **CI-052**; la segunda (16:46) cerró B3, B2 y B4 tras el OK de Sergio a la
opción (a) de esa ficha.

## 2 · Estado de los seis batches

| Batch | Qué | Estado |
|---|---|---|
| **B1** | A-16 aislada + fix del mínimo de categorías personalizadas | ✅ `dcd642b` |
| **B2** | Tipo real de foto + hidratación desde `GET /fotos` | ✅ reanudación |
| **B3** | Subida real punta a punta + cierre de CI-052 | ✅ reanudación |
| **B4** | Cola offline IndexedDB | ✅ reanudación |
| **B5** | Sheet documental reutilizado (R7) | ✅ `dcd642b` |
| **B6** | Tests + fichas CI + aprendizajes | ✅ `dcd642b` |

**El orden importó.** B2 dependía de B3 y no al revés: `GET /fotos` filtra por
`subido_por = "Tasador"`, así que sin camino de escritura devolvía vacío siempre y una hidratación
no habría probado nada.

## 3 · La cadena de persistencia, y quién es dueño de qué

```
File ─▶ POST /api/adjuntos/upload ─▶ Make (SC-Adjuntos-Upload) ─▶ Dropbox
                                       └─▶ crea la fila en TX_Adjuntos · devuelve adjunto_id
adjunto_id ─▶ PATCH /api/tasaciones/[id]/fotos ─▶ escribe la categoría sobre esa fila
```

**El pipeline de adjuntos es el dueño de la fila** (opción (a) de CI-052). La segunda llamada no
crea nada. El escenario Make de IF-02 no se tocó y la idempotencia por `hash_md5` se conserva: una
subida deduplicada devuelve el record ID existente y el `PATCH` sólo lo recategoriza.

`POST` pasó a `PATCH` porque el verbo dejó de ser una creación, nada lo consumía, y `PATCH` cubre
además la **recategorización** de una foto ya subida — la operación más frecuente del organizador.

## 4 · Fichas CI

| Ficha | Estado |
|---|---|
| **CI-052** · doble alta en `TX_Adjuntos` | ✅ **CERRADA** 22-ago-2026 · opción (a) implementada |
| **CI-051** · `TX_Adjuntos.seccion` no existe | abierta · **ampliada**: el sub-nivel `{seccion}/` del path Dropbox tampoco llega, misma raíz |
| **P-5** · género de `tipo_propiedad` | abierta · paliativo en su sitio · RF-TAS-06 sigue *"construido con paliativo"* |
| **A-16** · mínimos dinámicos vs. fijos | abierta · asunción reversible, un punto de cambio |

## 5 · Tres comportamientos declarados

Ninguno es un defecto; los tres son decisiones con su razón escrita en el código.

1. **Una solicitud con dos o más unidades responde 422 al subir una foto.** No se manda destino de
   unidad: el backend auto-deriva `_ingreso/` sin unidades y la única si hay una. Pantalla 3 no tiene
   selector de unidad, y es el mismo precedente que B5 fijó para el sheet documental
   (`unidadesParaPath()` devuelve `[]`). El tasador ve el literal humano del 422. Si el negocio lo
   quiere distinto, el cambio vive en esas dos funciones.
2. **El sub-nivel `{seccion}/` no llega a Dropbox.** `componerCarpetaDropbox()` no tiene ese
   segmento y quien compone el path es el endpoint de subida, fuera de la excepción R4 acotada. La
   sección sobrevive en `TX_Adjuntos.descripcion`. Anotado en CI-051.
3. **La pantalla no hace actualización optimista.** Toda mutación relee `GET /fotos` más la cola. Es
   más lento y es lo correcto: una foto que se muestra es una foto que está guardada, nunca una que
   «debería» estar.

## 6 · Estado tsc + build + test

| Comando | Resultado |
|---|---|
| `pnpm tsc --noEmit` | ✅ **exit 0** |
| `pnpm build` | ✅ **exit 0** · *Compiled successfully in 50s* |
| `pnpm test` | ✅ **27 archivos · 496 tests** (línea base de la mitad anterior: 23 / 444) |

`pnpm lint` **no corre**: `eslint` no está en `node_modules`. Es deuda preexistente del checklist
P9, no de esta tanda; los gates del repo son los tres de arriba. Los `Dynamic server usage` que el
build emite sobre `/tasaciones` son informativos y preexistentes.

## 7 · Verificación pendiente

**Viewport 375×812 — no verificado.** Playwright **no está instalado** (`test:e2e` es un script
huérfano en `package.json`) y por decisión de Sergio **no se instaló**. Queda para verificación
manual con Chrome DevTools. Cuatro puntos que conviene mirar, los dos primeros heredados de la
primera mitad:

1. El botón «Cargar documentos de la propiedad», de ancho completo sobre el listado.
2. El sheet documental de IF-02, diseñado para escritorio.
3. El aviso ámbar de fotos pendientes de subida (nuevo en B4).
4. La grilla de miniaturas de 4 columnas dentro de cada categoría.

## 8 · Nota sobre E-024

`docs/_archivo/aprendizajes_20260807.md` · **E-024** afirma que `TX_Solicitudes.codigo_solicitud`
está vacío en todas las filas. **Quedó SUPERADO**: el campo se convirtió en fórmula entre el 10 y el
13-jul-2026 (`docs/schema-airtable.md` §19) y hoy está poblado — verificado vía MCP el 22-ago-2026
(`VP-2026-0004`, `VP-2026-0060`, `VP-2026-0061`…). Importaba porque `GET /fotos` filtra por
`{solicitud}="{codigo_solicitud}"` y, de seguir vacío, habría devuelto vacío siempre. La entrada
original no se editó —vive en un archivo histórico protegido por la regla de sólo-append—; la
corrección está en la bitácora viva.

## 9 · Archivos de la reanudación

**Modificados**

```
app/api/tasaciones/[id]/fotos/route.ts     ← único archivo bajo app/api/ (excepción R4 acotada)
components/tasador/expediente-sheet.tsx
components/tasador/fotos-categorizadas.tsx
components/tasador/fotos-categorizadas.test.ts
components/tasador/fotos-screen.tsx
lib/tasaciones.ts
lib/tasaciones.test.ts
lib/tasador/mensajes.ts
lib/tasador/tasador-store.ts
docs/CODE_INCONSISTENCIES.md
docs/aprendizajes.md
docs/_archivo/aprendizajes-20260822-1345-P5-TAS.md
docs/_notas/snapshot-P5-TAS-parcial.md → docs/_notas/snapshot-P5-TAS.md
```

**Nuevos**

```
lib/tasador/fotos.ts                       · subida + categorización + borrado
lib/tasador/reparto-fotos.ts               · hidratación
lib/tasador/cola-fotos.ts                  · cola offline IndexedDB
app/api/tasaciones/[id]/fotos/route.test.ts   · 15 tests
lib/tasador/fotos.test.ts                     · 14 tests
lib/tasador/reparto-fotos.test.ts             · 10 tests
lib/tasador/cola-fotos.test.ts                ·  8 tests
```

## 10 · Siguiente por orden del plan

**P6-TAS — Pantalla 4 · Avance lectura de datos** (§7 del plan · spec §2.7).
