# Aprendizajes P2-TAS — API Routes directas a Airtable

**Tanda:** P2-TAS.A (capa server) · **Fecha:** 18-ago-2026 · **Rama:** `feat/tasador-ui`
**Contrato:** 🟡 pausa-en-comandos con el ajuste de §0.2 · **Modo:** `accept edits on`

Sesión de continuación: la tanda se abrió el 17-ago y se pausó con 9 de 11 rutas
(`docs/_notas/snapshot-P2-TAS-A-en-curso.md`). Esta sesión cerró las 2 que faltaban, los 3 tests
y el cierre documental.

---

## Resumen ejecutivo

**P2-TAS.A completa: 11 rutas, 6 capas compartidas, 3 archivos de test con 39 casos.**
Suite del repo en **325 verdes** (13 archivos), sin mover ninguno de los 286 previos. `tsc` sigue
en 42 errores —los mismos de la pausa, **0 en lo escrito**— y el build verde sigue diferido a
P2-TAS.B por OV-7.

Lo escrito hoy: `GET · PATCH /datos` (8 tablas, sync destructivo de 4 hijas),
`GET /informe` (8 bloques desde 8 tablas), `lib/tasador/airtable-writes.ts`, y los 3 tests.

Lo encontrado hoy pesa más que lo escrito: **4 fichas CI nuevas**, todas por contraste del schema
real contra la documentación, y ninguna detectable sin bajar el schema.

---

## Ambigüedades / inconsistencias declaradas en esta tanda

| Ficha | Qué | Estado |
|---|---|---|
| **CI-023** | 26 campos de `InformeData` sin columna destino · `dfl2` es fórmula · 4 pares de homónimos | abierta · parcial · difiere a **P7-TAS** |
| **CI-024** | `TX_DocumentosGenerados`: Link `solicitud` vacío y `clave_natural` en otro namespace | abierta · parcial · dueño del pipeline PDF |
| **CI-025** | §20.6 declara 11 campos SII creados; **9 no existen**. Y §21 declara una verificación MCP que no los cubrió | abierta · **Héctor** |
| **CI-026** | El guard responde cuerpo idéntico pero **status distinto** (403 ajena / 404 inexistente); el docblock declara completa una mitigación parcial | abierta · **Héctor + seguridad** |
| **A-18** | Sin cambios: sigue bloqueante. Ninguna tabla sirve un factor de homogeneización | abierta |

---

## Decisiones técnicas

1. **El sync de las 4 tablas hijas borra filas** (`DELETE` real), en contraste deliberado con
   `/comparables`, que desliga. Criterio: pertenencia vs histórico compartido. → **RO-31**
2. **La clave de sync es determinista y server-side** (`{codigo_solicitud}-{discriminador}`), nunca
   el `id` del cliente: el v0 emite ids locales efímeros (`it-new-1`, `amp-3`, `rc-2`).
3. **Sección H persiste en `arriendo_mensual` + `gasto_anual`**, no en los homónimos `_clp`. La
   fórmula `ingreso_liquido_anual` usa los primeros; los segundos habrían dejado el cap rate en
   cero en silencio. Confirmado por aritmética contra `informe-preview.tsx:140`, no por nombre.
4. **`versionVigente: null`** cuando no hay fila casable en `TX_DocumentosGenerados`. No se parsea
   `clave_natural` para adivinar la solicitud.
5. **Los códigos SII salen vacíos**, no derivados del `rol_sii`. Se puede parsear; el negocio no
   lo definió. La regla es *«¿el negocio lo definió?»*, no *«¿se puede parsear?»*.
6. **El valor destacado del informe nunca cae a `0`.** Sin override y sin valor del motor, el
   bloque va con `null` y `vacio: true`: un `0` se renderiza como «0 UF», que es una tasación de
   cero pesos y no un dato ausente.
7. **La auditoría de colecciones hijas se registra contra `TX_Solicitudes`** con el nombre de la
   colección en `campo_modificado`. → **RO-32**
8. **Los huérfanos se aceptan y se declaran** en `noPersistidos[]`, no se rechazan con 400:
   rechazarlos rompería el autoguardado por sección, que manda el `InformeData` entero.

---

## Overrides aplicados (rutas reales vs plan)

- **Revisión de OV-8.** El override declaró innecesario `lib/tasador/airtable-writes.ts` porque
  `createRecord` y `listRecords` ya existían — cierto para esas dos. Pero **evaluó sólo las
  funciones que el plan nombraba**, y `deleteRecord` no existe en `lib/airtable-client.ts`. El
  envoltorio se creó igual, con un único export. OV-8 sigue vigente para create/list.
- **OV-6** sin novedad: `/config/defaults` no se construyó (A-18).
- **R5 respetado sin excepciones.** Cero ediciones fuera de `lib/tasador/`,
  `app/api/tasaciones/`, `docs/` y `CLAUDE.md`.

---

## Verificación de la frontera R5

```
 M CLAUDE.md
 M docs/CODE_INCONSISTENCIES.md
 M docs/aprendizajes.md
 M docs/_notas/snapshot-P2-TAS.md
 M lib/tasador/field-ids.ts
 M lib/tasador/validators/index.ts
?? app/api/tasaciones/[id]/datos/
?? app/api/tasaciones/[id]/informe/
?? app/api/tasaciones/[id]/calcular/route.test.ts
?? app/api/tasaciones/[id]/rechazo/route.test.ts
?? lib/tasador/airtable-writes.ts
?? docs/_archivo/aprendizajes-20260818-1550-P2-TAS.md
```

Sin cambios en `app/api/solicitudes/**`, `components/console/**`, `app/(ejecutiva)/**` ni
`lib/*.ts` de IF-02. `package.json` intacto: **cero dependencias nuevas**.

---

## Bugs / obstáculos y resolución

### 1 · `typecast` en dominios cerrados es contaminación silenciosa — el patrón se repitió dos veces

`createRecord` y `updateRecord` usan `typecast: true`, que resuelve un `singleSelect` por nombre.
La cara útil es que no hay que conocer el choice id; la cara peligrosa es que **un valor que no
existe en el dominio se crea como opción nueva**, sin error, y nadie se entera.

Apareció dos veces en la misma sesión, en contextos que no se parecen:

- **`A_Cambios.tabla_origen`** — dominio cerrado de 10 valores que **no incluye ninguna tabla
  hija** de captura. Auditar una ampliación con `tabla_origen = 'TX_Ampliaciones'` habría creado
  la opción y roto el filtro del timeline de IF-02, que lee por ese campo. → **RO-32**
- **`TX_TerminacionesPorRecinto.calidad`** — dominio `Alto · Medio · Basico`, y el v0 llena
  `Recinto.estado` con `OPCIONES.estadoConservacion` (`Bueno · Regular · Malo…`). Escribirlo
  habría creado "Bueno" como opción de calidad. Se dejó **sin escribir** y el campo pasó a la
  lista de huérfanos de CI-023.

**Regla:** antes de escribir un `singleSelect`, verificar su dominio real contra el schema. El
`typecast` que evita un error de escritura es el mismo que convierte una errata en una opción
nueva. Un dominio contaminado no falla nunca — degrada los filtros que lo leen.

### 2 · `CLAUDE.md` decía «vitest cuando esté» y vitest llevaba meses instalado

Al llegar a los 3 tests, la línea *«`pnpm test` — tests unitarios (vitest cuando esté)»* del
`CLAUDE.md` hizo plantear si había que montar el runner, lo que **tocaba `package.json` y por
tanto territorio IF-02 (R5)**. Se llegó a evaluar diferir los 3 tests a una tanda propia.

El diagnóstico tardó dos minutos y devolvió: **vitest 4.1.10 instalado**, `vitest.config.mts` con
el alias `@/` ya resuelto, **10 archivos de test y 286 casos verdes**, y dos precedentes de test
de Route Handler (`solicitudes/[id]/asignar` y `solicitudes/[id]/sla`). Cero dependencias que
instalar, cero configuración que escribir.

**Causa raíz:** la línea se escribió cuando era cierta y nadie la actualizó al agregar vitest en
`1bf7c67`. **Regla: verificar antes de asumir la documentación, incluida la propia.** Una tanda
estuvo a punto de diferirse por una frase desactualizada — el mismo mecanismo de CI-025, donde
§21 declara una verificación que no cubrió lo que dice cubrir. La doc que miente no es neutra:
apaga la comprobación que habría detectado el problema.

Corregido en `CLAUDE.md` en esta tanda.

### 3 · Contar filas de una tabla ≠ contar identificadores

CI-023 nació diciendo **20 campos sin columna destino**. Al sumarle los 2 hallazgos de hoy debía
quedar en 22; el conteo real dio **26**. La diferencia no eran hallazgos nuevos: la fila
`selloSec` de la tabla agrupa **tres** identificadores —`selloSec`, `selloSecId`,
`selloSecVencimiento`— en una sola línea por compactación visual, y el conteo original contó
filas creyendo contar campos.

**Regla: cualquier ficha CI que cite un conteo debe indicar si cuenta filas de documentación o
entradas reales del código/schema.** Y cuando dos artefactos citan el mismo conteo con números
distintos, la discrepancia se explica en el sitio, no se "arregla" igualando: `CAMPOS_SIN_DESTINO`
tiene **23** entradas y CI-023 lista **26** huérfanos, y ambos son correctos —cinco de los 26 son
sub-campos de una colección, no claves de primer nivel del payload—. Sin esa nota, el próximo
lector iguala los números y rompe uno de los dos.

### 4 · El doble tap se prueba ejecutándolo, no simulándolo

El test del 409 de `/calcular` podía escribirse afirmando que un estado `visitada` devuelve 409.
Eso prueba la condición, no el escenario. La versión que quedó **ejecuta la secuencia real**:
primera llamada → 200 y transición; el guard pasa a leer `visitada` —como haría Airtable—;
segunda llamada → 409. Y la aserción final es sobre el **efecto acumulado**:
`updateRecord` se llamó **una** vez entre las dos.

Eso es lo que protege el requisito: que AT03 se dispare una sola vez. Un test que sólo mira el
status de la segunda llamada pasa igual aunque la primera haya escrito dos veces.

**Regla para transiciones de estado irreversibles: el test recorre la secuencia y afirma el
número de escrituras, no sólo el código de respuesta de cada paso.**

### 5 · Un test de «no se llamó a nada» necesita su control negativo

El test del guard afirma que tras un 403 hay **cero** llamadas a `listRecords`, `getRecord`,
`createRecord`, `updateRecord` y `deleteRecords`. Esa aserción **pasa trivialmente si la ruta está
rota** y no llama nunca a nada — un `export async function PATCH() { return }` la satisface.

Por eso el archivo cierra con dos casos que hacen lo contrario: con el guard en verde, el GET
**sí** lee y el PATCH **sí** escribe. Sin ellos, los 12 casos anteriores podrían estar pasando por
la razón equivocada durante meses.

**Regla: todo test cuya aserción principal sea una ausencia necesita un caso gemelo que demuestre
la presencia.**

### 6 · Observación ajena a esta tanda: `test:e2e` es un script huérfano

`package.json` declara `"test:e2e": "playwright test"`, y **no existe `playwright.config.*` ni el
paquete instalado**. Correrlo hoy falla. No se tocó —está fuera del territorio de IF-03 (R5) y
fuera del alcance de la tanda— y se registra para el dueño del script.

---

## Deuda técnica para tandas siguientes

| Para | Qué |
|---|---|
| **P2-TAS.B** | Capa cliente y **build verde** (OV-7). `factores-default` sigue bloqueado por A-18 |
| **P7-TAS** | Los **26 huérfanos** de CI-023 · el formato tentativo de `clave_*` contra AT03 · `orientacion` singleSelect vs `string[]` · `dfl2` editable en el form pero fórmula en la base · `sup_construida_total` deriva de `piso1+piso2`, no de `sup_construccion_m2` |
| **P9-TAS** | La cabecera del preview no mostrará versión hasta que el pipeline PDF pueble el Link (CI-024) · el sub-bloque de códigos SII queda vacío (CI-025) |
| **P11-TAS** | Momento natural para resolver **CI-026** sin un cambio aislado: el guard ya cambia su fuente de identidad a Clerk |
| **Sin dueño** | `coordinar-visita.tsx` sigue huérfano tras RO-29 y aporta 13 de los 42 errores de `tsc` |

---

## Reglas nuevas → MIGRAR a `docs/aprendizajes.md`

Las cuatro ya están escritas en el archivo vivo:

- **RO-30** · MCP para diseño/verificación, `AIRTABLE_TOKEN` para producción. Son dos caminos para
  dos consumidores y no se mezclan.
- **RO-31** · Borrado vs desligado en sync de hijas: la pertenencia manda sobre la reversibilidad.
  Corolario: la clave de sync nunca es el `id` del cliente.
- **RO-32** · La auditoría de una colección hija se registra contra la tabla padre, con el nombre
  de la colección en `campo_modificado`.
- **RO-33** · Cuando un criterio de aceptación cambia de conteo por decisiones legítimas, la
  cadena de decisiones se escribe **al lado del conteo final**.
