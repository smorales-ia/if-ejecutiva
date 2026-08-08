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
