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
- **Referencia cruzada:** `docs/_archivo/aprendizajes_20260822.md`, entrada del **2026-08-06** «Cierre del paso 5 de Tanda 3…», bloque **«Pendiente abierto · RF-09 falla sistemáticamente al dispararse»**. Esa entrada conserva el contexto de la sesión; ésta es la ficha rastreable. *(Vivía en `docs/aprendizajes.md` hasta el archivado del 22-ago-2026.)*
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §8 (nota de diseño) y §8.2 (campo `dropbox_path`) · afecta a la futura implementación del path de §8.1 |
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
| **Resolución** | Por etapas, ninguna trivial: (1) poblar `C_SLA` —hoy tiene una sola fila, `SLA_METLIFE_Refinanciamiento`, con los links `cliente`/`tipo_informe`/`tipo_propiedad` vacíos— y elegir entre las dos familias de campos duplicadas (`dias_totales`/`dias_alerta_amarilla`/`dias_alerta_roja` vs `sla_dias`/`sla_dias_alerta`/`sla_dias_vencido`), borrando la que no gane; ~~(2) crear los timestamps de entrada y salida por etapa en `TX_Solicitudes`, que no existen~~; ~~(3) implementar el cómputo sobre ventana hábil 9:00–18:00 L-V con feriados, que ninguna fórmula Airtable resuelve sola —`WORKDAY` opera en días, no en horas—~~; (4) decidir la UI de los dos semáforos convivientes (ver nota en `docs/diseno.md` §3). El paso (1) es prerrequisito de todo lo demás y es de negocio, no técnico. <br><br>**⚠ ACTUALIZACIÓN 19-ago-2026 — los pasos (2) y (3) YA ESTÁN HECHOS.** Ver el bloque de revisión al final de esta ficha antes de planificar sobre ella. |
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

### Revisión del 19-ago-2026 — qué de esta ficha quedó obsoleto

Contraste del SLA v1.1 contra el schema real y el código. **Esta ficha describe el estado del
08-ago-2026 y sobreestima lo que falta.** Quien planifique sobre ella sin leer esto provisiona
trabajo ya hecho.

| Paso original | Estado real al 19-ago-2026 |
|---|---|
| (1) Poblar `C_SLA` y elegir entre las dos familias de campos duplicadas | ⚠ **Sigue vigente, y es lo único de esta ficha que sigue siendo prerrequisito.** `C_SLA` pasó de 1 a **2 filas** (se sumó `SLA_DEFAULT_GLOBAL`), lo que evita el vacío pero no resuelve los pares (cliente, tipo_informe) reales. Las **dos familias de campos duplicadas siguen conviviendo** sin que se haya borrado ninguna. |
| (2) «Crear los timestamps por etapa en `TX_Solicitudes`, **que no existen**» | ✅ **HECHO.** Existen los 14 (`sla_e1_inicio_ts` … `sla_e7_fin_ts`) más `sla_etapa_actual`, `sla_etapa_alerta_ts`, `sla_etapa_vence_ts`, `sla_recalculado_ts`, `sla_pausa_inicio_ts` y `sla_pausa_habil_min`, todos verificados por FIELD_ID en `lib/sla-etapas.ts` · `FIELD_IDS_SLA`. |
| (3) «Implementar el cómputo sobre ventana hábil 9:00–18:00 L-V con feriados» | ✅ **HECHO.** `lib/sla-habil.ts:42-43` fija la ventana; los feriados salen de `C_Feriados` (`tblJVh2kPd4uMgxpb`, 18 filas que cubren 2026 y 2027), no de constantes. El motor `lib/sla-etapas.ts` materializa los umbrales con `sumarHorasHabiles`. |
| (4) Decidir la UI de los dos semáforos convivientes | ⚠ **Sigue vigente.** Las dos píldoras conviven en la bandeja de IF-02 y desde P3-TAS también en la cola de IF-03, sin que ningún texto explique al usuario por qué una puede estar verde y la otra roja. |

**Lo que la ficha no podía anticipar y hoy es el problema principal:** los timestamps existen y el
motor sabe calcularlos, pero **casi nadie los escribe**. Ver **CI-037**, que mide ese hueco: cinco
de las siete etapas no tienen escritor. La secuencia correcta de trabajo es (1) → CI-037 → (4);
`C_SLA` sigue primero porque `resolverSlaDelPar` la necesita para el override de e7.

**Estado de la ficha:** sigue **abierta**, con alcance reducido a los pasos (1) y (4).

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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` (8 apariciones, incluidas §5.2, §5.2.1 y el glosario) vs `docs/schema-airtable.md:51` |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §1.3.2 (bloque *Coordinación*), §1.3.3 (eventos de coordinación), §2.3 (RF-TAS-05), §2.11, §2.12 (declaración de la tabla) y §5.2 · vs base `app9G7lLkIV3CpeLa`, cuyo listado de **68 tablas no la contiene** |
| **Síntoma** | La spec describe la coordinación de visita como funcionalidad existente en cinco secciones, con criterios de aceptación verificables ("cada acción crea exactamente una fila en `TX_CoordinacionVisita`"), y §1.3.2/§1.3.3 encargan a IF-02 **leerla** en las pestañas Datos e Historial. La tabla no existe. Consecuencia concreta y ya materializada: el timeline de §1.3.3 se entregó en la Fase 2 **sin los eventos de coordinación**, y el bloque *Coordinación* de §1.3.2 no se puede construir. No es un fallo de implementación: no hay origen de datos. |
| **Causa** | La tabla se declaró en la spec v1.9.3 §2.12 como parte del alcance de IF-03 (Interfaz Tasador) y su creación en Airtable quedó pendiente. Está registrada como dependencia externa **DEP-EXT:A-09** en `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md:1280` y en `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md:2560`, ambas con la marca *"pendiente creación Airtable · no verificada 2026-07-25"*. El sync de IF-Tasador ya lo había detectado (`docs/_sync_ifTasador_v1/00_inventario.md:259`). Lo que esta entrada agrega es que **la deuda ya tiene consecuencia observable en IF-02**, no sólo en IF-03. |
| **Resolución** | 🔄 **REABIERTA Y CERRADA EN SENTIDO OPUESTO — 19-ago-2026.** La revisión de **Héctor** sobre el diseño IF Tasador v4 (`docs/_md/Imagenes_IF_Tasador_v4.pdf`, **Pantalla 2, puntos 1 a 4**, pp. 18-19) **revierte la decisión del 17-ago-2026**: la coordinación de visitas **sí se soporta por sistema**. El punto 2 exige correo de confirmación con fecha y nota; el punto 3, correo de devolución con motivo y detalle; el punto 4, que **la ejecutiva vea esas respuestas en su UI**. Ninguno de los tres es realizable por teléfono: los tres describen escritura y lectura de datos estructurados. La cita literal de los cuatro puntos está en la nota **«Cita literal — Pantalla 2»** más abajo, y es la evidencia que gobierna este cierre. <br>**Cierre vigente: opción (a) — se construye.** `TX_CoordinacionVisita` **se crea**; los correos de coordinación se emiten; la ejecutiva lee el resultado en las pestañas Datos e Historial de IF-02. <br>**RO-29 queda anulada** (ver la nota de anulación más abajo). El trabajo de reposición **no se ejecuta en esta ronda**: queda registrado como alcance de **P4-TAS**. |
| **Dueño** | Héctor (decisión de negocio, **tomada** 19-ago-2026) · Claude Code (reposición en **P4-TAS** · reconciliación de la spec aplicada en v1.9.10) |
| **Fecha objetivo** | Decisión: **cerrada 19-ago-2026** en sentido positivo. Reposición de schema, tipos y componentes: **condicional a la apertura de P4-TAS**, que es su primera acción. |
| **Estado** | **cerrada** (19-ago-2026 · sentido positivo) · sustituye al cierre negativo del 17-ago-2026, que queda anulado |
| **Origen** | Fase 2 del cableado del Detalle de Solicitud (11-ago-2026), Tarea 3 — al enumerar qué contenidos de §1.3.3 tenían origen de datos y cuáles no. |

**Notas:**

- **No es un hallazgo nuevo, es una escalada.** DEP-EXT:A-09 ya la marcaba desde el 25-jul-2026. Entra como CI porque cambió de naturaleza: era "una tabla de IF-03 que falta" y ahora es "una sección de IF-02 que no se puede construir".
- **Es doc-vs-base, y es la tercera del mismo tipo tras CI-007** (`H_Feriados` vs `C_Feriados`). RO-15 fija el criterio para ese caso —gana la base real, se corrige el documento—, pero **aquí no aplica sin más**: en CI-007 la tabla existía con otro nombre, y acá no existe en absoluto. Por eso la resolución es una decisión de negocio y no un rename.
- Relación con **CI-010** y **CI-011**: las tres salieron de la misma tanda y las tres son sobre el mismo hueco —qué dice la documentación que hay contra qué hay—, pero sólo ésta requiere decidir algo antes de poder actuar.
- ~~**Pendiente decisión de negocio (Héctor + Óscar). Consulta enviada 2026-08-11.**~~ → **Resuelta el 17-ago-2026 por Sergio**, sin esperar la consulta: la coordinación se hace por teléfono y no entra al sistema.
- **Se cerró en sentido negativo, que es el caso que la opción (b) no cubría del todo.** (b) hablaba de *diferir* la coordinación «hasta que IF-03 entre en construcción»; la decisión real es más fuerte —no se difiere, se retira— y además **amplía el alcance al tramo tasador ↔ visador**, que ninguna de las dos opciones contemplaba.
- **Es la primera CI que cierra por decisión de producto y no por corrección técnica.** No hubo nada que arreglar: lo que faltaba era saber si la funcionalidad se quería. Por eso la resolución no lista un cambio de código sino una lista de retiradas documentales.
- ~~**RO-29 es la forma vinculante de esta entrada.** Quien encuentre una referencia viva a la coordinación por sistema —en la spec, en el plan de IF-03 o en el código v0— la trata como documentación pendiente de retirar, **no** como requisito, y no vuelve a abrir la pregunta.~~ → **ANULADA el 19-ago-2026.** Se invierte: quien encuentre una referencia viva a la coordinación por sistema la trata como **requisito vigente**. Ver la nota de anulación.

### Cita literal — Pantalla 2 del diseño v4 (fuente del cierre del 19-ago-2026)

Transcripción textual de `docs/_md/Imagenes_IF_Tasador_v4.pdf`, páginas 18 y 19. Se
reproduce **tal cual**, incluidas mayúsculas, dobles espacios y los errores de tipeo del
original (`CONFIMO`, `EJECUTVA`), porque es la evidencia que revierte RO-29 y no debe
quedar mediada por una paráfrasis:

> **PANTALLA 2 : "COORDINAR VISITA"** *(p. 18)*
>
> **1.-**SE DEBE INDICAR  DATOS QUE ESTAN EN EL CORREO QUE LA EJECUTIVA ENVIA CUANDO
> ASIGNA TASADOR.
>
> *(p. 19)*
>
> **2-**CUANDO CONFIRMA COORDINACION, SE DEBE ENVIAR EMAIL DE CONFIRMACION A  LA
> EJECUTIVA, CON LA FECHA DE LA VISITA Y LA NOTA QUE HAYA ESCRITO, PARA LA SOLICITUD Y
> PROPIEDAD A TASAR.
>
> **3-** CUANDO DEVUELVE A EJECUTIVA, SE DEBE ENVIAR EMAIL CON MOTIVO Y DETALLE DE QUE NO
> SE PUDO CONTACTAR O COORDINAR VISITA, CON LA FECHA DE LA VISITA Y LA NOTA QUE HAYA
> ESCRITO, PARA LA SOLICITUD Y PROPIEDAD A TASAR.
>
> **4-**LA EJECUTIVA EN SU UI DEBE PODER VER ESTAS RESPUESTAS, YA SEA PORQUE EL TASADOR
> CONFIMO VISITA O PORQUE DEVOLVIO A EJECUTVA.

Las tres imágenes que acompañan a estos puntos están extraídas en
`docs/_md/img_hector_v4/`: `p18_1.png` (pantalla resumen completa: Encabezado, Propiedad,
Personas, Adjuntos), `p18_2.png` (bloque *Resultado del contacto* con los dos desenlaces y
el botón deshabilitado "Selecciona un resultado"), `p19_1.png` y `p19_2.png` (rama
*No pude contactar*: Motivo + Detalle con mínimo de 20 caracteres, y el desplegable con los
cuatro motivos del catálogo) y `p19_3.png` (rama *Contacto exitoso*: Fecha planificada de
visita obligatoria + Nota opcional + botón "Confirmar coordinación").

### 🚫 Anulación de RO-29 — 19-ago-2026

**RO-29** (`docs/aprendizajes.md`) queda **anulada**. Decía que la coordinación de visitas
no se soporta por sistema, en los dos tramos, y que `TX_CoordinacionVisita` "no existe y no
existirá". Se dictó el 17-ago-2026 como cierre negativo de esta ficha.

**Justificación de la anulación:** **revisión Héctor diseño v4 revierte la decisión.** Los
cuatro puntos de Pantalla 2 citados arriba piden exactamente la funcionalidad que RO-29
retiró. La regla se dictó sin la revisión del cliente sobre el diseño; la revisión llegó
después y dice lo contrario. RO-29 no se corrige ni se matiza: se anula, porque su
contenido es el opuesto del requisito vigente.

**Lo que hay que reponer** —lista literal, alcance de **P4-TAS**, **no ejecutado en esta
ronda**:

1. **`TX_CoordinacionVisita` en el schema Airtable.** La tabla (13 campos, §2.12 del
   normativo), más `coordinacion_vigente` (formula) en `TX_Solicitudes` y las dos plantillas
   de correo `email_coordinacion_confirmada` y `email_coordinacion_rechazada`. `P0.5-TAS` no
   creó ninguna de las tres cosas por RO-29 (`docs/schema-airtable.md` §26.2 y §26.5).
2. **Los componentes borrados** por CI-027 el 18-ago-2026, recuperables desde `git`:
   `components/tasador/coordinar-visita.tsx` y su `page.tsx` de ruta, con los símbolos
   asociados que arrastraron: **`confirmarCoordinacion`**, **`devolverCoordinacion`** y
   **`MOTIVOS_DEVOLUCION`**.
3. **Los tipos que P1-TAS omitió a propósito** por esta misma decisión:
   **`CoordinacionVisita`**, **`MotivoNoContacto`**, **`MOTIVOS_DEVOLUCION`**,
   **`intento_numero`** y **`AccionCard`** (la unión discriminada de tres variantes
   `coordinar` / `abrir` / `esperando_ejecutiva`, que es el gate de coordinación).

**No se ejecuta ahora.** Esta ronda es documental: cierra la ficha, anula la regla y
reconcilia la spec (v1.9.10). La reposición de schema, tipos y componentes es la **primera
acción de P4-TAS**, antes de cualquier código nuevo.

**Fichas que cambian de sentido por esta anulación** y no se tocan en esta ronda:
**CI-027** (el árbol de UI vuelve a ser de 7 rutas, no de 6, cuando `coordinar-visita.tsx`
se reponga) y **A-17** (el catálogo de motivos vuelve a ser pregunta viva, porque determina
el tipo del campo `motivo` en la tabla que ahora sí se crea).

---

## CI-013 · "Continuar" en la lectura de datos: el spec deja avanzar, el diseño bloquea

| Campo | Valor |
|---|---|
| **Identificador** | CI-013 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.7 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 21 (Pantalla 4, partes 1 y 2) |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.8 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 22 (Pantalla 5, partes 1 y 2) |
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
| **Archivo:línea** | `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 13 y 22 (`components/tasacion-form.tsx`, `IntentosIndicator`, `MAX_INTENTOS = 3` en `use-estado-tasador`) · vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2 (decisión capital 1) y §2.13 |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.10 (footer de acciones) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 27, punto 2 |
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
- **⚠ Síntoma confirmado en código (detectado en P9-TAS · CI-063, 28-ago-2026).** El respaldo `window.print()` que esta ficha describe **está vivo** en `components/tasador/informe-preview.tsx:195`: `handleDescargarPDF` hace `if (tasacion.pdfUrl) window.open(...) else window.print()`. Es exactamente el maquetado del navegador sin la plantilla de Carbone que RF-TAS-21 prohíbe, y hace fallar el criterio de §10.3 (`grep -rn "window.print" app/tasaciones components/tasador` debe dar cero). **No se corrige en la tanda CI-063** —su alcance es sólo la divergencia del preview (bloque 2)— y se deja registrado acá para el frente que construya el footer de §10.3 (P9-TAS.B). La línea puede haberse desplazado por las ediciones de CI-063; buscar por `window.print`, no por número.

---

## CI-017 · El acuse de envío al visador: redirección automática contra pantalla con acción

| Campo | Valor |
|---|---|
| **Identificador** | CI-017 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.10 (acción Confirmar) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 29-30 |
| **Síntoma** | §2.10 decía que al confirmar *"la pantalla muestra un mensaje de agradecimiento antes de redirigir a Pantalla 1"*, y el prototipo lo implementa con un temporizador de 2,5 s. El diseño v4 muestra dos pasos distintos: un diálogo de confirmación previo ("¿Enviar este informe al visador?") y, tras el envío, una pantalla de acuse con un botón "Volver al inicio". La redirección automática puede robar el foco mientras el tasador lee el acuse, y el diálogo previo no estaba especificado en absoluto. |
| **Causa** | La versión anterior describía el desenlace del envío pero no su confirmación, y resolvía el acuse como transición en vez de como pantalla. El envío al visador es irreversible desde IF-03 y merecía confirmación explícita. |
| **Resolución** | Ya aplicada en la documentación: §2.10 de v1.9.9 especifica el diálogo y el acuse, y **RF-TAS-22** fija que no hay redirección por temporizador y que un doble toque produce una sola transición. Pendiente en el código de IF-03, donde hoy vive el temporizador. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | abierta |
| **Origen** | Actualización de §2 contra el diseño v4 (13-ago-2026), Pantalla 7. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **⚠ Síntoma confirmado en código (detectado en P9-TAS · CI-063, 28-ago-2026).** El temporizador que esta ficha describe **está vivo** en `components/tasador/informe-preview.tsx:209`: `handleEnviar` hace `setTimeout(() => router.push("/tasaciones"), 2500)` tras `setEnviado(true)`. Es la redirección automática de 2,5 s que RF-TAS-22 y §10.3 prohíben (`grep -rn "setTimeout" components/tasador/` no debe devolver ninguna redirección). El botón "Volver al inicio" de la pantalla de acuse ya existe, así que la redirección es redundante además de prohibida. **No se corrige en la tanda CI-063** —alcance acotado a la divergencia del preview— y queda para el frente que construya el envío de §10.3 (P9-TAS.B). Buscar por `setTimeout`, no por número de línea.

---

## CI-018 · Contenido de la card de la cola: el spec pide versión, el diseño pide Rol SII, producto y teléfono

| Campo | Valor |
|---|---|
| **Identificador** | CI-018 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.1 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17 |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.1 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17 |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.4 y §2.13 · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` pp. 11-12 (árbol de rutas del App Router) y pp. 17-30 |
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
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.2 y §2.12 (campo `horas_restantes`) · vs `docs/_md/Imagenes_IF_Tasador_v4.pdf` p. 17, punto 1.1, y §5.2.4 (RF-53) del propio spec |
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
- **Confirmada en uso por el cliente (21-ago-2026).** Dejó de ser un hallazgo de escritorio: las pruebas de Héctor sobre el sistema reportan el síntoma exacto que esta ficha anticipaba — al ingresar una solicitud la interfaz muestra días, *"apareció que quedaban dos horas y dos días"*, donde corresponden las horas de la etapa vigente (audios `r21` y `revision 1`). No abre ficha nueva y no cambia el diagnóstico; **sube la prioridad**, porque el usuario final ya está leyendo un número que no significa lo que parece.

---

## CI-022 · Dos tablas de factores de cálculo existen en la base y no están en ningún documento

| Campo | Valor |
|---|---|
| **Identificador** | CI-022 |
| **Archivo:línea** | `docs/schema-airtable.md` §1 (*Dominio C_ · Configuración*, líneas 37-58) y `docs/_md/plan_ejecucion_UItasador_v1.3.md` §3.1 (ruta `GET /api/tasaciones/config/defaults`) · vs base `app9G7lLkIV3CpeLa`, verificada vía Meta API el 17-ago-2026 |
| **Síntoma** | La base tiene **`C_FactoresHomogeneizacion`** (`tblep24N9gPMrDPIN`, 8 campos) y **`C_Factores`** (`tblNHze3ZZYJblJ7S`, 14 campos). Ninguna de las dos aparece en el inventario de tablas de `docs/schema-airtable.md`, ni en el plan de IF-03, ni en la spec. Lo que ambos documentos nombran como origen de los factores de homogeneización es **`C_VariablesCliente`** (`tblgrY8j4ugFzS7v9`), que es una tabla **clave-valor genérica** —`clave · valor · tipo · activa · cliente · valor_defecto · descripcion`— sin ninguna columna de factores. Consecuencia concreta: **`GET /api/tasaciones/config/defaults` (RF-TAS-08) no se puede construir desde la documentación**. Quien la escriba siguiendo el plan leerá `C_VariablesCliente` buscando `factor_sup`, `factor_edad` y `factor_distancia`, que ahí no existen como campos. |
| **Causa** | La spec §2.8 dice que los defaults viven en *"`C_VariablesCliente` / tabla de factores según §5.4"*. La disyunción quedó sin resolver y `docs/schema-airtable.md` sólo documentó la primera rama. Las dos tablas de factores se crearon en la base en algún momento del diseño del motor AT01-AT10 y nunca entraron al snapshot de schema, que se ha ido ampliando por secciones (§13, §18, §20, §21, §26) sin un pase completo sobre el dominio `C_`. |
| **Resolución** | ✅ **CERRADA (17-ago-2026) — la parte documental se ejecutó; la decisión de negocio se escaló a A-18.** <br>**(a) Hecho:** las tres tablas quedan documentadas abajo con campos, tipos y FIELD_IDs, levantados vía Meta API. No hay que volver a consultarlos. <br>**(b) Ejecutado y resuelto en negativo:** se leyeron las filas de las tres. `C_FactoresHomogeneizacion` es la canónica por descarte —única con filas de homogeneización— pero **no puede servir un valor por defecto**: `valor_referencia` está vacío en las 15. `C_Factores` está poblada y sana pero es **otra cosa** (coeficientes del motor de valoración). `C_VariablesCliente` está vacía a efectos prácticos. <br>**(c) Escalado:** lo que queda no es documentación ni código sino **carga de configuración con criterio de negocio**, y vive en **`docs/_sync_ifTasador_v1/gap/_ambiguedades.md` · A-18** (dueños: Héctor y Óscar). Corregir el plan §3.1 y la spec §2.8 para que nombren la tabla elegida es tarea del próximo bump normativo, **una vez A-18 responda cuál es**. |
| **Dueño** | Claude Code (documentación, **hecha**) · **Héctor y Óscar** vía A-18 (elección de tabla y carga de valores) |

**Enmienda del 22-ago-2026 — el escalamiento a A-18 se estrecha.** Esta ficha escaló a A-18 dos
cosas juntas: *qué tabla* es la canónica y *qué valores* lleva. El cierre de **A-28** despeja una
tercera que no estaba explícita y que las condicionaba a ambas —**qué factores** hay que servir—:
Héctor ratificó los tres de RF-TAS-08, de modo que la tabla que se elija debe servir
`factor_sup`, `factor_edad` y `factor_distancia`, y no un modelo alternativo.

Estado real de lo escalado, al 22-ago-2026: **qué factores → resuelto**; **qué valores →
bloqueante, única pregunta viva de A-18**; **qué tabla es canónica → deuda de schema, no
bloqueante** (junto con `Edad`/`Antiguedad` y las cáscaras `FH-`). La corrección del plan §3.1 y
de la spec §2.8 para nombrar la tabla elegida sigue esperando esa decisión de schema, no la de
negocio.

**Enmienda del 23-ago-2026 — el escalamiento se extingue: la tabla queda sin consumidor.**
**A-18 cerró por disolución del requisito** (spec §15 · D-24), no por respuesta. Al cerrar A-13 a
favor de una sección D de **sólo lectura** poblada por extracción de la foto del cuadro, no queda
ningún campo de factor que el tasador teclee, **RF-TAS-08 pierde su conjunto 1** y
`GET /api/tasaciones/config/defaults` deja de construirse por falta de propósito.

Consecuencia para esta ficha: **`C_FactoresHomogeneizacion` (`tblep24N9gPMrDPIN`) pasa a ser una
tabla sin consumidor en IF-03.** No se borra —es trabajo de schema con su propia compuerta de
aprobación— pero sale de la ruta crítica, y con ella las tres deudas de saneamiento
(`Edad`/`Antiguedad`, las cáscaras `FH-`, cuál es canónica), que quedan **sin consumidor
conocido**. La corrección del plan §3.1 y de la spec §2.8 para "nombrar la tabla elegida" **ya no
tiene objeto**: no hay tabla que elegir porque no hay quien lea.

⚠ **Lo que no se extingue.** La cifra que A-18 pedía —el valor por defecto de cada factor— **nunca
se respondió**. Si una versión futura reintroduce captura o cálculo de homogeneización, esta ficha
y A-18 reviven juntas. Y queda registrado en **A-44** que **D-21** ratificó los tres factores como
vigentes el 22-ago-2026 mientras el cuadro que el tasador fotografía no los contiene.
| **Fecha objetivo** | Documentación: **cerrada 17-ago-2026**. Lo demás: **extinguido** con el cierre de A-18 el 23-ago-2026. |
| **Estado** | **cerrada** (17-ago-2026) · **sin bloqueo vivo desde el 23-ago-2026** — ver la enmienda al pie |
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
| **Archivo:línea** | `lib/tasador/tasaciones.ts:704` (`InformeData`, 68 campos · reubicado en P7-TAS.0) · `docs/_md/VProperty_Origen_Datos_Informe_v1.1.md` §3.3 (tabla *Campo del informe → Campo en TX_DatosTasacion*, líneas 492-548) · vs base `app9G7lLkIV3CpeLa`, schema levantado vía Meta API el **18-ago-2026** |
| **Síntoma** | `PATCH /api/tasaciones/[id]/datos` (RF-TAS-16 · RF-TAS-17) debe persistir las secciones A-H sobre `TX_DatosTasacion` (83 campos) más cuatro tablas hijas. Al contrastar los 68 campos de `InformeData` contra el schema real aparecen **tres clases de fallo distintas**: (1) **26 campos no tienen columna destino en ninguna de las seis tablas**; (2) **`dfl2` existe pero es una fórmula** —escribirla devuelve 422—; (3) **cuatro pares de homónimos**, de los cuales los tres de la sección H tienen el campo de nombre obvio equivocado y el correcto es el que ningún documento nombra. La documentación no permite detectar ninguno de los tres: §3.3 nombra campos que no existen y omite los que sí. |
| **Causa** | `InformeData` se derivó del formulario v0 (`components/tasador/tasacion-form.tsx`), que es una maqueta de UI diseñada sin contraste contra la base. `TX_DatosTasacion` creció por acumulación —bloque SII de §20.6, campos del motor AT03, campos de la extracción RF-09— sin un pase de consolidación, de lo que quedan pares como `anio_construccion`/`anno_construccion` conviviendo. `VProperty_Origen_Datos_Informe_v1.1.md` §3.3 es un documento de **diseño de origen de datos**, no un snapshot de schema, y nunca se verificó contra la base. Es el mismo patrón que P1-TAS encontró en los catálogos de `OPCIONES` (8 de 9 mal por derivarlos de documentación). |
| **Resolución** | ⚠ **PARCIAL — la ruta se construye sobre el subconjunto verificado; la decisión de modelado se difiere a P7-TAS.** <br>**(a) Hecho en P2-TAS.A:** `PATCH /datos` persiste **únicamente los 39 campos escalares con destino verificado** más las 4 colecciones hijas. Los 26 huérfanos se listan de forma explícita en el docblock de `app/api/tasaciones/[id]/datos/route.ts` y abajo en esta ficha. La ruta **no los acepta en silencio**: lo que no tiene dónde guardarse, no se guarda y queda declarado. <br>**(b) Diferido a P7-TAS**, que es la tanda dueña del formulario de 8 secciones: decidir si los 26 huérfanos se crean como campos en Airtable (requiere aprobación explícita de Sergio · `CLAUDE.md`), si se retiran de `InformeData` por no ser datos que el negocio necesite persistir, o si se consolidan en los `multilineText` que ya existen (`elementos_interiores`, `espacios_comunes`, `notas_campo`). **Precedente exacto:** P1-TAS dejó `Comodidades` sin tabla destino con esta misma forma de cierre. <br>**(b.1) P7-TAS.A.3 (23-ago-2026) — decidido sólo lo que toca al borrador (T-A.3-1):** `clearPayload()` **no se automatiza**; el borrador local no se descarta tras un PATCH exitoso, de modo que los huérfanos **sobreviven ahí** en vez de perderse en silencio. Su único borrado es el botón «Descartar» del banner de recuperación, que además **resiembra las claves de foto** porque no tienen otra fuente hasta P7-TAS.A.4. <br>⚠ Dos precisiones de conteo que salieron al aterrizar esto: los 14 booleanos de `Comodidades` viajan en **una sola clave** (`comodidades`), así que `noPersistidos[]` devuelve como máximo **23** entradas, nunca 37; y los **5 sub-campos** de colección (`Recinto.material` · `Recinto.iluminacion` · `Recinto.estado` · `Ampliacion.nPe` · `ItemValoracion.origenSuperficie`) **no aparecen nunca** en `noPersistidos[]`, porque viven dentro de colecciones que sí se persisten. Ninguna decisión basada en esa lista puede protegerlos. <br>**Esto no cierra la ficha:** si los huérfanos se crean como campos en Airtable, se retiran de `InformeData` o se consolidan en los `multilineText` existentes sigue **abierto** y es decisión de Sergio y Héctor. <br>**(c) Documental, próximo bump:** corregir la tabla §3.3 de `VProperty_Origen_Datos_Informe_v1.1.md`. **No se tocó el documento en esta tanda.** |
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

> Se suman los **14 booleanos de `Comodidades`**, que P1-TAS ya declaró sin tabla destino en el docblock de `lib/tasador/tasaciones.ts:638`. No se recuentan acá; misma resolución y misma tanda (P7-TAS).

### 2 · `dfl2` es una fórmula, no un campo escribible

`TX_DatosTasacion.dfl2` (`fldtyMwl3SZwTRN4h`) es de tipo `formula`:

```
IF({fldhsMeHuyoUMnvqq} < 140, 'SI', 'NO')     ← {sup_construida_total}
```

`InformeData.dfl2` es `boolean` y el formulario v0 lo presenta como un control editable. **Son incompatibles**: un PATCH contra esa columna devuelve 422. Además la semántica difiere — la fórmula deriva DFL-2 de la superficie construida total (< 140 m²), mientras el v0 deja que el tasador lo declare.

`sup_construida_total` es a su vez fórmula sobre `sup_construida_piso1` + `sup_construida_piso2`, **no** sobre `sup_construccion_m2`. Escribir la superficie en el campo que §3.3 nombra (`sup_construida` → real `sup_construccion_m2`) **no mueve `dfl2`**.

→ `/datos` **no escribe `dfl2`** y lo devuelve en el GET como valor derivado de sólo lectura. Que el formulario deje de ofrecerlo como editable es tarea de **P7-TAS**.

### 3 · `Recinto` es ancho; `TX_TerminacionesPorRecinto` es largo

`Recinto` (`lib/tasador/tasaciones.ts:620`) tiene 7 atributos en un objeto. La tabla real modela **una fila por (recinto, categoría)**, con `categoria` en dominio cerrado `Pisos · Muros · Cielos · Puertas · Ventanas · Cocina · Banos`.

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
| **Archivo:línea** | `docs/schema-airtable.md` §1 (`TX_DocumentosGenerados` · `tbl5sYnGPZXgYCBSY`, documentada como *"No usada en IF-02"* y sin tabla de campos) · `docs/_md/plan_ejecucion_UItasador_v1.3.md` §10.1 (cabecera del preview: *"la versión del informe debe coincidir con la del registro vigente de `TX_DocumentosGenerados` para esa solicitud"*) · vs base `app9G7lLkIV3CpeLa`, verificada vía **MCP** el 18-ago-2026 |
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

---

> ## Entradas CI-027 a CI-035 · tanda P2-TAS.B (18-ago-2026)
>
> Las nueve nacen de la misma tanda: la capa cliente de IF-03 y el cierre del build verde
> (OV-7). **Cinco se anticiparon en el diseño del diff** y cuatro aparecieron **escribiendo el
> código**, que es donde el contraste v0 ↔ backend real se vuelve verificable. Tres de esas
> cuatro (CI-032, CI-033, CI-035) son defectos de comportamiento que ningún test del repo
> habría revelado, porque no hay test que cubra el v0.
>
> **Dueño y Fecha objetivo van en blanco en las nueve** — excepción declarada **C-12**, las
> llena el usuario. Imputarlos desde la tanda generaría compromisos que nadie acordó y que por
> tanto nadie revisa; en blanco fuerzan el pase explícito cuando corresponda.

## CI-027 · `coordinar-visita.tsx` y su ruta se borran por RO-29: el árbol queda en 6 rutas de UI contra las 7 que declara CI-020

| Campo | Valor |
|---|---|
| **Identificador** | CI-027 |
| **Archivo:línea** | `components/tasador/coordinar-visita.tsx` (512 líneas · **borrado**) · `app/tasaciones/[id]/coordinar/page.tsx` (**borrado**) · contraste con `docs/CODE_INCONSISTENCIES.md` · CI-020 |
| **Síntoma** | El árbol de rutas de UI de IF-03 tiene **6 páginas**, no 7: `/tasaciones`, `/tasaciones/[id]`, `…/estado`, `…/fotos`, `…/informe`, `…/lectura`. CI-020 documenta **siete rutas** como el árbol correcto, cifra tomada del diseño v4 y del prototipo v0. Un lector que verifique el conteo contra CI-020 encontrará una ruta de menos y puede concluir que falta construirla. |
| **Causa** | **RO-29** (17-ago-2026) cerró CI-012 en sentido negativo: la coordinación de visitas —ejecutiva ↔ tasador y tasador ↔ visador— **no se soporta por sistema**, es manejo telefónico fuera de plataforma, y `TX_CoordinacionVisita` no existe ni se creará. Los dos archivos implementaban RF-TAS-04 y RF-TAS-05, que quedaron sin objeto: `coordinar-visita.tsx` importaba `confirmarCoordinacion`, `devolverCoordinacion` y `MOTIVOS_DEVOLUCION`, tres símbolos que P1-TAS **deliberadamente no tipó** por la misma decisión. El archivo aportaba **13 de los 42 errores** de `tsc` y no tenía destino posible. |
| **Resolución** | ✅ **EJECUTADA (18-ago-2026).** Los dos archivos se borraron con autorización explícita de Sergio. `git` conserva la historia; no se dejaron `.bak` ni exclusiones de `tsconfig`, que habrían dejado 512 líneas muertas y una exclusión que alguien tendría que recordar. <br>**Lo que queda por hacer es documental, no de código:** actualizar CI-020 y el Blueprint para que el árbol declarado sea de **6 rutas**, citando RO-29 como la causa. Mientras no se haga, la discrepancia de conteo es real y esta ficha es lo único que la explica. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · sólo por la parte documental · el código ya está en su estado final |
| **Origen** | P2-TAS.B (18-ago-2026), al mapear los 42 errores de `tsc` a sus causas: 14 de ellos colgaban de dos archivos sin destino. |

**Por qué no es un incumplimiento.** El criterio de aceptación de CI-020 se escribió antes de
RO-29. Una decisión de producto posterior redujo el alcance, y el árbol de 6 rutas es el
**resultado correcto** de aplicarla. Registrar la diferencia es lo que impide que la próxima
tanda «arregle» el conteo reconstruyendo una pantalla que el negocio descartó.

---

## CI-028 · `marcarPdfListo` no tiene ruta backend: el envío del informe al visador no existe como escritura

| Campo | Valor |
|---|---|
| **Identificador** | CI-028 |
| **Archivo:línea** | `lib/tasador/tasaciones.ts:1444` · `marcarPdfListo()` (**stub declarado**) · `components/tasador/informe-preview.tsx:170` (llamador) · contraste con `app/api/tasaciones/**` (11 rutas) y con el plan §3.1 (tabla de 15 filas) |
| **Síntoma** | La Pantalla 7 tiene un botón que envía el informe y avanza a una pantalla de agradecimiento. **Ninguna ruta de IF-03 escribe esa transición.** P2-TAS.A construyó once rutas y ninguna toca el estado en ese sentido; el plan §3.1, que enumera quince, **tampoco la lista**. El v0 lo resolvía mutando un array en memoria, así que el hueco no se veía. |
| **Causa** | El set de rutas del plan se derivó de las pantallas de lectura y de las mutaciones evidentes (`/calcular`, `/rechazo`, `/coordinacion`, `/fotos`, `/datos`). La transición de **envío** del informe quedó fuera: en la máquina de estados oficial, `calculada → pdf_listo` la escribe el **pipeline PDF** (E1/E2/E3), no el tasador, y esa lectura hizo que pareciera cubierta. Pero el botón de §7.5 es una acción del tasador y necesita persistir algo — como mínimo, la marca de que el tasador dio el informe por bueno. **Qué escribe exactamente, y sobre qué campo, no está definido en ningún documento.** |
| **Resolución** | ⚠ **NO SE RESUELVE EN P2-TAS.B — falta la definición, no el código.** <br>**(a) Hecho:** `marcarPdfListo(id)` existe con la firma que el llamador espera, **no persiste nada**, y emite un `console.warn` que nombra el hueco y remite a esta ficha. El docblock lo declara stub en su primera línea. <br>**(b) Por qué stub y no una ruta inventada:** cablear contra un endpoint adivinado habría sido peor que no cablear — el botón diría «enviado» y el informe se quedaría donde está, que es exactamente el verde falso que esta tanda rechazó en el hallazgo del ensanchado de proyecciones. <br>**(c) Lo que hay que decidir antes de escribir la ruta:** qué campo se escribe, si hay transición de estado o sólo una marca de conformidad del tasador, y si el visador recibe aviso (ligado a **A-15**, hoy resuelta en negativo para el rechazo). |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · **no bloquea P2-TAS.B** · el comportamiento visible es idéntico al del v0 |
| **Origen** | P2-TAS.B (18-ago-2026), al cablear las funciones del v0 contra las rutas reales: nueve encontraron destino y ésta no. |

---

## CI-029 · `TipoDocumento.obligatorio` no existe en Airtable ni tiene equivalente conceptual para el Tasador

| Campo | Valor |
|---|---|
| **Identificador** | CI-029 |
| **Archivo:línea** | `components/tasador/sheet-documentos.tsx` (antes `:54`, `:147-148`) · `lib/tipos-documento.ts:76-85` (interface `TipoDocumento`) · `docs/schema-airtable.md:311` (`requerido_por_ejecutiva`) |
| **Síntoma** | El sheet documental del tasador partía el checklist en dos grupos, **«Obligatorios»** y **«Opcionales»**, leyendo `d.obligatorio` de cada tipo de documento. **Ese campo no existe**: ni en la interface `TipoDocumento` de `lib/tipos-documento.ts`, ni en la tabla `D_TipoDocumento` de Airtable. El v0 compilaba contra un tipo imaginario. |
| **Causa** | Dos capas de error superpuestas. La primera es del v0: inventó el campo junto con `documentosPara()`, una función que tampoco existe. La segunda es más sutil — **el concepto no está definido para este actor**. `D_TipoDocumento` sí tiene `requerido_por_ejecutiva` (`fldhKxTGC76faGGv3`, checkbox), pero es el checklist **de la Ejecutiva** al dar de alta la solicitud, no el del Tasador en terreno: son dos momentos, dos actores y dos conjuntos de documentos. Usarlo habría mezclado los dominios y producido un «obligatorio» que nadie declaró como tal para el tasador. |
| **Resolución** | ✅ **RESUELTA EN NEGATIVO (18-ago-2026), por instrucción explícita de Sergio.** <br>**(a) Hecho:** el sheet muestra **una sola lista**, sin la etiqueta Obligatorio/Opcional. En su lugar, cada fila muestra `entidad_emisora`, que sí es un dato real del catálogo. El filtro por condición de la propiedad se conserva y ahora pasa por `documentoAplicaA()` de `lib/tasador/tipo-propiedad.ts` (P-5), que ya existía. <br>**(b) Lo que NO se hizo, y por qué:** no se agregó `obligatorio` a `lib/tipos-documento.ts`. Ese archivo es territorio de **IF-02** y R5 prohíbe editarlo sin autorización; Sergio la denegó con el fundamento correcto — forzar `requerido_por_ejecutiva` mezcla dominios, e inventar el campo repite el error de clase **A-18** (fabricar un dato que el negocio no definió). <br>**(c) Lo que queda por decidir:** si el modelo necesita un `requerido_por_tasador` en `D_TipoDocumento`, o si prescinde de la distinción. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · el código está en un estado correcto y honesto; falta la decisión de modelo |
| **Origen** | P2-TAS.B (18-ago-2026), al resolver OV-10: el `tipoDocumentoLabel` ausente destapó que el archivo importaba **tres** símbolos inexistentes, no uno. |

---

## CI-030 · Enmienda a OV-4: `getTasacion` no podía vivir en el módulo de tipos y catálogos sin filtrar `AIRTABLE_TOKEN` al bundle cliente

| Campo | Valor |
|---|---|
| **Identificador** | CI-030 |
| **Archivo:línea** | `lib/tasador/lectura-tasacion.ts` (**nuevo**) · `lib/tasador/tasaciones.ts:34-47` (docblock enmendado · reubicado en P7-TAS.0) · `app/tasaciones/[id]/*/page.tsx` (5 imports reescritos) · contraste con **OV-4** en `docs/_notas/inventario-tasador.md` |
| **Síntoma** | OV-4 fijó `@/lib/tasaciones` —hoy `@/lib/tasador/tasaciones`— como hogar único de todo lo que el v0 importaba desde esa ruta, incluida `getTasacion()`. Aplicado al pie de la letra, eso obligaba a poner una lectura de Airtable —con `AIRTABLE_TOKEN` y el cliente REST— dentro de un módulo que **importan componentes cliente** (`OPCIONES`, `CATEGORIAS_FOTO` y los tipos se usan en `"use client"`). El resultado habría sido el token y el cliente HTTP en el bundle del navegador. |
| **Causa** | OV-4 se decidió en **P1-TAS**, una tanda que sólo escribía tipos. En ese contexto la regla era correcta y sin efectos secundarios: los tipos se borran en compilación y no llegan al bundle. La regla **no contempló módulos server-only** porque todavía no existía ninguno. Es una regla buena aplicada fuera del dominio en que se formuló, no una regla equivocada. |
| **Resolución** | ✅ **EJECUTADA (18-ago-2026), con aprobación explícita de Sergio.** <br>**(a) Alcance conservado de OV-4:** el módulo de tipos y catálogos —`lib/tasador/tasaciones.ts` desde P7-TAS.0— sigue siendo el hogar único de **tipos y catálogos**, y ahora también de las funciones cliente que no tocan Airtable (`resolverLimite`, `resolverInforme`, `marcarVisitada`, `guardarObservacionRechazo`, `marcarPdfListo`). <br>**(b) Lo que se movió:** `getTasacion` → `leerTasacion()` en `lib/tasador/lectura-tasacion.ts`, junto con `leerCola()` y el mapper `proyectarTasacion()`. Los 5 Server Components reescribieron su import. <br>**(c) Beneficio no buscado:** el mapper quedó compartido con `GET /api/tasaciones` y `GET /api/tasaciones/[id]`, de modo que la pantalla y el API **no pueden divergir**: es el mismo mapeo o ninguno. <br>**(d) Regla derivada:** en `lib/tasaciones.ts` sólo entra lo que un componente cliente pueda importar sin riesgo. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada** (18-ago-2026) |
| **Origen** | P2-TAS.B (18-ago-2026), al descubrir que ninguna de las dos rutas GET servía la forma `Tasacion` y había que decidir dónde vivía la lectura. |

---

## CI-031 · A-18 deja de bloquear el frente cliente: `factores-default` se construye como módulo de forma pura, sin precargar

| Campo | Valor |
|---|---|
| **Identificador** | CI-031 |
| **Archivo:línea** | `lib/tasador/factores-default.ts` (**nuevo**) · `components/tasador/form-sections/seccion-comparables.tsx:21` (import reubicado) · contraste con **A-18** en `docs/_sync_ifTasador_v1/gap/_ambiguedades.md:506` |
| **Síntoma** | A-18 se venía tratando como bloqueante de **todo** lo relacionado con factores de homogeneización, incluida la existencia del módulo. Consecuencia: `seccion-comparables.tsx` importaba un archivo inexistente, y ese único import mantuvo **`pnpm build` en rojo** —con la pantalla del informe sin compilar— después de haberse resuelto los otros 41 errores de `tsc`. |
| **Causa** | Se confundieron dos cosas distintas bajo una sola ficha. A-18 bloquea **precargar valores**: ninguna tabla de configuración puede servir hoy un factor por defecto (`C_FactoresHomogeneizacion.valor_referencia` vacío en las 15 filas; `C_Factores` es otra cosa; `C_VariablesCliente` vacía), y elegir uno es decisión de negocio. Pero **la forma no depende de esa respuesta**: los tres factores son campos que **teclea el tasador**, y la aritmética de homogeneización está definida desde siempre. |
| **Resolución** | ✅ **EJECUTADA (18-ago-2026), con fundamento aprobado por Sergio.** <br>**(a) Hecho:** `nuevoComparable()` devuelve un comparable con `factorSup`, `factorEdad` y `factorDistancia` en `""`; `ufHomogeneizada(c)` calcula `totalUf × factorSup × factorEdad × factorDistancia` sobre lo tecleado y devuelve `null` si falta cualquiera. **Cero valores numéricos por defecto, cero lectura de configuración, cero red.** <br>**(b) A-18 queda intacta:** sigue abierta para la precarga desde `GET /api/tasaciones/config/defaults`, que entra en **P7-TAS** cuando Héctor y Óscar respondan. ⚠ **Superado el 23-ago-2026** — A-18 cerró por disolución y esa precarga nunca va a llegar; ver la enmienda al pie. Cuando llegue, rellena esos tres campos antes de pintarlos y **este módulo no cambia**. <br>**(c) Efecto colateral:** cerró **OV-7** — primer `pnpm build` verde desde que el código v0 entró al repo. <br>**(d) Deuda menor · OV-6:** el nombre `factores-default` sugiere lo que RF-TAS-08 prohíbe y **miente sobre el contenido**: acá no hay ningún default. Se conservó por ser la ruta que el v0 importa. Renombrarlo es gratis si P7-TAS toca el archivo. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada** · desde el 23-ago-2026 el módulo que produjo **queda sin consumidor**: ver la enmienda al pie |
| **Origen** | P2-TAS.B (18-ago-2026): el build rojo con un solo error obligó a separar qué parte de A-18 bloqueaba de verdad. |

**Enmienda del 22-ago-2026 — la separación que hizo esta ficha resultó ser la correcta.** Héctor
ratificó que los tres factores —superficie, edad y distancia— **se usan en la práctica** (cierre de
**A-28**), de modo que la aritmética de `ufHomogeneizada()` y la forma de `nuevoComparable()`
quedan validadas contra el negocio y **no se tocan**. El riesgo latente que A-28 había introducido
—que la práctica real fuesen otros dos factores y hubiera que reescribir el módulo— **queda
descartado**.

Lo que **no** cambia: la precarga sigue esperando. Ratificar *qué* factores no dice *cuánto* vale
cada uno, y `C_FactoresHomogeneizacion.valor_referencia` sigue vacío en sus 15 filas. **A-18 sigue
abierta**, ahora con una sola pregunta bloqueante —el valor por defecto de cada factor— y sus otras
tres degradadas a deuda de schema. Cuando llegue la cifra, rellena esos tres campos antes de
pintarlos y este módulo sigue sin cambiar, tal como (b) anticipaba.

**Enmienda del 23-ago-2026 — el módulo pierde su consumidor, y la lección se invierte.** **A-13
cerró**: los comparables llegan por extracción de la foto del cuadro y **la sección D pasa a sólo
lectura**. Con la grilla editable cae la captura de los tres factores, y con ella la razón de ser
de `nuevoComparable()` y de `ufHomogeneizada()`. **A-18 cierra por disolución** (spec §15 · D-24):
la precarga que este módulo esperaba ya no va a llegar, porque no hay campo que precargar.

Qué hacer con el archivo es decisión de **P7-TAS**, y hay un criterio en la lista de aceptación de
esa tanda. Lo que no se debe hacer es dejarlo importado "por si acaso": sería un módulo de
homogeneización vivo en una pantalla que no homogeneiza, y el nombre —`factores-default`— ya
mentía sobre su contenido (**OV-6**).

> **La lección, para la próxima.** La separación que hizo esta ficha —forma ahora, valores
> después— fue correcta y desbloqueó el build. Pero el desenlace muestra su límite: **construir la
> forma antes de que el negocio confirme que el dato se captura apuesta a que la captura existirá.**
> Acá esa apuesta se perdió por completo, y el costo fue acotado sólo porque el módulo era pequeño
> y puro. Cuando lo que espera respuesta es *si un dato se captura* —y no sólo *cuánto vale*—, la
> forma también está en duda.

---

## CI-032 · El v0 disparaba **dos** `POST /calcular` por cada envío: el segundo se comía el 409 de RF-TAS-07 sin visibilidad

| Campo | Valor |
|---|---|
| **Identificador** | CI-032 |
| **Archivo:línea** | `components/tasador/tasacion-form.tsx` · `handleCalcular()` (antes `:167-170`) · `app/api/tasaciones/[id]/calcular/route.ts` (guard 409) |
| **Síntoma** | El handler del botón «Calcular Tasación» llamaba en secuencia `marcarVisitada(tasacion.id)` **y** `enviarParaCalculo()`, y navegaba de inmediato. Cableadas contra el backend real, **las dos golpean `POST /api/tasaciones/[id]/calcular`**: la primera ejecutaba la transición `asignada → visitada` y la segunda recibía el **409** del guard de RF-TAS-07. Ninguna de las dos tenía `await` ni manejo de error, y la navegación ocurría pase lo que pase, así que **el 409 se descartaba en silencio**. |
| **Causa** | En el v0 eran dos operaciones distintas sobre un store en memoria: `marcarVisitada` mutaba el estado local y `enviarParaCalculo` simulaba el envío. Ninguna hacía red. Al cablear ambas contra el backend, se convirtieron en **la misma escritura llamada dos veces** — una colisión que no existía en el original y que sólo aparece al sustituir el store por rutas reales. Es **clase A-15**: un defecto que nace del cambio de sustrato, no del código en sí. |
| **Resolución** | ✅ **CORREGIDA (18-ago-2026).** <br>**(a)** Queda **una sola llamada**, la del hook (`enviarParaCalculo()`), que además refresca el estado que sondea la pantalla de avance. `marcarVisitada` se retiró del handler; la función sigue exportada porque es el cableado correcto de `POST /calcular` para otros llamadores. <br>**(b)** El handler pasó a `async` con `await`: **no navega si la escritura falla**, y muestra el literal humano que devuelve la ruta. <br>**(c)** Regla D completa: `calculando` bloquea el re-click, el botón entra en su estado `blocked` —que ya renderizaba spinner y «Cálculo en curso»— y el reset va en `finally`, no en `catch`. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada** (18-ago-2026) |
| **Origen** | P2-TAS.B (18-ago-2026), al reemplazar las funciones del store del v0 por llamadas a rutas: las dos del handler resolvieron al mismo endpoint. |

**Por qué ningún test lo habría cazado.** No existe cobertura del v0 —ni la habrá: es código
que las tandas de UI reescriben—, y los tests de `calcular/route.test.ts` prueban el
**servidor**, donde el comportamiento es correcto: el 409 se emite y sólo hay una escritura.
El defecto vivía enteramente en el cliente, en el hueco entre dos funciones que nadie había
mirado juntas. Se encuentra leyendo, no ejecutando.

---

## CI-033 · `estado-procesando` disparaba la transición irreversible desde un efecto de montaje: un F5 bastaba para lanzar AT03

| Campo | Valor |
|---|---|
| **Identificador** | CI-033 |
| **Archivo:línea** | `components/tasador/estado-procesando.tsx` · `useEffect` de arranque (antes `:73-76`) · `app/tasaciones/[id]/estado/page.tsx` (ruta que lo monta) |
| **Síntoma** | El componente ejecutaba `if (esCalculo && estado === "BORRADOR") enviarParaCalculo()` dentro de un `useEffect` **sin más condición que el montaje**. Contra el backend real, eso convierte cualquier llegada a `/tasaciones/[id]/estado` con la solicitud todavía en `asignada` —un refresco de página, el botón atrás, un enlace compartido, una URL pegada— en la transición `asignada → visitada`, que **dispara AT03 aguas abajo y no se deshace desde la UI**. |
| **Causa** | El v0 lo puso a propósito, para cubrir el caso de recargar la URL directamente y que la simulación no se quedara congelada. Contra un store en memoria era inocuo: sólo cambiaba una variable local. La peligrosidad aparece al sustituir el store por una escritura real e irreversible, sin que el código que la dispara cambie ni una línea. Mismo mecanismo que **CI-032**. |
| **Resolución** | ✅ **CORREGIDA (18-ago-2026).** El efecto se eliminó. Quien ordena la transición es **el botón «Calcular Tasación» del formulario**, que la dispara con las once validaciones de sección ya hechas. Quien caiga en esta pantalla sin haber pasado por el botón ve el stepper en su fase inicial y no avanza — que es la lectura correcta de la realidad: no hay ningún cálculo corriendo. El razonamiento quedó escrito en el sitio, en un bloque `⚠`, para que nadie lo «arregle» reponiéndolo. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada** (18-ago-2026) |
| **Origen** | P2-TAS.B (18-ago-2026), al remapear los literales de estado del v0 (`BORRADOR`, `EN_CALCULO`, `INFORME_DISPONIBLE`, `APROBADO`) a los del backend real. |

**Regla que deja.** Un efecto de montaje no puede ser el disparador de una escritura
irreversible. El montaje no expresa intención del usuario: ocurre por navegación, por
recarga, por hidratación y por remontajes de React que el código no controla.

---

## CI-034 · `server-only` no está en `package.json`: la frontera cliente/servidor de dos módulos es convención, no cinturón

| Campo | Valor |
|---|---|
| **Identificador** | CI-034 |
| **Archivo:línea** | `lib/tasador/lectura-tasacion.ts` (docblock, bloque `⚠`) · `lib/solicitudes.ts` (IF-02, mismo caso) · `package.json` (sin la dependencia) · `pnpm-lock.yaml:2314` (presente como transitiva de Next) |
| **Síntoma** | Dos módulos que leen Airtable con `AIRTABLE_TOKEN` —`lib/tasador/lectura-tasacion.ts` en IF-03 y `lib/solicitudes.ts` en IF-02— **no declaran `import 'server-only'`**. Nada impide mecánicamente que un componente cliente los importe; lo único que lo evita es la convención y el hecho de que arrastrarían `lib/airtable-client` al bundle. |
| **Causa** | `server-only` aparece en el lockfile **sólo como dependencia transitiva de Next.js**, no en `package.json`. Importarlo desde código propio habría agregado una dependencia directa no declarada, contra el criterio de **cero dependencias nuevas** que P2-TAS.A y P2-TAS.B mantuvieron. Se optó por la consistencia con el precedente de IF-02, que lleva meses en producción con la misma garantía por convención. |
| **Resolución** | ⚠ **NO SE RESUELVE EN P2-TAS.B — requiere tocar `package.json`.** <br>**(a) Hecho:** el docblock de `lectura-tasacion.ts` declara explícitamente que la separación es por convención y no por `server-only`, y señala que si la dependencia entra al proyecto, ese archivo es el primero que debería usarla. <br>**(b) Lo que hay que evaluar:** agregar `server-only` como dependencia directa y envolver **ambos** módulos. Es barato y convierte un error silencioso de seguridad en un error de compilación. <br>**(c) Riesgo real hoy:** bajo pero no nulo. Un `import` desde un componente `"use client"` rompería el build igualmente al arrastrar el cliente REST — pero con un mensaje que no nombra el problema, y un desarrollador apurado podría «resolverlo» moviendo código en la dirección equivocada. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · **no bloquea** · afecta a IF-02 e IF-03 por igual |
| **Origen** | P2-TAS.B (18-ago-2026), al escribir `lectura-tasacion.ts`: el `import 'server-only'` se escribió, se verificó contra `package.json` y se retiró. |

---

## CI-035 · `datosEjecutiva.contactoTelefono` sale de `vendedor_telefono`, no de `TX_ContactosVisita`

| Campo | Valor |
|---|---|
| **Identificador** | CI-035 |
| **Archivo:línea** | `lib/tasador/lectura-tasacion.ts` · `proyectarTasacion()`, bloque `datosEjecutiva` · consumidor en `components/tasador/tasacion-card.tsx:46` (`tel:` href) y `:91` |
| **Síntoma** | La card de la cola muestra un teléfono de contacto con enlace `tel:` — el dato operativo más importante de la pantalla ahora que **RO-29** dejó la coordinación en manos del teléfono. Ese número se toma de `TX_Solicitudes.vendedor_telefono`, **no** de `TX_ContactosVisita`, que es la tabla dedicada a los contactos de visita y tiene varios por solicitud con su campo `ordenPrioridad`. |
| **Causa** | Decisión de coste tomada al escribir el mapper: `TX_ContactosVisita` es una tabla hija y resolverla por cada fila de la cola serían **N lecturas adicionales** en la pantalla que más se abre del flujo. `vendedor_telefono` vive en la misma fila de `TX_Solicitudes` que el resto de la proyección y no cuesta ninguna lectura extra. Es una aproximación razonable —el vendedor suele ser quien abre la puerta— pero **es una aproximación**, y no está respaldada por ningún RF. |
| **Resolución** | ✅ **CERRADA en P3-TAS.A (19-ago-2026).** La card muestra el contacto de **prioridad 1 de `TX_ContactosVisita`**, resuelto por `lib/tasador/contactos-cola.ts` en **una sola lectura para toda la cola** —el objetivo de coste que motivó el descarte original— gracias al lookup `solicitud_record_id` (`fldYNKk5cyfWLxwqD`), que expone el recordId de la solicitud como texto y evita casar por `codigo_solicitud`. <br>**Lo que decidió la ficha no fue un RF sino un dato:** la única solicitud de la cola del tasador mock (VP-2026-0058) **no tiene `vendedor_telefono`** y **sí** tiene contacto de prioridad 1 con teléfono, así que la aproximación estaba renderizando `href="tel:"` vacío en el 100 % de la cola real. <br>**Dos reglas que la implementación fija:** (1) **sin respaldo a `vendedor_telefono`** — mezclar dos orígenes en silencio esconde el hueco de datos, y la card sabe omitir la línea cuando no hay teléfono (§4.1); (2) se **descarta** el contacto con `estado_contacto = telefono_erroneo` y se cae al siguiente por prioridad — es el estado que ese campo existe para registrar, y ponerlo bajo un enlace `tel:` es mandar al tasador a una llamada perdida. <br>14 casos en `lib/tasador/contactos-cola.test.ts`, más verificación end-to-end contra la base real. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada** · 19-ago-2026 · P3-TAS.A |
| **Origen** | P2-TAS.B (18-ago-2026), al ensanchar la proyección: `datosEjecutiva` es no-opcional en `Tasacion` y ninguna ruta lo servía. |

---

## CI-036 · Las pantallas de IF-03 exigen sesión Clerk mientras su identidad es un mock

| Campo | Valor |
|---|---|
| **Identificador** | CI-036 |
| **Archivo:línea** | `middleware.ts:3-9` (`createRouteMatcher(['/sign-in(.*)', '/api/health'])` + `auth.protect()`) · contraste con `lib/tasador/mock-user.ts` y la Regla **R2** del plan |
| **Síntoma** | Toda ruta de IF-03 —`/tasaciones`, sus seis pantallas y sus once rutas de API— queda detrás del `auth.protect()` de Clerk, que responde **404** a cualquier petición sin sesión. A la vez, **la identidad del tasador no sale de Clerk sino de `TASADOR_MOCK_RECORD_ID`** (R2, hasta P11-TAS). Conviven entonces dos identidades sin relación: la de Clerk decide *si se entra*, y la del mock decide *qué se ve*. Cualquiera que entre con una sesión válida de la Ejecutiva ve la cola del tasador del `.env`. |
| **Causa** | El middleware se escribió para IF-02, donde Clerk **es** la identidad, y su matcher cubre todo el árbol por diseño (`/((?!_next\|…).*)`). IF-03 se montó dentro del mismo proyecto Next y heredó la protección sin que nadie decidiera qué debía significar allí. R2 difirió la autenticación a P11-TAS pensando en el guard de pertenencia (RF-09), no en el middleware. |
| **Efecto observado** | **P3-TAS.B no pudo hacer la verificación visual de §4.2 paso 8 por el camino previsto**: `curl http://localhost:3000/tasaciones` devuelve 404 sin sesión. Se sustituyó por render server-side de las cards con `renderToStaticMarkup` sobre datos reales, que cubre markup y contenido pero **no** píxeles ni layout. Toda verificación visual de IF-03 depende hoy de que una persona abra el navegador con sesión iniciada. |
| **Resolución** | ⚠ **ABIERTA — es decisión de producto, no de código.** Lo que hay que decidir en **P11-TAS**: (a) si el tasador se autentica con Clerk como la Ejecutiva y `clerk_user_id` casa contra `M_Tasadores` —el destino natural, y lo que R2 anticipa—; (b) qué pasa mientras tanto con la doble identidad, que hoy no está declarada en ningún sitio salvo esta ficha; y (c) si conviene una ruta de previsualización exenta para verificación visual en desarrollo, o si eso abre un agujero que no vale la comodidad. **No se tocó `middleware.ts`**: es archivo de IF-02 y R5 lo deja fuera del territorio de estas tandas. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · no bloquea ninguna tanda de UI · bloquea la verificación visual desatendida |
| **Origen** | P3-TAS.B (19-ago-2026), al intentar abrir `/tasaciones` para la verificación a 375×812. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- El 404 —y no un redirect a `/sign-in`— es el comportamiento de `auth.protect()` para peticiones no interactivas. Conviene saberlo antes de perseguir una ruta que "no existe": existe y compila; lo que falta es la sesión.

---

> ## Entradas CI-037 a CI-040 · contraste del SLA v1.1 contra el estado real (19-ago-2026)
>
> Las cuatro nacen de la misma revisión: contrastar `docs/_md/VProperty_SLA_Negocio_v1.4.md`
> —ya absorbido al normativo en el bump v1.9.7 (§5.2.4 · RF-53 · D-16)— contra el schema real de
> Airtable y el código. **No son requisitos nuevos**: el documento está trackeado desde el commit
> `dfddb37` del 07-ago-2026 y su configuración vive en la base desde el 10-ago. Lo que estas
> fichas miden es la **brecha de implementación**.
>
> El hallazgo transversal es que **el hueco no está en la configuración sino en los escritores**:
> `C_SLA_Etapas` tiene sus siete filas exactas y el motor tiene API pública completa, pero casi
> nadie lo llama.
>
> **Dueño y Fecha objetivo van en blanco en las cuatro** — excepción declarada **C-12**, las llena
> el usuario.

## CI-037 · Cinco de las siete etapas del SLA no tienen escritor

| Campo | Valor |
|---|---|
| **Identificador** | CI-037 |
| **Archivo:línea** | `app/api/solicitudes/[id]/asignar/route.ts:132` (**único** llamador de `marcarFinEtapa`) · `app/api/webhooks/crear-solicitud/route.ts:192` (`recalcularSla` en el alta) · contraste con `lib/sla-etapas.ts` (`marcarInicioEtapa`, `marcarFinEtapa`, `pausar`, `reanudar`) y con `C_SLA_Etapas` (`tbl05zu5RLhH3u6pl`, 7 filas) |
| **Síntoma** | El reloj por etapa de §5.2.4 está **configurado y no corre**. En todo el repositorio hay **un solo punto** que mueve una etapa: `marcarFinEtapa(id, 1, …)` al asignar, que cierra e1 y abre e2. Nada cierra e2, y **nada abre ni cierra e3, e4, e5, e6 ni e7**. `pausar()` y `reanudar()` (RN-54) **no tienen ningún llamador**. Consecuencias observables hoy: (a) toda solicitud `asignada` queda en e2 para siempre y su semáforo termina en **rojo** —las 43 filas de `TX_Solicitudes` emiten `sla_semaforo_etapa` en rojo—; (b) el chip "Por coordinar" de IF-03, que se define por e2 abierta, **no se vacía nunca**; (c) la etapa 3 (`Informe post-llamado`, 30 min) está configurada pero **ninguna solicitud llega jamás a ella**; (d) los reportes de cumplimiento por etapa de §5 medirían una sola transición. |
| **Causa** | El motor (`lib/sla-etapas.ts`) se construyó en la Tanda C como capa de servicio completa y correcta, con la matriz poblada en Airtable, pero **el cableado a las acciones del negocio se difirió**: cada etapa se cierra con un evento distinto —un click del tasador, un envío de correo, una aprobación del visador— y varios de esos eventos no existen todavía como funcionalidad (el registro del llamado, el envío del informe de CI-028, la interfaz de visado IF-04). Una matriz completa en Airtable más un motor con API pública dan la impresión de una funcionalidad terminada; el `grep` de los llamadores dice otra cosa. |
| **Resolución** | ⚠ **ABIERTA — es trabajo de varias tandas, no un arreglo.** El reparto por dueño es: <br>**(a) e2-fin + e3 completa → IF-03.** Lo definió **Q5** (19-ago-2026): la cierra el tasador registrando el resultado del llamado (fecha/hora de visita coordinada o incidencia). Requiere pantalla, ruta y campos nuevos, y el **dominio de incidencias** está pendiente de Héctor. <br>**(b) e4 y e6 → IF-02.** Aviso de coordinación al cliente y disponibilidad para visado. Pendiente de Héctor si e4 la cierra un envío automático o un acuse manual. <br>**(c) e5-fin → IF-03**, atado a **CI-028**: el botón de envío del informe todavía no persiste nada. <br>**(d) e7 → IF-04**, que no existe como interfaz. <br>**(e) `pausar`/`reanudar`**: decidir si la pausa de RN-54 la dispara una acción explícita o el propio cómputo hábil. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · bloquea el reloj por etapa completo · **(a) y (b) esperan respuesta de Héctor** |
| **Origen** | Contraste del SLA v1.1 contra el estado real (19-ago-2026), al verificar la respuesta de Q5. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **Lo que NO falta:** la configuración. `C_SLA_Etapas` tiene las 7 filas con los catorce umbrales exactos de §3.1 (e1 2/3 · e2 4/6 · e3 0.5/0.5 · e4 2/3 · e5 24/48 · e6 2/3 · e7 0.5/0.5), cada una con su actor responsable. La ventana hábil L–V 9:00–18:00 está en `lib/sla-habil.ts:42-43` y los feriados en `C_Feriados` (18 filas, 2026–2027). Quien planifique esta ficha **no necesita crear nada de eso**.
- Relación con **CI-005**: aquella ficha describe el modelo de reloj y su desalineación de origen; ésta describe el hueco de ejecución que quedó después de construir el motor. No se solapan.

---

## CI-038 · El reproceso de §3.2 no existe en el modelo de datos

| Campo | Valor |
|---|---|
| **Identificador** | CI-038 |
| **Archivo:línea** | `docs/_md/VProperty_SLA_Negocio_v1.4.md` §3.2 y §6.5 · spec v1.9.9 §5.2.5 (RN-55) · contraste con `TX_Solicitudes` (probado vía API) y con el árbol de código completo |
| **Síntoma** | El reproceso —informe ya entregado que el ejecutivo del cliente devuelve para modificar— tiene **matriz de SLA propia (R1, R2, R3)**, regla operativa *"reproceso limpio"* con cortes horarios, motivo tipificado, trazabilidad al informe original y alerta de fin de jornada. **Nada de eso existe.** La API responde `422 · Could not find a field with name or ID "es_reproceso", "motivo_reproceso", "reproceso_origen"`; `grep -rn "reproceso"` sobre `lib/`, `app/` y `components/` no devuelve ninguna coincidencia, y `docs/schema-airtable.md` tampoco lo menciona. No hay campos, ni tabla, ni estado, ni código. |
| **Causa** | El reproceso entró en el insumo de negocio en la **v1.1** (07-ago-2026) como uno de sus cinco cambios declarados, y se absorbió al normativo como §5.2.5. La construcción del sistema venía —y sigue— enfocada en el flujo principal de solicitud nueva: IF-02 lo crea, IF-03 lo captura, el pipeline PDF lo entrega. El reproceso es un **segundo ciclo de vida sobre un informe ya entregado** y no se parece a ninguna transición del flujo principal, así que no cayó dentro del alcance de ningún CU en curso. |
| **Resolución** | ⚠ **ABIERTA — bloqueada por decisiones de negocio, no por esfuerzo técnico.** Antes de tocar schema hay que responder: <br>**(a)** ¿Un reproceso es una **fila nueva** en `TX_Solicitudes` ligada a la original, o una **marca de estado** sobre la misma fila? La decisión determina si `A_Cambios` alcanza para la trazabilidad o hace falta un Link. <br>**(b)** ¿Cuáles son los **motivos tipificados**? El documento nombra tres ejemplos —permiso de recepción final, RUT/apellido del vendedor, certificado de profesión— más "aumento de valor", y declara que el más frecuente es el permiso de recepción final en viviendas usadas. Un `singleSelect` necesita el dominio cerrado. <br>**(c)** ¿Qué significa exactamente que *"los SLA de reproceso corren en paralelo a los del flujo principal"* (§4)? Si la solicitud original ya está cerrada, no hay reloj principal contra el cual correr en paralelo. <br>**(d)** La regla *"reproceso limpio"* tiene **cortes horarios propios** (18:00–19:00, 12:00–14:00, 14:00–15:00) que **no encajan en el modelo de horas hábiles** del motor: es una regla de despacho por franja del día, no un plazo en horas. Requiere un cómputo distinto del de `lib/sla-habil.ts`. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · sin soporte alguno · **esperando definiciones de Héctor** |
| **Origen** | Contraste del SLA v1.1 contra el estado real (19-ago-2026). |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- El punto (d) es el que conviene no subestimar: todo el motor de SLA está construido sobre "sumar N horas hábiles a un instante", y la regla de reproceso está expresada como "lo que entra antes de las 14:00 sale en la tarde". Son dos aritméticas distintas y la segunda no se deriva de la primera.

**Enmienda del 21-ago-2026 — la ficha se estrecha, no se cierra.** Los audios del cliente
(`p3`, `p4`) responden **dos de las cuatro preguntas** que bloqueaban esta ficha, y su respuesta
quedó normada en spec §5.2.5:

- **(a) RESPONDIDA — marca sobre la misma fila, no fila nueva.** *"No se creó una nueva
  solicitud, es el mismo código"*. Con eso, la trazabilidad al informe original no necesita un
  Link nuevo entre solicitudes.
- **(b) RESPONDIDA — el dominio cerrado tiene siete valores.** Permiso de recepción final ·
  corrección de dirección por certificado de número · revisión por aumento de valor ·
  regularización de ampliación · corrección de forma (nombre, RUT) · cambio de cliente
  destinatario · pronunciamiento sobre afectación de utilidad pública. Registrado como **A-26**,
  pendiente sólo de ratificar que son dominio y no muestra.
- **(c) y (d) SIGUEN ABIERTAS**, y (d) sigue siendo la difícil por el motivo de la nota anterior.

Dato adicional que la ficha no tenía: **quién ejecuta el reproceso depende del motivo**. Los de
forma, valor y destinatario los resuelve el perfil de visación, no el tasador que nombra R2
(`p4`). Afecta a quién se le mide el plazo de R2.

**El estado no cambia:** sigue **abierta** y sigue sin soporte alguno en el modelo de datos. Lo
que cambia es que ya no espera una elicitación: espera una decisión de diseño sobre (c) y (d).

**Enmienda del 23-ago-2026 — (a) y (b) quedan firmes.** **A-26 cerró**: el cliente ratificó que los
siete motivos son **dominio cerrado y no muestra**, con las etiquetas de spec §5.2.5 como valores
del `singleSelect`. Con eso el punto **(b)** deja de tener reserva y el punto **(a)** —marca sobre
la misma fila, mismo código— queda confirmado por la misma respuesta.

**El estado sigue sin cambiar:** **abierta** por (c) y (d), que son decisiones de diseño y no de
negocio, y sin soporte alguno en el modelo de datos. El reproceso sigue diferido en §1.9 ·
FUT-EJ-08 **por alcance, no por falta de definición**: la versión que lo implemente no tiene que
volver a elicitar el catálogo.

---

## CI-039 · La etiqueta de la píldora de etapa ignora la ventana hábil

| Campo | Valor |
|---|---|
| **Identificador** | CI-039 |
| **Archivo:línea** | `lib/solicitudes.ts:613` (`etiquetaEtapa`) · consumidores: `components/console/status-badges.tsx` (`SLABadge`) en la bandeja y el detalle de IF-02, y `components/tasador/tasacion-card.tsx` en la cola de IF-03 desde P3-TAS.A |
| **Síntoma** | La píldora dice *"Vence en 3h 40m"* o *"Vencida hace 6d 21h"* midiendo la distancia de **reloj de pared** entre `NOW()` y `sla_etapa_vence_ts`. §6.1 fija que el SLA **no corre** fuera de L–V 9:00–18:00 ni en feriados. Un viernes a las 17:00, una etapa a la que le quedan **4 horas hábiles** se rotula *"Vence en 40h"*; un lunes a las 9:00 esa misma etapa dice *"Vence en 4h"*. El número cambia sin que cambie el trabajo pendiente. |
| **Causa** | La división de responsabilidades es correcta y el error está en el último tramo: el motor materializa `sla_etapa_vence_ts` **sí** aplicando horas hábiles (`sumarHorasHabiles` sobre `lib/sla-habil.ts`), de modo que el instante es exacto y **el tono verde/ámbar/rojo también lo es**. Lo que no aplica la ventana es la **resta final** que produce el texto, que es una diferencia de milisegundos entre dos instantes. El docblock de `etiquetaEtapa` lo declara explícitamente —*"no dice horas hábiles, dice cuánto falta para ese instante"*— así que fue una decisión consciente; lo que no se evaluó es cómo se lee esa cifra un viernes por la tarde. |
| **Resolución** | ⚠ **ABIERTA.** Dos salidas, y la elección es de producto: <br>**(a)** Calcular la etiqueta en **horas hábiles** reutilizando `lib/sla-habil.ts`, que ya tiene la función inversa que hace falta. Es lo coherente con §6.1 y con lo que el usuario entiende por "me quedan 4 horas". <br>**(b)** Dejar el reloj de pared y **decir cuál es**, con un texto que no se pueda confundir (*"vence el lunes 09:00"* en vez de *"vence en 40h"*). <br>⚠ **El tono no se toca en ninguna de las dos**: es correcto hoy y recalcularlo en el cliente sería la segunda fuente de verdad que **RO-05** prohíbe. <br>**Nota de alcance:** el arreglo vive en `lib/solicitudes.ts`, territorio **IF-02**, y por **R5** no cabe en `feat/tasador-ui` aunque IF-03 sea uno de los dos consumidores. Necesita rama propia. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · no bloquea ninguna tanda · afecta a las dos interfaces a la vez |
| **Origen** | Contraste del SLA v1.1 contra el estado real (19-ago-2026), al revisar §6.1 contra el texto que P3-TAS puso en la card del tasador. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- La ficha se abre **después** de que P3-TAS.A llevara esta píldora a la cola del tasador: hasta entonces el defecto sólo lo veía la Ejecutiva, y ahora lo ve también quien tiene el plazo más corto de la matriz (e2, 4 h / 6 h), que es justamente donde el desfase de un fin de semana más engaña.

---

## CI-040 · Perfil de entregable por cliente (§4.1) sin soporte verificado

| Campo | Valor |
|---|---|
| **Identificador** | CI-040 |
| **Archivo:línea** | `docs/_md/VProperty_SLA_Negocio_v1.4.md` §4.1 y §6.4 · contraste con `M_Clientes` (`tblpK7AcYBMH93apK`, 90 filas) |
| **Síntoma** | §4.1 define **tres perfiles de entregable** y dice que el correo automático de cierre adjunta lo que corresponda al perfil del cliente: (1) **estándar** — PDF con carátula e informe; (2) **con resumen ejecutivo** — PDF **más un Excel** de resumen en formato único para todos los clientes de la categoría; (3) **Unidad de Vivienda Habitacional** — PDF con la hoja de resumen **embebida** antes de la carátula. No encontré en `M_Clientes` ningún campo que discrimine el perfil: la tabla tiene la plantilla `.docx` del informe, el tipo de producto, códigos y ratios, pero nada que diga qué se adjunta al correo. |
| **Causa** | §4.1 entró con la **v1.1** del insumo (07-ago-2026) describiendo un comportamiento del **pipeline PDF** (E1/E2/E3), que es la parte del sistema que ni CU-002 ni CU-003 tocan y cuyo dueño es otro. La configuración por cliente que sí existe en `M_Clientes` —la plantilla `.docx`— resuelve **cómo se ve el informe**, no **qué se adjunta al correo**, y son dos ejes distintos que se pueden confundir a simple vista. |
| **Resolución** | ⚠ **ABIERTA · hallazgo a confirmar, no defecto confirmado.** <br>**Lo verificado:** nueve nombres candidatos probados contra la API, los nueve con `422 · Could not find a field` — `perfil_entregable`, `tipo_entregable`, `entregable`, `genera_excel`, `resumen_ejecutivo`, `formato_salida`, `plantilla_excel`, `adjuntos_correo`, `config_entregable`. Más el muestreo de tres filas y la ausencia de toda mención en `docs/schema-airtable.md`. <br>**Lo NO verificado:** que no exista un campo con un nombre que no se me ocurrió, o que el perfil no viva **fuera** de `M_Clientes` — en el propio pipeline, en una tabla de configuración de correo, o codificado en los escenarios E1/E2/E3. <br>**Antes de crear nada, preguntar al dueño de E1/E2/E3** dónde vive hoy esa decisión: puede estar resuelta fuera del alcance de este repositorio, en cuyo caso la ficha se cierra documentando dónde. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · a confirmar con el dueño del pipeline PDF antes de tratarlo como brecha |
| **Origen** | Contraste del SLA v1.1 contra el estado real (19-ago-2026). |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- Esta ficha es deliberadamente la más débil de las cuatro en su evidencia, y se declara así para que nadie la use como base de un cambio de schema. Nueve nombres candidatos que fallan **no prueban ausencia**; prueban que el campo no se llama como uno esperaría.

**Enmienda del 21-ago-2026 — evidencia nueva, la ficha sigue abierta.** La revisión de la
plantilla operativa vigente `Formato Informe VProperty Enero2026.xlsm` corrige la premisa más
débil de esta ficha. **Los tres perfiles no son una descripción abstracta: existen como hojas
del libro y están en producción.**

| Perfil de §4.1 | Realización en la plantilla |
|---|---|
| Estándar | `[Excel: Tapa]` (carátula) + `[Excel: Impresion]` (cuerpo) |
| Con resumen ejecutivo | `[Excel: Hoja Resumen]` — hoja oculta que espeja `Portada` por referencia |
| Unidad de Vivienda Habitacional | `[Excel: ULH]`, con la metodología de prorrateo de bien común en `[Excel: Bien Común!B2:O27]` |

Aparece además una **cuarta salida por cliente** que §4.1 no contempla: `[Excel: CCES]`, 44
campos mapeados por fórmula para Concreces. Sugiere que la configuración por cliente es más
granular que tres perfiles.

**Lo que esto cambia:** la pregunta deja de ser *"¿existe el comportamiento?"* —existe, se hace
a mano hoy— y pasa a ser *"¿dónde vive la decisión cuando se automatice?"*. **Lo que no cambia:**
sigue sin encontrarse el campo en `M_Clientes`, y la ficha **sigue abierta** hasta preguntarle al
dueño de E1/E2/E3. La evidencia nueva **no es** base suficiente para crear schema.

---

## CI-041 · `observacion_rechazo_tasador` ya existe y §2.12 lo sigue declarando como campo por crear

| Campo | Valor |
|---|---|
| **Identificador** | CI-041 |
| **Archivo:línea** | `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.12 (bloque *Campos nuevos en `TX_Solicitudes`*) · vs base `app9G7lLkIV3CpeLa`, `TX_Solicitudes.observacion_rechazo_tasador` = **`fldAccib5yNYaOmJc`**, `multilineText` |
| **Síntoma** | §2.12 lista `observacion_rechazo_tasador` entre los campos **nuevos** que hay que crear, con la fórmula habitual *"(texto largo, nullable) — observación persistida por RF-TAS-09"*. El campo **ya está creado** desde el 17-ago-2026: lo creó **P0.5-TAS** y está registrado en `docs/schema-airtable.md` §26.1 como *"el único campo creado"* de esa tanda. Quien lea §2.12 al abrir P9-TAS —que es la consumidora de RF-TAS-09— intentará crearlo y recibirá un 422 por nombre duplicado, o peor, lo creará con otro nombre y duplicará el dato. |
| **Causa** | P0.5-TAS ejecutó una parte del delta de §2.12 y lo registró en `schema-airtable.md`, pero **la spec no se actualizó**: §2.12 describe el delta como intención permanente y no distingue lo ejecutado de lo pendiente. Es la misma clase de divergencia que §26.3 documenta para `fecha_real_visita`, con el signo invertido: allá el campo existía con otro nombre, acá existe con el mismo. |
| **Resolución** | En el próximo bump normativo, marcar en §2.12 los campos ya materializados con su FIELD_ID real, en lugar de listarlos como pendientes. Mínimo viable: anotar `observacion_rechazo_tasador` como **✅ creado 17-ago-2026 · `fldAccib5yNYaOmJc`**. Conviene hacerlo para los tres campos del bloque a la vez —`fecha_real_visita` ya tiene su nota en §26.3 y `coordinacion_vigente` se crea en P4-TAS—, porque el bloque entero tiene el mismo defecto. **No es trabajo de código.** |
| **Dueño** | Claude Code (corrección documental en el próximo bump de §2.12) |
| **Fecha objetivo** | **Condicional al próximo bump normativo que toque §2.12.** Si P4-TAS cierra creando `coordinacion_vigente`, ése es el bump y esta entrada se cierra con él. |
| **Estado** | abierta |
| **Origen** | Bloque 1 de **P4-TAS** (19-ago-2026), al levantar el estado real de `TX_Solicitudes` por MCP antes de crear `TX_CoordinacionVisita`. |

**Notas:**

- **Es documental y de bajo riesgo, pero no es cosmética.** El modo de fallo real no es el 422 —ése
  es ruidoso y se corrige solo— sino la creación de un segundo campo con nombre alternativo por
  parte de quien asuma que la spec está al día. Ahí el dato se parte en dos columnas y RF-TAS-09
  escribe en la que no lee el informe.
- **No confundir con CI-010 ni CI-012**, que son *documento afirma que existe algo que no existe*.
  Ésta es la inversa: *documento pide crear algo que ya existe*. Menos grave, y por eso entra con
  fecha objetivo condicional y no como bloqueante.
- El conteo de tablas de la ficha **CI-012** quedó igualmente desactualizado (decía 68, la base
  tiene **67** al 19-ago-2026). No se abre entrada propia: es un dato de contexto dentro de una
  ficha ya cerrada, y queda anotado en `docs/schema-airtable.md` §26.6.

---

## CI-042 · `AdjuntoDropbox.sizeBytes` asume que `TX_Adjuntos.tamanio_kb` sigue en kilobytes

| Campo | Valor |
|---|---|
| **Identificador** | CI-042 |
| **Archivo:línea** | `lib/tasador/lectura-tasacion.ts` → `leerAdjuntos()`, la conversión `fields.tamanio_kb * 1024` · vs base `app9G7lLkIV3CpeLa`, `TX_Adjuntos.tamanio_kb` (`number`) |
| **Síntoma** | El tipo `AdjuntoDropbox.sizeBytes` promete **bytes** y el campo de Airtable se llama `tamanio_kb`, así que el lector multiplica por 1024. La unidad **vive en el nombre del campo, no en su tipo**: Airtable guarda un `number` pelado y no hay nada que impida que alguien cambie el escenario que lo puebla para que escriba bytes, o que empiece a poblarlo un origen distinto con otra unidad. Si eso pasa, la conversión **duplica en silencio**: un PDF de 128 KB se renderiza como `128.0 MB` en el bloque Adjuntos de Pantalla 2. Nada falla, nada se loguea, y el número es plausible a primera vista. |
| **Causa** | Es una **dependencia de unidad no verificable en runtime**. El nombre `tamanio_kb` es la única declaración de que el valor está en KB, y los nombres de campo de Airtable no son un contrato: se renombran desde la UI sin que ningún consumidor se entere. El repo ya tiene el precedente inverso en `sucursal_originadora `, cuyo espacio final obligó a referenciar por FIELD_ID. Acá el riesgo no es el nombre sino **la semántica que el nombre transporta**. |
| **Impacto** | **Bajo hoy, silencioso siempre.** Sólo afecta a la etiqueta de tamaño de un adjunto en la pantalla de coordinación — no entra en el motor de cálculo, no viaja en ningún correo y no se persiste. Lo que lo hace digno de ficha no es la magnitud sino el **modo de fallo**: un error de factor 1024 en una cifra de tamaño no dispara ninguna alarma y puede vivir meses. |
| **Mitigación pendiente** | Tres opciones, de menor a mayor coste: **(a)** un guard de rango en `leerAdjuntos()` que loguee cuando `tamanio_kb` supere un umbral absurdo para un KB —digamos 10⁷, que serían 10 GB— y que es la señal de que el campo cambió de unidad; **(b)** renombrar el consumo a un helper `kbABytes()` con su test, para que la unidad tenga un solo punto de traducción y quede cubierta; **(c)** normalizar el schema para que el campo declare su unidad en la `description` de Airtable, que es donde un editor la vería antes de cambiarla. **Recomendada: (a) + (c)**, que no tocan el contrato y cubren el caso real. |
| **Dueño** | Claude Code (implementación) · Sergio (decisión de cuál de las tres) |
| **Fecha objetivo** | **Condicional a la primera tanda que vuelva a tocar `leerAdjuntos()`**, o a P10-TAS si ninguna lo hace antes. No es bloqueante de P4-TAS. |
| **Estado** | abierta |
| **Origen** | Bloque 3a de **P4-TAS** (19-ago-2026), al proyectar `adjuntosDropbox` y descubrir que el tipo dice bytes y la base dice KB. |

**Notas:**

- **No es un bug: hoy la conversión es correcta.** La ficha registra una dependencia frágil, no un defecto activo. Cerrarla sin implementar nada sería perder la única constancia de por qué hay un `* 1024` en el lector.
- **La conversión está deliberadamente en el lector y no en la vista.** Si estuviera en el componente, el tipo `sizeBytes` sería mentira para todos los demás consumidores. Moverla "para simplificar" reintroduce el problema en peor lugar.
- Relación con **CI-001**: aquélla es sobre referenciar campos por nombre cuando el nombre puede colisionar; ésta es sobre **confiar en el nombre para saber la unidad**. Son la misma familia —el nombre de un campo de Airtable no es un contrato— con dos consecuencias distintas.

---

## CI-043 · RF-TAS-04 queda sin construir: `contactosEditadosPorEjecutiva` no tiene campo en Airtable

| Campo | Valor |
|---|---|
| **Identificador** | CI-043 |
| **Archivo:línea** | `components/tasador/coordinar-visita.tsx`, comentario del banner de reapertura retirado · vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.3 (**RF-TAS-04**) y §1.4 (excepción acotada a RN-59) |
| **Síntoma** | **RF-TAS-04 quedó desbloqueado en la spec v1.9.10 y no se construye en P4-TAS.** La spec describe la reapertura del segundo intento: cuando la coordinación está `rechazada` y la ejecutiva corrige los contactos de visita, la Pantalla 2 vuelve a abrirse para el tasador con ambos desenlaces disponibles, y el nuevo intento se registra con `intento_numero = 2`. El componente v0 lo implementaba con un banner condicionado a `tasacion.coordinacionVigente === "rechazada" && tasacion.contactosEditadosPorEjecutiva === true`. **El segundo discriminante no existe**: no hay campo en `TX_Solicitudes`, ni en `TX_ContactosVisita`, ni forma de derivarlo de lo que hay. |
| **Causa** | `coordinacionVigente` sí volvió en P4-TAS —es `fldI4Dv0jpRQvbdHl`, creado en el Bloque 1— pero `contactosEditadosPorEjecutiva` **nunca tuvo respaldo en la base**: en el v0 era un booleano del array en memoria. Reponerlo exige decidir **qué cuenta como "la ejecutiva editó los contactos"**: cualquier escritura sobre `TX_ContactosVisita` posterior a la devolución, sólo las de ciertos campos, o un acto explícito de la ejecutiva. `TX_ContactosVisita` tiene `ultima_modificacion` (`lastModifiedTime`), que permitiría compararla contra `fecha_respuesta` del último intento — pero eso es una **regla de negocio nueva**, no una lectura. |
| **Impacto** | **Acotado y declarado.** Pantalla 2 funciona completa en su camino principal: los cuatro bloques de resumen, los dos desenlaces, los correos y la visibilidad para la ejecutiva. Lo que falta es el **segundo intento**. Consecuencia operativa concreta: si el tasador devuelve a la ejecutiva y ésta corrige el teléfono, **hoy no hay forma de que la pantalla se reabra desde el sistema** — se resuelve fuera, como antes. No hay pérdida de datos ni estado inconsistente: la fila `rechazada` queda registrada y la ejecutiva la ve. |
| **Mitigación pendiente** | Tanda propia, posterior a P4-TAS. Requiere, en orden: **(1)** decidir la regla de "contactos editados" —candidata barata: `ultima_modificacion` de algún contacto > `fecha_respuesta` del último intento, que no necesita campo nuevo—; **(2)** exponerla en la proyección de `leerTasacion()`; **(3)** reponer el banner y habilitar los desenlaces; **(4)** verificar que el `intento_numero` que escribe el handler llega a 2. El punto (1) es de negocio y conviene llevarlo a Héctor junto con **A-20** y **A-21**, que son de la misma pantalla. |
| **Dueño** | Sergio (decisión de la regla) · Claude Code (construcción) |
| **Fecha objetivo** | **Condicional a la decisión del punto (1).** No se agenda antes: construirlo con una regla inventada daría un banner que aparece cuando no debe. |
| **Estado** | abierta |
| **Origen** | Bloque 3b de **P4-TAS** (19-ago-2026), al recuperar `coordinar-visita.tsx` de `890bffa^` y encontrar que el banner dependía de un campo sin origen. |

**Notas:**

- **Es deuda diferida por decisión explícita, no un olvido.** Sergio decidió el 19-ago-2026 no reponer `contactosEditadosPorEjecutiva`: sin discriminante real el banner mentiría la mitad de las veces, y un aviso falso de "puedes intentar de nuevo" es peor que no tenerlo. El componente lleva el comentario en el sitio donde estaba el banner, para que el próximo que lo lea no crea que se perdió al recuperar el archivo.
- **RF-TAS-05 sí se construye**, aunque salió del mismo desbloqueo: sólo necesita que la fila exista, y existe. Las dos RF se desbloquearon juntas y **no avanzan al mismo ritmo**; conviene no tratarlas como un paquete.
- **La excepción acotada a RN-59 quedó repuesta en la spec §1.4 y no tiene consumidor todavía.** Es correcto —la spec describe lo que el sistema debe permitir, y P4-TAS no construye la parte de IF-02 que la ejerce— pero alguien que audite §1.4 contra el código no va a encontrar nada. Esta ficha es la explicación.

---

## CI-044 · La idempotencia de la coordinación no cierra la carrera entre dos requests concurrentes

| Campo | Valor |
|---|---|
| **Identificador** | CI-044 |
| **Archivo:línea** | `app/api/tasaciones/[id]/coordinacion/route.ts` — entre el `listRecords` que resuelve la ventana de idempotencia y el `createRecord` que inserta la fila |
| **Contexto** | La mitigación **R-2** de §2.12 (doble disparo por doble tap) se implementó en P4-TAS como **ventana deslizante de 10 s**: antes de insertar, la ruta lee las filas de la solicitud y, si hay una con `fecha_respuesta` dentro de la ventana, devuelve **esa** con `200` en vez de crear otra. §2.12 la planteaba como clave `(solicitud, fecha_respuesta truncada al minuto)`; se descartó la truncación porque falla justo en el caso que dice cubrir —dos taps a las `10:00:59` y `10:01:01` caen en buckets distintos y ambos pasan—. |
| **Síntoma** | Entre la lectura de las filas previas y el `createRecord` hay una ventana de **~100-300 ms** en la que dos requests que llegan genuinamente a la vez **leen ambos «sin filas recientes»** y **ambos insertan**. El resultado son **dos filas con el mismo `intento_numero`** para la misma solicitud, dos `coordinacion_key` idénticas, y dos correos a la ejecutiva cuando SC13 las procese. `coordinacion_vigente` queda con el valor del último `PATCH` que gane, que puede no ser el de la fila que el tasador cree haber enviado si las dos ramas fueran distintas. |
| **Causa** | **Airtable no tiene constraints de unicidad ni transacciones.** Toda comprobación previa a una escritura es *read-then-write* y por definición no es atómica: no existe forma de expresar «inserta sólo si no hay otra fila que cumpla X» en una sola operación. No es un defecto de la implementación —cualquier variante de la comprobación tendría la misma ventana— sino una propiedad del motor de datos. La constraint blanda que §2.12 pedía **no tiene realización posible en el schema**, y por eso vive en el handler. |
| **Impacto** | **Bajo en probabilidad, acotado en consecuencia.** La Regla D del cliente deshabilita el botón al primer click, así que el doble tap clásico no llega a la red; lo que queda expuesto son **dos pestañas disparando en el mismo instante** o un reintento automático de red que solape. Ninguna de las dos filas es inválida por sí sola y **no hay pérdida de datos ni estado inconsistente en `TX_Solicitudes`** —`estado` no se toca—: el daño es un duplicado visible en la tabla y un correo de más. La ventana de 10 s cubre el caso realista (doble tap, reintento manual, refresh), que es el que ocurre. |
| **Mitigación pendiente** | **No se cierra sin cambiar de mecanismo.** Dos caminos, ninguno disponible hoy: **(a)** que Airtable exponga constraints de unicidad o escritura condicional, que hoy no ofrece; **(b)** que el proyecto adopte un **token de idempotencia** generado por el cliente y persistido en un campo nuevo de `TX_CoordinacionVisita`, con el servidor devolviendo la fila existente ante un token repetido. La opción (b) es semánticamente exacta —distingue *«el mismo envío reintentado»* de *«un segundo intento genuino»*, que es lo que la ventana temporal adivina— y **se evaluó y descartó en la sesión del 19-ago-2026 por coste**: pedía otra operación de schema en Airtable y modificar `coordinar-visita.tsx`, ya commiteado, a cambio de cubrir un escenario que la ventana de 10 s ya cubre salvo en el reintento manual entre 10 y 60 segundos. **Si el duplicado llega a observarse en producción, (b) es la respuesta y esta ficha tiene el diseño.** |
| **Dueño** | Sergio (decisión de adoptar (b)) · Claude Code (implementación) |
| **Fecha objetivo** | **Condicional a que el duplicado se observe en producción.** No se agenda antes: implementar (b) hoy sería pagar una operación de schema y un cambio de cliente por un caso que no se ha visto. |
| **Estado** | abierta |
| **Origen** | Bloque 4+5 de **P4-TAS** (19-ago-2026), al diseñar la mecánica anti doble-tap. Registrada por instrucción explícita de Sergio como limitación conocida, no como defecto a corregir. |

**Notas:**

- **La ficha existe para que la limitación no se redescubra como bug.** Quien vea dos filas con el mismo `intento_numero` va a asumir que el guard está roto. No lo está: está haciendo exactamente lo que puede hacer sobre un motor sin unicidad. Sin esta entrada, el diagnóstico costaría una tarde.
- **La ventana de 10 s no es arbitraria y su falso positivo es imposible en la práctica.** Un segundo intento legítimo exige que la ejecutiva corrija los contactos de visita entre uno y otro, y eso no ocurre en diez segundos. Alargarla no compraría seguridad y sí empezaría a bloquear intentos válidos.
- **El test de la ventana congela el reloj** (`vi.setSystemTime`), y es la única forma de que sea determinista. Un test que dependiera del reloj real fallaría de forma intermitente en CI, que es peor que no tenerlo.
- Relación con **CI-042**: las dos salieron del mismo bloque y las dos son *dependencias del entorno que el código no puede verificar* — allá la unidad de un campo, acá la atomicidad del motor. Ninguna es un defecto activo; ambas son supuestos que conviene tener escritos.

---

## CI-045 · El chip "Por coordinar" sigue infiriendo la coordinación desde la etapa de SLA, teniendo el dato directo

| Campo | Valor |
|---|---|
| **Identificador** | CI-045 |
| **Archivo:línea** | `lib/tasador/cola-filtros.ts` → `esPorCoordinar()` · vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §4.1 y **RF-TAS-01** |
| **Contexto** | §4.1 define el chip como *"solicitudes **sin coordinación vigente**, en estado `asignada` y con `now() - fecha_asignacion < 4h`"*. Bajo **RO-29** esa definición no era computable —no existía `TX_CoordinacionVisita`— y P3-TAS.A la aproximó por la etapa del motor: `estado === 'asignada' && slaEtapa?.numero === 2`. La etapa 2 de §5.2.4 es la del primer contacto (RN-53), así que la aproximación era razonable. **RO-29 fue anulada el 19-ago-2026** y P4-TAS creó `TX_Solicitudes.coordinacion_vigente` (`fldI4Dv0jpRQvbdHl`): el dato que §4.1 pide existe y no se está usando. |
| **Síntoma** | El predicado **depende del motor de SLA para responder una pregunta que no es de SLA**. `proyectarSlaEtapa()` devuelve `undefined` cuando el motor no resuelve etapa para la solicitud —y el propio módulo declara que eso es *"un resultado legítimo y no un error"*—. En ese caso `slaEtapa?.numero === 2` es `false` y **la solicitud no aparece en el chip aunque no tenga ninguna coordinación registrada**. Son precisamente las solicitudes peor instrumentadas las que desaparecen de la lista que existe para no perderlas de vista. |
| **Causa** | La aproximación se adoptó por falta de dato, no por preferencia de diseño, y **nadie la revisó cuando el dato apareció**. Es la deuda típica de un rodeo que sobrevive a su motivo: el comentario del predicado citaba RO-29 como justificación y RO-29 ya no existe. |
| **Impacto** | **Medio.** No hay pérdida de datos ni escritura incorrecta: es un filtro de lectura. Pero el chip es el mecanismo que RF-TAS-01 da al tasador para saber **qué le toca hacer ahora**, y hoy responde a "¿en qué etapa te tiene el motor?" en vez de a "¿coordinaste o no?". Las dos preguntas coinciden mientras el motor esté sano; divergen exactamente cuando no lo está. <br>Nota adicional: la ventana de **4 h** de §4.1 **no la implementa ninguna de las dos versiones** —ni la actual ni la original—. Es una divergencia preexistente y no la introduce esta ficha, pero conviene resolverla en el mismo movimiento. |
| **Mitigación pendiente** | Cambiar el discriminante a **`coordinacion_vigente == null && estado === 'asignada'`**, que es la definición literal de §4.1, y **conservar el orden actual** por `sla_etapa_vence_ts` ascendente, que sí es una pregunta de SLA y está bien resuelta. Requiere antes que `proyectarTasacion()` **pueble `coordinacionVigente`**, que hoy no lo hace (ver **CI-046**, que comparte esa precondición). Decidir aparte si la ventana de 4 h entra: la definición sin ella es más simple y no deja solicitudes fuera. <br>**Comprobación de equivalencia antes de cambiar**: hoy una solicitud sale del chip al cerrarse e2, y el handler de coordinación cierra e2 en **las dos ramas**, así que confirmada y devuelta salen igual. Con el discriminante nuevo también salen las dos, porque `coordinacion_vigente` queda seteado en ambas. El comportamiento observable no cambia en el camino feliz; lo que cambia es que deja de depender del motor. |
| **Dueño** | Sergio (priorización) · Claude Code (implementación en la tanda de Pantalla 1) |
| **Fecha objetivo** | **Condicional a la tanda de Pantalla 1.** No es bloqueante: el chip funciona mientras el motor de SLA funcione. |
| **Resolución** | **Aplicada en el Bloque 3 del Frente A+B.** `esPorCoordinar()` (`lib/tasador/cola-filtros.ts`) pasó a filtrar por el dato directo: `estado === 'asignada' && coordinacionVigente == null`, en lugar de inferirlo desde `slaEtapa.numero === 2`. El orden por `sla_etapa_vence_ts` asc se conserva en `filtrarCola()`. La cota wall-clock de 4h que esta ficha mencionaba como pendiente se separó en **CI-048**, resuelta con la decisión **A-36** —re-etiquetada el 22-ago-2026, se registró como `A-22` y ese identificador designa otra cosa— (se dropea de la pertenencia, se preserva en el orden). |
| **Estado** | **aplicada.** |
| **Origen** | Bloque 6 de **P4-TAS** (19-ago-2026), auditoría explícita de las lógicas que RO-29 había condicionado. **La lógica no se tocó** en P4-TAS: corregir comentarios y cambiar predicados son dos trabajos distintos. El predicado se cambió en el **Bloque 3 del Frente A+B**. |

**Notas:**

- **El predicado no está mal escrito: está resolviendo el problema de ayer.** Quien lo lea sin contexto va a pensar que la etapa 2 es la definición canónica, porque el comentario ya no cita RO-29. Esta ficha es la que dice que hay una definición mejor disponible.
- **No fusionar con CI-046 aunque compartan precondición.** Las dos necesitan que la proyección pueble `coordinacionVigente`, pero una es un filtro de lista y la otra es un gate de navegación con consecuencia funcional. Fusionarlas haría que la más barata arrastre a la más cara.

---

## CI-046 · El gate de coordinación no existe en la UI: la card entra a la captura sin coordinar

| Campo | Valor |
|---|---|
| **Identificador** | CI-046 |
| **Archivo:línea** | `components/tasador/tasacion-card.tsx` → el `Button` final, `render={<Link href={\`/tasaciones/${tasacion.id}\`} />}` · vs spec §2.4 (*Gate de coordinación*) y **RF-TAS-11** |
| **Contexto** | §2.4 es explícito sobre dónde vive el gate: *"mientras la coordinación no esté confirmada, el tasador no entra a la captura. El gate ya no vive en un botón «Iniciar captura», sino en **la llamada a la acción de la card** (RF-TAS-11), que ofrece «Coordinar visita» en lugar de «Abrir tasación»"*. P3-TAS.A colapsó las tres variantes a una bajo **RO-29**, que dejó el gate sin dato con que discriminar. RO-29 fue anulada el 19-ago-2026 y P4-TAS repuso las dos piezas: `TX_Solicitudes.coordinacion_vigente` y `resolverAccionCard()` en `lib/tasaciones.ts`. |
| **Síntoma** | La card enlaza **incondicionalmente** a `/tasaciones/{id}`, de modo que **el gate de §2.4 no existe en la interfaz**. Tres consecuencias observables: <br>**(1)** Una solicitud sin coordinar deja entrar al formulario de captura igual que una coordinada. <br>**(2)** La sección A del formulario espera *"Fecha planificada de visita · Pre-llenado · editable"* desde la coordinación (§2.8 · RF-TAS-17); si nunca se coordinó, **no hay qué pre-llenar** y el tasador lo completa a mano sin saber que se saltó un paso. <br>**(3)** Una solicitud devuelta a la ejecutiva **no se distingue de una coordinable**: falta la variante deshabilitada con el badge *"Esperando contacto de ejecutiva"*, así que el tasador vuelve a entrar a una solicitud que está esperando a otra persona. |
| **Causa** | Dos piezas construidas y **ninguna cableada**. `resolverAccionCard()` existe desde el Bloque 2 de P4-TAS y **no tiene ningún consumidor**; `Tasacion.coordinacionVigente` existe en el tipo y **`proyectarTasacion()` no lo puebla** — se añadió el campo pero no su lectura. Con la proyección vacía, `resolverAccionCard()` devolvería siempre la variante `coordinar` aunque se cableara hoy, que es el peor de los dos errores posibles: parecería funcionar. |
| **Impacto** | **Alto, y es el más funcional de los tres hallazgos de este bloque.** Los otros dos son de comentario o de filtro; éste **permite saltarse una etapa del flujo**. Además realimenta el SLA: si el tasador nunca pasa por Pantalla 2, nadie cierra e2 ni e3, la solicitud se queda con la etapa 2 abierta y su semáforo termina en rojo sin que haya habido incumplimiento real — que es exactamente el problema que Q5 vino a cerrar. |
| **Mitigación pendiente** | **Dos pasos, en este orden y no al revés:** <br>**(1) Poblar `coordinacionVigente` en `proyectarTasacion()`** (`lib/tasador/lectura-tasacion.ts`), leyendo `coordinacion_vigente` de `TX_Solicitudes`. Es un campo más en la proyección compartida, así que lo pagan `leerCola()` y `leerTasacion()` por igual — y aquí **sí corresponde** que lo pague la cola, porque es la cola la que lo necesita. <br>**(2) Cablear `resolverAccionCard(tasacion)`** en `tasacion-card.tsx` y renderizar las tres variantes: `coordinar` (acento, a `/tasaciones/{id}/coordinar`), `abrir` (primario, a `/tasaciones/{id}`) y `esperando_ejecutiva` (deshabilitado, con el badge). Los rótulos son literales §6 y no admiten variación. <br>**Test obligatorio**: que una solicitud sin `coordinacionVigente` **no** enlace a la captura. Sin ese test, el gate puede volver a perderse en el próximo refactor sin que nada falle. |
| **Dueño** | Sergio (priorización) · Claude Code (implementación en la tanda de Pantalla 1) |
| **Fecha objetivo** | **Primera tanda de Pantalla 1.** Es la de mayor prioridad de las dos fichas de este bloque. |
| **Resolución** | **Aplicada en los Bloques 1 y 2 del Frente A+B.** Paso (1): `coordinacionVigente` se puebla en `proyectarTasacion()` (`lib/tasador/lectura-tasacion.ts`), leyendo `coordinacion_vigente` con normalización cerrada a los dos literales del contrato. Paso (2): el gate §2.4 se cableó en `components/tasador/tasacion-card.tsx` con `resolverAccionCard(tasacion)` renderizado por un `switch` exhaustivo (`default: never`) sobre las tres variantes T-A. Test del gate cubierto en `lib/tasaciones.test.ts` (una solicitud sin coordinación devuelve la variante `coordinar`, no `abrir`). |
| **Estado** | **aplicada.** |
| **Origen** | Bloque 6 de **P4-TAS** (19-ago-2026), auditoría explícita de las lógicas que RO-29 había condicionado. **La lógica no se tocó**: cablear la card es trabajo de Pantalla 1, no de la limpieza de RO-29. |

**Notas:**

- **`resolverAccionCard()` sin consumidores es la señal.** Una función exportada, documentada y testeable que nadie llama es exactamente la forma que toma una pieza construida a mitad de camino. Si esta ficha se cerrara sin cablearla, habría que borrarla.
- **El orden de los dos pasos importa.** Cablear la card antes de poblar la proyección da una card que muestra "Coordinar visita" en todas las solicitudes, incluidas las ya coordinadas — un gate que bloquea a todo el mundo es peor que ningún gate, porque parece intencional.
- Relación con **CI-045**: comparten el paso (1). Si se hacen en la misma tanda, la proyección se puebla una vez y las dos fichas cierran con ella. Se dejan separadas porque sus impactos no son comparables.

---

## CI-048 · Chip "Por coordinar" — la cota wall-clock de 4h de §2.1/RF-TAS-01 no es implementable en IF-03

| Campo | Valor |
|---|---|
| **Identificador** | CI-048 |
| **Archivo:línea** | `lib/tasador/cola-filtros.ts` → `esPorCoordinar()` · vs `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` §2.1, **RF-TAS-01**, §2.2 · relacionada con **CI-021** y **CI-045** |
| **Contexto** | §2.1 / RF-TAS-01 define el chip "Por coordinar" como *"solicitudes **sin coordinación vigente**, en estado `asignada` y con `now() - fecha_asignacion < 4h`"*. Al cablear el chip contra `coordinacion_vigente` (cierre de CI-045), la parte de coordinación es directa —`estado === 'asignada' && coordinacionVigente == null`—; el problema es la **cota horaria de 4h**. |
| **Síntoma** | La cota `now() - fecha_asignacion < 4h` **no es reproducible en IF-03**. El plazo real de la etapa 2 (§5.2.4) se mide en **horas hábiles** —lunes a viernes, 09:00–18:00, feriados excluidos, con pausa fuera de ventana (§5.2.1)—, no en horas de reloj. Restar `now() - fecha_asignacion` en el cliente daría un número **distinto** del que el motor calcula, y reintroduciría la aritmética de plazos que **CI-021 retiró a propósito** (el campo `horas_restantes` se eliminó por producir una cifra irreproducible). §2.2 declara que IF-03 **consume** el control de SLA, no lo recalcula. Además, una cota de pertenencia **esconde del chip las coordinaciones vencidas** (pasadas las 4h), que son precisamente las más urgentes de coordinar. |
| **Causa** | La spec describe el chip con una resta de reloj que era natural cuando el SLA se pensaba en días agregados; el modelo por etapa en horas hábiles (RF-53) la volvió no computable del lado cliente sin duplicar el motor. La letra no tiene una realización alternativa fiel dentro de las reglas de IF-03. |
| **Impacto** | **Bajo y acotado a la semántica de un filtro de lectura.** No hay pérdida de datos ni escritura. La divergencia es de pertenencia: una solicitud `asignada` sin coordinar aparece en el chip **por más vieja que sea**, en vez de caerse a las 4h. Es la lectura funcionalmente correcta (una coordinación vencida sigue pendiente de hacerse), pero difiere de la letra de §2.1. |
| **Decisión (A-36 · aprobada)** | ⚠ *Re-etiquetada el 22-ago-2026: esta decisión se registró originalmente como `A-22`, identificador que en `gap/_ambiguedades.md` designa el umbral del recordatorio al tasador. Manda el registro; la decisión del chip es **A-36**. Precedente de la misma clase de colisión: **A-10**.* La cota de 4h se **dropea de la PERTENENCIA**. Membresía = `estado === 'asignada' && coordinacionVigente == null`. El *"menor tiempo restante"* de §2.1 se preserva en el **ORDEN**: `filtrarCola()` ordena "Por coordinar" por `sla_etapa_vence_ts` ascendente —el instante que el motor ya materializó— sin recalcular nada. No se implementa ninguna variante de ventana horaria en el cliente. |
| **Referencias cruzadas** | spec §2.1 (definición del chip) · RF-TAS-01 · spec §2.2 (IF-03 consume el SLA, no lo recalcula) · **CI-021** (retiro de `horas_restantes` por el mismo motivo) · **CI-045** (cableado del chip a `coordinacion_vigente`, del que ésta es la sub-decisión de la cota) |
| **Dueño** | Sergio (aprobó A-36, ex `A-22`) · Héctor (acuse formal pendiente) · Claude Code (implementación) |
| **Estado** | **aplicada.** Implementada en el Bloque 3 del frente A+B (Pantalla 1). Pendiente **acuse formal de Héctor** — **no bloqueante**: la letra de §2.1 no tiene alternativa implementable dentro de CI-021/§2.2, así que la divergencia se sostiene sola. |
| **Origen** | Frente A+B · Bloque 3 (cierre de CI-045). Registrada por instrucción explícita de Sergio como decisión con divergencia declarada, no como defecto a corregir. |

**Notas:**

- **La divergencia no es una omisión: es la única lectura fiel disponible.** Implementar la cota de 4h exigiría o bien recalcular horas hábiles en el cliente (viola CI-021 y §2.2) o bien esconder del chip las coordinaciones vencidas (viola el propósito de RF-TAS-01). Ninguna de las dos es mejor que dropearla.
- **El "menor tiempo restante" sobrevive donde corresponde.** La urgencia se lee en el **orden** por `venceTs`, que sí es una pregunta de SLA y está bien resuelta por el motor. Lo que se retira es sólo la cota **binaria** de entrada/salida del chip.
- **El candado está en `cola-filtros.test.ts`.** El caso "no aplica ninguna ventana de tiempo sobre la fecha de asignación" fija una `asignada` sin coordinar asignada hace un mes y exige que siga en el chip: si alguien reintroduce una ventana horaria, ese test se cae.
- **El cierre de A-22 el 22-ago-2026 NO reabre esta ficha, y conviene decirlo.** Héctor ratificó el umbral del recordatorio al tasador en **4 h hábiles**, la misma cifra que esta ficha dropeó del chip. Son cosas distintas: A-22 fija **cuándo se avisa**; ésta, **qué se muestra** en la cola. Reintroducir la cota para "cuadrar" con el recordatorio reabriría CI-021 —recalcular horas hábiles en el cliente— y volvería a esconder las coordinaciones vencidas, que son las que el recordatorio acaba de señalar como urgentes. Un chip que expulsa la solicitud en el mismo instante en que el sistema le escribe al tasador se contradice consigo mismo. El plan de IF-03 §11.1 lo sostiene explícitamente.

---

## CI-047 · El plan de ejecución menciona un flag `TASADOR_COORDINACION_ENABLED` que no existe

| Campo | Valor |
|---|---|
| **Identificador** | CI-047 |
| **Archivo:línea** | `docs/_md/plan_ejecucion_UItasador_v1.3.md` §5 (P4-TAS) · vs el árbol real de código |
| **Contexto** | §5 del plan declara la Pantalla 2 (coordinar visita) como *"⛔ BLOQUEADA · pendiente decisión Héctor/Óscar"* y detalla que RF-TAS-03/12/13 *"se construyen detrás de un flag de entorno apagado (`TASADOR_COORDINACION_ENABLED=false`)"*, con el flag a apagarse en Railway en P12-TAS. |
| **Síntoma** | **Ese flag nunca se creó.** No existe `TASADOR_COORDINACION_ENABLED` —ni ninguna variante— en el código: `grep` sobre `app/`, `lib/` y `components/` no lo encuentra. CI-012 se cerró en positivo el 19-ago-2026 (revisión de Héctor del diseño v4, que anuló RO-29), así que P4-TAS quedó **viva y sin gate**: la ruta `/tasaciones/[id]/coordinar` es alcanzable directamente. El código y el plan describen dos realidades distintas del mismo flujo. |
| **Causa** | La compuerta de negocio de §5 se resolvió (CI-012 positiva) entre la redacción del plan y la ejecución de P4-TAS, y el plan —documento maestro— no se realineó con esa resolución. Es la desincronización típica entre un plan escrito por adelantado y el estado que la implementación alcanzó. |
| **Impacto** | **Bajo · deuda documental.** No hay defecto de código: el flujo funciona como se espera tras CI-012 positiva. El riesgo es de lectura — quien retome guiándose por §5 puede buscar un flag que no está, o creer que la coordinación está bloqueada cuando está viva. |
| **Decisión** | **Alinear el plan en la próxima edición de ese documento**: §5 debe reflejar que CI-012 se cerró en positivo, que no hay flag y que la Pantalla 2 quedó viva. **No se toca en esta tanda** — editar el plan es una operación deliberada, no un efecto colateral del frente A+B. |
| **Referencias cruzadas** | plan §5 (P4-TAS) · **CI-012** (compuerta de negocio, cerrada positiva 19-ago-2026) · RO-29 (anulada la misma fecha) |
| **Dueño** | Sergio (edita el plan cuando corresponda) |
| **Estado** | **registrada, sin acción inmediata.** |
| **Origen** | Frente A+B · verificación previa (el gate de la card rutea a `/coordinar`, lo que obligó a confirmar que la ruta no estuviera tras un flag). Registrada por instrucción explícita de Sergio. |

**Notas:**

- **La ficha existe para que nadie busque un flag fantasma.** El síntoma es silencioso: no hay error, sólo un documento que describe un gate que no se construyó. Sin esta entrada, el diagnóstico costaría un `grep` y un rato de confusión.


---

## CI-049 · Dos comentarios de cabecera apuntan a documentos normativos que ya no existen

| Campo | Valor |
|---|---|
| **Identificador** | CI-049 |
| **Archivo:línea** | ~~`lib/tasaciones.ts:4`~~ **corregido en P7-TAS.0** · `lib/tipos-documento.ts:53` (**sigue abierto**) |
| **Síntoma** | Dos comentarios de documentación en código citan archivos que fueron renombrados por bumps posteriores y **ya no existen en el árbol**. `lib/tasaciones.ts:4` dice *"Tanda P1-TAS del plan `docs/_md/plan_ejecucion_UItasador_v1.0.md` §2"*, cuando el plan vigente es `v1.2`. `lib/tipos-documento.ts:53` dice `@see docs/_md/VProperty_Especificacion_Proyecto_v1_9_5.md §4.1 · §4.2 (RN-25)`, cuando el normativo vigente es `v1_9_14`: **nueve versiones de distancia**. Ninguno de los dos rompe la compilación —son comentarios, no imports— y por eso ninguna herramienta los detecta. |
| **Causa** | La convención de la especificación es *archivo nuevo por versión* con `git mv` y actualización de referencias en el mismo commit. Los punteros dentro de `.ts` quedaron fuera de ese barrido en al menos dos bumps: el de `v1_9_5` en adelante para `tipos-documento.ts`, y el de `v1.0 → v1.1` del plan del Tasador, hecho en esta misma ronda del 21-ago-2026 bajo una regla que **excluía tocar código** (R2). El precedente **C-10** del `SYNC_LOG` muestra que en el lote 7 sí se actualizaron seis punteros equivalentes, de modo que la práctica existe pero no es sistemática. |
| **Resolución** | ⚠ **ABIERTA · deliberadamente diferida.** No se corrige en la ronda del 21-ago-2026 por decisión explícita de Sergio: la ronda era documental y R2 protegía el código. La corrección es de **una línea por archivo** y no tiene riesgo de comportamiento; se aplica en la próxima tanda que toque cualquiera de los dos módulos. <br>**Al aplicarla, conviene además decidir la regla general**, que es lo que evita la tercera repetición: (i) que el bump normativo incluya un barrido de `.ts`/`.tsx` en su checklist —precedente C-10—, o (ii) que los comentarios citen el documento **sin número de versión** (`VProperty_Especificacion_Proyecto` §4.1), aceptando perder precisión histórica a cambio de no envejecer. La opción (ii) es la que resuelve el problema de raíz. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **abierta** · corrección trivial, diferida por alcance de la ronda |
| **Origen** | Fase 3 de la ronda de integración de audios + plantilla operativa (21-ago-2026), al barrer el repositorio en busca de referencias a las versiones superadas de los cuatro documentos versionados. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **Encaja en el alcance de este registro y conviene decir por qué.** El archivo excluye explícitamente las divergencias *documento ↔ documento*. Ésta no lo es: es el **código** el que afirma algo —que existe un archivo en una ruta— que dejó de ser cierto. La verificación es abrir la ruta y no encontrarla.
- El caso de `tipos-documento.ts` es el más viejo y el que mejor ilustra el costo: un lector que siga esa cita para entender RN-25 no encuentra el archivo, y no tiene forma de saber si la regla cambió de número o de contenido en las ocho versiones intermedias.
- **Caso 1 CERRADO en P7-TAS.0 (23-ago-2026).** `lib/tasaciones.ts:4` citaba
  `plan_ejecucion_UItasador_v1.0.md`. El archivo se movió a `lib/tasador/tasaciones.ts` en la
  mudanza de territorio y **la cita se corrigió en el mismo commit**, a `v1.3` y con la nota de
  bajo qué versión se creó. **Queda un solo caso vivo**: `lib/tipos-documento.ts:53`, que sigue
  citando `VProperty_Especificacion_Proyecto_v1_9_5.md` y es **territorio IF-02** (R5), de modo
  que su corrección necesita autorización aparte.
- **La brecha se ensanchó un bump más (23-ago-2026).** El bump a v1.9.15 y el de
  `plan_ejecucion_UItasador` a v1.3 dejaron las dos citas de `.ts` **una versión más atrás**;
  no se añadieron citas nuevas. La tanda del 23-ago era documental y R2 volvió a proteger el
  código, de modo que la corrección sigue diferida por la misma razón que el 21-ago. Sigue
  siendo una línea por archivo.
- **Tercer caso, de otra especie (22-ago-2026 · P0.5.B-TAS).** `lib/catalogos.ts:43-44` documenta un workaround: *"`M_TiposPropiedad` tiene `DEPARTAMENTO` y `Departamento` como filas distintas"*. **Ya no las tiene**: la tanda P0.5.B-TAS eliminó los duplicados y dejó `Casa` y `Departamento` como únicas canónicas. El comentario quedó factualmente falso. <br>Se anota acá y **no se corrigió** (R5 de esa tanda: es código). Difiere de los dos casos anteriores en que no envejeció por un renombre de archivo sino por un **cambio en los datos**, lo que lo hace más difícil de detectar: ningún `grep` de rutas lo encuentra. <br>**El código sigue siendo correcto** —`claveDedupe()` sobre una lista sin duplicados es un no-op inofensivo, y de hecho el saneamiento lo volvió determinista, cuando antes cuál fila ganaba dependía del orden de Airtable—. Lo que hay que decidir al tocarlo es si la deduplicación se conserva como red de seguridad o se retira junto con el comentario.

---

## CI-050 · El gate de coordinación es de navegación, no de acceso: una URL a mano lo saltea

| Campo | Valor |
|---|---|
| **Identificador** | CI-050 |
| **Archivo:línea** | `app/tasaciones/[id]/page.tsx` · `app/tasaciones/[id]/fotos/page.tsx` · `app/tasaciones/[id]/lectura/page.tsx` · `app/tasaciones/[id]/estado/page.tsx` · `app/tasaciones/[id]/informe/page.tsx` — las cinco, por ausencia · vs spec §2.4 (*Gate de coordinación*) y **RF-TAS-11** |
| **Contexto** | **CI-046 está cerrada y este hallazgo no la reabre.** El Frente A+B (`b035172`, 21-ago-2026) construyó el gate exactamente donde §2.4 lo ubica: *"El gate ya no vive en un botón «Iniciar captura», sino en **la llamada a la acción de la card** (RF-TAS-11)"*. `resolverAccionCard()` discrimina las tres variantes de la Regla T-A y `tasacion-card.tsx` las renderiza con un `switch` exhaustivo. Lo que esta ficha registra es que **la letra de §2.4 alcanza sólo hasta el CTA**, y el enunciado que la precede —*"mientras la coordinación no esté confirmada, el tasador no entra a la captura"*— es más fuerte que su realización. |
| **Síntoma** | Ninguna de las **cinco** páginas del tasador consulta `coordinacionVigente` — verificado: cero ocurrencias en las cinco. Un `GET /tasaciones/{id}` o `/tasaciones/{id}/fotos` escrito a mano, pegado desde un chat, guardado en favoritos o alcanzado con el botón «atrás» del navegador **renderiza la captura igual**, con la coordinación sin confirmar o incluso rechazada. El gate desaparece en cuanto el usuario no pasa por la card. |
| **Causa** | El gate se implementó como **decisión de navegación** —qué `href` emite la card— y no como **control de acceso** —qué puede renderizar una ruta—. Es la realización literal de §2.4, que nombra el CTA y no menciona guard de ruta. Las dos piezas necesarias ya existen y están probadas: `proyectarTasacion()` puebla `coordinacionVigente` (`lib/tasador/lectura-tasacion.ts:408`) y `leerTasacion()` ya corre server-side en esas páginas. **No falta dato: falta que alguien lo consulte del otro lado de la puerta.** |
| **Impacto** | **Medio.** No es una vulnerabilidad —el usuario ya está autenticado y la solicitud ya pasó el guard de pertenencia RF-09 de la capa API—, así que nadie ve datos ajenos. Lo que se saltea es una **precedencia de flujo**, con dos consecuencias que CI-046 ya describía para el caso de la card: **(1)** la sección A del formulario espera *"Fecha planificada de visita · Pre-llenado · editable"* desde la coordinación (§2.8 · RF-TAS-17), y sin coordinar **no hay qué pre-llenar**; **(2)** realimenta el SLA — si el tasador nunca pasa por Pantalla 2, nadie cierra e2 ni e3, la etapa 2 queda abierta y el semáforo termina en rojo sin incumplimiento real, que es justo lo que Q5 vino a cerrar. La diferencia con CI-046 es de **probabilidad, no de consecuencia**: por la card ya no se puede; por URL sí, y es un camino menos transitado. |
| **Mitigación pendiente** | **Guard server-side en las cinco páginas, revalidando `coordinacionVigente` antes de renderizar.** Forma esperada: un helper único —`lib/tasador/gate-coordinacion.ts`, una sola implementación que las cinco importan, como `auth-guard.ts` para la capa API— que reciba la `Tasacion` ya leída y **redirija** a `/tasaciones/{id}/coordinar` si `coordinacionVigente !== 'confirmada'`. Tres precisiones que conviene fijar antes de escribirlo: <br>**(a) `rechazada` no redirige a coordinar.** La Regla T-A la manda a la variante deshabilitada *"Esperando contacto de ejecutiva"*; mandarla a Pantalla 2 invitaría a un intento que el flujo no quiere todavía. Destino natural: la cola. <br>**(b) `/tasaciones/{id}/coordinar` queda fuera del guard**, obviamente — es el destino. <br>**(c) `/informe` merece decisión propia**: es lectura, no captura, y §2.10 la ofrece con "Ver expediente"; puede que no corresponda cerrarla. <br>**Test obligatorio**: que una `Tasacion` sin `coordinacionVigente` no renderice la captura. Sin él, el guard se pierde en el próximo refactor sin que nada falle — mismo argumento que CI-046 usó para el suyo, y que funcionó. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Resolución** | **ABIERTA · asignada a P11-TAS** (§12 del plan · *Autenticación y blindaje server-side*), que es la tanda dueña de convertir garantías de UI en garantías de servidor. Encaja con su alcance declarado: P11-TAS sustituye la fuente de identidad sin inventar el guard de pertenencia, y acá haría lo mismo con el de precedencia. **No se corrige antes** por dos razones: §2.4 pone el gate en la card y ya está puesto, de modo que adelantarlo sería ampliar alcance sobre una spec que fue deliberada; y P5-TAS —la tanda inmediata— construye Pantalla 3, que es una de las cinco páginas a proteger: hacerlo ahora obligaría a tocarla dos veces. |
| **Estado** | **abierta** · no bloquea P5-TAS |
| **Origen** | Gate 1 de la tanda del 22-ago-2026, al verificar si CI-046 seguía pendiente. La ficha de CI-046 estaba cerrada y el código lo confirmaba; el hallazgo apareció al preguntar **hasta dónde** llegaba el gate que sí estaba construido. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **No fusionar con CI-046.** Aquélla está `aplicada` y describe un gate **ausente**; ésta describe un gate **presente pero de alcance menor al del enunciado que lo motiva**. Fusionarlas reabriría una ficha cerrada correctamente y perdería la distinción útil: una era *no está construido*, la otra es *está construido donde la spec dijo, y la spec dijo menos de lo que su propia frase promete*.
- **Puede que la corrección correcta sea a la spec, no al código.** Si el negocio acepta que el gate sea de navegación —el tasador entra por la cola, no tecleando URLs—, entonces §2.4 está bien como está y esta ficha se cierra sin escribir una línea. Esa decisión es de Héctor, no de la tanda que implemente. Lo que no debería quedar es la ambigüedad actual, donde el texto promete *"no entra a la captura"* y la realización garantiza *"la card no lo lleva a la captura"*.

---

## CI-051 · `TX_Adjuntos.seccion` no existe: el plan pide escribir un campo que la tabla no tiene

| Campo | Valor |
|---|---|
| **Identificador** | CI-051 |
| **Archivo:línea** | `app/api/tasaciones/[id]/fotos/route.ts` → `POST`, el objeto de `createRecord` · vs plan IF-03 §6.1 y §6.3, y spec §2.6 |
| **Contexto** | §2.6 lo enuncia como una precaución razonada: *"el campo `TX_Adjuntos.seccion` se sigue escribiendo aunque la sección ya aparezca en el path: es lo que permite filtrar por sección en Airtable sin parsear el string"*. El plan lo recoge como criterio de aceptación de P5-TAS: *"`TX_Adjuntos.seccion` se escribe en cada alta, además del path"*. El razonamiento es correcto —filtrar por un campo es mejor que parsear un string— pero el campo **no existe**. |
| **Síntoma** | `TX_Adjuntos` (`tblur71x1oItbmKZc`) tiene **26 campos verificados por Meta API el 17-ago-2026** y ninguno se llama `seccion`. El criterio de aceptación de §6.3 es, tal como está escrito, **inverificable**: no hay campo que comprobar. Escribirlo con `typecast` tampoco sirve — Airtable no crea campos por escritura, sólo opciones de `singleSelect`. |
| **Causa** | Deuda de schema que nadie resolvió entre la redacción de §2.6 y la construcción del endpoint. P2-TAS.A lo detectó al escribir la ruta, lo dejó anotado en el docblock —*"Anotado para P5-TAS, que es la tanda de esta pantalla"*— y siguió adelante con el contrato que sí era implementable. P5-TAS lo hereda: es la tanda que el propio aviso designaba. |
| **Impacto** | **Bajo. La información no se pierde**, cambia de nombre. La categoría de cada foto se guarda en `descripcion` (texto libre, que admite las categorías personalizadas de §2.6) y `tipo_adjunto` lleva el valor cerrado `foto_interior`. El filtrado en Airtable sigue siendo posible por `descripcion`; lo que se pierde es el `singleSelect` que habría hecho ese filtro robusto ante erratas. **Nada en la UI depende de este campo.** |
| **Mitigación pendiente** | **Decisión de negocio, no de código.** Dos salidas, y conviene elegir una en vez de dejar la spec y la base discrepando: <br>**(a) Crear el campo `seccion` en `TX_Adjuntos`** —`singleSelect` con el dominio de secciones de §8— y migrar las filas existentes leyendo `descripcion`. Exige aprobación explícita de Sergio (`CLAUDE.md`: crear campos en Airtable no se hace por cuenta propia) y una pasada de migración sobre las filas ya escritas. <br>**(b) Corregir §2.6 y el criterio de §6.3** para que nombren `descripcion` / `tipo_adjunto`, que es lo que la tabla tiene. Más barato, y suficiente si nadie va a filtrar por sección en la UI de Airtable. <br>La pregunta que decide entre las dos: **¿alguien filtra adjuntos por sección desde Airtable, o sólo desde la app?** Si es lo segundo, (b) alcanza. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Resolución** | **ABIERTA.** P5-TAS escribió la categoría en `tipo_adjunto` / `descripcion` —el contrato que el endpoint ya implementaba— por decisión de Sergio en el Gate 1 del 22-ago-2026, y registró esta ficha en vez de crear el campo. Crear schema no era necesario para que la pantalla funcione, y hacerlo dentro de una tanda de cliente habría mezclado dos tipos de cambio con aprobaciones distintas. |
| **Ampliación · 22-ago-2026 (B3 de P5-TAS)** | **El sub-nivel `{seccion}/` del path tampoco llega a Dropbox**, y es la misma raíz por el otro extremo. §2.6 y el §6.1 del plan piden guardar en `{Unidad}/{seccion}/`; `componerCarpetaDropbox()` (`lib/dropbox-path.ts`) **no tiene segmento de sección** y quien compone el path es `app/api/adjuntos/upload/route.ts`. Las fotos caen en la carpeta de unidad como cualquier otro adjunto y la sección sobrevive **sólo** en `descripcion` — exactamente el escenario que la precaución de §2.6 quería evitar («filtrar sin parsear el string»), ahora sin ninguna de las dos vías. <br>No se abrió ficha nueva por decisión de Sergio en el Gate 2: es el mismo hecho —la spec pide una dimensión de clasificación que el modelo no soporta— visto en el campo y en el path. <br>**No se corrigió en P5-TAS** porque la excepción R4 de esa tanda autorizaba tocar un solo archivo bajo `app/api/`, y éste exige el endpoint de subida más `lib/dropbox-path.ts`. Quien retome esto decide las dos cosas juntas: crear el campo `seccion` y agregar el segmento al path, o corregir §2.6 y el criterio de §6.3 para que describan lo que el sistema hace. |
| **Estado** | **abierta** · no bloquea P5-TAS ni ninguna tanda posterior |
| **Origen** | Gate 1 de **P5-TAS** (22-ago-2026), al contrastar los criterios de §6.3 contra el contrato real del endpoint. El docblock de la ruta ya lo advertía desde P2-TAS.A. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **El docblock del endpoint es la mejor documentación de esta inconsistencia** y conviene no borrarlo al resolverla: explica por qué `tipo_adjunto` lleva un valor fijo y `descripcion` la categoría real, que de otro modo se lee como un error.
- Emparenta con **CI-049** en la especie —el código afirma algo que dejó de ser cierto— pero al revés: acá es el **documento** el que afirma la existencia de algo que el código no puede usar.

---

## CI-052 · Dos endpoints crean la misma fila en `TX_Adjuntos`: encadenarlos duplica el registro

| Campo | Valor |
|---|---|
| **Identificador** | CI-052 |
| **Archivo:línea** | `app/api/adjuntos/upload/route.ts` (respuesta con `adjunto_id`) · `app/api/tasaciones/[id]/fotos/route.ts` → `POST`, `createRecord(TABLE_IDS.adjuntos, …)` |
| **Contexto** | El plan §6.1 describe el guardado de fotos como una cadena: el binario sube *"por el pipeline existente"* y el organizador registra la fila con su categoría. El docblock de `POST /fotos` lo enuncia explícitamente: *"El archivo sube por el pipeline existente (`app/api/adjuntos/upload/route.ts` → Make → Dropbox), que IF-03 reutiliza tal cual (R7). El POST de acá registra la fila y su categoría; recibe la `url_dropbox` que aquel devolvió."* |
| **Síntoma** | **Esa cadena escribe dos filas por foto.** `/api/adjuntos/upload` no sólo sube el binario: el módulo 8 de `SC-Adjuntos-Upload` **crea la fila en `TX_Adjuntos`** y devuelve su `adjunto_id`. La ruta lo trata como obligatorio —responde **502** si Make contesta 200 sin él— así que no es un efecto opcional sino parte de su contrato. `POST /api/tasaciones/[id]/fotos` hace su propio `createRecord` sobre la misma tabla. Encadenados, cada foto deja **dos registros**: uno con el archivo y sin categoría, otro con la categoría y la URL copiada. Los contadores de `GET /fotos` contarían de más y el expediente mostraría duplicados. |
| **Causa** | Dos tandas distintas escribieron cada extremo sin que ninguna viera el conjunto. El pipeline de adjuntos es de **IF-02** y su alta en Airtable vive dentro del escenario Make, no en el código del Route Handler — así que leer `upload/route.ts` no revela que crea una fila salvo que se siga el rastro hasta el comentario del módulo 8. P2-TAS.A escribió `POST /fotos` asumiendo que aquel endpoint sólo movía el binario. **La suposición es razonable y está escrita; simplemente no es cierta.** |
| **Impacto** | **Alto sobre la tanda, nulo sobre producción hoy.** Nada llama todavía a `POST /fotos` —la pantalla nunca persistió fotos—, así que la duplicación **no ha ocurrido nunca**. Pero bloquea el camino de escritura de Pantalla 3: implementarlo tal como está descrito introduciría el defecto en el primer uso. |
| **Mitigación pendiente** | **Decidir cuál de los dos endpoints es dueño de la fila.** Tres salidas: <br>**(a) Dueño el pipeline.** `/fotos` deja de crear y pasa a **actualizar** el registro que Make ya creó, escribiendo la categoría sobre el `adjunto_id` devuelto. Es un `PATCH`, no un `POST`, y conserva la idempotencia que `SC-Adjuntos-Upload` ya resuelve por `hash_md5`. **Es la que menos toca**: el pipeline sigue siendo la única puerta a Dropbox. <br>**(b) Dueño `/fotos`.** Exigiría que el pipeline no cree fila para fotos, lo que significa tocar el escenario Make de IF-02 — más caro y con más superficie de riesgo. <br>**(c) Ruta propia de subida para IF-03**, que viola R7 y duplica la integración con Dropbox. Se descarta salvo que aparezca un motivo fuerte. <br>**Recomendada: (a).** Requiere que `POST /fotos` mute a `PATCH` o acepte un `adjuntoId` existente, que es cambio de **server** y por tanto de tanda propia. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Resolución** | **CERRADA · 22-ago-2026 · opción (a) implementada.** Sergio aprobó la salida recomendada en el Gate 2 de la reanudación de P5-TAS: **el pipeline de adjuntos es el dueño de la fila**. `app/api/tasaciones/[id]/fotos/route.ts` dejó de crear registros —desapareció el `createRecord`— y expone ahora un **`PATCH`** que actualiza el adjunto que el módulo 8 de `SC-Adjuntos-Upload` ya creó, escribiendo la categoría sobre el `adjunto_id` devuelto. El escenario Make de IF-02 **no se tocó** y la idempotencia por `hash_md5` se conserva: una subida deduplicada devuelve el record ID existente y el `PATCH` sólo lo recategoriza. <br>**Se cambió el verbo, no sólo el cuerpo.** Nada consumía el `POST` —esta misma ficha lo verificó—, así que no hubo ruptura; mantenerlo diciendo «crear» sólo invitaba a reintroducir el defecto, y `PATCH` cubre además la **recategorización** de una foto ya subida, que el propio docblock de la ruta declara como la operación más frecuente. <br>**Dos adiciones aprobadas en el mismo Gate.** (1) **Guard de pertenencia**: el `PATCH` lee el adjunto y comprueba que su Link `solicitud` contenga la solicitud del guard — sin él, cualquiera con una tasación propia podría recategorizar el adjunto de otra conociendo su record ID; es el mismo hueco que la nota de abajo señala en `GET /api/solicitudes/[id]/adjuntos`, y no se quería abrir uno nuevo en el archivo que venía a cerrar la ficha. (2) **`subido_por` se reescribe server-side** con el literal exacto `Tasador`: el `singleSelect` de `TX_Adjuntos` tiene hoy `Tasador` **y** `tasador`, y con `typecast` la minúscula se escribe sin error dejando la foto fuera del `GET` para siempre. <br>**Cobertura:** 15 tests en `app/api/tasaciones/[id]/fotos/route.test.ts` —incluido uno que afirma que `createRecord` no se llama nunca, porque la fila duplicada no falla, sólo cuenta de más— y 14 en `lib/tasador/fotos.test.ts`. |
| **Estado** | **cerrada** · 22-ago-2026 · commit: *(Sergio lo agrega tras commit)* |
| **Origen** | Batch B3 de **P5-TAS** (22-ago-2026), en la verificación previa que el propio Gate 1 exigía: *"antes de B3, verificá que `/api/adjuntos/upload` existe y funciona"*. Existe y funciona — el problema no era su estado sino su contrato. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **La verificación pedida era "¿existe y funciona?" y la respuesta fue "sí".** Lo que no estaba en la pregunta —y resultó ser lo que importaba— es *qué más hace además de lo que su nombre promete*. Vale como regla: al reutilizar un endpoint ajeno, leer sus **efectos**, no sólo su firma y su estado.
- **`GET /api/solicitudes/[id]/adjuntos` no tiene guard de pertenencia.** Se observó al reutilizar el sheet documental desde IF-03: la ruta valida el record ID y la sesión de Clerk, pero no comprueba que la solicitud sea del usuario. No lo introdujo P5-TAS y no es de su alcance corregirlo; se anota acá por proximidad temática con **CI-050**, que registra el mismo tipo de hueco en las páginas del tasador.

---

## CI-053 · El pie fijo de Pantalla 3 no entra a 375 px

| Campo | Valor |
|---|---|
| **Identificador** | CI-053 |
| **Archivo:línea** | `components/tasador/fotos-screen.tsx:451-469` — el `<footer>` de la pantalla que sirve `app/tasaciones/[id]/fotos/page.tsx` |
| **Contexto** | §6.1 del plan IF-03 fija el pie de Pantalla 3: *"«Volver» y «Continuar con datos de la visita»"*. Los dos botones se disponen en una fila `flex` de ancho completo, con el segundo en `flex-1`. |
| **Síntoma** | **A viewport 375×667 los dos botones no caben lado a lado y el copy se corta.** «Continuar con datos de la visita» es una etiqueta larga y comparte fila con «Volver», su icono y el `gap-3` del contenedor. Observado por Sergio en Chrome DevTools el 22-ago-2026, en la verificación de P5-TAS. |
| **Causa** | Layout heredado del import v0, pensado para el `max-w-2xl` del contenedor y nunca contrastado contra el ancho real de un teléfono. Es el mismo tipo de hueco que CI-053 comparte con el sheet documental: componentes correctos en escritorio que nadie midió a 375 px. |
| **Impacto** | **Cosmético. No bloquea el flujo**: los dos botones siguen siendo funcionales y alcanzables, y el destino de cada uno es inequívoco por su icono. Se degrada la legibilidad del rótulo, no la operación. |
| **Mitigación pendiente** | Tres salidas, a evaluar juntas porque compiten: <br>**(a) Apilar en vertical bajo `sm`** — el pie pasa a dos filas. Es lo más legible y lo que más alto roba a una pantalla que ya tiene cabecera pegajosa y pie fijo. <br>**(b) `min-w-0` + `truncate`** en el botón largo — conserva una sola fila y corta el texto con elipsis, que es lo que hoy pasa sin control. <br>**(c) Acortar el copy a «Continuar →»** bajo `sm` — el más barato y el que mejor se ve, pero **toca un literal de §6.1**, así que exige sign-off: los rótulos del pie están fijados en el plan y no se cambian desde el código. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Resolución** | **ABIERTA · asignada a P8-TAS (pulido UI).** No se corrigió en la tanda del 22-ago-2026 por dos razones: es **preexistente** —el `git blame` lo sitúa en el import v0 y la migración de tokens de esa tanda no tocó el layout del pie, sólo los colores— y la salida (c), que es la más limpia visualmente, cambia un literal normativo y no es decisión del ejecutor. |
| **Estado** | **abierta** · cosmético · no bloquea P5-TAS ni el commit de la tanda |
| **Origen** | Verificación visual a 375×667 de **P5-TAS** (22-ago-2026), la misma que confirmó el arreglo del sheet documental. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **No lo introdujo la migración de tokens (B3).** Conviene dejarlo dicho porque las dos cosas se vieron en la misma sesión: B3 cambió `bg-vp-primary` por `bg-brand` en ese botón y nada más — ni el `flex`, ni el `flex-1`, ni el `gap-3`, ni el rótulo. El problema es de ancho disponible, no de color.
- Emparenta con el arreglo de `document-checklist.tsx` de esa misma tanda: allí la fila del checklist se reorganizó a dos columnas bajo `sm` por el mismo motivo —un layout de escritorio estrangulando texto en un teléfono—. La diferencia es que aquel componente admitía el cambio sin tocar literales y éste, en su salida más limpia, no.

---

## CI-054 · `PATCH /api/tasaciones/[id]/datos` no tenía consumidor: la captura de terreno nunca llegaba a Airtable

| Campo | Valor |
|---|---|
| **Identificador** | CI-054 |
| **Archivo:línea** | `app/api/tasaciones/[id]/datos/route.ts:309` (`PATCH`) · **`components/tasador/tasacion-form.tsx:263`** (`await guardado.guardarAhora()` dentro de `handleCalcular`) · `lib/tasador/use-guardado.ts` |
| **Síntoma** | Ningún punto de la UI llamaba `PATCH /datos`. `handleCalcular` hacía `writePayload()` y `POST /calcular`, de modo que **las ocho secciones del formulario vivían sólo en `localStorage`** y jamás se escribían en `TX_DatosTasacion` ni en sus cuatro tablas hijas. Verificable: `grep -rn 'method: "PATCH"' components/ lib/` fuera de `app/api/` devolvía dos usos, ninguno contra `/datos`. `clearPayload()` y `ultimoGuardado()` tampoco tenían consumidores. |
| **Causa** | P2-TAS.A construyó la ruta completa —Zod, guard de pertenencia, auditoría en `A_Cambios`, sync destructivo por `clave_*`— y P7-TAS todavía no existía como tanda de UI. La ruta quedó correcta y huérfana. El hueco es invisible en uso: el borrador local hace que el formulario **se vea** persistido al recargar, así que sólo se nota cuando alguien busca el dato en Airtable. Es lo contrario de la spec §2.8, que fija que *"Calcular Tasación cumple la función de guardar y calcular"* — sólo calculaba. |
| **Resolución** | ✅ **CERRADA POR PARTES.** <br>**(a) P7-TAS.A.2 (23-ago-2026):** `lib/tasador/use-guardado.ts` es el consumidor. Expone `guardarAhora()`, que escribe el borrador, hace el `PATCH` con el `InformeData` entero y marca el sobre con `marcarSincronizado()`. El autoguardado de 30 s **sigue siendo local** por spec §2.8 y, sobre todo, porque el `PATCH` ejecuta sync destructivo (**RO-31**): en bucle borraría y recrearía las filas hijas cien veces por visita. <br>**(b) P7-TAS.A.3 (23-ago-2026) — hecho:** `handleCalcular` hace `await guardado.guardarAhora()` **antes** de `enviarParaCalculo()` (`components/tasador/tasacion-form.tsx:263`). Si el PATCH falla, `guardarAhora()` relanza, el `catch` muestra el literal humano y **no se navega**: `POST /calcular` no llega a correr, de modo que AT03 nunca calcula sobre datos que no se guardaron. <br>**(c) T-A.3-1 resuelto en negativo:** `clearPayload()` **no se automatiza**. No se llama tras un PATCH exitoso; su único disparador es el botón «Descartar» del banner de recuperación, con el tasador decidiendo. Los 23 huérfanos de **CI-023** —más los 14 booleanos de `Comodidades` y los 5 sub-campos de colección que `noPersistidos[]` ni siquiera puede ver— siguen vivos en el borrador local en vez de borrarse en silencio. |
| **Dueño** |  |
| **Fecha objetivo** |  |
| **Estado** | **cerrada (2026-08-23)** |
| **Origen** | P7-TAS.A.2 (23-ago-2026), al inventariar quién llamaba a `/datos` antes de escribir el hook de guardado. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **No es un duplicado de CI-023.** Aquélla registra que 23 identificadores llegan al `PATCH` y no tienen columna destino; ésta, que el `PATCH` no se llamaba nunca. Se tocan en un punto: `noPersistidos[]` sólo empieza a significar algo cuando alguien hace la petición, y hasta P7-TAS.A.2 nadie la hacía.
- **El hook no cerraba la ficha solo.** Mientras `tasacion-form.tsx` no lo montara, el comportamiento observable no cambiaba; por eso P7-TAS.A.2 la dejó *en curso*.
- **Cierre (23-ago-2026 · P7-TAS.A.3).** El formulario monta `useGuardado` y «Calcular Tasación» guarda antes de calcular. Lo que el tasador mide en terreno llega a `TX_DatosTasacion` y a sus cuatro tablas hijas. La ficha se cierra con el comportamiento verificable en una línea concreta, no con la existencia del hook.
- **Lo que el cierre NO incluye.** El autoguardado de 30 s sigue siendo **local**: el `PATCH` ejecuta sync destructivo (**RO-31**) y en bucle borraría y recrearía las filas hijas cien veces por visita. La escritura a Airtable ocurre en «Calcular Tasación», que es lo que la spec §2.8 fija.

---

## CI-055 · El badge «Pre-llenado · editable» es una prop estática: no se recalcula si el tasador sobrescribe un default

| Campo | Valor |
|---|---|
| **Identificador** | CI-055 |
| **Archivo:línea** | `components/tasador/form-sections/fields.tsx` (`TextField`, prop `prellenado`) · `components/tasador/tasacion-form.tsx` (único call site marcado: «Fecha planificada de visita») · `docs/schema-airtable.md` (`C_DefaultsAntecedentes` · `tblOj7nXcjeouPy09`) |
| **Síntoma** | La prop `prellenado` declara que el valor **nació** como default del sistema, no que **siga** siéndolo. Si el tasador sobrescribe un default y guarda, en la apertura siguiente ese valor llega hidratado desde Airtable —es suyo— y el campo **vuelve a mostrar el badge**. Es el mismo incumplimiento de Regla T-B que P7-TAS.A.3-bis corrigió, en su versión residual: el origen se declara **por posición** (qué campo es) y no **por dato** (de dónde salió *este* valor). |
| **Causa** | Marcar por dato exige un espejo de claves pre-llenadas que viaje dentro de `InformeData`, se serialice con el borrador de `localStorage` y se excluya del cuerpo del `PATCH`, del store y del diff de `lib/tasador/recuperacion-borrador.ts`. Se evaluó en P7-TAS.A.3-bis y se descartó por desproporción: era infraestructura para **un solo caso**. |
| **Impacto** | **Hoy, ninguno observable.** Existe **un único default real** en todo el formulario —la fecha planificada de visita, sección A, que pone la Ejecutiva en la coordinación (§2.3)— y la ventana de error es que el tasador la corrija, guarde y vuelva a entrar. `C_DefaultsAntecedentes` **no tiene ningún lector en el repo**: la precarga de la sección E no está construida. |
| **Resolución** | **Diferida a propósito a la tanda que construya la precarga de la sección E** (plan IF-03 §8.2 paso 7). Esa tanda marcará ~19 campos contra `C_DefaultsAntecedentes` y multiplicará por 19 la ventana; es el momento en que el espejo por dato deja de ser desproporcionado. **Siguiente paso concreto:** al conectar la precarga, elegir entre prop estática y espejo dentro de `InformeData`, y registrar la decisión en esta ficha. |
| **Dueño** |  |
| **Fecha objetivo** | condicional a la construcción de la precarga de la sección E (plan IF-03 §8.2 paso 7) |
| **Estado** | **abierta** · sin impacto observable mientras el formulario tenga un solo default real |
| **Origen** | P7-TAS.A.3-bis (23-ago-2026), al elegir prop declarativa sobre espejo por dato para corregir el badge. |

**Notas:**

- Dueño y Fecha objetivo en blanco por instrucción del usuario; ver la precisión de alcance al inicio del archivo.
- **La sección F queda fuera por schema, no por decisión.** Sus valores (`cbrFoja`, `nPermisoEdificacion`, …) los escribe la extracción de P6-TAS en `TX_DocumentosLegales` y llegan al formulario por el mismo canal que cualquier otro dato hidratado. El único discriminador posible sería `origen_dato`, y no existe donde hace falta: **`TX_DocumentosLegales` no tiene esa columna**, y la de `TX_DatosTasacion` (`fldACst7tUEy8yPOP`) es **de fila, no de campo**, con `PATCH /datos` estampándola en `tipeado` en cada escritura. Badgear F exige crear campo en Airtable, que requiere aprobación explícita (`CLAUDE.md`).
- **No es un duplicado de la corrección que la creó.** P7-TAS.A.3-bis cerró el caso en que el badge aparecía sobre **todos** los campos hidratados —hasta 67— por inferirlo de la presencia de valor al montar. Esta ficha registra lo que queda: un caso, condicionado a que el tasador edite el único default y vuelva a entrar.
- **Verificación de cobertura del cierre de A.3-bis** (RO-02): `grep -rn "prellenado" components/tasador/form-sections/*.tsx components/tasador/tasacion-form.tsx | grep -v "form-sections/fields.tsx"` devuelve **exactamente una** línea, la de «Fecha planificada de visita». Si algún día devuelve más sin que esta ficha se haya resuelto, la ventana creció y hay que volver acá.

---

## CI-056 · La sección D permitía agregar y eliminar comparables después de que A-13 la declarara de sólo lectura

| Campo | Valor |
|---|---|
| **Identificador** | CI-056 |
| **Archivo:línea** | `components/tasador/form-sections/seccion-comparables.tsx` (grilla completa) · `app/api/tasaciones/[id]/comparables/route.ts` (`POST` · `DELETE`) · `lib/tasador/factores-default.ts` (módulo entero) · `lib/tasador/lectura-datos.ts` (bloque D ausente) · `lib/tasador/validators/index.ts:110-130` |
| **Síntoma** | Detectado en test manual: la sección D mostraba el botón **«+ Agregar comparable»**, un borrado por fila con confirmación en dos pasos, y **catorce campos editables** por comparable —incluidas las tres columnas de factor de homogeneización—. El plan v1.3 §8.1 mandata lo contrario desde el cierre de **A-13** (23-ago-2026): el tasador **no captura** comparables, los fotografía. |
| **Causa** | La grilla se construyó en P2-TAS **mientras A-13 estaba abierta**, con la decisión explícita —registrada en el docblock de la ruta— de construirla editable y ajustar si A-13 cerraba a favor de sólo lectura. A-13 cerró el 23-ago-2026 y la tanda que debía aplicar el cierre es P7-TAS, ésta. La desviación no es un error de implementación: es trabajo pendiente que el test manual encontró antes que el checklist. |
| **Impacto** | **Alto si llegaba a producción, nulo mientras tanto.** Un tasador podía teclear comparables a mano y satisfacer RF-12 sin fotografiar el cuadro, que es exactamente la trazabilidad que A-13 vino a garantizar: el comparable dejaría de tener respaldo en la plantilla operativa. Los tres factores editables agravaban el caso — **A-44** dejó registrado que el cuadro no los trae, así que cualquier valor tecleado ahí era invención. |
| **Resolución** | ✅ **EJECUTADA (24-ago-2026), con las cinco decisiones aprobadas por Sergio.** <br>**(a) Grilla de sólo lectura:** sin «Agregar comparable», sin borrado por fila, sin ningún `input`. Las tres columnas de factor **salieron de la vista**; el discriminador Oferta/CBR pasó de toggle a badge. La grilla ya no recibe `set`. <br>**(b) Hidratación server-side (D-1 · opción A):** `lib/tasador/lectura-datos.ts` lee `TX_Comparables` como séptima tabla hija y proyecta el bloque D. **Sin esto la corrección habría sido peor que el defecto** — ver la nota al pie. <br>**(c) Ruta reducida al `GET` (D-2):** `POST` y `DELETE` retirados. La regla queda verificable en el borde HTTP, no sólo en el render: que un botón no se pinte no impide un `POST` con `curl`. Cero consumidores previos; el pipeline de P6-TAS escribe `TX_Comparables` desde Make, no por esta ruta. <br>**(d) Purga de `factores-default.ts` (cierra CI-031 y OV-6):** sucedido por `lib/tasador/comparables.ts`, que expone `ufM2()` y `promedioUfM2()` con test co-ubicado. El promedio de la fila de cierre pasó de **homogeneizado** a **simple**. <br>**(e) Tipos normalizados (D-5):** el mapeo Airtable → `Comparable` quedó en un solo lugar y devuelve `string` en todos los campos. Los tres factores **siguen en el tipo** y se proyectan; no se pintan. <br>**(f) Literales de RF-12 reescritos** sobre la acción que el tasador sí tiene. |
| **Dueño** |  |
| **Fecha objetivo** | — (cerrada) |
| **Estado** | **cerrada** · 24-ago-2026 |
| **Origen** | Test manual de P7-TAS, 24-ago-2026. |

**Notas:**

- **El hallazgo que el encargo no pedía, y que era el verdadero riesgo.** El reconocimiento
  descubrió que `proyectarDatosCaptura` leía **seis** tablas hijas y `TX_Comparables` no era
  ninguna de ellas: el formulario abría con `comparables: []` y nadie lo notaba **porque el
  tasador podía teclearlos**. La grilla editable estaba tapando una hidratación que no existía.
  Quitar la edición sin cablear la lectura habría dejado la sección D vacía para siempre y RF-12
  bloqueado sin salida — una pantalla peor que la que se venía a corregir. Va con candado en
  `lib/tasador/lectura-datos.test.ts`.
- **La lección.** Una capacidad de escritura puede estar compensando la ausencia de una de
  lectura sin que nada lo señale. Antes de retirar una escritura, verificar que el dato llega por
  otra vía **es parte de retirarla**, no una comprobación aparte.
- **Candado contra la reposición.** `app/api/tasaciones/[id]/comparables/route.test.ts` afirma
  que el módulo **no exporta** `POST` ni `DELETE`. Si alguien los repone, el test falla y obliga a
  leer **A-18** (protocolo de resurrección) y **A-45** (qué hace el re-fotografiado con las filas
  previas) antes de seguir.
- **El umbral de RF-12 se movió como consecuencia**, y tiene ficha propia: **CI-058**. El faltante
  de la sección D pasó de contar filas completas a contar filas leídas.
- **Deuda abierta que este cierre deja:** **CI-057** (los dos promedios divergen) y **A-45** (el
  re-fotografiado, ¿acumula o reemplaza?). Ninguna bloquea.

---

## CI-057 · Dos promedios de comparables para la misma solicitud: la grilla no homogeneiza y `/informe` sí

| Campo | Valor |
|---|---|
| **Identificador** | CI-057 |
| **Archivo:línea** | `lib/tasador/comparables.ts` (`promedioUfM2`) · `app/api/tasaciones/[id]/informe/route.ts:172-206` (bloque 6) |
| **Síntoma** | La fila de cierre de la sección D muestra un promedio **simple** de `UF/m²`. El bloque 6 del `GET /informe` calcula un promedio **homogeneizado**: multiplica cada unitario por `factor_sup × factor_edad × factor_distancia` leídos de Airtable, tratando el factor ausente como `1`. Para una misma solicitud con factores almacenados, **los dos números difieren** y ninguna de las dos pantallas dice cuál es cuál. |
| **Causa** | Las dos aritméticas se escribieron en tandas distintas contra estados distintos de **A-18**. La de `/informe` es de P5-TAS, cuando los factores se daban por vigentes; la de la grilla es de esta tanda, después de que **A-18 cerrara por disolución** y **A-44** registrara que el cuadro fotografiado no los trae. La divergencia no existía mientras la grilla homogeneizaba también. |
| **Impacto** | **Bajo hoy, condicionado.** El cuadro `[Excel: Portada!B28:AX44]` no trae factores, así que las filas que la extracción escribe llegan con las tres columnas vacías y `/informe` las trata como `1` — con lo cual **los dos promedios coinciden**. Divergen sólo sobre filas con factores cargados: registros históricos, o los que se hayan tecleado mientras la sección D fue editable. La ventana existe y es invisible. |
| **Resolución** | **Pendiente · decisión de producto, no de código.** Las dos aritméticas son defendibles y la evidencia apunta a la simple: **A-28** verificó que la plantilla operativa vigente calcula el unitario **sin coeficientes** `[Excel: Portada!AX29]`, y **A-44** que el cuadro no los contiene. Alinear `/informe` con la grilla es un cambio de ~15 líneas; lo que no es trivial es qué hacer con los factores **ya almacenados** en filas históricas, que hoy alteran un número que alguien firmó. **Siguiente paso concreto:** resolver junto a **A-44** —son la misma pregunta vista desde dos lados— y, si la respuesta es «no se homogeneiza», decidir si las filas históricas se recalculan o se congelan. |
| **Dueño** |  |
| **Fecha objetivo** | condicional a **A-44** |
| **Estado** | **abierta** · no bloqueante |
| **Origen** | CI-056 (24-ago-2026), al reemplazar `ufHomogeneizada()` por `promedioUfM2()` en la grilla. Registrada por decisión explícita de no tocar `/informe` en esa tanda (**D-3**). |

**Notas:**

- **Por qué no se resolvió en el mismo movimiento.** Tocar `/informe` habría expandido una tanda
  de UI a una de contrato del informe, y con la pregunta de fondo —**A-44**— todavía sin respuesta
  de Héctor. Cambiar la aritmética del documento que el visador firma, sobre una duda abierta, es
  peor que dejar la divergencia registrada.
- **La divergencia es observable desde `components/tasador/informe-preview.tsx`**, que renderiza
  la misma grilla que la captura: la vista previa muestra el promedio simple mientras el `GET
  /informe` devuelve el homogeneizado para la misma solicitud.

---

## CI-058 · RF-12 cambió de umbral al cambiar de sujeto: cuenta filas leídas, no filas completas

| Campo | Valor |
|---|---|
| **Identificador** | CI-058 |
| **Archivo:línea** | `components/tasador/tasacion-form.tsx` (cálculo de `faltantes`, bloque de la sección D) |
| **Síntoma** | El umbral de RF-12 se movió sin que ningún requisito lo pidiera explícitamente. **Antes:** «comparables válidos» = filas con `direccionReferencia` **y** `anio` **y** `totalUf` **y** `supConstruida` no vacíos. **Ahora:** filas leídas del cuadro, sin mirar su contenido. Una solicitud con tres comparables a medias **hoy pasa RF-12 y antes no**. |
| **Causa** | El filtro por cuatro campos se escribió en P2-TAS cuando la sección D era **editable**: un comparable a medias era un comparable que el tasador había empezado y no terminado, y exigirle completarlo era la validación correcta. **A-13 cambió el sujeto de RF-12** —valida el origen, no la captura— y con ello el filtro dejó de describir lo que mide: una fila incompleta ya no es trabajo a medio hacer del tasador, es una columna que la foto cortó. |
| **Impacto** | **Bajo, y en la dirección deliberada.** El umbral se relajó: donde antes hacían falta 3 filas completas, ahora bastan 3 filas. El riesgo teórico es habilitar «Calcular Tasación» sobre comparables sin precio o sin superficie — pero esos quedan **fuera del promedio** de todos modos (`promedioUfM2` los filtra), así que el cálculo no los usa; sólo se listan. El riesgo real que el cambio **evita** es mayor: con el filtro estricto, un tasador cuya foto cortó una columna quedaba bloqueado sin ninguna acción disponible, porque la sección es de sólo lectura y no puede completar el campo. |
| **Resolución** | ✅ **EJECUTADA (24-ago-2026) dentro de CI-056, aprobada por Sergio.** El faltante de la sección D cuenta `form.comparables.length`. La corrección del tasador ante un cuadro mal leído es **volver a fotografiar**, y esa acción es idéntica con un campo vacío o con tres — de modo que distinguir entre «fila incompleta» y «fila ausente» no cambiaba nada de lo que el tasador podía hacer, sólo cuándo se lo decíamos. Los literales de bloqueo se reescribieron sobre esa acción. |
| **Dueño** |  |
| **Fecha objetivo** | — (cerrada) |
| **Estado** | **cerrada** · 24-ago-2026 |
| **Origen** | CI-056 (24-ago-2026), al reescribir el faltante de la sección D. Registrada por decisión explícita: el cambio de umbral es una consecuencia de A-13 que ningún documento enunciaba, y sin ficha quedaría como una relajación silenciosa de un requisito. |

**Notas:**

- **Por qué merece ficha propia y no una línea en CI-056.** RF-12 es un requisito numerado y su
  umbral efectivo cambió. Que el cambio sea correcto no lo vuelve invisible: quien audite RF-12
  dentro de seis meses va a comparar el código contra la spec —que dice «mínimo 3 comparables», sin
  calificar— y necesita encontrar acá por qué el conteo es el que es.
- **Lo que NO cambió.** El mínimo sigue siendo **3** y sigue bloqueando «Calcular Tasación». Lo
  único que se movió es qué cuenta como uno.
- **Dónde se ve el efecto de borde.** Una fila sin `totalUf` o sin `supConstruida` cuenta para
  RF-12 pero **no entra al promedio** de la fila de cierre (`lib/tasador/comparables.ts`), y la
  grilla la muestra con «—» en su UF/m². Es deliberado: ocultarla escondería la evidencia de que
  la foto salió incompleta, que es justo lo que el tasador necesita ver para decidir si
  re-fotografía.

---

## CI-059 · Desalineación tooltip / scroll en «Calcular Tasación»: uno explica un bloqueo y el otro lleva a otro

| Campo | Valor |
|---|---|
| **Identificador** | CI-059 |
| **Archivo:línea** | `components/tasador/tasacion-form.tsx` — barra ámbar del pie (`faltantes.find((f) => f.detalle)`) · `BotonCalcular` → `TooltipContent` (mismo selector) · `scrollAFaltante()` (`faltantes[0]`) |
| **Síntoma** | El tooltip del botón deshabilitado y la barra ámbar del pie eligen **el primer faltante que trae `detalle`** —hoy sólo el de la sección D—, mientras `scrollAFaltante()` sigue saltando a **`faltantes[0]`**, el primero en orden de aparición. Cuando el único faltante con `detalle` es «Comparables del cuadro» y hay faltantes previos —el caso normal: «Fecha real de visita» encabeza la lista—, el tooltip dice *«Del cuadro se leyeron 0 de 3 comparables. Vuelve a fotografiar el cuadro completo desde Editar fotos.»*, el tasador pulsa, y **aterriza en la sección A**. |
| **Causa** | El selector del tooltip cambió el 24-ago-2026, después de CI-056, para cumplir el criterio de §8.3 —*«con menos de 3 comparables el botón está deshabilitado con tooltip explicativo»*—, que no condiciona el tooltip a que ése sea el faltante más urgente. Con `faltantes[0]` el literal **no aparecía nunca**: la sección D es la cuarta de la lista y siempre hay algo antes. `scrollAFaltante()` no se tocó: su regla de orden es la de **§8.1** (*«el foco aterriza en el primero en orden de aparición con su sección desplegada»*). Las dos reglas son correctas por separado y ninguna contempló a la otra. |
| **Impacto** | **Bajo, y no es un defecto de corrección.** Son **dos trabajos distintos**: el tooltip explica *por qué* el botón está bloqueado, con el contexto que le sirve al tasador; el scroll obedece la regla de orden que el plan fija para el foco. La incoherencia es de expectativa, no de estado. **Y hay un matiz que la vuelve menos grave de lo que parece:** la acción correctiva que el tooltip nombra —«Editar fotos»— es un control del **header**, fuera del formulario, así que ni siquiera existe un destino de scroll dentro del form al que el botón pudiera llevar. Alinearlos no sería mover el scroll a la sección D: sería sacar al tasador del formulario. |
| **Resolución** | ✅ **DECISIÓN DE HÉCTOR (28-ago-2026, revisión UI Tasador) — opción (b): alinear.** `scrollAFaltante()` debe seguir al **faltante que el tooltip prioriza** (el `find` con `.detalle`), en lugar de saltar a `faltantes[0]`. Con ello el tooltip y el foco responden la misma pregunta. **Implementación pendiente en tanda futura.** |
| **Dueño** | Héctor (decisión) · Claude Code (ejecución tras OK) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟢 **decisión tomada** · implementación pendiente en tanda futura |
| **Origen** | Fix del tooltip de RF-12, 24-ago-2026, posterior a CI-056. Detectada al aplicar el cambio, no en revisión. |

**Notas:**

- **No es una regresión del fix.** Antes del cambio el literal explicativo no se mostraba nunca, así
  que no había nada que desalinear: el tooltip decía «Faltan N datos» y el scroll iba al primero,
  coherentes por vacío. El fix cumplió §8.3 y al hacerlo dejó a la vista una tensión entre §8.1 y
  §8.3 que ya existía en los dos textos.
- **Por qué se registra en vez de arreglarse.** Cualquiera de las tres salidas cambia lo que el
  tasador experimenta al pulsar un botón bloqueado en terreno, y dos de ellas contradicen un
  literal del plan. Es exactamente el tipo de decisión que **A-13 enseñó a no tomar del lado del
  código** — la sección D fue editable un mes por adelantarse a una respuesta que llegó distinta.
- **Alcance real hoy.** Un solo faltante lleva `detalle` en todo el formulario, el de la sección D.
  Si una tanda futura agrega `detalle` a otros, la ficha crece: el tooltip pasaría a elegir entre
  varios explicativos y `find` devolvería el primero por orden de sección, que puede no ser el más
  útil. Vale releer esto antes de agregar el segundo `detalle`.

---

## CI-060 · El mínimo de 3 fotos de «Ofertas / Comparables» ya no mide lo que dice medir

| Campo | Valor |
|---|---|
| **Identificador** | CI-060 |
| **Archivo:línea** | `lib/tasador/tasaciones.ts` — `CATEGORIAS_FOTO`, entrada `ofertas_comparables` (`min: 3`) · evaluado por `lib/tasador/minimos-fotos.ts` → `resolverMinimo()` |
| **Síntoma** | La categoría exige **3 fotos** para darse por completa, pero desde A-13 la unidad de medida real de la sección D son **filas leídas del cuadro**, no fotos. Las dos magnitudes se desacoplaron: la única foto real del tasador contiene *todas* las ofertas, de modo que **3 filas pueden venir de 1 foto** y **3 fotos pueden rendir 0 filas legibles**. El organizador puede quedar en verde sin ningún comparable utilizable, y en ámbar con el cuadro entero ya leído. |
| **Causa** | El `min: 3` se escribió en P5-TAS espejando el umbral de RF-12 —«mínimo 3 comparables»— cuando la sección D todavía era **editable** y el tasador tecleaba un comparable por foto. **A-13 cambió el sujeto de RF-12** (ver CI-058): la sección pasó a sólo lectura y su origen pasó a ser el cuadro fotografiado. El umbral de la *sección* se actualizó; el umbral de la *categoría de fotos* no, porque vive en otro módulo y nadie lo señaló. Plan v1.3 §6.1 sigue exigiendo 3 y es literal normativo. |
| **Impacto** | **Bajo y acotado a la señalización.** El mínimo no bloquea «Calcular Tasación» —eso lo decide RF-12 sobre `form.comparables.length` (CI-058)— sólo pinta el contador de la categoría. El daño es de confianza: un tasador que ve la categoría completa asume que el cuadro quedó cubierto, y puede no estarlo. En sentido inverso, quien fotografía el cuadro entero de una vez queda con la categoría en ámbar aunque haya hecho el trabajo correcto, y la única forma de apagarla es **duplicar la misma foto tres veces**, que es peor que el estado que corrige. |
| **Resolución** | ✅ **DECISIÓN DE HÉCTOR (28-ago-2026, revisión UI Tasador) — opción (b): bajar a 1.** El cuadro llega en **una sola foto con las 3 filas**, de modo que el mínimo de la categoría de fotos baja a **1**. La validación real de suficiencia no vive en el conteo de fotos sino en las **3 filas leídas del cuadro** (RF-12). **Implementación pendiente en tanda futura.** |
| **Dueño** | Héctor (decisión) · Claude Code (ejecución tras OK) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟢 **decisión tomada** · implementación pendiente en tanda futura |
| **Origen** | P7-TAS.A.4 (26-ago-2026), decisión **D-2 · opción A**: al hidratar las fotos server-side se revisó `CATEGORIAS_FOTO` y se constató que el `min` de esta categoría quedó huérfano de A-13. |

**Notas:**

- **No se tocó `CATEGORIAS_FOTO.ofertas_comparables.min`.** Es literal normativo de plan v1.3 §6.1
  y cambiarlo desde el código repetiría exactamente el error que A-13 enseñó a no cometer: la
  sección D fue editable un mes por adelantarse a una respuesta que llegó distinta.
- **Es la misma familia que CI-058, no la misma ficha.** CI-058 documenta el umbral de **RF-12**
  —cuántos comparables habilitan el cálculo— y está cerrada. Ésta documenta el umbral de la
  **categoría de fotos** que alimenta ese cuadro. Cerrar una no cierra la otra: viven en módulos
  distintos y las decidió gente distinta en momentos distintos.
- **Dónde mirar si se opta por (c).** `resolverMinimo()` recibe hoy `DeclaradosSeccionB`, que sólo
  conoce `dorm · banos · estac`. La opción (c) exige ampliar esa forma con el conteo de
  comparables, y con ello el módulo pasa a depender de la sección D. Es el único punto de cambio,
  por diseño de A-16.

---

## CI-061 · La categorización de fotos del tasador PATCHea el autoNumber `adjunto_id` donde la ruta exige un record ID: 404 siempre

| Campo | Valor |
|---|---|
| **Identificador** | CI-061 |
| **Archivo:línea** | `lib/tasador/fotos.ts:169` — `const adjuntoId = String(subida.adjunto_id)` · `app/api/tasaciones/[id]/fotos/route.ts` — `PATCH`, guard `isValidRecordId(d.adjuntoId)` · `app/api/adjuntos/upload/route.ts:88,308` — `adjunto_id?: string \| number` propagado tal cual |
| **Síntoma** | El registro `TX_Adjuntos` **`recY2P0Ju0n5FAN62`** (solicitud **VP-2026-0061**, archivo `Foto REF Ofertas y REF CBR.JPG`, 2026-08-24) quedó con **`descripcion`, `tipo_adjunto` y `orden` vacíos**. El binario **sí llegó a Dropbox** y la fila **sí** tiene `url_dropbox`, `hash_md5`, `subido_por = Tasador` y el Link `solicitud` poblado. Lo único que falta es la categoría. La foto aparece en el organizador bajo `otro` gracias al fallback de la proyección. |
| **Causa** | **CONFIRMADA (26-ago-2026).** `TX_Adjuntos` tiene **dos** identificadores y el contrato de subida devuelve el que no sirve. `SC-Adjuntos-Upload v1.2` responde `adjunto_id` = **autoNumber `fldVt7Lk1ptvmgbtT`** (valor `40` en esta fila), no el record ID `rec…`. `POST /api/adjuntos/upload` lo acepta —su tipo es `string \| number`— y lo propaga en el 200. `subirFotoDeVisita()` hace `String(subida.adjunto_id)` → `"40"` y se lo pasa a `categorizarFoto()`. El `PATCH` corta en su primera guarda —`isValidRecordId("40")` → `false`— y devuelve **404 `adjuntoNoDisponible`** sin tocar Airtable. **El PATCH nunca llegó a ejecutarse.** |
| **Impacto** | **Alto y sistémico, con muestra de 1.** El fallo es **determinista**: no depende de red, carga ni timing, así que **ninguna foto del tasador puede categorizarse jamás** por este camino. Hoy hay exactamente **una** fila con `subido_por = Tasador` en toda la base —la de esta ficha—, de modo que la tasa de fallo observada es 1/1. Agrava el cuadro que `subirFotoDeVisita()` devuelve `reintentable: true` ante este 404: la cola offline reintenta indefinidamente una operación que **no puede tener éxito**, porque la subida se deduplica por `hash_md5` y Make vuelve a responder el mismo `40`. Los archivos **no se pierden** —están en Dropbox y su fila existe—; lo que se pierde es toda la clasificación, y con ella los mínimos por categoría de RF-TAS-14. |
| **Resolución** | **Opción D** (Sergio · 30-ago-2026, autorización Óscar R5). Combina el fix raíz en el blueprint con un puente transitorio en IF-03 mientras v1.4 no esté verificada en producción. <br>**· PASO 0** — 404 de categorización marcado **no reintentable** en `lib/tasador/fotos.ts` (L133-134, L138). Comentario `// CI-061` explícito. <br>**· PASO 1** — **puente** autoNumber → record ID en `app/api/tasaciones/[id]/fotos/route.ts` (`resolverAdjuntoRecordId` L168-177, `filterByFormula` L172, uso en `PATCH` L196-199). Marcado como **transitorio** (`// [PUENTE CI-061 · REMOVER TRAS VERIFICAR v1.4 EN PROD]` L150-152 y L193-195). Tests: `describe [PUENTE CI-061]` en `route.test.ts` L170, cobertura de 404 con autoNumber inexistente + resolución exitosa + id no válido. <br>**· PASO 2** — blueprint `SC-Adjuntos-Upload v1.4` con `adjunto_record_id` **aditivo** en los 3 caminos de `WebhookRespond`. Commit pusheado el 30-ago-2026. **Pendiente import manual en Make** (Sergio). <br>**· PASO 3** (limpieza, futuro) — retirar el puente + migrar IF-02 a `adjunto_record_id` → ver **CI-061a**, **CI-061b**, **CI-061c**. <br>*(La reclasificación del 404 como no reintentable —contemplada en el análisis original— quedó cubierta por el PASO 0.)* |
| **Dueño** | Sergio |
| **Fecha objetivo** | — |
| **Estado** | 🟡 **en curso** · fix raíz aplicado en blueprint (v1.4 · commit pusheado) · puente aplicado en IF-03 · **pendiente import manual en Make** |
| **Origen** | P7-TAS.A.4 (26-ago-2026), hallazgo **H-3** del diagnóstico previo: se detectó al inventariar `TX_Adjuntos` para escribir la proyección server-side de fotos. Causa cerrada el mismo día con `LogEscenarios`. |

**Notas:**

- **Las dos hipótesis iniciales quedaron refutadas, y conviene dejar dicho por qué.** La (b)
  —guard de pertenencia— cae porque el Link `solicitud` de `recY2P0Ju0n5FAN62` está poblado y
  apunta a `rec9qf3DchOY5Lk2N`: el guard habría pasado. La (a) —Make 200 sin `adjunto_id`— cae por
  el log de Make: sí devolvió uno. **El fallo no está en que faltara el dato, sino en que el dato
  era el identificador equivocado**, que es un modo de fallo que ninguna de las dos contemplaba.
- **La evidencia es `LogEscenarios` (`tblR4VWpUHw1CSyIS`), no `A_ErroresMake`.** Dos filas del
  2026-08-24 lo cierran: `recU6QA4C86Fd2ajC` (19:14:00, escrita por Make · `SC-Adjuntos-Upload
  v1.2`) dice *«Alta limpia… TX_Adjuntos: recY2P0Ju0n5FAN62 (adjunto_id 40)»*, y
  `recvEIckX61uqLZNA` (19:14:03, escrita por `postToMake`) marca la subida **`✓ OK`** en 10.639 ms.
  No hay tercera fila porque el `PATCH` escribe directo a Airtable y no pasa por `postToMake` — su
  ausencia no es evidencia de nada.
- **⚠ `A_ErroresMake` (`tbl46Q0BcfD57LWyQ`) está muerto: no lo escribe ningún código del repo.**
  `grep -rn "tbl46Q0BcfD57LWyQ\|A_ErroresMake" app/ lib/` no devuelve nada, y la tabla tiene **una
  sola fila**, del 2026-06-01, ajena a IF-03. **Buscar ahí y no encontrar nada no prueba nada**, y
  el checklist de diagnóstico de esta ficha decía originalmente lo contrario. Vale corregir esa
  expectativa en cualquier runbook que la haya heredado.
- **El repo ya documentaba el contrato correcto, en IF-02 y por escrito.**
  `app/api/adjuntos/[id]/route.ts:64` («*Identificador: record ID, no `adjunto_id`*») y
  `components/console/document-checklist.tsx:101` («*El `adjunto_id` que devuelve la subida es el
  autoNumber (`fldVt7Lk1ptvmgbtT`)*») lo dicen explícitamente, porque el borrado tropezó con lo
  mismo antes. La cadena de IF-03 se escribió en P5-TAS (B3, cierre de CI-052) **sin leer esa
  nota**. La lección no es sobre Make: es que un contrato ya documentado en otro módulo del mismo
  repo no se vuelve a derivar de cero.
- **Por qué los tests no lo atraparon.** `app/api/tasaciones/[id]/fotos/route.test.ts` usa
  `ADJUNTO = 'recFOTO1234567890'.slice(0, 17)` — un id con forma de record ID. El caso numérico
  nunca se ejerció. Un test con `adjuntoId: "40"` que espere 404 documentaría el defecto; el fix
  correcto es que ese valor no llegue nunca hasta ahí.
- **Por qué el candado de lectura de .A.4 va igual aunque el fix sea ajeno.** La proyección nueva
  es el único punto por el que estas filas llegan a la pantalla. Que una foto sin `descripcion`
  desaparezca de la lista convertiría este fallo de categorización en un fallo de **pérdida
  aparente de evidencia**, mucho peor de diagnosticar en terreno. El fallback
  `descripcion || tipo_adjunto || 'otro'` ya existía en el `GET`; lo que no existía era un test que
  lo fijara, y ahora está en `lib/tasador/lectura-fotos.test.ts`.

---

## CI-061a · Contrato versionado del endpoint `/api/adjuntos/upload`

| Campo | Valor |
|---|---|
| **Identificador** | CI-061a |
| **Archivo:línea** | `app/api/adjuntos/upload/route.ts:88` (tipo de la respuesta) · `route.ts:308` (propagación) · `docs/schema-airtable.md` · header/JSDoc del route |
| **Detalle** | Introducir `adjunto_record_id` como **clave canónica** en la respuesta del endpoint compartido de subida (`route.ts:88` tipo, `route.ts:308` propagación) y en la documentación (`schema-airtable.md`, header del route). `adjunto_id` (autoNumber) queda en **deprecación durante una versión** por backwards-compat: se sigue devolviendo, pero deja de ser el identificador que los consumidores nuevos usan para mutar. |
| **Territorio** | `/api/adjuntos/upload` (**R5 · Óscar**) — autorización ya obtenida en CI-061. |
| **Dueño** | Sergio |
| **Fecha objetivo** | — |
| **Estado** | 🟠 **abierta** · post-import v1.4 en Make |
| **Origen** | CI-061 análisis experto (30-ago-2026). |

---

## CI-061b · Mismatch latente en IF-02 (checklist de documentos)

| Campo | Valor |
|---|---|
| **Identificador** | CI-061b |
| **Archivo:línea** | `components/console/document-checklist.tsx:249` (escritura) · `document-checklist.tsx:58` (campo tipado como record ID) |
| **Detalle** | `document-checklist.tsx:249` escribe el **autoNumber** en un campo tipado como **record ID** (`:58`). Es el **mismo defecto de clase** que CI-061. Hoy es **inocuo** porque el borrado usa el record ID de la **relectura**, no el de la subida; se **activa** en cuanto algún consumidor futuro mute con ese valor. Fix: migrar a `adjunto_record_id` tras verificar v1.4 en runtime. |
| **Territorio** | IF-02 (**R5 · Óscar**) — autorización ya obtenida en CI-061. |
| **Dueño** | Sergio |
| **Fecha objetivo** | — |
| **Estado** | 🟠 **abierta** |
| **Origen** | CI-061 análisis experto (30-ago-2026). |

---

## CI-061c · Retiro del puente (c) en IF-03

| Campo | Valor |
|---|---|
| **Identificador** | CI-061c |
| **Archivo:línea** | `app/api/tasaciones/[id]/fotos/route.ts` — JSDoc L150-152 + inline L193-195 + función `resolverAdjuntoRecordId` L168-177 · `app/api/tasaciones/[id]/fotos/route.test.ts` — `describe [PUENTE CI-061]` L170 |
| **Detalle** | Remover el bloque marcado `// [PUENTE CI-061 · REMOVER TRAS VERIFICAR v1.4 EN PROD]` en `app/api/tasaciones/[id]/fotos/route.ts` (JSDoc L150-152 + inline L193-195 + función `resolverAdjuntoRecordId` L168-177). Sustituir por **lectura directa** de `adjunto_record_id` del payload. Ajustar tests (`route.test.ts`, `describe [PUENTE CI-061]` L170). |
| **Precondición** | **v1.4 verificada en `LogEscenarios` de producción**: la respuesta del webhook `SC-Adjuntos-Upload` contiene `adjunto_record_id` con un `rec…`. |
| **Territorio** | IF-03. |
| **Dueño** | Sergio |
| **Fecha objetivo** | — |
| **Estado** | 🟠 **abierta** · bloqueada por verificación v1.4 en Make |
| **Origen** | CI-061 PASO 1 (30-ago-2026). |

---

## CI-062 · `informe-preview.tsx` repite el patrón `readPayload ?? resolverInforme` que .A.1 y .A.4 ya retiraron

| Campo | Valor |
|---|---|
| **Identificador** | CI-062 |
| **Archivo:línea** | `components/tasador/informe-preview.tsx:143` |
| **Síntoma** | El componente inicializa su estado con `readPayload(id) ?? resolverInforme(tasacion)`: el borrador de `localStorage` **shadowea** cualquier hidratación, y sin borrador se cae a los defaults. Es la **tercera pantalla** con la misma forma. `tasacion-form.tsx` la perdió en P7-TAS.A.1 (hidratación server-side + `combinarConBorrador`), `fotos-screen.tsx` la pierde en P7-TAS.A.4. Consecuencia concreta: la vista previa del informe puede pintar el formulario en blanco que sembró otra pantalla en vez de lo que Airtable tiene guardado. |
| **Causa** | El patrón es el original del v0, donde `localStorage` era la **única** fuente y no había nada que hidratar. Cada tanda que introdujo una proyección server-side lo retiró de *su* pantalla; ninguna barrió el árbol, porque el retiro exige tener la proyección correspondiente escrita primero. P9-TAS es la tanda que trae la de esta pantalla. |
| **Impacto** | **Medio.** Es una vista de **sólo lectura** —no guarda, así que no puede destruir datos— pero es la pantalla donde el tasador **verifica** lo que va a quedar en el informe. Mostrar ahí un estado que no es el del servidor es exactamente el error que la pantalla existe para evitar. |
| **Resolución** | ✅ **CERRADA en P7-TAS.A.5 (26-ago-2026).** `informe/page.tsx` hidrata server-side con `Promise.all([leerTasacion, leerDatosCaptura, leerFotosCaptura])` y arma `informeInicial`; `informe-preview.tsx:143` pasó de `readPayload(id) ?? resolverInforme(tasacion)` a `combinarConBorrador(informeInicial, readPayload(id))` —el mismo reparto de `tasacion-form` y `fotos-screen`—. `ExpedienteSheet` recibe el mismo `d` ya hidratado (D-2: no se tocó su código). **Lo que queda no es esto:** que el preview lea el modelo *cliente* y no el *canónico* del motor es **CI-063**, deuda de P9-TAS. |
| **Dueño** |  |
| **Fecha objetivo** | P7-TAS.A.5 |
| **Estado** | ✅ **cerrada** (P7-TAS.A.5) · no bloqueante |
| **Origen** | P7-TAS.A.4 (26-ago-2026), decisión **D-5**: al retirar el patrón de `fotos-screen` se buscó el resto de ocurrencias en el árbol y quedó ésta. |

**Notas:**

- **No se arregló de paso.** Retirar el patrón sin la proyección detrás deja la pantalla peor que
  antes: pasaría de mostrar un borrador desactualizado a mostrar los defaults de
  `resolverInforme`, que no son de nadie.
- **`ExpedienteSheet` va en el mismo lote y por eso no tiene ficha propia.** `expediente-sheet.tsx`
  no se tocó en .A.4 (decisión **D-4**) precisamente para no partir el cambio en dos tandas.
- **Cómo verificar que quedó cerrada.** `grep -rn "readPayload(.*) ?? resolverInforme" components/`
  debe salir vacío al terminar .A.5.

## CI-063 · `informe-preview` consume el modelo cliente, no el `bloques[]` canónico de `GET /api/tasaciones/[id]/informe`

| Campo | Valor |
|---|---|
| **Identificador** | CI-063 |
| **Archivo:línea** | `app/api/tasaciones/[id]/informe/route.ts` (productor, sin consumidor) · `components/tasador/informe-preview.tsx` |
| **Síntoma** | La ruta `GET /api/tasaciones/[id]/informe` expone el **modelo canónico** del informe —los `bloques[]` de §10.1: override, **cap rate**, valor homogeneizado, conteo real de fotos por categoría—, pero `informe-preview.tsx` **no la consume**. Tras P7-TAS.A.5 el preview sigue armando su vista con el modelo cliente (`resolverInforme` + `leerDatosCaptura` + `leerFotosCaptura` + `combinarConBorrador`). Las dos fuentes pueden **divergir**: lo que el tasador ve en el preview no es necesariamente lo que el PDF final de Carbone imprime. |
| **Causa** | Decisión **D-1 · opción A** de P7-TAS.A.5: espejar exactamente el patrón de hidratación de `.A.4` (`page.tsx` con `Promise.all` de las tres lecturas) y **no** cablear el `/informe` route, que queda huérfano. Cablearlo es trabajo de construcción de **P9-TAS**, no de esta tanda de hidratación. El caso más visible de la divergencia es el **cap rate**: el modelo cliente no puede computarlo porque su denominador `valorReferenciaClp` no tiene columna destino (**CI-023 §1**) y queda «—»; el modelo canónico **sí** lo trae en `bloques[]`. |
| **Impacto** | **Medio.** El preview es de sólo lectura y no destruye datos, pero es la pantalla donde el tasador **verifica** lo que enviará al visador. Una divergencia entre el preview y el PDF impreso es exactamente el error que la pantalla existe para evitar. Acotado mientras el preview y el PDF se alimenten de la misma captura de Airtable; se agrava si el motor (`bloques[]`) aplica una regla que el modelo cliente no replica. |
| **Resolución** | ✅ **CERRADA en P9-TAS (28-ago-2026), alcance MÍNIMO aprobado por Sergio.** El productor de los 8 bloques se **extrajo** de `app/api/tasaciones/[id]/informe/route.ts` a **`lib/tasador/lectura-informe.ts`** (`construirInforme` puro + `lecturaInforme` con guard); el route ahora delega y conserva su contrato de respuesta **idéntico** (5 claves). `app/tasaciones/[id]/informe/page.tsx` añade `lecturaInforme(id)` a su `Promise.all` y pasa el bloque 2 canónico (`valorDestacado`: `valorUf` + `capRate`) como prop `valorCanonico` a `InformePreview`. El preview **retiró** el cómputo cliente `netoAnual / valorReferenciaClp` y lee el cap rate **almacenado** (`tasa_cap_rate_override ?? tasa_cap_rate`), que no depende de `valorReferenciaClp` (CI-023 §1). Candado nuevo en `lib/tasador/lectura-informe.test.ts`. <br>**Acotación deliberada (alcance mínimo):** sólo el **bloque 2** se cabla al canónico. Los bloques **4** (avalúo SII) y **8** (antecedentes legales) siguen desde el modelo cliente y su migración queda como frente **P9-TAS.B** (construcción visual §10.3). El **bloque 6** (comparables) mantiene su grilla de promedio **simple** a propósito: alinearlo al homogeneizado del canónico es **CI-057**, abierta y condicionada a **A-44** (Héctor). <br>**Nota de cambio observable:** `valorUf` del bloque 2 pasó de caer a `tasacion.valorEstimadoUf` a leer `valor_comercial_uf` del canónico; en filas sin ese campo el valor destacado muestra «—» (estado ausente honesto de §10.1 · decisión 1), en vez del estimado. |
| **Dueño** | Claude Code (**hecho**) · P9-TAS.B (bloques 4/8) |
| **Fecha objetivo** | (cerrada 28-ago-2026) |
| **Estado** | ✅ **cerrada** (P9-TAS) · no bloqueante |
| **Origen** | P7-TAS.A.5 (26-ago-2026), decisión **D-1 · opción A**: al hidratar el preview server-side se dejó el `/informe` route sin cablear a propósito y se registró aquí la divergencia. |

**Notas:**

- **No es duplicado de CI-062.** CI-062 registra que el preview *shadoweaba* la hidratación con el
  borrador local (cerrada por .A.5). CI-063 registra que, ya hidratado, el preview lee el **modelo
  equivocado**: el cliente en vez del canónico del motor.
- **Depende de, pero no bloquea, CI-023.** El cap rate en «—» tiene dos salidas: darle columna a
  `valorReferenciaClp` (CI-023) o cablear `bloques[]` (esta ficha). P9-TAS toma la segunda.

## CI-064 · Filas huérfanas en TX_DatosTasacion (cap rate sin solicitud)

| Campo | Valor |
|---|---|
| **Identificador** | CI-064 |
| **Archivo:línea** | (dato, no código) `TX_DatosTasacion` (`tbl…`) · campo `tasa_cap_rate` poblado, link a solicitud vacío |
| **Síntoma** | 6 filas de `TX_DatosTasacion` tienen `tasa_cap_rate` poblado (rango observado 0.045–0.06) pero el campo de link a la solicitud **vacío**. Con los datos actuales, **ninguna** solicitud renderiza un cap rate real en el **bloque 2** del informe: `lecturaInforme` casa `TX_DatosTasacion` por `{solicitud}=codigo`, y sin ese link las filas son inalcanzables desde cualquier solicitud. |
| **Causa (hipótesis)** | Siembra parcial durante el setup de tandas previas (**P3-TAS** o **P5-TAS**): AT03 nunca corrió sobre estas filas, o el link a la solicitud se perdió tras crearlas. No confirmado. |
| **Impacto** | **Bloqueante para la validación end-to-end del motor AT03 sobre datos reales** (no hay ninguna fila enlazada con la que probar el camino cap-rate → bloque 2). **No bloqueante para P9-TAS**: el fix de CI-063 ya cerró como *ausencia honesta* (el preview muestra «—» cuando no hay cap rate almacenado, sin romper). |
| **Decisión pendiente** | ✅ **RESUELTA por Héctor (28-ago-2026, revisión UI Tasador) — opción (b): re-linkear.** Analizar las 6 filas una a una y re-conectarlas a solicitudes existentes. **Requiere análisis 1-a-1 antes de cualquier escritura en Airtable**; ninguna fila se toca sin ese análisis. |
| **Dueño** | Héctor (decisión) · Claude Code (ejecución tras OK) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟢 **cerrada · decisión documental (30-ago-2026)**. Supera la resolución (b) de Héctor: no se re-linkea. |
| **Origen** | Diagnóstico **P9-TAS** (28-ago-2026), durante la verificación de **CI-063**: al buscar una solicitud con cap rate real para la demo del bloque 2 se detectaron las 6 filas con `tasa_cap_rate` poblado y link a solicitud vacío. |

**Resolución (Sergio · 30-ago-2026):**

Tras el diagnóstico 1-a-1 de las 6 filas (lectura MCP · 30-ago-2026), **se decide dejarlas
como están: no borrar, no re-linkear.** Quedan documentadas como un **batch de import
conocido y desligado** del 2026-06-09. Esta decisión **supera** la resolución (b) de Héctor
(28-ago, "re-linkear"): el análisis 1-a-1 mostró que no hay dato que ate ninguna fila a una
solicitud concreta, de modo que re-linkear sería adivinar.

**Confianza de mapeo 1-a-1: BAJA en las 6.**

**Evidencia técnica (por qué es un batch de import, no data de producción con dueña perdida):**

- Todas creadas el **2026-06-09** (entre 03:50 y 22:03 UTC).
- **Marca de import Excel**: los `singleSelect` traen las variantes EN MAYÚSCULA "importadas"
  (`BUENO`, `HORMIGON ARMADO`, `NUEVO - S/USO`, `8 A 10 MESES`), no las minúsculas que
  escribe la app.
- **cap rate en campo alterno**: pueblan `fldbBiAvrsphpdLRK`; las filas sanas (con link) usan
  `fldkvdvRm7jbJuSNI` y además traen rol identificador (p. ej. `658-128`).
- **`last_modified` común**: `2026-07-05T23:04:29Z` en las 6 (un único toque en lote).
- **Sin identificadores**: link `solicitud`, `rol_sii`, `direccion`, `comuna`,
  `observaciones_tasador` y `origen_dato` **vacíos** en las 6.
- **Sin dueña por proximidad**: ninguna solicitud fue creada en ±24h (nada entre 2026-06-07 y
  2026-07-07; los códigos 0009–0023 no existen). Las cercanas VP-2026-0003..0008 (06-06) ya
  tienen su propia fila de datos linkeada.

**Los 6 recordIds documentados (`TX_DatosTasacion` · `tblMoK3mFuwN8Yr1A`):**

| # | recordId | sup. constr. | año | avalúo fiscal | valor motor | cap rate |
|---|---|---|---|---|---|---|
| H1 | `recE3rdo1xMqnztOo` | 41 m² | 2026 | 0 | 640k | 0.045 |
| H2 | `recJhzUKUyobFCV2B` | 1.402 m² | 2024 | 340M | 3,3M | 0.045 |
| H3 | `recLYcNd07LCXRViR` | 41 m² | 2018 | 50,6M | 320k | 0.060 |
| H4 | `recWhlLJSeA4Ql851` | 27 m² | 2015 | 27,0M | 250k | 0.055 |
| H5 | `recnZHcYa1tEo8GqP` | 102 m² | 1998 | 115,5M | 710k | 0.045 |
| H6 | `recsnTHCff5rRvcsm` | 40 m² | 1994 | 16,6M | 200k | 0.045 |

**Nota operativa:** si en el futuro se crea un mecanismo de limpieza de *import batches* en
Airtable, estas 6 filas son **candidatas explícitas** a purga.

## CI-065 · Botón "Agregar comparable" en Sección D (duplicado de CI-056)

| Campo | Valor |
|---|---|
| **Identificador** | CI-065 |
| **Archivo:línea** | `components/tasador/seccion-comparables.tsx` (100% presentacional) |
| **Síntoma** | Pendiente heredado en la cola de trabajo: remover el botón «Agregar comparable» de la Sección D tras convertirla en solo-lectura. |
| **Diagnóstico** | Al verificar el árbol: **0 coincidencias** del literal en `components/`, `app/` y `lib/`; handler inexistente (el componente no tiene `onClick`/`set*`/`<Button>`, recibe solo `form`); ruta API `app/api/tasaciones/[id]/comparables/route.ts` **sin `POST`/`DELETE`** (solo `GET`); tests sin mención. El componente ya no tiene botón desde **CI-056** — su docblock lo confirma en las líneas 9-15. |
| **Causa** | El pendiente sobrevivió en la cola de trabajo aunque ya estaba ejecutado: trazabilidad incompleta en el cierre de **CI-056**. |
| **Impacto** | Ninguno. El código ya está en el estado deseado. |
| **Resolución** | ✅ Cerrada como **duplicada de CI-056** (24-ago-2026, punto **(a)** de su resolución: grilla de sólo lectura, sin «Agregar comparable», sin borrado por fila, sin `input`). No requiere cambios de código. |
| **Dueño** | — (duplicado) |
| **Fecha objetivo** | — (cerrada) |
| **Estado** | 🟢 **cerrada** · duplicado |
| **Origen** | Verificación del 28-ago-2026 tras **P9-TAS**: al abrir el frente de remoción se detectó que el botón ya no existía en el árbol. |

## CI-066 · TX_DocumentosLegales vacía en toda la base (bloque 8 legal sin datos verificables)

| Campo | Valor |
|---|---|
| **Identificador** | CI-066 |
| **Archivo:línea** | (dato, no código) `TX_DocumentosLegales` (`tbl7qIg5x4Y0tOiLk`) — totalRecordCount = 0 |
| **Síntoma** | La tabla `TX_DocumentosLegales` no tiene ninguna fila en toda la base. El sub-bloque «Antecedentes legales» del bloque 8 del informe (`fojas`, `numero_inscripcion`, `ano_inscripcion`, `permiso_edificacion_numero`, `recepcion_final_numero`) renderiza 5 «—» para **cualquier** solicitud, no sólo la seed. |
| **Causa (hipótesis)** | No existe pipeline / automatización que pueble `TX_DocumentosLegales`. Los 6 nombres de campo **existen en el schema** (validados en la verificación P9-TAS.B · Paso 1), pero nunca se materializaron filas. Posible: la fuente (Conservador de Bienes Raíces / Municipalidad / OCR de escrituras) todavía no está integrada, o AT03 no genera esas filas. No confirmado. |
| **Impacto** | **Bloqueante para la validación end-to-end del sub-bloque legal del informe.** **No bloqueante para P9-TAS.B**: el cableado es correcto y muestra «—» honesto (RO-34 · §10.1 «no se omite»). |
| **Decisión pendiente** | ✅ **RESUELTA por Héctor (28-ago-2026, revisión UI Tasador) — opción (b): sembrar demo.** Cargar datos legales manuales para al menos **VP-2026-0005** (record demo canónico, `recPx0yiK9k4oPG4V`). El **pipeline productivo** que pueble `TX_DocumentosLegales` de forma automática queda como **frente separado, sin fecha**. |
| **Dueño** | Héctor (decisión) · Claude Code (ejecución seed tras OK) · pendiente asignar owner del pipeline productivo |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟡 **resolución acordada, pendiente ejecución** (Héctor, 28-ago-2026) |
| **Origen** | Verificación **P9-TAS.B · Paso 1** (28-ago-2026, hallazgo H2) durante la lectura MCP contra VP-2026-0005 (`recPx0yiK9k4oPG4V`). |

## CI-067 · Bloque 4 del informe: retirar sub-bloque «códigos SII» y agregar rol SII por unidad con lógica usada/nueva

| Campo | Valor |
|---|---|
| **Identificador** | CI-067 |
| **Archivo:línea** | (por localizar) bloque 4 del informe — sub-bloque «códigos SII» (comuna / manzana / predio) en el productor canónico (`lib/tasador/lectura-informe.ts`) y su render en `components/tasador/informe-preview.tsx` |
| **Síntoma** | El bloque 4 arrastra un sub-bloque de **tres códigos SII** (comuna, manzana, predio) que **no existen en Airtable** (los campos SII declarados en `schema-airtable.md` §20.6 nunca se crearon — ver **CI-025**), de modo que renderiza vacío. Falta, en cambio, el dato que Héctor sí quiere ver: el **rol SII por unidad**. |
| **Causa** | Decisión de producto de Héctor (28-ago-2026, revisión UI Tasador): **NO** implementar los tres códigos SII (comuna/manzana/predio) —quedan definitivamente descartados por inexistencia en base (CI-025)— y **sustituirlos** por el rol SII de cada unidad. |
| **Impacto** | **Medio.** El bloque 4 hoy promete un dato que la base no puede dar (códigos SII) y omite el que el negocio necesita (rol por unidad). No bloquea el resto del informe. |
| **Requerimiento nuevo (Héctor)** | Retirar el sub-bloque «códigos SII» del bloque 4 y agregar **rol SII por unidad** con lógica según estado de uso: <br>· Propiedad **USADA**: mostrar el rol SII de **cada unidad**. <br>· Propiedad **NUEVA**: mostrar el rol SII **sólo si existe**; si no, el texto literal **«no se tiene rol»**. |
| **Decisión pendiente (implementación)** | Antes de codear hay que **verificar cómo se distingue «usada» vs «nueva»** en la base. Candidato principal (pre-verificado): `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`, singleSelect `nuevo · usado`); alternativa a descartar: un subtipo en `TX_Unidades` u otro campo. Confirmar además la fuente del rol SII por unidad (campo en `TX_Unidades`) antes de escribir código. |
| **Dueño** | Héctor (decisión de producto, tomada) · Claude Code (ejecución tras OK y verificación de schema) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟢 **decisión completa · lista para implementación** · 6 ambigüedades resueltas por Héctor (29-ago-2026) — ver «Resolución» al pie |
| **Origen** | Revisión UI Tasador con Héctor (28-ago-2026). Sustituye el enfoque de CI-025 (códigos SII) por rol SII por unidad. |

### Ambigüedades bloqueantes (29-ago-2026)

La verificación MCP previa a la implementación (solo lectura · código + base real) destapó **6
casos límite que la decisión original de Héctor (28-ago-2026) no cubre**. Cada uno exige una regla
explícita antes de escribir código; ninguno se decide del lado del código. Evidencia de contexto:
discriminador `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`, `nuevo`/`usado`);
rol por unidad `TX_Unidades.rol_sii` (`fldC5yUYC2wTTLJBV`, ya expuesto en `lectura-informe.ts:324`
y renderizado en `informe-preview.tsx:453`); rol a nivel bloque `TX_Solicitudes.rol_sii`
(`fldznAL2SuCpfUUtg`, renderizado en `informe-preview.tsx:425`); vacío rinde `"—"` vía `txt()`
(`informe-preview.tsx:60`).

- **A · Discriminador VACÍO** (VP-2026-0005 `recPx0yiK9k4oPG4V` y otros): si
  `tipo_propiedad_nuevo_usado` es `null`, ¿qué rama aplica? ¿Se trata como **usada**, como **nueva**,
  o se muestra `"—"`? *(El record demo canónico VP-2026-0005 tiene el discriminador vacío.)*
- **B · Dos niveles de rol**: bloque (desde solicitud, `informe-preview.tsx:425`) vs por unidad
  (tabla, `informe-preview.tsx:453`). ¿El literal `"no se tiene rol"` aplica **sólo a la columna por
  unidad**, **sólo al bloque**, o **a ambos**? ¿Se conserva el `"Rol SII"` de bloque?
- **C · "EN TRAMITE"** (valor real observado en el rol de solicitud de las propiedades nuevas —
  VP-2026-0047/0046/0044/0050): ¿cuenta como **"existe"** (se muestra tal cual) o es el **sentinel**
  de `"no se tiene rol"`?
- **D · Literal exacto**: ¿`"no se tiene rol"` tal cual, en minúscula, sin punto final? Confirmar
  contra **§6.1 del Blueprint** (estilo de literales).
- **E · Vacío en USADA**: para propiedad **USADA** con rol vacío (caso VP-2026-0005: discriminador
  vacío + unidad sin rol), ¿`"—"` o algún literal específico?
- **F · Solicitud sin unidades** (caso VP-2026-0063 `recdBwN9OimaCcL9T`, 0 unidades): la lógica por
  unidad no tiene sujeto. ¿El bloque muestra **sólo el rol de solicitud**, o **"Sin unidades
  registradas" como hoy**?

**Estado de estas ambigüedades:** 🟢 **resueltas por Héctor (29-ago-2026).** Ver «Resolución» abajo.

### Resolución (29-ago-2026, respuestas de Héctor)

Héctor cerró las 6 ambigüedades bloqueantes. Respuestas literales:

- **A · Discriminador VACÍO:** temporal → tratar como **«nuevo»** hasta que **CI-069** normalice la
  data. Post-CI-069 el caso no existirá porque **CI-068** hará obligatorio el campo en el formulario.
- **B · Dos niveles de rol:** la regla aplica **tanto al rol de bloque como al rol por unidad**.
- **C · "EN TRAMITE":** tratar como **ausente**, mostrar el literal.
- **D · Literal final:** **«Rol SII pendiente»** (mayúscula inicial, sin punto).
- **E · USADA con rol vacío:** mismo literal **«Rol SII pendiente»**.
- **F · Sin unidades:** omitir la tabla de unidades, mostrar sólo el rol general de bloque.

**Regla implementable consolidada:**

```
valor = rol crudo del campo
if (valor == null || valor.trim() == "" || valor == "EN TRAMITE"):
    mostrar "Rol SII pendiente"
else:
    mostrar valor
```

Aplica igual a **rol de bloque** y a **rol por unidad**. Si no hay unidades: **no renderizar la
tabla `porUnidad`**.

> El literal **«Rol SII pendiente»** (respuesta D) **sustituye** al tentativo «no se tiene rol» que
> figura en la fila «Requerimiento nuevo (Héctor)» de esta misma ficha.

> ⚠ La respuesta 1 de Héctor abre 3 requerimientos que exceden CI-067 y se separan como **CI-068**
> (form: campo obligatorio), **CI-069** (migración nulls → «nuevo») y **CI-070** (filtro de adjuntos
> por tipo de propiedad).

## CI-068 · Formulario nueva solicitud: campo `tipo_propiedad_nuevo_usado` debe ser obligatorio

| Campo | Valor |
|---|---|
| **Identificador** | CI-068 |
| **Archivo:línea** | (por localizar) formulario de creación de solicitud — territorio por confirmar (IF-02 «nueva solicitud» vs IF-03) |
| **Síntoma** | Hoy el formulario de nueva solicitud permite crear sin definir usado/nuevo. **VP-2026-0005** y otros records quedaron con `tipo_propiedad_nuevo_usado` vacío. |
| **Requerimiento** | Forzar la selección de usado/nuevo al momento de crear la solicitud (campo obligatorio en el form). |
| **Impacto** | **Alto** — afecta la pantalla de creación de solicitud en IF-02 (posible **R5** con Óscar). |
| **Pendiente antes de codear** | Verificar si el form vive en **IF-02** (R5) o **IF-03** (territorio). |
| **Origen** | Respuesta **1.1** de Héctor (29-ago-2026), derivada de la resolución de CI-067 · ambigüedad A. |
| **Dueño** | (por asignar) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟡 **abierta** · requerimiento definido · pendiente asignación de tanda |

## CI-069 · Normalizar `tipo_propiedad_nuevo_usado` en registros existentes (nulls → «nuevo»)

| Campo | Valor |
|---|---|
| **Identificador** | CI-069 |
| **Archivo:línea** | (dato, no código) `TX_Solicitudes.tipo_propiedad_nuevo_usado` (`fldHxx1P1ao33PWrl`) |
| **Síntoma** | N solicitudes en `TX_Solicitudes` con `tipo_propiedad_nuevo_usado = null`. Rompe consistencia y obliga a la regla transitoria de CI-067 (ambigüedad A). |
| **Requerimiento** | Escritura masiva en Airtable para poblar todos los `null` con el valor **«nuevo»**. |
| **Impacto** | **Solo datos, no código.** |
| **Pendiente antes de ejecutar** | Contar cuántos records afectados (inventario). |
| **Origen** | Respuesta **1.2** de Héctor (29-ago-2026), derivada de la resolución de CI-067 · ambigüedad A. |
| **Dueño** | (por asignar) · ejecución requiere escritura autorizada en base productiva |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟡 **abierta** · pendiente inventario + escritura autorizada |

## CI-070 · Filtro de documentos adjuntos según tipo de propiedad (usada/nueva)

| Campo | Valor |
|---|---|
| **Identificador** | CI-070 |
| **Archivo:línea** | (por localizar) módulo de adjuntos/fotos del tasador · catálogo `D_TipoDocumento` (campo `tipo_propiedad`) |
| **Síntoma** | La funcionalidad de adjuntos hoy no distingue qué documentos mostrar según el tipo de propiedad. La tabla `D_TipoDocumento` tiene un campo `tipo_propiedad` que indica a qué tipo aplica cada documento. |
| **Requerimiento** | El módulo de adjuntos debe filtrar el catálogo de documentos exigibles según `TX_Solicitudes.tipo_propiedad_nuevo_usado` de la solicitud versus `D_TipoDocumento.tipo_propiedad`. |
| **Impacto** | **Medio** — afecta la pantalla de fotos/adjuntos del tasador. |
| **Pendiente antes de codear** | Verificar la estructura de `D_TipoDocumento.tipo_propiedad` (valores posibles, cardinalidad, mapeo). |
| **Origen** | Respuesta **1.3** de Héctor (29-ago-2026), derivada de la resolución de CI-067 · ambigüedad A. |
| **Dueño** | (por asignar) |
| **Fecha objetivo** | (pendiente) |
| **Estado** | 🟡 **abierta** · requerimiento definido · pendiente verificación de schema |

---

## CI-071 · La subida de fotos al cuadro «Ofertas / Comparables» no escribe `clave_adjunto` → RF-09 hace skip y no hay comparables

| Campo | Valor |
|---|---|
| **Identificador** | CI-071 |
| **Archivo:línea** | `app/api/tasaciones/[id]/fotos/route.ts:233-234` (el PATCH escribe `tipo_adjunto='foto_interior'` y `descripcion=<categoria>`, **nunca** `clave_adjunto`) · `lib/tasador/fotos.ts:124` (`categorizarFoto` envía `{adjuntoId, categoria, orden}`, sin `clave_adjunto`) · consumidor aguas abajo `docs/_artefactos/airtable/AT-RF09-Trigger_script.js:226-233` (rama "skipped sin tipo") |
| **Síntoma / Evidencia** | `TX_Adjuntos` **rec8WypPYugEYaicK** (VP-2026-0060, 2026-09-01T20:29:15Z): `clave_adjunto` **vacío**, `tipo` vacío, `tipo_adjunto=foto_interior`, `descripcion=ofertas_comparables`, `estado_extraccion=skipped`. **Sin fila RF-09** en `LogEscenarios` (`tblR4VWpUHw1CSyIS`) — las 10 últimas son `ADJUNTOS_UPLOAD*` ✓ OK. `TX_Comparables` (`tbllbTuhb0waWIbRo`) → **0 filas** con `clave_natural` `VP-2026-0060|COMP-xx`. |
| **Causa** | La categorización del organizador de fotos (§2.6) escribe únicamente `descripcion` + `tipo_adjunto`. `clave_adjunto` —el `codigo` de `D_TipoDocumento`, que es la llave que `AT-RF09-Trigger` lee para rutear a RF-09— nunca se puebla. Sin `clave_adjunto`, el trigger cae en la rama "skipped sin tipo", marca `estado_extraccion=skipped` y **no dispara el webhook**. Sin extracción no corre AT03-Ext → no se generan filas en `TX_Comparables`. |
| **Impacto** | **Alto para el flujo del tasador.** «D. Comparables» queda en **0/N**. Como RF-12 habilita «Calcular» sobre `form.comparables.length` (CI-058), sin comparables **el cálculo no se puede lanzar**, y aguas abajo **no hay preview** (Pantallas 5→9 bloqueadas). |
| **Relación** | **Aguas arriba de CI-002**: reparar el webhook RF-09 **no** resuelve este síntoma — el skip ocurre antes del webhook, por falta de `clave_adjunto`. **No es duplicado de CI-061**: en CI-061 la categorización 404-eaba por autoNumber y dejaba `descripcion/tipo_adjunto` vacíos; aquí la categorización tuvo éxito (ambos poblados, el puente de CI-061 funcionó) y `clave_adjunto` queda vacío por diseño del payload. Vecino de CI-060 (mínimo de fotos del mismo cuadro). |
| **Estado** | **ABIERTO** — se difiere a fase post-P12-TAS. |
| **Dueño** | Sergio (prioriza/asigna) |
| **Origen** | P12-TAS · diagnóstico de deploy verification (2026-09-01): foto real de comparables subida en prod a VP-2026-0060 no pobló «D. Comparables». |
