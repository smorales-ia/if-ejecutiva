# Aprendizajes P2-TAS.B — Capa cliente y cierre del build verde

- **Interfaz:** IF-03 · Tasador
- **Fecha:** 2026-08-18
- **Modo Claude Code usado:** `accept edits on`
- **Contrato aplicado:** 🟡 pausa-en-comandos (con el ajuste de §0.2 del snapshot: `tsc`/`build`/`test` y lectura local corren sin confirmación)
- **Build antes:** tsc ❌ **42 errores** · build ❌ `Module not found`
- **Build después:** tsc ✅ **0 errores** · build ✅ **verde** · test ✅ 325 verdes
- **Estado de la tanda:** **completada**
- **Commit asociado:** (Sergio lo agrega tras commit)

---

## Resumen ejecutivo

- **OV-7 cerrada.** Primer `pnpm build` verde desde que el código v0 entró al repositorio: venía rojo desde P0-TAS y se difirió tanda a tanda hasta acá.
- **42 → 0 errores de `tsc`.** 34 rutas compiladas (6 de UI del tasador + 11 de su API + las de IF-02 intactas). **325 tests verdes, cero regresiones** — los mismos 13 archivos de la línea base.
- **3 archivos borrados, 4 creados, 12 modificados.** Cero ficheros de IF-02 tocados.
- La capa cliente quedó cableada contra las once rutas de P2-TAS.A, con un mapper compartido entre Server Components y Route Handlers.
- **9 fichas CI nuevas** (CI-027 … CI-035) y **dos reglas nuevas** (RO-34 · RO-35).
- **Tres bugs graves del v0 cazados escribiendo**, no ejecutando: ningún test del repo los habría revelado.

---

## Ambigüedades / inconsistencias declaradas en esta tanda

| Ficha | Qué | Estado |
|---|---|---|
| **CI-027** | Borrado de `coordinar-visita.tsx` + su page por RO-29 · 6 rutas de UI contra las 7 de CI-020 | abierta · sólo parte documental |
| **CI-028** | `marcarPdfListo` sin ruta backend · stub declarado con `console.warn` | abierta · falta definición de negocio |
| **CI-029** | `TipoDocumento.obligatorio` no existe en Airtable ni por concepto para el Tasador | abierta · falta decisión de modelo |
| **CI-030** | Enmienda a OV-4 · `leerTasacion` en `lib/tasador/lectura-tasacion.ts` | **cerrada** |
| **CI-031** | A-18 deja de bloquear el frente cliente · `factores-default` como forma pura | **cerrada** en cliente · A-18 sigue abierta |
| **CI-032** | Doble `POST /calcular` en `tasacion-form` del v0 | **cerrada** |
| **CI-033** | `estado-procesando` auto-disparaba AT03 desde un efecto de montaje | **cerrada** |
| **CI-034** | `server-only` ausente de `package.json` · frontera por convención | abierta · requiere tocar `package.json` |
| **CI-035** | `contactoTelefono` derivado de `vendedor_telefono` | abierta · asunción sin verificar |

**Dueño y Fecha objetivo van en blanco en las nueve** (excepción **C-12**). La columna «Deuda
técnica» de más abajo sugiere en qué tanda encajaría cada una por afinidad técnica, pero **eso no
es una asignación**: imputar dueño o fecha desde la tanda que encuentra el hallazgo genera
compromisos que nadie acordó y que por tanto nadie revisa. El pase es explícito y lo hace Sergio.

**A-18 · qué se construyó y qué no.** Se construyó la **forma**: `nuevoComparable()` con los tres
factores en `""` y `ufHomogeneizada()` calculando sobre lo tecleado. **No** se construyó la
**precarga** desde `GET /api/tasaciones/config/defaults`, que sigue bloqueada esperando a Héctor y
Óscar y entra en P7-TAS. La distinción entre las dos cosas es el hallazgo de la tanda en este
frente: A-18 bloqueaba menos de lo que se le atribuía, y esa atribución de más mantuvo el build
rojo un error más de lo necesario.

**RO-29 · lo que arrastró.** Además de los dos archivos borrados, quedan sin efecto la unicidad
blanda del POST de coordinación y su test. `Tasacion.coordinacionVigente` se proyecta como `null`
porque no hay tabla de la que leerlo; **P3-TAS lo elimina del tipo**.

---

## Decisiones técnicas

1. **El mapper de `Tasacion` es uno solo y lo comparten pantalla y API.** `proyectarTasacion()` vive
   en `lib/tasador/lectura-tasacion.ts` y lo consumen tanto los Server Components (`leerTasacion`,
   `leerCola`) como las dos rutas GET. No es una preferencia estética: antes de esta tanda **ninguna
   de las dos rutas satisfacía el tipo `Tasacion`** —faltaban ocho campos no-opcionales— y la UI
   compilaba contra una forma que el API no servía. Unificar el mapeo es lo que impide que vuelvan a
   divergir.

2. **Los Server Components leen Airtable directo, no su propia ruta HTTP.** Es la convención probada
   de IF-02: `app/(ejecutiva)/consola/page.tsx` llama `fetchSolicitudes` de `lib/solicitudes.ts`.
   Evita un salto de red para pintar la primera vez y no obliga a reenviar la cookie de sesión.

3. **Los Link se resuelven a nombre con maestros cacheados, no cambiando `cellFormat`.** IF-02 lee
   con `cellFormat: 'string'` y por eso recibe los Link ya resueltos; las rutas de IF-03 no, así que
   `comuna`, `cliente`, `producto` y `tipo_propiedad` llegan como arrays de recordIds. Se resuelven
   con `fetchCatalogos()` de IF-02 —que ya cachea tres de los cuatro— más un mapa propio de
   `M_Comunas`. **Migrar el `cellFormat` habría convertido en string todo lo numérico** que `/datos`
   e `/informe` ya mapean con su tipo real: un refactor de la capa server entera para resolver
   cuatro campos.

4. **`readPayload` devuelve `InformeData | null`.** Dos consumidores lo usaban como no-nulo y uno
   con `??`. Devolver siempre un objeto habría exigido inventar un formulario en blanco dentro del
   store, que no tiene la `Tasacion` desde la que construirlo. Cada pantalla declara su arranque con
   `resolverInforme(tasacion)`.

5. **El borrador local no se borra al guardar.** `writePayload` no limpia; existe `clearPayload()`
   para quien confirme que el PATCH llegó. Borrar al escribir dejaría al tasador sin red justo en el
   caso que el módulo existe para cubrir: el guardado que falló.

6. **`version: 0` y `coordinacionVigente: null` son los dos únicos campos sin origen real**, y van
   con su comentario en el sitio (CI-024 y RO-29 respectivamente). Ningún otro campo de la
   proyección se rellenó con un valor de relleno.

7. **El `estado` in-flight del botón de cálculo reutiliza `blocked`**, que ya renderizaba spinner y
   el literal «Cálculo en curso». Un cuarto estado habría duplicado ese render para decir lo mismo.

---

## Overrides aplicados (rutas reales vs plan)

- **OV-4 · enmendado.** El plan y OV-4 situaban todo lo del v0 en `@/lib/tasaciones`. La lectura de
  Airtable se movió a `lib/tasador/lectura-tasacion.ts`: `lib/tasaciones.ts` lo importan componentes
  cliente y el token habría entrado al bundle. Ficha **CI-030**; enmienda registrada en
  `docs/aprendizajes.md`.
- **OV-9 · aplicado tal cual se recomendaba.** El hook fue a `lib/tasador/use-estado-tasador.ts` y
  no a `hooks/`, que no existe y R5 no autoriza. Se reescribieron los 4 imports. **El mismo criterio
  se extendió** a `tasador-store` y a `factores-default`, que el v0 buscaba en `lib/` raíz.
- **OV-6 · vigente y sin resolver.** `factores-default` se construyó, pero el nombre sigue
  sugiriendo lo que RF-TAS-08 prohíbe y **miente sobre el contenido**: no hay ningún default dentro.
  Se conservó por ser la ruta del v0. Renombrarlo es gratis si P7-TAS toca el archivo.
- **OV-7 · cerrada.** Era el objetivo declarado de la sub-tanda.
- **OV-10 · resuelto sin tocar IF-02.** `tipoDocumentoLabel` y `documentosPara` se sustituyeron por
  `useTiposDocumento()` —hook cliente de IF-02, importado no editado— y `documentoAplicaA()` de
  `lib/tasador/tipo-propiedad.ts`, que P1-TAS ya había escrito para P-5. `obligatorio` se retiró: no
  existe (**CI-029**).
- **Archivo no previsto en el diff: `components/tasador/cola-tasaciones.tsx`.** `app/tasaciones/page.tsx`
  tenía que pasar a Server Component para leer la cola, y los chips necesitan `useState` y
  `useSearchParams`. Un archivo es cliente o servidor, no ambos. Contenido idéntico al v0, sin
  rediseñar: los chips, el stub de «Hoy» (A-12) y el colapso de la Regla T-A siguen siendo de P3-TAS.

---

## Verificación de la frontera R5

`git status --porcelain` al cierre — **27 entradas, ninguna fuera del territorio de IF-03**:

```
 M app/api/tasaciones/[id]/route.ts        M components/tasador/informe-preview.tsx
 M app/api/tasaciones/route.ts             D components/tasador/intentos-indicator.tsx
 D app/tasaciones/[id]/coordinar/page.tsx  M components/tasador/sheet-documentos.tsx
 M app/tasaciones/[id]/estado/page.tsx     M components/tasador/tasacion-form.tsx
 M app/tasaciones/[id]/fotos/page.tsx      M docs/CODE_INCONSISTENCIES.md
 M app/tasaciones/[id]/informe/page.tsx    M docs/aprendizajes.md
 M app/tasaciones/[id]/lectura/page.tsx    M lib/tasaciones.ts
 M app/tasaciones/[id]/page.tsx           ?? components/tasador/cola-tasaciones.tsx
 M app/tasaciones/page.tsx                ?? lib/tasador/factores-default.ts
 D components/tasador/coordinar-visita.tsx ?? lib/tasador/lectura-tasacion.ts
 M components/tasador/estado-procesando.tsx ?? lib/tasador/tasador-store.ts
 M components/tasador/expediente-sheet.tsx ?? lib/tasador/use-estado-tasador.ts
 M components/tasador/form-sections/fields.tsx
 M components/tasador/form-sections/seccion-comparables.tsx
 M components/tasador/form-sections/seccion-propiedad.tsx
 M components/tasador/fotos-screen.tsx
```

`796 insertions(+), 840 deletions(-)` en 23 archivos rastreados, más 5 nuevos.

- **Sin cambios** en `app/api/solicitudes/**`, `components/console/**`, `app/(ejecutiva)/**` ni
  ningún `lib/*.ts` de IF-02.
- `lib/tasaciones.ts` es la excepción conocida de **OV-4**, ya asumida desde P1-TAS.
- **`package.json` intacto: cero dependencias nuevas.** Se evaluó `server-only` y se descartó
  precisamente por eso (**CI-034**).
- `lib/use-tipos-documento.ts` y `lib/catalogos.ts` de IF-02 se **importan, no se editan** (R5-E).

---

## Bugs / obstáculos y resolución

### 1 · Tres defectos del v0 que sólo aparecen al cambiar el sustrato

Los tres nacen del mismo mecanismo y ninguno es visible leyendo el v0 aislado: código correcto
contra un store en memoria que se vuelve peligroso, o simplemente falso, contra Airtable.

- **Doble `POST /calcular`** (CI-032). `marcarVisitada()` y `enviarParaCalculo()` eran dos
  operaciones distintas sobre el store; contra el backend son **la misma escritura llamada dos
  veces**. Sin `await` ni manejo de error, el 409 de RF-TAS-07 se descartaba en silencio.
- **Auto-disparo de AT03** (CI-033). `estado-procesando` lanzaba el cálculo desde un `useEffect` de
  montaje si el estado era `BORRADOR`. Contra el store cambiaba una variable; contra Airtable, un
  **F5 o un enlace compartido** ejecutaba la transición irreversible.
- **Estados fantasma.** `BORRADOR`, `EN_CALCULO`, `INFORME_DISPONIBLE` y `APROBADO` eran literales
  del store del v0 y **no existen en la máquina de estados real** (`asignada · visitada · calculada
  · pdf_listo`). Las comparaciones no fallaban: devolvían `false` para siempre, dejando pantallas
  congeladas en su fase inicial sin error visible.

**Regla que dejan:** al portar una UI de prototipo a un backend real, los puntos de riesgo no son
los que el compilador señala —ésos se arreglan solos— sino **las llamadas que siguen compilando y
cambian de significado**. Merecen una lectura dedicada, función por función, antes de dar la capa
por cableada.

### 2 · Ningún test los habría cazado, y conviene entender por qué

No hay cobertura del código v0 y no la habrá: es código que las tandas de UI reescriben. Los tests
de `calcular/route.test.ts` prueban el **servidor**, donde el comportamiento es correcto — el 409 se
emite y sólo hay una escritura. Los tres defectos vivían enteramente en el cliente, en el hueco
entre funciones que nadie había mirado juntas.

**Corolario:** una suite verde sobre la capa server no dice nada sobre la capa cliente que la llama.
Los 325 tests pasaron igual antes y después de corregir tres bugs que habrían disparado una
automatización irreversible en producción.

### 3 · `server-only` estaba en el lockfile y no en `package.json`

Se escribió `import 'server-only'` en `lectura-tasacion.ts`, se verificó contra `package.json` —donde
**no está**— y se retiró: sólo aparece como transitiva de Next en `pnpm-lock.yaml:2314`, y
declararlo habría roto el «cero dependencias nuevas» de la tanda. La frontera queda por convención,
igual que `lib/solicitudes.ts`, que lleva meses en producción así. Ficha **CI-034**.

**Lección de método, no de código:** el lockfile no es evidencia de que una dependencia sea usable
desde código propio. La pregunta correcta es qué declara `package.json`.

### 4 · El build no es porcentual

Durante el diseño del diff se habló de dejar «OV-7 al 97 %» con un error residual de A-18. Eso no
existe: `pnpm build` falla o pasa. Con el import sin resolver, la traza de importación llegaba hasta
`app/tasaciones/[id]/informe/page.tsx` y **la pantalla del preview no compilaba** — no le faltaba
una sección, no existía. Un error de módulo no resuelto no es un 3 % de deuda: es una pantalla caída.

### 5 · `.next` conservaba una referencia a la ruta borrada

Tras eliminar `app/tasaciones/[id]/coordinar/page.tsx`, `tsc` seguía reportando un error en
`.next/types/validator.ts`, que aún indexaba la ruta. No es código fuente: es un artefacto del build
anterior. `rm -rf .next` lo purgó. **Al borrar una ruta de App Router, el árbol de tipos generado
sobrevive hasta el siguiente build limpio**, y ese error fantasma se puede confundir con uno real.

---

## Deuda técnica para tandas siguientes

| Para | Qué |
|---|---|
| **P3-TAS** | Chip «Hoy» como stub (A-12) · colapso de la Regla T-A a un botón · eliminar `coordinacionVigente` y `SlaStatus.por_coordinar` del tipo · **verificar CI-035** (`contactoTelefono`) · decidir si la card muestra el contacto prioritario real de `TX_ContactosVisita` |
| **P7-TAS** | Precarga de factores cuando A-18 cierre · `tipoZona` → Link `M_Zonificacion` (hoy cableado al texto libre `tipo_zona_descripcion`) · **CI-029** (`obligatorio`) · **CI-034** (`server-only`) · rename de `factores-default` (OV-6) · los 26 huérfanos de CI-023 |
| **P9-TAS** | **CI-028** · la ruta de envío del informe debe existir antes de que el botón deje de ser stub · la cabecera del preview no mostrará versión hasta que el pipeline PDF pueble el Link (CI-024) |
| **Documental** | **CI-027** · actualizar CI-020 y el Blueprint al árbol real de **6 rutas**, citando RO-29 |
| **Sin dueño** | `test:e2e` sigue siendo un script huérfano (sin `playwright.config` ni el paquete) |

---

## Reglas nuevas → MIGRAR a `docs/aprendizajes.md`

Ya escritas en el archivo vivo:

- **RO-34 · Ausencia ≠ neutro.** Un campo no tecleado se representa como `""` o `null`, nunca como
  su valor neutro (`1` multiplicativo, `0` aditivo): el neutro es indistinguible de una decisión
  explícita del usuario y hace invisible el sesgo aguas abajo. Un `0` tecleado **sí** se respeta —
  es decisión, no ausencia.
- **RO-35 · Ningún efecto de montaje dispara una escritura irreversible.** Toda transición que el
  negocio considere irreversible (AT01, AT02, AT03 y análogos) se dispara sólo por acción explícita
  del usuario, con sus validaciones previas hechas: nunca por `useEffect` al montar, por navegación
  ni por refresco. El montaje no expresa intención. Precedente: **CI-033**.
- **Enmienda a OV-4** — preservar la ruta del v0 vale para tipos y constantes, y no cierra la puerta
  a módulos server-only nuevos cuando aparece un concern de bundle o seguridad.

Candidata observada en esta tanda, **no promovida** (un solo caso; se decide más adelante si se
promueve o se refunde):

- Al portar UI de prototipo a backend real, auditar las llamadas que **siguen compilando** y cambian
  de significado, no sólo las que el compilador marca.
