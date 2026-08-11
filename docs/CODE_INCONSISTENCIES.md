# CODE_INCONSISTENCIES — divergencias entre documentación y código

> Registro de inconsistencias detectadas entre los documentos canónicos y el código de
> producción. Creado el 25-jul-2026 durante el lote 3 del sync IF-Tasador v1.9.3.

## Para qué sirve

El sync de documentación **no modifica código**. Cuando una tarea documental descubre que el
código contradice al documento —o que lo seguirá contradiciendo tras el cambio—, el hallazgo
se registra aquí en vez de arreglarse sobre la marcha. Así el sync mantiene su alcance y el
hallazgo no se pierde.

Este archivo **no es una lista de deseos**: cada entrada describe una divergencia concreta y
verificable, con un archivo y una línea que se pueden abrir.

### Alcance: código, no documentos — decisión pospuesta (lote 5 · 25-jul-2026)

Este registro cubre divergencias **documento ↔ código de producción**. Las divergencias
**documento ↔ documento** no entran aquí.

La opción de ampliar `CODE_INCONSISTENCIES.md` a doc-vs-doc, o de crear un registro paralelo
tipo `DOC_INCONSISTENCIES.md`, **se descartó en el lote 5 para una única entrada**: la
desalineación entre la leyenda de estados del Motor v2.6 y §2.11 del spec, que se registró
como **A-11** en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md`. Pesaron dos razones: crear un
registro para un solo caso es sobre-ingeniería, y A-11 no tiene dueño asignable, lo que
incumpliría la regla 1 de este archivo.

**Si aparece una segunda inconsistencia doc-vs-doc no bloqueada por decisión externa, esta
decisión se revisita antes de asimilarla a `_ambiguedades.md`.** Dos entradas dejan de ser un
caso aislado y `_ambiguedades.md` está pensado para preguntas abiertas, no para tareas
agrupadas.

## Reglas del registro

1. **Sin Dueño y sin Fecha objetivo no entra ninguna entrada.** Una divergencia sin
   responsable ni plazo es una nota, no un compromiso, y el archivo se vuelve un cementerio.
   Si no hay quién la tome, no se registra: se discute primero.
   La Fecha objetivo admite dos formas, nunca el vacío: una fecha `AAAA-MM-DD`, o una
   **condición explícita y verificable** —un punto abierto, una RF o una decisión de la que
   depende—. "Cuando se pueda" no es una condición; "condicional a RF-TAS-06, dependiente de
   P-5" sí lo es, porque ambos tienen ficha propia y estado consultable.
2. **Identificador correlativo `CI-NNN`, nunca se renumera.** Rige la misma regla de oro que
   para RF · RN · SC · AT: un identificador retirado se marca cerrado, no se reasigna.
3. **Una entrada, una divergencia.** Si un mismo síntoma tiene dos causas, son dos entradas.
4. **Archivo:línea obligatorio y verificable** al momento de escribir la entrada. Si las
   líneas se desplazan después, se corrigen al tocar la entrada; no se borra la referencia.
5. **Cerrar es explícito**: `Estado` pasa a `cerrada (AAAA-MM-DD)` con una línea en *Notas*
   diciendo qué se hizo. Las entradas cerradas **no se borran**.

## Formato

```markdown
## CI-NNN · <título corto en imperativo>

| Campo | Valor |
|---|---|
| **Identificador** | CI-NNN |
| **Archivo:línea** | `ruta/archivo.ts:NN` |
| **Síntoma** | qué se observa o se observará, en términos verificables |
| **Causa** | por qué ocurre |
| **Resolución** | qué hay que hacer, concreto y accionable |
| **Dueño** | rol o persona · **obligatorio** |
| **Fecha objetivo** | AAAA-MM-DD, o condición explícita · **obligatorio** |
| **Estado** | abierta · en curso · cerrada (AAAA-MM-DD) |
| **Origen** | qué lote, ambigüedad o revisión la detectó |

**Notas:** contexto, enlaces a § de los documentos, decisiones relacionadas.
```

---

## CI-001 · Referenciar `tipo_propiedad` por FIELD_ID, no por nombre

| Campo | Valor |
|---|---|
| **Identificador** | CI-001 |
| **Archivo:línea** | `lib/solicitudes.ts:196` · `lib/solicitudes.ts:284` |
| **Síntoma** | El cliente Airtable pide y mapea el campo por su nombre literal `'tipo_propiedad'`. Hoy funciona porque sólo lee `TX_Solicitudes`. Cuando RF-TAS-06 cruce `D_TipoDocumento` —que tiene un campo con **el mismo nombre y otro significado** (`fldIfdcjsr8KeNRCx`, condición de la propiedad, no clase de inmueble)— la referencia por nombre deja de identificar unívocamente el campo y el error será silencioso: no falla, devuelve el dato equivocado. |
| **Causa** | Airtable admite el mismo nombre de campo en tablas distintas. `§17` de `docs/schema-airtable.md` ya recomendaba preferir FIELD_ID ante riesgo de colisión, pero como recomendación, no como obligación; y el riesgo no estaba documentado cuando se escribió este código. |
| **Resolución** | Sustituir los dos literales por una constante FIELD_ID nombrada según el alias del registro §22: `tipoPropiedad` → `fld701TB0LXovvQmt`. Ubicar las constantes en un módulo único de mapeo de campos y hacer que `lib/solicitudes.ts` las importe. Al hacerlo, revisar si `tipoPropiedadNuevoUsado` (`fldHxx1P1ao33PWrl`) necesita el mismo tratamiento en los archivos que hoy lo consumen. |
| **Dueño** | Mantenedor de `lib/solicitudes.ts` |
| **Fecha objetivo** | **Condicional a RF-TAS-06**, dependiente de **P-5**. No hay fecha de calendario: la corrección se agenda cuando P-5 quede resuelto y RF-TAS-06 entre a implementación. Si RF-TAS-06 se adelanta, esta entrada pasa a bloqueante de esa RF. |
| **Estado** | abierta |
| **Origen** | Lote 3 del sync IF-Tasador v1.9.3 · ambigüedad **A-05** (colisión de nombre en `tipo_propiedad`) |

**Notas:**

- El registro de alias está en `docs/schema-airtable.md` §22; la regla de uso en código, en §22.3.
- Los tres campos implicados y sus FIELD_ID están verificados vía MCP contra la base
  `app9G7lLkIV3CpeLa` el 25-jul-2026. No derivar ninguno de un documento sin comprobarlo.
- **Esta entrada no cubre el problema de dominio.** `condicionPropiedadAplicable` está en
  femenino (`nueva · usada · ambas`) y `tipoPropiedadNuevoUsado` en masculino
  (`nuevo · usado`); RF-TAS-06 los compara y hoy nunca coinciden. Eso es el punto abierto
  **P-5** del spec v1.9.4 §2.15, se resuelve en Airtable y **no** es trabajo de código.
  Arreglar CI-001 sin resolver P-5 deja el sheet documental igualmente vacío.
- No hay cambio de código pendiente por los alias en sí: `tipoPropiedad` y
  `tipoPropiedadNuevoUsado` ya son los nombres que el código usa. Lo que cambia es **cómo se
  referencia el campo en Airtable**, no cómo se llama en TypeScript.

---

## CI-002 · Reparar el disparo del webhook de RF-09 desde `AT-RF09-Trigger`

| Campo | Valor |
|---|---|
| **Identificador** | CI-002 |
| **Archivo:línea** | `docs/_artefactos/make/SC-RF09-ExtraccionClaude.blueprint.json` · automation Airtable `AT-RF09-Trigger` (`wflIEucD1MxxcNXH8`, trigger `wtr5sCMV64XqK73LM`) |
| **Síntoma** | Cada `recordCreated` en `TX_Adjuntos` (`tblur71x1oItbmKZc`) dispara `AT-RF09-Trigger`, pero el webhook falla al ejecutarse. `LogEscenarios` registra `Escenario = SC-RF09-ExtraccionClaude`, `Estado = ✗ Error`, `Trigger = AT-RF09-Trigger`, `Titulo Log = «error al disparar webhook»`. Consecuencia observable: `TX_Adjuntos.estado_extraccion` (`fld54epvDJ7YdJIYD`, singleSelect `idle · extrayendo · listo · error · skipped · no_corresponde · delegado_visador`) queda sin poblar en todo adjunto nuevo. **No bloqueante**: los cinco casos de Tanda 3 —alta, reemplazo, `reused`, borrado y modo consulta RN-59— pasaron en verde con este fallo activo. |
| **Causa** | Sin diagnosticar. La automation está `deployed` y su trigger dispara correctamente —hay dos filas de log que lo prueban—, así que el fallo está aguas abajo: en la URL a la que apunta el `customScript` del nodo `wacv6uOCeceiCcmg5`, o en el escenario Make `SC-RF09-ExtraccionClaude` que lo recibe. No se investigó durante Tanda 3 por estar fuera de alcance. |
| **Resolución** | (1) Abrir el historial de ejecución de `AT-RF09-Trigger` en la UI de Airtable y leer el error real del script — el MCP no expone logs de automation, así que este paso es manual. (2) Contrastar la URL del script contra `MAKE_WEBHOOK_URL_RF09` en Railway y en `.env.local`. (3) Verificar que el escenario `SC-RF09-ExtraccionClaude` esté activo en Make y que su hook coincida. (4) Reprobar creando un adjunto y comprobando que `estado_extraccion` pasa de vacío a `extrayendo` y luego a `listo`. |
| **Dueño** | Sergio |
| **Fecha objetivo** | **Condicional a la apertura de la tanda de RF-09** (extracción con Claude API). No bloqueante para CU-002: RF-09 no es precondición de ninguno de los RF de IF-02 ya entregados. |
| **Estado** | abierta |
| **Origen** | Tanda 3 · paso 5, casos (a) y (b) · sesión del 06-ago-2026 |

**Notas:**

- **Ocurrencias confirmadas: 2**, ambas sobre `VP-2026-0053` (`recIEvKCbe7J8TDaB`) y ambas con el mismo `Titulo Log`:
  - `2026-08-06T19:09:09Z` — alta de `prueba-descartable.pdf` (setup del caso (a)).
  - `2026-08-06T21:24:55Z` — reemplazo por `prueba-B.pdf` (caso (b)).
- **Consecuencia de coste, no sólo de datos.** `SC-Adjuntos-Upload v1.2` resuelve el reemplazo con **delete + insert**, no con update: en (b) el record ID pasó de `recHCYsJOXpT21uUW` a `reclS1NggjitW1JqM`. Como `AT-RF09-Trigger` escucha `recordCreated`, **cada reemplazo relanza la extracción** y por tanto consume API de Claude. Hoy el efecto está enmascarado porque el disparo falla; al arreglar CI-002 el coste aparece. Conviene decidir entonces si la extracción debe re-ejecutarse ante un reemplazo o sólo ante un alta.
- La ruta `reused` **no** dispara la extracción, porque no crea fila. Verificado en el caso (d): cero filas nuevas en `TX_Adjuntos` y ningún registro de RF-09.
- **Referencia cruzada:** `docs/aprendizajes.md`, entrada del **2026-08-06** «Cierre del paso 5 de Tanda 3…», bloque **«Pendiente abierto · RF-09 falla sistemáticamente al dispararse»**. Esa entrada conserva el contexto de la sesión; ésta es la ficha rastreable.
- **Sobre el alcance de este registro.** La cabecera de este archivo (§«Alcance», líneas 16-19) lo acota a divergencias **documento ↔ código de producción**, y CI-002 es un fallo de runtime en una automation de Airtable más un escenario Make, sin `archivo.ts:línea` que abrir. Se registra aquí igual, **por decisión explícita de Sergio el 06-ago-2026: excepción aceptada y registrada**, para que el pendiente sea rastreable desde el índice de deudas en vez de vivir sólo dentro de una entrada de bitácora. Sigue el precedente de las líneas 28-31, donde ya se pospuso una decisión de alcance análoga para el caso doc-vs-doc. **Si aparece una tercera entrada de esta naturaleza —runtime de Airtable/Make sin `archivo.ts:línea`—, revisar el alcance formal del archivo** en vez de seguir acumulando excepciones caso a caso.

---

## CI-003 · Estructura de path Dropbox: spec v1.9.6 vs implementación viva

| Campo | Valor |
|---|---|
| **Identificador** | CI-003 |
| **Archivo:línea** | `docs/_artefactos/make/SC-Adjuntos-Upload.blueprint.json:1005` y `:1829` (eran `:1001` y `:1825` antes del cierre; hoy ya consumen `{{1.dropbox_path}}`) · `docs/_artefactos/produccion-actual/SC-Adjuntos-Upload-v1.1-PRODUCCION.blueprint.json:792` (registro histórico, **no se toca**) · `lib/adjuntos.ts:59` (comentario) · `docs/_notas/checklist-P9-manual.md:64` |
| **Síntoma** | El spec normativo describe desde v1.9.6 la ruta `/Test_ValueProperty/INFORMES_{AAAA}/{Cliente}/{codigo_solicitud}/{Unidad}/…` (§8.1), mientras que el escenario `SC-Adjuntos-Upload` activo en producción y el helper `lib/adjuntos.ts` producen y consumen `/VProperty/Tasaciones/{codigo_ext}/…`. Todo archivo subido hoy queda fuera de la estructura normativa. También quedaba fuera de la estructura de v1.9.5 (`/VProperty/{ClienteSlug}/{AAAA}/{codigo}/{subcarpeta}/`): la divergencia es anterior al bump, que sólo la hace explícita. |
| **Causa** | La ruta de producción nunca implementó la estructura §8.1 de ninguna versión del spec: el mapper del módulo Dropbox se escribió con un path plano por código de solicitud y así quedó. La reestructuración de v1.9.6 es 100% documental por decisión de alcance de la tanda —no se toca código ni blueprints—, de modo que la brecha se amplía en vez de cerrarse. |
| **Resolución** | (1) Decidir el momento de la migración y su alcance: sólo archivos nuevos, o también reubicación del histórico. (2) Cambiar el mapper `path` de los módulos Dropbox de `SC-Adjuntos-Upload` para componer los cinco segmentos, lo que exige que el payload del webhook incluya cliente, año y unidad —hoy sólo viaja `codigo_ext`. (3) Alinear `SC-Adjuntos-Delete` y `SC-RF09-ExtraccionClaude`, que leen `url_dropbox` y no componen path, por lo que probablemente no requieran cambio. (4) Fijar `fecha_corte` en el criterio de aceptación de RF-51 (§8.3), hoy pendiente. (5) Actualizar el comentario de ejemplo de `lib/adjuntos.ts:59`. |
| **Dueño** | Sergio |
| **Fecha objetivo** | Tanda futura, sin fecha comprometida. No bloqueante: los archivos actuales se guardan y recuperan correctamente; lo que falla es la conformidad con la norma, no la operación. |
| **Estado** | **cerrada (2026-08-07)** — implementada en la tanda CI-003, commit `<pendiente>` |
| **Origen** | Tanda documental de reestructuración de path Dropbox · sesión del 06-ago-2026 |

**Cierre (2026-08-07).** Los cinco puntos de *Resolución*, uno por uno:

1. **Momento y alcance de la migración** — sólo archivos nuevos. Cero reubicación de
   histórico: las solicitudes anteriores al 06-ago-2026 quedan *grandfathered* por la
   cláusula de corte de RF-51 §8.3 y sus adjuntos siguen resolviéndose por `url_dropbox`.
   Corte limpio, sin coexistencia: desde este commit **toda** subida usa la plantilla nueva,
   incluidas las que se hagan sobre una solicitud vieja —que por tanto puede acabar con
   archivos en las dos estructuras—.
2. **Composición de los cinco segmentos** — **no** se hizo en el mapper de Make sino en
   Next.js (`lib/dropbox-path.ts`), que ya tiene el token de Airtable server-side y donde la
   regla es testeable sin red. Make pasa a transportista puro: `SC-Adjuntos-Upload v1.3`
   consume `{{1.dropbox_path}}` del payload en vez de armar el path. Es la alternativa que la
   nota de esta misma entrada proponía evaluar, y resuelve de paso lo que la nota anterior
   señalaba como no derivable desde Make con el payload de v1.1.
3. **`SC-Adjuntos-Delete` y `SC-RF09-ExtraccionClaude`** — confirmado que **no requieren
   cambio**: los dos leen `url_dropbox` y ninguno compone path. No se tocaron.
4. **`fecha_corte` de RF-51 §8.3** — ya estaba fijada en `2026-08-06` America/Santiago por la
   tanda documental del 06-ago-2026. No se toca el spec desde aquí.
5. **Comentario de ejemplo de `lib/adjuntos.ts:59`** — actualizado al path nuevo, con la nota
   de que el path viejo sigue siendo lo que devuelven los adjuntos *grandfathered*.

**Lo que este cierre NO resuelve** (y por qué no reabre la entrada):

- **CI-004 sigue abierta**, como corresponde: el path es un snapshot inmutable y ahora que el
  segmento `{Unidad}` existe de verdad, la divergencia que describe deja de ser teórica.
- **El selector de unidad del checklist (§9.1 caso b) queda pendiente**, en tanda propia. El
  backend auto-deriva la unidad cuando la solicitud tiene una sola —el caso mayoritario— y,
  desde **CI-003b (07-ago-2026)**, **rechaza la subida con 422 `unidad_no_especificada`**
  cuando tiene dos o más. La primera versión de este cierre mandaba esos adjuntos a `comun/`
  con un warning; el panel lo revirtió antes del commit por ocultar la deuda de UX. Mientras
  el selector no exista, subir un documento a una solicitud multi-unidad no es posible desde
  el checklist: es una limitación visible y con fecha, no un archivo mal guardado para
  siempre.
- **La convención de naming de archivo de §8.1**
  (`{tipo}__{AAAAMMDD-HHMMSS}__{nombre_saneado}`) sigue sin implementarse: Make sube con el
  nombre original. CI-003 era sobre el path; el naming es una divergencia distinta y, si se
  quiere rastrear, corresponde una entrada nueva.

**Notas:**

- La composición del path nueva **no es derivable desde Make con el payload actual**. `{Cliente}` exige leer `M_Clientes.nombre` a través del link `TX_Solicitudes.cliente` y normalizarlo (§8.5); `{AAAA}` exige convertir `fecha_solicitud` a America/Santiago; `{Unidad}` exige resolver `TX_Adjuntos.unidad` y aplicar el sufijo `_{numero_unidad}` sólo si hay dos o más unidades del mismo subtipo en esa solicitud. Ese último punto obliga a contar unidades hermanas antes de decidir el nombre de la carpeta: es un módulo de búsqueda adicional, no una fórmula.
- Alternativa a evaluar en la tanda de migración: componer el path completo en el Route Handler (`app/api/adjuntos/upload/route.ts`), que ya tiene acceso a Airtable server-side, y enviarlo a Make como un campo más del webhook. Deja Make como transporte tonto y concentra la regla de §8.5 en un único lugar testeable.
- **Relación con CI-004**: CI-003 es la brecha entre norma e implementación; CI-004 es una divergencia que aparecerá *después* de cerrar CI-003. Arreglar CI-003 sin resolver CI-004 deja paths correctos en el momento de la subida que envejecen mal.

---

## CI-004 · Divergencia path/subtipo tras edición de TX_Unidades

| Campo | Valor |
|---|---|
| **Identificador** | CI-004 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_7.md` §8 (nota de diseño) y §8.2 (campo `dropbox_path`) · afecta a la futura implementación del path de §8.1 |
| **Síntoma** | El segmento `{Unidad}` del path Dropbox deriva de `TX_Unidades.subtipo` (`fldNU8ee30AvvRWHZ`, singleSelect editable). Si la Ejecutiva corrige el subtipo de una unidad después de haber subido adjuntos —algo permitido mientras la solicitud está en estado `creada`, RN-59—, el binario **no se mueve** y `TX_Adjuntos.dropbox_path` deja de coincidir con el estado vigente de la unidad. La divergencia es silenciosa: no hay error, no hay aviso, y el archivo sigue descargándose bien. Aparece sólo en la auditoría de path de RF-51, como un archivo en una carpeta que no corresponde a ninguna unidad actual de la solicitud. |
| **Causa** | Hasta v1.9.5 los cuatro segmentos del path derivaban de datos inmutables una vez creada la solicitud (cliente, año, código). El nivel Unidad introducido en v1.9.6 es el primer segmento que depende de un campo editable. Se decidió declarar `dropbox_path` como snapshot inmutable en vez de reubicar el binario: mover el archivo invalidaría el `url_dropbox` ya persistido y ya entregado en la UI y en los correos, y exigiría un módulo Dropbox de movimiento no probado en la instancia Make del proyecto —el mismo tipo de apuesta que causó E-026 y el incidente de `dropbox:deleteAFile` de Tanda 3. |
| **Resolución** | Opciones, a decidir cuando se implemente el path de §8.1 (CI-003): (a) dejarlo como está y que la auditoría de RF-51 tolere el caso, tratando el path como histórico; (b) añadir a la auditoría un reporte de divergencias path↔subtipo que la Ejecutiva pueda revisar, sin mover nada; (c) bloquear la edición de `subtipo` una vez que la unidad tiene adjuntos, empujando la corrección a borrar y recrear el adjunto; (d) implementar la reubicación real, previa verificación de que existe un módulo Dropbox de movimiento en la instancia —exportar un escenario-probe antes de escribir el blueprint. |
| **Dueño** | Sergio |
| **Fecha objetivo** | Junto con CI-003. Hoy es teórico: mientras la implementación produzca `/VProperty/Tasaciones/{codigo_ext}/…` no hay segmento de unidad que pueda divergir. |
| **Estado** | abierta |
| **Origen** | Tanda documental de reestructuración de path Dropbox · sesión del 06-ago-2026 · decisión D12 |

**Notas:**

- **Actualización 2026-08-07 — deja de ser teórica.** Al cerrarse CI-003, la implementación ya
  produce el segmento `{Unidad}`, así que la divergencia que esta entrada describe puede
  ocurrir de verdad: basta con corregir `TX_Unidades.subtipo` después de subir un adjunto. La
  *Fecha objetivo* «junto con CI-003» queda vencida y la entrada sigue **abierta** con las
  cuatro opciones (a)-(d) intactas. Matiz que reduce la exposición inmediata: mientras el
  checklist no capture la unidad, el backend sólo produce segmento de unidad real cuando la
  solicitud tiene **una sola** unidad —con dos o más rechaza la subida, CI-003b—, y ese caso
  de una unidad es también donde menos se corrige el subtipo. La ventana existe igual.
- **El ordinal como desambiguador agrava esta entrada, y por eso es el último recurso.** La
  cascada de CI-003b —`numero_unidad` → `rol_sii` → ordinal— antepone dos identificadores
  intrínsecos precisamente porque el ordinal es posicional: agregar o borrar una unidad
  hermana corre el de las demás y desalinea paths ya escritos, que es esta misma divergencia
  por una segunda vía. El warning del tercer escalón es la señal de que hay dato maestro que
  poblar.
- El mismo razonamiento aplica, con menor probabilidad, a `{Cliente}`: si se corrige `M_Clientes.nombre` o se reasigna `TX_Solicitudes.cliente`, el path también envejece. Y a `_ingreso/`, por diseño: esos archivos se quedan ahí para siempre aunque después se declaren unidades (§1.5.3).
- La opción (c) tiene un efecto lateral que conviene medir antes de elegirla: obligaría a rehacer la subida de un documento por corregir un dato de la unidad, justo en el estado del flujo donde más se corrigen datos.
- **Ambas entradas nuevas de esta sesión (CI-003, CI-004) son divergencias doc↔código en el sentido estricto del alcance de este archivo** —hay blueprint y hay `lib/adjuntos.ts`—, a diferencia de CI-002, que se aceptó como excepción. No abren la discusión de alcance pospuesta en las líneas 16-31.

---

## CI-005 · Alinear el reloj del SLA con §5.2: hoy arranca en la visita, no en el ingreso

| Campo | Valor |
|---|---|
| **Identificador** | CI-005 |
| **Archivo:línea** | `TX_Solicitudes.semaforo_sla` (`fldW4oUq7LvQUZq7W`, fórmula Airtable) y `TX_Solicitudes.fecha_limite_entrega` (`fldoT1LOSgVRo32TC`) · consumidores en `lib/solicitudes.ts` y la vista "SLA en riesgo" |
| **Síntoma** | La spec v1.9.7 §5.2.2 fija el inicio del SLA en la recepción del correo por Control y Seguimiento, y §5.2.4 define siete etapas medidas en horas hábiles. La base real mide otra cosa: `semaforo_sla` cuenta días desde `{fecha_visita}` y `fecha_limite_entrega = DATEADD({fecha_visita}, 2, 'days')`. Una solicitud puede estar semanas entre `creada` y visitada sin SLA que la mida, sin aparecer en "SLA en riesgo" y sin poder priorizarse por urgencia. |
| **Causa** | El modelo implementado nunca se definió por escrito: se construyó midiendo la entrega del informe posterior a la visita, que era el tramo que la operación controlaba en planilla. §5.2 es la primera especificación formal del reloj completo, y llega después de la implementación. |
| **Resolución** | Por etapas, ninguna trivial: (1) poblar `C_SLA` —hoy tiene una sola fila, `SLA_METLIFE_Refinanciamiento`, con los links `cliente`/`tipo_informe`/`tipo_propiedad` vacíos— y elegir entre las dos familias de campos duplicadas (`dias_totales`/`dias_alerta_amarilla`/`dias_alerta_roja` vs `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido`), borrando la que no gane; (2) crear los timestamps de entrada y salida por etapa en `TX_Solicitudes`, que no existen; (3) implementar el cómputo sobre ventana hábil 9:00–18:00 L-V con feriados, que ninguna fórmula Airtable resuelve sola —`WORKDAY` opera en días, no en horas—; (4) decidir la UI de los dos semáforos convivientes (ver nota en `docs/diseno.md` §3). El paso (1) es prerrequisito de todo lo demás y es de negocio, no técnico. |
| **Dueño** | Sergio (coordinación) · Héctor + Óscar para poblar `C_SLA` · Arquitecto de Datos para los timestamps por etapa |
| **Fecha objetivo** | Sin fecha — depende de que se priorice el RF. Condición de arranque: `C_SLA` poblada con al menos los pares (cliente, tipo_informe) vigentes. |
| **Estado** | abierta |
| **Origen** | Auditoría documental del 08-ago-2026, al contrastar §5.2 (nueva en v1.9.7) contra `docs/_notas/20260729-modelo-sla-pendiente.md`. |

**Notas:**

- **La decisión de negocio ya está tomada; lo que falta es construir.** `20260729-modelo-sla-pendiente.md` planteaba tres opciones y cuatro preguntas para Héctor. Las cuatro están respondidas en §5.2 y la nota lleva el bloque de cierre correspondiente. Esta entrada existe porque responder no es implementar.
- **Lo elegido no es exactamente ninguna de las tres opciones de aquella nota.** Se parece a (c) *dos relojes* —el agregado de `C_SLA` sobrevive y se le suma el reloj por etapa—, pero el reloj nuevo mide las siete etapas completas sobre calendario hábil, no sólo el tramo ingreso → visita. La objeción de (b) sobre recalcular retroactivamente las ~54 filas históricas **no aplica**: la matriz por etapa es aditiva y no toca `semaforo_sla`.
- **El `#ERROR` en altas nuevas es un síntoma distinto y tiene arreglo propio.** `DATETIME_DIFF` sobre `{fecha_visita}` vacía da error, no cero. La fórmula de reemplazo está escrita y probada en `docs/_notas/20260729-fix-semaforo-sla.md`; requiere edición manual en la UI de Airtable porque el MCP no modifica fórmulas. Es cosmético y no bloquea esta entrada, pero conviene aplicarlo antes de tocar el modelo, para no mezclar dos cambios en la misma fórmula.
- **Los literales del semáforo son una tercera cosa.** La fórmula emite `VENCIDO` / `EN RIESGO` / `OK` / `Entregado`, no los colores; `docs/construccion.md` §5 documentaba un filtro por igualdad contra `"rojo"`/`"ambar"` que devolvía cero filas y quedó corregido en esta tanda. El código ya buscaba por subcadena desde la Tanda D-01.
- Relación con **CI-007**: el cómputo hábil de §5.2.1 depende de la tabla de feriados, cuyo nombre diverge entre spec y base real.

---

## CI-006 · Alias RF-09: extracción documental vs acceso autenticado

| Campo | Valor |
|---|---|
| **Identificador** | CI-006 |
| **Archivo:línea** | `CLAUDE.md` (múltiples) · `README.md:20,22,39` · `app/api/extraccion/iniciar/route.ts` · `TX_Adjuntos.estado_extraccion` · `docs/_artefactos/make/SC-RF09-ExtraccionClaude.blueprint.json` |
| **Síntoma** | Cualquier búsqueda por "RF-09" es ambigua sin contexto. La spec v1.9.7 define **RF-09 como "Acceso autenticado a sus solicitudes"** (IF-03, línea 1926) y llama **SC07** al escenario de extracción con Claude API (§4). El repositorio usa "RF-09" para el escenario de extracción, y `CLAUDE.md` llega a prohibir explícitamente el nombre que la spec afirma: *"No usar el código «SC07» para RF-09"* frente a *"se materializa en el escenario Make SC07 que llama a Claude API"*. |
| **Causa** | Numeración local del repo IF-02 acuñada antes de que §4 de la spec consolidara el vocabulario, y nunca reconciliada. Ambos identificadores quedaron en uso simultáneo con significados distintos. |
| **Resolución** | Decisión de panel del 08-ago-2026: **opción (c), documentar el alias sin renombrar en ninguno de los dos lados.** Renombrar en el repo tocaría rutas, nombres de blueprint y un campo de Airtable —coste alto, riesgo de regresión, y fuera del alcance de una tanda documental—; renombrar en la spec la haría contradecirse consigo misma en §4 y §1926. Mientras el alias exista, usar **`RF-09-spec`** (acceso autenticado, IF-03) y **`RF-09-repo`** (extracción documental) cuando la distinción importe. Alinear el vocabulario en el próximo bump normativo. |
| **Dueño** | Sergio |
| **Fecha objetivo** | Próximo bump de la spec (v1.9.8 o superior) |
| **Estado** | abierta |
| **Origen** | Auditoría documental del 08-ago-2026 · ambigüedad A del informe de Fase 4. |

**Notas:**

- **No es un bug: es deuda de vocabulario.** Nada falla hoy por esto. El riesgo es de lectura —alguien busca "RF-09", encuentra la definición equivocada y construye sobre ella—, y crece a medida que entra gente nueva al proyecto.
- La prohibición de `CLAUDE.md` (*"SC07 queda reservado para IF-03 post-visita"*) **se deja intacta a propósito**: refleja una decisión operativa real del repo. Corregirla en esta tanda habría sido alinear el repo a la spec por la vía de romper una instrucción vigente de trabajo, que es exactamente lo que la opción (c) evita.

---

## CI-007 · Nombre de la tabla de feriados: la spec dice `H_Feriados`, la base real es `C_Feriados`

| Campo | Valor |
|---|---|
| **Identificador** | CI-007 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_7.md` (8 apariciones, incluidas §5.2, §5.2.1 y el glosario) vs `docs/schema-airtable.md:51` |
| **Síntoma** | Quien lea la spec y vaya a Airtable a buscar `H_Feriados` no la encuentra. La tabla real es **`C_Feriados`** (`tblJVh2kPd4uMgxpb`), poblada y bien estructurada (`fecha`, `es_irrenunciable`, `activo`, `anno`). El `Blueprint de Interfaces v2.10` arrastra el mismo nombre incorrecto. |
| **Causa** | El nombre `H_Feriados` viene del diseño de la Capa de Datos, que la ubicaba en el dominio histórico `H_`. Al crearse en la base real quedó en el dominio de configuración `C_`, que es donde corresponde por naturaleza —es un catálogo paramétrico, no un histórico—, y la spec nunca se actualizó. |
| **Resolución** | Corregir la **spec** en el próximo bump: `H_Feriados` → `C_Feriados` en las 8 apariciones. **Gana la tabla real**, porque renombrarla en Airtable rompería la implementación y además el nombre real es el correcto por dominio. No se toca la spec en esta tanda por decisión explícita: un rename de 8 puntos en el documento normativo merece su propio bump con changelog, no un parche dentro de una auditoría. |
| **Dueño** | Sergio |
| **Fecha objetivo** | Próximo bump de la spec (v1.9.8 o superior) |
| **Estado** | abierta |
| **Origen** | Auditoría documental del 08-ago-2026 · ambigüedad B del informe de Fase 4. |

**Notas:**

- **Sube de prioridad desde v1.9.7.** Mientras la spec sólo mencionaba feriados de pasada en RN-04, el nombre equivocado era una molestia. §5.2.1 lo convierte en dependencia del cómputo hábil de todo el SLA operacional, y §5.2 declara explícitamente que "H_Feriados sigue siendo la fuente única de feriados para ambos cómputos". Esa frase apunta a una tabla que no existe.
- Al corregir, revisar también `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md:2545`, que repite el error. Es fuente canónica importada y no se edita desde este repo: corresponde reportarlo aguas arriba.
- Prerrequisito implícito de **CI-005**: no se puede implementar la ventana hábil de §5.2.1 sin resolver contra qué tabla se leen los feriados.

---

## CI-008 · `docs/schema-airtable.md` no tiene `C_SLA_Etapas` ni los 21 campos `sla_` que el código ya referencia

| Campo | Valor |
|---|---|
| **Identificador** | CI-008 |
| **Archivo:línea** | `docs/schema-airtable.md` (sin ninguna aparición de `sla_e`, `sla_etapa`, `sla_semaforo`, `sla_recalculado`, `sla_pausa` ni `C_SLA_Etapas`) vs `lib/sla-etapas.ts:60-83` (`FIELD_IDS_SLA`, 21 entradas) y `lib/solicitudes.ts:390-410` (5 FIELD_IDs literales en `SOLICITUD_FIELDS`) |
| **Síntoma** | El snapshot de schema que `CLAUDE.md` declara fuente para derivar tipos TS y Route Handlers no conoce la tabla `C_SLA_Etapas` (`tbl05zu5RLhH3u6pl`) ni los 21 campos `sla_*` de `TX_Solicitudes`. Quien derive un tipo o escriba un handler siguiendo ese archivo no encuentra los campos, y quien busque el FIELD_ID de `sla_etapa_vence_ts` para no romper una lectura tiene que ir al código o a Airtable. La divergencia es de **omisión**, no de contradicción: nada de lo que el archivo dice es falso. |
| **Causa** | El paso **A-6** de la Tanda A de §9.6 (*"Actualizar `docs/schema-airtable.md` con la tabla nueva y los 21 campos, con sus `tbl…`/`fld…` reales"*) no se ejecutó cuando se ejecutó el resto de la Tanda A el 10-ago-2026. El plan lo declaraba explícitamente como excepción —el único ítem de su tabla de impacto que **no** quedaba diferido—, y aun así quedó fuera del pase. |
| **Resolución** | Agregar a `docs/schema-airtable.md`: (1) la tabla `C_SLA_Etapas` (`tbl05zu5RLhH3u6pl`) con sus 8 campos y las 7 filas sembradas; (2) los 21 campos `sla_*` de `TX_Solicitudes` con FIELD_ID, tipo y —en los 18 `dateTime`— la `timeZone`; (3) los 3 campos nuevos de `C_SLA` (`sla_revision_horas` `fldyi1guWZwwhvbkF`, `matriz_etapas`, `activo_desde`). **Los datos ya están verificados y no hay que volver a levantarlos**: la verificación V1/V2 del 10-ago-2026 contra `GET /v0/meta/bases/.../tables` devolvió los 21 campos con cero divergencias contra el código y los 18 `dateTime` en `America/Santiago`. **No se rehace la Tanda A**: el esquema está bien creado; lo que falta es documentarlo. |
| **Dueño** | Claude Code (ejecución) · Sergio (visto bueno) |
| **Fecha objetivo** | Condicional a la **Tanda D de §9.6.2**, en su mismo lote: D-1 y D-4 derivan tipos de estos campos y son los primeros consumidores de UI, así que es el punto en que la omisión empieza a costar. |
| **Estado** | abierta |
| **Origen** | Cierre de la **Tanda C de §9.6** (10-ago-2026), al ejecutar las verificaciones V1/V2/V3 contra la REST API de Airtable. |

**Notas:**

- **Es doc-vs-código y por eso entra acá, no en `_ambiguedades.md`.** `CLAUDE.md` §*Cosas que Claude Code SÍ debe hacer* nombra a `docs/schema-airtable.md` como la fuente de la que se derivan los tipos; el código de producción ya referencia 21 campos que esa fuente no lista. No es una discrepancia entre dos documentos.
- **La Tanda C no quedó bloqueada por esto y por una razón concreta:** los FIELD_IDs se tomaron de `FIELD_IDS_SLA` (`lib/sla-etapas.ts`), que la Tanda B había fijado desde el pase MCP, y la verificación V1 los confirmó uno a uno contra el schema vivo. La deuda es de legibilidad y de siguiente-sesión, no de corrección.
- **Verificación V3: tres de los cuatro literales ya observados en vivo, y no es parte de esta entrada.** Antes del backfill, las 39 filas devolvían `sla_semaforo_etapa = "sin_dato"` con `sla_etapa_actual` vacío. Tras ejecutar **A-5** el 10-ago-2026, el conjunto observado sobre las mismas 39 filas es `['rojo', 'verde']` — 38 y 1 respectivamente. Suman `sin_dato`, `rojo` y `verde`: tres de los cuatro literales del contrato de M-13, todos en minúscula y sin adornos. Falta **`ambar`**, que no aparece por causa aritmética y no por defecto de la fórmula —requiere `NOW()` entre `sla_etapa_alerta_ts` y `sla_etapa_vence_ts`, ventana de 1 h en e1 y de 2 h en e2 sobre una cartera cuyos vencimientos son todos pasados salvo uno—, y queda para el E2E de la Tanda G. Si al observarlo apareciera cualquier otra cadena, es **RO-13** y se registra como entrada propia.
- Relación con **CI-005**: esta entrada no la cierra ni la afecta. CI-005 es que el reloj mide desde la visita; ésta es que el schema nuevo no está documentado.

---

## CI-009 · `fecha_asignacion_ts` huérfano en VP-2026-0043: timestamp de asignación sin estado que lo respalde

| Campo | Valor |
|---|---|
| **Identificador** | CI-009 |
| **Archivo:línea** | Airtable `TX_Solicitudes` · registro `recga8JAig4wiyFwb` (`VP-2026-0043`) · campo `fecha_asignacion_ts` (`fldf8BS8nv2vtOmu0`) vs `app/api/solicitudes/[id]/asignar/route.ts` (guard 409) |
| **Síntoma** | `VP-2026-0043` tiene `fecha_asignacion_ts = 2026-07-25T04:00:00.000Z` y, al mismo tiempo, `estado = creada`, `tasador` vacío, `visador` vacío y `fecha_visita_programada` vacía. Es la **única** fila de las 39 con ese campo poblado —las 9 solicitudes realmente asignadas usan el `fecha_asignacion` deprecado (§21.4-d) y tienen el `_ts` vacío—. Cualquier lógica que infiera "fue asignada" desde `fecha_asignacion_ts` la clasifica mal: el backfill A-5 leído al pie de la letra la habría movido a etapa 2 y habría dejado en etapa 1 a las 9 asignadas de verdad. |
| **Causa** | No determinada con evidencia. La hipótesis compatible con las fechas es una prueba parcial de `SC-Asignar` o de `SC-Edicion` entre el 24 y el 25-jul-2026 que escribió el timestamp sin completar la transición de estado —el escenario escribe `estado`, `tasador` y `fecha_asignacion` en un solo update, así que un update parcial deja exactamente esta huella—. No hay registro en `LogEscenarios` que lo confirme, y por eso se registra como divergencia observada, no como causa establecida. |
| **Resolución** | Decidir cuál de las dos cosas es verdad y dejar la fila consistente: (a) si la solicitud nunca se asignó —lo que el resto de sus campos indica—, **vaciar `fecha_asignacion_ts`**; o (b) si sí se asignó, completar `tasador`, `visador`, `fecha_visita_programada` y `estado = asignada`, y re-correr `scripts/backfill-sla-a5.ts --force` sobre esa fila para que cierre e1. **La opción (a) es la que el dato respalda.** Revisar además `A_Eventos` de esa solicitud antes de decidir: si hay evento de asignación, la lectura cambia. |
| **Dueño** | Sergio (decisión de dato) · Claude Code (ejecución del PATCH) |
| **Fecha objetivo** | Condicional a la **Tanda G de §9.6.2** (QA end-to-end), en su paso G-1 de preparación del juego de datos: es el punto en que la cartera tiene que estar limpia para que los nueve casos de §9.6.3 sean legibles. |
| **Estado** | abierta |
| **Origen** | Ejecución de **A-5** (backfill SLA) el 10-ago-2026, al contrastar `estado` contra `fecha_asignacion_ts` y `fecha_asignacion` sobre las 39 filas. |

**Notas:**

- **El backfill A-5 no la tocó, y es deliberado.** La decisión de Sergio del 10-ago-2026 fijó que sólo cierra e1 una solicitud en `estado = asignada`. `VP-2026-0043` quedó con `sla_e1_inicio_ts = fecha_solicitud` y etapa 1 abierta, como cualquier otra `creada`. El `_ts` huérfano sigue exactamente donde estaba: esta entrada existe para que no se pierda, no para justificar haberlo pisado.
- **No es CI-005 ni la afecta.** CI-005 es que el reloj mide desde la visita; ésta es una fila con dos campos que se contradicen.
- Relación con el **guard 409** de `asignar/route.ts`: el guard mira `tasador`, no `fecha_asignacion_ts`, así que esta fila **sí** aceptaría hoy una asignación por la UI. No hay bug de bloqueo; hay un dato sucio.
