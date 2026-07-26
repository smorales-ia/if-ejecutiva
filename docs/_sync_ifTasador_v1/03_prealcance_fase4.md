# 03 · Pre-alcance de Fase 4 — huecos declarados por bloqueo externo y por citación

**Fecha** — 26-jul-2026 · **Estado** — ejercicio de scoping. **Fase 4 no iniciada.**
**Base** — DoD §6.2 del prompt con desviación C-4 aplicada · estado del repo tras el lote 5 (`38f275d`)

> Este documento **no construye** `TRAZABILIDAD.md` ni `VALIDATION.md`. Mide qué parte de
> ellos es construible y qué parte no, y por qué. No modifica ningún otro archivo del repo.

---

## 1. Granularidad de la matriz y su autoridad

`TRAZABILIDAD.md` se construye como **RF-TAS × documento**, no RF-TAS × SC ni TX × RF-TAS.

La autoridad es **§6.2 del prompt**: *"cada RF-TAS debe aparecer al menos en: spec, ADR marcado
SUPERSEDED, Blueprint IF-03 y un documento operativo"*. La desviación **C-4** (Checkpoint #1)
retiró la columna ADR porque el documento no existe en el repo (**A-01**) y su celda se rellena
con `n/a · fuente externa`.

**Matriz efectiva: 10 filas × 3 columnas = 30 celdas.**

| Columna | Se satisface con |
|---|---|
| **spec** | `VProperty_Especificacion_Proyecto_v1_9_4.md` |
| **Blueprint IF-03** | `VProperty_Blueprint_Interfaces_v2_10.md` |
| **documento operativo** | cualquiera de `diseno.md`, `construccion.md`, `schema-airtable.md`, Motor v2.6, Origen de Datos v1.1, `CLAUDE.md` |

*Justificación de la granularidad en una línea:* el DoD mide **difusión de cada requisito por
capa documental** —que ningún RF-TAS viva sólo en el spec—, no el mapeo requisito↔escenario,
que es otro problema y vive en §2.11.

**Consecuencia no obvia:** con esta granularidad, **A-10 no bloquea la matriz**. A-10 es una
disputa de numeración `SC`, y ninguna celda de RF-TAS × documento depende de qué código lleve
un escenario Make. Si la matriz fuera RF-TAS × SC, A-10 la bloquearía casi entera. No lo es.

---

## 2. Las dos coberturas, disociadas

La distinción es la que decide si Fase 4 arranca o no, y colapsarla produce un diagnóstico
inservible.

| | Pregunta | Qué la usa |
|---|---|---|
| **Cobertura A** · por identificador | ¿aparece el string `RF-TAS-XX` en el documento? | **lo que la matriz construye**: una matriz de trazabilidad que no se ancla en el identificador no traza, sólo describe |
| **Cobertura B** · por contenido | ¿está descrito el comportamiento del `RF-TAS-XX` en el documento? | **lo que C-4 aceptó** como satisfacción de la columna Blueprint en Fase 3 |

Ambas son legítimas y miden cosas distintas. B mide si el trabajo documental se hizo; A mide
si es **auditable por búsqueda**. La Fase 3 se ejecutó optimizando B —se escribió el
comportamiento— sin exigir A, porque el criterio de aceptación de cada lote era el contenido.

---

## 3. Inventario de las 30 celdas

Las diez filas son las RF-TAS de §2 del spec v1.9.4:

| RF-TAS | Título |
|---|---|
| RF-TAS-01 | Filtros de cola: Hoy y Por coordinar |
| RF-TAS-02 | SLA con semáforo y horas restantes |
| RF-TAS-03 | Pantalla resumen de coordinación |
| RF-TAS-04 | Reapertura para segundo intento tras rechazo |
| RF-TAS-05 | Visibilidad de coordinación para la ejecutiva (IF-02) |
| RF-TAS-06 | Organizador de fotos sin categoría Documentos |
| RF-TAS-07 | Bloqueo de "Calcular Tasación" durante cálculo en curso |
| RF-TAS-08 | Valores por defecto parametrizados |
| RF-TAS-09 | Rechazo del informe con observación persistida y mensaje al tasador |
| RF-TAS-10 | "Ver expediente" como modal reutilizado |

### 3.1 Cobertura A — por identificador

`A` = el string aparece · `·` = no aparece

| RF-TAS | spec | Blueprint | operativo | Estado de la fila |
|---|:--:|:--:|:--:|---|
| RF-TAS-01 | A | · | · | hueco de citación (Blueprint) + contenido no escrito (operativo) |
| RF-TAS-02 | A | **A** | · | **bloqueada A-09** en operativo (`horas_restantes`) |
| RF-TAS-03 | A | · | · | hueco de citación (Blueprint) + **bloqueada A-09** en operativo |
| RF-TAS-04 | A | · | **A** | contenido no escrito en Blueprint |
| RF-TAS-05 | A | · | · | hueco de citación (Blueprint) + **bloqueada A-09** en operativo |
| RF-TAS-06 | A | · | **A** | hueco de citación (Blueprint) |
| RF-TAS-07 | A | **A** | · | hueco de citación (operativo) |
| RF-TAS-08 | A | · | · | contenido no escrito en ambas |
| RF-TAS-09 | A | · | · | contenido no escrito en ambas |
| RF-TAS-10 | A | · | · | hueco de citación (Blueprint) + contenido no escrito (operativo) |

**Cobertura A = 14/30 = 47 %** · spec 10/10 · Blueprint 2/10 · operativo 2/10

### 3.2 Cobertura B — por contenido

| RF-TAS | spec | Blueprint | operativo | Nota |
|---|:--:|:--:|:--:|---|
| RF-TAS-01 | B | B | · | chips en Blueprint §7.3; operativos son IF-02, no IF-03 |
| RF-TAS-02 | B | B | · | semáforo + horas en Blueprint; operativo requiere `horas_restantes` |
| RF-TAS-03 | B | B | · | ruta `coordinar/` en Blueprint; operativo requiere la tabla |
| RF-TAS-04 | B | · | B | excepción RN-59 en `diseno.md:287` |
| RF-TAS-05 | B | B | · | entradas/salidas en Blueprint; operativo requiere la tabla |
| RF-TAS-06 | B | B | B | sheet documental + `condicionPropiedadAplicable` §22 |
| RF-TAS-07 | B | B | B | hook + "Calcular Tasación" en `diseno.md` |
| RF-TAS-08 | B | · | · | sólo en el spec |
| RF-TAS-09 | B | · | · | sólo en el spec |
| RF-TAS-10 | B | B | · | "Ver expediente" en Blueprint |

**Cobertura B = 20/30 = 67 %** · spec 10/10 · Blueprint 7/10 · operativo 3/10

> ⚠ `RF-TAS-08` dio falso positivo en `schema-airtable.md` con el literal *"valores por
> defecto"*: ahí describe `lib/solicitudes.ts` degradando campos, no factores de
> homogeneización. Descartado. La cobertura B sin ese descarte habría sido 70 %.

### 3.3 Descomposición de las 16 celdas vacías (cobertura A)

| Causa | Celdas | % del total |
|---|:--:|:--:|
| **Hueco de citación** — el contenido existe, falta el identificador | **6** | 20 % |
| **Contenido no escrito**, sin bloqueo externo | **7** | 23 % |
| **Bloqueada por A-09** — `TX_CoordinacionVisita` / `horas_restantes` | **3** | 10 % |
| Bloqueada por A-10 | **0** | 0 % |
| Bloqueada por P-5 | **0** | 0 % |
| Bloqueada por CI-001 vía P-5 | **0** | 0 % |

Las 6 de citación: Blueprint × {01, 03, 05, 06, 10} y operativo × {07}.
Las 3 de A-09: operativo × {02, 03, 05}.

---

## 4. Cobertura marginal por desbloqueo

| Escenario | Cobertura A | Δ |
|---|:--:|:--:|
| **Hoy** | 47 % | — |
| Cae **A-09** | 57 % | **+10 pp** |
| Cae **A-10** | 47 % | **0 pp** |
| Cae **P-5** | 47 % | **0 pp** |
| Caen A-09 + A-10 + P-5 | 57 % | **+10 pp** |

**No hay sinergias entre bloqueos.** A-10 y P-5 no tocan ninguna celda de esta matriz; su
resolución conjunta con A-09 no añade nada sobre A-09 sola. La razón es la granularidad:
A-10 vive en el eje `SC` y P-5 en el dominio de un campo, y ninguno de los dos ejes es el de
esta matriz.

**Con todos los bloqueos externos caídos, la cobertura A llega a 57 %.** El 43 % restante
—13 celdas— no depende de ninguna decisión externa: 6 son citación y 7 son contenido que
nadie ha escrito.

Para cobertura B el efecto es equivalente: hoy 67 %, con A-09 caída 77 %, y A-10/P-5 en 0 pp.

---

## 5. Recomendación de arranque de Fase 4

**Los números no justifican esperar a ningún bloqueo externo.**

Esperar a que caigan A-09, A-10 y P-5 mueve la cobertura A de 47 % a 57 %. Diez puntos. El
grueso del hueco —43 puntos— es trabajo propio: citación y redacción. Diferir Fase 4 a la
espera de decisiones externas optimizaría la variable que menos pesa.

**Recomendación: arrancar Fase 4 ahora, con la matriz completa de 30 celdas y los huecos
declarados por causa.** Una matriz al 47 % con cada celda vacía etiquetada —`citación
pendiente`, `contenido no escrito`, `bloqueada A-09`— es un instrumento de gestión útil desde
el primer día: dice exactamente qué falta y de quién depende. Una matriz diferida seis semanas
para llegar al 57 % no lo es.

**Umbral mínimo: ninguno.** No existe un N de bloqueos que haya que esperar. La condición para
que Fase 4 tenga sentido no es que caigan bloqueos, sino que la matriz distinga las tres causas
de hueco. Si no las distingue, colapsa "esperando a Airtable" con "no lo hemos escrito" y deja
de servir para decidir.

---

## 6. Evaluación de un lote 6 de citación de identificadores

> Ejercicio de scoping autorizado. **No es diseño del lote ni decisión de ejecutarlo.**

### 6.1 Alcance estimado

| Documento | Citas a agregar (aprox.) | Naturaleza |
|---|:--:|---|
| Blueprint v2.10 | **5** | contenido ya escrito en §7.3; falta anclar el identificador |
| `diseno.md` | 1 | RF-TAS-07 junto a "Calcular Tasación" |
| `construccion.md` | 0–2 | sólo si se decide que los operativos deben cubrir IF-03 |
| Arquitectura v2.9 | 0 | fuera de las 3 columnas del DoD |

**Orden de magnitud: 6–8 citas.** No es un lote de redacción; es un lote de anclaje.

### 6.2 Reglas de citación propuestas

Tres opciones, con recomendación:

| Opción | Forma | Valoración |
|---|---|---|
| **Inline al primer uso** | `…los chips "Hoy" y "Por coordinar" (RF-TAS-01)…` | **Recomendada.** Coste mínimo, cero estructura nueva, el identificador queda junto al comportamiento que nombra. Es el patrón que el Blueprint ya usa para RF-TAS-02 y RF-TAS-07 |
| Tabla al inicio del documento | bloque "RF-TAS cubiertos por este documento" | Duplica información, envejece mal, y no ancla el identificador al párrafo |
| Pie de sección | lista al cierre de §7.3 | Intermedio; separa identificador de comportamiento |

La opción inline tiene además la propiedad de que **cobertura A y cobertura B convergen**: si
el identificador va junto al comportamiento, no pueden divergir en el futuro.

### 6.3 Costo relativo frente a los bloqueos externos

| Trabajo | Naturaleza | Depende de |
|---|---|---|
| **Lote 6 de citación** | 6–8 ediciones de una línea, dentro del repo, sin decisiones | nadie |
| A-09 | crear tabla + 11 campos + 3 campos + 2 plantillas en Airtable | sign-off DE + trabajo fuera del repo |
| A-10 | resolver 3 códigos para un rol, poblar `Z_EscenariosMake` | sign-off DE + decisión de numeración |
| P-5 | alinear dominio + decidir vocabulario de negocio | negocio + DE |

**El lote 6 es, con diferencia, el trabajo más barato y el único sin dependencia externa**, y
es el que más mueve la aguja: +20 pp de cobertura A contra +10 pp de A-09.

### 6.4 Tres escenarios de secuencia

**(a) Lote 6 precede a Fase 4.** Fase 4 arranca con cobertura A del 67 % en vez de 47 %.
Coste: diferir Fase 4 lo que tarde el lote 6 —bajo, es medio día de trabajo—. Riesgo: ninguno
relevante. Las 7 celdas de contenido no escrito siguen vacías igual.

**(b) Lote 6 y Fase 4 en paralelo.** La matriz se construye con huecos que el lote 6 va
cerrando. Ventaja: nada se difiere. Desventaja real: la matriz se escribe dos veces —una con
huecos y otra al cerrarlos— y durante la ventana intermedia el documento miente sobre sí
mismo, porque una celda "citación pendiente" y una "citada ayer" se ven igual hasta que alguien
regenera. Coordinación mayor que el ahorro.

**(c) Descartar lote 6 y redefinir la matriz por contenido.** Agregar a Fase 4 una nota
interpretativa que declare "aparecer" como "aparecer por contenido, según el criterio C-4
extendido a Fase 4". Sube la cobertura declarada de 47 % a 67 % sin tocar un solo documento.
**Coste oculto: la matriz deja de ser verificable por búsqueda.** Cada celda pasa a depender
del juicio de quien la evaluó, y nadie puede reauditarla sin releer los documentos completos.
Es exactamente el problema que la matriz existe para eliminar.

### 6.5 Recomendación

**Escenario (a): ejecutar el lote 6 antes de Fase 4.**

Fundamento: es el trabajo de menor coste y mayor rendimiento del backlog completo —+20 pp por
6–8 ediciones de una línea, sin depender de nadie—, y elimina la ambigüedad A/B en origen en
vez de gestionarla. El escenario (b) paga coordinación por un ahorro de horas. El escenario
(c) compra el número renunciando a la verificabilidad, que es lo único que hace útil a una
matriz de trazabilidad.

El lote 6 **no debe extenderse a escribir el contenido faltante** de RF-TAS-08 y RF-TAS-09:
eso es redacción, no anclaje, y merece su propia decisión de alcance.

---

## 7. VALIDATION.md — mismo ejercicio, más breve

`VALIDATION.md` recoge las validaciones que comprueban que el sync se aplicó correctamente.

| Grupo | Redactable hoy | Requiere instanciación |
|---|:--:|---|
| **Vocabulario** — `capturada` en cero, `"Enviar visita"` en cero, `"Calcular Tasación"` presente, `devuelta` sólo bajo nota DEPRECATED | ✅ **sí** | — |
| **Máquina de estados** — la secuencia oficial aparece íntegra en spec, Blueprint y Arquitectura | ✅ **sí** | — |
| **Integridad estructural** — tablas pandoc alineadas, cajas grid a 73, predecesores SUPERSEDED intactos | ✅ **sí** | — |
| **Marcas de dependencia** — `grep -rn "DEP-EXT:"` devuelve exactamente las marcas registradas | ✅ **sí** | — |
| **Trazabilidad RF-TAS** — cada RF-TAS en las 3 columnas | ⚠ parcial | depende del lote 6 y de A-09 |
| **Schema** — los 11 campos de `TX_CoordinacionVisita` existen con los FIELD_ID documentados | ❌ no | **A-09** · la tabla no existe |
| **Escenarios Make** — cada `SC` citado corresponde a un escenario real de `Z_EscenariosMake` | ❌ no | **A-10** · la tabla está vacía |
| **Dominio `tipo_propiedad`** — el valor de la solicitud cruza contra `D_TipoDocumento` | ❌ no | **P-5** · dominios incompatibles |

**Redactable hoy: 4 de 8 grupos = 50 %.** Los cuatro primeros son greps y validadores que ya
existen y se han ejecutado en cada lote; formalizarlos en `VALIDATION.md` es transcribir lo que
ya se corre, no inventar nada.

A diferencia de `TRAZABILIDAD.md`, aquí los bloqueos externos **sí pesan**: tres de los cuatro
grupos no redactables dependen de A-09, A-10 y P-5 respectivamente, uno cada uno. La razón es
que `VALIDATION.md` sí valida contra Airtable y Make, que es donde viven los bloqueos.

**Recomendación:** redactar hoy los cuatro grupos disponibles y dejar los otros cuatro como
secciones declaradas con su bloqueo, siguiendo la convención `DEP-EXT` ya establecida.

---

## 8. Resumen ejecutivo

| Métrica | Hoy | Tras A-09 | Tras A-10 | Tras P-5 |
|---|:--:|:--:|:--:|:--:|
| Cobertura A (identificador) | **47 %** | 57 % | 47 % | 47 % |
| Cobertura B (contenido) | **67 %** | 77 % | 67 % | 67 % |
| `VALIDATION.md` redactable | **50 %** | 63 % | 75 % | 88 % |

- **`TRAZABILIDAD.md` no está bloqueada por decisiones externas.** El 43 % de hueco que queda
  con todo desbloqueado es trabajo propio: 20 pp de citación y 23 pp de contenido sin escribir.
- **`VALIDATION.md` sí lo está**, en la mitad exacta de sus grupos, uno por cada bloqueo.
- **Recomendación combinada:** lote 6 de citación → Fase 4 con ambos documentos, declarando
  huecos por causa. No esperar a A-09, A-10 ni P-5 para arrancar.

---

## 9. Hallazgos detectados durante el pre-alcance

> RO-03: se listan, no se actúa sobre ellos.

**H-1 · `RF-TAS-08` y `RF-TAS-09` sólo existen en el spec.** Ningún otro documento describe
los valores por defecto parametrizados ni el rechazo del informe con observación persistida.
No es hueco de citación: es contenido que ningún lote escribió. Los lotes 4 y 5 no los
incluyeron en su alcance y nadie lo detectó, porque el criterio de aceptación era el
contenido listado en cada lote, no la cobertura de las diez RF-TAS.

**H-2 · La columna "documento operativo" puede ser inaplicable para RF-TAS de IF-03.**
`diseno.md` y `construccion.md` son documentos de **IF-02**. Exigir que RF-TAS-01 (chips de la
cola del tasador) aparezca en un operativo puede no tener destino natural: no hay documento
operativo de IF-03 en el repo. O se acepta `schema-airtable.md` como operativo genérico, o la
columna debería declararse `n/a` para las RF-TAS puramente de IF-03. **Afecta el denominador
de la matriz** y conviene resolverlo antes de construirla.

**H-3 · El falso positivo de `RF-TAS-08`** en `schema-airtable.md` muestra que la cobertura B
medida por grep de literales es frágil. Si Fase 4 automatiza la verificación de cobertura B,
necesita marcadores explícitos, no coincidencia de frases. Es un argumento adicional a favor
del lote 6: la cobertura A sí es automatizable sin ambigüedad.
