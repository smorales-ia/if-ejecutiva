# Snapshot · P5-TAS parcial — Pantalla 3 · Ingreso de fotos

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`. **Commit previo** — `13ea502`.
> **Estado** — ⏸ **PAUSADA · 3 de 6 batches.** Sin commitear: Sergio commitea por GitHub Desktop.
> **Airtable** — **no se tocó** en esta tanda. **Código server (`app/api/`)** — no se tocó.

---

## 1 · Contexto de la tanda

**P5-TAS construye la Pantalla 3 del tasador** —el organizador de fotos de la visita— según §6 del
plan `docs/_md/plan_ejecucion_UItasador_v1.2.md`, spec §2.6 y RF-TAS-14 / RF-TAS-06.

Arrancó tras la tanda documental del 22-ago-2026 (`13ea502`), que había dejado `RESUME.md`
apuntando a P5-TAS como siguiente por orden del plan. La pantalla **no era un stub**: existía desde
el import del v0 con 189 líneas funcionando, y la tanda consistió en cerrar la distancia entre eso
y los 13 criterios de aceptación de §6.3.

## 2 · Estado

| Batch | Qué | Estado |
|---|---|---|
| **B1** | A-16 aislada + fix del mínimo de categorías personalizadas | ✅ **completo** |
| **B2** | Tipo real de foto + hidratación desde `GET /fotos` | ⛔ **bloqueado por CI-052** |
| **B3** | Subida real punta a punta | ⛔ **bloqueado por CI-052** |
| **B4** | Cola offline IndexedDB | ⛔ **bloqueado transitivamente** (depende de B3) |
| **B5** | Sheet documental reutilizado (R7) | ✅ **completo** |
| **B6** | Tests + fichas CI + aprendizajes | ✅ **completo** |

**B2 está bloqueado por una razón concreta, no por prudencia:** `GET /api/tasaciones/[id]/fotos`
filtra por `subido_por = "Tasador"`, así que mientras no exista el camino de escritura devuelve
vacío siempre. Hidratar de una fuente que no puede tener datos no probaría nada.

## 3 · Lo que quedó construido

### B1 · A-16 con un único punto de cambio

`lib/tasador/minimos-fotos.ts` **(nuevo)** concentra la resolución de mínimos, que vivía repartida
en tres sitios: el catálogo `CATEGORIAS_FOTO`, el traductor `resolverLimite()` y la evaluación
dentro del componente. Ninguno estaba mal, pero revertir A-16 obligaba a visitar los tres y a
confiar en que no hubiera un cuarto.

`MINIMOS_DINAMICOS` mapea las tres categorías dinámicas a la **clave del dato declarado**, no a un
número: fijar los mínimos es sustituir `'dorm'` por `2` y nada más. La cabecera lleva el
`TODO(A-16)` con lo que está en juego —*una casa de 5 dormitorios se daría por completa con 2 fotos
de habitaciones*— y dónde se cambia.

**`resolverLimite()` se retiró de `lib/tasaciones.ts`, no se movió.** Hacer que delegara en el
módulo nuevo habría creado un ciclo de imports (`minimos-fotos` importa `CATEGORIAS_FOTO` de allí);
dejarlo duplicado era justo lo que el criterio de §6.3 prohíbe. No tenía consumidores.

**Bug de requisito corregido.** Las categorías personalizadas se creaban con `minimo: 1` y
`evaluarCustom` calculaba `completa: count >= minimo`, de modo que una recién creada aparecía
**marcada como incompleta** y contaba contra el estado global. RF-TAS-14 es literal: *"admite fotos
sin exigir mínimo"*. `minimoCategoriaPersonalizada()` sobrescribe además el `minimo` de los
borradores ya guardados en `localStorage`, para que uno viejo no reviva la exigencia.

*Archivos:* `lib/tasador/minimos-fotos.ts` *(nuevo)* · `lib/tasaciones.ts` ·
`components/tasador/fotos-categorizadas.tsx`.

### B5 · R7 cumplido: el sheet se reutiliza, ya no se copia

`components/tasador/sheet-documentos.tsx` era una **reimplementación de 242 líneas** del sheet
documental de la ejecutiva. **Eliminada.** Pantalla 3 abre ahora
`components/console/documentos-adjuntos-sheet.tsx`, el mismo componente que IF-02.

Tres obstáculos reales, y ninguno era el que el plan anticipaba:

1. **El sheet no filtraba por `tipo_propiedad`.** Reutilizarlo tal cual habría perdido RF-TAS-06
   entero, que es el motivo del requisito. Se agregó la prop **opcional** `filtroTipos`, aditiva.
2. **Exigía un `Solicitud` completo** —40 campos— cuando **lee 5**. Se estrechó la prop a
   `SolicitudParaSheetDocumentos = Pick<Solicitud, 'id'|'codigoExt'|'cliente'|'estado'|'unidades'>`.
   Estrechar un parámetro es más permisivo para el llamador, así que IF-02 compila sin cambios — y
   evita la alternativa mala: fabricar 30 campos con `""` en el adaptador.
3. **Degradaba a sólo lectura** con cualquier estado ≠ `creada`. Se pasa `readOnly={false}`
   explícito, con el comentario que explica por qué no es redundante.

**Verificación previa exigida por Sergio:** el único consumidor del sheet en IF-02 es
`components/console/solicitud-detail.tsx:594`, que pasa `open` / `onOpenChange` / `solicitud` /
`readOnly` y **no toca la prop nueva**. Sin cambio de comportamiento observable.

**Efecto colateral declarado.** `components/tasador/expediente-sheet.tsx` leía
`payload.documentosCargados`, que poblaba la copia eliminada; ese bloque rinde ahora vacío. No es
pérdida: fabricaba nombres `${tipo}_${i}.pdf` que nunca fueron archivos reales, y los adjuntos
verdaderos (`tasacion.adjuntosDropbox`) se siguen mostrando al lado. Se dejó el comentario en el
sitio; borrarlo es trabajo de **RF-TAS-10**.

*Archivos:* `components/console/documentos-adjuntos-sheet.tsx` ·
`lib/tasador/adaptador-solicitud.ts` *(nuevo)* · `components/tasador/fotos-screen.tsx` ·
`components/tasador/expediente-sheet.tsx` · **elimina** `components/tasador/sheet-documentos.tsx`.

### B6 · Tests y documentación

**29 tests nuevos** en tres archivos co-ubicados, según la convención del repo:

| Archivo | Cubre |
|---|---|
| `lib/tasador/minimos-fotos.test.ts` | A-16: mínimos dinámicos contra lo declarado, las cinco fijas, cero declarado = cero exigido, `null` ≠ cero |
| `components/tasador/fotos-categorizadas.test.ts` | Contador y total del header en la misma interacción; ocho categorías; sin "Documentos"; personalizada sin mínimo |
| `lib/tasador/adaptador-solicitud.test.ts` | Los 5 campos del adaptador; `unidades` vacío deliberado; el filtro de P-5 produce coincidencias no vacías |

**Evidencia por `grep` de los criterios de §6.3:**

- import de `documentos-adjuntos-sheet` en `components/tasador/` → **1** (en `fotos-screen.tsx`)
- copias del sheet bajo `components/tasador/` → **0**
- literales de mínimo en componentes fuera de tests → **0**

*Archivos:* los tres `*.test.ts` *(nuevos)* · `docs/CODE_INCONSISTENCIES.md` ·
`docs/_archivo/aprendizajes-20260822-1345-P5-TAS.md` *(nuevo)*.

## 4 · El bloqueo · CI-052

El Gate 1 exigía verificar antes de B3 que `/api/adjuntos/upload` *"existe y funciona"*. **Existe y
funciona.** El problema aparece al mirar qué más hace.

**`POST /api/adjuntos/upload` no sólo sube el binario: también crea la fila en `TX_Adjuntos`.** Lo
hace el módulo 8 de `SC-Adjuntos-Upload`, dentro del escenario Make, y la ruta lo trata como parte
obligatoria de su contrato — responde **502** si Make contesta 200 sin `adjunto_id`.

**`POST /api/tasaciones/[id]/fotos` hace su propio `createRecord`** sobre la misma tabla.

Encadenarlos como describe §6.1 —*"el archivo sube por el pipeline existente… el POST de acá
registra la fila y su categoría"*— deja **dos filas por foto**: una con el archivo y sin categoría,
otra con la categoría y la URL copiada. Los contadores de `GET /fotos` contarían de más y el
expediente mostraría duplicados.

**Por qué nadie lo vio antes:** el alta en Airtable vive dentro del escenario Make, no en el código
del Route Handler. Leer `upload/route.ts` no revela que crea una fila salvo que se siga el rastro
hasta el comentario del módulo 8. La suposición de P2-TAS.A está escrita en el docblock de
`/fotos`, es razonable, y simplemente no es cierta.

**Impacto: alto sobre la tanda, nulo en producción hoy.** Nada llama todavía a `POST /fotos`, así
que la duplicación **no ha ocurrido nunca**.

### Las tres salidas evaluadas

| # | Salida | Costo | Valoración |
|---|---|---|---|
| **(a)** | **Dueño el pipeline.** `/fotos` deja de crear y pasa a **actualizar** el registro que Make ya creó, escribiendo la categoría sobre el `adjunto_id` devuelto | Un Route Handler: `POST` muta a `PATCH` o acepta un `adjuntoId` existente | ✅ **Recomendada.** Es la que menos toca: el pipeline sigue siendo la única puerta a Dropbox y conserva la idempotencia por `hash_md5` que `SC-Adjuntos-Upload` ya resuelve |
| (b) | **Dueño `/fotos`.** El pipeline deja de crear fila para fotos | Tocar el escenario Make de IF-02 | Más caro y con más superficie de riesgo sobre una integración en producción |
| (c) | **Ruta propia de subida para IF-03** | Alto | Viola R7 y duplica la integración con Dropbox. Se descarta salvo motivo fuerte |

**Por qué no se resolvió sobre la marcha:** la corrección vive en `app/api/`, que esta tanda tenía
vedado salvo bug, y *cuál* endpoint es dueño de la fila es una **decisión de diseño**, no una
errata. §2.6 dice *"guardado en Dropbox por API Route con retry offline"* y **no adjudica**.

## 5 · Fichas CI abiertas

| Ficha | Qué | Estado |
|---|---|---|
| **CI-051** | **`TX_Adjuntos.seccion` no existe.** La tabla tiene 26 campos verificados por Meta API y ninguno se llama así, pero §2.6 y el criterio de §6.3 piden escribirlo. La categoría va en `tipo_adjunto` (valor cerrado `foto_interior`) y `descripcion` (texto libre, que admite las personalizadas) | abierta · **impacto bajo** — la info se guarda con otro nombre. Decisión de negocio: crear el campo y migrar, o corregir la spec |
| **CI-052** | **Doble alta en `TX_Adjuntos`** al encadenar los dos endpoints | abierta · **bloqueante de la persistencia de fotos** |

**Nota de proximidad, anotada en CI-052.** `GET /api/solicitudes/[id]/adjuntos` **no tiene guard de
pertenencia**: valida el record ID y la sesión de Clerk, pero no comprueba que la solicitud sea del
usuario. Apareció al reutilizar el sheet documental desde IF-03, que consume esa ruta a través de
`useAdjuntosSolicitud`. **No la introdujo P5-TAS** y no es de su alcance corregirla; se anota por
proximidad temática con **CI-050**, que registra el mismo tipo de hueco en las páginas del tasador.

## 6 · Estado tsc + build + test

| Comando | Resultado |
|---|---|
| `pnpm tsc --noEmit` | ✅ **exit 0** |
| `pnpm build` | ✅ **exit 0** · *Compiled successfully in 37.0s* |
| `pnpm test` | ✅ **23 archivos · 444 tests** (línea base 20 / 415) |

La precondición al abrir la tanda ya estaba verde, sin necesidad del rebuild que hizo falta en la
sesión anterior. Los `Dynamic server usage` que el build emite sobre `/tasaciones` son informativos
y **preexistentes**: Next intenta render estático y la ruta opta por dinámico.

## 7 · Verificación pendiente

**Viewport 375×812 — no verificado.** No hubo entorno gráfico en la sesión. Es el **único criterio
de §6.3 no cubierto que no depende de CI-052**; los demás pendientes (`seccion` en cada alta, cola
IndexedDB) están bloqueados por CI-051 y CI-052 respectivamente.

Conviene mirarlo con atención en esta pantalla por dos cambios de esta tanda: el botón nuevo
"Cargar documentos de la propiedad" ocupa ancho completo sobre el listado de categorías, y el sheet
que abre es el de IF-02, diseñado para escritorio.

## 8 · Estado git al pausar

**Sin commitear.** Nada se subió; Sergio commitea por GitHub Desktop.

```
 M components/console/documentos-adjuntos-sheet.tsx
 M components/tasador/expediente-sheet.tsx
 M components/tasador/fotos-categorizadas.tsx
 M components/tasador/fotos-screen.tsx
 D components/tasador/sheet-documentos.tsx
 M docs/CODE_INCONSISTENCIES.md
 M lib/tasaciones.ts
?? components/tasador/fotos-categorizadas.test.ts
?? docs/_archivo/aprendizajes-20260822-1345-P5-TAS.md
?? docs/_notas/snapshot-P5-TAS-parcial.md
?? lib/tasador/adaptador-solicitud.test.ts
?? lib/tasador/adaptador-solicitud.ts
?? lib/tasador/minimos-fotos.test.ts
?? lib/tasador/minimos-fotos.ts
```

**6 modificados · 1 eliminado · 7 nuevos** (contando este snapshot). El saldo del diff es negativo
—238 insertions contra 300 deletions— porque se fue la copia de 242 líneas.

---

## 9 · Prompt de reanudación

> Copiar tal cual en una sesión nueva de Claude Code, sobre la rama `feat/tasador-ui`.

```
# Reanudar P5-TAS · Pantalla 3 · Ingreso de fotos (tanda parcial)

## Contexto
P5-TAS quedó a medias: 3 de 6 batches completos. TODO el estado está en:
docs/_notas/snapshot-P5-TAS-parcial.md

Leelo COMPLETO antes de hacer nada. B1 (A-16 aislada), B5 (sheet documental
reutilizado · R7) y B6 (tests + fichas CI) están terminados y NO se rehacen.

## Lectura obligatoria
1. docs/_notas/snapshot-P5-TAS-parcial.md  (este estado)
2. docs/CODE_INCONSISTENCIES.md — fichas CI-051 y CI-052
3. docs/_md/plan_ejecucion_UItasador_v1.2.md §6 (P5-TAS)
4. docs/_md/VProperty_Especificacion_Proyecto_v1_9_14.md §2.6 · RF-TAS-14 · RF-TAS-06
5. docs/_archivo/aprendizajes-20260822-1345-P5-TAS.md
6. Repo: app/api/adjuntos/upload/route.ts y app/api/tasaciones/[id]/fotos/route.ts
   — leer los DOS docblocks completos: ahí está el conflicto de CI-052.
7. package.json · verificar pnpm tsc --noEmit + pnpm build + pnpm test verdes
   antes de tocar nada. Si tsc falla por artefacto stale de .next/, rebuild
   y seguir (pasó en la sesión del 22-ago). Es precondición dura.

## Estado verificado al pausar
- tsc 0 · build 0 · test 23 archivos / 444 tests.
- Sin commitear: 6 modificados, 1 eliminado, 7 nuevos. Sergio commitea aparte.
- Airtable NO se tocó en la tanda. app/api/ NO se tocó.

## Lo primero que hay que hacer
Presentarle a Sergio las DOS preguntas que bloquean B2/B3/B4 y esperar
respuesta. No arrancar ningún batch antes.

  (i) CI-052 · ¿quién es dueño de la fila en TX_Adjuntos?
      /api/adjuntos/upload YA crea la fila (módulo 8 de SC-Adjuntos-Upload) y
      POST /api/tasaciones/[id]/fotos hace su propio createRecord sobre la
      misma tabla. Encadenarlos duplica el registro de cada foto.
      Opción (a) RECOMENDADA: que /fotos ACTUALICE el registro que Make ya
      creó —PATCH sobre el adjunto_id devuelto— en vez de crear uno nuevo.
      Toca un solo Route Handler y deja el pipeline de IF-02 intacto.
      Opción (b): que el pipeline no cree fila para fotos (toca Make).
      Opción (c): ruta propia de subida para IF-03 (viola R7, descartada).
      ⚠ Implica tocar app/api/, vedado en la tanda anterior. Requiere OK
      explícito de Sergio y define el alcance de B2/B3/B4.

  (ii) Viewport 375×812 · ¿lo verifica Sergio a mano o se espera entorno
       gráfico? Es el único criterio de §6.3 pendiente que NO depende de
       CI-052. Mirar en especial el botón "Cargar documentos de la propiedad"
       (ancho completo) y el sheet de IF-02, diseñado para escritorio.

## Con las respuestas, el trabajo restante
- B2 · tipo real de foto (FotoAdjunta con id/url/thumb/categoria) en lugar de
  number[] · hidratación desde GET /fotos al montar.
  ⚠ B2 depende de B3: GET /fotos filtra por subido_por="Tasador", así que
  hasta que exista escritura devuelve vacío siempre.
- B3 · subida real punta a punta: FileUploadZone -> /api/adjuntos/upload ->
  Make -> Dropbox -> registro de categoría según lo que decida (i).
  Regla D completa: disabled + Loader2 + "Subiendo…" + finally.
- B4 · cola offline IndexedDB (NO localStorage · §0.2) con retry.
  Nota: lib/tasador/tasador-store.ts usa localStorage y eso es legítimo —
  es el autosave del borrador, excepción declarada de §0.2. La cola es otra cosa.
- Cerrar: actualizar docs/_archivo/aprendizajes-20260822-1345-P5-TAS.md,
  cerrar CI-052 si (i) se implementa, y este snapshot.

## Reglas de la tanda
- R4 escalado: código de cliente + componentes permitidos.
- app/api/ SÓLO si Sergio aprueba (i) — y sólo el handler que esa decisión toque.
- Sin commits: Sergio commitea por GitHub Desktop en feat/tasador-ui.
- Verificación final: pnpm tsc --noEmit && pnpm build && pnpm test verdes.
```
