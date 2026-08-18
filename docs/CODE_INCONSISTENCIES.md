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

### Precisión de alcance (13-ago-2026 · CI-013 a CI-021)

Las entradas CI-013 a CI-021 comparan §2 del spec contra
`docs/_md/Imagenes_IF_Tasador_v4.pdf`. **No son doc-vs-doc**: ese PDF documenta el prototipo
IF-Tasador realmente construido —sus páginas 1 a 16 son la auditoría del código v0, con
`package.json`, árbol de rutas y componentes leídos— y desde v1.9.9 es la fuente de verdad
visual de IF-03. La divergencia que registran es, por tanto, documento ↔ código, que es
justamente el alcance de este archivo.

**Excepción declarada a la regla 1.** Estas nueve entradas ingresan con **Dueño y Fecha
objetivo en blanco**, por instrucción explícita del usuario en la sesión del 13-ago-2026: los
completará él al priorizar la tanda de IF-03. Se deja constancia porque la regla 1 exige lo
contrario y el registro no debe normalizar la excepción: **cualquier entrada posterior vuelve
a exigir ambos campos.**

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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §8 (nota de diseño) y §8.2 (campo `dropbox_path`) · afecta a la futura implementación del path de §8.1 |
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
| **Síntoma** | La spec v1.9.8 §5.2.2 fija el inicio del SLA en la recepción del correo por Control y Seguimiento, y §5.2.4 define siete etapas medidas en horas hábiles. La base real mide otra cosa: `semaforo_sla` cuenta días desde `{fecha_visita}` y `fecha_limite_entrega = DATEADD({fecha_visita}, 2, 'days')`. Una solicitud puede estar semanas entre `creada` y visitada sin SLA que la mida, sin aparecer en "SLA en riesgo" y sin poder priorizarse por urgencia. |
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
| **Síntoma** | Cualquier búsqueda por "RF-09" es ambigua sin contexto. La spec v1.9.8 define **RF-09 como "Acceso autenticado a sus solicitudes"** (IF-03, línea 1926) y llama **SC07** al escenario de extracción con Claude API (§4). El repositorio usa "RF-09" para el escenario de extracción, y `CLAUDE.md` llega a prohibir explícitamente el nombre que la spec afirma: *"No usar el código «SC07» para RF-09"* frente a *"se materializa en el escenario Make SC07 que llama a Claude API"*. |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` (8 apariciones, incluidas §5.2, §5.2.1 y el glosario) vs `docs/schema-airtable.md:51` |
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

---

## CI-010 · Documentar `A_DecisionesMotor` en `docs/schema-airtable.md`

| Campo | Valor |
|---|---|
| **Identificador** | CI-010 |
| **Archivo:línea** | `docs/schema-airtable.md` (sin ninguna aparición de `A_DecisionesMotor` fuera del inventario de tablas, §1 línea 83) vs `lib/decision-motor-airtable.ts:9` y `lib/decision-motor.ts:76-84` |
| **Síntoma** | El snapshot de schema que `CLAUDE.md` declara fuente para derivar tipos TS y Route Handlers lista `A_DecisionesMotor` en el inventario de §1 con su TABLE_ID, pero **no tiene sección de campos**. Quien derive un tipo siguiendo ese archivo no encuentra ni un solo nombre de columna, y quien busque cómo enlazar una decisión con su solicitud tiene que ir al código o a Airtable. Peor: el único documento que sí describe la tabla —`VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md` §A_DecisionesMotor— **nombra tres campos que no existen con ese nombre en la base**: dice `reglas_candidatas` (real: `reglas_candidatas_json`), `resultado_aplicado` (real: `resultado_aplicado_json`) y no menciona `regla_ganadora_nombre`, que sí existe y es el que la UI consume. Seguir la Capa de Datos al pie de la letra produce lecturas que devuelven `undefined` en silencio. |
| **Causa** | La tabla es de AT01 (motor de reglas, §5.1) y hasta la Fase 2 del cableado del Detalle ningún código de IF-02 la leía; nunca entró al snapshot. La divergencia con la Capa de Datos es de evolución: el diseño se escribió antes de que AT01 se implementara y el script añadió los sufijos `_json` al materializar. |
| **Resolución** | Agregar a `docs/schema-airtable.md` una sección `A_DecisionesMotor` (`tbluQQtXUI0Zd8jiN`) con sus **19 campos**, tipo y FIELD_ID. Los datos ya están verificados vía REST el 11-ago-2026 y no hay que volver a levantarlos: `solicitud_codigo` (singleLineText, `fld5Z3JvVTolWSN8P`), `timestamp_decision` (dateTime, `fldg8gpbAUPLXuHyL`), `contexto_json` (multilineText, `fldNuX8o2FakPReqM`), `reglas_candidatas_json` (multilineText, `fldMUJeL18ADtU7EN`), `regla_ganadora_nombre` (singleLineText, `fldVsRgwt8GLs1hI9`), `regla_ganadora_snapshot` (multilineText, `fldXB1cD0EGgugfFL`), `razon_ganadora` (multilineText, `fldSXJDZzyHDMr7Eg`), `resultado_aplicado_json` (multilineText, `fldiI5HnXpPk0Qbu0`), `tiempo_resolucion_ms` (number, `fldquGjcd6mbBOx2l`), `motor_version` (singleLineText, `fldfpjLbPrvi4wyKg`), `notas` (multilineText, `fldw312qMwO5NMMpE`), `solicitud` (multipleRecordLinks, `fldkFJFuyqOIzq9hX`), `regla_ganadora` (multipleRecordLinks, `fldkOrEwKRnRC2tlb`), `clave_natural` (singleLineText, `fldxm3mipC146ISf9`), `timestamp` (dateTime, `fldAFnKQb6pii3dGi`), `reglas_candidatas` (multilineText, `fldDtggjDQjdQeDpm`), `resultado_aplicado` (multilineText, `fldWXaMjdb4N8xmpM`), `clave_decision` (singleLineText, `fldiLIJ3FWQg2KkCL`), `ultima_modificacion` (lastModifiedTime, `fldFABLqBn5lJJsse`). **Anotar explícitamente que el Link `solicitud` está vacío en las 43 filas** y que la clave de join utilizable es `solicitud_codigo` (ver CI-011 y RO-20). Registrar además la divergencia con la Capa de Datos v2.6.5 para que el próximo bump de ese documento la corrija. |
| **Dueño** | Claude Code (ejecución) · Sergio (visto bueno) |
| **Fecha objetivo** | Condicional a la **próxima tanda que toque `docs/schema-airtable.md`**. No bloquea nada: `lib/decision-motor-airtable.ts` ya referencia los campos por nombre verificado y el bloque de la pestaña Datos funciona. La deuda es de legibilidad y de siguiente-sesión. |
| **Estado** | abierta |
| **Origen** | Fase 2 del cableado del Detalle de Solicitud (11-ago-2026), Tarea 5 — al construir el bloque "Decisión del motor de reglas" contra datos reales. |

**Notas:**

- **Es doc-vs-código y por eso entra acá.** `CLAUDE.md` §*Cosas que Claude Code SÍ debe hacer* nombra a `docs/schema-airtable.md` como la fuente de la que se derivan los tipos; el código de producción ya referencia siete campos que esa fuente no lista.
- **Misma clase que CI-008**, que es la omisión de `C_SLA_Etapas` y los 21 campos `sla_`. Se registran por separado porque son tablas distintas y se resuelven en pases distintos, pero conviene cerrarlas en la misma tanda documental.
- Las 43 filas incluyen decisiones de solicitudes antiguas (`ALH-335`, `METLIFE-6283`) junto a las de IF-02 (`VP-2026-0042`). Confirmar que AT01 sigue disparándose con `estado = creada` es trabajo aparte, no de esta entrada.

---

## CI-011 · `A_Cambios` está documentada con campos que no existen en la tabla real

| Campo | Valor |
|---|---|
| **Identificador** | CI-011 |
| **Archivo:línea** | `docs/schema-airtable.md` §10 (`## 10. A_Cambios — campos clave`) vs `lib/historial-airtable.ts:118-137` |
| **Síntoma** | De los **9 campos** que §10 documenta, **2 no existen**, **3 tienen otro nombre o tipo** y **7 campos reales no están documentados**. El más caro es `solicitud` (Link → TX_Solicitudes): §10 lo declara como la FK de la tabla y **no existe ninguna columna Link en `A_Cambios`**. Cualquiera que siga el documento para leer los cambios de una solicitud escribirá un `filterByFormula` sobre un campo inexistente, que Airtable resuelve como vacío: **cero filas, sin error**. Se lee como "esta solicitud no tiene cambios auditados" y sobrevive a la revisión. |
| **Causa** | §10 se escribió desde el diseño de la Capa de Datos, no desde un pase de schema sobre la base. La tabla real se construyó con un modelo genérico —audita varias entidades a la vez, hoy `TX_Solicitudes` y `C_ReglasNegocio`— y por eso referencia el registro con el par `tabla_origen` + `registro_id` en texto plano en vez de con un Link. Nadie contrastó ambos hasta que la pestaña Historial necesitó leer la tabla. |
| **Resolución** | Reescribir §10 desde el schema vivo, verificado vía REST el 11-ago-2026 (14 campos, `tbl6Yd0c7MRqNeC0x`). Divergencia campo por campo: <br>**(a) Documentados que NO existen:** `cambio_id` (Autonumber PK) · `solicitud` (Link → TX_Solicitudes). <br>**(b) Documentados con nombre o tipo equivocado:** `tabla_afectada` → real `tabla_origen`, y es **singleSelect**, no texto · `timestamp` documentado como *Created time*, real **dateTime** editable · `motivo` documentado como *Single line text* con vocabulario `override_manual · ajuste_ejecutiva`, real **multilineText y vacío en 9/9 filas** — el campo realmente poblado es `razon_cambio` (6/9). <br>**(c) Documentados y correctos:** `campo_modificado` · `valor_anterior` · `valor_nuevo` (los tres, salvando que los "Long text" son `multilineText`). <br>**(d) Reales sin documentar (7):** `clave_natural` (3/9) · `registro_id` (**9/9 — es la FK real**) · `registro_nombre` (9/9) · `modificado_por_email` (**9/9 — es el autor real**) · `razon_cambio` (6/9) · `clave_cambio` (0/9) · `record_id` (0/9). <br>**(e) Documentado, existe, pero inservible:** `autor` (singleLineText) está **vacío en 9/9**; el autor vive en `modificado_por_email`. <br>Anotar el patrón de acceso correcto: `AND({tabla_origen}="TX_Solicitudes",{registro_id}="rec…")`, que es el que usa `fetchCambiosPorSolicitud`. |
| **Dueño** | Claude Code (ejecución) · Sergio (visto bueno) |
| **Fecha objetivo** | Condicional a la **próxima tanda que toque `docs/schema-airtable.md`**, en el mismo pase que CI-010 y CI-008. No bloquea: el código ya lee la tabla por sus campos reales. |
| **Estado** | abierta |
| **Origen** | Fase 2 del cableado del Detalle de Solicitud (11-ago-2026), Tarea 3 — al fundir `A_Eventos` y `A_Cambios` en el timeline de §1.3.3. |

**Notas:**

- ⚠ **Corrección a esta misma ficha (P2-TAS · 17-ago-2026): el campo vacío se llama `actor`, no `autor`.** El punto (e) de la resolución dice *«`autor` (singleLineText) está vacío en 9/9»*. El schema real levantado vía Meta API no tiene ningún campo `autor`: tiene **`actor`** (`fldoKSd32QvApyPsL`, singleLineText). El fondo del punto (e) se mantiene —ese campo está vacío y el autor real vive en `modificado_por_email`—, pero el nombre estaba mal. Quien buscara `autor` en la tabla no lo encontraría y podría concluir que la ficha está obsoleta.
- **FIELD_IDs de `A_Cambios`, levantados en P2-TAS** (la ficha los daba por indocumentados). Quedan en `lib/tasador/field-ids.ts` → `FIELD_IDS_CAMBIOS`: `tabla_origen` `fldqRCXSY692mzaT4` · `registro_id` `fldRdyudnUcjSf1Zf` · `registro_nombre` `fldB3GDfua7fnXbXT` · `campo_modificado` `fldbpKuwR2RfbT41G` · `valor_anterior` `fldxCiiMpGSsTyNka` · `valor_nuevo` `fld4d9hQefakIQpJ3` · `modificado_por_email` `fldTUGG0jtsO47m1a` · `razon_cambio` `fldDlPfFZa1dtA2Xv` · `timestamp` `fldCyzAD9TPrEWr2x` · `clave_natural` `fldu2GzWggt47BHHq` · `clave_cambio` `fldc1jSmrfC2T7pjF` · `record_id` `fldZF76ENhWO3c0Uu` · `actor` `fldoKSd32QvApyPsL` · `motivo` `fldXgaWArd0HXI9nO`. Son **14 campos**, que coincide con el conteo de la resolución.
- **`tabla_origen` es un `singleSelect` con dominio cerrado**, dato que la ficha no registraba: `M_Clientes · M_Tasadores · M_Visadores · M_Comunas · C_ReglasNegocio · C_Formulas · C_Factores · TX_Solicitudes · TX_DatosTasacion · Otro`. Importa para quien escriba: un valor fuera de esa lista **se crearía solo** por `typecast: true` y rompería en silencio el filtro del timeline. IF-03 escribe `TX_Solicitudes` y `TX_DatosTasacion`, ambos en el dominio.
- **Es la instancia más cara de RO-20** ("un campo Link puede existir y estar vacío, y eso rompe el filtro igual que E-076"), con el agravante de que acá el Link **ni siquiera existe** y el documento afirma que sí.
- **`CLAUDE.md` lista `A_Cambios` como "Sin uso en IF-02"**, y eso deja de ser cierto desde la Fase 2: la pestaña Historial la **lee** (nunca la escribe). La línea del inventario de `CLAUDE.md` debería decir "Read timeline (§1.3.3) · nunca write". Se anota acá para no perderlo; el cambio en `CLAUDE.md` es de una línea.
- No confundir con **CI-010**: aquélla es una tabla sin documentar, ésta es una tabla documentada **mal**. La segunda es peor, porque una omisión obliga a ir a buscar y una afirmación falsa no.

---

## CI-012 · `TX_CoordinacionVisita` está en la spec y no existe en la base

| Campo | Valor |
|---|---|
| **Identificador** | CI-012 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §1.3.2 (bloque *Coordinación*), §1.3.3 (eventos de coordinación), §2.3 (RF-TAS-05), §2.11, §2.12 (declaración de la tabla) y §5.2 · vs base `app9G7lLkIV3CpeLa`, cuyo listado de **68 tablas no la contiene** |
| **Síntoma** | La spec describe la coordinación de visita como funcionalidad existente en cinco secciones, con criterios de aceptación verificables ("cada acción crea exactamente una fila en `TX_CoordinacionVisita`"), y §1.3.2/§1.3.3 encargan a IF-02 **leerla** en las pestañas Datos e Historial. La tabla no existe. Consecuencia concreta y ya materializada: el timeline de §1.3.3 se entregó en la Fase 2 **sin los eventos de coordinación**, y el bloque *Coordinación* de §1.3.2 no se puede construir. No es un fallo de implementación: no hay origen de datos. |
| **Causa** | La tabla se declaró en la spec v1.9.3 §2.12 como parte del alcance de IF-03 (Interfaz Tasador) y su creación en Airtable quedó pendiente. Está registrada como dependencia externa **DEP-EXT:A-09** en `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md:1280` y en `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md:2560`, ambas con la marca *"pendiente creación Airtable · no verificada 2026-07-25"*. El sync de IF-Tasador ya lo había detectado (`docs/_sync_ifTasador_v1/00_inventario.md:259`). Lo que esta entrada agrega es que **la deuda ya tiene consecuencia observable en IF-02**, no sólo en IF-03. |
| **Resolución** | ✅ **CERRADA POR DECISIÓN DE PRODUCTO — opción (b), ampliada.** Sergio, 17-ago-2026: **la coordinación de visitas no se soporta por sistema. Es manejo manual fuera de plataforma, en los dos tramos: ejecutiva ↔ tasador y tasador ↔ visador.** `TX_CoordinacionVisita` **no existe y no existirá**. La decisión es canónica y no se vuelve a consultar: quedó como **RO-29** en `docs/aprendizajes.md`. <br>Alcance ejecutado a la fecha de cierre: **P0.5-TAS** no creó la tabla ni `coordinacion_vigente` ni las dos plantillas de correo (`docs/schema-airtable.md` §26.2 y §26.5); **P1-TAS** no tipó `CoordinacionVisita`, `MotivoNoContacto`, `MOTIVOS_DEVOLUCION`, `intento_numero` ni `AccionCard`; **P2-TAS** no construye las rutas `GET`/`POST /api/tasaciones/[id]/coordinacion`, y su set de rutas baja de **15 a 13**. <br>Pendiente de ejecución, no de decisión: **retirar de la spec** §2.3 (RF-TAS-04, RF-TAS-05), §2.11, §2.12 y el encargo a IF-02 de §1.3.2/§1.3.3, más **reescribir la Regla T-A** de `docs/_md/plan_ejecucion_UItasador_v1.0.md` §0.3, que colapsa de tres variantes de botón a una sola («Abrir tasación») y pierde el gate de coordinación. Todo eso va en el **próximo bump normativo**. |
| **Dueño** | Sergio (decisión, **tomada**) · Claude Code (retirada de la spec en el próximo bump) |
| **Fecha objetivo** | Decisión: **cerrada 17-ago-2026**. Retirada documental: **condicional al próximo bump normativo** de `VProperty_Especificacion_Proyecto_v1_9_9.md`. |
| **Estado** | **cerrada** (17-ago-2026) · quedan tareas documentales derivadas, no decisiones |
| **Origen** | Fase 2 del cableado del Detalle de Solicitud (11-ago-2026), Tarea 3 — al enumerar qué contenidos de §1.3.3 tenían origen de datos y cuáles no. |

**Notas:**

- **No es un hallazgo nuevo, es una escalada.** DEP-EXT:A-09 ya la marcaba desde el 25-jul-2026. Entra como CI porque cambió de naturaleza: era "una tabla de IF-03 que falta" y ahora es "una sección de IF-02 que no se puede construir".
- **Es doc-vs-base, y es la tercera del mismo tipo tras CI-007** (`H_Feriados` vs `C_Feriados`). RO-15 fija el criterio para ese caso —gana la base real, se corrige el documento—, pero **aquí no aplica sin más**: en CI-007 la tabla existía con otro nombre, y acá no existe en absoluto. Por eso la resolución es una decisión de negocio y no un rename.
- Relación con **CI-010** y **CI-011**: las tres salieron de la misma tanda y las tres son sobre el mismo hueco —qué dice la documentación que hay contra qué hay—, pero sólo ésta requiere decidir algo antes de poder actuar.
- ~~**Pendiente decisión de negocio (Héctor + Óscar). Consulta enviada 2026-08-11.**~~ → **Resuelta el 17-ago-2026 por Sergio**, sin esperar la consulta: la coordinación se hace por teléfono y no entra al sistema.
- **Se cerró en sentido negativo, que es el caso que la opción (b) no cubría del todo.** (b) hablaba de *diferir* la coordinación «hasta que IF-03 entre en construcción»; la decisión real es más fuerte —no se difiere, se retira— y además **amplía el alcance al tramo tasador ↔ visador**, que ninguna de las dos opciones contemplaba.
- **Es la primera CI que cierra por decisión de producto y no por corrección técnica.** No hubo nada que arreglar: lo que faltaba era saber si la funcionalidad se quería. Por eso la resolución no lista un cambio de código sino una lista de retiradas documentales.
- **RO-29 es la forma vinculante de esta entrada.** Quien encuentre una referencia viva a la coordinación por sistema —en la spec, en el plan de IF-03 o en el código v0— la trata como documentación pendiente de retirar, **no** como requisito, y no vuelve a abrir la pregunta.

---

## CI-013 · "Continuar" en la lectura de datos: el spec deja avanzar, el diseño bloquea

| Campo | Valor |
|---|---|
| **Identificador** | CI-013 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.7 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 21 (Pantalla 4, partes 1 y 2) |
| **Síntoma** | Hasta v1.9.8, §2.7 decía que el botón "Continuar" *"avanza a §2.8 sin esperar a que SC07 termine; los datos leídos se irán poblando en el formulario según lleguen"*. El diseño v4 muestra el botón **deshabilitado** mientras el stepper no llega a "Datos listos", y habilitado sólo en la segunda variante. Construir según el texto anterior produce un formulario que se repuebla bajo el cursor mientras el tasador escribe, con riesgo de sobrescribir lo que acaba de teclear. |
| **Causa** | El texto de v1.9.3 optimizaba el tiempo de espera y no consideró la colisión entre la escritura del tasador y la llegada asincrónica de los datos extraídos. El diseño v4 resuelve la colisión por la vía simple: no dejar entrar al formulario hasta que la lectura termine. |
| **Resolución** | Ya aplicada en la documentación: §2.7 de v1.9.9 fija el bloqueo y lo formaliza en **RF-TAS-15**. Queda pendiente que el código de IF-03 lo respete cuando se construya, junto con la regla de que "Volver" no cancela el proceso en background. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 4. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- El diseño v4 muestra además un tiempo estimado ("15 segundos") que es del prototipo, no un compromiso: no se especificó como valor normativo.

---

## CI-014 · El formulario de captura tiene ocho secciones, no siete

| Campo | Valor |
|---|---|
| **Identificador** | CI-014 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.8 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 22 (Pantalla 5, partes 1 y 2) |
| **Síntoma** | §2.8 declaraba *"siete secciones colapsables alineadas con Origen de Datos del Informe v1.1 §3.3"*. El diseño v4 presenta **ocho**: A Visita, B Datos de la propiedad, C Cuadro de valoración, D Comparables, E Niveles · Terminaciones · Comodidades, F Documentos legales, G Overrides (CU-007), H Rentabilidad (opcional). Quien construya contando siete dejará una fuera, y la candidata natural a caerse es G (Overrides), que es la que materializa la Capacidad C-7. |
| **Causa** | El conteo de siete viene del contrato de Origen de Datos del Informe §3.3, que agrupa los overrides dentro de otra sección. El diseño los separa para que el tasador declare el ajuste manual con su motivo en un bloque propio. |
| **Resolución** | Ya aplicada en la documentación: §2.8 de v1.9.9 enumera las ocho secciones en tabla y las formaliza en **RF-TAS-16**. Queda pendiente verificar si el contrato de Origen de Datos del Informe v1.1 §3.3 necesita alinearse, lo que **no se hizo** en esta versión por estar fuera del alcance autorizado. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 5. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- La verificación pendiente contra `VProperty_Origen_Datos_Informe_v1.1.md` es la parte accionable de esta entrada: si ese documento sigue diciendo siete, la contradicción se traslada, no se resuelve.

---

## CI-015 · El contador "N de 3 usados" sigue renderizado en el formulario del tasador

| Campo | Valor |
|---|---|
| **Identificador** | CI-015 |
| **Archivo:línea** | `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 13 y 22 (`components/tasacion-form.tsx`, `IntentosIndicator`, `MAX_INTENTOS = 3` en `use-estado-tasador`) · vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2 (decisión capital 1) y §2.13 |
| **Síntoma** | El prototipo IF-Tasador renderiza en la cabecera del formulario un indicador de tres puntos con el texto "0 de 3 usados", y el hook conserva la constante que lo alimenta. La decisión capital 1 de §2 retiró el ciclo de devolución estructurado, *"el contador de tres re-visitas y la alerta de último intento"*. El tasador ve un contador de intentos que ya no gobierna nada, y que sugiere un límite de reenvíos inexistente. |
| **Causa** | Traza legacy del modelo anterior a v1.9. La propia auditoría del PDF (p. 13) la identifica como deuda técnica visible, junto con la lógica muerta del hook (`confirmar`, `rechazar`, `intentosRestantes`, `bloqueado`, estado `PENDIENTE_VISADOR`) que `InformePreview` ya no consume. |
| **Resolución** | Eliminar del código de IF-03 el componente `IntentosIndicator`, su render en el formulario y la constante `MAX_INTENTOS`, junto con las ramas del hook que nadie consume. **No requiere decisión**: la spec ya dice qué debe pasar. Documentado en §2.13 de v1.9.9. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), auditoría del PDF pp. 12-13 y Pantalla 5. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- Es la única de las nueve entradas donde **el diseño está equivocado y el spec tiene razón**: se corrige el código, no el documento. Por eso §2 no especificó el contador.
- La misma auditoría reporta un segundo residuo del mismo origen: el texto *"Prellenado por IA … (SC07)"* en `seccion-documentos.tsx`, que incumple la política transversal de no mencionar el medio técnico en la UI. Se elimina en la misma pasada.

---

## CI-016 · "Descargar PDF" admite un respaldo de impresión sin la plantilla del cliente

| Campo | Valor |
|---|---|
| **Identificador** | CI-016 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.10 (footer de acciones) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 27, punto 2 |
| **Síntoma** | Hasta v1.9.8, §2.10 permitía que "Descargar PDF" cayera en `window.print()` con estilos `@media print` cuando la solicitud estaba en `calculada` sin PDF depositado. El diseño v4 exige que *"se deberá imprimir con la plantilla asignada a esta solicitud y ser generada por Carbone"*. El respaldo produce un documento con el maquetado del navegador y **sin la plantilla del cliente institucional**, que es precisamente lo que el motor de reglas resuelve por solicitud. Un documento así puede salir de la organización pareciendo un informe de tasación. |
| **Causa** | El respaldo se introdujo para que la vista previa fuera útil antes de que el pipeline PDF depositara el archivo. Resolvía un problema de disponibilidad creando uno de identidad del documento. |
| **Resolución** | Ya aplicada en la documentación: §2.10 de v1.9.9 retira el respaldo y **RF-TAS-21** fija que la descarga siempre proviene de Carbone con la plantilla asignada, informando la espera cuando el PDF aún no está. Queda pendiente alinear §7 (Impresión del Informe de Tasación), **que no se tocó** por estar fuera del alcance autorizado de la sesión. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 7. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **La parte pendiente está fuera de §2**: §7 debe confirmar que expone la generación por solicitud a demanda del tasador, y no sólo como paso del pipeline disparado por `estado = calculada`. Hasta verificarlo, RF-TAS-21 describe un comportamiento cuyo proveedor no está confirmado.

---

## CI-017 · El acuse de envío al visador: redirección automática contra pantalla con acción

| Campo | Valor |
|---|---|
| **Identificador** | CI-017 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.10 (acción Confirmar) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 29-30 |
| **Síntoma** | §2.10 decía que al confirmar *"la pantalla muestra un mensaje de agradecimiento antes de redirigir a Pantalla 1"*, y el prototipo lo implementa con un temporizador de 2,5 s. El diseño v4 muestra dos pasos distintos: un diálogo de confirmación previo ("¿Enviar este informe al visador?") y, tras el envío, una pantalla de acuse con un botón "Volver al inicio". La redirección automática puede robar el foco mientras el tasador lee el acuse, y el diálogo previo no estaba especificado en absoluto. |
| **Causa** | La versión anterior describía el desenlace del envío pero no su confirmación, y resolvía el acuse como transición en vez de como pantalla. El envío al visador es irreversible desde IF-03 y merecía confirmación explícita. |
| **Resolución** | Ya aplicada en la documentación: §2.10 de v1.9.9 especifica el diálogo y el acuse, y **RF-TAS-22** fija que no hay redirección por temporizador y que un doble toque produce una sola transición. Pendiente en el código de IF-03, donde hoy vive el temporizador. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 7. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.

---

## CI-018 · Contenido de la card de la cola: el spec pide versión, el diseño pide Rol SII, producto y teléfono

| Campo | Valor |
|---|---|
| **Identificador** | CI-018 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.1 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17 |
| **Síntoma** | §2.1 declaraba que la card muestra *"código VP-AAAA-NNNN, EstadoBadge con color por estado, dirección, cliente y versión"*. El diseño v4 muestra código, badge de **SLA** con horas, comuna · tipo de propiedad, dirección, **Rol SII**, cliente · **producto**, **teléfono accionable** y fecha de visita; y **no** muestra versión del informe. Además, el badge no es de estado sino de SLA: construir según el texto anterior deja al tasador sin el dato que le dice qué hacer primero. |
| **Causa** | El texto de v1.9.3 describía la card en abstracto, antes de que existiera un diseño que resolviera qué necesita el tasador en la calle. La versión del informe es relevante en el preview (§2.10) y no en la cola. |
| **Resolución** | Ya aplicada en la documentación: §2.1 de v1.9.9 enumera el contenido real y lo formaliza en **RF-TAS-11**, junto con la llamada a la acción contextual de tres variantes que el texto anterior tampoco recogía. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 1. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- El teléfono como enlace accionable no es cosmético: la etapa 2 de §5.2.4 mide 4 h desde la asignación hasta el primer contacto, y la card es el punto desde donde se hace la llamada.

---

## CI-019 · Chips de la cola: el spec declara cuatro, el diseño tiene tres

| Campo | Valor |
|---|---|
| **Identificador** | CI-019 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.1 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17 |
| **Síntoma** | §2.1 enumeraba cuatro filtros: "Hoy", "Por coordinar", "Toda mi cola" y "SLA en riesgo". El diseño v4 muestra tres: **Todas** (por defecto), **Hoy** y **Por coordinar**. El chip "SLA en riesgo" no existe, y "Toda mi cola" aparece rotulado "Todas". |
| **Causa** | "SLA en riesgo" se heredó de la bandeja de la Ejecutiva (§1.1), donde tiene sentido porque la vista abarca la operación completa. En la cola del tasador —cinco o seis solicitudes— el estado del SLA viaja en cada card y una vista aparte no agrega información. |
| **Resolución** | Ya aplicada en la documentación: §2.1 de v1.9.9 declara los tres chips y RF-TAS-01 los fija. **El chip "Hoy" queda condicionado a A-12**, que define qué entra en la agenda del día. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 1. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- El rótulo también cambia: "Toda mi cola" → "Todas". Es el chip por defecto, no una vista adicional.

---

## CI-020 · El detalle de solicitud de §2.4 y dos rutas de §2.13 no existen en el diseño

| Campo | Valor |
|---|---|
| **Identificador** | CI-020 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.4 y §2.13 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 11-12 (árbol de rutas del App Router) y pp. 17-30 |
| **Síntoma** | §2.4 describía una pantalla "Detalle de Solicitud" con botón "Iniciar captura" y §2.13 listaba ocho rutas, entre ellas `[id]/` como detalle, `[id]/captura/` para el formulario y `[id]/calculo/` para el progreso. El diseño v4 no tiene pantalla de detalle: `[id]/` **es** el formulario de captura, el progreso vive en `[id]/estado/` y las rutas `captura/` y `calculo/` no existen. Quien planifique la construcción sobre §2.13 provisiona dos rutas de más y busca una pantalla que nadie diseñó. |
| **Causa** | §2.4 y la lista de rutas se redactaron en v1.9.3 desde el ADR, antes de que existiera el prototipo. El detalle intermedio quedó absorbido: sus contenidos se repartieron entre la pantalla de coordinación, la sección F del formulario y el sheet "Ver expediente". |
| **Resolución** | Ya aplicada en la documentación: §2.4 de v1.9.9 declara que la pantalla no existe y explica dónde quedó cada contenido; §2.13 corrige el árbol a siete rutas. El gate de coordinación, que era lo único funcional que §2.4 aportaba, se conserva en la llamada a la acción de la card (RF-TAS-11). |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), inventario de rutas y recorrido de pantallas. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- Conviene revisar si `VProperty_Blueprint_Interfaces_v2_10.md` replica el árbol de ocho rutas; **no se verificó** en esta sesión por estar fuera del alcance autorizado.

---

## CI-021 · El SLA del tasador se deriva del plazo agregado en días, no del plazo por etapa

| Campo | Valor |
|---|---|
| **Identificador** | CI-021 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` §2.2 y §2.12 (campo `horas_restantes`) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17, punto 1.1, y §5.2.4 (RF-53) del propio spec |
| **Síntoma** | Hasta v1.9.8, RF-TAS-02 calculaba las horas restantes del tasador como `(sla_aplicable * 24) - horas_desde_solicitud`, es decir, convirtiendo a horas el **plazo agregado en días** del semáforo de bandeja. El diseño v4 pide *"usar el RF de Control de SLA del Proyecto, reutilizar dicha funcionalidad según corresponda al tasador"*, que para el tasador es el **plazo por etapa en horas hábiles** de §5.2.4: etapa 2 (coordinación, 4 h / 6 h) y etapa 5 (visita y envío, 24 h / 48 h). Las dos lecturas dan números distintos: la derivación anterior ignora la ventana hábil, los feriados y la etapa en curso, de modo que la card puede decir "12h restantes" un viernes a las 17:00 cuando quedan 2 h hábiles. |
| **Causa** | §5.2 y RF-53 se incorporaron en v1.9.7, después de que §2.1 y §2.2 se redactaran en v1.9.3. La fórmula `horas_restantes` es anterior al reloj por etapa y nunca se reconcilió con él. |
| **Resolución** | Aplicada parcialmente: §2.2 de v1.9.9 ancla el semáforo del tasador a RF-53 · §5.2.4, RF-TAS-02 se reescribe en esos términos y §2.12 retira el campo `horas_restantes`. **Falta la contraparte**: §5.2.4 y RF-53 deben exponer el plazo por etapa de forma consumible por IF-03 —hoy la matriz es normativa pero no declara el contrato de lectura—, y §5.2 no se tocó por estar fuera del alcance autorizado. Relacionada con **CI-005**, que ya registra que el reloj del SLA no está implementado. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 1, punto 1.1. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **No es independiente de CI-005.** Aquélla dice que el reloj arranca donde no debe; ésta, que IF-03 lee el reloj equivocado. Cerrar CI-021 sin cerrar CI-005 daría al tasador una cifra correcta en su forma y errada en su origen.

---

## CI-022 · Dos tablas de factores de cálculo existen en la base y no están en ningún documento

| Campo | Valor |
|---|---|
| **Identificador** | CI-022 |
| **Archivo:línea** | `docs/schema-airtable.md` §1 (*Dominio C_ · Configuración*, líneas 37-58) y `docs/_md/plan_ejecucion_UItasador_v1.0.md` §3.1 (ruta `GET /api/tasaciones/config/defaults`) · vs base `app9G7lLkIV3CpeLa`, verificada vía Meta API el 17-ago-2026 |
| **Síntoma** | La base tiene **`C_FactoresHomogeneizacion`** (`tblep24N9gPMrDPIN`, 8 campos) y **`C_Factores`** (`tblNHze3ZZYJblJ7S`, 14 campos). Ninguna de las dos aparece en el inventario de tablas de `docs/schema-airtable.md`, ni en el plan de IF-03, ni en la spec. Lo que ambos documentos nombran como origen de los factores de homogeneización es **`C_VariablesCliente`** (`tblgrY8j4ugFzS7v9`), que es una tabla **clave-valor genérica** —`clave · valor · tipo · activa · cliente · valor_defecto · descripcion`— sin ninguna columna de factores. Consecuencia concreta: **`GET /api/tasaciones/config/defaults` (RF-TAS-08) no se puede construir desde la documentación**. Quien la escriba siguiendo el plan leerá `C_VariablesCliente` buscando `factor_sup`, `factor_edad` y `factor_distancia`, que ahí no existen como campos. |
| **Causa** | La spec §2.8 dice que los defaults viven en *"`C_VariablesCliente` / tabla de factores según §5.4"*. La disyunción quedó sin resolver y `docs/schema-airtable.md` sólo documentó la primera rama. Las dos tablas de factores se crearon en la base en algún momento del diseño del motor AT01-AT10 y nunca entraron al snapshot de schema, que se ha ido ampliando por secciones (§13, §18, §20, §21, §26) sin un pase completo sobre el dominio `C_`. |
| **Resolución** | ✅ **CERRADA (17-ago-2026) — la parte documental se ejecutó; la decisión de negocio se escaló a A-18.** <br>**(a) Hecho:** las tres tablas quedan documentadas abajo con campos, tipos y FIELD_IDs, levantados vía Meta API. No hay que volver a consultarlos. <br>**(b) Ejecutado y resuelto en negativo:** se leyeron las filas de las tres. `C_FactoresHomogeneizacion` es la canónica por descarte —única con filas de homogeneización— pero **no puede servir un valor por defecto**: `valor_referencia` está vacío en las 15. `C_Factores` está poblada y sana pero es **otra cosa** (coeficientes del motor de valoración). `C_VariablesCliente` está vacía a efectos prácticos. <br>**(c) Escalado:** lo que queda no es documentación ni código sino **carga de configuración con criterio de negocio**, y vive en **`docs/_sync_ifTasador_v1/gap/_ambiguedades.md` · A-18** (dueños: Héctor y Óscar). Corregir el plan §3.1 y la spec §2.8 para que nombren la tabla elegida es tarea del próximo bump normativo, **una vez A-18 responda cuál es**. |
| **Dueño** | Claude Code (documentación, **hecha**) · **Héctor y Óscar** vía A-18 (elección de tabla y carga de valores) |
| **Fecha objetivo** | Documentación: **cerrada 17-ago-2026**. Lo demás: **condicional al cierre de A-18**. |
| **Estado** | **cerrada** (17-ago-2026) · el bloqueo vivo es **A-18**, no esta ficha |
| **Origen** | P2-TAS (17-ago-2026), checkpoint previo a escribir `/config/defaults` — al verificar contra la base que `C_VariablesCliente` tuviera los tres factores que RF-TAS-08 necesita. |

**Schema levantado (Meta API · 17-ago-2026), para no repetir la consulta:**

```
C_FactoresHomogeneizacion  tblep24N9gPMrDPIN  · 8 campos
  nombre             fldzko4wz50kL0uaz  singleLineText
  tipo_factor        fld1TUQWaBEtRkuuM  singleSelect [Superficie · Edad · Distancia · Calidad · Orientacion · Piso · Otro · Antiguedad]
  valor_referencia   fldeae8y0DQNCo6zq  number (prec 4)
  formula_ajuste     fldW9CTk2vbsIOzev  multilineText
  activo             fldiqi4RJFfS0VKoM  checkbox
  valor_min          fld1RUQ0vH7WDqJAz  number (prec 2)
  valor_max          fldo2wdHPSqRDIbsB  number (prec 2)
  tipo_propiedad     fld8fnatg0g6zRpIB  multipleRecordLinks → M_TiposPropiedad

C_Factores  tblNHze3ZZYJblJ7S  · 14 campos
  nombre                   fld1lWCuWI0kdu4Iu  singleLineText
  codigo                   fldr00goDhop70yVq  singleLineText
  valor                    fldmU2J73AbFszxFh  number (prec 4)
  unidad                   fldMG5Xr5yLpZGGx5  singleSelect [porcentaje · multiplicador · valor_absoluto_uf · factor · unidad]
  tipo_factor              fldsVYUuiwNXwme8V  singleSelect [Remate · Liquidacion · Seguro · Garantia · Cap_Rate · Depreciacion · Homogeneizacion · multiplicador · coeficiente · divisor · tipo_factor]
  vigente_desde            fldZdeB8Q2XtMz6Jx  date
  vigente_hasta            fld0PcTd6MXM4y1Sn  date
  activo                   fldSHaJJnZEkEDvV9  checkbox
  notas                    fldCYuieFtJlMAyFc  multilineText
  aplica_a_clientes        flduH0FMhZb2RijDl  multipleRecordLinks → M_Clientes
  aplica_a_tipo_propiedad  flds1vLbkW6qWEc1d  multipleRecordLinks → M_TiposPropiedad
  aplica_a_tipo_informe    fldgX2U5wXQUAzjUi  multipleRecordLinks → M_TiposInforme
  C_ReglasNegocio          fldVBdZgfLqaw8rjt  multipleRecordLinks → C_ReglasNegocio
  ultima_modificacion      fldsUTs6QG8KKjfIj  lastModifiedTime

C_VariablesCliente  tblgrY8j4ugFzS7v9  · 7 campos  (la que nombran los documentos)
  clave          fldAF23Q8UBQy0pSl  singleLineText   ← primary
  valor          fldgxSaxWfMVLM6aL  multilineText
  tipo           fldajarV6bDNxlgTP  singleSelect [texto · numero · url · json · booleano]
  activa         fldIYwn7YfJXlQGmI  checkbox
  cliente        fldokbmHzawVgIgG9  multipleRecordLinks → M_Clientes
  valor_defecto  fldgCSxTNQfcHPclA  singleLineText
  descripcion    fldN8tHbsM9phsoE6  multilineText
```

**Lectura de filas (17-ago-2026) — el desempate empírico, RO-21:**

| Tabla | Filtro | Filas |
|---|---|---|
| `C_FactoresHomogeneizacion` | todas | **15** |
| `C_Factores` | `{tipo_factor}='Homogeneizacion'` | **0** |
| `C_Factores` | **sin filtro** | **27** — ninguna de homogeneización (ver abajo) |
| `C_VariablesCliente` | `LEFT({clave},7)='factor_'` | **0** |
| `C_VariablesCliente` | **sin filtro** | **1** — `Vars_METLIFE_default`, con `valor` vacío |

**`C_Factores` está poblada, sana y es otra cosa.** Sus 27 filas son los coeficientes del **motor
de valoración**, no factores de homogeneización:

```
Cap_Rate       CAP_DEFAULT 0.045 · CAP_LEASING 0.06
Remate         nueve tramos por antigüedad: REMATE_1_2 0.75 … REMATE_MAS24 0.5
Seguro         SEGURO_1_0 1 · SEGURO_0_8 0.8
Garantia       GARANTIA_0_8 0.8
multiplicador  FACTOR_REMATE_HIPOTECARIO 0.65 · FACTOR_SEGURO_INCENDIO 0.825 ·
               FACTOR_LIQUIDACION 0.55 · FACTOR_GARANTIA 0.8
coeficiente    COEF_TIPO_CASA 1
divisor        TIPO_CAMBIO_USD 950
(7 filas más sin `tipo_factor`, cuatro de ellas inactivas)
```

**Cero filas `Superficie`, `Edad`, `Antiguedad` o `Distancia`.** Descartada como fuente de
RF-TAS-08 — aunque es claramente la fuente de los overrides de la sección G (cap rate, vida útil),
lo que conviene recordar cuando P7-TAS cablee esa sección.

`C_FactoresHomogeneizacion` es **la única poblada**, y por tanto la canónica por descarte. Pero sus
15 filas son **dos generaciones inconsistentes** y ninguna sirve para precargar:

```
10 filas prefijo "FH-"  (FH-Superficie-M · FH-Estado-Bueno · FH-Antiguedad-16-30 …)
   tipo_factor VACÍO · valor_referencia VACÍO · valor_min/max VACÍOS
   → sólo tienen `nombre` y `activo`. Son cáscaras.

 5 filas prefijo "FH_"  (FH_Antiguedad_Menor/Mayor · FH_Distancia_Cercana/Lejana · FH_Superficie_Similar)
   tipo_factor poblado (Antiguedad · Distancia · Superficie)
   valor_min/valor_max poblados (0.85–1 · 0.9–1 · 0.85–0.95 · 1–1.15 · 0.95–1.05)
   valor_referencia VACÍO
```

**Cuatro obstáculos concretos para RF-TAS-08:**

1. **`valor_referencia` está vacío en las 15 filas.** Es el único campo que podría llevar el valor por defecto. Sin él no hay nada que precargar, con o sin ruta.
2. Las 5 filas útiles declaran **rangos de validación**, no valores. Un rango `0.85–1` no precarga un campo; a lo sumo lo valida.
3. **El dominio no casa con RF-TAS-08.** El requisito pide `factor_sup`, `factor_edad` y `factor_distancia`. Las filas usan `Superficie`, `Antiguedad` y `Distancia` — y el `singleSelect` ofrece `Edad` **y** `Antiguedad` como opciones distintas, sin ninguna fila `Edad`. Mapear `factor_edad` → `Antiguedad` es plausible pero es una decisión de negocio, no una lectura.
4. `formula_ajuste` está vacío en las 15, así que tampoco hay una expresión de la que derivar el valor.

**Notas:**

- **No es doc-vs-doc: es documento contra base.** El plan y la spec afirman un origen de datos que no puede servir el dato. Mismo tipo que **CI-011** (`A_Cambios` documentada con campos que no existen), invertido: allí el documento inventaba campos, acá omite tablas enteras.
- **La entrada cambió de naturaleza al leer las filas.** Nació como «dos tablas sin documentar» —un problema de documentación— y al verificar población resultó ser **«la tabla correcta está a medio poblar»**, que es un problema de datos. Documentar las tablas (resolución **(a)**) sigue siendo válido y barato; **no desbloquea RF-TAS-08**.
- **Lo que falta es carga de configuración con criterio de negocio, no código.** Alguien tiene que decidir qué valor por defecto lleva cada factor y escribirlo en `valor_referencia`, más resolver `Edad` vs `Antiguedad` y qué hacer con las 10 cáscaras `FH-`. Hasta entonces, cualquier ruta que se construya devolverá vacío — que es exactamente lo que RF-TAS-08 prohíbe suplir con constantes en el frontend.
- **Los tres factores sí existen con esos nombres literales, pero en el lugar equivocado para este uso.** `TX_Comparables` tiene `factor_sup` (`fld3vdKQhI2Xz8HFj`), `factor_edad` (`fldPW58uWlf4XUjru`) y `factor_distancia` (`fldRE21D6h2WyAhKD`). Son el **destino** de la captura por comparable, no la fuente de los defaults. Confundirlos haría que la ruta devolviera lo que el tasador acaba de escribir en vez de la configuración.
- **Las dos candidatas se solapan.** `C_FactoresHomogeneizacion` está dedicada al caso y discrimina por `tipo_factor` (`Superficie`/`Edad`/`Distancia`), pero no tiene vigencia temporal ni scoping por cliente. `C_Factores` sí los tiene y su `tipo_factor` incluye `Homogeneizacion`, pero es de propósito general. **La elección se hace leyendo filas, no comparando conceptos** — es RO-21 (verificar población, no existencia).
- **Ambos dominios `tipo_factor` están sucios**: `C_Factores.tipo_factor` incluye el literal `tipo_factor` como opción, y mezcla `Remate`/`Liquidacion` (capitalizados) con `multiplicador`/`coeficiente`/`divisor` (minúsculas). Es el mismo patrón de suciedad que se registró en los `singleSelect` de `TX_DatosTasacion` y `TX_ItemsCuadroValoracion`.

---

## CI-023 · El mapeo de `InformeData` sobre `TX_DatosTasacion` no cierra: 26 campos sin columna destino, `dfl2` no escribible y cuatro pares de homónimos

| Campo | Valor |
|---|---|
| **Identificador** | CI-023 |
| **Archivo:línea** | `lib/tasaciones.ts:323` (`InformeData`, 68 campos) · `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` §3.3 (tabla *Campo del informe → Campo en TX_DatosTasacion*, líneas 492-548) · vs base `app9G7lLkIV3CpeLa`, schema levantado vía Meta API el **18-ago-2026** |
| **Síntoma** | `PATCH /api/tasaciones/[id]/datos` (RF-TAS-16 · RF-TAS-17) debe persistir las secciones A-H sobre `TX_DatosTasacion` (83 campos) más cuatro tablas hijas. Al contrastar los 68 campos de `InformeData` contra el schema real aparecen **tres clases de fallo distintas**: (1) **26 campos no tienen columna destino en ninguna de las seis tablas**; (2) **`dfl2` existe pero es una fórmula** —escribirla devuelve 422—; (3) **cuatro pares de homónimos**, de los cuales los tres de la sección H tienen el campo de nombre obvio equivocado y el correcto es el que ningún documento nombra. La documentación no permite detectar ninguno de los tres: §3.3 nombra campos que no existen y omite los que sí. |
| **Causa** | `InformeData` se derivó del formulario v0 (`components/tasador/tasacion-form.tsx`), que es una maqueta de UI diseñada sin contraste contra la base. `TX_DatosTasacion` creció por acumulación —bloque SII de §20.6, campos del motor AT03, campos de la extracción RF-09— sin un pase de consolidación, de lo que quedan pares como `anio_construccion`/`anno_construccion` conviviendo. `VProperty_Origen_Datos_Informe_v1.1.md` §3.3 es un documento de **diseño de origen de datos**, no un snapshot de schema, y nunca se verificó contra la base. Es el mismo patrón que P1-TAS encontró en los catálogos de `OPCIONES` (8 de 9 mal por derivarlos de documentación). |
| **Resolución** | ⚠ **PARCIAL — la ruta se construye sobre el subconjunto verificado; la decisión de modelado se difiere a P7-TAS.** <br>**(a) Hecho en P2-TAS.A:** `PATCH /datos` persiste **únicamente los 39 campos escalares con destino verificado** más las 4 colecciones hijas. Los 26 huérfanos se listan de forma explícita en el docblock de `app/api/tasaciones/[id]/datos/route.ts` y abajo en esta ficha. La ruta **no los acepta en silencio**: lo que no tiene dónde guardarse, no se guarda y queda declarado. <br>**(b) Diferido a P7-TAS**, que es la tanda dueña del formulario de 8 secciones: decidir si los 26 huérfanos se crean como campos en Airtable (requiere aprobación explícita de Sergio · `CLAUDE.md`), si se retiran de `InformeData` por no ser datos que el negocio necesite persistir, o si se consolidan en los `multilineText` que ya existen (`elementos_interiores`, `espacios_comunes`, `notas_campo`). **Precedente exacto:** P1-TAS dejó `Comodidades` sin tabla destino con esta misma forma de cierre. <br>**(c) Documental, próximo bump:** corregir la tabla §3.3 de `VProperty_Origen_Datos_Informe_v1.1.md`. **No se tocó el documento en esta tanda.** |
| **Dueño** | Claude Code (ruta + esta ficha, **hecho**) · **P7-TAS** (destino de los 20 huérfanos) · **Sergio** (si la resolución exige crear campos) |
| **Fecha objetivo** | (a) cerrada 18-ago-2026 · (b) **P7-TAS** · (c) próximo bump de `VProperty_Origen_Datos_Informe_v1.1.md` |
| **Estado** | **abierta** · parcialmente resuelta · **no bloquea P2-TAS.A** |
| **Origen** | P2-TAS.A (18-ago-2026), al retomar la tanda para escribir `GET · PATCH /datos` — primer contraste real de `InformeData` contra el schema de las seis tablas. |

### 1 · Los 26 campos sin columna destino

> **⚠ Sobre el número.** Son **26 identificadores**. El conteo original de esta ficha decía
> **20**; eran **24** antes de las dos altas del 18-ago (`Recinto.estado`,
> `ItemValoracion.origenSuperficie`). La diferencia de 4 respecto de la lista textual viene de la
> fila `selloSec`, que agrupa **3** identificadores —`selloSec`, `selloSecId`,
> `selloSecVencimiento`— en una sola línea de la tabla por compactación visual.
> **Contar filas ≠ contar identificadores: verificar antes de citar el número.**
> La tabla de abajo tiene **24 filas** y **26 identificadores**.

Ninguno existe en `TX_DatosTasacion`, `TX_DocumentosLegales`, `TX_ItemsCuadroValoracion`, `TX_Ampliaciones`, `TX_HabitacionesPorNivel` ni `TX_TerminacionesPorRecinto`.

| Sección | Campo de `InformeData` | Nota |
|---|---|---|
| B | `piso` | §3.3 lo nombra `piso`. Existe `pisos` (`fldoWw7njKadV01hy`), que es **otra cosa**: el conteo de pisos de la propiedad, no el piso en que está el departamento. |
| B | `subterraneos` | Existe `sup_subterraneo` (`fldBEeJqpiq7Zb1Vq`), que es **superficie**, no conteo. |
| B | `edificioNombre` | §3.3 lo nombra `edificio`. |
| B | `condominioNombre` | §3.3 lo nombra `condominio`. |
| B | `mediosBanos` | §3.3 lo nombra `medios_banos`. |
| B | `banoServicio` | §3.3 lo nombra `bano_servicio`. |
| E | `estructuraSoportante` | El dominio de `TX_TerminacionesPorRecinto.categoria` no tiene valor para esto. |
| E | `divisionesInteriores` | ídem |
| E | `entrepisos` | ídem |
| E | `cubierta` | ídem |
| E | `revestimientoExterior` | ídem |
| E | `cierrosExteriores` | ídem |
| E | `Recinto.material` | El recinto sólo tiene tres categorías con destino (ver §3). |
| E | `Recinto.iluminacion` | ídem |
| E | `Recinto.estado` | ⚠ **añadido el 18-ago.** El v0 lo llena con `OPCIONES.estadoConservacion` (`Bueno · Regular · Malo…`) y el único destino plausible, `calidad`, tiene dominio `Alto · Medio · Basico`. Son **ajenos**: escribirlo crearía "Bueno" como opción nueva por `typecast`. Se deja sin escribir. |
| E | `Ampliacion.nPe` | `TX_Ampliaciones` tiene 6 campos y ninguno recibe el n° de permiso. |
| C | `ItemValoracion.origenSuperficie` | ⚠ **añadido el 18-ago.** `TX_ItemsCuadroValoracion` no tiene columna de origen de la superficie. El dominio `origen_superficie` existe **en `TX_Unidades`** (`fldbDPpHhkuWjOTvQ`), otra tabla y otro nivel de granularidad. P1-TAS ya lo había anotado en §2.bis.2 del snapshot y no se cruzó con esta tabla hasta hoy. `origen_dato` (`tasador · claude · cliente`) **no** sirve: es la procedencia de la fila, no la del dato de superficie. |
| F | `vendedor` | Existen `vendedor_*` en `TX_Solicitudes`, pero son el vendedor de la **operación**, no el de la escritura. No se reutilizan sin decisión de negocio. |
| F | `comprador` | |
| F | `notaria` | `TX_DocumentosLegales.tipo_documento` tiene la opción `Notaria`, pero no hay campo para el nombre. |
| F | `repertorio` | |
| F | `selloSec` · `selloSecId` · `selloSecVencimiento` | Los tres. `VProperty_Origen_Datos_Informe_v1.1.md:349` los da por existentes en `TX_DatosTasacion`. |
| F | `afectoExpropiacion` | Existe `n_cert_no_expropiacion` (el número del certificado), no el booleano. |
| H | `valorReferenciaClp` | **Es el denominador del cap rate** (`informe-preview.tsx:141`). Sin él, el cap rate de la sección H no se puede recomputar server-side. |

> Se suman los **14 booleanos de `Comodidades`**, que P1-TAS ya declaró sin tabla destino en el docblock de `lib/tasaciones.ts:283`. No se recuentan acá; misma resolución y misma tanda (P7-TAS).

### 2 · `dfl2` es una fórmula, no un campo escribible

`TX_DatosTasacion.dfl2` (`fldtyMwl3SZwTRN4h`) es de tipo `formula`:

```
IF({fldhsMeHuyoUMnvqq} < 140, 'SI', 'NO')     ← {sup_construida_total}
```

`InformeData.dfl2` es `boolean` y el formulario v0 lo presenta como un control editable. **Son incompatibles**: un PATCH contra esa columna devuelve 422. Además la semántica difiere — la fórmula deriva DFL-2 de la superficie construida total (< 140 m²), mientras el v0 deja que el tasador lo declare.

`sup_construida_total` es a su vez fórmula sobre `sup_construida_piso1` + `sup_construida_piso2`, **no** sobre `sup_construccion_m2`. Escribir la superficie en el campo que §3.3 nombra (`sup_construida` → real `sup_construccion_m2`) **no mueve `dfl2`**.

→ `/datos` **no escribe `dfl2`** y lo devuelve en el GET como valor derivado de sólo lectura. Que el formulario deje de ofrecerlo como editable es tarea de **P7-TAS**.

### 3 · `Recinto` es ancho; `TX_TerminacionesPorRecinto` es largo

`Recinto` (`lib/tasaciones.ts:270`) tiene 7 atributos en un objeto. La tabla real modela **una fila por (recinto, categoría)**, con `categoria` en dominio cerrado `Pisos · Muros · Cielos · Puertas · Ventanas · Cocina · Banos`.

**Un recinto no es una fila: son tres.** Mapeo adoptado en P2-TAS.A:

| Atributo de `Recinto` | Fila generada | Campo |
|---|---|---|
| `pavimento` | `categoria = Pisos` | `descripcion` |
| `revestimientoMuros` | `categoria = Muros` | `descripcion` |
| `terminacionCielo` | `categoria = Cielos` | `descripcion` |
| `estado` | las tres | `calidad` (`Alto · Medio · Basico`) |
| `nombre` | las tres | `nombre` |
| `material` · `iluminacion` | — | **huérfanos** (ver §1) |

No se amplía el dominio de `categoria`: es cambio de schema y `typecast: true` crearía opciones nuevas ante cualquier error de literal.

### 4 · Los homónimos de la sección H — el campo obvio es el equivocado

`TX_DatosTasacion` tiene **cinco** campos plausibles para dos datos:

```
arriendo_bruto_clp           fldeh1z0DzuQSMtEY  currency
arriendo_bruto_mensual_clp   fld1On072zTAfIJbh  number
arriendo_mensual             fldZYdbx65RphuCWk  number   ← el correcto
gasto_anual_clp              fldWOyIJ9etc3DCBl  currency
gasto_anual                  fldl7MLJVn74uRfQh  number   ← el correcto
```

La fórmula `ingreso_liquido_anual` (`fldRXnym7cmurpEyL`) es:

```
{fldZYdbx65RphuCWk} * 12 - {fldl7MLJVn74uRfQh}     ← {arriendo_mensual} * 12 - {gasto_anual}
```

Usa **los campos sin sufijo `_clp`**. Escribir en `arriendo_bruto_clp` / `gasto_anual_clp` —los de nombre obvio, y los únicos que se parecen a los identificadores `arriendoBrutoClp` / `gastoAnualClp` del v0— **dejaría `ingreso_liquido_anual` en cero de forma permanente y silenciosa**, sin error de escritura.

La correspondencia se confirma por aritmética, no por nombre: `components/tasador/informe-preview.tsx:140` calcula

```js
const netoAnual = arriendoMensual * 12 - gastoAnual
```

que es **la misma expresión** que la fórmula de Airtable, y el label del formulario (`tasacion-form.tsx:381`) dice literalmente *"Arriendo bruto **mensual** (CLP)"*. → destino: `arriendo_mensual` + `gasto_anual`.

Mismo patrón que §2.bis.3 del snapshot de P2-TAS (`Comparable.fuente` → `tipo_referencia`): **el literal del v0 coincide con el campo equivocado.**

### 5 · Divergencias de nombre entre §3.3 y el schema real

Para el próximo bump de `VProperty_Origen_Datos_Informe_v1.1.md`. **El documento no se tocó en esta tanda.**

| §3.3 dice | Schema real | |
|---|---|---|
| `sup_terreno` | `sup_terreno_m2` `fld2s1wiRstEiMBY8` | renombrar |
| `sup_construida` | `sup_construccion_m2` `fldYC1GUSW6xWVscq` | renombrar |
| `anio_construccion` | **conviven** `anio_construccion` `fldzhntDWwfcy5jwP` y `anno_construccion` `fldcfbrSEFvvWYslL` | ⚠ homónimo · `/datos` escribe el primero |
| `sup_primer_piso_m2` | ✅ existe · ⚠ convive con `sup_construida_piso1` `fldzY9k38HePg7YKa` | homónimo |
| `servidumbre_m2` | ✅ existe · ⚠ convive con `sup_servidumbre` `fldwiF0X5Tx2gIbyf` | homónimo |
| `piso` · `subterraneos` · `edificio` · `condominio` · `medios_banos` · `bano_servicio` | **no existen** | ver §1 |
| `dfl2` | existe, pero es **fórmula** | ver §2 |
| `permiso_edif_num legacy` | `permiso_edif_num` `fldOlvStur9oNVO3V` existe en `TX_DatosTasacion`; el campo vivo es `TX_DocumentosLegales.permiso_edificacion_numero` | §3.3 ya lo marca *legacy* — acierta |
| `orientacion` | ✅ existe · ⚠ es **`singleSelect`**, y `InformeData.orientacion` es `string[]` | ver nota |

**Nota sobre `orientacion`.** El v0 permite multiselección (`orientacion: string[]`, 8 puntos cardinales) y la columna admite **un solo valor**. `/datos` persiste el primero y **no** convierte el campo a multiselect por su cuenta. Que el formulario ofrezca N y la base guarde 1 es pérdida de dato silenciosa: **P7-TAS** decide si el control pasa a selección única o si el campo migra a `multipleSelects`.

### Notas

- **La ficha nace parcialmente resuelta a propósito.** Bloquear `/datos` por los 20 huérfanos habría dejado la tanda en 10/11 rutas por campos que en su mayoría son de secciones que **P7-TAS** todavía no construyó. Lo que no puede pasar —y esta ficha lo impide— es que se den por persistidos.
- **El conteo de `InformeData` es 68 campos y el de destinos verificados 39.** La diferencia no son 29 huérfanos: 4 son colecciones hijas (`items`, `comparables`, `ampliaciones`, `niveles`, `recintos`), `comparables` tiene ruta propia (`/comparables`) y no lo toca `/datos`, y 3 son de fotos/documentos (`fotosPredefinidas`, `categoriasCustom`, `documentosCargados`), que persisten por `/fotos` y por el pipeline de adjuntos.
- **Tres tablas hijas tienen un campo `clave_*` de tipo texto** (`clave_ampliacion`, `clave_habitacion`, `clave_terminacion`) que no está documentado en ninguna parte y que parece ser la clave natural de deduplicación del pipeline AT03. `/datos` la escribe con el patrón `{codigo_solicitud}-{discriminador}` para no dejarla vacía; **si AT03 espera otro formato, el upsert de esas tablas se duplicará**. Verificar en P7-TAS o cuando AT03 se toque.
- **`TX_DatosTasacion` tiene dos campos de superficie construida que no se solapan por nombre pero sí por significado**: `sup_construccion_m2` (el que recibe la captura) y `sup_construida_total` (fórmula sobre `sup_construida_piso1` + `sup_construida_piso2`). La segunda alimenta `dfl2` y `coef_ocupacion_suelo`. **Escribir sólo la primera deja las dos fórmulas derivadas sin insumo.** Es una inconsistencia del modelo, no del código, y se registra acá para que P7-TAS decida si la captura debe alimentar `sup_construida_piso1`/`piso2` en vez de —o además de— `sup_construccion_m2`.

---

## CI-024 · `TX_DocumentosGenerados`: Link `solicitud` huérfano + `clave_natural` en un namespace ajeno al de `TX_Solicitudes`

| Campo | Valor |
|---|---|
| **Identificador** | CI-024 |
| **Archivo:línea** | `docs/schema-airtable.md` §1 (`TX_DocumentosGenerados` · `tbl5sYnGPZXgYCBSY`, documentada como *"No usada en IF-02"* y sin tabla de campos) · `docs/_md/plan_ejecucion_UItasador_v1.0.md` §10.1 (cabecera del preview: *"la versión del informe debe coincidir con la del registro vigente de `TX_DocumentosGenerados` para esa solicitud"*) · vs base `app9G7lLkIV3CpeLa`, verificada vía **MCP** el 18-ago-2026 |
| **Síntoma** | `GET /api/tasaciones/[id]/informe` (RF-TAS-20) debe mostrar en la cabecera la **versión vigente del informe**, que sólo vive en esta tabla. **No hay forma de asociar sus filas a una solicitud.** La tabla tiene 1 sola fila y su Link `solicitud` (`fldLGIn2LYIFA5MEe`) está **vacío**; su primary field `clave_natural` vale `METLIFE-6283\|doc\|preliminar\|v1`, y ese `METLIFE-6283` **no corresponde a ningún identificador de `TX_Solicitudes`**: los 43 registros usan `codigo_solicitud` y `codigo_ext` con formato `VP-2026-NNNN`. Ni el Link ni el código permiten el join. A eso se suma que la tabla arrastra **cuatro pares de campos homónimos** de dos generaciones distintas, y cuál está poblado no sigue ningún patrón (ver §2). |
| **Causa** | La tabla la escribe el pipeline PDF (E1/E2/E3 · Carbone), que es anterior a IF-03 y ajeno a él. La fila existente es de **carga de demostración** (`createdTime` 01-jun-2026, `clave_natural` con el nombre del cliente en vez del código de solicitud), no producto del pipeline en régimen. Los cuatro pares de homónimos son sedimento de dos iteraciones del diseño de la tabla que nunca se consolidaron, el mismo patrón de acumulación que **CI-023** documenta para `TX_DatosTasacion`. |
| **Resolución** | ⚠ **PARCIAL — la ruta se construye contra el contrato correcto y degrada de forma explícita.** <br>**(a) Hecho en P2-TAS.A:** `/informe` busca la versión vigente **por el Link `solicitud`**, que es el contrato correcto y el que el pipeline debe poblar. Si no hay fila, devuelve **`versionVigente: null`** y el preview usa su estado vacío, que ya está especificado: §10.1 del plan manda estado vacío explícito en bloques sin contenido y **CI-016** fija que si el PDF no está depositado se informa la espera. **Los otros 7 bloques no se degradan**: no dependen de esta tabla. <br>**(b) Descartado explícitamente:** parsear `clave_natural` para inferir la solicitud. Sería derivar un contrato de **una fila de demostración**; un acierto casual hoy se rompe cuando el pipeline escriba la segunda, y un match falso mostraría al tasador la versión de **otro** informe, que es peor que no mostrar ninguna. <br>**(c) Pendiente, fuera del repo:** que el pipeline PDF **pueble el Link `solicitud`** al depositar cada documento. Sin eso, la cabecera del preview nunca mostrará versión, por correcta que sea la ruta. |
| **Dueño** | Claude Code (ruta + ficha, **hecho**) · **dueño del pipeline E1/E2/E3** (poblar el Link) · **P9-TAS** (verificar la cabecera con datos reales) |
| **Fecha objetivo** | (a) cerrada 18-ago-2026 · (c) sin fecha — depende del pipeline PDF, que no es territorio de IF-03 |
| **Estado** | **abierta** · parcialmente resuelta · **no bloquea P2-TAS.A** · **sí bloquea el criterio de cabecera de P9-TAS** |
| **Origen** | P2-TAS.A (18-ago-2026), checkpoint previo a escribir `/informe`: verificar por MCP cuál de los campos homónimos está vivo antes de leer uno u otro. |

### 1 · El precedente: es el mismo antipatrón de CI-010

**CI-010** registró que `A_DecisionesMotor` tiene el Link `solicitud` **vacío en todas las filas** y que hay que casar por `solicitud_codigo`. Es la misma familia de fallo —una tabla escrita por un proceso backend que no puebla su FK— con **un agravante**: en `A_DecisionesMotor` el código de respaldo existe y sirve; acá el identificador de `clave_natural` pertenece a otro espacio de nombres y **no hay respaldo que usar**.

Que el mismo defecto aparezca en dos tablas distintas, ambas escritas por automatizaciones y no por la UI, sugiere que la revisión pertinente no es tabla por tabla: **conviene auditar el poblamiento del Link `solicitud` en todas las tablas que escriben Make y las Automations**, no sólo en las dos ya detectadas.

### 2 · Los cuatro pares de homónimos, y cuál está vivo

Verificado sobre la única fila existente (MCP, 18-ago-2026). **No hay una generación ganadora**: en unos pares está poblado el nombre más específico y en otros el más genérico, así que la elección es campo por campo y no se puede deducir por criterio.

| Concepto | ✅ Vivo | ❌ Vacío |
|---|---|---|
| Versión | **`version_doc`** `fldMl20ZMCCI7lJ3K` = `1` | `version` `fldvElTOE6S6ARVR7` |
| URL del PDF | **`url_pdf`** `fldL1jl0ecsThRrQY` | `url_dropbox` `fldGVz9QhnGohAFu2` |
| Vigencia | **`es_vigente`** `fldNCU6m00S1p9hv8` = `true` | `estado` `fldXi1pqaUB6stvQq` · `status_envio_cliente` `fld1FusQWgVUQt8nQ` |
| Fecha de generación | **`generado_en`** `fldoACWHnSpoIBH6N` | `fecha_generacion` `fldPZ9bPnSrLKKDze` |

`lib/tasador/field-ids.ts` · `FIELD_IDS_DOCUMENTOS_GENERADOS` conserva **ambos** miembros de cada par con el comentario de cuál se lee y por qué, para que nadie repita la verificación ni elija el vacío por parecer el nombre correcto.

### 3 · La evidencia es una sola fila

⚠ **Salvedad metodológica.** La tabla tiene **un** registro, y de demostración. Que `url_dropbox` esté vacío en esa fila **no demuestra** que el pipeline nunca lo escriba: demuestra que no lo escribió ahí. La conclusión de §2 es la mejor disponible y es mucho mejor que elegir por intuición, pero **se revisa en cuanto exista una fila producida por el pipeline en régimen**, que es lo que P9-TAS tendrá delante.

Por eso la ruta lee la pareja viva **con caída a la vacía** (`version_doc ?? version`, `url_pdf ?? url_dropbox`): si mañana el pipeline puebla la otra, el preview sigue funcionando en vez de mostrar un hueco. La caída no es indecisión — es la forma de que una conclusión sacada de n=1 no se vuelva un fallo cuando n crezca.

---

## CI-025 · `schema-airtable.md` §20.6 declara 11 campos SII creados; 9 no existen en Airtable — y §21 afirma una verificación MCP que para este bloque es falsa

| Campo | Valor |
|---|---|
| **Identificador** | CI-025 |
| **Archivo:línea** | `docs/schema-airtable.md` §20.6 (*«`TX_DatosTasacion` — bloque SII (11 campos nuevos)»*, líneas 791-805) y §21 (*«Verificación MCP del schema v1.9»*, línea 813 y ss.) · vs base `app9G7lLkIV3CpeLa`, schema completo de las **67 tablas** levantado el 18-ago-2026 |
| **Síntoma** | §20.6 documenta once campos del bloque SII de `TX_DatosTasacion` como existentes. **Nueve no existen en ninguna tabla de la base**, no sólo en `TX_DatosTasacion`: `cod_sii_comuna`, `cod_sii_manzana`, `cod_sii_predio`, `ubicacion_urbano_rural`, `avaluo_fiscal_total_uf`, `cg`, `ociv`, `oc`, `g`. Sólo sobreviven **`avaluo_exento`** (`fld1Rl4AYBwic2VN3`) y **`contribucion_anual`** (`fldiIzlfnMnZCyixS`). Impacto directo: el **bloque 4 del preview del informe** (RF-TAS-20 · §10.1 del plan) pide *«códigos SII, avalúo fiscal por unidad y total, contribución»* y **el sub-bloque de códigos SII no tiene origen de datos**. |
| **Causa** | §20.6 pertenece a la tanda del 22-jul-2026, que documentó *schema de soporte a la maqueta v1.9* mezclando **lo que existía** con **lo que había que crear**, sin marcar cuál era cuál. Los nombres `cg`, `ociv`, `oc`, `g` —abreviaturas de una ficha SII, sin descripción ni tipo justificado— sugieren que el bloque se transcribió de un documento de origen de datos y no de la base. Es la misma raíz que **CI-023**: documentación derivada de un diseño y no de un snapshot, dada después por verificada. |
| **Resolución** | ⚠ **DIFERIDA — no la resuelve P2-TAS.** <br>**(a) Hecho en P2-TAS.A:** `GET /informe` construye el bloque 4 con los tres sub-bloques que **sí** tienen origen —avalúo por unidad (`TX_Unidades.avaluo_uf`), avalúo total (`TX_DatosTasacion.avaluo_total` y la fórmula `avaluo_fiscal_uf`) y contribución (`contribucion_anual`)— y devuelve los **códigos SII vacíos**, que el preview renderiza como estado vacío explícito según §10.1. El bloque no se omite ni se rellena. <br>**(b) Diferido al dueño del bloque SII:** decidir entre **corregir §20.6** —si los campos nunca debieron crearse, el defecto es documental y la spec del informe debe dejar de pedir códigos SII— o **crearlos en Airtable**, que exige aprobación explícita de Sergio (`CLAUDE.md`) y define de dónde se pueblan: el SII no es una fuente que IF-03 consulte. <br>**(c) Auditoría, ver §2:** el problema no es sólo la ausencia de nueve campos. |
| **Dueño** | Claude Code (ruta + ficha, **hecho**) · **dueño del bloque SII / Héctor** (decidir (b)) · **P9-TAS** (verificar el bloque 4 con la resolución tomada) |
| **Fecha objetivo** | (a) cerrada 18-ago-2026 · (b) y (c) sin fecha — decisión de negocio y auditoría documental |
| **Estado** | **abierta** · **no bloquea P2-TAS.A** · degrada un sub-bloque de P9-TAS |
| **Origen** | P2-TAS.A (18-ago-2026), al reunir los orígenes de los 8 bloques del preview antes de escribir `/informe`. |

### 1 · El detalle de los once

| Campo de §20.6 | Estado real |
|---|---|
| `cod_sii_comuna` · `cod_sii_manzana` · `cod_sii_predio` | ❌ no existen en ninguna de las 67 tablas |
| `ubicacion_urbano_rural` | ❌ |
| `avaluo_fiscal_total_uf` | ❌ — existe `avaluo_fiscal_uf`, pero es una **fórmula** distinta (`fld6QuRMbKH3jdAy9`), no el campo declarado |
| `cg` · `ociv` · `oc` · `g` | ❌ los cuatro |
| `avaluo_exento` | ✅ `fld1Rl4AYBwic2VN3` (currency) |
| `contribucion_anual` | ✅ `fldiIzlfnMnZCyixS` (currency) |

Lo que la tabla **sí** tiene y §20.6 no menciona: `avaluo_total`, `avaluo_total_raw`, `avaluo_no_registra`, `deuda_contrib`, `avaluo_fiscal_texto`, `avaluo_fiscal_clp`, `avaluo_fiscal_uf`, `calidad_sii`, `destino_sii`. Es decir, **el bloque SII real existe pero con otros nombres y otra forma** que la documentada. No es que falte el bloque: es que §20.6 describe uno que no se construyó.

### 2 · El meta-hallazgo: §21 declara una verificación que no cubrió esto

§21 se titula *«Verificación MCP del schema v1.9 y cierre de `TX_DocumentosLegales`»* y abre afirmando: *«auditoría vía `list_tables_for_base` + `get_table_schema` de todo lo que §20 marcaba como pendiente de creación. **Resultado: el schema v1.9 ya está creado en la base real**»*.

**Para el bloque SII de §20.6 esa afirmación es falsa**, y no por un campo suelto: nueve de once. §21 sí verificó de verdad otras partes —`TX_ContactosVisita`, `M_TiposDeBien`, los 9 campos de `TX_DocumentosLegales`, los 5 conflictos de §21.4—, y todo eso se confirmó hoy. El defecto es de **alcance de la auditoría**, no de su método: se verificó tabla por tabla lo que la sesión tenía entre manos y se redactó una conclusión global.

Esto importa más que los nueve campos, porque **`docs/schema-airtable.md` es la fuente que las tandas consultan en vez de la base**. Una sección que dice «verificado» y no lo está es peor que una que no dice nada: apaga la consulta que habría detectado el problema. Es exactamente lo que ocurrió en P1-TAS con los catálogos de `OPCIONES` (8 de 9 mal) y hoy con `Origen_Datos_Informe` §3.3 (**CI-023**).

**Consecuencia operativa, ya recogida como RO-26** (*«un snapshot de schema se levanta de la base, nunca de un documento»*): la regla existe y es correcta; lo que falta es que **una afirmación de verificación declare su alcance**. Una auditoría que no enumera qué verificó no permite distinguir «lo miré y está» de «no llegué a mirarlo», y las dos se leen igual seis semanas después.

### 3 · Por qué la ruta no rellena el hueco

Habría sido fácil derivar los códigos SII del `rol_sii` de la solicitud, que existe y tiene el formato `manzana-predio`. **No se hace.** Partir un rol para inventar tres campos que el negocio no definió es fabricar un dato con apariencia de oficial en un documento que sale de la organización. Si el informe debe mostrar códigos SII, alguien tiene que decidir de dónde se obtienen — y esa es la resolución **(b)**, no una decisión de esta ruta.

---

## CI-026 · `auth-guard`: el cuerpo es idéntico pero el status distingue existencia (403 ajena vs 404 inexistente) — el docblock declara completa una mitigación que es parcial

| Campo | Valor |
|---|---|
| **Identificador** | CI-026 |
| **Archivo:línea** | `lib/tasador/auth-guard.ts:23-26` (docblock *«Qué NO filtra»*) · `:55` (id con forma inválida → 404) · `:83` (registro inexistente → 404) · `:96` (solicitud ajena → **403**) |
| **Síntoma** | El guard de RF-09 responde a sus tres modos de fallo con **el mismo cuerpo** —`{"error":"No encontramos esta solicitud entre las tuyas."}`— pero con **dos códigos de estado distintos**: `403` cuando la solicitud existe y pertenece a otro tasador, `404` cuando no existe o el id tiene forma inválida. Un tercero autenticado como tasador puede por tanto **distinguir una solicitud existente de una inexistente** probando ids y mirando sólo el status, que es exactamente la inferencia que la mitigación busca impedir. El docblock del módulo la declara resuelta: *«Ante una solicitud ajena se devuelve **403 con un cuerpo idéntico al de una solicitud inexistente**. Distinguir "no existe" de "no es tuya" le confirmaría a un tercero que el código existe, que es la fuga que RF-09 quiere evitar»* — el texto es correcto sobre el cuerpo y **omite que el status hace justo esa distinción**. |
| **Causa** | La mitigación se diseñó pensando en el **contenido** de la respuesta —no filtrar el código, el nombre del dueño ni el motivo— y ahí es correcta y está probada. El código de estado se eligió por corrección semántica HTTP, tratando cada rama por lo que es (403 = existe y no te corresponde; 404 = no hay recurso), sin advertir que esa misma corrección semántica es el canal lateral. Es el patrón clásico: dos decisiones defendibles por separado que juntas abren lo que cada una creía cerrar. |
| **Resolución** | ⚠ **NO SE RESUELVE EN P2-TAS.A — es decisión de producto.** <br>**(a) Hecho:** documentar el comportamiento real donde se ve. `app/api/tasaciones/[id]/datos/route.test.ts` recorre los tres modos afirmando el status de cada uno y comparando los tres cuerpos entre sí; el docblock de ese archivo declara la limitación en un bloque `⚠`. <br>**(b) Las dos opciones, para quien decida:** <br>**Opción 1 — uniformar a 404.** El guard devuelve `404` también para la solicitud ajena y la fuga se cierra del todo. Costo: cambia el contrato de respuesta de **las once rutas** de IF-03 a la vez; un cliente que hoy distinga 403 de 404 deja de poder hacerlo, y el log pierde la señal de «intento de acceso a solicitud ajena», que hoy se emite en `:93` como `console.warn` y es la que detectaría un abuso. Mitigable manteniendo el log y cambiando sólo el status. <br>**Opción 2 — corregir el docblock.** Se acepta la distinción por status como riesgo residual y el docblock deja de afirmar que la mitigación es total. Costo: la fuga queda abierta; se justifica sólo si el modelo de amenaza descarta al tasador autenticado como atacante. <br>**No se elige desde una tanda de construcción, y menos desde un test.** |
| **Dueño** | **Héctor** + dueño de seguridad · Claude Code documenta y ejecuta lo que se decida |
| **Fecha objetivo** | Sin fecha · **antes de P11-TAS**, que es donde el guard cambia su fuente de identidad a Clerk y sería el momento natural de tocar los status sin un cambio aislado |
| **Estado** | **abierta** · **no bloquea P2-TAS.A** · el comportamiento está probado y documentado |
| **Origen** | P2-TAS.A (18-ago-2026), al escribir el test del guard 403: la aserción «los tres modos devuelven lo mismo» pasó para el cuerpo y **no** pudo escribirse para el status. |

### 1 · Qué permite exactamente

Un tasador con sesión válida —o cualquiera que consiga una— puede **enumerar qué códigos de solicitud existen** en la base, sin acceder a ninguno:

```
GET /api/tasaciones/recXXXXXXXXXXXXXX/datos
  → 403  ⇒ la solicitud EXISTE y es de otro tasador
  → 404  ⇒ no existe (o el id no tiene forma de recordId)
```

Lo que **no** permite: leer ningún dato de la solicitud ajena. El cuerpo es idéntico, no nombra el código ni al dueño, y ninguna de las once rutas ejecuta una sola lectura de Airtable tras un guard fallido — las dos cosas están probadas.

El impacto real depende de qué valga saber que un recordId existe. En una base donde los ids son opacos y no secuenciales, enumerar por fuerza bruta es caro; la fuga es más relevante si un tercero **ya tiene** un id concreto y quiere confirmarlo.

### 2 · La evidencia ya está escrita

`app/api/tasaciones/[id]/datos/route.test.ts` (20 tests) es la prueba viva:

- La constante `MODOS` fija los tres modos **con su status real** (403/404/404). Si alguien uniforma a 404, esos casos fallan y obligan a leer esta ficha antes de seguir.
- Los tests «devuelve el MISMO cuerpo en los tres modos» comparan los cuerpos **entre sí**, no contra un literal, de modo que el candado sobre el contenido sobrevive a un cambio de redacción del mensaje.
- No existe —y no debe inventarse— un test que afirme que los status coinciden: hoy no coinciden, y un test que lo pretendiera fallaría describiendo el sistema como debería ser en vez de como es.

### 3 · Por qué se registra en vez de arreglarse

Los tres motivos, en orden de peso:

1. **Contradice un docblock que afirma lo contrario.** Una mitigación documentada como completa apaga la revisión que la habría detectado — el mismo mecanismo que **CI-025** documenta para §21 del schema. Dejarlo sólo en un comentario de test sería enterrar la contradicción donde nadie la busca.
2. **Uniformar cambia el contrato de once rutas de una vez.** Eso es un cambio de superficie de API, no un ajuste local, y el consumidor —la UI de P3-TAS en adelante— todavía no está escrito. Conviene decidirlo antes de que haya clientes que dependan de la distinción, pero decidirlo **alguien con el modelo de amenaza**, no la tanda que encontró el detalle.
3. **La evidencia es de hoy y se pierde.** Los 39 tests de esta tanda demuestran el comportamiento ahora; sin ficha, dentro de tres meses hay que redescubrirlo desde cero — y la próxima vez puede que nadie escriba el test que lo revela.
