# VProperty — SLA Operacionales del Negocio

*Tiempos de servicio comprometidos por etapa del workflow de tasación y soporte del sistema para su cumplimiento y medición.*

| Campo | Valor |
|---|---|
| **Versión** | 1.3 |
| **Fecha** | 22 de agosto de 2026 |
| **Propósito** | Consolidación con respuestas del cliente (Héctor). Base para incorporación a la especificación oficial. |
| **Fuentes** | Audios explicativos del cliente ("sla del negocio.txt", "sla parte 2 de 2.txt") y la segunda tanda de audios de `docs/_md/audios/` (`p1`–`p8`, `r21`–`r23`, `revision 1`). Plantilla operativa vigente `Formato Informe VProperty Enero2026.xlsm`, citada como `[Excel: hoja!celda]`. |
| **Cambios vs. v1.2** | Respuestas de Héctor a las tres consultas bloqueantes. El umbral del recordatorio de coordinación queda fijado en **4 horas hábiles** y deja de ser provisional; se documenta que coincide con el ámbar de la etapa 2 y que, por tanto, no introduce un instante nuevo. Los defaults de la hoja de antecedentes se particionan por tipo de propiedad × estado de uso. Los tres factores de homogeneización quedan ratificados. |
| **Cambios vs. v1.1** | Recordatorio automático al tasador y tope de respuesta al cliente incorporados a la etapa 2. Catálogo de desenlaces de la coordinación. Catálogo de motivos de reproceso. Los dos reportes de control diario que hoy viven fuera del sistema. Pre-llenado de la hoja de antecedentes como compromiso de servicio. Plazo de la etapa 5 corroborado contra la plantilla. |

---

## 1. Contexto

El proceso de tasación involucra cuatro actores principales:

| Actor | Rol en el proceso |
|---|---|
| **Cliente (ejecutivo de la empresa mandante)** | Solicita la tasación por correo. |
| **Área de Control y Seguimiento (Ejecutiva VProperty)** | Registra, coordina y comunica. |
| **Tasador** | Llama al contacto, visita la propiedad y emite el informe. |
| **Área de Visado (Visador)** | Revisa el informe, lo aprueba y cierra el proceso enviando el PDF final al cliente. |

Cada etapa tiene un tiempo ideal (objetivo) y un tiempo máximo tolerado (SLA).

---

## 2. Descripción narrativa del flujo

1. Llega un correo del cliente solicitando la tasación a los buzones institucionales (`info@` o `contacto@` según el cliente).
2. El área de Control y Seguimiento detecta el correo no leído, lo abre e ingresa la solicitud al sistema, enviándola al tasador. Todo lo recibido en la mañana debe estar ingresado al mediodía; lo recibido al mediodía, ingresado en la tarde. Máximo 3 horas entre recepción del correo y recepción por el tasador.
3. El tasador recibe la solicitud y tiene 4 a 6 horas máximo para llamar al contacto de la propiedad y coordinar la visita. Si transcurre el umbral de recordatorio sin que haya informado un desenlace, el sistema le insiste automáticamente (sección 3.3).
4. Inmediatamente después del llamado (idealmente en media hora), el tasador informa a Control y Seguimiento el resultado: día y hora de visita coordinada, o una de las incidencias del catálogo de la sección 3.4 (teléfono erróneo, no contesta, el contacto no reconoce la solicitud, el contacto debe coordinar con quien ocupa la propiedad).
5. Control y Seguimiento recibe la información del tasador y la comunica al ejecutivo del cliente en un plazo de 2 a 3 horas. Ese aviso reproduce el desenlace del catálogo: es lo mismo que el tasador informó, redactado hacia el cliente.
6. El tasador realiza la visita y envía el informe. Plazo máximo 48 horas, con objetivo de bajarlo a 24 horas. La plantilla operativa vigente fija el mismo compromiso: la fecha de entrega se calcula como dos días hábiles después de la visita, a las 09:00 `[Excel: FICHA SOLIC!K11 · N11]`.
7. Control y Seguimiento baja el informe a Dropbox (o el sistema recibe la carga) y lo pone a disposición del área de visado en 2 a 3 horas.
8. El Visado revisa cada informe en máximo 30 minutos. Con esa capacidad se procesan aproximadamente 20 informes/día por visador (basado en ~400 tasaciones mensuales y 20 días hábiles).
9. Una vez visado, el sistema genera el entregable (PDF y, según cliente, Excel de resumen) y envía automáticamente el correo al cliente final, cerrando el proceso.

---

## 3. Matriz de SLA

### 3.1 Flujo principal (solicitud nueva)

| # | Etapa | Actor responsable | De → A | SLA ideal | SLA máximo |
|---|---|---|---|---|---|
| 1 | Ingreso de solicitud | Control y Seguimiento | Cliente (ejecutivo) → Tasador | **2 h** | **3 h** |
| 2 | Coordinación de visita (llamado) | Tasador | Tasador → Contacto de propiedad | **4 h** | **6 h** |
| 3 | Informe post-llamado | Tasador | Tasador → Control y Seguimiento | **30 min (inmediato)** | **30 min** |
| 4 | Aviso de coordinación al cliente | Control y Seguimiento | Control y Seguimiento → Cliente (ejecutivo) | **2 h** | **3 h** |
| 5 | Visita y envío de informe | Tasador | Tasador → Control y Seguimiento | **24 h** | **48 h** |
| 6 | Bajada de informe a Dropbox / disponible para visado | Control y Seguimiento | Control y Seguimiento → Visado | **2 h** | **3 h** |
| 7 | Visación y envío final | Visado | Visado → Cliente (ejecutivo) — automático | **30 min/informe** | **30 min/informe** |

| Métrica | Valor |
|---|---|
| **Tiempo total end-to-end (caso ideal)** | **~30 horas** |
| **Tiempo total end-to-end (SLA máximo)** | **~62 horas** |

Dos precisiones sobre esta matriz, ambas provenientes de la operación real:

- **Etapa 2.** Los umbrales de 4 y 6 horas miden cuándo la etapa entra en ámbar y en rojo. No son lo mismo que el recordatorio automático al tasador ni que el tope de respuesta al cliente, que son mecanismos distintos y se declaran en la sección 3.3.
- **Etapa 5.** Las 48 horas del SLA máximo coinciden con la regla que la plantilla operativa ya aplica: `=WORKDAY(fecha_visita, 2)` a las 09:00 `[Excel: FICHA SOLIC!K11 · N11]`. La planilla excluye fin de semana pero no feriados; el sistema excluye ambos, de modo que es más estricto, no más laxo. Un audio de la misma tanda menciona 24 horas para este tramo en vez de 48; se trata como observación pendiente de aclaración y **no** modifica la matriz, que conserva 24 ideal / 48 máximo.

### 3.2 Reproceso (informe ya entregado que vuelve para modificación)

Se considera reproceso cuando el ejecutivo del cliente devuelve un informe ya entregado solicitando incorporar información faltante (ej.: permiso de recepción final, RUT o apellido del vendedor, certificado de profesión), modificar contenido o solicitar aumento de valor (ej.: +5%). El caso más frecuente es incorporar el permiso de recepción final en viviendas usadas.

**El reproceso conserva el código de la solicitud original.** No se crea una solicitud nueva: es el mismo caso, que vuelve. Esto gobierna tanto la trazabilidad como los reportes de la sección 5.

**Motivos tipificados.** El cliente enumera siete motivos recurrentes, ordenados por frecuencia observada:

| # | Motivo | Qué llega con la solicitud |
|---|---|---|
| 1 | Incorporar permiso de recepción final | Los certificados que lo acreditan |
| 2 | Corregir la dirección según el certificado de número | El certificado de número |
| 3 | Solicitud de revisión por aumento de valor | La justificación del ejecutivo |
| 4 | Incorporar regularización de ampliación | Los certificados de regularización |
| 5 | Corrección de forma (nombre, RUT y equivalentes) | El dato corregido |
| 6 | Cambio de cliente destinatario del informe | El cliente al que hay que reemitirlo, con su código y logo |
| 7 | Pronunciamiento sobre afectación de utilidad pública | El certificado que la acredita, solicitado por el abogado |

**Valor**: siete motivos · **Fuente**: audio `p3` · **Estado**: pendiente de ratificación por el product owner (A-26).

Quién ejecuta el reproceso depende de su naturaleza. Los cambios de forma, los de fondo y los de valor los realiza el **perfil de visación**, que es el único con permiso sobre las tres dimensiones; los motivos que exigen revisar la propiedad vuelven al tasador.

| # | Etapa | Actor responsable | De → A | SLA ideal | SLA máximo |
|---|---|---|---|---|---|
| R1 | Registro del reproceso y acuse de recibo al cliente | Control y Seguimiento | Cliente (ejecutivo) → RAID de seguimiento | **2 h** | **2 h** |
| R2 | Ejecución del reproceso (tasador realiza el cambio) | Tasador | Tasador → Control y Seguimiento | **Según tipo** | **Ver regla operativa** |
| R3 | Visación y envío del reproceso | Visado | Visado → Cliente (ejecutivo) — automático | **2 h** | **3 h** |

**Regla operativa "reproceso limpio":**

- Reprocesos ingresados a última hora del día anterior (18:00–19:00) o durante la mañana → deben salir despachados antes de las 12:00–14:00.
- Reprocesos ingresados después de las 14:00–15:00 → deben salir despachados en la tarde del mismo día.
- Objetivo: iniciar cada día hábil sin reprocesos pendientes de la jornada anterior.

### 3.3 Recordatorios al tasador y tope de respuesta al cliente

Los umbrales de la matriz miden el cumplimiento. Lo que sigue son dos mecanismos **distintos** que la operación necesita para que ese cumplimiento ocurra, y que hoy se ejecutan a mano o no se ejecutan.

**Recordatorio automático de coordinación.** Si el tasador no ha informado un desenlace de la sección 3.4 dentro del umbral, el sistema le insiste por sí solo, sin que Control y Seguimiento tenga que perseguirlo.

- **Valor**: **4 horas hábiles** desde la asignación · **Fuente**: decisión de Héctor, 22-ago-2026 · **Estado**: **ratificado** (cierra **A-22**).
- **El umbral no introduce un instante nuevo.** Cuatro horas es el SLA ideal de la etapa 2, que la matriz de la sección 3.1 ya fijaba: el recordatorio se dispara **en el mismo momento en que la etapa 2 pasa a ámbar**. No hay un reloj adicional que configurar ni un plazo paralelo que mantener sincronizado.
- La secuencia queda ordenada, con dos destinatarios distintos y sin redundancia:

| Momento | Qué ocurre | A quién va | Para qué |
|---|---|---|---|
| **4 h hábiles** | La etapa 2 pasa a ámbar · **recordatorio** | Tasador | Que actúe |
| **6 h hábiles** | La etapa 2 pasa a rojo · **escalada** | Responsable de área | Que intervenga |

- **Canales**: correo y WhatsApp. El segundo es una petición explícita del cliente y no tiene proveedor definido (**A-24**).

> **Nota de unidad.** Umbral en horas hábiles, coincidente con el ámbar de la etapa 2. Pendiente confirmación explícita con Héctor de que la intención fue hábiles y no reloj (se agrega a la próxima consulta). Si fuese de reloj, el recordatorio dejaría de coincidir con el ámbar, exigiría cómputo propio y podría avisar un sábado.

**Recordatorio de entrega del informe.** Transcurridas 24 horas desde la visita sin que el informe haya llegado, el tasador recibe un aviso de que el plazo vence al segundo día. Es el mismo mecanismo aplicado a la etapa 5, y su umbral coincide con el SLA ideal de esa etapa.

**Tope de respuesta al cliente.** Con independencia de lo que ocurra con la coordinación, VProperty se compromete a responderle al ejecutivo del cliente con una fecha de visita —o con el motivo por el cual no la hay— dentro de las **24 horas** desde el ingreso de la solicitud. No es una etapa nueva: es una restricción que atraviesa las etapas 2, 3 y 4, y su incumplimiento es visible aunque cada etapa individual esté dentro de plazo. Cómo se modela —umbral agregado sobre esas tres etapas o sólo reporte— está pendiente (**A-23**).

### 3.4 Catálogo de desenlaces de la coordinación

El tasador cierra la etapa 3 eligiendo exactamente uno de estos desenlaces. El catálogo tiene doble uso: es lo que el tasador registra y es lo que Control y Seguimiento le comunica al ejecutivo del cliente en la etapa 4.

| # | Desenlace | Dato que exige | Qué se le informa al cliente |
|---|---|---|---|
| 1 | Visita coordinada | Día y hora | Fecha y hora de la visita |
| 2 | Teléfono erróneo | — | Se solicita otro número de contacto |
| 3 | No contesta | — | Se insistió y se envió WhatsApp; se solicita gestión |
| 4 | El contacto no reconoce la solicitud | — | Se solicita validar el contacto |
| 5 | El contacto debe coordinar con quien ocupa la propiedad | — | La coordinación quedó en manos del contacto |
| 6 | Otro motivo | Detalle obligatorio | Según el detalle |

**Valor**: seis desenlaces · **Fuente**: audios `p1` y `p2` · **Estado**: pendiente de ratificación por el product owner (**A-25**).

Sólo el primer desenlace produce fecha de visita y permite avanzar a la etapa 5. Los cinco restantes devuelven la solicitud a Control y Seguimiento, que gestiona un contacto nuevo, y detienen el reloj de la etapa 2 mientras la solicitud espera esa gestión.

---

## 4. Cómo el sistema VProperty soporta cada SLA

| Etapa | Soporte en el sistema |
|---|---|
| **1. Ingreso** | IF-02 (Consola Ejecutiva) permite creación de solicitud con carga de documento o entrada manual. El timestamp de "recepción" se registra en el momento en que la Ejecutiva abre el correo e inicia el ingreso (ver sección 6.2). Notificación automática al tasador. |
| **2. Coordinación (llamada)** | El tasador recibe la solicitud en su bandeja. Sistema registra timestamp de asignación. Al cumplirse las 4 h hábiles la etapa pasa a ámbar y, en ese mismo instante, el sistema envía el recordatorio automático al tasador (sección 3.3); a las 6 h pasa a rojo y escala al responsable de área. |
| **3. Informe post-llamado** | Tasador registra en el sistema el desenlace del llamado eligiéndolo del catálogo de la sección 3.4: fecha y hora de visita, o el motivo por el cual no la hay. Timestamp automático. |
| **4. Aviso al cliente** | Notificación automática o gestionada por Ejecutiva al ejecutivo del cliente, con el desenlace registrado en la etapa 3. Sujeta al tope de 24 h de la sección 3.3. |
| **5. Visita e informe** | Tasador sube el informe. Sistema registra fecha real de visita y fecha de subida del informe. Recordatorio automático al tasador a las 24 h de la visita. El formulario de captura le llega **pre-llenado** con los valores más característicos, según la sección 6.6. |
| **6. Disponibilidad para visado** | Al subir el informe, se dispara la extracción automática (RF-09 con Claude API) y el estado cambia a "En cola para visación". |
| **7. Visación y envío** | Visador aprueba en el sistema. Se genera el entregable según configuración del cliente (ver sección 4.1) y se dispara envío automático de correo. Timestamp de cierre. |
| **R. Reproceso** | IF-02 permite marcar la solicitud como "En reproceso" con motivo tipificado del catálogo de la sección 3.2, sobre el **mismo código** de la solicitud original. Se conserva la trazabilidad del informe original y del cambio solicitado. Los SLA de reproceso corren en paralelo a los del flujo principal, y las solicitudes en reproceso son filtrables como conjunto propio (sección 5). |

### 4.1 Configuración de entregable por tipo de cliente

El correo automático final incluye el texto tipo: *"Estimado, se adjunta el informe de la referencia."* El(los) archivo(s) adjunto(s) dependen de la configuración del cliente:

| Tipo de cliente | Entregable adjunto | Observación |
|---|---|---|
| **Estándar (mayoría)** | PDF del informe (parte con carátula y luego el informe). | Configuración base. La carátula es `[Excel: Tapa]` y el cuerpo `[Excel: Impresion]`. |
| **Cliente con resumen ejecutivo** | PDF + archivo Excel con resumen del PDF (formato tipo). | El Excel se genera con el mismo formato para todos los clientes de esta categoría. Su plantilla vigente es `[Excel: Hoja Resumen]`. |
| **Cliente Unidad de Vivienda Habitacional** | PDF con primera hoja de resumen embebida, seguida de carátula e informe. | El resumen está dentro del mismo PDF, no como archivo separado. Su plantilla vigente es `[Excel: ULH]`, con la metodología de prorrateo de bien común en `[Excel: Bien Común!B2:O27]`. |

El proceso operativo actual: al cierre del visado se sube el(los) archivo(s) a Dropbox y se dispara el correo automático con los adjuntos correspondientes al perfil del cliente.

---

## 5. Métricas y alertas

**Cada solicitud registrará automáticamente:**

- Timestamp de cada transición de estado.
- Tiempo transcurrido por etapa vs. SLA ideal y SLA máximo.
- Indicador visual (verde / amarillo / rojo) según cumplimiento.
- Marca de reproceso, motivo tipificado y SLA propio (R1–R3).

**Alertas:**

- Amarillo al llegar al SLA ideal sin completarse la etapa.
- Rojo al superar el SLA máximo.
- Notificación al responsable de área cuando una solicitud entra en rojo.
- Recordatorio automático al tasador —correo y WhatsApp— a las **4 horas hábiles** sin coordinar, y cuando el informe lleva 24 horas pendiente desde la visita. Estos recordatorios se dirigen al ejecutor para que actúe; la notificación de rojo se dirige al responsable de área para que escale. Son mecanismos distintos y no se sustituyen, aunque el primero comparta instante con el ámbar de la etapa 2: lo que los separa no es cuándo se disparan sino a quién van y qué se espera de cada uno.
- Alerta de fin de jornada para reprocesos aún abiertos (regla "reproceso limpio").

**Reportes:**

- Cumplimiento de SLA por etapa y por actor (diario / semanal / mensual).
- Volumen procesado por visador (capacidad de referencia: ~20 informes/día).
- Volumen y tipología de reprocesos por cliente y por tasador.
- Desviaciones y causas, tipificadas según el catálogo de desenlaces de la sección 3.4.

**Los dos reportes de control diario.** El área revisa a diario un tablero que hoy vive fuera del sistema, en una planilla compartida, y que el cliente describe como *"vital"*. Tiene exactamente dos bloques, y ambos son requisito del sistema:

1. **Reprocesos abiertos**, con fecha, código y qué se está pidiendo. Encabeza el tablero porque el cliente ya está escriturando la operación: un reproceso demorado bloquea una firma.
2. **Vencimientos por antigüedad desde la visita**, agrupados en días —4, 3, 2 y 1— para leer de un vistazo cuántos informes deben despacharse hoy y por qué uno de cuatro días no salió al tercero. La conveniencia de incluir un grupo de día 0 está planteada por el cliente y pendiente (**A-32**).

**El reporte que hoy no existe.** No hay forma de saber cuántas solicitudes llevan más de 24 horas sin fecha de visita: *"yo hoy día no sé de todos los informes cuántos no tienen fecha de visita"*. Es el reporte que hace verificable el tope de respuesta al cliente de la sección 3.3, y su ausencia es la razón por la que ese tope se incumple sin que nadie lo note. Se especifica como filtro de la bandeja y como corte diario.

---

## 6. Definiciones operativas validadas con el cliente

Los siguientes puntos fueron validados por Héctor y se incorporan como reglas operativas del sistema.

### 6.1 Horario hábil y calendario de aplicación

- **Aplicación de SLA:** lunes a viernes, de 9:00 a 18:00 hrs.
- **Días excluidos:** sábados, domingos y feriados oficiales. Los tiempos de SLA no corren durante estos días.
- **Recepción de correos:** 24x5 (los buzones reciben las 24 horas, pero el conteo de SLA comienza sólo dentro del horario hábil).

### 6.2 Definición de "recepción del correo"

Los clientes envían solicitudes a dos buzones institucionales: `info@valueproperty` y `contacto@valueproperty` (la asignación por cliente ya está definida). El punto de partida del SLA se define así:

- **NO se considera recepción:** la llegada del correo al buzón.
- **SÍ se considera recepción:** el momento en que Control y Seguimiento abre el correo (deja de estar en "negrita") e ingresa la solicitud al sistema. Sólo Control y Seguimiento tiene esa responsabilidad.
- **Acuse formal:** al ingresar la solicitud, Control y Seguimiento responde al ejecutivo con el mensaje tipo: *"Estimado, acusamos recepción, informamos que el proceso ya está en curso y le comentaremos a la brevedad."*
- **SLA aplicable:** 2 a 3 horas desde el envío del ejecutivo hasta el ingreso al sistema y la generación de la solicitud para el tasador (etapa 1 de la matriz).

### 6.3 Capacidad de visación

- **Capacidad de referencia:** 20 informes/día por visador (ajustado desde 15).
- **Base de cálculo:** ~400 tasaciones mensuales / 20 días hábiles = 20 visaciones/día promedio.

### 6.4 Entregable al cliente

El PDF es el entregable base para todos los clientes. Detalle por perfil de cliente en la sección 4.1.

### 6.5 Reproceso

El reproceso tiene SLA propio y no forma parte de la matriz principal. Se registra en el sistema con motivo tipificado del catálogo de siete valores y sobre el **mismo código** de la solicitud original, y sigue la regla operativa "reproceso limpio". Ver sección 3.2 para la matriz específica, el catálogo de motivos y la regla de despacho diario.

### 6.6 Pre-llenado de la hoja de antecedentes

La hoja de antecedentes **nunca se despacha en blanco**. El tasador la recibe completa, con los valores más característicos de una propiedad chilena ya puestos, y su trabajo en terreno es corregir lo que no calce, no llenar desde cero.

Es una regla de calidad de datos antes que de comodidad: el cliente la formula desde el modo de falla que produjo, *"si va en blanco no le colocaba nada"*. Un campo vacío se queda vacío; un campo con un valor plausible se corrige cuando está mal. El pre-llenado también acorta la captura, y esa es la vía por la que esta regla incide sobre la etapa 5.

La plantilla operativa vigente ya la implementa, y es la fuente de los valores:

- Los defaults no son constantes: dependen de dos interruptores, el tipo de propiedad `[Excel: FICHA SOLIC!K35]` y el estado de uso Nuevo/Usado `[Excel: FICHA SOLIC!K36]`.
- Características constructivas principales, ocho campos con su calidad y estado `[Excel: Antecedentes!B36:BP44]`.
- Otros elementos constructivos, ocho campos `[Excel: Antecedentes!AL37:BE44]`.
- Terminaciones de cinco recintos por cuatro atributos `[Excel: Antecedentes!B45:BE50]`.
- Anexo de estado de conservación, treinta y ocho filas pre-llenadas con la terna `Bueno / Ninguno / Funcionando` `[Excel: Estado Conservación!A7:W46]`.

El catálogo de valores admisibles de cada campo vive en la misma plantilla, en columnas ocultas. Desde el 22-ago-2026 está decidido también **cómo se particiona** el conjunto: por **tipo de propiedad × estado de uso**, replicando los dos interruptores de la plantilla (cierra **A-27**). Lo que resta es crear la tabla que lo aloje, que es trabajo de schema con su propia aprobación.

---

*Documento consolidado con las respuestas del cliente. Los SLA aquí definidos se incorporarán a la especificación oficial de VProperty y se implementarán como reglas y alertas del sistema.*
