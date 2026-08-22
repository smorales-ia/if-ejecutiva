# Ambigüedades detectadas — Fase 1

Registro de todo lo que no puede resolverse con la evidencia del repositorio.
Ninguna de estas entradas se decide unilateralmente (§7 del prompt).

---

## A-01 · `VProperty_ADR_IF_Tasador_v3_v2.md` — fuente externa no versionada

**Estado** — TBD · registrado por decisión del usuario en Checkpoint #1.

§2 del spec lo cita como fuente de **todas** las decisiones consolidadas (C-1..C-3,
S-1..S-8, especificaciones UX §8) y de las mitigaciones R-1/R-2/R-3. No está en el repo.

**Tratamiento acordado.** Fuente externa congelada por §2 del spec. No bloquea el sync.
**No se marca SUPERSEDED** porque no existe aquí. La familia B queda vacía por diseño.

**Impacto en la DoD.** El criterio del prompt §6.2 ("cada RF-TAS debe aparecer al menos en:
spec, ADR marcado SUPERSEDED, Blueprint IF-03 y un documento operativo") se reduce a
**spec + Blueprint IF-03 + un documento operativo**. La columna ADR de `TRAZABILIDAD.md`
se rellena con `n/a · fuente externa (A-01)`.

**Riesgo residual.** Las decisiones S-6 (segundo intento de coordinación), §8.1 (grilla
densa de comparables), §8.2 (orden móvil del informe) y §8.4 (valores por defecto) se citan
en §2 por su identificador de ADR. Si alguien necesita el racional completo, no está en el
repositorio. Se propaga la cita tal cual, sin intentar reconstruir el racional.

---

## A-02 · `Imagenes_IF_Tasador_v3.docx` — insumo referencial ausente

**Estado** — TBD · mismo tratamiento que A-01.

Citado en §2 (línea 1576 y tabla de trazabilidad 1950) como origen de las siete pantallas
y sus layouts. Es referencial: §2 declara explícitamente que *"no se transcriben imágenes en
el cuerpo del texto: sólo se especifica el comportamiento que reflejan"*, de modo que el
comportamiento **sí** está capturado en el spec. Ausencia de impacto funcional.

---

## A-03 · `VProperty_Maquina_Estados.html` — fuente única declarada, no versionada

**Estado** — **CERRADA** por confirmación del usuario en Checkpoint #1.

§2.11 (línea 1800) la declara *"fuente única de la máquina de estados"*. No está en el repo.

**Resolución.** El usuario confirma que el archivo es autoconsistente con §2.11 del spec:
vocabulario `visitada`, sin `capturada`, `devuelta` preservada igual que en el spec.
**Sin acción en Fase 3.** Es fuente única *leída*, no editada. No se reconstruye ni se deriva
desde §2.11 (eso invertiría la jerarquía documental).

**Consecuencia para §6.3.** La verificación *"cualquier otro doc debe apuntar a ella, no
redefinir"* se ejecuta en un solo sentido: se comprueba que los docs del repo no redefinan
la máquina con vocabulario propio, contrastando contra **§2.11 del spec** como proxy validado.

---

## A-04 · Destino de v1.9.2 borrado del working tree — **CERRADA**

**Estado** — **cerrada en Checkpoint #2 · decisión del usuario: DEJARLO BORRADO.**

`docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md` figura como ` D` (borrado sin stage).
Permanece íntegro en HEAD (`03e8053`, 5001 líneas).

**Resolución.** No se restaura. La trazabilidad histórica queda confiada al historial git.

**Desviación consciente registrada.** La decisión se aparta de dos normas del prompt:

| Norma | Qué exigía | Estado |
|---|---|---|
| Regla de oro §1.3 · cero pérdida | Nada se borra; se marca SUPERSEDED con puntero al reemplazo | ⚠ desviación autorizada por el usuario |
| Convención §4.2 | *"crear la nueva `_v1_9_3.md` **manteniendo el anterior**"* + bloque `[SUPERSEDED]` en el header del anterior | ⚠ desviación autorizada por el usuario |

**Consecuencia asumida.** Tres citas de v1.9.3 apuntan a un archivo ausente del working tree:

- Línea 1568 — *"siguiendo el patrón de presentación de la §1 … del `…v1_9_2.md`"*
- Línea 1903 — §2.14 titulada *"Cambios a aplicar sobre `…v1_9_2.md`"*
- Línea 1948 — tabla de trazabilidad: *"Baseline técnico y patrón de presentación de RF"*

Quien necesite resolverlas debe usar:
`git show 03e8053:docs/_md/VProperty_Especificacion_Proyecto_v1_9_2.md`

**Acción en Fase 3.** Al producir v1.9.4 se agrega una nota al pie de la tabla §2.14
indicando que el baseline v1.9.2 vive únicamente en el historial git, con el comando de
recuperación. Es el mínimo que preserva la resolubilidad de las citas sin restaurar el archivo.

**Cadena de versionado resultante: v1.9.3 → v1.9.4** (v1.9.2 fuera del working tree).

---

## A-05 · Colisión de nombre en `tipo_propiedad` — **CERRADA**

**Estado** — ✅ **cerrada el 25-jul-2026** en el lote 3 (ii), con el registro §22 de
`docs/schema-airtable.md`: tres capas de nombre (nombre de datos · FIELD_ID · alias de código
único), **sin renombrar nada en Airtable**. Alias: `tipoPropiedad` y `tipoPropiedadNuevoUsado`
adoptados del código, que ya los usaba y ya eran inequívocos; `condicionPropiedadAplicable`
acuñado para `D_TipoDocumento.tipo_propiedad` (`fldIfdcjsr8KeNRCx`). El seguimiento del código
que aún referencia por nombre está en `docs/CODE_INCONSISTENCIES.md` · CI-001.

> ⚠ **Dos hechos del enunciado original resultaron falsos**, verificados vía MCP el
> 25-jul-2026 contra `app9G7lLkIV3CpeLa`:
> 1. La colisión en `TX_Solicitudes` **ya estaba resuelta** desde el 24-jul-2026: existe
>    `tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`), ver `schema-airtable.md` §21.4-a.
> 2. `D_TipoDocumento.tipo_propiedad` **ya existía** (`fldIfdcjsr8KeNRCx`). §2.12 del spec lo
>    declara como alta nueva y no lo es; además su dominio real está en femenino
>    (`nueva · usada · ambas`) contra el masculino que declara el spec. Eso **no** lo cierra
>    §22: es el punto abierto **P-5**, trabajo en Airtable, fuera del repositorio.

Enunciado original, conservado:

La Capa de Datos v2.6.4 §19.1 (línea 8484) ya advierte:

> `tipo_propiedad` nuevo/usado (singleSelect `nuevo/usado` — ⚠ colisiona en nombre con el
> `tipo_propiedad` Link→M_TiposPropiedad ya existente; resolver el nombre real antes de crear)

§2.12 del spec agrega **un tercer** `tipo_propiedad`: singleSelect `{nuevo, usado, ambos}`
en `D_TipoDocumento`. Son tres campos distintos con el mismo nombre en dos tablas:

| Tabla | Campo | Tipo | Dominio |
|---|---|---|---|
| `TX_Solicitudes` | `tipo_propiedad` (existente) | Link → `M_TiposPropiedad` | catálogo |
| `TX_Solicitudes` | `tipo_propiedad` (nuevo, §19.1) | singleSelect | `{nuevo, usado}` |
| `D_TipoDocumento` | `tipo_propiedad` (nuevo, §2.12) | singleSelect | `{nuevo, usado, ambos}` |

El de `D_TipoDocumento` vive en otra tabla, así que **no colisiona técnicamente**; pero el
riesgo de confusión al leer la documentación es alto, y RF-TAS-06 depende de comparar el
valor de la solicitud contra el de `D_TipoDocumento`, es decir, cruza dos de los tres.

**No se resuelve aquí.** Se documentan los tres en la Capa de Datos con nota de desambiguación
explícita, y se deja el nombre real de los campos de `TX_Solicitudes` como pendiente
preexistente (no lo introduce este sync).

---

## A-06 · `A_Eventos.visita_completada` frente al vocabulario nuevo — **CERRADA**

**Estado** — **cerrada en Checkpoint #3 (decisión D-C): se conserva el literal.**
Firma DE + INT. Motivo: es coherente con el estado destino `visitada` y cambiarlo rompería
consultas históricas. El registro del análisis se conserva abajo.

`Blueprint_v2_9.md:560` declara que IF-03 escribe `A_Eventos (visita_completada)`.
Con el botón renombrado a "Calcular Tasación" y la transición `asignada → visitada`,
no está definido en §2 si el `tipo_evento` conserva el literal `visita_completada`.

§2.11 sólo dice que SC06 *"audita en `A_Eventos`"*, sin fijar el literal.

**Propuesta (no ejecutada).** Conservar `visita_completada` — es coherente con el estado
destino `visitada` y cambiarlo rompería consultas históricas. Requiere firma DE + INT.

---

## A-07 · P-4 · poblado de `tipo_propiedad` para valores de fase

**Estado** — **fuera de alcance por §7 del prompt.** No se decide.

§2.12 asigna `ambos` a `Reproceso`, `Cliente tipo 2`, `Depto con gas` y `---` *"salvo
indicación distinta del negocio"*. §2.15 lo declara asunción del equipo con impacto bajo.

Se documenta como **asunción**, nunca como decisión firme. Se registra en la ficha de la
Capa de Datos y en `TRAZABILIDAD.md` con estado `asunción · pendiente validación negocio`.

---

## A-08 · P-3 · versión de Next.js

**Estado** — **fuera de alcance por §7 del prompt.** No se decide.

RT-01 y §1.8 fijan Next.js 14; §2.13 y §3.7 miden 16 en los repos reales. Este repositorio
(IF-02) corre **Next.js 16.2.6** según `CLAUDE.md`, lo que suma una tercera medición
concordante con la recomendación de §2.13.

Acción permitida: **agregar la nota de punto abierto** en los docs que fijan Next.js 14.
Acción prohibida: **cambiar RT-01**. Requiere sign-off de PM + Enterprise Architect + Frontend Lead.

---

## A-09 · **BLOQUEANTE** · `TX_CoordinacionVisita` no existe en Airtable

**Estado** — **abierta · bloquea el lote 3.** Elevada a bloqueante el 25-jul-2026, con el
mismo criterio aplicado a A-10 sobre el lote 1: *la resolución es trabajo fuera del repo y
ningún archivo se modifica hasta que exista la decisión.*

> Nota de forma: hasta el 25-jul-2026 esta ficha existía **sin encabezado**, arrastrada al
> final de A-10, de modo que su contenido se leía como parte de ella. Se le restituyó el
> encabezado y se la reubicó entre A-08 y A-10.

### Por qué bloquea el lote 3

El lote 3 escribe las altas de §2.12 en `docs/schema-airtable.md` y en la Capa de Datos.
`CLAUDE.md` obliga a **derivar los tipos TS desde `schema-airtable.md`** y a **preferir
FIELD_ID sobre nombre de campo**; y la regla innegociable del propio lote 3 es **jamás
inventar un TABLE_ID ni un FIELD_ID**.

La tabla `TX_CoordinacionVisita` **no existe en la base `app9G7lLkIV3CpeLa`**. Por lo tanto
no hay TABLE_ID ni un solo FIELD_ID que documentar para sus 11 campos, ni para los 3 campos
nuevos de `TX_Solicitudes` (`coordinacion_vigente`, `observacion_rechazo_tasador`,
`horas_restantes`), ni para las 2 plantillas de `C_Plantillas`. Escribir el lote 3 hoy
produciría una ficha de schema **sin identificadores**, que es justamente el insumo del que
se derivan los tipos de producción.

Es el mismo patrón que A-10: el nudo no se desata dentro del repositorio.

### Lo que hay que hacer fuera del repo

Crear `TX_CoordinacionVisita` en Airtable con los 11 campos de §2.12, más los 3 campos de
`TX_Solicitudes` y las 2 plantillas, y volver con los IDs reales. Requiere sign-off DE.
Es la misma clase de trabajo que poblar `Z_EscenariosMake` para A-10.

### Realizaciones que además hay que decidir al crearla

§2.12 especifica dos campos cuya realización en Airtable no es directa:

- `id` — "PK auto". Airtable no expone PK numérica editable; el equivalente es el `recordId`
  o un campo `autoNumber`.
- `intento_numero` — declarado `Number (formula)` con expresión
  `1 + COUNT(intentos previos del mismo solicitud_id)`. Airtable no permite en una fórmula
  contar registros hermanos de la misma tabla filtrados por un link sin un rollup intermedio
  en `TX_Solicitudes`.

Igualmente, la **constraint blanda de unicidad** `(solicitud_id, fecha_respuesta_truncada_al_minuto)`
no existe como primitiva en Airtable; se implementa por validación en el API Route o por
campo fórmula + vista de control.

**No se resuelve aquí** — es decisión de implementación (DE). Se documenta el contrato de
§2.12 tal cual y se anota la nota de realización pendiente.

**El lote 3 queda detenido.** No se modificó ningún archivo por su causa.

---

## A-10 · **BLOQUEANTE** · `SC05` tiene dos significados y `SC08` ya está ocupado

**Estado** — **abierta · bloquea el lote 1.** Detectada al ejecutar Fase 3, no en Fase 1.

El plan C-5 asumía que "SC05 → SC08" era un renombre mecánico y homogéneo. **No lo es.**
Al mapear las ocurrencias con su contexto aparecen tres colisiones encadenadas.

### Colisión 1 · `SC05` significa dos cosas distintas en el repo

| Significado | Ocurrencias | Dónde |
|---|---|---|
| **(A) Notificar al tasador por email al asignar** (Make → Gmail) | **34** | Blueprint (11) · `CLAUDE.md` (7) · `diseno.md` (6) · `schema-airtable.md` (4) · `construccion.md` (3) · `README.md` (2) · Arquitectura (1 · línea 3821) |
| **(B) Ejecutar cadena DAG de fórmulas → AT03** | **4** | Capa de Datos (5051, 5949, 6251) · Arquitectura (3186) |

**Total real: 38 ocurrencias, no 22.** La cifra de 22 del inventario de Fase 0 provino de
sumar conteos de `grep -c` que mezclaban SC02/SC04/SC05/SC15 en una sola métrica. Corregido.

### Colisión 2 · el renombre del spec sólo cubre el significado (B)

§2.11 (línea 1836 de v1.9.4) define:

> `SC08` | **Motor de cálculo** | `estado = visitada` | Ejecuta AT03 (DAG de ~15 cálculos); escribe `TX_Calculos`; transita a `calculada`

Eso es exactamente el significado **(B)**. El significado **(A)** —notificar al tasador—
no es SC08 en la numeración canónica: **es SC13**. Evidencia en el propio spec:

- §1.7 (línea 1343): *"**SC13** · Envío de notificaciones · … al tasador con la plantilla `email_asignacion_tasador`"*
- §1.6.3 se titula literalmente *"Correo de asignación al tasador (**SC13**)"*

Renombrar las 34 ocurrencias de (A) a SC08 las fusionaría con el motor de cálculo. **Sería
una corrupción del contrato**, no una sincronización.

### Colisión 3 · `SC08` ya existe en el repo con un tercer significado

| Documento | Línea | Qué dice |
|---|---|---|
| `Arquitectura_…v2_9.md` | 3189 | `SC08 validar rangos valor calculado · Airtable Formula + Automation · **AT04** · TX_Calculos insert` |
| `Capa_Datos_…v2_6_5.md` | 5961 | `Validación de … Make **SC08** · Airtable Formula + Automation` |

En el spec, esa función es **AT04** y no tiene escenario Make asociado (§2.11 la lista como
Airtable automation pura). Si SC05(B) pasa a SC08, la tabla de Arquitectura queda con **dos
filas SC08 consecutivas** (3186 y 3189) apuntando a AT03 y AT04 respectivamente.

### Colisión 4 · el repo ya usa `SC08` de forma internamente inconsistente

Dentro del mismo `Arquitectura_…v2_9.md`:

- Línea 3189 — `SC08 = validar rangos` (AT04)
- Línea 3838 — *"JUEVES 16:41 — **SC08** aplica las 4 fórmulas de la regla #47"* → eso es **AT03**, el motor
- Línea 3764 — *"Tasador hizo submission del F3. SC07 y **SC08** procesan"* en estado `visitada` → también **AT03**

Es decir: la narrativa del documento **ya usa SC08 con el significado del motor**, mientras
su propia tabla de referencia lo define como validación de rangos. **Inconsistencia
preexistente**, anterior a este sync y no introducida por él.

### Mapeo canónico que se desprende del spec

| Rol funcional | Numeración en el repo | Numeración canónica (spec v1.9.3) |
|---|---|---|
| Notificar al tasador por email al asignar | `SC05` (34 ocurrencias) | **`SC13`** (§1.7 · §1.6.3) |
| Ejecutar cadena DAG de fórmulas → AT03 | `SC05` (4 ocurrencias) | **`SC08`** (§2.11) |
| Validar rangos de valor calculado → AT04 | `SC08` (2 ocurrencias) | **`AT04`**, sin escenario Make (§2.11) |

### Por qué no se resuelve unilateralmente

La regla de oro §1.2 prohíbe renumerar identificadores históricos. Aquí **cualquier** camino
implica renumerar algo:

- Mandar SC05(A) → SC13 renumera 34 ocurrencias de un identificador histórico.
- Dejar SC05(A) como está deja el repo contradiciendo §1.7 del spec.
- Mandar SC05(B) → SC08 colisiona con el SC08 existente.

Además, `Z_EscenariosMake` (`tblYfmDoaq7Z3Vh6P`) está **vacía** según `schema-airtable.md:119`,
y §2.11 (línea 1854) encarga explícitamente al Data Engineer *"validar la numeración canónica
contra `Z_EscenariosMake` existente antes del próximo prompt v0.dev"*. **Esa validación no se
ha hecho** y es precisamente la que resolvería este nudo.

**El lote 1 queda detenido.** No se modificó ningún archivo.

### Colisión 5 · `SC03` también notifica al tasador (detectada en el lote 5)

Motor v2.6 usa `SC03` con rol "notificar al tasador" en L342, L578, L944, L1116. Impacta la
renumeración propuesta `SC05(A)×34 → SC13`: el resolutor de A-10 debe decidir explícitamente
si `SC03` se preserva, colapsa o renumera junto con `SC05(A)` y `SC13`. Detectado durante el
lote 5, no bloqueaba el alcance del lote.

Consecuencia sobre el mapeo canónico: la tabla de arriba asume **un** identificador por rol.
Con `SC03` en escena, el rol "notificar al tasador" tiene **tres** códigos vivos en el repo
(`SC05`, `SC13` y `SC03`), repartidos en documentos distintos. La superficie de A-10 es mayor
que las 38 ocurrencias contabilizadas: el Motor de Cálculo no entró en aquel recuento.

---

## A-11 · Leyenda de estados del Motor v2.6 desalineada con §2.11

**Estado** — abierta · **no bloqueante** · impacto bajo · detectada en el lote 5.

La sección *State machine de TX_Solicitudes* del Motor de Cálculo v2.6 (L371) lista como
estados: `requiere_atencion`, `revision` y `devuelta`. Dos problemas frente a la máquina
oficial de §2.11 del spec v1.9.3:

- **`revision` no existe** en la máquina oficial. No aparece en el enum de `TX_Solicitudes`
  ni en ningún otro documento canónico.
- **Faltan `pendiente_final` y `cancelada`**, que sí son estados oficiales.

`devuelta` sí figura legítimamente, ya marcado DEPRECATED en el changelog del propio Motor
durante el lote 5.

**Impacto bajo:** es texto descriptivo, no ejecutable. Ninguna automatización lee esta
leyenda; AT01–AT10 operan sobre el enum real de Airtable. El riesgo es de lectura humana —
alguien que tome la leyenda como fuente y busque un estado `revision` que no existe.

### Nota de género — por qué esto no es una ambigüedad estricta

A-09, A-10 y P-5 son **decisiones pendientes de resolutor externo** (EA, negocio, Data
Engineer). **A-11 no lo es**: la solución es clara —alinear la leyenda L371 del Motor v2.6
con la máquina de estados oficial de §2.11 del spec—. Se registra aquí por **coordinación
operativa**: su ejecución se hará en el mismo bump del Motor que incorpore la renumeración
de escenarios (A-10), para no abrir el documento dos veces. **No es una pregunta abierta; es
una tarea agrupada.**

Quien retome A-11 no debe buscar una decisión de negocio que no existe: debe ejecutar la
corrección cuando A-10 abra el Motor.

### Por qué no entró a `CODE_INCONSISTENCIES.md`

Ese registro está declarado para divergencias entre documentos canónicos y **código de
producción**, y exige Dueño y Fecha objetivo por su regla 1. A-11 es doc-contra-doc y no
tiene dueño asignable. Ver la nota de decisión pospuesta al pie de `CODE_INCONSISTENCIES.md`.

---

# Ambigüedades del diseño IF-Tasador v4 (13-ago-2026)

Las seis entradas siguientes salieron de contrastar §2 del spec contra
`docs/_md/Imagenes_IF_Tasador_v4.pdf`, que desde v1.9.9 es la fuente de verdad visual de
IF-03. Todas cumplen el mismo criterio que las anteriores: **el diseño muestra algo que no
se puede especificar sin una decisión de negocio**, de modo que el RF correspondiente se
emitió marcado como pendiente en vez de resolverse por criterio propio.

Las divergencias que **sí** tienen resolución evidente —donde basta con que el documento se
alinee con el diseño— no están acá: se registraron como CI-013 a CI-021 en
`docs/CODE_INCONSISTENCIES.md`.

---

## A-12 · Composición del chip "Hoy" de la cola del tasador

**Estado** — abierta · **bloquea RF-TAS-01** · impacto alto.

El diseño v4 (p. 17, punto 1.2) pide que *"el Tab Hoy debe mostrar al tasador lo que debe
hacer en dicho día"*. No dice qué entra en esa definición.

§2.1 lo definía hasta v1.9.8 como *"solicitudes cuya `fecha_asignacion` esté dentro de las
últimas 24 horas"*, que **no es** la agenda del día: una solicitud asignada ayer a las 18:00
aparece hoy sin que haya nada que hacer con ella, y una visita agendada para hoy sobre una
solicitud asignada la semana pasada no aparece.

**Candidatos que el negocio debe arbitrar**, no excluyentes entre sí:

- Visitas cuya `fecha_planificada_visita` cae hoy.
- Coordinaciones cuyo plazo de 4 h (etapa 2 de §5.2.4 · RN-53) vence hoy.
- Informes cuyo plazo de envío (etapa 5) vence hoy.

**No se decide aquí.** Elegir el conjunto es definir qué significa "la jornada del tasador",
que es una afirmación sobre la operación y no sobre la interfaz. Hasta que se cierre, el chip
no se libera a producción (RF-TAS-01).

---

## A-13 · Origen de los comparables si la sección D pasa a sólo lectura

**Estado** — abierta · **bloquea RF-12 y §2.8** · impacto alto.

El diseño v4 (p. 23, punto 6.1) anota sobre la categoría D.Comparables: *"esta categoría debe
ser cambiado su diseño, por sólo mostrar datos, antes leídos"*.

Eso contradice el resto de §2.8, que especifica una grilla de captura con botón "Agregar
comparable", eliminación por fila y validación de mínimo 3 antes de habilitar el cálculo
(RF-12). Si el tasador deja de capturarlos, **alguien tiene que proveerlos** y el diseño no
dice quién:

| Origen posible | Consecuencia |
|---|---|
| Extracción documental (§4) | Exige que los comparables lleguen en algún documento cargado; hoy `D_TipoDocumentoAtributo` no los contempla |
| Catálogo de ofertas | Exige una fuente de ofertas de mercado que el sistema no tiene |
| Motor de cálculo | Invertiría la dependencia: hoy los comparables **alimentan** el cálculo, no salen de él |

**No se resuelve aquí.** Tampoco es sólo una decisión de UI: cambia de dónde viene el insumo
principal del método comparativo. Mientras siga abierta, §2.8 conserva la captura manual y
RF-12 su validación, con la nota de que ambas quedan condicionadas.

---

## A-14 · Tabla de configuración donde viven los defaults constructivos — **CERRADA**

**Estado** — **cerrada** el 22-ago-2026 · reducida el 21-ago-2026 · impacto medio.
**Ya no bloquea el subconjunto constructivo de RF-TAS-08.**

El diseño v4 (p. 24, punto 13) adjunta una tabla de *características constructivas
principales* —materialidad, calidad y estado de estructura soportante, divisiones interiores,
entrepisos, cubierta, revestimientos, cierros, obras complementarias, aire acondicionado,
calefacción, clóset mural, muebles de cocina, sanitarios, grifería, puerta principal,
ventanas y terminaciones por recinto— y pide que *"estos valores se deben mostrar por defecto,
donde corresponda"*.

RF-TAS-08 prohíbe hardcodear valores por defecto en el frontend y exige que vivan en la capa
de configuración expuesta por API Route. **Ninguna tabla actual los alberga**:
`C_VariablesCliente` guarda variables por cliente y la tabla de factores guarda coeficientes
de homogeneización; estos son defaults de dominio constructivo, que no dependen del cliente.

**No se resuelve aquí.** Crear una tabla nueva en Airtable requiere aprobación explícita, y
decidir si los defaults son globales, por tipo de propiedad o por comuna es una definición de
negocio. Hasta cerrarla, el subconjunto constructivo de RF-TAS-08 no se implementa.

> **Enmienda del 21-ago-2026 — REDUCIDA, no cerrada.** La premisa *"ninguna tabla actual los
> alberga"* sigue siendo cierta y era, además, el diagnóstico correcto del schema. Pero escondía
> una pregunta mal planteada: A-14 preguntaba **dónde viven** los defaults dando por supuesto que
> **no existían**. Existen. Llevan años en producción, fuera del repositorio, en la hoja de
> antecedentes de la plantilla operativa `Formato Informe VProperty Enero2026.xlsm`, y el cliente
> los describe explícitamente en el audio `p8`: *"esa parte siempre el tasador la recibe completa…
> nunca lo mandamos en blanco"*.
>
> Quedan **especificados valor por valor en spec §2.8.1 (RF-TAS-23)**, con su celda de origen y —lo
> que el diseño v4 no decía— con la regla de ramificación que los gobierna: no son constantes,
> dependen del tipo de propiedad `[Excel: FICHA SOLIC!K35]` y del estado de uso
> `[Excel: FICHA SOLIC!K36]`.
>
> **Lo que sigue abierto** es sólo el domicilio dentro del sistema, que es decisión de arquitectura
> de datos y de aprobación de schema, no de elicitación. Se renumera como **A-27** y esta ficha
> deja de bloquear la construcción: P7-TAS construye la sección E contra los campos y catálogos de
> §2.8.1, y sólo la **precarga** espera a A-27.
>
> **La lección, para que la próxima no cueste una semana:** antes de declarar que un dato de
> negocio no existe, revisar los artefactos operativos con que el cliente trabaja a diario. El
> schema dice qué guarda el sistema, no qué sabe el negocio.

> **Cierre del 22-ago-2026.** **A-27 se cerró** —los defaults se particionan por tipo de
> propiedad × estado de uso— y con ella se agota la mitad que esta ficha había derivado. **A-14
> queda CERRADA en ambas mitades**: los valores están en spec §2.8.1 y su domicilio tiene clave
> decidida. Lo que resta es trabajo de schema con su propia compuerta de aprobación, no
> ambigüedad.

---

## A-15 · Si el rechazo del informe emite un aviso al visador

**Estado** — abierta · **afecta a RF-TAS-09** · impacto medio.

Contradicción literal entre las dos fuentes:

| Fuente | Qué dice |
|---|---|
| Diseño v4, p. 28, punto 1 | *"guarda la observación del rechazo **y le avisa que se lo hará saber al visador**"* |
| §2.10 y RF-TAS-09 | *"**no** cambia el estado ni notifica in-app al visador"*; el tasador debe comunicarse por el canal habitual |

Las dos no pueden ser ciertas a la vez. O bien el sistema emite un aviso —y entonces hay que
decidir su canal, su plantilla y si genera evento en `A_Eventos`—, o bien el mensaje que hoy
ve el tasador **le promete algo que el sistema no hace**, que es el modo de fallo peor de los
dos: el tasador se queda esperando una gestión que nadie ejecuta.

**No se resuelve aquí.** El texto del diálogo es consecuencia de la decisión, no al revés.

---

## A-16 · Mínimos de fotos: fijos del diseño o dinámicos según lo declarado

**Estado** — abierta · **afecta a RF-TAS-14** · impacto medio.

§2.6 declara que los mínimos de las categorías de fotos están *"ligados a los dormitorios,
baños y estacionamientos declarados en la sección Datos de la propiedad"*. El diseño v4
(p. 20) muestra Habitaciones 0/2, Baños 0/2 y Estacionamientos 0/1.

No es determinable desde el diseño si esas cifras son **los valores de la propiedad de
ejemplo** —un departamento de 2 dormitorios, 2 baños y 1 estacionamiento, que es exactamente
lo que muestra la cabecera— o **mínimos fijos** que sustituyen la regla dinámica.

La diferencia es operativa: con mínimos fijos, una casa de 5 dormitorios se daría por completa
con 2 fotos de habitaciones.

**Lectura del equipo, no decisión.** La coincidencia con los datos de la propiedad de ejemplo
sugiere que la regla dinámica sigue vigente y que el diseño simplemente la está mostrando en
acción. Se registra igualmente porque confirmarlo es barato y equivocarse degrada la evidencia
en terreno.

---

## A-17 · Catálogo de motivos de contacto no logrado: paramétrico o fijo — **CERRADA**

**Estado** — **cerrada** el 21-ago-2026 · **afecta a RF-TAS-12** · impacto bajo.

> **Cierre formal (21-ago-2026).** A-21 ya la daba por cerrada —*"A-17 preguntaba dónde vive el
> catálogo de motivos y se cerró: `singleSelect`, servido desde el schema"*— pero el encabezado de
> esta ficha y el §0.4-bis de ambos planes seguían listándola abierta. El residuo se limpia acá.
> **Resolución:** `TX_CoordinacionVisita.motivo` es un **`singleSelect`** cuyo dominio vive en el
> schema y la UI lee desde el API, nunca desde un enum del cliente (spec §2.12). Si el negocio lo
> quiere paramétrico más adelante, migra a Link sin tocar la UI, que es la propiedad que esta
> ambigüedad existía para preservar.
> **Nota:** el catálogo pasó de cuatro a **seis valores** en spec v1.9.13 (§2.3 · §2.12 ·
> RF-TAS-12). Eso **no reabre** A-17: cambia el contenido del dominio, no dónde vive. La
> composición de los seis valores se ratifica por **A-25**, que es una pregunta distinta.

El diseño v4 (p. 19) muestra el desplegable de Motivo con cuatro valores: `Teléfono no
contesta`, `Teléfono equivocado`, `Cliente rechaza visita`, `Otro`. §5.2.4 (etapa 3) los
menciona como *"y demás motivos del catálogo"*, sin declarar dónde vive ese catálogo.

Si es paramétrico en Airtable, agregar un motivo es alta sin deploy (RN-31) y `motivo` debe
ser un enlace o un singleSelect mantenido; si es fijo, vive en el enum de
`TX_CoordinacionVisita.motivo` y cambiarlo exige tocar el schema.

**Impacto bajo** —los cuatro valores cubren el caso operativo conocido— pero determina el tipo
del campo en §2.12, así que conviene cerrarlo antes de crear la tabla, no después.

---

## A-18 · **BLOQUEANTE** · Ninguna tabla de configuración puede servir hoy un factor de homogeneización

**Estado** — abierta · **bloquea RF-TAS-08 y `GET /api/tasaciones/config/defaults`** · impacto alto.
**Dueños: Héctor y Óscar** (decisión de negocio, no de esquema).

RF-TAS-08 exige que los factores de homogeneización (`factor_sup`, `factor_edad`,
`factor_distancia`) se precarguen desde la capa de configuración vía API Route, y prohíbe
hardcodearlos *"ni siquiera de forma transitoria"*. Su criterio de aceptación es que **un cambio en
la configuración se refleje en la próxima carga sin deploy**.

Las tres tablas candidatas se leyeron contra la base el 17-ago-2026 (P2-TAS). **Ninguna puede
servir un valor por defecto hoy:**

| Tabla | Filas | Veredicto |
|---|---|---|
| `C_FactoresHomogeneizacion` (`tblep24N9gPMrDPIN`) | 15 | Es la **estructuralmente correcta** —única con `tipo_factor`, rangos y scoping por `tipo_propiedad`— pero **`valor_referencia` está vacío en las 15**. 10 filas (prefijo `FH-`) son cáscaras sin ningún campo poblado salvo `nombre` y `activo`; las otras 5 (prefijo `FH_`) sólo traen `valor_min`/`valor_max`, que son **rangos de validación, no valores por defecto** |
| `C_Factores` (`tblNHze3ZZYJblJ7S`) | 27 | Poblada y sana, pero **es otra cosa**: son los coeficientes del motor de valoración (`Cap_Rate` 0.045 · `Remate` en nueve tramos · `Seguro` · `Garantia` · `multiplicador` · `divisor`). **Cero filas de homogeneización**: ninguna es `Superficie`, `Edad`, `Antiguedad` ni `Distancia` |
| `C_VariablesCliente` (`tblgrY8j4ugFzS7v9`) | 1 | `Vars_METLIFE_default`, con sólo `clave` y `cliente` poblados y `valor` vacío. Es además una tabla clave-valor genérica, sin columnas de factores. **Es la que nombran la spec §2.8 y el plan §3.1** |

**Las cuatro preguntas que hay que responder:**

1. **¿Quién decide el valor por defecto de cada factor, y cuál es?** Hoy no existe en ninguna parte.
   Sin él no hay precarga posible, con o sin ruta.
2. **`Edad` o `Antiguedad`.** El `singleSelect` de `C_FactoresHomogeneizacion.tipo_factor` ofrece
   **las dos como opciones distintas**, y las filas pobladas usan `Antiguedad`. RF-TAS-08 habla de
   `factor_edad`. Mapear una a otra es una decisión, no una lectura.
3. **Las 10 cáscaras `FH-`: ¿se completan o se borran?** Conviven con 5 filas `FH_` de otra
   generación. Dos convenciones de nombre y dos grados de completitud en la misma tabla.
4. **¿`C_FactoresHomogeneizacion` es la canónica, o hay que consolidar con `C_Factores`?** La
   segunda tiene vigencia temporal (`vigente_desde`/`vigente_hasta`) y scoping por cliente, tipo de
   informe y tipo de propiedad; la primera no. Si los factores de homogeneización deben variar por
   cliente o en el tiempo, la canónica es la segunda y hay que poblarla.

**No se resuelve aquí, y no se puede rodear.** Construir la ruta contra la tabla actual devolvería
`valorReferencia: null` para los tres factores: la UI no precargaría nada y el criterio de
aceptación —*"un cambio se refleja sin deploy"*— sería inverificable, porque no hay dato que
cambiar. Y suplirlo con constantes en el frontend es exactamente lo que RF-TAS-08 prohíbe.

**Consecuencia sobre el plan:** `GET /api/tasaciones/config/defaults` **no se construye en
P2-TAS**. El set de rutas de la tanda baja de 13 filas a **12** (de 12 archivos `route.ts` a 11).
Se retoma cuando A-18 cierre, previsiblemente en P7-TAS, que es la consumidora.

**Relación con A-14.** A-14 es la misma pregunta para los defaults **constructivos** (sección E del
formulario) y también está abierta. **Son distintas y conviene no fundirlas**: A-14 no tiene tabla
destino en absoluto, mientras que A-18 sí la tiene y lo que le falta son datos. Pero si el negocio
decide crear una tabla de defaults, la respuesta a las dos puede salir del mismo movimiento.

**Registro asociado:** **CI-022** documenta las dos tablas sin documentar que salieron de esta
verificación, y se cierra apuntando a esta ambigüedad como resolución.

> **Enmienda del 22-ago-2026 — ESTRECHADA por la respuesta de Héctor a A-28. Sigue abierta y
> sigue bloqueando.**
>
> Héctor ratificó que los tres factores —superficie, edad y distancia— se usan en la práctica, de
> modo que **A-28 cierra** y con ella la duda estructural: ya no hay riesgo de construir contra un
> modelo equivocado. **Pero eso no es lo que A-18 preguntaba.** Ratificar *qué* factores no dice
> *cuánto* vale cada uno, y `C_FactoresHomogeneizacion.valor_referencia` **sigue vacío en las 15
> filas**.
>
> Estado de las cuatro preguntas de arriba:
>
> | # | Pregunta | Estado |
> |---|---|---|
> | **1** | ¿Cuál es el valor por defecto de cada factor? | **ABIERTA · la única bloqueante.** Va a la próxima consulta a Héctor |
> | 2 | `Edad` o `Antiguedad` en el `singleSelect` | Abierta · **deuda de schema**, no bloqueante |
> | 3 | Las 10 cáscaras `FH-` frente a las 5 filas `FH_` | Abierta · **deuda de schema**, no bloqueante |
> | 4 | ¿`C_FactoresHomogeneizacion` es la canónica? | Abierta · **deuda de schema**, no bloqueante |
>
> Las tres últimas son saneamiento de una tabla y se resuelven en la tanda de schema que la
> pueble; ninguna impide construir. La primera sí: `GET /api/tasaciones/config/defaults` se
> puede escribir, pero hoy devolvería `null` para los tres factores y su criterio de aceptación
> —*"un cambio en la configuración se refleja en la próxima carga sin deploy"*— seguiría siendo
> **inverificable, porque no hay dato que cambiar**.
>
> **Consecuencia sobre el plan, sin cambios:** la ruta sigue sin construirse en P2-TAS. Lo que sí
> cambia es que el bloqueo dejó de ser una elicitación de método y pasó a ser **una sola cifra
> por factor**.


---

## A-19 · Pantalla 5 · anotación perdida entre puntos 10 y 12

**Estado** — abierta · **impacto indeterminado — por definición** · dueño: **Héctor**.

En `docs/_md/Imagenes_IF_Tasador_v4.pdf` **p. 23**, la numeración de las anotaciones de
Pantalla 5 salta de **10** a **12**. **El punto 11 no existe en el archivo entregado.**

No es una numeración caprichosa: en el layout del PDF hay un **hueco reservado de tres
líneas vacías** entre el final del punto 10 (`y ≈ 480`) y el comienzo del punto 12
(`y ≈ 559`), con el mismo patrón de espaciado que separa a los demás puntos de su imagen
adjunta. Los puntos 6 y 13 usan exactamente ese patrón —texto, hueco, captura— y en ambos
casos el hueco contiene una imagen. **En el punto 11 el hueco está vacío**: no hay texto ni
imagen embebida (`get_images` devuelve una sola imagen en la página, y es la del punto 6).

**Qué significa.** Lo más probable es que el punto 11 fuera una anotación con captura que se
perdió al exportar el documento a PDF, o que Héctor la borrara dejando el espacio. No es
determinable desde el archivo.

**Por qué no se puede rodear.** Los puntos 9, 10 y 12 que lo rodean son los tres eslabones
de la misma cadena —habilitación del botón "Calcular Tasación", validación de faltantes al
presionarlo, y ejecución del escenario que cambia el estado a `visitada`—. Un punto 11
entre ellos cae justo en el hueco funcional entre *validar* y *ejecutar*, que es donde
vivirían una confirmación previa, un resumen de lo que se va a calcular, o el manejo del
caso "faltan comparables". Inventar cuál de esas era, o darla por inexistente, son las dos
formas de equivocarse.

**Lo que hay que hacer:** pedirle a Héctor el punto 11 de Pantalla 5. Es una pregunta de una
línea y no admite sustituto documental.

**Mientras siga abierta.** No bloquea a P7-TAS: los puntos 7 a 10 y 12 son autosuficientes y
se construyen. Lo que **no** se hace es declarar cerrada la revisión de Pantalla 5 ni marcar
sus RF (RF-TAS-16, RF-TAS-18, RF-TAS-07) como "alineados con el diseño v4 en su totalidad",
porque hay una anotación del cliente que nadie leyó.

**Numeración.** Se asigna **A-19** y no A-18: **A-18 ya existe** y está viva (bloqueante de
homogeneización, dueños Héctor y Óscar). Decisión de Sergio, 19-ago-2026.

**Observación relacionada, que no es esta ambigüedad.** Pantalla 5 tampoco tiene texto para
los puntos **1 a 5**, y Pantalla 7 no lo tiene para el punto **1**. Son un fenómeno distinto
y no se registran como ambigüedad: esos números caen en páginas que sólo contienen las
capturas "Parte 1" y "Parte 2" de la pantalla, sin hueco reservado en el layout, de modo que
lo más razonable es que Héctor numerara las capturas y no anotaciones. El punto 11 es el
único caso con **hueco vacío a mitad de página entre dos puntos con texto**.

---

## A-20 · La devolución a ejecutiva, ¿lleva fecha de visita en el correo?

**Estado** — abierta · **afecta a RF-TAS-13** · impacto bajo · **propuesta de registro,
pendiente de confirmación de Sergio**.

Contradicción entre el texto y la imagen del **mismo** diseño v4:

| Fuente | Qué dice |
|---|---|
| Diseño v4, p. 19, punto 3 (texto) | *"CUANDO DEVUELVE A EJECUTIVA, SE DEBE ENVIAR EMAIL CON MOTIVO Y DETALLE DE QUE NO SE PUDO CONTACTAR O COORDINAR VISITA, **CON LA FECHA DE LA VISITA** Y LA NOTA QUE HAYA ESCRITO"* |
| Diseño v4, p. 19, imágenes (`p19_1.png`, `p19_2.png`) | La rama *No pude contactar* despliega **sólo** Motivo y Detalle. **No hay campo de fecha ni de nota** en esa rama: son de la rama *Contacto exitoso* (`p19_3.png`) |
| §2.3 · RF-TAS-13 | *"Al devolver a la ejecutiva, envía un correo con el motivo del catálogo y el detalle escrito"* — sin fecha |

Si el tasador no pudo contactar a nadie, **no hay fecha de visita que informar**: es
precisamente lo que no consiguió. La lectura más plausible es que el punto 3 se redactó
copiando el punto 2 y arrastró "CON LA FECHA DE LA VISITA Y LA NOTA" sin depurarlo.

**No se resuelve aquí** porque la alternativa no es absurda: podría querer decir *la fecha
que estaba planificada y ahora se cae*, dato que la ejecutiva sí tiene motivo para ver en el
correo. Eso cambia el contenido de la plantilla `email_coordinacion_rechazada` y añade un
campo a su payload.

**Impacto bajo y acotado**: afecta al cuerpo de una plantilla de correo, no al modelo de
datos ni a la UI. Se puede construir P4-TAS con la lectura conservadora (motivo + detalle,
sin fecha, que es lo que la UI captura) y ajustar la plantilla después sin retrabajo.

**Origen.** Paso 4 de la ingesta de anotaciones de Héctor sobre el diseño v4 (19-ago-2026).
Se registra en vez de decidirse, por §7 del prompt de sync.

**Decisión de Sergio, 19-ago-2026: la ambigüedad se mantiene abierta.** No se retira.

**Lectura conservadora aplicada en P4-TAS: correo de devolución = solo motivo + detalle.
Pendiente confirmación de Héctor sobre inclusión de fecha de visita y nota.**

---

## A-21 · `motivo` de coordinación y `estado_contacto` describen el mismo dominio en dos tablas

**Estado** — abierta · **afecta a RF-TAS-12** · impacto medio · dueño: **Héctor**.

Al preparar la creación de `TX_CoordinacionVisita` (P4-TAS · 19-ago-2026) se levantó
`TX_ContactosVisita` y apareció un campo que nadie había cruzado con el catálogo de motivos:

| Tabla · campo | Valores reales en la base |
|---|---|
| `TX_ContactosVisita.estado_contacto` (`fldMerAz4OCNhwn4X`, singleSelect) | `valido` · `no_contesta` · `telefono_erroneo` |
| `TX_CoordinacionVisita.motivo` (por crear · RF-TAS-12) | `Teléfono no contesta` · `Teléfono equivocado` · `Cliente rechaza visita` · `Otro` |

**Dos de los cuatro motivos ya existen como estados de contacto**, con el mismo significado y otra
convención de escritura: `no_contesta` ≡ *Teléfono no contesta*, `telefono_erroneo` ≡ *Teléfono
equivocado*.

**Por qué importa, y no es sólo estética.** El tasador, al devolver a ejecutiva, va a declarar un
motivo que es **una afirmación sobre un contacto concreto** —el de prioridad 1 al que llamó—. Ese
contacto tiene su propio campo para exactamente eso. Con las dos cosas separadas caben dos
escenarios malos: que `estado_contacto` quede desactualizado mientras `motivo` dice la verdad, de
modo que la ejecutiva corrige un teléfono que la base sigue dando por `valido`; o que alguien
sincronice los dos a mano y el par se desalinee en la primera excepción.

**Las tres salidas posibles**, todas legítimas y ninguna decidible desde el repositorio:

1. **Se dejan separados** y se acepta la duplicación. `motivo` describe el intento de coordinación,
   `estado_contacto` describe el contacto. Es defendible: son entidades distintas y un intento
   fallido no siempre invalida el teléfono.
2. **`motivo` se deriva de `estado_contacto`** y el catálogo de RF-TAS-12 se reduce a los valores
   que no son sobre el teléfono (`Cliente rechaza visita`, `Otro`).
3. **Se unifican** en un catálogo único, y el handler de coordinación escribe los dos campos en la
   misma operación.

**Impacto medio.** No bloquea la creación de la tabla: `motivo` se crea con los cuatro valores del
diseño (decisión de Sergio del 19-ago-2026, A-17), y cualquiera de las tres salidas se puede
aplicar después sin migrar datos, porque al cerrarse esta ambigüedad no habrá filas históricas.
**Cerrarla antes de que P4-TAS entre a producción es gratis; después, no.**

**Relación con A-17.** A-17 preguntaba **dónde vive** el catálogo de motivos y se cerró:
`singleSelect`, servido desde el schema. A-21 pregunta **si ese catálogo debería existir**, dado que
la mitad ya existe en otra tabla. Son distintas y la segunda no invalida la primera.

**Origen.** Bloque 1 de P4-TAS (19-ago-2026), al levantar el patrón de tabla hija de
`TX_ContactosVisita` para replicarlo. Registrada por instrucción de Sergio; **no se toca nada de
`TX_ContactosVisita` en esta tanda.**


---

> **Tanda del 21-ago-2026 — audios del cliente + plantilla operativa.** Las entradas que siguen
> (A-22 a A-34) nacen de la misma revisión: la segunda tanda de audios de `docs/_md/audios/`
> (`p1`–`p8`, `r21`–`r23`, `revision 1`) contrastada contra la plantilla vigente
> `Formato Informe VProperty Enero2026.xlsm`. La radiografía del libro está en
> `docs/_notas/radiografia-excel-informe.md` y las citas usan el formato `[Excel: hoja!celda]`.
>
> Las marcadas **`[fuera-de-ámbito-actual]`** se registran para no perderlas, pero **no se
> trabajan en esta ronda** (decisión de Sergio, 21-ago-2026): el ámbito era Control de SLA + UI
> Tasador, y esas cuatro pertenecen al alta de IF-02 y a funcionalidad post-entrega.

---

## A-22 · Umbral del recordatorio automático de coordinación al tasador — **CERRADA**

**Estado** — **cerrada** el 22-ago-2026 por respuesta de Héctor · **afecta a spec §5.2.8 y a
AT08** · impacto medio. **Dueño: Héctor** (decisión de negocio). Registrada como **D-17** en
spec §15, ahora cerrada.

> ⚠ **No confundir con la `A-22` que citan CI-045 y CI-048.** Ese identificador se usó en el
> frente A+B para una decisión distinta —dropear la cota de 4 h de la *pertenencia* del chip
> "Por coordinar"— y quedó **re-etiquetado como A-36** el 22-ago-2026. Las dos giran alrededor
> de "4 h en coordinación", que es exactamente lo que las hacía fáciles de confundir. Precedente
> del mismo problema: **A-10** (colisión SC05/SC08).

> **RESOLUCIÓN — 4 horas hábiles, y el instante ya existía.**
>
> Héctor responde: **4 horas** sin coordinar → aviso automático al tasador. La cifra deja de ser
> un dato sin ratificar y pasa a **constante de negocio**.
>
> **El hallazgo que la respuesta destapa es más importante que la cifra.** 4 h **es** el SLA
> ideal de la etapa 2 (§5.2.4), y el motor ya materializa ese instante como
> **`sla_etapa_alerta_ts`** (`fldLfFftNm0Kvvu08`) — *"el instante de pared en que la etapa
> vigente alcanza su SLA ideal"*. De modo que la respuesta **no agrega un umbral nuevo:
> confirma el que ya estaba**, y el recordatorio no necesita campo, configuración ni cómputo
> propio. Se dispara en el mismo instante en que el semáforo de e2 pasa a ámbar.
>
> La secuencia queda ordenada y con dos destinatarios distintos:
>
> | Momento | Qué ocurre | A quién |
> |---|---|---|
> | **4 h hábiles** | e2 pasa a ámbar · **recordatorio** | Tasador (ejecutor) |
> | **6 h hábiles** | e2 pasa a rojo · **escalada** | Responsable de área |
>
> El plan de IF-02 v1.13 difería la creación del campo del umbral *"hasta saber si es un número
> por etapa, uno global o uno por cliente"*. La respuesta muestra que **nunca hizo falta el
> campo**: v1.14 lo declara así y cierra el diferimiento sin crear nada.
>
> **Pendiente menor, no bloqueante.** Héctor dijo "4 horas" sin precisar unidad. Se escribe como
> **4 h hábiles** porque todo §5.2 corre sobre la ventana de §5.2.1 y porque es la lectura que
> hace coincidir la cifra con un instante ya calculado. **Si la intención fue 4 h de reloj, el
> diseño cambia**: sería un mecanismo separado, con campo propio, capaz de avisar un sábado.
> La confirmación explícita se agrega a la próxima consulta a Héctor.

El cliente pide que el sistema le insista al tasador que no ha informado el resultado de su
llamado, sin que Control y Seguimiento tenga que perseguirlo: *"que le llegue en forma
automática… oye favor informar fecha de visita"* (`p5`), *"ahí que le llegue un correo otra vez
al tazador, un WhatsApp al tazador"* (`p7`).

**El problema no es si el recordatorio existe, sino cuándo se dispara.** La misma tanda de audios
menciona cuatro números distintos y no son intercambiables:

| Número | Dónde aparece | Qué es en realidad |
|---|---|---|
| 4 h | `p1`, `revision 1` | SLA **ideal** de la etapa 2, ya fijado en §5.2.4 |
| 6 h | `p1` | SLA **máximo** de la etapa 2, ya fijado en §5.2.4 |
| **8 h** | `p5`, `p7` | **El candidato a umbral del recordatorio** |
| 24 h | `p3`, `p5`, `p7` | El **tope de respuesta al cliente** — ver A-23 |

Los dos primeros ya tienen domicilio y no son esto. El cuarto es otra cosa. Queda el tercero, que
el cliente enuncia dos veces —*"pasadas las 8 horas"*— pero siempre en la misma frase en que
menciona las 24, de modo que no es evidente si son dos mecanismos o uno mal recordado.

**Por qué no se resuelve aquí.** Un recordatorio a las 8 h llega **después** de que la etapa 2 ya
está en rojo (6 h), lo que es defendible —primero se avisa al área, después se insiste al
ejecutor— pero también puede ser exactamente al revés de lo que el cliente quiere. Elegir por
nuestra cuenta produce un sistema que insiste tarde o que satura.

**Consecuencia sobre la construcción.** El umbral **se carga como dato, nunca como constante**
(plan IF-02 §9.6.1 · *Alertas y notificaciones*). v1.13 del plan **no crea el campo** que lo
aloje: hacerlo antes de saber si es un número por etapa, uno global o uno por cliente es elegir
la forma de un dato cuya semántica está abierta. IF-03 no lo replica en ninguna forma; P10-TAS
sólo verifica coherencia (plan Tasador §11.1 · Verificación 4).

---

## A-23 · Modelado del tope de 24 horas para responder al cliente

**Estado** — abierta · **afecta a spec §5.2.4, §5.2.8 y §5.2.9** · impacto medio.
**Dueños: Héctor + Arquitecto de Software.** Registrada como **D-18** en spec §15.

El compromiso **no está en duda**: VProperty le responde al ejecutivo del cliente con una fecha
de visita —o con el motivo por el cual no la hay— dentro de las 24 horas del ingreso. El cliente
lo describe como la obligación que ordena todo el tramo: *"en el extremo tenemos que devolverle
al cliente las 24 horas"* (`p5`), *"esos 20 hay que contestar la fecha de visita a nuestro
cliente vía correo"* (`p7`).

Lo que está abierto es **cómo se modela**, y las tres opciones no cuestan lo mismo:

1. **Umbral agregado sobre las etapas 2+3+4.** Es lo más fiel al compromiso, y es el único
   modelado que produce un semáforo propio. Exige un cómputo que hoy no existe: el motor mide
   etapas, no tramos de etapas.
2. **Sólo corte del reporte** de §5.2.9. Barato y suficiente para que el área lo vea, pero no
   alerta: alguien tiene que abrir el reporte.
3. **Atributo derivado de la etapa 4.** El más simple, y el que peor describe la realidad: una
   solicitud puede incumplir el tope con las tres etapas individualmente en verde, que es
   justamente el caso que hay que poder detectar.

**Por qué importa elegir bien.** La opción (3) hace invisible el único escenario que el tope
existe para atrapar. La (1) es correcta y es trabajo real de motor. La (2) es la que se puede
entregar ya, y puede ser suficiente si el reporte se mira a diario —que es lo que el cliente
declara hacer—.

---

## A-24 · Proveedor y contrato del canal WhatsApp

**Estado** — abierta · **afecta a spec §5.2.8 y §5.3** · impacto medio.
**Dueños: Héctor + Ingeniero Make.** Registrada como **D-19** en spec §15.

El cliente pide WhatsApp como segundo canal de los recordatorios al tasador, en dos audios
distintos y sin ambigüedad: *"que le llegue un nuevo mail y un nuevo whatsapp"* (`p5`), *"un
WhatsApp al tazador"* (`p7`).

**No hay nada decidido debajo de esa petición:** ni proveedor (Twilio, WhatsApp Business API,
un intermediario), ni número emisor, ni plantillas aprobadas por Meta —que son obligatorias para
mensajes iniciados por la empresa y tienen su propio ciclo de aprobación—, ni costo por mensaje,
ni quién administra el opt-in de cada tasador.

**Estado en la documentación.** §1.9 · **FUT-EJ-10** ya declara la notificación por WhatsApp al
tasador fuera de alcance de v1.9, y esta tanda **no la mete en alcance**: fija su contrato para
cuando entre. Mientras tanto el recordatorio se emite **sólo por correo**, y el diseño del
recordatorio no asume un canal único, de modo que agregarlo después no lo reescriba.

**Nota sobre `M_Tasadores.notificar_whatsapp`.** El campo aparece nombrado en §1.9.1 como parte
de lo diferido. Su existencia no implica que el canal esté resuelto: un booleano de preferencia
no es un proveedor.

---

## A-25 · Composición del catálogo de motivos de contacto no logrado

**Estado** — abierta · **afecta a spec §2.3, §2.12, RF-TAS-12 y §5.2.9** · impacto medio.
**Dueño: Héctor** (product owner).

**Distinta de A-17, que está cerrada.** A-17 preguntaba **dónde vive** el catálogo y se resolvió:
`singleSelect` servido desde el schema. A-25 pregunta **cuáles son sus valores**.

El audio `p1` enumera los desenlaces que el tasador reporta en la práctica: *"primero, coordino
la visita tal día y tal hora. Segundo, fono erróneo, solicitar a otro. Tercero, no contesta, se
le envió WhatsApp. Cuarto, el contacto no sabe de lo que le están hablando, también pasa. Quinto,
el contacto que es el dueño o el corredor tiene que coordinar con el que ocupa la propiedad"*, y
cierra con *"o el quinto puede ser otro motivo"*.

Spec v1.9.13 amplía el catálogo de cuatro a **seis** valores incorporando los dos que el cliente
nombra y que antes caían en `Otro`:

| Motivo | Origen |
|---|---|
| `Teléfono no contesta` | ya existía |
| `Teléfono equivocado` | ya existía |
| `Cliente rechaza visita` | ya existía · **el cliente no lo menciona en `p1`** |
| `El contacto no reconoce la solicitud` | **nuevo** · `p1` |
| `El contacto coordina con el ocupante` | **nuevo** · `p1` |
| `Otro` | ya existía |

**Las dos preguntas concretas:**

1. **¿`Cliente rechaza visita` se conserva?** El cliente no lo nombra. Se mantiene porque el
   audio no lo niega y porque borrar un valor de un `singleSelect` invalida filas históricas,
   pero conviene confirmarlo.
2. **¿Las etiquetas son las correctas de cara al cliente final?** El catálogo tiene doble
   destinatario: es lo que el tasador elige y es lo que Control y Seguimiento le comunica al
   ejecutivo (§5.2.4 · etapa 4). Una etiqueta interna puede no servir para un correo externo.

**Por qué importa cerrarlo antes de P4-TAS.** Los dos valores nuevos se **agregan**; ninguno de
los cuatro anteriores se renombra ni se borra, así que la ampliación es segura. Pero cada motivo
que quede fuera del catálogo termina en `Otro`, donde es invisible para los reportes de
desviaciones de §5.2.9 — que es exactamente el problema que esta ampliación viene a corregir.

---

## A-26 · Catálogo de motivos de reproceso

**Estado** — abierta · **afecta a spec §5.2.5** · impacto bajo mientras el reproceso siga
diferido. **Dueño: Héctor** (product owner).

El audio `p3` cierra el catálogo que §5.2.5 daba por no elicitado. Son siete motivos, que el
cliente enumera por frecuencia y con el antecedente documental que acompaña a cada uno:
permiso de recepción final · corrección de dirección por certificado de número · revisión por
aumento de valor · regularización de ampliación · corrección de forma (nombre, RUT) · cambio de
cliente destinatario del informe · pronunciamiento sobre afectación de utilidad pública.

Dos precisiones que el mismo audio aporta y que la documentación no tenía:

- **El reproceso conserva el código de la solicitud original**: *"no se creó una nueva solicitud,
  es el mismo código"*. Responde el punto **(a)** de **CI-038**.
- **Quién lo ejecuta depende del motivo.** Los de forma, valor y destinatario los resuelve el
  **perfil de visación**, único con permiso sobre las tres dimensiones del informe (`p4`: *"el
  perfil del visador… es el que puede hacer todos estos cambios de forma y de fondo y también los
  valores"*). La matriz R1–R3 nombra al tasador como responsable de R2 porque era el caso
  supuesto.

**Qué queda por ratificar:** que los siete son el dominio cerrado y no una muestra —el cliente
dice *"esos son los más típicos"* y *"los más característicos"*, que es lenguaje de muestra, no
de catálogo—; y las etiquetas exactas para el `singleSelect`.

**Consecuencia sobre el plan.** Ninguna inmediata: el reproceso sigue diferido en §1.9 ·
FUT-EJ-08. Lo que cambia es **el fundamento del diferimiento**, registrado como **§9.6-R7** en el
plan de IF-02: se posterga por alcance, no por falta de definición, y la versión que lo implemente
no tiene que volver a elicitarlo.

---

## A-27 · Domicilio de los defaults constructivos de spec §2.8.1 — **CERRADA**

**Estado** — **cerrada** el 22-ago-2026 por respuesta de Héctor · **desbloquea la precarga de la
sección E de P7-TAS** · impacto medio. **Dueños: Arquitecto de Datos + Héctor.** Registrada como
**D-20** en spec §15, ahora cerrada. **Sucede a la mitad no resuelta de A-14, que queda cerrada
con ésta.**

> **RESOLUCIÓN — partición por tipo de propiedad × estado de uso.**
>
> Héctor responde: los defaults se particionan **por tipo de propiedad × estado de uso
> (nueva/usada)**, replicando el modelo que la plantilla ya usa con sus dos interruptores,
> `[Excel: FICHA SOLIC!K35]` (`tipoPropiedad`) y `[Excel: FICHA SOLIC!K36]` (`estadoUso`).
>
> Es la opción 2 de las tres que esta ficha planteaba, y la que **no pierde comportamiento**: una
> clave global habría aplanado la mitad de las reglas de §2.8.1 —cubierta, adosamiento, estado de
> conservación—, y una clave por comuna no tenía respaldo en ningún artefacto.
>
> **Lo que la decisión habilita:** definir la tabla destino en Airtable con esa clave, y con ella
> la precarga efectiva de la sección E. En IF-03 los dos interruptores llegan desde
> `TX_Solicitudes.tipo_propiedad` y `TX_Solicitudes.tipo_propiedad_nuevo_usado`, de modo que el
> conjunto **se resuelve server-side** y viaja ya resuelto: el frontend recibe valores, nunca
> reglas (RF-TAS-23).
>
> **Lo que sigue siendo trabajo, no ambigüedad:** crear la tabla es una tanda de schema y
> **exige aprobación explícita de Sergio**, que es una compuerta distinta de esta ficha. La
> granularidad de fila —un registro por campo, o uno por combinación con todos los campos— queda
> como decisión de implementación de esa tanda; ninguna de las dos cambia la clave ni el
> comportamiento observable.
>
> **El riesgo se mantiene y el candado también.** Que ahora exista domicilio no autoriza a
> escribir los valores en el frontend: el criterio de aceptación de P7-TAS conserva el `grep` de
> los literales de §2.8.1 sobre `components/tasador/` y `lib/tasador/`.

Los valores ya no faltan: están especificados uno a uno en spec §2.8.1, con su celda de origen.
Lo que falta es **dónde se alojan dentro del sistema**, y son tres decisiones encadenadas:

1. **¿Tabla nueva o tabla existente?** Ninguna de las actuales sirve: `C_VariablesCliente` es
   clave-valor por cliente y estos defaults **no dependen del cliente**; `C_FactoresHomogeneizacion`
   y `C_Factores` son de coeficientes de cálculo. Crear tabla en Airtable **exige aprobación
   explícita de Sergio**.
2. **¿Cuál es la clave?** La plantilla ramifica por **tipo de propiedad × estado de uso**
   `[Excel: FICHA SOLIC!K35 · K36]`. Copiar esa clave es lo más fiel; una clave global sería más
   simple y perdería la mitad del comportamiento; una por comuna —que A-14 planteaba— no tiene
   respaldo en la plantilla.
3. **¿Qué granularidad de fila?** Un registro por campo, o un registro por combinación con todos
   los campos. La primera escala mejor a campos nuevos; la segunda se lee de un vistazo.

**Consecuencia sobre la construcción.** P7-TAS **sí construye** la sección E, con los campos y los
catálogos de §2.8.1 y el badge "Pre-llenado · editable" cableado; lo que espera es la **precarga
efectiva**. La sección se libera **con campos y sin valores**, que es distinto de liberarla sin
campos, y el punto de consumo queda aislado en el mismo módulo que consume los factores.

**El riesgo específico de esta ambigüedad.** Ahora que los valores se conocen, escribirlos en un
`const` del frontend es trivial y tentador — y es exactamente lo que RF-TAS-08 prohíbe. El
criterio de aceptación de P7-TAS incluye un `grep` de los literales de §2.8.1 sobre
`components/tasador/` y `lib/tasador/` para atraparlo.

---

## A-28 · Los tres factores de homogeneización no aparecen en la plantilla operativa — **CERRADA**

**Estado** — **cerrada** el 22-ago-2026 por respuesta de Héctor · impacto alto. **Dueños: Héctor
+ Visador titular.** Registrada como **D-21** en spec §15, ahora cerrada.

> **RESOLUCIÓN — los tres factores se usan. RF-TAS-08 queda ratificado tal como está.**
>
> Héctor confirma que **superficie, edad y distancia se siguen usando en la práctica**. La
> ausencia en la plantilla no significa que el negocio no los aplique: significa que la planilla
> no los materializa como columna, y esa es una propiedad del artefacto, no del método.
>
> `factor_sup`, `factor_edad` y `factor_distancia` **no se tocan**, ni en la grilla de
> comparables, ni en RF-TAS-08, ni en el contrato de
> `GET /api/tasaciones/config/defaults`. **No se implementa ninguna variante de dos factores.**
>
> **Sobre `D. F.` y `F. M.`** `[Excel: Portada!AX50 · BA50]`, ambos con default `1`: Héctor no
> los desmintió, pero tampoco los propuso como reemplazo. Se degradan de *"posible modelo
> alternativo"* a **observación**: probablemente factores adicionales o históricos que la
> plantilla arrastra en el cuadro de valoración —que es otro cuadro que el de comparables—.
> Aclararlos queda como **A-35**, no bloqueante.
>
> **Lo que esta ficha cierra y lo que no.** Cierra la duda **estructural**: ya no hay riesgo de
> construir la ruta contra un modelo equivocado, que era el bloqueo real que A-28 introdujo. **No
> cierra A-18**, que sigue sin poder servir un valor: ratificar *qué* factores no dice *cuánto*
> vale cada uno. Ver la enmienda del 22-ago-2026 en A-18.

A-18 concluyó que ninguna tabla puede servir hoy un valor de referencia para `factor_sup`,
`factor_edad` y `factor_distancia`. La revisión de la plantilla vigente buscó ese valor fuera del
schema —el mismo movimiento que resolvió A-14— y encontró algo distinto y más incómodo: **los
tres factores no existen en la planilla en ninguna forma**.

**Lo que la planilla hace en su lugar.** El cuadro de comparables calcula el valor unitario de
forma directa, sin homogeneizar: `(total UF − UF/m² terreno × sup. terreno − OO.CC.) / sup.
construida` `[Excel: Portada!AX29]`. No hay columna de factor, ni de superficie, ni de edad, ni
de distancia.

**Lo que sí tiene.** Dos factores multiplicativos, en el **cuadro de valoración** y no en el de
comparables: `D. F.` y `F. M.` `[Excel: Portada!AX50 · BA50]`, ambos con valor por defecto `1`
`[Excel: Portada!AX51:AX53 · BA51:BA53]`, aplicados como `F. M. × D. F. × UF/m² nuevo`
`[Excel: Portada!BD51]`. **Su nombre desarrollado no está escrito en ninguna parte del libro.**

**Las tres preguntas:**

1. **¿Los tres factores de RF-TAS-08 describen la práctica real del negocio, o son una
   importación de literatura de tasación que nunca se usó?** El diseño v4 los nombra; la
   operación no los tiene.
2. **¿Qué son `D. F.` y `F. M.`?** La lectura probable es *Depreciación/Factor* y *Factor de
   Mercado*, pero es inferencia y no se documenta como hecho.
3. **Si la práctica real son estos dos, ¿RF-TAS-08 se reescribe?** Es la pregunta cara: cambia
   la grilla de comparables, el contrato de la ruta de defaults y el motor.

**Consecuencia sobre el plan.** Refuerza lo que A-18 ya impone:
`GET /api/tasaciones/config/defaults` **sigue sin construirse**. La grilla conserva sus tres
columnas de factor como campos capturables **sin precarga**, y **no se implementa** ninguna
variante de dos factores mientras A-28 siga abierta: sería sustituir una suposición por otra.

---

## A-29 · Precio de venta: campo pedido sin origen en la plantilla

**Estado** — abierta · **afecta al alta de solicitud** · impacto bajo. **Dueño: Héctor.**

El cliente lo pide de forma explícita en las pruebas del sistema: *"tiene que incorporar el
precio de venta… es importante porque es un precio que a nosotros nos da referencia para poder
valorizar"* (`r21`).

**No existe en la plantilla.** El barrido completo del libro no encontró ninguna celda de precio
de venta: lo más cercano son el `Avalúo Fiscal` `[Excel: FICHA SOLIC!K41]`, que es otra cosa, y
los `Total UF` de los comparables `[Excel: Portada!AD29:AD33]`, que son de otras propiedades.

**Las tres preguntas:** unidad (¿UF o pesos?, la planilla mezcla ambas y la UF es la unidad del
informe); obligatoriedad en el alta —el mismo audio pide **reducir** los campos obligatorios, de
modo que agregar uno obligatorio contradiría la petición vecina—; y si es dato de referencia para
el tasador o entra al cálculo, que es la que decide si lo toca el motor.

**Nota de ámbito.** El campo se captura en el alta de IF-02, que quedó fuera del ámbito de esta
ronda, pero lo consume el tasador. Se registra en ámbito por ese consumo.

---

## A-32 · Grupo de "día 0" en el tablero de vencimientos

**Estado** — abierta · **afecta a spec §5.2.9** · impacto bajo. **Dueño: Héctor.**

> **Nota de numeración.** Esta ficha se numeró originalmente en el bloque fuera de ámbito de la
> tanda del 21-ago-2026. Se reclasificó **en ámbito** el mismo día, sin renumerar, porque el
> tablero de vencimientos es §5.2.9 —Control de SLA— y la ficha quedó citada desde tres secciones
> normativas: `VProperty_SLA_Negocio_v1.2.md` §5, `VProperty_Especificacion_Proyecto_v1_9_13.md`
> §5.2.9 y `plan-ejecucion-if02-v1_9.md` §9.6.1. Un tag `[fuera-de-ámbito-actual]` diría lo
> contrario de lo que hacen esas tres referencias.

El cliente describe el tablero que revisa a diario con cuatro grupos por días transcurridos desde
la visita —4, 3, 2 y 1— y agrega la posibilidad al pasar: *"incluso podríamos colocar cero días
de la visita"* (`p3`).

**La pregunta.** Un grupo de día 0 son las visitas del propio día, cuyos informes **todavía no
pueden estar atrasados**: el plazo de la etapa 5 recién empieza a correr. Incluirlas cambia la
naturaleza del bloque, que pasa de *"lo que está por vencer"* a *"todo lo que está en vuelo"*.
Puede ser exactamente lo que el cliente quiere —ver la carga entrante— o puede diluir la señal
de urgencia que hace útil al tablero.

**Consecuencia sobre la construcción.** Ninguna bloqueante: el bloque de vencimientos se
construye con los cuatro grupos declarados y agregar un quinto después es aditivo.

---

## A-30 · `[fuera-de-ámbito-actual]` · Abreviatura de cliente en el código de solicitud

**Estado** — abierta · **fuera del ámbito de la ronda del 21-ago-2026** · impacto medio.
**Dueño: Héctor.**

El cliente pide cambiar el formato del código: sin guiones, `BP` + año + mes + número **+ código
del cliente**, porque *"si me dicen Héctor el código BP no voy a saber de lo que es"* y porque
identifica al cliente de un vistazo (`r21`, `revision 1`).

**El Excel tiene dos listas de abreviatura y son incompatibles:** la columna `X`
`[Excel: FICHA SOLIC!X25:X64]`, con 40 valores de largo variable (`HIPOTECARIA SECURITY`,
`METLIFE`, `ULH`, `HEV`…), y una lista de códigos de tres letras
`[Excel: FICHA SOLIC!S5:S19]` (`BIC`, `MET`, `PAR`, `PEN`…) que cubre sólo una parte del padrón.

**Y la abreviatura no es única:** `BCH` aparece dos veces — Bice Hipotecaria
`[Excel: FICHA SOLIC!X38]` y Banco de Chile `[Excel: FICHA SOLIC!X40]`. Una abreviatura
duplicada **no puede formar parte de una clave de código** sin desambiguar antes.

Afecta además a `codigo_ext`, que es fórmula en Airtable y read-only desde la app.

---

## A-31 · `[fuera-de-ámbito-actual]` · Reasignación de tasador

**Estado** — abierta · **fuera del ámbito de la ronda del 21-ago-2026** · **impacto alto**.
**Dueño: Héctor** (reabre una decisión firmada).

El cliente lo pide con énfasis: *"tiene que permitir que nosotros le mandamos un tazador y que
ese tazador no puede reasignar a otro tazador… nosotros tenemos que reasignarlo a otro tazador,
entonces también tiene que permitir reasignar"* (`r21`).

**Leído completo, el audio distingue dos sujetos:** el **tasador** no puede reasignarse a otro
—lo que el sistema ya cumple— y **Control y Seguimiento sí** debe poder. Ese segundo flujo es
exactamente el que v1.9 retiró.

**Contradice tres puntos vigentes:** spec §1.6 y §1.3.1 (*"no existe botón «Reasignar Tasador» ni
flujo de reasignación formal"*), la **REGLA A · D-15** y la **D-01**. Hoy la única vía de
corrección es "Editar solicitud" mientras el estado siga `creada`, lo que **no cubre** el caso
del audio: reasignar después de asignada.

**No se resuelve por documentación.** Es una decisión de producto que revierte una decisión
firmada, y su reapertura arrastra el correo al tasador saliente, el estado de la solicitud y la
trazabilidad en `A_Eventos`.

---

## A-33 · `[fuera-de-ámbito-actual]` · Honorarios al tasador y facturación al cliente

**Estado** — abierta · **fuera del ámbito de la ronda del 21-ago-2026** · impacto medio.
**Dueño: Héctor.** Relacionada con **D-02** y **D-03** de spec §15.

El cliente describe el cierre económico del ciclo, que hoy hace a mano: *"le pago un horario a
los tasadores desde la fecha envío al cliente… todos los enviados al cliente desde el día 1 al 31
elijo el tasador y le pago el honorario"*, y *"todos los días 5 de cada mes bajo las operaciones
de Medline y todas las fechas de enviado… y cobro mi factura a mis clientes"* (`r23`).

**El dato que ancla todo es la fecha de envío al cliente**, que es el cierre de la etapa 7 de
§5.2.4 y que el sistema ya va a registrar. Eso hace la funcionalidad más barata de lo que parece:
lo que falta es el corte mensual, la tarifa por tasador y la exportación.

El mismo audio pide **exportar la base a Excel** para análisis, que es el vehículo natural de
ambos cortes.

**Relación con D-02 y D-03.** D-02 pregunta si la gestión de honorarios vive dentro de VProperty
o se exporta a contabilidad externa; D-03, el modelo tarifario. A-33 aporta el **criterio de
devengo** —fecha de envío al cliente— que ninguna de las dos tenía.

---

## A-34 · `[fuera-de-ámbito-actual]` · Detección de proyectos y direcciones ya tasados

**Estado** — abierta · **fuera del ámbito de la ronda del 21-ago-2026** · impacto medio.
**Dueño: Héctor.**

En propiedades nuevas, VProperty visita el edificio **una sola vez** y reutiliza el trabajo para
las unidades siguientes: *"nosotros vamos una vez al edificio y no vamos más"*. Por eso, al
cargar el alta, necesitan que el sistema busque direcciones parecidas y muestre lo ya tasado:
*"buscamos direcciones parecidas y nos arroja direcciones y ahí vemos que ya lo hicimos… así
decimos, ah, este proyecto ya lo hemos hecho"* (`r21`).

**Es una funcionalidad de búsqueda difusa sobre dirección y nombre de proyecto**, no un filtro
exacto: el cliente describe buscar *"teatino 950"* y ver todas sus coincidencias, sin importar
nuevo o usado. Airtable no ofrece coincidencia difusa nativa, de modo que la realización no es
trivial y hay que decidir dónde corre.

**Impacto operativo si no se resuelve:** se repite una visita ya hecha, que es costo directo, o
se emite un informe inconsistente con el que ya se entregó para el mismo edificio.

---

> **Tanda del 22-ago-2026 — respuestas de Héctor.** Las tres ambigüedades bloqueantes de la ronda
> anterior (A-22, A-27, A-28) quedan **cerradas** arriba, en sus fichas, con la resolución
> integrada. Lo que sigue son las dos entradas que esa misma ronda genera: una observación
> heredada de A-28 y el saneamiento de una colisión de identificador.

---

## A-35 · Qué son `D. F.` y `F. M.` en el cuadro de valoración

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Héctor.**
Registrada como **D-22** en spec §15. Heredada del cierre de **A-28**.

El cuadro de valoración de la plantilla aplica dos factores multiplicativos cuyo nombre
desarrollado **no está escrito en ninguna parte del libro**: `D. F.` y `F. M.`
`[Excel: Portada!AX50 · BA50]`, ambos con valor por defecto `1`
`[Excel: Portada!AX51:AX53 · BA51:BA53]`, aplicados como `F. M. × D. F. × UF/m² nuevo`
`[Excel: Portada!BD51]`.

**Por qué dejó de ser urgente.** A-28 los planteaba como posible **reemplazo** de los tres
factores de homogeneización de RF-TAS-08, lo que habría obligado a reescribir la grilla de
comparables, el contrato de la ruta de defaults y el motor. Héctor ratificó los tres factores y
no los mencionó como alternativa, de modo que la hipótesis del reemplazo **queda descartada**.

**Lo que queda por aclarar, sin prisa:**

1. **Qué son.** La lectura probable es *Depreciación/Factor* y *Factor de Mercado*, pero es
   inferencia sobre dos abreviaturas y no se documenta como hecho.
2. **Si están vivos o son arrastre.** Ambos valen `1` por defecto, que es el elemento neutro de
   la multiplicación: una columna que nunca se toca y un residuo histórico se ven exactamente
   igual desde afuera.
3. **Si el motor debe replicarlos.** Sólo si (2) responde que están vivos. Viven en el cuadro de
   valoración, que es distinto del de comparables, así que su ámbito sería el cálculo del valor
   unitario por ítem y no la homogeneización.

**Por qué se registra igual.** Dos factores multiplicativos sin nombre en la planilla que produce
el informe entregable son, en el peor caso, una regla de cálculo que el sistema no está
replicando. El costo de preguntarlo es una línea en la próxima consulta; el de descubrirlo tarde,
un informe con un valor distinto del que la operación produce hoy.

---

## A-36 · Cota de 4 h en la pertenencia del chip "Por coordinar" — **CERRADA · APLICADA**

**Estado** — **cerrada** · decisión aprobada por Sergio y **ya implementada** en el Bloque 3 del
frente A+B. Registrada retroactivamente el 22-ago-2026. **Acuse formal de Héctor pendiente, no
bloqueante.**

> **Esta ficha existe para deshacer una colisión de identificador, no para reabrir la decisión.**
> La decisión se tomó y se aplicó bajo la etiqueta **`A-22`**, que en el registro designa otra
> cosa —el umbral del recordatorio al tasador, abierto el 21-ago-2026 y cerrado el 22-ago-2026—.
> Ambas giran alrededor de "4 h en coordinación", que es justamente lo que las volvía
> indistinguibles al leerlas por separado. Manda el registro, que es la fuente de los `A-XX`, de
> modo que **la decisión del chip se re-etiqueta como A-36** y `A-22` conserva su significado
> único. Precedente del mismo problema: **A-10** (colisión SC05/SC08).
>
> **Dónde estaba citada como `A-22`:** `docs/CODE_INCONSISTENCIES.md` en **CI-045** (resolución) y
> **CI-048** (decisión, dueño). Ambas llevan ahora nota de desambiguación.

**La decisión, sin cambios.** §2.1 y RF-TAS-01 definen el chip "Por coordinar" como *"solicitudes
sin coordinación vigente, en estado `asignada` y con `now() - fecha_asignacion < 4h`"*. La cota
horaria **se dropea de la pertenencia**: membresía = `estado === 'asignada' && coordinacionVigente
== null`. El *"menor tiempo restante"* se preserva en el **orden**, por `sla_etapa_vence_ts`
ascendente — el instante que el motor ya materializó, sin recalcular nada en el cliente.

**Por qué es la única lectura fiel.** Implementar la cota exigiría o bien recalcular horas hábiles
en el cliente —lo que reabre **CI-021**, que retiró `horas_restantes` por producir una cifra
irreproducible— o bien esconder del chip las coordinaciones **vencidas**, que son las más urgentes
de coordinar y cuya desaparición vaciaría de sentido a RF-TAS-01.

**Relación con el cierre de A-22.** Ninguna, y conviene que quede escrito. A-22 fijó **cuándo se
avisa** al tasador (4 h hábiles, coincidente con el ámbar de e2); A-36 fija **qué se muestra** en
su cola. Que Héctor haya ratificado 4 h **no reabre** A-36: el chip sigue sin aplicar cota de
pertenencia, y el plan de IF-03 §11 lo sostiene explícitamente — el umbral **no se replica** en
IF-03, se observa.

**Candado.** El caso *"no aplica ninguna ventana de tiempo sobre la fecha de asignación"* en
`cola-filtros.test.ts` fija una solicitud `asignada` sin coordinar de hace un mes y exige que siga
en el chip. Si alguien reintroduce una ventana horaria, ese test se cae.

---

> **Tanda del 22-ago-2026 (b) — P0.5-TAS.** Las tres entradas que siguen salieron de crear
> `C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`). Se registran acá y no sólo en el snapshot por
> la convención **C-20**: los identificadores `A-XX` los asigna este archivo y sólo este archivo.
> Detalle operativo completo en `docs/_notas/snapshot-P0.5-TAS-defaults.md`.

---

## A-37 · Contra qué fila de `M_TiposPropiedad` se cuelga cada default — **CERRADA**

**Estado** — **cerrada** el 22-ago-2026 por la tanda **P0.5.B-TAS** · **desbloquea el sembrado de
`C_DefaultsAntecedentes`** · impacto alto. **Dueños: Óscar (datos) + Héctor (dominio de negocio).**

> **RESOLUCIÓN — la maestra se saneó, y el problema era peor de lo que esta ficha describía.**
>
> El conteo de links entrantes reveló que **los duplicados no estaban solapados**: `CASA` y
> `DEPARTAMENTO` acumulaban **sólo** links transaccionales (26 solicitudes de jul–ago-2026) y
> `Casa`/`Departamento` **sólo** configuración (33 referencias del alta inicial). La línea de corte
> era exactamente la frontera transacciones / configuración.
>
> Es decir: **ninguna de las 39 solicitudes con tipo de propiedad poblado podía resolver su regla
> de negocio, su tramo de vida útil, su precio unitario ni su SLA por ese eje.** Esta ficha lo
> planteaba como riesgo para un sembrado futuro; era una desconexión funcional **ya viva** en la
> base, que el sembrado habría heredado.
>
> **Qué se hizo** (detalle en `docs/_notas/snapshot-P0.5.B-TAS.md`):
>
> - **Canónico: Title Case**, alineado con `[Excel: FICHA SOLIC!AD25:AD32]`.
> - **26 links migrados** a `Casa` (`recrXDAjlVCe59XBW`) y `Departamento` (`recf9hz8TbkQ6wsus`).
> - **`CASA` y `DEPARTAMENTO` eliminadas**, tras verificar conteo 0 en las 12 tablas.
> - **5 filas renombradas** a Title Case sin tocar links; **6 en baja lógica**; **2 altas**
>   (`Casa Piloto`, `Departamento Piloto`) que el Excel declaraba y la tabla no tenía.
> - Dominio final: **9 filas activas** — las 8 del Excel más `Bodega` (ver **A-40**).
>
> **Los defaults se cuelgan sin ambigüedad** de `Casa` y `Departamento`. El sembrado de
> `C_DefaultsAntecedentes` queda desbloqueado.
>
> **Efecto colateral que conviene verificar aparte:** las 39 solicitudes ahora sí resuelven su
> configuración. El comportamiento del motor de cálculo cambió, y **conviene probarlo sobre una
> solicitud real** — no lo hizo P0.5.B-TAS, que era una tanda de schema.

---

### Contenido original de la ficha (17-ago → 22-ago-2026)

`M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`) tiene **15 filas**, no las 8 que declara
`ListaTipoPropiedad` `[Excel: FICHA SOLIC!AD25:AD32]`, y **dos pares duplicados por
capitalización**:

| Duplicado | Record ID | Observación |
|---|---|---|
| `CASA` | `rec5J0dPImsDm5Leb` | sin `categoria` |
| `Casa` | `recrXDAjlVCe59XBW` | **la única de las 15 con `categoria = Habitacional`** |
| `DEPARTAMENTO` | `recJ0OIjob9ywogr6` | sin `categoria` |
| `Departamento` | `recf9hz8TbkQ6wsus` | sin `categoria` |

**Por qué no bloqueó la creación de la tabla pero sí el sembrado.** El campo
`C_DefaultsAntecedentes.tipo_propiedad` es un Link y admite cualquiera de las 15 filas. El
problema aparece al escribir datos: si el default de "Departamento" se cuelga de `DEPARTAMENTO` y
las solicitudes reales linkean `Departamento`, **el lookup devuelve vacío sin error**. La sección E
del formulario aparecería sin pre-llenar y el diagnóstico costaría una sesión entera, porque no hay
nada que falle — sólo un conjunto vacío que se lee como "esta combinación no tiene defaults", que
es un estado legítimo según §2.8.1.

Es el mismo modo de fallo silencioso de **P-5** (el género de `tipo_propiedad` entre
`D_TipoDocumento` y `TX_Solicitudes`), y la razón por la que el eje 1 se modeló como Link y no como
`singleSelect`: el Link al menos hace que el problema sea de **qué fila**, no de **qué literal**.

**Las dos preguntas:**

1. **¿Se sanea la maestra antes de sembrar, o se siembra contra las filas actuales?** Sanear es
   más limpio y es **tanda propia**: `M_TiposPropiedad` recibe links entrantes desde
   `TX_Solicitudes`, `C_PreciosUnitarios`, `C_VidaUtil`, `C_Factores`, `C_Formulas`, `C_SLA`,
   `C_ReglasNegocio`, `C_FactoresHomogeneizacion`, `TX_Comparables`, `H_Comparables_Historico` y
   `C_Plantillas`. Un merge mal hecho los arrastra a todos.
2. **¿Cuál de los dos duplicados es el canónico?** `Casa` tiene `categoria` poblada, lo que sugiere
   que es la viva; pero eso es inferencia sobre una sola celda y hay que verificar contra qué fila
   apuntan las solicitudes reales antes de decidir.

**Consecuencia inmediata:** el sembrado de `C_DefaultsAntecedentes` **no arranca** hasta cerrarla.
La tabla queda creada y vacía, que es un estado consistente.

---

## A-38 · Dónde se materializan los catálogos de valores admisibles

**Estado** — abierta · **no bloqueante para el schema, sí para la UI de P7-TAS** · impacto medio.
**Dueño: Arquitecto de Datos.**

Cada campo de §2.8.1 tiene su catálogo cerrado —36 valores en estructura soportante
`[Excel: Antecedentes!BZ45:BZ80]`, 19 en cubierta `[Excel: Antecedentes!CE45:CE63]`, 13 en muebles
de cocina `[Excel: Antecedentes!CO44:CO56]`, 11 en ventanas `[Excel: Antecedentes!BX54:BX64]`, y
así—. La Pantalla 5 los necesita para poblar sus selects.

**No se alojaron en `C_DefaultsAntecedentes`, y el motivo es de normalización.** Los catálogos
**no dependen de la combinación**: el de cubierta es idéntico para departamento nuevo y para casa
usada. Con la granularidad elegida —un registro por (combinación, campo, atributo)— alojarlos ahí
los duplicaría hasta **16 veces por campo**, que es exactamente la denormalización que **RO-05**
desaconseja y la que garantiza deriva el día que alguien edite una copia.

Lo que sí quedó es `catalogo_ref` (`fld0NAJv7E1rLFWVX`), que **referencia** el rango del Excel sin
materializarlo.

**Las opciones:**

1. **Tabla hermana `C_CatalogosAntecedentes`**, un registro por (campo, valor admisible, orden).
   Normaliza bien y permite que el negocio agregue valores sin deploy. Es tabla nueva: aprobación.
2. **Constante versionada server-side**, expuesta por la misma ruta que sirve los defaults.
   Más barata, pero agregar un valor exige deploy — lo que RF-TAS-08 evita para los defaults y
   sería inconsistente aplicar sólo a la mitad del problema.

**Consecuencia sobre P7-TAS:** los selects de la sección E se construyen contra los catálogos de
§2.8.1, que están escritos en la spec. Mientras A-38 no cierre, esos valores **no tienen origen
consultable en runtime**, de modo que la pantalla puede construirse pero su catálogo no es
parametrizable todavía.

---

## A-39 · Dónde vive el anexo de estado de conservación

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Arquitecto de Datos.**

El anexo `[Excel: Estado Conservación!A7:W46]` son 38 filas de inspección, **todas** pre-llenadas
con la misma terna `Bueno` / `Ninguno` / `Funcionando`.

**No entró en `C_DefaultsAntecedentes`**, y por eso el campo `bloque` tiene tres opciones y no
cuatro. El motivo: **no ramifica por ninguno de los dos ejes de la partición**. Es constante para
las 16 combinaciones. Alojarlo en una tabla particionada significaría escribir **114 filas
idénticas por combinación** —38 filas × 3 atributos— que no aportan información y sí costo de
mantenimiento: el día que la terna cambie, hay que editarlas todas.

**Las opciones:** tabla hermana propia, o declararlo constante de aplicación con su cita al Excel
en la spec y ninguna fila en Airtable. La segunda es la que corresponde a un dato que no varía; la
primera sólo se justifica si el negocio anticipa que la terna vaya a depender de algo.

Si se elige alojarlo en `C_DefaultsAntecedentes` de todos modos, agregar la cuarta opción a
`bloque` es un `update_field` trivial y no invalida ninguna fila existente.

---

## A-40 · `Bodega` y `Estacionamiento`: ¿tipo de propiedad o tipo de bien?

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Héctor.**
Detectada en **P0.5.B-TAS** (22-ago-2026) al sanear `M_TiposPropiedad`.

Dos valores de `M_TiposPropiedad` solapan conceptualmente con `M_TiposDeBien`, que ya cubre
`Bodega`, `Estacionamiento cubierto`, `Estacionamiento descubierto` y `Estacionamiento uso y goce`:

| Valor | En `M_TiposPropiedad` | En `M_TiposDeBien` | En el Excel |
|---|---|---|---|
| `Bodega` | **activa, 8 solicitudes** | sí | ❌ no está en `ListaTipoPropiedad` |
| `ESTACIONAMIENTO` | en baja lógica, 0 links | sí (en tres variantes) | ❌ |

**Los dos ejes son conceptualmente distintos y conviene no fundirlos a la ligera.**
`M_TiposPropiedad` responde *qué clase de inmueble se tasa*; `M_TiposDeBien` responde *qué unidad
física compone la tasación* — una solicitud de departamento puede incluir bodega y estacionamiento
como unidades. Que "bodega" aparezca en los dos no es necesariamente un error: puede ser una bodega
tasada por sí sola, y las **8 solicitudes reales** sugieren que ese caso existe.

**Las dos preguntas:**

1. **¿Se tasa una bodega como propiedad independiente?** Si sí, `Bodega` pertenece legítimamente a
   `M_TiposPropiedad` y lo que falta es que el Excel la incorpore a `ListaTipoPropiedad`. Si no,
   esas 8 solicitudes están mal tipificadas y hay que reclasificarlas.
2. **¿Qué hacer con `ESTACIONAMIENTO`?** Quedó en baja lógica y sin links, de modo que no urge;
   pero si la respuesta a (1) es que sí se tasan unidades sueltas, debería reactivarse en Title
   Case por coherencia.

**Por qué no se resolvió en P0.5.B-TAS.** Esa tanda tenía por objetivo eliminar la ambigüedad de
**capitalización**, que era mecánica y verificable. Ésta es una pregunta de dominio: qué considera
el negocio una propiedad tasable. Responderla por cuenta propia habría significado reclasificar 8
solicitudes reales sobre una suposición.

**Consecuencia sobre el trabajo en curso: ninguna.** `Bodega` conserva sus 8 solicitudes y su fila
activa; el sembrado de `C_DefaultsAntecedentes` no la necesita —los defaults de §2.8.1 describen
casas y departamentos—, y una combinación sin fila deja los campos vacíos, que es el comportamiento
correcto.

---

## A-41 · Dos defaults dependen de interruptores ajenos a la clave de partición

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Héctor.**
Detectada en **P0.5.C-TAS** (22-ago-2026) al resolver las fórmulas de la hoja `Antecedentes`.

La partición de `C_DefaultsAntecedentes` es (tipo de propiedad × estado de uso), cerrada por A-27.
Dos defaults de §2.8.1 **no se resuelven con esos dos ejes**: necesitan un tercero que la solicitud
no aporta al abrir la Pantalla 5.

| Default | Fórmula | Tercer eje | Qué se sembró |
|---|---|---|---|
| `entrepisos` · materialidad | `[Excel: Antecedentes!H39]` = `IF(tipoPropiedad="Departamento","LOSA…",IF(AND(tipoPropiedad="Casa",numeroPisos=1),"","LOSA…"))` | **`numeroPisos`** `[Excel: Portada!BK5]` | **Nada en `Casa`** · `LOSA DE HORMIGON ARMADO` en `Departamento` |
| `calefaccion` · materialidad | `[Excel: Antecedentes!AR38]` = `IF(AB22="SI","LOSA RADIANTE","NO PRESENTA")` | **`AB22`**, la declaración de calefacción en el bloque de comodidades | `NO PRESENTA` en las 4 combinaciones |

**Los dos casos se resolvieron distinto, y la asimetría es deliberada.** En `calefaccion` hay una
rama que corresponde inequívocamente al caso que el pre-llenado modela —la plantilla en blanco, con
`AB22` vacío, despacha `NO PRESENTA`—, de modo que sembrarla no inventa nada. En `entrepisos` las
dos ramas son igual de plausibles: una casa de un piso no tiene entrepisos y una de dos sí, y no
hay un "caso en blanco" que desempate. Poner una losa donde no la hay es exactamente el modo de
fallo que §2.8.1 quiere evitar, así que se dejó vacío.

**Nota de lectura que conviene no perder.** En `Casa`, `entrepisos` **sí tiene calidad y estado
sembrados** aunque no tenga materialidad: `Y39` y `AF39` son constantes por rama y no dependen de
`H39`. Una fila con calidad y sin materialidad no es un sembrado a medias; es el reflejo fiel de
lo que hace la plantilla.

**La pregunta abierta:** ¿se agrega `numeroPisos` como tercer eje de partición, se resuelve
`entrepisos` server-side leyendo el dato de la solicitud, o se acepta que quede vacío y el tasador
lo complete? La tercera es la que rige hoy.

---

## A-42 · `BUENA` como valor de estado, fuera de su propio catálogo

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Héctor.**
Detectada en **P0.5.C-TAS** (22-ago-2026).

`[Excel: Antecedentes!AF43]` = `IF(H43<>"",IF(estadoUso="Nuevo","NUEVO S/USO","BUENA"),"")`.

En la combinación **`Departamento` × `usado`** —la única donde `H43` no está vacío y el estado de
uso no es nuevo— devuelve **`BUENA`**, que pertenece al catálogo de **calidad**
(`DEFICIENTE · INFERIOR · REGULAR · CORRIENTE · BUENA · SUPERIOR`) y **no** al de **estado**
(`MUY BUENO · NUEVO S/USO · BUENO · REGULAR · DEFICIENTE · OBRA GUESA · TERMINACIONES`). Es con
toda probabilidad un error de tipeo en la plantilla; lo esperable sería `BUENO`.

**Se sembró `BUENA` tal cual** (R1: gana el Excel), con la excepción anotada en el campo `notas` de
la fila `Departamento·usado·obras_complementarias·estado`. Corregirlo por cuenta propia habría
significado que la tabla dejara de reproducir la plantilla vigente sin que nadie lo hubiera
decidido.

**Consecuencia práctica si no se resuelve:** el `singleSelect` de estado que P7-TAS construya
recibirá un valor que no está en su lista de opciones. La UI debe tolerarlo —mostrarlo como valor
actual aunque no esté en el catálogo— o el campo se presentará vacío, que es peor que presentar el
valor raro.

**La pregunta:** ¿se corrige a `BUENO` en la tabla, se corrige en la plantilla, o se deja como está?

---

## A-43 · `Casa Piloto` y `Departamento Piloto` no tienen defaults

**Estado** — abierta · **no bloqueante** · impacto bajo. **Dueño: Héctor.**
Detectada en **P0.5.C-TAS** (22-ago-2026). Emparentada con **A-40**.

`ListaTipoPropiedad` `[Excel: FICHA SOLIC!AD25:AD32]` declara los dos como valores propios, y
`M_TiposPropiedad` los tiene activos desde P0.5.B-TAS (`recoCHaCWolPWtgeW`, `reck6cHbNAcmJPj8X`).
**Las fórmulas de la plantilla no los distinguen**: comparan por igualdad exacta contra `"Casa"` y
`"Departamento"`, de modo que los dos caen en la rama "resto".

| Valor | Cómo lo trata la plantilla |
|---|---|
| `Casa Piloto` | Igual que `Casa`, salvo `entrepisos`: `AND(tipoPropiedad="Casa",…)` es falso y devuelve `LOSA DE HORMIGON ARMADO` |
| `Departamento Piloto` | **Se comporta como Casa** — cubierta `PLANCHA METALICA` en vez de `FE GALVANIZADO`, y sin `PISCINA` |

Lo segundo es casi con certeza no deseado: un departamento piloto es un departamento. Es el mismo
patrón de fallo silencioso de **P-5** y **A-37** — comparación por literal exacto contra un dominio
que creció por un lado y no por el otro.

**No se sembraron** (decisión de Sergio, 22-ago-2026). Sus 4 combinaciones quedan sin filas y la UI
presenta los campos vacíos, que es el comportamiento correcto de §2.8.1. La alternativa —copiar los
datos de la raíz— exigía decidir *cuál* raíz, y para `Departamento Piloto` la plantilla responde
"Casa", que es justamente lo que parece estar mal. Sembrar sobre esa respuesta habría materializado
el error en datos.

**La pregunta:** ¿un piloto hereda los defaults de su tipo base —`Casa Piloto` de `Casa` y
`Departamento Piloto` de **`Departamento`**, no de Casa— o el negocio los tasa con criterios
propios? Si es lo primero, son 4 combinaciones más de sembrado y una corrección a la plantilla.
