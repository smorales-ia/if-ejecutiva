  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

**IA SOLUTION**

*Consultoría de Automatización con IA*

**DOCUMENTO TÉCNICO**

**DISEÑO DE**

**CAPA DE DATOS**

**ENTERPRISE**

VProperty · Sistema de Tasaciones Configurable

*La base de datos como cerebro central del sistema*

  -----------------------------------------------------------------------
  **Cliente**          VProperty --- Tasaciones Bienes Raíces
  -------------------- --------------------------------------------------
  **Documento**        Diseño de Base de Datos · Capa de Datos

  **Versión**          2.6.4 · Julio 2026 (sucede a 2.6.3 — §10
                       TX_Comparables sincronizada con el schema real de
                       Airtable leído vía MCP el 23-jul-2026: definición
                       única de 38 campos con sus fórmulas reales,
                       absorbe el bloque \"Campos nuevos v2.4\" y la tabla
                       de factores de §18.8, y marca como pendientes de
                       crear distancia_km, url, dormitorios, banos,
                       estacionamientos, bodegas y uf_m2_homologado).
                       Hereda de 2.6.3: renombre
                       uso_interfaz_negocio en D_Atributo · nuevos campos
                       version en D_Atributo y extraccion_incompleta en
                       D_Documento · alta del escenario Make
                       SC10_generar_thumbnails · alineación a
                       Especificación v1.4). **§6.7 (Dominio D\_)
                       actualizada para reflejar la consolidación a dos
                       tablas (D_TipoDocumento y D_TipoDocumentoAtributo)
                       y el enrutamiento por cardinalidad hacia
                       TX_Unidades introducidos por la Especificación
                       v1.6 · blueprint v8.2 (Julio 2026). Alineada a
                       Especificación v1.8.2: incorpora el tipo de
                       documento `foto_fuente_sii` (propiedades usadas),
                       el campo `estado_unidad` en TX_Unidades (RN-38) y
                       los campos `sup_terreno_m2`/`tipo_material` en
                       TX_Unidades. IDs reales verificados vía MCP el
                       17-jul-2026 contra la base `app9G7lLkIV3CpeLa`.
                       **Actualización 22-jul-2026**: agrega §19 con las
                       dependencias de schema que exige la maqueta v1.9
                       (Especificación v1.9.1) — 7 campos nuevos en
                       TX_Solicitudes, 8 en TX_Unidades, tablas nuevas
                       TX_ContactosVisita / TX_Vendedor / M_TiposDeBien, y
                       el bloque SII completo en TX_DatosTasacion. Ninguno
                       de estos campos existe todavía en la base real —
                       ver `docs/schema-airtable.md` §20 para el detalle
                       verificable vía MCP cuando se creen. El resto del
                       documento conserva su alcance v2.6.2.

  **Plataforma**       Airtable (Team) como core operacional

  **Documento padre**  Arquitectura Enterprise VProperty v2.6

  **Clasificación**    Confidencial · Uso interno VProperty
  -----------------------------------------------------------------------

▌

**La base de datos NO es almacenamiento.**

**La base de datos es el cerebro completo del sistema.**

*Y los formularios son la interfaz operacional crítica que alimenta ese
cerebro.*

# Índice del documento

*Este documento se enfoca específicamente en la capa de datos del
sistema VProperty. Asume conocimiento del documento padre (Arquitectura
Enterprise v2.0) y profundiza en lo único que necesitas dominar para
implementar el sistema: cómo la base de datos toma todas las decisiones
operacionales.*

**1** Resumen ejecutivo: la BD como cerebro del sistema

**2** El equipo detrás del diseño de datos

**3** Los 10 principios del diseño de la capa de datos

**4** Arquitectura conceptual: los 7 dominios

**5** Blueprint visual: mapa relacional completo

**6 Modelo de datos completo · 45 tablas detalladas**

**7** Motor de reglas de negocio parametrizable

**8** Motor parametrizable extendido

**9** Diseño detallado de formularios (8 formularios)

**10** Flujo de decisión central paso a paso

**11** Integración con Make: dónde vive cada cosa

**12** Generación documental con Carbone.io

**13** Auditoría y trazabilidad total

**14** Escalabilidad, permisos y mantenibilidad

**15** Riesgos identificados y mitigaciones

**16** Roadmap de implementación

**17** Anexos: blueprints, checklists, cheat sheets

# 1. Resumen ejecutivo

Lo que sigue es el corazón del proyecto VProperty. El documento padre
describe la arquitectura general en cinco capas. Este documento se
concentra en una sola: la capa de datos. Lo hace porque, en esta
arquitectura, la base de datos no es un almacén pasivo. Es el componente
que decide cómo se comporta todo el sistema.

Cada vez que entra una solicitud, el sistema le pregunta a la base de
datos qué cliente es, qué plantilla usar, qué fórmulas aplicar, qué
workflow ejecutar, a quién notificar y qué documento entregar. Make no
decide nada de eso. Solo ejecuta lo que la base de datos le indica. Por
eso decimos que la base es el cerebro.

+-----------------------------------------------------------------------+
| **▌ Lo que entrega este documento**                                   |
|                                                                       |
| • 53 tablas distribuidas en 7 dominios (32 originales + 9 de la       |
| adenda v2.1 + 4 incorporadas en v2.3 + 1 agregada en v2.4             |
| (C_AutomationsAirtable) para reproducción 100% del PDF a partir de    |
| Airtable).                                                            |
|                                                                       |
| • Motor de reglas parametrizable que reemplaza por completo los IF de |
| Make.                                                                 |
|                                                                       |
| • 8 formularios diseñados para minimizar errores y maximizar          |
| velocidad operacional.                                                |
|                                                                       |
| • Blueprints visuales de cada dominio, listos para que cualquier      |
| integrador los implemente.                                            |
|                                                                       |
| • Roadmap de 20 semanas con entregables incrementales y métricas de   |
| éxito.                                                                |
|                                                                       |
| • Checklists, riesgos y mitigaciones recopilados por nueve perfiles   |
| del equipo.                                                           |
+=======================================================================+

### Las cinco promesas operacionales del diseño

*Estas cinco promesas son la prueba pública del diseño. Si el sistema
implementado no cumple con alguna, hay algo arquitectónicamente mal y
debe revisarse.*

  -----------------------------------------------------------------------------
  **\#**   **Promesa al equipo       **Cómo se cumple**
           VProperty**               
  -------- ------------------------- ------------------------------------------
  1        Agregar un cliente nuevo  Editando filas en M_Clientes y
           toma menos de una hora,   C_ReglasNegocio. No se toca Make, ni
           sin programador.          Carbone, ni código.

  2        Cambiar una fórmula no    Versionado en C_Formulas + snapshot por
           rompe los informes        solicitud en TX_Calculos.formula_version.
           pasados.                  

  3        Cualquier informe pasado  H_PlantillasAnteriores +
           se puede reproducir bit a H_FormulasAnteriores conservan cada
           bit años después.         versión usada.

  4        Toda decisión del sistema A_Eventos (append-only) +
           es auditable y            A_DecisionesMotor con regla ganadora y
           reconstruible.            descartadas.

  5        Make puede reemplazarse   Make no contiene lógica de negocio. Solo
           por n8n sin reescribir el orquesta. La lógica vive en Airtable.
           negocio.                  
  -----------------------------------------------------------------------------

### Quién debe leer este documento

  -----------------------------------------------------------------------
  **Rol**              **Foco recomendado de lectura**
  -------------------- --------------------------------------------------
  CTO / Arquitecto     Secciones 3, 4, 7, 11, 14, 15. Validar coherencia
  líder                arquitectónica.

  Implementador        Secciones 5, 6, 7, 8, 9 completas. Es el manual de
  Airtable             construcción.

  Ingeniero Make       Secciones 7, 10, 11. Entender qué consulta cada
                       escenario y qué NO debe contener.

  Analista funcional   Secciones 7, 8, 9, 10. Cómo se configura el
                       negocio sin tocar código.

  Dueño del producto   Secciones 1, 9, 16. La promesa, la experiencia,
  (Héctor)             los plazos.

  Equipo VProperty     Sección 9 (formularios). Lo que verán todos los
  operacional          días.
  -----------------------------------------------------------------------

# 2. El equipo detrás del diseño de datos

Diseñar la capa de datos de un sistema enterprise no es trabajo de un
perfil. Ocho especialistas aportaron simultáneamente. Cada decisión que
aparece en este documento pasó por los ocho filtros antes de quedar
firme.

  -----------------------------------------------------------------------
  **Perfil**             **Aporte específico a esta capa de datos**
  ---------------------- ------------------------------------------------
  Arquitecto de Datos    Definió la separación en 6 dominios. Garantiza
  Enterprise             que ningún dominio dependa de otro de forma
                         circular y que cada uno pueda evolucionar por
                         separado.

  Diseñador Senior de BD Normalizó el modelo, definió claves, foreign
  Relacionales           keys explícitas e índices lógicos. Validó que
                         ningún dato vive en dos lugares.

  Especialista en        Tradujo el modelo lógico a tipos de campo
  Airtable               concretos: lookups, rollups, formulas,
                         single/multi select, link records. Diseñó las
                         vistas operativas.

  Arquitecto de Sistemas Definió C_ReglasNegocio, C_Workflows,
  Parametrizables        C_VariablesCliente y el algoritmo de resolución
                         por especificidad y prioridad.

  Ingeniero de           Validó cardinalidades (1:N, N:M), trazó los
  Modelamiento           lookups y rollups críticos, y proyectó volúmenes
                         a 3 años para anticipar cuellos de botella.

  Arquitecto de Motor de Diseñó el lenguaje declarativo de filtros, la
  Reglas                 jerarquía de especificidad y la red de seguridad
                         (regla wildcard).

  Especialista en        Definió el catálogo C_Plantillas, el
  Sistemas Documentales  versionamiento documental, la convención de
                         variables Carbone y la política de retención.

  Diseñador de           Diseñó los 8 formularios pensando en velocidad,
  Experiencia            prevención de errores y captura mínima. Definió
  Operacional            campos dinámicos, dependencias y validaciones.
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **▌ Cómo trabajó el equipo**                                          |
|                                                                       |
| Ningún perfil decidió en solitario. Cada dato, cada campo, cada       |
| relación pasó por mínimo dos firmas: la del diseñador del dominio     |
| respectivo y la del arquitecto de datos. Las reglas de configuración  |
| requieren además la firma del analista funcional. Lo que llega a este |
| documento ya está consensuado.                                        |
+=======================================================================+

# 3. Los 10 principios del diseño de la capa de datos

Antes de modelar tablas o diseñar formularios, el equipo acordó diez
principios que no se rompen. Si una propuesta concreta del documento se
contradice con alguno, gana el principio. Esto es lo que hace al sistema
mantenible durante años.

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #1 · La base de datos es el cerebro, no el almacén**    |
|                                                                       |
| Cada decisión operacional vive como dato consultable en Airtable. Si  |
| una decisión está hardcodeada en Make o en una fórmula de Excel, está |
| mal diseñada. La pregunta no es \'dónde guardo este dato\', sino      |
| \'qué decisión debe tomar el sistema cuando lo lea\'.                 |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #2 · Configuración antes que código**                   |
|                                                                       |
| Si una decisión puede expresarse como una fila en una tabla, nunca se |
| expresará como código. Esto incluye: qué cliente aplica, qué fórmula  |
| usar, qué plantilla, qué destinatarios, qué SLA, qué workflow. Solo   |
| así el negocio puede cambiar el comportamiento sin programadores.     |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #3 · Una sola fuente de verdad por concepto**           |
|                                                                       |
| Cada dato vive en un solo lugar. Las plantillas en C_Plantillas. Las  |
| fórmulas en C_Formulas. Los clientes en M_Clientes. Si un dato        |
| aparece en dos tablas, uno es lookup del otro --- nunca duplicado,    |
| nunca propenso a divergir.                                            |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #4 · Separación estricta de dominios**                  |
|                                                                       |
| Maestros, Configuración, Transacciones, Auditoría, Históricos,        |
| Automatizaciones. Cada tabla pertenece a UN dominio. Las tablas se    |
| relacionan entre dominios solo por foreign keys explícitas. Ningún    |
| dominio escribe en otro dominio fuera de su responsabilidad.          |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #5 · Open/Closed: extender sin modificar**              |
|                                                                       |
| Agregar un nuevo cliente, plantilla, fórmula o workflow nunca         |
| requiere modificar lo que ya está construido. Solo se agregan filas a |
| las tablas de configuración. Esto es lo que garantiza que el sistema  |
| crezca durante años sin acumular deuda técnica.                       |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #6 · Auditoría es ciudadana de primera clase**          |
|                                                                       |
| Cada acción del sistema deja un evento en A_Eventos. Cada decisión    |
| del motor de reglas queda en A_DecisionesMotor con la regla ganadora  |
| y las descartadas. Cada cambio sensible queda en A_Cambios. La        |
| auditoría se diseña al inicio, no al final.                           |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #7 · Idempotencia en todas las escrituras**             |
|                                                                       |
| Ningún registro se inserta dos veces por reintentar un escenario.     |
| Cada inserción verifica el estado previo. Si el registro ya existe,   |
| se actualiza o se omite --- nunca se duplica.                         |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #8 · Versionar antes de modificar**                     |
|                                                                       |
| Cuando una plantilla, fórmula o regla cambia, la versión anterior NO  |
| se borra: se mueve a su tabla H\_ con vigente_hasta marcado. Esto     |
| permite reproducir cualquier informe pasado con exactitud bit a bit.  |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #9 · Validaciones en la base, no en los formularios**   |
|                                                                       |
| Los formularios validan para UX. La base valida para integridad. Una  |
| validación crítica (un RUT único, un campo obligatorio, un FK         |
| consistente) vive en Airtable como fórmula o regla --- el formulario  |
| es solo la primera capa.                                              |
+=======================================================================+

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #10 · Reversibilidad permanente**                       |
|                                                                       |
| En ninguna etapa el sistema bloquea el camino de vuelta. El XLSM      |
| convive como rollback durante la migración. Cada cambio de            |
| configuración queda versionado. Si una nueva versión rompe algo, se   |
| restaura la anterior con un check.                                    |
+=======================================================================+

+-----------------------------------------------------------------------+
| **⚠ Anti-patrones explícitamente prohibidos en esta capa**            |
|                                                                       |
| **✗** IF dentro de Make sobre el negocio. Si necesitas decidir según  |
| cliente o tipo de informe, lo consultas en Airtable.                  |
|                                                                       |
| **✗** Fórmulas en Excel que el sistema use en operación. El XLSM solo |
| es respaldo histórico.                                                |
|                                                                       |
| **✗** Plantillas dentro del código. Cero HTML en Make. Las plantillas |
| son .docx en Dropbox referenciadas desde C_Plantillas.                |
|                                                                       |
| **✗** Lista de emails hardcodeados. Los destinatarios viven en        |
| C_NotificacionesConfig.                                               |
|                                                                       |
| **✗** Datos duplicados entre tablas. Si aparece en dos lugares, uno   |
| debe ser lookup.                                                      |
|                                                                       |
| **✗** Borrar filas en lugar de marcarlas activa=false. Los datos se   |
| conservan; los flags filtran.                                         |
+=======================================================================+

# 4. Arquitectura conceptual: los 7 dominios

La capa de datos se organiza en seis dominios estrictamente separados.
Cada dominio cumple una función única. Las tablas dentro de un dominio
comparten propósito; entre dominios se comunican solo por foreign keys
explícitas. Esta separación es lo que permite que el sistema crezca
durante años sin acoplamientos peligrosos.

### Blueprint general · los 7 dominios

+----------------------+-----------------------+-----------------------+
| **M\_**              | **C\_**               | **TX\_**              |
|                      |                       |                       |
| **Maestros**         | **Configuración**     | **Transacciones**     |
|                      |                       |                       |
| *Entidades estables  | *El comportamiento    | *Los eventos          |
| del negocio:         | del sistema. Reglas,  | operacionales.        |
| clientes, bancos,    | plantillas, fórmulas, | Solicitudes, datos    |
| tasadores, comunas.  | workflows,            | extraídos, cálculos,  |
| Catálogos de         | notificaciones.*      | documentos            |
| referencia.*         |                       | generados.*           |
|                      | **10 tablas**         |                       |
| **8 tablas**         |                       | **7 tablas**          |
+======================+=======================+=======================+
| **A\_**              | **H\_**               | **Z\_**               |
|                      |                       |                       |
| **Auditoría**        | **Históricos**        | **Automatizaciones**  |
|                      |                       |                       |
| *Trazabilidad total. | *Memoria larga.       | *Metadatos del propio |
| Append-only.         | Versiones anteriores  | sistema. Catálogo de  |
| Eventos, decisiones  | de plantillas,        | escenarios Make,      |
| del motor, cambios,  | fórmulas, reglas.     | schedulers,           |
| errores.*            | Solicitudes           | webhooks.*            |
|                      | archivadas.*          |                       |
| **5 tablas**         |                       | **5 tablas**          |
|                      | **5 tablas**          |                       |
+----------------------+-----------------------+-----------------------+

### Cómo se comunican los dominios

Los dominios se comunican por foreign keys explícitas. Pero no todas las
direcciones de comunicación están permitidas. La siguiente matriz
documenta qué dominio puede referenciar a qué dominio.

  ---------------------------------------------------------------------------------
   **Desde \\ Hacia**   **M\_**   **C\_**   **TX\_**   **A\_**   **H\_**   **Z\_**
  -------------------- --------- --------- ---------- --------- --------- ---------
    **M\_ Maestros**    **---**     ---       ---        ---       ---       ---

         **C\_           **✓**     **✓**      ---        ---       ---       ---
    Configuración**                                                       

         **TX\_          **✓**     **✓**     **✓**       ---       ---       ---
    Transacciones**                                                       

   **A\_ Auditoría**     **✓**     **✓**     **✓**     **---**     ---      **✓**

   **H\_ Históricos**    **✓**      ---       ---        ---     **---**     ---

         **Z\_            ---       ---      **✓**       ---       ---      **✓**
   Automatizaciones**                                                     
  ---------------------------------------------------------------------------------

*Lectura: M\_ (maestros) no referencia a nadie. Es la base. C\_
(configuración) referencia maestros para parametrizar. TX\_
(transacciones) referencia todo lo de arriba. A\_ (auditoría) puede
referenciar todo, porque registra todo. H\_ y Z\_ se mantienen aislados
para no contaminar la lógica operacional.*

+-----------------------------------------------------------------------+
| **★ Por qué la separación importa tanto**                             |
|                                                                       |
| Si mañana decides cambiar Airtable por Postgres, o si decides separar |
| la auditoría en una base distinta (porque crece demasiado), la        |
| separación en dominios hace que esa migración sea quirúrgica: tocas   |
| un dominio sin tocar los demás. Esto es exactamente lo que distingue  |
| un sistema enterprise de un sistema que sobrevive solo si nadie lo    |
| toca.                                                                 |
+=======================================================================+

# 5. Blueprint visual: mapa relacional completo

Antes de bajar al detalle de cada tabla, esta sección entrega un mapa
visual del sistema. La idea es que cualquier persona del equipo pueda
imprimir este blueprint y tener al frente la estructura completa del
cerebro del sistema.

### Mapa de tablas por dominio

+-----------------------------------------------------------------------+
| **DOMINIO M\_ · MAESTROS · Entidades estables · 9 tablas**            |
+=======================================================================+
| M_Clientes ········· catálogo de instituciones que solicitan          |
| tasaciones                                                            |
|                                                                       |
| M_Bancos ··········· bancos involucrados en operaciones de crédito    |
|                                                                       |
| M_Tasadores ········ equipo de arquitectos en terreno con zona de     |
| cobertura                                                             |
|                                                                       |
| M_Visadores ········ equipo de revisores con especialidad             |
|                                                                       |
| M_TiposPropiedad ··· casa · depto · terreno · local · bodega ·        |
| agrícola\...                                                          |
|                                                                       |
| M_TiposInforme ····· hipotecario · leasing · seguro · remate ·        |
| estudio                                                               |
|                                                                       |
| M_Comunas ·········· catálogo geográfico con UF/m² promedio           |
|                                                                       |
| M_Productos ········ crédito hipotecario · leasing · seguro ·         |
| inversión                                                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DOMINIO C\_ · CONFIGURACIÓN · Comportamiento del sistema · 16       |
| tablas**                                                              |
+=======================================================================+
| C_ReglasNegocio ····· EL CEREBRO. Mapea contexto → plantilla +        |
| fórmulas + workflow                                                   |
|                                                                       |
| C_Plantillas ········ catálogo versionado de plantillas Carbone       |
| (.docx)                                                               |
|                                                                       |
| C_Formulas ·········· catálogo declarativo de fórmulas de cálculo     |
|                                                                       |
| C_Workflows ········· flujos de ejecución (secuencias de pasos)       |
|                                                                       |
| C_WorkflowPasos ····· pasos individuales que componen cada workflow   |
|                                                                       |
| C_VariablesCliente ·· variables específicas por cliente (logo, textos |
| legales\...)                                                          |
|                                                                       |
| C_NotificacionesConfig destinatarios + plantilla por evento del flujo |
|                                                                       |
| C_SLA ··············· acuerdos de servicio por cliente y tipo de      |
| informe                                                               |
|                                                                       |
| C_Factores ·········· coeficientes parametrizables (% remate, factor  |
| seguro\...)                                                           |
|                                                                       |
| C_Equivalencias ····· mapeos cliente→banco, código externo→interno    |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DOMINIO TX\_ · TRANSACCIONES · Eventos operacionales · 13 tablas**  |
+=======================================================================+
| TX_Solicitudes ········· registro central de cada tasación · state    |
| machine                                                               |
|                                                                       |
| TX_DatosTasacion ······· datos extraídos por Claude e ingresados por  |
| el tasador                                                            |
|                                                                       |
| TX_Calculos ············ resultados de fórmulas con snapshot de       |
| versión                                                               |
|                                                                       |
| TX_Comparables ········· comparables usados para sustentar la         |
| valoración                                                            |
|                                                                       |
| TX_Adjuntos ············ índice de archivos en Dropbox (fotos, PDFs   |
| SII/CBR)                                                              |
|                                                                       |
| TX_DocumentosGenerados · cada PDF generado con versionamiento         |
| completo                                                              |
|                                                                       |
| TX_Notificaciones ······ log de cada email/notificación efectivamente |
| enviada                                                               |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DOMINIO A\_ · AUDITORÍA · Trazabilidad total · append-only · 5      |
| tablas**                                                              |
+=======================================================================+
| A_Eventos ············ log central de toda acción del sistema         |
|                                                                       |
| A_DecisionesMotor ···· cada decisión del motor de reglas con          |
| candidatas                                                            |
|                                                                       |
| A_Cambios ············ audit trail de modificaciones a config /       |
| estados sensibles                                                     |
|                                                                       |
| A_ErroresMake ········ errores capturados por escenarios Make con     |
| resolución                                                            |
|                                                                       |
| A_Accesos ············ quién accedió a qué desde dónde · seguridad    |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DOMINIO H\_ · HISTÓRICOS · Memoria larga · 5 tablas**               |
+=======================================================================+
| H_Solicitudes_Cerradas ····· snapshot de solicitudes cerradas hace    |
| +90 días                                                              |
|                                                                       |
| H_PreciosUF ················ valor diario UF en CLP para reproducir   |
| cálculos                                                              |
|                                                                       |
| H_Comparables_Historico ···· base de comparables crecidos por uso     |
|                                                                       |
| H_PlantillasAnteriores ····· versiones previas de plantillas Carbone  |
|                                                                       |
| H_FormulasAnteriores ······· versiones previas de fórmulas de cálculo |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **DOMINIO Z\_ · AUTOMATIZACIONES · Metadatos del sistema · 5 tablas** |
+=======================================================================+
| Z_EscenariosMake ······ catálogo de escenarios Make con su propósito  |
| y endpoint                                                            |
|                                                                       |
| Z_EjecucionesMake ····· registro de cada ejecución (tiempo, éxito,    |
| módulos)                                                              |
|                                                                       |
| Z_ColaPendientes ······ cola de pasos pendientes en flujos asíncronos |
|                                                                       |
| Z_Webhooks ············ catálogo de webhooks entrantes al sistema     |
|                                                                       |
| Z_Schedulers ·········· jobs programados (cron) con próxima ejecución |
|                                                                       |
| C_AutomationsAirtable ··· inventario de automations y scripts         |
| internos de Airtable (AT01--AT10)                                     |
+-----------------------------------------------------------------------+

### Mapa de relaciones críticas (visual)

*Las siete relaciones que sostienen el sistema. Si alguna se rompe, el
sistema deja de funcionar correctamente. Por eso son las primeras que se
prueban al implementar.*

+---------------------------+-------------+---------------------------+
| **TX_Solicitudes**        | **──→**     | **C_ReglasNegocio**       |
|                           |             |                           |
|                           | *regla      |                           |
|                           | aplicada*   |                           |
+:=========================:+:===========:+:=========================:+
| **C_ReglasNegocio**       | **──→**     | **C_Plantillas**          |
|                           |             |                           |
|                           | *plantilla* |                           |
+---------------------------+-------------+---------------------------+
| **C_ReglasNegocio**       | **──→**     | **C_Formulas**            |
|                           |             |                           |
|                           | *fórmulas   |                           |
|                           | (multi)*    |                           |
+---------------------------+-------------+---------------------------+
| **C_ReglasNegocio**       | **──→**     | **C_Workflows**           |
|                           |             |                           |
|                           | *workflow*  |                           |
+---------------------------+-------------+---------------------------+
| **C_Workflows**           | **──→**     | **C_WorkflowPasos**       |
|                           |             |                           |
|                           | *pasos      |                           |
|                           | ordenados*  |                           |
+---------------------------+-------------+---------------------------+
| **TX_Solicitudes**        | **──→**     | **M_Clientes**            |
|                           |             |                           |
|                           | *cliente*   |                           |
+---------------------------+-------------+---------------------------+
| **TX_Solicitudes**        | **──→**     | **M_Tasadores**           |
|                           |             |                           |
|                           | *tasador*   |                           |
+---------------------------+-------------+---------------------------+

### Blueprint del flujo de decisión central

*Visualización paso a paso de cómo una solicitud entrante se traduce en
un PDF entregado.*

+-------+---------------------------------------------------------------+
| **1** | **Captura de la solicitud (datos mínimos)**                   |
|       |                                                               |
|       | el formulario Next.js IF-01 (externo, app Next.js + Clerk en  |
|       | Railway) o IF-02 (interno, consola Next.js de la ejecutiva)   |
|       | crea fila en TX_Solicitudes con datos básicos: cliente, tipo  |
|       | de informe, tipo de propiedad, comuna, dirección.             |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **2** | **Motor de reglas resuelve el contexto**                      |
|       |                                                               |
|       | C_ReglasNegocio se consulta. Por especificidad + prioridad    |
|       | gana una regla. Resultado: plantilla_id, formulas\[\],        |
|       | workflow_id. Decisión queda en A_DecisionesMotor.             |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **3** | **Asignación automática del tasador**                         |
|       |                                                               |
|       | M_Tasadores se filtra por zonas_cobertura compatible y        |
|       | disponible=true. Se asigna el de menor carga.                 |
|       | TX_Solicitudes.tasador actualizado.                           |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **4** | **Captura en terreno**                                        |
|       |                                                               |
|       | El formulario Next.js IF-03 (app Next.js + Clerk · PWA móvil) |
|       | llena TX_DatosTasacion + TX_Adjuntos. La API Route sube       |
|       | archivos a Dropbox. Webhook a Make dispara los pasos          |
|       | siguientes.                                                   |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **5** | **Extracción IA + Aplicación de fórmulas**                    |
|       |                                                               |
|       | Claude extrae datos estructurados de PDFs SII/CBR →           |
|       | TX_DatosTasacion. Make ejecuta cada fórmula de C_Formulas     |
|       | referenciada por la regla → TX_Calculos.                      |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **6** | **Generación documental con Carbone**                         |
|       |                                                               |
|       | Make arma el JSON. Lee la plantilla activa en C_Plantillas.   |
|       | Llama Carbone.io. PDF se sube a Dropbox.                      |
|       | TX_DocumentosGenerados registra versión + hash.               |
+=======+===============================================================+

**▼**

+-------+---------------------------------------------------------------+
| **7** | **Revisión y entrega**                                        |
|       |                                                               |
|       | F4 (visador) revisa y aprueba/devuelve. Si la regla pide F5   |
|       | (aprobación final), pasa por Héctor. SC13 envía al cliente.   |
|       | Estado = entregada.                                           |
+=======+===============================================================+

# 6. Modelo de datos completo · 45 tablas

Esta sección entrega el detalle implementable de cada una de las 45
tablas. Para cada tabla: propósito, tipo, campos exactos con sus tipos
Airtable, claves, lookups, rollups, fórmulas y validaciones. Es el
documento de construcción de la base.

*Convención de la columna Clave: PK = primary key · FK = foreign key
(link record) · LK = lookup · RU = rollup · ƒ = formula · UQ = único ·
IDX = índice lógico (vista filtrada).*

## 6.1 Dominio M\_ · Maestros

Entidades estables que cambian pocas veces al año. Son referenciadas
desde casi todas las demás tablas. Cambiar un valor aquí (ej. el SLA de
un cliente) afecta solo a las próximas solicitudes.

+----------------+---------------------------------------------------------+
| **M_Clientes** | **Catálogo de instituciones que solicitan tasaciones**  |
|                |                                                         |
|                | *Tipo: Maestra · \~20-50 filas · Cambios mensuales ·    |
|                | Crítica* · undefined                                    |
+================+=========================================================+

  -------------------------------------------------------------------------------------
  **Campo**                **Tipo         **Clave**   **Detalle / lógica de negocio**
                           Airtable**                 
  ------------------------ -------------- ----------- ---------------------------------
  cliente_id               Autonumber     PK          Identificador único interno
                                                      generado automáticamente

  codigo_externo           Single line    UQ          Código que el cliente usa
                           text                       internamente (ej.
                                                      CL-METLIFE-001). Único en la
                                                      tabla

  nombre                   Single line    ---         Razón social. Ej: MetLife Chile,
                           text                       Banco Security

  tipo                     Single select  ---         Opciones: Banco · Compañía de
                                                      seguros · Mutuaria · Caja ·
                                                      Inmobiliaria

  rut                      Single line    UQ          RUT formateado con validación
                           text                       dígito verificador (fórmula en
                                                      Airtable)

  contacto_principal       Single line    ---         Nombre del referente operacional
                           text                       

  email_contacto           Email          ---         Email principal para acuses,
                                                      entregas y notificaciones

  email_secundario         Email          ---         Backup para no perder
                                                      comunicación si rebota el
                                                      principal

  sla_dias_default         Number         ---         SLA por defecto. Reglas
                           (integer)                  específicas viven en C_SLA

  productos                Link →         FK multi    Qué tipos de crédito/seguro
                           M_Productos                maneja. Filtra los tipo_informe
                                                      disponibles en F1

  bancos_asociados         Link →         FK multi    Para compañías de seguros que
                           M_Bancos                   trabajan con varios bancos

  factor_seguro_incendio   Number         ---         \[GAP M-G6\] Atributo comercial
                           (decimal)                  preacordado. Valores 0.8 o 1.0.
                                                      Default 0.8. Lo usa la fórmula
                                                      RB-35. Versionado en A_Cambios al
                                                      modificarse.

  es_leasing               Checkbox       ---         \[GAP M-G5\] Marca si la
                                                      institución es operadora de
                                                      leasing inmobiliario. Lo usa
                                                      RB-16 (alerta). NOTA v2.2
                                                      (NRB-02): el booleano resultó
                                                      INSUFICIENTE para derivar el cap
                                                      rate --- los casos Caspana
                                                      (leasing → 4,5%) y Agencia
                                                      Habitacional (→ 6,0%) demuestran
                                                      que la tasa depende del cliente
                                                      específico, no de si el nombre
                                                      dice "leasing". La derivación del
                                                      cap rate migra al campo
                                                      tasa_cap_rate (ver Adenda v2.2,
                                                      §18.4). es_leasing se conserva
                                                      solo como alerta informativa.

  notas_diseno             Long text      ---         Razón comercial del
                                                      factor_seguro_incendio y otras
                                                      decisiones de parametrización.
                                                      Protege contra R-12 (pérdida de
                                                      conocimiento).

  solicitudes_count        Count link     RU          COUNT(TX_Solicitudes WHERE
                                                      cliente=this). Métrica visible

  activo                   Checkbox       IDX         Solo activos aparecen en
                                                      formularios. Vista filtrada
                                                      \'Clientes activos\'

  creado_en                Created time   ---         Auditoría de alta

  modificado_en            Last modified  ---         Auditoría de última edición
                           time                       
  -------------------------------------------------------------------------------------

+--------------+----------------------------------------------------------+
| **M_Bancos** | **Bancos involucrados en operaciones de crédito**        |
|              |                                                          |
|              | *Tipo: Maestra · \~25 filas · Cambios anuales ·          |
|              | Importante* · undefined                                  |
+==============+==========================================================+

  -----------------------------------------------------------------------------
  **Campo**       **Tipo         **Clave**   **Detalle / lógica de negocio**
                  Airtable**                 
  --------------- -------------- ----------- ----------------------------------
  banco_id        Autonumber     PK          Identificador único interno

  nombre          Single line    UQ          Ej: BCI, Santander, Banco Estado
                  text                       

  codigo_sbif     Single line    UQ          Código oficial SBIF/CMF.
                  text                       Sincronización anual SC20

  nombre_corto    Single line    ---         Versión abreviada para reportes
                  text                       

  activo          Checkbox       IDX         Solo activos en selectores
  -----------------------------------------------------------------------------

+-----------------+-------------------------------------------------------+
| **M_Tasadores** | **Equipo de arquitectos en terreno con zona de        |
|                 | cobertura**                                           |
|                 |                                                       |
|                 | *Tipo: Maestra · \~10-30 filas · Crítica para         |
|                 | asignación automática* · undefined                    |
+=================+=======================================================+

  --------------------------------------------------------------------------------------
  **Campo**                     **Tipo        **Clave**   **Detalle / lógica de
                                Airtable**                negocio**
  ----------------------------- ------------- ----------- ------------------------------
  tasador_id                    Autonumber    PK          Identificador único

  nombre                        Single line   ---         Nombre completo
                                text                      

  rut                           Single line   UQ          Para inclusión en informes y
                                text                      facturación

  email                         Email         ---         Recibe el link a la app
                                                          Next.js · IF-03 al ser
                                                          asignado

  telefono                      Phone         ---         Para contacto operativo si
                                                          urge

  zonas_cobertura               Link →        FK multi    Comunas que el tasador cubre.
                                M_Comunas                 Filtro de asignación
                                                          automática

  especialidades                Multi select  ---         Residencial · Comercial ·
                                                          Industrial · Agrícola

  capacidad_activa              Number        ---         Nº máximo de solicitudes
                                                          concurrentes que puede atender

  casos_en_curso                Count link    RU          COUNT(TX_Solicitudes WHERE
                                                          tasador=this AND estado IN
                                                          \[asignada, visitada,
                                                          calculada\])

  disponible                    Formula       ƒ           IF(casos_en_curso \<
                                                          capacidad_activa, TRUE, FALSE)

  solicitudes_completadas_30d   Rollup        RU          COUNT en TX_Solicitudes con
                                                          fecha_entrega últimos 30 días

  tiempo_promedio_visita_dias   Rollup        RU          AVERAGE de DATEDIFF(asignada →
                                                          visitada)

  activo                        Checkbox      IDX         Solo activos en asignación
  --------------------------------------------------------------------------------------

+-----------------+-------------------------------------------------------+
| **M_Visadores** | **Equipo de revisores con especialidad**              |
|                 |                                                       |
|                 | *Tipo: Maestra · \~5-10 filas · Importante para       |
|                 | asignación de revisión* · undefined                   |
+=================+=======================================================+

  -----------------------------------------------------------------------------------
  **Campo**             **Tipo         **Clave**   **Detalle / lógica de negocio**
                        Airtable**                 
  --------------------- -------------- ----------- ----------------------------------
  visador_id            Autonumber     PK          Identificador único

  nombre                Single line    ---         Nombre completo
                        text                       

  email                 Email          ---         Para notificación de PDF pendiente
                                                   de revisión

  especialidades        Multi select   ---         Residencial · Comercial · Agrícola
                                                   · Industrial

  firma_url             URL            ---         \[GAP M-G4\] URL en Dropbox de la
                                                   imagen de firma (PNG
                                                   transparente). Inyectada por
                                                   Carbone en el PDF cuando este
                                                   visador aprueba. Resuelve RB-28
                                                   sin código hardcodeado.

  casos_en_cola         Count link     RU          COUNT(TX_Solicitudes WHERE
                                                   visador=this AND estado=pdf_listo)

  tasa_devolucion_30d   Rollup         RU          \% de solicitudes devueltas vs
                                                   aprobadas en los últimos 30 días

  activo                Checkbox       IDX         Solo activos en asignación
  -----------------------------------------------------------------------------------

+----------------------+--------------------------------------------------+
| **M_TiposPropiedad** | **Catálogo cerrado de tipos de propiedad**       |
|                      |                                                  |
|                      | *Tipo: Maestra · \~10 filas · Cambios muy raros* |
|                      | · undefined                                      |
+======================+==================================================+

  --------------------------------------------------------------------------------------
  **Campo**                     **Tipo        **Clave**   **Detalle / lógica de
                                Airtable**                negocio**
  ----------------------------- ------------- ----------- ------------------------------
  tipo_propiedad_id             Autonumber    PK          Identificador único

  nombre                        Single line   UQ          Casa · Departamento · Terreno
                                text                      · Local · Bodega · Industrial
                                                          · Agrícola · Estacionamiento

  categoria                     Single select ---         Residencial · Comercial ·
                                                          Industrial · Rural

  requiere_plano                Checkbox      ---         Si requiere plano además de
                                                          fotos

  pronombre                     Single line   ---         \[GAP M-G1\] \'la\' / \'el\'
                                text                      según género gramatical. Lo
                                                          usa Carbone para el texto
                                                          descriptivo (RB-1, RB-22).

  etiqueta_numerica             Single line   ---         \[GAP M-G1\] Ej: \'Nº de
                                text                      departamento\', \'Rol del
                                                          terreno\'. Lo usa F3 y la
                                                          plantilla (RB-2).

  etiqueta_nombre               Single line   ---         \[GAP M-G1\] Texto que aparece
                                text                      en el informe para identificar
                                                          el tipo (RB-2).

  num_fotos_minimas             Number        ---         \[GAP M-G1\] Mínimo de fotos
                                (integer)                 en F3 para este tipo. Casa 8,
                                                          Depto 10, Terreno 6 (RB-40).

  vida_util_default             Number        ---         \[GAP M-G1\] Vida útil por
                                (integer)                 defecto. Editable según año en
                                                          C_VidaUtil. TERRENO: 10
                                                          urbano, 20 rural (RB-40).

  num_pisos_default             Number        ---         \[GAP M-G1\] Pisos típicos.
                                (integer)                 Casa 2, Depto 1, Local 1
                                                          (RB-40).

  coef_valoracion               Number        ---         \[GAP M-G1\] Coeficiente del
                                (decimal)                 tipo en la fórmula de valor
                                                          edificación (RB-5: AT en
                                                          BD51). Casa 1.0, Depto 1.05,
                                                          Local 0.9.

  layout_columnas_json          Long text     ---         \[GAP M-G1\] Orden de columnas
                                (JSON)                    del cuadro de valoración según
                                                          tipo (RB-2, RB-40).

  requiere_subtipo              Checkbox      ---         Si exige subtipo en F1 (ej.
                                                          Estacionamiento → U/Goce /
                                                          Descubierto / Cubierto).

  subtipos_validos              Multi select  ---         \[GAP M-G7\] Lista cerrada de
                                                          subtipos. Incluye los 4
                                                          valores de exclusión seguro
                                                          (RB-35): U/Goce, Descubierto,
                                                          Terreno, S/Reg No
                                                          Regularizable.

  agrupacion_propiedad_aplica   Checkbox      ---         \[GAP M-G1\] Si para este tipo
                                                          aplica el campo
                                                          agrupacion_propiedad en F3.
                                                          Usado por RB-20 (asbesto
                                                          pre-1995).

  campos_extra_json             Long text     ---         Campos adicionales que el F3
                                (JSON)                    debe mostrar para este tipo
                                                          (ej. piso, edificio)

  activo                        Checkbox      IDX         Solo activos en formularios
  --------------------------------------------------------------------------------------

+--------------------+----------------------------------------------------+
| **M_TiposInforme** | **Catálogo cerrado de tipos de informe             |
|                    | entregables**                                      |
|                    |                                                    |
|                    | *Tipo: Maestra · \~8-12 filas* · undefined         |
+====================+====================================================+

  --------------------------------------------------------------------------------------
  **Campo**                   **Tipo         **Clave**   **Detalle / lógica de negocio**
                              Airtable**                 
  --------------------------- -------------- ----------- -------------------------------
  tipo_informe_id             Autonumber     PK          Identificador único

  nombre                      Single line    UQ          Hipotecario · Leasing · Seguro
                              text                       · Remate · Estudio de Mercado ·
                                                         Tasación Judicial · Avalúo
                                                         Comercial

  descripcion                 Long text      ---         Para qué se usa este tipo de
                                                         informe

  requiere_aprobacion_final   Checkbox       ---         Si este tipo siempre necesita
                                                         F5 (Héctor)

  monto_umbral_uf             Number         ---         Sobre este monto requiere
                                                         aprobación final aunque el tipo
                                                         no lo exija siempre

  activo                      Checkbox       IDX         Solo activos
  --------------------------------------------------------------------------------------

+---------------+--------------------------------------------------------+
| **M_Comunas** | **Catálogo geográfico de comunas chilenas**            |
|               |                                                        |
|               | *Tipo: Maestra · \~346 filas · Estable* · undefined    |
+===============+========================================================+

+--------------------------------+--------------------+--------------------+----------------------------+
| **Campo**                      | **Tipo Airtable**  | **Clave**          | **Detalle / lógica de      |
|                                |                    |                    | negocio**                  |
+================================+====================+====================+============================+
| comuna_id                      | Autonumber         | PK                 | Identificador único        |
+--------------------------------+--------------------+--------------------+----------------------------+
| nombre                         | Single line text   | ---                | Nombre oficial de la       |
|                                |                    |                    | comuna                     |
+--------------------------------+--------------------+--------------------+----------------------------+
| region                         | Single select      | ---                | RM · V · VI · \... (15     |
|                                |                    |                    | regiones)                  |
+--------------------------------+--------------------+--------------------+----------------------------+
| provincia                      | Single line text   | ---                | Provincia administrativa   |
+--------------------------------+--------------------+--------------------+----------------------------+
| uf_m2_terreno                  | Number             | ---                | \[GAP M-G2\] Valor UF/m²   |
|                                |                    |                    | para terreno desnudo.      |
|                                |                    |                    | Usado por RB-4 (valor      |
|                                |                    |                    | terreno).                  |
+--------------------------------+--------------------+--------------------+----------------------------+
| uf_m2_construccion             | Number             | ---                | \[GAP M-G2\] Valor UF/m²   |
|                                |                    |                    | para construcción          |
|                                |                    |                    | terminada. Base previa al  |
|                                |                    |                    | lookup en                  |
|                                |                    |                    | C_PreciosUnitarios (RB-5). |
+--------------------------------+--------------------+--------------------+----------------------------+
| uf_m2_promedio_residencial     | Number             | ---                | Referencia para validar    |
|                                |                    |                    | valoraciones residenciales |
+--------------------------------+--------------------+--------------------+----------------------------+
| uf_m2_promedio_comercial       | Number             | ---                | Referencia para uso        |
|                                |                    |                    | comercial                  |
+--------------------------------+--------------------+--------------------+----------------------------+
| fecha_ultimo_estudio           | Date               | ---                | Cuándo se actualizó el     |
|                                |                    |                    | promedio                   |
+--------------------------------+--------------------+--------------------+----------------------------+
| tasadores_count                | Count link         | RU                 | COUNT(M_Tasadores que      |
|                                |                    |                    | cubren esta comuna)        |
+--------------------------------+--------------------+--------------------+----------------------------+
| activo                         | Checkbox           | IDX                | Solo activas               |
+--------------------------------+--------------------+--------------------+----------------------------+
| **➕ Campos nuevos v2.4 · M_Comunas (VProperty_Analisis_Diseno_V23_v01)**                             |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_sup_min_m2**            | Number             | ---                | \[GAP-AN01\] Exigencia     |
|                                |                    |                    | municipal: superficie      |
|                                |                    |                    | mínima del predio (m²).    |
|                                |                    |                    | Origen XLSM: Antecedentes  |
|                                |                    |                    | BL15.                      |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_frente_min_m**          | Number             | ---                | \[GAP-AN01\] Exigencia:    |
|                                |                    |                    | frente mínimo (m). Origen  |
|                                |                    |                    | XLSM: BL16.                |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_ocupacion_pct**         | Number             | ---                | \[GAP-AN01\] Exigencia:    |
|                                |                    |                    | porcentaje de ocupación de |
|                                |                    |                    | suelo. Origen XLSM: BL17.  |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_constructibilidad**     | Number             | ---                | \[GAP-AN01\] Exigencia:    |
|                                |                    |                    | coeficiente de             |
|                                |                    |                    | constructibilidad. Origen  |
|                                |                    |                    | XLSM: BL18.                |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_altura_m**              | Number             | ---                | \[GAP-AN01\] Exigencia:    |
|                                |                    |                    | altura máxima (m). Origen  |
|                                |                    |                    | XLSM: BJ19.                |
+--------------------------------+--------------------+--------------------+----------------------------+
| **exig_distancia_medianero_m** | Number             | ---                | \[GAP-AN01\] Exigencia:    |
|                                |                    |                    | distancia mínima a         |
|                                |                    |                    | medianero (m).             |
+--------------------------------+--------------------+--------------------+----------------------------+
| **uso_habitacional_pct**       | Number             | ---                | \[GAP-PO02\] % suelo uso   |
|                                |                    |                    | habitacional en la zona.   |
|                                |                    |                    | Origen XLSM: Portada AP23. |
+--------------------------------+--------------------+--------------------+----------------------------+
| **uso_comercial_pct**          | Number             | ---                | \[GAP-PO02\] % suelo uso   |
|                                |                    |                    | comercial. Origen XLSM:    |
|                                |                    |                    | AP24.                      |
+--------------------------------+--------------------+--------------------+----------------------------+
| **uso_industrial_pct**         | Number             | ---                | \[GAP-PO02\] % suelo uso   |
|                                |                    |                    | industrial. Origen XLSM:   |
|                                |                    |                    | AP25.                      |
+--------------------------------+--------------------+--------------------+----------------------------+
| **uso_baldio_pct**             | Number             | ---                | \[GAP-PO02\] % suelo       |
|                                |                    |                    | baldío/verde. Origen XLSM: |
|                                |                    |                    | AP26.                      |
+--------------------------------+--------------------+--------------------+----------------------------+
| **proy_uso_habitacional_pct**  | Number             | ---                | \[GAP-PO02\] % proyectado  |
|                                |                    |                    | uso habitacional. Origen   |
|                                |                    |                    | XLSM: AX23.                |
+--------------------------------+--------------------+--------------------+----------------------------+
| **proy_uso_comercial_pct**     | Number             | ---                | \[GAP-PO02\] % proyectado  |
|                                |                    |                    | uso comercial. Origen      |
|                                |                    |                    | XLSM: AX24.                |
+--------------------------------+--------------------+--------------------+----------------------------+
| **proy_uso_industrial_pct**    | Number             | ---                | \[GAP-PO02\] % proyectado  |
|                                |                    |                    | uso industrial. Origen     |
|                                |                    |                    | XLSM: AX25.                |
+--------------------------------+--------------------+--------------------+----------------------------+

+-----------------+-------------------------------------------------------+
| **M_Productos** | **Productos comerciales habilitados**                 |
|                 |                                                       |
|                 | *Tipo: Maestra · \~10-15 filas* · undefined           |
+=================+=======================================================+

  ---------------------------------------------------------------------------------------
  **Campo**                       **Tipo        **Clave**   **Detalle / lógica de
                                  Airtable**                negocio**
  ------------------------------- ------------- ----------- -----------------------------
  producto_id                     Autonumber    PK          Identificador único

  nombre                          Single line   UQ          Ej: Crédito Hipotecario ·
                                  text                      Leasing Habitacional · Seguro
                                                            de Incendio

  categoria                       Single select ---         Crédito · Leasing · Seguro ·
                                                            Inversión

  requiere_valor_remate           Checkbox      ---         Si este producto exige
                                                            cálculo de valor de remate en
                                                            el informe

  requiere_costo_reconstruccion   Checkbox      ---         Si exige cálculo de costo de
                                                            reconstrucción

  activo                          Checkbox      IDX         Solo activos
  ---------------------------------------------------------------------------------------

+--------------------+-----------------------------------------------------+
| **M_Zonificacion** | **\[GAP M-G3\] Lookup de atributos urbanos por      |
|                    | comuna + zona**                                     |
|                    |                                                     |
|                    | *Tipo: Maestra · \~2.744 filas · Estable · Migrada  |
|                    | del XLSM · undefined*                               |
+====================+=====================================================+

Tabla agregada en la adenda v2.1 tras la auditoría XLSM. Sustituye el
lookup INDEX/MATCH de la hoja oculta \'Zonificacion\' del Excel (2.744
filas × 31 columnas). Resuelve RB-3, RB-33 y RB-41. La carga inicial
migra el contenido del XLSM 1:1.

  ------------------------------------------------------------------------------------
  **Campo**                  **Tipo         **Clave**   **Detalle / lógica de
                             Airtable**                 negocio**
  -------------------------- -------------- ----------- ------------------------------
  zonificacion_id            Autonumber     PK          Identificador único

  comuna                     Link →         FK          Comuna a la que pertenece la
                             M_Comunas                  zona

  zona                       Single line    ---         Nombre / código de la zona
                             text                       dentro de la comuna

  zona_compuesta             Formula        ƒ           comuna.nombre & \'·\' & zona.
                                                        Clave compuesta de búsqueda
                                                        (RB-3)

  tipo_zona                  Single select  ---         Urbano · Rural · Mixto.
                                                        Determina alcantarillado
                                                        (RB-33)

  demanda                    Single select  ---         Alta · Media · Baja (RB-41)

  tendencia                  Single select  ---         Creciente · Estable ·
                                                        Decreciente (RB-41)

  densidad                   Single select  ---         Alta · Media · Baja (RB-41)

  nivel_socioeconomico       Single select  ---         ABC1 · C2 · C3 · D · E (RB-41)

  calzada                    Single select  ---         Pavimento · Asfalto · Tierra ·
                                                        Sin acceso (RB-41)

  alcantarillado             Formula        ƒ           IF(tipo_zona=\'Urbano\', TRUE,
                                                        FALSE) (RB-33)

  transporte_publico         Single select  ---         Alto · Medio · Bajo · Nulo
                                                        (RB-41)

  comercio                   Single select  ---         Alto · Medio · Bajo · Nulo
                                                        (RB-41)

  areas_verdes               Single select  ---         Alto · Medio · Bajo · Nulo
                                                        (RB-41)

  prc_sector                 Single line    ---         Plan Regulador Comunal del
                             text                       sector. Usado por RB-44

  coef_ocupacion_suelo_max   Number         ---         Coef. máximo permitido según
                             (decimal)                  PRC. Comparado con el
                                                        calculado (RB-44)

  origen_xlsm_celda          Single line    ---         Trazabilidad: qué fila del
                             text                       XLSM lo originó

  activo                     Checkbox       IDX         Solo activos en lookups
  ------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Sobre M_Zonificacion**                                            |
|                                                                       |
| Es la tabla más grande del dominio M\_ (2.744 filas). Se carga una    |
| sola vez al migrar el XLSM. Los lookups por zona son rápidos porque   |
| Airtable indexa los FK. Una zona nueva (cambio de PRC, urbanización)  |
| se ingresa por F7.                                                    |
+-----------------------------------------------------------------------+

## 6.2 Dominio C\_ · Configuración

El dominio del comportamiento del sistema. Es donde el negocio puede
modificar cómo funciona el sistema sin tocar código. Si una decisión
puede vivir como una fila en alguna de estas tablas, NUNCA vive como
código en Make.

+---------------------+---------------------------------------------------+
| **C_ReglasNegocio** | **EL CEREBRO. Cada fila mapea contexto →          |
|                     | configuración aplicable**                         |
|                     |                                                   |
|                     | *Tipo: Configuración crítica · \~50-300 filas ·   |
|                     | Cambios mensuales* · B42318                       |
+=====================+===================================================+

  ------------------------------------------------------------------------------------------
  **Campo**                   **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  --------------------------- ------------------ ----------- -------------------------------
  regla_id                    Autonumber         PK          Identificador único

  nombre                      Single line text   ---         Descriptivo: \'MetLife ·
                                                             Hipotecario · Depto en Las
                                                             Condes\'

  descripcion                 Long text          ---         Por qué existe esta regla.
                                                             DOCUMENTACIÓN VIVA

  cliente_filter              Link → M_Clientes  FK multi    Vacío = aplica a todos. Filtro
                                                             por cliente

  banco_filter                Link → M_Bancos    FK multi    Vacío = todos los bancos

  tipo_informe_filter         Link →             FK multi    Vacío = todos los tipos
                              M_TiposInforme                 

  tipo_prop_filter            Link →             FK multi    Vacío = todas las propiedades
                              M_TiposPropiedad               

  comuna_filter               Link → M_Comunas   FK multi    Vacío = todas las comunas

  region_filter               Multi select       ---         Alternativa más gruesa que
                                                             comuna

  producto_filter             Link → M_Productos FK multi    Vacío = todos los productos

  monto_min_uf                Number             ---         La regla aplica solo si avalúo
                                                             ≥ este valor. Vacío = sin
                                                             mínimo

  monto_max_uf                Number             ---         La regla aplica solo si avalúo
                                                             ≤ este valor. Vacío = sin
                                                             máximo

  plantilla_resultado         Link →             FK          Plantilla que esta regla impone
                              C_Plantillas                   

  formulas_resultado          Link → C_Formulas  FK multi    Lista de fórmulas a aplicar

  workflow_resultado          Link → C_Workflows FK          Workflow de ejecución

  factores_aplicables         Link → C_Factores  FK multi    Coeficientes específicos (%
                                                             remate, factor seguro\...)

  requiere_aprobacion_final   Checkbox           ---         Override del valor del
                                                             tipo_informe

  prioridad                   Number (1-999)     ---         A mayor número, gana ante
                                                             empate de especificidad

  especificidad               Formula            ƒ           COUNT(filters no vacíos). A
                                                             mayor especificidad, gana

  vigente_desde               Date               ---         Antes de esta fecha no se
                                                             considera

  vigente_hasta               Date               ---         Después de esta fecha no se
                                                             considera. Vacío = sin
                                                             vencimiento

  es_wildcard                 Formula            ƒ           IF(especificidad=0, TRUE,
                                                             FALSE). Identifica la red de
                                                             seguridad

  activa                      Checkbox           IDX         Inactivas nunca se consideran

  veces_aplicada              Count link         RU          COUNT(TX_Solicitudes WHERE
                                                             regla_aplicada=this)
  ------------------------------------------------------------------------------------------

+------------------+---------------------------------------------------------+
| **C_Plantillas** | **Catálogo versionado de plantillas Carbone (.docx)**   |
|                  |                                                         |
|                  | *Tipo: Configuración · \~30-100 filas · Cambios         |
|                  | frecuentes (versiones)* · undefined                     |
+==================+=========================================================+

  -------------------------------------------------------------------------------------------
  **Campo**              **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ---------------------- ------------------ ----------- -------------------------------------
  plantilla_id           Autonumber         PK          Identificador único

  nombre                 Single line text   ---         Formato: \'{Cliente} {TipoInforme}
                                                        {TipoPropiedad} v{N.M}\'

  cliente                Link → M_Clientes  FK          A qué cliente pertenece (o
                                                        \'Genérica\' para plantilla base)

  tipo_informe           Link →             FK          Para qué tipo de informe sirve
                         M_TiposInforme                 

  tipo_propiedad         Link →             FK multi    Tipos de propiedad que cubre
                         M_TiposPropiedad               

  version                Single line text   ---         Formato semántico: v3.2

  archivo_docx_url       URL                ---         Link directo al .docx en Dropbox

  variables_esperadas    Long text (JSON)   ---         Schema JSON del payload que Carbone
                                                        necesita. Validable

  activa                 Checkbox           IDX UQ      Solo UNA activa por combinación
                                                        cliente+tipo_informe+tipo_propiedad

  vigente_desde          Date               ---         Fecha de activación

  vigente_hasta          Date               ---         Si está desactivada, fecha de retiro

  cambios_version        Long text          ---         Changelog. Documenta qué cambió
                                                        respecto a la versión previa

  autor_ultima_version   Created by         ---         Quién subió esta versión

  veces_usada            Count link         RU          COUNT(TX_DocumentosGenerados con esta
                                                        plantilla)
  -------------------------------------------------------------------------------------------

+----------------+--------------------------------------------------------+
| **C_Formulas** | **Catálogo declarativo de fórmulas. Reemplaza la       |
|                | lógica del XLSM**                                      |
|                |                                                        |
|                | *Tipo: Configuración crítica · \~30-80 filas* ·        |
|                | undefined                                              |
+================+========================================================+

  -----------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ------------------------- ------------------ ----------- --------------------------------
  formula_id                Autonumber         PK          Identificador único

  nombre                    Single line text   UQ          Ej: \'F_ValorRemate_65\',
                                                           \'F_UFm2_construccion\'

  nombre_legible            Single line text   ---         Versión humana: \'Valor de
                                                           remate al 65% del comercial\'

  categoria                 Single select      ---         Valoración · UF/m² · Seguro ·
                                                           Avalúo · Remate · Reconstrucción

  expresion                 Long text          ƒ           Expresión declarativa. Ej:
                                                           \'valor_comercial \*
                                                           factor_remate\'

  variables_input           Long text (JSON)   ---         Array: \[{nombre:
                                                           \'valor_comercial\', tipo:
                                                           \'number\'}, \...\]

  variable_output           Single line text   ---         Nombre con el que se guarda el
                                                           resultado en TX_Calculos

  unidad_output             Single select      ---         UF · CLP · USD · m² · %

  aplica_a_tipo_informe     Link →             FK multi    Tipos donde se usa
                            M_TiposInforme                 

  aplica_a_tipo_propiedad   Link →             FK multi    Propiedades donde aplica
                            M_TiposPropiedad               

  version                   Single line text   ---         v1.0, v1.1\...

  activa                    Checkbox           IDX         Solo activas se ejecutan

  origen_xlsm               Long text          ---         Documenta de qué celda XLSM se
                                                           migró (para auditoría)

  caso_de_prueba_json       Long text          ---         Ejemplo de inputs y output
                                                           esperado. Para test automático

  veces_ejecutada           Count link         RU          COUNT(TX_Calculos con esta
                                                           fórmula)
  -----------------------------------------------------------------------------------------

+-----------------+-------------------------------------------------------+
| **C_Workflows** | **Flujos de ejecución (secuencias de pasos)**         |
|                 |                                                       |
|                 | *Tipo: Configuración · \~10-20 filas* · undefined     |
+=================+=======================================================+

  ---------------------------------------------------------------------------------
  **Campo**        **Tipo Airtable** **Clave**   **Detalle / lógica de negocio**
  ---------------- ----------------- ----------- ----------------------------------
  workflow_id      Autonumber        PK          Identificador único

  nombre           Single line text  UQ          Ej: \'WF_Hipotecario_Estandar\',
                                                 \'WF_Hipotecario_Premium\'

  descripcion      Long text         ---         Para qué casos sirve

  pasos            Link →            FK multi    Pasos asociados (ordenados por
                   C_WorkflowPasos               campo \'orden\')

  pasos_count      Count link        RU          Cantidad total de pasos

  sla_dias_total   Number            ---         SLA esperado del workflow completo

  activa           Checkbox          IDX         Solo activos se consideran
  ---------------------------------------------------------------------------------

+---------------------+--------------------------------------------------+
| **C_WorkflowPasos** | **Pasos individuales que componen cada           |
|                     | workflow**                                       |
|                     |                                                  |
|                     | *Tipo: Configuración · \~30-80 filas* ·          |
|                     | undefined                                        |
+=====================+==================================================+

  -----------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ------------------------- ------------------ ----------- --------------------------------
  paso_id                   Autonumber         PK          Identificador único

  workflow                  Link → C_Workflows FK          A qué workflow pertenece

  orden                     Number             ---         1, 2, 3\... Define la secuencia

  nombre_paso               Single line text   ---         Descriptivo: \'Asignar
                                                           tasador\', \'Notificar visador\'

  accion                    Single select      ---         Catálogo cerrado:
                                                           asignar_tasador · notif_email ·
                                                           claude_extract ·
                                                           aplicar_formulas · generar_pdf ·
                                                           \...

  escenario_make            Link →             FK          Qué escenario Make ejecuta este
                            Z_EscenariosMake               paso

  parametros                Long text (JSON)   ---         Parámetros específicos del paso

  requiere_humano           Checkbox           ---         Si pausa esperando acción humana
                                                           (visita, revisión)

  timeout_horas             Number             ---         Tiempo máximo antes de alertar
                                                           SLA

  paso_siguiente_si_ok      Link →             FK          Siguiente paso si éste sale OK
                            C_WorkflowPasos                

  paso_siguiente_si_error   Link →             FK          Path alternativo si falla (ej.
                            C_WorkflowPasos                volver al tasador)
  -----------------------------------------------------------------------------------------

+------------------------+-------------------------------------------------+
| **C_VariablesCliente** | **Variables específicas que cada cliente        |
|                        | inyecta en su informe**                         |
|                        |                                                 |
|                        | *Tipo: Configuración · \~5-15 filas por         |
|                        | cliente* · undefined                            |
+========================+=================================================+

  -----------------------------------------------------------------------------
  **Campo**       **Tipo         **Clave**   **Detalle / lógica de negocio**
                  Airtable**                 
  --------------- -------------- ----------- ----------------------------------
  variable_id     Autonumber     PK          Identificador único

  cliente         Link →         FK          A qué cliente pertenece
                  M_Clientes                 

  clave           Single line    ---         Ej: \'logo_url\', \'pie_legal\',
                  text                       \'firma_apoderado_url\'

  valor           Long text      ---         El valor a inyectar (texto, URL,
                                             número)

  tipo            Single select  ---         string · number · url · image ·
                                             html_safe

  activa          Checkbox       IDX         Solo activas se inyectan
  -----------------------------------------------------------------------------

+----------------------------+---------------------------------------------+
| **C_NotificacionesConfig** | **Define qué notificación se dispara,       |
|                            | cuándo y a quién**                          |
|                            |                                             |
|                            | *Tipo: Configuración · \~20-50 filas* ·     |
|                            | undefined                                   |
+============================+=============================================+

  ------------------------------------------------------------------------------------
  **Campo**               **Tipo         **Clave**   **Detalle / lógica de negocio**
                          Airtable**                 
  ----------------------- -------------- ----------- ---------------------------------
  notif_id                Autonumber     PK          Identificador único

  evento                  Single select  IDX         solicitud_creada ·
                                                     tasador_asignado · pdf_listo ·
                                                     sla_vencido · entregada · \...

  workflow                Link →         FK          Vacío = aplica a todos los
                          C_Workflows                workflows

  cliente_filter          Link →         FK multi    Vacío = aplica a todos los
                          M_Clientes                 clientes

  destinatarios_to_modo   Single select  ---         lista_fija · referencia_dinamica
                                                     (ej. tasador.email)

  destinatarios_to        Long text      ---         Lista de emails o expresión
                                                     dinámica

  destinatarios_cc        Long text      ---         CC opcional

  destinatarios_bcc       Long text      ---         BCC opcional

  plantilla_asunto        Single line    ---         Con placeholders {{codigo_ext}},
                          text                       {{cliente.nombre}}

  plantilla_cuerpo        Long text      ---         Cuerpo del email con placeholders

  canal                   Single select  ---         gmail · slack · whatsapp · sms

  adjuntar_pdf            Checkbox       ---         Si debe adjuntar el PDF final de
                                                     la solicitud

  activa                  Checkbox       IDX         Solo activas se disparan
  ------------------------------------------------------------------------------------

+-----------+-----------------------------------------------------------+
| **C_SLA** | **Acuerdos de nivel de servicio diferenciados**           |
|           |                                                           |
|           | *Tipo: Configuración · \~15-30 filas* · undefined         |
+===========+===========================================================+

  ----------------------------------------------------------------------------------------
  **Campo**              **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ---------------------- ------------------ ----------- ----------------------------------
  sla_id                 Autonumber         PK          Identificador único

  cliente                Link → M_Clientes  FK          Cliente al que aplica

  tipo_informe           Link →             FK          Tipo de informe al que aplica
                         M_TiposInforme                 

  tipo_propiedad         Link →             FK          Opcional. Vacío = todos
                         M_TiposPropiedad               

  dias_totales           Number             ---         Días desde solicitud_creada hasta
                                                        entregada

  dias_alerta_amarilla   Number             ---         A qué día emitir alerta amarilla

  dias_alerta_roja       Number             ---         A qué día emitir alerta roja

  activo                 Checkbox           IDX         Solo activos
  ----------------------------------------------------------------------------------------

+----------------+---------------------------------------------------------+
| **C_Factores** | **Coeficientes parametrizables por contexto**           |
|                |                                                         |
|                | *Tipo: Configuración · \~20-50 filas* · undefined       |
+================+=========================================================+

  -----------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ------------------------- ------------------ ----------- --------------------------------
  factor_id                 Autonumber         PK          Identificador único

  nombre                    Single line text   UQ          Ej:
                                                           \'FACTOR_REMATE_HIPOTECARIO\',
                                                           \'FACTOR_SEGURO_INCENDIO\'

  valor                     Number (decimal)   ---         Ej: 0.65, 1.15

  unidad                    Single select      ---         porcentaje · multiplicador ·
                                                           valor_absoluto_uf

  aplica_a_clientes         Link → M_Clientes  FK multi    Vacío = global

  aplica_a_tipo_informe     Link →             FK multi    Vacío = todos
                            M_TiposInforme                 

  aplica_a_tipo_propiedad   Link →             FK multi    Vacío = todos
                            M_TiposPropiedad               

  vigente_desde             Date               ---         Histórico de cambios

  vigente_hasta             Date               ---         Vacío = vigente

  activo                    Checkbox           IDX         Solo activos se aplican
  -----------------------------------------------------------------------------------------

+---------------------+----------------------------------------------------+
| **C_Equivalencias** | **Mapeos entre códigos externos e internos**       |
|                     |                                                    |
|                     | *Tipo: Configuración · \~50-200 filas · Para       |
|                     | integraciones* · undefined                         |
+=====================+====================================================+

  --------------------------------------------------------------------------------
  **Campo**          **Tipo         **Clave**   **Detalle / lógica de negocio**
                     Airtable**                 
  ------------------ -------------- ----------- ----------------------------------
  equivalencia_id    Autonumber     PK          Identificador único

  origen             Single select  ---         metlife · security · bci · sbif ·
                                                \... (sistema externo)

  concepto           Single select  ---         tipo_propiedad · tipo_informe ·
                                                banco · producto

  codigo_externo     Single line    ---         Cómo lo llama el sistema externo
                     text                       

  valor_interno      Single line    ---         Cómo lo llamamos nosotros
                     text                       

  tabla_referencia   Single line    ---         Ej: \'M_TiposPropiedad\'. Permite
                     text                       resolver al record_id

  activa             Checkbox       IDX         Solo activas
  --------------------------------------------------------------------------------

+------------------------+-------------------------------------------------+
| **C_PreciosUnitarios** | **\[GAP C-G1\] Valores UF/m² nuevo por tipo ×   |
|                        | material × calidad**                            |
|                        |                                                 |
|                        | *Tipo: Configuración · \~200-500 filas ·        |
|                        | Crítica para valoración · undefined*            |
+========================+=================================================+

Tabla agregada en la adenda v2.1. Sustituye la tabla \'BA\' de la
Portada del XLSM. Resuelve RB-5 y RB-9. La fórmula de valor_edificacion
lee aquí el precio unitario nuevo y luego aplica los coeficientes de
depreciación.

  ----------------------------------------------------------------------------------------
  **Campo**               **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ----------------------- ------------------ ----------- ---------------------------------
  precio_id               Autonumber         PK          Identificador único

  tipo_propiedad          Link →             FK          Tipo al que aplica el precio
                          M_TiposPropiedad               

  material_predominante   Single select      ---         Hormigón armado · Albañilería ·
                                                         Madera · Mixto · Acero

  calidad_construccion    Number (1-5)       ---         Estrella 1-5. Se cruza con F3.B5

  uf_m2_nuevo             Number (decimal)   ---         UF/m² para construcción nueva
                                                         (sin depreciación)

  fuente_dato             Single select      ---         Estudio mercado · INE · Cliente ·
                                                         Propio

  vigente_desde           Date               ---         Cuándo entra en vigor

  vigente_hasta           Date               ---         Vacío = vigente

  origen_xlsm_celda       Single line text   ---         Trazabilidad: celda del XLSM

  activo                  Checkbox           IDX         Solo activos se aplican
  ----------------------------------------------------------------------------------------

+----------------+---------------------------------------------------------+
| **C_VidaUtil** | **\[GAP C-G2\] Tramos de vida útil por año de           |
|                | construcción**                                          |
|                |                                                         |
|                | *Tipo: Configuración · \~7-10 filas · Estable ·         |
|                | undefined*                                              |
+================+=========================================================+

Tabla agregada en la adenda v2.1. Sustituye el IF anidado del XLSM
(RB-7). Es la base del cálculo de antigüedad relativa y del Factor de
Depreciación (RB-10).

  -------------------------------------------------------------------------------------
  **Campo**           **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ------------------- ------------------ ----------- ----------------------------------
  vida_util_id        Autonumber         PK          Identificador único

  anio_min            Number (integer)   ---         Año de construcción mínimo del
                                                     tramo (inclusivo)

  anio_max            Number (integer)   ---         Año de construcción máximo del
                                                     tramo (exclusivo)

  vida_util_anios     Number (integer)   ---         Vida útil en años para este tramo

  tipo_propiedad      Link →             FK multi    Vacío = todos. Permite tablas
                      M_TiposPropiedad               distintas por tipo

  origen_xlsm_celda   Single line text   ---         Trazabilidad

  activo              Checkbox           IDX         Solo activos
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Carga inicial de C_VidaUtil (del XLSM, RB-7)**                    |
|                                                                       |
| 7 filas: (\<1970, 40) · (1970-1980, 45) · (1980-1990, 50) ·           |
| (1990-2000, 55) · (2000-2010, 60) · (2010-2018, 65) · (2018-2070,     |
| 70). TERRENO requiere lógica según zona urbana/rural                  |
| (M_Zonificacion.tipo_zona).                                           |
+-----------------------------------------------------------------------+

+----------------+--------------------------------------------------------+
| **C_Feriados** | **\[GAP C-G3\] Calendario de feriados Chile para SLA   |
|                | hábil**                                                |
|                |                                                        |
|                | *Tipo: Configuración · \~10-15 filas/año ·             |
|                | Actualización anual · undefined*                       |
+================+========================================================+

Tabla agregada en la adenda v2.1. Sustituye el rango Variables!F del
XLSM. Resuelve RB-15 (visado = visita + 2 días hábiles) y RB-45.
Renovación obligatoria cada 1 de noviembre.

  --------------------------------------------------------------------------------
  **Campo**          **Tipo         **Clave**   **Detalle / lógica de negocio**
                     Airtable**                 
  ------------------ -------------- ----------- ----------------------------------
  feriado_id         Autonumber     PK          Identificador único

  fecha              Date           UQ          Fecha exacta del feriado

  nombre             Single line    ---         Ej: \'Año Nuevo\', \'Fiestas
                     text                       Patrias\'

  tipo               Single select  ---         Civil · Religioso · Regional ·
                                                Bancario

  es_irrenunciable   Checkbox       ---         Por ley laboral. No hábil para
                                                visita en terreno

  activo             Checkbox       IDX         Solo activos en cálculo SLA
  --------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Carga inicial 2026 (del XLSM, RB-45)**                            |
|                                                                       |
| 01-01 · 03-04 (Viernes Santo) · 01-05 · 21-05 · 29-06 · 16-07 · 18-09 |
| · 12-10 · 08-12 · 25-12. Total 10 fechas. SC18 recuerda al admin      |
| recargar cada noviembre.                                              |
+-----------------------------------------------------------------------+

+------------------------+-----------------------------------------------+
| **C_TramosHonorarios** | **\[GAP C-G4\] Honorarios por tramos de UF    |
|                        | tasada**                                      |
|                        |                                               |
|                        | *Tipo: Configuración · \~10-20 filas ·        |
|                        | Cambios anuales · undefined*                  |
+========================+===============================================+

Tabla agregada en la adenda v2.1. Sustituye la tabla de honorarios del
XLSM (RB-26). Con el reparto 90/10 (RB-11) permite calcular
liquidaciones automáticamente.

  ------------------------------------------------------------------------------
  **Campo**        **Tipo         **Clave**   **Detalle / lógica de negocio**
                   Airtable**                 
  ---------------- -------------- ----------- ----------------------------------
  tramo_id         Autonumber     PK          Identificador único

  uf_min           Number         ---         Valor UF mínimo del tramo
                                              (inclusivo)

  uf_max           Number         ---         Valor UF máximo (exclusivo). Vacío
                                              = sin techo

  honorario_uf     Number         ---         Monto en UF a cobrar al cliente
                   (decimal)                  

  pct_tasador      Number         ---         Default 0.90 (90%). Reparto al
                   (decimal)                  tasador

  pct_empresa      Number         ---         Default 0.10 (10%). Reparto a
                   (decimal)                  VProperty

  cliente_filter   Link →         FK multi    Vacío = todos. Tarifas especiales
                   M_Clientes                 por institución

  vigente_desde    Date           ---         Cuándo entra en vigor

  activo           Checkbox       IDX         Solo activos
  ------------------------------------------------------------------------------

+-----------------------+----------------------------------------------+
| **C_TramosBienComun** | **\[GAP C-G5\] Valorización de bien común    |
|                       | por tramos de m² (depto leasing)**           |
|                       |                                              |
|                       | *Tipo: Configuración · \~4-6 filas ·         |
|                       | undefined*                                   |
+=======================+==============================================+

Tabla agregada en la adenda v2.1. Sustituye la lógica condicional
anidada del XLSM (RB-32). Solo aplica a departamentos en leasing.

  ---------------------------------------------------------------------------------
  **Campo**            **Tipo         **Clave**   **Detalle / lógica de negocio**
                       Airtable**                 
  -------------------- -------------- ----------- ---------------------------------
  tramo_id             Autonumber     PK          Identificador único

  sup_terreno_min_m2   Number         ---         Mínimo de superficie de terreno
                                                  del edificio

  sup_terreno_max_m2   Number         ---         Máximo (exclusivo). Vacío = sin
                                                  techo

  pct_bien_comun       Number         ---         Porcentaje del valor D11 aplicado
                       (decimal)                  como bien común

  activo               Checkbox       IDX         Solo activos
  ---------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Carga inicial (del XLSM, RB-32)**                                 |
|                                                                       |
| 4 filas: (0,1200,0.20) · (1200,2500,0.40) · (2500,30000,0.30) ·       |
| (30000, vacío,0.20). Solo si M_Clientes.es_leasing=true Y             |
| tipo=\'Departamento\'.                                                |
+-----------------------------------------------------------------------+

+-------------------------------+---------------------------------------+
| **C_FactoresHomogeneizacion** | **\[GAP C-G6\] Factores de ajuste     |
|                               | para homogeneizar comparables**       |
|                               |                                       |
|                               | *Tipo: Configuración · \~20-40 filas  |
|                               | · undefined*                          |
+===============================+=======================================+

Tabla agregada en la adenda v2.1. Sustituye las funciones
MuestraColumnaMinima/Maxima del módulo ExportarBICE del XLSM (RB-24).
Ajusta comparables por antigüedad, distancia, superficie antes de
promediar.

  ----------------------------------------------------------------------------------
  **Campo**        **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ---------------- ------------------ ----------- ----------------------------------
  factor_homo_id   Autonumber         PK          Identificador único

  eje              Single select      ---         antiguedad_meses · distancia_km ·
                                                  sup_construccion · sup_terreno ·
                                                  piso

  diferencia_min   Number             ---         Diferencia mínima del eje
                                                  (inclusivo)

  diferencia_max   Number             ---         Diferencia máxima del eje
                                                  (exclusivo). Ej: 3 para ±3 meses

  factor_ajuste    Number (decimal)   ---         Multiplicador aplicado al precio
                                                  del comparable

  tipo_propiedad   Link →             FK multi    Vacío = todos
                   M_TiposPropiedad               

  activo           Checkbox           IDX         Solo activos
  ----------------------------------------------------------------------------------

## 6.3 Dominio TX\_ · Transacciones

Una fila por evento operacional. Esta es la zona caliente del sistema,
con alta tasa de inserts y updates. Cada solicitud genera múltiples
filas distribuidas en estas tablas: las 7 originales más las 2 agregadas
en v2.1 (ItemsCuadroValoracion · ObrasComplementarias) y las 4
incorporadas en v2.3 (Ampliaciones · HabitacionesPorNivel ·
TerminacionesPorRecinto · DocumentosLegales). Lo único que el equipo
VProperty ve a diario son vistas filtradas de estas tablas.

+--------------------+-------------------------------------------------------+
| **TX_Solicitudes** | **Registro central de cada tasación · state machine** |
|                    |                                                       |
|                    | *Tipo: Transaccional principal · \~500/mes · La tabla |
|                    | más activa* · 2E7D32                                  |
+====================+=======================================================+

+-------------------------+--------------------+--------------------+------------------------------------+
| **Campo**               | **Tipo Airtable**  | **Clave**          | **Detalle / lógica de negocio**    |
+=========================+====================+====================+====================================+
| solicitud_id            | Autonumber         | PK                 | Identificador interno              |
+-------------------------+--------------------+--------------------+------------------------------------+
| codigo_ext              | Formula            | ƒ                  | \'VP-\' & YEAR(fecha_solicitud) &  |
|                         |                    |                    | \'-\' &                            |
|                         |                    |                    | LPAD(solicitud_id,4,\'0\'). Ej:    |
|                         |                    |                    | VP-2026-0524                       |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_solicitud         | Date               | ---                | Cuándo se recibió                  |
+-------------------------+--------------------+--------------------+------------------------------------+
| cliente                 | Link → M_Clientes  | FK                 | Cliente solicitante                |
+-------------------------+--------------------+--------------------+------------------------------------+
| cliente_codigo          | Lookup             | LK                 | Trae M_Clientes.codigo_externo     |
+-------------------------+--------------------+--------------------+------------------------------------+
| banco                   | Link → M_Bancos    | FK                 | Banco involucrado si aplica        |
+-------------------------+--------------------+--------------------+------------------------------------+
| tipo_informe            | Link →             | FK                 | Tipo de informe solicitado         |
|                         | M_TiposInforme     |                    |                                    |
+-------------------------+--------------------+--------------------+------------------------------------+
| tipo_propiedad          | Link →             | FK                 | Tipo de propiedad                  |
|                         | M_TiposPropiedad   |                    |                                    |
+-------------------------+--------------------+--------------------+------------------------------------+
| producto                | Link → M_Productos | FK                 | Producto comercial específico      |
+-------------------------+--------------------+--------------------+------------------------------------+
| comuna                  | Link → M_Comunas   | FK                 | Comuna de la propiedad             |
+-------------------------+--------------------+--------------------+------------------------------------+
| direccion               | Single line text   | ---                | Calle + número + complemento       |
+-------------------------+--------------------+--------------------+------------------------------------+
| rol_sii                 | Single line text   | ---                | Rol SII si llega en la solicitud,  |
|                         |                    |                    | o lo extrae Claude después         |
+-------------------------+--------------------+--------------------+------------------------------------+
| cliente_final_nombre    | Single line text   | ---                | Persona dueña de la propiedad (no  |
|                         |                    |                    | el cliente institucional)          |
+-------------------------+--------------------+--------------------+------------------------------------+
| cliente_final_rut       | Single line text   | ---                | RUT del propietario final          |
+-------------------------+--------------------+--------------------+------------------------------------+
| monto_estimado_uf       | Number             | ---                | Estimado del cliente al solicitar. |
|                         |                    |                    | Opcional                           |
+-------------------------+--------------------+--------------------+------------------------------------+
| tasador                 | Link → M_Tasadores | FK                 | Asignado automáticamente por SC04  |
+-------------------------+--------------------+--------------------+------------------------------------+
| visador                 | Link → M_Visadores | FK                 | Asignado por carga                 |
+-------------------------+--------------------+--------------------+------------------------------------+
| regla_aplicada          | Link →             | FK                 | Qué regla resolvió la              |
|                         | C_ReglasNegocio    |                    | configuración                      |
+-------------------------+--------------------+--------------------+------------------------------------+
| plantilla               | Lookup             | LK                 | Vista desde                        |
|                         |                    |                    | regla_aplicada.plantilla_resultado |
+-------------------------+--------------------+--------------------+------------------------------------+
| formulas                | Lookup             | LK                 | Vista desde                        |
|                         |                    |                    | regla_aplicada.formulas_resultado  |
+-------------------------+--------------------+--------------------+------------------------------------+
| workflow                | Lookup             | LK                 | Vista desde                        |
|                         |                    |                    | regla_aplicada.workflow_resultado  |
+-------------------------+--------------------+--------------------+------------------------------------+
| sla_aplicable           | Lookup / Formula   | LK                 | Días SLA según C_SLA matcheando    |
|                         |                    |                    | cliente+tipo                       |
+-------------------------+--------------------+--------------------+------------------------------------+
| estado                  | Single select      | IDX                | creada · asignada · visitada ·     |
|                         |                    |                    | calculada · pdf_listo · devuelta · |
|                         |                    |                    | aprobada · pendiente_final ·       |
|                         |                    |                    | entregada · cerrada · cancelada ·  |
|                         |                    |                    | requiere_atencion                  |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_asignacion        | Date               | ---                | Cuándo se asignó al tasador        |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_visita_programada | Date               | ---                | Fecha estimada de visita           |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_visita            | Date               | ---                | Fecha real de visita               |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_entrega           | Date               | ---                | Cuándo se envió al cliente         |
+-------------------------+--------------------+--------------------+------------------------------------+
| fecha_cierre            | Date               | ---                | Cuándo se cerró (7 días post       |
|                         |                    |                    | entrega sin reclamos)              |
+-------------------------+--------------------+--------------------+------------------------------------+
| dias_desde_solicitud    | Formula            | ƒ                  | DATETIME_DIFF(NOW(),               |
|                         |                    |                    | fecha_solicitud, \'days\')         |
+-------------------------+--------------------+--------------------+------------------------------------+
| sla_estado              | Formula            | ƒ                  | Verde / Amarillo / Rojo según      |
|                         |                    |                    | dias_desde_solicitud vs            |
|                         |                    |                    | sla_aplicable                      |
+-------------------------+--------------------+--------------------+------------------------------------+
| pdf_final_url           | URL                | ---                | Link al PDF vigente generado       |
+-------------------------+--------------------+--------------------+------------------------------------+
| observaciones_internas  | Long text          | ---                | Notas que solo el equipo VProperty |
|                         |                    |                    | ve                                 |
+-------------------------+--------------------+--------------------+------------------------------------+
| hora_visita             | Duration           | ---                | \[v2.3\] Hora real de la visita en |
|                         |                    |                    | terreno. Origen XLSM: FICHA SOLIC  |
|                         |                    |                    | N10 + planilla madre col F. Si     |
|                         |                    |                    | difiere, la planilla madre es      |
|                         |                    |                    | autoritativa.                      |
+-------------------------+--------------------+--------------------+------------------------------------+
| hora_entrega            | Duration           | ---                | \[v2.3\] Hora comprometida de      |
|                         |                    |                    | entrega del informe al cliente.    |
|                         |                    |                    | Origen XLSM: FICHA SOLIC N11.      |
+-------------------------+--------------------+--------------------+------------------------------------+
| profesion_solicitante   | Single line text   | ---                | \[v2.3\] Profesión que declara el  |
|                         |                    |                    | solicitante institucional. Origen  |
|                         |                    |                    | XLSM: Portada AE7. Default         |
|                         |                    |                    | heredado de                        |
|                         |                    |                    | M_Clientes.profesion_default; este |
|                         |                    |                    | campo permite override por caso.   |
+-------------------------+--------------------+--------------------+------------------------------------+
| contacto_observaciones  | Long text          | ---                | \[v2.3\] Datos de contacto         |
|                         |                    |                    | adicionales y restricciones de     |
|                         |                    |                    | acceso a la propiedad. Origen      |
|                         |                    |                    | XLSM: FICHA SOLIC K20 + planilla   |
|                         |                    |                    | madre col S. Pasa por capa de      |
|                         |                    |                    | saneamiento (§18.3).               |
+-------------------------+--------------------+--------------------+------------------------------------+
| **➕ Campos nuevos v2.4 · TX_Solicitudes (VProperty_Analisis_Diseno_V23_v01)**                         |
+-------------------------+--------------------+--------------------+------------------------------------+
| **codigo_corto**        | Single line text   | ---                | \[GAP-FS01\] Código de 4 dígitos   |
|                         |                    |                    | para FICHA SOLIC H8. Derivado de   |
|                         |                    |                    | numero_solicitud (últimos 4        |
|                         |                    |                    | dígitos).                          |
+-------------------------+--------------------+--------------------+------------------------------------+
| **vivienda_social**     | Single select      | ---                | \[GAP-FS03\] Si/No. Default 'Si'   |
|                         |                    |                    | en la plantilla. Origen XLSM:      |
|                         |                    |                    | FICHA SOLIC K34.                   |
+-------------------------+--------------------+--------------------+------------------------------------+
| **ejecutivo**           | Single line text   | ---                | \[GAP-FS02\] Nombre del ejecutivo  |
|                         |                    |                    | del cliente. Ej: MONICA REYES      |
|                         |                    |                    | PINTO. Origen XLSM: FICHA SOLIC    |
|                         |                    |                    | F16.                               |
+-------------------------+--------------------+--------------------+------------------------------------+
| **contacto_nombre**     | Single line text   | ---                | Mejora V23: nombre de contacto     |
|                         |                    |                    | dedicado. Evita parsear            |
|                         |                    |                    | contacto_observaciones.            |
+-------------------------+--------------------+--------------------+------------------------------------+
| **contacto_fono**       | Single line text   | ---                | Mejora V23: teléfono de contacto   |
|                         |                    |                    | dedicado. Evita parsear            |
|                         |                    |                    | contacto_observaciones.            |
+-------------------------+--------------------+--------------------+------------------------------------+
| **casa_numero**         | Single line text   | ---                | Mejora V23: número de dirección    |
|                         |                    |                    | dedicado (ej. N°2100). Evita       |
|                         |                    |                    | parsear dirección.                 |
+-------------------------+--------------------+--------------------+------------------------------------+
| **➕ Campos nuevos v2.6 · TX_Solicitudes (datos del solicitante / OV)**                                |
+-------------------------+--------------------+--------------------+------------------------------------+
| solicitante_nombre      | Single line text   | ---                | \[v2.6\] Nombre del solicitante    |
|                         |                    |                    | final (persona natural o titular   |
|                         |                    |                    | del trámite tras el cliente        |
|                         |                    |                    | institucional). Distinto de        |
|                         |                    |                    | cliente_final_nombre cuando        |
|                         |                    |                    | aplica.                            |
+-------------------------+--------------------+--------------------+------------------------------------+
| solicitante_telefono    | Phone number       | ---                | \[v2.6\] Teléfono de contacto del  |
|                         |                    |                    | solicitante. Formato libre,        |
|                         |                    |                    | validación básica de longitud      |
|                         |                    |                    | mínima.                            |
+-------------------------+--------------------+--------------------+------------------------------------+
| n_operacion_cliente     | Single line text   | ---                | \[v2.6\] Número de operación       |
|                         |                    |                    | interna del cliente institucional. |
|                         |                    |                    | Identificador externo opaco para   |
|                         |                    |                    | VProperty; útil para cruces de     |
|                         |                    |                    | conciliación con el sistema del    |
|                         |                    |                    | cliente.                           |
+-------------------------+--------------------+--------------------+------------------------------------+
| sucursal_originadora    | Single line text   | ---                | \[v2.6\] Sucursal del cliente      |
|                         |                    |                    | institucional desde la que se      |
|                         |                    |                    | originó la solicitud. Texto libre  |
|                         |                    |                    | por ahora; en futuro puede         |
|                         |                    |                    | convertirse en Link a una tabla    |
|                         |                    |                    | M_Sucursales si crece el catálogo. |
+-------------------------+--------------------+--------------------+------------------------------------+
| ejecutivo_solicitante   | Single line text   | ---                | \[v2.6\] Nombre del ejecutivo del  |
|                         |                    |                    | cliente que originó la solicitud.  |
|                         |                    |                    | Distinto del campo ejecutivo v2.4  |
|                         |                    |                    | (mantenido por compatibilidad);    |
|                         |                    |                    | este campo es el nombre operativo  |
|                         |                    |                    | capturado en el alta.              |
+-------------------------+--------------------+--------------------+------------------------------------+
| comision_ov             | Number (decimal ·  | ---                | \[v2.6 · TBD-09\] Comisión /       |
|                         | 4 dec)             |                    | proporción asociada a la operación |
|                         |                    |                    | de valorización (OV). Valor        |
|                         |                    |                    | decimal entre 0 y 1 (ej.: 0.8250). |
|                         |                    |                    | Pendiente confirmación de nombre   |
|                         |                    |                    | exacto y semántica con negocio     |
|                         |                    |                    | antes de productivo (ver §7        |
|                         |                    |                    | TBD-09).                           |
+-------------------------+--------------------+--------------------+------------------------------------+

+----------------------+---------------------------------------------------+
| **TX_DatosTasacion** | **Datos extraídos por Claude desde PDFs y del     |
|                      | formulario Next.js del tasador (IF-03)**          |
|                      |                                                   |
|                      | *Tipo: Transaccional · 1 por solicitud* · 2E7D32  |
+======================+===================================================+

+-----------------------------------+--------------------+--------------------+---------------------------+
| **Campo**                         | **Tipo Airtable**  | **Clave**          | **Detalle / lógica de     |
|                                   |                    |                    | negocio**                 |
+===================================+====================+====================+===========================+
| dato_id                           | Autonumber         | PK                 | Identificador único       |
+-----------------------------------+--------------------+--------------------+---------------------------+
| solicitud                         | Link →             | FK UQ              | 1 a 1 con la solicitud    |
|                                   | TX_Solicitudes     |                    |                           |
+-----------------------------------+--------------------+--------------------+---------------------------+
| rol_sii                           | Single line text   | ---                | Claude extrae del PDF SII |
+-----------------------------------+--------------------+--------------------+---------------------------+
| avaluo_total                      | Currency CLP       | ---                | Claude extrae del SII.    |
|                                   |                    |                    | NOTA v2.2 (NRB-07): el    |
|                                   |                    |                    | avalúo puede llegar como  |
|                                   |                    |                    | texto "NO REGISTRA" (caso |
|                                   |                    |                    | Exequiel) que rompe el    |
|                                   |                    |                    | tipo Currency. La captura |
|                                   |                    |                    | cruda pasa por la capa de |
|                                   |                    |                    | saneamiento (§18.3): si   |
|                                   |                    |                    | no es numérico se         |
|                                   |                    |                    | normaliza a null y se     |
|                                   |                    |                    | activa el flag            |
|                                   |                    |                    | avaluo_no_registra. El    |
|                                   |                    |                    | campo numérico nunca      |
|                                   |                    |                    | recibe texto.             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| avaluo_exento                     | Currency CLP       | ---                | Claude extrae             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| contribucion_anual                | Currency CLP       | ---                | Claude extrae             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| deuda_contrib                     | Currency CLP       | ---                | Claude extrae             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| sup_terreno_m2                    | Number             | ---                | Del formulario Next.js    |
|                                   |                    |                    | IF-03 (tasador) o         |
|                                   |                    |                    | extraído del CBR          |
+-----------------------------------+--------------------+--------------------+---------------------------+
| sup_construccion_m2               | Number             | ---                | Del formulario Next.js    |
|                                   |                    |                    | IF-03 (tasador)           |
+-----------------------------------+--------------------+--------------------+---------------------------+
| sup_primer_piso_m2                | Number (decimal)   | ---                | \[GAP TX-G4b\] Superficie |
|                                   |                    |                    | del primer piso. Usado    |
|                                   |                    |                    | por RB-44 (coef.          |
|                                   |                    |                    | ocupación de suelo).      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| servidumbre_m2                    | Number (decimal)   | ---                | \[GAP TX-G4b\] Superficie |
|                                   |                    |                    | afecta a servidumbre.     |
|                                   |                    |                    | Resta en el denominador   |
|                                   |                    |                    | del coef. de ocupación    |
|                                   |                    |                    | (RB-44).                  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| anio_construccion                 | Number             | ---                | Aproximado, ingresado por |
|                                   |                    |                    | tasador                   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| agrupacion_propiedad              | Single select      | ---                | \[GAP TX-G4a\] Aislada ·  |
|                                   |                    |                    | Pareada · Continua ·      |
|                                   |                    |                    | Edificio · Condominio.    |
|                                   |                    |                    | Usado por RB-20 (alerta   |
|                                   |                    |                    | asbesto si                |
|                                   |                    |                    | Edificio/Condominio y     |
|                                   |                    |                    | año\<1995).               |
+-----------------------------------+--------------------+--------------------+---------------------------+
| permiso_edif_num                  | Single line text   | ---                | Número del permiso de     |
|                                   |                    |                    | edificación               |
+-----------------------------------+--------------------+--------------------+---------------------------+
| recepcion_final                   | Single line text   | ---                | Si es vivienda nueva con  |
|                                   |                    |                    | recepción                 |
+-----------------------------------+--------------------+--------------------+---------------------------+
| estado_conservacion               | Single select      | ---                | Bueno · Regular · Malo ·  |
|                                   |                    |                    | Muy malo                  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| material_predominante             | Single select      | ---                | Hormigón · Albañilería ·  |
|                                   |                    |                    | Madera · Mixto            |
+-----------------------------------+--------------------+--------------------+---------------------------+
| calidad_construccion              | Number (1-5)       | ---                | Estrella 1-5. Se cruza    |
|                                   |                    |                    | con C_PreciosUnitarios    |
|                                   |                    |                    | para el UF/m² nuevo       |
|                                   |                    |                    | (RB-5).                   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| velocidad_venta_estimada          | Single select      | ---                | \[GAP TX-G5\] 9 tramos:   |
|                                   |                    |                    | 1-2m ... +24m.            |
|                                   |                    |                    | Obligatorio si            |
|                                   |                    |                    | tipo_informe ∈            |
|                                   |                    |                    | {Hipotecario, Remate,     |
|                                   |                    |                    | Liquidación}. De aquí     |
|                                   |                    |                    | sale el Factor de Remate  |
|                                   |                    |                    | vía C_Factores (RB-37,    |
|                                   |                    |                    | RB-8).                    |
+-----------------------------------+--------------------+--------------------+---------------------------+
| pisos                             | Number             | ---                | Si depto: piso. Si casa:  |
|                                   |                    |                    | número de pisos           |
+-----------------------------------+--------------------+--------------------+---------------------------+
| dormitorios                       | Number             | ---                | Cantidad                  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| banos                             | Number             | ---                | Cantidad                  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| estacionamientos                  | Number             | ---                | Cantidad                  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| roles_estacionamientos            | Long text          | ---                | \[GAP TX-G2\] Lista de    |
|                                   |                    |                    | roles SII de los          |
|                                   |                    |                    | estacionamientos,         |
|                                   |                    |                    | separados por coma. La    |
|                                   |                    |                    | cantidad debe coincidir   |
|                                   |                    |                    | con estacionamientos      |
|                                   |                    |                    | (RB-17, RB-46).           |
+-----------------------------------+--------------------+--------------------+---------------------------+
| bodegas                           | Number             | ---                | Cantidad de bodegas.      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| roles_bodegas                     | Long text          | ---                | \[GAP TX-G2\] Lista de    |
|                                   |                    |                    | roles SII de las bodegas, |
|                                   |                    |                    | separados por coma. La    |
|                                   |                    |                    | cantidad debe coincidir   |
|                                   |                    |                    | con bodegas (RB-17,       |
|                                   |                    |                    | RB-46).                   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| sintesis_descriptiva              | Long text          | ---                | Texto redactado por       |
|                                   |                    |                    | Claude para el informe    |
+-----------------------------------+--------------------+--------------------+---------------------------+
| descripcion_sector                | Long text          | ---                | Texto redactado por       |
|                                   |                    |                    | Claude sobre el sector    |
+-----------------------------------+--------------------+--------------------+---------------------------+
| observaciones_ia                  | Long text          | ---                | Notas que Claude marca    |
|                                   |                    |                    | para revisión del visador |
+-----------------------------------+--------------------+--------------------+---------------------------+
| observaciones_tasador             | Long text          | ---                | Notas del tasador en      |
|                                   |                    |                    | terreno                   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| fuente_dato                       | Multi select       | ---                | sii · cbr · permiso ·     |
|                                   |                    |                    | tasador · claude ·        |
|                                   |                    |                    | cliente                   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| confianza_ia_pct                  | Number             | ---                | Score de confianza que    |
|                                   |                    |                    | Claude reporta (0-100)    |
+-----------------------------------+--------------------+--------------------+---------------------------+
| extraido_en                       | Datetime           | ---                | Timestamp del             |
|                                   |                    |                    | procesamiento Claude      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| n_permiso_edificacion             | Single line text   | ---                | \[v2.3\] N° y fecha del   |
|                                   |                    |                    | permiso de edificación    |
|                                   |                    |                    | (formato libre del Anexo  |
|                                   |                    |                    | 2 PDF). Ej: \'N°319       |
|                                   |                    |                    | 09/09/2020\'. Sustituye   |
|                                   |                    |                    | al campo legacy           |
|                                   |                    |                    | permiso_edif_num cuando   |
|                                   |                    |                    | se conoce el detalle      |
|                                   |                    |                    | completo.                 |
+-----------------------------------+--------------------+--------------------+---------------------------+
| fecha_permiso_edif                | Date               | ---                | \[v2.3\] Fecha del        |
|                                   |                    |                    | permiso de edificación,   |
|                                   |                    |                    | normalizada desde         |
|                                   |                    |                    | n_permiso_edificacion.    |
+-----------------------------------+--------------------+--------------------+---------------------------+
| n_recepcion_final                 | Single line text   | ---                | \[v2.3\] N° y fecha de la |
|                                   |                    |                    | recepción final           |
|                                   |                    |                    | municipal. Origen: Anexo  |
|                                   |                    |                    | 2 PDF + Antecedentes J8.  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| fecha_recepcion_final             | Date               | ---                | \[v2.3\] Fecha de la      |
|                                   |                    |                    | recepción final,          |
|                                   |                    |                    | normalizada.              |
+-----------------------------------+--------------------+--------------------+---------------------------+
| n_cert_no_expropiacion            | Single line text   | ---                | \[v2.3\] N° del           |
|                                   |                    |                    | certificado de no         |
|                                   |                    |                    | expropiación SERVIU. Ej:  |
|                                   |                    |                    | \'3444743\'. El documento |
|                                   |                    |                    | PDF se persiste en        |
|                                   |                    |                    | TX_DocumentosLegales con  |
|                                   |                    |                    | cross-link en             |
|                                   |                    |                    | TX_Adjuntos.              |
+-----------------------------------+--------------------+--------------------+---------------------------+
| plano_propiedad_si                | Checkbox           | ---                | \[v2.3\] Existe plano de  |
|                                   |                    |                    | propiedad disponible.     |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | B9.                       |
+-----------------------------------+--------------------+--------------------+---------------------------+
| condiciones_previas               | Checkbox           | ---                | \[v2.3\] La propiedad     |
|                                   |                    |                    | presenta condiciones      |
|                                   |                    |                    | previas relevantes.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | B11.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| certif_hipoteca                   | Checkbox           | ---                | \[v2.3\] Existe           |
|                                   |                    |                    | certificado de            |
|                                   |                    |                    | hipoteca/gravamen         |
|                                   |                    |                    | vigente. Origen XLSM:     |
|                                   |                    |                    | Antecedentes B12.         |
+-----------------------------------+--------------------+--------------------+---------------------------+
| servidumbres_terreno              | Checkbox           | ---                | \[v2.3\] La propiedad     |
|                                   |                    |                    | está afecta a             |
|                                   |                    |                    | servidumbres de paso de   |
|                                   |                    |                    | terceros (Antecedentes    |
|                                   |                    |                    | B13). ATENCIÓN semántica  |
|                                   |                    |                    | (RB-44.5): distinto de la |
|                                   |                    |                    | servidumbre del propio    |
|                                   |                    |                    | predio que aparece como   |
|                                   |                    |                    | ítem del cuadro de        |
|                                   |                    |                    | valoración.               |
+-----------------------------------+--------------------+--------------------+---------------------------+
| arteria_principal                 | Single line text   | ---                | \[v2.3\] Nombre de la     |
|                                   |                    |                    | arteria/calle principal   |
|                                   |                    |                    | que da acceso al predio.  |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | BD19.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| terreno_forma                     | Single select      | ---                | \[v2.3\] Regular ·        |
|                                   |                    |                    | Irregular · Triangular ·  |
|                                   |                    |                    | Trapezoidal. Origen XLSM: |
|                                   |                    |                    | Antecedentes AS22.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| terreno_pendiente                 | Single select      | ---                | \[v2.3\] Plano · Suave ·  |
|                                   |                    |                    | Pronunciada. Origen XLSM: |
|                                   |                    |                    | Antecedentes AS23.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| terreno_frente_m                  | Number (decimal)   | ---                | \[v2.3\] Frente del       |
|                                   |                    |                    | terreno en metros. Origen |
|                                   |                    |                    | XLSM: Antecedentes BF21.  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| terreno_contrafrente_m            | Number (decimal)   | ---                | \[v2.3\] Contrafrente del |
|                                   |                    |                    | terreno en metros. Origen |
|                                   |                    |                    | XLSM: Antecedentes BF22.  |
+-----------------------------------+--------------------+--------------------+---------------------------+
| vista_norte                       | Single line text   | ---                | \[v2.3\] Vista hacia el   |
|                                   |                    |                    | norte (descripción        |
|                                   |                    |                    | breve). Origen XLSM:      |
|                                   |                    |                    | Antecedentes BA23.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| vista_sur                         | Single line text   | ---                | \[v2.3\] Vista hacia el   |
|                                   |                    |                    | sur. Origen XLSM:         |
|                                   |                    |                    | Antecedentes BA24.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| fuente_dato_municipal             | Single line text   | ---                | \[v2.3\] Origen declarado |
|                                   |                    |                    | de los datos              |
|                                   |                    |                    | municipales/normativos.   |
|                                   |                    |                    | Ej: \'DOM, Plano          |
|                                   |                    |                    | Catastro\'. Origen XLSM:  |
|                                   |                    |                    | Portada BL25.             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| sello_sec                         | Single line text   | ---                | \[v2.3\] Estado del sello |
|                                   |                    |                    | SEC. Valores: Verde ·     |
|                                   |                    |                    | Rojo · Amarillo · Sin     |
|                                   |                    |                    | Sello Visible · No Aplica |
|                                   |                    |                    | · No Aplica/Full          |
|                                   |                    |                    | eléctrico. Origen XLSM:   |
|                                   |                    |                    | Portada BL26.             |
+-----------------------------------+--------------------+--------------------+---------------------------+
| jardin_conformado                 | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | B21.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| aspiracion_central                | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | J21.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| calefaccion                       | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | S21.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| alarma                            | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | AE21.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| climatizacion                     | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | B22.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| piscina_comodidad                 | Checkbox           | ---                | \[v2.3\] Comodidad        |
|                                   |                    |                    | (distinta de la piscina   |
|                                   |                    |                    | como ítem valorable).     |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | AE22.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| bodega_comodidad                  | Checkbox           | ---                | \[v2.3\] Comodidad de     |
|                                   |                    |                    | tenencia de bodega        |
|                                   |                    |                    | (distinta del bien        |
|                                   |                    |                    | valorable). Origen XLSM:  |
|                                   |                    |                    | Antecedentes B23.         |
+-----------------------------------+--------------------+--------------------+---------------------------+
| corrientes_debiles                | Checkbox           | ---                | \[v2.3\] Comodidad.       |
|                                   |                    |                    | Origen XLSM: Antecedentes |
|                                   |                    |                    | S23.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| dist_centros_comerciales          | Single select      | ---                | \[v2.3\] CERCA · MEDIA ·  |
|                                   |                    |                    | LEJOS. Origen XLSM:       |
|                                   |                    |                    | Antecedentes AW15.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| dist_centro_civil                 | Single select      | ---                | \[v2.3\] CERCA · MEDIA ·  |
|                                   |                    |                    | LEJOS. Origen XLSM:       |
|                                   |                    |                    | Antecedentes AW16.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| dist_metro_taxi                   | Single select      | ---                | \[v2.3\] CERCA · MEDIA ·  |
|                                   |                    |                    | LEJOS. Origen XLSM:       |
|                                   |                    |                    | Antecedentes AW17.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| dist_colegios                     | Single select      | ---                | \[v2.3\] CERCA · MEDIA ·  |
|                                   |                    |                    | LEJOS. Origen XLSM:       |
|                                   |                    |                    | Antecedentes AW18.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **➕ Campos nuevos v2.4 · TX_DatosTasacion (VProperty_Analisis_Diseno_V23_v01)**                        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **estado_uso**                    | Single select      | ---                | \[GAP-FS04\] Nuevo ·      |
|                                   |                    |                    | Usado · Subsidiado.       |
|                                   |                    |                    | Origen XLSM: FICHA SOLIC  |
|                                   |                    |                    | K36.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **ocupante**                      | Single select      | ---                | \[GAP-FS06\] Habitado ·   |
|                                   |                    |                    | Vacante · Arrendado.      |
|                                   |                    |                    | Origen XLSM: FICHA SOLIC  |
|                                   |                    |                    | E42.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **tipo_proyecto**                 | Single select      | ---                | \[GAP-FS05\] Conjunto ·   |
|                                   |                    |                    | Edificio · Condominio ·   |
|                                   |                    |                    | Parcela. Origen XLSM:     |
|                                   |                    |                    | FICHA SOLIC E40.          |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **descripcion_bien**              | Long text          | ---                | \[GAP-PO01\] Descripción  |
|                                   |                    |                    | del bien                  |
|                                   |                    |                    | (Claude/tasador). Origen  |
|                                   |                    |                    | XLSM: Portada D12.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **es_zona_rural**                 | Checkbox           | ---                | \[GAP-PO03\] TRUE si      |
|                                   |                    |                    | predio en zona rural.     |
|                                   |                    |                    | Origen XLSM: Portada      |
|                                   |                    |                    | AL21.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **divisiones_interiores**         | Single select      | ---                | \[GAP-AN11\] Acero        |
|                                   |                    |                    | Volcanita · Tabique       |
|                                   |                    |                    | Madera · Otro. Origen     |
|                                   |                    |                    | XLSM: Antecedentes H38.   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **cubierta**                      | Single select      | ---                | Plancha Metálica · FE     |
|                                   |                    |                    | Galvanizado · Teja ·      |
|                                   |                    |                    | Otro. Origen XLSM: H39.   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **revestimiento_exterior**        | Single line text   | ---                | Descripción libre. Origen |
|                                   |                    |                    | XLSM: H40.                |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **cierros_exteriores**            | Single line text   | ---                | Descripción libre. Origen |
|                                   |                    |                    | XLSM: H41.                |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **obras_complementarias_desc**    | Long text          | ---                | \[GAP-AN12\] Resumen en   |
|                                   |                    |                    | lugar de rollup. Origen   |
|                                   |                    |                    | XLSM: Antecedentes H43.   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **aire_acondicionado_tipo**       | Single line text   | ---                | \[GAP-AN13\] Origen XLSM: |
|                                   |                    |                    | Antecedentes AR37.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **calefaccion_tipo**              | Single line text   | ---                | Tipo de calefacción.      |
|                                   |                    |                    | Origen XLSM: H42.         |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **closet_mural**                  | Single line text   | ---                | Material/descripción      |
|                                   |                    |                    | closet mural. Origen      |
|                                   |                    |                    | XLSM: AN37.               |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **muebles_cocina_material**       | Single line text   | ---                | Material muebles de       |
|                                   |                    |                    | cocina. Origen XLSM:      |
|                                   |                    |                    | AR38.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **sanitarios**                    | Single line text   | ---                | Descripción sanitarios.   |
|                                   |                    |                    | Origen XLSM: AR39.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **griferia**                      | Single line text   | ---                | Tipo grifería. Origen     |
|                                   |                    |                    | XLSM: AR40.               |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **puerta_principal**              | Single line text   | ---                | Tipo puerta principal.    |
|                                   |                    |                    | Origen XLSM: AR41.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **ventanas_tipo**                 | Single line text   | ---                | \[GAP-AN15\] Tipo         |
|                                   |                    |                    | ventanas. Ej: PVC         |
|                                   |                    |                    | TERMOPANEL. Origen XLSM:  |
|                                   |                    |                    | Antecedentes AR44.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **muebles_cocina**                | Checkbox           | ---                | \[GAP-AN04\] Comodidad:   |
|                                   |                    |                    | muebles de cocina         |
|                                   |                    |                    | presentes. Origen XLSM:   |
|                                   |                    |                    | H21.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **comedor_diario**                | Checkbox           | ---                | \[GAP-AN05\] Comodidad:   |
|                                   |                    |                    | comedor diario presente.  |
|                                   |                    |                    | Origen XLSM: H22.         |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **gimnasio**                      | Checkbox           | ---                | \[GAP-AN06\] Comodidad:   |
|                                   |                    |                    | gimnasio presente. Origen |
|                                   |                    |                    | XLSM: P22.                |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **patio_servicio**                | Checkbox           | ---                | \[GAP-AN07\] Comodidad:   |
|                                   |                    |                    | patio de servicio         |
|                                   |                    |                    | presente. Origen XLSM:    |
|                                   |                    |                    | H23.                      |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **sauna**                         | Checkbox           | ---                | \[GAP-AN08\] Comodidad:   |
|                                   |                    |                    | sauna presente. Origen    |
|                                   |                    |                    | XLSM: P23.                |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **purificador_aire**              | Checkbox           | ---                | \[GAP-AN09\] Comodidad:   |
|                                   |                    |                    | purificador de aire.      |
|                                   |                    |                    | Origen XLSM: AL23.        |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **protecciones_rejas**            | Checkbox           | ---                | \[GAP-AN10\] Comodidad:   |
|                                   |                    |                    | protecciones/rejas        |
|                                   |                    |                    | presentes. Origen XLSM:   |
|                                   |                    |                    | AB24.                     |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **terreno_lat_este_m**            | Number decimal     | ---                | \[GAP-AN02\] Largo        |
|                                   |                    |                    | lateral este del terreno  |
|                                   |                    |                    | (m). Origen XLSM: BG23.   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **terreno_lat_oeste_m**           | Number decimal     | ---                | \[GAP-AN02\] Largo        |
|                                   |                    |                    | lateral oeste del terreno |
|                                   |                    |                    | (m). Origen XLSM: BG24.   |
+-----------------------------------+--------------------+--------------------+---------------------------+
| **terreno_orientacion_principal** | Single select      | ---                | \[GAP-AN03\] N · NE · E · |
|                                   |                    |                    | SE · S · SO · O · NO.     |
|                                   |                    |                    | Origen XLSM: AT24.        |
+-----------------------------------+--------------------+--------------------+---------------------------+

+-----------------+---------------------------------------------------------+
| **TX_Calculos** | **Resultados de cada fórmula ejecutada para una         |
|                 | solicitud**                                             |
|                 |                                                         |
|                 | *Tipo: Transaccional · \~4-10 por solicitud* · 2E7D32   |
+=================+=========================================================+

  ----------------------------------------------------------------------------------------
  **Campo**                    **Tipo           **Clave**   **Detalle / lógica de
                               Airtable**                   negocio**
  ---------------------------- ---------------- ----------- ------------------------------
  calculo_id                   Autonumber       PK          Identificador único

  solicitud                    Link →           FK          Solicitud a la que pertenece
                               TX_Solicitudes               

  formula                      Link →           FK          Qué fórmula se aplicó
                               C_Formulas                   

  formula_version              Single line text ---         SNAPSHOT. Versión exacta usada
                                                            al momento del cálculo

  formula_expresion_snapshot   Long text        ---         Expresión exacta usada (no
                                                            lookup). Para reproducir

  inputs_json                  Long text (JSON) ---         { valor_comercial: 9054,
                                                            factor_remate: 0.65 }

  resultado                    Number           ---         Resultado numérico

  unidad                       Single select    ---         UF · CLP · USD · m² · %

  calculado_en                 Datetime         ---         Timestamp del cálculo

  motor_ejecucion              Single select    ---         airtable_formula · make_script
                                                            · claude_calc
  ----------------------------------------------------------------------------------------

+--------------------+-----------------------------------------------------+
| **TX_Comparables** | **Comparables usados para sustentar la valoración** |
|                    |                                                     |
|                    | *Tipo: Transaccional · \~3-10 por solicitud* ·      |
|                    | 2E7D32                                              |
+====================+=====================================================+

+--------------------------+--------------------+------------+------------------------------------+
| **Campo**                | **Tipo Airtable**  | **Clave**  | **Detalle / lógica de negocio**    |
+==========================+====================+============+====================================+
| clave_natural            | Single line text   | ---        | Campo primario de Airtable         |
+--------------------------+--------------------+------------+------------------------------------+
| comp_id                  | Autonumber         | PK         | Identificador único                |
+--------------------------+--------------------+------------+------------------------------------+
| solicitud                | Link →             | FK         | Solicitud asociada                 |
|                          | TX_Solicitudes     |            |                                    |
+--------------------------+--------------------+------------+------------------------------------+
| comuna                   | Link → M_Comunas   | FK         | Comuna del comparable              |
+--------------------------+--------------------+------------+------------------------------------+
| tipo_propiedad           | Link →             | FK         | Tipo coincidente con la solicitud  |
|                          | M_TiposPropiedad   |            |                                    |
+--------------------------+--------------------+------------+------------------------------------+
| fuente                   | Single select      | ---        | tasador · portal_toc ·             |
|                          |                    |            | historico_sistema · cliente ·      |
|                          |                    |            | Portal Inmobiliario · Yapo ·       |
|                          |                    |            | Toctoc · Ofert. · CBR.             |
+--------------------------+--------------------+------------+------------------------------------+
| direccion                | Single line text   | ---        | Dirección del comparable           |
+--------------------------+--------------------+------------+------------------------------------+
| sup_terreno_m2           | Number (2)         | ---        | Superficie del terreno             |
+--------------------------+--------------------+------------+------------------------------------+
| sup_construccion_m2      | Number (2)         | ---        | Superficie construida              |
+--------------------------+--------------------+------------+------------------------------------+
| precio_uf                | Number (3)         | ---        | Precio de la transacción           |
+--------------------------+--------------------+------------+------------------------------------+
| fecha_transaccion        | Date (ISO)         | ---        | Cuándo se transó                   |
+--------------------------+--------------------+------------+------------------------------------+
| uf_m2_terreno            | Formula            | ƒ          | IF({sup_terreno_m2}>0,             |
|                          |                    |            | {precio_uf}/{sup_terreno_m2},0)    |
+--------------------------+--------------------+------------+------------------------------------+
| uf_m2_construccion       | Formula            | ƒ          | IF({sup_construccion_m2}>0,        |
|                          |                    |            | {precio_uf}/{sup_construccion_m2}, |
|                          |                    |            | 0)                                 |
+--------------------------+--------------------+------------+------------------------------------+
| antiguedad_meses         | Formula            | ƒ          | DATETIME_DIFF(TODAY(),             |
|                          |                    |            | {fecha_transaccion},'months')      |
+--------------------------+--------------------+------------+------------------------------------+
| factor_sup               | Number (4)         | ---        | Ajuste por diferencia de           |
|                          |                    |            | superficie vs la propiedad tasada  |
|                          |                    |            | (§18.8)                            |
+--------------------------+--------------------+------------+------------------------------------+
| factor_edad              | Number (4)         | ---        | Ajuste por diferencia de           |
|                          |                    |            | antigüedad (§18.8)                 |
+--------------------------+--------------------+------------+------------------------------------+
| factor_distancia         | Number (4)         | ---        | Ajuste por distancia/zona          |
|                          |                    |            | respecto del inmueble (§18.8)      |
+--------------------------+--------------------+------------+------------------------------------+
| aporta_a_historico       | Checkbox           | ---        | Si pasa al histórico tras          |
|                          |                    |            | aprobación del visador             |
+--------------------------+--------------------+------------+------------------------------------+
| clave_comparable         | Single line text   | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| direccion_comparable     | Single line text   | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| comuna_comparable        | Single line text   | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| valor_uf                 | Number (2)         | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| sup_m2                   | Number (2)         | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| factor_homogeneizacion   | Number (4)         | ---        | Factor único aplicado a valor_uf   |
+--------------------------+--------------------+------------+------------------------------------+
| fecha_comparable         | Date (ISO)         | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| valor_uf_m2              | Formula            | ƒ          | IF({sup_m2}>0, {valor_uf} /        |
|                          |                    |            | {sup_m2}, 0)                       |
+--------------------------+--------------------+------------+------------------------------------+
| valor_ajustado_uf        | Formula            | ƒ          | {valor_uf} *                       |
|                          |                    |            | {factor_homogeneizacion}           |
+--------------------------+--------------------+------------+------------------------------------+
| **tipo_referencia**      | Single select      | ---        | Oferta · CBR. Determina qué        |
|                          |                    |            | campos aplican (teléfono vs        |
|                          |                    |            | foja/número).                      |
+--------------------------+--------------------+------------+------------------------------------+
| **fecha_publicacion**    | Date (D/M/YYYY)    | ---        | Mes/año de publicación de la       |
|                          |                    |            | oferta o de la inscripción CBR     |
+--------------------------+--------------------+------------+------------------------------------+
| **anio**                 | Number (0)         | ---        | Año de construcción del inmueble   |
|                          |                    |            | comparable                         |
+--------------------------+--------------------+------------+------------------------------------+
| **telefono_contacto**    | Phone number       | ---        | \[GAP-PO04\] Sólo cuando           |
|                          |                    |            | tipo_referencia = Oferta. Origen   |
|                          |                    |            | XLSM: Portada AA29-33.             |
+--------------------------+--------------------+------------+------------------------------------+
| **foja**                 | Single line text   | ---        | Nº de foja de la inscripción CBR.  |
|                          |                    |            | Sólo tipo_referencia = CBR.        |
+--------------------------+--------------------+------------+------------------------------------+
| **numero**               | Single line text   | ---        | Nº de la inscripción CBR. Sólo     |
|                          |                    |            | tipo_referencia = CBR.             |
+--------------------------+--------------------+------------+------------------------------------+
| **oo_cc_uf**             | Number (2)         | ---        | \[GAP-PO05\] Valor de las obras    |
|                          |                    |            | complementarias del comparable,    |
|                          |                    |            | en UF (no UF/m²). Origen XLSM:     |
|                          |                    |            | Portada AR29-33.                   |
+--------------------------+--------------------+------------+------------------------------------+
| **uf_m2_terreno_f**      | Number (2)         | ---        | UF/m² de terreno tal como          |
|                          |                    |            | aparece en la fuente. Valor        |
|                          |                    |            | crudo, no calculado.               |
+--------------------------+--------------------+------------+------------------------------------+
| **uf_m2_construccion_f** | Number (2)         | ---        | UF/m² de construcción tal como     |
|                          |                    |            | aparece en la fuente. Valor        |
|                          |                    |            | crudo, no calculado.               |
+--------------------------+--------------------+------------+------------------------------------+
| notas                    | Multiline text     | ---        | Comentarios relevantes del         |
|                          |                    |            | comparable                         |
+--------------------------+--------------------+------------+------------------------------------+
| ultima_modificacion      | Last modified time | ---        | ---                                |
+--------------------------+--------------------+------------+------------------------------------+
| **⚠ PENDIENTES DE CREAR --- ausentes del schema real de Airtable al 23-jul-2026**               |
+--------------------------+--------------------+------------+------------------------------------+
| distancia_km ⚠           | Number decimal     | ---        | \[GAP-PO06\] Distancia al sujeto   |
|                          |                    |            | en km. Origen XLSM: Portada        |
|                          |                    |            | AU29-33. NO EXISTE.                |
+--------------------------+--------------------+------------+------------------------------------+
| url ⚠                    | URL                | ---        | \[GAP-PO07\] URL de la publicación |
|                          |                    |            | del comparable. Origen XLSM:       |
|                          |                    |            | Portada BV29-33. NO EXISTE.        |
+--------------------------+--------------------+------------+------------------------------------+
| dormitorios ⚠            | Number int         | ---        | \[GAP-PO08\] Origen XLSM: Portada  |
|                          |                    |            | DC29-33. NO EXISTE.                |
+--------------------------+--------------------+------------+------------------------------------+
| banos ⚠                  | Number int         | ---        | \[GAP-PO08\] Origen XLSM: Portada  |
|                          |                    |            | DD29-33. NO EXISTE.                |
+--------------------------+--------------------+------------+------------------------------------+
| estacionamientos ⚠       | Number int         | ---        | \[GAP-PO08\] Origen XLSM: Portada  |
|                          |                    |            | DE29-33. NO EXISTE.                |
+--------------------------+--------------------+------------+------------------------------------+
| bodegas ⚠                | Number int         | ---        | \[GAP-PO08\] Origen XLSM: Portada  |
|                          |                    |            | DF29-33. NO EXISTE.                |
+--------------------------+--------------------+------------+------------------------------------+
| uf_m2_homologado ⚠       | Formula ƒ          | ---        | uf_m2_construccion × factor_sup ×  |
|                          |                    |            | factor_edad × factor_distancia.    |
|                          |                    |            | Alimenta el promedio (RB-24).      |
|                          |                    |            | NO EXISTE.                         |
+--------------------------+--------------------+------------+------------------------------------+

+------------------------------+-----------------------------------------+
| **TX_ItemsCuadroValoracion** | **★ \[GAP TX-G1\] Una fila por ítem del |
|                              | cuadro de valoración**                  |
|                              |                                         |
|                              | *Tipo: Transaccional · \~3-15 por       |
|                              | solicitud · GAP estructural más crítico |
|                              | · undefined*                            |
+==============================+=========================================+

Tabla agregada en la adenda v2.1. Es el GAP estructural más importante
de la auditoría: sin ella no se replican las validaciones cruzadas del
XLSM. Reemplaza el cuadro de la Portada (filas 51-58). Resuelve 6
reglas: RB-21, RB-30, RB-38, RB-39, RB-42, RB-43.

+----------------------+--------------------+--------------------+---------------------------------+
| **Campo**            | **Tipo Airtable**  | **Clave**          | **Detalle / lógica de negocio** |
+======================+====================+====================+=================================+
| item_id              | Autonumber         | PK                 | Identificador único             |
+----------------------+--------------------+--------------------+---------------------------------+
| solicitud            | Link →             | FK                 | Solicitud a la que pertenece el |
|                      | TX_Solicitudes     |                    | ítem                            |
+----------------------+--------------------+--------------------+---------------------------------+
| orden                | Number (integer)   | IDX                | Fila del ítem en el cuadro.     |
|                      |                    |                    | Orden de impresión (RB-23)      |
+----------------------+--------------------+--------------------+---------------------------------+
| descripcion          | Single line text   | ---                | Ej: \'Edificación 1er piso\',   |
|                      |                    |                    | \'Bodega B-12\', \'Terraza\'    |
+----------------------+--------------------+--------------------+---------------------------------+
| subtipo              | Single select      | ---                | Edificación · Terreno · OO.CC.  |
|                      |                    |                    | · Piscina · Terraza · Bodega ·  |
|                      |                    |                    | Estac. U/Goce · Estac.          |
|                      |                    |                    | Descubierto · S/Reg No          |
|                      |                    |                    | Regularizable                   |
+----------------------+--------------------+--------------------+---------------------------------+
| rol_sii              | Single line text   | ---                | Rol SII específico del ítem.    |
|                      |                    |                    | Validado contra el cuadro       |
|                      |                    |                    | (RB-43)                         |
+----------------------+--------------------+--------------------+---------------------------------+
| sup_m2               | Number (decimal)   | ---                | Superficie del ítem en m²       |
+----------------------+--------------------+--------------------+---------------------------------+
| uf_m2_aplicado       | Number (decimal)   | ---                | UF/m² usado (de                 |
|                      |                    |                    | C_PreciosUnitarios o M_Comunas  |
|                      |                    |                    | según subtipo)                  |
+----------------------+--------------------+--------------------+---------------------------------+
| factor_aplicado      | Number (decimal)   | ---                | 1.0 normal · 0.5 si Terraza     |
|                      |                    |                    | (RB-38) · 0.8 reposición sin    |
|                      |                    |                    | terreno (RB-9)                  |
+----------------------+--------------------+--------------------+---------------------------------+
| flag_regularizable   | Single select      | ---                | Regularizable · S/Reg No        |
|                      |                    |                    | Regularizable. Si no → no       |
|                      |                    |                    | aporta a seguro/garantía (RB-4, |
|                      |                    |                    | RB-35, RB-39)                   |
+----------------------+--------------------+--------------------+---------------------------------+
| flag_estado          | Single select      | ---                | Bueno · Regular · Malo. Si Malo |
|                      |                    |                    | → no aporta a garantía (RB-39)  |
+----------------------+--------------------+--------------------+---------------------------------+
| flag_garantia        | Single select      | ---                | Aprobada · Denegada ·           |
|                      |                    |                    | Pendiente. Si Denegada → no     |
|                      |                    |                    | aporta a garantía (RB-39)       |
+----------------------+--------------------+--------------------+---------------------------------+
| valor_uf             | Formula            | ƒ                  | sup_m2 × factor_aplicado ×      |
|                      |                    |                    | uf_m2_aplicado                  |
+----------------------+--------------------+--------------------+---------------------------------+
| aporta_a_seguro      | Formula            | ƒ                  | IF(subtipo NOT IN \[excluidos\] |
|                      |                    |                    | AND regularizable, TRUE,        |
|                      |                    |                    | FALSE). Resuelve nivel 1 de     |
|                      |                    |                    | RB-35                           |
+----------------------+--------------------+--------------------+---------------------------------+
| aporta_a_garantia    | Formula            | ƒ                  | IF(garantia=\'Aprobada\' AND    |
|                      |                    |                    | estado!=\'Malo\' AND            |
|                      |                    |                    | regularizable, TRUE, FALSE)     |
|                      |                    |                    | (RB-39)                         |
+----------------------+--------------------+--------------------+---------------------------------+
| es_edificacion       | Formula            | ƒ                  | IF(subtipo=\'Edificación\',     |
|                      |                    |                    | TRUE, FALSE). Para SUMIF de     |
|                      |                    |                    | RB-30 (leasing)                 |
+----------------------+--------------------+--------------------+---------------------------------+
| origen_dato          | Single select      | ---                | tasador · claude · cliente      |
+----------------------+--------------------+--------------------+---------------------------------+
| creado_en            | Created time       | ---                | Auditoría                       |
+----------------------+--------------------+--------------------+---------------------------------+
| valor_seguros_uf     | Number (decimal)   | ---                | \[v2.3\] Valor de este ítem     |
|                      |                    |                    | para efectos del cálculo de     |
|                      |                    |                    | seguro. Resultado de RB-35      |
|                      |                    |                    | aplicado por ítem (factor       |
|                      |                    |                    | seguro × valor_uf si            |
|                      |                    |                    | aporta_a_seguro). Persistido    |
|                      |                    |                    | para que la plantilla Carbone   |
|                      |                    |                    | itere sin recomputar.           |
+----------------------+--------------------+--------------------+---------------------------------+
| valor_liquidacion_uf | Number (decimal)   | ---                | \[v2.3\] Valor de este ítem     |
|                      |                    |                    | para liquidación: ((1 −         |
|                      |                    |                    | factor_remate)/2 +              |
|                      |                    |                    | factor_remate) × valor_uf si    |
|                      |                    |                    | aporta_a_garantia. Por ítem, no |
|                      |                    |                    | por solicitud.                  |
+----------------------+--------------------+--------------------+---------------------------------+
| **➕ Campos nuevos v2.4 · TX_ItemsCuadroValoracion (VProperty_Analisis_Diseno_V23_v01)**         |
+----------------------+--------------------+--------------------+---------------------------------+
| **codigo_material**  | Single line text   | ---                | \[GAP-PO09\] Código             |
|                      |                    |                    | materialidad (ej.               |
|                      |                    |                    | AL=Albañilería, HA=Hormigón).   |
|                      |                    |                    | Cruza con                       |
|                      |                    |                    | C_Equivalencias.materialidad.   |
+----------------------+--------------------+--------------------+---------------------------------+
| **factor_fm**        | Number decimal     | ---                | \[GAP-PO10\] Factor de mérito   |
|                      |                    |                    | por ítem. Default 1.0. Origen   |
|                      |                    |                    | XLSM: Portada BA51-58.          |
+----------------------+--------------------+--------------------+---------------------------------+

+-----------------------------------------------------------------------+
| **★ Por qué TX_ItemsCuadroValoracion es crítica**                     |
|                                                                       |
| El XLSM resolvía 6 reglas con un cuadro de 8 filas en la Portada. En  |
| un modelo relacional ese cuadro DEBE ser una tabla hija de            |
| TX_Solicitudes, no campos planos.                                     |
|                                                                       |
| Con esta tabla, las validaciones de consistencia de m² (RB-21,        |
| RB-42), presencia del rol (RB-43), terraza al 50% (RB-38), bienes     |
| denegados (RB-39) y el SUMIF de leasing (RB-30) se vuelven rollups y  |
| fórmulas simples. Sin ella habría que hardcodear lógica --- lo que el |
| principio NO-1 prohíbe.                                               |
+-----------------------------------------------------------------------+

+-----------------------------+-----------------------------------------+
| **TX_ObrasComplementarias** | **\[GAP TX-G3\] Obras complementarias   |
|                             | del inmueble (OO.CC., piscina)**        |
|                             |                                         |
|                             | *Tipo: Transaccional · \~0-5 por        |
|                             | solicitud · undefined*                  |
+=============================+=========================================+

Tabla agregada en la adenda v2.1. Captura obras que se suman al valor
comercial pero NO se deprecian con el Factor D.F. (RB-6). Subform en F3.

  -------------------------------------------------------------------------------
  **Campo**       **Tipo           **Clave**   **Detalle / lógica de negocio**
                  Airtable**                   
  --------------- ---------------- ----------- ----------------------------------
  obra_id         Autonumber       PK          Identificador único

  solicitud       Link →           FK          Solicitud asociada
                  TX_Solicitudes               

  tipo_obra       Single select    ---         Piscina · Quincho · Cierre
                                               perimetral · Pavimentos · Portón
                                               eléctrico · Otro

  descripcion     Single line text ---         Detalle libre de la obra

  valor_uf        Number (decimal) ---         Valor de la obra. Se suma al
                                               comercial sin depreciar (RB-6)

  se_deprecia     Checkbox         ---         Default false. Las OO.CC.
                                               típicamente no se deprecian

  origen_dato     Single select    ---         tasador · claude

  creado_en       Created time     ---         Auditoría
  -------------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **TX_Ampliaciones**   **\[v2.3\] Ampliaciones declaradas de la propiedad
                        · Tipo: Transaccional · 0-3 por solicitud · Hija de
                        TX_Solicitudes. Reemplaza filas AS28-AS30 de
                        Antecedentes del XLSM.**
  --------------------- ---------------------------------------------------

  -------------------------------------------------------------------------

  ---------------------------------------------------------------------------------
  **Campo**         **Tipo           **Clave**   **Detalle / lógica de negocio**
                    Airtable**                   
  ----------------- ---------------- ----------- ----------------------------------
  ampliacion_id     Autonumber       PK          Identificador único

  solicitud         Link →           FK          Solicitud asociada
                    TX_Solicitudes               

  orden             Number (integer) IDX         1, 2, 3 (define el orden de
                                                 impresión en el PDF)

  estado            Single select    ---         Regulado · No Regulado · S/I (sin
                                                 información)

  n_pe              Single line text ---         N° permiso de edificación. Ej:
                                                 \'N°319 09/09/2020\'

  n_rif             Single line text ---         N° RIF (recepción)

  regulacion        Single select    ---         Regulado · Pendiente · S/Reg (sin
                                                 regulación)

  m2                Number (decimal) ---         Superficie regulada de la
                                                 ampliación, m²

  anio              Number (integer) ---         Año de la ampliación

  codigo_material   Single line text ---         Código corto del material
                                                 predominante (AL, HA, MA, etc.).
                                                 Valida contra
                                                 C_Equivalencias.materialidad

  origen_dato       Single select    ---         tasador · claude · cliente

  creado_en         Created time     ---         Auditoría
  ---------------------------------------------------------------------------------

  -------------------------------------------------------------------------
  **TX_HabitacionesPorNivel**   **\[v2.3\] Conteo de recintos por nivel y
                                tipo (programa arquitectónico) · Tipo:
                                Transaccional · hasta 56 por solicitud (4
                                niveles × 14 tipos) · Hija de
                                TX_Solicitudes. Reemplaza la matriz K34-X37
                                de Antecedentes del XLSM.**
  ----------------------------- -------------------------------------------

  -------------------------------------------------------------------------

  -----------------------------------------------------------------------------------------
  **Campo**       **Tipo           **Clave**   **Detalle / lógica de negocio**
                  Airtable**                   
  --------------- ---------------- ----------- --------------------------------------------
  habitacion_id   Autonumber       PK          Identificador único

  solicitud       Link →           FK          Solicitud asociada
                  TX_Solicitudes               

  nivel           Single select    IDX         Subterraneo · 1 · 2 · 3 · Mansarda. Los
                                               valores permitidos dependen de
                                               M_TiposPropiedad.layouts (RB-18)

  tipo_recinto    Single select    ---         Comedor · Living · Estar · Hall · Suite ·
                                               D.Simple · D.Servicio · Cocina · Escritorio
                                               · Baños · 1/2 Baño · Baño Servicio · Loggia
                                               · Otros

  cantidad        Number (integer) ---         Conteo en ese nivel para ese tipo. Solo se
                                               persisten filas con cantidad \> 0

  es_dormitorio   Formula          ƒ           IF(tipo_recinto IN
                                               \[\'Suite\',\'D.Simple\',\'D.Servicio\'\],
                                               TRUE, FALSE). Habilita rollups cruzados
                                               contra TX_DatosTasacion.dormitorios

  origen_dato     Single select    ---         tasador · claude

  creado_en       Created time     ---         Auditoría
  -----------------------------------------------------------------------------------------

  ------------------------------------------------------------------------
  **TX_TerminacionesPorRecinto**   **\[v2.3\] Terminaciones por categoría
                                   de recinto · Tipo: Transaccional · ≈5
                                   por solicitud · Hija de TX_Solicitudes.
                                   Reemplaza las filas AS40-AS44 de
                                   Antecedentes del XLSM.**
  -------------------------------- ---------------------------------------

  ------------------------------------------------------------------------

  -------------------------------------------------------------------------------------
  **Campo**             **Tipo           **Clave**   **Detalle / lógica de negocio**
                        Airtable**                   
  --------------------- ---------------- ----------- ----------------------------------
  terminacion_id        Autonumber       PK          Identificador único

  solicitud             Link →           FK          Solicitud asociada
                        TX_Solicitudes               

  recinto               Single select    IDX         Estar · Dormitorios · Espacios
                                                     Circulación · Cocina · Baños ·
                                                     Otros

  pavimento             Single select    ---         Tipo Piso Ingeniería · Porcelanato
                                                     · Cerámico · Madera · Alfombra ·
                                                     Flotante · Otro

  material_pavimento    Single line text ---         Marca / origen / detalle libre del
                                                     pavimento

  revestimiento_muros   Single select    ---         Esmalte · Enlucido/Pintura ·
                                                     Cerámico · Papel mural · Otro

  terminacion_cielo     Single line text ---         Enlucido/Pintura · Volcanita ·
                                                     Madera · Otro

  iluminacion           Single select    ---         Buena · Adecuada · Insuficiente

  estado                Single select    ---         Bueno · Regular · Malo · Nuevo
                                                     s/uso

  origen_dato           Single select    ---         tasador · claude

  creado_en             Created time     ---         Auditoría
  -------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  **TX_DocumentosLegales**   **\[v2.3\] Documentos legales y municipales
                             asociados · Tipo: Transaccional · 1-3 por
                             solicitud · Hija de TX_Solicitudes. Captura
                             CBR, Notaría, Cert. SERVIU. Prellenable por
                             Claude (SC07).**
  -------------------------- --------------------------------------------

  -----------------------------------------------------------------------

  ---------------------------------------------------------------------------------
  **Campo**         **Tipo           **Clave**   **Detalle / lógica de negocio**
                    Airtable**                   
  ----------------- ---------------- ----------- ----------------------------------
  documento_id      Autonumber       PK          Identificador único

  solicitud         Link →           FK          Solicitud asociada
                    TX_Solicitudes               

  tipo              Single select    IDX         CBR · Notaría · Cert. No
                                                 Expropiación · Cert. Hipoteca ·
                                                 TGR · Cert. Línea Oficial · Otro

  foja              Single line text ---         Aplica a CBR. Ej: \'3312\'

  numero            Single line text ---         Aplica a CBR / repertorio notaría.
                                                 Ej: \'4663\'

  anio              Number (integer) ---         Año del documento

  repertorio        Single line text ---         Ej: \'C: 15871912\' (aplica a
                                                 notaría)

  vendedor          Single line text ---         Razón social o nombre completo
                                                 (aplica a CBR)

  comprador         Single line text ---         Razón social o nombre completo
                                                 (CBR) --- puede ser más de uno
                                                 (sociedad conyugal)

  notaria           Single line text ---         Nombre y número de notaría (si
                                                 aplica)

  fecha_documento   Date             ---         Fecha de emisión / inscripción

  n_certificado     Single line text ---         N° de certificado SERVIU u otro

  observaciones     Long text        ---         Texto libre (gravámenes,
                                                 prohibiciones, condiciones
                                                 especiales)

  url_adjunto       URL              ---         Link al PDF en Dropbox; cross-link
                                                 opcional con TX_Adjuntos

  origen_dato       Single select    ---         tasador · claude · cliente

  creado_en         Created time     ---         Auditoría
  ---------------------------------------------------------------------------------

  ---------------------------------------------------------------------------
  **TX_Adjuntos**   Índice de archivos en Dropbox · Tipo: Transaccional ·
                    \~15-30 por solicitud · prioridad P0 desde v2.3 (caso
                    piloto MET-6283 requiere \~20 adjuntos)
  ----------------- ---------------------------------------------------------

  ---------------------------------------------------------------------------

  ----------------------------------------------------------------------------------
  **Campo**          **Tipo           **Clave**   **Detalle / lógica de negocio**
                     Airtable**                   
  ------------------ ---------------- ----------- ----------------------------------
  adjunto_id         Autonumber       PK          Identificador único

  solicitud          Link →           FK          Solicitud asociada
                     TX_Solicitudes               

  tipo               Single select    IDX         foto · plano · sii · cbr · permiso
                                                  · recepcion · email_cliente ·
                                                  titulo_dominio · otro

  nombre_archivo     Single line text ---         Nombre original del archivo

  url_dropbox        URL              ---         Link directo en Dropbox

  thumbnail_url      URL              ---         URL del thumbnail si es imagen

  tamanio_kb         Number           ---         Para monitoreo de cuota

  mime_type          Single line text ---         application/pdf, image/jpeg\...

  subido_por         Single select    ---         tasador · ejecutiva ·
                                                  cliente_externo · sistema

  subido_en          Datetime         ---         Timestamp de subida

  procesado_por_ia   Checkbox         ---         Si Claude ya lo procesó

  hash_md5           Single line text ---         Para verificar integridad y evitar
                                                  duplicados
  ----------------------------------------------------------------------------------

+----------------------------+-------------------------------------------+
| **TX_DocumentosGenerados** | **Cada PDF generado por Carbone con       |
|                            | versionamiento completo**                 |
|                            |                                           |
|                            | *Tipo: Transaccional · 1-3 por solicitud* |
|                            | · 2E7D32                                  |
+============================+===========================================+

  --------------------------------------------------------------------------------------
  **Campo**              **Tipo           **Clave**   **Detalle / lógica de negocio**
                         Airtable**                   
  ---------------------- ---------------- ----------- ----------------------------------
  doc_id                 Autonumber       PK          Identificador único

  solicitud              Link →           FK          Solicitud asociada
                         TX_Solicitudes               

  plantilla_usada        Link →           FK          Plantilla con la que se generó
                         C_Plantillas                 

  plantilla_version      Single line text ---         SNAPSHOT de la versión exacta

  url_pdf                URL              ---         Link al PDF en Dropbox

  url_pdf_preview_png    URL              ---         Primera página como imagen para
                                                      preview rápido

  hash_pdf_sha256        Single line text ---         Integridad. Detecta corrupciones

  tamanio_kb             Number           ---         Tamaño del PDF

  paginas_count          Number           ---         Cantidad de páginas

  version_doc            Number           ---         1, 2, 3\... incrementa con cada
                                                      regeneración

  es_vigente             Checkbox         IDX         Solo el último de cada solicitud
                                                      queda en true

  motivo_regeneracion    Long text        ---         Por qué se regeneró (si
                                                      version_doc \> 1)

  generado_en            Datetime         ---         Timestamp de generación

  tiempo_generacion_s    Number           ---         Métrica de performance Carbone

  status_envio_cliente   Single select    ---         no_enviado · enviado · rebotado ·
                                                      entregado
  --------------------------------------------------------------------------------------

+-----------------------+----------------------------------------------------+
| **TX_Notificaciones** | **Log de cada email/notificación efectivamente     |
|                       | enviada**                                          |
|                       |                                                    |
|                       | *Tipo: Transaccional · \~5-10 por solicitud* ·     |
|                       | 2E7D32                                             |
+=======================+====================================================+

  ------------------------------------------------------------------------------------------
  **Campo**            **Tipo Airtable**        **Clave**   **Detalle / lógica de negocio**
  -------------------- ------------------------ ----------- --------------------------------
  notif_id             Autonumber               PK          Identificador único

  solicitud            Link → TX_Solicitudes    FK          Solicitud asociada

  config_origen        Link →                   FK          Configuración que disparó esta
                       C_NotificacionesConfig               notificación

  evento               Single select            ---         Coincide con
                                                            C_NotificacionesConfig.evento

  canal                Single select            ---         gmail · slack · whatsapp · sms

  destinatarios_to     Long text                ---         Lista renderizada de
                                                            destinatarios

  destinatarios_cc     Long text                ---         CC renderizado

  asunto               Single line text         ---         Asunto renderizado

  cuerpo_renderizado   Long text                ---         Cuerpo del email/mensaje tras
                                                            inyectar variables

  adjuntos_urls        Long text                ---         URLs adjuntadas (lista separada
                                                            por \|)

  enviado_en           Datetime                 ---         Timestamp de envío

  estado_envio         Single select            IDX         pendiente · enviado · rebotado ·
                                                            fallido

  intentos             Number                   ---         Reintentos hechos

  mensaje_error        Long text                ---         Si falló, mensaje del error
  ------------------------------------------------------------------------------------------

## 6.4 Dominio A\_ · Auditoría

Trazabilidad total. Append-only. Estas tablas nunca se actualizan ni se
borran. Si A_Eventos está completa, cualquier estado del sistema es
reconstruible. Es lo que permite que el sistema responda \'qué pasó y
por qué\' con precisión cronométrica.

+---------------+----------------------------------------------------------+
| **A_Eventos** | **Log central de toda acción del sistema · append-only** |
|               |                                                          |
|               | *Tipo: Auditoría · \~15-30 filas por solicitud ·         |
|               | \~150K/año* · B58A2C                                     |
+===============+==========================================================+

  -------------------------------------------------------------------------------
  **Campo**       **Tipo           **Clave**   **Detalle / lógica de negocio**
                  Airtable**                   
  --------------- ---------------- ----------- ----------------------------------
  evento_id       Autonumber       PK          Identificador único

  timestamp       Datetime         IDX         Con milisegundos. Ordenamiento
                                               principal

  solicitud       Link →           FK          Solicitud asociada si aplica
                  TX_Solicitudes               

  tipo_evento     Single select    IDX         solicitud_creada · paso_iniciado ·
                                               paso_completado · paso_fallido ·
                                               regla_evaluada · pdf_generado ·
                                               email_enviado · estado_cambiado ·
                                               \...

  actor_tipo      Single select    ---         humano · sistema · ia ·
                                               cliente_externo · scheduler

  actor_id        Single line text ---         User ID, scenario ID,
                                               claude_call_id\...

  actor_nombre    Single line text ---         Versión legible del actor

  detalle_json    Long text (JSON) ---         Payload del evento. Estructura
                                               libre según tipo

  severidad       Single select    IDX         info · warning · error · critical

  duracion_ms     Number           ---         Si aplica (tiempo de ejecución del
                                               paso)
  -------------------------------------------------------------------------------

+-----------------------+--------------------------------------------------+
| **A_DecisionesMotor** | **Cada decisión del motor de reglas con          |
|                       | candidatas y ganadora**                          |
|                       |                                                  |
|                       | *Tipo: Auditoría · 1 por solicitud · \~6K/año* · |
|                       | B58A2C                                           |
+=======================+==================================================+

  ---------------------------------------------------------------------------------------
  **Campo**                 **Tipo Airtable** **Clave**   **Detalle / lógica de negocio**
  ------------------------- ----------------- ----------- -------------------------------
  decision_id               Autonumber        PK          Identificador único

  timestamp                 Datetime          ---         Cuándo se evaluó

  solicitud                 Link →            FK UQ       1 a 1 con la solicitud
                            TX_Solicitudes                

  contexto_json             Long text (JSON)  ---         { cliente, tipo_informe,
                                                          tipo_propiedad, banco, comuna,
                                                          monto }

  reglas_candidatas         Long text (JSON)  ---         Array de regla_ids que
                                                          matchearon el contexto

  regla_ganadora            Link →            FK          La que ganó la evaluación
                            C_ReglasNegocio               

  regla_ganadora_snapshot   Long text (JSON)  ---         SNAPSHOT del estado de la regla
                                                          al momento (filters, plantilla,
                                                          fórmulas)

  razon_ganadora            Long text         ---         \'Mayor especificidad (4 vs
                                                          2)\' / \'Mayor prioridad (999
                                                          vs 100)\'

  resultado_aplicado        Long text (JSON)  ---         { plantilla_id, formulas:
                                                          \[\...\], workflow_id }

  tiempo_resolucion_ms      Number            ---         Cuánto tomó la evaluación
  ---------------------------------------------------------------------------------------

+---------------+----------------------------------------------------------+
| **A_Cambios** | **Audit trail de modificaciones a registros sensibles**  |
|               |                                                          |
|               | *Tipo: Auditoría · indefinida · cumplimiento legal* ·    |
|               | B58A2C                                                   |
+===============+==========================================================+

  -----------------------------------------------------------------------------------
  **Campo**              **Tipo         **Clave**   **Detalle / lógica de negocio**
                         Airtable**                 
  ---------------------- -------------- ----------- ---------------------------------
  cambio_id              Autonumber     PK          Identificador único

  timestamp              Datetime       ---         Cuándo ocurrió el cambio

  tabla_origen           Single select  IDX         C_ReglasNegocio · C_Plantillas ·
                                                    C_Formulas · M_Clientes ·
                                                    TX_Solicitudes · \...

  registro_id            Single line    ---         PK del registro modificado
                         text                       

  registro_nombre        Single line    ---         Versión legible (ej. nombre del
                         text                       cliente)

  campo_modificado       Single line    ---         Campo específico
                         text                       

  valor_anterior         Long text      ---         Estado previo (puede ser JSON si
                                                    es relación)

  valor_nuevo            Long text      ---         Estado posterior

  modificado_por_email   Single line    ---         Email del colaborador (last
                         text                       modified by)

  razon_cambio           Long text      ---         Si el usuario lo justificó al
                                                    editar
  -----------------------------------------------------------------------------------

+-------------------+------------------------------------------------------+
| **A_ErroresMake** | **Errores capturados por escenarios Make con su      |
|                   | resolución**                                         |
|                   |                                                      |
|                   | *Tipo: Auditoría · 6 meses retención · monitoreo     |
|                   | crítico* · B58A2C                                    |
+===================+======================================================+

  ----------------------------------------------------------------------------------
  **Campo**        **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ---------------- ------------------ ----------- ----------------------------------
  error_id         Autonumber         PK          Identificador único

  timestamp        Datetime           ---         Cuándo ocurrió

  solicitud        Link →             FK          Solicitud afectada (si aplica)
                   TX_Solicitudes                 

  escenario_make   Link →             FK          Escenario que falló
                   Z_EscenariosMake               

  modulo_falla     Single line text   ---         En qué módulo del escenario falló

  mensaje_error    Long text          ---         Mensaje completo del error

  stack_trace      Long text          ---         Traza si está disponible

  reintentos       Number             ---         Cantidad de reintentos hechos

  estado           Single select      IDX         pendiente · resuelto · escalado ·
                                                  ignorado

  severidad        Single select      IDX         warning · error · critical

  resolucion       Long text          ---         Cómo se resolvió (manual o
                                                  automático)

  resuelto_en      Datetime           ---         Cuándo se resolvió
  ----------------------------------------------------------------------------------

+---------------+----------------------------------------------------------+
| **A_Accesos** | **Quién accedió a qué desde dónde · seguridad**          |
|               |                                                          |
|               | *Tipo: Auditoría · 12 meses online · alta cardinalidad*  |
|               | · B58A2C                                                 |
+===============+==========================================================+

  -----------------------------------------------------------------------------
  **Campo**       **Tipo         **Clave**   **Detalle / lógica de negocio**
                  Airtable**                 
  --------------- -------------- ----------- ----------------------------------
  acceso_id       Autonumber     PK          Identificador único

  timestamp       Datetime       ---         Cuándo

  usuario_email   Single line    ---         Quién accedió
                  text                       

  accion          Single select  IDX         vio · edito · creo · elimino ·
                                             descargo

  recurso_tabla   Single line    ---         Tabla accedida
                  text                       

  recurso_id      Single line    ---         Registro específico
                  text                       

  origen_ip       Single line    ---         Para auditoría de seguridad
                  text                       

  user_agent      Single line    ---         Navegador / app utilizada
                  text                       
  -----------------------------------------------------------------------------

## 6.5 Dominio H\_ · Históricos

Memoria larga del sistema. Aquí van las cosas que ya no son
operacionales pero deben conservarse: versiones anteriores de plantillas
y fórmulas, solicitudes archivadas, valores históricos de UF. Permite
reproducir cualquier informe pasado exactamente como se generó.

+----------------------------+----------------------------------------------+
| **H_Solicitudes_Cerradas** | **Snapshot de solicitudes cerradas hace +90  |
|                            | días**                                       |
|                            |                                              |
|                            | *Tipo: Histórico · \~6K/año · solo lectura*  |
|                            | · 4A6FA5                                     |
+============================+==============================================+

  -------------------------------------------------------------------------------
  **Campo**         **Tipo         **Clave**   **Detalle / lógica de negocio**
                    Airtable**                 
  ----------------- -------------- ----------- ----------------------------------
  sol_id_original   Number         PK          ID que tenía en TX_Solicitudes

  codigo_ext        Single line    IDX         Para búsqueda rápida
                    text                       

  cliente_nombre    Single line    ---         DESNORMALIZADO (no FK) --- el
                    text                       cliente puede haber cambiado

  direccion         Single line    ---         Para búsqueda
                    text                       

  comuna_nombre     Single line    ---         Desnormalizado
                    text                       

  pdf_final_url     URL            ---         Link al PDF entregado

  fecha_solicitud   Date           ---         Cuándo se solicitó

  fecha_entrega     Date           ---         Cuándo se entregó

  fecha_cierre      Date           ---         Cuándo cerró

  snapshot_json     Long text      ---         Estado completo de la solicitud al
                    (JSON)                     momento del cierre
  -------------------------------------------------------------------------------

  ---------------------------------------------------------------------------
  **H_PreciosUF**   Histórico diario del valor UF en CLP y tipo de cambio USD
                    · Tipo: Histórico · \~365/año · actualización diaria
                    automática · prioridad P0 desde v2.3
  ----------------- ---------------------------------------------------------

  ---------------------------------------------------------------------------

  -------------------------------------------------------------------------------
  **Campo**         **Tipo         **Clave**   **Detalle / lógica de negocio**
                    Airtable**                 
  ----------------- -------------- ----------- ----------------------------------
  fecha             Date           PK UQ       Una fila por fecha

  valor_clp         Currency CLP   ---         Valor de la UF para esa fecha

  fuente            Single select  ---         bcentral · mindicador · sii

  obtenido_en       Datetime       ---         Cuándo se actualizó

  tipo_cambio_usd   Number         ---         \[v2.3\] Tipo de cambio CLP/USD
                    (decimal)                  del día. Resuelve RB-58. Origen:
                                               mindicador.cl
                                               /api/dolar/{DD-MM-YYYY} o Banco
                                               Central. Lo trae el mismo
                                               scheduler que actualiza la UF
                                               (SC15 extendido).
  -------------------------------------------------------------------------------

+-----------------------------+--------------------------------------------+
| **H_Comparables_Historico** | **Base creciente de comparables usados en  |
|                             | tasaciones pasadas**                       |
|                             |                                            |
|                             | *Tipo: Histórico · \~5K-50K filas · base   |
|                             | de inteligencia* · 4A6FA5                  |
+=============================+============================================+

  --------------------------------------------------------------------------------------
  **Campo**             **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  --------------------- ------------------ ----------- ---------------------------------
  comp_hist_id          Autonumber         PK          Identificador único

  direccion             Single line text   ---         Para búsqueda

  comuna                Link → M_Comunas   FK          Para filtros

  tipo_propiedad        Link →             FK          Para matching
                        M_TiposPropiedad               

  sup_terreno_m2        Number             ---         Para matching por superficie

  sup_construccion_m2   Number             ---         Idem

  precio_uf             Number             ---         Valor

  uf_m2_construccion    Number             ---         Pre-calculado

  fecha_transaccion     Date               ---         Fecha de la transacción original

  fuente_original       Single select      ---         portal_toc · cbr ·
                                                       solicitud_anterior

  aporto_solicitud      Link →             FK          De qué solicitud salió este
                        TX_Solicitudes                 comparable

  calidad_score         Number             ---         Score 0-100 según completitud del
                                                       registro
  --------------------------------------------------------------------------------------

+----------------------------+------------------------------------------------+
| **H_PlantillasAnteriores** | **Versiones anteriores de plantillas Carbone** |
|                            |                                                |
|                            | *Tipo: Histórico · crece linealmente* · 4A6FA5 |
+============================+================================================+

  -------------------------------------------------------------------------------------
  **Campo**               **Tipo         **Clave**   **Detalle / lógica de negocio**
                          Airtable**                 
  ----------------------- -------------- ----------- ----------------------------------
  hist_id                 Autonumber     PK          Identificador único

  plantilla_original_id   Number         ---         ID que tenía en C_Plantillas

  nombre                  Single line    ---         Nombre histórico
                          text                       

  version                 Single line    ---         Versión exacta retirada
                          text                       

  archivo_docx_url        URL            ---         URL del .docx archivado

  vigente_desde           Date           ---         Fecha en que estuvo activa

  vigente_hasta           Date           ---         Cuándo se retiró

  reemplazada_por_id      Number         ---         ID en C_Plantillas que la
                                                     sustituyó

  cambios_version         Long text      ---         Changelog que tenía
  -------------------------------------------------------------------------------------

+--------------------------+------------------------------------------------+
| **H_FormulasAnteriores** | **Versiones anteriores de fórmulas de          |
|                          | cálculo**                                      |
|                          |                                                |
|                          | *Tipo: Histórico · crítica para                |
|                          | reproducibilidad* · 4A6FA5                     |
+==========================+================================================+

  -----------------------------------------------------------------------------------
  **Campo**             **Tipo         **Clave**   **Detalle / lógica de negocio**
                        Airtable**                 
  --------------------- -------------- ----------- ----------------------------------
  hist_id               Autonumber     PK          Identificador único

  formula_original_id   Number         ---         ID que tenía en C_Formulas

  nombre                Single line    ---         Nombre técnico
                        text                       

  expresion             Long text      ---         Expresión retirada

  variables_input       Long text      ---         Inputs que esperaba
                        (JSON)                     

  version               Single line    ---         Versión retirada
                        text                       

  vigente_desde         Date           ---         Cuándo entró en uso

  vigente_hasta         Date           ---         Cuándo se retiró

  razon_cambio          Long text      ---         Por qué se cambió
  -----------------------------------------------------------------------------------

## 6.6 Dominio Z\_ · Automatizaciones

El metadato del propio sistema. Qué escenarios Make hay, cómo se
invocan, qué jobs corren. Esto permite que un nuevo integrante entienda
el sistema sin abrir Make: lee Z_EscenariosMake y ve el catálogo
completo.

+----------------------+---------------------------------------------------+
| **Z_EscenariosMake** | **Catálogo de escenarios Make con su propósito y  |
|                      | endpoint**                                        |
|                      |                                                   |
|                      | *Tipo: Metadatos · \~20-30 filas* · B26A00        |
+======================+===================================================+

  ---------------------------------------------------------------------------------
  **Campo**            **Tipo         **Clave**   **Detalle / lógica de negocio**
                       Airtable**                 
  -------------------- -------------- ----------- ---------------------------------
  escenario_id         Autonumber     PK          Identificador único

  codigo               Single line    UQ          Formato: SC01, SC02, \...
                       text                       

  nombre               Single line    ---         Descriptivo:
                       text                       \'webhook_solicitud_externa\',
                                                  \'generar_pdf_carbone\'

  accion_asociada      Single select  ---         Coincide con
                                                  C_WorkflowPasos.accion

  webhook_url          URL            ---         Si es disparado por webhook

  make_scenario_id     Single line    ---         ID interno en Make para deeplinks
                       text                       

  descripcion          Long text      ---         Qué hace, en lenguaje de negocio

  inputs_esperados     Long text      ---         Schema del payload esperado
                       (JSON)                     

  outputs_producidos   Long text      ---         Schema del payload producido
                       (JSON)                     

  tablas_lee           Multi select   ---         Qué tablas Airtable consulta este
                                                  escenario

  tablas_escribe       Multi select   ---         Qué tablas escribe

  activo               Checkbox       IDX         Solo activos se invocan

  ultima_ejecucion     Datetime       ---         Última ejecución registrada

  tasa_exito_30d       Rollup         RU          \% de éxito en Z_EjecucionesMake
                                                  los últimos 30 días

  tiempo_promedio_ms   Rollup         RU          Promedio de duracion_ms
  ---------------------------------------------------------------------------------

+-----------------------+--------------------------------------------------+
| **Z_EjecucionesMake** | **Registro de cada ejecución de un escenario     |
|                       | Make**                                           |
|                       |                                                  |
|                       | *Tipo: Logs · \~15K/mes · retención 90 días* ·   |
|                       | B26A00                                           |
+=======================+==================================================+

  --------------------------------------------------------------------------------------
  **Campo**            **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  -------------------- ------------------ ----------- ----------------------------------
  ejec_id              Autonumber         PK          Identificador único

  escenario            Link →             FK          Escenario ejecutado
                       Z_EscenariosMake               

  solicitud            Link →             FK          Solicitud asociada si aplica
                       TX_Solicitudes                 

  inicio               Datetime           ---         Timestamp de inicio

  fin                  Datetime           ---         Timestamp de fin

  duracion_ms          Formula            ƒ           DATETIME_DIFF(fin, inicio,
                                                      \'milliseconds\')

  resultado            Single select      IDX         ok · error · timeout · cancelado ·
                                                      skipped

  modulos_ejecutados   Number             ---         Para tracking de costo Make

  error_id             Link →             FK          Si resultado=error, link al
                       A_ErroresMake                  detalle
  --------------------------------------------------------------------------------------

+----------------------+----------------------------------------------------+
| **Z_ColaPendientes** | **Cola de pasos pendientes en flujos asíncronos**  |
|                      |                                                    |
|                      | *Tipo: Operacional · \~20-50 filas activas* ·      |
|                      | B26A00                                             |
+======================+====================================================+

  -----------------------------------------------------------------------------------
  **Campo**          **Tipo Airtable** **Clave**   **Detalle / lógica de negocio**
  ------------------ ----------------- ----------- ----------------------------------
  cola_id            Autonumber        PK          Identificador único

  solicitud          Link →            FK          Solicitud en espera
                     TX_Solicitudes                

  paso_pendiente     Link →            FK          Paso del workflow que está
                     C_WorkflowPasos               esperando

  esperando_evento   Single select     ---         respuesta_visador ·
                                                   respuesta_tasador · timeout ·
                                                   reintento

  creado_en          Datetime          ---         Cuándo entró a la cola

  reactivar_en       Datetime          ---         Cuándo el scheduler debe
                                                   reintentar

  estado             Single select     IDX         pendiente · activado · cancelado ·
                                                   timeout
  -----------------------------------------------------------------------------------

+----------------+--------------------------------------------------------+
| **Z_Webhooks** | **Catálogo de webhooks entrantes al sistema**          |
|                |                                                        |
|                | *Tipo: Metadatos · \~5-10 filas* · B26A00              |
+================+========================================================+

  -------------------------------------------------------------------------------------
  **Campo**           **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ------------------- ------------------ ----------- ----------------------------------
  webhook_id          Autonumber         PK          Identificador único

  nombre              Single line text   ---         Ej: \'Next.js IF-01 - Solicitud
                                                     Externa\'

  url                 URL                ---         Endpoint del webhook en Make

  escenario_destino   Link →             FK          A qué escenario dispara
                      Z_EscenariosMake               

  token_seguridad     Single line text   ---         Para validar origen (HMAC o
                                                     similar)

  origen              Single select      ---         nextjs · airtable · gmail ·
                                                     dropbox · externo

  activo              Checkbox           IDX         Solo activos
  -------------------------------------------------------------------------------------

+------------------+--------------------------------------------------------+
| **Z_Schedulers** | **Jobs programados (cron) con próxima ejecución**      |
|                  |                                                        |
|                  | *Tipo: Metadatos · \~10-15 filas* · B26A00             |
+==================+========================================================+

+----------------------------------------------------------------------------+----------------------------+
| **C_AutomationsAirtable**                                                  | **Inventario de            |
|                                                                            | Automations y Scripts      |
|                                                                            | internos de Airtable**     |
+------------------------+------------------+--------------+-----------------+----------------------------+
| **Campo**              | **Tipo           | **Clave**    | **Detalle**                                  |
|                        | Airtable**       |              |                                              |
+========================+==================+==============+=================+============================+
| Tipo: Metadatos · \~15-20 filas · análoga a Z_EscenariosMake               | Dominio: Z\_ · Versión     |
|                                                                            | v2.4                       |
+------------------------+------------------+--------------+-----------------+----------------------------+
| automation_id          | Autonumber       | PK           | Identificador único autogenerado             |
+------------------------+------------------+--------------+----------------------------------------------+
| nombre                 | Single line text | UQ           | Formato AT##\_descripcion_snake. Ej:         |
|                        |                  |              | AT01_resolver_motor_reglas                   |
+------------------------+------------------+--------------+----------------------------------------------+
| tipo                   | Single select    | ---          | Automation · Script · Scheduled · Formula    |
+------------------------+------------------+--------------+----------------------------------------------+
| disparador             | Single line text | ---          | Condición exacta. Ej: TX_Solicitudes.estado  |
|                        |                  |              | = creada                                     |
+------------------------+------------------+--------------+----------------------------------------------+
| descripcion            | Long text        | ---          | Qué hace, en lenguaje de negocio             |
+------------------------+------------------+--------------+----------------------------------------------+
| tablas_lee             | Multi select     | ---          | Tablas Airtable que consulta                 |
+------------------------+------------------+--------------+----------------------------------------------+
| tablas_escribe         | Multi select     | ---          | Tablas Airtable que modifica                 |
+------------------------+------------------+--------------+----------------------------------------------+
| escenario_make_destino | Link →           | FK           | Si esta automation dispara un SC Make, cuál. |
|                        | Z_EscenariosMake |              | Vacío = no cruza a Make                      |
+------------------------+------------------+--------------+----------------------------------------------+
| activa                 | Checkbox         | IDX          | Solo automations activas corren              |
+------------------------+------------------+--------------+----------------------------------------------+
| ultima_ejecucion       | Datetime         | ---          | Última corrida registrada                    |
+------------------------+------------------+--------------+----------------------------------------------+

**Carga inicial --- 10 registros AT01--AT10:**

  -----------------------------------------------------------------------------------------
  **ID**   **Nombre**                       **Tipo ·           **Tablas lee / escribe ·
                                            Disparador**       Make destino**
  -------- -------------------------------- ------------------ ----------------------------
  AT01     AT01_resolver_motor_reglas       Script ·           Lee: C_ReglasNegocio,
                                            estado=creada      M_Clientes \| Escribe:
                                                               TX_Solicitudes,
                                                               A_DecisionesMotor

  AT02     AT02_asignar_tasador             Script ·           Lee: M_Tasadores, M_Comunas
                                            estado=creada      \| Escribe: TX_Solicitudes,
                                            (post AT01)        A_Eventos

  AT03     AT03_ejecutar_dag_formulas       Script ·           Lee: C_Formulas,
                                            estado=visitada    TX_DatosTasacion \| Escribe:
                                                               TX_Calculos, TX_Solicitudes

  AT04     AT04_validar_rangos_valor        Formula+Auto ·     Lee: TX_Calculos, M_Comunas
                                            TX_Calculos insert \| Escribe: TX_Solicitudes
                                                               (flag)

  AT05     AT05_notificar_visador           Automation ·       Lee: C_NotificacionesConfig
                                            estado=pdf_listo   \| Escribe:
                                                               TX_Notificaciones \| Make:
                                                               SC09→SC13

  AT06     AT06_procesar_decision_visador   Automation ·       Lee: TX_Solicitudes \|
                                            decision_visador   Escribe: TX_Solicitudes,
                                                               A_Eventos

  AT07     AT07_chequear_aprobacion_final   Automation ·       Lee: C_ReglasNegocio \|
                                            estado=aprobada    Escribe: TX_Solicitudes \|
                                                               Make: SC13

  AT08     AT08_alertas_sla                 Scheduled · cron   Lee: TX_Solicitudes, C_SLA
                                            08:00 diario       \| Escribe:
                                                               TX_Notificaciones \| Make:
                                                               SC13

  AT09     AT09_reintentos_cola             Scheduled+Script · Lee: Z_ColaPendientes \|
                                            cron 15 min        Escribe: Z_ColaPendientes

  AT10     AT10_archivado_nocturno          Scheduled · cron   Lee: TX_Solicitudes \|
                                            nocturno           Escribe:
                                                               H_Solicitudes_Cerradas,
                                                               A_Eventos
  -----------------------------------------------------------------------------------------

  ----------------------------------------------------------------------------------------
  **Campo**              **Tipo Airtable**  **Clave**   **Detalle / lógica de negocio**
  ---------------------- ------------------ ----------- ----------------------------------
  sched_id               Autonumber         PK          Identificador único

  nombre                 Single line text   ---         Ej: \'Backup semanal\',
                                                        \'Actualizar UF diario\'

  cron_expression        Single line text   ---         Ej: \'0 8 \* \* \*\' (todos los
                                                        días 8 AM)

  descripcion_humana     Single line text   ---         Ej: \'Todos los días a las 8 AM\'

  escenario_a_ejecutar   Link →             FK          Escenario que invoca
                         Z_EscenariosMake               

  ultima_ejecucion       Datetime           ---         Última corrida

  proxima_ejecucion      Datetime           ---         Próxima programada

  activo                 Checkbox           IDX         Solo activos
  ----------------------------------------------------------------------------------------

### Resumen consolidado del modelo

  ------------------------------------------------------------------------------
  **Dominio**        **Tablas**   **Volumen anual**     **Patrón de uso**
  ------------------ ------------ --------------------- ------------------------
  M\_ Maestros       8            Bajo (cientos de      Lectura constante,
                                  filas totales)        escrituras esporádicas

  C\_ Configuración  10           Bajo-Medio (cientos)  Editado por admin. Leído
                                                        por motor en cada
                                                        solicitud

  TX\_ Transacciones 7            Alto (\~30K           Inserts y updates
                                  filas/año)            constantes. Caliente

  A\_ Auditoría      5            Muy alto (\~150K      Append-only. Purga
                                  filas/año)            programada

  H\_ Históricos     5            Medio (crece          Mayoría lectura. Inserts
                                  linealmente)          en archivado

  Z\_                5            Alto en logs          Logs purgables;
  Automatizaciones                (Z_EjecucionesMake    metadatos estables
                                  \~15K/mes)            
  ------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **▌ Política de tamaño y archivado**                                  |
|                                                                       |
| Si TX_Solicitudes supera 30K filas, las cerradas con 90+ días se      |
| mueven automáticamente a H_Solicitudes_Cerradas vía SC17. Si          |
| A_Eventos supera 100K filas, las antiguas (\>12 meses) se exportan a  |
| Dropbox /archivado/eventos/AAAA-MM.json y se purgan. Estos thresholds |
| se monitorean en una vista \'Salud del sistema\' que aparece en el    |
| dashboard del administrador.                                          |
+=======================================================================+

**\**

**6.7 Dominio D\_ · Documentos paramétricos**

![](media/image1.png){width="6.268055555555556in"
height="3.7111111111111112in"}

Séptimo dominio del modelo. Es independiente y desacoplado del flujo de
tasaciones: ninguna de sus tablas contiene link record hacia M\_, C\_,
TX\_, A\_, H\_ o Z\_. Materializa la gestión paramétrica de documentos
opcionales solicitados por la ejecutiva comercial y configurados por el
administrador. Origen documental: Modelo Documental Paramétrico v1.2
(junio 2026), consolidado por el blueprint v8.2 y adoptado como diseño
vigente por la Especificación v1.6 (Julio 2026).

**Consolidación v1.6 (blueprint v8.2 · SC-RF09)**. El dominio D\_, que
en v2.6.2 tenía ocho tablas con patrón EAV polimórfico tipado
(D_TipoDato, D_Catalogo, D_CatalogoValor, D_TipoDocumento, D_Atributo,
D_TipoDocumentoAtributo, D_Documento, D_DocumentoValorAtributo), se
reduce a **dos tablas**: D_TipoDocumento y D_TipoDocumentoAtributo.
Los campos que antes vivían en D_Atributo (nombre, tipo_dato,
unidad_medida, obligatorio, ejemplo_atributo, uso_tabla_destino,
uso_campo_destino) se promueven a columnas de D_TipoDocumentoAtributo.
Los catálogos cerrados (antes D_Catalogo + D_CatalogoValor) se
implementan como columnas `singleSelect` de Airtable directamente sobre
D_TipoDocumentoAtributo. El resultado de la extracción (antes
D_Documento + D_DocumentoValorAtributo, patrón EAV con fila por
documento y por atributo) se persiste como JSON en
`TX_Adjuntos.atributos_obtenidos` del propio adjunto que originó la
extracción — sin tablas intermedias en el dominio D\_. Se agregan dos
campos nuevos para enrutar el resultado por cardinalidad:
`uso_cardinalidad_destino` (una_por_solicitud | una_por_unidad) y
`uso_campo_link_unidad` (texto libre, ej. `TX_Unidades.rol_sii`), que
permiten que un mismo tipo de documento reparta sus atributos entre
`TX_DatosTasacion` (una vez por solicitud) y la nueva tabla
`TX_Unidades` (una vez por unidad física del inmueble — ver más abajo).
D_TipoDato, D_Catalogo, D_CatalogoValor, D_Atributo, D_Documento y
D_DocumentoValorAtributo quedan **deprecadas**: su contenido fue
consolidado o su función reemplazada por el JSON en TX_Adjuntos.

+---------------------------+---------------------------------------------------------------------+
| **D_TipoDocumento**       | **Catálogo de tipos de documento reconocidos · p. ej. cert. avalúo   |
|                           | fiscal, permiso edificación, inscripción CBR (v2.6.4: incorpora      |
|                           | tipo_propiedad)**                                                    |
+---------------------------+-----------------+-----------------+---------------------------------+
| **Campo**                 | **Tipo Airtable** | **Clave**     | **Detalle / lógica de negocio** |
+---------------------------+-----------------+-----------------+---------------------------------+
| codigo                     | Single line text | PK              | Campo primario. PK natural, snake_case, único (certificado_avaluo_fiscal, permiso_edificacion, etc.). |
+---------------------------+-----------------+-----------------+---------------------------------+
| nombre                     | Single line text | ---             | Nombre legible.                 |
+---------------------------+-----------------+-----------------+---------------------------------+
| descripcion                | Long text        | ---             | Descripción extendida.          |
+---------------------------+-----------------+-----------------+---------------------------------+
| entidad_emisora            | Single line text | ---             | Quién lo emite (SII, DOM, TGR, SEC, CBR, Notaría, SERVIU, etc.). |
+---------------------------+-----------------+-----------------+---------------------------------+
| vigencia_dias               | Number (integer) | ---             | Días de vigencia. Vacío = sin vencimiento. |
+---------------------------+-----------------+-----------------+---------------------------------+
| activo                      | Checkbox         | ---             | Default true. Solo activos se ofrecen al ejecutivo (soft-delete). |
+---------------------------+-----------------+-----------------+---------------------------------+
| tipo_propiedad              | Single select    | ---             | nueva · usada · ambas. Indica si el documento aplica a propiedades nuevas, usadas o ambas. Basado en la columna "Cuándo" de la Especificación §4.2.1. |
+---------------------------+-----------------+-----------------+---------------------------------+
| D_TipoDocumentoAtributo     | Link →           | FK              | Link → D_TipoDocumentoAtributo. Único link vivo del dominio D\_ (RN-33: sigue sin cruzar a M\_/C\_/TX\_/A\_/H\_/Z\_). |
+---------------------------+-----------------+-----------------+---------------------------------+

+------------------------------+---------------------------------------------------------------------+
| **D_TipoDocumentoAtributo**  | **Fuente única desde v1.6. Ya no es una relación N:M — cada fila    |
|                              | consolida la definición completa de un atributo para un tipo de     |
|                              | documento, incluido su enrutamiento por cardinalidad. 19 campos     |
|                              | reales verificados vía MCP el 17-jul-2026                           |
|                              | (`tbldI86ieVKpjpL7E`).**                                            |
+------------------------------+-----------------+-----------------+---------------------------------+
| **Campo**                    | **Tipo Airtable** | **Clave**     | **Detalle / lógica de negocio** |
+------------------------------+-----------------+-----------------+---------------------------------+
| codigo                        | Single line text | PK (primary)   | Primary field real. Patrón `<tipo_documento>__<atributo>` (ej. `permiso_edificacion__direccion`). |
+------------------------------+-----------------+-----------------+---------------------------------+
| tipo_documento                | Link → D_TipoDocumento | FK        | Único link vivo del dominio D\_ (RN-33: sigue sin cruzar a M\_/C\_/TX\_/A\_/H\_/Z\_). |
+------------------------------+-----------------+-----------------+---------------------------------+
| codigo_atributo                | Single line text | ---            | Código técnico del atributo (ej. `rol_sii`), independiente del `codigo` compuesto de la fila. |
+------------------------------+-----------------+-----------------+---------------------------------+
| nombre_atributo                | Single line text | ---            | Nombre legible del atributo (rol_sii, ano_construccion, material_estructura, etc.). Antes vivía en D_Atributo. |
+------------------------------+-----------------+-----------------+---------------------------------+
| tipo_dato                      | Single select    | ---            | Opciones reales: `number · text · date · boolean`. Diverge de la Especificación v1.8.2 §4 (que describe `texto · numero_entero · numero_decimal · fecha · booleano · rut · catalogo`) — usar las 4 opciones reales al validar/filtrar. |
+------------------------------+-----------------+-----------------+---------------------------------+
| unidad_medida                  | Single line text | ---            | UF · CLP · USD · m² · % · días · ° · año.                        |
+------------------------------+-----------------+-----------------+---------------------------------+
| obligatorio                    | Checkbox         | ---            | Si el atributo es exigido para este tipo de documento (antes vivía en la relación N:M). |
+------------------------------+-----------------+-----------------+---------------------------------+
| orden                          | Number (integer) | ---            | Orden de presentación en el formulario de captura.                |
+------------------------------+-----------------+-----------------+---------------------------------+
| etiqueta_local                 | Single line text | ---            | Nombre alternativo en el contexto de este tipo de documento.      |
+------------------------------+-----------------+-----------------+---------------------------------+
| valor_por_defecto              | Single line text | ---            | Valor por defecto (texto serializado).                            |
+------------------------------+-----------------+-----------------+---------------------------------+
| ejemplo_atributo               | Single line text | ---            | RN-36: valor de ejemplo real extraído literalmente de informes reales del cliente; si no hay evidencia trazable se persiste `PENDIENTE_VALIDACION` — nunca se infiere ni se fabrica. Antes vivía en D_Atributo. |
+------------------------------+-----------------+-----------------+---------------------------------+
| usado_motor_calculo (Set A)    | Checkbox         | ---            | TRUE si el atributo alimenta el motor de cálculo. Filtra el prompt de Claude cuando `usado_motor_calculo=true` (§4.3 Especificación v1.6). |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_interfaz_ejecutiva (Set B) | Checkbox         | ---            | RN-34 (revisada v1.8.2). TRUE si el atributo aparece en la Ejecutiva (IF-02). El campo `uso_interfaz_negocio` descrito por la Especificación **no existe** en la base real — coexisten 3 flags separados por interfaz. Un filtro que replique "uso_interfaz_negocio" debe usar el OR de los tres. |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_interfaz_tasador (Set B)   | Checkbox         | ---            | RN-34 (revisada v1.8.2). TRUE si el atributo aparece en el Tasador (IF-03). |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_interfaz_visador (Set B)   | Checkbox         | ---            | RN-34 (revisada v1.8.2). TRUE si el atributo aparece en el Visador (IF-04). |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_tabla_destino              | Single line text | Cond.          | RN-35. Tabla destino del atributo (`TX_DatosTasacion`, `TX_Unidades`, `TX_Solicitudes`, `TX_DocumentosLegales`, etc.) cuando `usado_motor_calculo=true` o alguno de los `uso_interfaz_*=true`. Trazabilidad textual, sin FK. |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_campo_destino              | Single line text | Cond.          | RN-35. Campo destino en la tabla anterior. Nombre exacto tal como figura en VProperty_Origen_Datos_Informe v1.0. |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_cardinalidad_destino       | Single select    | Cond. (nuevo v1.6) | Opciones reales: `una_por_solicitud · una_por_unidad · muchas_por_solicitud · PENDIENTE_VALIDACION` (la Especificación v1.8.2 sólo documenta las dos primeras). `una_por_solicitud` escribe una vez en TX_DatosTasacion; `una_por_unidad` escribe una vez por unidad física en TX_Unidades. RN-35 extendida. |
+------------------------------+-----------------+-----------------+---------------------------------+
| uso_campo_link_unidad          | Single line text | Cond. (nuevo v1.6) | Texto libre que resuelve la unidad destino cuando `uso_cardinalidad_destino='una_por_unidad'` (ej. `TX_Unidades.rol_sii`). Necesario cuando un mismo tipo de documento se sube más de una vez para la misma solicitud (un depto, un estacionamiento). |
+------------------------------+-----------------+-----------------+---------------------------------+
| version                        | Number (integer) | ---            | RN-28 (paralelo). Snapshot de la versión del atributo usada en cada extracción, para reproducir el mismo prompt años después aunque el catálogo evolucione. Antes vivía en D_Atributo; ahora vive aquí junto al resto de la definición consolidada. |
+------------------------------+-----------------+-----------------+---------------------------------+

`codigo` puede repetirse (ej. `rol_sii`) en varias filas si el mismo
atributo se reutiliza en distintos tipos de documento, cada una con su
propio `ejemplo_atributo`, `uso_tabla_destino` y
`uso_cardinalidad_destino`.

**Tabla nueva TX_Unidades (v1.6 · ampliada v1.8)**. Aunque por prefijo
pertenece al dominio TX\_ (§6.3), se referencia aquí porque es el
destino directo del enrutamiento `una_por_unidad`. Persiste una fila
por unidad física del inmueble. Schema real verificado vía MCP
(`tbl2QDLvJDyy3Rg2I`, 17-jul-2026): `clave_natural` (primary),
`solicitud` (Link → TX_Solicitudes), `subtipo` (Single select:
Departamento · Casa · Bodega · Estacionamiento · Terreno · Local ·
Terraza · Piscina · OO.CC. · Servidumbre), `es_principal` (Checkbox),
`rol_sii`, `numero_unidad`, `orden`, `notas`, `sup_m2`, `avaluo_uf`,
`sup_terreno_m2` (v1.8), `tipo_material` (v1.8 · Single select: madera
· albanileria · hormigon · mixto · perfiles_metalicos),
`anio_construccion`, `estado_unidad` (v1.8 · Single select: nueva ·
usada — RN-38), más links a `TX_Adjuntos` y
`TX_ItemsCuadroValoracion`. Complementa — no reemplaza — a
`TX_ItemsCuadroValoracion` (cuadro de valoración granular de IF-03).

**Patrón "NO REGISTRA" (RN-37, nuevo v1.6)**. Cuando un inmueble nuevo
aún no tiene ingreso al SII, los certificados de avalúo declaran
"NO REGISTRA" en los montos. El prompt de Claude debe reconocer el
patrón sin fallar: el texto crudo se preserva en `avaluo_total_raw` (en
la tabla destino que corresponda por `uso_tabla_destino`) y el flag
`avaluo_no_registra=TRUE` se propaga a `TX_DatosTasacion`. Caso
validado: HEV-3183 (Inmobiliaria Exequiel Fernández Torre Tres SpA).

**Fuente `foto_fuente_sii` y `estado_unidad` (RN-38, nuevo v1.8)**.
Para propiedades usadas, la fuente catastral primaria no es el
certificado de avalúo fiscal sino la consulta a la base interna del
SII (comuna + rol), registrada como foto y subida con tipo de
documento `foto_fuente_sii`. Declara 4 atributos con cardinalidad
`una_por_unidad`: `sup_terreno_m2`, `sup_m2`, `tipo_material`,
`anio_construccion`. Excepción: si la propiedad es nueva y aún no fue
cargada al SII (recepcionada hace menos de ~6 meses), la fuente es la
ficha/carta oferta de la inmobiliaria (`FICHA_INMOBILIARIA_NUEVA`, a
definir en `D_TipoDocumento`) en vez de `foto_fuente_sii`. El campo
`TX_Unidades.estado_unidad` ({nueva, usada}) resuelve por unidad cuál
tipo de documento aplica.

Regla de integridad transversal del dominio (RN-32, vigente):
exactamente uno de los tipos de valor esperados por `tipo_dato` debe
corresponder al valor persistido en `TX_Adjuntos.atributos_obtenidos`
para ese atributo. Ya no se valida vía Airtable Automation `AT-D01`
sobre una tabla EAV intermedia — el escritor (Airtable Script
`AT03-Ext`, invocado desde el blueprint Make SC-RF09) es responsable de
respetar el contrato de tipos al construir el JSON.

Independencia arquitectónica (RN-33, vigente): las dos tablas D\_ no
exhiben link record ni lookup ni rollup hacia M\_, C\_, TX\_, A\_, H\_ o
Z\_. Cualquier consumo desde el resto del sistema es por lectura
idempotente vía API. Esto permite migrar, exportar o archivar el
dominio D\_ por separado — mismo principio que en v2.6.2, ahora sobre
un dominio de dos tablas en lugar de ocho.

**Tablas deprecadas (v8.2 · v1.6)**: D_TipoDato, D_Catalogo,
D_CatalogoValor, D_Atributo, D_Documento, D_DocumentoValorAtributo. Se
documentan aquí únicamente para trazabilidad histórica de la migración;
no se crean instancias nuevas en ninguna de ellas. Cualquier
instalación de Airtable que aún conserve estas ocho tablas con datos
vivos (por ejemplo, por no haber ejecutado todavía la migración de
esquema descrita en esta sección) debe tratarse como un estado
transitorio pendiente de cierre, no como el diseño vigente — el diseño
vigente es el de dos tablas documentado arriba.

# 7. Motor de reglas de negocio parametrizable

Este es el componente arquitectónico más importante del sistema. Es lo
que permite que toda la lógica viva en datos editables y no en código.
Si esta sección funciona, el sistema funciona. Si esta sección queda
incompleta, el resto del sistema acumulará deuda técnica rápidamente.

## 7.1 Qué es y qué no es

  -----------------------------------------------------------------------
  **El motor SÍ es**                  **El motor NO es**
  ----------------------------------- -----------------------------------
  Una tabla (C_ReglasNegocio)         Un servicio externo
  consultable por SQL/Airtable        

  Un algoritmo simple de filtrado +   Un sistema con IA o ML
  scoring                             

  Resuelto en milisegundos por        Lento o complejo de razonar
  solicitud                           

  Editable por personas no técnicas   Algo que solo programadores
                                      entienden

  Auditable: cada decisión queda      Una caja negra
  registrada                          

  Reversible: cambios de reglas no    Riesgoso al modificar
  rompen el pasado                    
  -----------------------------------------------------------------------

## 7.2 Anatomía de una regla

Cada regla en C_ReglasNegocio tiene tres partes: FILTROS de entrada (qué
contextos matchea), RESULTADO (qué entrega), y METADATOS (prioridad,
vigencia). Una regla bien escrita se entiende sin saber programar.

+-----------------------------------------------------------------------+
| ***Estructura de una fila de C_ReglasNegocio***                       |
|                                                                       |
| // Regla #47 --- vive como una fila en C_ReglasNegocio                |
|                                                                       |
| {                                                                     |
|                                                                       |
| nombre: \"MetLife · Hipotecario · Depto Las Condes Premium\",         |
|                                                                       |
| descripcion: \"Para deptos en sector premium MetLife pide plantilla   |
| con foto aérea y desglose de avalúo detallado\",                      |
|                                                                       |
| // \-\-\-\-\-\-\-\-\-- FILTROS \-\-\-\-\-\-\-\-\--                    |
|                                                                       |
| cliente_filter: \[MetLife Chile\],                                    |
|                                                                       |
| tipo_informe_filter: \[Hipotecario\],                                 |
|                                                                       |
| tipo_prop_filter: \[Departamento\],                                   |
|                                                                       |
| comuna_filter: \[Las Condes, Vitacura, Lo Barnechea\],                |
|                                                                       |
| banco_filter: \[\], // vacío = todos los bancos                       |
|                                                                       |
| monto_min_uf: 0,                                                      |
|                                                                       |
| monto_max_uf: 50000,                                                  |
|                                                                       |
| // \-\-\-\-\-\-\-\-\-- RESULTADO \-\-\-\-\-\-\-\-\--                  |
|                                                                       |
| plantilla_resultado: C_Plantillas/12 (MetLife Hipotec Premium v1.2),  |
|                                                                       |
| formulas_resultado: \[F_UFm2_terreno, F_UFm2_construccion,            |
|                                                                       |
| F_ValorComercial, F_ValorRemate_65,                                   |
|                                                                       |
| F_SeguroIncendio\],                                                   |
|                                                                       |
| workflow_resultado: WF_Hipotecario_Premium,                           |
|                                                                       |
| factores_aplicables: \[FACTOR_REMATE_65, FACTOR_SEGURO_INCENDIO\],    |
|                                                                       |
| requiere_aprobacion_final: false,                                     |
|                                                                       |
| // \-\-\-\-\-\-\-\-\-- METADATOS \-\-\-\-\-\-\-\-\--                  |
|                                                                       |
| prioridad: 100,                                                       |
|                                                                       |
| especificidad: 4, // 4 filtros activos (formula)                      |
|                                                                       |
| vigente_desde: 2026-01-01,                                            |
|                                                                       |
| vigente_hasta: (vacío),                                               |
|                                                                       |
| activa: true                                                          |
|                                                                       |
| }                                                                     |
+=======================================================================+

## 7.3 Algoritmo de resolución

El motor es deliberadamente simple. La complejidad vive en los datos, no
en el algoritmo. El algoritmo se puede implementar como una Vista de
Airtable + un Script Airtable, o resolverse en un escenario Make.

+--------+---------------------------------------------------------------+
| **PASO | **Recoger contexto**                                          |
| 1**    |                                                               |
|        | Make junta cliente_id + tipo_informe_id + tipo_propiedad_id + |
|        | banco_id + comuna_id + monto_estimado en un objeto-contexto.  |
|        | Origen: TX_Solicitudes recién creada.                         |
+========+===============================================================+

**▼**

+--------+---------------------------------------------------------------+
| **PASO | **Filtrar reglas candidatas**                                 |
| 2**    |                                                               |
|        | Una vista Airtable filtra C_ReglasNegocio: para cada filtro   |
|        | de la regla, o bien está vacío (matchea cualquiera), o bien   |
|        | contiene el valor del contexto. Se obtienen N reglas          |
|        | candidatas. SIEMPRE incluye la wildcard.                      |
+========+===============================================================+

**▼**

+--------+---------------------------------------------------------------+
| **PASO | **Aplicar filtro de vigencia**                                |
| 3**    |                                                               |
|        | Descartar reglas con activa=false. Descartar las que tengan   |
|        | vigente_desde \> hoy o vigente_hasta \< hoy. Lo que queda son |
|        | las reglas elegibles.                                         |
+========+===============================================================+

**▼**

+--------+---------------------------------------------------------------+
| **PASO | **Ordenar por especificidad**                                 |
| 4**    |                                                               |
|        | Gana la regla con mayor especificidad. La fórmula de          |
|        | especificidad cuenta los filtros no vacíos. Una regla con 4   |
|        | filtros vence a una con 2.                                    |
+========+===============================================================+

**▼**

+--------+---------------------------------------------------------------+
| **PASO | **Desempatar por prioridad**                                  |
| 5**    |                                                               |
|        | Si dos reglas tienen igual especificidad, gana la de mayor    |
|        | prioridad. Permite forzar excepciones temporales sin          |
|        | reescribir el catálogo.                                       |
+========+===============================================================+

**▼**

+--------+---------------------------------------------------------------+
| **PASO | **Devolver y auditar**                                        |
| 6**    |                                                               |
|        | Make recibe plantilla_id, formulas\[\], workflow_id. Inserta  |
|        | una fila completa en A_DecisionesMotor con la regla ganadora, |
|        | las descartadas y la razón. Actualiza                         |
|        | TX_Solicitudes.regla_aplicada.                                |
+========+===============================================================+

## 7.4 La regla wildcard: la red de seguridad

Siempre debe existir una regla con TODOS los filtros vacíos. Es la red
de seguridad: si una solicitud no matchea ninguna regla específica, se
aplica esta. Sin la wildcard, el sistema podría quedarse sin saber qué
hacer ante un caso nuevo.

+-----------------------------------------------------------------------+
| // Regla wildcard (siempre existe, siempre activa)                    |
|                                                                       |
| {                                                                     |
|                                                                       |
| nombre: \"WILDCARD · Genérica del sistema\",                          |
|                                                                       |
| descripcion: \"Red de seguridad. Aplica si ninguna regla específica   |
| matchea.\",                                                           |
|                                                                       |
| cliente_filter: \[\],                                                 |
|                                                                       |
| tipo_informe_filter: \[\],                                            |
|                                                                       |
| tipo_prop_filter: \[\],                                               |
|                                                                       |
| banco_filter: \[\],                                                   |
|                                                                       |
| comuna_filter: \[\],                                                  |
|                                                                       |
| plantilla_resultado: C_Plantillas/01 (Genérica VProperty v1.0),       |
|                                                                       |
| formulas_resultado: \[F_UFm2_construccion, F_ValorComercial\],        |
|                                                                       |
| workflow_resultado: WF_Estandar,                                      |
|                                                                       |
| prioridad: 1, // la más baja                                          |
|                                                                       |
| especificidad: 0, // ninguna restricción                              |
|                                                                       |
| activa: true                                                          |
|                                                                       |
| }                                                                     |
+=======================================================================+

+-----------------------------------------------------------------------+
| **⚠ Reglas defensivas obligatorias en el sistema**                    |
|                                                                       |
| **1.** Debe existir exactamente UNA regla wildcard activa. Una vista  |
| \'Wildcards activas\' lo verifica diariamente.                        |
|                                                                       |
| **2.** Si una regla queda sin plantilla activa referenciada, debe     |
| alertar al admin (vista \'Reglas con plantilla rota\').               |
|                                                                       |
| **3.** No pueden existir dos reglas activas con misma especificidad y |
| prioridad. Vista \'Reglas en conflicto\' detecta esto.                |
|                                                                       |
| **4.** Toda regla con prioridad ≥ 900 (excepción temporal) debe tener |
| vigente_hasta definido. Vista \'Excepciones perpetuas\' alerta lo     |
| contrario.                                                            |
+=======================================================================+

## 7.5 Casos límite y cómo los maneja el motor

  -----------------------------------------------------------------------
  **Caso límite**         **Comportamiento del motor**
  ----------------------- -----------------------------------------------
  Ninguna regla matchea   Estado de la solicitud → requiere_atencion.
  (sin wildcard)          Evento severidad=critical en A_Eventos. Notif
                          inmediata al admin. Esto NO debería ocurrir
                          nunca si la wildcard está activa.

  Múltiples reglas con    Gana la más reciente (regla_id más alto). El
  misma especificidad y   conflicto queda registrado en A_DecisionesMotor
  prioridad               para resolución administrativa.

  Una fórmula             Ese cálculo se salta. Evento severidad=warning.
  referenciada no existe  El flujo continúa con las fórmulas restantes.
  o está desactivada      El visador ve la advertencia.

  La plantilla            El flujo se detiene en SC09. A_ErroresMake
  referenciada no existe  severidad=critical. El visador recibe alerta
                          inmediata.

  Regla marcada           Nunca se considera. Permite \'deshabilitar sin
  activa=false            borrar\' para revisión histórica.

  Regla con vigente_desde No se considera todavía. Se activa
  futuro                  automáticamente en su fecha sin intervención.

  Regla con vigente_hasta Se descarta. La regla se considera
  vencido                 \'retirada\'. No se borra: queda para
                          auditoría.
  -----------------------------------------------------------------------

## 7.6 Ejemplo completo: tres reglas y una solicitud

Caso: una solicitud entra con cliente=MetLife, tipo_informe=Hipotecario,
tipo_propiedad=Departamento, comuna=Vitacura, monto=12.000 UF.

  -------------------------------------------------------------------------------------------------
  **Regla**       **Filtros**         **Especif.**   **Prioridad**   **Vigencia**   **¿Matchea?**
  --------------- ------------------- -------------- --------------- -------------- ---------------
  #45 --- MetLife cliente=MetLife     1              10              Permanente     ✓ Sí
  Genérica                                                                          

  #46 --- MetLife cliente=MetLife,    2              20              Permanente     ✓ Sí
  Hipotec.        tipo=Hipotecario                                                  

  #47 --- MetLife cliente=MetLife,    4              100             Permanente     ✓ Sí
  Hipotec Depto   tipo=Hipotec.,                                                    
  Las Condes      prop=Depto,                                                       
                  comuna∈{Las Condes,                                               
                  Vitacura, Lo                                                      
                  Barnechea}                                                        

  #48 --- Sect.   cliente=MetLife,    2              50              Permanente     ✓ Sí
  premium \>10K   monto_min=10000                                                   
  UF                                                                                
  -------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **✓ Resultado de la evaluación**                                      |
|                                                                       |
| Las 4 reglas matchean. Por especificidad gana la #47 (4 filtros)      |
| sobre las demás. El registro en A_DecisionesMotor queda:              |
|                                                                       |
| • reglas_candidatas: \[45, 46, 47, 48\]                               |
|                                                                       |
| • regla_ganadora: 47                                                  |
|                                                                       |
| • razon_ganadora: \'Mayor especificidad (4 vs 2,2,1)\'                |
|                                                                       |
| • resultado_aplicado: { plantilla: MetLife_Hipotec_Premium_v1.2,      |
| formulas: \[\...\], workflow: WF_Hipotecario_Premium }                |
+=======================================================================+

+-----------------------------------------------------------------------+
| **★ Cómo crear una excepción temporal de un mes**                     |
|                                                                       |
| Imagina que MetLife pide una plantilla especial solo durante          |
| diciembre 2026 para una campaña. En lugar de modificar las reglas     |
| existentes, agregas una nueva con prioridad=999,                      |
| vigente_desde=2026-12-01, vigente_hasta=2026-12-31. Esta regla ganará |
| durante diciembre y se autodescartará el 1 de enero. CERO             |
| intervención manual.                                                  |
+=======================================================================+

# 8. Motor parametrizable extendido

El motor de reglas (capítulo 7) define QUÉ aplicar. Pero ese \'qué\'
necesita componentes parametrizables a su vez. Esta sección documenta
cómo se construyen y se mantienen los componentes que el motor consume:
plantillas, fórmulas, workflows, factores, equivalencias.

## 8.1 La tríada parametrizable

El motor de reglas devuelve tres referencias: a una plantilla, a una
lista de fórmulas y a un workflow. Estas tres tablas son la \'tríada
parametrizable\'. Si cambian, cambia el comportamiento del sistema.

+----------------------+----------------------+-----------------------+
| **PLANTILLA**        | **FÓRMULAS**         | **WORKFLOW**          |
|                      |                      |                       |
| C_Plantillas         | C_Formulas           | C_Workflows           |
|                      |                      |                       |
| *Cómo se ve el       | *Qué se calcula*     | *Qué pasos seguir*    |
| informe*             |                      |                       |
|                      | Expresión            | Secuencia de acciones |
| .docx en Dropbox     | declarativa          |                       |
|                      |                      | Ejecutada por Make    |
| Editable en Word     | Versionada al uso    |                       |
+======================+======================+=======================+

## 8.2 Cómo se mantiene cada componente sin tocar Make

  -------------------------------------------------------------------------
  **Necesidad de     **Qué tablas se editan**                  **Tiempo
  negocio**                                                    estimado**
  ------------------ ----------------------------------------- ------------
  Agregar un cliente M_Clientes (insert) → C_VariablesCliente  30-60 min
  nuevo              (insert según cliente) → C_ReglasNegocio  
                     (insert con cliente_filter)               

  Subir nueva        Dropbox (upload .docx) → C_Plantillas     10-15 min
  versión de         (insert nueva versión, anterior pasa a    
  plantilla          H_PlantillasAnteriores)                   

  Cambiar una        C_Formulas (insert nueva versión,         10 min
  fórmula (ej. %     desactivar anterior). Las solicitudes en  
  remate)            curso conservan la vieja por snapshot.    

  Crear excepción    C_ReglasNegocio (insert con prioridad     5 min
  temporal           alta y vigencia limitada)                 

  Cambiar            C_NotificacionesConfig (editar            2 min
  destinatarios de   destinatarios_to o destinatarios_cc)      
  un email                                                     

  Ajustar SLA por    C_SLA (insert o update)                   5 min
  cliente y tipo                                               

  Cambiar el         C_Factores (insert nueva versión,         5 min
  coeficiente de un  desactivar anterior)                      
  factor                                                       

  Nuevo tipo de      M_TiposPropiedad (insert) → ajustar       15 min
  propiedad          C_ReglasNegocio si aplica                 

  Mapeo cliente      C_Equivalencias (insert)                  3 min
  externo → interno                                            

  Ver qué Automation C_AutomationsAirtable (consulta)          2 min
  Airtable hace qué                                            
  -------------------------------------------------------------------------

## 8.3 El proceso de cambio seguro

Toda modificación de la tríada parametrizable sigue el mismo protocolo.
Si el equipo lo respeta, el sistema NUNCA queda en estado inconsistente.

> **1.** Crear el nuevo registro con activa=false (no se aplica todavía)
>
> **2.** Documentar en el campo descripcion o cambios_version qué cambia
> respecto a la versión vigente
>
> **3.** Ejecutar el \'test seco\' (sección 7.5 del documento padre): el
> sistema corre el motor contra 10-20 solicitudes históricas y muestra
> el delta
>
> **4.** Solo si el test seco no produce regresiones inesperadas, marcar
> activa=true
>
> **5.** Marcar activa=false la versión anterior (las solicitudes en
> curso conservan snapshot)
>
> **6.** Mover la versión anterior a H_PlantillasAnteriores o
> H_FormulasAnteriores según corresponda
>
> **7.** Validar la primera solicitud real procesada con la versión
> nueva antes de cerrar la jornada

+-----------------------------------------------------------------------+
| **▌ Por qué este protocolo NO se puede saltar**                       |
|                                                                       |
| Porque el sistema procesa solicitudes en paralelo y hay solicitudes   |
| en distintos estados. Si una solicitud está en estado calculada (ya   |
| aplicaron fórmulas) y cambias la fórmula \'en vivo\', el PDF que se   |
| genere usará la fórmula nueva pero los cálculos en TX_Calculos serán  |
| los de la fórmula vieja. Esa inconsistencia es exactamente lo que la  |
| arquitectura quiere evitar.                                           |
+=======================================================================+

## 8.4 Componentes parametrizables · catálogo extendido

  -----------------------------------------------------------------------------
  **Componente**    **Tabla**                **Quién lo edita** **Frecuencia de
                                                                cambio**
  ----------------- ------------------------ ------------------ ---------------
  Reglas de negocio C_ReglasNegocio          Admin / Analista   Mensual
                                             funcional          (excepciones
                                                                más frecuentes)

  Plantillas        C_Plantillas + Dropbox   Admin              Trimestral por
  Carbone                                                       cliente

  Fórmulas de       C_Formulas               Admin +            Anual o ante
  cálculo                                    Especialista       cambio
                                             Migración          regulatorio

  Workflows         C_Workflows +            Implementador      Muy poco
                    C_WorkflowPasos                             frecuente

  Variables del     C_VariablesCliente       Admin              Al cambiar
  cliente                                                       logo, firma,
                                                                pie legal

  Notificaciones    C_NotificacionesConfig   Admin              Cuando cambian
                                                                destinatarios o
                                                                textos

  SLA               C_SLA                    Admin / Comercial  Al renegociar
                                                                con un cliente

  Factores y        C_Factores               Admin              Anual o por
  coeficientes                                                  requerimiento
                                                                del cliente

  Equivalencias     C_Equivalencias          Implementador      Al integrar
                                                                nuevo sistema
                                                                externo
  -----------------------------------------------------------------------------

# 9. DISEÑO DETALLADO DE FORMULARIOS

Los formularios **no son interfaces secundarias**. Son **la interfaz
crítica que alimenta el cerebro central**. Un dato mal capturado activa
una regla incorrecta, que aplica una fórmula equivocada, que produce un
PDF inválido. *Cada formulario está diseñado para que el motor de reglas
pueda decidir solo.*

+-----------------------------------------------------------------------+
| **▌ Filosofía de diseño**                                             |
|                                                                       |
| El usuario ingresa lo mínimo posible. El sistema infiere el resto.    |
| Cada campo del formulario tiene una contraparte exacta en una tabla   |
| del modelo, y cada combinación de campos activa una resolución        |
| determinista del motor de reglas.                                     |
+=======================================================================+

## 9.1 Mapa de formularios del sistema

Ocho formularios cubren el ciclo completo. Cada uno tiene un responsable
único, una etapa única y dispara una transición de estado verificable.

  --------------------------------------------------------------------------------------------------
  **Código**   **Formulario**    **Usuario**       **Plataforma**   **Etapa**       **Criticidad**
  ------------ ----------------- ----------------- ---------------- --------------- ----------------
  F1           Solicitud externa Solicitante       App Next.js +    Ingreso         MUY ALTA
               de tasación       (banco/cliente)   Clerk (portal                    
                                                   web público en                   
                                                   Railway)                         

  F2           Ingreso interno   Ejecutivo         Airtable         Ingreso interno ALTA
               de solicitud      comercial         Interface                        

  F3           Captura en        Tasador           App Next.js +    Visita técnica  MUY ALTA
               terreno                             Clerk (PWA                       
                                                   mobile-first en                  
                                                   Railway)                         

  F4           Revisión y visado Visador / Revisor Airtable         Visado          ALTA
                                                   Interface                        

  F5           Aprobación final  Aprobador         Airtable         Aprobación      MUY ALTA
                                 (Héctor)          Interface        final           

  F6           Operación y       Operador interno  Airtable         Operación       MEDIA
               gestión                             Interface        continua        

  F7           Parametrización   Administrador /   Airtable         Configuración   MUY ALTA
               del motor         Parametrizador    Interface                        

  F8           Supervisión y     Supervisor /      Airtable         Monitoreo       BAJA (consulta)
               KPIs              Gerencia          Dashboard                        
  --------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Convención de nomenclatura**                                      |
|                                                                       |
| Los formularios se prefijan con F seguido de un número. Internamente  |
| cada formulario tiene un código único que viaja en el campo           |
| origen_formulario de TX_Solicitudes y queda registrado en A_Eventos   |
| para trazabilidad completa.                                           |
+=======================================================================+

## 9.2 Formulario F1 --- Solicitud externa de tasación

+-----------------------------------------------------------------------+
| **F1 · Solicitud externa de tasación**                                |
|                                                                       |
| Usuario: **Solicitante (ejecutivo del banco o cliente final)** \|     |
| Etapa: **Punto de entrada del sistema** \| Frecuencia: **Cientos por  |
| día** \| Criticidad: **MUY ALTA**                                     |
+=======================================================================+

### Objetivo funcional

Capturar el mínimo de datos imprescindibles para que el motor pueda
resolver: cliente, banco, tipo de informe, tipo de propiedad, comuna,
monto estimado. No se pide nada que el sistema pueda inferir.

### Plataforma y por qué

App Next.js + Clerk desplegada en Railway (portal web público). Razones:
(1) no requiere cuenta Airtable para usuarios externos ---Clerk gestiona
el acceso opcional; el flujo principal funciona sin login---, (2) URL
única por cliente con parámetros pre-cargados, (3) lógica condicional
resuelta en componentes React + Tailwind, (4) cliente Airtable tipado
con Zod en server-side para lecturas + webhook Make para escrituras.

### Campos del formulario

  ------------------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**      **Obligatorio**   **Comportamiento / Validación**
  -------- ---------------- ------------- ----------------- --------------------------------------
  1        Cliente          Lista         Sí                Pre-cargado por URL parametrizada. Si
           solicitante      desplegable                     no llega por URL: lista de clientes
                                                            activos. Único campo que el sistema NO
                                                            puede inferir.

  2        Banco asociado   Lista         Solo si           Aparece dinámicamente si el cliente
                            desplegable   cliente=banco     seleccionado tiene tipo=\'Banco\' en
                            condicional                     M_Clientes.

  3        Sucursal /       Texto corto   No                Opcional. Auditoría comercial para
           oficina origen                                   reportes por sucursal.

  4        Tipo de informe  Lista         Sí                Lista filtrada por cliente: solo
                            desplegable                     informes habilitados en
                                                            M_Clientes.tipos_informe_permitidos.

  5        Tipo de          Lista         Sí                Catálogo M_TiposPropiedad. Si cliente
           propiedad        desplegable                     tiene restricción, lista filtrada.

  6        Subtipo /        Lista         Condicional       Aparece solo si tipo_propiedad lo
           detalle          condicional                     requiere (ej: depto → subtipo
                                                            \'duplex/loft/oficina\').

  7        Región           Lista         Sí                Catálogo M_Comunas agrupado por
                            desplegable                     región. Filtra siguiente campo.

  8        Comuna           Lista         Sí                Filtrada por región. Trae
                            dependiente                     automáticamente datos UF y coeficiente
                                                            de zona.

  9        Dirección        Texto largo   Sí                Validación: mínimo 8 caracteres.
                                                            Sugerencia de autocompletado vía
                                                            Google Places (opcional).

  10       Rol SII          Texto con     Sí (configurable  Máscara: 99999-9. Validación de dígito
                            máscara       por cliente)      verificador opcional según cliente.

  11       Monto estimado   Número        No                Disparador opcional de reglas por
           (UF)                                             rango: ej. \>25.000 UF activa regla
                                                            \'alto valor\'.

  12       Plazo solicitado Número entero Sí                Default: SLA del cliente desde C_SLA.
           (días)                                           Editable para urgencias.

  13       Prioridad        Selector      No                Valores: Normal / Urgente / Crítico.
                            único                           Solo Urgente/Crítico requieren
                                                            justificación.

  14       Contacto en      Texto corto   Sí                Quién recibe al tasador.
           terreno: nombre                                  

  15       Contacto:        Texto con     Sí                Máscara: +56 9 9999 9999. Validación
           teléfono         máscara                         regex.

  16       Contacto: email  Email         Sí                Validación formato. Receptor de
                                                            notificaciones.

  17       Observaciones    Texto largo   No                Campo libre para contexto especial.
           del solicitante                                  

  18       Adjuntos         Upload        No                Antecedentes (escritura, CBR, plano).
           iniciales        múltiple                        Se guardan en TX_Adjuntos.
  ------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Lógica condicional y campos dinámicos**                           |
|                                                                       |
| **•** Campo \'Banco asociado\' aparece solo si M_Clientes.tipo =      |
| \'Banco\'.                                                            |
|                                                                       |
| **•** Campo \'Subtipo\' aparece solo si                               |
| M_TiposPropiedad.requiere_subtipo = true.                             |
|                                                                       |
| **•** Lista \'Comuna\' se filtra dinámicamente al elegir Región.      |
|                                                                       |
| **•** Plazo por defecto se autocompleta desde C_SLA según cliente +   |
| tipo_informe.                                                         |
|                                                                       |
| **•** Justificación obligatoria si Prioridad = Urgente o Crítico.     |
|                                                                       |
| **•** Si cliente tiene M_Clientes.requiere_rol_sii_validado = true,   |
| se exige máscara con dígito verificador correcto.                     |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Crea registro en:** TX_Solicitudes con estado = \'creada\'.       |
|                                                                       |
| **→ Escribe en:** A_Eventos un evento tipo \'solicitud_creada\' con   |
| timestamp y payload completo.                                         |
|                                                                       |
| **→ Dispara escenario Make:** SC01 - validación inicial y asignación  |
| de tasador.                                                           |
|                                                                       |
| **→ Lanza resolución:** El motor de reglas evalúa C_ReglasNegocio y   |
| precarga la regla candidata en A_DecisionesMotor.                     |
|                                                                       |
| **→ Genera notificación:** Email automático al ejecutivo comercial    |
| del cliente con código VP-AAAA-XXXX.                                  |
|                                                                       |
| **→ Marca SLA inicial:** Inicia contador de plazo según C_SLA.        |
+=======================================================================+

+-----------------------------------------------------------------------+
| **⚠ Riesgo crítico de F1**                                            |
|                                                                       |
| Es el único formulario en manos de usuarios externos. Un error aquí   |
| contamina toda la cadena. Por eso: validaciones agresivas, listas     |
| restringidas, ninguna pregunta abierta crítica, y un evento A_Eventos |
| por cada submit (válido o inválido).                                  |
+=======================================================================+

## 9.3 Formulario F2 --- Ingreso interno de solicitud

+-----------------------------------------------------------------------+
| **F2 · Ingreso interno de solicitud**                                 |
|                                                                       |
| Usuario: **Ejecutivo comercial** \| Etapa: **Casos directos /         |
| clientes sin portal** \| Frecuencia: **Diaria** \| Criticidad:        |
| **ALTA**                                                              |
+=======================================================================+

### Objetivo funcional

Permitir que un ejecutivo comercial ingrese solicitudes que llegan por
canales no automatizados (teléfono, email, WhatsApp, presencial). Es la
versión interna de F1, con campos adicionales que un usuario externo no
debería ver ni tocar.

### Plataforma

Airtable Interface (vista \'Nueva solicitud\') con permisos restringidos
al rol Ejecutivo. Permite además adjuntar evidencia del canal de origen
(captura de WhatsApp, email reenviado, etc.).

### Campos adicionales sobre F1

  -------------------------------------------------------------------------------------------
  **\#**   **Campo**       **Tipo**             **Obligatorio**   **Comportamiento /
                                                                  Validación**
  -------- --------------- -------------------- ----------------- ---------------------------
  \+       Canal de origen Selector             Sí                WhatsApp / Email / Teléfono
                                                                  / Presencial / Otro.
                                                                  Auditoría comercial.

  \+       Evidencia del   Adjuntos             No                Captura, email reenviado,
           canal                                                  etc.

  \+       Asignación      Lookup a M_Tasadores No                Override: si el ejecutivo
           manual de                                              conoce al tasador adecuado,
           tasador                                                lo asigna. Si no, el motor
                                                                  decide.

  \+       Override de     Selector con         No                Solo ejecutivos con permiso
           prioridad       justificación                          elevado pueden saltar la
                                                                  prioridad calculada.

  \+       Acuerdo         Lookup a             No                Permite invocar condiciones
           comercial       C_VariablesCliente                     especiales preacordadas con
           especial                                               el cliente.

  \+       Notas internas  Texto largo          No                Visible solo para operación
                                                                  interna, nunca aparece en
                                                                  PDF.
  -------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Campos heredados automáticamente**                                |
|                                                                       |
| **•** Email del ejecutivo se autocompleta desde su perfil de          |
| Airtable.                                                             |
|                                                                       |
| **•** Cliente y SLA por defecto se cargan al elegir el cliente del    |
| catálogo M_Clientes.                                                  |
|                                                                       |
| **•** Tasador sugerido: el motor propone el de mejor rating en la     |
| comuna y el ejecutivo confirma o cambia.                              |
|                                                                       |
| **•** Campos de F1 visibles, editables y validados con las mismas     |
| reglas.                                                               |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Crea registro en:** TX_Solicitudes con estado = \'creada\' y      |
| campo origen_canal poblado.                                           |
|                                                                       |
| **→ Escribe en:** A_Eventos evento \'solicitud_creada_interna\' con   |
| autor = email del ejecutivo.                                          |
|                                                                       |
| **→ Dispara escenario Make:** SC02 - mismo flujo de validación pero   |
| con etiqueta \'ingreso_manual\'.                                      |
|                                                                       |
| **→ Activa override:** Si hay asignación manual de tasador, se salta  |
| la lógica de asignación automática.                                   |
+=======================================================================+

## 9.4 Formulario F3 --- Captura en terreno

+-----------------------------------------------------------------------+
| **F3 · Captura en terreno**                                           |
|                                                                       |
| Usuario: **Tasador** \| Etapa: **Visita técnica al inmueble** \|      |
| Frecuencia: **1 por solicitud** \| Criticidad: **MUY ALTA**           |
+=======================================================================+

### Objetivo funcional

Recolectar todos los datos técnicos del inmueble necesarios para que las
fórmulas paramétricas calculen el valor. Diseñado para móvil. Pensado
para minimizar errores de tipeo bajo presión, con clima, mala señal y
sin escritorio.

### Plataforma y razones

App Next.js + Clerk en Railway (PWA mobile-first) con URL única por
solicitud (parámetro id_solicitud, accesible tras login Clerk). El
tasador recibe el link por email/WhatsApp al ser asignado. Funciona
parcialmente offline: el formulario hace autosave a localStorage cada 30
s; las fotos se comprimen en cliente (max 1600 px / \~1 MB) antes de
subir. Razones: control total sobre el flujo de upload (el límite de 4.5
MB de Vercel obliga a Railway), integración nativa con Clerk para auth,
código en GitHub mantenible con Claude Code, y se preserva el principio
\'lógica en Airtable\'.

### Campos del formulario (agrupados)

#### Sección A --- Identificación de la solicitud

  ------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**   **Obligatorio**   **Comportamiento /
                                                         Validación**
  -------- ---------------- ---------- ----------------- -----------------------------
  A1       Código solicitud Texto      Auto              VP-AAAA-XXXX pre-cargado
                            (solo                        desde URL.
                            lectura)                     

  A2       Dirección        Toggle     Sí                Confirma que la dirección
           verificada en                                 original es correcta.
           terreno                                       

  A3       Dirección        Texto      Condicional       Aparece solo si A2 = No.
           corregida        largo                        Activa workflow de
                                                         validación.

  A4       Fecha y hora de  DateTime   Sí                Auto-completado al iniciar el
           visita                                        formulario.
  ------------------------------------------------------------------------------------

#### Sección B --- Características constructivas

  ----------------------------------------------------------------------------------------------------------------
  **\#**   **Campo**          **Tipo**      **Obligatorio**   **Comportamiento / Validación**
  -------- ------------------ ------------- ----------------- ----------------------------------------------------
  B1       Superficie útil    Número        Sí                Min 1, Max 99999. Disparador de regla: si \<30 m² →
           (m²)               decimal                         tipo \'estudio\'.

  B2       Superficie terreno Número        Condicional       Aparece solo si tipo_propiedad incluye terreno.
           (m²)               decimal                         

  B3       Año de             Número entero Sí                Min 1850, Max año actual. Calcula factor de
           construcción                                       antigüedad.

  B4       Material           Lista         Sí                Catálogo desde M_TiposPropiedad.materiales_validos.
           predominante       desplegable                     

  B5       Calidad de         Selector 1-5  Sí                Mapea a coeficiente desde C_Factores.calidad.
           construcción       estrellas                       

  B6       Estado de          Selector 1-5  Sí                Igual que B5, sobre eje \'conservación\'.
           conservación                                       

  B7       Número de pisos    Número entero Condicional       Solo casas. Min 1, Max 10.

  B8       Número de          Número entero Sí                Min 0, Max 20.
           dormitorios                                        

  B9       Número de baños    Número entero Sí                Min 0, Max 20.

  B10      Estacionamientos   Número entero Sí                Min 0, Max 20.

  B11      Bodegas            Número entero No                Default 0.

  B12      Agrupación de la   Lista         Condicional       \[GAP TX-G4a\] Aislada · Pareada · Continua ·
           propiedad          desplegable                     Edificio · Condominio. Aparece si
                                                              M_TiposPropiedad.agrupacion_propiedad_aplica=true.
                                                              Dispara alerta asbesto si Edificio/Condominio y
                                                              B3\<1995 (RB-20).

  B13      Velocidad de venta Lista         Condicional       \[GAP TX-G5\] 9 tramos (1-2m ... +24m). Obligatorio
           estimada           desplegable                     si tipo_informe ∈ {Hipotecario, Remate,
                                                              Liquidación}. De aquí sale el Factor de Remate vía
                                                              C_Factores (RB-37, RB-8).

  B14      Roles SII de       Texto (lista) Condicional       \[GAP TX-G2\] Aparece si B10\>0. Lista de roles
           estacionamientos                                   separados por coma. La cantidad debe coincidir con
                                                              B10 (RB-17, RB-46).

  B15      Roles SII de       Texto (lista) Condicional       \[GAP TX-G2\] Aparece si B11\>0. Lista de roles
           bodegas                                            separados por coma. La cantidad debe coincidir con
                                                              B11 (RB-17, RB-46).
  ----------------------------------------------------------------------------------------------------------------

#### Sección C --- Entorno y comparables

  ----------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**       **Obligatorio**   **Comportamiento /
                                                             Validación**
  -------- ---------------- -------------- ----------------- -----------------------------
  C1       Plusvalía del    Selector 1-5   Sí                Coeficiente desde
           sector                                            C_Factores.plusvalia.

  C2       Conectividad /   Selector 1-5   Sí                Idem, eje \'conectividad\'.
           transporte                                        

  C3       Servicios        Multi-select   No                Comercio / Educación / Salud
           cercanos                                          / Áreas verdes. Suma puntos.

  C4       Hay riesgo       Toggle         Sí                Inundación / sísmico /
           identificable                                     industrial / otro.

  C5       Detalle del      Texto largo    Condicional       Solo si C4 = Sí. Activa regla
           riesgo                                            de revisión adicional.

  C6       Comparables      Subform (3 a   Sí                Mínimo 3 transacciones
           registrados      5)                               comparables: dirección, sup,
                                                             valor UF, fuente, fecha.
  ----------------------------------------------------------------------------------------

#### Sección D --- Evidencia visual

  ------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**   **Obligatorio**   **Comportamiento /
                                                         Validación**
  -------- ---------------- ---------- ----------------- -----------------------------
  D1       Fotos exteriores Upload     Sí                Mínimo 4 fotos: fachada,
                            múltiple                     accesos, calle, entorno.

  D2       Fotos interiores Upload     Sí                Mínimo 6 fotos: living,
                            múltiple                     cocina, dormitorios, baños.

  D3       Plano croquis    Upload     No                Si está disponible.

  D4       Observaciones    Texto      Sí                Texto libre que puede
           del tasador      largo                        aparecer en el PDF según
                                                         plantilla.
  ------------------------------------------------------------------------------------

#### Sección E --- Cuadro de valoración granular \[GAP TX-G1, TX-G3, TX-G4b\]

Sección agregada en la adenda v2.1. Sustituye el cuadro de la Portada
del XLSM. Cada ítem es una fila en TX_ItemsCuadroValoracion. Es el
insumo de 6 reglas de validación cruzada.

  -------------------------------------------------------------------------------------
  **\#**   **Campo**         **Tipo**   **Obligatorio**   **Comportamiento /
                                                          Validación**
  -------- ----------------- ---------- ----------------- -----------------------------
  E1       Ítems del cuadro  Subform (1 Sí                Por cada ítem: descripción,
           de valoración     a 15)                        subtipo, rol SII, sup m²,
                                                          flags (regularizable, estado,
                                                          garantía). Llena
                                                          TX_ItemsCuadroValoracion. La
                                                          suma de m² de edificación
                                                          debe cuadrar con B1 (RB-21,
                                                          RB-42). El rol de cada ítem
                                                          debe existir (RB-43). Terraza
                                                          → factor 0.5 (RB-38).

  E2       Obras             Subform (0 No                Piscina, quincho, cierre,
           complementarias   a 5)                         etc. Llena
                                                          TX_ObrasComplementarias. Se
                                                          suman al comercial sin
                                                          depreciar (RB-6).

  E3       Superficie primer Número     Condicional       \[GAP TX-G4b\] Solo casas.
           piso (m²)         decimal                      Usado por RB-44 (coef.
                                                          ocupación de suelo).

  E4       Superficie        Número     No                \[GAP TX-G4b\] Resta en el
           servidumbre (m²)  decimal                      denominador del coef. de
                                                          ocupación (RB-44).
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ UX optimizada para terreno**                                      |
|                                                                       |
| **•** Botones grandes, contraste alto, fuente legible bajo sol.       |
|                                                                       |
| **•** Cada sección se guarda automáticamente al avanzar (no se pierde |
| por mala señal).                                                      |
|                                                                       |
| **•** Sliders y selectores en vez de cajas de texto siempre que sea   |
| posible.                                                              |
|                                                                       |
| **•** Cámara del teléfono integrada en los uploads de fotos.          |
|                                                                       |
| **•** Validación en tiempo real: errores visibles antes de avanzar.   |
|                                                                       |
| **•** Indicador de progreso (3 de 5 secciones completadas).           |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Llena tabla:** TX_DatosTasacion con todos los datos técnicos.     |
|                                                                       |
| **→ Sube adjuntos:** TX_Adjuntos con tipo=\'foto_exterior\',          |
| \'foto_interior\', \'plano\', \'otro\'.                               |
|                                                                       |
| **→ Cambia estado:** TX_Solicitudes.estado pasa de \'asignada\' a     |
| \'visitada\'.                                                         |
|                                                                       |
| **→ Dispara escenario Make:** SC05 - cálculo automático. Lee la regla |
| ganadora ya seleccionada y aplica la fórmula correspondiente.         |
|                                                                       |
| **→ Escribe en:** A_Eventos evento \'terreno_completado\' con autor = |
| tasador y geolocalización (opcional).                                 |
|                                                                       |
| **→ Activa workflow:** Si hubo dirección corregida (A3) o riesgo (C4) |
| → workflow de revisión adicional antes de pasar a visado.             |
+=======================================================================+

## 9.5 Formulario F4 --- Revisión y visado

+-----------------------------------------------------------------------+
| **F4 · Revisión y visado**                                            |
|                                                                       |
| Usuario: **Visador / Revisor** \| Etapa: **Control de calidad         |
| técnico** \| Frecuencia: **Por cada solicitud calculada** \|          |
| Criticidad: **ALTA**                                                  |
+=======================================================================+

### Objetivo funcional

El visador revisa el informe técnicamente: coherencia de comparables,
razonabilidad del valor, completitud de evidencias. Puede aprobar,
devolver al tasador con observaciones, o escalar al aprobador final.

### Plataforma

Airtable Interface con vista \'Por revisar\'. Muestra el PDF generado,
los datos crudos, los comparables y la fórmula aplicada con su versión
exacta. Permite ver el snapshot de la regla y de la fórmula tal como se
aplicó.

### Campos del formulario

  ---------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**      **Obligatorio**   **Comportamiento /
                                                            Validación**
  -------- ---------------- ------------- ----------------- -----------------------------
  1        Decisión del     Selector      Sí                Aprobar / Devolver al tasador
           visador          único                           / Escalar a aprobador final.

  2        Comentarios      Texto largo   Condicional       Obligatorio si decisión =
           técnicos                                         Devolver o Escalar.

  3        Checklist        Multi-check   Sí                Coherencia comparables /
           técnico                                          Razonabilidad valor / Fotos
                                                            completas / Datos
                                                            consistentes / Sin riesgos
                                                            sin marcar.

  4        Valor sugerido   Número        No                Si difiere del valor
           alternativo (UF)                                 calculado, justificar.

  5        Justificación    Texto largo   Condicional       Obligatorio si campo 4 está
           del valor                                        poblado.
           alternativo                                      

  6        Marcar como caso Toggle        No                Útil para capacitar tasadores
           de aprendizaje                                   nuevos.
  ---------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Comparación visual obligatoria**                                  |
|                                                                       |
| **•** La interfaz muestra lado a lado: datos capturados en F3 +       |
| cálculo automático + valor sugerido por el motor.                     |
|                                                                       |
| **•** El visador NO puede aprobar sin haber marcado al menos 4 ítems  |
| del checklist.                                                        |
|                                                                       |
| **•** Si selecciona \'Devolver\', el campo de comentarios técnicos es |
| obligatorio y se le hace visible al tasador al reabrir F3.            |
|                                                                       |
| **•** Botón \'Ver historial de la propiedad\': busca tasaciones       |
| previas de la misma dirección en H_Solicitudes_Cerradas.              |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Si decisión = Aprobar:** Estado pasa a \'pendiente_final\'.       |
| Notifica al aprobador (Héctor).                                       |
|                                                                       |
| **→ Si decisión = Devolver:** Estado vuelve a \'asignada\'. Notifica  |
| al tasador con los comentarios. Incrementa contador de re-visitas.    |
|                                                                       |
| **→ Si decisión = Escalar:** Estado pasa a \'requiere_atencion\'.     |
| Notifica a gerencia.                                                  |
|                                                                       |
| **→ Escribe en:** A_Eventos evento \'visado_realizado\' con decisión  |
| y checklist completo.                                                 |
|                                                                       |
| **→ Activa SLA:** Recalcula plazo restante según política de          |
| re-visitas.                                                           |
+=======================================================================+

## 9.6 Formulario F5 --- Aprobación final

+-----------------------------------------------------------------------+
| **F5 · Aprobación final**                                             |
|                                                                       |
| Usuario: **Aprobador final (Héctor)** \| Etapa: **Decisión final      |
| antes de entregar** \| Frecuencia: **Por cada tasación visada** \|    |
| Criticidad: **MUY ALTA**                                              |
+=======================================================================+

### Objetivo funcional

Última instancia. Quien firma con su nombre el informe entregado al
cliente. Decide si se entrega tal cual, se devuelve para ajustes o se
rechaza definitivamente.

### Plataforma

Airtable Interface \'Aprobaciones pendientes\'. Muestra todo el
contexto: solicitud original, terreno, cálculo, visado, PDF, e historial
completo del inmueble si existe.

### Campos del formulario

  ------------------------------------------------------------------------------------------
  **\#**   **Campo**       **Tipo**             **Obligatorio**   **Comportamiento /
                                                                  Validación**
  -------- --------------- -------------------- ----------------- --------------------------
  1        Decisión final  Selector único       Sí                Aprobar y entregar /
                                                                  Devolver a visador /
                                                                  Rechazar definitivamente.

  2        Firma digital   Toggle confirmatorio Si aprueba        Reconfirmación. Marca
                                                                  aprobado_por = email del
                                                                  aprobador.

  3        Comentarios     Texto largo          Condicional       Obligatorio si Devolver o
                                                                  Rechazar.

  4        Variables       Multi-lookup         No                Permite invocar
           especiales a    C_VariablesCliente                     condiciones especiales
           aplicar                                                preacordadas (ej. \'piloto
                                                                  cliente X\').

  5        Notas para el   Texto largo          No                Si se desea agregar
           cliente                                                comentario que aparezca en
                                                                  el email de entrega.

  6        Generar versión Toggle               No                Si se requiere copia con
           adicional                                              marca de agua o formato
                                                                  distinto.
  ------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Comportamiento clave**                                            |
|                                                                       |
| **•** Solo aparecen aquí solicitudes con estado =                     |
| \'pendiente_final\'.                                                  |
|                                                                       |
| **•** El aprobador ve el snapshot exacto de la regla ganadora y la    |
| fórmula aplicada --- no la versión actual, sino la versión vigente al |
| momento del cálculo.                                                  |
|                                                                       |
| **•** Botón \'Ver historial completo\' abre todo el árbol A_Eventos   |
| de la solicitud.                                                      |
|                                                                       |
| **•** Doble confirmación obligatoria al aprobar (toggle + botón) para |
| evitar clicks accidentales.                                           |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Si Aprobar:** Estado pasa a \'aprobada\'. Dispara SC10            |
| (generación final + entrega Carbone + Dropbox + email cliente).       |
|                                                                       |
| **→ Si Devolver:** Estado vuelve a \'calculada\'. Notifica al         |
| visador.                                                              |
|                                                                       |
| **→ Si Rechazar:** Estado pasa a \'cancelada\'. Notifica al           |
| ejecutivo. Solicitud no se factura.                                   |
|                                                                       |
| **→ Escribe en:** A_Eventos evento \'aprobacion_final\' con autor,    |
| decisión y timestamp.                                                 |
|                                                                       |
| **→ Marca campo:** aprobado_por en TX_Solicitudes.                    |
|                                                                       |
| **→ Genera PDF definitivo:** El PDF anterior queda como versión       |
| preliminar; el nuevo lleva firma y queda en                           |
| TX_DocumentosGenerados.tipo = \'final\'.                              |
+=======================================================================+

## 9.7 Formulario F6 --- Operación y gestión

+-----------------------------------------------------------------------+
| **F6 · Operación y gestión**                                          |
|                                                                       |
| Usuario: **Operador interno** \| Etapa: **Mantenimiento operacional** |
| \| Frecuencia: **Continua** \| Criticidad: **MEDIA**                  |
+=======================================================================+

### Objetivo funcional

El operador interno resuelve situaciones que el flujo automático no
contempla: reasignaciones por enfermedad del tasador, cambios de
prioridad, pausas por documentación faltante, contacto con cliente para
confirmar datos.

### Plataforma

Airtable Interface \'Bandeja operativa\' con múltiples vistas:
\'Solicitudes en curso\', \'Bloqueadas\', \'Vencidas\', \'Re-visitas
pendientes\'.

### Campos / Acciones disponibles

  -----------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**        **Obligatorio**   **Comportamiento /
                                                              Validación**
  -------- ---------------- --------------- ----------------- -----------------------------
  1        Reasignar        Selector        No                Debe justificar. Registra
           tasador          M_Tasadores                       evento de reasignación.

  2        Cambiar          Selector        No                Normal / Urgente / Crítico.
           prioridad                                          Justificación obligatoria si
                                                              sube.

  3        Pausar solicitud Selector estado No                Estado \'requiere_atencion\'
                                                              con motivo.

  4        Reanudar         Botón           No                Vuelve al estado previo a la
           solicitud                                          pausa.

  5        Contactar        Selector + nota No                Genera tarea de seguimiento.
           cliente                                            

  6        Solicitar        Multi-check +   No                Marca campos faltantes y
           documentación    nota                              notifica al solicitante.
           adicional                                          

  7        Anotación        Texto largo     No                No visible para cliente.
           interna                                            

  8        Cerrar           Toggle +        No                Requiere permiso elevado. Log
           manualmente      justificación                     obligatorio.
           (excepción)                                        
  -----------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Vistas filtradas pre-construidas**                                |
|                                                                       |
| **•** Vista \'Vencidas\': SLA superado, ordenadas por días de         |
| retraso.                                                              |
|                                                                       |
| **•** Vista \'Por reasignar\': tasador sin actividad \>48 hrs desde   |
| asignación.                                                           |
|                                                                       |
| **•** Vista \'Bloqueadas por cliente\': estado \'requiere_atencion\'  |
| con motivo=\'falta documentación\'.                                   |
|                                                                       |
| **•** Vista \'Aprobadas pendientes de entrega\': estado=\'aprobada\'  |
| sin documento_entregado.                                              |
|                                                                       |
| **•** Cada acción del operador genera evento en A_Eventos con autor y |
| razón.                                                                |
+=======================================================================+

## 9.8 Formulario F7 --- Parametrización del motor

+-----------------------------------------------------------------------+
| **F7 · Parametrización del motor**                                    |
|                                                                       |
| Usuario: **Administrador / Parametrizador del sistema** \| Etapa:     |
| **Configuración del cerebro central** \| Frecuencia: **Frecuente al   |
| onboard, esporádico después** \| Criticidad: **MUY ALTA**             |
+=======================================================================+

### Objetivo funcional

El formulario crítico del sistema. Aquí se configuran clientes, bancos,
reglas, plantillas, fórmulas y workflows sin escribir código y sin tocar
Make. Es la materialización del principio \'lógica centralizada en la
base\'.

### Plataforma

Airtable Interface \'Configuración del sistema\' con submódulos por
dominio. Permisos restringidos al rol Administrador.

### Submódulos disponibles

  ---------------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**                 **Obligatorio**   **Comportamiento /
                                                                       Validación**
  -------- ---------------- ------------------------ ----------------- ------------------------
  M1       Alta de cliente  Form M_Clientes          ---               Tipos de informe
           nuevo                                                       permitidos, SLA,
                                                                       variables especiales,
                                                                       plantillas asignadas.

  M2       Alta de banco    Form M_Bancos            ---               Filiales, contactos,
                                                                       condiciones especiales.

  M3       Alta de tasador  Form M_Tasadores         ---               Comunas atendidas,
                                                                       especialidades, rating
                                                                       inicial.

  M4       Alta de tipo de  Form M_TiposInforme      ---               Plantilla por defecto,
           informe                                                     fórmula por defecto,
                                                                       workflow asociado.

  C1       Crear regla de   Form C_ReglasNegocio     ---               Filtros (cliente, banco,
           negocio                                                     tipo, comuna, monto) +
                                                                       plantilla + fórmula +
                                                                       workflow + factores.

  C2       Crear plantilla  Form C_Plantillas        ---               Sube archivo Carbone,
                                                                       define variables, marca
                                                                       versión.

  C3       Crear fórmula    Form C_Formulas          ---               Expresión, variables de
                                                                       entrada, validaciones,
                                                                       versión.

  C4       Crear workflow   Form C_Workflows +       ---               Define los pasos, las
                            C_WorkflowPasos                            condiciones de avance y
                                                                       las notificaciones.

  C5       Variables del    Form C_VariablesCliente  ---               Logo, firma, pie legal,
           cliente                                                     textos personalizados.

  C6       Notificaciones   Form                     ---               Plantillas de email,
                            C_NotificacionesConfig                     destinatarios, eventos
                                                                       disparadores.

  C7       SLAs             Form C_SLA               ---               Días por tipo de informe
                                                                       y cliente.

  C8       Factores y       Form C_Factores          ---               Tabla de pesos para
           coeficientes                                                fórmulas.
  ---------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Diseño anti-error en parametrización**                            |
|                                                                       |
| **•** Crear regla obliga a definir mínimo 1 filtro + plantilla +      |
| fórmula. Validación previa.                                           |
|                                                                       |
| **•** Toda creación de regla activa una previsualización: el sistema  |
| muestra cuántas solicitudes históricas habrían matcheado esta regla.  |
|                                                                       |
| **•** Versionado obligatorio: editar una fórmula NO sobreescribe la   |
| anterior, crea una nueva versión y archiva la previa en               |
| H_FormulasAnteriores.                                                 |
|                                                                       |
| **•** Las solicitudes en curso siguen usando la versión vigente al    |
| momento de su creación (snapshot ya guardado).                        |
|                                                                       |
| **•** Botón \'Probar regla\' simula la resolución sobre una solicitud |
| ficticia o histórica antes de activarla.                              |
|                                                                       |
| **•** Toda creación o edición genera evento en A_Cambios con          |
| before/after.                                                         |
+=======================================================================+

+-----------------------------------------------------------------------+
| **⚠ Regla de oro de F7**                                              |
|                                                                       |
| Nada que se edite aquí debe afectar solicitudes en curso. El snapshot |
| de regla/fórmula al momento del cálculo es inmutable. Una solicitud   |
| calculada con la fórmula v3 sigue siendo válida con esa v3 aunque hoy |
| esté la v7. Esto garantiza reproducibilidad y defendibilidad ante     |
| auditorías.                                                           |
+=======================================================================+

+-----------------------------------------------------------------------+
| **▶ QUÉ DISPARA ESTE FORMULARIO**                                     |
|                                                                       |
| **→ Crea/actualiza:** Las tablas del dominio C\_ y M\_.               |
|                                                                       |
| **→ Versiona automáticamente:** Cambios sobre plantillas/fórmulas     |
| crean nueva versión y archivan la previa.                             |
|                                                                       |
| **→ Escribe en:** A_Cambios evento por cada modificación con autor,   |
| timestamp, before, after.                                             |
|                                                                       |
| **→ No afecta:** Solicitudes ya creadas: el snapshot las protege.     |
|                                                                       |
| **→ Permite previsualizar:** El impacto de la nueva configuración     |
| sobre datos históricos.                                               |
+=======================================================================+

## 9.9 Formulario F8 --- Supervisión y KPIs

+-----------------------------------------------------------------------+
| **F8 · Supervisión y KPIs**                                           |
|                                                                       |
| Usuario: **Supervisor / Gerencia** \| Etapa: **Monitoreo y decisiones |
| tácticas** \| Frecuencia: **Diaria de consulta** \| Criticidad:       |
| **BAJA (lectura)**                                                    |
+=======================================================================+

### Objetivo funcional

No es un formulario de captura, es un panel de control. Aquí no se
ingresan datos: se leen. Pero merece tratarse como formulario porque
define la interfaz operacional de gerencia y porque algunos campos sí
permiten acción (notas internas, marcado de revisión).

### Plataforma

Airtable Dashboard con widgets predefinidos. Permisos de lectura sobre
todas las tablas, sin edición sobre datos operacionales.

### KPIs y vistas

  -------------------------------------------------------------------------------------
  **\#**   **Campo**        **Tipo**    **Obligatorio**   **Comportamiento /
                                                          Validación**
  -------- ---------------- ----------- ----------------- -----------------------------
  K1       Solicitudes por  Gráfico de  ---               Cuántas en cada estado, en
           estado           barras                        tiempo real.

  K2       Tiempo promedio  Gráfico de  ---               Diagnóstico de cuellos de
           por estado       líneas                        botella.

  K3       SLA cumplido vs  Pie chart + ---               Por cliente, por tipo de
           incumplido       tabla                         informe, por mes.

  K4       Volumen por      Tabla       ---               Cantidad y monto UF promedio.
           cliente                                        

  K5       Rating de        Tabla       ---               Tasaciones realizadas, %
           tasadores        ordenable                     devueltas, tiempo promedio.

  K6       Reglas más       Tabla       ---               Qué reglas activan más casos.
           aplicadas                                      Útil para optimizar el
                                                          catálogo.

  K7       Errores Make     Tabla       ---               Lectura directa de
                                                          A_ErroresMake. Alerta si \>5
                                                          en 24h.

  K8       Solicitudes flag Toggle      Sí                Único campo editable: marcar
           por gerencia                                   para revisar manualmente.
  -------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **◆ Filtros nativos del dashboard**                                   |
|                                                                       |
| **•** Por rango de fechas, por cliente, por tasador, por tipo de      |
| informe.                                                              |
|                                                                       |
| **•** Drill-down: click en una barra abre la lista de solicitudes que |
| componen el dato.                                                     |
|                                                                       |
| **•** Exportación a CSV de cualquier vista con un click.              |
|                                                                       |
| **•** Alertas automáticas: si SLA cumplido \<80% por 3 días seguidos, |
| notifica a gerencia.                                                  |
+=======================================================================+

## 9.10 Principios transversales a todos los formularios

Diez reglas que aplican a F1 hasta F8 sin excepción. Si un formulario
nuevo del futuro no cumple las diez, no entra en producción.

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-1 · Cada campo tiene una columna en una tabla**      |
|                                                                       |
| Si un campo del formulario no mapea a una columna de una tabla del    |
| modelo, no debería existir. Cero datos huérfanos en notas sueltas.    |
+=======================================================================+
| **✓ PRINCIPIO #F-2 · Validación en captura, no en la base**           |
|                                                                       |
| Errores se evitan en el formulario, no se corrigen después. Listas    |
| restringidas, máscaras, regex, valores mínimos y máximos. La base     |
| recibe datos limpios.                                                 |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-3 · El sistema infiere, el usuario confirma**        |
|                                                                       |
| Cuando el sistema sabe la respuesta (SLA, tasador sugerido, plantilla |
| por defecto, fórmula aplicable), la pre-carga y el usuario solo       |
| confirma o sobrescribe con justificación.                             |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-4 · Cada submit genera un evento**                   |
|                                                                       |
| A_Eventos registra cada paso, sea exitoso o no. Reconstrucción        |
| completa garantizada.                                                 |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-5 · Estado avanza solo si el formulario está         |
| completo**                                                            |
|                                                                       |
| No hay estados intermedios sin captura completa. La validación del    |
| formulario es la condición de avance del workflow.                    |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-6 · Permisos por rol, nunca por usuario individual** |
|                                                                       |
| F2 es visible para todos los ejecutivos, no se asigna por nombre.     |
| Cuando entra un nuevo ejecutivo, se le agrega al rol y todo funciona  |
| sin tocar el formulario.                                              |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-7 · Versionado de plantillas / fórmulas inmutable    |
| para casos en curso**                                                 |
|                                                                       |
| F7 puede editar lo que quiera; los snapshots protegen los cálculos ya |
| hechos.                                                               |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-8 · Móvil primero donde corresponde**                |
|                                                                       |
| F3 (terreno) es móvil-nativo. F4, F5 y F7 son escritorio (requieren   |
| contexto amplio). F6 y F8 funcionan en ambos.                         |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-9 · Mínimo de campos críticos, máximo de             |
| inteligencia**                                                        |
|                                                                       |
| Los 18 campos de F1 son irreductibles. Eliminar uno cualquiera rompe  |
| alguna regla. Agregar uno cualquiera obliga a justificar qué decisión |
| nueva permite.                                                        |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #F-10 · Todos los formularios alimentan el mismo        |
| motor**                                                               |
|                                                                       |
| F1 y F2 producen el mismo registro en TX_Solicitudes. La fuente del   |
| dato (canal) se distingue, pero la lógica de procesamiento es         |
| idéntica.                                                             |
+-----------------------------------------------------------------------+

# 10. FLUJO DE DECISIÓN CENTRAL

Desde que entra una solicitud hasta que se entrega el informe, el
sistema atraviesa **doce pasos deterministas**. Ninguno depende de un
humano que recuerde una regla, ninguno requiere abrir Excel. Cada paso
lee tablas, escribe tablas y produce eventos auditables.

+-----------------------------------------------------------------------+
| **▌ Garantía del flujo**                                              |
|                                                                       |
| Si el motor está bien parametrizado (F7) y los formularios capturan   |
| correctamente (F1-F3), el sistema entrega informes sin intervención   |
| manual entre el paso 1 y el paso 12. Todo el trabajo humano se        |
| concentra en F4 (visado) y F5 (aprobación), donde se ejerce juicio    |
| profesional, no operativo.                                            |
+=======================================================================+

## 10.1 Mapa de los doce pasos

+-----------------------------------------------------------------------+
| **FLUJO COMPLETO · DE SOLICITUD A INFORME ENTREGADO**                 |
+=======================================================================+
| 1\. CAPTURA INICIAL (F1 o F2) → TX_Solicitudes \[creada\]             |
|                                                                       |
| 2\. VALIDACIÓN AUTOMÁTICA (Airtable formulas) → A_Eventos             |
|                                                                       |
| 3\. RESOLUCIÓN DE REGLA (motor sobre C_RN) → A_DecisionesMotor        |
|                                                                       |
| 4\. ASIGNACIÓN DE TASADOR (workflow + tabla M) → TX_Solicitudes       |
| \[asignada\]                                                          |
|                                                                       |
| 5\. NOTIFICACIÓN ASIGNACIÓN (Make SC03) → email/SMS al tasador        |
|                                                                       |
| 6\. VISITA Y CAPTURA (F3) → TX_DatosTasacion \[visitada\]             |
|                                                                       |
| 7\. CÁLCULO DE VALOR (snapshot de fórmula) → TX_Calculos              |
| \[calculada\]                                                         |
|                                                                       |
| 8\. GENERACIÓN DE PDF (Carbone vía Make) → TX_DocumentosGenerados     |
|                                                                       |
| 9\. VISADO (F4) → estado \[pdf_listo / devuelta\]                     |
|                                                                       |
| 10\. APROBACIÓN FINAL (F5) → estado \[aprobada\]                      |
|                                                                       |
| 11\. ENTREGA (Make SC10) → email cliente + Dropbox                    |
|                                                                       |
| 12\. CIERRE Y ARCHIVO (scheduler nocturno) → H_Solicitudes_Cerradas   |
+-----------------------------------------------------------------------+

## 10.2 Detalle paso a paso

+---------+------------------------------------------------------------+
| PASO    | **Captura inicial**                                        |
|         |                                                            |
| **1**   | **•** Usuario externo o ejecutivo completa F1 o F2.        |
|         |                                                            |
|         | **•** El submit crea registro en TX_Solicitudes con estado |
|         | \'creada\'.                                                |
|         |                                                            |
|         | **•** Se asigna automáticamente codigo_ext (formula        |
|         | VP-AAAA-XXXX).                                             |
|         |                                                            |
|         | **•** Se inicia contador de SLA leyendo C_SLA por          |
|         | cliente + tipo_informe.                                    |
|         |                                                            |
|         | **•** Se escribe A_Eventos con                             |
|         | evento_tipo=\'solicitud_creada\', autor, payload completo. |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Validación automática**                                  |
|         |                                                            |
| **2**   | **•** Fórmulas de Airtable verifican consistencia          |
|         | inmediata: rol SII bien formado, comuna existe en región,  |
|         | contacto válido.                                           |
|         |                                                            |
|         | **•** Si falla alguna validación crítica: estado           |
|         | \'requiere_atencion\' + evento en A_Eventos + notificación |
|         | al ejecutivo.                                              |
|         |                                                            |
|         | **•** Si todas las validaciones pasan: el flujo continúa   |
|         | al paso 3.                                                 |
|         |                                                            |
|         | **•** Validaciones son configurables en C_ReglasNegocio    |
|         | (campo validaciones_extra).                                |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Resolución de regla**                                    |
|         |                                                            |
| **3**   | **•** Airtable evalúa C_ReglasNegocio aplicando el         |
|         | algoritmo de resolución (sección 7).                       |
|         |                                                            |
|         | **•** Calcula especificidad = suma de filtros no-wildcard  |
|         | que matchean.                                              |
|         |                                                            |
|         | **•** Selecciona la regla con mayor especificidad. En      |
|         | empate, la más reciente (vigente_desde).                   |
|         |                                                            |
|         | **•** Escribe en A_DecisionesMotor: reglas_candidatas,     |
|         | regla_ganadora, regla_ganadora_snapshot (JSON inmutable),  |
|         | razon_ganadora.                                            |
|         |                                                            |
|         | **•** El snapshot garantiza que aunque la regla se edite   |
|         | mañana, este cálculo siempre usará la versión de hoy.      |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Asignación de tasador**                                  |
|         |                                                            |
| **4**   | **•** Lee M_Tasadores filtrando por comuna y especialidad  |
|         | requeridas por la regla ganadora.                          |
|         |                                                            |
|         | **•** Ordena por carga actual (cantidad de solicitudes     |
|         | activas) y por rating.                                     |
|         |                                                            |
|         | **•** Asigna automáticamente al de menor carga y mejor     |
|         | rating disponible.                                         |
|         |                                                            |
|         | **•** Si el ejecutivo había asignado manualmente en F2: se |
|         | respeta esa decisión y se registra como                    |
|         | \'asignacion_manual\'.                                     |
|         |                                                            |
|         | **•** Estado pasa a \'asignada\'.                          |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Notificación de asignación**                             |
|         |                                                            |
| **5**   | **•** Make ejecuta escenario SC03: lee la notificación     |
|         | desde C_NotificacionesConfig, llena variables y envía      |
|         | email + SMS al tasador.                                    |
|         |                                                            |
|         | **•** Genera URL única de F3 con id_solicitud              |
|         | parametrizado.                                             |
|         |                                                            |
|         | **•** Notifica también al ejecutivo comercial con copia.   |
|         |                                                            |
|         | **•** Si el tasador no acusa recibo en N horas             |
|         | (configurable en C_SLA): escenario SC04 escala al operador |
|         | interno.                                                   |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Visita y captura en terreno**                            |
|         |                                                            |
| **6**   | **•** Tasador completa F3 desde el móvil.                  |
|         |                                                            |
|         | **•** Cada sección se autoguarda en TX_DatosTasacion.      |
|         |                                                            |
|         | **•** Fotos suben a TX_Adjuntos con tipo y orden           |
|         | definidos.                                                 |
|         |                                                            |
|         | **•** Submit final: estado pasa a \'visitada\'.            |
|         |                                                            |
|         | **•** Se valida automáticamente que existan al menos N     |
|         | fotos + N comparables (parametrizable en C_ReglasNegocio). |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Cálculo de valor**                                       |
|         |                                                            |
| **7**   | **•** Resuelve y ejecuta la CADENA de fórmulas de          |
|         | C_Formulas (no una sola): el Motor de Ejecución ordena     |
|         | topológicamente los \~15 cálculos según el campo           |
|         | depende_de y los corre en secuencia, donde el output de    |
|         | uno alimenta al siguiente (UF/m² homologado → valor        |
|         | edificación → depreciación D.F. → garantía → seguro →      |
|         | reposición → remate → liquidación → rentabilidad). Ver     |
|         | Adenda v2.2, §18.2.                                        |
|         |                                                            |
|         | **•** Aplica la expresión usando los datos de              |
|         | TX_DatosTasacion + factores de C_Factores + plusvalía de   |
|         | M_Comunas.                                                 |
|         |                                                            |
|         | **•** Escribe TX_Calculos con: valor_calculado_uf,         |
|         | formula_version, formula_expresion_snapshot,               |
|         | variables_aplicadas (JSON).                                |
|         |                                                            |
|         | **•** Estado pasa a \'calculada\'.                         |
|         |                                                            |
|         | **•** Si el valor cae fuera de un rango razonable          |
|         | (configurable): bandera de revisión obligatoria.           |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Generación de PDF**                                      |
|         |                                                            |
| **8**   | **•** Make ejecuta SC07: lee la plantilla Carbone desde    |
|         | C_Plantillas, baja el archivo de Dropbox.                  |
|         |                                                            |
|         | **•** Envía a Carbone.io el JSON con todas las variables:  |
|         | datos solicitud, terreno, cálculo, comparables, fotos,     |
|         | variables del cliente.                                     |
|         |                                                            |
|         | **•** Recibe el PDF generado y lo sube a Dropbox en la     |
|         | carpeta del cliente.                                       |
|         |                                                            |
|         | **•** Crea registro en TX_DocumentosGenerados con          |
|         | tipo=\'preliminar\', url, version, plantilla_snapshot.     |
|         |                                                            |
|         | **•** Estado pasa a \'pdf_listo\'.                         |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Visado**                                                 |
|         |                                                            |
| **9**   | **•** Visador abre F4 desde la bandeja \'Por revisar\'.    |
|         |                                                            |
|         | **•** Revisa PDF + datos + comparables + snapshot de regla |
|         | y fórmula.                                                 |
|         |                                                            |
|         | **•** Aprobar: estado \'pendiente_final\'.                 |
|         |                                                            |
|         | **•** Devolver: estado \'devuelta\', notificación al       |
|         | tasador con observaciones, contador de re-visitas +1.      |
|         |                                                            |
|         | **•** Escalar: estado \'requiere_atencion\', notificación  |
|         | a gerencia.                                                |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Aprobación final**                                       |
|         |                                                            |
| **10**  | **•** Aprobador final (Héctor) abre F5 desde               |
|         | \'Aprobaciones pendientes\'.                               |
|         |                                                            |
|         | **•** Doble confirmación de aprobación.                    |
|         |                                                            |
|         | **•** Marca aprobado_por con su email + timestamp.         |
|         |                                                            |
|         | **•** Estado pasa a \'aprobada\'.                          |
|         |                                                            |
|         | **•** Se genera versión final del PDF (con firma) en       |
|         | TX_DocumentosGenerados.tipo=\'final\'.                     |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Entrega**                                                |
|         |                                                            |
| **11**  | **•** Make ejecuta SC10: envía email al cliente con PDF    |
|         | adjunto.                                                   |
|         |                                                            |
|         | **•** Copia el PDF a Google Drive del cliente (si el       |
|         | cliente lo tiene configurado).                             |
|         |                                                            |
|         | **•** Notifica al ejecutivo comercial del cliente.         |
|         |                                                            |
|         | **•** Cambia estado a \'entregada\'.                       |
|         |                                                            |
|         | **•** Marca timestamp de entrega para cálculo final de     |
|         | SLA.                                                       |
+=========+============================================================+

+---------+------------------------------------------------------------+
| PASO    | **Cierre y archivado**                                     |
|         |                                                            |
| **12**  | **•** Scheduler nocturno (SC18) corre cada noche.          |
|         |                                                            |
|         | **•** Solicitudes entregadas hace \>30 días y sin eventos  |
|         | pendientes: estado pasa a \'cerrada\'.                     |
|         |                                                            |
|         | **•** Copia el registro a H_Solicitudes_Cerradas con todos |
|         | los snapshots embebidos.                                   |
|         |                                                            |
|         | **•** Mantiene el original en TX_Solicitudes 90 días más   |
|         | para consulta operativa, luego se elimina (queda en H\_).  |
|         |                                                            |
|         | **•** Actualiza rating del tasador y estadísticas del      |
|         | cliente.                                                   |
+=========+============================================================+

## 10.3 Casos especiales del flujo

Cinco caminos no lineales que el motor maneja sin intervención humana
adicional.

  -------------------------------------------------------------------------
  **Caso**          **Disparador**   **Comportamiento del flujo**
  ----------------- ---------------- --------------------------------------
  Re-visita por     F4 = Devolver    Estado pasa a \'asignada\'. Tasador
  devolución                         recibe observaciones. Conserva F3
                                     anterior + crea registro nuevo de
                                     captura. SLA se ajusta según política.

  Cambio de tasador Operador en F6   Notifica al nuevo tasador con URL F3.
                                     El histórico de quién tuvo la
                                     solicitud queda en A_Eventos.

  Documentación     Visador o        Estado \'requiere_atencion\'. Notifica
  adicional         aprobador        al ejecutivo. Reanuda al cargar
                    solicitan        documentos en TX_Adjuntos.

  Variable especial Aprobador invoca Re-genera PDF aplicando la variable
  cliente           en F5            extra (ej. piloto, formato bilingüe,
                                     marca de agua). Versiona en
                                     TX_DocumentosGenerados.

  Cancelación       Solicitante /    Estado \'cancelada\'. Evento de
                    aprobador        cancelación. No factura. Datos quedan
                                     archivados para auditoría.
  -------------------------------------------------------------------------

## 10.4 Diagrama de estados de TX_Solicitudes

Los once estados posibles de una solicitud y sus transiciones válidas.
El motor solo permite transiciones declaradas; cualquier intento de
salto inválido se bloquea y se loguea.

+-----------------------------------------------------------------------+
| **MÁQUINA DE ESTADOS · TX_Solicitudes**                               |
+=======================================================================+
| \[creada\] ────────► \[asignada\] ────────► \[visitada\] ────────►    |
| \[calculada\]                                                         |
|                                                                       |
| │ │ │ │                                                               |
|                                                                       |
| │ │ │ ▼                                                               |
|                                                                       |
| │ │ │ \[pdf_listo\]                                                   |
|                                                                       |
| │ │ │ │                                                               |
|                                                                       |
| │ │ │ ▼                                                               |
|                                                                       |
| │ │ │ ┌──── \[devuelta\] ──┐                                          |
|                                                                       |
| │ │ │ │ │                                                             |
|                                                                       |
| │ │ ▼ ▼ │                                                             |
|                                                                       |
| │ │ \[pendiente_final\] ◄────────────────┘                            |
|                                                                       |
| │ │ │                                                                 |
|                                                                       |
| │ │ ▼                                                                 |
|                                                                       |
| │ │ \[aprobada\] ──► \[entregada\] ──► \[cerrada\]                    |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| ▼ ▼                                                                   |
|                                                                       |
| \[cancelada\] \[requiere_atencion\] ──► (volver a estado previo o     |
| cancelar)                                                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **★ Por qué importan los estados explícitos**                         |
|                                                                       |
| Hacen el sistema auditable y fácil de monitorear. Cualquier reporte   |
| de gerencia puede contar \'cuántas en cada estado\' sin construir     |
| lógica nueva. Y cualquier bug operativo se detecta como \'solicitud   |
| atascada en estado X\'.                                               |
+=======================================================================+

# 11. INTEGRACIÓN CON MAKE

Make es el **brazo ejecutor**, no el cerebro. Hace lo que Airtable le
ordena: envía emails, llama a Carbone, copia archivos a Dropbox, dispara
webhooks. **Cero lógica de negocio vive en Make.** Si una decisión
cambia, se cambia en Airtable y Make sigue funcionando sin tocar un solo
escenario.

## 11.1 Distribución de responsabilidades

  ------------------------------------------------------------------------------
  **Aspecto**      **Versión       **Versión v2.4**      **Implementación**
                   v2.3**                                
  ---------------- --------------- --------------------- -----------------------
  Motor de reglas  Make SC03       **Airtable Script     C_AutomationsAirtable
                                   AT01**                

  Cadena DAG       Make SC05       **Airtable Script     C_AutomationsAirtable
  fórmulas                         AT03**                

  Asignación de    Make SC04       **Airtable Script     C_AutomationsAirtable
  tasador                          AT02**                

  Notificación     Make SC10       **Airtable Automation C_AutomationsAirtable
  visador                          AT05**                

  Ensamblaje JSON  Make SC09       **Airtable Script     Script pre-Make
  Carbone                          (Make transporta)**   

  Validación de    Make SC08       **Airtable Formula +  Fórmula + Automation
  rangos                           AT04**                

  Alertas SLA      Make SC14       **Airtable Scheduled  C_AutomationsAirtable
                                   AT08**                

  Archivado        Make SC18       **Airtable Scheduled  C_AutomationsAirtable
  nocturno                         AT10**                

  Reintentos cola  Make SC17       **Airtable            C_AutomationsAirtable
                                   Scheduled+Script      
                                   AT09**                

  Render           Make            **Airtable Script     Script pre-Make
  notificaciones                   (Make envía)**        

  Cruce a la app   Make SC01, SC06 **Make SC01, SC06     Z_EscenariosMake
  Next.js (vía                     (sin cambio)**        
  webhook)                                               

  Cruce a Claude   Make SC07       **Make SC07 (sin      Z_EscenariosMake
  API                              cambio)**             

  Cruce a Carbone  Make SC09       **Make SC09 (JSON ya  Z_EscenariosMake
                                   ensamblado)**         

  Cruce a Gmail    Make SC13       **Make SC13 (payload  Z_EscenariosMake
                                   ya renderizado)**     

  Cruce a          Make SC15       **Make SC15 (sin      Z_EscenariosMake
  Mindicador                       cambio)**             
  ------------------------------------------------------------------------------

## 11.2 Catálogo de escenarios Make

Veinte escenarios cubren todo el ciclo. Cada uno tiene una sola
responsabilidad y se invoca desde un disparador específico en Airtable
(cambio de estado, scheduler, webhook). Todos están listados en
Z_EscenariosMake con su código, descripción y disparador.

Versión v2.5: Se implementa el principio Make = transportista puro. La
lógica interna migra completamente a Airtable (AT01--AT10). Make opera
únicamente como transporte hacia servicios externos (webhooks de la app
Next.js, Claude API, Carbone, Dropbox, Gmail, Mindicador).

**Lista A --- Escenarios Make activos en v2.4 (8 escenarios)**

  ------------------------------------------------------------------------------------
  **Código**   **Escenario**         **Disparador**          **Acción principal**
  ------------ --------------------- ----------------------- -------------------------
  SC01         Validar nueva         Webhook Next.js IF-01   Crea TX_Solicitudes;
               solicitud externa                             deposita payload en
                                                             Airtable.

  SC06         Validar datos de      AT03 completa;          Verifica que el valor
               terreno               estado=calculada        caiga en rangos
                                                             esperables.

  SC07         Generar PDF           AT04+estado=calculada   Carbone genera PDF, sube
               preliminar                                    a Dropbox, crea
                                                             TX_DocumentosGenerados.

  SC09         Llamar a Carbone.io   AT05 dispara tras       Transporta JSON ya
                                     preparar JSON           ensamblado hacia
                                                             Carbone.io.

  SC13         Entregar/notificar    AT05, AT07, AT08        Transporta payload ya
               por Gmail             disparan                renderizado a Gmail.

  SC15         Sincronizar UF desde  Scheduler externo       Actualiza H_PreciosUF con
               Mindicador            diario                  valor UF del día.

  SC16         Backup Airtable a     Scheduler externo       Snapshot tablas TX\_ y
               Dropbox               nocturno                A\_ a Dropbox.

  SC19         Webhook entrante de   Webhook banco           Recibe confirmaciones;
               banco                                         Z_Webhooks registra
                                                             payload.

  SC10         generar_thumbnails    TX_Adjuntos insert con  Llama servicio de resize
                                     mime_type=image/\*      (Cloudinary · sharp en
                                                             Railway function ·
                                                             Dropbox thumbnail API) y
                                                             escribe thumbnail_url.
                                                             Idempotente: no re-genera
                                                             si thumbnail_url ya está
                                                             poblado.
  ------------------------------------------------------------------------------------

*Adenda v2.6.2 · SC10_generar_thumbnails (Especificación v1.4 §8.5).
Escenario Make nuevo que se dispara al insertarse una fila en
TX_Adjuntos con mime_type=image/\*; llama al servicio de resize (opción
a definir entre Cloudinary, sharp en Railway function o Dropbox
thumbnail API) y escribe thumbnail_url en la fila de origen.
Idempotente: si thumbnail_url ya está poblado, no re-genera. Convive con
SC01, SC06, SC07, SC09, SC13, SC15, SC16 y SC19 en LISTA A. Nota de
coherencia: la Especificación v1.4 fija AT01--AT10 como numeración
canónica de Airtable Scripts (LISTA B) y SC01--SC19 como numeración de
escenarios Make (LISTA A); las menciones legadas a SC10 dentro del §10
flujo de decisión (donde SC10 aparecía como pasos de entrega Carbone) se
reinterpretan bajo la nueva canonización como SC09_llamar_a_carbone +
SC13_entregar_por_gmail.*

**Lista B --- Automations migradas de Make a Airtable (AT01--AT10)**

+-------------------+--------------------------------+-----------------------+-------------------------+
| **ID**            | **Nombre**                     | **Disparador**        | **Qué hace (resumen)**  |
+===================+================================+=======================+=========================+
| AT01              | AT01_resolver_motor_reglas     | TX_Solicitudes.estado | Consulta                |
|                   |                                | = creada              | C_ReglasNegocio,        |
|                   |                                |                       | resuelve regla, escribe |
|                   |                                |                       | A_DecisionesMotor.      |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT02              | AT02_asignar_tasador           | TX_Solicitudes.estado | Filtra M_Tasadores por  |
|                   |                                | = creada (post AT01)  | zona+carga, asigna,     |
|                   |                                |                       | registra en A_Eventos.  |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT03              | AT03_ejecutar_dag_formulas     | TX_Solicitudes.estado | Lee DAG C_Formulas,     |
|                   |                                | = visitada            | sort topológico JS      |
|                   |                                |                       | nativo, escribe         |
|                   |                                |                       | TX_Calculos.            |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT04              | AT04_validar_rangos_valor      | TX_Calculos insert    | Fórmula+Automation;     |
|                   |                                |                       | flag revisión si valor  |
|                   |                                |                       | fuera de rango.         |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT05              | AT05_notificar_visador         | TX_Solicitudes.estado | Escribe                 |
|                   |                                | = pdf_listo           | TX_Notificaciones;      |
|                   |                                |                       | dispara SC09 → SC13.    |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT06              | AT06_procesar_decision_visador | decision_visador      | Actualiza estado        |
|                   |                                | cambia                | aprobación/devolución;  |
|                   |                                |                       | registra A_Eventos.     |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT07              | AT07_chequear_aprobacion_final | TX_Solicitudes.estado | Verifica condiciones    |
|                   |                                | = aprobada            | finales; dispara SC13   |
|                   |                                |                       | para entrega.           |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT08              | AT08_alertas_sla               | Scheduled · cron      | Lee TX_Solicitudes vs   |
|                   |                                | 08:00 diario          | C_SLA; escribe          |
|                   |                                |                       | TX_Notificaciones;      |
|                   |                                |                       | dispara SC13.           |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT09              | AT09_reintentos_cola           | Scheduled · cron cada | Lee Z_ColaPendientes;   |
|                   |                                | 15 min                | reintenta items         |
|                   |                                |                       | fallidos hasta 3 veces. |
+-------------------+--------------------------------+-----------------------+-------------------------+
| AT10              | AT10_archivado_nocturno        | Scheduled · cron      | Mueve registros         |
|                   |                                | nocturno              | entregados +30 días a   |
|                   |                                |                       | H_Solicitudes_Cerradas. |
+-------------------+--------------------------------+-----------------------+-------------------------+
| **◼ Separación Make/Airtable v2.4**                                                                  |
|                                                                                                      |
| Si Make se cae, el flujo interno (resolución reglas → asignación tasador → cálculo fórmulas →        |
| validación) sigue funcionando en Airtable. Make solo falla cuando se necesita cruzar hacia la app    |
| Next.js (notificaciones), Claude API, Carbone, Dropbox, Gmail o Mindicador.                          |
+------------------------------------------------------------------------------------------------------+

## 11.3 Manejo de errores y reintentos

Make falla. La red falla. Carbone se cae. Dropbox se satura. El sistema
está diseñado para que ningún error técnico se traduzca en pérdida de
datos ni en estado inconsistente.

  ---------------------------------------------------------------------------------------
  **Tipo de       **Comportamiento**          **Tabla de control**
  error**                                     
  --------------- --------------------------- -------------------------------------------
  Error de red en Reintento automático Make   Z_EjecucionesMake.estado=\'reintentando\'
  Make            (3 intentos con backoff     
                  exponencial)                

  Carbone         Captura error, escribe en   A_ErroresMake + Z_ColaPendientes
  responde error  A_ErroresMake, encola en    
                  Z_ColaPendientes            

  Dropbox token   Notificación inmediata a    A_ErroresMake.tipo=\'auth_failed\'
  expirado        admin + pausa de escenario  

  Webhook         Rechaza, registra en        A_ErroresMake.tipo=\'payload_invalid\'
  entrante con    A_ErroresMake con payload   
  payload         completo                    
  inválido                                    

  Solicitud sin   Detenida en estado          TX_Solicitudes.estado + evento
  regla aplicable \'requiere_atencion\' +     
                  notificación a              
                  parametrizador              

  Fórmula con     Cálculo abortado, error     TX_Calculos + A_Eventos
  división por    guardado en                 
  cero o variable TX_Calculos.error_detalle   
  faltante                                    

  Timeout de      Aborta y encola para        Z_ColaPendientes
  Carbone (\>30s) reintento en SC17           

  Email rebota    Marca destinatario          C_NotificacionesConfig + A_Eventos
                  inválido, notifica al       
                  operador                    
  ---------------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **⚠ Patrón obligatorio: idempotencia**                                |
|                                                                       |
| Todos los escenarios Make deben ser idempotentes: ejecutarlos dos     |
| veces produce el mismo resultado que ejecutarlos una vez. Antes de    |
| actuar, cada escenario verifica el estado actual en Airtable y solo   |
| procede si la transición es válida. Esto permite reintentos seguros   |
| sin duplicar PDFs, emails ni registros.                               |
+=======================================================================+

## 11.4 Cola de pendientes y auditoría de ejecuciones

Dos tablas garantizan que ningún disparador se pierda y que toda
ejecución sea reconstruible.

+-----------------------------------------------------------------------+
| **FLUJO DE EJECUCIÓN MAKE · CON COLA Y AUDITORÍA**                    |
+=======================================================================+
| AIRTABLE (cambio de estado) ─────► WEBHOOK ─────► MAKE                |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| ¿escenario tiene capacidad?                                           |
|                                                                       |
| / \\                                                                  |
|                                                                       |
| SÍ NO                                                                 |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| ▼ ▼                                                                   |
|                                                                       |
| ejecuta acción encola en Z_ColaPendientes                             |
|                                                                       |
| │ │                                                                   |
|                                                                       |
| ┌─────────────┼─────────────┐ │                                       |
|                                                                       |
| ▼ ▼ ▼ │                                                               |
|                                                                       |
| éxito error timeout │                                                 |
|                                                                       |
| │ │ │ │                                                               |
|                                                                       |
| ▼ ▼ ▼ ▼                                                               |
|                                                                       |
| Z_EjecucionesMake A_ErroresMake Z_ColaPendientes ◄──┘                 |
|                                                                       |
| estado=ok + reintento (procesado por SC17)                            |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **★ Política de retención**                                           |
|                                                                       |
| Z_EjecucionesMake conserva 90 días, luego se purga (queda agregado en |
| métricas mensuales). A_ErroresMake conserva 12 meses para análisis de |
| patrones. Z_ColaPendientes se vacía cuando el item se procesa         |
| exitosamente.                                                         |
+=======================================================================+

## 11.5 Disparadores válidos desde Airtable hacia Make

Los únicos 4 mecanismos válidos que disparan Make son:

+------------------------------------+-------------------------------------------------------------------+
| **\#**                             | **Mecanismo y descripción**                                       |
+====================================+===================================================================+
| 1                                  | Webhook desde la app Next.js (IF-01 e IF-03) → SC01, SC06. La API |
|                                    | Route Next.js envía el payload del formulario; Make lo deposita   |
|                                    | en Airtable.                                                      |
+------------------------------------+-------------------------------------------------------------------+
| 2                                  | Airtable Automation dispara Make para servicio externo. Una AT    |
|                                    | finaliza su trabajo y necesita cruzar a Claude API, Carbone,      |
|                                    | Dropbox o Gmail. La AT dispara SC07, SC09 o SC13 según            |
|                                    | corresponda. Los cambios de estado internos                       |
|                                    | (creada→asignada→visitada) disparan Airtable Automations/Scripts, |
|                                    | nunca Make directamente.                                          |
+------------------------------------+-------------------------------------------------------------------+
| 3                                  | Scheduler externo (servicios externos). SC15 (Mindicador →        |
|                                    | H_PreciosUF), SC16 (Airtable → Dropbox backup).                   |
+------------------------------------+-------------------------------------------------------------------+
| 4                                  | Webhook entrante de sistemas externos. SC19 recibe confirmaciones |
|                                    | de bancos. Z_Webhooks registra cada uno.                          |
+------------------------------------+-------------------------------------------------------------------+
| **⚠ Anti-patrón eliminado en v2.4**                                                                    |
|                                                                                                        |
| Un cambio de estado en TX_Solicitudes disparando SC03 (motor de reglas) o SC05 (fórmulas) en Make.     |
| Esos cambios de estado ahora disparan AT01 y AT03 directamente en Airtable. Make nunca contiene lógica |
| de negocio.                                                                                            |
+--------------------------------------------------------------------------------------------------------+

# 12. GENERACIÓN DOCUMENTAL CON CARBONE

La salida final del sistema es un PDF profesional. **Carbone.io** es la
elección porque acepta plantillas en formato DOCX o ODT con sintaxis
**{d.variable}**, lo cual permite que los expertos del negocio mantengan
las plantillas en Word sin tocar código.

+-----------------------------------------------------------------------+
| **▌ Principio de generación documental**                              |
|                                                                       |
| El PDF es solo el espejo del estado de la base. Toda la información   |
| que aparece en el documento proviene de tablas y todas las variables  |
| se resuelven en el momento de generar. Cambiar una plantilla no       |
| requiere desplegar nada: se sube el nuevo archivo a Dropbox, se       |
| incrementa la versión en C_Plantillas, y la próxima solicitud lo usa  |
| automáticamente.                                                      |
+=======================================================================+

## 12.1 Arquitectura documental

+-----------------------------------------------------------------------+
| **FLUJO DE GENERACIÓN DOCUMENTAL**                                    |
+=======================================================================+
| AIRTABLE CARBONE.IO STORAGE                                           |
|                                                                       |
| ──────── ────────── ───────                                           |
|                                                                       |
| C_Plantillas ─────┐                                                   |
|                                                                       |
| (url, version) │                                                      |
|                                                                       |
| │                                                                     |
|                                                                       |
| TX_Solicitudes ───┤                                                   |
|                                                                       |
| TX_DatosTasacion ─┤                                                   |
|                                                                       |
| TX_Calculos ──────┼──► MAKE construye ──► POST /render ──► PDF        |
| generado                                                              |
|                                                                       |
| TX_Comparables ───┤ payload JSON con plantilla │                      |
|                                                                       |
| TX_Adjuntos ──────┤ + JSON │                                          |
|                                                                       |
| C_VariablesCliente┘ ▼                                                 |
|                                                                       |
| Dropbox o Drive                                                       |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| TX_DocumentosGenerados (URL+v)                                        |
+-----------------------------------------------------------------------+

## 12.2 Estructura de C_Plantillas

Cada plantilla es un archivo DOCX subido a Dropbox que Carbone procesa.
El registro en C_Plantillas guarda los metadatos y la versión vigente.

  ---------------------------------------------------------------------------
  **Campo**              **Tipo Airtable** **Detalle**
  ---------------------- ----------------- ----------------------------------
  nombre                 Texto             Identificador legible: \'Tasación
                                           Hipotecaria MetLife Depto v3\'.

  codigo                 Texto único       TPL-XXX-YYY, referenciable desde
                                           C_ReglasNegocio.

  url_dropbox            URL               Apunta al archivo DOCX en Dropbox.

  url_dropbox_anterior   URL               Versión previa archivada al
                                           actualizar.

  version                Número entero     Incremental. Cambia con cada
                                           modificación de la plantilla.

  formato_salida         Selector          pdf / docx. PDF por defecto.

  variables_requeridas   JSON              Lista de variables que la
                                           plantilla espera. Validado al
                                           cargar.

  variables_opcionales   JSON              Variables que pueden o no
                                           aparecer.

  tipo_informe           Link a            Cuándo aplica esta plantilla.
                         M_TiposInforme    

  cliente                Link a M_Clientes Cliente al que pertenece. Puede
                                           ser wildcard.

  vigente_desde          Fecha             Activación.

  vigente_hasta          Fecha             Si está vacía: vigente. Si tiene
                                           fecha: archivada.

  activa                 Checkbox          Toggle rápido para
                                           activar/desactivar.

  veces_aplicada         Rollup contador   Cuántas tasaciones la usaron.

  notas_diseno           Texto largo       Información para el siguiente
                                           parametrizador.
  ---------------------------------------------------------------------------

## 12.3 Variables dinámicas en plantillas Carbone

Cuatro grupos de variables alimentan toda plantilla. Cada plantilla
declara cuáles necesita en C_Plantillas.variables_requeridas; si Make
detecta una variable faltante al renderizar, el proceso se detiene con
error explícito (nunca produce un PDF con campos vacíos).

### Grupo A --- Datos de la solicitud

+-----------------------------------------------------------------------+
| ***Bloque {d.solicitud.\*}***                                         |
|                                                                       |
| {d.solicitud.codigo} → VP-2026-0427                                   |
|                                                                       |
| {d.solicitud.fecha_ingreso} → 21/05/2026                              |
|                                                                       |
| {d.solicitud.cliente_nombre} → MetLife Chile                          |
|                                                                       |
| {d.solicitud.banco_nombre} → Banco Santander                          |
|                                                                       |
| {d.solicitud.tipo_informe} → Hipotecario residencial                  |
|                                                                       |
| {d.solicitud.direccion} → Av. Apoquindo 5482, Las Condes              |
|                                                                       |
| {d.solicitud.rol_sii} → 12345-6                                       |
|                                                                       |
| {d.solicitud.solicitante_nombre} → Juan Pérez (banco)                 |
|                                                                       |
| {d.solicitud.solicitante_email} → jperez@banco.cl                     |
+=======================================================================+

### Grupo B --- Datos técnicos de terreno

+-----------------------------------------------------------------------+
| ***Bloque {d.terreno.\*}***                                           |
|                                                                       |
| {d.terreno.superficie_util} → 87,5                                    |
|                                                                       |
| {d.terreno.superficie_terreno} → 0 (depto)                            |
|                                                                       |
| {d.terreno.ano_construccion} → 2018                                   |
|                                                                       |
| {d.terreno.material_principal} → Hormigón armado                      |
|                                                                       |
| {d.terreno.calidad} → 4                                               |
|                                                                       |
| {d.terreno.conservacion} → 5                                          |
|                                                                       |
| {d.terreno.dormitorios} → 3                                           |
|                                                                       |
| {d.terreno.banos} → 2                                                 |
|                                                                       |
| {d.terreno.estacionamientos} → 1                                      |
|                                                                       |
| {d.terreno.observaciones} → Texto largo del tasador                   |
+=======================================================================+

### Grupo C --- Resultado del cálculo

+-----------------------------------------------------------------------+
| ***Bloque {d.calculo.\*}***                                           |
|                                                                       |
| {d.calculo.valor_uf} → 5.842,30                                       |
|                                                                       |
| {d.calculo.valor_clp} → 220.456.123                                   |
|                                                                       |
| {d.calculo.valor_uf_m2} → 66,8                                        |
|                                                                       |
| {d.calculo.formula_aplicada} → F-DEPTO-LASCONDES-v3                   |
|                                                                       |
| {d.calculo.factores} → JSON con factores aplicados                    |
|                                                                       |
| {d.calculo.fecha_calculo} → 23/05/2026                                |
|                                                                       |
| {d.calculo.comparables\[i\].direccion} → iteración sobre comparables  |
|                                                                       |
| {d.calculo.comparables\[i\].valor_uf}                                 |
|                                                                       |
| {d.calculo.comparables\[i\].fecha}                                    |
+=======================================================================+

### Grupo D --- Variables del cliente

+-----------------------------------------------------------------------+
| ***Bloque {d.cliente.\*}***                                           |
|                                                                       |
| {d.cliente.logo} → URL del logo (Carbone lo embebe)                   |
|                                                                       |
| {d.cliente.firma_imagen} → URL de la firma escaneada                  |
|                                                                       |
| {d.cliente.pie_legal} → Texto legal del cliente                       |
|                                                                       |
| {d.cliente.cabecera_color} → Color hex para encabezados               |
|                                                                       |
| {d.cliente.formato_fecha} → DD/MM/YYYY o MM/DD/YYYY según cliente     |
|                                                                       |
| {d.cliente.moneda_secundaria} → UF / USD / EUR si aplica              |
+=======================================================================+

+-----------------------------------------------------------------------+
| **★ Iteraciones en Carbone**                                          |
|                                                                       |
| Para listas (comparables, fotos, adjuntos) Carbone usa la sintaxis    |
| {d.array\[i\].campo}. Esto permite que una plantilla muestre 3 o 5    |
| comparables sin cambiar el código de la plantilla. La cantidad la     |
| determina el JSON que envía Make.                                     |
+=======================================================================+

## 12.4 Versionado de plantillas

Versionar no es opcional. Cada modificación de una plantilla produce un
nuevo registro, no edita el anterior.

1.  **Una solicitud calculada con plantilla v3 mantendrá v3 para
    siempre.**

El campo plantilla_snapshot en TX_DocumentosGenerados guarda la URL y
versión exacta usada. Aunque hoy esté la v8, una tasación de hace 6
meses se puede regenerar idéntica.

2.  **Subir una nueva versión exige incrementar el campo version.**

Si el parametrizador olvida subir el número de versión, la validación de
F7 lo bloquea.

3.  **La versión previa se archiva automáticamente en
    H_PlantillasAnteriores.**

Junto con el archivo Dropbox de respaldo y un dump del registro
completo. Reversión: cuestión de minutos.

4.  **El parametrizador documenta el porqué del cambio.**

Campo notas_diseno obligatorio al versionar. Quien venga después
entiende qué cambió y por qué.

## 12.5 Selección automática de plantilla

¿Cómo sabe el sistema qué plantilla usar para una solicitud? Vía la
regla ganadora del paso 3 del flujo. C_ReglasNegocio tiene un campo
plantilla_resultado que apunta a C_Plantillas.codigo. Una vez resuelta
la regla, el sistema sabe la plantilla. Cero ambigüedad.

+-----------------------------------------------------------------------+
| **RESOLUCIÓN DE PLANTILLA**                                           |
+=======================================================================+
| solicitud llega ──► motor evalúa C_ReglasNegocio                      |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| regla ganadora: #47                                                   |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| plantilla_resultado: TPL-MET-DEPTO-LC                                 |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| lee C_Plantillas\[TPL-MET-DEPTO-LC\]                                  |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| version vigente: 3                                                    |
|                                                                       |
| url_dropbox: \.../tpl_met_depto_lc_v3.docx                            |
|                                                                       |
| │                                                                     |
|                                                                       |
| ▼                                                                     |
|                                                                       |
| Make descarga + Carbone renderiza                                     |
+-----------------------------------------------------------------------+

## 12.6 Compatibilidad entre componentes

  --------------------------------------------------------------------------
  **Componente**   **Versión /       **Compatibilidad clave**
                   Modo**            
  ---------------- ----------------- ---------------------------------------
  Carbone.io       API SaaS o        Acepta DOCX y ODT. Salida PDF, DOCX,
                   self-hosted       XLSX. Soporta iteración, formato
                                     condicional, formato de número y fecha.

  Make             Cualquier plan    Conector nativo Airtable. Conector HTTP
                   con HTTP module   para Carbone. Conectores Dropbox/Drive
                                     nativos.

  Dropbox          API v2            Almacena plantillas y PDFs generados.
                                     Versionado nativo.

  Google Drive     API v3            Espejo opcional para clientes que lo
                                     requieren.

  Airtable         Plan Team o       Necesario por: límite de records,
                   superior          automatizaciones, sync, interfaces.
                                     (revisar al escalar).
  --------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **⚠ Atención a límites de Airtable**                                  |
|                                                                       |
| Base Team estándar: 50.000 records por base. Si TX_Solicitudes crece  |
| a \>40.000 activos, conviene mover histórico a base separada (H\_\*)  |
| y sincronizar. Esto está previsto en la sección 14 de escalabilidad.  |
+=======================================================================+

# 13. AUDITORÍA Y TRAZABILIDAD

Un sistema de tasaciones produce documentos legalmente valiosos.
**Cualquier informe entregado hace 18 meses debe poder reconstruirse
paso a paso, byte a byte**. Quién hizo qué, cuándo, con qué regla, con
qué fórmula, con qué versión de la plantilla. El diseño de la capa de
auditoría es lo que permite responder a una pregunta de un cliente, de
un regulador o de un juzgado con tranquilidad.

## 13.1 Las cinco tablas de auditoría

  ------------------------------------------------------------------------
  **Tabla**           **Qué registra**                   **Crecimiento
                                                         esperado**
  ------------------- ---------------------------------- -----------------
  A_Eventos           Cada acción significativa:         \~150K
                      creación, edición, cambio de       registros/año
                      estado, ejecución de regla,        
                      generación de PDF, envío de email. 
                      Append-only, jamás se edita.       

  A_DecisionesMotor   Una fila por solicitud. Reglas     1 por solicitud
                      candidatas evaluadas, regla        
                      ganadora, snapshot inmutable de la 
                      regla, razón de selección.         

  A_Cambios           Cada modificación en tablas de     \~5K/año
                      configuración (M\_\* y C\_\*).     
                      Before/after, autor, timestamp.    

  A_ErroresMake       Cada error técnico de              Variable,
                      Make/Carbone/Dropbox con payload   idealmente
                      completo del momento del fallo.    \<200/mes

  A_Accesos           Quién entró a qué interfaz/cuándo. \~30K/año
                      Útil para detectar uso indebido y  
                      para reportes de actividad.        
  ------------------------------------------------------------------------

## 13.2 Anatomía de A_Eventos

Esta es la tabla más importante del sistema en términos forenses. Si
A_Eventos está completa, todo el resto es reconstruible.

  ------------------------------------------------------------------------
  **Campo**         **Tipo**         **Detalle**
  ----------------- ---------------- -------------------------------------
  id                Autonumérico     Identificador único.

  timestamp         DateTime         Momento exacto del evento, con
                                     precisión de milisegundos.

  evento_tipo       Selector cerrado solicitud_creada / asignada /
                                     visitada / calculada / pdf_generado /
                                     visada / aprobada / entregada /
                                     cerrada / error / cambio_config /
                                     acceso \...

  solicitud         Link a           Referencia a la solicitud afectada
                    TX_Solicitudes   (puede estar vacío si es evento de
                                     sistema).

  autor_email       Email            Quién originó el evento.

  autor_rol         Selector         ejecutivo / tasador / visador /
                                     aprobador / admin / sistema.

  payload_json      Texto largo      Snapshot completo del estado en ese
                                     momento. JSON.

  origen            Selector         formulario_F1 / formulario_F3 /
                                     make_SC07 / scheduler_SC18 /
                                     admin\...

  resultado         Selector         exito / error / parcial.

  mensaje           Texto largo      Mensaje legible. Vacío para eventos
                                     rutinarios.

  latencia_ms       Número           Cuánto tomó la operación. Útil para
                                     diagnosticar performance.
  ------------------------------------------------------------------------

## 13.3 Reconstrucción completa de una tasación

Pregunta típica: '¿Cómo se llegó al valor de UF 5.842 en la tasación
VP-2026-0427?'. Respuesta completa en menos de un minuto consultando la
base.

+-----------------------------------------------------------------------+
| **RECONSTRUCCIÓN · VP-2026-0427**                                     |
+=======================================================================+
| 1\. TX_Solicitudes\[VP-2026-0427\]                                    |
|                                                                       |
| → datos originales del formulario F1                                  |
|                                                                       |
| → cliente, banco, tipo, comuna, plazo                                 |
|                                                                       |
| 2\. A_DecisionesMotor\[solicitud=VP-2026-0427\]                       |
|                                                                       |
| → regla ganadora: #47 (snapshot completo en JSON)                     |
|                                                                       |
| → reglas candidatas evaluadas: 12                                     |
|                                                                       |
| → razón: \'mayor especificidad\' con score 5                          |
|                                                                       |
| 3\. TX_DatosTasacion\[solicitud=VP-2026-0427\]                        |
|                                                                       |
| → todos los datos capturados en F3                                    |
|                                                                       |
| 4\. TX_Calculos\[solicitud=VP-2026-0427\]                             |
|                                                                       |
| → formula_version: F-DEPTO-LASCONDES v3                               |
|                                                                       |
| → formula_expresion_snapshot (texto exacto en ese momento)            |
|                                                                       |
| → variables_aplicadas (JSON con cada valor usado)                     |
|                                                                       |
| → valor_calculado_uf: 5842.30                                         |
|                                                                       |
| 5\. TX_DocumentosGenerados\[solicitud=VP-2026-0427, tipo=final\]      |
|                                                                       |
| → plantilla_snapshot: TPL-MET-DEPTO-LC v3                             |
|                                                                       |
| → url_dropbox del PDF generado                                        |
|                                                                       |
| 6\. A_Eventos\[solicitud=VP-2026-0427\]                               |
|                                                                       |
| → línea temporal completa: 28 eventos en 4 días                       |
|                                                                       |
| → cada actor, cada acción, cada timestamp                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **★ Snapshots \> referencias**                                        |
|                                                                       |
| Cada decisión guarda un snapshot, no una referencia. Si la regla #47  |
| se edita mañana, el snapshot guardado en A_DecisionesMotor sigue      |
| mostrando la versión usada. Mismo principio para fórmulas             |
| (TX_Calculos.formula_expresion_snapshot) y plantillas                 |
| (TX_DocumentosGenerados.plantilla_snapshot). Esta redundancia         |
| controlada es lo que permite reconstrucción 100% fidedigna.           |
+=======================================================================+

## 13.4 Inmutabilidad y append-only

Cuatro reglas innegociables que el diseño impone:

+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #A-1 · A_Eventos jamás se edita**                       |
|                                                                       |
| Solo se inserta. Si un evento se grabó con error, se inserta un       |
| evento de corrección que apunta al anterior. La línea de tiempo es    |
| sagrada.                                                              |
+=======================================================================+
| **✓ PRINCIPIO #A-2 · A_DecisionesMotor jamás se edita**               |
|                                                                       |
| Una vez que el motor decidió, ese registro queda inmutable. Una nueva |
| decisión sobre la misma solicitud (por re-cálculo) es un nuevo        |
| registro, no un update.                                               |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #A-3 · A_Cambios captura todo cambio de configuración** |
|                                                                       |
| Cualquier edición en M\_\* o C\_\* dispara automatización Airtable    |
| que escribe A_Cambios. Nadie puede editar la base sin dejar rastro.   |
+-----------------------------------------------------------------------+
| **✓ PRINCIPIO #A-4 · Snapshots embebidos en cada decisión**           |
|                                                                       |
| Nada de \'lee la regla #47 al momento de auditar\': la regla #47 en   |
| su versión exacta vive dentro del registro de la decisión.            |
+-----------------------------------------------------------------------+

# 14. ESCALABILIDAD Y MANTENIMIENTO

Escalar este sistema significa: **triplicar el volumen sin reescribir
nada**, agregar un cliente nuevo en una tarde, integrar un banco nuevo
sin tocar Make. El diseño paga por adelantado este precio en forma de
tablas extras, snapshots y desacoplamiento. La factura llega después en
forma de un sistema que escala.

## 14.1 Ejes de escalabilidad

  -----------------------------------------------------------------------
  **Eje**         **Qué significa    **Cómo el diseño lo soporta**
                  escalar aquí**     
  --------------- ------------------ ------------------------------------
  Volumen de      De 200/mes a       TX\_ tablas particionadas
  solicitudes     2.000/mes sin      mensualmente al consolidar H\_\*.
                  degradar SLA.      Z_ColaPendientes evita bloqueos.
                                     Schedulers nocturnos manejan
                                     archivado.

  Multi-cliente   De 3 a 30 clientes Toda configuración por cliente vive
                  activos.           en M_Clientes + C_VariablesCliente.
                                     Plantillas, fórmulas, workflows por
                                     cliente sin tocar el código.

  Multi-banco     De 2 bancos a 15.  M_Bancos como entidad independiente.
                                     Reglas filtran por banco. Workflows
                                     asignables por banco.

  Tipos de        De 4 tipos a 20.   M_TiposInforme es un catálogo. Crear
  informe                            uno nuevo es agregar una fila +
                                     plantilla + fórmula. No requiere
                                     código.

  Volumen         De 200 PDFs/mes a  Carbone escala horizontalmente.
  documental      2.000.             Dropbox/Drive sin límite
                                     operacional. Versionado conserva
                                     históricos sin saturar bases.

  Geografía       De Gran Santiago a M_Comunas cubre las 346 comunas del
                  todo Chile.        país. Asignación de tasador filtra
                                     por comuna. Agregar región es
                                     agregar tasadores.

  Equipo humano   De 5 tasadores a   M_Tasadores y rol de permisos.
                  50.                Asignación automática considera
                                     carga + rating. No requiere
                                     intervención al sumar gente.
  -----------------------------------------------------------------------

## 14.2 Cuellos de botella conocidos y mitigaciones

El sistema no es invulnerable. Estos son los puntos de tensión y su plan
de contingencia.

  -----------------------------------------------------------------------
  **Cuello de       **Síntoma**        **Mitigación**
  botella**                            
  ----------------- ------------------ ----------------------------------
  Límite de records Base Team: 50K     Archivar mensualmente a base
  en base Airtable  records por base.  \'Historia\' vía SC18. Sync de
                    Llega cuando       solo-lectura. Subir a plan
                    TX\_ + A_Eventos   Business o Enterprise si volumen
                    suman millones.    extremo.

  Latencia en       Resolución de      Filtrar primero por cliente_filter
  evaluación de     regla se vuelve    antes de evaluar especificidad.
  muchas reglas     lenta con \>500    Cache de regla aplicada por par
                    reglas.            (cliente, tipo_informe) en
                                       C_ReglasNegocio.cache_resultado.

  Concurrencia en   Race conditions    Patrón de transición de estado:
  escritura         cuando múltiples   solo cambiar estado si el estado
                    Make actualizan la actual es el esperado. Si no
                    misma solicitud.   coincide, abortar y reintentar.

  Tamaño del JSON   Crece con reglas o Comprimir JSON al guardar si
  de snapshot       fórmulas           supera N KB. Mantener legibilidad
                    complejas.         como prioridad.

  Carbone fuera de  Bloquea generación Carbone self-hosted como fallback.
  servicio          de PDFs.           Z_ColaPendientes acumula y SC17
                                       reintenta cuando vuelve.

  Picos de inicio   5x el volumen      Schedulers críticos
  de mes (cierre    normal en 3 días.  (notificaciones, validaciones)
  comercial)                           tienen prioridad. Reportes pesados
                                       se difieren. Capacidad Make
                                       escalable bajo demanda.
  -----------------------------------------------------------------------

## 14.3 Patrones de extensibilidad

Tres patrones recurrentes que el diseño habilita y que conviene
memorizar:

### Patrón 1 --- Agregar un cliente nuevo

5.  Crear registro en M_Clientes (formulario F7).

6.  Crear C_VariablesCliente con logo, firma, pie legal.

7.  Si el cliente tiene plantillas exclusivas: crearlas en C_Plantillas
    y subir DOCX a Dropbox.

8.  Crear regla en C_ReglasNegocio que apunte al cliente y a su
    plantilla preferida (o usar wildcard).

9.  Configurar C_SLA por cliente + tipo de informe.

10. Listo. La siguiente solicitud de ese cliente se procesa
    automáticamente.

### Patrón 2 --- Agregar un tipo de informe nuevo

11. Crear registro en M_TiposInforme con plantilla y fórmula por
    defecto.

12. Agregar a los M_Clientes que lo necesiten (campo
    tipos_informe_permitidos).

13. Crear C_Plantillas + C_Formulas si son específicas, o reutilizar
    existentes.

14. Crear regla en C_ReglasNegocio si requiere comportamiento especial.

15. Listo. F1 lo ofrece automáticamente a los clientes habilitados.

### Patrón 3 --- Cambiar una fórmula de cálculo

16. En F7, crear nueva versión de la fórmula (no editar la actual).

17. Marcar la nueva versión como vigente con vigente_desde = hoy.

18. Las solicitudes en curso siguen con la versión que tenían
    snapshotted.

19. Las solicitudes nuevas usan la versión actualizada.

20. La versión anterior queda en H_FormulasAnteriores con su histórico
    de aplicación.

+-----------------------------------------------------------------------+
| **★ Métrica de salud del diseño**                                     |
|                                                                       |
| Si agregar un cliente nuevo toma más de una hora de trabajo de un     |
| Parametrizador, algo se rompió en el desacoplamiento. Si toma menos   |
| de 15 minutos, el sistema está sano.                                  |
+=======================================================================+

# 15. RIESGOS Y MITIGACIONES

Trece riesgos identificables por adelantado, con su mitigación ya
prevista en el diseño. **Ningún sistema enterprise es invulnerable**; la
diferencia está en haber pensado los problemas antes de que aparezcan.

## 15.1 Riesgos arquitectónicos

+-----------------------------------------------------------------------+
| **R-01 · Acumulación de records en TX\_ y A_Eventos**                 |
|                                                                       |
| Probabilidad: **Alta** \| Impacto: **Alto**                           |
+=======================================================================+
| **Descripción del riesgo:** Volumen alto sostenido lleva a            |
| TX_Solicitudes y A_Eventos cerca del límite de la base Airtable.      |
| Performance se degrada antes de tocar el techo.                       |
|                                                                       |
| **Mitigación implementada en el diseño:** SC18 (scheduler nocturno)   |
| archiva mensualmente a base H\_ separada. Sync de solo-lectura        |
| permite consultar histórico sin saturar la base operacional.          |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-02 · Falla en cascada por dependencia única de Carbone**          |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Crítico**                       |
+=======================================================================+
| **Descripción del riesgo:** Si Carbone.io tiene una caída de varias   |
| horas, todos los PDFs quedan en cola y los SLA empiezan a vencer.     |
|                                                                       |
| **Mitigación implementada en el diseño:** Z_ColaPendientes acumula    |
| sin pérdida. SC17 reintenta automáticamente. Plan de contingencia:    |
| Carbone self-hosted como fallback configurable en                     |
| C_VariablesCliente.usa_carbone_local.                                 |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-03 · Inconsistencia entre Airtable y Make**                       |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Alto**                          |
+=======================================================================+
| **Descripción del riesgo:** Make ejecuta acción, Airtable no recibe   |
| confirmación, estado queda en limbo (visto en producción de otros     |
| sistemas).                                                            |
|                                                                       |
| **Mitigación implementada en el diseño:** Patrón de idempotencia      |
| obligatorio en cada escenario Make: verificar estado actual antes de  |
| actuar. Si la transición ya ocurrió, no hacer nada y reportar éxito.  |
| Z_EjecucionesMake registra cada intento.                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-04 · Concurrencia en escritura**                                  |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Medio**                         |
+=======================================================================+
| **Descripción del riesgo:** Dos escenarios Make actualizan la misma   |
| solicitud al mismo tiempo: el segundo sobrescribe lo del primero.     |
|                                                                       |
| **Mitigación implementada en el diseño:** Lock implícito vía estado:  |
| cambios de estado son atómicos en Airtable. Verificar estado antes de |
| escribir. Si el estado cambió desde la lectura, reintentar.           |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-05 · Pérdida de snapshot por edición accidental**                 |
|                                                                       |
| Probabilidad: **Baja** \| Impacto: **Crítico**                        |
+=======================================================================+
| **Descripción del riesgo:** Un admin edita un registro de             |
| A_DecisionesMotor o TX_Calculos, destruyendo la inmutabilidad.        |
|                                                                       |
| **Mitigación implementada en el diseño:** Permisos restringidos: el   |
| rol Admin no tiene escritura sobre A\_\*. Solo automatizaciones del   |
| sistema escriben. Backups diarios (SC15) permiten restaurar.          |
+-----------------------------------------------------------------------+

## 15.2 Riesgos operacionales y de UX

+-----------------------------------------------------------------------+
| **R-06 · Captura incorrecta de datos en F1 por usuario externo**      |
|                                                                       |
| Probabilidad: **Alta** \| Impacto: **Alto**                           |
+=======================================================================+
| **Descripción del riesgo:** Solicitante externo escribe la dirección  |
| mal, elige el tipo de propiedad equivocado, ingresa rol SII inválido. |
|                                                                       |
| **Mitigación implementada en el diseño:** Validación agresiva en F1:  |
| máscaras, listas restringidas, lógica condicional, validación de rol  |
| SII si el cliente lo exige. SC01 hace segunda validación al entrar a  |
| TX_Solicitudes.                                                       |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-07 · Mala señal de internet en terreno bloquea F3**               |
|                                                                       |
| Probabilidad: **Alta** \| Impacto: **Medio**                          |
+=======================================================================+
| **Descripción del riesgo:** El tasador está en una zona sin cobertura |
| y no puede enviar el formulario.                                      |
|                                                                       |
| **Mitigación implementada en el diseño:** El formulario Next.js IF-03 |
| guarda draft en localStorage del navegador cada 30 s, comprime fotos  |
| en cliente y permite reintentar al recuperar señal. Plan B            |
| documentado: tasador captura en cualquier app de notas y luego        |
| transcribe en IF-03 al volver.                                        |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-08 · Tasador asignado no acusa recibo / se demora**               |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Alto**                          |
+=======================================================================+
| **Descripción del riesgo:** SLA empieza a correr y el tasador no      |
| entra al sistema. Solicitud se atasca silenciosamente.                |
|                                                                       |
| **Mitigación implementada en el diseño:** SC04 verifica cada hora. Si |
| no hay recibido en N horas (parametrizable), escala al operador. F6   |
| tiene vista \'Por reasignar\' destacada.                              |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-09 · Visado superficial / sin revisión real**                     |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Alto**                          |
+=======================================================================+
| **Descripción del riesgo:** Visador aprueba sin mirar realmente,      |
| casos especiales no se detectan.                                      |
|                                                                       |
| **Mitigación implementada en el diseño:** F4 obliga a marcar          |
| checklist técnico. Mínimo 4 ítems requeridos. Vista \'Aprobaciones    |
| cuestionables\' (calidad \<3 en F3, comparables \<3, riesgo marcado)  |
| destacada para visadores.                                             |
+-----------------------------------------------------------------------+

## 15.3 Riesgos de parametrización

+-----------------------------------------------------------------------+
| **R-10 · Sobre-parametrización: demasiadas reglas conflictivas**      |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Alto**                          |
+=======================================================================+
| **Descripción del riesgo:** Con el tiempo se crean reglas redundantes |
| o contradictorias. Resolución vuelve impredecible.                    |
|                                                                       |
| **Mitigación implementada en el diseño:** Algoritmo de resolución     |
| determinista (mayor especificidad, fecha de vigencia). Vista \'Reglas |
| redundantes\' alerta conflictos. Botón \'Probar regla\' (F7) simula   |
| impacto antes de activar.                                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-11 · Edición destructiva de plantilla/fórmula vigente**           |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Crítico**                       |
+=======================================================================+
| **Descripción del riesgo:** Un parametrizador edita en lugar de       |
| versionar. Solicitudes nuevas y antiguas usan una mezcla.             |
|                                                                       |
| **Mitigación implementada en el diseño:** Versionado obligatorio en   |
| F7. Edición directa bloqueada vía permisos. Snapshots ya guardados en |
| TX_Calculos y TX_DocumentosGenerados protegen lo histórico. Backup    |
| diario.                                                               |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-12 · Pérdida de conocimiento al cambiar el parametrizador**       |
|                                                                       |
| Probabilidad: **Media** \| Impacto: **Alto**                          |
+=======================================================================+
| **Descripción del riesgo:** El admin que sabía por qué se creó cada   |
| regla se va. El siguiente no entiende qué es seguro modificar.        |
|                                                                       |
| **Mitigación implementada en el diseño:** Campo notas_diseno          |
| obligatorio en todas las tablas C\_\*. A_Cambios registra autor +     |
| razón de cada cambio. Documento de arquitectura (este documento) como |
| referencia perenne.                                                   |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **R-13 · Limitaciones de la plataforma Airtable**                     |
|                                                                       |
| Probabilidad: **Baja** \| Impacto: **Medio**                          |
+=======================================================================+
| **Descripción del riesgo:** Airtable es buena base operacional pero   |
| no es PostgreSQL: límite de records, ausencia de transacciones        |
| reales, automatizaciones con cota.                                    |
|                                                                       |
| **Mitigación implementada en el diseño:** Decisión informada al       |
| inicio. El diseño respeta los límites: archivado a bases H\_,         |
| snapshots para evitar transacciones, externalización de lógica        |
| intensiva a Make. Camino de upgrade a Enterprise documentado.         |
+-----------------------------------------------------------------------+

## 15.4 Matriz consolidada

Vista panorámica para análisis de riesgo gerencial.

  --------------------------------------------------------------------------------------
  **ID**   **Riesgo**                 **Probabilidad**   **Impacto**   **Categoría**
  -------- -------------------------- ------------------ ------------- -----------------
  R-01     Acumulación de records     Alta               Alto          Arquitectura

  R-02     Caída de Carbone           Media              Crítico       Arquitectura

  R-03     Inconsistencia             Media              Alto          Arquitectura
           Airtable-Make                                               

  R-04     Concurrencia en escritura  Media              Medio         Arquitectura

  R-05     Edición accidental de      Baja               Crítico       Arquitectura
           auditoría                                                   

  R-06     Captura incorrecta en F1   Alta               Alto          Operacional

  R-07     Mala señal en terreno      Alta               Medio         Operacional

  R-08     Tasador no responde        Media              Alto          Operacional

  R-09     Visado superficial         Media              Alto          Operacional

  R-10     Sobre-parametrización      Media              Alto          Parametrización

  R-11     Edición destructiva        Media              Crítico       Parametrización

  R-12     Pérdida de conocimiento    Media              Alto          Parametrización

  R-13     Limitaciones Airtable      Baja               Medio         Plataforma
  --------------------------------------------------------------------------------------

# 16. ROADMAP DE IMPLEMENTACIÓN

Implementación recomendada: **veinte semanas en cinco fases**. Cada fase
entrega valor verificable y permite congelar avances antes de continuar.
No es un big-bang; es un sistema que se enciende por partes.

+-----------------------------------------------------------------------+
| **▌ Principio del roadmap**                                           |
|                                                                       |
| Construir primero el cerebro (modelo + motor de reglas), después la   |
| captura (formularios), después la automatización (Make), después la   |
| salida (Carbone) y por último el monitoreo (dashboards). Cualquier    |
| orden distinto deja al sistema sin tracción.                          |
+=======================================================================+

## 16.1 Las cinco fases

+----------+-----------------------------------------------------------+
| FASE     | **Fundación de la base**                                  |
|          |                                                           |
| **1**    | **✓ Crear las 45 tablas con todos sus campos (incluye las |
|          | 9 de la adenda v2.1).**                                   |
| Semanas  |                                                           |
| 1 a 4    | **✓** Cargar catálogos: M_Comunas, M_TiposPropiedad,      |
|          | M_TiposInforme, M_Clientes iniciales, M_Bancos iniciales. |
|          |                                                           |
|          | **✓** Cargar al menos un set inicial de reglas en         |
|          | C_ReglasNegocio.                                          |
|          |                                                           |
|          | **✓** Configurar permisos por rol.                        |
|          |                                                           |
|          | **✓** Definir vistas operacionales en Airtable Interface. |
|          |                                                           |
|          | **✓** Hito de salida: una solicitud creada manualmente    |
|          | resuelve correctamente la regla, fórmula y plantilla      |
|          | aplicables.                                               |
+==========+===========================================================+

+----------+-----------------------------------------------------------+
| FASE     | **Captura por formularios**                               |
|          |                                                           |
| **2**    | **✓** Construir IF-01 (Cliente externo) en Next.js +      |
|          | Clerk (Railway) con todas sus validaciones --- usar       |
| Semanas  | v0.dev para maquetar y Claude Code para integrar.         |
| 5 a 8    |                                                           |
|          | **✓** Construir F2 en Airtable Interface.                 |
|          |                                                           |
|          | **✓** Construir IF-03 (Tasador) en Next.js + Clerk        |
|          | (Railway, PWA móvil) con URL parametrizada --- usar       |
|          | v0.dev para maquetar y Claude Code para integrar.         |
|          |                                                           |
|          | **✓** Construir F4 y F5 en Airtable Interface.            |
|          |                                                           |
|          | **✓** Configurar URLs por cliente para F1 con parámetros  |
|          | pre-cargados.                                             |
|          |                                                           |
|          | **✓** Pruebas con usuarios reales (ejecutivo, tasador,    |
|          | visador).                                                 |
|          |                                                           |
|          | **✓** Hito de salida: una solicitud puede ingresar por    |
|          | F1, asignarse, capturarse en terreno (F3), ser visada     |
|          | (F4) y aprobada (F5) sin Make involucrado todavía.        |
+==========+===========================================================+

+----------+-----------------------------------------------------------+
| FASE     | **Automatización con Make**                               |
|          |                                                           |
| **3**    | **✓** Construir escenarios SC01 a SC10 con el patrón de   |
|          | idempotencia.                                             |
| Semanas  |                                                           |
| 9 a 13   | **✓** Configurar Z_EscenariosMake y Z_Schedulers.         |
|          |                                                           |
|          | **✓** Implementar manejo de errores y A_ErroresMake.      |
|          |                                                           |
|          | **✓** Implementar Z_ColaPendientes y SC17 (reintentos).   |
|          |                                                           |
|          | **✓** Pruebas de carga: 50 solicitudes simultáneas.       |
|          |                                                           |
|          | **✓** Pruebas de fallo: simular caída de Make, validar    |
|          | recuperación.                                             |
|          |                                                           |
|          | **✓** Hito de salida: cuando una solicitud se aprueba en  |
|          | F5, automáticamente se notifica al cliente sin            |
|          | intervención manual.                                      |
+==========+===========================================================+

+----------+-----------------------------------------------------------+
| FASE     | **Generación documental**                                 |
|          |                                                           |
| **4**    | **✓** Diseñar plantillas Carbone iniciales (mínimo 3:     |
|          | hipotecario, comercial, especial).                        |
| Semanas  |                                                           |
| 14 a 17  | **✓** Subir plantillas a Dropbox y registrar en           |
|          | C_Plantillas.                                             |
|          |                                                           |
|          | **✓** Construir SC07 y SC10 con integración Carbone.      |
|          |                                                           |
|          | **✓** Implementar versionado y archivado de plantillas    |
|          | (H_PlantillasAnteriores).                                 |
|          |                                                           |
|          | **✓** Pruebas con clientes reales: validar que el PDF     |
|          | generado cumple sus estándares.                           |
|          |                                                           |
|          | **✓** Hito de salida: PDF entregado al cliente con        |
|          | calidad final, generado 100% automáticamente.             |
+==========+===========================================================+

+----------+-----------------------------------------------------------+
| FASE     | **Operación y dashboards**                                |
|          |                                                           |
| **5**    | **✓** Construir F6 (operador) y F7 (parametrizador).      |
|          |                                                           |
| Semanas  | **✓** Construir F8 (dashboard supervisor) con todos los   |
| 18 a 20  | KPIs.                                                     |
|          |                                                           |
|          | **✓** Configurar alertas automáticas: SLA en riesgo,      |
|          | errores Make, reglas conflictivas.                        |
|          |                                                           |
|          | **✓** Capacitación del equipo operacional.                |
|          |                                                           |
|          | **✓** Implementar SC15 (backups) y SC18 (archivado        |
|          | nocturno).                                                |
|          |                                                           |
|          | **✓** Documentación final: este documento + manual de     |
|          | operación + cheat sheets por rol.                         |
|          |                                                           |
|          | **✓** Hito de salida: sistema en producción, equipo       |
|          | autónomo, ciclo cerrado.                                  |
+==========+===========================================================+

## 16.2 Quick wins de las primeras dos semanas

Cinco entregas tempranas que generan confianza y permiten ajustar
mientras se construye:

21. Semana 1: modelo M\_\* completo y poblado con catálogos reales
    (comunas, tipos, bancos).

22. Semana 2: TX_Solicitudes y A_Eventos funcionales, con una solicitud
    manual de prueba.

23. Semana 3: motor de reglas resolviendo correctamente para 3 casos
    representativos.

24. Semana 4: F7 mínimo funcional permitiendo a un admin crear una regla
    nueva.

25. Semana 5: F1 público con URL real y captura de primera solicitud
    real.

## 16.3 Equipo recomendado

  -----------------------------------------------------------------------
  **Rol**            **Dedicación**    **Responsabilidad principal**
  ------------------ ----------------- ----------------------------------
  Arquitecto técnico 100% durante todo Define modelo, motor de reglas,
  (Líder)            el proyecto       integraciones, calidad técnica.

  Implementador      100% fases 1-2-5  Crea tablas, vistas, interfaces,
  Airtable                             automatizaciones nativas.

  Implementador Make 100% fase 3, 50%  Construye los 20 escenarios y
                     fases 4-5         maneja errores.

  Especialista       100% fase 4       Diseña plantillas y configura
  Carbone                              integración.

  Analista funcional 50% durante todo  Documenta reglas de negocio,
                     el proyecto       valida con clientes, capacita
                                       usuarios.

  Tester / QA        100% fases 2-5    Pruebas funcionales, de carga, de
                                       errores. Valida snapshots y
                                       auditoría.
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **★ Camino crítico**                                                  |
|                                                                       |
| La fase 1 es el camino crítico. Si el modelo no queda bien la primera |
| vez, todas las fases siguientes se atrasan. Invertir más tiempo en la |
| semana 1-4 paga 10x en las semanas posteriores. Resistir la tentación |
| de pasar a la fase 2 con el modelo medio terminado.                   |
+=======================================================================+

# 17. ANEXOS

Material de referencia rápida para implementación, operación y
mantenimiento.

## Anexo A --- Checklist de go-live

Doce verificaciones obligatorias antes de habilitar el sistema en
producción.

  ----------------------------------------------------------------------------
  **\#**   **Verificación**             **Cómo validar**
  -------- ---------------------------- --------------------------------------
  1        Las 45 tablas existen y      Vista \'Esquema\' en Airtable + script
           tienen relaciones correctas  de validación.

  2        Catálogos M\_\* completos    Conteo de registros + sanity check
           (Comunas, Tipos, Clientes,   manual.
           Bancos)                      

  3        Al menos 1 regla wildcard    Test: solicitud genérica resuelve a
           activa en C_ReglasNegocio    regla wildcard.

  4        F1 con URL por cliente       Submit de prueba real desde URL del
           productiva y validada        cliente.

  5        F3 funciona en móvil con     Test en sitio real con plan de datos
           baja conectividad            limitado.

  6        Permisos por rol             Cada rol prueba que NO accede a lo que
           configurados                 no debe.

  7        Los 20 escenarios Make       Z_EscenariosMake.estado=activo y
           activos y probados           ejecución exitosa de cada uno.

  8        Backups nocturnos            Verificar SC15 corrió la noche
           funcionando                  anterior y dejó archivo en Drive.

  9        Plantillas Carbone subidas y Generar PDF de prueba con cada
           vinculadas                   plantilla.

  10       Variables de cliente         Render preliminar de PDF muestra
           cargadas (logo, firma, pie)  branding correcto.

  11       Capacitación realizada para  Acta de capacitación firmada por cada
           los 8 roles                  usuario.

  12       Plan de contingencia         Simulacro: ¿qué hacemos si Carbone se
           validado                     cae?, ¿si Airtable cae?
  ----------------------------------------------------------------------------

## Anexo B --- Cheat sheet del Parametrizador

Decisiones rápidas para el rol más crítico del sistema.

  -------------------------------------------------------------------------
  **Pregunta del    **Respuesta corta**  **Detalle**
  día**                                  
  ----------------- -------------------- ----------------------------------
  Crear cliente     F7 → Alta cliente    Recordar:
  nuevo?                                 tipos_informe_permitidos,
                                         plantillas, SLA por tipo.

  Cambiar fórmula?  Nunca editar,        Crear nueva versión + marcar
                    siempre versionar    vigente_desde. Versión anterior
                                         queda automática en H\_.

  Una solicitud no  Verificar wildcard   Debe existir mínimo 1 regla
  resuelve regla?                        wildcard activa en
                                         C_ReglasNegocio.

  Cambiar el logo   C_VariablesCliente   No tocar la plantilla, solo la URL
  de un cliente?                         del logo en variables. Carbone lo
                                         lee dinámicamente.

  Agregar zona /    M_Comunas            Definir región, valor UF base,
  comuna nueva?                          coeficiente plusvalía.

  Crear nuevo tipo  M_TiposInforme       Asignar plantilla por defecto +
  de informe?                            fórmula por defecto + workflow.

  Cambiar el SLA de C_SLA                Por par (cliente, tipo_informe).
  un cliente?                            Solicitudes en curso conservan SLA
                                         inicial.

  Un tasador se va? M_Tasadores →        No borrar registro: las
                    activa=false         solicitudes históricas necesitan
                                         la referencia.
  -------------------------------------------------------------------------

## Anexo C --- Glosario técnico

  -----------------------------------------------------------------------
  **Término**       **Definición**
  ----------------- -----------------------------------------------------
  Especificidad     Métrica de cuán precisa es una regla. Suma de filtros
                    no-wildcard que matchean una solicitud. Mayor
                    especificidad gana en la resolución.

  Snapshot          Copia inmutable del estado de un registro en un
                    momento dado. Embebido en decisiones críticas para
                    garantizar reproducibilidad.

  Wildcard rule     Regla con casi todos los filtros vacíos, usada como
                    red de seguridad. Garantiza que cualquier solicitud
                    resuelva al menos a una regla.

  Idempotencia      Propiedad de una operación tal que ejecutarla N veces
                    produce el mismo resultado que ejecutarla 1 vez.
                    Obligatoria en todo escenario Make.

  Append-only       Patrón de tabla donde solo se insertan registros,
                    nunca se editan ni borran. Obligatorio en A_Eventos y
                    A_DecisionesMotor.

  Lookup            Campo de Airtable que muestra el valor de una columna
                    de una tabla relacionada.

  Rollup            Campo de Airtable que agrega (suma, cuenta,
                    concatena) valores de registros relacionados.

  Next.js + Clerk   Adoptada en v2.5 como capa de formularios y UIs
  (Railway)         principales (Cliente, Ejecutiva, Tasador, Visador).
                    Reemplaza a Softr (descartado), generada con v0.dev y
                    mantenida con Claude Code.

  Carbone           Motor de generación documental que renderiza
                    plantillas DOCX a PDF.

  Make              Plataforma de automatización (anteriormente
                    Integromat) usada para escenarios.

  SLA               Service Level Agreement. Tiempo máximo comprometido
                    para entregar una tasación, por cliente y tipo.
  -----------------------------------------------------------------------

## Anexo D --- Blueprint consolidado del sistema

Vista global de una página de todo el ecosistema VProperty.

+-----------------------------------------------------------------------------+
| **VPROPERTY · ECOSISTEMA COMPLETO · VISTA GLOBAL**                          |
+=============================================================================+
| ┌─────────────────────────────────────────────────────────────────────────┐ |
|                                                                             |
| │ ENTRADAS (formularios) │                                                  |
|                                                                             |
| │ IF-01 Next.js (web público) · IF-02 Next.js (consola ejec.) · IF-03       |
| Next.js (PWA tasador)│                                                      |
|                                                                             |
| └────────────────────────────┬────────────────────────────────────────────┘ |
|                                                                             |
| │                                                                           |
|                                                                             |
| ┌────────────────────────────▼────────────────────────────────────────────┐ |
|                                                                             |
| │ AIRTABLE · CEREBRO CENTRAL │                                              |
|                                                                             |
| │ │                                                                         |
|                                                                             |
| │ M\_\* Maestros (8 tablas) C\_\* Configuración (10 tablas) │               |
|                                                                             |
| │ TX\_\* Transaccional (13 tablas) A\_\* Auditoría (5 tablas) │             |
|                                                                             |
| │ H\_\* Histórico (5 tablas) Z\_\* Automatizaciones (5 tablas) │            |
|                                                                             |
| │ │                                                                         |
|                                                                             |
| │ MOTOR DE REGLAS → MOTOR PARAMETRIZABLE → MÁQUINA DE ESTADOS │             |
|                                                                             |
| └────────────────┬───────────────────────────────────┬────────────────────┘ |
|                                                                             |
| │ │                                                                         |
|                                                                             |
| ┌────────────────▼─────────────┐ ┌───────────▼──────────────────┐           |
|                                                                             |
| │ MAKE · EJECUTOR │ │ INTERFACES OPERACIONALES │                            |
|                                                                             |
| │ 20 escenarios (SC01-SC20) │ │ F4 Visador · F5 Aprob. │                    |
|                                                                             |
| │ webhooks + schedulers │ │ F6 Operador · F7 Param. │                       |
|                                                                             |
| └─────┬──────────────────┬─────┘ │ F8 Supervisor │                          |
|                                                                             |
| │ │ └──────────────────────────────┘                                        |
|                                                                             |
| ▼ ▼                                                                         |
|                                                                             |
| ┌──────────┐ ┌──────────────┐                                               |
|                                                                             |
| │ CARBONE │ │ DROPBOX/DRIVE│                                                |
|                                                                             |
| │ PDF gen. │ │ Almacenam. │                                                 |
|                                                                             |
| └────┬─────┘ └──────┬───────┘                                               |
|                                                                             |
| │ │                                                                         |
|                                                                             |
| └─────────┬─────────┘                                                       |
|                                                                             |
| ▼                                                                           |
|                                                                             |
| PDF ENTREGADO AL CLIENTE                                                    |
+-----------------------------------------------------------------------------+

## Anexo E --- Auditoría XLSM: 50 reglas y cobertura del modelo (adenda v2.1)

Resultado del cruce de las 50 reglas de negocio catalogadas en el XLSM
legacy contra el modelo de 45 tablas. Estado: ✓ cubierto · ◐ parcial · ✗
GAP nuevo · --- fuera de scope.

+---------------------------+--------------------+-------------+-------------+---------------------------+
| **RB**                    | **Regla**          | **Estado**  | **GAP**     | **Resolución**            |
+===========================+====================+=============+=============+===========================+
| **Cobertura global**                                                                                   |
|                                                                                                        |
| ✓ Cubierto: 12 (24%) · ◐ Parcial: 14 (28%) · ✗ GAP nuevo: 21 (42%) · --- Fuera de scope: 3 (6%). Total |
| 23 GAPs únicos, todos cubiertos dentro del roadmap de 20 semanas.                                      |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-1                      | Detección tipo     | ◐           | M-G1        | Pronombre + campos extra  |
|                           | propiedad          |             |             | en M_TiposPropiedad       |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-2                      | Campos             | ✗           | M-G1        | 11 columnas en            |
|                           | condicionales tipo |             |             | M_TiposPropiedad          |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-3                      | Lookup             | ✗           | M-G3        | Nueva tabla               |
|                           | zonificación       |             |             | M_Zonificacion (\~2.744   |
|                           |                    |             |             | filas)                    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-4                      | Valor terreno      | ◐           | M-G2        | uf_m2_terreno separado en |
|                           |                    |             |             | M_Comunas                 |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-5                      | Valor edificación  | ✗           | C-G1        | Nueva tabla               |
|                           |                    |             |             | C_PreciosUnitarios        |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-6                      | Obras              | ✗           | TX-G3       | Nueva tabla               |
|                           | complementarias    |             |             | TX_ObrasComplementarias   |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-7                      | Vida útil por año  | ✗           | C-G2        | Nueva tabla C_VidaUtil    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-8                      | Valores            | ✓           | (RB-37)     | Resuelta por RB-37        |
|                           | remate/liquidación |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-9                      | Valor reposición   | ◐           | C-G1        | Depende de RB-5 y RB-6    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-10                     | Factor             | ✗           | C-G7a       | Coef. conservación en     |
|                           | depreciación D.F.  |             |             | C_Factores                |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-11                     | Cálculo honorarios | ✗           | C-G4        | Nueva tabla               |
|                           |                    |             |             | C_TramosHonorarios        |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-12                     | Refi vs Crédito    | ✓           | ---         | Datos ya existen          |
|                           | Hip.               |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-13                     | RUT módulo 11      | ✓           | ---         | Fórmula Airtable          |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-14                     | Alerta año         | ✓           | ---         | fecha_visita existe       |
|                           | tasación           |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-15                     | Fecha visado       | ✗           | C-G3        | Nueva tabla C_Feriados    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-16                     | Alerta institución | ◐           | M-G5        | Campo es_leasing en       |
|                           | leasing            |             |             | M_Clientes                |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-17                     | Validación         | ✗           | TX-G2       | roles en F3               |
|                           | bodegas/estac.     |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-18                     | Etiquetas pisos    | ◐           | M-G1        | M_TiposPropiedad          |
|                           | por tipo           |             |             | extendida                 |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-19                     | Clasificación      | ✓           | ---         | sup_construccion_m2       |
|                           | DFL-2              |             |             | existe                    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-20                     | Alerta asbesto     | ◐           | TX-G4a      | agrupacion_propiedad en   |
|                           | pre-1995           |             |             | F3                        |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-21                     | Validación m²      | ✗           | TX-G1       | Tabla                     |
|                           | construidos        |             |             | TX_ItemsCuadroValoracion  |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-22                     | Textos dinámicos   | ✓           | (Carbone)   | Lógica en plantilla       |
|                           | por tipo           |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-23                     | Ordenamiento pisos | ✓           | (Carbone)   | Lógica en plantilla       |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-24                     | Homogeneización    | ◐           | C-G6        | Nueva tabla               |
|                           | comparables        |             |             | C_FactoresHomogeneizacion |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-25                     | Selección valor    | ✓           | ---         | Mín. 3 ya en F3.C6        |
|                           | final              |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-26                     | Tramos honorarios  | ✗           | C-G4        | Mismo gap que RB-11       |
|                           | UF                 |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-27                     | Asignación         | ✓           | ---         | zonas_cobertura existe    |
|                           | territorial        |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-28                     | Identidad visador  | ◐           | M-G4        | firma_url en M_Visadores  |
|                           | firma              |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-29                     | Separación         | ✓           | (Make)      | RegEx en Make/Carbone     |
|                           | calle/número       |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-30                     | Valoración leasing | ◐           | TX-G1       | Depende del cuadro        |
|                           |                    |             |             | granular                  |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-31                     | Códigos estructura | ◐           | E-G1        | 13 códigos en             |
|                           | ULH                |             |             | C_Equivalencias           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-32                     | Tramos bien común  | ✗           | C-G5        | Nueva tabla               |
|                           |                    |             |             | C_TramosBienComun         |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-33                     | Radio urbano       | ✓           | (M-G3)      | Se resuelve con           |
|                           | alcant.            |             |             | M_Zonificacion            |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-34                     | Validación comunas | ✓           | ---         | zonas_cobertura existe    |
|                           | tasador            |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-35                     | Factor Seguro      | ◐           | M-G6/G7     | factor en M_Clientes +    |
|                           | Incendio           |             |             | subtipos + RB-5           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-36                     | Cap rate (4.5% vs  | ◐           | M-G5        | Mismo gap es_leasing      |
|                           | 6%)                |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-37                     | Factor             | ◐           | C-G7b       | velocidad_venta en F3 +   |
|                           | remate/velocidad   |             |             | tramos C_Factores         |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-38                     | Terraza valor 50%  | ✗           | TX-G1       | factor_aplicado por ítem  |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-39                     | Bienes no garantía | ✗           | TX-G1       | flags por ítem            |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-40                     | Tabla maestra      | ✗           | M-G1        | Misma que RB-2            |
|                           | config tipo        |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-41                     | 19 atributos       | ✗           | M-G3        | Misma M_Zonificacion      |
|                           | zonificación       |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-42                     | M² consistencia    | ✗           | TX-G1       | Rollup sobre ítems        |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-43                     | Rol en cuadro      | ✗           | TX-G1       | rol_sii por ítem          |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-44                     | Coef. ocupación    | ✗           | TX-G4b      | servidumbre, sup 1er piso |
|                           | suelo              |             |             | en F3                     |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-45                     | Feriados Chile     | ✗           | C-G3        | Misma C_Feriados          |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-46                     | Consistencia       | ✗           | TX-G2       | Mismo que RB-17           |
|                           | OO.CC. roles       |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-47                     | Materialidad ULH   | ◐           | E-G2        | 12 códigos en             |
|                           |                    |             |             | C_Equivalencias           |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-48                     | Bug VBA            | ---         | ---         | No replicar (bug          |
|                           | TraducirNumero     |             |             | conocido)                 |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-49                     | Auto-imprimir      | ---         | ---         | No aplica (impresión      |
|                           | Tapa + ULH         |             |             | Excel)                    |
+---------------------------+--------------------+-------------+-------------+---------------------------+
| RB-50                     | Workflow paralelo  | ---         | (C_Work)    | Usa tabla existente       |
|                           | BICE               |             |             |                           |
+---------------------------+--------------------+-------------+-------------+---------------------------+

## Anexo F --- Los 23 GAPs y su fase de cierre (adenda v2.1)

  ----------------------------------------------------------------------------------
  **GAP**   **Descripción**                 **Dominio**   **Fase**   **Prioridad**
  --------- ------------------------------- ------------- ---------- ---------------
  M-G1      11 columnas en M_TiposPropiedad Maestro       1          Alta

  M-G2      uf_m2_terreno / construccion en Maestro       1          Media
            M_Comunas                                                

  M-G3      Tabla M_Zonificacion (2.744     Maestro       1          Alta
            filas)                                                   

  M-G4      firma_url en M_Visadores        Maestro       2          Baja

  M-G5      es_leasing en M_Clientes        Maestro       1          Media

  M-G6      factor_seguro_incendio en       Maestro       1          Alta
            M_Clientes                                               

  M-G7      Subtipos de exclusión seguro    Maestro       1          Alta

  C-G1      Tabla C_PreciosUnitarios        Config        1          Alta

  C-G2      Tabla C_VidaUtil                Config        1          Alta

  C-G3      Tabla C_Feriados                Config        1          Media

  C-G4      Tabla C_TramosHonorarios        Config        5          Baja

  C-G5      Tabla C_TramosBienComun         Config        5          Baja

  C-G6      Tabla C_FactoresHomogeneizacion Config        3          Media

  C-G7a     Coef. conservación en           Config        1          Alta
            C_Factores                                               

  C-G7b     9 tramos velocidad venta en     Config        1          Alta
            C_Factores                                               

  TX-G1     ★ Tabla                         Transac       2          MUY ALTA
            TX_ItemsCuadroValoracion                                 

  TX-G2     Roles SII bodega/estac. en F3   Transac       2          Media

  TX-G3     Tabla TX_ObrasComplementarias   Transac       2          Media

  TX-G4a    agrupacion_propiedad en F3      Transac       2          Baja

  TX-G4b    servidumbre, sup 1er piso, prc  Transac       2          Baja
            en F3                                                    

  TX-G5     velocidad_venta_estimada en F3  Transac       2          Alta

  E-G1      13 códigos materialidad ULH     Equival       1          Baja

  E-G2      12 códigos materialidad ULH     Equival       1          Baja
  ----------------------------------------------------------------------------------

## Cierre

Este documento es el **plano de construcción** de la capa de datos de
VProperty. Cada decisión está justificada, cada tabla tiene un
propósito, cada formulario alimenta un motor que decide solo. **La base
de datos no es almacenamiento: es el cerebro del sistema.** Y los
formularios son la interfaz crítica que alimenta ese cerebro.

Construido bien la primera vez, escala diez años sin requerir
reescritura. Construido mal, se vuelve la deuda técnica que pesa sobre
cada nueva integración. ***Este diseño elige la primera opción.***

+-----------------------------------------------------------------------+
| **▶ Próximo paso**                                                    |
|                                                                       |
| Validar este diseño con el equipo de implementación, ajustar lo que   |
| sea necesario, y comenzar la Fase 1 según el roadmap (sección 16).    |
| Los anexos contienen todo lo necesario para empezar.                  |
+=======================================================================+

# 18. ADENDA v2.2 --- Segunda auditoría forense y cierre de cálculo reproducible

Esta sección se incorpora como **adenda v2.2**, posterior a la adenda
v2.1 (auditoría del XLSM). Es el resultado de un **segundo pase
forense** que ya no compara contra el archivo Excel, sino contra **cinco
tasaciones reales** verificadas matemáticamente celda a celda
(data_only) del motor XLSM. Mientras la adenda v2.1 catalogó las 50
reglas de negocio implícitas y abrió 23 GAPs estructurales, este pase
valida si el modelo ---ya enriquecido--- puede REPRODUCIR los valores
reales al céntimo. La conclusión: el diseño es sólido, pero su
probabilidad de reproducción 100%-idéntica HOY es del orden del
**55-65%**, y alcanza **90%+** tras cerrar los 9 hallazgos críticos de
esta adenda.

+-----------------------------------------------------------------------+
| **▌ Por qué esta adenda no rediseña la arquitectura**                 |
|                                                                       |
| El riesgo NO está en las fórmulas individuales ---están bien          |
| migradas--- sino en cuatro frentes: (a) la **orquestación** de \~15   |
| cálculos secuenciales interdependientes; (b) los **overrides          |
| manuales** del tasador sobre celdas-fórmula; (c) la **generación de   |
| texto descriptivo** hoy hecha con InputBox de VBA; y (d) la ausencia  |
| de **casos de prueba** que ejerciten tramos distintos al único        |
| observado. Ninguno obliga a rediseñar los 6 dominios: se resuelven    |
| con nuevos campos, una capa de ejecución y una capa de saneamiento,   |
| todo dentro del modelo existente.                                     |
+-----------------------------------------------------------------------+

Cobertura real ponderada por criticidad de cálculo (este pase):
**\~58%**. Las nueve debilidades de diseño detectadas y su severidad se
resumen a continuación; cada una se cierra en una subsección de esta
adenda.

  ---------------------------------------------------------------------------------
  **\#**   **Hallazgo crítico**                          **Severidad**   **Se
                                                                         cierra
                                                                         en**
  -------- --------------------------------------------- --------------- ----------
  1        Cadena de cálculo sin grafo de dependencias   Crítica         §18.2
           ni orden de ejecución (DAG)                                   

  2        Overrides manuales del tasador no             Crítica         §18.4
           contemplados (tasa, vida útil, valor)                         

  3        Texto descriptivo legal generado por IA sin   Crítica         §18.9
           contrato ni validación                                        

  4        Cobertura de prueba insuficiente (5 casos =   Alta            §18.10
           mismo camino)                                                 

  5        Tipos de dato heterogéneos / valores no       Alta            §18.3
           numéricos (NO REGISTRA, RUT 0)                                

  6        Mapeo cliente→tasa modelado como booleano     Alta            §18.4
           insuficiente                                                  

  7        Factor garantía (0,8) ≠ factor seguro         Alta            §18.5
           (0,825); exclusión por ítem                                   

  8        Renta perpetua y conversión USD ausentes de   Alta            §18.6
           C_Formulas                                                    

  9        Vida útil remanente con desviación de tramo   Media           §18.7
           no catalogada                                                 
  ---------------------------------------------------------------------------------

## 18.1 Las 12 nuevas reglas de negocio (NRB) detectadas

El segundo pase añade **12 reglas de negocio** no presentes en las 50 RB
catalogadas en v2.1. Se nombran con el prefijo **NRB** para
distinguirlas. Estas reglas no viven en código: se materializan como
campos, fórmulas declarativas o flags en las tablas que se especifican
en esta adenda.

  ---------------------------------------------------------------------------------
  **ID**   **Regla detectada**    **Evidencia (caso real)** **Prio.**   **Crit.**
  -------- ---------------------- ------------------------- ----------- -----------
  NRB-01   Override manual de     Las Rejas: BJ41=0,055     P1          Crítica
           tasa exigida (cap      hardcodeado sobre fórmula             
           rate)                                                        

  NRB-02   Cap rate por cliente   Caspana 4,5% vs Agencia   P1          Alta
           específico (no         Hab. 6,0% (ambos leasing)             
           booleano)                                                    

  NRB-03   Factor garantía (0,8)  Coronel/Caspana: garantía P1          Alta
           ≠ factor seguro        ≠ seguro ≠ reposición                 
           (0,825)                                                      

  NRB-04   Exclusión de           Las Rejas: terraza aporta P1          Alta
           terraza/ítems del      a comercial, no a                     
           valor de garantía      garantía                              

  NRB-05   Vida útil remanente    Coronel: año 2018 → vida  P2          Media
           con tope/desviación    útil 40 (no 65 del tramo)             
           por estado                                                   

  NRB-06   Renta perpetua y       Portada: (arriendo×12 −   P2          Alta
           análisis de            gasto) / tasa                         
           rentabilidad                                                 

  NRB-07   Normalización de       Exequiel: avalúo 'NO      P1          Alta
           valores no-numéricos   REGISTRA', RUT                        
                                  propietario 0                         

  NRB-08   Tipo de cambio USD por Informes muestran US\$    P2          Media
           fecha                  (≈922 / 894 / 910 según               
                                  fecha)                                

  NRB-09   Orden de ejecución de  Portada: \~15 cálculos    P1          Crítica
           la cadena (DAG)        secuenciales                          
                                  interdependientes                     

  NRB-10   Texto descriptivo:     VBA BuildText() +         P1          Crítica
           programa y síntesis    ExportarBICE                          
                                  ConstruirTextoPrograma                

  NRB-11   Precio unitario por    Caspana albañilería vs    P1          Alta
           material estructural   resto hormigón → UF/m²                
                                  distinto                              

  NRB-12   Estac./bodega como     Exequiel estac. 1×400 UF; P2          Media
           ítem con precio fijo   La Marina bodega 1×100 UF             
           por unidad                                                   
  ---------------------------------------------------------------------------------

## 18.2 Motor de ejecución de fórmulas: el DAG de C_Formulas

**Hallazgo #1 (Crítico).** El motor real no aplica 'una fórmula':
ejecuta una CADENA de \~15 cálculos donde el resultado de cada uno es
input del siguiente. C_Formulas es hoy un catálogo declarativo PLANO: no
expresa el orden ni las dependencias. Sin un grafo, el orquestador
(Make) tendría que inferir el orden de ejecución ---reintroduciendo
lógica, lo que viola el Principio No-1. La solución es modelar el orden
como DATO.

**Campos nuevos en C_Formulas (NRB-09)**

  --------------------------------------------------------------------------------
  **Campo**          **Tipo        **Clave**   **Detalle / lógica de negocio**
                     Airtable**                
  ------------------ ------------- ----------- -----------------------------------
  depende_de         Link →        FK multi    Fórmulas cuyo output es input de
                     C_Formulas                ésta. Define las aristas del DAG.

  orden_topologico   Number        ƒ / IDX     Posición en la secuencia, derivada
                     (integer)                 del sort topológico del DAG. El
                                               Motor de Ejecución corre las
                                               fórmulas en este orden ascendente.

  es_terminal        Checkbox      ---         TRUE si ninguna otra fórmula
                                               depende de ésta (hoja del grafo:
                                               valor final).

  grupo_calculo      Single select IDX         Valoración · Depreciación ·
                                               Garantía · Seguro · Remate ·
                                               Liquidación · Rentabilidad. Agrupa
                                               la cadena para trazas legibles.
  --------------------------------------------------------------------------------

**El orden de ejecución de la cadena (sort topológico verificado)**

+----------------------------------------------------------------------+
| PASO FÓRMULA (variable_output) DEPENDE DE                            |
|                                                                      |
| ──── ───────────────────────────────── ─────────────────────────     |
|                                                                      |
| 1 uf_m2_promedio (homologado) (5 comparables + factores)             |
|                                                                      |
| 2 valor_edificacion_uf uf_m2_nuevo · factor_df · coef_tipo · sup     |
|                                                                      |
| 3 factor_df (depreciación D.F.) anio · vida_util · estado_conserv.   |
|                                                                      |
| 4 valor_garantia_uf valor_edificacion · factor_garantia              |
|                                                                      |
| 5 valor_seguro_uf valor_edificacion · factor_seguro                  |
|                                                                      |
| 6 valor_reposicion_uf valor_edificacion · OO.CC. · hay_terreno       |
|                                                                      |
| 7 valor_remate_uf reposicion · factor_remate(velocidad)              |
|                                                                      |
| 8 valor_liquidacion_uf reposicion · factor_liquidacion(velocidad)    |
|                                                                      |
| 9 ingreso_liquido_uf arriendo · gasto_anual                          |
|                                                                      |
| 10 renta_perpetua_uf ◄ terminal ingreso_liquido · tasa_cap_rate      |
|                                                                      |
| 11 valor_clp / valor_usd ◄ terminal valor_uf · uf_dia ·              |
| tipo_cambio_usd                                                      |
+----------------------------------------------------------------------+
| **▌ El Motor de Ejecución de Fórmulas como componente explícito**    |
|                                                                      |
| Se reconoce un componente lógico nuevo entre el Motor de Reglas y la |
| capa de Datos: el **Motor de Ejecución de Fórmulas**. No contiene    |
| lógica de negocio (vive en C_Formulas como dato), pero SÍ resuelve   |
| el orden: lee el DAG, hace sort topológico, detecta ciclos y         |
| ejecuta. La SECUENCIA es dato, no código ---así se respeta el        |
| Principio No-1 sin negar que el encadenamiento existe. Cada paso     |
| escribe su resultado en TX_Calculos con su snapshot de expresión, de |
| modo que la cadena completa es reproducible y auditable.             |
|                                                                      |
| **Implementación v2.4:** El Motor de Ejecución de Fórmulas es        |
| Airtable Script AT03, registrado en C_AutomationsAirtable. Se        |
| dispara por Automation cuando TX_Solicitudes.estado cambia a         |
| 'visitada'. El script lee el DAG de C_Formulas, ejecuta el sort      |
| topológico en JavaScript nativo de Airtable Scripting, y escribe     |
| TX_Calculos fila por fila con snapshot de versión y expresión. No    |
| interviene Make en ningún paso del cálculo. AT03 completa su         |
| ejecución y actualiza el estado a 'calculada'; una segunda           |
| Automation entonces dispara SC09 en Make para el transporte hacia    |
| Carbone.                                                             |
+----------------------------------------------------------------------+

## 18.3 Capa de saneamiento de datos (data cleansing)

**Hallazgo #5 (Alto).** Los datos reales no siempre son numéricos
limpios. El avalúo fiscal puede llegar como texto 'NO REGISTRA' (caso
Exequiel); el RUT del propietario puede ser 0 (rompe el módulo 11 de
RB-13); hay campos N/D. Si estos valores entran directo a campos
Currency o a validaciones, el flujo se corta. Se introduce una capa de
saneamiento que corre ANTES del cálculo y normaliza la entrada cruda.

  ---------------------------------------------------------------------------------
  **Entrada cruda**   **Patrón        **Acción de              **Flag generado**
                      detectado**     saneamiento**            
  ------------------- --------------- ------------------------ --------------------
  avaluo_total = 'NO  Texto en campo  Normalizar a null; el    avaluo_no_registra =
  REGISTRA'           Currency        cálculo lo trata como    TRUE
                                      ausente                  

  cliente_final_rut = RUT inválido    No bloquear; permitir    rut_no_disponible =
  0                   módulo 11       propietario sin RUT      TRUE

  rol_sii / permiso = Marcador de no  Normalizar a null        dato_no_disponible =
  'N/D'               disponible                               TRUE

  número con          String numérico Parseo localizado es-CL  ---
  separador de miles  con             a Number                 
  textual             puntos/comas                             
  ---------------------------------------------------------------------------------

**Campos de saneamiento añadidos a TX_DatosTasacion (NRB-07)**

  ----------------------------------------------------------------------------------
  **Campo**            **Tipo        **Clave**   **Detalle / lógica de negocio**
                       Airtable**                
  -------------------- ------------- ----------- -----------------------------------
  avaluo_no_registra   Checkbox      ---         TRUE si el SII no registra avalúo.
                                                 El informe imprime 'NO REGISTRA';
                                                 el cálculo omite el avalúo sin
                                                 abortar.

  rut_no_disponible    Checkbox      ---         TRUE si el propietario no tiene RUT
                                                 válido (incluye 0). Desactiva la
                                                 validación módulo 11 para ese campo
                                                 (RB-13).

  avaluo_total_raw     Single line   ---         Valor crudo tal como llegó
                       text                      (auditoría del saneamiento). Nunca
                                                 se usa en cálculo.

  saneamiento_notas    Long text     ---         Bitácora de qué campos fueron
                                                 normalizados y por qué. Visible en
                                                 F4.
  ----------------------------------------------------------------------------------

## 18.4 Override auditable y cap rate por cliente

**Hallazgos #2 y #6 (Crítico/Alto).** El caso Las Rejas es imposible de
reproducir hoy: el tasador HARDCODEÓ la tasa exigida a 5,5% en la celda
BJ41, sobrescribiendo la fórmula que solo produce 4,5%/6,0%. El modelo
declarativo prohíbe editar fórmulas, pero la realidad operacional
incluye overrides por solicitud. Además, el cap rate NO es booleano:
Caspana (leasing) usa 4,5% y Agencia Habitacional usa 6,0%. La tasa
depende del cliente exacto.

**Reemplazo del booleano es_leasing en M_Clientes (NRB-02, NRB-03)**

+-------------------------------------+------------------+------------------+------------------------------------+
| **Campo**                           | **Tipo           | **Clave**        | **Detalle / lógica de negocio**    |
|                                     | Airtable**       |                  |                                    |
+=====================================+==================+==================+====================================+
| tasa_cap_rate                       | Number (decimal) | ---              | Cap rate del cliente para renta    |
|                                     |                  |                  | perpetua (ej. 0,045 / 0,060).      |
|                                     |                  |                  | Migra la lista exacta de BJ41.     |
|                                     |                  |                  | Reemplaza la derivación booleana   |
|                                     |                  |                  | de RB-36.                          |
+-------------------------------------+------------------+------------------+------------------------------------+
| factor_garantia                     | Number (decimal) | ---              | Factor sobre el comercial para el  |
|                                     |                  |                  | valor de garantía (0,8 si fuera de |
|                                     |                  |                  | lista; 1,0 si en lista). Antes     |
|                                     |                  |                  | confundido con el de seguro.       |
+-------------------------------------+------------------+------------------+------------------------------------+
| factor_seguro                       | Number (decimal) | ---              | Factor sobre el comercial para el  |
|                                     |                  |                  | valor de seguro de incendio (0,825 |
|                                     |                  |                  | observado). DISTINTO de            |
|                                     |                  |                  | factor_garantia. Reemplaza         |
|                                     |                  |                  | factor_seguro_incendio nivel 2.    |
+-------------------------------------+------------------+------------------+------------------------------------+
| redondeo_decimales                  | Number (integer) | ---              | Decimales de redondeo del valor    |
|                                     |                  |                  | final. Default 2. Cliente 13 → 0   |
|                                     |                  |                  | (FIXED). Parametriza RB de         |
|                                     |                  |                  | redondeo por cliente.              |
+-------------------------------------+------------------+------------------+------------------------------------+
| **▌ es_leasing se conserva, pero ya no deriva la tasa**                                                        |
|                                                                                                                |
| El campo **es_leasing** sobrevive únicamente como alerta informativa (RB-16). La derivación del cap rate pasa  |
| a tasa_cap_rate. Esto desacopla 'ser operadora de leasing' de 'qué tasa aplica' ---dos hechos que el booleano  |
| fusionaba incorrectamente.                                                                                     |
+----------------------------------------------------------------------------------------------------------------+

**Campos de override en TX_Solicitudes (NRB-01)**

+-------------------------------------+------------------+------------------+-----------------------------------+
| **Campo**                           | **Tipo           | **Clave**        | **Detalle / lógica de negocio**   |
|                                     | Airtable**       |                  |                                   |
+=====================================+==================+==================+===================================+
| tasa_cap_rate_override              | Number (decimal) | ---              | Si presente, GANA sobre           |
|                                     |                  |                  | M_Clientes.tasa_cap_rate.         |
|                                     |                  |                  | Reproduce el 5,5% de Las Rejas.   |
|                                     |                  |                  | Vacío = usar la del cliente.      |
+-------------------------------------+------------------+------------------+-----------------------------------+
| vida_util_override                  | Number (integer) | ---              | Si presente, sobrescribe la vida  |
|                                     |                  |                  | útil derivada del tramo de año    |
|                                     |                  |                  | (NRB-05). Reproduce Coronel       |
|                                     |                  |                  | 2018→40.                          |
+-------------------------------------+------------------+------------------+-----------------------------------+
| valor_final_override                | Number (decimal) | ---              | Override directo del valor final  |
|                                     |                  |                  | cuando el tasador ajusta por      |
|                                     |                  |                  | juicio profesional. Excepcional.  |
+-------------------------------------+------------------+------------------+-----------------------------------+
| override_motivo                     | Long text        | ---              | OBLIGATORIO si cualquier          |
|                                     |                  |                  | \*\_override está presente.       |
|                                     |                  |                  | Justificación auditable.          |
+-------------------------------------+------------------+------------------+-----------------------------------+
| override_autor                      | Single line text | ---              | Quién aplicó el override. Se      |
|                                     |                  |                  | replica como evento en A_Cambios. |
+-------------------------------------+------------------+------------------+-----------------------------------+
| **▌ El override no rompe el versionado de fórmulas**                                                          |
|                                                                                                               |
| La fórmula en C_Formulas permanece intacta y versionada. El override vive en la SOLICITUD, no en la fórmula:  |
| el Motor de Ejecución, al leer un campo \*\_override no vacío, usa ese valor en lugar del derivado y registra |
| el hecho en A_Cambios con motivo y autor. Así se reproducen los casos reales sin contaminar la fuente de      |
| verdad declarativa.                                                                                           |
+---------------------------------------------------------------------------------------------------------------+

## 18.5 Cuadro de valoración: factores, materiales y exclusiones

**Hallazgos #7, NRB-04, NRB-11, NRB-12.** Tres precisiones sobre
TX_ItemsCuadroValoracion (ya creada en v2.1) y C_PreciosUnitarios,
validadas contra los casos reales.

- **Factores separados por destino.** El factor de garantía (0,8) y el
  de seguro (0,825) son DISTINTOS y se aplican a cálculos distintos.
  Coronel muestra garantía 1.150 pero seguro 1.394 sobre el mismo
  comercial. Las fórmulas valor_garantia_uf y valor_seguro_uf usan
  factores separados de M_Clientes (§18.4).

- **Exclusión de ítems del valor de garantía (NRB-04).** La terraza
  aporta al comercial pero NO a la garantía (Las Rejas). El flag
  aporta_a_garantia por ítem ya existe; se confirma que para Terraza
  debe quedar en FALSE. La fórmula de garantía hace SUMIF solo de ítems
  con aporta_a_garantia=TRUE.

- **Precio unitario por material (NRB-11).** Caspana usa albañilería (no
  hormigón): su UF/m² nuevo (32) sale de otra fila de
  C_PreciosUnitarios. Se confirma que la tabla debe indexarse por
  material × calidad.

- **Estacionamiento/bodega con precio fijo por unidad (NRB-12).**
  Exequiel: estacionamiento cubierto 1×400 UF; La Marina: bodega 1×100
  UF. Estos subtipos se valoran por UNIDAD, no por m², y no se deprecian
  igual.

**Campos a confirmar/añadir en TX_ItemsCuadroValoracion**

  -------------------------------------------------------------------------------------
  **Campo**           **Tipo       **Clave**   **Detalle / lógica de negocio**
                      Airtable**               
  ------------------- ------------ ----------- ----------------------------------------
  material            Single       ---         \[NRB-11\] Hormigón · Albañilería ·
                      select                   Acero · Madera · Mixto. Selecciona la
                                               fila de C_PreciosUnitarios para el UF/m²
                                               nuevo del ítem.

  valoracion_por      Single       ---         \[NRB-12\] m2 · unidad. Si 'unidad'
                      select                   (estac., bodega), valor_uf = cantidad ×
                                               uf_unitario sin depreciar por m².

  uf_unitario         Number       ---         \[NRB-12\] Precio por unidad para
                      (decimal)                estac./bodega (ej. 400 / 100). Aplica
                                               solo si valoracion_por = unidad.

  aporta_a_garantia   Single       ---         \[NRB-04\] Confirmado: Terraza → FALSE.
                      select                   Solo ítems TRUE entran al SUMIF de
                                               garantía.
  -------------------------------------------------------------------------------------

**Cambios en C_PreciosUnitarios (NRB-11)**

  -----------------------------------------------------------------------------
  **Campo**     **Tipo       **Clave**   **Detalle**
                Airtable**               
  ------------- ------------ ----------- --------------------------------------
  material      Single       IDX         Dimensión de indexación. Hormigón /
                select                   Albañilería / Acero / Madera / Mixto.

  calidad       Number (1-5) IDX         Estrella de calidad constructiva.
                                         Clave compuesta con material y tipo.

  uf_m2_nuevo   Number       ---         Valor a validar contra los 5 casos: 40
                (decimal)                · 78 · 34 · 32 · 38.
  -----------------------------------------------------------------------------

## 18.6 Rentabilidad, renta perpetua y conversión USD

**Hallazgo #8, NRB-06, NRB-08.** Los informes con análisis de
rentabilidad (La Marina: arriendo \$710.000, renta perpetua \$173,5M)
requieren fórmulas que hoy no están en C_Formulas. Y los informes
muestran valores en US\$ que el XLSM obtiene dividiendo por el tipo de
cambio del día.

**Campos de rentabilidad en TX_DatosTasacion (NRB-06)**

  -------------------------------------------------------------------------------------
  **Campo**              **Tipo       **Clave**   **Detalle / lógica de negocio**
                         Airtable**               
  ---------------------- ------------ ----------- -------------------------------------
  arriendo_bruto_clp     Currency CLP ---         Arriendo mensual estimado. Input de
                                                  la renta perpetua.

  gasto_anual_clp        Currency CLP ---         Gastos anuales (contribuciones,
                                                  mantención). Se restan al ingreso.

  tasa_exigida           Number       ---         Tasa para capitalizar (default =
                         (decimal)                M_Clientes.tasa_cap_rate;
                                                  overrideable, §18.4).

  incluye_rentabilidad   Checkbox     ---         TRUE si el informe lleva análisis de
                                                  rentabilidad. Activa la sección
                                                  condicional en F3 y las fórmulas
                                                  NRB-06.
  -------------------------------------------------------------------------------------

**Fórmulas de rentabilidad y USD a cargar en C_Formulas**

  ------------------------------------------------------------------------------------
  **nombre**         **expresion declarativa**      **variable_output**   **unidad**
  ------------------ ------------------------------ --------------------- ------------
  F_IngresoLiquido   arriendo_bruto_clp \* 12 -     ingreso_liquido       CLP
                     gasto_anual_clp                                      

  F_RentaPerpetua    ingreso_liquido / tasa_exigida renta_perpetua        CLP

  F_ValorUSD         valor_clp / tipo_cambio_usd    valor_usd             USD
  ------------------------------------------------------------------------------------

**Campo de tipo de cambio en H_PreciosUF (NRB-08)**

  ---------------------------------------------------------------------------------
  **Campo**         **Tipo       **Clave**   **Detalle**
                    Airtable**               
  ----------------- ------------ ----------- --------------------------------------
  tipo_cambio_usd   Number       ---         CLP por 1 US\$ del día (≈922,17 /
                    (decimal)                894,25 / 909,94 observados). Junto a
                                             la UF diaria, permite reproducir el
                                             US\$ del informe.

  fecha             Date         IDX         Fecha del par UF/USD. La conversión
                                             usa el valor de la fecha de tasación.
  ---------------------------------------------------------------------------------

## 18.7 Vida útil remanente con desviación de tramo

**Hallazgo #9, NRB-05.** Coronel Souper es de 2018 (tramo que daría vida
útil 65) pero el informe usa 40. Esto revela una regla de tope/remanente
por estado del edificio NO catalogada, o un override del tasador. Se
modela como campo derivado overrideable.

+--------------------------+--------------------------+------------------------------+
| **Campo**                | **Tipo / ubicación**     | **Detalle / lógica de        |
|                          |                          | negocio**                    |
+==========================+==========================+==============================+
| vida_util_default        | ƒ en C_VidaUtil          | Derivada del año de          |
|                          | (existente)              | construcción por tramos.     |
|                          |                          | Sigue siendo el valor base.  |
+--------------------------+--------------------------+------------------------------+
| vida_util_override       | Number en TX_Solicitudes | Si presente, gana sobre el   |
|                          | (§18.4)                  | default. Reproduce Coronel   |
|                          |                          | 2018→40. Requiere            |
|                          |                          | override_motivo.             |
+--------------------------+--------------------------+------------------------------+
| vida_util_aplicada       | ƒ                        | IF(vida_util_override no     |
|                          |                          | vacío, override, default).   |
|                          |                          | Es la que entra a la         |
|                          |                          | depreciación D.F.            |
+--------------------------+--------------------------+------------------------------+
| **▌ Acción de negocio pendiente**                                                  |
|                                                                                    |
| Confirmar con el tasador si la divergencia 2018→40 obedece a una regla de          |
| remanente por estado (catalogarla como RB) o a un override puntual. Hasta          |
| confirmarlo, el campo override cubre ambos casos sin bloquear la reproducción.     |
+------------------------------------------------------------------------------------+

## 18.8 Homogeneización de comparables

El UF/m² homologado es el promedio de hasta 5 referencias de mercado
ajustadas por factores. C_FactoresHomogeneizacion existe parcialmente
(◐). Los factores por referencia se capturan en TX_Comparables.

Estado al 23-jul-2026 (verificado contra el schema real de Airtable):
`factor_sup`, `factor_edad` y `factor_distancia` **ya existen** como
Number (4 decimales); la tabla también incorpora `factor_homogeneizacion`
(factor único) y la fórmula `valor_ajustado_uf` = `{valor_uf}` ×
`{factor_homogeneizacion}`. La fórmula `uf_m2_homologado`
(uf_m2_construccion × factor_sup × factor_edad × factor_distancia, que
alimenta el promedio RB-24) **sigue pendiente de crear**.

La definición completa y única de estos campos vive en la ficha de
TX_Comparables (§10). No se duplica aquí.

## 18.9 Contrato de generación de texto descriptivo

**Hallazgo #3 (Crítico).** La síntesis descriptiva y el programa
arquitectónico ---hoy producidos por InputBox de VBA y 41KB de
ExportarBICE.bas--- se delegan a Claude/Carbone, pero el texto es
legalmente parte del informe. Sin contrato, Claude podría alucinar
superficies, orientación o número de dormitorios. Se define un contrato
estricto.

  -----------------------------------------------------------------------
  **Elemento del        **Especificación**
  contrato**            
  --------------------- -------------------------------------------------
  Fuente de datos       El prompt SOLO puede usar campos ya presentes en
                        TX_DatosTasacion y TX_ItemsCuadroValoracion.
                        Prohibido inventar cifras.

  Schema de salida      JSON con claves fijas: {sintesis, programa,
                        descripcion_sector}. Cada valor es texto plano
                        sin números no provistos.

  Validación numérica   Toda cifra del texto (m², dorm., baños, pisos) se
                        contrasta contra el campo de origen. Discrepancia
                        → rechazo y reintento.

  Campos estructurados  ascensores, espacios_comunes,
  de insumo             elementos_interiores, orientacion: campos
                        estructurados en F3 (reemplazan los InputBox de
                        VBA).

  Gate humano           El visador (F4) DEBE aprobar el texto antes de
                        que el PDF se considere final. No hay entrega sin
                        revisión.

  Versionado del prompt El prompt vive versionado; cada texto generado
                        guarda prompt_version para reproducibilidad.
  -----------------------------------------------------------------------

**Campos estructurados de insumo en TX_DatosTasacion (NRB-10)**

  ------------------------------------------------------------------------------
  **Campo**              **Tipo       **Detalle**
                         Airtable**   
  ---------------------- ------------ ------------------------------------------
  num_ascensores         Number       Reemplaza InputBox VBA. Insumo
                                      estructurado para la síntesis.

  espacios_comunes       Multi select Catálogo cerrado (sala multiuso, quincho,
                                      gimnasio...). Evita texto libre
                                      alucinable.

  elementos_interiores   Multi select Terminaciones interiores catalogadas.

  orientacion            Single       N · NE · E · SE · S · SO · O · NO.
                         select       Estructurado, no libre.

  prompt_version         Single line  Versión del prompt Claude usado para
                         text         generar el texto de esta solicitud.
  ------------------------------------------------------------------------------

## 18.10 Suite de regresión: los 5 casos como golden master

**Hallazgo #4 (Alto).** Sin un criterio objetivo de éxito, la migración
es ciega. Los 5 casos reales se cargan como solicitudes de prueba y sus
valores verificados se comparan contra el output del sistema con
tolerancia CERO. Es el gate de calidad antes del go-live.

+-----------------------------------------------------------------------+
| **▌ Limitación de cobertura a cubrir con nuevos casos**               |
|                                                                       |
| Los 5 casos son TODOS departamentos, TODOS con velocidad de venta '8  |
| a 10 meses'. Ninguno ejercita: Casa, Terreno o Local; otro tramo de   |
| velocidad; bien no regularizable; cliente 13 (redondeo FIXED); ni     |
| leasing con bien común por tramos. La suite golden master debe        |
| AMPLIARSE con casos sintéticos que recorran esos caminos antes del    |
| rollout total.                                                        |
+-----------------------------------------------------------------------+

**Entidad de prueba: TX_CasosRegresion (nueva, dominio Z\_/QA)**

  -------------------------------------------------------------------------------
  **Campo**                **Tipo           **Detalle / lógica de negocio**
                           Airtable**       
  ------------------------ ---------------- -------------------------------------
  caso_id                  Autonumber (PK)  Identificador del caso golden master.

  nombre                   Single line text Ej: 'La Marina 1176 Dp 102'.

  solicitud_prueba         Link →           Solicitud cargada con los inputs del
                           TX_Solicitudes   caso real.

  valores_esperados_json   Long text (JSON) Garantía, seguro, reposición, remate,
                                            valor tasación esperados (del PDF
                                            real).

  resultado_match          Formula ƒ        Verde si TX_Calculos coincide al
                                            céntimo; Rojo si difiere. Bloquea
                                            go-live si Rojo.

  tolerancia               Number           0 por defecto. Reproducción idéntica
                                            exigida.
  -------------------------------------------------------------------------------

## 18.11 Tabla consolidada de cambios al modelo de datos

Resumen accionable de todos los deltas de esquema de esta adenda,
ordenados por prioridad. Es la lista de trabajo del Administrador de la
base.

  -------------------------------------------------------------------------------------------------
  **Tabla**                  **Cambio**         **Detalle**                             **Prio.**
  -------------------------- ------------------ --------------------------------------- -----------
  C_Formulas                 Campos nuevos      depende_de, orden_topologico,           P1
                                                es_terminal, grupo_calculo (DAG)        

  C_Formulas                 Fórmulas nuevas    ingreso_liquido, renta_perpetua,        P2
                                                valor_usd, liquidación                  

  TX_Solicitudes             Campos override    tasa/vida_util/valor_final_override +   P1
                                                motivo + autor                          

  M_Clientes                 Reemplazo modelo   tasa_cap_rate + factor_garantia +       P1
                                                factor_seguro + redondeo_decimales      

  TX_DatosTasacion           Saneamiento        avaluo_no_registra, rut_no_disponible,  P1
                                                \*\_raw, saneamiento_notas              

  TX_DatosTasacion           Rentabilidad       arriendo_bruto_clp, gasto_anual_clp,    P2
                                                tasa_exigida, incluye_rentabilidad      

  TX_DatosTasacion           Texto estructurado num_ascensores, espacios_comunes,       P1
                                                elementos_interiores, orientacion,      
                                                prompt_version                          

  TX_ItemsCuadroValoracion   Confirmar/añadir   material, valoracion_por, uf_unitario;  P1
                                                aporta_a_garantia (terraza FALSE)       

  C_PreciosUnitarios         Índice material    material × calidad 1-5; validar UF/m²   P1
                                                (40/78/34/32/38)                        

  H_PreciosUF                Campo USD          tipo_cambio_usd por fecha               P2

  TX_Comparables             Factores homolog.  uf_m2_homologado (los tres              P2
                                                factor_* ya creados)                    

  TX_CasosRegresion          Tabla nueva        Golden master: 5 casos reales +         P1
                                                esperados + match                       
  -------------------------------------------------------------------------------------------------

## 18.12 Matriz de riesgos del modelo de datos (v2.2)

  -----------------------------------------------------------------------------------
  **Riesgo**                 **Prob.**   **Impacto**   **Mitigación en el modelo**
  -------------------------- ----------- ------------- ------------------------------
  Cálculos no reproducen el  Media       Crítico       Suite golden master
  XLSM al céntimo                                      (TX_CasosRegresion);
                                                       tolerancia 0; bloquear
                                                       go-live.

  Overrides manuales rompen  Alta        Alto          Campos \*\_override en
  casos reales                                         TX_Solicitudes + registro en
                                                       A_Cambios. Fase 1.

  Orden de ejecución mal     Media       Alto          DAG explícito (depende_de +
  resuelto                                             orden) + test de ciclos en el
                                                       Motor de Ejecución.

  Datos no-numéricos cortan  Alta        Medio         Capa de saneamiento + flags
  el flujo                                             'no disponible'; tests con
                                                       caso Exequiel.

  Claude alucina datos en    Media       Crítico       Contrato §18.9: campos
  texto legal                                          estructurados + validación
                                                       numérica + gate F4.

  Migración de               Media       Alto          Validar UF/m² de los 5 casos
  C_PreciosUnitarios                                   antes de cargar el resto de la
  incompleta                                           matriz.

  Límites de Airtable a      Baja        Medio         Monitoreo de cuotas; plan de
  escala                                               migración a Postgres
                                                       documentado (capa
                                                       reemplazable).
  -----------------------------------------------------------------------------------

## 18.13 Anexo: los 5 casos reales validados

Valores verificados extraídos del motor XLSM (data_only). Son la fuente
de verdad operacional de la suite golden master.

  ----------------------------------------------------------------------------------------------------
  **Caso**       **Institución**   **Tasa       **Tasación   **Garantía   **Seguro   **Hallazgo
                                   renta**      UF**         UF**         UF**       clave**
  -------------- ----------------- ------------ ------------ ------------ ---------- -----------------
  La Marina 1176 MetLife           4,5%         3.323,2      2.658,6      2.741,6    Bodega 1×100;
  Dp 102                                                                             renta perpetua

  Exequiel       H. Evoluciona     4,5%         3.858,9      3.087,1      3.183,6    Terraza 50%;
  Fernández 6150                                                                     avalúo NO
                                                                                     REGISTRA; RUT 0

  Coronel Souper Agencia Hab.      6,0%         1.394,0      1.150,1      1.394,0    Vida útil 40 (no
  4060                                                                               65);
                                                                                     garantía≠seguro

  Caspana 310 Dp Austral Leasing   4,5%         1.024,0      844,8        1.024,0    Albañilería;
  14                                                                                 leasing pero 4,5%

  Las Rejas      H. Security       5,5%         1.072,2      857,7        884,5      OVERRIDE tasa
  Norte 65                         (override)                                        hardcodeado en
                                                                                     BJ41
  ----------------------------------------------------------------------------------------------------

**--- Fin de la adenda v2.2 ---**

---

## 19. Extensión de schema para la maqueta IF-02 v1.9 (22-jul-2026)

> Fuente: maqueta v0.dev integrada a `main` (`components/console/`, `lib/console-data.ts`) + Especificación v1.9.1 §1. Ninguno de los campos/tablas de esta sección existe hoy en la base real — es diseño pendiente de creación, no una auditoría MCP. Ver `docs/schema-airtable.md` §20 para la tabla de FIELD_IDs una vez creados.

### 19.1 `TX_Solicitudes` — 7 campos nuevos

`ejec_formalizador` (text, separa el rol de Ejec. Formalizador del comercializador) · `tipo_propiedad` nuevo/usado (singleSelect `nuevo/usado` — ⚠ colisiona en nombre con el `tipo_propiedad` Link→M_TiposPropiedad ya existente; resolver el nombre real antes de crear) · `modo_creacion` (singleSelect `documentos/manual`, Fase 1 del wizard) · `tipo_cliente_origen` (singleSelect `correo_texto/correo_ficha/extranet`) · `estado_conservacion` (singleSelect `nuevo/sin_uso/bueno/normal/malo/deficiente`, nivel solicitud — se hereda a recintos, RN-49) · `origen_direccion` (text) · `fecha_asignacion` (dateTime, poblado por REGLA A al asignar tasador) · `email_thread_id` (text).

### 19.2 `TX_Unidades` — 8 campos nuevos

`modelo` (text, sólo nuevo) · `sup_terraza_m2` (number) · `sup_terreno_m2` (number) · `ampliacion_m2` (number, sólo usado) · `ampliacion_regularizable` (checkbox) · `origen_superficie` (singleSelect `carta_inmobiliaria/plano/base_sii/certificado_avaluo/medicion_tasador` — RN-45, catálogo cerrado, obligatorio) · `adjunto_respaldo_id` (Link → TX_Adjuntos, respaldo obligatorio por m² editado) · `estado_unidad` (singleSelect `nueva/usada`) · `tipo_bien_id` (Link → M_TiposDeBien, nueva tabla §19.5).

### 19.3 `TX_ContactosVisita` (tabla nueva)

Modela el bloque repetible "Contactos de visita" de la Sección A del formulario v1.9. Campos: `solicitud_id` (Link → TX_Solicitudes) · `nombre` (text) · `telefono` (text) · `email` (email) · `rol` (singleSelect `propietario/corredor/arrendatario/conserje/otro`) · `orden_prioridad` (number — el primero es el contacto principal) · `estado_contacto` (singleSelect `valido/no_contesta/telefono_erroneo`).

### 19.4 `TX_Vendedor` (tabla nueva)

Datos del vendedor de la operación (persona natural o inmobiliaria), separados de `TX_Solicitudes` porque una solicitud puede necesitar 0 o 1 vendedor según `tipoPropiedadNuevoUsado`. Campos: `solicitud_id` (Link → TX_Solicitudes) · `razon_social` (text, si `tipo_persona=juridica`) · `nombre_completo` (text, si `natural`) · `rut` (text) · `contacto` (text) · `tipo_persona` (singleSelect `juridica/natural`) · `origen_dato` (text).

### 19.5 `M_TiposDeBien` (tabla nueva)

Catálogo maestro de tipo de bien tasable por unidad. Campo `nombre` (text) con 8 valores cerrados: `Edificación, Terreno, Estacionamiento_cubierto, Estacionamiento_descubierto, Estacionamiento_uso_goce, Bodega, Piscina, Obras_complementarias`. Campo `activo` (checkbox).

### 19.6 `TX_DatosTasacion` — bloque SII completo (11 campos)

`cod_sii_comuna`, `cod_sii_manzana`, `cod_sii_predio` (text) · `ubicacion_urbano_rural` (singleSelect) · `avaluo_fiscal_total_uf`, `contribucion_anual`, `avaluo_exento` (number) · `cg`, `ociv`, `oc`, `g` (text, códigos SII de destino/uso).

### 19.7 AT02 fuera de alcance de IF-02

Consistente con `docs/diseno.md` REGLA A: AT02 (asignación algorítmica) no se invoca desde IF-02 en v1.9. La asignación de tasador es manual, única, vía botón "Asignar Tasador" en la UI — no hay flujo de reasignación formal ni override automático que registrar en `A_Cambios` por ese motivo.
