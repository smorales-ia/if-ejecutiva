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

## A-14 · Tabla de configuración donde viven los defaults constructivos

**Estado** — abierta · **bloquea el subconjunto constructivo de RF-TAS-08** · impacto medio.

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

## A-17 · Catálogo de motivos de contacto no logrado: paramétrico o fijo

**Estado** — abierta · **afecta a RF-TAS-12** · impacto bajo.

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
