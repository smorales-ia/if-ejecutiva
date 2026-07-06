**VPROPERTY**

*Tasaciones · Bienes Raíces*

**Blueprint de Interfaces**

Especificación funcional de la capa de presentación

**Versión 2.7 --- Junio 2026**

  -----------------------------------------------------------------------
  **Campo**        **Valor**
  ---------------- ------------------------------------------------------
  Cliente          VProperty · Tasaciones de Bienes Raíces (Chile)

  Documento        Blueprint de Interfaces --- capa de presentación

  Versión          2.6 (sucede a v2.5; reestructura por prompt del
                   Arquitecto de Experiencia Operacional)

  Alineado a       Especificación v1.0 · Arquitectura Enterprise v2.5 ·
                   Diseño de Capa de Datos v2.5 · Motor de Cálculo
                   AT01--AT10 v2.5

  Stack            Next.js 14 (App Router · Railway) · Clerk · Tailwind ·
                   shadcn/ui · Airtable · Make · Claude API · Carbone.io
                   · Dropbox · Mindicador

  Paleta           Azul VProperty #075899 · Naranja VProperty #F5A213
  corporativa      (extraída del logo oficial)

  Preparado por    qualitycl · panel multidisciplinario de especialistas

  Fecha            Junio 2026

  Clasificación    Confidencial --- Uso interno VProperty
  -----------------------------------------------------------------------

**Nota metodológica y cambios de la v2.6**

Este documento es la capa de presentación de VProperty. No rediseña la
arquitectura ni la base de datos. Toma como fuente oficial e
inmodificable los documentos de Arquitectura Enterprise v2.5, Diseño de
la Capa de Datos v2.5 y Motor de Cálculo AT01--AT10 v2.5, y documenta
exclusivamente cómo la operación toca el sistema: interfaces,
formularios, dashboards, navegación, validaciones y experiencia
operacional. Toda entidad, regla de negocio y automatización referidas
aquí ya existen en esas fuentes.

**Cambios estructurales en v2.6**

- **Estructura obligatoria del prompt:** el documento se reordena para
  cumplir la estructura solicitada por el Arquitecto de Experiencia
  Operacional. Las seis secciones obligatorias (matriz rol vs IF,
  catálogo de interfaces con tipo A/B, navegación, jerarquía visual y
  color, patrones de UI, validaciones y mensajes humanos) ocupan los
  capítulos 1--6. El detalle por interfaz, los blueprints operacionales
  y la matriz formularios-BD se consolidan como complementos en los
  capítulos 7--11.

- **Tipo declarado por interfaz (A / B):** cada IF declara
  explícitamente su tipo de unidad construible, alineado con el
  Blueprint Metodológico Proceso IA v1.2. Tipo A = IF con código
  (Next.js + Clerk en Railway). Tipo B = IF de plataforma (Airtable
  Interfaces). El tipo C (automatización sin UI) no aplica a este
  documento porque cubre AT01--AT10, ya documentadas en el Motor de
  Cálculo.

- **Paleta corporativa VProperty:** la sección 4 incorpora la paleta
  oficial extraída del logo de Value Property (azul #075899, naranja
  #F5A213). El código semáforo operacional (verde · ámbar · rojo · azul
  · púrpura) se mantiene pero se calibra para no colisionar con el
  naranja brand: el ámbar operacional usa #D97706, claramente
  diferenciable del naranja corporativo de marca.

- **Mapeo acción-UI → transición de estado:** cada interfaz expone una
  columna explícita que mapea cada acción de UI (botón, envío, edición)
  a una transición documentada de la máquina de estados de
  TX_Solicitudes. Esto materializa la regla \"la UI muestra y captura;
  nunca decide\".

- **Catálogo unificado de patrones de UI:** se introduce la sección 5
  con los cuatro patrones canónicos (lista, detalle, formulario,
  dashboard) que se reutilizan en todas las interfaces. Cada IF en el
  catálogo declara qué patrón aplica.

- **Diccionario de mensajes humanos:** la sección 6 cataloga las
  plantillas de mensaje obligatorias para validaciones bloqueantes y
  advertencias, en lenguaje no técnico.

+-----------------------------------------------------------------------+
| **Principio rector --- la UI muestra y captura; nunca decide**        |
|                                                                       |
| Toda decisión (qué plantilla usar, qué workflow aplicar, qué fórmulas |
| correr, a quién asignar, si se necesita aprobación final) vive en     |
| Airtable: motor de reglas (AT01), asignación (AT02), DAG de fórmulas  |
| (AT03), chequeo aprobación (AT07). La interfaz solo presenta el       |
| resultado y captura la entrada humana. Si para construir una pantalla |
| parece necesaria una rama \"si cliente entonces...\", está mal: ese   |
| dato debe venir resuelto por el motor o por un campo lookup. La       |
| consecuencia operativa es que cambiar el comportamiento del sistema   |
| implica editar filas en Airtable, nunca tocar la UI.                  |
+-----------------------------------------------------------------------+

**0. Marco general**

VProperty opera sobre seis dominios funcionales (Recepción, Captura,
Cálculo, Revisión, Operación-Monitoreo, Auditoría) y quince interfaces
(IF-01 a IF-15). Cuatro interfaces son de cara externa o de operación
crítica y se construyen con código propio (Tipo A · Next.js 14 + Clerk
en Railway). Nueve son interfaces internas de gestión y configuración y
se construyen sobre Airtable Interfaces (Tipo B · plataforma low-code).

**0.1 Stack de implementación por tipo de IF**

  ----------------------------------------------------------------------------
  **Tipo**           **Tecnología**           **Interfaces**   **Construye**
  ------------------ ------------------------ ---------------- ---------------
  Tipo A --- IF con  Next.js 14 (App Router)  IF-01, IF-02,    Claude Code
  código             · Clerk · Tailwind ·     IF-03, IF-04     sobre v0.dev
                     shadcn/ui · Railway                       (CU-000 shared
                                                               components
                                                               primero, luego
                                                               IF por IF)

  Tipo B --- IF de   Airtable Interfaces      IF-05, IF-06,    Configuración
  plataforma         (Record review ·         IF-07, IF-08,    directa en
                     Dashboard · Grid ·       IF-09, IF-10,    Airtable por el
                     Kanban · Timeline ·      IF-11, IF-12,    equipo
                     Form)                    IF-13            VProperty (sin
                                                               código)
  ----------------------------------------------------------------------------

**0.2 Seis dominios funcionales**

  ------------------------------------------------------------------------
  **Dominio**      **Tablas raíz**                   **Interfaces
                                                     involucradas**
  ---------------- --------------------------------- ---------------------
  Recepción y      M_Clientes · TX_Solicitudes ·     IF-01 (Cliente
  Solicitudes      M_Comunas                         externo) · IF-02
                                                     (Ejecutiva) · IF-12
                                                     (Expediente)

  Captura en       TX_DatosTasacion ·                IF-03 (Tasador móvil)
  Terreno          TX_ItemsCuadroValoracion ·        
                   TX_Ampliaciones ·                 
                   TX_HabitacionesPorNivel ·         
                   TX_TerminacionesPorRecinto ·      
                   TX_DocumentosLegales ·            
                   TX_Adjuntos                       

  Cálculo y        C_Formulas · TX_Calculos ·        IF-10 (Fórmulas/DAG)
  Valoración       TX_Comparables ·                  · IF-12 (Expediente)
                   C_PreciosUnitarios                

  Revisión y       TX_DocumentosGenerados ·          IF-04 (Visador) ·
  Calidad          C_Plantillas · A_DecisionesMotor  IF-05 (Aprobación
                                                     final) · IF-09
                                                     (Plantillas)

  Operación y      A_Eventos · A_ErroresMake ·       IF-06 (Centro
  Monitoreo        Z_EscenariosMake ·                operacional) · IF-07
                   Z_ColaPendientes                  (Salud
                                                     automatizaciones)

  Configuración    C_ReglasNegocio · C_Plantillas ·  IF-08 (Reglas) ·
  (Motor)          C_Formulas · M_Clientes · C_SLA · IF-09 (Plantillas) ·
                   C_VariablesCliente                IF-10 (Fórmulas) ·
                                                     IF-11 (Clientes/SLA)

  Auditoría y      A_Eventos · A_DecisionesMotor ·   IF-12 (Expediente) ·
  Trazabilidad     A_Cambios · A_Accesos ·           IF-13 (Auditoría)
                   A_ErroresMake                     
  ------------------------------------------------------------------------

**0.3 Diez perfiles de usuario**

Diez roles operan el sistema. Cuatro de ellos (solicitante, ejecutiva,
tasador, visador) acceden por la app Next.js autenticada con Clerk;
nunca tocan Airtable directamente. Los seis restantes (operador,
gerencia, administrador, parametrizador, auditor, backoffice de entrega)
operan dentro de Airtable Interfaces con permisos de mínimo privilegio.

  --------------------------------------------------------------------------
  **Usuario**        **Canal**     **Rol operacional**       **Etapa
                                                             principal**
  ------------------ ------------- ------------------------- ---------------
  Solicitante /      App Next.js + Origina el pedido de      Recepción
  Institución        Clerk         tasación con datos        
                                   mínimos.                  

  Ejecutivo          App Next.js + Crea solicitudes, asigna  Recepción →
  comercial          Clerk         tasador, vigila SLA.      Asignación

  Operador /         Airtable      Gestión documental,       Transversal
  backoffice         Interfaces    adjuntos, apoyo a la      
                                   cola.                     

  Tasador            App Next.js   Captura datos de terreno  Captura
                     PWA + Clerk   y cuadro de valoración.   

  Revisor / Visador  App Next.js + Controla calidad, aprueba Revisión
                     Clerk         o devuelve con notas.     

  Supervisor /       Airtable      Aprobación final de casos Aprobación
  Gerencia (Héctor)  Interfaces    sensibles; control        
                                   global.                   

  Administrador del  Airtable      Gestiona clientes,        Configuración
  sistema            Interfaces    plantillas, configuración 
                                   general.                  

  Parametrizador /   Airtable      Crea y prueba reglas del  Configuración
  Analista funcional Interfaces    motor (F8) y fórmulas     
                                   (DAG).                    

  Auditor            Airtable      Consulta expedientes,     Auditoría
                     (solo         eventos, decisiones y     
                     lectura)      accesos.                  

  Backoffice de      Airtable      Verifica entrega al       Entrega →
  entrega            Interfaces    cliente y cierre de       Cierre
                                   solicitud.                
  --------------------------------------------------------------------------

**1. Matriz rol vs interfaz**

Esta matriz fija qué interfaz puede usar cada rol y con qué nivel de
acceso. Los permisos siguen el principio de mínimo privilegio definido
en la Arquitectura Enterprise: cada rol ve y opera solo lo estrictamente
necesario para su etapa. La granularidad fina ---ver solo solicitudes
propias para tasador y visador--- se logra con filtros server-side en
las API Routes de Next.js que validan el JWT de Clerk antes de consultar
Airtable. En Airtable Interfaces, los permisos se aplican por página y
por filtros de vista.

**Convención de acceso**

  ----------------------------------------------------------------------------
  **Símbolo**   **Significado**          **Implicación operacional**
  ------------- ------------------------ -------------------------------------
  ●             Uso completo (lectura +  El rol es el actor principal de la
                escritura)               interfaz; ejecuta acciones que
                                         avanzan la máquina de estados.

  ◐             Lectura / uso parcial    El rol consulta y puede ejecutar
                                         acciones acotadas (p. ej. comentar,
                                         exportar) sin transicionar estados.

  ○             Solo lectura             El rol consulta para auditar,
                                         supervisar o referenciar; no escribe.

  ---           Sin acceso               La interfaz no aparece en la
                                         navegación del rol.
  ----------------------------------------------------------------------------

**1.1 Matriz consolidada**

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Rol**           **IF-01**   **IF-02**   **IF-03**   **IF-04**   **IF-05**   **IF-06**   **IF-07**   **IF-08**   **IF-09**   **IF-10**   **IF-11**   **IF-12**   **IF-13**
  ---------------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- ----------- -----------
  Solicitante           ●          ---         ---         ---         ---         ---         ---         ---         ---         ---         ---         ---         ---

  Ejecutivo            ---          ●          ---         ---         ---          ●           ○          ---         ---         ---         ---          ◐          ---
  comercial                                                                                                                                                        

  Operador /           ---          ◐          ---         ---         ---          ●           ◐          ---         ---         ---         ---          ◐          ---
  backoffice                                                                                                                                                       

  Tasador              ---         ---          ●          ---         ---         ---         ---         ---         ---         ---         ---         ---         ---

  Revisor /            ---          ○          ---          ●          ---          ●          ---         ---         ---         ---         ---          ◐          ---
  Visador                                                                                                                                                          

  Supervisor /         ---          ○          ---          ○           ●           ●           ○           ○           ○           ○           ○           ○           ○
  Gerencia                                                                                                                                                         

  Administrador        ---          ○          ---          ○           ○           ●           ●           ●           ●           ●           ●           ●           ●

  Parametrizador /     ---         ---         ---         ---         ---          ○           ○           ●           ○           ●           ○           ○           ○
  Analista func.                                                                                                                                                   

  Auditor              ---         ---         ---         ---         ---          ○           ○           ○           ○           ○           ○           ○           ●

  Backoffice de        ---          ○          ---         ---         ---          ●           ○          ---         ---         ---         ---          ◐          ---
  entrega                                                                                                                                                          
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**1.2 Acciones y restricciones por rol**

  -------------------------------------------------------------------------
  **Rol**          **Acciones disponibles**     **Restricciones clave**
  ---------------- ---------------------------- ---------------------------
  Solicitante      Enviar solicitud (IF-01).    No accede a Airtable; no ve
                                                estados ni datos internos.
                                                Identificación por URL
                                                única del cliente.

  Ejecutivo        Alta y edición de            Escribe TX_Solicitudes
  comercial        solicitudes (IF-02),         (campos no-cálculo) y
                   asignación de tasador,       C_VariablesCliente. NUNCA
                   vigilancia SLA, lectura del  C_ReglasNegocio ni
                   centro operacional (IF-06).  C_Formulas.

  Operador /       Adjuntos, apoyo a la cola    Escritura acotada; sin
  backoffice       operacional (IF-06),         acceso al motor de
                   verificación de entrega y    configuración.
                   cierre.                      

  Tasador          Completar la visita de sus   Solo la app Next.js +
                   propias solicitudes (IF-03): Clerk; solo su submission
                   fotos, medidas, documentos,  (filtro por tasador_id); no
                   cuadro de valoración.        ve otras solicitudes.

  Revisor /        Aprobar / devolver / escalar Sus solicitudes asignadas;
  Visador          (IF-04); ajuste fino de      no configura motor ni
                   TX_DatosTasacion y           plantillas. Debe abrir el
                   TX_Comparables.              PDF antes de aprobar (RNF
                                                de A_Accesos).

  Supervisor /     Aprobación final (IF-05);    Lectura amplia, escritura
  Gerencia         lectura amplia del centro    acotada a la decisión
                   operacional (IF-06) y de     final. No configura reglas.
                   configuración.               

  Administrador    Todas las tablas; gestión de Cambios sensibles quedan en
                   plantillas, clientes, SLA y  A_Cambios con autor y
                   usuarios.                    razón. Test seco
                                                obligatorio antes de
                                                activar reglas (IF-08).

  Parametrizador   Crear, probar y activar      Test seco obligatorio; no
                   reglas (IF-08) y fórmulas    toca transacciones (TX\_).
                   con DAG (IF-10).             

  Auditor          Consultar expedientes        Solo lectura en todas las
                   (IF-12), eventos, accesos,   tablas. No transiciona
                   decisiones (IF-13). Exportar estados.
                   para retención.              

  Backoffice de    Verificación de entrega      Escritura acotada al hito
  entrega          final y cierre.              de entrega; no toca
                                                cálculos ni decisiones.
  -------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Cómo se implementa el permiso por rol**                             |
|                                                                       |
| Para los tipos A (Next.js + Clerk · IF-01 a IF-04), el permiso se     |
| aplica server-side en cada API Route: el JWT de Clerk se valida, se   |
| resuelve el rol/usuario, y los queries a Airtable se filtran por      |
| tasador_id, ejecutivo_id o visador_id antes de devolver datos al      |
| cliente. Para los tipos B (Airtable Interfaces · IF-05 a IF-13), el   |
| permiso se aplica por página de Interfaces (Editor, Comentador, Solo  |
| lectura) y por vistas filtradas a nivel de tabla. En Team plan (5     |
| colaboradores) y Business (25 con roles granulares), los roles        |
| externos no consumen asiento Airtable: acceden vía la app.            |
+-----------------------------------------------------------------------+

**2. Catálogo de interfaces**

Quince interfaces (IF-01 a IF-15, con IF-14 e IF-15 añadidas en v2.6
para el dominio paramétrico de documentos opcionales --- desacoplado del
flujo de tasaciones). Cada una declara explícitamente su tipo de unidad
construible (Tipo A con código · Tipo B de plataforma), su propósito,
sus entradas (qué consume), sus acciones (qué puede hacer el usuario),
sus salidas (qué escribe o produce) y el estado destino al que conduce
la solicitud cuando la acción principal se ejecuta. Esta tabla es la
referencia maestra del resto del documento: cada vez que las secciones
3, 4, 5 o 6 mencionan una interfaz, lo hacen por su código IF-XX.

+-----------------------------------------------------------------------+
| **Convención del tipo A / B / C**                                     |
|                                                                       |
| Tipo A --- IF con código: pantalla construida con Next.js 14 +        |
| Clerk + Tailwind + shadcn/ui sobre Railway. Apropiado para            |
| experiencias externas, móviles y de alta criticidad. Cuatro           |
| interfaces (IF-01 a IF-04). · Tipo B --- IF de plataforma: pantalla   |
| construida con Airtable Interfaces, sin código propio. Apropiado para |
| operación interna, configuración, dashboards y auditoría. Once        |
| interfaces (IF-05 a IF-13 + IF-14 e IF-15). · Tipo C ---              |
| Automatización sin UI: AT01 a AT10. No aplica a este Blueprint porque |
| no tiene actor humano; se documenta en el Motor de Cálculo v2.5.      |
+-----------------------------------------------------------------------+

**2.1 Tabla maestra del catálogo**

Cada fila es un contrato operacional: con qué entra el dato, qué hace el
usuario y a qué estado lleva la solicitud. Las acciones aquí listadas
son las acciones primarias; las acciones secundarias (filtrar, exportar,
comentar) se describen en la ficha detallada de cada IF (sección 7).

  --------------------------------------------------------------------------------
  **IF**   **Tipo**   **Nombre**             **Usuario**         **Estado
                                                                 destino**
  -------- ---------- ---------------------- ------------------- -----------------
  IF-01    A          Formulario de          Solicitante /       creada
                      solicitud externa      Institución         

  IF-02    A          Consola de la          Ejecutivo comercial creada → asignada
                      ejecutiva comercial                        

  IF-03    A          App de visita del      Tasador             asignada →
                      tasador (PWA móvil)                        visitada

  IF-04    A          Mesa de revisión del   Revisor / Visador   pdf_listo →
                      visador                                    aprobada \|
                                                                 devuelta

  IF-05    B          Aprobación final /     Supervisor /        pendiente_final →
                      habilitación de envío  Gerencia            entregada \|
                                                                 devuelta

  IF-06    B          Centro operacional     Ejecutivo ·         sin transición
                      (control & SLA)        Supervisor ·        (observación)
                                             Backoffice          

  IF-07    B          Salud de               Administrador ·     sin transición
                      automatizaciones       Operador            (observación)

  IF-08    B          Consola de reglas de   Parametrizador /    no opera la state
                      negocio                Admin               machine de
                                                                 solicitudes

  IF-09    B          Gestión de plantillas  Administrador       no opera la state
                      Carbone                                    machine de
                                                                 solicitudes

  IF-10    B          Fórmulas y motor de    Parametrizador /    no opera la state
                      ejecución (DAG)        Admin               machine de
                                                                 solicitudes

  IF-11    B          Administración de      Administrador       no opera la state
                      clientes y SLA                             machine de
                                                                 solicitudes

  IF-12    B          Expediente 360° de la  Todos (según        sin transición
                      solicitud              permiso)            (consulta)

  IF-13    B          Auditoría, accesos y   Auditor /           sin transición
                      trazabilidad           Administrador       (consulta)

  IF-14    B          Administración         Administrador       no opera la state
                      paramétrica de                             machine de
                      documentos                                 solicitudes

  IF-15    B          Captura de documentos  Ejecutivo comercial no opera la state
                      opcionales por la                          machine de
                      ejecutiva                                  solicitudes
  --------------------------------------------------------------------------------

**2.2 Contrato operacional por interfaz**

Para cada IF: qué entra (lecturas y contexto), qué hace el usuario
(acción primaria), qué sale (escrituras), y a qué estado destino lleva
la solicitud. Cada acción está sujeta a las precondiciones y reglas de
negocio del Diseño de Datos v2.5; esta tabla declara solamente el
contrato visible al usuario.

**IF-01 · Formulario de solicitud externa · Tipo A**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  A --- IF con código (Next.js + Clerk · Railway)

  Propósito       Recibir el pedido inicial de tasación desde una
                  institución cliente, con los datos absolutamente
                  mínimos. Es el único punto de contacto del cliente
                  externo con el sistema.

  Entradas        M_Clientes (lectura por URL única) · M_TiposInforme ·
                  M_TiposPropiedad · M_Comunas · M_Bancos · M_Productos ·
                  C_VariablesCliente (campos extra por cliente).

  Acciones        Completar el formulario (tipo de informe, tipo de
                  propiedad, dirección, comuna, propietario + RUT, email
                  contacto). Opcional: rol SII, banco, producto, adjuntos
                  PDF, observaciones. Acción primaria: \"Enviar
                  solicitud\".

  Salidas         TX_Solicitudes (insert · estado=creada ·
                  origen_canal=app_cliente) · TX_Adjuntos (si carga PDFs)
                  · A_Eventos (evento solicitud_creada).

  Estado destino  creada --- al recibir la submission, AT01 (motor de
                  reglas) y AT02 (asignación) corren en paralelo en
                  Airtable; la solicitud pasa típicamente a asignada en
                  segundos.
  -----------------------------------------------------------------------

**IF-02 · Consola de la ejecutiva comercial · Tipo A**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  A --- IF con código (Next.js + Clerk · Railway)

  Propósito       Crear solicitudes manuales (clientes que aún envían por
                  email o teléfono), completar datos faltantes y vigilar
                  el avance y el SLA de la cartera viva.

  Entradas        TX_Solicitudes (cartera del ejecutivo · filtro por
                  estado y SLA) · M_Tasadores (disponible=true · zona
                  compatible · carga actual) · M_Visadores (especialidad
                  coincidente) · M_Clientes · A_Eventos (cronología del
                  caso seleccionado).

  Acciones        Crear solicitud (alta interna), editar datos
                  no-cálculo, asignar/reasignar tasador y visador, fijar
                  fecha de visita, cancelar, escribir notas internas para
                  tasador/visador. Acción primaria: \"Pasar a asignada\".

  Salidas         TX_Solicitudes (insert · update con
                  origen_canal=ingreso_manual) · A_Eventos (alta,
                  asignación, cambios) · A_Cambios (cuando se sobrescribe
                  la asignación automática de AT02).

  Estado destino  creada → asignada --- bloqueado hasta que existan
                  tasador asignado, visador asignado y fecha_visita. SC05
                  (Make → Gmail) notifica al tasador con link a IF-03.
  -----------------------------------------------------------------------

**IF-03 · App de visita del tasador (PWA móvil) · Tipo A**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  A --- IF con código (Next.js + Clerk · Railway)

  Propósito       Capturar en terreno todos los datos de la visita:
                  fotos, medidas, documentos legales (SII, CBR, permisos,
                  recepción final) y el cuadro de valoración E1. Sin esta
                  captura completa, el cálculo no se dispara.

  Entradas        TX_Solicitudes (solo la del tasador autenticado ·
                  filtro por tasador_id) · TX_DatosTasacion (si existe
                  versión previa) · TX_Adjuntos ·
                  TX_ItemsCuadroValoracion · M_TiposPropiedad.layouts
                  (programa por nivel) · catálogo de comodidades y
                  distancias (v2.3).

  Acciones        Completar superficies, año de construcción, estado y
                  calidad, fotos (≥8), PDFs SII/CBR/recepción/permiso,
                  ítems E1 del cuadro de valoración (1--15 filas),
                  subformularios E3 ampliaciones / E4 programa por nivel
                  / E5 terminaciones por recinto / E6 documentos legales.
                  Guardado automático cada 30 s. Acción primaria:
                  \"Enviar visita\".

  Salidas         TX_DatosTasacion (upsert) · TX_Adjuntos (insert fotos y
                  PDFs en Dropbox) · TX_ItemsCuadroValoracion (insert
                  filas) · TX_Ampliaciones / TX_HabitacionesPorNivel /
                  TX_TerminacionesPorRecinto / TX_DocumentosLegales
                  (insert v2.3) · A_Eventos (visita_completada).

  Estado destino  asignada → visitada --- la API Route sube archivos a
                  Dropbox y dispara SC06 (webhook Make). El cambio de
                  estado en Airtable dispara AT03 (DAG de fórmulas) y
                  SC07 (extracción IA Claude) en paralelo; al volver, la
                  solicitud pasa a calculada.
  -----------------------------------------------------------------------

**IF-04 · Mesa de revisión del visador · Tipo A**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  A --- IF con código (Next.js + Clerk · Railway)

  Propósito       Revisar el PDF generado y los datos extraídos por
                  Claude, lado a lado; aprobar, devolver al tasador con
                  notas, o escalar al administrador. Único control de
                  calidad humano antes del cliente.

  Entradas        TX_Solicitudes (cola del visador autenticado) ·
                  TX_DatosTasacion (extracción IA y campos saneados) ·
                  TX_Calculos (con snapshot de fórmula) · TX_Comparables
                  · TX_DocumentosGenerados (versión vigente) ·
                  A_DecisionesMotor (regla aplicada).

  Acciones        Inspeccionar datos lado a lado con el PDF embebido;
                  ajustar TX_DatosTasacion (síntesis descriptiva, estado
                  de conservación) o agregar/quitar TX_Comparables; abrir
                  el PDF (obligatorio · queda en A_Accesos). Acción
                  primaria: \"Aprobar\" / \"Devolver\" / \"Escalar a
                  admin\". Devolver exige motivo cerrado + observación
                  libre.

  Salidas         TX_Solicitudes (decision_visador, motivo_devolucion) ·
                  TX_DatosTasacion / TX_Comparables (si edita · regenera
                  PDF vN+1 vía SC09) · A_Accesos (cada apertura del PDF)
                  · A_Eventos · TX_Notificaciones (notificación al
                  tasador si devuelve).

  Estado destino  pdf_listo → aprobada (continúa el flujo · AT07 evalúa
                  si requiere F5) o pdf_listo → devuelta (vuelve a
                  asignada para corrección por el tasador). Escalar lleva
                  a requiere_atencion.
  -----------------------------------------------------------------------

**IF-05 · Aprobación final / habilitación de envío · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Última puerta antes del envío al cliente, solo para
                  casos que la regla del motor marca como sensibles
                  (valor \> 10.000 UF, cliente nuevo, primera tasación
                  con esa plantilla). El resto se envía automáticamente.

  Entradas        TX_Solicitudes (estado=pendiente_final) · resumen
                  calculado · TX_DocumentosGenerados (versión vigente) ·
                  A_Eventos (historial del caso).

  Acciones        Inspeccionar resumen y abrir el PDF; opcionalmente
                  comentar. Acción primaria: \"Enviar al cliente\" /
                  \"Devolver para ajustes\".

  Salidas         TX_Solicitudes (decision_gerencia, comentario_interno)
                  · A_Eventos (aprobación final o devolución) ·
                  TX_Notificaciones (acuse al cliente).

  Estado destino  pendiente_final → entregada (dispara SC13 · Make →
                  Gmail con el PDF al cliente) o pendiente_final →
                  devuelta (vuelve a asignada).
  -----------------------------------------------------------------------

**IF-06 · Centro operacional (control & SLA) · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Dar visibilidad en tiempo real del estado de toda la
                  operación: cola por estado, SLA, alertas, KPIs.
                  Sustituye cualquier planilla de seguimiento manual.

  Entradas        TX_Solicitudes (todas las activas · vistas filtradas
                  por estado, SLA, cliente, tasador) · A_Eventos
                  (timeline del día) · vistas precalculadas de
                  productividad y SLA.

  Acciones        Filtrar por cliente / tasador / estado / fecha; abrir
                  tarjeta para ir al expediente (IF-12) o a la consola
                  correspondiente (IF-02, IF-04, IF-05). Acción primaria:
                  navegación; no transiciona estados.

  Salidas         A_Accesos (al abrir un caso) --- la consola no escribe
                  TX\_ ni A_Eventos directamente.

  Estado destino  Sin transición --- es una interfaz de observación y
                  navegación. Cualquier transición ocurre en la interfaz
                  operacional a la que se navega desde aquí.
  -----------------------------------------------------------------------

**IF-07 · Salud de automatizaciones · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Auto-monitoreo del sistema desde las tablas de
                  auditoría: errores, reintentos, tasa de éxito por
                  escenario Make (SC) y por automation Airtable (AT).

  Entradas        A_ErroresMake · Z_EscenariosMake · Z_EjecucionesMake ·
                  Z_ColaPendientes · C_AutomationsAirtable (estado
                  AT01--AT10).

  Acciones        Inspeccionar errores críticos sin resolver, marcar como
                  resuelto/escalado, reintentar manualmente desde la
                  cola. Acción primaria: \"Resolver error\" /
                  \"Escalar\".

  Salidas         A_ErroresMake (update estado, notas de resolución) ·
                  A_Eventos (resolución registrada) · A_Cambios.

  Estado destino  Sin transición de solicitud --- opera sobre el dominio
                  de operación, no sobre TX_Solicitudes.
  -----------------------------------------------------------------------

**IF-08 · Consola de reglas de negocio · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Crear, probar y activar reglas del motor (RN-22, RN-23
                  de la Especificación). Cada regla mapea un contexto
                  (cliente + tipo informe + tipo propiedad + banco +
                  comuna) a un resultado (plantilla + fórmulas +
                  workflow). Cambiar el comportamiento del sistema =
                  agregar una fila.

  Entradas        C_ReglasNegocio · C_Plantillas (activas) · C_Formulas
                  (activas) · C_Workflows (activos) · solicitudes
                  recientes (para el test seco).

  Acciones        Definir filtros multi-select por dimensión, asignar
                  plantilla/fórmulas/workflow resultado, fijar prioridad
                  y vigencia, ejecutar test seco contra 10 solicitudes
                  recientes, activar la regla. Acción primaria: \"Test
                  seco\" → \"Activar\".

  Salidas         C_ReglasNegocio (insert / update) · A_Cambios (autor y
                  razón de cada cambio · obligatorio).

  Estado destino  No opera la state machine de solicitudes; opera el
                  estado activa/inactiva de la regla y su vigencia. El
                  próximo TX_Solicitudes en estado creada consumirá las
                  reglas vigentes.
  -----------------------------------------------------------------------

**IF-09 · Gestión de plantillas Carbone · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Subir, versionar y activar plantillas .docx de Carbone
                  que generan los informes PDF (F7 de la Especificación).
                  Garantiza reproducibilidad documental a 10 años
                  (RNF-21).

  Entradas        C_Plantillas (versiones) · H_PlantillasAnteriores ·
                  Dropbox (archivos .docx) · contrato JSON de SC09
                  (variables esperadas).

  Acciones        Subir nueva versión (.docx a Dropbox), validar
                  variables esperadas contra el JSON de Make, ejecutar
                  prueba con datos dummy, comparar lado a lado vN vs
                  vN-1, activar la nueva versión. Acción primaria:
                  \"Activar versión\".

  Salidas         C_Plantillas (insert nueva versión activa) ·
                  H_PlantillasAnteriores (mueve versión anterior ·
                  es_vigente=false) · A_Cambios.

  Estado destino  No opera la state machine de solicitudes; opera el
                  estado activa/inactiva de plantilla. Las solicitudes
                  futuras consumen la versión activa.
  -----------------------------------------------------------------------

**IF-10 · Fórmulas y motor de ejecución (DAG) · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Gestionar el catálogo de fórmulas y su orden de
                  ejecución (grafo de dependencias). El motor AT03
                  resuelve el DAG en orden topológico (sort topológico en
                  JavaScript nativo de Airtable Scripting).

  Entradas        C_Formulas (DAG · depende_de · orden_topologico) ·
                  H_FormulasAnteriores · TX_Calculos (para el test seco).

  Acciones        Crear/editar fórmula, declarar sus dependencias
                  (depende_de), validar que no haya ciclos, ejecutar test
                  seco contra una solicitud reciente, activar. Acción
                  primaria: \"Validar DAG\" → \"Activar fórmula\".

  Salidas         C_Formulas (insert / update) · H_FormulasAnteriores
                  (versión anterior) · A_Cambios.

  Estado destino  No opera la state machine de solicitudes; opera el
                  estado activa/inactiva de fórmula. Las próximas
                  solicitudes en estado visitada consumirán la versión
                  activa al correr AT03.
  -----------------------------------------------------------------------

**IF-11 · Administración de clientes y SLA · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Incorporar y mantener clientes (M_Clientes, C_SLA,
                  C_VariablesCliente) sin tocar Make ni Carbone. La
                  próxima solicitud del cliente usa la configuración
                  actualizada.

  Entradas        M_Clientes · C_SLA · C_VariablesCliente · M_Productos ·
                  M_TiposInforme.

  Acciones        Crear / editar / clonar cliente, productos habilitados,
                  SLA en días, tasa_cap_rate, variables personalizadas
                  (logo, pie legal, etc.). Activar/desactivar con aviso
                  de impacto en cartera viva. Acción primaria: \"Guardar
                  cambios\".

  Salidas         M_Clientes · C_SLA · C_VariablesCliente · A_Cambios
                  (autor y razón).

  Estado destino  No opera la state machine de solicitudes; opera activo
                  / inactivo de cliente. Las solicitudes activas se ven
                  afectadas inmediatamente al cambiar el SLA (con aviso).
  -----------------------------------------------------------------------

**IF-12 · Expediente 360° de la solicitud · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Reconstruir en una sola vista todo lo ocurrido con una
                  solicitud (RN-30, RNF-22 trazabilidad total). Responde
                  \"¿cómo llegaron a este valor?\" con un dossier
                  completo en minutos.

  Entradas        A_Eventos · TX_Solicitudes · TX_DatosTasacion ·
                  TX_Calculos · TX_Comparables · A_DecisionesMotor ·
                  TX_DocumentosGenerados (todas las versiones) ·
                  TX_Notificaciones · A_Cambios · TX_Ampliaciones /
                  TX_HabitacionesPorNivel / TX_TerminacionesPorRecinto /
                  TX_DocumentosLegales.

  Acciones        Inspeccionar por pestaña (Cronología, Entrada, IA,
                  Cálculos, Comparables, Decisión del motor, Documentos,
                  Notificaciones, Cambios). Descargar PDF cualquier
                  versión. Regenerar un PDF antiguo (bit-a-bit) usando
                  las versiones congeladas. Acción primaria: navegación /
                  lectura.

  Salidas         A_Accesos (cada apertura registrada) --- el expediente
                  no escribe TX\_ ni A_Eventos directamente.

  Estado destino  Sin transición --- es una vista de consulta
                  transversal. Filtrada por permiso del rol que la abre.
  -----------------------------------------------------------------------

**IF-13 · Auditoría, accesos y trazabilidad · Tipo B**

  -----------------------------------------------------------------------
  **Aspecto**     **Detalle**
  --------------- -------------------------------------------------------
  Tipo de unidad  B --- IF de plataforma (Airtable Interfaces)

  Propósito       Vistas de auditoría de seguridad y compliance sobre
                  eventos, accesos, cambios y decisiones del motor.
                  Append-only: estos registros no se editan ni se borran
                  (RN-29).

  Entradas        A_Eventos · A_Accesos · A_Cambios · A_DecisionesMotor ·
                  A_ErroresMake (todas en solo lectura para auditor).

  Acciones        Filtrar por fecha / usuario / tabla / severidad / tipo
                  de evento; exportar a Dropbox para archivado de
                  retención. Acción primaria: consulta / exportación.

  Salidas         A_Accesos (cada apertura · el auditor también queda
                  registrado) --- no escribe en tablas A\_\*.

  Estado destino  Sin transición --- es una vista de consulta
                  transversal. La retención (AT10) opera por scheduler
                  nocturno.
  -----------------------------------------------------------------------

**2.3 Mapeo acción primaria → transición de estado**

La regla \"cada acción de UI mapea a una transición de estado
documentada\" se materializa aquí. La tabla recoge solo las acciones que
avanzan la máquina de estados de TX_Solicitudes; las acciones que
escriben en tablas de configuración (IF-08, IF-09, IF-10, IF-11) no
aparecen porque no transicionan solicitudes.

  ------------------------------------------------------------------------------
  **Interfaz**   **Acción de UI** **Transición de         **Automatización en
                                  estado**                cadena**
  -------------- ---------------- ----------------------- ----------------------
  IF-01          Enviar solicitud ∅ → creada              SC01 (webhook) → AT01
                                                          (motor de reglas) +
                                                          AT02 (asignación)

  IF-02          Pasar a asignada creada → asignada       AT02 (validación de
                                                          zona y carga) → SC05
                                                          (notificación al
                                                          tasador)

  IF-02          Cancelar         (cualquier) → cancelada A_Eventos (cancelación
                 solicitud                                con motivo)

  IF-03          Enviar visita    asignada → visitada     SC06 (Make · Dropbox)
                                                          → AT03 (DAG
                                                          fórmulas) + SC07
                                                          (Claude API)

  IF-03          Marcar requiere  asignada →              A_ErroresMake si la
                 atención         requiere_atencion       causa es validación;
                                                          admin recibe alerta

  ---            (automático)     visitada → calculada    AT03 termina el DAG y
                                                          dispara SC09
                                                          (generación PDF) →
                                                          pdf_listo

  IF-04          Aprobar          pdf_listo → aprobada    AT06 (procesa
                 (visador)                                decisión) → AT07
                                                          (chequea aprobación
                                                          final)

  IF-04          Devolver al      pdf_listo → devuelta →  AT06 → AT02 (reasigna
                 tasador          asignada                al mismo tasador con
                                                          notas)

  IF-04          Escalar al       pdf_listo →             A_Eventos + alerta al
                 administrador    requiere_atencion       admin

  IF-05          Enviar al        pendiente_final →       SC13 (Make → Gmail con
                 cliente          entregada               PDF al cliente)

  IF-05          Devolver para    pendiente_final →       AT02 (reasigna al
                 ajustes          devuelta → asignada     tasador con motivo)

  ---            (automático ·    entregada → cerrada     AT10 (archivado
                 entrega ack)     (T+N días)              nocturno) cuando se
                                                          cumple SLA de cierre
  ------------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Estados del catálogo TX_Solicitudes**                               |
|                                                                       |
| La máquina de estados tiene 11 estados oficiales (Diseño de Capa de   |
| Datos v2.5): creada · asignada · visitada · calculada · pdf_listo ·   |
| aprobada · devuelta · pendiente_final · entregada · cerrada ·         |
| cancelada · requiere_atencion. Las transiciones no listadas en la     |
| tabla anterior son automáticas (gobernadas por AT03 al cerrar el DAG, |
| por SC09 al generar el PDF, por AT05 al notificar al visador, por     |
| AT07 al chequear si requiere F5). Toda transición ---humana o         |
| automática--- deja una fila en A_Eventos.                             |
+-----------------------------------------------------------------------+

**3. Navegación entre interfaces**

La navegación entre interfaces sigue tres patrones canónicos: hub por
módulo (cada rol entra a su workspace y ve solo los módulos que puede
operar), cola → detalle (selección en una lista abre el registro en el
panel adyacente) y tarjeta → expediente (cualquier referencia a una
solicitud lleva al expediente 360°). Los botones de transición de estado
son la única forma de avanzar la máquina de estados desde la UI; cada
uno valida precondiciones antes de habilitarse.

**3.1 Mapa de navegación por rol**

Cada rol entra al sistema a un workspace que actúa como hub. Lo que el
rol no puede operar no aparece en su navegación.

  --------------------------------------------------------------------------
  **Rol**          **Punto de       **Hubs visibles**     **Navegación
                   entrada**                              frecuente**
  ---------------- ---------------- --------------------- ------------------
  Solicitante      URL pública del  Solo IF-01 (pantalla  IF-01 →
                   cliente · IF-01  única)                confirmación +
                                                          email VP-AAAA-NNNN

  Ejecutivo        Login Clerk ·    Recepción (IF-02) ·   IF-06 (cola del
  comercial        workspace        Operación (IF-06) ·   día) → IF-02
                   Recepción        Expediente (IF-12)    (detalle) → IF-12
                                                          (consulta
                                                          histórica)

  Tasador          Link único       Solo IF-03 (PWA móvil Lista de visitas
                   enviado por SC05 con sus solicitudes   pendientes → IF-03
                   · login Clerk ·  asignadas)            detalle → envío
                   IF-03                                  

  Visador          Login Clerk ·    Revisión (IF-04) ·    IF-06 (PDF_LISTO)
                   workspace        Operación (IF-06) ·   → IF-04 detalle →
                   Revisión         Expediente (IF-12)    aprobar/devolver

  Supervisor /     Airtable ·       Aprobación (IF-05) ·  IF-06 → IF-05
  Gerencia         workspace        Operación (IF-06) ·   (casos
                   Aprobación       Configuración         pendiente_final) o
                                    (lectura) · Auditoría lectura amplia
                                    (lectura)             

  Administrador    Airtable ·       Configuración (IF-08, IF-08 (reglas) ⇄
                   workspace        IF-09, IF-10, IF-11)  IF-09 (plantillas)
                   Configuración    · Operación (IF-06,   ⇄ IF-10 (fórmulas)
                                    IF-07) · Auditoría    ⇄ IF-11 (clientes)
                                    (IF-13)               

  Parametrizador   Airtable ·       Reglas (IF-08) ·      IF-08 ⇄ IF-10 (con
                   workspace Motor  Fórmulas (IF-10) ·    test seco antes de
                                    lectura del resto     activar)

  Auditor          Airtable ·       Auditoría (IF-13) ·   IF-13 (filtros
                   workspace        Expediente (IF-12) ·  guardados) → IF-12
                   Auditoría        lectura del resto     (caso específico)

  Operador /       Airtable ·       Operación (IF-06) ·   IF-06 (alertas) →
  backoffice       workspace        Expediente (IF-12) ·  IF-02/IF-12 según
                   Operación        apoyo a cola en IF-02 caso
  --------------------------------------------------------------------------

**3.2 Workspace visual --- hub por rol**

Vista esquemática del workspace operacional. Cada rol ve solo los hubs y
las interfaces que puede operar (filtro por permisos · mínimo
privilegio). Los símbolos ▣ = visible / operable · ▢ = visible solo
lectura · --- = oculto.

╔══════════════════════════════════════════════════════════════════════╗

║ VPROPERTY · WORKSPACE OPERACIONAL usuario ▸ rol ▸ permisos ║

╠══════════════════════════════════════════════════════════════════════╣

║ ║

║ ┌── RECEPCIÓN ───────┐ ┌── CAPTURA ────────┐ ┌── REVISIÓN ───────┐║

║ │ IF-01 (Next.js) │ │ IF-03 (Next.js) │ │ IF-04 (Next.js) │║

║ │ IF-02 (Next.js) │ │ PWA móvil │ │ IF-05 (Airtable) │║

║ └────────┬───────────┘ └────────┬──────────┘ └────────┬──────────┘║

║ │ │ │ ║

║ ▼ ▼ ▼ ║

║ ┌──────────────────── OPERACIÓN & MONITOREO ────────────────────┐ ║

║ │ IF-06 Centro operacional (cola · SLA · estados · KPIs) │ ║

║ │ IF-07 Salud de automatizaciones (errores · reintentos) │ ║

║ └──────────────────────────────┬─────────────────────────────────┘ ║

║ │ ║

║ ┌── CONFIGURACIÓN (MOTOR) ────┴───┐ ┌── AUDITORÍA & TRAZA ────┐ ║

║ │ IF-08 Reglas de negocio │ │ IF-12 Expediente 360° │ ║

║ │ IF-09 Plantillas Carbone │ │ IF-13 Auditoría │ ║

║ │ IF-10 Fórmulas & DAG │ └────────────────────────┘ ║

║ │ IF-11 Clientes & SLA │ ║

║ └──────────────────────────────────┘ ║

║ ║

╚══════════════════════════════════════════════════════════════════════╝

**3.3 Patrón cola → detalle**

Patrón maestro de las interfaces operacionales (IF-02, IF-04, IF-11): la
lista a la izquierda actúa como cola filtrable y ordenable; al
seleccionar una fila se carga el registro completo a la derecha sin
recargar la página. La transición de estado ocurre desde el panel de
detalle. Este patrón se reutiliza en IF-12 (expediente) en formato tabs
y en IF-06 (centro operacional) en formato Kanban.

┌───────────── COLA ──────────┐ ┌──────────── DETALLE ─────────────────┐

│ filtros · orden · búsqueda │ │ encabezado · estado · acciones │

│ ─────────────────────────── │ │ ─────────────────────────────────── │

│ VP-0519 ▸ pdf_listo 🔴 │ │ DATOS │

│ VP-0521 ▸ pdf_listo 🟡 │ │ ┌── BLOQUE 1 ────────────────────┐ │

│ VP-0524 ▸ asignada 🟢 │ │ │ \...campos editables\... │ │

│ \... │ │ └─────────────────────────────────┘ │

│ │ │ ┌── BLOQUE 2 ────────────────────┐ │

│ paginación ◀ 1 2 3 ▶ │ │ │ \...campos editables\... │ │

└─────────────────────────────┘ │ └─────────────────────────────────┘ │

│ \[ acción primaria ▸ transición \] │

└────────────────────────────────────┘

**3.4 Transiciones gobernadas desde la UI**

Solo los botones de transición avanzan la máquina de estados desde la
UI. Cada uno tiene precondiciones que deben cumplirse para habilitarse;
si no se cumplen, el botón aparece deshabilitado con tooltip explicativo
(mensaje humano · ver sección 6).

  --------------------------------------------------------------------------------
  **Botón /       **Interfaz**   **Precondiciones de          **Si falla
  acción**                       habilitación**               precondición**
  --------------- -------------- ---------------------------- --------------------
  Enviar          IF-01          Todos los campos             Botón deshabilitado
  solicitud                      obligatorios completos · RUT · resalta el campo
                                 válido · email válido ·      inválido con mensaje
                                 dirección con calle+número.  humano.

  Pasar a         IF-02          Tasador asignado · visador   Mensaje \"Falta
  asignada                       asignado · fecha_visita      asignar tasador /
                                 definida.                    fecha de visita\".

  Enviar visita   IF-03          ≥8 fotos · superficies \> 0  Mensaje exacto del
                                 · año entre 1900 y actual ·  faltante (\"Faltan 2
                                 tamaño total ≤100 MB · ítems fotos\", \"Σ m²
                                 E1 cuadran m² · subforms     edif. no cuadra con
                                 v2.3 mínimos completos.      superficie
                                                              construida\").

  Aprobar         IF-04          PDF abierto al menos una vez Botón Aprobar
  (visador)                      (A_Accesos) · ampliaciones   deshabilitado hasta
                                 reguladas con n_pe ·         abrir el PDF · flag
                                 documentos legales completos rojo si falta n_pe o
                                 (mínimo CBR).                CBR.

  Devolver        IF-04          Motivo de devolución         Mensaje \"Falta el
  (visador)                      seleccionado de la lista     motivo de
                                 cerrada.                     devolución\".

  Enviar al       IF-05          PDF abierto al menos una vez Mensaje \"Abre el
  cliente                        · ningún flag rojo abierto.  PDF antes de enviar
                                                              al cliente\".

  Activar regla   IF-08          Test seco superado ·         Checkbox activa
                                 integridad referencial       bloqueado hasta
                                 (plantilla, fórmulas,        superar el test.
                                 workflow activos) · una      
                                 wildcard activa.             

  Activar         IF-09          Variables esperadas          Mensaje \"Faltan
  plantilla                      validadas contra JSON de     variables esperadas:
                                 SC09 · combinación           \[lista\]\".
                                 cliente+tipo única.          

  Activar fórmula IF-10          DAG sin ciclos detectados ·  Mensaje \"Se detectó
                                 dependencias activas.        un ciclo: F_X → F_Y
                                                              → F_X\".
  --------------------------------------------------------------------------------

**4. Jerarquía visual y código de color transversal**

La jerarquía visual responde a dos capas que conviven sin colisionar: la
paleta corporativa VProperty (extraída del logo oficial) que da
identidad de marca a portadas, encabezados, navegación y elementos
pasivos; y el código semáforo operacional (verde · ámbar · rojo · azul ·
púrpura) que comunica estado, urgencia y criticidad en la operación
diaria. Esta separación es deliberada: cuando un usuario ve naranja
brand, está leyendo marca; cuando ve ámbar (más oscuro y saturado), está
leyendo \"atención operacional\".

**4.1 Paleta corporativa VProperty**

Paleta extraída del logo de Value Property y del sitio web institucional
valueproperty.cl. Se usa para identidad de marca en todas las interfaces
--- tanto las Tipo A (Next.js) como las Tipo B (Airtable Interfaces).

  -------------------------------------------------------------------------
  **Token de          **HEX**    **Uso operacional**
  marca**                        
  ---------------- ------------- ------------------------------------------
  **Azul VProperty  **#075899**  Headings H1 y H2 · barras de navegación
  (primario)**                   principales · cabeceras de tabla · botones
                                 primarios · logo de marca. Es el color
                                 \"VALUE PROPERTY\" del logo original.

  **Azul            **#054070**  Portadas · separadores densos · fondos de
  profundo**                     header en modales · acentos sobre fondo
                                 claro cuando se necesita más contraste.

  **Azul claro**    **#0064B4**  Enlaces · hover de botones · headings H3 ·
                                 indicadores informativos · texto
                                 secundario con énfasis.

  **Naranja         **#F5A213**  Acentos de marca · flecha del logo ·
  VProperty                      iconos de marca · badges de versión ·
  (acento)**                     separadores sutiles en portada. NO se usa
                                 para alertas (para no colisionar con ámbar
                                 operacional).

  **Naranja         **#FCD9A1**  Fondos sutiles de callouts de marca ·
  claro**                        shading de cabeceras secundarias ·
                                 destacados pasivos.
  -------------------------------------------------------------------------

**4.2 Código semáforo operacional**

Esta segunda capa comunica estado y urgencia operacional. Se aplica en
estados de SLA, validaciones, alertas, errores de Make, badges de KPI y
botones de decisión del visador. Cada color tiene un significado único y
consistente en todas las interfaces.

  ---------------------------------------------------------------------------
  **Significado**       **HEX**    **Uso operacional**
  ------------------ ------------- ------------------------------------------
  **Verde ---         **#15803D**  SLA verde · validación correcta · botón
  nominal / OK**                   Aprobar (IF-04, IF-05) · estado entregada
                                   · tasa de éxito ≥ umbral en IF-07.

  **Ámbar ---         **#D97706**  SLA amarillo (en riesgo) · botón Devolver
  advertencia /                    (IF-04) · advertencias no bloqueantes ·
  riesgo**                         descuadre detectado en E1 · saneamiento
                                   aplicado.

  **Rojo --- crítico  **#B91C1C**  SLA vencido · error CRITICAL en
  / bloqueo**                      A_ErroresMake · validación bloqueante ·
                                   botón Escalar (IF-04) · flag rojo de
                                   ampliación no regulada.

  **Azul ---          **#1D4ED8**  Datos · enlaces · estado neutral · KPIs
  informativo /                    sin connotación · indicadores de
  neutro**                         navegación.

  **Púrpura ---       **#6B21A8**  Configuración del motor (IF-08, IF-09,
  administrativo**                 IF-10, IF-11) · acciones de alto cuidado ·
                                   señalética de \"aquí se cambia el
                                   comportamiento del sistema\".
  ---------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Por qué el naranja brand y el ámbar operacional son distintos**     |
|                                                                       |
| El naranja corporativo (#F5A213) está saturado y luminoso, propio de  |
| un acento de marca. El ámbar operacional (#D97706) es más oscuro y    |
| quemado, propio de una alerta. La diferencia tonal y de saturación es |
| suficiente para que el operador no confunda \"estoy en la marca       |
| VProperty\" con \"esta solicitud requiere atención\". Si en algún     |
| componente futuro hubiera duda, prevalece el ámbar operacional: el    |
| naranja brand cede el lugar al ámbar (p. ej. un badge de SLA jamás se |
| renderiza en #F5A213).                                                |
+-----------------------------------------------------------------------+

**4.3 Tipografía y jerarquía textual**

La tipografía es deliberadamente sobria: una sola familia san-serif para
todo (Inter en Next.js · Arial / SF Pro nativas en Airtable Interfaces).
Las jerarquías se construyen por peso y tamaño, no por familia. Para
blueprints, código y mockups se usa Consolas / Courier New
monoespaciado.

  ------------------------------------------------------------------------
  **Nivel**          **Tamaño / peso**     **Uso**
  ------------------ --------------------- -------------------------------
  H1 · Sección       32 pt · bold · azul   Títulos de capítulo (1, 2,
  principal          VProperty             3...). Espaciado generoso
                                           arriba y abajo.

  H2 · Subsección    26 pt · bold · azul   Títulos de subsección numerada
                     VProperty             (2.1, 2.2...).

  H3 · Apartado      22 pt · bold · azul   Apartados dentro de una
                     claro                 subsección.

  H4 · Bloque        20 pt · bold · gris   Bloques temáticos cortos dentro
                     oscuro                de un apartado.

  Cuerpo regular     11 pt · normal        Texto narrativo. Interlineado
                                           1.15.

  Cuerpo pequeño     9 pt · normal         Tablas densas, leyendas, notas
                                           al pie.

  Énfasis fuerte     11 pt · bold          Conceptos clave dentro del
                                           cuerpo. Sin abusar.

  Código / ASCII /   8 pt · Consolas       Blueprints ASCII, fragmentos de
  mockup                                   código, mockups operacionales.
  ------------------------------------------------------------------------

**4.4 Aplicación visual en Tipo A (Next.js)**

  ---------------------------------------------------------------------------------
  **Elemento de UI**  **Color / estilo**                   **Origen del token**
  ------------------- ------------------------------------ ------------------------
  Header / barra      Fondo blanco · logo \"VPROPERTY\" en Logo institucional
  superior            azul #075899 · subtítulo             
                      \"Tasaciones · Bienes Raíces\" en    
                      naranja #F5A213                      

  Botón primario      Fondo #075899 · texto blanco · hover Tailwind theme:
  (acción)            #0064B4                              bg-blue-vp /
                                                           hover:bg-blue-vp-light

  Botón secundario    Fondo blanco · borde #075899 · texto Variante outline
                      azul                                 

  Botón destructivo   Fondo #B91C1C · texto blanco         Solo para \"Cancelar
                                                           solicitud\" y
                                                           \"Escalar\"

  Botón aprobar       Fondo #15803D · texto blanco         Semáforo operacional
  (IF-04, IF-05)                                           

  Botón devolver      Fondo #D97706 · texto blanco         Semáforo operacional
  (IF-04, IF-05)                                           

  Input válido        Borde gris claro · foco anillo azul  Sistema de formularios
                      VProperty                            

  Input con error     Borde #B91C1C · texto de error rojo  Validación bloqueante
                      bajo el campo                        

  Badge SLA verde /   Fondos suaves verdes / ámbar / rojo  shadcn/ui Badge con
  ámbar / rojo        claros con texto del tono fuerte     variantes
  ---------------------------------------------------------------------------------

**4.5 Aplicación visual en Tipo B (Airtable Interfaces)**

Airtable Interfaces ofrece una paleta limitada y no permite definir
tokens personalizados; sin embargo, sí se puede asignar color a cada
estado de un campo Select y a cada elemento Badge. La aplicación se
acerca al máximo a la paleta corporativa dentro de esos límites.

  -----------------------------------------------------------------------
  **Elemento Airtable         **Color Airtable     **Mapeo a token
  Interfaces**                disponible**         VProperty**
  --------------------------- -------------------- ----------------------
  Color de página de          Blue (Airtable)      Aproxima azul
  Interface                                        VProperty #075899

  Color de estado nominal     Green                OP.green #15803D
  (entregada)                                      

  Color de estado en riesgo   Orange               OP.amber #D97706
  (SLA amb.)                                       

  Color de estado crítico     Red                  OP.red #B91C1C
  (SLA vencido)                                    

  Color de configuración      Purple               OP.purple #6B21A8
  (motor)                                          

  Color de auditoría /        Gray                 OP.gray #6B7280
  lectura                                          
  -----------------------------------------------------------------------

**5. Patrones de UI repetidos**

Cuatro patrones canónicos cubren todas las interfaces del sistema. Cada
IF declara qué patrón aplica (a veces dos combinados). Los patrones
consolidan lecciones de diseño y reducen el costo de construcción: una
vez que el patrón está implementado en los componentes compartidos
(CU-000), cada IF que lo usa hereda la disposición, los estilos y los
comportamientos por defecto.

**5.1 Catálogo de patrones por interfaz**

  ------------------------------------------------------------------------
  **Patrón**         **IFs que lo usan**               **Cuándo
                                                       aplicarlo**
  ------------------ --------------------------------- -------------------
  P1 · Lista         IF-06 (cola operacional · Kanban) Cuando el usuario
  filtrable          · IF-11 (clientes) · IF-13        necesita encontrar
                     (auditoría)                       un conjunto de
                                                       registros por
                                                       criterios y navegar
                                                       al detalle.

  P2 · Lista +       IF-02 (consola ejecutiva) · IF-04 Cuando la operación
  Detalle (cola →    (mesa visador) · IF-09            es secuencial: el
  detalle)           (plantillas)                      usuario procesa
                                                       registros uno a uno
                                                       desde una cola.

  P3 · Formulario    IF-01 (solicitud externa) · IF-03 Cuando el usuario
  (single-page ·     (visita tasador) · IF-05          aporta datos en una
  captura)           (aprobación final) · IF-08 (regla sola sesión, con
                     de negocio) · IF-10 (fórmula)     validación y un
                                                       envío final.

  P4 · Dashboard     IF-06 (centro operacional) ·      Cuando el usuario
                     IF-07 (salud automatizaciones) ·  necesita visión
                     IF-10 (vista grafo DAG)           global (KPIs ·
                                                       alertas ·
                                                       distribución).

  P5 · Expediente    IF-12 (expediente 360°)           Cuando el usuario
  (tabs)                                               necesita
                                                       reconstruir todo el
                                                       historial de un
                                                       único caso desde
                                                       múltiples dominios.
  ------------------------------------------------------------------------

**5.2 P1 · Lista filtrable**

Estructura: barra de filtros arriba · grid o cards al centro ·
paginación / scroll abajo. La selección de una fila lleva a P2 (detalle)
o abre directamente el expediente IF-12 según el rol. Sin acciones
destructivas en la lista misma; las acciones primarias viven en el
detalle.

┌──────────────────────────────────────────────────────────────────┐

│ \[buscar\...\] filtros: \[Cliente▼\]\[Estado▼\]\[SLA▼\]\[Fecha▼\] \[+
\] │

├──────────────────────────────────────────────────────────────────┤

│ ID │ Cliente │ Comuna │ Estado │ SLA │ Asig.│

│ VP-0519 │ MetLife │ Vitacura │ pdf_listo │ 🔴 hoy│ R.P. │

│ VP-0521 │ Security │ Ñuñoa │ asignada │ 🟡 +1 │ A.M. │

│ VP-0524 │ MetLife │ Las Condes │ visitada │ 🟢 +3 │ R.P. │

│ \... │

├──────────────────────────────────────────────────────────────────┤

│ 25 de 142 resultados ◀ 1 2 3 \... 6 ▶ │

└──────────────────────────────────────────────────────────────────┘

**Reglas del patrón P1**

- **Ordenación por defecto:** por SLA descendente (vencimientos próximos
  primero), salvo en auditoría (orden por timestamp desc).

- **Filtros guardados:** cada rol tiene 2--3 filtros guardados típicos
  (p. ej. ejecutivo: \"Mi cartera · SLA en riesgo\"; admin: \"Errores
  CRITICAL pendientes\").

- **Densidad:** mostrar de 20 a 50 filas por página · sin scroll
  horizontal si es posible · columnas con anchos uniformes.

- **Tarjeta vs grid:** grid en escritorio · tarjetas en móvil (IF-06
  Kanban tarjeta por solicitud).

**5.3 P2 · Lista + Detalle**

Patrón maestro de operación secuencial. El usuario procesa la cola
seleccionando un registro, ve y edita el detalle a la derecha, ejecuta
la acción primaria que transiciona el estado, y la lista se refresca
quitando el registro procesado.

┌───────── COLA ────────┐ ┌─────── DETALLE · VP-2026-0524 ─────────┐

│ filtros │ │ encabezado · estado actual │

│ ───────────────────── │ │ ─────────────────────────────────────── │

│ ▣ VP-0519 pdf_listo │ │ ┌── EXTRACCIÓN IA ─────────────────────┐│

│ ▢ VP-0521 pdf_listo │ │ │ \...campos lectura/edición\... ││

│ ▢ VP-0524 asignada │ │ └───────────────────────────────────────┘│

│ ▢ VP-0530 visitada │ │ ┌── DECISIÓN ──────────────────────────┐│

│ \... │ │ │ \[✓ APROBAR\] \[↩ DEVOLVER\] \[⚠ ESCALAR\]││

│ │ │ └───────────────────────────────────────┘│

│ 3 pendientes · cola │ │ │

└───────────────────────┘ └─────────────────────────────────────────┘

**Reglas del patrón P2**

- **Refresh tras acción:** al ejecutar la acción primaria, la lista se
  actualiza eliminando el registro procesado; si quedan más, se
  selecciona automáticamente el siguiente (acelera el flujo del
  visador).

- **Edición sin guardar implícita:** los cambios en el detalle se
  persisten al disparar la acción primaria, no al perder el foco; un
  draft local protege ante cierre accidental.

- **Atajos de teclado:** A = aprobar · D = devolver · E = escalar · ↑/↓
  = navegar la cola. Documentados en un pop-over \"?\".

- **Indicador de progreso:** cuando la acción dispara una cadena (SC09
  regenera PDF, AT06 procesa decisión), se muestra un spinner inline con
  \"Procesando...\" y se libera el foco al terminar.

**5.4 P3 · Formulario**

Captura de datos en una sola sesión. Una columna en móvil (IF-01,
IF-03); dos columnas en escritorio (IF-08, IF-10) cuando la densidad lo
permite. Validación temprana en cliente (UX) y red de seguridad en
Airtable (integridad). Mensajes humanos · ver sección 6.

┌──────────────────────────────────────────────────────────────────┐

│ TÍTULO DEL FORMULARIO · progreso ▓▓▓▓▓░░ 78% (autosave 30s) │

├──────────────────────────────────────────────────────────────────┤

│ SECCIÓN A · obligatoria │

│ Campo 1 \[ valor \] \* │

│ Campo 2 \[ valor \] \* ✔ validado │

├──────────────────────────────────────────────────────────────────┤

│ SECCIÓN B · obligatoria │

│ Campo 3 \[ \_\_\_\_ \] ⚠ \"Debe estar entre 1900 y 2026\" │

├──────────────────────────────────────────────────────────────────┤

│ ▸ SECCIÓN C · opcional (colapsada) │

├──────────────────────────────────────────────────────────────────┤

│ \[ Enviar ▸ \] │

└──────────────────────────────────────────────────────────────────┘

**Reglas del patrón P3**

- **Lo obligatorio primero:** campos requeridos arriba; opcionales
  agrupados al final, colapsables para no abrumar.

- **Validación temprana en cliente:** RUT con dígito verificador, email
  con regex, dirección con Google Places en el momento de la edición.
  Errores visibles bajo el campo, no al final.

- **Autosave:** cada 30 s donde la sesión es larga (IF-03 visita del
  tasador). Indicador \"Guardado a las hh:mm\". El formulario sobrevive
  al cierre accidental del navegador.

- **Envío final único:** un solo botón primario abajo a la derecha.
  Mientras el envío está en curso, el botón se reemplaza por un spinner
  y se bloquean los inputs.

- **Confirmación:** al éxito, transición visual (toast verde) + acuse
  por email cuando aplique (IF-01: código VP-AAAA-NNNN en ≤2 s).

**5.5 P4 · Dashboard**

Visión global con KPIs arriba, distribuciones al centro y alertas a la
derecha. No es editable: el dashboard solo presenta. La acción posible
es navegación a la interfaz operacional correspondiente (clic en una
tarjeta lleva a IF-02, IF-04, IF-12, etc.).

╔════════════════ DASHBOARD ════════════════════════════════════════╗

║ KPIs (banda superior): ║

║ ⏱ 82% \<48h ↩ 7% devolución ✉ 0 reclamos 🟢 99.7% up ║

╠════════════════════════════════════════════════════╦══════════════╣

║ DISTRIBUCIÓN (Kanban / gráfico / timeline) ║ ALERTAS ║

║ ║ ║

║ creada │asignada│visitada│calculada│pdf_listo│apr. ║ 🔴 1 SLA rojo║

║ 2 │ 4 │ 3 │ 2 │ 3 🔴 │ 1 ║ 🟡 3 PDF \>24h║

║ ║ 🟠 2 sin asig║

╚════════════════════════════════════════════════════╩══════════════╝

**Reglas del patrón P4**

- **Sin editable arriba:** el dashboard nunca contiene formularios. Solo
  KPIs, gráficos, semáforos y tarjetas-link.

- **Filtros mínimos:** rango de fecha (hoy / semana / mes /
  personalizado) y cliente. Otros filtros son ruido.

- **Actualización:** lectura en vivo de Airtable; sin caché agresivo en
  producción. Indicador \"Actualizado hace X seg.\" discreto en una
  esquina.

- **Densidad:** 5 KPIs como máximo en la banda superior; agruparlos si
  son más.

**5.6 P5 · Expediente (tabs)**

Patrón específico de IF-12. Una sola entidad (una solicitud), varias
dimensiones que se navegan por pestañas. Cada pestaña carga una sección
distinta del modelo de datos consolidado. Solo lectura para todos los
roles salvo el administrador, que puede regenerar un PDF antiguo
bit-a-bit.

┌────────────────────── EXPEDIENTE · VP-2026-0524 ─────────────────┐

│ ▣ Cronología ▢ Entrada ▢ IA ▢ Cálculos ▢ Comparables │

│ ▢ Decisión motor ▢ Documentos ▢ Notificaciones ▢ Cambios │

├──────────────────────────────────────────────────────────────────┤

│ contenido de la pestaña activa │

│ (lecturas de A_Eventos / TX_DatosTasacion / TX_Calculos / etc.) │

└──────────────────────────────────────────────────────────────────┘

+-----------------------------------------------------------------------+
| **Por qué solo 5 patrones**                                           |
|                                                                       |
| Si la UI necesita un sexto patrón nuevo para una funcionalidad        |
| concreta, es señal de que esa funcionalidad pertenece a otro IF, no a |
| una nueva forma de mostrar lo mismo. La disciplina de cinco patrones  |
| mantiene el sistema coherente y reduce el costo de mantenimiento: un  |
| cambio en CU-000 (componentes compartidos) se propaga a todas las     |
| pantallas que usan el patrón.                                         |
+-----------------------------------------------------------------------+

**6. Reglas de validación y mensajes humanos**

Toda validación operacional tiene dos capas: la primera en el cliente
(UX rápida · evita re-envíos) y la segunda en Airtable (red de seguridad
· integridad de datos). El mensaje que ve el usuario es siempre humano y
específico, nunca técnico. Esta sección cataloga las validaciones
bloqueantes (sin las cuales no se puede transicionar) y las advertencias
(que permiten continuar pero exigen confirmación).

**6.1 Filosofía del mensaje humano**

- **Claros, no técnicos:** \"Faltan 2 fotos\" en lugar de
  \"validation_error: photos \< 8\".

- **Accionables:** el mensaje debe decir qué hacer para resolverlo, no
  solo qué está mal. \"Sube al menos 8 fotos para enviar la visita\" en
  lugar de \"Fotos insuficientes\".

- **Contextuales:** si el campo está visible, el mensaje va bajo el
  campo. Si depende de varios campos (cuadre m² de E1), el mensaje va al
  pie de la sección.

- **Sin culpar al usuario:** \"Necesitamos el RUT del propietario\" en
  lugar de \"El RUT no es válido\".

- **Tono consistente:** voz en segunda persona singular
  (\"Necesitas...\", \"Falta...\"). Sin signos de exclamación.

**6.2 Catálogo de validaciones bloqueantes**

Validaciones que impiden enviar el formulario o transicionar el estado.
Toda regla aquí listada existe en la Especificación v1.0 (RF/RN) o en el
Diseño de Capa de Datos v2.5.

  ------------------------------------------------------------------------------------
  **Punto de         **Regla (origen oficial)**            **Mensaje humano**
  validación**                                             
  ------------------ ------------------------------------- ---------------------------
  IF-01 · RUT del    Dígito verificador módulo 11 válido   \"Necesitamos el RUT del
  propietario        (RN-15)                               propietario con su dígito
                                                           verificador. Ej.:
                                                           12.345.678-9.\"

  IF-01 · Email de   Formato de email válido               \"Revisa el email de
  contacto                                                 contacto: debe ser de la
                                                           forma nombre@dominio.cl.\"

  IF-01 · Dirección  Mínimo calle + número · debe existir  \"Ingresa la dirección con
                     en M_Comunas                          calle y número. Ej.: Av.
                                                           Apoquindo 5230.\"

  IF-02 · Pasar a    Tasador y visador asignados ·         \"Para pasar a asignada
  asignada           fecha_visita definida (RN-09)         falta: tasador · visador ·
                                                           fecha de visita.\"

  IF-03 · Fotos      Mínimo 8 fotos (RN-12)                \"Faltan 2 fotos para
  mínimas                                                  enviar la visita. Toma al
                                                           menos 8 fotos antes de
                                                           continuar.\"

  IF-03 ·            Sup. terreno y construida \> 0        \"La superficie debe ser
  Superficies        (RB-21)                               mayor a cero.\"

  IF-03 · Año de     Entre 1900 y año actual (RN-13)       \"El año de construcción
  construcción                                             debe estar entre 1900 y
                                                           2026.\"

  IF-03 · Cuadre m²  Σ m² edif. del cuadro E1 = sup.       \"Los m² del cuadro de
  edif. (E1)         construida ±2% (RB-21 / RB-42)        valoración no cuadran con
                                                           la superficie construida.
                                                           Diferencia: 3.5 m² (límite
                                                           2%).\"

  IF-03 · Tamaño     Total ≤ 100 MB (RNF-08)               \"El total de archivos
  total adjuntos                                           supera 100 MB. Comprime las
                                                           fotos o elimina alguna
                                                           antes de enviar.\"

  IF-03 · Ampliación Si TX_Ampliaciones.estado=Regulado,   \"La ampliación marcada
  regulada           n_pe obligatorio (RN-14 v2.3)         como regulada necesita su
                                                           número de permiso de
                                                           edificación (n_pe).\"

  IF-03 · Documentos Mínimo CBR en TX_DocumentosLegales    \"Falta el certificado del
  legales            (RN-14 v2.3)                          Conservador de Bienes
                                                           Raíces (CBR) para enviar la
                                                           visita.\"

  IF-04 · Aprobar    PDF abierto al menos una vez ·        \"Abre el PDF al menos una
  sin abrir PDF      registrado en A_Accesos (RN-18)       vez antes de aprobar.\"

  IF-04 · Devolver   Motivo de devolución de lista cerrada \"Selecciona un motivo para
  sin motivo         obligatorio (RN-19)                   devolver al tasador.\"

  IF-05 · Enviar sin PDF abierto al menos una vez (RN-18)  \"Abre el PDF antes de
  abrir PDF                                                enviar al cliente.\"

  IF-08 · Activar    Test seco superado · integridad       \"Ejecuta el test seco
  regla sin test     referencial (RN-22)                   antes de activar la
  seco                                                     regla.\"

  IF-08 · Más de una Solo una wildcard activa (red de      \"Ya existe una regla
  wildcard           seguridad RN-23)                      wildcard activa.
                                                           Desactívala antes de crear
                                                           otra.\"

  IF-09 · Plantilla  Variables esperadas deben coincidir   \"La plantilla tiene
  con tags huérfanos con el JSON de SC09 (RNF-21)          variables que no existen en
                                                           el JSON: \[lista\]. Revisa
                                                           el .docx antes de
                                                           activar.\"

  IF-09 ·            Solo una plantilla activa por         \"Ya hay una plantilla
  Combinación        cliente+tipo_informe+tipo_propiedad   activa para esta
  duplicada          (RN-24)                               combinación. Desactívala
                                                           antes de activar la
                                                           nueva.\"

  IF-10 · DAG con    C_Formulas.depende_de no debe formar  \"Se detectó un ciclo entre
  ciclo              ciclo (RN-25 v2.2)                    fórmulas: F_X → F_Y → F_X.
                                                           Revisa las dependencias.\"
  ------------------------------------------------------------------------------------

**6.3 Advertencias (no bloqueantes)**

Las advertencias permiten continuar pero exigen una confirmación
explícita o quedan registradas en el expediente. Se renderizan en ámbar
operacional con texto humano que explica el riesgo.

  --------------------------------------------------------------------------------
  **Punto de          **Regla (origen oficial)**           **Mensaje humano**
  advertencia**                                            
  ------------------- ------------------------------------ -----------------------
  IF-03 · Programa    Σ recintos del nivel 1 vs sup.       \"La proporción de
  por nivel           construida del primer piso ·         recintos del primer
                      proporción atípica (v2.3)            nivel se ve atípica
                                                           para la superficie
                                                           construida. Revisa si
                                                           falta o sobra un
                                                           recinto.\"

  IF-03 ·             Faltan algunos de los 5 recintos     \"Faltan terminaciones
  Terminaciones       básicos (Estar · Dormitorios ·       para: Baños. Si no
  faltantes           Circulación · Cocina · Baños)        aplica, déjalo
                                                           registrado en
                                                           observaciones.\"

  IF-04 · Saneamiento TX_DatosTasacion.saneamiento_notas   \"Aplicamos saneamiento
  aplicado            no vacío (v2.2)                      a algunos campos
                                                           (avalúo, RUT). Revisa
                                                           la bitácora antes de
                                                           aprobar.\"

  IF-11 · Desactivar  Cliente con TX_Solicitudes activas   \"Este cliente tiene 18
  cliente con cartera                                      solicitudes en curso.
  viva                                                     Si lo desactivas, no
                                                           podrá crear nuevas,
                                                           pero las en curso
                                                           continuarán.\"

  IF-11 · Bajar SLA   C_SLA.dias se reduce y hay           \"Bajar el SLA a 5 días
  con casos activos   solicitudes activas                  impactará a 7
                                                           solicitudes en curso
                                                           que pasarán a SLA en
                                                           riesgo.\"

  IF-08 · Vigencia    C_ReglasNegocio.vigencia_hasta \< +7 \"Esta regla vence en 5
  temporal por        días                                 días. Si quieres
  terminar                                                 extenderla, actualiza
                                                           la vigencia.\"
  --------------------------------------------------------------------------------

**6.4 Confirmaciones y acuses**

Los acuses positivos son tan importantes como las validaciones:
confirman al usuario que su acción tuvo el efecto esperado. Son sutiles
(toast verde, no modal) y descriptivos.

  ------------------------------------------------------------------------
  **Evento**         **Confirmación visual**     **Confirmación
                                                 complementaria**
  ------------------ --------------------------- -------------------------
  IF-01 · Solicitud  Pantalla de éxito con       Email de acuse al
  enviada            código VP-AAAA-NNNN visible solicitante en ≤2 s con
                     en grande                   el mismo código.

  IF-02 · Solicitud  Toast verde \"Solicitud     Email al tasador (SC05)
  asignada           asignada a R. Pérez\"       con link a IF-03.

  IF-03 · Visita     Toast verde \"Visita        Email no, solo evento
  enviada            enviada --- calculando...\" A_Eventos.
                     y volver a la lista         

  IF-04 · Aprobada   Toast verde \"Aprobada ---  Si requiere F5: badge
                     siguiente caso cargado\"    \"pendiente aprobación
                                                 final\" en IF-06.

  IF-04 · Devuelta   Toast ámbar \"Devuelta al   Email al tasador con el
                     tasador con motivo: ...\"   motivo y observación
                                                 libre.

  IF-05 · Enviada al Toast verde \"Enviada al    Email al cliente (SC13)
  cliente            cliente --- informe v2\"    con el PDF adjunto +
                                                 acuse.

  IF-08 · Regla      Toast púrpura \"Regla       A_Cambios registra autor,
  activada           activada --- próximas       hora y razón.
                     solicitudes la usarán\"     
  ------------------------------------------------------------------------

**6.5 Tono y estilo del mensaje humano**

  -----------------------------------------------------------------------
  **No**                              **Sí**
  ----------------------------------- -----------------------------------
  \"validation_error: rut_invalid\"   \"Necesitamos el RUT del
                                      propietario con su dígito
                                      verificador.\"

  \"Error 422: foto requerida\"       \"Faltan 2 fotos para enviar la
                                      visita.\"

  \"Constraint violation: photos \<   \"Sube al menos 8 fotos antes de
  8\"                                 enviar la visita.\"

  \"Por favor ingrese un RUT          \"Revisa el RUT: el dígito
  válido.\"                           verificador no calza.\"

  \"You must select a return          \"Selecciona un motivo para
  reason.\"                           devolver al tasador.\"

  \"⚠️ ¡ATENCIÓN! Esta acción no se   \"Esta acción cierra la solicitud.
  puede deshacer.\"                   ¿Deseas continuar?\"

  \"PDF must be opened before         \"Abre el PDF al menos una vez
  approval.\"                         antes de aprobar.\"
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **El mensaje humano es contrato, no opinión**                         |
|                                                                       |
| Los textos exactos de los mensajes humanos forman parte de la         |
| especificación: aparecen en los prompts de Claude Code, en los tests  |
| de aceptación y en la documentación de usuario. Cambiarlos requiere   |
| actualizar las tres cosas. Cuando un nuevo IF introduce una           |
| validación nueva, su mensaje humano se redacta antes que el código y  |
| se valida con la ejecutiva antes de cerrar el ticket.                 |
+-----------------------------------------------------------------------+

**7. Fichas detalladas por interfaz**

Esta sección amplía el catálogo de la sección 2 con la ficha
implementable de cada IF: objetivo funcional, diseño visual operacional
(blueprint), tabla campo a campo (origen oficial en la capa de datos),
comportamiento dinámico, automatizaciones relacionadas y mapeo explícito
acción-UI → transición de estado. Toda regla de negocio referida aquí
existe en la Especificación v1.0 o en el Diseño de Datos v2.5.

**7.1 IF-01 · Formulario de solicitud externa (Tipo A · Next.js +
Clerk)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-01 · origen funcional: F1

  Tipo de unidad   A --- IF con código (Next.js 14 + Clerk · Railway)

  Objetivo         Recibir el pedido inicial de tasación con los datos
  operacional      absolutamente mínimos.

  Usuario          Solicitante / Institución (MetLife, Banco Security,
                   BCI, etc.)

  Etapa del        Entrada --- previa a estado «creada»
  workflow         

  Canal /          App Next.js + Clerk en Railway. URL pública del
  tecnología       cliente; la institución se autoidentifica por la URL
                   única.

  Criticidad       Alta --- es la puerta de entrada del sistema.

  Patrón de UI     P3 · Formulario (una columna · mobile-first ·
                   opcionales colapsados).
  -----------------------------------------------------------------------

**Objetivo funcional**

Único punto de contacto del cliente externo con el sistema. La premisa
de diseño es deliberada: pedir lo mínimo y dejar que el motor de reglas
resuelva el resto (plantilla, fórmulas, workflow, asignación). Tiempo
objetivo de completado: menos de 90 segundos, sin scroll innecesario.

**Diseño visual operacional**

┌──────────────────────────────────────────────────────────────────┐

│ \[logo institución\] SOLICITUD DE TASACIÓN · VProperty │

│ Institución: MetLife Chile (autoseleccionada por URL) │

├──────────────────────────────────────────────────────────────────┤

│ DATOS DE LA TASACIÓN │

│ Tipo de informe \[ Hipotecario ▼ \] \*filtrado x cli. │

│ Tipo de propiedad \[ Departamento ▼ \] │

│ Dirección \[ Av. Apoquindo 5230, depto 1502 \] │

│ Comuna \[ Las Condes ▼ \] (autocompletada) │

├──────────────────────────────────────────────────────────────────┤

│ SOLICITANTE FINAL │

│ Nombre propietario \[ Luis Rodríguez \] │

│ RUT propietario \[ 12.345.678-9 \] ✓ dígito verificador │

│ Email contacto \[ contacto@correo.cl \] ✓ formato │

├──────────────────────────────────────────────────────────────────┤

│ ▸ DATOS OPCIONALES (colapsado) │

│ Rol SII · Banco · Producto · Adjuntos PDF · Observaciones │

├──────────────────────────────────────────────────────────────────┤

│ \[ ENVIAR SOLICITUD ▶ \] │

└──────────────────────────────────────────────────────────────────┘

Al enviar ▸ confirmación visual + email de acuse (≤2 s) con

el código VP-AAAA-NNNN

**Campos del formulario**

  ---------------------------------------------------------------------------------------------------
  **Campo**       **Tipo**   **Obl.**   **Origen / tabla**                    **Validación / lógica**
  --------------- ---------- ---------- ------------------------------------- -----------------------
  Institución     Oculto     Sí         M_Clientes                            Resuelto por la URL
                  (URL)                                                       única asignada al
                                                                              cliente.

  Tipo de informe Select     Sí         M_TiposInforme                        Lista filtrada por
                                                                              M_Clientes.productos.

  Tipo de         Select     Sí         M_TiposPropiedad                      Lista cerrada.
  propiedad                                                                   

  Dirección       Texto      Sí         TX_Solicitudes.direccion              Mín. calle + número;
                                                                              sugerencia Google
                                                                              Places.

  Comuna          Select     Sí         M_Comunas                             Autocompletada desde
                                                                              dirección; debe
                                                                              existir.

  Nombre          Texto      Sí         TX_Solicitudes.cliente_final_nombre   ---
  propietario                                                                 

  RUT propietario Texto      Sí         TX_Solicitudes.cliente_final_rut      Dígito verificador
                                                                              validado en tiempo real
                                                                              (RN-15).

  Email contacto  Email      Sí         TX_Solicitudes                        Formato válido.

  Rol SII         Texto      No         TX_Solicitudes.rol_sii                Opcional.

  Banco           Select     No         M_Bancos                              Si aplica.

  Producto        Select     No         M_Productos                           Producto comercial
                                                                              específico.

  Adjuntos PDF    Archivo    No         TX_Adjuntos → Dropbox                 SII / CBR / permisos.

  Observaciones   Texto      No         TX_Solicitudes                        Notas del solicitante.
                  largo                                                       
  ---------------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Filtrado de tipo de informe** según M_Clientes.productos del cliente
  identificado por la URL.

- **Campo de plano condicional:** si M_TiposPropiedad.requiere_plano =
  true, se habilita un campo extra.

- **Campos extra por cliente:** si C_VariablesCliente define un
  formato_solicitud distinto, se muestran campos adicionales.

- **Validación temprana:** RUT, email y dirección se validan en el
  cliente antes de permitir el envío.

**Automatizaciones y transición de estado**

  -------------------------------------------------------------------------
  **Acción de UI**   **Transición**   **Automatización**
  ------------------ ---------------- -------------------------------------
  Enviar solicitud   ∅ → creada       SC01 (webhook Next.js → Make) crea
                                      fila en TX_Solicitudes. AT01 (motor)
                                      y AT02 (asignación) corren en
                                      paralelo en Airtable. Email de acuse
                                      al solicitante en ≤2 s.

  -------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Regla de oro de IF-01**                                             |
|                                                                       |
| Pedir lo mínimo, el sistema completa el resto. Cuanto menor sea la    |
| fricción del formulario, mayor la adopción del canal. Cualquier dato  |
| que el motor pueda inferir o el tasador pueda capturar en terreno NO  |
| se pide aquí.                                                         |
+-----------------------------------------------------------------------+

**7.2 IF-02 · Consola de la ejecutiva comercial (Tipo A · Next.js +
Clerk)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-02 · origen funcional: F2

  Tipo de unidad   A --- IF con código (Next.js 14 + Clerk · Railway)

  Objetivo         Crear solicitudes manuales, completar datos faltantes
  operacional      y vigilar avance y SLA de la cartera.

  Usuario          Ejecutivo comercial.

  Etapa del        Recepción → Asignación
  workflow         

  Canal /          App Next.js + Clerk · layout Lista + Detalle. Lecturas
  tecnología       directas a Airtable API; escrituras de negocio vía
                   webhook Make cuando aplica.

  Criticidad       Alta --- controla la entrada manual y la calidad del
                   dato.

  Patrón de UI     P2 · Lista + Detalle.
  -----------------------------------------------------------------------

**Objetivo funcional**

No todo cliente usa la app Next.js externa: algunos envían por email o
teléfono. Esta consola permite a la ejecutiva crear la solicitud,
completar lo que el cliente aportó y dejar que el motor de reglas haga
el resto. Centraliza la cartera viva en una sola pantalla con estado y
SLA visibles.

**Campos del formulario de detalle**

  -------------------------------------------------------------------------------------------
  **Campo**       **Tipo**   **Obl.**   **Origen / tabla**            **Validación / lógica**
  --------------- ---------- ---------- ----------------------------- -----------------------
  Cliente /       Link       Sí         M_Clientes                    Solo activos.
  institución                                                         

  Tipo de informe Select     Sí         M_TiposInforme                Filtrado por productos
                                                                      del cliente.

  Tipo de         Select     Sí         M_TiposPropiedad              Lista cerrada.
  propiedad                                                           

  Dirección /     Texto /    Sí         TX_Solicitudes / M_Comunas    Comuna existente.
  Comuna          Link                                                

  Solicitante     Texto      Sí         TX_Solicitudes                RUT validado (RN-15).
  final + RUT                                                         

  Tasador         Link       Cond.      M_Tasadores                   Activos,
  asignado                                                            disponible=true, zona
                                                                      compatible. Obligatorio
                                                                      para pasar a asignada.

  Visador         Link       Cond.      M_Visadores                   Especialidad
                                                                      coincidente con
                                                                      tipo_propiedad.

  Fecha estimada  Fecha      Cond.      TX_Solicitudes.fecha_visita   Obligatoria al pasar a
  de visita                                                           asignada.

  Notas internas  Texto      No         TX_Solicitudes                Instrucciones para el
  tasador         largo                                               terreno.

  Notas del       Texto      No         TX_Solicitudes                Contexto para la
  visador         largo                                               revisión.

  origen_canal    Select     Auto       TX_Solicitudes.origen_canal   ingreso_manual en alta
                                                                      interna.
  -------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Selector de tasador inteligente:** solo activos con disponible=true
  y zona compatible; despliega carga (casos_en_curso/capacidad).

- **Bloqueos por estado:** no se puede pasar a asignada sin tasador,
  visador y fecha_visita; ni a visitada sin TX_DatosTasacion; ni a
  pdf_listo sin cálculos completos.

- **Read-only al cerrar:** si la solicitud está cerrada, todos los
  campos quedan de solo lectura.

- **Override de asignación:** una asignación manual sobrescribe AT02
  (queda registrada en A_Eventos y A_Cambios con motivo).

**Automatizaciones y transición de estado**

  ------------------------------------------------------------------------
  **Acción de UI**     **Transición**     **Automatización**
  -------------------- ------------------ --------------------------------
  Crear solicitud      ∅ → creada         AT01 + AT02 corren en Airtable
  (alta interna)                          al insertarse la fila con
                                          origen_canal=ingreso_manual.

  Asignar / reasignar  creada → asignada  AT02 (validación de zona y
  tasador                                 carga) · SC05 (Make → Gmail)
                                          notifica al tasador con link a
                                          IF-03.

  Cancelar solicitud   (cualquier) →      A_Eventos registra cancelación
                       cancelada          con motivo y autor.
  ------------------------------------------------------------------------

**7.3 IF-03 · App de visita del tasador (Tipo A · Next.js + Clerk · PWA
móvil)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-03 · origen funcional: F3

  Tipo de unidad   A --- IF con código (Next.js 14 + Clerk · PWA móvil
                   sobre Railway)

  Objetivo         Capturar en terreno todos los datos de la visita:
  operacional      fotos, medidas, documentos y cuadro de valoración.

  Usuario          Tasador.

  Etapa del        Estado «asignada» → «visitada»
  workflow         

  Canal /          App Next.js + Clerk · PWA mobile-first. Link único por
  tecnología       SC05. Login Clerk en primer acceso.

  Criticidad       Crítica --- alimenta todo el cálculo y la generación
                   documental.

  Patrón de UI     P3 · Formulario multi-sección con acordeón, autosave y
                   subformularios.
  -----------------------------------------------------------------------

**Objetivo funcional**

El tasador recibe un link único al asignarse. Abre la app Next.js en su
celular, hace login con Clerk, llena los datos y sube los archivos. La
API Route sube los archivos a Dropbox (sin pasar por Make, por límite de
tamaño) y dispara el webhook SC06. Componente crítico: subformulario del
cuadro de valoración E1 (TX_ItemsCuadroValoracion). Extensión v2.3
(METLIFE-6283): cuatro subforms adicionales --- E3 Ampliaciones, E4
Programa por nivel, E5 Terminaciones por recinto, E6 Documentos legales.

**Diseño visual operacional (móvil)**

┌────────────────────────────────────┐

│ VISITA · VP-2026-0524 ▓▓▓▓▓░ 78% │ ← progreso + autosave 30s

│ Depto · Las Condes │

├────────────────────────────────────┤

│ A. VISITA │

│ Fecha real visita \[ 17/05/2026 \] │

│ B. MEDIDAS │

│ Sup. terreno m² \[ 95 \] │

│ Sup. construida m² \[ 95 \] \>0 │

│ Año construcción \[ 2018 \] │

│ Estado conservación\[ Bueno ▼ \] │

├────────────────────────────────────┤

│ C. FOTOS (mín. 8) 7/8 ⚠ │

│ \[▣\]\[▣\]\[▣\]\[▣\]\[▣\]\[▣\]\[▣\]\[ + \] │

├────────────────────────────────────┤

│ D. DOCUMENTOS │

│ PDF SII \[ subir \] ✓ │

│ PDF CBR \[ subir \] (si aplica) │

│ Recepción · Permiso · Planos │

├────────────────────────────────────┤

│ E1. CUADRO DE VALORACIÓN (1--15) │

│ ┌ítem 1┐ desc·subtipo·rolSII·m² │

│ │ flags: regularizable·estado │

│ └──────┘ Σ m² edif. = sup constr.│

│ E3 Ampliaciones · E4 Programa │

│ E5 Terminaciones · E6 Legal │

├────────────────────────────────────┤

│ \[ ENVIAR VISITA ▶ \] │

└────────────────────────────────────┘

**Campos del formulario**

  ------------------------------------------------------------------------------------------------------------
  **Campo**       **Tipo**      **Obl.**   **Origen / tabla**                      **Validación / lógica**
  --------------- ------------- ---------- --------------------------------------- ---------------------------
  Fecha real de   Fecha         Sí         TX_Solicitudes.fecha_visita             ---
  visita                                                                           

  Sup. terreno /  Número        Sí         TX_DatosTasacion                        Ambas \> 0 (construcción no
  construida                                                                       en Terreno).

  Año de          Número        Sí         TX_DatosTasacion.anio_construccion      Entre 1900 y año actual.
  construcción                                                                     

  Estado de       Select        Sí         TX_DatosTasacion                        Bueno · Regular · Malo.
  conservación                                                                     

  Calidad         Número        Cond.      TX_DatosTasacion.calidad_construccion   Se cruza con
  construcción                                                                     C_PreciosUnitarios.
  (1--5)                                                                           

  Fotos (mín. 8)  Archivo múlt. Sí         TX_Adjuntos (tipo=foto)                 ≥8 fotos; total ≤100 MB.

  PDF SII / CBR / Archivo       Cond.      TX_Adjuntos                             CBR mínimo obligatorio
  recepción                                                                        (RN-14).

  E1 · Ítems del  Subform 1--15 Sí         TX_ItemsCuadroValoracion                Σ m² edif. cuadra
  cuadro                                                                           (RB-21/42); terraza 0.5
                                                                                   (RB-38).

  Flags por ítem  Select        Sí         TX_ItemsCuadroValoracion                regularizable · estado ·
                                                                                   garantía (RB-4/35/39).

  Hora visita /   Hora          Sí v2.3    TX_Solicitudes.hora_visita/entrega      Planilla madre autoritativa
  Hora entrega                                                                     si difiere (D5).

  Frente /        Número        Sí v2.3    TX_DatosTasacion.terreno_frente_m\...   \> 0 si tipo=Casa/Terreno.
  contrafrente                                                                     

  Forma del       Select        Sí v2.3    TX_DatosTasacion.terreno_forma          Regular · Irregular ·
  terreno                                                                          Triangular · Trapezoidal.

  Pendiente del   Select        Sí v2.3    TX_DatosTasacion.terreno_pendiente      Plano · Suave ·
  terreno                                                                          Pronunciada.

  Sello SEC       Select        Cond. v2.3 TX_DatosTasacion.sello_sec              Verde · Rojo · Amarillo ·
                                                                                   Sin Sello · N/A.

  Comodidades (13 Multi-check   No v2.3    TX_DatosTasacion.\[lista\]              Conjunto cerrado; checkbox
  checks)                                                                          plano.

  Distancias a    Select × 4    Sí v2.3    TX_DatosTasacion.dist\_\*               CERCA · MEDIA · LEJOS.
  servicios                                                                        

  E3 ·            Subform 0--3  No v2.3    TX_Ampliaciones                         Si estado=Regulado, n_pe
  Ampliaciones                                                                     obligatorio (RN-14).

  E4 · Programa   Subform       Sí v2.3    TX_HabitacionesPorNivel                 Niveles permitidos por
  por nivel       matriz                                                           M_TiposPropiedad.layouts.

  E5 ·            Subform 5     Sí v2.3    TX_TerminacionesPorRecinto              Estar · Dormitorios ·
  Terminaciones   filas                                                            Circulación · Cocina ·
  por recinto                                                                      Baños.

  E6 · Documentos Subform 1--3  Sí v2.3    TX_DocumentosLegales                    Mínimo CBR. Prellenable por
  legales                                                                          Claude (SC07).
  ------------------------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Secciones condicionales por tipo de propiedad:** Departamento →
  piso, N° y edificio; Terreno → oculta datos de construcción.

- **Condicional por tipo de informe:** Seguro → solicita datos de
  reconstrucción (materiales, instalaciones).

- **Validación de cuadre:** Σ m² de E1 cuadra con superficie construida
  (RB-21/42); terraza factor 0.5 (RB-38); rol de cada ítem debe existir
  (RB-43).

- **Mobile-first:** controles grandes y de un toque. Compresión
  automática de fotos. Autosave cada 30 s.

**Automatizaciones y transición de estado**

  -------------------------------------------------------------------------
  **Acción de UI**     **Transición**      **Automatización**
  -------------------- ------------------- --------------------------------
  Enviar visita        asignada → visitada API Route sube archivos a
                                           Dropbox y dispara SC06. En
                                           Airtable, el cambio de estado
                                           lanza AT03 (DAG) y SC07 (Claude)
                                           en paralelo. Saneamiento corre
                                           antes. AT04 valida rangos.
                                           Estado destino: calculada.

  Marcar requiere      asignada →          Si saneamiento detecta datos no
  atención (auto)      requiere_atencion   procesables o falla validación,
                                           la solicitud sale del flujo
                                           automático.
  -------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **El tasador nunca toca Airtable**                                    |
|                                                                       |
| Por diseño de seguridad, el tasador opera exclusivamente vía la app   |
| Next.js autenticada con Clerk. Cada API Route valida el JWT antes de  |
| operar y filtra por tasador_id (resuelto desde clerk_user_id). El     |
| tasador no ve datos de otras solicitudes, no puede modificar nada     |
| fuera de su submission y no puede saltarse el flujo. Esto reduce      |
| drásticamente la superficie de error.                                 |
+-----------------------------------------------------------------------+

**7.4 IF-04 · Mesa de revisión del visador (Tipo A · Next.js + Clerk)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-04 · origen funcional: F4

  Tipo de unidad   A --- IF con código (Next.js 14 + Clerk · Railway)

  Objetivo         Revisar PDF y datos extraídos; aprobar, devolver con
  operacional      notas o escalar al administrador.

  Usuario          Revisor / Visador.

  Etapa del        Estado «pdf_listo» → «aprobada» / «devuelta»
  workflow         

  Canal /          App Next.js + Clerk · layout de dos paneles (datos
  tecnología       editables · PDF embebido).

  Criticidad       Crítica --- único control de calidad humano antes del
                   cliente.

  Patrón de UI     P2 · Lista + Detalle (cola del visador · detalle con
                   dos paneles).
  -----------------------------------------------------------------------

**Diseño visual operacional**

┌──────────────────────────────┬───────────────────────────────────┐

│ DATOS · VP-2026-0524 │ PDF · MetLife Hipotec. v2 │

│ estado: PDF_LISTO │ ┌───────────────────────────────┐ │

│ ┌── EXTRACCIÓN IA ─────────┐ │ │ \[ informe.pdf · v2 · 24 pág \] │ │

│ │ Rol SII 1234-56 │ │ │ (visor embebido, scroll) │ │

│ │ Avalúo \$95.000.000 │ │ └───────────────────────────────┘ │

│ │ Sup 95 m² · Año 2018 │ │ ⓘ abrir el PDF ≥1 vez obligatorio │

│ │ Estado: Bueno \[editar\] │ │ para poder aprobar (A_Accesos) │

│ └──────────────────────────┘ │ ┌── DECISIÓN ─────────────────┐ │

│ ┌── SANEAMIENTO ───────────┐ │ │ \[ ✓ APROBAR \] (verde) │ │

│ │ avaluo_no_registra: no │ │ │ \[ ↩ DEVOLVER \] (ámbar) │ │

│ └──────────────────────────┘ │ │ motivo\* \[ ▼ \] + obs. │ │

│ ┌── CÁLCULOS ──────────────┐ │ │ \[ ⚠ ESCALAR A ADMIN \] (rojo)│ │

│ │ UF/m² 95,30 · Com 9054 │ │ └──────────────────────────────┘ │

│ │ Remate UF 5.885 │ │ Atajos: A=aprobar D=devolver │

│ └──────────────────────────┘ │ │

└──────────────────────────────┴────────────────────────────────────┘

**Campos editables del panel de decisión**

  -------------------------------------------------------------------------------------------------------
  **Campo**       **Tipo**     **Obl.**   **Origen / tabla**                      **Validación / lógica**
  --------------- ------------ ---------- --------------------------------------- -----------------------
  Decisión        Select       Sí         TX_Solicitudes.decision_visador         Aprobar · Devolver ·
                                                                                  Escalar.

  Motivo de       Select       Cond.      TX_Solicitudes                          Lista cerrada;
  devolución                                                                      obligatorio si
                                                                                  Devolver.

  Observación     Texto largo  Cond.      TX_Solicitudes                          Acompaña al motivo.
  libre                                                                           

  Síntesis        Texto largo  No         TX_DatosTasacion.sintesis_descriptiva   Ajuste fino del texto
  descriptiva                                                                     de Claude.

  Estado de       Select       No         TX_DatosTasacion                        Ajustable por el
  conservación                                                                    visador.

  Comparables     Subform      No         TX_Comparables                          Agregar o quitar ítems.

  Bitácora de     Texto largo  ---        TX_DatosTasacion.saneamiento_notas      Solo lectura.
  saneamiento     (R)                                                             

  Validación      Validación   Sí         TX_Ampliaciones                         Regulado sin n_pe →
  ampliaciones                                                                    flag rojo, bloquea.
  (v2.3)                                                                          

  Validación      Validación   Sí         TX_DocumentosLegales                    Mínimo CBR.
  documentos                                                                      
  legales                                                                         

  Validación      Validación   Sí v2.3    TX_TerminacionesPorRecinto              Faltan los 5 básicos →
  terminaciones                                                                   warning ámbar.
  -------------------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Bloqueo de aprobación:** no se puede aprobar sin abrir el PDF al
  menos una vez (A_Accesos · RN-18).

- **Motivo obligatorio:** si la decisión es Devolver, motivo de lista
  cerrada de C_MotivosDevolucion (RN-19).

- **Regeneración automática:** cualquier edición de TX_DatosTasacion
  dispara nueva versión del PDF vía SC09.

- **Notificación a Héctor:** si aprueba con observaciones, además se
  notifica a gerencia.

**Automatizaciones y transición de estado**

  ------------------------------------------------------------------------
  **Acción de UI**     **Transición**       **Automatización**
  -------------------- -------------------- ------------------------------
  Aprobar              pdf_listo → aprobada AT06 procesa decisión · AT07
                                            chequea F5 (si la regla lo
                                            exige → pendiente_final; si no
                                            → entrega directa SC13).

  Devolver             pdf_listo → devuelta AT06 procesa · AT02 reasigna
                       → asignada           al tasador con motivo. SC05
                                            notifica al tasador.

  Escalar a admin      pdf_listo →          A_Eventos + alerta inmediata
                       requiere_atencion    al admin (AT08/SC13).

  Editar datos         (sin transición ·    SC09 regenera PDF · versión
                       regenera)            anterior es_vigente=false.
  ------------------------------------------------------------------------

**7.5 IF-05 · Aprobación final (Tipo B · Airtable Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-05 · origen funcional: F5

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces · pantalla
                   única optimizada para móvil)

  Objetivo         Última puerta antes del envío al cliente, solo para
  operacional      casos sensibles marcados por regla.

  Usuario          Supervisor / Gerencia (Héctor).

  Etapa del        Estado «pendiente_final» → «entregada» / «devuelta»
  workflow         

  Canal /          Airtable Interfaces · Record review compacto.
  tecnología       

  Criticidad       Media-Alta --- alto impacto reputacional, bajo
                   volumen.

  Patrón de UI     P3 · Formulario single-page con resumen y dos botones.
  -----------------------------------------------------------------------

**Objetivo funcional**

No todas las solicitudes pasan por aquí: solo las que el motor de reglas
marca como \"requiere aprobación final\" (valor \> 10.000 UF, cliente
nuevo, primera tasación con esa plantilla --- RN-26). El resto se envía
automáticamente tras la aprobación del visador.

**Diseño visual operacional**

┌──────────────────────────────────────────────────────────┐

│ APROBACIÓN FINAL · VP-2026-0524 valor 9.054 UF │

│ Cliente NUEVO ⚑ · regla exige F5 │

├──────────────────────────────────────────────────────────┤

│ Resumen: Depto · Las Condes · Hipotecario │

│ Valor comercial UF 9.054 · Remate UF 5.885 │

│ Visador: María Soto · aprobado 09:15 ✓ │

│ PDF: informe v2 · 24 pág \[ abrir \] │

│ \[ Ver historial completo (A_Eventos) ▾ \] │

├──────────────────────────────────────────────────────────┤

│ Comentario interno (opcional) \[ \...\...\...\...\...\..... \] │

│ \[ ENVIAR AL CLIENTE ▶ \] \[ DEVOLVER PARA AJUSTES \]│

└──────────────────────────────────────────────────────────┘

**Automatizaciones y transición de estado**

  ------------------------------------------------------------------------
  **Acción de UI**     **Transición**       **Automatización**
  -------------------- -------------------- ------------------------------
  Enviar al cliente    pendiente_final →    SC13 (Make → Gmail con el PDF
                       entregada            al cliente) ·
                                            TX_Notificaciones · A_Eventos.

  Devolver para        pendiente_final →    AT02 reasigna al tasador con
  ajustes              devuelta → asignada  motivo · SC05 notifica al
                                            tasador.
  ------------------------------------------------------------------------

**7.6 IF-06 · Centro operacional (Tipo B · Airtable Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-06

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces ·
                   Dashboard + Kanban + Timeline)

  Objetivo         Visibilidad en tiempo real del estado de toda la
  operacional      operación: cola, SLA, estados, KPIs.

  Usuario          Ejecutivo · Supervisor · Backoffice.

  Etapa del        Transversal.
  workflow         

  Patrón de UI     P4 · Dashboard combinado con Kanban (cola → detalle al
                   hacer clic).

  Criticidad       Alta --- panel de mando diario del equipo.
  -----------------------------------------------------------------------

**Diseño visual operacional**

╔════════════════ CENTRO OPERACIONAL · VPROPERTY ═══════════════════╗

║ KPIs (30 d): ⏱ Entrega \<48h 82% │ ↩ Devolución 7% │ ✉ 0 reclamos ║

║ 🟢 Disponibilidad 99.7% │ ➕ Alta cliente 41 min ║

╠══════════════════════════════ COLA POR ESTADO (Kanban) ═══════════╣

║ CREADA│ASIGNADA│VISITADA│CALCULADA│PDF_LISTO│APROBADA│ENTREGADA ║

║ ▢▢ │ ▢▢▢▢ │ ▢▢▢ │ ▢▢ │ ▢▢▢ 🔴 │ ▢ │ ▢▢▢ ║

║ │ │ │ │ \>24h ⚠ │ │ ║

╠════════════════════════════════════════╦══════════════════════════╣

║ TIMELINE SLA (próximos vencimientos) ║ ALERTAS ║

║ VP-0519 Vitacura ███████░ hoy 🔴 ║ • 1 SLA rojo ║

║ VP-0521 Ñuñoa █████░░░ 1 d 🟡 ║ • 3 PDF sin entregar ║

║ VP-0524 Las Condes ██░░░░░ 3 d 🟢 ║ • 2 sin asignar ║

╚════════════════════════════════════════╩══════════════════════════╝

No cambia estados directamente: observación y navegación. Al hacer clic
en una tarjeta abre IF-02 o IF-12 según el rol. Las vistas que lo
alimentan (SLA en riesgo, Documentos sin entregar, etc.) se especifican
en la sección 10 (Dashboards operacionales).

**7.7 IF-07 · Salud de automatizaciones (Tipo B · Airtable Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-07

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces ·
                   Dashboard)

  Objetivo         Auto-monitoreo: errores, reintentos, tasa de éxito por
  operacional      SC y AT.

  Usuario          Administrador · Operador.

  Etapa del        Transversal.
  workflow         

  Patrón de UI     P4 · Dashboard sobre A_ErroresMake y Z\_\*.

  Criticidad       Alta --- el sistema se auto-monitorea; sin equipo de
                   monitoreo dedicado.
  -----------------------------------------------------------------------

**Diseño visual operacional**

┌──────────── SALUD DE AUTOMATIZACIONES ────────────────────────┐

│ Escenarios (tasa éxito 30d): │

│ AT01 ✅100 AT03 ✅99.8 AT07 ✅100 │

│ SC07 🟡96.2 SC09 ✅99.1 SC13 ✅100 │

│ ▸ SC07 (Claude) bajo umbral 98% → revisar reintentos │

├───────────────────────────────────────────────────────────────┤

│ ERRORES CRÍTICOS SIN RESOLVER A_ErroresMake │

│ ⛔ SC09 plantilla no encontrada · VP-0519 · hace 12 min │

│ reintentos 0/0 · CRITICAL · \[ resolver \] \[ escalar \] │

├───────────────────────────────────────────────────────────────┤

│ COLA DE PENDIENTES Z_ColaPendientes │

│ • VP-0521 esperando respuesta_visador · reactivar 14:00 │

│ • VP-0510 webhook caído · reintento ∞ cada 1 min │

└───────────────────────────────────────────────────────────────┘

Resolver un error escribe en A_ErroresMake.estado (resuelto/escalado) y
deja traza en A_Eventos. Las alertas automáticas (AT08 + SC13) y los
umbrales se detallan en la sección 11 (Alertas y validaciones).

**7.8 IF-08 · Consola de reglas de negocio (Tipo B · Airtable
Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-08 · origen funcional: F8

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces · editor
                   de filtros multi-select sobre C_ReglasNegocio)

  Objetivo         Crear, probar y activar reglas del motor: cambiar el
  operacional      comportamiento del sistema sin tocar Make.

  Usuario          Parametrizador / Analista funcional · Administrador.

  Etapa del        Configuración --- fuera del flujo de solicitudes.
  workflow         

  Patrón de UI     P3 · Formulario con chips multi-select y test seco
                   como puerta de activación.

  Criticidad       Máxima --- un cambio aquí altera cómo se procesan las
                   próximas solicitudes.
  -----------------------------------------------------------------------

**Objetivo funcional**

Es el formulario más delicado del sistema. Cada regla mapea un contexto
(cliente + tipo + propiedad + banco + comuna) a un resultado
(plantilla + fórmulas + workflow). Tiene el mayor nivel de validación
previa y un paso de \"test seco\" obligatorio antes de activar. En v2.5
las reglas las consume AT01 (no Make): los cambios impactan a la
siguiente solicitud que entra en estado creada.

**Diseño visual operacional**

┌────────────────────── REGLA DE NEGOCIO ───────────────────────────┐

│ Nombre \[ MetLife · Hipotec · Depto Las Condes \] prioridad \[100\] │

│ ┌── FILTROS (chips multi-select) ─────────────────────────────┐ │

│ │ Cliente: \[MetLife ✕\] │ │

│ │ T.Informe: \[Hipotecario ✕\] │ │

│ │ T.Propied: \[Departamento ✕\] │ │

│ │ Comuna: \[Las Condes ✕\]\[Vitacura ✕\]\[Lo Barnechea ✕\] │ │

│ │ Banco: (vacío = cualquiera) │ │

│ └─────────────────────────────────────────────────────────────┘ │

│ ┌── RESULTADO ────────────────────────────────────────────────┐ │

│ │ Plantilla: \[ MetLife Hipotec. Premium v1 ▼ \] ✓ activa │ │

│ │ Fórmulas: \[F_UFm2_terr\]\[F_UFm2_const\]\[F_Comercial\]\[F_Rem65\]│
│

│ │ Workflow: \[ WF_Hipotec_Premium ▼ \] ✓ activo │ │

│ └─────────────────────────────────────────────────────────────┘ │

│ especificidad: 4 · vigencia: \[desde\]---\[hasta\] │

│ ┌── COMPETENCIA ──────────────────────────────────────────────┐ │

│ │ #45 MetLife Genérica (esp.1) · #46 MetLife Hipotec (esp.2) │ │

│ │ → esta regla GANA por mayor especificidad │ │

│ └─────────────────────────────────────────────────────────────┘ │

│ \[ ▶ TEST SECO (obligatorio) \] activa ☐ → ☑ (tras test) │

└───────────────────────────────────────────────────────────────────┘

**Campos del formulario**

  ------------------------------------------------------------------------------------------
  **Campo**       **Tipo**   **Obl.**   **Origen / tabla**           **Validación / lógica**
  --------------- ---------- ---------- ---------------------------- -----------------------
  Nombre de la    Texto      Sí         C_ReglasNegocio.nombre       Descriptivo y único.
  regla                                                              

  Filtros (5      Link multi Cond.      C_ReglasNegocio.\*\_filter   Al menos uno, salvo la
  dimensiones)                                                       wildcard.

  Plantilla       Link       Sí         C_Plantillas                 Debe estar activa.
  resultado                                                          

  Fórmulas        Link multi Sí         C_Formulas                   Todas activas.
  resultado                                                          

  Workflow        Link       Sí         C_Workflows                  Debe estar activo.
  resultado                                                          

  Prioridad       Número     Sí         C_ReglasNegocio.prioridad    Entre 1 y 999;
                                                                     desempata.

  Vigencia        Fecha      No         C_ReglasNegocio              Excepciones temporales
  desde/hasta                                                        auto-desactivables.

  Activa          Checkbox   Sí         C_ReglasNegocio.activa       Solo tras superar el
                                                                     test seco.
  ------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Solo una wildcard activa:** se valida que exista exactamente una
  regla con todos los filtros vacíos (red de seguridad).

- **Integridad referencial:** plantilla, fórmulas y workflow
  referenciados deben estar activos.

- **Test seco obligatorio:** el sistema ejecuta el motor contra 10
  solicitudes recientes que matchearían la regla; solo entonces se
  permite activar.

- **Auditoría de cambios:** todo cambio queda en A_Cambios con autor y
  razón.

+-----------------------------------------------------------------------+
| **Cambiar comportamiento = agregar una fila**                         |
|                                                                       |
| Crear una regla de excepción para una campaña, cambiar la plantilla   |
| de un cliente o agregar un nuevo eje de decisión nunca implica abrir  |
| Make ni modificar una pantalla. Solo se edita C_ReglasNegocio. El     |
| sistema respeta el principio Open/Closed.                             |
+-----------------------------------------------------------------------+

**7.9 IF-09 · Gestión de plantillas Carbone (Tipo B · Airtable
Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-09 · origen funcional: F7

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces sobre
                   C_Plantillas + Dropbox)

  Objetivo         Subir, versionar y activar plantillas .docx de Carbone
  operacional      que generan los informes.

  Usuario          Administrador del sistema.

  Etapa del        Configuración.
  workflow         

  Patrón de UI     P2 · Lista + Detalle con comparador y prueba dummy.

  Criticidad       Alta --- un error de plantilla detiene la generación
                   de PDFs.
  -----------------------------------------------------------------------

**Objetivo funcional**

Cuando un cliente pide cambios en su informe, se edita el .docx en Word,
se sube a Dropbox y se registra una nueva versión en C_Plantillas; la
anterior se mueve a H_PlantillasAnteriores. Garantiza reproducibilidad
bit-a-bit a 10 años (RNF-21).

**Diseño visual operacional**

┌──────────────── PLANTILLAS CARBONE ──────────────────────────────┐

│ \[ + Subir nueva versión \] │

│ ┌─ MetLife Hipotec. Premium ──────────────────────────────────┐ │

│ │ v1 activa ✓ vigente desde 01/04/26 │ │

│ │ archivo: \.../metlife_hipotec_premium_v1.docx (Dropbox) │ │

│ │ variables esperadas: ✓ validadas contra JSON de Make │ │

│ │ en curso con esta plantilla: 6 solicitudes │ │

│ │ \[ comparar vN-1 │ vN \] \[ prueba dummy \] \[ ver historial \] │ │

│ └──────────────────────────────────────────────────────────────┘ │

│ ⓘ No puede haber 2 plantillas activas para misma combinación │

│ cliente + tipo_informe + tipo_propiedad │

└───────────────────────────────────────────────────────────────────┘

**Campos del formulario**

  --------------------------------------------------------------------------------------------------
  **Campo**       **Tipo**     **Obl.**   **Origen / tabla**                 **Validación / lógica**
  --------------- ------------ ---------- ---------------------------------- -----------------------
  Nombre /        Texto·Link   Sí         C_Plantillas                       Combinación única
  cliente / tipos                                                            activa.

  Versión         Texto        Sí         C_Plantillas.version               Patrón vN.M.

  URL .docx       URL          Sí         C_Plantillas.archivo_docx_url      Apunta a un .docx
  (Dropbox)                                                                  existente.

  Variables       Texto largo  No         C_Plantillas.variables_esperadas   Schema que valida el
  esperadas                                                                  JSON de Make.
  (JSON)                                                                     

  Notas de        Texto largo  No         C_Plantillas.cambios_version       Changelog para
  cambios                                                                    auditoría.

  Activa          Checkbox     Sí         C_Plantillas.activa                Una sola por
                                                                             combinación.
  --------------------------------------------------------------------------------------------------

**Comportamiento dinámico**

- **Validación de variables:** antes de activar, se comprueba que el
  JSON de Make contenga todas las variables que la plantilla espera y
  que no haya tags huérfanos.

- **Versionado automático:** al activar, la anterior se mueve a
  H_PlantillasAnteriores y se desactiva.

- **Prueba previa:** el sistema corre una prueba con datos dummy y
  muestra una vista previa antes de activar.

**7.10 IF-10 · Fórmulas y motor de ejecución (DAG) (Tipo B · Airtable
Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-10

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces sobre
                   C_Formulas con campos DAG)

  Objetivo         Gestionar el catálogo de fórmulas y su orden de
  operacional      ejecución (DAG).

  Usuario          Parametrizador / Analista funcional · Administrador.

  Etapa del        Configuración.
  workflow         

  Patrón de UI     P3 · Formulario + P4 · Dashboard (vista grafo del
                   DAG).

  Criticidad       Máxima --- la cadena de \~15 cálculos encadenados
                   sustenta toda valoración.
  -----------------------------------------------------------------------

**Objetivo funcional**

Materializa el Motor de Ejecución de Fórmulas (capa 3.5). Cada fórmula
declara de qué otras depende (depende_de) y su orden topológico; el
motor resuelve el DAG, detecta ciclos y ejecuta la cadena de forma
determinista. La secuencia es dato, no código. Implementación v2.5:
AT03_ejecutar_dag_formulas, sort topológico en JavaScript nativo de
Airtable Scripting. Make no interviene.

**Diseño visual operacional**

┌──────────── FÓRMULAS · MOTOR DE EJECUCIÓN (DAG) ──────────────────┐

│ ORDEN FÓRMULA EXPRESIÓN DEPENDE_DE │

│ 1 F_UFm2_terreno lookup C_PreciosUnit --- │

│ 2 F_UFm2_construccion f(calidad, vida_util) --- │

│ 3 F_ValorTerreno sup_terr \* uf_m2_terr 1 │

│ 4 F_ValorConstruccion sup_const \* uf_m2_con 2 │

│ 5 F_ValorComercial valTerr + valConst 3,4 │

│ 6 F_ValorRemate_65 valComercial \* 0.65 5 ★ terminal │

│ \... (≈11 pasos verificados, orden topológico) │

│ ⚠ detección de ciclos activa · ejecución determinista │

│ \[ + nueva fórmula \] \[ validar DAG \] \[ ver grupos de cálculo \] │

└───────────────────────────────────────────────────────────────────┘

**Campos del formulario**

  -------------------------------------------------------------------------------------------
  **Campo**          **Tipo**       **Obl.**   **Origen / tabla**     **Validación / lógica**
  ------------------ -------------- ---------- ---------------------- -----------------------
  Nombre / categoría Texto·Select   Sí         C_Formulas             Valoración · UF/m² ·
                                                                      Seguro · Avalúo.

  Expresión          Texto largo    Sí         C_Formulas.expresion   Declarativa (p. ej.
                                                                      valor_comercial \*
                                                                      0.65).

  variables_input /  JSON·Texto     Sí         C_Formulas             Entradas y nombre de
  output                                                              salida en TX_Calculos.

  depende_de         Link multi     Cond.      C_Formulas (DAG)       Fórmulas predecesoras
                                                                      (v2.2).

  orden_topologico   Número         Auto       C_Formulas             Calculado por sort
                                                                      topológico.

  Activa             Checkbox       Sí         C_Formulas.activa      Solo tras superar
                                                                      validación de DAG.
  -------------------------------------------------------------------------------------------

**7.11 IF-11 · Administración de clientes y SLA (Tipo B · Airtable
Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-11 · origen funcional: F6

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces sobre
                   M_Clientes, C_SLA, C_VariablesCliente)

  Objetivo         Incorporar y mantener clientes sin tocar Make ni
  operacional      Carbone.

  Usuario          Administrador del sistema.

  Etapa del        Configuración.
  workflow         

  Patrón de UI     P2 · Lista + Detalle con búsqueda y avisos de impacto.

  Criticidad       Alta --- afecta a todas las solicitudes futuras del
                   cliente.
  -----------------------------------------------------------------------

**Diseño visual operacional**

┌──────────────── CLIENTES & SLA ──────────────────────────────────┐

│ \[buscar nombre/RUT\...\] \[ + Cliente \]\[ Clonar \] │

│ ┌─ MetLife Chile · 97.030.000-7 · Cía. de seguros ───────────┐ │

│ │ contacto: \... · email: \... · SLA: 7 días │ │

│ │ productos: \[Hipotecario\]\[Seguro incendio\] │ │

│ │ tasa_cap_rate: 4,5% variables: logo_url, pie_legal │ │

│ │ en curso: 18 solicitudes · activo ☑ │ │

│ └─────────────────────────────────────────────────────────────┘ │

│ ⚠ al desactivar: avisa cuántas solicitudes en curso tiene │

│ ⚠ al bajar SLA: avisa impacto en solicitudes activas │

└───────────────────────────────────────────────────────────────────┘

**Campos del formulario**

  ---------------------------------------------------------------------------------------------
  **Campo**       **Tipo**       **Obl.**   **Origen / tabla**          **Validación / lógica**
  --------------- -------------- ---------- --------------------------- -----------------------
  Nombre / RUT /  Texto·Select   Sí         M_Clientes                  RUT único.
  tipo                                                                  

  Email de        Email          Sí         M_Clientes.email_contacto   Acuses y entregas.
  contacto                                                              

  SLA días        Número         Sí         M_Clientes.sla_dias / C_SLA Entre 1 y 30.

  Productos       Link multi     No         M_Productos                 Filtran IF-01.

  tasa_cap_rate   Número         Cond.      M_Clientes (v2.2)           Por cliente (Caspana
                                                                        4,5% · Agencia 6,0%).

  Variables de    Subform        No         C_VariablesCliente          logo_url, pie_legal,
  cliente                                                               etc.

  Activo          Checkbox       Sí         M_Clientes.activo           Solo activos aparecen
                                                                        en formularios.
  ---------------------------------------------------------------------------------------------

**7.12 IF-12 · Expediente 360° (Tipo B · Airtable Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-12

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces · Record
                   review con tabs)

  Objetivo         Reconstruir en una sola vista todo lo ocurrido con una
  operacional      solicitud (trazabilidad total).

  Usuario          Todos los roles, según permiso (auditor en solo
                   lectura).

  Etapa del        Transversal.
  workflow         

  Patrón de UI     P5 · Expediente con tabs por dominio.

  Criticidad       Alta --- soporte legal y respuesta a
                   clientes/reguladores.
  -----------------------------------------------------------------------

**Objetivo funcional**

Reúne cronología (A_Eventos), datos de entrada (TX_Solicitudes),
extracción IA con fuentes (TX_DatosTasacion), cada cálculo con su
fórmula y versión (TX_Calculos), comparables, regla aplicada
(A_DecisionesMotor), todos los PDFs (TX_DocumentosGenerados),
notificaciones y cambios humanos. Extensión v2.3: cuatro pestañas para
tablas hijas: Ampliaciones, Programa, Terminaciones, Legal.

**Diseño visual operacional**

┌──────────────── EXPEDIENTE · VP-2026-0524 ────────────────────────┐

│
\[Cronología\]\[Entrada\]\[IA\]\[Cálculos\]\[Comparables\]\[Motor\]\[Docs\]
│

│
\[Notificaciones\]\[Cambios\]\[Ampliaciones\]\[Programa\]\[Terminac\]\[Legal\]│

│ ── CRONOLOGÍA (A_Eventos) ────────────────────────────────────── │

│ 14:23 solicitud_creada (cliente MetLife) │

│ 14:23 regla #47 ganó (esp.4) → A_DecisionesMotor #5678 │

│ 14:23 tasador asignado R. Pérez (AT02) │

│ 16:40 visita completada (SC06) · 12 fotos + 3 PDF │

│ 16:41 IA extrae rol/avalúo/sup (SC07) · saneamiento: ok │

│ 16:41 4 fórmulas aplicadas (AT03) → TX_Calculos │

│ 16:42 PDF v1 generado (SC09) · 24 pág │

│ 09:15 visador aprueba · PDF v2 │

│ 09:16 entregado al cliente (SC13) │

│ ── DECISIÓN DEL MOTOR ────────────────────────────────────────── │

│ candidatas: #45,#46,#47 · ganadora #47 · razón: mayor especif. │

└───────────────────────────────────────────────────────────────────┘

**Comportamiento dinámico**

- **Filtro por permiso:** el visador ve solo sus solicitudes; el auditor
  todas en solo lectura; el tasador no accede.

- **Reproducción documental:** permite regenerar un PDF antiguo idéntico
  usando la plantilla y fórmulas congeladas (H\_\*).

- **Auditoría de accesos:** toda apertura se registra en A_Accesos
  (autor, IP, navegador).

**7.13 IF-13 · Auditoría, accesos y trazabilidad (Tipo B · Airtable
Interfaces)**

  -----------------------------------------------------------------------
  **Información    **Valor**
  general**        
  ---------------- ------------------------------------------------------
  Código           IF-13

  Tipo de unidad   B --- IF de plataforma (Airtable Interfaces · Grids
                   filtrables sobre tablas A\_\*)

  Objetivo         Vistas de auditoría de seguridad y compliance sobre
  operacional      eventos, accesos, cambios y decisiones.

  Usuario          Auditor (solo lectura) · Administrador.

  Etapa del        Transversal.
  workflow         

  Patrón de UI     P1 · Lista filtrable con tabs por tabla de auditoría.

  Criticidad       Alta --- respaldo de compliance y seguridad.
  -----------------------------------------------------------------------

**Objetivo funcional**

Responde preguntas de auditoría sin esfuerzo: quién cambió un SLA y
cuándo, quién accedió a una solicitud sensible, por qué el motor eligió
una plantilla y no otra, qué fallos hubo en Make. Append-only: estos
registros nunca se editan ni se borran.

**Diseño visual operacional**

┌──────────────── AUDITORÍA & ACCESOS ──────────────────────────────┐

│ \[A_Eventos\]\[A_Accesos\]\[A_Cambios\]\[A_DecisionesMotor\] filtros ▾
│

│ ── A_Cambios (ejemplo) ────────────────────────────────────────── │

│ M_Clientes·Security·sla_dias 5→7 por admin@vp · 12/05 · razón...│

│ ── A_Accesos (seguridad) ──────────────────────────────────────── │

│ usuario@vp vio TX_Solicitudes#0519 · IP · navegador │

│ ⚑ vista: accesos a solicitudes fuera de permiso │

│ \[ exportar a Dropbox /archivos/ (retención) \] │

└───────────────────────────────────────────────────────────────────┘

**Comportamiento dinámico**

- **Solo lectura para auditores:** el rol auditor no puede escribir en
  ninguna tabla.

- **Retención y purga:** A_Eventos 12 m, A_DecisionesMotor 24 m,
  A_Cambios indefinido, A_ErroresMake 6 m, A_Accesos 12 m; AT10 exporta
  a Dropbox antes de purgar (vía SC16).

**7.14 IF-14 · Administración paramétrica de documentos (Tipo B ·
Airtable Interfaces)**

  ---------------------- ------------------------------------------------
  **Información          **Valor**
  general**              

  Código                 IF-14 · origen funcional: dominio paramétrico de
                         documentos

  Tipo de unidad         B --- IF de plataforma (Airtable Interfaces
                         sobre la base VProperty_Tasaciones)

  Objetivo operacional   Dar de alta, modificar y desactivar tipos de
                         documento, atributos y catálogos cerrados sin
                         programador y sin DDL.

  Usuario                Administrador.

  Etapa del workflow     Configuración (transversal · no opera la state
                         machine de tasaciones).

  Canal / tecnología     Airtable Interfaces sobre las 8 tablas D\_. Sin
                         link record hacia el resto de los dominios.

  Criticidad             Alta --- controla el comportamiento dinámico de
                         IF-15. Un error en la definición de un atributo
                         obligatorio impacta de inmediato a la ejecutiva.

  Patrón de UI           P3 · Formulario + P1 · Lista filtrable (uno por
                         tabla).
  ---------------------- ------------------------------------------------

**Objetivo funcional**

El administrador necesita habilitar nuevos tipos de documento que la
ejecutiva podrá solicitar (p. ej. certificado de informaciones previas,
informe de no expropiación SERVIU, sello verde SEC) sin esperar a un
deploy. Esta interfaz expone las 8 tablas D\_ como formularios
administrables: una vista por tabla, edición record-by-record,
validaciones nativas de Airtable. El motor de tasaciones nunca consulta
estas tablas, por diseño.

**Campos del formulario (visión consolidada)**

  --------------------- ---------- ---------- ------------------------------------- -----------------------
  **Campo**             **Tipo**   **Obl.**   **Origen / tabla**                    **Validación / lógica**

  Tipo de documento ·   Texto      Sí         D_TipoDocumento.codigo                Único. snake_case sin
  código                                                                            espacios.

  Tipo de documento ·   Texto      Sí         D_TipoDocumento.nombre                Etiqueta legible.
  nombre                                                                            

  Tipo de documento ·   Texto      Sí         D_TipoDocumento.entidad_emisora       SII, DOM, TGR, SEC,
  entidad emisora                                                                   CBR, Notaría, SERVIU...

  Tipo de documento ·   Número     No         D_TipoDocumento.vigencia_dias         \>= 0 o vacío = sin
  vigencia (días)                                                                   vencimiento.

  Atributo · código     Texto      Sí         D_Atributo.codigo                     Único. Reutilizable
                                                                                    entre tipos.

  Atributo · tipo de    Single     Sí         D_Atributo.tipo_dato                  Link a D_TipoDato.
  dato                  select /                                                    Define en qué columna
                        Link                                                        se persiste.

  Atributo · catálogo   Link       Cond.      D_Atributo.catalogo                   Obligatorio si
  asociado                                                                          tipo_dato='catalogo'.
                                                                                    Vacío en el resto.

  Atributo ·            Checkbox   No         D_Atributo.usado_motor_calculo        Flag informativo. NO
  usado_motor_calculo                                                               dispara consumo
                                                                                    automático en este
                                                                                    dominio desacoplado.

  Relación ·            Checkbox   Sí         D_TipoDocumentoAtributo.obligatorio   Define si bloquea el
  obligatorio                                                                       guardado en IF-15.

  Relación · orden      Número     No         D_TipoDocumentoAtributo.orden         Orden de presentación
                                                                                    en IF-15.

  Catálogo · valor      Texto      Sí         D_CatalogoValor.valor                 Valor visible al
                                                                                    usuario. activo=true
                                                                                    para que aparezca en
                                                                                    IF-15.
  --------------------- ---------- ---------- ------------------------------------- -----------------------

**Comportamiento dinámico**

· Vistas filtradas pre-construidas: \"Tipos activos\", \"Atributos input
del motor (informativo)\", \"Catálogos con valores vencidos\", \"Tipos
sin atributos asociados\" (estado problemático que bloquea IF-15).

· Validaciones nativas Airtable: campos requeridos por tipo, formato
regex en patron_validacion, unicidad en código.

· Banner permanente en la interfaz: \"Cambios aquí impactan IF-15 de
inmediato. Para tipos con documentos cargados, desactivar atributos
obligatorios puede dejar documentos históricos con flags de
incompletitud --- usar con cuidado.\"

**Automatizaciones y transición de estado**

  ----------------------- ----------------------- -----------------------
  **Acción de UI**        **Transición**          **Automatización**

  Crear tipo de documento ∅                       Sin disparo a Make.
                                                  Airtable Automation
                                                  AT-D02 verifica que el
                                                  código sea único y
                                                  snake_case.

  Asociar atributo a tipo ∅                       AT-D03 verifica que el
                                                  atributo exista y que
                                                  la combinación (tipo,
                                                  atributo) sea única.

  Desactivar valor de     ∅                       Soft-delete. Documentos
  catálogo                                        históricos que lo
                                                  referencien permanecen
                                                  intactos; IF-15 deja de
                                                  ofrecerlo.
  ----------------------- ----------------------- -----------------------

**7.15 IF-15 · Captura de documentos opcionales por la ejecutiva (Tipo B
· Airtable Interfaces)**

  ---------------------- ------------------------------------------------
  **Información          **Valor**
  general**              

  Código                 IF-15 · origen funcional: dominio paramétrico de
                         documentos

  Tipo de unidad         B --- IF de plataforma (Airtable Interfaces
                         sobre la base VProperty_Tasaciones)

  Objetivo operacional   Permitir a la ejecutiva comercial cargar
                         instancias de documento de los tipos definidos
                         por el administrador, completando los atributos
                         exigidos por cada tipo.

  Usuario                Ejecutivo comercial · Backoffice.

  Etapa del workflow     Captura documental (transversal · no opera la
                         state machine de tasaciones).

  Canal / tecnología     Airtable Interfaces. Formulario dinámico
                         construido a partir de D_TipoDocumentoAtributo.
                         Sin link record hacia TX_Solicitudes ni a otros
                         dominios.

  Criticidad             Media --- los documentos cargados aquí no son
                         inputs del motor de tasación. Sirven para
                         gestión documental autónoma.

  Patrón de UI           P2 · Lista + Detalle.
  ---------------------- ------------------------------------------------

**Objetivo funcional**

La ejecutiva selecciona un tipo de documento del catálogo (lo elige de
D_TipoDocumento.activo=true) y completa los atributos que el
administrador definió para ese tipo. Los atributos obligatorios bloquean
el guardado; los opcionales pueden quedar vacíos. Cada documento queda
como una instancia D_Documento con N filas asociadas en
D_DocumentoValorAtributo, una por cada atributo capturado. El archivo
físico se sube a Dropbox y queda solo el índice (URL) en la tabla.

**Campos del formulario (visión consolidada)**

  ---------------- ---------- ---------- ------------------------------ -------------------------
  **Campo**        **Tipo**   **Obl.**   **Origen / tabla**             **Validación / lógica**

  Tipo de          Link       Sí         D_Documento.tipo_documento →   Solo activos. Determina
  documento                              D_TipoDocumento                los atributos que
                                                                        aparecerán dinámicamente.

  Código de        Texto      Sí         D_Documento.codigo_documento   Único. Convención
  documento                                                             corporativa (TBD).

  Nombre del       Texto      No         D_Documento.nombre_archivo     Auto-poblado al subir el
  archivo                                                               archivo.

  Archivo          URL        No         D_Documento.ruta_archivo       Subida vía conector
  (Dropbox)                                                             Dropbox de Airtable.

  Fecha de emisión Fecha      Cond.      D_Documento.fecha_emision      Obligatorio si
                                                                        vigencia_dias del tipo no
                                                                        es nula.

  Estado           Single     Sí         D_Documento.estado             vigente · vencido ·
                   select                                               observado · anulado.
                                                                        Cálculo automático
                                                                        posible vs
                                                                        fecha_emision +
                                                                        vigencia_dias.

  Hash del archivo Texto      No         D_Documento.hash_archivo       SHA-256, auto-calculado
                                                                        en la subida si el
                                                                        conector lo permite.

  Atributos        Múltiple   Cond.      D_DocumentoValorAtributo       El conjunto y
  dinámicos del    (depende                                             obligatoriedad se
  tipo             del tipo)                                            obtienen de
                                                                        D_TipoDocumentoAtributo
                                                                        para el tipo
                                                                        seleccionado.
  ---------------- ---------- ---------- ------------------------------ -------------------------

**Comportamiento dinámico**

· Al seleccionar el tipo de documento, la pantalla muestra los atributos
ordenados por D_TipoDocumentoAtributo.orden con etiqueta_local cuando
está poblada y con valor_por_defecto pre-cargado cuando aplica.

· Los atributos obligatorios se muestran con asterisco y bloquean el
guardado. Los opcionales no.

· Atributos de tipo catálogo presentan dropdown con los valores activos
del catálogo asociado. Valores desactivados no aparecen pero documentos
históricos que los usan los conservan.

· Validación EAV polimórfica tipada (RN-32): el sistema verifica que la
columna de valor poblada corresponda al tipo_dato del atributo.
Inconsistencias se rechazan en tiempo de guardado.

· La ejecutiva no ve link record alguno hacia solicitudes ni tasaciones.
El dominio es completamente autónomo.

**Automatizaciones y transición de estado**

  ----------------------- ----------------------- ------------------------------------
  **Acción de UI**        **Transición**          **Automatización**

  Guardar documento nuevo ∅                       AT-D04 verifica obligatoriedad de
                                                  atributos y construye las N filas en
                                                  D_DocumentoValorAtributo.

  Subir archivo           ∅                       Airtable Attachment → conector
                                                  Dropbox sube a
                                                  /VProperty/DocumentosParametricos/ y
                                                  guarda URL + hash en D_Documento.

  Marcar como vencido     ∅                       AT-D05 calcula estado por
                                                  fecha_emision + vigencia_dias del
                                                  tipo; marca documentos vencidos
                                                  diariamente sin borrarlos.
  ----------------------- ----------------------- ------------------------------------

**8. Blueprints operacionales (flujos extremo a extremo)**

Ocho blueprints describen los flujos de trabajo del sistema extremo a
extremo. Cada uno muestra responsables, decisiones, automatizaciones,
estados y puntos de auditoría. Son la representación visual
implementable de los workflows definidos en la arquitectura; no
introducen lógica nueva. Las interfaces se referencian por su código
IF-XX (catálogo de sección 2); las automatizaciones por AT01--AT10
(Airtable Scripts) y SC01, SC05, SC06, SC07, SC09, SC13, SC15, SC16,
SC19 (Make).

**8.1 Flujo de solicitudes (recepción → arranque)**

Cómo entra una solicitud y arranca la máquina de estados, sea por canal
externo (app Next.js · IF-01) o interno (consola Next.js · IF-02).

ENTRADA EXTERNA ENTRADA INTERNA

┌───────────────┐ ┌────────────────────┐

│ IF-01 Next.js │ │ IF-02 Consola Next │

└──────┬────────┘ └─────────┬──────────┘

│ webhook SC01 │ AT01 (interna)

▼ ▼

┌──────────────────────────────────────────────────────────────┐

│ TX_Solicitudes ← estado = CREADA (+ A_Eventos) │

└───────────────────────────┬──────────────────────────────────┘

│ AT01 · MOTOR DE REGLAS

▼

┌──────────────────────────────────────────────────────────────┐

│ consulta C_ReglasNegocio → escribe regla_aplicada + plantilla│

│ + workflow (registra candidatas y ganadora en A_Decisiones)│

└───────────────────────────┬──────────────────────────────────┘

│ AT02 asigna tasador (zona + carga)

▼

SC05 notifica al tasador (email) estado = ASIGNADA

**8.2 Flujo de tasaciones (captura → cálculo)**

ASIGNADA

│ tasador abre link → IF-03 Next.js (PWA móvil)

▼ envía visita (fotos, medidas, docs, cuadro valoración E1)

┌─────────────────────────────┐ SC06

│ Dropbox + TX_Adjuntos │──────► estado = VISITADA

└──────────────┬───────────────┘

│ SC07 · Claude extrae SII/CBR/permisos

▼ (CAPA DE SANEAMIENTO antes de tipar)

┌─────────────────────────────┐

│ TX_DatosTasacion (+ flags) │

└──────────────┬───────────────┘

│ AT03 · MOTOR DE EJECUCIÓN DE FÓRMULAS (capa 3.5)

▼ resuelve DAG de C_Formulas (orden topológico)

┌─────────────────────────────┐ override por solicitud:

│ TX_Calculos (1 fila/fórmula │ si \*\_override no vacío,

│ con snapshot de versión) │ gana y queda en A_Cambios

└──────────────┬───────────────┘

▼ estado = CALCULADA

**8.3 Flujo de generación de documentos (Carbone)**

CALCULADA

│ SC09 · construir JSON (solicitud+cliente+propiedad+datos+

│ cálculos+fotos+comparables+tasador+visador)

▼

┌──────────────────────────────────────────────────────────────┐

│ leer plantilla activa (C_Plantillas) → descargar .docx Drbx │

│ POST api.carbone.io/render · convertTo=pdf · lang=es-cl │

└───────────────────────────┬──────────────────────────────────┘

▼ recibe PDF

┌──────────────────────────────────────────────────────────────┐

│ subir a Dropbox + TX_DocumentosGenerados (versión, hash MD5) │

│ versión anterior → es_vigente=false (nada se pierde) │

└───────────────────────────┬──────────────────────────────────┘

▼

estado = PDF_LISTO → AT05 notifica visador

**8.4 Flujo de revisiones (control de calidad)**

PDF_LISTO

│ IF-04 Mesa de revisión (datos │ PDF)

▼

┌──────── decisión del visador ──────┐

│ APROBAR DEVOLVER ESCALAR │

└────┬───────────┬──────────┬─────────┘

│ │ motivo\* │ a admin

│ ▼ │

│ estado=DEVUELTA requiere_atencion

│ AT06 → AT02 │

│ (vuelve al tasador) │

▼ │

estado=APROBADA ◄──────────────┘ (tras corrección y nueva revisión)

│

│ (si edita datos → SC09 regenera PDF vN+1)

▼

AT07 ¿requiere aprobación final?

**8.5 Flujo de aprobaciones (gate de gerencia)**

APROBADA

│ AT07 consulta la regla

▼ ¿requiere F5?

│ │

│ NO │ SÍ (\>10.000 UF · cliente nuevo · 1ª vez plantilla)

▼ ▼

SC13 estado=PENDIENTE_FINAL → IF-05 (Héctor)

directo │ decisión

├─ ENVIAR → SC13

└─ DEVOLVER → estado=DEVUELTA (vuelve a asignada)

▼

estado=ENTREGADA

**8.6 Flujo de automatizaciones (patrón canónico Make)**

Todos los escenarios Make siguen la misma forma: consultar
configuración, ejecutar, registrar. Make nunca decide negocio. Ningún
escenario tiene un IF sobre cliente o tipo de informe.

TRIGGER (webhook · scheduler · watch)

│

▼ 1. LOG INICIAL → A_Eventos (paso_iniciado)

▼ 2. IDEMPOTENCIA → ¿ya ejecutado? sí ⇒ skip + log

▼ 3. CARGAR CONTEXTO (TX\_ + relacionadas)

▼ 4. CONSULTAR CONFIG (C_Workflows/Formulas/Plantillas/Notif)

▼ 5. EJECUTAR ACCIÓN (Claude · Carbone · Gmail · \...)

▼ 6. PERSISTIR RESULTADO (TX_Calculos/Documentos/Notif)

▼ 7. LOG FINAL → A_Eventos (paso_completado + duración)

└─ 8. (rama paralela) ERROR → A_ErroresMake → reintento → escala

**8.7 Flujo de excepciones (fail-safe, never silent)**

Toda excepción tiene destino y, si es crítica, un humano que la verá. El
estado \"requiere_atencion\" saca la solicitud del flujo automático
hasta intervención humana.

ERROR DETECTADO en SCxx

│

▼ A_ErroresMake (mensaje, módulo, severidad)

│

├─ Timeout HTTP ─ 3 reintentos 30s/2m/5m ─ notif admin

├─ Rate limit ─ 5 reintentos backoff exp ─ no escala

├─ Webhook caído ─ ∞ cada 1 min ─ Z_ColaPendientes

├─ Validación de datos ─ 0 ─ estado=REQUIERE_ATENCION

├─ Plantilla/fórmula no encontrada ─ 0 ─ CRITICAL ─ notif INMEDIATA

└─ Cuota Make ─ 0 ─ Z_ColaPendientes ─ notif urgente

│

▼ Catch-all: errores no manejados → A_ErroresMake. AT09 reintenta;

si critical, alerta admin vía SC13.

**8.8 Flujo de auditoría (capa transversal)**

La auditoría no es un paso: es una capa transversal que captura cada
acción en todo momento.

┌──────────────────── CADA SOLICITUD ──────────────────────┐

│ │

│ A_Eventos ◄── toda acción (humana/sistema/IA) deja fila │

│ A_DecisionesMotor ◄── cada decisión motor + descartadas │

│ A_Cambios ◄── todo cambio de config/estado │

│ A_ErroresMake ◄── todo fallo de Make con reintentos │

│ A_Accesos ◄── quién vio/editó qué, IP, navegador │

│ TX_DocumentosGenerados ◄── toda versión de PDF con hash │

│ TX_Notificaciones ◄── todo email enviado con estado │

│ │

└──── IF-12 Expediente + IF-13 Auditoría reconstruyen ─────┘

el \"¿qué pasó y por qué?\" en minutos

+-----------------------------------------------------------------------+
| **Síntesis de los blueprints operacionales**                          |
|                                                                       |
| El número de pasos no cambia con un cliente nuevo, una plantilla      |
| nueva o una fórmula nueva. Lo único que cambia son las filas que el   |
| motor de reglas consulta. Esa es la prueba de que la capa de          |
| presentación y la de orquestación están correctamente desacopladas de |
| la lógica de negocio.                                                 |
+-----------------------------------------------------------------------+

**9. Matriz formularios vs base de datos**

Trazabilidad completa entre cada formulario/interfaz y la capa de datos:
qué tablas escribe o lee, qué automatizaciones dispara, en qué workflow
participa y qué reglas de negocio aplican. Esta matriz garantiza que
ningún campo de la UI carece de origen en la capa de datos.

  -----------------------------------------------------------------------------------------------------------
  **IF /    **Tablas Airtable**               **Automatización**   **Workflow / etapa** **Reglas de negocio**
  Form**                                                                                
  --------- --------------------------------- -------------------- -------------------- ---------------------
  IF-01 /   TX_Solicitudes (W) · TX_Adjuntos  SC01 → AT01 + AT02   Recepción → creada   Filtro de productos;
  F1        (W) · M_Clientes/Comunas (R)                                                validación
                                                                                        RUT/email/dirección
                                                                                        (RN-15).

  IF-02 /   TX_Solicitudes (W) ·              AT01 · AT02 · SC05   Recepción → asignada Bloqueos por estado;
  F2        M_Tasadores/Visadores (R) ·                                                 asignación por
            A_Eventos (W)                                                               zona+carga (RN-09).

  IF-03 /   TX_DatosTasacion (W) ·            SC06 · SC07 · AT03 · Captura →            Cuadre m² (RB-21/42);
  F3        TX_Adjuntos (W) ·                 AT04                 visitada/calculada   flags ítem
            TX_ItemsCuadroValoracion (W) ·                                              (RB-4/35/39); terraza
            v2.3 hijas (W)                                                              0.5 (RB-38); CBR
                                                                                        mínimo (RN-14).

  IF-04 /   TX_Solicitudes (W) ·              AT06 · SC09 (re) ·   Revisión →           Abrir PDF para
  F4        TX_DatosTasacion (W) ·            AT05                 aprobada/devuelta    aprobar (RN-18);
            TX_Comparables (W) · A_Accesos                                              motivo obligatorio al
            (W)                                                                         devolver (RN-19).

  IF-05 /   TX_Solicitudes (W) · A_Eventos    AT07 · SC13          Aprobación →         Requiere F5 si
  F5        (W)                                                    entregada            \>10.000 UF / cliente
                                                                                        nuevo / 1ª plantilla
                                                                                        (RN-26).

  IF-08 /   C_ReglasNegocio (W) ·             consumida por AT01   Configuración        Una wildcard activa
  F8        C_Plantillas/Formulas/Workflows                                             (RN-23); integridad
            (R) · A_Cambios (W)                                                         referencial; test
                                                                                        seco obligatorio
                                                                                        (RN-22).

  IF-09 /   C_Plantillas (W) ·                consumida por SC09   Configuración        Combinación activa
  F7        H_PlantillasAnteriores (W) ·                                                única (RN-24);
            Dropbox                                                                     validación de
                                                                                        variables esperadas.

  IF-10     C_Formulas (W) ·                  consumida por AT03   Configuración        DAG sin ciclos
            H_FormulasAnteriores (W) ·                                                  (RN-25); snapshot por
            TX_Calculos (R)                                                             cálculo.

  IF-11 /   M_Clientes (W) · C_SLA (W) ·      ---                  Configuración        RUT único; SLA 1--30;
  F6        C_VariablesCliente (W) ·                                                    tasa_cap_rate por
            A_Cambios (W)                                                               cliente.

  IF-12     A_Eventos · A_DecisionesMotor ·   ---                  Transversal          Filtro por permiso;
            TX\_\* (R) · A_Accesos (W)                                                  reproducción
                                                                                        documental.

  IF-13     A_Eventos · A_Accesos · A_Cambios AT09 + AT10 (purga)  Transversal          Retención por tabla
            · A_DecisionesMotor (R)           · SC16                                    (RN-29); append-only.
  -----------------------------------------------------------------------------------------------------------

*Convención: (W) escribe · (R) lee.*

**10. Dashboards operacionales**

El sistema se auto-monitorea desde Airtable. Esta sección define los
dashboards y las vistas que los alimentan, con KPIs, widgets, filtros y
alertas. Se construyen sobre vistas filtradas de las tablas existentes;
no requieren datos nuevos.

**10.1 KPIs oficiales del sistema**

  -------------------------------------------------------------------------------
  **KPI**               **Meta**           **Cómo se mide**   **Fuente**
  --------------------- ------------------ ------------------ -------------------
  Tiempo solicitud →    \< 48 h en el 80%  fecha_entrega −    TX_Solicitudes
  entrega               de los casos       fecha_solicitud    
                                           (rollup)           

  Tasa de devolución    \< 10%             COUNT(devuelta) /  TX_Solicitudes
  del visador                              COUNT(total) en 30 
                                           d                  

  Cero \"no llegó el    0 reclamos / mes   Cada envío con     TX_Notificaciones
  email\"                                  estado_envio       

  Tiempo de \"agregar   \< 1 hora          Cronometrado;      A_Cambios
  cliente nuevo\"                          reportable         

  Disponibilidad del    \> 99.5%           ejecuciones ok /   Z_EjecucionesMake
  sistema                                  total mensual      
  -------------------------------------------------------------------------------

**10.2 Dashboards y vistas que los alimentan**

  -----------------------------------------------------------------------------------
  **Dashboard**      **Widgets / KPIs**   **Filtros**          **Vista origen /
                                                               alerta**
  ------------------ -------------------- -------------------- ----------------------
  Seguimiento de     Kanban por estado ·  Cliente · tasador ·  TX_Solicitudes (estado
  tasaciones         conteo por etapa ·   rango fecha          ≠ cerrada)
                     tiempo medio                              

  Control de estados Distribución por     Estado · responsable TX_Solicitudes +
                     estado ·                                  A_Eventos
                     transiciones del día                      

  Control de SLA     Semáforo · timeline  sla_estado           Vista \"SLA en
                     · % en meta          (verde/ámbar/rojo)   riesgo\"

  Monitoreo de       Errores CRITICAL ·   Severidad · estado · A_ErroresMake
  errores            tasa de fallo por    escenario            (critical/pendiente)
                     escenario                                 

  Productividad      Casos/tasador ·      Tasador · zona       M_Tasadores (rollups)
                     casos 30 d · carga                        

  Workflows activos  Pendientes por paso  Paso ·               Z_ColaPendientes
                     · cola asíncrona     esperando_evento     

  Pendientes         PDF sin entregar     Antigüedad ·         Vistas múltiples
  críticos           \>24 h · sin asignar prioridad            
                     · conflictos                              

  Auditoría          Accesos fuera de     Usuario · tabla ·    A_Accesos · A_Cambios
  operacional        permiso · cambios    fecha                
                     sensibles                                 
  -----------------------------------------------------------------------------------

**10.3 Blueprint del dashboard de control SLA**

┌──────────────── CONTROL DE SLA ────────────────────────────────────┐

│ En meta (\<48h): ████████░░ 82% Objetivo ≥80% ✅ │

│ ┌─ SEMÁFORO ─────────┐ ┌─ VENCIMIENTOS (timeline) ─────────────┐ │

│ │ 🟢 Verde 14 │ │ hoy ▸ VP-0519 🔴 │ │

│ │ 🟡 Ámbar 3 │ │ +1d ▸ VP-0521 🟡 │ │

│ │ 🔴 Rojo 1 │ │ +3d ▸ VP-0524 🟢 │ │

│ └────────────────────┘ └───────────────────────────────────────┘ │

│ Por cliente: MetLife 96% · Security 78%🟡 · BCI 100% │

│ \[ abrir vista \"SLA en riesgo\" \] \[ exportar reporte semanal \] │

└────────────────────────────────────────────────────────────────────┘

**11. Alertas automáticas y auto-monitoreo**

La política es fail-safe, never silent: toda condición anómala produce
una alerta visible y, si es crítica, notifica a un humano. Esta sección
cataloga las alertas automáticas del sistema y las vistas de
auto-monitoreo.

**11.1 Alertas automáticas (AT08 + SC13)**

  ----------------------------------------------------------------------------------
  **Disparador**       **Frecuencia**   **Destinatario**         **Contenido**
  -------------------- ---------------- ------------------------ -------------------
  Error CRITICAL sin   Cada hora        Administrador (email)    Plantilla/fórmula
  resolver                                                       no encontrada,
                                                                 cuota Make, etc.

  SC09 falla 3 veces   Tiempo real      Administrador (email)    Alerta inmediata:
  seguidas                                                       generación
                                                                 documental en
                                                                 riesgo.

  SLA en amarillo o    Diario 8 AM      Según                    Solicitudes que
  rojo                 (AT08)           C_NotificacionesConfig   entran en riesgo de
                                                                 SLA.

  Resumen del día      Diario 8 AM      Administrador            Nuevas, entregadas,
  anterior                                                       en SLA rojo.

  Reporte semanal      Lunes            Administrador            Tiempo medio, tasa
                                                                 de devolución,
                                                                 escenarios con más
                                                                 fallos.
  ----------------------------------------------------------------------------------

**11.2 Vistas de auto-monitoreo (Airtable)**

- **\"Errores recientes\" (A_ErroresMake):** severidad=critical o
  estado=pendiente, orden por timestamp desc.

- **\"SLA en riesgo\" (TX_Solicitudes):** sla_estado = amarillo o rojo,
  orden por días desde visita.

- **\"Reglas en conflicto\" (A_DecisionesMotor):** decisiones con más de
  una regla candidata de igual especificidad.

- **\"Documentos sin entregar\" (TX_Solicitudes):** estado = pdf_listo
  por más de 24 h.

- **\"Escenarios con tasa de fallo \> 5%\" (Z_EscenariosMake):** para
  priorizar optimización.

**12. Construcción en Airtable Interfaces (Tipo B)**

Guía concreta de construcción para las nueve interfaces Tipo B: qué tipo
de página crear, qué componentes usar, qué vistas y filtros aplicar, qué
permisos asignar y qué limitaciones de la plataforma considerar.

**12.1 Qué construir por interfaz (Tipo B)**

  ------------------------------------------------------------------------------
  **Interfaz**     **Tipo de       **Componentes clave**     **Permiso**
                   página                                    
                   Interfaces**                              
  ---------------- --------------- ------------------------- -------------------
  IF-05 Aprobación Record review   Summary + Timeline +      Comentador/Editor
  final                            Button                    (gerencia)

  IF-06 Centro     Dashboard       Number, Chart, Kanban     Lectura amplia
  operacional                      (group by estado),        
                                   Timeline (SLA)            

  IF-07 Salud Make Dashboard       Number (tasa éxito), Grid Admin / Operador
                                   filtrado, Kanban          
                                   (errores)                 

  IF-08 Reglas     Record review   Multi-select chips,       Editor
                                   Linked records, Button    (parametrizador)
                                   (test seco)               

  IF-09 Plantillas List + Record   List + Record review ·    Editor (admin)
                   review          attachment preview ·      
                                   button                    

  IF-10 Fórmulas / Dashboard +     Grid ordenado por         Editor
  DAG              Grid            orden_topologico,         (parametrizador)
                                   Timeline por grupo        

  IF-11 Clientes   List + Record   Búsqueda + tarjeta        Editor (admin)
                   review          editable + botón Clonar   

  IF-12 Expediente Record review   Record detail por         Lectura por permiso
                   (tabs)          sección + Linked lists    

  IF-13 Auditoría  Grid pages      Grid filtrable por tabla  Solo lectura
                                   A\_\*, Filtros guardados  (auditor)
  ------------------------------------------------------------------------------

**12.2 Limitaciones de Airtable a considerar**

  -----------------------------------------------------------------------
  **Limitación**      **Implicación de diseño** **Mitigación**
  ------------------- ------------------------- -------------------------
  Tope de registros   TX_Solicitudes y          Archivado a H\_\* (AT10);
  por base (50K/100K) A_Eventos crecen rápido   purga de auditoría por
                                                retención (AT09 + SC16).

  Colaboradores       No todos pueden ser       Tasador, solicitante,
  limitados (5 / 25)  editores Airtable         ejecutiva y visador por
                                                la app Next.js + Clerk;
                                                auditor en solo lectura.

  Adjuntos pesados    Fotos y PDFs no deben     Archivos en Dropbox;
                      vivir en Airtable         Airtable solo guarda el
                                                índice (TX_Adjuntos).

  Sin lógica de       La UI no debe condicionar Toda condición deriva de
  negocio en la UI    por reglas propias        datos/estado; el motor
                                                decide.

  Rendimiento de      Grids con muchos          Vistas filtradas y
  vistas grandes      registros se ralentizan   agrupadas; evitar
                                                histórico en operación.
  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **Regla de oro para Airtable Interfaces**                             |
|                                                                       |
| Una página de Interfaces es presentación pura. Si para construir una  |
| pantalla necesitas un IF sobre cliente o tipo de informe, está mal:   |
| ese dato debe venir resuelto desde Airtable (motor de reglas o campo  |
| lookup). La pantalla solo muestra y captura.                          |
+-----------------------------------------------------------------------+

**13. Secuencia de implementación y cierre**

**13.1 Inventario de lo entregado**

  --------------------------------------------------------------------------
  **Entregable**      **Contenido**                            **Sección**
  ------------------- ---------------------------------------- -------------
  Marco general       Tipos A/B/C · dominios · usuarios.       §0

  Matriz rol vs       Matriz consolidada de 10 roles × 13 IFs  §1
  interfaz            · acciones · restricciones.              

  Catálogo de         13 interfaces con tipo A/B, propósito,   §2
  interfaces          entradas, acciones, salidas y estado     
                      destino.                                 

  Navegación entre    Mapa por rol · hub workspace · patrones  §3
  interfaces          cola→detalle y tarjeta→expediente.       

  Jerarquía visual y  Paleta corporativa VProperty (azul       §4
  color               #075899 · naranja #F5A213) · semáforo    
                      operacional.                             

  Patrones de UI      5 patrones (P1 Lista · P2 Lista+Detalle  §5
  repetidos           · P3 Formulario · P4 Dashboard · P5      
                      Expediente).                             

  Reglas de           Catálogo de validaciones bloqueantes ·   §6
  validación          advertencias · mensajes humanos.         

  Fichas detalladas   13 fichas con diseño visual, campos,     §7
  por IF              comportamiento, automatizaciones.        

  Blueprints          8 flujos extremo a extremo (recepción,   §8
  operacionales       captura, generación, revisión, etc.).    

  Matriz formularios  Tablas, automatizaciones, workflow y     §9
  vs BD               reglas por interfaz.                     

  Dashboards          5 KPIs oficiales · 8 dashboards · vistas §10
  operacionales       que los alimentan.                       

  Alertas y           Alertas automáticas · vistas de          §11
  auto-monitoreo      auto-monitoreo.                          

  Construcción        Componentes, permisos y limitaciones     §12
  Airtable Interfaces para las 9 interfaces Tipo B.            
  --------------------------------------------------------------------------

**13.2 Secuencia recomendada de construcción Tipo A (Next.js)**

La construcción de las cuatro interfaces Tipo A se acopla al roadmap de
la arquitectura. CU-000 (componentes compartidos · v0.dev) se construye
primero como calibración; luego cada IF se construye en una sesión de
Claude Code independiente con su prompt curado.

  ----------------------------------------------------------------------------
  **Fase**   **Sesión Claude Code** **Entregable**            **Valor**
  ---------- ---------------------- ------------------------- ----------------
  0          CU-000 · Componentes   Sistema de diseño         Base
             compartidos            VProperty (tokens,        reutilizable
                                    botones, inputs, badges,  para los 4 IF
                                    layouts) en shadcn/ui +   Tipo A.
                                    Tailwind.                 

  1          IF-01 · Formulario     Pantalla pública con      Las solicitudes
             externo                validación de RUT, email, llegan
                                    dirección · webhook SC01  estructuradas.
                                    funcional.                

  2          IF-02 · Consola        Lista + detalle con       La cartera viva
             ejecutiva              bloqueos por estado y     queda en una
                                    selector inteligente de   sola pantalla.
                                    tasador.                  

  3          IF-03 · App tasador    Multi-sección con         Captura en
             PWA                    autosave, subforms        terreno
                                    E1+E3+E4+E5+E6,           completa.
                                    compresión de fotos.      

  4          IF-04 · Mesa visador   Dos paneles con visor de  Control de
                                    PDF embebido y atajos de  calidad humano
                                    teclado.                  antes del
                                                              cliente.
  ----------------------------------------------------------------------------

**13.3 Secuencia recomendada de construcción Tipo B (Airtable)**

  -----------------------------------------------------------------------
  **Fase**         **Interfaces a configurar**  **Valor entregado**
  ---------------- ---------------------------- -------------------------
  B1 ·             IF-11 (clientes) · IF-09     El motor tiene clientes y
  Configuración    (plantillas)                 plantillas para resolver.
  base                                          

  B2 · Motor de    IF-08 (reglas) · IF-10       AT01 y AT03 tienen datos
  reglas           (fórmulas/DAG)               para operar.

  B3 · Operación   IF-06 (centro operacional) · Auto-monitoreo del
                   IF-07 (salud Make)           sistema en vivo.

  B4 ·             IF-05 (aprobación final)     Gate de gerencia para
  Aprobaciones                                  casos sensibles.

  B5 · Auditoría   IF-12 (expediente) · IF-13   Trazabilidad total y
                   (auditoría)                  compliance.
  -----------------------------------------------------------------------

**13.4 Cómo evolucionan los IF en el tiempo**

- **Cambios en IF Tipo A (Next.js):** cualquier cambio se construye por
  Claude Code con prompt curado al IF afectado. El sistema de diseño
  compartido (CU-000) garantiza que un cambio de paleta o de patrón se
  propaga al activar el nuevo token, sin reescribir cada IF.

- **Cambios en IF Tipo B (Airtable):** cambios de página, vista, filtro
  o permiso se hacen directamente en Airtable Interfaces sin código.
  Cambios en el comportamiento del motor se hacen en C_ReglasNegocio o
  C_Formulas, no en la página de Interfaces.

- **Cambios en el código de color:** la paleta corporativa VProperty
  queda como tokens en el sistema de diseño y como mapeo a colores
  Airtable. Una actualización futura del logo o de la identidad solo
  requiere editar el archivo de tokens.

- **Cambios en mensajes humanos:** el catálogo de mensajes (sección 6)
  es la fuente única de verdad. Modificar un texto exige actualizar
  prompts de Claude Code, tests de aceptación y documentación de usuario
  simultáneamente.

+-----------------------------------------------------------------------+
| **Cierre**                                                            |
|                                                                       |
| Este Blueprint v2.6 traduce la arquitectura enterprise de VProperty a |
| una capa de presentación operacional implementable, alineada al       |
| framework de tres tipos de unidad construible (A · B · C) y a la      |
| paleta corporativa oficial. Cada pantalla mapea a entidades, estados  |
| y reglas reales del modelo de datos; cada acción respeta el principio |
| \"configuración antes que código\"; cada decisión queda auditada. El  |
| resultado es un sistema operacional listo para construirse: cuatro    |
| IFs en Next.js + Clerk + Railway (Tipo A · Claude Code) y nueve IFs   |
| en Airtable Interfaces (Tipo B · configuración directa).              |
+-----------------------------------------------------------------------+

*--- Fin del documento ---*
